#!/usr/bin/env node
/**
 * IMP-038 §15 SCA gate — npm audit with deterministic exception filtering.
 *
 * Policy: fail on high and critical unless covered by an ACTIVE row in
 * docs/platform/security/vulnerability-exception-register.md.
 *
 * Usage:
 *   node scripts/audit-npm-sca.mjs
 *   npm run audit:npm-sca
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const REGISTER_REL = "docs/platform/security/vulnerability-exception-register.md";
const POLICY_LEVELS = new Set(["high", "critical"]);
const SEVERITY_RANK = Object.freeze({
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
});

export const REQUIRED_HEADERS = Object.freeze([
  "id",
  "package/cve",
  "severity",
  "owner",
  "rationale",
  "authority",
  "compensating_controls",
  "retest_date",
  "expiry",
]);

/**
 * @param {string} iso
 * @returns {boolean}
 */
export function isIsoDate(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso);
}

/**
 * @param {string} todayIso UTC YYYY-MM-DD
 * @param {string} expiryIso
 */
export function isActiveExpiry(todayIso, expiryIso) {
  if (!isIsoDate(todayIso) || !isIsoDate(expiryIso)) return false;
  return expiryIso >= todayIso;
}

/**
 * Parse Active exceptions table from the register markdown.
 * @param {string} markdown
 * @returns {{ rows: Array<Record<string, string>>, errors: string[] }}
 */
