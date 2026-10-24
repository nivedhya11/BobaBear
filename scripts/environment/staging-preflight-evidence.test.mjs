import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { BINDER_OUTCOME, EVIDENCE_PROVENANCE, STAGING_PREFLIGHT_PASS } from "./staging-evidence-binders.mjs";
import { EXIT_NOT_ESTABLISHED, gatherObservations, parseArgs, readArtifact, runReport } from "./staging-preflight-evidence.mjs";
import { PREFLIGHT_OUTCOME } from "./staging-preflight.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const cli = path.join(repositoryRoot, "scripts", "environment", "staging-preflight-evidence.mjs");

/** Deps that make every external probe fail closed without touching podman/gh/tsx. */
const INERT_DEPS = Object.freeze({
  fetchRemoteMain: () => null,
  fetchPublishingApi: () => ({ workflowApiStates: null, pagesHosting: null }),
  spawnProjection: () => ({ status: 1, stdout: "", stderr: "not run in test" }),
  inspectImage: () => {
    throw new Error("podman not invoked in test");
  },
  inspectContainer: () => {
    throw new Error("podman not invoked in test");
  },
  probeRuntime: () => ({ evidenceComplete: false, identityUnknown: true, podmanRootless: false, composeProject: null, postgresContainer: null, postgresVolume: null, unexpectedTarget: null }),
  readDiagnostic: () => ({ enabled: false, projectionKnown: false, conflict: false }),
});

test("parseArgs: recognised flags only; unknown arguments are rejected", () => {
  const options = parseArgs(["--offline", "--json", "--applied-ledger", "a.json", "--trivy-reports", "/r"]);
  assert.equal(options.offline, true);
  assert.equal(options.json, true);
  assert.equal(options.appliedLedger, "a.json");
  assert.equal(options.trivyReportsDir, "/r");
  assert.throws(() => parseArgs(["--ready"]), /Unknown argument/);
  assert.throws(() => parseArgs(["--force-pass"]), /Unknown argument/);
});

test("readArtifact: unreadable or non-object artifacts are null, never defaults", () => {
  assert.equal(readArtifact(null), null);
  assert.equal(readArtifact("/tmp/nope.json", () => { throw new Error("ENOENT"); }), null);
  assert.equal(readArtifact("/tmp/x.json", () => "not json"), null);
  assert.equal(readArtifact("/tmp/x.json", () => "[1]")?.length, 1);
  assert.equal(readArtifact("/tmp/x.json", () => "42"), null);
});

