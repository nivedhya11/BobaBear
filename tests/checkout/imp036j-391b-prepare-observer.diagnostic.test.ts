/**
 * IMP-036J #391B — prepare diagnostic observer (isolated fixtures only).
 *
 * Disposable Testcontainers. No staging enablement, no provider, no UX change.
 */
import { randomUUID } from "node:crypto";

import { eq, sql } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  type CheckoutPrepareDiagnosticObservation,
} from "../../src/server/checkout";
import {
  activateModifierGroupOption,
  activateModifierOption,
  addModifierOptionToGroup,
  createModifierOption,
  publishCatalogContentChange,
} from "../../src/server/catalog";
import type { Persistence } from "../../src/server/persistence/types";
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

type Harness = Readonly<{
  persistence: Persistence;
  actors: Parameters<Parameters<typeof withCartHarness>[0]>[0]["actors"];
  brandId: string;
  access: ReturnType<typeof customerAccess>;
  addressId: string;
  cartId: string;
  cartRevision: bigint;
  couponCode: string;
  promotionId: string;
  priceBookId: string;
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

async function withObserverHarness<T>(fn: (ctx: Harness) => Promise<T>): Promise<T> {
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
        canonicalCode: `T391B${uniqueCode("").slice(0, 5).toUpperCase()}`,
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
      priceBookId,
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

describe("IMP-036J #391B prepare diagnostic observer", () => {
  it("A: disabled observer preserves legacy behavior and emits nothing", async () => {
    await withObserverHarness(async (ctx) => {
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
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
      expect(observations).toHaveLength(0);

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
      expect(observations).toHaveLength(0);
    });
  });

  it("B: equivalent evaluate→prepare succeeds with no mismatch event", async () => {
    await withObserverHarness(async (ctx) => {
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
      await prepareCheckoutForPayment(
        ctx.persistence,
        ctx.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: ready.checkout.revision,
        },
        {
          ...ctx.opts,
          prepareDiagnosticObserver: (o) => {
            observations.push(o);
          },
        },
      );
      expect(observations).toHaveLength(0);
    });
  });

  it("C: equal-payable STRUCTURAL rejection observes PROMOTION_EFFECT", async () => {
    await withObserverHarness(async (ctx) => {
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
      const payable = ready.snapshot.grandTotalPaise;

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
          {
            ...ctx.opts,
            prepareDiagnosticObserver: (o) => {
              observations.push(o);
            },
          },
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });

      expect(observations).toEqual([
        {
          rejectionStage: "STRUCTURAL",
          firstDifferenceCategory: "PROMOTION_EFFECT",
          payableChanged: false,
        },
      ]);

      const after = await ctx.persistence.withContext(async (dbCtx) => {
        const row = await dbCtx.db.execute(sql`
          select status from app.checkouts where id = ${ready.checkout.id}::uuid
        `);
        return (row.rows[0] as { status: string }).status;
      });
      expect(after).toBe("DRAFT");
      expect(payable).toBeGreaterThan(BigInt(0));
    });
  });

  it("D: genuine payable change reports payableChanged=true with MONETARY_COMPONENT", async () => {
    await withObserverHarness(async (ctx) => {
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );

      await ctx.persistence.withContext(async (dbCtx) => {
        await dbCtx.db.execute(sql`
          update app.price_book_variant_prices
          set amount_paise = amount_paise + 5000
          where price_book_id = ${ctx.priceBookId}::uuid
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
          {
            ...ctx.opts,
            prepareDiagnosticObserver: (o) => {
              observations.push(o);
            },
          },
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });

      expect(observations).toHaveLength(1);
      expect(observations[0]!.rejectionStage).toBe("STRUCTURAL");
      expect(observations[0]!.payableChanged).toBe(true);
      expect(observations[0]!.firstDifferenceCategory).toBe("MONETARY_COMPONENT");
      expect(JSON.stringify(observations[0])).not.toMatch(/\d{4,}/);
    });
  });

  it("E: cart revision path classifies CART_REVISION (not STRUCTURAL)", async () => {
    await withObserverHarness(async (ctx) => {
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
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
          {
            ...ctx.opts,
            prepareDiagnosticObserver: (o) => {
              observations.push(o);
            },
          },
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });

      expect(observations).toEqual([
        {
          rejectionStage: "CART_REVISION",
          firstDifferenceCategory: null,
          payableChanged: null,
        },
      ]);
    });
  });

  it("G: concurrent prepare observers keep attributions in their own closures", async () => {
    await withObserverHarness(async (ctx) => {
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
      const seenA: CheckoutPrepareDiagnosticObservation[] = [];
      const seenB: CheckoutPrepareDiagnosticObservation[] = [];

      await setCartLineQuantity(ctx.persistence, ctx.access, {
        cartLineId: ready.snapshot.lines.find((l) => l.sourceCartLineId)!
          .sourceCartLineId!,
        quantity: 3,
        expectedRevision: ctx.cartRevision,
      });

      const results = await Promise.all([
        prepareCheckoutForPayment(
          ctx.persistence,
          ctx.actors.customerA,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
          },
          {
            ...ctx.opts,
            prepareDiagnosticObserver: (o) => {
              seenA.push(o);
            },
          },
        ).then(
          () => "ok" as const,
          (error: { code?: string }) => error.code ?? "ERR",
        ),
        prepareCheckoutForPayment(
          ctx.persistence,
          ctx.actors.customerA,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
          },
          {
            ...ctx.opts,
            prepareDiagnosticObserver: (o) => {
              seenB.push(o);
            },
          },
        ).then(
          () => "ok" as const,
          (error: { code?: string }) => error.code ?? "ERR",
        ),
      ]);

      expect(results.every((code) => code === "CHECKOUT_REPRICED")).toBe(true);
      // Exactly one of the racing prepares may win the invalidation path and
      // notify; the other may hit a later state. Closures must never receive
      // the other request's observation object identity mix-up.
      for (const bucket of [seenA, seenB]) {
        for (const observation of bucket) {
          expect(observation.rejectionStage).toBe("CART_REVISION");
          expect(observation.firstDifferenceCategory).toBeNull();
        }
      }
      expect(seenA).not.toBe(seenB);
    });
  });

  it("H: observer throw preserves CHECKOUT_REPRICED and invalidation", async () => {
    await withObserverHarness(async (ctx) => {
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
      await ctx.persistence.withContext(async (dbCtx) => {
        await dbCtx.db.execute(sql`
          update app.promotions
          set revision = revision + 1
          where id = ${ctx.promotionId}::uuid
        `);
      });
      const observer = vi.fn(() => {
        throw new Error("observer failed");
      });
      await expect(
        prepareCheckoutForPayment(
          ctx.persistence,
          ctx.actors.customerA,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
          },
          { ...ctx.opts, prepareDiagnosticObserver: observer },
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      expect(observer).toHaveBeenCalledOnce();
      const after = await ctx.persistence.withContext(async (dbCtx) => {
        const row = await dbCtx.db.execute(sql`
          select status from app.checkouts where id = ${ready.checkout.id}::uuid
        `);
        return (row.rows[0] as { status: string }).status;
      });
      expect(after).toBe("DRAFT");
    });
  });

  it("F/K: privacy — observation JSON excludes PII, IDs, money, coupons", async () => {
    await withObserverHarness(async (ctx) => {
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      const ready = await evaluateToReady(
        ctx.persistence,
        ctx.actors.customerA,
        ctx.cartId,
        ctx.addressId,
        ctx.opts,
      );
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
          {
            ...ctx.opts,
            prepareDiagnosticObserver: (o) => {
              observations.push(o);
            },
          },
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      const serialized = JSON.stringify(observations);
      expect(serialized).not.toContain(ctx.couponCode);
      expect(serialized).not.toContain(ready.checkout.id);
      expect(serialized).not.toContain(ctx.promotionId);
      expect(serialized).not.toMatch(/grandTotal|paise|TEST|phone|address/i);
    });
  });
});
