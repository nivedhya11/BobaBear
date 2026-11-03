<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  ID: BOBA_PRE_GTM_CX_PRIORITY_DELTA
  WAVE: BOBA_PARALLEL_PRIORITY_WAVE_R1 / Lane C
  NOT_A_GATE_PASS: YES
  NOT_CANONICAL_EDR: YES
  EDR_AUDIT_STATUS_UNCHANGED: NOT_PERFORMED
  UOE_DESIGN_QT_MI_PASS: NOT_GRANTED
  WXE_ARCHITECTURE_FIT: NOT_GRANTED
  IMP036K_ACTIVATION: NOT_CLAIMED
  XR010_PASS: NOT_CLAIMED
  FOUNDER_UAT: NOT_PERFORMED
  STAGING_READINESS: NOT_CLAIMED
  APPLICATION_CODE_MUTATION: NO
  HEAVYWEIGHT_E2E_PODMAN_DB: NOT_RUN
-->

# BOBA_PRE_GTM_CX_PRIORITY_DELTA

```text
DELIVERABLE = BOBA_PRE_GTM_CX_PRIORITY_DELTA
LANE = C — Pre-GTM Customer Experience priority delta
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
INSPECTED_BASELINE = a7026d2c80d2cfaf9184489a2dbf24b9698772b0
INSPECTED_BRANCH_AT_WRITE = wave-r1-c-pregtm-cx-20261103
METHOD = Phase-1 source/document review ONLY
BROWSER_E2E = NOT_RUN
LIVE_DB_READ = NOT_RUN
PODMAN_OR_STAGING = NOT_TOUCHED
XR010_SESSION_UNTOUCHED = YES
CANONICAL_EDR = docs/platform/EXPERIENCE-DEBT-REGISTER.md remains auditStatus=NOT_PERFORMED / FINDINGS=NONE
```

## 0. Prior packages read first (non-duplication)

