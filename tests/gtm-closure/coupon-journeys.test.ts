/**
 * Accepted coupon outcomes from PD-IMP-036J-DRAFT-6.
 * AC-036J-002-01, AC-036J-002-02, AC-036J-002-03, AC-036J-007-01.
 * One submitted coupon is the only coupon state this evaluator accepts.
 */
import { describe, expect, it } from "vitest";

import { couponStatusCopy } from "../../src/components/ordering/commercial-explanation-presentation";
import type { WireCommercialExplanation } from "../../src/components/ordering/commercial-explanation-presentation";
import { IMP036J_COPY } from "../../src/components/ordering/imp036j-copy";
import {
  evaluatePromotions,
  finalizeCouponResult,
} from "../../src/shared/promotions";
import {
  couponRecord,
  evaluationContext,
  merchandiseSnapshot,
  offer,
} from "./support/promotion-fixtures";

const MERCHANDISE = BigInt(10_000);
const SAVING = BigInt(2_000);

function explanation(
  partial: Partial<WireCommercialExplanation>,
): WireCommercialExplanation {
  return {
    couponPresentationClass: null,
    merchandiseOrOrderSavingPaise: "0",
    deliverySavingPaise: "0",
    totalSavedPaise: "0",
    grandTotalPaise: "10000",
    thresholdProgress: null,
    complimentary: null,
    submittedCouponResult: null,
    ...partial,
  };
}

