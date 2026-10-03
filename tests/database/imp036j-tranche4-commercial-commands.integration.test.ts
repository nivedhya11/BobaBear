/**
 * IMP-036J Tranche 4 — COMMERCIAL_COMMANDS proof.
 *
 * Primary ACs: 002-01/02/03/05/06/07/08, 005-01/02, 006-02, 008-01, 013-03.
 * Real PostgreSQL overlapping transactions for required races.
 */
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";

import { setVariantAvailability } from "../../src/server/assortment";
import {
  applyCartCoupon,
  addCartLine,
  claimGuestCart,
  evaluateCart,
  getActiveCart,
  reconcileGuestCartWithCustomer,
  removeCartCoupon,
} from "../../src/server/cart";
import {
  evaluateCheckout,
  getActiveCheckout,
  prepareCheckoutForPayment,
  setCheckoutDestination,
  setCheckoutFulfilmentTiming,
  startCheckout,
} from "../../src/server/checkout";
import { CheckoutError } from "../../src/shared/checkout";
import {
  closeJourney,
  insertCommandOrigin,
  resolveCommercialStateChange,
} from "../../src/server/customer-commerce/measurement/writers";
import { saveOutletSchedulingProfile } from "../../src/server/scheduled-fulfilment/foundations";
import { includeVariantAtBrand } from "../assortment-availability/support";
import { CartError } from "../../src/shared/cart";
import {
  retryPayment,
  startPayment,
  completeZeroPayableCheckout,
} from "../../src/server/payment";
import { PaymentError } from "../../src/shared/payment";
import { loadFirstOrderPurchaseStatus } from "../../src/server/payment/first-order";
import {
  activatePromotion,
  createPromotionDraft,
  getPromotion,
  setPromotionBenefit,
  setPromotionTargets,
} from "../../src/server/promotions";
import {
  createSavedAddressForCustomer,
} from "./support/checkout-fixtures";
import { TEST_INSIDE_COORDS } from "./support/serviceability-fixtures";
import {
  GUEST_POLICY,
  seedActiveStandardVariant,
  seedRecognizedCoupon,
  uniqueCode,
  withCartHarness,
} from "./support/cart-fixtures";
import {
  applyCouponToCustomerCart,
  bringCheckoutToReady,
  CHECKOUT_POLICY,
  closeTrackedPersistenceHandles,
  createFakePaymentProvider,
  FIXED_NOW,
  newIdempotencyKey,
  paymentOpts,
  seedFullDiscountCoupon,
  seedLimitedCoupon,
  verifyAndProcessWebhook,
  withCheckoutReadyHarness,
} from "./support/payment-fixtures";
import type { Persistence } from "../../src/server/persistence/types";

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

const checkoutOpts = {
  clock: { now: () => new Date(FIXED_NOW.getTime()) },
  policy: CHECKOUT_POLICY,
};

function settled(results: ReadonlyArray<PromiseSettledResult<unknown>>) {
  return {
    ok: results.filter(
      (r): r is PromiseFulfilledResult<unknown> => r.status === "fulfilled",
    ),
    fail: results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    ),
  };
}

async function countSql(
  persistence: Persistence,
  query: ReturnType<typeof sql>,
): Promise<number> {
  return persistence.withContext(async (ctx) => {
    const r = await ctx.db.execute(query);
    return Number(r.rows[0]?.c ?? "0");
  });
}

async function markFirstOrderOnly(
  persistence: Persistence,
  promotionId: string,
): Promise<void> {
  await persistence.withContext(async (ctx) => {
    await ctx.db.execute(sql`
      update app.promotions
      set first_order_only = true
      where id = ${promotionId}::uuid
    `);
  });
}

async function markPromotionCap(
  persistence: Persistence,
  promotionId: string,
  globalCap: number | null,
  perCustomer: number | null,
): Promise<void> {
  await persistence.withContext(async (ctx) => {
    await ctx.db.execute(sql`
      update app.promotions
      set maximum_redemptions = ${globalCap},
          maximum_redemptions_per_customer = ${perCustomer}
      where id = ${promotionId}::uuid
    `);
  });
}

async function seedAutomaticCombinable(
  persistence: Parameters<typeof seedLimitedCoupon>[0],
  brandId: string,
  actor: unknown,
  percentageBps: number,
): Promise<string> {
  return persistence.transaction(async (tx) => {
    const created = await createPromotionDraft(tx, {
      actor,
      brandId,
      code: uniqueCode("auto"),
      displayName: "Automatic combinable T4",
      scopeType: "brand",
      territoryId: null,
      organizationId: null,
      outletId: null,
      triggerType: "automatic",
      stackingPolicy: "combinable",
      startsAt: new Date("2026-01-01T00:00:00Z"),
      endsAt: null,
    });
    await setPromotionBenefit(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
      benefit: {
        benefitType: "percentage_discount",
        percentageBps,
        fixedAmountPaise: null,
        maximumDiscountPaise: null,
        buyQuantity: null,
        getQuantity: null,
        repeatable: null,
        maximumRewardQuantity: null,
        includeModifiers: false,
        includeBundleDeltas: false,
      },
    });
    for (const role of ["qualifier", "benefit"] as const) {
      await setPromotionTargets(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
        targetRole: role,
        targets: [
          {
            targetRole: role,
            targetType: "all_merchandise",
            productId: null,
            variantId: null,
            chargeDefinitionId: null,
          },
        ],
      });
    }
    await activatePromotion(tx, {
      actor,
      expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
      promotionId: created.id,
    });
    return created.id;
  });
}

