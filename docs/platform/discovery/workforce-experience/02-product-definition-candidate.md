<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Product Definition candidate — Workforce Experience

```text
PD_ID = PD-WXE-CANDIDATE-1
PACKAGE = WXE-CANDIDATE-1
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
PRODUCT_DEFINITION_GATE = NOT_PERFORMED
EXPERIENCE_CRITICALITY = X2 / X3 by workflow
CHANGE_RISK = CR1 overall; CR2 at refund / access-mutation / commercial publish-effect / delivery-proof
IMPLEMENTATION_AUTHORIZED = NO
```

## 1. Capability statement

Provide a **consistent, desktop-first Workforce and Administration experience** so authorized
operators can complete daily order fulfilment, store configuration, commercial authoring, and
access administration with clear hierarchy, terminology, navigation, and safe consequential
actions — **without** inventing new business-domain authorities, POS lifecycle, or duplicate
authoritative editors.

## 2. Business outcome

Reduce time-to-safe-action for store and brand operators on laptop/desktop, eliminate misleading
or fabricated-evidence paths in delivery operations, and make every granted capability reachable
through a coherent task-based presentation — improving operational reliability before GTM scale.

## 3. Approved experience decisions (Founder conversation)

| ID | Decision | Binding for this candidate |
|---|---|---|
| WXE-FD-01 | Workforce & Administration are desktop first | Yes — evidence: conversation acceptance recorded as `ACCEPTED_IN_CONVERSATION` (ratify on PR) |
| WXE-FD-02 | Primary targets 1366×768, 1440×900, 1920×1080 (+ larger ops displays) | Yes — not a kitchen display system |
| WXE-FD-03 | Laptop productivity over mobile-first composition | Yes |
| WXE-FD-04 | Retain basic responsive + accessibility; no mobile authoring feature parity | Yes |
| WXE-FD-05 | Task-first IA; seven presentation groups | Presentation only |
| WXE-FD-06 | Primary order methods Delivery / Takeaway; timing Now / Schedule | Future presentation; **shared label map owned with UOE UX-A** (see terminology) |
| WXE-FD-07 | Reuse enterprise components | Yes |
| WXE-FD-08 | Operations ≠ full POS; POS future = `PRODUCT_DECISION_REQUIRED` | Yes |

LANG-1 does **not** independently require Now / Takeaway.

## 4. Primary personas (not 1:1 roles)

| Persona | Goals | Example role mappings (non-exclusive) |
|---|---|---|
| Shift fulfilment operator | Clear order queue; accept/fulfil/hand over | kitchen_operator, outlet_manager |
| Delivery coordinator | Book/assign/proof without fake evidence | delivery_coordinator |
| Store operator | Hours, status, area, availability, team | outlet_manager, kitchen_operator |
| Brand commercial author | Draft/live catalog, menu, prices, offers | brand_admin |
| Access administrator | Memberships, roles, diagnostics, audit | platform_super_admin, brand_admin |
| Support / finance operator | Read orders; refunds where permitted | support_refund_operator, finance_viewer |

## 5. Journeys / story map (candidate)

See [`08-operator-journey-scenarios.md`](./08-operator-journey-scenarios.md). Story map themes:

1. Enter & orient (hub, shells, context)
2. Fulfil today (orders, delivery, takeaway)
3. Configure store
4. Author commercial & effect safely
5. Manage people & diagnose access
6. Audit & health

### Acceptance slicing

| Slice | Contents |
|---|---|
| **V1_ACCEPTANCE_SLICE** | Desktop IA chrome; order detail safety (capability-gated actions + placement); Delivery/Takeaway presentation alignment with UOE map; Admin breadcrumbs/single H1; Scheduling discoverability; P0-A already shipped or included |
| **FOLLOW_UP** | Commercial section deep-links; measurement pipeline; store immediate-effect confirmations; nav-layer collapse polish |
| **DEFERRED** | Full POS; KOT; counter billing; new kitchen READY state; customer UOE surfaces |

`WXE-P0-CORRECTIVE-1` may ship earlier under Controlled Exception (findings register).

## 6. In scope / out of scope

**In scope:** navigation, breadcrumbs, hierarchy, terminology alignment, permission-correct affordances, desktop interaction standard, P0/P1 defect register, one canonical home per action, draft/live clarity.

