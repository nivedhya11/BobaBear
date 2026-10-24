/**
 * Founder staging preflight — S1..S8 typed evidence binders.
 *
 * Binders translate independently observed, read-only facts (probe output or
 * recorded artifacts) into the evidence shape consumed by the authoritative
 * fail-closed engine in `staging-preflight.mjs`. They never replace that
 * engine: `evaluateStagingDeployPreflight` remains the only deployment
 * authority. A binder may only ever make evidence *more* restrictive than
 * the raw observation (BLOCKED / UNKNOWN); it never upgrades missing,
 * stale, tampered, conflicting or misbound evidence into PASS-shaped fields.
 *
 * Provenance is carried on every observation. Synthetic / fixture
 * observations may drive the engine to PASS in isolated tests, but
 * `decideBoundStagingPreflight` reports `STAGING_PREFLIGHT_PASS =
 * NOT_ESTABLISHED` unless every section is live-probed or a recorded
 * artifact with a timestamp, so a mocked PASS cannot be promoted to genuine
 * staging readiness.
 *
 * Pure module: no process, container, git, network, or filesystem access.
 * Probes live in `staging-evidence-probes.mjs`.
 *
 * Binder inventory:
 *   S1 Source         canonical GitHub identity, alias normalisation, exact main SHA/tree, clean isolated checkout
 *   S2 Publishing     publishing-path classification; hosting vs publishing operation; unresolved policy -> BLOCKED
 *   S3 Configuration  secret-safe loadConfig projection under strict staging rules; Local UAT is not staging (D-385)
 *   S4 Database       committed migration journal <-> applied ledger <-> baseline classification; unreachable -> UNKNOWN
 *   S5 Recovery       staging-bound qualifying checkpoint + integrity + isolated restore proof + freshness
 *   S6 Security       exact source SHA <-> image ID <-> Trivy report; expired exception never PASS
 *   S7 Capacity       AD-PF-02 (D-386) floors AND measured headroom; preservation of images / PG volume
 *   S8 PostgreSQL init init-mount identity from exact git tree vs working tree vs active mount; never replaces data
 */
import { ENVIRONMENT_CLASSIFICATION, CHECKSUM_INTEGRITY_STATUS, LAYER_2_MAX_AGE_MS_DEFAULT, OPERATION_STATUS, OPERATION_TYPE, PROOF_CODE } from "../recovery/constants.mjs";
import { evaluateQualifyingRecoveryProof, validateEvidence } from "../recovery/evidence.mjs";
import { evaluateRecoveryPointFreshness } from "../recovery/freshness.mjs";
import { interpretTrivyJson } from "../run-trivy.mjs";
import { POSTGRES_INIT_DISPOSITION, POSTGRES_INIT_REASON } from "./postgres-init-identity.mjs";
import { STAGING_BASELINE_STATES } from "./staging-baseline.mjs";
import {
  EXPECTED_REPOSITORY_IDENTITY,
  PREFLIGHT_OUTCOME,
  evaluateStagingDeployPreflight,
} from "./staging-preflight.mjs";

export const BINDER_ID = Object.freeze({
  S1_SOURCE: "S1_SOURCE",
  S2_PUBLISHING: "S2_PUBLISHING",
  S3_CONFIGURATION: "S3_CONFIGURATION",
  S4_DATABASE: "S4_DATABASE",
  S5_RECOVERY: "S5_RECOVERY",
  S6_SECURITY: "S6_SECURITY",
  S7_CAPACITY: "S7_CAPACITY",
  S8_POSTGRES_INIT: "S8_POSTGRES_INIT",
});

/** Binder-level outcome. BOUND = positive evidence bound; never itself authorization. */
export const BINDER_OUTCOME = Object.freeze({
  BOUND: "BOUND",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
});

/**
 * Provenance kinds. Only LIVE_PROBE and RECORDED_ARTIFACT (with observedAt)
 * can contribute to genuine readiness. SYNTHETIC is for isolated tests only.
 */
export const EVIDENCE_PROVENANCE = Object.freeze({
  LIVE_PROBE: "LIVE_PROBE",
  RECORDED_ARTIFACT: "RECORDED_ARTIFACT",
  SYNTHETIC: "SYNTHETIC",
  MISSING: "MISSING",
});

export const BINDER_REASON = Object.freeze({
  OBSERVATION_MISSING: "OBSERVATION_MISSING",
  OBSERVATION_MALFORMED: "OBSERVATION_MALFORMED",
  PROVENANCE_MISSING: "PROVENANCE_MISSING",
  PROVENANCE_SYNTHETIC: "PROVENANCE_SYNTHETIC",
  // S1
  SOURCE_REPOSITORY_ALIAS_NORMALIZED: "SOURCE_REPOSITORY_ALIAS_NORMALIZED",
  SOURCE_REPOSITORY_NOT_CANONICAL: "SOURCE_REPOSITORY_NOT_CANONICAL",
  SOURCE_REMOTE_MAIN_UNVERIFIED: "SOURCE_REMOTE_MAIN_UNVERIFIED",
  SOURCE_REMOTE_MAIN_DRIFT: "SOURCE_REMOTE_MAIN_DRIFT",
  SOURCE_CHECKOUT_PROTECTED: "SOURCE_CHECKOUT_PROTECTED",
  SOURCE_NOT_EXACT_MAIN: "SOURCE_NOT_EXACT_MAIN",
  SOURCE_TRACKED_DIRTY: "SOURCE_TRACKED_DIRTY",
  // S2
  PUBLISHING_POLICY_NOT_LOCKED: "PUBLISHING_POLICY_NOT_LOCKED",
  PUBLISHING_ACTIVE_PATH_OBSERVED: "PUBLISHING_ACTIVE_PATH_OBSERVED",
  PUBLISHING_WORKFLOW_STATE_UNOBSERVED: "PUBLISHING_WORKFLOW_STATE_UNOBSERVED",
  PUBLISHING_HOSTING_UNOBSERVED: "PUBLISHING_HOSTING_UNOBSERVED",
  PUBLISHING_UNSAFE_ACTION_OBSERVED: "PUBLISHING_UNSAFE_ACTION_OBSERVED",
  // S3
  CONFIG_PROJECTION_MISSING: "CONFIG_PROJECTION_MISSING",
  CONFIG_PROJECTION_NOT_SECRET_SAFE: "CONFIG_PROJECTION_NOT_SECRET_SAFE",
  CONFIG_LOCAL_UAT_NOT_STRICT_STAGING: "CONFIG_LOCAL_UAT_NOT_STRICT_STAGING",
  CONFIG_NOT_STAGING_ENVIRONMENT: "CONFIG_NOT_STAGING_ENVIRONMENT",
  CONFIG_STRICT_STAGING_INVALID: "CONFIG_STRICT_STAGING_INVALID",
  CONFIG_ENVIRONMENT_DRIFT_ACROSS_SERVICES: "CONFIG_ENVIRONMENT_DRIFT_ACROSS_SERVICES",
  CONFIG_DIAGNOSTIC_ENABLED_OR_CONFLICT: "CONFIG_DIAGNOSTIC_ENABLED_OR_CONFLICT",
  // S4
  DATABASE_JOURNAL_MALFORMED: "DATABASE_JOURNAL_MALFORMED",
  DATABASE_LEDGER_UNREACHABLE: "DATABASE_LEDGER_UNREACHABLE",
  DATABASE_LEDGER_MISBOUND: "DATABASE_LEDGER_MISBOUND",
  DATABASE_LEDGER_DIVERGED: "DATABASE_LEDGER_DIVERGED",
  DATABASE_LEDGER_STALE: "DATABASE_LEDGER_STALE",
  DATABASE_BASELINE_MISSING: "DATABASE_BASELINE_MISSING",
  DATABASE_BASELINE_INCOMPATIBLE: "DATABASE_BASELINE_INCOMPATIBLE",
  DATABASE_BASELINE_CONFLICTS_WITH_LEDGER: "DATABASE_BASELINE_CONFLICTS_WITH_LEDGER",
  // S5
  RECOVERY_NO_STAGING_RECORDS: "RECOVERY_NO_STAGING_RECORDS",
  RECOVERY_RECORD_INVALID: "RECOVERY_RECORD_INVALID",
  RECOVERY_CHECKPOINT_NOT_QUALIFYING: "RECOVERY_CHECKPOINT_NOT_QUALIFYING",
  RECOVERY_CHECKPOINT_MISBOUND: "RECOVERY_CHECKPOINT_MISBOUND",
  RECOVERY_INTEGRITY_NOT_MATCHED: "RECOVERY_INTEGRITY_NOT_MATCHED",
  RECOVERY_POINT_STALE_OR_UNIDENTIFIABLE: "RECOVERY_POINT_STALE_OR_UNIDENTIFIABLE",
  RECOVERY_RESTORE_PROOF_MISSING: "RECOVERY_RESTORE_PROOF_MISSING",
  RECOVERY_RESTORE_NOT_ISOLATED: "RECOVERY_RESTORE_NOT_ISOLATED",
  RECOVERY_RESTORE_NOT_BOUND_TO_CHECKPOINT: "RECOVERY_RESTORE_NOT_BOUND_TO_CHECKPOINT",
  RECOVERY_ROLLBACK_REVISION_UNRECORDED: "RECOVERY_ROLLBACK_REVISION_UNRECORDED",
  // S6
  SECURITY_IMAGE_NOT_INSPECTED: "SECURITY_IMAGE_NOT_INSPECTED",
  SECURITY_IMAGE_REVISION_MISMATCH: "SECURITY_IMAGE_REVISION_MISMATCH",
  SECURITY_SCAN_MISSING: "SECURITY_SCAN_MISSING",
  SECURITY_SCAN_DIGEST_MISMATCH: "SECURITY_SCAN_DIGEST_MISMATCH",
  SECURITY_SCAN_MALFORMED: "SECURITY_SCAN_MALFORMED",
  SECURITY_SCAN_STALE: "SECURITY_SCAN_STALE",
  SECURITY_UNEXCEPTED_FINDING: "SECURITY_UNEXCEPTED_FINDING",
  SECURITY_EXCEPTION_EXPIRED: "SECURITY_EXCEPTION_EXPIRED",
  SECURITY_EXCEPTION_POLICY_ERROR: "SECURITY_EXCEPTION_POLICY_ERROR",
  SECURITY_RISK_WAIVED: "SECURITY_RISK_WAIVED",
  // S7
  CAPACITY_FILESYSTEM_UNMEASURED: "CAPACITY_FILESYSTEM_UNMEASURED",
  CAPACITY_BUILD_FOOTPRINT_UNMEASURED: "CAPACITY_BUILD_FOOTPRINT_UNMEASURED",
  CAPACITY_BUILD_FOOTPRINT_MISBOUND: "CAPACITY_BUILD_FOOTPRINT_MISBOUND",
  CAPACITY_DISK_BELOW_FLOOR: "CAPACITY_DISK_BELOW_FLOOR",
  CAPACITY_DISK_BELOW_HEADROOM: "CAPACITY_DISK_BELOW_HEADROOM",
  CAPACITY_MEMORY_UNMEASURED: "CAPACITY_MEMORY_UNMEASURED",
  CAPACITY_PEAK_DEMAND_UNMEASURED: "CAPACITY_PEAK_DEMAND_UNMEASURED",
  CAPACITY_MEMORY_BELOW_FLOOR: "CAPACITY_MEMORY_BELOW_FLOOR",
  CAPACITY_MEMORY_BELOW_HEADROOM: "CAPACITY_MEMORY_BELOW_HEADROOM",
  CAPACITY_MEASUREMENT_STALE: "CAPACITY_MEASUREMENT_STALE",
  CAPACITY_PRESERVATION_UNKNOWN: "CAPACITY_PRESERVATION_UNKNOWN",
  CAPACITY_PRESERVATION_VIOLATED: "CAPACITY_PRESERVATION_VIOLATED",
  // S8
  POSTGRES_INIT_DISPOSITION_MISSING: "POSTGRES_INIT_DISPOSITION_MISSING",
  POSTGRES_INIT_CANDIDATE_TREE_DRIFT: "POSTGRES_INIT_CANDIDATE_TREE_DRIFT",
  POSTGRES_INIT_DIGEST_MISBOUND: "POSTGRES_INIT_DIGEST_MISBOUND",
  POSTGRES_INIT_NOT_PRESERVABLE: "POSTGRES_INIT_NOT_PRESERVABLE",
});

