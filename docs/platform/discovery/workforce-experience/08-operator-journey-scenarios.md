<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# End-to-end operator journey scenarios

```text
JOURNEY_ID = WXE-JRN-CANDIDATE-1
AS_PREFIX = WXE-AS
REFINEMENT = WXE-PD-XD-REFINEMENT-R2
```

Traceability rule: journey → activity → acceptance scenario. New redundant IDs are avoided when
direct AS linkage is sufficient. Journeys **reuse accepted business rules**; they do not invent
refund entitlements, kitchen states, booking retry UI, role permissions, session guarantees, or
payment behaviour.

## Golden journeys (candidate)

| ID | Journey | Criticality | Primary section | Spec depth |
|---|---|---|---|---|
| GJ-W1 | Start of shift → Today → accept/fulfil orders | X2 | Dashboard / Daily Operations | AS-03 + ops matrix |
| GJ-W2 | Delivery order → book/assign/handoff/proof without fabricated defaults | X3 | Daily Operations | AS-04; P0-A |
| GJ-W3 | Takeaway order → verify → hand over (prepare off-system; no READY state) | X2 | Daily Operations | AS-05 |
| GJ-W4 | Pause store / edit hours / scheduling lead times | X2 | Store Management | AS-11, AS-14 |
| GJ-W5 | Mark variant sold out; confirm assortment is separate | X2 | Store / Commercial | Theme story |
| GJ-W6 | Publish menu or activate price/promotion with review | X3 | Menu & Commercial | **Expanded** |
| GJ-W7 | Membership create; role grant/revoke; effective-permission diagnosis | X3 | People & Access | **Expanded** |
| GJ-W8 | Commercial-only operator reaches Commercial Workspace | X2 | Entry / Menu & Commercial | AS-01; UPD-02 |
| GJ-W9 | Refund captured payment with step-up | X3 | Order detail | **Expanded** |
| GJ-W10 | Inspect access audit and system health | X1/X2 | Audit & System | Theme story |
| GJ-W11 | Delivery failure → authorized recovery (no new re-book UI) | X3 | Daily Operations | **Expanded** |
| GJ-W12 | Urgent offboarding, suspension, access revocation | X3 | People & Access | **Expanded** |
| GJ-W13 | Order cancellation and refund interactions | X3 | Daily Operations | **Expanded** |
| GJ-W14 | Step-up failure, session expiry, mutation recovery | X3 | Cross-cutting | **Expanded** |
| GJ-W15 | Multi-outlet manager switches outlet context | X2 | Store Management | AS-15 |

**Naming correction:** former “recover / re-book” wording for GJ-W11 is replaced. Inventory shows
no workforce UI for delivery return/cost; do **not** promise a new booking-retry surface.

---

## X3 journey contracts (nine-point)

Each included journey specifies: (1) authorized actor/scope, (2) entry + starting state,
(3) success path, (4) denied/ineligible, (5) confirmation + existing step-up, (6) network/server
failure recovery, (7) stale revision / changed state, (8) durable result + user-visible confirmation,
(9) existing authority / evidence.

### GJ-W6 — Commercial publishing, activation, consequence handling

| # | Contract |
|---|---|
| 1 | Brand commercial author with applicable `menu.*` / `pricing.*` / `promotions.*` (and related) writes; brand scope |
| 2 | Menu & Commercial → domain editor (Menu / Pricing / Offers); draft present; Review is inspection-only |
| 3 | Edit draft → consequence review on publish/effect or terminal section/entry activate/retire → success status |
| 4 | Missing write caps: no affordance or AccessDenied; Review never becomes a second publish button |
| 5 | Consequence review for publish/effect and for menu section/entry terminal activate/retire (**P1-C**); retain existing step-up if those APIs already require it — do not invent new step-up classes |
| 6 | Network/server failure: retain draft; show recoverable error; retry does not double-apply without revision check |
| 7 | Stale revision / concurrent publish: surface conflict; reload draft/live; no silent overwrite |
| 8 | Durable: live projection updated per accepted commercial rules; UI shows success + draft vs live clarity |
| 9 | IMP-036F/J commercial workspace; MenuEditor publish already uses ConsequenceReviewDialog; AS-08/09; P1-C |

