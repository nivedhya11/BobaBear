#!/usr/bin/env node
/**
 * Concise wrapper for the standard governance validation set.
 *
 * Each check runs once. Full command output is written to ignored
 * `.validation-logs/` files. Stdout is PASS/FAIL per check, the working-tree
 * fingerprint, and the first actionable failure. Logs are read only when a
 * check fails. A failed check is not retried.
 *
 *   npm run validation:summary
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "..");
const LOG_DIR_REL = ".validation-logs";

/**
 * Same governance commands as the CI quality job, plus the generated-context
 * drift check. Lint, typecheck, and env hygiene stay outside this set.
 */
export const GOVERNANCE_VALIDATION_CHECKS = Object.freeze([
  "project:consistency",
  "governance:fingerprint",
  "governance:context:check",
  "testing:inventory:check",
  "working-tree:fingerprint",
]);

/**
 * @param {string} script
 */
export function logFileName(script) {
  return `${script.replace(/:/g, "_")}.log`;
}

/**
 * @param {string} logText
 */
export function firstActionableLine(logText) {
  const lines = logText.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("# ") || line.startsWith("---") || line.startsWith("> ")) continue;
    if (
      /\bFAIL\b/.test(line) ||
      /\bError\b/.test(line) ||
      /\bERROR\b/.test(line) ||
      /\bnot ok\b/.test(line) ||
      /\bdrift\b/.test(line) ||
      /\bMISSING\b/.test(line) ||
      /\bENOENT\b/.test(line)
    ) {
      return line;
    }
  }
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("# ") || line.startsWith("---") || line.startsWith("> ")) continue;
    return line;
  }
  return "command failed without output";
}

/**
 * @param {string} stdout
 */
export function fingerprintFromOutput(stdout) {
  const match = stdout.match(/WORKING_TREE_FINGERPRINT\s+([0-9a-f]{64})/);
  return match ? match[1] : null;
}

/**
 * @param {string} root
 * @param {string} script
 */
function defaultRun(root, script) {
  const result = spawnSync("npm", ["run", script], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: process.env,
  });
  return {
    status: result.status === null ? 1 : result.status,
    stdout: result.stdout ?? "",
    stderr: `${result.stderr ?? ""}${result.error ? `\n${result.error.message}` : ""}`,
  };
}

/**
 * @param {{
 *   root?: string,
 *   checks?: readonly string[],
 *   run?: (root: string, script: string) => { status: number, stdout: string, stderr: string },
 *   logDir?: string,
 * }} [options]
 */
export function runValidationSummary(options = {}) {
  const root = options.root ?? DEFAULT_ROOT;
  const checks = options.checks ?? GOVERNANCE_VALIDATION_CHECKS;
  const run = options.run ?? defaultRun;
  const logDir = options.logDir ?? path.join(root, LOG_DIR_REL);
  mkdirSync(logDir, { recursive: true });

  /** @type {{ script: string, status: "PASS" | "FAIL", logRel: string }[]} */
  const results = [];
  /** @type {string | null} */
  let fingerprint = null;
  /** @type {{ script: string, line: string, logRel: string } | null} */
  let firstFailure = null;

  for (const script of checks) {
    const executed = run(root, script);
    const logRel = `${LOG_DIR_REL}/${logFileName(script)}`;
    const logAbs = path.join(logDir, logFileName(script));
    const logBody = [
      `# command: npm run ${script}`,
      `# exit: ${executed.status}`,
      "# original output from a single run; not a retry",
      "--- stdout ---",
      executed.stdout.replace(/\s*$/, ""),
      "--- stderr ---",
      executed.stderr.replace(/\s*$/, ""),
      "",
    ].join("\n");
    writeFileSync(logAbs, logBody);

    const passed = executed.status === 0;
    results.push({ script, status: passed ? "PASS" : "FAIL", logRel });
    if (script === "working-tree:fingerprint" && passed) {
      fingerprint = fingerprintFromOutput(executed.stdout);
    }
    if (!passed && !firstFailure) {
      const stored = readFileSync(logAbs, "utf8");
      firstFailure = { script, line: firstActionableLine(stored), logRel };
    }
  }

  const overall = results.every((item) => item.status === "PASS") && fingerprint ? "PASS" : "FAIL";
  const lines = [`validation:summary ${overall}`];
  for (const item of results) lines.push(`${item.script} ${item.status}`);
  lines.push(`fingerprint ${fingerprint ?? "UNAVAILABLE"}`);
  if (firstFailure) {
    lines.push(`FIRST_FAILURE ${firstFailure.script}: ${firstFailure.line}`);
    lines.push(`log=${firstFailure.logRel}`);
  } else if (overall === "FAIL") {
    lines.push("FIRST_FAILURE working-tree:fingerprint: fingerprint missing from command output");
    lines.push(`log=${LOG_DIR_REL}/${logFileName("working-tree:fingerprint")}`);
  }
  return {
    overall,
    results,
    fingerprint,
    firstFailure,
    stdout: `${lines.join("\n")}\n`,
  };
}

function main() {
  const summary = runValidationSummary();
  process.stdout.write(summary.stdout);
  process.exit(summary.overall === "PASS" ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
