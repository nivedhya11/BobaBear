import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  addedWorkflowDisplayNames,
  evaluateChange,
  extractWorkflowDisplayNames,
  introductionViolations,
  missingProtectedCheckNames,
  runRepositoryHygiene,
  workflowStageIdentifier,
} from "./check-repository-conventions.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const checker = path.join(repoRoot, "scripts/repository/check-repository-conventions.mjs");

/**
 * @param {string} filePath
 * @param {string} rule
 */
function rules(filePath) {
  return introductionViolations(filePath).map((item) => item.rule);
}

/**
 * @param {string} filePath
 */
function codes(filePath) {
  return introductionViolations(filePath).map((item) => item.code);
}

test("React component filenames may be PascalCase under src/components", () => {
  assert.deepEqual(rules("src/components/ordering/CartSummary.tsx"), []);
});

test("camelCase component filenames are rejected", () => {
  assert.ok(rules("src/components/ordering/cartSummary.tsx").includes("filename-shape"));
});

test("established hook filenames are allowed", () => {
  assert.deepEqual(rules("src/components/administration/useStepUpMutation.tsx"), []);
});

test("general modules use kebab-case", () => {
  assert.deepEqual(rules("src/server/checkout/payment-snapshot.ts"), []);
  assert.ok(rules("src/lib/pricing/formatTotal.ts").includes("filename-shape"));
});

test("vague and IMP filenames are rejected outside governance exceptions", () => {
  assert.ok(rules("scripts/temp-script.mjs").includes("no-vague-qualifier"));
  assert.ok(rules("src/components/ordering/imp036j-copy.ts").includes("no-governance-id-filename"));
  assert.ok(rules("tests/checkout/scheduled-surfaces.tranche3.test.ts").includes("no-governance-id-filename"));
});

test("task-batch filename tokens are rejected and domain words are not", () => {
  assert.ok(rules("tests/e2e/b5-commerce-composite-qa.spec.ts").includes("no-task-batch-filename"));
  assert.ok(rules("scripts/run-b5-commerce-qa-e2e.mjs").includes("no-task-batch-filename"));
  assert.ok(rules("src/server/checkout/batch7-checkout-test.ts").includes("no-task-batch-filename"));
  assert.ok(rules("src/server/checkout/batch-7-checkout.ts").includes("no-task-batch-filename"));
  assert.ok(rules("docs/platform/governance/b5-review.md").includes("no-task-batch-filename"));
  assert.deepEqual(rules("src/server/checkout/order-batch.ts"), []);
  assert.deepEqual(rules("scripts/database/logical-backup-role.sh"), []);
  assert.deepEqual(rules("src/components/ordering/serviceability-copy.ts"), []);
  assert.deepEqual(rules("src/lib/pricing/b2b-contract.ts"), []);
  assert.deepEqual(rules("src/lib/encoding/b64-digest.ts"), []);
  assert.deepEqual(rules("docs/platform/product/IMP-036K/implementation-plan.md"), []);
  assert.deepEqual(rules("docs/platform/decisions/ADR-021-repository-hygiene.md"), []);
  assert.deepEqual(rules("drizzle/0050_coupon_snapshot.sql"), []);
});

test("unit, integration, script, and browser test names", () => {
  assert.deepEqual(rules("tests/checkout/hides-curated-product.test.ts"), []);
  assert.deepEqual(rules("tests/checkout/coupon-recovery.integration.test.ts"), []);
  assert.deepEqual(rules("src/components/ordering/CartClient.test.tsx"), []);
  assert.deepEqual(rules("scripts/repository/check-repository-conventions.test.mjs"), []);
  assert.deepEqual(rules("scripts/recovery/cli.credentials.test.mjs"), []);
  assert.deepEqual(rules("scripts/recovery/integration/layer1-pgbackrest.integration.test.mjs"), []);
  assert.deepEqual(rules("src/components/ordering/CheckoutClient.destination.test.tsx"), []);
  assert.deepEqual(rules("src/components/ordering/serviceability-copy.ts"), []);
  assert.deepEqual(rules("src/components/administration/commercial/useCommercialViewport.ts"), []);
  assert.deepEqual(rules("src/shared/financial-document/assets/fonts/DejaVuSans-Bold.ttf"), []);
  assert.deepEqual(rules("tests/e2e/customer-ordering.spec.ts"), []);
  assert.ok(rules("tests/e2e/customer-ordering.test.ts").includes("e2e-spec-suffix"));
});

