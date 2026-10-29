/**
 * Staging recovery-proof adapter.
 *
 * IMP-037 can qualify a backup chain. It cannot yet bind a verified isolated
 * restore to this staging database, volume, candidate, and rollback plan.
 * This adapter therefore keeps RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY.
 * Supplied records, backup-success files, and synthetic fixtures cannot clear it.
 */
import { evaluateQualifyingRecoveryProof } from "../recovery/evidence.mjs";
import { ENVIRONMENT_CLASSIFICATION } from "../recovery/constants.mjs";

export const STAGING_RECOVERY_BINDING = "RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY";

export const STAGING_RECOVERY_BINDING_BLOCKERS = Object.freeze([
  "STAGING_EVIDENCE_ROOT_UNNAMED",
  "STAGING_DATABASE_VOLUME_IDENTITY_UNBOUND",
  "ISOLATED_RESTORE_TARGET_UNBOUND",
  "ROLLBACK_SUITABILITY_UNDECIDED",
  "STAGING_FRESHNESS_WINDOW_UNDECIDED",
  "CANDIDATE_COMPATIBILITY_RULE_UNDECIDED",
  "LEDGER_STATE_MAPPING_UNDECIDED",
]);

/**
 * @param {unknown[] | undefined} records
 */
export function countQualifyingStagingRecords(records) {
  if (!Array.isArray(records)) return 0;
  return records.filter((record) => {
    const result = evaluateQualifyingRecoveryProof(record);
    if (!result.ok || record == null || typeof record !== "object") return false;
    return (
      /** @type {{ sourceEnvironmentClassification?: string }} */ (record).sourceEnvironmentClassification ===
      ENVIRONMENT_CLASSIFICATION.STAGING
    );
  }).length;
}

/**
 * Always fail-closed. `records` are counted for diagnostics and cannot clear the dependency.
 * @param {{ records?: unknown[] }} [input]
 */
export function bindStagingRecoveryEvidence(input = {}) {
  return {
    bindingDesignDependency: true,
    binding: STAGING_RECOVERY_BINDING,
    checkpointPresent: false,
    integrityVerified: false,
    restoreProofPresent: false,
    recoveryPointIdentifiable: false,
    rollbackPlanSuitable: false,
    stagingBound: false,
    freshnessOk: false,
    evidenceRecords: [],
    observedQualifyingStagingRecords: countQualifyingStagingRecords(input.records),
    bindingBlockers: [...STAGING_RECOVERY_BINDING_BLOCKERS],
  };
}
