/**
 * Generic tranche graph: declared order versus dependency eligibility.
 * NON_AUTHORITATIVE in PR A. No capability-specific conditionals.
 */
import { TRANCHE_STATUS, TRANCHE_STATUS_SET, aggregate, finding } from "./model.mjs";

/**
 * @param {object} plan
 * @returns {{ ok: boolean, findings: object[] }}
 */
export function validateTranchePlan(plan) {
  const findings = [];
  const tranches = plan?.tranches;
  if (!Array.isArray(tranches) || tranches.length === 0) {
    return aggregate([finding("EMPTY_TRANCHE_PLAN", "tranches", "tranche plan must declare at least one tranche")]);
  }

  const ids = new Set();
  for (const [index, tranche] of tranches.entries()) {
    const path = `tranches[${index}]`;
    if (!tranche?.id || typeof tranche.id !== "string") {
      findings.push(finding("INVALID_TRANCHE_ID", `${path}.id`, "tranche id is required"));
      continue;
    }
    if (ids.has(tranche.id)) {
      findings.push(finding("DUPLICATE_TRANCHE_ID", `${path}.id`, `duplicate tranche id ${tranche.id}`));
    }
    ids.add(tranche.id);
    if (!Number.isInteger(tranche.order) || tranche.order < 1) {
      findings.push(
        finding("INVALID_TRANCHE_ORDER", `${path}.order`, `tranche ${tranche.id} must declare a unique positive integer order`),
      );
    }
    if (tranche.required !== true && tranche.required !== false) {
      findings.push(finding("INVALID_TRANCHE_REQUIRED", `${path}.required`, `tranche ${tranche.id} must be required or optional`));
    }
    if (!Array.isArray(tranche.dependencies)) {
      findings.push(finding("INVALID_DEPENDENCIES", `${path}.dependencies`, `tranche ${tranche.id} dependencies must be an array`));
    }
  }

  const orders = new Map();
  for (const [index, tranche] of tranches.entries()) {
    if (!Number.isInteger(tranche?.order) || tranche.order < 1) continue;
    const prior = orders.get(tranche.order);
    if (prior != null) {
      findings.push(
        finding(
          "DUPLICATE_TRANCHE_ORDER",
          `tranches[${index}].order`,
          `duplicate declared order ${tranche.order} for ${prior} and ${tranche.id}`,
        ),
      );
    } else {
      orders.set(tranche.order, tranche.id);
    }
  }

  const known = new Set(tranches.map((tranche) => tranche.id).filter(Boolean));
  for (const [index, tranche] of tranches.entries()) {
    if (!Array.isArray(tranche?.dependencies)) continue;
    const seenDeps = new Set();
    const pathId = typeof tranche?.id === "string" && tranche.id.length > 0 ? tranche.id : String(index);
    for (const dependency of tranche.dependencies) {
      if (typeof dependency !== "string" || dependency.length === 0) {
        findings.push(
          finding(
            "INVALID_DEPENDENCY",
            `tranches.${pathId}.dependencies`,
            `tranche ${pathId} has a malformed dependency`,
          ),
        );
        continue;
      }
      if (seenDeps.has(dependency)) {
        findings.push(
          finding(
            "DUPLICATE_DEPENDENCY",
            `tranches.${tranche.id}.dependencies`,
            `tranche ${tranche.id} declares duplicate dependency ${dependency}`,
          ),
        );
        continue;
      }
      seenDeps.add(dependency);
      if (dependency === tranche.id) {
        findings.push(finding("SELF_DEPENDENCY", `tranches.${tranche.id}.dependencies`, `tranche ${tranche.id} depends on itself`));
      } else if (!known.has(dependency)) {
        findings.push(finding("UNKNOWN_DEPENDENCY", `tranches.${tranche.id}.dependencies`, `tranche ${tranche.id} depends on unknown ${dependency}`));
      }
    }
  }

  findings.push(...cycleFindings(tranches));
  return aggregate(findings);
}

/**
 * @param {object} plan
 * @param {Record<string, string>} statuses
 */
