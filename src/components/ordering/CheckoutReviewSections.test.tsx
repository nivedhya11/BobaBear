import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CheckoutSnapshotLineList } from "./CheckoutReviewSections";
import { narrowCheckoutSnapshotLines } from "./checkout-line-presentation";

function rows(lines: readonly Record<string, unknown>[]) {
  return narrowCheckoutSnapshotLines(lines);
}

describe("Checkout Review after-discount label", () => {
  it("shows the visible words beside the unchanged net and not on other lines", () => {
    render(
      <CheckoutSnapshotLineList
        title="Your items"
        showAfterDiscountLabel
        lines={rows([
          {
            productName: "Purple Rain Taro Boba",
            variantName: "Regular",
            quantity: 2,
            lineTotalPaise: "46620",
            lineOrigin: "cart",
            linePromotionDiscountPaise: "5180",
          },
          {
            productName: "Classic Milk Tea",
            variantName: "Regular",
            quantity: 1,
            lineTotalPaise: "19900",
            lineOrigin: "cart",
            linePromotionDiscountPaise: "0",
          },
          {
            productName: "Honey Boba",
            variantName: "",
            quantity: 1,
            lineTotalPaise: "0",
            lineOrigin: "complimentary_offer",
            linePromotionDiscountPaise: "15000",
          },
        ])}
      />,
    );

    const label = screen.getByText("After discount");
    expect(label).toBeVisible();
    expect(label).not.toHaveAttribute("aria-hidden");
    expect(screen.getByText("₹466.20")).toBeVisible();
    expect(screen.getByText("₹199.00")).toBeVisible();
    expect(screen.getByText("₹0.00")).toBeVisible();
    expect(screen.getByText("Included with your offer")).toBeVisible();
    expect(screen.getAllByText("After discount")).toHaveLength(1);
    expect(screen.queryByText("₹518.00")).not.toBeInTheDocument();
  });

  it("stays unlabeled when the list is reused outside Review", () => {
    render(
      <CheckoutSnapshotLineList
        lines={rows([
          {
            productName: "Purple Rain Taro Boba",
            variantName: "Regular",
            quantity: 2,
            lineTotalPaise: "46620",
            linePromotionDiscountPaise: "5180",
          },
        ])}
      />,
    );
    expect(screen.queryByText("After discount")).not.toBeInTheDocument();
    expect(screen.getByText("₹466.20")).toBeVisible();
  });
});
