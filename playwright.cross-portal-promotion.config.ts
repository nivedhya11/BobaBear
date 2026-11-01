import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.CROSS_PORTAL_E2E_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL;
if (!baseURL) {
  throw new Error("CROSS_PORTAL_E2E_BASE_URL (or PLAYWRIGHT_BASE_URL) is required.");
}
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(baseURL)) {
  throw new Error("IMP-036J cross-portal Playwright refuses non-loopback baseURL.");
}

/**
 * IMP-036J cross-portal shared-DB browser proof.
 * One Chromium worker; operator + customer contexts share one disposable Postgres.
 */
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/cross-portal-promotion-lifecycle.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 300_000,
  expect: { timeout: 45_000 },
  reporter: [["list"]],
  outputDir: "test-results-cross-portal-promotion",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
