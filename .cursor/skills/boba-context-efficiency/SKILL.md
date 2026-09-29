---
name: boba-context-efficiency
description: Builds minimum-sufficient BOBA implementation prompts, selects historical context, and packages review evidence. Use when constructing an implementation prompt, choosing history versus current authority, or packaging a review delta.
---

# BOBA context efficiency

## Authority

This procedure is subordinate to `AGENTS.md`. It is non-authoritative. Canonical authorities named by `AGENTS.md` prevail. On canonical conflict, STOP affected work. Do not reinterpret the conflict.

Current-first reading, the non-authority of historical snapshots, and the 50,000-character prompt limit remain in `AGENTS.md`. Delivery-mode rules remain in `AGENTS.md`. Do not restate them here as a second contract.

## Minimum sufficient context

Apply **MINIMUM_SUFFICIENT_CONTEXT** from
`docs/platform/PRODUCT-DELIVERY.md#ai-execution-and-documentation-efficiency`.

Prompts should include:

- task/story IDs
- risk level
- `DELIVERY_MODE`
- any `NO_COMMIT` narrowing
- exact authority versions / SHA / tree
- acceptance criteria
- affected invariants
- allowed/forbidden scope
- expected evidence
- the working-tree fingerprint wherever existing provenance rules require it

Prefer canonical paths to pasted docs.

**CURRENT FIRST:** read `docs/platform/ROADMAP.md` and `docs/platform/STATE.md` for lifecycle authority.

**HISTORY ON DEMAND:** read `docs/platform/history/` only when the task materially requires historical revision, acceptance, or provenance detail. Do not load complete historical snapshots during ordinary current product work. Historical snapshots do not override CURRENT metadata.

Do not repeatedly paste whole ROADMAP, STATE, ARCHITECTURE, governance history, prior accepted reports, or unrelated capability architecture. Verify metadata/versions, search, and read relevant sections/ranges without guessing applicable authority. Coding-agent implementation prompts must remain below 50,000 characters; split slices if needed.

For large authorities, metadata/version verification, targeted search, and relevant section/range reads satisfy the mandatory read order when they prove applicable authority. Whole-document repasting is not required.

## Scope headings

Implementation prompts must contain:

```text
MAY MODIFY
MAY MODIFY IF REQUIRED BY LOCKED ARCHITECTURE
MUST NOT MODIFY
EXPLICITLY OUT OF SCOPE
```

Require semantic scope, not only file paths.

## Review-evidence packaging

First review covers the full relevant slice. Follow-up review covers previous approved SHA → new SHA, changed files, affected invariants, and new evidence (including required content fingerprints). Widen review if the delta changes earlier assumptions. Reports return changed facts, evidence, exceptions, SHA/tree, and unresolved items; retain required report fields without repeating history.

Prefer compact deltas, paths, SHAs, CI URLs, and fingerprints over restating capability history or independently observable GitHub facts.

Efficiency must never permit guessed product, security, payment, or business decisions.