test("supporting markdown uses kebab-case under engineering", () => {
  assert.deepEqual(rules("docs/platform/engineering/repository-conventions.md"), []);
  assert.ok(rules("docs/platform/engineering/final-notes.md").includes("no-vague-qualifier"));
});

test("framework-reserved route files are allowed", () => {
  assert.deepEqual(rules("src/app/(customer)/order/checkout/page.tsx"), []);
  assert.deepEqual(rules("src/app/(customer)/order/forbidden.tsx"), []);
  assert.deepEqual(rules("src/app/icon.png"), []);
  assert.deepEqual(rules("src/app/apple-icon.ts"), []);
  assert.deepEqual(rules("src/app/(customer)/_components/OrderMenu.tsx"), []);
  assert.deepEqual(rules("src/instrumentation.ts"), []);
  assert.deepEqual(rules("src/instrumentation-client.ts"), []);
  assert.deepEqual(rules("src/proxy.ts"), []);
});

test("canonical IMP and ADR paths are allowed", () => {
  assert.deepEqual(rules("docs/platform/product/IMP-036K/implementation-plan.md"), []);
  assert.deepEqual(rules("docs/platform/capabilities/IMP-036K-revenue-recommendations.md"), []);
  assert.deepEqual(rules("docs/platform/decisions/ADR-021-repository-hygiene.md"), []);
});

test("immutable migration identity is a legal new path and an illegal edit", () => {
  assert.deepEqual(rules("drizzle/0050_coupon_snapshot.sql"), []);
  assert.deepEqual(rules("drizzle/0000_database-foundation.sql"), []);
  assert.deepEqual(rules("drizzle/migration-integrity.json"), []);
  assert.deepEqual(rules("drizzle/meta/0050_snapshot.json"), []);
  assert.deepEqual(evaluateChange({ kind: "modified", path: "drizzle/migration-integrity.json" }), []);
  assert.deepEqual(evaluateChange({ kind: "modified", path: "drizzle/meta/_journal.json" }), []);
  assert.equal(evaluateChange({ kind: "deleted", path: "drizzle/meta/_journal.json" })[0]?.rule, "immutable-migration");
  assert.equal(
    evaluateChange({ kind: "deleted", path: "drizzle/migration-integrity.json" })[0]?.rule,
    "immutable-migration",
  );
  const edited = evaluateChange({ kind: "modified", path: "drizzle/0001_init.sql" });
  assert.equal(edited[0]?.code, "REPO_HYGIENE_PROTECTED_PATH");
  assert.equal(edited[0]?.rule, "immutable-migration");
  const removed = evaluateChange({ kind: "deleted", path: "drizzle/meta/0001_snapshot.json" });
  assert.equal(removed[0]?.rule, "immutable-migration");
});

test("historical archives may keep governance ids, and archive/src is forbidden", () => {
  assert.deepEqual(rules("archive/design-history/imp036j-wireframe.md"), []);
  assert.deepEqual(rules("archive/design-history/design-system-updated/fonts/BubblegumSans-Regular.ttf"), []);
  assert.deepEqual(rules("public/assets/menu/Berry_Popping_Sundae.jpeg"), []);
  assert.deepEqual(rules(".cursor/skills/boba-read-order/SKILL.md"), []);
  assert.deepEqual(rules(".github/pull_request_template.md"), []);
  assert.deepEqual(rules("docs/platform/capabilities/IMP-037-backup-restore-migration-readiness.md"), []);
  assert.deepEqual(rules("scripts/database/logical-backup-role.sh"), []);
  assert.deepEqual(rules("docs/platform/history/STATE-r190.md"), []);
  const historyEdit = evaluateChange({
    kind: "modified",
    path: "docs/platform/history/STATE-r190.md",
  });
  assert.equal(historyEdit[0]?.rule, "immutable-history");
  const archivedSource = evaluateChange({ kind: "added", path: "archive/src/order-service.ts" });
  assert.equal(archivedSource[0]?.rule, "no-importable-archive-source");
});