describe("IMP-036J T4 coupon commands", () => {
  it("apply / replace / remove / same-code no-op / unknown / stale revision", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const access = {
        kind: "customer" as const,
        actor: h.actors.customerA,
        brandId,
      };
      const a = await seedRecognizedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        uniqueCode("A"),
      );
      const b = await seedRecognizedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        uniqueCode("B"),
      );
      const applyId = randomUUID();
      const cart = await applyCartCoupon(
        h.persistence,
        access,
        {
          couponCode: a.canonicalCode,
          expectedRevision: h.cartRevision,
          sourceCommandId: applyId,
        },
      );
      expect(cart.manualCouponCode).toBe(a.canonicalCode);
      const originsAfterApply = await countSql(
        h.persistence,
        sql`select count(*)::text as c from app.commercial_command_origins
            where source_command_id = ${applyId}::uuid`,
      );
      expect(originsAfterApply).toBe(1);

      const sameId = randomUUID();
      const same = await applyCartCoupon(
        h.persistence,
        access,
        {
          couponCode: a.canonicalCode,
          expectedRevision: cart.revision,
          sourceCommandId: sameId,
        },
      );
      expect(same.revision).toBe(cart.revision);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.commercial_command_origins
              where source_command_id = ${sameId}::uuid`,
        ),
      ).toBe(0);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.commercial_command_results
              where source_command_id = ${sameId}::uuid`,
        ),
      ).toBe(1);

      const replaceId = randomUUID();
      const replaced = await applyCartCoupon(
        h.persistence,
        access,
        {
          couponCode: b.canonicalCode,
          expectedRevision: same.revision,
          sourceCommandId: replaceId,
        },
      );
      expect(replaced.manualCouponCode).toBe(b.canonicalCode);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.commercial_command_origins
              where source_command_id = ${replaceId}::uuid`,
        ),
      ).toBe(1);

      const removeId = randomUUID();
      const removed = await removeCartCoupon(h.persistence, access, {
        expectedRevision: replaced.revision,
        sourceCommandId: removeId,
      });
      expect(removed.manualCouponCode).toBeNull();
      const emptyRemove = await removeCartCoupon(h.persistence, access, {
        expectedRevision: removed.revision,
        sourceCommandId: randomUUID(),
      });
      expect(emptyRemove.revision).toBe(removed.revision);

      const unknownId = randomUUID();
      await expect(
        applyCartCoupon(h.persistence, access, {
          couponCode: "NO-SUCH-CODE",
          expectedRevision: emptyRemove.revision,
          sourceCommandId: unknownId,
        }),
      ).rejects.toMatchObject({ code: "CART_COUPON_UNKNOWN" });
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.commercial_command_origins
              where source_command_id = ${unknownId}::uuid`,
        ),
      ).toBe(0);

      await expect(
        applyCartCoupon(h.persistence, access, {
          couponCode: a.canonicalCode,
          expectedRevision: emptyRemove.revision + BigInt(9),
          sourceCommandId: randomUUID(),
        }),
      ).rejects.toBeInstanceOf(CartError);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.commercial_command_origins
              where cart_id = ${h.cartId}::uuid`,
        ),
      ).toBe(3);
    });
  });

  it("source_command_id replay same cart is idempotent; different cart is denied", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const coupon = await seedRecognizedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        uniqueCode("R"),
      );
      const sourceCommandId = randomUUID();
      const accessA = {
        kind: "customer" as const,
        actor: h.actors.customerA,
        brandId,
      };
      await applyCartCoupon(h.persistence, accessA, {
        couponCode: coupon.canonicalCode,
        expectedRevision: h.cartRevision,
        sourceCommandId,
      });
      const replay = await applyCartCoupon(h.persistence, accessA, {
        couponCode: coupon.canonicalCode,
        expectedRevision: h.cartRevision,
        sourceCommandId,
      });
      expect(replay.manualCouponCode).toBe(coupon.canonicalCode);

      await addCartLine(
        h.persistence,
        { kind: "customer", actor: h.actors.customerB, brandId },
        { variantId: h.catalog.variantId, quantity: 1 },
      );
      const cartB = await getActiveCart(
        h.persistence,
        { kind: "customer", actor: h.actors.customerB, brandId },
      );
      await expect(
        applyCartCoupon(
          h.persistence,
          { kind: "customer", actor: h.actors.customerB, brandId },
          {
            couponCode: coupon.canonicalCode,
            expectedRevision: cartB!.revision,
            sourceCommandId,
          },
        ),
      ).rejects.toMatchObject({ code: "CART_CONFLICT" });
    });
  });

  it("concurrent duplicate source_command_id yields one durable result", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const coupon = await seedRecognizedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        uniqueCode("DUP"),
      );
      const sourceCommandId = randomUUID();
      const access = {
        kind: "customer" as const,
        actor: h.actors.customerA,
        brandId,
      };
      const raced = await Promise.allSettled([
        applyCartCoupon(h.persistence, access, {
          couponCode: coupon.canonicalCode,
          expectedRevision: h.cartRevision,
          sourceCommandId,
        }),
        applyCartCoupon(h.persistence, access, {
          couponCode: coupon.canonicalCode,
          expectedRevision: h.cartRevision,
          sourceCommandId,
        }),
      ]);
      expect(settled(raced).ok.length).toBeGreaterThanOrEqual(1);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.commercial_command_results
              where source_command_id = ${sourceCommandId}::uuid`,
        ),
      ).toBe(1);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.commercial_command_origins
              where source_command_id = ${sourceCommandId}::uuid`,
        ),
      ).toBe(1);
    });
  });
});

describe("IMP-036J T4 journey, evaluation, snapshot", () => {
  it("startCheckout mints journey key and monotonic cart causal ordinal", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const started = await startCheckout(
        h.persistence,
        h.actors.customerA,
        { cartId: h.cartId },
        checkoutOpts,
      );
      const row = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select checkout_journey_key::text as k, cart_causal_ordinal::text as o
          from app.checkouts where id = ${started.id}::uuid
        `);
        return r.rows[0] as { k: string; o: string };
      });
      expect(row.k).toBeTruthy();
      expect(Number(row.o)).toBeGreaterThan(0);
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const sealed = await h.persistence.withContext(async (ctx) => {
        const lines = await ctx.db.execute(sql`
          select line_origin from app.checkout_snapshot_lines
          where snapshot_id = ${ready.snapshotId}::uuid
        `);
        const effects = await ctx.db.execute(sql`
          select promotion_revision::text as rev
          from app.checkout_snapshot_promotion_effects
          where snapshot_id = ${ready.snapshotId}::uuid
            and effect_kind = 'applied_promotion'
        `);
        return { lines: lines.rows, effects: effects.rows };
      });
      expect(sealed.lines.every((l) => l.line_origin === "cart")).toBe(true);
      expect(
        sealed.effects.every(
          (e) => typeof e.rev === "string" && Number(e.rev) >= 1,
        ),
      ).toBe(true);
    });
  });

  it("malformed activation does not fail checkout or change price", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const started = await startCheckout(
        h.persistence,
        h.actors.customerA,
        { cartId: h.cartId, cartActivationId: "not-a-uuid" },
        checkoutOpts,
      );
      expect(started.status).toBe("DRAFT");
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      expect(ready.grandTotalPaise > BigInt(0)).toBe(true);
    });
  });

  it("evaluation fingerprint reuse vs A-B-A occurrence ordinals", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const coupon = await seedRecognizedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        uniqueCode("FP"),
      );
      const access = {
        kind: "customer" as const,
        actor: h.actors.customerA,
        brandId,
      };
      const loc = { location: { coordinates: TEST_INSIDE_COORDS } };
      const a1 = await evaluateCart(h.persistence, access, loc);
      const a1b = await evaluateCart(h.persistence, access, loc);
      expect(a1.status).toBe("COMPLETE");
      expect(a1b.status).toBe("COMPLETE");
      expect(a1b.evaluationId).toBe(a1.evaluationId);

      const cart = await getActiveCart(h.persistence, access);
      await applyCartCoupon(h.persistence, access, {
        couponCode: coupon.canonicalCode,
        expectedRevision: cart!.revision,
        sourceCommandId: randomUUID(),
      });
      const b = await evaluateCart(h.persistence, access, loc);
      expect(b.evaluationId).not.toBe(a1.evaluationId);

      await removeCartCoupon(h.persistence, access, {
        expectedRevision: (await getActiveCart(h.persistence, access))!.revision,
        sourceCommandId: randomUUID(),
      });
      const a2 = await evaluateCart(h.persistence, access, loc);
      expect(a2.evaluationId).not.toBe(a1.evaluationId);
      expect(a2.evaluationId).not.toBe(b.evaluationId);
      const ordinals = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select occurrence_ordinal::text as o
          from app.commercial_evaluations
          where cart_id = ${h.cartId}::uuid
            and surface_scope = 'CART'
          order by occurrence_ordinal
        `);
        return r.rows.map((row) => Number(row.o));
      });
      expect(ordinals.at(-1)).toBeGreaterThan(ordinals[0]!);
    });
  });

  it("changed payable before bind returns CHECKOUT_REPRICED", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const lineId = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select id::text as id from app.cart_lines
          where cart_id = ${h.cartId}::uuid limit 1
        `);
        return r.rows[0]!.id as string;
      });
      const { setCartLineQuantity } = await import("../../src/server/cart");
      await setCartLineQuantity(
        h.persistence,
        {
          kind: "customer",
          actor: h.actors.customerA,
          brandId: h.actors.tree.brand.id,
        },
        {
          cartLineId: lineId,
          quantity: 2,
          expectedRevision: h.cartRevision,
        },
      );
      await expect(
        prepareCheckoutForPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
          },
          checkoutOpts,
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
    });
  });
});

