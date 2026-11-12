import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bindStagingRecoveryEvidence,
  listRecoveryIdentityBindingBlockers,
  STAGING_RECOVERY_BINDING_BLOCKERS,
} from "./staging-recovery-binding.mjs";
import { selectStagingRecoveryBindingPolicy } from "./staging-recovery-binding-policy.mjs";
import { syntheticIsolatedCheckpointFixture } from "./staging-recovery-checkpoint.mjs";
import { evaluateQualifyingRecoveryProof } from "../recovery/evidence.mjs";

const MATCHING_VOLUME_IDENTITY = "synthetic-volume-system-identity-001";

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

function selectedPolicy(volumeSystemIdentity = MATCHING_VOLUME_IDENTITY) {
  return selectStagingRecoveryBindingPolicy({
    evidenceRootPath: "/home/ajoshi/.local/state/boba-bear/staging-recovery",
    volumeSystemIdentity,
  });
}

function matchingFixture(overrides = {}) {
  return syntheticIsolatedCheckpointFixture({
    now: new Date("2026-10-29T10:00:00.000Z"),
    candidateSha: "a".repeat(40),
    candidateTree: "b".repeat(40),
    volumeSystemIdentity: MATCHING_VOLUME_IDENTITY,
    ...overrides,
  });
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

test("selected policy plus matching isolated checkpoint can clear design dependency without operational authority", () => {
  const fixture = matchingFixture();
  const bound = bindStagingRecoveryEvidence({
    policy: selectedPolicy(MATCHING_VOLUME_IDENTITY),
    records: fixture.records,
    checkpointObservation: fixture.observation,
    now: fixture.now,
  });
  assert.equal(bound.bindingDesignDependency, false);
  assert.equal(bound.checkpointPresent, true);
  assert.equal(bound.operationalAuthority, false);
  assert.equal(bound.selectedVolumeSystemIdentity, MATCHING_VOLUME_IDENTITY);
  assert.equal(bound.observedDatabaseSystemIdentifier, "synthetic-cluster-0001");
  assert.match(bound.binding, /STAGING_CHECKPOINT_QUALIFIED/);
});

test("selected policy without checkpoint remains design dependency", () => {
  const bound = bindStagingRecoveryEvidence({ policy: selectedPolicy(), records: [] });
  assert.equal(bound.bindingDesignDependency, true);
  assert.ok(bound.bindingBlockers.length > 0);
});

test("different selected volume identity keeps design dependency", () => {
  const fixture = matchingFixture();
  const bound = bindStagingRecoveryEvidence({
    policy: selectedPolicy("other-cluster-volume-identity-999"),
    records: fixture.records,
    checkpointObservation: fixture.observation,
    now: fixture.now,
  });
  assert.equal(bound.bindingDesignDependency, true);
  assert.equal(bound.stagingBound, false);
  assert.ok(bound.bindingBlockers.includes("SELECTED_VOLUME_IDENTITY_MISMATCH"));
});

test("different cluster system identifier keeps design dependency", () => {
  const fixture = matchingFixture({ databaseSystemIdentifier: "foreign-cluster-system-id" });
  // Break record/observation consistency after fixture construction.
  fixture.observation.databaseSystemIdentifier = "foreign-cluster-system-id";
  for (const record of fixture.records) {
    for (const finding of record.findings ?? []) {
      if (finding.code === "STAGING_SOURCE_IDENTITY") {
        finding.databaseSystemIdentifier = "other-observed-cluster";
      }
    }
  }
  const bound = bindStagingRecoveryEvidence({
    policy: selectedPolicy(MATCHING_VOLUME_IDENTITY),
    records: fixture.records,
    checkpointObservation: fixture.observation,
    now: fixture.now,
  });
  assert.equal(bound.bindingDesignDependency, true);
  assert.ok(
    bound.bindingBlockers.includes("CHECKPOINT_CLUSTER_IDENTITY_INCONSISTENT") ||
      bound.bindingBlockers.includes("WRONG_PROJECT_OR_DATABASE") ||
      bound.bindingBlockers.includes("CHECKPOINT_NOT_QUALIFIED") ||
      Array.isArray(bound.bindingBlockers),
  );
  assert.equal(bound.stagingBound, false);
});

test("missing source identity keeps design dependency", () => {
  const fixture = matchingFixture();
  for (const record of fixture.records) {
    record.findings = (record.findings ?? []).filter((finding) => finding.code !== "STAGING_SOURCE_IDENTITY");
  }
  const bound = bindStagingRecoveryEvidence({
    policy: selectedPolicy(MATCHING_VOLUME_IDENTITY),
    records: fixture.records,
    checkpointObservation: fixture.observation,
    now: fixture.now,
  });
  assert.equal(bound.bindingDesignDependency, true);
  assert.equal(bound.stagingBound, false);
});

test("inconsistent volume identity across records keeps design dependency", () => {
  const fixture = matchingFixture();
  const identity = fixture.records[0].findings.find((finding) => finding.code === "STAGING_SOURCE_IDENTITY");
  identity.volumeSystemIdentity = "inconsistent-volume-identity-xyz";
  const bound = bindStagingRecoveryEvidence({
    policy: selectedPolicy(MATCHING_VOLUME_IDENTITY),
    records: fixture.records,
    checkpointObservation: fixture.observation,
    now: fixture.now,
  });
  assert.equal(bound.bindingDesignDependency, true);
  assert.ok(
    bound.bindingBlockers.includes("CHECKPOINT_VOLUME_IDENTITY_INCONSISTENT") ||
      bound.bindingBlockers.includes("WRONG_SOURCE_VOLUME") ||
      bound.bindingBlockers.length > 0,
  );
});

test("wrong recovery target keeps design dependency", () => {
  const fixture = matchingFixture();
  for (const record of fixture.records) {
    if (String(record.operationType).startsWith("restore-")) {
      record.targetIdentityMarker = fixture.observation.databaseSystemIdentifier;
    }
  }
  const bound = bindStagingRecoveryEvidence({
    policy: selectedPolicy(MATCHING_VOLUME_IDENTITY),
    records: fixture.records,
    checkpointObservation: fixture.observation,
    now: fixture.now,
  });
  assert.equal(bound.bindingDesignDependency, true);
  assert.equal(bound.stagingBound, false);
});

test("unrelated checkpoint keeps design dependency", () => {
  const fixture = matchingFixture();
  for (const record of fixture.records) {
    record.sourceIdentityMarker = "unrelated-nonstaging-cluster";
  }
  const blockers = listRecoveryIdentityBindingBlockers({
    observation: fixture.observation,
    records: fixture.records,
    selectedVolumeSystemIdentity: MATCHING_VOLUME_IDENTITY,
  });
  assert.ok(blockers.includes("UNRELATED_CHECKPOINT_IDENTITY"));
  const bound = bindStagingRecoveryEvidence({
    policy: selectedPolicy(MATCHING_VOLUME_IDENTITY),
    records: fixture.records,
    checkpointObservation: fixture.observation,
    now: fixture.now,
  });
  assert.equal(bound.bindingDesignDependency, true);
});

test("operator-supplied success assertions cannot clear design dependency", () => {
  const fixture = matchingFixture();
  const observation = {
    ...fixture.observation,
    stagingBound: true,
    restoreProofPresent: true,
    bindingDesignDependency: false,
  };
  const blockers = listRecoveryIdentityBindingBlockers({
    observation,
    records: fixture.records,
    selectedVolumeSystemIdentity: MATCHING_VOLUME_IDENTITY,
  });
  assert.ok(blockers.includes("OPERATOR_SUPPLIED_SUCCESS_ASSERTION"));
  const bound = bindStagingRecoveryEvidence({
    policy: selectedPolicy(MATCHING_VOLUME_IDENTITY),
    records: fixture.records,
    checkpointObservation: observation,
    now: fixture.now,
  });
  assert.equal(bound.bindingDesignDependency, true);
  assert.equal(bound.stagingBound, false);
});
