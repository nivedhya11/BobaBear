/**
 * Staging recovery-proof adapter.
 *
 * Default live binding remains DESIGN_DEPENDENCY until Founder selections are
 * present AND an independently qualified staging restore checkpoint passes.
 * Supplied records, backup-success files, and synthetic fixtures cannot clear
 * unresolved policy blockers. A checkpoint from another PostgreSQL cluster or
 * volume identity never clears bindingDesignDependency.
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
  "SELECTED_DATABASE_IDENTITY_MUST_MATCH_CHECKPOINT",
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

export const STAGING_RECOVERY_IDENTITY_BINDING_BLOCKERS = Object.freeze([
  "SELECTED_VOLUME_IDENTITY_MISMATCH",
  "SELECTED_VOLUME_IDENTITY_MISSING_FROM_CHECKPOINT",
  "CHECKPOINT_CLUSTER_SYSTEM_IDENTIFIER_MISSING",
  "CHECKPOINT_SOURCE_IDENTITY_MISSING",
  "CHECKPOINT_VOLUME_IDENTITY_INCONSISTENT",
  "CHECKPOINT_CLUSTER_IDENTITY_INCONSISTENT",
  "UNRELATED_CHECKPOINT_IDENTITY",
  "OPERATOR_SUPPLIED_SUCCESS_ASSERTION",
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
 * Independently observed identity facts from checkpoint observation + records.
 * Never trusts operator-supplied success assertions.
 * @param {{
 *   observation?: Record<string, unknown> | null,
 *   records?: unknown[],
 *   selectedVolumeSystemIdentity?: string | null,
 * }} input
 * @returns {string[]}
 */
export function listRecoveryIdentityBindingBlockers(input = {}) {
  /** @type {string[]} */
  const blockers = [];
  const observation =
    input.observation && typeof input.observation === "object" ? input.observation : null;
  const selected = typeof input.selectedVolumeSystemIdentity === "string"
    ? input.selectedVolumeSystemIdentity.trim()
    : "";

  if (!observation) {
    blockers.push("SELECTED_VOLUME_IDENTITY_MISSING_FROM_CHECKPOINT");
    blockers.push("CHECKPOINT_CLUSTER_SYSTEM_IDENTIFIER_MISSING");
    blockers.push("CHECKPOINT_SOURCE_IDENTITY_MISSING");
    return blockers;
  }

  for (const flag of [
    "qualified",
    "success",
    "checkpointPresent",
    "integrityVerified",
    "restoreProofPresent",
    "recoveryPointIdentifiable",
    "rollbackPlanSuitable",
    "stagingBound",
    "freshnessOk",
    "bindingDesignDependency",
  ]) {
    if (observation[flag] === true || input[flag] === true) {
      blockers.push("OPERATOR_SUPPLIED_SUCCESS_ASSERTION");
      break;
    }
  }

  const observedVolume =
    typeof observation.volumeSystemIdentity === "string" ? observation.volumeSystemIdentity.trim() : "";
  const observedCluster =
    typeof observation.databaseSystemIdentifier === "string"
      ? observation.databaseSystemIdentifier.trim()
      : "";

  if (!selected || !observedVolume) {
    blockers.push("SELECTED_VOLUME_IDENTITY_MISSING_FROM_CHECKPOINT");
  } else if (selected !== observedVolume) {
    blockers.push("SELECTED_VOLUME_IDENTITY_MISMATCH");
  }

  if (!observedCluster) {
    blockers.push("CHECKPOINT_CLUSTER_SYSTEM_IDENTIFIER_MISSING");
  }

  const records = Array.isArray(input.records) ? input.records : [];
  let sawSourceIdentity = false;
  for (const record of records) {
    if (!record || typeof record !== "object") continue;
    const findings = Array.isArray(/** @type {{ findings?: unknown[] }} */ (record).findings)
      ? /** @type {{ findings: unknown[] }} */ (record).findings
      : [];
    const identity = findings.find(
      (entry) => entry && typeof entry === "object" && /** @type {{ code?: string }} */ (entry).code === "STAGING_SOURCE_IDENTITY",
    );
    if (!identity || typeof identity !== "object") {
      blockers.push("CHECKPOINT_SOURCE_IDENTITY_MISSING");
      continue;
    }
    sawSourceIdentity = true;
    const recordVolume =
      typeof /** @type {{ volumeSystemIdentity?: unknown }} */ (identity).volumeSystemIdentity === "string"
        ? String(/** @type {{ volumeSystemIdentity: string }} */ (identity).volumeSystemIdentity).trim()
        : "";
    const recordCluster =
      typeof /** @type {{ databaseSystemIdentifier?: unknown }} */ (identity).databaseSystemIdentifier ===
      "string"
        ? String(/** @type {{ databaseSystemIdentifier: string }} */ (identity).databaseSystemIdentifier).trim()
        : "";
    if (!recordVolume || (observedVolume && recordVolume !== observedVolume)) {
      blockers.push("CHECKPOINT_VOLUME_IDENTITY_INCONSISTENT");
    }
    if (selected && recordVolume && recordVolume !== selected) {
      blockers.push("SELECTED_VOLUME_IDENTITY_MISMATCH");
    }
    if (!recordCluster) {
      blockers.push("CHECKPOINT_CLUSTER_SYSTEM_IDENTIFIER_MISSING");
    } else if (observedCluster && recordCluster !== observedCluster) {
      blockers.push("CHECKPOINT_CLUSTER_IDENTITY_INCONSISTENT");
    }
    const marker =
      typeof /** @type {{ sourceIdentityMarker?: unknown }} */ (record).sourceIdentityMarker === "string"
        ? String(/** @type {{ sourceIdentityMarker: string }} */ (record).sourceIdentityMarker).trim()
        : "";
    if (marker && observedCluster && marker !== observedCluster) {
      blockers.push("UNRELATED_CHECKPOINT_IDENTITY");
    }
  }
  if (records.length > 0 && !sawSourceIdentity) {
    blockers.push("CHECKPOINT_SOURCE_IDENTITY_MISSING");
  }

  return [...new Set(blockers)];
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

  const identityBlockers = listRecoveryIdentityBindingBlockers({
    observation: input.checkpointObservation,
    records: input.records ?? [],
    selectedVolumeSystemIdentity: policy.databaseVolumeIdentity.systemIdentity,
  });
  if (identityBlockers.length > 0) {
    return designDependencyResult({
      observedQualifyingStagingRecords,
      bindingBlockers: identityBlockers,
      specifiedContracts: [...STAGING_RECOVERY_SPECIFIED_CONTRACTS],
      checkpointOutcome: "PASS",
      detail: "qualified checkpoint does not prove recovery of the selected staging database identity",
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
    observedDatabaseSystemIdentifier:
      typeof input.checkpointObservation?.databaseSystemIdentifier === "string"
        ? input.checkpointObservation.databaseSystemIdentifier
        : null,
  };
}
