#!/usr/bin/env node
/**
 * Compact NON-AUTHORITATIVE current-position projection.
 *
 * PROJECTION_EXTRACTION_SOURCES != COMPLETE_CANONICAL_AUTHORITY_SET
 * CURRENT_CONTEXT_AUTHORITY = NON_AUTHORITATIVE
 * CURRENT_CONTEXT_IS_SHORTCUT_FOR_CURRENT_POSITION = YES
 * CURRENT_CONTEXT_MAY_REPLACE_APPLICABLE_CANONICAL_AUTHORITY_READS = NO
 * CURRENT_CONTEXT_EXTRACTION_SOURCES = ROADMAP + STATE + ARCHITECTURE + DECISION_REGISTER (GOV-2 machine-readable blocks)

 * CANONICAL_AUTHORITY_MODEL_SOURCE = AGENTS.md + REFERENCED_AUTHORITIES
 *
 * ROADMAP.md, STATE.md, ARCHITECTURE.md, and decision-register.md are extraction
 * sources for this projection. They are not the complete canonical authority set.
 * Applicable canonical authority and mandatory reads remain defined by AGENTS.md
 * and the authorities it references. This file must not substitute for those reads.
 *
 * Usage:
 *   node scripts/governance-context.mjs --write
 *   node scripts/governance-context.mjs --check
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { loadLiveAuthorities } from "./governance-v2/load-authorities.mjs";
import { deriveNextGate } from "./governance-v2/tranche-graph.mjs";
import { CURRENT_AUTHORITY_KIND, parseCurrentGovernanceMeta } from "./governance-v2/schema.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "..");

export const SNAPSHOT_REL = "docs/platform/governance/current-context.json";

export const LIFECYCLE_STATES = Object.freeze([
  "PLANNED",
  "ARCHITECTURE_IN_PROGRESS",
  "ARCHITECTURE_LOCKED",
  "IMPLEMENTATION_IN_PROGRESS",
  "IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE",
  "COMPLETE_AND_ACCEPTED",
  "BLOCKED",
  "SUPERSEDED",
]);

const LIFECYCLE_STATE_SET = new Set(LIFECYCLE_STATES);

/**
 * Current-slice gate suffixes. Values are copied from current-position fences.
 * @type {readonly (readonly [string, string])[]}
 */
const GATE_FIELDS = Object.freeze([
  ["activated", "ACTIVATED"],
  ["productDefinition", "PRODUCT_DEFINITION"],
  ["productDefinitionVersion", "PRODUCT_DEFINITION_VERSION"],
  ["productDefinitionGate", "PRODUCT_DEFINITION_GATE"],
  ["experienceDefinition", "EXPERIENCE_DEFINITION"],
  ["experienceDefinitionVersion", "EXPERIENCE_DEFINITION_VERSION"],
  ["experienceGate", "EXPERIENCE_GATE"],
  ["architectureFit", "ARCHITECTURE_FIT"],
  ["architectureLocked", "ARCHITECTURE_LOCKED"],
  ["designReadiness", "DESIGN_READINESS"],
  ["implementationAuthorized", "IMPLEMENTATION_AUTHORIZED"],
  ["started", "STARTED"],
  ["implementationStarted", "IMPLEMENTATION_STARTED"],
  ["implementationComplete", "IMPLEMENTATION_COMPLETE"],
  ["accepted", "ACCEPTED"],
]);

const REQUIRED_BOTH_SOURCES = Object.freeze([
  "productDefinition",
  "productDefinitionGate",
  "architectureFit",
  "architectureLocked",
  "designReadiness",
  "implementationAuthorized",
  "accepted",
]);

const ROADMAP_REL = "docs/platform/ROADMAP.md";
const STATE_REL = "docs/platform/STATE.md";
const ARCHITECTURE_REL = "docs/platform/ARCHITECTURE.md";
const DECISION_REGISTER_REL = "docs/platform/decision-register.md";

/** Extraction sources for this projection. Not the complete canonical authority set. */
export const EXTRACTION_SOURCES = Object.freeze([
  ROADMAP_REL,
  STATE_REL,
  ARCHITECTURE_REL,
  DECISION_REGISTER_REL,
]);

export const GOVERNANCE_CONTEXT_NOTICE =
  "Generated current-position projection from GOV-2 machine-readable blocks in ROADMAP.md and STATE.md, plus ARCHITECTURE.md and decision-register.md metadata. These are extraction sources for this projection, not the complete canonical authority set. Applicable canonical authority and mandatory read requirements remain defined by AGENTS.md and the authorities it references. This projection must not substitute for applicable Product, Experience, Product Language, Architecture, Testing, or per-IMP authority.";

