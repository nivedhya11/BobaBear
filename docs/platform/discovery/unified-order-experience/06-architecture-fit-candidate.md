<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: ARCH-UOE-FIT-CANDIDATE-3 -->

# Architecture Fit candidate — Unified Order Experience

```text
CANDIDATE_ID = ARCH-UOE-FIT-CANDIDATE-3
SUPERSEDES = ARCH-UOE-FIT-CANDIDATE-2
STATUS = ARCHITECTURE_FIT_EVALUATION_PERFORMED
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
ARCHITECTURE_FIT_EVALUATION = PERFORMED
ARCHITECTURE_FIT_RECOMMENDATION = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
FORMAL_ARCHITECTURE_FIT_PASS = NOT_GRANTED
ARCHITECTURE_LOCKED = NO
ARCHITECTURE_LOCK_PROPOSAL = ARCH-UOE-LOCK-PROPOSAL-1
ARCHITECTURE_LOCK_PROPOSAL_STATUS = DECISION_READY
DESIGN_READINESS_PASS = NO
IMPLEMENTATION_AUTHORIZED = NO
PREREQUISITE_GATES = Product Definition Gate PASS + Experience Gate PASS (recorded 2026-10-23)
FOUNDER_GATE_DECISION_REFERENCE = https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6365686428
REVIEWED_PACKAGE_HEAD = dbe0786280fac4ba80ba727c7510b8c23da69ed1
FIT_EVALUATION_HEAD = ecbfb4f4f7f06a888e0a3c4417bc1c647239974b
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION = YES
PROVENANCE_STORAGE_PROPOSAL = ADDITIVE_NULLABLE_CONTEXT_FIELDS_PLUS_SERVER_CONTEXT_DIGEST
```

## Fit summary

Viable **without** new domain aggregates, deployable services, roles, permissions, schema
renames, or a second commercial authority **if and only if**:

1. Browsing presentation state remains non-authoritative for sealed money and sealed promise
2. Geographic confirmed facts have a single owner (reuse delivery-context)
3. Exact Schedule slots come only from server lists at **eligible checkout** (UOE-DR-02 deferred)
4. Pre-checkout Takeaway eligibility and mode-sensitive Cart quotes reuse **existing server
   eligibility / cart-evaluate authorities** as read/quote surfaces (UOE-DR-05), with
   **Now vs Schedule-capable** distinguished per accepted IMP-036H/I (GP-01)
5. Open non-terminal Checkout Snapshot reuse wins over browse mode/outlet (GP-02 / AS-29);
   missing commercial-evaluation evidence fails closed (AS-39 / AS-45)
6. Timing-sensitive advisory Cart quotes honour promotion mode/timing gates without Menu
   guarantees of slots or final promo price (Contract B)
7. Empty-cart / no-cart eligibility presentation is not conflated with UNAVAILABLE (GP-03)
8. Presentation `sessionStorage` stays tab-scoped; no cross-tab money/seal sync (GP-04)
9. `PAYMENT_PENDING` isolation and Snapshot/payment authorities are unchanged
10. WhatsApp remains optional / may be noop; DR-04 does not claim it is active in every environment

**Fit evaluation:** Independent documentation-only evaluation performed after Product Definition
Gate PASS and Experience Gate PASS (X2/X3 prerequisite satisfied).
**Recommended variant:** `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` (Contracts A/B/C/D below).
**Formal Fit PASS:** `NOT_GRANTED` (agent must not self-grant). Architecture Lock: `NO`.

## Binding authorities reused (unchanged)

| Authority | Use |
|---|---|
| D-378 / ADR-018 / ARCH-G28 | Mode `DELIVERY` \| `PICKUP`; pickup execution boundary |
| D-379 / ADR-019 / ARCH-G29 | Timing `ASAP` \| `SCHEDULED`; sealed windows; bind revalidation |
| Checkout Snapshot | Sole sealed commercial / fulfilment commitment at pay |
| Checkout evaluate | Authoritative checkout commercial recomputation |
| Cart evaluate | Advisory cart quote (existing); mode-sensitive extension remains quote-only |
| Payment (D-361+) | Idempotency, webhook truth, client-evidence — unchanged |
| Serviceability | Coordinate-authoritative delivery eligibility |
| ASAP pickup eligibility | `listEligiblePickupOutletsForCheckout` / `assertPickupOutletEligible` — accepting-now |
| Scheduled pickup profile / windows | `assertScheduledPickupProfile` + `listServerScheduledWindows` / checkout scheduled-windows — IMP-036I |
| Cart revision / D-370 | Purchase-intent preservation across auth |
| `boba.delivery-context.v1` | Geographic browse session facts (tab-scoped `sessionStorage`) |

## Verified current behaviour (package base / post-PR #425 main)

| Fact | Evidence | Classification |
|---|---|---|
| ASAP pickup eligibility requires accepting-now | `pickup-eligibility.ts` (`effectiveState !== "accepting"` → not eligible) | Accepted IMP-036H Now path |
| Empty cart → ASAP pickup list `[]` | `listEligiblePickupOutletsForCheckout` early return | Accepted; GP-03 presentation debt |
| `listCheckoutPickupOptions` always uses accepting-now list | `pickup-options.ts` → `listEligiblePickupOutletsForCheckout` only | **ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT** (UOE-DR-06) vs IMP-036I Journey-I-C / AC-036I-040; remediation preferred separately; implementation NOT_AUTHORIZED here |
| CheckoutClient Takeaway composition | Mode → `listCheckoutPickupOptions` → select → `setCheckoutFulfilment(PICKUP, outlet)` → **`evaluateCheckout`** (timing null→`ASAP` → `assertPickupOutletEligible`) → Timing (`chooseFulfilmentMode` / `continuePickupWithOutlet` / `openTiming`) | Accepting-now gate applied **twice** (list + post-bind evaluate) before Schedule can be chosen |
| ASAP merchandise check denies current-schedule | `listEligiblePickupOutletsForCheckout` → `cartMerchandiseFulfilableAtOutlet` without `ignoreCurrentScheduleDenial` | Schedule-capable list must not reuse that denial; SCHEDULED domain path uses `ignoreCurrentScheduleDenial: true` |
| NO_TIMES copy offers ASAP unconditionally | `scheduled-customer.ts` empty windows message | AS-37 evidence — Now offer only if accepting-now still eligible |
| SCHEDULED PICKUP evaluate/prepare uses scheduled profile gates, not accepting-now | `checkout/evaluate.ts` / `prepare.ts` → `assertScheduledPickupProfile` | Accepted IMP-036I domain (correct) |
| SCHEDULED bind revalidation uses scheduled profile for PICKUP | `scheduled-bind.ts` → `assertScheduledPickupProfile` | Accepted IMP-036I (correct) |
| Scheduled windows compose hours / lead / closed-full-day / profile | `scheduled-eligibility.ts` + `listCheckoutScheduledWindows` | Accepted; checkout-eligible only |
| `evaluateCart` without `location` returns `REQUIRES_FULFILMENT_CONTEXT` **before** reuse | `cart/evaluate.ts` lines ~138–145 before `tryReusableCheckoutEvaluation` | **Fit gap** — blocks Takeaway open-Checkout reuse without Delivery address (GP-02) |
| Open Checkout reuse when reached | `tryReusableCheckoutEvaluation` for DRAFT / READY_FOR_PAYMENT / PAYMENT_PENDING + same cart revision + active Snapshot | Correct when reachable |
| Missing CHECKOUT commercial evaluation → `null` → fall through | `tryReusableCheckoutEvaluation` when no evaluation / no wire | **Fit gap** — must not fall through to divergent browse money (AS-39) |
| CART commercial persistence lacks mode/outlet provenance fields today | `persistCommercialEvaluation` CART-scope | Fit gap for AS-32 |

