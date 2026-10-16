/**
 * IMP-036J #384A — CheckoutClient flow: committed cart coupon + failed Review rebase.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutClient } from "./CheckoutClient";
import { IMP036J_COPY } from "./imp036j-copy";
import type { OrderingCatalog } from "@/shared/ordering-catalog";

const startCheckout = vi.fn();
const getActiveCheckout = vi.fn();
const getActiveCart = vi.fn();
const listOwnAddresses = vi.fn();
const listCheckoutScheduledWindows = vi.fn();
const evaluateCheckout = vi.fn();
const setCheckoutFulfilment = vi.fn();
const setCheckoutDestination = vi.fn();
const setCheckoutFulfilmentTiming = vi.fn();
const applyCartCoupon = vi.fn();
const removeCartCoupon = vi.fn();
const startPayment = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/customer-auth/client", () => ({
  fetchCustomerSession: vi.fn(async () => ({
    ok: true,
    data: { authenticated: true },
  })),
}));

vi.mock("@/components/ordering/PaymentPanel", () => ({
  PaymentPanel: (props: {
    onBackToReview?: (checkoutRevision: string) => void;
  }) => (
    <div data-testid="payment-panel-mock">
      <button
        type="button"
        data-testid="payment-back-to-review"
        onClick={() => props.onBackToReview?.("3")}
      >
        Back to review
      </button>
    </div>
  ),
}));

vi.mock("@/lib/customer-commerce", async () => {
  const actual = await vi.importActual<typeof import("@/lib/customer-commerce")>(
    "@/lib/customer-commerce",
  );
  return {
    ...actual,
    startCheckout: (...args: unknown[]) => startCheckout(...args),
    getActiveCheckout: (...args: unknown[]) => getActiveCheckout(...args),
    getActiveCart: (...args: unknown[]) => getActiveCart(...args),
    listOwnAddresses: (...args: unknown[]) => listOwnAddresses(...args),
    listCheckoutScheduledWindows: (...args: unknown[]) =>
      listCheckoutScheduledWindows(...args),
    evaluateCheckout: (...args: unknown[]) => evaluateCheckout(...args),
    setCheckoutFulfilment: (...args: unknown[]) => setCheckoutFulfilment(...args),
    setCheckoutDestination: (...args: unknown[]) => setCheckoutDestination(...args),
    setCheckoutFulfilmentTiming: (...args: unknown[]) =>
      setCheckoutFulfilmentTiming(...args),
    applyCartCoupon: (...args: unknown[]) => applyCartCoupon(...args),
    removeCartCoupon: (...args: unknown[]) => removeCartCoupon(...args),
    startPayment: (...args: unknown[]) => startPayment(...args),
    readGuestCartCredential: vi.fn(() => null),
    clearGuestCartCredential: vi.fn(),
    listCustomerOrders: vi.fn(async () => ({ ok: true, data: { items: [] } })),
    readPaymentRecovery: vi.fn(() => null),
  };
});

const catalog = { brandId: "brand-1" } as unknown as OrderingCatalog;

const cart = {
  id: "cart-1",
  brandId: "brand-1",
  ownerMode: "customer",
  revision: "2",
  manualCouponCode: null as string | null,
  expiresAt: null,
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
  lines: [
    {
      id: "line-1",
      variantId: "var-1",
      quantity: 1,
      modifiers: [],
      bundleSelections: [],
    },
  ],
};

const snapshot = {
  id: "snap-old",
  checkoutId: "chk-1",
  checkoutRevision: "3",
  sourceCartRevision: "2",
  selectedOutletId: "outlet-1",
  evaluatedAt: "2026-08-13T00:00:00.000Z",
  fulfilmentMode: "DELIVERY" as const,
  fulfilmentTiming: "ASAP" as const,
  currency: "INR",
  basePaise: "19900",
  chargesPaise: "4000",
  prePromotionSubtotalPaise: "23900",
  promotionDiscountPaise: "0",
  taxablePaise: "23900",
  taxPaise: "0",
  grandTotalPaise: "23900",
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
  charges: [{ chargeCode: "delivery", name: "Delivery", amountPaise: "4000" }],
  promotionEffects: [],
  taxComponents: [],
  serviceabilityEvaluatedAt: null,
  manualCouponCode: null,
};

const readyCheckout = {
  id: "chk-1",
  customerAuthUserId: "user-1",
  brandId: "brand-1",
  cartId: "cart-1",
  sourceCartRevision: "2",
  revision: "3",
  status: "READY_FOR_PAYMENT",
  expiresAt: "2026-08-13T01:00:00.000Z",
  fulfilmentMode: "DELIVERY",
  fulfilmentTiming: "ASAP",
  pickupOutletId: null,
  activeSnapshotId: "snap-old",
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
  destination: snapshot.destination,
  activeSnapshot: snapshot,
};

async function reachReview(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  getActiveCheckout.mockResolvedValue({
    ok: true,
    data: { checkout: readyCheckout },
  });
  getActiveCart.mockResolvedValue({ ok: true, data: { cart } });
  render(<CheckoutClient catalog={catalog} />);
  await waitFor(() => expect(screen.getByTestId("payment-back-to-review")).toBeInTheDocument());
  await user.click(screen.getByTestId("payment-back-to-review"));
  await waitFor(() => expect(screen.getByTestId("checkout-review")).toBeInTheDocument());
  expect(screen.getByTestId("continue-to-payment")).not.toBeDisabled();
}

describe("IMP-036J #384A CheckoutClient coupon mutation + rebase failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    listOwnAddresses.mockResolvedValue({ ok: true, data: { addresses: [] } });
    listCheckoutScheduledWindows.mockResolvedValue({
      ok: true,
      data: {
        availability: "NO_TIMES",
        message: "No scheduled times",
        timeZone: "Asia/Kolkata",
        todayLocalDate: "2026-09-25",
        tomorrowLocalDate: "2026-09-26",
        cancellationCutoffMinutes: null,
        windows: [],
      },
    });
    setCheckoutFulfilment.mockResolvedValue({
      ok: true,
      data: { checkout: { ...readyCheckout, revision: "4" } },
    });
    setCheckoutDestination.mockResolvedValue({
      ok: true,
      data: { checkout: { ...readyCheckout, revision: "5" } },
    });
    setCheckoutFulfilmentTiming.mockResolvedValue({
      ok: true,
      data: { checkout: { ...readyCheckout, revision: "6" } },
    });
  });

  it("keeps committed cart intent, disables payment, and shows RETRY on incomplete rebase", async () => {
    const user = userEvent.setup();
    await reachReview(user);

    applyCartCoupon.mockResolvedValue({
      ok: true,
      data: {
        cart: { ...cart, revision: "3", manualCouponCode: "TEST123" },
      },
    });
    startCheckout.mockResolvedValue({
      ok: false,
      code: "CHECKOUT_PROMOTION_INDETERMINATE",
      status: 503,
    });

    await user.type(screen.getByTestId("coupon-input"), "TEST123");
    await user.click(screen.getByTestId("coupon-apply"));

    await waitFor(() => {
      expect(applyCartCoupon).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByTestId("coupon-result")).toHaveTextContent(IMP036J_COPY.RETRY);
    });
    expect(screen.getByTestId("coupon-retry")).toBeInTheDocument();
    expect(screen.getByTestId("coupon-input")).toHaveValue("TEST123");
    expect(screen.getByTestId("continue-to-payment")).toBeDisabled();
    expect(screen.queryByText(IMP036J_COPY.APPLIED_COUPON)).not.toBeInTheDocument();
    expect(screen.queryByTestId("price-summary-total")).not.toBeInTheDocument();
  });

  it("maps definitive ineligible rebase failure without RETRY or speculative APPLIED", async () => {
    const user = userEvent.setup();
    await reachReview(user);

    applyCartCoupon.mockResolvedValue({
      ok: true,
      data: {
        cart: { ...cart, revision: "3", manualCouponCode: "TEST123" },
      },
    });
    startCheckout.mockResolvedValue({
      ok: true,
      data: {
        checkout: {
          ...readyCheckout,
          id: "chk-2",
          revision: "1",
          status: "DRAFT",
          activeSnapshot: null,
          activeSnapshotId: null,
        },
      },
    });
    evaluateCheckout.mockResolvedValue({
      ok: false,
      code: "CHECKOUT_COUPON_INELIGIBLE",
      status: 422,
    });

    await user.type(screen.getByTestId("coupon-input"), "TEST123");
    await user.click(screen.getByTestId("coupon-apply"));

    await waitFor(() => {
      expect(screen.getByTestId("coupon-result")).toHaveTextContent(
        IMP036J_COPY.INAPPLICABLE,
      );
    });
    expect(screen.queryByTestId("coupon-retry")).not.toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.RETRY)).not.toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.APPLIED_COUPON)).not.toBeInTheDocument();
    expect(screen.getByTestId("coupon-input")).toHaveValue("TEST123");
    expect(screen.getByTestId("continue-to-payment")).toBeDisabled();
  });
});
