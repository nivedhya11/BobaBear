/**
 * Payment binding must revalidate sealed commercial terms with the snapshot's
 * fulfilment timing. An unchanged timing-eligible promotion stays bindable.
 * A timing-ineligible promotion, a promotion revision change at the same
 * payable total, and a genuine price change stay rejected. No provider call
 * and no Payment row are created for a rejected bind.
 *
 * Disposable Testcontainers and the fake provider only. This does not prove
 * any historical staging failure.
 */
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";

import {
  evaluateCheckout,
  prepareCheckoutForPayment,
  setCheckoutDestination,
  setCheckoutFulfilmentTiming,
  startCheckout,
} from "../../src/server/checkout";
import type { CheckoutPrepareDiagnosticObservation } from "../../src/server/checkout/prepare-diagnostic";
import { startPayment } from "../../src/server/payment";
import {
  activateCoupon,
  activatePromotion,
  createCouponDraft,
  createPromotionDraft,
  getCoupon,
  getPromotion,
  setPromotionBenefit,
  setPromotionTargets,
} from "../../src/server/promotions";
import { saveOutletSchedulingProfile } from "../../src/server/scheduled-fulfilment/foundations";
import { uniqueCode } from "../database/support/cart-fixtures";
import {
  checkoutOpts,
  closeTrackedPersistenceHandles,
  FIXED_NOW,
  withCheckoutReadyHarness,
  type CheckoutReadyHarness,
} from "../database/support/checkout-fixtures";
import {
  applyCouponToCustomerCart,
  CHECKOUT_POLICY,
  createFakePaymentProvider,
  newIdempotencyKey,
  PAYMENT_POLICY,
} from "../database/support/payment-fixtures";

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

const WINDOW_START = new Date("2026-08-09T12:30:00.000Z");
const WINDOW_END = new Date("2026-08-09T13:00:00.000Z");

type Timing = "ASAP" | "SCHEDULED";

