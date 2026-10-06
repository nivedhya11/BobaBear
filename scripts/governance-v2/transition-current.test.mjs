import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { hasGov2Block, validateRepositoryTransition } from "./transition-current.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cli = path.join(root, "scripts/governance-v2/transition-current.mjs");
const HISTORY_DIR = path.join(root, "docs/platform/history");
const ROADMAP_REL = "docs/platform/ROADMAP.md";
const STATE_REL = "docs/platform/STATE.md";
const SKIP_OVERLAY = new Set(["node_modules", ".next", "out", "coverage", ".validation-logs"]);

function gitSha(spec) {
  const result = spawnSync("git", ["-C", root, "rev-parse", "--verify", `${spec}^{commit}`], { encoding: "utf8" });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function gov2MainBaseSha() {
  const mergeBase = spawnSync("git", ["-C", root, "merge-base", "HEAD", "origin/main"], { encoding: "utf8" });
  if (mergeBase.status === 0 && mergeBase.stdout.trim()) return mergeBase.stdout.trim();
  const originMain = gitSha("origin/main");
  if (originMain) return originMain;
  return gitSha("HEAD");
}

function uniquePreGov2Snapshot(pattern) {
  const matches = readdirSync(HISTORY_DIR).filter((name) => pattern.test(name));
  if (matches.length !== 1) return null;
  return {
    rel: path.join("docs/platform/history", matches[0]),
    text: readFileSync(path.join(HISTORY_DIR, matches[0]), "utf8"),
    hash: spawnSync("git", ["-C", root, "hash-object", path.join(HISTORY_DIR, matches[0])], {
      encoding: "utf8",
    }).stdout.trim(),
  };
}

function blobHashAt(sha, rel) {
  const result = spawnSync("git", ["-C", root, "rev-parse", "--verify", `${sha}:${rel}`], {
    encoding: "utf8",
  });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

/**
 * Prefer a HEAD-ancestry commit whose ROADMAP/STATE blobs equal the unique
 * pre-GOV2 snapshots and lack GOV-2 blocks. When history is shallow (common in
 * CI jobs without fetch-depth: 0), synthesize an equivalent detached commit
 * from those snapshots so bootstrap/rollback proofs remain generic.
 */
function resolvePreGov2BaseSha() {
  const roadmapSnap = uniquePreGov2Snapshot(/^ROADMAP-.*-pre-gov2\.md$/);
  const stateSnap = uniquePreGov2Snapshot(/^STATE-.*-pre-gov2\.md$/);
  if (!roadmapSnap?.hash || !stateSnap?.hash) return null;
  if (hasGov2Block(roadmapSnap.text, "roadmap") || hasGov2Block(stateSnap.text, "state")) {
    return null;
  }

  const fromHistory = findAncestryPreGov2Commit(roadmapSnap, stateSnap);
  if (fromHistory) return fromHistory;
  return synthesizePreGov2Commit(roadmapSnap, stateSnap);
}

function findAncestryPreGov2Commit(roadmapSnap, stateSnap) {
  const listed = spawnSync("git", ["-C", root, "rev-list", "HEAD", "--", STATE_REL], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (listed.status !== 0) return null;

  for (const sha of listed.stdout.split("\n").map((line) => line.trim()).filter(Boolean)) {
    if (blobHashAt(sha, STATE_REL) !== stateSnap.hash) continue;
    if (blobHashAt(sha, ROADMAP_REL) !== roadmapSnap.hash) continue;
    const stateText = spawnSync("git", ["-C", root, "show", `${sha}:${STATE_REL}`], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    const roadmapText = spawnSync("git", ["-C", root, "show", `${sha}:${ROADMAP_REL}`], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    if (stateText.status !== 0 || roadmapText.status !== 0) continue;
    if (hasGov2Block(stateText.stdout, "state") || hasGov2Block(roadmapText.stdout, "roadmap")) {
      continue;
    }
    return sha;
  }
  return null;
}

function synthesizePreGov2Commit(roadmapSnap, stateSnap) {
  const indexDir = mkdtempSync(path.join(tmpdir(), "gov2-pre-gov2-index-"));
  const indexFile = path.join(indexDir, "index");
  const env = {
    ...process.env,
    GIT_INDEX_FILE: indexFile,
    // Deterministic TEST_ONLY identity: do not depend on developer/CI git config.
    GIT_AUTHOR_NAME: "GOV-2 Test",
    GIT_AUTHOR_EMAIL: "gov2-test@example.invalid",
    GIT_AUTHOR_DATE: "1970-01-01T00:00:00Z",
    GIT_COMMITTER_NAME: "GOV-2 Test",
    GIT_COMMITTER_EMAIL: "gov2-test@example.invalid",
    GIT_COMMITTER_DATE: "1970-01-01T00:00:00Z",
  };
  const git = (args, options = {}) =>
    spawnSync("git", ["-C", root, ...args], { encoding: "utf8", env, ...options });

  try {
    const headTree = git(["read-tree", "HEAD"]);
    if (headTree.status !== 0) return null;

    const writeBlob = (text) => {
      const written = spawnSync("git", ["-C", root, "hash-object", "-w", "--stdin"], {
        encoding: "utf8",
        input: text,
      });
      if (written.status !== 0) return null;
      return written.stdout.trim();
    };
    const roadmapBlob = writeBlob(roadmapSnap.text);
    const stateBlob = writeBlob(stateSnap.text);
    if (!roadmapBlob || !stateBlob) return null;

    const updateRoadmap = git(["update-index", "--cacheinfo", `100644,${roadmapBlob},${ROADMAP_REL}`]);
    const updateState = git(["update-index", "--cacheinfo", `100644,${stateBlob},${STATE_REL}`]);
    if (updateRoadmap.status !== 0 || updateState.status !== 0) return null;

    const tree = git(["write-tree"]);
    if (tree.status !== 0) return null;
    const commit = git([
      "commit-tree",
      tree.stdout.trim(),
      "-m",
      "TEST_ONLY pre-GOV2 bootstrap base synthesized from unique history snapshots",
    ]);
    if (commit.status !== 0) return null;
    const sha = commit.stdout.trim();
    if (blobHashAt(sha, STATE_REL) !== stateSnap.hash) return null;
    if (blobHashAt(sha, ROADMAP_REL) !== roadmapSnap.hash) return null;
    return sha;
  } finally {
    rmSync(indexDir, { recursive: true, force: true });
  }
}

const preGov2BaseSha = resolvePreGov2BaseSha();

function requirePreGov2BaseSha() {
  assert.ok(
    preGov2BaseSha,
    "unique pre-GOV2 history snapshots must yield a commit whose ROADMAP/STATE blobs match and lack GOV-2 blocks",
  );
  return preGov2BaseSha;
}

function materializeOverlayRoot() {
  const tmp = mkdtempSync(path.join(tmpdir(), "gov2-transition-"));
  for (const name of readdirSync(root)) {
    if (SKIP_OVERLAY.has(name)) continue;
    const src = path.join(root, name);
    const dest = path.join(tmp, name);
    if (name === "docs") {
      cpSync(src, dest, { recursive: true });
    } else {
      symlinkSync(src, dest);
    }
  }
  symlinkSync(path.join(root, "node_modules"), path.join(tmp, "node_modules"));
  return tmp;
}

function mutateState(tmp, mutate) {
  const rel = "docs/platform/STATE.md";
  writeFileSync(path.join(tmp, rel), mutate(readFileSync(path.join(root, rel), "utf8")));
}

function runCli(tmp, baseSha) {
  return spawnSync(process.execPath, [cli, baseSha], {
    cwd: tmp,
    encoding: "utf8",
    env: { ...process.env, BOBA_PROJECT_ROOT: tmp },
  });
}

describe("GOV-2 authoritative transition command", () => {
  it("resolves a pre-GOV2 bootstrap base from unique history snapshots", () => {
    requirePreGov2BaseSha();
  });

  it("rejects pre-GOV2 bootstrap once live T8 has PASSed", () => {
    const base = requirePreGov2BaseSha();
    const result = spawnSync(process.execPath, [cli, base], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, BOBA_PROJECT_ROOT: root },
    });
    assert.notEqual(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(report.ok, false, JSON.stringify(report.findings, null, 2));
    assert.equal(report.MODE, "GOV2_BOOTSTRAP");
    assert.equal(report.BASE_HAS_GOV2, "NO");
    assert.equal(report.HEAD_HAS_GOV2, "YES");
    assert.ok(
      report.findings.some(
        (item) =>
          item.code === "GOV2_BOOTSTRAP_EXECUTION_MISMATCH" &&
          item.path === "implementation.trancheStatuses.T8",
      ),
      JSON.stringify(report.findings, null, 2),
    );
  });

  it("validates a normal GOV-2 to GOV-2 identity transition from git", () => {
    const head = gitSha("HEAD");
    assert.ok(head);
    const report = validateRepositoryTransition({ root, baseSha: head, headSha: head });
    assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
    assert.equal(report.MODE, "GOV2_TO_GOV2");
  });

  it("fails through the CI command when T8 PASS keeps stale T7 lastTransition", { timeout: 120_000 }, () => {
    const tmp = materializeOverlayRoot();
    try {
      mutateState(tmp, (text) => text.replace(/"tranche": "T8"/, '"tranche": "T7"'));
      const result = runCli(tmp, gov2MainBaseSha());
      assert.notEqual(result.status, 0, result.stdout);
      const report = JSON.parse(result.stdout);
      assert.equal(report.ok, false);
      assert.ok(
        report.findings.some(
          (item) =>
            item.code === "LAST_TRANSITION_TRANCHE_MISMATCH" || item.code === "INVALID_LAST_TRANSITION",
        ),
        JSON.stringify(report.findings, null, 2),
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("passes through the CI command when T8 PASS has valid lastTransition evidence", { timeout: 120_000 }, () => {
    const tmp = materializeOverlayRoot();
    try {
      const result = runCli(tmp, gov2MainBaseSha());
      assert.equal(result.status, 0, result.stderr || result.stdout);
      const report = JSON.parse(result.stdout);
      assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
      assert.equal(report.T8_STATUS, "PASS");
      assert.equal(
        JSON.parse(readFileSync(path.join(root, "docs/platform/STATE.md"), "utf8").match(/<!--\s*gov2-state\s*([\s\S]*?)-->/)[1])
          .implementation.trancheStatuses.T8,
        "PASS",
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("fails bootstrap when head GOV-2 execution mutates the pre-GOV2 current position", { timeout: 120_000 }, () => {
    const base = requirePreGov2BaseSha();
    const tmp = materializeOverlayRoot();
    try {
      const mutations = [
        { label: "T8", mutate: (text) => text.replace(/"T8": "NOT_STARTED"/, '"T8": "PASS"'), path: "implementation.trancheStatuses.T8" },
        { label: "complete", mutate: (text) => text.replace(/"complete": false/, '"complete": true'), path: "implementation.complete" },
        { label: "uat", mutate: (text) => text.replace(/"founderUat": "NOT_PERFORMED"/, '"founderUat": "PASS"'), path: "founderUat" },
        { label: "accepted", mutate: (text) => text.replace(/"accepted": false/, '"accepted": true'), path: "accepted" },
        { label: "lastTransition", mutate: (text) => text.replace(/"tranche": "T7"/, '"tranche": "T8"'), path: "lastTransition" },
      ];
      for (const mutation of mutations) {
        mutateState(tmp, mutation.mutate);
        const result = runCli(tmp, base);
        assert.notEqual(result.status, 0, `${mutation.label}: ${result.stdout}`);
        const report = JSON.parse(result.stdout);
        assert.equal(report.ok, false, mutation.label);
        assert.equal(report.MODE, "GOV2_BOOTSTRAP");
        assert.ok(
          report.findings.some((item) => item.code === "GOV2_BOOTSTRAP_EXECUTION_MISMATCH" && item.path === mutation.path),
          JSON.stringify({ label: mutation.label, findings: report.findings }, null, 2),
        );
        writeFileSync(path.join(tmp, "docs/platform/STATE.md"), readFileSync(path.join(root, "docs/platform/STATE.md"), "utf8"));
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("rejects rollback from GOV-2 to pre-GOV2", () => {
    const head = gitSha("HEAD");
    const base = requirePreGov2BaseSha();
    assert.ok(head);
    const report = validateRepositoryTransition({ root, baseSha: head, headSha: base });
    assert.equal(report.ok, false);
    assert.equal(report.MODE, "GOV2_ROLLBACK");
    assert.ok(report.findings.some((item) => item.code === "GOV2_ROLLBACK"));
  });

  it("fails bootstrap when an accepted markdown ledger identity is renamed", { timeout: 120_000 }, () => {
    const base = requirePreGov2BaseSha();
    const tmp = materializeOverlayRoot();
    try {
      const rel = "docs/platform/ROADMAP.md";
      const original = readFileSync(path.join(tmp, rel), "utf8");
      const mutated = original.replace(/"id": "IMP-001"/, '"id": "IMP-999"');
      assert.notEqual(mutated, original);
      writeFileSync(path.join(tmp, rel), mutated);
      const result = runCli(tmp, base);
      assert.notEqual(result.status, 0, result.stdout);
      const report = JSON.parse(result.stdout);
      assert.equal(report.ok, false);
      assert.ok(
        report.findings.some((item) => item.code === "ACCEPTED_CAPABILITY_REMOVED"),
        JSON.stringify(report.findings, null, 2),
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