## Reuse vs extend

| Concern | Reuse | Extend | Forbidden |
|---|---|---|---|
| Mode / timing enums | Server fulfilment APIs | Earlier intent UX; labels | Enum rename |
| Delivery geo | delivery-context, LocationSelector, serviceability | Mode-aware bar; orientation vs confirmed copy | Second confirmed-geo store; cross-tab money sync |
| Takeaway Now eligibility | ASAP pickup eligibility domain | Pre-checkout read exposing same accepting-now eligibility + selectionPolicy | Client-invented outlet list; silent bind |
| Takeaway Schedule capability | Scheduled pickup profile gates (+ hours/scheduling foundations used at Checkout) | Pre-checkout **capability** presentation without Menu exact slots | Reject Schedule solely because closed NOW; Menu exact-slot API; guaranteed availability claim |
| Checkout pickup-options | Ownership-exact `listCheckoutPickupOptions` + fulfilment bind | **Timing-aware** Now vs Schedule-capable listing (or timing-intent-before-list order); capability-flagged presentation when timing unset | Keep accepting-now-only list for Schedule path; invent Menu slots; silent bind; weaken Checkout authorization |
| Cart pricing by mode / timing | `POST /api/v1/cart/evaluate` + `buildDirectPricingQuote` promotion context | Mode (+ outlet) + timing intent input; Takeaway without Delivery address; open-Checkout reuse **before** Delivery-only early return; missing-evidence fail-closed; provisional Offers when Schedule UNCONFIRMED; fingerprint/dedup | Second money authority; browse mutate Checkout; fall through to divergent browse quote; Menu guarantee of slot/final promo |
| Scheduling exact slots | `listCheckoutScheduledWindows(checkoutId)`, seal, bind revalidate | Compact UX; Menu **intent** only (DR-02) | Menu exact-slot preview API in V1; invent future availability |
| Menu projection outlet | Existing no_location / server outlet rules | May reflect proposed Takeaway outlet from server eligibility | Client-authored outlet |
| Cart / checkout | evaluate, prepare, PAYMENT_PENDING freeze | Bar calls same guards; pre-checkout reads never mutate pending checkout | Client payable; browse mutate pending checkout |
| Workforce | Existing ops surfaces | Primary label Takeaway; collection task verbs | Domain rename |

## UOE-DR-05 — Smallest required read / quote contracts

These are **candidate contracts** for Architecture Fit evaluation. Exact HTTP path naming is an
implementation detail within the semantic bounds below. They do **not** authorize implementation.

### A. Pre-checkout Takeaway outlet eligibility (read-only, timing-aware)

```text
PURPOSE: Server-authoritative Takeaway collection options before Checkout bind
AUTHORITY: Compose existing ASAP pickup eligibility + scheduled-pickup profile foundations
NOT AUTHORITY FOR: Checkout bind, Snapshot, payment, sealed fees, exact Menu slots, guaranteed future availability
```

| Dimension | Smallest contract |
|---|---|
| Inputs | `brandId` + existing cart credential (guest token and/or customer session as today for cart reads) + **timing intent** `ASAP` \| `SCHEDULED` (or equivalent Now/Schedule). **No** `checkoutId` required. Optional generation / request id for race discard. |
| Cart-line precondition | If no active cart **or** cart has zero lines → return distinct `cartState`: `NO_CART` \| `EMPTY_CART` with `outlets=[]` and **not** `selectionPolicy=UNAVAILABLE` meaning “brand has no stores” (GP-03) |
| Outputs (when cart has lines) | Customer-safe `outlets[]` + `selectionPolicy`: `UNAVAILABLE` \| `AUTO_SELECT` \| `CUSTOMER_SELECT` + per-outlet or aggregate capability flags: `nowEligible` and/or `scheduleCapable` as required by requested timing intent |
| Now (`ASAP`) semantics | Reuse accepting-now composition (`listEligiblePickupOutletsForCheckout` / `assertPickupOutletEligible` class). `closed_by_schedule` / not accepting → not Now-eligible |
| Schedule (`SCHEDULED`) semantics | Reuse schedule-capable gates aligned with `assertScheduledPickupProfile` (+ cart merchandise fulfilability with **`ignoreCurrentScheduleDenial: true`** parity to SCHEDULED evaluate/prepare/bind). **Must not** require accepting-now. Must **not** list exact Menu slots. Must **not** claim windows are guaranteed |
| Empty Now with Schedule candidates | When timing=`ASAP` yields no outlets, response must indicate whether schedule-capable candidates exist (aggregate hint / flag) so “offer Schedule” recovery is truthful — not a blind suggestion |
| AUTO_SELECT / CUSTOMER_SELECT | Computed **per timing intent**, never over a Now∪Schedule union. When timing unset and flags are returned, `selectionPolicy` must be `CUSTOMER_SELECT` (or no AUTO_SELECT); client must not pre-select. Propose ≠ bind unchanged |
| Must not | Bind `pickupOutletId` on Checkout; mutate cart lines; invent nearest-outlet client-side; fabricate `checkoutId` to call pickup-options / scheduled-windows; treat empty cart as UNAVAILABLE brand |

**Safety / privacy / races** — unchanged from CANDIDATE-2 except:

- Eligibility mirrors keyed by cart revision + timing intent + delivery-context fingerprint where relevant
- Re-read on surface resume / visibility / before Checkout handoff
- Checkout confirm revalidates with the **correct** timing gate (Now → accepting-now; Schedule → scheduled profile + window seal path)
- Multi-tab: presentation mirrors are tab-local; server remains source of truth on next read (GP-04)

### B. Mode-sensitive Cart evaluation (advisory quote) — GP-02

```text
PURPOSE: Advisory cart quote that reflects Delivery vs Takeaway (+ outlet when Takeaway)
AUTHORITY: Existing evaluateCart commercial engine — extended input + precedence only
NOT AUTHORITY FOR: Sealed Snapshot, pay readiness, inventing a parallel pricing service, mutating Checkout
```

