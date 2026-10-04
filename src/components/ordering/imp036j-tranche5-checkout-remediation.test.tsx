import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutClient } from "./CheckoutClient";
import type { OrderingCatalog } from "@/shared/ordering-catalog";

const startCheckout = vi.fn();
const getActiveCheckout = vi.fn();
const getActiveCart = vi.fn();
const listOwnAddresses = vi.fn();
const listCheckoutScheduledWindows = vi.fn();

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
});
