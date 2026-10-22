/**
 * Layer 2 logical restore: COMPLETE binding → SHA verify → age decrypt → pg_restore to fresh target.
 *
 * Prefer repository-provisioned disposable PostgreSQL 18 targets.
 * External --database-url requires a provisioner-issued ownership descriptor and a
 * resolved source endpoint. Arbitrary URLs without positive ownership proof are BLOCKED.
 *
 * CS1: owned host/container plaintext dumps cleaned on success and ordinary failure paths.
 * CS2: fail-closed COMPLETE + ciphertext SHA binding before decrypt.
 * CS4: no password-bearing URLs / PGPASSWORD=value in subprocess argv.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  CHECKSUM_INTEGRITY_STATUS,
  OPERATION_STATUS,
  OPERATION_TYPE,
  RECOVERY_LAYER,
} from "../constants.mjs";
import { createEvidence } from "../evidence.mjs";
import { requireExplicitSourceClassification } from "../identity.mjs";
import {
  cleanupOwnedAgeTempPath,
  decryptFromAge,
  writeOwnedAgeTempFile,
} from "../layer2/age.mjs";
import { generateRunId, isValidRunId } from "../run-id.mjs";
import { persistEvidence } from "../store.mjs";
import { redactText } from "../redact.mjs";
import {
  assertOwnedLogicalTarget,
  cleanupProvisionedTarget,
  provisionLogicalTarget,
  targetEvidenceFields,
} from "./provision.mjs";
import { assertFreshTarget, createRestoreTargetId } from "./target.mjs";

/**
 * @param {object} options
 * @param {string} options.runIdToRestore
 * @param {{ getObject: Function, headObject?: Function, verifyRemoteSha256?: Function }} options.objectStore
 * @param {string} options.identityFile
 * @param {string} options.sourceIdentity
 * @param {string} [options.targetIdentity]
 * @param {string} [options.databaseUrl]
 * @param {string} [options.sourceDatabaseUrl]
 * @param {object | string} [options.targetOwnership]
 * @param {boolean} [options.provisionTarget]
 * @param {string} [options.evidenceDir]
 * @param {Function} [options.restoreFn]
 * @param {Function} [options.decryptFn]
 * @param {Date} [options.now]
 */
