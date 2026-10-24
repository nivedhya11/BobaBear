/**
 * Accessible names visible to a component test.
 * Coupon entry and previous-checkout recovery. No viewport harness is claimed.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CouponField } from "../../src/components/ordering/CouponField";
import { IMP036J_COPY } from "../../src/components/ordering/imp036j-copy";
import { PreviousPaymentRecoveryView } from "../../src/components/ordering/PreviousPaymentRecoveryView";
import type { CommerceCart } from "../../src/lib/customer-commerce";
import type { OrderingCatalog } from "../../src/shared/ordering-catalog";

const CART: CommerceCart = {
  id: "cart-1",
  brandId: "brand",
  ownerMode: "guest",
  revision: "4",
  manualCouponCode: null,
  expiresAt: null,
  createdAt: "2026-10-16T07:00:00.000Z",
  updatedAt: "2026-10-16T07:00:00.000Z",
  lines: [],
};

const CATALOG: OrderingCatalog = {
  brandId: "brand",
  brandCode: "BOBA",
  importId: "import-1",
  importVersion: 1,
  sourceInventorySha256: "abc",
  sections: [],
  items: [],
};

describe("accessible names on coupon and payment recovery", () => {
  it("names the coupon field, apply, and a failed result", () => {
    render(
      <CouponField
        code=""
        appliedCode={null}
        pending={false}
        onCodeChange={() => undefined}
        onApply={() => undefined}
        onRemove={() => undefined}
        statusText={IMP036J_COPY.INVALID}
        statusTone="alert"
        invalid
        returnPath="/order/cart/"
      />,
    );

    expect(screen.getByRole("textbox", { name: IMP036J_COPY.COUPON_LABEL })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: IMP036J_COPY.APPLY })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(IMP036J_COPY.INVALID);
  });

  it("keeps the applied coupon visible until the parent removes it", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <CouponField
        code="SAVE20"
        appliedCode="SAVE20"
        pending={false}
        onCodeChange={() => undefined}
        onApply={() => undefined}
        onRemove={onRemove}
        statusText={IMP036J_COPY.APPLIED_COUPON}
        statusTone="polite"
        returnPath="/order/checkout/"
      />,
    );

    expect(screen.getByRole("button", { name: IMP036J_COPY.CHANGE })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: IMP036J_COPY.REMOVE }));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: IMP036J_COPY.REMOVE })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(IMP036J_COPY.APPLIED_COUPON);
  });

  it("names previous checkout and current cart on payment recovery", () => {
    render(
      <PreviousPaymentRecoveryView
        cart={CART}
        catalog={CATALOG}
        previousSnapshot={null}
      />,
    );

    expect(screen.getByRole("region", { name: "Previous checkout" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Current cart" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View current cart" })).toHaveAttribute(
      "href",
      "/order/cart/",
    );
  });
});
