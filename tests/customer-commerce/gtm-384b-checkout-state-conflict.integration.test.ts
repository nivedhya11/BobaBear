/**
 * #384B diagnostic — CHECKOUT_STATE_CONFLICT HTTP 409 around destination
 * and evaluation.
 *
 * Disposable migrated PostgreSQL. Records method, path, requestId, code,
 * and the checkout row. Does not weaken revision, state, payment, or
 * tenant guards. Does not call a live payment provider.
 *
 * Binding rules exercised:
 * - Destination and evaluate reject PAYMENT_PENDING and terminal rows as
 *   CHECKOUT_STATE_CONFLICT before the revision check
 *   (src/server/checkout/destination.ts assertMutablePrePayment;
 *   src/server/checkout/evaluate.ts phase-1 status gate).
 * - A stale expectedCheckoutRevision on a still-mutable row is
 *   CHECKOUT_CONFLICT, not CHECKOUT_STATE_CONFLICT.
 * - startCheckout cancels a DRAFT whose source cart revision is stale and
 *   inserts a new DRAFT (src/server/checkout/operations.ts). A later
 *   destination or evaluate on the predecessor sees CANCELLED first.
 * - Ineligible scheduled timing fails closed before the timing write
 *   (src/server/checkout/scheduled-customer.ts + scheduled-eligibility.ts).
 */
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  checkoutSnapshotsTable,
  checkoutsTable,
} from "../../src/platform/database/schema/checkout";
import type { Persistence } from "../../src/server/persistence/types";
import { createFakePaymentProvider } from "../database/support/payment-fixtures";
import { newIdempotencyKey } from "../database/support/payment-fixtures";
import { withCheckoutReadyHarness } from "../database/support/checkout-fixtures";
import {
  mintCustomerSessionCookieHeader,
  withCustomerCommerceHttpService,
} from "./support/service-harness";

type CheckoutFacts = Readonly<{
  status: string;
  revision: string;
  fulfilmentMode: string;
  fulfilmentTiming: string;
  scheduledWindowStartAt: string | null;
  scheduledWindowEndAt: string | null;
  activeSnapshotId: string | null;
  sourceCartRevision: string;
  snapshotCount: number;
  grandTotalPaise: string | null;
}>;

type HttpEvidence = Readonly<{
  method: string;
  path: string;
  httpStatus: number;
  code: string | null;
  requestId: string | null;
  checkoutStatus: string | null;
  checkoutRevision: string | null;
}>;

function jsonHeaders(cookie?: string): HeadersInit {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (cookie) headers.cookie = cookie;
  return headers;
}

async function authCookie(connectionString: string, customerAuthUserId: string): Promise<string> {
  return mintCustomerSessionCookieHeader(connectionString, customerAuthUserId);
}

async function readCheckoutFacts(
  persistence: Persistence,
  checkoutId: string,
): Promise<CheckoutFacts | null> {
  return persistence.withContext(async (ctx) => {
    const rows = await ctx.db
      .select({
        status: checkoutsTable.status,
        revision: checkoutsTable.revision,
        fulfilmentMode: checkoutsTable.fulfilmentMode,
        fulfilmentTiming: checkoutsTable.fulfilmentTiming,
        scheduledWindowStartAt: checkoutsTable.scheduledWindowStartAt,
        scheduledWindowEndAt: checkoutsTable.scheduledWindowEndAt,
        activeSnapshotId: checkoutsTable.activeSnapshotId,
        sourceCartRevision: checkoutsTable.sourceCartRevision,
      })
      .from(checkoutsTable)
      .where(eq(checkoutsTable.id, checkoutId))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    const snapshots = await ctx.db
      .select({
        id: checkoutSnapshotsTable.id,
        grandTotalPaise: checkoutSnapshotsTable.grandTotalPaise,
      })
      .from(checkoutSnapshotsTable)
      .where(eq(checkoutSnapshotsTable.checkoutId, checkoutId));
    const active = row.activeSnapshotId
      ? snapshots.find((snapshot) => snapshot.id === row.activeSnapshotId)
      : undefined;
    return {
      status: row.status,
      revision: row.revision.toString(),
      fulfilmentMode: row.fulfilmentMode,
      fulfilmentTiming: row.fulfilmentTiming,
      scheduledWindowStartAt: row.scheduledWindowStartAt?.toISOString() ?? null,
      scheduledWindowEndAt: row.scheduledWindowEndAt?.toISOString() ?? null,
      activeSnapshotId: row.activeSnapshotId,
      sourceCartRevision: row.sourceCartRevision.toString(),
      snapshotCount: snapshots.length,
      grandTotalPaise: active ? active.grandTotalPaise.toString() : null,
    };
  });
}

