import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderDetailClient } from "./OrderDetailClient";

const fetchCustomerSession = vi.fn<(...args: unknown[]) => unknown>();
const getCustomerOrder = vi.fn<(...args: unknown[]) => unknown>();

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

  it("labels only a purchased line the server already marked as merchandise-discounted", async () => {
    getCustomerOrder.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        order: {
          ...baseOrder,
          moneySummary: {
            prePromotionSubtotalMinor: "51800",
            promotionDiscountMinor: "5180",
            charges: [{ chargeCode: "packaging", name: "Packaging", amountMinor: "2000" }],
            taxMinor: "0",
            grandTotalMinor: "48620",
            currency: "INR",
          },
          lines: [
            {
              productName: "Purple Rain Taro Boba",
              variantName: "Regular",
              quantity: 2,
              lineTotalMinor: "46620",
              merchandiseDiscountApplies: true,
              modifiers: [],
            },
            {
              productName: "Classic Milk Tea",
              variantName: "Regular",
              quantity: 1,
              lineTotalMinor: "19900",
              merchandiseDiscountApplies: false,
              modifiers: [],
            },
            {
              productName: "Honey Boba",
              variantName: "",
              quantity: 1,
              lineTotalMinor: "0",
              lineOrigin: "complimentary_offer",
              merchandiseDiscountApplies: false,
              modifiers: [],
            },
          ],
        },
      },
    });
    render(<OrderDetailClient />);
    await waitFor(() => expect(screen.getByTestId("order-detail")).toBeInTheDocument());
    expect(screen.getByText("After discount")).toBeVisible();
    expect(screen.getByText("After discount")).not.toHaveAttribute("aria-hidden");
    expect(screen.getAllByText("After discount")).toHaveLength(1);
    expect(screen.getByText("₹466.20")).toBeVisible();
    expect(screen.getByText("₹199.00")).toBeVisible();
    expect(screen.getByText("Included with your offer")).toBeVisible();
    expect(screen.getByText("You saved ₹51.80 on this order.")).toBeVisible();
    expect(screen.getByText("Total payable")).toBeVisible();
    expect(screen.getByText("₹486.20")).toBeVisible();
  });

  it("does not invent After discount when the purchased line has no attribution flag", async () => {
    getCustomerOrder.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        order: {
          ...baseOrder,
          moneySummary: {
            prePromotionSubtotalMinor: "19900",
            promotionDiscountMinor: "4000",
            charges: [],
            taxMinor: "0",
            grandTotalMinor: "15900",
            currency: "INR",
          },
        },
      },
    });
    render(<OrderDetailClient />);
    await waitFor(() => expect(screen.getByTestId("order-detail")).toBeInTheDocument());
    expect(screen.queryByText("After discount")).not.toBeInTheDocument();
    expect(screen.getByText("You saved ₹40.00 on this order.")).toBeVisible();
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
});
