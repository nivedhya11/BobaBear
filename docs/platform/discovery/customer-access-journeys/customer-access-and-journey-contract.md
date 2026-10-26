---
Status: FOUNDER_DECISION_RECONCILED_SUPPORTING_CANDIDATE
Authority: SUPPORTING_DISCOVERY_ONLY
Version: CJ-ACCESS-CANDIDATE-2
Founder routing decision: Option B approved 2026-10-26; D-387 staged in DR-27 candidate
Mainline decision authority: pending integration of D-385/D-386 prerequisite and D-387
Implementation authorization: NO
Current slice / accepted status: unchanged
---

# BOBA Bear — Customer Access, Location and Journey Contract

## 1. Purpose and boundaries

Consolidate who can do what before and after phone OTP sign-in, when Delivery/Pickup and timing are selected, how an outlet is chosen, and the recovery stories that need end-to-end proof. This is a **supporting journey and product-discovery contract**, not a replacement for Product Definition, Experience Definition, LANG-1 or the accepted capability architectures.

**Founder-approved routing direction:** Option B (nearest eligible Delivery outlet) replaces routing-priority-first winner order **only when D-387 is integrated into canonical decision authority**. It does not authorize a runtime change. The preceding D-385 and D-386 are separately approved but not yet merged to main.

**Accepted lifecycle at source checkpoint:** accepted through IMP-036I; current IMP-036J implementation complete, pending Founder functional/experience UAT and acceptance; IMP-036K implementation not authorized; IMP-038 held. No lifecycle advancement follows from this document.

**Experience principle:** Browse freely. Choose deliberately. Pay confidently. Return effortlessly.

## 2. Customer identity and access matrix

| Capability or surface | Signed-out / guest | Signed-in customer | Owning boundary |
|---|---|---|---|
| Brand home / The Den, real editorial Drops | Browse | Browse | Existing public brand content; creative names not new routes |
| Menu, search, categories, item detail | Browse published effective Menu | Same | Customer Menu projection; no new catalog/pricing authority |
| Configure item, choose variants/modifiers | Allowed | Allowed | Menu configuration; explicitly selected positive-price extras |
| Create and modify Cart | Guest-credential purchase intent | Customer-owned Cart | Cart ownership and revision; not final payable |
| Add/apply public coupon | Allowed; final application depends on eligibility | Allowed | Existing IMP-036J shared Cart/Review coupon state |
| Apply identity-restricted coupon | May enter; eligibility can require sign-in | Eligible only after identity validation | Coupon/Promotion authority |
| View automatic eligible Offer | Only when evaluator can substantiate result | Same | Commercial evaluator |
| Continue to authenticated Checkout | Phone OTP, then return | Continue | Accepted Checkout customer trust |
| Delivery/Pickup and ASAP/Scheduled commitment | No guest-owned Checkout | Choose in Checkout | Mutable Checkout; purchased Snapshot seal |
| Saved addresses, default, profile, order history | Denied | Own resources only | Customer account/address/order authority |
| One-time Delivery address without saving | No guest Checkout | Backend supports; user-facing shortcut is D7 *candidate* | Checkout delivery destination, not address book |
| Final Review and Payment initiation | Sign-in required first | Allowed with current authoritative checks | Checkout/Payment |
| My Orders, customer financial documents | No cross-account access | Own purchased records | Order/FD owner scope |
| Generic Order Again shortcut | Deferred | Deferred | Future capability, not a currently accepted action |
| General self-service cancel/refund | Deferred | Deferred, except eligible Scheduled cancellation | IMP-036I sealed cutoff applies to purchased Scheduled orders |

The existing Checkout login boundary is **Cart → Checkout**, not first Menu visit or an added login at Pay. Razorpay/provider verification is separate from BOBA Bear OTP. Customer profile completion remains optional where accepted.

## 3. Locked versus future choices

**No new decision needed:**
- **D1:** Guest entry of unrestricted coupons remains allowed (IMP-036J); identity-restricted codes may require login.
- **D2:** Phone OTP before authenticated Checkout, Cart claim/reconciliation without silent loss (D-370).
- **D3:** Delivery/Pickup mode and ASAP/Scheduled timing committed through Checkout; Snapshot seals purchased facts (D-378/D-379).
- **D8:** Exactly one eligible Pickup outlet auto-selected; multiple eligible require customer selection. Pickup never needs Delivery address/GPS/radius/charge (IMP-036H).

