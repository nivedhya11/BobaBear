"use client";

import { formatPaise } from "@/components/ordering/format-money";
import { IMP036J_COPY } from "@/components/ordering/imp036j-copy";
import type { CheckoutSnapshotLineRow } from "@/components/ordering/checkout-line-presentation";

export function CheckoutSnapshotLineList(props: {
  lines: readonly CheckoutSnapshotLineRow[];
  title?: string;
  /**
   * Checkout Review only. Payment and recovery reuse this list and keep the
   * unlabeled net.
   */
  showAfterDiscountLabel?: boolean;
}) {
  if (props.lines.length === 0) return null;
  return (
    <section
      className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-section)] p-4"
      data-testid="checkout-line-review"
      aria-label={props.title ?? "Your items"}
    >
      {props.title ? (
        <h2 className="mb-3 font-body text-[15px] font-semibold text-[var(--text-primary)]">
          {props.title}
        </h2>
      ) : null}
      <ul className="flex flex-col gap-2">
        {props.lines.map((line, index) => (
          <li
            key={`${line.productName}-${index}`}
            className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 font-body text-[14px]"
          >
            <span className="min-w-0 flex-1 break-words text-[var(--text-primary)]">
              {line.quantity} × {line.productName}
              {line.variantName ? ` (${line.variantName})` : ""}
              {line.lineOrigin === "complimentary_offer" ? (
                <span className="mt-1 block font-body text-[12px] text-[var(--text-secondary)]">
                  {IMP036J_COPY.INCLUDED}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-right text-[var(--text-primary)]">
              {props.showAfterDiscountLabel && line.merchandiseDiscountApplies ? (
                <span className="mb-0.5 block max-w-[7.5rem] text-[12px] font-normal leading-tight text-[var(--text-secondary)]">
                  {IMP036J_COPY.AFTER_DISCOUNT}
                </span>
              ) : null}
              <span className="font-semibold tabular-nums">{formatPaise(line.lineTotalPaise)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CheckoutStepIndicator(props: {
  activeStep: "fulfilment" | "review" | "payment";
  /** When known, labels the first step Delivery vs Pickup. */
  fulfilmentMode?: "DELIVERY" | "PICKUP" | null;
}) {
  const fulfilmentLabel =
    props.fulfilmentMode === "PICKUP"
      ? "Pickup"
      : props.fulfilmentMode === "DELIVERY"
        ? "Delivery"
        : "Fulfilment";
  const steps = [
    { id: "fulfilment" as const, label: fulfilmentLabel },
    { id: "review" as const, label: "Review" },
    { id: "payment" as const, label: "Payment" },
  ];
  const activeIndex = steps.findIndex((step) => step.id === props.activeStep);
  return (
    <nav aria-label="Checkout progress" data-testid="checkout-steps">
      <ol className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const reached = index <= activeIndex;
          return (
            <li
              key={step.id}
              className={`rounded-full px-3 py-1 font-body text-[12px] font-semibold ${
                reached
                  ? "bg-[var(--interactive-primary)] text-[var(--text-on-primary)]"
                  : "border border-[var(--border-default)] text-[var(--text-tertiary)]"
              }`}
              aria-current={step.id === props.activeStep ? "step" : undefined}
            >
              {step.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
