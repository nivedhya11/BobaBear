/**
 * Load GOV-2 machine-readable blocks from live authorities.
 * Narrative prose is ignored.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { aggregate, finding } from "./model.mjs";

const GOV2_BLOCK = /<!--\s*gov2-([a-z0-9-]+)\b([\s\S]*?)-->/g;

/**
 * @param {string} text
 * @param {string} kind
 */
export function parseGov2Block(text, kind) {
  if (typeof kind !== "string" || kind.length === 0) {
    return finding("CURRENT_AUTHORITY_KIND_REQUIRED", "gov2", "gov2 block kind is required");
  }
  const source = String(text ?? "");
  const matches = [...source.matchAll(GOV2_BLOCK)].filter((match) => match[1] === kind);
  if (matches.length === 0) {
    return finding("CURRENT_AUTHORITY_MISSING", `gov2-${kind}`, `no gov2-${kind} block found`);
  }
  if (matches.length > 1) {
    return finding(
      "CURRENT_AUTHORITY_NOT_UNIQUE",
      `gov2-${kind}`,
      `${matches.length} gov2-${kind} blocks found`,
    );
  }
  const body = matches[0][2] ?? "";
  const open = body.indexOf("{");
  const close = body.lastIndexOf("}");
  if (open < 0 || close < 0 || close < open) {
    return finding("CURRENT_AUTHORITY_MALFORMED", `gov2-${kind}`, "gov2 JSON is not bounded");
  }
  try {
    const parsed = JSON.parse(body.slice(open, close + 1));
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return finding("CURRENT_AUTHORITY_MALFORMED", `gov2-${kind}`, "gov2 JSON must be an object");
    }
    return { ok: true, value: parsed };
  } catch (error) {
    return finding(
      "CURRENT_AUTHORITY_MALFORMED",
      `gov2-${kind}`,
      `gov2 JSON is invalid: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * @param {string} root
 * @param {string} rel
 */
export function readAuthority(root, rel) {
  try {
    return { ok: true, text: readFileSync(path.join(root, rel), "utf8"), rel };
  } catch (error) {
    return finding(
      "CURRENT_AUTHORITY_MISSING",
      rel,
      `unable to read ${rel}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * @param {string} roadmapText
 * @param {string} stateText
 * @param {string | null | undefined} planText
 */
export function loadAuthoritiesFromTexts(roadmapText, stateText, planText) {
  const findings = [];
  const roadmapBlock = parseGov2Block(roadmapText, "roadmap");
  const stateBlock = parseGov2Block(stateText, "state");
  if (roadmapBlock.ok !== true) findings.push(roadmapBlock);
  if (stateBlock.ok !== true) findings.push(stateBlock);
  if (findings.length > 0) {
    return { ...aggregate(findings), roadmap: null, state: null, plan: null, planRel: null };
  }

  const planRel =
    typeof roadmapBlock.value.tranchePlanPath === "string" && roadmapBlock.value.tranchePlanPath.length > 0
      ? roadmapBlock.value.tranchePlanPath
      : null;
  if (!planRel) {
    findings.push(finding("CURRENT_AUTHORITY_MISSING", "tranchePlanPath", "ROADMAP gov2 block must declare tranchePlanPath"));
    return { ...aggregate(findings), roadmap: roadmapBlock.value, state: stateBlock.value, plan: null, planRel: null };
  }
  if (planText == null) {
    findings.push(finding("CURRENT_AUTHORITY_MISSING", planRel, `unable to read ${planRel}`));
    return { ...aggregate(findings), roadmap: roadmapBlock.value, state: stateBlock.value, plan: null, planRel };
  }
  const planBlock = parseGov2Block(planText, "tranche-plan");
  if (planBlock.ok !== true) {
    findings.push(planBlock);
    return { ...aggregate(findings), roadmap: roadmapBlock.value, state: stateBlock.value, plan: null, planRel };
  }

  return {
    ok: true,
    findings: [],
    roadmap: roadmapBlock.value,
    state: stateBlock.value,
    plan: planBlock.value,
    planRel,
  };
}

/**
 * @param {string} root
 */
export function loadLiveAuthorities(root) {
  const findings = [];
  const roadmapFile = readAuthority(root, "docs/platform/ROADMAP.md");
  const stateFile = readAuthority(root, "docs/platform/STATE.md");
  if (roadmapFile.ok === false) findings.push(roadmapFile);
  if (stateFile.ok === false) findings.push(stateFile);
  if (findings.length > 0) {
    return { ...aggregate(findings), roadmap: null, state: null, plan: null };
  }

  const roadmapBlock = parseGov2Block(roadmapFile.text, "roadmap");
  const planRel =
    roadmapBlock.ok === true &&
    typeof roadmapBlock.value.tranchePlanPath === "string" &&
    roadmapBlock.value.tranchePlanPath.length > 0
      ? roadmapBlock.value.tranchePlanPath
      : null;
  const planFile = planRel ? readAuthority(root, planRel) : { ok: true, text: null };
  if (planRel && planFile.ok === false) findings.push(planFile);
  if (findings.length > 0) {
    return { ...aggregate(findings), roadmap: null, state: null, plan: null };
  }

  return loadAuthoritiesFromTexts(roadmapFile.text, stateFile.text, planFile.text);
}
