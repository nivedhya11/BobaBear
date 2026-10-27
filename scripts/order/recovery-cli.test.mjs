import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  ORDER_RECOVERY_CLI_ERROR,
  ORDER_RECOVERY_CURSOR_MESSAGES,
  OrderRecoveryCliError,
  formatOrderRecoveryOperatorSummary,
  parseOrderRecoveryCliArgs,
  parseOrderRecoveryCursorText,
  safeOrderRecoveryCliErrorMessage,
  serializeOrderRecoveryCursor,
} from "./recovery-cli.mjs";

const CHECKOUT_ID = "00000000-0000-4000-8000-000000000001";
const OTHER_CHECKOUT_ID = "00000000-0000-4000-8000-000000000002";
const TIMESTAMP = "2026-01-15T10:00:00.000Z";

function cursorJson(overrides = {}) {
  return JSON.stringify({
    lastCheckoutUpdatedAt: TIMESTAMP,
    lastCheckoutId: CHECKOUT_ID,
    ...overrides,
  });
}

function assertSafeRejection(run, message, forbidden) {
  assert.throws(run, (error) => {
    assert.ok(error instanceof OrderRecoveryCliError);
    assert.equal(error.message, message);
    const rendered = `${error.message}\n${error.stack ?? ""}`;
    for (const token of forbidden) {
      assert.equal(error.message.includes(token), false);
      assert.equal(safeOrderRecoveryCliErrorMessage(error).includes(token), false);
    }
    assert.equal(rendered.includes("postgresql://"), false);
    return true;
  });
}

test("valid composite cursor round-trips onto the domain shape", () => {
  const parsed = parseOrderRecoveryCliArgs([`--cursor=${cursorJson()}`]);
  assert.equal(parsed.cursor?.lastCheckoutUpdatedAt.toISOString(), TIMESTAMP);
  assert.equal(parsed.cursor?.lastCheckoutId, CHECKOUT_ID);

  const serialized = serializeOrderRecoveryCursor(parsed.cursor);
  const again = parseOrderRecoveryCursorText(serialized);
  assert.equal(again.lastCheckoutUpdatedAt.getTime(), parsed.cursor.lastCheckoutUpdatedAt.getTime());
  assert.equal(again.lastCheckoutId, parsed.cursor.lastCheckoutId);
  assert.deepEqual(JSON.parse(serialized), {
    lastCheckoutUpdatedAt: TIMESTAMP,
    lastCheckoutId: CHECKOUT_ID,
  });
});

test("separate --cursor argument and uppercase checkout id are accepted", () => {
  const parsed = parseOrderRecoveryCliArgs([
    "--cursor",
    cursorJson({ lastCheckoutId: CHECKOUT_ID.toUpperCase() }),
  ]);
  assert.equal(parsed.cursor?.lastCheckoutId, CHECKOUT_ID);
});

test("omitted cursor stays empty", () => {
  assert.deepEqual(parseOrderRecoveryCliArgs([]), {});
});

test("bare checkout id is rejected", () => {
  assertSafeRejection(
    () => parseOrderRecoveryCliArgs([`--cursor=${CHECKOUT_ID}`]),
    ORDER_RECOVERY_CURSOR_MESSAGES.MUST_BE_OBJECT,
    [CHECKOUT_ID],
  );
  assertSafeRejection(
    () => parseOrderRecoveryCliArgs([`--cursor=${JSON.stringify(CHECKOUT_ID)}`]),
    ORDER_RECOVERY_CURSOR_MESSAGES.MUST_BE_OBJECT,
    [CHECKOUT_ID],
  );
});

test("invalid JSON is rejected", () => {
  const raw = '{"lastCheckoutUpdatedAt":';
  assertSafeRejection(
    () => parseOrderRecoveryCliArgs([`--cursor=${raw}`]),
    ORDER_RECOVERY_CURSOR_MESSAGES.MALFORMED,
    [raw],
  );
});

test("missing timestamp is rejected", () => {
  const raw = JSON.stringify({ lastCheckoutId: CHECKOUT_ID });
  assertSafeRejection(
    () => parseOrderRecoveryCursorText(raw),
    ORDER_RECOVERY_CURSOR_MESSAGES.MISSING_TIMESTAMP,
    [CHECKOUT_ID],
  );
});

