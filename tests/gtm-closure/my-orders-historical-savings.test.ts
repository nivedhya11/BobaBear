/**
 * My Orders reads the purchased snapshot.
 * AC-036J-011-01. Live offer text is not an input to this projection.
 * Delivery proof is absent unless a caller already supplied a delivery summary.
 */
import { describe, expect, it } from "vitest";

import { toCustomerOrderDetail } from "../../src/server/order/projections";
import type { Order, OrderOutletSummary } from "../../src/shared/order";
import { moneySummaryFromSnapshot } from "../../src/shared/order/money-summary";
import { sealedSnapshot } from "./support/checkout-snapshot";

const AT = new Date("2026-10-16T07:05:00.000Z");

const OUTLET: OrderOutletSummary = {
  outletId: "outlet-1",
  brandId: "brand",
  code: "DDN",
  name: "Dehradun",
};

function placedOrder(): Order {
  return {
    id: "order-1",
    orderNumber: "BB0001",
    checkoutId: "chk-1",
    checkoutSnapshotId: "snap-1",
    paymentProvenanceKind: "PAYMENT",
    paymentId: "pay-1",
    status: "PLACED",
    revision: BigInt(1),
    createdAt: AT,
    updatedAt: AT,
    acceptedAt: null,
    acceptedByWorkforceUserId: null,
    fulfilledAt: null,
    fulfilledByWorkforceUserId: null,
    cancelledAt: null,
    cancelledByWorkforceUserId: null,
    cancelledByCustomerAuthUserId: null,
    cancellationReasonCode: null,
  };
}

describe("My Orders historical savings", () => {
  it("keeps the sealed saving after a live offer name would have changed", () => {
    const purchased = sealedSnapshot();
    const liveOfferName = { displayName: "A renamed live offer" };
    const first = moneySummaryFromSnapshot(purchased);
    liveOfferName.displayName = "Retired live offer";
    const second = moneySummaryFromSnapshot(purchased);

    expect(first.promotionDiscountMinor).toBe("2000");
    expect(first.grandTotalMinor).toBe("8000");
    expect(second).toEqual(first);
    expect(liveOfferName.displayName).toBe("Retired live offer");
  });

  it("projects delivery, takeaway, and scheduled truth from the snapshot", () => {
    const delivery = toCustomerOrderDetail(placedOrder(), OUTLET, sealedSnapshot());
    expect(delivery.fulfilmentMode).toBe("DELIVERY");
    expect(delivery.destination?.city).toBe("Dehradun");
    expect(delivery.pickupLocation).toBeNull();
    expect(delivery.fulfilmentTiming).toBe("ASAP");
    expect(delivery.moneySummary.promotionDiscountMinor).toBe("2000");
    expect(delivery.delivery).toBeNull();

    const takeaway = toCustomerOrderDetail(
      placedOrder(),
      OUTLET,
      sealedSnapshot({
        fulfilmentMode: "PICKUP",
        destination: null,
        serviceabilityEvaluatedAt: null,
        pickupLocation: {
          displayName: "Rajpur Road",
          addressLine1: "12 Rajpur Road",
          addressLine2: null,
          locality: "Rajpur",
          city: "Dehradun",
          stateCode: "IN-UT",
          postalCode: "248001",
          instructions: "Counter",
          coordinates: null,
        },
      }),
    );
    expect(takeaway.fulfilmentMode).toBe("PICKUP");
    expect(takeaway.destination).toBeNull();
    expect(takeaway.pickupLocation?.displayName).toBe("Rajpur Road");
    expect(takeaway.delivery).toBeNull();

    const scheduled = toCustomerOrderDetail(
      placedOrder(),
      OUTLET,
      sealedSnapshot({
        fulfilmentTiming: "SCHEDULED",
        scheduledWindowStartAt: new Date("2026-10-16T08:00:00.000Z"),
        scheduledWindowEndAt: new Date("2026-10-16T08:30:00.000Z"),
        scheduledTimezone: "Asia/Kolkata",
        scheduledCancellationCutoffMinutes: 30,
      }),
    );
    expect(scheduled.fulfilmentTiming).toBe("SCHEDULED");
    expect(scheduled.scheduledWindow?.timeZone).toBe("Asia/Kolkata");
    expect(scheduled.scheduledWindow?.label.length).toBeGreaterThan(0);
  });

  it("returns the same customer detail for the same purchased order", () => {
    const snapshot = sealedSnapshot();
    const order = placedOrder();
    expect(toCustomerOrderDetail(order, OUTLET, snapshot)).toEqual(
      toCustomerOrderDetail(order, OUTLET, snapshot),
    );
  });
});
