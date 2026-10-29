import assert from "node:assert/strict";
import { test } from "node:test";

import {
  STAGING_TLS_TERMINATION_ALLOWLIST,
  classifyRazorpayKeyId,
  projectStrictStagingConfiguration,
} from "./staging-config-projection.mjs";

const ORIGIN = "https://staging.example.test";

function files(overrides = {}) {
  const shared = {
    BOBA_BEAR_ENV: "staging",
    NODE_ENV: "production",
    BOBA_BEAR_PUBLIC_ORIGIN: ORIGIN,
    BOBA_BEAR_AUTHORIZED_STAGING_ORIGIN: ORIGIN,
    BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS: "false",
    BOBA_BEAR_RELEASE: "rel-staging-1",
    BOBA_BEAR_STAGING_TLS_TERMINATION: "fixture-termination",
    BOBA_BEAR_PAYMENT_PROVIDER: "disabled",
    CUSTOMER_AUTH_BASE_URL: ORIGIN,
    WORKFORCE_AUTH_BASE_URL: ORIGIN,
    CUSTOMER_AUTH_TRUST_PROXY_HOPS: "1",
    WORKFORCE_AUTH_TRUST_PROXY_HOPS: "1",
    CUSTOMER_COMMERCE_TRUST_PROXY_HOPS: "1",
    ...overrides,
  };
  const body = Object.entries(shared)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  return () => body;
}

test("shipped TLS allowlist is empty", () => {
  assert.deepEqual([...STAGING_TLS_TERMINATION_ALLOWLIST], []);
});

test("strict projection is VALID only with a fixture allowlist and agreed https origin", () => {
  const projected = projectStrictStagingConfiguration({
    directory: "/unused",
    allowlist: ["fixture-termination"],
    readFile: files(),
  });
  assert.equal(projected.projectedConfigState, "VALID");
  assert.equal(projected.publicOrigin, ORIGIN);
  assert.equal(projected.paymentIsolation, "DISABLED");
  assert.equal(projected.bobaBearEnvDrift, false);
});

test("default allowlist keeps a complete staging projection INVALID", () => {
  const projected = projectStrictStagingConfiguration({
    directory: "/unused",
    readFile: files(),
  });
  assert.equal(projected.projectedConfigState, "INVALID");
  assert.ok(projected.reasons.includes("TLS_TERMINATION_UNAPPROVED"));
});

test("http, loopback, mismatched auth origins, and live keys are rejected", () => {
  const http = projectStrictStagingConfiguration({
    directory: "/unused",
    allowlist: ["fixture-termination"],
    readFile: files({
      BOBA_BEAR_PUBLIC_ORIGIN: "http://staging.example.test",
      BOBA_BEAR_AUTHORIZED_STAGING_ORIGIN: "http://staging.example.test",
      CUSTOMER_AUTH_BASE_URL: "http://staging.example.test",
      WORKFORCE_AUTH_BASE_URL: "http://staging.example.test",
    }),
  });
  assert.ok(http.reasons.includes("STRICT_STAGING_ORIGIN_NOT_PUBLIC_HTTPS"));

  const loopback = projectStrictStagingConfiguration({
    directory: "/unused",
    allowlist: ["fixture-termination"],
    readFile: files({
      BOBA_BEAR_PUBLIC_ORIGIN: "https://localhost",
      BOBA_BEAR_AUTHORIZED_STAGING_ORIGIN: "https://localhost",
      CUSTOMER_AUTH_BASE_URL: "https://localhost",
      WORKFORCE_AUTH_BASE_URL: "https://localhost",
    }),
  });
  assert.ok(loopback.reasons.includes("STRICT_STAGING_ORIGIN_NOT_PUBLIC_HTTPS"));

  const mismatch = projectStrictStagingConfiguration({
    directory: "/unused",
    allowlist: ["fixture-termination"],
    readFile: files({ WORKFORCE_AUTH_BASE_URL: "https://other.example.test" }),
  });
  assert.ok(mismatch.reasons.includes("STRICT_STAGING_ORIGIN_MISMATCH"));

  const live = projectStrictStagingConfiguration({
    directory: "/unused",
    allowlist: ["fixture-termination"],
    readFile: files({
      BOBA_BEAR_PAYMENT_PROVIDER: "razorpay",
      BOBA_BEAR_RAZORPAY_KEY_ID: "rzp_live_examplekey",
      BOBA_BEAR_RAZORPAY_KEY_SECRET: "live-secret-value",
      BOBA_BEAR_RAZORPAY_WEBHOOK_SECRET: "live-webhook-value",
    }),
  });
  assert.equal(live.paymentIsolation, "LIVE_REJECTED");
  assert.equal(JSON.stringify(live).includes("rzp_live_examplekey"), false);
});

