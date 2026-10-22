/**
 * CS1 plaintext lifecycle: owned decrypt temps must not remain after success/failure.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { cleanupAgeTools, resolveAgeTools } from "../tools/age-tools.mjs";
import {
  cleanupOwnedAgeTempPath,
  createOwnedAgeTempPath,
  decryptFromAge,
  encryptToAge,
  OWNED_AGE_TEMP_PREFIX,
} from "./age.mjs";

test("CS1-A/B: successful and failed decrypt leave no owned plaintext under tmp", async (t) => {
  const tools = resolveAgeTools();
  if (!tools.ok) {
    t.skip(`age tools unavailable: ${tools.reason}`);
    return;
  }
  const root = mkdtempSync(path.join(os.tmpdir(), "boba-age-cs1-"));
  const identityFile = path.join(root, "key.txt");
  try {
    const keygen = spawnSync(tools.ageKeygenBin, ["-o", identityFile], {
      encoding: "utf8",
      timeout: 30_000,
    });
    assert.equal(keygen.status, 0, keygen.stderr);
    const combined = `${keygen.stdout ?? ""}\n${keygen.stderr ?? ""}`;
    const recipientMatch = /Public key:\s*(age1[a-z0-9]+)/i.exec(combined);
    assert.ok(recipientMatch, `age-keygen public key missing: ${combined}`);
    const recipient = recipientMatch[1];

    const before = new Set(
      readdirSync(os.tmpdir()).filter((name) => name.startsWith(`${OWNED_AGE_TEMP_PREFIX}dec-`)),
    );

    const enc = await encryptToAge({
      plaintext: Buffer.from("PLAINTEXT-DUMP-BYTES"),
      recipients: [recipient],
      ageBin: tools.ageBin,
    });
    assert.equal(enc.ok, true, enc.reason);

    const ok = await decryptFromAge({
      ciphertext: enc.ciphertext,
      identityFile,
      ageBin: tools.ageBin,
    });
    assert.equal(ok.ok, true, ok.reason);
    assert.equal(ok.plaintextRetained, false);
    assert.equal(ok.outputPath, null);
    assert.equal(Buffer.from(ok.plaintext).toString("utf8"), "PLAINTEXT-DUMP-BYTES");

    const afterOk = readdirSync(os.tmpdir()).filter((name) => name.startsWith(`${OWNED_AGE_TEMP_PREFIX}dec-`));
    for (const name of afterOk) {
      assert.equal(before.has(name), true, `owned plaintext leftover: ${name}`);
    }

    const bad = await decryptFromAge({
      ciphertext: Buffer.from("not-age-ciphertext"),
      identityFile,
      ageBin: tools.ageBin,
    });
    assert.equal(bad.ok, false);
    const afterBad = readdirSync(os.tmpdir()).filter((name) => name.startsWith(`${OWNED_AGE_TEMP_PREFIX}dec-`));
    for (const name of afterBad) {
      assert.equal(before.has(name), true, `owned plaintext leftover after fail: ${name}`);
    }
  } finally {
    cleanupAgeTools(tools.cleanupDir);
    rmSync(root, { recursive: true, force: true });
  }
});

test("CS1-D: cleanup refuses foreign / unowned paths", () => {
  const foreign = path.join(os.tmpdir(), "foreign-not-owned.dump");
  writeFileSync(foreign, "x");
  try {
    const refused = cleanupOwnedAgeTempPath(foreign, "token");
    assert.equal(refused.ok, false);
    assert.equal(existsSync(foreign), true);
  } finally {
    rmSync(foreign, { force: true });
  }

  const owned = createOwnedAgeTempPath("dec", ".dump");
  writeFileSync(owned.path, "x", { mode: 0o600 });
  const wrongToken = cleanupOwnedAgeTempPath(owned.path, "not-the-token");
  assert.equal(wrongToken.ok, false);
  assert.equal(existsSync(owned.path), true);
  const cleaned = cleanupOwnedAgeTempPath(owned.path, owned.ownershipToken);
  assert.equal(cleaned.ok, true);
  assert.equal(existsSync(owned.path), false);
});

test("CS1-G: concurrent ownership tokens do not collide", () => {
  const a = createOwnedAgeTempPath("dec", ".dump");
  const b = createOwnedAgeTempPath("dec", ".dump");
  assert.notEqual(a.path, b.path);
  assert.notEqual(a.ownershipToken, b.ownershipToken);
});
