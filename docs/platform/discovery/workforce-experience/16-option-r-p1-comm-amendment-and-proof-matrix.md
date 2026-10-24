<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# OPTION_R — P1-COMM scope amendment + role/API proof matrix

```text
AMENDMENT_ID = WXE-OPTION-R-P1-COMM-AMENDMENT-1
PACKAGE = WXE-CANDIDATE-1
TASK = WXE-OPTION-R-FIT-REFINEMENT-R2
FOUNDER_DECISION_STATUS = APPROVED_IN_WAVE_CONTRACT — PENDING_PACKAGE_RATIFICATION_RECORD
FORMAL_NEW_PD_XD_GATE_PASS = NOT_GRANTED
FORMAL_ARCHITECTURE_FIT_OR_LOCK = NOT_GRANTED
APPLICATION_CODE_MUTATION = NO
WXE_DELIVERY_SERVER_REMEDIATION = NOT_AUTHORIZED
POST_PASS_AMENDMENT = YES (not covered by historical PD/XD PASS @ 560048ffc…)
```

## 1. Purpose

Record the Founder-approved **`WXE-P1-COMM = OPTION_R`** refinement as a **bounded Product /
Experience scope amendment** and reconcile Architecture Fit proposal wording, least-privilege
synthetic actor scenarios, and the role/API proof matrix.

This document does **not** grant a new Product Definition Gate PASS, Experience Gate PASS,
Architecture Fit, Architecture Lock, Implementation Authorization, merge, or deploy.

Historical Founder PD/XD Gate PASS at reviewed contract HEAD
`560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89` remains preserved history in
[`15-gate-disposition-founder-decision-record.md`](./15-gate-disposition-founder-decision-record.md).
OPTION_R text is a **post-PASS amendment** — not covered by that historical PASS.

## 2. Founder-approved decision (binding intent)

```text
WXE-P1-COMM = OPTION_R
```

| Clause | Binding meaning |
|---|---|
| Brand Commercial Workspace scope | Remains **brand-scoped** Administration Commercial authoring |
| Outlet roles without sufficient brand authority | **Remove** misleading / unusable Commercial navigation |
| Preserve | Genuine Store-level operations, **read-only** store Assortment, and brand-escalation paths |
| Forbidden | Inventing `brand.read`; pretending Store functions are Brand Commercial authoring |
| Relationship to UPD-02 A | **Refines** P1-COMM operability; reconciles Admin entry union (§3); does **not** repeal Ops first-usable landing |
| Relationship to UPD-03 B | Compatible — hide unusable Commercial **without** revoking Kitchen/Delivery Administration entry |
| Server authorization | Unchanged; presentation/nav only |

### Rejected alternative (historical open wording)

Prior P1-COMM drafting allowed “hide **or** provide outlet-scoped commercial entry”. **OPTION_R
selects hide** for Brand Commercial Workspace when brand authority is insufficient. Outlet-scoped
surfaces that already exist (Store Assortment view, Availability, Store ops) remain Store-owned —
they are **not** rebranded as Brand Commercial Workspace.

## 3. Compatibility matrix (must remain jointly true)

