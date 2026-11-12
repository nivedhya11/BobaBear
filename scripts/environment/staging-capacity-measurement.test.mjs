import assert from "node:assert/strict";
import { test } from "node:test";

import { STAGING_AUTHORIZED_ENVIRONMENT } from "./staging-founder-authorization.mjs";
import {
  evaluateStagingCapacityMeasurement,
  loadStagingCapacityMeasurement,
  STAGING_CAPACITY_MEASUREMENT_SCHEMA,
} from "./staging-capacity-measurement.mjs";
import { gatherStagingPreflightEvidence } from "./staging.mjs";
import { POSTGRES_INIT_DISPOSITION } from "./postgres-init-identity.mjs";
import { absentImageSecurityEvidence } from "./staging-image-security-evidence.mjs";

function validRecord(overrides = {}) {
  return {
    schemaVersion: STAGING_CAPACITY_MEASUREMENT_SCHEMA,
    attestation: "INDEPENDENT_HOST_MEASUREMENT",
    measuredAt: "2026-11-12T13:00:00.000Z",
    operationClass: "PHASE_A_POSTGRES_PROVISION",
    measurementMethod: "podman-stats-plus-df-observation-window",
    measuredIncrementalBuildFootprintBytes: 2 * 1024 ** 3,
    measuredIncrementalPeakMemoryBytes: 1 * 1024 ** 3,
    authorizedEnvironment: {
      repositoryPath: STAGING_AUTHORIZED_ENVIRONMENT.repositoryPath,
      composeProject: STAGING_AUTHORIZED_ENVIRONMENT.composeProject,
    },
    ...overrides,
  };
}

test("absent capacity measurement keeps footprint and peak null", () => {
  const evaluated = evaluateStagingCapacityMeasurement(null);
  assert.equal(evaluated.valid, false);
  assert.equal(evaluated.measuredIncrementalBuildFootprintBytes, null);
  assert.equal(evaluated.measuredIncrementalPeakMemoryBytes, null);
});

test("valid measurement record exposes footprint and peak", () => {
  const evaluated = evaluateStagingCapacityMeasurement(validRecord(), {
    now: new Date("2026-11-12T13:30:00.000Z"),
  });
  assert.equal(evaluated.valid, true);
  assert.equal(evaluated.measuredIncrementalBuildFootprintBytes, 2 * 1024 ** 3);
  assert.equal(evaluated.measuredIncrementalPeakMemoryBytes, 1 * 1024 ** 3);
});

test("stale measurement is refused", () => {
  const evaluated = evaluateStagingCapacityMeasurement(validRecord(), {
    now: new Date("2026-11-14T13:30:00.000Z"),
  });
  assert.equal(evaluated.valid, false);
  assert.ok(evaluated.reasons.includes("CAPACITY_MEASUREMENT_STALE_OR_FUTURE"));
});

test("loadStagingCapacityMeasurement wires injectable filesystem evidence", () => {
  const loaded = loadStagingCapacityMeasurement({
    measurementPath: "/tmp/synthetic-capacity.json",
    exists: () => true,
    readFile: () => JSON.stringify(validRecord()),
    now: new Date("2026-11-12T13:30:00.000Z"),
  });
  assert.equal(loaded.valid, true);
  assert.equal(loaded.measuredIncrementalPeakMemoryBytes, 1 * 1024 ** 3);
});

test("live gatherer consumes capacity measurement instead of hardcoding null footprint/peak", () => {
  const GIB = 1024 ** 3;
  const evidence = gatherStagingPreflightEvidence(
    {
      branch: "main",
      head: "a".repeat(40),
      originMain: "a".repeat(40),
      trackedDirty: "",
    },
    {
      treeOf: () => "b".repeat(40),
      requiredEnvFilesPresent: () => true,
      readDiagnostic: () => ({
        enabled: false,
        invalid: false,
        conflict: false,
        projectionKnown: true,
      }),
      probeRuntime: () => ({
        evidenceComplete: true,
        identityUnknown: false,
        podmanRootless: true,
        composeProject: null,
        postgresContainer: null,
        postgresVolume: null,
        unexpectedTarget: false,
        containerPresent: false,
        volumePresent: false,
        volumeSystemIdentity: null,
      }),
      repositoryIdentityOf: () => "nivedhya11/BobaBear",
      observeSource: () => ({
        ok: true,
        protectedCheckoutUsed: false,
        isolatedArtifactContextVerified: true,
        artifactContextInsideProtectedRoot: false,
        authoritativeSourceRoot: "/home/ajoshi/repos/boba-bear-platform",
      }),
      readGithubMain: () => ({ ok: true, sha: "a".repeat(40) }),
      projectConfig: () => ({
        projectedConfigState: "VALID",
        projectedConfigValid: true,
        publicOrigin: "https://staging.thebobabear.in",
        paymentIsolation: "TEST",
        unsafeAdaptersExplicitlyFalse: true,
        bobaBearEnvDrift: false,
      }),
      resolveInit: () => ({
        disposition: {
          disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
          reasonCode: "POSTGRES_INIT_FIRST_BOOTSTRAP_CANDIDATE",
        },
        activePostgres: { imageCompatConflict: false },
      }),
      readImageSecurity: () => absentImageSecurityEvidence(),
      loadFounderAuthorization: () => ({
        present: true,
        valid: true,
        initialProvisionAuthorized: true,
        recoveryBindingRecommendedAccepted: false,
        localUatSelected: true,
        pauseXrForCapacity: false,
        reasons: [],
        path: "/tmp/auth.json",
      }),
      loadCapacityMeasurement: () => ({
        present: true,
        valid: true,
        measuredIncrementalBuildFootprintBytes: 2 * GIB,
        measuredIncrementalPeakMemoryBytes: 1 * GIB,
        operationClass: "PHASE_A_POSTGRES_PROVISION",
        reasons: [],
        path: "/tmp/capacity.json",
      }),
      observeImageOwnership: () => ({ ownershipOk: true, evidenceComplete: true, observations: [] }),
      observeProtectedSession: () => ({
        evidenceComplete: true,
        composeProject: null,
        protectedSessionImpact: false,
        xr010ProjectCollision: false,
      }),
    },
  );
  assert.equal(evidence.capacity.measurement.valid, true);
  assert.equal(evidence.capacity.measurement.operationClass, "PHASE_A_POSTGRES_PROVISION");
  // Host MemAvailable/df still gate sufficiency; measurement presence is what this
  // regression locks — null hardcoded footprint/peak must not remain the only path.
  assert.equal(evidence.initialProvisionAuthorized, true);
  assert.ok(Array.isArray(evidence.capacity.reasons));
});