| Dimension | Smallest contract |
|---|---|
| Surface | Extend existing `POST /api/v1/cart/evaluate` (or equivalent same evaluateCart entry) |
| Added inputs (optional) | `fulfilmentMode`: `DELIVERY` \| `PICKUP`; when `PICKUP`, optional `pickupOutletId` from server eligibility / customer selection; optional `fulfilmentTiming`: **`ASAP` only** when Now is explicit. Schedule UNCONFIRMED → **omit** `fulfilmentTiming`. Client-supplied `fulfilmentTiming=SCHEDULED` on CART evaluate is **unsupported → 400** (not sealed window; not promotion authority). Contract A may still use `SCHEDULED` for **capability-discovery** eligibility |
| Delivery path | Retain today’s `location` / coordinates path for Delivery serviceability-backed quotes |
| Takeaway path | **Must not require Delivery address/coordinates.** Takeaway quote uses outlet (+ cart) commercial path without inventing delivery fee/execution |
| PICKUP outlet re-assertion (Correction A consequence) | Server re-asserts supplied `pickupOutletId` belongs to `cart.brandId` before quoting. When `fulfilmentTiming=ASAP`: accepting-now gate. When `fulfilmentTiming` is **omitted** (Schedule UNCONFIRMED / timing-absent): composed Contract A gate — outlet must be accepting-now **or** schedule-capable so a Schedule-selected place can still receive an advisory quote **without** evaluating promotions as `SCHEDULED`. Same generic non-money problem class for nonexistent / cross-brand / ineligible ids |
| PICKUP without outlet | After open-Checkout reuse is attempted and does not apply: return `REQUIRES_FULFILMENT_CONTEXT` (or equivalent non-money status). **Never** invent a brand-level / guessed-outlet quote |
| Absence of mode | Preserve backward-compatible evaluate behaviour. Legacy location-only requests do **not** invent `fulfilmentMode=DELIVERY` for promotion context — mode-gated Offers stay `FULFILMENT_CONTEXT_REQUIRED` until mode is supplied |
| Outputs | Existing cart evaluation result shape **plus** explicit effective-mode/timing conveyance when reuse applies (below) — still **advisory**; may carry provisional-offer flags (below) |

#### Promotion eligibility by fulfilmentMode / fulfilmentTiming (verified + contract)

**Verified (code):** `evaluateEligibility` → `matchesModeTiming` honours promotion
`eligibleFulfilmentModes` / `eligibleFulfilmentTimings`. Missing required context →
`FULFILMENT_CONTEXT_REQUIRED`; mismatch → `FULFILMENT_MODE_MISMATCH` /
`FULFILMENT_TIMING_MISMATCH`. `buildDirectPricingQuote` already forwards
`fulfilmentMode` / `fulfilmentTiming` into `evaluatePromotions`. Checkout commercial paths
supply sealed Checkout mode/timing. **Cart evaluate today** does not yet pass mode/timing into
`buildDirectPricingQuote` (Fit gap for this contract).

| Situation | Required advisory behaviour |
|---|---|
| Mode known (Delivery or Takeaway + outlet when Takeaway) | Pass `fulfilmentMode` (+ outlet) into quote so mode-gated Offers evaluate truthfully via **server-evaluated mode context** |
| Timing known as Now (`ASAP`) | Pass `fulfilmentTiming=ASAP` |
| Timing = Schedule **intent** only (UNCONFIRMED; no Checkout-sealed window) | **V1 lock:** unconfirmed Schedule intent **must not** become evaluated `fulfilmentTiming=SCHEDULED`. Client **omits** `fulfilmentTiming` from Cart evaluate so timing-restricted Offers stay `FULFILMENT_CONTEXT_REQUIRED`. Mode-gated Offers may still apply when mode (+ outlet when Takeaway) is known. UI may say savings **may change when you confirm your time** — never a locked SCHEDULED-only discount at Menu. Tab-local / request-context keys may distinguish Schedule intent for stale-response rejection without making that intent promotion authority |
| Client supplies `fulfilmentTiming=SCHEDULED` on CART evaluate | **V1 unsupported → 400.** Must not silently qualify SCHEDULED-only advisory savings. (Contract A `SCHEDULED` eligibility intent remains valid for capability discovery.) |
| Mode or required timing absent | Mode/timing-restricted promotions must not apply; reason codes above; never invent eligibility |
| Open Checkout reuse applies | Snapshot / CHECKOUT-scope evaluation wins; do not recompute a competing browse promo total for that cart revision. Effective Checkout timing may be server-authoritative `SCHEDULED` — that is Checkout reuse authority, **not** client-authorized CART timing |

**Forbidden at Menu / pre-checkout:**

- Guaranteeing a scheduled collection slot
- Presenting advisory / provisional Offer savings as final payable or Snapshot truth
- Client-side promotion eligibility that bypasses server evaluate

#### Timing-sensitive provisional-offer messaging (experience + quote contract)

When Schedule is only browse intent (DR-02 UNCONFIRMED) or mode/outlet is proposed not Checkout-bound:

| Allowed | Forbidden |
|---|---|
| Server advisory quote with clear **provisional / may change** offer messaging | “Your discount is locked” / final price at Menu |
| Threshold progress / “add ₹X more” that does not invent mode/timing eligibility | Applying SCHEDULED-only Offers as if a window were sealed |
| Recompute after Checkout confirm of mode / outlet / window | Treating Menu display price (D-368) as commercial seal |

#### Open Checkout Snapshot reuse precedence (mandatory)

If an active non-terminal Checkout exists for the **same cart revision** with an active Snapshot
and status ∈ {`DRAFT`, `READY_FOR_PAYMENT`, `PAYMENT_PENDING`}:

1. **Attempt reuse before** any browse-mode/outlet-dependent serviceability, availability, or
   pricing computation — including the Delivery-location early return
   (`REQUIRES_FULFILMENT_CONTEXT` without `location` must not run first for an otherwise
   reuse-eligible open Checkout).
2. **Reuse wins** over any requested browse `fulfilmentMode` / `pickupOutletId` / Delivery location
   (today’s `tryReusableCheckoutEvaluation` / `reusedCheckoutEvaluation: true` intent).
3. Reuse must be reachable for Takeaway open Checkouts **without** requiring a Delivery `location`.
4. Response **must convey effective Checkout mode** (at minimum: `reusedCheckoutEvaluation: true`
   and the Checkout’s `fulfilmentMode`, and timing when material to chrome). UI shows Checkout mode
   as authoritative; browse intent may remain visible as non-authoritative preference only if it
   does not imply a different payable.
5. Reused PICKUP projection must **not** present a Delivery charge line (use Snapshot charges only;
   today’s zero delivery line on PICKUP reuse is a Fit gap).
6. `selectedOutletId` under reuse comes from Snapshot only (not browse outlet fallback).
7. Server must **not** compute a divergent recomputation for that cart revision — especially under
   `PAYMENT_PENDING`.
8. Browse intent must **not** call fulfilment / destination / timing mutations on that Checkout.

#### Missing commercial-evaluation evidence (mandatory — AS-39 / AS-45)

When reuse preconditions hold (active non-terminal Checkout, same cart revision, active Snapshot)
but the corresponding CHECKOUT-scope commercial evaluation row / explanation wire **cannot** be
retrieved or decoded, **or** the reuse probe throws:

