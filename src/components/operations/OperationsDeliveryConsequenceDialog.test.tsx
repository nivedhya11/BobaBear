import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OperationsDeliveryConsequenceDialog } from "./OperationsDeliveryConsequenceDialog";

describe("OperationsDeliveryConsequenceDialog", () => {
  it("names the dialog and shows order/delivery identity for wrong-order review", () => {
    render(
      <OperationsDeliveryConsequenceDialog
        action="confirm-delivery"
        orderId="order-aaa"
        deliveryId="delivery-bbb"
        deliveryStatus="Picked up"
        summaryLines={["Proof reference: pod-1"]}
        pending={false}
        onConfirm={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "Confirm delivery?" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveTextContent("order-aaa");
    expect(dialog).toHaveTextContent("delivery-bbb");
    expect(dialog).toHaveTextContent("not verified external-provider evidence");
  });

  it("does not dismiss on Escape while pending", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <OperationsDeliveryConsequenceDialog
        action="cancel"
        orderId="order-aaa"
        deliveryId="delivery-bbb"
        deliveryStatus="Booked"
        summaryLines={[]}
        pending={true}
        onConfirm={vi.fn()}
        onDismiss={onDismiss}
      />,
    );
    await user.keyboard("{Escape}");
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("keeps Tab focus inside the dialog shell while pending", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button" data-testid="outside-control">
          Outside
        </button>
        <OperationsDeliveryConsequenceDialog
          action="confirm-delivery"
          orderId="order-aaa"
          deliveryId="delivery-bbb"
          deliveryStatus="Picked up"
          summaryLines={["Proof reference: pod-1"]}
          pending={true}
          onConfirm={vi.fn()}
          onDismiss={vi.fn()}
        />
      </div>,
    );
    const dialog = screen.getByTestId("delivery-consequence-dialog");
    expect(dialog).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(dialog).toHaveFocus();
    expect(screen.getByTestId("outside-control")).not.toHaveFocus();
  });
});
