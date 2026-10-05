/**
 * Bootstrap-only pre-GOV2 → GOV-2 execution extraction and comparison.
 *
 * Operates only when BASE_HAS_GOV2=NO and HEAD_HAS_GOV2=YES.
 * Anchors to the unique CURRENT pre-GOV2 STATE authority record.
 * Does not search arbitrary historical narrative.
 */
import { FOUNDER_UAT, SHA1_RE, TRANCHE_STATUS, aggregate, finding, isPositiveSourcePr } from "./model.mjs";
import { CURRENT_AUTHORITY_KIND, parseCurrentGovernanceMeta } from "./schema.mjs";
import { trancheList } from "./tranche-graph.mjs";

const FENCE_RE = /```(?:text)?\n([\s\S]*?)```/g;
const YES = new Set(["YES", "TRUE", "APPROVED"]);
const NO = new Set(["NO", "FALSE"]);

/**
 * @param {string} value
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} text
 */
export function parseRecordAssignments(text) {
  /** @type {Map<string, { value: string, count: number, values: Set<string> }>} */
  const map = new Map();
  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const line = raw.trim().replace(/;$/, "");
    const match = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.+)$/.exec(line);
    if (!match) continue;
    const key = match[1];
    const value = match[2].trim();
    if (!value) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { value, count: 1, values: new Set([value]) });
      continue;
    }
    existing.count += 1;
    existing.values.add(value);
    existing.value = value;
  }
  return map;
}

/**
 * Locate the unique CURRENT versioned STATE record fence.
 * @param {string} stateText
 * @param {string} stateVersion
 */
