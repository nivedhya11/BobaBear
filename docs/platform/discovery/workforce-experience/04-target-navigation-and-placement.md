<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Target navigation and feature placement

```text
IA_ID = WXE-IA-CANDIDATE-1
PRESENTATION_GROUPS_ARE_DOMAIN_AUTHORITIES = NO
WXE_UPD_02 = A
WXE_UPD_03 = B
WXE_UPD_06 = YES
FOUNDER_GATE_RECORD = WXE-FOUNDER-PD-XD-GATE-RECORD-R3
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

**Founder-approved V1:** WXE-UPD-02 = **OPTION_A**; WXE-UPD-03 = **OPTION_B**; WXE-UPD-06 = **YES**.

| Rule | V1 binding behaviour |
|---|---|
| Operations destination visible | Least-privilege may include store coarse caps — **landing must be first authorized usable Operations nav item**, never Today if Today will 403 (**UPD-02 A**) |
| Administration destination visible | Existing org/access keys **union** commercial reads (P1-ENTRY) (**UPD-02 A**) |
| Commercial nav item | Show only when operable (P1-COMM); correct `outlet_manager` handling **without** assuming or granting `brand.read` (**UPD-02 A**) |
| Kitchen/Delivery Admin entry | **Preserve** existing `outlet.read` entry (**UPD-03 B**); do not narrow/revoke in WXE V1; preserve `role-destination-safety` |
| Unusable Commercial affordance | May be hidden/adjusted; must **not** silently revoke server permission or remove approved Administration entry |
| `delivery.read` alone | Insufficient for Operations destination if landing needs orders list |
| Cross-links | Allowed; never create a second authoritative editor |
| Unimplemented | Never listed (MFA enrolment UI, password reset UI, profile, date-exceptions UI, delivery return/cost UI, etc.) |
| Scheduling | First-class Store Management nav item (**UPD-06 YES**); reuse existing scheduling capabilities only |

```text
ADMINISTRATION_ENTRY_ANY_OF (V1 under UPD-02 A) =
  existing ADMINISTRATION_ENTRY_PERMISSIONS
  UNION (catalog.read | menu.read | assortment.read | pricing.read |
         promotions.read | coupons.read)

OPERATIONS_LANDING (V1 under UPD-02 A) =
  first authorized among: Today (order.read), Orders (order.read),
  Delivery (delivery.read + order.read practical), Store (store coarse caps),
  Operational Status (order.read)

PERMISSION_BOUNDARY =
  UPD-02 A does NOT grant new permissions, broaden server RBAC,
  authorize a new API, or invent a second Commercial authority.
  Escalate exact API/permission conflicts at Architecture Fit.
```

Server authorization remains authoritative for every mutation. Entry/routing changes remain
post-gate Architecture Fit / T1 IA ownership — never T0 / PR #427.
## Navigation layers (collapse intent)

| Slice | Content |
|---|---|
| **V1_ACCEPTANCE_SLICE** | Collapse Operations’ triple stack — (1) shell SideNavigation, (2) `OperationsWorkspaceNav` tabs, (3) Store sub-nav — to **one persistent section nav** on desktop; retain Store subsection list under Store Management |
| **FOLLOW_UP** | Micro-interaction polish after collapse (animation, density tweaks) — not a substitute for V1 chrome |

Scheduling appears as a **first-class** Store Management item in V1 (Founder **UPD-06 = YES**).

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
| Availability | Store Management → Availability | Cross-link from Commercial | One editor (store availability); **canonical home decided: Store Management** |
| Assortment (store read) | Store Management → Assortment | Cross-link to Brand Assortment | Read-only at store |
| Brand Assortment editor | Menu & Commercial | Assortment | Admin commercial |
| Store Status | Store Management | Store Status | Rename from Operating Status |
| Store Hours | Store Management | Store Hours | |
| Scheduling (lead times) | Store Management | Scheduling | **V1** promote from buried Hours section (P2-C); Founder **UPD-06 = YES** |
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
  Commercial Workspace (sections as today; labels in V1; deep-links FOLLOW_UP / UPD-07)
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
- Commercial section deep-linking is **FOLLOW_UP** / **WXE-UPD-07** (not required in V1; do not invent new domain routes)

## Duplicate authority prohibition

| Concern | Rule |
|---|---|
| Assortment | Brand effect only in Commercial Assortment editor; store page is view/escalation |
| Availability | Store Availability is canonical operational editor |
| Membership vs roles | Separate pages/actions as in Amendment A |
| Publish/effect | Lives in domain editors; Review is inspection-only |
