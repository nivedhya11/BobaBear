/**
 * C1: scheduled/oneshot entry points supply explicit source classification.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { CLI_EXIT } from "./constants.mjs";
import { spawnSync } from "node:child_process";
import { DEFAULT_UNIT_DIR, parseUnitFile, validateSystemdUnits } from "./systemd/validate.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cli = path.join(repoRoot, "scripts/recovery/cli.mjs");

function run(args, env) {
  return spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    env: env ?? process.env,
  });
}

const SERVICE_FILES = [
  "boba-recovery-layer1-full.service",
  "boba-recovery-layer1-diff.service",
  "boba-recovery-layer2-logical.service",
];

test("C1: each systemd backup service template supplies --source-class expansion", () => {
  for (const name of SERVICE_FILES) {
    const text = readFileSync(path.join(DEFAULT_UNIT_DIR, name), "utf8");
    const parsed = parseUnitFile(text);
    const execStart = parsed.Service?.ExecStart ?? "";
    assert.match(execStart, /run-with-flock\.sh/, name);
    assert.match(execStart, /--source-class=\$\{BOBA_RECOVERY_SOURCE_CLASSIFICATION\}/, name);
    assert.doesNotMatch(execStart, /--source-class=production\b/, name);
  }
  const validated = validateSystemdUnits({ unitDir: DEFAULT_UNIT_DIR, tryAnalyze: false });
  assert.equal(validated.ok, true, validated.reason);
});

test("C1: compose.recovery oneshot requires explicit class (no silent default)", () => {
  const text = readFileSync(path.join(repoRoot, "compose.recovery.yaml"), "utf8");
  assert.match(text, /BOBA_RECOVERY_SOURCE_CLASSIFICATION:\?/);
  assert.match(text, /"--source-class"/);
  assert.match(
    text,
    /\$\{BOBA_RECOVERY_SOURCE_CLASSIFICATION:\?BOBA_RECOVERY_SOURCE_CLASSIFICATION must be set explicitly/,
  );
  assert.doesNotMatch(text, /BOBA_RECOVERY_SOURCE_CLASSIFICATION:-/);
  assert.doesNotMatch(text, /--source-class",\s*"production"/);
});

test("C1: missing classification remains BLOCKED (flag and env absent)", () => {
  const env = { ...process.env, BOBA_RECOVERY_AGE_BIN: "age" };
  delete env.BOBA_RECOVERY_SOURCE_CLASSIFICATION;
  const result = run(
    [
      "backup",
      "layer2",
      "--json",
      "--recipient",
      "age1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3waw4h",
      "--local-store",
      "/tmp/boba-recovery-store-test",
      "--source",
      "prod-db",
    ],
    env,
  );
  assert.equal(result.status, CLI_EXIT.BLOCKED);
  assert.match(result.stdout, /source-class|classification/i);
  assert.doesNotMatch(result.stdout, /\bSUCCEEDED\b/);
});

test("C1: empty expanded class (simulating unset systemd var) is BLOCKED", () => {
  const result = run(
    [
      "backup",
      "layer1",
      "--type",
      "full",
      "--json",
      "--source-class=",
      "--source",
      "prod-db",
    ],
    { ...process.env, BOBA_RECOVERY_SOURCE_CLASSIFICATION: "" },
  );
  assert.equal(result.status, CLI_EXIT.BLOCKED);
  assert.match(result.stdout, /source-class|classification/i);
});

test("C1: explicit env classification accepted at CLI boundary (no backup executed)", () => {
  const result = run(
    [
      "backup",
      "layer2",
      "--json",
      "--recipient",
      "age1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3waw4h",
      "--local-store",
      "/tmp/boba-recovery-store-test",
      "--source",
      "prod-db",
    ],
    {
      ...process.env,
      BOBA_RECOVERY_AGE_BIN: "age",
      BOBA_RECOVERY_SOURCE_CLASSIFICATION: "production",
    },
  );
  // Classification boundary accepted; may still BLOCK/FAIL on dump/store — but not for missing class.
  assert.notEqual(result.status, undefined);
  assert.doesNotMatch(result.stdout, /SOURCE_CLASSIFICATION_REQUIRED|explicit --source-class/i);
});

test("C1: invalid class via env is BLOCKED", () => {
  const result = run(
    [
      "backup",
      "layer2",
      "--json",
      "--recipient",
      "age1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3waw4h",
      "--local-store",
      "/tmp/boba-recovery-store-test",
      "--source",
      "prod-db",
    ],
    {
      ...process.env,
      BOBA_RECOVERY_AGE_BIN: "age",
      BOBA_RECOVERY_SOURCE_CLASSIFICATION: "not-a-class",
    },
  );
  assert.equal(result.status, CLI_EXIT.BLOCKED);
  assert.match(result.stdout, /SOURCE_CLASSIFICATION_INVALID|known value|classification/i);
});

test("C1: staging class with contradictory markers is BLOCKED", () => {
  const result = run(
    [
      "backup",
      "layer2",
      "--json",
      "--source-class",
      "production",
      "--recipient",
      "age1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3waw4h",
      "--local-store",
      "/tmp/boba-recovery-store-test",
      "--source",
      "prod-db",
    ],
    {
      ...process.env,
      BOBA_RECOVERY_AGE_BIN: "age",
      COMPOSE_PROJECT_NAME: "boba-staging",
      BOBA_BEAR_ENV: "local",
    },
  );
  assert.equal(result.status, CLI_EXIT.BLOCKED);
  assert.match(result.stdout, /contradict|staging/i);
});
