/**
 * GOV-2 generic governance model.
 *
 * TEST_ONLY fixtures and this module are used by engine tests.
 * Live current execution is validated from ROADMAP/STATE GOV-2 blocks.
 * GOV2_CUTOVER_ACCEPTANCE = NO
 */
import { evaluateCapabilityLifecycle } from "../project-consistency.mjs";

export const TRANCHE_STATUS = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  PASS: "PASS",
});

export const TRANCHE_STATUS_SET = new Set(Object.values(TRANCHE_STATUS));

export const FOUNDER_UAT = Object.freeze({
  NOT_PERFORMED: "NOT_PERFORMED",
  PASS: "PASS",
});

export const LAST_TRANSITION_TYPE = Object.freeze({
  TRANCHE_PASS: "TRANCHE_PASS",
});

/** Delivery overlay recorded in AGENTS.md. */
export const DELIVERY_RISK_TIER = Object.freeze({
  GREEN: "GREEN",
  AMBER: "AMBER",
  RED: "RED",
});

export const SHA1_RE = /^[0-9a-f]{40}$/;

export function finding(code, path, message) {
  return { ok: false, code, path, message };
}

export function aggregate(findings) {
  const material = findings.filter((item) => item && item.ok === false);
  return {
    ok: material.length === 0,
    findings: material,
  };
}

/**
 * @param {unknown} lastTransition
 * @param {Iterable<string>} trancheIds
 */
export function validateLastTransitionShape(lastTransition, trancheIds) {
  if (lastTransition == null) {
    return { ok: true, findings: [] };
  }
  if (typeof lastTransition !== "object" || Array.isArray(lastTransition)) {
    return aggregate([finding("INVALID_LAST_TRANSITION", "lastTransition", "lastTransition must be an object")]);
  }
  const findings = [];
  const type = lastTransition.type;
  if (!Object.values(LAST_TRANSITION_TYPE).includes(type)) {
    findings.push(finding("INVALID_LAST_TRANSITION", "lastTransition.type", `unsupported lastTransition.type ${JSON.stringify(type)}`));
  }
  const known = new Set(trancheIds);
  if (type === LAST_TRANSITION_TYPE.TRANCHE_PASS && !known.has(lastTransition.tranche)) {
    findings.push(
      finding("INVALID_LAST_TRANSITION", "lastTransition.tranche", `lastTransition.tranche ${JSON.stringify(lastTransition.tranche)} is not in the tranche plan`),
    );
  }
  if (lastTransition.sourcePr != null && !isPositiveSourcePr(lastTransition.sourcePr)) {
    findings.push(
      finding("INVALID_LAST_TRANSITION", "lastTransition.sourcePr", "sourcePr must be a positive integer pull-request number"),
    );
  }
  if (lastTransition.mergeCommit != null && !isValidMergeCommit(lastTransition.mergeCommit)) {
    findings.push(finding("INVALID_LAST_TRANSITION", "lastTransition.mergeCommit", "mergeCommit must be a 40-character lowercase SHA-1"));
  }
  return aggregate(findings);
}

/** @param {unknown} value */
export function isPositiveSourcePr(value) {
  return Number.isInteger(value) && value > 0;
}

/** @param {unknown} value */
export function isValidMergeCommit(value) {
  return typeof value === "string" && SHA1_RE.test(value);
}

/**
 * Map GOV-2 structured inputs onto the existing generic lifecycle primitive.
 * @param {object} roadmap
 * @param {object} state
 */
export function evaluatePositionLifecycle(roadmap, state) {
  const capabilities = (roadmap.capabilities ?? []).map((capability, index) => ({
    id: capability.id,
    accepted: Boolean(capability.accepted),
    implementationComplete: Boolean(capability.implementationComplete),
    index,
  }));
  return evaluateCapabilityLifecycle({
    acceptedThrough: state.acceptedThrough ?? roadmap.acceptedThrough,
    currentProductSlice: state.currentSlice ?? "NONE",
    pendingAcceptance: state.pendingAcceptance ?? "NONE",
    capabilities,
  });
}
