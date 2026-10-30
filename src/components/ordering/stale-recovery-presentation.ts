/**
 * Truthful stale-checkout recovery presentation (IMP-036J #391A).
 * Presentation only — not payment, pricing, or snapshot authority.
 */

import { IMP036J_COPY } from "@/components/ordering/imp036j-copy";

export type StaleRecoveryTrigger =
  | "CHECKOUT_REPRICED"
  | "CHECKOUT_CART_CHANGED"
  | "UNKNOWN";

export type StaleRecoveryPresentationKind =
  | "amount_changed"
  | "amount_unchanged"
  | "cart_changed"
  | "unknown";

export type StaleRecoveryPresentation = Readonly<{
  kind: StaleRecoveryPresentationKind;
  message: string;
  /**
   * When false, Review must not present a prior quote as the current payable
   * and must not enable Continue to payment on that unconfirmed state.
   */
  showFreshPayableAsCurrent: boolean;
}>;

/** Accept only integer paise digit strings; reject unsafe coercion. */
export function parseAuthoritativePaiseString(
  value: string | null | undefined,
): bigint | null {
  if (value == null || value === "") return null;
  if (!/^-?\d+$/.test(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export function compareAuthoritativePayablePaise(
  priorGrandTotalPaise: string | null | undefined,
  freshGrandTotalPaise: string | null | undefined,
): "equal" | "changed" | "unknown" {
  const prior = parseAuthoritativePaiseString(priorGrandTotalPaise);
  const fresh = parseAuthoritativePaiseString(freshGrandTotalPaise);
  if (prior === null || fresh === null) return "unknown";
  return prior === fresh ? "equal" : "changed";
}

export function normalizeStaleRecoveryTrigger(
  code: string | undefined,
): StaleRecoveryTrigger {
  if (code === "CHECKOUT_REPRICED" || code === "CHECKOUT_CART_CHANGED") {
    return code;
  }
  return "UNKNOWN";
}

/**
 * Decide customer-facing recovery copy from authoritative before/after payables
 * and the payment-start failure trigger. Never infers money change from the
 * error code alone.
 */
export function decideStaleRecoveryPresentation(input: {
  trigger: string | undefined;
  priorGrandTotalPaise: string | null | undefined;
  freshGrandTotalPaise: string | null | undefined;
  freshSnapshotConfirmed: boolean;
}): StaleRecoveryPresentation {
  const trigger = normalizeStaleRecoveryTrigger(input.trigger);

  if (trigger === "CHECKOUT_CART_CHANGED") {
    return Object.freeze({
      kind: "cart_changed" as const,
      message: IMP036J_COPY.STALE_CART_CHANGED,
      showFreshPayableAsCurrent: input.freshSnapshotConfirmed,
    });
  }

  if (!input.freshSnapshotConfirmed) {
    return Object.freeze({
      kind: "unknown" as const,
      message: IMP036J_COPY.STALE_UNCONFIRMED,
      showFreshPayableAsCurrent: false,
    });
  }

  if (trigger !== "CHECKOUT_REPRICED") {
    return Object.freeze({
      kind: "unknown" as const,
      message: IMP036J_COPY.STALE_UNCONFIRMED,
      showFreshPayableAsCurrent: true,
    });
  }

  const comparison = compareAuthoritativePayablePaise(
    input.priorGrandTotalPaise,
    input.freshGrandTotalPaise,
  );

  if (comparison === "changed") {
    return Object.freeze({
      kind: "amount_changed" as const,
      // Approved Design Readiness COPY-STALE — genuine monetary change only.
      message: IMP036J_COPY.STALE,
      showFreshPayableAsCurrent: true,
    });
  }

  return Object.freeze({
    kind: comparison === "equal" ? ("amount_unchanged" as const) : ("unknown" as const),
    message: IMP036J_COPY.STALE_UNCONFIRMED,
    showFreshPayableAsCurrent: true,
  });
}
