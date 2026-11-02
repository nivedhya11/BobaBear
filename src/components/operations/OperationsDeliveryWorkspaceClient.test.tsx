import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isVerifiedDeliveryOrder,
  OperationsDeliveryWorkspaceClient,
} from "./OperationsDeliveryWorkspaceClient";
import type { OperationsOrderSummary } from "@/lib/operations/types";

const listWorkforceOrders = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("@/lib/operations/orders", () => ({
  listWorkforceOrders: (...args: unknown[]) => listWorkforceOrders(...args),
}));

vi.mock("@/components/operations/OperationsDeliveryPanel", () => ({
  OperationsDeliveryPanel: (props: { orderId: string }) => (
    <div data-testid="mock-delivery-panel" data-order-id={props.orderId}>
      Delivery panel for {props.orderId}
    </div>
  ),
}));

function summary(
  overrides: Partial<OperationsOrderSummary> & Pick<OperationsOrderSummary, "orderId" | "orderNumber">,
): OperationsOrderSummary {
  return {
    status: "ACCEPTED",
    revision: "1",
    createdAt: "2026-10-23T00:00:00.000Z",
    acceptedAt: "2026-10-23T00:05:00.000Z",
    fulfilledAt: null,
    cancelledAt: null,
    money: { grandTotalMinor: "10000", currency: "INR" },
    outlet: { outletId: "o1", brandId: "b1", code: "e2e", name: "E2E Outlet" },
    fulfilmentTiming: "ASAP",
    ...overrides,
  };
}

beforeEach(() => {
  listWorkforceOrders.mockReset();
});

describe("isVerifiedDeliveryOrder", () => {
  it("accepts only explicit DELIVERY mode", () => {
    expect(isVerifiedDeliveryOrder(summary({ orderId: "d1", orderNumber: "D1", fulfilmentMode: "DELIVERY" }))).toBe(
      true,
    );
    expect(isVerifiedDeliveryOrder(summary({ orderId: "p1", orderNumber: "P1", fulfilmentMode: "PICKUP" }))).toBe(
      false,
    );
    expect(isVerifiedDeliveryOrder(summary({ orderId: "u1", orderNumber: "U1" }))).toBe(false);
  });
});

