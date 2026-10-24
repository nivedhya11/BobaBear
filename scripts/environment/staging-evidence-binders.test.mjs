import assert from "node:assert/strict";
import { test } from "node:test";

import { CHECKSUM_INTEGRITY_STATUS, ENVIRONMENT_CLASSIFICATION, EVIDENCE_SCHEMA_VERSION, OPERATION_STATUS, OPERATION_TYPE, PROOF_CODE, RECOVERY_LAYER } from "../recovery/constants.mjs";
import { POSTGRES_INIT_DISPOSITION, POSTGRES_INIT_REASON } from "./postgres-init-identity.mjs";
import {
  BINDER_ID,
  BINDER_OUTCOME,
  BINDER_REASON,
  CAPACITY_POLICY,
  EVIDENCE_PROVENANCE,
  EXPECTED_STAGING_COMPOSE_PROJECT,
  EXPECTED_STAGING_POSTGRES_CONTAINER,
  EXPECTED_STAGING_POSTGRES_VOLUME,
  REQUIRED_STAGING_IMAGES,
  STAGING_PREFLIGHT_PASS,
  assertGenuineStagingReadiness,
  bindCapacityEvidence,
  bindConfigurationEvidence,
  bindDatabaseEvidence,
  bindPostgresInitEvidence,
  bindPublishingEvidence,
  bindRecoveryEvidence,
  bindSecurityEvidence,
  bindSourceEvidence,
  bindStagingPreflightEvidence,
  canonicalizeRepositoryIdentity,
  decideBoundStagingPreflight,
  formatBinderReport,
  isSecretSafeProjection,
} from "./staging-evidence-binders.mjs";
import { PREFLIGHT_OUTCOME, PREFLIGHT_REASON, evaluateStagingDeployPreflight } from "./staging-preflight.mjs";

const NOW = new Date("2026-10-24T08:00:00.000Z");
const RECENT = "2026-10-24T07:58:00.000Z";
const HEAD = "a".repeat(40);
const TREE = "b".repeat(40);
const GiB = 1024 ** 3;

const SYNTHETIC = { kind: EVIDENCE_PROVENANCE.SYNTHETIC, observedAt: RECENT, probe: "fixture" };
const LIVE = { kind: EVIDENCE_PROVENANCE.LIVE_PROBE, observedAt: RECENT, probe: "test-live" };
const RECORDED = { kind: EVIDENCE_PROVENANCE.RECORDED_ARTIFACT, observedAt: RECENT, probe: "test-artifact" };

/* ------------------------------------------------------------------ */
/* Fixtures: all-good observations (synthetic by default)             */
/* ------------------------------------------------------------------ */

function sourceObservation(overrides = {}, provenance = SYNTHETIC) {
  return {
    provenance,
    remoteUrl: "git@github.com:nivedhya11/BobaBear.git",
    remoteRepositoryIdentity: "nivedhya11/BobaBear",
    remoteMainSha: HEAD,
    branch: "main",
    head: HEAD,
    originMain: HEAD,
    headTree: TREE,
    originMainTree: TREE,
    trackedDirty: "",
    checkoutPath: "/home/ajoshi/repos/boba-bear-wave-w2-d-staging",
    ...overrides,
  };
}

function publishingObservation(overrides = {}, provenance = SYNTHETIC) {
  return {
    provenance,
    workflows: [
      {
        path: ".github/workflows/deploy.yml",
        name: "Deploy to GitHub Pages",
        triggers: [{ event: "push", branches: ["main"] }],
        publishingSteps: [{ uses: "peaceiris/actions-gh-pages@84c30a85c19949d7eee79c4ff27748b70285e453", kind: "GH_PAGES_PUBLISH" }],
        permissions: { contents: "write" },
        apiState: "disabled_manually",
      },
    ],
    pagesHosting: { sourceBranch: "gh-pages", sourcePath: "/", cname: "thebobabear.in", httpsEnforced: true },
    policyLock: { locked: true, authority: "TEST-ONLY-LOCK (no real Founder lock exists)" },
    operation: { kind: "STAGING_DEPLOY_LOCAL_PODMAN", pushesToBranches: [] },
    ...overrides,
  };
}

function projection(service, processKind, overrides = {}) {
  return { service, processKind, envFiles: [".env.runtime.docker.local"], envFilesPresent: true, environment: "staging", nodeEnvSource: "dockerfile", ok: true, issues: [], ...overrides };
}

function configurationObservation(overrides = {}, provenance = SYNTHETIC) {
  return {
    provenance,
    projections: [
      projection("customer-auth", "worker"),
      projection("workforce-auth", "worker"),
      projection("customer-commerce", "worker"),
      projection("operations", "worker"),
      projection("migrate", "migration"),
    ],
    requiredEnvFilesPresent: true,
    diagnostic: { enabled: false, projectionKnown: true, conflict: false, invalid: false },
    ...overrides,
  };
}

const JOURNAL = {
  entries: [
    { idx: 0, tag: "0000_a", when: 1000, sqlSha256: "1".repeat(64) },
    { idx: 1, tag: "0001_b", when: 2000, sqlSha256: "2".repeat(64) },
    { idx: 2, tag: "0002_c", when: 3000, sqlSha256: "3".repeat(64) },
  ],
};
const TARGET = { composeProject: EXPECTED_STAGING_COMPOSE_PROJECT, container: EXPECTED_STAGING_POSTGRES_CONTAINER, volume: EXPECTED_STAGING_POSTGRES_VOLUME };

function databaseObservation(overrides = {}, provenance = SYNTHETIC) {
  return {
    provenance,
    committedJournal: JOURNAL,
    appliedLedger: {
      reachable: true,
      target: TARGET,
      rows: JOURNAL.entries.map((e) => ({ hash: e.sqlSha256, createdAt: e.when })),
      observedAt: RECENT,
    },
    baseline: { state: "COMPLETE_COMPATIBLE", target: TARGET, observedAt: RECENT },
    now: NOW,
    ...overrides,
  };
}

const SOURCE_MARKER = `${EXPECTED_STAGING_COMPOSE_PROJECT}:${EXPECTED_STAGING_POSTGRES_VOLUME}`;

function checkpointRecord(overrides = {}) {
  return {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    runId: "20261024T075000Z-aaaaaaaaaaaaaaaa",
    operationType: OPERATION_TYPE.LAYER2_LOGICAL_BACKUP,
    recoveryLayer: RECOVERY_LAYER.LAYER_2,
    status: OPERATION_STATUS.SUCCEEDED,
    readiness: "READY",
    startedAt: "2026-10-24T07:50:00.000Z",
    endedAt: "2026-10-24T07:55:00.000Z",
    candidate: { commitSha: HEAD, tree: TREE },
    sourceEnvironmentClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
    sourceIdentityMarker: SOURCE_MARKER,
    targetIdentityMarker: null,
    recoveryArtifactReference: "spaces://boba-recovery/staging/20261024T075000Z.dump.age",
    recoveryPoint: "2026-10-24T07:54:00.000Z",
    checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.MATCHED,
    validationResults: [{ code: PROOF_CODE.REMOTE_ARTIFACT_SHA256_VERIFIED }, { code: PROOF_CODE.COMPLETE_MARKER_WRITTEN_LAST }],
    findings: [],
    incomplete: false,
    ...overrides,
  };
}

