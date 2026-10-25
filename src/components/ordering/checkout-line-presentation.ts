/**
 * Safe narrowing for checkout snapshot line rows (client presentation).
 */

export type CheckoutSnapshotLineRow = Readonly<{
  productName: string;
  variantName: string;
  quantity: number;
  lineTotalPaise: string;
  lineOrigin?: "cart" | "complimentary_offer";
  /**
   * Sealed checkout line already carries `linePromotionDiscountPaise`: the
   * merchandise-component allocation (base, modifier, bundle). Delivery-charge
   * allocations are not in that field. Positive means a merchandise discount
   * was attributed to this line. The amount is not shown and is not subtracted
   * from `lineTotalPaise` — those figures do not share tax semantics.
   */
  merchandiseDiscountApplies: boolean;
}>;

const POSITIVE_INTEGER_PAISE = /^[1-9][0-9]*$/;

/**
 * Fail closed. A missing, zero, or non-wire value does not mean "discounted".
 * Complimentary lines are already presented as included.
 */
export function sealedMerchandiseDiscountApplies(raw: Record<string, unknown>): boolean {
  if (raw.lineOrigin === "complimentary_offer") return false;
  return (
    typeof raw.linePromotionDiscountPaise === "string" &&
    POSITIVE_INTEGER_PAISE.test(raw.linePromotionDiscountPaise)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function narrowCheckoutSnapshotLines(
  lines: readonly unknown[],
): readonly CheckoutSnapshotLineRow[] {
  const rows: CheckoutSnapshotLineRow[] = [];
  for (const raw of lines) {
    if (!isRecord(raw)) continue;
    const productName = typeof raw.productName === "string" ? raw.productName : null;
    const variantName = typeof raw.variantName === "string" ? raw.variantName : "";
    const quantity = typeof raw.quantity === "number" ? raw.quantity : null;
    const lineTotalPaise =
      typeof raw.lineTotalPaise === "string"
        ? raw.lineTotalPaise
        : typeof raw.lineTotalMinor === "string"
          ? raw.lineTotalMinor
          : null;
    if (!productName || quantity === null || !lineTotalPaise) continue;
    rows.push(
      Object.freeze({
        productName,
        variantName,
        quantity,
        lineTotalPaise,
        lineOrigin:
          raw.lineOrigin === "complimentary_offer" ? "complimentary_offer" : "cart",
        merchandiseDiscountApplies: sealedMerchandiseDiscountApplies(raw),
      }),
    );
  }
  return Object.freeze(rows);
}