export async function runLogicalRestore(options) {
  const runId = options.runId ?? generateRunId({ now: options.now });
  const startedAt = (options.now instanceof Date ? options.now : new Date()).toISOString();

  const sourceClass = requireExplicitSourceClassification(options.sourceClassification, {
    composeProjectName: options.composeProjectName,
    claimedRuntimeEnv: options.claimedRuntimeEnv,
  });
  if (!sourceClass.ok) {
    return fail(options, runId, startedAt, options.targetIdentity ?? createRestoreTargetId(runId), sourceClass.reason);
  }

  /** @type {import("./provision.mjs").ProvisionedLogicalTarget | null} */
  let provisioned = null;
  let targetIdentity = options.targetIdentity ?? createRestoreTargetId(runId);
  let databaseUrl = typeof options.databaseUrl === "string" ? options.databaseUrl.trim() : "";

  const shouldProvision = options.provisionTarget === true || (!databaseUrl && !options.restoreFn);
  if (shouldProvision && !options.restoreFn) {
    const provisionedResult = await provisionLogicalTarget({
      runId,
      sourceIdentity: options.sourceIdentity,
      sourceClassification: sourceClass.classification,
      sourceDatabaseUrl: options.sourceDatabaseUrl,
      image: options.image,
      execFn: options.containerExecFn,
    });
    if (!provisionedResult.ok) {
      return fail(options, runId, startedAt, targetIdentity, provisionedResult.reason);
    }
    provisioned = provisionedResult.target;
    targetIdentity = provisioned.targetIdentity;
    databaseUrl = provisioned.databaseUrl;
  } else if (databaseUrl) {
    const owned = assertOwnedLogicalTarget({
      runId,
      databaseUrl,
      sourceDatabaseUrl: options.sourceDatabaseUrl,
      ownershipDescriptor: options.targetOwnership,
      targetIdentity: options.targetIdentity,
      sourceIdentity: options.sourceIdentity,
      sourceClassification: sourceClass.classification,
    });
    if (!owned.ok) {
      return fail(options, runId, startedAt, targetIdentity, owned.reason);
    }
    targetIdentity = owned.targetIdentity;
  } else if (options.restoreFn) {
    // Injected restoreFn is a unit/integration seam only — still refuse production force.
    const fresh = assertFreshTarget({
      sourceIdentity: options.sourceIdentity,
      targetIdentity,
      sourceClassification: sourceClass.classification,
      targetClassification: "recovery",
      forceProduction: options.forceProduction,
    });
    if (!fresh.ok) {
      return fail(options, runId, startedAt, targetIdentity, fresh.reason);
    }
  }

  const sourceRunId = options.runIdToRestore;
  if (!isValidRunId(sourceRunId)) {
    if (provisioned) await cleanupProvisionedTarget(provisioned);
    return fail(options, runId, startedAt, targetIdentity, "runIdToRestore must be a valid RUN_ID");
  }

  const completeKey = `logical/${sourceRunId}/COMPLETE`;
  const artifactKey = `logical/${sourceRunId}/dump.age`;

  const binding = await verifyLogicalArtifactBinding({
    objectStore: options.objectStore,
    sourceRunId,
    completeKey,
    artifactKey,
  });
  if (!binding.ok) {
    if (provisioned) await cleanupProvisionedTarget(provisioned);
    return fail(options, runId, startedAt, targetIdentity, binding.reason);
  }

  const ciphertext = binding.ciphertext;

  let plaintext;
  if (typeof options.decryptFn === "function") {
    const decrypted = await options.decryptFn({ ciphertext, identityFile: options.identityFile });
    if (!decrypted?.ok || !decrypted.plaintext) {
      if (provisioned) await cleanupProvisionedTarget(provisioned);
      return fail(options, runId, startedAt, targetIdentity, decrypted?.reason ?? "age decrypt failed");
    }
    plaintext = decrypted.plaintext;
  } else {
    const decrypted = await decryptFromAge({
      ciphertext,
      identityFile: options.identityFile,
      ageBin: options.ageBin,
    });
    if (!decrypted.ok) {
      if (provisioned) await cleanupProvisionedTarget(provisioned);
      return fail(options, runId, startedAt, targetIdentity, decrypted.reason);
    }
    plaintext = decrypted.plaintext;
  }

  if (!options.restoreFn && !databaseUrl) {
    if (provisioned) await cleanupProvisionedTarget(provisioned);
    return fail(
      options,
      runId,
      startedAt,
      targetIdentity,
      "logical restore requires a provisioned fresh recovery database (or owned --database-url with ownership descriptor)",
    );
  }

  if (databaseUrl && isForbiddenActiveDatabaseUrl(databaseUrl)) {
    if (provisioned) await cleanupProvisionedTarget(provisioned);
    return fail(
      options,
      runId,
      startedAt,
      targetIdentity,
      "databaseUrl resolves to a forbidden active/default endpoint; refuse restore",
    );
  }

  const dumpFile = writeOwnedAgeTempFile(plaintext, {
    kind: "restore",
    suffix: ".dump",
    ownershipToken: runId.replace(/[^a-zA-Z0-9_-]/g, "").slice(-32),
  });
  if (!dumpFile.ok) {
    if (provisioned) await cleanupProvisionedTarget(provisioned);
    return fail(options, runId, startedAt, targetIdentity, dumpFile.reason);
  }
  const dumpPath = dumpFile.path;
  const dumpToken = dumpFile.ownershipToken;
  /** @type {string | null} */
  let remoteDumpPath = null;
  let containerCleanupFailed = false;
  let containerCleanupReason = null;

  try {
    const restoreFn =
      options.restoreFn ??
      ((filePath) => {
        // Prefer in-container restore against a provisioned disposable target
        // when host pg_restore is absent (common on agent workstations).
        if (provisioned?.containerName && provisioned?.containerCli) {
          const remoteDump = `/tmp/boba-restore-${runId}.dump`;
          remoteDumpPath = remoteDump;
          const copy = spawnSync(
            provisioned.containerCli,
            ["cp", filePath, `${provisioned.containerName}:${remoteDump}`],
            { encoding: "utf8", timeout: 120_000 },
          );
          if (copy.status !== 0) {
            return {
              ok: false,
              reason: redactText(copy.stderr || "failed to copy dump into recovery target container"),
            };
          }
          // Prefer migrator role when provisioned so restored objects are owned by the
          // same repository migration authority used for post-restore migrate.ts.
          let restoreUser = "boba_recovery";
          let restorePassword = null;
          if (typeof provisioned.migratorDatabaseUrl === "string" && provisioned.migratorDatabaseUrl.trim()) {
            try {
              const parsed = new URL(provisioned.migratorDatabaseUrl);
              if (parsed.username) restoreUser = decodeURIComponent(parsed.username);
              if (parsed.password) restorePassword = decodeURIComponent(parsed.password);
            } catch {
              // keep boba_recovery fallback
            }
          }
          // CS4: pass PGPASSWORD via child env + docker -e NAME (no =value in argv).
          const childEnv = { ...process.env };
          const execEnv = ["exec"];
          if (restorePassword) {
            childEnv.PGPASSWORD = restorePassword;
            execEnv.push("-e", "PGPASSWORD");
          }
          execEnv.push(
            provisioned.containerName,
            "pg_restore",
            "-U",
            restoreUser,
            "-d",
            "boba_recovery",
            "--exit-on-error",
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-acl",
            remoteDump,
          );
          const result = spawnSync(provisioned.containerCli, execEnv, {
            encoding: "utf8",
            timeout: 300_000,
            env: childEnv,
          });
          return evaluatePgRestoreResult(result);
        }
        const conn = parsePostgresConnection(databaseUrl);
        if (!conn.ok) {
          return { ok: false, reason: conn.reason };
        }
        const childEnv = { ...process.env };
        if (conn.password) childEnv.PGPASSWORD = conn.password;
        const result = spawnSync(
          "pg_restore",
          [
            "-h",
            conn.host,
            "-p",
            conn.port,
            "-U",
            conn.user,
            "-d",
            conn.database,
            "--exit-on-error",
            "--clean",
            "--if-exists",
            filePath,
          ],
          {
            encoding: "utf8",
            env: childEnv,
          },
        );
        return evaluatePgRestoreResult(result);
      });
    const restored = await restoreFn(dumpPath);
    if (!restored?.ok) {
      if (provisioned) await cleanupProvisionedTarget(provisioned);
      return fail(options, runId, startedAt, targetIdentity, restored?.reason ?? "pg_restore failed");
    }
  } finally {
    const hostCleanup = cleanupOwnedAgeTempPath(dumpPath, dumpToken);
    if (!hostCleanup.ok && existsSync(dumpPath)) {
      // Ordinary failure path must not leave owned plaintext; escalate if unlink fails.
      containerCleanupFailed = true;
      containerCleanupReason = hostCleanup.reason;
    }
    if (remoteDumpPath && provisioned?.containerName && provisioned?.containerCli) {
      const removed = removeContainerTempDump({
        containerCli: provisioned.containerCli,
        containerName: provisioned.containerName,
        remoteDumpPath,
        runId,
      });
      if (!removed.ok) {
        containerCleanupFailed = true;
        containerCleanupReason = removed.reason;
      }
    }
  }

  // CS1-E/F: unsuccessful cleanup must not silently produce successful recovery proof.
  if (containerCleanupFailed) {
    if (provisioned) await cleanupProvisionedTarget(provisioned);
    return fail(
      options,
      runId,
      startedAt,
      targetIdentity,
      `restore artifact cleanup failed after pg_restore; refusing SUCCEEDED proof: ${containerCleanupReason ?? "cleanup failed"}`,
    );
  }

  const provisionFields = provisioned ? targetEvidenceFields(provisioned) : { findings: [] };
  const evidence = createEvidence({
    runId,
    operationType: OPERATION_TYPE.RESTORE_LOGICAL,
    recoveryLayer: RECOVERY_LAYER.LAYER_2,
    status: OPERATION_STATUS.SUCCEEDED,
    startedAt,
    endedAt: new Date().toISOString(),
    sourceIdentityMarker: options.sourceIdentity,
    sourceEnvironmentClassification: sourceClass.classification,
    targetIdentityMarker: targetIdentity,
    recoveryArtifactReference: artifactKey,
    recoveryPoint: sourceRunId,
    checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.MATCHED,
    findings: [
      {
        code: "LOGICAL_RESTORE",
        completeKey,
        artifactKey,
        sha256Hex: binding.sha256Hex,
        volumeOrPathId: provisioned?.volumeOrPathId ?? null,
      },
      ...(provisionFields.findings ?? []),
    ],
  });
  if (options.evidenceDir) persistEvidence(options.evidenceDir, evidence);
  return {
    ok: true,
    status: OPERATION_STATUS.SUCCEEDED,
    runId,
    targetIdentity,
    databaseUrl: databaseUrl || null,
    provisioned,
    evidence,
  };
}

