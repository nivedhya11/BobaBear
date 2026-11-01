/**
 * IMP-036J M2 operator HTTP proof for AC-036J-012-02, 012-04, and 012-05.
 * Real administration routes. Denied calls must not change the draft.
 */
import { createServer, type Server } from "node:http";

import { serializeSignedCookie } from "better-call";
import { eq, sql } from "drizzle-orm";
import { afterEach, describe, expect, inject, it } from "vitest";

import { catalogContentRevisionsTable } from "../../src/platform/database/schema/catalog";
import type { WebConfig } from "../../src/platform/config";
import { createMembership, grantRole } from "../../src/server/access-control";
import { loadAuthFoundationConfig } from "../../src/server/auth/shared/config";
import {
  getWorkforceAuthRuntime,
  WORKFORCE_AUTH_SESSION_COOKIE_NAME,
} from "../../src/server/auth/workforce";
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
import { routeOperationsRequest } from "../../src/server/operations/http/router";
import { attachDraftModifierPrice, createDraftPriceBook } from "../../src/server/pricing";
import { inspectBrandPromotion } from "../../src/server/promotions";
import { COPY_OP_GIFT_INVALID, COPY_OP_RACE, COPY_OP_SECOND } from "../../src/shared/promotions/operator-copy";
import {
  createEligibleWorkforceUser,
  seedBrandTree,
} from "./support/access-control-fixtures";
import {
  seedActiveBundleWithComponent,
  seedActiveStandardVariant,
  uniqueCode,
} from "./support/cart-fixtures";
import { seedPromotionsHarness } from "./support/promotions-fixtures";
import { applyMigrations, withIsolatedTestDatabase } from "./support/test-database";

afterEach(async () => {
  const { closeTrackedPersistenceHandles } = await import("./support/cart-fixtures");
  await closeTrackedPersistenceHandles();
});

function adminConnectionInfo() {
  return {
    connectionString: inject("bobaBearTestAdminConnectionString"),
    host: inject("bobaBearTestAdminHost"),
    port: inject("bobaBearTestAdminPort"),
  };
}

function applicationConfig(databaseUrl: string): WebConfig {
  return {
    environment: "test",
    processKind: "web",
    publicOrigin: "http://localhost:3000",
    logLevel: "warn",
    release: null,
    allowUnsafeAdapters: true,
    databaseSslMode: "disable",
    port: 3000,
    databaseUrl,
  };
}

const MERCH = {
  targetType: "all_merchandise",
  productId: null,
  variantId: null,
  chargeDefinitionId: null,
};

type Json = Record<string, unknown>;

async function readJson(response: Response): Promise<Json> {
  return (await response.json()) as Json;
}

