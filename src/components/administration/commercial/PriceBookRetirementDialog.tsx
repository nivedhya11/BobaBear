"use client";

import { useEffect, useId, useRef } from "react";

import { enterpriseFocusRingClass } from "@/components/enterprise/enterprise-tokens";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type PriceBookRetirementDialogProps = Readonly<{
  open: boolean;
  name: string;
  code: string;
  outletLabel: string | null;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}>;

export function PriceBookRetirementDialog(props: PriceBookRetirementDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(props.busy === true);

  useEffect(() => {
    busyRef.current = props.busy === true;
  }, [props.busy]);

  useEffect(() => {
    if (!props.open) return;
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
        if (busyRef.current) return;
        props.onCancel();
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
  }, [props.open]);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-lg border border-[var(--enterprise-border,#3D6026)] bg-[var(--enterprise-bg-panel,#22361A)] p-6 shadow-xl"
        data-testid="price-book-retirement-dialog"
      >
        <h2
          id={titleId}
          className="text-xl font-semibold text-[var(--enterprise-text-primary,#FAF3E2)]"
        >
          Retire price book
        </h2>

        <dl className="space-y-2 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-[var(--enterprise-text-secondary,#EBD9A6)]">Price book</dt>
            <dd className="font-medium text-[var(--enterprise-text-primary,#FAF3E2)]">{props.name}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-[var(--enterprise-text-secondary,#EBD9A6)]">Code</dt>
            <dd className="font-medium text-[var(--enterprise-text-primary,#FAF3E2)]">{props.code}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-[var(--enterprise-text-secondary,#EBD9A6)]">Scope</dt>
            <dd className="font-medium text-[var(--enterprise-text-primary,#FAF3E2)]">Outlet</dd>
          </div>
          {props.outletLabel ? (
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-[var(--enterprise-text-secondary,#EBD9A6)]">Outlet</dt>
              <dd className="font-medium text-[var(--enterprise-text-primary,#FAF3E2)]">
                {props.outletLabel}
              </dd>
            </div>
          ) : null}
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-[var(--enterprise-text-secondary,#EBD9A6)]">Lifecycle</dt>
            <dd className="font-medium text-[var(--enterprise-text-primary,#FAF3E2)]">Active</dd>
          </div>
        </dl>

        <div
          id={descriptionId}
          className="space-y-2 text-sm text-[var(--enterprise-text-secondary,#EBD9A6)]"
        >
          <p>
            Retiring this outlet price book stops it from participating in future effective price
            resolution. Pricing will resolve from the remaining eligible pricing hierarchy. If the
            remaining pricing authority is incomplete or invalid, customer pricing will continue to
            fail closed.
          </p>
          <p>This action cannot be reactivated through this control.</p>
        </div>

        {props.error ? (
          <p
            role="alert"
            data-testid="price-book-retirement-error"
            className="rounded-md border border-rose-500/50 bg-rose-950/45 px-3 py-2 text-sm text-rose-100"
          >
            {props.error}
          </p>
        ) : null}

        {props.busy ? (
          <p aria-live="polite" className="text-sm text-[var(--enterprise-muted,#C4D4A8)]">
            Retiring…
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={props.busy}
            className={cn(enterpriseFocusRingClass)}
            onClick={props.onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={props.busy}
            aria-busy={props.busy}
            data-dialog-primary="true"
            className={cn(enterpriseFocusRingClass)}
            onClick={props.onConfirm}
          >
            Retire price book
          </Button>
        </div>
      </div>
    </div>
  );
}
