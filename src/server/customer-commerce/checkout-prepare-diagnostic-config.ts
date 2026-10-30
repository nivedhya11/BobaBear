/**
 * Default-disabled staging gate for CHECKOUT_REPRICED prepare diagnostics
 * (IMP-036J #391B).
 *
 * Activation requires all of:
 * 1. Validated AppEnvironment === "staging" (not NODE_ENV alone)
 * 2. Explicit enablement flag exactly "true"
 * 3. Runtime Compose project identity exactly matching the Founder staging
 *    project constant `boba-staging`, read from orchestrator-injected
 *    `COMPOSE_PROJECT_NAME` (compose.yaml customer-commerce environment;
 *    staging.mjs sets the host value). Not a self-asserted application env
 *    file string.
 *
 * Missing, mistyped, production, or unverified identity → fail closed (off).
 * This PR does not enable staging; env files are not modified.
 *
 * `BOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT` remains an approved
 * central-config key so a future staging env-file value cannot break
 * `loadConfig`, but it is not the trusted project-identity authority.
 *
 * Bounded volume / access / retention (operational note only — no new infra):
 * - Emits at most one allowlisted info event per CHECKOUT_REPRICED prepare on
 *   the payment-start path while enabled.
 * - Correlation is the existing server-generated requestId only.
 * - Access and retention remain those of the existing customer-commerce
 *   structured logs; do not broaden log sinks for this temporary diagnostic.
 */
import "server-only";

import type { AppEnvironment } from "../../platform/config";

/** Authoritative Founder staging Compose project (scripts/environment/staging.mjs). */
export const FOUNDER_STAGING_RUNTIME_PROJECT = "boba-staging" as const;

/**
 * Orchestrator-injected Compose project name (compose.yaml → customer-commerce
 * `environment.COMPOSE_PROJECT_NAME`). Trusted identity source inside the
 * process; not a BOBA_BEAR_* application secret.
 */
export const COMPOSE_PROJECT_NAME_ENV = "COMPOSE_PROJECT_NAME" as const;

export const CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV =
  "BOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED" as const;

/**
 * Approved central-config key retained for loadConfig compatibility.
 * Not used as the trusted runtime project identity (see
 * {@link COMPOSE_PROJECT_NAME_ENV}).
 */
export const CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV =
  "BOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT" as const;

export type CheckoutPrepareDiagnosticConfig = Readonly<{
  enabled: boolean;
}>;

export type CheckoutPrepareDiagnosticEnvSource = Readonly<
  Record<string, string | undefined>
>;

/**
 * Resolve whether prepare diagnostics may emit. Fail closed unless every
 * staging-identity and enablement condition is exactly satisfied.
 */
export function loadCheckoutPrepareDiagnosticConfig(
  source: CheckoutPrepareDiagnosticEnvSource,
  environment: AppEnvironment,
): CheckoutPrepareDiagnosticConfig {
  const enabledFlag =
    source[CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV] === "true";
  const composeProject = source[COMPOSE_PROJECT_NAME_ENV];
  const stagingIdentityOk =
    environment === "staging" &&
    composeProject === FOUNDER_STAGING_RUNTIME_PROJECT;

  return Object.freeze({
    enabled: enabledFlag && stagingIdentityOk,
  });
}