| Allowed | Forbidden |
|---|---|
| Return a fail-closed status such as `EVALUATION_INDETERMINATE` (or equivalent) that forces calm Checkout / recovery UX | Fall through to Delivery serviceability + browse `buildDirectPricingQuote` for a divergent payable (today’s `catch → null` fall-through is the Fit gap) |
| Optionally project **already-sealed Snapshot money fields** as Checkout-sourced display only when that projection does not invent a new commercial evaluation | Invent browse totals, invent delivery fees for PICKUP, or present browse mode as the payable |
| Preserve `PAYMENT_PENDING` freeze; recovery-first UX | Mutate Checkout from browse; recompute under pending payment |

**Revision mismatch under `PAYMENT_PENDING`:** when `sourceCartRevision` ≠ current cart revision,
reuse does not apply; existing `cart_changed_unresolved` recovery governs. Any CART quote shown in
that state is non-payable advisory only — never presented as the pending Checkout payable.

Rationale: Snapshot remains commercial seal authority; missing measurement/explanation evidence is
not license to create a second money path.

#### Mode / timing / outlet provenance + fingerprint / deduplication (mandatory — AS-32 / AS-46)

| Concern | Rule |
|---|---|
| CART-scope persist (new quote, not reuse) | Record evaluated `fulfilmentMode`, `fulfilmentTiming` **only when actually evaluated into the quote** (`ASAP` or null in V1 — never client-claimed `SCHEDULED`), Takeaway `pickupOutletId` when known, and Delivery **`evaluated_priced_outlet_id`**. V1 does **not** populate `evaluated_delivery_location_hmac`; digest includes `delivery_location_hmac: null` (`13-…` §2) |
| CHECKOUT reuse | Retain Checkout/Snapshot provenance (`evaluationId`, sealed mode/timing/outlet); do **not** overwrite with browse intent |
| Evaluate context key (client + server discard key; **not** `commercial_evaluations.result_fingerprint` / working-tree fingerprint) | At minimum: `cartRevision` + **requested browsing** `fulfilmentMode` + browsing timing key + (Takeaway `pickupOutletId` \| Delivery location change key) + request generation. Server **echoes** the requested key for discard UX; must **not** persist, log, or treat it as provenance; delivery change key must not be a coordinate-derived hash undercutting V1 HMAC-disabled privacy. Browsing Schedule intent in this key is for **stale-response rejection only** — it must not become evaluated CART `fulfilmentTiming=SCHEDULED`. **Effective** Checkout mode/timing under reuse is conveyed separately and **must not** trigger a drop of a valid reuse response |
| Deduplication | Identical context key under the same in-flight generation must not present two competing payables; stale responses whose **requested** key ≠ current intent are **dropped**. On evaluate network failure after intent change: hide money / show calm retry — do **not** keep an old-key quote as current |
| Presentation mirrors | `eligibilityFlags` / quote mirrors keyed by the requested context key above; mismatch → drop, never invent |
| One quote source | Response presents either reused Checkout Snapshot quote **or** advisory CART quote — never both as competing payables |
| Snapshot-sourced display fallback | If projecting sealed Snapshot money without a CHECKOUT evaluation wire, mark the response distinctly (e.g. Snapshot projection without `commercialExplanation`) so UI cannot invent an offers breakdown |
| DRAFT without Snapshot | `tryReusableCheckoutEvaluation` returning null because there is no active Snapshot (or guest access) may fall through to the advisory CART quote — fail-closed applies only when an active Snapshot exists |
| V1 Delivery coordinate limitation | Same-priced-outlet coordinate changes with equal-money results may reuse CART `evaluation_id` (HMAC disabled). Distinct per-coordinate CART identity requires a future architecture/privacy decision |

#### DRAFT / READY_FOR_PAYMENT / PAYMENT_PENDING conflict behaviour

| Checkout status | Browse mode/outlet differs | Required behaviour |
|---|---|---|
| `DRAFT` | Yes | Reuse Snapshot/evaluate money for same cart revision; surface Checkout mode; do not mutate Checkout from bar; customer continues Checkout to change mode via existing Checkout APIs |
| `READY_FOR_PAYMENT` | Yes | Same as DRAFT; pay path still requires prepare + Snapshot authority |
| `PAYMENT_PENDING` | Yes | **Freeze preserved**; reuse only; recovery-first UX; bar must not call Checkout mutations; no divergent recomputation |

**Safety / privacy / races**

- Evaluate remains non-sealing; pay still requires Checkout prepare + Snapshot path
- Invalid mode/outlet combinations → server error/problem statuses; no client-fabricated totals
- Must not weaken PAYMENT_PENDING freezes (AS-29)
- Cart revision concurrency unchanged; stale evaluate responses discarded via generation tokens **and** fingerprint mismatch
- Mode/outlet/timing intent changes trigger a new evaluate **only when no blocking open-Checkout reuse applies**
- Impact banner / UI money displays only the latest successful server quote (or Checkout evaluate /
  Snapshot at Review); provisional Offer copy must not upgrade to sealed savings

### C. Checkout-owned Takeaway outlet listing + bind→timing→evaluate→prepare — GP-01 Checkout path

```text
PURPOSE: Server-authoritative Takeaway outlet options on an owned Checkout before bind,
  and a Schedule-viable bind→windows→evaluate→prepare sequence
AUTHORITY: Compose existing ASAP pickup eligibility + scheduled-pickup profile foundations
NOT AUTHORITY FOR: Menu exact slots; inventing future availability; silent bind; new lifecycle states
DEFECT_CLASSIFICATION (UOE-DR-06 ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT):
  (1) listCheckoutPickupOptions accepting-now-only
  (2) continuePickupWithOutlet → evaluateCheckout under default ASAP (assertPickupOutletEligible)
  Domain Schedule path already exists on evaluate/prepare/bind via assertScheduledPickupProfile.
  Canonical for: AC-036I-040 / FD-036I-15 (current pause ≠ unavailable tomorrow).
  US-036I-002 “IMP-036H rules” ambiguity resolved by Founder defect classification.
  Remediation: preferred separately scoped corrective after urgent payment work; NOT_AUTHORIZED here.
```

#### Exact eligible-Checkout journey — Scheduled Takeaway when closed now but schedule-capable (AS-34 / AS-41)

Addresses **both** defect surfaces: (a) pickup-options accepting-now filtering, and
(b) `evaluateCheckout` running before Scheduled time selection.

