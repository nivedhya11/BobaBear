import { describe, expect, it } from "vitest";

import type { CheckoutSnapshot, CheckoutSnapshotLine } from "../../shared/checkout";
import type { Order, OrderOutletSummary } from "../../shared/order";
import { sealedSnapshot } from "../../../tests/gtm-closure/support/checkout-snapshot";
import { toCustomerOrderDetail, toWorkforceOrderDetail } from "./projections";

const OUTLET: OrderOutletSummary = {
  outletId: "outlet-1",
  brandId: "brand",
  code: "DDN",
  name: "Dehradun",
};

function order(): Order {
  const at = new Date("2026-10-16T07:05:00.000Z");
  return {
    id: "order-1",
    orderNumber: "BB0001",
    checkoutId: "chk-1",
    checkoutSnapshotId: "snap-1",
    paymentProvenanceKind: "PAYMENT",
    paymentId: "pay-1",
    status: "PLACED",
    revision: BigInt(1),
    createdAt: at,
    updatedAt: at,
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

function withLines(
  lines: readonly CheckoutSnapshotLine[],
  overrides: Partial<CheckoutSnapshot> = {},
): CheckoutSnapshot {
  return sealedSnapshot({ ...overrides, lines });
}

function cartLine(
  partial: Partial<CheckoutSnapshotLine> & Pick<CheckoutSnapshotLine, "id" | "productName">,
): CheckoutSnapshotLine {
  const base = sealedSnapshot().lines[0]!;
  return { ...base, ...partial };
}

describe("customer order line merchandise discount flag", () => {
  it("marks a sealed merchandise allocation without exposing the allocation amount", () => {
    const detail = toCustomerOrderDetail(order(), OUTLET, sealedSnapshot());
    expect(detail.lines[0]).toMatchObject({
      productName: "Classic Milk Tea",
      lineTotalMinor: "8000",
      merchandiseDiscountApplies: true,
    });
    expect(detail.lines[0]).not.toHaveProperty("linePromotionDiscountPaise");
    expect(detail.moneySummary.promotionDiscountMinor).toBe("2000");
    expect(detail.moneySummary.grandTotalMinor).toBe("8000");
  });

  it("leaves delivery-only, undiscounted, and complimentary lines unlabeled", () => {
    const detail = toCustomerOrderDetail(
      order(),
      OUTLET,
      withLines([
        cartLine({
          id: "paid",
          productName: "Paid drink",
          linePromotionDiscountPaise: BigInt(0),
          lineTotalPaise: BigInt(10_000),
        }),
        cartLine({
          id: "gift",
          sourceCartLineId: null,
          lineOrigin: "complimentary_offer",
          productName: "Gift bun",
          linePromotionDiscountPaise: BigInt(5_000),
          lineTotalPaise: BigInt(0),
        }),
      ], { promotionDiscountPaise: BigInt(4_000) }),
    );
    expect(detail.lines.map((line) => [line.productName, line.merchandiseDiscountApplies, line.lineTotalMinor])).toEqual([
      ["Paid drink", false, "10000"],
      ["Gift bun", false, "0"],
    ]);
    expect(detail.moneySummary.promotionDiscountMinor).not.toBe("0");
  });

  it("attributes percentage, fixed, BOGO, and modifier lines independently of tax remainder", () => {
    const detail = toCustomerOrderDetail(
      order(),
      OUTLET,
      withLines([
        cartLine({
          id: "percent",
          productName: "Percent",
          linePromotionDiscountPaise: BigInt(1_000),
          lineTaxPaise: BigInt(450),
          lineTotalPaise: BigInt(9_450),
        }),
        cartLine({
          id: "fixed-hit",
          productName: "Fixed hit",
          linePromotionDiscountPaise: BigInt(3_000),
          lineTotalPaise: BigInt(7_350),
        }),
        cartLine({
          id: "fixed-miss",
          productName: "Fixed miss",
          linePromotionDiscountPaise: BigInt(0),
          lineTaxPaise: BigInt(1),
          lineTotalPaise: BigInt(10_001),
        }),
        cartLine({
          id: "bogo",
          productName: "Bogo reward",
          quantity: 2,
          linePromotionDiscountPaise: BigInt(10_000),
          lineTotalPaise: BigInt(10_500),
        }),
        cartLine({
          id: "modifier",
          productName: "Modifier",
          linePromotionDiscountPaise: BigInt(1_830),
          lineTotalPaise: BigInt(17_293),
        }),
      ]),
    );
    expect(detail.lines.map((line) => [line.productName, line.merchandiseDiscountApplies, line.lineTotalMinor])).toEqual([
      ["Percent", true, "9450"],
      ["Fixed hit", true, "7350"],
      ["Fixed miss", false, "10001"],
      ["Bogo reward", true, "10500"],
      ["Modifier", true, "17293"],
    ]);
  });

  it("does not add the flag to the workforce order projection", () => {
    const workforce = toWorkforceOrderDetail(order(), OUTLET, sealedSnapshot());
    expect(workforce.lines[0]).not.toHaveProperty("merchandiseDiscountApplies");
    expect(workforce.lines[0]?.lineTotalMinor).toBe("8000");
  });
});
