#!/usr/bin/env node
/** Founder staging provenance, status, and exact merged Git-tree deployment for `boba-staging`. */
import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { extractValues, parseEnvFile } from "../database/lib/env-file.mjs";
import {
  parseStagingBaselineState,
  resolveStagingBootstrapAction,
  stagingBaselineDecisionLogLines,
} from "./staging-baseline.mjs";
import {
  collectInitManifest,
  isTrustedStagingInitMountPath,
  resolvePostgresInitDisposition,
  POSTGRES_INIT_DISPOSITION,
} from "./postgres-init-identity.mjs";
import {
  assertPreflightAllowsDeployment,
  evaluateStagingDeployPreflight,
  PREFLIGHT_OUTCOME,
} from "./staging-preflight.mjs";
import { extractVerifiedGitArchive, observeIsolatedArtifactContext, readPinnedGithubMainSha } from "./staging-source-isolation.mjs";
import { projectStrictStagingConfiguration } from "./staging-config-projection.mjs";
import { copyOwnerOnlySecretFile, ensureOwnerOnlySecretDirectory, inspectOwnerOnlyDirectory, inspectOwnerOnlyFile } from "./staging-secret-files.mjs";
import { bindStagingRecoveryEvidence } from "./staging-recovery-binding.mjs";
import { readPublishingWorkflow } from "./staging-publishing-probe.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, "..", "..");
/** Protected primary worktree — must not be used as staging deploy checkout. */
const PROTECTED_PRIMARY_REPOSITORY = "/home/ajoshi/repos/boba-bear-platform";
const STAGING_PROJECT = "boba-staging";
const STAGING_ENV_DIR = path.join(repositoryRoot, ".env.staging");
const STAGING_RUNTIME_ASSETS_DIR = path.join(STAGING_ENV_DIR, "runtime-assets");
const STAGING_ENV_FILES = [
  ".env.docker.local",
  ".env.runtime.docker.local",
  ".env.migration.docker.local",
  ".env.customer-auth.docker.local",
  ".env.workforce-auth.docker.local",
  ".env.customer-commerce.docker.local",
  ".env.operations.docker.local",
];
/**
 * customer-commerce Compose env_file precedence (later overrides earlier),
 * then compose.yaml `environment:` overrides. Diagnostic projection must
 * inspect this full stack — not only `.env.runtime.docker.local`.
 */
const CUSTOMER_COMMERCE_ENV_FILE_PRECEDENCE = [
  ".env.runtime.docker.local",
  ".env.customer-auth.docker.local",
  ".env.customer-commerce.docker.local",
];
const DIAGNOSTIC_ENABLED_KEY = "BOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED";
const SOCKET = `unix:///run/user/${process.getuid?.() ?? 1000}/podman/podman.sock`;
const OCI_REVISION_LABEL = "org.opencontainers.image.revision";
const BOBA_BUILD_IMAGES = {
  app: "boba-bear-app:local",
  "customer-auth": "boba-bear-customer-auth:local",
  "workforce-auth": "boba-bear-workforce-auth:local",
  "customer-commerce": "boba-bear-customer-commerce:local",
  operations: "boba-bear-operations:local",
  tooling: "boba-bear-tooling:local",
};
const BOBA_RUNTIME_SERVICES = Object.keys(BOBA_BUILD_IMAGES).filter((service) => service !== "tooling");
const DIRECT_ORDERING_BRAND_ID = "56ff7724-d511-5ef4-b5d5-d629cbfb2388";
const UAT_SERVICEABILITY_CASES = [
  { name: "origin", latitude: "30.2868286", longitude: "77.9991566", expectedStatus: "SERVICEABLE" },
  { name: "nearby", latitude: "30.2877280", longitude: "77.9991566", expectedStatus: "SERVICEABLE" },
  { name: "outside", latitude: "30.3680000", longitude: "77.9991566", expectedStatus: "NOT_SERVICEABLE" },
];

const command = process.argv[2];
const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli && !["status", "deploy-dry-run", "deploy", "recover-postgres", "workforce-user-create"].includes(command)) {
  console.error("Usage: npm run env:staging:status | npm run env:staging:deploy:dry-run | npm run env:staging:deploy | npm run env:staging:recover-postgres | npm run env:staging:workforce:user:create -- [workforce:user:create arguments]");
  process.exit(1);
}

/** Preflight/build children must never inherit founder password stdin. */
function closedStdinInherit() {
  return ["ignore", "inherit", "inherit"];
}

function closedStdinPipes() {
  return ["ignore", "pipe", "pipe"];
}

function git(args) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: closedStdinPipes(),
  }).trim();
}

function fingerprint() {
  return execFileSync("npm", ["run", "working-tree:fingerprint"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: closedStdinPipes(),
  })
    .match(/WORKING_TREE_FINGERPRINT\s+([a-f0-9]+)/)?.[1] ?? "UNAVAILABLE";
}

/** Consume outer wrapper stdin once into memory. Never argv/env/file. */
function readSecretStdinBuffer(readSync = readFileSync) {
  return readSync(0);
}

function zeroSecretBuffer(buffer) {
  if (buffer && typeof buffer.fill === "function") buffer.fill(0);
}

/**
 * Spawn a child with stdin ignored so password bytes cannot be drained by
 * preflight/build helpers (git/bash/npm/podman build).
 */
function spawnIgnoringStdin(command, args, options = {}, spawn = spawnSync) {
  const stdio = options.encoding ? ["ignore", "pipe", "pipe"] : closedStdinInherit();
  return spawn(command, args, { ...options, stdio });
}

function execIgnoringStdin(command, args, options = {}, exec = execFileSync) {
  const { stdio, ...rest } = options;
  let resolved;
  if (stdio === "ignore") {
    resolved = "ignore";
  } else if (Array.isArray(stdio)) {
    resolved = ["ignore", stdio[1] ?? "pipe", stdio[2] ?? "pipe"];
  } else {
    resolved = rest.encoding ? closedStdinPipes() : ["ignore", "pipe", "pipe"];
  }
  return exec(command, args, { ...rest, stdio: resolved });
}

/**
 * Final operator only: feed in-memory password bytes through a stdin pipe.
 * stdout/stderr remain inherited. Does not place secrets in argv or env.
 */
function spawnWithStdinBuffer(command, args, stdinBuffer, options = {}, spawn = spawnSync) {
  return spawn(command, args, {
    ...options,
    stdio: ["pipe", "inherit", "inherit"],
    input: stdinBuffer,
  });
}

function readCandidate() {
  const branch = git(["branch", "--show-current"]);
  const head = git(["rev-parse", "HEAD"]);
  const originMain = git(["rev-parse", "origin/main"]);
  const trackedDirty = git(["status", "--porcelain", "--untracked-files=no"]);
  return { branch, head, originMain, trackedDirty, fingerprint: fingerprint() };
}

function isFullGitSha(value) {
  return /^[0-9a-f]{40}$/.test(value);
}

function assertDeployPreconditions(candidate) {
  if (
    candidate.branch !== "main" ||
    candidate.head !== candidate.originMain ||
    candidate.trackedDirty.length !== 0 ||
    !isFullGitSha(candidate.head)
  ) {
    console.error("Staging deployment requires clean tracked source at exact origin/main.");
    console.error(`BRANCH ${candidate.branch}`);
    console.error(`HEAD ${candidate.head}`);
    console.error(`ORIGIN_MAIN ${candidate.originMain}`);
    console.error(`FULL_GIT_SHA ${isFullGitSha(candidate.head) ? "YES" : "NO"}`);
    console.error(`TRACKED_SOURCE_CLEAN ${candidate.trackedDirty.length === 0 ? "YES" : "NO"}`);
    process.exit(1);
  }
}

