<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "NONE",
  "capability": "IMP-036K",
  "candidateId": "IMP-036K-QUALITY-CANDIDATE-2",
  "supersedesCandidate": "IMP-036K-QUALITY-CANDIDATE-1",
  "designCandidate": "IMP-036K-DESIGN-CANDIDATE-1",
  "measurementCandidate": "IMP-036K-MEASUREMENT-CANDIDATE-2",
  "architectureSource": "IMP-036K-FIT-CANDIDATE-1",
  "testingPolicy": "TEST-1",
  "qualityTestPlanFinalized": "NO",
  "designReadiness": "PASS",
  "implementationAuthorized": false,
  "implementationStarted": false
}
-->

# IMP-036K — Quality and test plan candidate

```text
CANDIDATE_ID = IMP-036K-QUALITY-CANDIDATE-2
SUPERSEDES_CANDIDATE = IMP-036K-QUALITY-CANDIDATE-1
STATUS = CANDIDATE
AUTHORITY = NONE
CAPABILITY = IMP-036K
POLICY = TEST-1
QUALITY_TEST_PLAN_FINALIZED = NO
PROOF_EXECUTED = NO
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
FOUNDER_EXPERIENCE_UAT = NOT_PERFORMED
DESIGN_READINESS = PASS
DESIGN_CANDIDATE = IMP-036K-DESIGN-CANDIDATE-1
MEASUREMENT_CANDIDATE = IMP-036K-MEASUREMENT-CANDIDATE-2
ARCHITECTURE_SOURCE = IMP-036K-FIT-CANDIDATE-1
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
INDEPENDENT_QUALITY_TEST_PLAN_REVIEW = NOT_PERFORMED
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
COVERAGE_PERCENTAGE_IS_ACCEPTANCE = NO
DO_NOT_MERGE = YES

PRODUCT_DEFINITION = PD-IMP-036K-DRAFT-1
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_DEFINITION = XD-IMP-036K-DRAFT-1
EXPERIENCE_GATE = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
ARCH_R23 = UNCHANGED
ARCH-R24 = NO
NEW_ADR = NO
NEW_ARCH_G = NO
DECISION_REGISTER_OBSERVED = DR-25
D-383 = CURRENT
D-384 = CURRENT
D-384_CHANGES_IMP036K_PRODUCT_SEMANTICS = NO
D-384_AUTHORIZES_IMPLEMENTATION = NO
```

This is planned proof for approved `PD-IMP-036K-DRAFT-1`, approved `XD-IMP-036K-DRAFT-1`,
locked `IMP-036K-FIT-CANDIDATE-1`, current Design Readiness `IMP-036K-DESIGN-CANDIDATE-1`,
and paired `IMP-036K-MEASUREMENT-CANDIDATE-2`. It is not executed evidence. Passing this plan
later does not accept IMP-036K. This candidate does not self-declare finalization, CURRENT
authority, APPROVED status, or Quality-gate PASS.

Architecture Fit remains the occurrence-boundary authority for issuance, presentation, and
assistance. The paired Measurement candidate owns concrete encoding. This Quality candidate
proves that contract under TEST-1. It does not replace TEST-1 and does not add a layer outside
TEST-1. It does not create or edit the Measurement file.

Evidence for every IMP-036K row below is `NOT_EXECUTED`. Later implementation evidence is a
named test or browser check on an implementation candidate, with command, result, and
provenance. No row below is that evidence.

```text
BATCH_3R_SAME_SCOPE_CORRECTION = YES
BATCH_3R_CORRECTION_GRANTS_GATE = NO
BATCH_3R_CORRECTION_FINALIZES_PLAN = NO
```

Batch 3R corrects section 19 item 6. Quality/Test Plan finalization depends on complete planned
proof. It does not depend on a runnable implementation test or on a passing execution. Passing
executable evidence and Founder UAT stay later QA and acceptance gates. Sections 11 and 13 match
the paired measurement correction: `recommendationReadId` replay is limited to the authorized
cart or customer that owns the issuance, and no existing anonymous commerce session is assumed.
Planned proof is not reduced. This correction does not finalize the plan and does not grant the
Quality gate.

```text
PROOF_EXECUTED = NO
COVERAGE_PERCENTAGE_IS_ACCEPTANCE = NO
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
QUALITY_TEST_PLAN_FINALIZED = NO
IMPLEMENTATION_AUTHORIZED = NO
```

This document does not set ROADMAP or STATE lifecycle fields. Observed lifecycle on the
reconciled source tip is cited only as read from those authorities: `acceptedThrough` IMP-036I,
`currentProductSlice` IMP-036J, `nextProductSlice` IMP-036K,
`IMP036K_IMPLEMENTATION_AUTHORIZED = NO`.

## 0. Reconciliation and provenance

```text
RECONCILED_ONTO = a6155378b799e06a95b28c593ac1a340d7ca9245
RECONCILED_SOURCE_TREE = a0d283e7d98b81778ea9bceee6db53f5e8bc545f
OBSERVED_ROADMAP = GTM-R190
OBSERVED_STATE = STATE-R189
OBSERVED_ARCHITECTURE = ARCH-R23
OBSERVED_DECISION_REGISTER = DR-25
OBSERVED_VISION = VISION-1
OBSERVED_PRODUCT_DELIVERY = PD-2
OBSERVED_EXPERIENCE = EXP-1
OBSERVED_PRODUCT_LANGUAGE = LANG-1
OBSERVED_TESTING = TEST-1
CANONICAL_REPOSITORY = nivedhya11/BobaBear
CANONICAL_PATH = /home/ajoshi/repos/boba-bear-platform
```

Historical `IMP-036K-QUALITY-CANDIDATE-1` lives on OPEN CONFLICTING PR #348
(`https://github.com/nivedhya11/BobaBear/pull/348`), head `0088475d`. That PR is evidence, not
current authority. This candidate reuses CANDIDATE-1, including the remediations that distinguish
`e591cf4c` from `0088475d`, and reconciles provenance onto current `origin/main` `a6155378`.
It does not push to PR #348 and does not treat PR #348 merge as this work.

PR #348 body claimed `SOURCE_MAIN = 8e4221f27d3e9c930dca4544382a038a58f0f93a` /
`SOURCE_TREE = 3492b4eaf95ab4f0cbab89b6de08c1e6c9d147fb` (then GTM-R183 / STATE-R181). That
commit exists as a local object. In this shallow checkout it is **not** an ancestor of
`a6155378`. This candidate therefore records a source-main move:

```text
PR348_CLAIMED_SOURCE_MAIN = 8e4221f27d3e9c930dca4544382a038a58f0f93a
PR348_CLAIMED_SOURCE_TREE = 3492b4eaf95ab4f0cbab89b6de08c1e6c9d147fb
PR348_CLAIMED_SOURCE_IS_ANCESTOR_OF_A6155378_IN_THIS_SHALLOW_HISTORY = NO
CANDIDATE_2_SOURCE_MAIN = a6155378b799e06a95b28c593ac1a340d7ca9245
CANDIDATE_2_SOURCE_TREE = a0d283e7d98b81778ea9bceee6db53f5e8bc545f
```

### 0.1 DR-25 / D-384 provenance correction

CANDIDATE-1 recorded `DR_24 = UNCHANGED` and `D-384 = NO`. That text described the Fit and
Design operations, not the current register:

- Architecture Fit PASS / lock (`IMP-036K-FIT-CANDIDATE-1`, review `5391917727`) and Design
  Readiness PASS (`IMP-036K-DESIGN-CANDIDATE-1`, review `5396061135`) were evaluated under
  **DR-24**. Those operations did **not** create D-384. That provenance is preserved.
- The current decision register on this source tip is **DR-25**.
- **D-383** is CURRENT. It authorizes parallel Product / Experience definition only. It does
  not authorize IMP-036K implementation.
- **D-384** is CURRENT as the tactical / pre-GTM programme baseline. It does not change
  IMP-036K product semantics, does not amend PD-2, does not change ROADMAP/STATE lifecycle, and
  does not authorize implementation. It is not a recommendation-policy change. This candidate
  does not delete D-384 from the register.

```text
FIT_DESIGN_EVALUATED_UNDER = DR-24
FIT_OR_DESIGN_CREATED_D-384 = NO
CURRENT_REGISTER = DR-25
D-383_AUTHORIZES_IMPLEMENTATION = NO
D-384_IS_RECOMMENDATION_POLICY = NO
```

### 0.2 Independent-review evidence preserved

| Review / artifact | Result | This candidate's use |
|---|---|---|
| Architect review `5380398013` | Product Definition Gate PASS; Experience Gate PASS | Preserved. Not rewritten. |
| Historical Fit PASS `5384137705`, later reopened by `5385458836` | Not the current lock | Preserved as historical. Not the lock source. |
| Architect review `5391917727` | Architecture Fit PASS, lock from `IMP-036K-FIT-CANDIDATE-1` | Current Fit / lock source. ARCH-R23 unchanged. No new ADR. |
| Historical Design Readiness `5394618739` | STOP | Preserved. Not rewritten as PASS. |
| Historical Design Readiness `5395779537` | STOP | Preserved. Not rewritten as PASS. |
| Architect review `5396061135` | Design Readiness PASS for `IMP-036K-DESIGN-CANDIDATE-1` | Current Design Readiness PASS. |
| Independent Quality / Test Plan review of CANDIDATE-1 or CANDIDATE-2 | `NOT_PERFORMED` | Not self-awarded. Remains NOT_PERFORMED. |
| Quality / Test Plan on `main` | `NOT_PERFORMED` / `NOT_FINALIZED` | This file stays CANDIDATE / authority NONE. |

### 0.3 Changed, superseded, omitted, or duplicated scenarios

Versus **CANDIDATE-1** (`0088475d` blob `5509311c`):

