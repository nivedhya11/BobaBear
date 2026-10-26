/**
 * IMP-036J #381 — create-promotion request-shape failures over real HTTP
 * and a migrated disposable PostgreSQL.
 *
 * Binding rules this file is allowed to treat as HTTP 400
 * PROMOTIONS_REQUEST_INVALID (existing PromotionValidationError envelope):
 * - promotions.code must satisfy promotions_code_format_check:
 *   ^[a-z0-9][a-z0-9_-]*$ and length 1–64. No trim, no case-fold.
 * - territoryId / organizationId / outletId, when the value is a string,
 *   including "", must be a UUID because those columns are uuid. null and
 *   undefined stay omitted. A non-UUID is a shape failure.
 *
 * A well-formed territory UUID that is unknown or belongs to another brand
 * is an existence/foreign-key outcome. No accepted contract chooses 400
 * versus 404 for that case, so it stays the current HTTP 500. SQLSTATE 57P01
 * is harness connection teardown, not this failure.
 *
 * Run: node scripts/run-vitest.mjs run --config vitest.database.config.mts <this file>
 */
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

import { serializeSignedCookie } from "better-call";
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, inject, it } from "vitest";

import { createMembership, grantRole } from "../../src/server/access-control";
import {
  getWorkforceAuthRuntime,
  WORKFORCE_AUTH_SESSION_COOKIE_NAME,
} from "../../src/server/auth/workforce";
import { loadAuthFoundationConfig } from "../../src/server/auth/shared/config";
import { routeOperationsRequest } from "../../src/server/operations/http/router";
import { mapPromotionsAdminError } from "../../src/server/operations/http/admin-promotions-error-map";
import { getApplicationPersistence } from "../../src/server/persistence";
import { createPromotionDraft } from "../../src/server/promotions";
import {
  promotionAuditEventsTable,
  promotionsTable,
} from "../../src/platform/database/schema/promotions";
import type { WebConfig } from "../../src/platform/config";
import {
  createEligibleWorkforceUser,
  seedBrandTree,
} from "../database/support/access-control-fixtures";
import { applyMigrations, withIsolatedTestDatabase } from "../database/support/test-database";
import {
  seedPromotionsHarness,
  type PromotionsHarness,
} from "../database/support/promotions-fixtures";

const REQUEST_ID = "redacted-381";
const STARTS_AT = "2026-10-08T05:51:27.000Z";
const SQL_LEAK = /23514|23503|23505|22P02|57P01|promotions_code_format|promotions_territory_brand|SQLSTATE/i;

type InternalAdapter = { createSession: (userId: string) => Promise<{ token: string }> };

type StoreSnapshot = Readonly<{
  codes: readonly string[];
  createdAudits: number;
}>;

type PrivateDriverEvidence = Readonly<{
  status: number;
  code: string;
  sqlState: string | null;
  constraint: string | null;
}>;

