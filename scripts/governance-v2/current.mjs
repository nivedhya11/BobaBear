#!/usr/bin/env node
/**
 * Authoritative GOV-2 current-state validation against live authorities.
 *
 * GOV2_VALIDATION_AUTHORITATIVE = YES
 * GOV2_CUTOVER = NO
 * GOV2_CUTOVER_ACCEPTANCE = NO
 */
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { CURRENT_AUTHORITY_KIND, parseCurrentGovernanceMeta, validateLiveRoadmapStateAlignment } from "./schema.mjs";
import { validateCurrentState } from "./invariants.mjs";
import { loadLiveAuthorities } from "./load-authorities.mjs";
import { readFileSync } from "node:fs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "../..");

export function validateLiveCurrentState(root = DEFAULT_ROOT) {
  const loaded = loadLiveAuthorities(root);
  const roadmapLive = readFileSync(path.join(root, "docs/platform/ROADMAP.md"), "utf8");
  const stateLive = readFileSync(path.join(root, "docs/platform/STATE.md"), "utf8");
  const roadmapMeta = parseCurrentGovernanceMeta(roadmapLive, CURRENT_AUTHORITY_KIND.ROADMAP);
  const stateMeta = parseCurrentGovernanceMeta(stateLive, CURRENT_AUTHORITY_KIND.STATE);
  const liveAlignment = validateLiveRoadmapStateAlignment(roadmapMeta, stateMeta);

  const findings = [...(loaded.ok ? [] : loaded.findings), ...liveAlignment.findings];
  const validation =
    loaded.ok && loaded.roadmap && loaded.state && loaded.plan
      ? validateCurrentState(loaded.state, loaded.plan, loaded.roadmap)
      : { ok: false, findings, nextGate: "NONE", allRequiredTranchesPass: false, derivedStarted: {} };
  findings.push(...validation.findings);

  const derivedT8Started = Boolean(validation.derivedStarted?.T8);
  const t8Status = loaded.state?.implementation?.trancheStatuses?.T8;
  const ok = findings.filter((item) => item && item.ok === false).length === 0 && derivedT8Started === false && t8Status === "NOT_STARTED";

  return {
    GOV2_PHASE: "AUTHORITATIVE_CANDIDATE",
    GOV2_CUTOVER: "NO",
    GOV2_CUTOVER_ACCEPTANCE: "NO",
    GOV2_VALIDATION_AUTHORITATIVE: "YES",
    LIVE_CURRENT_META_VALID: liveAlignment.LIVE_CURRENT_META_VALID,
    LIVE_ROADMAP_STATE_ALIGNMENT: liveAlignment.LIVE_ROADMAP_STATE_ALIGNMENT,
    STATE_VALID: validation.ok ? "PASS" : "FAIL",
    DERIVED_NEXT_GATE: validation.nextGate,
    REAL_T8_STARTED: derivedT8Started || t8Status === "PASS" ? "YES" : "NO",
    T8_STATUS: t8Status ?? "MISSING",
    ALL_REQUIRED_TRANCHES_PASS: validation.allRequiredTranchesPass ? "YES" : "NO",
    findings: findings.filter((item) => item && item.ok === false),
    ok,
  };
}

function main() {
  const report = validateLiveCurrentState();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
