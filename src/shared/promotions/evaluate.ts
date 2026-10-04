/**
 * Pure promotion evaluation orchestrator (IMP-016 + IMP-036J).
 *
 * Does not apply tax — caller evaluates each candidate's post-promotion
 * components through the IMP-015 tax engine and then calls selectBestCandidate.
 */
import { isComplimentaryPromotion } from "./benefit";
import {
  buildThresholdProgress,
  evaluateEligibility,
  isPromotionEffective,
} from "./eligibility";
import { assertActivePromotionIntegrity } from "./targets";
import {
  buildPromotionCandidates,
  classifyPromotionSlot,
  type EligiblePromotion,
} from "./select";
import type {
  CommercialExplanation,
  ComplimentaryProjection,
  CouponPresentationClass,
  CouponRecord,
  PrePromotionSnapshot,
  PromotionCandidateResult,
  PromotionDefinition,
  PromotionEvaluationContext,
  PromotionEvaluationResult,
  SubmittedCouponResult,
  ThresholdProgress,
} from "./types";

export type EvaluatePromotionsInput = Readonly<{
  context: PromotionEvaluationContext;
  snapshot: PrePromotionSnapshot;
  promotions: readonly PromotionDefinition[];
  submittedCoupon?: Readonly<{
    rawCode: string;
    coupon: CouponRecord | null;
    promotion: PromotionDefinition | null;
  }> | null;
  /**
   * Complimentary variant previously selected/presented on this checkout
   * attempt. Absence means no shown complimentary item.
   */
  previouslyPresentedComplimentaryVariantId?: string | null;
  /** IMP-022: true when Payment redemption claims can enforce capacity. */
  redemptionEnforcementAvailable?: boolean;
}>;

function couponNotApplied(
  status: SubmittedCouponResult["status"],
  reasonCode: string,
  partial: Partial<SubmittedCouponResult> = {},
): SubmittedCouponResult {
  return {
    status,
    reasonCode,
    couponId: null,
    promotionId: null,
    canonicalCode: null,
    ...partial,
  };
}

function evaluateSubmittedCoupon(
  input: EvaluatePromotionsInput,
): {
  result: SubmittedCouponResult | null;
  couponPromotion: EligiblePromotion | null;
} {
  if (!input.submittedCoupon) return { result: null, couponPromotion: null };
  const { rawCode, coupon, promotion } = input.submittedCoupon;
  const canonical = rawCode.trim().toUpperCase();

  if (!coupon || !promotion) {
    return {
      result: couponNotApplied("INVALID", "COUPON_INVALID", { canonicalCode: canonical || null }),
      couponPromotion: null,
    };
  }

  if (coupon.status !== "active") {
    return {
      result: couponNotApplied("INVALID", "COUPON_NOT_ACTIVE", {
        couponId: coupon.id,
        promotionId: coupon.promotionId,
        canonicalCode: coupon.canonicalCode,
      }),
      couponPromotion: null,
    };
  }

  if (promotion.status !== "active" || promotion.id !== coupon.promotionId) {
    return {
      result: couponNotApplied("INVALID", "COUPON_NOT_APPLICABLE", {
        couponId: coupon.id,
        promotionId: coupon.promotionId,
        canonicalCode: coupon.canonicalCode,
      }),
      couponPromotion: null,
    };
  }

  const at = input.context.at;
  const promoEffective = isPromotionEffective(promotion.startsAt, promotion.endsAt, at);
  const couponStartOk = coupon.startsAt === null || at.getTime() >= coupon.startsAt.getTime();
  const couponEndOk = coupon.endsAt === null || at.getTime() < coupon.endsAt.getTime();
  if (!promoEffective || !couponStartOk || !couponEndOk) {
    return {
      result: couponNotApplied("INVALID", "COUPON_NOT_EFFECTIVE", {
        couponId: coupon.id,
        promotionId: coupon.promotionId,
        canonicalCode: coupon.canonicalCode,
      }),
      couponPromotion: null,
    };
  }

  if (coupon.maximumRedemptionsPerCustomer !== null && !input.context.customerId) {
    return {
      result: couponNotApplied("CUSTOMER_IDENTITY_REQUIRED", "CUSTOMER_IDENTITY_REQUIRED", {
        couponId: coupon.id,
        promotionId: coupon.promotionId,
        canonicalCode: coupon.canonicalCode,
      }),
      couponPromotion: null,
    };
  }

  const redemptionEnforcementAvailable = input.redemptionEnforcementAvailable === true;
  if (
    (coupon.maximumRedemptions !== null || coupon.maximumRedemptionsPerCustomer !== null) &&
    !redemptionEnforcementAvailable
  ) {
    return {
      result: couponNotApplied(
        "REDEMPTION_ENFORCEMENT_UNAVAILABLE",
        "REDEMPTION_ENFORCEMENT_UNAVAILABLE",
        {
          couponId: coupon.id,
          promotionId: coupon.promotionId,
          canonicalCode: coupon.canonicalCode,
        },
      ),
      couponPromotion: null,
    };
  }

  const eligibility = evaluateEligibility(promotion, input.snapshot, input.context);
  if (!eligibility.eligible) {
    return {
      result: couponNotApplied("NOT_APPLICABLE", eligibility.reasonCode, {
        couponId: coupon.id,
        promotionId: coupon.promotionId,
        canonicalCode: coupon.canonicalCode,
      }),
      couponPromotion: null,
    };
  }

  return {
    result: couponNotApplied("VALID_BUT_NOT_SELECTED", "COUPON_VALID_BUT_NOT_SELECTED", {
      couponId: coupon.id,
      promotionId: coupon.promotionId,
      canonicalCode: coupon.canonicalCode,
    }),
    couponPromotion: { promotion, couponId: coupon.id },
  };
}

