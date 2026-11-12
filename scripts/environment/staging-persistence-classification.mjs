/**
 * Classifies Founder staging PostgreSQL persistence for first-bootstrap vs
 * ongoing deployment. Fail-closed: UNKNOWN existing data never authorizes
 * creating a replacement volume.
 */
import {
  EXPECTED_STAGING_COMPOSE_PROJECT,
  EXPECTED_STAGING_POSTGRES_VOLUME,
} from "./postgres-init-identity.mjs";

export const STAGING_PERSISTENCE_STATE = Object.freeze({
  NEVER_INITIALIZED: "NEVER_INITIALIZED",
  TEMPORARILY_UNAVAILABLE: "TEMPORARILY_UNAVAILABLE",
  UNKNOWN_EXISTING: "UNKNOWN_EXISTING",
  OWNERSHIP_CONFLICT: "OWNERSHIP_CONFLICT",
  VOLUME_WITHOUT_CONTAINER: "VOLUME_WITHOUT_CONTAINER",
  INITIALIZED_PRESENT: "INITIALIZED_PRESENT",
});

export const STAGING_DEPLOYMENT_PHASE = Object.freeze({
  /** First-time provisioning of an absent, never-initialized staging volume. */
  PHASE_A_INITIAL_PROVISION: "PHASE_A_INITIAL_PROVISION",
  /** Established staging with strong ongoing preflight (identity + recovery). */
  PHASE_B_ESTABLISHED_DEPLOY: "PHASE_B_ESTABLISHED_DEPLOY",
  /** No authorized deployment path until the conflict/unknown is resolved. */
  BLOCKED: "BLOCKED",
});

export const EXPECTED_STAGING_POSTGRES_CONTAINER = `${EXPECTED_STAGING_COMPOSE_PROJECT}_postgres_1`;

/**
 * @param {{
 *   podmanRootless?: boolean | null,
 *   socketPresent?: boolean | null,
 *   containerPresent?: boolean | null,
 *   containerInspectOk?: boolean | null,
 *   composeProject?: string | null,
 *   postgresContainer?: string | null,
 *   volumePresent?: boolean | null,
 *   volumeInspectOk?: boolean | null,
 *   volumeName?: string | null,
 *   volumeSystemIdentity?: string | null,
 *   conflictingNames?: string[] | null,
 * }} observation
 */
