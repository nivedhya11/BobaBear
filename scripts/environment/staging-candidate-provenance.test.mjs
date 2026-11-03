import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertOperationalStagingSecretUnread,
  evaluateCommittedComposeBuildIsolation,
  evaluateCommittedDockerfileBuildIsolation,
} from "./staging-build-inputs.mjs";
import { gitBlobSha1 } from "./staging-scan-policy.mjs";
import { PROTECTED_PRIMARY_REPOSITORY } from "./staging-source-isolation.mjs";
import { STAGING_CANDIDATE_IMAGE_NAMES, syntheticBoundImages } from "./staging-image-security-evidence.mjs";
import {
  gatherStagingBuildOnlyEvidence,
  runStagingPrepareCandidateBuildOnly,
  runStagingScanCandidate,
} from "./staging.mjs";
import {
  PRODUCTION_IMAGE_TARGETS,
  TRIVY_SHA256,
  TRIVY_VERSION,
  enforceTrivyExceptionPolicy,
  materializeIgnorefileForImage,
  parseTrivyExceptionRegister,
  parseTrivyIgnoreFile,
  trivyImageArgs,
  utcTodayIso,
} from "../run-trivy.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const candidate = {
  branch: "main",
  head: "a".repeat(40),
  originMain: "a".repeat(40),
  trackedDirty: " M scripts/e2e/run-commercial-workspace-e2e.mjs",
  fingerprint: "f".repeat(64),
};

const REGISTER_HEADER = [
  "## Container / Trivy exceptions",
  "",
  "| id | finding_id | image | severity | owner | rationale | authority | compensating_controls | retest_date | expiry |",
  "|---|---|---|---|---|---|---|---|---|---|",
].join("\n");

function scannerFixture() {
  return [
    `export const TRIVY_VERSION = "${TRIVY_VERSION}";`,
    `export const TRIVY_SHA256 = "${TRIVY_SHA256}";`,
    "--severity",
    "CRITICAL,HIGH",
    "--ignore-unfixed",
    "--image-config-scanners",
    "misconfig",
    "--exit-code",
    "--ignorefile",
    "",
  ].join("\n");
}

function policyFiles({ ignore = "# no active container exceptions\n", register = `${REGISTER_HEADER}\n` } = {}) {
  return {
    ".trivyignore": ignore,
    "docs/platform/security/vulnerability-exception-register.md": register,
    "scripts/run-trivy.mjs": scannerFixture(),
  };
}

function readersFor(files, worktreeFiles = files) {
  const committed = Object.fromEntries(Object.entries(files).map(([rel, text]) => [rel, gitBlobSha1(text)]));
  const worktree = Object.fromEntries(
    Object.entries(worktreeFiles).map(([rel, text]) => [rel, gitBlobSha1(text)]),
  );
  const seen = [];
  return {
    seen,
    readCommittedBlob: (_sha, rel) => {
      seen.push(rel);
      return committed[rel];
    },
    readWorktreeBlob: (rel) => worktree[rel],
    readCommittedText: (_sha, rel) => files[rel],
  };
}

function trivyDouble(scanImage) {
  return {
    TRIVY_VERSION,
    TRIVY_SHA256,
    PRODUCTION_IMAGE_TARGETS,
    trivyImageArgs,
    utcTodayIso,
    parseTrivyExceptionRegister,
    parseTrivyIgnoreFile,
    enforceTrivyExceptionPolicy,
    materializeIgnorefileForImage,
    scanImage,
    ensureBinary: async () => {
      throw new Error("HOST_TRIVY_BINARY_FORBIDDEN");
    },
  };
}

function composeFixture(extraBuild = "") {
  const services = ["app", "migrate", "customer-auth", "workforce-auth", "customer-commerce", "operations"];
  return services
    .map(
      (service) => `  ${service}:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        BOBA_BUILD_SHA: "\${BOBA_BUILD_SHA:-unversioned-local}"
${service === "app" ? extraBuild : ""}    image: boba-bear-${service}:local
    env_file:
      - .env.runtime.docker.local
`,
    )
    .join("\n");
}

