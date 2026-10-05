import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { CURRENT_AUTHORITY_KIND, parseCurrentGovernanceMeta } from "./schema.mjs";
import { runShadow } from "./shadow.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scriptPath = path.join(root, "scripts/governance-v2/shadow.mjs");

describe("GOV-2 shadow command", () => {
  it("reports the TEST-ONLY current fixture without mutating the tree", () => {
    const report = runShadow(root);
    assert.equal(report.GOV2_PHASE, "SHADOW");
    assert.equal(report.GOV2_AUTHORITY_MODE, "GOV2");
    assert.equal(report.CURRENT_GOVERNANCE_REMAINS_AUTHORITATIVE, "NO");
    assert.equal(report.STATE_VALID, "PASS");
    assert.equal(report.DERIVED_NEXT_GATE, "T8");
    assert.equal(report.REAL_T8_STARTED, "NO");
    assert.equal(report.LIVE_CURRENT_META_VALID, "PASS");
    assert.equal(report.LIVE_ROADMAP_STATE_ALIGNMENT, "PASS");
    assert.equal(report.ok, true);
    assert.equal(typeof report.liveRoadmapMeta.roadmapVersion, "string");
    assert.equal(typeof report.liveStateMeta.stateVersion, "string");
    assert.match(report.liveRoadmapMeta.roadmapVersion, /^GTM-R\d+$/);
    assert.match(report.liveStateMeta.stateVersion, /^STATE-R\d+$/);
    assert.equal(report.liveRoadmapMeta.authority, CURRENT_AUTHORITY_KIND.ROADMAP);
    assert.equal(report.liveStateMeta.authority, CURRENT_AUTHORITY_KIND.STATE);
    assert.equal(report.liveRoadmapMeta.status, "CURRENT");
    assert.equal(report.liveStateMeta.status, "CURRENT");
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

  it("parses only the unique CURRENT governance-meta block", () => {
    const parsed = parseCurrentGovernanceMeta(
      `<!-- governance-meta
{"status":"CURRENT","authority":"ACCEPTED_STATE","stateVersion":"STATE-R186","acceptedThrough":"IMP-036I","currentProductSlice":"IMP-036J"}
-->
IMP036J_TRANCHE_8: PASS
T8_STARTED: YES
IMP036J_ACCEPTED: YES
`,
      CURRENT_AUTHORITY_KIND.STATE,
    );
    assert.equal(parsed.ok, true);
    assert.equal(parsed.meta.stateVersion, "STATE-R186");
    assert.equal(parsed.meta.currentProductSlice, "IMP-036J");
    assert.equal("T8_STARTED" in parsed.meta, false);
    assert.equal(parsed.meta.accepted, undefined);
  });

  it("fails when zero CURRENT blocks are present", () => {
    const parsed = parseCurrentGovernanceMeta("# no meta", CURRENT_AUTHORITY_KIND.STATE);
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, "CURRENT_AUTHORITY_MISSING");
  });

  it("fails when two CURRENT blocks are present", () => {
    const parsed = parseCurrentGovernanceMeta(
      `<!-- governance-meta
{"status":"CURRENT","authority":"ACCEPTED_STATE"}
-->
<!-- governance-meta
{"status":"CURRENT","authority":"ACCEPTED_STATE"}
-->`,
      CURRENT_AUTHORITY_KIND.STATE,
    );
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, "CURRENT_AUTHORITY_NOT_UNIQUE");
  });

  it("fails malformed CURRENT before later historical/supporting meta", () => {
    const parsed = parseCurrentGovernanceMeta(
      `<!-- governance-meta
{ BROKEN_OR_MISSING_CURRENT_BLOCK
-->
<!-- governance-meta
{"status":"HISTORICAL","authority":"ACCEPTED_STATE","stateVersion":"STATE-R186"}
-->`,
      CURRENT_AUTHORITY_KIND.STATE,
    );
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, "CURRENT_AUTHORITY_MALFORMED");
  });

  it("does not let historical meta mask a missing current block", () => {
    const parsed = parseCurrentGovernanceMeta(
      `BROKEN_OR_MISSING_CURRENT_BLOCK

... historical text ...

<!-- governance-meta
{
  "status": "HISTORICAL",
  "authority": "ACCEPTED_STATE",
  "stateVersion": "STATE-R186",
  "acceptedThrough": "IMP-036I",
  "currentProductSlice": "IMP-036J"
}
-->`,
      CURRENT_AUTHORITY_KIND.STATE,
    );
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, "CURRENT_AUTHORITY_MISSING");
  });

  it("fails a later fake CURRENT when current authority is not unique", () => {
    const parsed = parseCurrentGovernanceMeta(
      `<!-- governance-meta
{"status":"CURRENT","authority":"ACCEPTED_STATE"}
-->
<!-- governance-meta
{"status":"CURRENT","authority":"ACCEPTED_STATE"}
-->`,
      CURRENT_AUTHORITY_KIND.STATE,
    );
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, "CURRENT_AUTHORITY_NOT_UNIQUE");
  });

  it("fails wrong authority type", () => {
    const parsed = parseCurrentGovernanceMeta(
      `<!-- governance-meta
{"status":"CURRENT","authority":"IMPLEMENTATION_SEQUENCE"}
-->`,
      CURRENT_AUTHORITY_KIND.STATE,
    );
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, "CURRENT_AUTHORITY_KIND_MISMATCH");
  });

  it("does not let narrative lifecycle tokens rescue a missing current block", () => {
    const parsed = parseCurrentGovernanceMeta(
      `acceptedThrough: IMP-036I
currentProductSlice: IMP-036J
nextProductSlice: IMP-036K
status: CURRENT
authority: ACCEPTED_STATE
`,
      CURRENT_AUTHORITY_KIND.STATE,
    );
    assert.equal(parsed.ok, false);
    assert.equal(parsed.code, "CURRENT_AUTHORITY_MISSING");
  });
});
