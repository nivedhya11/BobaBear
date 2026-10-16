import { describe, expect, it, vi } from "vitest";

import type { CheckoutSnapshot } from "../../shared/checkout";
import {
  buildCheckoutPrepareDiagnosticEvent,
  CHECKOUT_PREPARE_DIAGNOSTIC_LOG_FIELDS,
  observeNonStructuralCheckoutPrepareRejection,
  observeStructuralCheckoutPrepareMismatch,
  safeNotifyCheckoutPrepareDiagnostic,
} from "./prepare-diagnostic";

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
    lines: [],
    charges: [],
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
        amountPaise: BigInt(10_360),
        realizedDiscountPaise: BigInt(10_360),
        rewardVariantId: null,
        rewardUnitId: null,
        rewardQuantity: null,
        rewardBasePaise: null,
        sortOrder: 0,
        snapshotLineId: null,
        promotionRevision: BigInt(1),
      },
    ],
    taxComponents: [],
    ...overrides,
  };
}

describe("prepare-diagnostic", () => {
  it("builds allowlisted STRUCTURAL events without money or identity values", () => {
    const sealed = baseSnapshot();
    const candidate = baseSnapshot({
      promotionEffects: [
        {
          ...baseSnapshot().promotionEffects[0]!,
          promotionRevision: BigInt(2),
        },
      ],
    });
    const observation = observeStructuralCheckoutPrepareMismatch({
      sealedComparable: sealed,
      candidateComparable: candidate,
    });
    expect(observation).toEqual({
      rejectionStage: "STRUCTURAL",
      firstDifferenceCategory: "PROMOTION_EFFECT",
      payableChanged: false,
    });

    const event = buildCheckoutPrepareDiagnosticEvent({
      requestId: "req-1",
      observation,
    });
    expect(Object.keys(event).sort()).toEqual(
      [...CHECKOUT_PREPARE_DIAGNOSTIC_LOG_FIELDS].sort(),
    );
    expect(event).toEqual({
      requestId: "req-1",
      operation: "checkout_prepare_diagnostic",
      safeOutcomeCode: "CHECKOUT_REPRICED",
      rejectionStage: "STRUCTURAL",
      firstDifferenceCategory: "PROMOTION_EFFECT",
      payableChanged: false,
    });
    const serialized = JSON.stringify(event);
    expect(serialized).not.toMatch(/95240|95_240|promo-1|chk-a|TEST123|Founder/);
  });

  it("reports payableChanged=true when grand totals differ structurally", () => {
    const sealed = baseSnapshot();
    const candidate = baseSnapshot({
      grandTotalPaise: BigInt(100_000),
      basePaise: BigInt(108_000),
      prePromotionSubtotalPaise: BigInt(110_000),
      taxablePaise: BigInt(100_000),
    });
    const observation = observeStructuralCheckoutPrepareMismatch({
      sealedComparable: sealed,
      candidateComparable: candidate,
    });
    expect(observation.rejectionStage).toBe("STRUCTURAL");
    expect(observation.payableChanged).toBe(true);
    expect(observation.firstDifferenceCategory).toBe("MONETARY_COMPONENT");
    expect(JSON.stringify(observation)).not.toMatch(/100000|95240/);
  });

  it("does not misrepresent earlier stages as STRUCTURAL", () => {
    for (const stage of [
      "CART_REVISION",
      "DELIVERY_SERVICEABILITY",
      "PICKUP_ELIGIBILITY",
      "MERCHANDISE_AVAILABILITY",
      "SCHEDULED_ELIGIBILITY",
      "SCHEDULED_TERMS",
    ] as const) {
      const observation = observeNonStructuralCheckoutPrepareRejection(stage);
      const event = buildCheckoutPrepareDiagnosticEvent({
        requestId: "req-2",
        observation,
      });
      expect(event.rejectionStage).toBe(stage);
      expect(event.firstDifferenceCategory).toBeNull();
      expect(event.payableChanged).toBeNull();
    }
  });

  it("discards unsupported fields and invalid enums at runtime", () => {
    const dirty = {
      requestId: "req-3",
      observation: {
        rejectionStage: "NOT_A_STAGE",
        firstDifferenceCategory: "PROMOTION_EFFECT",
        payableChanged: false,
        customerId: "cust-secret",
        couponCode: "TEST123",
        grandTotalPaise: 95240,
        checkoutId: "chk-leak",
      },
    } as unknown as Parameters<typeof buildCheckoutPrepareDiagnosticEvent>[0];

    const event = buildCheckoutPrepareDiagnosticEvent(dirty);
    expect(event.rejectionStage).toBe("UNKNOWN");
    expect(event.firstDifferenceCategory).toBeNull();
    expect(event.payableChanged).toBeNull();
    expect(event).not.toHaveProperty("customerId");
    expect(event).not.toHaveProperty("couponCode");
    expect(event).not.toHaveProperty("grandTotalPaise");
    expect(event).not.toHaveProperty("checkoutId");
  });

  it("swallows observer failures", async () => {
    const observer = vi.fn(() => {
      throw new Error("diagnostic boom");
    });
    await expect(
      safeNotifyCheckoutPrepareDiagnostic(
        observer,
        observeNonStructuralCheckoutPrepareRejection("CART_REVISION"),
      ),
    ).resolves.toBeUndefined();
    expect(observer).toHaveBeenCalledOnce();
  });

  it("keeps concurrent observers isolated by closure", async () => {
    const seen: Array<{ requestId: string; stage: string }> = [];
    const obsA = async (o: { rejectionStage: string }) => {
      seen.push({ requestId: "req-a", stage: o.rejectionStage });
    };
    const obsB = async (o: { rejectionStage: string }) => {
      seen.push({ requestId: "req-b", stage: o.rejectionStage });
    };
    await Promise.all([
      safeNotifyCheckoutPrepareDiagnostic(
        obsA,
        observeNonStructuralCheckoutPrepareRejection("CART_REVISION"),
      ),
      safeNotifyCheckoutPrepareDiagnostic(
        obsB,
        observeNonStructuralCheckoutPrepareRejection("MERCHANDISE_AVAILABILITY"),
      ),
    ]);
    expect(seen).toEqual(
      expect.arrayContaining([
        { requestId: "req-a", stage: "CART_REVISION" },
        { requestId: "req-b", stage: "MERCHANDISE_AVAILABILITY" },
      ]),
    );
    expect(seen).toHaveLength(2);
  });
});
