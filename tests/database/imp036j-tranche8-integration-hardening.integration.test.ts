/**
 * IMP-036J Tranche 8 — integration re-proof for the 0047–0049 migration chain,
 * historical snapshot immutability, and privacy negatives.
 * Real Testcontainers PostgreSQL only.
 */
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, inject, it } from "vitest";

import { MIGRATIONS_SCHEMA, MIGRATIONS_TABLE } from "../../src/platform/database";
import {
  applyMigrations,
  withIsolatedTestDatabase,
  withTestDatabaseClient,
} from "./support/test-database";

function adminConnectionInfo() {
  return {
    connectionString: inject("bobaBearTestAdminConnectionString"),
    host: inject("bobaBearTestAdminHost"),
    port: inject("bobaBearTestAdminPort"),
  };
}

type JournalEntry = Readonly<{
  idx: number;
  tag: string;
}>;

const PRE_CHANGE_IDX = 46;
const T1_TAG = "0047_imp036j_tranche1_commercial_persistence";
const T2_TAG = "0048_imp036j_tranche2_measurement_persistence";
const T7_TAG = "0049_imp036j_tranche7_immutable_publication";

function loadJournalEntries(): readonly JournalEntry[] {
  const journal = JSON.parse(
    readFileSync(path.join(process.cwd(), "drizzle/meta/_journal.json"), "utf8"),
  ) as { entries: JournalEntry[] };
  return journal.entries;
}

async function applySqlMigrationFile(connectionString: string, tag: string): Promise<void> {
  const sqlPath = path.join(process.cwd(), "drizzle", `${tag}.sql`);
  const raw = readFileSync(sqlPath, "utf8");
  const statements = raw
    .split(/-->\s*statement-breakpoint/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  await withTestDatabaseClient(connectionString, async (client) => {
    for (const statement of statements) {
      await client.pool.query(statement);
    }
    const hash = createHash("sha256").update(raw).digest("hex");
    await client.pool.query(`CREATE SCHEMA IF NOT EXISTS ${MIGRATIONS_SCHEMA}`);
    await client.pool.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);
    await client.pool.query(
      `INSERT INTO ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE} (hash, created_at) VALUES ($1, $2)`,
      [hash, Date.now()],
    );
  });
}

async function applyMigrationsThrough(connectionString: string, throughIdx: number): Promise<void> {
  for (const entry of loadJournalEntries().filter((row) => row.idx <= throughIdx)) {
    await applySqlMigrationFile(connectionString, entry.tag);
  }
}

