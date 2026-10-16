/**
 * Sanitized snapshot first-difference diagnostic (#391 / IMP-036J).
 * Pure unit coverage — no database, no payment behavior.
 */
import { describe, expect, it } from "vitest";

import { checkoutSnapshotsStructurallyEqual } from "./compare-snapshots";
import {
  explainCheckoutSnapshotStructuralDifference,
} from "./explain-snapshot-difference";
import type { CheckoutSnapshot } from "../../shared/checkout";

function baseSnapshot(
  overrides: Partial<CheckoutSnapshot> = {},
): CheckoutSnapshot {
  const evaluatedAt = new Date("2026-10-16T07:00:00.000Z");
  return {
    id: "snap-a",
    checkoutId: "chk-a",
    checkoutRevision: BigInt(3),
    sourceCartRevision: BigInt(122),
    selectedOutletId: "outlet-a",
    evaluatedAt,
    fulfilmentMode: "DELIVERY",
    fulfilmentTiming: "ASAP",
    scheduledWindowStartAt: null,
    scheduledWindowEndAt: null,
    scheduledTimezone: null,
    scheduledCancellationCutoffMinutes: null,
    serviceabilityEvaluatedAt: evaluatedAt,
    currency: "INR",
    manualCouponCode: "TEST123",
    destination: {
      destinationKind: "SAVED_ADDRESS",
      sourceSavedAddressId: "addr-a",
      recipientName: "Founder",
      recipientPhone: "+919999999999",
      addressLine1: "1 Test Lane",
      addressLine2: null,
      landmark: null,
      locality: null,
      city: "Dehradun",
      stateCode: "IN-UT",
      postalCode: "248001",
      coordinates: { latitude: "30.300000", longitude: "78.000000" },
      label: null,
    },
    pickupLocation: null,
    basePaise: BigInt(103_600),
    modifierAdjustmentsPaise: BigInt(0),
    bundleAdjustmentsPaise: BigInt(0),
    chargesPaise: BigInt(2_000),
    prePromotionSubtotalPaise: BigInt(105_600),
    promotionDiscountPaise: BigInt(10_360),
    taxablePaise: BigInt(95_240),
    taxPaise: BigInt(0),
    grandTotalPaise: BigInt(95_240),
    taxInclusionMode: "exclusive",
    createdAt: evaluatedAt,
    lines: [
      {
        id: "line-1",
        sourceCartLineId: "cart-line-1",
        lineOrigin: "cart",
        productId: "prod-1",
        variantId: "var-1",
        productName: "Purple Rain",
        variantName: "Default",
        quantity: 2,
        sequence: 0,
        lineBasePaise: BigInt(50_000),
        lineModifierAdjustmentsPaise: BigInt(0),
        lineBundleAdjustmentsPaise: BigInt(0),
        lineSubtotalPaise: BigInt(50_000),
        linePromotionDiscountPaise: BigInt(5_000),
        lineTaxablePaise: BigInt(45_000),
        lineTaxPaise: BigInt(0),
        lineTotalPaise: BigInt(45_000),
        modifiers: [
          {
            variantModifierGroupId: "vmg-b",
            modifierGroupOptionId: "mgo-b",
            quantity: 1,
            groupName: "Toppings",
            optionName: "Pearl",
            unitDeltaPaise: BigInt(0),
          },
          {
            variantModifierGroupId: "vmg-a",
            modifierGroupOptionId: "mgo-a",
            quantity: 1,
            groupName: "Toppings",
            optionName: "Jelly",
            unitDeltaPaise: BigInt(0),
          },
        ],
        bundleSelections: [],
      },
    ],
    charges: [
      {
        id: "chg-1",
        chargeDefinitionId: "packaging-def",
        chargeCode: "packaging",
        calculationMode: "fixed_per_order",
        amountPaise: BigInt(2_000),
        name: "Packaging",
        sortOrder: 0,
      },
    ],
    promotionEffects: [
      {
        id: "eff-1",
        effectKind: "applied_promotion",
        promotionId: "promo-1",
        couponId: "coupon-1",
        promotionCode: "TEST123",
        displayName: "Test 10%",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        componentId: null,
        lineId: null,
        amountPaise: null,
        realizedDiscountPaise: BigInt(10_360),
        rewardVariantId: null,
        rewardUnitId: null,
        rewardQuantity: null,
        rewardBasePaise: null,
        sortOrder: 0,
        snapshotLineId: null,
        promotionRevision: BigInt(4),
      },
    ],
    taxComponents: [],
    ...overrides,
  };
}

