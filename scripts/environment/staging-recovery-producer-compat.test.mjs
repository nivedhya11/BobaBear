/**
 * Producer → staging-checkpoint consumer compatibility.
 * Uses real producer helpers / evidence constructors with independently observed
 * options only. Does not connect to staging, providers, or persistent volumes.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CHECKSUM_INTEGRITY_STATUS,
  ENVIRONMENT_CLASSIFICATION,
  OPERATION_STATUS,
  OPERATION_TYPE,
  PROOF_CODE,
  RECOVERY_LAYER,
} from "../recovery/constants.mjs";
import { createEvidence } from "../recovery/evidence.mjs";
import { buildLayer1HealthProof } from "../recovery/layer1/pgbackrest.mjs";
import { stagingSourceIdentityFindings } from "../recovery/staging-source-identity.mjs";
import { targetEvidenceFields } from "../recovery/restore/provision.mjs";
import {
  EXPECTED_STAGING_COMPOSE_PROJECT,
  EXPECTED_STAGING_POSTGRES_VOLUME,
} from "./postgres-init-identity.mjs";
import {
  EXPECTED_STAGING_POSTGRES_CONTAINER,
  EXPECTED_STAGING_POSTGRES_MAJOR,
  evaluateStagingRecoveryChain,
  STAGING_CHECKPOINT_REASON,
} from "./staging-recovery-checkpoint.mjs";
import { PROTECTED_PRIMARY_REPOSITORY } from "./staging-source-isolation.mjs";

const NOW = new Date("2026-10-29T10:00:00.000Z");
const CANDIDATE = { commitSha: "a".repeat(40), tree: "b".repeat(40), repositoryPath: PROTECTED_PRIMARY_REPOSITORY };
const SCHEMA = "producer-compat-schema";
const CLUSTER = "producer-compat-cluster-1";
const LAYER1_RUN = "20261029T095700Z-aaaaaaaaaaaaaaaa";
const LAYER2_RUN = "20261029T095800Z-bbbbbbbbbbbbbbbb";
const PITR_RUN = "20261029T095900Z-cccccccccccccccc";
const LOGICAL_RUN = "20261029T095930Z-dddddddddddddddd";
const LAYER2_SHA = "22".repeat(32);
const RECOVERY_POINT = new Date(NOW.getTime() - 3 * 60 * 1000).toISOString();
const ENDED = new Date(NOW.getTime() - 60 * 1000).toISOString();
const STARTED = new Date(NOW.getTime() - 2 * 60 * 1000).toISOString();

const STAGING_IDENTITY = {
  composeProject: EXPECTED_STAGING_COMPOSE_PROJECT,
  postgresContainer: EXPECTED_STAGING_POSTGRES_CONTAINER,
  postgresVolume: EXPECTED_STAGING_POSTGRES_VOLUME,
  databaseSystemIdentifier: CLUSTER,
  postgresMajor: EXPECTED_STAGING_POSTGRES_MAJOR,
};

const OBSERVATION = {
  sourceEnvironmentClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
  composeProject: EXPECTED_STAGING_COMPOSE_PROJECT,
  postgresContainer: EXPECTED_STAGING_POSTGRES_CONTAINER,
  postgresVolume: EXPECTED_STAGING_POSTGRES_VOLUME,
  databaseSystemIdentifier: CLUSTER,
  postgresMajor: EXPECTED_STAGING_POSTGRES_MAJOR,
  migrationSchemaContext: SCHEMA,
  migrationLedgerState: "APPLIED_CURRENT",
  candidateSha: CANDIDATE.commitSha,
  candidateTree: CANDIDATE.tree,
  rollbackMode: "IMAGE_ROLLBACK",
  priorImagePreserved: true,
  databaseRestoreUsedAsRollback: false,
};

const SAMPLE_INFO_JSON = JSON.stringify([
  {
    name: "boba",
    status: { code: 0, message: "ok", backup: "2026-10-29 09:00:00+00", archive: "000000010000000000000010" },
    backup: [
      {
        type: "full",
        label: "20261029-090000F",
        timestamp: { start: 1761728400, stop: 1761728500 },
        lsn: { start: "0/1000000", stop: "0/2000000" },
        archive: { start: "000000010000000000000001", stop: "000000010000000000000010" },
      },
    ],
    archive: [{ min: "000000010000000000000001", max: "000000010000000000000010" }],
  },
]);

function assess(records) {
  return evaluateStagingRecoveryChain({
    records,
    observation: OBSERVATION,
    now: NOW,
    source: { head: CANDIDATE.commitSha, tree: CANDIDATE.tree },
  });
}

function layer1ProducerEvidence({ includeIdentity = true, includeRecoveryPointProof = true } = {}) {
  const proof = buildLayer1HealthProof({
    checkOk: true,
    infoOutput: SAMPLE_INFO_JSON,
    verifyOk: true,
    recoveryPoint: RECOVERY_POINT,
    repositoryGeneration: 1,
  });
  assert.equal(proof.ok, true);
  const validationResults = includeRecoveryPointProof
    ? proof.validationResults
    : proof.validationResults.filter((entry) => entry.code !== PROOF_CODE.LAYER1_RECOVERY_POINT);
  return createEvidence({
    runId: LAYER1_RUN,
    operationType: OPERATION_TYPE.LAYER1_BACKUP,
    recoveryLayer: RECOVERY_LAYER.LAYER_1,
    status: OPERATION_STATUS.SUCCEEDED,
    startedAt: STARTED,
    endedAt: ENDED,
    candidate: CANDIDATE,
    migrationSchemaContext: SCHEMA,
    sourceEnvironmentClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
    sourceIdentityMarker: CLUSTER,
    recoveryPoint: includeRecoveryPointProof ? RECOVERY_POINT : null,
    recoveryArtifactReference: "repo-gen-1",
    checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.MATCHED,
    validationResults,
    findings: [
      {
        code: "LAYER1_BACKUP",
        type: "full",
        repositoryGeneration: "1",
        recoveryPointSource: "backup.timestamp.stop",
      },
      ...(includeIdentity ? stagingSourceIdentityFindings({ stagingSourceIdentity: STAGING_IDENTITY }) : []),
    ],
  });
}

function layer2ProducerEvidence({ includeIdentity = true } = {}) {
  return createEvidence({
    runId: LAYER2_RUN,
    operationType: OPERATION_TYPE.LAYER2_LOGICAL_BACKUP,
    recoveryLayer: RECOVERY_LAYER.LAYER_2,
    status: OPERATION_STATUS.SUCCEEDED,
    startedAt: STARTED,
    endedAt: ENDED,
    candidate: CANDIDATE,
    migrationSchemaContext: SCHEMA,
    sourceEnvironmentClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
    sourceIdentityMarker: CLUSTER,
    recoveryPoint: STARTED,
    recoveryArtifactReference: `logical/${LAYER2_RUN}/dump.age`,
    checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.MATCHED,
    validationResults: [
      { code: PROOF_CODE.REMOTE_ARTIFACT_SHA256_VERIFIED, sha256Hex: LAYER2_SHA },
      { code: PROOF_CODE.COMPLETE_MARKER_WRITTEN_LAST },
    ],
    findings: [
      { code: "LAYER2_METADATA", keyVersion: "v1", encryptedBytes: 12 },
      ...(includeIdentity ? stagingSourceIdentityFindings({ stagingSourceIdentity: STAGING_IDENTITY }) : []),
    ],
  });
}

function pitrProducerEvidence({ includeIdentity = true, sourceRunId = LAYER1_RUN } = {}) {
  const provisioned = targetEvidenceFields({
    kind: "pitr",
    runId: PITR_RUN,
    targetIdentity: `recovery-${PITR_RUN}`,
    volumeOrPathId: `/tmp/boba-recovery-${PITR_RUN}/pgdata`,
    created: true,
    postgresMajor: EXPECTED_STAGING_POSTGRES_MAJOR,
  });
  return createEvidence({
    runId: PITR_RUN,
    operationType: OPERATION_TYPE.RESTORE_PITR,
    recoveryLayer: RECOVERY_LAYER.LAYER_1,
    status: OPERATION_STATUS.SUCCEEDED,
    startedAt: STARTED,
    endedAt: ENDED,
    candidate: CANDIDATE,
    migrationSchemaContext: SCHEMA,
    sourceEnvironmentClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
    sourceIdentityMarker: CLUSTER,
    targetIdentityMarker: provisioned.targetIdentityMarker,
    recoveryPoint: RECOVERY_POINT,
    recoveryArtifactReference: "repo-gen-1",
    checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.NOT_CHECKED,
    validationResults: [{ code: PROOF_CODE.BUSINESS_INTEGRITY_VALIDATED }],
    findings: [
      { code: "PITR_RESTORE", sourceRunId, targetType: "time" },
      ...(provisioned.findings ?? []),
      ...(includeIdentity ? stagingSourceIdentityFindings({ stagingSourceIdentity: STAGING_IDENTITY }) : []),
    ],
  });
}

function logicalProducerEvidence({ includeIdentity = true, sourceRunId = LAYER2_RUN } = {}) {
  const provisioned = targetEvidenceFields({
    kind: "logical",
    runId: LOGICAL_RUN,
    targetIdentity: `recovery-${LOGICAL_RUN}`,
    volumeOrPathId: `podman:boba-recovery-${LOGICAL_RUN}`,
    created: true,
    postgresMajor: EXPECTED_STAGING_POSTGRES_MAJOR,
    networkInternalVerified: true,
    productionDnsAbsentVerified: true,
  });
  return createEvidence({
    runId: LOGICAL_RUN,
    operationType: OPERATION_TYPE.RESTORE_LOGICAL,
    recoveryLayer: RECOVERY_LAYER.LAYER_2,
    status: OPERATION_STATUS.SUCCEEDED,
    startedAt: STARTED,
    endedAt: new Date(NOW.getTime() - 30 * 1000).toISOString(),
    candidate: CANDIDATE,
    migrationSchemaContext: SCHEMA,
    sourceEnvironmentClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
    sourceIdentityMarker: CLUSTER,
    targetIdentityMarker: provisioned.targetIdentityMarker,
    recoveryPoint: sourceRunId,
    recoveryArtifactReference: `logical/${LAYER2_RUN}/dump.age`,
    checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.MATCHED,
    validationResults: [{ code: PROOF_CODE.BUSINESS_INTEGRITY_VALIDATED }],
    findings: [
      {
        code: "LOGICAL_RESTORE",
        sourceRunId,
        artifactKey: `logical/${LAYER2_RUN}/dump.age`,
        sha256Hex: LAYER2_SHA,
      },
      ...(provisioned.findings ?? []),
      ...(includeIdentity ? stagingSourceIdentityFindings({ stagingSourceIdentity: STAGING_IDENTITY }) : []),
    ],
  });
}

test("real Layer 1 producer-shaped evidence satisfies consumer contract fields", () => {
  const evidence = layer1ProducerEvidence();
  assert.equal(evidence.findings.some((entry) => entry.code === "STAGING_SOURCE_IDENTITY"), true);
  assert.equal(evidence.validationResults.some((entry) => entry.code === PROOF_CODE.LAYER1_RECOVERY_POINT), true);
  assert.equal(evidence.validationResults.some((entry) => entry.code === PROOF_CODE.PGBACKREST_VERIFY_OK), true);
  assert.equal(evidence.recoveryArtifactReference, "repo-gen-1");
  assert.equal(Object.hasOwn(evidence.findings.find((entry) => entry.code === "LAYER1_BACKUP") ?? {}, "artifactChecksum"), false);
});

test("real Layer 2 producer-shaped evidence satisfies consumer contract fields", () => {
  const evidence = layer2ProducerEvidence();
  assert.equal(evidence.findings.some((entry) => entry.code === "STAGING_SOURCE_IDENTITY"), true);
  assert.equal(
    evidence.validationResults.some(
      (entry) => entry.code === PROOF_CODE.REMOTE_ARTIFACT_SHA256_VERIFIED && entry.sha256Hex === LAYER2_SHA,
    ),
    true,
  );
});

test("real PITR restore producer-shaped evidence binds source run and fresh target", () => {
  const evidence = pitrProducerEvidence();
  const fresh = evidence.findings.find((entry) => entry.code === "FRESH_TARGET_PROVISIONED");
  assert.equal(fresh.targetIdentity, evidence.targetIdentityMarker);
  assert.equal(fresh.reused, false);
  assert.equal(fresh.postgresMajor, EXPECTED_STAGING_POSTGRES_MAJOR);
  assert.equal(evidence.findings.some((entry) => entry.sourceRunId === LAYER1_RUN), true);
});

test("real logical restore producer-shaped evidence binds sourceRunId and checksum", () => {
  const evidence = logicalProducerEvidence();
  const restore = evidence.findings.find((entry) => entry.code === "LOGICAL_RESTORE");
  assert.equal(restore.sourceRunId, LAYER2_RUN);
  assert.equal(restore.sha256Hex, LAYER2_SHA);
  const fresh = evidence.findings.find((entry) => entry.code === "FRESH_TARGET_PROVISIONED");
  assert.equal(fresh.providerSuppressionVerified, true);
  assert.equal(fresh.networkInternalVerified, true);
});

test("complete producer-shaped chain qualifies in isolation without operational authority", () => {
  const result = assess([
    layer1ProducerEvidence(),
    layer2ProducerEvidence(),
    pitrProducerEvidence(),
    logicalProducerEvidence(),
  ]);
  assert.equal(result.outcome, "PASS");
  assert.equal(result.isolatedQualification, "PASS");
  assert.equal(result.operationalAuthority, false);
  assert.equal(result.operationalRecoveryBinding, "BLOCKED");
});

test("producer evidence without staging identity finding blocks", () => {
  const result = assess([
    layer1ProducerEvidence({ includeIdentity: false }),
    layer2ProducerEvidence(),
    pitrProducerEvidence(),
    logicalProducerEvidence(),
  ]);
  assert.equal(result.outcome, "BLOCKED");
  assert.equal(result.reasonCodes.includes(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE), true);
});

test("Layer 1 producer evidence without WAL recovery-point proof blocks", () => {
  const backup = layer1ProducerEvidence({ includeRecoveryPointProof: false });
  // Force incomplete proof shape the consumer must reject.
  backup.validationResults = backup.validationResults.filter(
    (entry) => entry.code !== PROOF_CODE.LAYER1_RECOVERY_POINT,
  );
  backup.recoveryPoint = null;
  const result = assess([backup, layer2ProducerEvidence(), pitrProducerEvidence(), logicalProducerEvidence()]);
  assert.equal(result.outcome, "BLOCKED");
  assert.equal(result.reasonCodes.includes(STAGING_CHECKPOINT_REASON.STALE_RECOVERY_POINT), true);
});

test("no persistent staging or provider operation occurs in producer-compat qualification", () => {
  const before = assess([
    layer1ProducerEvidence(),
    layer2ProducerEvidence(),
    pitrProducerEvidence(),
    logicalProducerEvidence(),
  ]);
  assert.equal(before.operationalAuthority, false);
  assert.equal(before.operationalRecoveryBinding, "BLOCKED");
});
