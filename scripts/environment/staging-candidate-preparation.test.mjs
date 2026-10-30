import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { POSTGRES_INIT_DISPOSITION } from "./postgres-init-identity.mjs";
import {
  classifyPublishingIsolation,
  probePublishingWorkflow,
} from "./staging-publishing-probe.mjs";
import {
  assertPreflightAllowsDeployment,
  evaluateCandidatePreparationEligibility,
  evaluateStagingDeployPreflight,
  PREFLIGHT_OUTCOME,
  PREFLIGHT_REASON,
  validPreflightEvidence,
} from "./staging-preflight.mjs";
import {
  absentImageSecurityEvidence,
  readOperatorImageSecurityEvidence,
  STAGING_CANDIDATE_IMAGE_NAMES,
  syntheticBoundImages,
} from "./staging-image-security-evidence.mjs";
import { BOBA_BUILD_IMAGES, runStagingDeploy, runStagingPrepareCandidate } from "./staging.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const candidate = {
  branch: "main",
  head: "a".repeat(40),
  originMain: "a".repeat(40),
  trackedDirty: "",
  fingerprint: "f".repeat(64),
};

const ACTIVATION_EFFECTS = [
  "stopLegacyRuntimeIfNeeded",
  "ensureStagingEnvFiles",
  "composeBuild",
  "migrate",
  "ensurePersistentPostgres",
  "upAndWait",
  "preflightPass",
];

function activationDeps(effects, evidence, inspectImage) {
  return {
    effects,
    assertPreconditions: () => {},
    gather: () => evidence,
    inspectImage,
    assertImages: () => {},
    stopLegacy: () => {
      effects.push("stopLegacyRuntimeIfNeeded");
    },
    materializeTree: () => {
      effects.push("materializeExactGitTree");
      return "/tmp/boba-staging-activation-test";
    },
    ensureEnv: () => {
      effects.push("ensureStagingEnvFiles");
    },
    compose: (_dir, args) => {
      if (args[0] === "build") effects.push("composeBuild");
      if (args[0] === "run") effects.push("migrate");
    },
    resolveInitMount: () => ({
      disposition: {
        disposition: POSTGRES_INIT_DISPOSITION.PRESERVE,
        reasonCode: "POSTGRES_INIT_SAME_CONTENT_SAME_PATH",
        preserveMountSource: "/tmp/init",
      },
    }),
    materializeInit: () => {},
    ensurePostgres: () => {
      effects.push("ensurePersistentPostgres");
      return { initDir: "/tmp/init" };
    },
    decideBootstrap: () => {},
    upWait: () => {
      effects.push("upAndWait");
    },
    smoke: () => {},
    reportProvenance: () => true,
    removeDir: () => {},
    log: () => {},
    spawn: () => ({ status: 0 }),
  };
}

test("candidate image names stay aligned with the staging build map", () => {
  assert.deepEqual([...STAGING_CANDIDATE_IMAGE_NAMES].sort(), Object.values(BOBA_BUILD_IMAGES).sort());
});

test("an evidence reader does not inspect images when no outside file is configured", () => {
  let inspected = false;
  const security = readOperatorImageSecurityEvidence({
    evidenceFile: "",
    sourceSha: candidate.head,
    sourceTree: "b".repeat(40),
    repositoryRoot,
    inspectImage: () => {
      inspected = true;
      return null;
    },
  });
  assert.equal(inspected, false);
  assert.deepEqual(security, absentImageSecurityEvidence());
});

