/**
 * Extra disposable-catalog fixtures for the GTM browser journey harness.
 * Invoked only when E2E_GTM_UAT_FIXTURES=1. Not a production bootstrap.
 *
 * Modifier seeding mirrors accepted catalog/pricing fixture patterns used by
 * domain tests, but does not import tests/database/support/* (those modules
 * pull Vitest and break the tsx E2E seed path).
 */
import { randomBytes } from "node:crypto";

import { and, asc, eq, sql } from "drizzle-orm";

import { catalogContentRevisionsTable } from "../../src/platform/database/schema/catalog";
import { menusTable } from "../../src/platform/database/schema/menu";
import { requireWorkforcePrincipal } from "../../src/server/access-control";
import { includeBrandVariant } from "../../src/server/assortment";
import {
  activateModifierGroup,
  activateModifierGroupOption,
  activateModifierOption,
  activateProduct,
  activateVariant,
  activateVariantModifierGroup,
  addModifierOptionToGroup,
  applyModifierGroupToVariant,
  createModifierGroup,
  createModifierOption,
  createProduct,
  createVariant,
  publishCatalogContentChange,
} from "../../src/server/catalog";
import {
  activateMenuEntry,
  createMenuEntry,
  findMenuById,
  getBrandMenuInspection,
  publishMenuRevision,
} from "../../src/server/catalog/menu";
import type {
  Persistence,
  PersistenceTransactionContext,
} from "../../src/server/persistence/types";
import {
  activateCoupon,
  activatePromotion,
  createCouponDraft,
  createPromotionDraft,
  setPromotionBenefit,
  setPromotionTargets,
} from "../../src/server/promotions";
import { saveOutletSchedulingProfile } from "../../src/server/scheduled-fulfilment/foundations";
import { TAX_CATEGORY_RESTAURANT_SERVICE_ID } from "../../src/shared/pricing";

export const GTM_UAT_COUPON_CODE = "E2E10";
export const GTM_UAT_MODIFIER_ITEM_NAME = "GTM Custom Drink";
export const GTM_UAT_MODIFIER_OPTION_A = "Pearl";
export const GTM_UAT_MODIFIER_OPTION_B = "Jelly";

function uniqueCode(prefix: string): string {
  return `${prefix}-${randomBytes(3).toString("hex")}`;
}

type ActiveVariantWithModifier = Readonly<{
  productId: string;
  variantId: string;
  variantModifierGroupId: string;
  modifierGroupOptionId: string;
  modifierGroupId: string;
  modifierOptionId: string;
}>;

/**
 * Activation only stages a publication candidate; publish makes the graph
 * customer-effective (same pattern as cart-fixtures publishProductEnvelope).
 */
async function publishProductEnvelope(
  tx: PersistenceTransactionContext,
  input: Readonly<{ actor: unknown; brandId: string; productId: string }>,
): Promise<void> {
  const rows = await tx.db
    .select()
    .from(catalogContentRevisionsTable)
    .where(eq(catalogContentRevisionsTable.brandId, input.brandId))
    .limit(1);
  const envelope = rows[0];
  if (!envelope) throw new Error("missing brand content revision");
  await publishCatalogContentChange(tx, {
    actor: input.actor,
    brandId: input.brandId,
    productId: input.productId,
    expectedContentRevision: envelope.contentRevision,
  });
}