export function validateTrancheStatuses(plan, statuses) {
  const planResult = validateTranchePlan(plan);
  if (!planResult.ok) return planResult;

  const findings = [];
  const declared = new Set(plan.tranches.map((tranche) => tranche.id));
  const statusMap =
    statuses != null && typeof statuses === "object" && !Array.isArray(statuses) ? statuses : {};
  if (statuses != null && (typeof statuses !== "object" || Array.isArray(statuses))) {
    return aggregate([
      finding("INVALID_TRANCHE_STATUSES", "implementation.trancheStatuses", "implementation.trancheStatuses must be an object"),
    ]);
  }

  for (const id of Object.keys(statusMap)) {
    if (!declared.has(id)) {
      findings.push(finding("UNDECLARED_TRANCHE_STATUS", `implementation.trancheStatuses.${id}`, `status recorded for undeclared tranche ${id}`));
    }
  }

  for (const tranche of plan.tranches) {
    const status = statusMap[tranche.id];
    if (status == null) {
      if (tranche.required) {
        findings.push(
          finding(
            "MISSING_REQUIRED_TRANCHE_STATUS",
            `implementation.trancheStatuses.${tranche.id}`,
            `required tranche ${tranche.id} has no status`,
          ),
        );
      }
      continue;
    }
    if (!TRANCHE_STATUS_SET.has(status)) {
      findings.push(
        finding("INVALID_TRANCHE_STATUS", `implementation.trancheStatuses.${tranche.id}`, `invalid status ${JSON.stringify(status)}`),
      );
    }
  }

  return aggregate(findings);
}

/**
 * First required tranche in declared order whose status is not PASS.
 * @param {object} plan
 * @param {Record<string, string>} statuses
 * @returns {string}
 */
export function deriveNextGate(plan, statuses) {
  const ordered = declaredOrder(plan);
  for (const tranche of ordered) {
    if (!tranche.required) continue;
    if (statusMap(statuses)[tranche.id] !== TRANCHE_STATUS.PASS) {
      return tranche.id;
    }
  }
  return "NONE";
}

export function allRequiredTranchesPass(plan, statuses) {
  return trancheList(plan)
    .filter((tranche) => tranche?.required)
    .every((tranche) => statusMap(statuses)[tranche.id] === TRANCHE_STATUS.PASS);
}

export function dependenciesSatisfied(plan, statuses, trancheId) {
  const tranche = trancheList(plan).find((item) => item?.id === trancheId);
  if (!tranche) return false;
  if (!Array.isArray(tranche.dependencies)) return false;
  return tranche.dependencies.every(
    (dependency) => typeof dependency === "string" && statusMap(statuses)[dependency] === TRANCHE_STATUS.PASS,
  );
}

export function declaredOrder(plan) {
  return [...trancheList(plan)].sort((left, right) => (left.order ?? 0) - (right.order ?? 0) || String(left.id ?? "").localeCompare(String(right.id ?? "")));
}

export function trancheList(plan) {
  return Array.isArray(plan?.tranches) ? plan.tranches : [];
}

function statusMap(statuses) {
  return statuses != null && typeof statuses === "object" && !Array.isArray(statuses) ? statuses : {};
}

function cycleFindings(tranches) {
  const byId = new Map(tranches.filter((tranche) => tranche?.id).map((tranche) => [tranche.id, tranche]));
  const visiting = new Set();
  const visited = new Set();
  const findings = [];

  function walk(id, stack) {
    if (visited.has(id) || !byId.has(id)) return;
    if (visiting.has(id)) {
      findings.push(finding("DEPENDENCY_CYCLE", "tranches.dependencies", `dependency cycle: ${[...stack, id].join(" -> ")}`));
      return;
    }
    visiting.add(id);
    const dependencies = byId.get(id)?.dependencies;
    if (!Array.isArray(dependencies)) {
      visiting.delete(id);
      visited.add(id);
      return;
    }
    for (const dependency of dependencies) {
      if (typeof dependency !== "string") continue;
      walk(dependency, [...stack, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of byId.keys()) {
    walk(id, []);
  }
  return findings;
}
