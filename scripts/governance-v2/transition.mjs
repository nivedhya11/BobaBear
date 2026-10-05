/**
 * Generic base → head lifecycle transition rules.
 */
import {
  LAST_TRANSITION_TYPE,
  TRANCHE_STATUS,
  TRANCHE_STATUS_SET,
  aggregate,
  finding,
  isPositiveSourcePr,
  isValidMergeCommit,
} from "./model.mjs";
import { validateCurrentState } from "./invariants.mjs";
import { dependenciesSatisfied, deriveNextGate, allRequiredTranchesPass, trancheList } from "./tranche-graph.mjs";

/**
 * @param {object} baseState
 * @param {object} headState
 * @param {object} tranchePlan
 * @param {object} roadmap
 * @param {object} [basePlan]
 * @param {object} [baseRoadmap]
 */
export function validateTransition(baseState, headState, tranchePlan, roadmap, basePlan = tranchePlan, baseRoadmap = roadmap) {
  const shapeFindings = [];
  if (baseState == null || typeof baseState !== "object" || Array.isArray(baseState)) {
    shapeFindings.push(finding("INVALID_STATE", "base", "base state must be an object"));
  }
  if (headState == null || typeof headState !== "object" || Array.isArray(headState)) {
    shapeFindings.push(finding("INVALID_STATE", "head", "head state must be an object"));
  }
  if (tranchePlan == null || typeof tranchePlan !== "object" || Array.isArray(tranchePlan)) {
    shapeFindings.push(finding("EMPTY_TRANCHE_PLAN", "plan", "tranche plan must be an object"));
  }
  if (roadmap == null || typeof roadmap !== "object" || Array.isArray(roadmap)) {
    shapeFindings.push(finding("INVALID_ROADMAP", "roadmap", "roadmap must be an object"));
  }
  if (shapeFindings.length > 0) {
    return {
      ...aggregate(shapeFindings),
      nextGate: "NONE",
      allRequiredTranchesPass: false,
      mutations: [],
    };
  }

  const base = validateCurrentState(baseState, basePlan, baseRoadmap);
  const head = validateCurrentState(headState, tranchePlan, roadmap);
  const findings = [...base.findings.map(prefix("base")), ...head.findings.map(prefix("head"))];

  findings.push(...roadmapLedgerTransitionFindings(baseRoadmap, roadmap));
  findings.push(...tranchePlanTransitionFindings(basePlan, tranchePlan, { headState, headRoadmap: roadmap }));
  findings.push(...sequenceRegressionFindings(baseState, headState, roadmap));
  findings.push(...trancheTransitionFindings(baseState, headState, tranchePlan, basePlan));

  const headStatuses = headState?.implementation?.trancheStatuses;
  return {
    ...aggregate(findings),
    nextGate: deriveNextGate(tranchePlan, headStatuses),
    allRequiredTranchesPass: allRequiredTranchesPass(tranchePlan, headStatuses),
    mutations: collectMutations(baseState, headState, tranchePlan),
  };
}

function prefix(scope) {
  return (item) => ({ ...item, path: `${scope}.${item.path}` });
}

function capabilityById(roadmap) {
  const capabilities = Array.isArray(roadmap?.capabilities) ? roadmap.capabilities : [];
  return new Map(
    capabilities
      .filter((capability) => capability && typeof capability === "object" && typeof capability.id === "string")
      .map((capability) => [capability.id, capability]),
  );
}

export function roadmapLedgerTransitionFindings(baseRoadmap, headRoadmap) {
  const findings = [];
  const base = capabilityById(baseRoadmap);
  const head = capabilityById(headRoadmap);
  for (const [id, capability] of base) {
    if (capability.accepted !== true) continue;
    const next = head.get(id);
    if (!next) {
      findings.push(finding("ACCEPTED_CAPABILITY_REMOVED", `capabilities.${id}`, `accepted capability ${id} cannot be removed or renamed`));
      continue;
    }
    if (next.accepted !== true) {
      findings.push(finding("ACCEPTED_HISTORY_REWRITTEN", `capabilities.${id}.accepted`, `accepted capability ${id} cannot be un-accepted`));
    }
    if (next.implementationComplete !== true) {
      findings.push(finding("ACCEPTED_INCOMPLETE", `capabilities.${id}.implementationComplete`, `accepted capability ${id} must remain implementation-complete`));
    }
    if (capability.sequence != null && next.sequence !== capability.sequence) {
      findings.push(
        finding("ACCEPTED_SEQUENCE_CHANGED", `capabilities.${id}.sequence`, `accepted capability ${id} cannot change sequence`),
      );
    }
  }
  return findings;
}

