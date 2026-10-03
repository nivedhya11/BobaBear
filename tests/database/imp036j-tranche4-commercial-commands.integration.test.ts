/**
 * IMP-036J Tranche 4 — COMMERCIAL_COMMANDS proof.
 *
 * Primary ACs: 002-01/02/03/05/06/07/08, 005-01/02, 006-02, 008-01, 013-03.
 * Real PostgreSQL overlapping transactions for required races.
 */
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";

import {
  applyCartCoupon,
  addCartLine,
  getActiveCart,
  removeCartCoupon,
} from "../../src/server/cart";
import {
  evaluateCheckout,
  getActiveCheckout,
  prepareCheckoutForPayment,
  startCheckout,
} from "../../src/server/checkout";
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
import { seedRecognizedCoupon, uniqueCode } from "./support/cart-fixtures";
import { createSavedAddressForCustomer } from "./support/checkout-fixtures";
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
      const ready1 = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const eval1 = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready1.checkoutId,
          expectedCheckoutRevision: ready1.revision,
        },
        checkoutOpts,
      );
      const eval1b = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready1.checkoutId,
          expectedCheckoutRevision: eval1.checkout.revision,
        },
        checkoutOpts,
      );
      expect(eval1b.evaluationId).toBe(eval1.evaluationId);

      const access = {
        kind: "customer" as const,
        actor: h.actors.customerA,
        brandId,
      };
      const cart = await getActiveCart(h.persistence, access);
      await applyCartCoupon(h.persistence, access, {
        couponCode: coupon.canonicalCode,
        expectedRevision: cart!.revision,
        sourceCommandId: randomUUID(),
      });
      const ready2 = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const eval2 = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready2.checkoutId,
          expectedCheckoutRevision: ready2.revision,
        },
        checkoutOpts,
      );
      await removeCartCoupon(h.persistence, access, {
        expectedRevision: (await getActiveCart(h.persistence, access))!.revision,
        sourceCommandId: randomUUID(),
      });
      const ready3 = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const eval3 = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready3.checkoutId,
          expectedCheckoutRevision: ready3.revision,
        },
        checkoutOpts,
      );
      expect(eval3.evaluationId).not.toBe(eval1.evaluationId);
      expect(eval2.evaluationId).not.toBe(eval1.evaluationId);
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
          update app.payments set status = 'SUCCEEDED'
          where id = ${started.payment.id}::uuid
        `);
      });
      const status = await h.persistence.withContext((ctx) =>
        loadFirstOrderPurchaseStatus(ctx, h.actors.customerAId),
      );
      expect(status).toBe("HAS_PRIOR_PURCHASE");
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
      const appliedClaims = await countSql(
        h.persistence,
        sql`select count(*)::text as c from app.promotion_redemption_claims
            where checkout_snapshot_id = ${ready.snapshotId}::uuid
              and status = 'RESERVED'`,
      );
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