function restoreRecord(overrides = {}) {
  return {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    runId: "20261024T075600Z-bbbbbbbbbbbbbbbb",
    operationType: OPERATION_TYPE.RESTORE_LOGICAL,
    recoveryLayer: RECOVERY_LAYER.LAYER_2,
    status: OPERATION_STATUS.SUCCEEDED,
    readiness: "READY",
    startedAt: "2026-10-24T07:56:00.000Z",
    endedAt: "2026-10-24T07:57:30.000Z",
    candidate: { commitSha: HEAD },
    sourceEnvironmentClassification: ENVIRONMENT_CLASSIFICATION.STAGING,
    sourceIdentityMarker: SOURCE_MARKER,
    targetIdentityMarker: "boba-recovery-isolated:restore-sandbox",
    recoveryArtifactReference: "spaces://boba-recovery/staging/20261024T075000Z.dump.age",
    recoveryPoint: "2026-10-24T07:54:00.000Z",
    checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.MATCHED,
    validationResults: [{ code: PROOF_CODE.DB_REACHABLE }, { code: PROOF_CODE.BUSINESS_INTEGRITY_VALIDATED }],
    findings: [],
    incomplete: false,
    ...overrides,
  };
}

function recoveryObservation(overrides = {}, provenance = SYNTHETIC) {
  return {
    provenance,
    evidenceRecords: [checkpointRecord(), restoreRecord()],
    stagingIdentity: { sourceIdentityMarker: SOURCE_MARKER },
    now: NOW,
    ...overrides,
  };
}

function imageId(seed) {
  return `sha256:${seed.repeat(64).slice(0, 64)}`;
}

function trivyReport(image, id, findings = []) {
  return {
    SchemaVersion: 2,
    CreatedAt: RECENT,
    ArtifactName: image,
    ArtifactType: "container_image",
    Metadata: { ImageID: id, RepoTags: [`localhost/${image}`] },
    Results: findings.length > 0 ? [{ Target: image, Misconfigurations: findings }] : [],
  };
}

function securityObservation(overrides = {}, provenance = SYNTHETIC) {
  const inspectedImages = REQUIRED_STAGING_IMAGES.map((t, i) => ({ image: t.image, imageId: imageId(String(i)), repoDigests: [], revisionLabel: HEAD }));
  const trivyReports = REQUIRED_STAGING_IMAGES.map((t, i) => ({ image: t.image, report: trivyReport(t.image, imageId(String(i))), scannedAt: RECENT }));
  return {
    provenance,
    candidateHead: HEAD,
    inspectedImages,
    trivyReports,
    exceptionPolicy: { todayIso: "2026-10-24", errors: [], activeByFinding: new Map() },
    issue409RiskWaived: false,
    now: NOW,
    ...overrides,
  };
}

function capacityObservation(overrides = {}, provenance = SYNTHETIC) {
  return {
    provenance,
    candidateHead: HEAD,
    filesystems: [
      { id: "repo", mountPoint: "/home", roles: ["build"], availableBytes: 120 * GiB, measuredAt: RECENT },
      { id: "podman", mountPoint: "/home/x/.local/share/containers/storage", roles: ["image-store"], availableBytes: 120 * GiB, measuredAt: RECENT },
    ],
    buildFootprint: { candidateHead: HEAD, bytesByFilesystemId: { repo: 6 * GiB, podman: 14 * GiB }, measuredAt: RECENT, source: "authorised-measurement" },
    memory: { availableBytes: 24 * GiB, measuredAt: RECENT },
    peakMemoryDemand: { candidateHead: HEAD, bytes: 9 * GiB, measuredAt: RECENT, source: "authorised-measurement" },
    preservation: {
      priorImages: REQUIRED_STAGING_IMAGES.map((t) => ({ image: t.image, present: true })),
      rollbackImagesPresent: true,
      postgresVolumePresent: true,
      unintendedPostgresReplacement: false,
    },
    now: NOW,
    ...overrides,
  };
}

const INIT_DIGEST = "c".repeat(64);
function postgresInitObservation(overrides = {}, provenance = SYNTHETIC) {
  return {
    provenance,
    disposition: { disposition: POSTGRES_INIT_DISPOSITION.PRESERVE, reasonCode: POSTGRES_INIT_REASON.SAME_CONTENT_SAME_PATH, contentDigest: INIT_DIGEST, preserveMountSource: "/x/.env.staging/runtime-assets/postgres-init/" + HEAD },
    candidateManifest: { ok: true, digest: INIT_DIGEST, files: [] },
    gitTreeManifest: { ok: true, digest: INIT_DIGEST, files: [] },
    ...overrides,
  };
}

function runtimeObservation(provenance = SYNTHETIC) {
  return {
    provenance,
    evidenceComplete: true,
    identityUnknown: false,
    podmanRootless: true,
    composeProject: EXPECTED_STAGING_COMPOSE_PROJECT,
    postgresContainer: EXPECTED_STAGING_POSTGRES_CONTAINER,
    postgresVolume: EXPECTED_STAGING_POSTGRES_VOLUME,
    unexpectedTarget: false,
  };
}

function allObservations(provenance = SYNTHETIC) {
  return {
    source: sourceObservation({}, provenance),
    publishing: publishingObservation({}, provenance),
    configuration: configurationObservation({}, provenance),
    database: databaseObservation({}, provenance),
    recovery: recoveryObservation({}, provenance),
    security: securityObservation({}, provenance),
    capacity: capacityObservation({}, provenance),
    postgresInit: postgresInitObservation({}, provenance),
    runtime: runtimeObservation(provenance),
  };
}

function hasFinding(bound, code) {
  return bound.findings.some((f) => f.code === code);
}

function engineCategory(bound, category) {
  // Evaluate the single section inside an otherwise-valid engine evidence object.
  return evaluateStagingDeployPreflight({ ...bindStagingPreflightEvidence(allObservations()).evidence, ...bound.evidence }).categories[category];
}

/* ------------------------------------------------------------------ */
/* S1                                                                 */
/* ------------------------------------------------------------------ */

test("S1: canonical identity alias forms normalise; forks and renames without API confirmation do not", () => {
  for (const alias of [
    "git@github.com:nivedhya11/BobaBear.git",
    "git@github.com:nivedhya11/BobaBear",
    "ssh://git@github.com/nivedhya11/BobaBear.git",
    "https://github.com/nivedhya11/BobaBear",
    "https://github.com/nivedhya11/BobaBear.git/",
    "https://www.github.com/nivedhya11/bobabear",
    "nivedhya11/BobaBear",
  ]) {
    const result = canonicalizeRepositoryIdentity(alias);
    assert.equal(result.ok, true, alias);
    assert.equal(result.identity, "nivedhya11/BobaBear");
  }
  assert.equal(canonicalizeRepositoryIdentity("https://github.com/nivedhya11/BobaBear").aliasObserved, true);
  assert.equal(canonicalizeRepositoryIdentity("nivedhya11/BobaBear").aliasObserved, false);
  assert.equal(canonicalizeRepositoryIdentity("git@github.com:someone/BobaBear.git").ok, false);
  assert.equal(canonicalizeRepositoryIdentity("git@gitlab.com:nivedhya11/BobaBear.git").ok, false);
  assert.equal(canonicalizeRepositoryIdentity("").ok, false);
  assert.equal(canonicalizeRepositoryIdentity(null).ok, false);
});