const ACCEPTED_LEDGER_ROW = /^\|\s*(IMP-\d+[A-Z]?)\s*\|[^|\n]*\|\s*COMPLETE_AND_ACCEPTED\s*\|/gm;

export function acceptedIdsFromMarkdownLedger(text) {
  return [...String(text ?? "").matchAll(ACCEPTED_LEDGER_ROW)].map((match) => match[1]);
}

export function acceptedIdentityTransitionFindings(baseIds, headRoadmap) {
  const findings = [];
  const head = capabilityById(headRoadmap);
  for (const id of baseIds) {
    const next = head.get(id);
    if (!next) {
      findings.push(finding("ACCEPTED_CAPABILITY_REMOVED", `capabilities.${id}`, `accepted capability ${id} cannot be removed or renamed`));
      continue;
    }
    if (next.accepted !== true) {
      findings.push(finding("ACCEPTED_HISTORY_REWRITTEN", `capabilities.${id}.accepted`, `accepted capability ${id} cannot be un-accepted`));
    }
    if (next.implementationComplete !== true) {
      findings.push(finding("ACCEPTED_INCOMPLETE", `capabilities.${id}.implementationComplete`, `accepted capability ${id} must remain implementation-complete`));
    }
  }
  const headAccepted = (Array.isArray(headRoadmap?.capabilities) ? headRoadmap.capabilities : [])
    .filter((capability) => capability?.accepted === true && typeof capability.id === "string")
    .slice()
    .sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0))
    .map((capability) => capability.id);
  const comparable = Math.min(baseIds.length, headAccepted.length);
  for (let index = 0; index < comparable; index += 1) {
    if (baseIds[index] !== headAccepted[index]) {
      findings.push(
        finding(
          "ACCEPTED_SEQUENCE_CHANGED",
          `capabilities.${headAccepted[index]}.sequence`,
          `accepted ledger order cannot change: expected ${baseIds[index]} at position ${index}, received ${headAccepted[index]}`,
        ),
      );
      break;
    }
  }
  return findings;
}

export function tranchePlanTransitionFindings(basePlan, headPlan, context = {}) {
  const findings = [];
  const baseSlice = typeof basePlan?.slice === "string" ? basePlan.slice : null;
  const headSlice = typeof headPlan?.slice === "string" ? headPlan.slice : null;
  if (baseSlice != null && headSlice != null && baseSlice !== headSlice) {
    const acceptedThrough = context.headState?.acceptedThrough ?? context.headRoadmap?.acceptedThrough;
    const previous = capabilityById(context.headRoadmap ?? {}).get(baseSlice);
    if (acceptedThrough !== baseSlice && previous?.accepted !== true) {
      findings.push(
        finding(
          "SLICE_CHANGE_WITHOUT_ACCEPTANCE",
          "plan.slice",
          `tranche plan slice cannot change from ${baseSlice} to ${headSlice} until ${baseSlice} is accepted`,
        ),
      );
    }
    return findings;
  }
  const base = new Map(trancheList(basePlan).filter((tranche) => tranche?.id).map((tranche) => [tranche.id, tranche]));
  const head = new Map(trancheList(headPlan).filter((tranche) => tranche?.id).map((tranche) => [tranche.id, tranche]));
  for (const [id] of head) {
    if (!base.has(id)) {
      findings.push(finding("TRANCHE_ADDED", `tranches.${id}`, `tranche ${id} cannot be added while the plan slice is unchanged`));
    }
  }
  for (const [id, tranche] of base) {
    const next = head.get(id);
    if (!next) {
      findings.push(finding("TRANCHE_REMOVED", `tranches.${id}`, `tranche ${id} cannot be removed`));
      continue;
    }
    if (tranche.required === true && next.required !== true) {
      findings.push(finding("REQUIRED_TRANCHE_RELAXED", `tranches.${id}.required`, `required tranche ${id} cannot become optional`));
    }
    if (tranche.order != null && next.order !== tranche.order) {
      findings.push(finding("TRANCHE_ORDER_CHANGED", `tranches.${id}.order`, `tranche ${id} cannot change declared order`));
    }
    const baseDeps = new Set(Array.isArray(tranche.dependencies) ? tranche.dependencies : []);
    const headDeps = new Set(Array.isArray(next.dependencies) ? next.dependencies : []);
    for (const dep of baseDeps) {
      if (!headDeps.has(dep)) {
        findings.push(
          finding("TRANCHE_DEPENDENCY_REMOVED", `tranches.${id}.dependencies`, `tranche ${id} cannot drop dependency ${dep}`),
        );
      }
    }
  }
  return findings;
}