/** Final gate vocabulary. ESTABLISHED requires engine PASS + genuine provenance for every section. */
export const STAGING_PREFLIGHT_PASS = Object.freeze({
  ESTABLISHED: "ESTABLISHED",
  NOT_ESTABLISHED: "NOT_ESTABLISHED",
});

/** Staging runtime identity constants mirrored from staging.mjs (read-only comparison only). */
export const EXPECTED_STAGING_COMPOSE_PROJECT = "boba-staging";
export const EXPECTED_STAGING_POSTGRES_CONTAINER = "boba-staging_postgres_1";
export const EXPECTED_STAGING_POSTGRES_VOLUME = "boba-staging_postgres-data";

/** Protected primary worktree must never be the deploy checkout (staging.mjs). */
export const PROTECTED_CHECKOUT_PATHS = Object.freeze(["/home/ajoshi/repos/boba-bear-platform"]);

/**
 * AD-PF-02 / D-386 capacity policy (coordinated dependency: PR #429). These
 * are Founder-approved thresholds, not evidence that any host passes them.
 */
export const CAPACITY_POLICY = Object.freeze({
  diskFloorBytes: 40 * 1024 ** 3,
  diskHeadroomFactor: 2,
  memoryFloorBytes: 8 * 1024 ** 3,
  memoryHeadroomFactor: 1.5,
  /** "Immediately before the operation" — availability snapshots older than this are stale. */
  snapshotMaxAgeMs: 10 * 60 * 1000,
  /** Measured footprint / peak demand of the exact SHA is a recorded artifact; bounded, not infinite. */
  measurementArtifactMaxAgeMs: 24 * 60 * 60 * 1000,
});

/** Binder freshness defaults (engineering defaults, injectable per call; never silently infinite). */
export const BINDER_FRESHNESS_DEFAULTS = Object.freeze({
  databaseEvidenceMaxAgeMs: 60 * 60 * 1000,
  recoveryCheckpointMaxAgeMs: LAYER_2_MAX_AGE_MS_DEFAULT,
  securityScanMaxAgeMs: 24 * 60 * 60 * 1000,
});

/** Required Founder staging runtime images (service -> local image tag) mirrored from staging.mjs. */
export const REQUIRED_STAGING_IMAGES = Object.freeze([
  { service: "app", image: "boba-bear-app:local", trivyTargetId: "web-runtime" },
  { service: "customer-auth", image: "boba-bear-customer-auth:local", trivyTargetId: "customer-auth-runtime" },
  { service: "workforce-auth", image: "boba-bear-workforce-auth:local", trivyTargetId: "workforce-auth-runtime" },
  { service: "customer-commerce", image: "boba-bear-customer-commerce:local", trivyTargetId: "customer-commerce-runtime" },
  { service: "operations", image: "boba-bear-operations:local", trivyTargetId: "operations-runtime" },
  { service: "postgres", image: "boba-bear-postgres:local", trivyTargetId: "postgres" },
]);

/** Services whose Compose env stack must project to valid strict-staging AppConfig. */
export const REQUIRED_CONFIG_PROJECTION_SERVICES = Object.freeze([
  "customer-auth",
  "workforce-auth",
  "customer-commerce",
  "operations",
  "migrate",
]);

/** Keys a secret-safe config projection may carry. Anything else is refused. */
const SECRET_SAFE_PROJECTION_KEYS = new Set([
  "service",
  "processKind",
  "envFiles",
  "envFilesPresent",
  "environment",
  "nodeEnvSource",
  "ok",
  "issues",
]);

const RESTORE_OPERATION_TYPES = new Set([
  OPERATION_TYPE.RESTORE_LOGICAL,
  OPERATION_TYPE.RESTORE_PITR,
  OPERATION_TYPE.PORTABILITY_REHEARSAL,
]);

/* ----------------------------------------------------------------------- */
/* Shared helpers                                                          */
/* ----------------------------------------------------------------------- */

function isFullGitSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value);
}

function isObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseInstant(value) {
  if (typeof value !== "string") return Number.NaN;
  return Date.parse(value);
}

function isFresh(observedAt, maxAgeMs, now) {
  const ts = parseInstant(observedAt);
  if (!Number.isFinite(ts)) return false;
  if (typeof maxAgeMs !== "number" || !Number.isFinite(maxAgeMs) || maxAgeMs < 0) return false;
  return now.getTime() - ts <= maxAgeMs;
}