**Out of scope:** proprietary POS, new kitchen lifecycle states, KOT, counter billing, new order aggregates, customer ordering redesign (UOE), mobile authoring parity, unimplemented destinations, ROADMAP/STATE mutation, silent IMP-032 acceptance rewrite.

## 7. Actors, permissions, authorization variants

Navigation from effective permissions **and** resource scope. Server authorization authoritative.

| Variant | Expected |
|---|---|
| Multi-app principal | Hub chooser |
| Ops-only | Operations landing = first authorized ops nav item |
| Admin/commercial | Administration reachable when commercial **or** org/access grants apply |
| Unauthorized deep link | AccessDenied → Applications |
| Multi-outlet | Outlet switch preserves context |

## 8. Observable behaviour + paths

Happy / alternate / empty / error / recovery / concurrency / destructive — see Experience Definition UX state matrix and journey AS list. Destructive: lifecycle cancel, refund, grant/revoke, suspend, retire, delivery fail/cancel — require consequence review or confirmation class.

## 9. Service / operational impact

Changes operator presentation and safety of delivery evidence entry. Customer promises (accepted/fulfilled/delivered/collected) unchanged in domain. “Prepare for collection” is **off-system human work**, not a new READY kitchen state.

## 10. CR2 security / abuse overlay (delivery proof)

| Abuse case | Control |
|---|---|
| Submit fabricated booking/tracking/assignment/proof | Empty defaults; required fields; no UAT strings |
| One-click fail/cancel with hidden codes | Confirmation + visible reason entry |
| Silent attestation | Explicit operator confirmation control |
| Server accepts arbitrary proof text vs IMP-032 wording | Founder escalation; optional server harden |

## 11. Quality Attribute Profile

| Attribute | Req | Notes |
|---|---|---|
| Accessibility | REQUIRED | WCAG 2.2 AA where applicable |
| Responsive / device | REQUIRED | Desktop-first |
| Security | REQUIRED | Step-up preserved; proof abuse overlay |
| Privacy | REQUIRED | No PII in new analytics |
| Authorization | REQUIRED | Capability-correct affordances |
| Reliability | REQUIRED | No silent consequential failure |
| Availability | N/A | No new HA topology |
| Resilience | REQUIRED | Error/recovery presentation |
| Observability | REQUIRED | Measurement candidate for X3 paths |
| Performance | REQUIRED | Desktop perceived performance |
| Scalability | N/A | Presentation only |
| Concurrency | REQUIRED | Preserve revision-aware saves |
| Data integrity | REQUIRED | No fabricated evidence facilitation |
| Supportability | REQUIRED | Clear labels; audit unchanged as SoR |
| Backward compatibility | REQUIRED | Domain enums/APIs preserved |
| Localization / presentation | REQUIRED | Labels only |

## 12. Dependencies

IMP-030/032/035/036A/D/E/F/G/H/I (+036J commercial pending acceptance); enterprise DS; ADR-003/010/006/018; LANG-1/EXP-1/PD-2/TEST-1; UOE package for shared order-type labels.

## 13. Unresolved product decisions

WXE-UPD-01…07 as in Founder decision record (IMP allocation, entry unions, kitchen Admin entry, POS, P0 authorize, Scheduling nav, commercial deep-link).

## 14. Product Definition Gate block (pre-gate)

```text
Product Definition Gate: NOT_PERFORMED
Capability: Workforce Experience (WXE-CANDIDATE-1)
Product Definition Version: PD-WXE-CANDIDATE-1
Experience Criticality: X2/X3 by workflow
Change Risk: CR1 (CR2 at named boundaries)
Linked Experience Definition: XD-WXE-CANDIDATE-1
Business Outcome: defined (§2)
Primary Personas: defined (§4)
Journeys / Story Map: linked (§5 + doc 08)
Acceptance Slice: V1 / FOLLOW_UP / DEFERRED (§5)
Happy/Alternate/Empty/Error/Authz/Concurrency/Destructive: referenced (§8)
Service/operational impact: defined (§9)
Security/abuse overlay: defined (§10)
Quality Attribute Profile: defined (§11)
Unresolved Product Decisions: WXE-UPD-01…07
Architecture Conflicts: NONE for presentation-only; DELIVERY_PROOF vs IMP-032 wording = ESCALATE (see Fit)
Result: NOT_PERFORMED
```
