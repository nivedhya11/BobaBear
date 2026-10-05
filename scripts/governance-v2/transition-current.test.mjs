import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { validateRepositoryTransition } from "./transition-current.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cli = path.join(root, "scripts/governance-v2/transition-current.mjs");
const SKIP_OVERLAY = new Set(["node_modules", ".next", "out", "coverage", ".validation-logs"]);

function gitSha(spec) {
  const result = spawnSync("git", ["-C", root, "rev-parse", "--verify", `${spec}^{commit}`], { encoding: "utf8" });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function originMainSha() {
  return gitSha("origin/main");
}

function materializeOverlayRoot() {
  const tmp = mkdtempSync(path.join(tmpdir(), "gov2-transition-"));
  for (const name of readdirSync(root)) {
    if (SKIP_OVERLAY.has(name)) continue;
    const src = path.join(root, name);
    const dest = path.join(tmp, name);
    if (name === "docs") {
      cpSync(src, dest, { recursive: true });
    } else {
      symlinkSync(src, dest);
    }
  }
  symlinkSync(path.join(root, "node_modules"), path.join(tmp, "node_modules"));
  return tmp;
}

function mutateState(tmp, mutate) {
  const rel = "docs/platform/STATE.md";
  writeFileSync(path.join(tmp, rel), mutate(readFileSync(path.join(root, rel), "utf8")));
}

function runCli(tmp, baseSha) {
  return spawnSync(process.execPath, [cli, baseSha], {
    cwd: tmp,
    encoding: "utf8",
    env: { ...process.env, BOBA_PROJECT_ROOT: tmp },
  });
}

describe("GOV-2 authoritative transition command", () => {
  it("bootstraps pre-GOV2 base to the current GOV-2 working tree", { skip: !originMainSha() }, () => {
    const base = originMainSha();
    assert.ok(base);
    const result = spawnSync(process.execPath, [cli, base], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, BOBA_PROJECT_ROOT: root },
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
    assert.equal(report.MODE, "GOV2_BOOTSTRAP");
    assert.equal(report.BASE_HAS_GOV2, "NO");
    assert.equal(report.HEAD_HAS_GOV2, "YES");
  });

  it("validates a normal GOV-2 to GOV-2 identity transition from git", () => {
    const head = gitSha("HEAD");
    assert.ok(head);
    const report = validateRepositoryTransition({ root, baseSha: head, headSha: head });
    assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
    assert.equal(report.MODE, "GOV2_TO_GOV2");
  });

  it("fails through the CI command when T8 PASS keeps stale T7 lastTransition", { timeout: 120_000 }, () => {
    const tmp = materializeOverlayRoot();
    try {
      mutateState(tmp, (text) => text.replace(/"T8": "NOT_STARTED"/, '"T8": "PASS"'));
      const result = runCli(tmp, gitSha("HEAD"));
      assert.notEqual(result.status, 0, result.stdout);
      const report = JSON.parse(result.stdout);
      assert.equal(report.ok, false);
      assert.ok(
        report.findings.some((item) => item.code === "LAST_TRANSITION_TRANCHE_MISMATCH"),
        JSON.stringify(report.findings, null, 2),
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("passes through the CI command when T8 PASS has valid lastTransition evidence", { timeout: 120_000 }, () => {
    const tmp = materializeOverlayRoot();
    try {
      mutateState(tmp, (text) =>
        text
          .replace(/"T8": "NOT_STARTED"/, '"T8": "PASS"')
          .replace(/"tranche": "T7"/, '"tranche": "T8"')
          .replace(/"sourcePr": 357/, '"sourcePr": 1'),
      );
      const result = runCli(tmp, gitSha("HEAD"));
      assert.equal(result.status, 0, result.stderr || result.stdout);
      const report = JSON.parse(result.stdout);
      assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
      assert.equal(report.T8_STATUS, "PASS");
      assert.equal(
        JSON.parse(readFileSync(path.join(root, "docs/platform/STATE.md"), "utf8").match(/<!--\s*gov2-state\s*([\s\S]*?)-->/)[1])
          .implementation.trancheStatuses.T8,
        "NOT_STARTED",
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("rejects rollback from GOV-2 to pre-GOV2", { skip: !originMainSha() }, () => {
    const head = gitSha("HEAD");
    const base = originMainSha();
    assert.ok(head && base);
    const report = validateRepositoryTransition({ root, baseSha: head, headSha: base });
    assert.equal(report.ok, false);
    assert.equal(report.MODE, "GOV2_ROLLBACK");
    assert.ok(report.findings.some((item) => item.code === "GOV2_ROLLBACK"));
  });
});
