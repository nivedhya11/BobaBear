import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { validateLiveCurrentState, alignGovernanceMetaToGov2Blocks } from "./current.mjs";
import { loadLiveAuthorities, parseGov2Block } from "./load-authorities.mjs";
import { validateCurrentState } from "./invariants.mjs";
import { CURRENT_AUTHORITY_KIND, parseCurrentGovernanceMeta } from "./schema.mjs";
import { loadFixture } from "./load-fixture.mjs";
import { buildGovernanceContext, serializeGovernanceContext, SNAPSHOT_REL } from "../governance-context.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("GOV-2 live authorities", () => {
  it("validates live ROADMAP/STATE/plan blocks and records T8 PASS", () => {
    const report = validateLiveCurrentState(root);
    assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
    assert.equal(report.GOV2_VALIDATION_AUTHORITATIVE, "YES");
    assert.equal(report.GOV2_AUTHORITY_MODE, "GOV2");
    assert.equal("CUTOVER_CANDIDATE" in report, false);
    assert.equal("MERGED" in report, false);
    assert.equal("GOV2_PHASE" in report, false);
    assert.equal(report.REAL_T8_STARTED, "YES");
    assert.equal(report.T8_STATUS, "PASS");
    assert.equal(report.DERIVED_NEXT_GATE, "NONE");
  });

  it("fails when the current STATE block is removed even if historical prose remains", () => {
    const state = readFileSync(path.join(root, "docs/platform/STATE.md"), "utf8");
    const stripped = state.replace(/<!--\s*gov2-state[\s\S]*?-->/, "IMP036J_TRANCHE_8: PASS\nT8_STARTED: YES");
    const parsed = parseGov2Block(stripped, "state");
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, "CURRENT_AUTHORITY_MISSING");
  });

  it("fails when the current STATE block is corrupted", () => {
    const parsed = parseGov2Block("<!-- gov2-state { not-json -->", "state");
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, "CURRENT_AUTHORITY_MALFORMED");
  });

  it("keeps live T8 PASS and nextGate NONE without requiring a validator source change", () => {
    const loaded = loadLiveAuthorities(root);
    assert.equal(loaded.ok, true, JSON.stringify(loaded.findings, null, 2));
    assert.equal(loaded.state.implementation.trancheStatuses.T8, "PASS");
    const current = validateCurrentState(loaded.state, loaded.plan, loaded.roadmap);
    assert.equal(current.ok, true, JSON.stringify(current.findings, null, 2));
    assert.equal(current.nextGate, "NONE");
    const simulated = loadFixture(root, "imp036j-t8-pass-simulated.json");
    assert.equal(simulated.REAL_T8_STARTED, false);
    assert.equal(validateLiveCurrentState(root).REAL_T8_STARTED, "YES");
  });

  it("does not require checkpoint-specific validator source for an ordinary PASS copy", () => {
    const loaded = loadLiveAuthorities(root);
    const current = validateCurrentState(loaded.state, loaded.plan, loaded.roadmap);
    assert.equal(current.ok, true, JSON.stringify(current.findings, null, 2));
    const engine = readFileSync(path.join(root, "scripts/governance-v2/invariants.mjs"), "utf8");
    assert.doesNotMatch(engine, /GTM-R189/);
    assert.doesNotMatch(engine, /T7_PASS/);
  });

  it("fails when GOV-2 blocks drift from CURRENT governance-meta pointers", () => {
    const loaded = loadLiveAuthorities(root);
    assert.equal(loaded.ok, true, JSON.stringify(loaded.findings, null, 2));
    const roadmapLive = readFileSync(path.join(root, "docs/platform/ROADMAP.md"), "utf8");
    const stateLive = readFileSync(path.join(root, "docs/platform/STATE.md"), "utf8");
    const roadmapMeta = parseCurrentGovernanceMeta(roadmapLive, CURRENT_AUTHORITY_KIND.ROADMAP);
    const stateMeta = parseCurrentGovernanceMeta(stateLive, CURRENT_AUTHORITY_KIND.STATE);
    const driftedRoadmap = { ...loaded.roadmap, acceptedThrough: "IMP-036H" };
    const driftedState = { ...loaded.state, acceptedThrough: "IMP-036H" };
    const findings = alignGovernanceMetaToGov2Blocks(roadmapMeta, stateMeta, driftedRoadmap, driftedState);
    assert.equal(
      findings.some((item) => item.code === "CURRENT_AUTHORITY_POINTER_MISMATCH"),
      true,
    );
    assert.equal(validateLiveCurrentState(root).ok, true);
  });

  it("passes GOV-2 current validation on live T8 PASS without validator source change", () => {
    const loaded = loadLiveAuthorities(root);
    assert.equal(loaded.ok, true, JSON.stringify(loaded.findings, null, 2));
    assert.equal(loaded.state.implementation.trancheStatuses.T8, "PASS");
    const current = validateCurrentState(loaded.state, loaded.plan, loaded.roadmap);
    assert.equal(current.ok, true, JSON.stringify(current.findings, null, 2));
    assert.equal(current.nextGate, "NONE");
    const consistency = readFileSync(path.join(root, "scripts/project-consistency.mjs"), "utf8");
    assert.doesNotMatch(consistency, /gov2Cutover = roadmapVersion === "GTM-R189"/);
    assert.doesNotMatch(consistency, /function isGov2CutoverCheckpoint/);
    assert.doesNotMatch(consistency, /function checkGov2Cutover/);
    assert.doesNotMatch(consistency, /function checkGov2GenericCurrent/);
    assert.doesNotMatch(consistency, /function isImp036jTranche1PassCheckpoint/);
    assert.doesNotMatch(consistency, /function checkImp036jTranche7Pass/);
    assert.equal(validateLiveCurrentState(root).T8_STATUS, "PASS");
  });
});

