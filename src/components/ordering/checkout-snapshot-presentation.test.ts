import { describe, expect, it } from "vitest";

import {
  narrowSnapshotCharges,
  narrowSnapshotTaxComponents,
  sealedCustomerSavingsFromSnapshot,
  snapshotPayableRows,
} from "./checkout-snapshot-presentation";
import type { CommerceCheckoutSnapshot } from "@/lib/customer-commerce";
import { CHARGE_DEFINITION_DELIVERY_ID } from "@/shared/pricing";

const CANONICAL_DELIVERY_COMPONENT_ID = `charge:${CHARGE_DEFINITION_DELIVERY_ID}`;
const ORDER_LINE_COMPONENT_ID = "base:line-1";

const snapshot: CommerceCheckoutSnapshot = {
  id: "snap-1",
  checkoutId: "chk-1",
  checkoutRevision: "3",
  sourceCartRevision: "2",
  selectedOutletId: "outlet-1",
  evaluatedAt: "2026-08-13T00:10:00.000Z",
  fulfilmentMode: "DELIVERY",
  serviceabilityEvaluatedAt: "2026-08-13T00:10:00.000Z",
  currency: "INR",
  basePaise: "19900",
  chargesPaise: "6000",
  prePromotionSubtotalPaise: "25900",
  promotionDiscountPaise: "500",
  taxablePaise: "25400",
  taxPaise: "1270",
  grandTotalPaise: "27195",
  taxInclusionMode: "exclusive",
  destination: {
    destinationKind: "ONE_TIME_ADDRESS",
    sourceSavedAddressId: null,
    recipientName: "A",
    recipientPhone: "+919876543210",
    addressLine1: "1 Mall Road",
    addressLine2: null,
    landmark: null,
    locality: null,
    city: "Dehradun",
    stateCode: "IN-UT",
    postalCode: "248001",
    coordinates: null,
    label: null,
  },
  pickupLocation: null,
  lines: [],
  charges: [
    { chargeCode: "packaging", amountPaise: "2000", name: "Packaging fee" },
    { chargeCode: "delivery", amountPaise: "4000", name: "Delivery fee" },
  ],
  promotionEffects: [],
  taxComponents: [{ taxType: "CGST", taxAmountPaise: "635" }, { taxType: "SGST", taxAmountPaise: "635" }],
};