export function extractUniqueCurrentRecordFence(stateText, stateVersion) {
  if (typeof stateVersion !== "string" || stateVersion.length === 0) {
    return finding("GOV2_BOOTSTRAP_CURRENT_RECORD_MISSING", "stateVersion", "CURRENT stateVersion is required");
  }
  const heading = new RegExp(`^#{1,6}\\s+(?:\\d+\\.\\s+)?${escapeRegExp(stateVersion)}\\s+record\\s*$`, "gim");
  const matches = [...String(stateText ?? "").matchAll(heading)];
  if (matches.length === 0) {
    return finding(
      "GOV2_BOOTSTRAP_CURRENT_RECORD_MISSING",
      "current-record",
      "no unique CURRENT pre-GOV2 STATE record found",
    );
  }
  if (matches.length > 1) {
    return finding(
      "GOV2_BOOTSTRAP_CURRENT_RECORD_NOT_UNIQUE",
      "current-record",
      `${matches.length} CURRENT pre-GOV2 STATE records found`,
    );
  }
  const start = matches[0].index ?? 0;
  const after = String(stateText).slice(start);
  const nextHeading = after.search(/\n#{1,6}\s+/);
  const section = nextHeading >= 0 ? after.slice(0, nextHeading) : after;
  const fences = [...section.matchAll(new RegExp(FENCE_RE.source, "g"))];
  if (fences.length === 0) {
    return finding(
      "GOV2_BOOTSTRAP_CURRENT_RECORD_MISSING",
      "current-record",
      "CURRENT pre-GOV2 STATE record has no fenced body",
    );
  }
  if (fences.length > 1) {
    return finding(
      "GOV2_BOOTSTRAP_CURRENT_RECORD_NOT_UNIQUE",
      "current-record",
      "CURRENT pre-GOV2 STATE record has multiple fenced bodies",
    );
  }
  return { ok: true, fence: fences[0][1] ?? "" };
}

function compactSliceId(sliceId) {
  if (typeof sliceId !== "string" || !/^IMP-\d+[A-Z]?$/.test(sliceId)) {
    return null;
  }
  return sliceId.replace(/-/g, "");
}

function booleanFrom(assignments, keys, path, code) {
  for (const key of keys) {
    const entry = assignments.get(key);
    if (!entry) continue;
    if (entry.values.size > 1) {
      return {
        ok: false,
        finding: finding(code, path, `${key} is ambiguous in the CURRENT pre-GOV2 record`),
      };
    }
    const upper = entry.value.toUpperCase();
    if (YES.has(upper)) {
      return { ok: true, value: true };
    }
    if (NO.has(upper)) {
      return { ok: true, value: false };
    }
    return {
      ok: false,
      finding: finding(code, path, `${key}=${JSON.stringify(entry.value)} is not a boolean execution value`),
    };
  }
  return { ok: false, finding: finding(code, path, `${path} is missing from the CURRENT pre-GOV2 record`) };
}

function founderUatFrom(assignments, compact) {
  const keys = [`${compact}_FOUNDER_UAT`, "FOUNDER_UAT"];
  for (const key of keys) {
    const entry = assignments.get(key);
    if (!entry) continue;
    if (entry.values.size > 1) {
      return finding("GOV2_BOOTSTRAP_EXECUTION_AMBIGUOUS", "founderUat", `${key} is ambiguous in the CURRENT pre-GOV2 record`);
    }
    if (!Object.values(FOUNDER_UAT).includes(entry.value)) {
      return finding(
        "GOV2_BOOTSTRAP_EXECUTION_MISSING",
        "founderUat",
        `${key}=${JSON.stringify(entry.value)} is not a founderUat value`,
      );
    }
    return { ok: true, value: entry.value };
  }
  return finding("GOV2_BOOTSTRAP_EXECUTION_MISSING", "founderUat", "Founder UAT is missing from the CURRENT pre-GOV2 record");
}

function trancheStatusFrom(assignments, compact, tranche) {
  const id = tranche.id;
  const numbered = /^T(\d+)$/.exec(id);
  const keys = [];
  if (numbered) keys.push(`${compact}_TRANCHE_${numbered[1]}`);
  keys.push(`${compact}_${id}`);
  keys.push(id);
  for (const key of keys) {
    const entry = assignments.get(key);
    if (!entry) continue;
    if (entry.values.size > 1) {
      return finding(
        "GOV2_BOOTSTRAP_EXECUTION_AMBIGUOUS",
        `implementation.trancheStatuses.${id}`,
        `${key} is ambiguous in the CURRENT pre-GOV2 record`,
      );
    }
    if (entry.value === TRANCHE_STATUS.PASS || entry.value === TRANCHE_STATUS.NOT_STARTED) {
      return { ok: true, status: entry.value };
    }
    return finding(
      "GOV2_BOOTSTRAP_EXECUTION_MISSING",
      `implementation.trancheStatuses.${id}`,
      `${key}=${JSON.stringify(entry.value)} is not a tranche status`,
    );
  }
  const started = assignments.get(`${id}_STARTED`);
  if (started) {
    if (started.values.size > 1) {
      return finding(
        "GOV2_BOOTSTRAP_EXECUTION_AMBIGUOUS",
        `implementation.trancheStatuses.${id}`,
        `${id}_STARTED is ambiguous in the CURRENT pre-GOV2 record`,
      );
    }
    if (started.value === "NO") return { ok: true, status: TRANCHE_STATUS.NOT_STARTED };
    return finding(
      "GOV2_BOOTSTRAP_EXECUTION_MISSING",
      `implementation.trancheStatuses.${id}`,
      `${id}_STARTED=${JSON.stringify(started.value)} does not prove PASS or NOT_STARTED`,
    );
  }
  if (tranche.required === true) {
    return finding(
      "GOV2_BOOTSTRAP_EXECUTION_MISSING",
      `implementation.trancheStatuses.${id}`,
      `required tranche ${id} is missing from the CURRENT pre-GOV2 record`,
    );
  }
  return { ok: true, status: null };
}

function lastTransitionFrom(assignments, statuses, plan) {
  const lastPass = [...trancheList(plan)]
    .filter((tranche) => tranche?.id)
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0) || String(left.id).localeCompare(String(right.id)))
    .filter((tranche) => statuses[tranche.id] === TRANCHE_STATUS.PASS)
    .at(-1);
  if (!lastPass) {
    return { ok: true, value: null };
  }
  const prEntry = assignments.get("IMPLEMENTATION_PR");
  const mergeEntry = assignments.get("IMPLEMENTATION_MERGE_MAIN");
  let sourcePr = null;
  if (prEntry) {
    if (prEntry.values.size > 1) {
      return finding("GOV2_BOOTSTRAP_EXECUTION_AMBIGUOUS", "lastTransition.sourcePr", "IMPLEMENTATION_PR is ambiguous");
    }
    const parsed = /^#?(\d+)$/.exec(prEntry.value);
    sourcePr = parsed ? Number(parsed[1]) : prEntry.value;
    if (!isPositiveSourcePr(sourcePr)) {
      return finding(
        "GOV2_BOOTSTRAP_EXECUTION_MISSING",
        "lastTransition.sourcePr",
        `IMPLEMENTATION_PR=${JSON.stringify(prEntry.value)} is not a positive pull-request number`,
      );
    }
  }
  let mergeCommit = null;
  if (mergeEntry) {
    if (mergeEntry.values.size > 1) {
      return finding("GOV2_BOOTSTRAP_EXECUTION_AMBIGUOUS", "lastTransition.mergeCommit", "IMPLEMENTATION_MERGE_MAIN is ambiguous");
    }
    mergeCommit = mergeEntry.value;
    if (typeof mergeCommit !== "string" || !SHA1_RE.test(mergeCommit)) {
      return finding(
        "GOV2_BOOTSTRAP_EXECUTION_MISSING",
        "lastTransition.mergeCommit",
        "IMPLEMENTATION_MERGE_MAIN is not a valid mergeCommit",
      );
    }
  }
  return {
    ok: true,
    value: {
      type: "TRANCHE_PASS",
      tranche: lastPass.id,
      sourcePr,
      mergeCommit,
    },
  };
}

