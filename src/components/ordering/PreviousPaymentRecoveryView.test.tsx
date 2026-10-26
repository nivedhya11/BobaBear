import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PreviousPaymentRecoveryView } from "./PreviousPaymentRecoveryView";
import type { CommerceCart, CommerceCheckoutSnapshot } from "@/lib/customer-commerce";

const getCustomerMenu = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("@/lib/customer-commerce", async () => {
  const actual = await vi.importActual<typeof import("@/lib/customer-commerce")>(
    "@/lib/customer-commerce",
  );
  return {
    ...actual,
    getCustomerMenu: (...args: unknown[]) => getCustomerMenu(...args),
  };
});

const publishedMenu = {
  brandId: "brand-1",
  menuId: "menu-1",
  name: "Published menu",
  sections: [{ id: "s-1", parentSectionId: null, name: "Drinks", position: 0 }],
  items: [
    {
      productId: "p-2",
      variantId: "var-brown",
      sectionId: "s-1",
      name: "Brown Sugar Boba",
      description: null,
      imagePath: null,
      displayPricePaise: 22000,
      currency: "INR" as const,
    },
  ],
};

const currentCart: CommerceCart = {
  id: "cart-1",
  brandId: "brand-1",
  ownerMode: "customer",
  revision: "16",
  manualCouponCode: null,
  expiresAt: null,
  createdAt: "2026-09-04T00:00:00.000Z",
  updatedAt: "2026-09-04T00:00:00.000Z",
  lines: [
    {
      id: "line-current",
      variantId: "var-brown",
      quantity: 1,
      modifiers: [],
      bundleSelections: [],
    },
  ],
};

const previousSnapshot = {
  id: "snap-1",
  checkoutId: "chk-1",
  checkoutRevision: "4",
  sourceCartRevision: "5",
  selectedOutletId: "outlet-1",
  evaluatedAt: "2026-09-04T00:00:00.000Z",
  serviceabilityEvaluatedAt: "2026-09-04T00:00:00.000Z",
  currency: "INR",
  manualCouponCode: null,
  destination: null,
  basePaise: "59700",
  modifierAdjustmentsPaise: "0",
  bundleAdjustmentsPaise: "0",
  chargesPaise: "6000",
  prePromotionSubtotalPaise: "65700",
  promotionDiscountPaise: "0",
  taxablePaise: "65700",
  taxPaise: "0",
  grandTotalPaise: "84700",
  taxInclusionMode: "TAX_INCLUSIVE",
  createdAt: "2026-09-04T00:00:00.000Z",
  lines: [
    {
      productName: "Hong Kong Milk Tea Boba",
      variantName: "Regular",
      quantity: 3,
      lineTotalPaise: "78700",
    },
  ],
  charges: [
    { code: "PACKAGING", amountPaise: "2000" },
    { code: "DELIVERY", amountPaise: "4000" },
  ],
  promotionEffects: [],
  taxComponents: [],
} as unknown as CommerceCheckoutSnapshot;

describe("PreviousPaymentRecoveryView", () => {
  it("labels previous checkout from the sealed snapshot and the current cart from the published menu", async () => {
    getCustomerMenu.mockResolvedValue({
      ok: true,
      status: 200,
      data: { menu: publishedMenu },
    });

    render(
      <PreviousPaymentRecoveryView
        cart={currentCart}
        previousSnapshot={previousSnapshot}
      />,
    );

    expect(screen.getByText("Previous payment is being checked")).toBeInTheDocument();
    expect(screen.getByTestId("previous-checkout-summary")).toHaveTextContent("Previous checkout");
    expect(screen.getByText("Previous checkout items")).toBeInTheDocument();
    expect(screen.getByText(/3 × Hong Kong Milk Tea Boba/)).toBeInTheDocument();
    expect(screen.queryByText("Your items")).not.toBeInTheDocument();

    expect(screen.getByTestId("current-cart-summary")).toHaveTextContent("Current cart");
    expect(screen.getByTestId("current-cart-summary")).toHaveTextContent("1 item");
    await waitFor(() => {
      expect(screen.getByTestId("current-cart-lines")).toHaveTextContent("1 × Brown Sugar Boba");
    });
    expect(screen.getByTestId("current-cart-summary")).not.toHaveTextContent(
      "Hong Kong Milk Tea Boba",
    );
    expect(screen.getByTestId("current-cart-lines")).not.toHaveTextContent("₹220");
    expect(getCustomerMenu).toHaveBeenCalledWith({ brandId: "brand-1" });

    expect(screen.getByTestId("previous-checkout-lock-copy")).toBeInTheDocument();
    expect(screen.getByTestId("previous-checkout-address-lock")).toBeInTheDocument();
    expect(screen.getByTestId("cart-changed-back-to-cart")).toHaveAttribute("href", "/order/cart/");
    expect(screen.getByTestId("cart-changed-back-to-cart")).toHaveTextContent("View current cart");
  });

  it("uses a safe label when the published menu does not include the cart variant", async () => {
    getCustomerMenu.mockResolvedValue({
      ok: false,
      status: 404,
      code: "MENU_UNAVAILABLE",
      message: "No active menu",
    });

    render(
      <PreviousPaymentRecoveryView
        cart={currentCart}
        previousSnapshot={previousSnapshot}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-cart-lines")).toHaveTextContent("1 × Item");
    });
    expect(screen.getByText(/3 × Hong Kong Milk Tea Boba/)).toBeInTheDocument();
    expect(screen.getByTestId("current-cart-lines")).not.toHaveTextContent("₹");
  });
});