test("S1: exact main + remote verified -> BOUND; engine source PASS", () => {
  const bound = bindSourceEvidence(sourceObservation());
  assert.equal(bound.outcome, BINDER_OUTCOME.BOUND);
  assert.equal(bound.evidence.source.repositoryIdentity, "nivedhya11/BobaBear");
  assert.equal(engineCategory(bound, "source"), PREFLIGHT_OUTCOME.PASS);
});

test("S1: renamed-repository remote is accepted only when GitHub API confirms the redirect", () => {
  const renamed = sourceObservation({ remoteUrl: "git@github.com:nivedhya11/bobabear-platform.git" });
  const confirmed = bindSourceEvidence(renamed);
  assert.equal(confirmed.outcome, BINDER_OUTCOME.BOUND);
  assert.ok(hasFinding(confirmed, BINDER_REASON.SOURCE_REPOSITORY_ALIAS_NORMALIZED));
  assert.equal(confirmed.facts.redirectVerified, true);
  assert.equal(confirmed.evidence.source.repositoryIdentity, "nivedhya11/BobaBear");

  const unconfirmed = bindSourceEvidence(sourceObservation({ remoteUrl: "git@github.com:nivedhya11/bobabear-platform.git", remoteRepositoryIdentity: null }));
  assert.equal(unconfirmed.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(unconfirmed, BINDER_REASON.SOURCE_REPOSITORY_NOT_CANONICAL));
  assert.equal(engineCategory(unconfirmed, "source"), PREFLIGHT_OUTCOME.BLOCKED);

  const fork = bindSourceEvidence(sourceObservation({ remoteUrl: "git@github.com:someone/BobaBear.git", remoteRepositoryIdentity: "someone/BobaBear" }));
  assert.equal(fork.outcome, BINDER_OUTCOME.BLOCKED);
  assert.equal(engineCategory(fork, "source"), PREFLIGHT_OUTCOME.BLOCKED);
});