const SKIP_OVERLAY = new Set(["node_modules", ".next", "out", "coverage", ".validation-logs"]);

function materializeOverlayRoot() {
  const tmp = mkdtempSync(path.join(tmpdir(), "gov2-t8-"));
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

function writeMutatedState(tmp, mutate) {
  const rel = "docs/platform/STATE.md";
  const original = readFileSync(path.join(root, rel), "utf8");
  writeFileSync(path.join(tmp, rel), mutate(original));
  writeFileSync(path.join(tmp, SNAPSHOT_REL), serializeGovernanceContext(buildGovernanceContext(tmp)));
}

describe("GOV-2 full repository ordinary tranche simulation", () => {
  it("project-consistency and GOV-2 current PASS on T8 PASS data without validator source change", { timeout: 600_000 }, () => {
    const tmp = materializeOverlayRoot();
    try {
      writeMutatedState(tmp, (text) =>
        text
          .replace(/"T8": "NOT_STARTED"/, '"T8": "PASS"')
          .replace(/"tranche": "T7"/, '"tranche": "T8"'),
      );
      const env = { ...process.env, BOBA_PROJECT_ROOT: tmp };
      const current = spawnSync(process.execPath, [path.join(root, "scripts/governance-v2/current.mjs")], {
        cwd: tmp,
        encoding: "utf8",
        env,
      });
      assert.equal(current.status, 0, current.stderr || current.stdout);
      const currentReport = JSON.parse(current.stdout);
      assert.equal(currentReport.ok, true, JSON.stringify(currentReport.findings, null, 2));
      assert.equal(currentReport.DERIVED_NEXT_GATE, "NONE");
      assert.equal(currentReport.T8_STATUS, "PASS");
      const consistency = spawnSync(process.execPath, [path.join(root, "scripts/project-consistency.mjs")], {
        cwd: tmp,
        encoding: "utf8",
        env,
      });
      assert.equal(consistency.status, 0, consistency.stderr || consistency.stdout);
      assert.equal(JSON.parse(readFileSync(path.join(root, "docs/platform/STATE.md"), "utf8").match(/<!--\s*gov2-state\s*([\s\S]*?)-->/)[1]).implementation.trancheStatuses.T8, "PASS");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("future STATE revision identifiers do not require a checkpoint whitelist entry", { timeout: 600_000 }, () => {
    const tmp = materializeOverlayRoot();
    try {
      writeMutatedState(tmp, (text) => text.replaceAll("STATE-R188", "STATE-R189"));
      const env = { ...process.env, BOBA_PROJECT_ROOT: tmp };
      const current = spawnSync(process.execPath, [path.join(root, "scripts/governance-v2/current.mjs")], {
        cwd: tmp,
        encoding: "utf8",
        env,
      });
      assert.equal(current.status, 0, current.stderr || current.stdout);
      const consistency = spawnSync(process.execPath, [path.join(root, "scripts/project-consistency.mjs")], {
        cwd: tmp,
        encoding: "utf8",
        env,
      });
      assert.equal(consistency.status, 0, consistency.stderr || consistency.stdout);
      const consistencySource = readFileSync(path.join(root, "scripts/project-consistency.mjs"), "utf8");
      assert.doesNotMatch(consistencySource, /STATE-R189/);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
