/**
 * GTM commerce regression over the real customer-commerce HTTP boundary
 * and a migrated disposable PostgreSQL database.
 *
 * Proves existing contracts only. It does not change status codes, explain
 * the unresolved #384B CHECKOUT_STATE_CONFLICT, or call a live payment provider.
 */
import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { seedRecognizedCoupon } from "../database/support/cart-fixtures";
import {
  createSavedAddressForCustomer,
  withCheckoutReadyHarness,
} from "../database/support/checkout-fixtures";
import {
  mintCustomerSessionCookieHeader,
  withCustomerCommerceHttpService,
} from "./support/service-harness";

type Json = Record<string, unknown>;

function jsonHeaders(cookie: string): HeadersInit {
  return { "content-type": "application/json", cookie };
}

async function readJson(response: Response): Promise<Json> {
  return (await response.json()) as Json;
}

function assertEnvelope(body: Json, code: string): void {
  expect(body.ok).toBe(false);
  expect(body.code).toBe(code);
  expect(typeof body.requestId).toBe("string");
  expect(body).not.toHaveProperty("message");
}

function objectOf(body: Json, key: "checkout" | "cart" | "snapshot"): Json {
  const value = body[key];
  if (typeof value !== "object" || value === null) {
    throw new Error(`response did not include ${key}`);
  }
  return value as Json;
}

function checkoutOf(body: Json): Json {
  return objectOf(body, "checkout");
}

function snapshotOf(body: Json): Json {
  const snapshot = body.snapshot;
  if (typeof snapshot !== "object" || snapshot === null) {
    throw new Error("evaluate response did not include a snapshot");
  }
  return snapshot as Json;
}

function paise(value: unknown, label: string): bigint {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`${label} was not a paise string`);
  }
  return BigInt(value);
}

