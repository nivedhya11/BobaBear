#!/usr/bin/env node
/**
 * Disposable-browser runner for checkout discount presentation evidence.
 * Fake Razorpay only. Does not start staging containers.
 */
import { spawnSync } from "node:child_process";
import { randomBytes, randomInt, randomUUID } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUBLIC_CONTROL_TOKEN = "gtm-uat-browser-control";
const RUN_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fixedOtp() {
  const fromEnv = process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE;
  if (fromEnv && /^\d{6}$/.test(fromEnv)) return fromEnv;
  return String(randomInt(100000, 1000000));
}

function harnessControlToken() {
  const existing = process.env.E2E_HARNESS_CONTROL_TOKEN;
  if (existing && existing.length >= 32 && existing !== PUBLIC_CONTROL_TOKEN) return existing;
  return randomBytes(32).toString("hex");
}

function harnessRunId() {
  const existing = process.env.E2E_HARNESS_RUN_ID;
  if (existing && RUN_ID_RE.test(existing)) return existing;
  return randomUUID();
}

const result = spawnSync(
  "npx",
  ["playwright", "test", "--config=playwright.checkout-discount-presentation.config.ts"],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      BOBA_BEAR_ENV: "test",
      E2E_B5_COMMERCE_QA: "1",
      CUSTOMER_OTP_LOCAL_FIXED_CODE: fixedOtp(),
      E2E_HARNESS_CONTROL_TOKEN: harnessControlToken(),
      E2E_HARNESS_RUN_ID: harnessRunId(),
    },
    stdio: "inherit",
  },
);

process.exit(result.status === 0 ? 0 : result.status ?? 1);
