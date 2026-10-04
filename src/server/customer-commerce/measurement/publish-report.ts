/**
 * IMP-036J Tranche 7 measurement reporting.
 *
 * Publishes selected formulas from already-stored measurement facts.
 * Does not write commercial truth, mint a second analytics model, or
 * expose a reporting route.
 */
import { and, eq, sql } from "drizzle-orm";

import {
  cartCheckoutActivationsTable,
  checkoutJourneyFactsTable,
  commercialCommandOriginsTable,
  commercialCommandResultsTable,
  commercialEvaluationsTable,
  commercialPresentationObservationsTable,
  measurementReportSnapshotsTable,
  offerResultViewsTable,
} from "../../../platform/database/schema/measurement";
import { PersistenceOperationError } from "../../persistence/errors";
import type {
  Persistence,
  PersistenceTransactionContext,
} from "../../persistence/types";

import {
  initialMeasurementWindow,
  type MeasurementReportWindow,
} from "./report-window";

export const PRIMARY_METRIC =
  "CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE";

const VALID_NOT_SELECTED_CLASSES = new Set([
  "COUPON_VALID_NOT_SELECTED",
  "EQUAL_PAYABLE_NOT_SELECTED",
]);

const INVALID_COARSE_CLASSES = new Set([
  "INVALID",
  "UNKNOWN",
  "EXPIRED",
  "INAPPLICABLE",
  "GLOBALLY_EXHAUSTED",
  "PERSONALLY_EXHAUSTED",
  "IDENTITY_REQUIRED",
  "FAILED",
]);

const PRIVACY_FORBIDDEN_KEY =
  /^(customerId|customerAuthUserId|email|phone|phoneNumber|couponCode|couponText|bearer|guestId|sessionSubject|sessionToken|verifier|paymentSecret|instrument|plaintext)$/i;
const PRIVACY_FORBIDDEN_VALUE =
  /@|^\+?\d{8,}$|bearer\s|coupon-secret/i;

export type ConversionResult =
  | Readonly<{
      status: "RATE";
      numerator: number;
      denominator: number;
      rate: number;
      notCompletedAsOfReportCutoff: number;
    }>
  | Readonly<{
      status: "INSUFFICIENT_EVIDENCE";
      numerator: 0;
      denominator: 0;
      rate: null;
      notCompletedAsOfReportCutoff: 0;
    }>;

export type PresentationSegment = Readonly<{
  presentationClass: string;
  reportingSegment: string;
  subsegment: string | null;
  journeyCount: number;
  completedCount: number;
  unfinishedCount: number;
}>;

export type IntegritySurface = Readonly<{
  surface: "CART" | "CHECKOUT_REVIEW";
  denominator: number;
  numerator: number;
  unobserved: number;
}>;

export type MeasurementReport = Readonly<{
  metric: typeof PRIMARY_METRIC;
  windowStart: Date;
  windowEnd: Date;
  reportAsOf: Date;
  snapshotInserted: boolean;
  primary: ConversionResult;
  segments: readonly PresentationSegment[];
  cartToCheckoutReview: ConversionResult;
  reviewToPayment: ConversionResult;
  paymentCompletionAfterRevalidation: ConversionResult;
  couponOutcomeDistribution: Readonly<Record<string, number>>;
  validNotSelectedContinuation: ConversionResult;
  changedTotalRecoveryContinuation: ConversionResult;
  complimentaryUnavailableContinuation: ConversionResult;
  repeatedInvalidAttempts: number;
  supportContacts: Readonly<{ status: "UNAVAILABLE" }>;
  displayedSavingsIntegrity: readonly IntegritySurface[];
  offerResultViewCount: number;
}>;

function timeMs(value: Date): number {
  return value.getTime();
}

function strictlyBefore(value: Date, cutoff: Date): boolean {
  return timeMs(value) < timeMs(cutoff);
}

function inHalfOpenWindow(
  value: Date,
  windowStart: Date,
  windowEnd: Date,
): boolean {
  return timeMs(value) >= timeMs(windowStart) && timeMs(value) < timeMs(windowEnd);
}