/**
 * Fail-closed COMPLETE + ciphertext SHA binding before decrypt.
 *
 * @param {object} input
 * @param {{ getObject: Function, headObject?: Function, verifyRemoteSha256?: Function }} input.objectStore
 * @param {string} input.sourceRunId
 * @param {string} input.completeKey
 * @param {string} input.artifactKey
 */
export async function verifyLogicalArtifactBinding(input) {
  const { objectStore, sourceRunId, completeKey, artifactKey } = input;
  if (!objectStore || typeof objectStore.getObject !== "function") {
    return { ok: false, reason: "objectStore.getObject is required for COMPLETE binding" };
  }

  if (typeof objectStore.headObject === "function") {
    const head = await objectStore.headObject({ key: completeKey });
    if (!head?.exists) {
      return { ok: false, reason: "COMPLETE marker missing; refuse incomplete Layer 2 artifact" };
    }
  }

  let completeBody;
  try {
    const completeRemote = await objectStore.getObject({ key: completeKey });
    completeBody = completeRemote?.body;
  } catch {
    return { ok: false, reason: "COMPLETE marker missing; refuse incomplete Layer 2 artifact" };
  }

  let complete;
  try {
    const text = Buffer.isBuffer(completeBody) ? completeBody.toString("utf8") : String(completeBody ?? "");
    complete = JSON.parse(text);
  } catch {
    return { ok: false, reason: "COMPLETE marker is not valid JSON; refuse restore" };
  }
  if (complete == null || typeof complete !== "object" || Array.isArray(complete)) {
    return { ok: false, reason: "COMPLETE marker must be a JSON object; refuse restore" };
  }

  if (complete.runId !== sourceRunId) {
    return {
      ok: false,
      reason: "COMPLETE.runId does not match requested restore run; refuse cross-run confusion",
    };
  }
  if (complete.artifactKey !== artifactKey) {
    return {
      ok: false,
      reason: "COMPLETE.artifactKey does not match expected dump.age key; refuse restore",
    };
  }
  const expectedSha = String(complete.sha256Hex ?? "")
    .trim()
    .toLowerCase();
  if (!expectedSha) {
    return { ok: false, reason: "COMPLETE.sha256Hex missing; refuse restore" };
  }
  if (!/^[0-9a-f]{64}$/.test(expectedSha)) {
    return { ok: false, reason: "COMPLETE.sha256Hex is malformed; refuse restore" };
  }
  if (typeof complete.keyVersion !== "string" || !complete.keyVersion.trim()) {
    return { ok: false, reason: "COMPLETE.keyVersion missing; refuse restore" };
  }
  if (typeof complete.completedAt !== "string" || !complete.completedAt.trim()) {
    return { ok: false, reason: "COMPLETE.completedAt missing; refuse restore" };
  }

  let artifactRemote;
  try {
    artifactRemote = await objectStore.getObject({ key: artifactKey });
  } catch {
    return { ok: false, reason: "dump.age missing; refuse incomplete Layer 2 artifact" };
  }
  const ciphertext = Buffer.isBuffer(artifactRemote?.body)
    ? artifactRemote.body
    : Buffer.from(String(artifactRemote?.body ?? ""), "utf8");
  if (ciphertext.length === 0) {
    return { ok: false, reason: "dump.age is empty; refuse restore" };
  }

  const actualSha = createHash("sha256").update(ciphertext).digest("hex");
  if (actualSha !== expectedSha) {
    return {
      ok: false,
      reason: "encrypted artifact SHA-256 does not match COMPLETE; refuse decrypt",
    };
  }

  // Store-side verification when available — never substitute a self-reported result
  // for actual retrieved-byte integrity (already checked above).
  if (typeof objectStore.verifyRemoteSha256 === "function") {
    const verified = await objectStore.verifyRemoteSha256({
      key: artifactKey,
      expectedSha256Hex: expectedSha,
    });
    if (!verified?.ok) {
      return {
        ok: false,
        reason: verified?.reason ?? "object-store SHA-256 verification failed; refuse decrypt",
      };
    }
  }

  return {
    ok: true,
    ciphertext,
    sha256Hex: expectedSha,
    complete,
  };
}

