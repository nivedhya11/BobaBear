/**
 * Names the merchandise line the server already identified.
 * Presentation only — does not decide availability, price, or cart contents.
 */

import { commerceErrorCopy } from "@/components/ordering/error-copy";
import { CHECKOUT_MERCHANDISE_PROBLEM_CODES } from "@/shared/checkout/constants";

export type CheckoutMerchandiseProblemLine = Readonly<{
  cartLineId: string;
  code: string;
}>;

export type NamedCheckoutCartLine = Readonly<{
  cartLineId: string;
  itemName: string;
}>;

export type CheckoutItemAttention = Readonly<{
  key: string;
  cartLineId: string;
  itemName: string | null;
  message: string;
}>;

const MERCHANDISE_CODES = new Set<string>(CHECKOUT_MERCHANDISE_PROBLEM_CODES);

const RECOVERY_COPY =
  "Return to your cart to change or remove it. Other items stay in your cart.";

export function namedCartLinesForCheckout(input: {
  cart?: Readonly<{
    lines: readonly Readonly<{ id: string; variantId: string }>[];
  }> | null;
  catalog?: Readonly<{
    items: readonly Readonly<{ variantId: string; name: string }>[];
  }> | null;
  snapshotLines?: readonly unknown[] | null;
}): readonly NamedCheckoutCartLine[] {
  const byId = new Map<string, string>();
  if (input.cart && input.catalog) {
    const byVariant = new Map(input.catalog.items.map((item) => [item.variantId, item.name]));
    for (const line of input.cart.lines) {
      const name = byVariant.get(line.variantId);
      if (name) byId.set(line.id, name);
    }
  }
  for (const raw of input.snapshotLines ?? []) {
    if (typeof raw !== "object" || raw === null) continue;
    const row = raw as Record<string, unknown>;
    const cartLineId = row.sourceCartLineId;
    const itemName = row.productName;
    if (typeof cartLineId !== "string" || cartLineId.length === 0) continue;
    if (typeof itemName !== "string" || itemName.length === 0) continue;
    byId.set(cartLineId, itemName);
  }
  return Object.freeze(
    [...byId].map(([cartLineId, itemName]) => Object.freeze({ cartLineId, itemName })),
  );
}

export function presentCheckoutItemAttention(
  problems: readonly CheckoutMerchandiseProblemLine[] | undefined,
  lines: readonly NamedCheckoutCartLine[],
): readonly CheckoutItemAttention[] {
  if (!problems || problems.length === 0) return Object.freeze([]);
  const names = new Map(lines.map((line) => [line.cartLineId, line.itemName]));
  const seen = new Set<string>();
  const attention: CheckoutItemAttention[] = [];
  for (const problem of problems) {
    if (!MERCHANDISE_CODES.has(problem.code) || problem.cartLineId.length === 0) continue;
    const key = `${problem.cartLineId}:${problem.code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const itemName = names.get(problem.cartLineId) ?? null;
    const generic = commerceErrorCopy(problem.code);
    attention.push(
      Object.freeze({
        key,
        cartLineId: problem.cartLineId,
        itemName,
        message: itemName ? `${itemName}: ${generic}` : generic,
      }),
    );
  }
  return Object.freeze(attention);
}

export function presentCheckoutFailureCopy(
  failure: Readonly<{
    code?: string;
    problems?: readonly CheckoutMerchandiseProblemLine[];
  }>,
  lines: readonly NamedCheckoutCartLine[],
): string {
  const attention = presentCheckoutItemAttention(failure.problems, lines);
  if (attention.length === 0) return commerceErrorCopy(failure.code);
  return [...attention.map((entry) => entry.message), RECOVERY_COPY].join(" ");
}

export const CHECKOUT_ITEM_ATTENTION_RECOVERY_COPY = RECOVERY_COPY;
