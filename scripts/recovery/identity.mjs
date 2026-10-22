/**
 * Fail-closed source/target identity guard for IMP-037 recovery.
 * This tranche does not restore. There is no --force-production override.
 *
 * CS3: source classification must be explicit — never silently defaulted to production
 * and never inferred from compose project / free-form operator labels alone.
 */
import path from "node:path";
import { DEFAULT_KNOWN_PRODUCTION_PGDATA_PATHS, ENVIRONMENT_CLASSIFICATION } from "./constants.mjs";

const ALLOWED_TARGET_CLASSIFICATIONS = new Set([ENVIRONMENT_CLASSIFICATION.RECOVERY]);
const KNOWN_CLASSIFICATIONS = new Set(Object.values(ENVIRONMENT_CLASSIFICATION));
/** Source provenance classifications that may be recorded without inventing new taxonomy. */
const ALLOWED_SOURCE_CLASSIFICATIONS = new Set([
  ENVIRONMENT_CLASSIFICATION.PRODUCTION,
  ENVIRONMENT_CLASSIFICATION.STAGING,
]);

/**
 * @typedef {object} IdentitySafetyInput
 * @property {string | null | undefined} sourceIdentity
 * @property {string | null | undefined} targetIdentity
 * @property {string | null | undefined} sourceClassification
 * @property {string | null | undefined} targetClassification
 * @property {string | null | undefined} [targetPgdataPath]
 * @property {string[]} [knownProductionPgdataPaths]
 */

/**
 * @param {IdentitySafetyInput} input
 * @returns {{ allowed: true } | { allowed: false, reason: string, code: string }}
 */
/**
 * Require an explicit, known source classification. Fail closed on missing/invalid values.
 * Does not infer staging from compose project names or free-form labels.
 *
 * @param {unknown} value
 * @param {{ composeProjectName?: unknown, claimedRuntimeEnv?: unknown }} [context]
 * @returns {{ ok: true, classification: string } | { ok: false, reason: string, code: string }}
 */
export function requireExplicitSourceClassification(value, context = {}) {
  if (value == null || (typeof value === "string" && value.trim() === "")) {
    return {
      ok: false,
      code: "SOURCE_CLASSIFICATION_REQUIRED",
      reason:
        "explicit --source-class (or sourceClassification) is required; silent production default is forbidden",
    };
  }
  if (typeof value !== "string") {
    return {
      ok: false,
      code: "SOURCE_CLASSIFICATION_INVALID",
      reason: "source classification must be a string",
    };
  }
  const normalized = normalizeClassification(value);
  if (normalized === "ambiguous") {
    return {
      ok: false,
      code: "CLASSIFICATION_AMBIGUOUS",
      reason: "Environment classification is ambiguous",
    };
  }
  if (!normalized || !ALLOWED_SOURCE_CLASSIFICATIONS.has(normalized)) {
    return {
      ok: false,
      code: "SOURCE_CLASSIFICATION_INVALID",
      reason:
        "source classification must be an explicit known value (production|staging); free-form labels are insufficient",
    };
  }

  // Refuse silent compose-project inference: if an operator only supplies a project name
  // context without an explicit class, callers must not invent staging/production.
  // When both are present and obviously contradictory with a free-form claim, fail closed.
  const composeProject =
    typeof context.composeProjectName === "string" ? context.composeProjectName.trim().toLowerCase() : "";
  const runtimeEnv =
    typeof context.claimedRuntimeEnv === "string" ? context.claimedRuntimeEnv.trim().toLowerCase() : "";
  if (composeProject && runtimeEnv && composeProject.includes("staging") && runtimeEnv === "production") {
    return {
      ok: false,
      code: "SOURCE_CLASSIFICATION_CONTRADICTION",
      reason:
        "contradictory source markers: compose project suggests staging while claimed runtime env is production; refuse silent reconciliation",
    };
  }
  if (normalized === ENVIRONMENT_CLASSIFICATION.PRODUCTION && composeProject.includes("staging") && runtimeEnv === "local") {
    // Distinct authorities (compose project / BOBA_BEAR_ENV / DB) must not be collapsed into
    // production evidence without an explicit Founder taxonomy decision. Fail closed here.
    return {
      ok: false,
      code: "SOURCE_CLASSIFICATION_CONTRADICTION",
      reason:
        "production source-class contradicts staging compose project + local runtime markers; do not invent provenance reconciliation",
    };
  }

  return { ok: true, classification: normalized };
}

export function evaluateTargetIdentitySafety(input) {
  const sourceIdentity = normalizeIdentity(input.sourceIdentity);
  const targetIdentity = normalizeIdentity(input.targetIdentity);
  const requiredSource = requireExplicitSourceClassification(input.sourceClassification, {
    composeProjectName: input.composeProjectName,
    claimedRuntimeEnv: input.claimedRuntimeEnv,
  });
  const sourceClassification = requiredSource.ok ? requiredSource.classification : "";
  const targetClassification = normalizeClassification(input.targetClassification);

  if (!targetIdentity) {
    return deny("TARGET_IDENTITY_MISSING", "Target identity is missing");
  }
  if (!sourceIdentity) {
    return deny("SOURCE_IDENTITY_MISSING", "Source identity is missing");
  }
  if (sourceIdentity === targetIdentity) {
    return deny("SOURCE_EQUALS_TARGET", "Target identity equals source identity");
  }

  if (!requiredSource.ok) {
    return deny(requiredSource.code, requiredSource.reason);
  }
  if (targetClassification === "ambiguous") {
    return deny("CLASSIFICATION_AMBIGUOUS", "Environment classification is ambiguous");
  }
  if (!targetClassification || !KNOWN_CLASSIFICATIONS.has(targetClassification)) {
    return deny("TARGET_CLASSIFICATION_UNRESOLVED", "Target environment classification is missing or unresolved");
  }
  if (!ALLOWED_TARGET_CLASSIFICATIONS.has(targetClassification)) {
    return deny(
      "PRODUCTION_OR_AUTHORITATIVE_TARGET",
      "Recovery target must be a fresh isolated recovery environment; production/authoritative targets are forbidden",
    );
  }

  const productionPaths = (input.knownProductionPgdataPaths ?? DEFAULT_KNOWN_PRODUCTION_PGDATA_PATHS).map(
    canonicalizePath,
  );
  const targetPgdata = canonicalizePath(input.targetPgdataPath);
  if (targetPgdata && productionPaths.some((known) => isProductionPgdataPath(targetPgdata, known))) {
    return deny("PRODUCTION_PGDATA_FORBIDDEN", "Known production PGDATA identity/path is forbidden as a recovery target");
  }

  return { allowed: true };
}

function deny(code, reason) {
  return { allowed: false, code, reason };
}

function normalizeIdentity(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

function normalizeClassification(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "ambiguous" || trimmed === "unknown" || trimmed === "unresolved") return trimmed === "ambiguous" ? "ambiguous" : "";
  return trimmed;
}

/**
 * Resolve `.` / `..` and trailing slashes without requiring the path to exist.
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalizePath(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().replace(/\\/g, "/");
  if (!trimmed) return "";
  return path.posix.normalize(trimmed).replace(/\/+$/, "").toLowerCase() || "/";
}

function isProductionPgdataPath(candidate, knownProduction) {
  if (!candidate || !knownProduction) return false;
  return candidate === knownProduction || candidate.startsWith(`${knownProduction}/`);
}