describe("OperationsDeliveryWorkspaceClient", () => {
  it("lists only verified Delivery-mode orders and does not default unknown to Delivery", async () => {
    listWorkforceOrders.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        items: [
          summary({ orderId: "ord-d", orderNumber: "ORD-DELIVERY01", fulfilmentMode: "DELIVERY" }),
          summary({ orderId: "ord-p", orderNumber: "ORD-TAKEAWAY01", fulfilmentMode: "PICKUP" }),
          summary({ orderId: "ord-u", orderNumber: "ORD-UNKNOWN01" }),
        ],
        nextCursor: null,
      },
    });
    render(<OperationsDeliveryWorkspaceClient />);
    await waitFor(() => expect(screen.getByTestId("delivery-queue-list")).toBeInTheDocument());
    expect(screen.getByTestId("delivery-queue-item-ord-d")).toBeInTheDocument();
    expect(screen.queryByTestId("delivery-queue-item-ord-p")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delivery-queue-item-ord-u")).not.toBeInTheDocument();
    expect(screen.getByTestId("delivery-queue-honesty")).toHaveTextContent(
      "Showing 1 Delivery order (2 accepted non-Delivery or unknown-mode orders hidden",
    );
    expect(screen.getByTestId("mock-delivery-panel")).toHaveAttribute("data-order-id", "ord-d");
  });

  it("does not render Takeaway delivery actions when only non-Delivery orders are loaded", async () => {
    listWorkforceOrders.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        items: [
          summary({ orderId: "ord-p", orderNumber: "ORD-TAKEAWAY01", fulfilmentMode: "PICKUP" }),
        ],
        nextCursor: null,
      },
    });
    render(<OperationsDeliveryWorkspaceClient />);
    await waitFor(() => expect(screen.getByTestId("delivery-queue-empty")).toBeInTheDocument());
    expect(screen.queryByTestId("mock-delivery-panel")).not.toBeInTheDocument();
  });

  it("preserves pagination honesty with Load more instead of silent truncation", async () => {
    const user = userEvent.setup();
    listWorkforceOrders
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          items: [
            summary({ orderId: "ord-d1", orderNumber: "ORD-D1", fulfilmentMode: "DELIVERY" }),
          ],
          nextCursor: "cursor-2",
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          items: [
            summary({ orderId: "ord-d2", orderNumber: "ORD-D2", fulfilmentMode: "DELIVERY" }),
            summary({ orderId: "ord-p2", orderNumber: "ORD-P2", fulfilmentMode: "PICKUP" }),
          ],
          nextCursor: null,
        },
      });
    render(<OperationsDeliveryWorkspaceClient />);
    await waitFor(() => expect(screen.getByTestId("delivery-queue-load-more")).toBeInTheDocument());
    expect(screen.getByTestId("delivery-queue-honesty")).toHaveTextContent("more pages available");
    await user.click(screen.getByTestId("delivery-queue-load-more"));
    await waitFor(() => expect(screen.getByTestId("delivery-queue-item-ord-d2")).toBeInTheDocument());
    expect(listWorkforceOrders).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "ACCEPTED", cursor: "cursor-2", limit: 50 }),
    );
    expect(screen.queryByTestId("delivery-queue-item-ord-p2")).not.toBeInTheDocument();
    expect(screen.getByTestId("delivery-queue-honesty")).toHaveTextContent("Showing 2 Delivery orders");
    expect(screen.queryByTestId("delivery-queue-load-more")).not.toBeInTheDocument();
  });

  it("binds the panel to the selected Delivery order only", async () => {
    const user = userEvent.setup();
    listWorkforceOrders.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        items: [
          summary({ orderId: "ord-a", orderNumber: "ORD-A", fulfilmentMode: "DELIVERY" }),
          summary({ orderId: "ord-b", orderNumber: "ORD-B", fulfilmentMode: "DELIVERY" }),
        ],
        nextCursor: null,
      },
    });
    render(<OperationsDeliveryWorkspaceClient />);
    await waitFor(() => expect(screen.getByTestId("mock-delivery-panel")).toHaveAttribute("data-order-id", "ord-a"));
    await user.click(screen.getByTestId("delivery-queue-item-ord-b"));
    expect(screen.getByTestId("mock-delivery-panel")).toHaveAttribute("data-order-id", "ord-b");
    expect(screen.getByTestId("delivery-selected-meta")).toHaveTextContent("ORD-B");
  });

  it("preserves the latest selection when Load more completes after a mid-flight selection change", async () => {
    const user = userEvent.setup();
    let resolveMore: ((value: unknown) => void) | undefined;
    const morePage = new Promise((resolve) => {
      resolveMore = resolve;
    });
    listWorkforceOrders
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          items: [
            summary({ orderId: "ord-a", orderNumber: "ORD-A", fulfilmentMode: "DELIVERY" }),
            summary({ orderId: "ord-b", orderNumber: "ORD-B", fulfilmentMode: "DELIVERY" }),
          ],
          nextCursor: "cursor-2",
        },
      })
      .mockImplementationOnce(() => morePage);

    render(<OperationsDeliveryWorkspaceClient />);
    await waitFor(() => expect(screen.getByTestId("delivery-queue-load-more")).toBeInTheDocument());
    expect(screen.getByTestId("mock-delivery-panel")).toHaveAttribute("data-order-id", "ord-a");

    await user.click(screen.getByTestId("delivery-queue-load-more"));
    await user.click(screen.getByTestId("delivery-queue-item-ord-b"));
    expect(screen.getByTestId("mock-delivery-panel")).toHaveAttribute("data-order-id", "ord-b");

    await act(async () => {
      resolveMore?.({
        ok: true,
        status: 200,
        data: {
          items: [
            summary({ orderId: "ord-c", orderNumber: "ORD-C", fulfilmentMode: "DELIVERY" }),
          ],
          nextCursor: null,
        },
      });
    });

    await waitFor(() => expect(screen.getByTestId("delivery-queue-item-ord-c")).toBeInTheDocument());
    expect(screen.getByTestId("mock-delivery-panel")).toHaveAttribute("data-order-id", "ord-b");
    expect(screen.getByTestId("delivery-selected-meta")).toHaveTextContent("ORD-B");
  });

  it("preserves loaded queue results on pagination failure and allows retry", async () => {
    const user = userEvent.setup();
    listWorkforceOrders
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          items: [
            summary({ orderId: "ord-a", orderNumber: "ORD-A", fulfilmentMode: "DELIVERY" }),
          ],
          nextCursor: "cursor-2",
        },
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        code: "INTERNAL",
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          items: [
            summary({ orderId: "ord-b", orderNumber: "ORD-B", fulfilmentMode: "DELIVERY" }),
          ],
          nextCursor: null,
        },
      });

    render(<OperationsDeliveryWorkspaceClient />);
    await waitFor(() => expect(screen.getByTestId("delivery-queue-item-ord-a")).toBeInTheDocument());
    await user.click(screen.getByTestId("delivery-queue-load-more"));
    await waitFor(() =>
      expect(screen.getByTestId("delivery-queue-pagination-error")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("delivery-queue-item-ord-a")).toBeInTheDocument();
    expect(screen.getByTestId("mock-delivery-panel")).toHaveAttribute("data-order-id", "ord-a");
    expect(screen.getByTestId("delivery-queue-load-more")).toHaveTextContent("Retry loading more");

    await user.click(screen.getByTestId("delivery-queue-load-more"));
    await waitFor(() => expect(screen.getByTestId("delivery-queue-item-ord-b")).toBeInTheDocument());
    expect(screen.queryByTestId("delivery-queue-pagination-error")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-delivery-panel")).toHaveAttribute("data-order-id", "ord-a");
  });
});
