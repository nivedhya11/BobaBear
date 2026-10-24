/**
 * #395 — Checkout destination location search through the real shared address flow when the
 * location provider status resolves after the customer has already typed.
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutDestinationFlow } from "@/components/ordering/CheckoutDestinationFlow";
import { DIRECT_ORDERING_BRAND_ID } from "@/shared/customer-menu/constants";

const getLocationProviderStatus = vi.fn<(...args: unknown[]) => unknown>();
const autocompleteLocation = vi.fn<(...args: unknown[]) => unknown>();
const resolveLocationPlace = vi.fn<(...args: unknown[]) => unknown>();
const evaluateDeliveryServiceability = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("@/lib/customer-commerce/location", () => ({
  getLocationProviderStatus: (...args: unknown[]) => getLocationProviderStatus(...args),
  autocompleteLocation: (...args: unknown[]) => autocompleteLocation(...args),
  resolveLocationPlace: (...args: unknown[]) => resolveLocationPlace(...args),
  reverseGeocodeLocation: vi.fn(),
}));

vi.mock("@/lib/customer-commerce", async () => {
  const actual = await vi.importActual<typeof import("@/lib/customer-commerce")>(
    "@/lib/customer-commerce",
  );
  return {
    ...actual,
    evaluateDeliveryServiceability: (...args: unknown[]) => evaluateDeliveryServiceability(...args),
  };
});

vi.mock("@/lib/customer-location/geolocation", () => ({ getDeviceCoordinates: vi.fn() }));
vi.mock("@/lib/customer-location/maps-js-config", () => ({ isMapsJsConfigured: vi.fn(() => true) }));
vi.mock("@/components/location/DeliveryLocationMapConfirmation", () => ({
  DeliveryLocationMapConfirmation: () => <div data-testid="delivery-location-map-confirmation" />,
}));

const savedAddress = {
  id: "addr-1",
  recipientName: "Asha",
  recipientPhone: "+919876543210",
  addressLine1: "C-802, Tower C",
  addressLine2: null,
  landmark: null,
  locality: "ISBT",
  city: "Dehradun",
  stateCode: "IN-UT",
  postalCode: "248002",
  coordinates: { latitude: "30.3256000", longitude: "78.0436000" },
  label: "Home",
  isDefault: true,
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z",
};

function deferredStatus(): (configured: boolean) => void {
  let resolveStatus: (value: unknown) => void = () => {};
  getLocationProviderStatus.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveStatus = resolve;
      }),
  );
  return (configured) =>
    resolveStatus({
      ok: true,
      status: 200,
      data: {
        configured,
        provider: "google_maps",
        status: configured ? "CONFIGURED" : "NOT_CONFIGURED",
      },
    });
}

beforeEach(() => {
  autocompleteLocation.mockResolvedValue({
    ok: true,
    status: 200,
    data: { suggestions: [{ placeId: "place-1", label: "Rajpur Road, Dehradun" }] },
  });
  resolveLocationPlace.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      location: {
        displayAddress: "Rajpur Road, Dehradun",
        postalCode: "248001",
        pinConfirmed: true,
        locality: "Rajpur",
        administrativeArea: "Dehradun",
        stateCode: "IN-UT",
        country: "India",
        countryCode: "IN",
        latitude: "30.3256000",
        longitude: "78.0436000",
      },
    },
  });
  evaluateDeliveryServiceability.mockResolvedValue({
    ok: true,
    status: 200,
    data: { decision: { status: "SERVICEABLE", evaluatedAt: "2026-10-24T00:00:00.000Z" } },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function openAddAddress(user: ReturnType<typeof userEvent.setup>): Promise<HTMLElement> {
  render(
    <CheckoutDestinationFlow
      brandId={DIRECT_ORDERING_BRAND_ID}
      addresses={[savedAddress]}
      pending={false}
      onComplete={vi.fn()}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Add new address" }));
  return screen.getByTestId("checkout-destination-location");
}

describe("#395 checkout destination provider readiness", () => {
  it("retained early input produces suggestions once the provider becomes ready", async () => {
    const user = userEvent.setup();
    const resolveStatus = deferredStatus();
    const step = await openAddAddress(user);

    const input = within(step).getByRole("combobox", {
      name: /search area, street or nearby landmark/i,
    });
    await user.type(input, "Rajpur");
    expect(autocompleteLocation).not.toHaveBeenCalled();
    expect(within(step).queryByRole("option")).not.toBeInTheDocument();

    resolveStatus(true);

    const option = await within(step).findByRole("option", { name: "Rajpur Road, Dehradun" });
    expect(autocompleteLocation).toHaveBeenCalledTimes(1);
    expect(autocompleteLocation).toHaveBeenCalledWith(
      expect.objectContaining({ query: "Rajpur" }),
      expect.any(AbortSignal),
    );
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input.getAttribute("aria-controls")).toBe(
      within(step).getByRole("listbox").getAttribute("id"),
    );

    await user.click(option);
    expect(await screen.findByTestId("delivery-location-map-confirmation")).toBeInTheDocument();
    expect(resolveLocationPlace).toHaveBeenCalledWith(
      expect.objectContaining({ placeId: "place-1" }),
    );
  });

  it("announces an unavailable provider without searching and keeps saved addresses reachable", async () => {
    const user = userEvent.setup();
    const resolveStatus = deferredStatus();
    const step = await openAddAddress(user);

    await user.type(
      within(step).getByRole("combobox", { name: /search area, street or nearby landmark/i }),
      "Rajpur",
    );
    resolveStatus(false);

    const status = await within(step).findByRole("status");
    expect(status.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    expect(status).not.toHaveTextContent(/NOT_CONFIGURED|google_maps/i);
    expect(autocompleteLocation).not.toHaveBeenCalled();
    expect(within(step).queryByRole("option")).not.toBeInTheDocument();

    await user.click(within(step).getByRole("button", { name: "Cancel" }));
    expect(await screen.findByTestId("checkout-saved-addresses")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /C-802, Tower C/i }));
    await waitFor(() => expect(evaluateDeliveryServiceability).toHaveBeenCalledTimes(1));
  });
});
