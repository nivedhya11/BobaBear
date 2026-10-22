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

  const sourceRunId = options.runIdToRestore;
  if (!isValidRunId(sourceRunId)) {
    return fail(options, runId, startedAt, targetIdentity, "runIdToRestore must be a valid RUN_ID");
  }

  const completeKey = `logical/${sourceRunId}/COMPLETE`;
  const artifactKey = `logical/${sourceRunId}/dump.age`;

  // Verify artifact integrity before provisioning a disposable target (CS2/C3).
  let binding;
  try {
    binding = await verifyLogicalArtifactBinding({
      objectStore: options.objectStore,
      sourceRunId,
      completeKey,
      artifactKey,
    });
  } catch (error) {
    return fail(
      options,
      runId,
      startedAt,
      targetIdentity,
      sanitizeStoreFailure(error, "object-store binding verification failed"),
    );
  }
  if (!binding.ok) {
    return fail(options, runId, startedAt, targetIdentity, binding.reason);
  }

  const ciphertext = binding.ciphertext;

  try {
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

    let plaintext;
    if (typeof options.decryptFn === "function") {
      const decrypted = await options.decryptFn({ ciphertext, identityFile: options.identityFile });
      if (!decrypted?.ok || !decrypted.plaintext) {
        return failAfterOwnedCleanup(
          options,
          runId,
          startedAt,
          targetIdentity,
          provisioned,
          decrypted?.reason ?? "age decrypt failed",
        );
      }
      plaintext = decrypted.plaintext;
    } else {
      const decrypted = await decryptFromAge({
        ciphertext,
        identityFile: options.identityFile,
        ageBin: options.ageBin,
      });
      if (!decrypted.ok) {
        return failAfterOwnedCleanup(
          options,
          runId,
          startedAt,
          targetIdentity,
          provisioned,
          decrypted.reason,
        );
      }
      plaintext = decrypted.plaintext;
    }

    if (!options.restoreFn && !databaseUrl) {
      return failAfterOwnedCleanup(
        options,
        runId,
        startedAt,
        targetIdentity,
        provisioned,
        "logical restore requires a provisioned fresh recovery database (or owned --database-url with ownership descriptor)",
      );
    }

    if (databaseUrl && isForbiddenActiveDatabaseUrl(databaseUrl)) {
      return failAfterOwnedCleanup(
        options,
        runId,
        startedAt,
        targetIdentity,
        provisioned,
        "databaseUrl resolves to a forbidden active/default endpoint; refuse restore",
      );
    }

    const dumpFile = writeOwnedAgeTempFile(plaintext, {
      kind: "restore",
      suffix: ".dump",
      ownershipToken: runId.replace(/[^a-zA-Z0-9_-]/g, "").slice(-32),
    });
    if (!dumpFile.ok) {
      return failAfterOwnedCleanup(
        options,
        runId,
        startedAt,
        targetIdentity,
        provisioned,
        dumpFile.reason,
      );
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
          const conn = buildLibpqChildConnection(databaseUrl);
          if (!conn.ok) {
            return { ok: false, reason: conn.reason };
          }
          const result = spawnSync("pg_restore", buildPgRestoreHostArgv(conn, filePath), {
            encoding: "utf8",
            env: applyLibpqSecretEnv(process.env, conn),
          });
          return evaluatePgRestoreResult(result);
        });
      const restored = await restoreFn(dumpPath);
      if (!restored?.ok) {
        return failAfterOwnedCleanup(
          options,
          runId,
          startedAt,
          targetIdentity,
          provisioned,
          restored?.reason ?? "pg_restore failed",
        );
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
      return failAfterOwnedCleanup(
        options,
        runId,
        startedAt,
        targetIdentity,
        provisioned,
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
  } catch (error) {
    return failAfterOwnedCleanup(
      options,
      runId,
      startedAt,
      targetIdentity,
      provisioned,
      sanitizeStoreFailure(error, "logical restore failed closed on unexpected error"),
    );
  }
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
    let head;
    try {
      head = await objectStore.headObject({ key: completeKey });
    } catch (error) {
      return {
        ok: false,
        reason: sanitizeStoreFailure(error, "object-store headObject failed for COMPLETE"),
      };
    }
    if (!head?.exists) {
      return { ok: false, reason: "COMPLETE marker missing; refuse incomplete Layer 2 artifact" };
    }
  }

  let completeBody;
  try {
    const completeRemote = await objectStore.getObject({ key: completeKey });
    completeBody = completeRemote?.body;
  } catch (error) {
    return {
      ok: false,
      reason: sanitizeStoreFailure(error, "COMPLETE marker missing; refuse incomplete Layer 2 artifact"),
    };
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
  } catch (error) {
    return {
      ok: false,
      reason: sanitizeStoreFailure(error, "dump.age missing; refuse incomplete Layer 2 artifact"),
    };
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
    let verified;
    try {
      verified = await objectStore.verifyRemoteSha256({
        key: artifactKey,
        expectedSha256Hex: expectedSha,
      });
    } catch (error) {
      return {
        ok: false,
        reason: sanitizeStoreFailure(error, "object-store verifyRemoteSha256 failed; refuse decrypt"),
      };
    }
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
 * Known libpq URI/query keys we preserve. Unknown security-shaped keys fail closed
 * rather than being silently dropped (which could weaken TLS/auth semantics).
 */
const LIBPQ_KNOWN_PARAMS = new Set([
  "host",
  "hostaddr",
  "port",
  "dbname",
  "user",
  "password",
  "passfile",
  "channel_binding",
  "connect_timeout",
  "client_encoding",
  "options",
  "application_name",
  "fallback_application_name",
  "keepalives",
  "keepalives_idle",
  "keepalives_interval",
  "keepalives_count",
  "tcp_user_timeout",
  "replication",
  "gssencmode",
  "sslmode",
  "requiressl",
  "sslcompression",
  "sslcert",
  "sslkey",
  "sslpassword",
  "sslrootcert",
  "sslcrl",
  "sslcrldir",
  "sslsni",
  "requirepeer",
  "ssl_min_protocol_version",
  "ssl_max_protocol_version",
  "krbsrvname",
  "gsslib",
  "gssdelegation",
  "service",
  "target_session_attrs",
  "load_balance_hosts",
  "sslnegotiation",
]);

const LIBPQ_SECURITY_KEY_PATTERN =
  /^(ssl|gss|krb|pass|cert|key|channel_binding|require|target_session|hostaddr)/i;

/** Identity / security query keys that must not carry conflicting duplicate values. */
const LIBPQ_IDENTITY_QUERY_KEYS = new Set([
  "host",
  "hostaddr",
  "port",
  "dbname",
  "user",
  "password",
  "sslpassword",
  "sslmode",
  "sslrootcert",
  "sslcert",
  "sslkey",
  "sslcrl",
  "sslcrldir",
  "passfile",
  "channel_binding",
  "gssencmode",
  "requiressl",
  "requirepeer",
  "target_session_attrs",
]);

/**
 * Collect known libpq query params. Conflicting repeated identity/security keys fail closed.
 * Matching duplicates collapse to a single value.
 *
 * @param {URL} parsed
 * @returns {{ ok: true, query: Record<string, string> } | { ok: false, reason: string }}
 */
function collectLibpqQueryParams(parsed) {
  /** @type {Record<string, string[]>} */
  const seen = {};
  for (const [rawKey, rawValue] of parsed.searchParams.entries()) {
    const key = String(rawKey);
    if (!LIBPQ_KNOWN_PARAMS.has(key)) {
      if (LIBPQ_SECURITY_KEY_PATTERN.test(key)) {
        return {
          ok: false,
          reason: `unsupported security-relevant libpq parameter '${key}'; refuse silent drop`,
        };
      }
      return {
        ok: false,
        reason: `unsupported libpq parameter '${key}'; refuse ambiguous connection semantics`,
      };
    }
    if (!seen[key]) seen[key] = [];
    seen[key].push(rawValue);
  }

  /** @type {Record<string, string>} */
  const query = {};
  for (const [key, values] of Object.entries(seen)) {
    const unique = [...new Set(values)];
    if (unique.length > 1) {
      if (LIBPQ_IDENTITY_QUERY_KEYS.has(key)) {
        return {
          ok: false,
          reason: `ambiguous repeated libpq parameter '${key}'; refuse conflicting values`,
        };
      }
      return {
        ok: false,
        reason: `ambiguous repeated libpq parameter '${key}'; refuse nondeterministic connection semantics`,
      };
    }
    query[key] = unique[0] ?? "";
  }
  return { ok: true, query };
}

/**
 * When hierarchical URI components and query identity fields both specify a value,
 * accept only exact matches. Conflicting forms fail closed rather than silently
 * preferring one side (which can retarget recovery).
 *
 * @param {string} field
 * @param {string} hierarchical
 * @param {string} fromQuery
 * @returns {{ ok: true, value: string } | { ok: false, reason: string }}
 */
function resolveIdentityField(field, hierarchical, fromQuery) {
  const hier = typeof hierarchical === "string" ? hierarchical : "";
  const q = typeof fromQuery === "string" ? fromQuery : "";
  if (hier && q && hier !== q) {
    return {
      ok: false,
      reason: `ambiguous databaseUrl ${field} (URI vs query disagree); refuse silent retarget`,
    };
  }
  return { ok: true, value: hier || q };
}

/**
 * Verify rebuilt connection URI carries no password/sslpassword components.
 * Uses structured URI inspection — not substring search of secret material —
 * so short/common passwords cannot false-reject valid URIs.
 *
 * @param {string} connectionUri
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
function assertPasswordFreeConnectionUri(connectionUri) {
  try {
    const rebuilt = new URL(connectionUri);
    if (rebuilt.password) {
      return { ok: false, reason: "refusing connectionUri that embeds password material" };
    }
    if (rebuilt.searchParams.has("password") || rebuilt.searchParams.has("sslpassword")) {
      return {
        ok: false,
        reason: "refusing connectionUri that embeds password/sslpassword query material",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "rebuilt connectionUri is not a valid URL" };
  }
}

/**
 * Parse a PostgreSQL URL into a password-free libpq connection representation.
 * Ordinary DB passwords are returned separately for child-only PGPASSWORD delivery.
 * Nonempty sslpassword is rejected fail-closed: PostgreSQL libpq has no env equivalent
 * and unattended recovery must not drop, argv-embed, or invent custody for it.
 *
 * @param {string} databaseUrl
 * @returns {{
 *   ok: true,
 *   host: string,
 *   port: string,
 *   user: string,
 *   password: string,
 *   database: string,
 *   connectionUri: string,
 *   query: Record<string, string>,
 * } | { ok: false, reason: string }}
 */
export function buildLibpqChildConnection(databaseUrl) {
  if (typeof databaseUrl !== "string" || !databaseUrl.trim()) {
    return { ok: false, reason: "databaseUrl required" };
  }
  try {
    const parsed = new URL(databaseUrl.trim());
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      return { ok: false, reason: "databaseUrl must be a postgresql URL" };
    }

    const collected = collectLibpqQueryParams(parsed);
    if (!collected.ok) return collected;
    const query = collected.query;

    // sslpassword has no libpq environment-variable equivalent (PGSSLPASSWORD is not
    // supported). Refuse nonempty values before any dump/restore/psql execution.
    const sslPasswordRaw = typeof query.sslpassword === "string" ? query.sslpassword : "";
    if (sslPasswordRaw.length > 0) {
      return {
        ok: false,
        reason:
          "encrypted client-key sslpassword is unsupported for unattended recovery (no libpq env equivalent; PGSSLPASSWORD is not valid); refuse",
      };
    }

    let pathDatabase = "";
    try {
      pathDatabase = decodeURIComponent(parsed.pathname.replace(/^\//, "").split("/")[0] ?? "");
    } catch {
      return { ok: false, reason: "databaseUrl database path is not valid percent-encoding" };
    }
    const dbnameResolved = resolveIdentityField(
      "dbname",
      pathDatabase,
      typeof query.dbname === "string" ? query.dbname : "",
    );
    if (!dbnameResolved.ok) return dbnameResolved;
    const database = dbnameResolved.value;
    if (!database) {
      return { ok: false, reason: "databaseUrl missing database name" };
    }

    const hostFromUri = parsed.hostname || "";
    const hostResolved = resolveIdentityField(
      "host",
      hostFromUri,
      typeof query.host === "string" ? query.host : "",
    );
    if (!hostResolved.ok) return hostResolved;
    const host = hostResolved.value;
    const hostaddr = typeof query.hostaddr === "string" ? query.hostaddr : "";
    if (!host && !hostaddr) {
      return {
        ok: false,
        reason: "databaseUrl missing host/hostaddr; refusing implicit localhost fallback",
      };
    }

    let userinfoPassword = "";
    try {
      userinfoPassword = parsed.password ? decodeURIComponent(parsed.password) : "";
    } catch {
      return { ok: false, reason: "databaseUrl password is not valid percent-encoding" };
    }
    let userFromUri = "";
    try {
      userFromUri = parsed.username ? decodeURIComponent(parsed.username) : "";
    } catch {
      return { ok: false, reason: "databaseUrl username is not valid percent-encoding" };
    }
    const userResolved = resolveIdentityField(
      "user",
      userFromUri,
      typeof query.user === "string" ? query.user : "",
    );
    if (!userResolved.ok) return userResolved;
    const user = userResolved.value;

    const queryPassword = typeof query.password === "string" ? query.password : "";
    if (userinfoPassword && queryPassword && userinfoPassword !== queryPassword) {
      return {
        ok: false,
        reason: "ambiguous databaseUrl password (userinfo vs query disagree); refuse",
      };
    }
    const password = userinfoPassword || queryPassword;

    const portResolved = resolveIdentityField(
      "port",
      parsed.port || "",
      typeof query.port === "string" && query.port.trim() ? query.port.trim() : "",
    );
    if (!portResolved.ok) return portResolved;
    const port = portResolved.value || "5432";

    // Rebuild a password-free URI that preserves supported query semantics (incl. sslmode).
    // host + hostaddr may both be present (libpq: host for name/TLS, hostaddr for TCP).
    // When authority host is empty (hostaddr-only), keep user/port in the query —
    // WHATWG URL drops authority port without a hostname.
    const safe = new URL(`${parsed.protocol}//`);
    if (host) {
      safe.hostname = host;
      if (port) safe.port = port;
      if (user) safe.username = user;
    }
    safe.password = "";
    safe.pathname = `/${database}`;
    for (const [key, value] of Object.entries(query)) {
      if (key === "password" || key === "sslpassword") continue;
      if (key === "dbname") continue;
      if (host) {
        if (key === "user" && user) continue;
        if (key === "port" && port) continue;
        if (key === "host") continue; // represented in authority hostname
      } else {
        if (key === "user") continue;
        if (key === "port") continue;
        if (key === "host") continue; // hostaddr-only form has no host
      }
      safe.searchParams.append(key, value);
    }
    if (!host) {
      if (user) safe.searchParams.set("user", user);
      if (port) safe.searchParams.set("port", port);
    }

    const connectionUri = safe.toString();
    const passwordFree = assertPasswordFreeConnectionUri(connectionUri);
    if (!passwordFree.ok) return passwordFree;

    return {
      ok: true,
      host: host || hostaddr,
      port,
      user,
      password,
      database,
      connectionUri,
      query,
    };
  } catch {
    return { ok: false, reason: "databaseUrl is not a valid URL" };
  }
}

/**
 * @deprecated Prefer buildLibpqChildConnection — kept as a compatible alias.
 * @param {string} databaseUrl
 */
export function parsePostgresConnection(databaseUrl) {
  return buildLibpqChildConnection(databaseUrl);
}

/**
 * Production argv builder for host pg_dump (CS4/C2). Secrets stay in child env only.
 * @param {{ ok: true, connectionUri: string }} conn
 * @returns {string[]}
 */
export function buildPgDumpArgv(conn) {
  return ["-Fc", conn.connectionUri];
}

/**
 * Production argv builder for host pg_restore (CS4/C2).
 * @param {{ ok: true, connectionUri: string }} conn
 * @param {string} dumpPath
 * @returns {string[]}
 */
export function buildPgRestoreHostArgv(conn, dumpPath) {
  return ["-d", conn.connectionUri, "--exit-on-error", "--clean", "--if-exists", dumpPath];
}

/**
 * Production argv builder for host psql (CS4/C2).
 * @param {{ ok: true, connectionUri: string }} conn
 * @param {string[]} extraArgs
 * @returns {string[]}
 */
export function buildPsqlHostArgv(conn, extraArgs = []) {
  return [conn.connectionUri, ...extraArgs];
}

/**
 * Deliver ordinary DB password to the child only via PGPASSWORD (never argv).
 * Does not set PGSSLPASSWORD — that is not a PostgreSQL libpq environment variable.
 * Nonempty sslpassword is rejected earlier in buildLibpqChildConnection.
 *
 * @param {NodeJS.ProcessEnv} baseEnv
 * @param {{ password?: string }} conn
 * @returns {NodeJS.ProcessEnv}
 */
export function applyLibpqSecretEnv(baseEnv, conn) {
  const env = { ...baseEnv };
  if (conn.password) env.PGPASSWORD = conn.password;
  return env;
}

/**
 * @param {unknown} error
 * @param {string} fallback
 */
function sanitizeStoreFailure(error, fallback) {
  const message = error instanceof Error ? error.message : String(error ?? fallback);
  return redactText(message && message.trim() ? `${fallback}: ${message}` : fallback);
}

/**
 * Cleanup only a positively identified run-owned target; report remaining resources if cleanup fails.
 * @param {import("./provision.mjs").ProvisionedLogicalTarget | null} provisioned
 */
function cleanupOwnedProvisionedTarget(provisioned) {
  if (!provisioned) return { ok: true, remaining: null };
  const cleaned = cleanupProvisionedTarget(provisioned);
  if (cleaned?.ok) return { ok: true, remaining: null };
  return {
    ok: false,
    reason: cleaned?.reason ?? "owned target cleanup failed",
    remaining: {
      kind: provisioned.kind,
      runId: provisioned.runId,
      targetIdentity: provisioned.targetIdentity,
      containerName: provisioned.containerName ?? null,
      volumeOrPathId: provisioned.volumeOrPathId ?? null,
    },
  };
}

function failAfterOwnedCleanup(options, runId, startedAt, targetIdentity, provisioned, reason) {
  const cleaned = cleanupOwnedProvisionedTarget(provisioned);
  if (!cleaned.ok) {
    return fail(
      options,
      runId,
      startedAt,
      targetIdentity,
      `${reason}; owned target cleanup incomplete: ${cleaned.reason}; remaining=${JSON.stringify(cleaned.remaining)}`,
    );
  }
  return fail(options, runId, startedAt, targetIdentity, reason);
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
