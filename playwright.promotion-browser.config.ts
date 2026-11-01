import { randomBytes, randomUUID } from "node:crypto";

import { defineConfig, devices } from "@playwright/test";

/**
 * IMP-036J M2 acceptance browser evidence.
 * Separate disposable server from the GTM golden-journey file so scenario
 * promotion changes do not alter those journeys.
 */

const PORT = 4178;
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

const controlToken = harnessControlToken();
const controlRunId = harnessRunId();
process.env.E2E_HARNESS_CONTROL_TOKEN = controlToken;
process.env.E2E_HARNESS_RUN_ID = controlRunId;
process.env.BOBA_BEAR_ENV = "test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["**/promotion-browser-journeys.spec.ts"],
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: 0,
  reporter: [["line"]],
  outputDir: "test-results-promotion-browser",
  timeout: 180_000,
  expect: { timeout: 15_000 },
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
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile-chromium",
      grep: /mobile:/,
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `node --import tsx scripts/e2e/customer-ordering-server.ts --port ${PORT}`,
    wait: { stderr: /customer-ordering E2E harness ready at / },
    reuseExistingServer: false,
    timeout: 900_000,
    env: {
      ...process.env,
      BOBA_BEAR_ENV: "test",
      E2E_GTM_UAT_FIXTURES: "1",
      E2E_HARNESS_CONTROL_TOKEN: controlToken,
      E2E_HARNESS_RUN_ID: controlRunId,
    },
  },
});