describe("IMP-036J tranche 8 integration hardening", () => {
  it("keeps 0047, 0048, and 0049 sequential and coherent", () => {
    const entries = loadJournalEntries();
    const tags = entries.map((entry) => entry.tag);
    expect(tags).toContain(T1_TAG);
    expect(tags).toContain(T2_TAG);
    expect(tags).toContain(T7_TAG);
    const t1 = entries.find((entry) => entry.tag === T1_TAG)!;
    const t2 = entries.find((entry) => entry.tag === T2_TAG)!;
    const t7 = entries.find((entry) => entry.tag === T7_TAG)!;
    expect(t1.idx).toBe(47);
    expect(t2.idx).toBe(48);
    expect(t7.idx).toBe(49);
    expect(t2.idx).toBe(t1.idx + 1);
    expect(t7.idx).toBe(t2.idx + 1);
    expect(entries.filter((entry) => entry.idx === t1.idx)).toHaveLength(1);
    expect(entries.filter((entry) => entry.idx === t2.idx)).toHaveLength(1);
    expect(entries.filter((entry) => entry.idx === t7.idx)).toHaveLength(1);
  });

  it("applies the empty-database chain through 0049", async () => {
    const entries = loadJournalEntries();
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      await withTestDatabaseClient(database.connectionString, async (client) => {
        const history = await client.pool.query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE}`,
        );
        expect(Number(history.rows[0]?.count)).toBe(entries.length);
        const tables = await client.pool.query<{ table_name: string }>(
          `SELECT table_name FROM information_schema.tables
           WHERE table_schema = 'app'
             AND table_name IN (
               'first_order_purchase_guards',
               'checkout_journey_facts',
               'measurement_report_snapshots'
             )
           ORDER BY table_name`,
        );
        expect(tables.rows.map((row) => row.table_name)).toEqual([
          "checkout_journey_facts",
          "first_order_purchase_guards",
          "measurement_report_snapshots",
        ]);
        const customerFirstOrder = await client.pool.query(
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'app' AND table_name = 'customer_auth_users'
             AND column_name = 'first_order'`,
        );
        expect(customerFirstOrder.rows).toHaveLength(0);
      });
    });
  });

  it("upgrades a pre-IMP-036J snapshot through 0047–0049 without rewriting purchased money", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrationsThrough(database.connectionString, PRE_CHANGE_IDX);
      const brandId = randomUUID();
      const orgId = randomUUID();
      const territoryId = randomUUID();
      const legalEntityId = randomUUID();
      const outletId = randomUUID();
      const checkoutId = randomUUID();
      const snapshotId = randomUUID();
      const cartId = randomUUID();
      const lineId = randomUUID();
      const productId = randomUUID();
      const variantId = randomUUID();
      const cartLineId = randomUUID();
      const customerId = `t8-${randomUUID().slice(0, 8)}`;
      const tag = randomUUID().slice(0, 8);

      await withTestDatabaseClient(database.connectionString, async (client) => {
        await client.pool.query(
          `INSERT INTO app.brands (id, code, name, status, created_at, updated_at)
           VALUES ($1::uuid, $2, $3, 'active', now(), now())`,
          [brandId, `b-${tag}`, `Brand ${tag}`],
        );
        await client.pool.query(
          `INSERT INTO app.organizations (id, brand_id, code, name, status, created_at, updated_at)
           VALUES ($1::uuid, $2::uuid, $3, $4, 'active', now(), now())`,
          [orgId, brandId, `o-${tag}`, `Org ${tag}`],
        );
        await client.pool.query(
          `INSERT INTO app.territories (id, brand_id, code, name, status, created_at, updated_at)
           VALUES ($1::uuid, $2::uuid, $3, $4, 'active', now(), now())`,
          [territoryId, brandId, `t-${tag}`, `Territory ${tag}`],
        );
        await client.pool.query(
          `INSERT INTO app.legal_entities (
             id, brand_id, organization_id, code, name, status, created_at, updated_at
           ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, 'active', now(), now())`,
          [legalEntityId, brandId, orgId, `le-${tag}`, `LE ${tag}`],
        );
        await client.pool.query(
          `INSERT INTO app.outlets (
             id, brand_id, organization_id, territory_id, legal_entity_id,
             code, name, status, created_at, updated_at
           ) VALUES (
             $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
             $6, $7, 'active', now(), now()
           )`,
          [outletId, brandId, orgId, territoryId, legalEntityId, `out-${tag}`, `Outlet ${tag}`],
        );
        await client.pool.query(
          `INSERT INTO app.customer_auth_users (
             id, name, email, email_verified, phone_number, phone_number_verified, created_at, updated_at
           ) VALUES ($1, $2, $3, false, $4, true, now(), now())`,
          [customerId, "T8 Hist", `${tag}@example.com`, `+91801${tag.replace(/\D/g, "").padEnd(8, "0").slice(0, 8)}`],
        );
        await client.pool.query(
          `INSERT INTO app.carts (
             id, brand_id, customer_auth_user_id, revision, created_at, updated_at
           ) VALUES ($1::uuid, $2::uuid, $3, 1, now(), now())`,
          [cartId, brandId, customerId],
        );
        await client.pool.query(
          `INSERT INTO app.checkouts (
             id, customer_auth_user_id, brand_id, cart_id, source_cart_revision,
             revision, status, expires_at, fulfilment_mode, fulfilment_timing, created_at, updated_at
           ) VALUES (
             $1::uuid, $2, $3::uuid, $4::uuid, 1, 1, 'DRAFT',
             now() + interval '1 hour', 'DELIVERY', 'ASAP', now(), now()
           )`,
          [checkoutId, customerId, brandId, cartId],
        );
        await client.pool.query(
          `INSERT INTO app.checkout_snapshots (
             id, checkout_id, checkout_revision, source_cart_revision, selected_outlet_id,
             evaluated_at, serviceability_evaluated_at, currency, fulfilment_mode, fulfilment_timing,
             destination_kind, recipient_name, recipient_phone, address_line_1,
             city, state_code, postal_code,
             base_paise, modifier_adjustments_paise, bundle_adjustments_paise, charges_paise,
             pre_promotion_subtotal_paise, promotion_discount_paise, taxable_paise, tax_paise,
             grand_total_paise, tax_inclusion_mode, created_at
           ) VALUES (
             $1::uuid, $2::uuid, 1, 1, $3::uuid,
             now(), now(), 'INR', 'DELIVERY', 'ASAP',
             'ONE_TIME_ADDRESS', 'Hist Guest', '+919876543210', '1 Mall Road',
             'Dehradun', 'IN-UT', '248001',
             10000, 0, 0, 0, 10000, 800, 9200, 460, 9660, 'exclusive', now()
           )`,
          [snapshotId, checkoutId, outletId],
        );
        await client.pool.query(
          `INSERT INTO app.catalog_products (
             id, brand_id, code, name, product_kind, lifecycle_status, created_at, updated_at
           ) VALUES ($1::uuid, $2::uuid, $3, 'Tea', 'standard', 'draft', now(), now())`,
          [productId, brandId, `p-${tag}`],
        );
        await client.pool.query(
          `INSERT INTO app.catalog_variants (
             id, brand_id, product_id, product_kind, code, name, is_default, is_selector_visible,
             lifecycle_status, created_at, updated_at
           ) VALUES (
             $1::uuid, $2::uuid, $3::uuid, 'standard', 'default', 'Regular', true, false,
             'draft', now(), now()
           )`,
          [variantId, brandId, productId],
        );
        await client.pool.query(
          `INSERT INTO app.checkout_snapshot_lines (
             id, snapshot_id, source_cart_line_id, product_id, variant_id,
             product_name, variant_name, quantity,
             line_base_paise, line_modifier_adjustments_paise, line_bundle_adjustments_paise,
             line_subtotal_paise, line_promotion_discount_paise, line_taxable_paise,
             line_tax_paise, line_total_paise, sequence
           ) VALUES (
             $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
             'Tea', 'Regular', 2,
             10000, 0, 0, 10000, 800, 9200, 460, 9660, 0
           )`,
          [lineId, snapshotId, cartLineId, productId, variantId],
        );
      });

      await applySqlMigrationFile(database.connectionString, T1_TAG);
      await applySqlMigrationFile(database.connectionString, T2_TAG);
      await applySqlMigrationFile(database.connectionString, T7_TAG);

      await withTestDatabaseClient(database.connectionString, async (client) => {
        const snapshot = await client.pool.query<{
          grand_total_paise: string;
          promotion_discount_paise: string;
        }>(
          `SELECT grand_total_paise::text, promotion_discount_paise::text
           FROM app.checkout_snapshots WHERE id = $1::uuid`,
          [snapshotId],
        );
        expect(snapshot.rows[0]).toEqual({
          grand_total_paise: "9660",
          promotion_discount_paise: "800",
        });
        const line = await client.pool.query<{
          line_promotion_discount_paise: string;
          line_total_paise: string;
        }>(
          `SELECT line_promotion_discount_paise::text, line_total_paise::text
           FROM app.checkout_snapshot_lines WHERE id = $1::uuid`,
          [lineId],
        );
        expect(line.rows[0]).toEqual({
          line_promotion_discount_paise: "800",
          line_total_paise: "9660",
        });
        const facts = await client.pool.query<{ c: string }>(
          `SELECT COUNT(*)::text AS c FROM app.checkout_journey_facts`,
        );
        expect(facts.rows[0]?.c).toBe("0");
        const observations = await client.pool.query<{ c: string }>(
          `SELECT COUNT(*)::text AS c FROM app.commercial_presentation_observations`,
        );
        expect(observations.rows[0]?.c).toBe("0");
        const snapshots = await client.pool.query<{ c: string }>(
          `SELECT COUNT(*)::text AS c FROM app.measurement_report_snapshots`,
        );
        expect(snapshots.rows[0]?.c).toBe("0");
      });
    });
  });

  it("rejects forbidden measurement identity columns", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      await withTestDatabaseClient(database.connectionString, async (client) => {
        const forbidden = await client.pool.query<{ column_name: string }>(
          `SELECT table_name || '.' || column_name AS column_name
           FROM information_schema.columns
           WHERE table_schema = 'app'
             AND table_name IN (
               'checkout_journey_heads',
               'checkout_journey_facts',
               'commercial_evaluations',
               'commercial_presentation_observations',
               'offer_result_views',
               'cart_checkout_activations',
               'checkout_review_surface_tokens',
               'commercial_command_origins',
               'commercial_command_results',
               'measurement_report_snapshots'
             )
             AND (
               column_name ~* 'customer|guest|coupon|bearer|session|secret|eligibility|instrument|plaintext'
               OR column_name IN ('token', 'review_surface_token', 'complimentary_line')
             )`,
        );
        expect(forbidden.rows).toEqual([]);
      });
    });
  });
});
