/**
 * Configuration-boundary proof for IMP-036J #391B diagnostic keys.
 *
 * Exercises authoritative `loadConfig` (worker) with the diagnostic keys
 * present, then the fail-closed diagnostic enablement resolver. Does not
 * strip keys from the source before validation.
 */
import { describe, expect, it } from "vitest";

import { ConfigurationError } from "../../platform/config/config-error";
import { loadConfig } from "../../platform/config/load-config";
import type { EnvSource } from "../../platform/config/types";
import {
  CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV,
  CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV,
  COMPOSE_PROJECT_NAME_ENV,
  FOUNDER_STAGING_RUNTIME_PROJECT,
  loadCheckoutPrepareDiagnosticConfig,
} from "./checkout-prepare-diagnostic-config";

const STAGING_WORKER_BASE = {
  BOBA_BEAR_ENV: "staging",
  NODE_ENV: "production",
  BOBA_BEAR_PUBLIC_ORIGIN: "https://thebobabear.in",
  BOBA_BEAR_RELEASE: "rel-diagnostic-1",
  BOBA_BEAR_DATABASE_URL:
    "postgresql://app_user:s3cret-pw@db.internal.example.com/boba_bear",
  BOBA_BEAR_DATABASE_SSL_MODE: "verify-full",
} as const;

const PRODUCTION_WORKER_BASE = {
  BOBA_BEAR_ENV: "production",
  NODE_ENV: "production",
  BOBA_BEAR_PUBLIC_ORIGIN: "https://thebobabear.in",
  BOBA_BEAR_RELEASE: "rel-diagnostic-1",
  BOBA_BEAR_DATABASE_URL:
    "postgresql://app_user:s3cret-pw@db.internal.example.com/boba_bear",
  BOBA_BEAR_DATABASE_SSL_MODE: "verify-full",
} as const;

function source(overrides: Record<string, string | undefined>): EnvSource {
  return overrides;
}

describe("checkout prepare diagnostic — loadConfig boundary", () => {
  it("accepts a valid staging worker env with both diagnostic keys (startup succeeds)", () => {
    const env = source({
      ...STAGING_WORKER_BASE,
      [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "true",
      [CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV]:
        FOUNDER_STAGING_RUNTIME_PROJECT,
      [COMPOSE_PROJECT_NAME_ENV]: FOUNDER_STAGING_RUNTIME_PROJECT,
    });

    const workerConfig = loadConfig({ processKind: "worker", source: env });
    expect(workerConfig.environment).toBe("staging");
    expect(workerConfig.processKind).toBe("worker");

    expect(loadCheckoutPrepareDiagnosticConfig(env, workerConfig.environment)).toEqual({
      enabled: true,
    });
  });

  it("disables when the diagnostic enable flag is missing (loadConfig still succeeds)", () => {
    const env = source({
      ...STAGING_WORKER_BASE,
      [CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV]:
        FOUNDER_STAGING_RUNTIME_PROJECT,
      [COMPOSE_PROJECT_NAME_ENV]: FOUNDER_STAGING_RUNTIME_PROJECT,
    });

    const workerConfig = loadConfig({ processKind: "worker", source: env });
    expect(loadCheckoutPrepareDiagnosticConfig(env, workerConfig.environment)).toEqual({
      enabled: false,
    });
  });

  it("disables for wrong Compose project even when BOBA keys claim staging", () => {
    const env = source({
      ...STAGING_WORKER_BASE,
      [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "true",
      [CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV]:
        FOUNDER_STAGING_RUNTIME_PROJECT,
      [COMPOSE_PROJECT_NAME_ENV]: "boba-bear",
    });

    const workerConfig = loadConfig({ processKind: "worker", source: env });
    expect(loadCheckoutPrepareDiagnosticConfig(env, workerConfig.environment)).toEqual({
      enabled: false,
    });
  });

  it("disables in production even when both diagnostic flags and Compose identity are set", () => {
    const env = source({
      ...PRODUCTION_WORKER_BASE,
      [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "true",
      [CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV]:
        FOUNDER_STAGING_RUNTIME_PROJECT,
      [COMPOSE_PROJECT_NAME_ENV]: FOUNDER_STAGING_RUNTIME_PROJECT,
    });

    const workerConfig = loadConfig({ processKind: "worker", source: env });
    expect(workerConfig.environment).toBe("production");
    expect(loadCheckoutPrepareDiagnosticConfig(env, workerConfig.environment)).toEqual({
      enabled: false,
    });
  });

  it("disables for invalid enable flag values without ConfigurationError", () => {
    const env = source({
      ...STAGING_WORKER_BASE,
      [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "TRUE",
      [CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV]:
        FOUNDER_STAGING_RUNTIME_PROJECT,
      [COMPOSE_PROJECT_NAME_ENV]: FOUNDER_STAGING_RUNTIME_PROJECT,
    });

    const workerConfig = loadConfig({ processKind: "worker", source: env });
    expect(loadCheckoutPrepareDiagnosticConfig(env, workerConfig.environment)).toEqual({
      enabled: false,
    });
  });

  it("still rejects unrelated unknown BOBA_BEAR_* variables", () => {
    expect(() =>
      loadConfig({
        processKind: "worker",
        source: source({
          ...STAGING_WORKER_BASE,
          [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "true",
          [CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV]:
            FOUNDER_STAGING_RUNTIME_PROJECT,
          BOBA_BEAR_UNKNOWN_DIAGNOSTIC_PROBE: "1",
        }),
      }),
    ).toThrow(ConfigurationError);

    try {
      loadConfig({
        processKind: "worker",
        source: source({
          ...STAGING_WORKER_BASE,
          BOBA_BEAR_UNKNOWN_DIAGNOSTIC_PROBE: "1",
        }),
      });
      throw new Error("expected ConfigurationError");
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      const issues = (error as ConfigurationError).issues;
      expect(
        issues.some(
          (issue) =>
            issue.key === "BOBA_BEAR_UNKNOWN_DIAGNOSTIC_PROBE" &&
            issue.message === "Unknown BOBA_BEAR_* variable.",
        ),
      ).toBe(true);
    }
  });
});