describe("checkout snapshot presentation", () => {
  it("narrows charge and tax rows safely", () => {
    expect(narrowSnapshotCharges(snapshot.charges)).toEqual([
      { chargeCode: "packaging", amountPaise: "2000", name: "Packaging fee" },
      { chargeCode: "delivery", amountPaise: "4000", name: "Delivery fee" },
    ]);
    expect(narrowSnapshotTaxComponents(snapshot.taxComponents)).toEqual([
      { taxType: "CGST", taxAmountPaise: "635" },
      { taxType: "SGST", taxAmountPaise: "635" },
    ]);
  });

  it("builds payable rows with merchandise subtotal, itemized charges, and authoritative total", () => {
    const rows = snapshotPayableRows(snapshot);
    expect(rows.find((row) => row.key === "subtotal")?.amountPaise).toBe("19900");
    expect(rows.some((row) => row.key === "charge-packaging")).toBe(true);
    expect(rows.some((row) => row.key === "charge-delivery")).toBe(true);
    expect(rows.find((row) => row.key === "total")?.amountPaise).toBe("27195");
  });

  it("keeps Founder UAT money shape: merchandise 108600 + charges 6000 => grandTotal 114600", () => {
    const uat: CommerceCheckoutSnapshot = {
      ...snapshot,
      basePaise: "108600",
      chargesPaise: "6000",
      prePromotionSubtotalPaise: "114600",
      promotionDiscountPaise: "0",
      taxablePaise: "114600",
      taxPaise: "0",
      grandTotalPaise: "114600",
      taxInclusionMode: "inclusive",
      taxComponents: [],
    };
    const rows = snapshotPayableRows(uat);
    expect(rows.find((row) => row.key === "subtotal")?.amountPaise).toBe("108600");
    expect(rows.find((row) => row.key === "charge-packaging")?.amountPaise).toBe("2000");
    expect(rows.find((row) => row.key === "charge-delivery")?.amountPaise).toBe("4000");
    expect(rows.find((row) => row.key === "total")?.amountPaise).toBe("114600");
  });

  it("A. delivery-only uses the canonical charge definition identity", () => {
    expect(
      sealedCustomerSavingsFromSnapshot({
        ...snapshot,
        promotionDiscountPaise: "4000",
        promotionEffects: [
          {
            effectKind: "monetary_allocation",
            amountPaise: "4000",
            snapshotLineId: null,
            componentId: CANONICAL_DELIVERY_COMPONENT_ID,
          },
        ],
      }),
    ).toEqual({
      orderSavingPaise: "0",
      deliverySavingPaise: "4000",
      totalSavedPaise: "4000",
    });
  });

  it("B. order plus delivery splits exact sealed allocations", () => {
    expect(
      sealedCustomerSavingsFromSnapshot({
        ...snapshot,
        promotionDiscountPaise: "12000",
        promotionEffects: [
          {
            effectKind: "monetary_allocation",
            amountPaise: "8000",
            snapshotLineId: null,
            componentId: ORDER_LINE_COMPONENT_ID,
          },
          {
            effectKind: "monetary_allocation",
            amountPaise: "4000",
            snapshotLineId: null,
            componentId: CANONICAL_DELIVERY_COMPONENT_ID,
          },
        ],
      }),
    ).toEqual({
      orderSavingPaise: "8000",
      deliverySavingPaise: "4000",
      totalSavedPaise: "12000",
    });
  });

  it("C. complimentary plus delivery keeps only real delivery saving", () => {
    expect(
      sealedCustomerSavingsFromSnapshot({
        ...snapshot,
        promotionDiscountPaise: "19000",
        promotionEffects: [
          {
            effectKind: "monetary_allocation",
            amountPaise: "15000",
            snapshotLineId: "gift-line",
            componentId: "base:complimentary:promo-gift",
          },
          {
            effectKind: "monetary_allocation",
            amountPaise: "4000",
            snapshotLineId: null,
            componentId: CANONICAL_DELIVERY_COMPONENT_ID,
          },
        ],
      }),
    ).toEqual({
      orderSavingPaise: "0",
      deliverySavingPaise: "4000",
      totalSavedPaise: "4000",
    });
  });

  it("D. gift plus order plus delivery excludes the synthetic gift allocation", () => {
    expect(
      sealedCustomerSavingsFromSnapshot({
        ...snapshot,
        promotionDiscountPaise: "27000",
        promotionEffects: [
          {
            effectKind: "monetary_allocation",
            amountPaise: "15000",
            snapshotLineId: "gift-line",
            componentId: "base:complimentary:promo-gift",
          },
          {
            effectKind: "monetary_allocation",
            amountPaise: "8000",
            snapshotLineId: null,
            componentId: ORDER_LINE_COMPONENT_ID,
          },
          {
            effectKind: "monetary_allocation",
            amountPaise: "4000",
            snapshotLineId: null,
            componentId: CANONICAL_DELIVERY_COMPONENT_ID,
          },
        ],
      }),
    ).toEqual({
      orderSavingPaise: "8000",
      deliverySavingPaise: "4000",
      totalSavedPaise: "12000",
    });
  });

  it("does not classify an unrelated component whose text contains delivery", () => {
    expect(
      sealedCustomerSavingsFromSnapshot({
        ...snapshot,
        promotionDiscountPaise: "8000",
        promotionEffects: [
          {
            effectKind: "monetary_allocation",
            amountPaise: "8000",
            snapshotLineId: null,
            componentId: "base:line-free-delivery-drink",
            displayName: "Free delivery drink",
          },
        ],
      }),
    ).toEqual({
      orderSavingPaise: "8000",
      deliverySavingPaise: "0",
      totalSavedPaise: "8000",
    });
  });
});
