import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CUSTOMER_AUTH_ACCOUNTS_TABLE,
  WORKFORCE_AUTH_ACCOUNTS_TABLE,
  duplicateGroupCountSql,
  interpretDuplicateGroupCount,
  interpretMigrationLedgerComparison,
} from "./staging-database-preflight.mjs";

test("duplicate-group SQL returns one count and no identifier columns", () => {
  for (const table of [CUSTOMER_AUTH_ACCOUNTS_TABLE, WORKFORCE_AUTH_ACCOUNTS_TABLE]) {
    const sql = duplicateGroupCountSql(table);
    assert.match(sql, /^SELECT COUNT\(\*\)::int AS duplicate_group_count/);
    assert.match(sql, /GROUP BY provider_id, account_id/);
    assert.doesNotMatch(sql, /password|access_token|refresh_token/);
  }
  assert.throws(() => duplicateGroupCountSql("app.other"), /unsupported/);
});

test("duplicate-group interpretation keeps only the count", () => {
  assert.deepEqual(interpretDuplicateGroupCount({ duplicate_group_count: 2 }), {
    known: true,
    duplicateGroupCount: 2,
  });
  assert.deepEqual(interpretDuplicateGroupCount({ duplicate_group_count: 0, account_id: "hidden" }), {
    known: true,
    duplicateGroupCount: 0,
  });
  assert.equal(interpretDuplicateGroupCount({ duplicate_group_count: "2" }).known, false);
});

test("ledger comparison never invents a known-safe label", () => {
  const matched = interpretMigrationLedgerComparison({
    appliedCount: 3,
    journalCount: 3,
    appliedNotInJournalCount: 0,
    journalNotAppliedCount: 0,
  });
  assert.equal(matched.migrationIdentityKnown, false);
  assert.equal(matched.migrationLedgerState, "UNKNOWN");
  assert.equal(matched.unexplainedPendingMutation, false);
  assert.equal(matched.ledgerLabelReason, "LEDGER_STATE_MAPPING_UNDECIDED");

  const extra = interpretMigrationLedgerComparison({ appliedNotInJournalCount: 1 });
  assert.equal(extra.unexplainedPendingMutation, true);
  assert.equal(extra.migrationLedgerState, "UNKNOWN");
});

test("selected exact-set mapping labels equal non-empty ledgers and empty baselines", () => {
  const policy = {
    status: "SELECTED",
    mode: "EXACT_JOURNAL_APPLIED_SET_EQUALITY",
    mapping: {
      equalNonEmptyLabel: "LEDGER_CURRENT",
      equalNonEmptySynonym: "APPLIED_CURRENT",
      emptyLabel: "FRESH_EMPTY_BASELINE",
    },
  };
  const current = interpretMigrationLedgerComparison(
    {
      appliedCount: 50,
      journalCount: 50,
      appliedNotInJournalCount: 0,
      journalNotAppliedCount: 0,
    },
    policy,
  );
  assert.equal(current.migrationIdentityKnown, true);
  assert.equal(current.migrationLedgerState, "LEDGER_CURRENT");
  assert.equal(current.baselineCompatibility, "COMPLETE_COMPATIBLE");

  const empty = interpretMigrationLedgerComparison(
    {
      appliedCount: 0,
      journalCount: 0,
      appliedNotInJournalCount: 0,
      journalNotAppliedCount: 0,
    },
    policy,
  );
  assert.equal(empty.baselineCompatibility, "FRESH_EMPTY");
  assert.equal(empty.migrationLedgerState, "UNKNOWN");
  assert.equal(empty.ledgerLabelReason, "FRESH_EMPTY_BASELINE");

  const drift = interpretMigrationLedgerComparison(
    {
      appliedCount: 2,
      journalCount: 3,
      appliedNotInJournalCount: 0,
      journalNotAppliedCount: 1,
    },
    policy,
  );
  assert.equal(drift.baselineCompatibility, "PARTIAL_OR_INCOMPATIBLE");
  assert.equal(drift.migrationLedgerState, "UNKNOWN");
});
