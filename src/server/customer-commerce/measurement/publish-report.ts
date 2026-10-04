/**
 * IMP-036J Tranche 7 measurement reporting.
 *
 * Publishes selected formulas from already-stored measurement facts.
 * Does not write commercial truth, mint a second analytics model, or
 * expose a reporting route.
 */
import { and, eq } from "drizzle-orm";

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
import type { Persistence } from "../../persistence/types";

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

function expectedSurfaces(
  surfaceScope: string,
): readonly ("CART" | "CHECKOUT_REVIEW")[] {
  return surfaceScope === "CART" ? ["CART"] : ["CART", "CHECKOUT_REVIEW"];
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
): Promise<MeasurementReport> {
  const window = initialMeasurementWindow(input);
  return persistence.transaction(async (tx) => {
    const inserted = await tx.db
      .insert(measurementReportSnapshotsTable)
      .values({
        metric: PRIMARY_METRIC,
        windowStart: window.windowStart,
        windowEnd: window.windowEnd,
        reportAsOf: window.reportAsOf,
      })
      .onConflictDoNothing()
      .returning();
    const existing = inserted[0]
      ? inserted[0]
      : (
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
    if (!existing) {
      throw new Error("measurement_report_snapshots lookup failed after insert.");
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
        const consuming = evaluations
          .filter(
            (row) =>
              row.checkoutJourneyKey === journeyKey &&
              row.cartOriginOrdinalInclusive != null &&
              row.cartOriginOrdinalInclusive >= origin.cartOriginOrdinal &&
              strictlyBefore(row.occurredAt, window.reportAsOf),
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
      const completion = journeyFacts.find(
        (fact) =>
          fact.factKind === "DIRECT_ORDER_COMPLETION" &&
          strictlyBefore(fact.occurredAt, window.reportAsOf),
      );
      const segmentFact = completion
        ? latestReviewBeforeSequence(journeyFacts, completion.journeySequence)
        : latestReviewBeforeCutoff(journeyFacts, window.reportAsOf);
      if (
        segmentFact?.presentationClass &&
        VALID_NOT_SELECTED_CLASSES.has(segmentFact.presentationClass)
      ) {
        validNotSelectedDenom += 1;
        if (
          hasKindBeforeCutoff(
            journeyFacts,
            "REVIEW_TO_PAYMENT",
            window.reportAsOf,
            segmentFact.journeySequence,
          ) ||
          hasKindBeforeCutoff(
            journeyFacts,
            "DIRECT_ORDER_COMPLETION",
            window.reportAsOf,
            segmentFact.journeySequence,
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
    for (const evaluation of evaluations
      .slice()
      .sort((a, b) => a.evaluationId.localeCompare(b.evaluationId))) {
      if (!includedOccurrence(evaluation.occurredAt, window)) continue;
      for (const surface of expectedSurfaces(evaluation.surfaceScope)) {
        const observed = observationByKey.get(
          observationKey(evaluation.evaluationId, surface),
        );
        if (!observed || !includedOccurrence(observed.occurredAt, window)) {
          integrity[surface].unobserved += 1;
          continue;
        }
        integrity[surface].denominator += 1;
        if (observed.serverPresentationMatch === true) {
          integrity[surface].numerator += 1;
        }
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
      windowStart: existing.windowStart,
      windowEnd: existing.windowEnd,
      reportAsOf: existing.reportAsOf,
      snapshotInserted: inserted.length > 0,
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
    return report;
  });
}