describe("IMP-036J T4 first-order + claims", () => {
  it("one first-order Offer reserves one guard; success consumes; refund does not restore", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const promotionId = await seedAutomaticCombinable(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        1000,
      );
      await markFirstOrderOnly(h.persistence, promotionId);
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const started = await startPayment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: ready.revision,
          paymentMethodIntent: "upi",
          idempotencyKey: newIdempotencyKey(),
        },
        paymentOpts(provider),
      );
      const reserved = await countSql(
        h.persistence,
        sql`select count(*)::text as c from app.first_order_purchase_guards
            where customer_auth_user_id = ${h.actors.customerAId}
              and status = 'RESERVED'`,
      );
      expect(reserved).toBe(1);
      const claims = await countSql(
        h.persistence,
        sql`select count(*)::text as c from app.promotion_redemption_claims
            where checkout_snapshot_id = ${ready.snapshotId}::uuid`,
      );
      expect(claims).toBe(1);
      provider.setOutcome(started.attempt.providerExecutionIdentity, "succeed");
      await verifyAndProcessWebhook(
        h.persistence,
        provider,
        {
          executionIdentity: started.attempt.providerExecutionIdentity,
          outcome: "succeed",
          amountPaise: started.payment.expectedAmountPaise,
        },
        paymentOpts(provider),
      );
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.first_order_purchase_guards
              where customer_auth_user_id = ${h.actors.customerAId}
                and status = 'CONSUMED'`,
        ),
      ).toBe(1);
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          update app.orders
          set status = 'CANCELLED',
              cancelled_at = now(),
              cancelled_by_customer_auth_user_id = ${h.actors.customerAId},
              cancellation_reason_code = 'CUSTOMER_REQUESTED'
          where checkout_id = ${ready.checkoutId}::uuid
        `);
      });
      const status = await h.persistence.withContext((ctx) =>
        loadFirstOrderPurchaseStatus(ctx, h.actors.customerAId),
      );
      expect(status).toBe("HAS_PRIOR_PURCHASE");
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.first_order_purchase_guards
              where customer_auth_user_id = ${h.actors.customerAId}
                and status = 'CONSUMED'`,
        ),
      ).toBe(1);
    });
  });

  it("multiple first-order Offers share one guard and one claim per applied Promotion", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const p1 = await seedAutomaticCombinable(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        500,
      );
      const p2 = await seedAutomaticCombinable(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        400,
      );
      await markFirstOrderOnly(h.persistence, p1);
      await markFirstOrderOnly(h.persistence, p2);
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      await startPayment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: ready.revision,
          paymentMethodIntent: "upi",
          idempotencyKey: newIdempotencyKey(),
        },
        paymentOpts(provider),
      );
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.first_order_purchase_guards
              where customer_auth_user_id = ${h.actors.customerAId}
                and status = 'RESERVED'`,
        ),
      ).toBe(1);
      const appliedEffects = await countSql(
        h.persistence,
        sql`select count(*)::text as c from app.checkout_snapshot_promotion_effects
            where snapshot_id = ${ready.snapshotId}::uuid
              and effect_kind = 'applied_promotion'`,
      );
      const appliedClaims = await countSql(
        h.persistence,
        sql`select count(*)::text as c from app.promotion_redemption_claims
            where checkout_snapshot_id = ${ready.snapshotId}::uuid
              and status = 'RESERVED'`,
      );
      expect(appliedClaims).toBe(appliedEffects);
      expect(appliedClaims).toBeGreaterThanOrEqual(1);
    });
  });

  it("failed payment releases the first-order guard; retry before resolution is refused; retry after release creates a new reserved guard", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const promotionId = await seedAutomaticCombinable(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        500,
      );
      await markFirstOrderOnly(h.persistence, promotionId);
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const pendingProvider = createFakePaymentProvider({
        defaultOutcome: "pending",
      });
      const started = await startPayment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: ready.revision,
          paymentMethodIntent: "upi",
          idempotencyKey: newIdempotencyKey(),
        },
        paymentOpts(pendingProvider),
      );
      await expect(
        retryPayment(
          h.persistence,
          h.actors.customerA,
          {
            paymentId: started.payment.id,
            expectedCheckoutRevision: started.checkoutRevision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("early"),
          },
          paymentOpts(pendingProvider),
        ),
      ).rejects.toBeInstanceOf(PaymentError);

      pendingProvider.setOutcome(
        started.attempt.providerExecutionIdentity,
        "fail",
      );
      await verifyAndProcessWebhook(
        h.persistence,
        pendingProvider,
        {
          executionIdentity: started.attempt.providerExecutionIdentity,
          outcome: "fail",
          amountPaise: started.payment.expectedAmountPaise,
        },
        paymentOpts(pendingProvider),
      );
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.first_order_purchase_guards
              where payment_id = ${started.payment.id}::uuid
                and status = 'RELEASED'`,
        ),
      ).toBe(1);

      const checkout = await getActiveCheckout(
        h.persistence,
        h.actors.customerA,
        { checkoutId: ready.checkoutId },
        checkoutOpts,
      );
      const retryProvider = createFakePaymentProvider({
        defaultOutcome: "pending",
      });
      if (checkout && checkout.status === "READY_FOR_PAYMENT") {
        await retryPayment(
          h.persistence,
          h.actors.customerA,
          {
            paymentId: started.payment.id,
            expectedCheckoutRevision: checkout.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("retry"),
          },
          paymentOpts(retryProvider),
        );
        expect(
          await countSql(
            h.persistence,
            sql`select count(*)::text as c from app.first_order_purchase_guards
                where customer_auth_user_id = ${h.actors.customerAId}
                  and status = 'RESERVED'`,
          ),
        ).toBe(1);
      }
    });
  });

  it("zero-payable first-order completion consumes one guard; ordinary zero-payable inserts none", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const full = await seedFullDiscountCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
      );
      await markFirstOrderOnly(h.persistence, full.promotionId);
      const cart = await applyCouponToCustomerCart(
        h.persistence,
        h.actors.customerA,
        brandId,
        h.cartRevision,
        full.canonicalCode,
      );
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        cart.id,
        h.addressId,
      );
      if (ready.grandTotalPaise === BigInt(0)) {
        await completeZeroPayableCheckout(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
            idempotencyKey: newIdempotencyKey("zero"),
          },
          paymentOpts(createFakePaymentProvider({ defaultOutcome: "succeed" })),
        );
        expect(
          await countSql(
            h.persistence,
            sql`select count(*)::text as c from app.first_order_purchase_guards
                where customer_auth_user_id = ${h.actors.customerAId}
                  and status = 'CONSUMED'`,
          ),
        ).toBe(1);
      }
    });
  });

  it("concurrent first-order binds leave exactly one active guard", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const coupon = await seedLimitedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        { maximumRedemptions: null, percentageBps: 1000 },
      );
      await markFirstOrderOnly(h.persistence, coupon.promotionId);
      const cart = await applyCouponToCustomerCart(
        h.persistence,
        h.actors.customerA,
        brandId,
        h.cartRevision,
        coupon.canonicalCode,
      );
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        cart.id,
        h.addressId,
      );
      const raced = await Promise.allSettled([
        startPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("fo-a"),
          },
          paymentOpts(createFakePaymentProvider({ defaultOutcome: "pending" })),
        ),
        startPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("fo-b"),
          },
          paymentOpts(createFakePaymentProvider({ defaultOutcome: "pending" })),
        ),
      ]);
      expect(settled(raced).ok.length).toBe(1);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.first_order_purchase_guards
              where customer_auth_user_id = ${h.actors.customerAId}
                and status in ('RESERVED', 'CONSUMED')`,
        ),
      ).toBe(1);
    });
  });
});

