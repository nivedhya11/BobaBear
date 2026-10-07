#!/usr/bin/env node
/**
 * HYG-04 — deterministic package.json script command-surface inventory.
 *
 * Enumerates scripts, classifies them, and records callers from workflows,
 * docs, other package scripts, and selected repo sources. Does not rename or
 * delete scripts. Does not claim product acceptance.
 *
 * Usage:
 *   node scripts/package-scripts-inventory.mjs
 *   node scripts/package-scripts-inventory.mjs --write
 *   node scripts/package-scripts-inventory.mjs --check
 *   node scripts/package-scripts-inventory.mjs --help-text
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  globSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "..");
const SNAPSHOT_REL = "docs/platform/engineering/package-scripts-inventory.json";
const SCHEMA_VERSION = 1;

/** @typedef {'BUILD'|'DEV'|'TEST_UNIT'|'TEST_INTEGRATION'|'TEST_DATABASE'|'TEST_E2E'|'AUDIT'|'GOVERNANCE'|'DATABASE'|'ENVIRONMENT'|'STAGING'|'DOCKER'|'RECOVERY'|'BOOTSTRAP'|'OPERATIONS'|'ONE_OFF'|'LEGACY_OR_ALIAS'} ScriptCategory */

export const CATEGORIES = Object.freeze([
  "BUILD",
  "DEV",
  "TEST_UNIT",
  "TEST_INTEGRATION",
  "TEST_DATABASE",
  "TEST_E2E",
  "AUDIT",
  "GOVERNANCE",
  "DATABASE",
  "ENVIRONMENT",
  "STAGING",
  "DOCKER",
  "RECOVERY",
  "BOOTSTRAP",
  "OPERATIONS",
  "ONE_OFF",
  "LEGACY_OR_ALIAS",
]);

/** Documented public/stable aliases that must continue to exist (HYG-04 freeze). */
export const PUBLIC_STABLE_ALIASES = Object.freeze([
  "help",
  "scripts:inventory",
  "scripts:inventory:check",
  "db:test",
  "config:check",
  "check",
  "verify",
  "verify:database",
  "recovery",
  "recovery:status",
  "env:hygiene",
  "env:compose",
  "project:consistency",
  "working-tree:fingerprint",
  "governance:fingerprint",
  "testing:inventory",
  "testing:inventory:check",
]);

/**
 * Caller discovery corpus: workflows/docs/scripts plus runtime/build consumers
 * (Dockerfile*, compose*.yaml, playwright*.config.*, docker/** including
 * recovery/systemd). Globs are expanded at the repository root only.
 */
const CALLER_GLOBS = Object.freeze([
  ".github/workflows",
  ".github/actions",
  "docs",
  "scripts",
  "docker",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "Dockerfile*",
  "compose*.yaml",
  "compose*.yml",
  "playwright*.config.*",
]);

/**
 * Expand CALLER_GLOBS into absolute existing file/directory paths.
 * Globs are resolved from the repository root (non-recursive basename matches).
 * Bare paths may be files or directory trees.
 * @param {string} root
 * @returns {string[]}
 */
export function resolveCallerRoots(root) {
  /** @type {string[]} */
  const out = [];
  for (const pattern of CALLER_GLOBS) {
    if (pattern.includes("*") || pattern.includes("?")) {
      for (const rel of globSync(pattern, { cwd: root })) {
        // Reject nested matches if a glob accidentally expands deeply.
        if (rel.includes("/") || rel.includes("\\")) continue;
        const abs = path.join(root, rel);
        if (existsSync(abs)) out.push(abs);
      }
      continue;
    }
    const abs = path.join(root, pattern);
    if (existsSync(abs)) out.push(abs);
  }
  return [...new Set(out)].sort((a, b) => a.localeCompare(b));
}

/**
 * @param {string} name
 * @param {string} body
 * @returns {ScriptCategory}
 */
