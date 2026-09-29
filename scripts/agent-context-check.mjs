#!/usr/bin/env node
/**
 * Structural packaging check for the AGENTS kernel and project skills.
 *
 * Proves file presence, skill frontmatter, dangling paths, and always-loaded
 * safety markers. It does not re-check product, experience, architecture, or
 * lifecycle semantics, and it is not an authority registry.
 *
 *   npm run agent:context:check
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "..");

export const REQUIRED_SKILLS = Object.freeze([
  "boba-read-order",
  "boba-decision-required",
  "boba-delivery-reporting",
  "boba-context-efficiency",
  "boba-founder-uat",
  "boba-branch-and-fingerprint",
]);

const SKILL_PATH_RE = /\.cursor\/skills\/([a-z0-9-]+)\/SKILL\.md/g;

const KERNEL_MARKERS = Object.freeze([
  ["sole agent contract", "sole agent operating contract"],
  ["no competing authority", "COMPETING_GOVERNANCE_AUTHORITY = NO"],
  ["no source mutation before alignment", "NO_SOURCE_MUTATION_BEFORE_ALIGNMENT = YES"],
  ["R3 force-push or history rewrite", "FORCE_PUSH_OR_HISTORY_REWRITE_REQUIRES_R3 = YES"],
  ["no unreviewed direct-main mutation", "NO_UNREVIEWED_DIRECT_MAIN_MUTATION = YES"],
  ["no invented binding semantics", "inventing undefined binding behaviour"],
  ["STOP on canonical conflict", "STOP AFFECTED WORK"],
  ["Founder UAT human gate", "FOUNDER_UAT_VERDICT_OWNER = HUMAN_FOUNDER"],
  ["formal acceptance not self-granted", "FORMAL_ACCEPTANCE_NOT_SELF_GRANTED = YES"],
  ["working-tree fingerprint command", "npm run working-tree:fingerprint"],
  ["no porcelain-hash substitute", "git status --porcelain | sha256sum"],
  ["cleanup only after required machine proof", "BRANCH_CLEANUP_ONLY_AFTER_REQUIRED_MACHINE_PROOF = YES"],
  ["no deletion of unique or uncertain work", "DO_NOT_DELETE_UNIQUE_OR_UNCERTAIN_BRANCH_WORK = YES"],
  ["generated current-context non-authoritative", "GENERATED_CURRENT_CONTEXT_AUTHORITY = NON_AUTHORITATIVE"],
]);

const MOVED_PROCEDURE_MARKERS = Object.freeze([
  {
    label: "decision template",
    needle: "why_current_authority_is_insufficient",
    skill: ".cursor/skills/boba-decision-required/SKILL.md",
  },
  {
    label: "session-close template",
    needle: "L. Proposed State Delta",
    skill: ".cursor/skills/boba-delivery-reporting/references/templates.md",
  },
  {
    label: "Founder UAT image evidence",
    needle: "BOBA_BUILD_SHA",
    skill: ".cursor/skills/boba-founder-uat/SKILL.md",
  },
  {
    label: "post-merge force-delete refusal",
    needle: "git branch -D",
    skill: ".cursor/skills/boba-branch-and-fingerprint/references/post-merge.md",
  },
]);

const AUTHORITY_CLAIM_RE =
  /\b(?:this skill|this file|this procedure) is the (?:sole |canonical )?(?:product |experience |architecture |lifecycle |agent )?authority\b/i;

/**
 * @param {string} abs
 */
function readUtf8(abs) {
  return readFileSync(abs, "utf8");
}

/**
 * @param {string} text
 */
function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return { error: "missing frontmatter open" };
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return { error: "unterminated frontmatter" };
  const block = text.slice(4, end);
  const body = text.slice(end + 5);
  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of block.split("\n")) {
    if (!line.trim()) continue;
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) return { error: `unparsed frontmatter line: ${line}` };
    fields[match[1]] = match[2].trim();
  }
  return { fields, body };
}

/**
 * @param {string} root
 * @param {string} rel
 */
function abs(root, rel) {
  return path.join(root, rel);
}

