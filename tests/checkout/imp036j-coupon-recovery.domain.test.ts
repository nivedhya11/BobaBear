/**
 * IMP-036J Founder UAT remediation — #383 definitive coupon ineligibility on Checkout.
 * Isolated fixtures only; no staging mutation.
 */
import { afterEach, describe, expect, it } from "vitest";

import { applyCartCoupon, type CustomerActor } from "../../src/server/cart";
import {
  evaluateCheckout,
  prepareCheckoutForPayment,
  setCheckoutDestination,
  setCheckoutFulfilment,
  startCheckout,
} from "../../src/server/checkout";
import { isDefinitiveSubmittedCouponOutcome } from "../../src/server/checkout/adapters/pricing";
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
import { upsertOutletPickupProfile } from "../../src/server/outlet-pickup-profile/repository";
import { uniqueCode } from "../database/support/cart-fixtures";

type SubmittedCouponWire = Readonly<{
  status: string;
  reasonCode: string;
  canonicalCode: string | null;
}>;

function submittedFromEvaluation(quote: unknown): SubmittedCouponWire | null {
  if (!quote || typeof quote !== "object") return null;
  const explanation = (quote as { commercialExplanation?: unknown }).commercialExplanation;
  if (!explanation || typeof explanation !== "object") return null;
  const submitted = (explanation as { submittedCouponResult?: unknown }).submittedCouponResult;
  if (!submitted || typeof submitted !== "object") return null;
  const row = submitted as Record<string, unknown>;
  return {
    status: String(row.status ?? ""),
    reasonCode: String(row.reasonCode ?? ""),
    canonicalCode: typeof row.canonicalCode === "string" ? row.canonicalCode : null,
  };
}
import {
  CHECKOUT_PIN,
  checkoutOpts,
  closeTrackedPersistenceHandles,
  seedChargePricesOnBook,
  withCheckoutReadyHarness,
} from "../database/support/checkout-fixtures";
import { configureAlwaysAcceptingOutlet } from "../database/support/serviceability-fixtures";

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

function customerAccess(actor: CustomerActor, brandId: string) {
  return { kind: "customer" as const, actor, brandId };
}

async function seedEnabledPickupProfile(
  persistence: Parameters<typeof withCheckoutReadyHarness>[0] extends (
    h: infer H,
  ) => unknown
    ? H extends { persistence: infer P }
      ? P
      : never
    : never,
  outletId: string,
): Promise<void> {
  await persistence.transaction(async (tx) => {
    await upsertOutletPickupProfile(tx, {
      outletId,
      enabled: true,
      displayName: "Pickup Counter",
      addressLine1: "12 Mall Road",
      addressLine2: null,
      locality: "Rajpur",
      city: "Dehradun",
      stateCode: "IN-UT",
      postalCode: CHECKOUT_PIN,
      latitude: null,
      longitude: null,
      instructions: "Ask at counter for BOBA order.",
    });
  });
}

async function attachCharges(
  persistence: Parameters<typeof seedChargePricesOnBook>[0],
  brandId: string,
): Promise<void> {
  const { sql } = await import("drizzle-orm");
  await persistence.withContext(async (ctx) => {
    const book = await ctx.db.execute(sql`
      select id::text as id from app.price_books
      where brand_id = ${brandId}::uuid
        and lifecycle_status = 'active'
      limit 1
    `);
    const priceBookId = book.rows[0]!.id as string;
    await seedChargePricesOnBook(persistence, {
      brandId,
      priceBookId,
      packagingPaise: BigInt(2_000),
      deliveryPaise: BigInt(4_000),
    });
  });
}

