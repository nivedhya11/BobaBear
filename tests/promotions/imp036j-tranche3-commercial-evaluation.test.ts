/**
 * IMP-036J Tranche 3 — COMMERCIAL_EVALUATION domain proof.
 *
 * Maps to domain portions of:
 *   AC-036J-001-02, AC-036J-003-01/02, AC-036J-004-01,
 *   AC-036J-009-01..04, AC-036J-010-01..04, AC-036J-013-01/04
 *
 * Does not claim HTTP / browser / payment / authoring aspects complete.
 */
import { describe, expect, it } from "vitest";

import { CHARGE_DEFINITION_DELIVERY_ID } from "../../src/shared/pricing/constants";
import {
  buildCommercialExplanation,
  buildPromotionCandidates,
  buildThresholdProgress,
  calculateBenefit,
  classifyCouponPresentation,
  evaluateEligibility,
  projectUnselectedComplimentaryGifts,
  selectBestCandidate,
  evaluatePromotions,
  type MonetaryComponent,
  type PrePromotionSnapshot,
  type PromotionDefinition,
} from "../../src/shared/promotions";
import {
  ALL_MERCH_BENEFIT,
  ALL_MERCH_QUALIFIER,
  basePromo,
  fixedBenefit,
  moneyComponent,
  snapshotOf,
} from "./helpers";

const DELIVERY_CHARGE: MonetaryComponent = {
  componentId: `charge:${CHARGE_DEFINITION_DELIVERY_ID}`,
  kind: "charge",
  lineId: null,
  lineSequence: 100,
  variantId: null,
  productId: null,
  chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
  amountPaise: BigInt(4000),
  taxCategoryId: "tax",
};

const DELIVERY_BENEFIT_TARGET = {
  targetRole: "benefit" as const,
  targetType: "charge" as const,
  productId: null,
  variantId: null,
  chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
};

const DELIVERY_QUALIFIER = {
  targetRole: "qualifier" as const,
  targetType: "all_merchandise" as const,
  productId: null,
  variantId: null,
  chargeDefinitionId: null,
};

function merchSnapshot(merchandisePaise: bigint, deliveryPaise = BigInt(4000)): PrePromotionSnapshot {
  return snapshotOf([
    moneyComponent({ componentId: "c1", amountPaise: merchandisePaise }),
    {
      ...DELIVERY_CHARGE,
      amountPaise: deliveryPaise,
    },
  ]);
}

function fixedPrimary(
  id: string,
  amount: bigint,
  stacking: "exclusive" | "combinable",
  extras: Partial<PromotionDefinition> = {},
): PromotionDefinition {
  return basePromo({
    id,
    code: id,
    displayName: id,
    stackingPolicy: stacking,
    benefit: fixedBenefit(amount),
    ...extras,
  });
}

function deliveryWaiver(
  id: string,
  stacking: "exclusive" | "combinable",
  extras: Partial<PromotionDefinition> = {},
): PromotionDefinition {
  return basePromo({
    id,
    code: id,
    displayName: id,
    stackingPolicy: stacking,
    benefit: {
      benefitType: "delivery_fee_waiver",
      percentageBps: null,
      fixedAmountPaise: null,
      maximumDiscountPaise: null,
      buyQuantity: null,
      getQuantity: null,
      repeatable: null,
      maximumRewardQuantity: null,
      includeModifiers: false,
      includeBundleDeltas: false,
    },
    qualifierTargets: [DELIVERY_QUALIFIER],
    benefitTargets: [DELIVERY_BENEFIT_TARGET],
    ...extras,
  });
}

function complimentaryPromo(
  id: string,
  variantId: string,
  productId: string,
  stacking: "exclusive" | "combinable" = "exclusive",
): PromotionDefinition {
  return basePromo({
    id,
    code: id,
    displayName: id,
    stackingPolicy: stacking,
    complimentaryItem: true,
    benefit: {
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
    },
    qualifierTargets: [ALL_MERCH_QUALIFIER],
    benefitTargets: [ALL_MERCH_BENEFIT],
  });
}

function scoreWithoutTax(
  candidates: ReturnType<typeof buildPromotionCandidates>,
  baselineMerchandise: bigint,
  deliveryPaise: bigint,
) {
  const baseline = baselineMerchandise + deliveryPaise;
  return candidates.map((c) => ({
    ...c,
    grandTotalPaise: baseline - c.promotionDiscountTotalPaise,
  }));
}

