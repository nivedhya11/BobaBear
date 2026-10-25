<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  ID: UOE-DESIGN-QT-MI-EVIDENCE-DELTA-1
  PACKAGE: UOE-CANDIDATE-3
  THIS_DOCUMENT_IS_AN_EVIDENCE_DELTA: YES
  NOT_A_COMPETING_ARCHITECTURE: YES
  NOT_A_GATE_PASS: YES
  DESIGN_READINESS_PASS: PASS
  QUALITY_PLAN_FINALIZATION: FINALIZED
  MEASUREMENT_PLAN_FINALIZATION: FINALIZED
  FOUNDER_VERDICT: GRANT_WITH_EXCLUSIONS
  FOUNDER_RECORD: 23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md
  THIS_DELTA_DOES_NOT_GRANT: YES
  APPLICATION_CODE_MUTATION: NO
  TESTS_EXECUTED_UNDER_THIS_PACKAGE: NONE
  STACKED_ON: PR 424 docs/uoe-pd2-candidate @ 3b207b3bb69f305353770315af7ad814a7e766d0
  NOT_MERGED_MAIN_AUTHORITY: YES
-->

# UOE Design / Quality / Measurement evidence delta

Current planning-gate status is recorded in
[`23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md`](./23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md)
(`GRANT_WITH_EXCLUSIONS`, 2026-10-25). This delta remains the source-versus-plan classification.
It does not grant the gates, and it does not execute tests.

```text
ID = UOE-DESIGN-QT-MI-EVIDENCE-DELTA-1
TASK = BOBA-UOE-DESIGN-QUALITY-MEASUREMENT-CLOSURE-20261025
SOURCE_PR = https://github.com/nivedhya11/BobaBear/pull/424
SOURCE_HEAD = 3b207b3bb69f305353770315af7ad814a7e766d0
SOURCE_BRANCH = docs/uoe-pd2-candidate
INSPECTED_TREE = that HEAD, read-only, before this delta
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
PRESERVE = PD-UOE-CANDIDATE-3 PASS | XD-UOE-CANDIDATE-3 PASS | ARCHITECTURE FIT PASS | ARCH-UOE-LOCK-PROPOSAL-1 LOCKED
DESIGN_READINESS_PASS = PASS
QUALITY_PLAN_FINALIZATION = FINALIZED
MEASUREMENT_PLAN_FINALIZATION = FINALIZED
FOUNDER_VERDICT = GRANT_WITH_EXCLUSIONS
FOUNDER_PLANNING_GATE_RECORD = 23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md
TESTS_EXECUTED_UNDER_THIS_PACKAGE = NONE
UOE_DR06_REMEDIATION = NOT_AUTHORIZED
WHATSAPP_META_BODY = UNKNOWN
WHATSAPP_ON_WIRE = NOT_APPROVED
VENDOR = UNKNOWN
RETENTION_DURATION = UNKNOWN
BASELINE = NOT_PERFORMED
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
GATE_READINESS = RECORDED_GRANT_WITH_EXCLUSIONS
```

This delta classifies what the existing UOE documents already specify against source that
exists at the #424 head. It does not replace `07`–`20`, does not amend capability
architecture §§2–5, and does not itself grant Design Readiness, Quality finalization, or
Measurement finalization. Those gates are recorded in
[`23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md`](./23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md).
The operative grant text remains
[`16-consolidated-design-qt-mi-final-decision-package.md`](./16-consolidated-design-qt-mi-final-decision-package.md)
§1.1. The pre-decision surface remains
[`22-founder-gate-review-packet.md`](./22-founder-gate-review-packet.md).

Source inspection is not an executed test run. `SOURCE_PRESENT` means the file or test
exists and was read. `NOT_FOUND` means a targeted search of this tree did not find it.
`PLANNED` means the Quality plan names future proof and this package did not run it.

---

## 1. Preserved authority

