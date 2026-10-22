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
const removeCartCoupon = vi.fn();

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
    removeCartCoupon: (...args: unknown[]) => removeCartCoupon(...args),
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
  manualCouponCode: "SAVE10",
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

function buildSnapshot(grandTotalPaise: string, id = "snap-old") {
  return {
    id,
    checkoutId: "chk-1",
    checkoutRevision: "3",
    sourceCartRevision: "2",
    selectedOutletId: "outlet-1",
    evaluatedAt: "2026-08-13T00:00:00.000Z",
    fulfilmentMode: "DELIVERY" as const,
    fulfilmentTiming: "ASAP" as const,
    currency: "INR",
    basePaise: grandTotalPaise,
    chargesPaise: "0",
    prePromotionSubtotalPaise: grandTotalPaise,
    promotionDiscountPaise: "0",
    taxablePaise: grandTotalPaise,
    taxPaise: "0",
    grandTotalPaise,
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
    charges: [],
    promotionEffects: [],
    taxComponents: [],
    serviceabilityEvaluatedAt: null,
  };
}

function mockSuccessfulRebase(freshSnapshot: ReturnType<typeof buildSnapshot>) {
  const successor = {
    ...checkout,
    id: "chk-2",
    sourceCartRevision: cart.revision,
    revision: "1",
    status: "DRAFT",
    activeSnapshot: null,
  };
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
      checkout: {
        ...successor,
        revision: "5",
        status: "READY_FOR_PAYMENT",
        sourceCartRevision: cart.revision,
        activeSnapshot: freshSnapshot,
      },
      snapshot: freshSnapshot,
      evaluationId: "eval-2",
      reviewSurfaceToken: "token-2",
      quote: {
        commercialExplanation: {
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "0",
          totalSavedPaise: "0",
          grandTotalPaise: freshSnapshot.grandTotalPaise,
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: null,
        },
      },
    },
  });
}

