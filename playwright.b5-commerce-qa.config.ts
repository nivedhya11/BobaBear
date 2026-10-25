import { randomBytes, randomInt, randomUUID } from "node:crypto";

import { defineConfig, devices } from "@playwright/test";

/**
 * Disposable-browser proof for checkout "After discount" presentation.
 * Fake Razorpay and a Testcontainers PostgreSQL only. Not Founder UAT.
 */

const PORT = 4188;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCI = !!process.env.CI;
const PUBLIC_CONTROL_TOKEN = "gtm-uat-browser-control";
const RUN_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function harnessControlToken(): string {
  const existing = process.env.E2E_HARNESS_CONTROL_TOKEN;
  if (existing && existing.length >= 32 && existing !== PUBLIC_CONTROL_TOKEN) return existing;
  const created = randomBytes(32).toString("hex");
  process.env.E2E_HARNESS_CONTROL_TOKEN = created;
  return created;
}

function harnessRunId(): string {
  const existing = process.env.E2E_HARNESS_RUN_ID;
  if (existing && RUN_ID_RE.test(existing)) return existing;
  const created = randomUUID();
  process.env.E2E_HARNESS_RUN_ID = created;
  return created;
}

function fixedOtp(): string {
  const existing = process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE;
  if (existing && /^\d{6}$/.test(existing)) return existing;
  const created = String(randomInt(100000, 1000000));
  process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE = created;
  return created;
}

const controlToken = harnessControlToken();
const controlRunId = harnessRunId();
const otp = fixedOtp();
process.env.E2E_HARNESS_CONTROL_TOKEN = controlToken;
process.env.E2E_HARNESS_RUN_ID = controlRunId;
process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE = otp;
process.env.BOBA_BEAR_ENV = "test";
process.env.E2E_B5_COMMERCE_QA = "1";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["**/b5-commerce-composite-qa.spec.ts"],
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: 0,
  reporter: [["line"]],
  outputDir: "test-results-b5-commerce-qa",
  timeout: 240_000,
  expect: {
    timeout: 15_000,
  },

  use: {
    baseURL: BASE_URL,
    trace: "off",
    screenshot: "only-on-failure",
    video: "off",
  },

  projects: [
    {
      name: "desktop-chromium",
      testIgnore: [/mobile:/],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      grep: /mobile:/,
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  webServer: {
    command: `node --import tsx scripts/e2e/customer-ordering-server.ts --port ${PORT}`,
    wait: {
      stderr: /customer-ordering E2E harness ready at /,
    },
    reuseExistingServer: false,
    timeout: 900_000,
    env: {
      ...process.env,
      BOBA_BEAR_ENV: "test",
      E2E_B5_COMMERCE_QA: "1",
      E2E_HARNESS_CONTROL_TOKEN: controlToken,
      E2E_HARNESS_RUN_ID: controlRunId,
      CUSTOMER_OTP_LOCAL_FIXED_CODE: otp,
    },
  },
});
