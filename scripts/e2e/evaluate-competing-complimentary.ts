/**
 * In-memory competing complimentary evaluation for disposable browser proof.
 * Synthetic definitions are never written. Two ACTIVE rows are not inserted.
 */
import { CHARGE_DEFINITION_DELIVERY_ID } from "../../src/shared/pricing/constants";
import {
  buildCommercialExplanation,
  evaluatePromotions,
  selectBestCandidate,
  type MonetaryComponent,
  type PromotionBenefitConfig,
  type PromotionDefinition,
  type PromotionTargetConfig,
} from "../../src/shared/promotions";

const MERCH: PromotionTargetConfig = {
  targetRole: "qualifier",
  targetType: "all_merchandise",
  productId: null,
  variantId: null,
  chargeDefinitionId: null,
};
const MERCH_BENEFIT: PromotionTargetConfig = { ...MERCH, targetRole: "benefit" };

const GIFT_A = {
  id: "synthetic-complimentary-a",
  productId: "11111111-1111-4111-8111-111111111111",
  variantId: "11111111-1111-4111-8111-111111111112",
};
const GIFT_B = {
  id: "synthetic-complimentary-b",
  productId: "22222222-2222-4222-8222-222222222221",
  variantId: "22222222-2222-4222-8222-222222222222",
};

function complimentaryBenefit(productId: string, variantId: string): PromotionBenefitConfig {
  return {
    benefitType: "complimentary_item",
    percentageBps: null,
    fixedAmountPaise: null,
    maximumDiscountPaise: null,
    buyQuantity: null,
    getQuantity: null,
    repeatable: null,
    maximumRewardQuantity: null,
    includeModifiers: false,
    includeBundleDeltas: false,
    complimentaryProductId: productId,
    complimentaryVariantId: variantId,
  };
}

function complimentaryDefinition(
  id: string,
  productId: string,
  variantId: string,
): PromotionDefinition {
  return {
    id,
    brandId: "synthetic-brand",
    code: id,
    displayName: id,
    scopeType: "brand",
    territoryId: null,
    organizationId: null,
    outletId: null,
    salesChannel: "direct",
    status: "active",
    triggerType: "automatic",
    stackingPolicy: "exclusive",
    priority: 0,
    startsAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: null,
    minimumQualifyingAmountPaise: null,
    minimumItemQuantity: null,
    firstOrderOnly: false,
    eligibleFulfilmentModes: null,
    eligibleFulfilmentTimings: null,
    complimentaryItem: true,
    configurationFingerprint: `fp-${id}`,
    benefit: complimentaryBenefit(productId, variantId),
    qualifierTargets: [MERCH],
    benefitTargets: [MERCH_BENEFIT],
  };
}

function component(
  partial: Partial<MonetaryComponent> & Pick<MonetaryComponent, "componentId" | "amountPaise">,
): MonetaryComponent {
  return {
    kind: "variant_base",
    lineId: "L1",
    lineSequence: 0,
    variantId: "cart-variant",
    productId: "cart-product",
    chargeDefinitionId: null,
    taxCategoryId: "tax",
    ...partial,
  };
}

export function evaluateSyntheticComplimentaryDefinitions(count: 1 | 2): Record<string, unknown> {
  const definitions = [
    complimentaryDefinition(GIFT_A.id, GIFT_A.productId, GIFT_A.variantId),
    ...(count === 2
      ? [complimentaryDefinition(GIFT_B.id, GIFT_B.productId, GIFT_B.variantId)]
      : []),
  ];
  const gifts = count === 2 ? [GIFT_A, GIFT_B] : [GIFT_A];
  const availability = new Map(gifts.map((gift) => [gift.variantId, true] as const));
  const snapshot = {
    components: [
      component({ componentId: "c1", amountPaise: BigInt(100_000) }),
      ...gifts.map((gift, index) =>
        component({
          componentId: `${gift.id}-base`,
          amountPaise: BigInt(1000 * (index + 1)),
          variantId: gift.variantId,
          productId: gift.productId,
          lineId: `complimentary:${gift.id}`,
          lineSequence: index + 1,
        }),
      ),
    ],
    units: [
      {
        unitId: "u0",
        lineId: "L1",
        lineSequence: 0,
        unitIndex: 0,
        productId: "cart-product",
        variantId: "cart-variant",
        unitBasePaise: BigInt(100_000),
        modifierPaise: BigInt(0),
        bundleDeltaPaise: BigInt(0),
        taxCategoryId: "tax",
      },
    ],
  };
  const evaluation = evaluatePromotions({
    context: {
      at: new Date("2026-06-01T00:00:00.000Z"),
      brandId: "synthetic-brand",
      territoryId: null,
      organizationId: null,
      outletId: "synthetic-outlet",
      salesChannel: "direct",
      fulfilmentMode: "DELIVERY",
      firstOrderPurchaseStatus: "NO_PRIOR_PURCHASE",
      complimentaryVariantAvailability: availability,
      deliveryChargeDefinitionIds: [CHARGE_DEFINITION_DELIVERY_ID],
    },
    snapshot,
    promotions: definitions,
    previouslyPresentedComplimentaryVariantId: null,
  });
  const promotionsById = new Map(definitions.map((definition) => [definition.id, definition] as const));
  const scored = evaluation.candidates.map((candidate) => ({
    ...candidate,
    grandTotalPaise: BigInt(100_000) - candidate.promotionDiscountTotalPaise,
  }));
  const winner = selectBestCandidate(scored, promotionsById);
  const explanation = buildCommercialExplanation({
    winner,
    submittedCouponResult: evaluation.submittedCouponResult,
    couponPresentationClass: null,
    thresholdProgress: evaluation.thresholdProgress,
    complimentaryCompetingNoneChosen: evaluation.complimentaryCompetingNoneChosen,
    promotionsById,
  });
  return {
    ok: true,
    persisted: false,
    evaluator: "evaluatePromotions",
    syntheticDefinitionCount: definitions.length,
    complimentaryCompetingNoneChosen: evaluation.complimentaryCompetingNoneChosen,
    selectedPromotionIds: [...winner.promotionIds],
    variantIds: gifts.map((gift) => gift.variantId),
    productIds: gifts.map((gift) => gift.productId),
    complimentary: explanation.complimentary,
    merchandiseOrOrderSavingPaise: explanation.merchandiseOrOrderSavingPaise.toString(),
    deliverySavingPaise: explanation.deliverySavingPaise.toString(),
    totalSavedPaise: explanation.totalSavedPaise.toString(),
  };
}
