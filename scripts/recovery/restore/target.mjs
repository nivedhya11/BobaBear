/**
 * Fresh unique restore-target provisioning helpers (IMP-037 §11).
 * Never restore into production PGDATA; no --force-production escape hatch.
 */
import { ENVIRONMENT_CLASSIFICATION } from "../constants.mjs";
import { evaluateTargetIdentitySafety } from "../identity.mjs";
import { isValidRunId } from "../run-id.mjs";

/**
 * @param {string} runId
 * @returns {string}
 */
export function createRestoreTargetId(runId) {
  if (!isValidRunId(runId)) {
    throw new Error("createRestoreTargetId requires a valid RUN_ID");
  }
  return `recovery-target-${runId}`;
}

/**
 * @param {object} input
 * @param {string} input.sourceIdentity
 * @param {string} input.targetIdentity
 * @param {string} [input.sourceClassification]
 * @param {string} [input.targetClassification]
 * @param {string} [input.targetPgdataPath]
 * @param {boolean} [input.forceProduction]
 * @param {boolean} [input.reuseExistingTarget]
 * @returns {{ ok: true, targetIdentity: string } | { ok: false, reason: string, code: string }}
 */
export function assertFreshTarget(input) {
  if (input?.forceProduction === true) {
    return {
      ok: false,
      code: "FORCE_PRODUCTION_FORBIDDEN",
      reason: "--force-production and equivalent overrides are forbidden",
    };
  }
  if (input?.reuseExistingTarget === true) {
    return {
      ok: false,
      code: "TARGET_REUSE_FORBIDDEN",
      reason: "restore must provision a fresh unique target; reuse is forbidden",
    };
  }

  const targetClassification = input.targetClassification ?? ENVIRONMENT_CLASSIFICATION.RECOVERY;
  // CS3: never silently default source classification to production.
  const safety = evaluateTargetIdentitySafety({
    sourceIdentity: input.sourceIdentity,
    targetIdentity: input.targetIdentity,
    sourceClassification: input.sourceClassification,
    targetClassification,
    targetPgdataPath: input.targetPgdataPath,
    composeProjectName: input.composeProjectName,
    claimedRuntimeEnv: input.claimedRuntimeEnv,
  });
  if (!safety.allowed) {
    return { ok: false, code: safety.code, reason: safety.reason };
  }
  return { ok: true, targetIdentity: String(input.targetIdentity) };
}
