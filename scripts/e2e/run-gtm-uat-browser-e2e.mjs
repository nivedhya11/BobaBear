#!/usr/bin/env node
/**
 * Disposable-browser runner for GTM UAT Golden Journey gaps.
 * Fake Razorpay only. Does not start staging containers.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const IGNORED_ENV_FILE = path.join(projectRoot, ".env.customer-auth.docker.local");

function readIgnoredFixedCode() {
  if (!existsSync(IGNORED_ENV_FILE)) return null;
  const content = readFileSync(IGNORED_ENV_FILE, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key !== "CUSTOMER_OTP_LOCAL_FIXED_CODE") continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }
  return null;
}

function resolveFixedCode() {
  const fromEnv = process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE;
  if (fromEnv && /^\d{6}$/.test(fromEnv)) return fromEnv;
  const fromFile = readIgnoredFixedCode();
  if (fromFile && /^\d{6}$/.test(fromFile)) return fromFile;
  return String(randomInt(100000, 1000000));
}

const result = spawnSync(
  "npx",
  ["playwright", "test", "--config=playwright.gtm-uat-browser.config.ts"],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      CUSTOMER_OTP_LOCAL_FIXED_CODE: resolveFixedCode(),
      E2E_GTM_UAT_FIXTURES: "1",
      E2E_HARNESS_CONTROL_TOKEN: process.env.E2E_HARNESS_CONTROL_TOKEN ?? "gtm-uat-browser-control",
    },
    stdio: "inherit",
  },
);

process.exit(result.status === 0 ? 0 : result.status ?? 1);
