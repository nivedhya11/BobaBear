import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PUBLIC_STABLE_ALIASES,
  buildPackageScriptsInventory,
  checkInventorySnapshot,
  classifyScript,
  extractNpmRunDeps,
  formatHelpText,
  isExactNpmRunAlias,
  isMutatingCommand,
  resolveCallerRoots,
  serializeInventory,
} from "./package-scripts-inventory.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("classifyScript covers HYG-04 taxonomy buckets", () => {
  assert.equal(classifyScript("build", "next build"), "BUILD");
  assert.equal(classifyScript("dev", "next dev"), "DEV");
  assert.equal(classifyScript("test", "node scripts/run-vitest.mjs run"), "TEST_UNIT");
  assert.equal(
    classifyScript(
      "test:cart",
      "node scripts/run-vitest.mjs run --config vitest.database.config.mts tests/cart/",
    ),
    "TEST_INTEGRATION",
  );
  assert.equal(
    classifyScript(
      "test:database:cart",
      "node scripts/run-vitest.mjs run --config vitest.database.config.mts tests/database/cart.integration.test.ts",
    ),
    "TEST_DATABASE",
  );
  assert.equal(classifyScript("test:e2e", "npm run build && playwright test"), "TEST_E2E");
  assert.equal(classifyScript("audit:database", "node scripts/audit-database.mjs"), "AUDIT");
  assert.equal(classifyScript("governance:fingerprint", "node x.mjs"), "GOVERNANCE");
  assert.equal(classifyScript("db:migrate", "tsx scripts/database/migrate.ts"), "DATABASE");
  assert.equal(classifyScript("env:hygiene", "node scripts/environment/hygiene.mjs"), "ENVIRONMENT");
  assert.equal(classifyScript("env:staging:deploy", "node scripts/environment/staging.mjs deploy"), "STAGING");
  assert.equal(classifyScript("docker:up", "node scripts/docker/stack-up.mjs"), "DOCKER");
  assert.equal(classifyScript("recovery:status", "node scripts/recovery/cli.mjs status"), "RECOVERY");
  assert.equal(
    classifyScript(
      "assortment:bootstrap-existing-menu",
      "node --conditions=react-server --import tsx scripts/assortment/bootstrap-existing-menu.ts",
    ),
    "BOOTSTRAP",
  );
  assert.equal(classifyScript("db:test", "npm run test:database"), "LEGACY_OR_ALIAS");
  assert.equal(
    classifyScript(
      "test:imp036j:tranche1",
      "node scripts/run-vitest.mjs run --config vitest.database.config.mts tests/database/x.ts",
    ),
    "ONE_OFF",
  );
});

test("exact npm-run alias and mutating heuristics", () => {
  assert.equal(isExactNpmRunAlias("npm run test:database"), true);
  assert.equal(isExactNpmRunAlias("npm run test:database && echo x"), false);
  assert.equal(isMutatingCommand("db:reset", "node scripts/database/reset-local.mjs"), true);
  assert.equal(isMutatingCommand("env:staging:deploy:dry-run", "node staging.mjs deploy-dry-run"), false);
  assert.equal(isMutatingCommand("lint", "eslint"), false);
  assert.equal(
    isMutatingCommand(
      "assortment:configure-outlet-operating-uat",
      "node --conditions=react-server --import tsx scripts/assortment/configure-outlet-operating-uat.ts",
    ),
    true,
  );
});

test("test:recovery classifies as TEST_UNIT before broad :recover matching", () => {
  assert.equal(
    classifyScript("test:recovery", "node --test $(find scripts/recovery -name '*.test.mjs')"),
    "TEST_UNIT",
  );
  assert.equal(
    classifyScript("recovery:status", "node scripts/recovery/cli.mjs status"),
    "RECOVERY",
  );
  assert.equal(
    classifyScript(
      "customer-auth:recover-missing",
      "node --import tsx scripts/customer-auth/recover-missing.ts",
    ),
    "RECOVERY",
  );
});

