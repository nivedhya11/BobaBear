<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Feature and route inventory

```text
INVENTORY_ID = WXE-INV-CANDIDATE-1
BASE_MAIN_SHA = 4cc24d1a4ea4f4dace4d71d48a40a961a64086d8
SOURCE_OF_ROUTES = src/app/workforce/**/page.tsx (24 pages VERIFIED)
ROUTE_TS_UNDER_WORKFORCE = NONE (VERIFIED)
EVIDENCE_CLASS = SOURCE_VERIFIED
```

Presentation groups in the **Proposed section** column are candidate IA labels from
[`04-target-navigation-and-placement.md`](./04-target-navigation-and-placement.md). They are not
new business-domain authorities.

## Shells and entry gates

| Surface | Shell | Entry gate (UI) | Notes |
|---|---|---|---|
| Workforce Hub | `WorkforceAppShell` + `WorkforceHubClient` | Authenticated session | Lists destinations from `WORKFORCE_DESTINATIONS` |
| Operations | `WorkforceAppShell` + `OperationsWorkspaceNav` | Hub destination requires `order.read` | Store tab broader than hub gate — see P1-ENTRY |
| Store | `StoreShell` + `StoreSubnav` | Per-outlet capabilities from operations API | `?outletId=` preserved in sub-nav, not always in breadcrumbs |
| Administration | `AdministrationAppShell` | Any of `ADMINISTRATION_ENTRY_PERMISSIONS` | **Omits commercial read keys** — see P1-ENTRY |
| Commercial | Inside Administration | Commercial nav: any commercial read | Shell entry still requires admin entry list |

`ADMINISTRATION_ENTRY_PERMISSIONS` (`src/lib/workforce-hub/destinations.ts`):
`brand.read`, `organization.read`, `territory.read`, `legal_entity.read`, `outlet.read`,
`access.membership.read|manage`, `access.role_assignment.read|grant|revoke`,
`access.effective_permissions.read`, `access.audit.read`.

Operations hub destination: `order.read` only.

## Access mutator map (independent amendment A)

| Client | Route | Role | Mutations |
|---|---|---|---|
| `AdministrationAccessClient` | `/workforce/admin/access/` | **Read-only** effective-permission diagnostic | None |
| `AdministrationMembershipsClient` | `/workforce/admin/memberships/` | Membership **create** | `createAdminMembership` |
| `AdministrationMembershipDetailClient` | `/workforce/admin/memberships/detail/` | Membership **status** + role **grant/revoke** | Status transitions; role grant/revoke; also reads effective permissions |
| `StoreTeamMembersClient` | `/workforce/operations/store/team/` | Outlet membership **create** + **status** | Invite; activate/suspend/revoke (partial confirm UX) |
| `StoreTeamAccessClient` | `/workforce/operations/store/team/access/` | Outlet role **grant/revoke** + membership **status** | Grant/revoke roles; membership status |

Do **not** treat Access as a mutator surface.

## Complete page inventory

