/**
 * Staging recovery-proof binding policy selections.
 *
 * Defaults remain NOT_SELECTED / undecided. Isolated tests may inject a fully
 * selected policy; live code must not invent Founder selections.
 */
import {
  LAYER_1_MAX_AGE_MS_DEFAULT,
  LAYER_2_MAX_AGE_MS_DEFAULT,
  RPO_TARGET_MS_DEFAULT,
} from "../recovery/constants.mjs";
import { PROPOSED_STAGING_RECOVERY_EVIDENCE_ROOT } from "./staging-recovery-checkpoint.mjs";

export const BINDING_SELECTION_STATUS = Object.freeze({
  NOT_SELECTED: "NOT_SELECTED",
  SELECTED: "SELECTED",
});

/**
 * Recommended Founder selections (not live authority until selected).
 */
export const STAGING_RECOVERY_BINDING_RECOMMENDATIONS = Object.freeze({
  evidenceRoot: PROPOSED_STAGING_RECOVERY_EVIDENCE_ROOT,
  freshnessWindow: Object.freeze({
    mode: "REUSE_LOCKED_IMP037_LIMITS",
    layer1MaxAgeMs: LAYER_1_MAX_AGE_MS_DEFAULT,
    layer2MaxAgeMs: LAYER_2_MAX_AGE_MS_DEFAULT,
    rpoTargetMs: RPO_TARGET_MS_DEFAULT,
    extraStagingRestoreProofWindowMs: 0,
  }),
  ledgerStateMapping: Object.freeze({
    mode: "EXACT_JOURNAL_APPLIED_SET_EQUALITY",
    /**
     * When applied ∩ journal equality holds with no unexplained pending rows:
     * - empty applied+journal → FRESH_EMPTY baseline (not a known-safe ledger label)
     * - non-empty equal sets → LEDGER_CURRENT (and APPLIED_CURRENT synonym allowed)
     */
    equalNonEmptyLabel: "LEDGER_CURRENT",
    equalNonEmptySynonym: "APPLIED_CURRENT",
    emptyLabel: "FRESH_EMPTY_BASELINE",
  }),
});

/**
 * Live default policy: nothing Founder-selected.
 * @returns {Readonly<{
 *   evidenceRoot: { status: string, path: string | null },
 *   databaseVolumeIdentity: { status: string, systemIdentity: string | null },
 *   freshnessWindow: { status: string, mode: string | null, limits: object | null },
 *   ledgerStateMapping: { status: string, mode: string | null, mapping: object | null },
 * }>}
 */
export function defaultStagingRecoveryBindingPolicy() {
  return Object.freeze({
    evidenceRoot: Object.freeze({
      status: BINDING_SELECTION_STATUS.NOT_SELECTED,
      path: null,
    }),
    databaseVolumeIdentity: Object.freeze({
      status: BINDING_SELECTION_STATUS.NOT_SELECTED,
      systemIdentity: null,
    }),
    freshnessWindow: Object.freeze({
      status: BINDING_SELECTION_STATUS.NOT_SELECTED,
      mode: null,
      limits: null,
    }),
    ledgerStateMapping: Object.freeze({
      status: BINDING_SELECTION_STATUS.NOT_SELECTED,
      mode: null,
      mapping: null,
    }),
  });
}

/**
 * Build a fully selected policy for isolated tests or post-Founder wiring.
 * Rejects empty identities and non-absolute evidence roots.
 * @param {{
 *   evidenceRootPath: string,
 *   volumeSystemIdentity: string,
 *   freshness?: typeof STAGING_RECOVERY_BINDING_RECOMMENDATIONS.freshnessWindow,
 *   ledgerMapping?: typeof STAGING_RECOVERY_BINDING_RECOMMENDATIONS.ledgerStateMapping,
 * }} input
 */
export function selectStagingRecoveryBindingPolicy(input) {
  if (typeof input?.evidenceRootPath !== "string" || !input.evidenceRootPath.startsWith("/")) {
    throw new Error("evidenceRootPath must be an absolute path");
  }
  if (typeof input?.volumeSystemIdentity !== "string" || input.volumeSystemIdentity.length < 8) {
    throw new Error("volumeSystemIdentity must be a positively observed identity string");
  }
  const freshness = input.freshness ?? STAGING_RECOVERY_BINDING_RECOMMENDATIONS.freshnessWindow;
  const ledgerMapping = input.ledgerMapping ?? STAGING_RECOVERY_BINDING_RECOMMENDATIONS.ledgerStateMapping;
  return Object.freeze({
    evidenceRoot: Object.freeze({
      status: BINDING_SELECTION_STATUS.SELECTED,
      path: input.evidenceRootPath,
    }),
    databaseVolumeIdentity: Object.freeze({
      status: BINDING_SELECTION_STATUS.SELECTED,
      systemIdentity: input.volumeSystemIdentity,
    }),
    freshnessWindow: Object.freeze({
      status: BINDING_SELECTION_STATUS.SELECTED,
      mode: freshness.mode,
      limits: Object.freeze({ ...freshness }),
    }),
    ledgerStateMapping: Object.freeze({
      status: BINDING_SELECTION_STATUS.SELECTED,
      mode: ledgerMapping.mode,
      mapping: Object.freeze({ ...ledgerMapping }),
    }),
  });
}

/**
 * @param {ReturnType<typeof defaultStagingRecoveryBindingPolicy>} policy
 */
export function listUnresolvedRecoveryBindingBlockers(policy) {
  const blockers = [];
  if (policy?.evidenceRoot?.status !== BINDING_SELECTION_STATUS.SELECTED || !policy.evidenceRoot.path) {
    blockers.push("STAGING_EVIDENCE_ROOT_UNNAMED");
  }
  if (
    policy?.databaseVolumeIdentity?.status !== BINDING_SELECTION_STATUS.SELECTED ||
    !policy.databaseVolumeIdentity.systemIdentity
  ) {
    blockers.push("STAGING_DATABASE_VOLUME_IDENTITY_UNBOUND");
  }
  if (policy?.freshnessWindow?.status !== BINDING_SELECTION_STATUS.SELECTED) {
    blockers.push("STAGING_FRESHNESS_WINDOW_UNDECIDED");
  }
  if (policy?.ledgerStateMapping?.status !== BINDING_SELECTION_STATUS.SELECTED) {
    blockers.push("LEDGER_STATE_MAPPING_UNDECIDED");
  }
  return blockers;
}
