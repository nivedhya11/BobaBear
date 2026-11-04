import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderDetailClient } from "./OrderDetailClient";

const fetchCustomerSession = vi.fn<(...args: unknown[]) => unknown>();
const getCustomerOrder = vi.fn<(...args: unknown[]) => unknown>();
const cancelCustomerScheduledOrder = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("orderId=ord-1"),
}));

vi.mock("@/lib/customer-auth/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/customer-auth/client")>();
  return {
    ...actual,
    fetchCustomerSession: (...args: unknown[]) => fetchCustomerSession(...args),
  };
});

vi.mock("@/lib/customer-commerce", async () => {
  const actual = await vi.importActual<typeof import("@/lib/customer-commerce")>(
    "@/lib/customer-commerce",
  );
  return {
    ...actual,
    getCustomerOrder: (...args: unknown[]) => getCustomerOrder(...args),
    cancelCustomerScheduledOrder: (...args: unknown[]) =>
      cancelCustomerScheduledOrder(...args),
  };
});

vi.mock("@/components/ordering/OrderFinancialDocuments", () => ({
  OrderFinancialDocuments: (props: { orderId: string }) => (
    <div data-testid="order-financial-documents-slot" data-order-id={props.orderId} />
  ),
}));

const baseOrder = {
  orderId: "ord-1",
  orderNumber: "ORD-0123456789AB",
  status: "ACCEPTED",
  revision: "2",
  createdAt: "2026-08-13T00:20:00.000Z",
  updatedAt: "2026-08-13T00:25:00.000Z",
  acceptedAt: "2026-08-13T00:25:00.000Z",
  fulfilledAt: null,
  cancelledAt: null,
  cancellationReasonCode: null,
  money: { grandTotalMinor: "27195", currency: "INR" },
  paymentSatisfaction: "PAID",
  outlet: { outletId: "o1", brandId: "b1", code: "e2e", name: "E2E" },
  destination: {
    recipientName: "E2E Guest",
    recipientPhone: "+919876500251",
    addressLine1: "12 Mall Road",
    addressLine2: null,
    landmark: null,
    locality: null,
    city: "Dehradun",
    stateCode: "IN-UT",
    postalCode: "248001",
    label: null,
  },
  lines: [
    {
      productName: "Classic Milk Tea",
      variantName: "Regular",
      quantity: 1,
      lineTotalMinor: "19900",
      modifiers: [],
    },
  ],
};

beforeEach(() => {
  fetchCustomerSession.mockResolvedValue({ ok: true, data: { authenticated: true } });
  getCustomerOrder.mockReset();
  cancelCustomerScheduledOrder.mockReset();
});

