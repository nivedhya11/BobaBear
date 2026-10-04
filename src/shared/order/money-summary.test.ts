import { describe, expect, it } from "vitest";

import {
  customerMonetarySavingPaiseFromSnapshot,
  moneySummaryFromSnapshot,
} from "./money-summary";
import type { CheckoutSnapshot } from "../checkout";

function snapshot(partial: Partial<CheckoutSnapshot>): CheckoutSnapshot {
  return {
    id: "snap",
    checkoutId: "chk",
    checkoutRevision: BigInt(1),
    sourceCartRevision: BigInt(1),
    selectedOutletId: "outlet",
    evaluatedAt: new Date("2026-08-13T00:00:00.000Z"),
    fulfilmentMode: "DELIVERY",
    fulfilmentTiming: "ASAP",
    scheduledWindowStartAt: null,
    scheduledWindowEndAt: null,
    scheduledTimezone: null,
    scheduledCancellationCutoffMinutes: null,
    serviceabilityEvaluatedAt: new Date("2026-08-13T00:00:00.000Z"),
    currency: "INR",
    manualCouponCode: null,
    destination: null,
    pickupLocation: null,
    basePaise: BigInt(19900),
    modifierAdjustmentsPaise: BigInt(0),
    bundleAdjustmentsPaise: BigInt(0),
    chargesPaise: BigInt(0),
    prePromotionSubtotalPaise: BigInt(19900),
    promotionDiscountPaise: BigInt(0),
    taxablePaise: BigInt(19900),
    taxPaise: BigInt(0),
    grandTotalPaise: BigInt(19900),
    taxInclusionMode: "exclusive",
    createdAt: new Date("2026-08-13T00:00:00.000Z"),
    lines: [],
    charges: [],
    promotionEffects: [],
    taxComponents: [],
    ...partial,
  };
}

describe("customerMonetarySavingPaiseFromSnapshot", () => {
  it("excludes complimentary synthetic allocation from customer monetary saving", () => {
    const giftLineId = "gift-line";
    const result = customerMonetarySavingPaiseFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(15000),
        grandTotalPaise: BigInt(19900),
        promotionEffects: [
          {
            id: "e1",
            effectKind: "monetary_allocation",
            promotionId: "promo-gift",
            couponId: null,
            promotionCode: "GIFT",
            displayName: "Gift",
            triggerType: "automatic",
            stackingPolicy: "exclusive",
            componentId: "base:complimentary:promo-gift",
            lineId: "complimentary:promo-gift",
            amountPaise: BigInt(15000),
            realizedDiscountPaise: null,
            rewardVariantId: null,
            rewardUnitId: null,
            rewardQuantity: null,
            rewardBasePaise: null,
            sortOrder: 1,
            snapshotLineId: giftLineId,
            promotionRevision: BigInt(1),
          },
        ],
      }),
    );
    expect(result).toBe(BigInt(0));
  });

  it("retains real delivery saving alongside excluded gift allocation", () => {
    const result = customerMonetarySavingPaiseFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(19000),
        promotionEffects: [
          {
            id: "e1",
            effectKind: "monetary_allocation",
            promotionId: "promo-gift",
            couponId: null,
            promotionCode: "GIFT",
            displayName: "Gift",
            triggerType: "automatic",
            stackingPolicy: "exclusive",
            componentId: "base:complimentary:promo-gift",
            lineId: "complimentary:promo-gift",
            amountPaise: BigInt(15000),
            realizedDiscountPaise: null,
            rewardVariantId: null,
            rewardUnitId: null,
            rewardQuantity: null,
            rewardBasePaise: null,
            sortOrder: 1,
            snapshotLineId: "gift-line",
            promotionRevision: BigInt(1),
          },
          {
            id: "e2",
            effectKind: "monetary_allocation",
            promotionId: "promo-del",
            couponId: null,
            promotionCode: "FREEDEL",
            displayName: "Free delivery",
            triggerType: "automatic",
            stackingPolicy: "compatible",
            componentId: `charge:delivery`,
            lineId: null,
            amountPaise: BigInt(4000),
            realizedDiscountPaise: null,
            rewardVariantId: null,
            rewardUnitId: null,
            rewardQuantity: null,
            rewardBasePaise: null,
            sortOrder: 2,
            snapshotLineId: null,
            promotionRevision: BigInt(1),
          },
        ],
      }),
    );
    expect(result).toBe(BigInt(4000));
  });

  it("projects moneySummary.promotionDiscountMinor as customer monetary saving only", () => {
    const summary = moneySummaryFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(15000),
        grandTotalPaise: BigInt(19900),
        promotionEffects: [
          {
            id: "e1",
            effectKind: "monetary_allocation",
            promotionId: "promo-gift",
            couponId: null,
            promotionCode: "GIFT",
            displayName: "Gift",
            triggerType: "automatic",
            stackingPolicy: "exclusive",
            componentId: "base:complimentary:promo-gift",
            lineId: "complimentary:promo-gift",
            amountPaise: BigInt(15000),
            realizedDiscountPaise: null,
            rewardVariantId: null,
            rewardUnitId: null,
            rewardQuantity: null,
            rewardBasePaise: null,
            sortOrder: 1,
            snapshotLineId: "gift-line",
            promotionRevision: BigInt(1),
          },
        ],
      }),
    );
    expect(summary.promotionDiscountMinor).toBe("0");
    expect(summary.grandTotalMinor).toBe("19900");
  });
});
