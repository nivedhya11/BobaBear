/**
 * D-381 — legitimate retirement of a historical active outlet PriceBook.
 * Fixtures may seed the pre-guard active state. Runtime code must not.
 */
import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  priceBookVariantPricesTable,
  priceBooksTable,
  pricingTaxAuditEventsTable,
} from "../../src/platform/database/schema/pricing";
import {
  activatePriceBook,
  attachDraftVariantPrice,
  createDraftPriceBook,
  retireActiveOutletPriceBook,
  resolveOutletVariantPrice,
} from "../../src/server/pricing";
import { TAX_CATEGORY_RESTAURANT_SERVICE_ID } from "../../src/shared/pricing";
import {
  createActiveStandardVariant,
  withAssortmentDomain,
} from "../assortment-availability/support";

const AT = new Date("2026-09-20T12:00:00.000Z");
const FROM = new Date("2026-09-01T00:00:00.000Z");
const SEEDED_AT = new Date("2026-08-01T00:00:00.000Z");

type Domain = Parameters<Parameters<typeof withAssortmentDomain>[0]>[0];

async function seedLegacyActiveOutletBook(
  persistence: Domain,
  args: {
    brandId: string;
    territoryId: string;
    organizationId: string;
    outletId: string;
    variantId: string;
    workforceUserId: string;
    amountPaise: bigint;
  },
): Promise<string> {
  const priceBookId = randomUUID();
  await persistence.withContext(async (ctx) => {
    await ctx.db.insert(priceBooksTable).values({
      id: priceBookId,
      brandId: args.brandId,
      scopeType: "outlet",
      territoryId: args.territoryId,
      organizationId: args.organizationId,
      outletId: args.outletId,
      code: `legacy-${priceBookId.slice(0, 8)}`,
      name: "Legacy invalid outlet book",
      salesChannel: "direct",
      currency: "INR",
      taxInclusionMode: "exclusive",
      effectiveFrom: FROM,
      lifecycleStatus: "active",
      revision: BigInt(3),
      createdByWorkforceUserId: args.workforceUserId,
      activatedByWorkforceUserId: args.workforceUserId,
      createdAt: SEEDED_AT,
      updatedAt: SEEDED_AT,
      activatedAt: SEEDED_AT,
    });
    await ctx.db.insert(priceBookVariantPricesTable).values({
      id: randomUUID(),
      brandId: args.brandId,
      priceBookId,
      variantId: args.variantId,
      amountPaise: args.amountPaise,
      allowTerritoryOverride: false,
      allowOrganizationOverride: false,
      allowOutletOverride: false,
      taxCategoryId: TAX_CATEGORY_RESTAURANT_SERVICE_ID,
      createdAt: SEEDED_AT,
    });
  });
  return priceBookId;
}

