import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  COMPLIMENTARY_STRUCTURE,
  EVIDENCE_SCENARIOS,
  GROSS_FIGURE_ABSENT,
  OBSERVED_COUPON_DELIVERY,
  OBSERVED_ZERO_DISCOUNT,
  PICKUP_STRUCTURE,
  PricePresentationComparison,
  STACKED_STRUCTURE,
  evidenceStyles,
} from "./gtm-385-price-presentation-evidence";

function renderScenario(
  scenario: (typeof EVIDENCE_SCENARIOS)[number],
  widthPx: number,
) {
  return render(
    <>
      <style>{evidenceStyles}</style>
      <PricePresentationComparison scenario={scenario} widthPx={widthPx} />
    </>,
  );
}

function optionElement(scenarioId: string, which: "A" | "B"): HTMLElement {
  const node = document.querySelector(
    `[data-scenario="${scenarioId}"][data-option="${which}"]`,
  );
  if (!(node instanceof HTMLElement)) throw new Error(`missing ${which} ${scenarioId}`);
  return node;
}

function option(scenarioId: string, which: "A" | "B") {
  return within(optionElement(scenarioId, which));
}

describe("IMP-036J #385 price presentation evidence", () => {
  it("labels the observed net line After discount and keeps summary rows distinct at 390px", () => {
    renderScenario(OBSERVED_COUPON_DELIVERY, 390);
    const b = option("observed-coupon-delivery", "B");
    expect(b.getByText("After discount")).toBeVisible();
    expect(b.getByText("After discount")).not.toHaveAttribute("aria-hidden", "true");
    expect(b.getByText("₹466.20")).toBeVisible();
    expect(b.getByRole("list", { name: "Your items" })).toHaveTextContent(
      "2 × Purple Rain Taro Boba",
    );
    expect(b.getByTestId("summary-subtotal")).toHaveTextContent("Subtotal");
    expect(b.getByTestId("summary-subtotal")).toHaveTextContent("₹518.00");
    expect(b.getByTestId("summary-order-saving")).toHaveTextContent("Order saving");
    expect(b.getByTestId("summary-order-saving")).toHaveTextContent("₹51.80");
    expect(b.getByTestId("summary-packaging")).toHaveTextContent("Packaging");
    expect(b.getByTestId("summary-packaging")).toHaveTextContent("₹20.00");
    expect(b.getByTestId("summary-payable")).toHaveTextContent("Total payable");
    expect(b.getByTestId("summary-payable")).toHaveTextContent("₹486.20");
    expect(b.queryByTestId("summary-tax")).not.toBeInTheDocument();
    expect(b.queryByTestId("summary-delivery-saving")).not.toBeInTheDocument();
    const section = optionElement("observed-coupon-delivery", "B");
    expect(section).toHaveAttribute("data-width", "390");
    expect(section).toHaveAccessibleName(
      "Option B, net item price labelled After discount",
    );
    const items = b.getByRole("list", { name: "Your items" });
    const priceSummary = b.getByRole("list", { name: "Price summary" });
    expect(priceSummary).toBeTruthy();
    expect(
      items.compareDocumentPosition(priceSummary!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows the same observed words at desktop width", () => {
    renderScenario(OBSERVED_COUPON_DELIVERY, 1280);
    const b = option("observed-coupon-delivery", "B");
    expect(b.getByText("After discount")).toBeVisible();
    expect(b.getByText("₹486.20")).toBeVisible();
    expect(optionElement("observed-coupon-delivery", "B")).toHaveAttribute("data-width", "1280");
  });

  it("shows Option A gross equal to the observed Subtotal and does not label the item After discount", () => {
    renderScenario(OBSERVED_COUPON_DELIVERY, 390);
    const a = option("observed-coupon-delivery", "A");
    expect(a.queryByText("After discount")).not.toBeInTheDocument();
    expect(a.getAllByText("₹518.00").length).toBeGreaterThanOrEqual(2);
    expect(a.getByText("₹51.80")).toBeVisible();
    expect(a.getByText("₹486.20")).toBeVisible();
    expect(a.queryByText("₹466.20")).not.toBeInTheDocument();
  });

  it("does not say After discount when the observed item already matches Subtotal", () => {
    renderScenario(OBSERVED_ZERO_DISCOUNT, 390);
    const b = option("observed-zero-discount", "B");
    expect(b.queryByText("After discount")).not.toBeInTheDocument();
    expect(b.getAllByText("₹518.00").length).toBeGreaterThanOrEqual(1);
    expect(b.getByText("₹538.00")).toBeVisible();
    expect(b.queryByTestId("summary-order-saving")).not.toBeInTheDocument();
  });

  it("omits delivery rows on the pickup structure and invents no prices", () => {
    renderScenario(PICKUP_STRUCTURE, 390);
    const b = option("pickup-structure", "B");
    expect(b.queryByTestId("summary-delivery")).not.toBeInTheDocument();
    expect(b.queryByTestId("summary-delivery-saving")).not.toBeInTheDocument();
    expect(b.queryByText(/₹/)).not.toBeInTheDocument();
    expect(b.getByText(/No pickup prices were observed/)).toBeVisible();
  });

  it("keeps complimentary at Included with your offer and refuses a fabricated gross", () => {
    renderScenario(COMPLIMENTARY_STRUCTURE, 1280);
    const b = option("complimentary-structure", "B");
    expect(b.getByText("Included with your offer")).toBeVisible();
    expect(b.getByText("₹0.00")).toBeVisible();
    expect(b.queryByText("After discount")).not.toBeInTheDocument();
    const a = option("complimentary-structure", "A");
    expect(a.getByText(GROSS_FIGURE_ABSENT)).toBeVisible();
    expect(a.queryByText("₹0.00")).not.toBeInTheDocument();
  });

  it("does not invent stacked discount amounts", () => {
    renderScenario(STACKED_STRUCTURE, 390);
    const b = option("stacked-structure", "B");
    expect(b.queryByText(/₹/)).not.toBeInTheDocument();
    expect(b.queryByText("After discount")).not.toBeInTheDocument();
    expect(b.getByText(/does not label the item/)).toBeVisible();
    expect(screen.getByText(STACKED_STRUCTURE.title)).toBeVisible();
  });
});