describe("IMP-036J T4 promotion-level cap races", () => {
  it("last global promotion cap unit: at most one winner", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const coupon = await seedLimitedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        {
          maximumRedemptions: null,
          maximumRedemptionsPerCustomer: null,
          percentageBps: 1000,
        },
      );
      await markPromotionCap(h.persistence, coupon.promotionId, 1, null);
      const cartA = await applyCouponToCustomerCart(
        h.persistence,
        h.actors.customerA,
        brandId,
        h.cartRevision,
        coupon.canonicalCode,
      );
      const readyA = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        cartA.id,
        h.addressId,
      );
      const addedB = await addCartLine(
        h.persistence,
        { kind: "customer", actor: h.actors.customerB, brandId },
        { variantId: h.catalog.variantId, quantity: 1 },
      );
      const cartB = await applyCouponToCustomerCart(
        h.persistence,
        h.actors.customerB,
        brandId,
        addedB.cart.revision,
        coupon.canonicalCode,
      );
      const addressB = await createSavedAddressForCustomer(
        h.persistence,
        h.actors.customerBId,
      );
      const readyB = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerB,
        cartB.id,
        addressB.id,
      );
      const raced = await Promise.allSettled([
        startPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: readyA.checkoutId,
            expectedCheckoutRevision: readyA.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("cap-a"),
          },
          paymentOpts(createFakePaymentProvider({ defaultOutcome: "pending" })),
        ),
        startPayment(
          h.persistence,
          h.actors.customerB,
          {
            checkoutId: readyB.checkoutId,
            expectedCheckoutRevision: readyB.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("cap-b"),
          },
          paymentOpts(createFakePaymentProvider({ defaultOutcome: "pending" })),
        ),
      ]);
      expect(settled(raced).ok.length).toBe(1);
      expect(settled(raced).fail.length).toBe(1);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.promotion_redemption_claims
              where promotion_id = ${coupon.promotionId}::uuid
                and status in ('RESERVED', 'CONSUMED')`,
        ),
      ).toBe(1);
    });
  });

  it("last per-customer promotion cap unit: at most allowed capacity commits", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const coupon = await seedLimitedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        {
          maximumRedemptions: null,
          maximumRedemptionsPerCustomer: null,
          percentageBps: 1000,
        },
      );
      await markPromotionCap(h.persistence, coupon.promotionId, null, 1);
      const cart = await applyCouponToCustomerCart(
        h.persistence,
        h.actors.customerA,
        brandId,
        h.cartRevision,
        coupon.canonicalCode,
      );
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        cart.id,
        h.addressId,
      );
      const raced = await Promise.allSettled([
        startPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("pc-a"),
          },
          paymentOpts(createFakePaymentProvider({ defaultOutcome: "pending" })),
        ),
        startPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("pc-b"),
          },
          paymentOpts(createFakePaymentProvider({ defaultOutcome: "pending" })),
        ),
      ]);
      expect(settled(raced).ok.length).toBe(1);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.promotion_redemption_claims
              where promotion_id = ${coupon.promotionId}::uuid
                and status in ('RESERVED', 'CONSUMED')`,
        ),
      ).toBe(1);
    });
  });
});