async function sendJson(
  baseUrl: string,
  method: string,
  path: string,
  cookie: string | undefined,
  body?: unknown,
): Promise<Readonly<{ evidence: HttpEvidence; body: Record<string, unknown> }>> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: jsonHeaders(cookie),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const parsed = (await response.json()) as Record<string, unknown>;
  const checkout = parsed.checkout as { status?: string; revision?: string } | undefined;
  const headerRequestId = response.headers.get("x-request-id");
  return {
    evidence: {
      method,
      path,
      httpStatus: response.status,
      code: typeof parsed.code === "string" ? parsed.code : response.ok ? "OK" : null,
      requestId: headerRequestId,
      checkoutStatus: typeof checkout?.status === "string" ? checkout.status : null,
      checkoutRevision: typeof checkout?.revision === "string" ? checkout.revision : null,
    },
    body: parsed,
  };
}

function assertCorrelated409(
  evidence: HttpEvidence,
  body: Record<string, unknown>,
  code: "CHECKOUT_STATE_CONFLICT" | "CHECKOUT_CONFLICT",
): void {
  expect(evidence.httpStatus).toBe(409);
  expect(evidence.code).toBe(code);
  expect(body.ok).toBe(false);
  expect(body.code).toBe(code);
  expect(body.requestId).toBe(evidence.requestId);
  expect(evidence.requestId).toBeTruthy();
  expect(body).not.toHaveProperty("message");
}

