/**
 * Wire enrichment: attach ownership-scoped open Payment identity to Checkout JSON.
 *
 * Browser sessionStorage is not Payment authority (ARCH-G11). When Checkout is
 * PAYMENT_PENDING, the owning customer needs the server Payment id to resume
 * bounded reconciliation via existing getPaymentState.
 */
import "server-only";

import type { Checkout } from "../../../shared/checkout";
import type { Persistence } from "../../persistence";
import { findNonTerminalPaymentByCheckoutId } from "../../payment/repository";

export type CheckoutWithOpenPayment = Checkout &
  Readonly<{
    openPaymentId: string | null;
  }>;

export async function withOpenPaymentId(
  persistence: Persistence,
  checkout: Checkout | null,
): Promise<CheckoutWithOpenPayment | null> {
  if (!checkout) return null;
  if (checkout.status !== "PAYMENT_PENDING") {
    return Object.freeze({ ...checkout, openPaymentId: null });
  }
  const payment = await persistence.withContext((ctx) =>
    findNonTerminalPaymentByCheckoutId(ctx, checkout.id),
  );
  return Object.freeze({
    ...checkout,
    openPaymentId: payment?.id ?? null,
  });
}