export function classifyScript(name, body) {
  const n = name;
  const b = body;

  if (n === "db:test" || n === "config:check") return "LEGACY_OR_ALIAS";
  if (/^test:imp036[a-z]:/.test(n) || /imp028c|imp036c/.test(n)) return "ONE_OFF";
  // TEST_* before broad :recover matching so suites like test:recovery stay tests.
  if (n === "test:recovery") return "TEST_UNIT";
  if (
    n.startsWith("recovery") ||
    n.includes(":recover") ||
    n.endsWith("recover-missing") ||
    n.includes("recover-missing") ||
    n === "env:staging:recover-postgres"
  ) {
    return "RECOVERY";
  }
  if (
    n.includes("bootstrap") ||
    n === "access:grant-assessment-roles" ||
    n === "assortment:configure-outlet-operating-uat"
  ) {
    return "BOOTSTRAP";
  }
  if (n.startsWith("docker:") || n === "test:e2e:docker") return "DOCKER";
  if (n.startsWith("staging:") || n.startsWith("env:staging:") || n === "test:staging-baseline") {
    return "STAGING";
  }
  if (n.startsWith("env:")) return "ENVIRONMENT";
  if (
    n.startsWith("db:") ||
    n.startsWith("auth:schema:") ||
    n === "db:migrations:check" ||
    n === "db:schema:check"
  ) {
    return "DATABASE";
  }
  if (
    n === "help" ||
    n.startsWith("scripts:inventory") ||
    n.startsWith("testing:") ||
    n.startsWith("governance:") ||
    n === "project:consistency" ||
    n === "working-tree:fingerprint" ||
    n === "agent:context:check" ||
    n === "validation:summary"
  ) {
    return "GOVERNANCE";
  }
  if (n.startsWith("audit:") || n === "lint" || n === "typecheck" || n.startsWith("config:check")) {
    return "AUDIT";
  }
  if (n.startsWith("test:e2e")) return "TEST_E2E";
  if (n === "test:database" || n.startsWith("test:database:")) return "TEST_DATABASE";
  if (n === "test:watch" || n === "test:coverage" || n === "test:scripts" || n === "test:recovery") {
    return "TEST_UNIT";
  }
  if (n === "test" || n.startsWith("test:")) {
    if (/\bvitest\.database\.config\b/.test(b) || /integration|concurrency|security|http|crash|idempotency|provider|reconciliation|promotions|razorpay/.test(n)) {
      return "TEST_INTEGRATION";
    }
    return "TEST_UNIT";
  }
  if (n === "dev" || n === "figma:sync") return "DEV";
  if (
    n === "build" ||
    n.endsWith(":build") ||
    n === "start" ||
    n.endsWith(":start")
  ) {
    return n.endsWith(":start") || n === "start" ? "OPERATIONS" : "BUILD";
  }
  if (n === "check" || n === "verify" || n === "verify:database") return "OPERATIONS";
  if (
    n.startsWith("workforce:user:") ||
    n === "serviceability:set-distance-policy" ||
    n === "menu:inventory-existing" ||
    n === "menu:import-existing" ||
    n === "menu:verify-existing" ||
    n === "ordering-catalog:generate" ||
    n === "assortment:verify-existing-menu" ||
    n === "pricing:verify-existing-menu" ||
    n === "fd:signing" ||
    n === "origin-trust:verify"
  ) {
    return "OPERATIONS";
  }
  return "OPERATIONS";
}

/**
 * @param {string} body
 * @returns {boolean}
 */
export function isExactNpmRunAlias(body) {
  return /^\s*npm\s+run\s+[A-Za-z0-9:_./-]+\s*$/.test(body);
}

/**
 * @param {string} name
 * @param {string} body
 * @returns {boolean}
 */
export function isMutatingCommand(name, body) {
  const s = `${name} ${body}`.toLowerCase();
  return (
    /\bdb:reset\b/.test(s) ||
    /\bdb:generate\b/.test(s) ||
    /\bdb:migrate\b/.test(s) ||
    /\bdocker:migrate\b/.test(s) ||
    /\bdocker:down\b/.test(s) ||
    /\bdb:down\b/.test(s) ||
    /\bmigrations:seal\b/.test(s) ||
    (/\bdeploy\b/.test(s) && !/dry-run/.test(s)) ||
    /\brecover-postgres\b/.test(s) ||
    /\brecovery:backup\b/.test(s) ||
    /:recover-missing/.test(s) ||
    /\bbootstrap\b/.test(s) ||
    /\bworkforce:user:(create|disable|enable|reset-)/.test(s) ||
    /\bmenu:import-existing\b/.test(s) ||
    /\bgrant-assessment-roles\b/.test(s) ||
    /\bset-distance-policy\b/.test(s) ||
    /\bconfigure-outlet-operating-uat\b/.test(s) ||
    /\bdrizzle-kit (generate|push)\b/.test(s)
  );
}

