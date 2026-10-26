/**
 * Item-specific checkout attention when the server already identifies the merchandise line.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutClient } from "@/components/ordering/CheckoutClient";
import { CheckoutPickupOutletStep } from "@/components/ordering/CheckoutPickupOutletStep";
import { PaymentPanel } from "@/components/ordering/PaymentPanel";
import {
  namedCartLinesForCheckout,
  presentCheckoutFailureCopy,
  presentCheckoutItemAttention,
} from "@/components/ordering/checkout-unavailable-item-presentation";
import { parseCommerceErrorBody } from "@/lib/customer-commerce";
import type { CommerceCheckout, CommerceCheckoutSnapshot } from "@/lib/customer-commerce";
import type { OrderingCatalog } from "@/shared/ordering-catalog";

const UNAVAILABLE = "That item is temporarily unavailable.";

describe("presentCheckoutItemAttention", () => {
  const lines = namedCartLinesForCheckout({
    cart: {
      lines: [
        { id: "line-gangnam", variantId: "var-gangnam" },
        { id: "line-taro", variantId: "var-taro" },
      ],
    },
    catalog: {
      items: [
        { variantId: "var-gangnam", name: "Gangnam Style Iced Coffee Boba" },
        { variantId: "var-taro", name: "Purple Rain Taro Boba" },
      ],
    },
  });

  it("names only the merchandise line the server identified", () => {
    const attention = presentCheckoutItemAttention(
      [{ cartLineId: "line-gangnam", code: "CHECKOUT_TEMPORARILY_UNAVAILABLE" }],
      lines,
    );
    expect(attention).toEqual([
      {
        key: "line-gangnam:CHECKOUT_TEMPORARILY_UNAVAILABLE",
        cartLineId: "line-gangnam",
        itemName: "Gangnam Style Iced Coffee Boba",
        message: `Gangnam Style Iced Coffee Boba: ${UNAVAILABLE}`,
      },
    ]);
    expect(attention.map((entry) => entry.itemName)).not.toContain("Purple Rain Taro Boba");
  });

  it("keeps the generic sentence when the server did not identify a line", () => {
    expect(
      presentCheckoutFailureCopy({ code: "CHECKOUT_TEMPORARILY_UNAVAILABLE" }, lines),
    ).toBe(UNAVAILABLE);
  });

  it("still names a sealed line when the catalog fixture has no item list", () => {
    const named = namedCartLinesForCheckout({
      cart: { lines: [{ id: "line-gangnam", variantId: "var-gangnam" }] },
      catalog: {} as { items: readonly { variantId: string; name: string }[] },
      snapshotLines: [{ sourceCartLineId: "line-gangnam", productName: "Sealed Gangnam" }],
    });
    expect(named).toEqual([{ cartLineId: "line-gangnam", itemName: "Sealed Gangnam" }]);
    expect(
      presentCheckoutFailureCopy(
        {
          code: "NETWORK_ERROR",
        },
        named,
      ),
    ).toBe("Network problem. Check your connection and try again.");
  });

  it("prefers the sealed snapshot name for the same cart line", () => {
    const named = namedCartLinesForCheckout({
      cart: { lines: [{ id: "line-gangnam", variantId: "var-gangnam" }] },
      catalog: { items: [{ variantId: "var-gangnam", name: "Catalog name" }] },
      snapshotLines: [{ sourceCartLineId: "line-gangnam", productName: "Sealed Gangnam" }],
    });
    expect(named).toEqual([{ cartLineId: "line-gangnam", itemName: "Sealed Gangnam" }]);
  });
});

describe("commerce error problems", () => {
  it("keeps merchandise problem identity and drops the internal message", () => {
    const parsed = parseCommerceErrorBody({
      ok: false,
      code: "CHECKOUT_TEMPORARILY_UNAVAILABLE",
      requestId: "req-1",
      message: "Checkout merchandise validation failed.",
      problems: [
        {
          cartLineId: "line-gangnam",
          code: "CHECKOUT_TEMPORARILY_UNAVAILABLE",
          secret: "do-not-keep",
        },
      ],
    });
    expect(parsed).toEqual({
      ok: false,
      code: "CHECKOUT_TEMPORARILY_UNAVAILABLE",
      requestId: "req-1",
      problems: [{ cartLineId: "line-gangnam", code: "CHECKOUT_TEMPORARILY_UNAVAILABLE" }],
    });
  });

  it("ignores a malformed problem list without dropping the error code", () => {
    expect(
      parseCommerceErrorBody({
        ok: false,
        code: "CHECKOUT_SOLD_OUT",
        problems: [{ cartLineId: 12, code: "CHECKOUT_SOLD_OUT" }],
      }),
    ).toEqual({ ok: false, code: "CHECKOUT_SOLD_OUT" });
  });
});

describe("pickup merchandise attention", () => {
  it("names the item, keeps delivery and cart recovery, and does not claim pickup failed everywhere", async () => {
    const user = userEvent.setup();
    const onChooseDelivery = vi.fn();
    render(
      <CheckoutPickupOutletStep
        pending={false}
        loading={false}
        selectionPolicy="UNAVAILABLE"
        outlets={[]}
        selectedOutletId={null}
        onSelectOutlet={vi.fn()}
        onContinue={vi.fn()}
        onChooseDelivery={onChooseDelivery}
        onBackToMode={vi.fn()}
        itemAttention={[
          {
            key: "line-gangnam:CHECKOUT_TEMPORARILY_UNAVAILABLE",
            cartLineId: "line-gangnam",
            itemName: "Gangnam Style Iced Coffee Boba",
            message: `Gangnam Style Iced Coffee Boba: ${UNAVAILABLE}`,
          },
        ]}
      />,
    );

    const attention = screen.getByTestId("checkout-item-attention");
    expect(attention).toHaveTextContent("Gangnam Style Iced Coffee Boba");
    expect(attention).toHaveTextContent(UNAVAILABLE);
    expect(attention).toHaveTextContent("Other items in your cart are unchanged.");
    expect(attention).not.toHaveTextContent("Purple Rain Taro Boba");
    expect(attention).not.toHaveTextContent(/no boba bear location/i);
    expect(screen.getByRole("link", { name: "Return to cart" })).toHaveAttribute(
      "href",
      "/order/cart/",
    );
    await user.click(screen.getByRole("button", { name: "Choose Delivery" }));
    expect(onChooseDelivery).toHaveBeenCalledTimes(1);
  });
});

const startPayment = vi.fn<(...args: unknown[]) => unknown>();
const clearCart = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("@/components/ordering/browser-navigate", () => ({
  browserNavigate: vi.fn(),
}));

vi.mock("@/lib/customer-commerce", async () => {
  const actual = await vi.importActual<typeof import("@/lib/customer-commerce")>(
    "@/lib/customer-commerce",
  );
  return {
    ...actual,
    startPayment: (...args: unknown[]) => startPayment(...args),
    retryPayment: vi.fn(),
    getPaymentState: vi.fn(),
    submitPaymentClientEvidence: vi.fn(),
    completeZeroPayableCheckout: vi.fn(),
    listCustomerOrders: vi.fn(),
    rememberPaymentRecovery: vi.fn(),
    clearPaymentRecovery: vi.fn(),
    clearCart: (...args: unknown[]) => clearCart(...args),
    readOrCreateStartIdempotencyKey: () => "idem-start",
    readOrCreateRetryIdempotencyKey: () => "idem-retry",
    readOrCreateZeroPayableIdempotencyKey: () => "idem-zero",
    getActiveCart: (...args: unknown[]) => getActiveCart(...args),
    getActiveCheckout: (...args: unknown[]) => getActiveCheckout(...args),
    startCheckout: (...args: unknown[]) => startCheckout(...args),
    listOwnAddresses: (...args: unknown[]) => listOwnAddresses(...args),
    setCheckoutDestination: (...args: unknown[]) => setCheckoutDestination(...args),
    setCheckoutFulfilment: (...args: unknown[]) => setCheckoutFulfilment(...args),
    listCheckoutPickupOptions: (...args: unknown[]) => listCheckoutPickupOptions(...args),
    listCheckoutScheduledWindows: (...args: unknown[]) => listCheckoutScheduledWindows(...args),
    setCheckoutFulfilmentTiming: (...args: unknown[]) => setCheckoutFulfilmentTiming(...args),
    evaluateCheckout: (...args: unknown[]) => evaluateCheckout(...args),
    readGuestCartCredential: () => null,
    readPaymentRecovery: () => null,
    claimGuestCart: vi.fn(),
    reconcileGuestCart: vi.fn(),
    clearGuestCartCredential: vi.fn(),
    createOwnAddress: vi.fn(),
    updateOwnAddress: vi.fn(),
  };
});

vi.mock("@/lib/customer-auth/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/customer-auth/client")>(
    "@/lib/customer-auth/client",
  );
  return {
    ...actual,
    fetchCustomerSession: (...args: unknown[]) => fetchCustomerSession(...args),
  };
});

vi.mock("@/lib/razorpay", () => ({
  loadRazorpayCheckoutScript: vi.fn(),
  openRazorpayStandardCheckout: vi.fn(),
  parseRazorpayStandardCheckoutAction: vi.fn(),
  RAZORPAY_STANDARD_CHECKOUT_KIND: "razorpay_standard_checkout",
}));

vi.mock("@/components/ordering/CheckoutDestinationFlow", () => ({
  CheckoutDestinationFlow: (props: {
    onComplete: (draft: { kind: "SAVED_ADDRESS"; savedAddressId: string }) => void;
  }) => (
    <button type="button" data-testid="pick-address-a" onClick={() => props.onComplete({ kind: "SAVED_ADDRESS", savedAddressId: "addr-a" })}>
      Address A
    </button>
  ),
}));

const fetchCustomerSession = vi.fn<(...args: unknown[]) => unknown>();
const getActiveCart = vi.fn<(...args: unknown[]) => unknown>();
const getActiveCheckout = vi.fn<(...args: unknown[]) => unknown>();
const startCheckout = vi.fn<(...args: unknown[]) => unknown>();
const listOwnAddresses = vi.fn<(...args: unknown[]) => unknown>();
const setCheckoutDestination = vi.fn<(...args: unknown[]) => unknown>();
const setCheckoutFulfilment = vi.fn<(...args: unknown[]) => unknown>();
const listCheckoutPickupOptions = vi.fn<(...args: unknown[]) => unknown>();
const listCheckoutScheduledWindows = vi.fn<(...args: unknown[]) => unknown>();
const setCheckoutFulfilmentTiming = vi.fn<(...args: unknown[]) => unknown>();
const evaluateCheckout = vi.fn<(...args: unknown[]) => unknown>();

const catalog = {
  brandId: "56ff7724-d511-5ef4-b5d5-d629cbfb2388",
  items: [
    {
      sourceKey: "gangnam",
      productId: "p-gangnam",
      variantId: "var-gangnam",
      sectionId: "s-1",
      name: "Gangnam Style Iced Coffee Boba",
      description: "",
      imagePath: "",
      presentationPriceRupees: 199,
      tags: [],
      categorySlug: "drinks",
      subcategoryName: "Coffee",
      position: 1,
    },
    {
      sourceKey: "taro",
      productId: "p-taro",
      variantId: "var-taro",
      sectionId: "s-1",
      name: "Purple Rain Taro Boba",
      description: "",
      imagePath: "",
      presentationPriceRupees: 259,
      tags: [],
      categorySlug: "drinks",
      subcategoryName: "Tea",
      position: 2,
    },
  ],
} as unknown as OrderingCatalog;

const cart = {
  id: "cart-1",
  brandId: catalog.brandId,
  ownerMode: "customer" as const,
  revision: "7",
  manualCouponCode: null,
  expiresAt: null,
  createdAt: "2026-09-04T00:00:00.000Z",
  updatedAt: "2026-09-04T00:00:00.000Z",
  lines: [
    { id: "line-gangnam", variantId: "var-gangnam", quantity: 3, modifiers: [], bundleSelections: [] },
    { id: "line-taro", variantId: "var-taro", quantity: 1, modifiers: [], bundleSelections: [] },
  ],
};

function checkoutState(overrides: Record<string, unknown> = {}) {
  return {
    id: "chk-1",
    customerAuthUserId: "user-1",
    brandId: catalog.brandId,
    cartId: "cart-1",
    sourceCartRevision: "7",
    revision: "1",
    status: "DRAFT",
    expiresAt: "2026-09-04T01:00:00.000Z",
    fulfilmentMode: "DELIVERY",
    pickupOutletId: null,
    activeSnapshotId: null,
    createdAt: "2026-09-04T00:00:00.000Z",
    updatedAt: "2026-09-04T00:00:00.000Z",
    destination: null,
    activeSnapshot: null,
    ...overrides,
  };
}

const paymentSnapshot: CommerceCheckoutSnapshot = {
  id: "snap-1",
  checkoutId: "chk-1",
  checkoutRevision: "3",
  sourceCartRevision: "7",
  selectedOutletId: "outlet-1",
  evaluatedAt: "2026-09-04T00:00:00.000Z",
  fulfilmentMode: "DELIVERY",
  serviceabilityEvaluatedAt: "2026-09-04T00:00:00.000Z",
  currency: "INR",
  basePaise: "59700",
  chargesPaise: "0",
  prePromotionSubtotalPaise: "59700",
  promotionDiscountPaise: "0",
  taxablePaise: "59700",
  taxPaise: "0",
  grandTotalPaise: "59700",
  taxInclusionMode: "exclusive",
  destination: null,
  pickupLocation: null,
  lines: [
    {
      sourceCartLineId: "line-gangnam",
      productName: "Gangnam Style Iced Coffee Boba",
      variantName: "Regular",
      quantity: 3,
      lineTotalPaise: "59700",
    },
    {
      sourceCartLineId: "line-taro",
      productName: "Purple Rain Taro Boba",
      variantName: "Regular",
      quantity: 1,
      lineTotalPaise: "25900",
    },
  ],
  charges: [],
  promotionEffects: [],
  taxComponents: [],
};

const paymentCheckout: CommerceCheckout = {
  id: "chk-1",
  customerAuthUserId: "user-1",
  brandId: catalog.brandId,
  cartId: "cart-1",
  sourceCartRevision: "7",
  revision: "3",
  status: "READY_FOR_PAYMENT",
  expiresAt: "2026-09-04T01:00:00.000Z",
  fulfilmentMode: "DELIVERY",
  pickupOutletId: null,
  activeSnapshotId: "snap-1",
  createdAt: "2026-09-04T00:00:00.000Z",
  updatedAt: "2026-09-04T00:00:00.000Z",
  destination: null,
  activeSnapshot: paymentSnapshot,
};

beforeEach(() => {
  startPayment.mockReset();
  clearCart.mockReset();
  fetchCustomerSession.mockResolvedValue({ ok: true, data: { authenticated: true } });
  getActiveCart.mockResolvedValue({ ok: true, status: 200, data: { cart } });
  getActiveCheckout.mockResolvedValue({ ok: true, status: 200, data: { checkout: null } });
  startCheckout.mockResolvedValue({
    ok: true,
    status: 200,
    data: { checkout: checkoutState({ revision: "1", status: "DRAFT" }) },
  });
  listOwnAddresses.mockResolvedValue({ ok: true, status: 200, data: { addresses: [] } });
  setCheckoutFulfilment.mockImplementation(async (input: unknown) => {
    const body = input as { expectedCheckoutRevision: string; fulfilmentMode: string };
    return {
      ok: true,
      status: 200,
      data: {
        checkout: checkoutState({
          revision: body.expectedCheckoutRevision,
          status: "DRAFT",
          fulfilmentMode: body.fulfilmentMode,
        }),
      },
    };
  });
  setCheckoutDestination.mockResolvedValue({
    ok: true,
    status: 200,
    data: { checkout: checkoutState({ revision: "2", status: "DRAFT", fulfilmentMode: "DELIVERY" }) },
  });
  listCheckoutPickupOptions.mockResolvedValue({
    ok: true,
    status: 200,
    data: { outlets: [], selectionPolicy: "UNAVAILABLE", merchandiseProblems: [] },
  });
  listCheckoutScheduledWindows.mockResolvedValue({
    ok: true,
    status: 200,
    data: { availability: "NO_TIMES", windows: [], message: null, timeZone: "Asia/Kolkata" },
  });
  evaluateCheckout.mockResolvedValue({
    ok: false,
    status: 400,
    code: "CHECKOUT_TEMPORARILY_UNAVAILABLE",
    problems: [{ cartLineId: "line-gangnam", code: "CHECKOUT_TEMPORARILY_UNAVAILABLE" }],
  });
});

describe("delivery checkout item attention", () => {
  it("names the unavailable item and leaves the rest of the cart in place", async () => {
    const user = userEvent.setup();
    render(<CheckoutClient catalog={catalog} />);
    await waitFor(() => expect(screen.getByTestId("checkout-fulfilment-delivery")).toBeInTheDocument());
    await user.click(screen.getByTestId("checkout-fulfilment-delivery"));
    await user.click(await screen.findByTestId("pick-address-a"));

    const attention = await screen.findByTestId("checkout-item-attention");
    expect(attention).toHaveTextContent(`Gangnam Style Iced Coffee Boba: ${UNAVAILABLE}`);
    expect(attention).not.toHaveTextContent("Purple Rain Taro Boba");
    expect(attention).not.toHaveTextContent(/don't deliver|pickup isn't available/i);
    expect(screen.getByTestId("checkout-return-to-cart")).toHaveAttribute("href", "/order/cart/");
    expect(screen.getByTestId("pick-address-a")).toBeInTheDocument();
    expect(clearCart).not.toHaveBeenCalled();
  });
});

describe("pickup checkout item attention", () => {
  it("names the merchandise cause instead of a location-wide pickup failure", async () => {
    listCheckoutPickupOptions.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        outlets: [],
        selectionPolicy: "UNAVAILABLE",
        merchandiseProblems: [
          { cartLineId: "line-gangnam", code: "CHECKOUT_TEMPORARILY_UNAVAILABLE" },
        ],
      },
    });
    const user = userEvent.setup();
    render(<CheckoutClient catalog={catalog} />);
    await waitFor(() => expect(screen.getByTestId("checkout-fulfilment-pickup")).toBeInTheDocument());
    await user.click(screen.getByTestId("checkout-fulfilment-pickup"));

    const attention = await screen.findByTestId("checkout-item-attention");
    expect(attention).toHaveTextContent("Gangnam Style Iced Coffee Boba");
    expect(screen.queryByText(/no boba bear location can take this order/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to cart" })).toHaveAttribute("href", "/order/cart/");
    expect(screen.getByRole("button", { name: "Choose Delivery" })).toBeInTheDocument();
    expect(clearCart).not.toHaveBeenCalled();
  });
});

describe("payment-start item attention", () => {
  it("names the known merchandise cause and does not clear the cart", async () => {
    startPayment.mockResolvedValue({
      ok: false,
      status: 400,
      code: "CHECKOUT_TEMPORARILY_UNAVAILABLE",
      problems: [{ cartLineId: "line-gangnam", code: "CHECKOUT_TEMPORARILY_UNAVAILABLE" }],
    });
    const user = userEvent.setup();
    render(
      <PaymentPanel
        checkout={paymentCheckout}
        snapshot={paymentSnapshot}
        onOrderReady={vi.fn()}
        brandId={catalog.brandId}
        activeCartRevision="7"
      />,
    );
    await user.click(screen.getByTestId("payment-start"));

    const attention = await screen.findByTestId("checkout-item-attention");
    expect(attention).toHaveTextContent(`Gangnam Style Iced Coffee Boba: ${UNAVAILABLE}`);
    expect(attention).not.toHaveTextContent("Purple Rain Taro Boba");
    expect(screen.getByTestId("cart-changed-back-to-cart")).toHaveTextContent("Return to cart");
    expect(screen.getByTestId("cart-changed-back-to-cart")).toHaveAttribute("href", "/order/cart/");
    expect(clearCart).not.toHaveBeenCalled();
    expect(startPayment).toHaveBeenCalledTimes(1);
  });
});