describe("#384B checkout state conflict diagnostic", () => {
  it("client delivery sequence reaches READY and a stale revision is CHECKOUT_CONFLICT", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const cookie = await authCookie(harness.database.connectionString, harness.actors.customerAId);
      const foreignCookie = await authCookie(
        harness.database.connectionString,
        harness.actors.customerBId,
      );
      await withCustomerCommerceHttpService(harness.database.connectionString, async ({ baseUrl }) => {
        const started = await sendJson(baseUrl, "POST", "/api/v1/checkouts", cookie, {
          cartId: harness.cartId,
        });
        expect(started.evidence.httpStatus).toBe(200);
        const checkoutId = (started.body.checkout as { id: string }).id;
        const initialRevision = started.evidence.checkoutRevision!;
        expect(started.evidence.checkoutStatus).toBe("DRAFT");

        const fulfilled = await sendJson(
          baseUrl,
          "POST",
          `/api/v1/checkouts/${checkoutId}/fulfilment`,
          cookie,
          {
            expectedCheckoutRevision: initialRevision,
            fulfilmentMode: "DELIVERY",
            pickupOutletId: null,
          },
        );
        expect(fulfilled.evidence.httpStatus).toBe(200);
        expect(fulfilled.evidence.checkoutRevision).toBe(initialRevision);
        expect(fulfilled.evidence.checkoutStatus).toBe("DRAFT");

        const destination = await sendJson(
          baseUrl,
          "PUT",
          `/api/v1/checkouts/${checkoutId}/destination`,
          cookie,
          {
            expectedCheckoutRevision: initialRevision,
            destination: { kind: "SAVED_ADDRESS", savedAddressId: harness.addressId },
          },
        );
        expect(destination.evidence.httpStatus).toBe(200);
        expect(destination.evidence.checkoutStatus).toBe("DRAFT");
        const afterDestination = destination.evidence.checkoutRevision!;
        expect(afterDestination).not.toBe(initialRevision);
        const afterDestinationRow = await readCheckoutFacts(harness.persistence, checkoutId);
        expect(afterDestinationRow).toMatchObject({
          status: "DRAFT",
          revision: afterDestination,
          fulfilmentMode: "DELIVERY",
          fulfilmentTiming: "ASAP",
          scheduledWindowStartAt: null,
          scheduledWindowEndAt: null,
          activeSnapshotId: null,
          snapshotCount: 0,
        });

        const staleEvaluate = await sendJson(
          baseUrl,
          "POST",
          `/api/v1/checkouts/${checkoutId}/evaluate`,
          cookie,
          { expectedCheckoutRevision: initialRevision },
        );
        assertCorrelated409(staleEvaluate.evidence, staleEvaluate.body, "CHECKOUT_CONFLICT");
        expect(await readCheckoutFacts(harness.persistence, checkoutId)).toEqual(afterDestinationRow);

        const foreignDestination = await sendJson(
          baseUrl,
          "PUT",
          `/api/v1/checkouts/${checkoutId}/destination`,
          foreignCookie,
          {
            expectedCheckoutRevision: afterDestination,
            destination: { kind: "SAVED_ADDRESS", savedAddressId: harness.addressId },
          },
        );
        expect(foreignDestination.evidence.httpStatus).toBe(404);
        expect(foreignDestination.body.code).toBe("CHECKOUT_NOT_FOUND");
        expect(foreignDestination.body).not.toHaveProperty("message");
        expect(await readCheckoutFacts(harness.persistence, checkoutId)).toEqual(afterDestinationRow);

        const ineligibleTiming = await sendJson(
          baseUrl,
          "POST",
          `/api/v1/checkouts/${checkoutId}/fulfilment-timing`,
          cookie,
          {
            expectedCheckoutRevision: afterDestination,
            fulfilmentTiming: "SCHEDULED",
            scheduledWindowStartAt: "1999-01-01T00:00:00.000Z",
            scheduledWindowEndAt: "1999-01-01T00:30:00.000Z",
          },
        );
        assertCorrelated409(ineligibleTiming.evidence, ineligibleTiming.body, "CHECKOUT_STATE_CONFLICT");
        expect(await readCheckoutFacts(harness.persistence, checkoutId)).toEqual(afterDestinationRow);

        const evaluated = await sendJson(
          baseUrl,
          "POST",
          `/api/v1/checkouts/${checkoutId}/evaluate`,
          cookie,
          { expectedCheckoutRevision: afterDestination },
        );
        expect(evaluated.evidence.httpStatus).toBe(200);
        expect(evaluated.evidence.code).toBe("OK");
        expect(evaluated.evidence.checkoutStatus).toBe("READY_FOR_PAYMENT");
        const ready = await readCheckoutFacts(harness.persistence, checkoutId);
        expect(ready).toMatchObject({
          status: "READY_FOR_PAYMENT",
          fulfilmentMode: "DELIVERY",
          fulfilmentTiming: "ASAP",
          scheduledWindowStartAt: null,
          scheduledWindowEndAt: null,
          snapshotCount: 1,
        });
        expect(ready?.activeSnapshotId).toBeTruthy();
        expect(ready?.grandTotalPaise).toMatch(/^[1-9]\d*$/);

        const switched = await sendJson(
          baseUrl,
          "POST",
          `/api/v1/checkouts/${checkoutId}/fulfilment`,
          cookie,
          {
            expectedCheckoutRevision: ready!.revision,
            fulfilmentMode: "PICKUP",
          },
        );
        expect(switched.evidence.httpStatus).toBe(200);
        expect(switched.evidence.checkoutStatus).toBe("DRAFT");
        const pickupEvaluate = await sendJson(
          baseUrl,
          "POST",
          `/api/v1/checkouts/${checkoutId}/evaluate`,
          cookie,
          { expectedCheckoutRevision: switched.evidence.checkoutRevision },
        );
        expect(pickupEvaluate.evidence.httpStatus).toBe(400);
        expect(pickupEvaluate.body.code).toBe("PICKUP_OUTLET_REQUIRED");
        expect(pickupEvaluate.body.code).not.toBe("CHECKOUT_STATE_CONFLICT");
        const afterSwitch = await readCheckoutFacts(harness.persistence, checkoutId);
        expect(afterSwitch).toMatchObject({
          status: "DRAFT",
          fulfilmentMode: "PICKUP",
          fulfilmentTiming: "ASAP",
          activeSnapshotId: null,
          snapshotCount: 1,
        });
      });
    });
  });

  it("cart-revision successor cancels the post-destination checkout before evaluate", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const cookie = await authCookie(harness.database.connectionString, harness.actors.customerAId);
      const brandId = harness.actors.tree.brand.id;
      await withCustomerCommerceHttpService(harness.database.connectionString, async ({ baseUrl }) => {
        const started = await sendJson(baseUrl, "POST", "/api/v1/checkouts", cookie, {
          cartId: harness.cartId,
        });
        const predecessorId = (started.body.checkout as { id: string }).id;
        const startedRevision = started.evidence.checkoutRevision!;

        const destination = await sendJson(
          baseUrl,
          "PUT",
          `/api/v1/checkouts/${predecessorId}/destination`,
          cookie,
          {
            expectedCheckoutRevision: startedRevision,
            destination: { kind: "SAVED_ADDRESS", savedAddressId: harness.addressId },
          },
        );
        expect(destination.evidence.httpStatus).toBe(200);
        const boundRevision = destination.evidence.checkoutRevision!;
        const bound = await readCheckoutFacts(harness.persistence, predecessorId);
        expect(bound).toMatchObject({ status: "DRAFT", revision: boundRevision, snapshotCount: 0 });

        const cart = await sendJson(
          baseUrl,
          "GET",
          `/api/v1/cart?brandId=${brandId}`,
          cookie,
        );
        expect(cart.evidence.httpStatus).toBe(200);
        const cartBody = cart.body.cart as {
          revision: string;
          lines: Array<{ id: string; quantity: number }>;
        };
        const line = cartBody.lines[0]!;
        const quantity = await sendJson(
          baseUrl,
          "PATCH",
          `/api/v1/cart/lines/${line.id}/quantity`,
          cookie,
          {
            brandId,
            expectedRevision: cartBody.revision,
            quantity: line.quantity + 1,
          },
        );
        expect(quantity.evidence.httpStatus).toBe(200);

        const successorStart = await sendJson(baseUrl, "POST", "/api/v1/checkouts", cookie, {
          cartId: harness.cartId,
        });
        expect(successorStart.evidence.httpStatus).toBe(200);
        const successorId = (successorStart.body.checkout as { id: string }).id;
        expect(successorId).not.toBe(predecessorId);
        expect(successorStart.evidence.checkoutStatus).toBe("DRAFT");

        const predecessor = await readCheckoutFacts(harness.persistence, predecessorId);
        expect(predecessor).toMatchObject({
          status: "CANCELLED",
          revision: (BigInt(boundRevision) + BigInt(1)).toString(),
          activeSnapshotId: null,
          snapshotCount: 0,
        });

        const evaluatePredecessor = await sendJson(
          baseUrl,
          "POST",
          `/api/v1/checkouts/${predecessorId}/evaluate`,
          cookie,
          { expectedCheckoutRevision: boundRevision },
        );
        assertCorrelated409(
          evaluatePredecessor.evidence,
          evaluatePredecessor.body,
          "CHECKOUT_STATE_CONFLICT",
        );
        expect(await readCheckoutFacts(harness.persistence, predecessorId)).toEqual(predecessor);

        const rewritePredecessor = await sendJson(
          baseUrl,
          "PUT",
          `/api/v1/checkouts/${predecessorId}/destination`,
          cookie,
          {
            expectedCheckoutRevision: boundRevision,
            destination: harness.oneTimeDestination,
          },
        );
        assertCorrelated409(
          rewritePredecessor.evidence,
          rewritePredecessor.body,
          "CHECKOUT_STATE_CONFLICT",
        );
        expect(await readCheckoutFacts(harness.persistence, predecessorId)).toEqual(predecessor);

        const evaluateSuccessor = await sendJson(
          baseUrl,
          "POST",
          `/api/v1/checkouts/${successorId}/evaluate`,
          cookie,
          { expectedCheckoutRevision: successorStart.evidence.checkoutRevision },
        );
        // Missing destination is also HTTP 409, with a different code from
        // the lifecycle guard. The successor row stays a mutable DRAFT.
        expect(evaluateSuccessor.evidence.httpStatus).toBe(409);
        expect(evaluateSuccessor.body.code).toBe("CHECKOUT_DESTINATION_REQUIRED");
        expect(evaluateSuccessor.body.code).not.toBe("CHECKOUT_STATE_CONFLICT");
        expect(evaluateSuccessor.body.requestId).toBe(evaluateSuccessor.evidence.requestId);
        const successor = await readCheckoutFacts(harness.persistence, successorId);
        expect(successor).toMatchObject({
          status: "DRAFT",
          fulfilmentTiming: "ASAP",
          activeSnapshotId: null,
          snapshotCount: 0,
          sourceCartRevision: (quantity.body.cart as { revision: string }).revision,
        });
      });
    });
  });

  it("overlapping destination writes lose with CHECKOUT_CONFLICT and one revision bump", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const cookie = await authCookie(harness.database.connectionString, harness.actors.customerAId);
      await withCustomerCommerceHttpService(harness.database.connectionString, async ({ baseUrl }) => {
        const started = await sendJson(baseUrl, "POST", "/api/v1/checkouts", cookie, {
          cartId: harness.cartId,
        });
        const checkoutId = (started.body.checkout as { id: string }).id;
        const revision = started.evidence.checkoutRevision!;
        const first = {
          ...harness.oneTimeDestination,
          addressLine1: "12 Mall Road",
        };
        const second = {
          ...harness.oneTimeDestination,
          addressLine1: "48 Race Lane",
        };

        const [left, right] = await Promise.all([
          sendJson(baseUrl, "PUT", `/api/v1/checkouts/${checkoutId}/destination`, cookie, {
            expectedCheckoutRevision: revision,
            destination: first,
          }),
          sendJson(baseUrl, "PUT", `/api/v1/checkouts/${checkoutId}/destination`, cookie, {
            expectedCheckoutRevision: revision,
            destination: second,
          }),
        ]);
        const results = [left, right];
        const won = results.filter((result) => result.evidence.httpStatus === 200);
        const lost = results.filter((result) => result.evidence.httpStatus === 409);
        expect(won).toHaveLength(1);
        expect(lost).toHaveLength(1);
        assertCorrelated409(lost[0]!.evidence, lost[0]!.body, "CHECKOUT_CONFLICT");
        expect(won[0]!.evidence.checkoutStatus).toBe("DRAFT");
        expect(won[0]!.evidence.checkoutRevision).toBe((BigInt(revision) + BigInt(1)).toString());
        const row = await readCheckoutFacts(harness.persistence, checkoutId);
        expect(row).toMatchObject({
          status: "DRAFT",
          revision: (BigInt(revision) + BigInt(1)).toString(),
          activeSnapshotId: null,
          snapshotCount: 0,
          fulfilmentTiming: "ASAP",
        });
      });
    });
  });

  it("PAYMENT_PENDING rejects destination and evaluate without moving money or revision", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const cookie = await authCookie(harness.database.connectionString, harness.actors.customerAId);
      await withCustomerCommerceHttpService(
        harness.database.connectionString,
        async ({ baseUrl }) => {
          const started = await sendJson(baseUrl, "POST", "/api/v1/checkouts", cookie, {
            cartId: harness.cartId,
          });
          const checkoutId = (started.body.checkout as { id: string }).id;
          const destination = await sendJson(
            baseUrl,
            "PUT",
            `/api/v1/checkouts/${checkoutId}/destination`,
            cookie,
            {
              expectedCheckoutRevision: started.evidence.checkoutRevision,
              destination: { kind: "SAVED_ADDRESS", savedAddressId: harness.addressId },
            },
          );
          const evaluated = await sendJson(
            baseUrl,
            "POST",
            `/api/v1/checkouts/${checkoutId}/evaluate`,
            cookie,
            { expectedCheckoutRevision: destination.evidence.checkoutRevision },
          );
          expect(evaluated.evidence.httpStatus).toBe(200);
          expect(evaluated.evidence.checkoutStatus).toBe("READY_FOR_PAYMENT");

          const payment = await sendJson(baseUrl, "POST", "/api/v1/payments", cookie, {
            checkoutId,
            expectedCheckoutRevision: evaluated.evidence.checkoutRevision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("gtm-384b"),
          });
          expect(payment.evidence.httpStatus).toBe(200);
          expect(provider.createExecutionCallCount).toBe(1);
          const pending = await readCheckoutFacts(harness.persistence, checkoutId);
          expect(pending?.status).toBe("PAYMENT_PENDING");
          expect(pending?.activeSnapshotId).toBeTruthy();
          expect(pending?.grandTotalPaise).toMatch(/^[1-9]\d*$/);

          const active = await sendJson(
            baseUrl,
            "GET",
            `/api/v1/checkouts/active?checkoutId=${checkoutId}`,
            cookie,
          );
          expect(active.evidence.httpStatus).toBe(200);
          expect(active.evidence.checkoutStatus).toBe("PAYMENT_PENDING");
          expect(active.evidence.checkoutRevision).toBe(pending!.revision);

          const blockedDestination = await sendJson(
            baseUrl,
            "PUT",
            `/api/v1/checkouts/${checkoutId}/destination`,
            cookie,
            {
              expectedCheckoutRevision: pending!.revision,
              destination: harness.oneTimeDestination,
            },
          );
          assertCorrelated409(
            blockedDestination.evidence,
            blockedDestination.body,
            "CHECKOUT_STATE_CONFLICT",
          );

          const blockedEvaluate = await sendJson(
            baseUrl,
            "POST",
            `/api/v1/checkouts/${checkoutId}/evaluate`,
            cookie,
            { expectedCheckoutRevision: pending!.revision },
          );
          assertCorrelated409(
            blockedEvaluate.evidence,
            blockedEvaluate.body,
            "CHECKOUT_STATE_CONFLICT",
          );
          expect(await readCheckoutFacts(harness.persistence, checkoutId)).toEqual(pending);
          expect(provider.createExecutionCallCount).toBe(1);
        },
        { paymentProvider: provider },
      );
    });
  });
});
