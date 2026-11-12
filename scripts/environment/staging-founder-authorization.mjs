/**
 * Auditable Founder authorization for staging Phase A / recovery binding.
 *
 * Authorization is a signed-by-presence JSON decision record bound to the exact
 * authorized environment. An arbitrary CLI flag is not accepted as authority.
 * Absence of the record keeps initialProvisionAuthorized=false.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  selectStagingRecoveryBindingPolicy,
  STAGING_RECOVERY_BINDING_RECOMMENDATIONS,
} from "./staging-recovery-binding-policy.mjs";

export const STAGING_FOUNDER_AUTHORIZATION_SCHEMA = "boba-staging-founder-auth-v1";

export const DEFAULT_STAGING_FOUNDER_AUTHORIZATION_PATH =
  "/home/ajoshi/.local/state/boba-bear/staging-founder-authorization.json";

export const STAGING_AUTHORIZED_ENVIRONMENT = Object.freeze({
  repositoryPath: "/home/ajoshi/repos/boba-bear-platform",
  composeProject: "boba-staging",
  postgresVolume: "boba-staging_postgres-data",
  postgresContainer: "boba-staging_postgres_1",
});

export const FOUNDER_DECISION_VALUES = Object.freeze({
  DECISION_1: Object.freeze(["LOCAL_UAT_AD_PF_01", "STRICT_STAGING_D2_NOW"]),
  DECISION_2: Object.freeze(["PHASE_A_CREATE_AUTHORIZED", "PHASE_A_DEFER"]),
  DECISION_3: Object.freeze(["RECOVERY_BINDING_ACCEPT_RECOMMENDED", "RECOVERY_BINDING_DEFER"]),
  DECISION_4: Object.freeze(["TLS_TOKEN_AFTER_D2_VERIFY", "N/A_LOCAL_UAT"]),
  DECISION_5: Object.freeze([
    "PAUSE_XR_FOR_CAPACITY",
    "OTHER_FREE_RAM",
    "WAIVE_8GIB_FLOOR_NOT_RECOMMENDED",
  ]),
});

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/**
 * @param {unknown} raw
 * @param {{
 *   expectedEnvironment?: typeof STAGING_AUTHORIZED_ENVIRONMENT,
 * }} [options]
 */
export function evaluateStagingFounderAuthorization(raw, options = {}) {
  const expected = options.expectedEnvironment ?? STAGING_AUTHORIZED_ENVIRONMENT;
  if (!isObject(raw)) {
    return {
      present: false,
      valid: false,
      initialProvisionAuthorized: false,
      recoveryBindingRecommendedAccepted: false,
      localUatSelected: false,
      pauseXrForCapacity: false,
      reasons: ["FOUNDER_AUTHORIZATION_ABSENT"],
      decisions: null,
      authorizedEnvironment: null,
    };
  }

  /** @type {string[]} */
  const reasons = [];
  if (raw.schemaVersion !== STAGING_FOUNDER_AUTHORIZATION_SCHEMA) {
    reasons.push("FOUNDER_AUTHORIZATION_SCHEMA_INVALID");
  }
  if (raw.attestation !== "FOUNDER_EXPLICIT_APPROVAL") {
    reasons.push("FOUNDER_ATTESTATION_MISSING");
  }
  if (typeof raw.authorizedAt !== "string" || !Number.isFinite(Date.parse(raw.authorizedAt))) {
    reasons.push("FOUNDER_AUTHORIZED_AT_INVALID");
  }

  const env = isObject(raw.authorizedEnvironment) ? raw.authorizedEnvironment : null;
  if (!env) {
    reasons.push("FOUNDER_AUTHORIZED_ENVIRONMENT_MISSING");
  } else {
    for (const key of ["repositoryPath", "composeProject", "postgresVolume", "postgresContainer"]) {
      if (env[key] !== expected[key]) {
        reasons.push("FOUNDER_AUTHORIZED_ENVIRONMENT_MISMATCH");
        break;
      }
    }
  }

  const decisions = isObject(raw.decisions) ? raw.decisions : null;
  if (!decisions) {
    reasons.push("FOUNDER_DECISIONS_MISSING");
  } else {
    for (const [key, allowed] of Object.entries(FOUNDER_DECISION_VALUES)) {
      const value = decisions[key];
      if (typeof value !== "string" || !allowed.includes(value)) {
        reasons.push(`FOUNDER_${key}_INVALID`);
      }
    }
  }

  const valid = reasons.length === 0;
  const decisionMap = valid && decisions ? decisions : null;
  return {
    present: true,
    valid,
    initialProvisionAuthorized: valid && decisionMap?.DECISION_2 === "PHASE_A_CREATE_AUTHORIZED",
    recoveryBindingRecommendedAccepted:
      valid && decisionMap?.DECISION_3 === "RECOVERY_BINDING_ACCEPT_RECOMMENDED",
    localUatSelected: valid && decisionMap?.DECISION_1 === "LOCAL_UAT_AD_PF_01",
    pauseXrForCapacity: valid && decisionMap?.DECISION_5 === "PAUSE_XR_FOR_CAPACITY",
    reasons,
    decisions: decisionMap,
    authorizedEnvironment: valid ? expected : null,
    authorizedAt: valid ? raw.authorizedAt : null,
    path: typeof raw.path === "string" ? raw.path : null,
  };
}