function resolveNow(now) {
  if (now instanceof Date) return now;
  if (typeof now === "string" || typeof now === "number") {
    const d = new Date(now);
    if (Number.isFinite(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Normalise provenance. Missing provenance is MISSING, never upgraded.
 * @param {unknown} provenance
 */
export function normalizeProvenance(provenance) {
  if (!isObject(provenance)) {
    return { kind: EVIDENCE_PROVENANCE.MISSING, observedAt: null, probe: null, sources: [] };
  }
  const kind = Object.values(EVIDENCE_PROVENANCE).includes(provenance.kind)
    ? provenance.kind
    : EVIDENCE_PROVENANCE.MISSING;
  const observedAt = Number.isFinite(parseInstant(provenance.observedAt)) ? provenance.observedAt : null;
  return {
    kind,
    observedAt,
    probe: typeof provenance.probe === "string" ? provenance.probe : null,
    sources: Array.isArray(provenance.sources) ? provenance.sources.filter((s) => typeof s === "string") : [],
  };
}

/** A provenance may contribute to genuine readiness only when live/recorded and timestamped. */
export function isGenuineProvenance(provenance) {
  const p = normalizeProvenance(provenance);
  return (
    (p.kind === EVIDENCE_PROVENANCE.LIVE_PROBE || p.kind === EVIDENCE_PROVENANCE.RECORDED_ARTIFACT) &&
    p.observedAt != null
  );
}

function makeResult(binder, observation) {
  const provenance = normalizeProvenance(observation?.provenance);
  /** @type {Array<{ code: string, detail?: string }>} */
  const findings = [];
  if (provenance.kind === EVIDENCE_PROVENANCE.MISSING) {
    findings.push({ code: BINDER_REASON.PROVENANCE_MISSING });
  } else if (provenance.kind === EVIDENCE_PROVENANCE.SYNTHETIC) {
    findings.push({ code: BINDER_REASON.PROVENANCE_SYNTHETIC, detail: "synthetic observation cannot establish genuine readiness" });
  }
  return { binder, provenance, findings };
}

function finalize(result, outcome, evidence, facts = {}) {
  return Object.freeze({
    binder: result.binder,
    outcome,
    provenance: result.provenance,
    findings: result.findings,
    evidence,
    facts,
  });
}

function worst(a, b) {
  const rank = { [BINDER_OUTCOME.BOUND]: 0, [BINDER_OUTCOME.UNKNOWN]: 1, [BINDER_OUTCOME.BLOCKED]: 2 };
  return rank[b] > rank[a] ? b : a;
}

/* ----------------------------------------------------------------------- */
/* S1 Source                                                                */
/* ----------------------------------------------------------------------- */

/**
 * Canonicalise a GitHub remote URL or `owner/repo` to a repository identity.
 * Accepted alias forms (all resolve to the same identity):
 *   git@github.com:owner/repo(.git)
 *   ssh://git@github.com/owner/repo(.git)
 *   https://github.com/owner/repo(.git)(/)
 *   git://github.com/owner/repo(.git)
 *   owner/repo
 * GitHub owner/repo are case-insensitive; a case-variant of the canonical
 * identity is normalised and flagged `aliasObserved`. Any other identity
 * (fork, rename, different host) is not canonical.
 *
 * @param {unknown} remote
 * @param {string} [canonical]
 */
export function canonicalizeRepositoryIdentity(remote, canonical = EXPECTED_REPOSITORY_IDENTITY) {
  if (typeof remote !== "string" || remote.trim().length === 0) {
    return { ok: false, identity: null, observed: null, aliasObserved: false, reason: "remote missing" };
  }
  const value = remote.trim();
  let ownerRepo = null;
  const patterns = [
    /^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i,
    /^ssh:\/\/git@github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i,
    /^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i,
    /^git:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i,
    /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) {
      ownerRepo = `${match[1]}/${match[2]}`;
      break;
    }
  }
  if (!ownerRepo) {
    return { ok: false, identity: null, observed: value, aliasObserved: false, reason: "unrecognised remote form" };
  }
  if (ownerRepo === canonical) {
    return { ok: true, identity: canonical, observed: value, aliasObserved: value !== canonical, reason: null };
  }
  if (ownerRepo.toLowerCase() === canonical.toLowerCase()) {
    return { ok: true, identity: canonical, observed: value, aliasObserved: true, reason: "case-variant alias normalised" };
  }
  return { ok: false, identity: ownerRepo, observed: value, aliasObserved: false, reason: "identity is not the canonical repository" };
}

/**
 * S1 — bind source identity evidence.
 *
 * @param {{
 *   provenance: object,
 *   remoteUrl?: string,
 *   remoteRepositoryIdentity?: string | null,
 *   remoteMainSha?: string | null,
 *   branch?: string,
 *   head?: string,
 *   originMain?: string,
 *   headTree?: string,
 *   originMainTree?: string,
 *   trackedDirty?: string,
 *   checkoutPath?: string,
 *   protectedPaths?: readonly string[],
 * }} observation
 */
export function bindSourceEvidence(observation) {
  const result = makeResult(BINDER_ID.S1_SOURCE, observation);
  if (!isObject(observation)) {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MISSING });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, { source: null });
  }
  let outcome = BINDER_OUTCOME.BOUND;

  // Local remote identity (URL alias forms) and optional GitHub API `full_name`
  // observed by querying the *local* remote's owner/repo path. A renamed
  // repository (GitHub redirect) is accepted as an alias only when the API
  // confirms it resolves to the canonical identity; otherwise it is BLOCKED.
  const identity = canonicalizeRepositoryIdentity(observation.remoteUrl);
  const apiIdentity =
    observation.remoteRepositoryIdentity != null
      ? canonicalizeRepositoryIdentity(observation.remoteRepositoryIdentity)
      : null;
  let resolvedIdentity = identity.ok ? identity.identity : identity.identity ?? "UNKNOWN";
  let redirectVerified = false;
  if (identity.ok) {
    if (identity.aliasObserved) {
      result.findings.push({ code: BINDER_REASON.SOURCE_REPOSITORY_ALIAS_NORMALIZED, detail: identity.observed ?? undefined });
    }
  } else if (identity.identity && apiIdentity?.ok) {
    redirectVerified = true;
    resolvedIdentity = apiIdentity.identity;
    result.findings.push({
      code: BINDER_REASON.SOURCE_REPOSITORY_ALIAS_NORMALIZED,
      detail: `GitHub redirect alias ${identity.identity} -> ${apiIdentity.identity}`,
    });
  } else {
    result.findings.push({
      code: BINDER_REASON.SOURCE_REPOSITORY_NOT_CANONICAL,
      detail: identity.identity ? `${identity.identity}: ${identity.reason}; GitHub redirect not verified` : identity.reason ?? undefined,
    });
    outcome = BINDER_OUTCOME.BLOCKED;
  }
  if (apiIdentity != null && !apiIdentity.ok) {
    result.findings.push({
      code: BINDER_REASON.SOURCE_REPOSITORY_NOT_CANONICAL,
      detail: "GitHub API identity does not resolve to canonical repository",
    });
    outcome = BINDER_OUTCOME.BLOCKED;
  }

  const protectedPaths = Array.isArray(observation.protectedPaths) ? observation.protectedPaths : PROTECTED_CHECKOUT_PATHS;
  let protectedCheckoutUsed = null;
  if (typeof observation.checkoutPath === "string" && observation.checkoutPath.length > 0) {
    protectedCheckoutUsed = protectedPaths.some(
      (p) => observation.checkoutPath === p || observation.checkoutPath.startsWith(`${p}/`),
    );
    if (protectedCheckoutUsed) {
      result.findings.push({ code: BINDER_REASON.SOURCE_CHECKOUT_PROTECTED, detail: "protected primary worktree is not a deploy checkout" });
      outcome = BINDER_OUTCOME.BLOCKED;
    }
  } else {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MALFORMED, detail: "checkoutPath missing" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
  }

  if (observation.branch !== "main") {
    result.findings.push({ code: BINDER_REASON.SOURCE_NOT_EXACT_MAIN, detail: "branch must be exact main" });
    outcome = BINDER_OUTCOME.BLOCKED;
  }
  if (!isFullGitSha(observation.head) || !isFullGitSha(observation.originMain) || observation.head !== observation.originMain) {
    result.findings.push({ code: BINDER_REASON.SOURCE_NOT_EXACT_MAIN, detail: "head must equal origin/main as full SHAs" });
    outcome = BINDER_OUTCOME.BLOCKED;
  }
  if (
    !isFullGitSha(observation.headTree) ||
    !isFullGitSha(observation.originMainTree) ||
    observation.headTree !== observation.originMainTree
  ) {
    result.findings.push({ code: BINDER_REASON.SOURCE_NOT_EXACT_MAIN, detail: "head tree must equal origin/main tree" });
    outcome = BINDER_OUTCOME.BLOCKED;
  }
  if (typeof observation.trackedDirty !== "string") {
    result.findings.push({ code: BINDER_REASON.SOURCE_TRACKED_DIRTY, detail: "tracked-dirty status not observed" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
  } else if (observation.trackedDirty.length > 0) {
    result.findings.push({ code: BINDER_REASON.SOURCE_TRACKED_DIRTY });
    outcome = BINDER_OUTCOME.BLOCKED;
  }

  // Remote main freshness: local origin/main may be stale. Requires a read-only
  // GitHub observation; absence is UNKNOWN, drift is BLOCKED.
  if (observation.remoteMainSha == null) {
    result.findings.push({ code: BINDER_REASON.SOURCE_REMOTE_MAIN_UNVERIFIED, detail: "GitHub main head not observed" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
  } else if (!isFullGitSha(observation.remoteMainSha) || observation.remoteMainSha !== observation.originMain) {
    result.findings.push({ code: BINDER_REASON.SOURCE_REMOTE_MAIN_DRIFT, detail: "local origin/main differs from GitHub main" });
    outcome = BINDER_OUTCOME.BLOCKED;
  }

  // Engine fields are the observed facts; binder-level strictness (remote main
  // verification, alias normalisation) is enforced by decideBoundStagingPreflight.
  const evidence = {
    source: {
      repositoryIdentity: resolvedIdentity,
      branch: observation.branch,
      head: observation.head,
      originMain: observation.originMain,
      tree: observation.headTree,
      originMainTree: observation.originMainTree,
      trackedDirty: typeof observation.trackedDirty === "string" ? observation.trackedDirty : undefined,
      // Only an explicit observed false (path outside protected roots) satisfies the engine.
      protectedCheckoutUsed: protectedCheckoutUsed === false ? false : protectedCheckoutUsed === true ? true : undefined,
    },
  };
  return finalize(result, outcome, evidence, {
    localRemoteIdentity: identity.identity,
    resolvedIdentity,
    aliasObserved: identity.aliasObserved || redirectVerified,
    redirectVerified,
    remoteMainVerified: observation.remoteMainSha != null && observation.remoteMainSha === observation.originMain,
  });
}

/* ----------------------------------------------------------------------- */
/* S2 Publishing                                                            */
/* ----------------------------------------------------------------------- */

/** Observed workflow state values accepted from the GitHub API. Anything else is UNKNOWN. */
export const WORKFLOW_API_STATES = Object.freeze([
  "active",
  "disabled_manually",
  "disabled_inactivity",
  "deleted",
]);

/**
 * Classify publishing paths. Distinguishes *hosting* (the site currently
 * served from GitHub Pages — an observation) from a *publishing operation*
 * (a workflow/action that writes to the publishing branch or Pages).
 *
 * Safety is only classifiable SAFE when a Founder-locked policy exists and
 * no active publishing path can be reached by the staging deploy operation.
 * S2 policy is not Founder-locked today: unresolved safety stays BLOCKED and
 * nothing here disables a live site.
 *
 * @param {{
 *   provenance: object,
 *   workflows?: Array<{
 *     path: string,
 *     name?: string | null,
 *     triggers?: Array<{ event: string, branches?: string[] }>,
 *     publishingSteps?: Array<{ uses: string, kind: string }>,
 *     permissions?: Record<string, string>,
 *     apiState?: string | null,
 *   }>,
 *   pagesHosting?: { sourceBranch?: string | null, sourcePath?: string | null, cname?: string | null, httpsEnforced?: boolean | null } | null,
 *   policyLock?: { locked: boolean, authority?: string | null } | null,
 *   operation?: { kind: string, pushesToBranches?: string[] },
 * }} observation
 */
export function bindPublishingEvidence(observation) {
  const result = makeResult(BINDER_ID.S2_PUBLISHING, observation);
  if (!isObject(observation)) {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MISSING });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, {
      publishing: { deployWorkflowState: "UNKNOWN", pagesSourceKnown: false, unsafeActivePublishingPath: true },
    });
  }
  let outcome = BINDER_OUTCOME.BOUND;
  const workflows = Array.isArray(observation.workflows) ? observation.workflows : [];
  const operation = isObject(observation.operation)
    ? observation.operation
    : { kind: "STAGING_DEPLOY_LOCAL_PODMAN", pushesToBranches: [] };
  const operationBranches = new Set(Array.isArray(operation.pushesToBranches) ? operation.pushesToBranches : []);

  const publishingPaths = [];
  let anyActivePublishing = false;
  let anyStateUnobserved = false;
  let deployWorkflowState = "UNKNOWN";
  for (const workflow of workflows) {
    const steps = Array.isArray(workflow.publishingSteps) ? workflow.publishingSteps : [];
    if (steps.length === 0) continue;
    const triggers = Array.isArray(workflow.triggers) ? workflow.triggers : [];
    const pushBranches = triggers
      .filter((t) => t.event === "push")
      .flatMap((t) => (Array.isArray(t.branches) ? t.branches : []));
    const apiState = WORKFLOW_API_STATES.includes(workflow.apiState) ? workflow.apiState : null;
    const reachableByOperation = pushBranches.some((b) => operationBranches.has(b));
    const classification = {
      path: workflow.path,
      effect: "PUBLISHES_PUBLIC_SITE",
      actions: steps.map((s) => s.uses),
      pushBranches,
      apiState: apiState ?? "UNOBSERVED",
      reachableByOperation,
      contentsWrite: workflow.permissions?.contents === "write" || workflow.permissions?.pages === "write",
    };
    publishingPaths.push(classification);
    if (apiState == null) {
      anyStateUnobserved = true;
    } else if (apiState === "active") {
      anyActivePublishing = true;
    }
    // Engine field: the single Pages deploy workflow state. Multiple publishing
    // workflows collapse to the least safe observed state.
    if (deployWorkflowState === "UNKNOWN" && apiState != null) deployWorkflowState = apiState;
    else if (apiState === "active") deployWorkflowState = "active";
  }

  const pagesHosting = isObject(observation.pagesHosting) ? observation.pagesHosting : null;
  const pagesSourceKnown = pagesHosting != null && nonEmptyString(pagesHosting.sourceBranch);
  if (!pagesSourceKnown) {
    result.findings.push({ code: BINDER_REASON.PUBLISHING_HOSTING_UNOBSERVED, detail: "GitHub Pages source not observed" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
  }
  if (anyStateUnobserved) {
    result.findings.push({ code: BINDER_REASON.PUBLISHING_WORKFLOW_STATE_UNOBSERVED, detail: "publishing workflow API state not observed; file presence alone is not state" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
    deployWorkflowState = "UNKNOWN";
  }
  if (anyActivePublishing) {
    result.findings.push({ code: BINDER_REASON.PUBLISHING_ACTIVE_PATH_OBSERVED, detail: "an active publishing workflow exists; disabling a live site is not authorised here" });
    outcome = BINDER_OUTCOME.BLOCKED;
  }
  if (publishingPaths.some((p) => p.reachableByOperation && p.apiState !== "disabled_manually")) {
    result.findings.push({ code: BINDER_REASON.PUBLISHING_UNSAFE_ACTION_OBSERVED, detail: "operation can reach a publishing path" });
    outcome = BINDER_OUTCOME.BLOCKED;
  }

  const policyLocked = isObject(observation.policyLock) && observation.policyLock.locked === true && nonEmptyString(observation.policyLock.authority);
  if (!policyLocked) {
    result.findings.push({ code: BINDER_REASON.PUBLISHING_POLICY_NOT_LOCKED, detail: "S2 publishing safety policy is not Founder-locked; unresolved safety is BLOCKED" });
    outcome = BINDER_OUTCOME.BLOCKED;
  }

  const safetyClassification = !policyLocked
    ? "UNRESOLVED_POLICY"
    : anyActivePublishing || anyStateUnobserved
      ? "UNSAFE_OR_UNKNOWN"
      : "SAFE";

  return finalize(
    result,
    outcome,
    {
      publishing: {
        deployWorkflowState,
        pagesSourceKnown,
        unsafeActivePublishingPath: safetyClassification !== "SAFE",
      },
    },
    {
      existingPagesHosting: pagesHosting
        ? { sourceBranch: pagesHosting.sourceBranch ?? null, sourcePath: pagesHosting.sourcePath ?? null, cname: pagesHosting.cname ?? null, httpsEnforced: pagesHosting.httpsEnforced ?? null }
        : null,
      publishingPaths,
      operation: { kind: operation.kind, pushesToBranches: [...operationBranches] },
      policyLocked,
      safetyClassification,
    },
  );
}

/* ----------------------------------------------------------------------- */
/* S3 Configuration                                                         */
/* ----------------------------------------------------------------------- */

const APP_ENVIRONMENT_VALUES = new Set(["local", "test", "ci", "staging", "production"]);

/**
 * Refuse any projection object that carries fields outside the secret-safe
 * contract (raw values, env sources, etc.).
 */
export function isSecretSafeProjection(projection) {
  if (!isObject(projection)) return false;
  for (const key of Object.keys(projection)) {
    if (!SECRET_SAFE_PROJECTION_KEYS.has(key)) return false;
  }
  if (projection.issues != null) {
    if (!Array.isArray(projection.issues)) return false;
    for (const issue of projection.issues) {
      if (!isObject(issue)) return false;
      const keys = Object.keys(issue);
      if (keys.some((k) => k !== "key" && k !== "message")) return false;
      if (typeof issue.key !== "string" || typeof issue.message !== "string") return false;
    }
  }
  if (projection.envFiles != null && !Array.isArray(projection.envFiles)) return false;
  return true;
}

/**
 * S3 — bind projected configuration evidence.
 *
 * Each projection is the secret-safe result of running the real
 * `validateSource`/`loadConfig` over the Compose env stack for one service.
 * Rules (D-385 / AD-PF-01): only `environment === "staging"` with `ok ===
 * true` is strict staging. `BOBA_BEAR_ENV=local` is Local UAT and is
 * reported as not strict staging (BLOCKED for Gate 2) — never relaxed.
 *
 * @param {{
 *   provenance: object,
 *   projections?: Array<{ service: string, processKind: string, envFiles?: string[], envFilesPresent?: boolean, environment?: string, nodeEnvSource?: string, ok?: boolean, issues?: Array<{ key: string, message: string }> }>,
 *   requiredServices?: readonly string[],
 *   requiredEnvFilesPresent?: boolean,
 *   diagnostic?: { enabled?: boolean, projectionKnown?: boolean, conflict?: boolean, invalid?: boolean },
 * }} observation
 */
export function bindConfigurationEvidence(observation) {
  const result = makeResult(BINDER_ID.S3_CONFIGURATION, observation);
  const unknownEvidence = {
    environment: {
      requiredEnvFilesPresent: false,
      projectedConfigValid: false,
      projectedConfigState: "UNKNOWN",
      diagnosticProjectionKnown: false,
      diagnosticEnabled: true,
      diagnosticConflict: true,
      bobaBearEnvDrift: true,
      secretsPrinted: false,
    },
  };
  if (!isObject(observation)) {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MISSING });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, unknownEvidence);
  }
  let outcome = BINDER_OUTCOME.BOUND;
  const required = Array.isArray(observation.requiredServices) ? observation.requiredServices : REQUIRED_CONFIG_PROJECTION_SERVICES;
  const projections = Array.isArray(observation.projections) ? observation.projections : [];

  const unsafe = projections.filter((p) => !isSecretSafeProjection(p));
  if (unsafe.length > 0) {
    result.findings.push({ code: BINDER_REASON.CONFIG_PROJECTION_NOT_SECRET_SAFE, detail: "projection carries fields outside the secret-safe contract; refused" });
    return finalize(result, BINDER_OUTCOME.BLOCKED, {
      environment: { ...unknownEvidence.environment, projectedConfigState: "INVALID", secretsPrinted: true },
    });
  }

  const byService = new Map(projections.map((p) => [p.service, p]));
  const environments = new Set();
  let anyUnknown = false;
  let anyInvalid = false;
  let anyLocalUat = false;
  let anyNonStaging = false;
  const perService = [];
  for (const service of required) {
    const projection = byService.get(service);
    if (!projection) {
      result.findings.push({ code: BINDER_REASON.CONFIG_PROJECTION_MISSING, detail: service });
      anyUnknown = true;
      perService.push({ service, state: "MISSING" });
      continue;
    }
    if (projection.envFilesPresent === false || projection.environment === "MISSING" || projection.environment == null) {
      result.findings.push({ code: BINDER_REASON.CONFIG_PROJECTION_MISSING, detail: `${service}: env stack unreadable or BOBA_BEAR_ENV absent` });
      anyUnknown = true;
      perService.push({ service, state: "UNKNOWN" });
      continue;
    }
    const environment = APP_ENVIRONMENT_VALUES.has(projection.environment) ? projection.environment : "INVALID";
    environments.add(environment);
    if (environment === "local") {
      result.findings.push({ code: BINDER_REASON.CONFIG_LOCAL_UAT_NOT_STRICT_STAGING, detail: `${service}: BOBA_BEAR_ENV=local is Local UAT (D-385), not strict staging` });
      anyLocalUat = true;
      perService.push({ service, state: "LOCAL_UAT" });
      continue;
    }
    if (environment !== "staging") {
      result.findings.push({ code: BINDER_REASON.CONFIG_NOT_STAGING_ENVIRONMENT, detail: `${service}: ${environment}` });
      anyNonStaging = true;
      perService.push({ service, state: "NOT_STAGING" });
      continue;
    }
    if (projection.ok !== true) {
      const keys = Array.isArray(projection.issues) ? projection.issues.map((i) => i.key).join(",") : "";
      result.findings.push({ code: BINDER_REASON.CONFIG_STRICT_STAGING_INVALID, detail: `${service}: ${keys}` });
      anyInvalid = true;
      perService.push({ service, state: "INVALID" });
      continue;
    }
    perService.push({ service, state: "VALID" });
  }
  const drift = environments.size > 1;
  if (drift) {
    result.findings.push({ code: BINDER_REASON.CONFIG_ENVIRONMENT_DRIFT_ACROSS_SERVICES, detail: [...environments].sort().join(",") });
  }

  const diagnostic = isObject(observation.diagnostic) ? observation.diagnostic : {};
  const diagnosticProjectionKnown = diagnostic.projectionKnown === true && diagnostic.invalid !== true;
  const diagnosticEnabled = diagnostic.enabled === true;
  const diagnosticConflict = diagnostic.conflict === true || diagnostic.invalid === true;
  if (diagnosticEnabled || diagnosticConflict) {
    result.findings.push({ code: BINDER_REASON.CONFIG_DIAGNOSTIC_ENABLED_OR_CONFLICT, detail: "observer must be OFF with a known, conflict-free projection" });
  }

  let projectedConfigState;
  if (anyLocalUat) {
    projectedConfigState = "LOCAL_UAT_NOT_STAGING";
    outcome = BINDER_OUTCOME.BLOCKED;
  } else if (anyInvalid || anyNonStaging || drift) {
    projectedConfigState = "INVALID";
    outcome = BINDER_OUTCOME.BLOCKED;
  } else if (anyUnknown) {
    projectedConfigState = "UNKNOWN";
    outcome = BINDER_OUTCOME.UNKNOWN;
  } else {
    projectedConfigState = "VALID";
  }
  if (diagnosticEnabled || diagnosticConflict) outcome = BINDER_OUTCOME.BLOCKED;
  else if (!diagnosticProjectionKnown) outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);

  return finalize(
    result,
    outcome,
    {
      environment: {
        requiredEnvFilesPresent: observation.requiredEnvFilesPresent === true,
        projectedConfigValid: projectedConfigState === "VALID",
        projectedConfigState,
        diagnosticProjectionKnown,
        diagnosticEnabled,
        diagnosticConflict,
        bobaBearEnvDrift: drift,
        secretsPrinted: false,
      },
    },
    { perService, environments: [...environments].sort() },
  );
}

/* ----------------------------------------------------------------------- */
/* S4 Database                                                              */
/* ----------------------------------------------------------------------- */

/**
 * S4 — bind migration ledger / baseline evidence.
 *
 * `committedJournal` is the repository's drizzle journal (tag, when,
 * sqlSha256 per entry). `appliedLedger` is a read-only observation of
 * `drizzle.__drizzle_migrations` (hash, createdAt) for the exact staging
 * target. `baseline` is a `STAGING_BASELINE_STATE` classification for the
 * same target.
 *
 * Ledger states handed to the engine:
 *   APPLIED_CURRENT  applied rows == full committed journal
 *   LEDGER_CURRENT   applied rows are an exact prefix of the committed journal (pending tail is explained by deploy `migrate`)
 *   LEDGER_DIVERGED  foreign rows / hash mismatch / out-of-order  -> engine BLOCKED
 *   UNKNOWN          unreachable / missing                        -> engine UNKNOWN
 *
 * @param {{
 *   provenance: object,
 *   committedJournal?: { entries: Array<{ idx: number, tag: string, when: number, sqlSha256: string }> } | null,
 *   appliedLedger?: { reachable: boolean, target?: { composeProject?: string, container?: string, volume?: string }, rows?: Array<{ hash: string, createdAt: number }>, observedAt?: string } | null,
 *   baseline?: { state: string, target?: { composeProject?: string, container?: string, volume?: string }, observedAt?: string } | null,
 *   pendingMutationExplained?: boolean,
 *   now?: Date | string,
 *   maxAgeMs?: number,
 * }} observation
 */
export function bindDatabaseEvidence(observation) {
  const result = makeResult(BINDER_ID.S4_DATABASE, observation);
  const unknown = (state = "UNKNOWN") => ({
    database: {
      migrationIdentityKnown: false,
      migrationLedgerState: state,
      baselineCompatibility: "UNKNOWN",
      unexplainedPendingMutation: false,
    },
  });
  if (!isObject(observation)) {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MISSING });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, unknown());
  }
  const now = resolveNow(observation.now);
  const maxAgeMs = typeof observation.maxAgeMs === "number" ? observation.maxAgeMs : BINDER_FRESHNESS_DEFAULTS.databaseEvidenceMaxAgeMs;

  const journal = observation.committedJournal;
  if (!isObject(journal) || !Array.isArray(journal.entries) || journal.entries.length === 0) {
    result.findings.push({ code: BINDER_REASON.DATABASE_JOURNAL_MALFORMED, detail: "committed migration journal missing or empty" });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, unknown());
  }
  for (const entry of journal.entries) {
    if (!isObject(entry) || !Number.isInteger(entry.idx) || !nonEmptyString(entry.tag) || !Number.isFinite(entry.when) || !/^[0-9a-f]{64}$/.test(String(entry.sqlSha256))) {
      result.findings.push({ code: BINDER_REASON.DATABASE_JOURNAL_MALFORMED, detail: `entry ${entry?.tag ?? "?"}` });
      return finalize(result, BINDER_OUTCOME.UNKNOWN, unknown());
    }
  }

  const ledger = observation.appliedLedger;
  if (!isObject(ledger) || ledger.reachable !== true || !Array.isArray(ledger.rows)) {
    result.findings.push({ code: BINDER_REASON.DATABASE_LEDGER_UNREACHABLE, detail: "applied ledger not observed (no live DB probe run)" });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, unknown());
  }
  let outcome = BINDER_OUTCOME.BOUND;
  const targetOk = (target) =>
    isObject(target) &&
    target.composeProject === EXPECTED_STAGING_COMPOSE_PROJECT &&
    target.container === EXPECTED_STAGING_POSTGRES_CONTAINER &&
    target.volume === EXPECTED_STAGING_POSTGRES_VOLUME;
  if (!targetOk(ledger.target)) {
    result.findings.push({ code: BINDER_REASON.DATABASE_LEDGER_MISBOUND, detail: "ledger observation is not bound to the exact staging project/container/volume" });
    outcome = BINDER_OUTCOME.BLOCKED;
  }
  if (!isFresh(ledger.observedAt, maxAgeMs, now)) {
    result.findings.push({ code: BINDER_REASON.DATABASE_LEDGER_STALE });
    outcome = BINDER_OUTCOME.BLOCKED;
  }

  // Compare applied rows to committed journal in order.
  const sortedApplied = [...ledger.rows]
    .filter((r) => isObject(r))
    .sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
  let ledgerState = "UNKNOWN";
  let diverged = sortedApplied.length > journal.entries.length;
  for (let i = 0; i < sortedApplied.length && !diverged; i += 1) {
    const applied = sortedApplied[i];
    const committed = journal.entries[i];
    if (Number(applied.createdAt) !== committed.when || String(applied.hash).toLowerCase() !== committed.sqlSha256) {
      diverged = true;
    }
  }
  if (diverged) {
    result.findings.push({ code: BINDER_REASON.DATABASE_LEDGER_DIVERGED, detail: "applied ledger is not a prefix of the committed journal (foreign rows, hash mismatch, or order)" });
    ledgerState = "LEDGER_DIVERGED";
    outcome = BINDER_OUTCOME.BLOCKED;
  } else if (sortedApplied.length === journal.entries.length) {
    ledgerState = "APPLIED_CURRENT";
  } else {
    ledgerState = "LEDGER_CURRENT";
  }
  const pendingCount = diverged ? null : journal.entries.length - sortedApplied.length;

  const baseline = observation.baseline;
  let baselineCompatibility = "UNKNOWN";
  if (!isObject(baseline) || !STAGING_BASELINE_STATES.includes(baseline.state)) {
    result.findings.push({ code: BINDER_REASON.DATABASE_BASELINE_MISSING, detail: "baseline classification not observed" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
  } else {
    if (!targetOk(baseline.target) || !isFresh(baseline.observedAt, maxAgeMs, now)) {
      result.findings.push({ code: BINDER_REASON.DATABASE_LEDGER_MISBOUND, detail: "baseline observation misbound or stale" });
      outcome = BINDER_OUTCOME.BLOCKED;
    }
    baselineCompatibility = baseline.state;
    if (baseline.state === "PARTIAL_OR_INCOMPATIBLE") {
      result.findings.push({ code: BINDER_REASON.DATABASE_BASELINE_INCOMPATIBLE });
      outcome = BINDER_OUTCOME.BLOCKED;
    }
    if (baseline.state === "FRESH_EMPTY" && sortedApplied.length > 0) {
      result.findings.push({ code: BINDER_REASON.DATABASE_BASELINE_CONFLICTS_WITH_LEDGER, detail: "FRESH_EMPTY baseline with applied migrations" });
      baselineCompatibility = "PARTIAL_OR_INCOMPATIBLE";
      outcome = BINDER_OUTCOME.BLOCKED;
    }
  }

  const unexplainedPendingMutation =
    pendingCount != null && pendingCount > 0 && observation.pendingMutationExplained !== true;

  return finalize(
    result,
    outcome,
    {
      database: {
        migrationIdentityKnown: true,
        migrationLedgerState: ledgerState,
        baselineCompatibility,
        unexplainedPendingMutation,
      },
    },
    { appliedCount: sortedApplied.length, committedCount: journal.entries.length, pendingCount },
  );
}

/* ----------------------------------------------------------------------- */
/* S5 Recovery                                                              */
/* ----------------------------------------------------------------------- */

function validationCodes(evidence) {
  const results = Array.isArray(evidence.validationResults) ? evidence.validationResults : [];
  return new Set(results.map((e) => (isObject(e) ? String(e.code ?? e.check ?? "") : "")).filter((c) => c.length > 0));
}

/**
 * S5 — bind staging-specific recovery evidence.
 *
 * Requires, from IMP-037 evidence records (schema `imp037-evidence-v1`):
 *   checkpoint  staging-classified qualifying Layer 1/2 proof bound to the staging source marker,
 *               checksum MATCHED (Layer 2) / PGBACKREST_VERIFY_OK (Layer 1), recovery point fresh,
 *               candidate.commitSha recorded (rollback revision)
 *   restore     staging-classified SUCCEEDED restore/rehearsal record bound to the same
 *               recoveryArtifactReference, targetIdentityMarker != source marker (isolated
 *               restore), DB_REACHABLE + BUSINESS_INTEGRITY_VALIDATED codes present
 *
 * No records -> design dependency remains (truthful), outcome UNKNOWN.
 *
 * @param {{
 *   provenance: object,
 *   evidenceRecords?: unknown[],
 *   stagingIdentity?: { sourceIdentityMarker?: string },
 *   now?: Date | string,
 *   checkpointMaxAgeMs?: number,
 * }} observation
 */
export function bindRecoveryEvidence(observation) {
  const result = makeResult(BINDER_ID.S5_RECOVERY, observation);
  const designDependency = {
    recovery: {
      bindingDesignDependency: true,
      binding: "RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY",
      checkpointPresent: false,
      integrityVerified: false,
      restoreProofPresent: false,
      recoveryPointIdentifiable: false,
      rollbackPlanSuitable: false,
      stagingBound: false,
      freshnessOk: false,
    },
  };
  if (!isObject(observation)) {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MISSING });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, designDependency);
  }
  const records = Array.isArray(observation.evidenceRecords) ? observation.evidenceRecords : [];
  if (records.length === 0) {
    result.findings.push({ code: BINDER_REASON.RECOVERY_NO_STAGING_RECORDS, detail: "no recovery evidence records supplied; design dependency remains" });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, designDependency);
  }
  const now = resolveNow(observation.now);
  const checkpointMaxAgeMs = typeof observation.checkpointMaxAgeMs === "number" ? observation.checkpointMaxAgeMs : BINDER_FRESHNESS_DEFAULTS.recoveryCheckpointMaxAgeMs;
  const sourceMarker = isObject(observation.stagingIdentity) && nonEmptyString(observation.stagingIdentity.sourceIdentityMarker)
    ? observation.stagingIdentity.sourceIdentityMarker
    : null;

  const valid = [];
  for (const record of records) {
    const parsed = validateEvidence(record);
    if (!parsed.ok) {
      result.findings.push({ code: BINDER_REASON.RECOVERY_RECORD_INVALID, detail: parsed.reason });
      // Tampered / malformed evidence in the set blocks; it is not silently dropped.
      return finalize(result, BINDER_OUTCOME.BLOCKED, {
        recovery: { ...designDependency.recovery, bindingDesignDependency: false, binding: "RECOVERY_PROOF_BINDING = INVALID_RECORD" },
      });
    }
    valid.push(parsed.evidence);
  }
  const staging = valid.filter((e) => e.sourceEnvironmentClassification === ENVIRONMENT_CLASSIFICATION.STAGING);
  if (staging.length === 0) {
    result.findings.push({ code: BINDER_REASON.RECOVERY_NO_STAGING_RECORDS, detail: "records present but none staging-classified" });
    return finalize(result, BINDER_OUTCOME.BLOCKED, {
      recovery: { ...designDependency.recovery, bindingDesignDependency: false, binding: "RECOVERY_PROOF_BINDING = MISBOUND" },
    });
  }

  // Checkpoint candidates: qualifying backup proof bound to the staging source marker.
  const checkpoints = staging
    .filter((e) => !RESTORE_OPERATION_TYPES.has(String(e.operationType)))
    .filter((e) => evaluateQualifyingRecoveryProof(e).ok)
    .sort((a, b) => Date.parse(b.endedAt ?? b.startedAt) - Date.parse(a.endedAt ?? a.startedAt));

  let checkpoint = null;
  for (const candidate of checkpoints) {
    if (sourceMarker == null || candidate.sourceIdentityMarker !== sourceMarker) continue;
    checkpoint = candidate;
    break;
  }
  if (!checkpoint) {
    if (checkpoints.length === 0) {
      result.findings.push({ code: BINDER_REASON.RECOVERY_CHECKPOINT_NOT_QUALIFYING, detail: "no staging record passes qualifying recovery proof" });
    } else {
      result.findings.push({ code: BINDER_REASON.RECOVERY_CHECKPOINT_MISBOUND, detail: sourceMarker == null ? "staging source identity marker not observed" : "qualifying checkpoint not bound to staging source marker" });
    }
    return finalize(result, BINDER_OUTCOME.BLOCKED, {
      recovery: { ...designDependency.recovery, bindingDesignDependency: false, binding: "RECOVERY_PROOF_BINDING = UNBOUND", stagingBound: false },
    });
  }

  let outcome = BINDER_OUTCOME.BOUND;
  const codes = validationCodes(checkpoint);
  const integrityVerified =
    checkpoint.checksumIntegrityStatus === CHECKSUM_INTEGRITY_STATUS.MATCHED || codes.has(PROOF_CODE.PGBACKREST_VERIFY_OK);
  if (!integrityVerified) {
    result.findings.push({ code: BINDER_REASON.RECOVERY_INTEGRITY_NOT_MATCHED });
    outcome = BINDER_OUTCOME.BLOCKED;
  }
  const freshness = evaluateRecoveryPointFreshness(checkpoint.recoveryPoint, checkpointMaxAgeMs, now);
  const recoveryPointIdentifiable = nonEmptyString(checkpoint.recoveryPoint);
  if (!recoveryPointIdentifiable || !freshness.ok) {
    result.findings.push({ code: BINDER_REASON.RECOVERY_POINT_STALE_OR_UNIDENTIFIABLE, detail: freshness.reason });
    outcome = BINDER_OUTCOME.BLOCKED;
  }
  const rollbackRevision = checkpoint.candidate?.commitSha;
  const rollbackPlanSuitable = isFullGitSha(rollbackRevision);
  if (!rollbackPlanSuitable) {
    result.findings.push({ code: BINDER_REASON.RECOVERY_ROLLBACK_REVISION_UNRECORDED, detail: "checkpoint does not record the full running revision SHA" });
    outcome = BINDER_OUTCOME.BLOCKED;
  }

  // Isolated restore proof bound to this exact checkpoint artifact.
  const restores = staging.filter(
    (e) => RESTORE_OPERATION_TYPES.has(String(e.operationType)) && e.status === OPERATION_STATUS.SUCCEEDED && e.incomplete !== true,
  );
  let restoreProof = null;
  let restoreIssue = null;
  for (const restore of restores) {
    if (!nonEmptyString(checkpoint.recoveryArtifactReference) || restore.recoveryArtifactReference !== checkpoint.recoveryArtifactReference) {
      restoreIssue = restoreIssue ?? BINDER_REASON.RECOVERY_RESTORE_NOT_BOUND_TO_CHECKPOINT;
      continue;
    }
    if (!nonEmptyString(restore.targetIdentityMarker) || restore.targetIdentityMarker === sourceMarker) {
      restoreIssue = BINDER_REASON.RECOVERY_RESTORE_NOT_ISOLATED;
      continue;
    }
    const restoreCodes = validationCodes(restore);
    if (!restoreCodes.has(PROOF_CODE.DB_REACHABLE) || !restoreCodes.has(PROOF_CODE.BUSINESS_INTEGRITY_VALIDATED)) {
      restoreIssue = BINDER_REASON.RECOVERY_RESTORE_PROOF_MISSING;
      continue;
    }
    restoreProof = restore;
    break;
  }
  if (!restoreProof) {
    result.findings.push({ code: restoreIssue ?? BINDER_REASON.RECOVERY_RESTORE_PROOF_MISSING });
    outcome = BINDER_OUTCOME.BLOCKED;
  }

  return finalize(
    result,
    outcome,
    {
      recovery: {
        bindingDesignDependency: false,
        binding: `RECOVERY_PROOF_BINDING = BOUND:${checkpoint.runId}`,
        checkpointPresent: true,
        integrityVerified,
        restoreProofPresent: restoreProof != null,
        recoveryPointIdentifiable,
        rollbackPlanSuitable,
        stagingBound: true,
        freshnessOk: freshness.ok,
        evidenceRecords: staging,
      },
    },
    {
      checkpointRunId: checkpoint.runId,
      checkpointLayer: checkpoint.recoveryLayer,
      recoveryArtifactReference: checkpoint.recoveryArtifactReference ?? null,
      restoreRunId: restoreProof?.runId ?? null,
      rollbackRevision: rollbackPlanSuitable ? rollbackRevision : null,
    },
  );
}