export class GovernanceContextError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.name = "GovernanceContextError";
    this.code = code;
  }
}

/**
 * @param {string} text
 * @param {string} rel
 */
function parseGovernanceMeta(text, rel) {
  const match = text.match(/<!--\s*governance-meta\s*([\s\S]*?)-->/);
  if (!match) {
    throw new GovernanceContextError("META_MISSING", `${rel}: missing governance-meta block`);
  }
  try {
    return JSON.parse(match[1]);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new GovernanceContextError("META_INVALID", `${rel}: ${detail}`);
  }
}

/**
 * @param {string} root
 * @param {string} rel
 */
function readRepoFile(root, rel) {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) {
    throw new GovernanceContextError("SOURCE_MISSING", rel);
  }
  return readFileSync(abs, "utf8");
}

/**
 * @param {string} text
 * @param {string} startHeading
 * @param {string} endHeading
 */
export function sectionBetween(text, startHeading, endHeading) {
  const start = text.indexOf(startHeading);
  if (start < 0) {
    throw new GovernanceContextError("SECTION_MISSING", startHeading);
  }
  const end = text.indexOf(`\n${endHeading}`, start + startHeading.length);
  if (end < 0) {
    throw new GovernanceContextError("SECTION_MISSING", endHeading);
  }
  return text.slice(start, end);
}

/**
 * Concatenate ```text fences. Prose outside fences is ignored so historical
 * narration cannot override the current-position machine block.
 * @param {string} section
 */
export function fencedTextBodies(section) {
  /** @type {string[]} */
  const bodies = [];
  const re = /```text\r?\n([\s\S]*?)```/g;
  let match = re.exec(section);
  while (match) {
    bodies.push(match[1]);
    match = re.exec(section);
  }
  if (bodies.length === 0) {
    throw new GovernanceContextError("FENCE_MISSING", "current-position section has no ```text fence");
  }
  return bodies.join("\n");
}

/**
 * Last KEY: VALUE assignment wins. Matches the repo convention that the
 * current tip is appended at the end of the current-position fence.
 * @param {string} fenced
 */
export function parseLastAssignments(fenced) {
  /** @type {Map<string, string>} */
  const map = new Map();
  for (const raw of fenced.split(/\r?\n/)) {
    const line = raw.trim();
    const match = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*;?\s*$/.exec(line);
    if (!match) continue;
    const value = match[2].trim();
    if (!value) continue;
    map.set(match[1], value);
  }
  return map;
}

/**
 * @param {string} fenced
 * @param {string} sliceId
 * @param {string} lifecycle
 */
function nextGateAfterLifecycle(fenced, sliceId, lifecycle) {
  const marker = `${sliceId}: ${lifecycle}`;
  const lines = fenced.split(/\r?\n/).map((line) => line.trim().replace(/;$/, ""));
  let markerIndex = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i] === marker) markerIndex = i;
  }
  if (markerIndex < 0) return null;
  /** @type {string | null} */
  let found = null;
  for (let i = markerIndex + 1; i < lines.length; i += 1) {
    const match = /^nextGate:\s*(.+)$/.exec(lines[i]);
    if (match) found = match[1].trim();
  }
  return found;
}

/**
 * @param {string} sectionText
 * @param {string} sliceId
 */
export function extractCurrentSlice(sectionText, sliceId) {
  if (!/^IMP-\d+[A-Z]?$/.test(sliceId)) {
    throw new GovernanceContextError(
      "SLICE_ID",
      `currentProductSlice must be a formal IMP id, got ${JSON.stringify(sliceId)}`,
    );
  }
  const fenced = fencedTextBodies(sectionText);
  const assignments = parseLastAssignments(fenced);
  const lifecycle = assignments.get(sliceId);
  if (!lifecycle || !LIFECYCLE_STATE_SET.has(lifecycle)) {
    throw new GovernanceContextError(
      "LIFECYCLE_MISSING",
      `no current-position lifecycle assignment for ${sliceId}`,
    );
  }
  const compact = sliceId.replace(/-/g, "");
  const prefixedNext = assignments.get(`${compact}_NEXT_GATE`) ?? null;
  const trailingNext = nextGateAfterLifecycle(fenced, sliceId, lifecycle);
  if (prefixedNext && trailingNext && prefixedNext !== trailingNext) {
    throw new GovernanceContextError(
      "NEXT_GATE_CONFLICT",
      `${compact}_NEXT_GATE ${prefixedNext} != nextGate ${trailingNext} after ${sliceId}`,
    );
  }
  const nextGate = prefixedNext ?? trailingNext;
  if (!nextGate) {
    throw new GovernanceContextError("NEXT_GATE_MISSING", `no next gate for ${sliceId}`);
  }
  /** @type {Record<string, string>} */
  const gates = {};
  for (const [field, suffix] of GATE_FIELDS) {
    const value = assignments.get(`${compact}_${suffix}`);
    if (value) gates[field] = value;
  }
  return { lifecycle, nextGate, gates };
}

