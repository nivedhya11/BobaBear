/**
 * C3: object-store exception containment + owned-target cleanup reporting.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { OPERATION_STATUS } from "../constants.mjs";
import { generateRunId } from "../run-id.mjs";
import { safeJson } from "../redact.mjs";
import { runLogicalRestore, verifyLogicalArtifactBinding } from "./logical.mjs";

const SENTINEL = "SENTINEL_STORE_SECRET_c3a1";

function sha(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function baseComplete(runId, ciphertext) {
  return {
    runId,
    artifactKey: `logical/${runId}/dump.age`,
    sha256Hex: sha(ciphertext),
    keyVersion: "kv-test",
    completedAt: "2026-09-21T12:00:00.000Z",
  };
}

function ownedOpts(runId, store, extras = {}) {
  return {
    runId,
    runIdToRestore: runId,
    objectStore: store,
    identityFile: "/tmp/missing-identity",
    sourceIdentity: "prod-db",
    sourceClassification: "production",
    sourceDatabaseUrl: "postgresql://prod@10.0.0.5:5432/boba_prod",
    databaseUrl: `postgresql://boba_recovery:${SENTINEL}@127.0.0.1:55432/boba_recovery`,
    targetOwnership: {
      runId,
      targetIdentity: `recovery-target-${runId}`,
      databaseUrl: `postgresql://boba_recovery:${SENTINEL}@127.0.0.1:55432/boba_recovery`,
      endpoint: "127.0.0.1|127.0.0.1:55432/boba_recovery",
      environment: "recovery",
    },
    provisionTarget: false,
    decryptFn: async () => ({ ok: true, plaintext: Buffer.from("PGDUMP") }),
    restoreFn: async () => ({ ok: true }),
    ...extras,
  };
}

test("C3: headObject throw/reject fail closed with no SUCCEEDED proof", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 23, 1, 0, 0)), randomHex: "aaaaaaaaaaaaaaaa" });
  const ciphertext = Buffer.from("AGE");

  const throwStore = {
    async headObject() {
      throw new Error("head boom");
    },
    async getObject() {
      return { body: Buffer.from("x") };
    },
  };
  const rejectStore = {
    async headObject() {
      return Promise.reject(new Error("head reject"));
    },
    async getObject() {
      return { body: Buffer.from("x") };
    },
  };

  for (const store of [throwStore, rejectStore]) {
    const result = await runLogicalRestore(ownedOpts(runId, store));
    assert.equal(result.ok, false);
    assert.equal(result.status, OPERATION_STATUS.FAILED);
    assert.doesNotMatch(safeJson(result), /\bSUCCEEDED\b/);
    assert.match(result.reason ?? "", /headObject|head boom|head reject/i);
  }
});

test("C3: getObject COMPLETE/artifact throw fail closed", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 23, 1, 1, 0)), randomHex: "bbbbbbbbbbbbbbbb" });
  const ciphertext = Buffer.from("AGE");

  const completeThrow = {
    async headObject() {
      return { exists: true };
    },
    async getObject({ key }) {
      if (key.endsWith("/COMPLETE")) throw new Error("complete get boom");
      return { body: ciphertext };
    },
  };
  const artifactThrow = {
    async headObject() {
      return { exists: true };
    },
    async getObject({ key }) {
      if (key.endsWith("/COMPLETE")) {
        return { body: Buffer.from(JSON.stringify(baseComplete(runId, ciphertext)), "utf8") };
      }
      throw new Error("artifact get boom");
    },
  };

  for (const [store, match] of [
    [completeThrow, /COMPLETE|complete get boom/i],
    [artifactThrow, /dump\.age|artifact get boom/i],
  ]) {
    const result = await runLogicalRestore(ownedOpts(runId, store));
    assert.equal(result.ok, false);
    assert.equal(result.status, OPERATION_STATUS.FAILED);
    assert.match(result.reason ?? "", match);
    assert.doesNotMatch(safeJson(result), new RegExp(SENTINEL));
  }
});

test("C3: verifyRemoteSha256 throw/reject fail closed", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 23, 1, 2, 0)), randomHex: "cccccccccccccccc" });
  const ciphertext = Buffer.from("AGE-VERIFY");
  const complete = baseComplete(runId, ciphertext);

  function storeWithVerify(verifyImpl) {
    return {
      async headObject() {
        return { exists: true };
      },
      async getObject({ key }) {
        if (key.endsWith("/COMPLETE")) return { body: Buffer.from(JSON.stringify(complete), "utf8") };
        return { body: ciphertext };
      },
      verifyRemoteSha256: verifyImpl,
    };
  }

  const throwResult = await runLogicalRestore(
    ownedOpts(
      runId,
      storeWithVerify(async () => {
        throw new Error("verify boom");
      }),
    ),
  );
  assert.equal(throwResult.ok, false);
  assert.match(throwResult.reason ?? "", /verifyRemoteSha256|verify boom/i);

  const rejectResult = await runLogicalRestore(
    ownedOpts(
      runId,
      storeWithVerify(async () => Promise.reject(new Error("verify reject"))),
    ),
  );
  assert.equal(rejectResult.ok, false);
  assert.match(rejectResult.reason ?? "", /verifyRemoteSha256|verify reject/i);
});

test("C3: verifyLogicalArtifactBinding contains store exceptions", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 23, 1, 3, 0)), randomHex: "dddddddddddddddd" });
  const binding = await verifyLogicalArtifactBinding({
    objectStore: {
      async headObject() {
        throw new Error("direct head failure");
      },
      async getObject() {
        return { body: Buffer.from("{}") };
      },
    },
    sourceRunId: runId,
    completeKey: `logical/${runId}/COMPLETE`,
    artifactKey: `logical/${runId}/dump.age`,
  });
  assert.equal(binding.ok, false);
  assert.match(binding.reason, /headObject|direct head failure/i);
});

test("C3: binding failure does not provision and never SUCCEEDED", async () => {
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 23, 1, 4, 0)), randomHex: "eeeeeeeeeeeeeeee" });
  let provisionCalls = 0;
  const result = await runLogicalRestore({
    runId,
    runIdToRestore: runId,
    objectStore: {
      async headObject() {
        throw new Error("no complete");
      },
      async getObject() {
        return { body: Buffer.from("x") };
      },
    },
    identityFile: "/tmp/missing",
    sourceIdentity: "prod-db",
    sourceClassification: "production",
    provisionTarget: true,
    // Inject a restoreFn so default provision path is still selected only when binding passes.
    // provisionTarget true without restoreFn would call provisionLogicalTarget — we stub via
    // failing binding first. Count would stay 0 because binding fails before provision.
    decryptFn: async () => {
      provisionCalls += 1;
      return { ok: true, plaintext: Buffer.from("x") };
    },
    restoreFn: async () => {
      provisionCalls += 1;
      return { ok: true };
    },
  });
  assert.equal(result.ok, false);
  assert.equal(provisionCalls, 0);
  assert.doesNotMatch(safeJson(result), /\bSUCCEEDED\b/);
});

test("C3: foreign container dump paths are never deleted", async () => {
  const { removeContainerTempDump } = await import("./logical.mjs");
  const runId = generateRunId({ now: new Date(Date.UTC(2026, 8, 23, 1, 5, 0)), randomHex: "ffffffffffffffff" });
  const refused = removeContainerTempDump({
    containerCli: "docker",
    containerName: "postgres",
    remoteDumpPath: "/var/lib/postgresql/data/evil.dump",
    runId,
  });
  assert.equal(refused.ok, false);
  assert.match(refused.reason, /not run-owned|not a recovery target/i);
});