/* ----------------------------------------------------------------------- */
/* S6 Security                                                              */
/* ----------------------------------------------------------------------- */

function normalizeImageId(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (/^sha256:[0-9a-f]{64}$/.test(trimmed)) return trimmed;
  if (/^[0-9a-f]{64}$/.test(trimmed)) return `sha256:${trimmed}`;
  return null;
}

/**
 * S6 — bind exact source SHA <-> image ID <-> Trivy evidence.
 *
 * @param {{
 *   provenance: object,
 *   candidateHead?: string,
 *   requiredImages?: ReadonlyArray<{ service: string, image: string, trivyTargetId: string }>,
 *   inspectedImages?: Array<{ image: string, imageId: string, repoDigests?: string[], revisionLabel?: string | null }>,
 *   trivyReports?: Array<{ image: string, report: object, scannedAt?: string }>,
 *   exceptionPolicy?: { todayIso?: string, errors?: string[], activeByFinding?: Map<string, Record<string, string>> | Record<string, Record<string, string>> } | null,
 *   issue409RiskWaived?: boolean,
 *   now?: Date | string,
 *   scanMaxAgeMs?: number,
 * }} observation
 */
export function bindSecurityEvidence(observation) {
  const result = makeResult(BINDER_ID.S6_SECURITY, observation);
  const failed = (waived = false) => ({
    security: {
      imageSecurityEvidenceRequired: true,
      imageSecurityEvidencePresent: false,
      issue409RiskWaived: waived,
      sourceImageCorrelated: false,
    },
  });
  if (!isObject(observation)) {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MISSING });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, failed());
  }
  if (observation.issue409RiskWaived === true) {
    result.findings.push({ code: BINDER_REASON.SECURITY_RISK_WAIVED });
    return finalize(result, BINDER_OUTCOME.BLOCKED, failed(true));
  }
  const now = resolveNow(observation.now);
  const scanMaxAgeMs = typeof observation.scanMaxAgeMs === "number" ? observation.scanMaxAgeMs : BINDER_FRESHNESS_DEFAULTS.securityScanMaxAgeMs;
  const candidateHead = observation.candidateHead;
  if (!isFullGitSha(candidateHead)) {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MALFORMED, detail: "candidateHead must be a full SHA" });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, failed());
  }

  // Exception policy: any error (including expiry) fails closed. Expired never PASS.
  const policy = isObject(observation.exceptionPolicy) ? observation.exceptionPolicy : null;
  let outcome = BINDER_OUTCOME.BOUND;
  if (!policy) {
    result.findings.push({ code: BINDER_REASON.SECURITY_EXCEPTION_POLICY_ERROR, detail: "exception policy not loaded" });
    outcome = BINDER_OUTCOME.UNKNOWN;
  } else {
    const errors = Array.isArray(policy.errors) ? policy.errors : [];
    if (errors.some((e) => String(e).startsWith("TRIVY_EXCEPTION_EXPIRED"))) {
      result.findings.push({ code: BINDER_REASON.SECURITY_EXCEPTION_EXPIRED, detail: "an expired container exception is present; renewal requires Founder authority and never happens here" });
      outcome = BINDER_OUTCOME.BLOCKED;
    } else if (errors.length > 0) {
      result.findings.push({ code: BINDER_REASON.SECURITY_EXCEPTION_POLICY_ERROR, detail: errors[0] });
      outcome = BINDER_OUTCOME.BLOCKED;
    }
  }
  const activeByFinding = (() => {
    const raw = policy?.activeByFinding;
    if (raw instanceof Map) return raw;
    if (isObject(raw)) return new Map(Object.entries(raw));
    return new Map();
  })();

  const required = Array.isArray(observation.requiredImages) ? observation.requiredImages : REQUIRED_STAGING_IMAGES;
  const inspected = new Map((Array.isArray(observation.inspectedImages) ? observation.inspectedImages : []).filter(isObject).map((i) => [i.image, i]));
  const reports = new Map((Array.isArray(observation.trivyReports) ? observation.trivyReports : []).filter(isObject).map((r) => [r.image, r]));

  const perImage = [];
  let allCorrelated = true;
  let allScanned = true;
  for (const target of required) {
    const entry = { service: target.service, image: target.image, revisionMatch: false, digestBound: false, scanClean: false };
    const image = inspected.get(target.image);
    if (!image) {
      result.findings.push({ code: BINDER_REASON.SECURITY_IMAGE_NOT_INSPECTED, detail: target.image });
      outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
      allCorrelated = false;
      allScanned = false;
      perImage.push(entry);
      continue;
    }
    const imageId = normalizeImageId(image.imageId);
    if (image.revisionLabel !== candidateHead) {
      result.findings.push({ code: BINDER_REASON.SECURITY_IMAGE_REVISION_MISMATCH, detail: `${target.image} revision label != candidate` });
      outcome = BINDER_OUTCOME.BLOCKED;
      allCorrelated = false;
    } else {
      entry.revisionMatch = true;
    }
    const report = reports.get(target.image);
    if (!report || !isObject(report.report)) {
      result.findings.push({ code: BINDER_REASON.SECURITY_SCAN_MISSING, detail: target.image });
      outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
      allScanned = false;
      perImage.push(entry);
      continue;
    }
    const reportImageId = normalizeImageId(report.report?.Metadata?.ImageID);
    if (imageId == null || reportImageId == null || imageId !== reportImageId) {
      result.findings.push({ code: BINDER_REASON.SECURITY_SCAN_DIGEST_MISMATCH, detail: `${target.image}: Trivy Metadata.ImageID does not match inspected image ID` });
      outcome = BINDER_OUTCOME.BLOCKED;
      allCorrelated = false;
    } else {
      entry.digestBound = true;
    }
    if (!isFresh(report.scannedAt, scanMaxAgeMs, now)) {
      result.findings.push({ code: BINDER_REASON.SECURITY_SCAN_STALE, detail: target.image });
      outcome = BINDER_OUTCOME.BLOCKED;
    }
    const interpreted = interpretTrivyJson(JSON.stringify(report.report), target.image);
    if (interpreted.errors.length > 0) {
      result.findings.push({ code: BINDER_REASON.SECURITY_SCAN_MALFORMED, detail: interpreted.errors[0] });
      outcome = BINDER_OUTCOME.BLOCKED;
      allScanned = false;
      perImage.push(entry);
      continue;
    }
    const unexcepted = interpreted.findings.filter((f) => {
      if (f.severity !== "HIGH" && f.severity !== "CRITICAL") return false;
      const row = activeByFinding.get(f.id);
      return !(row && row.image === target.trivyTargetId);
    });
    if (unexcepted.length > 0) {
      result.findings.push({ code: BINDER_REASON.SECURITY_UNEXCEPTED_FINDING, detail: `${target.image}: ${unexcepted.map((f) => f.id).join(",")}` });
      outcome = BINDER_OUTCOME.BLOCKED;
      allScanned = false;
    } else {
      entry.scanClean = true;
    }
    perImage.push(entry);
  }

  const bound = outcome === BINDER_OUTCOME.BOUND;
  return finalize(
    result,
    outcome,
    {
      security: {
        imageSecurityEvidenceRequired: true,
        imageSecurityEvidencePresent: bound && allScanned,
        issue409RiskWaived: false,
        sourceImageCorrelated: bound && allCorrelated,
      },
    },
    { candidateHead, perImage, exceptionPolicyToday: policy?.todayIso ?? null },
  );
}

