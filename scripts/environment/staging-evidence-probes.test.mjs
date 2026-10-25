import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { hashMigrationFile } from "../database/lib/migration-integrity.mjs";
import { POSTGRES_INIT_REASON, collectInitManifest } from "./postgres-init-identity.mjs";
import { BINDER_OUTCOME, BINDER_REASON, EVIDENCE_PROVENANCE, REQUIRED_STAGING_IMAGES, bindPostgresInitEvidence, bindPublishingEvidence, bindSourceEvidence } from "./staging-evidence-binders.mjs";
import {
  CONFIG_PROJECTION_SCHEMA,
  collectInitManifestFromGitTree,
  fetchRemoteMainObservation,
  liveProvenance,
  loadTrivyReports,
  parseImageInspect,
  parseMemInfoAvailableBytes,
  parsePublishingWorkflow,
  probeCapacitySnapshots,
  probeCommittedJournal,
  probeConfigurationObservation,
  probeDatabaseObservation,
  probeInspectedImages,
  probePublishingObservation,
  probeSourceObservation,
  recordedProvenance,
} from "./staging-evidence-probes.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const HEAD = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" }).trim();

test("provenance helpers tag kind and observation time", () => {
  const now = new Date("2026-10-24T08:00:00.000Z");
  assert.deepEqual(liveProvenance("p", ["s"], now), { kind: EVIDENCE_PROVENANCE.LIVE_PROBE, observedAt: "2026-10-24T08:00:00.000Z", probe: "p", sources: ["s"] });
  assert.equal(recordedProvenance("p", "2026-10-24T07:00:00.000Z").kind, EVIDENCE_PROVENANCE.RECORDED_ARTIFACT);
});

/* S1 ------------------------------------------------------------------- */