const openHandles: Array<{ close(): Promise<void> }> = [];
afterEach(async () => {
  await Promise.all(openHandles.splice(0).map((handle) => handle.close()));
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

function workforceAuthConfig() {
  return loadAuthFoundationConfig(
    {
      CUSTOMER_AUTH_SECRET: "promo-381-http-customer-auth-secret-32",
      CUSTOMER_AUTH_BASE_URL: "http://localhost:3100",
      WORKFORCE_AUTH_SECRET: "promo-381-http-workforce-auth-secret",
      WORKFORCE_AUTH_BASE_URL: "http://localhost:3200",
    },
    "test",
  );
}

async function signedCookie(token: string): Promise<string> {
  const cookie = await serializeSignedCookie(
    WORKFORCE_AUTH_SESSION_COOKIE_NAME,
    token,
    workforceAuthConfig().workforce.secret,
  );
  return cookie.split(";", 1)[0]!;
}

async function adapterFor(runtime: {
  getAuth: () => Promise<{ $context: Promise<unknown> }>;
}): Promise<InternalAdapter> {
  const auth = await runtime.getAuth();
  return ((await auth.$context) as { internalAdapter: InternalAdapter }).internalAdapter;
}

function pgField(error: unknown, field: "code" | "constraint"): string | null {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth += 1) {
    const value = (current as Record<string, unknown>)[field];
    if (typeof value === "string" && (field !== "code" || /^[0-9A-Z]{5}$/.test(value))) {
      return value;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return null;
}

function createBody(
  input: Readonly<{
    code: string;
    scopeType?: "brand" | "territory";
    territoryId?: string;
    organizationId?: string;
    outletId?: string;
  }>,
) {
  return {
    code: input.code,
    displayName: "Diagnostic offer",
    scopeType: input.scopeType ?? "brand",
    triggerType: "coupon" as const,
    startsAt: STARTS_AT,
    ...(input.territoryId === undefined ? {} : { territoryId: input.territoryId }),
    ...(input.organizationId === undefined ? {} : { organizationId: input.organizationId }),
    ...(input.outletId === undefined ? {} : { outletId: input.outletId }),
  };
}

async function snapshot(harness: PromotionsHarness, brandId: string): Promise<StoreSnapshot> {
  return harness.persistence.withContext(async (ctx) => {
    const promotions = await ctx.db
      .select({ code: promotionsTable.code })
      .from(promotionsTable)
      .where(eq(promotionsTable.brandId, brandId));
    const audits = await ctx.db
      .select({ action: promotionAuditEventsTable.action })
      .from(promotionAuditEventsTable)
      .where(eq(promotionAuditEventsTable.brandId, brandId));
    return {
      codes: promotions.map((row) => row.code).sort(),
      createdAudits: audits.filter((row) => row.action === "promotion.created").length,
    };
  });
}

async function privateDriverEvidence(
  harness: PromotionsHarness,
  input: Readonly<{
    code: string;
    scopeType?: "brand" | "territory";
    territoryId?: string | null;
    organizationId?: string | null;
    outletId?: string | null;
  }>,
): Promise<PrivateDriverEvidence> {
  try {
    await harness.persistence.transaction((tx) =>
      createPromotionDraft(tx, {
        actor: harness.brandAdminPrincipal,
        brandId: harness.tree.brand.id,
        code: input.code,
        displayName: "Diagnostic offer",
        scopeType: input.scopeType ?? "brand",
        territoryId: input.territoryId ?? null,
        organizationId: input.organizationId ?? null,
        outletId: input.outletId ?? null,
        triggerType: "coupon",
        startsAt: new Date(STARTS_AT),
      }),
    );
    return { status: 200, code: "OK", sqlState: null, constraint: null };
  } catch (error) {
    const mapped = mapPromotionsAdminError(error, REQUEST_ID);
    return {
      status: mapped.status,
      code: mapped.body.code,
      sqlState: pgField(error, "code"),
      constraint: pgField(error, "constraint"),
    };
  }
}

describe("IMP-036J #381 create-promotion HTTP validation", () => {
  it("corrects contract-backed shape failures and leaves unbound territory existence as 500", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const harness = await seedPromotionsHarness(database.connectionString, openHandles);
      const otherTree = await harness.persistence.transaction((tx) => seedBrandTree(tx, "o381"));
      const otherBrandAdmin = await createEligibleWorkforceUser(harness.persistence);
      const kitchen = await createEligibleWorkforceUser(harness.persistence);
      await harness.persistence.transaction(async (tx) => {
        const otherMembership = await createMembership(tx, {
          workforceUserId: otherBrandAdmin.id,
          scope: { scopeType: "brand", brandId: otherTree.brand.id },
          status: "active",
        });
        await grantRole(tx, { membershipId: otherMembership.id, roleKey: "brand_admin" });
        const kitchenMembership = await createMembership(tx, {
          workforceUserId: kitchen.id,
          scope: {
            scopeType: "outlet",
            brandId: harness.tree.brand.id,
            organizationId: harness.tree.orgA.id,
            territoryId: harness.tree.terrA.id,
            outletId: harness.tree.outletA.id,
          },
          status: "active",
        });
        await grantRole(tx, { membershipId: kitchenMembership.id, roleKey: "kitchen_operator" });
      });

      const runtime = getWorkforceAuthRuntime({
        auth: workforceAuthConfig().workforce,
        persistence: applicationConfig(database.connectionString),
      });
      openHandles.push(runtime);
      const adapter = await adapterFor(runtime);
      const server = createServer((req, res) => {
        void routeOperationsRequest(
          req,
          res,
          {
            runtime,
            persistence: harness.persistence,
            trustedOrigin: workforceAuthConfig().workforce.baseURL.origin,
            stepUpSessionHashSecret: workforceAuthConfig().workforce.secret,
          },
          REQUEST_ID,
        );
      });
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing test server address");
      const base = `http://127.0.0.1:${address.port}`;
      openHandles.push({
        close: () =>
          new Promise<void>((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
          }),
      });

      const brandId = harness.tree.brand.id;
      const path = `/api/admin/v1/brands/${brandId}/promotions`;
      const headersFor = async (userId: string) => {
        const session = await adapter.createSession(userId);
        return {
          cookie: await signedCookie(session.token),
          origin: workforceAuthConfig().workforce.baseURL.origin,
          "content-type": "application/json",
        };
      };
      const post = async (
        userId: string | null,
        body: unknown,
        targetPath = path,
      ) => {
        const response = await fetch(`${base}${targetPath}`, {
          method: "POST",
          headers: userId ? await headersFor(userId) : { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = (await response.json()) as Record<string, unknown>;
        return { status: response.status, body: json };
      };

      expect(await snapshot(harness, brandId)).toEqual({ codes: [], createdAudits: 0 });

      const created = await post(harness.brandAdmin.id, createBody({ code: "test123" }));
      expect(created.status).toBe(200);
      expect(created.body).toMatchObject({
        ok: true,
        promotion: { revision: "1" },
      });
      expect(typeof (created.body.promotion as { id: string }).id).toBe("string");
      expect(JSON.stringify(created.body)).not.toMatch(SQL_LEAK);
      expect(await snapshot(harness, brandId)).toEqual({
        codes: ["test123"],
        createdAudits: 1,
      });

      const duplicate = await post(harness.brandAdmin.id, createBody({ code: "test123" }));
      expect(duplicate).toMatchObject({
        status: 409,
        body: { ok: false, code: "PROMOTIONS_CONFLICT", requestId: REQUEST_ID },
      });
      expect(JSON.stringify(duplicate.body)).not.toMatch(SQL_LEAK);
      expect(await privateDriverEvidence(harness, { code: "test123" })).toMatchObject({
        status: 409,
        code: "PROMOTIONS_CONFLICT",
        sqlState: null,
        constraint: null,
      });
      expect(await snapshot(harness, brandId)).toEqual({
        codes: ["test123"],
        createdAudits: 1,
      });

      const invalidCodes = ["TEST123", "Test123", "test 123", "test.123"] as const;
      for (const code of invalidCodes) {
        const before = await snapshot(harness, brandId);
        const http = await post(harness.brandAdmin.id, createBody({ code }));
        expect(http.status, code).toBe(400);
        expect(http.body).toMatchObject({
          ok: false,
          code: "PROMOTIONS_REQUEST_INVALID",
          requestId: REQUEST_ID,
        });
        expect(JSON.stringify(http.body)).not.toMatch(SQL_LEAK);
        expect(await privateDriverEvidence(harness, { code }), code).toEqual({
          status: 400,
          code: "PROMOTIONS_REQUEST_INVALID",
          sqlState: null,
          constraint: null,
        });
        expect(await snapshot(harness, brandId), code).toEqual(before);
      }

      const territoryNotUuid = await post(
        harness.brandAdmin.id,
        createBody({ code: "terr-not-uuid", scopeType: "territory", territoryId: "north" }),
      );
      expect(territoryNotUuid.status).toBe(400);
      expect(territoryNotUuid.body).toMatchObject({
        ok: false,
        code: "PROMOTIONS_REQUEST_INVALID",
        requestId: REQUEST_ID,
      });
      expect(JSON.stringify(territoryNotUuid.body)).not.toMatch(SQL_LEAK);
      expect(
        await privateDriverEvidence(harness, {
          code: "terr-not-uuid",
          scopeType: "territory",
          territoryId: "north",
        }),
      ).toEqual({
        status: 400,
        code: "PROMOTIONS_REQUEST_INVALID",
        sqlState: null,
        constraint: null,
      });

      const emptyScopeIds = [
        {
          label: "brand territoryId empty",
          body: createBody({ code: "brand-empty-terr", territoryId: "" }),
          driver: { code: "brand-empty-terr", territoryId: "" },
        },
        {
          label: "territory organizationId empty",
          body: createBody({
            code: "terr-empty-org",
            scopeType: "territory",
            territoryId: harness.tree.terrA.id,
            organizationId: "",
          }),
          driver: {
            code: "terr-empty-org",
            scopeType: "territory" as const,
            territoryId: harness.tree.terrA.id,
            organizationId: "",
          },
        },
        {
          label: "territory outletId empty",
          body: createBody({
            code: "terr-empty-outlet",
            scopeType: "territory",
            territoryId: harness.tree.terrA.id,
            outletId: "",
          }),
          driver: {
            code: "terr-empty-outlet",
            scopeType: "territory" as const,
            territoryId: harness.tree.terrA.id,
            outletId: "",
          },
        },
      ] as const;
      for (const emptyScope of emptyScopeIds) {
        const before = await snapshot(harness, brandId);
        const http = await post(harness.brandAdmin.id, emptyScope.body);
        expect(http.status, emptyScope.label).toBe(400);
        expect(http.body, emptyScope.label).toMatchObject({
          ok: false,
          code: "PROMOTIONS_REQUEST_INVALID",
          requestId: REQUEST_ID,
        });
        expect(JSON.stringify(http.body), emptyScope.label).not.toMatch(SQL_LEAK);
        expect(await privateDriverEvidence(harness, emptyScope.driver), emptyScope.label).toEqual({
          status: 400,
          code: "PROMOTIONS_REQUEST_INVALID",
          sqlState: null,
          constraint: null,
        });
        expect(await snapshot(harness, brandId), emptyScope.label).toEqual(before);
      }

      const unknownTerritoryId = randomUUID();
      const unknownTerritory = await post(
        harness.brandAdmin.id,
        createBody({
          code: "terr-unknown",
          scopeType: "territory",
          territoryId: unknownTerritoryId,
        }),
      );
      expect(unknownTerritory).toMatchObject({
        status: 500,
        body: { ok: false, code: "INTERNAL_ERROR", requestId: REQUEST_ID },
      });
      expect(unknownTerritory.body).toEqual({
        ok: false,
        code: "INTERNAL_ERROR",
        requestId: REQUEST_ID,
      });
      expect(
        await privateDriverEvidence(harness, {
          code: "terr-unknown",
          scopeType: "territory",
          territoryId: unknownTerritoryId,
        }),
      ).toEqual({
        status: 500,
        code: "INTERNAL_ERROR",
        sqlState: "23503",
        constraint: "promotions_territory_brand_fk",
      });

      const foreignTerritory = await post(
        harness.brandAdmin.id,
        createBody({
          code: "terr-foreign",
          scopeType: "territory",
          territoryId: otherTree.terrA.id,
        }),
      );
      expect(foreignTerritory.body).toEqual({
        ok: false,
        code: "INTERNAL_ERROR",
        requestId: REQUEST_ID,
      });
      expect(foreignTerritory.status).toBe(500);
      expect(
        await privateDriverEvidence(harness, {
          code: "terr-foreign",
          scopeType: "territory",
          territoryId: otherTree.terrA.id,
        }),
      ).toEqual({
        status: 500,
        code: "INTERNAL_ERROR",
        sqlState: "23503",
        constraint: "promotions_territory_brand_fk",
      });

      const beforeDenial = await snapshot(harness, brandId);
      const kitchenDenied = await post(kitchen.id, createBody({ code: "denied-kitchen" }));
      expect(kitchenDenied).toMatchObject({
        status: 403,
        body: { ok: false, code: "PROMOTIONS_UNAUTHORIZED", requestId: REQUEST_ID },
      });
      expect(JSON.stringify(kitchenDenied.body)).not.toMatch(SQL_LEAK);
      const otherBrandDenied = await post(
        otherBrandAdmin.id,
        createBody({ code: "cross-brand" }),
      );
      expect(otherBrandDenied).toMatchObject({
        status: 403,
        body: { ok: false, code: "PROMOTIONS_UNAUTHORIZED", requestId: REQUEST_ID },
      });
      expect(await snapshot(harness, brandId)).toEqual(beforeDenial);
      expect(await snapshot(harness, otherTree.brand.id)).toEqual({
        codes: [],
        createdAudits: 0,
      });

      const ownedTerritory = await post(
        harness.brandAdmin.id,
        createBody({
          code: "terr-owned",
          scopeType: "territory",
          territoryId: harness.tree.terrA.id,
        }),
      );
      expect(ownedTerritory.status).toBe(200);
      expect(ownedTerritory.body).toMatchObject({ ok: true, promotion: { revision: "1" } });
      expect(await snapshot(harness, brandId)).toEqual({
        codes: ["terr-owned", "test123"],
        createdAudits: 2,
      });
    });
  }, 180_000);
});