/**
 * @param {string} label
 * @param {unknown} roadmapValue
 * @param {unknown} stateValue
 */
function requireSame(label, roadmapValue, stateValue) {
  if (typeof roadmapValue !== "string" || typeof stateValue !== "string" || roadmapValue !== stateValue) {
    throw new GovernanceContextError(
      "META_CONFLICT",
      `${label}: ROADMAP ${JSON.stringify(roadmapValue)} != STATE ${JSON.stringify(stateValue)}`,
    );
  }
  return roadmapValue;
}

/**
 * @param {string} root
 */
export function buildGovernanceContext(root = DEFAULT_ROOT) {
  const loaded = loadLiveAuthorities(root);
  if (!loaded.ok) {
    const detail = loaded.findings.map((item) => item.message ?? item.code).join("; ");
    throw new GovernanceContextError("GOV2_AUTHORITY", detail || "GOV-2 live authorities failed to load");
  }

  const roadmapText = readRepoFile(root, ROADMAP_REL);
  const stateText = readRepoFile(root, STATE_REL);
  const architectureText = readRepoFile(root, ARCHITECTURE_REL);
  const decisionText = readRepoFile(root, DECISION_REGISTER_REL);

  const roadmapMeta = parseCurrentGovernanceMeta(roadmapText, CURRENT_AUTHORITY_KIND.ROADMAP);
  const stateMeta = parseCurrentGovernanceMeta(stateText, CURRENT_AUTHORITY_KIND.STATE);
  const architectureMeta = parseGovernanceMeta(architectureText, ARCHITECTURE_REL);
  const decisionMeta = parseGovernanceMeta(decisionText, DECISION_REGISTER_REL);
  if (roadmapMeta.ok !== true) {
    throw new GovernanceContextError(roadmapMeta.code ?? "META_INVALID", roadmapMeta.message ?? "ROADMAP meta");
  }
  if (stateMeta.ok !== true) {
    throw new GovernanceContextError(stateMeta.code ?? "META_INVALID", stateMeta.message ?? "STATE meta");
  }

  const acceptedThrough = requireSame("acceptedThrough", loaded.roadmap.acceptedThrough, loaded.state.acceptedThrough);
  const currentProductSlice = requireSame("currentSlice", loaded.roadmap.currentSlice, loaded.state.currentSlice);
  const nextProductSlice = requireSame("nextSlice", loaded.roadmap.nextSlice, loaded.state.nextSlice);
  const gtmBoundary = loaded.roadmap.gtmBoundary;
  if (typeof gtmBoundary !== "string" || !gtmBoundary) {
    throw new GovernanceContextError("META_MISSING", "ROADMAP gtmBoundary");
  }
  if (typeof loaded.state.pendingAcceptance !== "string" || !loaded.state.pendingAcceptance) {
    throw new GovernanceContextError("META_MISSING", "STATE pendingAcceptance");
  }
  if (typeof roadmapMeta.meta.roadmapVersion !== "string" || typeof stateMeta.meta.stateVersion !== "string") {
    throw new GovernanceContextError("META_MISSING", "roadmapVersion or stateVersion");
  }
  if (typeof architectureMeta.architectureVersion !== "string") {
    throw new GovernanceContextError("META_MISSING", "architectureVersion");
  }
  if (typeof decisionMeta.decisionRegisterVersion !== "string") {
    throw new GovernanceContextError("META_MISSING", "decisionRegisterVersion");
  }

  const lifecycle = loaded.state.lifecyclePhase;
  const nextGate = deriveNextGate(loaded.plan, loaded.state.implementation?.trancheStatuses);
  const contracts =
    loaded.state.contracts != null && typeof loaded.state.contracts === "object" && !Array.isArray(loaded.state.contracts)
      ? loaded.state.contracts
      : {};

  return {
    schemaVersion: 1,
    authority: "NON_AUTHORITATIVE",
    notice: GOVERNANCE_CONTEXT_NOTICE,
    generatedBy: "scripts/governance-context.mjs",
    sources: [...EXTRACTION_SOURCES],
    versions: {
      roadmapVersion: roadmapMeta.meta.roadmapVersion,
      stateVersion: stateMeta.meta.stateVersion,
      architectureVersion: architectureMeta.architectureVersion,
      decisionRegisterVersion: decisionMeta.decisionRegisterVersion,
    },
    slices: {
      acceptedThrough,
      currentProductSlice,
      nextProductSlice,
      pendingAcceptance: loaded.state.pendingAcceptance,
      gtmBoundary,
    },
    lifecycle,
    nextGate,
    currentSliceGates: {
      slice: currentProductSlice,
      lifecycle,
      nextGate,
      ...contracts,
    },
    singleSourceGates: [],
  };
}

