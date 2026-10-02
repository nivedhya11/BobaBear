/**
 * Promotion eligibility (IMP-016 + IMP-036J commercial evaluation).
 */
import type { PromotionEligibilityReasonCode } from "./constants";
import { isComplimentaryPromotion } from "./benefit";
import { qualifyingAmountPaise, resolveQualifierUnits } from "./targets";
import type {
  EligibilityResult,
  PrePromotionSnapshot,
  PromotionDefinition,
  PromotionEvaluationContext,
  ThresholdProgress,
} from "./types";

export function isPromotionEffective(
  startsAt: Date,
  endsAt: Date | null,
  at: Date,
): boolean {
  if (at.getTime() < startsAt.getTime()) return false;
  if (endsAt !== null && at.getTime() >= endsAt.getTime()) return false;
  return true;
}

export function matchesPromotionScope(
  promotion: Pick<
    PromotionDefinition,
    "brandId" | "scopeType" | "territoryId" | "organizationId" | "outletId"
  >,
  context: Pick<
    PromotionEvaluationContext,
    "brandId" | "territoryId" | "organizationId" | "outletId"
  >,
): boolean {
  if (promotion.brandId !== context.brandId) return false;
  switch (promotion.scopeType) {
    case "brand":
      return true;
    case "territory":
      return (
        promotion.territoryId !== null &&
        context.territoryId !== null &&
        promotion.territoryId === context.territoryId
      );
    case "organization":
      return (
        promotion.organizationId !== null &&
        context.organizationId !== null &&
        promotion.organizationId === context.organizationId
      );
    case "outlet":
      return (
        promotion.outletId !== null && promotion.outletId === context.outletId
      );
    default:
      return false;
  }
}

function matchesModeTiming(
  promotion: PromotionDefinition,
  context: PromotionEvaluationContext,
): EligibilityResult | null {
  const modes = promotion.eligibleFulfilmentModes ?? null;
  const timings = promotion.eligibleFulfilmentTimings ?? null;

  if (modes !== null && modes.length > 0) {
    if (context.fulfilmentMode == null) {
      return {
        eligible: false,
        qualifyingAmountPaise: BigInt(0),
        qualifyingQuantity: 0,
        reasonCode: "FULFILMENT_CONTEXT_REQUIRED",
      };
    }
    if (!modes.includes(context.fulfilmentMode)) {
      return {
        eligible: false,
        qualifyingAmountPaise: BigInt(0),
        qualifyingQuantity: 0,
        reasonCode: "FULFILMENT_MODE_MISMATCH",
      };
    }
  }

  if (timings !== null && timings.length > 0) {
    if (context.fulfilmentTiming == null) {
      return {
        eligible: false,
        qualifyingAmountPaise: BigInt(0),
        qualifyingQuantity: 0,
        reasonCode: "FULFILMENT_CONTEXT_REQUIRED",
      };
    }
    if (!timings.includes(context.fulfilmentTiming)) {
      return {
        eligible: false,
        qualifyingAmountPaise: BigInt(0),
        qualifyingQuantity: 0,
        reasonCode: "FULFILMENT_TIMING_MISMATCH",
      };
    }
  }

  return null;
}

function matchesFirstOrder(
  promotion: PromotionDefinition,
  context: PromotionEvaluationContext,
): EligibilityResult | null {
  if (promotion.firstOrderOnly !== true) return null;

  if (!context.customerId) {
    return {
      eligible: false,
      qualifyingAmountPaise: BigInt(0),
      qualifyingQuantity: 0,
      reasonCode: "FIRST_ORDER_IDENTITY_REQUIRED",
    };
  }

  // T4 owns the purchase-existence query. T3 consumes the injected status only.
  const status = context.firstOrderPurchaseStatus ?? "UNAVAILABLE";
  if (status === "UNAVAILABLE") {
    return {
      eligible: false,
      qualifyingAmountPaise: BigInt(0),
      qualifyingQuantity: 0,
      reasonCode: "FIRST_ORDER_PURCHASE_STATUS_UNAVAILABLE",
    };
  }
  if (status === "HAS_PRIOR_PURCHASE") {
    return {
      eligible: false,
      qualifyingAmountPaise: BigInt(0),
      qualifyingQuantity: 0,
      reasonCode: "FIRST_ORDER_NOT_ELIGIBLE",
    };
  }
  return null;
}