| # | Route | Primary component | Origin IMP | Domain authority (summary) | Permission / scope (UI entry) | Primary user task | Proposed section | Human-facing name (candidate) | Breadcrumb (current) | Supported action / recovery | Evidence | UX finding / priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/workforce/` | `WorkforceHubClient` | IMP-036A | Portal session | Auth session | Choose application | Dashboard | Applications | none | Empty state when zero destinations; auto-redirect if exactly one | SOURCE | P1-ENTRY entry lists |
| 2 | `/workforce/login/` | `WorkforceLoginClient` | IMP-010 | Workforce auth | Public login | Sign in | (auth) | Workforce Sign In | none | Return-to safe path | SOURCE | — |
| 3 | `/workforce/operations/` | `OperationsTodayClient` | IMP-036D | Order read | `order.read` | See orders needing attention | Dashboard | Today | Workforce / Operations | Attention list from recent orders | SOURCE | Density / context |
| 4 | `/workforce/operations/orders/` | `OperationsOrderListClient` | IMP-030/036D/H/I | Order | `order.read` | Find and open orders | Daily Operations | Orders | … / Orders | Filters; Load more; timing cues | SOURCE | P2-A mobile cards |
| 5 | `/workforce/operations/orders/detail/?orderId=` | `OperationsOrderDetailClient` | IMP-030/036A/D/H/I | Order lifecycle | `order.read`; lifecycle buttons status-only in UI | Accept / fulfil / cancel; inspect | Daily Operations | Order detail | … / Orders / Detail | Lifecycle dialog; delivery/refund/notifications | SOURCE | **P1-A** placement + permission-blind buttons; **P0-A**; **P1-B** dual H1/main |
| 6 | `/workforce/operations/delivery/` | `OperationsDeliveryWorkspaceClient` | IMP-036D/032 | Delivery | `delivery.read` | Manual delivery queue | Daily Operations | Delivery | … / Delivery | ACCEPTED-only queue; panel commands | SOURCE | **P0-A** |
| 7 | `/workforce/operations/status/` | `OperationsStatusClient` | IMP-036/036D | Ops observability | `order.read` (nav) | Read service health | Audit & System | Operational Status | … / Operational Status | 403 message | SOURCE | Terminology |
| 8 | `/workforce/operations/store/` | `StoreOverviewClient` | IMP-036E | Outlet ops | Store coarse caps | Store snapshot | Store Management | Store overview | … / Store | Cards to sub-areas | SOURCE | — |
| 9 | `…/store/availability/` | `StoreAvailabilityClient` | IMP-036E | Availability | `availability.read` / `.manage` | Mark sold out / unavailable | Menu & Commercial (ops) | Availability | … / Store / Availability | Confirm dialogs | SOURCE | Term vs Assortment |
| 10 | `…/store/assortment/` | `StoreAssortmentClient` | IMP-036E | Assortment (read) | Assortment/store caps | View assortment; escalate to brand | Menu & Commercial | Assortment (store view) | … / Store / Assortment | Read-only; brand escalation copy | SOURCE | Authority clarity |
| 11 | `…/store/operating-status/` | `StoreOperatingStatusClient` | IMP-036E | Operating state | `outlet.operating_state.*` | Pause / suspend store | Store Management | Store Status | … / Store / Operating Status | Confirmations | SOURCE | Term “Store Status” |
| 12 | `…/store/hours/` | `StoreHoursClient` + `StoreSchedulingProfileClient` | IMP-036E / IMP-036I | Schedule + scheduling profile | `outlet.operating_schedule.*` | Edit hours; scheduled lead times | Store Management | Store Hours (+ Scheduling) | … / Store / Hours | Save with revision | SOURCE | **P2-C** scheduling discoverability |
| 13 | `…/store/serviceability/` | `StoreServiceabilityClient` | IMP-036E | Serviceability | `serviceability.*` | Delivery area / distance policy | Store Management | Delivery Area | … / Store / Serviceability | Set distance policy | SOURCE | Term |
| 14 | `…/store/pickup-profile/` | `StorePickupProfileClient` | IMP-036H-E | Pickup profile | `outlet.read` / `.update` | Enable takeaway location profile | Store Management | Takeaway settings | … / Store / Pickup Profile | Enable + address | SOURCE | Term Takeaway vs Pickup |
| 15 | `…/store/team/` | `StoreTeamMembersClient` | IMP-036E | Membership | `access.membership.*` | Invite / status at outlet | People & Access | Store Team | … / Store / Team | Step-up; partial confirms | SOURCE | Amendment A |
| 16 | `…/store/team/access/` | `StoreTeamAccessClient` | IMP-036E | Role assignment | membership + role assignment | Grant/revoke outlet roles | People & Access | Role Assignments (store) | … / Store / Team / Access | Step-up; no effective-perms reveal | SOURCE | Amendment A |
| 17 | `/workforce/admin/` | `AdministrationHubClient` | IMP-035 | Admin overview | Admin entry | Org health snapshot | Dashboard / Organization | Administration overview | none | Hub panels; **no Commercial card** | SOURCE | **P2-B-ADMIN**; P1-ENTRY |
| 18 | `/workforce/admin/resources/` | `AdministrationResourcesClient` | IMP-035/036G | Org resources | resource reads | Manage brand/org/territory/LE/outlet | Organization | Organization Resources | none | Create/edit/activate/deactivate | SOURCE | **P2-B** dual H1 |
| 19 | `/workforce/admin/memberships/` | `AdministrationMembershipsClient` | IMP-035/036G | Membership | `access.membership.read` | Create memberships | People & Access | Memberships | none | Create + list | SOURCE | **P2-B**; Amendment A |
| 20 | `/workforce/admin/memberships/detail/?membershipId=` | `AdministrationMembershipDetailClient` | IMP-035/036G | Membership + roles | membership + role | Status + grant/revoke + EP read | People & Access | Membership detail | none | Confirm dialogs + step-up | SOURCE | Amendment A |
| 21 | `/workforce/admin/access/` | `AdministrationAccessClient` | IMP-036G | Effective permissions | role_assignment.read **or** effective_permissions.read | Diagnose effective permissions | People & Access | Effective Permissions | none | Read-only diagnostic | SOURCE | Amendment A |
| 22 | `/workforce/admin/audit/` | `AdministrationAuditClient` | IMP-035 | Access audit | `access.audit.read` | Inspect access changes | Audit & System | Access Audit | none | Filters / load more | SOURCE | **P2-B** |
| 23 | `/workforce/admin/system/` | `AdministrationSystemClient` | IMP-036G | System health bridge | Nav ungated; ops status needs `order.read` | View health; hand off to Ops | Audit & System | System Health | none | Link to Operations when authorized | SOURCE | — |
| 24 | `/workforce/admin/commercial/` | `CommercialWorkspaceClient` (+ editors) | IMP-036F (+036J) | Catalog/Menu/Assortment/Pricing/Promo/Charges | Commercial reads; shell needs admin entry | Author and publish commercial | Menu & Commercial | Commercial Workspace | none | Domain editors + inspection | SOURCE | **P1-B**, **P1-C**, #376/#381 related |