/* ----------------------------------------------------------------------- */
/* S7 Capacity                                                              */
/* ----------------------------------------------------------------------- */

function isNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/**
 * S7 — bind capacity + preservation evidence under AD-PF-02 / D-386.
 *
 * Disk: for every filesystem with a build / image-store role, available >=
 * 40 GiB AND available >= 2 x measured incremental build footprint on that
 * filesystem. Memory: available >= 8 GiB AND >= 1.5 x measured incremental
 * peak demand. Missing or stale measurement is UNKNOWN (never inferred from
 * host totals). Footprint / peak measurements must be bound to the exact
 * candidate SHA.
 *
 * @param {{
 *   provenance: object,
 *   candidateHead?: string,
 *   filesystems?: Array<{ id: string, mountPoint?: string, roles: string[], availableBytes?: number, measuredAt?: string }>,
 *   buildFootprint?: { candidateHead?: string, bytesByFilesystemId?: Record<string, number>, measuredAt?: string, source?: string } | null,
 *   memory?: { availableBytes?: number, measuredAt?: string } | null,
 *   peakMemoryDemand?: { candidateHead?: string, bytes?: number, measuredAt?: string, source?: string } | null,
 *   preservation?: { priorImages?: Array<{ image: string, present: boolean }>, rollbackImagesPresent?: boolean, postgresVolumePresent?: boolean, unintendedPostgresReplacement?: boolean } | null,
 *   policy?: Partial<typeof CAPACITY_POLICY>,
 *   now?: Date | string,
 * }} observation
 */