```text
1. Checkout Mode = Takeaway (PICKUP)
2. Timing intent for LISTING = Schedule (request input only — do NOT mutate Checkout to
   SCHEDULED + null window solely to unlock the list)
3. Timing-aware pickup-options → schedule-capable outlets
   (assertScheduledPickupProfile class + merchandise ignoreCurrentScheduleDenial: true)
   — NOT accepting-now-only filter
4. Customer confirms outlet
5. setCheckoutFulfilment(PICKUP, outletId) with optimistic expectedRevision
   — NO evaluateCheckout on this step for the Schedule path
6. listCheckoutScheduledWindows(checkoutId) — server-listed windows only
7. Customer selects a server window
8. setCheckoutFulfilmentTiming(SCHEDULED, window) with optimistic expectedRevision
9. evaluateCheckout — authoritative commercial recomputation
   (assertScheduledPickupProfile; promotions with sealed mode+timing)
10. Checkout Review (Snapshot / evaluate money)
11. prepareCheckoutForPayment — final payment prepare; scheduled bind revalidation
12. Pay (unchanged payment authority)
```

**Preserved throughout:** server-listed windows only; optimistic concurrency via expected
revisions; authoritative `evaluateCheckout` only after SCHEDULED+window; final payment prepare
unchanged; no new lifecycle states; no Menu exact slots; no guaranteed-availability claim;
no silent bind from browse.

| Dimension | Future implementation contract |
|---|---|
| Authorization | Unchanged ownership-exact Checkout actor checks; no guest fabrication of `checkoutId`; no weakening of BOLA |
| Order of operations (viable Schedule path) | Exact journey above. Forbidden: Mode → accepting-now-only list → bind → evaluate(ASAP) → Timing |
| Takeaway evaluate timing (all intents) | For Takeaway (`PICKUP`), `evaluateCheckout` runs **only after** `setCheckoutFulfilmentTiming` has confirmed Now (`ASAP`) **or** Schedule (`SCHEDULED`+window). Applies to Now, Schedule, and timing-unset listing paths — today’s post-bind evaluate-before-Timing must not remain for unset/Schedule. Do not write `SCHEDULED` with a null window solely to unlock listing |
| Intermediate gates | Between outlet bind and timing selection, **no accepting-now assertion may run**. Now eligibility for the Timing step’s disabled-Now control uses the per-outlet `nowEligible` flag from the timing-aware pickup-options response (re-read if stale), not an unconditional ASAP offer |
| Window seal | Sealed at `evaluateCheckout` (`sealEligibleScheduledWindow` class), not at `setCheckoutFulfilmentTiming`; revalidated at prepare/pay |
| Takeaway **Now** eligibility | Reuse accepting-now composition (`listEligiblePickupOutletsForCheckout` / `assertPickupOutletEligible` class) |
| Takeaway **Schedule-capable** selection | Profile gate aligned with `assertScheduledPickupProfile` **plus** cart merchandise fulfilability with **`ignoreCurrentScheduleDenial: true`** (parity with SCHEDULED evaluate/prepare/bind). **Must not** require accepting-now. **Must not** list exact slots here |
| Presentation | Customer-safe outlet fields only; `selectionPolicy` UNAVAILABLE / AUTO_SELECT / CUSTOMER_SELECT composed **per timing intent**. When timing unset and capability flags are shown: `CUSTOMER_SELECT` (no AUTO_SELECT over the union); client must not pre-select. Empty Now must carry a truthful `scheduleCapableAvailable`-class hint when Schedule candidates exist |
| Confirm / bind | Existing Checkout fulfilment set remains the sole outlet bind; AUTO_SELECT proposes; customer confirms; no silent Checkout binding from browse or from list alone |
| Exact windows | After confirmed outlet + Schedule intent: `listCheckoutScheduledWindows` only; server-authoritative; empty → recovery (AS-09 / AS-37); Now offer only if accepting-now still eligible |
| Failure / unavailable recovery | Outlet invalid after selection → revalidate + reselect (AS-36); Now eligible but no future windows → honest empty + Now path if still eligible (AS-35); Schedule-capable but closed now → allow Schedule path without fake ETA; Timing step disables Now with reason (AS-34); customer recovers without fake promises |
| Pay revalidation | Existing scheduled bind revalidation unchanged (`assertScheduledSnapshotStillBindable` / profile gates) |
| Lifecycle | **No** new backend Order/Checkout lifecycle states |

Distinguish:

- **Accepted defect evidence (code-verified composition)** — accepting-now-only list **and** post-bind evaluate-before-timing; UOE-DR-06 = ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT
- **Future UX improvements** — compact chrome, UNCONFIRMED copy polish, pre-checkout eligibility (DR-05) — not required to prove the composition defect exists

### D. WhatsApp / notification channel scope (DR-04 — verified, non-overclaim)

```text
VERIFIED: createNotificationChannelRegistry — WHATSAPP = options.whatsapp ?? noop;
  IN_APP = live adapter; EMAIL / SMS / PUSH = noop.
VERIFIED: Meta Cloud API adapter exists but is optional wiring; default registry is non-sending
  for WhatsApp when no adapter is supplied (createNonSendingChannelRegistry).
VERIFIED: src/shared/notifications/customer-visible-content.ts is wording authority for
  semantic types; does not invent Meta template ids; current Pickup wording still uses
  “Pickup” (DR-04 same-meaning remediation targets Takeaway primary labels when
  templates/variables are updated).
```

| Claim | Allowed | Forbidden |
|---|---|---|
| DR-04 same-meaning | When WhatsApp **sending** is configured in an environment, customer-visible content must match web primary meaning (Delivery / Takeaway / Now / Schedule) | Claiming WhatsApp is active / sending in **every** environment |
| Optional channel | Treat WhatsApp as an **optional implemented channel** whose adapter may be noop | Treating noop WhatsApp as a product failure of this candidate |
| Email/SMS/push | Remain out of V1 while non-sending | Expanding DR-04 to require those channels |
| Templates | Fit must still confirm Meta template **body vs variable** for label changes | Inventing new Meta templates inside this discovery package |

### Explicit non-authority (no second commercial authority)

| Allowed | Forbidden |
|---|---|
| Server eligibility read for browse Takeaway place (Now / Schedule-capable) | Client-authored outlet eligibility |
| Server cart evaluate quote with mode/outlet | Treating cart quote as sealed payable / Snapshot |
| Checkout timing-aware pickup-options + fulfilment bind | Binding outlet from browse without confirm; accepting-now-only Schedule listing |
| Checkout evaluate + Snapshot at pay | Parallel “browse Snapshot” or second pricing authority |
| Fail-closed when Snapshot reuse evidence missing | Fall through to divergent browse money |
| Presentation `order-context` coordinator (tab-scoped) | Storing money or sealed windows in session as truth; cross-tab seal sync |

## Refinement D — One browsing-context owner

### Proposed model

```text
boba.order-context.v1  (presentation-state coordinator; sessionStorage; TAB-SCOPED)
  ├── modeIntent: unset | DELIVERY | PICKUP
  ├── timingIntent: unset | ASAP | SCHEDULED
  ├── scheduleConfirmation: UNCONFIRMED | CONFIRMED_WINDOW_REF?  (checkout-bound)
  ├── collectionIntent: unset | proposedOutletId? | confirmedOutletId?
  ├── eligibilityFlags: mirrors keyed by delivery-context fingerprint / cart revision / timing / generation
  └── delivery: reuse boba.delivery-context.v1 (no duplicate confirmed coordinates)
```

