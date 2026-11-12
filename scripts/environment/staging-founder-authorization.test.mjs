import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildRecommendedRecoveryBindingPolicy,
  evaluateStagingFounderAuthorization,
  loadStagingFounderAuthorization,
  STAGING_AUTHORIZED_ENVIRONMENT,
  STAGING_FOUNDER_AUTHORIZATION_SCHEMA,
} from "./staging-founder-authorization.mjs";

function validRecord(overrides = {}) {
  return {
    schemaVersion: STAGING_FOUNDER_AUTHORIZATION_SCHEMA,
    attestation: "FOUNDER_EXPLICIT_APPROVAL",
    authorizedAt: "2026-11-12T12:00:00.000Z",
    authorizedEnvironment: { ...STAGING_AUTHORIZED_ENVIRONMENT },
    decisions: {
      DECISION_1: "LOCAL_UAT_AD_PF_01",
      DECISION_2: "PHASE_A_CREATE_AUTHORIZED",
      DECISION_3: "RECOVERY_BINDING_ACCEPT_RECOMMENDED",
      DECISION_4: "N/A_LOCAL_UAT",
      DECISION_5: "PAUSE_XR_FOR_CAPACITY",
    },
    ...overrides,
  };
}

test("absent authorization keeps Phase A unauthorized", () => {
  const evaluated = evaluateStagingFounderAuthorization(null);
  assert.equal(evaluated.initialProvisionAuthorized, false);
  assert.equal(evaluated.valid, false);
  assert.ok(evaluated.reasons.includes("FOUNDER_AUTHORIZATION_ABSENT"));
});

test("valid Founder record authorizes Phase A for the exact environment", () => {
  const evaluated = evaluateStagingFounderAuthorization(validRecord());
  assert.equal(evaluated.valid, true);
  assert.equal(evaluated.initialProvisionAuthorized, true);
  assert.equal(evaluated.recoveryBindingRecommendedAccepted, true);
  assert.equal(evaluated.localUatSelected, true);
  assert.equal(evaluated.pauseXrForCapacity, true);
});

test("wrong authorized environment never authorizes Phase A", () => {
  const evaluated = evaluateStagingFounderAuthorization(
    validRecord({
      authorizedEnvironment: {
        ...STAGING_AUTHORIZED_ENVIRONMENT,
        composeProject: "other-project",
      },
    }),
  );
  assert.equal(evaluated.valid, false);
  assert.equal(evaluated.initialProvisionAuthorized, false);
  assert.ok(evaluated.reasons.includes("FOUNDER_AUTHORIZED_ENVIRONMENT_MISMATCH"));
});

test("DECISION_2 defer keeps initial provision unauthorized", () => {
  const evaluated = evaluateStagingFounderAuthorization(
    validRecord({
      decisions: {
        DECISION_1: "LOCAL_UAT_AD_PF_01",
        DECISION_2: "PHASE_A_DEFER",
        DECISION_3: "RECOVERY_BINDING_ACCEPT_RECOMMENDED",
        DECISION_4: "N/A_LOCAL_UAT",
        DECISION_5: "OTHER_FREE_RAM",
      },
    }),
  );
  assert.equal(evaluated.valid, true);
  assert.equal(evaluated.initialProvisionAuthorized, false);
});

test("loadStagingFounderAuthorization reads injectable filesystem", () => {
  const loaded = loadStagingFounderAuthorization({
    authorizationPath: "/tmp/synthetic-founder-auth.json",
    exists: () => true,
    readFile: () => JSON.stringify(validRecord()),
  });
  assert.equal(loaded.initialProvisionAuthorized, true);
  assert.equal(loaded.path, "/tmp/synthetic-founder-auth.json");
});

test("recommended recovery policy requires observed volume identity", () => {
  assert.equal(buildRecommendedRecoveryBindingPolicy({ volumeSystemIdentity: null }), null);
  const policy = buildRecommendedRecoveryBindingPolicy({
    volumeSystemIdentity: "observed-live-volume-identity-001",
  });
  assert.equal(policy?.databaseVolumeIdentity.status, "SELECTED");
  assert.equal(policy?.databaseVolumeIdentity.systemIdentity, "observed-live-volume-identity-001");
  assert.equal(policy?.freshnessWindow.status, "SELECTED");
  assert.equal(policy?.ledgerStateMapping.status, "SELECTED");
});