async function seedModeRestrictedCoupon(
  persistence: Parameters<typeof withCheckoutReadyHarness>[0] extends (
    h: infer H,
  ) => unknown
    ? H extends { persistence: infer P }
      ? P
      : never
    : never,
  brandId: string,
  actor: unknown,
  canonicalCode: string,
  modes: readonly ("DELIVERY" | "PICKUP")[],
): Promise<{ promotionId: string; couponId: string; canonicalCode: string }> {
  return persistence.transaction(async (tx) => {
    const created = await createPromotionDraft(tx, {
      actor,
      brandId,
      code: uniqueCode("mode"),
      displayName: `Mode ${modes.join("+")} coupon`,
      scopeType: "brand",
      territoryId: null,
      organizationId: null,
      outletId: null,
      triggerType: "coupon",
      stackingPolicy: "exclusive",
      startsAt: new Date("2026-01-01T00:00:00Z"),
      endsAt: null,
      eligibleFulfilmentModes: modes,
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
    const merch = {
      targetType: "all_merchandise" as const,
      productId: null,
      variantId: null,
      chargeDefinitionId: null,
    };
    await setPromotionTargets(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
      targetRole: "qualifier",
      targets: [{ targetRole: "qualifier", ...merch }],
    });
    await setPromotionTargets(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
      targetRole: "benefit",
      targets: [{ targetRole: "benefit", ...merch }],
    });
    await activatePromotion(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
    });
    const coupon = await createCouponDraft(tx, {
      actor,
      promotionId: created.id,
      origin: "manual",
      canonicalCode,
    });
    await activateCoupon(tx, {
      actor,
      couponId: coupon.id,
      expectedCouponRevision: (await getCoupon(tx, coupon.id))!.revision,
    });
    return {
      promotionId: created.id,
      couponId: coupon.id,
      canonicalCode: coupon.canonicalCode,
    };
  });
}

describe("isDefinitiveSubmittedCouponOutcome (#383 contract)", () => {
  it("treats finished ineligible statuses as definitive and enforcement gaps as indeterminate", () => {
    expect(
      isDefinitiveSubmittedCouponOutcome({
        status: "NOT_APPLICABLE",
        reasonCode: "FULFILMENT_MODE_MISMATCH",
        couponId: "c",
        promotionId: "p",
        canonicalCode: "TEST123",
      }),
    ).toBe(true);
    expect(
      isDefinitiveSubmittedCouponOutcome({
        status: "INVALID",
        reasonCode: "COUPON_NOT_EFFECTIVE",
        couponId: "c",
        promotionId: "p",
        canonicalCode: "OLD",
      }),
    ).toBe(true);
    expect(
      isDefinitiveSubmittedCouponOutcome({
        status: "REDEMPTION_ENFORCEMENT_UNAVAILABLE",
        reasonCode: "REDEMPTION_ENFORCEMENT_UNAVAILABLE",
        couponId: "c",
        promotionId: "p",
        canonicalCode: "CAP",
      }),
    ).toBe(false);
  });
});