test("new paths are strict and grandfathered modifications are not", () => {
  const added = evaluateChange({
    kind: "added",
    path: "src/server/catalog/imp028c-modifiers/constants.ts",
  });
  assert.equal(added[0]?.code, "REPO_HYGIENE_NAMING_VIOLATION");
  const insideLegacyDirectory = evaluateChange(
    { kind: "added", path: "src/server/catalog/imp028c-modifiers/extra-rule.ts" },
    { existingDirectories: new Set(["src", "src/server", "src/server/catalog", "src/server/catalog/imp028c-modifiers"]) },
  );
  assert.deepEqual(insideLegacyDirectory, []);
  const newLegacyDirectory = evaluateChange(
    { kind: "added", path: "src/server/catalog/imp036k-offers/rule.ts" },
    { existingDirectories: new Set(["src", "src/server", "src/server/catalog"]) },
  );
  assert.ok(newLegacyDirectory.some((item) => item.rule === "no-governance-id-filename"));
  const modified = evaluateChange({
    kind: "modified",
    path: "src/server/catalog/imp028c-modifiers/constants.ts",
  });
  assert.deepEqual(modified, []);
});

test("renames are judged by the destination, and immutable sources stay protected", () => {
  const cleaned = evaluateChange({
    kind: "renamed",
    path: "src/server/catalog/modifier-constants.ts",
    previousPath: "src/server/catalog/imp028c-modifiers/constants.ts",
  });
  assert.deepEqual(cleaned, []);
  const worsened = evaluateChange({
    kind: "renamed",
    path: "src/server/catalog/temp-constants.ts",
    previousPath: "src/server/catalog/modifier-constants.ts",
  });
  assert.equal(worsened[0]?.rule, "no-vague-qualifier");
  assert.equal(worsened[0]?.change, "renamed");
  const movedMigration = evaluateChange({
    kind: "renamed",
    path: "drizzle/0002_coupon_snapshot.sql",
    previousPath: "drizzle/0001_init.sql",
  });
  assert.ok(movedMigration.some((item) => item.rule === "immutable-migration"));
});

test("files in the wrong layer are placement violations", () => {
  assert.ok(rules("src/scratch/helper.ts").includes("src-layer"));
  assert.ok(rules("docs/random-notes.md").includes("docs-layer"));
  assert.ok(rules("docs/platform/extra-authority.md").includes("docs-platform-root"));
  assert.ok(rules("tests/hides-curated-product.test.ts").includes("tests-feature-folder"));
  assert.ok(rules("tests/checkout/customer-ordering.spec.ts").includes("e2e-spec-location"));
  assert.ok(rules("src/app/(customer)/order/checkout-helper.ts").includes("src-app-route-file"));
  assert.ok(codes("brand-new-root/notes.md").includes("REPO_HYGIENE_PLACEMENT_VIOLATION"));
});

test("new root files must be project configuration, and existing root files stay allowed", () => {
  assert.ok(rules("pricing-helper.ts").includes("root-file-placement"));
  assert.ok(rules("checkout-notes.md").includes("root-file-placement"));
  assert.ok(rules("helper.test.ts").includes("root-file-placement"));
  assert.equal(rules("pricing-helper.ts").includes("filename-shape"), false);
  for (const filePath of [
    "eslint.config.mjs",
    "next.config.ts",
    "drizzle.config.ts",
    "playwright.customer-auth.config.ts",
    "vitest.database.config.mts",
    "tsconfig.customer-commerce.json",
    "compose.recovery.yaml",
    "package.json",
    ".env.example",
    ".env.docker.example",
    ".gitignore",
    "robots.txt",
    "sitemap.xml",
    "next-env.d.ts",
    "components.json",
    "menu.json",
    "imp023-fingerprint.json",
    "README.md",
    "AGENTS.md",
  ]) {
    assert.equal(rules(filePath).includes("root-file-placement"), false, filePath);
  }
  const listed = spawnSync("git", ["-C", repoRoot, "ls-files", "-z"], { encoding: "utf8" });
  assert.equal(listed.status, 0, listed.stderr);
  const rootFiles = listed.stdout.split("\0").filter((filePath) => filePath && !filePath.includes("/"));
  assert.ok(rootFiles.length > 10);
  for (const filePath of rootFiles) {
    assert.equal(rules(filePath).includes("root-file-placement"), false, filePath);
  }
});

