import { defineConfig, devices } from "@playwright/test";

/**
 * Disposable-browser Golden Journey coverage for GTM UAT preparation.
 * Separate from the nightly customer-ordering suite so extra OTP identities
 * do not share that suite's per-IP limiter.
 */

const PORT = 4176;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["**/gtm-uat-browser-journeys.spec.ts"],
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: 0,
  reporter: [["line"]],
  outputDir: "test-results-gtm-uat-browser",
  timeout: 180_000,
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
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 900_000,
    env: {
      ...process.env,
      E2E_GTM_UAT_FIXTURES: "1",
      E2E_HARNESS_CONTROL_TOKEN: process.env.E2E_HARNESS_CONTROL_TOKEN ?? "gtm-uat-browser-control",
    },
  },
});