async function seedActiveVariantWithModifier(
  persistence: Persistence,
  brandId: string,
  actor: unknown,
  codePrefix: string,
): Promise<ActiveVariantWithModifier> {
  return persistence.transaction(async (tx) => {
    const product = await createProduct(tx, {
      actor,
      brandId,
      code: uniqueCode(`${codePrefix}-p`),
      name: GTM_UAT_MODIFIER_ITEM_NAME,
      productKind: "standard",
    });
    const variant = await createVariant(tx, {
      actor,
      productId: product.id,
      code: "default",
      name: "Default",
      isDefault: true,
      isSelectorVisible: false,
    });
    const group = await createModifierGroup(tx, {
      actor,
      brandId,
      code: uniqueCode(`${codePrefix}-g`),
      name: "Toppings",
    });
    const option = await createModifierOption(tx, {
      actor,
      brandId,
      code: uniqueCode(`${codePrefix}-o`),
      name: GTM_UAT_MODIFIER_OPTION_A,
    });
    const binding = await addModifierOptionToGroup(tx, {
      actor,
      modifierGroupId: group.id,
      modifierOptionId: option.id,
      minQuantity: 0,
      maxQuantity: 3,
      defaultQuantity: 0,
    });
    const vmg = await applyModifierGroupToVariant(tx, {
      actor,
      variantId: variant.id,
      modifierGroupId: group.id,
      minTotalQuantity: 0,
      maxTotalQuantity: 3,
    });
    await activateModifierOption(tx, { actor, modifierOptionId: option.id });
    await activateModifierGroupOption(tx, {
      actor,
      modifierGroupOptionId: binding.id,
    });
    await activateModifierGroup(tx, { actor, modifierGroupId: group.id });
    await activateVariantModifierGroup(tx, {
      actor,
      variantModifierGroupId: vmg.id,
    });
    await activateVariant(tx, { actor, variantId: variant.id });
    await activateProduct(tx, { actor, productId: product.id });
    await publishProductEnvelope(tx, { actor, brandId, productId: product.id });
    return {
      productId: product.id,
      variantId: variant.id,
      variantModifierGroupId: vmg.id,
      modifierGroupOptionId: binding.id,
      modifierGroupId: group.id,
      modifierOptionId: option.id,
    };
  });
}

async function seedSecondModifierOption(
  persistence: Persistence,
  brandId: string,
  actor: unknown,
  mod: ActiveVariantWithModifier,
): Promise<{ modifierGroupOptionId: string }> {
  return persistence.transaction(async (tx) => {
    const option = await createModifierOption(tx, {
      actor,
      brandId,
      code: uniqueCode("jelly"),
      name: GTM_UAT_MODIFIER_OPTION_B,
    });
    const binding = await addModifierOptionToGroup(tx, {
      actor,
      modifierGroupId: mod.modifierGroupId,
      modifierOptionId: option.id,
      minQuantity: 0,
      maxQuantity: 3,
      defaultQuantity: 0,
    });
    await activateModifierOption(tx, { actor, modifierOptionId: option.id });
    await activateModifierGroupOption(tx, {
      actor,
      modifierGroupOptionId: binding.id,
    });
    const envelope = (
      await tx.db
        .select()
        .from(catalogContentRevisionsTable)
        .where(eq(catalogContentRevisionsTable.brandId, brandId))
        .limit(1)
    )[0];
    if (!envelope) throw new Error("missing brand content revision for GTM modifier fixture");
    await publishCatalogContentChange(tx, {
      actor,
      brandId,
      productId: mod.productId,
      expectedContentRevision: envelope.contentRevision,
    });
    return { modifierGroupOptionId: binding.id };
  });
}

async function attachVariantPriceToActiveBrandBook(
  persistence: Persistence,
  args: Readonly<{ brandId: string; variantId: string; amountPaise: bigint }>,
): Promise<string> {
  const now = new Date("2026-01-01T00:00:00+05:30");
  return persistence.withContext(async (ctx) => {
    const book = await ctx.db.execute(sql`
      select id::text as id from app.price_books
      where brand_id = ${args.brandId}::uuid
        and scope_type = 'brand'
        and lifecycle_status = 'active'
      order by id
      limit 1
    `);
    const priceBookId = book.rows[0]?.id as string | undefined;
    if (!priceBookId) {
      throw new Error("GTM modifier fixture requires an active brand price book");
    }
    await ctx.db.execute(sql`
      insert into app.price_book_variant_prices (
        id, brand_id, price_book_id, variant_id, amount_paise,
        floor_paise, ceiling_paise,
        allow_territory_override, allow_organization_override, allow_outlet_override,
        tax_category_id, created_at
      ) values (
        gen_random_uuid(), ${args.brandId}::uuid, ${priceBookId}::uuid,
        ${args.variantId}::uuid, ${args.amountPaise},
        null, null, false, false, false,
        ${TAX_CATEGORY_RESTAURANT_SERVICE_ID}::uuid, ${now}
      )
    `);
    return priceBookId;
  });
}