**Slice:** V1_ACCEPTANCE_SLICE for consequence-reviewed publish/retire; store immediate-effect confirmations (**P2-G**) remain FOLLOW_UP.

### GJ-W7 — Membership creation, role grant/revoke, effective-permission diagnosis

| # | Contract |
|---|---|
| 1 | Access administrator / store team manager with `access.membership.*` and/or `access.role_assignment.*` in brand or outlet scope |
| 2 | People & Access → Memberships (admin) or Store Team / Team Access (outlet); starting: no membership or existing active member |
| 3 | Create/invite membership → grant role → open Effective Permissions (read-only) to diagnose → success |
| 4 | Without manage/grant caps: create/grant hidden or denied; Effective Permissions remains non-mutating |
| 5 | Existing confirmations + step-up on grant/revoke/status mutations (Amendment A / IMP-036G/E) retained |
| 6 | Failure: mutation not applied; message + retry; no partial “looks granted” without server success |
| 7 | Stale membership/role revision: conflict or reload; do not show stale effective permissions as current without refresh |
| 8 | Durable membership/role rows; diagnostic view matches server effective permissions after refresh |
| 9 | IMP-035/036G/036E; inventory rows 15–16, 19–20; AS-12; AS-16 |

### GJ-W9 — Refund workflow with existing permission/step-up

| # | Contract |
|---|---|
| 1 | Principal with `payment.refund` (e.g. support_refund_operator) on readable order |
| 2 | Daily Operations → Order detail → Refunds panel; payment captured / refund-eligible per **existing** payment rules |
| 3 | Initiate refund within accepted entitlements → step-up succeeds → confirmation → refund accepted/pending per server |
| 4 | No `payment.refund`: panel/actions unavailable; ineligible payment state: server denial with honest message — **no new entitlement invented** |
| 5 | Existing refund step-up + confirmation retained |
| 6 | Network/server failure: no silent success; pending recovery pattern retained; safe retry |
| 7 | Order/payment changed underneath: reload; drop stale confirm payload |
| 8 | Durable refund record per Payment authority; visible status on panel |
| 9 | IMP-036D refunds UI; payment domain acceptance; AS-17 |

**Out of WXE invention:** changing refund amounts, partial-refund policy, or provider behaviour.

### GJ-W11 — Delivery failure, booking ambiguity, authorized recovery

