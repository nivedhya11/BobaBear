import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CustomerDeliveryAddressFlow,
  type CustomerDeliveryAddressFlowResult,
} from "@/components/location/CustomerDeliveryAddressFlow";
import { DIRECT_ORDERING_BRAND_ID } from "@/shared/customer-menu/constants";

const getLocationProviderStatus = vi.fn<(...args: unknown[]) => unknown>();
const autocompleteLocation = vi.fn<(...args: unknown[]) => unknown>();
const resolveLocationPlace = vi.fn<(...args: unknown[]) => unknown>();
const reverseGeocodeLocation = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("@/lib/customer-commerce/location", () => ({
  getLocationProviderStatus: (...args: unknown[]) => getLocationProviderStatus(...args),
  autocompleteLocation: (...args: unknown[]) => autocompleteLocation(...args),
  resolveLocationPlace: (...args: unknown[]) => resolveLocationPlace(...args),
  reverseGeocodeLocation: (...args: unknown[]) => reverseGeocodeLocation(...args),
}));

vi.mock("@/lib/customer-location/geolocation", () => ({
  getDeviceCoordinates: vi.fn(),
}));

vi.mock("@/lib/customer-location/maps-js-config", () => ({
  isMapsJsConfigured: vi.fn(() => true),
}));

vi.mock("@/components/location/DeliveryLocationMapConfirmation", () => ({
  DeliveryLocationMapConfirmation: ({
    onConfirm,
    onChooseAnother,
  }: {
    onConfirm: (
      location: {
        latitude: string;
        longitude: string;
        locality: string;
        city?: string;
        stateCode: string;
        postalCode: string;
      },
      decision: { status: string },
    ) => void;
    onChooseAnother: () => void;
  }) => (
    <div data-testid="delivery-location-map-confirmation">
      <button
        type="button"
        onClick={() =>
          onConfirm(
            {
              latitude: "30.3256000",
              longitude: "78.0436000",
              locality: "Rajpur",
              stateCode: "IN-UT",
              postalCode: "248001",
            } as never,
            { status: "SERVICEABLE" },
          )
        }
      >
        Confirm location
      </button>
      <button type="button" onClick={onChooseAnother}>
        Choose another location
      </button>
    </div>
  ),
}));

const resolvedLocation = {
  displayAddress: "Rajpur Road, Dehradun",
  postalCode: "248001",
  pinConfirmed: true,
  locality: "Rajpur",
  administrativeArea: "Dehradun",
  stateCode: "IN-UT",
  country: "India" as const,
  countryCode: "IN" as const,
  latitude: "30.3256000",
  longitude: "78.0436000",
};

function configuredProvider(): void {
  getLocationProviderStatus.mockResolvedValue({
    ok: true,
    status: 200,
    data: { configured: true, provider: "google_maps", status: "CONFIGURED" },
  });
}

function unavailableProvider(): void {
  getLocationProviderStatus.mockResolvedValue({
    ok: true,
    status: 200,
    data: { configured: false, provider: "google_maps", status: "NOT_CONFIGURED" },
  });
}

