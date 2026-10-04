/**
 * Complimentary-item authoring validation (IMP-036J T6).
 *
 * Exact operator-specified Catalog product + variant. Uses the same
 * customer-effective Catalog publication authority as Checkout. Rejects
 * bundles, required customer/modifier choice (effective min total > 0), and
 * incomplete or unresolvable identity. Does not author a gift catalogue.
 * Optional paid modifiers are allowed because the granted gift line carries
 * zero modifier selections.
 */
import { and, eq, ne } from "drizzle-orm";

import {
  catalogBundleGroupsTable,
  catalogProductsTable,
  catalogVariantModifierGroupsTable,
  catalogVariantsTable,
} from "../../platform/database/schema/catalog";
import {
  loadEffectiveProductContent,
  loadEffectiveVariantContent,
  loadEffectiveVariantModifierGroupContent,
} from "../catalog/revisions";
import type { PersistenceTransactionContext } from "../persistence/types";
import { PromotionAdminError } from "./errors";
import { COPY_OP_GIFT_INVALID } from "../../shared/promotions/operator-copy";

function giftInvalid(field: string): never {
  throw new PromotionAdminError("PROMOTION_COMPLIMENTARY_INVALID", COPY_OP_GIFT_INVALID, {
    field,
  });
}

export async function assertComplimentaryAuthoringSafe(
  context: PersistenceTransactionContext,
  input: {
    brandId: string;
    complimentaryProductId: string | null | undefined;
    complimentaryVariantId: string | null | undefined;
  },
): Promise<{ productId: string; variantId: string }> {
  if (
    typeof input.complimentaryProductId !== "string" ||
    input.complimentaryProductId.length === 0
  ) {
    giftInvalid("complimentaryProductId");
  }
  if (
    typeof input.complimentaryVariantId !== "string" ||
    input.complimentaryVariantId.length === 0
  ) {
    giftInvalid("complimentaryVariantId");
  }
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(input.complimentaryProductId)) {
    giftInvalid("complimentaryProductId");
  }
  if (!UUID_RE.test(input.complimentaryVariantId)) {
    giftInvalid("complimentaryVariantId");
  }
  const productId = input.complimentaryProductId;
  const variantId = input.complimentaryVariantId;

  const [product] = await context.db
    .select()
    .from(catalogProductsTable)
    .where(eq(catalogProductsTable.id, productId))
    .limit(1);
  if (!product || product.brandId !== input.brandId) {
    giftInvalid("complimentaryProductId");
  }
  if (product.productKind === "bundle") {
    giftInvalid("complimentaryProductId");
  }
  // Customer-effective publication only — staged activation (active + null
  // effective) is unpublished; staged retirement (retired + effective set)
  // remains customer-effective until publication changes.
  const productEffective = await loadEffectiveProductContent(context, product);
  if (!productEffective || product.effectiveContentRevision == null) {
    giftInvalid("complimentaryProductId");
  }

  const [variant] = await context.db
    .select()
    .from(catalogVariantsTable)
    .where(eq(catalogVariantsTable.id, variantId))
    .limit(1);
  if (
    !variant ||
    variant.brandId !== input.brandId ||
    variant.productId !== productId
  ) {
    giftInvalid("complimentaryVariantId");
  }
  if (variant.productKind === "bundle") {
    giftInvalid("complimentaryVariantId");
  }
  const variantEffective = await loadEffectiveVariantContent(context, variant);
  if (!variantEffective || variant.effectiveContentRevision == null) {
    giftInvalid("complimentaryVariantId");
  }

  const bundleGroups = await context.db
    .select({ id: catalogBundleGroupsTable.id })
    .from(catalogBundleGroupsTable)
    .where(
      and(
        eq(catalogBundleGroupsTable.bundleVariantId, variantId),
        ne(catalogBundleGroupsTable.lifecycleStatus, "retired"),
      ),
    )
    .limit(1);
  if (bundleGroups[0]) {
    giftInvalid("complimentaryVariantId");
  }

  // Required-choice truth comes from effective published VMG content, not
  // staged mutable min totals. Optional groups (effective min total = 0) are
  // safe because the gift line grants zero modifier selections.
  const modifierLinks = await context.db
    .select()
    .from(catalogVariantModifierGroupsTable)
    .where(
      and(
        eq(catalogVariantModifierGroupsTable.brandId, input.brandId),
        eq(catalogVariantModifierGroupsTable.variantId, variantId),
      ),
    );
  for (const link of modifierLinks) {
    const effective = await loadEffectiveVariantModifierGroupContent(context, link);
    if (!effective || effective.lifecycleStatus !== "active") {
      continue;
    }
    if (effective.minTotalQuantity >= 1) {
      giftInvalid("complimentaryVariantId");
    }
  }

  return { productId, variantId };
}
