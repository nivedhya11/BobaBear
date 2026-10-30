/**
 * Payment start and recovery without a provider call.
 * Same request fingerprint replays. A different request on the same key conflicts.
 * Order materialization names ALREADY_EXISTS. This file does not open Razorpay.
 */
import { describe, expect, it } from "vitest";

import { isPaymentError } from "../../src/shared/payment";
import {
  retryPaymentFingerprint,
  startPaymentFingerprint,
} from "../../src/shared/payment/parse-input";
import { ORDER_MATERIALIZATION_DISPOSITIONS } from "../../src/shared/order";
import { assertIdempotencyConflict } from "../../src/server/payment/idempotency";
import type { PaymentIdempotencyRow } from "../../src/server/payment/repository";

const CHECKOUT_ID = "11111111-1111-4111-8111-111111111111";
const PAYMENT_ID = "22222222-2222-4222-8222-222222222222";

function startInput(revision: bigint, idempotencyKey = "start-1") {
  return {
    checkoutId: CHECKOUT_ID,
    expectedCheckoutRevision: revision,
    paymentMethodIntent: "upi" as const,
    idempotencyKey,
    sourceCommandId: null,
  };
}

function record(requestFingerprint: string): PaymentIdempotencyRow {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    customerAuthUserId: "customer-1",
    operationKind: "start_payment",
    idempotencyKey: "start-1",
    requestFingerprint,
    paymentId: PAYMENT_ID,
    paymentAttemptId: null,
    checkoutId: CHECKOUT_ID,
    zeroPayableCheckoutId: null,
    createdAt: new Date("2026-10-24T09:00:00.000Z"),
    completedAt: new Date("2026-10-24T09:00:00.000Z"),
  };
}

describe("payment start and recovery without a provider", () => {
  it("repeats the same start fingerprint and changes it when checkout revision changes", () => {
    const first = startPaymentFingerprint(startInput(BigInt(4), "start-1"));
    const replay = startPaymentFingerprint(startInput(BigInt(4), "start-1"));
    const revised = startPaymentFingerprint(startInput(BigInt(5), "start-1"));

    expect(replay).toBe(first);
    expect(revised).not.toBe(first);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("binds a retry fingerprint to the payment and checkout revision", () => {
    const retry = retryPaymentFingerprint({
      paymentId: PAYMENT_ID,
      expectedCheckoutRevision: BigInt(4),
      paymentMethodIntent: "upi",
      idempotencyKey: "retry-1",
      sourceCommandId: null,
    });
    const same = retryPaymentFingerprint({
      paymentId: PAYMENT_ID,
      expectedCheckoutRevision: BigInt(4),
      paymentMethodIntent: "upi",
      idempotencyKey: "retry-2",
      sourceCommandId: "command-2",
    });
    const otherMethod = retryPaymentFingerprint({
      paymentId: PAYMENT_ID,
      expectedCheckoutRevision: BigInt(4),
      paymentMethodIntent: "card",
      idempotencyKey: "retry-1",
      sourceCommandId: null,
    });

    expect(same).toBe(retry);
    expect(otherMethod).not.toBe(retry);
  });

  it("allows the same fingerprint and refuses a reused key with a different request", () => {
    const fingerprint = startPaymentFingerprint(startInput(BigInt(4)));
    const other = startPaymentFingerprint(startInput(BigInt(5)));
    expect(() => assertIdempotencyConflict(record(fingerprint), fingerprint)).not.toThrow();
    expect(() => assertIdempotencyConflict(record(fingerprint), other)).toThrowError(
      expect.objectContaining({ code: "PAYMENT_IDEMPOTENCY_CONFLICT" }),
    );
    try {
      assertIdempotencyConflict(record(fingerprint), other);
    } catch (error) {
      expect(isPaymentError(error)).toBe(true);
    }
  });

  it("names an existing order as the idempotent materialization outcome", () => {
    expect(ORDER_MATERIALIZATION_DISPOSITIONS).toContain("ALREADY_EXISTS");
    expect(ORDER_MATERIALIZATION_DISPOSITIONS).toContain("CREATED");
  });
});