beforeEach(() => {
  configuredProvider();
  autocompleteLocation.mockReset();
  autocompleteLocation.mockResolvedValue({
    ok: true,
    status: 200,
    data: { suggestions: [{ placeId: "place-1", label: "Rajpur Road, Dehradun" }] },
  });
  resolveLocationPlace.mockResolvedValue({ ok: true, status: 200, data: { location: resolvedLocation } });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CustomerDeliveryAddressFlow", () => {
  it("starts on location search for add mode", async () => {
    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByText("Select delivery location")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search area, street or nearby landmark/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Use current location/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/PIN code/i)).not.toBeInTheDocument();
  });

  it("moves search suggestion to map then details for add mode", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn<(result: CustomerDeliveryAddressFlowResult) => void>();
    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={onComplete}
      />,
    );

    await waitFor(() =>
      expect(screen.queryByText(/Location search isn't available/i)).not.toBeInTheDocument(),
    );

    const search = screen.getByPlaceholderText(/Search area, street or nearby landmark/i);
    await user.type(search, "Rajpur");
    await waitFor(() => expect(autocompleteLocation).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /Rajpur Road, Dehradun/i })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("option", { name: /Rajpur Road, Dehradun/i }));

    await waitFor(() => expect(screen.getByTestId("customer-address-flow-map")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Confirm location" }));

    expect(screen.getByTestId("customer-address-flow-details")).toBeInTheDocument();
    expect(screen.getByLabelText(/Flat \/ House \/ Building/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^City$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^State$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/PIN code/i)).not.toBeInTheDocument();
    expect(screen.getByText("Save this address as")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Flat \/ House \/ Building/i), "C-802");
    await user.type(screen.getByLabelText(/Recipient name/i), "Asha");
    await user.type(screen.getByLabelText(/Mobile number/i), "+919876543210");
    await user.click(screen.getByRole("button", { name: "Home" }));
    await user.click(screen.getByRole("button", { name: "Save address" }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "CREATE",
        input: expect.objectContaining({
          addressLine1: "C-802",
          recipientName: "Asha",
          coordinates: { latitude: "30.3256000", longitude: "78.0436000" },
        }),
      }),
    );
  });

  it("starts on map for edit mode when coordinates exist", async () => {
    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{
          kind: "edit",
          address: {
            id: "addr-1",
            recipientName: "Asha",
            recipientPhone: "+919876543210",
            addressLine1: "C-802",
            addressLine2: null,
            landmark: null,
            locality: "Rajpur",
            city: "Dehradun",
            stateCode: "IN-UT",
            postalCode: "248001",
            coordinates: { latitude: "30.3256000", longitude: "78.0436000" },
            label: "Home",
            isDefault: true,
            createdAt: "2026-08-13T00:00:00.000Z",
            updatedAt: "2026-08-13T00:00:00.000Z",
          },
        }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByTestId("customer-address-flow-map")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Search area/i)).not.toBeInTheDocument();
  });

  it("completes reconfirm mode from map without details form", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn<(result: CustomerDeliveryAddressFlowResult) => void>();
    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{
          kind: "reconfirm",
          address: {
            id: "addr-legacy",
            recipientName: "Asha",
            recipientPhone: "+919876543210",
            addressLine1: "12 Rajpur Road",
            addressLine2: null,
            landmark: null,
            locality: "Rajpur",
            city: "Dehradun",
            stateCode: "IN-UT",
            postalCode: "248001",
            coordinates: null,
            label: "Home",
            isDefault: true,
            createdAt: "2026-08-13T00:00:00.000Z",
            updatedAt: "2026-08-13T00:00:00.000Z",
          },
        }}
        onCancel={vi.fn()}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByText("Select delivery location")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(/Location search isn't available/i)).not.toBeInTheDocument(),
    );
    await user.type(screen.getByPlaceholderText(/Search area/i), "Rajpur");
    await waitFor(() => expect(autocompleteLocation).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /Rajpur Road, Dehradun/i })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("option", { name: /Rajpur Road, Dehradun/i }));
    await waitFor(() => expect(screen.getByTestId("customer-address-flow-map")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Confirm location" }));

    expect(onComplete).toHaveBeenCalledWith({
      kind: "RECONFIRM_COORDINATES",
      addressId: "addr-legacy",
      coordinates: { latitude: "30.3256000", longitude: "78.0436000" },
    });
    expect(screen.queryByTestId("customer-address-flow-details")).not.toBeInTheDocument();
  });

  it("A: searches normally when provider is ready before typing", async () => {
    const user = userEvent.setup();
    configuredProvider();
    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(screen.queryByText(/Location search isn't available/i)).not.toBeInTheDocument(),
    );
    await user.type(screen.getByPlaceholderText(/Search area, street or nearby landmark/i), "Rajpur");
    await waitFor(() =>
      expect(autocompleteLocation).toHaveBeenCalledWith(
        expect.objectContaining({ query: "Rajpur" }),
        expect.any(AbortSignal),
      ),
    );
    expect(await screen.findByRole("option", { name: /Rajpur Road, Dehradun/i })).toBeInTheDocument();
  });

  it("B: recovers retained input when provider status resolves after early typing", async () => {
    const user = userEvent.setup();
    let resolveStatus: (value: unknown) => void = () => {};
    getLocationProviderStatus.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
    );

    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/Search area, street or nearby landmark/i);
    await user.type(input, "Rajpur");
    expect(autocompleteLocation).not.toHaveBeenCalled();
    expect(input).toHaveValue("Rajpur");

    resolveStatus({
      ok: true,
      status: 200,
      data: { configured: true, provider: "google_maps", status: "CONFIGURED" },
    });

    await waitFor(() =>
      expect(autocompleteLocation).toHaveBeenCalledWith(
        expect.objectContaining({ query: "Rajpur" }),
        expect.any(AbortSignal),
      ),
    );
    expect(autocompleteLocation).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("option", { name: /Rajpur Road, Dehradun/i })).toBeInTheDocument();
  });

  it("C: late readiness searches only the newest retained query", async () => {
    const user = userEvent.setup();
    let resolveStatus: (value: unknown) => void = () => {};
    getLocationProviderStatus.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
    );
    autocompleteLocation.mockImplementation((...args: unknown[]) => {
      const input = args[0] as { query: string };
      return Promise.resolve({
        ok: true,
        status: 200,
        data: {
          suggestions: [{ placeId: `place-${input.query}`, label: `${input.query} Road, Dehradun` }],
        },
      });
    });

    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/Search area, street or nearby landmark/i);
    await user.type(input, "Raj");
    await user.type(input, "pur");
    expect(autocompleteLocation).not.toHaveBeenCalled();

    resolveStatus({
      ok: true,
      status: 200,
      data: { configured: true, provider: "google_maps", status: "CONFIGURED" },
    });

    await waitFor(() =>
      expect(autocompleteLocation).toHaveBeenCalledWith(
        expect.objectContaining({ query: "Rajpur" }),
        expect.any(AbortSignal),
      ),
    );
    expect(autocompleteLocation).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("option", { name: /Rajpur Road, Dehradun/i })).toBeInTheDocument();
  });

  it("D: does not replay cleared or too-short retained queries after readiness", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    let resolveStatus: (value: unknown) => void = () => {};
    getLocationProviderStatus.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
    );

    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/Search area, street or nearby landmark/i);
    await user.type(input, "Rajpur");
    await user.clear(input);
    await user.type(input, "Ra");

    await act(async () => {
      resolveStatus({
        ok: true,
        status: 200,
        data: { configured: true, provider: "google_maps", status: "CONFIGURED" },
      });
      await Promise.resolve();
    });
    await vi.advanceTimersByTimeAsync(500);
    expect(autocompleteLocation).not.toHaveBeenCalled();
  });

  it("E: unavailable provider shows messaging and never searches", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    unavailableProvider();

    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getAllByText(/Location search isn't available/i).length).toBeGreaterThan(0),
    );
    await user.type(screen.getByPlaceholderText(/Search area, street or nearby landmark/i), "Rajpur");
    await vi.advanceTimersByTimeAsync(500);
    expect(autocompleteLocation).not.toHaveBeenCalled();
  });

  it("F: aborted older autocomplete results cannot replace newer suggestions", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    configuredProvider();

    let resolveFirst: (value: unknown) => void = () => {};
    let resolveSecond: (value: unknown) => void = () => {};
    let call = 0;
    autocompleteLocation.mockImplementation((...args: unknown[]) => {
      const signal = args[1] as AbortSignal;
      call += 1;
      if (call === 1) {
        return new Promise((resolve) => {
          resolveFirst = resolve;
          signal.addEventListener("abort", () => {
            // leave unresolved; aborted callers must ignore late resolve
          });
        });
      }
      return new Promise((resolve) => {
        resolveSecond = resolve;
      });
    });

    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(screen.queryByText(/Location search isn't available/i)).not.toBeInTheDocument(),
    );

    const input = screen.getByPlaceholderText(/Search area, street or nearby landmark/i);
    await user.type(input, "Raj");
    await vi.advanceTimersByTimeAsync(300);
    await waitFor(() => expect(autocompleteLocation).toHaveBeenCalledTimes(1));

    await user.type(input, "pur");
    await vi.advanceTimersByTimeAsync(300);
    await waitFor(() => expect(autocompleteLocation).toHaveBeenCalledTimes(2));

    resolveSecond({
      ok: true,
      status: 200,
      data: { suggestions: [{ placeId: "place-new", label: "Rajpur Road, Dehradun" }] },
    });
    expect(await screen.findByRole("option", { name: /Rajpur Road, Dehradun/i })).toBeInTheDocument();

    resolveFirst({
      ok: true,
      status: 200,
      data: { suggestions: [{ placeId: "place-stale", label: "Stale Place, Dehradun" }] },
    });
    await vi.advanceTimersByTimeAsync(50);
    expect(screen.queryByRole("option", { name: /Stale Place/i })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Rajpur Road, Dehradun/i })).toBeInTheDocument();
  });

  it("G: unmount cancels pending readiness recovery search", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    let resolveStatus: (value: unknown) => void = () => {};
    getLocationProviderStatus.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
    );

    const view = render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText(/Search area, street or nearby landmark/i), "Rajpur");
    await act(async () => {
      resolveStatus({
        ok: true,
        status: 200,
        data: { configured: true, provider: "google_maps", status: "CONFIGURED" },
      });
      await Promise.resolve();
    });
    // Readiness effect scheduled debounce; unmount before the request fires.
    view.unmount();
    await vi.advanceTimersByTimeAsync(500);
    expect(autocompleteLocation).not.toHaveBeenCalled();
  });

  it("I: readiness recovery does not duplicate a request already scheduled after ready", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    configuredProvider();

    render(
      <CustomerDeliveryAddressFlow
        brandId={DIRECT_ORDERING_BRAND_ID}
        mode={{ kind: "add" }}
        onCancel={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(screen.queryByText(/Location search isn't available/i)).not.toBeInTheDocument(),
    );

    await user.type(screen.getByPlaceholderText(/Search area, street or nearby landmark/i), "Rajpur");
    await vi.advanceTimersByTimeAsync(300);
    await waitFor(() => expect(autocompleteLocation).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(300);
    expect(autocompleteLocation).toHaveBeenCalledTimes(1);
  });
});