describe("IMP-036J M2 operator administration HTTP", () => {
  it("names invalid activation fields, rejects complimentary authoring, and keeps one active gift", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const openHandles: Array<{ close(): Promise<void> }> = [];
      const harness = await seedPromotionsHarness(database.connectionString, openHandles);
      const actor = harness.brandAdminPrincipal;
      const brandId = harness.tree.brand.id;
      const catalog = await seedActiveStandardVariant(harness.persistence, brandId, actor, "m2g");
      const bundle = await seedActiveBundleWithComponent(harness.persistence, brandId, actor, {
        codePrefix: "m2b",
      });
      const required = await harness.persistence.transaction(async (tx) => {
        const product = await createProduct(tx, {
          actor,
          brandId,
          code: uniqueCode("req-p"),
          name: "Required priced choice",
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
          code: uniqueCode("req-g"),
          name: "Must pick",
        });
        const option = await createModifierOption(tx, {
          actor,
          brandId,
          code: uniqueCode("req-o"),
          name: "Paid one",
        });
        const binding = await addModifierOptionToGroup(tx, {
          actor,
          modifierGroupId: group.id,
          modifierOptionId: option.id,
          minQuantity: 1,
          maxQuantity: 1,
          defaultQuantity: 1,
        });
        const vmg = await applyModifierGroupToVariant(tx, {
          actor,
          variantId: variant.id,
          modifierGroupId: group.id,
          minTotalQuantity: 1,
          maxTotalQuantity: 1,
        });
        await activateModifierOption(tx, { actor, modifierOptionId: option.id });
        await activateModifierGroupOption(tx, { actor, modifierGroupOptionId: binding.id });
        await activateModifierGroup(tx, { actor, modifierGroupId: group.id });
        await activateVariantModifierGroup(tx, { actor, variantModifierGroupId: vmg.id });
        await activateVariant(tx, { actor, variantId: variant.id });
        await activateProduct(tx, { actor, productId: product.id });
        const book = await createDraftPriceBook(tx, {
          actor,
          brandId,
          scopeType: "brand",
          code: uniqueCode("pb"),
          name: "M2 required price",
          effectiveFrom: new Date("2026-01-01T00:00:00Z"),
        });
        await attachDraftModifierPrice(tx, {
          actor,
          brandId,
          priceBookId: book.id,
          variantModifierGroupId: vmg.id,
          modifierGroupOptionId: binding.id,
          priceDeltaPaise: BigInt(500),
          expectedPriceBookRevision: book.revision,
        });
        return { productId: product.id, variantId: variant.id };
      });
      await harness.persistence.transaction(async (tx) => {
        const rows = await tx.db
          .select()
          .from(catalogContentRevisionsTable)
          .where(eq(catalogContentRevisionsTable.brandId, brandId))
          .limit(1);
        const envelope = rows[0];
        if (!envelope) throw new Error("missing brand content revision");
        await publishCatalogContentChange(tx, {
          actor,
          brandId,
          productId: required.productId,
          expectedContentRevision: envelope.contentRevision,
        });
      });

      const kitchen = await createEligibleWorkforceUser(harness.persistence);
      const otherTree = await harness.persistence.transaction((tx) => seedBrandTree(tx, "m2x"));
      const otherAdmin = await createEligibleWorkforceUser(harness.persistence);
      await harness.persistence.transaction(async (tx) => {
        const kitchenMembership = await createMembership(tx, {
          workforceUserId: kitchen.id,
          scope: {
            scopeType: "outlet",
            brandId,
            organizationId: harness.tree.orgA.id,
            territoryId: harness.tree.terrA.id,
            outletId: harness.tree.outletA.id,
          },
          status: "active",
        });
        await grantRole(tx, { membershipId: kitchenMembership.id, roleKey: "kitchen_operator" });
        const otherMembership = await createMembership(tx, {
          workforceUserId: otherAdmin.id,
          scope: { scopeType: "brand", brandId: otherTree.brand.id },
          status: "active",
        });
        await grantRole(tx, { membershipId: otherMembership.id, roleKey: "brand_admin" });
      });

      const workforce = loadAuthFoundationConfig(
        {
          CUSTOMER_AUTH_SECRET: "m2-customer-auth-secret-32charsxxx",
          CUSTOMER_AUTH_BASE_URL: "http://localhost:3100",
          WORKFORCE_AUTH_SECRET: "m2-workforce-auth-secret-32charsx",
          WORKFORCE_AUTH_BASE_URL: "http://localhost:3200",
        },
        "test",
      ).workforce;
      const runtime = getWorkforceAuthRuntime({
        auth: workforce,
        persistence: applicationConfig(database.connectionString),
      });
      const auth = await runtime.getAuth();
      const adapter = (
        (await auth.$context) as {
          internalAdapter: { createSession: (id: string) => Promise<{ token: string }> };
        }
      ).internalAdapter;
      const server: Server = createServer((req, res) => {
        void routeOperationsRequest(
          req,
          res,
          {
            runtime,
            persistence: harness.persistence,
            trustedOrigin: workforce.baseURL.origin,
            stepUpSessionHashSecret: workforce.secret,
          },
          "m2-operator-http",
        );
      });
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("no addr");
      const base = `http://127.0.0.1:${address.port}`;
      const origin = workforce.baseURL.origin;

      async function cookieFor(userId: string): Promise<string> {
        const session = await adapter.createSession(userId);
        return (
          await serializeSignedCookie(
            WORKFORCE_AUTH_SESSION_COOKIE_NAME,
            session.token,
            workforce.secret,
          )
        ).split(";", 1)[0]!;
      }

      const adminCookie = await cookieFor(harness.brandAdmin.id);
      const kitchenCookie = await cookieFor(kitchen.id);
      const otherCookie = await cookieFor(otherAdmin.id);
      const headers = (cookie: string) => ({
        cookie,
        origin,
        "content-type": "application/json",
      });

      async function createDraft(code: string): Promise<{ id: string; revision: string }> {
        const response = await fetch(`${base}/api/admin/v1/brands/${brandId}/promotions`, {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({
            code,
            displayName: code,
            scopeType: "brand",
            triggerType: "automatic",
            startsAt: "2026-01-01T00:00:00.000Z",
          }),
        });
        expect(response.status).toBe(200);
        const body = await readJson(response);
        const promotion = body.promotion as { id: string; revision: string };
        return promotion;
      }

      async function inspect(id: string) {
        return harness.persistence.withContext((ctx) =>
          inspectBrandPromotion(ctx, { actor, brandId, promotionId: id }),
        );
      }

      async function auditCount(id: string): Promise<number> {
        const rows = await harness.persistence.withContext((ctx) =>
          ctx.db.execute(sql`
            select count(*)::int as c
            from app.promotion_audit_events
            where resource_id = ${id}::uuid
          `),
        );
        return Number(rows.rows[0]?.c ?? 0);
      }

      async function activeGiftCount(): Promise<number> {
        const rows = await harness.persistence.withContext((ctx) =>
          ctx.db.execute(sql`
            select count(*)::int as c
            from app.promotions
            where brand_id = ${brandId}::uuid
              and status = 'active'
              and complimentary_item = true
          `),
        );
        return Number(rows.rows[0]?.c ?? 0);
      }

      const missingRevision = await createDraft(uniqueCode("miss"));
      const beforeMissing = await inspect(missingRevision.id);
      const missingResponse = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${missingRevision.id}/activate`,
        {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({}),
        },
      );
      expect(missingResponse.status).toBe(400);
      const missingBody = await readJson(missingResponse);
      expect(missingBody.ok).toBe(false);
      expect(missingBody.field).toBe("expectedPromotionRevision");
      expect(String(missingBody.message)).toContain("expectedPromotionRevision");
      const afterMissing = await inspect(missingRevision.id);
      expect(afterMissing.promotion.status).toBe("draft");
      expect(afterMissing.promotion.revision).toBe(beforeMissing.promotion.revision);

      const bare = await createDraft(uniqueCode("bare"));
      const beforeBare = await inspect(bare.id);
      const bareAudits = await auditCount(bare.id);
      const bareResponse = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${bare.id}/activate`,
        {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({ expectedPromotionRevision: bare.revision }),
        },
      );
      expect(bareResponse.status).toBe(400);
      const bareBody = await readJson(bareResponse);
      expect(bareBody.field).toBe("benefit");
      expect(String(bareBody.message)).toContain("Benefit required");
      const afterBare = await inspect(bare.id);
      expect(afterBare.promotion.status).toBe("draft");
      expect(afterBare.promotion.revision).toBe(beforeBare.promotion.revision);
      expect(await auditCount(bare.id)).toBe(bareAudits);

      const spoofResponse = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${bare.id}/activate`,
        {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({
            expectedPromotionRevision: bare.revision,
            role: "brand_admin",
            roles: ["platform_super_admin"],
          }),
        },
      );
      expect(spoofResponse.status).toBeGreaterThanOrEqual(400);
      expect((await readJson(spoofResponse)).ok).toBe(false);
      expect((await inspect(bare.id)).promotion.revision).toBe(beforeBare.promotion.revision);

      const kitchenActivate = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${bare.id}/activate`,
        {
          method: "POST",
          headers: headers(kitchenCookie),
          body: JSON.stringify({ expectedPromotionRevision: bare.revision }),
        },
      );
      expect([403, 404]).toContain(kitchenActivate.status);
      expect((await inspect(bare.id)).promotion.status).toBe("draft");

      const otherActivate = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${bare.id}/activate`,
        {
          method: "POST",
          headers: headers(otherCookie),
          body: JSON.stringify({ expectedPromotionRevision: bare.revision }),
        },
      );
      expect([403, 404]).toContain(otherActivate.status);
      expect((await inspect(bare.id)).promotion.revision).toBe(beforeBare.promotion.revision);

      async function postBenefit(
        id: string,
        revision: string,
        extra: Record<string, unknown>,
      ): Promise<Response> {
        return fetch(`${base}/api/admin/v1/brands/${brandId}/promotions/${id}/benefit`, {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({
            expectedPromotionRevision: revision,
            benefitType: "complimentary_item",
            ...extra,
          }),
        });
      }

      const authoring = await createDraft(uniqueCode("gift"));
      const incomplete = await postBenefit(authoring.id, authoring.revision, {});
      expect(incomplete.status).toBe(400);
      const incompleteBody = await readJson(incomplete);
      expect(incompleteBody.code).toBe("PROMOTION_COMPLIMENTARY_INVALID");
      expect(incompleteBody.field).toBe("complimentaryProductId");
      expect(incompleteBody.message).toBe(COPY_OP_GIFT_INVALID);
      expect((await inspect(authoring.id)).promotion.status).toBe("draft");

      const bundled = await postBenefit(authoring.id, authoring.revision, {
        complimentaryProductId: bundle.bundleProductId,
        complimentaryVariantId: bundle.bundleVariantId,
      });
      expect(bundled.status).toBe(400);
      const bundledBody = await readJson(bundled);
      expect(bundledBody.message).toBe(COPY_OP_GIFT_INVALID);
      expect(bundledBody.field).toBe("complimentaryProductId");

      const priced = await postBenefit(authoring.id, authoring.revision, {
        complimentaryProductId: required.productId,
        complimentaryVariantId: required.variantId,
      });
      expect(priced.status).toBe(400);
      const pricedBody = await readJson(priced);
      expect(pricedBody.message).toBe(COPY_OP_GIFT_INVALID);
      expect(pricedBody.field).toBe("complimentaryVariantId");
      expect((await inspect(authoring.id)).promotion.status).toBe("draft");
      expect((await inspect(authoring.id)).benefit).toBeNull();

      const saved = await postBenefit(authoring.id, authoring.revision, {
        complimentaryProductId: catalog.productId,
        complimentaryVariantId: catalog.variantId,
      });
      expect(saved.status).toBe(200);
      let revision = String((await readJson(saved)).revision);
      const qualifier = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${authoring.id}/targets`,
        {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({
            expectedPromotionRevision: revision,
            targetRole: "qualifier",
            targets: [{ targetRole: "qualifier", ...MERCH }],
          }),
        },
      );
      expect(qualifier.status).toBe(200);
      revision = String((await readJson(qualifier)).revision);
      const benefitTarget = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${authoring.id}/targets`,
        {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({
            expectedPromotionRevision: revision,
            targetRole: "benefit",
            targets: [{ targetRole: "benefit", ...MERCH }],
          }),
        },
      );
      expect(benefitTarget.status).toBe(200);
      revision = String((await readJson(benefitTarget)).revision);
      const activated = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${authoring.id}/activate`,
        {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({ expectedPromotionRevision: revision }),
        },
      );
      expect(activated.status).toBe(200);
      expect((await inspect(authoring.id)).promotion.status).toBe("active");
      expect(await activeGiftCount()).toBe(1);

      const kitchenRetire = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${authoring.id}/retire`,
        {
          method: "POST",
          headers: headers(kitchenCookie),
          body: JSON.stringify({
            expectedPromotionRevision: (await inspect(authoring.id)).promotion.revision,
          }),
        },
      );
      expect([403, 404]).toContain(kitchenRetire.status);
      expect((await inspect(authoring.id)).promotion.status).toBe("active");

      async function readyGift(code: string): Promise<{ id: string; revision: string }> {
        const draft = await createDraft(code);
        const benefit = await postBenefit(draft.id, draft.revision, {
          complimentaryProductId: catalog.productId,
          complimentaryVariantId: catalog.variantId,
        });
        expect(benefit.status).toBe(200);
        let next = String((await readJson(benefit)).revision);
        for (const role of ["qualifier", "benefit"] as const) {
          const targets = await fetch(
            `${base}/api/admin/v1/brands/${brandId}/promotions/${draft.id}/targets`,
            {
              method: "POST",
              headers: headers(adminCookie),
              body: JSON.stringify({
                expectedPromotionRevision: next,
                targetRole: role,
                targets: [{ targetRole: role, ...MERCH }],
              }),
            },
          );
          expect(targets.status).toBe(200);
          next = String((await readJson(targets)).revision);
        }
        return { id: draft.id, revision: next };
      }

      const second = await readyGift(uniqueCode("second"));
      const beforeSecond = await inspect(second.id);
      const secondResponse = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${second.id}/activate`,
        {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({ expectedPromotionRevision: second.revision }),
        },
      );
      expect(secondResponse.status).toBe(409);
      const secondBody = await readJson(secondResponse);
      expect(secondBody.code).toBe("PROMOTION_COMPLIMENTARY_ACTIVE_CONFLICT");
      expect(secondBody.message).toBe(COPY_OP_SECOND);
      expect((await inspect(authoring.id)).promotion.status).toBe("active");
      expect((await inspect(second.id)).promotion.status).toBe("draft");
      expect((await inspect(second.id)).promotion.revision).toBe(beforeSecond.promotion.revision);
      expect(await activeGiftCount()).toBe(1);

      const indexRows = await harness.persistence.withContext((ctx) =>
        ctx.db.execute(sql`
          select indexdef
          from pg_indexes
          where indexname = 'promotions_one_active_complimentary_per_brand_uidx'
        `),
      );
      expect(String(indexRows.rows[0]?.indexdef ?? "")).toMatch(/UNIQUE/i);

      const retired = await fetch(
        `${base}/api/admin/v1/brands/${brandId}/promotions/${authoring.id}/retire`,
        {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({
            expectedPromotionRevision: (await inspect(authoring.id)).promotion.revision,
          }),
        },
      );
      expect(retired.status).toBe(200);
      expect(await activeGiftCount()).toBe(0);

      const raceA = await readyGift(uniqueCode("racea"));
      const raceB = await readyGift(uniqueCode("raceb"));
      const [raceLeft, raceRight] = await Promise.all([
        fetch(`${base}/api/admin/v1/brands/${brandId}/promotions/${raceA.id}/activate`, {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({ expectedPromotionRevision: raceA.revision }),
        }),
        fetch(`${base}/api/admin/v1/brands/${brandId}/promotions/${raceB.id}/activate`, {
          method: "POST",
          headers: headers(adminCookie),
          body: JSON.stringify({ expectedPromotionRevision: raceB.revision }),
        }),
      ]);
      const raceBodies = await Promise.all([readJson(raceLeft), readJson(raceRight)]);
      const successes = raceBodies.filter((body) => body.ok === true);
      const failures = raceBodies.filter((body) => body.ok !== true);
      expect(successes).toHaveLength(1);
      expect(failures).toHaveLength(1);
      expect([COPY_OP_RACE, COPY_OP_SECOND]).toContain(failures[0]?.message);
      expect(await activeGiftCount()).toBe(1);
      const statuses = await Promise.all([inspect(raceA.id), inspect(raceB.id)]);
      expect(statuses.filter((row) => row.promotion.status === "active")).toHaveLength(1);
      expect(statuses.filter((row) => row.promotion.status === "draft")).toHaveLength(1);

      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await runtime.close();
      await Promise.all(openHandles.map((handle) => handle.close()));
    });
  });
});
