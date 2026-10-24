/**
 * Extra disposable-catalog fixtures for the GTM browser journey harness.
 * Invoked only when E2E_GTM_UAT_FIXTURES=1. Not a production bootstrap.
 */
import type { Persistence } from "../../src/server/persistence/types";
import {
  activateCoupon,
  activatePromotion,
  createCouponDraft,
  createPromotionDraft,
  setPromotionBenefit,
  setPromotionTargets,
} from "../../src/server/promotions";
import { saveOutletSchedulingProfile } from "../../src/server/scheduled-fulfilment/foundations";

export const GTM_UAT_COUPON_CODE = "E2E10";

export async function seedGtmUatBrowserFixtures(
  persistence: Persistence,
  actor: unknown,
  brandId: string,
  outletId: string,
): Promise<void> {
  await saveOutletSchedulingProfile(persistence, {
    outletId,
    pickupMinLeadMinutes: 30,
    deliveryMinLeadMinutes: 30,
  });

  await persistence.transaction(async (tx) => {
    const created = await createPromotionDraft(tx, {
      actor,
      brandId,
      code: "e2e-coupon",
      displayName: "E2E twenty percent",
      scopeType: "brand",
      territoryId: null,
      organizationId: null,
      outletId: null,
      triggerType: "coupon",
      stackingPolicy: "combinable",
      startsAt: new Date("2020-01-01T00:00:00Z"),
      endsAt: null,
    });
    let revision = created.revision;
    revision = (
      await setPromotionBenefit(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: revision,
        benefit: {
          benefitType: "percentage_discount",
          percentageBps: 2000,
          fixedAmountPaise: null,
          maximumDiscountPaise: null,
          buyQuantity: null,
          getQuantity: null,
          repeatable: null,
          maximumRewardQuantity: null,
          includeModifiers: false,
          includeBundleDeltas: false,
        },
      })
    ).revision;
    revision = (
      await setPromotionTargets(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: revision,
        targetRole: "qualifier",
        targets: [
          {
            targetRole: "qualifier",
            targetType: "all_merchandise",
            productId: null,
            variantId: null,
            chargeDefinitionId: null,
          },
        ],
      })
    ).revision;
    revision = (
      await setPromotionTargets(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: revision,
        targetRole: "benefit",
        targets: [
          {
            targetRole: "benefit",
            targetType: "all_merchandise",
            productId: null,
            variantId: null,
            chargeDefinitionId: null,
          },
        ],
      })
    ).revision;
    await activatePromotion(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: revision,
    });
    const coupon = await createCouponDraft(tx, {
      actor,
      brandId,
      promotionId: created.id,
      origin: "manual",
      canonicalCode: GTM_UAT_COUPON_CODE,
      startsAt: new Date("2020-01-01T00:00:00Z"),
      endsAt: null,
    });
    await activateCoupon(tx, {
      actor,
      brandId,
      couponId: coupon.id,
      expectedCouponRevision: coupon.revision,
    });
  });
}
