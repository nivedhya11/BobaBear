/**
 * Pre-payment structural revalidation.
 * Equal displayed payable must not bypass structural comparison.
 * AC-036J-008-01 stale-offer refusal at the snapshot boundary.
 */
import { describe, expect, it } from "vitest";

import { IMP036J_COPY } from "../../src/components/ordering/imp036j-copy";
import {
  classifyCouponPresentation,
  payableChangedVsValidAlternative,
  selectBestCandidate,
} from "../../src/shared/promotions";
import { checkoutSnapshotsStructurallyEqual } from "../../src/server/checkout/compare-snapshots";
import { explainCheckoutSnapshotStructuralDifference } from "../../src/server/checkout/explain-snapshot-difference";
import { sealedSnapshot } from "./support/checkout-snapshot";

describe("checkout revalidation refuses equal-money structural drift", () => {
  it("accepts an unchanged sealed snapshot", () => {
    const shown = sealedSnapshot();
    const prepared = sealedSnapshot();
    expect(checkoutSnapshotsStructurallyEqual(shown, prepared)).toBe(true);
    expect(explainCheckoutSnapshotStructuralDifference(shown, prepared)).toEqual({
      equal: true,
      firstDifferenceCategory: null,
    });
  });

  it("refuses a different promotion seal when the payable amount is unchanged", () => {
    const shown = sealedSnapshot();
    const prepared = sealedSnapshot({
      promotionEffects: [
        {
          ...shown.promotionEffects[0]!,
          promotionId: "promo-other",
          promotionCode: "OTHER",
        },
      ],
    });

    expect(shown.grandTotalPaise).toBe(prepared.grandTotalPaise);
    expect(checkoutSnapshotsStructurallyEqual(shown, prepared)).toBe(false);
    expect(explainCheckoutSnapshotStructuralDifference(shown, prepared)).toEqual({
      equal: false,
      firstDifferenceCategory: "PROMOTION_EFFECT",
    });
  });

  it("refuses a fulfilment-shape change when the payable amount is unchanged", () => {
    const shown = sealedSnapshot();
    const prepared = sealedSnapshot({
      fulfilmentTiming: "SCHEDULED",
      scheduledWindowStartAt: new Date("2026-10-16T08:00:00.000Z"),
      scheduledWindowEndAt: new Date("2026-10-16T08:30:00.000Z"),
      scheduledTimezone: "Asia/Kolkata",
      scheduledCancellationCutoffMinutes: 30,
    });

    expect(shown.grandTotalPaise).toBe(prepared.grandTotalPaise);
    expect(explainCheckoutSnapshotStructuralDifference(shown, prepared)).toEqual({
      equal: false,
      firstDifferenceCategory: "FULFILMENT_SHAPE",
    });
  });

  it("refuses a coupon-seal change when the payable amount is unchanged", () => {
    const shown = sealedSnapshot({ manualCouponCode: "SAVE20" });
    const prepared = sealedSnapshot({ manualCouponCode: null });
    expect(shown.grandTotalPaise).toBe(prepared.grandTotalPaise);
    expect(explainCheckoutSnapshotStructuralDifference(shown, prepared)).toEqual({
      equal: false,
      firstDifferenceCategory: "COUPON_SEAL",
    });
  });

  it("does not describe an equal payable as a better coupon outcome", () => {
    const payable = BigInt(8_000);
    expect(
      classifyCouponPresentation({
        submittedCouponResult: {
          status: "VALID_BUT_NOT_SELECTED",
          reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
          couponId: "coupon-1",
          promotionId: "promo-save",
          canonicalCode: "SAVE20",
        },
        winner: {
          promotionIds: [],
          allocations: [],
          promotionDiscountTotalPaise: BigInt(0),
          postPromotionComponents: [],
          appliedPromotions: [],
          grandTotalPaise: payable,
        },
        bestCouponGrandTotalPaise: payable,
        bestNonCouponGrandTotalPaise: payable,
        couponPromotionId: "promo-save",
      }),
    ).toBe("COUPON_EQUAL_PAYABLE_NOT_SELECTED");
    expect(
      payableChangedVsValidAlternative({
        submittedCouponResult: {
          status: "VALID_BUT_NOT_SELECTED",
          reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
          couponId: "coupon-1",
          promotionId: "promo-save",
          canonicalCode: "SAVE20",
        },
        bestCouponGrandTotalPaise: payable,
        bestNonCouponGrandTotalPaise: payable,
      }),
    ).toBe(false);
    expect(IMP036J_COPY.STALE).not.toBe(IMP036J_COPY.STALE_UNCONFIRMED);
  });

  it("keeps an equal-payable complimentary combination ahead of no primary offer", () => {
    const payable = BigInt(8_000);
    const winner = selectBestCandidate(
      [
        {
          promotionIds: [],
          promotionDiscountTotalPaise: BigInt(0),
          grandTotalPaise: payable,
          hasComplimentaryPrimary: false,
          primaryPromotionId: null,
        },
        {
          promotionIds: ["gift"],
          promotionDiscountTotalPaise: BigInt(0),
          grandTotalPaise: payable,
          hasComplimentaryPrimary: true,
          primaryPromotionId: "gift",
        },
      ],
      new Map(),
    );
    expect(winner.promotionIds).toEqual(["gift"]);
  });
});