function readRepositoryPublicBuildEnv() {
  // Browser build key only. It is not artifact authority and is absent from git archive.
  const envPath = path.join(repositoryRoot, ".env");
  if (!existsSync(envPath)) return {};
  const parsed = parseEnvFile(readFileSync(envPath, "utf8"));
  const extracted = extractValues(parsed);
  if (!extracted.ok) return {};
  const browserKey = extracted.values.NEXT_PUBLIC_BOBA_BEAR_GOOGLE_MAPS_BROWSER_KEY?.trim();
  if (!browserKey || browserKey.startsWith("replace-with")) return {};
  return { NEXT_PUBLIC_BOBA_BEAR_GOOGLE_MAPS_BROWSER_KEY: browserKey };
}

function podmanCompose(buildDir, args, extraEnv = {}) {
  const publicBuildEnv = readRepositoryPublicBuildEnv();
  const result = spawnIgnoringStdin("podman-compose", ["-f", "compose.yaml", "-p", STAGING_PROJECT, ...args], {
    cwd: buildDir,
    env: {
      ...process.env,
      ...publicBuildEnv,
      DOCKER_HOST: SOCKET,
      COMPOSE_PROJECT_NAME: STAGING_PROJECT,
      COMPOSE_PROFILES: extraEnv.COMPOSE_PROFILES ?? process.env.COMPOSE_PROFILES ?? "",
      BOBA_BUILD_SHA: extraEnv.BOBA_BUILD_SHA ?? "",
      BOBA_BEAR_IMAGE_RELEASE: extraEnv.BOBA_BUILD_SHA ?? "staging-local",
      BOBA_POSTGRES_INIT_DIR: extraEnv.BOBA_POSTGRES_INIT_DIR ?? "",
    },
  });
  if (result.error) {
    console.error(`podman-compose failed: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function materializeExactGitTree(sha) {
  const tree = git(["rev-parse", `${sha}^{tree}`]);
  const extracted = extractVerifiedGitArchive({
    repositoryRoot,
    sha,
    expectedTree: tree,
  });
  if (!extracted.ok || typeof extracted.extractDir !== "string") {
    console.error(extracted.detail ?? "exact git archive verification failed");
    process.exit(1);
  }
  return extracted.extractDir;
}

/**
 * Replace or append exactly one `KEY=value` assignment. Idempotent for the
 * same key/value. Does not touch other assignments.
 */
function normalizeEnvAssignment(content, key, value) {
  const assignment = `${key}=${value}`;
  if (content.includes(`${key}=`)) {
    return content.replace(new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=.*$`, "m"), assignment);
  }
  return `${content.trimEnd()}\n${assignment}\n`;
}

function ensureStagingEnvFiles(
  buildDir,
  {
    stagingEnvDir = STAGING_ENV_DIR,
    root = repositoryRoot,
    envFiles = STAGING_ENV_FILES,
    initMissing = false,
  } = {},
) {
  if (initMissing) {
    throw new Error("Strict staging does not bootstrap local env files.");
  }
  ensureOwnerOnlySecretDirectory(stagingEnvDir);
  const missing = envFiles.filter(
    (file) => !existsSync(path.join(stagingEnvDir, file)) && !existsSync(path.join(root, file)),
  );
  if (missing.length > 0) {
    throw new Error(`Missing required staging env file: ${missing.join(", ")}`);
  }
  for (const file of envFiles) {
    const persistent = path.join(stagingEnvDir, file);
    const live = path.join(root, file);
    const source = existsSync(persistent) ? persistent : live;
    if (!existsSync(source)) {
      throw new Error(`Missing required staging env file: ${file}`);
    }
    if (!existsSync(persistent)) {
      copyOwnerOnlySecretFile(source, persistent);
    } else if (inspectOwnerOnlyFile(persistent).ok !== true) {
      throw new Error(`SECRET_FILE_MODE_INSECURE ${file}`);
    }
    copyOwnerOnlySecretFile(persistent, path.join(buildDir, file));
  }
}

/**
 * Materialize candidate init assets without deleting an active mount and without
 * overwriting a path whose content identity differs. Same-SHA repeats are idempotent.
 */
function materializeStagingPostgresInit(
  buildDir,
  sha,
  {
    activeMountSource = null,
    runtimeAssetsDir = STAGING_RUNTIME_ASSETS_DIR,
    collect = collectInitManifest,
    exists = existsSync,
    mkdir = mkdirSync,
    copy = cpSync,
    log = console.log,
  } = {},
) {
  const source = path.join(buildDir, "docker", "postgres", "init");
  const destination = path.join(runtimeAssetsDir, "postgres-init", sha);
  if (!exists(source)) throw new Error("Exact staging candidate does not contain docker/postgres/init.");

  const resolvedDestination = path.resolve(destination);
  const resolvedActive =
    typeof activeMountSource === "string" && activeMountSource.length > 0
      ? path.resolve(activeMountSource)
      : null;

  // Never recursively remove an active mounted directory (same-SHA or otherwise).
  if (resolvedActive && resolvedDestination === resolvedActive) {
    const candidateManifest = collect(source);
    const activeManifest = collect(resolvedActive);
    if (!candidateManifest.ok || !activeManifest.ok || candidateManifest.digest !== activeManifest.digest) {
      throw new Error("Active postgres-init mount content diverges from candidate; refusing overwrite.");
    }
    log(`STAGING_POSTGRES_INIT_DIR ${destination}`);
    log(`STAGING_POSTGRES_INIT_SOURCE_GIT_SHA ${sha}`);
    log("STAGING_POSTGRES_INIT_MATERIALIZE SKIP_ACTIVE_MOUNT");
    return destination;
  }

  if (exists(destination)) {
    const candidateManifest = collect(source);
    const existingManifest = collect(destination);
    if (!candidateManifest.ok || !existingManifest.ok) {
      throw new Error("Unable to verify existing postgres-init materialization; refusing mutation.");
    }
    if (candidateManifest.digest !== existingManifest.digest) {
      throw new Error("Existing postgres-init path content differs from candidate; refusing overwrite.");
    }
    log(`STAGING_POSTGRES_INIT_DIR ${destination}`);
    log(`STAGING_POSTGRES_INIT_SOURCE_GIT_SHA ${sha}`);
    log("STAGING_POSTGRES_INIT_MATERIALIZE IDEMPOTENT");
    return destination;
  }

  mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
  copy(source, destination, { recursive: true, preserveTimestamps: true });
  log(`STAGING_POSTGRES_INIT_DIR ${destination}`);
  log(`STAGING_POSTGRES_INIT_SOURCE_GIT_SHA ${sha}`);
  log("STAGING_POSTGRES_INIT_MATERIALIZE CREATED");
  return destination;
}

/**
 * Read-only resolution of the Compose init mount for an existing staging PostgreSQL.
 * Prefer preserving the active trusted mount when candidate content matches.
 */
function resolveStagingPostgresInitMount(
  buildDir,
  sha,
  {
    inspect = inspectJson,
    collect = collectInitManifest,
    runtimeAssetsDir = STAGING_RUNTIME_ASSETS_DIR,
    repositoryRoot: root = repositoryRoot,
    log = console.log,
  } = {},
) {
  const container = `${STAGING_PROJECT}_postgres_1`;
  const volume = `${STAGING_PROJECT}_postgres-data`;
  const candidateSource = path.join(buildDir, "docker", "postgres", "init");
  const candidateManifest = collect(candidateSource);
  const candidateMaterializedPath = path.join(runtimeAssetsDir, "postgres-init", sha);

  let activePostgres = {
    present: false,
    volumePresent: false,
    mountSource: null,
    project: null,
    persistentVolume: null,
    // Image upgrades are R3; preflight must not invent compatibility PASS.
    imageCompatConflict: null,
  };
  try {
    const database = inspect(container);
    const dataMounts = database.Mounts.filter(
      (mount) => mount.Name === volume && mount.Destination === "/var/lib/postgresql",
    );
    const initMount = database.Mounts.find((mount) => mount.Destination === "/docker-entrypoint-initdb.d");
    activePostgres = {
      present: true,
      volumePresent: dataMounts.length === 1,
      mountSource: initMount?.Source ?? null,
      project: database.Config.Labels?.["io.podman.compose.project"] ?? null,
      persistentVolume: dataMounts.length === 1 ? volume : null,
      // Live image-compat determination is not established by this probe.
      imageCompatConflict: null,
    };
  } catch (error) {
    if (!String(error.message ?? error).includes("no such object")) throw error;
    activePostgres = {
      present: false,
      volumePresent: false,
      mountSource: null,
      project: null,
      persistentVolume: null,
      imageCompatConflict: null,
    };
  }

  const disposition = resolvePostgresInitDisposition({
    candidateManifest,
    candidateMaterializedPath,
    activePostgres,
    trustRoots: {
      runtimeAssetsRoot: runtimeAssetsDir,
      repositoryInitRoot: path.join(root, "docker", "postgres", "init"),
    },
  });

  log(`POSTGRES_INIT_DISPOSITION ${disposition.disposition}`);
  log(`POSTGRES_INIT_REASON ${disposition.reasonCode}`);
  if (disposition.composeInitDir) {
    log(`POSTGRES_INIT_COMPOSE_DIR ${disposition.composeInitDir}`);
  }
  if (disposition.contentDigest) {
    log(`POSTGRES_INIT_CONTENT_DIGEST ${disposition.contentDigest}`);
  }
  return { disposition, candidateMaterializedPath, candidateManifest, activePostgres };
}

