"use client";

import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/Button";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type DeliveryConsequenceAction =
  | "confirm-delivery"
  | "report-failure"
  | "cancel"
  | "resolve-manual-booking-failure"
  | "resolve-manual-booking-cancellation";

export type OperationsDeliveryConsequenceDialogProps = Readonly<{
  action: DeliveryConsequenceAction;
  orderId: string;
  deliveryId: string;
  deliveryStatus: string;
  summaryLines: readonly string[];
  pending: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}>;

function dialogTitle(action: DeliveryConsequenceAction): string {
  if (action === "confirm-delivery") return "Confirm delivery?";
  if (action === "report-failure") return "Report delivery failure?";
  if (action === "cancel") return "Cancel delivery?";
  if (action === "resolve-manual-booking-failure") return "Resolve booking failure?";
  return "Resolve booking cancellation?";
}

function consequenceCopy(action: DeliveryConsequenceAction): string {
  if (action === "confirm-delivery") {
    return "This marks the delivery as delivered. It advances delivery completion for this order and may notify the customer. Proof text entered here is operator-entered reference only — not verified external-provider evidence.";
  }
  if (action === "report-failure") {
    return "This reports delivery failure. It can terminalize the active delivery, block normal replacement until resolved rules allow it, and may notify the customer.";
  }
  if (action === "cancel") {
    return "This cancels the active delivery. Cancellation can terminalize the delivery record and may notify the customer. It does not by itself issue a refund.";
  }
  if (action === "resolve-manual-booking-failure") {
    return "This resolves an unknown booking outcome as failure. Operator acknowledgment of inactivity is required; it is not verified courier evidence.";
  }
  return "This resolves an unknown booking outcome as cancellation. Operator acknowledgment of inactivity is required; it is not verified courier evidence.";
}

function confirmLabel(action: DeliveryConsequenceAction): string {
  if (action === "confirm-delivery") return "Confirm delivery";
  if (action === "report-failure") return "Confirm report failure";
  if (action === "cancel") return "Confirm cancel delivery";
  if (action === "resolve-manual-booking-failure") return "Confirm resolve failure";
  return "Confirm resolve cancellation";
}

export function OperationsDeliveryConsequenceDialog(
  props: OperationsDeliveryConsequenceDialogProps,
) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const pendingRef = useRef(props.pending);

  useEffect(() => {
    pendingRef.current = props.pending;
  }, [props.pending]);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusables = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const initial = focusables();
    const preferred =
      initial.find((el) => el.getAttribute("data-dialog-primary") === "true") ?? initial[0];
    preferred?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (pendingRef.current) return;
        props.onDismiss();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open-scoped focus trap
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface,#fff)] p-6 shadow-xl"
        data-testid="delivery-consequence-dialog"
        data-delivery-consequence-action={props.action}
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {dialogTitle(props.action)}
        </h2>
        <p id={descriptionId} className="text-sm text-[var(--text-secondary)]">
          {consequenceCopy(props.action)}
        </p>
        <dl className="grid gap-1 text-sm">
          <div>
            <dt className="text-[var(--text-tertiary)]">Order</dt>
            <dd className="font-mono text-xs">{props.orderId}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-tertiary)]">Delivery</dt>
            <dd className="font-mono text-xs">{props.deliveryId}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-tertiary)]">Current status</dt>
            <dd>{props.deliveryStatus}</dd>
          </div>
        </dl>
        {props.summaryLines.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {props.summaryLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        {props.pending ? (
          <p aria-live="polite" className="text-sm text-[var(--text-secondary)]">
            Submitting…
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={props.pending} onClick={props.onDismiss}>
            Back
          </Button>
          <Button
            type="button"
            disabled={props.pending}
            aria-busy={props.pending}
            data-dialog-primary="true"
            data-testid="delivery-consequence-confirm"
            onClick={props.onConfirm}
          >
            {confirmLabel(props.action)}
          </Button>
        </div>
      </div>
    </div>
  );
}
