/**
 * IMP-036J Tranche 7 MEASUREMENT_REPORTING proof.
 * Real Testcontainers PostgreSQL. Reporting reads stored facts only.
 */
import { createHash, randomUUID } from "node:crypto";

import { sql } from "drizzle-orm";
import { afterEach, describe, expect, inject, it } from "vitest";

import { setVariantAvailability } from "../../src/server/assortment";
import { setCartLineQuantity } from "../../src/server/cart";
import { lockCartForUpdate } from "../../src/server/cart/repository";
import {
  evaluateCheckout,
  prepareCheckoutForPayment,
} from "../../src/server/checkout";
import {
  ensureReviewPresentedThenPaymentFacts,
  insertCommandOrigin,
} from "../../src/server/customer-commerce/measurement/writers";
import { includeVariantAtBrand } from "../assortment-availability/support";
import { checkoutOpts } from "./support/checkout-fixtures";
import {
  applyCouponToCustomerCart,
  bringCheckoutToReady,
  withCheckoutReadyHarness,
} from "./support/payment-fixtures";
import {
  seedActiveStandardVariant,
  uniqueCode,
} from "./support/cart-fixtures";
import {
  activateCoupon,
  activatePromotion,
  createCouponDraft,
  createPromotionDraft,
  getCoupon,
  getPromotion,
  setPromotionTargets,
} from "../../src/server/promotions";

import {
  cartCheckoutActivationsTable,
  checkoutJourneyFactsTable,
  checkoutJourneyHeadsTable,
  commercialCommandOriginsTable,
  commercialCommandResultsTable,
  commercialEvaluationsTable,
  commercialPresentationObservationsTable,
  measurementReportSnapshotsTable,
  offerResultViewsTable,
} from "../../src/platform/database/schema/measurement";
import {
  PRIMARY_METRIC,
  publishMeasurementReport,
} from "../../src/server/customer-commerce/measurement/publish-report";
import { initialMeasurementWindow } from "../../src/server/customer-commerce/measurement/report-window";
import type {
  Persistence,
  PersistenceTransactionContext,
} from "../../src/server/persistence/types";
import {
  closeTrackedPersistenceHandles,
  openTrackedApplicationPersistence,
} from "./support/cart-fixtures";
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

const FINGERPRINT = createHash("sha256").update("t7-fingerprint").digest();

function sha(label: string): Uint8Array {
  return new Uint8Array(createHash("sha256").update(label).digest());
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
  const customerId = `mig-036j-t7-${tag}`;
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
      [customerId, "T7 User", `${tag}@example.com`, `+91810${phoneTail}`],
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

async function withHarness(
  tag: string,
  fn: (input: {
    persistence: Persistence;
    graph: Graph;
    connectionString: string;
    window: ReturnType<typeof initialMeasurementWindow>;
    inside: Date;
    beforeWindow: Date;
    atEnd: Date;
  }) => Promise<void>,
): Promise<void> {
  await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
    await applyMigrations(database.connectionString);
    const persistence = openTrackedApplicationPersistence(database.connectionString);
    try {
      const graph = await seedGraph(database.connectionString, tag);
      const window = initialMeasurementWindow({
        productionReleaseAnchor: new Date("2026-10-01T18:30:00.000Z"),
      });
      const inside = new Date(window.windowStart.getTime() + 24 * 60 * 60 * 1000);
      const beforeWindow = new Date(window.windowStart.getTime() - 60_000);
      await fn({
        persistence,
        graph,
        connectionString: database.connectionString,
        window,
        inside,
        beforeWindow,
        atEnd: window.windowEnd,
      });
    } finally {
      await closeTrackedPersistenceHandles();
    }
  });
}

type Tx = PersistenceTransactionContext;

async function ensureHead(tx: Tx, journeyKey: string): Promise<void> {
  await tx.db
    .insert(checkoutJourneyHeadsTable)
    .values({
      checkoutJourneyKey: journeyKey,
      nextSequence: BigInt(50),
      closedAt: null,
    })
    .onConflictDoNothing();
}

let evaluationOrdinal = 1;

async function insertEvaluation(
  tx: Tx,
  input: {
    graph: Graph;
    journeyKey: string | null;
    surfaceScope?: "CART" | "CHECKOUT";
    reasonClass?: string;
    occurredAt: Date;
    ordinal?: number;
  },
): Promise<string> {
  if (input.journeyKey) await ensureHead(tx, input.journeyKey);
  const evaluationId = randomUUID();
  await tx.db.insert(commercialEvaluationsTable).values({
    evaluationId,
    cartId: input.graph.cartId,
    checkoutId:
      (input.surfaceScope ?? "CHECKOUT") === "CHECKOUT"
        ? input.graph.checkoutId
        : null,
    checkoutJourneyKey: input.journeyKey,
    surfaceScope: input.surfaceScope ?? "CHECKOUT",
    resultFingerprint: new Uint8Array(FINGERPRINT),
    expectedComponents: [],
    expectedTotalSavedPaise: BigInt(0),
    expectedProgressPresent: false,
    expectedProgressRemainingPaise: null,
    expectedCoarseShape: "NONE",
    explanationReasonClass: input.reasonClass ?? "NONE",
    serverExplanationIntegrity: true,
    occurrenceOrdinal: BigInt(input.ordinal ?? evaluationOrdinal++),
    occurredAt: input.occurredAt,
    cartOriginOrdinalInclusive: BigInt(1),
  });
  return evaluationId;
}

async function insertFact(
  tx: Tx,
  input: {
    journeyKey: string;
    kind:
      | "REVIEW_PRESENTED"
      | "COMMERCIAL_STATE_CHANGE"
      | "CART_REVIEW_REACH"
      | "REVIEW_TO_PAYMENT"
      | "PAYMENT_ATTEMPT"
      | "DIRECT_ORDER_COMPLETION";
    sequence: number;
    occurredAt: Date;
    evaluationId?: string | null;
    activationId?: string | null;
    presentationClass?: string | null;
    fingerprint?: Uint8Array | null;
    label: string;
  },
): Promise<string> {
  await ensureHead(tx, input.journeyKey);
  const factId = randomUUID();
  await tx.db.insert(checkoutJourneyFactsTable).values({
    factId,
    checkoutJourneyKey: input.journeyKey,
    factKind: input.kind,
    journeySequence: BigInt(input.sequence),
    occurredAt: input.occurredAt,
    idempotencyKey: sha(input.label),
    evaluationId: input.evaluationId ?? null,
    activationId: input.activationId ?? null,
    resultFingerprint: input.fingerprint ?? null,
    presentationClass: input.presentationClass ?? null,
    coarseOutcome: null,
  });
  return factId;
}

