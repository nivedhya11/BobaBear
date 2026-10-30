/**
 * Isolated fixtures for GTM closure regression tests.
 * These mirror the accepted promotion value types. They are not a second evaluator.
 */
import type {
  CouponRecord,
  MonetaryComponent,
  PrePromotionSnapshot,
  PromotionBenefitConfig,
  PromotionDefinition,
  PromotionEvaluationContext,
  PromotionTargetConfig,
  SnapshotLineUnit,
} from "../../../src/shared/promotions";

export const ALL_MERCH_QUALIFIER: PromotionTargetConfig = {
  targetRole: "qualifier",
  targetType: "all_merchandise",
  productId: null,
  variantId: null,
  chargeDefinitionId: null,
};

export const ALL_MERCH_BENEFIT: PromotionTargetConfig = {
  targetRole: "benefit",
  targetType: "all_merchandise",
  productId: null,
  variantId: null,
  chargeDefinitionId: null,
};

export const EVAL_AT = new Date("2026-06-15T12:00:00.000Z");

export function evaluationContext(
  overrides: Partial<PromotionEvaluationContext> = {},
): PromotionEvaluationContext {
  return {
    at: EVAL_AT,
    brandId: "brand",
    territoryId: null,
    organizationId: null,
    outletId: "outlet-1",
    salesChannel: "direct",
    customerId: "customer-1",
    fulfilmentMode: "DELIVERY",
    fulfilmentTiming: "ASAP",
    firstOrderPurchaseStatus: "NO_PRIOR_PURCHASE",
    ...overrides,
  };
}

export function fixedBenefit(amountPaise: bigint): PromotionBenefitConfig {
  return {
    benefitType: "fixed_amount_discount",
    percentageBps: null,
    fixedAmountPaise: amountPaise,
    maximumDiscountPaise: null,
    buyQuantity: null,
    getQuantity: null,
    repeatable: null,
    maximumRewardQuantity: null,
    includeModifiers: false,
    includeBundleDeltas: false,
  };
}

export function offer(
  overrides: Partial<PromotionDefinition> & Pick<PromotionDefinition, "id">,
): PromotionDefinition {
  return {
    brandId: "brand",
    code: overrides.id,
    displayName: overrides.id,
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
    complimentaryItem: false,
    configurationFingerprint: "fp",
    benefit: fixedBenefit(BigInt(2_000)),
    qualifierTargets: [ALL_MERCH_QUALIFIER],
    benefitTargets: [ALL_MERCH_BENEFIT],
    ...overrides,
  };
}

export function couponRecord(
  overrides: Partial<CouponRecord> & Pick<CouponRecord, "id" | "promotionId" | "canonicalCode">,
): CouponRecord {
  return {
    origin: "manual",
    status: "active",
    startsAt: null,
    endsAt: null,
    maximumRedemptions: null,
    maximumRedemptionsPerCustomer: null,
    ...overrides,
  };
}

export function merchandiseSnapshot(amountPaise: bigint): PrePromotionSnapshot {
  const component: MonetaryComponent = {
    componentId: "c1",
    kind: "variant_base",
    lineId: "L1",
    lineSequence: 0,
    variantId: "v1",
    productId: "p1",
    chargeDefinitionId: null,
    amountPaise,
    taxCategoryId: "tax",
  };
  const unit: SnapshotLineUnit = {
    unitId: "u1",
    lineId: "L1",
    lineSequence: 0,
    unitIndex: 0,
    variantId: "v1",
    productId: "p1",
    unitBasePaise: amountPaise,
    modifierPaise: BigInt(0),
    bundleDeltaPaise: BigInt(0),
    taxCategoryId: "tax",
  };
  return { components: [component], units: [unit] };
}