function authorizedFrom(assignments, compact, statuses) {
  const explicit = booleanFrom(
    assignments,
    [`${compact}_IMPLEMENTATION_AUTHORIZED`],
    "implementation.authorized",
    "GOV2_BOOTSTRAP_EXECUTION_MISSING",
  );
  if (explicit.ok) return explicit;
  const authorization = assignments.get(`${compact}_IMPLEMENTATION_AUTHORIZATION`);
  if (authorization && authorization.values.size === 1 && YES.has(authorization.value.toUpperCase())) {
    return { ok: true, value: true };
  }
  const started = booleanFrom(
    assignments,
    [`${compact}_IMPLEMENTATION_STARTED`, `${compact}_STARTED`],
    "implementation.authorized",
    "GOV2_BOOTSTRAP_EXECUTION_MISSING",
  );
  if (started.ok) return started;
  if (Object.values(statuses).some((status) => status === TRANCHE_STATUS.PASS)) {
    return { ok: true, value: true };
  }
  return explicit;
}

/**
 * Derive current execution from exact pre-GOV2 STATE plus the head tranche plan IDs.
 *
 * @param {string} baseStateText
 * @param {object} headPlan
 */
export function extractPreGov2CurrentExecution(baseStateText, headPlan) {
  const findings = [];
  if (typeof baseStateText !== "string") {
    return { ...aggregate([finding("INVALID_STATE", "base", "pre-GOV2 STATE text is required")]), execution: null };
  }
  if (headPlan == null || typeof headPlan !== "object" || Array.isArray(headPlan)) {
    return { ...aggregate([finding("EMPTY_TRANCHE_PLAN", "plan", "head tranche plan is required")]), execution: null };
  }

  const meta = parseCurrentGovernanceMeta(baseStateText, CURRENT_AUTHORITY_KIND.STATE);
  if (meta.ok !== true) {
    return { ...aggregate([meta]), execution: null };
  }
  const currentSlice = meta.meta.currentProductSlice;
  if (typeof currentSlice !== "string" || currentSlice.length === 0) {
    findings.push(
      finding("GOV2_BOOTSTRAP_EXECUTION_MISSING", "currentSlice", "CURRENT governance-meta currentProductSlice is required"),
    );
    return { ...aggregate(findings), execution: null };
  }
  const compact = compactSliceId(currentSlice);
  if (!compact) {
    findings.push(
      finding("GOV2_BOOTSTRAP_EXECUTION_MISSING", "currentSlice", "CURRENT currentProductSlice is not a formal IMP id"),
    );
    return { ...aggregate(findings), execution: null };
  }

  const record = extractUniqueCurrentRecordFence(baseStateText, meta.meta.stateVersion);
  if (record.ok !== true) {
    return { ...aggregate([record]), execution: null };
  }
  const assignments = parseRecordAssignments(record.fence);
  for (const [key, entry] of assignments) {
    if (entry.values.size > 1) {
      findings.push(
        finding("GOV2_BOOTSTRAP_EXECUTION_AMBIGUOUS", key, `${key} has conflicting values in the CURRENT pre-GOV2 record`),
      );
    }
  }
  if (findings.length > 0) return { ...aggregate(findings), execution: null };

  const statuses = {};
  for (const tranche of trancheList(headPlan)) {
    if (!tranche?.id) continue;
    const mapped = trancheStatusFrom(assignments, compact, tranche);
    if (mapped.ok !== true) {
      findings.push(mapped);
      continue;
    }
    statuses[tranche.id] = mapped.status;
  }

  const complete = booleanFrom(
    assignments,
    [`${compact}_IMPLEMENTATION_COMPLETE`],
    "implementation.complete",
    "GOV2_BOOTSTRAP_EXECUTION_MISSING",
  );
  const accepted = booleanFrom(assignments, [`${compact}_ACCEPTED`], "accepted", "GOV2_BOOTSTRAP_EXECUTION_MISSING");
  const founderUat = founderUatFrom(assignments, compact);
  if (complete.ok !== true) findings.push(complete.finding);
  if (accepted.ok !== true) findings.push(accepted.finding);
  if (founderUat.ok !== true) findings.push(founderUat);

  const authorized = authorizedFrom(assignments, compact, statuses);
  if (authorized.ok !== true) findings.push(authorized.finding);

  const lastTransition = lastTransitionFrom(assignments, statuses, headPlan);
  if (lastTransition.ok !== true) findings.push(lastTransition);

  if (findings.length > 0) return { ...aggregate(findings), execution: null };

  return {
    ok: true,
    findings: [],
    execution: {
      currentSlice,
      authorized: authorized.value,
      complete: complete.value,
      founderUat: founderUat.value,
      accepted: accepted.value,
      trancheStatuses: statuses,
      lastTransition: lastTransition.value,
    },
  };
}