test("S1 negatives: remote unverified -> UNKNOWN; drift/dirty/protected/branch/tree -> BLOCKED", () => {
  const unverified = bindSourceEvidence(sourceObservation({ remoteMainSha: null }));
  assert.equal(unverified.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.ok(hasFinding(unverified, BINDER_REASON.SOURCE_REMOTE_MAIN_UNVERIFIED));

  // [override, expected finding, engine also blocks?]. Remote-main drift is a
  // binder-level strictness beyond the engine contract; the engine evidence
  // stays truthful and the aggregate decision (not the engine) refuses it.
  const cases = [
    [{ remoteMainSha: "d".repeat(40) }, BINDER_REASON.SOURCE_REMOTE_MAIN_DRIFT, false],
    [{ trackedDirty: " M scripts/x.mjs" }, BINDER_REASON.SOURCE_TRACKED_DIRTY, true],
    [{ checkoutPath: "/home/ajoshi/repos/boba-bear-platform" }, BINDER_REASON.SOURCE_CHECKOUT_PROTECTED, true],
    [{ checkoutPath: "/home/ajoshi/repos/boba-bear-platform/sub" }, BINDER_REASON.SOURCE_CHECKOUT_PROTECTED, true],
    [{ branch: "feat/x" }, BINDER_REASON.SOURCE_NOT_EXACT_MAIN, true],
    [{ originMain: "e".repeat(40), remoteMainSha: "e".repeat(40) }, BINDER_REASON.SOURCE_NOT_EXACT_MAIN, true],
    [{ originMainTree: "f".repeat(40) }, BINDER_REASON.SOURCE_NOT_EXACT_MAIN, true],
    [{ head: "abc" }, BINDER_REASON.SOURCE_NOT_EXACT_MAIN, true],
  ];
  for (const [override, code, engineBlocks] of cases) {
    const bound = bindSourceEvidence(sourceObservation(override));
    assert.equal(bound.outcome, BINDER_OUTCOME.BLOCKED, JSON.stringify(override));
    assert.ok(hasFinding(bound, code), `${code} for ${JSON.stringify(override)}`);
    if (engineBlocks) assert.equal(engineCategory(bound, "source"), PREFLIGHT_OUTCOME.BLOCKED, JSON.stringify(override));
    const aggregate = decideBoundStagingPreflight(bindStagingPreflightEvidence({ ...allObservations(LIVE), source: sourceObservation(override, LIVE) }));
    assert.equal(aggregate.stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED, JSON.stringify(override));
  }
  const missing = bindSourceEvidence(undefined);
  assert.equal(missing.outcome, BINDER_OUTCOME.UNKNOWN);
});

/* ------------------------------------------------------------------ */
/* S2                                                                 */
/* ------------------------------------------------------------------ */

test("S2: unlocked policy stays BLOCKED even when the workflow is observed disabled", () => {
  const bound = bindPublishingEvidence(publishingObservation({ policyLock: { locked: false, authority: null } }));
  assert.equal(bound.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(bound, BINDER_REASON.PUBLISHING_POLICY_NOT_LOCKED));
  assert.equal(bound.facts.safetyClassification, "UNRESOLVED_POLICY");
  assert.equal(bound.evidence.publishing.unsafeActivePublishingPath, true);
  assert.equal(engineCategory(bound, "publishing"), PREFLIGHT_OUTCOME.BLOCKED);
});

test("S2: active publishing workflow -> BLOCKED; file presence alone never yields disabled_manually", () => {
  const active = bindPublishingEvidence(publishingObservation({ workflows: [{ ...publishingObservation().workflows[0], apiState: "active" }] }));
  assert.equal(active.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(active, BINDER_REASON.PUBLISHING_ACTIVE_PATH_OBSERVED));
  assert.equal(active.evidence.publishing.deployWorkflowState, "active");

  const unobserved = bindPublishingEvidence(publishingObservation({ workflows: [{ ...publishingObservation().workflows[0], apiState: null }] }));
  assert.equal(unobserved.evidence.publishing.deployWorkflowState, "UNKNOWN");
  assert.ok(hasFinding(unobserved, BINDER_REASON.PUBLISHING_WORKFLOW_STATE_UNOBSERVED));
  assert.notEqual(unobserved.outcome, BINDER_OUTCOME.BOUND);

  const forged = bindPublishingEvidence(publishingObservation({ workflows: [{ ...publishingObservation().workflows[0], apiState: "disabled_by_me" }] }));
  assert.equal(forged.evidence.publishing.deployWorkflowState, "UNKNOWN");
});

test("S2: hosting is an observation distinct from a publishing operation", () => {
  const bound = bindPublishingEvidence(publishingObservation());
  assert.equal(bound.outcome, BINDER_OUTCOME.BOUND);
  assert.deepEqual(bound.facts.existingPagesHosting, { sourceBranch: "gh-pages", sourcePath: "/", cname: "thebobabear.in", httpsEnforced: true });
  assert.equal(bound.facts.publishingPaths[0].effect, "PUBLISHES_PUBLIC_SITE");
  assert.deepEqual(bound.facts.publishingPaths[0].pushBranches, ["main"]);
  assert.equal(bound.facts.publishingPaths[0].reachableByOperation, false);
  assert.equal(engineCategory(bound, "publishing"), PREFLIGHT_OUTCOME.PASS);

  const hostingUnknown = bindPublishingEvidence(publishingObservation({ pagesHosting: null }));
  assert.equal(hostingUnknown.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.equal(hostingUnknown.evidence.publishing.pagesSourceKnown, false);

  // An operation that pushes to a publishing trigger branch is unsafe unless the
  // path is positively observed disabled_manually; unobserved state is not safety.
  const reachable = bindPublishingEvidence(
    publishingObservation({
      operation: { kind: "PUSH_MAIN", pushesToBranches: ["main"] },
      workflows: [{ ...publishingObservation().workflows[0], apiState: null }],
    }),
  );
  assert.equal(reachable.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(reachable, BINDER_REASON.PUBLISHING_UNSAFE_ACTION_OBSERVED));
  assert.equal(reachable.facts.publishingPaths[0].reachableByOperation, true);
  assert.notEqual(engineCategory(reachable, "publishing"), PREFLIGHT_OUTCOME.PASS);
});

/* ------------------------------------------------------------------ */
/* S3                                                                 */
/* ------------------------------------------------------------------ */

test("S3: strict staging projections valid for every required service -> BOUND; engine environment PASS", () => {
  const bound = bindConfigurationEvidence(configurationObservation());
  assert.equal(bound.outcome, BINDER_OUTCOME.BOUND);
  assert.equal(bound.evidence.environment.projectedConfigState, "VALID");
  assert.equal(bound.evidence.environment.secretsPrinted, false);
  assert.equal(engineCategory(bound, "environment"), PREFLIGHT_OUTCOME.PASS);
});

test("S3: BOBA_BEAR_ENV=local is Local UAT, never strict staging (D-385)", () => {
  const obs = configurationObservation();
  obs.projections[2] = projection("customer-commerce", "worker", { environment: "local" });
  const bound = bindConfigurationEvidence(obs);
  assert.equal(bound.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(bound, BINDER_REASON.CONFIG_LOCAL_UAT_NOT_STRICT_STAGING));
  assert.ok(hasFinding(bound, BINDER_REASON.CONFIG_ENVIRONMENT_DRIFT_ACROSS_SERVICES));
  assert.equal(bound.evidence.environment.projectedConfigState, "LOCAL_UAT_NOT_STAGING");
  assert.equal(bound.evidence.environment.projectedConfigValid, false);
  assert.equal(engineCategory(bound, "environment"), PREFLIGHT_OUTCOME.BLOCKED);
});

test("S3 negatives: invalid strict staging, missing service, unknown env, production, diagnostic on", () => {
  const invalid = configurationObservation();
  invalid.projections[0] = projection("customer-auth", "worker", { ok: false, issues: [{ key: "BOBA_BEAR_PUBLIC_ORIGIN", message: "HTTPS is required in staging and production." }] });
  const b1 = bindConfigurationEvidence(invalid);
  assert.equal(b1.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(b1, BINDER_REASON.CONFIG_STRICT_STAGING_INVALID));
  assert.equal(engineCategory(b1, "environment"), PREFLIGHT_OUTCOME.BLOCKED);

  const missing = configurationObservation();
  missing.projections.pop();
  const b2 = bindConfigurationEvidence(missing);
  assert.equal(b2.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.ok(hasFinding(b2, BINDER_REASON.CONFIG_PROJECTION_MISSING));
  assert.equal(b2.evidence.environment.projectedConfigState, "UNKNOWN");
  assert.notEqual(engineCategory(b2, "environment"), PREFLIGHT_OUTCOME.PASS);

  const unreadable = configurationObservation();
  unreadable.projections[1] = projection("workforce-auth", "worker", { envFilesPresent: false, environment: "MISSING", ok: false });
  assert.equal(bindConfigurationEvidence(unreadable).outcome, BINDER_OUTCOME.UNKNOWN);

  const production = configurationObservation();
  production.projections[1] = projection("workforce-auth", "worker", { environment: "production" });
  const b3 = bindConfigurationEvidence(production);
  assert.equal(b3.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(b3, BINDER_REASON.CONFIG_NOT_STAGING_ENVIRONMENT));

  const diag = bindConfigurationEvidence(configurationObservation({ diagnostic: { enabled: true, projectionKnown: true, conflict: false } }));
  assert.equal(diag.outcome, BINDER_OUTCOME.BLOCKED);
  assert.equal(engineCategory(diag, "environment"), PREFLIGHT_OUTCOME.BLOCKED);

  const conflict = bindConfigurationEvidence(configurationObservation({ diagnostic: { enabled: false, projectionKnown: false, conflict: true, invalid: true } }));
  assert.equal(conflict.outcome, BINDER_OUTCOME.BLOCKED);

  const diagUnknown = bindConfigurationEvidence(configurationObservation({ diagnostic: { enabled: false, projectionKnown: false, conflict: false } }));
  assert.equal(diagUnknown.outcome, BINDER_OUTCOME.UNKNOWN);
});

test("S3: projections carrying raw values are refused as not secret-safe", () => {
  assert.equal(isSecretSafeProjection(projection("x", "worker")), true);
  assert.equal(isSecretSafeProjection({ ...projection("x", "worker"), values: { BOBA_BEAR_DATABASE_URL: "postgresql://u:p@h/db" } }), false);
  assert.equal(isSecretSafeProjection({ ...projection("x", "worker"), issues: [{ key: "K", message: "m", raw: "secret" }] }), false);
  const obs = configurationObservation();
  obs.projections[0] = { ...projection("customer-auth", "worker"), source: { BOBA_BEAR_RAZORPAY_KEY_SECRET: "rzp_live_secret" } };
  const bound = bindConfigurationEvidence(obs);
  assert.equal(bound.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(bound, BINDER_REASON.CONFIG_PROJECTION_NOT_SECRET_SAFE));
  assert.equal(bound.evidence.environment.secretsPrinted, true);
  assert.equal(JSON.stringify(bound).includes("rzp_live_secret"), false);
  assert.equal(engineCategory(bound, "environment"), PREFLIGHT_OUTCOME.BLOCKED);
});

/* ------------------------------------------------------------------ */
/* S4                                                                 */
/* ------------------------------------------------------------------ */

test("S4: applied ledger == committed journal -> APPLIED_CURRENT BOUND; engine database PASS", () => {
  const bound = bindDatabaseEvidence(databaseObservation());
  assert.equal(bound.outcome, BINDER_OUTCOME.BOUND);
  assert.equal(bound.evidence.database.migrationLedgerState, "APPLIED_CURRENT");
  assert.equal(bound.facts.pendingCount, 0);
  assert.equal(engineCategory(bound, "database"), PREFLIGHT_OUTCOME.PASS);
});

test("S4: exact prefix ledger -> LEDGER_CURRENT; pending tail must be explained", () => {
  const obs = databaseObservation();
  obs.appliedLedger.rows = obs.appliedLedger.rows.slice(0, 2);
  const unexplained = bindDatabaseEvidence(obs);
  assert.equal(unexplained.evidence.database.migrationLedgerState, "LEDGER_CURRENT");
  assert.equal(unexplained.evidence.database.unexplainedPendingMutation, true);
  assert.equal(engineCategory(unexplained, "database"), PREFLIGHT_OUTCOME.BLOCKED);
  const explained = bindDatabaseEvidence({ ...obs, pendingMutationExplained: true });
  assert.equal(explained.evidence.database.unexplainedPendingMutation, false);
  assert.equal(engineCategory(explained, "database"), PREFLIGHT_OUTCOME.PASS);
});

test("S4 negatives: diverged hash, foreign row, out-of-order, misbound, stale, unreachable, baseline conflicts", () => {
  const diverged = databaseObservation();
  diverged.appliedLedger.rows[1].hash = "9".repeat(64);
  const b1 = bindDatabaseEvidence(diverged);
  assert.equal(b1.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(b1, BINDER_REASON.DATABASE_LEDGER_DIVERGED));
  assert.equal(engineCategory(b1, "database"), PREFLIGHT_OUTCOME.BLOCKED);

  const foreign = databaseObservation();
  foreign.appliedLedger.rows.push({ hash: "8".repeat(64), createdAt: 4000 });
  assert.ok(hasFinding(bindDatabaseEvidence(foreign), BINDER_REASON.DATABASE_LEDGER_DIVERGED));

  const reordered = databaseObservation();
  reordered.appliedLedger.rows[0].createdAt = 2500;
  assert.ok(hasFinding(bindDatabaseEvidence(reordered), BINDER_REASON.DATABASE_LEDGER_DIVERGED));

  const misbound = databaseObservation();
  misbound.appliedLedger.target = { ...TARGET, composeProject: "boba-bear" };
  assert.ok(hasFinding(bindDatabaseEvidence(misbound), BINDER_REASON.DATABASE_LEDGER_MISBOUND));

  const stale = databaseObservation();
  stale.appliedLedger.observedAt = "2026-10-23T08:00:00.000Z";
  assert.ok(hasFinding(bindDatabaseEvidence(stale), BINDER_REASON.DATABASE_LEDGER_STALE));

  const unreachable = bindDatabaseEvidence(databaseObservation({ appliedLedger: { reachable: false } }));
  assert.equal(unreachable.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.equal(unreachable.evidence.database.migrationLedgerState, "UNKNOWN");
  assert.notEqual(engineCategory(unreachable, "database"), PREFLIGHT_OUTCOME.PASS);
  assert.equal(bindDatabaseEvidence(databaseObservation({ appliedLedger: null })).outcome, BINDER_OUTCOME.UNKNOWN);

  const partial = bindDatabaseEvidence(databaseObservation({ baseline: { state: "PARTIAL_OR_INCOMPATIBLE", target: TARGET, observedAt: RECENT } }));
  assert.ok(hasFinding(partial, BINDER_REASON.DATABASE_BASELINE_INCOMPATIBLE));
  assert.equal(engineCategory(partial, "database"), PREFLIGHT_OUTCOME.BLOCKED);

  const freshWithRows = bindDatabaseEvidence(databaseObservation({ baseline: { state: "FRESH_EMPTY", target: TARGET, observedAt: RECENT } }));
  assert.ok(hasFinding(freshWithRows, BINDER_REASON.DATABASE_BASELINE_CONFLICTS_WITH_LEDGER));
  assert.equal(freshWithRows.evidence.database.baselineCompatibility, "PARTIAL_OR_INCOMPATIBLE");

  const noBaseline = bindDatabaseEvidence(databaseObservation({ baseline: null }));
  assert.equal(noBaseline.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.equal(noBaseline.evidence.database.baselineCompatibility, "UNKNOWN");

  const forgedState = bindDatabaseEvidence(databaseObservation({ baseline: { state: "LOOKS_FINE", target: TARGET, observedAt: RECENT } }));
  assert.equal(forgedState.evidence.database.baselineCompatibility, "UNKNOWN");

  const badJournal = bindDatabaseEvidence(databaseObservation({ committedJournal: { entries: [{ idx: 0, tag: "x", when: 1, sqlSha256: "nothex" }] } }));
  assert.equal(badJournal.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.ok(hasFinding(badJournal, BINDER_REASON.DATABASE_JOURNAL_MALFORMED));
});

/* ------------------------------------------------------------------ */
/* S5                                                                 */
/* ------------------------------------------------------------------ */

test("S5: staging-bound qualifying checkpoint + isolated restore proof -> BOUND; engine recovery PASS", () => {
  const bound = bindRecoveryEvidence(recoveryObservation());
  assert.equal(bound.outcome, BINDER_OUTCOME.BOUND, JSON.stringify(bound.findings));
  assert.equal(bound.evidence.recovery.bindingDesignDependency, false);
  assert.match(bound.evidence.recovery.binding, /BOUND:20261024T075000Z-aaaaaaaaaaaaaaaa/);
  assert.equal(bound.facts.restoreRunId, "20261024T075600Z-bbbbbbbbbbbbbbbb");
  assert.equal(bound.facts.rollbackRevision, HEAD);
  assert.equal(engineCategory(bound, "recovery"), PREFLIGHT_OUTCOME.PASS);
});

test("S5: no records keeps design dependency truthful (UNKNOWN, engine BLOCKED)", () => {
  const bound = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [] }));
  assert.equal(bound.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.equal(bound.evidence.recovery.bindingDesignDependency, true);
  const decision = evaluateStagingDeployPreflight({ ...bindStagingPreflightEvidence(allObservations()).evidence, ...bound.evidence });
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(decision.findings.some((f) => f.code === PREFLIGHT_REASON.RECOVERY_PROOF_BINDING_DESIGN_DEPENDENCY));
});

test("S5 negatives: tampered, misclassified, misbound, unverified, stale, non-isolated, unbound restore", () => {
  const tampered = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord(), { ...restoreRecord(), status: "SUCCEEDED", runId: "bad run id" }] }));
  assert.equal(tampered.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(tampered, BINDER_REASON.RECOVERY_RECORD_INVALID));

  const production = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord({ sourceEnvironmentClassification: "production" }), restoreRecord({ sourceEnvironmentClassification: "production" })] }));
  assert.equal(production.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(production, BINDER_REASON.RECOVERY_NO_STAGING_RECORDS));
  assert.equal(engineCategory(production, "recovery"), PREFLIGHT_OUTCOME.BLOCKED);

  const marker = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord({ sourceIdentityMarker: "boba-bear:boba-bear_postgres-data" }), restoreRecord()] }));
  assert.ok(hasFinding(marker, BINDER_REASON.RECOVERY_CHECKPOINT_MISBOUND));
  assert.equal(marker.evidence.recovery.stagingBound, false);

  const noMarkerObserved = bindRecoveryEvidence(recoveryObservation({ stagingIdentity: {} }));
  assert.equal(noMarkerObserved.outcome, BINDER_OUTCOME.BLOCKED);

  const notQualifying = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord({ validationResults: [] }), restoreRecord()] }));
  assert.ok(hasFinding(notQualifying, BINDER_REASON.RECOVERY_CHECKPOINT_NOT_QUALIFYING));

  const mismatched = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord({ checksumIntegrityStatus: CHECKSUM_INTEGRITY_STATUS.MISMATCHED }), restoreRecord()] }));
  assert.equal(mismatched.outcome, BINDER_OUTCOME.BLOCKED);

  const stale = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord({ recoveryPoint: "2026-10-22T07:54:00.000Z" }), restoreRecord()] }));
  assert.ok(hasFinding(stale, BINDER_REASON.RECOVERY_POINT_STALE_OR_UNIDENTIFIABLE));
  assert.equal(stale.evidence.recovery.freshnessOk, false);

  const lsn = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord({ recoveryPoint: "0/16B3748" }), restoreRecord()] }));
  assert.ok(hasFinding(lsn, BINDER_REASON.RECOVERY_POINT_STALE_OR_UNIDENTIFIABLE));

  const noRevision = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord({ candidate: { repositoryPath: "/x" } }), restoreRecord()] }));
  assert.ok(hasFinding(noRevision, BINDER_REASON.RECOVERY_ROLLBACK_REVISION_UNRECORDED));
  assert.equal(noRevision.evidence.recovery.rollbackPlanSuitable, false);

  const noRestore = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord()] }));
  assert.ok(hasFinding(noRestore, BINDER_REASON.RECOVERY_RESTORE_PROOF_MISSING));
  assert.equal(noRestore.evidence.recovery.restoreProofPresent, false);
  assert.equal(engineCategory(noRestore, "recovery"), PREFLIGHT_OUTCOME.BLOCKED);

  const notIsolated = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord(), restoreRecord({ targetIdentityMarker: SOURCE_MARKER })] }));
  assert.ok(hasFinding(notIsolated, BINDER_REASON.RECOVERY_RESTORE_NOT_ISOLATED));

  const otherArtifact = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord(), restoreRecord({ recoveryArtifactReference: "spaces://boba-recovery/staging/other.dump.age" })] }));
  assert.ok(hasFinding(otherArtifact, BINDER_REASON.RECOVERY_RESTORE_NOT_BOUND_TO_CHECKPOINT));

  const noIntegrity = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord(), restoreRecord({ validationResults: [{ code: PROOF_CODE.DB_REACHABLE }] })] }));
  assert.ok(hasFinding(noIntegrity, BINDER_REASON.RECOVERY_RESTORE_PROOF_MISSING));

  const failedRestore = bindRecoveryEvidence(recoveryObservation({ evidenceRecords: [checkpointRecord(), restoreRecord({ status: OPERATION_STATUS.FAILED })] }));
  assert.equal(failedRestore.evidence.recovery.restoreProofPresent, false);
});