describe("IMP-036J T3 slot model / stacking (AC-036J-010)", () => {
  it("1. primary + compatible delivery incentive both apply", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(4000));
    const primary = fixedPrimary("p80", BigInt(8000), "combinable");
    const delivery = deliveryWaiver("d40", "combinable");
    const candidates = buildPromotionCandidates(
      [{ promotion: primary }, { promotion: delivery }],
      snapshot,
    );
    const pair = candidates.find(
      (c) => c.promotionIds.includes("p80") && c.promotionIds.includes("d40"),
    );
    expect(pair).toBeTruthy();
    expect(pair!.promotionDiscountTotalPaise).toBe(BigInt(12000));
    expect(pair!.appliedPromotions).toHaveLength(2);
  });

  it("2. two primary merchandise benefits never stack", () => {
    const snapshot = merchSnapshot(BigInt(100000));
    const candidates = buildPromotionCandidates(
      [
        { promotion: fixedPrimary("a", BigInt(8000), "combinable") },
        { promotion: fixedPrimary("b", BigInt(9000), "combinable") },
      ],
      snapshot,
    );
    expect(candidates.some((c) => c.promotionIds.length === 2)).toBe(false);
  });

  it("3. BOGO does not stack with another merchandise discount", () => {
    const snapshot = merchSnapshot(BigInt(100000));
    const bogo = basePromo({
      id: "bogo",
      stackingPolicy: "exclusive",
      benefit: {
        benefitType: "buy_x_get_y",
        percentageBps: null,
        fixedAmountPaise: null,
        maximumDiscountPaise: null,
        buyQuantity: 1,
        getQuantity: 1,
        repeatable: false,
        maximumRewardQuantity: null,
        includeModifiers: false,
        includeBundleDeltas: false,
      },
    });
    const other = fixedPrimary("merch", BigInt(5000), "combinable");
    const candidates = buildPromotionCandidates(
      [{ promotion: bogo }, { promotion: other }],
      snapshot,
    );
    expect(
      candidates.some(
        (c) => c.promotionIds.includes("bogo") && c.promotionIds.includes("merch"),
      ),
    ).toBe(false);
  });

  it("4. one delivery incentive maximum", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(4000));
    const candidates = buildPromotionCandidates(
      [
        { promotion: deliveryWaiver("d1", "combinable") },
        { promotion: deliveryWaiver("d2", "combinable") },
      ],
      snapshot,
    );
    expect(candidates.some((c) => c.promotionIds.length === 2)).toBe(false);
  });

  it("5. best COMPLETE combination wins by final payable", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(4000));
    const weakPairPrimary = fixedPrimary("weak", BigInt(5000), "combinable");
    const weakDelivery = deliveryWaiver("d20", "combinable");
    const strongExclusive = fixedPrimary("strong", BigInt(15000), "exclusive");
    const candidates = buildPromotionCandidates(
      [
        { promotion: weakPairPrimary },
        { promotion: weakDelivery },
        { promotion: strongExclusive },
      ],
      snapshot,
    );
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(4000));
    const byId = new Map(
      [weakPairPrimary, weakDelivery, strongExclusive].map((p) => [p.id, p] as const),
    );
    const winner = selectBestCandidate(scored, byId);
    expect(winner.promotionIds).toEqual(["strong"]);
  });

  it("6. approved ₹80 + ₹40 pair beats exclusive ₹90 coupon", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(4000));
    const auto80 = fixedPrimary("auto80", BigInt(8000), "combinable");
    const del40 = deliveryWaiver("del40", "combinable");
    const coupon90 = fixedPrimary("c90", BigInt(9000), "exclusive", {
      triggerType: "coupon",
    });
    const candidates = buildPromotionCandidates(
      [
        { promotion: auto80 },
        { promotion: del40 },
        { promotion: coupon90, couponId: "coup-90" },
      ],
      snapshot,
    );
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(4000));
    const winner = selectBestCandidate(
      scored,
      new Map([auto80, del40, coupon90].map((p) => [p.id, p] as const)),
    );
    expect([...winner.promotionIds].sort()).toEqual(["auto80", "del40"].sort());
    expect(winner.promotionDiscountTotalPaise).toBe(BigInt(12000));
  });

  it("7. approved ₹90 + ₹20 pair beats exclusive ₹100 Offer", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(2000));
    const coupon90 = fixedPrimary("c90", BigInt(9000), "combinable", {
      triggerType: "coupon",
    });
    const del20 = deliveryWaiver("del20", "combinable");
    const auto100 = fixedPrimary("auto100", BigInt(10000), "exclusive");
    const candidates = buildPromotionCandidates(
      [
        { promotion: coupon90, couponId: "coup" },
        { promotion: del20 },
        { promotion: auto100 },
      ],
      snapshot,
    );
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(2000));
    const winner = selectBestCandidate(
      scored,
      new Map([coupon90, del20, auto100].map((p) => [p.id, p] as const)),
    );
    expect([...winner.promotionIds].sort()).toEqual(["c90", "del20"].sort());
  });

  it("8. merchandise coupon can pair with compatible delivery incentive", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(4000));
    const coupon = fixedPrimary("mc", BigInt(5000), "combinable", { triggerType: "coupon" });
    const del = deliveryWaiver("dd", "combinable");
    const candidates = buildPromotionCandidates(
      [{ promotion: coupon, couponId: "c1" }, { promotion: del }],
      snapshot,
    );
    expect(
      candidates.some(
        (c) => c.promotionIds.includes("mc") && c.promotionIds.includes("dd"),
      ),
    ).toBe(true);
  });

  it("9. delivery coupon remains in delivery slot", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(4000));
    const delCoupon = deliveryWaiver("dc", "combinable", { triggerType: "coupon" });
    const candidates = buildPromotionCandidates(
      [{ promotion: delCoupon, couponId: "c-del" }],
      snapshot,
    );
    const win = candidates.find((c) => c.promotionIds.includes("dc"))!;
    expect(win.deliveryPromotionId).toBe("dc");
    expect(win.primaryPromotionId).toBeNull();
    expect(win.appliedPromotions.every((a) => a.slotClass === "DELIVERY_INCENTIVE")).toBe(
      true,
    );
  });

  it("10. standing ₹0 delivery produces no fake saving", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(0));
    const del = deliveryWaiver("d0", "combinable");
    const benefit = calculateBenefit(del, snapshot);
    expect(benefit.nominalBenefitPaise).toBe(BigInt(0));
    const candidates = buildPromotionCandidates([{ promotion: del }], snapshot);
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(scored, new Map([["d0", del]]));
    expect(winner.promotionDiscountTotalPaise).toBe(BigInt(0));
    const explanation = buildCommercialExplanation({
      winner: { ...winner, grandTotalPaise: winner.grandTotalPaise },
      submittedCouponResult: null,
      couponPresentationClass: null,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: false,
      promotionsById: new Map([["d0", del]]),
    });
    expect(explanation.deliverySavingPaise).toBe(BigInt(0));
    expect(explanation.totalSavedPaise).toBe(BigInt(0));
  });
});

describe("IMP-036J T3 coupon result classes (AC-036J-009)", () => {
  const snapshot = merchSnapshot(BigInt(100000), BigInt(0));

  it("11. valid coupon strictly worse => COUPON_VALID_NOT_SELECTED", () => {
    const auto = fixedPrimary("auto", BigInt(8000), "exclusive");
    const coupon = fixedPrimary("coup", BigInt(5000), "exclusive", {
      triggerType: "coupon",
    });
    const candidates = buildPromotionCandidates(
      [{ promotion: auto }, { promotion: coupon, couponId: "c" }],
      snapshot,
    );
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(
      scored,
      new Map([auto, coupon].map((p) => [p.id, p] as const)),
    );
    expect(winner.promotionIds).toEqual(["auto"]);
    const couponCand = scored.find((c) => c.promotionIds.includes("coup"))!;
    const cls = classifyCouponPresentation({
      submittedCouponResult: {
        status: "VALID_BUT_NOT_SELECTED",
        reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
        couponId: "c",
        promotionId: "coup",
        canonicalCode: "COUP",
      },
      winner,
      bestCouponGrandTotalPaise: couponCand.grandTotalPaise,
      bestNonCouponGrandTotalPaise: winner.grandTotalPaise,
      couponPromotionId: "coup",
    });
    expect(cls).toBe("COUPON_VALID_NOT_SELECTED");
  });

  it("12. equal-payable coupon selected => COUPON_EQUAL_PAYABLE_SELECTED", () => {
    const auto = fixedPrimary("auto", BigInt(5000), "exclusive", {
      priority: 1,
      startsAt: new Date("2026-02-01T00:00:00Z"),
    });
    const coupon = fixedPrimary("coup", BigInt(5000), "exclusive", {
      triggerType: "coupon",
      priority: 10,
      startsAt: new Date("2026-01-01T00:00:00Z"),
    });
    const candidates = buildPromotionCandidates(
      [{ promotion: auto }, { promotion: coupon, couponId: "c" }],
      snapshot,
    );
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(
      scored,
      new Map([auto, coupon].map((p) => [p.id, p] as const)),
    );
    expect(winner.promotionIds).toEqual(["coup"]);
    const nonCoupon = scored
      .filter((c) => !c.promotionIds.includes("coup"))
      .sort((a, b) => (a.grandTotalPaise < b.grandTotalPaise ? -1 : 1))[0]!;
    const cls = classifyCouponPresentation({
      submittedCouponResult: {
        status: "APPLIED",
        reasonCode: "APPLIED",
        couponId: "c",
        promotionId: "coup",
        canonicalCode: "COUP",
      },
      winner,
      bestCouponGrandTotalPaise: winner.grandTotalPaise,
      bestNonCouponGrandTotalPaise: nonCoupon.grandTotalPaise,
      couponPromotionId: "coup",
    });
    expect(cls).toBe("COUPON_EQUAL_PAYABLE_SELECTED");
  });

  it("13. equal-payable coupon not selected => COUPON_EQUAL_PAYABLE_NOT_SELECTED", () => {
    const auto = fixedPrimary("auto", BigInt(5000), "exclusive", {
      priority: 10,
      startsAt: new Date("2026-01-01T00:00:00Z"),
    });
    const coupon = fixedPrimary("coup", BigInt(5000), "exclusive", {
      triggerType: "coupon",
      priority: 1,
      startsAt: new Date("2026-02-01T00:00:00Z"),
    });
    const candidates = buildPromotionCandidates(
      [{ promotion: auto }, { promotion: coupon, couponId: "c" }],
      snapshot,
    );
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(
      scored,
      new Map([auto, coupon].map((p) => [p.id, p] as const)),
    );
    expect(winner.promotionIds).toEqual(["auto"]);
    const couponCand = scored.find((c) => c.promotionIds.includes("coup"))!;
    const cls = classifyCouponPresentation({
      submittedCouponResult: {
        status: "VALID_BUT_NOT_SELECTED",
        reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
        couponId: "c",
        promotionId: "coup",
        canonicalCode: "COUP",
      },
      winner,
      bestCouponGrandTotalPaise: couponCand.grandTotalPaise,
      bestNonCouponGrandTotalPaise: winner.grandTotalPaise,
      couponPromotionId: "coup",
    });
    expect(cls).toBe("COUPON_EQUAL_PAYABLE_NOT_SELECTED");
  });
});