function podmanInspect(name, format) {
  return execIgnoringStdin("podman", ["inspect", name, "--format", format], { encoding: "utf8" }).trim();
}

function imageRevision(image) {
  return podmanInspect(image, `{{ index .Config.Labels \"${OCI_REVISION_LABEL}\" }}`);
}

function readDockerfileNodeImage(dockerfilePath) {
  const match = readFileSync(dockerfilePath, "utf8").match(/^ARG NODE_IMAGE=(\S+)/m);
  if (!match) throw new Error("Dockerfile is missing ARG NODE_IMAGE.");
  return match[1];
}

function assertLocalOperatorBaseImage(image) {
  const result = spawnIgnoringStdin("podman", ["image", "exists", image]);
  if (result.status !== 0) {
    throw new Error(`LOCAL_OPERATOR_BASE_IMAGE_REQUIRED: ${image}`);
  }
}

function discardMismatchedOperatorCandidateTag(
  image,
  expectedSha,
  {
    exists = (name) => spawnIgnoringStdin("podman", ["image", "exists", name]).status === 0,
    inspectRevision = imageRevision,
    untag = (name) => runPodman(["untag", name]),
  } = {},
) {
  if (!exists(image)) return;
  if (inspectRevision(image) === expectedSha) return;
  untag(image);
}

function assertImageRevisions(expectedSha, images = BOBA_BUILD_IMAGES, inspectRevision = imageRevision) {
  for (const [service, image] of Object.entries(images)) {
    const revision = inspectRevision(image);
    if (revision !== expectedSha) {
      throw new Error(`Image provenance mismatch for ${service}: expected ${expectedSha}, found ${revision || "MISSING"}.`);
    }
  }
}

function readRunningProvenance(service) {
  const container = `${STAGING_PROJECT}_${service}_1`;
  const containerId = podmanInspect(container, "{{.Id}}");
  const imageId = podmanInspect(container, "{{.Image}}");
  const imageName = podmanInspect(container, "{{.ImageName}}");
  const revision = imageRevision(imageId);
  const health = podmanInspect(container, "{{.State.Health.Status}}");
  return { service, containerId, imageId, imageName, revision, health };
}

function readToolingProvenance() {
  const imageName = BOBA_BUILD_IMAGES.tooling;
  return {
    imageName,
    imageId: podmanInspect(imageName, "{{.Id}}"),
    revision: imageRevision(imageName),
  };
}

function assertRunningProvenance(expectedSha, records, builtImageIds = null) {
  for (const record of records) {
    if (record.revision !== expectedSha) {
      throw new Error(
        `Running image provenance mismatch for ${record.service}: expected ${expectedSha}, found ${record.revision || "MISSING"}.`,
      );
    }
    if (builtImageIds && builtImageIds[record.service] !== record.imageId) {
      throw new Error(`Running image id mismatch for ${record.service}.`);
    }
  }
}

function reportRunningProvenance(expectedSha, builtImageIds = null) {
  let records;
  let tooling;
  try {
    records = BOBA_RUNTIME_SERVICES.map(readRunningProvenance);
    tooling = readToolingProvenance();
  } catch (error) {
    console.log(`RUNNING_PROVENANCE_AVAILABLE NO`);
    console.log(`CANDIDATE_MATCH NO`);
    console.log(`RUNNING_PROVENANCE_ERROR ${error.message}`);
    return false;
  }
  for (const record of records) {
    const prefix = record.service.toUpperCase().replaceAll("-", "_");
    console.log(`${prefix}_CONTAINER_ID ${record.containerId}`);
    console.log(`${prefix}_IMAGE_ID ${record.imageId}`);
    console.log(`${prefix}_IMAGE_NAME ${record.imageName}`);
    console.log(`${prefix}_REVISION ${record.revision || "MISSING"}`);
    console.log(`${prefix}_HEALTH ${record.health}`);
  }
  console.log(`TOOLING_IMAGE_ID ${tooling.imageId}`);
  console.log(`TOOLING_IMAGE_NAME ${tooling.imageName}`);
  console.log(`TOOLING_REVISION ${tooling.revision || "MISSING"}`);
  try {
    assertRunningProvenance(expectedSha, records, builtImageIds);
    if (tooling.revision !== expectedSha) {
      throw new Error(`Tooling image provenance mismatch: expected ${expectedSha}, found ${tooling.revision || "MISSING"}.`);
    }
    console.log("RUNNING_PROVENANCE_AVAILABLE YES");
    console.log(`RUNNING_GIT_SHA ${expectedSha}`);
    console.log("CANDIDATE_MATCH YES");
    return true;
  } catch (error) {
    console.log("RUNNING_PROVENANCE_AVAILABLE YES");
    console.log(`CANDIDATE_MATCH NO`);
    console.log(`RUNNING_PROVENANCE_ERROR ${error.message}`);
    return false;
  }
}

function waitForHealthy(containerName, timeoutMs = 180_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const status = podmanInspect(containerName, "{{.State.Health.Status}}");
      if (status === "healthy") {
        console.log(`HEALTHY ${containerName}`);
        return;
      }
    } catch {
      // Container may not exist yet.
    }
    spawnIgnoringStdin("sleep", ["2"]);
  }
  console.error(`Timed out waiting for healthy container: ${containerName}`);
  process.exit(1);
}

function stopLegacyRuntimeIfNeeded() {
  for (const name of [
    "boba-bear_app_1",
    "boba-bear_customer-commerce_1",
    "boba-bear_customer-auth_1",
    "boba-bear_workforce-auth_1",
    "boba-bear_operations_1",
    "boba-bear_postgres_1",
  ]) {
    spawnIgnoringStdin("podman", ["stop", name]);
  }
}

function runPodman(args, options = {}) {
  const result = spawnIgnoringStdin("podman", args, options);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`podman ${args[0]} failed.`);
}

function runPodmanWithSecretStdin(args, stdinBuffer, options = {}, spawn = spawnSync) {
  const result = spawnWithStdinBuffer("podman", args, stdinBuffer, options, spawn);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`podman ${args[0]} failed.`);
  return result;
}

function inspectJson(name) {
  return JSON.parse(execIgnoringStdin("podman", ["inspect", name], { encoding: "utf8" }))[0];
}

function stagingNetworkForPostgres(database) {
  const names = Object.keys(database.NetworkSettings.Networks ?? {});
  const network = names.find((name) => {
    const labels = JSON.parse(
      execIgnoringStdin("podman", ["network", "inspect", name, "--format", "{{json .Labels}}"], {
        encoding: "utf8",
      }),
    );
    return labels["io.podman.compose.project"] === STAGING_PROJECT;
  });
  if (!network) throw new Error("No boba-staging Podman network is attached to PostgreSQL.");
  return network;
}

