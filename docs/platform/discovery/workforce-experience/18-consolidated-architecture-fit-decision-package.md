<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  FIT_GRANT: NOT_GRANTED
  LOCK_GRANT: NOT_GRANTED
  OPTION_R: PRESERVED
-->

# Consolidated Architecture Fit decision package (F-1..F-7)

```text
PACKAGE_ID = WXE-FIT-DECISION-PACKAGE-1
PARENT = ARCH-WXE-FIT-CANDIDATE-1 (doc 10) + doc 17 §5
OPTION_R = PRESERVED (doc 16 ratified text; doc 17 ratification record)
COMPETING_COMMERCIAL_OPTION = NONE
DISPOSITION_STATUS = PREPARED_FOR_FOUNDER_DECISION
FOUNDER_FIT_DECISION = NOT_RECORDED
ARCHITECTURE_FIT = NOT_GRANTED
ARCHITECTURE_LOCK = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
APPLICATION_CODE_MUTATION = NO
UPD_08 = SEPARATE_CORRECTIVE — NOT_AUTHORIZED — NOT_CLOSED
PR_427 = UI_ONLY — NOT_SERVER_REMEDIATION — NOT_THIS_PACKAGE
```

This document packages the seven presentation Fit questions already stated in
[`17-option-r-founder-ratification-record-and-fit-decision-package.md`](./17-option-r-founder-ratification-record-and-fit-decision-package.md)
§5.1. It does not replace Option R, does not add an outlet-scoped Commercial option, and does
not record Architecture Fit PASS or Architecture Lock.

## 0. Pre-mutation alignment (Agent E)

```text
ALIGNMENT_GATE

Repository Authority: VERIFIED
Repository / Branch / HEAD: /home/ajoshi/repos/boba-bear-wave-c-wxe · docs/wxe-pd2-candidate · bc00c1302023feb429634c49b4fd87d75abff480
Vision Version: VISION-1
Roadmap Version: GTM-R190
State Version: STATE-R189
Architecture Version: ARCH-R23
Decision Register Version: DR-25
Product Delivery Version: PD-2
Product Definition: PD-WXE-CANDIDATE-1 (candidate). Historical Product Definition Gate PASS and Experience Gate PASS recorded at 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89. OPTION_R ratified and recorded (doc 17). FORMAL_NEW_PD_XD_GATE_PASS = NOT_GRANTED. POST_PASS_AMENDMENT_NOT_COVERED_BY_HISTORICAL_PASS = YES (doc 16).
Stories: Doc 02 §5 themes (Enter & orient, Fulfil today, Configure store, Author commercial & effect safely, Manage people & diagnose access, Audit & health). Story Definition of Ready remains deferred until IMP allocation (UPD-01).
Acceptance Scenarios: Representative set in doc 08, including AS-01, AS-13, AS-25, AS-26, AS-27. Not re-accepted by this package.
Golden Journeys: GJ-W1..GJ-W15 in doc 08. T1 relevance is GJ-W1, GJ-W4, GJ-W8. Not executed here.
Testing Policy: TEST-1
Accepted Through: IMP-036I
Current Product Slice: IMP-036J (pendingAcceptance; IMP036J_ACCEPTED = NO)
Task Slice: WXE-CANDIDATE-1 documentation on PR #426 (not an allocated IMP)
Task Capability: Workforce Experience presentation Architecture Fit decision package and planned T1–T4 work packages
Relevant Non-Goals: VISION §7 (not a marketplace; no speculative microservice platform; deferred capabilities not implemented opportunistically). WXE: no POS, KOT, counter billing, new order states, new RBAC, second Commercial authority, second label system.
Relevant ARCH-G Invariants: ARCH-G04 (customer and workforce trust distinct), ARCH-G08 (caller-supplied identifiers cannot manufacture authorization scope), ARCH-G11 (browser logic is not commercial/business truth), ARCH-G12 (deferred capabilities not introduced opportunistically), ARCH-G14 (no speculative services or duplicate commercial hierarchies), ARCH-G23 / D-372 (Operations API trust surface), ARCH-G25 / D-373 (Administration API; no new permissions or admin service), ARCH-G28 / D-378 (DELIVERY | PICKUP), ARCH-G29 / D-379 (ASAP | SCHEDULED; no new Order statuses).
Relevant Binding Decisions: D-372, D-373, D-378, D-379; ADR-003 / ADR-010 (Operations is not full POS); ADR-006 (catalog / assortment / availability separation); ADR-018 (DELIVERY | PICKUP domain). OPTION_R is a Founder Product/Experience amendment recorded in doc 17, not a new decision-register ID.
Task Assumptions: Option R hide semantics, UPD-02 A, UPD-03 B, UPD-06 YES, and UPD-09 UOE UX-A label ownership stay jointly in force. This package asks the Founder to dispose F-1..F-7; it does not treat that ask as a grant.
Deferred Capabilities Touched: None implemented. POS / KOT / new kitchen states remain PRODUCT_DECISION_REQUIRED and out of scope. UPD-08 delivery-proof / cancellation server gaps remain separately gated.
Semantic Scope: Markdown decision and work packages under docs/platform/discovery/workforce-experience/ on this branch only.
Conflicts: NONE identified between this documentation scope and ARCH-R23 presentation reuse. UPD-08 Gaps 1–3 remain an unresolved delivery-proof / cancellation concern (doc 10) and are excluded from any Fit grant in this package.
Unverified Material Facts: Whether the historical Experience Gate PASS plus OPTION_R ratification satisfies PD-2’s X2/X3 rule that Architecture Fit must not finally PASS without an Experience Gate PASS covering the amended scope. That choice is Founder-owned (DECISION_REQUIRED below). It is not assumed.
Risk Level: R2
DELIVERY_MODE: PUBLISH_PR
Gate Result: PASS
```

