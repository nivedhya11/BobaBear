/**
 * D-381 checkout boundary: a historical active outlet override fails commercial
 * evaluation until retired, then ASAP pickup and delivery use the brand baseline.
 */
import { randomUUID } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { priceBooksTable, priceBookVariantPricesTable } from "../../src/platform/database/schema/pricing";
import {
  evaluateCheckout,
  setCheckoutDestination,
  setCheckoutFulfilment,
  startCheckout,
} from "../../src/server/checkout";
import { retireActiveOutletPriceBook, resolveOutletVariantPrice } from "../../src/server/pricing";
import { TAX_CATEGORY_RESTAURANT_SERVICE_ID } from "../../src/shared/pricing";
import { closeTrackedPersistenceHandles, FIXED_NOW } from "../database/support/cart-fixtures";
import { checkoutOpts, withCheckoutReadyHarness } from "../database/support/checkout-fixtures";
import { seedPickupEligibleOutlet } from "../database/support/order-fixtures";

const SEEDED_AT = new Date("2026-01-15T00:00:00.000Z");
const EFFECTIVE_FROM = new Date("2026-01-01T00:00:00.000Z");

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

async function seedPoisonOutletBook(
  harness: Parameters<Parameters<typeof withCheckoutReadyHarness>[0]>[0],
): Promise<string> {
  const priceBookId = randomUUID();
  const { actors, catalog, persistence } = harness;
  await persistence.withContext(async (ctx) => {
    await ctx.db.insert(priceBooksTable).values({
      id: priceBookId,
      brandId: actors.tree.brand.id,
      scopeType: "outlet",
      territoryId: actors.tree.terrA.id,
      organizationId: actors.tree.orgA.id,
      outletId: actors.tree.outletA.id,
      code: `legacy-${priceBookId.slice(0, 8)}`,
      name: "Legacy checkout outlet book",
      salesChannel: "direct",
      currency: "INR",
      taxInclusionMode: "exclusive",
      effectiveFrom: EFFECTIVE_FROM,
      lifecycleStatus: "active",
      revision: BigInt(2),
      createdByWorkforceUserId: actors.brandAdmin.id,
      activatedByWorkforceUserId: actors.brandAdmin.id,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
      activatedAt: SEEDED_AT,
    });
    await ctx.db.insert(priceBookVariantPricesTable).values({
      id: randomUUID(),
      brandId: actors.tree.brand.id,
      priceBookId,
      variantId: catalog.variantId,
      amountPaise: BigInt(24100),
      allowTerritoryOverride: false,
      allowOrganizationOverride: false,
      allowOutletOverride: false,
      taxCategoryId: TAX_CATEGORY_RESTAURANT_SERVICE_ID,
      createdAt: SEEDED_AT,
    });
  });
  return priceBookId;
}

describe("legacy outlet price book retirement at checkout", () => {
  it("lets pickup ASAP commercial evaluation proceed after outlet retirement", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const outletId = h.actors.tree.outletA.id;
      const legacyId = await seedPoisonOutletBook(h);
      await expect(
        h.persistence.withContext((ctx) =>
          resolveOutletVariantPrice(ctx, {
            variantId: h.catalog.variantId,
            outletId,
            at: FIXED_NOW,
          }),
        ),
      ).rejects.toMatchObject({ pricingErrorCode: "OVERRIDE_NOT_PERMITTED" });
      await seedPickupEligibleOutlet(h.persistence, h.actors.brandAdminActor, outletId);
      const opts = checkoutOpts();
      const started = await startCheckout(
        h.persistence,
        h.actors.customerA,
        { cartId: h.cartId },
        opts,
      );
      const pickup = await setCheckoutFulfilment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: started.id,
          expectedCheckoutRevision: started.revision,
          fulfilmentMode: "PICKUP",
          pickupOutletId: outletId,
        },
        opts,
      );
      await expect(
        evaluateCheckout(
          h.persistence,
          h.actors.customerA,
          { checkoutId: pickup.id, expectedCheckoutRevision: pickup.revision },
          opts,
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_DEPENDENCY_INDETERMINATE" });

      await h.persistence.transaction((tx) =>
        retireActiveOutletPriceBook(tx, {
          actor: h.actors.brandAdminActor,
          brandId: h.actors.tree.brand.id,
          priceBookId: legacyId,
        }),
      );

      const ready = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        { checkoutId: pickup.id, expectedCheckoutRevision: pickup.revision },
        opts,
      );
      expect(ready.snapshot.fulfilmentMode).toBe("PICKUP");
      expect(ready.snapshot.fulfilmentTiming).toBe("ASAP");
      expect(ready.snapshot.lines[0]?.lineBasePaise).toBe(BigInt(10_000));
    });
  });

  it("lets delivery ASAP commercial evaluation proceed after outlet retirement", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const legacyId = await seedPoisonOutletBook(h);
      await expect(
        h.persistence.withContext((ctx) =>
          resolveOutletVariantPrice(ctx, {
            variantId: h.catalog.variantId,
            outletId: h.actors.tree.outletA.id,
            at: FIXED_NOW,
          }),
        ),
      ).rejects.toMatchObject({ pricingErrorCode: "OVERRIDE_NOT_PERMITTED" });
      const opts = checkoutOpts();
      const started = await startCheckout(
        h.persistence,
        h.actors.customerA,
        { cartId: h.cartId },
        opts,
      );
      const withDest = await setCheckoutDestination(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: started.id,
          expectedCheckoutRevision: started.revision,
          destination: { kind: "SAVED_ADDRESS", savedAddressId: h.addressId },
        },
        opts,
      );
      await expect(
        evaluateCheckout(
          h.persistence,
          h.actors.customerA,
          { checkoutId: withDest.id, expectedCheckoutRevision: withDest.revision },
          opts,
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_DEPENDENCY_INDETERMINATE" });

      await h.persistence.transaction((tx) =>
        retireActiveOutletPriceBook(tx, {
          actor: h.actors.brandAdminActor,
          brandId: h.actors.tree.brand.id,
          priceBookId: legacyId,
        }),
      );

      const ready = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        { checkoutId: withDest.id, expectedCheckoutRevision: withDest.revision },
        opts,
      );
      expect(ready.snapshot.fulfilmentMode).toBe("DELIVERY");
      expect(ready.snapshot.fulfilmentTiming).toBe("ASAP");
      expect(ready.snapshot.lines[0]?.lineBasePaise).toBe(BigInt(10_000));
    });
  });
});