| Class | Finding |
|---|---|
| Changed | Provenance, measurement pairing (`MEASUREMENT-CANDIDATE-2`), DR-25 / D-384 recording, source-main identity, existing-versus-proposed inventory, explicit oracle / GJ / planned-proof ids, `MQ-036K-001`…`017` traceability (section 13.1), and two added planned-not-executed proofs (`QT-036K-MQ-002`, `QT-036K-MQ-013`). |
| Superseded | CANDIDATE-1 status block `DR_24 = UNCHANGED` / `D-384 = NO` as if they described the current register. The Fit/Design-era meaning is kept as provenance; current register truth is DR-25 / D-384 CURRENT. |
| Omitted versus CANDIDATE-1 | None of the 62 mandatory ACs, 16 XRs, or CANDIDATE-1 remediations (`e591cf4c`→`0088475d`) are dropped. |
| Duplicated | No extra AC or XR invented. `AC-036K-013-01` remains directional measurement-readiness, not a second live-activation AC. |

Versus **current PD / XD / Fit / Design** on `a6155378`:

| Class | Finding |
|---|---|
| Product / Experience semantics | Unchanged. Planned proof is reconciled to approved DRAFT-1 texts, not rewritten. |
| PD §10 table language “Cart reuse unresolved” / “permission mapping unresolved” | Historical-at-gate wording. Locked Fit §§7.7 and 7.9 already selected `menu.manage` / existing `addCartLine`. This plan uses the lock. It does not reopen those product questions. |
| Fit §14 Quality must-prove list | All items remain planned below. None are marked executed. |
| Duplicated product scenarios | None. Category-gap examples stay instances of menu-section presence/absence (Fit §7.4), not a new taxonomy. |

## 1. How to read a row

| Column | Meaning |
|---|---|
| Story / AC / XR | Product or experience identifier. Semantics are unchanged |
| Risk | Why this proof exists |
| Layers | TEST-1 layers that apply. A layer omitted here is `N/A` for that row because a listed layer already covers the observable result, or the row says why |
| Planned check | What a later implementation run must show. This is not executed evidence |
| Real dependency | What cannot be replaced if the claim needs it |
| Substitute | Allowed controlled stand-in |
| Negative evidence | The denial, absence, or non-effect that must also be shown |

**Oracle** for every row: the planned check plus the negative evidence, judged against the named
Product Definition AC, Experience XR, or locked Fit section. A later green CI job is not the
oracle until it is executed on a named implementation candidate.

**Planned executable proof** for every row: a later named test or browser procedure on an
implementation candidate (`QT-036K-<AC>` or `XR-QT-036K-<n>`). Paths below that already exist
on this main prove only the listed foundation. They are not IMP-036K proof.

**Golden Journey** for every row: the story map in section 1.1. Operator-only rows use
workforce browser proof and are not customer Golden Journeys.

Layers used only when they prove something the story actually risks: unit, component,
domain/use-case, integration, database integration, HTTP/API contract, authorization/security,
concurrency, recovery/idempotency, accessibility, real browser/E2E, Golden Journey regression,
Founder UAT later.

### 1.1 Story → Golden Journey / planned proof / oracle map

Required customer journeys from Product Definition §20: `GJ-FIRST-ORDER`, `GJ-AVAILABILITY`,
`GJ-PRODUCT-MENU-LAUNCH` must keep working with recommendations present, absent, failed, or
held out. `GJ-PAYMENT-RECOVERY` must remain reachable when recommendations fail.
`GJ-RETURNING-ORDER` is not a new Order Again journey; it constrains later manual add so it
is not attributed from a previous exposure.

| Story / AC | Planned proof ids | Oracle authority | Applicable GJ |
|---|---|---|---|
| `US-036K-001` / `AC-036K-001-01`…`04` | `QT-036K-001-01`…`04` | PD §10 those ACs; Design headings | `GJ-FIRST-ORDER` |
| `US-036K-002` / `AC-036K-002-01`…`06` | `QT-036K-002-01`…`06` | PD §10; Fit §7.2; ARCH-G20 | `GJ-FIRST-ORDER` |
| `US-036K-003` / `AC-036K-003-01`…`08` | `QT-036K-003-01`…`08` | PD §10; Fit §7.4 | `GJ-FIRST-ORDER` |
| `US-036K-004` / `AC-036K-004-01`…`05` | `QT-036K-004-01`…`05` | PD §10; Fit §§7.9–7.10 | `GJ-FIRST-ORDER` |
| `US-036K-005` / `AC-036K-005-01`…`05` | `QT-036K-005-01`…`05` | PD §10; Fit §7.3 | `GJ-AVAILABILITY`, `GJ-FIRST-ORDER`, `GJ-PRODUCT-MENU-LAUNCH` |
| `US-036K-006` / `AC-036K-006-01`…`03` | `QT-036K-006-01`…`03` | PD §10; Fit §7.10 | `GJ-AVAILABILITY`, `GJ-FIRST-ORDER` |
| `US-036K-007` / `AC-036K-007-01`…`02` | `QT-036K-007-01`…`02` | PD §10; Fit §7.18 | `GJ-FIRST-ORDER`, `GJ-PAYMENT-RECOVERY` |
| `US-036K-008` / `AC-036K-008-01`…`05` | `QT-036K-008-01`…`05` | PD §10; Fit §7.11 | `GJ-FIRST-ORDER`; `GJ-RETURNING-ORDER` constraint for `008-04` |
| `US-036K-009` / `AC-036K-009-01`…`06` | `QT-036K-009-01`…`06` | PD §10; Fit §7.12 | `GJ-FIRST-ORDER` purchased Order; `GJ-RETURNING-ORDER` constraint for `009-06` |
| `US-036K-010` / `AC-036K-010-01`…`04` | `QT-036K-010-01`…`04` | PD §10; Fit §§7.5–7.6 | `GJ-FIRST-ORDER` |
| `US-036K-011` / `AC-036K-011-01`…`04` | `QT-036K-011-01`…`04` | PD §10; Fit §7.15 | `GJ-FIRST-ORDER` |
| `US-036K-012` / `AC-036K-012-01`…`06` | `QT-036K-012-01`…`06` | PD §10; Fit §7.7; ARCH-G08/G23/G25 | `GJ-PRODUCT-MENU-LAUNCH`; authorization also `GJ-PERMITTED-OUTLET-ACCESS` (no new provisioning) |
| `US-036K-013` / `AC-036K-013-02`…`05` | `QT-036K-013-02`…`05` | PD §10; Fit §7.14 | `GJ-FIRST-ORDER`, `GJ-PAYMENT-RECOVERY` |
| `AC-036K-013-01` directional | `QT-036K-013-01` | PD §10 Mandatory NO; Fit §7.14; Measurement CANDIDATE-2 | Fixture readiness only. Not live activation. |
| Measurement `MQ-036K-001`…`017` | Existing `QT-036K-*` / `XR-QT-036K-*` rows plus `QT-036K-MQ-002`, `QT-036K-MQ-013` | Measurement CANDIDATE-2 §18; Quality §13.1 | Planned measurement-contract proof. Not a new Product AC |
| `XR-IMP-036K-001`…`016` | `XR-QT-036K-001`…`016` | XD Experience requirements; Design Readiness | Same surface GJ as the related story |

`GJ-STORE-PAUSE-RESUME`, `GJ-TRADING-HOURS`, and `GJ-ADDRESS-SERVICEABILITY` are eligibility
inputs only. No new journey behaviour. `GJ-CANCELLATION-REFUND` is unchanged; Cancelled Orders
are excluded from assisted purchase and Popular.

## 2. Mandatory AC count verification

Verified against Product Definition §10
(`docs/platform/product/IMP-036K/product-definition.md`, lines 536–1069 on this source tip):

```text
DISTINCT_AC_036K_IDS = 63
MANDATORY_YES = 62
MANDATORY_NO = 1
MANDATORY_NO_ID = AC-036K-013-01
MANDATORY_AC_COUNT = 62
DELTA_FROM_HISTORICAL_CANDIDATE_CLAIM_OF_62 = NONE
```

Every `AC-036K-*` in §10 is listed once. Flags: 62 `Mandatory in acceptance slice: YES`
(`001-01` through `012-06`, plus `013-02` through `013-05`). The only `NO` is `AC-036K-013-01`
at PD line 1036: holdout design direction, not a live-activation acceptance outcome. That
matches PD §10 preamble (line 533). CANDIDATE-1's count of 62 was correct. This candidate does
not drop a mandatory scenario to preserve 62, and does not promote `013-01` to a live-activation
pass.

`QUALITY_PLAN_COVERS_ALL_MANDATORY_AC = YES` means all 62 YES rows appear in section 3.
`013-01` is covered in section 4 as measurement-readiness proof.

## 3. Mandatory acceptance scenarios

Every AC marked mandatory YES in `PD-IMP-036K-DRAFT-1` appears below.

