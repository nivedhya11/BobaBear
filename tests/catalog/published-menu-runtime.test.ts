/**
 * Operator path for published menu runtime content.
 *
 * Disposable database only. Proves an authorized operator can maintain a
 * product, variant, modifier, section, price, and assortment, then preview,
 * publish, and see projectCustomerMenu change without a static menu artifact.
 */
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

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
} from "../../src/server/catalog";
import {
  activateMenuEntry,
  activateMenuSection,
  createMenu,
  createMenuEntry,
  createMenuSection,
  findMenuById,
  previewMenuPublication,
  publishMenuRevision,
  retireMenuEntry,
  updateMenuEntryDisplay,
  MenuConflictError,
} from "../../src/server/catalog/menu";
import { menuMutationAuditEventsTable } from "../../src/platform/database/schema/menu";
import { excludeVariantAtScope, includeBrandVariant } from "../../src/server/assortment";
import { projectCustomerMenu } from "../../src/server/customer-commerce/menu/project-customer-menu";
import {
  activatePriceBook,
  attachDraftModifierPrice,
  attachDraftVariantPrice,
  createDraftPriceBook,
} from "../../src/server/pricing";
import { CustomerMenuError } from "../../src/shared/customer-menu/errors";
import { TAX_CATEGORY_RESTAURANT_SERVICE_ID } from "../../src/shared/pricing";
import { publishProductEnvelope, withCatalogDomain } from "./support";
import { configureAlwaysAcceptingOutlet } from "../database/support/serviceability-fixtures";

const AT = new Date("2026-09-11T12:00:00.000Z");
const PRICE_PAISE = BigInt(17_900);