`order-context` **coordinates**; it does not become commercial authority.
Confirmed geographic coordinates/labels continue to live only in delivery-context (plus server
Checkout destination when sealed). Proposed Takeaway outlet may be mirrored from the latest
successful eligibility read; confirmation for bind remains a Checkout act.

### Confirmed Deliver to (definition)

`Confirmed Deliver to` requires **both**:

1. Coordinates (and label) present in `boba.delivery-context.v1`
2. Last serviceability evaluation for **exactly those coordinates** returned `SERVICEABLE`,
   keyed by delivery-context content fingerprint / surface generation

Otherwise present missing, “Checking…”, market orientation, or **Known · not deliverable here**.
`eligibilityFlags` that do not match the current delivery-context fingerprint are **dropped**
(never a second geographic truth).

### Required specifications

| Topic | Rule |
|---|---|
| Storage | `sessionStorage` (parity with delivery-context); versioned key `boba.order-context.v1`; **tab-scoped by platform** |
| Cross-tab | **No V1 cross-tab sync** of presentation intent, money, or sealed Checkout. Same-tab event/subscribe only. Each tab revalidates server facts on focus/resume before trusting mirrors (GP-04) |
| Legacy session compatibility | Dual-read `boba.delivery-context.v1` (+ legacy pin façade if still present); migrate forward on write; never drop confirmed geo |
| Sign-out | Drop checkout-bound refs (`CONFIRMED_WINDOW_REF`, confirmed outlet, eligibility mirrors); retain only non-personal intents (mode/timing intent); delivery-context logout behaviour unchanged; honor D-370 |
| Expiry | Checkout-bound refs invalid when checkout completed/expired/terminal; do not auto-create/resume Checkout from bar intent alone |
| Auth / navigation transitions | Preserve safe intent across login; revalidate eligibility; honor D-370 cart merge |
| Async generation / race protection | Generation tokens / ignore stale responses (same pattern as OrderingCatalogClient) |
| Cart / checkout handoff | On checkout create/resume, map intent → server fulfilment/destination/timing APIs with revision; server wins on conflict; re-run eligibility/evaluate as needed |
| Changed location / offer / fee | Trigger server evaluate; surface deltas; never keep client money |
| Checkout `PAYMENT_PENDING` isolation | **Preserve** existing server guards (`fulfilment` / destination / timing / evaluate freeze) and client `cart_changed_unresolved` recovery. New browse preference must not call mutations on that checkout; `PendingPaymentGuard` is UX routing only — **no new server guard authorized** |
| No client-owned payable | Display money only from cart evaluate / checkout evaluate / Snapshot |

## Refinement C / UOE-DR-02 — Schedule API boundary (exact Menu slots deferred)

| Phase | Allowed | Not allowed |
|---|---|---|
| Menu / pre-checkout | Capture Now / Schedule **intent**; show UNCONFIRMED + reason; Schedule-capable Takeaway place candidates | Call `listCheckoutScheduledWindows` without checkout; invent windows; new Menu exact-slot preview API; claim guaranteed availability |
| Eligible checkout | List + select server windows; seal at evaluate; revalidate at prepare/pay | Free-minute picker; list while outlet only **proposed** (not confirmed) |
| Pay | `assertScheduledSnapshotStillBindable` (existing) | Pay on expired/drifted window |

**Eligible checkout** = authenticated + Checkout + mode set + confirmed place
(SERVICEABLE destination or **confirmed** Takeaway outlet).

## Refinement B — Location presentation

| State | Copy pattern | Authority |
|---|---|---|
| Market orientation | “Ordering in Dehradun” | Marketing / site locality — **not** delivery destination |
| Missing delivery place | “Add address” / equivalent | No coordinates / no delivery-context |
| Checking | “Checking this address…” | Coords present; serviceability in flight or fingerprint mismatch |
| Known · not deliverable | Clear unsupported copy + recovery | Coords present; serviceability NOT_SERVICEABLE |
| Confirmed delivery | “Deliver to {compact label}” | Coords + SERVICEABLE for those coords / checkout destination |
| Takeaway Now proposed (V1) | “Collect from {outlet}?” from **accepting-now** eligibility | Eligibility read; proposed ≠ Checkout-bound |
| Takeaway Schedule proposed (V1) | “Collect from {outlet}?” from **schedule-capable** eligibility; Schedule UNCONFIRMED for exact time | Profile/hours capability; not accepting-now; no Menu slots |
| Takeaway confirmed | “Collect from {outlet}” | checkout outlet after confirm |

Soft Dehradun bias in location provider search remains non-authoritative (existing comment in
provider). UI must not upgrade bias into confirmed Deliver to.

## Architecture-fit consequences of CANDIDATE-3

| Consequence | Required disposition |
|---|---|
| Timing-aware pre-checkout Takeaway eligibility read | Fit-recommended as composition of ASAP + scheduled-pickup foundations; no new aggregate |
| Checkout-owned timing-aware pickup-options + bind→timing→evaluate | Fit-recommended composition; remediates accepting-now list **and** post-bind ASAP evaluate; merchandise denial parity; no new aggregate / lifecycle |
| Empty/no-cart distinct from UNAVAILABLE | Mandatory presentation + contract `cartState` (GP-03) |
| Cart evaluate Takeaway without Delivery location | Fit-recommended quote-only path; Snapshot authority unchanged |
| Open-Checkout reuse before Delivery-only early return | Mandatory evaluate entry ordering / precedence (GP-02 / AS-29) |
| Missing commercial-evaluation evidence with active Snapshot | Fail-closed; no divergent browse money (AS-39 / AS-45) |
| Effective Checkout mode/timing in evaluate response | Mandatory when `reusedCheckoutEvaluation` |
| CART evaluation mode/timing/outlet provenance + evaluate context-key dedup | Required for new CART-scope persists (AS-32 / AS-46). **Proposed for Architecture Lock:** additive nullable context columns + distinct server-authored `evaluation_context_digest` on `commercial_evaluations` (`13-…` §2); preserve `result_fingerprint` and CHECKOUT measurement; reject sibling table and `expected_components`-as-sole-provenance; D6 forbids rename only. **Lock NOT granted** |
| Timing-sensitive provisional Offers | Advisory only; no Menu slot/final-promo guarantee (AS-42–44) |
| Guest visibility of customer-safe outlet projection | Accepted Fit consequence (public store info); rate-limit + debounce |
| DR-04 wording on WhatsApp | Optional channel (noop default); Fit must confirm Meta template **body** vs **variable**; no new channel adapter; do not claim WhatsApp active in every environment |
| Exact Menu schedule preview | **Out of V1** — no Fit work for that API in this variant |
| Cross-tab presentation sync | **Out of V1** — tab-scoped only (GP-04) |
| Client money / client eligibility | STOP — Architecture mismatch |
| Calling checkout pickup-options / scheduled-windows without Checkout | STOP — misuse of ownership-exact API |
| Parallel pricing service or browse Snapshot | STOP — second commercial authority |
| Divergent cart quote vs open Checkout Snapshot (same revision) | STOP — AS-29 / reuse precedence |
| Reject Schedule Takeaway solely because closed NOW | STOP — contradicts accepted IMP-036I (GP-01) |
| Domain rename PICKUP → Takeaway | STOP — D6 / out of scope |
| Formal Fit PASS before Experience Gate | Forbidden (X2/X3) |