function matchesComplimentaryAvailability(
  promotion: PromotionDefinition,
  context: PromotionEvaluationContext,
): EligibilityResult | null {
  if (!isComplimentaryPromotion(promotion)) return null;
  const variantId = promotion.benefit.complimentaryVariantId ?? null;
  if (!variantId) {
    return {
      eligible: false,
      qualifyingAmountPaise: BigInt(0),
      qualifyingQuantity: 0,
      reasonCode: "COMPLIMENTARY_VARIANT_REQUIRED",
    };
  }
  const availability = context.complimentaryVariantAvailability;
  if (!availability) {
    // Domain unit tests may omit the map; production quote path supplies it.
    return null;
  }
  if (availability.get(variantId) !== true) {
    return {
      eligible: false,
      qualifyingAmountPaise: BigInt(0),
      qualifyingQuantity: 0,
      reasonCode: "COMPLIMENTARY_UNAVAILABLE",
    };
  }
  return null;
}

export function evaluateEligibility(
  promotion: PromotionDefinition,
  snapshot: PrePromotionSnapshot,
  context: PromotionEvaluationContext,
): EligibilityResult {
  const fail = (
    reasonCode: PromotionEligibilityReasonCode,
    qualifyingAmountPaiseValue = BigInt(0),
    qualifyingQuantity = 0,
  ): EligibilityResult => ({
    eligible: false,
    qualifyingAmountPaise: qualifyingAmountPaiseValue,
    qualifyingQuantity,
    reasonCode,
  });

  if (promotion.status === "retired") return fail("RETIRED");
  if (promotion.status !== "active") return fail("NOT_ACTIVE");
  if (promotion.salesChannel !== context.salesChannel) return fail("CHANNEL_MISMATCH");
  if (!matchesPromotionScope(promotion, context)) return fail("SCOPE_MISMATCH");
  if (!isPromotionEffective(promotion.startsAt, promotion.endsAt, context.at)) {
    return fail("NOT_EFFECTIVE");
  }

  const modeTiming = matchesModeTiming(promotion, context);
  if (modeTiming) return modeTiming;

  const firstOrder = matchesFirstOrder(promotion, context);
  if (firstOrder) return firstOrder;

  const complimentary = matchesComplimentaryAvailability(promotion, context);
  if (complimentary) return complimentary;

  const units = resolveQualifierUnits(snapshot, promotion.qualifierTargets);
  const amount = qualifyingAmountPaise(snapshot, promotion.qualifierTargets);
  const quantity = units.length;

  if (
    promotion.minimumQualifyingAmountPaise !== null &&
    amount < promotion.minimumQualifyingAmountPaise
  ) {
    return fail("MINIMUM_AMOUNT_NOT_MET", amount, quantity);
  }
  if (
    promotion.minimumItemQuantity !== null &&
    quantity < promotion.minimumItemQuantity
  ) {
    return fail("MINIMUM_QUANTITY_NOT_MET", amount, quantity);
  }

  return {
    eligible: true,
    qualifyingAmountPaise: amount,
    qualifyingQuantity: quantity,
    reasonCode: "ELIGIBLE",
  };
}

/**
 * Server-owned threshold progress for Offers that fail only on their amount/quantity minimum
 * after otherwise matching scope, window, identity, mode, and timing.
 */
export function buildThresholdProgress(
  promotions: readonly PromotionDefinition[],
  snapshot: PrePromotionSnapshot,
  context: PromotionEvaluationContext,
): ThresholdProgress[] {
  const out: ThresholdProgress[] = [];
  for (const promotion of promotions) {
    if (promotion.triggerType === "coupon") continue;
    if (promotion.status !== "active") continue;
    if (!isPromotionEffective(promotion.startsAt, promotion.endsAt, context.at)) continue;
    if (!matchesPromotionScope(promotion, context)) continue;
    if (matchesModeTiming(promotion, context)) continue;
    if (matchesFirstOrder(promotion, context)) continue;
    if (matchesComplimentaryAvailability(promotion, context)) continue;

    const units = resolveQualifierUnits(snapshot, promotion.qualifierTargets);
    const amount = qualifyingAmountPaise(snapshot, promotion.qualifierTargets);
    const quantity = units.length;

    const amountGap =
      promotion.minimumQualifyingAmountPaise !== null &&
      amount < promotion.minimumQualifyingAmountPaise
        ? promotion.minimumQualifyingAmountPaise - amount
        : null;
    const quantityGap =
      promotion.minimumItemQuantity !== null && quantity < promotion.minimumItemQuantity
        ? promotion.minimumItemQuantity - quantity
        : null;

    if (amountGap === null && quantityGap === null) continue;
    // Do not invent a rupee gap for quantity-only qualification.
    out.push({
      promotionId: promotion.id,
      remainingAmountPaise: amountGap,
      remainingItemQuantity: quantityGap,
      displayName: promotion.displayName,
      benefitType: promotion.benefit.benefitType,
    });
  }
  return out;
}
