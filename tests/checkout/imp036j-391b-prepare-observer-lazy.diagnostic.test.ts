/**
 * IMP-036J #391B — lazy STRUCTURAL diagnostic evaluation + classifier-throw safety.
 *
 * Isolated from the main #391B suite so the explain-module mock cannot affect
 * enabled-observer classification proofs there.
 */
import { randomUUID } from "node:crypto";

import { eq, sql } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { catalogContentRevisionsTable } from "../../src/platform/database/schema/catalog";
import {
  addCartLine,
  type CustomerActor,
} from "../../src/server/cart";
import {
  evaluateCheckout,
  prepareCheckoutForPayment,
  setCheckoutDestination,
  startCheckout,
} from "../../src/server/checkout";
import {
  activateModifierGroupOption,
  activateModifierOption,
  addModifierOptionToGroup,
  createModifierOption,
  publishCatalogContentChange,
} from "../../src/server/catalog";
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

type CartHarnessCtx = Parameters<Parameters<typeof withCartHarness>[0]>[0];
type Persistence = CartHarnessCtx["persistence"];

const explainControl = vi.hoisted(() => ({
  throwOnExplain: false,
  callCount: 0,
}));

vi.mock("../../src/server/checkout/explain-snapshot-difference", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../src/server/checkout/explain-snapshot-difference")
    >();
  return {
    ...actual,
    explainCheckoutSnapshotStructuralDifference: (
      ...args: Parameters<
        typeof actual.explainCheckoutSnapshotStructuralDifference
      >
    ) => {
      explainControl.callCount += 1;
      if (explainControl.throwOnExplain) {
        throw new Error("classifier boom");
      }
      return actual.explainCheckoutSnapshotStructuralDifference(...args);
    },
  };
});

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

beforeEach(() => {
  explainControl.throwOnExplain = false;
  explainControl.callCount = 0;
});

function customerAccess(actor: CustomerActor, brandId: string) {
  return { kind: "customer" as const, actor, brandId };
}

type Harness = Readonly<{
  persistence: Persistence;
  actors: CartHarnessCtx["actors"];
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
        canonicalCode: `T391L${uniqueCode("").slice(0, 5).toUpperCase()}`,
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

describe("IMP-036J #391B lazy STRUCTURAL diagnostic evaluation", () => {
  it("A: disabled STRUCTURAL rejection never runs diagnostic classification", async () => {
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
      explainControl.callCount = 0;
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
      expect(explainControl.callCount).toBe(0);
    });
  });

  it("C: classifier throw leaves CHECKOUT_REPRICED + DRAFT unchanged", async () => {
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
      explainControl.throwOnExplain = true;
      const observer = vi.fn();
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
      expect(observer).not.toHaveBeenCalled();
      expect(explainControl.callCount).toBeGreaterThan(0);
      const after = await ctx.persistence.withContext(async (dbCtx) => {
        const row = await dbCtx.db.execute(sql`
          select status from app.checkouts where id = ${ready.checkout.id}::uuid
        `);
        return (row.rows[0] as { status: string }).status;
      });
      expect(after).toBe("DRAFT");
    });
  });

  it("D: rejected/non-settling observer Promise leaves CHECKOUT_REPRICED + DRAFT", async () => {
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

      let rejectAsync!: (error: Error) => void;
      const asyncFailure = new Promise<void>((_resolve, reject) => {
        rejectAsync = reject;
      });
      const neverSettles = new Promise<void>(() => {
        /* intentionally never settles */
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
            prepareDiagnosticObserver: () => asyncFailure as unknown as void,
          },
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });

      rejectAsync(new Error("async diagnostic boom"));
      await expect(asyncFailure).rejects.toThrow("async diagnostic boom");

      const afterReject = await ctx.persistence.withContext(async (dbCtx) => {
        const row = await dbCtx.db.execute(sql`
          select status from app.checkouts where id = ${ready.checkout.id}::uuid
        `);
        return (row.rows[0] as { status: string }).status;
      });
      expect(afterReject).toBe("DRAFT");

      const ready2 = await evaluateCheckout(
        ctx.persistence,
        ctx.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: (
            await ctx.persistence.withContext(async (dbCtx) => {
              const row = await dbCtx.db.execute(sql`
                select revision from app.checkouts where id = ${ready.checkout.id}::uuid
              `);
              return BigInt((row.rows[0] as { revision: string }).revision);
            })
          ),
        },
        ctx.opts,
      );
      await ctx.persistence.withContext(async (dbCtx) => {
        await dbCtx.db.execute(sql`
          update app.promotions
          set revision = revision + 1
          where id = ${ctx.promotionId}::uuid
        `);
      });
      const started = Date.now();
      await expect(
        prepareCheckoutForPayment(
          ctx.persistence,
          ctx.actors.customerA,
          {
            checkoutId: ready2.checkout.id,
            expectedCheckoutRevision: ready2.checkout.revision,
          },
          {
            ...ctx.opts,
            prepareDiagnosticObserver: () => neverSettles as unknown as void,
          },
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      expect(Date.now() - started).toBeLessThan(2_000);
      const afterHang = await ctx.persistence.withContext(async (dbCtx) => {
        const row = await dbCtx.db.execute(sql`
          select status from app.checkouts where id = ${ready.checkout.id}::uuid
        `);
        return (row.rows[0] as { status: string }).status;
      });
      expect(afterHang).toBe("DRAFT");
    });
  });
});
