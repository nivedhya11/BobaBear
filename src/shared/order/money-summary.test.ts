import { describe, expect, it } from "vitest";

import {
  customerMonetarySavingPaiseFromSnapshot,
  moneySummaryFromSnapshot,
} from "./money-summary";
import type { CheckoutSnapshot, CheckoutSnapshotPromotionEffect } from "../checkout";
import { CHARGE_DEFINITION_DELIVERY_ID } from "../pricing";

const DELIVERY_COMPONENT_ID = `charge:${CHARGE_DEFINITION_DELIVERY_ID}`;

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
            componentId: `charge:${CHARGE_DEFINITION_DELIVERY_ID}`,
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
    expect(summary.orderSavingMinor).toBe("0");
    expect(summary.deliverySavingMinor).toBe("0");
    expect(summary.grandTotalMinor).toBe("19900");
  });
});

function allocation(
  partial: Partial<CheckoutSnapshotPromotionEffect> &
    Pick<CheckoutSnapshotPromotionEffect, "id" | "amountPaise" | "componentId">,
): CheckoutSnapshotPromotionEffect {
  return {
    effectKind: "monetary_allocation",
    promotionId: "promo",
    couponId: null,
    promotionCode: "OFFER",
    displayName: "Offer",
    triggerType: "automatic",
    stackingPolicy: "exclusive",
    lineId: null,
    realizedDiscountPaise: null,
    rewardVariantId: null,
    rewardUnitId: null,
    rewardQuantity: null,
    rewardBasePaise: null,
    sortOrder: 1,
    snapshotLineId: null,
    promotionRevision: BigInt(1),
    ...partial,
  };
}

