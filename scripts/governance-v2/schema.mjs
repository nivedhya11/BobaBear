/**
 * Generic GOV-2 schema validation.
 *
 * TEST_ONLY / NON_AUTHORITATIVE in PR A. Capability identifiers are data.
 * Do not encode checkpoint versions or live architecture/decision IDs here.
 */
import {
  FOUNDER_UAT,
  TRANCHE_STATUS,
  aggregate,
  finding,
  validateLastTransitionShape,
} from "./model.mjs";

export const LIFECYCLE_PHASE = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  PRODUCT_DEFINITION: "PRODUCT_DEFINITION",
  EXPERIENCE_DEFINITION: "EXPERIENCE_DEFINITION",
  ARCHITECTURE_FIT: "ARCHITECTURE_FIT",
  DESIGN_READINESS: "DESIGN_READINESS",
  IMPLEMENTATION_PLAN: "IMPLEMENTATION_PLAN",
  IMPLEMENTATION_IN_PROGRESS: "IMPLEMENTATION_IN_PROGRESS",
  IMPLEMENTATION_COMPLETE: "IMPLEMENTATION_COMPLETE",
  COMPLETE_AND_ACCEPTED: "COMPLETE_AND_ACCEPTED",
});

export const LIFECYCLE_PHASE_SET = new Set(Object.values(LIFECYCLE_PHASE));

export const CURRENT_AUTHORITY_KIND = Object.freeze({
  ROADMAP: "IMPLEMENTATION_SEQUENCE",
  STATE: "ACCEPTED_STATE",
});

const GOVERNANCE_META_BLOCK = /<!--\s*governance-meta\b([\s\S]*?)-->/g;

/**
 * Scan every governance-meta block. Current authority is the unique
 * status=CURRENT block whose authority matches expectedAuthority.
 *
 * @param {string} text
 * @param {string} expectedAuthority
 */