/* ------------------------------------------------------------------ */
/* S6                                                                 */
/* ------------------------------------------------------------------ */

test("S6: exact SHA <-> image ID <-> Trivy report correlation -> BOUND; engine security PASS", () => {
  const bound = bindSecurityEvidence(securityObservation());
  assert.equal(bound.outcome, BINDER_OUTCOME.BOUND, JSON.stringify(bound.findings));
  assert.equal(bound.evidence.security.sourceImageCorrelated, true);
  assert.equal(bound.evidence.security.imageSecurityEvidencePresent, true);
  assert.equal(engineCategory(bound, "security"), PREFLIGHT_OUTCOME.PASS);
});

test("S6: an expired exception NEVER establishes PASS, even with clean scans", () => {
  const bound = bindSecurityEvidence(
    securityObservation({
      exceptionPolicy: {
        todayIso: "2026-10-24",
        errors: ["TRIVY_EXCEPTION_EXPIRED id=VEX-TRIVY-001 finding_id=DS-0002 expiry=2026-10-23 today=2026-10-24 (fail closed; do not silently suppress)"],
        activeByFinding: new Map(),
      },
    }),
  );
  assert.equal(bound.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(bound, BINDER_REASON.SECURITY_EXCEPTION_EXPIRED));
  assert.equal(bound.evidence.security.imageSecurityEvidencePresent, false);
  assert.equal(engineCategory(bound, "security"), PREFLIGHT_OUTCOME.BLOCKED);
});

