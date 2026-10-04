/**
 * IMP-036J tranche 2 measurement persistence.
 *
 * Schema and constraints only. Writers, transport, and report calculation
 * stay later tranches. Shapes follow IMP-036J-MEASUREMENT-CANDIDATE-2
 * section 4. Measurement rows are not a commercial retention authority:
 * cart-owned rows cascade with the cart, and checkout-owned rows do not
 * use a RESTRICT foreign key that would block checkout deletion.
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  customType,
  foreignKey,
  index,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { cartsTable } from "./cart";
import { catalogVariantsTable } from "./catalog";
import { checkoutsTable } from "./checkout";
import { appSchema } from "./index";

const pgBytea = customType<{ data: Uint8Array; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Uint8Array): Buffer {
    return Buffer.from(value);
  },
  fromDriver(value: Buffer): Uint8Array {
    return new Uint8Array(value);
  },
});

function paise(name: string) {
  return bigint(name, { mode: "bigint" });
}

const FACT_KINDS = `
  'REVIEW_PRESENTED',
  'COUPON_ATTEMPT',
  'COMMERCIAL_STATE_CHANGE',
  'CART_REVIEW_REACH',
  'REVIEW_TO_PAYMENT',
  'PAYMENT_ATTEMPT',
  'DIRECT_ORDER_COMPLETION'
`;

const PRESENTATION_CLASSES = `
  'CHANGED_TOTAL_RECOVERY',
  'COMPLIMENTARY_ITEM',
  'EQUAL_PAYABLE_SELECTED',
  'COUPON_SELECTED',
  'EQUAL_PAYABLE_NOT_SELECTED',
  'COUPON_VALID_NOT_SELECTED',
  'THRESHOLD_PROGRESS',
  'AUTOMATIC_SAVING',
  'NO_OFFER'
`;

const COARSE_SHAPES = `
  'NONE',
  'AUTOMATIC_SAVING',
  'ORDER_SAVING',
  'DELIVERY_SAVING',
  'BOTH_SAVINGS',
  'COMPLIMENTARY_LINE',
  'COUPON_SELECTED',
  'COUPON_VALID_NOT_SELECTED',
  'EQUAL_PAYABLE_SELECTED',
  'EQUAL_PAYABLE_NOT_SELECTED',
  'THRESHOLD_PROGRESS'
`;

const MISMATCH_FLAGS = `
  'WRONG_AMOUNT',
  'OMITTED_ROW',
  'EXTRA_ROW',
  'WRONG_COMPONENT',
  'WRONG_COMPLIMENTARY_ITEM',
  'WRONG_TOTAL_SAVED',
  'WRONG_ZERO_STATE',
  'WRONG_SHAPE',
  'PROGRESS_MISMATCH'
`;

const OBSERVATION_SURFACES = `'CART', 'CHECKOUT_REVIEW'`;

const COARSE_CLASS_TOKEN_SQL = sql.raw(`'^[A-Z][A-Z0-9_]*$'`);

export const checkoutJourneyHeadsTable = appSchema.table(
  "checkout_journey_heads",
  {
    checkoutJourneyKey: uuid("checkout_journey_key").primaryKey(),
    nextSequence: bigint("next_sequence", { mode: "bigint" }).notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [
    check(
      "checkout_journey_heads_next_sequence_positive_check",
      sql`${table.nextSequence} > 0`,
    ),
  ],
);

export const commercialEvaluationsTable = appSchema.table(
  "commercial_evaluations",
  {
    evaluationId: uuid("evaluation_id").primaryKey(),
    cartId: uuid("cart_id").notNull(),
    checkoutId: uuid("checkout_id"),
    checkoutJourneyKey: uuid("checkout_journey_key"),
    surfaceScope: text("surface_scope").notNull(),
    resultFingerprint: pgBytea("result_fingerprint").notNull(),
    expectedComponents: jsonb("expected_components").notNull(),
    expectedTotalSavedPaise: paise("expected_total_saved_paise").notNull(),
    expectedProgressPresent: boolean("expected_progress_present").notNull(),
    expectedProgressRemainingPaise: paise("expected_progress_remaining_paise"),
    expectedCoarseShape: text("expected_coarse_shape").notNull(),
    explanationReasonClass: text("explanation_reason_class").notNull(),
    complimentaryVariantId: uuid("complimentary_variant_id"),
    projectedComplimentaryLineSha256: pgBytea("projected_complimentary_line_sha256"),
    serverExplanationIntegrity: boolean("server_explanation_integrity").notNull(),
    cartOriginOrdinalInclusive: bigint("cart_origin_ordinal_inclusive", {
      mode: "bigint",
    }),
    occurrenceOrdinal: bigint("occurrence_ordinal", { mode: "bigint" }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    foreignKey({
      name: "commercial_evaluations_cart_fk",
      columns: [table.cartId],
      foreignColumns: [cartsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "commercial_evaluations_checkout_fk",
      columns: [table.checkoutId],
      foreignColumns: [checkoutsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "commercial_evaluations_journey_head_fk",
      columns: [table.checkoutJourneyKey],
      foreignColumns: [checkoutJourneyHeadsTable.checkoutJourneyKey],
    }).onDelete("restrict"),
    foreignKey({
      name: "commercial_evaluations_complimentary_variant_fk",
      columns: [table.complimentaryVariantId],
      foreignColumns: [catalogVariantsTable.id],
    }).onDelete("restrict"),
    check(
      "commercial_evaluations_surface_scope_check",
      sql`(
        (
          ${table.surfaceScope} = 'CART'
          and ${table.checkoutId} is null
        )
        or
        (
          ${table.surfaceScope} = 'CHECKOUT'
          and ${table.checkoutId} is not null
        )
      )`,
    ),
    check(
      "commercial_evaluations_fingerprint_sha256_check",
      sql`octet_length(${table.resultFingerprint}) = 32`,
    ),
    check(
      "commercial_evaluations_components_array_check",
      sql`jsonb_typeof(${table.expectedComponents}) = 'array'`,
    ),
    check(
      "commercial_evaluations_total_saved_nonnegative_check",
      sql`${table.expectedTotalSavedPaise} >= 0`,
    ),
    check(
      "commercial_evaluations_progress_check",
      sql`(
        (
          ${table.expectedProgressPresent} = false
          and ${table.expectedProgressRemainingPaise} is null
        )
        or
        (
          ${table.expectedProgressPresent} = true
          and ${table.expectedProgressRemainingPaise} is not null
          and ${table.expectedProgressRemainingPaise} >= 0
        )
      )`,
    ),
    check(
      "commercial_evaluations_coarse_shape_check",
      sql`${table.expectedCoarseShape} in (${sql.raw(COARSE_SHAPES)})`,
    ),
    check(
      "commercial_evaluations_reason_class_token_check",
      sql`${table.explanationReasonClass} ~ ${COARSE_CLASS_TOKEN_SQL}`,
    ),
    check(
      "commercial_evaluations_complimentary_line_sha256_check",
      sql`${table.projectedComplimentaryLineSha256} is null or octet_length(${table.projectedComplimentaryLineSha256}) = 32`,
    ),
    check(
      "commercial_evaluations_origin_ordinal_positive_check",
      sql`${table.cartOriginOrdinalInclusive} is null or ${table.cartOriginOrdinalInclusive} > 0`,
    ),
    check(
      "commercial_evaluations_occurrence_ordinal_positive_check",
      sql`${table.occurrenceOrdinal} > 0`,
    ),
    uniqueIndex("commercial_evaluations_cart_occurrence_uidx")
      .on(table.cartId, table.resultFingerprint, table.occurrenceOrdinal)
      .where(sql`${table.surfaceScope} = 'CART'`),
    uniqueIndex("commercial_evaluations_checkout_occurrence_uidx")
      .on(table.checkoutId, table.resultFingerprint, table.occurrenceOrdinal)
      .where(sql`${table.surfaceScope} = 'CHECKOUT'`),
    index("commercial_evaluations_cart_id_idx").on(table.cartId),
    index("commercial_evaluations_checkout_id_idx").on(table.checkoutId),
  ],
);

export const checkoutJourneyFactsTable = appSchema.table(
  "checkout_journey_facts",
  {
    factId: uuid("fact_id").primaryKey(),
    checkoutJourneyKey: uuid("checkout_journey_key").notNull(),
    factKind: text("fact_kind").notNull(),
    journeySequence: bigint("journey_sequence", { mode: "bigint" }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    idempotencyKey: pgBytea("idempotency_key").notNull(),
    evaluationId: uuid("evaluation_id"),
    activationId: uuid("activation_id"),
    resultFingerprint: pgBytea("result_fingerprint"),
    presentationClass: text("presentation_class"),
    coarseOutcome: text("coarse_outcome"),
  },
  (table) => [
    foreignKey({
      name: "checkout_journey_facts_head_fk",
      columns: [table.checkoutJourneyKey],
      foreignColumns: [checkoutJourneyHeadsTable.checkoutJourneyKey],
    }).onDelete("restrict"),
    foreignKey({
      name: "checkout_journey_facts_evaluation_fk",
      columns: [table.evaluationId],
      foreignColumns: [commercialEvaluationsTable.evaluationId],
    }).onDelete("cascade"),
    check(
      "checkout_journey_facts_sequence_positive_check",
      sql`${table.journeySequence} > 0`,
    ),
    check(
      "checkout_journey_facts_idempotency_key_present_check",
      sql`octet_length(${table.idempotencyKey}) > 0`,
    ),
    check(
      "checkout_journey_facts_fingerprint_sha256_check",
      sql`${table.resultFingerprint} is null or octet_length(${table.resultFingerprint}) = 32`,
    ),
    check(
      "checkout_journey_facts_coarse_outcome_token_check",
      sql`${table.coarseOutcome} is null or ${table.coarseOutcome} ~ ${COARSE_CLASS_TOKEN_SQL}`,
    ),
    check(
      "checkout_journey_facts_kind_shape_check",
      sql`(
        (
          ${table.factKind} = 'REVIEW_PRESENTED'
          and ${table.evaluationId} is not null
          and ${table.presentationClass} is not null
          and ${table.presentationClass} in (${sql.raw(PRESENTATION_CLASSES)})
        )
        or
        (
          ${table.factKind} = 'COUPON_ATTEMPT'
          and ${table.presentationClass} is null
        )
        or
        (
          ${table.factKind} = 'COMMERCIAL_STATE_CHANGE'
          and ${table.presentationClass} is null
          and ${table.resultFingerprint} is not null
        )
        or
        (
          ${table.factKind} = 'CART_REVIEW_REACH'
          and ${table.presentationClass} is null
          and ${table.activationId} is not null
          and ${table.evaluationId} is not null
        )
        or
        (
          ${table.factKind} = 'REVIEW_TO_PAYMENT'
          and ${table.presentationClass} is null
        )
        or
        (
          ${table.factKind} = 'PAYMENT_ATTEMPT'
          and ${table.presentationClass} is null
        )
        or
        (
          ${table.factKind} = 'DIRECT_ORDER_COMPLETION'
          and ${table.presentationClass} is null
        )
      )`,
    ),
    check(
      "checkout_journey_facts_kind_check",
      sql`${table.factKind} in (${sql.raw(FACT_KINDS)})`,
    ),
    uniqueIndex("checkout_journey_facts_journey_sequence_uidx").on(
      table.checkoutJourneyKey,
      table.journeySequence,
    ),
    uniqueIndex("checkout_journey_facts_review_presented_uidx")
      .on(table.checkoutJourneyKey, table.evaluationId)
      .where(sql`${table.factKind} = 'REVIEW_PRESENTED'`),
    uniqueIndex("checkout_journey_facts_coupon_attempt_uidx")
      .on(table.idempotencyKey)
      .where(sql`${table.factKind} = 'COUPON_ATTEMPT'`),
    uniqueIndex("checkout_journey_facts_commercial_state_change_uidx")
      .on(table.idempotencyKey)
      .where(sql`${table.factKind} = 'COMMERCIAL_STATE_CHANGE'`),
    uniqueIndex("checkout_journey_facts_cart_review_reach_uidx")
      .on(table.activationId)
      .where(sql`${table.factKind} = 'CART_REVIEW_REACH'`),
    uniqueIndex("checkout_journey_facts_review_to_payment_uidx")
      .on(table.idempotencyKey)
      .where(sql`${table.factKind} = 'REVIEW_TO_PAYMENT'`),
    uniqueIndex("checkout_journey_facts_payment_attempt_uidx")
      .on(table.idempotencyKey)
      .where(sql`${table.factKind} = 'PAYMENT_ATTEMPT'`),
    uniqueIndex("checkout_journey_facts_direct_order_completion_uidx")
      .on(table.checkoutJourneyKey)
      .where(sql`${table.factKind} = 'DIRECT_ORDER_COMPLETION'`),
    index("checkout_journey_facts_evaluation_id_idx").on(table.evaluationId),
  ],
);

export const commercialPresentationObservationsTable = appSchema.table(
  "commercial_presentation_observations",
  {
    evaluationId: uuid("evaluation_id").notNull(),
    surface: text("surface").notNull(),
    observedComponents: jsonb("observed_components").notNull(),
    observedProgressPresent: boolean("observed_progress_present").notNull(),
    observedProgressRemainingPaise: paise("observed_progress_remaining_paise"),
    observedCoarseShape: text("observed_coarse_shape").notNull(),
    observedComplimentaryPresent: boolean("observed_complimentary_present").notNull(),
    observedComplimentaryLineSha256: pgBytea("observed_complimentary_line_sha256"),
    serverPresentationMatch: boolean("server_presentation_match"),
    mismatchFlags: text("mismatch_flags").array().notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    foreignKey({
      name: "commercial_presentation_observations_evaluation_fk",
      columns: [table.evaluationId],
      foreignColumns: [commercialEvaluationsTable.evaluationId],
    }).onDelete("cascade"),
    uniqueIndex("commercial_presentation_observations_evaluation_surface_uidx").on(
      table.evaluationId,
      table.surface,
    ),
    check(
      "commercial_presentation_observations_surface_check",
      sql`${table.surface} in (${sql.raw(OBSERVATION_SURFACES)})`,
    ),
    check(
      "commercial_presentation_observations_components_array_check",
      sql`jsonb_typeof(${table.observedComponents}) = 'array'`,
    ),
    check(
      "commercial_presentation_observations_progress_check",
      sql`(
        (
          ${table.observedProgressPresent} = false
          and ${table.observedProgressRemainingPaise} is null
        )
        or
        (
          ${table.observedProgressPresent} = true
          and ${table.observedProgressRemainingPaise} is not null
          and ${table.observedProgressRemainingPaise} >= 0
        )
      )`,
    ),
    check(
      "commercial_presentation_observations_coarse_shape_check",
      sql`${table.observedCoarseShape} in (${sql.raw(COARSE_SHAPES)})`,
    ),
    check(
      "commercial_presentation_observations_complimentary_line_sha256_check",
      sql`${table.observedComplimentaryLineSha256} is null or octet_length(${table.observedComplimentaryLineSha256}) = 32`,
    ),
    check(
      "commercial_presentation_observations_mismatch_flags_check",
      sql`${table.mismatchFlags} <@ ARRAY[${sql.raw(MISMATCH_FLAGS)}]::text[]`,
    ),
  ],
);

export const offerResultViewsTable = appSchema.table(
  "offer_result_views",
  {
    evaluationId: uuid("evaluation_id").primaryKey(),
    surface: text("surface").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    foreignKey({
      name: "offer_result_views_evaluation_fk",
      columns: [table.evaluationId],
      foreignColumns: [commercialEvaluationsTable.evaluationId],
    }).onDelete("cascade"),
    check(
      "offer_result_views_surface_check",
      sql`${table.surface} in (${sql.raw(OBSERVATION_SURFACES)})`,
    ),
  ],
);

export const cartCheckoutActivationsTable = appSchema.table(
  "cart_checkout_activations",
  {
    activationId: uuid("activation_id").primaryKey(),
    cartId: uuid("cart_id").notNull(),
    checkoutJourneyKey: uuid("checkout_journey_key"),
    checkoutId: uuid("checkout_id"),
    watermarkSequence: bigint("watermark_sequence", { mode: "bigint" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    reviewReachFactId: uuid("review_reach_fact_id"),
  },
  (table) => [
    foreignKey({
      name: "cart_checkout_activations_cart_fk",
      columns: [table.cartId],
      foreignColumns: [cartsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "cart_checkout_activations_checkout_fk",
      columns: [table.checkoutId],
      foreignColumns: [checkoutsTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "cart_checkout_activations_journey_head_fk",
      columns: [table.checkoutJourneyKey],
      foreignColumns: [checkoutJourneyHeadsTable.checkoutJourneyKey],
    }).onDelete("restrict"),
    foreignKey({
      name: "cart_checkout_activations_review_reach_fact_fk",
      columns: [table.reviewReachFactId],
      foreignColumns: [checkoutJourneyFactsTable.factId],
    }).onDelete("set null"),
    check(
      "cart_checkout_activations_watermark_nonnegative_check",
      sql`${table.watermarkSequence} is null or ${table.watermarkSequence} >= 0`,
    ),
    index("cart_checkout_activations_cart_id_idx").on(table.cartId),
    index("cart_checkout_activations_checkout_id_idx").on(table.checkoutId),
  ],
);

export const checkoutReviewSurfaceTokensTable = appSchema.table(
  "checkout_review_surface_tokens",
  {
    tokenSha256: pgBytea("token_sha256").primaryKey(),
    checkoutId: uuid("checkout_id").notNull(),
    cartId: uuid("cart_id").notNull(),
  },
  (table) => [
    foreignKey({
      name: "checkout_review_surface_tokens_checkout_fk",
      columns: [table.checkoutId],
      foreignColumns: [checkoutsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "checkout_review_surface_tokens_cart_fk",
      columns: [table.cartId],
      foreignColumns: [cartsTable.id],
    }).onDelete("cascade"),
    check(
      "checkout_review_surface_tokens_sha256_check",
      sql`octet_length(${table.tokenSha256}) = 32`,
    ),
    index("checkout_review_surface_tokens_checkout_id_idx").on(table.checkoutId),
    index("checkout_review_surface_tokens_cart_id_idx").on(table.cartId),
  ],
);

export const commercialCommandOriginsTable = appSchema.table(
  "commercial_command_origins",
  {
    sourceCommandId: uuid("source_command_id").primaryKey(),
    originKind: text("origin_kind").notNull(),
    cartId: uuid("cart_id").notNull(),
    checkoutId: uuid("checkout_id"),
    checkoutJourneyKey: uuid("checkout_journey_key"),
    cartOriginOrdinal: bigint("cart_origin_ordinal", { mode: "bigint" }).notNull(),
    resolvedChangeFactId: uuid("resolved_change_fact_id"),
    resolution: text("resolution"),
  },
  (table) => [
    foreignKey({
      name: "commercial_command_origins_cart_fk",
      columns: [table.cartId],
      foreignColumns: [cartsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "commercial_command_origins_checkout_fk",
      columns: [table.checkoutId],
      foreignColumns: [checkoutsTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "commercial_command_origins_journey_head_fk",
      columns: [table.checkoutJourneyKey],
      foreignColumns: [checkoutJourneyHeadsTable.checkoutJourneyKey],
    }).onDelete("restrict"),
    foreignKey({
      name: "commercial_command_origins_change_fact_fk",
      columns: [table.resolvedChangeFactId],
      foreignColumns: [checkoutJourneyFactsTable.factId],
    }).onDelete("set null"),
    check(
      "commercial_command_origins_kind_check",
      sql`${table.originKind} in (
        'COUPON_APPLY',
        'COUPON_REPLACE',
        'COUPON_REMOVE',
        'FULFILMENT_CHANGE',
        'STALE_RECOVERY'
      )`,
    ),
    check(
      "commercial_command_origins_ordinal_positive_check",
      sql`${table.cartOriginOrdinal} > 0`,
    ),
    check(
      "commercial_command_origins_resolution_check",
      sql`(
        ${table.resolution} is null
        or (
          ${table.resolution} in ('NO_RESULT_CHANGE', 'JOURNEY_BOUNDARY')
          and ${table.resolvedChangeFactId} is null
        )
      )`,
    ),
    index("commercial_command_origins_cart_id_idx").on(table.cartId),
    index("commercial_command_origins_checkout_id_idx").on(table.checkoutId),
  ],
);

export const commercialCommandResultsTable = appSchema.table(
  "commercial_command_results",
  {
    sourceCommandId: uuid("source_command_id").primaryKey(),
    cartId: uuid("cart_id").notNull(),
    surface: text("surface").notNull(),
    coarseOutcome: text("coarse_outcome").notNull(),
    payableChangedVsValidAlternative: boolean("payable_changed_vs_valid_alternative"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    /**
     * Copied journey correlation. Intentionally not a foreign key so a result
     * row cannot block deleteCartById or checkout cleanup.
     */
    checkoutJourneyKey: uuid("checkout_journey_key"),
  },
  (table) => [
    foreignKey({
      name: "commercial_command_results_cart_fk",
      columns: [table.cartId],
      foreignColumns: [cartsTable.id],
    }).onDelete("cascade"),
    check(
      "commercial_command_results_surface_check",
      sql`${table.surface} in (${sql.raw(OBSERVATION_SURFACES)})`,
    ),
    check(
      "commercial_command_results_coarse_outcome_token_check",
      sql`${table.coarseOutcome} ~ ${COARSE_CLASS_TOKEN_SQL}`,
    ),
    index("commercial_command_results_cart_id_idx").on(table.cartId),
  ],
);

export const measurementReportSnapshotsTable = appSchema.table(
  "measurement_report_snapshots",
  {
    metric: text("metric").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    windowEnd: timestamp("window_end", { withTimezone: true }).notNull(),
    reportAsOf: timestamp("report_as_of", { withTimezone: true }).notNull(),
    publishedReport: jsonb("published_report"),
  },
  (table) => [
    primaryKey({
      name: "measurement_report_snapshots_publication_pk",
      columns: [table.metric, table.windowStart, table.windowEnd, table.reportAsOf],
    }),
    check(
      "measurement_report_snapshots_metric_check",
      sql`${table.metric} ~ ${COARSE_CLASS_TOKEN_SQL}`,
    ),
    check(
      "measurement_report_snapshots_window_check",
      sql`${table.windowStart} < ${table.windowEnd}`,
    ),
    check(
      "measurement_report_snapshots_published_report_object_check",
      sql`${table.publishedReport} is null or jsonb_typeof(${table.publishedReport}) = 'object'`,
    ),
  ],
);
