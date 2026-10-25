<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  TRANCHE: T1
  PACKAGE_STATUS: PLANNED
  IMPLEMENTATION: NOT_STARTED
  FIT_GRANT: NOT_GRANTED
-->

# T1 — Fit, Design/Quality readiness, IA, chrome, Scheduling, Commercial presentation

```text
WORK_PACKAGE_ID = WXE-T1-WP-1
TRANCHE = T1
PACKAGE_STATUS = PLANNED
IMPLEMENTATION = NOT_STARTED
IMPLEMENTATION_AUTHORIZED = NO
ARCHITECTURE_FIT = NOT_GRANTED
DESIGN_READINESS = NOT_GRANTED
QUALITY_TEST_PLAN = NOT_FINALIZED
MEASUREMENT_PLAN = NOT_FINALIZED
DEPENDS_ON = Human disposition of F-1..F-7 (doc 18) and the decision set in §1
OPTION_R = PRESERVED
UPD_08 = NOT_IN_SCOPE
```

T1 is the later implementation of information architecture, chrome, first-class Scheduling, and
Commercial role-correct presentation. This file is the bounded decision set a human uses before
that implementation, and the engineering boundary for the implementer who is authorized afterward.
It does not start T1.

## 1. Decision set (prepared, not granted)

PD-2 places Design Readiness after Architecture Fit, and places implementation authorization
after Design Readiness PASS, a finalized Quality/Test Plan, and, for X3, a finalized Measurement
plan. Experience Criticality for this capability is X3 at the package boundary. T1’s own journeys
are mainly X2 navigation plus truthful Commercial entry. The X3 delivery-proof journeys stay
outside T1.

| ID | Decision | Prepared content | Recorded result |
|---|---|---|---|
| T1-FIT | Presentation Architecture Fit for F-1..F-7 | Doc 18 §2, excluding UPD-08 journeys | NOT_GRANTED |
| T1-XD-PREREQ | Does historical Experience Gate PASS plus OPTION_R ratification satisfy PD-2 before Fit PASS? | Doc 18 `DECISION_REQUIRED` | NOT_RECORDED |
| T1-DR | Design Readiness for T1 chrome | Docs 04, 05, 07, and 11, limited to nav collapse, breadcrumbs, single H1, Scheduling placement, and Commercial show/hide recovery. AS-26 static escalation wording is checked against LANG-1 here; no new meaning. | NOT_GRANTED |
| T1-QT | Quality plan for T1 proofs | TEST-1. Bind WXE-PF-01, 02, 03, 04, 05, 06, 07, 09, 11, 12 plus the matrix in §5. WXE-PF-08 is T2. WXE-PF-10 is excluded. | NOT_FINALIZED |
| T1-MI | Measurement sufficient to authorize T1 | Doc 13 candidates that match T1: hub empty-state rate; AccessDenied or AS-27 recovery on `/workforce/admin/commercial/`. No new analytics authority. | NOT_FINALIZED |
| T1-IMPL | Implementation authorization and IMP identity | UPD-01 remains NOT_ALLOCATED | NOT_GRANTED |

A later human gate can accept this set in that order. Accepting T1-DR or T1-QT without T1-FIT
conflicts with PD-2. This document does not accept any row.

## 2. Scope (when a later authorization exists)

- Collapse the Operations triple stack to one persistent desktop section nav: shell side
  navigation, `OperationsWorkspaceNav`, and Store sub-navigation. Keep Store subsections under
  Store Management (doc 04 V1 chrome).
- Administration breadcrumbs and one H1 on Administration pages and on Orders (P1-B). Reuse
  `PageHeader` / `Breadcrumbs`.
- Apply F-2 and F-4 to hub destination resolution and the Operations landing href.
- Apply F-1 and F-3 in Administration navigation: Brand Commercial visible only when the static
  predicate holds; `outlet.read` entry unchanged; AS-27 recovery for direct Commercial links.
- Add a first-class Store Management **Scheduling** item that opens the existing scheduling
  profile client (F-5).
- Preserve read-only Store Assortment and its current static escalation copy, with no Brand
  Commercial cross-link while Commercial is hidden (WXE-PF-03).

## 3. Non-goals

- Daily Operations action order, lifecycle button gating, and UOE verb application (T2).
- Commercial review relabel, menu section/entry consequence review, draft/live clarity (T3).
- People mutator framing, WCAG 2.2 target-size / focus-not-obscured programme, measurement
  pipeline (T4).
- Delivery proof, cancel auto-attestation, and URL/body identity (UPD-08). PR #427 is not edited
  and is not evidence that those gaps are closed.
- New RBAC permissions, a Brand Commerce API, an escalation lookup API, a scheduling API, POS,
  KOT, or order states.
- A second Delivery/Takeaway or Now/Schedule label system (F-6).
- Commercial section URL deep-links (UPD-07 FOLLOW_UP).
- Nav animation polish after the collapse (doc 04 FOLLOW_UP).
- IMP-036J acceptance, merge, or deploy.

## 4. Source boundaries for a future implementer

These paths are the authorized surface **after** a human grants T1-IMPL. They are not an edit
list for the current branch.