| Package | Identity | This delta does |
|---|---|---|
| Issue [#455](https://github.com/nivedhya11/BobaBear/issues/455) | Pre-GTM CX + UOE two-agent authorization | Follows scope; does not claim audit complete |
| PR [#456](https://github.com/nivedhya11/BobaBear/pull/456) | UOE Design/QT/MI evidence delta (AS-01..46 + 21 negatives) | **Not redone.** §8 cites QT/MI residuals only |
| PR [#475](https://github.com/nivedhya11/BobaBear/pull/475) | Purchase-trust forensics for #391 / #377 | **Not redone.** Equal-payable return and unavailable-line recovery out of scope here |
| PR [#476](https://github.com/nivedhya11/BobaBear/pull/476) | Menu merchandising / static↔DB lineage | **Not redone.** Image remap / live menu parity / Exam Survivor rows not restated; customization seed emptiness cited once with provenance pointer |
| Issue [#379](https://github.com/nivedhya11/BobaBear/issues/379) | Future mobile-first CX discovery | Context only; not implemented |

No Agent-1 full journey matrix PR under `docs/gtm/pre-gtm-experience-audit/` was found open/merged as of this write (`NOT_FOUND` in open PR search for that path). This file is a **priority delta**, not that comprehensive audit.

---

## 1. Priority findings (8)

Severity is proposed for Founder triage only. It is not a conversion claim and not an EDR promotion.

### CX-P1 — Scheduled self-service cancellation promised in Checkout, unreachable after purchase

| Field | Value |
|---|---|
| Severity | **P0 launch-trust** (proposed) |
| Journey | Scheduled ordering → Confirmation / My Orders → Cancellation |
| Class | **Bug / incomplete customer surface** relative to accepted IMP-036I server capability (not a future redesign idea) |
| Evidence class | `VERIFIED` **source** promise↔surface mismatch on `a7026d2c`. Interactive / live-browser Founder UAT of cancel = **not performed** this wave (`UNVERIFIED` runtime). |
| Provenance | `CheckoutTimingChoice.tsx` renders “Self-service cancellation for this scheduled order closes {N} minutes before the window starts.” Server: `cancelCustomerScheduledOrder` + `POST /api/v1/orders/{orderId}/cancel` in `customer-commerce/http/router.ts`. Customer client `src/lib/customer-commerce/orders.ts` exports only `listCustomerOrders` / `getCustomerOrder` — **no cancel wrapper** (`NOT_FOUND`). `OrderDetailClient.tsx` exposes status, fulfilment, money, financial docs, and `OrderSupportAction` (WhatsApp/Email/Call) only — **no Cancel control**. `OrderConfirmationClient.tsx` has no cancellation guidance beyond load lifecycle. `commerceErrorCopy` omits `ORDER_CANCEL_CUTOFF_CLOSED` / `ORDER_CANCEL_NOT_ALLOWED` (present in shared order errors / HTTP error-map). |
| Impact hypothesis | Customer is told self-service cancellation exists at timing choice, then after pay can only contact support. Operational-promise integrity risk under EXP-1 Cancellation / Errors-recovery. |
| Untested | Interactive cancel eligibility against a live scheduled order = `UNVERIFIED` (Phase 1; no E2E; **no interactive UAT claimed**). |
| Recommended change | Product/Experience disposition: wire customer cancel UI + client to existing API with cutoff-closed recovery copy, **or** Founder/Product/Content explicitly approve honest promise changes until the surface exists. Do not silently alter accepted cancellation policy. Not authorized here. |
| Owner / next gate | Customer Product + IMP-036I residual owner; Content QA for promise wording; Founder triage before any IMP-040 audit claim. Not IMP-036K. |
| Disposition candidate | `OPEN` |

### CX-P2 — Privacy copy denies third-party tracking cookies while GA4 loader is shipped

| Field | Value |
|---|---|
| Severity | **P0 trust / legal-language** (proposed) — **conditional** on GA being active in the **deployed** build |
| Journey | Home / any customer layout page → Privacy; measurement readiness |
| Class | **Content accuracy / experience debt**. Live tracking incident = **not verified**. `CONFLICT` only if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is non-empty in that deployed build. |
| Evidence class | `VERIFIED` source capability + privacy text; live env enablement / network calls = `UNVERIFIED` |
| Provenance | `/privacy` states: “We do not use advertising or third-party tracking cookies…” (`privacy/page.tsx`, LAST_UPDATED 19 August 2026). Customer layout mounts `<Analytics />` (`app/(customer)/layout.tsx`). `Analytics.tsx` returns `null` when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is empty; loads `googletagmanager.com/gtag/js` only when the id is non-empty. `.env.example` ships `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-CFR3M3J59V` (example only — not proof of a live deploy). No cookie/CMP consent banner in `src/` (`NOT_FOUND`). Existing Founder **A0 GA OFF** applies to restricted pre-UAT; it is **not** proof GA is disabled on every published route. |
| Impact hypothesis | **If** GA is enabled in a published build, privacy language is false. **If** GA remains disabled everywhere that build ships, this is a latent readiness/disclosure gap, not a demonstrated unlawful-cookie incident. |
| Untested | Actual staging/production env value and network calls = `UNVERIFIED` (no deploy access this lane; **do not claim currently unlawful cookies without runtime proof**). |
| Recommended change | Founder/legal disposition: retain GA OFF for staging/pre-UAT; verify real published-build behaviour before enabling analytics; align privacy + consent/CMP before any future enablement. Measurement plan must name marketing vs commercial writers. |
| Owner / next gate | Privacy/Content owner + Product Language; separate from UOE MI. Blocks honest `PRE_GTM_…_INSTRUMENTATION_AUDIT` closure. |
| Disposition candidate | `OPEN` |

### CX-P3 — Marketing GA events ≠ commerce funnel; support-contact measure still UNAVAILABLE

| Field | Value |
|---|---|
| Severity | **P1 measurement readiness** (proposed) |
| Journey | Cross-product analytics / Offers / Checkout / Payment / Support |
| Class | **Experience debt / measurement readiness** (not a runtime bug by itself) |
| Evidence class | `VERIFIED` call-sites; production traffic = `UNVERIFIED` |
| Provenance | `trackEvent(` call-sites only: `AccessCTA`, `EmailLink`, `FooterNewsletter`, `MerchDrop` — WhatsApp/email/contact clicks. No `add_to_cart` / `begin_checkout` / `purchase` (or equivalent) web events (`NOT_FOUND`). Server commercial measurement writers exist under `src/server/customer-commerce/measurement/` (IMP-036J). IMP-036J measurement plan records support-contact instrumentation as `UNAVAILABLE`. |
| Impact hypothesis | Pre-GTM audit cannot treat GA CTA clicks as conversion denominators. Commercial truth stays server-side; marketing attribution and support friction remain decision gaps. |
| Untested | Whether operators currently rely on GA for ordering KPIs = `UNVERIFIED`. |
| Recommended change | Decision-ready matrix: (a) keep GA marketing-only with honest privacy, (b) authorize a separate web funnel plan under PD-2/EXP-1 without inventing vendors/retention, (c) leave support contacts `UNAVAILABLE` until an approved instrument exists. Do not enable live customer tracking from this note. |
| Owner / next gate | Measurement owner for IMP-040 audit; UOE Agent-2 owns UOE-only MI (#456) — do not collide. |
| Disposition candidate | `OPEN` |

### CX-P4 — Ordering chrome hardcodes “Delivering to” for location orientation

| Field | Value |
|---|---|
| Severity | **P1 mode-trust / language** (proposed) |
| Journey | Menu / Cart / Checkout header orientation; Delivery vs Pickup |
| Class | **Experience debt**; UOE residual (presentation). Not a money bug. |
| Evidence class | `VERIFIED` on main |
| Provenance | `deliveryHeaderContext` returns `title: "Delivering to"` (`src/lib/customer-location/display-label.ts`). `LocationSelector` / `NavDeliverToOrientation` use that header on ordering chrome (`Nav.tsx`, `DeliverToOrientation.tsx`). Pickup mode still uses customer label “Pickup” via `fulfilmentModeLabel` (`pickup-location-presentation.ts`) — BB-VOICE retains Pickup. Orientation string remains Delivery-framed regardless. |
| Impact hypothesis | Pickup / Takeaway-intent customers see Delivery orientation before mode choice — friction and false expectancy. Distinct from #456 full OrderContextBar (still `NOT_FOUND` on main). |
| Untested | Real-device confusion rate = `UNVERIFIED`. |
| Recommended change | Mode-neutral or mode-aware orientation copy under LANG-1 / UOE UX-A–C when authorized. Do not rename backend `PICKUP`. |
| Owner / next gate | UOE Design Readiness (held #456 / #424) or #379 CX discovery; **not** IMP-036K. |
| UOE QT/MI residual link | Design table “Serviceability vs eligibility / Orientation is not Deliver to” in #456; AS-14 PLANNED. |
| Disposition candidate | `OPEN` |

### CX-P5 — Missing pre-cart Offers discovery (Cart/Checkout/Payment already expose offers)

| Field | Value |
|---|---|
| Severity | **P1 discoverability** (proposed) |
| Journey | Pre-cart Offers discovery → Cart → Checkout → Payment |
| Class | **Experience debt** — pre-cart discoverability gap only (not “offers exist only in Cart”) |
| Evidence class | `VERIFIED` nav/routing + in-journey offer surfaces on `a7026d2c`; offer effectiveness = `UNVERIFIED` |
| Provenance | Primary nav destinations: Menu, Drops, Sign In / My BOBA, Cart (`Nav.tsx`). No Offers/Deals customer route under `src/app/(customer)/order/` (`NOT_FOUND` — no Deals/Offers discovery route added). **In-journey offer surfaces already present:** `CartClient.tsx` renders `CommercialOfferStack` + interactive `CouponField`; `CheckoutClient.tsx` renders `CommercialOfferStack` + interactive `CouponField` (apply/remove); `PaymentPanel.tsx` renders `CommercialOfferStack` (**display** of applied/available commercial offers — no separate `CouponField` on Payment). Prior “Cart-only Offers” / Cart-only audit-exception wording was **incorrect** and is withdrawn. |
| Impact hypothesis | EXP-1 pre-GTM scope lists Offers as a required audit journey. Customers can apply/see offers once in Cart/Checkout (and see the stack at Payment), but lack a **pre-cart** Offers discovery surface in nav/IA. |
| Untested | Whether marketing Home/Drops copy currently carries codes = partial `UNVERIFIED` without browser. |
| Recommended change | Product disposition: accept GTM without a pre-cart Offers/Deals route (with an explicit **pre-cart discovery** audit note — not a Cart-only exception), or schedule a governed pre-cart Offers discovery surface under #379 / offers discovery docs. **Do not** add an unapproved Deals/Offers route from this note; not shadow IMP-036K. |
| Owner / next gate | Customer Product / #379; coupon correctness remains IMP-036J / #381/#384 lanes. |
| Disposition candidate | `OPEN` (narrowed to pre-cart discovery) |

### CX-P6 — “Customize / Make it yours” capability empty on static seed catalog

| Field | Value |
|---|---|
| Severity | **P2 brand-promise vs assortment** (proposed) |
| Journey | Customization |
| Class | **Experience debt / content** — live modifiers `UNVERIFIED` |
| Evidence class | `VERIFIED` static seed; live DB = `UNVERIFIED` |
| Provenance | `MenuItemRow` opens customize only when `modifierGroups?.length > 0`. Static import `data/platform/imports/existing-menu-v1.json`: 74 products, **0** variants with modifier groups (counted this pass). Aligns with #476 “no structured modifiers” note — **not** a re-audit of media/parity rows. Brand voice retains Customize / Make it yours. |
| Impact hypothesis | Customization UI and copy exist; seeded assortment never exercises them. If live menu also has no modifiers, brand customization language over-promises. |
| Untested | Effective `projectCustomerMenu` modifier groups in any live DB = `UNVERIFIED` (no DB read). |
| Recommended change | Content/assortment disposition: add real modifiers through governed menu publication, or soften Customize language until assortment supports it. |
| Owner / next gate | Menu content owner; catalog publication path. Not a JSON-only delete. Cross-check #476 live parity hold. |
| Disposition candidate | `OPEN` |

### CX-P7 — Canonical Experience Debt Register still NOT_PERFORMED

| Field | Value |
|---|---|
| Severity | **P1 process gate for IMP-040** (proposed) |
| Journey | Pre-GTM audit programme |
| Class | **Process / experience debt register gap** (not a UI bug) |
| Evidence class | `VERIFIED` |
| Provenance | `docs/platform/EXPERIENCE-DEBT-REGISTER.md` EDR-1: `auditStatus=NOT_PERFORMED`, `FINDINGS=NONE`. EXP-1 / PD-2 require `PRE_GTM_CUSTOMER_EXPERIENCE_PRODUCT_LANGUAGE_AND_INSTRUMENTATION_AUDIT` before public GTM / IMP-040. This delta and held #475/#476 are **candidates only**. |
| Impact hypothesis | `FINDINGS=NONE` must not be read as “no known issues.” Launch acceptance cannot claim the mandatory audit done. |
| Recommended change | After evidence packages are Founder-reviewed, separately authorize EDR promotion. Do not edit canonical EDR in this wave. |
| Owner / next gate | Founder audit-evidence disposition per #455 (`READY_FOR_FOUNDER_AUDIT_REVIEW` vs `AUDIT_EVIDENCE_INCOMPLETE`). |
| Disposition candidate | `OPEN` (programme) |

### CX-P8 — Customer refund path is document/support-mediated; no self-serve refund request

| Field | Value |
|---|---|
| Severity | **P2 refund journey clarity** (proposed) |
| Journey | Refund / Cancellation aftermath |
| Class | **Experience debt / possible by-design** — needs product disposition |
| Evidence class | `VERIFIED` customer UI surface; statutory refund ops exist server-side |
| Provenance | Customer order detail shows `OrderFinancialDocuments` (Refund Voucher title covered in component tests) and support contacts. No customer “Request refund” control (`NOT_FOUND` in ordering components). `cancelCustomerScheduledOrder` documents that it does not create/reprice a Refund. |
| Impact hypothesis | EXP-1 lists Refund in audit scope. Customers may expect self-serve refund after cancel; actual path is support/ops + voucher. |
| Untested | End-to-end refund voucher visibility after cancel = `UNVERIFIED`. |
| Recommended change | Explicit Product/Experience statement that customer refund request is out of GTM scope (support-mediated), or authorize a later slice. |
| Owner / next gate | Product Definition / Experience Gate for a future slice; not IMP-036K by default. |
| Disposition candidate | `OPEN` |

---

## 2. Explicitly not reopened here

| Topic | Why excluded |
|---|---|
| #391 equal-payable payment-start → Review | Covered by #475 |
| #377 unavailable item cart/checkout recovery | Covered by #475 (issue CLOSED; residual identification gaps stay in that package) |
| Menu image remap / static↔DB merchandising rows | Covered by #476 |
| UOE AS-01..46 / 21 negatives full matrix | Covered by #456 |
| #381 / #384 intermittent commerce UAT | Owned by other wave lanes / Product GTM correctives; #384 remains OPEN — not re-diagnosed here |
| XR-010 NVDA interactive PASS/FAIL | Occupied human session; this lane Phase 1 only → accessibility interactive proof = `UNVERIFIED` |
| IMP-036K / WXE Fit / UOE Design grant | Not authorized |

---

## 3. Decision-ready UOE QT/MI residuals (pointer only — do not re-litigate #456)

From held PR [#456](https://github.com/nivedhya11/BobaBear/pull/456) evidence delta on stacked #424 (not merged-main authority):

| Residual | Status to preserve | Founder decision surface |
|---|---|---|
| Design / Quality / Measurement finalization | `NOT_GRANTED` | `22-founder-gate-review-packet.md` / `16-…` §1.1 |
| AS-34, AS-41 (+ Checkout-coupled Schedule rows) | `BLOCKED_DR06` + `PRESERVE_RED`; reproducing run `NOT_EXECUTED` | Authorize UOE-DR-06 separately or withhold Schedule-capable Checkout claims |
| Vendor / retention | `UNKNOWN` | Required before any new stored marketing/UOE event |
| WhatsApp Meta body / on-wire | `UNKNOWN` / `NOT_APPROVED` | MC-34 excluded |
| CART provenance schema / HMAC | `NOT_AUTHORIZED` / V1 HMAC forbidden | Do not invent |
| Formal IMP allocation (UOE-DR-01) | `NOT_ALLOCATED` | Not IMP-036K |

Main-tree CX findings CX-P1..P8 do **not** grant or deny those UOE gates.

---

## 4. Suggested Founder triage order

1. **CX-P1** — cancel promise vs missing customer surface (trust-critical, server already exists; source mismatch demonstrated; interactive UAT not claimed).
2. **CX-P2** — privacy ↔ GA honesty **if/when** GA is active in a deployed build; verify published-build behaviour before enablement (not a verified live tracking incident).
3. **CX-P3** / **CX-P7** — instrumentation audit posture + EDR still not performed.
4. **CX-P4** / UOE orientation residual — with #456 Design packet, not a silent main hotfix claim.
5. **CX-P5**, **CX-P6**, **CX-P8** — **pre-cart** Offers discovery / customization / refund disposition for GTM scope (Cart/Checkout/Payment offer surfaces already exist).

```text
FOUNDER_AUDIT_EVIDENCE_DISPOSITION = AUDIT_EVIDENCE_INCOMPLETE
REASON = Phase-1 source delta only; interactive journeys, live menu DB, staging GA env, and XR-010 a11y remain UNVERIFIED; canonical EDR unchanged
COMPREHENSIVE_PRE_GTM_AUDIT = NOT_CLAIMED
EDR_PROMOTION = NOT_AUTHORIZED
PR_MERGE = HOLD
```

---

## 5. Compliance

```text
PROMPT_DEVIATIONS = NONE
DUPLICATED_456_AS_MATRIX = NO
DUPLICATED_475_PURCHASE_TRUST = NO
DUPLICATED_476_MERCHANDISING_PACKAGE = NO
RUNTIME_UI_CHANGED = NO
CANONICAL_EDR_CHANGED = NO
INSTRUMENTATION_ENABLED = NO
UOE_OR_WXE_GATE_CLAIMED = NO
IMP036K_ACTIVATED_CLAIM = NO
XR010_SESSION_UNTOUCHED = YES
STATUS = COMPLETE
```

---

## 6. R2 correction (2026-11-03) — Codex CX-P5 + CX-P1/P2 clarification

Addresses unresolved Codex review thread on PR [#541](https://github.com/nivedhya11/BobaBear/pull/541#discussion_r4446841605).

| Item | Correction |
|---|---|
| CX-P5 | Narrowed to **missing pre-cart Offers discovery**. Documented existing `CheckoutClient` `CommercialOfferStack` + `CouponField`, and `PaymentPanel` `CommercialOfferStack`. Withdrew incorrect “Cart-only Offers” / Cart-only audit exception. |
| CX-P2 | Marked **conditional** on GA active in the deployed build; not a verified live tracking incident; A0 GA OFF ≠ proof for every published route. |
| CX-P1 | Retained demonstrated **source** cancellation-promise mismatch; explicitly **no interactive UAT claimed**. |

```text
CODEX_CX_P5_FINDING = ADDRESSED_IN_SOURCE
CART_ONLY_OFFERS_CLAIM = WITHDRAWN
UNAPPROVED_DEALS_ROUTE = NOT_ADDED
INTERACTIVE_UAT_CLAIMED = NO
R2_DOCS_ONLY = YES
PROMPT_DEVIATIONS = NONE
```
