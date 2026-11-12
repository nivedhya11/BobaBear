import assert from "node:assert/strict";
import { test } from "node:test";

import { bindStagingRecoveryEvidence, STAGING_RECOVERY_BINDING_BLOCKERS } from "./staging-recovery-binding.mjs";
import { selectStagingRecoveryBindingPolicy } from "./staging-recovery-binding-policy.mjs";
import { syntheticIsolatedCheckpointFixture } from "./staging-recovery-checkpoint.mjs";
import { evaluateQualifyingRecoveryProof } from "../recovery/evidence.mjs";

function qualifyingStagingRecord() {
  return {
    schemaVersion: "imp037-evidence-v1",
    runId: "20260101T000000Z-0123456789abcdef",
    operationType: "layer2-logical-backup",
    recoveryLayer: "LAYER_2",
    status: "SUCCEEDED",
    readiness: "READY",
    startedAt: "2026-01-01T00:00:00.000Z",
    endedAt: "2026-01-01T00:01:00.000Z",
    candidate: { commitSha: "a".repeat(40), repositoryPath: "/home/ajoshi/repos/boba-bear-platform" },
    sourceEnvironmentClassification: "staging",
    sourceIdentityMarker: "boba-staging",
    recoveryArtifactReference: "synthetic-artifact",
    recoveryPoint: "synthetic-point",
    checksumIntegrityStatus: "MATCHED",
    validationResults: [{ code: "REMOTE_STORED_ARTIFACT_VERIFIED" }, { code: "LAYER2_COMPLETE" }],
    incomplete: false,
  };
}

test("a qualifying staging record still cannot clear the design dependency", () => {
  const record = qualifyingStagingRecord();
  assert.equal(evaluateQualifyingRecoveryProof(record).ok, true);
  const bound = bindStagingRecoveryEvidence({ records: [record] });
  assert.equal(bound.bindingDesignDependency, true);
  assert.match(bound.binding, /DESIGN_DEPENDENCY/);
  assert.equal(bound.observedQualifyingStagingRecords, 1);
  assert.deepEqual(bound.evidenceRecords, []);
  assert.equal(bound.restoreProofPresent, false);
  assert.equal(bound.rollbackPlanSuitable, false);
});

test("default adapter stays fail-closed and lists the undecided blockers", () => {
  const bound = bindStagingRecoveryEvidence();
  assert.equal(bound.bindingDesignDependency, true);
  assert.equal(bound.checkpointPresent, false);
  assert.equal(bound.restoreProofPresent, false);
  assert.equal(bound.stagingBound, false);
  assert.equal(bound.operationalAuthority, false);
  assert.deepEqual(bound.evidenceRecords, []);
  assert.deepEqual(bound.bindingBlockers, [...STAGING_RECOVERY_BINDING_BLOCKERS]);
  assert.equal(bound.bindingBlockers.includes("LEDGER_STATE_MAPPING_UNDECIDED"), true);
  assert.equal(bound.bindingBlockers.includes("ISOLATED_RESTORE_TARGET_UNBOUND"), false);
  assert.equal(bound.specifiedContracts.includes("BOTH_IMP037_LAYERS_REQUIRED"), true);
});

test("backup success is not a binding input", () => {
  const bound = bindStagingRecoveryEvidence({
    records: [{ file: "backup-success.json", status: "SUCCEEDED" }],
  });
  assert.equal(bound.bindingDesignDependency, true);
  assert.equal(bound.observedQualifyingStagingRecords, 0);
});

test("selected policy plus isolated qualified checkpoint can clear design dependency without operational authority", () => {
  const fixture = syntheticIsolatedCheckpointFixture({
    now: new Date("2026-10-29T10:00:00.000Z"),
    candidateSha: "a".repeat(40),
    candidateTree: "b".repeat(40),
  });
  const policy = selectStagingRecoveryBindingPolicy({
    evidenceRootPath: "/home/ajoshi/.local/state/boba-bear/staging-recovery",
    volumeSystemIdentity: "disposable-volume-system-identity-001",
  });
  const bound = bindStagingRecoveryEvidence({
    policy,
    records: fixture.records,
    checkpointObservation: fixture.observation,
    now: fixture.now,
  });
  assert.equal(bound.bindingDesignDependency, false);
  assert.equal(bound.checkpointPresent, true);
  assert.equal(bound.operationalAuthority, false);
  assert.match(bound.binding, /STAGING_CHECKPOINT_QUALIFIED/);
});

test("selected policy without checkpoint remains design dependency", () => {
  const policy = selectStagingRecoveryBindingPolicy({
    evidenceRootPath: "/home/ajoshi/.local/state/boba-bear/staging-recovery",
    volumeSystemIdentity: "disposable-volume-system-identity-001",
  });
  const bound = bindStagingRecoveryEvidence({ policy, records: [] });
  assert.equal(bound.bindingDesignDependency, true);
  assert.ok(bound.bindingBlockers.length > 0);
});
