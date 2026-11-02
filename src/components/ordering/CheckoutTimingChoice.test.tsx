/**
 * AC-036I-021 / AC-036I-052 — keyboard, name, selected state, error association.
 * LANG-1 — scheduled Delivery presents "Delivery window", not backend fulfilment vocabulary.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { CheckoutTimingChoice } from "@/components/ordering/CheckoutTimingChoice";
import type { CommerceScheduledWindow } from "@/lib/customer-commerce";

const WINDOW: CommerceScheduledWindow = {
  startAt: "2026-09-25T12:30:00.000Z",
  endAt: "2026-09-25T13:00:00.000Z",
  localDate: "2026-09-25",
  day: "TODAY",
  timeZone: "Asia/Kolkata",
  label: "18:00–18:30",
};

function renderDeliveryScheduled(
  overrides: Partial<ComponentProps<typeof CheckoutTimingChoice>> = {},
) {
  const onSelectAsap = vi.fn();
  const onSelectWindow = vi.fn();
  const view = render(
    <CheckoutTimingChoice
      pending={false}
      loading={false}
      mode="DELIVERY"
      selectedTiming="SCHEDULED"
      selectedWindowStart={WINDOW.startAt}
      windows={[WINDOW]}
      availability="AVAILABLE"
      message={null}
      timeZone="Asia/Kolkata"
      cancellationCutoffMinutes={60}
      onSelectAsap={onSelectAsap}
      onSelectWindow={onSelectWindow}
      {...overrides}
    />,
  );
  return { ...view, onSelectAsap, onSelectWindow };
}

describe("CheckoutTimingChoice accessibility", () => {
  it("LANG-1: scheduled Delivery uses Delivery window, not arrival / fulfilment window", () => {
    renderDeliveryScheduled();

    expect(screen.getByText("Delivery window")).toBeInTheDocument();
    expect(
      screen.getByText(/choose as soon as possible, or a delivery window/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/arrival \/ fulfilment window/i)).not.toBeInTheDocument();
    expect(screen.getByText(/times use Asia\/Kolkata/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /today 18:00–18:30 Asia\/Kolkata/i })).toHaveTextContent(
      "18:00–18:30",
    );
    expect(screen.getByTestId("checkout-timing-cutoff")).toHaveTextContent(
      /self-service cancellation for this scheduled order closes 60 minutes/i,
    );
  });

  it("exposes reachable named controls, selected state, and focus", async () => {
    const user = userEvent.setup();
    const { onSelectAsap } = renderDeliveryScheduled();

    expect(screen.getByText("Delivery window")).toBeInTheDocument();
    expect(screen.queryByText(/arrival \/ fulfilment window/i)).not.toBeInTheDocument();
    const asap = screen.getByRole("button", { name: /as soon as possible/i });
    const slot = screen.getByRole("button", { name: /today 18:00–18:30 Asia\/Kolkata/i });
    expect(asap).toHaveAttribute("aria-pressed", "false");
    expect(slot).toHaveAttribute("aria-pressed", "true");
    expect(asap).not.toBeDisabled();
    expect(slot).not.toBeDisabled();

    await user.tab();
    expect(asap).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelectAsap).toHaveBeenCalled();
    asap.blur();
    slot.focus();
    expect(slot).toHaveFocus();
  });

  it("preserves ASAP pressed state and disables controls while pending", () => {
    renderDeliveryScheduled({
      pending: true,
      selectedTiming: "ASAP",
      selectedWindowStart: null,
    });

    const asap = screen.getByRole("button", { name: /as soon as possible/i });
    const slot = screen.getByRole("button", { name: /today 18:00–18:30 Asia\/Kolkata/i });
    expect(asap).toHaveAttribute("aria-pressed", "true");
    expect(asap).toBeDisabled();
    expect(slot).toHaveAttribute("aria-pressed", "false");
    expect(slot).toBeDisabled();
  });

  it("associates validation text and does not rely on colour alone", () => {
    render(
      <CheckoutTimingChoice
        pending={false}
        loading={false}
        mode="PICKUP"
        selectedTiming={null}
        selectedWindowStart={null}
        windows={[]}
        availability="NO_TIMES"
        message="No scheduled times are available right now."
        timeZone="Asia/Kolkata"
        cancellationCutoffMinutes={null}
        errorId="timing-error"
        errorMessage="Choose a time that is still available."
        onSelectAsap={() => undefined}
        onSelectWindow={() => undefined}
      />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/check this time/i);
    expect(alert.id).toBe("timing-error");
    expect(screen.getByRole("group", { name: /when should we fulfil/i })).toHaveAttribute(
      "aria-describedby",
      "timing-error",
    );
    expect(screen.getByTestId("checkout-timing-empty")).toHaveTextContent(/no scheduled times/i);
    expect(screen.getByText("Pickup window")).toBeInTheDocument();
    expect(screen.getByText(/choose as soon as possible, or a pickup window/i)).toBeInTheDocument();
    expect(screen.queryByText(/delivery window/i)).not.toBeInTheDocument();
  });

  it("uses a stacked mobile-first layout with visible focus classes", () => {
    render(
      <CheckoutTimingChoice
        pending={false}
        loading
        mode="PICKUP"
        selectedTiming="ASAP"
        selectedWindowStart={null}
        windows={[]}
        availability={null}
        message={null}
        timeZone={null}
        cancellationCutoffMinutes={null}
        onSelectAsap={() => undefined}
        onSelectWindow={() => undefined}
      />,
    );
    expect(screen.getByTestId("checkout-timing-choice").className).toContain("flex-col");
    expect(screen.getByTestId("checkout-timing-asap").className).toContain("min-h-11");
    expect(screen.getByTestId("checkout-timing-loading")).toBeInTheDocument();
    expect(screen.getByText("Pickup window")).toBeInTheDocument();
  });
});