describe("explainCheckoutSnapshotStructuralDifference", () => {
  it("agrees with structural equality when snapshots match", () => {
    const a = baseSnapshot();
    const b = baseSnapshot({ id: "snap-b", checkoutRevision: BigInt(99) });
    expect(checkoutSnapshotsStructurallyEqual(a, b)).toBe(true);
    expect(explainCheckoutSnapshotStructuralDifference(a, b)).toEqual({
      equal: true,
      firstDifferenceCategory: null,
    });
  });

  it("reports MODIFIER_STRUCTURE for equal-payable modifier order drift", () => {
    const a = baseSnapshot();
    const line = a.lines[0]!;
    const b = baseSnapshot({
      id: "snap-b",
      lines: [
        {
          ...line,
          id: "line-1b",
          modifiers: [line.modifiers[1]!, line.modifiers[0]!],
        },
      ],
    });
    expect(a.grandTotalPaise).toBe(b.grandTotalPaise);
    expect(checkoutSnapshotsStructurallyEqual(a, b)).toBe(false);
    expect(explainCheckoutSnapshotStructuralDifference(a, b)).toEqual({
      equal: false,
      firstDifferenceCategory: "MODIFIER_STRUCTURE",
    });
  });

  it("reports PROMOTION_EFFECT for equal-payable promotion revision change", () => {
    const a = baseSnapshot();
    const b = baseSnapshot({
      id: "snap-b",
      promotionEffects: [
        {
          ...a.promotionEffects[0]!,
          id: "eff-2",
          promotionRevision: BigInt(5),
        },
      ],
    });
    expect(a.grandTotalPaise).toBe(b.grandTotalPaise);
    expect(checkoutSnapshotsStructurallyEqual(a, b)).toBe(false);
    expect(explainCheckoutSnapshotStructuralDifference(a, b)).toEqual({
      equal: false,
      firstDifferenceCategory: "PROMOTION_EFFECT",
    });
  });

  it("reports TAX_COMPONENT for equal-payable tax allocation swap", () => {
    const a = baseSnapshot({
      taxPaise: BigInt(500),
      grandTotalPaise: BigInt(95_740),
      taxComponents: [
        {
          id: "t1",
          targetContext: "order",
          taxType: "cgst",
          rateBps: 250,
          taxableAmountPaise: BigInt(95_240),
          taxAmountPaise: BigInt(250),
          sortOrder: 0,
        },
        {
          id: "t2",
          targetContext: "order",
          taxType: "sgst",
          rateBps: 250,
          taxableAmountPaise: BigInt(95_240),
          taxAmountPaise: BigInt(250),
          sortOrder: 1,
        },
      ],
    });
    const b = baseSnapshot({
      id: "snap-b",
      taxPaise: BigInt(500),
      grandTotalPaise: BigInt(95_740),
      taxComponents: [
        { ...a.taxComponents[0]!, id: "t1b", taxAmountPaise: BigInt(100) },
        { ...a.taxComponents[1]!, id: "t2b", taxAmountPaise: BigInt(400) },
      ],
    });
    expect(a.grandTotalPaise).toBe(b.grandTotalPaise);
    expect(checkoutSnapshotsStructurallyEqual(a, b)).toBe(false);
    expect(explainCheckoutSnapshotStructuralDifference(a, b)).toEqual({
      equal: false,
      firstDifferenceCategory: "TAX_COMPONENT",
    });
  });

  it("reports COUPON_SEAL before monetary when coupon seal differs", () => {
    const a = baseSnapshot();
    const b = baseSnapshot({
      id: "snap-b",
      manualCouponCode: null,
      promotionDiscountPaise: BigInt(0),
      grandTotalPaise: BigInt(105_600),
    });
    expect(checkoutSnapshotsStructurallyEqual(a, b)).toBe(false);
    expect(explainCheckoutSnapshotStructuralDifference(a, b)).toEqual({
      equal: false,
      firstDifferenceCategory: "COUPON_SEAL",
    });
  });

  it("reports MONETARY_COMPONENT when payable changes", () => {
    const a = baseSnapshot();
    const b = baseSnapshot({
      id: "snap-b",
      grandTotalPaise: BigInt(99_000),
    });
    expect(checkoutSnapshotsStructurallyEqual(a, b)).toBe(false);
    expect(explainCheckoutSnapshotStructuralDifference(a, b)).toEqual({
      equal: false,
      firstDifferenceCategory: "MONETARY_COMPONENT",
    });
  });

  it("never returns raw values or identifiers in the explanation object", () => {
    const a = baseSnapshot();
    const b = baseSnapshot({
      id: "snap-b",
      lines: [
        {
          ...a.lines[0]!,
          modifiers: [a.lines[0]!.modifiers[1]!, a.lines[0]!.modifiers[0]!],
        },
      ],
    });
    const explanation = explainCheckoutSnapshotStructuralDifference(a, b);
    const serialized = JSON.stringify(explanation);
    expect(serialized).not.toMatch(/TEST123|Purple Rain|vmg-|Founder|95240|10360/);
    expect(Object.keys(explanation).sort()).toEqual([
      "equal",
      "firstDifferenceCategory",
    ]);
  });
});
