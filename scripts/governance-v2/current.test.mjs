import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { validateLiveCurrentState } from "./current.mjs";
import { loadLiveAuthorities, parseGov2Block } from "./load-authorities.mjs";
import { validateCurrentState } from "./invariants.mjs";
import { validateTransition } from "./transition.mjs";
import { TRANCHE_STATUS } from "./model.mjs";
import { loadFixture, structuredState } from "./load-fixture.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("GOV-2 live authorities", () => {
  it("validates live ROADMAP/STATE/plan blocks and keeps T8 NOT_STARTED", () => {
    const report = validateLiveCurrentState(root);
    assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
    assert.equal(report.GOV2_VALIDATION_AUTHORITATIVE, "YES");
    assert.equal(report.GOV2_CUTOVER, "NO");
    assert.equal(report.REAL_T8_STARTED, "NO");
    assert.equal(report.T8_STATUS, "NOT_STARTED");
    assert.equal(report.DERIVED_NEXT_GATE, "T8");
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

  it("simulates T7 to T8 PASS on a copy without changing live T8", () => {
    const loaded = loadLiveAuthorities(root);
    assert.equal(loaded.ok, true, JSON.stringify(loaded.findings, null, 2));
    const head = structuredState(loaded.state);
    head.implementation.trancheStatuses.T8 = TRANCHE_STATUS.PASS;
    const simulated = loadFixture(root, "imp036j-t8-pass-simulated.json");
    assert.equal(simulated.REAL_T8_STARTED, false);
    const result = validateTransition(loaded.state, head, loaded.plan, loaded.roadmap);
    assert.equal(result.ok, true, JSON.stringify(result.findings, null, 2));
    assert.equal(loaded.state.implementation.trancheStatuses.T8, "NOT_STARTED");
    assert.equal(validateLiveCurrentState(root).REAL_T8_STARTED, "NO");
  });

  it("does not require checkpoint-specific validator source for an ordinary PASS copy", () => {
    const loaded = loadLiveAuthorities(root);
    const current = validateCurrentState(loaded.state, loaded.plan, loaded.roadmap);
    assert.equal(current.ok, true, JSON.stringify(current.findings, null, 2));
    const engine = readFileSync(path.join(root, "scripts/governance-v2/invariants.mjs"), "utf8");
    assert.doesNotMatch(engine, /GTM-R189/);
    assert.doesNotMatch(engine, /T7_PASS/);
  });
});
