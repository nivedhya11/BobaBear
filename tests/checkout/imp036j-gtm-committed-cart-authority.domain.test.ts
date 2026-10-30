/**
 * IMP-036J GTM closure (#383 / #384A regression) — committed Cart coupon intent is the
 * authority; an earlier evaluated quote cannot be prepared for payment once the Cart
 * coupon changes, across Delivery and Takeaway (PICKUP).
 * Isolated Testcontainers fixtures only; no staging mutation.
 */
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";

import { applyCartCoupon, removeCartCoupon, type CustomerActor } from "../../src/server/cart";
import {
  evaluateCheckout,
  getActiveCheckout,
  prepareCheckoutForPayment,
  setCheckoutDestination,
  setCheckoutFulfilment,
  startCheckout,
} from "../../src/server/checkout";
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
import {
  CHECKOUT_PIN,
  checkoutOpts,
  closeTrackedPersistenceHandles,
  withCheckoutReadyHarness,
} from "../database/support/checkout-fixtures";
import { configureAlwaysAcceptingOutlet } from "../database/support/serviceability-fixtures";

type Harness = Parameters<Parameters<typeof withCheckoutReadyHarness>[0]>[0];
type HarnessPersistence = Harness["persistence"];

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

function customerAccess(actor: CustomerActor, brandId: string) {
  return { kind: "customer" as const, actor, brandId };
}

function submittedStatus(quote: unknown): string | null {
  const submitted = (quote as { commercialExplanation?: { submittedCouponResult?: unknown } })
    ?.commercialExplanation?.submittedCouponResult as { status?: unknown } | null | undefined;
  return submitted && typeof submitted.status === "string" ? submitted.status : null;
}

