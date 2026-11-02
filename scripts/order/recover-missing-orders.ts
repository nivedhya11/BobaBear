#!/usr/bin/env -S node --conditions=react-server --import tsx
/**
 * Operational invocation of recoverMissingOrdersBatch (IMP-026A / D-362).
 *
 * Uses existing recovery algorithm only. Safe summary output — no secrets.
 * Repeated invocation is idempotent.
 *
 * Usage:
 *   npm run order:recover-missing
 *   npm run order:recover-missing -- --cursor='{"lastCheckoutUpdatedAt":"2026-01-15T10:00:00.000Z","lastCheckoutId":"00000000-0000-4000-8000-000000000001"}'
 *
 * When the summary includes nextCursor, pass that same object JSON as the
 * next --cursor value. A checkout id alone is rejected. Retryable failures
 * are counted and listed; they are not omitted from the summary.
 */
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnvConfig } from "@next/env";

import { loadConfig } from "../../src/platform/config/load-config";
import { ConfigurationError } from "../../src/platform/config/config-error";
import { recoverMissingOrdersBatch } from "../../src/server/order";
import { getApplicationPersistence } from "../../src/server/persistence";
import {
  formatOrderRecoveryOperatorSummary,
  parseOrderRecoveryCliArgs,
  safeOrderRecoveryCliErrorMessage,
} from "./recovery-cli.mjs";

const DEFAULT_ORDER_POLICY = Object.freeze({
  orderNumberMaxAttempts: 8,
  recoveryBatchSize: 25,
});

function printSafeError(error: unknown): void {
  console.error(JSON.stringify({ ok: false, error: safeOrderRecoveryCliErrorMessage(error) }));
}

async function main(): Promise<void> {
  const args = parseOrderRecoveryCliArgs(process.argv.slice(2));

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..", "..");
  loadEnvConfig(projectRoot, true);

  const workerConfig = loadConfig({ processKind: "worker", source: process.env });
  const persistence = getApplicationPersistence(workerConfig);

  try {
    const batch = await recoverMissingOrdersBatch(persistence, args, {
      policy: DEFAULT_ORDER_POLICY,
    });
    console.log(JSON.stringify(formatOrderRecoveryOperatorSummary(batch)));
  } finally {
    await persistence.close();
  }
}

main().catch((error: unknown) => {
  if (error instanceof ConfigurationError || error instanceof Error) {
    printSafeError(error);
  } else {
    printSafeError(new Error("order:recover-missing failed."));
  }
  process.exitCode = 1;
});