describe("retireActiveOutletPriceBook", () => {
  it("retires a historical prohibited outlet book and restores brand resolution", async () => {
    await withAssortmentDomain(async (persistence, { tree, brandAdmin, brandAdminActor }) => {
      const catalog = await createActiveStandardVariant(
        persistence,
        brandAdminActor,
        tree.brand.id,
        "legovr",
      );
      await persistence.transaction(async (tx) => {
        const brand = await createDraftPriceBook(tx, {
          actor: brandAdminActor,
          brandId: tree.brand.id,
          scopeType: "brand",
          code: `brand-${randomUUID().slice(0, 8)}`,
          name: "Brand baseline",
          effectiveFrom: FROM,
        });
        const attached = await attachDraftVariantPrice(tx, {
          actor: brandAdminActor,
          brandId: tree.brand.id,
          priceBookId: brand.id,
          variantId: catalog.variantId,
          amountPaise: BigInt(23900),
          taxCategoryId: TAX_CATEGORY_RESTAURANT_SERVICE_ID,
          allowOutletOverride: false,
          expectedPriceBookRevision: brand.revision,
        });
        await activatePriceBook(tx, {
          actor: brandAdminActor,
          brandId: tree.brand.id,
          priceBookId: brand.id,
          expectedPriceBookRevision: attached.priceBookRevision,
        });
      });

      const legacyId = await seedLegacyActiveOutletBook(persistence, {
        brandId: tree.brand.id,
        territoryId: tree.terrA.id,
        organizationId: tree.orgA.id,
        outletId: tree.outletA.id,
        variantId: catalog.variantId,
        workforceUserId: brandAdmin.id,
        amountPaise: BigInt(24100),
      });

      await expect(
        persistence.withContext((ctx) =>
          resolveOutletVariantPrice(ctx, {
            variantId: catalog.variantId,
            outletId: tree.outletA.id,
            at: AT,
          }),
        ),
      ).rejects.toMatchObject({ pricingErrorCode: "OVERRIDE_NOT_PERMITTED" });

      const beforeRows = await persistence.withContext((ctx) =>
        ctx.db
          .select({ id: priceBookVariantPricesTable.id, amountPaise: priceBookVariantPricesTable.amountPaise })
          .from(priceBookVariantPricesTable)
          .where(eq(priceBookVariantPricesTable.priceBookId, legacyId)),
      );

      const retired = await persistence.transaction((tx) =>
        retireActiveOutletPriceBook(tx, {
          actor: brandAdminActor,
          brandId: tree.brand.id,
          priceBookId: legacyId,
        }),
      );
      expect(retired.lifecycleStatus).toBe("retired");
      expect(retired.scopeType).toBe("outlet");
      expect(retired.retiredByWorkforceUserId).toBe(brandAdmin.id);

      const book = await persistence.withContext(async (ctx) => {
        const rows = await ctx.db
          .select({
            lifecycleStatus: priceBooksTable.lifecycleStatus,
            retiredByWorkforceUserId: priceBooksTable.retiredByWorkforceUserId,
          })
          .from(priceBooksTable)
          .where(eq(priceBooksTable.id, legacyId))
          .limit(1);
        return rows[0];
      });
      expect(book?.lifecycleStatus).toBe("retired");
      expect(book?.retiredByWorkforceUserId).toBe(brandAdmin.id);

      const afterRows = await persistence.withContext((ctx) =>
        ctx.db
          .select({ id: priceBookVariantPricesTable.id, amountPaise: priceBookVariantPricesTable.amountPaise })
          .from(priceBookVariantPricesTable)
          .where(eq(priceBookVariantPricesTable.priceBookId, legacyId)),
      );
      expect(afterRows).toEqual(beforeRows);
      expect(afterRows).toEqual([
        expect.objectContaining({ amountPaise: BigInt(24100) }),
      ]);

      const audits = await persistence.withContext((ctx) =>
        ctx.db
          .select({ actorWorkforceUserId: pricingTaxAuditEventsTable.actorWorkforceUserId })
          .from(pricingTaxAuditEventsTable)
          .where(
            and(
              eq(pricingTaxAuditEventsTable.targetId, legacyId),
              eq(pricingTaxAuditEventsTable.action, "price_book.retired"),
            ),
          ),
      );
      expect(audits).toEqual([{ actorWorkforceUserId: brandAdmin.id }]);

      const resolved = await persistence.withContext((ctx) =>
        resolveOutletVariantPrice(ctx, {
          variantId: catalog.variantId,
          outletId: tree.outletA.id,
          at: AT,
        }),
      );
      expect(resolved.amountPaise).toBe(BigInt(23900));
      expect(resolved.overrideScope).toBe("brand");
    });
  });

  it("refuses non-outlet, non-active, wrong-brand, and unauthorized retirement", async () => {
    await withAssortmentDomain(
      async (persistence, { tree, otherTree, brandAdmin, brandAdminActor, otherBrandAdminActor, kitchenOperatorActor }) => {
        const catalog = await createActiveStandardVariant(
          persistence,
          brandAdminActor,
          tree.brand.id,
          "denyovr",
        );
        const outletId = await seedLegacyActiveOutletBook(persistence, {
          brandId: tree.brand.id,
          territoryId: tree.terrA.id,
          organizationId: tree.orgA.id,
          outletId: tree.outletA.id,
          variantId: catalog.variantId,
          workforceUserId: brandAdmin.id,
          amountPaise: BigInt(24100),
        });

        async function seedStatusBook(input: {
          scopeType: "brand" | "territory" | "organization" | "outlet";
          lifecycleStatus: "draft" | "active" | "retired";
          territoryId?: string | null;
          organizationId?: string | null;
          outletId?: string | null;
        }) {
          const id = randomUUID();
          const retired = input.lifecycleStatus === "retired";
          const active = input.lifecycleStatus === "active";
          await persistence.withContext(async (ctx) => {
            await ctx.db.insert(priceBooksTable).values({
              id,
              brandId: tree.brand.id,
              scopeType: input.scopeType,
              territoryId: input.territoryId ?? null,
              organizationId: input.organizationId ?? null,
              outletId: input.outletId ?? null,
              code: `deny-${id.slice(0, 8)}`,
              name: `${input.scopeType} ${input.lifecycleStatus}`,
              salesChannel: "direct",
              currency: "INR",
              taxInclusionMode: "exclusive",
              effectiveFrom: FROM,
              lifecycleStatus: input.lifecycleStatus,
              revision: BigInt(1),
              createdByWorkforceUserId: brandAdmin.id,
              activatedByWorkforceUserId: active || retired ? brandAdmin.id : null,
              createdAt: SEEDED_AT,
              updatedAt: SEEDED_AT,
              activatedAt: active || retired ? SEEDED_AT : null,
              retiredAt: retired ? SEEDED_AT : null,
            });
          });
          return id;
        }

        const deny = (priceBookId: string, actor: unknown = brandAdminActor, brandId = tree.brand.id) =>
          persistence.transaction((tx) =>
            retireActiveOutletPriceBook(tx, { actor, brandId, priceBookId }),
          );

        await expect(deny(await seedStatusBook({ scopeType: "brand", lifecycleStatus: "active" }))).rejects.toMatchObject({
          name: "PricingInvalidStateError",
        });
        await expect(
          deny(
            await seedStatusBook({
              scopeType: "territory",
              lifecycleStatus: "active",
              territoryId: tree.terrA.id,
            }),
          ),
        ).rejects.toMatchObject({ name: "PricingInvalidStateError" });
        await expect(
          deny(
            await seedStatusBook({
              scopeType: "organization",
              lifecycleStatus: "active",
              organizationId: tree.orgA.id,
            }),
          ),
        ).rejects.toMatchObject({ name: "PricingInvalidStateError" });
        await expect(
          deny(
            await seedStatusBook({
              scopeType: "outlet",
              lifecycleStatus: "draft",
              territoryId: tree.terrA.id,
              organizationId: tree.orgA.id,
              outletId: tree.outletA.id,
            }),
          ),
        ).rejects.toMatchObject({
          name: "PricingInvalidStateError",
          message: "Only an active price book can be retired through this operation.",
        });
        await expect(
          deny(
            await seedStatusBook({
              scopeType: "outlet",
              lifecycleStatus: "retired",
              territoryId: tree.terrA.id,
              organizationId: tree.orgA.id,
              outletId: tree.outletA.id,
            }),
          ),
        ).rejects.toMatchObject({
          name: "PricingInvalidStateError",
          message: "Price book is already retired.",
        });
        await expect(deny(outletId, otherBrandAdminActor, otherTree.brand.id)).rejects.toMatchObject({
          name: "PricingNotFoundError",
        });
        await expect(deny(outletId, kitchenOperatorActor)).rejects.toMatchObject({
          name: "AuthorizationError",
        });

        const stillActive = await persistence.withContext(async (ctx) => {
          const rows = await ctx.db
            .select({ lifecycleStatus: priceBooksTable.lifecycleStatus })
            .from(priceBooksTable)
            .where(eq(priceBooksTable.id, outletId))
            .limit(1);
          return rows[0]?.lifecycleStatus;
        });
        expect(stillActive).toBe("active");
      },
    );
  });
});