export function parseExceptionRegister(markdown) {
  const errors = [];
  const sectionMatch = markdown.match(/^## Active exceptions\s*$/m);
  if (!sectionMatch || sectionMatch.index === undefined) {
    return { rows: [], errors: ["MISSING_ACTIVE_EXCEPTIONS_SECTION"] };
  }
  const after = markdown.slice(sectionMatch.index + sectionMatch[0].length);
  const lines = after
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const tableLines = [];
  for (const line of lines) {
    if (!line.startsWith("|")) break;
    tableLines.push(line);
  }
  if (tableLines.length < 2) {
    return { rows: [], errors: ["MISSING_EXCEPTION_TABLE"] };
  }

  const headerCells = splitRow(tableLines[0]);
  const sep = tableLines[1];
  if (!/^\|[\s:-]+\|/.test(sep)) {
    errors.push("INVALID_TABLE_SEPARATOR");
  }
  if (headerCells.length !== REQUIRED_HEADERS.length) {
    errors.push(
      `HEADER_COUNT_MISMATCH expected=${REQUIRED_HEADERS.length} got=${headerCells.length}`,
    );
  }
  for (let i = 0; i < REQUIRED_HEADERS.length; i += 1) {
    const got = (headerCells[i] || "").toLowerCase();
    if (got !== REQUIRED_HEADERS[i]) {
      errors.push(`HEADER_MISMATCH col=${i} expected=${REQUIRED_HEADERS[i]} got=${got || "<missing>"}`);
    }
  }

  /** @type {Array<Record<string, string>>} */
  const rows = [];
  for (let i = 2; i < tableLines.length; i += 1) {
    const cells = splitRow(tableLines[i]);
    if (cells.every((c) => c === "")) continue;
    if (cells.length !== REQUIRED_HEADERS.length) {
      errors.push(`ROW_COL_COUNT id=${cells[0] || "?"} expected=${REQUIRED_HEADERS.length} got=${cells.length}`);
      continue;
    }
    /** @type {Record<string, string>} */
    const row = {};
    for (let c = 0; c < REQUIRED_HEADERS.length; c += 1) {
      row[REQUIRED_HEADERS[c]] = cells[c];
    }
    for (const key of REQUIRED_HEADERS) {
      if (!row[key]) errors.push(`EMPTY_FIELD id=${row.id || "?"} field=${key}`);
    }
    if (row.expiry && !isIsoDate(row.expiry)) {
      errors.push(`INVALID_EXPIRY id=${row.id || "?"} value=${row.expiry}`);
    }
    if (row.retest_date && !isIsoDate(row.retest_date)) {
      errors.push(`INVALID_RETEST_DATE id=${row.id || "?"} value=${row.retest_date}`);
    }
    rows.push(row);
  }

  return { rows, errors };
}

/**
 * @param {string} line
 * @returns {string[]}
 */
function splitRow(line) {
  const trimmed = line.replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

/**
 * Tokens from package/cve cell (comma/space separated).
 * @param {string} cell
 * @returns {string[]}
 */
export function tokenizePackageCve(cell) {
  return cell
    .split(/[,;\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Extract GHSA / CVE / source identity tokens from a via object or string.
 * Does **not** include the npm package name — package-name coverage is separate
 * (register contract) so one advisory identity cannot blanket another.
 * @param {unknown} via
 * @returns {Set<string>}
 */
export function collectAdvisoryIdentityKeys(via) {
  const keys = new Set();
  if (typeof via === "string") {
    const lowered = via.toLowerCase();
    const ghsa = lowered.match(/ghsa-[a-z0-9-]+/);
    if (ghsa) keys.add(ghsa[0]);
    const cve = lowered.match(/cve-\d{4}-\d+/);
    if (cve) keys.add(cve[0]);
    if (ghsa || cve) keys.add(lowered);
    return keys;
  }
  if (!via || typeof via !== "object") return keys;
  const obj = /** @type {Record<string, unknown>} */ (via);
  for (const field of ["source", "url", "cve", "title", "name", "id"]) {
    const val = obj[field];
    if (typeof val === "string" && val) {
      keys.add(val.toLowerCase());
      const ghsa = val.match(/GHSA-[a-z0-9-]+/i);
      if (ghsa) keys.add(ghsa[0].toLowerCase());
      const cve = val.match(/CVE-\d{4}-\d+/i);
      if (cve) keys.add(cve[0].toLowerCase());
    }
  }
  if (typeof obj.source === "number") {
    keys.add(String(obj.source));
  }
  return keys;
}

/**
 * Collect match keys from an npm audit vulnerability entry (legacy aggregate).
 * Prefer {@link extractPolicyAdvisories} for gate evaluation.
 * @param {string} packageName
 * @param {{ via?: unknown[], severity?: string }} entry
 * @returns {Set<string>}
 */
export function collectFindingKeys(packageName, entry) {
  const keys = new Set([packageName.toLowerCase()]);
  for (const via of entry.via || []) {
    if (typeof via === "string") {
      // Dependency-path strings are not advisory identities for coverage.
      continue;
    }
    for (const k of collectAdvisoryIdentityKeys(via)) keys.add(k);
  }
  return keys;
}

/**
 * @param {string} exceptionSeverity
 * @param {string} findingSeverity
 */
export function exceptionCoversSeverity(exceptionSeverity, findingSeverity) {
  const exceptionRank = SEVERITY_RANK[String(exceptionSeverity || "").toLowerCase()] || 0;
  const findingRank = SEVERITY_RANK[String(findingSeverity || "").toLowerCase()] || 0;
  return exceptionRank >= findingRank && findingRank > 0;
}

/**
 * @param {Record<string, unknown>} vulnerabilities
 * @param {string} packageName
 * @returns {{ key: string, entry: { via?: unknown[], severity?: string, range?: string } } | null}
 */
function lookupVulnerabilityEntry(vulnerabilities, packageName) {
  if (!vulnerabilities || typeof vulnerabilities !== "object") return null;
  if (Object.prototype.hasOwnProperty.call(vulnerabilities, packageName)) {
    return {
      key: packageName,
      entry: /** @type {{ via?: unknown[], severity?: string, range?: string }} */ (
        vulnerabilities[packageName]
      ),
    };
  }
  const lowered = packageName.toLowerCase();
  for (const key of Object.keys(vulnerabilities)) {
    if (key.toLowerCase() === lowered) {
      return {
        key,
        entry: /** @type {{ via?: unknown[], severity?: string, range?: string }} */ (
          vulnerabilities[key]
        ),
      };
    }
  }
  return null;
}

/**
 * @param {{ packageName: string, severity: string, identityKeys: Set<string>, label: string, reason?: string, missingTarget?: string }} advisory
 */
export function stableAdvisoryIdentity(advisory) {
  if (advisory.reason === "CYCLE") {
    return `cycle:${advisory.packageName.toLowerCase()}`;
  }
  if (advisory.reason === "MISSING") {
    return `missing:${advisory.packageName.toLowerCase()}->${String(advisory.missingTarget || "").toLowerCase()}`;
  }
  const identity = [...advisory.identityKeys]
    .filter((k) => k.startsWith("ghsa-") || k.startsWith("cve-") || /^\d+$/.test(k) || k.startsWith("source:"))
    .sort();
  if (identity.length > 0) {
    return `adv:${identity.join("|")}:${advisory.severity}`;
  }
  if (advisory.identityKeys.size > 0) {
    return `adv:${[...advisory.identityKeys].sort().join("|")}:${advisory.severity}`;
  }
  return `pkg:${advisory.packageName.toLowerCase()}:${advisory.severity}:${advisory.label}`;
}

function structuredAdvisoryLabel(packageName, identityKeys, obj) {
  const labelParts = [...identityKeys].filter((k) => k.startsWith("ghsa-") || k.startsWith("cve-"));
  if (labelParts[0]) return labelParts[0];
  if (typeof obj.source === "number") return `source:${obj.source}`;
  return `${packageName}@advisory`;
}

/**
 * Expand one package against the audit vulnerability graph.
 * Structured `via` objects are independent advisories.
 * String `via` values are inherited dependency links and are resolved recursively.
 *
 * @param {string} packageName
 * @param {Record<string, { via?: unknown[], severity?: string, range?: string }>} vulnerabilities
 * @param {Set<string>} [visiting]
 * @param {Map<string, Array<object>>} [memo]
 */
export function resolvePolicyAdvisories(
  packageName,
  vulnerabilities,
  visiting = new Set(),
  memo = new Map(),
) {
  const cacheKey = packageName.toLowerCase();
  if (memo.has(cacheKey)) return memo.get(cacheKey);
  if (visiting.has(cacheKey)) {
    const found = lookupVulnerabilityEntry(vulnerabilities, packageName);
    const severity = String(found?.entry?.severity || "").toLowerCase();
    if (!POLICY_LEVELS.has(severity)) return [];
    return [
      {
        packageName: found?.key || packageName,
        severity,
        identityKeys: new Set(),
        label: `${found?.key || packageName}@cycle`,
        reason: "CYCLE",
        failClosed: true,
        hasInheritedRefs: true,
      },
    ];
  }

  const found = lookupVulnerabilityEntry(vulnerabilities, packageName);
  if (!found) {
    return [];
  }

  visiting.add(cacheKey);
  const entry = found.entry || {};
  const viaList = Array.isArray(entry.via) ? entry.via : [];
  const objectVias = viaList.filter((v) => v && typeof v === "object");
  const stringVias = viaList.filter((v) => typeof v === "string" && v.trim());
  /** @type {Array<object>} */
  const advisories = [];

  for (const via of objectVias) {
    const obj = /** @type {Record<string, unknown>} */ (via);
    const severity = String(obj.severity || entry.severity || "").toLowerCase();
    if (!POLICY_LEVELS.has(severity)) continue;
    const identityKeys = collectAdvisoryIdentityKeys(via);
    advisories.push({
      packageName: found.key,
      severity,
      range: typeof obj.range === "string" ? obj.range : entry.range,
      identityKeys,
      label: structuredAdvisoryLabel(found.key, identityKeys, obj),
      reason: "STRUCTURED",
      hasInheritedRefs: false,
    });
  }

  for (const ref of stringVias) {
    const refName = ref.trim();
    const child = lookupVulnerabilityEntry(vulnerabilities, refName);
    if (!child) {
      const parentSeverity = String(entry.severity || "").toLowerCase();
      if (!POLICY_LEVELS.has(parentSeverity)) continue;
      advisories.push({
        packageName: found.key,
        severity: parentSeverity,
        range: entry.range,
        identityKeys: new Set(),
        label: `${refName}@unresolved`,
        reason: "MISSING",
        missingTarget: refName,
        failClosed: true,
        hasInheritedRefs: true,
      });
      continue;
    }
    advisories.push(...resolvePolicyAdvisories(child.key, vulnerabilities, visiting, memo));
  }

  if (objectVias.length === 0 && stringVias.length === 0) {
    const severity = String(entry.severity || "").toLowerCase();
    if (POLICY_LEVELS.has(severity)) {
      advisories.push({
        packageName: found.key,
        severity,
        range: entry.range,
        identityKeys: new Set(),
        label: `${found.key}@package`,
        reason: "OPAQUE",
        hasInheritedRefs: false,
      });
    }
  } else if (
    objectVias.length === 0 &&
    stringVias.length > 0 &&
    advisories.length === 0 &&
    POLICY_LEVELS.has(String(entry.severity || "").toLowerCase())
  ) {
    advisories.push({
      packageName: found.key,
      severity: String(entry.severity).toLowerCase(),
      range: entry.range,
      identityKeys: new Set(),
      label: `${found.key}@unresolved-inherited`,
      reason: "EMPTY_INHERITED",
      failClosed: true,
      hasInheritedRefs: true,
    });
  }

  visiting.delete(cacheKey);
  memo.set(cacheKey, advisories);
  return advisories;
}

/**
 * Expand a package audit entry into individual High/Critical advisories.
 * When `vulnerabilities` is omitted, string `via` targets fail closed as missing.
 *
 * @param {string} packageName
 * @param {{ via?: unknown[], severity?: string, range?: string }} entry
 * @param {Record<string, { via?: unknown[], severity?: string, range?: string }>} [vulnerabilities]
 */
export function extractPolicyAdvisories(packageName, entry, vulnerabilities) {
  const graph = vulnerabilities || { [packageName]: entry };
  if (!vulnerabilities) {
    graph[packageName] = entry;
  }
  return resolvePolicyAdvisories(packageName, graph);
}

/**
 * @param {Array<Record<string, string>>} rows
 * @param {string} todayIso
 */
export function activeExceptions(rows, todayIso) {
  return rows.filter((row) => isActiveExpiry(todayIso, row.expiry));
}

/**
 * Cover an advisory when an ACTIVE exception token matches its structured
 * identity (exact GHSA/CVE/source) and the row severity is at least the
 * finding severity.
 *
 * A package-name token may cover only an opaque package-level finding that
 * has no structured advisory identity and no inherited dependency reference.
 * It never blankets GHSA/CVE advisories, inherited nodes, or fail-closed
 * unresolved/cycle diagnostics. One matched GHSA/CVE never covers a sibling.
 *
 * @param {{ packageName: string, severity: string, identityKeys: Set<string>, reason?: string, failClosed?: boolean, hasInheritedRefs?: boolean }} advisory
 * @param {Array<Record<string, string>>} activeRows
 */
export function findCoveringExceptionForAdvisory(advisory, activeRows) {
  if (advisory.failClosed) return null;
  const pkg = advisory.packageName.toLowerCase();
  const hasStructuredIdentity = advisory.identityKeys.size > 0;
  const allowPackageNameToken =
    !hasStructuredIdentity &&
    !advisory.hasInheritedRefs &&
    advisory.reason === "OPAQUE";
  for (const row of activeRows) {
    if (!exceptionCoversSeverity(row.severity, advisory.severity)) continue;
    const tokens = tokenizePackageCve(row["package/cve"]);
    for (const token of tokens) {
      if (hasStructuredIdentity && advisory.identityKeys.has(token)) return row;
      if (allowPackageNameToken && token === pkg) return row;
    }
  }
  return null;
}

/**
 * @deprecated Prefer findCoveringExceptionForAdvisory — aggregate key matching
 * can suppress sibling advisories. Kept for transitional unit tests.
 * @param {Set<string>} findingKeys
 * @param {Array<Record<string, string>>} activeRows
 */
export function findCoveringException(findingKeys, activeRows) {
  for (const row of activeRows) {
    const tokens = tokenizePackageCve(row["package/cve"]);
    if (tokens.some((t) => findingKeys.has(t))) {
      return row;
    }
  }
  return null;
}

/**
 * Fail-closed filter: every High/Critical advisory must be individually covered.
 *
 * @param {Record<string, { severity?: string, via?: unknown[], range?: string }>} vulnerabilities
 * @param {Array<Record<string, string>>} activeRows
 */
export function filterUncoveredPolicyFindings(vulnerabilities, activeRows) {
  /** @type {Array<{ packageName: string, severity: string, range?: string, keys: string[], label: string }>} */
  const uncovered = [];
  const seen = new Set();
  const graph = vulnerabilities || {};
  const visiting = new Set();
  const memo = new Map();
  for (const packageName of Object.keys(graph)) {
    const entry = graph[packageName] || {};
    const packageSeverity = String(entry.severity || "").toLowerCase();
    const hasStructuredPolicyVia = (Array.isArray(entry.via) ? entry.via : []).some((v) => {
      if (!v || typeof v !== "object") return false;
      const viaSev = String(/** @type {Record<string, unknown>} */ (v).severity || entry.severity || "").toLowerCase();
      return POLICY_LEVELS.has(viaSev);
    });
    if (!POLICY_LEVELS.has(packageSeverity) && !hasStructuredPolicyVia) continue;
    const advisories = resolvePolicyAdvisories(packageName, graph, visiting, memo);
    for (const advisory of advisories) {
      const identity = stableAdvisoryIdentity(advisory);
      if (seen.has(identity)) continue;
      seen.add(identity);
      const cover = findCoveringExceptionForAdvisory(advisory, activeRows);
      if (!cover) {
        uncovered.push({
          packageName: advisory.packageName,
          severity: advisory.severity,
          range: advisory.range,
          keys: [...advisory.identityKeys].sort(),
          label: advisory.label,
        });
      }
    }
  }
  uncovered.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
    if (a.packageName !== b.packageName) {
      return a.packageName < b.packageName ? -1 : 1;
    }
    return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
  });
  return uncovered;
}

/**
 * @param {string} [cwd]
 */
export function runNpmAuditJson(cwd = projectRoot) {
  const result = spawnSync("npm", ["audit", "--json"], {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    env: process.env,
  });
  const stdout = result.stdout || "";
  let report;
  try {
    report = JSON.parse(stdout);
  } catch {
    return {
      ok: false,
      error: `NPM_AUDIT_JSON_PARSE_FAILED exit=${result.status} stderr=${(result.stderr || "").slice(0, 500)}`,
      report: null,
    };
  }
  return { ok: true, error: null, report, status: result.status };
}

export function utcTodayIso(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function main() {
  const registerPath = path.join(projectRoot, REGISTER_REL);
  let markdown;
  try {
    markdown = readFileSync(registerPath, "utf8");
  } catch {
    console.error(`FAIL: missing exception register at ${REGISTER_REL}`);
    process.exit(1);
  }

  const { rows, errors } = parseExceptionRegister(markdown);
  if (errors.length > 0) {
    console.error("FAIL: exception register parse errors:");
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  const today = utcTodayIso();
  const active = activeExceptions(rows, today);
  for (const row of rows) {
    if (!isActiveExpiry(today, row.expiry)) {
      console.log(`INFO: expired/inactive exception ${row.id} expiry=${row.expiry}`);
    }
  }

  const audit = runNpmAuditJson();
  if (!audit.ok || !audit.report) {
    console.error(`FAIL: ${audit.error}`);
    process.exit(1);
  }

  if (audit.report.error) {
    console.error(`FAIL: npm audit error: ${JSON.stringify(audit.report.error)}`);
    process.exit(1);
  }

  const uncovered = filterUncoveredPolicyFindings(audit.report.vulnerabilities || {}, active);
  const meta = audit.report.metadata?.vulnerabilities || {};
  const uncoveredHigh = uncovered.filter((f) => f.severity === "high").length;
  const uncoveredCritical = uncovered.filter((f) => f.severity === "critical").length;
  console.log(
    `SCA policy=high+ today=${today} exceptions_active=${active.length} audit_high=${meta.high ?? "?"} audit_critical=${meta.critical ?? "?"} uncovered_high=${uncoveredHigh} uncovered_critical=${uncoveredCritical}`,
  );

  if (uncovered.length > 0) {
    console.error(`FAIL: ${uncovered.length} uncovered high/critical advisory(ies):`);
    for (const finding of uncovered) {
      console.error(
        `  - ${finding.severity.toUpperCase()} ${finding.packageName} advisory=${finding.label} range=${finding.range || "?"} keys=${finding.keys.slice(0, 8).join(",")}`,
      );
    }
    console.error(
      `Add a Founder-authorized row to ${REGISTER_REL} or upgrade the dependency. Fail closed.`,
    );
    process.exit(1);
  }

  console.log("PASS: npm SCA gate (high/critical covered or absent)");
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
