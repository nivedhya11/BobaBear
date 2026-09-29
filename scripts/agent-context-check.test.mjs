import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { evaluateAgentContextPackaging, REQUIRED_SKILLS } from "./agent-context-check.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SKILL_BODY = `---
name: NAME
description: Test skill description for packaging checks.
---

# Test

This procedure is subordinate to \`AGENTS.md\`. It is non-authoritative. Canonical authorities named by \`AGENTS.md\` prevail. On canonical conflict, STOP affected work.
`;

function kernelText() {
  return [
    "sole agent operating contract",
    "COMPETING_GOVERNANCE_AUTHORITY = NO",
    "NO_SOURCE_MUTATION_BEFORE_ALIGNMENT = YES",
    "FORCE_PUSH_OR_HISTORY_REWRITE_REQUIRES_R3 = YES",
    "NO_UNREVIEWED_DIRECT_MAIN_MUTATION = YES",
    "inventing undefined binding behaviour",
    "STOP AFFECTED WORK",
    "CANONICAL_CONFLICT_STOPS_AFFECTED_WORK = YES",
    "FOUNDER_UAT_VERDICT_OWNER = HUMAN_FOUNDER",
    "FORMAL_ACCEPTANCE_NOT_SELF_GRANTED = YES",
    "npm run working-tree:fingerprint",
    "git status --porcelain | sha256sum",
    "BRANCH_CLEANUP_ONLY_AFTER_REQUIRED_MACHINE_PROOF = YES",
    "DO_NOT_DELETE_UNIQUE_OR_UNCERTAIN_BRANCH_WORK = YES",
    "GENERATED_CURRENT_CONTEXT_AUTHORITY = NON_AUTHORITATIVE",
    ...REQUIRED_SKILLS.map((name) => `.cursor/skills/${name}/SKILL.md`),
  ].join("\n");
}

function writeFixture(root, mutate) {
  mkdirSync(path.join(root, "docs/platform/governance"), { recursive: true });
  writeFileSync(path.join(root, "AGENTS.md"), kernelText());
  writeFileSync(path.join(root, "CLAUDE.md"), "@AGENTS.md\n");
  writeFileSync(
    path.join(root, "docs/platform/governance/current-context.json"),
    `${JSON.stringify({ authority: "NON_AUTHORITATIVE" })}\n`,
  );
  for (const name of REQUIRED_SKILLS) {
    const dir = path.join(root, ".cursor/skills", name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "SKILL.md"), SKILL_BODY.replace("name: NAME", `name: ${name}`));
  }
  const decision = path.join(root, ".cursor/skills/boba-decision-required/SKILL.md");
  writeFileSync(decision, `${SKILL_BODY.replace("name: NAME", "name: boba-decision-required")}\nwhy_current_authority_is_insufficient\n`);
  mkdirSync(path.join(root, ".cursor/skills/boba-delivery-reporting/references"), { recursive: true });
  writeFileSync(
    path.join(root, ".cursor/skills/boba-delivery-reporting/references/templates.md"),
    "L. Proposed State Delta\n",
  );
  writeFileSync(
    path.join(root, ".cursor/skills/boba-founder-uat/SKILL.md"),
    `${SKILL_BODY.replace("name: NAME", "name: boba-founder-uat")}\nBOBA_BUILD_SHA\n`,
  );
  mkdirSync(path.join(root, ".cursor/skills/boba-branch-and-fingerprint/references"), { recursive: true });
  writeFileSync(
    path.join(root, ".cursor/skills/boba-branch-and-fingerprint/references/post-merge.md"),
    "git branch -D\n",
  );
  if (mutate) mutate(root);
}

describe("agent context packaging", () => {
  it("accepts the repository packaging", () => {
    const result = evaluateAgentContextPackaging(projectRoot);
    assert.deepEqual(result.failures, []);
    assert.equal(result.ok, true);
    assert.equal(result.measurement.skill_count, REQUIRED_SKILLS.length);
    assert.equal(result.measurement.cursor_rules, "ABSENT");
    assert.equal(result.measurement.claude_bytes, 11);
    const again = evaluateAgentContextPackaging(projectRoot);
    assert.deepEqual(again.measurement, result.measurement);
  });

  it("rejects a skill that disables invocation or claims authority", () => {
    const root = mkdtempSync(path.join(tmpdir(), "agent-context-"));
    try {
      writeFixture(root, (dir) => {
        const skill = path.join(dir, ".cursor/skills/boba-read-order/SKILL.md");
        writeFileSync(
          skill,
          `---
name: boba-read-order
description: Bad fixture.
disable-model-invocation: true
paths: "**/*.md"
---

This skill is the canonical architecture authority.
`,
        );
      });
      const result = evaluateAgentContextPackaging(root);
      assert.equal(result.ok, false);
      assert.ok(result.failures.some((line) => line.includes("disable-model-invocation")));
      assert.ok(result.failures.some((line) => line.includes("paths")));
      assert.ok(result.failures.some((line) => line.includes("canonical authority")));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a dropped kernel invariant and an authoritative current-context file", () => {
    const root = mkdtempSync(path.join(tmpdir(), "agent-context-"));
    try {
      writeFixture(root, (dir) => {
        const agents = kernelText().replace("NO_SOURCE_MUTATION_BEFORE_ALIGNMENT = YES\n", "");
        writeFileSync(path.join(dir, "AGENTS.md"), agents);
        writeFileSync(
          path.join(dir, "docs/platform/governance/current-context.json"),
          `${JSON.stringify({ authority: "AUTHORITATIVE" })}\n`,
        );
        mkdirSync(path.join(dir, ".cursor/rules"), { recursive: true });
      });
      const result = evaluateAgentContextPackaging(root);
      assert.equal(result.ok, false);
      assert.ok(result.failures.some((line) => line.includes("no source mutation before alignment")));
      assert.ok(result.failures.some((line) => line.includes("NON_AUTHORITATIVE")));
      assert.ok(result.failures.some((line) => line.includes(".cursor/rules")));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
