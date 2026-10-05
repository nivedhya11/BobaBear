#!/usr/bin/env node
/**
 * GOV-2 shadow runner.
 *
 * READ_ONLY / DETERMINISTIC / NO_FILE_MUTATION / NO_GIT_MUTATION / NO_GITHUB_MUTATION
 * GOV2_PHASE = SHADOW
 * GOV2_CUTOVER = NO
 * CURRENT_GOVERNANCE_REMAINS_AUTHORITATIVE = YES
 *
 * Fixtures are TEST_ONLY and NON_AUTHORITATIVE. They are not a third lifecycle
 * authority beside ROADMAP.md and STATE.md.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { DELIVERY_RISK_TIER, parseGovernanceMeta } from "./model.mjs";
import { validateCurrentState } from "./invariants.mjs";
import { loadFixture } from "./load-fixture.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "../..");

export function runShadow(root = DEFAULT_ROOT) {
  const roadmapLive = readFileSync(path.join(root, "docs/platform/ROADMAP.md"), "utf8");
  const stateLive = readFileSync(path.join(root, "docs/platform/STATE.md"), "utf8");
  const roadmapMeta = parseGovernanceMeta(roadmapLive);
  const stateMeta = parseGovernanceMeta(stateLive);

  const fixtureRoadmap = loadFixture(root, "roadmap.json");
  const plan = loadFixture(root, "imp036j-tranche-plan.json");
  const current = loadFixture(root, "imp036j-post-t7.json");
  const prB = loadFixture(root, "pr-b-prerequisites.json");

  const validation = validateCurrentState(current, plan, fixtureRoadmap);
  const derivedT8Started = Boolean(validation.derivedStarted?.T8);

  return {
    GOV2_PHASE: "SHADOW",
    GOV2_CUTOVER: "NO",
    CURRENT_GOVERNANCE_REMAINS_AUTHORITATIVE: "YES",
    READ_ONLY: true,
    NORMALIZED_INPUT: "TEST_ONLY_FIXTURE",
    TEST_ONLY: true,
    NON_AUTHORITATIVE: true,
    liveRoadmapMeta: roadmapMeta.ok ? roadmapMeta.meta : roadmapMeta,
    liveStateMeta: stateMeta.ok ? stateMeta.meta : stateMeta,
    STATE_VALID: validation.ok ? "PASS" : "FAIL",
    DERIVED_NEXT_GATE: validation.nextGate,
    REAL_T8_STARTED: derivedT8Started ? "YES" : "NO",
    ALL_REQUIRED_TRANCHES_PASS: validation.allRequiredTranchesPass ? "YES" : "NO",
    findings: validation.findings,
    deliveryRiskTiers: DELIVERY_RISK_TIER,
    prBPrerequisites: prB.mainBranchProtection,
    ok: validation.ok && roadmapMeta.ok && stateMeta.ok && derivedT8Started === false,
  };
}

function main() {
  const report = runShadow();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
