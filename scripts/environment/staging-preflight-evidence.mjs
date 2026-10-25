#!/usr/bin/env node
/**
 * Founder staging preflight — read-only S1..S8 evidence report.
 *
 *   npm run env:staging:preflight:evidence            # read-only probes (git, files, statfs, meminfo, gh api, podman inspect)
 *   npm run env:staging:preflight:evidence -- --offline   # no gh / podman calls
 *   npm run env:staging:preflight:evidence -- --json
 *
 * Optional recorded-artifact inputs (JSON files produced by separately
 * authorised read-only probes; absent = UNKNOWN):
 *   --applied-ledger <file>      S4 `drizzle.__drizzle_migrations` observation
 *   --baseline <file>            S4 STAGING_BASELINE_STATE observation
 *   --recovery-evidence <dir>    S5 IMP-037 evidence records (*.json)
 *   --trivy-reports <dir>        S6 Trivy JSON reports (*.json)
 *   --build-footprint <file>     S7 measured incremental build footprint
 *   --peak-memory <file>         S7 measured incremental peak memory demand
 *   --preservation <file>        S7 prior image / PG volume preservation facts
 *
 * This command never mutates anything and never authorises deployment.
 * `STAGING_PREFLIGHT_PASS` is expected to be NOT_ESTABLISHED until every
 * section is genuinely proven; synthetic inputs are refused.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { loadTrivyExceptionPolicy } from "../run-trivy.mjs";
import { collectInitManifest, resolvePostgresInitDisposition } from "./postgres-init-identity.mjs";
import {
  EVIDENCE_PROVENANCE,
  EXPECTED_STAGING_POSTGRES_CONTAINER,
  EXPECTED_STAGING_POSTGRES_VOLUME,
  EXPECTED_STAGING_COMPOSE_PROJECT,
  REQUIRED_STAGING_IMAGES,
  STAGING_PREFLIGHT_PASS,
  bindStagingPreflightEvidence,
  canonicalizeRepositoryIdentity,
  decideBoundStagingPreflight,
  formatBinderReport,
} from "./staging-evidence-binders.mjs";
import {
  collectInitManifestFromGitTree,
  fetchPublishingApiObservation,
  fetchRemoteMainObservation,
  liveProvenance,
  loadTrivyReports,
  probeCapacityObservation,
  probeCapacitySnapshots,
  probeConfigurationObservation,
  probeDatabaseObservation,
  probeInspectedImages,
  probePublishingObservation,
  probeSourceObservation,
  recordedProvenance,
} from "./staging-evidence-probes.mjs";
import { probeStagingRuntimeIdentity, readStagingDiagnosticEnabled, STAGING_RUNTIME_ASSETS_DIR } from "./staging.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, "..", "..");
const STAGING_ENV_DIR = path.join(repositoryRoot, ".env.staging");
const STAGING_ENV_FILES = [
  ".env.docker.local",
  ".env.runtime.docker.local",
  ".env.migration.docker.local",
  ".env.customer-auth.docker.local",
  ".env.workforce-auth.docker.local",
  ".env.customer-commerce.docker.local",
  ".env.operations.docker.local",
];
const INIT_RELATIVE_ROOT = "docker/postgres/init";
/** CLI exit status when STAGING_PREFLIGHT_PASS is NOT_ESTABLISHED (never 0). */
export const EXIT_NOT_ESTABLISHED = 2;

