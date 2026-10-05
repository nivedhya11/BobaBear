/**
 * Generic current-state invariants. Capability names are data, not conditionals.
 */
import {
  FOUNDER_UAT,
  TRANCHE_STATUS,
  aggregate,
  evaluatePositionLifecycle,
  finding,
  validateLastTransitionShape,
} from "./model.mjs";
import {
  allRequiredTranchesPass,
  dependenciesSatisfied,
  deriveNextGate,
  validateTrancheStatuses,
} from "./tranche-graph.mjs";

/**
 * @param {object} state
 * @param {object} plan
 * @param {object} roadmap
 */
export function validateCurrentState(state, plan, roadmap) {
  const findings = [];
  const capabilities = capabilityMap(roadmap);
  const sequence = capabilitySequence(roadmap);

  findings.push(...graphAndStatusFindings(plan, state));
  findings.push(...passWithoutDependencyFindings(plan, state));

  const currentSlice = state.currentSlice;
  const nextSlice = state.nextSlice;
  const acceptedThrough = state.acceptedThrough;

  if (!capabilities.has(currentSlice)) {
    findings.push(finding("CURRENT_SLICE_MISSING", "currentSlice", `currentSlice ${currentSlice} is not in the roadmap`));
  }
  if (nextSlice != null && nextSlice !== "NONE" && !capabilities.has(nextSlice)) {
    findings.push(finding("NEXT_SLICE_MISSING", "nextSlice", `nextSlice ${nextSlice} is not in the roadmap`));
  }
  if (!capabilities.has(acceptedThrough)) {
    findings.push(finding("ACCEPTED_THROUGH_MISSING", "acceptedThrough", `acceptedThrough ${acceptedThrough} is not in the roadmap`));
  }

  const current = capabilities.get(currentSlice);
  if (current?.accepted) {
    findings.push(finding("CURRENT_SLICE_ACCEPTED", "currentSlice", `currentSlice ${currentSlice} is already accepted`));
  }

  const pending = state.pendingAcceptance;
  if (pending != null && pending !== "NONE") {
    if (!capabilities.has(pending)) {
      findings.push(finding("PENDING_ACCEPTANCE_INVALID", "pendingAcceptance", `pendingAcceptance ${pending} is not in the roadmap`));
    } else if (pending !== currentSlice) {
      findings.push(
        finding("PENDING_ACCEPTANCE_INVALID", "pendingAcceptance", `pendingAcceptance ${pending} must refer to currentSlice ${currentSlice}`),
      );
    }
  }

  const implementationComplete = Boolean(state.implementation?.complete);
  if (state.accepted === true && !implementationComplete) {
    findings.push(finding("ACCEPTED_BEFORE_COMPLETE", "accepted", "accepted requires implementationComplete"));
  }
  if (state.founderUat === FOUNDER_UAT.PASS && !implementationComplete) {
    findings.push(finding("UAT_BEFORE_COMPLETE", "founderUat", "founderUat PASS requires implementationComplete"));
  }
  if (implementationComplete && !allRequiredTranchesPass(plan, state.implementation?.trancheStatuses)) {
    findings.push(
      finding(
        "COMPLETE_WITH_REQUIRED_TRANCHE_MISSING",
        "implementation.complete",
        "implementationComplete requires every required tranche PASS",
      ),
    );
  }

  const position = evaluatePositionLifecycle(roadmap, {
    ...state,
    pendingAcceptance: pending ?? "NONE",
  });
  if (position.ok === false) {
    findings.push(finding(position.code, "lifecycle", position.message));
  }

  findings.push(...validateLastTransitionShape(state.lastTransition, (plan.tranches ?? []).map((tranche) => tranche.id)).findings);

  for (const hold of roadmap.holds ?? []) {
    if (hold?.capability && !capabilities.has(hold.capability)) {
      findings.push(finding("UNKNOWN_HOLD", "roadmap.holds", `hold ${hold.capability} is not in the roadmap`));
    }
  }

  if (currentSlice && nextSlice && nextSlice !== "NONE" && sequence.has(currentSlice) && sequence.has(nextSlice)) {
    if (sequence.get(nextSlice) < sequence.get(currentSlice) && !isHeldException(roadmap, nextSlice)) {
      findings.push(finding("SEQUENCE_REVERSED", "nextSlice", `nextSlice ${nextSlice} silently precedes currentSlice ${currentSlice}`));
    }
  }

  return {
    ...aggregate(findings),
    nextGate: deriveNextGate(plan, state.implementation?.trancheStatuses ?? {}),
    allRequiredTranchesPass: allRequiredTranchesPass(plan, state.implementation?.trancheStatuses ?? {}),
    derivedStarted: derivedStarted(state.implementation?.trancheStatuses ?? {}),
  };
}

export function derivedStarted(statuses) {
  const started = {};
  for (const [id, status] of Object.entries(statuses)) {
    started[id] = status === TRANCHE_STATUS.PASS;
  }
  return started;
}

function graphAndStatusFindings(plan, state) {
  return validateTrancheStatuses(plan, state.implementation?.trancheStatuses ?? {}).findings;
}

function passWithoutDependencyFindings(plan, state) {
  const statuses = state.implementation?.trancheStatuses ?? {};
  const findings = [];
  for (const tranche of plan.tranches ?? []) {
    if (statuses[tranche.id] !== TRANCHE_STATUS.PASS) continue;
    if (!dependenciesSatisfied(plan, statuses, tranche.id)) {
      findings.push(
        finding(
          "DEPENDENCY_NOT_SATISFIED",
          `implementation.trancheStatuses.${tranche.id}`,
          `tranche ${tranche.id} cannot be PASS while a required dependency is unresolved`,
        ),
      );
    }
  }
  return findings;
}

function capabilityMap(roadmap) {
  return new Map((roadmap.capabilities ?? []).map((capability) => [capability.id, capability]));
}

function capabilitySequence(roadmap) {
  return new Map((roadmap.capabilities ?? []).map((capability, index) => [capability.id, capability.sequence ?? index]));
}

function isHeldException(roadmap, capabilityId) {
  return (roadmap.holds ?? []).some((hold) => hold.capability === capabilityId);
}