describe("IMP-036J T3 complimentary (AC-036J-013)", () => {
  it("14. complimentary equal payable selects complimentary", () => {
    const giftVariant = "gift-v";
    const giftProduct = "gift-p";
    const giftComponent = moneyComponent({
      componentId: "gift-base",
      amountPaise: BigInt(0),
      variantId: giftVariant,
      productId: giftProduct,
      lineId: "complimentary:g1",
    });
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      giftComponent,
    ]);
    const gift = complimentaryPromo("g1", giftVariant, giftProduct);
    const candidates = buildPromotionCandidates([{ promotion: gift }], snapshot);
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    for (const c of scored) {
      c.grandTotalPaise = BigInt(100000);
    }
    const winner = selectBestCandidate(scored, new Map([["g1", gift]]));
    expect(winner.hasComplimentaryPrimary).toBe(true);
    expect(winner.promotionIds).toContain("g1");
  });

  it("15. complimentary with zero realized monetary amount retains identity", () => {
    const giftVariant = "gift-v";
    const giftProduct = "gift-p";
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: BigInt(0),
        variantId: giftVariant,
        productId: giftProduct,
        lineId: "complimentary:g1",
      }),
    ]);
    const gift = complimentaryPromo("g1", giftVariant, giftProduct);
    const candidates = buildPromotionCandidates([{ promotion: gift }], snapshot);
    const giftCand = candidates.find((c) => c.promotionIds.includes("g1"))!;
    expect(giftCand.appliedPromotions.some((a) => a.isComplimentary)).toBe(true);
    expect(giftCand.hasComplimentaryPrimary).toBe(true);
  });

  it("16–17. two qualifying complimentary Offers => NONE_CHOSEN; non-gift still compete", () => {
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "g1-base",
        amountPaise: BigInt(1000),
        variantId: "v1",
        productId: "p1",
        lineId: "complimentary:g1",
      }),
      moneyComponent({
        componentId: "g2-base",
        amountPaise: BigInt(2000),
        variantId: "v2",
        productId: "p2",
        lineId: "complimentary:g2",
      }),
    ]);
    const g1 = complimentaryPromo("g1", "v1", "p1");
    const g2 = complimentaryPromo("g2", "v2", "p2");
    const merch = fixedPrimary("m50", BigInt(5000), "exclusive");
    const candidates = buildPromotionCandidates(
      [{ promotion: g1 }, { promotion: g2 }, { promotion: merch }],
      snapshot,
    );
    expect(candidates.every((c) => c.complimentaryCompetingNoneChosen === true)).toBe(true);
    expect(candidates.some((c) => c.promotionIds.includes("g1"))).toBe(false);
    expect(candidates.some((c) => c.promotionIds.includes("g2"))).toBe(false);
    expect(candidates.some((c) => c.promotionIds.includes("m50"))).toBe(true);
    const scored = scoreWithoutTax(candidates, BigInt(103000), BigInt(0));
    const winner = selectBestCandidate(
      scored,
      new Map([g1, g2, merch].map((p) => [p.id, p] as const)),
    );
    expect(winner.promotionIds).toEqual(["m50"]);
  });

  it("AR-036J-T3-01 A: gift-only non-zero resolved price is not monetary saving", () => {
    const giftPrice = BigInt(2500);
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: giftPrice,
        variantId: "v1",
        productId: "p1",
        lineId: "complimentary:g1",
      }),
    ]);
    const gift = complimentaryPromo("g1", "v1", "p1");
    const candidates = buildPromotionCandidates([{ promotion: gift }], snapshot);
    const giftCand = candidates.find((c) => c.promotionIds.includes("g1"))!;
    expect(giftCand.appliedPromotions.some((a) => a.isComplimentary === true)).toBe(true);
    expect(
      giftCand.appliedPromotions.find((a) => a.isComplimentary)?.realizedDiscountPaise,
    ).toBe(giftPrice);
    const projected = projectUnselectedComplimentaryGifts(
      giftCand,
      new Map([["complimentary:g1", giftPrice]]),
    );
    expect(projected.postPromotionComponents.some((c) => c.lineId === "complimentary:g1")).toBe(
      true,
    );
    const giftLine = projected.postPromotionComponents.find(
      (c) => c.lineId === "complimentary:g1",
    )!;
    expect(giftLine.amountPaise).toBe(BigInt(0));
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(scored, new Map([["g1", gift]]));
    expect(winner.promotionIds).toContain("g1");
    const explanation = buildCommercialExplanation({
      winner: { ...winner, grandTotalPaise: BigInt(100000) },
      submittedCouponResult: null,
      couponPresentationClass: null,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: false,
      promotionsById: new Map([["g1", gift]]),
    });
    expect(explanation.complimentary).toEqual({
      competingOffers: "NONE",
      promotionId: "g1",
      productId: "p1",
      variantId: "v1",
      quantity: 1,
      merchandiseChargePaise: 0,
    });
    expect(explanation.merchandiseOrOrderSavingPaise).toBe(BigInt(0));
    expect(explanation.deliverySavingPaise).toBe(BigInt(0));
    expect(explanation.totalSavedPaise).toBe(BigInt(0));
  });

  it("AR-036J-T3-01 B: gift + delivery — totalSaved is real delivery only", () => {
    const giftPrice = BigInt(2500);
    const deliveryPaise = BigInt(4000);
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: giftPrice,
        variantId: "v1",
        productId: "p1",
        lineId: "complimentary:g1",
      }),
      {
        ...DELIVERY_CHARGE,
        amountPaise: deliveryPaise,
      },
    ]);
    const gift = complimentaryPromo("g1", "v1", "p1", "combinable");
    const delivery = deliveryWaiver("d40", "combinable");
    const candidates = buildPromotionCandidates(
      [{ promotion: gift }, { promotion: delivery }],
      snapshot,
    );
    const pair = candidates.find(
      (c) => c.promotionIds.includes("g1") && c.promotionIds.includes("d40"),
    )!;
    expect(pair).toBeTruthy();
    const scored = candidates.map((c) => ({
      ...c,
      grandTotalPaise: BigInt(100000) + deliveryPaise - c.promotionDiscountTotalPaise,
    }));
    const winner = selectBestCandidate(
      scored,
      new Map([gift, delivery].map((p) => [p.id, p] as const)),
    );
    expect(winner.promotionIds).toEqual(expect.arrayContaining(["g1", "d40"]));
    const explanation = buildCommercialExplanation({
      winner,
      submittedCouponResult: null,
      couponPresentationClass: null,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: false,
      promotionsById: new Map([gift, delivery].map((p) => [p.id, p] as const)),
    });
    expect(explanation.complimentary?.competingOffers).toBe("NONE");
    expect(explanation.merchandiseOrOrderSavingPaise).toBe(BigInt(0));
    expect(explanation.deliverySavingPaise).toBe(deliveryPaise);
    expect(explanation.totalSavedPaise).toBe(deliveryPaise);
    expect(explanation.totalSavedPaise).not.toBe(giftPrice + deliveryPaise);
  });

  it("AR-036J-T3-01 C: gift whose resolved amount is zero — identity, no fabricated saving", () => {
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: BigInt(0),
        variantId: "v1",
        productId: "p1",
        lineId: "complimentary:g1",
      }),
    ]);
    const gift = complimentaryPromo("g1", "v1", "p1");
    const candidates = buildPromotionCandidates([{ promotion: gift }], snapshot);
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(scored, new Map([["g1", gift]]));
    expect(winner.hasComplimentaryPrimary).toBe(true);
    const explanation = buildCommercialExplanation({
      winner: { ...winner, grandTotalPaise: BigInt(100000) },
      submittedCouponResult: null,
      couponPresentationClass: null,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: false,
      promotionsById: new Map([["g1", gift]]),
    });
    expect(explanation.complimentary).toEqual({
      competingOffers: "NONE",
      promotionId: "g1",
      productId: "p1",
      variantId: "v1",
      quantity: 1,
      merchandiseChargePaise: 0,
    });
    expect(explanation.totalSavedPaise).toBe(BigInt(0));
  });

  it("AR-036J-T3-02 A: ordinary no qualifying gift is not NONE_CHOSEN", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(0));
    const merch = fixedPrimary("m50", BigInt(5000), "exclusive");
    const candidates = buildPromotionCandidates([{ promotion: merch }], snapshot);
    expect(candidates.every((c) => c.complimentaryCompetingNoneChosen !== true)).toBe(true);
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(scored, new Map([["m50", merch]]));
    const explanation = buildCommercialExplanation({
      winner,
      submittedCouponResult: null,
      couponPresentationClass: null,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: false,
      promotionsById: new Map([["m50", merch]]),
    });
    expect(explanation.complimentary).toBeNull();
  });

  it("AR-036J-T3-02 B: one qualifying gift → selected; not NONE_CHOSEN", () => {
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: BigInt(2500),
        variantId: "v1",
        productId: "p1",
        lineId: "complimentary:g1",
      }),
    ]);
    const gift = complimentaryPromo("g1", "v1", "p1");
    const candidates = buildPromotionCandidates([{ promotion: gift }], snapshot);
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(scored, new Map([["g1", gift]]));
    const explanation = buildCommercialExplanation({
      winner: { ...winner, grandTotalPaise: BigInt(100000) },
      submittedCouponResult: null,
      couponPresentationClass: null,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: false,
      promotionsById: new Map([["g1", gift]]),
    });
    expect(explanation.complimentary).toMatchObject({
      competingOffers: "NONE",
      promotionId: "g1",
      productId: "p1",
      variantId: "v1",
    });
  });

  it("AR-036J-T3-02 C: two qualifying gifts → explicit NONE_CHOSEN in CommercialExplanation", () => {
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "g1-base",
        amountPaise: BigInt(1000),
        variantId: "v1",
        productId: "p1",
        lineId: "complimentary:g1",
      }),
      moneyComponent({
        componentId: "g2-base",
        amountPaise: BigInt(2000),
        variantId: "v2",
        productId: "p2",
        lineId: "complimentary:g2",
      }),
    ]);
    const g1 = complimentaryPromo("g1", "v1", "p1");
    const g2 = complimentaryPromo("g2", "v2", "p2");
    const candidates = buildPromotionCandidates(
      [{ promotion: g1 }, { promotion: g2 }],
      snapshot,
    );
    expect(candidates.every((c) => c.complimentaryCompetingNoneChosen === true)).toBe(true);
    expect(candidates.every((c) => !c.hasComplimentaryPrimary)).toBe(true);
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(
      scored,
      new Map([g1, g2].map((p) => [p.id, p] as const)),
    );
    expect(winner.promotionIds).toEqual([]);
    const explanation = buildCommercialExplanation({
      winner: { ...winner, grandTotalPaise: BigInt(100000) },
      submittedCouponResult: null,
      couponPresentationClass: null,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: true,
      promotionsById: new Map([g1, g2].map((p) => [p.id, p] as const)),
    });
    expect(explanation.complimentary).toEqual({ competingOffers: "NONE_CHOSEN" });
    expect(
      explanation.complimentary && "promotionId" in explanation.complimentary
        ? explanation.complimentary.promotionId
        : undefined,
    ).toBeUndefined();
  });

  it("AR-036J-T3-02 D: NONE_CHOSEN + ordinary monetary Offer still competes", () => {
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "g1-base",
        amountPaise: BigInt(1000),
        variantId: "v1",
        productId: "p1",
        lineId: "complimentary:g1",
      }),
      moneyComponent({
        componentId: "g2-base",
        amountPaise: BigInt(2000),
        variantId: "v2",
        productId: "p2",
        lineId: "complimentary:g2",
      }),
    ]);
    const g1 = complimentaryPromo("g1", "v1", "p1");
    const g2 = complimentaryPromo("g2", "v2", "p2");
    const merch = fixedPrimary("m80", BigInt(8000), "exclusive");
    const candidates = buildPromotionCandidates(
      [{ promotion: g1 }, { promotion: g2 }, { promotion: merch }],
      snapshot,
    );
    const scored = scoreWithoutTax(candidates, BigInt(103000), BigInt(0));
    const winner = selectBestCandidate(
      scored,
      new Map([g1, g2, merch].map((p) => [p.id, p] as const)),
    );
    expect(winner.promotionIds).toEqual(["m80"]);
    const explanation = buildCommercialExplanation({
      winner,
      submittedCouponResult: null,
      couponPresentationClass: null,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: true,
      promotionsById: new Map([g1, g2, merch].map((p) => [p.id, p] as const)),
    });
    expect(explanation.complimentary).toEqual({ competingOffers: "NONE_CHOSEN" });
    expect(explanation.merchandiseOrOrderSavingPaise).toBe(BigInt(8000));
    expect(explanation.totalSavedPaise).toBe(BigInt(8000));
  });

  it("coupon-backed complimentary unavailable sets the measurement flag only when previously presented", () => {
    const gift = {
      ...complimentaryPromo("g1", "v1", "p1"),
      triggerType: "coupon" as const,
    };
    const input = {
      promotions: [gift],
      snapshot: merchSnapshot(BigInt(100000), BigInt(0)),
      context: {
        at: new Date("2026-06-01T00:00:00Z"),
        brandId: "brand",
        territoryId: null,
        organizationId: null,
        outletId: "o1",
        salesChannel: "direct" as const,
        complimentaryVariantAvailability: new Map([["v1", false]]),
      },
      submittedCoupon: {
        rawCode: "GIFT",
        coupon: {
          id: "c1",
          promotionId: "g1",
          canonicalCode: "GIFT",
          origin: "manual" as const,
          status: "active" as const,
          startsAt: null,
          endsAt: null,
          maximumRedemptions: null,
          maximumRedemptionsPerCustomer: null,
        },
        promotion: gift,
      },
    };
    const firstApply = evaluatePromotions(input);
    expect(firstApply.submittedCouponResult?.status).toBe("NOT_APPLICABLE");
    expect(firstApply.submittedCouponResult?.reasonCode).toBe(
      "COMPLIMENTARY_UNAVAILABLE",
    );
    expect(firstApply.complimentaryItemUnavailable).toBe(false);

    const recovered = evaluatePromotions({
      ...input,
      previouslyPresentedComplimentaryVariantId: "v1",
    });
    expect(recovered.submittedCouponResult?.reasonCode).toBe(
      "COMPLIMENTARY_UNAVAILABLE",
    );
    expect(recovered.complimentaryItemUnavailable).toBe(true);
  });

  it("unrelated unavailable complimentary does not classify shown-item recovery", () => {
    const gift = complimentaryPromo("g1", "v1", "p1");
    const merch = fixedPrimary("m80", BigInt(8000), "exclusive");
    const evaluated = evaluatePromotions({
      promotions: [gift, merch],
      snapshot: merchSnapshot(BigInt(100000), BigInt(0)),
      context: {
        at: new Date("2026-06-01T00:00:00Z"),
        brandId: "brand",
        territoryId: null,
        organizationId: null,
        outletId: "o1",
        salesChannel: "direct",
        complimentaryVariantAvailability: new Map([["v1", false]]),
      },
    });
    expect(evaluated.complimentaryItemUnavailable).toBe(false);
    expect(evaluated.eligiblePromotionIds).toEqual(["m80"]);
  });

  it("competing complimentary none chosen does not become shown-item unavailable", () => {
    const g1 = complimentaryPromo("g1", "v1", "p1");
    const g2 = complimentaryPromo("g2", "v2", "p2");
    const merch = fixedPrimary("m80", BigInt(8000), "exclusive");
    const evaluated = evaluatePromotions({
      promotions: [g1, g2, merch],
      snapshot: merchSnapshot(BigInt(100000), BigInt(0)),
      context: {
        at: new Date("2026-06-01T00:00:00Z"),
        brandId: "brand",
        territoryId: null,
        organizationId: null,
        outletId: "o1",
        salesChannel: "direct",
        complimentaryVariantAvailability: new Map([
          ["v1", true],
          ["v2", true],
        ]),
      },
    });
    expect(evaluated.complimentaryCompetingNoneChosen).toBe(true);
    expect(evaluated.complimentaryItemUnavailable).toBe(false);
  });

  it("previously presented complimentary variant unavailable classifies recovery", () => {
    const gift = complimentaryPromo("g1", "v1", "p1");
    const merch = fixedPrimary("m80", BigInt(8000), "exclusive");
    const evaluated = evaluatePromotions({
      promotions: [gift, merch],
      snapshot: merchSnapshot(BigInt(100000), BigInt(0)),
      context: {
        at: new Date("2026-06-01T00:00:00Z"),
        brandId: "brand",
        territoryId: null,
        organizationId: null,
        outletId: "o1",
        salesChannel: "direct",
        complimentaryVariantAvailability: new Map([["v1", false]]),
      },
      previouslyPresentedComplimentaryVariantId: "v1",
    });
    expect(evaluated.complimentaryItemUnavailable).toBe(true);
  });
});