async function presentedJourney(
  tx: Tx,
  input: {
    graph: Graph;
    journeyKey: string;
    occurredAt: Date;
    presentationClass?: string;
    sequence?: number;
    reasonClass?: string;
  },
): Promise<{ evaluationId: string }> {
  await ensureHead(tx, input.journeyKey);
  const evaluationId = await insertEvaluation(tx, {
    graph: input.graph,
    journeyKey: input.journeyKey,
    occurredAt: input.occurredAt,
    reasonClass: input.reasonClass,
  });
  await insertFact(tx, {
    journeyKey: input.journeyKey,
    kind: "REVIEW_PRESENTED",
    sequence: input.sequence ?? 1,
    occurredAt: input.occurredAt,
    evaluationId,
    presentationClass: input.presentationClass ?? "NO_OFFER",
    label: `review:${input.journeyKey}:${input.sequence ?? 1}`,
  });
  return { evaluationId };
}

describe("IMP-036J tranche 7 measurement reporting", () => {
  afterEach(async () => {
    await closeTrackedPersistenceHandles();
  });

  it("T7-PRIMARY cohort, numerator, cutoff, segment, and window membership", async () => {
    await withHarness("primary", async ({ persistence, graph, window, inside, atEnd }) => {
      const first = randomUUID();
      const laterReview = randomUUID();
      const paidOnly = randomUUID();
      const completed = randomUUID();
      const atCutoff = randomUUID();
      const beforeStart = randomUUID();
      const atStart = randomUUID();
      const equalTime = randomUUID();

      await persistence.transaction(async (tx) => {
        await presentedJourney(tx, {
          graph,
          journeyKey: first,
          occurredAt: inside,
          presentationClass: "AUTOMATIC_SAVING",
        });
        const laterEval = await insertEvaluation(tx, {
          graph,
          journeyKey: laterReview,
          occurredAt: inside,
        });
        await insertFact(tx, {
          journeyKey: laterReview,
          kind: "REVIEW_PRESENTED",
          sequence: 1,
          occurredAt: new Date(window.windowStart.getTime() + 1000),
          evaluationId: laterEval,
          presentationClass: "NO_OFFER",
          label: `review:${laterReview}:1`,
        });
        const laterEval2 = await insertEvaluation(tx, {
          graph,
          journeyKey: laterReview,
          occurredAt: new Date(inside.getTime() + 3600_000),
        });
        await insertFact(tx, {
          journeyKey: laterReview,
          kind: "REVIEW_PRESENTED",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 3600_000),
          evaluationId: laterEval2,
          presentationClass: "COUPON_SELECTED",
          label: `review:${laterReview}:2`,
        });

        await presentedJourney(tx, {
          graph,
          journeyKey: paidOnly,
          occurredAt: inside,
        });
        await insertFact(tx, {
          journeyKey: paidOnly,
          kind: "PAYMENT_ATTEMPT",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 1000),
          label: `pay:${paidOnly}`,
        });

        await presentedJourney(tx, {
          graph,
          journeyKey: completed,
          occurredAt: inside,
          presentationClass: "THRESHOLD_PROGRESS",
          sequence: 1,
        });
        const completedLater = await insertEvaluation(tx, {
          graph,
          journeyKey: completed,
          occurredAt: new Date(inside.getTime() + 2000),
        });
        await insertFact(tx, {
          journeyKey: completed,
          kind: "REVIEW_PRESENTED",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 2000),
          evaluationId: completedLater,
          presentationClass: "COMPLIMENTARY_ITEM",
          label: `review:${completed}:2`,
        });
        await insertFact(tx, {
          journeyKey: completed,
          kind: "DIRECT_ORDER_COMPLETION",
          sequence: 3,
          occurredAt: new Date(inside.getTime() + 3000),
          label: `done:${completed}`,
        });

        await presentedJourney(tx, {
          graph,
          journeyKey: atCutoff,
          occurredAt: inside,
        });
        await insertFact(tx, {
          journeyKey: atCutoff,
          kind: "DIRECT_ORDER_COMPLETION",
          sequence: 2,
          occurredAt: window.reportAsOf,
          label: `done:${atCutoff}`,
        });

        await presentedJourney(tx, {
          graph,
          journeyKey: beforeStart,
          occurredAt: new Date(window.windowStart.getTime() - 1000),
        });
        await presentedJourney(tx, {
          graph,
          journeyKey: atStart,
          occurredAt: window.windowStart,
          presentationClass: "NO_OFFER",
        });

        const equalEval1 = await insertEvaluation(tx, {
          graph,
          journeyKey: equalTime,
          occurredAt: inside,
        });
        const equalEval2 = await insertEvaluation(tx, {
          graph,
          journeyKey: equalTime,
          occurredAt: inside,
        });
        await insertFact(tx, {
          journeyKey: equalTime,
          kind: "REVIEW_PRESENTED",
          sequence: 1,
          occurredAt: inside,
          evaluationId: equalEval1,
          presentationClass: "NO_OFFER",
          label: `review:${equalTime}:1`,
        });
        await insertFact(tx, {
          journeyKey: equalTime,
          kind: "REVIEW_PRESENTED",
          sequence: 2,
          occurredAt: inside,
          evaluationId: equalEval2,
          presentationClass: "AUTOMATIC_SAVING",
          label: `review:${equalTime}:2`,
        });
      });

      const report = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });

      expect(report.primary.status).toBe("RATE");
      if (report.primary.status !== "RATE") return;
      expect(report.primary.denominator).toBe(7);
      expect(report.primary.numerator).toBe(1);
      expect(report.primary.notCompletedAsOfReportCutoff).toBe(6);

      const complimentary = report.segments.find(
        (row) => row.presentationClass === "COMPLIMENTARY_ITEM",
      );
      expect(complimentary?.completedCount).toBe(1);
      const automatic = report.segments.find(
        (row) => row.presentationClass === "AUTOMATIC_SAVING",
      );
      expect(automatic?.unfinishedCount).toBeGreaterThanOrEqual(1);

      const outsideEnd = randomUUID();
      await persistence.transaction(async (tx) => {
        await presentedJourney(tx, {
          graph,
          journeyKey: outsideEnd,
          occurredAt: atEnd,
        });
      });
      const afterEnd = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      expect(afterEnd.snapshotInserted).toBe(false);
      if (afterEnd.primary.status !== "RATE") return;
      expect(afterEnd.primary.denominator).toBe(7);
    });
  });

  it("T7-PRIMARY-06 zero denominator is INSUFFICIENT_EVIDENCE", async () => {
    await withHarness("empty", async ({ persistence, window }) => {
      const report = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      expect(report.primary).toEqual({
        status: "INSUFFICIENT_EVIDENCE",
        numerator: 0,
        denominator: 0,
        rate: null,
        notCompletedAsOfReportCutoff: 0,
      });
    });
  });

  it("T7-SNAPSHOT identity is insert-only and maturation preserves the earlier row", async () => {
    await withHarness("snap", async ({ persistence, graph, window, inside }) => {
      await persistence.transaction(async (tx) => {
        await presentedJourney(tx, {
          graph,
          journeyKey: randomUUID(),
          occurredAt: inside,
        });
      });
      const first = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      expect(first.snapshotInserted).toBe(true);
      const retry = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      expect(retry.snapshotInserted).toBe(false);
      expect(retry.primary).toEqual(first.primary);

      const laterAsOf = new Date(window.reportAsOf.getTime() + 24 * 60 * 60 * 1000);
      const matureJourney = randomUUID();
      await persistence.transaction(async (tx) => {
        await presentedJourney(tx, {
          graph,
          journeyKey: matureJourney,
          occurredAt: inside,
        });
        await insertFact(tx, {
          journeyKey: matureJourney,
          kind: "DIRECT_ORDER_COMPLETION",
          sequence: 2,
          occurredAt: new Date(window.reportAsOf.getTime() + 60_000),
          label: `done:${matureJourney}`,
        });
      });
      const matured = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: laterAsOf,
      });
      expect(matured.snapshotInserted).toBe(true);
      if (matured.primary.status !== "RATE") return;
      expect(matured.primary.numerator).toBeGreaterThan(0);

      const rows = await persistence.withContext((ctx) =>
        ctx.db.select().from(measurementReportSnapshotsTable),
      );
      expect(rows).toHaveLength(2);
      const original = rows.find(
        (row) => row.reportAsOf.getTime() === window.reportAsOf.getTime(),
      );
      expect(original).toBeTruthy();
      expect(original?.publishedReport).toBeTruthy();
      const storedOriginal = original?.publishedReport as Record<string, unknown>;
      expect(storedOriginal.primary).toEqual(first.primary);
    });
  });

  it("T7-IMMUTABLE late-visible pre-cutoff fact does not change exact-identity retry", async () => {
    await withHarness("late", async ({ persistence, graph, window, inside }) => {
      const journey = randomUUID();
      await persistence.transaction(async (tx) => {
        await presentedJourney(tx, {
          graph,
          journeyKey: journey,
          occurredAt: inside,
        });
      });
      const first = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      expect(first.snapshotInserted).toBe(true);
      expect(first.primary.status).toBe("RATE");
      if (first.primary.status !== "RATE") return;
      expect(first.primary.numerator).toBe(0);

      await persistence.transaction(async (tx) => {
        await insertFact(tx, {
          journeyKey: journey,
          kind: "DIRECT_ORDER_COMPLETION",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 5_000),
          label: `late:${journey}`,
        });
      });
      const retry = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      expect(retry.snapshotInserted).toBe(false);
      expect(retry.primary).toEqual(first.primary);
      expect(retry.validNotSelectedContinuation).toEqual(
        first.validNotSelectedContinuation,
      );
      expect(retry.changedTotalRecoveryContinuation).toEqual(
        first.changedTotalRecoveryContinuation,
      );

      const laterAsOf = new Date(window.reportAsOf.getTime() + 60_000);
      const matured = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: laterAsOf,
      });
      expect(matured.snapshotInserted).toBe(true);
      if (matured.primary.status !== "RATE") return;
      expect(matured.primary.numerator).toBe(1);
      const originalRetry = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      expect(originalRetry.primary).toEqual(first.primary);
    });
  });

  it("T7-IMMUTABLE concurrent exact publication returns one stored aggregate", async () => {
    await withHarness("race", async ({ persistence, graph, window, inside }) => {
      await persistence.transaction(async (tx) => {
        await presentedJourney(tx, {
          graph,
          journeyKey: randomUUID(),
          occurredAt: inside,
        });
      });
      const raced = await Promise.all([
        publishMeasurementReport(persistence, {
          productionReleaseAnchor: window.windowStart,
          reportAsOf: window.reportAsOf,
        }),
        publishMeasurementReport(persistence, {
          productionReleaseAnchor: window.windowStart,
          reportAsOf: window.reportAsOf,
        }),
      ]);
      const inserted = raced.filter((row) => row.snapshotInserted);
      expect(inserted.length).toBe(1);
      const left = { ...raced[0]!, snapshotInserted: undefined };
      const right = { ...raced[1]!, snapshotInserted: undefined };
      expect(left).toEqual(right);
      const rows = await persistence.withContext((ctx) =>
        ctx.db.select().from(measurementReportSnapshotsTable),
      );
      expect(rows).toHaveLength(1);
      expect(rows[0]?.publishedReport).toBeTruthy();
    });
  });

  it("T7 valid-not-selected continuation inspects earlier qualifying reviews", async () => {
    await withHarness("vns", async ({ persistence, graph, window, inside }) => {
      const couponThenAuto = randomUUID();
      const equalThenOther = randomUUID();
      const continuationBefore = randomUUID();
      const continuationAtCutoff = randomUUID();

      await persistence.transaction(async (tx) => {
        const eval1 = await insertEvaluation(tx, {
          graph,
          journeyKey: couponThenAuto,
          occurredAt: inside,
        });
        await insertFact(tx, {
          journeyKey: couponThenAuto,
          kind: "REVIEW_PRESENTED",
          sequence: 1,
          occurredAt: inside,
          evaluationId: eval1,
          presentationClass: "COUPON_VALID_NOT_SELECTED",
          label: `review:${couponThenAuto}:1`,
        });
        const eval2 = await insertEvaluation(tx, {
          graph,
          journeyKey: couponThenAuto,
          occurredAt: new Date(inside.getTime() + 1_000),
        });
        await insertFact(tx, {
          journeyKey: couponThenAuto,
          kind: "REVIEW_PRESENTED",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 1_000),
          evaluationId: eval2,
          presentationClass: "AUTOMATIC_SAVING",
          label: `review:${couponThenAuto}:2`,
        });
        await insertFact(tx, {
          journeyKey: couponThenAuto,
          kind: "REVIEW_TO_PAYMENT",
          sequence: 3,
          occurredAt: new Date(inside.getTime() + 2_000),
          label: `rtp:${couponThenAuto}`,
        });

        const equal1 = await insertEvaluation(tx, {
          graph,
          journeyKey: equalThenOther,
          occurredAt: inside,
        });
        await insertFact(tx, {
          journeyKey: equalThenOther,
          kind: "REVIEW_PRESENTED",
          sequence: 1,
          occurredAt: inside,
          evaluationId: equal1,
          presentationClass: "EQUAL_PAYABLE_NOT_SELECTED",
          label: `review:${equalThenOther}:1`,
        });
        const equal2 = await insertEvaluation(tx, {
          graph,
          journeyKey: equalThenOther,
          occurredAt: new Date(inside.getTime() + 500),
        });
        await insertFact(tx, {
          journeyKey: equalThenOther,
          kind: "REVIEW_PRESENTED",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 500),
          evaluationId: equal2,
          presentationClass: "NO_OFFER",
          label: `review:${equalThenOther}:2`,
        });
        await insertFact(tx, {
          journeyKey: equalThenOther,
          kind: "DIRECT_ORDER_COMPLETION",
          sequence: 3,
          occurredAt: new Date(inside.getTime() + 1_500),
          label: `done:${equalThenOther}`,
        });

        const beforeEval = await insertEvaluation(tx, {
          graph,
          journeyKey: continuationBefore,
          occurredAt: new Date(inside.getTime() + 2_000),
        });
        await insertFact(tx, {
          journeyKey: continuationBefore,
          kind: "REVIEW_TO_PAYMENT",
          sequence: 1,
          occurredAt: inside,
          label: `rtp:${continuationBefore}`,
        });
        await insertFact(tx, {
          journeyKey: continuationBefore,
          kind: "REVIEW_PRESENTED",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 2_000),
          evaluationId: beforeEval,
          presentationClass: "COUPON_VALID_NOT_SELECTED",
          label: `review:${continuationBefore}:2`,
        });

        const cutoffEval = await insertEvaluation(tx, {
          graph,
          journeyKey: continuationAtCutoff,
          occurredAt: inside,
        });
        await insertFact(tx, {
          journeyKey: continuationAtCutoff,
          kind: "REVIEW_PRESENTED",
          sequence: 1,
          occurredAt: inside,
          evaluationId: cutoffEval,
          presentationClass: "COUPON_VALID_NOT_SELECTED",
          label: `review:${continuationAtCutoff}:1`,
        });
        await insertFact(tx, {
          journeyKey: continuationAtCutoff,
          kind: "REVIEW_TO_PAYMENT",
          sequence: 2,
          occurredAt: window.reportAsOf,
          label: `rtp:${continuationAtCutoff}`,
        });
      });

      const report = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      expect(report.validNotSelectedContinuation.status).toBe("RATE");
      if (report.validNotSelectedContinuation.status !== "RATE") return;
      expect(report.validNotSelectedContinuation.denominator).toBe(4);
      expect(report.validNotSelectedContinuation.numerator).toBe(2);
    });
  });

  it("T7-CART-REVIEW activation grain, watermark, and unassociated remainder", async () => {
    await withHarness("cart", async ({ persistence, graph, window, inside }) => {
      const journey = randomUUID();
      const a1 = randomUUID();
      const a2 = randomUUID();
      const unassociated = randomUUID();
      const historical = randomUUID();
      await persistence.transaction(async (tx) => {
        const evaluationId = (await presentedJourney(tx, {
          graph,
          journeyKey: journey,
          occurredAt: inside,
        })).evaluationId;
        await tx.db.insert(cartCheckoutActivationsTable).values({
          activationId: a1,
          cartId: graph.cartId,
          checkoutJourneyKey: journey,
          checkoutId: graph.checkoutId,
          watermarkSequence: BigInt(0),
          occurredAt: inside,
          reviewReachFactId: null,
        });
        await insertFact(tx, {
          journeyKey: journey,
          kind: "CART_REVIEW_REACH",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 1000),
          evaluationId,
          activationId: a1,
          label: `reach:${a1}`,
        });
        await tx.db.insert(cartCheckoutActivationsTable).values({
          activationId: a2,
          cartId: graph.cartId,
          checkoutJourneyKey: journey,
          checkoutId: graph.checkoutId,
          watermarkSequence: BigInt(2),
          occurredAt: new Date(inside.getTime() + 2000),
          reviewReachFactId: null,
        });
        await insertFact(tx, {
          journeyKey: journey,
          kind: "CART_REVIEW_REACH",
          sequence: 3,
          occurredAt: new Date(inside.getTime() + 3000),
          evaluationId,
          activationId: a2,
          label: `reach:${a2}`,
        });
        await tx.db.insert(cartCheckoutActivationsTable).values({
          activationId: unassociated,
          cartId: graph.cartId,
          checkoutJourneyKey: null,
          checkoutId: null,
          watermarkSequence: null,
          occurredAt: inside,
          reviewReachFactId: null,
        });
        const histJourney = randomUUID();
        const histEval = (await presentedJourney(tx, {
          graph,
          journeyKey: histJourney,
          occurredAt: inside,
          sequence: 1,
        })).evaluationId;
        await tx.db.insert(cartCheckoutActivationsTable).values({
          activationId: historical,
          cartId: graph.cartId,
          checkoutJourneyKey: histJourney,
          checkoutId: graph.checkoutId,
          watermarkSequence: BigInt(1),
          occurredAt: new Date(inside.getTime() + 4000),
          reviewReachFactId: null,
        });
        void histEval;
      });

      const report = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      expect(report.cartToCheckoutReview.status).toBe("RATE");
      if (report.cartToCheckoutReview.status !== "RATE") return;
      expect(report.cartToCheckoutReview.denominator).toBe(4);
      expect(report.cartToCheckoutReview.numerator).toBe(2);
    });
  });

  it("T7 secondary formulas, integrity, views, support, and privacy", async () => {
    await withHarness("sec", async ({ persistence, graph, window, inside, connectionString }) => {
      const payJourney = randomUUID();
      const revalChanged = randomUUID();
      const revalUnchanged = randomUUID();
      const validKeep = randomUUID();
      const staleJourney = randomUUID();
      const giftJourney = randomUUID();
      const couponCommand = randomUUID();
      const invalidCommand = randomUUID();
      const nullKeyInvalid = randomUUID();
      const originChanged = randomUUID();
      const originGift = randomUUID();
      const originUnchanged = randomUUID();

      await persistence.transaction(async (tx) => {
        await presentedJourney(tx, {
          graph,
          journeyKey: payJourney,
          occurredAt: inside,
        });
        await insertFact(tx, {
          journeyKey: payJourney,
          kind: "REVIEW_TO_PAYMENT",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 1000),
          label: `rtp:${payJourney}`,
        });

        const revalEval = (await presentedJourney(tx, {
          graph,
          journeyKey: revalChanged,
          occurredAt: inside,
          presentationClass: "CHANGED_TOTAL_RECOVERY",
        })).evaluationId;
        const changeEval = await insertEvaluation(tx, {
          graph,
          journeyKey: revalChanged,
          occurredAt: new Date(inside.getTime() + 1500),
          reasonClass: "NONE",
        });
        const changeFact = await insertFact(tx, {
          journeyKey: revalChanged,
          kind: "COMMERCIAL_STATE_CHANGE",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 1500),
          evaluationId: changeEval,
          fingerprint: new Uint8Array(FINGERPRINT),
          label: `change:${revalChanged}`,
        });
        await insertFact(tx, {
          journeyKey: revalChanged,
          kind: "REVIEW_PRESENTED",
          sequence: 3,
          occurredAt: new Date(inside.getTime() + 1600),
          evaluationId: changeEval,
          presentationClass: "CHANGED_TOTAL_RECOVERY",
          label: `review:${revalChanged}:3`,
        });
        await tx.db.insert(commercialCommandOriginsTable).values({
          sourceCommandId: originChanged,
          originKind: "STALE_RECOVERY",
          cartId: graph.cartId,
          checkoutId: graph.checkoutId,
          checkoutJourneyKey: revalChanged,
          cartOriginOrdinal: BigInt(1),
          resolvedChangeFactId: changeFact,
          resolution: null,
        });
        await insertFact(tx, {
          journeyKey: revalChanged,
          kind: "PAYMENT_ATTEMPT",
          sequence: 4,
          occurredAt: new Date(inside.getTime() + 2000),
          label: `pay:${revalChanged}`,
        });
        await insertFact(tx, {
          journeyKey: revalChanged,
          kind: "DIRECT_ORDER_COMPLETION",
          sequence: 5,
          occurredAt: new Date(inside.getTime() + 3000),
          label: `done:${revalChanged}`,
        });
        void revalEval;

        await presentedJourney(tx, {
          graph,
          journeyKey: revalUnchanged,
          occurredAt: inside,
        });
        await tx.db.insert(commercialCommandOriginsTable).values({
          sourceCommandId: originUnchanged,
          originKind: "STALE_RECOVERY",
          cartId: graph.cartId,
          checkoutId: graph.checkoutId,
          checkoutJourneyKey: revalUnchanged,
          cartOriginOrdinal: BigInt(1),
          resolvedChangeFactId: null,
          resolution: "NO_RESULT_CHANGE",
        });
        await insertFact(tx, {
          journeyKey: revalUnchanged,
          kind: "PAYMENT_ATTEMPT",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 1000),
          label: `pay:${revalUnchanged}`,
        });
        await insertFact(tx, {
          journeyKey: revalUnchanged,
          kind: "DIRECT_ORDER_COMPLETION",
          sequence: 3,
          occurredAt: new Date(inside.getTime() + 2000),
          label: `done:${revalUnchanged}`,
        });

        await presentedJourney(tx, {
          graph,
          journeyKey: validKeep,
          occurredAt: inside,
          presentationClass: "EQUAL_PAYABLE_NOT_SELECTED",
        });
        await insertFact(tx, {
          journeyKey: validKeep,
          kind: "REVIEW_TO_PAYMENT",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 500),
          label: `rtp:${validKeep}`,
        });

        const staleEval = await insertEvaluation(tx, {
          graph,
          journeyKey: staleJourney,
          occurredAt: inside,
        });
        await presentedJourney(tx, {
          graph,
          journeyKey: staleJourney,
          occurredAt: inside,
          presentationClass: "CHANGED_TOTAL_RECOVERY",
        });
        const staleChange = await insertFact(tx, {
          journeyKey: staleJourney,
          kind: "COMMERCIAL_STATE_CHANGE",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 700),
          evaluationId: staleEval,
          fingerprint: new Uint8Array(FINGERPRINT),
          label: `change:${staleJourney}`,
        });
        await tx.db.insert(commercialCommandOriginsTable).values({
          sourceCommandId: randomUUID(),
          originKind: "STALE_RECOVERY",
          cartId: graph.cartId,
          checkoutId: graph.checkoutId,
          checkoutJourneyKey: staleJourney,
          cartOriginOrdinal: BigInt(2),
          resolvedChangeFactId: staleChange,
          resolution: null,
        });
        await insertFact(tx, {
          journeyKey: staleJourney,
          kind: "REVIEW_TO_PAYMENT",
          sequence: 3,
          occurredAt: new Date(inside.getTime() + 800),
          label: `rtp:${staleJourney}`,
        });

        const giftEval = await insertEvaluation(tx, {
          graph,
          journeyKey: giftJourney,
          occurredAt: inside,
          reasonClass: "COMPLIMENTARY_ITEM_UNAVAILABLE",
        });
        await presentedJourney(tx, {
          graph,
          journeyKey: giftJourney,
          occurredAt: inside,
          presentationClass: "NO_OFFER",
        });
        const giftChange = await insertFact(tx, {
          journeyKey: giftJourney,
          kind: "COMMERCIAL_STATE_CHANGE",
          sequence: 2,
          occurredAt: new Date(inside.getTime() + 900),
          evaluationId: giftEval,
          fingerprint: new Uint8Array(FINGERPRINT),
          label: `change:${giftJourney}`,
        });
        await tx.db.insert(commercialCommandOriginsTable).values({
          sourceCommandId: originGift,
          originKind: "STALE_RECOVERY",
          cartId: graph.cartId,
          checkoutId: graph.checkoutId,
          checkoutJourneyKey: giftJourney,
          cartOriginOrdinal: BigInt(3),
          resolvedChangeFactId: giftChange,
          resolution: null,
        });
        await insertFact(tx, {
          journeyKey: giftJourney,
          kind: "DIRECT_ORDER_COMPLETION",
          sequence: 3,
          occurredAt: new Date(inside.getTime() + 1100),
          label: `done:${giftJourney}`,
        });

        await tx.db.insert(commercialCommandResultsTable).values({
          sourceCommandId: couponCommand,
          cartId: graph.cartId,
          surface: "CHECKOUT_REVIEW",
          coarseOutcome: "APPLIED",
          payableChangedVsValidAlternative: true,
          occurredAt: inside,
          checkoutJourneyKey: payJourney,
        });
        await tx.db.insert(commercialCommandResultsTable).values({
          sourceCommandId: invalidCommand,
          cartId: graph.cartId,
          surface: "CART",
          coarseOutcome: "INVALID",
          payableChangedVsValidAlternative: null,
          occurredAt: inside,
          checkoutJourneyKey: payJourney,
        });
        await tx.db.insert(commercialCommandResultsTable).values({
          sourceCommandId: nullKeyInvalid,
          cartId: graph.cartId,
          surface: "CART",
          coarseOutcome: "INVALID",
          payableChangedVsValidAlternative: null,
          occurredAt: inside,
          checkoutJourneyKey: null,
        });

        const matchEval = await insertEvaluation(tx, {
          graph,
          journeyKey: payJourney,
          occurredAt: inside,
        });
        const mismatchEval = await insertEvaluation(tx, {
          graph,
          journeyKey: payJourney,
          occurredAt: inside,
        });
        const unobservedEval = await insertEvaluation(tx, {
          graph,
          journeyKey: payJourney,
          occurredAt: inside,
        });
        await tx.db.insert(commercialPresentationObservationsTable).values({
          evaluationId: matchEval,
          surface: "CHECKOUT_REVIEW",
          observedComponents: [],
          observedProgressPresent: false,
          observedProgressRemainingPaise: null,
          observedCoarseShape: "NONE",
          observedComplimentaryPresent: false,
          serverPresentationMatch: true,
          mismatchFlags: [],
          occurredAt: inside,
        });
        await tx.db.insert(commercialPresentationObservationsTable).values({
          evaluationId: matchEval,
          surface: "CART",
          observedComponents: [],
          observedProgressPresent: false,
          observedProgressRemainingPaise: null,
          observedCoarseShape: "NONE",
          observedComplimentaryPresent: false,
          serverPresentationMatch: true,
          mismatchFlags: [],
          occurredAt: inside,
        });
        await tx.db.insert(offerResultViewsTable).values({
          evaluationId: matchEval,
          surface: "CART",
          occurredAt: inside,
        });
        await tx.db.insert(commercialPresentationObservationsTable).values({
          evaluationId: mismatchEval,
          surface: "CHECKOUT_REVIEW",
          observedComponents: [],
          observedProgressPresent: false,
          observedProgressRemainingPaise: null,
          observedCoarseShape: "NONE",
          observedComplimentaryPresent: false,
          serverPresentationMatch: false,
          mismatchFlags: ["WRONG_AMOUNT"],
          occurredAt: inside,
        });
        await tx.db.insert(offerResultViewsTable).values({
          evaluationId: mismatchEval,
          surface: "CHECKOUT_REVIEW",
          occurredAt: inside,
        });
        void unobservedEval;
      });

      const report = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });

      expect(report.reviewToPayment.status).toBe("RATE");
      if (report.reviewToPayment.status !== "RATE") return;
      expect(report.reviewToPayment.numerator).toBeGreaterThanOrEqual(2);

      expect(report.paymentCompletionAfterRevalidation.status).toBe("RATE");
      if (report.paymentCompletionAfterRevalidation.status !== "RATE") return;
      expect(report.paymentCompletionAfterRevalidation.denominator).toBe(4);
      expect(report.paymentCompletionAfterRevalidation.numerator).toBe(2);

      expect(report.couponOutcomeDistribution).toEqual({
        APPLIED: 1,
        INVALID: 2,
      });
      expect(report.repeatedInvalidAttempts).toBe(1);

      expect(report.validNotSelectedContinuation.status).toBe("RATE");
      if (report.validNotSelectedContinuation.status !== "RATE") return;
      expect(report.validNotSelectedContinuation.denominator).toBe(1);
      expect(report.validNotSelectedContinuation.numerator).toBe(1);

      expect(report.changedTotalRecoveryContinuation.status).toBe("RATE");
      if (report.changedTotalRecoveryContinuation.status !== "RATE") return;
      expect(report.changedTotalRecoveryContinuation.denominator).toBe(2);
      expect(report.changedTotalRecoveryContinuation.numerator).toBe(2);

      expect(report.complimentaryUnavailableContinuation.status).toBe("RATE");
      if (report.complimentaryUnavailableContinuation.status !== "RATE") return;
      expect(report.complimentaryUnavailableContinuation.denominator).toBe(1);
      expect(report.complimentaryUnavailableContinuation.numerator).toBe(1);

      expect(report.supportContacts).toEqual({ status: "UNAVAILABLE" });
      expect(report.offerResultViewCount).toBe(2);

      const reviewIntegrity = report.displayedSavingsIntegrity.find(
        (row) => row.surface === "CHECKOUT_REVIEW",
      );
      expect(reviewIntegrity?.numerator).toBe(1);
      expect(reviewIntegrity?.denominator).toBe(2);
      expect(reviewIntegrity?.unobserved).toBeGreaterThanOrEqual(1);

      const encoded = JSON.stringify(report);
      expect(encoded).not.toMatch(/T7 User|example\.com|\+91810|coupon-secret|Bearer/i);
      expect(encoded).not.toContain(graph.customerId);
      expect(PRIMARY_METRIC).toBe(
        "CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE",
      );

      const snapshotCols = await withTestDatabaseClient(connectionString, (client) =>
        client.pool.query<{ column_name: string }>(
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'app' AND table_name = 'measurement_report_snapshots'
           ORDER BY ordinal_position`,
        ),
      );
      expect(snapshotCols.rows.map((row) => row.column_name)).toEqual([
        "metric",
        "window_start",
        "window_end",
        "report_as_of",
        "published_report",
      ]);
      const stored = await persistence.withContext((ctx) =>
        ctx.db.select().from(measurementReportSnapshotsTable),
      );
      const payload = JSON.stringify(stored[0]?.publishedReport ?? {});
      expect(payload).not.toMatch(/T7 User|example\.com|\+91810|coupon-secret|Bearer/i);
      expect(payload).not.toContain(graph.customerId);
      expect(payload).not.toMatch(/customerId|email|phone|couponCode/i);
    });
  });

  it("T7 production stale recovery writes STALE_RECOVERY and feeds changed-total continuation", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      const lineId = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select id::text as id from app.cart_lines
          where cart_id = ${h.cartId}::uuid limit 1
        `);
        return r.rows[0]!.id as string;
      });
      await setCartLineQuantity(
        h.persistence,
        {
          kind: "customer",
          actor: h.actors.customerA,
          brandId: h.actors.tree.brand.id,
        },
        {
          cartLineId: lineId,
          quantity: 2,
          expectedRevision: h.cartRevision,
        },
      );
      await expect(
        prepareCheckoutForPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
          },
          checkoutOpts(),
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      const originCount = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select count(*)::text as c
          from app.commercial_command_origins
          where cart_id = ${h.cartId}::uuid
            and origin_kind = 'STALE_RECOVERY'
        `);
        return Number(r.rows[0]?.c ?? "0");
      });
      expect(originCount).toBeGreaterThan(0);
      const checkout = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select revision::text as revision, checkout_journey_key::text as journey
          from app.checkouts where id = ${ready.checkoutId}::uuid
        `);
        return r.rows[0] as { revision: string; journey: string };
      });
      const recovered = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: BigInt(checkout.revision),
        },
        checkoutOpts(),
      );
      const changeFact = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select count(*)::text as c
          from app.commercial_command_origins o
          inner join app.checkout_journey_facts f
            on f.fact_id = o.resolved_change_fact_id
          where o.cart_id = ${h.cartId}::uuid
            and o.origin_kind = 'STALE_RECOVERY'
            and f.fact_kind = 'COMMERCIAL_STATE_CHANGE'
        `);
        return Number(r.rows[0]?.c ?? "0");
      });
      expect(changeFact).toBeGreaterThan(0);
      await h.persistence.transaction(async (tx) => {
        await ensureReviewPresentedThenPaymentFacts({
          context: tx,
          journeyKey: checkout.journey,
          checkoutId: ready.checkoutId,
          paymentIdempotencyKey: null,
          continueSourceCommandId: randomUUID(),
        });
      });
      void recovered;
      const report = await publishMeasurementReport(h.persistence, {
        productionReleaseAnchor: new Date("2026-10-01T18:30:00.000Z"),
      });
      expect(report.changedTotalRecoveryContinuation.status).toBe("RATE");
      if (report.changedTotalRecoveryContinuation.status !== "RATE") return;
      expect(report.changedTotalRecoveryContinuation.denominator).toBeGreaterThan(0);
      expect(report.changedTotalRecoveryContinuation.numerator).toBeGreaterThan(0);
      expect(report.paymentCompletionAfterRevalidation.status).toBe("RATE");
    });
  });

  it("T7 production equivalent prepare resolves STALE_RECOVERY as NO_RESULT_CHANGE", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      await prepareCheckoutForPayment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: ready.revision,
        },
        checkoutOpts(),
      );
      const origin = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select resolution, resolved_change_fact_id::text as fact
          from app.commercial_command_origins
          where cart_id = ${h.cartId}::uuid
            and origin_kind = 'STALE_RECOVERY'
        `);
        return r.rows as Array<{ resolution: string | null; fact: string | null }>;
      });
      expect(origin.length).toBeGreaterThan(0);
      expect(origin.every((row) => row.resolution === "NO_RESULT_CHANGE")).toBe(true);
      expect(origin.every((row) => row.fact === null)).toBe(true);
      const journey = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select checkout_journey_key::text as journey
          from app.checkouts where id = ${ready.checkoutId}::uuid
        `);
        return r.rows[0]!.journey as string;
      });
      await h.persistence.transaction(async (tx) => {
        await ensureReviewPresentedThenPaymentFacts({
          context: tx,
          journeyKey: journey,
          checkoutId: ready.checkoutId,
          paymentIdempotencyKey: randomUUID(),
          continueSourceCommandId: randomUUID(),
        });
      });
      const report = await publishMeasurementReport(h.persistence, {
        productionReleaseAnchor: new Date("2026-10-01T18:30:00.000Z"),
      });
      expect(report.changedTotalRecoveryContinuation.status).toBe(
        "INSUFFICIENT_EVIDENCE",
      );
      expect(report.paymentCompletionAfterRevalidation.denominator).toBeGreaterThan(0);
    });
  });

  it("T7 production complimentary unavailable stale recovery feeds the continuation", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const gift = await seedActiveStandardVariant(
        h.persistence,
        h.actors.tree.brand.id,
        h.actors.brandAdminActor,
        "gift",
      );
      await includeVariantAtBrand(
        h.persistence,
        h.actors.brandAdminActor,
        h.actors.tree.brand.id,
        gift.variantId,
      );
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          insert into app.price_book_variant_prices (
            id, brand_id, price_book_id, variant_id, amount_paise, tax_category_id, created_at
          )
          select
            ${randomUUID()}::uuid,
            p.brand_id,
            p.price_book_id,
            ${gift.variantId}::uuid,
            2500,
            p.tax_category_id,
            now()
          from app.price_book_variant_prices p
          inner join app.cart_lines cl on cl.variant_id = p.variant_id
          where cl.cart_id = ${h.cartId}::uuid
          limit 1
        `);
      });
      const promotionId = await h.persistence.transaction(async (tx) => {
        const created = await createPromotionDraft(tx, {
          actor: h.actors.brandAdminActor,
          brandId: h.actors.tree.brand.id,
          code: uniqueCode("gift"),
          displayName: "Complimentary T7",
          scopeType: "brand",
          territoryId: null,
          organizationId: null,
          outletId: null,
          triggerType: "automatic",
          stackingPolicy: "combinable",
          startsAt: new Date("2026-01-01T00:00:00Z"),
          endsAt: null,
        });
        await tx.db.execute(sql`
          insert into app.promotion_benefits (
            id, promotion_id, benefit_type, complimentary_product_id,
            complimentary_variant_id, created_at, updated_at
          ) values (
            ${randomUUID()}::uuid, ${created.id}::uuid, 'complimentary_item',
            ${gift.productId}::uuid, ${gift.variantId}::uuid, now(), now()
          )
        `);
        await tx.db.execute(sql`
          update app.promotions
          set complimentary_item = true
          where id = ${created.id}::uuid
        `);
        for (const role of ["qualifier", "benefit"] as const) {
          await setPromotionTargets(tx, {
            actor: h.actors.brandAdminActor,
            promotionId: created.id,
            expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
            targetRole: role,
            targets: [
              {
                targetRole: role,
                targetType: "all_merchandise",
                productId: null,
                variantId: null,
                chargeDefinitionId: null,
              },
            ],
          });
        }
        await activatePromotion(tx, {
          actor: h.actors.brandAdminActor,
          promotionId: created.id,
          expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
        });
        return created.id;
      });
      void promotionId;
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      await h.persistence.transaction(async (tx) => {
        await setVariantAvailability(tx, {
          actor: h.actors.brandAdminActor,
          outletId: h.actors.tree.outletA.id,
          variantId: gift.variantId,
          state: "sold_out",
          unavailableUntil: null,
        });
      });
      await expect(
        prepareCheckoutForPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
          },
          checkoutOpts(),
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      const checkout = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select revision::text as revision, checkout_journey_key::text as journey
          from app.checkouts where id = ${ready.checkoutId}::uuid
        `);
        return r.rows[0] as { revision: string; journey: string };
      });
      const recovered = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: BigInt(checkout.revision),
        },
        checkoutOpts(),
      );
      const reason = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select e.explanation_reason_class as reason
          from app.commercial_evaluations e
          where e.evaluation_id = ${recovered.evaluationId}::uuid
        `);
        return r.rows[0]?.reason as string;
      });
      expect(reason).toBe("COMPLIMENTARY_ITEM_UNAVAILABLE");
      const giftLines = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select count(*)::text as c
          from app.checkout_snapshot_lines
          where snapshot_id = ${recovered.snapshot.id}::uuid
            and line_origin = 'complimentary_offer'
        `);
        return Number(r.rows[0]?.c ?? "0");
      });
      expect(giftLines).toBe(0);
      await h.persistence.transaction(async (tx) => {
        await ensureReviewPresentedThenPaymentFacts({
          context: tx,
          journeyKey: checkout.journey,
          checkoutId: ready.checkoutId,
          paymentIdempotencyKey: null,
          continueSourceCommandId: randomUUID(),
        });
      });
      const report = await publishMeasurementReport(h.persistence, {
        productionReleaseAnchor: new Date("2026-10-01T18:30:00.000Z"),
      });
      expect(report.complimentaryUnavailableContinuation.status).toBe("RATE");
      if (report.complimentaryUnavailableContinuation.status !== "RATE") return;
      expect(report.complimentaryUnavailableContinuation.denominator).toBeGreaterThan(0);
      expect(report.complimentaryUnavailableContinuation.numerator).toBeGreaterThan(0);
    });
  });

  it("T7 late observation after window_end matures into integrity at a later REPORT_AS_OF", async () => {
    await withHarness("lateobs", async ({ persistence, graph, window, inside }) => {
      const laterCutoff = new Date(window.windowEnd.getTime() + 60_000);
      const lateObservedAt = new Date(window.windowEnd.getTime() + 1_000);
      await persistence.transaction(async (tx) => {
        const evaluationId = await insertEvaluation(tx, {
          graph,
          journeyKey: null,
          surfaceScope: "CART",
          occurredAt: inside,
        });
        await tx.db.insert(commercialPresentationObservationsTable).values({
          evaluationId,
          surface: "CART",
          observedComponents: [],
          observedProgressPresent: false,
          observedProgressRemainingPaise: null,
          observedCoarseShape: "NONE",
          observedComplimentaryPresent: false,
          serverPresentationMatch: true,
          mismatchFlags: [],
          occurredAt: lateObservedAt,
        });
      });
      const initial = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: window.reportAsOf,
      });
      const initialCart = initial.displayedSavingsIntegrity.find(
        (row) => row.surface === "CART",
      );
      expect(initialCart?.unobserved).toBeGreaterThanOrEqual(1);
      expect(initialCart?.denominator).toBe(0);
      const matured = await publishMeasurementReport(persistence, {
        productionReleaseAnchor: window.windowStart,
        reportAsOf: laterCutoff,
      });
      const maturedCart = matured.displayedSavingsIntegrity.find(
        (row) => row.surface === "CART",
      );
      expect(maturedCart?.unobserved).toBe(0);
      expect(maturedCart?.denominator).toBe(1);
      expect(maturedCart?.numerator).toBe(1);
    });
  });

  it("T7 production coupon-backed complimentary unavailable feeds the continuation", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const gift = await seedActiveStandardVariant(
        h.persistence,
        h.actors.tree.brand.id,
        h.actors.brandAdminActor,
        "giftc",
      );
      await includeVariantAtBrand(
        h.persistence,
        h.actors.brandAdminActor,
        h.actors.tree.brand.id,
        gift.variantId,
      );
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          insert into app.price_book_variant_prices (
            id, brand_id, price_book_id, variant_id, amount_paise, tax_category_id, created_at
          )
          select
            ${randomUUID()}::uuid,
            p.brand_id,
            p.price_book_id,
            ${gift.variantId}::uuid,
            2500,
            p.tax_category_id,
            now()
          from app.price_book_variant_prices p
          inner join app.cart_lines cl on cl.variant_id = p.variant_id
          where cl.cart_id = ${h.cartId}::uuid
          limit 1
        `);
      });
      const couponCode = uniqueCode("GFT");
      await h.persistence.transaction(async (tx) => {
        const created = await createPromotionDraft(tx, {
          actor: h.actors.brandAdminActor,
          brandId: h.actors.tree.brand.id,
          code: uniqueCode("giftc"),
          displayName: "Complimentary coupon T7",
          scopeType: "brand",
          territoryId: null,
          organizationId: null,
          outletId: null,
          triggerType: "coupon",
          stackingPolicy: "combinable",
          startsAt: new Date("2026-01-01T00:00:00Z"),
          endsAt: null,
        });
        await tx.db.execute(sql`
          insert into app.promotion_benefits (
            id, promotion_id, benefit_type, complimentary_product_id,
            complimentary_variant_id, created_at, updated_at
          ) values (
            ${randomUUID()}::uuid, ${created.id}::uuid, 'complimentary_item',
            ${gift.productId}::uuid, ${gift.variantId}::uuid, now(), now()
          )
        `);
        await tx.db.execute(sql`
          update app.promotions
          set complimentary_item = true
          where id = ${created.id}::uuid
        `);
        for (const role of ["qualifier", "benefit"] as const) {
          await setPromotionTargets(tx, {
            actor: h.actors.brandAdminActor,
            promotionId: created.id,
            expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
            targetRole: role,
            targets: [
              {
                targetRole: role,
                targetType: "all_merchandise",
                productId: null,
                variantId: null,
                chargeDefinitionId: null,
              },
            ],
          });
        }
        await activatePromotion(tx, {
          actor: h.actors.brandAdminActor,
          promotionId: created.id,
          expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
        });
        const coupon = await createCouponDraft(tx, {
          actor: h.actors.brandAdminActor,
          promotionId: created.id,
          origin: "manual",
          canonicalCode: couponCode,
          maximumRedemptions: null,
          maximumRedemptionsPerCustomer: null,
        });
        await activateCoupon(tx, {
          actor: h.actors.brandAdminActor,
          couponId: coupon.id,
          expectedCouponRevision: (await getCoupon(tx, coupon.id))!.revision,
        });
      });
      await applyCouponToCustomerCart(
        h.persistence,
        h.actors.customerA,
        h.actors.tree.brand.id,
        h.cartRevision,
        couponCode,
      );
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      await h.persistence.transaction(async (tx) => {
        await setVariantAvailability(tx, {
          actor: h.actors.brandAdminActor,
          outletId: h.actors.tree.outletA.id,
          variantId: gift.variantId,
          state: "sold_out",
          unavailableUntil: null,
        });
      });
      await expect(
        prepareCheckoutForPayment(
          h.persistence,
          h.actors.customerA,
          {
            checkoutId: ready.checkoutId,
            expectedCheckoutRevision: ready.revision,
          },
          checkoutOpts(),
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      const checkout = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select revision::text as revision, checkout_journey_key::text as journey
          from app.checkouts where id = ${ready.checkoutId}::uuid
        `);
        return r.rows[0] as { revision: string; journey: string };
      });
      const recovered = await evaluateCheckout(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: BigInt(checkout.revision),
        },
        checkoutOpts(),
      );
      const reason = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select e.explanation_reason_class as reason
          from app.commercial_evaluations e
          where e.evaluation_id = ${recovered.evaluationId}::uuid
        `);
        return r.rows[0]?.reason as string;
      });
      expect(reason).toBe("COMPLIMENTARY_ITEM_UNAVAILABLE");
      await h.persistence.transaction(async (tx) => {
        await ensureReviewPresentedThenPaymentFacts({
          context: tx,
          journeyKey: checkout.journey,
          checkoutId: ready.checkoutId,
          paymentIdempotencyKey: null,
          continueSourceCommandId: randomUUID(),
        });
      });
      const report = await publishMeasurementReport(h.persistence, {
        productionReleaseAnchor: new Date("2026-10-01T18:30:00.000Z"),
      });
      expect(report.complimentaryUnavailableContinuation.status).toBe("RATE");
      if (report.complimentaryUnavailableContinuation.status !== "RATE") return;
      expect(report.complimentaryUnavailableContinuation.denominator).toBeGreaterThan(0);
      expect(report.complimentaryUnavailableContinuation.numerator).toBeGreaterThan(0);
    });
  });

  it("T7 stale-recovery origin ordinal serializes under the cart lock", async () => {
    await withCheckoutReadyHarness(async (h) => {
      const ready = await bringCheckoutToReady(
        h.persistence,
        h.actors.customerA,
        h.cartId,
        h.addressId,
      );
      let releaseHeld: (() => void) | undefined;
      const cartLocked = new Promise<void>((resolve) => {
        releaseHeld = resolve;
      });
      const couponOrigin = h.persistence.transaction(async (tx) => {
        await lockCartForUpdate(tx, h.cartId);
        releaseHeld?.();
        await new Promise((resolve) => setTimeout(resolve, 250));
        await insertCommandOrigin({
          context: tx,
          sourceCommandId: randomUUID(),
          originKind: "COUPON_APPLY",
          cartId: h.cartId,
          checkoutId: ready.checkoutId,
          checkoutJourneyKey: null,
        });
      });
      await cartLocked;
      const prepare = prepareCheckoutForPayment(
        h.persistence,
        h.actors.customerA,
        {
          checkoutId: ready.checkoutId,
          expectedCheckoutRevision: ready.revision,
        },
        checkoutOpts(),
      );
      await Promise.all([couponOrigin, prepare]);
      const ordinals = await h.persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select cart_origin_ordinal::text as ordinal
          from app.commercial_command_origins
          where cart_id = ${h.cartId}::uuid
          order by cart_origin_ordinal
        `);
        return r.rows.map((row) => String(row.ordinal));
      });
      expect(new Set(ordinals).size).toBe(ordinals.length);
      expect(ordinals.length).toBeGreaterThanOrEqual(2);
    });
  });
});
