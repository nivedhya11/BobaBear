/**
 * Staging recovery-proof adapter.
 *
 * IMP-037 can qualify a backup chain. The checkpoint qualifier can assess an
 * isolated evidence root. This live adapter still keeps
 * RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY until the remaining Founder
 * decisions are made and an authorized batch records real proof.
 * Supplied records, backup-success files, and synthetic fixtures cannot clear it.
 */
import { evaluateQualifyingRecoveryProof } from "../recovery/evidence.mjs";
import { ENVIRONMENT_CLASSIFICATION } from "../recovery/constants.mjs";

export const STAGING_RECOVERY_BINDING = "RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY";

/**
 * Rules already fixed by IMP-037 and strict staging. They are enforced by the
 * checkpoint qualifier and are not remaining Founder decisions.
 */
export const STAGING_RECOVERY_SPECIFIED_CONTRACTS = Object.freeze([
  "BOTH_IMP037_LAYERS_REQUIRED",
  "ISOLATED_RESTORE_TARGET_RULE",
  "ROLLBACK_SUITABILITY_RULE",
  "CANDIDATE_SHA_TREE_COMPATIBILITY_RULE",
  "LOCKED_FRESHNESS_LIMITS_REUSED",
]);

/**
 * Remaining Founder decisions. A qualifying backup record cannot clear these.
 * The live cluster system identifier is not invented here.
 */
export const STAGING_RECOVERY_BINDING_BLOCKERS = Object.freeze([
  "STAGING_EVIDENCE_ROOT_UNNAMED",
  "STAGING_DATABASE_VOLUME_IDENTITY_UNBOUND",
  "STAGING_FRESHNESS_WINDOW_UNDECIDED",
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
    specifiedContracts: [...STAGING_RECOVERY_SPECIFIED_CONTRACTS],
  };
}