| Story | AC | Risk | Layers | Planned check | Real dependency | Substitute | Negative evidence |
|---|---|---|---|---|---|---|---|
| `US-036K-001` | `AC-036K-001-01` | Complements exceed ceiling or invent placement | Domain, HTTP, component, browser | Product Detail set length ≤ 3 when ≥1 eligible complement exists; placement is Product Detail; heading is “Goes great with this” | Recommendation read + exact product+variant detail context | Fixture relationships and eligible complements | A 4th complement is absent. Menu Discovery recommendation module is absent |
| `US-036K-001` | `AC-036K-001-02` | Padding to three | Domain, component, browser | With 0, 1, or 2 eligible complements, set size equals that count; primary product remains usable | Eligibility filter | Fixture with fewer than 3 eligibles | Ineligible or weak filler is absent |
| `US-036K-001` | `AC-036K-001-03` | Ignore mutates cart/product | Domain, HTTP, browser | Continue configure/add current product without recommendation action; cart gains only that product path | Existing product add path | None for the ignore path | No recommendation candidate appears as a cart unit |
| `US-036K-001` | `AC-036K-001-04` | Fake commercial claim | Component, browser, content | Visible copy does not claim co-purchase, personalization, trend, savings, priority, or margin | Experience/Design copy contract; LANG-1 | Content fixture | Forbidden claim words are absent |
| `US-036K-002` | `AC-036K-002-01` | Customization ceiling breach | Domain, component, browser | Total ≤ 3; ≤1 variant upgrade; ≤2 modifier/add-on recommendations; fewer including zero valid | Customization authority read | Fixture variants/modifiers | A second variant upgrade or third add-on is absent |
| `US-036K-002` | `AC-036K-002-02` | Variant upgrade becomes second product or silent change | Domain, component, browser | Before choice, current variant unchanged; after Choose, same-dialog transition to same product's target variant; not a second product | Existing customization dialog | Fixture larger-size/patty variant | Unrelated second product and nested recommendation modal are absent |
| `US-036K-002` | `AC-036K-002-03` | Paid add-on preselected | Domain, component, browser | Positive-price recommended modifier starts unselected; action updates existing control; cart changes only after Add/Save | Existing modifier graph; ARCH-G20 | Fixture paid option | Silent paid selection before action is absent |
| `US-036K-002` | `AC-036K-002-04` | Invalid option offered | Domain, component | Incompatible/unavailable/out-of-configuration options are absent from the set | Customization validity | Fixture invalid option | That option id is absent from the payload and UI |
| `US-036K-002` | `AC-036K-002-05` | Recommendation invents paid default | Domain, component | Existing zero-price defaults remain under customization authority; recommendation does not newly preselect a positive-price modifier | Existing default rules; ARCH-G20 | Fixture default group | New positive-price preselection is absent |
| `US-036K-002` | `AC-036K-002-06` | Relationship-admin used for Customization | Domain, HTTP, component | Candidates are only current-product variants/modifiers; operator product/category relationships are not the Customization source | Customization authority; relationship store | Active Product Detail relationship fixture that must not appear in Customization | Relationship-only target absent from Customization set. No new variant/modifier identity |
| `US-036K-003` | `AC-036K-003-01` | Cart ceiling breach | Domain, HTTP, component, browser | Non-empty cart set length ≤ 4 when eligible suggestions exist; heading is “Complete your order” | Cart recommendation read | Fixture gap candidates | A 5th candidate is absent |
| `US-036K-003` | `AC-036K-003-02` | Empty-cart module | Domain, component, browser | Empty cart renders no Revenue Recommendations module; existing empty-cart experience remains | Empty cart fixture | None | Recommendation heading and items are absent |
| `US-036K-003` | `AC-036K-003-03` | Beverage gap | Domain, integration | Main+side, no beverage section → eligible beverage may appear and still passes hard eligibility | Current effective menu-section membership (Fit §7.4) | Fixture sections and beverage | Ineligible beverage is absent. No hardcoded Food/Main/Side taxonomy |
| `US-036K-003` | `AC-036K-003-04` | Food gap from beverage-only | Domain, integration | Beverage-only cart may suggest eligible food | Same section authority | Fixture food | Ineligible food is absent |
| `US-036K-003` | `AC-036K-003-05` | Side gap | Domain, integration | Main without complementary side may suggest eligible side | Same | Fixture side | Present-side section is not re-suggested as missing |
| `US-036K-003` | `AC-036K-003-06` | Present category treated missing | Domain | Section already in cart is not suggested as absent | Cart section presence | Fixture with that section present | That section's gap candidate is absent |
| `US-036K-003` | `AC-036K-003-07` | Group-quantity inference | Domain, component | Several mains and any drink quantity do not produce diner-count, group-size, too-few-drinks, balancing, or per-person beverage inference | Ranking/gap rules | Multi-main fixture | Those inferred suggestions and copy are absent |
| `US-036K-003` | `AC-036K-003-08` | Checkout blocked by suggestions | Component, browser | With visible cart recommendations, Checkout remains available without recommendation action; no candidate added | Existing Checkout entry | None | Checkout control is not gated on accepting a suggestion |
| `US-036K-004` | `AC-036K-004-01` | Illegal direct add | Domain, HTTP, browser | Direct-add candidate uses `POST /api/v1/cart/lines`; configuration-required candidate is not direct-added | Existing `addCartLine` | Fixture complete vs incomplete config | Required-choice item never becomes a silent cart line |
| `US-036K-004` | `AC-036K-004-02` | Skipped configuration | Domain, component, browser | Configuration-required action opens/reuses existing customization; required choices not silently filled; cart changes only after accept | Existing customization dialog | Fixture required group | Shortened form that skips required choices is absent |
| `US-036K-004` | `AC-036K-004-03` | Silent mutation | Domain, HTTP, browser | Viewing recommendations on Product Detail, Customization, or Cart without action leaves cart, variants, and paid modifiers unchanged | Surfaces without action | None | No silent add/variant change/paid preselection |
| `US-036K-004` | `AC-036K-004-04` | Stale display treated as reservation | Domain, HTTP, recovery | At recommendation action, server revalidates catalog lifecycle, assortment, selected Outlet, availability, fulfilment, required configuration, relationship active/effective period, and suppression; display does not reserve | Add-time revalidation in locked architecture | Make candidate ineligible after issue | Rejected add creates no recommendation-origin unit |
| `US-036K-004` | `AC-036K-004-05` | Silent ALTERNATIVE swap | Domain, HTTP | ALTERNATIVE relationship never replaces a cart line without explicit customer choice; `ALTERNATIVE != SILENT_SWAP` | Relationship kind fixture | Active ALTERNATIVE relationship | Silent line replacement is absent |
| `US-036K-005` | `AC-036K-005-01` | Rank before eligibility | Domain | Inactive, unavailable, out-of-assortment, wrong-outlet, fulfilment-incompatible, unpriced, configuration-incompatible, expired/disabled-relationship candidates are removed before ranking | Eligibility pipeline | Mixed eligible/ineligible fixtures | Ineligible ids absent from ranked set even with higher priority |
| `US-036K-005` | `AC-036K-005-02` | Second money/promotion authority | Domain, HTTP | Recommended price/assortment/availability/outlet/fulfilment come from existing commerce; no discount/promotion/offer/coupon/campaign is created | Existing authorities; ARCH-G05/G19 | Fixture priced item | New promotion/discount artifact is absent |
| `US-036K-005` | `AC-036K-005-03` | Stale context after outlet/fulfilment change | Domain, integration, browser | After outlet or Delivery/Pickup/Scheduled context change, next set contains only new-context purchasable candidates; existing cart lines follow ordinary cart/checkout revalidation | Serviceability and fulfilment context | Fixture context switch | Old-context-only candidate is absent from the next set |
| `US-036K-005` | `AC-036K-005-04` | Client invents purchasability | HTTP, authorization, security | Client-supplied candidate id/eligibility flag is ignored; server eligibility stands | Recommendation read and add | Forged client body | Forged candidate is not purchasable and writes no mark |
| `US-036K-005` | `AC-036K-005-05` | Duplicate padding | Domain | Exact same item already in cart without filling an absent section is not inserted to pad the ceiling; Menu/Product manual add still allowed when commerce allows | Cart presence + gap rules | Duplicate fixture | Padded duplicate recommendation is absent |
| `US-036K-006` | `AC-036K-006-01` | Stale candidate remains in later sets | Domain, HTTP | After candidate becomes inactive/unavailable/out-of-context, a new set omits it | Refilter on next read | Lifecycle fixture | That candidate id is absent |
| `US-036K-006` | `AC-036K-006-02` | Stale add traps order | Domain, HTTP, recovery, browser | Stale recommendation add is rejected; no recommendation-origin unit created; prior lines preserved; existing commerce recovery is used; no silent substitute item | Add-time revalidation + existing recovery | Invalidate after issue | Substitute item and recommendation-origin unit are absent |
| `US-036K-006` | `AC-036K-006-03` | Rejection blocks commerce | Integration, browser | After rejected stale add, Cart, Checkout, and Payment remain usable for remaining valid cart | Existing commerce handlers | Same fixture | Checkout/Payment blocked solely by recommendation rejection is absent |
| `US-036K-007` | `AC-036K-007-01` | Generation failure blocks order | Integration, recovery, browser | Forced generation/ranking/transport failure leaves Product, Menu, Cart, Checkout, Payment usable; payment not prevented | Fail-open read path | Fault injection | Blocking recommendation error that gates those surfaces is absent |
| `US-036K-007` | `AC-036K-007-02` | Failure writes cart intent | Domain, HTTP | Same failure leaves cart unchanged and does not block the primary task | Cart revision before/after | Fault injection | Cart revision/line change from the failure is absent |
| `US-036K-008` | `AC-036K-008-01` | Special removal path | Domain, HTTP, browser | Recommendation-origin line removes through ordinary cart removal; totals follow existing cart rules | `removeCartLine` | Recommendation-added fixture | Recommendation-only delete command is absent |
| `US-036K-008` | `AC-036K-008-02` | Suppression not started or too broad | Domain, database, HTTP | Successful removal starts candidate suppression for the active cart/session; later sets omit that exact candidate; other eligible candidates may still appear | Suppression row keyed by cart + exact identity | Same | Failed removal does not create suppression. Other candidates not blanket-removed |
| `US-036K-008` | `AC-036K-008-03` | Suppression deletes menu item | Domain, browser | Suppressed recommendation still appears through ordinary Menu/Product when catalog truth allows | Menu projection | Suppressed candidate still active in catalog | Menu tombstone / catalog delete is absent |
| `US-036K-008` | `AC-036K-008-04` | Manual re-add inherits assistance | Domain, integration | After remove, later Menu/Product add of same item has no recommendation attribution on purchase | Unmarked add path | Manual add after suppression | Assisted-purchase mark from the removed lineage is absent |
| `US-036K-008` | `AC-036K-008-05` | Suppression crosses session/customer | Domain, database | New cart/session may recommend again; other customers/carts are unaffected | Distinct cart/session fixtures | Two carts | Cross-cart/cross-customer suppression leakage is absent |
| `US-036K-009` | `AC-036K-009-01` | Collapsed measurement meanings | Domain, integration, measurement | Prove distinct durable meanings for `SET_ISSUED`, `SET_RENDER`, `ITEM_IMPRESSION`, `RECOMMENDATION_ACTION`, `ADD_ATTEMPT`, `SUCCESSFUL_ADD`, `REMOVAL`, `ASSISTED_PURCHASE` per Measurement CANDIDATE-2 | Measurement encoding | Fixture journey | Render counted as add, or attempt counted as success, is absent |
| `US-036K-009` | `AC-036K-009-02` | Weak assistance chain | Domain, integration, database | Assisted purchase only when validated presentation + recommendation action + accepted recommendation add + exact marked identity survives + purchased Order from Checkout Snapshot; Cancelled Order excluded | Fit §7.12 chain + Measurement CANDIDATE-2 | Full proof fixture and negative fixtures | Issuance-only, impression-only, rejected-add click, manual add, removed/recreated, replaced identity, Cancelled Order, and missing presentation/correlation are unmarked |
| `US-036K-009` | `AC-036K-009-03` | Quantity/config wrongly drops mark | Domain | Quantity change and unrelated valid configuration change preserve attribution only while exact marked identity remains — independently for concrete product, category→concrete product, exact variant, exact modifier | Unit provenance | Four identity fixtures | Mark remains after identity no longer remains |
| `US-036K-009` | `AC-036K-009-04` | Recreation/replacement keeps old mark | Domain, database | Product replacement drops attribution; remove then manual recreation does not restore it; manually existing/coalesced units do not inherit; only units created through proven recommendation action are marked | Coalesce + provenance rules | Replacement and coalesce fixtures | Inherited/restored mark is absent |
| `US-036K-009` | `AC-036K-009-05` | Second recommendation add reuses old lineage | Domain | Later recommendation add that survives to Order starts a new assisted lineage | New action correlation | Second recommendation add | Old lineage id reused as the only lineage is absent |
| `US-036K-009` | `AC-036K-009-06` | View-through assistance | Domain, measurement | Saw recommendation, added by another path → not assisted | Ordinary add after impression | Impression-only fixture | Assisted purchase from view-through is absent |
| `US-036K-010` | `AC-036K-010-01` | Non-deterministic / ML rank | Domain | Same eligible inputs/relationships/priorities/evidence/context → same order; no ML/vector/LLM dependency | Ranking function | Deterministic fixtures | External ML call and non-repeatable order are absent |
| `US-036K-010` | `AC-036K-010-02` | Priority promotes ineligible | Domain | Relationship priority may reorder eligible candidates only; ineligible with higher priority stays absent; when contribution authority unavailable it does not reorder and no money formula is invented | Eligibility-before-rank + no contribution field | High-priority ineligible fixture | Ineligible winner and invented contribution formula are absent |
| `US-036K-010` | `AC-036K-010-03` | Exact weight promised | Component, content | Operator/customer communication does not promise exact numeric ranking weights as product behaviour | Copy contract | Admin UI + customer UI | Exact weight promise string is absent |
| `US-036K-010` | `AC-036K-010-04` | Internal rationale leaked | Component, HTTP, content | Customer payload/UI omit priority, contribution, margin, and equivalent internal rationale | Customer-safe response contract | Ranked set with priority differences | Those fields/strings are absent from customer surfaces |
| `US-036K-011` | `AC-036K-011-01` | Popular population wrong | Domain, database | Popular uses trailing 30 days, selected Outlet, successful direct Orders only, statuses `PLACED`/`ACCEPTED`/`FULFILLED`, `CANCELLED` excluded, ≥30 distinct Orders, current relevant menu section, purchased-unit count (`line_origin=cart`), top 3 eligible, complimentary_offer excluded | Orders + checkout snapshots/lines; ARCH-G05/G07 | Seeded order history | Aggregator store, complimentary units, Cancelled, and non-top-3 Popular are absent |
| `US-036K-011` | `AC-036K-011-02` | Insufficient evidence still claims Popular | Domain, component | <30 qualifying Orders, or evidence read/evaluation failure → no Popular; eligible recommendations may still show without that claim | Popular read | 29-order fixture and fault injection | Popular label present under insufficient/failed evidence is absent |
| `US-036K-011` | `AC-036K-011-03` | Popular blocks launch | Integration, browser | With no Popular evidence, Product/Customization/Cart recommendations and ordering still function | Fail-open Popular | Empty evidence | Ordering blocked solely by missing Popular is absent |
| `US-036K-011` | `AC-036K-011-04` | False Popular | Domain, component, content | Outside top 3 or unmet threshold → no Popular treatment; no trend/co-purchase/personalization claim | Evidence rule | Rank 4 fixture | False Popular and those claims are absent |
| `US-036K-012` | `AC-036K-012-01` | Wrong relationship model | Domain, HTTP, authorization | Authorized operator sets source `PRODUCT\|CATEGORY`, target `PRODUCT\|CATEGORY`, kinds, placements `PRODUCT_DETAIL\|CART`, relative priority, optional effective period; Customization placement not supported; no variant/modifier target | `menu.manage` + relationship schema | Workforce fixture | `CUSTOMIZATION` placement and variant/modifier targets are rejected/absent |
| `US-036K-012` | `AC-036K-012-02` | Disable ignored for new sets | Domain, HTTP | Activate may publish when eligible; disable or outside effective period stops new sets from using it | Relationship revision | Active then disabled fixture | Disabled/expired relationship still published in new sets is absent |
| `US-036K-012` | `AC-036K-012-03` | Disable wipes cart | Domain, HTTP | Disable leaves already-added recommendation-origin cart units until ordinary cart/checkout rules change them | Existing cart lines | Line added then disable | Automatic line deletion on disable is absent |
| `US-036K-012` | `AC-036K-012-04` | Unauthorized write | Authorization, HTTP | Actor without brand `menu.manage` is denied for define/activate/disable; nothing written; caller-supplied role/scope cannot authorize; no recommendation-specific role/permission | Workforce session + server-derived brand scope | Missing-permission fixture | Successful write and new permission/role are absent |
| `US-036K-012` | `AC-036K-012-05` | Cross-brand / outlet promotion | Authorization, HTTP | Cross-brand denied; `outlet_manager` is not silently promoted to brand authority; other scope unchanged | Server-loaded brand scope; ARCH-G08/G23/G25 | Two-brand and outlet_manager fixtures | Cross-brand mutation and outlet→brand promotion are absent |
| `US-036K-012` | `AC-036K-012-06` | Relationship bypasses eligibility | Domain, HTTP | Active high-priority ineligible target is not shown as purchasable | Eligibility after relationship match | High-priority ineligible target | Ineligible target returned as purchasable is absent |
| `US-036K-013` | `AC-036K-013-02` | Holdout changes commerce | Domain, HTTP, browser | With activated fixture assignment = holdout, recommendation presentation suppressed; catalog/price/promotions/fulfilment/Cart/Checkout/Payment/entitlements unchanged | Measurement holdout design (inactive by default; fixture-activated) | Holdout-assigned session fixture | Commerce divergence beyond presentation is absent |
| `US-036K-013` | `AC-036K-013-03` | Holdout alters entitlements/prices | Domain, integration | Holdout order path matches commerce that would exist without recommendation change | Same commerce authorities | Paired holdout vs treatment fixtures for non-recommendation facts | Price/promotion/entitlement deltas caused by holdout are absent |
| `US-036K-013` | `AC-036K-013-04` | Treatment never sees recommendations | Domain, browser | Non-holdout session may receive recommendations under V1 rules when eligible | Treatment arm fixture | Eligible candidates | Permanent global suppression in treatment is absent |
| `US-036K-013` | `AC-036K-013-05` | Unknown assignment blocks commerce | Domain, recovery, browser | Unknown/missing assignment suppresses recommendation module and leaves commerce fail-open | Assignment read failure / missing row | Fault injection | Checkout/Payment blocked by unknown assignment is absent |