test("invalid timestamp is rejected", () => {
  const raw = cursorJson({ lastCheckoutUpdatedAt: "not-a-timestamp" });
  assertSafeRejection(
    () => parseOrderRecoveryCursorText(raw),
    ORDER_RECOVERY_CURSOR_MESSAGES.INVALID_TIMESTAMP,
    ["not-a-timestamp"],
  );
});

test("missing checkout id is rejected", () => {
  const raw = JSON.stringify({ lastCheckoutUpdatedAt: TIMESTAMP });
  assertSafeRejection(
    () => parseOrderRecoveryCursorText(raw),
    ORDER_RECOVERY_CURSOR_MESSAGES.MISSING_CHECKOUT_ID,
    [TIMESTAMP],
  );
});

test("invalid checkout id is rejected", () => {
  const raw = cursorJson({ lastCheckoutId: "checkout-1" });
  assertSafeRejection(
    () => parseOrderRecoveryCursorText(raw),
    ORDER_RECOVERY_CURSOR_MESSAGES.INVALID_CHECKOUT_ID,
    ["checkout-1"],
  );
});

test("unexpected cursor fields are rejected", () => {
  const raw = cursorJson({ note: "super-secret-field-value" });
  assertSafeRejection(
    () => parseOrderRecoveryCursorText(raw),
    ORDER_RECOVERY_CURSOR_MESSAGES.UNEXPECTED_FIELD,
    ["super-secret-field-value", "note"],
  );
});

test("operator summary lists retryable failures and a reusable nextCursor", () => {
  const secret = "postgresql://boba:secret@db/boba";
  const summary = formatOrderRecoveryOperatorSummary({
    results: [
      {
        checkoutId: CHECKOUT_ID,
        disposition: "CREATED",
        orderId: "00000000-0000-4000-8000-000000000010",
        orderNumber: "ORD-0123456789AB",
      },
      { checkoutId: OTHER_CHECKOUT_ID, disposition: "RETRYABLE_FAILURE" },
      { checkoutId: "00000000-0000-4000-8000-000000000003", disposition: "ANOMALY" },
      { checkoutId: "00000000-0000-4000-8000-000000000004", disposition: "ALREADY_EXISTS" },
    ],
    nextCursor: {
      lastCheckoutUpdatedAt: new Date(TIMESTAMP),
      lastCheckoutId: OTHER_CHECKOUT_ID,
    },
  });

  assert.equal(summary.ok, true);
  assert.equal(summary.scanned, 4);
  assert.equal(summary.created, 1);
  assert.equal(summary.alreadyExists, 1);
  assert.equal(summary.anomaly, 1);
  assert.equal(summary.retryableFailure, 1);
  assert.equal(
    summary.created + summary.alreadyExists + summary.anomaly + summary.retryableFailure,
    summary.scanned,
  );
  assert.deepEqual(summary.retryableFailureCheckouts, [OTHER_CHECKOUT_ID]);
  assert.deepEqual(summary.nextCursor, {
    lastCheckoutUpdatedAt: TIMESTAMP,
    lastCheckoutId: OTHER_CHECKOUT_ID,
  });
  const rendered = JSON.stringify(summary);
  assert.equal(rendered.includes(secret), false);
  assert.equal(rendered.includes("secret"), false);
});

test("safe error reporting redacts secrets and stack traces", () => {
  const leaked = "postgresql://boba:secret@db/boba";
  assert.equal(
    safeOrderRecoveryCliErrorMessage(new Error(`${leaked}\n    at recover (recovery.ts:1:1)`)),
    ORDER_RECOVERY_CLI_ERROR,
  );
  assert.equal(ORDER_RECOVERY_CLI_ERROR.includes(leaked), false);
});

test("CLI validates the cursor before opening persistence", () => {
  const source = readFileSync(new URL("./recover-missing-orders.ts", import.meta.url), "utf8");
  const main = source.slice(source.indexOf("async function main"));
  const parseAt = main.indexOf("parseOrderRecoveryCliArgs(");
  const persistenceAt = main.indexOf("getApplicationPersistence(");
  assert.ok(parseAt > 0);
  assert.ok(persistenceAt > parseAt);
  assert.equal(source.includes("--cursor=<checkoutId>"), false);
});
