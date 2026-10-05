#!/usr/bin/env node
/**
 * Authoritative GOV-2 base → head transition validation.
 *
 * Usage: node scripts/governance-v2/transition-current.mjs <baseSha> [headSha]
 * Omit headSha to validate the working tree against the explicit base commit.
 */
import { readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { finding } from "./model.mjs";
import { loadAuthoritiesFromTexts, parseGov2Block } from "./load-authorities.mjs";
import { CURRENT_AUTHORITY_KIND, parseCurrentGovernanceMeta } from "./schema.mjs";
import { validateAuthorityDocuments } from "./current.mjs";
import { acceptedIdsFromMarkdownLedger, acceptedIdentityTransitionFindings, validateTransition } from "./transition.mjs";
import { bootstrapExecutionFindings, extractGov2Execution, extractPreGov2CurrentExecution } from "./bootstrap-execution.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = process.env.BOBA_PROJECT_ROOT
  ? path.resolve(process.env.BOBA_PROJECT_ROOT)
  : path.resolve(SCRIPT_DIR, "../..");

const ROADMAP_REL = "docs/platform/ROADMAP.md";
const STATE_REL = "docs/platform/STATE.md";
const HISTORY_DIR = "docs/platform/history";
const PRE_GOV2_ROADMAP = /^ROADMAP-.*-pre-gov2\.md$/;
const PRE_GOV2_STATE = /^STATE-.*-pre-gov2\.md$/;

/**
 * @param {string} text
 * @param {string} kind
 */
export function hasGov2Block(text, kind) {
  return parseGov2Block(text, kind).ok === true;
}

/**
 * @param {string} root
 * @param {string} spec
 */
export function resolveCommit(root, spec) {
  const result = spawnSync("git", ["-C", root, "rev-parse", "--verify", `${spec}^{commit}`], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return finding("INVALID_BASE_SHA", "base", `unable to resolve commit ${JSON.stringify(spec)}`);
  }
  return { ok: true, sha: result.stdout.trim() };
}

/**
 * @param {string} root
 * @param {string} sha
 * @param {string} rel
 */
export function readGitPath(root, sha, rel) {
  const result = spawnSync("git", ["-C", root, "show", `${sha}:${rel}`], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    return finding(
      "CURRENT_AUTHORITY_MISSING",
      rel,
      `unable to read ${rel} at ${sha}: ${result.stderr || result.stdout || "git show failed"}`,
    );
  }
  return { ok: true, text: result.stdout, rel };
}

function listGitHistory(root, sha) {
  const result = spawnSync("git", ["-C", root, "ls-tree", "-r", "--name-only", sha, HISTORY_DIR], {
    encoding: "utf8",
  });
  if (result.status !== 0) return [];
  return result.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

function listWorkingHistory(root) {
  try {
    return readdirSync(path.join(root, HISTORY_DIR)).map((name) => `${HISTORY_DIR}/${name}`);
  } catch {
    return [];
  }
}

function uniqueMatch(paths, pattern, label) {
  const matches = paths.filter((rel) => pattern.test(path.basename(rel)));
  if (matches.length === 0) {
    return finding("PRE_GOV2_SNAPSHOT_MISSING", label, `no unique ${label} pre-GOV2 snapshot found`);
  }
  if (matches.length > 1) {
    return finding(
      "PRE_GOV2_SNAPSHOT_NOT_UNIQUE",
      label,
      `${matches.length} ${label} pre-GOV2 snapshots found`,
    );
  }
  return { ok: true, rel: matches[0] };
}

function loadHeadDocuments(root, headSha) {
  if (headSha) {
    const roadmap = readGitPath(root, headSha, ROADMAP_REL);
    const state = readGitPath(root, headSha, STATE_REL);
    return { roadmap, state, history: listGitHistory(root, headSha), readPlan: (rel) => readGitPath(root, headSha, rel) };
  }
  /** @param {string} rel */
  const readPlan = (rel) => {
    try {
      return { ok: true, text: readFileSync(path.join(root, rel), "utf8"), rel };
    } catch (error) {
      return finding(
        "CURRENT_AUTHORITY_MISSING",
        rel,
        `unable to read ${rel}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };
  return {
    roadmap: readPlan(ROADMAP_REL),
    state: readPlan(STATE_REL),
    history: listWorkingHistory(root),
    readPlan,
  };
}

function gov2Presence(roadmapText, stateText) {
  const roadmapGov2 = hasGov2Block(roadmapText, "roadmap");
  const stateGov2 = hasGov2Block(stateText, "state");
  return {
    roadmapGov2,
    stateGov2,
    hasGov2: roadmapGov2 && stateGov2,
    split: roadmapGov2 !== stateGov2,
  };
}

function bootstrapPointerFindings(baseRoadmapMeta, baseStateMeta, headLoaded) {
  const findings = [];
  const pairs = [
    ["acceptedThrough", "acceptedThrough"],
    ["currentProductSlice", "currentSlice"],
    ["nextProductSlice", "nextSlice"],
  ];
  for (const [metaKey, gov2Key] of pairs) {
    if (baseRoadmapMeta.meta[metaKey] !== headLoaded.roadmap[gov2Key]) {
      findings.push(
        finding(
          "GOV2_BOOTSTRAP_POINTER_MISMATCH",
          `gov2-roadmap.${gov2Key}`,
          `base ROADMAP governance-meta ${metaKey}=${JSON.stringify(baseRoadmapMeta.meta[metaKey])} disagrees with head gov2 ${gov2Key}=${JSON.stringify(headLoaded.roadmap[gov2Key])}`,
        ),
      );
    }
    if (baseStateMeta.meta[metaKey] !== headLoaded.state[gov2Key]) {
      findings.push(
        finding(
          "GOV2_BOOTSTRAP_POINTER_MISMATCH",
          `gov2-state.${gov2Key}`,
          `base STATE governance-meta ${metaKey}=${JSON.stringify(baseStateMeta.meta[metaKey])} disagrees with head gov2 ${gov2Key}=${JSON.stringify(headLoaded.state[gov2Key])}`,
        ),
      );
    }
  }
  if (baseRoadmapMeta.meta.gtmBoundary !== headLoaded.roadmap.gtmBoundary) {
    findings.push(
      finding(
        "GOV2_BOOTSTRAP_POINTER_MISMATCH",
        "gov2-roadmap.gtmBoundary",
        `base ROADMAP governance-meta gtmBoundary=${JSON.stringify(baseRoadmapMeta.meta.gtmBoundary)} disagrees with head gov2 gtmBoundary=${JSON.stringify(headLoaded.roadmap.gtmBoundary)}`,
      ),
    );
  }
  return findings;
}

/**
 * @param {{ root?: string, baseSha: string, headSha?: string }} input
 */
export function validateRepositoryTransition(input) {
  const root = input.root ?? DEFAULT_ROOT;
  const baseResolved = resolveCommit(root, input.baseSha);
  if (baseResolved.ok !== true) {
    return {
      ok: false,
      MODE: "INVALID",
      GOV2_VALIDATION_AUTHORITATIVE: "YES",
      findings: [baseResolved],
    };
  }
  let headSha = null;
  if (input.headSha) {
    const headResolved = resolveCommit(root, input.headSha);
    if (headResolved.ok !== true) {
      return {
        ok: false,
        MODE: "INVALID",
        GOV2_VALIDATION_AUTHORITATIVE: "YES",
        findings: [{ ...headResolved, path: "head" }],
      };
    }
    headSha = headResolved.sha;
  }

  const baseRoadmap = readGitPath(root, baseResolved.sha, ROADMAP_REL);
  const baseState = readGitPath(root, baseResolved.sha, STATE_REL);
  const headDocs = loadHeadDocuments(root, headSha);
  const missing = [baseRoadmap, baseState, headDocs.roadmap, headDocs.state].filter((item) => item.ok !== true);
  if (missing.length > 0) {
    return {
      ok: false,
      MODE: "INVALID",
      GOV2_VALIDATION_AUTHORITATIVE: "YES",
      BASE_SHA: baseResolved.sha,
      HEAD_SHA: headSha,
      findings: missing,
    };
  }

  const basePresence = gov2Presence(baseRoadmap.text, baseState.text);
  const headPresence = gov2Presence(headDocs.roadmap.text, headDocs.state.text);
  if (basePresence.split) {
    return {
      ok: false,
      MODE: "INVALID",
      GOV2_VALIDATION_AUTHORITATIVE: "YES",
      BASE_SHA: baseResolved.sha,
      HEAD_SHA: headSha,
      findings: [finding("GOV2_AUTHORITY_SPLIT", "base", "base ROADMAP/STATE must both have GOV-2 or both lack it")],
    };
  }
  if (headPresence.split) {
    return {
      ok: false,
      MODE: "INVALID",
      GOV2_VALIDATION_AUTHORITATIVE: "YES",
      BASE_SHA: baseResolved.sha,
      HEAD_SHA: headSha,
      findings: [finding("GOV2_AUTHORITY_SPLIT", "head", "head ROADMAP/STATE must both have GOV-2 or both lack it")],
    };
  }

  if (basePresence.hasGov2 && !headPresence.hasGov2) {
    return {
      ok: false,
      MODE: "GOV2_ROLLBACK",
      GOV2_VALIDATION_AUTHORITATIVE: "YES",
      BASE_HAS_GOV2: "YES",
      HEAD_HAS_GOV2: "NO",
      BASE_SHA: baseResolved.sha,
      HEAD_SHA: headSha,
      findings: [finding("GOV2_ROLLBACK", "head", "GOV-2 authorities cannot be removed once present")],
    };
  }

  if (!basePresence.hasGov2 && !headPresence.hasGov2) {
    return {
      ok: false,
      MODE: "GOV2_ABSENT",
      GOV2_VALIDATION_AUTHORITATIVE: "YES",
      BASE_HAS_GOV2: "NO",
      HEAD_HAS_GOV2: "NO",
      BASE_SHA: baseResolved.sha,
      HEAD_SHA: headSha,
      findings: [finding("GOV2_ABSENT", "head", "head must introduce or retain GOV-2 authorities")],
    };
  }

  if (!basePresence.hasGov2 && headPresence.hasGov2) {
    return validateBootstrapTransition({
      baseSha: baseResolved.sha,
      headSha,
      baseRoadmap: baseRoadmap.text,
      baseState: baseState.text,
      headDocs,
    });
  }

  return validateGov2ToGov2Transition({
    baseSha: baseResolved.sha,
    headSha,
    baseRoadmap: baseRoadmap.text,
    baseState: baseState.text,
    headDocs,
    root,
  });
}

function validateBootstrapTransition({ baseSha, headSha, baseRoadmap, baseState, headDocs }) {
  const findings = [];
  const roadmapSnapshot = uniqueMatch(headDocs.history, PRE_GOV2_ROADMAP, "ROADMAP");
  const stateSnapshot = uniqueMatch(headDocs.history, PRE_GOV2_STATE, "STATE");
  if (roadmapSnapshot.ok !== true) findings.push(roadmapSnapshot);
  if (stateSnapshot.ok !== true) findings.push(stateSnapshot);

  if (roadmapSnapshot.ok === true) {
    const snapshot = headDocs.readPlan(roadmapSnapshot.rel);
    if (snapshot.ok !== true) findings.push(snapshot);
    else if (snapshot.text !== baseRoadmap) {
      findings.push(
        finding(
          "PRE_GOV2_SNAPSHOT_MISMATCH",
          roadmapSnapshot.rel,
          "pre-GOV2 ROADMAP snapshot must equal the exact base ROADMAP blob",
        ),
      );
    }
  }
  if (stateSnapshot.ok === true) {
    const snapshot = headDocs.readPlan(stateSnapshot.rel);
    if (snapshot.ok !== true) findings.push(snapshot);
    else if (snapshot.text !== baseState) {
      findings.push(
        finding(
          "PRE_GOV2_SNAPSHOT_MISMATCH",
          stateSnapshot.rel,
          "pre-GOV2 STATE snapshot must equal the exact base STATE blob",
        ),
      );
    }
  }

  const baseRoadmapMeta = parseCurrentGovernanceMeta(baseRoadmap, CURRENT_AUTHORITY_KIND.ROADMAP);
  const baseStateMeta = parseCurrentGovernanceMeta(baseState, CURRENT_AUTHORITY_KIND.STATE);
  if (baseRoadmapMeta.ok !== true) findings.push(baseRoadmapMeta);
  if (baseStateMeta.ok !== true) findings.push(baseStateMeta);

  const headPlanRelGuess = parseGov2Block(headDocs.roadmap.text, "roadmap");
  const planRel = headPlanRelGuess.ok === true ? headPlanRelGuess.value.tranchePlanPath : null;
  const planFile = typeof planRel === "string" ? headDocs.readPlan(planRel) : { ok: true, text: null };
  if (typeof planRel === "string" && planFile.ok !== true) findings.push(planFile);
  const headLoaded = loadAuthoritiesFromTexts(
    headDocs.roadmap.text,
    headDocs.state.text,
    planFile.ok === true ? planFile.text : null,
  );
  const headCurrent = validateAuthorityDocuments(headDocs.roadmap.text, headDocs.state.text, headLoaded);
  findings.push(...headCurrent.findings);
  if (baseRoadmapMeta.ok === true && baseStateMeta.ok === true && headLoaded.ok && headLoaded.roadmap && headLoaded.state) {
    findings.push(...bootstrapPointerFindings(baseRoadmapMeta, baseStateMeta, headLoaded));
    findings.push(
      ...acceptedIdentityTransitionFindings(acceptedIdsFromMarkdownLedger(baseRoadmap), headLoaded.roadmap),
    );
    if (headLoaded.plan) {
      const baseExecution = extractPreGov2CurrentExecution(baseState, headLoaded.plan);
      const headExecution = extractGov2Execution(headLoaded.state, headLoaded.plan);
      if (baseExecution.ok !== true) findings.push(...baseExecution.findings);
      if (headExecution.ok !== true) findings.push(...headExecution.findings);
      if (baseExecution.ok === true && headExecution.ok === true) {
        findings.push(...bootstrapExecutionFindings(baseExecution.execution, headExecution.execution));
      }
    }
  }

  const material = findings.filter((item) => item && item.ok === false);
  return {
    ok: material.length === 0,
    MODE: "GOV2_BOOTSTRAP",
    GOV2_VALIDATION_AUTHORITATIVE: "YES",
    GOV2_AUTHORITY_MODE: "GOV2",
    BASE_HAS_GOV2: "NO",
    HEAD_HAS_GOV2: "YES",
    BASE_SHA: baseSha,
    HEAD_SHA: headSha,
    STATE_VALID: headCurrent.STATE_VALID,
    DERIVED_NEXT_GATE: headCurrent.DERIVED_NEXT_GATE,
    T8_STATUS: headCurrent.T8_STATUS,
    ALL_REQUIRED_TRANCHES_PASS: headCurrent.ALL_REQUIRED_TRANCHES_PASS,
    findings: material,
  };
}

function validateGov2ToGov2Transition({ baseSha, headSha, baseRoadmap, baseState, headDocs, root }) {
  const findings = [];
  const basePlanRelGuess = parseGov2Block(baseRoadmap, "roadmap");
  const headPlanRelGuess = parseGov2Block(headDocs.roadmap.text, "roadmap");
  const basePlanRel = basePlanRelGuess.ok === true ? basePlanRelGuess.value.tranchePlanPath : null;
  const headPlanRel = headPlanRelGuess.ok === true ? headPlanRelGuess.value.tranchePlanPath : null;
  const basePlanFile =
    typeof basePlanRel === "string" ? readGitPath(root, baseSha, basePlanRel) : { ok: true, text: null };
  const headPlanFile = typeof headPlanRel === "string" ? headDocs.readPlan(headPlanRel) : { ok: true, text: null };
  if (typeof basePlanRel === "string" && basePlanFile.ok !== true) findings.push(basePlanFile);
  if (typeof headPlanRel === "string" && headPlanFile.ok !== true) findings.push(headPlanFile);

  const baseLoaded = loadAuthoritiesFromTexts(
    baseRoadmap,
    baseState,
    basePlanFile.ok === true ? basePlanFile.text : null,
  );
  const headLoaded = loadAuthoritiesFromTexts(
    headDocs.roadmap.text,
    headDocs.state.text,
    headPlanFile.ok === true ? headPlanFile.text : null,
  );
  const baseCurrent = validateAuthorityDocuments(baseRoadmap, baseState, baseLoaded);
  const headCurrent = validateAuthorityDocuments(headDocs.roadmap.text, headDocs.state.text, headLoaded);
  findings.push(...baseCurrent.findings.map((item) => ({ ...item, path: `base.${item.path}` })));
  findings.push(...headCurrent.findings.map((item) => ({ ...item, path: `head.${item.path}` })));

  if (baseLoaded.ok && headLoaded.ok && baseLoaded.state && headLoaded.state && headLoaded.plan && headLoaded.roadmap && baseLoaded.plan && baseLoaded.roadmap) {
    const transition = validateTransition(
      baseLoaded.state,
      headLoaded.state,
      headLoaded.plan,
      headLoaded.roadmap,
      baseLoaded.plan,
      baseLoaded.roadmap,
    );
    findings.push(...transition.findings);
    const material = findings.filter((item) => item && item.ok === false);
    return {
      ok: material.length === 0,
      MODE: "GOV2_TO_GOV2",
      GOV2_VALIDATION_AUTHORITATIVE: "YES",
      GOV2_AUTHORITY_MODE: "GOV2",
      BASE_HAS_GOV2: "YES",
      HEAD_HAS_GOV2: "YES",
      BASE_SHA: baseSha,
      HEAD_SHA: headSha,
      STATE_VALID: headCurrent.STATE_VALID,
      DERIVED_NEXT_GATE: headCurrent.DERIVED_NEXT_GATE,
      T8_STATUS: headCurrent.T8_STATUS,
      ALL_REQUIRED_TRANCHES_PASS: headCurrent.ALL_REQUIRED_TRANCHES_PASS,
      findings: material,
      mutations: transition.mutations,
    };
  }

  const material = findings.filter((item) => item && item.ok === false);
  return {
    ok: false,
    MODE: "GOV2_TO_GOV2",
    GOV2_VALIDATION_AUTHORITATIVE: "YES",
    GOV2_AUTHORITY_MODE: "GOV2",
    BASE_HAS_GOV2: "YES",
    HEAD_HAS_GOV2: "YES",
    BASE_SHA: baseSha,
    HEAD_SHA: headSha,
    findings: material.length > 0 ? material : [finding("INVALID_STATE", "transition", "GOV-2 documents could not be loaded")],
  };
}

function main(argv = process.argv.slice(2)) {
  const baseSha = argv[0];
  const headSha = argv[1];
  if (!baseSha) {
    process.stderr.write("usage: npm run governance:v2:transition -- <baseSha> [headSha]\n");
    process.exitCode = 1;
    return;
  }
  const report = validateRepositoryTransition({ baseSha, headSha });
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

export { main };