describe("IMP-036J T3 AR-036J-T3-03 zero-realized delivery coupon identity", () => {
  it("A. standing ₹0 + coupon selected tie: candidate identity without AppliedPromotion", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(0));
    const delCoupon = deliveryWaiver("dc0", "combinable", { triggerType: "coupon" });
    const candidates = buildPromotionCandidates(
      [{ promotion: delCoupon, couponId: "c-del0" }],
      snapshot,
    );
    const couponCand = candidates.find((c) => c.promotionIds.includes("dc0"));
    expect(couponCand).toBeTruthy();
    expect(couponCand!.promotionIds).toContain("dc0");
    expect(couponCand!.deliveryPromotionId).toBe("dc0");
    expect(couponCand!.promotionDiscountTotalPaise).toBe(BigInt(0));
    expect(couponCand!.appliedPromotions.some((a) => a.promotionId === "dc0")).toBe(false);

    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(scored, new Map([["dc0", delCoupon]]));
    expect(winner.promotionIds).toContain("dc0");
    expect(winner.appliedPromotions.some((a) => a.promotionId === "dc0")).toBe(false);
    expect(winner.promotionDiscountTotalPaise).toBe(BigInt(0));

    const couponTotal =
      scored.find((c) => c.promotionIds.includes("dc0"))?.grandTotalPaise ?? null;
    const nonCouponTotal =
      scored
        .filter((c) => !c.promotionIds.includes("dc0"))
        .sort((a, b) => (a.grandTotalPaise < b.grandTotalPaise ? -1 : 1))[0]
        ?.grandTotalPaise ?? null;
    expect(couponTotal).toBe(nonCouponTotal);
    expect(winner.grandTotalPaise).toBe(couponTotal);

    const cls = classifyCouponPresentation({
      submittedCouponResult: {
        status: "VALID_BUT_NOT_SELECTED",
        reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
        couponId: "c-del0",
        promotionId: "dc0",
        canonicalCode: "DC0",
      },
      winner,
      bestCouponGrandTotalPaise: couponTotal,
      bestNonCouponGrandTotalPaise: nonCouponTotal,
      couponPromotionId: "dc0",
    });
    expect(cls).toBe("COUPON_EQUAL_PAYABLE_SELECTED");
    expect(cls).not.toBe("COUPON_VALID_NOT_SELECTED");

    const explanation = buildCommercialExplanation({
      winner,
      submittedCouponResult: {
        status: "VALID_BUT_NOT_SELECTED",
        reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
        couponId: "c-del0",
        promotionId: "dc0",
        canonicalCode: "DC0",
      },
      couponPresentationClass: cls,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: false,
      promotionsById: new Map([["dc0", delCoupon]]),
    });
    expect(explanation.deliverySavingPaise).toBe(BigInt(0));
    expect(explanation.totalSavedPaise).toBe(BigInt(0));
    expect(explanation.merchandiseOrOrderSavingPaise).toBe(BigInt(0));
  });

  it("B. standing ₹0 + equal-payable coupon not selected by deterministic tie", () => {
    // Complimentary equal-payable product rule retains the gift; zero-effect
    // delivery coupon remains a same-payable candidate without becoming applied.
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: BigInt(0),
        variantId: "v1",
        productId: "p1",
        lineId: "complimentary:g1",
      }),
      {
        ...DELIVERY_CHARGE,
        amountPaise: BigInt(0),
      },
    ]);
    const gift = complimentaryPromo("g1", "v1", "p1", "exclusive");
    const delCoupon = deliveryWaiver("dc0", "exclusive", { triggerType: "coupon" });
    const candidates = buildPromotionCandidates(
      [{ promotion: gift }, { promotion: delCoupon, couponId: "c-del0" }],
      snapshot,
    );
    const couponCand = candidates.find((c) => c.promotionIds.includes("dc0"));
    expect(couponCand).toBeTruthy();
    expect(couponCand!.appliedPromotions.some((a) => a.promotionId === "dc0")).toBe(false);

    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(0));
    const winner = selectBestCandidate(
      scored,
      new Map([gift, delCoupon].map((p) => [p.id, p] as const)),
    );
    expect(winner.promotionIds).toEqual(["g1"]);
    expect(winner.promotionIds).not.toContain("dc0");
    expect(winner.appliedPromotions.some((a) => a.promotionId === "dc0")).toBe(false);

    const couponTotal = couponCand
      ? scored.find((c) => c.promotionIds.includes("dc0"))!.grandTotalPaise
      : null;
    expect(couponTotal).toBe(winner.grandTotalPaise);

    const cls = classifyCouponPresentation({
      submittedCouponResult: {
        status: "VALID_BUT_NOT_SELECTED",
        reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
        couponId: "c-del0",
        promotionId: "dc0",
        canonicalCode: "DC0",
      },
      winner,
      bestCouponGrandTotalPaise: couponTotal,
      bestNonCouponGrandTotalPaise: winner.grandTotalPaise,
      couponPromotionId: "dc0",
    });
    expect(cls).toBe("COUPON_EQUAL_PAYABLE_NOT_SELECTED");
    expect(cls).not.toBe("COUPON_VALID_NOT_SELECTED");
  });

  it("C. positive delivery waiver remains an AppliedPromotion with real saving", () => {
    const deliveryPaise = BigInt(4000);
    const snapshot = merchSnapshot(BigInt(100000), deliveryPaise);
    const delCoupon = deliveryWaiver("dc40", "combinable", { triggerType: "coupon" });
    const candidates = buildPromotionCandidates(
      [{ promotion: delCoupon, couponId: "c-del40" }],
      snapshot,
    );
    const couponCand = candidates.find((c) => c.promotionIds.includes("dc40"));
    expect(couponCand).toBeTruthy();
    expect(couponCand!.promotionDiscountTotalPaise).toBe(deliveryPaise);
    expect(couponCand!.appliedPromotions.some((a) => a.promotionId === "dc40")).toBe(true);
    expect(
      couponCand!.appliedPromotions.find((a) => a.promotionId === "dc40")?.realizedDiscountPaise,
    ).toBe(deliveryPaise);

    const scored = scoreWithoutTax(candidates, BigInt(100000), deliveryPaise);
    const winner = selectBestCandidate(scored, new Map([["dc40", delCoupon]]));
    expect(winner.promotionIds).toContain("dc40");
    expect(winner.appliedPromotions.some((a) => a.promotionId === "dc40")).toBe(true);

    const explanation = buildCommercialExplanation({
      winner,
      submittedCouponResult: {
        status: "APPLIED",
        reasonCode: "APPLIED",
        couponId: "c-del40",
        promotionId: "dc40",
        canonicalCode: "DC40",
      },
      couponPresentationClass: "COUPON_APPLIED",
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: false,
      promotionsById: new Map([["dc40", delCoupon]]),
    });
    expect(explanation.deliverySavingPaise).toBe(deliveryPaise);
    expect(explanation.totalSavedPaise).toBe(deliveryPaise);
  });

  it("D. claim-boundary invariant: zero-realized delivery coupon not claim-bearing", () => {
    const zeroSnapshot = merchSnapshot(BigInt(100000), BigInt(0));
    const positiveSnapshot = merchSnapshot(BigInt(100000), BigInt(4000));
    const zeroCoupon = deliveryWaiver("dc-zero", "combinable", { triggerType: "coupon" });
    const positiveCoupon = deliveryWaiver("dc-pos", "combinable", { triggerType: "coupon" });

    const zeroCand = buildPromotionCandidates(
      [{ promotion: zeroCoupon, couponId: "c-zero" }],
      zeroSnapshot,
    ).find((c) => c.promotionIds.includes("dc-zero"));
    const positiveCand = buildPromotionCandidates(
      [{ promotion: positiveCoupon, couponId: "c-pos" }],
      positiveSnapshot,
    ).find((c) => c.promotionIds.includes("dc-pos"));

    expect(zeroCand).toBeTruthy();
    expect(positiveCand).toBeTruthy();

    // ZERO_REALIZED_DELIVERY_COUPON => NOT_IN_APPLIED_PROMOTIONS
    expect(zeroCand!.promotionDiscountTotalPaise).toBe(BigInt(0));
    expect(zeroCand!.appliedPromotions.some((a) => a.promotionId === "dc-zero")).toBe(false);

    // POSITIVE_REALIZED_DELIVERY_COUPON => IN_APPLIED_PROMOTIONS
    expect(positiveCand!.promotionDiscountTotalPaise).toBe(BigInt(4000));
    expect(positiveCand!.appliedPromotions.some((a) => a.promotionId === "dc-pos")).toBe(true);

    // T4 one-claim-per-AppliedPromotion cannot infer a claim from the zero-effect coupon.
    expect(
      zeroCand!.appliedPromotions.filter((a) => a.promotionId === "dc-zero"),
    ).toHaveLength(0);
  });
});