**Founder-approved future direction, still held (D4/D5):** IMP-036B §6.1 and IMP-038 envisage a signed-out Dehradun city label and login gating before changes to precise delivery location / Google Maps, Places, reverse-geocode. This does not erase accepted earlier anonymous-location behavior, automatically ask for GPS, or activate IMP-038.

**D6 now approved for decision recording:** Nearest eligible Delivery outlet with routing priority and outlet ID as tie-breakers, per D-387 staged decision text. Current runtime is still routing-priority-first until authorized engineering and deployment. Provisional Menu outlet context is not final Checkout merchandise eligibility. D-387 does not decide whether a nearer outlet that cannot fulfil the configured Cart should yield to a farther outlet; that cross-outlet fallback remains an open product choice. Existing merchandise and Checkout recovery applies, with no silent item or outlet substitution.

**D7 remains a candidate:** Signed-in customers may use a one-time delivery destination without mandatory saving; source backend already supports ONE_TIME_ADDRESS but this document does not authorize a UI change or modify saved-address authority.

## 4. Intended journey and authority boundary

**Brand / Menu → customize → guest Cart → optional unrestricted coupon → Checkout CTA → phone OTP if needed → claim/reconcile guest Cart → choose Delivery or Pickup → select applicable destination or Pickup outlet → choose ASAP or Scheduled, using server-provided windows → Review authoritative terms and coupon → Payment → confirmed Order → My Orders.**

Detailed rules:

- Do not force Delivery/Pickup or a time slot at brand-home entry. An optional early preference is **non-binding** and must not create a second Checkout state machine.
- For Delivery, a location or default saved address can be suggested for confirmation; a city label alone is not delivery eligibility. Device GPS is permission-based and no automatic precise location collection is authorized.
- Coordinates and the server's configured radius determine geographic candidates; under staged D-387, distance decides the nearest eligible Delivery winner. Discovery Menu context does not guarantee full-Cart eligibility or actual Checkout payable.
- At purchase, complete configured merchandise, operational status, scheduling/window and money are reevaluated. Pickup uses its independent enabled-outlet policy, without Delivery serviceability.
- Mode, location, item/variant, coupon, outlet or timing changes invalidate/recheck affected terms. Customer Cart intent is preserved unless the customer deliberately edits it. Once purchased, Order references the immutable Snapshot.
- An unresolved Payment must not encourage a duplicate attempt. Successful confirmation is based on authoritative Order/Payment truth.
- Logging out must remove browser authority over customer-only Cart, account and addresses; investigate any sessionStorage label or saved-address reference left visible after sign-out.

## 5. Complete discovery journey inventory

These IDs are local trace keys, **not ROADMAP IDs, new capabilities, or acceptance verdicts**.

| ID | Flow to verify | Status and owning source |
|---|---|---|
| CJ-01 | Signed-out brand discovery | Existing public brand; new editorial labels governed only for creative use |
| CJ-02 | Signed-out Menu/search/categories | Accepted Customer Menu projection |
| CJ-03 | Guest product configuration and explicit extras | Accepted Cart/Catalog; D-369 |
| CJ-04 | Guest add/edit/remove/quantity Cart | Accepted guest Cart and Cart ownership |
| CJ-05 | Guest public coupon and identity-restricted prompt | IMP-036J implemented; Founder acceptance pending |
| CJ-06 | Cart → sign-in OTP → return to Checkout | Accepted login boundary |
| CJ-07 | Guest Cart claim, authenticated reconciliation/conflict | D-370 binding policy; full implementation conformance still needs exact proof |
| CJ-08 | Own saved address and default selection | Accepted customer Addresses/Checkout |
| CJ-09 | Device location permission, confirmation, denial | Accepted interaction; future auth gate remains held |
| CJ-10 | Nearest eligible Delivery outlet wins | Founder D6 approved, D-387 staged; runtime change NOT authorized |
| CJ-11 | One-time delivery address without saving | Existing Checkout input; standalone UX choice D7 candidate |
| CJ-12 | Delivery ASAP | Accepted IMP-036H/earlier |
| CJ-13 | Pickup ASAP single/multi-outlet | Accepted IMP-036H |
| CJ-14 | Scheduled Delivery and server windows | Accepted IMP-036I |
| CJ-15 | Scheduled Pickup and server windows | Accepted IMP-036I |
| CJ-16 | Switch Delivery↔Pickup and preserve Cart | Accepted D-378/IMP-036H; reevaluation |
| CJ-17 | Address/outlet re-evaluation prepayment | Accepted Serviceability/Checkout; D-387 ranking future |
| CJ-18 | Product unavailable after Cart add | Accepted recovery intent; named-item implementation verify |
| CJ-19 | Coupon eligibility changes | IMP-036J implemented; UAT pending |
| CJ-20 | Expired/unavailable Scheduled window | Accepted IMP-036I recovery |
| CJ-21 | Genuine price/structural change before Pay | Checkout Snapshot/Payment; must not claim money changed if only structure differs |
| CJ-22 | Payment failed, pending or uncertain | Accepted Payment/Order recovery, no double charge |
| CJ-23 | Order confirmed, receipt and status | Accepted Order/Financial Document truth |
| CJ-24 | Returning customer own purchase/history | Accepted authenticated Orders/My BOBA |
| CJ-25 | Sign-out, next customer on same browser | D-370 policy; location-context privacy regression to test |
| CJ-26 | One-tap Order Again | Deferred |
| CJ-27 | The Fits / The Scene editorial concepts | Brand creative only; commerce and unbuilt editorial routes deferred |
| CJ-28 | Cancellation/refund | Accepted Scheduled customer cancel before sealed cutoff; no reschedule; general self-service cancel/refund deferred |