async function seedModifierDeltaOnBook(
  persistence: Persistence,
  args: Readonly<{
    brandId: string;
    priceBookId: string;
    variantModifierGroupId: string;
    modifierGroupOptionId: string;
    priceDeltaPaise: bigint;
  }>,
): Promise<void> {
  const now = new Date("2026-01-01T00:00:00+05:30");
  await persistence.withContext(async (ctx) => {
    await ctx.db.execute(sql`
      insert into app.price_book_modifier_prices (
        id, brand_id, price_book_id, variant_modifier_group_id,
        modifier_group_option_id, price_delta_paise,
        allow_territory_override, allow_organization_override,
        allow_outlet_override, created_at
      ) values (
        gen_random_uuid(), ${args.brandId}::uuid, ${args.priceBookId}::uuid,
        ${args.variantModifierGroupId}::uuid, ${args.modifierGroupOptionId}::uuid,
        ${args.priceDeltaPaise}, false, false, false, ${now}
      )
    `);
  });
}

/**
 * Seeds one disposable multi-option customizable item onto the brand's single
 * active imported menu so the real customer browser can exercise modifier
 * selection-order continuity. Does not create a second active menu.
 */
async function seedSelectableModifierMenuItem(
  persistence: Persistence,
  actor: unknown,
  brandId: string,
): Promise<void> {
  const workforce = requireWorkforcePrincipal(actor);
  const mod = await seedActiveVariantWithModifier(persistence, brandId, workforce, "gtmmod");
  const second = await seedSecondModifierOption(persistence, brandId, workforce, mod);

  await persistence.transaction(async (tx) => {
    await includeBrandVariant(tx, {
      actor: workforce,
      brandId,
      variantId: mod.variantId,
      expectedRuleRevision: null,
    });
  });

  const priceBookId = await attachVariantPriceToActiveBrandBook(persistence, {
    brandId,
    variantId: mod.variantId,
    amountPaise: BigInt(22_000),
  });
  for (const optionId of [mod.modifierGroupOptionId, second.modifierGroupOptionId]) {
    await seedModifierDeltaOnBook(persistence, {
      brandId,
      priceBookId,
      variantModifierGroupId: mod.variantModifierGroupId,
      modifierGroupOptionId: optionId,
      priceDeltaPaise: BigInt(1_500),
    });
  }

  const activeMenus = await persistence.withContext(async (ctx) =>
    ctx.db
      .select({ id: menusTable.id })
      .from(menusTable)
      .where(and(eq(menusTable.brandId, brandId), eq(menusTable.lifecycleStatus, "active")))
      .orderBy(asc(menusTable.id)),
  );
  if (activeMenus.length !== 1) {
    throw new Error(
      `GTM modifier fixture expected exactly one active menu, found ${activeMenus.length}`,
    );
  }
  const menuId = activeMenus[0]!.id;

  const inspection = await persistence.withContext((ctx) =>
    getBrandMenuInspection(ctx, { actor: workforce, brandId, menuId }),
  );
  // OrderingCatalogClient only renders items on leaf sections when a root has
  // children. Prefer an active child section so the disposable item is visible.
  const activeSections = (inspection.effective?.sections ?? []).filter(
    (row) => row.lifecycleStatus === "active",
  );
  const leafSections = activeSections
    .filter((row) => row.parentSectionId != null)
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
  const rootSections = activeSections
    .filter((row) => row.parentSectionId == null)
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
  const section =
    leafSections.find((leaf) => leaf.parentSectionId === rootSections[0]?.id) ??
    leafSections[0] ??
    rootSections[0];
  if (!section) {
    throw new Error("GTM modifier fixture found no active menu section to attach");
  }

  const entry = await persistence.transaction(async (tx) => {
    const current = await findMenuById(tx, menuId);
    if (!current) throw new Error("GTM modifier fixture lost active menu");
    return createMenuEntry(tx, {
      actor: workforce,
      brandId,
      menuId,
      sectionId: section.id,
      productId: mod.productId,
      // Keep after imported leaf entries so existing "first Add" helpers stay plain.
      position: 999,
      displayName: GTM_UAT_MODIFIER_ITEM_NAME,
      imagePath: "/assets/menu/test.jpeg",
      expectedMenuRevision: current.revision,
    });
  });

  await persistence.transaction(async (tx) => {
    let current = await findMenuById(tx, menuId);
    if (!current) throw new Error("GTM modifier fixture lost active menu before activate");
    await activateMenuEntry(tx, {
      actor: workforce,
      entryId: entry.id,
      expectedMenuRevision: current.revision,
    });
    current = await findMenuById(tx, menuId);
    if (!current) throw new Error("GTM modifier fixture lost active menu before publish");
    await publishMenuRevision(tx, {
      actor: workforce,
      menuId,
      expectedMenuRevision: current.revision,
    });
  });
}