export function classifyStagingPersistence(observation = {}) {
  const o = observation ?? {};

  if (o.podmanRootless !== true || o.socketPresent !== true) {
    return {
      state: STAGING_PERSISTENCE_STATE.TEMPORARILY_UNAVAILABLE,
      phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
      mayCreateNewVolume: false,
      detail: "podman rootless runtime temporarily unavailable or unproven",
      volumeSystemIdentity: null,
    };
  }

  const conflicts = Array.isArray(o.conflictingNames)
    ? o.conflictingNames.filter((name) => typeof name === "string" && name.length > 0)
    : [];
  if (conflicts.length > 0) {
    return {
      state: STAGING_PERSISTENCE_STATE.OWNERSHIP_CONFLICT,
      phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
      mayCreateNewVolume: false,
      detail: `conflicting staging names observed: ${conflicts.join(",")}`,
      volumeSystemIdentity: typeof o.volumeSystemIdentity === "string" ? o.volumeSystemIdentity : null,
    };
  }

  const volumePresent = o.volumePresent === true;
  const volumeKnownAbsent = o.volumePresent === false && o.volumeInspectOk === true;
  const containerPresent = o.containerPresent === true;
  const containerKnownAbsent = o.containerPresent === false && o.containerInspectOk === true;

  if (volumePresent && o.volumeInspectOk !== true) {
    return {
      state: STAGING_PERSISTENCE_STATE.UNKNOWN_EXISTING,
      phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
      mayCreateNewVolume: false,
      detail: "staging volume appears present but identity could not be verified",
      volumeSystemIdentity: null,
    };
  }

  if (volumePresent && o.volumeName != null && o.volumeName !== EXPECTED_STAGING_POSTGRES_VOLUME) {
    return {
      state: STAGING_PERSISTENCE_STATE.OWNERSHIP_CONFLICT,
      phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
      mayCreateNewVolume: false,
      detail: "persistent volume name does not match boba-staging_postgres-data",
      volumeSystemIdentity: typeof o.volumeSystemIdentity === "string" ? o.volumeSystemIdentity : null,
    };
  }

  if (containerPresent) {
    if (o.containerInspectOk !== true) {
      return {
        state: STAGING_PERSISTENCE_STATE.UNKNOWN_EXISTING,
        phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
        mayCreateNewVolume: false,
        detail: "postgres container present but inspect incomplete",
        volumeSystemIdentity: typeof o.volumeSystemIdentity === "string" ? o.volumeSystemIdentity : null,
      };
    }
    if (o.composeProject !== EXPECTED_STAGING_COMPOSE_PROJECT) {
      return {
        state: STAGING_PERSISTENCE_STATE.OWNERSHIP_CONFLICT,
        phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
        mayCreateNewVolume: false,
        detail: "postgres container Compose project is not boba-staging",
        volumeSystemIdentity: typeof o.volumeSystemIdentity === "string" ? o.volumeSystemIdentity : null,
      };
    }
    if (!volumePresent) {
      return {
        state: STAGING_PERSISTENCE_STATE.UNKNOWN_EXISTING,
        phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
        mayCreateNewVolume: false,
        detail: "postgres container present without verified expected volume",
        volumeSystemIdentity: null,
      };
    }
    return {
      state: STAGING_PERSISTENCE_STATE.INITIALIZED_PRESENT,
      phase: STAGING_DEPLOYMENT_PHASE.PHASE_B_ESTABLISHED_DEPLOY,
      mayCreateNewVolume: false,
      detail: "established boba-staging postgres identity verified",
      volumeSystemIdentity: typeof o.volumeSystemIdentity === "string" ? o.volumeSystemIdentity : null,
    };
  }

  if (volumePresent && containerKnownAbsent) {
    return {
      state: STAGING_PERSISTENCE_STATE.VOLUME_WITHOUT_CONTAINER,
      phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
      mayCreateNewVolume: false,
      detail:
        "existing staging volume without container requires start/recovery — never first-bootstrap create",
      volumeSystemIdentity: typeof o.volumeSystemIdentity === "string" ? o.volumeSystemIdentity : null,
    };
  }

  if (volumeKnownAbsent && containerKnownAbsent) {
    return {
      state: STAGING_PERSISTENCE_STATE.NEVER_INITIALIZED,
      phase: STAGING_DEPLOYMENT_PHASE.PHASE_A_INITIAL_PROVISION,
      mayCreateNewVolume: true,
      detail: "no boba-staging postgres container or volume — first-provision candidate only",
      volumeSystemIdentity: null,
    };
  }

  return {
    state: STAGING_PERSISTENCE_STATE.UNKNOWN_EXISTING,
    phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
    mayCreateNewVolume: false,
    detail: "persistence observation incomplete; UNKNOWN must not authorize create",
    volumeSystemIdentity: typeof o.volumeSystemIdentity === "string" ? o.volumeSystemIdentity : null,
  };
}

/**
 * Derive the deployment phase gate from a classification result.
 * @param {{ state?: string, phase?: string, mayCreateNewVolume?: boolean }} classification
 * @param {{ initialProvisionAuthorized?: boolean }} [auth]
 */
export function resolveStagingDeploymentPhase(classification, auth = {}) {
  if (!classification || typeof classification !== "object") {
    return {
      phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
      reason: "persistence classification missing",
      mayCreateNewVolume: false,
    };
  }
  if (classification.phase === STAGING_DEPLOYMENT_PHASE.PHASE_B_ESTABLISHED_DEPLOY) {
    return {
      phase: STAGING_DEPLOYMENT_PHASE.PHASE_B_ESTABLISHED_DEPLOY,
      reason: classification.detail ?? "established staging",
      mayCreateNewVolume: false,
    };
  }
  if (classification.phase === STAGING_DEPLOYMENT_PHASE.PHASE_A_INITIAL_PROVISION) {
    if (classification.state !== STAGING_PERSISTENCE_STATE.NEVER_INITIALIZED) {
      return {
        phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
        reason: "Phase A requires positively classified NEVER_INITIALIZED",
        mayCreateNewVolume: false,
      };
    }
    if (classification.mayCreateNewVolume !== true) {
      return {
        phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
        reason: "Phase A create authorization flag missing",
        mayCreateNewVolume: false,
      };
    }
    if (auth.initialProvisionAuthorized !== true) {
      return {
        phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
        reason: "Phase A initial provision requires explicit Founder authorization",
        mayCreateNewVolume: false,
        persistenceAllowsCreate: true,
      };
    }
    return {
      phase: STAGING_DEPLOYMENT_PHASE.PHASE_A_INITIAL_PROVISION,
      reason: classification.detail ?? "authorized first provision",
      mayCreateNewVolume: true,
    };
  }
  return {
    phase: STAGING_DEPLOYMENT_PHASE.BLOCKED,
    reason: classification.detail ?? "persistence blocks deployment",
    mayCreateNewVolume: false,
  };
}
