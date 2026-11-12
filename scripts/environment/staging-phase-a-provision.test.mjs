import assert from "node:assert/strict";
import { test } from "node:test";

import { POSTGRES_INIT_DISPOSITION, POSTGRES_INIT_REASON } from "./postgres-init-identity.mjs";
import { STAGING_PERSISTENCE_STATE } from "./staging-persistence-classification.mjs";
import { PREFLIGHT_OUTCOME } from "./staging-preflight.mjs";
import {
  evaluatePhaseAProvisionPlan,
  PHASE_A_PROVISION_BLOCKERS,
} from "./staging-phase-a-provision.mjs";

function validPlan(overrides = {}) {
  return evaluatePhaseAProvisionPlan({
    founderAuthorization: { valid: true, initialProvisionAuthorized: true },
    persistence: {
      state: STAGING_PERSISTENCE_STATE.NEVER_INITIALIZED,
      mayCreateNewVolume: true,
    },
    preflightOutcome: PREFLIGHT_OUTCOME.PASS,
    postgresInit: {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: POSTGRES_INIT_REASON.FIRST_BOOTSTRAP_CANDIDATE,
      imageCompatConflict: false,
    },
    capacity: { memorySufficient: true, diskSufficient: true },
    recovery: {
      phaseAPostProvisionCheckpointRequired: true,
      phaseAAllowsEmptySource: true,
    },
    activateApplication: false,
    ...overrides,
  });
}

test("authorized Phase A plan allows postgres-only create with checkpoint sequencing", () => {
  const plan = validPlan();
  assert.equal(plan.allowed, true);
  assert.equal(plan.createPostgresOnly, true);
  assert.equal(plan.activateApplication, false);
  assert.equal(plan.transition, "PHASE_A_CREATE_THEN_CHECKPOINT_BEFORE_PHASE_B");
  assert.ok(plan.postProvisionRequired.includes("RUN_IMP037_RECOVERY_CHECKPOINT"));
});

test("PRESERVE disposition is not Phase A create", () => {
  const plan = validPlan({
    postgresInit: {
      disposition: POSTGRES_INIT_DISPOSITION.PRESERVE,
      reasonCode: "POSTGRES_INIT_PRESERVE",
      imageCompatConflict: false,
    },
  });
  assert.equal(plan.allowed, false);
  assert.ok(plan.blockers.includes(PHASE_A_PROVISION_BLOCKERS.PERSISTENCE_NOT_NEVER_INITIALIZED));
});

test("missing Founder authorization blocks Phase A provision", () => {
  const plan = validPlan({
    founderAuthorization: { valid: false, initialProvisionAuthorized: false },
  });
  assert.equal(plan.allowed, false);
  assert.ok(plan.blockers.includes(PHASE_A_PROVISION_BLOCKERS.FOUNDER_UNAUTHORIZED));
});

test("application activation request is refused by Phase A plan", () => {
  const plan = validPlan({ activateApplication: true });
  assert.equal(plan.allowed, false);
  assert.ok(plan.blockers.includes(PHASE_A_PROVISION_BLOCKERS.APP_ACTIVATION_FORBIDDEN));
});
