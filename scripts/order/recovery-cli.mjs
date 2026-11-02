/**
 * Operator cursor and summary helpers for order:recover-missing.
 *
 * The domain cursor stays the composite nextCursor object
 * ({ lastCheckoutUpdatedAt, lastCheckoutId }). This module only encodes that
 * object as JSON for the operator and parses it back before recovery runs.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_CURSOR_TEXT_LENGTH = 1024;

export const ORDER_RECOVERY_CLI_ERROR = "order:recover-missing failed.";

export const ORDER_RECOVERY_CURSOR_MESSAGES = Object.freeze({
  MALFORMED: "order recovery cursor is malformed.",
  MUST_BE_OBJECT: "order recovery cursor must be an object.",
  MISSING_TIMESTAMP: "order recovery cursor is missing lastCheckoutUpdatedAt.",
  INVALID_TIMESTAMP: "order recovery cursor lastCheckoutUpdatedAt is invalid.",
  MISSING_CHECKOUT_ID: "order recovery cursor is missing lastCheckoutId.",
  INVALID_CHECKOUT_ID: "order recovery cursor lastCheckoutId is invalid.",
  UNEXPECTED_FIELD: "order recovery cursor contains an unexpected field.",
});

const SAFE_CURSOR_MESSAGES = new Set(Object.values(ORDER_RECOVERY_CURSOR_MESSAGES));

const CURSOR_KEYS = Object.freeze(["lastCheckoutUpdatedAt", "lastCheckoutId"]);

export class OrderRecoveryCliError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "OrderRecoveryCliError";
  }
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {string} message
 * @returns {never}
 */
function rejectCursor(message) {
  throw new OrderRecoveryCliError(message);
}

/**
 * @param {unknown} value
 * @returns {Date}
 */
function requireCursorTimestamp(value) {
  if (value === undefined) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MISSING_TIMESTAMP);
  }
  if (typeof value !== "string" || value.trim().length === 0) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.INVALID_TIMESTAMP);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.INVALID_TIMESTAMP);
  }
  return parsed;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function requireCursorCheckoutId(value) {
  if (value === undefined) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MISSING_CHECKOUT_ID);
  }
  if (typeof value !== "string" || !UUID_RE.test(value)) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.INVALID_CHECKOUT_ID);
  }
  return value.toLowerCase();
}

/**
 * Parse the JSON form of the domain nextCursor object.
 * @param {string} text
 * @returns {Readonly<{ lastCheckoutUpdatedAt: Date, lastCheckoutId: string }>}
 */
export function parseOrderRecoveryCursorText(text) {
  if (typeof text !== "string" || text.length === 0 || text.length > MAX_CURSOR_TEXT_LENGTH) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MALFORMED);
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MALFORMED);
  }
  if (UUID_RE.test(trimmed)) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MUST_BE_OBJECT);
  }

  /** @type {unknown} */
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MALFORMED);
  }

  if (typeof parsed === "string" && UUID_RE.test(parsed)) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MUST_BE_OBJECT);
  }
  if (!isPlainObject(parsed)) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MUST_BE_OBJECT);
  }

  for (const key of Object.keys(parsed)) {
    if (!CURSOR_KEYS.includes(key)) {
      rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.UNEXPECTED_FIELD);
    }
  }

  return Object.freeze({
    lastCheckoutUpdatedAt: requireCursorTimestamp(parsed.lastCheckoutUpdatedAt),
    lastCheckoutId: requireCursorCheckoutId(parsed.lastCheckoutId),
  });
}

/**
 * @param {Readonly<{ lastCheckoutUpdatedAt: Date, lastCheckoutId: string }>} cursor
 * @returns {string}
 */