describe("OrderDetailClient", () => {
  it("renders accepted order fields and D-357 status", async () => {
    getCustomerOrder.mockResolvedValue({
      ok: true,
      status: 200,
      data: { order: baseOrder },
    });
    render(<OrderDetailClient />);
    await waitFor(() => expect(screen.getByTestId("order-detail")).toBeInTheDocument());
    expect(screen.getByText("ORD-0123456789AB")).toBeInTheDocument();
    expect(screen.getByTestId("order-status")).toHaveTextContent("Order accepted");
    expect(screen.getByText(/Classic Milk Tea/)).toBeInTheDocument();
    expect(screen.getByText(/12 Mall Road/)).toBeInTheDocument();
    expect(screen.getByTestId("order-support")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /whatsapp support for order ORD-0123456789AB/i })).toHaveAttribute(
      "href",
      expect.stringContaining("ORD-0123456789AB"),
    );
    expect(screen.queryByText(/PREPARING|OUT_FOR_DELIVERY|DELIVERED/)).not.toBeInTheDocument();
    expect(screen.getByTestId("order-financial-documents-slot")).toHaveAttribute(
      "data-order-id",
      "ord-1",
    );
  });

  it("shows the same purchased saving split as confirmation", async () => {
    getCustomerOrder.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        order: {
          ...baseOrder,
          money: { grandTotalMinor: "45620", currency: "INR" },
          moneySummary: {
            prePromotionSubtotalMinor: "51800",
            promotionDiscountMinor: "9180",
            orderSavingMinor: "5180",
            deliverySavingMinor: "4000",
            charges: [
              { chargeCode: "packaging", name: "Packaging", amountMinor: "2000" },
              { chargeCode: "delivery", name: "Delivery", amountMinor: "0" },
            ],
            taxMinor: "1000",
            grandTotalMinor: "45620",
            currency: "INR",
          },
        },
      },
    });
    render(<OrderDetailClient />);
    await waitFor(() => expect(screen.getByTestId("copy-purchased")).toBeInTheDocument());
    expect(screen.getByTestId("copy-purchased")).toHaveTextContent(
      "You saved ₹91.80 on this order.",
    );
    const summary = screen.getByTestId("order-money-summary");
    expect(summary).toHaveTextContent("Order saving");
    expect(summary).toHaveTextContent("₹51.80");
    expect(summary).toHaveTextContent("Delivery saving");
    expect(summary).toHaveTextContent("₹40.00");
    expect(summary).toHaveTextContent("Total saved");
    expect(summary).toHaveTextContent("₹91.80");
    expect(summary).toHaveTextContent("Total payable");
    expect(summary).toHaveTextContent("₹456.20");
    expect(summary).not.toHaveTextContent("Discount");
  });

  it("renders detail errors", async () => {
    getCustomerOrder.mockResolvedValue({
      ok: false,
      code: "ORDER_NOT_FOUND",
      status: 404,
    });
    render(<OrderDetailClient />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/couldn't find that order/i));
  });

  it("does not offer self-service cancel for ASAP orders", async () => {
    getCustomerOrder.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        order: {
          ...baseOrder,
          fulfilmentMode: "PICKUP",
          fulfilmentTiming: "ASAP",
        },
      },
    });
    render(<OrderDetailClient />);
    await waitFor(() => expect(screen.getByTestId("order-detail")).toBeInTheDocument());
    expect(screen.queryByTestId("order-scheduled-cancel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-cancel-open")).not.toBeInTheDocument();
  });

  it("offers scheduled cancel and surfaces cutoff-closed denial", async () => {
    getCustomerOrder.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        order: {
          ...baseOrder,
          fulfilmentMode: "PICKUP",
          fulfilmentTiming: "SCHEDULED",
          scheduledWindow: {
            startAt: "2026-08-13T12:30:00.000Z",
            endAt: "2026-08-13T13:00:00.000Z",
            timeZone: "Asia/Kolkata",
            localDate: "2026-08-13",
            label: "6:00 PM – 6:30 PM",
          },
        },
      },
    });
    cancelCustomerScheduledOrder.mockResolvedValue({
      ok: false,
      code: "ORDER_CANCEL_CUTOFF_CLOSED",
      status: 409,
    });

    render(<OrderDetailClient />);
    await waitFor(() => expect(screen.getByTestId("order-cancel-open")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("order-cancel-open"));
    await waitFor(() => expect(screen.getByTestId("order-cancel-confirm")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /confirm cancellation/i }));
    await waitFor(() =>
      expect(screen.getByTestId("order-cancel-error")).toHaveTextContent(
        /self-service cancellation is closed/i,
      ),
    );
    expect(cancelCustomerScheduledOrder).toHaveBeenCalledWith({
      orderId: "ord-1",
      expectedOrderRevision: "2",
    });
    expect(screen.getByTestId("order-support")).toBeInTheDocument();
  });

  it("hides cancel after a successful scheduled cancellation", async () => {
    const scheduled = {
      ...baseOrder,
      fulfilmentMode: "DELIVERY" as const,
      fulfilmentTiming: "SCHEDULED" as const,
      scheduledWindow: {
        startAt: "2026-08-13T12:30:00.000Z",
        endAt: "2026-08-13T13:00:00.000Z",
        timeZone: "Asia/Kolkata",
        localDate: "2026-08-13",
        label: "6:00 PM – 6:30 PM",
      },
    };
    getCustomerOrder
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { order: scheduled },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          order: {
            ...scheduled,
            status: "CANCELLED",
            revision: "3",
            cancelledAt: "2026-08-13T00:30:00.000Z",
            cancellationReasonCode: "CUSTOMER_REQUESTED",
          },
        },
      });
    cancelCustomerScheduledOrder.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        order: {
          orderId: "ord-1",
          orderNumber: "ORD-0123456789AB",
          status: "CANCELLED",
          revision: "3",
          cancelledAt: "2026-08-13T00:30:00.000Z",
          cancellationReasonCode: "CUSTOMER_REQUESTED",
        },
      },
    });

    render(<OrderDetailClient />);
    await waitFor(() => expect(screen.getByTestId("order-cancel-open")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("order-cancel-open"));
    fireEvent.click(screen.getByRole("button", { name: /confirm cancellation/i }));
    await waitFor(() =>
      expect(screen.getByTestId("order-status")).toHaveTextContent(/cancelled/i),
    );
    expect(screen.queryByTestId("order-scheduled-cancel")).not.toBeInTheDocument();
  });
});
