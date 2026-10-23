/**
 * Operations Delivery panel UX invariants + WXE-P0-CORRECTIVE-1 safety (IMP-032 semantics preserved).
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OperationsDeliveryPanel } from "./OperationsDeliveryPanel";

const getWorkforceDelivery = vi.fn<(...args: unknown[]) => unknown>();
const postDeliveryCommand = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("@/lib/operations/delivery", () => ({
  getWorkforceDelivery: (...args: unknown[]) => getWorkforceDelivery(...args),
  postDeliveryCommand: (...args: unknown[]) => postDeliveryCommand(...args),
}));

const ORDER_ID = "11111111-1111-4111-8111-111111111111";
const DELIVERY_ID = "22222222-2222-4222-8222-222222222222";

function detail(commands: readonly string[]) {
  return {
    delivery: {
      id: DELIVERY_ID,
      orderId: ORDER_ID,
      status: "PICKED_UP",
      revision: "3",
      bookingCorrelationId: null,
      provider: "courier-a",
      externalBookingReference: "EXT-1",
      updatedAt: "2026-10-23T00:00:00.000Z",
    },
    activeAssignment: null,
    trackingUrl: null,
    providerCosts: [],
    activeReturn: null,
    permittedCommands: commands,
  };
}

beforeEach(() => {
  getWorkforceDelivery.mockReset();
  postDeliveryCommand.mockReset();
});

describe("OperationsDeliveryPanel source invariants", () => {
  const source = readFileSync("src/components/operations/OperationsDeliveryPanel.tsx", "utf8");

  it("instructs external booking only after begin manual booking path", () => {
    expect(source).toContain(
      "Begin manual booking in BOBA before attempting external courier booking.",
    );
    expect(source).toContain(
      "External booking outcome is not yet confirmed. Resolve once the courier result is known.",
    );
    expect(source).not.toContain("External booking may now be attempted");
  });

  it("gates lifecycle commands via permittedCommands", () => {
    expect(source).toContain('has("BEGIN_MANUAL_BOOKING")');
    expect(source).toContain('has("CONFIRM_MANUAL_BOOKING")');
    expect(source).toContain('has("RECORD_ASSIGNMENT")');
    expect(source).toContain('has("CONFIRM_PICKUP")');
    expect(source).toContain('has("CONFIRM_DELIVERY")');
    expect(source).toContain('has("RESOLVE_MANUAL_BOOKING_FAILURE")');
  });

  it("surfaces revision conflict refresh handling", () => {
    expect(source).toContain("DELIVERY_REVISION_CONFLICT");
    expect(source).toContain("Refreshing");
  });

  it("does not ship fabricated UAT initial values", () => {
    expect(source).not.toContain("dehradun-courier");
    expect(source).not.toContain("track.example.com");
    expect(source).not.toContain("rider-uat-1");
    expect(source).not.toContain("pickup-uat-1");
    expect(source).not.toContain("proof-uat-1");
    expect(source).not.toContain('useState("NO_BOOKING")');
    expect(source).not.toContain("Courier unavailable");
    expect(source).not.toContain('useState("COURIER_CANCEL")');
    expect(source).not.toContain("External booking cancelled");
  });

  it("does not hard-code inactiveBookingConfirmed true outside acknowledgment path", () => {
    expect(source).toContain("inactiveBookingAcknowledged");
    expect(source).toContain("not verified external-provider evidence");
  });
});

describe("OperationsDeliveryPanel interactive safety", () => {
  it("starts required fields empty and blocks confirm-delivery without proof", async () => {
    const user = userEvent.setup();
    getWorkforceDelivery.mockResolvedValue({
      ok: true,
      status: 200,
      data: { delivery: detail(["CONFIRM_DELIVERY"]) },
    });
    render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    await waitFor(() => expect(screen.getByTestId("delivery-proof-reference")).toBeInTheDocument());
    expect(screen.getByTestId("delivery-proof-reference")).toHaveValue("");
    await user.click(screen.getByTestId("delivery-confirm-delivery"));
    expect(screen.getByTestId("delivery-field-error")).toHaveTextContent("Proof reference is required.");
    expect(postDeliveryCommand).not.toHaveBeenCalled();
    expect(screen.queryByTestId("delivery-consequence-dialog")).not.toBeInTheDocument();
  });

  it("requires consequence confirmation before confirm-delivery submits", async () => {
    const user = userEvent.setup();
    getWorkforceDelivery.mockResolvedValue({
      ok: true,
      status: 200,
      data: { delivery: detail(["CONFIRM_DELIVERY"]) },
    });
    postDeliveryCommand.mockResolvedValue({ ok: true, status: 200, data: { result: {} } });
    render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    await waitFor(() => expect(screen.getByTestId("delivery-proof-reference")).toBeInTheDocument());
    await user.type(screen.getByTestId("delivery-proof-reference"), "pod-ref-9");
    await user.click(screen.getByTestId("delivery-confirm-delivery"));
    expect(postDeliveryCommand).not.toHaveBeenCalled();
    const dialog = await screen.findByTestId("delivery-consequence-dialog");
    expect(dialog).toHaveAttribute("data-delivery-consequence-action", "confirm-delivery");
    expect(dialog).toHaveTextContent(ORDER_ID);
    expect(dialog).toHaveTextContent(DELIVERY_ID);
    await user.click(screen.getByTestId("delivery-consequence-confirm"));
    await waitFor(() => expect(postDeliveryCommand).toHaveBeenCalledTimes(1));
    expect(postDeliveryCommand).toHaveBeenCalledWith(
      ORDER_ID,
      "confirm-delivery",
      expect.objectContaining({
        deliveryId: DELIVERY_ID,
        expectedRevision: "3",
        proofReference: "pod-ref-9",
      }),
    );
  });

  it("blocks resolve failure without attestation and does not one-click submit", async () => {
    const user = userEvent.setup();
    getWorkforceDelivery.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        delivery: detail(["RESOLVE_MANUAL_BOOKING_FAILURE"]),
      },
    });
    postDeliveryCommand.mockResolvedValue({ ok: true, status: 200, data: { result: {} } });
    render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    await waitFor(() => expect(screen.getByTestId("delivery-failure-code")).toBeInTheDocument());
    expect(screen.getByTestId("delivery-failure-code")).toHaveValue("");
    expect(screen.getByTestId("delivery-failure-reason")).toHaveValue("");
    await user.type(screen.getByTestId("delivery-failure-code"), "NO_BOOKING");
    await user.type(screen.getByTestId("delivery-failure-reason"), "No courier accepted");
    await user.click(screen.getByTestId("delivery-resolve-failure"));
    expect(screen.getByTestId("delivery-field-error")).toHaveTextContent(
      "Operator acknowledgment of booking inactivity is required.",
    );
    expect(postDeliveryCommand).not.toHaveBeenCalled();
    await user.click(screen.getByTestId("delivery-inactive-booking-ack"));
    await user.click(screen.getByTestId("delivery-resolve-failure"));
    expect(await screen.findByTestId("delivery-consequence-dialog")).toBeInTheDocument();
    expect(postDeliveryCommand).not.toHaveBeenCalled();
    await user.click(screen.getByTestId("delivery-consequence-confirm"));
    await waitFor(() => expect(postDeliveryCommand).toHaveBeenCalledTimes(1));
    expect(postDeliveryCommand).toHaveBeenCalledWith(
      ORDER_ID,
      "resolve-manual-booking-failure",
      expect.objectContaining({
        inactiveBookingConfirmed: true,
        failureCode: "NO_BOOKING",
        failureReason: "No courier accepted",
      }),
    );
  });

  it("requires visible codes/reasons and confirmation for report failure and cancel", async () => {
    const user = userEvent.setup();
    getWorkforceDelivery.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        delivery: detail(["REPORT_DELIVERY_FAILURE", "CANCEL_DELIVERY"]),
      },
    });
    postDeliveryCommand.mockResolvedValue({ ok: true, status: 200, data: { result: {} } });
    render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    await waitFor(() => expect(screen.getByTestId("delivery-report-failure")).toBeInTheDocument());

    await user.click(screen.getByTestId("delivery-report-failure"));
    expect(screen.getByTestId("delivery-field-error")).toHaveTextContent("Failure code is required.");
    expect(postDeliveryCommand).not.toHaveBeenCalled();

    await user.type(screen.getByTestId("delivery-report-failure-code"), "LOST");
    await user.type(screen.getByTestId("delivery-report-failure-reason"), "Package lost");
    await user.click(screen.getByTestId("delivery-report-failure"));
    expect(await screen.findByTestId("delivery-consequence-dialog")).toHaveAttribute(
      "data-delivery-consequence-action",
      "report-failure",
    );
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.queryByTestId("delivery-consequence-dialog")).not.toBeInTheDocument();
    expect(postDeliveryCommand).not.toHaveBeenCalled();

    await user.click(screen.getByTestId("delivery-cancel"));
    expect(screen.getByTestId("delivery-field-error")).toHaveTextContent("Cancellation code is required.");
    await user.type(screen.getByTestId("delivery-cancel-code"), "OPS_CANCEL");
    await user.type(screen.getByTestId("delivery-cancel-reason"), "Customer no longer needs delivery");
    await user.click(screen.getByTestId("delivery-cancel"));
    expect(await screen.findByTestId("delivery-consequence-dialog")).toHaveAttribute(
      "data-delivery-consequence-action",
      "cancel",
    );
    await user.click(screen.getByTestId("delivery-consequence-confirm"));
    await waitFor(() => expect(postDeliveryCommand).toHaveBeenCalledTimes(1));
    expect(postDeliveryCommand).toHaveBeenCalledWith(
      ORDER_ID,
      "cancel",
      expect.objectContaining({
        cancellationCode: "OPS_CANCEL",
        cancellationReason: "Customer no longer needs delivery",
      }),
    );
  });

  it("does not render commands that are not permitted", async () => {
    getWorkforceDelivery.mockResolvedValue({
      ok: true,
      status: 200,
      data: { delivery: detail(["CONFIRM_PICKUP"]) },
    });
    render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    await waitFor(() => expect(screen.getByTestId("delivery-confirm-pickup")).toBeInTheDocument());
    expect(screen.queryByTestId("delivery-confirm-delivery")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delivery-cancel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delivery-report-failure")).not.toBeInTheDocument();
  });
});