| Decision | Status after OPTION_R | Notes |
|---|---|---|
| UPD-02 **A** — Admin entry union (P1-ENTRY) | **Retained + reconciled** | See P1-ENTRY × OPTION_R below. **Net V1 effect under OPTION_R:** Administration entry keys are unchanged in practice (brand-operable principals already enter via `brand.read`); the commercial-read union is retained as nominal/future-proofing and must not alone create Admin for non-brand-operable principals |
| UPD-02 **A** — Ops first usable landing | **Retained** | Never land on Today if Today will 403 |
| UPD-02 **A** — P1-COMM open “operable Commercial” | **Refined by OPTION_R** | Static brand-operable predicate (§4) |
| UPD-03 **B** — Kitchen/Delivery Admin via `outlet.read` | **Retained** | Hide Commercial ≠ revoke Admin entry (sparse Admin shell may remain) |
| UPD-06 **YES** — Scheduling first-class nav | **Retained** | Store Management; reuse existing scheduling only |
| UPD-09 — UOE shared labels | **Retained** | UOE UX-A owns map; WXE consumes (PR #424 sequencing) |
| UPD-08 — Server Gaps 1–3 | **Unchanged / SEPARATE** | No Architecture Lock for affected X3 delivery-proof/cancel journeys without security disposition |

### P1-ENTRY × OPTION_R reconciliation (binding interpretation for ratification)

```text
PURPOSE OF COMMERCIAL-READ UNION (UPD-02 A):
  Ensure principals who can operate Brand Commercial Workspace are not
  blocked from Administration solely because commercial keys were omitted
  from ADMINISTRATION_ENTRY_PERMISSIONS.

OPTION_R FACT (inventory-backed):
  Brand Commercial Workspace brand-list path requires brand.read
  (listAdminBrands). brand.read is already in ADMINISTRATION_ENTRY_PERMISSIONS.

THEREFORE (no new permission invented):
  - Brand-operable commercial principals already satisfy Admin entry via brand.read.
  - Commercial-read keys WITHOUT brand.read must NOT alone create an Administration
    destination whose only commercial purpose OPTION_R would hide (no empty Admin shell).
  - Built-in outlet / kitchen / delivery Admin entry continues via existing keys
    (e.g. outlet.read) per UPD-03 B — Commercial hide is orthogonal.
```

## 4. P1-COMM operability semantics (OPTION_R)

```text
BRAND_COMMERCIAL_WORKSPACE =
  Administration → Menu & Commercial → Brand Commercial Workspace
  (brand-scoped IMP-036F/J reuse)

BRAND_OPERABLE_PREDICATE (static; V1 test oracle) =
  effective permissions for the **active brand/outlet scope** include:
    (catalog.read | menu.read | assortment.read | pricing.read |
     promotions.read | coupons.read)
  AND brand.read (in that active scope)
  — NOT a runtime brand-list probe
  — does NOT grant brand.read; absence → predicate false
  — a legitimately empty brand catalogue for a brand.read holder still shows nav
    (empty list ≠ hide); hide is for missing brand.read / insufficient brand authority

SHOW_BRAND_COMMERCIAL_NAV = BRAND_OPERABLE_PREDICATE
HIDE_BRAND_COMMERCIAL_NAV = NOT BRAND_OPERABLE_PREDICATE

DIRECT_LINK_OR_RETURN_TO (/workforce/admin/commercial/…) when HIDE:
  Must not render the broken brand-list Commercial landing.
  Deterministic recovery (AS-27): Store Assortment if entitled in active scope;
  otherwise Applications hub.
  Tie-break vs AS-13: use AS-27 when the principal has commercial reads (or other
  relevant caps) but is not brand-operable; use AS-13 only when no relevant caps.

STORE_ASSORTMENT_ESCALATION:
  Existing static escalation copy only (inventory row 10).
  No navigational cross-link to Brand Assortment / Brand Commercial for principals
  for whom Brand Commercial nav is hidden. No new lookup API.

PRESERVE_ALWAYS =
  Store Management ops; Store Assortment (read-only); static escalation copy;
  UPD-03 B Administration entry; server RBAC tables
```

**Do not:**

- Grant or assume `brand.read` for outlet roles
- Create a second Commercial authority or outlet-scoped “Brand Commercial” authoring shell
- Relabel Store Assortment / Availability as Brand Commercial Workspace
- Silently revoke `outlet.read`-based Administration entry while hiding Commercial
- Create Administration destination solely from commercial reads when Brand Commercial is hidden

## 5. GJ-W8 role / scoping amendment

| Aspect | Prior wording (history) | OPTION_R wording |
|---|---|---|
| Journey title | Commercial-only operator reaches Commercial Workspace | **Brand-operable commercial operator** reaches **Brand** Commercial Workspace |
| Success actor | Ambiguous “commercial-only” | Principal satisfying **BRAND_OPERABLE_PREDICATE** (§4) |
| Outlet-without-brand actor | Implied under “operable Commercial” | **Must not** be led into Brand Commercial (nav hide + AS-27); Store Assortment + static escalation |
| AS linkage | AS-01 | AS-01 + **AS-25** + **AS-26** + **AS-27** |

## 6. Least-privilege synthetic actor scenarios

Capability fixtures (not invented catalog roles). Expected V1 presentation under OPTION_R + UPD-02 A + UPD-03 B:

| Synthetic actor | Caps / scope (fixture intent) | Administration entry | Brand Commercial nav | Ops landing | Store Assortment / ops | Notes |
|---|---|---|---|---|---|---|
| S1 Brand-operable commercial | Commercial reads **+** `brand.read` | YES (via `brand.read` already in Admin entry keys) | **YES** | N/A or per other caps | N/A | GJ-W8 success |
| S2 Commercial reads **without** `brand.read` | Outlet-scoped commercial reads only; no other Admin entry keys | **NO** (must not create empty Admin shell) | **HIDE** | Per other caps | Preserve store read + static escalation if entitled | OPTION_R × P1-ENTRY |
| S3 `outlet_manager`-like | Store coarse + commercial reads; no `brand.read` | YES via existing store/org keys | **HIDE** | First usable Ops/Store item | Preserve + static escalation | P1-COMM |
| S4 Store without `order.read` | Store caps; may lack Ops hub `order.read` | Per existing Admin keys | HIDE if not brand-operable | If Ops shown: first usable Store/Ops item — **never Today 403**; if Ops not shown: no Ops card | Preserve | UPD-02 A |
| S5 `kitchen_operator`-like | `outlet.read` + often `assortment.read` | **Preserve** (UPD-03 B) | **HIDE** | Ops per caps | Assortment + static escalation if entitled | Hide ≠ revoke Admin |
| S6 `delivery_coordinator`-like | `outlet.read` + delivery/order as today | **Preserve** (UPD-03 B) | **HIDE** (often vacuous — Commercial nav typically absent today) | Ops per caps | N/A | UPD-03 B |
| S7 No relevant caps deep link | No commercial / admin caps | No | No | AccessDenied → Applications | — | AS-13 |
| S8 Hidden-Commercial deep link / return-to | Commercial reads without `brand.read` | Per S2/S3/S5 | HIDE | — | — | AS-27 |
| S9 Mixed brand/outlet scope | Brand-operable in brand A; outlet-only in outlet B | Per effective scope | Show only when active scope is brand-operable | Per caps | Preserve outlet Store surfaces | Per-scope hide |

## 7. Role / API proof matrix (candidate — presentation only)

Proofs are for a **future authorized implementation**. This amendment does not execute them.

| Proof ID | Actor / fixture | Surface / API observation | Expected presentation | Must not |
|---|---|---|---|---|
| WXE-PF-01 | S1 | Commercial read + `brand.read`; Admin entry resolves | Administration + Brand Commercial nav visible; workspace operable | Invent permissions |
| WXE-PF-02 | S2 / S3 | Effective perms lack `brand.read` | Brand Commercial nav **absent** (static predicate) | Grant `brand.read`; outlet-scoped Brand Commercial shell |
| WXE-PF-03 | S3 / S5 | Store Assortment authorized | Read-only assortment + **static** escalation; **no** Brand Commercial cross-link when hidden | Store-as-Brand-Commercial; invent escalation API |
| WXE-PF-04 | S4 | Ops destination visibility vs landing | If Ops shown without `order.read`: first usable Store/Ops item; never Today 403 | Today landing when Today 403s |
| WXE-PF-05 | S5 / S6 | Admin entry via `outlet.read` | Administration remains; Commercial may be hidden | Revoke Admin entry via Commercial hide |
| WXE-PF-06 | S1 vs S2 | Same commercial-read keys, ± `brand.read` | S1: Admin + Commercial; S2: **no** Admin from commercial reads alone; Commercial hidden | Empty Admin shell from commercial-read union |
| WXE-PF-07 | Scheduling entitled store actor | Store Management → Scheduling | First-class Scheduling (UPD-06) | New scheduling API/authority |
| WXE-PF-08 | Takeaway / timing labels | Workforce chrome consuming UOE UX-A | Labels follow UOE map when approved | WXE-owned competing verb map |
| WXE-PF-09 | Server authz regression | Mutation APIs | Existing denials preserved | Broaden server RBAC |
| WXE-PF-10 | Delivery Gaps 1–3 | Proof/cancel server paths | Out of this amendment; UPD-08 | Architecture Lock without security disposition |
| WXE-PF-11 | S8 | Direct `/workforce/admin/commercial/` while not brand-operable | Honest recovery (AS-27); no broken brand-list UX | Treat as success; invent brand.read |
| WXE-PF-12 | S9 | Scope switch brand A ↔ outlet B | Commercial nav follows predicate for active scope | Global sticky show/hide ignoring scope |

## 8. Architecture Fit proposal reconciliation (candidate only)

| Fit topic | Proposal under OPTION_R |
|---|---|
| Presentation / nav | Static Brand Commercial gating + Admin entry reconciliation per §3–§7; reuse shells/APIs |
| Brand Commercial authority | **No change** — remains brand-scoped IMP-036F/J workspace |
| Store Assortment / Availability | Preserve ADR-006; store = view + static escalation; no Brand Commercial cross-link when hidden |
| Permission tables / APIs | **No WXE grant**; escalate true API conflicts — do not invent `brand.read` |
| UPD-08 Gaps 1–3 | Separately governed; presentation Fit may proceed for non-delivery-proof surfaces; **no Architecture Lock** for affected X3 delivery-proof/cancellation journeys without security disposition |
| Fit / Lock status | **NOT_GRANTED** |

## 9. UOE shared-label ownership and sequencing

| Rule | Binding |
|---|---|
| Owner | UOE package PR #424 UX-A owns shared Delivery/Takeaway + Now/Schedule label map |
| WXE | Consumes only; no forked workforce verb map |
| Sequencing | WXE V1 label application depends on UOE UX-A contract approval; do not block OPTION_R nav semantics on UOE merge |
| Out of scope here | Customer UOE surfaces; WhatsApp templates; Checkout composition |

## 10. Gate / ratification packaging

```text
HISTORICAL_FOUNDER_PD_GATE_PASS = RECORDED @ 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
HISTORICAL_FOUNDER_XD_GATE_PASS = RECORDED @ 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
OPTION_R_SCOPE_AMENDMENT = PROPOSED_FOR_FOUNDER_RATIFICATION_RECORD
POST_PASS_AMENDMENT_NOT_COVERED_BY_HISTORICAL_PASS = YES
FORMAL_NEW_PD_XD_GATE_PASS = NOT_GRANTED
FORMAL_ARCHITECTURE_FIT_OR_LOCK = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
```

### Founder decision request (consolidated)

1. **Ratify** `WXE-P1-COMM = OPTION_R` as recorded in §2–§4 (brand-scoped Commercial; static `brand.read`+commercial-read operability predicate; hide when not brand-operable; preserve Store ops / read-only assortment / static escalation; no invented `brand.read`).
2. **Confirm** P1-ENTRY × OPTION_R reconciliation (§3): commercial-read keys without `brand.read` must not alone create an empty Administration shell; Ops landing + UPD-03 B + UPD-06 + UPD-09 unchanged.
3. **Confirm** amended GJ-W8 / AS-25…27 + proof matrix (§5–§7) as the V1 Product/Experience interpretation for P1-COMM.
4. **Do not** grant Architecture Fit/Lock, Implementation Authorization, #426 merge, #427 merge/deploy, or UPD-08 risk acceptance in this sitting unless separately decided.
5. After ratification record: treat amended PD/XD clauses as in-force candidate scope; a **new** formal Gate PASS is optional/Founder-owned — agents must not self-grant `FORMAL_NEW_PD_XD_GATE_PASS`.

## 11. Explicit non-mutations

- No Workforce application implementation
- No Delivery server Gap 1–3 remediation
- No edits to ROADMAP / STATE / decision-register / UOE #424 / corrective #427 application scope
- No silent `brand.read` grant and no second Commercial authority
