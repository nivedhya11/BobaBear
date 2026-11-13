/**
 * Resolve which Payment id Checkout should resume.
 *
 * Server `openPaymentId` is authoritative when present (ownership-enforced).
 * Browser recovery storage is a convenience cache only and must match the
 * current checkout; mismatched or missing storage must not trap the customer.
 */

export type ResumePaymentRecoveryRef = Readonly<{
  paymentId: string;
  checkoutId: string;
  checkoutRevision?: string;
}>;

export function resolveResumePaymentId(input: {
  checkoutId: string;
  openPaymentId?: string | null;
  recovery: ResumePaymentRecoveryRef | null;
}): string | null {
  const open = typeof input.openPaymentId === "string" ? input.openPaymentId.trim() : "";
  if (open.length > 0) {
    return open;
  }
  if (
    input.recovery &&
    input.recovery.checkoutId === input.checkoutId &&
    typeof input.recovery.paymentId === "string" &&
    input.recovery.paymentId.trim().length > 0
  ) {
    return input.recovery.paymentId;
  }
  return null;
}
