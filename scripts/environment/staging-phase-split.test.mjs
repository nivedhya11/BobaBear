import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  evaluateCandidateImageTagOwnership,
  readOperatorImageSecurityEvidence,
  resolveImmutableScanTarget,
  STAGING_CANDIDATE_IMAGE_NAMES,
  syntheticBoundImages,
} from "./staging-image-security-evidence.mjs";
import {
  evaluateCandidateBuildEligibility,
  evaluateCandidatePreparationEligibility,
  evaluateStagingDeployPreflight,
  PREFLIGHT_OUTCOME,
  PREFLIGHT_REASON,
  validPreflightEvidence,
} from "./staging-preflight.mjs";
import {
  BOBA_BUILD_IMAGES,
  runStagingPrepareCandidate,
  runStagingPrepareCandidateBuildOnly,
  runStagingScanCandidate,
} from "./staging.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const candidate = {
  branch: "main",
  head: "a".repeat(40),
  originMain: "a".repeat(40),
  trackedDirty: " M scripts/e2e/run-commercial-workspace-e2e.mjs",
  fingerprint: "f".repeat(64),
};

function buildEligibleEvidence(overrides = {}) {
  return validPreflightEvidence({
    source: {
      trackedDirty: candidate.trackedDirty,
      ...(overrides.source ?? {}),
    },
    environment: {
      projectedConfigValid: false,
      projectedConfigState: "INVALID",
      bobaBearEnvDrift: true,
      paymentIsolation: "UNKNOWN",
      unsafeAdaptersExplicitlyFalse: true,
      secretsPrinted: false,
      ...(overrides.environment ?? {}),
    },
    publishing: {
      classification: "NOT_A_REAL_CLASS",
      ...(overrides.publishing ?? {}),
    },
    ...Object.fromEntries(
      Object.entries(overrides).filter(([key]) => !["source", "environment", "publishing"].includes(key)),
    ),
  });
}

test("1. exact SHA/tree with dirty protected checkout can be BUILD_ELIGIBLE", () => {
  const eligibility = evaluateCandidateBuildEligibility(buildEligibleEvidence());
  assert.equal(eligibility.outcome, "BUILD_ELIGIBLE");
  assert.equal(eligibility.deploymentAuthorized, false);
  assert.equal(eligibility.scanAuthorized, false);
  assert.equal(eligibility.categories.source, PREFLIGHT_OUTCOME.PASS);
});

test("2. wrong repository identity blocks build eligibility", () => {
  const eligibility = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({ source: { repositoryIdentity: "nivedhya11/bobabear-platform" } }),
  );
  assert.equal(eligibility.outcome, "BLOCKED");
  assert.ok(eligibility.findings.some((finding) => finding.code === PREFLIGHT_REASON.SOURCE_AUTHORITY_INVALID));
});

test("3. historical alias identity without canonical exact match blocks", () => {
  const eligibility = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({ source: { repositoryIdentity: "nivedhya11/BobaBear-platform" } }),
  );
  assert.equal(eligibility.outcome, "BLOCKED");
});

test("4. remote main drift blocks build eligibility", () => {
  const eligibility = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({ source: { originMain: "c".repeat(40), githubMainMatchesHead: false } }),
  );
  assert.equal(eligibility.outcome, "BLOCKED");
  assert.ok(eligibility.findings.some((finding) => finding.code === PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT));
});

test("5. wrong or unavailable tree blocks build eligibility", () => {
  const wrongTree = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({ source: { tree: "d".repeat(40) } }),
  );
  assert.equal(wrongTree.outcome, "BLOCKED");
  const missingTree = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({ source: { tree: "not-a-sha" } }),
  );
  assert.equal(missingTree.outcome, "BLOCKED");
});

test("6. unverified archive isolation blocks build eligibility", () => {
  const eligibility = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({
      source: { isolatedArtifactContextVerified: false, protectedCheckoutUsed: true },
    }),
  );
  assert.equal(eligibility.outcome, "BLOCKED");
  assert.ok(eligibility.findings.some((finding) => finding.code === PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED));
});