test("unsafe adapters and missing release fail closed", () => {
  const unsafe = projectStrictStagingConfiguration({
    directory: "/unused",
    allowlist: ["fixture-termination"],
    readFile: files({ BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS: "true" }),
  });
  assert.ok(unsafe.reasons.includes("UNSAFE_ADAPTERS_NOT_EXPLICITLY_FALSE"));
  const omitted = projectStrictStagingConfiguration({
    directory: "/unused",
    allowlist: ["fixture-termination"],
    readFile: files({ BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS: "" }),
  });
  assert.ok(omitted.reasons.includes("UNSAFE_ADAPTERS_NOT_EXPLICITLY_FALSE"));
  const release = projectStrictStagingConfiguration({
    directory: "/unused",
    allowlist: ["fixture-termination"],
    readFile: files({ BOBA_BEAR_RELEASE: "" }),
  });
  assert.ok(release.reasons.includes("RELEASE_MISSING"));
});

test("razorpay key classification never echoes the key", () => {
  assert.equal(classifyRazorpayKeyId("rzp_test_abc123"), "test");
  assert.equal(classifyRazorpayKeyId("rzp_live_abc123"), "live");
  assert.equal(classifyRazorpayKeyId("rzp_test_"), "ambiguous");
  assert.equal(classifyRazorpayKeyId(undefined), "missing");
});

test("one service file cannot mask another service effective environment", () => {
  const projected = projectStrictStagingConfiguration({
    directory: "/unused",
    allowlist: ["fixture-termination"],
    readFile(fileName) {
      const layer = {
        BOBA_BEAR_ENV: "staging",
        NODE_ENV: "production",
        BOBA_BEAR_PUBLIC_ORIGIN: ORIGIN,
        BOBA_BEAR_AUTHORIZED_STAGING_ORIGIN: ORIGIN,
        BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS: "false",
        BOBA_BEAR_RELEASE: "rel-staging-1",
        BOBA_BEAR_STAGING_TLS_TERMINATION: "fixture-termination",
        BOBA_BEAR_PAYMENT_PROVIDER: "disabled",
        CUSTOMER_AUTH_BASE_URL: ORIGIN,
        WORKFORCE_AUTH_BASE_URL: ORIGIN,
        CUSTOMER_AUTH_TRUST_PROXY_HOPS: "1",
        WORKFORCE_AUTH_TRUST_PROXY_HOPS: "1",
        CUSTOMER_COMMERCE_TRUST_PROXY_HOPS: "1",
      };
      if (fileName === ".env.customer-auth.docker.local") {
        layer.BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS = "true";
      }
      if (fileName === ".env.customer-commerce.docker.local") {
        layer.BOBA_BEAR_PAYMENT_PROVIDER = "razorpay";
        layer.BOBA_BEAR_RAZORPAY_KEY_ID = "rzp_live_ExampleKey1";
        layer.BOBA_BEAR_RAZORPAY_KEY_SECRET = "live_only_key_secret";
        layer.BOBA_BEAR_RAZORPAY_WEBHOOK_SECRET = "live_only_webhook_secret";
      }
      return Object.entries(layer)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
    },
  });
  assert.equal(projected.projectedConfigState, "INVALID");
  assert.equal(projected.paymentIsolation, "LIVE_REJECTED");
  assert.ok(projected.reasons.includes("PAYMENT_ISOLATION_UNVERIFIED"));
  assert.ok(projected.reasons.includes("UNSAFE_ADAPTERS_NOT_EXPLICITLY_FALSE"));
  assert.equal(JSON.stringify(projected).includes("rzp_live_ExampleKey1"), false);
});
