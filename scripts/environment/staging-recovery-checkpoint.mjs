/**
 * Staging recovery checkpoint qualification.
 *
 * Reads disposable or supplied evidence and fails closed. It does not execute
 * backup, restore, deployment, or database access, and it never grants
 * operational recovery authority.
 *
 * Locked IMP-037 layer, freshness, target, and rollback rules are enforced.
 * A private evidence-root path, the live cluster system identifier, an extra
 * staging restore-proof window, and migration-ledger label meaning stay
 * undecided and cannot be satisfied by this module.
 */
import { lstatSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";

import {
  CHECKSUM_INTEGRITY_STATUS,
  ENVIRONMENT_CLASSIFICATION,
  LAYER_1_MAX_AGE_MS_DEFAULT,
  LAYER_2_MAX_AGE_MS_DEFAULT,
  OPERATION_STATUS,
  OPERATION_TYPE,
  RPO_TARGET_MS_DEFAULT,
} from "../recovery/constants.mjs";
import { createEvidence, evaluateQualifyingRecoveryProof, validateEvidence } from "../recovery/evidence.mjs";
import { evaluateRecoveryPointFreshness } from "../recovery/freshness.mjs";
import { evaluateTargetIdentitySafety } from "../recovery/identity.mjs";
import {
  EXPECTED_STAGING_COMPOSE_PROJECT,
  EXPECTED_STAGING_POSTGRES_VOLUME,
} from "./postgres-init-identity.mjs";
import { PROTECTED_PRIMARY_REPOSITORY } from "./staging-source-isolation.mjs";

/**
 * Same allowlist as staging preflight. Hash comparison is not mapped onto it here.
 * Live probes still cannot emit these labels until ledger meaning is decided.
 */
const KNOWN_SAFE_LEDGER_LABELS = new Set(["APPLIED_CURRENT", "LEDGER_CURRENT"]);

export const EXPECTED_STAGING_POSTGRES_CONTAINER = "boba-staging_postgres_1";
export const EXPECTED_STAGING_POSTGRES_MAJOR = 18;

/** Assessment location only. This module must not create it. */
export const PROPOSED_STAGING_RECOVERY_EVIDENCE_ROOT =
  "/home/ajoshi/.local/state/boba-bear/staging-recovery";
export const STAGING_RECOVERY_EVIDENCE_ROOT_STATUS = "NOT_SELECTED";

/** Wall-clock tolerance for test and NTP skew. Not a freshness window. */
export const CHECKPOINT_CLOCK_SKEW_MS = 2 * 60 * 1000;

export const STAGING_CHECKPOINT_REASON = Object.freeze({
  NO_EVIDENCE: "NO_EVIDENCE",
  BACKUP_ONLY: "BACKUP_ONLY",
  RESTORE_ONLY: "RESTORE_ONLY",
  WRONG_SOURCE_VOLUME: "WRONG_SOURCE_VOLUME",
  WRONG_PROJECT_OR_DATABASE: "WRONG_PROJECT_OR_DATABASE",
  TARGET_EQUALS_SOURCE: "TARGET_EQUALS_SOURCE",
  REUSED_OR_UNOWNED_TARGET: "REUSED_OR_UNOWNED_TARGET",
  FAILED_OR_INTERRUPTED_RESTORE: "FAILED_OR_INTERRUPTED_RESTORE",
  WRONG_ARTIFACT_CHECKSUM: "WRONG_ARTIFACT_CHECKSUM",
  MISMATCHED_RUN_LINKAGE: "MISMATCHED_RUN_LINKAGE",
  STALE_RECOVERY_POINT: "STALE_RECOVERY_POINT",
  FUTURE_DATED_PROOF: "FUTURE_DATED_PROOF",
  CANDIDATE_OR_SCHEMA_INCOMPATIBLE: "CANDIDATE_OR_SCHEMA_INCOMPATIBLE",
  UNKNOWN_MIGRATION_LEDGER: "UNKNOWN_MIGRATION_LEDGER",
  MISSING_VALIDATION: "MISSING_VALIDATION",
  MISSING_ROLLBACK_SUITABILITY: "MISSING_ROLLBACK_SUITABILITY",
  FORGED_OR_OPERATOR_SUPPLIED_SUCCESS: "FORGED_OR_OPERATOR_SUPPLIED_SUCCESS",
  UNSAFE_EVIDENCE_ROOT: "UNSAFE_EVIDENCE_ROOT",
  LATEST_FAILURE_NOT_SUPERSEDED: "LATEST_FAILURE_NOT_SUPERSEDED",
});

const OPERATOR_SUCCESS_FLAGS = Object.freeze([
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
]);

const LAYER1_BACKUP_TYPES = new Set([OPERATION_TYPE.LAYER1_BACKUP]);
const LAYER2_BACKUP_TYPES = new Set([OPERATION_TYPE.LAYER2_LOGICAL_BACKUP]);
const BUILD_OR_WEB_SEGMENTS = new Set(["public", ".next", "dist", "out", "build", "artifacts"]);

/**
 * @param {string[]} reasonCodes
 */
function blocked(reasonCodes) {
  return {
    outcome: "BLOCKED",
    isolatedQualification: "BLOCKED",
    operationalAuthority: false,
    operationalRecoveryBinding: "BLOCKED",
    reasonCodes: [...new Set(reasonCodes)],
  };
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} record
 * @param {string} code
 */
function findings(record, code) {
  const list = Array.isArray(record.findings) ? record.findings : [];
  return list.filter((entry) => entry && typeof entry === "object" && entry.code === code);
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} record
 * @param {string} key
 */
function findingString(record, key) {
  const list = Array.isArray(record.findings) ? record.findings : [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const value = /** @type {Record<string, unknown>} */ (entry)[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  const results = Array.isArray(record.validationResults) ? record.validationResults : [];
  for (const entry of results) {
    if (!entry || typeof entry !== "object") continue;
    const value = /** @type {Record<string, unknown>} */ (entry)[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} record
 */
function artifactChecksum(record) {
  return findingString(record, "artifactChecksum") || findingString(record, "sha256Hex");
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} record
 */
function instantOf(record) {
  const parsed = Date.parse(record.endedAt ?? record.startedAt ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence[]} records
 * @param {(record: import("../recovery/evidence.mjs").RecoveryEvidence) => boolean} predicate
 */
function latestMatching(records, predicate) {
  const matched = records.filter(predicate);
  if (matched.length === 0) return null;
  return matched.sort((a, b) => instantOf(a) - instantOf(b) || a.runId.localeCompare(b.runId)).at(-1) ?? null;
}

/**
 * Structural checkpoint chain. Caller booleans are not proof.
 * `now` is the evaluation clock. A timestamp inside the evidence does not set it.
 *
 * @param {{
 *   records?: unknown[],
 *   observation?: Record<string, unknown> | null,
 *   now?: Date | string | number,
 *   source?: { head?: string, tree?: string } | null,
 * }} [input]
 */
export function evaluateStagingRecoveryChain(input = {}) {
  /** @type {string[]} */
  const reasons = [];
  if (hasOperatorSuccessFlag(input)) {
    reasons.push(STAGING_CHECKPOINT_REASON.FORGED_OR_OPERATOR_SUPPLIED_SUCCESS);
  }

  const now = resolveNow(input.now);
  const rawRecords = Array.isArray(input.records) ? input.records : [];
  const parsedRecords = rawRecords.map((record) => validateEvidence(record));
  if (parsedRecords.some((parsed) => !parsed.ok)) {
    reasons.push(STAGING_CHECKPOINT_REASON.NO_EVIDENCE);
  }
  const records = parsedRecords.filter((parsed) => parsed.ok).map((parsed) => parsed.evidence);

  if (records.length === 0) {
    reasons.push(STAGING_CHECKPOINT_REASON.NO_EVIDENCE);
    return blocked(reasons);
  }

  const newest = [...records].sort((a, b) => instantOf(a) - instantOf(b) || a.runId.localeCompare(b.runId)).at(-1);
  if (newest && (newest.status !== OPERATION_STATUS.SUCCEEDED || newest.incomplete === true)) {
    reasons.push(STAGING_CHECKPOINT_REASON.LATEST_FAILURE_NOT_SUPERSEDED);
  }

  const layer1 = latestMatching(records, (record) => LAYER1_BACKUP_TYPES.has(record.operationType));
  const layer2 = latestMatching(records, (record) => LAYER2_BACKUP_TYPES.has(record.operationType));
  const pitr = latestMatching(records, (record) => record.operationType === OPERATION_TYPE.RESTORE_PITR);
  const logical = latestMatching(records, (record) => record.operationType === OPERATION_TYPE.RESTORE_LOGICAL);
  const backups = [layer1, layer2].filter(Boolean);
  const restores = [pitr, logical].filter(Boolean);

  if (backups.length === 0 && restores.length === 0) {
    reasons.push(STAGING_CHECKPOINT_REASON.NO_EVIDENCE);
  } else if (backups.length === 0) {
    reasons.push(STAGING_CHECKPOINT_REASON.RESTORE_ONLY);
  } else if (restores.length === 0) {
    reasons.push(STAGING_CHECKPOINT_REASON.BACKUP_ONLY);
  }
  if (!(layer1 && layer2 && pitr && logical) && backups.length > 0 && restores.length > 0) {
    reasons.push(STAGING_CHECKPOINT_REASON.MISMATCHED_RUN_LINKAGE);
  }

  for (const restore of restores) {
    if (!restore) continue;
    if (restore.status !== OPERATION_STATUS.SUCCEEDED || restore.incomplete === true || restore.endedAt == null) {
      reasons.push(STAGING_CHECKPOINT_REASON.FAILED_OR_INTERRUPTED_RESTORE);
    }
  }

  const observation = input.observation && typeof input.observation === "object" ? input.observation : null;
  if (!observation) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
    reasons.push(STAGING_CHECKPOINT_REASON.MISSING_ROLLBACK_SUITABILITY);
    reasons.push(STAGING_CHECKPOINT_REASON.UNKNOWN_MIGRATION_LEDGER);
  } else {
    assessObservation(observation, input.source ?? null, reasons);
  }

  for (const record of [...backups, ...restores]) {
    if (!record || !observation) continue;
    assessRecordIdentity(record, observation, reasons);
    assessFreshness(record, now, reasons);
  }

  if (layer1 && !evaluateQualifyingRecoveryProof(layer1, { layer: "LAYER_1" }).ok) {
    reasons.push(STAGING_CHECKPOINT_REASON.NO_EVIDENCE);
  }
  if (layer2 && !evaluateQualifyingRecoveryProof(layer2, { layer: "LAYER_2" }).ok) {
    reasons.push(STAGING_CHECKPOINT_REASON.NO_EVIDENCE);
  }
  if (layer1 && pitr) assessLink(layer1, pitr, reasons);
  if (layer2 && logical) assessLink(layer2, logical, reasons);
  for (const restore of restores) {
    if (!restore || !observation) continue;
    assessTarget(restore, observation, reasons);
    assessValidation(restore, reasons);
  }

  if (reasons.length > 0) return blocked(reasons);
  return {
    outcome: "PASS",
    isolatedQualification: "PASS",
    operationalAuthority: false,
    operationalRecoveryBinding: "BLOCKED",
    reasonCodes: [],
  };
}

/**
 * @param {Record<string, unknown>} input
 */
function hasOperatorSuccessFlag(input) {
  return OPERATOR_SUCCESS_FLAGS.some((flag) => input[flag] === true);
}

/**
 * @param {Date | string | number | undefined} value
 */
function resolveNow(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) return parsed;
  }
  return new Date();
}

/**
 * @param {Record<string, unknown>} observation
 * @param {{ head?: string, tree?: string } | null} source
 * @param {string[]} reasons
 */
function assessObservation(observation, source, reasons) {
  if (observation.sourceEnvironmentClassification !== ENVIRONMENT_CLASSIFICATION.STAGING) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  }
  if (observation.composeProject !== EXPECTED_STAGING_COMPOSE_PROJECT) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  }
  if (observation.postgresContainer !== EXPECTED_STAGING_POSTGRES_CONTAINER) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  }
  if (observation.postgresVolume !== EXPECTED_STAGING_POSTGRES_VOLUME) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_SOURCE_VOLUME);
  }
  if (typeof observation.databaseSystemIdentifier !== "string" || observation.databaseSystemIdentifier.trim() === "") {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  }
  if (observation.postgresMajor !== EXPECTED_STAGING_POSTGRES_MAJOR) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  }
  const ledger = observation.migrationLedgerState;
  if (typeof ledger !== "string" || !KNOWN_SAFE_LEDGER_LABELS.has(ledger)) {
    reasons.push(STAGING_CHECKPOINT_REASON.UNKNOWN_MIGRATION_LEDGER);
  }
  const sha = observation.candidateSha;
  const tree = observation.candidateTree;
  const schema = observation.migrationSchemaContext;
  if (typeof sha !== "string" || typeof tree !== "string" || typeof schema !== "string" || !sha || !tree || !schema) {
    reasons.push(STAGING_CHECKPOINT_REASON.CANDIDATE_OR_SCHEMA_INCOMPATIBLE);
  }
  if (source && (sha !== source.head || tree !== source.tree)) {
    reasons.push(STAGING_CHECKPOINT_REASON.CANDIDATE_OR_SCHEMA_INCOMPATIBLE);
  }
  const mode = observation.rollbackMode;
  if (mode !== "IMAGE_ROLLBACK" && mode !== "FORWARD_CORRECTION") {
    reasons.push(STAGING_CHECKPOINT_REASON.MISSING_ROLLBACK_SUITABILITY);
  }
  if (observation.priorImagePreserved !== true || observation.databaseRestoreUsedAsRollback !== false) {
    reasons.push(STAGING_CHECKPOINT_REASON.MISSING_ROLLBACK_SUITABILITY);
  }
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} record
 * @param {Record<string, unknown>} observation
 * @param {string[]} reasons
 */