/**
 * @param {{
 *   authorizationPath?: string,
 *   exists?: (path: string) => boolean,
 *   readFile?: (path: string, encoding: string) => string,
 *   expectedEnvironment?: typeof STAGING_AUTHORIZED_ENVIRONMENT,
 * }} [deps]
 */
export function loadStagingFounderAuthorization(deps = {}) {
  const authorizationPath = deps.authorizationPath ?? DEFAULT_STAGING_FOUNDER_AUTHORIZATION_PATH;
  const exists = deps.exists ?? existsSync;
  const readFile = deps.readFile ?? readFileSync;
  if (!exists(authorizationPath)) {
    return evaluateStagingFounderAuthorization(null);
  }
  try {
    const raw = JSON.parse(readFile(authorizationPath, "utf8"));
    const evaluated = evaluateStagingFounderAuthorization(raw, {
      expectedEnvironment: deps.expectedEnvironment,
    });
    return { ...evaluated, path: authorizationPath };
  } catch (error) {
    return {
      present: true,
      valid: false,
      initialProvisionAuthorized: false,
      recoveryBindingRecommendedAccepted: false,
      localUatSelected: false,
      pauseXrForCapacity: false,
      reasons: ["FOUNDER_AUTHORIZATION_UNREADABLE"],
      decisions: null,
      authorizedEnvironment: null,
      detail: error instanceof Error ? error.message : "authorization unreadable",
      path: authorizationPath,
    };
  }
}

/**
 * Build a recovery binding policy from Founder-recommended selections.
 * Volume system identity must still be the independently observed live value;
 * it is never invented here.
 * @param {{
 *   volumeSystemIdentity?: string | null,
 *   evidenceRootPath?: string,
 * }} [input]
 */
export function buildRecommendedRecoveryBindingPolicy(input = {}) {
  const volumeSystemIdentity =
    typeof input.volumeSystemIdentity === "string" ? input.volumeSystemIdentity.trim() : "";
  if (!volumeSystemIdentity || volumeSystemIdentity.length < 8) {
    return null;
  }
  return selectStagingRecoveryBindingPolicy({
    evidenceRootPath:
      input.evidenceRootPath ?? STAGING_RECOVERY_BINDING_RECOMMENDATIONS.evidenceRoot,
    volumeSystemIdentity,
    freshness: STAGING_RECOVERY_BINDING_RECOMMENDATIONS.freshnessWindow,
    ledgerMapping: STAGING_RECOVERY_BINDING_RECOMMENDATIONS.ledgerStateMapping,
  });
}

/**
 * @param {string} authorizationPath
 */
export function founderAuthorizationRelativeHint(authorizationPath = DEFAULT_STAGING_FOUNDER_AUTHORIZATION_PATH) {
  return path.resolve(authorizationPath);
}
