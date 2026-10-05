import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parseGovernanceMeta } from "./model.mjs";
import { runShadow } from "./shadow.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scriptPath = path.join(root, "scripts/governance-v2/shadow.mjs");

describe("GOV-2 shadow command", () => {
  it("reports the TEST-ONLY current fixture without mutating the tree", () => {
    const report = runShadow(root);
    assert.equal(report.GOV2_PHASE, "SHADOW");
    assert.equal(report.GOV2_CUTOVER, "NO");
    assert.equal(report.CURRENT_GOVERNANCE_REMAINS_AUTHORITATIVE, "YES");
    assert.equal(report.STATE_VALID, "PASS");
    assert.equal(report.DERIVED_NEXT_GATE, "T8");
    assert.equal(report.REAL_T8_STARTED, "NO");
    assert.equal(report.ok, true);
    assert.equal(report.liveRoadmapMeta.roadmapVersion, "GTM-R188");
    assert.equal(report.liveStateMeta.stateVersion, "STATE-R186");
    assert.equal(report.prBPrerequisites.force_push, "prohibited");
    assert.equal(report.prBPrerequisites.currentMainProtected, false);
  });

  it("is read-only when executed as a process", () => {
    const before = spawnSync("git", ["-C", root, "status", "--porcelain"], { encoding: "utf8" });
    const result = spawnSync(process.execPath, [scriptPath], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(report.ok, true);
    const after = spawnSync("git", ["-C", root, "status", "--porcelain"], { encoding: "utf8" });
    assert.equal(after.stdout, before.stdout);
  });

  it("parses only governance-meta JSON, so narrative tokens cannot supply current state", () => {
    const parsed = parseGovernanceMeta(`<!-- governance-meta
{"stateVersion":"STATE-R186","acceptedThrough":"IMP-036I","currentProductSlice":"IMP-036J"}
-->
IMP036J_TRANCHE_8: PASS
T8_STARTED: YES
IMP036J_ACCEPTED: YES
`);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.meta.stateVersion, "STATE-R186");
    assert.equal(parsed.meta.currentProductSlice, "IMP-036J");
    assert.equal("T8_STARTED" in parsed.meta, false);
    assert.equal(parsed.meta.accepted, undefined);
  });
});