function assessRecordIdentity(record, observation, reasons) {
  if (record.sourceEnvironmentClassification !== ENVIRONMENT_CLASSIFICATION.STAGING) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  }
  const identity = findings(record, "STAGING_SOURCE_IDENTITY")[0];
  if (!identity) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
    return;
  }
  if (identity.composeProject !== observation.composeProject || identity.postgresContainer !== observation.postgresContainer) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  }
  if (identity.postgresVolume !== observation.postgresVolume) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_SOURCE_VOLUME);
  }
  if (identity.databaseSystemIdentifier !== observation.databaseSystemIdentifier) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  }
  if (identity.postgresMajor !== observation.postgresMajor) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_PROJECT_OR_DATABASE);
  }
  const candidate = record.candidate ?? {};
  if (candidate.commitSha !== observation.candidateSha || candidate.tree !== observation.candidateTree) {
    reasons.push(STAGING_CHECKPOINT_REASON.CANDIDATE_OR_SCHEMA_INCOMPATIBLE);
  }
  if (record.migrationSchemaContext !== observation.migrationSchemaContext) {
    reasons.push(STAGING_CHECKPOINT_REASON.CANDIDATE_OR_SCHEMA_INCOMPATIBLE);
  }
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} record
 * @param {Date} now
 * @param {string[]} reasons
 */