export function serializeOrderRecoveryCursor(cursor) {
  if (!isPlainObject(cursor)) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MUST_BE_OBJECT);
  }
  const lastCheckoutUpdatedAt = cursor.lastCheckoutUpdatedAt;
  if (!(lastCheckoutUpdatedAt instanceof Date) || Number.isNaN(lastCheckoutUpdatedAt.getTime())) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.INVALID_TIMESTAMP);
  }
  const lastCheckoutId = requireCursorCheckoutId(cursor.lastCheckoutId);
  return JSON.stringify({
    lastCheckoutUpdatedAt: lastCheckoutUpdatedAt.toISOString(),
    lastCheckoutId,
  });
}

/**
 * @param {readonly string[]} argv
 * @returns {Readonly<{ cursor?: Readonly<{ lastCheckoutUpdatedAt: Date, lastCheckoutId: string }> }>}
 */
export function parseOrderRecoveryCliArgs(argv) {
  /** @type {string | undefined} */
  let cursorText;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (typeof arg !== "string") {
      rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MALFORMED);
    }
    if (arg.startsWith("--cursor=")) {
      cursorText = arg.slice("--cursor=".length);
      continue;
    }
    if (arg === "--cursor") {
      const next = argv[i + 1];
      if (typeof next !== "string" || next.startsWith("--")) {
        rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.MALFORMED);
      }
      cursorText = next;
      i += 1;
    }
  }
  if (cursorText === undefined) {
    return Object.freeze({});
  }
  return Object.freeze({ cursor: parseOrderRecoveryCursorText(cursorText) });
}

/**
 * @param {unknown} error
 * @returns {string}
 */
export function safeOrderRecoveryCliErrorMessage(error) {
  if (error instanceof OrderRecoveryCliError && SAFE_CURSOR_MESSAGES.has(error.message)) {
    return error.message;
  }
  if (!(error instanceof Error) || error.message.length === 0) {
    return ORDER_RECOVERY_CLI_ERROR;
  }
  if (/password|secret|postgresql:\/\//i.test(error.message) || /\n\s+at\s+/.test(error.message)) {
    return ORDER_RECOVERY_CLI_ERROR;
  }
  return error.message;
}

/**
 * @param {Readonly<{
 *   results: readonly Readonly<{
 *     checkoutId: string,
 *     disposition: string,
 *     orderId?: string,
 *     orderNumber?: string,
 *   }>[],
 *   nextCursor: Readonly<{ lastCheckoutUpdatedAt: Date, lastCheckoutId: string }> | null,
 * }>} batch
 */
export function formatOrderRecoveryOperatorSummary(batch) {
  const results = Array.isArray(batch?.results) ? batch.results : [];
  const created = results.filter((item) => item.disposition === "CREATED");
  const alreadyExists = results.filter((item) => item.disposition === "ALREADY_EXISTS");
  const anomaly = results.filter((item) => item.disposition === "ANOMALY");
  const retryableFailure = results.filter((item) => item.disposition === "RETRYABLE_FAILURE");
  const nextCursor = batch?.nextCursor ?? null;

  return {
    ok: true,
    operation: "recover_missing_orders_batch",
    scanned: results.length,
    created: created.length,
    alreadyExists: alreadyExists.length,
    anomaly: anomaly.length,
    retryableFailure: retryableFailure.length,
    nextCursor:
      nextCursor === null
        ? null
        : {
            lastCheckoutUpdatedAt: serializeCursorTimestamp(nextCursor.lastCheckoutUpdatedAt),
            lastCheckoutId: nextCursor.lastCheckoutId,
          },
    createdOrders: created.map((item) => ({
      checkoutId: item.checkoutId,
      orderId: item.orderId,
      orderNumber: item.orderNumber,
    })),
    anomalyCheckouts: anomaly.map((item) => item.checkoutId),
    retryableFailureCheckouts: retryableFailure.map((item) => item.checkoutId),
  };
}

/**
 * @param {Date} value
 * @returns {string}
 */
function serializeCursorTimestamp(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    rejectCursor(ORDER_RECOVERY_CURSOR_MESSAGES.INVALID_TIMESTAMP);
  }
  return value.toISOString();
}
