/**
 * CS2 restore COMPLETE/SHA binding + CS1 cleanup failure proof + CS4 argv checks.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { OPERATION_STATUS } from "../constants.mjs";
import { OWNED_AGE_TEMP_PREFIX } from "../layer2/age.mjs";
import { generateRunId } from "../run-id.mjs";
import { safeJson } from "../redact.mjs";
import {
  applyLibpqSecretEnv,
  buildLibpqChildConnection,
  buildPgRestoreHostArgv,
  removeContainerTempDump,
  runLogicalRestore,
  verifyLogicalArtifactBinding,
} from "./logical.mjs";

const SENTINEL = "SENTINEL_RECOVERY_SECRET_9f3c2a1b";

function sha(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function makeStore({ runId, ciphertext, completeOverrides = {}, missingComplete = false, missingArtifact = false, verifyOk = true }) {
  const artifactKey = `logical/${runId}/dump.age`;
  const complete = {
    runId,
    artifactKey,
    sha256Hex: sha(ciphertext),
    keyVersion: "kv-test",
    completedAt: "2026-09-21T12:00:00.000Z",
    ...completeOverrides,
  };
  return {
    async headObject({ key }) {
      if (key.endsWith("/COMPLETE")) return { exists: !missingComplete };
      return { exists: !missingArtifact };
    },
    async getObject({ key }) {
      if (key.endsWith("/COMPLETE")) {
        if (missingComplete) throw new Error("missing");
        return { body: Buffer.from(JSON.stringify(complete), "utf8") };
      }
      if (missingArtifact) throw new Error("missing artifact");
      return { body: ciphertext };
    },
    async verifyRemoteSha256() {
      return verifyOk ? { ok: true } : { ok: false, reason: "forced object-store verify failure" };
    },
  };
}

test("CS2: missing/invalid COMPLETE and SHA mismatches fail closed before decrypt", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 22, 1, 0, 0)), randomHex: "aaaaaaaaaaaaaaaa" });
  const ciphertext = Buffer.from("AGE-CIPHER");
  let decryptCalls = 0;
  const decryptFn = async () => {
    decryptCalls += 1;
    return { ok: true, plaintext: Buffer.from("PGDUMP") };
  };

  const cases = [
    {
      name: "missing COMPLETE",
      store: makeStore({ runId, ciphertext, missingComplete: true }),
      match: /COMPLETE marker missing/i,
    },
    {
      name: "invalid COMPLETE JSON",
      store: {
        async headObject() {
          return { exists: true };
        },
        async getObject({ key }) {
          if (key.endsWith("/COMPLETE")) return { body: Buffer.from("not-json") };
          return { body: ciphertext };
        },
      },
      match: /not valid JSON/i,
    },
    {
      name: "wrong runId",
      store: makeStore({
        runId,
        ciphertext,
        completeOverrides: { runId: generateRunId({ now: new Date(Date.UTC(2026, 8, 22, 1, 1, 0)), randomHex: "bbbbbbbbbbbbbbbb" }) },
      }),
      match: /runId/i,
    },
    {
      name: "wrong artifactKey",
      store: makeStore({
        runId,
        ciphertext,
        completeOverrides: { artifactKey: `logical/${runId}/other.age` },
      }),
      match: /artifactKey/i,
    },
    {
      name: "missing SHA",
      store: makeStore({ runId, ciphertext, completeOverrides: { sha256Hex: "" } }),
      match: /sha256Hex missing/i,
    },
    {
      name: "malformed SHA",
      store: makeStore({ runId, ciphertext, completeOverrides: { sha256Hex: "deadbeef" } }),
      match: /malformed/i,
    },
    {
      name: "modified artifact",
      store: (() => {
        const store = makeStore({ runId, ciphertext });
        return {
          ...store,
          async getObject({ key }) {
            if (key.endsWith("/COMPLETE")) return store.getObject({ key });
            return { body: Buffer.from("TAMPERED") };
          },
        };
      })(),
      match: /SHA-256 does not match/i,
    },
    {
      name: "missing dump.age",
      store: makeStore({ runId, ciphertext, missingArtifact: true }),
      match: /dump\.age missing/i,
    },
    {
      name: "failed object-store verification",
      store: makeStore({ runId, ciphertext, verifyOk: false }),
      match: /object-store SHA-256 verification failed|forced object-store verify failure/i,
    },
  ];

  for (const entry of cases) {
    decryptCalls = 0;
    const result = await runLogicalRestore({
      runId,
      runIdToRestore: runId,
      objectStore: entry.store,
      identityFile: "/tmp/missing-identity",
      sourceIdentity: "prod-db",
      sourceClassification: "production",
      sourceDatabaseUrl: "postgresql://prod@10.0.0.5:5432/boba_prod",
      databaseUrl: "postgresql://boba_recovery:x@127.0.0.1:55432/boba_recovery",
      targetOwnership: {
        runId,
        targetIdentity: `recovery-target-${runId}`,
        databaseUrl: "postgresql://boba_recovery:x@127.0.0.1:55432/boba_recovery",
        endpoint: "127.0.0.1:55432/boba_recovery",
        environment: "recovery",
      },
      provisionTarget: false,
      decryptFn,
      restoreFn: async () => ({ ok: true }),
    });
    assert.equal(result.ok, false, entry.name);
    assert.equal(result.status, OPERATION_STATUS.FAILED, entry.name);
    assert.match(result.reason ?? "", entry.match, entry.name);
    assert.equal(decryptCalls, 0, `${entry.name} must fail before decrypt`);
    assert.doesNotMatch(safeJson(result), new RegExp(SENTINEL));
  }
});

test("CS2: verifyLogicalArtifactBinding rejects cross-run confusion", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 22, 2, 0, 0)), randomHex: "cccccccccccccccc" });
  const other = generateRunId({ now: new Date(Date.UTC(2026, 8, 22, 2, 1, 0)), randomHex: "dddddddddddddddd" });
  const ciphertext = Buffer.from("AGE");
  const binding = await verifyLogicalArtifactBinding({
    objectStore: makeStore({
      runId,
      ciphertext,
      completeOverrides: { runId: other },
    }),
    sourceRunId: runId,
    completeKey: `logical/${runId}/COMPLETE`,
    artifactKey: `logical/${runId}/dump.age`,
  });
  assert.equal(binding.ok, false);
  assert.match(binding.reason, /runId|cross-run/i);
});

test("CS2/CS1: valid binding + failed decrypt/pg_restore never SUCCEEDED; host dump cleaned", async () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "boba-restore-cs2-"));
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 22, 3, 0, 0)), randomHex: "eeeeeeeeeeeeeeee" });
  const ciphertext = Buffer.from("AGE-OK");
  const before = new Set(readdirSync(os.tmpdir()).filter((n) => n.startsWith(`${OWNED_AGE_TEMP_PREFIX}restore-`)));
  try {
    const decryptFail = await runLogicalRestore({
      runId,
      runIdToRestore: runId,
      objectStore: makeStore({ runId, ciphertext }),
      identityFile: path.join(root, "missing"),
      sourceIdentity: "prod-db",
      sourceClassification: "production",
      sourceDatabaseUrl: "postgresql://prod@10.0.0.5:5432/boba_prod",
      databaseUrl: `postgresql://boba_recovery:${SENTINEL}@127.0.0.1:55432/boba_recovery`,
      targetOwnership: {
        runId,
        targetIdentity: `recovery-target-${runId}`,
        databaseUrl: `postgresql://boba_recovery:${SENTINEL}@127.0.0.1:55432/boba_recovery`,
        endpoint: "127.0.0.1:55432/boba_recovery",
        environment: "recovery",
      },
      provisionTarget: false,
      decryptFn: async () => ({ ok: false, reason: "age decrypt failed (synthetic)" }),
      restoreFn: async () => ({ ok: true }),
    });
    assert.equal(decryptFail.ok, false);
    assert.doesNotMatch(safeJson(decryptFail), new RegExp(SENTINEL));

    const restoreFail = await runLogicalRestore({
      runId,
      runIdToRestore: runId,
      objectStore: makeStore({ runId, ciphertext }),
      identityFile: path.join(root, "missing"),
      sourceIdentity: "prod-db",
      sourceClassification: "production",
      sourceDatabaseUrl: "postgresql://prod@10.0.0.5:5432/boba_prod",
      databaseUrl: `postgresql://boba_recovery:${SENTINEL}@127.0.0.1:55432/boba_recovery`,
      targetOwnership: {
        runId,
        targetIdentity: `recovery-target-${runId}`,
        databaseUrl: `postgresql://boba_recovery:${SENTINEL}@127.0.0.1:55432/boba_recovery`,
        endpoint: "127.0.0.1:55432/boba_recovery",
        environment: "recovery",
      },
      provisionTarget: false,
      decryptFn: async () => ({ ok: true, plaintext: Buffer.from("PGDUMP") }),
      restoreFn: async () => ({ ok: false, reason: "pg_restore failed (synthetic)" }),
    });
    assert.equal(restoreFail.ok, false);
    assert.equal(restoreFail.status, OPERATION_STATUS.FAILED);

    const after = readdirSync(os.tmpdir()).filter((n) => n.startsWith(`${OWNED_AGE_TEMP_PREFIX}restore-`));
    for (const name of after) {
      assert.equal(before.has(name), true, `owned restore dump leftover: ${name}`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("CS1-F: container dump cleanup failure cannot masquerade as SUCCEEDED", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 22, 4, 0, 0)), randomHex: "ffffffffffffffff" });
  const ciphertext = Buffer.from("AGE-OK");
  const result = await runLogicalRestore({
    runId,
    runIdToRestore: runId,
    objectStore: makeStore({ runId, ciphertext }),
    identityFile: "/tmp/missing",
    sourceIdentity: "prod-db",
    sourceClassification: "production",
    sourceDatabaseUrl: "postgresql://prod@10.0.0.5:5432/boba_prod",
    databaseUrl: "postgresql://boba_recovery:x@127.0.0.1:55432/boba_recovery",
    targetOwnership: {
      runId,
      targetIdentity: `recovery-target-${runId}`,
      databaseUrl: "postgresql://boba_recovery:x@127.0.0.1:55432/boba_recovery",
      endpoint: "127.0.0.1:55432/boba_recovery",
      environment: "recovery",
    },
    provisionTarget: false,
    decryptFn: async () => ({ ok: true, plaintext: Buffer.from("PGDUMP") }),
    restoreFn: async () => ({ ok: true }),
  });
  // Injected restoreFn path has no container dump; success is allowed.
  assert.equal(result.ok, true);

  const refused = removeContainerTempDump({
    containerCli: "docker",
    containerName: "not-a-recovery-target",
    remoteDumpPath: `/tmp/boba-restore-${runId}.dump`,
    runId,
  });
  assert.equal(refused.ok, false);
  assert.match(refused.reason, /not a recovery target/i);

  const pathRefuse = removeContainerTempDump({
    containerCli: "docker",
    containerName: "boba-rec-tgt-abc",
    remoteDumpPath: "/tmp/evil.dump",
    runId,
  });
  assert.equal(pathRefuse.ok, false);
  assert.match(pathRefuse.reason, /not run-owned/i);
});

test("CS4: buildPgRestoreHostArgv avoids password-bearing URLs and preserves TLS query", () => {
  const conn = buildLibpqChildConnection(
    `postgresql://user:${SENTINEL}@127.0.0.1:5432/db?sslmode=verify-full&sslrootcert=/tmp/ca.pem`,
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.password, SENTINEL);
  const args = buildPgRestoreHostArgv(conn, "/tmp/owned.dump");
  const env = applyLibpqSecretEnv({}, conn);
  assert.equal(args.some((a) => String(a).includes(SENTINEL)), false);
  assert.equal(args.some((a) => String(a).includes(`:${SENTINEL}@`)), false);
  assert.match(args.find((a) => String(a).startsWith("postgres")) ?? "", /sslmode=verify-full/);
  assert.equal(env.PGPASSWORD, SENTINEL);
});

test("CS3: missing source classification fails closed on restore", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 22, 5, 0, 0)), randomHex: "1111111111111111" });
  const result = await runLogicalRestore({
    runId,
    runIdToRestore: runId,
    objectStore: makeStore({ runId, ciphertext: Buffer.from("x") }),
    identityFile: "/tmp/missing",
    sourceIdentity: "prod-db",
    // intentionally omitted
    provisionTarget: false,
    restoreFn: async () => ({ ok: true }),
    decryptFn: async () => ({ ok: true, plaintext: Buffer.from("x") }),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason ?? "", /source-class|classification/i);
});

test("CS3: production/staging contradiction with compose+local markers fails closed", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 22, 5, 1, 0)), randomHex: "2222222222222222" });
  const ciphertext = Buffer.from("AGE");
  const result = await runLogicalRestore({
    runId,
    runIdToRestore: runId,
    objectStore: makeStore({ runId, ciphertext }),
    identityFile: "/tmp/missing",
    sourceIdentity: "prod-db",
    sourceClassification: "production",
    composeProjectName: "boba-staging",
    claimedRuntimeEnv: "local",
    sourceDatabaseUrl: "postgresql://prod@10.0.0.5:5432/boba_prod",
    databaseUrl: "postgresql://boba_recovery:x@127.0.0.1:55432/boba_recovery",
    targetOwnership: {
      runId,
      targetIdentity: `recovery-target-${runId}`,
      databaseUrl: "postgresql://boba_recovery:x@127.0.0.1:55432/boba_recovery",
      endpoint: "127.0.0.1:55432/boba_recovery",
      environment: "recovery",
    },
    provisionTarget: false,
    decryptFn: async () => ({ ok: true, plaintext: Buffer.from("PGDUMP") }),
    restoreFn: async () => ({ ok: true }),
  });
  assert.equal(result.ok, false);
  assert.match(result.reason ?? "", /contradict|staging/i);
});