```text
MAY MODIFY (future, presentation only)
- src/lib/workforce-hub/destinations.ts
    Entry and landing predicates only. Do not add permission key strings that are not already
    in the accepted catalogue. Commercial-read keys must not alone create Administration.
- src/components/administration/AdministrationAppShell.tsx
    Commercial item visibility becomes BRAND_OPERABLE_PREDICATE (commercial read AND brand.read).
    Do not remove outlet.read-based Administration entry.
- src/components/administration/commercial/CommercialWorkspaceClient.tsx
    and the /workforce/admin/commercial page shell
    AS-27 recovery instead of a broken brand-list landing when the predicate is false.
- src/components/workforce/WorkforceAppShell.tsx
- src/components/enterprise/SideNavigation.tsx
- src/components/enterprise/PageHeader.tsx
- src/components/enterprise/Breadcrumbs.tsx
- src/components/operations/OperationsWorkspaceNav.tsx
- src/components/operations/store/StoreSubnav.tsx
- src/components/operations/store/StoreShell.tsx
- src/lib/operations/store-navigation.ts
    Add a Scheduling nav item. Visibility reuses the capability that already shows Hours
    (outlet.operating_schedule.read). The client is already mounted by
    src/app/workforce/(portal)/operations/store/hours/page.tsx. A Scheduling item may
    open that existing Hours host or a page that only hosts the same client.
    Load and save stay on GET/POST
    /api/operations/v1/outlets/{outletId}/scheduling-profile, authorized by
    outlet.operating_schedule.read and outlet.operating_schedule.manage.
- src/components/operations/store/StoreSchedulingProfileClient.tsx
    Discoverability and heading only. Keep the existing load/save calls.
- src/app/workforce/**/page.tsx
    Breadcrumb and single-H1 composition. A Scheduling page is allowed only as a host for the
    existing client, not as a new domain route with new commands.
- Component tests adjacent to the files above, using synthetic effective-permission fixtures.

MUST NOT MODIFY
- src/server/** including administration use cases, operations store routes, and access-control
  role catalogues
- src/platform/database/**
- src/lib/operations/store.ts scheduling-profile request paths, except a call-site move that
  keeps the same route
- Delivery proof, cancellation, and attestation server modules
- UOE PR #424 sources (consume the approved UX-A contract; do not copy a forked map into WXE)
- PR #427 workspace
- docs/platform/STATE.md, ROADMAP.md, ARCHITECTURE.md, decision-register.md
  (no acceptance meaning change)

EXPLICITLY OUT OF SCOPE
- POS, KOT, new order aggregates or statuses
- Granting brand.read or any other permission
- Outlet-scoped Brand Commercial
- UPD-08 Gaps 1–3 and any claim that PR #427 closes them
```

## 5. Invariants

1. Server authorization stays the source of truth (ARCH-G11, ARCH-G23, ARCH-G25).
2. No new permission, role, or API.
3. Option R hide does not revoke UPD-03 B `outlet.read` entry.
4. Store Assortment is not Brand Commercial authoring (ADR-006).
5. Scheduling discoverability does not create scheduling authority or an Order status (ARCH-G29).
6. One H1 per page; breadcrumbs use `nav` and `aria-current`.
7. Desktop-first viewports remain 1366×768, 1440×900, and 1920×1080.
8. Unimplemented destinations stay unlisted.
9. WXE does not own the shared fulfilment-verb map.

## 6. Test matrix

All rows are **PLANNED**. None are executed by this package. Fixtures are synthetic
effective-permission maps (F-7), not production roles.

| ID | Proves | Fixture | Expected | Must not |
|---|---|---|---|---|
| WXE-PF-01 | F-1 | S1 commercial read + `brand.read` | Administration and Brand Commercial visible; workspace renders | Invent a permission |
| WXE-PF-02 | F-1 | S2/S3 without `brand.read` | Brand Commercial nav absent | Grant `brand.read`; outlet-scoped Commercial shell |
| WXE-PF-06 | F-2 | Same commercial reads ± `brand.read` | S1 enters Admin; S2 does not gain Admin from commercial reads alone | Empty Admin shell |
| WXE-PF-04 | F-4 | S4 store caps, no `order.read` | Hub card is shown. Href is `/workforce/operations/store/`. Today is not the href | Today href; changing the Delivery item off `delivery.read` |
| WXE-PF-05 | F-3 | S5/S6 `outlet.read` | Administration entry remains while Commercial is hidden | Revoke Admin via hide |
| WXE-PF-03 | ADR-006 | S3/S5 with Store Assortment | Read-only assortment; static escalation; no Commercial cross-link | New escalation API |
| WXE-PF-11 | AS-27 | S8 direct Commercial URL | Store Assortment if entitled, else Applications | Broken brand-list success |
| WXE-PF-12 | Union payload | S9-shaped fixture | Nav follows the union payload from `getAdminSession`. It does not toggle when an outlet context changes | A new scoped session API; sticky client flag |
| WXE-PF-07 | F-5 | Store actor with `outlet.operating_schedule.read` | Scheduling item visible and opens existing profile UI | New scheduling API |
| WXE-PF-09 | Negative authz | Existing denied mutation | Current server denial unchanged | Broaden RBAC |
| T1-H1 | P1-B | Orders and an Admin page | One H1; no nested `main` | — |
| T1-BC | Breadcrumbs | Admin page with a parent | `nav` plus `aria-current` | New domain names that contradict doc 06 |
| T1-NAV | V1 chrome | Desktop 1366×768 | One persistent section nav; Store subsections remain | Second editor for the same effect |

WXE-PF-08 and WXE-PF-10 are not T1 exit rows.