**Coverage count:** 24 App Router pages; 2 application shells; 1 commercial multi-section workspace (not separate routes); store capabilities also exposed via APIs without dedicated UI for `operating_date_exceptions_*` (**NOT_FOUND** UI).

## Commercial workspace sections (same route #24)

| Section label (shipped) | Component | Mutability | Proposed subsection | Finding |
|---|---|---|---|---|
| Offering | `CatalogEditor` | Draft/publish/activate/retire | Products & Variants | — |
| Menu | `MenuEditor` | Layout + publish; section/entry activate/retire | Menu layout & publication | **P1-C** no consequence review on section/entry lifecycle |
| Assortment | `AssortmentEditor` | Include/exclude effect | Brand Assortment | — |
| Pricing | `PricingEditor` | Activate / retire | Pricing | — |
| Promotions & coupons | `PromotionsEditor` | Manage / activate / retire | Offers | #376/#381 related |
| Delivery tariff | `DeliveryTariffEditor` | Review & update | Delivery Charges | Gate via `pricing.*` |
| Review & publish/effect | `CommercialInspectionPanel` | **Read-only** | Review | **P2-D** tab label (body Alert already redirects) |
| Verify & diagnose | Customer + sellability panels | Diagnostic POSTs | Verification | — |
| Activity | `CommercialActivityPanel` | Read-only | Commercial activity | — |

## Order-detail embedded capabilities (route #5)

| Capability | Component | Permission notes | Finding |
|---|---|---|---|
| Lifecycle actions | Accept / Fulfil / Cancel + confirm dialog | Server enforces `order.accept|fulfil|cancel`; UI shows by status | **P1-A** rendered after delivery/refund/notifications/items |
| Delivery | `OperationsDeliveryPanel` | Server `permittedCommands` | **P0-A** UAT defaults |
| Refunds | `OperationsRefundPanel` | UI `payment.refund`; step-up | Keep above fold relative to secondary panels after redesign |
| Notifications | `OperationsNotificationPanel` | Server `resendPermitted` | — |
| Items / Payment / Lifecycle metadata | detail sections | Read | — |

## Built-in role entry (read-only analysis)

| Role | Hub Operations | Hub Administration | Notes |
|---|---|---|---|
| `platform_super_admin` | Yes | Yes | Both |
| `brand_admin` | Yes | Yes | Commercial operable |
| `outlet_manager` | Yes | Yes | **Commercial nav appears**; brand list needs `brand.read` (absent) → **P1-COMM** |
| `kitchen_operator` | Yes | Yes via `outlet.read` | Also Commercial nav via `assortment.read` — WXE-UPD-03 |
| `delivery_coordinator` | Yes | Yes via `outlet.read` | |
| `support_refund_operator` | Yes | Yes | |
| `finance_viewer` | Yes | Yes | |
| Commercial-only capability fixture | No | **No** (code) | **LATENT** for built-ins — see P1-ENTRY |
| Store-without-`order.read` fixture | No Ops card | Yes if `outlet.read` | LATENT; do not land on Today |

Route files also moved into route groups under **IMP-036A**. Foundations include IMP-030 / IMP-032.

## Dead / stale / not-to-link surfaces

| Item | Status |
|---|---|
| `AdministrationPageClient` | Legacy client; still rendered by `tests/administration/admin-ui.test.tsx` (IMP-036G evidence) — do not delete without reconciliation; not used by current pages |
| `OperationsStoreClient` | Legacy re-export; no page references |
| Server `operating_date_exceptions_get/set` | No UI — do not expose |
| Delivery commands without UI | `update-tracking`, return, `record-cost` — do not invent nav |
| Workforce MFA enrolment / password reset / profile / not-found | Not implemented as routes — do not link |

## Evidence classes used in this inventory

| Class | Meaning |
|---|---|
| SOURCE | Verified in application source at `BASE_MAIN_SHA` |
| TEST | Covered or implied by unit/integration tests |
| POSSIBLE | Behaviour reachable if permissions/custom roles grant the path |
| PROVEN | Demonstrated by code path without requiring runtime exploit |