`QUALITY_PLAN_COVERS_ALL_MANDATORY_AC = YES`.

## 4. Directional holdout readiness (`AC-036K-013-01`)

`AC-036K-013-01` is not a live-activation Product acceptance outcome. Quality still proves the
selected Measurement design is testable without activating production holdout.

| Check | Layers | Planned check | Negative evidence |
|---|---|---|---|
| Enrollment of never-exposed session | Domain, HTTP | When a future holdout config is fixture-activated, an eligible active ordering session with no prior recommendation exposure under that experiment version can be enrolled | Enrollment of a previously exposed session is absent |
| Previously exposed pre-activation session | Domain, database | A session with `SET_ISSUED` or validated presentation before activation is excluded from that experiment version and is not newly randomized | Retroactive HOLDOUT assignment after prior exposure is absent |
| Assignment before exposure | Domain, concurrency, HTTP | When a fixture activates holdout and an ordering session is already bound to an existing guest cart credential or active brand cart, the assignment is written before that read returns a module. A read with no established ordering session does not enroll and returns no module. Commerce continues. No credential is invented | A module returned before assignment on a cart-bound session is absent. Pre-cart enrollment, an anonymous session, and a new credential are absent |
| Stable unit | Database, HTTP | Assignment is stable for the server-owned ordering session bound to that existing guest cart credential or brand cart. Reload, claim, and reconcile of that same cart reuse the arm. There is no pre-cart session to merge. Customer auth user id, phone, and email are not the unit | Arm flip after reload, claim, or reconcile of the same cart is absent. A customer-id key or a second credential is absent |
| Unknown assignment | Domain, browser | Suppresses recommendations; commerce available; no holdout label | Holdout explanation copy is absent |
| Browser not authority | Security, HTTP | Browser/profile cannot choose or forge arm | Client-supplied arm ignored; no write |
| Concurrent first requests | Concurrency, database | Race settles to one stable authoritative assignment | Two arms for one session are absent |
| Inactive experiment configuration | Domain, database | Default/inactive configuration writes no experiment assignment row solely for experimentation | Production activation by this candidate is absent |
| Neutral ordering-session correlation | Database | While holdout is inactive, a neutral `recommendation_ordering_sessions` row may exist only when bound to an existing guest cart credential or active brand cart, and only for issued-set or presentation correlation. It has no experiment arm. It is not written for a pre-cart guest | `holdout_arm` on the ordering-session row is absent. A pre-cart neutral session row is absent |
| Purchased-order assignment fact (`QT-036K-MQ-013`) | Domain, database | After a fixture-activated assignment, Order materialization copies the arm onto an immutable non-priced `recommendation_order_assignment_facts` row keyed by `(order_id, experiment_key)` with `checkout_snapshot_id`. A unique conflict returns the existing fact and does not change the arm. A failed fact write does not fail Order materialization and does not mutate Order, Checkout Snapshot, or payment rows. Expiring the cart/session afterwards leaves that Order classifiable. A holdout Order with no issued set remains classifiable. The fact is ignored by price, tax, promotion, fulfilment, payment, and stock. It is not written while holdout is inactive. Materialization retry does not create a second fact | Live cart/session used as purchased-order arm authority; priced fact; arm changed on conflict; Order, snapshot, or payment mutation from a failed fact write; fact written solely because holdout is inactive; Order unclassifiable after cart/session expiry |

