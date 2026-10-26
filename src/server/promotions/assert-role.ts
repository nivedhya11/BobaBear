import { isTransactionContext } from "../persistence/context-kind";
import type {
  PersistenceQueryContext,
  PersistenceTransactionContext,
} from "../persistence/types";
import { PromotionValidationError } from "./errors";

export function assertApplicationRole(
  context: { readonly role: string },
  operation: string,
): void {
  if (context.role !== "application") {
    throw new PromotionValidationError(
      `${operation} requires an application-role persistence context, got role "${context.role}".`,
    );
  }
}

export function assertTransactionContext(
  context: PersistenceQueryContext,
  operation: string,
): asserts context is PersistenceTransactionContext {
  assertApplicationRole(context, operation);
  if (!isTransactionContext(context)) {
    throw new PromotionValidationError(
      `${operation} requires a transaction context from Persistence.transaction().`,
    );
  }
}

export function assertUuid(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new PromotionValidationError(`${field} must be a non-empty string.`);
  }
  return value;
}

/**
 * Stored promotion code rule from `promotions_code_format_check`:
 * `^[a-z0-9][a-z0-9_-]*$`, length 1–64. The check does not trim or case-fold,
 * so this rejects rather than rewriting the caller value.
 */
const PROMOTION_CODE_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

export function assertPromotionCode(code: string): string {
  if (
    typeof code !== "string" ||
    code.length < 1 ||
    code.length > 64 ||
    !PROMOTION_CODE_PATTERN.test(code)
  ) {
    throw new PromotionValidationError(
      "code must match ^[a-z0-9][a-z0-9_-]*$ and be 1-64 characters.",
    );
  }
  return code;
}

/** Hyphenated UUID shape for promotion scope columns. Existence is not decided here. */
const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertUuidShape(value: string, field: string): string {
  if (typeof value !== "string" || !UUID_SHAPE.test(value)) {
    throw new PromotionValidationError(`${field} must be a UUID.`);
  }
  return value;
}

export function driverCode(error: unknown): unknown {
  if (typeof error !== "object" || error === null) return undefined;
  const code = (error as { code?: unknown }).code;
  if (code !== undefined) return code;
  const cause = (error as { cause?: unknown }).cause;
  return typeof cause === "object" && cause !== null
    ? (cause as { code?: unknown }).code
    : undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  return driverCode(error) === "23505";
}

export function uniqueConstraintName(error: unknown): string | undefined {
  let current: unknown = error;
  const seen = new Set<unknown>();
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const rec = current as { constraint?: unknown; cause?: unknown };
    if (typeof rec.constraint === "string" && rec.constraint.length > 0) {
      return rec.constraint;
    }
    current = rec.cause;
  }
  return undefined;
}
