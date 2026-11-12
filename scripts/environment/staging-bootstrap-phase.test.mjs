import assert from "node:assert/strict";
import { test } from "node:test";

import {
  evaluateStagingDeployPreflight,
  PREFLIGHT_OUTCOME,
  PREFLIGHT_REASON,
  validPreflightEvidence,
} from "./staging-preflight.mjs";
import { STAGING_PERSISTENCE_STATE } from "./staging-persistence-classification.mjs";

function phaseAEvidence(overrides = {}) {
  return validPreflightEvidence({
    persistence: {
      state: STAGING_PERSISTENCE_STATE.NEVER_INITIALIZED,
      mayCreateNewVolume: true,
      detail: "fixture never-initialized",
    },
    initialProvisionAuthorized: true,
    runtime: {
      evidenceComplete: true,
      identityUnknown: false,
      podmanRootless: true,
      composeProject: null,
      postgresContainer: null,
      postgresVolume: null,
      unexpectedTarget: false,
    },
    database: {
      migrationIdentityKnown: false,
      migrationLedgerState: "UNKNOWN",
      baselineCompatibility: "ABSENT_NEVER_INITIALIZED",
      unexplainedPendingMutation: false,
      authAccountUniquenessKnown: true,
      duplicateAuthAccountGroupCount: 0,
    },
    recovery: {
      bindingDesignDependency: true,
      binding: "RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY",
      phaseAPostProvisionCheckpointRequired: true,
      phaseAAllowsEmptySource: true,
      checkpointPresent: false,
      integrityVerified: false,
      restoreProofPresent: false,
      recoveryPointIdentifiable: false,
      rollbackPlanSuitable: false,
      stagingBound: false,
      freshnessOk: false,
      evidenceRecords: [],
    },
    postgresInit: {
      disposition: "BLOCK",
      reasonCode: "POSTGRES_INIT_FIRST_BOOTSTRAP_CANDIDATE",
      imageCompatConflict: false,
    },
    ...overrides,
  });
}

test("Phase A authorized never-initialized fixture can PASS without established runtime", () => {
  const decision = evaluateStagingDeployPreflight(phaseAEvidence());
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.PASS);
  assert.equal(decision.categories.runtime, PREFLIGHT_OUTCOME.PASS);
  assert.equal(decision.categories.database, PREFLIGHT_OUTCOME.PASS);
  assert.equal(decision.categories.recovery, PREFLIGHT_OUTCOME.PASS);
  assert.equal(decision.categories.postgresInit, PREFLIGHT_OUTCOME.PASS);
  assert.match(decision.recoveryProofBinding ?? "", /PHASE_A_EMPTY_SOURCE/);
});

test("Phase A without Founder authorization blocks even when never-initialized", () => {
  const decision = evaluateStagingDeployPreflight(
    phaseAEvidence({ initialProvisionAuthorized: false }),
  );
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(
    decision.findings.some((finding) => finding.code === PREFLIGHT_REASON.INITIAL_PROVISION_UNAUTHORIZED),
  );
});

test("UNKNOWN existing persistence never routes to Phase A PASS", () => {
  const decision = evaluateStagingDeployPreflight(
    phaseAEvidence({
      persistence: {
        state: STAGING_PERSISTENCE_STATE.UNKNOWN_EXISTING,
        mayCreateNewVolume: false,
        detail: "unknown volume",
      },
    }),
  );
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(decision.findings.some((finding) => finding.code === PREFLIGHT_REASON.PERSISTENCE_STATE_UNSAFE));
});

test("volume-without-container cannot be treated as first bootstrap", () => {
  const decision = evaluateStagingDeployPreflight(
    phaseAEvidence({
      persistence: {
        state: STAGING_PERSISTENCE_STATE.VOLUME_WITHOUT_CONTAINER,
        mayCreateNewVolume: false,
        detail: "volume exists",
      },
      initialProvisionAuthorized: true,
    }),
  );
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(decision.findings.some((finding) => finding.code === PREFLIGHT_REASON.PERSISTENCE_STATE_UNSAFE));
});

test("Phase B valid evidence without persistence field remains PASS", () => {
  const decision = evaluateStagingDeployPreflight(validPreflightEvidence());
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.PASS);
});