function assessFreshness(record, now, reasons) {
  const ended = Date.parse(record.endedAt ?? "");
  if (!Number.isFinite(ended)) {
    reasons.push(STAGING_CHECKPOINT_REASON.STALE_RECOVERY_POINT);
    return;
  }
  if (ended - now.getTime() > CHECKPOINT_CLOCK_SKEW_MS) {
    reasons.push(STAGING_CHECKPOINT_REASON.FUTURE_DATED_PROOF);
  }
  const maxAge = record.recoveryLayer === "LAYER_1" ? LAYER_1_MAX_AGE_MS_DEFAULT : LAYER_2_MAX_AGE_MS_DEFAULT;
  if (now.getTime() - ended > maxAge) {
    reasons.push(STAGING_CHECKPOINT_REASON.STALE_RECOVERY_POINT);
  }
  const point = Date.parse(record.recoveryPoint ?? "");
  if (Number.isFinite(point) && point - now.getTime() > CHECKPOINT_CLOCK_SKEW_MS) {
    reasons.push(STAGING_CHECKPOINT_REASON.FUTURE_DATED_PROOF);
  }
  if (record.recoveryLayer === "LAYER_1" && record.operationType !== OPERATION_TYPE.RESTORE_PITR) {
    const freshness = evaluateRecoveryPointFreshness(record.recoveryPoint, RPO_TARGET_MS_DEFAULT, now);
    if (!freshness.ok) reasons.push(STAGING_CHECKPOINT_REASON.STALE_RECOVERY_POINT);
  }
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} backup
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} restore
 * @param {string[]} reasons
 */