/**
 * @param {object} headState
 * @param {object} headPlan
 */
export function extractGov2Execution(headState, headPlan) {
  if (headState == null || typeof headState !== "object" || Array.isArray(headState)) {
    return { ...aggregate([finding("INVALID_STATE", "head", "head GOV-2 state is required")]), execution: null };
  }
  const implementation =
    headState.implementation != null && typeof headState.implementation === "object" && !Array.isArray(headState.implementation)
      ? headState.implementation
      : {};
  const rawStatuses =
    implementation.trancheStatuses != null &&
    typeof implementation.trancheStatuses === "object" &&
    !Array.isArray(implementation.trancheStatuses)
      ? implementation.trancheStatuses
      : {};
  /** @type {Record<string, string | null>} */
  const statuses = {};
  for (const tranche of trancheList(headPlan)) {
    if (!tranche?.id) continue;
    statuses[tranche.id] = Object.hasOwn(rawStatuses, tranche.id) ? rawStatuses[tranche.id] : null;
  }
  const lastTransition =
    headState.lastTransition != null && typeof headState.lastTransition === "object" && !Array.isArray(headState.lastTransition)
      ? {
          type: headState.lastTransition.type ?? null,
          tranche: headState.lastTransition.tranche ?? null,
          sourcePr: headState.lastTransition.sourcePr ?? null,
          mergeCommit: headState.lastTransition.mergeCommit ?? null,
        }
      : null;
  return {
    ok: true,
    findings: [],
    execution: {
      currentSlice: headState.currentSlice ?? null,
      authorized: implementation.authorized,
      complete: implementation.complete,
      founderUat: headState.founderUat ?? null,
      accepted: headState.accepted,
      trancheStatuses: statuses,
      lastTransition,
    },
  };
}