```text
DECISION_REQUIRED
question: May Architecture Fit be recorded PASS for the WXE presentation scope (F-1..F-7), and does the historical Experience Gate PASS plus OPTION_R ratification satisfy the PD-2 X2/X3 Experience Gate prerequisite for that Fit?
why_current_authority_is_insufficient: PD-2 forbids a final X2/X3 Architecture Fit PASS without Experience Gate PASS. Doc 16 records that the OPTION_R post-PASS amendment is not covered by the historical PASS, and that a new formal Gate PASS is Founder-owned. This agent must not choose that process fact or grant Fit.
option_a: Founder accepts F-1..F-7 as prepared below and records presentation Architecture Fit PASS, stating that historical Experience Gate PASS plus the recorded OPTION_R ratification is sufficient for that Fit. Lock, Design Readiness, Quality finalization, Measurement finalization, and Implementation Authorization stay separate.
option_b: Founder requires a new Experience Gate (or an amended Fit question) before any Architecture Fit PASS. Prepared packages stay PLANNED.
cursor_recommendation: Do not grant Fit or Lock in this package. Option A and Option B are both open. The prepared candidate is the joint F-1..F-7 set in §2, excluding UPD-08 journeys.
decision_owner: Human Founder
blocked_scope: Architecture Fit PASS, Architecture Lock, Design Readiness PASS, Quality/Measurement finalization, Implementation Authorization, application edits, IMP activation, UPD-08 server corrective, PR #427 modification, merge, deploy
work_continuing_elsewhere: Documentation packaging of the candidate dispositions and PLANNED T1–T4 work packages on PR #426
```

## 1. What is being decided together

The Founder is asked to dispose **one set**. Accepting one item while rejecting a paired item
reopens Option R. The set is presentation and navigation over accepted capabilities.

| ID | Subject | Prepared candidate (not granted) | Founder choice still open |
|---|---|---|---|
| F-1 | Brand-operable Commercial | Static predicate over the existing client effective-permission payload. Brand Commercial Workspace stays the brand-scoped IMP-036F/J workspace. ADR-006 stays intact. No outlet-scoped Commercial editor. | ACCEPT / REJECT / AMEND |
| F-2 | P1-ENTRY landing | `ADMINISTRATION_ENTRY_PERMISSIONS` stays semantically unchanged for V1. `brand.read` is already an entry key. Commercial-read keys without `brand.read` must not alone create an Administration destination. Operations landing stays first-usable and must not open Today when Today will 403. | ACCEPT / REJECT / AMEND |
| F-3 | UPD-03 B Kitchen/Delivery Admin entry | `outlet.read` Administration entry stays. Hiding Brand Commercial does not revoke or narrow that entry. | ACCEPT / REJECT / AMEND |
| F-4 | Operations destination predicate | Hub card when `order.read` or any `STORE_COARSE_NAV_PERMISSIONS` key is true. Hub href is Today only when `order.read` is true; otherwise Store. In-workspace Delivery stays `delivery.read` only. `delivery.read` alone does not show the hub card. | DEFINE_AT_FIT — ACCEPT / REJECT / AMEND |
| F-5 | First-class Scheduling | Store Management nav exposes existing scheduling. Reuse `StoreSchedulingProfileClient` and the existing scheduling-profile operations route. No new scheduling API, permission, or order state. | ACCEPT / REJECT / AMEND |
| F-6 | UOE-owned UX-A shared labels | UOE PR #424 UX-A remains the only shared Delivery/Takeaway and Now/Schedule label map. WXE consumes it after that contract is approved. WXE does not publish a second verb map. Option R navigation does not wait on UOE merge. | ACCEPT / REJECT / AMEND |
| F-7 | Synthetic role/permission test oracle | WXE-PF-01..12 and actors S1–S9 are the future acceptance oracle. Fixtures are test-only effective-permission maps. They do not create production roles or permissions. | ACCEPT / REJECT / AMEND |

