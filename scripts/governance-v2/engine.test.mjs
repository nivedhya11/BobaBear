import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { deriveNextGate, validateTranchePlan, validateTrancheStatuses } from "./tranche-graph.mjs";
import { validateCurrentState } from "./invariants.mjs";
import { validateTransition } from "./transition.mjs";
import { loadFixture, structuredState } from "./load-fixture.mjs";
import { FOUNDER_UAT, TRANCHE_STATUS } from "./model.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function roadmap() {
  return loadFixture(root, "roadmap.json");
}

function plan036j() {
  return loadFixture(root, "imp036j-tranche-plan.json");
}

function postT7() {
  return loadFixture(root, "imp036j-post-t7.json");
}

function codes(result) {
  return result.findings.map((item) => item.code);
}

describe("GOV-2 generic engine", () => {
  it("validates the generic roadmap and current-state models", () => {
    const result = validateCurrentState(postT7(), plan036j(), roadmap());
    assert.equal(result.ok, true, JSON.stringify(result.findings, null, 2));
    assert.equal(result.nextGate, "T8");
    assert.equal(result.derivedStarted.T7, true);
    assert.equal(result.derivedStarted.T8, false);
  });

  it("rejects duplicate ids, unknown deps, self-deps, cycles, undeclared/missing/invalid statuses", () => {
    const duplicate = validateTranchePlan({
      tranches: [
        { id: "A", order: 1, required: true, dependencies: [] },
        { id: "A", order: 2, required: true, dependencies: [] },
      ],
    });
    assert.equal(duplicate.ok, false);
    assert.ok(codes(duplicate).includes("DUPLICATE_TRANCHE_ID"));

    const unknown = validateTranchePlan({
      tranches: [{ id: "A", order: 1, required: true, dependencies: ["Z"] }],
    });
    assert.ok(codes(unknown).includes("UNKNOWN_DEPENDENCY"));

    const self = validateTranchePlan({
      tranches: [{ id: "A", order: 1, required: true, dependencies: ["A"] }],
    });
    assert.ok(codes(self).includes("SELF_DEPENDENCY"));

    const cycle = validateTranchePlan({
      tranches: [
        { id: "A", order: 1, required: true, dependencies: ["B"] },
        { id: "B", order: 2, required: true, dependencies: ["A"] },
      ],
    });
    assert.ok(codes(cycle).includes("DEPENDENCY_CYCLE"));

    const statuses = validateTrancheStatuses(plan036j(), {
      T1: TRANCHE_STATUS.PASS,
      T9: TRANCHE_STATUS.PASS,
    });
    assert.ok(codes(statuses).includes("UNDECLARED_TRANCHE_STATUS"));
    assert.ok(codes(statuses).includes("MISSING_REQUIRED_TRANCHE_STATUS"));

    const invalid = validateTrancheStatuses(plan036j(), {
      T1: "IN_PROGRESS",
      T2: TRANCHE_STATUS.NOT_STARTED,
      T3: TRANCHE_STATUS.NOT_STARTED,
      T4: TRANCHE_STATUS.NOT_STARTED,
      T5: TRANCHE_STATUS.NOT_STARTED,
      T6: TRANCHE_STATUS.NOT_STARTED,
      T7: TRANCHE_STATUS.NOT_STARTED,
      T8: TRANCHE_STATUS.NOT_STARTED,
    });
    assert.ok(codes(invalid).includes("INVALID_TRANCHE_STATUS"));
  });

  it("derives next gate from declared order, not dependency eligibility", () => {
    const parallel = loadFixture(root, "imp036j-parallel-t6-before-t5.json");
    const result = validateCurrentState(parallel, plan036j(), roadmap());
    assert.equal(result.ok, true, JSON.stringify(result.findings, null, 2));
    assert.equal(result.nextGate, "T5");
    assert.equal(deriveNextGate(plan036j(), parallel.implementation.trancheStatuses), "T5");
  });

  it("simulates T8 PASS without mutating live state", () => {
    const base = postT7();
    const head = loadFixture(root, "imp036j-t8-pass-simulated.json");
    const result = validateTransition(base, head, plan036j(), roadmap());
    assert.equal(result.ok, true, JSON.stringify(result.findings, null, 2));
    assert.equal(result.allRequiredTranchesPass, true);
    assert.equal(head.REAL_T8_STARTED, false);
    assert.equal(head.REAL_STATE_CHANGED, false);
    assert.equal(base.implementation.trancheStatuses.T8, "NOT_STARTED");
  });

  it("rejects PASS when a required dependency is unresolved", () => {
    const base = loadFixture(root, "imp036j-parallel-t6-before-t5.json");
    const head = structuredState(base);
    head.implementation.trancheStatuses.T7 = TRANCHE_STATUS.PASS;
    const result = validateTransition(base, head, plan036j(), roadmap());
    assert.equal(result.ok, false);
    assert.ok(codes(result).includes("DEPENDENCY_NOT_SATISFIED"));
  });

  it("rejects PASS regression", () => {
    const base = postT7();
    const head = structuredState(base);
    head.implementation.trancheStatuses.T6 = TRANCHE_STATUS.NOT_STARTED;
    const result = validateTransition(base, head, plan036j(), roadmap());
    assert.equal(result.ok, false);
    assert.ok(codes(result).includes("TRANCHE_STATUS_REGRESSION"));
  });

  it("rejects PASS becoming missing or invalid", () => {
    const base = postT7();
    const missing = structuredState(base);
    delete missing.implementation.trancheStatuses.T6;
    const missingResult = validateTransition(base, missing, plan036j(), roadmap());
    assert.ok(codes(missingResult).includes("TRANCHE_STATUS_REGRESSION"));

    const invalid = structuredState(base);
    invalid.implementation.trancheStatuses.T6 = "IN_PROGRESS";
    const invalidResult = validateTransition(base, invalid, plan036j(), roadmap());
    assert.ok(
      codes(invalidResult).includes("INVALID_TRANCHE_STATUS") || codes(invalidResult).includes("TRANCHE_STATUS_REGRESSION"),
    );
  });

  it("validates a future capability with the same engine", () => {
    const plan = loadFixture(root, "imp050-tranche-plan.json");
    const graph = validateTranchePlan(plan);
    assert.equal(graph.ok, true, JSON.stringify(graph.findings, null, 2));

    const parallel = loadFixture(root, "imp050-parallel-state.json");
    const current = validateCurrentState(parallel, plan, roadmap());
    assert.equal(current.ok, true, JSON.stringify(current.findings, null, 2));
    assert.equal(current.nextGate, "WORKFLOW");

    const validHead = structuredState(parallel);
    validHead.implementation.trancheStatuses.WORKFLOW = TRANCHE_STATUS.PASS;
    const allowed = validateTransition(parallel, validHead, plan, roadmap());
    assert.equal(allowed.ok, true, JSON.stringify(allowed.findings, null, 2));

    const blocked = structuredState(parallel);
    blocked.implementation.trancheStatuses.FOUNDATION = TRANCHE_STATUS.NOT_STARTED;
    blocked.implementation.trancheStatuses.WORKFLOW = TRANCHE_STATUS.PASS;
    const fromNotStarted = structuredState(parallel);
    fromNotStarted.implementation.trancheStatuses.FOUNDATION = TRANCHE_STATUS.NOT_STARTED;
    fromNotStarted.implementation.trancheStatuses.MEASUREMENT = TRANCHE_STATUS.NOT_STARTED;
    const depFail = validateTransition(fromNotStarted, blocked, plan, roadmap());
    assert.ok(codes(depFail).includes("DEPENDENCY_NOT_SATISFIED"));

    const regressionHead = structuredState(parallel);
    regressionHead.implementation.trancheStatuses.MEASUREMENT = TRANCHE_STATUS.NOT_STARTED;
    const regression = validateTransition(parallel, regressionHead, plan, roadmap());
    assert.ok(codes(regression).includes("TRANCHE_STATUS_REGRESSION"));
  });

  it("rejects acceptance, UAT, and complete invariants generically", () => {
    const accepted = structuredState(postT7());
    accepted.accepted = true;
    const acceptedResult = validateCurrentState(accepted, plan036j(), roadmap());
    assert.ok(codes(acceptedResult).includes("ACCEPTED_BEFORE_COMPLETE"));

    const uat = structuredState(postT7());
    uat.founderUat = FOUNDER_UAT.PASS;
    const uatResult = validateCurrentState(uat, plan036j(), roadmap());
    assert.ok(codes(uatResult).includes("UAT_BEFORE_COMPLETE"));

    const complete = structuredState(postT7());
    complete.implementation.complete = true;
    const completeResult = validateCurrentState(complete, plan036j(), roadmap());
    assert.ok(codes(completeResult).includes("COMPLETE_WITH_REQUIRED_TRANCHE_MISSING"));
  });

  it("does not let historical prose rescue invalid structured state", () => {
    const invalid = structuredState(postT7());
    invalid.accepted = true;
    invalid.narrative = [
      "IMP036J_ACCEPTED: NO",
      "IMP036J_IMPLEMENTATION_COMPLETE: NO",
      "IMP036J_TRANCHE_8: NOT_STARTED",
      "T8_STARTED: NO",
      "GTM-R188",
      "STATE-R186",
    ].join("\n");
    const cleaned = structuredState(invalid);
    assert.equal("narrative" in cleaned, false);
    const result = validateCurrentState(cleaned, plan036j(), roadmap());
    assert.equal(result.ok, false);
    assert.ok(codes(result).includes("ACCEPTED_BEFORE_COMPLETE"));
    assert.equal(validateCurrentState.length, 3);
  });

  it("rejects acceptedThrough regression and silent sequence reversal", () => {
    const base = postT7();
    const head = structuredState(base);
    head.acceptedThrough = "IMP-036J";
    head.currentSlice = "IMP-036I";
    const result = validateTransition(base, head, plan036j(), roadmap());
    assert.ok(codes(result).includes("ACCEPTED_THROUGH_REGRESSION") || codes(result).includes("SEQUENCE_REVERSED"));
  });
});

describe("GOV-2 source hygiene", () => {
  it("keeps generic modules free of checkpoint and capability special cases", () => {
    const files = ["model.mjs", "tranche-graph.mjs", "invariants.mjs", "transition.mjs"];
    for (const name of files) {
      const source = readFileSync(path.join(root, "scripts/governance-v2", name), "utf8");
      assert.doesNotMatch(source, /IMP-036J/);
      assert.doesNotMatch(source, /GTM-R\d+/);
      assert.doesNotMatch(source, /STATE-R\d+/);
      assert.doesNotMatch(source, /isImp036j/);
      assert.doesNotMatch(source, /\.includes\(\s*expected/);
    }
  });
});
