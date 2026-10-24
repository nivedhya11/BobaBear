/**
 * IMP-036J #381 diagnostic — which operator-reachable create inputs end as HTTP 500.
 *
 * Characterises current server behaviour; it does not assert that the behaviour is
 * correct. The create route runs `createPromotionDraft` in a transaction and passes any
 * thrown error to `mapPromotionsAdminError`; this drives that same pair against a real
 * migrated PostgreSQL. Disposable Testcontainers only; no staging data.
 *
 * Run: node scripts/run-vitest.mjs run --config vitest.database.config.mts <this file>
 */
import { randomUUID } from "node:crypto";

import { afterEach, describe, expect, inject, it } from "vitest";

import { mapPromotionsAdminError } from "../../src/server/operations/http/admin-promotions-error-map";
import { createPromotionDraft } from "../../src/server/promotions";
import { applyMigrations, withIsolatedTestDatabase } from "../database/support/test-database";
import { seedPromotionsHarness, type PromotionsHarness } from "../database/support/promotions-fixtures";

const openHandles: Array<{ close(): Promise<void> }> = [];
afterEach(async () => {
  await Promise.all(openHandles.splice(0).map((h) => h.close()));
});

function adminConnectionInfo() {
  return {
    connectionString: inject("bobaBearTestAdminConnectionString"),
    host: inject("bobaBearTestAdminHost"),
    port: inject("bobaBearTestAdminPort"),
  };
}

type Outcome = Readonly<{
  status: number;
  code: string;
  sqlState: string | null;
  constraint: string | null;
}>;

function pgField(error: unknown, field: "code" | "constraint"): string | null {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    const value = (current as Record<string, unknown>)[field];
    if (typeof value === "string" && (field !== "code" || /^[0-9A-Z]{5}$/.test(value))) {
      return value;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return null;
}

async function attemptCreate(
  harness: PromotionsHarness,
  input: Readonly<{
    code: string;
    displayName?: string;
    scopeType?: "brand" | "territory";
    territoryId?: string | null;
  }>,
): Promise<Outcome> {
  try {
    await harness.persistence.transaction((tx) =>
      createPromotionDraft(tx, {
        actor: harness.brandAdminPrincipal,
        brandId: harness.tree.brand.id,
        code: input.code,
        displayName: input.displayName ?? "Diagnostic offer",
        scopeType: input.scopeType ?? "brand",
        territoryId: input.territoryId ?? null,
        organizationId: null,
        outletId: null,
        triggerType: "coupon",
        startsAt: new Date("2026-10-08T05:51:27Z"),
      }),
    );
    return { status: 200, code: "OK", sqlState: null, constraint: null };
  } catch (error) {
    const mapped = mapPromotionsAdminError(error, "diagnostic-request");
    return {
      status: mapped.status,
      code: mapped.body.code,
      sqlState: pgField(error, "code"),
      constraint: pgField(error, "constraint"),
    };
  }
}

describe("IMP-036J #381 create-promotion HTTP 500 diagnostic", () => {
  it("characterises operator-reachable create inputs against real constraints", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const harness = await seedPromotionsHarness(database.connectionString, openHandles);

      // Control: a lowercase identifier (the shape later created successfully in UAT).
      expect(await attemptCreate(harness, { code: "test123" })).toEqual({
        status: 200,
        code: "OK",
        sqlState: null,
        constraint: null,
      });

      // Control: a duplicate is translated to a domain conflict and maps to a safe 409.
      expect(await attemptCreate(harness, { code: "test123" })).toMatchObject({
        status: 409,
        code: "PROMOTIONS_CONFLICT",
      });

      // Coupon-style identifiers the previous unlabelled "Code" field accepted, and the
      // free-text territory id field. Each currently escapes the error map as INTERNAL_ERROR.
      const formatViolation = {
        status: 500,
        code: "INTERNAL_ERROR",
        sqlState: "23514",
        constraint: "promotions_code_format_check",
      };
      const observed = {
        upperCase: await attemptCreate(harness, { code: "TEST123" }),
        mixedCase: await attemptCreate(harness, { code: "Test123" }),
        space: await attemptCreate(harness, { code: "test 123" }),
        dot: await attemptCreate(harness, { code: "test.123" }),
        territoryNotUuid: await attemptCreate(harness, {
          code: "terr-not-uuid",
          scopeType: "territory",
          territoryId: "north",
        }),
        territoryUnknownUuid: await attemptCreate(harness, {
          code: "terr-unknown",
          scopeType: "territory",
          territoryId: randomUUID(),
        }),
      };
      expect(observed).toEqual({
        upperCase: formatViolation,
        mixedCase: formatViolation,
        space: formatViolation,
        dot: formatViolation,
        territoryNotUuid: {
          status: 500,
          code: "INTERNAL_ERROR",
          sqlState: "22P02",
          constraint: null,
        },
        territoryUnknownUuid: {
          status: 500,
          code: "INTERNAL_ERROR",
          sqlState: "23503",
          constraint: "promotions_territory_brand_fk",
        },
      });
    });
  }, 120_000);
});