/**
 * Build candidates and return an evaluation scaffold.
 * Grand-total selection happens in the pricing quote after tax.
 */
export function evaluatePromotions(input: EvaluatePromotionsInput): Omit<
  PromotionEvaluationResult,
  | "selectedPromotionIds"
  | "appliedPromotions"
  | "allocations"
  | "promotionDiscountTotalPaise"
  | "postPromotionComponents"
> & {
  eligible: EligiblePromotion[];
  candidates: ReturnType<typeof buildPromotionCandidates>;
  submittedCouponResult: SubmittedCouponResult | null;
  baselineTotalPaise: bigint;
  thresholdProgress: ThresholdProgress[];
  complimentaryCompetingNoneChosen: boolean;
  complimentaryItemUnavailable: boolean;
} {
  for (const p of input.promotions) {
    if (p.status === "active") assertActivePromotionIntegrity(p);
  }

  const { result: couponResultDraft, couponPromotion } = evaluateSubmittedCoupon(input);

  const eligible: EligiblePromotion[] = [];
  const presentedComplimentaryVariantId =
    input.previouslyPresentedComplimentaryVariantId ?? null;
  const availability = input.context.complimentaryVariantAvailability;
  const complimentaryItemUnavailable =
    presentedComplimentaryVariantId !== null &&
    (!availability || availability.get(presentedComplimentaryVariantId) !== true);
  for (const promotion of input.promotions) {
    if (promotion.triggerType === "coupon") continue; // only via submitted coupon
    if (promotion.status !== "active") continue;
    assertActivePromotionIntegrity(promotion);
    const eligibility = evaluateEligibility(promotion, input.snapshot, input.context);
    if (eligibility.eligible) {
      eligible.push({ promotion });
    }
  }
  if (couponPromotion) {
    eligible.push(couponPromotion);
  }

  const baselineTotalPaise = input.snapshot.components.reduce(
    (a, c) => a + c.amountPaise,
    BigInt(0),
  );
  const candidates = buildPromotionCandidates(eligible, input.snapshot, {
    deliveryChargeDefinitionIds: input.context.deliveryChargeDefinitionIds,
  });
  const complimentaryCompetingNoneChosen = candidates.some(
    (c) => c.complimentaryCompetingNoneChosen === true,
  );

  const thresholdProgress = buildThresholdProgress(
    input.promotions,
    input.snapshot,
    input.context,
  );

  return {
    baselineTotalPaise,
    eligiblePromotionIds: eligible.map((e) => e.promotion.id),
    submittedCouponResult: couponResultDraft,
    eligible,
    candidates,
    thresholdProgress,
    complimentaryCompetingNoneChosen,
    complimentaryItemUnavailable,
  };
}