function passingBuildDeps(overrides = {}) {
  const reads = [];
  return {
    reads,
    deps: {
      assertPreconditions: () => {},
      treeOf: () => "b".repeat(40),
      repositoryIdentityOf: () => "nivedhya11/BobaBear",
      readGithubMain: () => ({ ok: true, sha: candidate.head }),
      observeSource: () => ({
        protectedCheckoutUsed: false,
        isolatedArtifactContextVerified: true,
        artifactContextInsideProtectedRoot: false,
        authoritativeSourceRoot: PROTECTED_PRIMARY_REPOSITORY,
      }),
      observeImageOwnership: () => ({
        evidenceComplete: true,
        observations: STAGING_CANDIDATE_IMAGE_NAMES.map((name) => ({ name, present: false, revision: null })),
        ownershipOk: true,
      }),
      observeProtectedSession: () => ({
        evidenceComplete: true,
        composeProject: "boba-staging",
        protectedSessionImpact: false,
        xr010ProjectCollision: false,
      }),
      readCommittedText: (_sha, rel) => {
        reads.push(rel);
        if (String(rel).includes(".env.staging")) throw new Error("BUILD_ONLY_STAGING_SECRET_READ_REFUSED");
        if (rel === "compose.yaml") return overrides.composeText ?? composeFixture();
        if (rel === "Dockerfile") return overrides.dockerfileText ?? "FROM scratch\nARG BOBA_BUILD_SHA\n";
        throw new Error(`unexpected committed read ${rel}`);
      },
      readPublicBuildEnv: () => {
        reads.push(".env");
        return { NEXT_PUBLIC_BOBA_BEAR_GOOGLE_MAPS_BROWSER_KEY: "SENTINEL_PUBLIC_KEY_VALUE" };
      },
      readDiagnostic: () => {
        throw new Error("READ_DIAGNOSTIC");
      },
      projectConfig: () => {
        throw new Error("PROJECT_CONFIG");
      },
      materializeTree: () => "/tmp/boba-staging-build-only-provenance",
      compose: () => {},
      inspectImage: (name) => syntheticBoundImages().find((image) => image.name === name),
      inspectRevision: () => candidate.head,
      removeDir: () => {},
      log: () => {},
      ...overrides.deps,
    },
  };
}