function trancheTransitionFindings(baseState, headState, plan, basePlan = plan) {
  const findings = [];
  const baseStatuses =
    baseState?.implementation?.trancheStatuses != null &&
    typeof baseState.implementation.trancheStatuses === "object" &&
    !Array.isArray(baseState.implementation.trancheStatuses)
      ? baseState.implementation.trancheStatuses
      : {};
  const headStatuses =
    headState?.implementation?.trancheStatuses != null &&
    typeof headState.implementation.trancheStatuses === "object" &&
    !Array.isArray(headState.implementation.trancheStatuses)
      ? headState.implementation.trancheStatuses
      : {};
  const declared = new Set(trancheList(plan).map((tranche) => tranche?.id).filter(Boolean));
  const newlyPassed = [];
  const sameSlice = (basePlan?.slice ?? null) === (plan?.slice ?? null);

  if (sameSlice) {
  for (const id of declared) {
    const from = baseStatuses[id];
    const to = headStatuses[id];
    if (from === TRANCHE_STATUS.PASS && to == null) {
      findings.push(finding("TRANCHE_STATUS_REGRESSION", `implementation.trancheStatuses.${id}`, `PASS tranche ${id} cannot become missing`));
      continue;
    }
    if (from === TRANCHE_STATUS.PASS && to === TRANCHE_STATUS.NOT_STARTED) {
      findings.push(finding("TRANCHE_STATUS_REGRESSION", `implementation.trancheStatuses.${id}`, `PASS tranche ${id} cannot regress to NOT_STARTED`));
      continue;
    }
    if (from === TRANCHE_STATUS.PASS && to !== TRANCHE_STATUS.PASS) {
      if (to != null && !TRANCHE_STATUS_SET.has(to)) {
        findings.push(finding("INVALID_TRANCHE_STATUS", `implementation.trancheStatuses.${id}`, `PASS tranche ${id} cannot move to invalid ${JSON.stringify(to)}`));
      } else if (to !== TRANCHE_STATUS.PASS) {
        findings.push(finding("TRANCHE_STATUS_REGRESSION", `implementation.trancheStatuses.${id}`, `PASS tranche ${id} cannot regress`));
      }
      continue;
    }
    if (from === to) continue;
    if (from === TRANCHE_STATUS.NOT_STARTED && to === TRANCHE_STATUS.PASS) {
      if (!dependenciesSatisfied(plan, headStatuses, id)) {
        findings.push(
          finding("DEPENDENCY_NOT_SATISFIED", `implementation.trancheStatuses.${id}`, `tranche ${id} cannot PASS while a required dependency is unresolved`),
        );
      }
      newlyPassed.push(id);
      continue;
    }
    if (from != null && to != null && from !== to) {
      findings.push(
        finding("ILLEGAL_STATUS_TRANSITION", `implementation.trancheStatuses.${id}`, `illegal transition ${from} -> ${to} for tranche ${id}`),
      );
    }
  }
  }

  findings.push(...tranchePassEvidenceFindings(headState, newlyPassed));
  if (
    newlyPassed.length === 0 &&
    sameSlice &&
    lastTransitionKey(baseState?.lastTransition) !== lastTransitionKey(headState?.lastTransition)
  ) {
    findings.push(
      finding(
        "INVALID_LAST_TRANSITION",
        "lastTransition",
        "lastTransition cannot change unless a tranche newly PASSes",
      ),
    );
  }
  if (newlyPassed.length === 0 && !sameSlice && headState?.lastTransition != null) {
    findings.push(
      finding(
        "INVALID_LAST_TRANSITION",
        "lastTransition",
        "slice change may clear lastTransition but must not rewrite it",
      ),
    );
  }
  return findings;
}

function lastTransitionKey(value) {
  if (value == null) return "null";
  if (typeof value !== "object" || Array.isArray(value)) return JSON.stringify(value);
  return JSON.stringify({
    type: value.type ?? null,
    tranche: value.tranche ?? null,
    sourcePr: value.sourcePr ?? null,
    mergeCommit: value.mergeCommit ?? null,
  });
}

