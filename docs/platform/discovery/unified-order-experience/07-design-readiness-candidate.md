<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: DR-UOE-CANDIDATE-1 -->

# Design Readiness candidate — Unified Order Experience

```text
CANDIDATE_ID = DR-UOE-CANDIDATE-1
STATUS = DESIGN_READINESS_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE
FORMAL_DESIGN_READINESS = NOT_PERFORMED
PREREQUISITES = Product Gate + Experience Gate + Architecture Fit (none formally passed)
IMPLEMENTATION_AUTHORIZED = NO
```

## Readiness claim boundary

This document specifies implementation-ready **interaction and presentation intent** for
evaluation. It is **not** a passed Design Readiness gate.

## Interaction inventory

| Component family | Responsibility | Notes |
|---|---|---|
| OrderContextBar | Strip: method · place · time | Mobile sticky; desktop header-integrated |
| OrderContextSheet | Edit How / Where / When | Mobile sheet; desktop popover/dialog |
| MethodChooser | Delivery \| Takeaway | Maps to domain enums in transport only |
| PlaceChooser | Delivery location flow **or** Takeaway outlet flow | Reuse LocationSelector + pickup-options UI patterns |
| TimingChooser | Now \| Schedule → day → windows → confirm | Replaces long grid as primary pattern |
| OrientationLabel | “Ordering in {market}” | Never styled as Deliver to |
| ImpactBanner | Fees / offers / availability changed | Server-evaluate driven |
| PendingPaymentGuard | Blocks browse→mutate on PAYMENT_PENDING | Routes to recovery |
| Presentation maps | Customer + workforce label helpers | LANG-1; no API rename |

## State presentation matrix

| Fact | Missing | Intent / intermediate | Confirmed |
|---|---|---|---|
| Method | “Choose how” | Highlight selected intent | Selected + used in Checkout evaluate |
| Delivery place | “Add address” | Checking… / Known·not deliverable | “Deliver to …” (coords + SERVICEABLE) |
| Market orientation | — | “Ordering in Dehradun” | — (not a destination) |
| Collection place (V1) | “Choose store at checkout” | Pre-checkout intent only; at Checkout: proposed AUTO_SELECT pending confirm | “Collect from …” after confirm |
| Time Now | — | Selected Now intent | Eligible ASAP path at Checkout |
| Time Schedule | “Choose time” | Schedule UNCONFIRMED + reason | Local window summary after eligible list |

## Visual / motion constraints

- One composition with existing BOBA commerce chrome — not a second map product
- Lightly branded; calm; mobile-first
- Avoid QSR-clone patterns and trademarked visual systems
- Prefer 2–3 intentional motions (sheet present, selection confirm, impact banner) — not noise
- Respect existing design-system dialog/sheet primitives where present

## Accessibility readiness

- Focus trap in sheet/dialog; Escape closes; return focus to bar control
- Selected/pressed states for method and time
- Announce impact banner changes
- Contrast and hit targets for sticky strip
- No raw backend enums in accessible names

## Handoff to engineering (when authorized)

1. Shared presentation helpers (UX-A) before chrome rewrite
2. TimingChooser extractable for checkout and bar
3. order-context coordinator dual-reading delivery-context
4. Explicit integration tests for AS-01–19 subset per tranche

**Formal Design Readiness:** `NOT_PERFORMED`.
**Agent disposition after prerequisites:** candidate complete enough for later evaluation —
`RECOMMENDED_PASS` only once Fit is legitimately passed.