function findingOnly(record, key) {
  const list = Array.isArray(record.findings) ? record.findings : [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const value = entry[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function assessLink(backup, restore, reasons) {
  const linkedRun = findingOnly(restore, "sourceRunId");
  if (!linkedRun || linkedRun !== backup.runId) {
    reasons.push(STAGING_CHECKPOINT_REASON.MISMATCHED_RUN_LINKAGE);
  }
  if (
    !backup.recoveryArtifactReference ||
    !restore.recoveryArtifactReference ||
    restore.recoveryArtifactReference !== backup.recoveryArtifactReference
  ) {
    reasons.push(STAGING_CHECKPOINT_REASON.MISMATCHED_RUN_LINKAGE);
  }
  const backupChecksum = artifactChecksum(backup);
  const restoreChecksum = artifactChecksum(restore);
  if (!backupChecksum || !restoreChecksum || backupChecksum !== restoreChecksum) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_ARTIFACT_CHECKSUM);
  }
  if (
    backup.checksumIntegrityStatus !== CHECKSUM_INTEGRITY_STATUS.MATCHED ||
    restore.checksumIntegrityStatus !== CHECKSUM_INTEGRITY_STATUS.MATCHED
  ) {
    reasons.push(STAGING_CHECKPOINT_REASON.WRONG_ARTIFACT_CHECKSUM);
  }
  if (backup.operationType === OPERATION_TYPE.LAYER1_BACKUP) {
    const codes = new Set(
      (backup.validationResults ?? [])
        .map((entry) => (entry && typeof entry === "object" ? String(entry.code ?? "") : ""))
        .filter((code) => code.length > 0),
    );
    if (!codes.has("PGBACKREST_VERIFY_OK")) {
      reasons.push(STAGING_CHECKPOINT_REASON.WRONG_ARTIFACT_CHECKSUM);
    }
  }
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} restore
 * @param {Record<string, unknown>} observation
 * @param {string[]} reasons
 */
function assessTarget(restore, observation, reasons) {
  const target = typeof restore.targetIdentityMarker === "string" ? restore.targetIdentityMarker.trim() : "";
  const sourceId = String(observation.databaseSystemIdentifier ?? "");
  const volume = String(observation.postgresVolume ?? "");
  const container = String(observation.postgresContainer ?? "");
  if (!target || target === sourceId || target === volume || target === container) {
    reasons.push(STAGING_CHECKPOINT_REASON.TARGET_EQUALS_SOURCE);
  }
  const fresh = findings(restore, "FRESH_TARGET_PROVISIONED")[0];
  if (!fresh || fresh.runId !== restore.runId || fresh.reused !== false || fresh.postgresMajor !== EXPECTED_STAGING_POSTGRES_MAJOR) {
    reasons.push(STAGING_CHECKPOINT_REASON.REUSED_OR_UNOWNED_TARGET);
  }
  if (fresh?.networkInternalVerified !== true || fresh?.providerSuppressionVerified !== true) {
    reasons.push(STAGING_CHECKPOINT_REASON.MISSING_VALIDATION);
  }
  const safety = evaluateTargetIdentitySafety({
    sourceIdentity: sourceId,
    targetIdentity: target,
    sourceClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
    targetClassification: ENVIRONMENT_CLASSIFICATION.RECOVERY,
    targetPgdataPath: typeof fresh?.volumeOrPathId === "string" ? fresh.volumeOrPathId : "",
  });
  if (!safety.allowed && safety.code === "SOURCE_EQUALS_TARGET") {
    reasons.push(STAGING_CHECKPOINT_REASON.TARGET_EQUALS_SOURCE);
  } else if (!safety.allowed) {
    reasons.push(STAGING_CHECKPOINT_REASON.REUSED_OR_UNOWNED_TARGET);
  }
}

/**
 * @param {import("../recovery/evidence.mjs").RecoveryEvidence} restore
 * @param {string[]} reasons
 */
function assessValidation(restore, reasons) {
  const results = Array.isArray(restore.validationResults) ? restore.validationResults : [];
  const validated = results.some(
    (entry) => entry && typeof entry === "object" && entry.code === "BUSINESS_INTEGRITY_VALIDATED",
  );
  if (!validated) reasons.push(STAGING_CHECKPOINT_REASON.MISSING_VALIDATION);
}

/**
 * Read-only evidence-root inspection. Does not create the proposed root.
 * @param {string} evidenceRoot
 */
export function inspectStagingEvidenceRoot(evidenceRoot) {
  if (typeof evidenceRoot !== "string" || !path.isAbsolute(evidenceRoot)) {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  let stat;
  try {
    stat = lstatSync(evidenceRoot);
  } catch {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  if ((stat.mode & 0o777) !== 0o700 || stat.uid !== process.getuid?.()) {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  let canonical;
  try {
    canonical = realpathSync(evidenceRoot);
  } catch {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  if (canonical !== path.resolve(evidenceRoot)) {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  const repo = path.resolve(PROTECTED_PRIMARY_REPOSITORY);
  if (canonical === repo || canonical.startsWith(`${repo}${path.sep}`)) {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  const segments = canonical.split(path.sep);
  if (segments.includes(EXPECTED_STAGING_POSTGRES_VOLUME) || segments.some((segment) => BUILD_OR_WEB_SEGMENTS.has(segment))) {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  let entries;
  try {
    entries = readdirSync(evidenceRoot, { withFileTypes: true });
  } catch {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  if (entries.some((entry) => entry.isSymbolicLink())) {
    return { ok: false, reason: STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT };
  }
  return { ok: true, canonical };
}

/**
 * Qualify a checkpoint from an evidence root. Ignores success flags.
 * Does not write, delete, or connect to staging.
 *
 * @param {{ evidenceRoot?: string, now?: Date | string | number, qualified?: boolean, success?: boolean }} [input]
 */
export function evaluateStagingRecoveryCheckpoint(input = {}) {
  if (hasOperatorSuccessFlag(input)) {
    const assessed = input.evidenceRoot
      ? evaluateStagingRecoveryCheckpoint({ evidenceRoot: input.evidenceRoot, now: input.now })
      : blocked([STAGING_CHECKPOINT_REASON.NO_EVIDENCE]);
    return blocked([STAGING_CHECKPOINT_REASON.FORGED_OR_OPERATOR_SUPPLIED_SUCCESS, ...assessed.reasonCodes]);
  }
  const inspection = inspectStagingEvidenceRoot(input.evidenceRoot ?? "");
  if (!inspection.ok) return blocked([inspection.reason]);

  /** @type {unknown[]} */
  const records = [];
  let observation = null;
  const entries = readdirSync(input.evidenceRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const evidencePath = path.join(input.evidenceRoot, entry.name, "evidence.json");
    let fileStat;
    try {
      fileStat = lstatSync(evidencePath);
    } catch {
      return blocked([STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT]);
    }
    if (fileStat.isSymbolicLink() || !fileStat.isFile() || (fileStat.mode & 0o777) !== 0o600) {
      return blocked([STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT]);
    }
    try {
      records.push(JSON.parse(readFileSync(evidencePath, "utf8")));
    } catch {
      return blocked([STAGING_CHECKPOINT_REASON.NO_EVIDENCE]);
    }
  }
  const descriptorPath = path.join(input.evidenceRoot, "checkpoint.json");
  try {
    const descriptorStat = lstatSync(descriptorPath);
    if (descriptorStat.isSymbolicLink() || !descriptorStat.isFile() || (descriptorStat.mode & 0o777) !== 0o600) {
      return blocked([STAGING_CHECKPOINT_REASON.UNSAFE_EVIDENCE_ROOT]);
    }
    const descriptor = JSON.parse(readFileSync(descriptorPath, "utf8"));
    if (descriptor && typeof descriptor === "object" && hasOperatorSuccessFlag(descriptor)) {
      return blocked([
        STAGING_CHECKPOINT_REASON.FORGED_OR_OPERATOR_SUPPLIED_SUCCESS,
        ...evaluateStagingRecoveryChain({ records, observation: descriptor.observation, now: input.now }).reasonCodes,
      ]);
    }
    observation = descriptor?.observation ?? null;
    if (observation && typeof observation === "object" && hasOperatorSuccessFlag(observation)) {
      return blocked([
        STAGING_CHECKPOINT_REASON.FORGED_OR_OPERATOR_SUPPLIED_SUCCESS,
        ...evaluateStagingRecoveryChain({ records, now: input.now }).reasonCodes,
      ]);
    }
  } catch {
    return blocked([STAGING_CHECKPOINT_REASON.NO_EVIDENCE]);
  }
  const source = input.source && typeof input.source === "object" ? input.source : null;
  const assessed = evaluateStagingRecoveryChain({ records, observation, now: input.now, source });
  const head = source && typeof source.head === "string" ? source.head : "";
  const tree = source && typeof source.tree === "string" ? source.tree : "";
  if (!/^[0-9a-f]{40}$/.test(head) || !/^[0-9a-f]{40}$/.test(tree)) {
    return blocked([STAGING_CHECKPOINT_REASON.CANDIDATE_OR_SCHEMA_INCOMPATIBLE, ...assessed.reasonCodes]);
  }
  return assessed;
}

/**
 * Isolated-test fixture only. Not operational authority and not live proof.
 * @param {{ now?: Date, candidateSha?: string, candidateTree?: string }} [options]
 */
export function syntheticIsolatedCheckpointFixture(options = {}) {
  const now = options.now instanceof Date ? options.now : new Date("2026-10-29T10:00:00.000Z");
  const endedAt = new Date(now.getTime() - 60 * 1000).toISOString();
  const startedAt = new Date(now.getTime() - 2 * 60 * 1000).toISOString();
  const recoveryPoint = new Date(now.getTime() - 3 * 60 * 1000).toISOString();
  const candidateSha = options.candidateSha ?? "a".repeat(40);
  const candidateTree = options.candidateTree ?? "b".repeat(40);
  const schema = "synthetic-schema-context";
  const cluster = "synthetic-cluster-0001";
  const layer1Run = "20261029T095700Z-1111111111111111";
  const layer2Run = "20261029T095800Z-2222222222222222";
  const pitrRun = "20261029T095900Z-3333333333333333";
  const logicalRun = "20261029T095930Z-4444444444444444";
  const layer1Checksum = "11".repeat(32);
  const layer2Checksum = "22".repeat(32);
  const identity = {
    code: "STAGING_SOURCE_IDENTITY",
    composeProject: EXPECTED_STAGING_COMPOSE_PROJECT,
    postgresContainer: EXPECTED_STAGING_POSTGRES_CONTAINER,
    postgresVolume: EXPECTED_STAGING_POSTGRES_VOLUME,
    databaseSystemIdentifier: cluster,
    postgresMajor: EXPECTED_STAGING_POSTGRES_MAJOR,
  };
  const candidate = { commitSha: candidateSha, tree: candidateTree, repositoryPath: PROTECTED_PRIMARY_REPOSITORY };
  const shared = {
    startedAt,
    endedAt,
    candidate,
    migrationSchemaContext: schema,
    sourceEnvironmentClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
    sourceIdentityMarker: cluster,
    checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.MATCHED,
    readiness: "READY",
    status: OPERATION_STATUS.SUCCEEDED,
    incomplete: false,
  };
  const layer1 = createEvidence({
    ...shared,
    runId: layer1Run,
    operationType: OPERATION_TYPE.LAYER1_BACKUP,
    recoveryLayer: "LAYER_1",
    recoveryPoint,
    recoveryArtifactReference: "repo-gen-1",
    validationResults: [
      { code: "PGBACKREST_CHECK_OK" },
      { code: "PGBACKREST_INFO_OK" },
      { code: "PGBACKREST_VERIFY_OK" },
      { code: "LAYER1_RECOVERY_POINT" },
      { code: "REPOSITORY_GENERATION" },
    ],
    findings: [{ code: "LAYER1_BACKUP", repositoryGeneration: "1", artifactChecksum: layer1Checksum }, identity],
  });
  const layer2 = createEvidence({
    ...shared,
    runId: layer2Run,
    operationType: OPERATION_TYPE.LAYER2_LOGICAL_BACKUP,
    recoveryLayer: "LAYER_2",
    recoveryPoint,
    recoveryArtifactReference: `logical/${layer2Run}/dump.age`,
    validationResults: [
      { code: "REMOTE_ARTIFACT_SHA256_VERIFIED", sha256Hex: layer2Checksum },
      { code: "COMPLETE_MARKER_WRITTEN_LAST" },
    ],
    findings: [{ code: "LAYER2_METADATA", artifactChecksum: layer2Checksum }, identity],
  });
  const targetFinding = (runId, targetIdentity) => ({
    code: "FRESH_TARGET_PROVISIONED",
    runId,
    targetIdentity,
    volumeOrPathId: `/tmp/boba-recovery-${runId}`,
    reused: false,
    postgresMajor: EXPECTED_STAGING_POSTGRES_MAJOR,
    networkInternalVerified: true,
    providerSuppressionVerified: true,
  });
  const pitr = createEvidence({
    ...shared,
    runId: pitrRun,
    operationType: OPERATION_TYPE.RESTORE_PITR,
    recoveryLayer: "LAYER_1",
    recoveryPoint,
    recoveryArtifactReference: "repo-gen-1",
    targetIdentityMarker: `recovery-${pitrRun}`,
    validationResults: [{ code: "BUSINESS_INTEGRITY_VALIDATED" }],
    findings: [
      { code: "PITR_RESTORE", sourceRunId: layer1Run, artifactChecksum: layer1Checksum, repositoryGeneration: "1" },
      targetFinding(pitrRun, `recovery-${pitrRun}`),
      identity,
    ],
  });
  const logical = createEvidence({
    ...shared,
    endedAt: new Date(now.getTime() - 30 * 1000).toISOString(),
    runId: logicalRun,
    operationType: OPERATION_TYPE.RESTORE_LOGICAL,
    recoveryLayer: "LAYER_2",
    recoveryPoint: layer2Run,
    recoveryArtifactReference: `logical/${layer2Run}/dump.age`,
    targetIdentityMarker: `recovery-${logicalRun}`,
    validationResults: [{ code: "BUSINESS_INTEGRITY_VALIDATED" }],
    findings: [
      { code: "LOGICAL_RESTORE", sourceRunId: layer2Run, sha256Hex: layer2Checksum },
      targetFinding(logicalRun, `recovery-${logicalRun}`),
      identity,
    ],
  });
  return {
    now,
    records: [layer1, layer2, pitr, logical],
    observation: {
      sourceEnvironmentClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
      composeProject: EXPECTED_STAGING_COMPOSE_PROJECT,
      postgresContainer: EXPECTED_STAGING_POSTGRES_CONTAINER,
      postgresVolume: EXPECTED_STAGING_POSTGRES_VOLUME,
      databaseSystemIdentifier: cluster,
      postgresMajor: EXPECTED_STAGING_POSTGRES_MAJOR,
      migrationSchemaContext: schema,
      migrationLedgerState: "APPLIED_CURRENT",
      candidateSha,
      candidateTree,
      rollbackMode: "IMAGE_ROLLBACK",
      priorImagePreserved: true,
      databaseRestoreUsedAsRollback: false,
    },
  };
}