/**
 * @param {string} name
 * @param {string} body
 * @returns {boolean}
 */
export function isEnvironmentSpecific(name, body) {
  const s = `${name} ${body}`.toLowerCase();
  return /staging|docker|compose|uat|founder|\.env|podman|ci\b|production|\bprod\b/.test(s);
}

/**
 * @param {string} body
 * @returns {string[]}
 */
export function extractNpmRunDeps(body) {
  const out = [];
  const re = /npm\s+run\s+([A-Za-z0-9:_./-]+)/g;
  let m;
  while ((m = re.exec(body))) out.push(m[1]);
  return [...new Set(out)];
}

/**
 * @param {string} root
 * @returns {string}
 */
function ripgrepNpmRunCorpus(root) {
  const args = ["-n", "--no-heading", "-e", String.raw`npm\s+run\s+[A-Za-z0-9:_./-]+`];
  const roots = resolveCallerRoots(root);
  if (roots.length === 0) return "";
  args.push(...roots);
  try {
    return execFileSync("rg", args, {
      encoding: "utf8",
      maxBuffer: 40 * 1024 * 1024,
      cwd: root,
    });
  } catch (err) {
    if (err && typeof err === "object" && "status" in err && err.status === 1) {
      return typeof err.stdout === "string" ? err.stdout : "";
    }
    return scanCallerCorpus(root);
  }
}

/**
 * @param {string} root
 * @returns {string}
 */
function scanCallerCorpus(root) {
  const chunks = [];
  const walk = (rel) => {
    const abs = path.join(root, rel);
    if (!existsSync(abs)) return;
    const st = statSync(abs);
    if (st.isFile()) {
      let text;
      try {
        text = readFileSync(abs, "utf8");
      } catch {
        return;
      }
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (/npm\s+run\s+[A-Za-z0-9:_./-]/.test(lines[i])) {
          chunks.push(`${abs}:${i + 1}:${lines[i]}`);
        }
      }
      return;
    }
    if (!st.isDirectory()) return;
    for (const ent of readdirSync(abs)) {
      if (ent === "node_modules" || ent === ".git" || ent === ".next" || ent === "coverage") continue;
      walk(path.join(rel, ent));
    }
  };
  for (const abs of resolveCallerRoots(root)) {
    walk(path.relative(root, abs) || ".");
  }
  return chunks.join("\n");
}

/**
 * @param {string} root
 * @param {Record<string, string>} scripts
 */
function collectCallers(root, scripts) {
  /** @type {Record<string, {workflows: string[], docs: string[], other: string[], packageScripts: string[]}>} */
  const callers = Object.fromEntries(
    Object.keys(scripts).map((n) => [
      n,
      { workflows: [], docs: [], other: [], packageScripts: [] },
    ]),
  );

  for (const [parent, body] of Object.entries(scripts)) {
    for (const dep of extractNpmRunDeps(body)) {
      if (!callers[dep]) continue;
      if (!callers[dep].packageScripts.includes(parent)) {
        callers[dep].packageScripts.push(parent);
      }
    }
  }

  let corpus = ripgrepNpmRunCorpus(root);
  if (!corpus) corpus = scanCallerCorpus(root);

  for (const line of corpus.split("\n")) {
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const file = line.slice(0, colon);
    const rest = line.slice(colon + 1);
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (rel === "package.json") continue;
    // Avoid self-referential caller inflation from the generated snapshot bodies.
    if (rel === SNAPSHOT_REL) continue;
    const re = /npm\s+run\s+([A-Za-z0-9:_./-]+)/g;
    let m;
    while ((m = re.exec(rest))) {
      const script = m[1].replace(/[.,;:)\]}'"`]+$/, "");
      if (!callers[script]) continue;
      const bucket =
        rel.startsWith(".github/")
          ? "workflows"
          : rel.startsWith("docs/") || /\.(md|mdx)$/.test(rel)
            ? "docs"
            : "other";
      if (!callers[script][bucket].includes(rel)) callers[script][bucket].push(rel);
    }
  }

  for (const c of Object.values(callers)) {
    c.workflows.sort();
    c.docs.sort();
    c.other.sort();
    c.packageScripts.sort();
  }
  return callers;
}