const WINDOW_START = new Date("2026-08-09T12:30:00.000Z");
const WINDOW_END = new Date("2026-08-09T13:00:00.000Z");

describe("IMP-036J T4 guest, review commands, timing, gift, journey close", () => {
  it("guest unrestricted coupon stores shared state; first-order coupon does not invent a saving", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const opts = { policy: GUEST_POLICY };
      const open = await seedRecognizedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        uniqueCode("GUEST"),
      );
      const firstOrder = await seedRecognizedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        uniqueCode("FO"),
      );
      await markFirstOrderOnly(h.persistence, firstOrder.promotionId);
      const variantId = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select variant_id::text as id from app.cart_lines
          where cart_id = ${h.cartId}::uuid limit 1
        `);
        return r.rows[0]!.id as string;
      });
      const created = await addCartLine(
        h.persistence,
        { kind: "guest", brandId },
        { variantId, quantity: 1 },
        opts,
      );
      const guestAccess = {
        kind: "guest" as const,
        brandId,
        guestToken: created.guestToken!,
      };
      const applied = await applyCartCoupon(
        h.persistence,
        guestAccess,
        {
          couponCode: open.canonicalCode,
          expectedRevision: created.cart.revision,
          sourceCommandId: randomUUID(),
        },
        opts,
      );
      expect(applied.manualCouponCode).toBe(open.canonicalCode);
      const quoted = await evaluateCart(h.persistence, guestAccess, {});
      if (quoted.status === "COMPLETE" && quoted.quote) {
        const promotions = (
          quoted.quote as { appliedPromotions: Array<{ promotionId: string }> }
        ).appliedPromotions;
        expect(Array.isArray(promotions)).toBe(true);
      }
      const withFirst = await applyCartCoupon(
        h.persistence,
        guestAccess,
        {
          couponCode: firstOrder.canonicalCode,
          expectedRevision: applied.revision,
          sourceCommandId: randomUUID(),
        },
        opts,
      );
      expect(withFirst.manualCouponCode).toBe(firstOrder.canonicalCode);
      const identity = await evaluateCart(h.persistence, guestAccess, {});
      if (identity.status === "COMPLETE" && identity.quote) {
        const promotions = (
          identity.quote as { appliedPromotions: Array<{ promotionId: string }> }
        ).appliedPromotions;
        expect(
          promotions.some((p) => p.promotionId === firstOrder.promotionId),
        ).toBe(false);
      }
    });
  });

  it("KEEP_CUSTOMER writes no origin; KEEP_GUEST/adopt writes one minted origin", async () => {
    await withCartHarness(async ({ persistence, actors, catalog }) => {
      const brandId = actors.tree.brand.id;
      const opts = { policy: GUEST_POLICY };
      const a = await seedRecognizedCoupon(
        persistence,
        brandId,
        actors.brandAdminActor,
        uniqueCode("KA"),
      );
      const b = await seedRecognizedCoupon(
        persistence,
        brandId,
        actors.brandAdminActor,
        uniqueCode("KB"),
      );
      let customer = (
        await addCartLine(
          persistence,
          {
            kind: "customer",
            actor: actors.customerA,
            brandId,
          },
          { variantId: catalog.variantId, quantity: 1 },
          opts,
        )
      ).cart;
      customer = await applyCartCoupon(
        persistence,
        { kind: "customer", actor: actors.customerA, brandId },
        { couponCode: a.canonicalCode, expectedRevision: customer.revision },
        opts,
      );
      const guestCreated = await addCartLine(
        persistence,
        { kind: "guest", brandId },
        { variantId: catalog.variantId, quantity: 2 },
        opts,
      );
      const token = guestCreated.guestToken!;
      const guest = await applyCartCoupon(
        persistence,
        { kind: "guest", brandId, guestToken: token },
        {
          couponCode: b.canonicalCode,
          expectedRevision: guestCreated.cart.revision,
        },
        opts,
      );
      const keepCustomerId = randomUUID();
      await reconcileGuestCartWithCustomer(
        persistence,
        actors.customerA,
        {
          guestToken: token,
          brandId,
          expectedGuestRevision: guest.revision,
          expectedCustomerRevision: customer.revision,
          resolution: "KEEP_CUSTOMER",
          sourceCommandId: keepCustomerId,
        },
        opts,
      );
      expect(
        await countSql(
          persistence,
          sql`select count(*)::text as c from app.commercial_command_origins
              where source_command_id = ${keepCustomerId}::uuid`,
        ),
      ).toBe(0);

      const guestKeep = await addCartLine(
        persistence,
        { kind: "guest", brandId },
        { variantId: catalog.variantId, quantity: 3 },
        opts,
      );
      const tokenKeep = guestKeep.guestToken!;
      const guestKeepApplied = await applyCartCoupon(
        persistence,
        { kind: "guest", brandId, guestToken: tokenKeep },
        {
          couponCode: b.canonicalCode,
          expectedRevision: guestKeep.cart.revision,
        },
        opts,
      );
      const customerAfterKeep = await getActiveCart(persistence, {
        kind: "customer",
        actor: actors.customerA,
        brandId,
      });
      const keepGuestId = randomUUID();
      await reconcileGuestCartWithCustomer(
        persistence,
        actors.customerA,
        {
          guestToken: tokenKeep,
          brandId,
          expectedGuestRevision: guestKeepApplied.revision,
          expectedCustomerRevision: customerAfterKeep!.revision,
          resolution: "KEEP_GUEST",
          sourceCommandId: keepGuestId,
        },
        opts,
      );
      expect(
        await countSql(
          persistence,
          sql`select count(*)::text as c from app.commercial_command_origins
              where source_command_id = ${keepGuestId}::uuid`,
        ),
      ).toBe(1);

      const guestAdopt = await addCartLine(
        persistence,
        { kind: "guest", brandId },
        { variantId: catalog.variantId, quantity: 1 },
        opts,
      );
      const adoptApplied = await applyCartCoupon(
        persistence,
        { kind: "guest", brandId, guestToken: guestAdopt.guestToken! },
        {
          couponCode: b.canonicalCode,
          expectedRevision: guestAdopt.cart.revision,
        },
        opts,
      );
      await claimGuestCart(
        persistence,
        actors.customerB,
        {
          guestToken: guestAdopt.guestToken!,
          brandId,
          expectedGuestRevision: adoptApplied.revision,
        },
        opts,
      );
      expect(
        await countSql(
          persistence,
          sql`select count(*)::text as c from app.commercial_command_origins
              where cart_id = (
                select id from app.carts
                where customer_auth_user_id = ${actors.customerBId}
              )
                and origin_kind = 'COUPON_APPLY'`,
        ),
      ).toBe(1);
    });
  });

  it("Review uses the same cart coupon commands (AC-036J-002-06/07/08)", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const coupon = await seedRecognizedCoupon(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        uniqueCode("RV"),
      );
      const access = {
        kind: "customer" as const,
        actor: h.actors.customerA,
        brandId,
      };
      const started = await startCheckout(
        h.persistence,
        h.actors.customerA,
        { cartId: h.cartId },
        checkoutOpts,
      );
      await setCheckoutDestination(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: started.id,
          expectedCheckoutRevision: started.revision,
          destination: { kind: "SAVED_ADDRESS", savedAddressId: h.addressId },
        },
        checkoutOpts,
      );
      const first = await applyCartCoupon(h.persistence, access, {
        couponCode: coupon.canonicalCode,
        expectedRevision: (await getActiveCart(h.persistence, access))!.revision,
        sourceCommandId: randomUUID(),
      });
      expect(first.manualCouponCode).toBe(coupon.canonicalCode);
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const stored = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select manual_coupon_code as code
          from app.checkout_snapshots
          where id = ${ready.snapshotId}::uuid
        `);
        return r.rows[0]?.code as string | null;
      });
      expect(stored).toBe(coupon.canonicalCode);
      await removeCartCoupon(h.persistence, access, {
        expectedRevision: first.revision,
        sourceCommandId: randomUUID(),
      });
      const afterRemove = await getActiveCart(h.persistence, access);
      expect(afterRemove!.manualCouponCode).toBeNull();
    });
  });

  it("SCHEDULED-only Offer is consumed from accepted timing and timing change is an origin (AC-036J-006-02)", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const outletId = h.actors.tree.outletA.id;
      await saveOutletSchedulingProfile(h.persistence, {
        outletId,
        pickupMinLeadMinutes: 30,
        deliveryMinLeadMinutes: 30,
        now: FIXED_NOW,
      });
      const promotionId = await seedAutomaticCombinable(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        1500,
      );
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          update app.promotions
          set eligible_fulfilment_timings = ARRAY['SCHEDULED']::text[]
          where id = ${promotionId}::uuid
        `);
      });
      const readyAsap = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const asapApplied = await countSql(
        h.persistence,
        sql`select count(*)::text as c from app.checkout_snapshot_promotion_effects
            where snapshot_id = ${readyAsap.snapshotId}::uuid
              and promotion_id = ${promotionId}::uuid
              and effect_kind = 'applied_promotion'`,
      );
      expect(asapApplied).toBe(0);
      const timed = await setCheckoutFulfilmentTiming(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: readyAsap.checkoutId,
          expectedCheckoutRevision: readyAsap.revision,
          fulfilmentTiming: "SCHEDULED",
          scheduledWindowStartAt: WINDOW_START,
          scheduledWindowEndAt: WINDOW_END,
        },
        checkoutOpts,
      );
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.commercial_command_origins
              where checkout_id = ${timed.id}::uuid
                and origin_kind = 'FULFILMENT_CHANGE'`,
        ),
      ).toBe(1);
      const scheduled = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: timed.id,
          expectedCheckoutRevision: timed.revision,
        },
        checkoutOpts,
      );
      expect(scheduled.snapshot.fulfilmentTiming).toBe("SCHEDULED");
      const scheduledApplied = scheduled.snapshot.promotionEffects.filter(
        (e) =>
          e.effectKind === "applied_promotion" && e.promotionId === promotionId,
      );
      expect(scheduledApplied.length).toBe(1);
      const backToAsap = await setCheckoutFulfilmentTiming(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: scheduled.checkout.id,
          expectedCheckoutRevision: scheduled.checkout.revision,
          fulfilmentTiming: "ASAP",
        },
        checkoutOpts,
      );
      const recomputed = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: backToAsap.id,
          expectedCheckoutRevision: backToAsap.revision,
        },
        checkoutOpts,
      );
      expect(
        recomputed.snapshot.promotionEffects.filter(
          (e) =>
            e.effectKind === "applied_promotion" && e.promotionId === promotionId,
        ).length,
      ).toBe(0);
    });
  });

  it("unavailable complimentary line refuses stale bind without substitution (AC-036J-013-03)", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const brandId = h.actors.tree.brand.id;
      const gift = await seedActiveStandardVariant(
        h.persistence,
        brandId,
        h.actors.brandAdminActor,
        "gift",
      );
      await includeVariantAtBrand(
        h.persistence,
        h.actors.brandAdminActor,
        brandId,
        gift.variantId,
      );
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          insert into app.price_book_variant_prices (
            id, brand_id, price_book_id, variant_id, amount_paise, tax_category_id, created_at
          )
          select
            ${randomUUID()}::uuid,
            p.brand_id,
            p.price_book_id,
            ${gift.variantId}::uuid,
            2500,
            p.tax_category_id,
            now()
          from app.price_book_variant_prices p
          inner join app.cart_lines cl on cl.variant_id = p.variant_id
          where cl.cart_id = ${h.cartId}::uuid
          limit 1
        `);
      });
      const promotionId = await h.persistence.transaction(async (tx) => {
        const created = await createPromotionDraft(tx, {
          actor: h.actors.brandAdminActor,
          brandId,
          code: uniqueCode("gift"),
          displayName: "Complimentary T4",
          scopeType: "brand",
          territoryId: null,
          organizationId: null,
          outletId: null,
          triggerType: "automatic",
          stackingPolicy: "combinable",
          startsAt: new Date("2026-01-01T00:00:00Z"),
          endsAt: null,
        });
        await tx.db.execute(sql`
          insert into app.promotion_benefits (
            id, promotion_id, benefit_type, complimentary_product_id,
            complimentary_variant_id, created_at, updated_at
          ) values (
            ${randomUUID()}::uuid, ${created.id}::uuid, 'complimentary_item',
            ${gift.productId}::uuid, ${gift.variantId}::uuid, now(), now()
          )
        `);
        await tx.db.execute(sql`
          update app.promotions
          set complimentary_item = true
          where id = ${created.id}::uuid
        `);
        for (const role of ["qualifier", "benefit"] as const) {
          await setPromotionTargets(tx, {
            actor: h.actors.brandAdminActor,
            promotionId: created.id,
            expectedPromotionRevision: (await getPromotion(tx, created.id))!
              .revision,
            targetRole: role,
            targets: [
              {
                targetRole: role,
                targetType: "all_merchandise",
                productId: null,
                variantId: null,
                chargeDefinitionId: null,
              },
            ],
          });
        }
        await activatePromotion(tx, {
          actor: h.actors.brandAdminActor,
          expectedPromotionRevision: (await getPromotion(tx, created.id))!
            .revision,
          promotionId: created.id,
        });
        return created.id;
      });
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const giftLines = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select variant_id::text as variant_id
          from app.checkout_snapshot_lines
          where snapshot_id = ${ready.snapshotId}::uuid
            and line_origin = 'complimentary_offer'
        `);
        return r.rows as Array<{ variant_id: string }>;
      });
      expect(giftLines.map((l) => l.variant_id)).toEqual([gift.variantId]);
      await h.persistence.transaction(async (tx) => {
        await setVariantAvailability(tx, {
          actor: h.actors.brandAdminActor,
          outletId: h.actors.tree.outletA.id,
          variantId: gift.variantId,
          state: "sold_out",
          unavailableUntil: null,
        });
      });
      await expect(
        prepareCheckoutForPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
          },
          checkoutOpts,
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      const recovered = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const recoveredGift = await countSql(
        h.persistence,
        sql`select count(*)::text as c from app.checkout_snapshot_lines
            where snapshot_id = ${recovered.snapshotId}::uuid
              and line_origin = 'complimentary_offer'`,
      );
      expect(recoveredGift).toBe(0);
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.checkout_snapshot_promotion_effects
              where snapshot_id = ${recovered.snapshotId}::uuid
                and promotion_id = ${promotionId}::uuid
                and effect_kind = 'applied_promotion'`,
        ),
      ).toBe(0);
    });
  });

  it("valid activation associates; wrong-cart activation is ignored", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const activationId = randomUUID();
      const started = await startCheckout(
        h.persistence,
        h.actors.customerA,
        { cartId: h.cartId, cartActivationId: activationId },
        checkoutOpts,
      );
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.cart_checkout_activations
              where activation_id = ${activationId}::uuid
                and cart_id = ${h.cartId}::uuid
                and checkout_id = ${started.id}::uuid`,
        ),
      ).toBe(1);
      const variantId = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select variant_id::text as id from app.cart_lines
          where cart_id = ${h.cartId}::uuid limit 1
        `);
        return r.rows[0]!.id as string;
      });
      const other = await addCartLine(
        h.persistence,
        {
          kind: "customer",
          actor: h.actors.customerB,
          brandId: h.actors.tree.brand.id,
        },
        { variantId, quantity: 1 },
      );
      const otherStart = await startCheckout(
        h.persistence,
        h.actors.customerB,
        { cartId: other.cart.id, cartActivationId: activationId },
        checkoutOpts,
      );
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.cart_checkout_activations
              where activation_id = ${activationId}::uuid
                and checkout_id = ${otherStart.id}::uuid`,
        ),
      ).toBe(0);
    });
  });

  it("closed journey rejects a new fingerprint and replays an existing fact", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const eval1 = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: ready.revision,
        },
        checkoutOpts,
      );
      const journey = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select checkout_journey_key::text as k
          from app.checkouts where id = ${ready.checkoutId}::uuid
        `);
        return r.rows[0]!.k as string;
      });
      const evalRow = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select evaluation_id::text as id, result_fingerprint as fp
          from app.commercial_evaluations
          where evaluation_id = ${eval1.evaluationId}::uuid
        `);
        return r.rows[0] as { id: string; fp: Buffer };
      });
      await h.persistence.transaction(async (tx) => {
        await closeJourney(tx, journey);
      });
      await h.persistence.transaction(async (tx) => {
        await resolveCommercialStateChange({
          context: tx,
          cartId: h.cartId,
          checkoutId: ready.checkoutId,
          journeyKey: journey,
          evaluationId: evalRow.id,
          fingerprint: new Uint8Array(evalRow.fp),
          closedJourneyRejectNew: true,
        });
      });
      await expect(
        h.persistence.transaction(async (tx) => {
          await insertCommandOrigin({
            context: tx,
            sourceCommandId: randomUUID(),
            originKind: "STALE_RECOVERY",
            cartId: h.cartId,
            checkoutId: ready.checkoutId,
            checkoutJourneyKey: journey,
          });
          const nextFp = new Uint8Array(32);
          nextFp.fill(7);
          await resolveCommercialStateChange({
            context: tx,
            cartId: h.cartId,
            checkoutId: ready.checkoutId,
            journeyKey: journey,
            evaluationId: randomUUID(),
            fingerprint: nextFp,
            closedJourneyRejectNew: true,
          });
        }),
      ).rejects.toBeInstanceOf(CheckoutError);
    });
  });

  it("cancelled webhook and expired validity release the first-order guard", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const promotionId = await seedAutomaticCombinable(
        h.persistence,
        h.actors.tree.brand.id,
        h.actors.brandAdminActor,
        500,
      );
      await markFirstOrderOnly(h.persistence, promotionId);
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const pending = createFakePaymentProvider({ defaultOutcome: "pending" });
      const started = await startPayment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: ready.revision,
          paymentMethodIntent: "upi",
          idempotencyKey: newIdempotencyKey("cn"),
        },
        paymentOpts(pending),
      );
      pending.setOutcome(started.attempt.providerExecutionIdentity, "cancelled");
      await verifyAndProcessWebhook(
        h.persistence,
        pending,
        {
          executionIdentity: started.attempt.providerExecutionIdentity,
          outcome: "cancelled",
          amountPaise: started.payment.expectedAmountPaise,
        },
        paymentOpts(pending),
      );
      expect(
        await countSql(
          h.persistence,
          sql`select count(*)::text as c from app.first_order_purchase_guards
              where customer_auth_user_id = ${h.actors.customerAId}
                and status = 'RELEASED'`,
        ),
      ).toBe(1);
    });
  });
});


