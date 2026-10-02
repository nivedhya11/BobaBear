/**
 * Candidate construction and best-price selection (IMP-016 + IMP-036J slot model).
 *
 * Slot model (FD-036J-02):
 *   at most ONE PRIMARY_MERCHANDISE_OR_ORDER
 *   + at most ONE compatible DELIVERY_INCENTIVE
 *
 * Cross-slot pair requires both stacking_policy = combinable.
 * Exclusive promotions compete only unpaired in their own slot.
 */
import { CHARGE_DEFINITION_DELIVERY_ID } from "../pricing/constants";
import {
  allocateSinglePromotion,
  applyAllocationsToComponents,
} from "./allocate";
import { calculateBenefit, isComplimentaryPromotion } from "./benefit";
import type { PromotionSlotClass } from "./constants";
import type {
  AppliedPromotion,
  MonetaryComponent,
  PrePromotionSnapshot,
  PromotionAllocation,
  PromotionCandidateResult,
  PromotionDefinition,
} from "./types";

export type EligiblePromotion = Readonly<{
  promotion: PromotionDefinition;
  couponId?: string | null;
}>;

export type BuildPromotionCandidatesOptions = Readonly<{
  deliveryChargeDefinitionIds?: readonly string[];
}>;

function deliveryChargeIds(
  options?: BuildPromotionCandidatesOptions,
): ReadonlySet<string> {
  const ids = options?.deliveryChargeDefinitionIds ?? [CHARGE_DEFINITION_DELIVERY_ID];
  return new Set(ids);
}

export function classifyPromotionSlot(
  promotion: PromotionDefinition,
  options?: BuildPromotionCandidatesOptions,
): PromotionSlotClass {
  if (promotion.benefit.benefitType === "delivery_fee_waiver") {
    return "DELIVERY_INCENTIVE";
  }
  const deliveryIds = deliveryChargeIds(options);
  const targetsDelivery = promotion.benefitTargets.some(
    (t) =>
      t.targetType === "charge" &&
      t.chargeDefinitionId !== null &&
      deliveryIds.has(t.chargeDefinitionId),
  );
  if (targetsDelivery) {
    // Activation rejects dual-class configs; defensive classification prefers delivery.
    const alsoMerchandise = promotion.benefitTargets.some(
      (t) =>
        t.targetType === "all_merchandise" ||
        t.targetType === "product" ||
        t.targetType === "variant",
    );
    if (!alsoMerchandise) return "DELIVERY_INCENTIVE";
  }
  return "PRIMARY_MERCHANDISE_OR_ORDER";
}

function toApplied(
  promotion: PromotionDefinition,
  realized: bigint,
  slotClass: PromotionSlotClass,
  couponId?: string | null,
): AppliedPromotion | null {
  const complimentary = isComplimentaryPromotion(promotion);
  // Zero realized delivery / merchandise savings are omitted from monetary
  // saving rows, but:
  // - complimentary identity must survive even when waived merchandise is ₹0
  // - submitted coupon identity must survive zero-realized delivery waivers so
  //   equal-payable classification is not collapsed into COUPON_VALID_NOT_SELECTED
  if (realized <= BigInt(0) && !complimentary && !couponId) return null;
  return {
    promotionId: promotion.id,
    code: promotion.code,
    displayName: promotion.displayName,
    triggerType: promotion.triggerType,
    stackingPolicy: promotion.stackingPolicy,
    realizedDiscountPaise: realized,
    couponId: couponId ?? null,
    slotClass,
    isComplimentary: complimentary || undefined,
    complimentaryProductId: complimentary
      ? (promotion.benefit.complimentaryProductId ?? null)
      : undefined,
    complimentaryVariantId: complimentary
      ? (promotion.benefit.complimentaryVariantId ?? null)
      : undefined,
    complimentaryQuantity: complimentary ? 1 : undefined,
  };
}

