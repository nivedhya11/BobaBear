<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "NONE",
  "capability": "IMP-036K",
  "candidateId": "IMP-036K-QUALITY-CANDIDATE-1",
  "designCandidate": "IMP-036K-DESIGN-CANDIDATE-1",
  "measurementCandidate": "IMP-036K-MEASUREMENT-CANDIDATE-1",
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
CANDIDATE_ID = IMP-036K-QUALITY-CANDIDATE-1
STATUS = CANDIDATE
AUTHORITY = NONE
CAPABILITY = IMP-036K
POLICY = TEST-1
QUALITY_TEST_PLAN_FINALIZED = NO
PROOF_EXECUTED = NO
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
DESIGN_READINESS = PASS
DESIGN_CANDIDATE = IMP-036K-DESIGN-CANDIDATE-1
MEASUREMENT_CANDIDATE = IMP-036K-MEASUREMENT-CANDIDATE-1
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
EXPERIENCE_DEFINITION = XD-IMP-036K-DRAFT-1
ARCH_R23 = UNCHANGED
DR_24 = UNCHANGED
D-383 = CURRENT
D-384 = NO
ARCH-R24 = NO
NEW_ADR = NO
NEW_ARCH_G = NO
```

This is planned proof for `PD-IMP-036K-DRAFT-1`, `XD-IMP-036K-DRAFT-1`, locked
`IMP-036K-FIT-CANDIDATE-1`, `IMP-036K-DESIGN-CANDIDATE-1`, and
`IMP-036K-MEASUREMENT-CANDIDATE-1`. It is not executed evidence. Passing this plan later does
not accept IMP-036K. This candidate does not self-declare finalization.

Architecture Fit remains the occurrence-boundary authority for issuance, presentation, and
assistance. The Measurement candidate owns concrete encoding. This Quality candidate proves that
contract under TEST-1. It does not replace TEST-1 and does not add a layer outside TEST-1.

Evidence for every row is `NOT_EXECUTED`. Later implementation evidence is a named test or
browser check on an implementation candidate, with command, result, and provenance. No row below
is that evidence.

```text
PROOF_EXECUTED = NO
COVERAGE_PERCENTAGE_IS_ACCEPTANCE = NO
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
```

## 1. How to read a row

| Column | Meaning |
|---|---|
| Story / AC / XR | Product or experience identifier. Semantics are unchanged |
| Risk | Why this proof exists |
| Layers | TEST-1 layers that apply. A layer omitted here is `N/A` for that row because a listed layer already covers the observable result, or the row says why |
| Planned check | What a later implementation run must show |
| Real dependency | What cannot be replaced if the claim needs it |
| Substitute | Allowed controlled stand-in |
| Negative evidence | The denial, absence, or non-effect that must also be shown |

Layers used only when they prove something the story actually risks: unit, component,
domain/use-case, integration, database integration, HTTP/API contract, authorization/security,
concurrency, recovery/idempotency, accessibility, real browser/E2E, Golden Journey regression,
Founder UAT later.

## 2. Mandatory acceptance scenarios

`MANDATORY_AC_COUNT = 62`. Every AC marked mandatory YES in `PD-IMP-036K-DRAFT-1` appears below.
`AC-036K-013-01` is directional and not a live-activation acceptance outcome; it is covered in
section 3 as measurement-readiness proof, not as a mandatory Product AC pass.

| Story | AC | Risk | Layers | Planned check | Real dependency | Substitute | Negative evidence |
|---|---|---|---|---|---|---|---|
| `US-036K-001` | `AC-036K-001-01` | Complements exceed ceiling or invent placement | Domain, HTTP, component, browser | Product Detail set length ≤ 3 when ≥1 eligible complement exists; placement is Product Detail; heading matches Design Readiness | Recommendation read + exact product+variant detail context | Fixture relationships and eligible complements | A 4th complement is absent. Menu Discovery recommendation module is absent |
| `US-036K-001` | `AC-036K-001-02` | Padding to three | Domain, component, browser | With 0, 1, or 2 eligible complements, set size equals that count; primary product remains usable | Eligibility filter | Fixture with fewer than 3 eligibles | Ineligible or weak filler is absent |
| `US-036K-001` | `AC-036K-001-03` | Ignore mutates cart/product | Domain, HTTP, browser | Continue configure/add current product without recommendation action; cart gains only that product path | Existing product add path | None for the ignore path | No recommendation candidate appears as a cart unit |
| `US-036K-001` | `AC-036K-001-04` | Fake commercial claim | Component, browser, content | Visible copy does not claim co-purchase, personalization, trend, savings, priority, or margin | Experience/Design copy contract | Content fixture | Forbidden claim words are absent |
| `US-036K-002` | `AC-036K-002-01` | Customization ceiling breach | Domain, component, browser | Total ≤ 3; ≤1 variant upgrade; ≤2 modifier/add-on recommendations; fewer including zero valid | Customization authority read | Fixture variants/modifiers | A second variant upgrade or third add-on is absent |
| `US-036K-002` | `AC-036K-002-02` | Variant upgrade becomes second product or silent change | Domain, component, browser | Before choice, current variant unchanged; after Choose, same-dialog transition to same product's target variant; not a second product | Existing customization dialog | Fixture larger-size/patty variant | Unrelated second product and nested recommendation modal are absent |
| `US-036K-002` | `AC-036K-002-03` | Paid add-on preselected | Domain, component, browser | Positive-price recommended modifier starts unselected; action updates existing control; cart changes only after Add/Save | Existing modifier graph | Fixture paid option | Silent paid selection before action is absent |
| `US-036K-002` | `AC-036K-002-04` | Invalid option offered | Domain, component | Incompatible/unavailable/out-of-configuration options are absent from the set | Customization validity | Fixture invalid option | That option id is absent from the payload and UI |
| `US-036K-002` | `AC-036K-002-05` | Recommendation invents paid default | Domain, component | Existing zero-price defaults remain under customization authority; recommendation does not newly preselect a positive-price modifier | Existing default rules | Fixture default group | New positive-price preselection is absent |
| `US-036K-002` | `AC-036K-002-06` | Relationship-admin used for Customization | Domain, HTTP, component | Candidates are only current-product variants/modifiers; operator product/category relationships are not the Customization source | Customization authority; relationship store | Active Product Detail relationship fixture that must not appear in Customization | Relationship-only target absent from Customization set. No new variant/modifier identity |
| `US-036K-003` | `AC-036K-003-01` | Cart ceiling breach | Domain, HTTP, component, browser | Non-empty cart set length ≤ 4 when eligible suggestions exist | Cart recommendation read | Fixture gap candidates | A 5th candidate is absent |
| `US-036K-003` | `AC-036K-003-02` | Empty-cart module | Domain, component, browser | Empty cart renders no Revenue Recommendations module; existing empty-cart experience remains | Empty cart fixture | None | Recommendation heading and items are absent |
| `US-036K-003` | `AC-036K-003-03` | Beverage gap | Domain, integration | Main+side, no beverage category → eligible beverage may appear and still passes hard eligibility | Current menu-section/category authority | Fixture sections and beverage | Ineligible beverage is absent |
| `US-036K-003` | `AC-036K-003-04` | Food gap from beverage-only | Domain, integration | Beverage-only cart may suggest eligible food | Same category authority | Fixture food | Ineligible food is absent |
| `US-036K-003` | `AC-036K-003-05` | Side gap | Domain, integration | Main without complementary side may suggest eligible side | Same | Fixture side | Present-side category is not re-suggested as missing |
| `US-036K-003` | `AC-036K-003-06` | Present category treated missing | Domain | Category already in cart is not suggested as absent | Cart category presence | Fixture with that category present | That category's gap candidate is absent |
| `US-036K-003` | `AC-036K-003-07` | Group-quantity inference | Domain, component | Several mains and any drink quantity do not produce diner-count, group-size, too-few-drinks, balancing, or per-person beverage inference | Ranking/gap rules | Multi-main fixture | Those inferred suggestions and copy are absent |
| `US-036K-003` | `AC-036K-003-08` | Checkout blocked by suggestions | Component, browser | With visible cart recommendations, Checkout remains available without recommendation action; no candidate added | Existing Checkout entry | None | Checkout control is not gated on accepting a suggestion |
| `US-036K-004` | `AC-036K-004-01` | Illegal direct add | Domain, HTTP, browser | Direct-add candidate uses `POST /api/v1/cart/lines`; configuration-required candidate is not direct-added | Existing `addCartLine` | Fixture complete vs incomplete config | Required-choice item never becomes a silent cart line |
| `US-036K-004` | `AC-036K-004-02` | Skipped configuration | Domain, component, browser | Configuration-required action opens/reuses existing customization; required choices not silently filled; cart changes only after accept | Existing customization dialog | Fixture required group | Shortened form that skips required choices is absent |
| `US-036K-004` | `AC-036K-004-03` | Silent mutation | Domain, HTTP, browser | Viewing recommendations on Product Detail, Customization, or Cart without action leaves cart, variants, and paid modifiers unchanged | Surfaces without action | None | No silent add/variant change/paid preselection |
| `US-036K-004` | `AC-036K-004-04` | Stale display treated as reservation | Domain, HTTP, recovery | At recommendation action, server revalidates catalog lifecycle, assortment, selected Outlet, availability, fulfilment, required configuration, relationship active/effective period, and suppression; display does not reserve | Add-time revalidation in locked architecture | Make candidate ineligible after issue | Rejected add creates no recommendation-origin unit |
| `US-036K-004` | `AC-036K-004-05` | Silent ALTERNATIVE swap | Domain, HTTP | ALTERNATIVE relationship never replaces a cart line without explicit customer choice; `ALTERNATIVE != SILENT_SWAP` | Relationship kind fixture | Active ALTERNATIVE relationship | Silent line replacement is absent |
| `US-036K-005` | `AC-036K-005-01` | Rank before eligibility | Domain | Inactive, unavailable, out-of-assortment, wrong-outlet, fulfilment-incompatible, unpriced, configuration-incompatible, expired/disabled-relationship candidates are removed before ranking | Eligibility pipeline | Mixed eligible/ineligible fixtures | Ineligible ids absent from ranked set even with higher priority |
| `US-036K-005` | `AC-036K-005-02` | Second money/promotion authority | Domain, HTTP | Recommended price/assortment/availability/outlet/fulfilment come from existing commerce; no discount/promotion/offer/coupon/campaign is created | Existing authorities | Fixture priced item | New promotion/discount artifact is absent |
| `US-036K-005` | `AC-036K-005-03` | Stale context after outlet/fulfilment change | Domain, integration, browser | After outlet or Delivery/Pickup/Scheduled context change, next set contains only new-context purchasable candidates; existing cart lines follow ordinary cart/checkout revalidation | Serviceability and fulfilment context | Fixture context switch | Old-context-only candidate is absent from the next set |
| `US-036K-005` | `AC-036K-005-04` | Client invents purchasability | HTTP, authorization, security | Client-supplied candidate id/eligibility flag is ignored; server eligibility stands | Recommendation read and add | Forged client body | Forged candidate is not purchasable and writes no mark |
| `US-036K-005` | `AC-036K-005-05` | Duplicate padding | Domain | Exact same item already in cart without filling an absent category is not inserted to pad the ceiling; Menu/Product manual add still allowed when commerce allows | Cart presence + gap rules | Duplicate fixture | Padded duplicate recommendation is absent |
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
| `US-036K-009` | `AC-036K-009-01` | Collapsed measurement meanings | Domain, integration, measurement | Prove distinct durable meanings for `SET_ISSUED`, `SET_RENDER`, `ITEM_IMPRESSION`, `RECOMMENDATION_ACTION`, `ADD_ATTEMPT`, `SUCCESSFUL_ADD`, `REMOVAL`, `ASSISTED_PURCHASE` per Measurement candidate | Measurement encoding | Fixture journey | Render counted as add, or attempt counted as success, is absent |
| `US-036K-009` | `AC-036K-009-02` | Weak assistance chain | Domain, integration, database | Assisted purchase only when validated presentation + recommendation action + accepted recommendation add + exact marked identity survives + purchased Order from Checkout Snapshot; Cancelled Order excluded | Section 7.12 chain + Measurement candidate | Full proof fixture and negative fixtures | Issuance-only, impression-only, rejected-add click, manual add, removed/recreated, replaced identity, Cancelled Order, and missing presentation/correlation are unmarked |
| `US-036K-009` | `AC-036K-009-03` | Quantity/config wrongly drops mark | Domain | Quantity change and unrelated valid configuration change preserve attribution only while exact marked identity remains — independently for concrete product, category→concrete product, exact variant, exact modifier | Unit provenance | Four identity fixtures | Mark remains after identity no longer remains |
| `US-036K-009` | `AC-036K-009-04` | Recreation/replacement keeps old mark | Domain, database | Product replacement drops attribution; remove then manual recreation does not restore it; manually existing/coalesced units do not inherit; only units created through proven recommendation action are marked | Coalesce + provenance rules | Replacement and coalesce fixtures | Inherited/restored mark is absent |
| `US-036K-009` | `AC-036K-009-05` | Second recommendation add reuses old lineage | Domain | Later recommendation add that survives to Order starts a new assisted lineage | New action correlation | Second recommendation add | Old lineage id reused as the only lineage is absent |
| `US-036K-009` | `AC-036K-009-06` | View-through assistance | Domain, measurement | Saw recommendation, added by another path → not assisted | Ordinary add after impression | Impression-only fixture | Assisted purchase from view-through is absent |
| `US-036K-010` | `AC-036K-010-01` | Non-deterministic / ML rank | Domain | Same eligible inputs/relationships/priorities/evidence/context → same order; no ML/vector/LLM dependency | Ranking function | Deterministic fixtures | External ML call and non-repeatable order are absent |
| `US-036K-010` | `AC-036K-010-02` | Priority promotes ineligible | Domain | Relationship priority may reorder eligible candidates only; ineligible with higher priority stays absent; when contribution authority unavailable it does not reorder and no money formula is invented | Eligibility-before-rank + no contribution field | High-priority ineligible fixture | Ineligible winner and invented contribution formula are absent |
| `US-036K-010` | `AC-036K-010-03` | Exact weight promised | Component, content | Operator/customer communication does not promise exact numeric ranking weights as product behaviour | Copy contract | Admin UI + customer UI | Exact weight promise string is absent |
| `US-036K-010` | `AC-036K-010-04` | Internal rationale leaked | Component, HTTP, content | Customer payload/UI omit priority, contribution, margin, and equivalent internal rationale | Customer-safe response contract | Ranked set with priority differences | Those fields/strings are absent from customer surfaces |
| `US-036K-011` | `AC-036K-011-01` | Popular population wrong | Domain, database | Popular uses trailing 30 days, selected Outlet, successful direct Orders only, statuses `PLACED`/`ACCEPTED`/`FULFILLED`, `CANCELLED` excluded, ≥30 distinct Orders, current relevant menu section/category, purchased-unit count (`line_origin=cart`), top 3 eligible, complimentary_offer excluded | Orders + checkout snapshots/lines | Seeded order history | Aggregator store, complimentary units, Cancelled, and non-top-3 Popular are absent |
| `US-036K-011` | `AC-036K-011-02` | Insufficient evidence still claims Popular | Domain, component | <30 qualifying Orders, or evidence read/evaluation failure → no Popular; eligible recommendations may still show without that claim | Popular read | 29-order fixture and fault injection | Popular label present under insufficient/failed evidence is absent |
| `US-036K-011` | `AC-036K-011-03` | Popular blocks launch | Integration, browser | With no Popular evidence, Product/Customization/Cart recommendations and ordering still function | Fail-open Popular | Empty evidence | Ordering blocked solely by missing Popular is absent |
| `US-036K-011` | `AC-036K-011-04` | False Popular | Domain, component, content | Outside top 3 or unmet threshold → no Popular treatment; no trend/co-purchase/personalization claim | Evidence rule | Rank 4 fixture | False Popular and those claims are absent |
| `US-036K-012` | `AC-036K-012-01` | Wrong relationship model | Domain, HTTP, authorization | Authorized operator sets source `PRODUCT\|CATEGORY`, target `PRODUCT\|CATEGORY`, kinds, placements `PRODUCT_DETAIL\|CART`, relative priority, optional effective period; Customization placement not supported; no variant/modifier target | `menu.manage` + relationship schema | Workforce fixture | `CUSTOMIZATION` placement and variant/modifier targets are rejected/absent |
| `US-036K-012` | `AC-036K-012-02` | Disable ignored for new sets | Domain, HTTP | Activate may publish when eligible; disable or outside effective period stops new sets from using it | Relationship revision | Active then disabled fixture | Disabled/expired relationship still published in new sets is absent |
| `US-036K-012` | `AC-036K-012-03` | Disable wipes cart | Domain, HTTP | Disable leaves already-added recommendation-origin cart units until ordinary cart/checkout rules change them | Existing cart lines | Line added then disable | Automatic line deletion on disable is absent |
| `US-036K-012` | `AC-036K-012-04` | Unauthorized write | Authorization, HTTP | Actor without brand `menu.manage` is denied for define/activate/disable; nothing written; caller-supplied role/scope cannot authorize; no recommendation-specific role/permission | Workforce session + server-derived brand scope | Missing-permission fixture | Successful write and new permission/role are absent |
| `US-036K-012` | `AC-036K-012-05` | Cross-brand / outlet promotion | Authorization, HTTP | Cross-brand denied; `outlet_manager` is not silently promoted to brand authority; other scope unchanged | Server-loaded brand scope | Two-brand and outlet_manager fixtures | Cross-brand mutation and outlet→brand promotion are absent |
| `US-036K-012` | `AC-036K-012-06` | Relationship bypasses eligibility | Domain, HTTP | Active high-priority ineligible target is not shown as purchasable | Eligibility after relationship match | High-priority ineligible target | Ineligible target returned as purchasable is absent |
| `US-036K-013` | `AC-036K-013-02` | Holdout changes commerce | Domain, HTTP, browser | With activated fixture assignment = holdout, recommendation presentation suppressed; catalog/price/promotions/fulfilment/Cart/Checkout/Payment/entitlements unchanged | Measurement holdout design (inactive by default; fixture-activated) | Holdout-assigned session fixture | Commerce divergence beyond presentation is absent |
| `US-036K-013` | `AC-036K-013-03` | Holdout alters entitlements/prices | Domain, integration | Holdout order path matches commerce that would exist without recommendation change | Same commerce authorities | Paired holdout vs treatment fixtures for non-recommendation facts | Price/promotion/entitlement deltas caused by holdout are absent |
| `US-036K-013` | `AC-036K-013-04` | Treatment never sees recommendations | Domain, browser | Non-holdout session may receive recommendations under V1 rules when eligible | Treatment arm fixture | Eligible candidates | Permanent global suppression in treatment is absent |
| `US-036K-013` | `AC-036K-013-05` | Unknown assignment blocks commerce | Domain, recovery, browser | Unknown/missing assignment suppresses recommendation module and leaves commerce fail-open | Assignment read failure / missing row | Fault injection | Checkout/Payment blocked by unknown assignment is absent |

`QUALITY_PLAN_COVERS_ALL_MANDATORY_AC = YES`.

## 3. Directional holdout readiness (`AC-036K-013-01`)

`AC-036K-013-01` is not a live-activation Product acceptance outcome. Quality still proves the
selected Measurement design is testable without activating production holdout.

| Check | Layers | Planned check | Negative evidence |
|---|---|---|---|
| Assignment before exposure | Domain, concurrency, HTTP | When a fixture activates holdout, assignment exists before any recommendation-capable Product Detail/Customization/Cart read that could expose a module | Exposure-before-assignment sequence is absent |
| Stable unit | Database, HTTP | Assignment is stable for `SERVER_OWNED_ACTIVE_ORDERING_SESSION`; later Cart in same journey reuses it | Flip after Cart creation is absent |
| Unknown assignment | Domain, browser | Suppresses recommendations; commerce available; no holdout label | Holdout explanation copy is absent |
| Browser not authority | Security, HTTP | Browser/profile cannot choose or forge arm | Client-supplied arm ignored; no write |
| Concurrent first requests | Concurrency, database | Race settles to one stable authoritative assignment | Two arms for one session are absent |
| Inactive default | Domain | Default configuration writes no experiment assignment solely for experimentation | Production activation by this candidate is absent |

`HOLDOUT_ACTIVATED_IN_THIS_CANDIDATE = NO`.

## 4. Experience requirements

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
| `XR-IMP-036K-015` | Trust-breaking claims | Content, browser | No priority/margin/co-purchase/personalization/trend/savings/fake scarcity claims; approved headings only | Forbidden claim words are absent |
| `XR-IMP-036K-016` | Holdout explanation | Browser, content | Holdout fixture shows no module, no holdout label, no explanatory message; catalog/prices/checkout look ordinary | Holdout explanation copy is absent |

`QUALITY_PLAN_COVERS_ALL_XR = YES`.

Content QA for Design Readiness finalized strings and forbidden words is a component or browser
assertion. `CONTENT_QA_PLANNED = YES`.

## 5. Exact identity / unit continuity matrix

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

`EXACT_IDENTITY_PROOF_PLANNED = YES`.

## 6. Presentation observation proof

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
| Browser echoes server correlation only | HTTP, security | Observation carries issued correlation; cannot invent set, membership, rank, placement, eligibility, or holdout | Invented membership accepted |
| Server validates observation | Domain, HTTP | Invalid observation writes nothing | Unvalidated client event becomes occurrence |
| Ordinary React rerender/remount | Component, measurement | No duplicate presentation occurrence | Remount doubles count |
| Retry/replay of same observation | Recovery, measurement | No double authoritative occurrence | Second row for same occurrence identity |
| Observation/reporting failure | Recovery, browser | Commerce remains usable; attribution fails closed | Checkout failed because measurement failed |

`PRESENTATION_OBSERVATION_PROOF_PLANNED = YES`.

## 7. Assisted purchase and action meanings

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

## 8. Popular evidence boundary proof

| Boundary | Planned check |
|---|---|
| Exact 30-day window | Order at window edge included/excluded by locked trailing-30-day rule |
| Exact 30-order threshold | 29 → no Popular; 30 → Popular allowed for top 3 only |
| Deterministic ties/order | Equal purchased-unit ties resolve deterministically; no non-deterministic Popular set |
| Status filter | `PLACED`/`ACCEPTED`/`FULFILLED` counted; `CANCELLED` excluded |
| Line origin | `line_origin=cart` counted; `complimentary_offer` excluded |
| Outlet | Selected Outlet only |
| Category | Current relevant menu section/category membership |
| Failure | Evidence read/evaluation failure → no Popular |
| Launch independence | Missing Popular does not block recommendations/ordering |

`POPULAR_EVIDENCE_PROOF_PLANNED = YES`.

## 9. CR2 risk proof

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
| No Pricing/Promotion/Campaign/Limited Drop authority created | Domain, HTTP | Recommendation admin mutates those authorities |
| No payment secrets / address / name / full profile in recommendation telemetry | Security, measurement | Sensitive fields stored |
| No customer-visible priority/margin | HTTP, content | Fields present on customer payload |
| No client-owned eligibility, set identity, or membership | Security, HTTP | Client fields accepted as authority |
| No cross-customer cart or suppression leakage | Database, security | Foreign cart suppression applied |
| Replayed stale recommendation cannot bypass current eligibility | Security, recovery | Stale action creates units |
| Instrumentation endpoint rejects unsupported sensitive/client-authoritative fields | HTTP, security | Unsupported fields write rows |

`CR2_SECURITY_ABUSE_REVIEW_PLANNED = YES`.

### Persistence

Database integration on real PostgreSQL, not an in-memory double, for later implementation of:

- relationship rows and compare-and-swap revision
- cart suppression keyed by cart + exact candidate identity
- issued-set correlation and presentation occurrences
- cart-unit assistance marks and snapshot provenance copy
- ordering-session holdout assignment rows when fixture-activated
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

`CONCURRENCY_PROOF_PLANNED = YES`.

### Recovery and idempotency

| Case | Required result |
|---|---|
| Recommendation read timeout/error | No module; no issued set; commerce continues |
| Observation POST failure | Commerce continues; no presentation occurrence; attribution fails closed |
| Stale recommendation add | Rejected; prior lines remain; existing recovery |
| Lost HTTP response on recommendation add | Retry safe under existing cart revision/idempotency; no double recommendation-origin units |
| Relationship disable after add | Existing cart units remain; future sets omit |
| Measurement write failure after commerce accept | Cart commit remains; assistance not claimed |

`RECOVERY_PROOF_PLANNED = YES`.

## 10. Measurement contract proof

This Quality candidate proves `IMP-036K-MEASUREMENT-CANDIDATE-1` without redefining Product
acceptance:

- event meanings concretely distinguishable
- holdout inactive by default; future 10/90 design testable
- assignment unit = server-owned active ordering session before exposure
- AOV grounded in `checkout_snapshots.grand_total_paise` through Order lineage
- attach grounded in exact assisted identity, not impression/action-only
- contribution formula not invented
- commerce fail-open; attribution fail-closed
- no analytics vendor; server write authority

`MEASUREMENT_PROOF_PLANNED = YES`.

## 11. Golden Journeys / regression

Preserve existing ordering, customization, Cart, Checkout, Payment, Order, Promotions/Coupons/Offers,
Scheduled Fulfilment, Pickup/Delivery, customer auth, and workforce authorization.

| Journey | Required regression |
|---|---|
| `GJ-FIRST-ORDER` | Discover-to-pay still completes with recommendations present, absent, failed, or held out |
| `GJ-AVAILABILITY` | Availability truth and recovery still govern purchasability; recommendations cannot bypass it |
| `GJ-PRODUCT-MENU-LAUNCH` | Menu/product launch path remains usable; no Menu Discovery recommendation leakage |
| `GJ-PAYMENT-RECOVERY` | Remains reachable when recommendations fail |

Recommendations must be removable from the runtime path without breaking the primary purchase
journey. Checkout and Payment handlers do not call the recommendation read.

`GOLDEN_JOURNEY_REGRESSION_PLANNED = YES`.

## 12. Founder UAT

```text
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
FOUNDER_EXPERIENCE_UAT = NOT_PERFORMED
```

Reason: X3 customer-visible recommendation surfaces and workforce relationship administration.
Functional UAT and Experience UAT are both later. This candidate does not deploy a candidate and
does not record a verdict. Only the Founder supplies that verdict.

## 13. N/A layers

| Layer | When it is N/A |
|---|---|
| Unit | A row whose risk is only a cross-module or browser result. Pure deterministic ranking predicates are not N/A |
| Component | A row with no rendered UI, such as Popular SQL threshold alone |
| Database | A copy-only component row with no durable state |
| Concurrency | A row with no race in the locked architecture |
| Golden Journey | Operator-only rows still need browser proof of the editor; they are not customer Golden Journeys |
| Founder UAT | Not a per-AC execution in this plan. Remains required for the capability later |

## 14. Quality exit criteria

```text
ALL_MANDATORY_AC_MAPPED = YES
ALL_APPLICABLE_XR_MAPPED = YES
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

## 15. Coverage flags

```text
QUALITY_PLAN_COVERS_ALL_MANDATORY_AC = YES
QUALITY_PLAN_COVERS_ALL_XR = YES
EXACT_IDENTITY_PROOF_PLANNED = YES
PRESENTATION_OBSERVATION_PROOF_PLANNED = YES
ASSISTED_PURCHASE_PROOF_PLANNED = YES
POPULAR_EVIDENCE_PROOF_PLANNED = YES
MEASUREMENT_PROOF_PLANNED = YES
CR2_SECURITY_ABUSE_REVIEW_PLANNED = YES
CONCURRENCY_PROOF_PLANNED = YES
DATABASE_PROOF_PLANNED = YES
RECOVERY_PROOF_PLANNED = YES
REAL_BROWSER_PROOF_PLANNED = YES
ACCESSIBILITY_PROOF_PLANNED = YES
RESPONSIVE_PROOF_PLANNED = YES
CONTENT_QA_PLANNED = YES
GOLDEN_JOURNEY_REGRESSION_PLANNED = YES
PROOF_EXECUTED = NO
FOUNDER_UAT = NOT_STARTED
QUALITY_TEST_PLAN_FINALIZED = NO
DESIGN_READINESS = PASS
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
```