/**
 * @param {string} [root]
 */
export function buildPackageScriptsInventory(root = DEFAULT_ROOT) {
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const scripts = pkg.scripts || {};
  const names = Object.keys(scripts).sort();
  const callers = collectCallers(root, scripts);

  /** @type {Map<string, string[]>} */
  const byBody = new Map();
  for (const name of names) {
    const norm = scripts[name].replace(/\s+/g, " ").trim();
    if (!byBody.has(norm)) byBody.set(norm, []);
    byBody.get(norm).push(name);
  }

  const records = names.map((name) => {
    const body = scripts[name];
    const norm = body.replace(/\s+/g, " ").trim();
    const dupGroup = byBody.get(norm) || [name];
    const c = callers[name];
    const alias = isExactNpmRunAlias(body) || (dupGroup.length > 1 && name === "config:check");
    const referenced =
      c.workflows.length + c.docs.length + c.other.length + c.packageScripts.length > 0;
    const publicStable =
      PUBLIC_STABLE_ALIASES.includes(name) ||
      c.workflows.length > 0 ||
      c.docs.length > 0 ||
      ["dev", "build", "start", "lint", "typecheck", "test", "check", "verify"].includes(name);
    const internalOnly =
      !publicStable &&
      c.packageScripts.length > 0 &&
      c.workflows.length === 0 &&
      c.docs.length === 0 &&
      c.other.length === 0;
    const orphan = !referenced && !publicStable;

    return {
      name,
      body,
      category: classifyScript(name, body),
      workflowCallers: c.workflows,
      docCallers: c.docs,
      packageScriptCallers: c.packageScripts,
      otherCallers: c.other,
      publicStable,
      internalOnly,
      alias,
      duplicate: dupGroup.length > 1,
      duplicateGroup: dupGroup.length > 1 ? dupGroup : [],
      mutating: isMutatingCommand(name, body),
      environmentSpecific: isEnvironmentSpecific(name, body),
      orphan,
    };
  });

  /** @type {Record<string, number>} */
  const categoryCounts = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  for (const r of records) categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;

  const duplicateBodies = [...byBody.entries()]
    .filter(([, g]) => g.length > 1)
    .map(([body, group]) => ({ body, group: [...group].sort() }))
    .sort((a, b) => a.group.join(",").localeCompare(b.group.join(",")));

  return {
    schemaVersion: SCHEMA_VERSION,
    generatedBy: "scripts/package-scripts-inventory.mjs",
    packageName: pkg.name,
    scriptCount: names.length,
    categoryCounts,
    orphanCount: records.filter((r) => r.orphan).length,
    duplicateBodyCount: duplicateBodies.length,
    publicStableCount: records.filter((r) => r.publicStable).length,
    internalOnlyCount: records.filter((r) => r.internalOnly).length,
    mutatingCommandCount: records.filter((r) => r.mutating).length,
    aliasCount: records.filter((r) => r.alias).length,
    publicStableAliases: [...PUBLIC_STABLE_ALIASES],
    duplicateBodies,
    orphans: records.filter((r) => r.orphan).map((r) => r.name),
    records,
  };
}

/**
 * @param {ReturnType<typeof buildPackageScriptsInventory>} inventory
 */
export function serializeInventory(inventory) {
  return `${JSON.stringify(inventory, null, 2)}\n`;
}

/**
 * @param {string} root
 * @param {ReturnType<typeof buildPackageScriptsInventory>} [inventory]
 */
export function writeInventorySnapshot(root = DEFAULT_ROOT, inventory = buildPackageScriptsInventory(root)) {
  const outPath = path.join(root, SNAPSHOT_REL);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, serializeInventory(inventory), "utf8");
  return outPath;
}

/**
 * @param {string} root
 */