describe("purchased saving split", () => {
  it("projects a percentage offer as order saving and total saved", () => {
    const summary = moneySummaryFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(5180),
        grandTotalPaise: BigInt(46620),
        taxPaise: BigInt(2000),
        chargesPaise: BigInt(2000),
        charges: [
          {
            id: "c1",
            chargeDefinitionId: "pack",
            chargeCode: "packaging",
            calculationMode: "fixed_per_order",
            amountPaise: BigInt(2000),
            name: "Packaging",
            sortOrder: 1,
          },
        ],
        promotionEffects: [
          allocation({
            id: "pct",
            amountPaise: BigInt(5180),
            componentId: "base:line-1",
            promotionCode: "PCT10",
          }),
        ],
      }),
    );
    expect(summary.orderSavingMinor).toBe("5180");
    expect(summary.deliverySavingMinor).toBe("0");
    expect(summary.promotionDiscountMinor).toBe("5180");
    expect(summary.taxMinor).toBe("2000");
    expect(summary.charges).toEqual([
      { chargeCode: "packaging", name: "Packaging", amountMinor: "2000" },
    ]);
    expect(summary.grandTotalMinor).toBe("46620");
  });

  it("projects a fixed offer as the sealed amount, not a recomputed rate", () => {
    const summary = moneySummaryFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(2500),
        promotionEffects: [
          allocation({
            id: "fixed",
            amountPaise: BigInt(2500),
            componentId: "base:line-1",
            promotionCode: "FLAT25",
          }),
        ],
      }),
    );
    expect(summary.orderSavingMinor).toBe("2500");
    expect(summary.deliverySavingMinor).toBe("0");
    expect(summary.promotionDiscountMinor).toBe("2500");
  });

  it("projects delivery-only saving from the canonical charge identity", () => {
    const summary = moneySummaryFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(4000),
        chargesPaise: BigInt(0),
        charges: [
          {
            id: "c-del",
            chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
            chargeCode: "delivery",
            calculationMode: "fixed_per_order",
            amountPaise: BigInt(0),
            name: "Delivery",
            sortOrder: 1,
          },
        ],
        promotionEffects: [
          allocation({
            id: "del",
            amountPaise: BigInt(4000),
            componentId: DELIVERY_COMPONENT_ID,
          }),
        ],
      }),
    );
    expect(summary.orderSavingMinor).toBe("0");
    expect(summary.deliverySavingMinor).toBe("4000");
    expect(summary.promotionDiscountMinor).toBe("4000");
    expect(summary.charges[0]?.amountMinor).toBe("0");
  });

  it("does not treat a charge amount or a delivery-like component id as delivery saving", () => {
    const summary = moneySummaryFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(8000),
        charges: [
          {
            id: "c-del",
            chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
            chargeCode: "delivery",
            calculationMode: "fixed_per_order",
            amountPaise: BigInt(4000),
            name: "Delivery",
            sortOrder: 1,
          },
        ],
        promotionEffects: [
          allocation({
            id: "drink",
            amountPaise: BigInt(8000),
            componentId: "base:line-free-delivery-drink",
          }),
        ],
      }),
    );
    expect(summary.orderSavingMinor).toBe("8000");
    expect(summary.deliverySavingMinor).toBe("0");
    expect(summary.charges[0]?.amountMinor).toBe("4000");
  });

  it("sums order and delivery saving into the existing total saved", () => {
    const summary = moneySummaryFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(12000),
        taxPaise: BigInt(1270),
        grandTotalPaise: BigInt(15170),
        promotionEffects: [
          allocation({ id: "order", amountPaise: BigInt(8000), componentId: "base:line-1" }),
          allocation({
            id: "del",
            amountPaise: BigInt(4000),
            componentId: DELIVERY_COMPONENT_ID,
            sortOrder: 2,
          }),
        ],
      }),
    );
    expect(summary.orderSavingMinor).toBe("8000");
    expect(summary.deliverySavingMinor).toBe("4000");
    expect(summary.promotionDiscountMinor).toBe("12000");
    expect(
      BigInt(summary.orderSavingMinor) + BigInt(summary.deliverySavingMinor),
    ).toBe(BigInt(summary.promotionDiscountMinor));
    expect(summary.taxMinor).toBe("1270");
    expect(summary.grandTotalMinor).toBe("15170");
  });

  it("counts only real delivery saving beside a complimentary allocation", () => {
    const purchased = snapshot({
      promotionDiscountPaise: BigInt(19000),
      grandTotalPaise: BigInt(19900),
      promotionEffects: [
        allocation({
          id: "gift",
          amountPaise: BigInt(15000),
          componentId: "base:complimentary:promo-gift",
          snapshotLineId: "gift-line",
        }),
        allocation({
          id: "del",
          amountPaise: BigInt(4000),
          componentId: DELIVERY_COMPONENT_ID,
          sortOrder: 2,
        }),
      ],
    });
    const summary = moneySummaryFromSnapshot(purchased);
    expect(customerMonetarySavingPaiseFromSnapshot(purchased)).toBe(BigInt(4000));
    expect(summary.orderSavingMinor).toBe("0");
    expect(summary.deliverySavingMinor).toBe("4000");
    expect(summary.promotionDiscountMinor).toBe("4000");
    expect(summary.grandTotalMinor).toBe("19900");
  });

  it("does not label an unexplained sealed total as order saving", () => {
    const summary = moneySummaryFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(2000),
        promotionEffects: [
          allocation({
            id: "applied-only",
            effectKind: "applied_promotion",
            amountPaise: null,
            realizedDiscountPaise: BigInt(2000),
            componentId: null,
          }),
        ],
      }),
    );
    expect(summary.orderSavingMinor).toBe("0");
    expect(summary.deliverySavingMinor).toBe("0");
    expect(summary.promotionDiscountMinor).toBe("2000");
    expect(summary.grandTotalMinor).toBe("19900");
  });

  it("does not inflate order saving above the sealed non-delivery allocation", () => {
    const summary = moneySummaryFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(5000),
        promotionEffects: [
          allocation({
            id: "partial",
            amountPaise: BigInt(2000),
            componentId: "base:line-1",
          }),
        ],
      }),
    );
    expect(summary.orderSavingMinor).toBe("2000");
    expect(summary.deliverySavingMinor).toBe("0");
    expect(summary.promotionDiscountMinor).toBe("5000");
  });

  it("projects no saving rows when the sealed customer saving is zero", () => {
    const summary = moneySummaryFromSnapshot(
      snapshot({
        promotionDiscountPaise: BigInt(0),
        taxPaise: BigInt(500),
        grandTotalPaise: BigInt(20400),
      }),
    );
    expect(summary.orderSavingMinor).toBe("0");
    expect(summary.deliverySavingMinor).toBe("0");
    expect(summary.promotionDiscountMinor).toBe("0");
    expect(summary.taxMinor).toBe("500");
    expect(summary.grandTotalMinor).toBe("20400");
  });
});