test("the history index may change and snapshot bytes stay immutable", () => {
  assert.deepEqual(evaluateChange({ kind: "modified", path: "docs/platform/history/README.md" }), []);
  const snapshot = evaluateChange({ kind: "modified", path: "docs/platform/history/STATE-r190.md" });
  assert.equal(snapshot[0]?.rule, "immutable-history");
  assert.equal(evaluateChange({ kind: "deleted", path: "docs/platform/history/README.md" })[0]?.rule, "immutable-history");
  assert.equal(
    evaluateChange({
      kind: "renamed",
      path: "docs/platform/history/INDEX.md",
      previousPath: "docs/platform/history/README.md",
    }).some((item) => item.rule === "immutable-history"),
    true,
  );
  const copied = evaluateChange({
    kind: "copied",
    path: "docs/platform/history/STATE-r191.md",
    previousPath: "docs/platform/history/STATE-r190.md",
  });
  assert.equal(
    copied.some((item) => item.path === "docs/platform/history/STATE-r190.md" && item.rule === "immutable-history"),
    true,
  );
  assert.equal(
    copied.some((item) => item.change === "modified" || item.change === "deleted"),
    false,
  );
});

test("unexpected generated output and a second agent-rules tree are protected", () => {
  const generated = evaluateChange({ kind: "added", path: "coverage/index.html" });
  assert.ok(generated.some((item) => item.code === "REPO_HYGIENE_PROTECTED_PATH" && item.rule === "generated-output"));
  const playwright = evaluateChange({ kind: "added", path: "playwright-report-customer-auth/index.html" });
  assert.ok(playwright.some((item) => item.rule === "generated-output"));
  const rulesDir = evaluateChange({ kind: "added", path: ".cursor/rules/hygiene.mdc" });
  assert.equal(rulesDir[0]?.rule, "no-second-agent-rules");
  const evidence = evaluateChange({
    kind: "added",
    path: "test-results-customer-ordering/fresh-failure.png",
  });
  assert.equal(evidence[0]?.rule, "protected-evidence");
});

test("the RHS-1 files introduced by this change satisfy the introduction rules", () => {
  for (const filePath of [
    "docs/platform/engineering/repository-conventions.md",
    "scripts/repository/check-repository-conventions.mjs",
    "scripts/repository/check-repository-conventions.test.mjs",
  ]) {
    assert.deepEqual(introductionViolations(filePath), [], filePath);
  }
});

test("Quality workflow runs the checker without dropping existing gates", () => {
  const ci = readFileSync(path.join(repoRoot, ".github/workflows/ci.yml"), "utf8");
  const pkg = readFileSync(path.join(repoRoot, "package.json"), "utf8");
  assert.match(pkg, /"audit:repo-hygiene": "node scripts\/repository\/check-repository-conventions\.mjs"/);
  assert.match(ci, /npm run audit:repo-hygiene/);
  assert.match(ci, /REPO_HYGIENE_BASE:/);
  assert.match(ci, /REPO_HYGIENE_HEAD:/);
  assert.match(ci, /npm run typecheck/);
  assert.match(ci, /npm run lint/);
  assert.match(ci, /npm run project:consistency/);
  assert.match(ci, /npm run testing:inventory:check/);
  assert.match(ci, /npm run audit:npm-sca/);
  assert.match(ci, /fetch-depth: 0/);
});

/**
 * @param {string[]} args
 */