test("caller discovery includes runtime/build consumers", () => {
  const roots = resolveCallerRoots(repoRoot).map((abs) =>
    path.relative(repoRoot, abs).split(path.sep).join("/"),
  );
  assert.ok(roots.includes("Dockerfile"), `missing Dockerfile in ${roots.join(",")}`);
  assert.ok(roots.includes("docker"), "missing docker/ tree");
  assert.ok(roots.includes("compose.yaml"), "missing compose.yaml");
  assert.ok(
    roots.some((r) => r.startsWith("playwright") && r.includes(".config.")),
    "missing playwright*.config.*",
  );

  const inventory = buildPackageScriptsInventory(repoRoot);
  const operationsBuild = inventory.records.find((r) => r.name === "operations:build");
  assert.ok(operationsBuild, "operations:build missing from inventory");
  assert.ok(
    operationsBuild.otherCallers.includes("Dockerfile"),
    `operations:build otherCallers=${JSON.stringify(operationsBuild.otherCallers)}`,
  );

  const stagingBaseline = inventory.records.find((r) => r.name === "staging:baseline-classify");
  assert.ok(stagingBaseline, "staging:baseline-classify missing from inventory");
  assert.ok(
    stagingBaseline.otherCallers.includes("Dockerfile"),
    `staging:baseline-classify otherCallers=${JSON.stringify(stagingBaseline.otherCallers)}`,
  );
  assert.equal(stagingBaseline.orphan, false);

  const recovery = inventory.records.find((r) => r.name === "recovery");
  assert.ok(recovery, "recovery missing from inventory");
  assert.ok(
    recovery.otherCallers.some((c) => c.startsWith("docker/recovery/systemd/")),
    `recovery otherCallers=${JSON.stringify(recovery.otherCallers)}`,
  );

  const uat = inventory.records.find((r) => r.name === "assortment:configure-outlet-operating-uat");
  assert.ok(uat);
  assert.equal(uat.mutating, true);
  assert.equal(uat.category, "BOOTSTRAP");

  const testRecovery = inventory.records.find((r) => r.name === "test:recovery");
  assert.ok(testRecovery);
  assert.equal(testRecovery.category, "TEST_UNIT");

  const help = formatHelpText(inventory);
  assert.match(help, /^TEST_UNIT$/m);
  assert.match(help, /^\s+test:recovery$/m);
  assert.doesNotMatch(help, /^RECOVERY\n(?:.*\n)*?\s+test:recovery$/m);
});

test("extractNpmRunDeps finds package-script parents", () => {
  assert.deepEqual(extractNpmRunDeps("npm run lint && npm run typecheck"), ["lint", "typecheck"]);
});

test("repository inventory enumerates all package scripts", () => {
  const inventory = buildPackageScriptsInventory(repoRoot);
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const expected = Object.keys(pkg.scripts || {}).length;
  assert.equal(inventory.scriptCount, expected);
  assert.equal(inventory.records.length, expected);
  assert.ok(expected >= 250, "expected large command surface");
  assert.ok(inventory.categoryCounts.TEST_DATABASE > 0);
  assert.ok(inventory.categoryCounts.DOCKER > 0);
  assert.ok(inventory.categoryCounts.RECOVERY > 0);
});

test("public/stable aliases remain present", () => {
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const scripts = pkg.scripts || {};
  for (const name of PUBLIC_STABLE_ALIASES) {
    assert.ok(scripts[name], `missing public/stable alias: ${name}`);
  }
  assert.equal(scripts["db:test"], "npm run test:database");
  assert.equal(scripts["config:check"], scripts["config:check:web"]);
});

test("help text lists taxonomy and frozen aliases", () => {
  const inventory = buildPackageScriptsInventory(repoRoot);
  const help = formatHelpText(inventory);
  assert.match(help, /HYG-04/);
  assert.match(help, /TEST_DATABASE/);
  assert.match(help, /npm run db:test/);
  assert.match(help, /npm run help/);
});

test("inventory snapshot check passes when committed snapshot matches", () => {
  const result = checkInventorySnapshot(repoRoot);
  assert.equal(result.ok, true, result.message);
});

test("serializeInventory is deterministic", () => {
  const a = serializeInventory(buildPackageScriptsInventory(repoRoot));
  const b = serializeInventory(buildPackageScriptsInventory(repoRoot));
  assert.equal(a, b);
});
