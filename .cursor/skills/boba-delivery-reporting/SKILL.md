---
name: boba-delivery-reporting
description: Supplies BOBA alignment and session-close report templates and the acceptance-evidence checklist. Use before source mutation and at required session close for R1 compact or R2/R3 full reporting.
---

# BOBA delivery reporting

## Authority

This procedure is subordinate to `AGENTS.md`. It is non-authoritative. Canonical authorities named by `AGENTS.md` prevail. On canonical conflict, STOP affected work. Do not reinterpret the conflict.

Alignment remains mandatory before source mutation. A passing alignment gate is not human approval. If alignment fails, STOP. Status vocabulary and the prohibition on self-acceptance remain in `AGENTS.md`. This skill does not grant `COMPLETE_AND_ACCEPTED`.

## Which template

Read [references/templates.md](references/templates.md) before emitting the report.

- Ordinary R1 bounded engineering: compact alignment before mutation, and the compact completion report at session close.
- R2, R3, product-visible delivery, architecture-sensitive work, or material conflict risk: full alignment before mutation, and the full session-close report at close.

Prompt values must be verified against canonical documents rather than repeated from memory. When true, state explicitly: `PROMPT DEVIATIONS: NONE`.

## Acceptance-evidence checklist

These principles govern how evidence is reported. They do not accept the work.

- provenance first
- architecture before tests
- evidence over claims (prefer GitHub/CI artifacts; no silent-retry “passes”)
- negative security evidence where relevant
- real concurrency where race correctness matters
- crash/recovery evidence where relevant
- full regression where justified
- fingerprint / multi-round validation based on risk
- surgical corrections preferred over needless rebuilds

Gates need not be identical for every future slice.

For prospective story delivery, follow `docs/platform/PRODUCT-DELIVERY.md` and `docs/platform/TESTING.md` for readiness, completion, and behavioural evidence. A pre-GTM customer experience, product language, and instrumentation audit is required before public GTM cutover / IMP-040 acceptance. PD-2 expands the Journey Gap Audit requirement. Adoption does not perform the audit or rewrite historical acceptance.

Coding-agent outcomes remain `COMPLETE` | `PARTIAL` | `BLOCKED`. Independent acceptance outcomes remain `COMPLETE_AND_ACCEPTED` | `PARTIAL` | `DEFECT_FOUND` | `ARCHITECTURE_MISMATCH` | `ACCEPTANCE_EVIDENCE_INSUFFICIENT`. Implementation reports are evidence input, not acceptance authority.