test("S6: exceptions apply only to the justified image; unexcepted HIGH/CRITICAL blocks", () => {
  const postgres = REQUIRED_STAGING_IMAGES.find((t) => t.service === "postgres");
  const idx = REQUIRED_STAGING_IMAGES.indexOf(postgres);
  const withFinding = securityObservation();
  withFinding.trivyReports[idx] = { image: postgres.image, report: trivyReport(postgres.image, imageId(String(idx)), [{ ID: "DS-0002", Severity: "HIGH" }]), scannedAt: RECENT };

  const unexcepted = bindSecurityEvidence(withFinding);
  assert.equal(unexcepted.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(unexcepted, BINDER_REASON.SECURITY_UNEXCEPTED_FINDING));

  const excepted = bindSecurityEvidence({ ...withFinding, exceptionPolicy: { todayIso: "2026-10-23", errors: [], activeByFinding: new Map([["DS-0002", { id: "VEX-TRIVY-001", image: "postgres", expiry: "2026-10-23" }]]) } });
  assert.equal(excepted.outcome, BINDER_OUTCOME.BOUND, JSON.stringify(excepted.findings));

  const wrongImage = bindSecurityEvidence({ ...withFinding, exceptionPolicy: { todayIso: "2026-10-23", errors: [], activeByFinding: new Map([["DS-0002", { id: "VEX-TRIVY-001", image: "web-runtime", expiry: "2026-10-23" }]]) } });
  assert.equal(wrongImage.outcome, BINDER_OUTCOME.BLOCKED);

  const low = securityObservation();
  low.trivyReports[idx] = { image: postgres.image, report: trivyReport(postgres.image, imageId(String(idx)), [{ ID: "DS-0026", Severity: "LOW" }]), scannedAt: RECENT };
  assert.equal(bindSecurityEvidence(low).outcome, BINDER_OUTCOME.BOUND);
});