describe("IMP-036J T3 window / mode / timing / threshold (AC-036J-001/003/004)", () => {
  const snapshot = merchSnapshot(BigInt(50000), BigInt(0));
  const ctxBase = {
    at: new Date("2026-06-01T00:00:00Z"),
    brandId: "brand",
    territoryId: null,
    organizationId: null,
    outletId: "o1",
    salesChannel: "direct" as const,
  };

  it("18. out-of-window Offer omitted", () => {
    const promo = fixedPrimary("old", BigInt(1000), "exclusive", {
      startsAt: new Date("2025-01-01T00:00:00Z"),
      endsAt: new Date("2025-06-01T00:00:00Z"),
    });
    const el = evaluateEligibility(promo, snapshot, ctxBase);
    expect(el.eligible).toBe(false);
    expect(el.reasonCode).toBe("NOT_EFFECTIVE");
  });

  it("19. fulfilment mode eligibility honored", () => {
    const promo = fixedPrimary("del-only", BigInt(1000), "exclusive", {
      eligibleFulfilmentModes: ["DELIVERY"],
    });
    expect(
      evaluateEligibility(promo, snapshot, {
        ...ctxBase,
        fulfilmentMode: "PICKUP",
        fulfilmentTiming: "ASAP",
      }).reasonCode,
    ).toBe("FULFILMENT_MODE_MISMATCH");
    expect(
      evaluateEligibility(promo, snapshot, {
        ...ctxBase,
        fulfilmentMode: "DELIVERY",
        fulfilmentTiming: "ASAP",
      }).eligible,
    ).toBe(true);
  });

  it("20. timing eligibility honored", () => {
    const promo = fixedPrimary("asap-only", BigInt(1000), "exclusive", {
      eligibleFulfilmentTimings: ["ASAP"],
    });
    expect(
      evaluateEligibility(promo, snapshot, {
        ...ctxBase,
        fulfilmentMode: "DELIVERY",
        fulfilmentTiming: "SCHEDULED",
      }).reasonCode,
    ).toBe("FULFILMENT_TIMING_MISMATCH");
  });

  it("21. null mode/timing constraints behave as unrestricted", () => {
    const promo = fixedPrimary("open", BigInt(1000), "exclusive", {
      eligibleFulfilmentModes: null,
      eligibleFulfilmentTimings: null,
    });
    expect(
      evaluateEligibility(promo, snapshot, {
        ...ctxBase,
        fulfilmentMode: null,
        fulfilmentTiming: null,
      }).eligible,
    ).toBe(true);
  });

  it("22. threshold amount is server-calculated", () => {
    const promo = fixedPrimary("thresh", BigInt(1000), "exclusive", {
      minimumQualifyingAmountPaise: BigInt(80000),
    });
    const progress = buildThresholdProgress([promo], snapshot, ctxBase);
    expect(progress).toHaveLength(1);
    expect(progress[0]!.remainingAmountPaise).toBe(BigInt(30000));
  });

  it("23. missing threshold amount/benefit produces no fabricated progress", () => {
    const qtyOnly = fixedPrimary("qty", BigInt(1000), "exclusive", {
      minimumQualifyingAmountPaise: null,
      minimumItemQuantity: 3,
    });
    const progress = buildThresholdProgress([qtyOnly], snapshot, ctxBase);
    expect(progress[0]!.remainingAmountPaise).toBeNull();
    expect(progress[0]!.remainingItemQuantity).toBe(3);
  });

  it("24. deterministic ties do not depend on input array order", () => {
    const a = fixedPrimary("a", BigInt(5000), "exclusive", {
      priority: 5,
      startsAt: new Date("2026-01-01T00:00:00Z"),
    });
    const b = fixedPrimary("b", BigInt(5000), "exclusive", {
      priority: 5,
      startsAt: new Date("2026-01-01T00:00:00Z"),
    });
    const snap = merchSnapshot(BigInt(100000), BigInt(0));
    const c1 = buildPromotionCandidates([{ promotion: a }, { promotion: b }], snap);
    const c2 = buildPromotionCandidates([{ promotion: b }, { promotion: a }], snap);
    const s1 = scoreWithoutTax(c1, BigInt(100000), BigInt(0));
    const s2 = scoreWithoutTax(c2, BigInt(100000), BigInt(0));
    const map = new Map([a, b].map((p) => [p.id, p] as const));
    const w1 = selectBestCandidate(s1, map);
    const w2 = selectBestCandidate(s2, map);
    expect(w1.promotionIds).toEqual(w2.promotionIds);
  });
});

