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
    listCheckoutScheduledWindows: (...args: unknown[]) => listCheckoutScheduledWindows(...args),
    evaluateCheckout: (...args: unknown[]) => evaluateCheckout(...args),
    setCheckoutFulfilment: (...args: unknown[]) => setCheckoutFulfilment(...args),
    setCheckoutDestination: (...args: unknown[]) => setCheckoutDestination(...args),
    setCheckoutFulfilmentTiming: (...args: unknown[]) => setCheckoutFulfilmentTiming(...args),
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
  manualCouponCode: null,
  expiresAt: null,
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
  lines: [{ id: "line-1", variantId: "var-1", quantity: 1, modifiers: [], bundleSelections: [] }],
};

const checkout = {
  id: "chk-1",
  customerAuthUserId: "user-1",
  brandId: "brand-1",
  cartId: "cart-1",
  sourceCartRevision: "2",
  revision: "3",
  status: "DRAFT",
  expiresAt: "2026-08-13T01:00:00.000Z",
  fulfilmentMode: "DELIVERY",
  fulfilmentTiming: "ASAP",
  pickupOutletId: null,
  activeSnapshotId: null,
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
  destination: null,
  activeSnapshot: null,
};

describe("IMP-036J T5 CheckoutClient activation remediation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    getActiveCart.mockResolvedValue({ ok: true, data: { cart } });
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
  });

  it("associates cart activation when an active checkout is reused", async () => {
    window.sessionStorage.setItem("boba.cartActivationId", "11111111-1111-4111-8111-111111111111");
    getActiveCheckout.mockResolvedValue({ ok: true, data: { checkout } });
    startCheckout.mockResolvedValue({ ok: true, data: { checkout } });

    render(<CheckoutClient catalog={catalog} />);

    await waitFor(() => expect(startCheckout).toHaveBeenCalled());
    expect(startCheckout).toHaveBeenCalledWith({
      cartId: "cart-1",
      cartActivationId: "11111111-1111-4111-8111-111111111111",
    });
    expect(window.sessionStorage.getItem("boba.cartActivationId")).toBeNull();
  });

  it("does not call startCheckout on direct entry when active checkout exists without activation", async () => {
    getActiveCheckout.mockResolvedValue({ ok: true, data: { checkout } });

    render(<CheckoutClient catalog={catalog} />);

    await waitFor(() => expect(getActiveCheckout).toHaveBeenCalled());
    expect(startCheckout).not.toHaveBeenCalled();
  });

  it("AR-036J-T5-14 rebases stale Review after external Cart change", async () => {
    const snapshot = {
      id: "snap-old",
      checkoutId: "chk-1",
      checkoutRevision: "3",
      sourceCartRevision: "2",
      selectedOutletId: "outlet-1",
      evaluatedAt: "2026-08-13T00:00:00.000Z",
      fulfilmentMode: "DELIVERY",
      fulfilmentTiming: "ASAP",
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
    };
    const readyCheckout = {
      ...checkout,
      status: "READY_FOR_PAYMENT",
      activeSnapshotId: "snap-old",
      activeSnapshot: snapshot,
    };
    const mutatedCart = { ...cart, revision: "5" };
    const successor = {
      ...checkout,
      id: "chk-2",
      sourceCartRevision: "5",
      revision: "1",
      status: "DRAFT",
      activeSnapshot: null,
    };
    const freshSnapshot = {
      ...snapshot,
      id: "snap-new",
      checkoutId: "chk-2",
      checkoutRevision: "2",
      sourceCartRevision: "5",
      grandTotalPaise: "29900",
      prePromotionSubtotalPaise: "29900",
      taxablePaise: "29900",
    };
    getActiveCheckout.mockResolvedValue({ ok: true, data: { checkout: readyCheckout } });
    getActiveCart
      .mockResolvedValueOnce({ ok: true, data: { cart } })
      .mockResolvedValue({ ok: true, data: { cart: mutatedCart } });
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_CART_CHANGED", status: 409 });
    startCheckout.mockResolvedValue({ ok: true, data: { checkout: successor } });
    setCheckoutFulfilment.mockResolvedValue({
      ok: true,
      data: { checkout: { ...successor, fulfilmentMode: "DELIVERY", revision: "2" } },
    });
    setCheckoutDestination.mockResolvedValue({
      ok: true,
      data: { checkout: { ...successor, fulfilmentMode: "DELIVERY", revision: "3" } },
    });
    setCheckoutFulfilmentTiming.mockResolvedValue({
      ok: true,
      data: { checkout: { ...successor, fulfilmentMode: "DELIVERY", revision: "4" } },
    });
    evaluateCheckout.mockResolvedValue({
      ok: true,
      data: {
        checkout: { ...successor, revision: "5", status: "READY_FOR_PAYMENT", activeSnapshot: freshSnapshot },
        snapshot: freshSnapshot,
        evaluationId: "eval-2",
        reviewSurfaceToken: "token-2",
        quote: {
          commercialExplanation: {
            couponPresentationClass: null,
            merchandiseOrOrderSavingPaise: "0",
            deliverySavingPaise: "0",
            totalSavedPaise: "0",
            grandTotalPaise: "29900",
            thresholdProgress: null,
            complimentary: null,
            submittedCouponResult: null,
          },
        },
      },
    });

    render(<CheckoutClient catalog={catalog} />);
    await waitFor(() => expect(screen.getByTestId("payment-start")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(startCheckout).toHaveBeenCalledWith({ cartId: "cart-1" }));
    expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByTestId("copy-stale")));
    expect(screen.getByTestId("price-summary-total")).toHaveTextContent("₹299.00");
    await userEvent.click(screen.getByTestId("continue-to-payment"));
    await waitFor(() => expect(screen.getByTestId("checkout-payment")).toBeInTheDocument());
    expect(screen.getByTestId("checkout-fee-breakdown")).toHaveTextContent("₹299.00");
    expect(startPayment).toHaveBeenCalledTimes(1);
  });
});