`HOLDOUT_ACTIVATED_IN_THIS_CANDIDATE = NO`.
`FUTURE_EXPERIMENT_ENABLED = NO`.

## 5. Experience requirements

All sixteen Experience requirements are traced.

| XR | Risk | Layers | Planned check | Negative evidence |
|---|---|---|---|---|
| `XR-IMP-036K-001` | Recommendations outrank primary task | Component, browser | On Product Detail, Customization, and Cart, primary task remains first; recommendation group secondary | Recommendation visually displacing primary action is absent |
| `XR-IMP-036K-002` | Forced suggestion step | Browser | Ignore group and complete primary task; Checkout not dependent on accepting a suggestion | Checkout gated on suggestion acceptance is absent |
| `XR-IMP-036K-003` | View mutates intent | Domain, browser | Viewing group does not add, swap, or preselect paid modifier | Silent mutation is absent |
| `XR-IMP-036K-004` | Shortened configuration | Component, browser | Needs-configuration path opens existing customization; required choices not skipped; paid modifiers not preselected | Nested recommendation modal and skipped required choices are absent |
| `XR-IMP-036K-005` | Loading freezes commerce | Browser, recovery | Primary action usable while set loading; slow/missing response does not freeze Product/Customization/Cart/Checkout entry | Blocking skeleton that freezes primary task is absent |
| `XR-IMP-036K-006` | Empty padded shell | Component, browser | Zero eligibles → no group, no apology, no padding; empty cart → no group | Empty shell / apology / padding is absent |
| `XR-IMP-036K-007` | Fail-closed error | Integration, browser | Generation/ranking/network failure → no blocking recommendation error; commerce usable | Blocking retry that gates checkout is absent |
| `XR-IMP-036K-008` | Harsh stale recovery | Browser, recovery | Stale refusal uses existing calm recovery; remaining cart and Checkout stay available | Recommendation-only panic error page is absent |
| `XR-IMP-036K-009` | Suppression looks like menu delete | Browser, content | Ordinary removal; candidate omitted from later recommendation groups only; announcements do not say item left the menu; Menu/Product still find it when catalog allows | Menu-delete announcement is absent |
| `XR-IMP-036K-010` | Popular without evidence | Component, content | Popular word only when evidence rule passes; otherwise neutral copy | Popular under unmet evidence is absent |
| `XR-IMP-036K-011` | Workforce Customization placement / unclear disable | Component, authorization, browser | Operator sees product/category relationship, Product Detail and Cart placements, priority, period, active state; no Customization placement or variant/modifier target; disable stops new use and leaves cart lines; unauthorized/cross-scope uses existing denial | Customization relationship placement control is absent |
| `XR-IMP-036K-012` | Mobile Checkout blocked | Browser, responsive | Narrow viewport keeps recommendation secondary; sticky Checkout remains visible/reachable; group never enters Checkout summary | Checkout hidden/blocked by recommendation placement is absent |
| `XR-IMP-036K-013` | Keyboard trap / focus theft | Accessibility, browser | Recommendation actions keyboard-reachable; group does not trap focus; async arrival never steals focus; Product Detail focus entry/back restoration; customization modal initial focus, Tab/Shift+Tab containment, Escape close, exact opener restoration, same-dialog variant-transition focus; add-on state perceivable after action | Focus stolen by async recommendations is absent |
| `XR-IMP-036K-014` | Missing semantics / wrong announcements | Accessibility, browser | Group named from heading; each item/action named; success/rejection/removal announced without claiming menu deletion | Menu-deletion announcement after cart remove/suppress is absent |
| `XR-IMP-036K-015` | Trust-breaking claims | Content, browser | No priority/margin/co-purchase/personalization/trend/savings/fake scarcity claims; approved headings only; LANG-1 customer language | Forbidden claim words are absent |
| `XR-IMP-036K-016` | Holdout explanation | Browser, content | Holdout fixture shows no module, no holdout label, no explanatory message; catalog/prices/checkout look ordinary | Holdout explanation copy is absent |

`QUALITY_PLAN_COVERS_ALL_XR = YES`.
`XR_COVERAGE = 16/16`.

Content QA for Design Readiness finalized strings and forbidden words is a component or browser
assertion. Approved headings remain “Goes great with this”, “Make it yours”, and “Complete your
order”. Evidence-backed item label remains `Popular`. `CONTENT_QA_PLANNED = YES`.
`LANG_1_PROOF_PLANNED = YES`.

## 6. Exact identity / unit continuity matrix

Cover independently for: concrete product recommendation; category target resolving to concrete
product; exact variant upgrade; exact modifier option.

| Case | Planned result | Negative evidence |
|---|---|---|
| Quantity change while exact identity remains | Attribution preserved | Dropped mark while identity remains |
| Unrelated valid configuration change while identity remains | Attribution preserved | Dropped mark solely from unrelated valid change |
| Modifier removal of marked option | Modifier attribution dropped | Parent-product survival keeps modifier mark |
| Variant change away from marked variant | Variant attribution dropped | Parent-product survival keeps variant mark |
| Product replacement | Attribution dropped | Old mark on replacement product |
| Category target | Follows concrete product presented/added, not the category | Category survival alone counts as assistance |
| Remove then manual recreation | No restored attribution | Recreated line marked from old lineage |
| Manually existing / coalesced units | Do not inherit recommendation provenance | Inherited mark on pre-existing units |
| Only proven recommendation-action units marked | Ordinary Menu/Product add unmarked | Client boolean creates a mark |
| Checkout Snapshot copy | Copies only surviving marked identity as non-priced provenance; `line_origin` stays `cart` or `complimentary_offer` | New commercial `line_origin`; dropped mark recopied; mark used as price/promotion/tax/payment input |
| Purchased Order | Assisted purchase true only for non-cancelled Order bound to that snapshot and surviving mark | Cancelled Order counted; parent-product or category counted as the marked identity |

`EXACT_IDENTITY_PROOF_PLANNED = YES`.

## 7. Presentation observation proof

```text
SET_ISSUED != SET_RENDER
SET_RENDER != ITEM_IMPRESSION
```

| Case | Layers | Planned result | Negative evidence |
|---|---|---|---|
| Server-returned set never shown | Domain, measurement | No `SET_RENDER` | Render invented from issuance |
| Hidden/off-screen/uncommitted module | Component, measurement | No `SET_RENDER` | DOM-only presence counted |
| Actually shown module | Browser, measurement | Eligible `SET_RENDER` after server validation | Client-only render without server row |
| Item in payload never shown / below fold | Component, measurement | No `ITEM_IMPRESSION` | Membership-only impression |
| Actually shown specific item | Browser, measurement | Eligible `ITEM_IMPRESSION` after server validation | Impression for non-member |
| Browser echoes server correlation only | HTTP, security | Observation carries issued correlation; cannot invent set, membership, rank, placement, eligibility, holdout, or schema version | Invented membership accepted |
| Server validates observation | Domain, HTTP | Invalid/unsupported event-contract input writes nothing | Unvalidated client event becomes occurrence |
| Schema version on durable rows | Database, measurement | Every durable material measurement occurrence is associated with `IMP-036K-RECOMMENDATION-MEASUREMENT-V1` | Row without recorded schema version treated as current by default invention |
| Incompatible future version | Domain, measurement | A later incompatible schema identity is not silently interpreted as V1; old rows remain interpretable under their recorded version | Silent reinterpretation of old rows |
| Missing required correlation | Domain, recovery | Attribution fails closed; commerce continues | Checkout failed because measurement correlation was missing |
| Ordinary React rerender/remount | Component, measurement | No duplicate presentation occurrence | Remount doubles count |
| Retry/replay of same observation | Recovery, measurement | No double authoritative occurrence | Second row for same occurrence identity |
| Observation/reporting failure | Recovery, browser | Commerce remains usable; attribution fails closed | Checkout failed because measurement failed |

`PRESENTATION_OBSERVATION_PROOF_PLANNED = YES`.

