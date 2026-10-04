/**
 * IMP-036J tranche 2 measurement persistence (0048).
 * Real Testcontainers PostgreSQL only. No runtime writers.
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

const TRANCHE_2_IDX = 48;
const TRANCHE_2_TAG = "0048_imp036j_tranche2_measurement_persistence";
const PRE_TRANCHE_IDX = 47;

const FINGERPRINT = createHash("sha256").update("authoritative-result").digest();
const OTHER_FINGERPRINT = createHash("sha256").update("other-result").digest();
const TOKEN_A = createHash("sha256").update("review-token-a").digest();
const TOKEN_B = createHash("sha256").update("review-token-b").digest();

function loadJournalEntries(): readonly JournalEntry[] {
  const journal = JSON.parse(
    readFileSync(path.join(process.cwd(), "drizzle/meta/_journal.json"), "utf8"),
  ) as { entries: JournalEntry[] };
  return journal.entries;
}

async function applySqlMigrationFile(
  connectionString: string,
  tag: string,
): Promise<void> {
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
    await client.pool.query(
      `CREATE SCHEMA IF NOT EXISTS ${MIGRATIONS_SCHEMA}`,
    );
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

async function applyMigrationsThrough(
  connectionString: string,
  throughIdx: number,
): Promise<void> {
  const entries = loadJournalEntries().filter((entry) => entry.idx <= throughIdx);
  for (const entry of entries) {
    await applySqlMigrationFile(connectionString, entry.tag);
  }
}

async function expectCheckViolation(
  connectionString: string,
  sql: string,
  params: readonly unknown[] = [],
): Promise<void> {
  await expect(
    withTestDatabaseClient(connectionString, (client) => client.pool.query(sql, [...params])),
  ).rejects.toMatchObject({ code: "23514" });
}

async function expectUniqueViolation(
  connectionString: string,
  sql: string,
  params: readonly unknown[] = [],
): Promise<void> {
  await expect(
    withTestDatabaseClient(connectionString, (client) => client.pool.query(sql, [...params])),
  ).rejects.toMatchObject({ code: "23505" });
}

type Graph = Readonly<{
  brandId: string;
  customerId: string;
  cartId: string;
  checkoutId: string;
}>;

async function seedGraph(connectionString: string, tag: string): Promise<Graph> {
  const brandId = randomUUID();
  const cartId = randomUUID();
  const checkoutId = randomUUID();
  const customerId = `mig-036j-t2-${tag}`;
  const phoneTail = tag.replace(/\D/g, "").slice(0, 8).padEnd(8, "0");

  await withTestDatabaseClient(connectionString, async (client) => {
    await client.pool.query(
      `INSERT INTO app.brands (id, code, name, status, created_at, updated_at)
       VALUES ($1::uuid, $2, $3, 'active', now(), now())`,
      [brandId, `b-${tag}`, `Brand ${tag}`],
    );
    await client.pool.query(
      `INSERT INTO app.customer_auth_users (
         id, name, email, email_verified, phone_number, phone_number_verified, created_at, updated_at
       ) VALUES ($1, $2, $3, false, $4, true, now(), now())`,
      [customerId, "Mig User", `${tag}@example.com`, `+91810${phoneTail}`],
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
  });

  return { brandId, customerId, cartId, checkoutId };
}

async function insertCartOnly(
  connectionString: string,
  tag: string,
): Promise<{ cartId: string; brandId: string; customerId: string }> {
  const brandId = randomUUID();
  const cartId = randomUUID();
  const customerId = `mig-036j-t2-cart-${tag}`;
  const phoneTail = tag.replace(/\D/g, "").slice(0, 8).padEnd(8, "1");
  await withTestDatabaseClient(connectionString, async (client) => {
    await client.pool.query(
      `INSERT INTO app.brands (id, code, name, status, created_at, updated_at)
       VALUES ($1::uuid, $2, $3, 'active', now(), now())`,
      [brandId, `bc-${tag}`, `Brand ${tag}`],
    );
    await client.pool.query(
      `INSERT INTO app.customer_auth_users (
         id, name, email, email_verified, phone_number, phone_number_verified, created_at, updated_at
       ) VALUES ($1, $2, $3, false, $4, true, now(), now())`,
      [customerId, "Cart User", `${tag}-cart@example.com`, `+91811${phoneTail}`],
    );
    await client.pool.query(
      `INSERT INTO app.carts (
         id, brand_id, customer_auth_user_id, revision, created_at, updated_at
       ) VALUES ($1::uuid, $2::uuid, $3, 1, now(), now())`,
      [cartId, brandId, customerId],
    );
  });
  return { cartId, brandId, customerId };
}

async function insertHead(connectionString: string, journeyKey: string): Promise<void> {
  await withTestDatabaseClient(connectionString, (client) =>
    client.pool.query(
      `INSERT INTO app.checkout_journey_heads (checkout_journey_key, next_sequence)
       VALUES ($1::uuid, 1)`,
      [journeyKey],
    ),
  );
}

async function insertEvaluation(
  connectionString: string,
  input: {
    evaluationId: string;
    cartId: string;
    checkoutId: string | null;
    surfaceScope: "CART" | "CHECKOUT";
    fingerprint?: Buffer;
    occurrenceOrdinal?: number;
    journeyKey?: string | null;
  },
): Promise<void> {
  await withTestDatabaseClient(connectionString, (client) =>
    client.pool.query(
      `INSERT INTO app.commercial_evaluations (
         evaluation_id, cart_id, checkout_id, checkout_journey_key, surface_scope,
         result_fingerprint, expected_components, expected_total_saved_paise,
         expected_progress_present, expected_progress_remaining_paise,
         expected_coarse_shape, explanation_reason_class,
         server_explanation_integrity, occurrence_ordinal, occurred_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5,
         $6, '[]'::jsonb, 0, false, null,
         'NONE', 'NONE', true, $7, now()
       )`,
      [
        input.evaluationId,
        input.cartId,
        input.checkoutId,
        input.journeyKey ?? null,
        input.surfaceScope,
        input.fingerprint ?? FINGERPRINT,
        input.occurrenceOrdinal ?? 1,
      ],
    ),
  );
}

function factSql(): string {
  return `INSERT INTO app.checkout_journey_facts (
    fact_id, checkout_journey_key, fact_kind, journey_sequence, occurred_at,
    idempotency_key, evaluation_id, activation_id, result_fingerprint,
    presentation_class, coarse_outcome
  ) VALUES (
    $1::uuid, $2::uuid, $3, $4, now(), $5, $6::uuid, $7::uuid, $8, $9, $10
  )`;
}

describe("IMP-036J tranche 2 measurement persistence", () => {
  it("records migration 0048 as the next journal entry after tranche 1", () => {
    const entries = loadJournalEntries();
    const t2 = entries.find((entry) => entry.tag === TRANCHE_2_TAG);
    expect(t2?.idx).toBe(TRANCHE_2_IDX);
    expect(entries.some((entry) => entry.idx === PRE_TRANCHE_IDX)).toBe(true);
    const sql = readFileSync(
      path.join(process.cwd(), "drizzle", `${TRANCHE_2_TAG}.sql`),
      "utf8",
    );
    expect(sql).not.toMatch(/\$\d/);
  });

  it("applies every migration through T2 on an empty database", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      await withTestDatabaseClient(database.connectionString, async (client) => {
        const tables = await client.pool.query<{ table_name: string }>(
          `SELECT table_name FROM information_schema.tables
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
           ORDER BY table_name`,
        );
        expect(tables.rows.map((row) => row.table_name)).toEqual([
          "cart_checkout_activations",
          "checkout_journey_facts",
          "checkout_journey_heads",
          "checkout_review_surface_tokens",
          "commercial_command_origins",
          "commercial_command_results",
          "commercial_evaluations",
          "commercial_presentation_observations",
          "measurement_report_snapshots",
          "offer_result_views",
        ]);
      });
    });
  });

  it("keeps historical checkout rows valid with null measurement identities", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrationsThrough(database.connectionString, PRE_TRANCHE_IDX);
      const graph = await seedGraph(database.connectionString, "hist");
      await applySqlMigrationFile(database.connectionString, TRANCHE_2_TAG);
      await withTestDatabaseClient(database.connectionString, async (client) => {
        const row = await client.pool.query<{
          checkout_journey_key: string | null;
          cart_causal_ordinal: string | null;
        }>(
          `SELECT checkout_journey_key::text, cart_causal_ordinal::text
           FROM app.checkouts WHERE id = $1::uuid`,
          [graph.checkoutId],
        );
        expect(row.rows[0]?.checkout_journey_key).toBeNull();
        expect(row.rows[0]?.cart_causal_ordinal).toBeNull();
      });
    });
  });

  it("enforces measurement identities, scopes, deletion, and privacy", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      const url = database.connectionString;
      await applyMigrations(url);
      const graph = await seedGraph(url, "core");
      const journeyKey = randomUUID();
      await insertHead(url, journeyKey);
      const evaluationId = randomUUID();
      await insertEvaluation(url, {
        evaluationId,
        cartId: graph.cartId,
        checkoutId: graph.checkoutId,
        surfaceScope: "CHECKOUT",
        journeyKey,
      });

      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `UPDATE app.checkouts
           SET checkout_journey_key = $2::uuid, cart_causal_ordinal = 1
           WHERE id = $1::uuid`,
          [graph.checkoutId, journeyKey],
        ),
      );

      await withTestDatabaseClient(url, async (client) => {
        const row = await client.pool.query<{ c: string }>(
          `SELECT count(*)::text AS c FROM app.checkouts
           WHERE id = $1::uuid AND checkout_journey_key = $2::uuid`,
          [graph.checkoutId, journeyKey],
        );
        expect(row.rows[0]?.c).toBe("1");
      });

      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `UPDATE app.checkouts
           SET status = 'CANCELLED', revision = 2, updated_at = now()
           WHERE id = $1::uuid`,
          [graph.checkoutId],
        ),
      );
      const successorId = randomUUID();
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.checkouts (
             id, customer_auth_user_id, brand_id, cart_id, source_cart_revision,
             revision, status, expires_at, fulfilment_mode, fulfilment_timing,
             created_at, updated_at, checkout_journey_key, cart_causal_ordinal
           ) VALUES (
             $1::uuid, $2, $3::uuid, $4::uuid, 1, 1, 'DRAFT',
             now() + interval '1 hour', 'DELIVERY', 'ASAP', now(), now(),
             $5::uuid, 2
           )`,
          [successorId, graph.customerId, graph.brandId, graph.cartId, journeyKey],
        ),
      );
      await expectUniqueViolation(
        url,
        `UPDATE app.checkouts SET cart_causal_ordinal = 1 WHERE id = $1::uuid`,
        [successorId],
      );
      await expectCheckViolation(
        url,
        `UPDATE app.checkouts SET cart_causal_ordinal = 0 WHERE id = $1::uuid`,
        [successorId],
      );

      const insertFact = (
        factId: string,
        kind: string,
        sequence: number,
        idempotency: Buffer,
        extras: {
          evaluationId?: string | null;
          activationId?: string | null;
          fingerprint?: Buffer | null;
          presentationClass?: string | null;
          coarseOutcome?: string | null;
          journeyKey?: string;
        } = {},
      ) =>
        withTestDatabaseClient(url, (client) =>
          client.pool.query(factSql(), [
            factId,
            extras.journeyKey ?? journeyKey,
            kind,
            sequence,
            idempotency,
            extras.evaluationId === undefined ? null : extras.evaluationId,
            extras.activationId ?? null,
            extras.fingerprint === undefined ? null : extras.fingerprint,
            extras.presentationClass ?? null,
            extras.coarseOutcome ?? null,
          ]),
        );

      const reviewFact = randomUUID();
      await insertFact(reviewFact, "REVIEW_PRESENTED", 1, Buffer.from("review-1"), {
        evaluationId,
        presentationClass: "NO_OFFER",
      });
      await expectUniqueViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "REVIEW_PRESENTED",
          2,
          Buffer.from("review-2"),
          evaluationId,
          null,
          null,
          "NO_OFFER",
          null,
        ],
      );
      const raceEvaluation = randomUUID();
      await insertEvaluation(url, {
        evaluationId: raceEvaluation,
        cartId: graph.cartId,
        checkoutId: successorId,
        surfaceScope: "CHECKOUT",
        fingerprint: OTHER_FINGERPRINT,
        occurrenceOrdinal: 2,
        journeyKey,
      });
      const racePayload = [
        journeyKey,
        "REVIEW_PRESENTED",
        9,
        Buffer.from("race"),
        raceEvaluation,
        null,
        null,
        "AUTOMATIC_SAVING",
        null,
      ];
      const races = await Promise.allSettled([
        withTestDatabaseClient(url, (client) =>
          client.pool.query(factSql(), [randomUUID(), ...racePayload]),
        ),
        withTestDatabaseClient(url, (client) =>
          client.pool.query(factSql(), [randomUUID(), ...racePayload]),
        ),
      ]);
      const winners = races.filter((result) => result.status === "fulfilled");
      const losers = races.filter((result) => result.status === "rejected");
      expect(winners).toHaveLength(1);
      expect(losers).toHaveLength(1);
      expect((losers[0] as PromiseRejectedResult).reason).toMatchObject({ code: "23505" });

      await expectUniqueViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "COUPON_ATTEMPT",
          1,
          Buffer.from("dup-seq"),
          null,
          null,
          null,
          null,
          null,
        ],
      );
      await insertFact(randomUUID(), "COUPON_ATTEMPT", 3, Buffer.from("coupon-cmd"), {
        coarseOutcome: "INVALID",
      });
      await expectUniqueViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "COUPON_ATTEMPT",
          4,
          Buffer.from("coupon-cmd"),
          null,
          null,
          null,
          null,
          "FAILED",
        ],
      );
      await insertFact(randomUUID(), "COMMERCIAL_STATE_CHANGE", 4, Buffer.from("change-hash-32b"), {
        fingerprint: FINGERPRINT,
      });
      await expectUniqueViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "COMMERCIAL_STATE_CHANGE",
          5,
          Buffer.from("change-hash-32b"),
          null,
          null,
          OTHER_FINGERPRINT,
          null,
          null,
        ],
      );
      const activationId = randomUUID();
      await insertFact(randomUUID(), "CART_REVIEW_REACH", 5, Buffer.from("reach"), {
        evaluationId,
        activationId,
      });
      await expectUniqueViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "CART_REVIEW_REACH",
          6,
          Buffer.from("reach-2"),
          evaluationId,
          activationId,
          null,
          null,
          null,
        ],
      );
      await insertFact(randomUUID(), "REVIEW_TO_PAYMENT", 6, Buffer.from("continue-cmd"));
      await expectUniqueViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "REVIEW_TO_PAYMENT",
          7,
          Buffer.from("continue-cmd"),
          null,
          null,
          null,
          null,
          null,
        ],
      );
      await insertFact(randomUUID(), "PAYMENT_ATTEMPT", 7, Buffer.from("pay-key"));
      await expectUniqueViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "PAYMENT_ATTEMPT",
          8,
          Buffer.from("pay-key"),
          null,
          null,
          null,
          null,
          null,
        ],
      );
      await insertFact(randomUUID(), "DIRECT_ORDER_COMPLETION", 10, Buffer.from("done"));
      await expectUniqueViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "DIRECT_ORDER_COMPLETION",
          11,
          Buffer.from("done-again"),
          null,
          null,
          null,
          null,
          null,
        ],
      );

      await expectCheckViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "PAGE_VIEW",
          12,
          Buffer.from("nope"),
          null,
          null,
          null,
          null,
          null,
        ],
      );
      await expectCheckViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "COUPON_ATTEMPT",
          12,
          Buffer.from("class-on-coupon"),
          null,
          null,
          null,
          "NO_OFFER",
          null,
        ],
      );
      const shapeEvaluation = randomUUID();
      const shapeFingerprint = createHash("sha256").update("shape-evaluation").digest();
      await insertEvaluation(url, {
        evaluationId: shapeEvaluation,
        cartId: graph.cartId,
        checkoutId: successorId,
        surfaceScope: "CHECKOUT",
        fingerprint: shapeFingerprint,
        occurrenceOrdinal: 4,
        journeyKey,
      });
      await expectCheckViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "REVIEW_PRESENTED",
          14,
          Buffer.from("missing-class"),
          shapeEvaluation,
          null,
          null,
          null,
          null,
        ],
      );
      await expectCheckViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "REVIEW_PRESENTED",
          15,
          Buffer.from("bad-class"),
          shapeEvaluation,
          null,
          null,
          "COUPON_APPLIED",
          null,
        ],
      );
      await expectCheckViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "COMMERCIAL_STATE_CHANGE",
          12,
          Buffer.from("missing-fp"),
          null,
          null,
          null,
          null,
          null,
        ],
      );
      await expectCheckViolation(
        url,
        factSql(),
        [
          randomUUID(),
          journeyKey,
          "CART_REVIEW_REACH",
          12,
          Buffer.from("reach-shape"),
          null,
          null,
          null,
          null,
          null,
        ],
      );

      await expectCheckViolation(
        url,
        `INSERT INTO app.commercial_evaluations (
           evaluation_id, cart_id, checkout_id, surface_scope, result_fingerprint,
           expected_components, expected_total_saved_paise, expected_progress_present,
           expected_coarse_shape, explanation_reason_class, server_explanation_integrity,
           occurrence_ordinal, occurred_at
         ) VALUES (
           $1::uuid, $2::uuid, $3::uuid, 'CART', $4, '[]'::jsonb, 0, false,
           'NONE', 'NONE', true, 1, now()
         )`,
        [randomUUID(), graph.cartId, graph.checkoutId, FINGERPRINT],
      );
      await expectCheckViolation(
        url,
        `INSERT INTO app.commercial_evaluations (
           evaluation_id, cart_id, checkout_id, surface_scope, result_fingerprint,
           expected_components, expected_total_saved_paise, expected_progress_present,
           expected_coarse_shape, explanation_reason_class, server_explanation_integrity,
           occurrence_ordinal, occurred_at
         ) VALUES (
           $1::uuid, $2::uuid, null, 'CHECKOUT', $3, '[]'::jsonb, 0, false,
           'NONE', 'NONE', true, 1, now()
         )`,
        [randomUUID(), graph.cartId, FINGERPRINT],
      );
      await expectCheckViolation(
        url,
        `INSERT INTO app.commercial_evaluations (
           evaluation_id, cart_id, surface_scope, result_fingerprint,
           expected_components, expected_total_saved_paise, expected_progress_present,
           expected_progress_remaining_paise, expected_coarse_shape, explanation_reason_class,
           server_explanation_integrity, occurrence_ordinal, occurred_at
         ) VALUES (
           $1::uuid, $2::uuid, 'CART', $3, '[]'::jsonb, 0, false, 100,
           'NONE', 'private eligibility', true, 9, now()
         )`,
        [randomUUID(), graph.cartId, FINGERPRINT],
      );

      const cartEvaluation = randomUUID();
      await insertEvaluation(url, {
        evaluationId: cartEvaluation,
        cartId: graph.cartId,
        checkoutId: null,
        surfaceScope: "CART",
        occurrenceOrdinal: 3,
      });
      await expectUniqueViolation(
        url,
        `INSERT INTO app.commercial_evaluations (
           evaluation_id, cart_id, surface_scope, result_fingerprint,
           expected_components, expected_total_saved_paise, expected_progress_present,
           expected_coarse_shape, explanation_reason_class, server_explanation_integrity,
           occurrence_ordinal, occurred_at
         ) VALUES (
           $1::uuid, $2::uuid, 'CART', $3, '[]'::jsonb, 0, false,
           'NONE', 'NONE', true, 3, now()
         )`,
        [randomUUID(), graph.cartId, FINGERPRINT],
      );
      await insertEvaluation(url, {
        evaluationId: randomUUID(),
        cartId: graph.cartId,
        checkoutId: successorId,
        surfaceScope: "CHECKOUT",
        occurrenceOrdinal: 3,
        journeyKey,
      });
      await expectUniqueViolation(
        url,
        `INSERT INTO app.commercial_evaluations (
           evaluation_id, cart_id, checkout_id, surface_scope, result_fingerprint,
           expected_components, expected_total_saved_paise, expected_progress_present,
           expected_coarse_shape, explanation_reason_class, server_explanation_integrity,
           occurrence_ordinal, occurred_at
         ) VALUES (
           $1::uuid, $2::uuid, $3::uuid, 'CHECKOUT', $4, '[]'::jsonb, 0, false,
           'NONE', 'NONE', true, 3, now()
         )`,
        [randomUUID(), graph.cartId, successorId, FINGERPRINT],
      );

      const observationSql = `INSERT INTO app.commercial_presentation_observations (
        evaluation_id, surface, observed_components, observed_progress_present,
        observed_progress_remaining_paise, observed_coarse_shape,
        observed_complimentary_present, server_presentation_match, mismatch_flags, occurred_at
      ) VALUES (
        $1::uuid, $2, '[]'::jsonb, false, null, 'NONE', false, null, '{}', now()
      )`;
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(observationSql, [evaluationId, "CHECKOUT_REVIEW"]),
      );
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(observationSql, [evaluationId, "CART"]),
      );
      await expectUniqueViolation(url, observationSql, [evaluationId, "CART"]);
      await expectCheckViolation(url, observationSql, [cartEvaluation, "CHECKOUT_REVIEW"]);
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(observationSql, [cartEvaluation, "CART"]),
      );

      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.offer_result_views (evaluation_id, surface, occurred_at)
           VALUES ($1::uuid, 'CHECKOUT_REVIEW', now())`,
          [evaluationId],
        ),
      );
      await expectUniqueViolation(
        url,
        `INSERT INTO app.offer_result_views (evaluation_id, surface, occurred_at)
         VALUES ($1::uuid, 'CART', now())`,
        [evaluationId],
      );
      await expectCheckViolation(
        url,
        `INSERT INTO app.offer_result_views (evaluation_id, surface, occurred_at)
         VALUES ($1::uuid, 'CHECKOUT_REVIEW', now())`,
        [cartEvaluation],
      );

      const storedActivation = randomUUID();
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.cart_checkout_activations (
             activation_id, cart_id, checkout_journey_key, checkout_id,
             watermark_sequence, occurred_at
           ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 0, now())`,
          [storedActivation, graph.cartId, journeyKey, successorId],
        ),
      );
      await expectUniqueViolation(
        url,
        `INSERT INTO app.cart_checkout_activations (
           activation_id, cart_id, occurred_at
         ) VALUES ($1::uuid, $2::uuid, now())`,
        [storedActivation, graph.cartId],
      );

      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.checkout_review_surface_tokens (token_sha256, checkout_id, cart_id)
           VALUES ($1, $2::uuid, $3::uuid)`,
          [TOKEN_A, successorId, graph.cartId],
        ),
      );
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.checkout_review_surface_tokens (token_sha256, checkout_id, cart_id)
           VALUES ($1, $2::uuid, $3::uuid)`,
          [TOKEN_B, successorId, graph.cartId],
        ),
      );
      await expectUniqueViolation(
        url,
        `INSERT INTO app.checkout_review_surface_tokens (token_sha256, checkout_id, cart_id)
         VALUES ($1, $2::uuid, $3::uuid)`,
        [TOKEN_A, successorId, graph.cartId],
      );

      const originId = randomUUID();
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.commercial_command_origins (
             source_command_id, origin_kind, cart_id, checkout_id,
             checkout_journey_key, cart_origin_ordinal
           ) VALUES ($1::uuid, 'COUPON_APPLY', $2::uuid, $3::uuid, $4::uuid, 1)`,
          [originId, graph.cartId, successorId, journeyKey],
        ),
      );
      await expectUniqueViolation(
        url,
        `INSERT INTO app.commercial_command_origins (
           source_command_id, origin_kind, cart_id, cart_origin_ordinal
         ) VALUES ($1::uuid, 'COUPON_REMOVE', $2::uuid, 2)`,
        [originId, graph.cartId],
      );
      await expectCheckViolation(
        url,
        `INSERT INTO app.commercial_command_origins (
           source_command_id, origin_kind, cart_id, cart_origin_ordinal, resolution,
           resolved_change_fact_id
         ) VALUES ($1::uuid, 'STALE_RECOVERY', $2::uuid, 2, 'NO_RESULT_CHANGE', $3::uuid)`,
        [randomUUID(), graph.cartId, reviewFact],
      );

      const resultCommand = randomUUID();
      const unboundJourneyKey = randomUUID();
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.commercial_command_results (
             source_command_id, cart_id, surface, coarse_outcome,
             payable_changed_vs_valid_alternative, occurred_at, checkout_journey_key
           ) VALUES ($1::uuid, $2::uuid, 'CART', 'INVALID', null, now(), $3::uuid)`,
          [resultCommand, graph.cartId, unboundJourneyKey],
        ),
      );
      await expectUniqueViolation(
        url,
        `INSERT INTO app.commercial_command_results (
           source_command_id, cart_id, surface, coarse_outcome, occurred_at
         ) VALUES ($1::uuid, $2::uuid, 'CHECKOUT_REVIEW', 'FAILED', now())`,
        [resultCommand, graph.cartId],
      );
      await withTestDatabaseClient(url, async (client) => {
        const fks = await client.pool.query<{ attname: string }>(
          `SELECT a.attname
           FROM pg_constraint c
           JOIN pg_attribute a
             ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
           WHERE c.conrelid = 'app.commercial_command_results'::regclass
             AND c.contype = 'f'`,
        );
        expect(fks.rows.map((row) => row.attname)).toEqual(["cart_id"]);
      });

      const windowStart = "2026-10-01T00:00:00.000Z";
      const windowEnd = "2026-10-29T00:00:00.000Z";
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.measurement_report_snapshots (
             metric, window_start, window_end, report_as_of
           ) VALUES (
             'CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE',
             $1::timestamptz, $2::timestamptz, $2::timestamptz
           )`,
          [windowStart, windowEnd],
        ),
      );
      await expectUniqueViolation(
        url,
        `INSERT INTO app.measurement_report_snapshots (
           metric, window_start, window_end, report_as_of
         ) VALUES (
           'CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE',
           $1::timestamptz, $2::timestamptz, $2::timestamptz
         )`,
        [windowStart, windowEnd],
      );
      await expectCheckViolation(
        url,
        `UPDATE app.measurement_report_snapshots
         SET window_end = window_end + interval '1 day'
         WHERE metric = 'CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE'`,
      );
      await expectCheckViolation(
        url,
        `INSERT INTO app.measurement_report_snapshots (
           metric, window_start, window_end, report_as_of
         ) VALUES (
           'CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE',
           $1::timestamptz, $2::timestamptz, $2::timestamptz
         )
         ON CONFLICT (metric, window_start, window_end, report_as_of)
         DO UPDATE SET report_as_of = EXCLUDED.report_as_of`,
        [windowStart, windowEnd],
      );
      await withTestDatabaseClient(url, async (client) => {
        const beforeDelete = await client.pool.query<{ c: string }>(
          `SELECT count(*)::text AS c FROM app.measurement_report_snapshots
           WHERE metric = 'CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE'`,
        );
        expect(beforeDelete.rows[0]?.c).toBe("1");
        await client.pool.query(
          `DELETE FROM app.measurement_report_snapshots
           WHERE metric = 'CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE'`,
        );
        const afterDelete = await client.pool.query<{ c: string }>(
          `SELECT count(*)::text AS c FROM app.measurement_report_snapshots
           WHERE metric = 'CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE'`,
        );
        expect(afterDelete.rows[0]?.c).toBe("0");
      });

      await withTestDatabaseClient(url, async (client) => {
        await client.pool.query(`DELETE FROM app.checkouts WHERE id = $1::uuid`, [successorId]);
        const tokens = await client.pool.query<{ c: string }>(
          `SELECT count(*)::text AS c FROM app.checkout_review_surface_tokens
           WHERE checkout_id = $1::uuid`,
          [successorId],
        );
        expect(tokens.rows[0]?.c).toBe("0");
        const activation = await client.pool.query<{ checkout_id: string | null }>(
          `SELECT checkout_id::text FROM app.cart_checkout_activations
           WHERE activation_id = $1::uuid`,
          [storedActivation],
        );
        expect(activation.rows[0]?.checkout_id).toBeNull();
        const origin = await client.pool.query<{ checkout_id: string | null }>(
          `SELECT checkout_id::text FROM app.commercial_command_origins
           WHERE source_command_id = $1::uuid`,
          [originId],
        );
        expect(origin.rows[0]?.checkout_id).toBeNull();
      });

      await expect(
        withTestDatabaseClient(url, (client) =>
          client.pool.query(`DELETE FROM app.carts WHERE id = $1::uuid`, [graph.cartId]),
        ),
      ).rejects.toMatchObject({ code: "23001" });

      const loose = await insertCartOnly(url, "loose");
      const looseCommand = randomUUID();
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.commercial_command_results (
             source_command_id, cart_id, surface, coarse_outcome, occurred_at,
             checkout_journey_key
           ) VALUES ($1::uuid, $2::uuid, 'CART', 'REMOVED', now(), $3::uuid)`,
          [looseCommand, loose.cartId, randomUUID()],
        ),
      );
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.commercial_command_origins (
             source_command_id, origin_kind, cart_id, cart_origin_ordinal
           ) VALUES ($1::uuid, 'COUPON_APPLY', $2::uuid, 1)`,
          [randomUUID(), loose.cartId],
        ),
      );
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.cart_checkout_activations (activation_id, cart_id, occurred_at)
           VALUES ($1::uuid, $2::uuid, now())`,
          [randomUUID(), loose.cartId],
        ),
      );
      await insertEvaluation(url, {
        evaluationId: randomUUID(),
        cartId: loose.cartId,
        checkoutId: null,
        surfaceScope: "CART",
      });
      await withTestDatabaseClient(url, async (client) => {
        await client.pool.query(`DELETE FROM app.carts WHERE id = $1::uuid`, [loose.cartId]);
        const left = await client.pool.query<{ c: string }>(
          `SELECT
             (SELECT count(*) FROM app.commercial_command_results WHERE cart_id = $1::uuid) +
             (SELECT count(*) FROM app.commercial_command_origins WHERE cart_id = $1::uuid) +
             (SELECT count(*) FROM app.cart_checkout_activations WHERE cart_id = $1::uuid) +
             (SELECT count(*) FROM app.commercial_evaluations WHERE cart_id = $1::uuid) AS c`,
          [loose.cartId],
        );
        expect(left.rows[0]?.c).toBe("0");
      });

      await withTestDatabaseClient(url, async (client) => {
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
        const origins = await client.pool.query<{ column_name: string }>(
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'app' AND table_name = 'commercial_command_origins'
             AND column_name = 'occurred_at'`,
        );
        expect(origins.rows).toEqual([]);
        const resolutionTime = await client.pool.query<{
          column_name: string;
          is_nullable: string;
          data_type: string;
        }>(
          `SELECT column_name, is_nullable, data_type
           FROM information_schema.columns
           WHERE table_schema = 'app' AND table_name = 'commercial_command_origins'
             AND column_name = 'resolution_occurred_at'`,
        );
        expect(resolutionTime.rows).toEqual([
          {
            column_name: "resolution_occurred_at",
            is_nullable: "YES",
            data_type: "timestamp with time zone",
          },
        ]);
        await client.pool.query(
          `INSERT INTO app.commercial_command_origins (
             source_command_id, origin_kind, cart_id, cart_origin_ordinal, resolution
           ) VALUES ($1::uuid, 'STALE_RECOVERY', $2::uuid, 3, 'NO_RESULT_CHANGE')`,
          [randomUUID(), graph.cartId],
        );
        const snapshotColumns = await client.pool.query<{ column_name: string }>(
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'app' AND table_name = 'measurement_report_snapshots'
           ORDER BY ordinal_position`,
        );
        expect(snapshotColumns.rows.map((row) => row.column_name)).toEqual([
          "metric",
          "window_start",
          "window_end",
          "report_as_of",
          "published_report",
        ]);
        const triggers = await client.pool.query<{ tgname: string }>(
          `SELECT tgname FROM pg_trigger
           WHERE tgname IN (
             'commercial_presentation_observations_surface_scope',
             'offer_result_views_surface_scope',
             'measurement_report_snapshots_forbid_update',
             'measurement_report_snapshots_forbid_delete'
           )
           ORDER BY tgname`,
        );
        expect(triggers.rows.map((row) => row.tgname)).toEqual([
          "commercial_presentation_observations_surface_scope",
          "measurement_report_snapshots_forbid_update",
          "offer_result_views_surface_scope",
        ]);
        const snapshotTriggers = await client.pool.query<{ tgname: string }>(
          `SELECT tgname FROM pg_trigger
           WHERE tgrelid = 'app.measurement_report_snapshots'::regclass
             AND NOT tgisinternal
           ORDER BY tgname`,
        );
        expect(snapshotTriggers.rows.map((row) => row.tgname)).toEqual([
          "measurement_report_snapshots_forbid_update",
        ]);
      });
    });
  });
});