describe("IMP-036J T3 commercial explanation coherence (AC-036J-004-01)", () => {
  it("totalSaved = merchandiseOrOrderSaving + deliverySaving", () => {
    const snapshot = merchSnapshot(BigInt(100000), BigInt(4000));
    const primary = fixedPrimary("p", BigInt(8000), "combinable");
    const delivery = deliveryWaiver("d", "combinable");
    const candidates = buildPromotionCandidates(
      [{ promotion: primary }, { promotion: delivery }],
      snapshot,
    );
    const scored = scoreWithoutTax(candidates, BigInt(100000), BigInt(4000));
    const winner = selectBestCandidate(
      scored,
      new Map([primary, delivery].map((p) => [p.id, p] as const)),
    );
    const explanation = buildCommercialExplanation({
      winner,
      submittedCouponResult: null,
      couponPresentationClass: null,
      thresholdProgress: [],
      complimentaryCompetingNoneChosen: false,
      promotionsById: new Map([primary, delivery].map((p) => [p.id, p] as const)),
    });
    expect(explanation.merchandiseOrOrderSavingPaise).toBe(BigInt(8000));
    expect(explanation.deliverySavingPaise).toBe(BigInt(4000));
    expect(explanation.totalSavedPaise).toBe(
      explanation.merchandiseOrOrderSavingPaise + explanation.deliverySavingPaise,
    );
  });
});

