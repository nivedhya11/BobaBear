/**
 * First-order and returning-order eligibility, plus Delivery, Takeaway, and Scheduled.
 * AC-036J-005-01, AC-036J-005-02, AC-036J-006-01, AC-036J-006-02.
 * GJ-FIRST-ORDER and GJ-RETURNING-ORDER browser paths are not claimed here.
 */
import { describe, expect, it } from "vitest";

import { evaluateEligibility } from "../../src/shared/promotions";
import { listEligibleScheduledWindows } from "../../src/shared/scheduled-fulfilment/windows";
import {
  evaluationContext,
  merchandiseSnapshot,
  offer,
} from "./support/promotion-fixtures";

const SNAPSHOT = merchandiseSnapshot(BigInt(10_000));

describe("first order and returning order", () => {
  const firstOrderOffer = offer({
    id: "first-order",
    triggerType: "automatic",
    firstOrderOnly: true,
  });

  it("keeps an authenticated customer eligible when no successful purchase exists", () => {
    const result = evaluateEligibility(
      firstOrderOffer,
      SNAPSHOT,
      evaluationContext({
        customerId: "customer-new",
        firstOrderPurchaseStatus: "NO_PRIOR_PURCHASE",
      }),
    );
    expect(result).toMatchObject({ eligible: true, reasonCode: "ELIGIBLE" });
  });

  it("requires identity before a first-order offer can apply", () => {
    const result = evaluateEligibility(
      firstOrderOffer,
      SNAPSHOT,
      evaluationContext({
        customerId: null,
        firstOrderPurchaseStatus: "NO_PRIOR_PURCHASE",
      }),
    );
    expect(result).toMatchObject({
      eligible: false,
      reasonCode: "FIRST_ORDER_IDENTITY_REQUIRED",
    });
  });

  it("does not restore first-order eligibility after a prior successful purchase", () => {
    const result = evaluateEligibility(
      firstOrderOffer,
      SNAPSHOT,
      evaluationContext({
        customerId: "customer-returning",
        firstOrderPurchaseStatus: "HAS_PRIOR_PURCHASE",
      }),
    );
    expect(result).toMatchObject({
      eligible: false,
      reasonCode: "FIRST_ORDER_NOT_ELIGIBLE",
    });
  });
});

describe("fulfilment mode and scheduled timing", () => {
  it("applies a delivery offer on delivery and refuses it on pickup", () => {
    const deliveryOffer = offer({
      id: "delivery-only",
      eligibleFulfilmentModes: ["DELIVERY"],
    });
    expect(
      evaluateEligibility(
        deliveryOffer,
        SNAPSHOT,
        evaluationContext({ fulfilmentMode: "DELIVERY" }),
      ).eligible,
    ).toBe(true);
    expect(
      evaluateEligibility(
        deliveryOffer,
        SNAPSHOT,
        evaluationContext({ fulfilmentMode: "PICKUP" }),
      ),
    ).toMatchObject({ eligible: false, reasonCode: "FULFILMENT_MODE_MISMATCH" });
  });

  it("applies a pickup offer on pickup and refuses it on delivery", () => {
    const pickupOffer = offer({
      id: "pickup-only",
      eligibleFulfilmentModes: ["PICKUP"],
    });
    expect(
      evaluateEligibility(
        pickupOffer,
        SNAPSHOT,
        evaluationContext({ fulfilmentMode: "PICKUP" }),
      ).eligible,
    ).toBe(true);
    expect(
      evaluateEligibility(
        pickupOffer,
        SNAPSHOT,
        evaluationContext({ fulfilmentMode: "DELIVERY" }),
      ),
    ).toMatchObject({ eligible: false, reasonCode: "FULFILMENT_MODE_MISMATCH" });
  });

  it("consumes accepted scheduled timing and does not treat ASAP as scheduled", () => {
    const scheduledOffer = offer({
      id: "scheduled-only",
      eligibleFulfilmentTimings: ["SCHEDULED"],
    });
    expect(
      evaluateEligibility(
        scheduledOffer,
        SNAPSHOT,
        evaluationContext({ fulfilmentTiming: "SCHEDULED" }),
      ),
    ).toMatchObject({ eligible: true, reasonCode: "ELIGIBLE" });
    expect(
      evaluateEligibility(
        scheduledOffer,
        SNAPSHOT,
        evaluationContext({ fulfilmentTiming: "ASAP" }),
      ),
    ).toMatchObject({ eligible: false, reasonCode: "FULFILMENT_TIMING_MISMATCH" });
  });

  it("lists only lead-time-eligible outlet windows and omits a closed local date", () => {
    const now = new Date("2026-08-09T12:00:00.000Z");
    const open = listEligibleScheduledWindows({
      now,
      timeZone: "Asia/Kolkata",
      intervals: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
        dayOfWeek,
        startMinute: 0,
        endMinute: 1440,
      })),
      closedLocalDates: new Set(),
      minLeadMinutes: 30,
    });
    const closed = listEligibleScheduledWindows({
      now,
      timeZone: "Asia/Kolkata",
      intervals: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
        dayOfWeek,
        startMinute: 0,
        endMinute: 1440,
      })),
      closedLocalDates: new Set(["2026-08-09"]),
      minLeadMinutes: 30,
    });

    expect(open[0]?.startAt.toISOString()).toBe("2026-08-09T12:30:00.000Z");
    expect(open.some((window) => window.localDate === "2026-08-09")).toBe(true);
    expect(closed.some((window) => window.localDate === "2026-08-09")).toBe(false);
    expect(closed.every((window) => window.localDate === "2026-08-10")).toBe(true);
  });
});
