import assert from "node:assert/strict";
import { test } from "node:test";

import {
  classifyStagingPersistence,
  resolveStagingDeploymentPhase,
  STAGING_DEPLOYMENT_PHASE,
  STAGING_PERSISTENCE_STATE,
} from "./staging-persistence-classification.mjs";

test("never-initialized: absent container and volume authorizes Phase A candidate only", () => {
  const classified = classifyStagingPersistence({
    podmanRootless: true,
    socketPresent: true,
    containerPresent: false,
    containerInspectOk: true,
    volumePresent: false,
    volumeInspectOk: true,
  });
  assert.equal(classified.state, STAGING_PERSISTENCE_STATE.NEVER_INITIALIZED);
  assert.equal(classified.phase, STAGING_DEPLOYMENT_PHASE.PHASE_A_INITIAL_PROVISION);
  assert.equal(classified.mayCreateNewVolume, true);

  const unauthorized = resolveStagingDeploymentPhase(classified, { initialProvisionAuthorized: false });
  assert.equal(unauthorized.phase, STAGING_DEPLOYMENT_PHASE.BLOCKED);
  assert.equal(unauthorized.persistenceAllowsCreate, true);

  const authorized = resolveStagingDeploymentPhase(classified, { initialProvisionAuthorized: true });
  assert.equal(authorized.phase, STAGING_DEPLOYMENT_PHASE.PHASE_A_INITIAL_PROVISION);
  assert.equal(authorized.mayCreateNewVolume, true);
});

test("UNKNOWN existing volume never authorizes create", () => {
  const classified = classifyStagingPersistence({
    podmanRootless: true,
    socketPresent: true,
    containerPresent: false,
    containerInspectOk: true,
    volumePresent: true,
    volumeInspectOk: false,
  });
  assert.equal(classified.state, STAGING_PERSISTENCE_STATE.UNKNOWN_EXISTING);
  assert.equal(classified.mayCreateNewVolume, false);
  assert.equal(resolveStagingDeploymentPhase(classified).phase, STAGING_DEPLOYMENT_PHASE.BLOCKED);
});

test("volume without container is not first bootstrap", () => {
  const classified = classifyStagingPersistence({
    podmanRootless: true,
    socketPresent: true,
    containerPresent: false,
    containerInspectOk: true,
    volumePresent: true,
    volumeInspectOk: true,
    volumeName: "boba-staging_postgres-data",
    volumeSystemIdentity: "abc12345identity",
  });
  assert.equal(classified.state, STAGING_PERSISTENCE_STATE.VOLUME_WITHOUT_CONTAINER);
  assert.equal(classified.mayCreateNewVolume, false);
});

test("initialized present selects Phase B", () => {
  const classified = classifyStagingPersistence({
    podmanRootless: true,
    socketPresent: true,
    containerPresent: true,
    containerInspectOk: true,
    composeProject: "boba-staging",
    volumePresent: true,
    volumeInspectOk: true,
    volumeName: "boba-staging_postgres-data",
    volumeSystemIdentity: "abc12345identity",
  });
  assert.equal(classified.state, STAGING_PERSISTENCE_STATE.INITIALIZED_PRESENT);
  assert.equal(classified.phase, STAGING_DEPLOYMENT_PHASE.PHASE_B_ESTABLISHED_DEPLOY);
});

test("ownership conflict and unavailable socket block", () => {
  const conflict = classifyStagingPersistence({
    podmanRootless: true,
    socketPresent: true,
    conflictingNames: ["boba-staging-old"],
  });
  assert.equal(conflict.state, STAGING_PERSISTENCE_STATE.OWNERSHIP_CONFLICT);

  const down = classifyStagingPersistence({
    podmanRootless: true,
    socketPresent: false,
  });
  assert.equal(down.state, STAGING_PERSISTENCE_STATE.TEMPORARILY_UNAVAILABLE);
});