test("7. dirty working-tree evidence remains known but does not alone block build when archive is verified", () => {
  const eligibility = evaluateCandidateBuildEligibility(buildEligibleEvidence());
  assert.equal(eligibility.outcome, "BUILD_ELIGIBLE");
  assert.notEqual(eligibility.categories.source, PREFLIGHT_OUTCOME.BLOCKED);
  // Combined preparation still refuses dirty tracked source.
  assert.equal(evaluateCandidatePreparationEligibility(buildEligibleEvidence()).outcome, "BLOCKED");
});

test("8. existing foreign image tag blocks ownership", () => {
  const ownership = evaluateCandidateImageTagOwnership({
    expectedSha: candidate.head,
    observations: STAGING_CANDIDATE_IMAGE_NAMES.map((name, index) => ({
      name,
      present: index === 0,
      revision: index === 0 ? "f".repeat(40) : null,
    })),
  });
  assert.equal(ownership.ok, false);
  const eligibility = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({
      imageOwnership: {
        evidenceComplete: true,
        observations: STAGING_CANDIDATE_IMAGE_NAMES.map((name, index) => ({
          name,
          present: index === 0,
          revision: index === 0 ? "f".repeat(40) : null,
        })),
      },
    }),
  );
  assert.equal(eligibility.outcome, "BLOCKED");
  assert.ok(eligibility.findings.some((finding) => finding.code === PREFLIGHT_REASON.IMAGE_OWNERSHIP_COLLISION));
});

test("9. missing or unsafe build-time settings block", () => {
  const unknown = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({
      environment: { projectedConfigState: "UNKNOWN", unsafeAdaptersExplicitlyFalse: null },
    }),
  );
  assert.equal(unknown.outcome, "BLOCKED");
  const unsafe = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({
      environment: { unsafeAdaptersExplicitlyFalse: false, secretsPrinted: false },
    }),
  );
  assert.equal(unsafe.outcome, "BLOCKED");
});

test("10. build-only triggers zero scan/deploy effects", async () => {
  const images = syntheticBoundImages();
  const effects = [];
  let scanned = false;
  let evidenceWritten = false;
  const result = await runStagingPrepareCandidateBuildOnly(candidate, {
    effects,
    assertPreconditions: () => {},
    gatherPreparation: () => buildEligibleEvidence(),
    materializeTree: () => "/tmp/boba-staging-build-only-test",
    compose: () => {},
    inspectImage: (name) => images.find((image) => image.name === name),
    inspectRevision: () => candidate.head,
    scanImages: async () => {
      scanned = true;
      return { passed: true, reportSha256: "ab".repeat(32) };
    },
    writeEvidence: () => {
      evidenceWritten = true;
    },
    removeDir: () => {},
    log: () => {},
  });
  assert.equal(result.ok, true);
  assert.equal(result.deploymentAuthorized, false);
  assert.equal(scanned, false);
  assert.equal(evidenceWritten, false);
  assert.deepEqual(effects, [
    "assertBuildPreconditions",
    "materializeCandidateArchive",
    "composeBuildCandidate",
    "candidateArchiveRemoved",
  ]);
  assert.equal(effects.includes("imageSecurityEvidenceWritten"), false);
  assert.equal(effects.includes("scanPreparedImages"), false);
});

test("11. missing image blocks scan-candidate", async () => {
  await assert.rejects(
    () =>
      runStagingScanCandidate(candidate, {
        assertPreconditions: () => {},
        gatherPreparation: () => buildEligibleEvidence(),
        evidenceFile: path.join(mkdtempSync(path.join(os.tmpdir(), "boba-scan-")), "evidence.json"),
        inspectImage: () => null,
        log: () => {},
      }),
    /CANDIDATE_IMAGE_MISSING_OR_UNBOUND/,
  );
});

