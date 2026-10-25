/**
 * Synthetic coupons for the B5 checkout price-clarity browser proof.
 * Invoked only when E2E_B5_COMMERCE_QA=1. Not a production bootstrap.
 *
 * The first-order automatic offer is skipped in that same mode so these
 * coupons are the only discounts the browser can apply.
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
import type { PromotionBenefitConfig, PromotionTargetConfig } from "../../src/shared/promotions";
import { CHARGE_DEFINITION_DELIVERY_ID } from "../../src/shared/pricing/constants";

export const B5_MERCH_COUPON = "B5MERCH";
export const B5_DELIVERY_COUPON = "B5DELIV";
export const B5_GIFT_COUPON = "B5GIFT";

/** Purple Rain Taro Boba — the only merchandise line B5MERCH discounts. */
export const B5_DISCOUNTED_VARIANT_ID = "63ab5434-72f4-5521-862d-b34b3407695a";

/** Zen Master Matcha Boba — complimentary item, not one of the paid cart lines. */
const GIFT_PRODUCT_ID = "74372353-20e1-5a5c-8ed0-8764c1b8c191";
const GIFT_VARIANT_ID = "1a403dd2-8fec-5d19-b764-7eda47167f2b";

const ALL_MERCHANDISE: PromotionTargetConfig = {
  targetRole: "qualifier",
  targetType: "all_merchandise",
  productId: null,
  variantId: null,
  chargeDefinitionId: null,
};

type CouponSeed = Readonly<{
  promotionCode: string;
  displayName: string;
  couponCode: string;
  benefit: PromotionBenefitConfig;
  qualifier: PromotionTargetConfig;
  benefits: readonly PromotionTargetConfig[];
}>;

async function seedCoupon(
  persistence: Persistence,
  actor: unknown,
  brandId: string,
  seed: CouponSeed,
): Promise<void> {
  await persistence.transaction(async (tx) => {
    const created = await createPromotionDraft(tx, {
      actor,
      brandId,
      code: seed.promotionCode,
      displayName: seed.displayName,
      scopeType: "brand",
      territoryId: null,
      organizationId: null,
      outletId: null,
      triggerType: "coupon",
      stackingPolicy: "exclusive",
      startsAt: new Date("2020-01-01T00:00:00Z"),
      endsAt: null,
    });
    let revision = created.revision;
    revision = (
      await setPromotionBenefit(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: revision,
        benefit: seed.benefit,
      })
    ).revision;
    revision = (
      await setPromotionTargets(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: revision,
        targetRole: "qualifier",
        targets: [seed.qualifier],
      })
    ).revision;
    revision = (
      await setPromotionTargets(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: revision,
        targetRole: "benefit",
        targets: seed.benefits,
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
      canonicalCode: seed.couponCode,
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

const EMPTY_BENEFIT = {
  percentageBps: null,
  fixedAmountPaise: null,
  maximumDiscountPaise: null,
  buyQuantity: null,
  getQuantity: null,
  repeatable: null,
  maximumRewardQuantity: null,
  includeModifiers: false,
  includeBundleDeltas: false,
} as const;

export async function seedB5CommerceQaFixtures(
  persistence: Persistence,
  actor: unknown,
  brandId: string,
): Promise<void> {
  await seedCoupon(persistence, actor, brandId, {
    promotionCode: "b5-merch",
    displayName: "B5 one-item percentage",
    couponCode: B5_MERCH_COUPON,
    benefit: {
      ...EMPTY_BENEFIT,
      benefitType: "percentage_discount",
      percentageBps: 2000,
    },
    qualifier: {
      targetRole: "qualifier",
      targetType: "variant",
      productId: null,
      variantId: B5_DISCOUNTED_VARIANT_ID,
      chargeDefinitionId: null,
    },
    benefits: [
      {
        targetRole: "benefit",
        targetType: "variant",
        productId: null,
        variantId: B5_DISCOUNTED_VARIANT_ID,
        chargeDefinitionId: null,
      },
    ],
  });

  await seedCoupon(persistence, actor, brandId, {
    promotionCode: "b5-deliv",
    displayName: "B5 delivery waiver",
    couponCode: B5_DELIVERY_COUPON,
    benefit: { ...EMPTY_BENEFIT, benefitType: "delivery_fee_waiver" },
    qualifier: { ...ALL_MERCHANDISE, targetRole: "qualifier" },
    benefits: [
      {
        targetRole: "benefit",
        targetType: "charge",
        productId: null,
        variantId: null,
        chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
      },
    ],
  });

  await seedCoupon(persistence, actor, brandId, {
    promotionCode: "b5-gift",
    displayName: "B5 complimentary drink",
    couponCode: B5_GIFT_COUPON,
    benefit: {
      ...EMPTY_BENEFIT,
      benefitType: "complimentary_item",
      complimentaryProductId: GIFT_PRODUCT_ID,
      complimentaryVariantId: GIFT_VARIANT_ID,
    },
    qualifier: { ...ALL_MERCHANDISE, targetRole: "qualifier" },
    benefits: [{ ...ALL_MERCHANDISE, targetRole: "benefit" }],
  });
}
