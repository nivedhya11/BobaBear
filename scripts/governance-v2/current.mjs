#!/usr/bin/env node
/**
 * Authoritative GOV-2 current-state validation against live authorities.
 *
 * GOV2_VALIDATION_AUTHORITATIVE = YES
 * GOV2_AUTHORITY_MODE = GOV2
 * GOV2_CUTOVER_ACCEPTANCE = NO
 */
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { CURRENT_AUTHORITY_KIND, parseCurrentGovernanceMeta, validateLiveRoadmapStateAlignment } from "./schema.mjs";
import { validateCurrentState } from "./invariants.mjs";
import { loadLiveAuthorities } from "./load-authorities.mjs";
import { finding } from "./model.mjs";
import { readFileSync, realpathSync } from "node:fs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = process.env.BOBA_PROJECT_ROOT
  ? path.resolve(process.env.BOBA_PROJECT_ROOT)
  : path.resolve(SCRIPT_DIR, "../..");

const ROADMAP_POINTER_PAIRS = Object.freeze([
  ["acceptedThrough", "acceptedThrough"],
  ["currentProductSlice", "currentSlice"],
  ["nextProductSlice", "nextSlice"],
  ["gtmBoundary", "gtmBoundary"],
]);

const STATE_POINTER_PAIRS = Object.freeze([
  ["acceptedThrough", "acceptedThrough"],
  ["currentProductSlice", "currentSlice"],
  ["nextProductSlice", "nextSlice"],
  ["pendingAcceptance", "pendingAcceptance"],
]);

/**
 * CURRENT governance-meta pointers must match the loaded GOV-2 blocks.
 * Internal GOV-2 validation alone must not bless a drifted machine block.
 *
 * @param {{ ok?: boolean, meta?: Record<string, unknown> }} roadmapMeta
 * @param {{ ok?: boolean, meta?: Record<string, unknown> }} stateMeta
 * @param {Record<string, unknown> | null | undefined} roadmap
 * @param {Record<string, unknown> | null | undefined} state
 */
export function alignGovernanceMetaToGov2Blocks(roadmapMeta, stateMeta, roadmap, state) {
  /** @type {ReturnType<typeof finding>[]} */
  const findings = [];
  const compare = (metaResult, gov2, pairs, prefix) => {
    if (metaResult?.ok !== true || gov2 == null || typeof gov2 !== "object") return;
    for (const [metaKey, gov2Key] of pairs) {
      if (metaResult.meta[metaKey] !== gov2[gov2Key]) {
        findings.push(
          finding(
            "CURRENT_AUTHORITY_POINTER_MISMATCH",
            `${prefix}.${gov2Key}`,
            `governance-meta ${metaKey}=${JSON.stringify(metaResult.meta[metaKey])} disagrees with gov2 ${gov2Key}=${JSON.stringify(gov2[gov2Key])}`,
          ),
        );
      }
    }
  };
  compare(roadmapMeta, roadmap, ROADMAP_POINTER_PAIRS, "gov2-roadmap");
  compare(stateMeta, state, STATE_POINTER_PAIRS, "gov2-state");
  return findings;
}

export function validateAuthorityDocuments(roadmapText, stateText, loaded) {
  const roadmapMeta = parseCurrentGovernanceMeta(roadmapText, CURRENT_AUTHORITY_KIND.ROADMAP);
  const stateMeta = parseCurrentGovernanceMeta(stateText, CURRENT_AUTHORITY_KIND.STATE);
  const liveAlignment = validateLiveRoadmapStateAlignment(roadmapMeta, stateMeta);

  const findings = [
    ...(loaded.ok ? [] : loaded.findings),
    ...liveAlignment.findings,
    ...alignGovernanceMetaToGov2Blocks(roadmapMeta, stateMeta, loaded.roadmap, loaded.state),
  ];
  const validation =
    loaded.ok && loaded.roadmap && loaded.state && loaded.plan
      ? validateCurrentState(loaded.state, loaded.plan, loaded.roadmap)
      : { ok: false, findings, nextGate: "NONE", allRequiredTranchesPass: false, derivedStarted: {} };
  findings.push(...validation.findings);

  const derivedT8Started = Boolean(validation.derivedStarted?.T8);
  const t8Status = loaded.state?.implementation?.trancheStatuses?.T8;
  const ok = findings.filter((item) => item && item.ok === false).length === 0;

  return {
    GOV2_AUTHORITY_MODE: "GOV2",
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

export function validateLiveCurrentState(root = DEFAULT_ROOT) {
  const loaded = loadLiveAuthorities(root);
  const roadmapLive = readFileSync(path.join(root, "docs/platform/ROADMAP.md"), "utf8");
  const stateLive = readFileSync(path.join(root, "docs/platform/STATE.md"), "utf8");
  return validateAuthorityDocuments(roadmapLive, stateLive, loaded);
}

function main() {
  const report = validateLiveCurrentState();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.ok ? 0 : 1;
}

if (process.argv[1]) {
  try {
    if (realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
      main();
    }
  } catch {
    if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
      main();
    }
  }
}