test("S1 probe: git facts are read-only and remote main stays unverified without a GitHub observation", () => {
  const calls = [];
  const git = (args) => {
    calls.push(args.join(" "));
    const key = args.join(" ");
    if (key === "remote get-url origin") return "git@github.com:nivedhya11/BobaBear.git\n";
    if (key === "branch --show-current") return "main\n";
    if (key === "rev-parse HEAD") return `${HEAD}\n`;
    if (key === "rev-parse origin/main") return `${HEAD}\n`;
    if (key === `rev-parse ${HEAD}^{tree}`) return "b".repeat(40) + "\n";
    if (key.startsWith("status --porcelain")) return "";
    throw new Error(`unexpected git ${key}`);
  };
  const obs = probeSourceObservation({ repositoryRoot: "/tmp/not-protected", git, remoteMain: null, now: new Date() });
  assert.equal(obs.remoteMainSha, null);
  assert.equal(obs.branch, "main");
  assert.equal(obs.headTree, obs.originMainTree);
  assert.equal(obs.provenance.kind, EVIDENCE_PROVENANCE.LIVE_PROBE);
  assert.equal(calls.every((c) => /^(remote get-url|branch --show-current|rev-parse|status --porcelain --untracked-files=no)/.test(c)), true, "only read-only git subcommands");
  const bound = bindSourceEvidence(obs);
  assert.equal(bound.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.ok(bound.findings.some((f) => f.code === BINDER_REASON.SOURCE_REMOTE_MAIN_UNVERIFIED));
});

test("S1 probe: real worktree facts never report a protected checkout as the candidate", () => {
  const obs = probeSourceObservation({ repositoryRoot, remoteMain: null });
  assert.equal(obs.head, HEAD);
  assert.equal(typeof obs.remoteUrl, "string");
  assert.equal(obs.checkoutPath.startsWith("/home/ajoshi/repos/boba-bear-platform"), false, "the primary checkout must not be the candidate");
});

test("S1 remote observation: gh failures yield null, never a fabricated SHA", () => {
  assert.equal(fetchRemoteMainObservation({ repository: "nivedhya11/bobabear-platform", spawn: () => { throw new Error("offline"); } }), null);
  const spawn = (cmd, args) => {
    assert.equal(cmd, "gh");
    assert.equal(args[0], "api");
    if (args[1] === "repos/nivedhya11/bobabear-platform") return JSON.stringify({ full_name: "nivedhya11/BobaBear", default_branch: "main" });
    if (args[1] === "repos/nivedhya11/bobabear-platform/branches/main") return JSON.stringify({ commit: { sha: HEAD } });
    throw new Error(`unexpected ${args[1]}`);
  };
  const remote = fetchRemoteMainObservation({ repository: "nivedhya11/bobabear-platform", spawn });
  assert.equal(remote.fullName, "nivedhya11/BobaBear");
  assert.equal(remote.sha, HEAD);
  assert.equal(fetchRemoteMainObservation({ repository: "x/y", spawn: () => "not json" }), null);
});

/* S2 ------------------------------------------------------------------- */

test("S2 probe: the committed deploy.yml is recognised as a push-to-main GitHub Pages publishing path", () => {
  const text = readFileSync(path.join(repositoryRoot, ".github", "workflows", "deploy.yml"), "utf8");
  const parsed = parsePublishingWorkflow(".github/workflows/deploy.yml", text);
  assert.deepEqual(parsed.triggers.find((t) => t.event === "push")?.branches, ["main"]);
  assert.equal(parsed.publishingSteps.length >= 1, true);
  assert.match(parsed.publishingSteps[0].uses, /peaceiris\/actions-gh-pages/);
  assert.equal(parsed.permissions.contents, "write");
  assert.equal(parsed.apiState, null, "file presence never implies an API state");
});

test("S2 probe: non-publishing workflows carry no publishing steps; API state is only what was observed", () => {
  const ci = parsePublishingWorkflow("ci.yml", "name: CI\non:\n  pull_request:\n  push:\n    branches: [main]\njobs:\n  test:\n    steps:\n      - uses: actions/checkout@v4\n");
  assert.equal(ci.publishingSteps.length, 0);
  assert.deepEqual(ci.triggers.find((t) => t.event === "push")?.branches, ["main"]);

  const files = { "deploy.yml": readFileSync(path.join(repositoryRoot, ".github", "workflows", "deploy.yml"), "utf8"), "ci.yml": "on: [push]\njobs: {}\n" };
  const obs = probePublishingObservation({
    repositoryRoot,
    workflowsDir: "/virtual",
    readDir: () => Object.keys(files),
    readFile: (p) => files[path.basename(p)],
    workflowApiStates: null,
    pagesHosting: null,
  });
  assert.equal(obs.policyLock.locked, false, "probe never asserts a Founder lock");
  assert.deepEqual(obs.operation, { kind: "STAGING_DEPLOY_LOCAL_PODMAN", pushesToBranches: [] });
  const bound = bindPublishingEvidence(obs);
  assert.equal(bound.outcome, BINDER_OUTCOME.BLOCKED);
  assert.equal(bound.evidence.publishing.deployWorkflowState, "UNKNOWN");
  assert.ok(bound.findings.some((f) => f.code === BINDER_REASON.PUBLISHING_POLICY_NOT_LOCKED));
  assert.ok(bound.findings.some((f) => f.code === BINDER_REASON.PUBLISHING_WORKFLOW_STATE_UNOBSERVED));

  const withState = probePublishingObservation({ ...obs, repositoryRoot, workflowsDir: "/virtual", readDir: () => Object.keys(files), readFile: (p) => files[path.basename(p)], workflowApiStates: new Map([["deploy.yml", "active"]]) });
  const activeBound = bindPublishingEvidence(withState);
  assert.equal(activeBound.evidence.publishing.deployWorkflowState, "active");
  assert.ok(activeBound.findings.some((f) => f.code === BINDER_REASON.PUBLISHING_ACTIVE_PATH_OBSERVED));
});

/* S3 ------------------------------------------------------------------- */

test("S3 probe: adapter failure yields no projections (binder UNKNOWN), never a fabricated VALID", () => {
  const obs = probeConfigurationObservation({ repositoryRoot, stagingEnvDir: "/tmp/none", spawn: () => { throw new Error("tsx missing"); }, diagnostic: { enabled: false, projectionKnown: false, conflict: false } });
  assert.equal(Array.isArray(obs.projections), true);
  assert.equal(obs.projections.length, 0);
  assert.equal(obs.requiredEnvFilesPresent, false);
  const failed = probeConfigurationObservation({ repositoryRoot, stagingEnvDir: "/tmp/none", spawn: () => ({ status: 1, stdout: JSON.stringify({ schema: CONFIG_PROJECTION_SCHEMA, projections: [{ service: "x" }] }) }) });
  assert.equal(failed.projections.length, 0, "non-zero exit is not a projection");
  const malformed = probeConfigurationObservation({ repositoryRoot, stagingEnvDir: "/tmp/none", spawn: () => ({ status: 0, stdout: "not-json" }) });
  assert.equal(malformed.projections.length, 0);
  const wrongSchema = probeConfigurationObservation({ repositoryRoot, stagingEnvDir: "/tmp/none", spawn: () => ({ status: 0, stdout: JSON.stringify({ schema: "other", projections: [{ service: "x" }] }) }) });
  assert.equal(wrongSchema.projections.length, 0);
  const good = probeConfigurationObservation({ repositoryRoot, stagingEnvDir: "/tmp/none", spawn: (cmd, args) => { assert.equal(cmd, process.execPath); assert.ok(args.includes("--json")); return { status: 0, stdout: JSON.stringify({ schema: CONFIG_PROJECTION_SCHEMA, projections: [{ service: "x" }] }) }; } });
  assert.equal(good.projections.length, 1);
});

/* S4 ------------------------------------------------------------------- */

test("S4 probe: committed journal hashes equal drizzle's migration hash for every committed migration", () => {
  const drizzleDir = path.join(repositoryRoot, "drizzle");
  const journal = probeCommittedJournal({ drizzleDir });
  assert.ok(journal && journal.entries.length > 0);
  const committed = JSON.parse(readFileSync(path.join(drizzleDir, "meta", "_journal.json"), "utf8"));
  assert.equal(journal.entries.length, committed.entries.length);
  for (const entry of journal.entries) {
    assert.equal(entry.sqlSha256, hashMigrationFile(path.join(drizzleDir, `${entry.tag}.sql`)));
    assert.match(entry.sqlSha256, /^[0-9a-f]{64}$/);
  }
  assert.equal(probeCommittedJournal({ drizzleDir: "/tmp/does-not-exist" }), null);
  assert.equal(probeCommittedJournal({ drizzleDir, hashFile: () => { throw new Error("unreadable"); } }), null);
});

test("S4 probe: never opens a database; applied ledger is only what an authorised artifact supplies", () => {
  const obs = probeDatabaseObservation({ drizzleDir: path.join(repositoryRoot, "drizzle") });
  assert.equal(obs.appliedLedger, null);
  assert.equal(obs.baseline, null);
  assert.ok(obs.provenance.sources.some((s) => /NOT probed/.test(s)));
});

/* S6 ------------------------------------------------------------------- */

test("S6 probe: image inspect parsing and absent images", () => {
  const parsed = parseImageInspect([{ Id: "sha256:" + "1".repeat(64), RepoDigests: ["localhost/x@sha256:" + "2".repeat(64)], Config: { Labels: { "org.opencontainers.image.revision": HEAD } } }]);
  assert.equal(parsed.revisionLabel, HEAD);
  assert.equal(parsed.repoDigests.length, 1);
  assert.equal(parseImageInspect(null), null);
  assert.equal(parseImageInspect([{ Id: "sha256:" + "1".repeat(64) }]).revisionLabel, null);

  const inspected = probeInspectedImages({ images: REQUIRED_STAGING_IMAGES, inspect: (image) => { if (image.includes("postgres")) throw new Error("no such image"); return [{ Id: "sha256:" + "3".repeat(64) }]; } });
  assert.equal(inspected.length, REQUIRED_STAGING_IMAGES.length - 1);
  assert.equal(inspected.some((i) => i.image.includes("postgres")), false);
});

test("S6 probe: Trivy report loading binds by ArtifactName and keeps CreatedAt as scan time", () => {
  const files = {
    "a.json": JSON.stringify({ SchemaVersion: 2, ArtifactName: "localhost/boba-bear/web-runtime:abc", CreatedAt: "2026-10-24T07:00:00Z", Results: [] }),
    "b.json": "{ not json",
    "c.json": JSON.stringify({ SchemaVersion: 2, Results: [] }),
  };
  const reports = loadTrivyReports({ dir: "/virtual", readDir: () => Object.keys(files), readFile: (p) => files[path.basename(p)], imageAliases: { "localhost/boba-bear/web-runtime:abc": "boba-bear/web-runtime" } });
  assert.equal(reports.length, 1);
  assert.equal(reports[0].image, "boba-bear/web-runtime");
  assert.equal(reports[0].scannedAt, "2026-10-24T07:00:00Z");
  assert.deepEqual(loadTrivyReports({ dir: null }), []);
  assert.deepEqual(loadTrivyReports({ dir: "/virtual", readDir: () => { throw new Error("ENOENT"); } }), []);
});

/* S7 ------------------------------------------------------------------- */

test("S7 probe: meminfo parsing and statfs snapshots are measured, not inferred", () => {
  assert.equal(parseMemInfoAvailableBytes("MemTotal:       32000000 kB\nMemAvailable:   16000000 kB\n"), 16000000 * 1024);
  assert.equal(parseMemInfoAvailableBytes("MemTotal:       32000000 kB\n"), null);
  const now = new Date("2026-10-24T08:00:00.000Z");
  const snapshots = probeCapacitySnapshots({
    filesystems: [{ id: "a", mountPoint: "/a", roles: ["build"] }, { id: "b", mountPoint: "/missing", roles: ["image-store"] }],
    statfs: (p) => { if (p === "/missing") throw new Error("ENOENT"); return { bavail: 10n, bsize: 4096n }; },
    readFile: () => "MemAvailable:   8388608 kB\n",
    now,
  });
  assert.equal(snapshots.filesystems[0].availableBytes, 40960);
  assert.equal(snapshots.filesystems[1].availableBytes, undefined);
  assert.equal(snapshots.memory.availableBytes, 8 * 1024 ** 3);
  assert.equal(snapshots.memory.measuredAt, now.toISOString());
  const noMem = probeCapacitySnapshots({ filesystems: [], statfs: () => ({ bavail: 1, bsize: 1 }), readFile: () => { throw new Error("no proc"); }, now });
  assert.equal(noMem.memory, null);
});

/* S8 ------------------------------------------------------------------- */

test("S8 probe: git-tree manifest for HEAD equals the working-tree manifest digest (same digest format)", () => {
  const fromTree = collectInitManifestFromGitTree(HEAD, "docker/postgres/init", { repositoryRoot });
  assert.equal(fromTree.ok, true, JSON.stringify(fromTree));
  const fromWorkingTree = collectInitManifest(path.join(repositoryRoot, "docker", "postgres", "init"));
  assert.equal(fromWorkingTree.ok, true, JSON.stringify(fromWorkingTree));
  // Working tree may legitimately be dirty under docker/postgres/init during development; if it
  // is not, the two manifests must be byte-identical.
  const dirty = execFileSync("git", ["status", "--porcelain", "--", "docker/postgres/init"], { cwd: repositoryRoot, encoding: "utf8" }).trim();
  if (dirty === "") {
    assert.equal(fromTree.digest, fromWorkingTree.digest);
    assert.deepEqual(fromTree.files.map((f) => f.relativePath), fromWorkingTree.files.map((f) => f.relativePath));
  }
  // Recompute the rollup independently to pin the digest format.
  const rollup = createHash("sha256");
  for (const f of fromTree.files) rollup.update(`${f.relativePath}\0${f.digest}\0${f.executable ? "x" : "-"}\n`);
  assert.equal(fromTree.digest, rollup.digest("hex"));
});

test("S8 probe: a different tree, symlink, or empty directory never yields a comparable PRESERVE digest", () => {
  const unreadable = collectInitManifestFromGitTree("0".repeat(40), "docker/postgres/init", { repositoryRoot });
  assert.equal(unreadable.ok, false);
  assert.equal(unreadable.reasonCode, POSTGRES_INIT_REASON.UNREADABLE);

  const symlink = collectInitManifestFromGitTree(HEAD, "docker/postgres/init", { git: () => `120000 blob ${"a".repeat(40)}\tdocker/postgres/init/evil.sql\0` });
  assert.equal(symlink.reasonCode, POSTGRES_INIT_REASON.UNSAFE_SYMLINK);

  const empty = collectInitManifestFromGitTree(HEAD, "docker/postgres/init", { git: () => "" });
  assert.equal(empty.reasonCode, POSTGRES_INIT_REASON.EXTRA_OR_MISSING_FILE);

  const escaped = collectInitManifestFromGitTree(HEAD, "docker/postgres/init", { git: () => `100644 blob ${"a".repeat(40)}\tdocker/other/x.sql\0` });
  assert.equal(escaped.reasonCode, POSTGRES_INIT_REASON.IDENTITY_CONFLICT);

  const drift = bindPostgresInitEvidence({
    provenance: liveProvenance("t"),
    disposition: { disposition: "PRESERVE", reasonCode: "SAME_CONTENT_SAME_PATH", contentDigest: "d".repeat(64) },
    candidateManifest: { ok: true, digest: "d".repeat(64) },
    gitTreeManifest: { ok: true, digest: "e".repeat(64) },
  });
  assert.equal(drift.outcome, BINDER_OUTCOME.BLOCKED);
});
