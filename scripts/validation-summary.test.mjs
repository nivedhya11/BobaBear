import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  firstActionableLine,
  fingerprintFromOutput,
  logFileName,
  runValidationSummary,
} from "./validation-summary.mjs";

describe("validation summary", () => {
  it("prints PASS/FAIL, fingerprint, and does not retry a failure", () => {
    /** @type {Record<string, number>} */
    const calls = {};
    const logDir = mkdtempSync(path.join(tmpdir(), "validation-summary-"));
    const summary = runValidationSummary({
      logDir,
      checks: ["project:consistency", "working-tree:fingerprint"],
      run(_root, script) {
        calls[script] = (calls[script] ?? 0) + 1;
        if (script === "project:consistency") {
          return {
            status: 1,
            stdout: "OK  note\nFAIL [META] docs/platform/STATE.md drifted\nproject:consistency — FAIL (1 failure(s))\n",
            stderr: "",
          };
        }
        return {
          status: 0,
          stdout: "WORKING_TREE_FINGERPRINT abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789\n",
          stderr: "",
        };
      },
    });

    assert.equal(calls["project:consistency"], 1);
    assert.equal(calls["working-tree:fingerprint"], 1);
    assert.equal(summary.overall, "FAIL");
    assert.match(summary.stdout, /^validation:summary FAIL\n/);
    assert.match(summary.stdout, /project:consistency FAIL\n/);
    assert.match(summary.stdout, /working-tree:fingerprint PASS\n/);
    assert.match(
      summary.stdout,
      /fingerprint abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789\n/,
    );
    assert.match(summary.stdout, /FIRST_FAILURE project:consistency: FAIL \[META\] docs\/platform\/STATE.md drifted\n/);
    assert.doesNotMatch(summary.stdout, /OK  note/);
    const log = readFileSync(path.join(logDir, logFileName("project:consistency")), "utf8");
    assert.match(log, /# exit: 1/);
    assert.match(log, /not a retry/);
    assert.match(log, /OK  note/);
    assert.match(log, /FAIL \[META\]/);
  });

  it("reads detailed output only to extract the first actionable failure", () => {
    const line = firstActionableLine(
      "# command: npm run project:consistency\n--- stdout ---\n> noise\nnpm notice\nFAIL [GATE] missing fence\n",
    );
    assert.equal(line, "FAIL [GATE] missing fence");
    assert.equal(
      fingerprintFromOutput("WORKING_TREE_FINGERPRINT 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef\n"),
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    );
  });

  it("passes when every check exits 0 and a fingerprint is present", () => {
    const summary = runValidationSummary({
      logDir: mkdtempSync(path.join(tmpdir(), "validation-summary-pass-")),
      checks: ["working-tree:fingerprint"],
      run() {
        return {
          status: 0,
          stdout: "WORKING_TREE_FINGERPRINT 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef\n",
          stderr: "",
        };
      },
    });
    assert.equal(summary.overall, "PASS");
    assert.equal(summary.firstFailure, null);
    assert.match(summary.stdout, /^validation:summary PASS\n/);
    assert.doesNotMatch(summary.stdout, /FIRST_FAILURE/);
  });
});