function includedOccurrence(
  value: Date,
  window: MeasurementReportWindow,
): boolean {
  return (
    inHalfOpenWindow(value, window.windowStart, window.windowEnd) &&
    strictlyBefore(value, window.reportAsOf)
  );
}

function rateResult(numerator: number, denominator: number): ConversionResult {
  if (denominator === 0) {
    return {
      status: "INSUFFICIENT_EVIDENCE",
      numerator: 0,
      denominator: 0,
      rate: null,
      notCompletedAsOfReportCutoff: 0,
    };
  }
  return {
    status: "RATE",
    numerator,
    denominator,
    rate: numerator / denominator,
    notCompletedAsOfReportCutoff: denominator - numerator,
  };
}

function reportingSegment(presentationClass: string): {
  reportingSegment: string;
  subsegment: string | null;
} {
  if (presentationClass === "EQUAL_PAYABLE_SELECTED") {
    return {
      reportingSegment: "COUPON_SELECTED",
      subsegment: "EQUAL_PAYABLE_SELECTED",
    };
  }
  if (presentationClass === "EQUAL_PAYABLE_NOT_SELECTED") {
    return {
      reportingSegment: "COUPON_VALID_NOT_SELECTED",
      subsegment: "EQUAL_PAYABLE_NOT_SELECTED",
    };
  }
  return { reportingSegment: presentationClass, subsegment: null };
}

function requiredSurfaces(
  surfaceScope: string,
): readonly ("CART" | "CHECKOUT_REVIEW")[] {
  return surfaceScope === "CART" ? ["CART"] : ["CHECKOUT_REVIEW"];
}

function isRetryablePublicationIsolation(error: unknown): boolean {
  const code =
    error instanceof PersistenceOperationError
      ? error.code
      : typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : undefined;
  return code === "40001" || code === "40P01";
}

function walkPrivacy(value: unknown, key?: string): void {
  if (key && PRIVACY_FORBIDDEN_KEY.test(key)) {
    throw new Error("Measurement report contains a forbidden privacy field.");
  }
  if (typeof value === "string" && key && PRIVACY_FORBIDDEN_VALUE.test(value)) {
    throw new Error("Measurement report contains a forbidden privacy value.");
  }
  if (Array.isArray(value)) {
    for (const item of value) walkPrivacy(item);
    return;
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    for (const [childKey, child] of Object.entries(value)) {
      walkPrivacy(child, childKey);
    }
  }
}

function assertPrivacy(report: MeasurementReport): void {
  walkPrivacy(report);
}

type PublishedAggregate = Omit<
  MeasurementReport,
  "windowStart" | "windowEnd" | "reportAsOf" | "snapshotInserted"
>;

function toPublishedAggregate(report: MeasurementReport): PublishedAggregate {
  return {
    metric: report.metric,
    primary: report.primary,
    segments: report.segments,
    cartToCheckoutReview: report.cartToCheckoutReview,
    reviewToPayment: report.reviewToPayment,
    paymentCompletionAfterRevalidation: report.paymentCompletionAfterRevalidation,
    couponOutcomeDistribution: report.couponOutcomeDistribution,
    validNotSelectedContinuation: report.validNotSelectedContinuation,
    changedTotalRecoveryContinuation: report.changedTotalRecoveryContinuation,
    complimentaryUnavailableContinuation: report.complimentaryUnavailableContinuation,
    repeatedInvalidAttempts: report.repeatedInvalidAttempts,
    supportContacts: report.supportContacts,
    displayedSavingsIntegrity: report.displayedSavingsIntegrity,
    offerResultViewCount: report.offerResultViewCount,
  };
}

function reportFromPublishedRow(input: {
  metric: string;
  windowStart: Date;
  windowEnd: Date;
  reportAsOf: Date;
  publishedReport: unknown;
  snapshotInserted: boolean;
}): MeasurementReport {
  const payload = input.publishedReport;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("measurement_report_snapshots published_report is missing.");
  }
  const report = {
    ...(payload as PublishedAggregate),
    metric: PRIMARY_METRIC,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    reportAsOf: input.reportAsOf,
    snapshotInserted: input.snapshotInserted,
  } as MeasurementReport;
  if (report.metric !== input.metric) {
    throw new Error("measurement_report_snapshots metric does not match payload.");
  }
  assertPrivacy(report);
  return report;
}