## Unresolved conflicts / stops

| Item | Status |
|---|---|
| Exact Menu schedule preview API | Deferred in V1 (UOE-DR-02) — not a Fit blocker |
| Pre-checkout Takeaway eligibility / mode-aware cart evaluate | Contracts specified (UOE-DR-05 + GP-01…GP-04) — Fit evaluation recommends; formal PASS NOT_GRANTED |
| Future IMP identity + vs IMP-036K/D-383 sequencing | **DEFERRED** (UOE-DR-01) — blocks implementation authorization, not Fit recommendation |
| Schedule-capable entitlement + Checkout defect classification | **RECORDED** (UOE-DR-06 ACCEPTED + ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT; separate corrective preferred; NOT_AUTHORIZED) |
| CART provenance storage mechanism | **PROPOSED_FOR_LOCK** in `13-…` §2 — `ADDITIVE_NULLABLE_CONTEXT_FIELDS_PLUS_SERVER_CONTEXT_DIGEST`; Lock **NOT_GRANTED** |
| WhatsApp Meta template body vs variable | **ASSIGNED** Content QA + Design Readiness (`13-…` §5); no invented Meta templates; optional/noop-safe |
| Formal Fit PASS / lock | **NOT_GRANTED** — Lock proposal decision-ready; agent must not self-grant |
| Any pressure to rename `PICKUP` domain value | STOP — out of scope |

## Independent Architecture Fit evaluation (2026-10-23)

```text
EVALUATION_SCOPE = Approved PD-UOE-CANDIDATE-3 + XD-UOE-CANDIDATE-3 contracts (docs-only)
APPLICATION_CODE_MUTATION = NO
NEW_ORDER_OR_PAYMENT_AUTHORITY = NO
FORMAL_ARCHITECTURE_FIT_PASS = NOT_GRANTED
ARCHITECTURE_LOCK = NO
RECOMMENDED_VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
```

### A. Pre-checkout eligibility

| Concern | Evaluation | Disposition |
|---|---|---|
| Now vs Schedule-capable outlets | Compose existing ASAP accepting-now (`listEligiblePickupOutletsForCheckout` / `assertPickupOutletEligible`) with schedule-capable gates aligned to `assertScheduledPickupProfile` + merchandise `ignoreCurrentScheduleDenial: true` parity | **Feasible** — Contract A; no new aggregate |
| Guest / cart authorization | Reuse existing cart credential (guest token and/or customer session); no `checkoutId` fabrication; ownership-exact Checkout APIs remain Checkout-only | **Feasible** — BOLA preserved |
| Empty / no-cart distinction | Distinct `cartState` `NO_CART` \| `EMPTY_CART` with `outlets=[]`; never brand `UNAVAILABLE` solely because no lines | **Feasible** — GP-03 / AS-30 |
| BOLA / privacy / abuse | Customer-safe outlet fields only; fingerprint + generation discard; rate-limit + debounce on eligibility reads; no hierarchy/legal dump | **Required** — no new privacy authority |

**Tradeoff resolved:** Do **not** invent a Menu exact-slot preview (DR-02). Capability presentation without guaranteed windows is the accepted product promise (UOE-DR-06).

### B. Mode-sensitive Cart evaluation

| Concern | Evaluation | Disposition |
|---|---|---|
| Takeaway without Delivery coordinates | Today `evaluateCart` returns `REQUIRES_FULFILMENT_CONTEXT` before reuse when `!location` (`cart/evaluate.ts` ~138–145) — Fit gap | **Extend** evaluate entry: Takeaway path without Delivery address; reuse **before** Delivery-only early return |
| Unconfirmed Schedule promotion behaviour | Omit `fulfilmentTiming` while Schedule UNCONFIRMED; reject client `fulfilmentTiming=SCHEDULED` on CART evaluate with **400**; mode-gated Offers may apply with provisional messaging; never lock SCHEDULED-only discount at Menu; Contract A `SCHEDULED` remains capability-discovery only | **V1 lock** — AS-42–44 |
| Delivery location HMAC | Reserved nullable column; **V1 disabled** (`delivery_location_hmac: null` in digest); primary Delivery provenance = `evaluated_priced_outlet_id` | **V1 disposition** — `13-…` §2.3 |
| Checkout Snapshot precedence | `tryReusableCheckoutEvaluation` already correct when reached; must become reachable for Takeaway open Checkouts without Delivery `location` | **Mandatory** — AS-29 |
| Missing commercial-evaluation evidence | Today missing evaluation / `catch → null` falls through to browse quote | **Fail-closed** — AS-39 / AS-45; never divergent browse money |
| CART provenance + context-key + dedup | Mode/timing/outlet provenance required for new CART-scope persists; evaluate context key ≠ `result_fingerprint` ≠ `evaluation_context_digest` | **Required** — AS-32 / AS-46; storage mechanism **PROPOSED_FOR_LOCK** in `13-…` §2 |
| PAYMENT_PENDING preservation | Existing fulfilment/destination/timing/evaluate freezes + `cart_changed_unresolved` recovery | **Preserve** — no new server guard; browse must not mutate pending Checkout |

**Tradeoff resolved:** One commercial engine (`evaluateCart` / Checkout evaluate / Snapshot). No parallel pricing service. Advisory quote ≠ seal (D-368 Menu display ≠ payable).

### C. Scheduled Takeaway Checkout

| Concern | Evaluation | Disposition |
|---|---|---|
| Timing-aware pickup-options | Current `listCheckoutPickupOptions` accepting-now-only = ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT | Contract C: timing-aware listing (Schedule-capable) without writing `SCHEDULED`+null-window solely to unlock list |
| Bind-before-final-evaluate | Current `continuePickupWithOutlet` → `evaluateCheckout` (ASAP) before Timing | Schedule path: bind outlet **without** evaluate → windows → set SCHEDULED+window → evaluate |
| Server-issued windows | Reuse `listCheckoutScheduledWindows`; seal at evaluate; revalidate at prepare/pay | **Unchanged authority** — D-379 / ADR-019 / IMP-036I |
| Scheduled timing + revision guards | Optimistic `expectedRevision`; existing scheduled bind revalidation | **Preserve** |
| Final prepare/pay revalidation | `assertScheduledSnapshotStillBindable` / profile gates | **Unchanged** — no new lifecycle states |

**Tradeoff resolved:** Remediation of the accepted Checkout composition defect is **preferred as a separately scoped corrective** after urgent payment work (UOE-DR-06) and is **not authorized** by this evaluation. Fit contracts still define the required composition for any eventual UOE or standalone fix. Do not create new Order or Payment authority.