function candidateFromEligible(
  members: readonly EligiblePromotion[],
  snapshot: PrePromotionSnapshot,
  options: BuildPromotionCandidatesOptions | undefined,
  meta: {
    complimentaryCompetingNoneChosen?: boolean;
  } = {},
): PromotionCandidateResult {
  const allocations: PromotionAllocation[] = [];
  // Allocate each member independently against the original snapshot components.
  // Primary and delivery slots target disjoint component sets under the locked model.
  for (const ep of members) {
    const benefit = calculateBenefit(ep.promotion, snapshot);
    const complimentary = isComplimentaryPromotion(ep.promotion);
    if (benefit.nominalBenefitPaise <= BigInt(0) && !complimentary) {
      continue;
    }
    if (benefit.eligibleComponentIds.length === 0) {
      if (complimentary) continue;
      continue;
    }
    const comps = snapshot.components.filter((c) =>
      benefit.eligibleComponentIds.includes(c.componentId),
    );
    if (benefit.nominalBenefitPaise > BigInt(0)) {
      allocations.push(
        ...allocateSinglePromotion(ep.promotion.id, benefit.nominalBenefitPaise, comps),
      );
    }
  }

  const byPromo = new Map<string, bigint>();
  for (const a of allocations) {
    byPromo.set(a.promotionId, (byPromo.get(a.promotionId) ?? BigInt(0)) + a.amountPaise);
  }

  const applied: AppliedPromotion[] = [];
  const promotionIds: string[] = [];
  let primaryPromotionId: string | null = null;
  let deliveryPromotionId: string | null = null;
  let hasComplimentaryPrimary = false;

  for (const ep of members) {
    const slot = classifyPromotionSlot(ep.promotion, options);
    const realized = byPromo.get(ep.promotion.id) ?? BigInt(0);
    const app = toApplied(ep.promotion, realized, slot, ep.couponId);
    if (app) {
      applied.push(app);
      promotionIds.push(ep.promotion.id);
      if (slot === "PRIMARY_MERCHANDISE_OR_ORDER") {
        primaryPromotionId = ep.promotion.id;
        if (app.isComplimentary) hasComplimentaryPrimary = true;
      } else {
        deliveryPromotionId = ep.promotion.id;
      }
    } else if (
      isComplimentaryPromotion(ep.promotion) &&
      slot === "PRIMARY_MERCHANDISE_OR_ORDER"
    ) {
      // Retain complimentary identity with zero realized monetary amount.
      const retained = toApplied(ep.promotion, BigInt(0), slot, ep.couponId);
      if (retained) {
        applied.push(retained);
        promotionIds.push(ep.promotion.id);
        primaryPromotionId = ep.promotion.id;
        hasComplimentaryPrimary = true;
      }
    }
  }

  const discount = allocations.reduce((a, x) => a + x.amountPaise, BigInt(0));
  return {
    promotionIds,
    allocations,
    promotionDiscountTotalPaise: discount,
    postPromotionComponents: applyAllocationsToComponents(snapshot.components, allocations),
    appliedPromotions: applied,
    primaryPromotionId,
    deliveryPromotionId,
    hasComplimentaryPrimary,
    complimentaryCompetingNoneChosen: meta.complimentaryCompetingNoneChosen === true,
  };
}

function canPair(primary: EligiblePromotion, delivery: EligiblePromotion): boolean {
  return (
    primary.promotion.stackingPolicy === "combinable" &&
    delivery.promotion.stackingPolicy === "combinable"
  );
}

/**
 * Build valid slot-model candidates. Never constructs an unlimited all-combinable set.
 */
export function buildPromotionCandidates(
  eligible: readonly EligiblePromotion[],
  snapshot: PrePromotionSnapshot,
  options?: BuildPromotionCandidatesOptions,
): PromotionCandidateResult[] {
  const baseline: PromotionCandidateResult = {
    promotionIds: [],
    allocations: [],
    promotionDiscountTotalPaise: BigInt(0),
    postPromotionComponents: snapshot.components.map((c) => ({ ...c })),
    appliedPromotions: [],
    primaryPromotionId: null,
    deliveryPromotionId: null,
    hasComplimentaryPrimary: false,
    complimentaryCompetingNoneChosen: false,
  };

  const primariesAll = eligible.filter(
    (e) => classifyPromotionSlot(e.promotion, options) === "PRIMARY_MERCHANDISE_OR_ORDER",
  );
  const deliveries = eligible.filter(
    (e) => classifyPromotionSlot(e.promotion, options) === "DELIVERY_INCENTIVE",
  );

  const complimentaryPrimaries = primariesAll.filter((e) =>
    isComplimentaryPromotion(e.promotion),
  );
  const competingComplimentary = complimentaryPrimaries.length > 1;
  const primaries = competingComplimentary
    ? primariesAll.filter((e) => !isComplimentaryPromotion(e.promotion))
    : primariesAll;

  const candidates: PromotionCandidateResult[] = [
    {
      ...baseline,
      complimentaryCompetingNoneChosen: competingComplimentary,
    },
  ];

  const pushUnique = (members: readonly EligiblePromotion[]) => {
    candidates.push(
      candidateFromEligible(members, snapshot, options, {
        complimentaryCompetingNoneChosen: competingComplimentary,
      }),
    );
  };

  for (const primary of primaries) {
    pushUnique([primary]);
  }
  for (const delivery of deliveries) {
    pushUnique([delivery]);
  }
  for (const primary of primaries) {
    for (const delivery of deliveries) {
      if (!canPair(primary, delivery)) continue;
      pushUnique([primary, delivery]);
    }
  }

  return candidates;
}