async function lookupPublication(
  tx: PersistenceTransactionContext,
  window: MeasurementReportWindow,
) {
  return (
    await tx.db
      .select()
      .from(measurementReportSnapshotsTable)
      .where(
        and(
          eq(measurementReportSnapshotsTable.metric, PRIMARY_METRIC),
          eq(measurementReportSnapshotsTable.windowStart, window.windowStart),
          eq(measurementReportSnapshotsTable.windowEnd, window.windowEnd),
          eq(measurementReportSnapshotsTable.reportAsOf, window.reportAsOf),
        ),
      )
      .limit(1)
  )[0];
}

type JourneyFact = {
  factId: string;
  checkoutJourneyKey: string;
  factKind: string;
  journeySequence: bigint;
  occurredAt: Date;
  evaluationId: string | null;
  activationId: string | null;
  presentationClass: string | null;
};

function bySequenceThenTime(a: JourneyFact, b: JourneyFact): number {
  if (a.journeySequence === b.journeySequence) {
    return timeMs(a.occurredAt) - timeMs(b.occurredAt);
  }
  return a.journeySequence < b.journeySequence ? -1 : 1;
}

function reviewsFor(facts: readonly JourneyFact[]): JourneyFact[] {
  return facts
    .filter((fact) => fact.factKind === "REVIEW_PRESENTED")
    .slice()
    .sort(bySequenceThenTime);
}

function firstReview(facts: readonly JourneyFact[]): JourneyFact | undefined {
  return reviewsFor(facts)[0];
}

function latestReviewBeforeSequence(
  facts: readonly JourneyFact[],
  sequence: bigint,
): JourneyFact | undefined {
  return reviewsFor(facts)
    .filter((fact) => fact.journeySequence < sequence)
    .at(-1);
}

function latestReviewBeforeCutoff(
  facts: readonly JourneyFact[],
  cutoff: Date,
): JourneyFact | undefined {
  return reviewsFor(facts)
    .filter((fact) => strictlyBefore(fact.occurredAt, cutoff))
    .at(-1);
}

function hasKindBeforeCutoff(
  facts: readonly JourneyFact[],
  kind: string,
  cutoff: Date,
  afterSequence?: bigint,
): boolean {
  return facts.some(
    (fact) =>
      fact.factKind === kind &&
      strictlyBefore(fact.occurredAt, cutoff) &&
      (afterSequence === undefined || fact.journeySequence > afterSequence),
  );
}

