/**
 * Staging recovery-proof adapter.
 *
 * Default live binding remains DESIGN_DEPENDENCY until Founder selections are
 * present AND an independently qualified staging restore checkpoint passes.
 * Supplied records, backup-success files, and synthetic fixtures cannot clear
 * unresolved policy blockers.
 */
import { evaluateQualifyingRecoveryProof } from "../recovery/evidence.mjs";
import { ENVIRONMENT_CLASSIFICATION } from "../recovery/constants.mjs";
import {
  defaultStagingRecoveryBindingPolicy,
  listUnresolvedRecoveryBindingBlockers,
} from "./staging-recovery-binding-policy.mjs";
import { evaluateStagingRecoveryChain } from "./staging-recovery-checkpoint.mjs";

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
 * Remaining Founder decisions when the live default policy is unbound.
 * A qualifying backup record cannot clear these.
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

function designDependencyResult(extra = {}) {
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
    operationalAuthority: false,
    ...extra,
  };
}

/**
 * Fail-closed binder. Policy defaults keep DESIGN_DEPENDENCY.
 * @param {{
 *   records?: unknown[],
 *   policy?: ReturnType<typeof defaultStagingRecoveryBindingPolicy>,
 *   checkpointObservation?: object,
 *   now?: Date | string | number,
 *   evaluateCheckpoint?: typeof evaluateStagingRecoveryChain,
 * }} [input]
 */
export function bindStagingRecoveryEvidence(input = {}) {
  const policy = input.policy ?? defaultStagingRecoveryBindingPolicy();
  const blockers = listUnresolvedRecoveryBindingBlockers(policy);
  const observedQualifyingStagingRecords = countQualifyingStagingRecords(input.records);

  if (blockers.length > 0) {
    return designDependencyResult({
      observedQualifyingStagingRecords,
      bindingBlockers: blockers,
      specifiedContracts: [...STAGING_RECOVERY_SPECIFIED_CONTRACTS],
      policySelections: {
        evidenceRoot: policy.evidenceRoot.status,
        databaseVolumeIdentity: policy.databaseVolumeIdentity.status,
        freshnessWindow: policy.freshnessWindow.status,
        ledgerStateMapping: policy.ledgerStateMapping.status,
      },
    });
  }

  const evaluateCheckpoint = input.evaluateCheckpoint ?? evaluateStagingRecoveryChain;
  let checkpoint;
  try {
    checkpoint = evaluateCheckpoint({
      records: input.records ?? [],
      observation: input.checkpointObservation,
      now: input.now,
    });
  } catch (error) {
    return designDependencyResult({
      observedQualifyingStagingRecords,
      bindingBlockers: ["CHECKPOINT_EVALUATION_FAILED"],
      specifiedContracts: [...STAGING_RECOVERY_SPECIFIED_CONTRACTS],
      detail: error instanceof Error ? error.message : "checkpoint evaluation failed",
    });
  }

  const qualified = checkpoint?.outcome === "PASS" && checkpoint?.isolatedQualification === "PASS";
  if (!qualified) {
    return designDependencyResult({
      observedQualifyingStagingRecords,
      bindingBlockers: checkpoint?.reasonCodes?.length
        ? checkpoint.reasonCodes
        : ["CHECKPOINT_NOT_QUALIFIED"],
      specifiedContracts: [...STAGING_RECOVERY_SPECIFIED_CONTRACTS],
      checkpointOutcome: checkpoint?.outcome ?? "BLOCKED",
    });
  }

  return {
    bindingDesignDependency: false,
    binding: "RECOVERY_PROOF_BINDING = STAGING_CHECKPOINT_QUALIFIED",
    checkpointPresent: true,
    integrityVerified: true,
    restoreProofPresent: true,
    recoveryPointIdentifiable: true,
    rollbackPlanSuitable: true,
    stagingBound: true,
    freshnessOk: true,
    evidenceRecords: Array.isArray(input.records) ? input.records : [],
    checkpointObservation: input.checkpointObservation ?? null,
    observedQualifyingStagingRecords,
    bindingBlockers: [],
    specifiedContracts: [...STAGING_RECOVERY_SPECIFIED_CONTRACTS],
    operationalAuthority: false,
    checkpointOutcome: "PASS",
    selectedEvidenceRoot: policy.evidenceRoot.path,
    selectedVolumeSystemIdentity: policy.databaseVolumeIdentity.systemIdentity,
  };
}
