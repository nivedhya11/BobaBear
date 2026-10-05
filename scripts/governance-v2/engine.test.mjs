import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { deriveNextGate, validateTranchePlan, validateTrancheStatuses } from "./tranche-graph.mjs";
import { validateCurrentState } from "./invariants.mjs";
import { validateTransition, tranchePlanTransitionFindings, acceptedIdentityTransitionFindings, normalizePlanGraph } from "./transition.mjs";
import { loadFixture, structuredState } from "./load-fixture.mjs";
import { FOUNDER_UAT, TRANCHE_STATUS } from "./model.mjs";
import { validateRoadmapSchema, validateRoadmapStateAlignment } from "./schema.mjs";

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

  it("rejects T8 PASS that keeps stale T7 lastTransition evidence", () => {
    const base = postT7();
    const head = structuredState(base);
    head.implementation.trancheStatuses.T8 = TRANCHE_STATUS.PASS;
    const result = validateTransition(base, head, plan036j(), roadmap());
    assert.equal(result.ok, false);
    assert.ok(codes(result).includes("LAST_TRANSITION_TRANCHE_MISMATCH"));
  });

  it("rejects rewriting accepted ledger identity or relaxing a required tranche", () => {
    const base = postT7();
    const renamed = structuredState(roadmap());
    renamed.capabilities = renamed.capabilities.map((capability) =>
      capability.id === "IMP-036I" ? { ...capability, id: "IMP-999" } : capability,
    );
    const renamedResult = validateTransition(base, base, plan036j(), renamed, plan036j(), roadmap());
    assert.equal(renamedResult.ok, false);
    assert.ok(codes(renamedResult).includes("ACCEPTED_CAPABILITY_REMOVED"), JSON.stringify(renamedResult.findings));

    const relaxed = structuredState(plan036j());
    relaxed.tranches = relaxed.tranches.map((tranche) =>
      tranche.id === "T8" ? { ...tranche, required: false } : tranche,
    );
    const relaxedResult = validateTransition(base, base, relaxed, roadmap(), plan036j(), roadmap());
    assert.equal(relaxedResult.ok, false);
    assert.ok(codes(relaxedResult).includes("REQUIRED_TRANCHE_RELAXED"), JSON.stringify(relaxedResult.findings));
  });

  it("does not treat a slice-changing tranche plan as removal of the previous graph", () => {
    const previous = plan036j();
    const next = structuredState(previous);
    next.slice = "IMP-050";
    next.tranches = [{ id: "K1", order: 1, required: true, dependencies: [] }];
    assert.equal(tranchePlanTransitionFindings(previous, next).some((item) => item.code === "TRANCHE_REMOVED"), false);
    assert.ok(tranchePlanTransitionFindings(previous, next).some((item) => item.code === "SLICE_CHANGE_WITHOUT_ACCEPTANCE"));
    const readyBase = structuredState(postT7());
    readyBase.implementation.complete = true;
    readyBase.implementation.trancheStatuses.T8 = TRANCHE_STATUS.PASS;
    readyBase.founderUat = FOUNDER_UAT.PASS;
    readyBase.lifecyclePhase = "IMPLEMENTATION_COMPLETE";
    readyBase.lastTransition = {
      type: "TRANCHE_PASS",
      tranche: "T8",
      sourcePr: 1,
      mergeCommit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    };
    const accepted = tranchePlanTransitionFindings(previous, next, {
      baseState: readyBase,
      headState: { acceptedThrough: previous.slice },
      headRoadmap: { acceptedThrough: previous.slice, capabilities: [{ id: previous.slice, accepted: true }] },
    });
    assert.equal(
      accepted.some((item) => item.code === "SLICE_CHANGE_WITHOUT_ACCEPTANCE"),
      false,
      JSON.stringify(accepted),
    );
    assert.equal(
      accepted.some((item) => item.code === "SLICE_CHANGE_BEFORE_ACCEPTANCE_PREREQUISITES"),
      false,
      JSON.stringify(accepted),
    );
    const sameSlice = structuredState(previous);
    sameSlice.tranches = sameSlice.tranches.filter((tranche) => tranche.id !== "T8");
    assert.ok(tranchePlanTransitionFindings(previous, sameSlice).some((item) => item.code === "TRANCHE_REMOVED"));
    const added = structuredState(previous);
    added.tranches = [...added.tranches, { id: "T9", order: 9, required: true, dependencies: ["T8"] }];
    assert.ok(tranchePlanTransitionFindings(previous, added).some((item) => item.code === "TRANCHE_ADDED"));
    const nextState = structuredState(postT7());
    nextState.currentSlice = next.slice;
    nextState.acceptedThrough = previous.slice;
    nextState.implementation.trancheStatuses = { K1: TRANCHE_STATUS.NOT_STARTED };
    delete nextState.lastTransition;
    const nextRoadmap = structuredState(roadmap());
    nextRoadmap.currentSlice = next.slice;
    nextRoadmap.acceptedThrough = previous.slice;
    nextRoadmap.capabilities = nextRoadmap.capabilities.map((capability) =>
      capability.id === previous.slice
        ? { ...capability, accepted: true, implementationComplete: true }
        : capability,
    );
    const premature = validateTransition(postT7(), nextState, next, nextRoadmap, previous, roadmap());
    assert.ok(
      codes(premature).includes("SLICE_CHANGE_BEFORE_ACCEPTANCE_PREREQUISITES"),
      JSON.stringify(premature.findings),
    );
    assert.equal(premature.findings.some((item) => item.code === "INVALID_LAST_TRANSITION"), false);
  });

  it("rejects deleting lastTransition evidence without a new tranche PASS", () => {
    const base = postT7();
    const head = structuredState(base);
    head.lastTransition = { type: "TRANCHE_PASS", tranche: "T7" };
    const result = validateTransition(base, head, plan036j(), roadmap());
    assert.equal(result.ok, false);
    assert.ok(codes(result).includes("INVALID_LAST_TRANSITION"));
  });

  it("rejects removing lastTransition while passed tranches remain", () => {
    const head = structuredState(postT7());
    delete head.lastTransition;
    const current = validateCurrentState(head, plan036j(), roadmap());
    assert.equal(current.ok, false);
    assert.ok(codes(current).includes("INVALID_LAST_TRANSITION"));
    const transition = validateTransition(postT7(), head, plan036j(), roadmap());
    assert.equal(transition.ok, false);
    assert.ok(codes(transition).includes("INVALID_LAST_TRANSITION"));
  });

  it("rejects rewriting lastTransition without a new tranche PASS", () => {
    const base = postT7();
    const rewritten = structuredState(base);
    rewritten.lastTransition = { ...base.lastTransition, sourcePr: 2 };
    const result = validateTransition(base, rewritten, plan036j(), roadmap());
    assert.equal(result.ok, false);
    assert.ok(codes(result).includes("INVALID_LAST_TRANSITION"));
  });

  it("rejects swapping accepted ledger order", () => {
    const swapped = structuredState(roadmap());
    const first = swapped.capabilities.find((capability) => capability.accepted === true);
    const second = swapped.capabilities.find((capability) => capability.accepted === true && capability.id !== first.id);
    if (first && second) {
      const originalFirstSeq = first.sequence;
      first.sequence = second.sequence;
      second.sequence = originalFirstSeq;
      const [firstId, secondId] = [first.id, second.id];
      first.id = secondId;
      second.id = firstId;
      const findings = acceptedIdentityTransitionFindings([firstId, secondId], swapped);
      assert.ok(findings.some((item) => item.code === "ACCEPTED_SEQUENCE_CHANGED"), JSON.stringify(findings));
    }
  });

  it("rejects malformed lastTransition evidence when a tranche newly PASSes", () => {
    const base = postT7();
    const cases = [
      { sourcePr: 0, mergeCommit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
      { sourcePr: -1, mergeCommit: null },
      { sourcePr: 1.5, mergeCommit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
      { sourcePr: "357", mergeCommit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
      { sourcePr: null, mergeCommit: null },
      { sourcePr: 1, mergeCommit: "NOTASHA" },
    ];
    for (const evidence of cases) {
      const head = structuredState(base);
      head.implementation.trancheStatuses.T8 = TRANCHE_STATUS.PASS;
      head.lastTransition = { type: "TRANCHE_PASS", tranche: "T8", ...evidence };
      const result = validateTransition(base, head, plan036j(), roadmap());
      assert.equal(result.ok, false, JSON.stringify({ evidence, findings: result.findings }));
      assert.ok(codes(result).includes("INVALID_LAST_TRANSITION"), JSON.stringify(result.findings));
    }
  });

  it("rejects accepted-history gaps and acceptance beyond acceptedThrough", () => {
    const gap = structuredState(roadmap());
    gap.capabilities = gap.capabilities.map((capability) =>
      capability.id === "IMP-036I" ? { ...capability, accepted: false } : capability,
    );
    const gapResult = validateCurrentState(postT7(), plan036j(), gap);
    assert.equal(gapResult.ok, false);
    assert.ok(codes(gapResult).includes("ACCEPTED_PREFIX_GAP"));

    const beyond = structuredState(roadmap());
    beyond.capabilities = beyond.capabilities.map((capability) =>
      capability.id === "IMP-036K" ? { ...capability, accepted: true, implementationComplete: true } : capability,
    );
    const beyondResult = validateCurrentState(postT7(), plan036j(), beyond);
    assert.equal(beyondResult.ok, false);
    assert.ok(codes(beyondResult).includes("ACCEPTED_BEYOND_BOUNDARY"));

    const incomplete = structuredState(roadmap());
    incomplete.capabilities = incomplete.capabilities.map((capability) =>
      capability.id === "IMP-036I" ? { ...capability, implementationComplete: false } : capability,
    );
    const incompleteResult = validateCurrentState(postT7(), plan036j(), incomplete);
    assert.equal(incompleteResult.ok, false);
    assert.ok(codes(incompleteResult).includes("ACCEPTED_INCOMPLETE"));
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
    const futureRoadmap = structuredState(roadmap());
    futureRoadmap.currentSlice = parallel.currentSlice;
    futureRoadmap.nextSlice = parallel.nextSlice;
    const current = validateCurrentState(parallel, plan, futureRoadmap);
    assert.equal(current.ok, true, JSON.stringify(current.findings, null, 2));
    assert.equal(current.nextGate, "WORKFLOW");

    const validHead = structuredState(parallel);
    validHead.implementation.trancheStatuses.WORKFLOW = TRANCHE_STATUS.PASS;
    validHead.lastTransition = {
      type: "TRANCHE_PASS",
      tranche: "WORKFLOW",
      sourcePr: 1,
      mergeCommit: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    };
    const allowed = validateTransition(parallel, validHead, plan, futureRoadmap);
    assert.equal(allowed.ok, true, JSON.stringify(allowed.findings, null, 2));

    const blocked = structuredState(parallel);
    blocked.implementation.trancheStatuses.FOUNDATION = TRANCHE_STATUS.NOT_STARTED;
    blocked.implementation.trancheStatuses.WORKFLOW = TRANCHE_STATUS.PASS;
    const fromNotStarted = structuredState(parallel);
    fromNotStarted.implementation.trancheStatuses.FOUNDATION = TRANCHE_STATUS.NOT_STARTED;
    fromNotStarted.implementation.trancheStatuses.MEASUREMENT = TRANCHE_STATUS.NOT_STARTED;
    const depFail = validateTransition(fromNotStarted, blocked, plan, futureRoadmap);
    assert.ok(codes(depFail).includes("DEPENDENCY_NOT_SATISFIED"));

    const regressionHead = structuredState(parallel);
    regressionHead.implementation.trancheStatuses.MEASUREMENT = TRANCHE_STATUS.NOT_STARTED;
    const regression = validateTransition(parallel, regressionHead, plan, futureRoadmap);
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

    const uatMissing = structuredState(postT7());
    uatMissing.implementation.trancheStatuses.T8 = TRANCHE_STATUS.PASS;
    uatMissing.implementation.complete = true;
    uatMissing.accepted = true;
    uatMissing.lifecyclePhase = "COMPLETE_AND_ACCEPTED";
    const uatMissingResult = validateCurrentState(uatMissing, plan036j(), roadmap());
    assert.ok(codes(uatMissingResult).includes("ACCEPTED_WITHOUT_UAT"));

    const ledgerMismatch = structuredState(uatMissing);
    ledgerMismatch.founderUat = FOUNDER_UAT.PASS;
    const ledgerResult = validateCurrentState(ledgerMismatch, plan036j(), roadmap());
    assert.ok(codes(ledgerResult).includes("STATE_ACCEPTED_ROADMAP_MISMATCH"));
    assert.ok(codes(ledgerResult).includes("ACCEPTED_THROUGH_SLICE_MISMATCH"));
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

  it("rejects core state schema corruption with generic codes", () => {
    const missingPhase = structuredState(postT7());
    delete missingPhase.lifecyclePhase;
    assert.ok(codes(validateCurrentState(missingPhase, plan036j(), roadmap())).includes("MISSING_LIFECYCLE_PHASE"));

    const invalidPhase = structuredState(postT7());
    invalidPhase.lifecyclePhase = "BROKEN";
    assert.ok(codes(validateCurrentState(invalidPhase, plan036j(), roadmap())).includes("INVALID_LIFECYCLE_PHASE"));

    const missingAuthorized = structuredState(postT7());
    delete missingAuthorized.implementation.authorized;
    assert.ok(codes(validateCurrentState(missingAuthorized, plan036j(), roadmap())).includes("MISSING_IMPLEMENTATION_AUTHORIZED"));

    const stringAuthorized = structuredState(postT7());
    stringAuthorized.implementation.authorized = "true";
    assert.ok(codes(validateCurrentState(stringAuthorized, plan036j(), roadmap())).includes("INVALID_IMPLEMENTATION_AUTHORIZED"));

    const stringComplete = structuredState(postT7());
    stringComplete.implementation.complete = "false";
    assert.ok(codes(validateCurrentState(stringComplete, plan036j(), roadmap())).includes("INVALID_IMPLEMENTATION_COMPLETE"));

    const missingUat = structuredState(postT7());
    delete missingUat.founderUat;
    assert.ok(codes(validateCurrentState(missingUat, plan036j(), roadmap())).includes("MISSING_FOUNDER_UAT"));

    const invalidUat = structuredState(postT7());
    invalidUat.founderUat = "BANANA";
    assert.ok(codes(validateCurrentState(invalidUat, plan036j(), roadmap())).includes("INVALID_FOUNDER_UAT"));

    const stringAccepted = structuredState(postT7());
    stringAccepted.accepted = "yes";
    assert.ok(codes(validateCurrentState(stringAccepted, plan036j(), roadmap())).includes("INVALID_ACCEPTED"));

    const sliceMismatch = structuredState(postT7());
    sliceMismatch.slice = "IMP-050";
    sliceMismatch.currentSlice = "IMP-036J";
    assert.ok(codes(validateCurrentState(sliceMismatch, plan036j(), roadmap())).includes("SLICE_CURRENT_SLICE_MISMATCH"));
  });

  it("rejects plan/state slice mismatch even when tranche ids match", () => {
    const mismatchedPlan = structuredState(plan036j());
    mismatchedPlan.slice = "IMP-050";
    const result = validateCurrentState(postT7(), mismatchedPlan, roadmap());
    assert.equal(result.ok, false);
    assert.ok(codes(result).includes("TRANCHE_PLAN_SLICE_MISMATCH"));
  });

  it("rejects duplicate roadmap capability ids and sequences without Map overwrite", () => {
    const duplicateId = structuredState(roadmap());
    duplicateId.capabilities.push({
      id: "IMP-036I",
      sequence: 99,
      accepted: false,
      implementationComplete: false,
    });
    const idResult = validateCurrentState(postT7(), plan036j(), duplicateId);
    assert.equal(idResult.ok, false);
    assert.ok(codes(idResult).includes("DUPLICATE_CAPABILITY_ID"));

    const duplicateSequence = structuredState(roadmap());
    duplicateSequence.capabilities.push({
      id: "IMP-099",
      sequence: 1,
      accepted: false,
      implementationComplete: false,
    });
    const sequenceResult = validateCurrentState(postT7(), plan036j(), duplicateSequence);
    assert.equal(sequenceResult.ok, false);
    assert.ok(codes(sequenceResult).includes("DUPLICATE_CAPABILITY_SEQUENCE"));

    const swapped = structuredState(roadmap());
    const first = swapped.capabilities[0];
    const second = swapped.capabilities[1];
    swapped.capabilities[0] = { ...first, sequence: second.sequence };
    swapped.capabilities[1] = { ...second, sequence: first.sequence };
    const swapResult = validateCurrentState(postT7(), plan036j(), swapped);
    assert.equal(swapResult.ok, false);
    assert.ok(codes(swapResult).includes("INVALID_CAPABILITY_SEQUENCE_ORDER"));
  });

  it("rejects duplicate declared tranche order instead of lexical fallback", () => {
    const duplicateOrder = validateTranchePlan({
      slice: "IMP-036J",
      tranches: [
        { id: "A", order: 2, required: true, dependencies: [] },
        { id: "B", order: 2, required: true, dependencies: [] },
      ],
    });
    assert.equal(duplicateOrder.ok, false);
    assert.ok(codes(duplicateOrder).includes("DUPLICATE_TRANCHE_ORDER"));

    const duplicateDep = validateTranchePlan({
      slice: "IMP-036J",
      tranches: [
        { id: "A", order: 1, required: true, dependencies: [] },
        { id: "B", order: 2, required: true, dependencies: ["A", "A"] },
      ],
    });
    assert.ok(codes(duplicateDep).includes("DUPLICATE_DEPENDENCY"));
  });

  it("rejects ROADMAP and STATE pointer mismatches even when both ids are valid", () => {
    const acceptedMismatch = structuredState(postT7());
    acceptedMismatch.acceptedThrough = "IMP-050";
    const acceptedResult = validateCurrentState(acceptedMismatch, plan036j(), roadmap());
    assert.equal(acceptedResult.ok, false);
    assert.ok(codes(acceptedResult).includes("ROADMAP_STATE_ACCEPTED_THROUGH_MISMATCH"));
    assert.equal(validateRoadmapStateAlignment(roadmap(), acceptedMismatch).ok, false);

    const currentMismatch = structuredState(postT7());
    currentMismatch.currentSlice = "IMP-050";
    currentMismatch.slice = "IMP-050";
    const currentPlan = structuredState(plan036j());
    currentPlan.slice = "IMP-050";
    const currentResult = validateCurrentState(currentMismatch, currentPlan, roadmap());
    assert.equal(currentResult.ok, false);
    assert.ok(codes(currentResult).includes("ROADMAP_STATE_CURRENT_SLICE_MISMATCH"));

    const nextMismatch = structuredState(postT7());
    nextMismatch.nextSlice = "IMP-050";
    const nextResult = validateCurrentState(nextMismatch, plan036j(), roadmap());
    assert.equal(nextResult.ok, false);
    assert.ok(codes(nextResult).includes("ROADMAP_STATE_NEXT_SLICE_MISMATCH"));
  });

  it("requires ROADMAP gtmBoundary to be a declared capability", () => {
    const missing = structuredState(roadmap());
    delete missing.gtmBoundary;
    assert.ok(codes(validateRoadmapSchema(missing)).includes("INVALID_GTM_BOUNDARY"));

    const unknown = structuredState(roadmap());
    unknown.gtmBoundary = "IMP-UNDECLARED";
    assert.ok(codes(validateRoadmapSchema(unknown)).includes("UNKNOWN_GTM_BOUNDARY"));

    const known = validateRoadmapSchema(roadmap());
    assert.equal(known.ok, true, JSON.stringify(known.findings, null, 2));
    assert.equal(typeof roadmap().gtmBoundary, "string");
    assert.ok(roadmap().capabilities.some((capability) => capability.id === roadmap().gtmBoundary));
  });

  it("rejects contradictory lifecyclePhase, accepted, and complete combinations", () => {
    const acceptedPhase = structuredState(postT7());
    acceptedPhase.lifecyclePhase = "COMPLETE_AND_ACCEPTED";
    acceptedPhase.accepted = false;
    acceptedPhase.implementation.complete = false;
    assert.ok(
      codes(validateCurrentState(acceptedPhase, plan036j(), roadmap())).includes(
        "COMPLETE_AND_ACCEPTED_PHASE_CONTRADICTION",
      ),
    );

    const acceptedInProgress = structuredState(postT7());
    acceptedInProgress.accepted = true;
    acceptedInProgress.lifecyclePhase = "IMPLEMENTATION_IN_PROGRESS";
    assert.ok(
      codes(validateCurrentState(acceptedInProgress, plan036j(), roadmap())).includes("ACCEPTED_PHASE_CONTRADICTION"),
    );

    const completeInProgress = structuredState(postT7());
    completeInProgress.implementation.complete = true;
    completeInProgress.accepted = false;
    completeInProgress.lifecyclePhase = "IMPLEMENTATION_IN_PROGRESS";
    assert.ok(
      codes(validateCurrentState(completeInProgress, plan036j(), roadmap())).includes("COMPLETE_PHASE_CONTRADICTION"),
    );

    const earlyPhase = structuredState(postT7());
    earlyPhase.lifecyclePhase = "PRODUCT_DEFINITION";
    earlyPhase.implementation.complete = false;
    assert.equal(earlyPhase.implementation.trancheStatuses.T1, TRANCHE_STATUS.PASS);
    assert.ok(codes(validateCurrentState(earlyPhase, plan036j(), roadmap())).includes("PASS_TRANCHE_EARLY_PHASE"));
  });

  it("keeps the post-T7 fixture in IMPLEMENTATION_IN_PROGRESS", () => {
    const current = postT7();
    const result = validateCurrentState(current, plan036j(), roadmap());
    assert.equal(result.ok, true, JSON.stringify(result.findings, null, 2));
    assert.equal(current.lifecyclePhase, "IMPLEMENTATION_IN_PROGRESS");
    assert.equal(current.implementation.authorized, true);
    assert.equal(current.implementation.complete, false);
    assert.equal(current.implementation.trancheStatuses.T8, TRANCHE_STATUS.NOT_STARTED);
    for (const id of ["T1", "T2", "T3", "T4", "T5", "T6", "T7"]) {
      assert.equal(current.implementation.trancheStatuses[id], TRANCHE_STATUS.PASS);
    }
  });

  it("fails closed on malformed tranche dependencies without throwing", () => {
    const objectDep = validateTranchePlan({
      slice: "IMP-036J",
      tranches: [{ id: "A", order: 1, required: true, dependencies: [{ id: "B" }] }],
    });
    assert.equal(objectDep.ok, false);
    assert.ok(codes(objectDep).includes("INVALID_DEPENDENCY"));

    const numberDep = validateTranchePlan({
      slice: "IMP-036J",
      tranches: [{ id: "A", order: 1, required: true, dependencies: 12 }],
    });
    assert.equal(numberDep.ok, false);
    assert.ok(codes(numberDep).includes("INVALID_DEPENDENCIES"));

    const nested = validateTranchePlan({
      slice: "IMP-036J",
      tranches: [{ id: "A", order: 1, required: true, dependencies: [["B"]] }],
    });
    assert.equal(nested.ok, false);
    assert.ok(codes(nested).includes("INVALID_DEPENDENCY"));

    const current = validateCurrentState(
      postT7(),
      {
        slice: "IMP-036J",
        tranches: [{ id: "T1", order: 1, required: true, dependencies: { T0: true } }],
      },
      roadmap(),
    );
    assert.equal(current.ok, false);
    assert.ok(codes(current).includes("INVALID_DEPENDENCIES"));
    assert.equal(typeof current.findings[0].code, "string");
  });

  it("fails closed on malformed transition and current-state inputs without throwing", () => {
    const nullTransition = validateTransition(null, postT7(), plan036j(), roadmap());
    assert.equal(nullTransition.ok, false);
    assert.ok(codes(nullTransition).includes("INVALID_STATE"));

    const arrayState = validateTransition(postT7(), [], plan036j(), roadmap());
    assert.equal(arrayState.ok, false);
    assert.ok(codes(arrayState).includes("INVALID_STATE"));

    const missingPlan = validateTransition(postT7(), postT7(), undefined, roadmap());
    assert.equal(missingPlan.ok, false);
    assert.ok(codes(missingPlan).includes("EMPTY_TRANCHE_PLAN"));

    const nullCurrent = validateCurrentState(null, plan036j(), roadmap());
    assert.equal(nullCurrent.ok, false);
    assert.ok(codes(nullCurrent).includes("INVALID_STATE"));

    const stringRoadmap = validateCurrentState(postT7(), plan036j(), "ROADMAP");
    assert.equal(stringRoadmap.ok, false);
    assert.ok(codes(stringRoadmap).includes("INVALID_ROADMAP"));

    const brokenHead = structuredState(postT7());
    brokenHead.implementation = null;
    const result = validateTransition(postT7(), brokenHead, plan036j(), roadmap());
    assert.equal(result.ok, false);
    assert.ok(result.findings.some((item) => typeof item.code === "string"));
  });

  it("rejects unknown architecture and decision references generically", () => {
    const unknownArch = structuredState(postT7());
    unknownArch.currentReferences.architecture = ["ARCH-UNKNOWN"];
    assert.ok(codes(validateCurrentState(unknownArch, plan036j(), roadmap())).includes("UNKNOWN_ARCHITECTURE_REFERENCE"));

    const unknownDecision = structuredState(postT7());
    unknownDecision.currentReferences.decisions = ["D-UNKNOWN"];
    assert.ok(codes(validateCurrentState(unknownDecision, plan036j(), roadmap())).includes("UNKNOWN_DECISION_REFERENCE"));
  });

  it("validates synthetic references without encoding specific live ids", () => {
    const syntheticRoadmap = structuredState(roadmap());
    syntheticRoadmap.referenceIndex = {
      architectures: ["ARCH-ZZZ"],
      decisions: ["D-ZZZ"],
    };
    const syntheticState = structuredState(postT7());
    syntheticState.currentReferences = {
      architecture: ["ARCH-ZZZ"],
      decisions: ["D-ZZZ"],
    };
    const result = validateCurrentState(syntheticState, plan036j(), syntheticRoadmap);
    assert.equal(result.ok, true, JSON.stringify(result.findings, null, 2));
  });

  it("rejects persisted execution copies inside contracts", () => {
    const state = structuredState(postT7());
    state.contracts = { ...(state.contracts ?? {}), implementationAuthorized: "YES", accepted: "NO" };
    const result = validateCurrentState(state, plan036j(), roadmap());
    assert.ok(codes(result).includes("CONTRACT_EXECUTION_DUPLICATION"), JSON.stringify(result.findings, null, 2));
  });

  it("rejects manufactured slice replacement before base acceptance prerequisites exist", () => {
    const previous = plan036j();
    const next = structuredState(previous);
    next.slice = "IMP-050";
    next.tranches = [{ id: "K1", order: 1, required: true, dependencies: [] }];
    const headState = structuredState(postT7());
    headState.slice = next.slice;
    headState.currentSlice = next.slice;
    headState.acceptedThrough = previous.slice;
    headState.implementation.trancheStatuses = { K1: TRANCHE_STATUS.NOT_STARTED };
    delete headState.lastTransition;
    const headRoadmap = structuredState(roadmap());
    headRoadmap.currentSlice = next.slice;
    headRoadmap.acceptedThrough = previous.slice;
    headRoadmap.capabilities = headRoadmap.capabilities.map((capability) =>
      capability.id === previous.slice ? { ...capability, accepted: true, implementationComplete: true } : capability,
    );
    const result = validateTransition(postT7(), headState, next, headRoadmap, previous, roadmap());
    assert.equal(result.ok, false);
    assert.ok(codes(result).includes("SLICE_CHANGE_BEFORE_ACCEPTANCE_PREREQUISITES"), JSON.stringify(result.findings));
  });

  it("allows atomic accepted slice advancement when base already has acceptance prerequisites", () => {
    const previous = plan036j();
    const next = loadFixture(root, "imp050-tranche-plan.json");
    const base = structuredState(postT7());
    base.implementation.complete = true;
    base.implementation.trancheStatuses.T8 = TRANCHE_STATUS.PASS;
    base.founderUat = FOUNDER_UAT.PASS;
    base.lifecyclePhase = "IMPLEMENTATION_COMPLETE";
    base.lastTransition = {
      type: "TRANCHE_PASS",
      tranche: "T8",
      sourcePr: 1,
      mergeCommit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    };
    const head = structuredState(base);
    head.slice = next.slice;
    head.currentSlice = next.slice;
    head.nextSlice = "NONE";
    head.acceptedThrough = previous.slice;
    head.accepted = false;
    head.founderUat = FOUNDER_UAT.NOT_PERFORMED;
    head.lifecyclePhase = "NOT_STARTED";
    head.implementation = {
      authorized: false,
      complete: false,
      trancheStatuses: {
        FOUNDATION: TRANCHE_STATUS.NOT_STARTED,
        WORKFLOW: TRANCHE_STATUS.NOT_STARTED,
        MEASUREMENT: TRANCHE_STATUS.NOT_STARTED,
      },
    };
    delete head.lastTransition;
    const headRoadmap = structuredState(roadmap());
    headRoadmap.currentSlice = next.slice;
    headRoadmap.nextSlice = "NONE";
    headRoadmap.acceptedThrough = previous.slice;
    headRoadmap.capabilities = headRoadmap.capabilities.map((capability) =>
      capability.id === previous.slice ? { ...capability, accepted: true, implementationComplete: true } : capability,
    );
    const result = validateTransition(base, head, next, headRoadmap, previous, roadmap());
    assert.equal(result.ok, true, JSON.stringify(result.findings, null, 2));
  });

  it("treats optional missing to PASS as a newly passed tranche that requires transition evidence", () => {
    const plan = structuredState(plan036j());
    plan.tranches = [
      ...plan.tranches,
      { id: "OPTIONAL", order: 9, required: false, dependencies: ["T7"] },
    ];
    const base = structuredState(postT7());
    const stale = structuredState(base);
    stale.implementation.trancheStatuses.OPTIONAL = TRANCHE_STATUS.PASS;
    const staleResult = validateTransition(base, stale, plan, roadmap(), plan, roadmap());
    assert.equal(staleResult.ok, false);
    assert.ok(codes(staleResult).includes("LAST_TRANSITION_TRANCHE_MISMATCH"), JSON.stringify(staleResult.findings));

    const evidenced = structuredState(base);
    evidenced.implementation.trancheStatuses.OPTIONAL = TRANCHE_STATUS.PASS;
    evidenced.lastTransition = {
      type: "TRANCHE_PASS",
      tranche: "OPTIONAL",
      sourcePr: 1,
      mergeCommit: "dddddddddddddddddddddddddddddddddddddddd",
    };
    const passResult = validateTransition(base, evidenced, plan, roadmap(), plan, roadmap());
    assert.equal(passResult.ok, true, JSON.stringify(passResult.findings, null, 2));
  });

  it("rejects same-slice plan graph mutations including tightening and dependency edits", () => {
    const previous = plan036j();
    const optionalPlan = structuredState(previous);
    optionalPlan.tranches = optionalPlan.tranches.map((tranche) =>
      tranche.id === "T8" ? { ...tranche, required: false } : tranche,
    );
    const tightened = structuredState(optionalPlan);
    tightened.tranches = tightened.tranches.map((tranche) =>
      tranche.id === "T8" ? { ...tranche, required: true } : tranche,
    );
    assert.ok(tranchePlanTransitionFindings(optionalPlan, tightened).some((item) => item.code === "OPTIONAL_TRANCHE_TIGHTENED"));

    const added = structuredState(previous);
    added.tranches = added.tranches.map((tranche) =>
      tranche.id === "T2" ? { ...tranche, dependencies: ["T1", "T3"] } : tranche,
    );
    assert.ok(tranchePlanTransitionFindings(previous, added).some((item) => item.code === "TRANCHE_DEPENDENCY_ADDED"));

    const removed = structuredState(previous);
    removed.tranches = removed.tranches.map((tranche) =>
      tranche.id === "T2" ? { ...tranche, dependencies: [] } : tranche,
    );
    assert.ok(tranchePlanTransitionFindings(previous, removed).some((item) => item.code === "TRANCHE_DEPENDENCY_REMOVED"));

    const reorderedDeps = structuredState(previous);
    reorderedDeps.tranches = reorderedDeps.tranches.map((tranche) =>
      tranche.id === "T4" ? { ...tranche, dependencies: ["T3", "T2", "T1"] } : tranche,
    );
    assert.equal(tranchePlanTransitionFindings(previous, reorderedDeps).length, 0);
    assert.deepEqual(normalizePlanGraph(previous), normalizePlanGraph(reorderedDeps));
  });
});

describe("GOV-2 source hygiene", () => {
  it("keeps generic modules free of checkpoint and capability special cases", () => {
    const files = ["model.mjs", "schema.mjs", "tranche-graph.mjs", "invariants.mjs", "transition.mjs", "bootstrap-execution.mjs"];
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