test("offline read-only run: overall BLOCKED, STAGING_PREFLIGHT_PASS NOT_ESTABLISHED, no binder BOUND without live proof", () => {
  const { options, result, lines } = runReport(["--offline"], INERT_DEPS);
  assert.equal(options.offline, true);
  assert.equal(result.decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.equal(result.stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);
  assert.ok(lines.includes("STAGING_MUTATION_PERFORMED NO"));
  assert.ok(lines.includes("PROBE_MODE OFFLINE_READ_ONLY"));
  assert.ok(lines.includes("STAGING_PREFLIGHT_PASS NOT_ESTABLISHED"));
  // Nothing live was observed for S2/S4/S5/S6/S8/runtime; they cannot be BOUND.
  for (const id of ["S2_PUBLISHING", "S4_DATABASE", "S5_RECOVERY", "S6_SECURITY", "S8_POSTGRES_INIT"]) {
    assert.notEqual(result.binders[id].outcome, BINDER_OUTCOME.BOUND, id);
  }
  // S2 policy lock is never asserted by the CLI.
  assert.equal(result.binders.S2_PUBLISHING.facts.policyLocked, false);
  assert.equal(result.binders.S2_PUBLISHING.outcome, BINDER_OUTCOME.BLOCKED);
});

test("file artifacts are at most RECORDED_ARTIFACT (never self-declared LIVE_PROBE); synthetic ones poison the result", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "boba-preflight-evidence-"));
  try {
    const ledger = path.join(dir, "ledger.json");
    writeFileSync(ledger, JSON.stringify({ provenance: { kind: EVIDENCE_PROVENANCE.SYNTHETIC, observedAt: new Date().toISOString() }, reachable: true, rows: [], target: {}, observedAt: new Date().toISOString() }));
    const { result } = runReport(["--offline", "--applied-ledger", ledger], INERT_DEPS);
    assert.equal(result.binders.S4_DATABASE.provenance.kind, EVIDENCE_PROVENANCE.SYNTHETIC);
    assert.ok(result.provenance.synthetic.includes("S4_DATABASE"));
    assert.equal(result.stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);

    const selfDeclaredLive = path.join(dir, "live.json");
    writeFileSync(selfDeclaredLive, JSON.stringify({ provenance: { kind: EVIDENCE_PROVENANCE.LIVE_PROBE, observedAt: new Date().toISOString() }, reachable: true, rows: [] }));
    const liveRun = runReport(["--offline", "--applied-ledger", selfDeclaredLive], INERT_DEPS);
    assert.equal(liveRun.result.binders.S4_DATABASE.provenance.kind, EVIDENCE_PROVENANCE.RECORDED_ARTIFACT, "a file cannot claim to be a live probe");

    const undated = path.join(dir, "undated.json");
    writeFileSync(undated, JSON.stringify({ provenance: { kind: "TOTALLY_REAL" }, reachable: true, rows: [] }));
    const undatedRun = runReport(["--offline", "--applied-ledger", undated], INERT_DEPS);
    assert.equal(undatedRun.result.binders.S4_DATABASE.provenance.kind, EVIDENCE_PROVENANCE.RECORDED_ARTIFACT);
    assert.equal(undatedRun.result.binders.S4_DATABASE.provenance.observedAt, null);
    assert.ok(undatedRun.result.provenance.nonGenuine.includes("S4_DATABASE"), "an undated recording is not genuine");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("gatherObservations never asserts S2 policy lock, runtime identity, or ledger reachability on its own", () => {
  const observations = gatherObservations(parseArgs(["--offline"]), INERT_DEPS);
  assert.deepEqual(observations.publishing.policyLock, { locked: false, authority: null });
  assert.equal(observations.database.appliedLedger, null);
  assert.equal(observations.database.baseline, null);
  assert.equal(observations.recovery.evidenceRecords.length, 0);
  assert.equal(observations.security.inspectedImages.length, 0);
  assert.equal(observations.capacity.buildFootprint, null);
  assert.equal(observations.postgresInit.disposition, null);
  assert.equal(observations.runtime.identityUnknown, true);
  assert.equal(observations.source.remoteMainSha, null);
  assert.ok(observations.postgresInit.gitTreeManifest.ok, "git-tree manifest for HEAD is a static read");
  assert.equal(observations.postgresInit.gitTreeManifest.digest, observations.postgresInit.candidateManifest.digest);
});

test("online mode queries GitHub by the LOCAL remote identity for both S1 and S2 (rename redirect observed, not assumed)", () => {
  const seen = { remote: null, publishing: null };
  const deps = {
    ...INERT_DEPS,
    fetchRemoteMain: ({ repository }) => { seen.remote = repository; return null; },
    fetchPublishingApi: ({ repository }) => { seen.publishing = repository; return { workflowApiStates: null, pagesHosting: null }; },
    inspectImage: () => { throw new Error("absent"); },
    inspectContainer: () => { throw new Error("absent"); },
  };
  const observations = gatherObservations(parseArgs([]), deps);
  assert.equal(typeof seen.remote, "string");
  assert.match(seen.remote, /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "identity passed to gh api is a strict owner/repo");
  assert.equal(seen.publishing, seen.remote);
  assert.equal(observations.source.remoteMainSha, null);
  assert.equal(observations.publishing.policyLock.locked, false);
});

test("CLI --offline --json emits machine-readable NOT_ESTABLISHED and exits non-zero (2) without mutation", () => {
  let stdout = null;
  let status = 0;
  try {
    stdout = execFileSync(process.execPath, [cli, "--offline", "--json"], { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    stdout = String(error.stdout);
    status = error.status;
  }
  assert.equal(status, EXIT_NOT_ESTABLISHED, "NOT_ESTABLISHED must never exit 0");
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);
  assert.equal(parsed.decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(Array.isArray(parsed.reasons) && parsed.reasons.length > 0);
  assert.equal(Object.keys(parsed.binders).length, 8);
  assert.equal(/BEGIN (RSA|OPENSSH)|password=|rzp_live/i.test(stdout), false);
});

test("CLI rejects unknown flags (no hidden bypass) with a non-zero exit", () => {
  assert.throws(() => execFileSync(process.execPath, [cli, "--offline", "--ready"], { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }), /Unknown argument/);
});