export function bindCapacityEvidence(observation) {
  const result = makeResult(BINDER_ID.S7_CAPACITY, observation);
  const unknown = {
    capacity: { diskSufficient: false, memorySufficient: false, priorImagesPreserved: false, unintendedPostgresReplacement: false },
  };
  if (!isObject(observation)) {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MISSING });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, unknown);
  }
  const policy = { ...CAPACITY_POLICY, ...(isObject(observation.policy) ? observation.policy : {}) };
  const now = resolveNow(observation.now);
  const candidateHead = observation.candidateHead;
  let outcome = BINDER_OUTCOME.BOUND;

  // Disk
  const filesystems = (Array.isArray(observation.filesystems) ? observation.filesystems : []).filter(isObject);
  const relevant = filesystems.filter((fs) => Array.isArray(fs.roles) && fs.roles.some((r) => r === "build" || r === "image-store"));
  const footprint = isObject(observation.buildFootprint) ? observation.buildFootprint : null;
  let diskSufficient = relevant.length > 0;
  if (relevant.length === 0) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_FILESYSTEM_UNMEASURED, detail: "no build/image-store filesystem observed" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
    diskSufficient = false;
  }
  if (footprint == null || !isObject(footprint.bytesByFilesystemId)) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_BUILD_FOOTPRINT_UNMEASURED, detail: "measured incremental build footprint not supplied (requires a prior authorised measurement artifact)" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
    diskSufficient = false;
  } else if (!isFullGitSha(candidateHead) || footprint.candidateHead !== candidateHead) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_BUILD_FOOTPRINT_MISBOUND, detail: "footprint measurement is not bound to the exact candidate SHA" });
    outcome = BINDER_OUTCOME.BLOCKED;
    diskSufficient = false;
  } else if (!isFresh(footprint.measuredAt, policy.measurementArtifactMaxAgeMs, now)) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_MEASUREMENT_STALE, detail: "build footprint artifact stale" });
    outcome = BINDER_OUTCOME.BLOCKED;
    diskSufficient = false;
  }
  const perFilesystem = [];
  for (const fs of relevant) {
    const entry = { id: fs.id, mountPoint: fs.mountPoint ?? null, availableBytes: null, requiredBytes: null, ok: false };
    if (!isNonNegativeNumber(fs.availableBytes)) {
      result.findings.push({ code: BINDER_REASON.CAPACITY_FILESYSTEM_UNMEASURED, detail: fs.id });
      outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
      diskSufficient = false;
      perFilesystem.push(entry);
      continue;
    }
    entry.availableBytes = fs.availableBytes;
    if (!isFresh(fs.measuredAt, policy.snapshotMaxAgeMs, now)) {
      result.findings.push({ code: BINDER_REASON.CAPACITY_MEASUREMENT_STALE, detail: `${fs.id} availability snapshot` });
      outcome = BINDER_OUTCOME.BLOCKED;
      diskSufficient = false;
    }
    if (fs.availableBytes < policy.diskFloorBytes) {
      result.findings.push({ code: BINDER_REASON.CAPACITY_DISK_BELOW_FLOOR, detail: fs.id });
      outcome = BINDER_OUTCOME.BLOCKED;
      diskSufficient = false;
    }
    const measured = footprint?.bytesByFilesystemId?.[fs.id];
    if (footprint && isObject(footprint.bytesByFilesystemId)) {
      if (!isNonNegativeNumber(measured)) {
        result.findings.push({ code: BINDER_REASON.CAPACITY_BUILD_FOOTPRINT_UNMEASURED, detail: fs.id });
        outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
        diskSufficient = false;
      } else {
        entry.requiredBytes = Math.max(policy.diskFloorBytes, measured * policy.diskHeadroomFactor);
        if (fs.availableBytes < measured * policy.diskHeadroomFactor) {
          result.findings.push({ code: BINDER_REASON.CAPACITY_DISK_BELOW_HEADROOM, detail: fs.id });
          outcome = BINDER_OUTCOME.BLOCKED;
          diskSufficient = false;
        }
      }
    }
    entry.ok = entry.requiredBytes != null && fs.availableBytes >= entry.requiredBytes;
    perFilesystem.push(entry);
  }

  // Memory
  const memory = isObject(observation.memory) ? observation.memory : null;
  const peak = isObject(observation.peakMemoryDemand) ? observation.peakMemoryDemand : null;
  let memorySufficient = true;
  if (!memory || !isNonNegativeNumber(memory.availableBytes)) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_MEMORY_UNMEASURED, detail: "MemAvailable not observed" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
    memorySufficient = false;
  } else {
    if (!isFresh(memory.measuredAt, policy.snapshotMaxAgeMs, now)) {
      result.findings.push({ code: BINDER_REASON.CAPACITY_MEASUREMENT_STALE, detail: "memory availability snapshot" });
      outcome = BINDER_OUTCOME.BLOCKED;
      memorySufficient = false;
    }
    if (memory.availableBytes < policy.memoryFloorBytes) {
      result.findings.push({ code: BINDER_REASON.CAPACITY_MEMORY_BELOW_FLOOR });
      outcome = BINDER_OUTCOME.BLOCKED;
      memorySufficient = false;
    }
  }
  if (!peak || !isNonNegativeNumber(peak.bytes)) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_PEAK_DEMAND_UNMEASURED, detail: "measured incremental peak memory demand not supplied" });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
    memorySufficient = false;
  } else if (!isFullGitSha(candidateHead) || peak.candidateHead !== candidateHead) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_BUILD_FOOTPRINT_MISBOUND, detail: "peak demand measurement is not bound to the exact candidate SHA" });
    outcome = BINDER_OUTCOME.BLOCKED;
    memorySufficient = false;
  } else if (!isFresh(peak.measuredAt, policy.measurementArtifactMaxAgeMs, now)) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_MEASUREMENT_STALE, detail: "peak demand artifact stale" });
    outcome = BINDER_OUTCOME.BLOCKED;
    memorySufficient = false;
  } else if (memory && isNonNegativeNumber(memory.availableBytes) && memory.availableBytes < peak.bytes * policy.memoryHeadroomFactor) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_MEMORY_BELOW_HEADROOM });
    outcome = BINDER_OUTCOME.BLOCKED;
    memorySufficient = false;
  }

  // Preservation
  const preservation = isObject(observation.preservation) ? observation.preservation : null;
  let priorImagesPreserved = false;
  let unintendedPostgresReplacement = false;
  if (!preservation) {
    result.findings.push({ code: BINDER_REASON.CAPACITY_PRESERVATION_UNKNOWN });
    outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
  } else {
    const priorImages = Array.isArray(preservation.priorImages) ? preservation.priorImages : null;
    const imagesOk = priorImages != null && priorImages.length > 0 && priorImages.every((i) => isObject(i) && i.present === true);
    if (priorImages == null || preservation.rollbackImagesPresent == null || preservation.postgresVolumePresent == null || preservation.unintendedPostgresReplacement == null) {
      result.findings.push({ code: BINDER_REASON.CAPACITY_PRESERVATION_UNKNOWN, detail: "preservation facts incomplete" });
      outcome = worst(outcome, BINDER_OUTCOME.UNKNOWN);
    }
    unintendedPostgresReplacement = preservation.unintendedPostgresReplacement === true;
    priorImagesPreserved = imagesOk && preservation.rollbackImagesPresent === true && preservation.postgresVolumePresent === true;
    if (unintendedPostgresReplacement || preservation.rollbackImagesPresent === false || preservation.postgresVolumePresent === false || (priorImages != null && !imagesOk)) {
      result.findings.push({ code: BINDER_REASON.CAPACITY_PRESERVATION_VIOLATED });
      outcome = BINDER_OUTCOME.BLOCKED;
      priorImagesPreserved = false;
    }
  }

  const bound = outcome === BINDER_OUTCOME.BOUND;
  return finalize(
    result,
    outcome,
    {
      capacity: {
        diskSufficient: bound && diskSufficient,
        memorySufficient: bound && memorySufficient,
        priorImagesPreserved: bound && priorImagesPreserved,
        unintendedPostgresReplacement,
      },
    },
    { policy, perFilesystem, memoryAvailableBytes: memory?.availableBytes ?? null, peakDemandBytes: peak?.bytes ?? null },
  );
}

