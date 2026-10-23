<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Architecture Fit candidate

```text
FIT_ID = ARCH-WXE-FIT-CANDIDATE-1
ARCHITECTURE_FIT = CANDIDATE_ONLY
BASE_ARCHITECTURE = ARCH-R23
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

## Unresolved fit items

| Item | Notes |
|---|---|
| Server-side strengthening of delivery proof beyond UI | Optional; may need product/architecture decision if changing acceptance rules |
| Commercial section URL deep-links | Presentation enhancement; avoid inventing domain routes unnecessarily |
| Narrowing Admin entry for kitchen/delivery | Product decision WXE-UPD-03 |

## Architecture Conflicts

```text
Architecture Conflicts vs ARCH-R23 for presentation redesign: NONE identified
DELIVERY_PROOF_POLICY: Possible STATE_CODE_CONFLICT vs IMP-032 capability wording
  (server accepts non-empty free-text proof; capability text rejects arbitrary free text
   as sufficient proof). UI hotfix (WXE-P0-CORRECTIVE-1) reduces fabricated prefills but
   does not by itself close the accepted-contract gap — ESCALATE_FOUNDER for server harden.
Fit Result: CANDIDATE_ONLY (prerequisites Product/Experience Gates NOT_PERFORMED)
```
