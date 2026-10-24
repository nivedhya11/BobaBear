/**
 * Canonical selection order for Checkout commercial inputs and sealed
 * Snapshots (IMP-021 / #391).
 *
 * Modifier and bundle selections have no persisted ordinal in either the Cart
 * or the Checkout Snapshot tables, so PostgreSQL row order on read is not
 * defined. This applies the Cart canonical order
 * (`src/shared/cart/canonicalize.ts`) so that positional structural equality
 * compares the same selections in the same order. It never adds, removes, or
 * alters a selection.
 */

import type { Cart } from "../../shared/cart";
import type { CheckoutSnapshot } from "../../shared/checkout";

type ModifierKey = Readonly<{
  variantModifierGroupId: string;
  modifierGroupOptionId: string;
  quantity: number;
}>;

type BundleKey = Readonly<{
  bundleGroupOptionId: string;
  quantity: number;
}>;

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareModifiers(a: ModifierKey, b: ModifierKey): number {
  return (
    compareId(a.variantModifierGroupId, b.variantModifierGroupId) ||
    compareId(a.modifierGroupOptionId, b.modifierGroupOptionId) ||
    a.quantity - b.quantity
  );
}

function compareBundles(a: BundleKey, b: BundleKey): number {
  return compareId(a.bundleGroupOptionId, b.bundleGroupOptionId) || a.quantity - b.quantity;
}

function sortedModifiers<T extends ModifierKey>(list: readonly T[]): readonly T[] {
  return Object.freeze([...list].sort(compareModifiers));
}

function sortedBundles<T extends BundleKey & { modifiers: readonly ModifierKey[] }>(
  list: readonly T[],
): readonly T[] {
  return Object.freeze(
    list
      .map((b) => Object.freeze({ ...b, modifiers: sortedModifiers(b.modifiers) }))
      .sort(compareBundles),
  );
}

export function withCanonicalCartSelectionOrder(cart: Cart): Cart {
  return Object.freeze({
    ...cart,
    lines: Object.freeze(
      cart.lines.map((line) =>
        Object.freeze({
          ...line,
          modifiers: sortedModifiers(line.modifiers),
          bundleSelections: sortedBundles(line.bundleSelections),
        }),
      ),
    ),
  });
}

export function withCanonicalSnapshotSelectionOrder(
  snapshot: CheckoutSnapshot,
): CheckoutSnapshot {
  return Object.freeze({
    ...snapshot,
    lines: Object.freeze(
      snapshot.lines.map((line) =>
        Object.freeze({
          ...line,
          modifiers: sortedModifiers(line.modifiers),
          bundleSelections: sortedBundles(line.bundleSelections),
        }),
      ),
    ),
  });
}