export async function seedGtmUatBrowserFixtures(
  persistence: Persistence,
  actor: unknown,
  brandId: string,
  outletId: string,
): Promise<void> {
  await saveOutletSchedulingProfile(persistence, {
    outletId,
    pickupMinLeadMinutes: 30,
    deliveryMinLeadMinutes: 30,
  });

  await persistence.transaction(async (tx) => {
    const created = await createPromotionDraft(tx, {
      actor,
      brandId,
      code: "e2e-coupon",
      displayName: "E2E twenty percent",
      scopeType: "brand",
      territoryId: null,
      organizationId: null,
      outletId: null,
      triggerType: "coupon",
      stackingPolicy: "combinable",
      startsAt: new Date("2020-01-01T00:00:00Z"),
      endsAt: null,
    });
    let revision = created.revision;
    revision = (
      await setPromotionBenefit(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: revision,
        benefit: {
          benefitType: "percentage_discount",
          percentageBps: 2000,
          fixedAmountPaise: null,
          maximumDiscountPaise: null,
          buyQuantity: null,
          getQuantity: null,
          repeatable: null,
          maximumRewardQuantity: null,
          includeModifiers: false,
          includeBundleDeltas: false,
        },
      })
    ).revision;
    revision = (
      await setPromotionTargets(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: revision,
        targetRole: "qualifier",
        targets: [
          {
            targetRole: "qualifier",
            targetType: "all_merchandise",
            productId: null,
            variantId: null,
            chargeDefinitionId: null,
          },
        ],
      })
    ).revision;
    revision = (
      await setPromotionTargets(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: revision,
        targetRole: "benefit",
        targets: [
          {
            targetRole: "benefit",
            targetType: "all_merchandise",
            productId: null,
            variantId: null,
            chargeDefinitionId: null,
          },
        ],
      })
    ).revision;
    await activatePromotion(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: revision,
    });
    const coupon = await createCouponDraft(tx, {
      actor,
      brandId,
      promotionId: created.id,
      origin: "manual",
      canonicalCode: GTM_UAT_COUPON_CODE,
      startsAt: new Date("2020-01-01T00:00:00Z"),
      endsAt: null,
    });
    await activateCoupon(tx, {
      actor,
      brandId,
      couponId: coupon.id,
      expectedCouponRevision: coupon.revision,
    });
  });

  await seedSelectableModifierMenuItem(persistence, actor, brandId);
}