Each CJ row is a **traceability index**, not a claim that current main has a passing latest browser proof. Cross-link existing Product Definition stories, actual acceptance tests, and relevant Golden Journeys when allocating authorized implementation work.

## 6. Failure and recovery matrix

Representative tests before approving affected customer changes:

| Scenario | Required customer-safe result |
|---|---|
| OTP denied/expired / session expired | Reauthenticate; preserve the guest Cart where valid |
| Both guest and customer Carts present | Reconcile or explicitly surface conflict; no silent winner |
| Guest coupon needs personal eligibility | Prompt for login without falsely applying a saving |
| No precise destination / GPS permission denied | No fabricated Delivery serviceability; appropriate location recovery |
| Saved address lacks coordinates | Confirm precise destination before orderability |
| No Delivery/Pickup outlet eligible | Truthful unavailable state; Cart remains usable |
| Nearest eligible outlet cannot fulfil a configured Cart line | Existing merchandise and Checkout recovery names the failure and preserves Cart lines. D-387 does not authorize a farther outlet. That cross-outlet fallback remains an open product choice |
| Changed outlet/Delivery mode/scheduled window | Revalidate and present current order / time / payable |
| Coupon expires or mode restriction applies | Explain existing evaluator result without fabricated saving |
| Payment attempt uncertain after browser reload | Provider-state verification and recovery; no duplicate payment action |
| Customer A signs out; Customer B signs in | No leak of Customer A Cart, address, profile or Orders |
| Scheduled cancellation at/after sealed cutoff | Deny through accepted cutoff policy; no invented general cancel |

## 7. Measurement and language

Any future instrumentation needs the existing measurement/security authority and privacy minimization. Do not record raw coordinates, OTP values or personally identifying address contents as default analytics. Potential measures: Guest→Cart, Cart→OTP completion, OTP→Checkout return, address-selection failure, Delivery/Pickup choice, chosen scheduled window, coupon application/recovery, Checkout completion, payment recovery and purchased orders.

The adopted **BB-VOICE-1.0** applies to brand/editorial expression, while **LANG-1** owns actual human-readable customer promises, money and error states. Current primary navigation stays **Menu · Drops · Sign In/My BOBA · Cart**; no new The Den, The Fits or The Scene global items are authorized.

## 8. Adoption status

\`\`\`text
FOUNDER_D6_OPTION_B = APPROVED_2026-10-26
D387_REGISTER = STACKED_CANDIDATE_ON_UNMERGED_DR26
D1_D2_D3_D8 = EXISTING_LOCKED_CONTRACTS
D4_D5 = FUTURE_AUTH_HARDENING_HELD
D7 = PRODUCT_UX_CANDIDATE
RUNTIME_NEAREST_ROUTING = NOT_IMPLEMENTED
CROSS_OUTLET_CART_FALLBACK = OPEN_PRODUCT_CHOICE_NOT_D387
PRODUCT_EXPERIENCE_GATES = NOT_GRANTED_BY_THIS_DOCUMENT
ROADMAP_STATE = UNCHANGED
IMP036K_IMPLEMENTATION = NOT_AUTHORIZED
IMP038_HOLD = PRESERVED
\`\`\`

This supporting contract does not grant implementation, acceptance, deployment, feature flags or release authority.