async function seedEnabledPickupProfile(persistence: HarnessPersistence, outletId: string) {
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

async function seedModeCoupon(
  persistence: HarnessPersistence,
  brandId: string,
  actor: unknown,
  canonicalCode: string,
  modes: readonly ("DELIVERY" | "PICKUP")[],
): Promise<{ couponId: string; canonicalCode: string }> {
  return persistence.transaction(async (tx) => {
    const created = await createPromotionDraft(tx, {
      actor,
      brandId,
      code: uniqueCode("auth"),
      displayName: `Authority ${modes.join("+")}`,
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
    const revision = async () => (await getPromotion(tx, created.id))!.revision;
    await setPromotionBenefit(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: await revision(),
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
    for (const targetRole of ["qualifier", "benefit"] as const) {
      await setPromotionTargets(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: await revision(),
        targetRole,
        targets: [{ targetRole, ...merch }],
      });
    }
    await activatePromotion(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: await revision(),
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
    return { couponId: coupon.id, canonicalCode: coupon.canonicalCode };
  });
}

async function cartCouponCode(persistence: HarnessPersistence, cartId: string) {
  return persistence.withContext(async (ctx) => {
    const r = await ctx.db.execute(sql`
      select manual_coupon_code from app.carts where id = ${cartId}::uuid
    `);
    return (r.rows[0]?.manual_coupon_code as string | null) ?? null;
  });
}

describe("IMP-036J committed Cart coupon vs evaluated quote authority", () => {
  it("Delivery: removing the coupon after evaluation refuses the stale discounted quote and re-evaluates undiscounted", async () => {
    await withCheckoutReadyHarness(async ({ persistence, actors, cartId, addressId }) => {
      const brandId = actors.tree.brand.id;
      const access = customerAccess(actors.customerA, brandId);
      const opts = checkoutOpts();

      const delivery = await seedModeCoupon(
        persistence,
        brandId,
        actors.brandAdminActor,
        "AUTHDEL1",
        ["DELIVERY"],
      );
      const applied = await applyCartCoupon(persistence, access, {
        couponCode: delivery.canonicalCode,
        expectedRevision: BigInt(1),
      });

      let checkout = await startCheckout(persistence, actors.customerA, { cartId }, opts);
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
      const discounted = await evaluateCheckout(
        persistence,
        actors.customerA,
        { checkoutId: checkout.id, expectedCheckoutRevision: checkout.revision },
        opts,
      );
      expect(submittedStatus(discounted.quote)).toBe("APPLIED");
      expect(discounted.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      expect(discounted.snapshot.manualCouponCode).toBe("AUTHDEL1");

      await removeCartCoupon(persistence, access, { expectedRevision: applied.revision });
      expect(await cartCouponCode(persistence, cartId)).toBeNull();

      await expect(
        prepareCheckoutForPayment(
          persistence,
          actors.customerA,
          {
            checkoutId: discounted.checkout.id,
            expectedCheckoutRevision: discounted.checkout.revision,
          },
          opts,
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });

      const invalidated = await getActiveCheckout(
        persistence,
        actors.customerA,
        { checkoutId: discounted.checkout.id },
        opts,
      );
      expect(invalidated?.status).not.toBe("READY_FOR_PAYMENT");

      const fresh = await evaluateCheckout(
        persistence,
        actors.customerA,
        { checkoutId: invalidated!.id, expectedCheckoutRevision: invalidated!.revision },
        opts,
      );
      expect(fresh.snapshot.promotionDiscountPaise).toBe(BigInt(0));
      expect(fresh.snapshot.manualCouponCode).toBeNull();
      expect(submittedStatus(fresh.quote)).toBeNull();
      expect(fresh.snapshot.grandTotalPaise).toBeGreaterThan(discounted.snapshot.grandTotalPaise);

      const prepared = await prepareCheckoutForPayment(
        persistence,
        actors.customerA,
        { checkoutId: fresh.checkout.id, expectedCheckoutRevision: fresh.checkout.revision },
        opts,
      );
      expect(prepared.snapshot.promotionDiscountPaise).toBe(BigInt(0));
      expect(prepared.snapshot.manualCouponCode).toBeNull();
      expect(prepared.snapshot.grandTotalPaise).toBe(fresh.snapshot.grandTotalPaise);
    });
  });

  it("Takeaway: replacing a Delivery-only coupon after an ineligible evaluation refuses the stale quote; Delivery-only stays ineligible", async () => {
    await withCheckoutReadyHarness(async ({ persistence, actors, cartId }) => {
      const brandId = actors.tree.brand.id;
      const access = customerAccess(actors.customerA, brandId);
      const opts = checkoutOpts();
      await seedEnabledPickupProfile(persistence, actors.tree.outletA.id);
      await configureAlwaysAcceptingOutlet(persistence, actors.brandAdminActor, actors.tree.outletA.id);

      const deliveryOnly = await seedModeCoupon(
        persistence,
        brandId,
        actors.brandAdminActor,
        "AUTHDEL2",
        ["DELIVERY"],
      );
      const takeawayOnly = await seedModeCoupon(
        persistence,
        brandId,
        actors.brandAdminActor,
        "AUTHPICK2",
        ["PICKUP"],
      );
      const first = await applyCartCoupon(persistence, access, {
        couponCode: deliveryOnly.canonicalCode,
        expectedRevision: BigInt(1),
      });

      let checkout = await startCheckout(persistence, actors.customerA, { cartId }, opts);
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
      const ineligible = await evaluateCheckout(
        persistence,
        actors.customerA,
        { checkoutId: checkout.id, expectedCheckoutRevision: checkout.revision },
        opts,
      );
      expect(submittedStatus(ineligible.quote)).toBe("NOT_APPLICABLE");
      expect(ineligible.snapshot.promotionDiscountPaise).toBe(BigInt(0));
      expect(ineligible.snapshot.manualCouponCode).toBeNull();

      await applyCartCoupon(persistence, access, {
        couponCode: takeawayOnly.canonicalCode,
        expectedRevision: first.revision,
      });
      expect(await cartCouponCode(persistence, cartId)).toBe("AUTHPICK2");

      await expect(
        prepareCheckoutForPayment(
          persistence,
          actors.customerA,
          {
            checkoutId: ineligible.checkout.id,
            expectedCheckoutRevision: ineligible.checkout.revision,
          },
          opts,
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });

      const draft = await getActiveCheckout(
        persistence,
        actors.customerA,
        { checkoutId: ineligible.checkout.id },
        opts,
      );
      const applied = await evaluateCheckout(
        persistence,
        actors.customerA,
        { checkoutId: draft!.id, expectedCheckoutRevision: draft!.revision },
        opts,
      );
      expect(submittedStatus(applied.quote)).toBe("APPLIED");
      expect(applied.snapshot.manualCouponCode).toBe("AUTHPICK2");
      expect(applied.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      expect(
        applied.snapshot.promotionEffects.some((e) => e.couponId === deliveryOnly.couponId),
      ).toBe(false);

      const prepared = await prepareCheckoutForPayment(
        persistence,
        actors.customerA,
        { checkoutId: applied.checkout.id, expectedCheckoutRevision: applied.checkout.revision },
        opts,
      );
      expect(prepared.snapshot.manualCouponCode).toBe("AUTHPICK2");
      expect(prepared.snapshot.promotionDiscountPaise).toBe(applied.snapshot.promotionDiscountPaise);
      expect(prepared.snapshot.grandTotalPaise).toBe(applied.snapshot.grandTotalPaise);
    });
  });
});
