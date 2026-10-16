/**
 * IMP-036J #391 — isolated CHECKOUT_REPRICED / equal-payable diagnostics.
 *
 * Disposable Testcontainers only. No staging, no payment provider, no UI fix.
 */
import { randomUUID } from "node:crypto";

import { eq, sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";

import { catalogContentRevisionsTable } from "../../src/platform/database/schema/catalog";

import {
  addCartLine,
  setCartLineQuantity,
  type CustomerActor,
} from "../../src/server/cart";
import {
  evaluateCheckout,
  prepareCheckoutForPayment,
  setCheckoutDestination,
  startCheckout,
} from "../../src/server/checkout";
import { checkoutSnapshotsStructurallyEqual } from "../../src/server/checkout/compare-snapshots";
import { explainCheckoutSnapshotStructuralDifference } from "../../src/server/checkout/explain-snapshot-difference";
import {
  activateModifierGroupOption,
  activateModifierOption,
  addModifierOptionToGroup,
  createModifierOption,
  publishCatalogContentChange,
} from "../../src/server/catalog";
import type { Persistence } from "../../src/server/persistence/types";
import type { CheckoutSnapshot } from "../../src/shared/checkout";
import { includeVariantAtBrand as includeBrand } from "../assortment-availability/support";
import {
  seedActiveStandardVariant,
  seedActiveVariantWithModifier,
  uniqueCode,
} from "../database/support/cart-fixtures";
import {
  checkoutOpts,
  closeTrackedPersistenceHandles,
  createSavedAddressForCustomer,
  FIXED_NOW,
  mutableCheckoutClock,
  seedBrandPriceAndTaxForVariant,
  seedChargePricesOnBook,
  seedModifierDeltaOnBook,
  seedServiceableOutlet,
  withCartHarness,
} from "../database/support/checkout-fixtures";
import {
  applyCouponToCustomerCart,
  seedLimitedCoupon,
} from "../database/support/payment-fixtures";

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

function customerAccess(actor: CustomerActor, brandId: string) {
  return { kind: "customer" as const, actor, brandId };
}

type DiagnosticHarness = Readonly<{
  persistence: Persistence;
  actors: Parameters<Parameters<typeof withCartHarness>[0]>[0]["actors"];
  brandId: string;
  access: ReturnType<typeof customerAccess>;
  addressId: string;
  cartId: string;
  cartRevision: bigint;
  couponCode: string;
  promotionId: string;
  clockControl: ReturnType<typeof mutableCheckoutClock>;
  opts: ReturnType<typeof checkoutOpts>;
}>;

async function seedSecondModifierOption(
  persistence: Persistence,
  brandId: string,
  actor: unknown,
  mod: Awaited<ReturnType<typeof seedActiveVariantWithModifier>>,
): Promise<{ modifierGroupOptionId: string }> {
  return persistence.transaction(async (tx) => {
    const option = await createModifierOption(tx, {
      actor,
      brandId,
      code: uniqueCode("jelly"),
      name: "Jelly",
    });
    const binding = await addModifierOptionToGroup(tx, {
      actor,
      modifierGroupId: mod.modifierGroupId,
      modifierOptionId: option.id,
      minQuantity: 0,
      maxQuantity: 3,
      defaultQuantity: 0,
    });
    await activateModifierOption(tx, { actor, modifierOptionId: option.id });
    await activateModifierGroupOption(tx, {
      actor,
      modifierGroupOptionId: binding.id,
    });
    const envelopeRows = await tx.db
      .select()
      .from(catalogContentRevisionsTable)
      .where(eq(catalogContentRevisionsTable.brandId, brandId))
      .limit(1);
    const envelope = envelopeRows[0];
    if (!envelope) throw new Error("missing brand content revision");
    await publishCatalogContentChange(tx, {
      actor,
      brandId,
      productId: mod.productId,
      expectedContentRevision: envelope.contentRevision,
    });
    return { modifierGroupOptionId: binding.id };
  });
}

/**
 * Multi-line Delivery ASAP cart with qty>1, two modifiers, 10% coupon,
 * packaging, and zero delivery — mirrors the historical ₹952.40 commercial
 * shape without forcing production totals.
 */
async function withEqualPayableCheckoutShape<T>(
  fn: (ctx: DiagnosticHarness) => Promise<T>,
): Promise<T> {
  return withCartHarness(async (harness) => {
    const { persistence, actors } = harness;
    const brandId = actors.tree.brand.id;
    const access = customerAccess(actors.customerA, brandId);
    const clockControl = mutableCheckoutClock(FIXED_NOW);
    const opts = checkoutOpts(clockControl.clock);

    const drinkA = await seedActiveVariantWithModifier(
      persistence,
      brandId,
      actors.brandAdminActor,
      "rain",
    );
    const secondMod = await seedSecondModifierOption(
      persistence,
      brandId,
      actors.brandAdminActor,
      drinkA,
    );
    const drinkB = await seedActiveStandardVariant(
      persistence,
      brandId,
      actors.brandAdminActor,
      "cheese",
    );
    const drinkC = await seedActiveStandardVariant(
      persistence,
      brandId,
      actors.brandAdminActor,
      "hkmt",
    );

    for (const variantId of [
      drinkA.variantId,
      drinkB.variantId,
      drinkC.variantId,
    ]) {
      await includeBrand(
        persistence,
        actors.brandAdminActor,
        brandId,
        variantId,
      );
    }
    await seedServiceableOutlet(
      persistence,
      actors.brandAdminActor,
      actors.tree.outletA.id,
    );

    const { priceBookId } = await seedBrandPriceAndTaxForVariant(persistence, {
      actor: actors.brandAdminActor,
      brandId,
      organizationId: actors.tree.orgA.id,
      legalEntityId: actors.tree.leA.id,
      outletId: actors.tree.outletA.id,
      variantId: drinkA.variantId,
      amountPaise: BigInt(25_000),
    });
    await seedChargePricesOnBook(persistence, {
      brandId,
      priceBookId,
      packagingPaise: BigInt(2_000),
      deliveryPaise: BigInt(0),
    });
    await seedModifierDeltaOnBook(persistence, {
      brandId,
      priceBookId,
      variantModifierGroupId: drinkA.variantModifierGroupId,
      modifierGroupOptionId: drinkA.modifierGroupOptionId,
      priceDeltaPaise: BigInt(0),
    });
    await seedModifierDeltaOnBook(persistence, {
      brandId,
      priceBookId,
      variantModifierGroupId: drinkA.variantModifierGroupId,
      modifierGroupOptionId: secondMod.modifierGroupOptionId,
      priceDeltaPaise: BigInt(0),
    });
    await persistence.withContext(async (ctx) => {
      for (const [variantId, amount] of [
        [drinkB.variantId, 28_900],
        [drinkC.variantId, 24_700],
      ] as const) {
        await ctx.db.execute(sql`
          insert into app.price_book_variant_prices (
            id, brand_id, price_book_id, variant_id, amount_paise,
            floor_paise, ceiling_paise,
            allow_territory_override, allow_organization_override, allow_outlet_override,
            tax_category_id, created_at
          )
          select
            ${randomUUID()}::uuid, ${brandId}::uuid, ${priceBookId}::uuid,
            ${variantId}::uuid, ${amount}, null, null, false, false, false,
            tax_category_id, created_at
          from app.price_book_variant_prices
          where price_book_id = ${priceBookId}::uuid
            and variant_id = ${drinkA.variantId}::uuid
          limit 1
        `);
      }
    });

    const coupon = await seedLimitedCoupon(
      persistence,
      brandId,
      actors.brandAdminActor,
      {
        canonicalCode: `T391${uniqueCode("").slice(0, 6).toUpperCase()}`,
        maximumRedemptions: null,
        percentageBps: 1000,
      },
    );

    const lineA = await addCartLine(persistence, access, {
      variantId: drinkA.variantId,
      quantity: 2,
      modifiers: [
        {
          variantModifierGroupId: drinkA.variantModifierGroupId,
          modifierGroupOptionId: drinkA.modifierGroupOptionId,
          quantity: 1,
        },
        {
          variantModifierGroupId: drinkA.variantModifierGroupId,
          modifierGroupOptionId: secondMod.modifierGroupOptionId,
          quantity: 1,
        },
      ],
    });
    const lineB = await addCartLine(persistence, access, {
      variantId: drinkB.variantId,
      quantity: 1,
      expectedRevision: lineA.cart.revision,
    });
    const lineC = await addCartLine(persistence, access, {
      variantId: drinkC.variantId,
      quantity: 1,
      expectedRevision: lineB.cart.revision,
    });

    const withCoupon = await applyCouponToCustomerCart(
      persistence,
      actors.customerA,
      brandId,
      lineC.cart.revision,
      coupon.canonicalCode,
    );

    const address = await createSavedAddressForCustomer(
      persistence,
      actors.customerAId,
    );

    return fn({
      persistence,
      actors,
      brandId,
      access,
      addressId: address.id,
      cartId: withCoupon.id,
      cartRevision: withCoupon.revision,
      couponCode: coupon.canonicalCode,
      promotionId: coupon.promotionId,
      clockControl,
      opts,
    });
  });
}

async function evaluateToReady(
  persistence: Persistence,
  actor: CustomerActor,
  cartId: string,
  addressId: string,
  opts: ReturnType<typeof checkoutOpts>,
) {
  let checkout = await startCheckout(persistence, actor, { cartId }, opts);
  checkout = await setCheckoutDestination(
    persistence,
    actor,
    {
      checkoutId: checkout.id,
      expectedCheckoutRevision: checkout.revision,
      destination: { kind: "SAVED_ADDRESS", savedAddressId: addressId },
    },
    opts,
  );
  return evaluateCheckout(
    persistence,
    actor,
    {
      checkoutId: checkout.id,
      expectedCheckoutRevision: checkout.revision,
    },
    opts,
  );
}

function scrubIds(
  snap: CheckoutSnapshot,
  peerTimestamps: CheckoutSnapshot,
): CheckoutSnapshot {
  return Object.freeze({
    ...snap,
    id: "x",
    checkoutRevision: BigInt(1),
    evaluatedAt: peerTimestamps.evaluatedAt,
    serviceabilityEvaluatedAt: peerTimestamps.serviceabilityEvaluatedAt,
    createdAt: peerTimestamps.createdAt,
    lines: snap.lines.map((line) =>
      Object.freeze({
        ...line,
        id: "x",
        bundleSelections: line.bundleSelections.map((b) =>
          Object.freeze({ ...b, id: "x" }),
        ),
      }),
    ),
    charges: snap.charges.map((c) => Object.freeze({ ...c, id: "x" })),
    promotionEffects: snap.promotionEffects.map((e) =>
      Object.freeze({ ...e, id: "x" }),
    ),
    taxComponents: snap.taxComponents.map((t) =>
      Object.freeze({ ...t, id: "x" }),
    ),
  });
}

describe("IMP-036J #391 equal-payable CHECKOUT_REPRICED diagnostics", () => {
  it("A/B: evaluate then prepare without data change does not false-reprice", async () => {
    await withEqualPayableCheckoutShape(async (ctx) => {
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
      expect(ready.checkout.status).toBe("READY_FOR_PAYMENT");
      expect(ready.snapshot.grandTotalPaise).toBeGreaterThan(BigInt(0));
      expect(ready.snapshot.manualCouponCode).toBe(ctx.couponCode);
      expect(ready.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      expect(ready.snapshot.lines.length).toBeGreaterThanOrEqual(3);
      expect(
        ready.snapshot.lines.some((line) => line.modifiers.length >= 2),
      ).toBe(true);

      const prepared = await prepareCheckoutForPayment(
        ctx.persistence,
        ctx.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: ready.checkout.revision,
        },
        ctx.opts,
      );
      expect(prepared.snapshot.id).toBe(ready.snapshot.id);
      expect(prepared.snapshot.grandTotalPaise).toBe(
        ready.snapshot.grandTotalPaise,
      );

      const preparedAgain = await prepareCheckoutForPayment(
        ctx.persistence,
        ctx.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: ready.checkout.revision,
        },
        ctx.opts,
      );
      expect(preparedAgain.snapshot.id).toBe(ready.snapshot.id);
    });
  });

  it("C: advancing clock with unchanged eligible terms does not false-reprice", async () => {
    await withEqualPayableCheckoutShape(async (ctx) => {
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
      const payable = ready.snapshot.grandTotalPaise;
      ctx.clockControl.advance(5 * 60 * 1000);
      const prepared = await prepareCheckoutForPayment(
        ctx.persistence,
        ctx.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: ready.checkout.revision,
        },
        checkoutOpts(ctx.clockControl.clock),
      );
      expect(prepared.snapshot.grandTotalPaise).toBe(payable);
    });
  });

  it("D/E: equal payable with altered binding promotion revision still rejects", async () => {
    await withEqualPayableCheckoutShape(async (ctx) => {
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
      const payable = ready.snapshot.grandTotalPaise;
      const sealedRevision = ready.snapshot.promotionEffects.find(
        (e) => e.promotionId === ctx.promotionId,
      )?.promotionRevision;
      expect(sealedRevision).toBeTruthy();

      await ctx.persistence.withContext(async (dbCtx) => {
        await dbCtx.db.execute(sql`
          update app.promotions
          set revision = revision + 1
          where id = ${ctx.promotionId}::uuid
        `);
      });

      await expect(
        prepareCheckoutForPayment(
          ctx.persistence,
          ctx.actors.customerA,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
          },
          ctx.opts,
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });

      const after = await ctx.persistence.withContext(async (dbCtx) => {
        const row = await dbCtx.db.execute(sql`
          select status, revision::text as revision
          from app.checkouts where id = ${ready.checkout.id}::uuid
        `);
        return row.rows[0] as { status: string; revision: string };
      });
      expect(after.status).toBe("DRAFT");

      const recovered = await evaluateCheckout(
        ctx.persistence,
        ctx.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: BigInt(after.revision),
        },
        ctx.opts,
      );
      expect(recovered.snapshot.grandTotalPaise).toBe(payable);

      const explained = explainCheckoutSnapshotStructuralDifference(
        scrubIds(ready.snapshot, recovered.snapshot),
        scrubIds(recovered.snapshot, recovered.snapshot),
      );
      expect(explained.equal).toBe(false);
      expect(explained.firstDifferenceCategory).toBe("PROMOTION_EFFECT");
    });
  });

  it("F/G: modifier permutation with equal payable is rejected; diagnostic classifies MODIFIER_STRUCTURE", async () => {
    await withEqualPayableCheckoutShape(async (ctx) => {
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );

      const again = await evaluateCheckout(
        ctx.persistence,
        ctx.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: ready.checkout.revision,
        },
        ctx.opts,
      );
      expect(again.snapshot.id).toBe(ready.snapshot.id);

      const multiModLine = ready.snapshot.lines.find(
        (l) => l.modifiers.length >= 2,
      );
      expect(multiModLine).toBeDefined();

      const permuted: CheckoutSnapshot = {
        ...ready.snapshot,
        lines: ready.snapshot.lines.map((line) =>
          line.id === multiModLine!.id
            ? {
                ...line,
                modifiers: [...line.modifiers].reverse(),
              }
            : line,
        ),
      };
      expect(permuted.grandTotalPaise).toBe(ready.snapshot.grandTotalPaise);
      expect(checkoutSnapshotsStructurallyEqual(ready.snapshot, permuted)).toBe(
        false,
      );
      expect(
        explainCheckoutSnapshotStructuralDifference(ready.snapshot, permuted),
      ).toEqual({
        equal: false,
        firstDifferenceCategory: "MODIFIER_STRUCTURE",
      });
    });
  });

  it("H: genuine merchandise change still fail-closes payment prepare", async () => {
    await withEqualPayableCheckoutShape(async (ctx) => {
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
      const lineId = ready.snapshot.lines.find(
        (l) => l.sourceCartLineId != null,
      )!.sourceCartLineId!;
      await setCartLineQuantity(ctx.persistence, ctx.access, {
        cartLineId: lineId,
        quantity: 3,
        expectedRevision: ctx.cartRevision,
      });
      await expect(
        prepareCheckoutForPayment(
          ctx.persistence,
          ctx.actors.customerA,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
          },
          ctx.opts,
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
    });
  });

  it("diagnostic helper agrees with structural equality on scrubbed identical snapshots", async () => {
    await withEqualPayableCheckoutShape(async (ctx) => {
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
      const sealed = scrubIds(ready.snapshot, ready.snapshot);
      const candidate = scrubIds(ready.snapshot, ready.snapshot);
      expect(checkoutSnapshotsStructurallyEqual(sealed, candidate)).toBe(true);
      expect(
        explainCheckoutSnapshotStructuralDifference(sealed, candidate),
      ).toEqual({
        equal: true,
        firstDifferenceCategory: null,
      });
    });
  });
});
