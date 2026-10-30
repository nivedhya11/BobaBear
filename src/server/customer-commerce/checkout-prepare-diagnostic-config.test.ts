import { describe, expect, it } from "vitest";

import {
  CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV,
  CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV,
  COMPOSE_PROJECT_NAME_ENV,
  FOUNDER_STAGING_RUNTIME_PROJECT,
  loadCheckoutPrepareDiagnosticConfig,
} from "./checkout-prepare-diagnostic-config";

describe("loadCheckoutPrepareDiagnosticConfig", () => {
  it("defaults disabled with empty env", () => {
    expect(loadCheckoutPrepareDiagnosticConfig({}, "staging")).toEqual({
      enabled: false,
    });
    expect(loadCheckoutPrepareDiagnosticConfig({}, "production")).toEqual({
      enabled: false,
    });
    expect(loadCheckoutPrepareDiagnosticConfig({}, "local")).toEqual({
      enabled: false,
    });
  });

  it("fails closed when only the enable flag is set", () => {
    expect(
      loadCheckoutPrepareDiagnosticConfig(
        { [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "true" },
        "staging",
      ),
    ).toEqual({ enabled: false });
  });

  it("fails closed for production even with both flags and Compose identity", () => {
    expect(
      loadCheckoutPrepareDiagnosticConfig(
        {
          [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "true",
          [CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV]:
            FOUNDER_STAGING_RUNTIME_PROJECT,
          [COMPOSE_PROJECT_NAME_ENV]: FOUNDER_STAGING_RUNTIME_PROJECT,
        },
        "production",
      ),
    ).toEqual({ enabled: false });
  });

  it("fails closed for wrong Compose project identity", () => {
    expect(
      loadCheckoutPrepareDiagnosticConfig(
        {
          [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "true",
          [CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV]:
            FOUNDER_STAGING_RUNTIME_PROJECT,
          [COMPOSE_PROJECT_NAME_ENV]: "boba-bear",
        },
        "staging",
      ),
    ).toEqual({ enabled: false });
  });

  it("fails closed when only the self-asserted BOBA runtime project key is set", () => {
    expect(
      loadCheckoutPrepareDiagnosticConfig(
        {
          [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "true",
          [CHECKOUT_PREPARE_DIAGNOSTIC_RUNTIME_PROJECT_ENV]:
            FOUNDER_STAGING_RUNTIME_PROJECT,
        },
        "staging",
      ),
    ).toEqual({ enabled: false });
  });

  it("fails closed for non-exact enable values", () => {
    expect(
      loadCheckoutPrepareDiagnosticConfig(
        {
          [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "TRUE",
          [COMPOSE_PROJECT_NAME_ENV]: FOUNDER_STAGING_RUNTIME_PROJECT,
        },
        "staging",
      ),
    ).toEqual({ enabled: false });
  });

  it("enables only for staging + exact enable + Compose boba-staging identity", () => {
    expect(
      loadCheckoutPrepareDiagnosticConfig(
        {
          [CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED_ENV]: "true",
          [COMPOSE_PROJECT_NAME_ENV]: FOUNDER_STAGING_RUNTIME_PROJECT,
        },
        "staging",
      ),
    ).toEqual({ enabled: true });
  });
});
