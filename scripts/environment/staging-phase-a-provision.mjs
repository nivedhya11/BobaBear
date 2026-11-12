/**
 * Guarded Phase A initial PostgreSQL provision plan.
 *
 * Separates database provisioning from application activation. Execution still
 * requires a valid Founder authorization record, positive NEVER_INITIALIZED
 * classification, and preflight PASS. This module never starts app services.
 */
import {
  POSTGRES_INIT_DISPOSITION,
  POSTGRES_INIT_REASON,
} from "./postgres-init-identity.mjs";
import { STAGING_DEPLOYMENT_PHASE, STAGING_PERSISTENCE_STATE } from "./staging-persistence-classification.mjs";
import { PREFLIGHT_OUTCOME } from "./staging-preflight.mjs";

export const PHASE_A_PROVISION_BLOCKERS = Object.freeze({
  FOUNDER_UNAUTHORIZED: "PHASE_A_FOUNDER_UNAUTHORIZED",
  PERSISTENCE_NOT_NEVER_INITIALIZED: "PHASE_A_PERSISTENCE_NOT_NEVER_INITIALIZED",
  PREFLIGHT_NOT_PASS: "PHASE_A_PREFLIGHT_NOT_PASS",
  IMAGE_COMPAT_UNKNOWN: "PHASE_A_IMAGE_COMPAT_UNKNOWN",
  IMAGE_COMPAT_CONFLICT: "PHASE_A_IMAGE_COMPAT_CONFLICT",
  CAPACITY_INSUFFICIENT: "PHASE_A_CAPACITY_INSUFFICIENT",
  POST_PROVISION_CHECKPOINT_UNDEFINED: "PHASE_A_POST_PROVISION_CHECKPOINT_UNDEFINED",
  APP_ACTIVATION_FORBIDDEN: "PHASE_A_APP_ACTIVATION_FORBIDDEN",
});

/**
 * @param {{
 *   founderAuthorization?: { initialProvisionAuthorized?: boolean, valid?: boolean },
 *   persistence?: { state?: string, mayCreateNewVolume?: boolean },
 *   preflightOutcome?: string,
 *   phase?: string,
 *   postgresInit?: { reasonCode?: string, imageCompatConflict?: boolean | null, disposition?: string },
 *   capacity?: { memorySufficient?: boolean | null, diskSufficient?: boolean | null },
 *   recovery?: { phaseAPostProvisionCheckpointRequired?: boolean, phaseAAllowsEmptySource?: boolean },
 *   activateApplication?: boolean,
 * }} evidence
 */
export function evaluatePhaseAProvisionPlan(evidence = {}) {
  /** @type {string[]} */
  const blockers = [];
  const auth = evidence.founderAuthorization ?? {};
  if (auth.initialProvisionAuthorized !== true || auth.valid === false) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.FOUNDER_UNAUTHORIZED);
  }
  if (evidence.persistence?.state !== STAGING_PERSISTENCE_STATE.NEVER_INITIALIZED) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.PERSISTENCE_NOT_NEVER_INITIALIZED);
  }
  if (evidence.persistence?.mayCreateNewVolume !== true) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.PERSISTENCE_NOT_NEVER_INITIALIZED);
  }
  if (
    evidence.phase != null &&
    evidence.phase !== STAGING_DEPLOYMENT_PHASE.PHASE_A_INITIAL_PROVISION
  ) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.PERSISTENCE_NOT_NEVER_INITIALIZED);
  }
  if (evidence.preflightOutcome !== PREFLIGHT_OUTCOME.PASS) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.PREFLIGHT_NOT_PASS);
  }

  const imageCompat = evidence.postgresInit?.imageCompatConflict;
  if (imageCompat === true) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.IMAGE_COMPAT_CONFLICT);
  } else if (imageCompat !== false) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.IMAGE_COMPAT_UNKNOWN);
  }

  const initOk =
    evidence.postgresInit?.reasonCode === POSTGRES_INIT_REASON.FIRST_BOOTSTRAP_CANDIDATE ||
    evidence.postgresInit?.disposition === POSTGRES_INIT_DISPOSITION.BLOCK;
  if (!initOk && evidence.postgresInit?.reasonCode != null) {
    // PRESERVE means an existing DB — not Phase A create.
    if (evidence.postgresInit?.disposition === POSTGRES_INIT_DISPOSITION.PRESERVE) {
      blockers.push(PHASE_A_PROVISION_BLOCKERS.PERSISTENCE_NOT_NEVER_INITIALIZED);
    }
  }

  if (evidence.capacity?.memorySufficient !== true || evidence.capacity?.diskSufficient !== true) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.CAPACITY_INSUFFICIENT);
  }
  if (
    evidence.recovery?.phaseAPostProvisionCheckpointRequired !== true ||
    evidence.recovery?.phaseAAllowsEmptySource !== true
  ) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.POST_PROVISION_CHECKPOINT_UNDEFINED);
  }
  if (evidence.activateApplication === true) {
    blockers.push(PHASE_A_PROVISION_BLOCKERS.APP_ACTIVATION_FORBIDDEN);
  }

  const unique = [...new Set(blockers)];
  return {
    allowed: unique.length === 0,
    blockers: unique,
    createPostgresOnly: unique.length === 0,
    activateApplication: false,
    postProvisionRequired: [
      "CAPTURE_VOLUME_SYSTEM_IDENTITY",
      "CAPTURE_DATABASE_SYSTEM_IDENTIFIER",
      "RUN_IMP037_RECOVERY_CHECKPOINT",
      "RE_EVALUATE_PHASE_B_PREFLIGHT",
    ],
    transition: unique.length === 0
      ? "PHASE_A_CREATE_THEN_CHECKPOINT_BEFORE_PHASE_B"
      : "PHASE_A_BLOCKED",
  };
}