describe("IMP-036J #391A truthful checkout recovery UX", () => {
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

  async function renderReadyForPayment(priorTotal = "95240") {
    const snapshot = buildSnapshot(priorTotal);
    const readyCheckout = {
      ...checkout,
      status: "READY_FOR_PAYMENT",
      activeSnapshotId: snapshot.id,
      activeSnapshot: snapshot,
      sourceCartRevision: cart.revision,
    };
    getActiveCheckout.mockResolvedValue({ ok: true, data: { checkout: readyCheckout } });
    getActiveCart.mockResolvedValue({ ok: true, data: { cart } });
    render(<CheckoutClient catalog={catalog} />);
    await waitFor(() => expect(screen.getByTestId("payment-start")).toBeInTheDocument());
    return snapshot;
  }

  it("CASE A — equal payable after CHECKOUT_REPRICED shows neutral copy, not money-changed", async () => {
    const prior = await renderReadyForPayment("95240");
    const fresh = buildSnapshot("95240", "snap-new");
    mockSuccessfulRebase(fresh);
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("copy-stale")).toBeInTheDocument());
    expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE_UNCONFIRMED);
    expect(screen.getByTestId("copy-stale")).not.toHaveTextContent(IMP036J_COPY.STALE);
    expect(screen.getByTestId("price-summary-total")).toHaveTextContent("₹952.40");
    expect(screen.getByTestId("continue-to-payment")).not.toBeDisabled();
    expect(screen.getByDisplayValue("SAVE10")).toBeInTheDocument();
    expect(startPayment).toHaveBeenCalledTimes(1);
    expect(prior.grandTotalPaise).toBe(fresh.grandTotalPaise);
  });

  it("CASE B — changed payable after CHECKOUT_REPRICED shows COPY-STALE and current total", async () => {
    await renderReadyForPayment("95240");
    const fresh = buildSnapshot("99900", "snap-new");
    mockSuccessfulRebase(fresh);
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("copy-stale")).toBeInTheDocument());
    expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE);
    expect(screen.getByTestId("price-summary-total")).toHaveTextContent("₹999.00");
    expect(screen.getByTestId("continue-to-payment")).not.toBeDisabled();
  });

  it("CASE C — refresh failure keeps neutral copy and disables payment continue", async () => {
    await renderReadyForPayment("95240");
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });
    getActiveCart.mockResolvedValue({ ok: false, code: "NETWORK_ERROR" });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("copy-stale")).toBeInTheDocument());
    expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE_UNCONFIRMED);
    expect(screen.getByTestId("copy-stale")).not.toHaveTextContent(IMP036J_COPY.STALE);
    expect(screen.queryByTestId("price-summary-total")).not.toBeInTheDocument();
    expect(screen.getByTestId("continue-to-payment")).toBeDisabled();
    expect(startPayment).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("Network problem. Check your connection and try again."),
    ).toBeInTheDocument();
  });

  it("CASE C escape — successful coupon mutation after failed recovery restores Continue", async () => {
    await renderReadyForPayment("95240");
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });
    getActiveCart.mockResolvedValue({ ok: false, code: "NETWORK_ERROR" });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("continue-to-payment")).toBeDisabled());

    const recoveredCart = { ...cart, revision: "3", manualCouponCode: null };
    const fresh = buildSnapshot("95240", "snap-recovered");
    fresh.sourceCartRevision = "3";
    getActiveCart.mockResolvedValue({ ok: true, data: { cart: recoveredCart } });
    removeCartCoupon.mockResolvedValue({ ok: true, data: { cart: recoveredCart } });
    mockSuccessfulRebase(fresh);
    // mockSuccessfulRebase stamps successor sourceCartRevision from cart.revision ("2");
    // align evaluate result to the recovered cart revision for reviewMoneyConfirmed.
    evaluateCheckout.mockResolvedValue({
      ok: true,
      data: {
        checkout: {
          ...checkout,
          id: "chk-2",
          revision: "5",
          status: "READY_FOR_PAYMENT",
          sourceCartRevision: "3",
          activeSnapshot: fresh,
        },
        snapshot: fresh,
        evaluationId: "eval-escape",
        reviewSurfaceToken: "token-escape",
        quote: {
          commercialExplanation: {
            couponPresentationClass: null,
            merchandiseOrOrderSavingPaise: "0",
            deliverySavingPaise: "0",
            totalSavedPaise: "0",
            grandTotalPaise: fresh.grandTotalPaise,
            thresholdProgress: null,
            complimentary: null,
            submittedCouponResult: null,
          },
        },
      },
    });

    await userEvent.click(screen.getByRole("button", { name: IMP036J_COPY.REMOVE }));
    await waitFor(() => expect(removeCartCoupon).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("continue-to-payment")).not.toBeDisabled());
    expect(screen.queryByTestId("copy-stale")).not.toBeInTheDocument();
    expect(screen.getByTestId("price-summary-total")).toHaveTextContent("₹952.40");
  });

  it("CASE D — CHECKOUT_CART_CHANGED uses cart recovery copy without monetary claim", async () => {
    await renderReadyForPayment("23900");
    const fresh = buildSnapshot("29900", "snap-new");
    mockSuccessfulRebase(fresh);
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_CART_CHANGED", status: 409 });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("copy-stale")).toBeInTheDocument());
    expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE_CART_CHANGED);
    expect(screen.getByTestId("copy-stale")).not.toHaveTextContent(IMP036J_COPY.STALE);
    expect(screen.getByTestId("price-summary-total")).toHaveTextContent("₹299.00");
  });

  it("CASE E — stale banner clears after continue on a confirmed fresh Review", async () => {
    await renderReadyForPayment("95240");
    const fresh = buildSnapshot("95240", "snap-new");
    mockSuccessfulRebase(fresh);
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("copy-stale")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("continue-to-payment"));
    await waitFor(() => expect(screen.getByTestId("checkout-payment")).toBeInTheDocument());
    expect(screen.queryByTestId("copy-stale")).not.toBeInTheDocument();
    expect(startPayment).toHaveBeenCalledTimes(1);
  });

  it("does not show a stale banner on normal Review when no recovery event occurred", async () => {
    await renderReadyForPayment("95240");
    expect(screen.queryByTestId("copy-stale")).not.toBeInTheDocument();
    expect(screen.getByTestId("payment-start")).toBeInTheDocument();
  });

  it("later recovery with a changed payable replaces a prior equal-payable message", async () => {
    await renderReadyForPayment("95240");
    const equalFresh = buildSnapshot("95240", "snap-equal");
    const changedFresh = buildSnapshot("99900", "snap-changed");
    mockSuccessfulRebase(equalFresh);
    startPayment
      .mockResolvedValueOnce({ ok: false, code: "CHECKOUT_REPRICED", status: 409 })
      .mockResolvedValueOnce({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() =>
      expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE_UNCONFIRMED),
    );

    mockSuccessfulRebase(changedFresh);
    await userEvent.click(screen.getByTestId("continue-to-payment"));
    await waitFor(() => expect(screen.getByTestId("payment-start")).toBeInTheDocument());
    expect(screen.queryByTestId("copy-stale")).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() =>
      expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE),
    );
    expect(screen.getByTestId("price-summary-total")).toHaveTextContent("₹999.00");
    expect(startPayment).toHaveBeenCalledTimes(2);
  });
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("IMP-036J #391A async recovery race ownership", () => {
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

  async function renderReadyForPayment(priorTotal = "95240") {
    const snapshot = buildSnapshot(priorTotal);
    const readyCheckout = {
      ...checkout,
      status: "READY_FOR_PAYMENT",
      activeSnapshotId: snapshot.id,
      activeSnapshot: snapshot,
      sourceCartRevision: cart.revision,
    };
    getActiveCheckout.mockResolvedValue({ ok: true, data: { checkout: readyCheckout } });
    getActiveCart.mockResolvedValue({ ok: true, data: { cart } });
    render(<CheckoutClient catalog={catalog} />);
    await waitFor(() => expect(screen.getByTestId("payment-start")).toBeInTheDocument());
    return snapshot;
  }

  it("delayed automatic recovery cannot overwrite a newer coupon-driven Review", async () => {
    await renderReadyForPayment("95240");
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });

    const recoveryStartHold =
      deferred<{ ok: true; data: { checkout: typeof checkout } }>();
    let startCheckoutCalls = 0;
    startCheckout.mockImplementation(() => {
      startCheckoutCalls += 1;
      if (startCheckoutCalls === 1) {
        return recoveryStartHold.promise;
      }
      const successor = {
        ...checkout,
        id: "chk-coupon",
        sourceCartRevision: "3",
        revision: "1",
        status: "DRAFT" as const,
        activeSnapshot: null,
      };
      return Promise.resolve({ ok: true as const, data: { checkout: successor } });
    });

    // Recovery path after held startCheckout — must not win if coupon finished first.
    const lateRecoveryFresh = buildSnapshot("99900", "snap-late-recovery");
    setCheckoutFulfilment.mockResolvedValue({
      ok: true,
      data: {
        checkout: {
          ...checkout,
          id: "chk-late",
          fulfilmentMode: "DELIVERY",
          revision: "2",
        },
      },
    });
    setCheckoutDestination.mockResolvedValue({
      ok: true,
      data: {
        checkout: {
          ...checkout,
          id: "chk-late",
          fulfilmentMode: "DELIVERY",
          revision: "3",
        },
      },
    });
    setCheckoutFulfilmentTiming.mockResolvedValue({
      ok: true,
      data: {
        checkout: {
          ...checkout,
          id: "chk-late",
          fulfilmentMode: "DELIVERY",
          revision: "4",
        },
      },
    });
    evaluateCheckout.mockImplementation(async ({ checkoutId }: { checkoutId: string }) => {
      if (checkoutId === "chk-late") {
        return {
          ok: true as const,
          data: {
            checkout: {
              ...checkout,
              id: "chk-late",
              revision: "5",
              status: "READY_FOR_PAYMENT",
              sourceCartRevision: cart.revision,
              activeSnapshot: lateRecoveryFresh,
            },
            snapshot: lateRecoveryFresh,
            evaluationId: "eval-late",
            reviewSurfaceToken: "token-late",
            quote: {
              commercialExplanation: {
                couponPresentationClass: null,
                merchandiseOrOrderSavingPaise: "0",
                deliverySavingPaise: "0",
                totalSavedPaise: "0",
                grandTotalPaise: lateRecoveryFresh.grandTotalPaise,
                thresholdProgress: null,
                complimentary: null,
                submittedCouponResult: null,
              },
            },
          },
        };
      }
      const couponFresh = buildSnapshot("88800", "snap-coupon");
      couponFresh.sourceCartRevision = "3";
      return {
        ok: true as const,
        data: {
          checkout: {
            ...checkout,
            id: "chk-coupon",
            revision: "5",
            status: "READY_FOR_PAYMENT",
            sourceCartRevision: "3",
            activeSnapshot: couponFresh,
          },
          snapshot: couponFresh,
          evaluationId: "eval-coupon",
          reviewSurfaceToken: "token-coupon",
          quote: {
            commercialExplanation: {
              couponPresentationClass: null,
              merchandiseOrOrderSavingPaise: "0",
              deliverySavingPaise: "0",
              totalSavedPaise: "0",
              grandTotalPaise: couponFresh.grandTotalPaise,
              thresholdProgress: null,
              complimentary: null,
              submittedCouponResult: null,
            },
          },
        },
      };
    });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("copy-stale")).toBeInTheDocument());
    await waitFor(() => expect(startCheckoutCalls).toBe(1));

    const couponCart = { ...cart, revision: "3", manualCouponCode: null };
    removeCartCoupon.mockResolvedValue({ ok: true, data: { cart: couponCart } });
    setCheckoutFulfilment.mockResolvedValue({
      ok: true,
      data: {
        checkout: {
          ...checkout,
          id: "chk-coupon",
          fulfilmentMode: "DELIVERY",
          revision: "2",
          sourceCartRevision: "3",
        },
      },
    });
    setCheckoutDestination.mockResolvedValue({
      ok: true,
      data: {
        checkout: {
          ...checkout,
          id: "chk-coupon",
          fulfilmentMode: "DELIVERY",
          revision: "3",
          sourceCartRevision: "3",
        },
      },
    });
    setCheckoutFulfilmentTiming.mockResolvedValue({
      ok: true,
      data: {
        checkout: {
          ...checkout,
          id: "chk-coupon",
          fulfilmentMode: "DELIVERY",
          revision: "4",
          sourceCartRevision: "3",
        },
      },
    });

    await userEvent.click(screen.getByRole("button", { name: IMP036J_COPY.REMOVE }));
    await waitFor(() => expect(removeCartCoupon).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByTestId("price-summary-total")).toHaveTextContent("₹888.00"),
    );
    expect(screen.queryByTestId("copy-stale")).not.toBeInTheDocument();
    expect(screen.getByTestId("continue-to-payment")).not.toBeDisabled();

    // Resolve the older recovery startCheckout after the coupon Review won.
    recoveryStartHold.resolve({
      ok: true,
      data: {
        checkout: {
          ...checkout,
          id: "chk-late",
          sourceCartRevision: cart.revision,
          revision: "1",
          status: "DRAFT",
          activeSnapshot: null,
        },
      },
    });

    await waitFor(() => expect(startCheckoutCalls).toBeGreaterThanOrEqual(2));
    // Flush any superseded recovery continuations.
    await waitFor(() =>
      expect(screen.getByTestId("price-summary-total")).toHaveTextContent("₹888.00"),
    );
    expect(screen.queryByTestId("copy-stale")).not.toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.STALE)).not.toBeInTheDocument();
    expect(screen.getByTestId("continue-to-payment")).not.toBeDisabled();
    expect(startPayment).toHaveBeenCalledTimes(1);
  });

  it("failed automatic recovery still allows fulfilment escape without stale overwrite", async () => {
    await renderReadyForPayment("95240");
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });
    getActiveCart.mockResolvedValue({ ok: false, code: "NETWORK_ERROR" });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("continue-to-payment")).toBeDisabled());
    expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE_UNCONFIRMED);

    getActiveCheckout.mockResolvedValue({
      ok: true,
      data: {
        checkout: {
          ...checkout,
          status: "READY_FOR_PAYMENT",
          activeSnapshotId: "snap-old",
          activeSnapshot: buildSnapshot("95240"),
          sourceCartRevision: cart.revision,
        },
      },
    });

    await userEvent.click(screen.getByTestId("checkout-back-to-delivery"));
    await waitFor(() =>
      expect(screen.getByTestId("checkout-fulfilment-choice")).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("copy-stale")).not.toBeInTheDocument();
    expect(startPayment).toHaveBeenCalledTimes(1);
  });

  it("failed fulfilment escape keeps unconfirmed recovery and Continue disabled", async () => {
    await renderReadyForPayment("95240");
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });
    getActiveCart.mockResolvedValue({ ok: false, code: "NETWORK_ERROR" });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("continue-to-payment")).toBeDisabled());
    expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE_UNCONFIRMED);

    getActiveCheckout.mockResolvedValue({ ok: false, code: "NETWORK_ERROR" });
    await userEvent.click(screen.getByTestId("checkout-back-to-delivery"));
    await waitFor(() =>
      expect(
        screen.getByText("Network problem. Check your connection and try again."),
      ).toBeInTheDocument(),
    );
    expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE_UNCONFIRMED);
    expect(screen.getByTestId("continue-to-payment")).toBeDisabled();
    expect(screen.queryByTestId("price-summary-total")).not.toBeInTheDocument();
    expect(startPayment).toHaveBeenCalledTimes(1);
  });

  it("does not call startPayment again when continuing after confirmed recovery", async () => {
    await renderReadyForPayment("95240");
    const fresh = buildSnapshot("95240", "snap-new");
    mockSuccessfulRebase(fresh);
    startPayment.mockResolvedValue({ ok: false, code: "CHECKOUT_REPRICED", status: 409 });

    await userEvent.click(screen.getByTestId("payment-start"));
    await waitFor(() => expect(screen.getByTestId("copy-stale")).toBeInTheDocument());
    await userEvent.click(screen.getByTestId("continue-to-payment"));
    await waitFor(() => expect(screen.getByTestId("checkout-payment")).toBeInTheDocument());
    expect(startPayment).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("copy-stale")).not.toBeInTheDocument();
  });
});