describe("IMP-036J #383 delivery/pickup coupon recovery", () => {
  it("DELIVERY-only coupon on PICKUP finishes as inapplicable without discount or hard fail", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const { persistence, actors, cartId } = harness;
      const brandId = actors.tree.brand.id;
      const access = customerAccess(actors.customerA, brandId);
      const opts = checkoutOpts();
      await attachCharges(persistence, brandId);
      await seedEnabledPickupProfile(persistence, actors.tree.outletA.id);
      await configureAlwaysAcceptingOutlet(
        persistence,
        actors.brandAdminActor,
        actors.tree.outletA.id,
      );

      const deliveryOnly = await seedModeRestrictedCoupon(
        persistence,
        brandId,
        actors.brandAdminActor,
        "TEST123",
        ["DELIVERY"],
      );
      const cart = await applyCartCoupon(persistence, access, {
        couponCode: deliveryOnly.canonicalCode,
        expectedRevision: BigInt(1),
      });
      expect(cart.manualCouponCode).toBe("TEST123");

      let checkout = await startCheckout(
        persistence,
        actors.customerA,
        { cartId },
        opts,
      );
      checkout = await setCheckoutFulfilment(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
          fulfilmentMode: "PICKUP",
          pickupOutletId: actors.tree.outletA.id,
        },
        opts,
      );

      // Frozen main threw CHECKOUT_COUPON_INELIGIBLE here (issue #383). After fix,
      // evaluate completes with definitive FULFILMENT_MODE_MISMATCH on the quote.
      const evaluated = await evaluateCheckout(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
        },
        opts,
      );

      expect(evaluated.checkout.status).toBe("READY_FOR_PAYMENT");
      expect(evaluated.snapshot.promotionDiscountPaise).toBe(BigInt(0));
      expect(
        evaluated.snapshot.promotionEffects.filter(
          (effect) => effect.couponId === deliveryOnly.couponId,
        ),
      ).toHaveLength(0);
      expect(submittedFromEvaluation(evaluated.quote)).toEqual(
        expect.objectContaining({
          status: "NOT_APPLICABLE",
          reasonCode: "FULFILMENT_MODE_MISMATCH",
          canonicalCode: "TEST123",
        }),
      );

      const still = await persistence.withContext(async (ctx) => {
        const { sql } = await import("drizzle-orm");
        const r = await ctx.db.execute(sql`
          select manual_coupon_code from app.carts where id = ${cartId}::uuid
        `);
        return r.rows[0]?.manual_coupon_code as string | null;
      });
      expect(still).toBe("TEST123");

      const prepared = await prepareCheckoutForPayment(
        persistence,
        actors.customerA,
        {
          checkoutId: evaluated.checkout.id,
          expectedCheckoutRevision: evaluated.checkout.revision,
        },
        opts,
      );
      expect(prepared.snapshot.promotionDiscountPaise).toBe(BigInt(0));
      expect(
        prepared.snapshot.promotionEffects.filter(
          (effect) => effect.couponId === deliveryOnly.couponId,
        ),
      ).toHaveLength(0);
    });
  });

  it("DELIVERY-only coupon on DELIVERY applies saving; PICKUP-only on DELIVERY is inapplicable", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const { persistence, actors, cartId, addressId } = harness;
      const brandId = actors.tree.brand.id;
      const access = customerAccess(actors.customerA, brandId);
      const opts = checkoutOpts();
      await attachCharges(persistence, brandId);

      const deliveryOnly = await seedModeRestrictedCoupon(
        persistence,
        brandId,
        actors.brandAdminActor,
        "DELONLY1",
        ["DELIVERY"],
      );
      let cart = await applyCartCoupon(persistence, access, {
        couponCode: deliveryOnly.canonicalCode,
        expectedRevision: BigInt(1),
      });
      let checkout = await startCheckout(
        persistence,
        actors.customerA,
        { cartId },
        opts,
      );
      checkout = await setCheckoutDestination(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
          destination: { kind: "SAVED_ADDRESS", savedAddressId: addressId },
        },
        opts,
      );
      const onDelivery = await evaluateCheckout(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
        },
        opts,
      );
      expect(onDelivery.checkout.status).toBe("READY_FOR_PAYMENT");
      expect(onDelivery.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      expect(submittedFromEvaluation(onDelivery.quote)?.status).toBe("APPLIED");

      const pickupOnly = await seedModeRestrictedCoupon(
        persistence,
        brandId,
        actors.brandAdminActor,
        "PICKONLY1",
        ["PICKUP"],
      );
      await applyCartCoupon(persistence, access, {
        couponCode: pickupOnly.canonicalCode,
        expectedRevision: cart.revision,
      });
      checkout = await startCheckout(
        persistence,
        actors.customerA,
        { cartId },
        opts,
      );
      checkout = await setCheckoutDestination(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
          destination: { kind: "SAVED_ADDRESS", savedAddressId: addressId },
        },
        opts,
      );
      const onDeliveryWithPickupCoupon = await evaluateCheckout(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
        },
        opts,
      );
      expect(onDeliveryWithPickupCoupon.snapshot.promotionDiscountPaise).toBe(
        BigInt(0),
      );
      expect(submittedFromEvaluation(onDeliveryWithPickupCoupon.quote)).toEqual(
        expect.objectContaining({
          status: "NOT_APPLICABLE",
          reasonCode: "FULFILMENT_MODE_MISMATCH",
          canonicalCode: "PICKONLY1",
        }),
      );
    });
  });

  it("DELIVERY → PICKUP → DELIVERY recomputes from one cart coupon without sealing ineligible benefits", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const { persistence, actors, cartId, addressId } = harness;
      const brandId = actors.tree.brand.id;
      const access = customerAccess(actors.customerA, brandId);
      const opts = checkoutOpts();
      await attachCharges(persistence, brandId);
      await seedEnabledPickupProfile(persistence, actors.tree.outletA.id);
      await configureAlwaysAcceptingOutlet(
        persistence,
        actors.brandAdminActor,
        actors.tree.outletA.id,
      );

      const deliveryOnly = await seedModeRestrictedCoupon(
        persistence,
        brandId,
        actors.brandAdminActor,
        "MODEFLIP1",
        ["DELIVERY"],
      );
      await applyCartCoupon(persistence, access, {
        couponCode: deliveryOnly.canonicalCode,
        expectedRevision: BigInt(1),
      });

      let checkout = await startCheckout(
        persistence,
        actors.customerA,
        { cartId },
        opts,
      );
      checkout = await setCheckoutDestination(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
          destination: { kind: "SAVED_ADDRESS", savedAddressId: addressId },
        },
        opts,
      );
      const deliveryReady = await evaluateCheckout(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
        },
        opts,
      );
      expect(deliveryReady.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      const deliveryPayable = deliveryReady.snapshot.grandTotalPaise;

      checkout = await setCheckoutFulfilment(
        persistence,
        actors.customerA,
        {
          checkoutId: deliveryReady.checkout.id,
          expectedCheckoutRevision: deliveryReady.checkout.revision,
          fulfilmentMode: "PICKUP",
          pickupOutletId: actors.tree.outletA.id,
        },
        opts,
      );
      const pickupReady = await evaluateCheckout(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
        },
        opts,
      );
      expect(pickupReady.snapshot.promotionDiscountPaise).toBe(BigInt(0));
      expect(submittedFromEvaluation(pickupReady.quote)?.reasonCode).toBe(
        "FULFILMENT_MODE_MISMATCH",
      );
      expect(pickupReady.snapshot.grandTotalPaise).not.toBe(deliveryPayable);

      checkout = await setCheckoutFulfilment(
        persistence,
        actors.customerA,
        {
          checkoutId: pickupReady.checkout.id,
          expectedCheckoutRevision: pickupReady.checkout.revision,
          fulfilmentMode: "DELIVERY",
          pickupOutletId: null,
        },
        opts,
      );
      checkout = await setCheckoutDestination(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
          destination: { kind: "SAVED_ADDRESS", savedAddressId: addressId },
        },
        opts,
      );
      const backToDelivery = await evaluateCheckout(
        persistence,
        actors.customerA,
        {
          checkoutId: checkout.id,
          expectedCheckoutRevision: checkout.revision,
        },
        opts,
      );
      expect(backToDelivery.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      expect(submittedFromEvaluation(backToDelivery.quote)?.status).toBe("APPLIED");
      expect(backToDelivery.snapshot.grandTotalPaise).toBe(deliveryPayable);

      const still = await persistence.withContext(async (ctx) => {
        const { sql } = await import("drizzle-orm");
        const r = await ctx.db.execute(sql`
          select manual_coupon_code from app.carts where id = ${cartId}::uuid
        `);
        return r.rows[0]?.manual_coupon_code as string | null;
      });
      expect(still).toBe("MODEFLIP1");
    });
  });
});