/* ----------------------------------------------------------------------- */
/* S8 PostgreSQL init                                                       */
/* ----------------------------------------------------------------------- */

/**
 * S8 — bind PostgreSQL init-mount identity evidence.
 *
 * `gitTreeManifest` is collected from the exact candidate git tree (read-only
 * `git ls-tree` / `cat-file`), `candidateManifest` from the checkout's
 * working directory, and `disposition` from
 * `resolvePostgresInitDisposition` against the active mount. Any drift
 * between the three identities is BLOCKED; nothing here replaces containers
 * or data.
 *
 * @param {{
 *   provenance: object,
 *   disposition?: { disposition: string, reasonCode?: string, contentDigest?: string, preserveMountSource?: string | null } | null,
 *   candidateManifest?: { ok: boolean, digest?: string, reasonCode?: string } | null,
 *   gitTreeManifest?: { ok: boolean, digest?: string, reasonCode?: string } | null,
 * }} observation
 */
export function bindPostgresInitEvidence(observation) {
  const result = makeResult(BINDER_ID.S8_POSTGRES_INIT, observation);
  const unknown = (reasonCode = "POSTGRES_INIT_PROBE_NOT_RUN") => ({
    postgresInit: { disposition: POSTGRES_INIT_DISPOSITION.UNKNOWN, reasonCode },
  });
  if (!isObject(observation)) {
    result.findings.push({ code: BINDER_REASON.OBSERVATION_MISSING });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, unknown());
  }
  const disposition = isObject(observation.disposition) ? observation.disposition : null;
  if (!disposition || !Object.values(POSTGRES_INIT_DISPOSITION).includes(disposition.disposition)) {
    result.findings.push({ code: BINDER_REASON.POSTGRES_INIT_DISPOSITION_MISSING });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, unknown());
  }
  const gitTree = isObject(observation.gitTreeManifest) ? observation.gitTreeManifest : null;
  const candidate = isObject(observation.candidateManifest) ? observation.candidateManifest : null;
  if (!gitTree?.ok || !candidate?.ok || !nonEmptyString(gitTree.digest) || !nonEmptyString(candidate.digest)) {
    result.findings.push({ code: BINDER_REASON.POSTGRES_INIT_CANDIDATE_TREE_DRIFT, detail: "init manifests from git tree and working tree must both be readable" });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, unknown(gitTree?.reasonCode ?? candidate?.reasonCode ?? POSTGRES_INIT_REASON.UNREADABLE));
  }
  if (gitTree.digest !== candidate.digest) {
    result.findings.push({ code: BINDER_REASON.POSTGRES_INIT_CANDIDATE_TREE_DRIFT, detail: "working-tree init content differs from exact git tree" });
    return finalize(result, BINDER_OUTCOME.BLOCKED, {
      postgresInit: { disposition: POSTGRES_INIT_DISPOSITION.BLOCK, reasonCode: BINDER_REASON.POSTGRES_INIT_CANDIDATE_TREE_DRIFT },
    });
  }
  if (disposition.disposition === POSTGRES_INIT_DISPOSITION.UNKNOWN) {
    result.findings.push({ code: BINDER_REASON.POSTGRES_INIT_NOT_PRESERVABLE, detail: disposition.reasonCode });
    return finalize(result, BINDER_OUTCOME.UNKNOWN, { postgresInit: { disposition: POSTGRES_INIT_DISPOSITION.UNKNOWN, reasonCode: disposition.reasonCode } });
  }
  if (disposition.disposition === POSTGRES_INIT_DISPOSITION.BLOCK) {
    result.findings.push({ code: BINDER_REASON.POSTGRES_INIT_NOT_PRESERVABLE, detail: disposition.reasonCode });
    return finalize(result, BINDER_OUTCOME.BLOCKED, { postgresInit: { disposition: POSTGRES_INIT_DISPOSITION.BLOCK, reasonCode: disposition.reasonCode } });
  }
  // PRESERVE: the active mount digest must equal the exact git-tree digest.
  if (disposition.contentDigest !== gitTree.digest) {
    result.findings.push({ code: BINDER_REASON.POSTGRES_INIT_DIGEST_MISBOUND, detail: "PRESERVE disposition digest does not match exact git tree digest" });
    return finalize(result, BINDER_OUTCOME.BLOCKED, {
      postgresInit: { disposition: POSTGRES_INIT_DISPOSITION.BLOCK, reasonCode: BINDER_REASON.POSTGRES_INIT_DIGEST_MISBOUND },
    });
  }
  return finalize(
    result,
    BINDER_OUTCOME.BOUND,
    { postgresInit: { disposition: POSTGRES_INIT_DISPOSITION.PRESERVE, reasonCode: disposition.reasonCode } },
    { contentDigest: gitTree.digest, preserveMountSource: disposition.preserveMountSource ?? null },
  );
}

