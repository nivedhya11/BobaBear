<!-- governance-meta
{
  "status": "CURRENT",
  "authority": "EXPERIENCE_DEBT_REGISTER",
  "version": "EDR-1",
  "auditStatus": "NOT_PERFORMED",
  "lastReviewed": "2026-09-28"
}
-->

# Experience Debt Register

This register holds findings from
`PRE_GTM_CUSTOMER_EXPERIENCE_PRODUCT_LANGUAGE_AND_INSTRUMENTATION_AUDIT`.

The audit is required before public GTM / IMP-040 acceptance. It has not been performed. This
document does not reopen historically accepted capabilities and does not authorize implementation.

```text
PRE_GTM_CUSTOMER_EXPERIENCE_PRODUCT_LANGUAGE_AND_INSTRUMENTATION_AUDIT = NOT_PERFORMED
HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
FINDINGS = NONE
```

When the audit is performed, each finding records:

| Field | Required content |
|---|---|
| Severity | How serious the experience, language, trust, or measurement gap is |
| Journey | The customer or operator journey affected |
| Problem | What is wrong or missing |
| Evidence | What was observed, and its evidence class under EXP-1 |
| Impact | Effect on comprehension, conversion, trust, operations, or measurement |
| Recommended change | Proposed correction; not implementation authorization |
| Priority | Order relative to other findings |
| Disposition | `OPEN`, `ACCEPTED_FOLLOW_UP`, `NOT_SUPPORTED_BY_DESIGN`, or `RESOLVED` with evidence |

Audit scope is defined in [`EXPERIENCE.md`](./EXPERIENCE.md).