### D. Presentation and channels

| Concern | Evaluation | Disposition |
|---|---|---|
| Delivery-context authority | Reuse `boba.delivery-context.v1` for confirmed geo; no second geo store | **Required** — refinement B/D |
| Tab-scoped browsing intent | `boba.order-context.v1` presentation coordinator; sessionStorage tab-scoped; no cross-tab money/seal sync | **V1** — GP-04 |
| WhatsApp template body-vs-variable | Optional/noop-safe adapter (verified); same-meaning when sending configured | **ASSIGNED** Content QA + Design Readiness (`13-…` §5) — must not invent Meta templates in discovery |
| In-app content consistency | `customer-visible-content.ts` wording authority; Takeaway primary labels | **DR-04** |
| Shared Workforce terminology | Primary Delivery/Takeaway; collection task verbs allowed; domain nouns not renamed (D6) | **§G surface table** |

### Recommended Architecture Fit variant

```text
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
SHAPE =
  Contract A: timing-aware pre-checkout Takeaway eligibility read (compose ASAP + scheduled foundations)
  Contract B: mode-sensitive Cart evaluate (quote-only; reuse precedence; fail-closed; provenance/dedup)
  Contract C: Checkout timing-aware pickup-options + bind→windows→evaluate→prepare (no new lifecycle)
  Contract D: tab-scoped order-context + delivery-context reuse + optional WhatsApp same-meaning
NON_GOALS =
  Menu exact-slot API; second commercial authority; domain rename; new Order/Payment authority;
  cross-tab seal sync; guaranteed future availability claims; WhatsApp always-on claim
```

This is the single feasible variant that satisfies the approved product/experience contracts
without inventing aggregates, services, roles, permissions, or payment authority.

### Author self-assessment — superseded by independent Lock-proposal reviews

The following table is an **author self-assessment** from the Fit-evaluation revision. It is
**not** an independent Security or Financial Integrity verdict. Independent reviews for the
Architecture Lock proposal are recorded in
[`13-architecture-lock-proposal.md`](./13-architecture-lock-proposal.md) §7.

| Surface | Self-assessment | Notes |
|---|---|---|
| BOLA on eligibility / pickup-options / scheduled-windows | SAFE AS DESIGNED if contracts held | Cart credentials for pre-checkout; ownership-exact Checkout APIs unchanged |
| Client-authored money / outlets / windows | FORBIDDEN | STOP conditions retained; Lock proposal requires **reject (400)** not ignore |
| Snapshot / Payment / prepare | UNCHANGED | D-361+; no new payment state machine |
| PAYMENT_PENDING freeze | PRESERVED | Browse must not call fulfilment mutations |
| Missing evaluation fall-through | FIT GAP → fail-closed required | Prevents divergent browse payable under open Snapshot |
| Promotion timing while UNCONFIRMED | Omit timing in Cart evaluate; reject client CART `SCHEDULED` with 400 | Prevents false SCHEDULED-only discount seal at Menu |
| Abuse / enumeration | Rate-limit + debounce + customer-safe fields | Detailed in `13-…` §4 |
| Concurrency | expectedRevision + generation + context-key dedup | No competing payables |
| Accepted IMP / ADR contradiction | NONE if contracts held | UOE-DR-06 defect is conformance debt vs IMP-036I, not a new conflicting entitlement |

**Material contradiction report:** None between the approved UOE entitlement and accepted
IMP-036H/I, D-378/D-379, D-361+, D-368, D-370 when Fit non-authority rules are held. The
Checkout accepting-now composition is an **accepted capability conformance defect**, not a
product entitlement conflict.

### Open architecture decisions (Fit lock / later — not Product Gate returns)

1. CART-scope commercial provenance persistence mechanism — **PROPOSED** in
   [`13-architecture-lock-proposal.md`](./13-architecture-lock-proposal.md) §2
   (`ADDITIVE_NULLABLE_CONTEXT_FIELDS_PLUS_SERVER_CONTEXT_DIGEST`); awaiting Founder Lock
2. WhatsApp Meta template body versus variable for DR-04 label changes — **ASSIGNED** to Content QA
   + Design Readiness (`13-…` §5); no invented templates
3. Exact HTTP path strings within Contract A/B/C semantic bounds — deferred to implementation
4. Governed remediation vehicle identity/timing for the Checkout composition defect (preferred
   separate corrective; **not authorized** here)
5. Abuse limits / performance budgets / privacy / negative security tests — **PROPOSED** in
   `13-…` §4; awaiting Founder Lock / Quality finalization

None of the above changes the accepted product promise. If a future Fit/Design choice would
change eligibility, pricing truth, or payment safeguards, return to Product / Experience Gate.

```text
ARCHITECTURE_FIT_EVALUATION_RESULT = RECOMMENDED_VARIANT_READY
ARCHITECTURE_LOCK_PROPOSAL = ARCH-UOE-LOCK-PROPOSAL-1
ARCHITECTURE_LOCK_PROPOSAL_STATUS = DECISION_READY
FORMAL_ARCHITECTURE_FIT_PASS = NOT_GRANTED
ARCHITECTURE_LOCK = NO
```

### Architecture Lock proposal pointer

Decision-ready Lock proposal (provenance, contract bounds, abuse/perf/privacy, WhatsApp
assignment): [`13-architecture-lock-proposal.md`](./13-architecture-lock-proposal.md).
**Do not** treat that proposal as Fit PASS or Architecture Lock.

## Invariants that must not regress

1. Coordinates = geographic authority; no client-invented delivery outlet
2. Mode ⊥ timing on server; Snapshot seals both
3. PICKUP: no delivery fee / delivery execution
4. Windows server-listed and sealed (checkout-eligible only in V1)
5. Optimistic concurrency via expected revisions
6. PAYMENT_PENDING freezes fulfilment/destination/timing
7. Browse-without-address remains allowed
8. AUTO_SELECT proposes; customer confirms before bind
9. Presentation language ≠ domain rename
10. Cart evaluate quote ≠ Snapshot seal
11. Pre-checkout eligibility read ≠ Checkout fulfilment bind
12. Takeaway **Now** = accepting-now; Takeaway **Schedule** = schedule-capable (not accepting-now); Schedule is not silently denied solely because closed NOW — including on Checkout pickup-options
13. Open Checkout / Snapshot reuse wins over browse mode/outlet at the same cart revision; reuse attempted before Delivery-location early return
14. Active Snapshot + missing commercial-evaluation evidence → fail-closed; never divergent browse money
15. Mode/timing/outlet provenance + evaluate fingerprint/dedup correctness (no competing payables)
16. Timing-sensitive Cart Offers are advisory; Menu must not guarantee scheduled slot or final promo price
17. Empty / no cart ≠ brand UNAVAILABLE
18. Presentation storage is tab-scoped; server facts revalidated per tab
19. No new backend lifecycle states for Schedule Takeaway recovery
20. WhatsApp adapter may be noop; DR-04 same-meaning applies when sending is configured — not “always on”