function statusEquivalent(baseStatus, headStatus) {
  if (baseStatus === headStatus) return true;
  if ((baseStatus == null || baseStatus === TRANCHE_STATUS.NOT_STARTED) && (headStatus == null || headStatus === TRANCHE_STATUS.NOT_STARTED)) {
    return true;
  }
  return false;
}

function lastTransitionEquivalent(base, head) {
  if (base == null && head == null) return true;
  if (base == null || head == null) return false;
  if (base.type !== head.type || base.tranche !== head.tranche) return false;
  if (base.sourcePr != null && base.sourcePr !== head.sourcePr) return false;
  if (base.mergeCommit != null && base.mergeCommit !== head.mergeCommit) return false;
  return true;
}

/**
 * @param {object} baseExecution
 * @param {object} headExecution
 */
export function bootstrapExecutionFindings(baseExecution, headExecution) {
  const findings = [];
  if (baseExecution.currentSlice !== headExecution.currentSlice) {
    findings.push(
      finding(
        "GOV2_BOOTSTRAP_EXECUTION_MISMATCH",
        "currentSlice",
        `BASE_CURRENT_EXECUTION currentSlice=${JSON.stringify(baseExecution.currentSlice)} HEAD_GOV2_EXECUTION currentSlice=${JSON.stringify(headExecution.currentSlice)}`,
      ),
    );
  }
  const pairs = [
    ["authorized", "implementation.authorized"],
    ["complete", "implementation.complete"],
    ["founderUat", "founderUat"],
    ["accepted", "accepted"],
  ];
  for (const [field, path] of pairs) {
    if (baseExecution[field] !== headExecution[field]) {
      findings.push(
        finding(
          "GOV2_BOOTSTRAP_EXECUTION_MISMATCH",
          path,
          `BASE_CURRENT_EXECUTION ${field}=${JSON.stringify(baseExecution[field])} HEAD_GOV2_EXECUTION ${field}=${JSON.stringify(headExecution[field])}`,
        ),
      );
    }
  }
  const ids = new Set([...Object.keys(baseExecution.trancheStatuses ?? {}), ...Object.keys(headExecution.trancheStatuses ?? {})]);
  for (const id of ids) {
    const from = baseExecution.trancheStatuses?.[id];
    const to = headExecution.trancheStatuses?.[id];
    if (!statusEquivalent(from, to)) {
      findings.push(
        finding(
          "GOV2_BOOTSTRAP_EXECUTION_MISMATCH",
          `implementation.trancheStatuses.${id}`,
          `BASE_CURRENT_EXECUTION ${id}=${JSON.stringify(from)} HEAD_GOV2_EXECUTION ${id}=${JSON.stringify(to)}`,
        ),
      );
    }
  }
  if (!lastTransitionEquivalent(baseExecution.lastTransition, headExecution.lastTransition)) {
    findings.push(
      finding(
        "GOV2_BOOTSTRAP_EXECUTION_MISMATCH",
        "lastTransition",
        `BASE_CURRENT_EXECUTION lastTransition=${JSON.stringify(baseExecution.lastTransition)} HEAD_GOV2_EXECUTION lastTransition=${JSON.stringify(headExecution.lastTransition)}`,
      ),
    );
  }
  return findings;
}
