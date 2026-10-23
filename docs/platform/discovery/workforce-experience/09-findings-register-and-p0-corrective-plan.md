<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Findings register and P0 corrective plan

```text
REGISTER_ID = WXE-FINDINGS-CANDIDATE-1
P0_PLAN_ID = WXE-P0-CORRECTIVE-1
APPLICATION_FIXES_IN_THIS_TASK = NO
INDEPENDENT_REVIEW = INCORPORATED
REFINEMENT = WXE-PD-XD-REFINEMENT-R2
```

Severity reassessment used source evidence at `BASE_MAIN_SHA` plus independent challenge.
Consequence marked **PROVEN** (code path) or **POSSIBLE** / **LATENT**.

### Slice legend (reconciled with PD §5)

| Finding | Slice |
|---|---|
| P0-A / `WXE-P0-CORRECTIVE-1` | **SEPARATE_CORRECTIVE** (PR #427) |
| Server Gaps 1–3 | **SEPARATE_CORRECTIVE** (not closed by UI) |
| P1-ENTRY / P1-COMM | **V1 or FOLLOW_UP** per Founder UPD-02 A/B |
| Kitchen/Delivery Admin entry | **V1 or FOLLOW_UP** per Founder UPD-03 A/B |
| P1-A / P1-B / P1-C | **V1_ACCEPTANCE_SLICE** |
| P2-C Scheduling nav | **V1_ACCEPTANCE_SLICE** (UPD-06 ratify) |
| P2-G store immediate-effect confirms | **FOLLOW_UP** |
| P2-E commercial deep-link semantics | **FOLLOW_UP** (UPD-07) |
| POS / new READY / unimplemented return-cost UI | **OUT_OF_SCOPE** |

---

## P0-A — Delivery operational evidence: UAT prefills, one-click terminal commands, workspace filter

| Field | Value |
|---|---|
| ID | WXE-P0-A |
| Source | `OperationsDeliveryPanel.tsx` initializers; resolve paths hard-code `inactiveBookingConfirmed: true`; Report failure / Cancel delivery send hidden prefilled codes with **no inputs and no confirmation**; `OperationsDeliveryWorkspaceClient` lists ACCEPTED orders **without** fulfilment-mode filter and auto-selects first order |
| Prefill set (incomplete if only four cited) | `providerLabel=dehradun-courier`, `trackingUrl=https://track.example.com/uat`, `assignmentKey=rider-uat-1`, `handoffReference=pickup-uat-1`, `proofReference=proof-uat-1`, `failureCode/Reason=NO_BOOKING` / `Courier unavailable`, `cancellationCode/Reason=COURIER_CANCEL` / `External booking cancelled` |
| User journey | Delivery workspace or Delivery order detail → booking / assign / pickup / deliver / fail / cancel |
| Consequence | **PROVEN**: defaults and hidden codes are server-acceptable; one-click can persist fabricated references, advance/fail/cancel delivery, notify customers. Takeaway (`PICKUP`) orders can appear in Delivery workspace; panel actions fail closed server-side → operator dead-end. Queue truncates at 50 (`nextCursor` ignored) |
| Contract tension | IMP-032 capability text (§13.2 class) says confirmation must not treat arbitrary free text as sufficient proof; server parsers currently accept non-empty strings. UI empty-defaults alone do **not** fully satisfy that accepted wording → Architecture Fit notes possible `STATE_CODE_CONFLICT` for deeper fix (**ESCALATE_FOUNDER**) |
| Required behaviour | No fabricated prefills; required refs empty until entered; explicit attestation for resolve; confirmation for terminal commands (deliver / fail / cancel); Delivery workspace excludes Takeaway or suppresses delivery panel; pagination or explicit “showing N of …” |
| Minimal safe correction (UI tranche) | Clear all UAT defaults; gate submits; checkbox attestation; confirm dialogs for terminal commands; filter `fulfilmentMode !== PICKUP` (or equivalent) in workspace; show mode/timing in queue; tests |
| Optional deeper correction | Server-side proof policy hardening per IMP-032 — **separate decision**, not silent in hotfix |
| Backend/permission | Preserve delivery commands and permissions; no new lifecycle states |
| Regression | Full delivery command matrix; Takeaway orders absent or non-actionable in Delivery workspace; order-detail still hides panel for Takeaway |
| Implementation boundary | **R2** UI/workspace hygiene + tests; server proof policy = Founder/architecture if pursued |
| Priority | **SEPARATE_CORRECTIVE** before comprehensive UX redesign (`WXE-P0-CORRECTIVE-1`) |
| Publication status (verified checkpoint) | Founder-authorized; **published on PR #427**; independently reviewed; **not merged, not deployed, not formally accepted**. Do **not** say “already shipped.” |

---

## Server conformance gaps (PR #427 documentation — UI does not close)

Incorporated from PR #427 `WXE-P0-CORRECTIVE-1-server-conformance-gaps.md` as read-only supporting
evidence. No server mutation or IMP-032 acceptance rewrite is authorized by WXE documentation.

| Gap | Verified server behaviour | Potential consequence | Client mitigation (PR #427) | Remains unproven / open | Required decision |
|---|---|---|---|---|---|
| **Gap 1** — Arbitrary non-empty proof reference | `parseRecordProofAndDeliverInput` accepts non-empty `proofReference` within length bounds | Contract tension with IMP-032 wording that confirmation must not treat arbitrary free text as sufficient proof | Empty defaults; required field; consequence review; operator-entered disclaimer | Whether production clients have abused free-text proof; whether server policy must change | Founder / architecture (**WXE-UPD-08**); possible CR3 |
| **Gap 2** — Cancel path auto inactivity attestation | For some non-`REQUESTED` cancels, `workforceCancelDelivery` injects `inactiveBookingConfirmed: true` server-side | Operator attestation bypass on cancel relative to resolve-cancellation’s explicit flag requirement | Cancel still requires codes/reasons + consequence review; resolve UI no longer hard-codes attestation | Full production exploitability not claimed; behavioural gap is documented | Separate server corrective; not T0 UI ownership |
| **Gap 3** — URL `orderId` vs body `deliveryId` | Several workforce delivery commands use body `deliveryId` without explicit HTTP façade path↔body Order ownership bind (`arrange`/GET differ) | Potential identity-integrity / audit-coherence mismatch if a crafted client posts mismatched identities; **not claimed as an exploited vulnerability** without proof | Panel binds to selected Order + loaded Delivery; resets on identity change; drops stale async/confirm payloads | End-to-end authorization bypass **not proven**; domain `authorizeForDelivery` may still scope by delivery row | Founder / security / architecture before server bind change |

**Explicit non-claims:** UI corrective does not provide verified external-provider evidence; does not
harden server proof acceptance; does not remove cancel auto-attestation; does not add server-side
URL/body binding. Gaps are **not** resolved by the UI corrective.

---

## P1-ENTRY — Administration / Operations entry discoverability (was P0-B; downgraded)

| Field | Value |
|---|---|
| ID | WXE-P1-ENTRY (formerly WXE-P0-B) |
| Source | `destinations.ts` Administration entry omits commercial reads; Operations hub destination is `order.read` only and lands on Today |
| Built-in reachability | **LATENT / not reachable via current seeded roles**: every built-in role with commercial reads also holds an Administration entry key; every built-in with store caps holds `order.read`. Role permissions are migration-seeded; no separate runtime custom-role grant surface was found in source |
| Still real defects | (1) Entry lists are **incorrect for least-privilege design** if commercial-only or store-without-order grants are ever introduced. (2) `outlet_manager` **does** see Commercial nav (assortment/pricing/promo reads) but brand list requires `brand.read` → likely unusable Commercial landing (**P1-COMM**). (3) Widening Operations entry to land on Today without `order.read` would create a new Today error — any fix must resolve **first authorized Operations nav item** as landing |
| Kitchen/Delivery Admin entry | `kitchen_operator` / `delivery_coordinator` enter Administration via `outlet.read`; kitchen also sees Commercial nav via `assortment.read`. Narrowing conflicts with `role-destination-safety.test.ts` → **WXE-UPD-03** |
| `delivery.read` in Operations union | Not sufficient alone: Delivery workspace uses orders list (`order.read`). Document explicitly |
| Required behaviour | Entry lists future-proofed; landings resolve to first usable surface; do not list destinations the principal cannot operate |
| Minimal correction | Prefer **IA/routing tranche (T1 planning)** — never T0 P0: add commercial keys to Admin entry under UPD-02 **A**; for Operations, if expanding, change default href resolution + Today gate messaging; add capability-fixture tests (not “custom role” claims). Under UPD-02 **B**, preserve current entry and defer |
| Priority | **Not** in `WXE-P0-CORRECTIVE-1` / T0 risk ownership; Founder UPD-02 A/B; track with T1 IA proposal only |

---

## P1-COMM — Outlet manager Commercial nav without usable brand context

| Field | Value |
|---|---|
| ID | WXE-P1-COMM |
| Source | Commercial nav gated on commercial reads; `CommercialWorkspaceClient` loads brands via `listAdminBrands()` requiring `brand.read`; `outlet_manager` lacks `brand.read` |
| Consequence | **INFERRED/PROVEN structure**: Commercial appears but brand load fails → violates “no false empty / unusable destination” |
| Required | Hide Commercial until operable **or** provide outlet-scoped commercial entry that does not require brand list |
| Boundary | R2 | Priority | P1 with IA/commercial tranche |

---

## P1-A — Order lifecycle actions below secondary panels (+ permission-blind buttons)

| Field | Value |
|---|---|
| ID | WXE-P1-A |
| Source | `OperationsOrderDetailClient.tsx` render order; `eligibleActions(status)` ignores session `order.accept|fulfil|cancel` |
| Journey | Busy Accept/Fulfil/Cancel; delivery_coordinator may see Accept/Cancel buttons server will deny; kitchen may see Cancel |
| Consequence | **PROVEN UX** placement; **PROVEN** permission-blind affordances (server still denies) |
| Required | (Precondition) Gate buttons by session capabilities **and** status; then place lifecycle actions by fulfilment mode: for active lifecycle, near summary; Delivery panel high for Delivery mode; Takeaway verification high for Takeaway |
| Minimal correction | Capability-gate actions; reorder per mode; do not promote denied buttons above the fold |
| Boundary | R2 |

## P1-B — Dual H1 / nested `<main>` on Orders surfaces (raised from Admin-only P2-B)

| Field | Value |
|---|---|
| ID | WXE-P1-B |
| Source | Orders list + Order detail: page `PageHeader` H1 plus client H1; nested `<main id="main-content">` inside shell main |
| Consequence | **PROVEN** a11y defect (duplicate landmarks/IDs) |
| Required | Single H1; single main landmark |
| Boundary | R1 | Note | Administration dual titles remain **P2-B-ADMIN** |

## P1-C — Menu section/entry activate/retire without consequence review

| Field | Value |
|---|---|
| ID | WXE-P1-C |
| Source | `MenuEditor` direct API activate/retire; publish uses `ConsequenceReviewDialog` |
| Rationale correction | Section/entry retire is draft mutation applied at next publish; retire is **terminal/irreversible** in lifecycle — not necessarily an immediate customer-visible effect |
| Required | Consequence review before terminal retire/activate of section/entry |
| Boundary | R2 |

## P1-D — Review tab label (downgraded from former P1-B)

| Field | Value |
|---|---|
| ID | WXE-P1-D |
| Source | Tab “Review & publish/effect” → read-only inspection; Alert already points to domain editors |
| Consequence | Tab **label** misleads; body already redirects |
| Required | Relabel to Review (draft vs live) |
| Severity | P2-equivalent label fix; keep as P1-D only if Founder wants label in same tranche as commercial UX | Default disposition | **P2** |

---

## P2 findings

| ID | Summary | Notes |
|---|---|---|
| WXE-P2-A | Narrow order cards omit timing | Desktop-first; keep accessible fallback |
| WXE-P2-B-ADMIN | Duplicate Admin titles (Resources/Memberships/Audit) | Single H1 alignment |
| WXE-P2-C | Scheduling buried under Hours | First-class Scheduling |
| WXE-P2-D | Review tab label | Former commercial P1-B |
| WXE-P2-E | Commercial tabs use `aria-current="page"` on buttons | Tab semantics or deep links |
| WXE-P2-F | `OperationsWorkspaceNav` null while loading | Layout shift |
| WXE-P2-G | Store settings with immediate customer effect lack confirmation | Delivery Area, Takeaway profile, Hours, Scheduling — classify protective vs accidental friction |
| WXE-P2-ENTRY | Latent entry-list hardening | Former P0-B built-in-unreachable case |

---

# WXE-P0-CORRECTIVE-1 — Separate corrective plan (P0-A only)

**Goal:** Fix delivery evidence / workspace safety without waiting for full Workforce UX redesign.

```text
IMPLEMENTATION_AUTHORIZED_BY_THIS_PACKAGE = NO
FOUNDER_AUTHORIZATION_FOR_PR_427 = YES (implementation + publication; recorded on PR #427)
PR_427_STATUS = OPEN_UNMERGED (not deployed; not formally accepted)
MERGE_DEPLOY_AUTHORIZED = NO
MAY_PRECEDE_FULL_WXE_REDESIGN = YES
FORMAL_IMP_IDENTITY = NOT_REQUIRED_FOR_HOTFIX (Founder may still assign)
SERVER_GAPS_CLOSED_BY_UI = NO
```

## Controlled exception record (PD-2 candidate)

| Field | Value |
|---|---|
| Type | Defect corrective / operator-safety |
| Reason | Fabricated delivery evidence and one-click terminal commands in production UI |
| Skipped gates | Full Product/Experience Gate for WXE redesign; IMP allocation |
| Human authority required | Founder |
| Authorization status | **Prior Founder authorization** covers PR #427 implementation/publication; **merge and deploy remain unapproved** |
| Minimum proof | Unit/component tests for empty defaults, attestation, terminal confirm, Takeaway filter; exact-head CI |
| Rollback | Revert hotfix PR |
| Reconciliation | Note in acceptance/evidence when Founder UAT next touches delivery; do not rewrite IMP-032 acceptance silently |
| Out of exception | Server Gaps 1–3 / IMP-032 proof-policy, cancel auto-attestation, URL/body bind (needs explicit decision — UPD-08) |

### MAY MODIFY (when authorized)

- `OperationsDeliveryPanel.tsx` (+ tests)
- `OperationsDeliveryWorkspaceClient.tsx` (+ tests)
- Related delivery lib only if required for filter/pagination display

### MUST NOT MODIFY

- New delivery/order lifecycle states; POS; ROADMAP/STATE; UOE package; full IA redesign; Administration entry unions (unless Founder elevates P1-ENTRY into hotfix)

## Exit criteria

- No UAT fabricated strings as React initial state for provider/tracking/assignment/handoff/proof/failure/cancel fields
- Terminal deliver/fail/cancel require confirmation
- Resolve actions require explicit attestation (not hard-coded `true`)
- Delivery workspace does not present actionable delivery panel for Takeaway orders
- Exact-head CI green

## Risk

| Risk | Mitigation |
|---|---|
| Operators relied on UAT defaults | Release note; force conscious entry |
| Empty-field gating blocks legit ops | Clear required-field messaging |
| IMP-032 / Gaps 1–3 deeper conflict | Escalate UPD-08; do not claim UI hotfix closes server gaps |
| Administration entry / kitchen routing | **Out of T0** — owned by UPD-02/03 + T1 IA proposal only |