export function checkInventorySnapshot(root = DEFAULT_ROOT) {
  const expectedPath = path.join(root, SNAPSHOT_REL);
  if (!existsSync(expectedPath)) {
    return {
      ok: false,
      message: `Missing snapshot ${SNAPSHOT_REL}. Run: node scripts/package-scripts-inventory.mjs --write`,
    };
  }
  const actual = serializeInventory(buildPackageScriptsInventory(root));
  const expected = readFileSync(expectedPath, "utf8");
  if (actual !== expected) {
    return {
      ok: false,
      message: `package-scripts inventory drift vs ${SNAPSHOT_REL}. Run: node scripts/package-scripts-inventory.mjs --write`,
    };
  }
  return { ok: true, message: "package-scripts inventory matches snapshot" };
}

/**
 * @param {ReturnType<typeof buildPackageScriptsInventory>} inventory
 */
export function formatHelpText(inventory) {
  const lines = [
    "BOBA Bear package script command surface (HYG-04)",
    `Scripts: ${inventory.scriptCount}`,
    "",
    "Categories:",
  ];
  for (const cat of CATEGORIES) {
    const n = inventory.categoryCounts[cat] || 0;
    if (n === 0) continue;
    lines.push(`  ${cat.padEnd(18)} ${String(n).padStart(3)}`);
  }
  lines.push("", "Public/stable aliases (frozen):");
  for (const a of inventory.publicStableAliases) {
    const rec = inventory.records.find((r) => r.name === a);
    lines.push(`  npm run ${a}${rec ? `  →  ${rec.body.slice(0, 72)}` : ""}`);
  }
  lines.push(
    "",
    "Discoverability:",
    "  npm run help",
    "  npm run scripts:inventory",
    "  npm run scripts:inventory:check",
    "",
    "Full inventory:",
    `  ${SNAPSHOT_REL}`,
    "  docs/platform/engineering/package-scripts-command-surface.md",
    "",
  );

  const byCat = new Map();
  for (const r of inventory.records) {
    if (!byCat.has(r.category)) byCat.set(r.category, []);
    byCat.get(r.category).push(r.name);
  }
  for (const cat of CATEGORIES) {
    const names = byCat.get(cat);
    if (!names?.length) continue;
    lines.push(`${cat}`);
    for (const name of names) lines.push(`  ${name}`);
    lines.push("");
  }
  return lines.join("\n");
}

function main(argv = process.argv.slice(2)) {
  const root = DEFAULT_ROOT;
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(
      "Usage: node scripts/package-scripts-inventory.mjs [--write|--check|--help-text]\n",
    );
    return 0;
  }
  const inventory = buildPackageScriptsInventory(root);
  if (argv.includes("--check")) {
    const result = checkInventorySnapshot(root);
    process.stdout.write(`${result.message}\n`);
    return result.ok ? 0 : 1;
  }
  if (argv.includes("--write")) {
    const out = writeInventorySnapshot(root, inventory);
    process.stdout.write(`Wrote ${path.relative(root, out)}\n`);
    process.stdout.write(
      JSON.stringify(
        {
          scriptCount: inventory.scriptCount,
          categoryCounts: inventory.categoryCounts,
          orphanCount: inventory.orphanCount,
          duplicateBodyCount: inventory.duplicateBodyCount,
          publicStableCount: inventory.publicStableCount,
          internalOnlyCount: inventory.internalOnlyCount,
          mutatingCommandCount: inventory.mutatingCommandCount,
        },
        null,
        2,
      ) + "\n",
    );
    return 0;
  }
  if (argv.includes("--help-text")) {
    process.stdout.write(formatHelpText(inventory));
    return 0;
  }
  process.stdout.write(
    JSON.stringify(
      {
        scriptCount: inventory.scriptCount,
        categoryCounts: inventory.categoryCounts,
        orphanCount: inventory.orphanCount,
        duplicateBodyCount: inventory.duplicateBodyCount,
        publicStableCount: inventory.publicStableCount,
        internalOnlyCount: inventory.internalOnlyCount,
        mutatingCommandCount: inventory.mutatingCommandCount,
        aliasCount: inventory.aliasCount,
      },
      null,
      2,
    ) + "\n",
  );
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