test("12. wrong image digest or revision blocks scan-candidate", async () => {
  const images = syntheticBoundImages();
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-scan-rev-"));
  try {
    await assert.rejects(
      () =>
        runStagingScanCandidate(candidate, {
          assertPreconditions: () => {},
          gatherPreparation: () => buildEligibleEvidence(),
          evidenceFile: path.join(directory, "evidence.json"),
          inspectImage: (name) => images.find((image) => image.name === name),
          inspectRevision: () => "e".repeat(40),
          log: () => {},
        }),
      /CANDIDATE_IMAGE_REVISION_MISMATCH/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("13. image replacement during verification blocks scan", async () => {
  const images = syntheticBoundImages();
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-scan-drift-"));
  let inspectCount = 0;
  try {
    await assert.rejects(
      () =>
        runStagingScanCandidate(candidate, {
          assertPreconditions: () => {},
          gatherPreparation: () => buildEligibleEvidence(),
          evidenceFile: path.join(directory, "evidence.json"),
          inspectImage: (name) => {
            inspectCount += 1;
            const image = images.find((item) => item.name === name);
            if (inspectCount > STAGING_CANDIDATE_IMAGE_NAMES.length) {
              return { ...image, digest: `sha256:${"e".repeat(64)}` };
            }
            return image;
          },
          inspectRevision: () => candidate.head,
          scanImages: async () => ({ passed: true, reportSha256: "ab".repeat(32) }),
          log: () => {},
        }),
      /IMAGE_IDENTITY_DRIFT|CANDIDATE_IMAGE_REPLACED/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("14. scanner error or blocking vulnerability blocks scan", async () => {
  const images = syntheticBoundImages();
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-scan-fail-"));
  try {
    await assert.rejects(
      () =>
        runStagingScanCandidate(candidate, {
          assertPreconditions: () => {},
          gatherPreparation: () => buildEligibleEvidence(),
          evidenceFile: path.join(directory, "evidence.json"),
          inspectImage: (name) => images.find((image) => image.name === name),
          inspectRevision: () => candidate.head,
          scanImages: async () => ({ passed: false, reportSha256: null, reason: "SCANNER_BLOCKING_OR_ERROR" }),
          log: () => {},
        }),
      /IMAGE_SECURITY_SCAN_FAILED/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("15. fake PASS waiver or bypass cannot establish build eligibility", () => {
  const eligibility = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({ ready: true, bypass: true, waive: true }),
  );
  assert.equal(eligibility.outcome, "BLOCKED");
  assert.equal(eligibility.deploymentAuthorized, false);
});

test("16. missing security evidence keeps deployment BLOCKED", () => {
  const decision = evaluateStagingDeployPreflight(
    validPreflightEvidence({
      security: {
        imageSecurityEvidencePresent: false,
        sourceImageCorrelated: false,
        scanPassed: false,
        boundImages: [],
        observedImages: [],
      },
    }),
  );
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(decision.findings.some((finding) => finding.code === PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING));
});

test("17. valid image evidence without DNS/TLS/recovery remains deployment BLOCKED", () => {
  const decision = evaluateStagingDeployPreflight(
    validPreflightEvidence({
      environment: {
        projectedConfigValid: false,
        projectedConfigState: "INVALID",
      },
      recovery: { bindingDesignDependency: true, checkpointPresent: false },
    }),
  );
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
});

test("18. published marketing site is not staging-publication authorization for deployment", () => {
  const evidence = validPreflightEvidence();
  assert.equal(evaluateCandidatePreparationEligibility(evidence).categories.publishing, PREFLIGHT_OUTCOME.PASS);
  assert.equal(evaluateCandidatePreparationEligibility(evidence).deploymentAuthorized, false);
  // Build eligibility intentionally ignores publishing PASS/FAIL as deployment authority.
  assert.equal(evaluateCandidateBuildEligibility(buildEligibleEvidence()).deploymentAuthorized, false);
});

test("19. XR-010 target collision blocks build and has no mutation path in build-only effects", async () => {
  const blocked = evaluateCandidateBuildEligibility(
    buildEligibleEvidence({
      protectedSession: {
        evidenceComplete: true,
        composeProject: "imp036fe2e_bd1e05aaca95",
        protectedSessionImpact: true,
        xr010ProjectCollision: true,
      },
    }),
  );
  assert.equal(blocked.outcome, "BLOCKED");
  assert.ok(blocked.findings.some((finding) => finding.code === PREFLIGHT_REASON.PROTECTED_SESSION_IMPACT));

  const effects = [];
  await assert.rejects(
    () =>
      runStagingPrepareCandidateBuildOnly(candidate, {
        effects,
        assertPreconditions: () => {},
        gatherPreparation: () =>
          buildEligibleEvidence({
            protectedSession: {
              evidenceComplete: true,
              composeProject: "imp036fe2e_bd1e05aaca95",
              protectedSessionImpact: true,
              xr010ProjectCollision: true,
            },
          }),
        compose: () => {
          effects.push("composeBuildCandidate");
        },
        log: () => {},
      }),
    /CANDIDATE_BUILD_BLOCKED/,
  );
  assert.equal(effects.includes("composeBuildCandidate"), false);
  assert.deepEqual(effects, ["assertBuildPreconditions", "buildBlocked"]);
});

test("20. existing prepare-candidate combined behavior does not silently drop scan evidence write", async () => {
  const images = syntheticBoundImages();
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-prepare-compat-"));
  const evidenceFile = path.join(directory, "image-security.json");
  const effects = [];
  try {
    const prepared = await runStagingPrepareCandidate(candidate, {
      effects,
      assertPreconditions: () => {},
      gatherPreparation: () => validPreflightEvidence(),
      materializeTree: () => "/tmp/boba-staging-prepare-compat",
      compose: () => {},
      inspectImage: (name) => images.find((image) => image.name === name),
      scanImages: async () => ({ passed: true, reportSha256: "ab".repeat(32) }),
      evidenceFile,
      removeDir: () => {},
      log: () => {},
    });
    assert.equal(prepared.ok, true);
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
    assert.equal(loaded.imageSecurityEvidencePresent, true);
    assert.equal(loaded.scanPassed, true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("immutable scan target prefers image id and rejects tag-only records", () => {
  const images = syntheticBoundImages();
  assert.deepEqual(resolveImmutableScanTarget(images[0]), {
    target: images[0].imageId,
    binding: "imageId",
  });
  assert.equal(resolveImmutableScanTarget({ name: images[0].name }), null);
});

test("successful scan-candidate writes staging-image-security-v1 without rebuild effects", async () => {
  const images = syntheticBoundImages();
  const directory = mkdtempSync(path.join(os.tmpdir(), "boba-scan-ok-"));
  const evidenceFile = path.join(directory, "image-security.json");
  const effects = [];
  try {
    const scanned = await runStagingScanCandidate(candidate, {
      effects,
      assertPreconditions: () => {},
      gatherPreparation: () => buildEligibleEvidence(),
      materializeTree: () => {
        throw new Error("must not materialize");
      },
      compose: () => {
        throw new Error("must not compose");
      },
      inspectImage: (name) => images.find((image) => image.name === name),
      inspectRevision: () => candidate.head,
      scanImages: async () => ({ passed: true, reportSha256: "cd".repeat(32) }),
      evidenceFile,
      log: () => {},
    });
    assert.equal(scanned.ok, true);
    assert.equal(scanned.deploymentAuthorized, false);
    assert.deepEqual(effects, [
      "assertBuildPreconditions",
      "candidateImagesBound",
      "scanPreparedImages",
      "imageSecurityEvidenceWritten",
    ]);
    const record = JSON.parse(readFileSync(evidenceFile, "utf8"));
    assert.equal(record.schema, "staging-image-security-v1");
    assert.equal(record.scanPassed, true);
    assert.equal(Object.values(BOBA_BUILD_IMAGES).sort().join(","), record.images.map((image) => image.name).sort().join(","));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("same-SHA owned tags are allowed by ownership policy", () => {
  const ownership = evaluateCandidateImageTagOwnership({
    expectedSha: candidate.head,
    observations: STAGING_CANDIDATE_IMAGE_NAMES.map((name) => ({
      name,
      present: true,
      revision: candidate.head,
    })),
  });
  assert.equal(ownership.ok, true);
});