describe("coupon journeys on the accepted evaluator", () => {
  it("applies one valid coupon and records that single canonical code", () => {
    const withBenefit = offer({
      id: "promo-save",
      code: "SAVE20",
      displayName: "Save twenty",
      triggerType: "coupon",
    });
    const evaluated = evaluatePromotions({
      context: evaluationContext(),
      snapshot: merchandiseSnapshot(MERCHANDISE),
      promotions: [withBenefit],
      submittedCoupon: {
        rawCode: " save20 ",
        coupon: couponRecord({
          id: "coupon-1",
          promotionId: withBenefit.id,
          canonicalCode: "SAVE20",
        }),
        promotion: withBenefit,
      },
    });

    expect(evaluated.submittedCouponResult).toMatchObject({
      status: "VALID_BUT_NOT_SELECTED",
      reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
      canonicalCode: "SAVE20",
      couponId: "coupon-1",
    });
    expect(evaluated.eligiblePromotionIds).toEqual(["promo-save"]);

    const applied = finalizeCouponResult(
      evaluated.submittedCouponResult,
      ["promo-save"],
      ["promo-save"],
    );
    expect(applied).toMatchObject({ status: "APPLIED", reasonCode: "APPLIED" });

    const selected = evaluated.candidates.find((candidate) =>
      candidate.promotionIds.includes("promo-save"),
    );
    expect(selected?.promotionDiscountTotalPaise).toBe(SAVING);
    expect(couponStatusCopy({
      explanation: explanation({ couponPresentationClass: "COUPON_APPLIED" }),
    })?.text).toBe(IMP036J_COPY.APPLIED_COUPON);
  });

  it("rejects an unknown code as invalid and applies no saving", () => {
    const evaluated = evaluatePromotions({
      context: evaluationContext(),
      snapshot: merchandiseSnapshot(MERCHANDISE),
      promotions: [],
      submittedCoupon: { rawCode: "NOPE", coupon: null, promotion: null },
    });

    expect(evaluated.submittedCouponResult).toMatchObject({
      status: "INVALID",
      reasonCode: "COUPON_INVALID",
      couponId: null,
      promotionId: null,
    });
    expect(evaluated.eligiblePromotionIds).toEqual([]);
    expect(
      evaluated.candidates.every((candidate) => candidate.promotionDiscountTotalPaise === BigInt(0)),
    ).toBe(true);
    expect(
      couponStatusCopy({
        explanation: explanation({
          submittedCouponResult: {
            status: "INVALID",
            reasonCode: "COUPON_INVALID",
            canonicalCode: "NOPE",
          },
        }),
      })?.text,
    ).toBe(IMP036J_COPY.INVALID);
  });

  it("treats an ended coupon as expired, distinct from an unknown code", () => {
    const promotion = offer({ id: "promo-old", triggerType: "coupon" });
    const evaluated = evaluatePromotions({
      context: evaluationContext(),
      snapshot: merchandiseSnapshot(MERCHANDISE),
      promotions: [promotion],
      submittedCoupon: {
        rawCode: "OLD",
        coupon: couponRecord({
          id: "coupon-old",
          promotionId: promotion.id,
          canonicalCode: "OLD",
          endsAt: new Date("2026-06-01T00:00:00.000Z"),
        }),
        promotion,
      },
    });

    expect(evaluated.submittedCouponResult).toMatchObject({
      status: "INVALID",
      reasonCode: "COUPON_NOT_EFFECTIVE",
    });
    expect(evaluated.eligiblePromotionIds).not.toContain("promo-old");
    const copy = couponStatusCopy({
      explanation: explanation({
        submittedCouponResult: {
          status: "INVALID",
          reasonCode: "COUPON_NOT_EFFECTIVE",
          canonicalCode: "OLD",
        },
      }),
    })?.text;
    expect(copy).toBe(IMP036J_COPY.EXPIRED);
    expect(copy).not.toBe(IMP036J_COPY.INVALID);
  });

  it("keeps a delivery-only coupon inapplicable on pickup", () => {
    const promotion = offer({
      id: "promo-delivery",
      triggerType: "coupon",
      eligibleFulfilmentModes: ["DELIVERY"],
    });
    const evaluated = evaluatePromotions({
      context: evaluationContext({ fulfilmentMode: "PICKUP" }),
      snapshot: merchandiseSnapshot(MERCHANDISE),
      promotions: [promotion],
      submittedCoupon: {
        rawCode: "DELIVER",
        coupon: couponRecord({
          id: "coupon-delivery",
          promotionId: promotion.id,
          canonicalCode: "DELIVER",
        }),
        promotion,
      },
    });

    expect(evaluated.submittedCouponResult).toMatchObject({
      status: "NOT_APPLICABLE",
      reasonCode: "FULFILMENT_MODE_MISMATCH",
    });
    expect(evaluated.eligiblePromotionIds).not.toContain("promo-delivery");
    expect(
      couponStatusCopy({
        explanation: explanation({
          submittedCouponResult: {
            status: "NOT_APPLICABLE",
            reasonCode: "FULFILMENT_MODE_MISMATCH",
            canonicalCode: "DELIVER",
          },
        }),
        fulfilmentMode: "PICKUP",
      })?.text,
    ).toBe(IMP036J_COPY.INAPPLICABLE_DELIVERY);
  });

  it("keeps a pickup-only coupon inapplicable on delivery", () => {
    const promotion = offer({
      id: "promo-pickup",
      triggerType: "coupon",
      eligibleFulfilmentModes: ["PICKUP"],
    });
    const evaluated = evaluatePromotions({
      context: evaluationContext({ fulfilmentMode: "DELIVERY" }),
      snapshot: merchandiseSnapshot(MERCHANDISE),
      promotions: [promotion],
      submittedCoupon: {
        rawCode: "PICKUP",
        coupon: couponRecord({
          id: "coupon-pickup",
          promotionId: promotion.id,
          canonicalCode: "PICKUP",
        }),
        promotion,
      },
    });

    expect(evaluated.submittedCouponResult).toMatchObject({
      status: "NOT_APPLICABLE",
      reasonCode: "FULFILMENT_MODE_MISMATCH",
    });
    expect(evaluated.eligiblePromotionIds).not.toContain("promo-pickup");
    expect(
      couponStatusCopy({
        explanation: explanation({
          submittedCouponResult: {
            status: "NOT_APPLICABLE",
            reasonCode: "FULFILMENT_MODE_MISMATCH",
            canonicalCode: "PICKUP",
          },
        }),
        fulfilmentMode: "DELIVERY",
      })?.text,
    ).toBe(IMP036J_COPY.INAPPLICABLE_PICKUP);
    expect(IMP036J_COPY.INAPPLICABLE_PICKUP).not.toBe(IMP036J_COPY.INAPPLICABLE_DELIVERY);
  });

  it("drops the coupon saving when the shared code is removed", () => {
    const promotion = offer({ id: "promo-save", triggerType: "coupon" });
    const withCoupon = evaluatePromotions({
      context: evaluationContext(),
      snapshot: merchandiseSnapshot(MERCHANDISE),
      promotions: [promotion],
      submittedCoupon: {
        rawCode: "SAVE20",
        coupon: couponRecord({
          id: "coupon-1",
          promotionId: promotion.id,
          canonicalCode: "SAVE20",
        }),
        promotion,
      },
    });
    const removed = evaluatePromotions({
      context: evaluationContext(),
      snapshot: merchandiseSnapshot(MERCHANDISE),
      promotions: [promotion],
      submittedCoupon: null,
    });

    expect(withCoupon.eligiblePromotionIds).toContain("promo-save");
    expect(removed.submittedCouponResult).toBeNull();
    expect(removed.eligiblePromotionIds).not.toContain("promo-save");
    expect(
      removed.candidates.every((candidate) => candidate.promotionDiscountTotalPaise === BigInt(0)),
    ).toBe(true);
  });
});