describe("GTM commerce HTTP regression", () => {
  it("rejects empty and unknown coupons without writing a code", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const brandId = harness.actors.tree.brand.id;
      const cookie = await mintCustomerSessionCookieHeader(
        harness.database.connectionString,
        harness.actors.customerAId,
      );
      await withCustomerCommerceHttpService(harness.database.connectionString, async ({ baseUrl }) => {
        const cartResponse = await fetch(`${baseUrl}/api/v1/cart?brandId=${brandId}`, {
          headers: { cookie },
        });
        expect(cartResponse.status).toBe(200);
        const cart = objectOf(await readJson(cartResponse), "cart");
        const revision = cart.revision;
        expect(cart.manualCouponCode).toBeNull();

        const empty = await fetch(`${baseUrl}/api/v1/cart/coupon`, {
          method: "POST",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({ brandId, couponCode: "   ", expectedRevision: revision }),
        });
        expect(empty.status).toBe(400);
        const emptyBody = await readJson(empty);
        assertEnvelope(emptyBody, "CART_INVALID_INPUT");
        expect(emptyBody.field).toBe("couponCode");

        const unknown = await fetch(`${baseUrl}/api/v1/cart/coupon`, {
          method: "POST",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({
            brandId,
            couponCode: `NOPE${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`,
            expectedRevision: revision,
          }),
        });
        expect(unknown.status).toBe(404);
        assertEnvelope(await readJson(unknown), "CART_COUPON_UNKNOWN");

        const after = await fetch(`${baseUrl}/api/v1/cart?brandId=${brandId}`, {
          headers: { cookie },
        });
        const unchanged = objectOf(await readJson(after), "cart");
        expect(unchanged.manualCouponCode).toBeNull();
        expect(unchanged.revision).toBe(revision);
      });
    });
  });

  it("recalculates a ready checkout when a coupon is applied and removed", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const brandId = harness.actors.tree.brand.id;
      const cookie = await mintCustomerSessionCookieHeader(
        harness.database.connectionString,
        harness.actors.customerAId,
      );
      const coupon = await seedRecognizedCoupon(
        harness.persistence,
        brandId,
        harness.actors.brandAdminActor,
        `GTM${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`,
      );

      await withCustomerCommerceHttpService(harness.database.connectionString, async ({ baseUrl }) => {
        const started = await fetch(`${baseUrl}/api/v1/checkouts`, {
          method: "POST",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({ cartId: harness.cartId }),
        });
        expect(started.status).toBe(200);
        const predecessor = checkoutOf(await readJson(started));
        const openedRevision = predecessor.revision;

        const destination = await fetch(`${baseUrl}/api/v1/checkouts/${predecessor.id}/destination`, {
          method: "PUT",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({
            expectedCheckoutRevision: openedRevision,
            destination: { kind: "SAVED_ADDRESS", savedAddressId: harness.addressId },
          }),
        });
        expect(destination.status).toBe(200);
        const destined = checkoutOf(await readJson(destination));

        const staleDestination = await fetch(
          `${baseUrl}/api/v1/checkouts/${predecessor.id}/destination`,
          {
            method: "PUT",
            headers: jsonHeaders(cookie),
            body: JSON.stringify({
              expectedCheckoutRevision: openedRevision,
              destination: { kind: "SAVED_ADDRESS", savedAddressId: harness.addressId },
            }),
          },
        );
        expect(staleDestination.status).toBe(409);
        const staleBody = await readJson(staleDestination);
        assertEnvelope(staleBody, "CHECKOUT_CONFLICT");
        expect(staleBody.field).toBe("expectedCheckoutRevision");

        const baselineResponse = await fetch(`${baseUrl}/api/v1/checkouts/${predecessor.id}/evaluate`, {
          method: "POST",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({ expectedCheckoutRevision: destined.revision }),
        });
        expect(baselineResponse.status).toBe(200);
        const baselineBody = await readJson(baselineResponse);
        const baseline = snapshotOf(baselineBody);
        const baselineTotal = paise(baseline.grandTotalPaise, "baseline total");
        expect(baseline.manualCouponCode).toBeNull();
        const ready = checkoutOf(baselineBody);
        expect(ready.status).toBe("READY_FOR_PAYMENT");

        const cartResponse = await fetch(`${baseUrl}/api/v1/cart?brandId=${brandId}`, {
          headers: { cookie },
        });
        const cart = objectOf(await readJson(cartResponse), "cart");
        const applied = await fetch(`${baseUrl}/api/v1/cart/coupon`, {
          method: "POST",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({
            brandId,
            couponCode: coupon.canonicalCode,
            expectedRevision: cart.revision,
          }),
        });
        expect(applied.status).toBe(200);
        expect(objectOf(await readJson(applied), "cart").manualCouponCode).toBe(coupon.canonicalCode);

        const cartChanged = await fetch(`${baseUrl}/api/v1/checkouts/${predecessor.id}/evaluate`, {
          method: "POST",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({ expectedCheckoutRevision: ready.revision }),
        });
        expect(cartChanged.status).toBe(409);
        assertEnvelope(await readJson(cartChanged), "CHECKOUT_CART_CHANGED");

        const successorResponse = await fetch(`${baseUrl}/api/v1/checkouts`, {
          method: "POST",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({ cartId: harness.cartId }),
        });
        expect(successorResponse.status).toBe(200);
        const successor = checkoutOf(await readJson(successorResponse));
        expect(successor.id).not.toBe(predecessor.id);

        const predecessorClosed = await fetch(`${baseUrl}/api/v1/checkouts/${predecessor.id}/evaluate`, {
          method: "POST",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({ expectedCheckoutRevision: ready.revision }),
        });
        expect(predecessorClosed.status).toBe(409);
        assertEnvelope(await readJson(predecessorClosed), "CHECKOUT_STATE_CONFLICT");

        const discounted = await prepareDelivery(
          baseUrl,
          cookie,
          String(successor.id),
          String(successor.revision),
          harness.addressId,
        );
        const discountedTotal = paise(discounted.snapshot.grandTotalPaise, "discounted total");
        expect(discountedTotal).toBeLessThan(baselineTotal);
        expect(discounted.snapshot.manualCouponCode).toBe(coupon.canonicalCode);
        expect(paise(discounted.snapshot.promotionDiscountPaise, "discount")).toBeGreaterThan(BigInt(0));

        const discountedCart = objectOf(
          await readJson(
            await fetch(`${baseUrl}/api/v1/cart?brandId=${brandId}`, { headers: { cookie } }),
          ),
          "cart",
        );
        const removed = await fetch(`${baseUrl}/api/v1/cart/coupon/remove`, {
          method: "POST",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({ brandId, expectedRevision: discountedCart.revision }),
        });
        expect(removed.status).toBe(200);
        expect(objectOf(await readJson(removed), "cart").manualCouponCode).toBeNull();

        const removeChanged = await fetch(
          `${baseUrl}/api/v1/checkouts/${discounted.checkout.id}/evaluate`,
          {
            method: "POST",
            headers: jsonHeaders(cookie),
            body: JSON.stringify({ expectedCheckoutRevision: discounted.checkout.revision }),
          },
        );
        expect(removeChanged.status).toBe(409);
        assertEnvelope(await readJson(removeChanged), "CHECKOUT_CART_CHANGED");

        const restoredStart = checkoutOf(
          await readJson(
            await fetch(`${baseUrl}/api/v1/checkouts`, {
              method: "POST",
              headers: jsonHeaders(cookie),
              body: JSON.stringify({ cartId: harness.cartId }),
            }),
          ),
        );
        const restored = await prepareDelivery(
          baseUrl,
          cookie,
          String(restoredStart.id),
          String(restoredStart.revision),
          harness.addressId,
        );
        expect(paise(restored.snapshot.grandTotalPaise, "restored total")).toBe(baselineTotal);
        expect(restored.snapshot.manualCouponCode).toBeNull();
      });
    });
  });

  it("keeps one destination when two writes share a checkout revision", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const cookie = await mintCustomerSessionCookieHeader(
        harness.database.connectionString,
        harness.actors.customerAId,
      );
      const other = await createSavedAddressForCustomer(
        harness.persistence,
        harness.actors.customerAId,
        { addressLine1: "Flat 9, Second Block" },
      );

      await withCustomerCommerceHttpService(harness.database.connectionString, async ({ baseUrl }) => {
        const started = checkoutOf(
          await readJson(
            await fetch(`${baseUrl}/api/v1/checkouts`, {
              method: "POST",
              headers: jsonHeaders(cookie),
              body: JSON.stringify({ cartId: harness.cartId }),
            }),
          ),
        );
        const url = `${baseUrl}/api/v1/checkouts/${started.id}/destination`;
        const write = (addressId: string) =>
          fetch(url, {
            method: "PUT",
            headers: jsonHeaders(cookie),
            body: JSON.stringify({
              expectedCheckoutRevision: started.revision,
              destination: { kind: "SAVED_ADDRESS", savedAddressId: addressId },
            }),
          });
        const [left, right] = await Promise.all([write(harness.addressId), write(other.id)]);
        const responses = [left, right].sort((a, b) => a.status - b.status);
        expect(responses.map((response) => response.status)).toEqual([200, 409]);
        const winner = responses[0]!;
        const loser = responses[1]!;
        assertEnvelope(await readJson(loser), "CHECKOUT_CONFLICT");
        const winnerCheckout = checkoutOf(await readJson(winner));
        const winnerDestination = winnerCheckout.destination as Json;
        expect([harness.addressId, other.id]).toContain(winnerDestination.sourceSavedAddressId);

        const active = checkoutOf(
          await readJson(
            await fetch(`${baseUrl}/api/v1/checkouts/active?checkoutId=${started.id}`, {
              headers: { cookie },
            }),
          ),
        );
        const activeDestination = active.destination as Json;
        expect(activeDestination.sourceSavedAddressId).toBe(winnerDestination.sourceSavedAddressId);
        expect(active.revision).toBe(winnerCheckout.revision);

        const replay = await fetch(url, {
          method: "PUT",
          headers: jsonHeaders(cookie),
          body: JSON.stringify({
            expectedCheckoutRevision: started.revision,
            destination: {
              kind: "SAVED_ADDRESS",
              savedAddressId:
                winnerDestination.sourceSavedAddressId === harness.addressId
                  ? other.id
                  : harness.addressId,
            },
          }),
        });
        expect(replay.status).toBe(409);
        assertEnvelope(await readJson(replay), "CHECKOUT_CONFLICT");
        const still = checkoutOf(
          await readJson(
            await fetch(`${baseUrl}/api/v1/checkouts/active?checkoutId=${started.id}`, {
              headers: { cookie },
            }),
          ),
        );
        expect((still.destination as Json).sourceSavedAddressId).toBe(
          winnerDestination.sourceSavedAddressId,
        );
      });
    });
  });
});

async function prepareDelivery(
  baseUrl: string,
  cookie: string,
  checkoutId: string,
  revision: string,
  addressId: string,
): Promise<{ checkout: Json; snapshot: Json }> {
  const destination = await fetch(`${baseUrl}/api/v1/checkouts/${checkoutId}/destination`, {
    method: "PUT",
    headers: jsonHeaders(cookie),
    body: JSON.stringify({
      expectedCheckoutRevision: revision,
      destination: { kind: "SAVED_ADDRESS", savedAddressId: addressId },
    }),
  });
  expect(destination.status).toBe(200);
  const destined = checkoutOf(await readJson(destination));
  const evaluated = await fetch(`${baseUrl}/api/v1/checkouts/${checkoutId}/evaluate`, {
    method: "POST",
    headers: jsonHeaders(cookie),
    body: JSON.stringify({ expectedCheckoutRevision: destined.revision }),
  });
  expect(evaluated.status).toBe(200);
  const body = await readJson(evaluated);
  return { checkout: checkoutOf(body), snapshot: snapshotOf(body) };
}