function assertStagingWorkforceOperatorTarget() {
  const databaseContainer = `${STAGING_PROJECT}_postgres_1`;
  const volume = `${STAGING_PROJECT}_postgres-data`;
  const database = inspectJson(databaseContainer);
  const project = database.Config.Labels?.["io.podman.compose.project"];
  const dataMounts = database.Mounts.filter((mount) => mount.Name === volume && mount.Destination === "/var/lib/postgresql");
  if (project !== STAGING_PROJECT || database.State.Status !== "running" || database.State.Health?.Status !== "healthy" || dataMounts.length !== 1) {
    throw new Error("Founder staging workforce operator target is unavailable or ambiguous.");
  }
  execIgnoringStdin("podman", ["volume", "inspect", volume], { stdio: "ignore" });
  const network = stagingNetworkForPostgres(database);
  console.log(`STAGING_OPERATOR_PROJECT ${STAGING_PROJECT}`);
  console.log(`STAGING_OPERATOR_DATABASE_CONTAINER ${databaseContainer}`);
  console.log("POSTGRES_RUNNING YES");
  console.log("POSTGRES_HEALTHY YES");
  console.log(`STAGING_OPERATOR_PERSISTENT_VOLUME ${volume}`);
  console.log("NETWORK_PROJECT_MATCH YES");
  console.log("STAGING_OPERATOR_TARGET_PROVEN YES");
  return { databaseContainer, network };
}

/**
 * Staging workforce user create.
 *
 * Security invariant: founder password bytes are delivered to exactly one
 * process — the final isolated `podman run` workforce operator CLI. All
 * preflight/materialize/env-init/build children use closed stdin.
 */
function createStagingWorkforceUser(args, deps = {}) {
  const {
    assertTarget = assertStagingWorkforceOperatorTarget,
    readCandidateFn = readCandidate,
    assertPreconditions = assertDeployPreconditions,
    materializeTree = materializeExactGitTree,
    ensureEnv = ensureStagingEnvFiles,
    readBaseImage = readDockerfileNodeImage,
    assertLocalBase = assertLocalOperatorBaseImage,
    discardStaleTag = discardMismatchedOperatorCandidateTag,
    buildPodman = runPodman,
    revisionOf = imageRevision,
    readStdin = readSecretStdinBuffer,
    runOperator = runPodmanWithSecretStdin,
    zeroBuffer = zeroSecretBuffer,
    exists = existsSync,
    removeDir = rmSync,
    envDir = STAGING_ENV_DIR,
  } = deps;

  const { network } = assertTarget();
  const candidate = readCandidateFn();
  assertPreconditions(candidate);
  const buildDir = materializeTree(candidate.head);
  const image = `boba-bear-staging-workforce-operator:${candidate.head}`;
  let secretBuffer;
  try {
    ensureEnv(buildDir);
    assertLocalBase(readBaseImage(path.join(buildDir, "Dockerfile")));
    discardStaleTag(image, candidate.head);
    buildPodman(
      [
        "build",
        "--pull=never",
        "--file",
        "Dockerfile",
        "--target",
        "tooling",
        "--build-arg",
        `BOBA_BUILD_SHA=${candidate.head}`,
        "--label",
        `${OCI_REVISION_LABEL}=${candidate.head}`,
        "--tag",
        image,
        ".",
      ],
      { cwd: buildDir },
    );
    if (revisionOf(image) !== candidate.head) {
      throw new Error("Dedicated workforce operator image lacks exact merged-main provenance.");
    }
    const envFiles = [".env.runtime.docker.local", ".env.workforce-auth.docker.local"].map((file) =>
      path.join(envDir, file),
    );
    if (envFiles.some((file) => !exists(file))) {
      throw new Error("Required staging workforce operator environment is missing.");
    }

    // Consume outer stdin only after all non-secret setup is complete.
    secretBuffer = readStdin();
    const runArgs = [
      "run",
      "--rm",
      "--interactive",
      "--network",
      network,
      "--read-only",
      "--tmpfs",
      "/tmp",
      "--cap-drop",
      "ALL",
      "--security-opt",
      "no-new-privileges:true",
      ...envFiles.flatMap((file) => ["--env-file", file]),
      image,
      "npm",
      "run",
      "workforce:user:create",
      "--",
      ...args,
    ];
    runOperator(runArgs, secretBuffer, {});
  } finally {
    zeroBuffer(secretBuffer);
    removeDir(buildDir, { recursive: true, force: true });
  }
}

function upAndWait(buildDir, services, extraEnv = {}) {
  podmanCompose(buildDir, ["up", "-d", "--force-recreate", "--no-deps", ...services], extraEnv);
  for (const service of services) {
    waitForHealthy(`${STAGING_PROJECT}_${service}_1`);
  }
}

/**
 * Preserve an existing persistent PostgreSQL when init content identity matches.
 * Path-only SHA directory changes do not restart or replace PostgreSQL.
 * Content mismatch / untrusted mounts / absent containers fail closed (no recreate).
 */
function ensurePersistentPostgres(
  buildDir,
  initPlan,
  {
    inspect = inspectJson,
    run = runPodman,
    wait = waitForHealthy,
    log = console.log,
    trustRoots = {
      runtimeAssetsRoot: STAGING_RUNTIME_ASSETS_DIR,
      repositoryInitRoot: path.join(repositoryRoot, "docker", "postgres", "init"),
    },
  } = {},
) {
  const container = `${STAGING_PROJECT}_postgres_1`;
  const volume = `${STAGING_PROJECT}_postgres-data`;
  const disposition = initPlan?.disposition;
  if (!disposition || disposition.disposition !== POSTGRES_INIT_DISPOSITION.PRESERVE) {
    throw new Error(
      `PostgreSQL init mount is not preservable (${disposition?.reasonCode ?? "UNKNOWN"}); refusing automatic recreation.`,
    );
  }
  const initDir = disposition.composeInitDir;
  if (typeof initDir !== "string" || initDir.length === 0) {
    throw new Error("Preserved PostgreSQL init mount path is missing.");
  }
  if (!isTrustedStagingInitMountPath(initDir, trustRoots)) {
    throw new Error("Preserved PostgreSQL init mount path is outside trusted staging roots.");
  }

  const database = inspect(container);
  const dataMounts = database.Mounts.filter(
    (mount) => mount.Name === volume && mount.Destination === "/var/lib/postgresql",
  );
  if (dataMounts.length !== 1) {
    throw new Error("Persistent PostgreSQL is missing the boba-staging_postgres-data volume mount.");
  }
  const initMount = database.Mounts.find((mount) => mount.Destination === "/docker-entrypoint-initdb.d");
  if (!initMount?.Source || path.resolve(initMount.Source) !== path.resolve(initDir)) {
    throw new Error(
      "Active PostgreSQL init mount diverged after preflight; refusing mutation (no automatic recreate).",
    );
  }
  if (database.State.Status !== "running") {
    run(["start", container]);
  }
  wait(container);
  log("POSTGRES_INIT_MOUNT_PRESERVED YES");
  log(`POSTGRES_INIT_MOUNT_PATH ${initDir}`);
  log("POSTGRES_VOLUME_PRESERVED YES");
  log("POSTGRES_CONTAINER_REPLACED NO");
  return { initDir, preserved: true };
}

function assertLegacyPostgresRecoveryTarget() {
  const container = `${STAGING_PROJECT}_postgres_1`;
  const volume = `${STAGING_PROJECT}_postgres-data`;
  const database = inspectJson(container);
  const dataMount = database.Mounts.filter((mount) => mount.Name === volume && mount.Destination === "/var/lib/postgresql");
  const brokenMount = database.Mounts.find((mount) => mount.Destination === "/docker-entrypoint-initdb.d");
  if (database.Config.Labels?.["io.podman.compose.project"] !== STAGING_PROJECT || dataMount.length !== 1 || !brokenMount?.Source.startsWith("/tmp/boba-staging-build-") || existsSync(brokenMount.Source)) {
    throw new Error("PostgreSQL recovery target is ambiguous or is not the known legacy staging bind-mount defect.");
  }
  return { container, volume, database };
}