## 2. Prepared dispositions

### F-1 — Brand-operable Commercial

```text
BRAND_OPERABLE_PREDICATE (static; union payload from getAdminSession) =
  (catalog.read | menu.read | assortment.read | pricing.read |
   promotions.read | coupons.read)
  AND brand.read
SHOW_BRAND_COMMERCIAL_NAV = predicate true
HIDE_BRAND_COMMERCIAL_NAV = predicate false
```

- Evaluated from the effective-permission payload already loaded for the signed-in principal.
  Source conformance (annex 23): `getAdminSession` calls `getEffectivePermissions` with no
  resource, so that payload is the union of permission keys across the principal’s grants.
  It has no active brand or outlet field. Absence of `brand.read` on that union makes the
  predicate false. A true per-active-scope show/hide (actor S9) is not available from this
  payload and is not part of the prepared F-1 grant. Server `adminListBrands` remains the
  brand-scope wall.
- A `brand.read` holder with an empty brand catalogue still sees navigation. Empty is not hidden.
- Direct `/workforce/admin/commercial/…` when hidden recovers by AS-27: Store Assortment when
  entitled in the active scope, otherwise the Applications hub. AS-13 remains the recovery when
  no relevant capabilities exist.
- Store Management, read-only Store Assortment, and the existing static escalation copy stay.
  No Brand Commercial cross-link is shown when Brand Commercial is hidden.
- Current shell fact this disposition would change later, if authorized: `AdministrationAppShell`
  shows Commercial when any commercial read is true (`hasCommercialRead`), without requiring
  `brand.read`. That is the presentation defect Option R closes. This package does not edit it.

### F-2 — P1-ENTRY landing

Brand-operable principals already enter Administration through `brand.read`, which is already in
`ADMINISTRATION_ENTRY_PERMISSIONS` (`src/lib/workforce-hub/destinations.ts`). The commercial-read
union from UPD-02 A stays nominal. It must not, by itself, create an Administration card or an
empty Administration shell for a principal who fails F-1.

Operations hub visibility today is `order.read` only. UPD-02 A still requires: when an Operations
destination is shown to a principal who cannot use Today, the landing is the first authorized
usable Operations item, never a Today 403.

### F-3 — UPD-03 B

`kitchen_operator`-like and `delivery_coordinator`-like fixtures that enter Administration through
`outlet.read` keep that entry (actors S5 and S6). Commercial hide is orthogonal. A sparse
Administration shell may remain. Narrowing that entry is not a V1 Fit disposition.

### F-4 — Operations destination predicate (candidate definition)

This is the exact hub predicate the Fit decision is asked to adopt. It keeps the in-workspace
item permissions already implemented in `OPERATIONS_NAV_ITEMS`. It does not add a landing
product and it does not change the Delivery item’s current `delivery.read` gate. Annex 23
records why an earlier draft of this block required `delivery.read` and `order.read` together:
that conjunction is not the current Delivery item rule, and it is not needed to keep a
store-only principal off Today.

```text
OPERATIONS_HUB_SHOWN =
  order.read
  OR any key in STORE_COARSE_NAV_PERMISSIONS
     (src/lib/operations/store-navigation.ts;
      the same keys are inlined on the Store item in
      src/lib/operations/navigation.ts and asserted equal by
      src/lib/operations/navigation.test.ts)

delivery.read alone does NOT show the Operations hub card.
That matches current hub behaviour and doc 04.

OPERATIONS_HUB_HREF (first match) =
  1. order.read → /workforce/operations/          (existing Today page)
  2. else any STORE_COARSE_NAV_PERMISSIONS
                → /workforce/operations/store/
  3. else no card

Never set the hub href to Today when order.read is absent.

IN_WORKSPACE_ITEMS stay OPERATIONS_NAV_ITEMS:
  Today, Orders, Operational Status  require order.read
  Delivery                           requires delivery.read only
  Store                              requires STORE_COARSE_NAV_PERMISSIONS
```

Current code still sets the hub card to `order.read` only and hard-codes the href to Today
(`src/lib/workforce-hub/destinations.ts`). S4 is therefore hidden from the card today, and a
direct visit to `/workforce/operations/` still mounts Today. WXE-PF-04 proves the hub href
above, not a change to the Delivery item permission.

### F-5 — Scheduling

Scheduling stays the existing outlet scheduling profile (lead times) already edited inside Store
Hours by `StoreSchedulingProfileClient` and `src/lib/operations/store.ts` against the existing
operations scheduling-profile route. V1 discoverability adds a Store Management navigation item
that opens that existing client. It does not add a scheduling authority, a slot engine, a
permission, or an Order status. `FULFILMENT_TIMING` remains ASAP | SCHEDULED under ARCH-G29.

