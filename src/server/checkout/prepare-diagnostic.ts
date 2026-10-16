/**
 * Privacy-safe CHECKOUT_REPRICED prepare diagnostic (IMP-036J #391B).
 *
 * Temporary observer contract only. Never captures money, PII, IDs (except
 * server requestId at the logging boundary), coupons, or raw snapshots.
 */

import type { CheckoutSnapshot } from "../../shared/checkout";
import {
  CHECKOUT_SNAPSHOT_STRUCTURAL_DIFFERENCE_CATEGORIES,
  explainCheckoutSnapshotStructuralDifference,
  type CheckoutSnapshotStructuralDifferenceCategory,
} from "./explain-snapshot-difference";

/** Rejection stages verified against prepareCheckoutForPayment paths. */
export const CHECKOUT_PREPARE_REJECTION_STAGES = Object.freeze([
  "CART_REVISION",
  "DELIVERY_SERVICEABILITY",
  "PICKUP_ELIGIBILITY",
  "MERCHANDISE_AVAILABILITY",
  "SCHEDULED_ELIGIBILITY",
  "SCHEDULED_TERMS",
  "STRUCTURAL",
  "UNKNOWN",
] as const);

export type CheckoutPrepareRejectionStage =
  (typeof CHECKOUT_PREPARE_REJECTION_STAGES)[number];

export const CHECKOUT_PREPARE_DIAGNOSTIC_OPERATION =
  "checkout_prepare_diagnostic" as const;

export const CHECKOUT_PREPARE_DIAGNOSTIC_SAFE_OUTCOME =
  "CHECKOUT_REPRICED" as const;

/** Positive property allowlist for the diagnostic log event. */
export const CHECKOUT_PREPARE_DIAGNOSTIC_LOG_FIELDS = Object.freeze([
  "requestId",
  "operation",
  "safeOutcomeCode",
  "rejectionStage",
  "firstDifferenceCategory",
  "payableChanged",
] as const);

export type CheckoutPrepareDiagnosticObservation = Readonly<{
  rejectionStage: CheckoutPrepareRejectionStage;
  firstDifferenceCategory: CheckoutSnapshotStructuralDifferenceCategory | null;
  payableChanged: boolean | null;
}>;

export type CheckoutPrepareDiagnosticObserver = (
  observation: CheckoutPrepareDiagnosticObservation,
) => void | Promise<void>;

export type CheckoutPrepareDiagnosticEvent = Readonly<{
  requestId: string;
  operation: typeof CHECKOUT_PREPARE_DIAGNOSTIC_OPERATION;
  safeOutcomeCode: typeof CHECKOUT_PREPARE_DIAGNOSTIC_SAFE_OUTCOME;
  rejectionStage: CheckoutPrepareRejectionStage;
  firstDifferenceCategory: CheckoutSnapshotStructuralDifferenceCategory | null;
  payableChanged: boolean | null;
}>;

const REJECTION_STAGE_SET = new Set<string>(CHECKOUT_PREPARE_REJECTION_STAGES);
const CATEGORY_SET = new Set<string>(
  CHECKOUT_SNAPSHOT_STRUCTURAL_DIFFERENCE_CATEGORIES,
);

function isRejectionStage(value: unknown): value is CheckoutPrepareRejectionStage {
  return typeof value === "string" && REJECTION_STAGE_SET.has(value);
}

function isCategory(
  value: unknown,
): value is CheckoutSnapshotStructuralDifferenceCategory {
  return typeof value === "string" && CATEGORY_SET.has(value);
}

/**
 * Builds an immutable allowlisted diagnostic event. Unsupported fields are
 * discarded. Invalid enums fail closed to UNKNOWN / null rather than logging
 * raw attacker-controlled strings.
 */
export function buildCheckoutPrepareDiagnosticEvent(input: {
  requestId: string;
  observation: CheckoutPrepareDiagnosticObservation;
}): CheckoutPrepareDiagnosticEvent {
  const requestId =
    typeof input.requestId === "string" && input.requestId.length > 0
      ? input.requestId
      : "unknown";
  const rejectionStage = isRejectionStage(input.observation.rejectionStage)
    ? input.observation.rejectionStage
    : "UNKNOWN";
  const firstDifferenceCategory =
    rejectionStage === "STRUCTURAL" &&
    isCategory(input.observation.firstDifferenceCategory)
      ? input.observation.firstDifferenceCategory
      : null;
  const payableChanged =
    rejectionStage === "STRUCTURAL" &&
    typeof input.observation.payableChanged === "boolean"
      ? input.observation.payableChanged
      : null;

  return Object.freeze({
    requestId,
    operation: CHECKOUT_PREPARE_DIAGNOSTIC_OPERATION,
    safeOutcomeCode: CHECKOUT_PREPARE_DIAGNOSTIC_SAFE_OUTCOME,
    rejectionStage,
    firstDifferenceCategory,
    payableChanged,
  });
}

/**
 * Classifies a STRUCTURAL mismatch using the exact normalized snapshots already
 * supplied to checkoutSnapshotsStructurallyEqual. Never logs amounts.
 */
export function observeStructuralCheckoutPrepareMismatch(input: {
  sealedComparable: CheckoutSnapshot;
  candidateComparable: CheckoutSnapshot;
}): CheckoutPrepareDiagnosticObservation {
  const explanation = explainCheckoutSnapshotStructuralDifference(
    input.sealedComparable,
    input.candidateComparable,
  );
  return Object.freeze({
    rejectionStage: "STRUCTURAL" as const,
    firstDifferenceCategory: explanation.firstDifferenceCategory,
    payableChanged:
      input.sealedComparable.grandTotalPaise !==
      input.candidateComparable.grandTotalPaise,
  });
}

export function observeNonStructuralCheckoutPrepareRejection(
  rejectionStage: Exclude<CheckoutPrepareRejectionStage, "STRUCTURAL">,
): CheckoutPrepareDiagnosticObservation {
  return Object.freeze({
    rejectionStage,
    firstDifferenceCategory: null,
    payableChanged: null,
  });
}

/**
 * Invokes the optional observer; never throws into the business path.
 */
export async function safeNotifyCheckoutPrepareDiagnostic(
  observer: CheckoutPrepareDiagnosticObserver | undefined,
  observation: CheckoutPrepareDiagnosticObservation,
): Promise<void> {
  if (!observer) return;
  try {
    await observer(observation);
  } catch {
    // Diagnostic failures must not alter payment/checkout outcomes.
  }
}