export function stopAndRemoveLegacyPostgres(legacy, inspect = inspectJson, run = runPodman) {
  const state = legacy.database.State.Status;
  if (state === "running") {
    run(["stop", "-t", "30", legacy.container]);
    const stoppedState = inspect(legacy.container).State.Status;
    if (stoppedState === "running" || !["exited", "stopped"].includes(stoppedState)) {
      throw new Error("PostgreSQL did not stop cleanly; refusing to remove the container.");
    }
  } else if (!["exited", "stopped"].includes(state)) {
    throw new Error(`PostgreSQL recovery target is not safely removable from state: ${state}.`);
  }
  run(["rm", legacy.container]);
}

function recoverPostgres(candidate) {
  assertDeployPreconditions(candidate);
  const buildDir = materializeExactGitTree(candidate.head);
  try {
    ensureStagingEnvFiles(buildDir);
    const initDir = materializeStagingPostgresInit(buildDir, candidate.head);
    const legacy = assertLegacyPostgresRecoveryTarget();
    console.log(`POSTGRES_OLD_CONTAINER_ID ${legacy.database.Id}`);
    console.log(`POSTGRES_PERSISTENT_VOLUME ${legacy.volume}`);
    for (const service of BOBA_RUNTIME_SERVICES) {
      const container = `${STAGING_PROJECT}_${service}_1`;
      try { runPodman(["stop", container]); runPodman(["rm", container]); } catch { /* absent containers are permitted */ }
    }
    stopAndRemoveLegacyPostgres(legacy);
    podmanCompose(buildDir, ["up", "-d", "postgres"], { BOBA_POSTGRES_INIT_DIR: initDir });
    waitForHealthy(`${STAGING_PROJECT}_postgres_1`);
    upAndWait(buildDir, BOBA_RUNTIME_SERVICES, { BOBA_POSTGRES_INIT_DIR: initDir });
    console.log("POSTGRES_VOLUME_PRESERVED YES");
    console.log("POSTGRES_REPLACEMENT_CREATED YES");
  } finally {
    rmSync(buildDir, { recursive: true, force: true });
  }
}

function runBootstrapApply(buildDir, service, npmArgs) {
  podmanCompose(buildDir, [
    "run",
    "--rm",
    "--no-deps",
    "--entrypoint",
    "",
    service,
    "npm",
    "run",
    ...npmArgs,
    "--",
    "--apply",
  ], { COMPOSE_PROFILES: "tools" });
}

function runLegacySeedBootstrapChain(buildDir) {
  runBootstrapApply(buildDir, "menu-import-existing", ["menu:import-existing"]);
  runBootstrapApply(buildDir, "assortment-bootstrap-existing-menu", ["assortment:bootstrap-existing-menu"]);
  runBootstrapApply(buildDir, "pricing-bootstrap-existing-menu", ["pricing:bootstrap-existing-menu"]);
  runBootstrapApply(buildDir, "catalog-bootstrap-imp028c-modifiers", ["catalog:bootstrap-imp028c-modifiers"]);
  runBootstrapApply(buildDir, "catalog-bootstrap-imp036c-required-topping", ["catalog:bootstrap-imp036c-required-topping"]);
}

/**
 * Read-only staging baseline classification via tooling image + application DB env.
 * Captures stdout; never places secrets in argv/logs.
 */
function classifyStagingBaselineInTooling(
  buildDir,
  {
    spawn = spawnIgnoringStdin,
    publicBuildEnv = readRepositoryPublicBuildEnv(),
  } = {},
) {
  // -T disables podman-compose run's default pseudo-TTY so captured classifier
  // stdout stays machine-readable (no cursor ANSI before STAGING_BASELINE_STATE).
  const result = spawn(
    "podman-compose",
    [
      "-f",
      "compose.yaml",
      "-p",
      STAGING_PROJECT,
      "run",
      "-T",
      "--rm",
      "--no-deps",
      "--entrypoint",
      "",
      "menu-import-existing",
      "npm",
      "run",
      "staging:baseline-classify",
    ],
    {
      cwd: buildDir,
      encoding: "utf8",
      env: {
        ...process.env,
        ...publicBuildEnv,
        DOCKER_HOST: SOCKET,
        COMPOSE_PROJECT_NAME: STAGING_PROJECT,
        COMPOSE_PROFILES: "tools",
      },
    },
  );
  if (result.error) {
    throw new Error(`Staging baseline classify failed to start: ${result.error.message}`);
  }
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) {
    throw new Error("Staging baseline classify exited non-zero.");
  }
  return parseStagingBaselineState(output);
}

/**
 * After migrate: classify → APPLY (fresh) / PRESERVE (compatible) / BLOCK (partial).
 * Fresh apply re-checks and requires COMPLETE_COMPATIBLE before continuing.
 */
function decideAndApplyStagingBootstrap(
  buildDir,
  {
    classify = classifyStagingBaselineInTooling,
    applyLegacy = runLegacySeedBootstrapChain,
    log = console.log,
  } = {},
) {
  const initialState = classify(buildDir);
  const action = resolveStagingBootstrapAction(initialState);
  for (const line of stagingBaselineDecisionLogLines(initialState)) {
    log(line);
  }

  if (action === "BLOCK") {
    throw new Error(
      "Staging persistent database is PARTIAL_OR_INCOMPATIBLE with the Founder seed baseline; refusing to start application services.",
    );
  }

  if (action === "PRESERVE") {
    return { initialState, action, finalState: initialState };
  }

  applyLegacy(buildDir);
  const finalState = classify(buildDir);
  log("STAGING_POST_BOOTSTRAP_CLASSIFY YES");
  for (const line of stagingBaselineDecisionLogLines(finalState)) {
    log(line);
  }
  if (finalState !== "COMPLETE_COMPATIBLE") {
    throw new Error(
      `Staging seed/bootstrap completed but baseline is ${finalState}; refusing to start application services.`,
    );
  }
  return { initialState, action, finalState };
}

export function assertServiceabilitySmokeResponse(caseName, expectedStatus, response) {
  if (response.httpStatus !== 200 || response.decisionStatus !== expectedStatus) {
    throw new Error(
      `Serviceability UAT smoke failed for ${caseName}: expected HTTP 200 / ${expectedStatus}, found HTTP ${response.httpStatus} / ${response.decisionStatus ?? "MISSING"}${response.reason ? ` (${response.reason})` : ""}.`,
    );
  }
}

function runServiceabilityUatSmoke() {
  for (const testCase of UAT_SERVICEABILITY_CASES) {
    const body = JSON.stringify({
      brandId: DIRECT_ORDERING_BRAND_ID,
      location: { coordinates: { latitude: testCase.latitude, longitude: testCase.longitude } },
    });
    const result = spawnIgnoringStdin(
      "curl",
      [
        "--silent",
        "--show-error",
        "--request",
        "POST",
        "http://127.0.0.1:8080/api/v1/serviceability/evaluate",
        "--header",
        "content-type: application/json",
        "--data",
        body,
        "--write-out",
        "\n%{http_code}",
      ],
      { encoding: "utf8" },
    );
    if (result.error || result.status !== 0) {
      throw new Error(`Serviceability UAT smoke request failed for ${testCase.name}.`);
    }
    const [rawBody, rawStatus] = result.stdout.trimEnd().split(/\n(?=\d{3}$)/);
    let parsed;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new Error(`Serviceability UAT smoke returned an invalid response for ${testCase.name}.`);
    }
    const response = {
      httpStatus: Number(rawStatus),
      decisionStatus: parsed?.decision?.status,
      reason: parsed?.decision?.reason,
    };
    assertServiceabilitySmokeResponse(testCase.name, testCase.expectedStatus, response);
    console.log(`SERVICEABILITY_UAT_${testCase.name.toUpperCase()} ${response.decisionStatus}`);
  }
}

