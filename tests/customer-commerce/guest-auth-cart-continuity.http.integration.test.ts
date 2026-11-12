/**
 * Disposable evidence for guest → authenticated cart continuity under the
 * accepted IMP-025 claim-at-checkout contract (D-370 implementation NOT authorized).
 *
 * Does not mutate attended XR-010 resources.
 */
import { describe, expect, it } from "vitest";

import { includeVariantAtBrand } from "../assortment-availability/support";
import { withCartHarness } from "../database/support/cart-fixtures";
import {
  mintCustomerSessionCookieHeader,
  withCustomerCommerceHttpService,
} from "./support/service-harness";

describe("guest → authenticated cart continuity (accepted claim contract)", () => {
  it("keeps the guest cart after auth until claim, then restores lines on the customer cart", async () => {
    await withCartHarness(async (harness) => {
      const { connectionString } = harness.database;
      const brandId = harness.actors.tree.brand.id;
      const variantId = harness.catalog.variantId;
      const cookie = await mintCustomerSessionCookieHeader(
        connectionString,
        harness.actors.customerAId,
      );

      await includeVariantAtBrand(
        harness.persistence,
        harness.actors.brandAdminActor,
        brandId,
        variantId,
      );

      await withCustomerCommerceHttpService(connectionString, async ({ baseUrl }) => {
        const guestAdd = await fetch(`${baseUrl}/api/v1/cart/lines`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ brandId, variantId, quantity: 2 }),
        });
        expect(guestAdd.status).toBe(200);
        const guestAddBody = await guestAdd.json();
        expect(guestAddBody.ok).toBe(true);
        expect(guestAddBody.guestToken).toBeTruthy();
        expect(guestAddBody.cart.ownerMode).toBe("guest");
        expect(guestAddBody.cart.lines).toHaveLength(1);
        expect(guestAddBody.cart.lines[0].quantity).toBe(2);
        const guestToken = guestAddBody.guestToken as string;
        const guestCartId = guestAddBody.cart.id as string;
        const guestRevision = guestAddBody.cart.revision as string;
        const guestRequestId = guestAdd.headers.get("x-request-id");
        expect(guestRequestId).toBeTruthy();

        // Authenticated GET prefers the customer principal and ignores the guest header.
        const afterAuth = await fetch(`${baseUrl}/api/v1/cart?brandId=${brandId}`, {
          headers: {
            cookie,
            "x-boba-guest-cart-token": guestToken,
          },
        });
        expect(afterAuth.status).toBe(200);
        const afterAuthBody = await afterAuth.json();
        expect(afterAuthBody.ok).toBe(true);
        expect(afterAuthBody.cart).toBeNull();
        expect(afterAuth.headers.get("x-request-id")).toBeTruthy();

        // Guest cart remains intact when read with the guest credential alone.
        const guestStill = await fetch(`${baseUrl}/api/v1/cart?brandId=${brandId}`, {
          headers: { "x-boba-guest-cart-token": guestToken },
        });
        expect(guestStill.status).toBe(200);
        const guestStillBody = await guestStill.json();
        expect(guestStillBody.cart.id).toBe(guestCartId);
        expect(guestStillBody.cart.ownerMode).toBe("guest");
        expect(guestStillBody.cart.lines[0].quantity).toBe(2);
        expect(guestStillBody.cart.revision).toBe(guestRevision);

        const claim = await fetch(`${baseUrl}/api/v1/cart/claim`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie,
            "x-boba-guest-cart-token": guestToken,
          },
          body: JSON.stringify({
            brandId,
            expectedGuestRevision: guestRevision,
          }),
        });
        expect(claim.status).toBe(200);
        const claimed = await claim.json();
        expect(claimed.ok).toBe(true);
        expect(claimed.cart.ownerMode).toBe("customer");
        expect(claimed.cart.id).toBe(guestCartId);
        expect(claimed.cart.lines).toHaveLength(1);
        expect(claimed.cart.lines[0].quantity).toBe(2);
        expect(claim.headers.get("x-request-id")).toBeTruthy();

        const customerActive = await fetch(`${baseUrl}/api/v1/cart?brandId=${brandId}`, {
          headers: { cookie },
        });
        expect(customerActive.status).toBe(200);
        const customerActiveBody = await customerActive.json();
        expect(customerActiveBody.cart.id).toBe(guestCartId);
        expect(customerActiveBody.cart.lines[0].quantity).toBe(2);
      });
    });
  });
});