export async function publishMeasurementReport(
  persistence: Persistence,
  input: {
    productionReleaseAnchor: Date;
    reportAsOf?: Date;
  },
  proof?: Readonly<{
    afterFactsLoaded?: () => Promise<void>;
  }>,
): Promise<MeasurementReport> {
  const window = initialMeasurementWindow(input);
  const maxAttempts = 3;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const outcome = await persistence.transaction(async (tx) => {
        await tx.db.execute(
          sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`,
        );
        const existingBefore = await lookupPublication(tx, window);
        if (existingBefore?.publishedReport != null) {
          return {
            kind: "done" as const,
            report: reportFromPublishedRow({
              metric: existingBefore.metric,
              windowStart: existingBefore.windowStart,
              windowEnd: existingBefore.windowEnd,
              reportAsOf: existingBefore.reportAsOf,
              publishedReport: existingBefore.publishedReport,
              snapshotInserted: false,
            }),
          };
        }

    const facts = (await tx.db.select().from(checkoutJourneyFactsTable)).map(
      (row) => ({
        factId: row.factId,
        checkoutJourneyKey: row.checkoutJourneyKey,
        factKind: row.factKind,
        journeySequence: row.journeySequence,
        occurredAt: row.occurredAt,
        evaluationId: row.evaluationId,
        activationId: row.activationId,
        presentationClass: row.presentationClass,
      }),
    );
    const factsByJourney = new Map<string, JourneyFact[]>();
    for (const fact of facts) {
      const list = factsByJourney.get(fact.checkoutJourneyKey) ?? [];
      list.push(fact);
      factsByJourney.set(fact.checkoutJourneyKey, list);
    }
    for (const list of factsByJourney.values()) {
      list.sort(bySequenceThenTime);
    }
    if (proof?.afterFactsLoaded) {
      await proof.afterFactsLoaded();
    }

    const denominatorJourneys: string[] = [];
    const numeratorJourneys = new Set<string>();
    const segmentAcc = new Map<
      string,
      {
        presentationClass: string;
        reportingSegment: string;
        subsegment: string | null;
        journeyCount: number;
        completedCount: number;
        unfinishedCount: number;
      }
    >();

    for (const [journeyKey, journeyFacts] of [...factsByJourney.entries()].sort(
      (a, b) => a[0].localeCompare(b[0]),
    )) {
      const cohort = firstReview(journeyFacts);
      if (!cohort) continue;
      if (!includedOccurrence(cohort.occurredAt, window)) continue;
      denominatorJourneys.push(journeyKey);
      const completion = journeyFacts.find(
        (fact) =>
          fact.factKind === "DIRECT_ORDER_COMPLETION" &&
          strictlyBefore(fact.occurredAt, window.reportAsOf),
      );
      if (completion) numeratorJourneys.add(journeyKey);
      const segmentFact = completion
        ? latestReviewBeforeSequence(journeyFacts, completion.journeySequence)
        : latestReviewBeforeCutoff(journeyFacts, window.reportAsOf);
      const presentationClass = segmentFact?.presentationClass ?? "NO_OFFER";
      const mapped = reportingSegment(presentationClass);
      const key = `${presentationClass}:${mapped.subsegment ?? ""}`;
      const current = segmentAcc.get(key) ?? {
        presentationClass,
        reportingSegment: mapped.reportingSegment,
        subsegment: mapped.subsegment,
        journeyCount: 0,
        completedCount: 0,
        unfinishedCount: 0,
      };
      current.journeyCount += 1;
      if (completion) current.completedCount += 1;
      else current.unfinishedCount += 1;
      segmentAcc.set(key, current);
    }

    const activations = await tx.db.select().from(cartCheckoutActivationsTable);
    let cartDenom = 0;
    let cartNum = 0;
    for (const activation of activations
      .slice()
      .sort((a, b) => a.activationId.localeCompare(b.activationId))) {
      if (!includedOccurrence(activation.occurredAt, window)) continue;
      cartDenom += 1;
      const associated =
        activation.checkoutJourneyKey !== null &&
        activation.watermarkSequence !== null;
      if (!associated) continue;
      const reach = facts.find(
        (fact) =>
          fact.factKind === "CART_REVIEW_REACH" &&
          fact.activationId === activation.activationId &&
          fact.checkoutJourneyKey === activation.checkoutJourneyKey &&
          fact.evaluationId !== null &&
          fact.journeySequence > activation.watermarkSequence! &&
          strictlyBefore(fact.occurredAt, window.reportAsOf),
      );
      if (reach) cartNum += 1;
    }

    let reviewToPaymentNum = 0;
    for (const journeyKey of denominatorJourneys) {
      const journeyFacts = factsByJourney.get(journeyKey) ?? [];
      const cohort = firstReview(journeyFacts);
      if (!cohort) continue;
      if (
        hasKindBeforeCutoff(
          journeyFacts,
          "REVIEW_TO_PAYMENT",
          window.reportAsOf,
          cohort.journeySequence,
        )
      ) {
        reviewToPaymentNum += 1;
      }
    }

    const origins = await tx.db.select().from(commercialCommandOriginsTable);
    const evaluations = await tx.db.select().from(commercialEvaluationsTable);
    const evaluationById = new Map(
      evaluations.map((row) => [row.evaluationId, row]),
    );

    const revalidationJourneys = new Set<string>();
    const revalidatedReviewSequence = new Map<string, bigint>();

    for (const origin of origins) {
      if (origin.originKind !== "STALE_RECOVERY") continue;
      if (origin.resolvedChangeFactId) {
        const change = facts.find(
          (fact) => fact.factId === origin.resolvedChangeFactId,
        );
        if (
          !change ||
          change.factKind !== "COMMERCIAL_STATE_CHANGE" ||
          !strictlyBefore(change.occurredAt, window.reportAsOf)
        ) {
          continue;
        }
        const journeyKey = change.checkoutJourneyKey;
        if (!denominatorJourneys.includes(journeyKey)) continue;
        revalidationJourneys.add(journeyKey);
        const review = latestReviewBeforeCutoff(
          (factsByJourney.get(journeyKey) ?? []).filter(
            (fact) => fact.journeySequence >= change.journeySequence,
          ),
          window.reportAsOf,
        );
        const sequence = review?.journeySequence ?? change.journeySequence;
        const current = revalidatedReviewSequence.get(journeyKey);
        if (current === undefined || sequence > current) {
          revalidatedReviewSequence.set(journeyKey, sequence);
        }
      } else if (origin.resolution === "NO_RESULT_CHANGE") {
        const journeyKey = origin.checkoutJourneyKey;
        if (!journeyKey || !denominatorJourneys.includes(journeyKey)) continue;
        if (
          origin.resolutionOccurredAt == null ||
          !strictlyBefore(origin.resolutionOccurredAt, window.reportAsOf)
        ) {
          continue;
        }
        const consuming = evaluations
          .filter(
            (row) =>
              row.checkoutJourneyKey === journeyKey &&
              row.cartOriginOrdinalInclusive != null &&
              row.cartOriginOrdinalInclusive >= origin.cartOriginOrdinal,
          )
          .sort((a, b) => timeMs(a.occurredAt) - timeMs(b.occurredAt))[0];
        if (!consuming) continue;
        revalidationJourneys.add(journeyKey);
        const review = latestReviewBeforeCutoff(
          factsByJourney.get(journeyKey) ?? [],
          window.reportAsOf,
        );
        if (review) {
          const current = revalidatedReviewSequence.get(journeyKey);
          if (current === undefined || review.journeySequence > current) {
            revalidatedReviewSequence.set(journeyKey, review.journeySequence);
          }
        }
      }
    }

    let revalidationNum = 0;
    for (const journeyKey of [...revalidationJourneys].sort()) {
      const journeyFacts = factsByJourney.get(journeyKey) ?? [];
      const reviewSequence = revalidatedReviewSequence.get(journeyKey);
      if (reviewSequence === undefined) continue;
      const completed = hasKindBeforeCutoff(
        journeyFacts,
        "DIRECT_ORDER_COMPLETION",
        window.reportAsOf,
      );
      const paidAfter = hasKindBeforeCutoff(
        journeyFacts,
        "PAYMENT_ATTEMPT",
        window.reportAsOf,
        reviewSequence,
      );
      if (completed && paidAfter) revalidationNum += 1;
    }

    const commandResults = await tx.db
      .select()
      .from(commercialCommandResultsTable);
    const couponDistribution: Record<string, number> = {};
    let repeatedInvalidAttempts = 0;
    for (const row of commandResults) {
      if (!includedOccurrence(row.occurredAt, window)) continue;
      couponDistribution[row.coarseOutcome] =
        (couponDistribution[row.coarseOutcome] ?? 0) + 1;
      if (
        INVALID_COARSE_CLASSES.has(row.coarseOutcome) &&
        row.checkoutJourneyKey !== null
      ) {
        repeatedInvalidAttempts += 1;
      }
    }
    const couponOutcomeDistribution = Object.fromEntries(
      Object.entries(couponDistribution).sort(([a], [b]) => a.localeCompare(b)),
    );

    let validNotSelectedDenom = 0;
    let validNotSelectedNum = 0;
    let staleDenom = 0;
    let staleNum = 0;
    let giftDenom = 0;
    let giftNum = 0;

    for (const journeyKey of denominatorJourneys) {
      const journeyFacts = factsByJourney.get(journeyKey) ?? [];
      const qualifyingReviews = reviewsFor(journeyFacts).filter(
        (fact) =>
          fact.presentationClass != null &&
          VALID_NOT_SELECTED_CLASSES.has(fact.presentationClass) &&
          strictlyBefore(fact.occurredAt, window.reportAsOf),
      );
      if (qualifyingReviews.length > 0) {
        validNotSelectedDenom += 1;
        if (
          qualifyingReviews.some(
            (review) =>
              hasKindBeforeCutoff(
                journeyFacts,
                "REVIEW_TO_PAYMENT",
                window.reportAsOf,
                review.journeySequence,
              ) ||
              hasKindBeforeCutoff(
                journeyFacts,
                "DIRECT_ORDER_COMPLETION",
                window.reportAsOf,
                review.journeySequence,
              ),
          )
        ) {
          validNotSelectedNum += 1;
        }
      }

      const changeFacts = journeyFacts.filter(
        (fact) =>
          fact.factKind === "COMMERCIAL_STATE_CHANGE" &&
          strictlyBefore(fact.occurredAt, window.reportAsOf),
      );
      const staleFacts = changeFacts.filter((fact) =>
        origins.some(
          (origin) =>
            origin.originKind === "STALE_RECOVERY" &&
            origin.resolvedChangeFactId === fact.factId,
        ),
      );
      const giftFacts = staleFacts.filter((fact) => {
        const evaluation = fact.evaluationId
          ? evaluationById.get(fact.evaluationId)
          : undefined;
        return evaluation?.explanationReasonClass === "COMPLIMENTARY_ITEM_UNAVAILABLE";
      });
      const changedTotalFacts = staleFacts.filter((fact) => {
        const evaluation = fact.evaluationId
          ? evaluationById.get(fact.evaluationId)
          : undefined;
        return (
          evaluation?.explanationReasonClass !== "COMPLIMENTARY_ITEM_UNAVAILABLE"
        );
      });

      const laterContinuation = (after: bigint) =>
        hasKindBeforeCutoff(
          journeyFacts,
          "REVIEW_TO_PAYMENT",
          window.reportAsOf,
          after,
        ) ||
        hasKindBeforeCutoff(
          journeyFacts,
          "DIRECT_ORDER_COMPLETION",
          window.reportAsOf,
          after,
        );

      if (changedTotalFacts.length > 0) {
        staleDenom += 1;
        const earliest = changedTotalFacts[0]!;
        if (laterContinuation(earliest.journeySequence)) staleNum += 1;
      }
      if (giftFacts.length > 0) {
        giftDenom += 1;
        const earliest = giftFacts[0]!;
        if (laterContinuation(earliest.journeySequence)) giftNum += 1;
      }
    }

    const observations = await tx.db
      .select()
      .from(commercialPresentationObservationsTable);
    const observationKey = (evaluationId: string, surface: string) =>
      `${evaluationId}:${surface}`;
    const observationByKey = new Map(
      observations.map((row) => [observationKey(row.evaluationId, row.surface), row]),
    );
    const integrity: Record<
      "CART" | "CHECKOUT_REVIEW",
      { denominator: number; numerator: number; unobserved: number }
    > = {
      CART: { denominator: 0, numerator: 0, unobserved: 0 },
      CHECKOUT_REVIEW: { denominator: 0, numerator: 0, unobserved: 0 },
    };
    const recordIntegrity = (
      surface: "CART" | "CHECKOUT_REVIEW",
      observed:
        | (typeof observations)[number]
        | undefined,
    ): void => {
      // Evaluation membership is window-qualified. The locked integrity
      // grain tests the observation only against REPORT_AS_OF, so a later
      // maturation snapshot can include an observation that arrived after
      // window_end but still before the later cutoff.
      if (!observed || !strictlyBefore(observed.occurredAt, window.reportAsOf)) {
        integrity[surface].unobserved += 1;
        return;
      }
      integrity[surface].denominator += 1;
      if (observed.serverPresentationMatch === true) {
        integrity[surface].numerator += 1;
      }
    };
    for (const evaluation of evaluations
      .slice()
      .sort((a, b) => a.evaluationId.localeCompare(b.evaluationId))) {
      if (!includedOccurrence(evaluation.occurredAt, window)) continue;
      for (const surface of requiredSurfaces(evaluation.surfaceScope)) {
        recordIntegrity(
          surface,
          observationByKey.get(
            observationKey(evaluation.evaluationId, surface),
          ),
        );
      }
      if (evaluation.surfaceScope !== "CHECKOUT") continue;
      const cartObserved = observationByKey.get(
        observationKey(evaluation.evaluationId, "CART"),
      );
      if (
        cartObserved &&
        strictlyBefore(cartObserved.occurredAt, window.reportAsOf)
      ) {
        recordIntegrity("CART", cartObserved);
      }
    }

    const views = await tx.db.select().from(offerResultViewsTable);
    const offerResultViewCount = views.filter((row) =>
      includedOccurrence(row.occurredAt, window),
    ).length;

    const segments = [...segmentAcc.values()].sort((a, b) => {
      const classCmp = a.presentationClass.localeCompare(b.presentationClass);
      if (classCmp !== 0) return classCmp;
      return (a.subsegment ?? "").localeCompare(b.subsegment ?? "");
    });

    const report: MeasurementReport = {
      metric: PRIMARY_METRIC,
      windowStart: window.windowStart,
      windowEnd: window.windowEnd,
      reportAsOf: window.reportAsOf,
      snapshotInserted: true,
      primary: rateResult(numeratorJourneys.size, denominatorJourneys.length),
      segments,
      cartToCheckoutReview: rateResult(cartNum, cartDenom),
      reviewToPayment: rateResult(reviewToPaymentNum, denominatorJourneys.length),
      paymentCompletionAfterRevalidation: rateResult(
        revalidationNum,
        revalidationJourneys.size,
      ),
      couponOutcomeDistribution,
      validNotSelectedContinuation: rateResult(
        validNotSelectedNum,
        validNotSelectedDenom,
      ),
      changedTotalRecoveryContinuation: rateResult(staleNum, staleDenom),
      complimentaryUnavailableContinuation: rateResult(giftNum, giftDenom),
      repeatedInvalidAttempts,
      supportContacts: { status: "UNAVAILABLE" },
      displayedSavingsIntegrity: [
        {
          surface: "CART",
          ...integrity.CART,
        },
        {
          surface: "CHECKOUT_REVIEW",
          ...integrity.CHECKOUT_REVIEW,
        },
      ],
      offerResultViewCount,
    };
    assertPrivacy(report);
    const publishedReport = toPublishedAggregate(report);
    walkPrivacy(publishedReport);
        const inserted = await tx.db
          .insert(measurementReportSnapshotsTable)
          .values({
            metric: PRIMARY_METRIC,
            windowStart: window.windowStart,
            windowEnd: window.windowEnd,
            reportAsOf: window.reportAsOf,
            publishedReport,
          })
          .onConflictDoNothing()
          .returning();
        if (inserted[0]?.publishedReport != null) {
          return {
            kind: "done" as const,
            report: reportFromPublishedRow({
              metric: inserted[0].metric,
              windowStart: inserted[0].windowStart,
              windowEnd: inserted[0].windowEnd,
              reportAsOf: inserted[0].reportAsOf,
              publishedReport: inserted[0].publishedReport,
              snapshotInserted: true,
            }),
          };
        }
        return { kind: "conflict" as const };
      });
      if (outcome.kind === "done") return outcome.report;
      const recovered = await persistence.transaction(async (tx) => {
        return lookupPublication(tx, window);
      });
      if (recovered?.publishedReport != null) {
        return reportFromPublishedRow({
          metric: recovered.metric,
          windowStart: recovered.windowStart,
          windowEnd: recovered.windowEnd,
          reportAsOf: recovered.reportAsOf,
          publishedReport: recovered.publishedReport,
          snapshotInserted: false,
        });
      }
      throw new Error("measurement_report_snapshots lookup failed after insert.");
    } catch (error) {
      lastError = error;
      if (!isRetryablePublicationIsolation(error) || attempt + 1 >= maxAttempts) {
        const recovered = await persistence
          .transaction(async (tx) => lookupPublication(tx, window))
          .catch(() => undefined);
        if (recovered?.publishedReport != null) {
          return reportFromPublishedRow({
            metric: recovered.metric,
            windowStart: recovered.windowStart,
            windowEnd: recovered.windowEnd,
            reportAsOf: recovered.reportAsOf,
            publishedReport: recovered.publishedReport,
            snapshotInserted: false,
          });
        }
        throw error;
      }
    }
  }
  throw lastError;
}