function parseDiagnosticEnabledRaw(raw) {
  if (raw == null || raw === "") return { defined: false, enabled: false };
  // Match customer-commerce loadCheckoutPrepareDiagnosticConfig: exact "true" only.
  return { defined: true, enabled: raw === "true" };
}

/**
 * Project customer-commerce diagnostic enablement across Compose env_file
 * precedence plus explicit compose `environment` overrides.
 *
 * Does not print raw environment values or secrets.
 * Ambiguous / malformed / inaccessible / conflicting → invalid (never PASS).
 *
 * Full AppEnvironment/loadConfig projection remains UNKNOWN without an
 * authorized architecture decision (BOBA_BEAR_ENV / TLS / auth origins unchanged).
 */
function readStagingDiagnosticEnabled(
  stagingEnvDir = STAGING_ENV_DIR,
  {
    composeEnvironment = {},
    envFilePrecedence = CUSTOMER_COMMERCE_ENV_FILE_PRECEDENCE,
    readFile = readFileSync,
    exists = existsSync,
    repositoryRoot: root = repositoryRoot,
  } = {},
) {
  /** @type {Array<{ file: string, present: boolean, defined: boolean, enabled: boolean, invalid?: boolean }>} */
  const layers = [];
  let anyUnreadable = false;
  let anyMalformed = false;

  for (const file of envFilePrecedence) {
    const stagingPath = path.join(stagingEnvDir, file);
    const repoPath = path.join(root, file);
    const filePath = exists(stagingPath) ? stagingPath : exists(repoPath) ? repoPath : null;
    if (!filePath) {
      layers.push({ file, present: false, defined: false, enabled: false });
      continue;
    }
    let content;
    try {
      content = readFile(filePath, "utf8");
    } catch {
      anyUnreadable = true;
      layers.push({ file, present: true, defined: false, enabled: false, invalid: true });
      continue;
    }
    const parsed = parseEnvFile(content);
    const extracted = extractValues(parsed);
    if (!extracted.ok) {
      anyMalformed = true;
      layers.push({ file, present: true, defined: false, enabled: false, invalid: true });
      continue;
    }
    const parsedFlag = parseDiagnosticEnabledRaw(extracted.values[DIAGNOSTIC_ENABLED_KEY]);
    layers.push({
      file,
      present: true,
      defined: parsedFlag.defined,
      enabled: parsedFlag.enabled,
    });
  }

  const composeRaw = Object.prototype.hasOwnProperty.call(composeEnvironment, DIAGNOSTIC_ENABLED_KEY)
    ? composeEnvironment[DIAGNOSTIC_ENABLED_KEY]
    : undefined;
  const composeFlag = parseDiagnosticEnabledRaw(composeRaw);
  if (composeFlag.defined) {
    layers.push({
      file: "compose.environment",
      present: true,
      defined: true,
      enabled: composeFlag.enabled,
    });
  }

  const definedLayers = layers.filter((layer) => layer.defined);
  const enabledSet = new Set(definedLayers.map((layer) => layer.enabled));
  const conflict = enabledSet.size > 1;

  // Compose last-wins effective value (env_file order then compose.environment).
  let effectiveEnabled = false;
  for (const layer of layers) {
    if (layer.defined) effectiveEnabled = layer.enabled;
  }

  // Fail closed: any defined true in the stack is reported enabled for Gate 2.
  const anyEnabled = definedLayers.some((layer) => layer.enabled === true);

  if (anyUnreadable || anyMalformed || conflict) {
    return {
      present: layers.some((layer) => layer.present),
      enabled: true,
      invalid: true,
      conflict,
      projectionKnown: false,
      projectedState: "UNKNOWN",
      layerCount: layers.length,
    };
  }

  return {
    present: layers.every((layer) => layer.file === "compose.environment" || layer.present),
    enabled: anyEnabled || effectiveEnabled,
    invalid: false,
    conflict: false,
    projectionKnown: true,
    projectedState: "PROJECTED",
    layerCount: layers.length,
  };
}

/**
 * Verify rootless Podman socket/engine and inspect the specific staging
 * PostgreSQL container's Compose project / volume identity.
 * Never creates or starts containers.
 */
function probeStagingRuntimeIdentity({
  inspect = inspectJson,
  uid = process.getuid?.(),
  socketPath = null,
  exists = existsSync,
  expectedProject = STAGING_PROJECT,
  expectedContainer = `${STAGING_PROJECT}_postgres_1`,
  expectedVolume = `${STAGING_PROJECT}_postgres-data`,
} = {}) {
  if (uid == null || uid === 0) {
    return {
      evidenceComplete: false,
      identityUnknown: true,
      podmanRootless: false,
      composeProject: null,
      postgresContainer: null,
      postgresVolume: null,
      unexpectedTarget: null,
      detail: "podman rootless uid proof missing",
    };
  }
  const sock = socketPath ?? `/run/user/${uid}/podman/podman.sock`;
  if (!exists(sock)) {
    return {
      evidenceComplete: false,
      identityUnknown: true,
      podmanRootless: false,
      composeProject: null,
      postgresContainer: null,
      postgresVolume: null,
      unexpectedTarget: null,
      detail: "podman rootless socket missing",
    };
  }

  try {
    const database = inspect(expectedContainer);
    const project = database?.Config?.Labels?.["io.podman.compose.project"] ?? null;
    const mounts = Array.isArray(database?.Mounts) ? database.Mounts : [];
    const dataMounts = mounts.filter(
      (mount) => mount.Name === expectedVolume && mount.Destination === "/var/lib/postgresql",
    );
    const projectOk = project === expectedProject;
    const volumeOk = dataMounts.length === 1;
    const unexpectedTarget = !(projectOk && volumeOk);
    return {
      evidenceComplete: true,
      identityUnknown: false,
      podmanRootless: true,
      composeProject: project,
      postgresContainer: expectedContainer,
      postgresVolume: volumeOk ? expectedVolume : null,
      unexpectedTarget,
      detail: unexpectedTarget ? "compose project or persistent volume identity mismatch" : undefined,
    };
  } catch (error) {
    return {
      evidenceComplete: false,
      identityUnknown: true,
      podmanRootless: true,
      composeProject: null,
      postgresContainer: null,
      postgresVolume: null,
      unexpectedTarget: null,
      detail: error instanceof Error ? error.message : "container inspect failed",
    };
  }
}

function readRepositoryIdentityFromRemote(remoteUrl = null) {
  let url = remoteUrl;
  if (url == null) {
    try {
      url = git(["remote", "get-url", "origin"]);
    } catch {
      return null;
    }
  }
  if (typeof url !== "string" || url.length === 0) return null;
  const ssh = url.match(/git@github\.com:([^/]+\/[^/.]+)(?:\.git)?$/i);
  if (ssh) return ssh[1];
  const https = url.match(/github\.com\/([^/]+\/[^/.]+?)(?:\.git)?$/i);
  if (https) return https[1];
  return null;
}

/**
 * Gather read-only preflight evidence. Never starts/stops containers or writes env files.
 * Missing recovery/security/database proof fails closed (no fabricated PASS).
 * Test-only synthetic PASS fixtures live in staging-preflight.validPreflightEvidence only.
 */
