<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: DR-UOE-CANDIDATE-3 -->

# Design Readiness candidate — Unified Order Experience

```text
CANDIDATE_ID = DR-UOE-CANDIDATE-3
SUPERSEDES = DR-UOE-CANDIDATE-2
STATUS = DESIGN_READINESS_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
FORMAL_DESIGN_READINESS = NOT_PERFORMED
PREREQUISITES = Product Gate PASS + Experience Gate PASS (recorded); Architecture Fit PASS NOT_GRANTED
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION = YES
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
| PlaceChooser | Delivery location flow **or** Takeaway outlet flow from **server eligibility** (Now vs Schedule-capable) | Reuse LocationSelector patterns; eligibility read (not fabricated checkout pickup-options); empty/no-cart distinct (GP-03) |
| TimingChooser | Now \| Schedule → (eligible checkout) day → windows → confirm | Menu: intent + UNCONFIRMED only (DR-02); closed-now may offer Schedule intent for Takeaway (GP-01) |
| OrientationLabel | “Ordering in {market}” | Never styled as Deliver to |
| ImpactBanner | Fees / offers / availability changed | Server cart/checkout evaluate driven |
| PendingPaymentGuard | Blocks browse→mutate on PAYMENT_PENDING | Routes to recovery |
| Presentation maps | Customer + workforce + implemented-channel label helpers | LANG-1; no API rename |

## State presentation matrix

| Fact | Missing | Intent / intermediate | Confirmed |
|---|---|---|---|
| Method | “Choose how” | Highlight selected intent | Selected + used in evaluate / Checkout |
| Delivery place | “Add address” | Checking… / Known·not deliverable | “Deliver to …” (coords + SERVICEABLE) |
| Market orientation | — | “Ordering in Dehradun” | — (not a destination) |
| Collection place | “Choose collection place” / add items first (empty cart) | Server proposed AUTO_SELECT / list CUSTOMER_SELECT (proposed; timing-aware; per-timing AUTO_SELECT) | “Collect from …” after Checkout confirm |
| Time Now | — | Selected Now intent | Eligible ASAP path at Checkout |
| Time Schedule | “Choose time” | Schedule UNCONFIRMED + reason (no Menu exact slots); Schedule-capable place when closed NOW | Local window summary after eligible list |

## Visual / motion constraints

- One composition with existing BOBA commerce chrome — not a second map product
- Lightly branded; calm; mobile-first
- Avoid QSR-clone patterns and trademarked visual systems
- Prefer 2–3 intentional motions (sheet present, selection confirm, impact banner) — not noise
- Respect existing design-system dialog/sheet primitives where present
- Proposed outlet chrome must visually differ from Checkout-confirmed Collect from when still unconfirmed

## Accessibility readiness

- Focus trap in sheet/dialog; Escape closes; return focus to bar control
- Selected/pressed states for method and time
- Announce impact banner changes and eligibility empty/unavailable
- Contrast and hit targets for sticky strip
- No raw backend enums in accessible names

## Handoff to engineering (when authorized)

1. Shared presentation helpers (UX-A) before chrome rewrite — include in-app (+ WhatsApp when sending) (DR-04)
2. TimingChooser extractable for checkout and bar (Menu remains intent-only for Schedule)
3. order-context coordinator dual-reading delivery-context + eligibility/evaluate fingerprint keys (**tab-scoped**; GP-04)
4. Wire PlaceChooser to timing-aware pre-checkout eligibility read; Checkout timing-aware pickup-options + bind-without-evaluate on Schedule path (Contract C / AS-41)
5. Wire Cart impact to mode/timing-sensitive evaluate quote (Takeaway without Delivery address; provisional Offers; open-Checkout reuse; missing-evidence fail-closed; fingerprint/dedup)
6. Explicit integration tests for AS-01–46 subset per tranche

**Formal Design Readiness:** `NOT_PERFORMED`.
**Agent disposition after prerequisites:** candidate complete enough for later evaluation —
`RECOMMENDED_PASS` only once Fit is legitimately passed.