test("dirty .trivyignore cannot affect the bound candidate scan", async () => {
  const clean = policyFiles();
  const dirtyIgnore = "CVE-2099-0001 exp:2099-01-01\n";
  const bound = readersFor(clean, { ...clean, ".trivyignore": dirtyIgnore });
  let scanned = 0;
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-dirty-ignore-"));
  try {
    await assert.rejects(
      () =>
        runStagingScanCandidate(candidate, {
          assertPreconditions: () => {},
          gatherPreparation: () => ({
            source: {
              repositoryIdentity: "nivedhya11/BobaBear",
              branch: "main",
              head: candidate.head,
              originMain: candidate.head,
              tree: "b".repeat(40),
              originMainTree: "b".repeat(40),
              trackedDirty: candidate.trackedDirty,
              protectedCheckoutUsed: false,
              isolatedArtifactContextVerified: true,
              artifactContextInsideProtectedRoot: false,
              authoritativeSourceRoot: PROTECTED_PRIMARY_REPOSITORY,
              githubMainMatchesHead: true,
            },
            environment: {
              projectedConfigState: "BUILD_INPUTS_VALIDATED",
              unsafeAdaptersExplicitlyFalse: true,
              secretsPrinted: false,
            },
            imageOwnership: {
              evidenceComplete: true,
              observations: STAGING_CANDIDATE_IMAGE_NAMES.map((name) => ({ name, present: false, revision: null })),
            },
            protectedSession: {
              evidenceComplete: true,
              composeProject: "boba-staging",
              protectedSessionImpact: false,
              xr010ProjectCollision: false,
            },
          }),
          evidenceFile: path.join(directory, "evidence.json"),
          inspectImage: (name) => syntheticBoundImages().find((image) => image.name === name),
          inspectRevision: () => candidate.head,
          trivyModule: trivyDouble(() => {
            scanned += 1;
            return { status: 0, findings: [], errors: [] };
          }),
          bin: "trivy-test",
          ...bound,
          log: () => {},
        }),
      /SCAN_POLICY_INPUT_DIVERGENCE/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  assert.equal(scanned, 0);
  assert.equal(bound.seen.includes("scripts/e2e/run-commercial-workspace-e2e.mjs"), false);
});

test("dirty scanner code cannot change the approved scan policy", async () => {
  const clean = policyFiles();
  const bound = readersFor(clean, { ...clean, "scripts/run-trivy.mjs": `${clean["scripts/run-trivy.mjs"]}--skip\n` });
  let scanned = 0;
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-dirty-scanner-"));
  try {
    await assert.rejects(
      () =>
        runStagingScanCandidate(
          { ...candidate, head: "c".repeat(40), originMain: "c".repeat(40) },
          {
            assertPreconditions: () => {},
            gatherPreparation: () => passingEligibility(),
            evidenceFile: path.join(directory, "evidence.json"),
            inspectImage: (name) => syntheticBoundImages().find((image) => image.name === name),
            inspectRevision: () => "c".repeat(40),
            trivyModule: trivyDouble(() => {
              scanned += 1;
              return { status: 0, findings: [], errors: [] };
            }),
            bin: "trivy-test",
            ...bound,
            log: () => {},
          },
        ),
      /SCAN_POLICY_INPUT_DIVERGENCE/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  assert.equal(scanned, 0);
});

test("unregistered, expired, and cross-image ignores are blocked without a global ignorefile", async () => {
  const unregistered = policyFiles({ ignore: "CVE-2099-9999 exp:2026-12-31\n" });
  await expectPolicyReject(unregistered, /EXCEPTION_POLICY_REJECTED/);

  const expiredRegister = `${REGISTER_HEADER}\n| VEX-TRIVY-TEST | CVE-2099-0001 | web-runtime | high | platform-security | fixture | fixture-authority | fixture-control | 2020-01-01 | 2020-01-01 |\n`;
  const expired = policyFiles({
    ignore: "CVE-2099-0001 exp:2020-01-01\n",
    register: expiredRegister,
  });
  await expectPolicyReject(expired, /EXCEPTION_POLICY_REJECTED/);

  const activeRegister = `${REGISTER_HEADER}\n| VEX-TRIVY-TEST | CVE-2099-0001 | web-runtime | high | platform-security | fixture | fixture-authority | fixture-control | 2026-12-01 | 2026-12-31 |\n`;
  const scoped = policyFiles({
    ignore: "CVE-2099-0001 exp:2026-12-31\n",
    register: activeRegister,
  });
  const calls = [];
  const evidence = await scanWithPolicy(scoped, calls);
  assert.equal(evidence.scanPolicy.scannerVersion, TRIVY_VERSION);
  assert.equal(calls.length, STAGING_CANDIDATE_IMAGE_NAMES.length);
  const byScope = Object.fromEntries(
    calls.map((call) => [call.scopeName, call.body]),
  );
  assert.match(byScope["boba-bear-app:local"], /^CVE-2099-0001$/m);
  assert.doesNotMatch(byScope["boba-bear-operations:local"], /^CVE-2099-0001$/m);
  assert.doesNotMatch(byScope["boba-bear-tooling:local"], /^CVE-2099-0001$/m);
  assert.equal(
    calls.some((call) => path.basename(call.ignorefile) === ".trivyignore"),
    false,
  );
});

test("correct committed scanner policy remains usable and records its blob binding", async () => {
  const calls = [];
  const evidence = await scanWithPolicy(policyFiles(), calls);
  assert.equal(calls.length, STAGING_CANDIDATE_IMAGE_NAMES.length);
  assert.deepEqual(
    evidence.scanPolicy.inputs.map((input) => input.path),
    [".trivyignore", "docs/platform/security/vulnerability-exception-register.md", "scripts/run-trivy.mjs"],
  );
  assert.equal(evidence.scanPolicy.scannerVersion, TRIVY_VERSION);
  assert.equal(evidence.scanPolicy.scannerSha256, TRIVY_SHA256);
  for (const call of calls) {
    assert.equal(path.basename(call.ignorefile) === ".trivyignore", false);
    assert.doesNotMatch(call.body, /^[A-Z0-9]/m);
  }
});

test("clean candidate git objects bind the scan and a dirty ignore file does not", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-scan-git-"));
  try {
    execFileSync("git", ["init"], { cwd: directory });
    execFileSync("git", ["config", "user.email", "scan-policy@example.com"], { cwd: directory });
    execFileSync("git", ["config", "user.name", "scan-policy"], { cwd: directory });
    for (const rel of [
      ".trivyignore",
      "docs/platform/security/vulnerability-exception-register.md",
      "scripts/run-trivy.mjs",
    ]) {
      const destination = path.join(directory, rel);
      mkdirSync(path.dirname(destination), { recursive: true });
      cpSync(path.join(repositoryRoot, rel), destination);
    }
    execFileSync("git", ["add", "."], { cwd: directory });
    execFileSync("git", ["commit", "-m", "policy"], { cwd: directory });
    const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: directory, encoding: "utf8" }).trim();
    const calls = [];
    const evidenceDirectory = mkdtempSync(path.join(os.tmpdir(), "boba-scan-git-evidence-"));
    try {
      const passed = await runStagingScanCandidate(gitCandidate(sha), {
        ...scanDeps(calls, evidenceDirectory),
        repositoryRoot: directory,
        inspectRevision: () => sha,
      });
      assert.equal(passed.ok, true);
      assert.equal(calls.length, STAGING_CANDIDATE_IMAGE_NAMES.length);
    } finally {
      rmSync(evidenceDirectory, { recursive: true, force: true });
    }

    writeFileSync(path.join(directory, ".trivyignore"), "CVE-2099-0001 exp:2099-01-01\n");
    const blockedCalls = [];
    const blockedEvidence = mkdtempSync(path.join(os.tmpdir(), "boba-scan-git-blocked-"));
    try {
      await assert.rejects(
        () =>
          runStagingScanCandidate(gitCandidate(sha), {
            ...scanDeps(blockedCalls, blockedEvidence),
            repositoryRoot: directory,
            inspectRevision: () => sha,
          }),
        /SCAN_POLICY_INPUT_DIVERGENCE/,
      );
    } finally {
      rmSync(blockedEvidence, { recursive: true, force: true });
    }
    assert.equal(blockedCalls.length, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("bound scan refuses image digest replacement before writing PASS evidence", async () => {
  const images = syntheticBoundImages();
  const calls = [];
  const seen = new Map();
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-bound-drift-"));
  try {
    await assert.rejects(
      () =>
        runStagingScanCandidate(candidate, {
          assertPreconditions: () => {},
          gatherPreparation: () => passingEligibility(),
          evidenceFile: path.join(directory, "evidence.json"),
          inspectImage: (name) => {
            const image = images.find((item) => item.name === name);
            const count = (seen.get(name) ?? 0) + 1;
            seen.set(name, count);
            if (count > 2) return { ...image, digest: `sha256:${"e".repeat(64)}` };
            return image;
          },
          inspectRevision: () => candidate.head,
          todayIso: "2026-11-03",
          trivyModule: trivyDouble((scanOptions) => {
            calls.push(scanOptions.image);
            return { status: 0, findings: [], errors: [] };
          }),
          bin: "trivy-test",
          ...readersFor(policyFiles()),
          log: () => {},
        }),
      /IMAGE_IDENTITY_DRIFT_DURING_SCAN/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  assert.equal(calls.length, 1);
});

test("build-only evidence does not read private staging env files", async () => {
  const { reads, deps } = passingBuildDeps();
  const evidence = gatherStagingBuildOnlyEvidence(candidate, deps);
  assert.equal(evidence.environment.stagingSecretFilesRead, false);
  assert.equal(evidence.environment.secretsPrinted, false);
  assert.equal(JSON.stringify(evidence).includes("SENTINEL_PUBLIC_KEY_VALUE"), false);
  assert.equal(JSON.stringify(evidence).includes(".env.staging"), false);
  assert.deepEqual(reads, ["compose.yaml", "Dockerfile", ".env"]);
  const built = await runStagingPrepareCandidateBuildOnly(candidate, deps);
  assert.equal(built.scanAuthorized, false);
  assert.equal(built.effects.includes("scanPreparedImages"), false);
});

test("build-only fails closed when committed compose build would consume a private env file", async () => {
  let composed = false;
  const { deps } = passingBuildDeps({
    composeText: composeFixture("      env_file:\n        - .env.staging/.env.runtime.docker.local\n"),
    deps: {
      compose: () => {
        composed = true;
      },
    },
  });
  await assert.rejects(() => runStagingPrepareCandidateBuildOnly(candidate, deps), /CANDIDATE_BUILD_BLOCKED/);
  assert.equal(composed, false);
});

test("committed compose and Dockerfile build inputs do not consume staging secret files", () => {
  const compose = readFileSync(path.join(repositoryRoot, "compose.yaml"), "utf8");
  const dockerfile = readFileSync(path.join(repositoryRoot, "Dockerfile"), "utf8");
  const composeIsolation = evaluateCommittedComposeBuildIsolation(compose);
  const dockerfileIsolation = evaluateCommittedDockerfileBuildIsolation(dockerfile);
  assert.equal(composeIsolation.ok, true);
  assert.equal(composeIsolation.serviceEnvFileConsumedByBuild, false);
  assert.equal(composeIsolation.unsafeAdapterArgsAbsent, true);
  assert.equal(dockerfileIsolation.ok, true);
  assert.match(compose, /env_file:/);
  assert.throws(
    () => assertOperationalStagingSecretUnread(path.join(repositoryRoot, ".env.staging", ".env.runtime.docker.local"), repositoryRoot),
    /BUILD_ONLY_STAGING_SECRET_READ_REFUSED/,
  );
  assert.doesNotThrow(() => assertOperationalStagingSecretUnread(path.join(repositoryRoot, ".env"), repositoryRoot));
});

test("build directory inside the checkout or staging secret directory is refused before compose", async () => {
  let composed = false;
  const { deps } = passingBuildDeps({
    deps: {
      materializeTree: () => path.join(repositoryRoot, ".env.staging"),
      compose: () => {
        composed = true;
      },
    },
  });
  await assert.rejects(
    () => runStagingPrepareCandidateBuildOnly(candidate, deps),
    /BUILD_DIRECTORY_SECRET_OR_CHECKOUT_SCOPE/,
  );
  assert.equal(composed, false);
});

test("phase split keeps scan, build, deploy, and combined preparation boundaries", () => {
  const source = readFileSync(path.join(repositoryRoot, "scripts/environment/staging.mjs"), "utf8");
  const buildStart = source.indexOf("export async function runStagingPrepareCandidateBuildOnly");
  const scanStart = source.indexOf("export async function runStagingScanCandidate");
  const prepareStart = source.indexOf("export async function runStagingPrepareCandidate");
  const deployStart = source.indexOf("export function runStagingDeploy");
  const buildSlice = source.slice(buildStart, scanStart);
  const scanSlice = source.slice(scanStart, source.indexOf("function deploy("));
  const prepareSlice = source.slice(prepareStart, buildStart);
  assert.doesNotMatch(buildSlice, /scanPreparedImagesWithTrivy|projectStrictStagingConfiguration|readStagingDiagnosticEnabled/);
  assert.match(buildSlice, /gatherStagingBuildOnlyEvidence/);
  assert.match(scanSlice, /SCAN_CANDIDATE_MUST_NOT_COMPOSE_BUILD/);
  assert.match(scanSlice, /SCAN_CANDIDATE_MUST_NOT_MATERIALIZE_ARCHIVE/);
  assert.match(prepareSlice, /gatherStagingPreflightEvidence/);
  assert.match(source.slice(deployStart, prepareStart), /assertPreflightAllowsDeployment\(readiness\.decision\)/);
  assert.match(source, /projectConfig = \(\) => projectStrictStagingConfiguration/);
  assert.match(source, /readDiagnostic = readStagingDiagnosticEnabled/);
  assert.equal(source.includes('ignorefile: path.join(repositoryRoot, ".trivyignore")'), false);
});

function passingEligibility() {
  return {
    source: {
      repositoryIdentity: "nivedhya11/BobaBear",
      branch: "main",
      head: candidate.head,
      originMain: candidate.head,
      tree: "b".repeat(40),
      originMainTree: "b".repeat(40),
      trackedDirty: candidate.trackedDirty,
      protectedCheckoutUsed: false,
      isolatedArtifactContextVerified: true,
      artifactContextInsideProtectedRoot: false,
      authoritativeSourceRoot: PROTECTED_PRIMARY_REPOSITORY,
      githubMainMatchesHead: true,
    },
    environment: {
      projectedConfigState: "BUILD_INPUTS_VALIDATED",
      unsafeAdaptersExplicitlyFalse: true,
      secretsPrinted: false,
    },
    imageOwnership: {
      evidenceComplete: true,
      observations: STAGING_CANDIDATE_IMAGE_NAMES.map((name) => ({ name, present: false, revision: null })),
    },
    protectedSession: {
      evidenceComplete: true,
      composeProject: "boba-staging",
      protectedSessionImpact: false,
      xr010ProjectCollision: false,
    },
  };
}

function gitCandidate(sha) {
  return { ...candidate, head: sha, originMain: sha };
}

function scanDeps(calls, evidenceDirectory) {
  return {
    assertPreconditions: () => {},
    gatherPreparation: () => passingEligibility(),
    evidenceFile: path.join(evidenceDirectory, "evidence.json"),
    inspectImage: (name) => syntheticBoundImages().find((image) => image.name === name),
    inspectRevision: (name) => {
      const active = calls.candidateSha;
      return typeof active === "string" ? active : candidate.head;
    },
    trivyModule: trivyDouble((scanOptions) => {
      calls.push({
        image: scanOptions.image,
        ignorefile: scanOptions.ignorefile,
        body: readFileSync(scanOptions.ignorefile, "utf8"),
        scopeName: null,
      });
      return { status: 0, findings: [], errors: [] };
    }),
    bin: "trivy-test",
    log: () => {},
  };
}

async function scanWithPolicy(files, calls) {
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-bound-policy-"));
  const bound = readersFor(files);
  const images = syntheticBoundImages();
  try {
    const result = await runStagingScanCandidate(candidate, {
      assertPreconditions: () => {},
      gatherPreparation: () => passingEligibility(),
      evidenceFile: path.join(directory, "evidence.json"),
      inspectImage: (name) => images.find((image) => image.name === name),
      inspectRevision: () => candidate.head,
      todayIso: "2026-11-03",
      trivyModule: trivyDouble((scanOptions) => {
        const match = images.find((image) => image.imageId === scanOptions.image);
        calls.push({
          image: scanOptions.image,
          ignorefile: scanOptions.ignorefile,
          body: readFileSync(scanOptions.ignorefile, "utf8"),
          scopeName: match?.name ?? null,
        });
        return { status: 0, findings: [], errors: [] };
      }),
      bin: "trivy-test",
      ...bound,
      log: () => {},
    });
    assert.equal(result.ok, true);
    return JSON.parse(readFileSync(path.join(directory, "evidence.json"), "utf8"));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

async function expectPolicyReject(files, pattern) {
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-policy-reject-"));
  let scanned = 0;
  try {
    await assert.rejects(
      () =>
        runStagingScanCandidate(candidate, {
          assertPreconditions: () => {},
          gatherPreparation: () => passingEligibility(),
          evidenceFile: path.join(directory, "evidence.json"),
          inspectImage: (name) => syntheticBoundImages().find((image) => image.name === name),
          inspectRevision: () => candidate.head,
          todayIso: "2026-11-03",
          trivyModule: trivyDouble(() => {
            scanned += 1;
            return { status: 0, findings: [], errors: [] };
          }),
          bin: "trivy-test",
          ...readersFor(files),
          log: () => {},
        }),
      pattern,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  assert.equal(scanned, 0);
}