describe("published menu runtime content", () => {
  it("publishes operator changes through projectCustomerMenu and retires them safely", async () => {
    await withCatalogDomain(async (persistence, { tree, brandAdminActor: actor }) => {
      const brandId = tree.brand.id;
      await configureAlwaysAcceptingOutlet(persistence, actor, tree.outletA.id);

      const product = await persistence.transaction((tx) =>
        createProduct(tx, {
          actor,
          brandId,
          code: "runtime-fixture",
          name: "Runtime Fixture Drink",
          productKind: "standard",
        }),
      );
      const variant = await persistence.transaction((tx) =>
        createVariant(tx, {
          actor,
          productId: product.id,
          code: "regular",
          name: "Regular",
          isDefault: true,
          isSelectorVisible: false,
        }),
      );
      await persistence.transaction(async (tx) => {
        await activateVariant(tx, { actor, variantId: variant.id });
        await activateProduct(tx, { actor, productId: product.id });
        await publishProductEnvelope(tx, { actor, brandId, productId: product.id });
      });

      const modifierGroup = await persistence.transaction((tx) =>
        createModifierGroup(tx, {
          actor,
          brandId,
          code: "runtime-topping",
          name: "Runtime Topping",
        }),
      );
      const modifierOption = await persistence.transaction((tx) =>
        createModifierOption(tx, {
          actor,
          brandId,
          code: "runtime-pearl",
          name: "Runtime Pearl",
        }),
      );
      const binding = await persistence.transaction((tx) =>
        addModifierOptionToGroup(tx, {
          actor,
          modifierGroupId: modifierGroup.id,
          modifierOptionId: modifierOption.id,
          minQuantity: 0,
          maxQuantity: 1,
          defaultQuantity: 0,
          position: 0,
        }),
      );
      const variantModifierGroup = await persistence.transaction((tx) =>
        applyModifierGroupToVariant(tx, {
          actor,
          variantId: variant.id,
          modifierGroupId: modifierGroup.id,
          minTotalQuantity: 0,
          maxTotalQuantity: 1,
          position: 0,
        }),
      );
      await persistence.transaction(async (tx) => {
        await activateModifierOption(tx, { actor, modifierOptionId: modifierOption.id });
        await activateModifierGroupOption(tx, {
          actor,
          modifierGroupOptionId: binding.id,
        });
        await activateModifierGroup(tx, { actor, modifierGroupId: modifierGroup.id });
        await activateVariantModifierGroup(tx, {
          actor,
          variantModifierGroupId: variantModifierGroup.id,
        });
        await publishProductEnvelope(tx, { actor, brandId, productId: product.id });
      });

      await persistence.transaction(async (tx) => {
        const book = await createDraftPriceBook(tx, {
          actor,
          brandId,
          scopeType: "brand",
          code: "runtime-book",
          name: "Runtime book",
          effectiveFrom: new Date("2026-09-01T00:00:00+05:30"),
          effectiveTo: null,
        });
        const variantPrice = await attachDraftVariantPrice(tx, {
          actor,
          priceBookId: book.id,
          brandId,
          variantId: variant.id,
          amountPaise: PRICE_PAISE,
          taxCategoryId: TAX_CATEGORY_RESTAURANT_SERVICE_ID,
          expectedPriceBookRevision: book.revision,
        });
        const modifierPrice = await attachDraftModifierPrice(tx, {
          actor,
          priceBookId: book.id,
          brandId,
          variantModifierGroupId: variantModifierGroup.id,
          modifierGroupOptionId: binding.id,
          priceDeltaPaise: BigInt(0),
          expectedPriceBookRevision: variantPrice.priceBookRevision,
        });
        await activatePriceBook(tx, {
          actor,
          priceBookId: book.id,
          brandId,
          expectedPriceBookRevision: modifierPrice.priceBookRevision,
        });
        await includeBrandVariant(tx, {
          actor,
          brandId,
          variantId: variant.id,
          expectedRuleRevision: null,
        });
      });

      const menu = await persistence.transaction((tx) =>
        createMenu(tx, {
          actor,
          brandId,
          code: "runtime-menu",
          name: "Runtime Menu",
        }),
      );
      const section = await persistence.transaction(async (tx) => {
        const current = await findMenuById(tx, menu.id);
        return createMenuSection(tx, {
          actor,
          brandId,
          menuId: menu.id,
          code: "runtime-section",
          name: "Runtime Section",
          position: 0,
          expectedMenuRevision: current!.revision,
        });
      });
      const entry = await persistence.transaction(async (tx) => {
        const current = await findMenuById(tx, menu.id);
        return createMenuEntry(tx, {
          actor,
          brandId,
          menuId: menu.id,
          sectionId: section.id,
          productId: product.id,
          position: 0,
          imagePath: "/assets/menu/runtime-fixture.jpeg",
          expectedMenuRevision: current!.revision,
        });
      });
      await persistence.transaction(async (tx) => {
        let current = await findMenuById(tx, menu.id);
        await activateMenuSection(tx, {
          actor,
          sectionId: section.id,
          expectedMenuRevision: current!.revision,
        });
        current = await findMenuById(tx, menu.id);
        await activateMenuEntry(tx, {
          actor,
          entryId: entry.id,
          expectedMenuRevision: current!.revision,
        });
      });

      await expect(
        persistence.withContext((ctx) => projectCustomerMenu(ctx, { brandId, at: AT })),
      ).rejects.toBeInstanceOf(CustomerMenuError);

      const preview = await persistence.transaction((tx) =>
        previewMenuPublication(tx, { actor, menuId: menu.id }),
      );
      expect(preview.validationOk).toBe(true);
      expect(preview.wouldChangeCustomerTruth).toBe(true);

      const publishedRevision = await persistence.transaction(async (tx) => {
        const current = await findMenuById(tx, menu.id);
        await publishMenuRevision(tx, {
          actor,
          menuId: menu.id,
          expectedMenuRevision: current!.revision,
        });
        return current!.revision;
      });

      const published = await persistence.withContext((ctx) =>
        projectCustomerMenu(ctx, { brandId, at: AT }),
      );
      expect(published.items).toEqual([
        expect.objectContaining({
          productId: product.id,
          variantId: variant.id,
          name: "Runtime Fixture Drink",
          displayPricePaise: 17_900,
          imagePath: "/assets/menu/runtime-fixture.jpeg",
        }),
      ]);
      expect(published.sections.map((row) => row.name)).toEqual(["Runtime Section"]);
      expect(published.items[0]?.modifierGroups?.[0]).toMatchObject({
        name: "Runtime Topping",
        options: [expect.objectContaining({ name: "Runtime Pearl", displayPriceDeltaPaise: 0 })],
      });

      const atOutlet = await persistence.withContext((ctx) =>
        projectCustomerMenu(ctx, { brandId, outletId: tree.outletA.id, at: AT }),
      );
      expect(atOutlet.items.find((item) => item.variantId === variant.id)?.availability).toBe(
        "available",
      );

      await persistence.transaction((tx) =>
        excludeVariantAtScope(tx, {
          actor,
          brandId,
          expectedRuleRevision: null,
          scopeType: "outlet",
          outletId: tree.outletA.id,
          variantId: variant.id,
        }),
      );
      const excluded = await persistence.withContext((ctx) =>
        projectCustomerMenu(ctx, { brandId, outletId: tree.outletA.id, at: AT }),
      );
      expect(excluded.items.find((item) => item.variantId === variant.id)).toBeUndefined();
      const stillBrandVisible = await persistence.withContext((ctx) =>
        projectCustomerMenu(ctx, { brandId, at: AT }),
      );
      expect(stillBrandVisible.items.map((item) => item.variantId)).toEqual([variant.id]);

      await persistence.transaction(async (tx) => {
        const current = await findMenuById(tx, menu.id);
        await updateMenuEntryDisplay(tx, {
          actor,
          entryId: entry.id,
          displayName: "Renamed Fixture",
          expectedMenuRevision: current!.revision,
        });
      });
      const draftHidden = await persistence.withContext((ctx) =>
        projectCustomerMenu(ctx, { brandId, at: AT }),
      );
      expect(draftHidden.items[0]?.name).toBe("Runtime Fixture Drink");

      await persistence.transaction(async (tx) => {
        const current = await findMenuById(tx, menu.id);
        await publishMenuRevision(tx, {
          actor,
          menuId: menu.id,
          expectedMenuRevision: current!.revision,
        });
      });
      const renamed = await persistence.withContext((ctx) =>
        projectCustomerMenu(ctx, { brandId, at: AT }),
      );
      expect(renamed.items[0]?.name).toBe("Renamed Fixture");

      await persistence.transaction(async (tx) => {
        const current = await findMenuById(tx, menu.id);
        await retireMenuEntry(tx, {
          actor,
          entryId: entry.id,
          expectedMenuRevision: current!.revision,
        });
      });
      const retireHidden = await persistence.withContext((ctx) =>
        projectCustomerMenu(ctx, { brandId, at: AT }),
      );
      expect(retireHidden.items.map((item) => item.variantId)).toEqual([variant.id]);

      await persistence.transaction(async (tx) => {
        const current = await findMenuById(tx, menu.id);
        await publishMenuRevision(tx, {
          actor,
          menuId: menu.id,
          expectedMenuRevision: current!.revision,
        });
      });
      const retired = await persistence.withContext((ctx) =>
        projectCustomerMenu(ctx, { brandId, at: AT }),
      );
      expect(retired.items).toEqual([]);

      await expect(
        persistence.transaction((tx) =>
          publishMenuRevision(tx, {
            actor,
            menuId: menu.id,
            expectedMenuRevision: publishedRevision,
          }),
        ),
      ).rejects.toBeInstanceOf(MenuConflictError);

      const audits = await persistence.withContext((ctx) =>
        ctx.db
          .select({ action: menuMutationAuditEventsTable.action })
          .from(menuMutationAuditEventsTable)
          .where(eq(menuMutationAuditEventsTable.menuId, menu.id)),
      );
      expect(audits.map((row) => row.action)).toContain("menu.published");
    });
  });
});
