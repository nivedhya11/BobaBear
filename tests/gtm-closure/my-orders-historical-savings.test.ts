/**
 * My Orders reads the purchased snapshot.
 * AC-036J-011-01. Live offer text is not an input to this projection.
 * Delivery proof is absent unless a caller already supplied a delivery summary.
 */
import { describe, expect, it } from "vitest";

import { toCustomerOrderDetail } from "../../src/server/order/projections";
import type { CheckoutSnapshotPromotionEffect } from "../../src/shared/checkout";
import type { CustomerOrderDetail, Order, OrderOutletSummary } from "../../src/shared/order";
import { moneySummaryFromSnapshot } from "../../src/shared/order/money-summary";
import { CHARGE_DEFINITION_DELIVERY_ID } from "../../src/shared/pricing";
import { sealedSnapshot } from "./support/checkout-snapshot";

const DELIVERY_COMPONENT_ID = `charge:${CHARGE_DEFINITION_DELIVERY_ID}`;

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
    expect(first.orderSavingMinor).toBe("0");
    expect(first.deliverySavingMinor).toBe("0");
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
    expect(delivery.moneySummary.orderSavingMinor).toBe("0");
    expect(delivery.moneySummary.deliverySavingMinor).toBe("0");
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

function allocation(
  partial: Partial<CheckoutSnapshotPromotionEffect> &
    Pick<CheckoutSnapshotPromotionEffect, "id" | "amountPaise" | "componentId">,
): CheckoutSnapshotPromotionEffect {
  return {
    effectKind: "monetary_allocation",
    promotionId: "promo",
    couponId: null,
    promotionCode: "OFFER",
    displayName: "Sealed offer",
    triggerType: "coupon",
    stackingPolicy: "compatible",
    lineId: null,
    realizedDiscountPaise: null,
    rewardVariantId: null,
    rewardUnitId: null,
    rewardQuantity: null,
    rewardBasePaise: null,
    sortOrder: 1,
    snapshotLineId: null,
    promotionRevision: BigInt(3),
    ...partial,
  };
}

function serializedCustomerOrder(detail: CustomerOrderDetail) {
  const body = JSON.stringify({ ok: true, order: detail }, (_key, value: unknown) =>
    typeof value === "bigint" ? value.toString(10) : value,
  );
  return JSON.parse(body) as {
    ok: true;
    order: {
      moneySummary: {
        prePromotionSubtotalMinor: string;
        promotionDiscountMinor: string;
        orderSavingMinor: string;
        deliverySavingMinor: string;
        charges: readonly { chargeCode: string; name: string; amountMinor: string }[];
        taxMinor: string;
        grandTotalMinor: string;
        currency: string;
      };
    };
  };
}

describe("serialized customer order saving split", () => {
  it("puts sealed components on the customer order response without changing payable", () => {
    const purchased = sealedSnapshot({
      chargesPaise: BigInt(2000),
      prePromotionSubtotalPaise: BigInt(12_000),
      promotionDiscountPaise: BigInt(12_000),
      taxablePaise: BigInt(2000),
      taxPaise: BigInt(1270),
      grandTotalPaise: BigInt(3270),
      charges: [
        {
          id: "charge-pack",
          chargeDefinitionId: "pack",
          chargeCode: "packaging",
          calculationMode: "fixed_per_order",
          amountPaise: BigInt(2000),
          name: "Packaging",
          sortOrder: 1,
        },
        {
          id: "charge-del",
          chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
          chargeCode: "delivery",
          calculationMode: "fixed_per_order",
          amountPaise: BigInt(0),
          name: "Delivery",
          sortOrder: 2,
        },
      ],
      promotionEffects: [
        allocation({ id: "order", amountPaise: BigInt(8000), componentId: "base:line-1" }),
        allocation({
          id: "delivery",
          amountPaise: BigInt(4000),
          componentId: DELIVERY_COMPONENT_ID,
          sortOrder: 2,
        }),
      ],
    });
    const liveName = { displayName: "Live offer renamed after purchase" };
    const detail = toCustomerOrderDetail(placedOrder(), OUTLET, purchased);
    liveName.displayName = "Retired";
    const response = serializedCustomerOrder(detail);
    const money = response.order.moneySummary;

    expect(response.ok).toBe(true);
    expect(money.orderSavingMinor).toBe("8000");
    expect(money.deliverySavingMinor).toBe("4000");
    expect(money.promotionDiscountMinor).toBe("12000");
    expect(BigInt(money.orderSavingMinor) + BigInt(money.deliverySavingMinor)).toBe(
      BigInt(money.promotionDiscountMinor),
    );
    expect(money.taxMinor).toBe("1270");
    expect(money.grandTotalMinor).toBe(purchased.grandTotalPaise.toString());
    expect(money.charges).toEqual([
      { chargeCode: "packaging", name: "Packaging", amountMinor: "2000" },
      { chargeCode: "delivery", name: "Delivery", amountMinor: "0" },
    ]);
    expect(money.currency).toBe("INR");
    expect(money).not.toHaveProperty("discountMinor");
    expect(serializedCustomerOrder(toCustomerOrderDetail(placedOrder(), OUTLET, purchased))).toEqual(
      response,
    );
  });
});