export function parseArgs(argv) {
  const options = {
    offline: false,
    json: false,
    appliedLedger: null,
    baseline: null,
    recoveryEvidenceDir: null,
    trivyReportsDir: null,
    buildFootprint: null,
    peakMemory: null,
    preservation: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i] ?? null;
    if (arg === "--offline") options.offline = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--applied-ledger") options.appliedLedger = next();
    else if (arg === "--baseline") options.baseline = next();
    else if (arg === "--recovery-evidence") options.recoveryEvidenceDir = next();
    else if (arg === "--trivy-reports") options.trivyReportsDir = next();
    else if (arg === "--build-footprint") options.buildFootprint = next();
    else if (arg === "--peak-memory") options.peakMemory = next();
    else if (arg === "--preservation") options.preservation = next();
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

/**
 * Recorded artifacts must declare their own provenance; synthetic artifacts
 * are loaded but can never become genuine.
 */
export function readArtifact(filePath, readFile = readFileSync) {
  if (!filePath) return null;
  try {
    const parsed = JSON.parse(readFile(filePath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * A file supplied on the command line is at most a RECORDED_ARTIFACT: it can
 * never promote itself to LIVE_PROBE by embedding a provenance block. A file
 * that declares itself SYNTHETIC stays SYNTHETIC (and poisons genuineness).
 */
function artifactProvenance(probe, artifact, fallbackSources) {
  if (!artifact) return liveProvenance(probe, fallbackSources);
  const declared = artifact.provenance && typeof artifact.provenance === "object" ? artifact.provenance : null;
  const observedAt = declared?.observedAt ?? artifact.observedAt ?? artifact.measuredAt ?? null;
  if (declared?.kind === EVIDENCE_PROVENANCE.SYNTHETIC) {
    return { kind: EVIDENCE_PROVENANCE.SYNTHETIC, observedAt, probe, sources: fallbackSources };
  }
  return recordedProvenance(probe, observedAt, fallbackSources);
}

/** Attach CLI-capped provenance onto a nested capacity artifact without mutating the file parse. */
function withArtifactProvenance(artifact, probe, fallbackSources) {
  if (!artifact || typeof artifact !== "object") return null;
  return { ...artifact, provenance: artifactProvenance(probe, artifact, fallbackSources) };
}

function readJsonDir(dir) {
  if (!dir) return [];
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
  const records = [];
  for (const file of files) {
    const parsed = readArtifact(path.join(dir, file));
    if (parsed) records.push(parsed);
  }
  return records;
}

function inspectContainerJson(name) {
  return JSON.parse(execFileSync("podman", ["inspect", name], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }))[0];
}

/**
 * Assemble observations. Injectable for tests; defaults are read-only probes.
 */
export function gatherObservations(options, deps = {}) {
  const now = deps.now ?? new Date();
  const offline = options.offline === true;

  // S1 — query GitHub by the LOCAL remote identity so a rename redirect is observed, not assumed.
  const localSource = probeSourceObservation({ repositoryRoot, git: deps.git, remoteMain: null, now });
  const localIdentity = canonicalizeRepositoryIdentity(localSource.remoteUrl).identity;
  const remoteMain = offline || !localIdentity ? null : (deps.fetchRemoteMain ?? fetchRemoteMainObservation)({ repository: localIdentity });
  const source = { ...localSource, remoteRepositoryIdentity: remoteMain?.fullName ?? null, remoteMainSha: remoteMain?.sha ?? null };

  // S2
  const publishingApi =
    offline || !localIdentity
      ? { workflowApiStates: null, pagesHosting: null }
      : (deps.fetchPublishingApi ?? fetchPublishingApiObservation)({ repository: localIdentity });
  const publishing = probePublishingObservation({
    repositoryRoot,
    workflowApiStates: publishingApi.workflowApiStates,
    pagesHosting: publishingApi.pagesHosting,
    policyLock: { locked: false, authority: null },
    now,
  });

  // S3
  const diagnostic = (deps.readDiagnostic ?? readStagingDiagnosticEnabled)(STAGING_ENV_DIR, { repositoryRoot });
  const requiredEnvFilesPresent = STAGING_ENV_FILES.every(
    (file) => existsSync(path.join(STAGING_ENV_DIR, file)) || existsSync(path.join(repositoryRoot, file)),
  );
  const configuration = probeConfigurationObservation({
    repositoryRoot,
    stagingEnvDir: STAGING_ENV_DIR,
    spawn: deps.spawnProjection,
    diagnostic,
    requiredEnvFilesPresent,
    now,
  });

  // S4
  const appliedLedgerArtifact = readArtifact(options.appliedLedger);
  const baselineArtifact = readArtifact(options.baseline);
  const database = {
    ...probeDatabaseObservation({
      drizzleDir: path.join(repositoryRoot, "drizzle"),
      appliedLedger: appliedLedgerArtifact,
      baseline: baselineArtifact,
      now,
    }),
    provenance: artifactProvenance("committed-journal+ledger-artifact", appliedLedgerArtifact, ["drizzle/meta/_journal.json", options.appliedLedger ?? "applied ledger NOT probed"]),
  };

  // S5
  const recoveryRecords = readJsonDir(options.recoveryEvidenceDir);
  const recovery = {
    provenance: recoveryRecords.length > 0
      ? recordedProvenance("recovery-evidence-dir", recoveryRecords.map((r) => r.endedAt ?? r.startedAt).filter(Boolean).sort().at(-1) ?? null, [options.recoveryEvidenceDir])
      : liveProvenance("recovery-evidence-dir", ["no recovery evidence directory supplied"], now),
    evidenceRecords: recoveryRecords,
    stagingIdentity: { sourceIdentityMarker: `${EXPECTED_STAGING_COMPOSE_PROJECT}:${EXPECTED_STAGING_POSTGRES_VOLUME}` },
    now,
  };

  // S6
  let exceptionPolicy = null;
  try {
    const policy = (deps.loadExceptionPolicy ?? loadTrivyExceptionPolicy)({ root: repositoryRoot });
    exceptionPolicy = { todayIso: policy.todayIso, errors: policy.errors, activeByFinding: policy.activeByFinding };
  } catch (error) {
    exceptionPolicy = { todayIso: null, errors: [`POLICY_LOAD_FAILED ${error instanceof Error ? error.message : String(error)}`], activeByFinding: new Map() };
  }
  const inspectedImages = offline ? [] : probeInspectedImages({ images: REQUIRED_STAGING_IMAGES, inspect: deps.inspectImage });
  const trivyReports = loadTrivyReports({ dir: options.trivyReportsDir });
  const security = {
    provenance: liveProvenance("podman-image-inspect+trivy-reports+exception-policy", [offline ? "podman NOT probed (offline)" : "podman image inspect", options.trivyReportsDir ?? "trivy reports NOT supplied", ".trivyignore + exception register"], now),
    candidateHead: source.head ?? undefined,
    requiredImages: REQUIRED_STAGING_IMAGES,
    inspectedImages,
    trivyReports,
    exceptionPolicy,
    issue409RiskWaived: false,
    now,
  };

  // S7
  const snapshots = probeCapacitySnapshots({
    filesystems: [
      { id: "repository", mountPoint: repositoryRoot, roles: ["build"] },
      { id: "tmp-build", mountPoint: deps.tmpDir ?? "/tmp", roles: ["build"] },
      { id: "podman-storage", mountPoint: deps.podmanStorageDir ?? path.join(process.env.HOME ?? "/", ".local", "share", "containers", "storage"), roles: ["image-store"] },
    ],
    statfs: deps.statfs,
    readFile: deps.readFile,
    now,
  });
  const capacity = probeCapacityObservation({
    candidateHead: source.head,
    snapshots,
    buildFootprint: withArtifactProvenance(
      readArtifact(options.buildFootprint),
      "build-footprint-artifact",
      [options.buildFootprint ?? "build footprint NOT measured"],
    ),
    peakMemoryDemand: withArtifactProvenance(
      readArtifact(options.peakMemory),
      "peak-memory-artifact",
      [options.peakMemory ?? "peak memory NOT measured"],
    ),
    preservation: withArtifactProvenance(
      readArtifact(options.preservation),
      "preservation-artifact",
      [options.preservation ?? "preservation facts NOT measured"],
    ),
    now,
  });

  // S8
  const candidateManifest = collectInitManifest(path.join(repositoryRoot, INIT_RELATIVE_ROOT));
  const gitTreeManifest = source.head
    ? collectInitManifestFromGitTree(source.head, INIT_RELATIVE_ROOT, { repositoryRoot, git: deps.gitBuffer })
    : { ok: false, reasonCode: "POSTGRES_INIT_UNREADABLE", detail: "candidate head unknown" };
  let disposition = null;
  let activePostgres = { present: false, volumePresent: false, mountSource: null, project: null, persistentVolume: null, imageCompatConflict: null };
  if (!offline) {
    try {
      const database = (deps.inspectContainer ?? inspectContainerJson)(EXPECTED_STAGING_POSTGRES_CONTAINER);
      const dataMounts = (database?.Mounts ?? []).filter((m) => m.Name === EXPECTED_STAGING_POSTGRES_VOLUME && m.Destination === "/var/lib/postgresql");
      const initMount = (database?.Mounts ?? []).find((m) => m.Destination === "/docker-entrypoint-initdb.d");
      activePostgres = {
        present: true,
        volumePresent: dataMounts.length === 1,
        mountSource: initMount?.Source ?? null,
        project: database?.Config?.Labels?.["io.podman.compose.project"] ?? null,
        persistentVolume: dataMounts.length === 1 ? EXPECTED_STAGING_POSTGRES_VOLUME : null,
        imageCompatConflict: null,
      };
    } catch {
      activePostgres = { present: false, volumePresent: false, mountSource: null, project: null, persistentVolume: null, imageCompatConflict: null };
    }
    disposition = resolvePostgresInitDisposition({
      candidateManifest,
      candidateMaterializedPath: source.head ? path.join(STAGING_RUNTIME_ASSETS_DIR, "postgres-init", source.head) : undefined,
      activePostgres,
      trustRoots: { runtimeAssetsRoot: STAGING_RUNTIME_ASSETS_DIR, repositoryInitRoot: path.join(repositoryRoot, INIT_RELATIVE_ROOT) },
    });
  }
  const postgresInit = {
    provenance: liveProvenance("git-tree-manifest+working-tree-manifest+podman-inspect", [offline ? "podman NOT probed (offline)" : "podman inspect postgres", "git ls-tree/cat-file", INIT_RELATIVE_ROOT], now),
    disposition,
    candidateManifest,
    gitTreeManifest,
  };

  // Runtime identity (engine requirement; never starts containers).
  const runtimeProbe = offline
    ? { evidenceComplete: false, identityUnknown: true, podmanRootless: false, composeProject: null, postgresContainer: null, postgresVolume: null, unexpectedTarget: null, detail: "offline" }
    : (deps.probeRuntime ?? probeStagingRuntimeIdentity)({ inspect: deps.inspectContainer });
  const runtime = { provenance: liveProvenance("podman-runtime-identity", [offline ? "offline" : "podman inspect"], now), ...runtimeProbe };

  return { source, publishing, configuration, database, recovery, security, capacity, postgresInit, runtime };
}

export function runReport(argv, deps = {}) {
  const options = parseArgs(argv);
  const observations = gatherObservations(options, deps);
  const bound = bindStagingPreflightEvidence(observations);
  const result = decideBoundStagingPreflight(bound);
  const lines = [
    `STAGING_PROJECT ${EXPECTED_STAGING_COMPOSE_PROJECT}`,
    `CANDIDATE_HEAD ${observations.source.head ?? "UNKNOWN"}`,
    `PROBE_MODE ${options.offline ? "OFFLINE_READ_ONLY" : "READ_ONLY"}`,
    "STAGING_MUTATION_PERFORMED NO",
    ...formatBinderReport(result),
  ];
  return { options, result, lines, bound };
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  try {
    const { options, result, lines } = runReport(process.argv.slice(2));
    if (options.json) {
      process.stdout.write(
        `${JSON.stringify(
          {
            stagingPreflightPass: result.stagingPreflightPass,
            reasons: result.reasons,
            decision: result.decision,
            binders: Object.fromEntries(Object.entries(result.binders).map(([id, b]) => [id, { outcome: b.outcome, provenance: b.provenance, findings: b.findings, facts: b.facts }])),
          },
          (key, value) => (value instanceof Map ? Object.fromEntries(value) : value),
          2,
        )}\n`,
      );
    } else {
      for (const line of lines) console.log(line);
    }
    // Exit status mirrors the decision so automation cannot misread
    // NOT_ESTABLISHED as success: 0 only when ESTABLISHED, otherwise 2.
    process.exitCode = result.stagingPreflightPass === STAGING_PREFLIGHT_PASS.ESTABLISHED ? 0 : EXIT_NOT_ESTABLISHED;
  } catch (error) {
    console.error(`STAGING_PREFLIGHT_EVIDENCE_ERROR ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
