/**
 * C1/T1: scheduled/oneshot entry points supply explicit source classification.
 * Positive classification acceptance exercises the production resolver only —
 * never the backup/dump/provider execution path.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { CLI_EXIT } from "./constants.mjs";
import { spawnSync } from "node:child_process";
import { resolveSourceClassificationFromCli } from "./identity.mjs";
import { DEFAULT_UNIT_DIR, parseUnitFile, validateSystemdUnits } from "./systemd/validate.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cli = path.join(repoRoot, "scripts/recovery/cli.mjs");

/**
 * Minimal synthetic env — does not inherit ambient DB/provider/recovery credentials.
 * Negative CLI tests that reach BLOCKED classification must remain harmless even if
 * a developer workstation has live recovery tooling configured.
 */
function scrubbedEnv(overrides = {}) {
  return {
    PATH: process.env.PATH ?? "/usr/bin",
    HOME: process.env.HOME ?? "/tmp",
    LANG: "C",
    // Explicitly omit: DATABASE_URL, PGPASSWORD, PGHOST, BOBA_RECOVERY_*,
    // AWS/Spaces keys, COMPOSE_PROJECT_NAME, BOBA_BEAR_ENV, etc.
    ...overrides,
  };
}

function run(args, env) {
  return spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    env: env ?? scrubbedEnv(),
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
  const result = run(
    [
      "backup",
      "layer2",
      "--json",
      "--recipient",
      "age1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3waw4h",
      "--local-store",
      "/tmp/boba-recovery-store-test-must-not-exist-t1",
      "--source",
      "prod-db",
    ],
    scrubbedEnv({ BOBA_RECOVERY_AGE_BIN: "age" }),
  );
  assert.equal(result.status, CLI_EXIT.BLOCKED);
  assert.match(result.stdout, /SOURCE_CLASSIFICATION_REQUIRED|source-class|classification/i);
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
    scrubbedEnv({ BOBA_RECOVERY_SOURCE_CLASSIFICATION: "" }),
  );
  assert.equal(result.status, CLI_EXIT.BLOCKED);
  assert.match(result.stdout, /source-class|classification/i);
});

test("T1: explicit env classification accepted by production resolver (no backup executed)", () => {
  // Exercise the same pure resolver the CLI uses. Do not invoke backup layer2 —
  // that path can reach pg_dump when ambient tools/credentials exist.
  const production = resolveSourceClassificationFromCli({
    env: { BOBA_RECOVERY_SOURCE_CLASSIFICATION: "production" },
  });
  assert.equal(production.ok, true);
  assert.equal(production.classification, "production");

  const staging = resolveSourceClassificationFromCli({
    env: { BOBA_RECOVERY_SOURCE_CLASSIFICATION: "staging" },
  });
  assert.equal(staging.ok, true);
  assert.equal(staging.classification, "staging");

  const flagWins = resolveSourceClassificationFromCli({
    sourceClassFlag: "staging",
    env: { BOBA_RECOVERY_SOURCE_CLASSIFICATION: "production" },
  });
  assert.equal(flagWins.ok, true);
  assert.equal(flagWins.classification, "staging");
});

test("T1: missing / invalid / contradictory classification rejected by production resolver", () => {
  const missing = resolveSourceClassificationFromCli({ env: {} });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, "SOURCE_CLASSIFICATION_REQUIRED");

  const invalid = resolveSourceClassificationFromCli({
    env: { BOBA_RECOVERY_SOURCE_CLASSIFICATION: "not-a-class" },
  });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.code, "SOURCE_CLASSIFICATION_INVALID");

  const contradiction = resolveSourceClassificationFromCli({
    sourceClassFlag: "production",
    env: {
      COMPOSE_PROJECT_NAME: "boba-staging",
      BOBA_BEAR_ENV: "local",
    },
  });
  assert.equal(contradiction.ok, false);
  assert.equal(contradiction.code, "SOURCE_CLASSIFICATION_CONTRADICTION");
});

test("C1: invalid class via env is BLOCKED at CLI before operational effects", () => {
  const result = run(
    [
      "backup",
      "layer2",
      "--json",
      "--recipient",
      "age1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3waw4h",
      "--local-store",
      "/tmp/boba-recovery-store-test-must-not-exist-t1",
      "--source",
      "prod-db",
    ],
    scrubbedEnv({
      BOBA_RECOVERY_AGE_BIN: "age",
      BOBA_RECOVERY_SOURCE_CLASSIFICATION: "not-a-class",
    }),
  );
  assert.equal(result.status, CLI_EXIT.BLOCKED);
  assert.match(result.stdout, /SOURCE_CLASSIFICATION_INVALID|known value|classification/i);
  assert.doesNotMatch(result.stdout, /\bSUCCEEDED\b/);
});

test("C1: staging class with contradictory markers is BLOCKED at CLI", () => {
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
      "/tmp/boba-recovery-store-test-must-not-exist-t1",
      "--source",
      "prod-db",
    ],
    scrubbedEnv({
      BOBA_RECOVERY_AGE_BIN: "age",
      COMPOSE_PROJECT_NAME: "boba-staging",
      BOBA_BEAR_ENV: "local",
    }),
  );
  assert.equal(result.status, CLI_EXIT.BLOCKED);
  assert.match(result.stdout, /contradict|staging/i);
  assert.doesNotMatch(result.stdout, /\bSUCCEEDED\b/);
});
