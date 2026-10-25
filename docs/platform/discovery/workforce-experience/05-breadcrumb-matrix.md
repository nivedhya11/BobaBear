<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Breadcrumb matrix

```text
BC_ID = WXE-BC-CANDIDATE-1
COMPONENT = src/components/enterprise/Breadcrumbs.tsx via PageHeader
```

## Rules

1. Hierarchical pages show breadcrumbs; hubs may omit.
2. Final crumb is current page (`aria-current="page"`), not a link.
3. Exactly one page H1; breadcrumb labels may be shorter than H1.
4. Preserve `outletId` / entity query params on linked crumbs.
5. Administration currently lacks breadcrumbs — candidate requires them.

## Matrix — current vs candidate

| Route | Current breadcrumbs | Candidate breadcrumbs | Unresolved |
|---|---|---|---|
| `/workforce/` | none | none (Applications hub) | — |
| `/workforce/login/` | none | none | — |
| `/workforce/operations/` | Workforce / Operations | Applications / Operations / Today | — |
| `/workforce/operations/orders/` | … / Orders | … / Daily Operations / Orders | Section label vs URL |
| `/workforce/operations/orders/detail/` | … / Orders / Detail | … / Orders / {Order number} | Need order number when loaded |
| `/workforce/operations/delivery/` | … / Delivery | … / Daily Operations / Delivery | — |
| `/workforce/operations/status/` | … / Operational Status | … / Audit & System / Operational Status | — |
| `/workforce/operations/store/` | … / Store | … / Store Management / Overview | Preserve `outletId` |
| `…/availability/` | … / Store / Availability | … / Store Management / Availability | `outletId` |
| `…/assortment/` | … / Store / Assortment | … / Store Management / Assortment | `outletId` |
| `…/operating-status/` | … / Store / Operating Status | … / Store Management / Store Status | `outletId` |
| `…/hours/` | … / Store / Hours | … / Store Management / Store Hours | `outletId` |
| `…/hours/` (scheduling focus) | (same page) | … / Store Management / Scheduling | May be same route with hash/section until split |
| `…/serviceability/` | … / Store / Serviceability | … / Store Management / Delivery Area | `outletId` |
| `…/pickup-profile/` | … / Store / Pickup Profile | … / Store Management / Takeaway settings | `outletId` |
| `…/team/` | … / Store / Team | … / People & Access / Store Team | `outletId` |
| `…/team/access/` | … / Store / Team / Access | … / People & Access / Role Assignments | `outletId` |
| `/workforce/admin/` | **none** | Applications / Administration / Overview | — |
| `/workforce/admin/resources/` | **none** | … / Organization / Resources | — |
| `/workforce/admin/memberships/` | **none** | … / People & Access / Memberships | — |
| `/workforce/admin/memberships/detail/` | **none** | … / Memberships / {Member label} | Need label when loaded |
| `/workforce/admin/access/` | **none** | … / People & Access / Effective Permissions | — |
| `/workforce/admin/audit/` | **none** | … / Audit & System / Access Audit | — |
| `/workforce/admin/system/` | **none** | … / Audit & System / System Health | — |
| `/workforce/admin/commercial/` | **none** | … / Menu & Commercial / Commercial | Section tabs not in crumb until deep-link exists |

## Coverage

| Metric | Count |
|---|---|
| App Router pages | 24 |
| Operations pages with breadcrumbs | 14 |
| Administration pages without breadcrumbs | 8 (incl. Admin overview hub) |
| Candidate unresolved entity labels | Order number, membership label (async) |
| Candidate unresolved commercial section crumbs | Pending deep-link decision |

## Known crumb defects to fix in redesign

- Store breadcrumbs are **static** and **never** preserve `outletId` (sub-nav does)
- Order detail leaf is generic “Detail”
- Admin dual `PageHeader` titles (**P2-B-ADMIN**); Orders dual H1/nested main (**P1-B**)