test("synthetic evidence traverses preparation then activation without a deadlock", async () => {
  const withoutImage = validPreflightEvidence({
    security: {
      imageSecurityEvidencePresent: false,
      sourceImageCorrelated: false,
      scanPassed: false,
      boundImages: [],
      observedImages: [],
    },
  });
  const eligibility = evaluateCandidatePreparationEligibility(withoutImage);
  assert.equal(eligibility.outcome, "PREPARATION_ELIGIBLE");
  assert.equal(eligibility.deploymentAuthorized, false);
  assert.throws(() => assertPreflightAllowsDeployment(eligibility), /preflight/i);
  assert.equal(evaluateStagingDeployPreflight(withoutImage).outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(
    evaluateStagingDeployPreflight(withoutImage).findings.some(
      (finding) => finding.code === PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING,
    ),
  );

  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-image-evidence-"));
  const evidenceFile = path.join(directory, "image-security.json");
  const images = syntheticBoundImages();
  const effects = [];
  try {
    const prepared = await runStagingPrepareCandidate(candidate, {
      effects,
      assertPreconditions: () => {},
      gatherPreparation: () => validPreflightEvidence(),
      materializeTree: () => "/tmp/boba-staging-prepare-test",
      compose: () => {},
      inspectImage: (name) => images.find((image) => image.name === name),
      scanImages: async () => ({ passed: true, reportSha256: "ab".repeat(32) }),
      evidenceFile,
      removeDir: () => {},
      log: () => {},
    });
    assert.equal(prepared.deploymentAuthorized, false);
    assert.equal(prepared.ok, true);
    for (const name of ACTIVATION_EFFECTS) {
      assert.equal(effects.includes(name), false, name);
    }
    assert.deepEqual(effects, [
      "assertDeployPreconditions",
      "materializeCandidateArchive",
      "composeBuildCandidate",
      "imageSecurityEvidenceWritten",
      "candidateArchiveRemoved",
    ]);
    assert.equal(statSync(evidenceFile).mode & 0o777, 0o600);

    const loaded = readOperatorImageSecurityEvidence({
      evidenceFile,
      sourceSha: candidate.head,
      sourceTree: "b".repeat(40),
      repositoryRoot,
      inspectImage: (name) => images.find((image) => image.name === name),
    });
    const activation = evaluateStagingDeployPreflight(validPreflightEvidence({ security: loaded }));
    assert.equal(activation.outcome, PREFLIGHT_OUTCOME.PASS);

    const mismatched = readOperatorImageSecurityEvidence({
      evidenceFile,
      sourceSha: candidate.head,
      sourceTree: "b".repeat(40),
      repositoryRoot,
      inspectImage: (name) => {
        const image = images.find((item) => item.name === name);
        return { ...image, digest: `sha256:${"e".repeat(64)}` };
      },
    });
    assert.equal(
      evaluateStagingDeployPreflight(validPreflightEvidence({ security: mismatched })).findings.some(
        (finding) => finding.code === PREFLIGHT_REASON.IMAGE_SECURITY_NOT_BOUND,
      ),
      true,
    );

    const staleSha = JSON.parse(readFileSync(evidenceFile, "utf8"));
    staleSha.sourceSha = "c".repeat(40);
    const stale = readOperatorImageSecurityEvidence({
      evidenceFile,
      sourceSha: candidate.head,
      sourceTree: "b".repeat(40),
      repositoryRoot,
      readFile: () => JSON.stringify(staleSha),
      inspectImage: () => {
        throw new Error("stale evidence must not be inspected as this candidate");
      },
    });
    assert.equal(stale.imageSecurityEvidencePresent, false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("preparation refuses the protected checkout and does not build", async () => {
  let built = false;
  await assert.rejects(
    () =>
      runStagingPrepareCandidate(candidate, {
        assertPreconditions: () => {},
        gatherPreparation: () => validPreflightEvidence(),
        evidenceFile: path.join(repositoryRoot, "staging-image-security.json"),
        compose: () => {
          built = true;
        },
        log: () => {},
      }),
    /IMAGE_SECURITY_EVIDENCE_PATH_UNBOUND/,
  );
  assert.equal(built, false);
});

test("verified marketing Pages publishing can satisfy publishing without authorizing activation", async () => {
  const workflow = readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.github/workflows/deploy.yml"),
    "utf8",
  );
  const publishing = classifyPublishingIsolation({
    workflowText: workflow,
    githubWorkflow: {
      observed: true,
      state: "disabled_manually",
      path: ".github/workflows/deploy.yml",
      repositoryIdentity: "nivedhya11/BobaBear",
    },
    pages: {
      observed: true,
      sourceBranch: "gh-pages",
      sourcePath: "/",
      cname: "thebobabear.in",
      status: "built",
      repositoryIdentity: "nivedhya11/BobaBear",
    },
    staging: { observedExposure: false, authorization: null, claimedAuthorized: false },
  });
  const evidence = validPreflightEvidence({ publishing });
  assert.equal(evaluateCandidatePreparationEligibility(evidence).categories.publishing, PREFLIGHT_OUTCOME.PASS);
  assert.equal(evaluateCandidatePreparationEligibility(evidence).deploymentAuthorized, false);
  assert.equal(evaluateStagingDeployPreflight(evidence).categories.publishing, PREFLIGHT_OUTCOME.PASS);
  // File-only observation still fails closed and cannot authorize preparation alone.
  const fileOnly = validPreflightEvidence({ publishing: probePublishingWorkflow(workflow) });
  assert.equal(evaluateCandidatePreparationEligibility(fileOnly).outcome, "BLOCKED");
});

test("wrong candidate SHA or digest blocks activation before runtime mutation", () => {
  const wrongSha = validPreflightEvidence({
    security: { boundSourceSha: "c".repeat(40) },
  });
  assert.ok(
    evaluateStagingDeployPreflight(wrongSha).findings.some(
      (finding) => finding.code === PREFLIGHT_REASON.IMAGE_SECURITY_NOT_BOUND,
    ),
  );

  const images = syntheticBoundImages();
  const effects = [];
  assert.throws(
    () =>
      runStagingDeploy(
        candidate,
        activationDeps(effects, validPreflightEvidence(), (name) => {
          const image = images.find((item) => item.name === name);
          return { ...image, digest: `sha256:${"e".repeat(64)}` };
        }),
      ),
    /digest/,
  );
  assert.equal(effects.includes("preflightPass"), true);
  assert.equal(effects.includes("stopLegacyRuntimeIfNeeded"), false);
  assert.equal(effects.includes("migrate"), false);
  assert.equal(effects.includes("composeBuild"), false);
});

test("bound candidate activation rechecks images before mutation and does not build", () => {
  const images = syntheticBoundImages();
  const effects = [];
  const result = runStagingDeploy(
    candidate,
    activationDeps(effects, validPreflightEvidence(), (name) => images.find((image) => image.name === name)),
  );
  assert.equal(result.ok, true);
  assert.equal(effects.includes("composeBuild"), false);
  assert.ok(effects.indexOf("assertBoundCandidateImages") < effects.indexOf("stopLegacyRuntimeIfNeeded"));
  assert.ok(effects.indexOf("stopLegacyRuntimeIfNeeded") < effects.indexOf("migrate"));
});

test("preparation cannot be turned into activation by an operator flag", () => {
  const evidence = validPreflightEvidence({ ready: true, bypass: true });
  const eligibility = evaluateCandidatePreparationEligibility(evidence);
  assert.equal(eligibility.outcome, "BLOCKED");
  assert.equal(eligibility.deploymentAuthorized, false);
  assert.equal(evaluateStagingDeployPreflight(evidence).outcome, PREFLIGHT_OUTCOME.BLOCKED);
});
