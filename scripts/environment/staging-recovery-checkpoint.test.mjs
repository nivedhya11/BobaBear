import assert from "node:assert/strict";
import { chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { KNOWN_SAFE_MIGRATION_LEDGER_STATES } from "./staging-preflight.mjs";
import { persistEvidence } from "../recovery/store.mjs";
import { PROTECTED_PRIMARY_REPOSITORY } from "./staging-source-isolation.mjs";
import {
  evaluateStagingRecoveryChain,
  evaluateStagingRecoveryCheckpoint,
  PROPOSED_STAGING_RECOVERY_EVIDENCE_ROOT,
  STAGING_CHECKPOINT_REASON,
  STAGING_RECOVERY_EVIDENCE_ROOT_STATUS,
  syntheticIsolatedCheckpointFixture,
} from "./staging-recovery-checkpoint.mjs";

const NOW = new Date("2026-10-29T10:00:00.000Z");

function fixture() {
  return syntheticIsolatedCheckpointFixture({ now: NOW });
}

function chain(mutator) {
  const sample = fixture();
  mutator?.(sample);
  return evaluateStagingRecoveryChain({
    records: sample.records,
    observation: sample.observation,
    now: sample.now,
    source: { head: sample.observation.candidateSha, tree: sample.observation.candidateTree },
  });
}

function blocked(mutator, reason) {
  const result = chain(mutator);
  assert.equal(result.outcome, "BLOCKED");
  assert.equal(result.operationalAuthority, false);
  assert.equal(result.operationalRecoveryBinding, "BLOCKED");
  assert.equal(result.reasonCodes.includes(reason), true, result.reasonCodes.join(","));
}

function materialize(sample, mode = 0o700) {
  const parent = mkdtempSync(path.join(tmpdir(), "boba-checkpoint-"));
  const root = path.join(parent, "evidence");
  mkdirSync(root, { mode: 0o700 });
  chmodSync(root, mode);
  for (const record of sample.records) {
    persistEvidence(root, record);
    chmodSync(path.join(root, record.runId, "evidence.json"), 0o600);
  }
  writeFileSync(path.join(root, "checkpoint.json"), JSON.stringify({ observation: sample.observation }), {
    mode: 0o600,
  });
  return { parent, root };
}

test("ledger allowlist matches preflight and is not a hash mapping", () => {
  assert.deepEqual([...KNOWN_SAFE_MIGRATION_LEDGER_STATES].sort(), ["APPLIED_CURRENT", "LEDGER_CURRENT"]);
});

test("no evidence blocks", () => {
  const result = evaluateStagingRecoveryChain({ records: [], observation: fixture().observation, now: NOW });
  assert.equal(result.reasonCodes.includes(STAGING_CHECKPOINT_REASON.NO_EVIDENCE), true);
  assert.equal(result.operationalAuthority, false);
});

test("backup-only evidence blocks", () => {
  blocked((sample) => {
    sample.records = sample.records.filter((record) => record.operationType.includes("backup"));
  }, STAGING_CHECKPOINT_REASON.BACKUP_ONLY);
});

test("restore-only evidence blocks", () => {
  blocked((sample) => {
    sample.records = sample.records.filter((record) => record.operationType.startsWith("restore-"));
  }, STAGING_CHECKPOINT_REASON.RESTORE_ONLY);
});

test("wrong source volume blocks", () => {
  blocked((sample) => {
    sample.observation.postgresVolume = "other-volume";
  }, STAGING_CHECKPOINT_REASON.WRONG_SOURCE_VOLUME);
});

test("wrong project or database identity blocks", () => {
  blocked((sample) => {
    sample.observation.databaseSystemIdentifier = "other-cluster";
  }, STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  blocked((sample) => {
    sample.observation.composeProject = "other-project";
  }, STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
});

test("target equal to source blocks", () => {
  blocked((sample) => {
    for (const record of sample.records) {
      if (record.operationType.startsWith("restore-")) {
        record.targetIdentityMarker = sample.observation.databaseSystemIdentifier;
      }
    }
  }, STAGING_CHECKPOINT_REASON.TARGET_EQUALS_SOURCE);
});

test("reused or unowned recovery target blocks", () => {
  blocked((sample) => {
    for (const record of sample.records) {
      for (const finding of record.findings ?? []) {
        if (finding.code === "FRESH_TARGET_PROVISIONED") finding.reused = true;
      }
    }
  }, STAGING_CHECKPOINT_REASON.REUSED_OR_UNOWNED_TARGET);
});

test("failed or interrupted restore blocks", () => {
  blocked((sample) => {
    const restore = sample.records.find((record) => record.operationType === "restore-pitr");
    restore.status = "FAILED";
  }, STAGING_CHECKPOINT_REASON.FAILED_OR_INTERRUPTED_RESTORE);
});

test("wrong artifact checksum blocks", () => {
  blocked((sample) => {
    const restore = sample.records.find((record) => record.operationType === "restore-logical");
    const finding = restore.findings.find((entry) => entry.sha256Hex);
    finding.sha256Hex = "ab".repeat(32);
  }, STAGING_CHECKPOINT_REASON.WRONG_ARTIFACT_CHECKSUM);
});

test("mismatched backup and restore linkage blocks", () => {
  blocked((sample) => {
    const restore = sample.records.find((record) => record.operationType === "restore-pitr");
    const finding = restore.findings.find((entry) => entry.sourceRunId);
    finding.sourceRunId = "20261029T090000Z-aaaaaaaaaaaaaaaa";
  }, STAGING_CHECKPOINT_REASON.MISMATCHED_RUN_LINKAGE);
});

test("stale recovery point blocks", () => {
  // RPO applies to measured PITR restore point, not Layer 1 physical backup age.
  blocked((sample) => {
    const restore = sample.records.find((record) => record.operationType === "restore-pitr");
    restore.recoveryPoint = new Date(NOW.getTime() - 2 * 60 * 60 * 1000).toISOString();
  }, STAGING_CHECKPOINT_REASON.STALE_RECOVERY_POINT);
});

test("future-dated proof blocks", () => {
  blocked((sample) => {
    for (const record of sample.records) {
      record.endedAt = new Date(NOW.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  }, STAGING_CHECKPOINT_REASON.FUTURE_DATED_PROOF);
});

test("candidate or schema incompatibility blocks", () => {
  blocked((sample) => {
    sample.observation.candidateSha = "c".repeat(40);
  }, STAGING_CHECKPOINT_REASON.CANDIDATE_OR_SCHEMA_INCOMPATIBLE);
});

test("unknown migration ledger blocks", () => {
  blocked((sample) => {
    sample.observation.migrationLedgerState = "HASH_MATCH";
  }, STAGING_CHECKPOINT_REASON.UNKNOWN_MIGRATION_LEDGER);
});

test("missing validation blocks", () => {
  blocked((sample) => {
    for (const record of sample.records) {
      if (record.operationType.startsWith("restore-")) record.validationResults = [];
    }
  }, STAGING_CHECKPOINT_REASON.MISSING_VALIDATION);
});

test("missing rollback suitability blocks", () => {
  blocked((sample) => {
    sample.observation.databaseRestoreUsedAsRollback = true;
  }, STAGING_CHECKPOINT_REASON.MISSING_ROLLBACK_SUITABILITY);
  blocked((sample) => {
    delete sample.observation.rollbackMode;
  }, STAGING_CHECKPOINT_REASON.MISSING_ROLLBACK_SUITABILITY);
});

test("forged or operator-supplied success flags block", () => {
  const result = evaluateStagingRecoveryCheckpoint({ qualified: true, success: true, rollbackPlanSuitable: true });
  assert.equal(result.outcome, "BLOCKED");
  assert.equal(result.operationalAuthority, false);
  assert.equal(result.reasonCodes.includes(STAGING_CHECKPOINT_REASON.FORGED_OR_OPERATOR_SUPPLIED_SUCCESS), true);
});

test("symlinked or unsafe evidence root blocks", () => {
  const sample = fixture();
  const stored = materialize(sample);
  const linkParent = mkdtempSync(path.join(tmpdir(), "boba-checkpoint-link-"));
  const link = path.join(linkParent, "linked-root");
  symlinkSync(stored.root, link);
  const linked = evaluateStagingRecoveryCheckpoint({ evidenceRoot: link, now: NOW });
  assert.equal(linked.reasonCodes.includes(STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT), true);

  chmodSync(stored.root, 0o755);
  const loose = evaluateStagingRecoveryCheckpoint({ evidenceRoot: stored.root, now: NOW });
  assert.equal(loose.reasonCodes.includes(STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT), true);

  const insideRepo = evaluateStagingRecoveryCheckpoint({
    evidenceRoot: PROTECTED_PRIMARY_REPOSITORY,
    now: NOW,
  });
  assert.equal(insideRepo.reasonCodes.includes(STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT), true);
  rmSync(stored.parent, { recursive: true, force: true });
  rmSync(linkParent, { recursive: true, force: true });
});

test("latest failed attempt is not concealed by an older success", () => {
  blocked((sample) => {
    const failed = structuredClone(sample.records.find((record) => record.operationType === "layer2-logical-backup"));
    failed.runId = "20261029T095950Z-5555555555555555";
    failed.status = "FAILED";
    failed.endedAt = new Date(NOW.getTime() - 1000).toISOString();
    failed.readiness = "NOT_READY";
    sample.records.push(failed);
  }, STAGING_CHECKPOINT_REASON.LATEST_FAILURE_NOT_SUPERSEDED);
});

test("a single layer or health record cannot qualify the checkpoint", () => {
  blocked((sample) => {
    sample.records = sample.records.filter(
      (record) => record.recoveryLayer === "LAYER_1" || record.operationType === "restore-pitr",
    );
  }, STAGING_CHECKPOINT_REASON.MISMATCHED_RUN_LINKAGE);
  blocked((sample) => {
    const health = structuredClone(sample.records.find((record) => record.operationType === "layer1-backup"));
    health.operationType = "layer1-health";
    health.runId = "20261029T095940Z-6666666666666666";
    sample.records = sample.records.filter((record) => record.operationType !== "layer1-backup");
    sample.records.push(health);
  }, STAGING_CHECKPOINT_REASON.MISMATCHED_RUN_LINKAGE);
});

test("checkpoint qualification does not mutate the evidence root or staging runtime", () => {
  const source = readFileSync(new URL("./staging-recovery-checkpoint.mjs", import.meta.url), "utf8");
  assert.equal(source.includes("mkdirSync"), false);
  assert.equal(source.includes("child_process"), false);
  assert.equal(source.includes("podman"), false);
  assert.equal(source.includes("pg_dump"), false);
  assert.equal(STAGING_RECOVERY_EVIDENCE_ROOT_STATUS, "NOT_SELECTED");
  const before = existsSync(PROPOSED_STAGING_RECOVERY_EVIDENCE_ROOT);
  const proposed = evaluateStagingRecoveryCheckpoint({
    evidenceRoot: PROPOSED_STAGING_RECOVERY_EVIDENCE_ROOT,
    now: NOW,
  });
  assert.equal(proposed.operationalAuthority, false);
  assert.equal(existsSync(PROPOSED_STAGING_RECOVERY_EVIDENCE_ROOT), before);

  const sample = fixture();
  const stored = materialize(sample);
  const unbound = evaluateStagingRecoveryCheckpoint({ evidenceRoot: stored.root, now: NOW });
  assert.equal(unbound.outcome, "BLOCKED");
  assert.equal(unbound.reasonCodes.includes(STAGING_CHECKPOINT_REASON.CANDIDATE_OR_SCHEMA_INCOMPATIBLE), true);
  const beforeStat = lstatSync(path.join(stored.root, "checkpoint.json"));
  const result = evaluateStagingRecoveryCheckpoint({
    evidenceRoot: stored.root,
    now: NOW,
    source: { head: "a".repeat(40), tree: "b".repeat(40) },
  });
  const afterStat = lstatSync(path.join(stored.root, "checkpoint.json"));
  assert.equal(result.outcome, "PASS");
  assert.equal(result.isolatedQualification, "PASS");
  assert.equal(result.operationalAuthority, false);
  assert.equal(result.operationalRecoveryBinding, "BLOCKED");
  assert.equal(beforeStat.mtimeMs, afterStat.mtimeMs);
  rmSync(stored.parent, { recursive: true, force: true });
});

test("stored evaluatedAt cannot preserve stale proof when evaluation clock advances", () => {
  const sample = fixture();
  const fresh = evaluateStagingRecoveryChain({
    records: sample.records,
    observation: sample.observation,
    now: sample.now,
    source: { head: sample.observation.candidateSha, tree: sample.observation.candidateTree },
  });
  assert.equal(fresh.outcome, "PASS");
  const later = new Date(sample.now.getTime() + 20 * 60 * 1000);
  const stale = evaluateStagingRecoveryChain({
    records: sample.records,
    observation: sample.observation,
    now: later,
    source: { head: sample.observation.candidateSha, tree: sample.observation.candidateTree },
  });
  assert.equal(stale.outcome, "BLOCKED");
  assert.equal(stale.reasonCodes.includes(STAGING_CHECKPOINT_REASON.STALE_RECOVERY_POINT), true);
  assert.equal(stale.operationalAuthority, false);
});

test("provisioned target identity mismatch with restore marker blocks", () => {
  blocked((sample) => {
    for (const record of sample.records) {
      if (!record.operationType.startsWith("restore-")) continue;
      for (const finding of record.findings ?? []) {
        if (finding.code === "FRESH_TARGET_PROVISIONED") {
          finding.targetIdentity = "unrelated-provisioned-target";
        }
      }
    }
  }, STAGING_CHECKPOINT_REASON.REUSED_OR_UNOWNED_TARGET);
});

test("recovery target volume equal to staging source blocks", () => {
  blocked((sample) => {
    for (const record of sample.records) {
      if (!record.operationType.startsWith("restore-")) continue;
      for (const finding of record.findings ?? []) {
        if (finding.code === "FRESH_TARGET_PROVISIONED") {
          finding.volumeOrPathId = sample.observation.postgresVolume;
        }
      }
    }
  }, STAGING_CHECKPOINT_REASON.TARGET_EQUALS_SOURCE);
});

test("canonical-path or symlink alias to staging source blocks", () => {
  const parent = mkdtempSync(path.join(tmpdir(), "boba-alias-"));
  const sourceDir = path.join(parent, "boba-staging_postgres-data");
  mkdirSync(sourceDir, { recursive: true });
  const alias = path.join(parent, "recovery-alias");
  symlinkSync(sourceDir, alias);
  try {
    blocked((sample) => {
      for (const record of sample.records) {
        if (!record.operationType.startsWith("restore-")) continue;
        for (const finding of record.findings ?? []) {
          if (finding.code === "FRESH_TARGET_PROVISIONED") {
            finding.volumeOrPathId = alias;
          }
        }
      }
    }, STAGING_CHECKPOINT_REASON.TARGET_EQUALS_SOURCE);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("missing provisioner proof blocks", () => {
  blocked((sample) => {
    for (const record of sample.records) {
      if (!record.operationType.startsWith("restore-")) continue;
      record.findings = (record.findings ?? []).filter((entry) => entry.code !== "FRESH_TARGET_PROVISIONED");
    }
  }, STAGING_CHECKPOINT_REASON.REUSED_OR_UNOWNED_TARGET);
});

test("Layer 1 backup without WAL recovery-point proof blocks", () => {
  blocked((sample) => {
    const backup = sample.records.find((record) => record.operationType === "layer1-backup");
    backup.validationResults = (backup.validationResults ?? []).filter(
      (entry) => entry.code !== "LAYER1_RECOVERY_POINT",
    );
    backup.recoveryPoint = null;
  }, STAGING_CHECKPOINT_REASON.STALE_RECOVERY_POINT);
});

test("candidate mismatch blocks unverified checkpoint reuse", () => {
  blocked((sample) => {
    sample.observation.candidateSha = "d".repeat(40);
    sample.observation.candidateTree = "e".repeat(40);
  }, STAGING_CHECKPOINT_REASON.CANDIDATE_OR_SCHEMA_INCOMPATIBLE);
});

test("complete compatible chain passes only in isolated qualification and keeps operational authority blocked", () => {
  const result = chain();
  assert.equal(result.outcome, "PASS");
  assert.equal(result.isolatedQualification, "PASS");
  assert.equal(result.operationalAuthority, false);
  assert.equal(result.operationalRecoveryBinding, "BLOCKED");
});