describe("IMP-036J T3 complimentary gift projection", () => {
  it("unselected complimentary gift lines are stripped from payable projection", () => {
    const giftLine = "complimentary:g1";
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: BigInt(2500),
        variantId: "v1",
        productId: "p1",
        lineId: giftLine,
      }),
    ]);
    const gift = complimentaryPromo("g1", "v1", "p1");
    const merch = fixedPrimary("m80", BigInt(8000), "exclusive");
    const candidates = buildPromotionCandidates(
      [{ promotion: gift }, { promotion: merch }],
      snapshot,
    );
    const merchCand = candidates.find((c) => c.promotionIds.includes("m80"))!;
    const projected = projectUnselectedComplimentaryGifts(
      merchCand,
      new Map([[giftLine, BigInt(2500)]]),
    );
    expect(projected.removedGiftGrossPaise).toBe(BigInt(2500));
    expect(projected.postPromotionComponents.some((c) => c.lineId === giftLine)).toBe(false);
  });

  it("complimentary benefit does not allocate against cart lines of the same variant", () => {
    const gift = complimentaryPromo("g1", "v1", "p1");
    const snapshot = snapshotOf([
      moneyComponent({
        componentId: "cart-base",
        amountPaise: BigInt(5000),
        variantId: "v1",
        productId: "p1",
        lineId: "L-cart",
      }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: BigInt(2500),
        variantId: "v1",
        productId: "p1",
        lineId: "complimentary:g1",
      }),
    ]);
    const benefit = calculateBenefit(gift, snapshot);
    expect(benefit.eligibleComponentIds).toEqual(["gift-base"]);
    expect(benefit.nominalBenefitPaise).toBe(BigInt(2500));
  });

  it("projected complimentary gifts do not inflate amount thresholds", () => {
    const promo = fixedPrimary("thresh", BigInt(1000), "exclusive", {
      minimumQualifyingAmountPaise: BigInt(80000),
    });
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(50000) }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: BigInt(40000),
        variantId: "gv",
        productId: "gp",
        lineId: "complimentary:g1",
      }),
    ]);
    const progress = buildThresholdProgress([promo], snapshot, {
      at: new Date("2026-06-01T00:00:00Z"),
      brandId: "brand",
      territoryId: null,
      organizationId: null,
      outletId: "o1",
      salesChannel: "direct",
    });
    expect(progress[0]!.remainingAmountPaise).toBe(BigInt(30000));
  });

  it("merchandise benefits do not allocate onto projected complimentary gifts", () => {
    const merch = fixedPrimary("m50", BigInt(5000), "exclusive");
    const snapshot = snapshotOf([
      moneyComponent({ componentId: "c1", amountPaise: BigInt(100000) }),
      moneyComponent({
        componentId: "gift-base",
        amountPaise: BigInt(2500),
        variantId: "gv",
        productId: "gp",
        lineId: "complimentary:g1",
      }),
    ]);
    const benefit = calculateBenefit(merch, snapshot);
    expect(benefit.eligibleComponentIds).toEqual(["c1"]);
    const candidates = buildPromotionCandidates([{ promotion: merch }], snapshot);
    const win = candidates.find((c) => c.promotionIds.includes("m50"))!;
    expect(win.allocations.every((a) => a.componentId !== "gift-base")).toBe(true);
    expect(win.promotionDiscountTotalPaise).toBe(BigInt(5000));
  });

  it("BOGO reward selection ignores projected complimentary gift units", () => {
    const bogo = basePromo({
      id: "bogo",
      stackingPolicy: "exclusive",
      benefit: {
        benefitType: "buy_x_get_y",
        percentageBps: null,
        fixedAmountPaise: null,
        maximumDiscountPaise: null,
        buyQuantity: 1,
        getQuantity: 1,
        repeatable: false,
        maximumRewardQuantity: null,
        includeModifiers: false,
        includeBundleDeltas: false,
      },
    });
    const snapshot = snapshotOf(
      [
        moneyComponent({
          componentId: "cart-base",
          amountPaise: BigInt(10000),
          variantId: "v1",
          productId: "p1",
          lineId: "L1",
        }),
        moneyComponent({
          componentId: "gift-base",
          amountPaise: BigInt(100),
          variantId: "v1",
          productId: "p1",
          lineId: "complimentary:g1",
        }),
      ],
      [
        {
          unitId: "u-cart",
          lineId: "L1",
          lineSequence: 0,
          unitIndex: 0,
          variantId: "v1",
          productId: "p1",
          unitBasePaise: BigInt(10000),
          modifierPaise: BigInt(0),
          bundleDeltaPaise: BigInt(0),
          taxCategoryId: "tax",
        },
        {
          unitId: "u-gift",
          lineId: "complimentary:g1",
          lineSequence: 1,
          unitIndex: 0,
          variantId: "v1",
          productId: "p1",
          unitBasePaise: BigInt(100),
          modifierPaise: BigInt(0),
          bundleDeltaPaise: BigInt(0),
          taxCategoryId: "tax",
        },
      ],
    );
    // With only one cart unit, identical BOGO buy1get1 cannot complete a group
    // if the cheap gift unit is excluded from the reward pool.
    const benefit = calculateBenefit(bogo, snapshot);
    expect(benefit.bogoRewardUnits ?? []).toEqual([]);
    expect(benefit.nominalBenefitPaise).toBe(BigInt(0));
  });
});