## 8. Assisted purchase and action meanings

| Meaning | Distinct planned proof |
|---|---|
| `SET_ISSUED` | Qualifying returned set records server correlation; not presentation |
| `SET_RENDER` | Server-validated actual module presentation only |
| `ITEM_IMPRESSION` | Server-validated actual item presentation only |
| `RECOMMENDATION_ACTION` | Explicit customer action on exact issued member; maps architecture "Click"; not add acceptance |
| `ADD_ATTEMPT` | Recommendation-origin command attempt recorded even when rejected |
| `SUCCESSFUL_ADD` | Existing Cart accepts current revalidated mutation |
| `REMOVAL` | Removal of recommendation-origin units for measurement/suppression; not Cart authority |
| `ASSISTED_PURCHASE` | Validated presentation + action + accepted add + exact marked identity survival + purchased non-cancelled Order from Checkout Snapshot |

Negative assistance cases that must fail closed while commerce may still succeed when otherwise
valid: issuance only; impression only; recommendation click with rejected add; manual add;
removed/recreated manual line; replaced identity; `CANCELLED` Order; missing presentation
proof/correlation/persistence.

`ASSISTED_PURCHASE_PROOF_PLANNED = YES`.

## 9. Popular evidence boundary proof

| Boundary | Planned check |
|---|---|
| Exact 30-day window | Order at window edge included/excluded by locked trailing-30-day rule |
| Exact 30-order threshold | 29 → no Popular; 30 → Popular allowed for top 3 only |
| Deterministic ties/order | Equal purchased-unit ties resolve deterministically; no non-deterministic Popular set |
| Status filter | `PLACED`/`ACCEPTED`/`FULFILLED` counted; `CANCELLED` excluded |
| Line origin | `line_origin=cart` counted; `complimentary_offer` excluded |
| Outlet | Selected Outlet only |
| Category | Current relevant menu section membership |
| Failure | Evidence read/evaluation failure → no Popular |
| Launch independence | Missing Popular does not block recommendations/ordering |

`POPULAR_EVIDENCE_PROOF_PLANNED = YES`.

## 10. Surface coverage

| Surface | Planned IMP-036K proof | Must not become |
|---|---|---|
| Product Detail | Complements ≤3; heading; ignore; no Menu Discovery module | Primary product task replacement |
| Recommendation presentation | Secondary group; validated render/impression; LANG-1 headings | Client-authored set or claim |
| Customization | Existing variant/modifier authority only; “Make it yours”; ARCH-G20 | Relationship-authored customization; paid preselect |
| Cart | Non-empty ≤4; empty has no module; Checkout reachable | Checkout gate; group-quantity inference |
| Checkout | Snapshot copies surviving non-priced provenance only; handlers do not call recommendation read | Second payable truth; recommendation in Checkout summary |
| Payment | Existing Payment collection; failure/holdout cannot block retry | Recommendation-owned payment event |
| Purchased Order | Assisted purchase and Popular read Order/snapshot lineage; Cancelled excluded | Recommendation rewrite of Order lifecycle |
| Workforce administration | `menu.manage` define/activate/disable on `/api/admin/v1/*`; `menu.read` read | New role/permission; Customization placement; customer `/api/v1/*` admin |

## 11. CR2 risk proof

### Ranking and contribution

| Check | Layers | Negative evidence |
|---|---|---|
| Eligibility precedes ranking | Domain | Ineligible winner via priority |
| Deterministic ordering | Domain | Non-repeatable order |
| Priority reorders eligible only | Domain | Ineligible promoted |
| No ML/vector/LLM dependency | Integration | External recommendation platform call |
| No invented contribution formula | Domain | Money formula from display price or priority |
| Unavailable contribution does not reorder | Domain | Reorder attributed to missing contribution |

### Authorization, privacy, and scope

| Check | Layers | Negative evidence |
|---|---|---|
| `menu.read` allows relationship admin read | Authorization, HTTP | Read denied for authorized reader incorrectly, or open read without `menu.read` |
| `menu.manage` required for write | Authorization, HTTP | Write without `menu.manage` |
| Server-derived brand scope | Authorization | Caller-supplied brand/role authorizes |
| `brand_admin` allowed through existing authority | Authorization | Invented recommendation permission required |
| `outlet_manager` not promoted | Authorization | Outlet-scoped write succeeds for brand relationship |
| Cross-brand denied | Authorization | Other brand mutated |
| Admin stays on `/api/admin/v1/*` | Authorization, HTTP | Relationship write accepted on customer `/api/v1/*` |
| No Pricing/Promotion/Campaign/Limited Drop authority created | Domain, HTTP | Recommendation admin mutates those authorities |
| No payment secrets / address / name / full profile in recommendation telemetry | Security, measurement | Sensitive fields stored |
| No customer-visible priority/margin | HTTP, content | Fields present on customer payload |
| No client-owned eligibility, set identity, or membership | Security, HTTP | Client fields accepted as authority |
| Browser cannot author holdout, rank, or assistance | Security, HTTP, measurement | Client-supplied holdout/rank/assistance stored as truth |
| Required measurement identities present | Database | Durable row missing required occurrence, session, issued-set/member, or schema-version identity where that meaning requires it |
| No cross-customer cart or suppression leakage | Database, security | Foreign cart suppression applied |
| Replayed stale recommendation cannot bypass current eligibility | Security, recovery | Stale action creates units |
| Instrumentation endpoint rejects unsupported sensitive/client-authoritative fields | HTTP, security | Unsupported fields write rows |

`CR2_SECURITY_ABUSE_REVIEW_PLANNED = YES`.

### Persistence

Database integration on real PostgreSQL, not an in-memory double, for later implementation of:

- relationship rows and compare-and-swap revision
- cart suppression keyed by cart + exact candidate identity
- issued-set correlation and presentation occurrences, including required authoritative identities and `measurement_schema_version`
- cart-unit assistance marks and snapshot provenance copy
- ordering-session correlation rows (no experiment arm on that relation)
- ordering-session holdout assignment rows when fixture-activated, never solely because a neutral session row exists
- immutable non-priced `recommendation_order_assignment_facts` copied at Order materialization when an assignment exists, surviving cart/session expiry (`QT-036K-MQ-013`)
- Popular read over Orders/snapshots without a second order truth

`DATABASE_PROOF_PLANNED = YES`.

### Concurrency

Real overlapping transactions, not sequential calls:

| Race | Required result |
|---|---|
| Two relationship writers with revisions | One winner via compare-and-swap; loser non-success; ineligible target still not published at customer read |
| Duplicate recommendation add submit | Existing cart conflict/coalesce rules; no second mark for same unit |
| Suppression insert retry | Idempotent per cart + candidate |
| First holdout assignment race (fixture-activated) | One stable assignment |
| Concurrent presentation observation retries | One authoritative occurrence |
| Attribution mark after committed add retry | No second mark for same unit |
| Order materialization retry of assignment-fact copy | One `recommendation_order_assignment_facts` row per `(order_id, experiment_key)`. A unique conflict returns the existing fact and does not change the arm. A failed fact write does not fail Order materialization and does not mutate Order, Checkout Snapshot, or payment rows |

`CONCURRENCY_PROOF_PLANNED = YES`.

### Recovery and idempotency

| Case | Required result |
|---|---|
| Recommendation read timeout/error | No module; no issued set; commerce continues |
| Lost GET after committed `SET_ISSUED` (`QT-036K-MQ-002`) | Retry with the same client-generated `recommendationReadId`, by the same authorized guest cart credential or customer cart that owns that issuance, returns that issued set and writes no second issuance. A different caller presenting only the id does not receive the set. A pre-cart guest has no such owner, so that lost GET is not durably retry-safe and is not replayed by id alone. A new `recommendationReadId` may create a new issuance when a qualifying set is returned for an authorized owner. No new service. Omitting the id may still return a qualifying set (commerce fail-open) but that path is not the retry-safe proof |
| Lost HTTP response on `RECOMMENDATION_ACTION` | Retry returns the existing action occurrence; no second authoritative action |
| Observation POST failure | Commerce continues; no presentation occurrence; attribution fails closed |
| Stale recommendation add | Rejected; prior lines remain; existing recovery |
| Lost HTTP response on recommendation add | Retry safe under existing cart revision/idempotency; no double recommendation-origin units |
| Relationship disable after add | Existing cart units remain; future sets omit |
| Measurement write failure after commerce accept | Cart commit remains; assistance not claimed |

`RECOVERY_PROOF_PLANNED = YES`.

## 12. Server-authority invariants

| Invariant | Planned proof | Negative evidence |
|---|---|---|
| ARCH-G05 | Popular and assisted purchase read immutable Checkout Snapshot / Order lineage. Display price is not payable truth | Recommendation writes snapshot totals or a second purchased-history store |
| ARCH-G06 | Payment remains original collection truth. Recommendation failure/holdout does not author a payment | Payment handler calls recommendation read; recommendation event treated as paid |
| ARCH-G07 | Order remains post-purchase lifecycle truth. Cancelled Orders are not assisted purchases and not Popular | Recommendation mutates Order status or counts Cancelled as success |
| ARCH-G08 | Caller-supplied role, scope, eligibility, candidate, holdout, or mark is ignored | Client field authorizes write or purchasability |
| ARCH-G11 | Browser is not commercial authority for price, eligibility, set membership, assistance, or holdout | Client boolean creates a mark, set, or arm |
| ARCH-G19 | Menu display price/availability remain a read model | Recommendation becomes catalog, price, or availability authority |
| ARCH-G20 | Recommendation is not selection; positive-price modifiers need explicit customization | Paid default created by recommendation render |
| ARCH-G09 / G22 | Existing cart revision and unit-sequence remain add/remove/quantity authority | Recommendation-specific line-identity protocol |
| ARCH-G23 / G25 | Workforce relationship admin on `/api/admin/v1/*` from server-validated workforce session | Admin accepted on customer `/api/v1/*` or caller-shaped principal |