/**
 * @param {unknown} context
 */
export function serializeGovernanceContext(context) {
  return `${JSON.stringify(context, null, 2)}\n`;
}

/**
 * @param {string} onDisk
 * @param {string} generated
 * @returns {string | null}
 */
export function governanceContextDifference(onDisk, generated) {
  if (onDisk === generated) return null;
  return describeFirstDiff(onDisk, generated);
}

/**
 * @param {string} [root]
 */
export function evaluateGovernanceContextDrift(root = DEFAULT_ROOT) {
  const generated = serializeGovernanceContext(buildGovernanceContext(root));
  const abs = path.join(root, SNAPSHOT_REL);
  if (!existsSync(abs)) {
    return {
      ok: false,
      bytes: Buffer.byteLength(generated),
      message: `GOVERNANCE_CONTEXT_DRIFT missing ${SNAPSHOT_REL}`,
    };
  }
  const onDisk = readFileSync(abs, "utf8");
  const difference = governanceContextDifference(onDisk, generated);
  if (difference) {
    return {
      ok: false,
      bytes: Buffer.byteLength(generated),
      message: `GOVERNANCE_CONTEXT_DRIFT ${SNAPSHOT_REL} differs from extraction sources (${difference})`,
    };
  }
  return {
    ok: true,
    bytes: Buffer.byteLength(generated),
    message: `governance context snapshot matches extraction sources (${Buffer.byteLength(generated)} bytes; NON_AUTHORITATIVE)`,
  };
}

/**
 * @param {string} actual
 * @param {string} expected
 */
function describeFirstDiff(actual, expected) {
  const left = actual.split("\n");
  const right = expected.split("\n");
  const count = Math.max(left.length, right.length);
  for (let i = 0; i < count; i += 1) {
    if (left[i] !== right[i]) {
      const shown = (right[i] ?? "").slice(0, 180);
      return `first difference at line ${i + 1}: expected ${JSON.stringify(shown)}`;
    }
  }
  return "contents differ";
}

/**
 * @param {string} root
 */
function writeSnapshot(root) {
  const context = buildGovernanceContext(root);
  const text = serializeGovernanceContext(context);
  const abs = path.join(root, SNAPSHOT_REL);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, text);
  return { text, bytes: Buffer.byteLength(text) };
}

function printPass(bytes) {
  process.stdout.write("governance:context PASS\n");
  process.stdout.write(`bytes=${bytes}\n`);
  process.stdout.write(`path=${SNAPSHOT_REL}\n`);
  process.stdout.write("authority=NON_AUTHORITATIVE\n");
}

function main() {
  const argv = process.argv.slice(2);
  const write = argv.includes("--write");
  const check = argv.includes("--check");
  if (write === check) {
    process.stderr.write("Usage: node scripts/governance-context.mjs --write | --check\n");
    process.exit(2);
  }
  try {
    if (write) {
      const written = writeSnapshot(DEFAULT_ROOT);
      const drift = evaluateGovernanceContextDrift(DEFAULT_ROOT);
      if (!drift.ok) {
        process.stderr.write(`governance:context FAIL\n${drift.message}\n`);
        process.exit(1);
      }
      printPass(written.bytes);
      return;
    }
    const drift = evaluateGovernanceContextDrift(DEFAULT_ROOT);
    if (!drift.ok) {
      process.stderr.write(`governance:context FAIL\n${drift.message}\n`);
      process.exit(1);
    }
    printPass(drift.bytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`governance:context FAIL\n${message}\n`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
