---
name: boba-read-order
description: Applies the BOBA mandatory authority read order for IMP-036F onward, the X2/X3 follow-on order, and the pre-PD-1 omission rule. Use before governed product, architecture, lifecycle, payment, security, persistence, or current-slice work.
---

# BOBA read order

## Authority

This procedure is subordinate to `AGENTS.md`. It is non-authoritative. Canonical authorities named by `AGENTS.md` prevail. On canonical conflict, STOP affected work. Do not reinterpret the conflict.

This skill does not replace those authorities and does not define a second authority index. If this skill cannot be read, STOP affected governed work.

## IMP-036F onward

For IMP-036F onward, read in this order:

1. `AGENTS.md`
2. `docs/platform/VISION.md`
3. `docs/platform/ROADMAP.md`
4. `docs/platform/STATE.md`
5. `docs/platform/PRODUCT-DELIVERY.md`
6. Relevant per-IMP Product Definition under `docs/platform/product/`
7. `docs/platform/ARCHITECTURE.md`
8. `docs/platform/decision-register.md`
9. Relevant capability architecture / ADRs
10. `docs/platform/TESTING.md`
11. Current task specification and relevant implementation code
12. Supporting foundation operating rules when touching accepted foundations

## X2/X3 follow-on

For X2/X3 work, also read, in this order after lifecycle position is known:

1. `docs/platform/PRODUCT-DELIVERY.md`
2. The per-IMP Product Definition
3. `docs/platform/EXPERIENCE.md`
4. The per-IMP Experience Definition when it exists
5. `docs/platform/PRODUCT-LANGUAGE.md`
6. `docs/platform/ARCHITECTURE.md`
7. `docs/platform/decision-register.md`
8. Relevant capability architecture
9. `docs/platform/TESTING.md`

## Earlier work and large authorities

For IMP-036E and earlier, retain the existing authority order by omitting the new process,
Product Definition, and testing-policy steps where `N/A — PRE-PD-1` applies. Engineering-only
changes without product behaviour changes may remain specification-driven. For large authorities,
metadata/version verification, targeted search, and relevant section/range reads satisfy this
order when they prove applicable authority; whole-document repasting is not required.