export function parseCurrentGovernanceMeta(text, expectedAuthority) {
  if (typeof expectedAuthority !== "string" || expectedAuthority.length === 0) {
    return finding(
      "CURRENT_AUTHORITY_KIND_REQUIRED",
      "governance-meta.authority",
      "expectedAuthority is required",
    );
  }

  const source = String(text ?? "");
  const matches = [...source.matchAll(GOVERNANCE_META_BLOCK)];
  if (matches.length === 0) {
    return finding("CURRENT_AUTHORITY_MISSING", "governance-meta", "no governance-meta block found");
  }

  /** @type {{ index: number, meta: Record<string, unknown> }[]} */
  const currentBlocks = [];

  for (const [index, match] of matches.entries()) {
    const body = match[1] ?? "";
    const open = body.indexOf("{");
    const close = body.lastIndexOf("}");
    if (open < 0 || close < 0 || close < open) {
      return finding(
        "CURRENT_AUTHORITY_MALFORMED",
        `governance-meta[${index}]`,
        "governance-meta JSON is not bounded",
      );
    }
    let meta;
    try {
      meta = JSON.parse(body.slice(open, close + 1));
    } catch (error) {
      return finding(
        "CURRENT_AUTHORITY_MALFORMED",
        `governance-meta[${index}]`,
        `governance-meta JSON is invalid: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (meta == null || typeof meta !== "object" || Array.isArray(meta)) {
      return finding(
        "CURRENT_AUTHORITY_MALFORMED",
        `governance-meta[${index}]`,
        "governance-meta JSON must be an object",
      );
    }
    if (meta.status === "CURRENT") {
      currentBlocks.push({ index, meta });
    }
  }

  if (currentBlocks.length === 0) {
    return finding(
      "CURRENT_AUTHORITY_MISSING",
      "governance-meta",
      "no CURRENT governance-meta block found",
    );
  }
  if (currentBlocks.length > 1) {
    return finding(
      "CURRENT_AUTHORITY_NOT_UNIQUE",
      "governance-meta",
      `${currentBlocks.length} CURRENT governance-meta blocks found`,
    );
  }

  const { meta } = currentBlocks[0];
  if (meta.status !== "CURRENT") {
    return finding(
      "CURRENT_AUTHORITY_STATUS_REQUIRED",
      "governance-meta.status",
      `status must be CURRENT, got ${JSON.stringify(meta.status)}`,
    );
  }
  if (meta.authority !== expectedAuthority) {
    return finding(
      "CURRENT_AUTHORITY_KIND_MISMATCH",
      "governance-meta.authority",
      `authority must be ${expectedAuthority}, got ${JSON.stringify(meta.authority)}`,
    );
  }
  return { ok: true, meta };
}

/**
 * @param {unknown} roadmap
 */
export function validateRoadmapSchema(roadmap) {
  const findings = [];
  if (roadmap == null || typeof roadmap !== "object" || Array.isArray(roadmap)) {
    return aggregate([finding("INVALID_ROADMAP", "roadmap", "roadmap must be an object")]);
  }

  findings.push(...requiredNonEmptyString(roadmap.acceptedThrough, "acceptedThrough", "INVALID_ACCEPTED_THROUGH"));
  findings.push(...requiredNonEmptyString(roadmap.currentSlice, "currentSlice", "INVALID_CURRENT_SLICE"));
  findings.push(...requiredNextSlice(roadmap.nextSlice, "nextSlice"));
  findings.push(...requiredNonEmptyString(roadmap.gtmBoundary, "gtmBoundary", "INVALID_GTM_BOUNDARY"));

  const capabilities = roadmap.capabilities;
  if (!Array.isArray(capabilities) || capabilities.length === 0) {
    findings.push(finding("EMPTY_CAPABILITY_LEDGER", "capabilities", "capabilities must be a non-empty array"));
    findings.push(...validateHoldsShape(roadmap.holds, new Set()));
    findings.push(...validateReferenceIndexShape(roadmap.referenceIndex));
    return aggregate(findings);
  }

  const ids = new Set();
  const sequences = new Set();
  for (const [index, capability] of capabilities.entries()) {
    const path = `capabilities[${index}]`;
    if (capability == null || typeof capability !== "object" || Array.isArray(capability)) {
      findings.push(finding("INVALID_CAPABILITY", path, "capability must be an object"));
      continue;
    }
    if (typeof capability.id !== "string" || capability.id.length === 0) {
      findings.push(finding("INVALID_CAPABILITY_ID", `${path}.id`, "capability.id is required"));
    } else if (ids.has(capability.id)) {
      findings.push(finding("DUPLICATE_CAPABILITY_ID", `${path}.id`, `duplicate capability id ${capability.id}`));
    } else {
      ids.add(capability.id);
    }
    if (!Number.isInteger(capability.sequence)) {
      findings.push(finding("INVALID_CAPABILITY_SEQUENCE", `${path}.sequence`, "capability.sequence must be an integer"));
    } else if (sequences.has(capability.sequence)) {
      findings.push(
        finding("DUPLICATE_CAPABILITY_SEQUENCE", `${path}.sequence`, `duplicate capability sequence ${capability.sequence}`),
      );
    } else {
      sequences.add(capability.sequence);
    }
    if (typeof capability.accepted !== "boolean") {
      findings.push(finding("INVALID_CAPABILITY_ACCEPTED", `${path}.accepted`, "capability.accepted must be a boolean"));
    }
    if (typeof capability.implementationComplete !== "boolean") {
      findings.push(
        finding(
          "INVALID_CAPABILITY_IMPLEMENTATION_COMPLETE",
          `${path}.implementationComplete`,
          "capability.implementationComplete must be a boolean",
        ),
      );
    }
  }

  if (typeof roadmap.acceptedThrough === "string" && roadmap.acceptedThrough.length > 0 && !ids.has(roadmap.acceptedThrough)) {
    findings.push(
      finding("ACCEPTED_THROUGH_MISSING", "acceptedThrough", `acceptedThrough ${roadmap.acceptedThrough} is not in the roadmap`),
    );
  }
  if (typeof roadmap.currentSlice === "string" && roadmap.currentSlice.length > 0 && !ids.has(roadmap.currentSlice)) {
    findings.push(finding("CURRENT_SLICE_MISSING", "currentSlice", `currentSlice ${roadmap.currentSlice} is not in the roadmap`));
  }
  if (
    typeof roadmap.nextSlice === "string" &&
    roadmap.nextSlice.length > 0 &&
    roadmap.nextSlice !== "NONE" &&
    !ids.has(roadmap.nextSlice)
  ) {
    findings.push(finding("NEXT_SLICE_MISSING", "nextSlice", `nextSlice ${roadmap.nextSlice} is not in the roadmap`));
  }
  if (typeof roadmap.gtmBoundary === "string" && roadmap.gtmBoundary.length > 0 && !ids.has(roadmap.gtmBoundary)) {
    findings.push(
      finding("UNKNOWN_GTM_BOUNDARY", "gtmBoundary", `gtmBoundary ${roadmap.gtmBoundary} is not in the roadmap`),
    );
  }

  findings.push(...validateHoldsShape(roadmap.holds, ids));
  findings.push(...validateReferenceIndexShape(roadmap.referenceIndex));
  return aggregate(findings);
}

/**
 * @param {unknown} state
 * @param {object} [plan]
 * @param {object} [roadmap]
 */
export function validateStateSchema(state, plan, roadmap) {
  const findings = [];
  if (state == null || typeof state !== "object" || Array.isArray(state)) {
    return aggregate([finding("INVALID_STATE", "state", "state must be an object")]);
  }

  findings.push(...requiredNonEmptyString(state.slice, "slice", "INVALID_SLICE"));
  findings.push(...requiredNonEmptyString(state.currentSlice, "currentSlice", "INVALID_CURRENT_SLICE"));
  if (
    typeof state.slice === "string" &&
    state.slice.length > 0 &&
    typeof state.currentSlice === "string" &&
    state.currentSlice.length > 0 &&
    state.slice !== state.currentSlice
  ) {
    findings.push(
      finding("SLICE_CURRENT_SLICE_MISMATCH", "slice", `slice ${state.slice} must equal currentSlice ${state.currentSlice}`),
    );
  }

  if (state.lifecyclePhase == null) {
    findings.push(finding("MISSING_LIFECYCLE_PHASE", "lifecyclePhase", "lifecyclePhase is required"));
  } else if (!LIFECYCLE_PHASE_SET.has(state.lifecyclePhase)) {
    findings.push(
      finding("INVALID_LIFECYCLE_PHASE", "lifecyclePhase", `unsupported lifecyclePhase ${JSON.stringify(state.lifecyclePhase)}`),
    );
  }

  const implementation = state.implementation;
  if (implementation == null || typeof implementation !== "object" || Array.isArray(implementation)) {
    findings.push(finding("INVALID_IMPLEMENTATION", "implementation", "implementation must be an object"));
  } else {
    if (!Object.hasOwn(implementation, "authorized")) {
      findings.push(finding("MISSING_IMPLEMENTATION_AUTHORIZED", "implementation.authorized", "implementation.authorized is required"));
    } else if (typeof implementation.authorized !== "boolean") {
      findings.push(
        finding(
          "INVALID_IMPLEMENTATION_AUTHORIZED",
          "implementation.authorized",
          "implementation.authorized must be a boolean",
        ),
      );
    }
    if (!Object.hasOwn(implementation, "complete")) {
      findings.push(finding("MISSING_IMPLEMENTATION_COMPLETE", "implementation.complete", "implementation.complete is required"));
    } else if (typeof implementation.complete !== "boolean") {
      findings.push(
        finding("INVALID_IMPLEMENTATION_COMPLETE", "implementation.complete", "implementation.complete must be a boolean"),
      );
    }
    if (
      implementation.trancheStatuses == null ||
      typeof implementation.trancheStatuses !== "object" ||
      Array.isArray(implementation.trancheStatuses)
    ) {
      findings.push(
        finding("INVALID_TRANCHE_STATUSES", "implementation.trancheStatuses", "implementation.trancheStatuses must be an object"),
      );
    }
    findings.push(...authorizationInvariantFindings(implementation));
  }

  if (state.founderUat == null) {
    findings.push(finding("MISSING_FOUNDER_UAT", "founderUat", "founderUat is required"));
  } else if (!Object.values(FOUNDER_UAT).includes(state.founderUat)) {
    findings.push(finding("INVALID_FOUNDER_UAT", "founderUat", `unsupported founderUat ${JSON.stringify(state.founderUat)}`));
  }

  if (!Object.hasOwn(state, "accepted")) {
    findings.push(finding("MISSING_ACCEPTED", "accepted", "accepted is required"));
  } else if (typeof state.accepted !== "boolean") {
    findings.push(finding("INVALID_ACCEPTED", "accepted", "accepted must be a boolean"));
  }

  if (state.pendingAcceptance == null) {
    findings.push(finding("MISSING_PENDING_ACCEPTANCE", "pendingAcceptance", "pendingAcceptance is required"));
  } else if (typeof state.pendingAcceptance !== "string" || state.pendingAcceptance.length === 0) {
    findings.push(
      finding("INVALID_PENDING_ACCEPTANCE", "pendingAcceptance", "pendingAcceptance must be a non-empty string or NONE"),
    );
  }

  findings.push(...requiredNonEmptyString(state.acceptedThrough, "acceptedThrough", "INVALID_ACCEPTED_THROUGH"));
  findings.push(...requiredNextSlice(state.nextSlice, "nextSlice"));
  findings.push(...lifecyclePhaseCoherenceFindings(state));

  if (plan != null) {
    findings.push(...planStateSliceFindings(state, plan));
  }

  const trancheIds = Array.isArray(plan?.tranches) ? plan.tranches.map((tranche) => tranche?.id).filter(Boolean) : [];
  findings.push(...validateLastTransitionShape(state.lastTransition, trancheIds).findings);
  findings.push(...validateCurrentReferences(state, roadmap));
  findings.push(...contractExecutionDuplicationFindings(state.contracts));

  return aggregate(findings);
}

const CONTRACT_EXECUTION_KEYS = Object.freeze([
  "started",
  "implementationStarted",
  "implementationComplete",
  "accepted",
  "implementationAuthorized",
]);

/**
 * `contracts` may hold independent semantic gate references only.
 * Execution copies of canonical implementation/accepted fields are forbidden.
 * @param {unknown} contracts
 */
export function contractExecutionDuplicationFindings(contracts) {
  if (contracts == null) return [];
  if (typeof contracts !== "object" || Array.isArray(contracts)) {
    return [finding("INVALID_CONTRACTS", "contracts", "contracts must be an object when present")];
  }
  /** @type {ReturnType<typeof finding>[]} */
  const findings = [];
  for (const key of CONTRACT_EXECUTION_KEYS) {
    if (Object.hasOwn(contracts, key)) {
      findings.push(
        finding(
          "CONTRACT_EXECUTION_DUPLICATION",
          `contracts.${key}`,
          `contracts.${key} duplicates canonical execution state and must be derived, not persisted`,
        ),
      );
    }
  }
  return findings;
}

/**
 * Require ROADMAP and STATE sequence pointers to be identical, not merely
 * independently valid capability ids.
 *
 * @param {object} roadmap
 * @param {object} state
 */
export function validateRoadmapStateAlignment(roadmap, state) {
  const findings = [];
  if (roadmap == null || typeof roadmap !== "object" || Array.isArray(roadmap)) {
    return aggregate([finding("INVALID_ROADMAP", "roadmap", "roadmap must be an object")]);
  }
  if (state == null || typeof state !== "object" || Array.isArray(state)) {
    return aggregate([finding("INVALID_STATE", "state", "state must be an object")]);
  }

  const pairs = [
    ["acceptedThrough", "ROADMAP_STATE_ACCEPTED_THROUGH_MISMATCH"],
    ["currentSlice", "ROADMAP_STATE_CURRENT_SLICE_MISMATCH"],
    ["nextSlice", "ROADMAP_STATE_NEXT_SLICE_MISMATCH"],
  ];
  for (const [field, code] of pairs) {
    if (roadmap[field] !== state[field]) {
      findings.push(
        finding(
          code,
          field,
          `ROADMAP ${field}=${JSON.stringify(roadmap[field])} STATE ${field}=${JSON.stringify(state[field])}`,
        ),
      );
    }
  }
  return aggregate(findings);
}

function lifecyclePhaseCoherenceFindings(state) {
  const findings = [];
  const phase = state.lifecyclePhase;
  const accepted = state.accepted;
  const implementation =
    state.implementation != null && typeof state.implementation === "object" && !Array.isArray(state.implementation)
      ? state.implementation
      : null;
  const complete = implementation ? implementation.complete : undefined;
  const authorized = implementation ? implementation.authorized : undefined;
  const statuses =
    implementation &&
    implementation.trancheStatuses != null &&
    typeof implementation.trancheStatuses === "object" &&
    !Array.isArray(implementation.trancheStatuses)
      ? implementation.trancheStatuses
      : null;
  const anyPass = statuses ? Object.values(statuses).some((status) => status === TRANCHE_STATUS.PASS) : false;
  const knownPhase = typeof phase === "string" && LIFECYCLE_PHASE_SET.has(phase);

  if (accepted === true && knownPhase && phase !== LIFECYCLE_PHASE.COMPLETE_AND_ACCEPTED) {
    findings.push(
      finding(
        "ACCEPTED_PHASE_CONTRADICTION",
        "lifecyclePhase",
        "accepted requires lifecyclePhase COMPLETE_AND_ACCEPTED",
      ),
    );
  }

  if (phase === LIFECYCLE_PHASE.COMPLETE_AND_ACCEPTED && (accepted !== true || complete !== true)) {
    findings.push(
      finding(
        "COMPLETE_AND_ACCEPTED_PHASE_CONTRADICTION",
        "lifecyclePhase",
        "COMPLETE_AND_ACCEPTED requires accepted and implementation.complete",
      ),
    );
  }

  if (
    complete === true &&
    accepted === false &&
    knownPhase &&
    phase !== LIFECYCLE_PHASE.IMPLEMENTATION_COMPLETE
  ) {
    findings.push(
      finding(
        "COMPLETE_PHASE_CONTRADICTION",
        "lifecyclePhase",
        "implementation.complete without accepted requires lifecyclePhase IMPLEMENTATION_COMPLETE",
      ),
    );
  }

  if (anyPass && complete === false && knownPhase && phase !== LIFECYCLE_PHASE.IMPLEMENTATION_IN_PROGRESS) {
    findings.push(
      finding(
        "PASS_TRANCHE_EARLY_PHASE",
        "lifecyclePhase",
        "a PASS tranche with incomplete implementation requires lifecyclePhase IMPLEMENTATION_IN_PROGRESS",
      ),
    );
  }

  if (phase === LIFECYCLE_PHASE.IMPLEMENTATION_IN_PROGRESS) {
    if (authorized !== true || complete !== false || accepted !== false) {
      findings.push(
        finding(
          "IMPLEMENTATION_IN_PROGRESS_INCOHERENT",
          "lifecyclePhase",
          "IMPLEMENTATION_IN_PROGRESS requires authorized, incomplete, and unaccepted implementation",
        ),
      );
    }
  }

  return findings;
}

function authorizationInvariantFindings(implementation) {
  const findings = [];
  if (typeof implementation.authorized !== "boolean") return findings;
  const statuses =
    implementation.trancheStatuses != null &&
    typeof implementation.trancheStatuses === "object" &&
    !Array.isArray(implementation.trancheStatuses)
      ? implementation.trancheStatuses
      : {};
  const anyPass = Object.values(statuses).some((status) => status === TRANCHE_STATUS.PASS);
  if (anyPass && implementation.authorized !== true) {
    findings.push(
      finding(
        "UNAUTHORIZED_WITH_TRANCHE_PASS",
        "implementation.authorized",
        "implementation.authorized must be true when any tranche is PASS",
      ),
    );
  }
  if (implementation.complete === true && implementation.authorized !== true) {
    findings.push(
      finding(
        "UNAUTHORIZED_WHEN_COMPLETE",
        "implementation.authorized",
        "implementation.authorized must be true when implementation.complete is true",
      ),
    );
  }
  return findings;
}

function planStateSliceFindings(state, plan) {
  if (typeof plan.slice !== "string" || plan.slice.length === 0) {
    return [finding("INVALID_TRANCHE_PLAN_SLICE", "plan.slice", "tranche plan.slice is required")];
  }
  if (plan.slice !== state.slice || plan.slice !== state.currentSlice) {
    return [
      finding(
        "TRANCHE_PLAN_SLICE_MISMATCH",
        "plan.slice",
        `plan.slice ${plan.slice} must equal state.slice ${state.slice} and state.currentSlice ${state.currentSlice}`,
      ),
    ];
  }
  return [];
}

/**
 * @param {object} state
 * @param {object} [roadmap]
 */
export function validateCurrentReferences(state, roadmap) {
  const findings = [];
  const refs = state?.currentReferences;
  if (refs == null) {
    return [finding("MISSING_CURRENT_REFERENCES", "currentReferences", "currentReferences is required")];
  }
  if (typeof refs !== "object" || Array.isArray(refs)) {
    return [finding("INVALID_REFERENCE_SHAPE", "currentReferences", "currentReferences must be an object")];
  }

  const index = roadmap?.referenceIndex;
  const architectures = index?.architectures;
  const decisions = index?.decisions;
  const knownArchitectures = Array.isArray(architectures) ? new Set(architectures) : null;
  const knownDecisions = Array.isArray(decisions) ? new Set(decisions) : null;

  findings.push(
    ...validateReferenceList(refs.architecture, "currentReferences.architecture", "ARCHITECTURE", knownArchitectures),
  );
  findings.push(...validateReferenceList(refs.decisions, "currentReferences.decisions", "DECISION", knownDecisions));
  return findings;
}

function validateReferenceList(list, path, kind, known) {
  const findings = [];
  if (!Array.isArray(list)) {
    return [finding("INVALID_REFERENCE_SHAPE", path, `${path} must be an array`)];
  }
  const seen = new Set();
  for (const [index, value] of list.entries()) {
    if (typeof value !== "string" || value.length === 0) {
      findings.push(finding("INVALID_REFERENCE_SHAPE", `${path}[${index}]`, "reference must be a non-empty string"));
      continue;
    }
    if (seen.has(value)) {
      findings.push(finding(`DUPLICATE_${kind}_REFERENCE`, `${path}[${index}]`, `duplicate reference ${value}`));
    }
    seen.add(value);
    if (known && !known.has(value)) {
      findings.push(finding(`UNKNOWN_${kind}_REFERENCE`, `${path}[${index}]`, `unknown reference ${value}`));
    }
  }
  return findings;
}

function validateReferenceIndexShape(index) {
  if (index == null) {
    return [finding("MISSING_REFERENCE_INDEX", "referenceIndex", "referenceIndex is required")];
  }
  if (typeof index !== "object" || Array.isArray(index)) {
    return [finding("INVALID_REFERENCE_INDEX", "referenceIndex", "referenceIndex must be an object")];
  }
  const findings = [];
  if (!Array.isArray(index.architectures)) {
    findings.push(finding("INVALID_REFERENCE_INDEX", "referenceIndex.architectures", "architectures must be an array"));
  } else {
    findings.push(...uniqueStringList(index.architectures, "referenceIndex.architectures", "DUPLICATE_ARCHITECTURE_REFERENCE"));
  }
  if (!Array.isArray(index.decisions)) {
    findings.push(finding("INVALID_REFERENCE_INDEX", "referenceIndex.decisions", "decisions must be an array"));
  } else {
    findings.push(...uniqueStringList(index.decisions, "referenceIndex.decisions", "DUPLICATE_DECISION_REFERENCE"));
  }
  return findings;
}

function uniqueStringList(list, path, duplicateCode) {
  const findings = [];
  const seen = new Set();
  for (const [index, value] of list.entries()) {
    if (typeof value !== "string" || value.length === 0) {
      findings.push(finding("INVALID_REFERENCE_SHAPE", `${path}[${index}]`, "reference must be a non-empty string"));
      continue;
    }
    if (seen.has(value)) {
      findings.push(finding(duplicateCode, `${path}[${index}]`, `duplicate reference ${value}`));
    }
    seen.add(value);
  }
  return findings;
}

function validateHoldsShape(holds, capabilityIds) {
  if (holds == null) return [];
  if (!Array.isArray(holds)) {
    return [finding("INVALID_HOLDS", "holds", "holds must be an array")];
  }
  const findings = [];
  for (const [index, hold] of holds.entries()) {
    const path = `holds[${index}]`;
    if (hold == null || typeof hold !== "object" || Array.isArray(hold)) {
      findings.push(finding("INVALID_HOLD", path, "hold must be an object"));
      continue;
    }
    if (typeof hold.capability !== "string" || hold.capability.length === 0) {
      findings.push(finding("INVALID_HOLD", `${path}.capability`, "hold.capability is required"));
    } else if (capabilityIds.size > 0 && !capabilityIds.has(hold.capability)) {
      findings.push(finding("UNKNOWN_HOLD", `${path}.capability`, `hold ${hold.capability} is not in the roadmap`));
    }
  }
  return findings;
}

function requiredNonEmptyString(value, path, code) {
  if (typeof value !== "string" || value.length === 0) {
    return [finding(code, path, `${path} must be a non-empty string`)];
  }
  return [];
}

function requiredNextSlice(value, path) {
  if (typeof value !== "string" || value.length === 0) {
    return [finding("INVALID_NEXT_SLICE", path, `${path} must be a known capability or NONE`)];
  }
  return [];
}

/**
 * Compare live CURRENT ROADMAP/STATE metadata fields that exist pre-cutover.
 * Does not read narrative prose.
 *
 * @param {{ ok: boolean, meta?: Record<string, unknown> }} roadmapMeta
 * @param {{ ok: boolean, meta?: Record<string, unknown> }} stateMeta
 */
export function validateLiveRoadmapStateAlignment(roadmapMeta, stateMeta) {
  if (!roadmapMeta?.ok || !stateMeta?.ok) {
    return {
      ok: false,
      LIVE_CURRENT_META_VALID: "FAIL",
      LIVE_ROADMAP_STATE_ALIGNMENT: "FAIL",
      findings: [
        ...(roadmapMeta?.ok === false ? [roadmapMeta] : []),
        ...(stateMeta?.ok === false ? [stateMeta] : []),
      ],
    };
  }

  const liveFields = [
    ["acceptedThrough", "acceptedThrough"],
    ["currentProductSlice", "currentSlice"],
    ["nextProductSlice", "nextSlice"],
  ];
  const findings = [];
  const roadmapNormalized = {};
  const stateNormalized = {};
  for (const [liveField, normalizedField] of liveFields) {
    if (!Object.hasOwn(roadmapMeta.meta, liveField) || !Object.hasOwn(stateMeta.meta, liveField)) {
      findings.push(
        finding(
          "LIVE_META_FIELD_UNAVAILABLE",
          liveField,
          `${liveField} is unavailable from current metadata and must not be inferred from narrative`,
        ),
      );
      continue;
    }
    roadmapNormalized[normalizedField] = roadmapMeta.meta[liveField];
    stateNormalized[normalizedField] = stateMeta.meta[liveField];
  }
  findings.push(...validateRoadmapStateAlignment(roadmapNormalized, stateNormalized).findings);

  const result = aggregate(findings);
  return {
    ...result,
    LIVE_CURRENT_META_VALID: "PASS",
    LIVE_ROADMAP_STATE_ALIGNMENT: result.ok ? "PASS" : "FAIL",
  };
}