/* ----------------------------------------------------------------------- */
/* Aggregate                                                                */
/* ----------------------------------------------------------------------- */

/**
 * Runtime identity is required by the engine but is not one of S1..S8.
 * Pass through `probeStagingRuntimeIdentity`-shaped output with provenance.
 */
function bindRuntimePassThrough(observation) {
  const provenance = normalizeProvenance(observation?.provenance);
  if (!isObject(observation)) {
    return { provenance, evidence: { runtime: { evidenceComplete: false, identityUnknown: true } } };
  }
  return {
    provenance,
    evidence: {
      runtime: {
        evidenceComplete: observation.evidenceComplete === true,
        identityUnknown: observation.identityUnknown === true,
        podmanRootless: observation.podmanRootless === true,
        composeProject: observation.composeProject ?? null,
        postgresContainer: observation.postgresContainer ?? null,
        postgresVolume: observation.postgresVolume ?? null,
        unexpectedTarget: observation.unexpectedTarget,
      },
    },
  };
}

/**
 * Bind all sections into one engine-shaped evidence object plus binder report.
 *
 * @param {{
 *   source?: object, publishing?: object, configuration?: object, database?: object,
 *   recovery?: object, security?: object, capacity?: object, postgresInit?: object, runtime?: object,
 * }} observations
 */
export function bindStagingPreflightEvidence(observations = {}) {
  const o = isObject(observations) ? observations : {};
  const binders = {
    [BINDER_ID.S1_SOURCE]: bindSourceEvidence(o.source),
    [BINDER_ID.S2_PUBLISHING]: bindPublishingEvidence(o.publishing),
    [BINDER_ID.S3_CONFIGURATION]: bindConfigurationEvidence(o.configuration),
    [BINDER_ID.S4_DATABASE]: bindDatabaseEvidence(o.database),
    [BINDER_ID.S5_RECOVERY]: bindRecoveryEvidence(o.recovery),
    [BINDER_ID.S6_SECURITY]: bindSecurityEvidence(o.security),
    [BINDER_ID.S7_CAPACITY]: bindCapacityEvidence(o.capacity),
    [BINDER_ID.S8_POSTGRES_INIT]: bindPostgresInitEvidence(o.postgresInit),
  };
  const runtime = bindRuntimePassThrough(o.runtime);

  const evidence = {};
  for (const bound of Object.values(binders)) {
    Object.assign(evidence, bound.evidence);
  }
  Object.assign(evidence, runtime.evidence);

  const provenanceByBinder = Object.fromEntries(Object.entries(binders).map(([id, b]) => [id, b.provenance]));
  provenanceByBinder.RUNTIME = runtime.provenance;
  const nonGenuine = Object.entries(provenanceByBinder)
    .filter(([, p]) => !isGenuineProvenance(p))
    .map(([id]) => id);
  const synthetic = Object.entries(provenanceByBinder)
    .filter(([, p]) => p.kind === EVIDENCE_PROVENANCE.SYNTHETIC)
    .map(([id]) => id);

  return Object.freeze({
    evidence,
    binders,
    runtime,
    provenance: {
      byBinder: provenanceByBinder,
      nonGenuine,
      synthetic,
      genuine: nonGenuine.length === 0,
    },
  });
}

/**
 * Decide using the authoritative engine, then apply the genuineness guard.
 * `STAGING_PREFLIGHT_PASS = ESTABLISHED` requires engine PASS AND every
 * binder BOUND AND every section genuinely provenanced. Synthetic fixtures
 * can never reach ESTABLISHED.
 *
 * @param {ReturnType<typeof bindStagingPreflightEvidence>} bound
 * @param {{ evaluate?: typeof evaluateStagingDeployPreflight }} [deps]
 */
export function decideBoundStagingPreflight(bound, deps = {}) {
  const evaluate = deps.evaluate ?? evaluateStagingDeployPreflight;
  const decision = evaluate(bound?.evidence);
  const reasons = [];
  if (decision.outcome !== PREFLIGHT_OUTCOME.PASS) {
    reasons.push(`ENGINE_${decision.outcome}`);
  }
  const notBound = Object.values(bound?.binders ?? {}).filter((b) => b.outcome !== BINDER_OUTCOME.BOUND).map((b) => `${b.binder}=${b.outcome}`);
  if (notBound.length > 0) reasons.push(`BINDERS_NOT_BOUND:${notBound.join(",")}`);
  if (bound?.provenance?.synthetic?.length > 0) {
    reasons.push(`SYNTHETIC_PROVENANCE:${bound.provenance.synthetic.join(",")}`);
  }
  if (bound?.provenance?.genuine !== true) {
    reasons.push(`NON_GENUINE_PROVENANCE:${(bound?.provenance?.nonGenuine ?? ["ALL"]).join(",")}`);
  }
  const stagingPreflightPass = reasons.length === 0 ? STAGING_PREFLIGHT_PASS.ESTABLISHED : STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED;
  return Object.freeze({ decision, stagingPreflightPass, reasons, binders: bound?.binders ?? {}, provenance: bound?.provenance ?? null });
}

/**
 * Throws unless genuine staging readiness is ESTABLISHED. Use at any boundary
 * that would otherwise treat an engine PASS as operational authorization.
 */
export function assertGenuineStagingReadiness(result) {
  if (result?.stagingPreflightPass !== STAGING_PREFLIGHT_PASS.ESTABLISHED) {
    const error = new Error(
      `STAGING_PREFLIGHT_PASS NOT_ESTABLISHED: ${Array.isArray(result?.reasons) ? result.reasons.join("; ") : "no decision"}`,
    );
    error.name = "StagingReadinessNotEstablishedError";
    throw error;
  }
}

/** Human/CI readable report lines (no secret values are ever present in binder output). */
export function formatBinderReport(result) {
  const lines = [];
  for (const bound of Object.values(result.binders ?? {})) {
    lines.push(`BINDER ${bound.binder} ${bound.outcome} provenance=${bound.provenance.kind}`);
    for (const finding of bound.findings) {
      lines.push(`BINDER_FINDING ${bound.binder} ${finding.code}${finding.detail ? ` ${finding.detail}` : ""}`);
    }
  }
  lines.push(`STAGING_DEPLOY_PREFLIGHT ${result.decision.outcome}`);
  for (const finding of result.decision.findings) {
    lines.push(`STAGING_DEPLOY_PREFLIGHT_REASON ${finding.code}${finding.detail ? ` ${finding.detail}` : ""}`);
  }
  lines.push(`STAGING_PREFLIGHT_PASS ${result.stagingPreflightPass}`);
  for (const reason of result.reasons) lines.push(`STAGING_PREFLIGHT_PASS_REASON ${reason}`);
  return lines;
}