/**
 * After candidate construction, unselected complimentary gift lines must not
 * remain as payable merchandise. Keep only the winning complimentary line
 * (already zeroed by allocation when applied).
 */
export function projectUnselectedComplimentaryGifts(
  candidate: PromotionCandidateResult,
  complimentaryGrossByLineId: ReadonlyMap<string, bigint>,
): {
  postPromotionComponents: MonetaryComponent[];
  removedGiftGrossPaise: bigint;
} {
  const selectedGiftLineId =
    candidate.hasComplimentaryPrimary && candidate.primaryPromotionId
      ? `complimentary:${candidate.primaryPromotionId}`
      : null;
  let removedGiftGrossPaise = BigInt(0);
  const postPromotionComponents = candidate.postPromotionComponents.filter((c) => {
    if (!c.lineId || !c.lineId.startsWith("complimentary:")) return true;
    if (selectedGiftLineId && c.lineId === selectedGiftLineId) return true;
    removedGiftGrossPaise += complimentaryGrossByLineId.get(c.lineId) ?? c.amountPaise;
    return false;
  });
  return { postPromotionComponents, removedGiftGrossPaise };
}

/**
 * Select winning candidate after caller attaches post-tax grand totals.
 * Safety: winner.grandTotal must be <= baseline.grandTotal.
 *
 * Order:
 * 1. Lowest grandTotalPaise
 * 2. Complimentary equal-payable product rule (before technical ties)
 * 3. Higher realized discount → higher priority → earlier starts_at → lex id set
 */
export function selectBestCandidate<
  T extends {
    promotionDiscountTotalPaise: bigint;
    promotionIds: readonly string[];
    grandTotalPaise: bigint;
    hasComplimentaryPrimary?: boolean;
    primaryPromotionId?: string | null;
  },
>(
  candidates: readonly T[],
  promotionsById: ReadonlyMap<string, PromotionDefinition>,
): T {
  if (candidates.length === 0) {
    throw new Error("selectBestCandidate requires at least baseline candidate");
  }
  const baseline = candidates[0]!;
  let best = baseline;

  const hasComplimentary = (c: T): boolean => {
    if (c.hasComplimentaryPrimary === true) return true;
    return c.promotionIds.some((id) => {
      const p = promotionsById.get(id);
      return p ? isComplimentaryPromotion(p) : false;
    });
  };

  const hasPrimary = (c: T): boolean => {
    if (c.primaryPromotionId) return true;
    return c.promotionIds.some((id) => {
      const p = promotionsById.get(id);
      if (!p) return false;
      return classifyPromotionSlot(p) === "PRIMARY_MERCHANDISE_OR_ORDER";
    });
  };

  for (const c of candidates) {
    if (c.grandTotalPaise > baseline.grandTotalPaise) continue; // safety
    if (c.grandTotalPaise < best.grandTotalPaise) {
      best = c;
      continue;
    }
    if (c.grandTotalPaise > best.grandTotalPaise) continue;

    // Equal payable: product-owned complimentary rule first
    // (complimentary primary vs otherwise-equivalent combination with no primary).
    const cGift = hasComplimentary(c);
    const bestGift = hasComplimentary(best);
    if (cGift && !hasPrimary(best)) {
      best = c;
      continue;
    }
    if (bestGift && !hasPrimary(c)) {
      continue;
    }

    // Remaining deterministic ties (do not override complimentary rule).
    if (c.promotionDiscountTotalPaise !== best.promotionDiscountTotalPaise) {
      if (c.promotionDiscountTotalPaise > best.promotionDiscountTotalPaise) best = c;
      continue;
    }
    const pri = (ids: readonly string[]) =>
      ids.reduce(
        (m, id) => Math.max(m, promotionsById.get(id)?.priority ?? 0),
        Number.NEGATIVE_INFINITY,
      );
    const pBest = pri(best.promotionIds);
    const pCand = pri(c.promotionIds);
    if (pCand !== pBest) {
      if (pCand > pBest) best = c;
      continue;
    }
    const earliest = (ids: readonly string[]) =>
      ids.reduce(
        (m, id) =>
          Math.min(m, promotionsById.get(id)?.startsAt.getTime() ?? Number.POSITIVE_INFINITY),
        Number.POSITIVE_INFINITY,
      );
    const eBest = earliest(best.promotionIds);
    const eCand = earliest(c.promotionIds);
    if (eCand !== eBest) {
      if (eCand < eBest) best = c;
      continue;
    }
    const key = (ids: readonly string[]) => [...ids].sort().join(",");
    if (key(c.promotionIds).localeCompare(key(best.promotionIds)) < 0) best = c;
  }
  return best;
}
