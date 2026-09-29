# Architecture lock handoff

Non-authoritative. Lifecycle truth stays in ROADMAP / STATE.

```text
slice:
lifecycle_expected: ARCHITECTURE_LOCKED
head:
tree:
governance_fingerprint:
working_tree_fingerprint:
capability_architecture:
architecture_version:
decision_register_version:
fit_review_id:
product_definition_gate:
experience_gate:
exceptions:
- NONE, or id + why it does not change lock semantics
evidence:
- independent review:
- ci:
- codeql:
stop_if:
- candidate identity mismatch
- canonical conflict
- fit review missing or not PASS
not_this_handoff: design readiness, implementation authorization, acceptance
```