/**
 * Remove the exact run-owned temp dump from a recovery container after consumption.
 * Path must match `/tmp/boba-restore-${runId}.dump` — never arbitrary paths.
 *
 * @param {{ containerCli: string, containerName: string, remoteDumpPath: string, runId: string }} input
 */
export function removeContainerTempDump(input) {
  const expected = `/tmp/boba-restore-${input.runId}.dump`;
  if (input.remoteDumpPath !== expected) {
    return { ok: false, reason: "container dump cleanup refused: path is not run-owned" };
  }
  if (!/^boba-rec-tgt-/.test(input.containerName)) {
    return { ok: false, reason: "container dump cleanup refused: container is not a recovery target" };
  }
  const result = spawnSync(
    input.containerCli,
    ["exec", input.containerName, "rm", "-f", "--", expected],
    { encoding: "utf8", timeout: 30_000 },
  );
  if (typeof result.status === "number" && result.status === 0) {
    return { ok: true };
  }
  return {
    ok: false,
    reason: redactText(result.stderr || `failed to remove container dump ${expected}`),
  };
}

/**
 * Process exit status is authoritative for pg_restore.
 * status == 0 → success; every nonzero status → failure.
 * Never infer restore success from stderr wording (WARNING / ERROR / FATAL).
 *
 * @param {{ status?: number | null, stdout?: string, stderr?: string }} result
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function evaluatePgRestoreResult(result) {
  const status = typeof result?.status === "number" ? result.status : 1;
  if (status === 0) {
    return { ok: true };
  }
  const errText = String(result?.stderr || result?.stdout || "");
  return {
    ok: false,
    reason: redactText(errText || `pg_restore exited ${status}`),
  };
}

/**
 * @param {string} databaseUrl
 * @returns {{ ok: true, host: string, port: string, user: string, password: string, database: string } | { ok: false, reason: string }}
 */
