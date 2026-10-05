import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  bootstrapExecutionFindings,
  extractGov2Execution,
  extractPreGov2CurrentExecution,
} from "./bootstrap-execution.mjs";
import { loadLiveAuthorities } from "./load-authorities.mjs";
import { loadFixture } from "./load-fixture.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function syntheticState(recordBody) {
  return `<!-- governance-meta
{
  "status": "CURRENT",
  "authority": "ACCEPTED_STATE",
  "stateVersion": "STATE-SYNTH",
  "acceptedThrough": "IMP-001",
  "currentProductSlice": "IMP-002",
  "nextProductSlice": "NONE",
  "pendingAcceptance": "NONE"
}
-->

# Accepted State

## 10. STATE-SYNTH record

\`\`\`text
${recordBody}
\`\`\`
`;
}

function plan() {
  return {
    slice: "IMP-002",
    tranches: [
      { id: "T1", order: 1, required: true, dependencies: [] },
      { id: "T2", order: 2, required: true, dependencies: ["T1"] },
    ],
  };
}

const RECORD = `currentProductSlice: IMP-002
IMP002_IMPLEMENTATION_STARTED: YES
IMP002_IMPLEMENTATION_COMPLETE: NO
IMP002_ACCEPTED: NO
FOUNDER_UAT: NOT_PERFORMED
IMP002_TRANCHE_1: PASS
T2_STARTED: NO
IMPLEMENTATION_PR: #12
IMPLEMENTATION_MERGE_MAIN: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`;

describe("GOV-2 bootstrap execution extraction", () => {
  it("derives current execution from the unique CURRENT pre-GOV2 record and head plan IDs", () => {
    const extracted = extractPreGov2CurrentExecution(syntheticState(RECORD), plan());
    assert.equal(extracted.ok, true, JSON.stringify(extracted.findings, null, 2));
    assert.equal(extracted.execution.currentSlice, "IMP-002");
    assert.equal(extracted.execution.authorized, true);
    assert.equal(extracted.execution.complete, false);
    assert.equal(extracted.execution.accepted, false);
    assert.equal(extracted.execution.founderUat, "NOT_PERFORMED");
    assert.equal(extracted.execution.trancheStatuses.T1, "PASS");
    assert.equal(extracted.execution.trancheStatuses.T2, "NOT_STARTED");
    assert.equal(extracted.execution.lastTransition.tranche, "T1");
    assert.equal(extracted.execution.lastTransition.sourcePr, 12);
  });

  it("fails closed on missing or ambiguous current-record data", () => {
    const missing = extractPreGov2CurrentExecution(syntheticState("IMP002_ACCEPTED: NO"), plan());
    assert.equal(missing.ok, false);

    const ambiguous = extractPreGov2CurrentExecution(
      syntheticState(`${RECORD}\nFOUNDER_UAT: PASS`),
      plan(),
    );
    assert.equal(ambiguous.ok, false);
    assert.ok(ambiguous.findings.some((item) => item.code === "GOV2_BOOTSTRAP_EXECUTION_AMBIGUOUS"));
  });

  it("rejects bootstrap execution mutations without hard-coding live checkpoint ids", () => {
    const base = extractPreGov2CurrentExecution(syntheticState(RECORD), plan());
    assert.equal(base.ok, true, JSON.stringify(base.findings, null, 2));
    const head = {
      currentSlice: "IMP-002",
      implementation: {
        authorized: true,
        complete: true,
        trancheStatuses: { T1: "PASS", T2: "PASS" },
      },
      founderUat: "PASS",
      accepted: true,
      lastTransition: {
        type: "TRANCHE_PASS",
        tranche: "T2",
        sourcePr: 12,
        mergeCommit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
    };
    const findings = bootstrapExecutionFindings(base.execution, extractGov2Execution(head, plan()).execution);
    assert.ok(findings.some((item) => item.path === "implementation.trancheStatuses.T2"));
    assert.ok(findings.some((item) => item.path === "implementation.complete"));
    assert.ok(findings.some((item) => item.path === "founderUat"));
    assert.ok(findings.some((item) => item.path === "accepted"));
    assert.ok(findings.some((item) => item.path === "lastTransition"));
  });

  it("matches live GOV-2 execution to the unique pre-GOV2 STATE snapshot", () => {
    const history = path.join(root, "docs/platform/history");
    const matches = readdirSync(history).filter((name) => /^STATE-.*-pre-gov2\.md$/.test(name));
    assert.equal(matches.length, 1, JSON.stringify(matches));
    const snapshot = readFileSync(path.join(history, matches[0]), "utf8");
    const loaded = loadLiveAuthorities(root);
    assert.equal(loaded.ok, true, JSON.stringify(loaded.findings, null, 2));
    const base = extractPreGov2CurrentExecution(snapshot, loaded.plan);
    const head = extractGov2Execution(loaded.state, loaded.plan);
    assert.equal(base.ok, true, JSON.stringify(base.findings, null, 2));
    assert.equal(head.ok, true, JSON.stringify(head.findings, null, 2));
    assert.equal(bootstrapExecutionFindings(base.execution, head.execution).length, 0, JSON.stringify({
      base: base.execution,
      head: head.execution,
    }, null, 2));
    const fixturePlan = loadFixture(root, "imp036j-tranche-plan.json");
    assert.deepEqual(
      fixturePlan.tranches.map((tranche) => tranche.id),
      loaded.plan.tranches.map((tranche) => tranche.id),
    );
  });
});