export function finalizeCouponResult(
  draft: SubmittedCouponResult | null,
  selectedPromotionIds: readonly string[],
  appliedPromotionIds: readonly string[],
): SubmittedCouponResult | null {
  if (!draft || !draft.promotionId) return draft;
  if (
    draft.status === "INVALID" ||
    draft.status === "NOT_APPLICABLE" ||
    draft.status === "CUSTOMER_IDENTITY_REQUIRED" ||
    draft.status === "REDEMPTION_ENFORCEMENT_UNAVAILABLE"
  ) {
    return draft;
  }
  if (appliedPromotionIds.includes(draft.promotionId)) {
    return { ...draft, status: "APPLIED", reasonCode: "APPLIED" };
  }
  if (selectedPromotionIds.includes(draft.promotionId)) {
    return {
      ...draft,
      status: "VALID_BUT_NOT_SELECTED",
      reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
    };
  }
  return {
    ...draft,
    status: "VALID_BUT_NOT_SELECTED",
    reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
  };
}

export type ClassifyCouponPresentationInput = Readonly<{
  submittedCouponResult: SubmittedCouponResult | null;
  winner: PromotionCandidateResult & { grandTotalPaise: bigint };
  /** Best valid combination that includes the coupon promotion id. */
  bestCouponGrandTotalPaise: bigint | null;
  /** Best valid combination that does not include the coupon promotion id. */
  bestNonCouponGrandTotalPaise: bigint | null;
  couponPromotionId: string | null;
}>;

/**
 * Locked server-owned coupon presentation classes.
 * Equal payable must not be described as "better".
 */
export function classifyCouponPresentation(
  input: ClassifyCouponPresentationInput,
): CouponPresentationClass | null {
  const draft = input.submittedCouponResult;
  if (!draft || !draft.promotionId || !input.couponPromotionId) return null;
  if (
    draft.status === "INVALID" ||
    draft.status === "NOT_APPLICABLE" ||
    draft.status === "CUSTOMER_IDENTITY_REQUIRED" ||
    draft.status === "REDEMPTION_ENFORCEMENT_UNAVAILABLE"
  ) {
    return null;
  }

  const couponSelected = input.winner.promotionIds.includes(input.couponPromotionId);
  const couponTotal = input.bestCouponGrandTotalPaise;
  const nonCouponTotal = input.bestNonCouponGrandTotalPaise;

  if (couponSelected) {
    if (nonCouponTotal !== null && nonCouponTotal === input.winner.grandTotalPaise) {
      return "COUPON_EQUAL_PAYABLE_SELECTED";
    }
    return "COUPON_APPLIED";
  }

  // Coupon not selected: equal payable vs strictly worse coupon combination.
  if (couponTotal !== null && couponTotal === input.winner.grandTotalPaise) {
    return "COUPON_EQUAL_PAYABLE_NOT_SELECTED";
  }
  return "COUPON_VALID_NOT_SELECTED";
}

/**
 * Server-derived commercial_command_results.payable_changed_vs_valid_alternative.
 * Compares the best valid coupon combination payable with the best valid
 * non-coupon alternative from the same T3 candidate set. Never a client field.
 */