async function seedTimingScopedCoupon(
  persistence: CheckoutReadyHarness["persistence"],
  brandId: string,
  actor: unknown,
  timing: Timing,
) {
  const canonicalCode = uniqueCode("TIME");
  return persistence.transaction(async (tx) => {
    const created = await createPromotionDraft(tx, {
      actor,
      brandId,
      code: uniqueCode("timepromo"),
      displayName: `${timing} payment binding coupon`,
      scopeType: "brand",
      territoryId: null,
      organizationId: null,
      outletId: null,
      triggerType: "coupon",
      stackingPolicy: "exclusive",
      startsAt: new Date("2026-01-01T00:00:00Z"),
      endsAt: null,
      eligibleFulfilmentTimings: [timing],
    });
    await setPromotionBenefit(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
      benefit: {
        benefitType: "percentage_discount",
        percentageBps: 1000,
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
    const coupon = await createCouponDraft(tx, {
      actor,
      promotionId: created.id,
      origin: "manual",
      canonicalCode,
      maximumRedemptions: null,
      maximumRedemptionsPerCustomer: null,
    });
    await activateCoupon(tx, {
      actor,
      expectedCouponRevision: (await getCoupon(tx, coupon.id))!.revision,
      couponId: coupon.id,
    });
    return {
      promotionId: created.id,
      couponId: coupon.id,
      canonicalCode: coupon.canonicalCode,
    };
  });
}

async function readyCheckout(
  h: CheckoutReadyHarness,
  checkoutTiming: Timing,
  promotionTiming: Timing,
) {
  const coupon = await seedTimingScopedCoupon(
    h.persistence,
    h.actors.tree.brand.id,
    h.actors.brandAdminActor,
    promotionTiming,
  );
  await applyCouponToCustomerCart(
    h.persistence,
    h.actors.customerA,
    h.actors.tree.brand.id,
    h.cartRevision,
    coupon.canonicalCode,
  );
  if (checkoutTiming === "SCHEDULED") {
    await saveOutletSchedulingProfile(h.persistence, {
      outletId: h.actors.tree.outletA.id,
      pickupMinLeadMinutes: 30,
      deliveryMinLeadMinutes: 30,
      now: FIXED_NOW,
    });
  }
  const opts = checkoutOpts();
  let checkout = await startCheckout(
    h.persistence,
    h.actors.customerA,
    { cartId: h.cartId },
    opts,
  );
  checkout = await setCheckoutDestination(
    h.persistence,
    h.actors.customerA,
    {
      checkoutId: checkout.id,
      expectedCheckoutRevision: checkout.revision,
      destination: { kind: "SAVED_ADDRESS", savedAddressId: h.addressId },
    },
    opts,
  );
  if (checkoutTiming === "SCHEDULED") {
    checkout = await setCheckoutFulfilmentTiming(
      h.persistence,
      h.actors.customerA,
      {
        checkoutId: checkout.id,
        expectedCheckoutRevision: checkout.revision,
        fulfilmentTiming: "SCHEDULED",
        scheduledWindowStartAt: WINDOW_START,
        scheduledWindowEndAt: WINDOW_END,
      },
      opts,
    );
  }
  const ready = await evaluateCheckout(
    h.persistence,
    h.actors.customerA,
    { checkoutId: checkout.id, expectedCheckoutRevision: checkout.revision },
    opts,
  );
  return { coupon, ready };
}

function paymentOptions(
  provider: ReturnType<typeof createFakePaymentProvider>,
  observations?: CheckoutPrepareDiagnosticObservation[],
) {
  return {
    clock: { now: () => new Date(FIXED_NOW.getTime()) },
    policy: PAYMENT_POLICY,
    checkoutPolicy: CHECKOUT_POLICY,
    provider,
    prepareDiagnosticObserver: observations
      ? (observation: CheckoutPrepareDiagnosticObservation) => {
          observations.push(observation);
        }
      : undefined,
  };
}

async function paymentFootprint(
  h: CheckoutReadyHarness,
  checkoutId: string,
) {
  return h.persistence.withContext(async (ctx) => {
    const result = await ctx.db.execute(sql`
      select
        (select count(*) from app.payments p
          join app.checkout_snapshots s on s.id = p.checkout_snapshot_id
          where s.checkout_id = ${checkoutId}::uuid)::int as payments,
        (select count(*) from app.payment_attempts a
          join app.payments p on p.id = a.payment_id
          join app.checkout_snapshots s on s.id = p.checkout_snapshot_id
          where s.checkout_id = ${checkoutId}::uuid)::int as attempts,
        (select status from app.checkouts where id = ${checkoutId}::uuid) as status
    `);
    return result.rows[0] as {
      payments: number;
      attempts: number;
      status: string;
    };
  });
}

describe("payment binding fulfilment timing", () => {
  it("binds an unchanged ASAP snapshot when its promotion is eligible for ASAP", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const { coupon, ready } = await readyCheckout(h, "ASAP", "ASAP");
      expect(ready.snapshot.fulfilmentTiming).toBe("ASAP");
      expect(ready.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      expect(
        ready.snapshot.promotionEffects.some(
          (effect) => effect.promotionId === coupon.promotionId,
        ),
      ).toBe(true);

      const prepared = await prepareCheckoutForPayment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: ready.checkout.revision,
        },
        checkoutOpts(),
      );
      expect(prepared.snapshot.id).toBe(ready.snapshot.id);

      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const input = {
        checkoutId: ready.checkout.id,
        expectedCheckoutRevision: ready.checkout.revision,
        paymentMethodIntent: "upi" as const,
        idempotencyKey: newIdempotencyKey("asap-bind"),
      };
      const started = await startPayment(
        h.persistence,
        h.actors.customerA,
        input,
        paymentOptions(provider),
      );
      expect(started.kind).toBe("payment_started");
      expect(started.payment.checkoutSnapshotId).toBe(ready.snapshot.id);
      expect(started.payment.expectedAmountPaise).toBe(
        ready.snapshot.grandTotalPaise,
      );
      expect(provider.createExecutionCallCount).toBe(1);

      const replay = await startPayment(
        h.persistence,
        h.actors.customerA,
        input,
        paymentOptions(provider),
      );
      expect(replay.payment.id).toBe(started.payment.id);
      expect(replay.attempt.id).toBe(started.attempt.id);
      expect(provider.createExecutionCallCount).toBe(1);
      expect(await paymentFootprint(h, ready.checkout.id)).toEqual({
        payments: 1,
        attempts: 1,
        status: "PAYMENT_PENDING",
      });
    });
  });

  it("binds an unchanged Scheduled snapshot when its promotion is eligible for Scheduled", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const { coupon, ready } = await readyCheckout(h, "SCHEDULED", "SCHEDULED");
      expect(ready.snapshot.fulfilmentTiming).toBe("SCHEDULED");
      expect(ready.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      expect(
        ready.snapshot.promotionEffects.some(
          (effect) => effect.promotionId === coupon.promotionId,
        ),
      ).toBe(true);

      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const started = await startPayment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: ready.checkout.revision,
          paymentMethodIntent: "upi",
          idempotencyKey: newIdempotencyKey("sched-bind"),
        },
        paymentOptions(provider),
      );
      expect(started.payment.checkoutSnapshotId).toBe(ready.snapshot.id);
      expect(started.payment.expectedAmountPaise).toBe(
        ready.snapshot.grandTotalPaise,
      );
      expect(provider.createExecutionCallCount).toBe(1);
      expect(await paymentFootprint(h, ready.checkout.id)).toEqual({
        payments: 1,
        attempts: 1,
        status: "PAYMENT_PENDING",
      });
    });
  });

  it("does not apply a timing-ineligible promotion and still binds the sealed snapshot", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const { coupon, ready } = await readyCheckout(h, "ASAP", "SCHEDULED");
      expect(ready.snapshot.promotionDiscountPaise).toBe(BigInt(0));
      expect(
        ready.snapshot.promotionEffects.some(
          (effect) => effect.promotionId === coupon.promotionId,
        ),
      ).toBe(false);

      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const started = await startPayment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkout.id,
          expectedCheckoutRevision: ready.checkout.revision,
          paymentMethodIntent: "upi",
          idempotencyKey: newIdempotencyKey("ineligible-bind"),
        },
        paymentOptions(provider),
      );
      expect(started.payment.expectedAmountPaise).toBe(
        ready.snapshot.grandTotalPaise,
      );
      expect(started.payment.checkoutSnapshotId).toBe(ready.snapshot.id);
      expect(provider.createExecutionCallCount).toBe(1);
      expect(await paymentFootprint(h, ready.checkout.id)).toMatchObject({
        payments: 1,
        attempts: 1,
      });
    });
  });

  it("rejects payment when the sealed promotion is no longer eligible for that timing", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const { coupon, ready } = await readyCheckout(h, "ASAP", "ASAP");
      expect(ready.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      const sealedPayable = ready.snapshot.grandTotalPaise;
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          update app.promotions
          set eligible_fulfilment_timings = array['SCHEDULED']::text[]
          where id = ${coupon.promotionId}::uuid
        `);
      });
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      await expect(
        startPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("timing-lost"),
          },
          paymentOptions(provider, observations),
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      expect(observations).toEqual([
        expect.objectContaining({
          rejectionStage: "STRUCTURAL",
          payableChanged: true,
        }),
      ]);
      expect(sealedPayable).toBe(ready.snapshot.grandTotalPaise);
      expect(provider.createExecutionCallCount).toBe(0);
      expect(await paymentFootprint(h, ready.checkout.id)).toEqual({
        payments: 0,
        attempts: 0,
        status: "DRAFT",
      });
    });
  });

  it("rejects a promotion revision change when the payable total is unchanged", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const { coupon, ready } = await readyCheckout(h, "ASAP", "ASAP");
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          update app.promotions
          set revision = revision + 1
          where id = ${coupon.promotionId}::uuid
        `);
      });
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      await expect(
        startPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("rev-same-pay"),
          },
          paymentOptions(provider, observations),
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      expect(observations).toEqual([
        expect.objectContaining({
          rejectionStage: "STRUCTURAL",
          firstDifferenceCategory: "PROMOTION_EFFECT",
          payableChanged: false,
        }),
      ]);
      expect(provider.createExecutionCallCount).toBe(0);
      expect(await paymentFootprint(h, ready.checkout.id)).toEqual({
        payments: 0,
        attempts: 0,
        status: "DRAFT",
      });
    });
  });

  it("rejects a genuine price change and does not call the provider", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const { ready } = await readyCheckout(h, "ASAP", "ASAP");
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          update app.price_book_variant_prices
          set amount_paise = amount_paise + 100
          where variant_id = ${h.catalog.variantId}::uuid
        `);
      });
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      await expect(
        startPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("reprice"),
          },
          paymentOptions(provider, observations),
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      expect(observations).toEqual([
        expect.objectContaining({
          rejectionStage: "STRUCTURAL",
          payableChanged: true,
        }),
      ]);
      expect(provider.createExecutionCallCount).toBe(0);
      expect(await paymentFootprint(h, ready.checkout.id)).toEqual({
        payments: 0,
        attempts: 0,
        status: "DRAFT",
      });
    });
  });
});