`SERVER_AUTHORITY_PROOF_PLANNED = YES`.

## 13. Measurement contract proof

This Quality candidate proves paired `IMP-036K-MEASUREMENT-CANDIDATE-2` without redefining
Product acceptance and without editing that file:

- event meanings concretely distinguishable
- holdout inactive by default; future 10/90 design testable
- assignment unit = server-owned ordering session bound to an existing guest cart credential or active brand cart. Customer auth user id, phone, and email are not the key. No anonymous commerce session exists. Activated holdout uses Architecture 7.14 mechanism 2: a read with no established ordering session does not enroll and returns no module. Durable pre-cart guest correlation remains `MD-036K-008` and is not proved by inventing a credential
- experiment population: never-exposed eligible sessions may enroll when future holdout is
  activated; already-exposed pre-activation sessions are excluded from that experiment version;
  retroactive enrollment is forbidden
- every durable material occurrence associated with `IMP-036K-RECOMMENDATION-MEASUREMENT-V1`;
  incompatible future versions are not silently read as V1; old rows keep their recorded version
- required event attributes: real PostgreSQL constraints/rows prove authoritative identities;
  browser cannot supply authoritative membership/rank/eligibility/holdout/assistance fields;
  missing required correlation fails closed for attribution but not commerce
- AOV grounded in `checkout_snapshots.grand_total_paise` through Order lineage; only qualifying
  successful Orders enter conditional AOV; completion guardrail reporting remains separate and
  visible; a fixture where treatment AOV rises but order completion falls is **not** interpreted as
  automatic overall business success; insufficient evidence stays `INSUFFICIENT_EVIDENCE`
- attach grounded in exact assisted identity, not impression/action-only
- contribution formula not invented
- commerce fail-open; attribution fail-closed
- no analytics vendor; server write authority
- each `MQ-036K-001`…`017` meaning in Measurement CANDIDATE-2 §18 has a planned, not-executed
  proof in section 13.1; two meanings that this Quality file previously omitted
  (`recommendationReadId` issuance retry after a lost GET that already committed `SET_ISSUED`,
  and immutable non-priced `recommendation_order_assignment_facts` copied at Order
  materialization) are added as `QT-036K-MQ-002` and `QT-036K-MQ-013`. Measurement meaning is
  not changed to dodge those proofs

`MEASUREMENT_PROOF_PLANNED = YES`.
`MQ_TRACEABILITY_MAPPED = YES`.
`PROOF_EXECUTED = NO`.

### 13.1 Measurement Quality (`MQ-036K-*`) traceability

Paired encoding: `IMP-036K-MEASUREMENT-CANDIDATE-2` §18. This map does not redefine those
meanings. Every row is planned proof only. `PROOF_EXECUTED = NO` for every id.

| MQ | Meaning | Planned proof (not executed) | Existing Quality cite, or added row |
|---|---|---|---|
| `MQ-036K-001` | `SET_ISSUED` | Qualifying return writes one server-owned issuance with membership and bound actions; suppressed, empty, or failed read writes none; issuance is not render or impression | `QT-036K-009-01`; section 8 `SET_ISSUED`; section 7 server-returned set never shown; recovery recommendation-read timeout/error |
| `MQ-036K-002` | `SET_ISSUED` retry | Same client-generated `recommendationReadId` after a committed `SET_ISSUED` and a lost GET returns that issued set only to the same authorized guest cart credential or customer cart that owns it, and writes no second issuance. A different caller presenting only the id does not receive the set. A pre-cart guest has no owner, so that path is not durably replayed by id alone. A new read id may create a new issuance for an authorized owner. No new service | **Added** `QT-036K-MQ-002` in section 11 Recovery. Batch 3R adds the owner-scope negative. No prior Quality row covered client GET retry identity after commit |
| `MQ-036K-003` | `SET_RENDER` | Durable render only after server validation of actual module presentation; server return, hidden DOM, pre-render, remount of the same issued set, or unvalidated client input writes none | `QT-036K-009-01`; section 7 `SET_RENDER` rows including remount and invalid observation |
| `MQ-036K-004` | `ITEM_IMPRESSION` | Durable impression only after server validation that that issued member was actually shown; membership, below-fold presence, or remount of the same member writes none | `QT-036K-009-01`; section 7 `ITEM_IMPRESSION` rows |
| `MQ-036K-005` | `RECOMMENDATION_ACTION` | Explicit action on the bound issued member is distinct from add acceptance; lost HTTP retry returns the existing action occurrence | `QT-036K-009-01`; section 8 `RECOMMENDATION_ACTION`; section 11 lost-HTTP `RECOMMENDATION_ACTION` retry |
| `MQ-036K-006` | `ADD_ATTEMPT` | Recommendation-origin command attempt is recorded even when current cart validation rejects it; opening customization is not a successful add | `QT-036K-009-01`; `QT-036K-009-02`; `QT-036K-004-02`; section 8 `ADD_ATTEMPT` |
| `MQ-036K-007` | `SUCCESSFUL_ADD` | Exists only when existing Cart accepts the revalidated mutation; retry after commit does not create a second success for the same unit set | `QT-036K-009-01`; section 8 `SUCCESSFUL_ADD`; section 11 lost-HTTP add and duplicate-add concurrency |
| `MQ-036K-008` | `REMOVAL` | Removing recommendation-origin units writes a measurement removal and starts suppression without becoming Cart or menu authority | `QT-036K-008-01`…`05`; section 8 `REMOVAL` |
| `MQ-036K-009` | `ASSISTED_PURCHASE` | True only when Architecture 7.12's seven proofs hold and the Order is not Cancelled; view-through, issuance-only, parent-product survival, category survival, manual re-add, and unmarked coalesced units are not assistance | `QT-036K-009-02`…`06`; sections 6 and 8 assisted-purchase / exact-identity matrix |
| `MQ-036K-010` | Attach / AOV projection | Attach uses exact assisted identities; AOV uses `checkout_snapshots.grand_total_paise` on successful direct Orders; menu display price is not used; conditional AOV is interpreted with Measurement §13 guardrails | Section 13 AOV/attach bullets; section 12 ARCH-G05; `QT-036K-009-02` |
| `MQ-036K-011` | Holdout inactive | `HOLDOUT_ACTIVE = NO`. No `recommendation_holdout_assignments` row and no purchased-order assignment fact is written solely because the experiment is inactive. A neutral ordering-session row may exist only when bound to an existing guest cart credential or active brand cart. It is not written for a pre-cart guest and it has no experiment arm | Section 4 inactive configuration and neutral session rows; `HOLDOUT_ACTIVATED_IN_THIS_CANDIDATE = NO`; `QT-036K-013-01` directional |
| `MQ-036K-012` | Holdout fixture only | If a test fixture activates holdout, assignment occurs before exposure or presentation stays suppressed; holdout suppresses presentation only; commerce is unchanged; unknown assignment fails open for commerce | `QT-036K-013-02`…`05`; section 4 enrollment / assignment-before-exposure / unknown-assignment rows |
| `MQ-036K-013` | Purchased-order linkage | After a fixture-activated assignment, Order materialization copies the arm onto `recommendation_order_assignment_facts`. A unique conflict returns the existing fact and does not change the arm. A failed fact write does not fail Order materialization and does not mutate Order, Checkout Snapshot, or payment rows. Expiring the cart/session afterwards does not make that Order unclassifiable. Holdout Orders with no issued set remain classifiable | **Added** `QT-036K-MQ-013` in section 4. Section 6 snapshot-copy remains assistance-mark provenance only and is not this fact |
| `MQ-036K-014` | Forbidden payload | Events reject payment secrets, credentials, full address, names, phone, email, full profile, another customer's cart, client-authored rank/membership/holdout/assistance, and internal margin | Section 11 authorization/privacy table; section 7 browser-echo and server-validation rows; `QT-036K-005-04` |
| `MQ-036K-015` | Fail-open / fail-closed | Measurement or observation failure does not block Product, Cart, Checkout, or Payment. Assistance is not claimed without the seven proofs | `QT-036K-007-01`, `QT-036K-007-02`, `QT-036K-013-05`; section 7 observation/reporting failure; section 11 recovery |
| `MQ-036K-016` | Non-interference | Candidate events do not change entitlements, prices, promotions, fulfilment, checkout totals, stock, or Order lifecycle | `QT-036K-013-02`, `QT-036K-013-03`, `QT-036K-005-02`; section 12 ARCH-G05 / G06 / G19; Product `BR-036K-029` |
| `MQ-036K-017` | Popular distinct | Popular 30-day / 30-order / top-3 evidence is not treated as the experiment window or as a retention period | `QT-036K-011-01`…`04`; section 9 Popular boundary. Popular's locked 30-day rule stays Popular-only |

`MQ_TRACEABILITY_COUNT = 17`.
`MQ_PROOF_EXECUTED = NO`.

## 14. Existing executed tests on this main versus proposed IMP-036K proof

No recommendation runtime, route, schema, or executable IMP-036K test exists on
`a6155378`. Existing suites prove accepted foundations only. They are not IMP-036K evidence.