describe("IMP-036J T3 first-order classification interface (deferred purchase query)", () => {
  it("classifies first-order Offers without querying purchases", () => {
    const snapshot = merchSnapshot(BigInt(50000), BigInt(0));
    const promo = fixedPrimary("fo", BigInt(1000), "exclusive", { firstOrderOnly: true });
    expect(
      evaluateEligibility(promo, snapshot, {
        at: new Date("2026-06-01T00:00:00Z"),
        brandId: "brand",
        territoryId: null,
        organizationId: null,
        outletId: "o1",
        salesChannel: "direct",
      }).reasonCode,
    ).toBe("FIRST_ORDER_IDENTITY_REQUIRED");
    expect(
      evaluateEligibility(promo, snapshot, {
        at: new Date("2026-06-01T00:00:00Z"),
        brandId: "brand",
        territoryId: null,
        organizationId: null,
        outletId: "o1",
        salesChannel: "direct",
        customerId: "cust-1",
        firstOrderPurchaseStatus: "UNAVAILABLE",
      }).reasonCode,
    ).toBe("FIRST_ORDER_PURCHASE_STATUS_UNAVAILABLE");
    expect(
      evaluateEligibility(promo, snapshot, {
        at: new Date("2026-06-01T00:00:00Z"),
        brandId: "brand",
        territoryId: null,
        organizationId: null,
        outletId: "o1",
        salesChannel: "direct",
        customerId: "cust-1",
        firstOrderPurchaseStatus: "NO_PRIOR_PURCHASE",
      }).eligible,
    ).toBe(true);
  });
});
