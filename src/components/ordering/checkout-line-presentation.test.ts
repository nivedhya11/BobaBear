import { describe, expect, it } from "vitest";

import {
  narrowCheckoutSnapshotLines,
  sealedMerchandiseDiscountApplies,
} from "./checkout-line-presentation";

function line(overrides: Record<string, unknown> = {}) {
  return {
    productName: "Purple Rain Taro Boba",
    variantName: "Regular",
    quantity: 2,
    lineTotalPaise: "46620",
    lineOrigin: "cart",
    linePromotionDiscountPaise: "0",
    ...overrides,
  };
}

describe("sealed merchandise discount label signal", () => {
  it("labels a positive sealed merchandise allocation and keeps the net", () => {
    const rows = narrowCheckoutSnapshotLines([
      line({ linePromotionDiscountPaise: "5180", lineTotalPaise: "46620" }),
    ]);
    expect(rows[0]?.merchandiseDiscountApplies).toBe(true);
    expect(rows[0]?.lineTotalPaise).toBe("46620");
  });

  it("does not label an ordinary undiscounted line", () => {
    expect(sealedMerchandiseDiscountApplies(line())).toBe(false);
  });

  it("does not label a delivery-only saving, which is not on the line allocation", () => {
    expect(
      sealedMerchandiseDiscountApplies(
        line({ linePromotionDiscountPaise: "0", lineTotalPaise: "51800" }),
      ),
    ).toBe(false);
  });

  it("does not label a complimentary line even when its internal allocation is positive", () => {
    expect(
      sealedMerchandiseDiscountApplies(
        line({
          lineOrigin: "complimentary_offer",
          linePromotionDiscountPaise: "10000",
          lineTotalPaise: "0",
        }),
      ),
    ).toBe(false);
  });

  it("labels only the lines that received percentage, fixed, BOGO, or modifier allocations", () => {
    const rows = narrowCheckoutSnapshotLines([
      line({ productName: "Percent", linePromotionDiscountPaise: "1000", lineTotalPaise: "9450" }),
      line({ productName: "Fixed share", linePromotionDiscountPaise: "3000", lineTotalPaise: "7350" }),
      line({ productName: "Fixed other", linePromotionDiscountPaise: "0", lineTotalPaise: "10000" }),
      line({ productName: "Bogo reward", quantity: 2, linePromotionDiscountPaise: "10000", lineTotalPaise: "10500" }),
      line({ productName: "Bogo paid", linePromotionDiscountPaise: "0", lineTotalPaise: "10000" }),
      line({ productName: "With modifier", linePromotionDiscountPaise: "1830", lineTotalPaise: "17293" }),
    ]);
    expect(rows.map((row) => [row.productName, row.merchandiseDiscountApplies, row.lineTotalPaise])).toEqual([
      ["Percent", true, "9450"],
      ["Fixed share", true, "7350"],
      ["Fixed other", false, "10000"],
      ["Bogo reward", true, "10500"],
      ["Bogo paid", false, "10000"],
      ["With modifier", true, "17293"],
    ]);
  });

  it("fails closed when the sealed allocation is missing or not a wire paise string", () => {
    expect(sealedMerchandiseDiscountApplies(line({ linePromotionDiscountPaise: undefined }))).toBe(false);
    expect(sealedMerchandiseDiscountApplies(line({ linePromotionDiscountPaise: 5180 }))).toBe(false);
    expect(sealedMerchandiseDiscountApplies(line({ linePromotionDiscountPaise: "0" }))).toBe(false);
    expect(sealedMerchandiseDiscountApplies(line({ linePromotionDiscountPaise: "-1" }))).toBe(false);
  });
});
