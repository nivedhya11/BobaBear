/**
 * Operations Delivery panel UX invariants + WXE-P0-CORRECTIVE-1 safety (IMP-032 semantics preserved).
 */
import { act, render, screen, waitFor } from "@testing-library/react";
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
const ORDER_B = "33333333-3333-4333-8333-333333333333";
const DELIVERY_ID = "22222222-2222-4222-8222-222222222222";
const DELIVERY_B = "44444444-4444-4444-8444-444444444444";

function detail(
  commands: readonly string[],
  overrides?: {
    orderId?: string;
    deliveryId?: string;
    status?: string;
    revision?: string;
  },
) {
  const orderId = overrides?.orderId ?? ORDER_ID;
  const deliveryId = overrides?.deliveryId ?? DELIVERY_ID;
  return {
    delivery: {
      id: deliveryId,
      orderId,
      status: overrides?.status ?? "PICKED_UP",
      revision: overrides?.revision ?? "3",
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

  it("binds pending consequence and commands to Order + Delivery identity", () => {
    expect(source).toContain("pendingConsequence.orderId");
    expect(source).toContain("pendingConsequence.deliveryId");
    expect(source).toContain("activeDeliveryIdRef");
    expect(source).toContain("commandGenerationRef");
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

describe("OperationsDeliveryPanel cross-order and identity isolation", () => {
  it("resets evidence fields, inactivity ack, validation errors, and dialogs on Order change", async () => {
    const user = userEvent.setup();
    getWorkforceDelivery.mockImplementation(async (orderId: unknown) => ({
      ok: true,
      status: 200,
      data: {
        delivery: detail(["RESOLVE_MANUAL_BOOKING_FAILURE", "CONFIRM_DELIVERY"], {
          orderId: String(orderId),
          deliveryId: orderId === ORDER_B ? DELIVERY_B : DELIVERY_ID,
          status: "BOOKING_OUTCOME_UNKNOWN",
        }),
      },
    }));

    const { rerender } = render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    await waitFor(() => expect(screen.getByTestId("delivery-failure-code")).toBeInTheDocument());
    await user.type(screen.getByTestId("delivery-failure-code"), "NO_BOOKING");
    await user.type(screen.getByTestId("delivery-failure-reason"), "No courier");
    await user.click(screen.getByTestId("delivery-inactive-booking-ack"));
    expect(screen.getByTestId("delivery-inactive-booking-ack")).toBeChecked();
    await user.click(screen.getByTestId("delivery-resolve-failure"));
    expect(await screen.findByTestId("delivery-consequence-dialog")).toBeInTheDocument();

    rerender(<OperationsDeliveryPanel orderId={ORDER_B} />);
    await waitFor(() =>
      expect(screen.getByTestId("operations-delivery-panel")).toHaveAttribute(
        "data-order-id",
        ORDER_B,
      ),
    );
    expect(screen.queryByTestId("delivery-consequence-dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("delivery-failure-code")).toHaveValue("");
    expect(screen.getByTestId("delivery-failure-reason")).toHaveValue("");
    expect(screen.getByTestId("delivery-inactive-booking-ack")).not.toBeChecked();
    expect(screen.queryByTestId("delivery-field-error")).not.toBeInTheDocument();
  });

  it("resets delivery-specific operator state when Delivery identity changes under the same Order", async () => {
    const user = userEvent.setup();
    getWorkforceDelivery
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          delivery: detail(["CONFIRM_PICKUP"], {
            deliveryId: DELIVERY_ID,
            status: "BOOKED",
          }),
        },
      })
      .mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          delivery: detail(["CONFIRM_PICKUP"], {
            deliveryId: DELIVERY_B,
            status: "BOOKED",
            revision: "1",
          }),
        },
      });
    postDeliveryCommand.mockResolvedValue({ ok: true, status: 200, data: { result: {} } });

    render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    await waitFor(() => expect(screen.getByTestId("delivery-handoff-reference")).toBeInTheDocument());
    expect(screen.getByTestId("operations-delivery-panel")).toHaveAttribute(
      "data-delivery-id",
      DELIVERY_ID,
    );
    await user.type(screen.getByTestId("delivery-handoff-reference"), "handoff-for-d1");
    await user.click(screen.getByTestId("delivery-confirm-pickup"));
    await waitFor(() =>
      expect(screen.getByTestId("operations-delivery-panel")).toHaveAttribute(
        "data-delivery-id",
        DELIVERY_B,
      ),
    );
    expect(screen.getByTestId("delivery-handoff-reference")).toHaveValue("");
    expect(screen.queryByTestId("delivery-consequence-dialog")).not.toBeInTheDocument();
  });

  it("ignores stale load responses after Order change", async () => {
    let resolveA: ((value: unknown) => void) | undefined;
    const loadA = new Promise((resolve) => {
      resolveA = resolve;
    });
    getWorkforceDelivery.mockImplementation((orderId: unknown) => {
      if (orderId === ORDER_ID) {
        return loadA.then(() => ({
          ok: true,
          status: 200,
          data: {
            delivery: detail(["CONFIRM_DELIVERY"], {
              orderId: ORDER_ID,
              deliveryId: DELIVERY_ID,
            }),
          },
        }));
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        data: {
          delivery: detail(["CONFIRM_PICKUP"], {
            orderId: ORDER_B,
            deliveryId: DELIVERY_B,
            status: "BOOKED",
          }),
        },
      });
    });

    const { rerender } = render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    rerender(<OperationsDeliveryPanel orderId={ORDER_B} />);
    await waitFor(() => expect(screen.getByTestId("delivery-confirm-pickup")).toBeInTheDocument());
    expect(screen.getByTestId("operations-delivery-panel")).toHaveAttribute(
      "data-order-id",
      ORDER_B,
    );

    await act(async () => {
      resolveA?.(undefined);
    });
    // Stale ORDER_A payload must not overwrite ORDER_B panel.
    await waitFor(() => expect(screen.getByTestId("delivery-confirm-pickup")).toBeInTheDocument());
    expect(screen.queryByTestId("delivery-confirm-delivery")).not.toBeInTheDocument();
    expect(screen.getByTestId("operations-delivery-panel")).toHaveAttribute(
      "data-delivery-id",
      DELIVERY_B,
    );
  });

  it("does not apply a stale command response after Order change", async () => {
    const user = userEvent.setup();
    let resolvePost: ((value: unknown) => void) | undefined;
    const postPending = new Promise((resolve) => {
      resolvePost = resolve;
    });
    getWorkforceDelivery.mockImplementation(async (orderId: unknown) => ({
      ok: true,
      status: 200,
      data: {
        delivery: detail(["CONFIRM_PICKUP"], {
          orderId: String(orderId),
          deliveryId: orderId === ORDER_B ? DELIVERY_B : DELIVERY_ID,
          status: "BOOKED",
        }),
      },
    }));
    postDeliveryCommand.mockImplementationOnce(() => postPending);

    const { rerender } = render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    await waitFor(() => expect(screen.getByTestId("delivery-handoff-reference")).toBeInTheDocument());
    await user.type(screen.getByTestId("delivery-handoff-reference"), "handoff-a");
    await user.click(screen.getByTestId("delivery-confirm-pickup"));

    rerender(<OperationsDeliveryPanel orderId={ORDER_B} />);
    await waitFor(() =>
      expect(screen.getByTestId("operations-delivery-panel")).toHaveAttribute(
        "data-order-id",
        ORDER_B,
      ),
    );
    expect(screen.getByTestId("delivery-handoff-reference")).toHaveValue("");

    await act(async () => {
      resolvePost?.({ ok: true, status: 200, data: { result: {} } });
    });
    // Stale success must not leave ORDER_B showing "Updated." from ORDER_A command.
    await waitFor(() =>
      expect(screen.getByTestId("operations-delivery-panel")).toHaveAttribute(
        "data-order-id",
        ORDER_B,
      ),
    );
    expect(screen.queryByText("Updated.")).not.toBeInTheDocument();
    expect(postDeliveryCommand).toHaveBeenCalledWith(
      ORDER_ID,
      "confirm-pickup",
      expect.objectContaining({ deliveryId: DELIVERY_ID }),
    );
  });

  it("dismisses a pending dialog when it no longer matches the active Delivery", async () => {
    const user = userEvent.setup();
    getWorkforceDelivery.mockResolvedValue({
      ok: true,
      status: 200,
      data: { delivery: detail(["CONFIRM_DELIVERY"]) },
    });
    render(<OperationsDeliveryPanel orderId={ORDER_ID} />);
    await waitFor(() => expect(screen.getByTestId("delivery-proof-reference")).toBeInTheDocument());
    await user.type(screen.getByTestId("delivery-proof-reference"), "pod-1");
    await user.click(screen.getByTestId("delivery-confirm-delivery"));
    expect(await screen.findByTestId("delivery-consequence-dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.queryByTestId("delivery-consequence-dialog")).not.toBeInTheDocument();
    expect(postDeliveryCommand).not.toHaveBeenCalled();
  });
});