| Record | Result | Evidence | This delta |
|---|---|---|---|
| Product Definition Gate | PASS `PD-UOE-CANDIDATE-3` | [PR #424 comment 6365686428](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6365686428); reviewed head `dbe0786280fac4ba80ba727c7510b8c23da69ed1` | Preserved |
| Experience Gate | PASS `XD-UOE-CANDIDATE-3` | Same comment | Preserved |
| Architecture Fit | PASS `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` | [PR #424 comment 6371582324](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6371582324); contract head `9a9e3f71789a4cce5141eb88b3ab606f72b2c54e` | Preserved |
| Architecture Lock | APPROVED `ARCH-UOE-LOCK-PROPOSAL-1` | Same comment. Binding file `docs/platform/capabilities/UOE-unified-order-experience.md`. Per-process rate-limit residual `ACCEPTED_FOR_V1_PILOT` | Preserved. §§2–5 not edited |
| W2 working baseline | Recorded, not a gate PASS | Issue #432; `15-…` | Preserved. MC-01–MC-33 working baseline. MC-34 on-wire `NOT_APPROVED` |
| Design / Quality / Measurement | `GRANT_WITH_EXCLUSIONS` | `16-…` §1.1; record `23-…` | Recorded 2026-10-25. This delta did not grant it |
| Lifecycle | Unchanged | ROADMAP `GTM-R190`, STATE `STATE-R189` on this tree | Not edited. `acceptedThrough` IMP-036I. Current slice IMP-036J. Next IMP-036K. IMP-037 and IMP-038 remain paused |

#424 is open, unmerged, and `CONFLICTING` with `main`. This delta is a stacked candidate on
`docs/uoe-pd2-candidate`. It is not merged-main authority.

---

## 2. Design readiness gap table

Interaction authority stays `07-…`. Journeys stay J1–J7 in `01-…`. Language stays the W2
baseline in `15-…` §1. This table says whether that specification is complete enough to
review, and what source does today.

| Concern | Specification | Source at `3b207b3bb` | Class |
|---|---|---|---|
| Journeys J1–J7 | `01-…` names browse→pay, Delivery Now, Takeaway eligibility, Schedule windows, pre-pay change, payment recovery, workforce labels | Menu, Cart, Checkout, recovery, and operations screens exist. `OrderContextBar` is `NOT_FOUND` in `src/` | Specified. Not built |
| Screens | `07-…` §1: Menu, Cart, Checkout (Method → Place → Timing → Review), Recovery | Those routes exist. Proposed components in `07-…` §1.2 are absent | Specified. Not built |
| State vocabulary | `07-…` §2 covers missing, loading, empty/no-cart, valid, invalid, unauthorized, network, stale, provisional vs confirmed, revisit, disabled/confirm | No UOE coordinator implements that matrix | Specified for review |
| Loading / empty / retry | `07-…` §2.2 and MC-23–MC-27 | Checkout `loadPickupOptions` in `CheckoutClient.tsx` sets `pickupPolicy` to `UNAVAILABLE` on any failed options response, and still sets an error string | Checkout error presentation conflicts with AS-33. Behavioural fix is `BLOCKED_DR06`. Copy for the pre-checkout read is UX-B |
| Serviceability vs eligibility | Delivery uses existing serviceability. Takeaway uses server eligibility. Orientation is not “Deliver to” | `evaluateCart` in `src/server/cart/evaluate.ts` returns `REQUIRES_FULFILMENT_CONTEXT` when location is absent, before `tryReusableCheckoutEvaluation`. Takeaway-without-address is therefore not implemented | UX-B Contract B gap. Specified. Not built. Not DR-06 |
| Takeaway Now vs Schedule | Menu Schedule is UNCONFIRMED. Checkout list must be timing-aware. Now is not “immediate” | `pickup-eligibility.ts` documents ASAP eligibility only when `effectiveState === "accepting"`. `loadPickupOptions` calls `listCheckoutPickupOptions({ checkoutId })` with no timing intent | Checkout list is the accepted DR-06 defect. Pre-checkout read is UX-B and does not exist |
| Advisory quote vs sealed Snapshot | Cart quote is provisional. Review shows sealed money. Missing evaluation evidence fails closed | Checkout Review and Snapshot authority exist. UOE impact banner is `NOT_FOUND`. Equal-money CART contexts still collide on IMP-036J `result_fingerprint` (capability §2, unchanged) | Presentation specified. CART provenance schema `NOT_AUTHORIZED` |
| Payment pending | Browse allowed inside existing limits. Mutate blocked. Guard routes to existing recovery. No new server guard | `tests/checkout/checkout.pickup.domain.test.ts` contains `AC-036H-026`: `setCheckoutFulfilment` under `PAYMENT_PENDING` expects `CHECKOUT_STATE_CONFLICT`. That test was not run here. `PendingPaymentGuard` is `NOT_FOUND` | Server freeze is source-present. Client guard is PLANNED in UX-C |
| Destructive confirmation | `07-…` §4: confirm dialog, default safe action cancel/keep | Specified as reuse of `StoreConfirmationDialog`. Not built for mode-switch line removal | Specified. UX-C |
| Keyboard, focus, names, 44px targets, 200% zoom, reduced motion | `07-…` §4 | `globals.css` has a `prefers-reduced-motion` rule. No UOE bar to prove | Keyboard, focus, and names are AS-13. Narrow versus header layout is AS-12. 44px targets, 200% zoom, and reduced motion stay `07-…` §4 requirements, planned at the drawing tranche’s exit (`§4.2`). They are not extra controls |
| Mobile / desktop | `07-…` §7: narrow sticky sheet, md popover, desktop header | Behaviour is specified. No design-system pixel is cited. `globals.css` has one `@media (min-width: 1024px)` rule, and it only changes scroll padding. That rule is not a commerce breakpoint contract | Behaviour specified. Pixel cut is unspecified and is not a product-meaning decision. An implementation PR must name the pixel it uses |
| Customer vs workforce order state | D-357 lifecycle is `PLACED \| ACCEPTED \| FULFILLED \| CANCELLED`. `src/components/ordering/order-status.ts` maps those to “Order received / accepted / fulfilled / cancelled”. Operations clients import that same helper | Customer and workforce lifecycle labels are one map today. UOE adds no order state. UX-A must not edit `order-status.ts` | Consistent today. Post-purchase words stay D-357 presentation. Mode words (Delivery / Takeaway) are the UOE change, on the files named in `17-…` |
| Language | W2 baseline MC-01–MC-33. Secondary rows close at tranche Content QA. MC-34 on-wire excluded | `fulfilmentModeLabel` returns `Pickup` for `PICKUP`. `customer-visible-content.ts` says “Your Pickup order…”. Its test expects that Pickup wording. API enum stays `PICKUP` | Current copy contradicts the working-baseline target. Change is UX-A, not authorized now |
| Service boundaries | See §3 | No new service, role, or permission in the locked architecture | Preserved |

True blockers for a Design Readiness **grant** are the human decision in `22-…`, not missing
screens. True blockers for **implementation** remain: gate not granted, IMP not allocated,
UOE-DR-06 not authorized, schema not authorized, and vendor/retention unknown before any
event is stored.

Deferrable polish that must not be treated as a silent product change: secondary MC rows at
tranche Content QA, the unnamed pixel cut, and Meta body edits after WA-01.

---

## 3. Service boundaries

| Boundary | Owner when later authorized | Must stay |
|---|---|---|
| Menu / Cart / Checkout presentation | UX-C bar and sheet, using UX-A labels and UX-B reads | No money in `sessionStorage`. No second geo store. Checkout bar does not repair listing order |
| Pre-checkout Takeaway eligibility | UX-B Contract A. HTTP path string stays an implementation detail inside capability §3 / §6 | Cart-credential scoped. Empty outlets without a lined cart. No fabricated `checkoutId` |
| Cart evaluate | UX-B Contract B, `src/server/cart/evaluate.ts` | Does not seal or pay. Client `SCHEDULED` is 400. Reuse moves ahead of the location early return. CHECKOUT reuse stays fingerprint-only |
| Checkout pickup list, bind, windows, evaluate, prepare | Existing checkout APIs. Composition change is only `20-…` | No new lifecycle state. No `SCHEDULED`+null list unlock. Prepare/pay authority unchanged |
| Payment and Snapshot | Existing payment and Snapshot modules | ARCH-G05, ARCH-G11. Advisory quote is not prepare proof |
| Order lifecycle | D-357 / ARCH-G07 | No `PREPARING`, `READY`, `SCHEDULED`, `DUE`, `LATE`, or `OVERDUE` |
| Workforce transport | Existing operations API (D-372) | UX-A may change primary mode words on named operations chrome. It does not add a permission |
| Notifications | UX-A in-app copy. WhatsApp send path unchanged while bodies are UNKNOWN | `NOT_SENT` is neither send success nor a product failure |
| Measurement writers | IMP-036J `order_commercial_state_change` stays fingerprint-only | UOE funnel events are proposed only. They are `NOT_FOUND` in `src/` |

---

## 4. Acceptance and negative trace

Owner column uses the tranche contracts `17-…`, `18-…`, and `19-…`. Where `10-…` previously
gave T3 an exit that included UX-B scenarios, `10-…` now points here. Evidence under this
package is never `EXECUTED`.

| ID | Owner | Expected proof | Source support at this HEAD | This package |
|---|---|---|---|---|
| AS-01 | UX-C | Component + E2E: bar CTAs; orientation ≠ Deliver to; empty cart ≠ “no outlets” | Bar `NOT_FOUND` | PLANNED |
| AS-02 | UX-B server half; UX-C presentation | Integration + HTTP + component | Mode switch exists on Checkout. Eligibility read and impact banner `NOT_FOUND` | PLANNED |
| AS-03 | UX-B server/quote half. Presentation half is not a `19-…` exit | Integration + HTTP | Delivery destination path exists. UOE recompute presentation `NOT_FOUND` | PLANNED |
| AS-04 | UX-B quote; UX-C banner | Domain + component + Content QA | Server money exists. Client impact banner `NOT_FOUND` | PLANNED |
| AS-05 | UX-B propose; UX-C chrome | Domain + component | Checkout AUTO_SELECT of a single outlet exists inside the accepting-now list | PLANNED. Checkout list behaviour is not the pre-checkout contract |
| AS-06 | UX-B; UX-C | Component + integration | Checkout multi-outlet select exists for accepting-now | PLANNED |
| AS-07 | UX-B server/quote half. Presentation half is not a `19-…` exit | Integration | Serviceability `NOT_SERVICEABLE` path exists in `evaluate.ts` | PLANNED |
| AS-08 Menu / pre-checkout | UX-B | Domain + HTTP: schedule-capable when closed now | Pre-checkout read `NOT_FOUND`. ASAP accepting-now gate is source-present | PLANNED |
| AS-08 Checkout list | UOE-DR-06 | Domain + HTTP | Accepting-now-only list is source-present | `BLOCKED_DR06`. Not deleted |
| AS-09 non-Checkout | UX-B | Component: honest empty windows | — | PLANNED |
| AS-09 Checkout | UOE-DR-06 | Integration | Windows API `listCheckoutScheduledWindows` exists and is called after an earlier evaluate | `BLOCKED_DR06` |
| AS-10 | UX-B | Unit + component, outlet timezone | Scheduled window listing exists. UOE Today/Tomorrow labels `NOT_FOUND` as a UOE control | PLANNED |
| AS-11 | UX-B | Recovery | Timing conflict handling exists in `confirmTiming` for `CHECKOUT_STATE_CONFLICT` and `CHECKOUT_REPRICED` | PLANNED as UOE proof. Not run |
| AS-12 | UX-C | Component + responsive | Bar `NOT_FOUND` | PLANNED |
| AS-13 | UX-C | Accessibility: keyboard, names, focus return | Bar `NOT_FOUND` | PLANNED |
| AS-14 | UX-C | Integration with the existing location selector | `LocationSelector` / delivery-context exist | PLANNED. No second geo store |
| AS-15 | UX-B server/quote half. Presentation half is not a `19-…` exit | Auth + integration | Session and cart credential scope exist. UOE revalidation presentation `NOT_FOUND` | PLANNED. D-370 merge is unchanged |
| AS-16 | UX-B + UX-C | Concurrency, real overlap | No UOE generation token in the bar | PLANNED |
| AS-17 | UX-C client + existing server freeze | Auth + recovery + HTTP | `AC-036H-026` source-present. Client guard `NOT_FOUND` | Server case SOURCE_PRESENT and not re-run. Client proof PLANNED. No new server guard |
| AS-18 | UX-B server/quote half. Presentation half is not a `19-…` exit | Recovery | New-journey bleed protection for the bar `NOT_FOUND` | PLANNED |
| AS-19 | UX-A | Content QA + component | `fulfilmentModeLabel` returns Pickup. Operations list uses that mode label path named in `17-…` | PLANNED. Current strings contradict the baseline |
| AS-20 | UX-C | Component: confirm before dropping lines | Specified. Not built | PLANNED |
| AS-21 | UX-C | Component + E2E reload | Tab coordinator `NOT_FOUND` | PLANNED |
| AS-22 | UX-C | Concurrency, two tabs | `sessionStorage` order-context key `NOT_FOUND` | PLANNED |
| AS-23 | UX-B | Recovery | Checkout expiry handling is an existing checkout concern. UOE proof not run | PLANNED. Not a UX-C exit |
| AS-24 | UX-B | HTTP + domain + auth | Pre-checkout eligibility route `NOT_FOUND` | PLANNED |
| AS-25 | UX-B | Domain + HTTP | `evaluateCart` exists and is location-first | PLANNED |
| AS-26 | UX-B rule; UX-C chrome | Component + domain | Proposed-versus-confirmed chrome `NOT_FOUND` | PLANNED |
| AS-27 | UX-B + UX-C | Concurrency | Not implemented as a UOE generation | PLANNED |
| AS-28 | UX-A in-app + noop | Content + integration | In-app Pickup copy is source-present. `NOT_SENT` exists in the Meta adapter and non-sending channel tests. On-wire bodies `NOT_FOUND` | PLANNED for the UOE assertion. On-wire claim forbidden |
| AS-29 | UX-B | Domain + integration | Reuse function exists and runs only after the location return | PLANNED |
| AS-30 | UX-B | HTTP + component | Distinct `NO_CART` / `EMPTY_CART` read `NOT_FOUND` | PLANNED |
| AS-31 | UX-B | Domain + HTTP | Location-absent evaluate returns `REQUIRES_FULFILMENT_CONTEXT` | PLANNED. Current order is the gap |
| AS-32 | UX-B, schema-gated | Database | Provenance columns `NOT_AUTHORIZED` | PLANNED. Cannot execute without schema authorization |
| AS-33 pre-checkout | UX-B | HTTP + component | — | PLANNED |
| AS-33 Checkout | UOE-DR-06 | HTTP + component | Failed pickup-options response sets policy `UNAVAILABLE` | `BLOCKED_DR06` |
| AS-34 | UOE-DR-06 | Domain + integration + E2E, RED first | Forbidden sequence is source-present: list, bind, `evaluateCheckout`, then `openTiming` | `BLOCKED_DR06` + `PRESERVE_RED`. Reproducing run `NOT_EXECUTED` |
| AS-35 | UOE-DR-06 for Checkout behaviour. String candidate stays in `07-…` §5. Not a UX-B exit | Integration | — | `BLOCKED_DR06` |
| AS-36 | UOE-DR-06 | Recovery + HTTP | — | `BLOCKED_DR06` |
| AS-37 | UOE-DR-06 | Integration | — | `BLOCKED_DR06` |
| AS-38 | UX-B | Domain + auth | Browse must not set `pickupOutletId`. Confirm step is specified | PLANNED |
| AS-39 | UX-B | Domain + recovery | Fail-closed rule specified. UOE proof `NOT_FOUND` | PLANNED |
| AS-40 | UX-C | Component | Checkout owns mode today. Bar reflection `NOT_FOUND` | PLANNED |
| AS-41 | UOE-DR-06 | Integration + E2E + recovery + concurrency | Same forbidden sequence through prepare | `BLOCKED_DR06` + `PRESERVE_RED`. Reproducing run `NOT_EXECUTED` |
| AS-42 | UX-B | Domain + integration | Promotion evaluation exists under IMP-036J. UOE mode-context proof not run | PLANNED |
| AS-43 | UX-B | Domain + HTTP | Client CART `SCHEDULED` 400 is specified, not implemented as a UOE allowlist | PLANNED |
| AS-44 | UX-C + Content QA | Component | Menu exact-slot API remains deferred (UOE-DR-02) | PLANNED |
| AS-45 | UX-B | Domain + recovery | Same fail-closed rule as AS-39 | PLANNED |
| AS-46 | UX-B rule; UX-C paint | Concurrency + component | Stale-key hide is specified. Not built | PLANNED |
| SEC-BOLA-CHECKOUT | UOE-DR-06 regression when Contract C changes | Auth + HTTP | Existing checkout ownership checks are out of this delta’s edit scope. They must be re-run with the corrective | PLANNED with the corrective. Not waived |

### 4.1 Negatives (capability §4.4)

All 21 remain mandatory. None were executed for UOE here.

| # | Owner | Source note | Release class |
|---|---|---|---|
| 1–7 | UX-B | Pre-checkout read and evaluate allowlist `NOT_FOUND` as UOE behaviour | Mandatory before UX-B implementation completion |
| 8 | UX-C client route. Server freeze already named `AC-036H-026` | Do not add a server guard | Mandatory. Existing test is not re-run here |
| 9 | UX-B when persistence is authorized | Schema `NOT_AUTHORIZED` | Mandatory with that schema. Not a reason to migrate now |
| 10, 11 | UX-B | Fail-closed and guest Snapshot denial specified | Mandatory before UX-B completion |
| 12, 13 | UX-B | Rate-limit and problem-code rules are locked. Per-process residual stays `ACCEPTED_FOR_V1_PILOT` | 429 behaviour is mandatory. Fleet-wide limiting is an accepted residual, not a silent waiver of ownership checks |
| 14 | UX-B + UX-C paint | — | Mandatory. Sequential calls do not prove it |
| 15 | UX-C | — | Mandatory for the bar |
| 16 | UX-A | `NOT_SENT` adapter and non-sending tests are source-present | UOE assertion still PLANNED. Adjacent tests are not AS-28 proof |
| 17, 18, 19, 20 | UX-B | Digest/HMAC client ban, capability flags, fingerprint-only CHECKOUT, CART `SCHEDULED` 400 | Mandatory. #19 must not retarget IMP-036J writers |
| 21 | UX-B with schema authorization | V1 HMAC stays null | Mandatory if schema is authorized. HMAC activation is forbidden in V1 |

Monetary, authorization, lifecycle, and idempotency authority stay on the server. A passing
component test of a label or banner does not prove prepare, pay, Snapshot sealing, or
Checkout ownership.

### 4.2 Mandatory release gate vs later follow-up

| Item | Class |
|---|---|
| AS rows owned by the authorized tranche, with the layers in the table | Mandatory at that tranche’s implementation exit |
| The negatives that tranche owns | Mandatory at that exit |
| AS-34, AS-41, and the Checkout-coupled rows in §4 | Mandatory before anyone claims Schedule-capable Checkout is delivered. They are not mandatory for a UX-A label tranche |
| Accessibility and responsive proof for surfaces the tranche draws | Mandatory at that exit |
| Content QA for that tranche’s strings | Mandatory at that exit |
| Server freeze, Snapshot, prepare/pay, and fingerprint-only CHECKOUT measurement | Mandatory regressions when a tranche touches those edges. UX-A must not touch them |
| Meta on-wire bodies | Follow-up. Excluded from the prepared gate. A WhatsApp-sending environment cannot claim on-wire DR-04 until WA-01 exists |
| Menu exact slots (UOE-DR-02) | Explicitly deferred. Not a V1 release gap |
| Email, SMS, push while non-sending | Out of V1 |
| Fleet-wide rate limit | Accepted residual for the V1 pilot. Not proof that a single process is untested |
| Baseline rates and conversion lift | Not a release gate. Claims are forbidden until measured |
| Perf budgets in capability §4.2 | Planned harness at implementation. Not measured here. No number in this delta is an observation |
| CART provenance migration | Separate authorization. Not part of Design/Quality/Measurement grant |

---

## 5. Measurement

Cross-product analytics inventory belongs to the separate pre-GTM audit. This section is
only the UOE proposal checked against writers that exist in this tree.

| Item | Record |
|---|---|
| Business intent | Less wrong-mode and wrong-time hesitation before pay, without weakening payment truth (`09-…`) |
| Primary outcome | Checkout-start → successful payment. Grain is checkout id. Denominator is checkout starts. Raw CART evaluation count is forbidden as that denominator |
| Numerator event | `order_payment_success` is a **candidate name**. It is `NOT_FOUND` in `src/` |
| Denominator event | `order_checkout_start` is a **candidate name**. It is `NOT_FOUND` in `src/` |
| Existing commercial-state writer | `COMMERCIAL_STATE_CHANGE` in `src/server/customer-commerce/measurement/writers.ts`, fingerprint fields only. Status `LOCKED_SEMANTICS`. Do not attach a digest |
| Other UOE events in `09-…` §4 | Candidate names only. `NOT_FOUND` in `src/`. Not emitted |
| Properties that may be proposed | surface, mode, coarse place kind, selection policy, outlet-count bucket, timing intent, cart state, reason class, checkout id, day bucket. Exact street, PAN, `evaluation_context_digest`, and delivery-location HMAC are forbidden |
| Dedup | One conversion credit per successful payment per checkout id. Identical consecutive mode intents deduped. Definitions stay candidate until a named owner confirms them |
| Owner | Product analytics and Commerce analytics roles: Founder interim. Delegates `NOT_NAMED` |
| Baseline | `NOT_PERFORMED`. No pre-change rate is stated because none was measured |
| Success criterion | `09-…` allows only a directional learning signal after an observation window. No target percentage is supported, so none is set |
| Observation window | Candidate 14–28 days. Not ratified |
| Privacy | Capability §4.3 bans stand. Retention duration `UNKNOWN`. Events must not be stored until a privacy owner signs a duration |
| Vendor | `UNKNOWN`. No transport is selected by this delta |
| Attribution | Candidate last bar interaction before checkout start. Still candidate (M-F1). Not ratified |
| Experiment | None. Selection bias is disclosed. Insufficient evidence is not a winner |
| Guardrails | Payment failure, invalid window at pay, unauthorized client money, browse bind without confirm. Support-contact taxonomy has no owner tool named here |

Instrumentation of the candidate events is blocked until vendor, retention, and the
implementation authorization exist. Role, denominator, fingerprint rule, and privacy bans
can be reviewed without those facts.

---

## 6. Engineering readiness of the tranches

The contracts are plans. None may start.

| Tranche | Specified enough for a later assignment? | Still required before any edit |
|---|---|---|
| UX-A `17-…` | Yes, as a label-only assignment on the named files. In-app Takeaway wording, noop assertion, and Content QA are bounded. `CheckoutClient.tsx` string edits must not enter `chooseFulfilmentMode`, `loadPickupOptions`, `continuePickupWithOutlet`, `openTiming`, or `confirmTiming` | Design/Quality/Measurement grant, allocated IMP, implementation authorization. On-wire WhatsApp is not an exit item |
| UX-B `18-…` | Yes, for Contracts A and B inside the named files and the locked semantics. The public path string may be chosen inside capability §6. It must not become a second checkout API | Same gates and IMP. Schema authorization before AS-32 or negative 21. UOE-DR-06 files stay forbidden |
| UX-C `19-…` | Yes, for bar, sheet, tab storage, impact paint, and the client pending guard, after UX-A labels and UX-B reads exist | Same gates and IMP. Do not emit analytics. Do not edit the Checkout listing sequence. Pixel cut must be named in the implementation PR |
| UOE-DR-06 `20-…` | The corrective is specified and test-first. It is not an implementation assignment | Separate Founder authorization. RED fixture before production edits. Not absorbed into UX-A/B/C |

Sequence when authorization exists: UX-A, then UX-B, then UX-C. UOE-DR-06 is not a step in
that sequence. Checkout dependency is the accepted composition defect, not a hidden task
inside UX-B. Workforce dependency is label-only on the files `17-…` names. Server contracts
for windows, freeze, Snapshot, and fingerprint measurement are dependencies to reuse.

`10-…` effort ranges stay indicative. They are not a commitment and not a measured baseline.

---

## 7. What this delta does not close

- Design Readiness PASS, Quality finalization, Measurement finalization
- UOE-DR-01 IMP identity and sequencing against IMP-036J acceptance, IMP-036K, and the paused IMP-037 / IMP-038 holds
- UOE-DR-06 vehicle and timing
- Telemetry vendor, retention duration, named delegates, attribution rule, baseline capture
- Meta template bodies and WA-02 / WA-03
- Any executed AS or negative proof
- Pre-GTM cross-product audit (other workstream)

---

## 8. Independent review corrections

A read-only review challenged this delta against the tranche contracts and the source
claims in §§2–5. It did not grant a gate. Corrections applied before publication:

- AS-03, AS-07, AS-15, and AS-18 stay on the UX-B server/quote half. Their presentation half is not a `19-…` exit.
- AS-35 behaviour stays `BLOCKED_DR06`. The string candidate stays in `07-…` §5. UX-B has no AS-35 exit.
- Keyboard, focus, and names stay on AS-13. Narrow versus header layout stays on AS-12. 44px targets, 200% zoom, and reduced motion stay `07-…` §4.
- `10-…` T2 no longer treats AS-40 or AS-44 as UX-B exit work. The T3 schedule-capable bullet shows a result owned by UX-B or UOE-DR-06.
- `08-…` Contract C rollup limits the UOE-DR-06 gate to the Checkout-coupled subset.

```text
DESIGN_READINESS_PASS = PASS
QUALITY_PLAN_FINALIZATION = FINALIZED
MEASUREMENT_PLAN_FINALIZATION = FINALIZED
FOUNDER_VERDICT = GRANT_WITH_EXCLUSIONS
FOUNDER_PLANNING_GATE_RECORD = 23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md
IMPLEMENTATION_AUTHORIZED = NO
TESTS_EXECUTED_UNDER_THIS_PACKAGE = NONE
THIS_DELTA_DOES_NOT_GRANT = YES
```
