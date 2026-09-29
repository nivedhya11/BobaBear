import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  SNAPSHOT_REL,
  buildGovernanceContext,
  evaluateGovernanceContextDrift,
  extractCurrentSlice,
  sectionBetween,
  governanceContextDifference,
  serializeGovernanceContext,
} from "./governance-context.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FIXTURE = `## 2. Current Position
\`\`\`text
IMP-036I: COMPLETE_AND_ACCEPTED
nextGate: NONE
IMP036J_ARCHITECTURE_LOCKED: NO
IMP-036J: ARCHITECTURE_LOCKED
IMP036J_PRODUCT_DEFINITION: APPROVED
IMP036J_PRODUCT_DEFINITION_GATE: PASS
IMP036J_ARCHITECTURE_FIT: PASS
IMP036J_ARCHITECTURE_LOCKED: YES
IMP036J_DESIGN_READINESS: NOT_PERFORMED
IMP036J_IMPLEMENTATION_AUTHORIZED: NO
IMP036J_ACCEPTED: NO
IMP036J_NEXT_GATE: DESIGN_READINESS
nextGate: DESIGN_READINESS
\`\`\`

Historical prose must not win: nextGate: ARCHITECTURE_FIT and IMP036J_ARCHITECTURE_LOCKED: NO.
`;

describe("governance context extraction", () => {
  it("uses the last current-position fence assignment and ignores later prose", () => {
    const slice = extractCurrentSlice(FIXTURE, "IMP-036J");
    assert.equal(slice.lifecycle, "ARCHITECTURE_LOCKED");
    assert.equal(slice.nextGate, "DESIGN_READINESS");
    assert.equal(slice.gates.architectureLocked, "YES");
    assert.equal(slice.gates.productDefinition, "APPROVED");
    assert.equal(slice.gates.accepted, "NO");
  });

  it("does not let an earlier bare nextGate override the current slice tail", () => {
    const text = `\`\`\`text
nextGate: NONE
IMP-036J: PLANNED
IMP036J_NEXT_GATE: EXPERIENCE_GATE
IMP036J_PRODUCT_DEFINITION: APPROVED
IMP036J_PRODUCT_DEFINITION_GATE: PASS
IMP036J_ARCHITECTURE_FIT: NOT_PERFORMED
IMP036J_ARCHITECTURE_LOCKED: NO
IMP036J_DESIGN_READINESS: NOT_PERFORMED
IMP036J_IMPLEMENTATION_AUTHORIZED: NO
IMP036J_ACCEPTED: NO
\`\`\`
`;
    const slice = extractCurrentSlice(text, "IMP-036J");
    assert.equal(slice.lifecycle, "PLANNED");
    assert.equal(slice.nextGate, "EXPERIENCE_GATE");
  });

  it("isolates the current-position section from later historical records", () => {
    const doc = `# Doc
## 2. Current Position
\`\`\`text
IMP-036J: ARCHITECTURE_LOCKED
IMP036J_NEXT_GATE: DESIGN_READINESS
\`\`\`
## 3. Accepted Slices
\`\`\`text
IMP-036J: PLANNED
nextGate: ARCHITECTURE_FIT
\`\`\`
`;
    const section = sectionBetween(doc, "## 2. Current Position", "## 3. Accepted Slices");
    const slice = extractCurrentSlice(section, "IMP-036J");
    assert.equal(slice.lifecycle, "ARCHITECTURE_LOCKED");
    assert.equal(slice.nextGate, "DESIGN_READINESS");
  });
});

describe("governance context snapshot", () => {
  it("builds a deterministic non-authoritative manifest from canonical sources", () => {
    const first = serializeGovernanceContext(buildGovernanceContext(projectRoot));
    const second = serializeGovernanceContext(buildGovernanceContext(projectRoot));
    assert.equal(first, second);
    const parsed = JSON.parse(first);
    assert.equal(parsed.authority, "NON_AUTHORITATIVE");
    assert.equal(parsed.schemaVersion, 1);
    assert.match(parsed.notice, /remain the authority/);
    const roadmap = JSON.parse(
      readFileSync(path.join(projectRoot, "docs/platform/ROADMAP.md"), "utf8").match(
        /<!--\s*governance-meta\s*([\s\S]*?)-->/,
      )[1],
    );
    const state = JSON.parse(
      readFileSync(path.join(projectRoot, "docs/platform/STATE.md"), "utf8").match(
        /<!--\s*governance-meta\s*([\s\S]*?)-->/,
      )[1],
    );
    assert.equal(parsed.versions.roadmapVersion, roadmap.roadmapVersion);
    assert.equal(parsed.versions.stateVersion, state.stateVersion);
    assert.equal(parsed.slices.currentProductSlice, roadmap.currentProductSlice);
    assert.equal(parsed.slices.acceptedThrough, state.acceptedThrough);
    assert.equal(parsed.lifecycle, parsed.currentSliceGates.lifecycle);
    assert.equal(parsed.nextGate, parsed.currentSliceGates.nextGate);
    assert.ok(parsed.currentSliceGates.productDefinition);
    assert.ok(parsed.currentSliceGates.architectureLocked);
  });

  it("check passes when the committed snapshot matches canonical sources", () => {
    const drift = evaluateGovernanceContextDrift(projectRoot);
    assert.equal(drift.ok, true, drift.message);
    assert.equal(
      readFileSync(path.join(projectRoot, SNAPSHOT_REL), "utf8"),
      serializeGovernanceContext(buildGovernanceContext(projectRoot)),
    );
  });

  it("reports the first drifted line and does not treat a byte change as equal", () => {
    const generated = serializeGovernanceContext(buildGovernanceContext(projectRoot));
    assert.equal(governanceContextDifference(generated, generated), null);
    const drifted = generated.replace(
      '"authority": "NON_AUTHORITATIVE"',
      '"authority": "AUTHORITATIVE"',
    );
    const difference = governanceContextDifference(drifted, generated);
    assert.match(difference ?? "", /first difference at line/);
  });
});
