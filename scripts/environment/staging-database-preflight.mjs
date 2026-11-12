/**
 * Non-mutating staging database evidence shapes.
 *
 * These helpers do not open a connection. Live preflight must not point them
 * at the persistent Founder database unless an authorized read-only probe is
 * explicitly invoked. Ledger labels stay UNKNOWN until a Founder-selected
 * mapping is supplied to interpretMigrationLedgerComparison.
 */

export const CUSTOMER_AUTH_ACCOUNTS_TABLE = "app.customer_auth_accounts";
export const WORKFORCE_AUTH_ACCOUNTS_TABLE = "app.workforce_auth_accounts";

const ALLOWED_TABLES = new Set([CUSTOMER_AUTH_ACCOUNTS_TABLE, WORKFORCE_AUTH_ACCOUNTS_TABLE]);

/**
 * Aggregate duplicate-group count only. The statement selects no account identifiers.
 * @param {string} table
 */
export function duplicateGroupCountSql(table) {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error("unsupported auth account table");
  }
  return [
    "SELECT COUNT(*)::int AS duplicate_group_count",
    "FROM (",
    "  SELECT 1",
    `  FROM ${table}`,
    "  GROUP BY provider_id, account_id",
    "  HAVING COUNT(*) > 1",
    ") AS duplicate_groups",
  ].join("\n");
}

/**
 * @param {unknown} row
 */
export function interpretDuplicateGroupCount(row) {
  if (row == null || typeof row !== "object") {
    return { known: false, duplicateGroupCount: null };
  }
  const value = /** @type {{ duplicate_group_count?: unknown }} */ (row).duplicate_group_count;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return { known: false, duplicateGroupCount: null };
  }
  return { known: true, duplicateGroupCount: value };
}

/**
 * Comparison counts are diagnostic by default. A Founder-selected mapping may
 * authorize known-safe labels; without it, labels remain UNKNOWN.
 *
 * Selected mapping mode EXACT_JOURNAL_APPLIED_SET_EQUALITY:
 * - appliedNotInJournal=0 AND journalNotApplied=0 AND appliedCount=journalCount=0
 *   → migrationIdentityKnown true, migrationLedgerState "UNKNOWN",
 *     baselineCompatibility "FRESH_EMPTY", ledgerLabelReason FRESH_EMPTY_BASELINE
 * - same equality with appliedCount=journalCount>0
 *   → LEDGER_CURRENT (APPLIED_CURRENT accepted as synonym by callers)
 *
 * @param {{
 *   appliedCount?: number,
 *   journalCount?: number,
 *   appliedNotInJournalCount?: number,
 *   journalNotAppliedCount?: number,
 * }} counts
 * @param {{
 *   status?: string,
 *   mode?: string | null,
 *   mapping?: {
 *     equalNonEmptyLabel?: string,
 *     equalNonEmptySynonym?: string,
 *     emptyLabel?: string,
 *   } | null,
 * } | null} [ledgerMappingPolicy]
 */
export function interpretMigrationLedgerComparison(counts, ledgerMappingPolicy = null) {
  const appliedNotInJournalCount = counts.appliedNotInJournalCount;
  const journalNotAppliedCount = counts.journalNotAppliedCount;
  const appliedCount = counts.appliedCount;
  const journalCount = counts.journalCount;

  const unexplained =
    typeof appliedNotInJournalCount === "number" && appliedNotInJournalCount > 0
      ? true
      : typeof appliedNotInJournalCount === "number" && appliedNotInJournalCount === 0
        ? false
        : null;

  const base = {
    migrationIdentityKnown: false,
    migrationLedgerState: "UNKNOWN",
    baselineCompatibility: "UNKNOWN",
    unexplainedPendingMutation: unexplained,
    appliedCount: appliedCount ?? null,
    journalCount: journalCount ?? null,
    journalNotAppliedCount: journalNotAppliedCount ?? null,
    ledgerLabelReason: "LEDGER_STATE_MAPPING_UNDECIDED",
  };

  if (ledgerMappingPolicy?.status !== "SELECTED" || ledgerMappingPolicy.mode !== "EXACT_JOURNAL_APPLIED_SET_EQUALITY") {
    return base;
  }

  const countsComplete = [appliedCount, journalCount, appliedNotInJournalCount, journalNotAppliedCount].every(
    (value) => typeof value === "number" && Number.isInteger(value) && value >= 0,
  );
  if (!countsComplete) {
    return {
      ...base,
      ledgerLabelReason: "LEDGER_COUNTS_INCOMPLETE",
    };
  }

  if (appliedNotInJournalCount !== 0 || journalNotAppliedCount !== 0 || appliedCount !== journalCount) {
    return {
      ...base,
      migrationIdentityKnown: true,
      unexplainedPendingMutation: true,
      ledgerLabelReason: "LEDGER_SETS_NOT_EQUAL",
      baselineCompatibility: "PARTIAL_OR_INCOMPATIBLE",
    };
  }

  if (appliedCount === 0 && journalCount === 0) {
    return {
      ...base,
      migrationIdentityKnown: true,
      unexplainedPendingMutation: false,
      migrationLedgerState: "UNKNOWN",
      baselineCompatibility: "FRESH_EMPTY",
      ledgerLabelReason: ledgerMappingPolicy.mapping?.emptyLabel ?? "FRESH_EMPTY_BASELINE",
    };
  }

  const label = ledgerMappingPolicy.mapping?.equalNonEmptyLabel ?? "LEDGER_CURRENT";
  return {
    ...base,
    migrationIdentityKnown: true,
    unexplainedPendingMutation: false,
    migrationLedgerState: label,
    baselineCompatibility: "COMPLETE_COMPATIBLE",
    ledgerLabelReason: "LEDGER_SETS_EQUAL_CURRENT",
    acceptedSynonym: ledgerMappingPolicy.mapping?.equalNonEmptySynonym ?? "APPLIED_CURRENT",
  };
}

export const READ_ONLY_TRANSACTION_PREAMBLE = Object.freeze([
  "BEGIN TRANSACTION READ ONLY",
  "SET LOCAL statement_timeout = '5s'",
]);