export function payableChangedVsValidAlternative(input: {
  submittedCouponResult: SubmittedCouponResult | null;
  bestCouponGrandTotalPaise: bigint | null;
  bestNonCouponGrandTotalPaise: bigint | null;
}): boolean | null {
  const status = input.submittedCouponResult?.status;
  if (status !== "APPLIED" && status !== "VALID_BUT_NOT_SELECTED") {
    return null;
  }
  if (
    input.bestCouponGrandTotalPaise === null ||
    input.bestNonCouponGrandTotalPaise === null
  ) {
    return null;
  }
  return input.bestCouponGrandTotalPaise !== input.bestNonCouponGrandTotalPaise;
}

export function projectComplimentary(
  winner: PromotionCandidateResult,
  competingNoneChosen: boolean,
): ComplimentaryProjection | null {
  if (competingNoneChosen) {
    // Explicit NONE_CHOSEN must survive into CommercialExplanation.
    // Do not collapse this into ordinary "no complimentary" (null).
    return { competingOffers: "NONE_CHOSEN" };
  }
  const gift = winner.appliedPromotions.find((p) => p.isComplimentary === true);
  if (!gift) return null;
  const productId = gift.complimentaryProductId ?? null;
  const variantId = gift.complimentaryVariantId ?? null;
  if (!productId || !variantId) return null;
  return {
    competingOffers: "NONE",
    promotionId: gift.promotionId,
    productId,
    variantId,
    quantity: 1,
    merchandiseChargePaise: 0,
  };
}

export function buildCommercialExplanation(input: {
  winner: PromotionCandidateResult & { grandTotalPaise: bigint };
  submittedCouponResult: SubmittedCouponResult | null;
  couponPresentationClass: CouponPresentationClass | null;
  thresholdProgress: readonly ThresholdProgress[];
  complimentaryCompetingNoneChosen: boolean;
  promotionsById: ReadonlyMap<string, PromotionDefinition>;
}): CommercialExplanation {
  let merchandiseOrOrderSavingPaise = BigInt(0);
  let deliverySavingPaise = BigInt(0);

  for (const applied of input.winner.appliedPromotions) {
    // Complimentary internal zeroing allocation is pricing machinery, not a
    // customer monetary saving. Exclude it from merchandise/order/total saved.
    if (applied.isComplimentary === true) {
      continue;
    }
    const promo = input.promotionsById.get(applied.promotionId);
    const slot =
      applied.slotClass ??
      (promo ? classifyPromotionSlot(promo) : "PRIMARY_MERCHANDISE_OR_ORDER");
    if (slot === "DELIVERY_INCENTIVE") {
      if (applied.realizedDiscountPaise > BigInt(0)) {
        deliverySavingPaise += applied.realizedDiscountPaise;
      }
    } else {
      merchandiseOrOrderSavingPaise += applied.realizedDiscountPaise;
    }
  }

  const totalSavedPaise = merchandiseOrOrderSavingPaise + deliverySavingPaise;
  const appliedCouponId =
    input.couponPresentationClass === "COUPON_APPLIED" ||
    input.couponPresentationClass === "COUPON_EQUAL_PAYABLE_SELECTED"
      ? (input.submittedCouponResult?.couponId ?? null)
      : null;

  // Prefer amount-based progress when present; otherwise first quantity-only row.
  const amountProgress =
    input.thresholdProgress.find((t) => t.remainingAmountPaise !== null) ?? null;
  const quantityOnly =
    amountProgress === null
      ? (input.thresholdProgress.find((t) => t.remainingItemQuantity !== null) ?? null)
      : null;
  const thresholdProgress = amountProgress ?? quantityOnly;

  return {
    selectedPromotionIds: input.winner.promotionIds,
    appliedCouponId,
    merchandiseOrOrderSavingPaise,
    deliverySavingPaise,
    totalSavedPaise,
    grandTotalPaise: input.winner.grandTotalPaise,
    couponPresentationClass: input.couponPresentationClass,
    thresholdProgress,
    complimentary: projectComplimentary(
      input.winner,
      input.complimentaryCompetingNoneChosen,
    ),
    submittedCouponResult: input.submittedCouponResult,
  };
}

/** @internal test helper — re-export complimentary check */
export { isComplimentaryPromotion };