function git(repo, args) {
  const result = spawnSync("git", ["-C", repo, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

/**
 * @param {string} repo
 * @param {string} filePath
 * @param {string} contents
 */
function writeRepoFile(repo, filePath, contents) {
  const absolute = path.join(repo, filePath);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, contents);
}

function initRepo() {
  const repo = mkdtempSync(path.join(os.tmpdir(), "rhs1-"));
  git(repo, ["init", "-b", "main"]);
  return repo;
}

/**
 * @param {string} repo
 * @param {string} message
 */
function commitAll(repo, message) {
  git(repo, ["add", "-A"]);
  git(repo, [
    "-c",
    "user.email=rhs1@example.invalid",
    "-c",
    "user.name=RHS1",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    message,
  ]);
  return git(repo, ["rev-parse", "HEAD"]);
}

/**
 * @param {string} repo
 * @param {string[]} args
 */
function runChecker(repo, args) {
  return spawnSync(process.execPath, [checker, "--repo", repo, ...args], { encoding: "utf8" });
}

test("a missing comparison base fails closed", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "README.md", "# fixture\n");
    commitAll(repo, "init");
    const missing = runChecker(repo, ["--base", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "--no-worktree"]);
    assert.equal(missing.status, 2);
    assert.match(missing.stdout, /REPO_HYGIENE_BASELINE_UNAVAILABLE/);
    assert.doesNotMatch(missing.stdout, /REPO_HYGIENE_PASS/);
    const zero = runChecker(repo, ["--base", "0000000000000000000000000000000000000000", "--no-worktree"]);
    assert.equal(zero.status, 2);
    const omitted = runChecker(repo, ["--no-worktree"]);
    assert.equal(omitted.status, 2);
    assert.match(omitted.stdout, /origin\/main/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("a shallow clone whose base object is absent fails closed", () => {
  const origin = initRepo();
  const shallow = mkdtempSync(path.join(os.tmpdir(), "rhs1-shallow-"));
  try {
    writeRepoFile(origin, "README.md", "# fixture\n");
    const first = commitAll(origin, "init");
    writeRepoFile(origin, "scripts/pricing/format-total.mjs", "export const amount = 1;\n");
    commitAll(origin, "add module");
    const cloned = spawnSync("git", ["clone", "--depth", "1", "--no-local", origin, shallow], { encoding: "utf8" });
    assert.equal(cloned.status, 0, cloned.stderr);
    const result = runChecker(shallow, ["--base", first, "--no-worktree"]);
    assert.equal(result.status, 2);
    assert.match(result.stdout, /REPO_HYGIENE_BASELINE_UNAVAILABLE/);
    assert.match(result.stdout, /shallow|missing/i);
    assert.doesNotMatch(result.stdout, /REPO_HYGIENE_PASS/);
  } finally {
    rmSync(origin, { recursive: true, force: true });
    rmSync(shallow, { recursive: true, force: true });
  }
});

test("git rename detection flags the new vague path and passes a functional rename", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "scripts/pricing/format-total.mjs", "export const amount = 1;\n");
    const base = commitAll(repo, "init");
    git(repo, ["mv", "scripts/pricing/format-total.mjs", "scripts/pricing/temp-total.mjs"]);
    commitAll(repo, "rename");
    const bad = runChecker(repo, ["--base", base, "--no-worktree"]);
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /REPO_HYGIENE_NAMING_VIOLATION change=renamed path=scripts\/pricing\/temp-total\.mjs/);
    git(repo, ["mv", "scripts/pricing/temp-total.mjs", "scripts/pricing/format-order-total.mjs"]);
    commitAll(repo, "repair");
    const good = runChecker(repo, ["--base", base, "--no-worktree"]);
    assert.equal(good.status, 0, good.stdout);
    assert.match(good.stdout, /REPO_HYGIENE_PASS/);
    assert.equal(
      good.stdout.split("\n").some((line) => line.startsWith("REPO_HYGIENE_NAMING_VIOLATION")),
      false,
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("an existing legacy path is baseline backlog and does not fail", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "src/components/ordering/imp036j-copy.ts", "export const label = 1;\n");
    writeRepoFile(repo, "src/server/catalog/imp028c-modifiers/constants.ts", "export const topping = 1;\n");
    const sha = commitAll(repo, "legacy");
    const result = runRepositoryHygiene({ repo, base: sha, head: sha, includeWorktree: false });
    assert.equal(result.exitCode, 0);
    const text = result.lines.join("\n");
    assert.match(text, /REPO_HYGIENE_PASS/);
    assert.match(text, /REPO_HYGIENE_BASELINE code=REPO_HYGIENE_NAMING_VIOLATION change=grandfathered path=src\/components\/ordering\/imp036j-copy\.ts/);
    assert.equal(
      result.lines.some((line) => line.startsWith("REPO_HYGIENE_NAMING_VIOLATION")),
      false,
    );
    writeRepoFile(repo, "src/server/catalog/imp028c-modifiers/extra-rule.ts", "export const extra = 1;\n");
    commitAll(repo, "child of legacy directory");
    const child = runRepositoryHygiene({ repo, base: sha, includeWorktree: false });
    assert.equal(child.exitCode, 0, child.lines.join("\n"));
    writeRepoFile(repo, "src/server/catalog/imp036k-offers/rule.ts", "export const rule = 1;\n");
    commitAll(repo, "new legacy directory");
    const created = runRepositoryHygiene({ repo, base: sha, includeWorktree: false });
    assert.equal(created.exitCode, 1);
    assert.ok(created.lines.some((line) => line.startsWith("REPO_HYGIENE_NAMING_VIOLATION") && line.includes("imp036k-offers")));
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("a new generated file fails against a real git comparison", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "README.md", "# fixture\n");
    const base = commitAll(repo, "init");
    writeRepoFile(repo, "coverage/index.html", "<html></html>\n");
    commitAll(repo, "generated");
    const result = runChecker(repo, ["--base", base, "--no-worktree"]);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /REPO_HYGIENE_PROTECTED_PATH change=added path=coverage\/index\.html rule=generated-output/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("an ordinary valid new file passes", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "README.md", "# fixture\n");
    const base = commitAll(repo, "init");
    writeRepoFile(repo, "scripts/pricing/format-order-total.mjs", "export const amount = 1;\n");
    git(repo, ["add", "scripts/pricing/format-order-total.mjs"]);
    const head = git(repo, ["rev-parse", "HEAD"]);
    const before = statusZ(repo);
    const staged = runChecker(repo, ["--base", base, "--head", base]);
    assert.equal(staged.status, 0, staged.stdout);
    assert.match(staged.stdout, /REPO_HYGIENE_PASS/);
    assert.equal(
      staged.stdout.split("\n").some((line) => line.startsWith("REPO_HYGIENE_NAMING_VIOLATION")),
      false,
    );
    assert.equal(
      staged.stdout.split("\n").some((line) => line.startsWith("REPO_HYGIENE_PLACEMENT_VIOLATION")),
      false,
    );
    assert.equal(statusZ(repo), before);
    assert.equal(git(repo, ["rev-parse", "HEAD"]), head);

    const committedHead = commitAll(repo, "add pricing total");
    const committedBefore = statusZ(repo);
    const committed = runChecker(repo, ["--base", base, "--no-worktree"]);
    assert.equal(committed.status, 0, committed.stdout);
    assert.match(committed.stdout, /REPO_HYGIENE_PASS/);
    assert.equal(
      committed.stdout.split("\n").some((line) => line.startsWith("REPO_HYGIENE_NAMING_VIOLATION")),
      false,
    );
    assert.equal(statusZ(repo), committedBefore);
    assert.equal(git(repo, ["rev-parse", "HEAD"]), committedHead);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

/**
 * @param {string} repo
 */
function statusZ(repo) {
  const result = spawnSync("git", ["-C", repo, "status", "--porcelain=v1", "-z", "-uall"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test("a staged rename to a temporary filename fails against git status", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "scripts/pricing/format-total.mjs", "export const amount = 1;\n");
    const base = commitAll(repo, "init");
    const head = git(repo, ["rev-parse", "HEAD"]);
    git(repo, ["mv", "scripts/pricing/format-total.mjs", "scripts/pricing/temp-total.mjs"]);
    const before = statusZ(repo);
    const bad = runChecker(repo, ["--base", base, "--head", base]);
    assert.equal(bad.status, 1, bad.stdout);
    assert.match(bad.stdout, /REPO_HYGIENE_NAMING_VIOLATION change=renamed path=scripts\/pricing\/temp-total\.mjs rule=no-vague-qualifier/);
    assert.doesNotMatch(bad.stdout, /change=renamed path=scripts\/pricing\/format-total\.mjs/);
    assert.equal(statusZ(repo), before);
    assert.equal(git(repo, ["rev-parse", "HEAD"]), head);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("a staged rename from a legacy filename to a functional filename passes", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "scripts/pricing/temp-total.mjs", "export const amount = 1;\n");
    const base = commitAll(repo, "legacy");
    git(repo, ["mv", "scripts/pricing/temp-total.mjs", "scripts/pricing/format-order-total.mjs"]);
    const good = runChecker(repo, ["--base", base, "--head", base]);
    assert.equal(good.status, 0, good.stdout);
    assert.match(good.stdout, /REPO_HYGIENE_PASS/);
    assert.equal(
      good.stdout.split("\n").some((line) => line.startsWith("REPO_HYGIENE_NAMING_VIOLATION")),
      false,
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("a staged rename of an immutable migration or historical snapshot fails", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "drizzle/0001_init.sql", "-- migration\n");
    writeRepoFile(repo, "docs/platform/history/STATE-r190.md", "snapshot bytes\n");
    writeRepoFile(repo, "docs/platform/history/README.md", "# index\n");
    const base = commitAll(repo, "init");
    git(repo, ["mv", "drizzle/0001_init.sql", "drizzle/0002_coupon_snapshot.sql"]);
    const migration = runChecker(repo, ["--base", base, "--head", base]);
    assert.equal(migration.status, 1, migration.stdout);
    assert.match(
      migration.stdout,
      /REPO_HYGIENE_PROTECTED_PATH change=renamed path=drizzle\/0001_init\.sql rule=immutable-migration/,
    );
    git(repo, ["reset", "--hard"]);
    git(repo, ["mv", "docs/platform/history/STATE-r190.md", "docs/platform/history/STATE-r191.md"]);
    const snapshot = runChecker(repo, ["--base", base, "--head", base]);
    assert.equal(snapshot.status, 1, snapshot.stdout);
    assert.match(
      snapshot.stdout,
      /REPO_HYGIENE_PROTECTED_PATH change=renamed path=docs\/platform\/history\/STATE-r190\.md rule=immutable-history/,
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("a staged history index edit passes and an unchanged snapshot copy does not mark the source", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "docs/platform/history/STATE-r190.md", "snapshot bytes\n");
    writeRepoFile(repo, "docs/platform/history/README.md", "# index\n");
    const base = commitAll(repo, "init");
    writeRepoFile(repo, "docs/platform/history/README.md", "# index\n\nUpdated when a snapshot is added.\n");
    git(repo, ["add", "docs/platform/history/README.md"]);
    const index = runChecker(repo, ["--base", base, "--head", base]);
    assert.equal(index.status, 0, index.stdout);
    assert.match(index.stdout, /REPO_HYGIENE_PASS/);
    assert.doesNotMatch(index.stdout, /immutable-history/);
    git(repo, ["reset", "--hard"]);
    writeRepoFile(repo, "docs/platform/history/STATE-r191.md", "snapshot bytes\n");
    git(repo, ["add", "docs/platform/history/STATE-r191.md"]);
    const copied = runChecker(repo, ["--base", base, "--head", base]);
    assert.equal(copied.status, 0, copied.stdout);
    assert.doesNotMatch(copied.stdout, /change=modified path=docs\/platform\/history\/STATE-r190\.md/);
    assert.doesNotMatch(copied.stdout, /change=deleted path=docs\/platform\/history\/STATE-r190\.md/);
    git(repo, ["reset", "--hard"]);
    git(repo, ["config", "diff.renames", "copies"]);
    writeRepoFile(repo, "docs/platform/history/STATE-r190.md", "snapshot bytes\nchanged\n");
    writeRepoFile(repo, "docs/platform/history/STATE-r191.md", "snapshot bytes\nextra\n");
    git(repo, ["add", "docs/platform/history/STATE-r190.md", "docs/platform/history/STATE-r191.md"]);
    const similar = runChecker(repo, ["--base", base, "--head", base]);
    assert.equal(similar.status, 1, similar.stdout);
    assert.match(
      similar.stdout,
      /REPO_HYGIENE_PROTECTED_PATH change=modified path=docs\/platform\/history\/STATE-r190\.md rule=immutable-history/,
    );
    assert.doesNotMatch(similar.stdout, /path=docs\/platform\/history\/STATE-r191\.md rule=immutable-history/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("workflow display names reject stage identifiers and accept business names", () => {
  assert.equal(workflowStageIdentifier("Scheduled Orders · Cancellation and Reminders"), null);
  assert.equal(workflowStageIdentifier("Checkout · Snapshot Revalidation"), null);
  assert.equal(workflowStageIdentifier("Promotions · Operator Authoring"), null);
  assert.equal(workflowStageIdentifier("Customer Ordering · Browser Regression"), null);
  assert.equal(workflowStageIdentifier("Security · Dependency Vulnerability Scan"), null);
  assert.equal(workflowStageIdentifier("PostgreSQL 18 persistence"), null);
  assert.equal(workflowStageIdentifier("HTTP 404 contract"), null);
  assert.equal(workflowStageIdentifier("b2b pricing review"), null);
  assert.equal(workflowStageIdentifier("Quality"), null);
  assert.equal(workflowStageIdentifier("Analyze (javascript-typescript)"), null);
  assert.equal(workflowStageIdentifier("IMP-036J Tranche 5 proof")?.kind, "imp");
  assert.equal(workflowStageIdentifier("GTM-391 payment-start Snapshot comparison regression")?.kind, "gtm");
  assert.equal(workflowStageIdentifier("Session 3B2 verification")?.kind, "session");
  assert.equal(workflowStageIdentifier("b5 commerce composite")?.kind, "batch");
  assert.equal(workflowStageIdentifier("batch-7 checkout")?.kind, "batch");
  assert.equal(workflowStageIdentifier("Line presentation #385")?.token, "#385");

  const parsed = extractWorkflowDisplayNames(`
# Session 3B2 IMP-036J Tranche 5 stays in this comment
name: CI
jobs:
  commerce-core:
    name: Commerce core
    steps:
      - name: Scheduled Orders · Cancellation and Reminders
        run: npm run test:imp036i:tranche4
      - name: Upload evidence
        with:
          name: nightly-e2e-customer-ordering
`);
  assert.deepEqual(parsed.workflow, ["CI"]);
  assert.deepEqual(parsed.jobs, ["Commerce core"]);
  assert.deepEqual(parsed.steps, [
    "Scheduled Orders · Cancellation and Reminders",
    "Upload evidence",
  ]);
  assert.deepEqual(
    addedWorkflowDisplayNames(
      "name: CI\njobs:\n  commerce-core:\n    name: Commerce core\n    steps:\n      - name: IMP-036J Tranche 5 proof\n",
      "name: CI\njobs:\n  commerce-core:\n    name: Commerce core\n    steps:\n      - name: Promotions · Customer Presentation\n",
    ),
    ["Promotions · Customer Presentation"],
  );
});

test("the in-scope workflows keep behavior labels and the six protected checks", () => {
  const jobs = [];
  for (const fileName of ["ci.yml", "codeql.yml", "nightly-verification.yml", "deploy.yml"]) {
    const text = readFileSync(path.join(repoRoot, ".github/workflows", fileName), "utf8");
    const parsed = extractWorkflowDisplayNames(text);
    for (const label of [...parsed.workflow, ...parsed.jobs, ...parsed.steps]) {
      assert.equal(workflowStageIdentifier(label), null, `${fileName}: ${label}`);
    }
    jobs.push(...parsed.jobs);
  }
  assert.deepEqual(missingProtectedCheckNames(jobs), []);
});

const protectedWorkflows = {
  ".github/workflows/ci.yml": `name: CI
jobs:
  quality:
    name: Quality
  scripts:
    name: Scripts
  unit:
    name: Unit / component
  commerce-core:
    name: Commerce core
  security-sdlc:
    name: Security SDLC
`,
  ".github/workflows/codeql.yml": `name: CodeQL
jobs:
  analyze:
    name: Analyze (javascript-typescript)
`,
};

test("a new stage label fails and a behavior label passes", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "README.md", "# fixture\n");
    for (const [filePath, contents] of Object.entries(protectedWorkflows)) {
      writeRepoFile(repo, filePath, contents);
    }
    const base = commitAll(repo, "init");
    writeRepoFile(
      repo,
      ".github/workflows/example-verification.yml",
      `name: Example verification
jobs:
  example:
    name: Example
    steps:
      - name: IMP-036J Tranche 5 proof
        run: npm run test:imp036j:tranche5
      # Session 3B2 stays in a comment
`,
    );
    commitAll(repo, "bad label");
    const bad = runChecker(repo, ["--base", base, "--no-worktree"]);
    assert.equal(bad.status, 1, bad.stdout);
    assert.match(bad.stdout, /REPO_HYGIENE_WORKFLOW_LABEL/);
    assert.match(bad.stdout, /no-workflow-stage-label/);
    assert.match(bad.stdout, /example-verification\.yml/);

    writeRepoFile(
      repo,
      ".github/workflows/example-verification.yml",
      `name: Example verification
jobs:
  example:
    name: Example
    steps:
      - name: Scheduled Orders · Cancellation and Reminders
        run: npm run test:imp036i:tranche4
      - name: PostgreSQL 18 persistence
        run: npm run test:database
`,
    );
    commitAll(repo, "good label");
    const good = runChecker(repo, ["--base", base, "--no-worktree"]);
    assert.equal(good.status, 0, good.stdout);
    assert.match(good.stdout, /REPO_HYGIENE_PASS/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("renaming a protected GitHub check fails", () => {
  const repo = initRepo();
  try {
    writeRepoFile(repo, "README.md", "# fixture\n");
    for (const [filePath, contents] of Object.entries(protectedWorkflows)) {
      writeRepoFile(repo, filePath, contents);
    }
    const base = commitAll(repo, "init");
    const kept = runChecker(repo, ["--base", base, "--no-worktree"]);
    assert.equal(kept.status, 0, kept.stdout);
    writeRepoFile(
      repo,
      ".github/workflows/ci.yml",
      protectedWorkflows[".github/workflows/ci.yml"].replace("name: Quality", "name: Build quality"),
    );
    commitAll(repo, "rename quality");
    const renamed = runChecker(repo, ["--base", base, "--no-worktree"]);
    assert.equal(renamed.status, 1, renamed.stdout);
    assert.match(renamed.stdout, /protected-github-check-name/);
    assert.match(renamed.stdout, /Quality/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
