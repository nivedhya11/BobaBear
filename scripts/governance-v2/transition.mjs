/**
 * Generic base → head lifecycle transition rules.
 */
import { TRANCHE_STATUS, TRANCHE_STATUS_SET, aggregate, finding } from "./model.mjs";
import { validateCurrentState } from "./invariants.mjs";
import { dependenciesSatisfied, deriveNextGate, allRequiredTranchesPass } from "./tranche-graph.mjs";

/**
 * @param {object} baseState
 * @param {object} headState
 * @param {object} tranchePlan
 * @param {object} roadmap
 */
export function validateTransition(baseState, headState, tranchePlan, roadmap) {
  const base = validateCurrentState(baseState, tranchePlan, roadmap);
  const head = validateCurrentState(headState, tranchePlan, roadmap);
  const findings = [...base.findings.map(prefix("base")), ...head.findings.map(prefix("head"))];

  findings.push(...sequenceRegressionFindings(baseState, headState, roadmap));
  findings.push(...trancheTransitionFindings(baseState, headState, tranchePlan));

  return {
    ...aggregate(findings),
    nextGate: deriveNextGate(tranchePlan, headState.implementation?.trancheStatuses ?? {}),
    allRequiredTranchesPass: allRequiredTranchesPass(tranchePlan, headState.implementation?.trancheStatuses ?? {}),
    mutations: collectMutations(baseState, headState, tranchePlan),
  };
}

function prefix(scope) {
  return (item) => ({ ...item, path: `${scope}.${item.path}` });
}

function trancheTransitionFindings(baseState, headState, plan) {
  const findings = [];
  const baseStatuses = baseState.implementation?.trancheStatuses ?? {};
  const headStatuses = headState.implementation?.trancheStatuses ?? {};
  const declared = new Set(plan.tranches.map((tranche) => tranche.id));

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
      continue;
    }
    if (from != null && to != null && from !== to) {
      findings.push(
        finding("ILLEGAL_STATUS_TRANSITION", `implementation.trancheStatuses.${id}`, `illegal transition ${from} -> ${to} for tranche ${id}`),
      );
    }
  }

  return findings;
}

function sequenceRegressionFindings(baseState, headState, roadmap) {
  const findings = [];
  const sequence = new Map((roadmap.capabilities ?? []).map((capability, index) => [capability.id, capability.sequence ?? index]));
  const baseAccepted = sequence.get(baseState.acceptedThrough);
  const headAccepted = sequence.get(headState.acceptedThrough);
  if (Number.isInteger(baseAccepted) && Number.isInteger(headAccepted) && headAccepted < baseAccepted) {
    findings.push(
      finding("ACCEPTED_THROUGH_REGRESSION", "acceptedThrough", `acceptedThrough cannot move backwards from ${baseState.acceptedThrough} to ${headState.acceptedThrough}`),
    );
  }

  const baseCurrent = sequence.get(baseState.currentSlice);
  const headCurrent = sequence.get(headState.currentSlice);
  if (Number.isInteger(baseCurrent) && Number.isInteger(headCurrent) && headCurrent < baseCurrent) {
    findings.push(
      finding("SEQUENCE_REVERSED", "currentSlice", `currentSlice cannot silently reverse from ${baseState.currentSlice} to ${headState.currentSlice}`),
    );
  }

  const baseNext = sequence.get(baseState.nextSlice);
  const headNext = sequence.get(headState.nextSlice);
  if (Number.isInteger(baseNext) && Number.isInteger(headNext) && headNext < baseNext) {
    const held = (roadmap.holds ?? []).some((hold) => hold.capability === headState.nextSlice);
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
  const baseStatuses = baseState.implementation?.trancheStatuses ?? {};
  const headStatuses = headState.implementation?.trancheStatuses ?? {};
  for (const tranche of plan.tranches) {
    const from = baseStatuses[tranche.id];
    const to = headStatuses[tranche.id];
    if (from !== to) {
      mutations.push({ path: `implementation.trancheStatuses.${tranche.id}`, from, to });
    }
  }
  return mutations;
}
