<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Architecture Fit candidate

```text
FIT_ID = ARCH-WXE-FIT-CANDIDATE-1
ARCHITECTURE_FIT = CANDIDATE_ONLY
FORMAL_ARCHITECTURE_FIT_OR_LOCK = NOT_GRANTED
BASE_ARCHITECTURE = ARCH-R23
WXE_P1_COMM = OPTION_R
OPTION_R_AMENDMENT_DOC = 16-option-r-p1-comm-amendment-and-proof-matrix.md
WXE_UPD_08 = SEPARATE_CORRECTIVE (NOT closed by this candidate)
```

## Fit summary

Workforce Experience redesign is primarily a **presentation, navigation, and operator-safety**
change over accepted Operations and Administration capabilities. It **reuses** existing portals,
APIs, permission keys, and enterprise components. It must **not** introduce POS modules, new order
aggregates, or duplicate commercial authorities.

## Binding authorities reused

| Authority | Reuse |
|---|---|
| IMP-036A hub + shells | Entry, cross-app nav |
| IMP-036D operations console UI | Today, orders, delivery, refunds, notifications |
| IMP-036E store operations | Store shell, outlet capabilities |
| IMP-036F/J commercial workspace | Editors + inspection |
| IMP-036G admin console | Memberships, access diagnostic, system |
| IMP-032 delivery mode | Commands; proof policy tension noted in P0-A |
| IMP-035 administration foundation | Resources, audit |
| ADR-003 / ADR-010 | Operations ≠ full POS |
| ADR-006 | Catalog / assortment / availability separation |
| ADR-018 | DELIVERY \| PICKUP domain |
| Access-control catalog | Role permission mappings |

## Reuse vs extend

| Area | Disposition |
|---|---|
| SideNavigation / PageHeader / Breadcrumbs / dialogs | **Reuse**; apply consistently to Admin |
| `WORKFORCE_DESTINATIONS` | **Extend** entry permission unions (P1-ENTRY; not T0) |
| Commercial section tabs | **Reuse**; relabel; optional deep-link later |
| Delivery panel | **Reuse** commands; **fix** default/attestation UX |
| Store scheduling | **Reuse** component; **extend** discoverability |
| New kitchen states / KOT / counter POS | **Out of scope** — `PRODUCT_DECISION_REQUIRED` |
| New microservices / queues | **Forbidden** by this candidate |

## POS boundary (Amendment C)

| Statement | Status |
|---|---|
| Operations is an existing workforce capability | Accepted fact |
| Operations is foundation for **potential** future POS | ADR-003 language |
| Operations is **not** a full proprietary POS today | Binding |
| Do not create new kitchen lifecycle states, POS billing, KOT printing authority, counter POS, or new order aggregates in WXE | Bound in this candidate |
| POS ownership / scope | `PRODUCT_DECISION_REQUIRED` for a future governed slice |

## Invariants the candidate must preserve

1. Server authorization remains source of truth
2. Step-up MFA classes on access and refund mutations unchanged unless a locked decision says otherwise
3. Distinct authorities: Catalog ≠ Menu ≠ Assortment ≠ Availability ≠ Pricing ≠ Delivery charges ≠ Serviceability
4. Static-export workforce pages remain client shells talking to `/api/operations` and `/api/admin`
5. No second authoritative editor for the same effect
6. Customer UOE package remains separate

## OPTION_R fit reconciliation (P1-COMM)

| Topic | Fit proposal |
|---|---|
| Brand Commercial Workspace | Remains brand-scoped IMP-036F/J reuse; no outlet-scoped second Commercial authority |
| Outlet roles without brand authority | Hide Brand Commercial nav (static BRAND_OPERABLE_PREDICATE); AS-27 direct-link recovery; Store ops / read-only assortment / static escalation (ADR-006); no Brand Commercial cross-link when hidden |
| P1-ENTRY Admin union / Ops landing | UPD-02 A retained; under OPTION_R commercial reads without `brand.read` must not alone create empty Admin (net V1 Admin entry unchanged; union nominal/future-proofing); Ops landing unchanged |
| UPD-03 B Kitchen/Delivery Admin | Preserve `outlet.read` entry; Commercial hide must not revoke it |
| Server RBAC / `brand.read` | **No grant**; escalate true API conflicts; Fit should confirm brand-list path requires `brand.read` in client effective-permission payload |
| Proof matrix | Doc 16 WXE-PF-01…12 — future authorized proofs only |
| Delivery Gaps 1–3 | UPD-08 separate; presentation Fit may be evaluated for non-delivery-proof surfaces, but affected X3 delivery-proof/cancellation journeys must **not** receive Architecture Lock without required security disposition |

## Unresolved fit items

| Item | Notes |
|---|---|
| Server Gap 1 — arbitrary non-empty proof reference | UPD-08; UI does not close; **not remediated in this task** |
| Server Gap 2 — cancel-path automatic inactivity attestation | UPD-08; separate server corrective; **not remediated in this task** |
| Server Gap 3 — URL `orderId` vs body `deliveryId` binding | Integrity concern; not claimed exploited; UPD-08; **not remediated in this task** |
| Commercial section URL deep-links | FOLLOW_UP / UPD-07; avoid inventing domain routes |
| Narrowing Admin entry for kitchen/delivery | Founder **UPD-03 = B** — preserve for V1; narrowing not in V1 (not T0) |
| Administration entry union / Ops landing | Founder **UPD-02 = A** — V1 desired behaviour; escalate API/RBAC conflicts; no silent `brand.read` |
| P1-COMM brand operability | Founder **OPTION_R** — hide unusable Brand Commercial; no Store-as-Brand-Commercial; ratification record pending |

## Architecture Conflicts

```text
Architecture Conflicts vs ARCH-R23 for presentation redesign: NONE identified
OPTION_R presentation constraints: compatible with ADR-006 assortment/availability separation
  and existing brand-scoped Commercial workspace — no new domain authority invented.
DELIVERY_PROOF_POLICY / Gaps 1–3:
  Gap 1 — Possible STATE_CODE_CONFLICT vs IMP-032 capability wording
    (server accepts non-empty free-text proof; capability text rejects arbitrary free text
     as sufficient proof).
  Gap 2 — Cancel auto-attestation behavioural gap vs explicit attestation on resolve paths.
  Gap 3 — Potential URL/body identity mismatch; end-to-end authz bypass NOT proven.
  UI hotfix (WXE-P0-CORRECTIVE-1 / PR #427) reduces fabricated prefills and one-click terminals
  but does NOT close Gaps 1–3 — ESCALATE_FOUNDER (UPD-08).
  Architecture Lock for affected X3 delivery-proof/cancellation journeys:
    BLOCKED until UPD-08 security disposition — presentation Fit may still be evaluated separately.
Fit Result: CANDIDATE_ONLY
FORMAL_ARCHITECTURE_FIT_OR_LOCK = NOT_GRANTED
```