export function parsePostgresConnection(databaseUrl) {
  if (typeof databaseUrl !== "string" || !databaseUrl.trim()) {
    return { ok: false, reason: "databaseUrl required" };
  }
  try {
    const parsed = new URL(databaseUrl.trim());
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      return { ok: false, reason: "databaseUrl must be a postgresql URL" };
    }
    const database = decodeURIComponent(parsed.pathname.replace(/^\//, "").split("/")[0] ?? "");
    if (!database) {
      return { ok: false, reason: "databaseUrl missing database name" };
    }
    return {
      ok: true,
      host: parsed.hostname || "127.0.0.1",
      port: parsed.port || "5432",
      user: decodeURIComponent(parsed.username || ""),
      password: decodeURIComponent(parsed.password || ""),
      database,
    };
  } catch {
    return { ok: false, reason: "databaseUrl is not a valid URL" };
  }
}

function fail(options, runId, startedAt, targetIdentity, reason) {
  const evidence = createEvidence({
    runId,
    operationType: OPERATION_TYPE.RESTORE_LOGICAL,
    recoveryLayer: RECOVERY_LAYER.LAYER_2,
    status: OPERATION_STATUS.FAILED,
    startedAt,
    endedAt: new Date().toISOString(),
    sourceIdentityMarker: options.sourceIdentity ?? null,
    sourceEnvironmentClassification: options.sourceClassification ?? null,
    targetIdentityMarker: targetIdentity,
    failureBlockReason: redactText(reason),
    checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.NOT_CHECKED,
  });
  if (options.evidenceDir) {
    try {
      persistEvidence(options.evidenceDir, evidence);
    } catch {
      // ignore
    }
  }
  return { ok: false, status: OPERATION_STATUS.FAILED, runId, targetIdentity, reason: redactText(reason), evidence };
}

/**
 * @param {string} databaseUrl
 * @returns {boolean}
 */
function isForbiddenActiveDatabaseUrl(databaseUrl) {
  const normalized = databaseUrl.trim().toLowerCase();
  if (!normalized) return true;
  // Fail closed on ambiguous localhost defaults that may hit an active cluster.
  if (/\/\/([^/@]*@)?(localhost|127\.0\.0\.1)(:|\/|$)/.test(normalized) && /\/postgres(\?|$)/.test(normalized)) {
    return true;
  }
  return false;
}