function gatherStagingPreflightEvidence(
  candidate,
  {
    treeOf = (sha) => git(["rev-parse", `${sha}^{tree}`]),
    requiredEnvFilesPresent = () =>
      STAGING_ENV_FILES.every(
        (file) => existsSync(path.join(STAGING_ENV_DIR, file)) || existsSync(path.join(repositoryRoot, file)),
      ),
    readDiagnostic = readStagingDiagnosticEnabled,
    resolveInit = null,
    publishingState = readPublishingWorkflow(path.join(repositoryRoot, ".github/workflows/deploy.yml")),
    probeRuntime = probeStagingRuntimeIdentity,
    repositoryIdentityOf = readRepositoryIdentityFromRemote,
    readGithubMain = () => readPinnedGithubMainSha(repositoryRoot),
    observeSource = observeIsolatedArtifactContext,
    projectConfig = () => projectStrictStagingConfiguration({ directory: STAGING_ENV_DIR }),
    bindRecovery = () => bindStagingRecoveryEvidence(),
  } = {},
) {
  let tree;
  let originMainTree;
  try {
    tree = treeOf(candidate.head);
    originMainTree = treeOf(candidate.originMain);
  } catch (error) {
    return {
      probeError: true,
      probeDetail: error instanceof Error ? error.message : "tree probe failed",
    };
  }

  const diagnostic = readDiagnostic();
  const runtime = probeRuntime();
  const repositoryIdentity = repositoryIdentityOf();
  let githubMainMatchesHead = false;
  try {
    const pinned = readGithubMain();
    githubMainMatchesHead = pinned?.ok === true && pinned.sha === candidate.head;
  } catch {
    githubMainMatchesHead = false;
  }

  let sourceObservation = {
    ok: false,
    protectedCheckoutUsed: true,
    isolatedArtifactContextVerified: false,
    artifactContextInsideProtectedRoot: true,
    authoritativeSourceRoot: repositoryRoot,
    inspection: null,
  };
  try {
    sourceObservation = observeSource({
      repositoryRoot,
      sha: candidate.head,
      expectedTree: tree,
      inspect:
        typeof resolveInit === "function"
          ? undefined
          : (dir) =>
              resolveStagingPostgresInitMount(dir, candidate.head, {
                log: () => {},
              }),
    });
  } catch {
    sourceObservation = {
      ...sourceObservation,
      isolatedArtifactContextVerified: false,
      protectedCheckoutUsed: true,
    };
  }

  const initResolution =
    typeof resolveInit === "function"
      ? resolveInit()
      : (sourceObservation.inspection ?? {
          disposition: {
            disposition: POSTGRES_INIT_DISPOSITION.UNKNOWN,
            reasonCode: "POSTGRES_INIT_PROBE_NOT_RUN",
          },
        });

  let projected;
  try {
    projected = projectConfig();
  } catch {
    projected = {
      projectedConfigState: "UNKNOWN",
      projectedConfigValid: false,
      publicOrigin: null,
      paymentIsolation: "UNKNOWN",
      unsafeAdaptersExplicitlyFalse: false,
      bobaBearEnvDrift: null,
      reasons: ["STRICT_STAGING_ENV_UNREADABLE"],
    };
  }
  const secretModesSecure =
    inspectOwnerOnlyDirectory(STAGING_ENV_DIR).ok === true &&
    STAGING_ENV_FILES.every((file) => inspectOwnerOnlyFile(path.join(STAGING_ENV_DIR, file)).ok === true);
  const recovery = bindRecovery();

  return {
    source: {
      repositoryIdentity: repositoryIdentity ?? "UNKNOWN",
      branch: candidate.branch,
      head: candidate.head,
      originMain: candidate.originMain,
      tree,
      originMainTree,
      trackedDirty: candidate.trackedDirty,
      protectedCheckoutUsed: sourceObservation.protectedCheckoutUsed === false ? false : true,
      isolatedArtifactContextVerified: sourceObservation.isolatedArtifactContextVerified === true,
      artifactContextInsideProtectedRoot: sourceObservation.artifactContextInsideProtectedRoot !== false,
      authoritativeSourceRoot: sourceObservation.authoritativeSourceRoot ?? repositoryRoot,
      githubMainMatchesHead,
    },
    publishing: publishingState,
    runtime: {
      evidenceComplete: runtime.evidenceComplete === true,
      identityUnknown: runtime.identityUnknown === true,
      podmanRootless: runtime.podmanRootless === true,
      composeProject: runtime.composeProject,
      postgresContainer: runtime.postgresContainer,
      postgresVolume: runtime.postgresVolume,
      unexpectedTarget: runtime.unexpectedTarget,
    },
    environment: {
      requiredEnvFilesPresent: requiredEnvFilesPresent(),
      projectedConfigValid: projected.projectedConfigValid === true,
      projectedConfigState: projected.projectedConfigState,
      diagnosticProjectionKnown: diagnostic.projectionKnown === true,
      diagnosticEnabled: diagnostic.enabled === true,
      diagnosticConflict: diagnostic.conflict === true || diagnostic.invalid === true,
      bobaBearEnvDrift: projected.bobaBearEnvDrift,
      secretsPrinted: /(?:AUTH_SECRET|KEY_SECRET|WEBHOOK_SECRET|PASSWORD)=/.test(JSON.stringify(projected)),
      secretModesSecure,
      unsafeAdaptersExplicitlyFalse: projected.unsafeAdaptersExplicitlyFalse === true,
      paymentIsolation: projected.paymentIsolation,
      publicOrigin: projected.publicOrigin,
    },
    database: {
      migrationIdentityKnown: false,
      migrationLedgerState: "UNKNOWN",
      baselineCompatibility: "UNKNOWN",
      unexplainedPendingMutation: null,
      authAccountUniquenessKnown: null,
      duplicateAuthAccountGroupCount: null,
    },
    recovery,
    security: {
      imageSecurityEvidenceRequired: true,
      imageSecurityEvidencePresent: false,
      issue409RiskWaived: false,
      sourceImageCorrelated: false,
    },
    capacity: {
      diskSufficient: null,
      memorySufficient: null,
      priorImagesPreserved: null,
      unintendedPostgresReplacement: null,
    },
    postgresInit: {
      disposition: initResolution.disposition?.disposition ?? POSTGRES_INIT_DISPOSITION.UNKNOWN,
      reasonCode: initResolution.disposition?.reasonCode,
    },
  };
}

function verifyPreMutationReadiness(candidate, deps = {}) {
  const {
    evaluate = evaluateStagingDeployPreflight,
    log = console.log,
  } = deps;
  const gather = deps.gather ?? ((c, d) => gatherStagingPreflightEvidence(c, d));
  let evidence;
  try {
    evidence = gather(candidate, deps);
  } catch (error) {
    evidence = {
      probeError: true,
      probeDetail: error instanceof Error ? error.message : "preflight gather failed",
    };
  }
  const decision = evaluate(evidence);
  log(`STAGING_DEPLOY_PREFLIGHT ${decision.outcome}`);
  for (const finding of decision.findings) {
    log(`STAGING_DEPLOY_PREFLIGHT_REASON ${finding.code}${finding.detail ? ` ${finding.detail}` : ""}`);
  }
  if (decision.recoveryProofBinding) {
    log(`STAGING_DEPLOY_PREFLIGHT_RECOVERY_BINDING ${decision.recoveryProofBinding}`);
  }
  if (decision.outcome !== PREFLIGHT_OUTCOME.PASS) {
    log("STAGING_DEPLOY_MUTATION_STARTED NO");
  }
  return { decision, evidence };
}

/**
 * Auditable deploy ordering:
 *   verifyCandidate → verifyPreMutationReadiness → assert PASS → operational effects
 *
 * Injectable for synthetic tests. Never call against real boba-staging from automated tests.
 */
