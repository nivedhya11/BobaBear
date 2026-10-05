/**
 * GOV-2 generic governance model.
 *
 * TEST_ONLY fixtures and this module are NON_AUTHORITATIVE in PR A.
 * ROADMAP.md and STATE.md remain the live lifecycle authorities.
 * GOV2_CUTOVER = NO
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

/** Eventual GOV-2 delivery overlay. PR A does not cut over AGENTS.md. */
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
 * Parse CURRENT governance-meta JSON only. Does not search historical prose.
 * @param {string} text
 * @returns {{ ok: true, meta: Record<string, unknown> } | { ok: false, code: string, path: string, message: string }}
 */
export function parseGovernanceMeta(text) {
  const start = String(text ?? "").indexOf("<!-- governance-meta");
  if (start < 0) {
    return finding("GOVERNANCE_META_MISSING", "governance-meta", "governance-meta block is missing");
  }
  const open = text.indexOf("{", start);
  const closeComment = text.indexOf("-->", start);
  if (open < 0 || closeComment < 0 || open > closeComment) {
    return finding("GOVERNANCE_META_INVALID", "governance-meta", "governance-meta JSON is not bounded");
  }
  const jsonText = text.slice(open, closeComment).trim();
  try {
    return { ok: true, meta: JSON.parse(jsonText) };
  } catch (error) {
    return finding(
      "GOVERNANCE_META_INVALID",
      "governance-meta",
      `governance-meta JSON is invalid: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * @param {unknown} lastTransition
 * @param {Iterable<string>} trancheIds
 */
export function validateLastTransitionShape(lastTransition, trancheIds) {
  if (lastTransition == null) {
    return { ok: true, findings: [] };
  }
  if (typeof lastTransition !== "object") {
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
  if (lastTransition.sourcePr != null && !Number.isInteger(lastTransition.sourcePr)) {
    findings.push(finding("INVALID_LAST_TRANSITION", "lastTransition.sourcePr", "sourcePr must be an integer pull-request number"));
  }
  if (lastTransition.mergeCommit != null && !SHA1_RE.test(String(lastTransition.mergeCommit))) {
    findings.push(finding("INVALID_LAST_TRANSITION", "lastTransition.mergeCommit", "mergeCommit must be a 40-character lowercase SHA-1"));
  }
  return aggregate(findings);
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