test("S6 negatives: revision mismatch, digest mismatch, missing report, stale, malformed, waived, policy missing", () => {
  const revision = securityObservation();
  revision.inspectedImages[0].revisionLabel = "d".repeat(40);
  const b1 = bindSecurityEvidence(revision);
  assert.equal(b1.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(b1, BINDER_REASON.SECURITY_IMAGE_REVISION_MISMATCH));
  assert.equal(b1.evidence.security.sourceImageCorrelated, false);
  assert.equal(engineCategory(b1, "security"), PREFLIGHT_OUTCOME.BLOCKED);

  const digest = securityObservation();
  digest.trivyReports[1].report.Metadata.ImageID = imageId("9");
  const b2 = bindSecurityEvidence(digest);
  assert.ok(hasFinding(b2, BINDER_REASON.SECURITY_SCAN_DIGEST_MISMATCH));
  assert.equal(b2.outcome, BINDER_OUTCOME.BLOCKED);

  const missingReport = securityObservation();
  missingReport.trivyReports.pop();
  const b3 = bindSecurityEvidence(missingReport);
  assert.equal(b3.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.ok(hasFinding(b3, BINDER_REASON.SECURITY_SCAN_MISSING));
  assert.equal(b3.evidence.security.imageSecurityEvidencePresent, false);

  const notInspected = securityObservation();
  notInspected.inspectedImages.shift();
  assert.equal(bindSecurityEvidence(notInspected).outcome, BINDER_OUTCOME.UNKNOWN);

  const stale = securityObservation();
  stale.trivyReports[0].scannedAt = "2026-10-22T00:00:00.000Z";
  assert.ok(hasFinding(bindSecurityEvidence(stale), BINDER_REASON.SECURITY_SCAN_STALE));

  const malformed = securityObservation();
  malformed.trivyReports[0].report = { SchemaVersion: 1, ArtifactName: malformed.trivyReports[0].image, Metadata: malformed.trivyReports[0].report.Metadata };
  assert.ok(hasFinding(bindSecurityEvidence(malformed), BINDER_REASON.SECURITY_SCAN_MALFORMED));

  const wrongArtifact = securityObservation();
  wrongArtifact.trivyReports[0].report.ArtifactName = "someone-else:latest";
  wrongArtifact.trivyReports[0].report.Metadata.RepoTags = [];
  assert.ok(hasFinding(bindSecurityEvidence(wrongArtifact), BINDER_REASON.SECURITY_SCAN_MALFORMED));

  const waived = bindSecurityEvidence(securityObservation({ issue409RiskWaived: true }));
  assert.equal(waived.outcome, BINDER_OUTCOME.BLOCKED);
  assert.equal(waived.evidence.security.issue409RiskWaived, true);
  assert.equal(engineCategory(waived, "security"), PREFLIGHT_OUTCOME.BLOCKED);

  const noPolicy = bindSecurityEvidence(securityObservation({ exceptionPolicy: null }));
  assert.equal(noPolicy.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.equal(noPolicy.evidence.security.imageSecurityEvidencePresent, false);
});

/* ------------------------------------------------------------------ */
/* S7                                                                 */
/* ------------------------------------------------------------------ */

test("S7: AD-PF-02 floors AND measured headroom satisfied with preservation -> BOUND; engine capacity PASS", () => {
  assert.equal(CAPACITY_POLICY.diskFloorBytes, 40 * GiB);
  assert.equal(CAPACITY_POLICY.memoryFloorBytes, 8 * GiB);
  assert.equal(CAPACITY_POLICY.diskHeadroomFactor, 2);
  assert.equal(CAPACITY_POLICY.memoryHeadroomFactor, 1.5);
  const bound = bindCapacityEvidence(capacityObservation());
  assert.equal(bound.outcome, BINDER_OUTCOME.BOUND, JSON.stringify(bound.findings));
  assert.equal(engineCategory(bound, "capacity"), PREFLIGHT_OUTCOME.PASS);
});

test("S7: floor and headroom are both required (AND), per relevant filesystem", () => {
  const belowFloor = capacityObservation();
  belowFloor.filesystems[0].availableBytes = 39 * GiB;
  const b1 = bindCapacityEvidence(belowFloor);
  assert.equal(b1.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(b1, BINDER_REASON.CAPACITY_DISK_BELOW_FLOOR));
  assert.equal(engineCategory(b1, "capacity"), PREFLIGHT_OUTCOME.BLOCKED);

  const belowHeadroom = capacityObservation();
  belowHeadroom.filesystems[1].availableBytes = 50 * GiB; // >= 40 GiB floor but < 2 x 14 GiB? no: 28 GiB -> ok. Use larger footprint.
  belowHeadroom.buildFootprint.bytesByFilesystemId.podman = 30 * GiB;
  const b2 = bindCapacityEvidence(belowHeadroom);
  assert.equal(b2.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(b2, BINDER_REASON.CAPACITY_DISK_BELOW_HEADROOM));

  const memFloor = bindCapacityEvidence(capacityObservation({ memory: { availableBytes: 7 * GiB, measuredAt: RECENT }, peakMemoryDemand: { candidateHead: HEAD, bytes: 2 * GiB, measuredAt: RECENT } }));
  assert.ok(hasFinding(memFloor, BINDER_REASON.CAPACITY_MEMORY_BELOW_FLOOR));

  const memHeadroom = bindCapacityEvidence(capacityObservation({ memory: { availableBytes: 9 * GiB, measuredAt: RECENT }, peakMemoryDemand: { candidateHead: HEAD, bytes: 7 * GiB, measuredAt: RECENT } }));
  assert.ok(hasFinding(memHeadroom, BINDER_REASON.CAPACITY_MEMORY_BELOW_HEADROOM));
  assert.equal(memHeadroom.outcome, BINDER_OUTCOME.BLOCKED);
});

test("S7: unmeasured workload or availability is UNKNOWN, never inferred; misbound/stale measurements block", () => {
  const noFootprint = bindCapacityEvidence(capacityObservation({ buildFootprint: null }));
  assert.equal(noFootprint.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.ok(hasFinding(noFootprint, BINDER_REASON.CAPACITY_BUILD_FOOTPRINT_UNMEASURED));
  assert.equal(noFootprint.evidence.capacity.diskSufficient, false);
  assert.notEqual(engineCategory(noFootprint, "capacity"), PREFLIGHT_OUTCOME.PASS);

  const noPeak = bindCapacityEvidence(capacityObservation({ peakMemoryDemand: null }));
  assert.equal(noPeak.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.equal(noPeak.evidence.capacity.memorySufficient, false);

  const noMemory = bindCapacityEvidence(capacityObservation({ memory: null }));
  assert.equal(noMemory.outcome, BINDER_OUTCOME.UNKNOWN);

  const otherSha = capacityObservation();
  otherSha.buildFootprint.candidateHead = "d".repeat(40);
  assert.ok(hasFinding(bindCapacityEvidence(otherSha), BINDER_REASON.CAPACITY_BUILD_FOOTPRINT_MISBOUND));

  const partialFootprint = capacityObservation();
  delete partialFootprint.buildFootprint.bytesByFilesystemId.podman;
  assert.equal(bindCapacityEvidence(partialFootprint).outcome, BINDER_OUTCOME.UNKNOWN);

  const staleSnapshot = capacityObservation();
  staleSnapshot.filesystems[0].measuredAt = "2026-10-24T07:00:00.000Z";
  assert.ok(hasFinding(bindCapacityEvidence(staleSnapshot), BINDER_REASON.CAPACITY_MEASUREMENT_STALE));

  const unmeasuredFs = capacityObservation();
  unmeasuredFs.filesystems[1].availableBytes = undefined;
  assert.equal(bindCapacityEvidence(unmeasuredFs).outcome, BINDER_OUTCOME.UNKNOWN);

  const noFs = bindCapacityEvidence(capacityObservation({ filesystems: [] }));
  assert.equal(noFs.outcome, BINDER_OUTCOME.UNKNOWN);
});

test("S7: preservation of prior images / rollback images / PG volume is required", () => {
  const violated = capacityObservation();
  violated.preservation.unintendedPostgresReplacement = true;
  const b1 = bindCapacityEvidence(violated);
  assert.equal(b1.outcome, BINDER_OUTCOME.BLOCKED);
  assert.equal(b1.evidence.capacity.unintendedPostgresReplacement, true);
  assert.equal(engineCategory(b1, "capacity"), PREFLIGHT_OUTCOME.BLOCKED);

  const missingImage = capacityObservation();
  missingImage.preservation.priorImages[0].present = false;
  assert.ok(hasFinding(bindCapacityEvidence(missingImage), BINDER_REASON.CAPACITY_PRESERVATION_VIOLATED));

  const noRollback = capacityObservation();
  noRollback.preservation.rollbackImagesPresent = false;
  assert.equal(bindCapacityEvidence(noRollback).outcome, BINDER_OUTCOME.BLOCKED);

  const unknown = bindCapacityEvidence(capacityObservation({ preservation: null }));
  assert.equal(unknown.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.equal(unknown.evidence.capacity.priorImagesPreserved, false);

  const incomplete = capacityObservation();
  delete incomplete.preservation.postgresVolumePresent;
  assert.equal(bindCapacityEvidence(incomplete).outcome, BINDER_OUTCOME.UNKNOWN);
});

/* ------------------------------------------------------------------ */
/* S8                                                                 */
/* ------------------------------------------------------------------ */

test("S8: git-tree, working-tree and active-mount identities agree -> BOUND; engine postgresInit PASS", () => {
  const bound = bindPostgresInitEvidence(postgresInitObservation());
  assert.equal(bound.outcome, BINDER_OUTCOME.BOUND);
  assert.equal(bound.evidence.postgresInit.disposition, POSTGRES_INIT_DISPOSITION.PRESERVE);
  assert.equal(engineCategory(bound, "postgresInit"), PREFLIGHT_OUTCOME.PASS);
});

test("S8 negatives: working-tree drift, digest misbound, BLOCK, UNKNOWN, missing", () => {
  const drift = bindPostgresInitEvidence(postgresInitObservation({ candidateManifest: { ok: true, digest: "d".repeat(64) } }));
  assert.equal(drift.outcome, BINDER_OUTCOME.BLOCKED);
  assert.ok(hasFinding(drift, BINDER_REASON.POSTGRES_INIT_CANDIDATE_TREE_DRIFT));
  assert.equal(drift.evidence.postgresInit.disposition, POSTGRES_INIT_DISPOSITION.BLOCK);
  assert.equal(engineCategory(drift, "postgresInit"), PREFLIGHT_OUTCOME.BLOCKED);

  const misbound = bindPostgresInitEvidence(postgresInitObservation({ disposition: { disposition: POSTGRES_INIT_DISPOSITION.PRESERVE, reasonCode: POSTGRES_INIT_REASON.SAME_CONTENT_SAME_PATH, contentDigest: "e".repeat(64) } }));
  assert.ok(hasFinding(misbound, BINDER_REASON.POSTGRES_INIT_DIGEST_MISBOUND));
  assert.equal(misbound.evidence.postgresInit.disposition, POSTGRES_INIT_DISPOSITION.BLOCK);

  const block = bindPostgresInitEvidence(postgresInitObservation({ disposition: { disposition: POSTGRES_INIT_DISPOSITION.BLOCK, reasonCode: POSTGRES_INIT_REASON.CONTENT_MISMATCH } }));
  assert.equal(block.outcome, BINDER_OUTCOME.BLOCKED);
  assert.equal(engineCategory(block, "postgresInit"), PREFLIGHT_OUTCOME.BLOCKED);

  const unknown = bindPostgresInitEvidence(postgresInitObservation({ disposition: { disposition: POSTGRES_INIT_DISPOSITION.UNKNOWN, reasonCode: POSTGRES_INIT_REASON.IMAGE_COMPAT_UNKNOWN } }));
  assert.equal(unknown.outcome, BINDER_OUTCOME.UNKNOWN);
  assert.notEqual(engineCategory(unknown, "postgresInit"), PREFLIGHT_OUTCOME.PASS);

  assert.equal(bindPostgresInitEvidence(postgresInitObservation({ disposition: null })).outcome, BINDER_OUTCOME.UNKNOWN);
  assert.equal(bindPostgresInitEvidence(postgresInitObservation({ gitTreeManifest: { ok: false, reasonCode: POSTGRES_INIT_REASON.UNREADABLE } })).outcome, BINDER_OUTCOME.UNKNOWN);
  assert.equal(bindPostgresInitEvidence(postgresInitObservation({ disposition: { disposition: "PRESERVE_PLEASE" } })).outcome, BINDER_OUTCOME.UNKNOWN);
});

/* ------------------------------------------------------------------ */
/* Aggregate / genuineness guard                                      */
/* ------------------------------------------------------------------ */

test("aggregate: synthetic all-good observations drive the engine to PASS but readiness is NOT_ESTABLISHED", () => {
  const bound = bindStagingPreflightEvidence(allObservations(SYNTHETIC));
  const result = decideBoundStagingPreflight(bound);
  assert.equal(result.decision.outcome, PREFLIGHT_OUTCOME.PASS, JSON.stringify(result.decision.findings));
  assert.equal(Object.values(result.binders).every((b) => b.outcome === BINDER_OUTCOME.BOUND), true);
  assert.equal(result.stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);
  assert.ok(result.reasons.some((r) => r.startsWith("SYNTHETIC_PROVENANCE")));
  assert.ok(result.reasons.some((r) => r.startsWith("NON_GENUINE_PROVENANCE")));
  assert.throws(() => assertGenuineStagingReadiness(result), /NOT_ESTABLISHED/);
  const lines = formatBinderReport(result);
  assert.ok(lines.includes("STAGING_PREFLIGHT_PASS NOT_ESTABLISHED"));
});

test("aggregate: a single synthetic or missing-provenance section poisons genuineness", () => {
  const observations = allObservations(LIVE);
  observations.capacity = capacityObservation({}, SYNTHETIC);
  const result = decideBoundStagingPreflight(bindStagingPreflightEvidence(observations));
  assert.equal(result.decision.outcome, PREFLIGHT_OUTCOME.PASS);
  assert.equal(result.stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);
  assert.ok(result.reasons.some((r) => r.includes(BINDER_ID.S7_CAPACITY)));

  const noProvenance = allObservations(LIVE);
  delete noProvenance.runtime.provenance;
  const r2 = decideBoundStagingPreflight(bindStagingPreflightEvidence(noProvenance));
  assert.equal(r2.stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);
  assert.ok(r2.reasons.some((r) => r.includes("RUNTIME")));

  const undated = allObservations(LIVE);
  undated.source.provenance = { kind: EVIDENCE_PROVENANCE.LIVE_PROBE, observedAt: null };
  assert.equal(decideBoundStagingPreflight(bindStagingPreflightEvidence(undated)).stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);
});

test("aggregate: genuine provenance on every section with every binder BOUND reaches ESTABLISHED (guard is reachable, not vacuous)", () => {
  const observations = allObservations(LIVE);
  observations.recovery = recoveryObservation({}, RECORDED);
  const result = decideBoundStagingPreflight(bindStagingPreflightEvidence(observations));
  assert.equal(result.stagingPreflightPass, STAGING_PREFLIGHT_PASS.ESTABLISHED, result.reasons.join("; "));
  assert.doesNotThrow(() => assertGenuineStagingReadiness(result));
});

test("aggregate: a binder that is UNKNOWN or BLOCKED is never ESTABLISHED even if the engine were lenient", () => {
  const observations = allObservations(LIVE);
  observations.source = sourceObservation({ remoteMainSha: null }, LIVE); // engine source would PASS; binder UNKNOWN
  const result = decideBoundStagingPreflight(bindStagingPreflightEvidence(observations));
  assert.equal(result.decision.categories.source, PREFLIGHT_OUTCOME.PASS);
  assert.equal(result.stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);
  assert.ok(result.reasons.some((r) => r.includes("S1_SOURCE=UNKNOWN")));
  assert.throws(() => assertGenuineStagingReadiness(result));
});

test("aggregate: operator ready/bypass flags on observations never reach the engine evidence", () => {
  const observations = allObservations(LIVE);
  observations.ready = true;
  observations.bypass = true;
  observations.source.ready = true;
  const bound = bindStagingPreflightEvidence(observations);
  assert.equal("ready" in bound.evidence, false);
  assert.equal("bypass" in bound.evidence, false);
  assert.equal("ready" in bound.evidence.source, false);
});

test("aggregate: missing observations everywhere -> engine BLOCKED, NOT_ESTABLISHED, no throw", () => {
  const result = decideBoundStagingPreflight(bindStagingPreflightEvidence({}));
  assert.equal(result.decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.equal(result.stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);
  assert.equal(Object.values(result.binders).every((b) => b.outcome !== BINDER_OUTCOME.BOUND), true);
  assert.equal(decideBoundStagingPreflight(bindStagingPreflightEvidence(null)).stagingPreflightPass, STAGING_PREFLIGHT_PASS.NOT_ESTABLISHED);
});
