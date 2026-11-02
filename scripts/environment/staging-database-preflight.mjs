/**
 * Non-mutating staging database evidence shapes.
 *
 * These helpers do not open a connection. Live preflight must not point them
 * at the persistent Founder database. Ledger labels stay UNKNOWN until the
 * Founder names the mapping from hash comparison to APPLIED_CURRENT / LEDGER_CURRENT.
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
 * Comparison counts are diagnostic. They do not authorize a known-safe ledger label.
 * @param {{
 *   appliedCount?: number,
 *   journalCount?: number,
 *   appliedNotInJournalCount?: number,
 *   journalNotAppliedCount?: number,
 * }} counts
 */
export function interpretMigrationLedgerComparison(counts) {
  const appliedNotInJournalCount = counts.appliedNotInJournalCount;
  const unexplained =
    typeof appliedNotInJournalCount === "number" && appliedNotInJournalCount > 0
      ? true
      : typeof appliedNotInJournalCount === "number" && appliedNotInJournalCount === 0
        ? false
        : null;
  return {
    migrationIdentityKnown: false,
    migrationLedgerState: "UNKNOWN",
    baselineCompatibility: "UNKNOWN",
    unexplainedPendingMutation: unexplained,
    appliedCount: counts.appliedCount ?? null,
    journalCount: counts.journalCount ?? null,
    journalNotAppliedCount: counts.journalNotAppliedCount ?? null,
    ledgerLabelReason: "LEDGER_STATE_MAPPING_UNDECIDED",
  };
}

export const READ_ONLY_TRANSACTION_PREAMBLE = Object.freeze([
  "BEGIN TRANSACTION READ ONLY",
  "SET LOCAL statement_timeout = '5s'",
]);