/**
 * @param {string} root
 * @returns {{ ok: boolean, message: string, failures: string[], measurement: Record<string, number | string> }}
 */
export function evaluateAgentContextPackaging(root = DEFAULT_ROOT) {
  /** @type {string[]} */
  const failures = [];

  const agentsRel = "AGENTS.md";
  const claudeRel = "CLAUDE.md";
  const agentsAbs = abs(root, agentsRel);
  const claudeAbs = abs(root, claudeRel);
  if (!existsSync(agentsAbs)) failures.push("AGENTS.md missing");
  if (!existsSync(claudeAbs)) failures.push("CLAUDE.md missing");

  const agents = existsSync(agentsAbs) ? readUtf8(agentsAbs) : "";
  const claude = existsSync(claudeAbs) ? readUtf8(claudeAbs) : "";
  if (existsSync(claudeAbs) && !/^@AGENTS\.md\n?$/.test(claude)) {
    failures.push("CLAUDE.md is not the @AGENTS.md delegation pointer");
  }

  const rulesRel = path.join(".cursor", "rules");
  if (existsSync(abs(root, rulesRel))) failures.push(".cursor/rules exists");
  const agentsSkillsRel = path.join(".agents", "skills");
  if (existsSync(abs(root, agentsSkillsRel))) failures.push(".agents/skills exists");

  const referenced = new Set();
  for (const match of agents.matchAll(SKILL_PATH_RE)) referenced.add(match[1]);
  for (const name of REQUIRED_SKILLS) {
    if (!referenced.has(name)) failures.push(`AGENTS.md does not reference skill ${name}`);
    const skillRel = path.join(".cursor", "skills", name, "SKILL.md");
    if (!existsSync(abs(root, skillRel))) failures.push(`missing skill ${skillRel}`);
  }
  for (const name of referenced) {
    const skillRel = path.join(".cursor", "skills", name, "SKILL.md");
    if (!existsSync(abs(root, skillRel))) failures.push(`dangling AGENTS skill path ${skillRel}`);
    if (!REQUIRED_SKILLS.includes(name)) failures.push(`unexpected skill referenced by AGENTS.md: ${name}`);
  }

  const skillsRoot = abs(root, path.join(".cursor", "skills"));
  /** @type {string[]} */
  const discovered = [];
  if (existsSync(skillsRoot)) {
    for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      discovered.push(entry.name);
      if (!REQUIRED_SKILLS.includes(entry.name)) {
        failures.push(`unexpected skill directory .cursor/skills/${entry.name}`);
      }
    }
  } else {
    failures.push(".cursor/skills missing");
  }
  discovered.sort();
  const requiredSorted = [...REQUIRED_SKILLS].sort();
  if (existsSync(skillsRoot) && requiredSorted.some((name) => !discovered.includes(name))) {
    failures.push("required skill set is incomplete");
  }

  let skillMdBytes = 0;
  let referenceBytes = 0;
  let discoveryMetadataBytes = 0;
  for (const name of discovered.filter((item) => REQUIRED_SKILLS.includes(item))) {
    const skillRel = path.join(".cursor", "skills", name, "SKILL.md");
    const skillAbs = abs(root, skillRel);
    if (!existsSync(skillAbs)) continue;
    const text = readUtf8(skillAbs);
    skillMdBytes += Buffer.byteLength(text);
    const parsed = parseFrontmatter(text);
    if (parsed.error) {
      failures.push(`${skillRel}: ${parsed.error}`);
      continue;
    }
    const { fields, body } = parsed;
    const keys = Object.keys(fields);
    if (fields.name !== name) failures.push(`${skillRel}: name must be ${name}`);
    if (!fields.description) failures.push(`${skillRel}: description missing`);
    if (Buffer.byteLength(fields.description ?? "") > 1024) {
      failures.push(`${skillRel}: description exceeds 1024 bytes`);
    }
    if (keys.includes("disable-model-invocation")) {
      failures.push(`${skillRel}: disable-model-invocation must be omitted`);
    }
    if (keys.includes("paths")) failures.push(`${skillRel}: paths must be omitted`);
    for (const key of keys) {
      if (key !== "name" && key !== "description") failures.push(`${skillRel}: unexpected frontmatter key ${key}`);
    }
    discoveryMetadataBytes += Buffer.byteLength(fields.description ?? "");
    for (const sentence of [
      "subordinate to `AGENTS.md`",
      "non-authoritative",
      "Canonical authorities named by `AGENTS.md` prevail",
      "STOP",
    ]) {
      if (!text.includes(sentence)) failures.push(`${skillRel}: missing subordination marker: ${sentence}`);
    }
    if (AUTHORITY_CLAIM_RE.test(body)) {
      failures.push(`${skillRel}: presents itself as canonical authority`);
    }
  }

  const refDirNames = ["boba-delivery-reporting", "boba-branch-and-fingerprint"];
  for (const name of refDirNames) {
    const refDir = abs(root, path.join(".cursor", "skills", name, "references"));
    if (!existsSync(refDir)) continue;
    for (const entry of readdirSync(refDir)) {
      const refAbs = path.join(refDir, entry);
      if (!statSync(refAbs).isFile()) continue;
      referenceBytes += Buffer.byteLength(readUtf8(refAbs));
    }
  }

  for (const [label, needle] of KERNEL_MARKERS) {
    if (!agents.includes(needle)) failures.push(`AGENTS.md missing kernel invariant: ${label}`);
  }
  if (!agents.includes("CANONICAL_CONFLICT_STOPS_AFFECTED_WORK = YES")) {
    failures.push("AGENTS.md missing kernel invariant: canonical conflict stops affected work");
  }

  for (const moved of MOVED_PROCEDURE_MARKERS) {
    if (agents.includes(moved.needle)) {
      failures.push(`AGENTS.md still contains moved procedure (${moved.label})`);
    }
    const movedAbs = abs(root, moved.skill);
    if (!existsSync(movedAbs) || !readUtf8(movedAbs).includes(moved.needle)) {
      failures.push(`moved procedure missing from ${moved.skill} (${moved.label})`);
    }
  }

  const contextRel = "docs/platform/governance/current-context.json";
  const contextAbs = abs(root, contextRel);
  if (!existsSync(contextAbs)) {
    failures.push(`${contextRel} missing`);
  } else {
    try {
      const parsed = JSON.parse(readUtf8(contextAbs));
      if (parsed.authority !== "NON_AUTHORITATIVE") {
        failures.push(`${contextRel} authority is not NON_AUTHORITATIVE`);
      }
    } catch {
      failures.push(`${contextRel} is not JSON`);
    }
  }

  const agentsBytes = Buffer.byteLength(agents);
  const claudeBytes = Buffer.byteLength(claude);
  const measurement = {
    agents_bytes: agentsBytes,
    claude_bytes: claudeBytes,
    always_loaded_bytes: agentsBytes + claudeBytes,
    cursor_rules: existsSync(abs(root, rulesRel)) ? "PRESENT" : "ABSENT",
    skill_count: discovered.filter((name) => REQUIRED_SKILLS.includes(name)).length,
    skill_md_bytes: skillMdBytes,
    reference_bytes: referenceBytes,
    on_demand_bytes: skillMdBytes + referenceBytes,
    discovery_metadata_bytes: discoveryMetadataBytes,
  };

  const ok = failures.length === 0;
  const message = ok
    ? `agent context packaging OK (always_loaded_bytes=${measurement.always_loaded_bytes}; skills=${measurement.skill_count})`
    : failures.join("; ");
  return { ok, message, failures, measurement };
}

function printMeasurement(measurement) {
  const keys = Object.keys(measurement).sort();
  console.log("AGENT_CONTEXT_BYTES");
  for (const key of keys) console.log(`${key}: ${measurement[key]}`);
}

function main() {
  const result = evaluateAgentContextPackaging(DEFAULT_ROOT);
  printMeasurement(result.measurement);
  if (!result.ok) {
    for (const failure of result.failures) console.error(`FAIL ${failure}`);
    process.exit(1);
  }
  console.log(result.message);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