export function runStagingDeploy(candidate, deps = {}) {
  const effects = deps.effects ?? [];
  const record = (name) => {
    effects.push(name);
  };
  const {
    assertPreconditions = assertDeployPreconditions,
    verifyReadiness = verifyPreMutationReadiness,
    stopLegacy = () => {
      record("stopLegacyRuntimeIfNeeded");
      stopLegacyRuntimeIfNeeded();
    },
    materializeTree = materializeExactGitTree,
    ensureEnv = ensureStagingEnvFiles,
    compose = podmanCompose,
    assertImages = assertImageRevisions,
    resolveInitMount = resolveStagingPostgresInitMount,
    materializeInit = materializeStagingPostgresInit,
    ensurePostgres = ensurePersistentPostgres,
    decideBootstrap = decideAndApplyStagingBootstrap,
    upWait = upAndWait,
    smoke = runServiceabilityUatSmoke,
    reportProvenance = reportRunningProvenance,
    removeDir = rmSync,
    log = console.log,
    spawn = spawnIgnoringStdin,
    exit = (code) => process.exit(code),
  } = deps;

  assertPreconditions(candidate);
  record("assertDeployPreconditions");
  const readiness = verifyReadiness(candidate, deps);
  record("verifyPreMutationReadiness");
  try {
    assertPreflightAllowsDeployment(readiness.decision);
  } catch (error) {
    record("preflightBlocked");
    log("STAGING_DEPLOY_MUTATION_STARTED NO");
    throw error;
  }
  record("preflightPass");

  stopLegacy();
  const buildDir = materializeTree(candidate.head);
  record("materializeExactGitTree");
  log(`STAGING_BUILD_DIR ${buildDir}`);
  log(`MERGED_GIT_SHA ${candidate.head}`);
  try {
    ensureEnv(buildDir);
    record("ensureStagingEnvFiles");
    compose(
      buildDir,
      ["build", "app", "migrate", "customer-auth", "workforce-auth", "customer-commerce", "operations"],
      { BOBA_BUILD_SHA: candidate.head, COMPOSE_PROFILES: "tools" },
    );
    record("composeBuild");
    assertImages(candidate.head);
    record("assertImageRevisions");
    const builtImageIds = {};
    for (const [service, image] of Object.entries(BOBA_BUILD_IMAGES)) {
      builtImageIds[service] = podmanInspect(image, "{{.Id}}");
    }
    log("BUILT_IMAGE_CANDIDATE_MATCH YES");

    // Re-resolve init mount after build using candidate archive contents (read-only inspect).
    const initPlan = resolveInitMount(buildDir, candidate.head, deps);
    record("resolveStagingPostgresInitMount");
    if (initPlan.disposition.disposition !== POSTGRES_INIT_DISPOSITION.PRESERVE) {
      throw new Error(
        `PostgreSQL init disposition ${initPlan.disposition.disposition} (${initPlan.disposition.reasonCode}); refusing deployment mutation.`,
      );
    }
    // Materialize only when the preserved path is the candidate SHA dir and assets are absent;
    // never delete/replace an active mount. Compose continues to use the preserved mount path.
    materializeInit(buildDir, candidate.head, {
      activeMountSource: initPlan.disposition.preserveMountSource,
      ...deps,
    });
    record("materializeStagingPostgresInit");
    const ensured = ensurePostgres(buildDir, initPlan, deps);
    record("ensurePersistentPostgres");
    const initDir = ensured.initDir;

    compose(buildDir, ["run", "--rm", "--no-deps", "migrate"], { COMPOSE_PROFILES: "tools" });
    record("migrate");
    decideBootstrap(buildDir);
    record("decideAndApplyStagingBootstrap");
    upWait(buildDir, ["app", "customer-auth", "workforce-auth", "customer-commerce", "operations"], {
      BOBA_POSTGRES_INIT_DIR: initDir,
    });
    record("upAndWait");
    for (const step of [
      { title: "app smoke", command: "node", args: ["scripts/docker/smoke.mjs"] },
      {
        title: "customer-auth smoke",
        command: "node",
        args: [
          "scripts/docker/customer-auth-smoke.mjs",
          "--compose-provider",
          "podman-compose",
          "--compose-project",
          STAGING_PROJECT,
          "--compose-file",
          "compose.yaml",
        ],
      },
    ]) {
      const result = spawn(step.command, step.args, {
        cwd: buildDir,
        env: { ...process.env, DOCKER_HOST: SOCKET, COMPOSE_PROJECT_NAME: STAGING_PROJECT },
      });
      if (result.status !== 0) exit(result.status ?? 1);
    }
    record("smokes");
    smoke();
    record("serviceabilitySmoke");
    if (!reportProvenance(candidate.head, builtImageIds)) {
      throw new Error("Running staging images do not match the merged Git candidate.");
    }
    log(`STAGING_PROJECT ${STAGING_PROJECT}`);
    log(`EXPECTED_GIT_SHA ${candidate.head}`);
    log(`STRICT_STAGING_PUBLIC_ORIGIN ${readiness.evidence?.environment?.publicOrigin ?? "UNCONFIGURED"}`);
    log("LOCAL_PUBLISHED_PORT_PROBE http://127.0.0.1:8080");
    log(`PERSISTENT_DB_VOLUME ${STAGING_PROJECT}_postgres-data`);
    return { ok: true, effects, initDir, readiness };
  } finally {
    removeDir(buildDir, { recursive: true, force: true });
    log("STAGING_BUILD_DIR_REMOVED YES");
  }
}

function deploy(candidate) {
  runStagingDeploy(candidate);
}

if (isCli) {
  const candidate = readCandidate();
  console.log(`STAGING_PROJECT ${STAGING_PROJECT}`);
  console.log(`BRANCH ${candidate.branch}`);
  console.log(`MERGED_GIT_SHA ${candidate.head}`);
  console.log(`CURRENT_MAIN_SHA ${candidate.originMain}`);
  console.log(`ORIGIN_MAIN ${candidate.originMain}`);
  console.log(`WORKING_TREE_FINGERPRINT ${candidate.fingerprint}`);
  console.log(`TRACKED_SOURCE_CLEAN ${candidate.trackedDirty.length === 0 ? "YES" : "NO"}`);
  console.log("STAGING_ARTIFACT_SOURCE EXACT_MERGED_GIT_TREE");
  console.log("EXACT_GIT_TREE_MECHANISM git archive HEAD to isolated temporary build context");
  console.log("LIVE_UNTRACKED_CONTENT_CAN_AFFECT_STAGING_ARTIFACT NO");
  console.log(`PERSISTENT_DB_VOLUME ${STAGING_PROJECT}_postgres-data`);

  if (command === "deploy-dry-run") {
    assertDeployPreconditions(candidate);
    const readiness = verifyPreMutationReadiness(candidate, { quietInitLog: true });
    console.log("DEPLOYMENT DRY RUN ONLY — no image, container, network, volume, or migration was created.");
    console.log("STAGING_DEPLOY_PREFLIGHT_READINESS_ESTABLISHED NO");
    console.log(
      `STAGING_DEPLOY_PREFLIGHT_DECISION ${readiness.decision.outcome} — dry-run does not authorize deployment.`,
    );
    console.log(`Future deployment provenance uses MERGED_GIT_SHA ${candidate.head}.`);
  }

  if (command === "deploy") deploy(candidate);
  if (command === "recover-postgres") recoverPostgres(candidate);
  if (command === "status") reportRunningProvenance(candidate.originMain);
  if (command === "workforce-user-create") createStagingWorkforceUser(process.argv.slice(3));
}

export {
  BOBA_BUILD_IMAGES,
  BOBA_RUNTIME_SERVICES,
  STAGING_RUNTIME_ASSETS_DIR,
  CUSTOMER_COMMERCE_ENV_FILE_PRECEDENCE,
  assertImageRevisions,
  assertRunningProvenance,
  assertLegacyPostgresRecoveryTarget,
  isFullGitSha,
  closedStdinInherit,
  readSecretStdinBuffer,
  zeroSecretBuffer,
  spawnIgnoringStdin,
  spawnWithStdinBuffer,
  runPodmanWithSecretStdin,
  createStagingWorkforceUser,
  discardMismatchedOperatorCandidateTag,
  ensureStagingEnvFiles,
  ensurePersistentPostgres,
  materializeStagingPostgresInit,
  normalizeEnvAssignment,
  decideAndApplyStagingBootstrap,
  classifyStagingBaselineInTooling,
  runLegacySeedBootstrapChain,
  gatherStagingPreflightEvidence,
  verifyPreMutationReadiness,
  resolveStagingPostgresInitMount,
  readStagingDiagnosticEnabled,
  probeStagingRuntimeIdentity,
  readRepositoryIdentityFromRemote,
};
