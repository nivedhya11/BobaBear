# Testing evidence index

```text
STATUS: SUPPORTING ENGINEERING EVIDENCE
Authority: docs/platform/TESTING.md (TEST-1)
```

## Purpose

Supporting inventory and historical verification evidence. Current execution and acceptance
are owned by [`../ROADMAP.md`](../ROADMAP.md) and [`../STATE.md`](../STATE.md).

## Reading rule

1. Read [`../TESTING.md`](../TESTING.md) first for verification **policy**.
2. Read [`../ROADMAP.md`](../ROADMAP.md) and [`../STATE.md`](../STATE.md) for current activation,
   execution, and acceptance. Do not read those facts out of the historical evidence files below.
3. Use [`test-inventory.json`](./test-inventory.json) for the machine-readable structural inventory
   (regenerate or check it with the package scripts below).
4. Read [`BASELINE.md`](./BASELINE.md) and [`CI-READINESS.md`](./CI-READINESS.md) as historical,
   dated evidence. Their lifecycle values and observed results describe the session that wrote
   them. They are not current execution truth, and this index does not rewrite those results.
5. Read [`CI-GAP-ANALYSIS.md`](./CI-GAP-ANALYSIS.md) and [`CI-JOB-CONTRACT.md`](./CI-JOB-CONTRACT.md)
   as historical Session 3 planning and implementation notes. They do not authorize workflow edits
   and they are not current lifecycle authority.
6. Read [`EVIDENCE-RETENTION.md`](./EVIDENCE-RETENTION.md) for repository-weight and
   evidence-retention rules (HYG-05). It does not authorize deletion of protected or migration
   evidence.

## Explicit non-authority

These files do not accept a slice, change ROADMAP or STATE, replace a Product Definition, or
upgrade Golden Journey registry status. A test file is not acceptance evidence. Whether a slice
is activated is read from ROADMAP and STATE.

## Commands

```text
npm run testing:inventory        # regenerate test-inventory.json
npm run testing:inventory:check  # fail on deterministic snapshot drift
node --test scripts/testing-inventory.test.mjs
```

Canonical policy remains TEST-1. This directory is supporting engineering evidence only.