| Existing path on this main | What it already proves | What it does not prove |
|---|---|---|
| `tests/e2e/customer-ordering.spec.ts` | Guest discover-to-pay and payment dismiss/failure/retry on the accepted path (`GJ-FIRST-ORDER` / `GJ-PAYMENT-RECOVERY` related browser cases) | Recommendation module present, absent, failed, or held out; assisted purchase |
| `tests/cart/cart.domain.test.ts` | Existing `addCartLine` / quantity / remove / coalesce / revision | Recommendation-origin units, marks, suppression |
| `tests/checkout/checkout.domain.test.ts`, `tests/checkout-concurrency/checkout.concurrency.test.ts`, `tests/checkout-security/checkout.security.test.ts` | Checkout Snapshot payable truth, concurrency, security (ARCH-G05) | Snapshot copy of recommendation provenance |
| `tests/customer-commerce/http.integration.test.ts` | Customer cart/checkout HTTP façade | Recommendation read; observation POST |
| `tests/payment/payment.domain.test.ts`, `tests/payment-idempotency/payment.idempotency.test.ts`, `tests/payment-security/payment.security.test.ts` | Payment collection, idempotency, security (ARCH-G06) | Recommendation-gated payment; holdout payment divergence |
| `tests/order/order.domain.test.ts`, `tests/order-concurrency/order.concurrency.test.ts`, `tests/order-security/order.security.test.ts` | Order lifecycle (ARCH-G07) | Assisted-purchase classification; Popular aggregation rule |
| `tests/promotions/**`, `tests/promotion-coupons/**`, `tests/checkout/imp036j-*.test.ts` | Promotions / coupons / offers remain a separate money authority | Recommendation-created discount |
| `tests/database/customer-menu-modifier-projection.integration.test.ts` | Customer menu projection / modifier presentation | Recommendation set; Popular label |
| `tests/catalog-imp036c-required-topping/bootstrap.integration.test.tsx` | Paid versus zero-price modifier defaults as catalog/customization truth (ARCH-G20 foundation) | Recommendation not newly preselecting a paid modifier |
| `tests/access-control/catalog.test.ts` | `brand_admin` holds `menu.manage`; `outlet_manager` does not | Relationship admin allow/deny on those permissions |
| `tests/administration/admin-menu-http.integration.test.ts` | Existing menu admin HTTP and `menu.manage` gates | Recommendation relationship resource |
| `tests/assortment-availability/operating-state.test.ts` | Pause / operating state as eligibility input | Recommendation override of availability |

Proposed IMP-036K proof (not created, not executed): later implementation-candidate tests named
`QT-036K-*` / `XR-QT-036K-*` at the layers in sections 3–12, plus Golden Journey browser
regression with recommendations present, absent, failed, and fixture-held-out. Checkout and
Payment handlers must still not call the recommendation read.

`EXISTING_EXECUTED_IMP036K_TESTS = NONE`.
`PROPOSED_IMP036K_TESTS_EXECUTED = NO`.

## 15. Golden Journeys / regression

Preserve existing ordering, customization, Cart, Checkout, Payment, Order, Promotions/Coupons/Offers,
Scheduled Fulfilment, Pickup/Delivery, customer auth, and workforce authorization.

| Journey | Required regression |
|---|---|
| `GJ-FIRST-ORDER` | Discover-to-pay still completes with recommendations present, absent, failed, or held out |
| `GJ-AVAILABILITY` | Availability truth and recovery still govern purchasability; recommendations cannot bypass it |
| `GJ-PRODUCT-MENU-LAUNCH` | Menu/product launch path remains usable; no Menu Discovery recommendation leakage; relationships cannot override catalog/menu/price |
| `GJ-PAYMENT-RECOVERY` | Remains reachable when recommendations fail or holdout is assigned |
| `GJ-RETURNING-ORDER` | No new Order Again shortcut; later manual add is not attributed from a prior exposure or removal |

Recommendations must be removable from the runtime path without breaking the primary purchase
journey. Checkout and Payment handlers do not call the recommendation read.

`GOLDEN_JOURNEY_REGRESSION_PLANNED = YES`.

## 16. Quality Attribute Profile mapping

From Product Definition §25b. Planned proof only.

| Attribute | Planned coverage |
|---|---|
| Performance | `XR-IMP-036K-005`; primary task usable while the set loads |
| Availability / resilience | `AC-036K-007-*`, `013-05`; fail-open commerce |
| Reliability | `AC-036K-010-01`; assisted-purchase chain |
| Security / privacy | Section 11 authorization/privacy; no PII/payment secrets in telemetry |
| Accessibility / responsive | `XR-IMP-036K-012`…`014` |
| Concurrency / data integrity | Sections 6, 11; ARCH-G05/G22 |
| Observability / supportability | Distinguish empty, holdout, failure, rejection, removal, disable; never “removed from menu” |
| Backward compatibility | Section 14 existing suites remain valid with recommendations absent |
| Localization / presentation | LANG-1 + Design headings; `XR-IMP-036K-015` |
| Scalability | `N/A` for a new recommendation platform. No ML/vendor/service invented |

## 17. Founder UAT

```text
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
FOUNDER_EXPERIENCE_UAT = NOT_PERFORMED
```

Reason: X3 customer-visible recommendation surfaces and workforce relationship administration.
Functional UAT and Experience UAT are both later. This candidate does not deploy a candidate and
does not record a verdict. Only the Founder supplies that verdict. Agents must not self-declare
`FOUNDER_UAT = PASS`.

## 18. N/A layers

| Layer | When it is N/A |
|---|---|
| Unit | A row whose risk is only a cross-module or browser result. Pure deterministic ranking predicates are not N/A |
| Component | A row with no rendered UI, such as Popular SQL threshold alone |
| Database | A copy-only component row with no durable state |
| Concurrency | A row with no race in the locked architecture |
| Golden Journey | Operator-only rows still need browser proof of the editor; they are not customer Golden Journeys |
| Founder UAT | Not a per-AC execution in this plan. Remains required for the capability later |

## 19. Genuine Quality-gate blockers

These are real gates, not percentage targets.

1. Independent Quality / Test Plan review of this candidate is `NOT_PERFORMED`. This document
   does not award PASS or finalize the plan.
2. Paired Measurement / Instrumentation Plan exists in this worktree as
   `IMP-036K-MEASUREMENT-CANDIDATE-2` and must itself be independently reviewed before X3
   implementation authorization. This Quality candidate does not finalize measurement encoding
   and does not award that review.
3. There is no IMP-036K runtime on this main, so none of the planned `QT-036K-*` proofs can
   be executed yet. Planned rows must not be recorded as executed.
4. Implementation Plan and `IMP036K_IMPLEMENTATION_AUTHORIZED` remain NO. Finalizing this
   Quality candidate later still does not authorize implementation by itself.
5. Founder functional and Experience UAT remain later and human-owned.
6. Missing planned proof for any mandatory YES AC, required XR, required GJ, or Fit §14
   must-prove item blocks Quality/Test Plan finalization. Planned proof is the named scenario,
   applicable TEST-1 layers, oracle, and required negative, security, concurrency, recovery,
   Golden Journey, and measurement-proof mapping in this document. This gate does not require a
   runnable implementation test or a passing execution. Missing passing executable evidence for
   any of those items blocks later implementation QA and later acceptance. Founder UAT remains a
   later human gate. A coverage percentage cannot waive a missing planned mapping at this gate,
   and it cannot waive a missing passing scenario at later QA or acceptance.

Not blockers: historical CANDIDATE-1 count of 62; DR-24 Fit/Design provenance; PR #348
conflict; D-384 existing as programme baseline; `AC-036K-013-01` remaining directional.

`COVERAGE_PERCENTAGE_IS_ACCEPTANCE = NO`.

## 20. Quality exit criteria

```text
ALL_MANDATORY_AC_MAPPED = YES
ALL_APPLICABLE_XR_MAPPED = YES
MQ_TRACEABILITY_MAPPED = YES
LOCKED_ARCHITECTURE_RISKS_COVERED = YES
REQUIRED_NEGATIVE_EVIDENCE_IDENTIFIED = YES
CONCURRENCY_RECOVERY_SECURITY_ACCESSIBILITY_BROWSER_PROOF_NAMED = YES
FOUNDER_UAT_REQUIRED_LATER = YES
ACCEPTANCE_VIA_PERCENTAGE_COVERAGE = NO
PROOF_CLAIMED_EXECUTED = NO
QUALITY_TEST_PLAN_FINALIZED = NO
INDEPENDENT_QUALITY_TEST_PLAN_REVIEW = NOT_PERFORMED
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
DO_NOT_MERGE = YES
```

## 21. Coverage flags

```text
QUALITY_PLAN_COVERS_ALL_MANDATORY_AC = YES
QUALITY_PLAN_COVERS_ALL_XR = YES
XR_COVERAGE = 16/16
MANDATORY_AC_COUNT = 62
DISTINCT_AC_COUNT = 63
EXACT_IDENTITY_PROOF_PLANNED = YES
PRESENTATION_OBSERVATION_PROOF_PLANNED = YES
ASSISTED_PURCHASE_PROOF_PLANNED = YES
POPULAR_EVIDENCE_PROOF_PLANNED = YES
MEASUREMENT_PROOF_PLANNED = YES
MQ_TRACEABILITY_MAPPED = YES
MQ_TRACEABILITY_COUNT = 17
MQ_PROOF_EXECUTED = NO
CR2_SECURITY_ABUSE_REVIEW_PLANNED = YES
CONCURRENCY_PROOF_PLANNED = YES
DATABASE_PROOF_PLANNED = YES
RECOVERY_PROOF_PLANNED = YES
SERVER_AUTHORITY_PROOF_PLANNED = YES
REAL_BROWSER_PROOF_PLANNED = YES
ACCESSIBILITY_PROOF_PLANNED = YES
RESPONSIVE_PROOF_PLANNED = YES
CONTENT_QA_PLANNED = YES
LANG_1_PROOF_PLANNED = YES
GOLDEN_JOURNEY_REGRESSION_PLANNED = YES
PROOF_EXECUTED = NO
FOUNDER_UAT = NOT_STARTED
QUALITY_TEST_PLAN_FINALIZED = NO
DESIGN_READINESS = PASS
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
INDEPENDENT_QUALITY_TEST_PLAN_REVIEW = NOT_PERFORMED
```
