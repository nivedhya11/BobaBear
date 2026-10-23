<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Target navigation and feature placement

```text
IA_ID = WXE-IA-CANDIDATE-1
PRESENTATION_GROUPS_ARE_DOMAIN_AUTHORITIES = NO
```

## Proposed top-level presentation groups

| Section | Purpose | Shell home |
|---|---|---|
| **Dashboard** | Attention + application choice + overview | Hub / Today / Admin overview |
| **Daily Operations** | Orders, Delivery, Takeaway fulfilment actions | Operations |
| **Menu & Commercial** | Catalog, menu, assortment, pricing, offers, charges, review | Administration (Commercial) + store Availability/Assortment views |
| **Store Management** | Status, hours/scheduling, delivery area, takeaway profile | Operations Store |
| **People & Access** | Memberships, roles, effective permissions | Admin + Store Team |
| **Organization** | Brand / org / territory / legal entity / outlet resources | Administration Resources |
| **Audit & System** | Access audit, operational/system health | Admin Audit/System + Ops Status |

These groups organize **presentation**. Domain authorities (Order, Delivery, Catalog, Menu,
Assortment, Availability, Pricing, Access, etc.) remain unchanged.

## Authorization separation

| Rule | Candidate behaviour |
|---|---|
| Operations destination visible | Today: `order.read` only. Future least-privilege: also store coarse caps — **but landing must be first authorized Operations nav item**, never Today if Today will 403 |
| Administration destination visible | Existing org/access keys; **recommend** union commercial reads for future commercial-only principals (latent today for built-ins — see P1-ENTRY) |
| Commercial nav item | Show only when the principal can operate Commercial (not merely partial reads) — addresses P1-COMM / `outlet_manager` + missing `brand.read` |
| `delivery.read` alone | Insufficient for Operations destination if landing needs orders list |
| Cross-links | Allowed; never create a second authoritative editor |
| Unimplemented | Never listed (MFA enrolment UI, password reset UI, profile, date-exceptions UI, delivery return/cost UI, etc.) |

```text
ADMINISTRATION_ENTRY_ANY_OF (candidate) =
  existing ADMINISTRATION_ENTRY_PERMISSIONS
  UNION (catalog.read | menu.read | assortment.read | pricing.read |
         promotions.read | coupons.read)

OPERATIONS_LANDING =
  first authorized among: Today (order.read), Orders (order.read),
  Delivery (delivery.read + order.read practical), Store (store coarse caps),
  Operational Status (order.read)
```

Server authorization remains authoritative for every mutation.

## Navigation layers (collapse intent)

Operations today stacks: (1) shell SideNavigation, (2) `OperationsWorkspaceNav` tabs, (3) Store sub-nav.
Candidate: collapse to **one persistent section nav** on desktop; retain Store subsection list under Store Management; avoid triple redundant bars.

## Feature placement map

| Feature (shipped) | Canonical home (candidate) | Subsection | Notes |
|---|---|---|---|
| Applications hub | Dashboard | Applications | Keep |
| Today | Dashboard | Today | Keep under Operations |
| Orders list/detail | Daily Operations | Orders | Lifecycle actions primary |
| Delivery workspace + panel | Daily Operations | Delivery | P0-A field hygiene |
| Takeaway fulfilment actions | Daily Operations | Orders (detail) | Labels Takeaway; domain PICKUP |
| Refunds | Daily Operations | Order detail → Refunds | Not a top nav item |
| Notifications resend | Daily Operations | Order detail → Notifications | Not a top nav item |
| Operational Status | Audit & System | Operational Status | Link from System Health |
| Store overview | Store Management | Overview | |
| Availability | Menu & Commercial (ops) **or** Store Management → Availability | Prefer Store Management with cross-link from Commercial | One editor (store availability) |
| Assortment (store read) | Store Management → Assortment | Cross-link to Brand Assortment | Read-only at store |
| Brand Assortment editor | Menu & Commercial | Assortment | Admin commercial |
| Store Status | Store Management | Store Status | Rename from Operating Status |
| Store Hours | Store Management | Store Hours | |
| Scheduling (lead times) | Store Management | Scheduling | **Promote from buried Hours section** (P2-C) |
| Delivery Area | Store Management | Delivery Area | Rename Serviceability |
| Takeaway settings | Store Management | Takeaway settings | Rename Pickup Profile |
| Store Team | People & Access | Store Team | Outlet scope |
| Role Assignments (store) | People & Access | Store role assignments | |
| Memberships (admin) | People & Access | Memberships | |
| Membership detail | People & Access | Membership detail | Status + roles |
| Effective Permissions | People & Access | Effective Permissions | Read-only |
| Organization Resources | Organization | Resources | Align nav/H1 naming |
| Commercial Offering | Menu & Commercial | Products & Variants | |
| Menu layout/publication | Menu & Commercial | Menu | |
| Pricing | Menu & Commercial | Pricing | |
| Promotions & Coupons | Menu & Commercial | Offers | |
| Delivery Charges | Menu & Commercial | Delivery Charges | |
| Review / inspection | Menu & Commercial | Review | Relabel; not the publish button |
| Verify & diagnose | Menu & Commercial | Verification | |
| Commercial activity | Menu & Commercial | Activity | |
| Access audit | Audit & System | Access Audit | |
| System Health | Audit & System | System Health | |
| Admin overview | Dashboard / Organization | Overview | Add Commercial card when authorized |

## Nav structure (candidate desktop)

### Operations shell

```text
Dashboard
  Today
Daily Operations
  Orders
  Delivery
Store Management
  Overview
  Store Status
  Store Hours
  Scheduling          ← first-class
  Delivery Area
  Takeaway settings
  Availability
  Assortment (view)
People & Access
  Store Team
  Role Assignments
Audit & System
  Operational Status
```

### Administration shell

```text
Dashboard
  Overview
Organization
  Resources
Menu & Commercial
  Commercial Workspace (sections as today, better labels/deep-links later)
People & Access
  Memberships
  Effective Permissions
Audit & System
  Access Audit
  System Health
```

Cross-application: Applications · Operations · Administration (permission-filtered).

## Direct-link and history

- Preserve `orderId`, `membershipId`, `outletId`, commercial context query params
- Breadcrumb targets must preserve outlet context where applicable (current gap)
- Browser back/forward supported; no silent context drop on Store sub-nav vs breadcrumb mismatch
- Commercial section deep-linking is a follow-up enhancement (not required to invent new domain routes in V1)

## Duplicate authority prohibition

| Concern | Rule |
|---|---|
| Assortment | Brand effect only in Commercial Assortment editor; store page is view/escalation |
| Availability | Store Availability is canonical operational editor |
| Membership vs roles | Separate pages/actions as in Amendment A |
| Publish/effect | Lives in domain editors; Review is inspection-only |