function tranchePassEvidenceFindings(headState, newlyPassed) {
  if (newlyPassed.length === 0) return [];
  if (newlyPassed.length > 1) {
    return [
      finding(
        "MULTIPLE_TRANCHE_PASS",
        "lastTransition",
        `ordinary PASS may advance one tranche; received ${newlyPassed.join(",")}`,
      ),
    ];
  }
  const passed = newlyPassed[0];
  const lastTransition = headState?.lastTransition;
  if (lastTransition == null || typeof lastTransition !== "object" || Array.isArray(lastTransition)) {
    return [finding("MISSING_LAST_TRANSITION", "lastTransition", `PASS of ${passed} requires lastTransition evidence`)];
  }
  const findings = [];
  if (lastTransition.type !== LAST_TRANSITION_TYPE.TRANCHE_PASS) {
    findings.push(
      finding("LAST_TRANSITION_TYPE_MISMATCH", "lastTransition.type", `PASS of ${passed} requires lastTransition.type TRANCHE_PASS`),
    );
  }
  if (lastTransition.tranche !== passed) {
    findings.push(
      finding(
        "LAST_TRANSITION_TRANCHE_MISMATCH",
        "lastTransition.tranche",
        `PASS of ${passed} cannot keep lastTransition.tranche ${JSON.stringify(lastTransition.tranche)}`,
      ),
    );
  }
  const hasValidSourcePr = isPositiveSourcePr(lastTransition.sourcePr);
  const hasValidMergeCommit = isValidMergeCommit(lastTransition.mergeCommit);
  if (!hasValidSourcePr && !hasValidMergeCommit) {
    findings.push(
      finding(
        "INVALID_LAST_TRANSITION",
        "lastTransition",
        `PASS of ${passed} requires a positive integer sourcePr or a valid mergeCommit`,
      ),
    );
  }
  return findings;
}

function sequenceRegressionFindings(baseState, headState, roadmap) {
  const findings = [];
  const capabilities = Array.isArray(roadmap?.capabilities) ? roadmap.capabilities : [];
  const sequence = new Map(
    capabilities
      .filter((capability) => capability && typeof capability === "object" && typeof capability.id === "string")
      .map((capability, index) => [capability.id, capability.sequence ?? index]),
  );
  const baseAccepted = sequence.get(baseState?.acceptedThrough);
  const headAccepted = sequence.get(headState?.acceptedThrough);
  if (Number.isInteger(baseAccepted) && Number.isInteger(headAccepted) && headAccepted < baseAccepted) {
    findings.push(
      finding("ACCEPTED_THROUGH_REGRESSION", "acceptedThrough", `acceptedThrough cannot move backwards from ${baseState.acceptedThrough} to ${headState.acceptedThrough}`),
    );
  }

  const baseCurrent = sequence.get(baseState?.currentSlice);
  const headCurrent = sequence.get(headState?.currentSlice);
  if (Number.isInteger(baseCurrent) && Number.isInteger(headCurrent) && headCurrent < baseCurrent) {
    findings.push(
      finding("SEQUENCE_REVERSED", "currentSlice", `currentSlice cannot silently reverse from ${baseState.currentSlice} to ${headState.currentSlice}`),
    );
  }

  const baseNext = sequence.get(baseState?.nextSlice);
  const headNext = sequence.get(headState?.nextSlice);
  if (Number.isInteger(baseNext) && Number.isInteger(headNext) && headNext < baseNext) {
    const held = (Array.isArray(roadmap?.holds) ? roadmap.holds : []).some(
      (hold) => hold?.capability === headState?.nextSlice,
    );
    if (!held) {
      findings.push(
        finding("SEQUENCE_REVERSED", "nextSlice", `nextSlice cannot silently reverse from ${baseState.nextSlice} to ${headState.nextSlice}`),
      );
    }
  }
  return findings;
}

function collectMutations(baseState, headState, plan) {
  const mutations = [];
  const baseStatuses =
    baseState?.implementation?.trancheStatuses != null &&
    typeof baseState.implementation.trancheStatuses === "object" &&
    !Array.isArray(baseState.implementation.trancheStatuses)
      ? baseState.implementation.trancheStatuses
      : {};
  const headStatuses =
    headState?.implementation?.trancheStatuses != null &&
    typeof headState.implementation.trancheStatuses === "object" &&
    !Array.isArray(headState.implementation.trancheStatuses)
      ? headState.implementation.trancheStatuses
      : {};
  for (const tranche of trancheList(plan)) {
    if (!tranche?.id) continue;
    const from = baseStatuses[tranche.id];
    const to = headStatuses[tranche.id];
    if (from !== to) {
      mutations.push({ path: `implementation.trancheStatuses.${tranche.id}`, from, to });
    }
  }
  return mutations;
}
