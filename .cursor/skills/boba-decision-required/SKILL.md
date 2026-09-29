---
name: boba-decision-required
description: Reports an unresolved RED or material decision with the DECISION_REQUIRED template. Use when the risk tier is RED or canonical authority cannot resolve a material product, architecture, security, payment, or business decision. Does not grant the decision.
---

# BOBA decision-required reporting

## Authority

This procedure is subordinate to `AGENTS.md`. It is non-authoritative. Canonical authorities named by `AGENTS.md` prevail. On canonical conflict, STOP affected work. Do not reinterpret the conflict.

This skill does not grant decisions. STOP, RED, and no-invention boundaries remain in `AGENTS.md`. Emit the template and stop the affected scope. Do not fill the gap by choosing an option.

## When to use

Read this skill before escalating a RED tier or an unresolved material decision. Escalate to ChatGPT only when canonical authority cannot resolve a material product or architecture decision. Do not add ChatGPT approval gates to GREEN/AMBER work.

## Template

```text
DECISION_REQUIRED
question:
why_current_authority_is_insufficient:
option_a:
option_b:
cursor_recommendation:
decision_owner:
blocked_scope:
work_continuing_elsewhere:
```

Use `PRODUCT_DECISION_REQUIRED` when material user or business behaviour is undefined and cannot be inferred. Architecture work must not resolve that status by inventing product behaviour.