| # | Contract |
|---|---|
| 1 | Delivery coordinator / outlet manager with delivery command permissions on the Order’s Delivery |
| 2 | Delivery workspace or Order detail Delivery panel; Delivery in failure / booking-ambiguous state per server |
| 3 | Use **existing** authorized commands only: report/resolve failure, cancel where allowed, arrange where `arrange` is supported — then reload truth |
| 4 | Takeaway orders: not actionable in Delivery workspace; missing caps: denied; **no UI for return/cost/re-book** (unimplemented — OUT_OF_SCOPE) |
| 5 | Terminal fail/cancel: confirmation + visible codes/reasons (P0-A / PR #427); resolve attestation explicit in UI |
| 6 | Network/server failure: retain local draft inputs; retry; drop responses that no longer match active Order+Delivery identity |
| 7 | Stale Delivery revision / switched Order: reset dialogs and evidence; ignore stale async |
| 8 | Durable Delivery state from server; customer notifications only as already produced by accepted commands |
| 9 | IMP-032/036D; AS-04; AS-18; server Gaps 1–3 remain SEPARATE_CORRECTIVE |

**Non-claim:** V1 does not verify external-provider proof; does not close Gaps 1–3.

### GJ-W12 — Urgent offboarding, suspension, access revocation

| # | Contract |
|---|---|
| 1 | Access administrator / store team manager with membership status + role revoke permissions |
| 2 | Membership detail or Store Team; starting: active membership with roles |
| 3 | Suspend and/or revoke roles / membership status per **existing** status transitions → confirm access removed on revisit of Effective Permissions |
| 4 | Without status/revoke caps: actions hidden/denied; cannot invent force-logout beyond accepted session semantics |
| 5 | Existing confirms + step-up on access mutations retained |
| 6 | Failure: no silent “suspended” UI; retry; preserve prior durable state |
| 7 | Concurrent grant elsewhere: refresh before repeat revoke; conflict messaging |
| 8 | Durable membership/role state; diagnostic read shows loss of effective permissions after refresh |
| 9 | IMP-035/036G/E; AS-19 |

### GJ-W13 — Order cancellation and refund interactions

| # | Contract |
|---|---|
| 1 | Principal with `order.cancel` and, when refunding, `payment.refund` |
| 2 | Order detail; cancellable lifecycle state; payment may or may not be refund-eligible |
| 3 | Cancel via capability-gated lifecycle → if refund needed and permitted, refund path (GJ-W9) as separate authorized act — order of operations follows **accepted** Order/Payment rules, not a new composite transaction |
| 4 | Cancel without cap hidden/denied; refund without cap unavailable; cancelled order not re-opened via WXE invention |
| 5 | Lifecycle confirmation; refund step-up/confirm when refund pursued |
| 6 | Partial failure (cancel ok, refund fail): show truthful states; refund pending recovery retained |
| 7 | Stale order revision: reload before repeat cancel/refund |
| 8 | Durable order cancelled; refund state independent per Payment authority |
| 9 | IMP-030/036D; AS-03; AS-20 |

### GJ-W14 — Step-up failure, session expiry, mutation recovery

| # | Contract |
|---|---|
| 1 | Any principal attempting a step-up-gated mutation (refund, access grant/revoke/status, other existing step-up classes) |
| 2 | Mid-dialog or mid-submit; step-up challenge presented or session near expiry |
| 3 | After successful re-auth/step-up, operator may retry the **same** intended mutation with fresh confirmation if required |
| 4 | Failed step-up / expired session: mutation **not** applied; no bypass |
| 5 | Existing step-up controls only — WXE does not weaken or replace MFA classes |
| 6 | Network during step-up: treat as failure; require clean retry |
| 7 | Underlying entity changed during challenge: reload; discard stale confirm payload |
| 8 | No durable change until server accepts post-step-up mutation; UI confirms success only then |
| 9 | Access/payment step-up foundations; AS-21 |

---

## Acceptance scenarios (representative)

| ID | Scenario | Pass criteria | Slice |
|---|---|---|---|
| WXE-AS-01 | Operator with only commercial reads opens Applications | Sees Administration (or Commercial) entry per UPD-02 **A**; under **B**, document current built-in behaviour | UPD-02 dependent |
| WXE-AS-02 | Store-capable user without `order.read` (fixture) | If Ops destination shown, lands on first usable Store surface — not Today error (**A**); under **B**, retain current `order.read`-gated Ops destination | UPD-02 dependent |
| WXE-AS-03 | Order detail for PLACED with `order.accept` | Accept/Cancel visible when permitted; denied capabilities hide buttons | V1 |
| WXE-AS-04 | Delivery confirm pickup/delivery/fail/cancel | No UAT prefills; terminal commands confirm; cannot one-click fake proof; **does not claim provider-verified proof** | SEPARATE_CORRECTIVE (P0-A) + V1 non-claims |
| WXE-AS-05 | Takeaway FULFIL | Uses **UOE UX-A** verb map; Delivery panel hidden on detail; not actionable in Delivery workspace | V1 |
| WXE-AS-06 | Scheduled order list | Shows Scheduled + Due soon/Overdue cues on desktop | V1 |
| WXE-AS-07 | Narrow order list | Timing still available via accessible text (fallback OK) | V1 |
| WXE-AS-08 | Menu retire section | Consequence review before effect | V1 (P1-C) |
| WXE-AS-09 | Open Review section | Clear that publish actions live in domain editors | V1 |
| WXE-AS-10 | Admin Resources page | Single H1; breadcrumbs present | V1 |
| WXE-AS-11 | Scheduling | Discoverable as Scheduling, not only buried under Hours | V1 (UPD-06) |
| WXE-AS-12 | Effective Permissions | Read-only framing; mutations elsewhere | V1 |
| WXE-AS-13 | Unauthorized deep link | AccessDenied with recovery to Applications | V1 |
| WXE-AS-14 | Unsaved hours edit + navigate | Protect or confirm discard | V1 |
| WXE-AS-15 | Outlet context | Breadcrumb + sub-nav preserve `outletId` | V1 |
| WXE-AS-16 | GJ-W7 grant then diagnose | After grant, Effective Permissions reflects new effective set after refresh | V1 |
| WXE-AS-17 | GJ-W9 refund with step-up | Without step-up success, no refund; with success, panel shows server status | V1 (existing entitlements) |
| WXE-AS-18 | GJ-W11 failure recovery | Operator completes an existing authorized recovery command; no re-book UI promised | V1 |
| WXE-AS-19 | GJ-W12 suspend/revoke | Status/role change persists; EP diagnosis shows loss after refresh | V1 |
| WXE-AS-20 | GJ-W13 cancel then refund | Cancel and refund each follow own authz; honest partial failure | V1 |
| WXE-AS-21 | GJ-W14 step-up/session failure | Failed challenge leaves no durable mutation; retry path clear | V1 |
| WXE-AS-22 | GJ-W6 publish with review | Publish/effect blocked without review confirm; success shows live clarity | V1 |

## Journey Completeness Matrix (package-level)

| Dimension | Coverage in candidate |
|---|---|
| ENTRY | WXE-AS-01/02/13 + UPD-02/03 A/B |
| DISCOVERY | Nav placement doc + GJ-W* |
| CONTEXT | Brand/Outlet rules; WXE-AS-15 |
| EMPTY/FIRST USE | XD journey UX contracts + desktop standard |
| HAPPY PATH | GJ-W1–W15 with X3 nine-point contracts for W6/W7/W9/W11–W14 |
| ALTERNATE VALID PATHS | Delivery vs Takeaway; Now vs Scheduled; cancel↔refund ordering |
| VALIDATION FAILURE | Forms standard + journey contracts |
| AUTHORIZATION | P1-ENTRY/COMM; AS-01/02/13; denied rows in X3 contracts |
| NOT FOUND/STALE | Outlet stale alert; Delivery/Order identity reset; AS-18/21 |
| SERVER/NETWORK ERROR | Journey-specific recovery (not generic “all pages”) |
| RECOVERY | Refund pending; delivery reload; step-up retry |
| CONCURRENCY | Revision-aware store/commercial saves; stale confirm drop |
| DESTRUCTIVE ACTION | Consequence review + X3 confirm rows |
| SUCCESS FEEDBACK | Announcements / status lines per journey §8 |
| DOWNSTREAM EFFECT | Service blueprint + commercial/access/delivery rows |
| REVISIT/RELOAD | Direct-link matrix; commercial deep-link FOLLOW_UP |
| RESPONSIVE/MOBILE | Desktop-first + XD minimum narrow-screen task set |
| ACCESSIBILITY | WCAG target + dual-H1 removal + focus restoration |

## Bound relative to adjacent work

| Work | Relationship |
|---|---|
| UOE PR #424 | Owns shared Delivery/Takeaway + Now/Schedule label map (UX-A); WXE consumes |
| #376 / #381 | Route reliability/root-cause through IMP-036J Founder UAT; WXE only owns chrome/clarity overlap |
| #378 | Parent discovery theme for this package |
| #380 | Programme intake; this package is workforce desktop candidate material |
| PR #427 | P0-A UI corrective + server Gaps 1–3 note; merge/deploy unapproved |