### F-6 — Shared labels

Doc 06 and UPD-09 stand. The shared map is Delivery / Takeaway and Now / Schedule, with Takeaway
task verbs owned by UOE UX-A (`Prepare for collection`, `Ready for collection`, `Hand over order`).
WXE chrome may use the presentation-group names already in doc 04 (Daily Operations, Store
Management, Menu & Commercial). Those group names are not a fulfilment-verb map. Workforce code
must not become a second source of those verbs. Label application on order actions is T2 and waits
for UOE UX-A contract approval. It does not block F-1 navigation.

### F-7 — Synthetic test oracle

Actors S1–S9 in doc 16 §6 are capability fixtures. Proof rows WXE-PF-01..12 in doc 16 §7 are the
oracle. A future test may supply an in-memory effective-permission map. It must not insert a
production role, grant `brand.read`, or widen server RBAC (WXE-PF-09). WXE-PF-10 stays outside
this oracle’s execution: it records that Delivery Gaps 1–3 are UPD-08 and are not proved here.

| Proof | Holds the disposition | Execution in this package |
|---|---|---|
| WXE-PF-01 | F-1 show when commercial read and `brand.read` | PLANNED |
| WXE-PF-02, WXE-PF-06 | F-1 hide; F-2 no empty Admin from commercial reads alone | PLANNED |
| WXE-PF-03 | Store Assortment read-only; no cross-link when hidden | PLANNED |
| WXE-PF-04 | F-4 landing | PLANNED |
| WXE-PF-05 | F-3 Admin entry preserved | PLANNED |
| WXE-PF-07 | F-5 Scheduling discoverability | PLANNED |
| WXE-PF-08 | F-6 consume UOE UX-A; no second map | PLANNED (blocked on UX-A approval for assertion of final words) |
| WXE-PF-09 | Server denials unchanged | PLANNED as a negative regression only |
| WXE-PF-10 | UPD-08 excluded | NOT_IN_SCOPE |
| WXE-PF-11 | AS-27 direct-link recovery | PLANNED |
| WXE-PF-12 | Predicate follows the union payload already loaded; no per-outlet nav switch | PLANNED — limited by annex 23. A scope-keyed session projection is not authorized |

## 3. Excluded from any Fit outcome of this package

| Excluded | Status |
|---|---|
| Architecture Lock | NOT_GRANTED |
| X3 delivery-proof and cancellation journeys | UPD-08 Gaps 1–3 unresolved. Lock for those journeys stays BLOCKED. PR #427 does not close them. |
| Server RBAC, permission catalogue, `brand.read` grants | Forbidden |
| New Brand Commerce API, escalation lookup API, outlet-scoped Commercial API, scheduling API | Forbidden |
| POS, KOT, counter billing, new order states | Forbidden |
| Design Readiness PASS, Quality finalization, Measurement finalization | Separate; see doc 19 |
| Implementation Authorization, IMP identity, merge, deploy | NOT_GRANTED |

## 4. Relationship to later packages

| Package | Path | Status |
|---|---|---|
| T1 decision set and work package | [`19-t1-fit-design-quality-and-ia-work-package.md`](./19-t1-fit-design-quality-and-ia-work-package.md) | PLANNED |
| T2 daily Operations UI | [`20-t2-daily-operations-ui-work-package.md`](./20-t2-daily-operations-ui-work-package.md) | PLANNED |
| T3 Commercial UAT UX | [`21-t3-commercial-uat-ux-work-package.md`](./21-t3-commercial-uat-ux-work-package.md) | PLANNED |
| T4 People and accessibility | [`22-t4-people-accessibility-work-package.md`](./22-t4-people-accessibility-work-package.md) | PLANNED |

T1 implementation stays unauthorized until a human records the gates named in doc 19. T2–T4 stay
unauthorized until T1’s human gate exists and their own dependencies in those packages are met.
None of these files is an implementation.

## 5. Source-conformance binding

§0 above is the alignment recorded when this file was first packaged
(`bc00c1302023feb429634c49b4fd87d75abff480` on `docs/wxe-pd2-candidate`). Its Gate Result PASS
is that documentation alignment. It is not an Architecture Fit PASS. This closure does not
reuse that PASS as a Fit grant.

[`23-source-conformance-annex.md`](./23-source-conformance-annex.md) binds §2 to `origin/main`
`a6155378b799e06a95b28c593ac1a340d7ca9245`. Where §2 and that annex disagree, the annex is the
source fact and §2 as amended above is the prepared candidate. The Founder decision packet is
[`24-founder-architecture-fit-decision-packet.md`](./24-founder-architecture-fit-decision-packet.md).
This section does not record Architecture Fit PASS or Architecture Lock.
