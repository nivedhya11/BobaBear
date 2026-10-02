<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "DESIGN_READINESS",
  "capability": "IMP-036K",
  "candidateId": "IMP-036K-DESIGN-CANDIDATE-1",
  "productDefinition": "PD-IMP-036K-DRAFT-1",
  "experienceDefinition": "XD-IMP-036K-DRAFT-1",
  "architecture": "ARCH-R23",
  "architectureSource": "IMP-036K-FIT-CANDIDATE-1",
  "designReadiness": "READY_FOR_GATE",
  "qualityTestPlanFinalized": "NO",
  "measurementInstrumentationPlanFinalized": "NO",
  "implementationPlan": "NOT_PERFORMED",
  "implementationAuthorized": false,
  "implementationStarted": false
}
-->

# IMP-036K — Design Readiness Candidate 1

```text
CANDIDATE_ID = IMP-036K-DESIGN-CANDIDATE-1
STATUS = CANDIDATE
AUTHORITY = DESIGN_READINESS
CAPABILITY = IMP-036K
DESIGN_READINESS = READY_FOR_GATE
DESIGN_READINESS_GATE = NOT_PERFORMED
QUALITY_TEST_PLAN = NOT_PERFORMED
MEASUREMENT_INSTRUMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
FOUNDER_UAT = NOT_PERFORMED
IMP036K_ACCEPTED = NO

PRODUCT_DEFINITION = PD-IMP-036K-DRAFT-1
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_DEFINITION = XD-IMP-036K-DRAFT-1
EXPERIENCE_GATE = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
ARCHITECTURE_SOURCE = IMP-036K-FIT-CANDIDATE-1
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
ARCHITECTURE_FIT_REVIEW = 5391917727
ARCH_R23 = UNCHANGED
DR_24 = UNCHANGED
NEW_ADR = NO

SOURCE_MAIN = 75fd6a31a228da807e8e55e24728fd26307e0744
SOURCE_TREE = fa1d24b81d04114cc4b13f8c7419aca110fa2db2
SOURCE_ROADMAP = GTM-R181
SOURCE_STATE = STATE-R179
SOURCE_ARCHITECTURE = ARCH-R23
SOURCE_DECISION_REGISTER = DR-24
acceptedThrough = IMP-036I
currentProductSlice = IMP-036J
nextProductSlice = IMP-036K
SHARED_GOVERNANCE_MUTATED = NO
```

This candidate converts the approved Product and Experience definitions plus the locked capability
architecture into implementation-ready presentation and interaction decisions. It does not reopen
Product semantics, Architecture Fit, money authority, Cart authority, permissions, experiment
activation, or implementation authorization.

The source storefront does not have a distinct Product Detail route. Discovery nevertheless owns
`PRODUCT_DETAIL` as a V1 placement and explicitly keeps `MENU_DISCOVERY` out of V1. Therefore this
candidate maps Product Detail to an explicit product-detail context inside the existing `/order`
experience. It must not render recommendation groups on every menu row and must not turn ordinary
menu browsing into recommendation ranking.

---

## 1. Source inspection

Inspected against source main `75fd6a31a228da807e8e55e24728fd26307e0744`.

| Surface / concern | Existing source | Design consequence |
|---|---|---|
| Menu / ordering shell | `src/components/ordering/OrderingCatalogClient.tsx` | Reuse the ordering shell, selected fulfilment/outlet context, existing item actions, desktop cart rail and mobile sticky cart bar. |
| Product summary | `src/components/ordering/MenuItemRow.tsx` | Reuse its product name, image, display price and Add/Customize action language. Do not show recommendations in ordinary browse rows. |
| Customization | `src/components/ordering/MenuItemCustomizationDialog.tsx` | Extend the existing customization dialog; do not create a second recommendation modal. |
| Cart | `src/components/ordering/CartClient.tsx` | Add one in-flow secondary recommendation group while keeping desktop and mobile checkout entry unobstructed. |
| Workforce commercial workspace | `/workforce/admin/commercial` and `CommercialWorkspaceClient` | Add recommendation relationship administration as a Menu-adjacent commercial section using existing brand context, form, status, denial and focus patterns. |
| Workforce authorization | locked architecture | `menu.read` reads; `menu.manage` defines/activates/disables at server-derived brand scope. No new role or permission. |
| Customer mutation | existing Cart/customization flows | Direct add reuses ordinary Cart add. Configuration-required items enter existing customization. |
| Failure / stale recovery | existing commerce recovery | Reuse it. Recommendation generation failure is silent fail-open. |

### Current source fact: Product Detail mapping

The customer route tree currently exposes `/order`, `/order/cart`, `/order/checkout`,
`/order/payment`, `/order/confirmation`, and `/order/orders`; there is no dedicated product-detail
route. This is not permission to collapse `PRODUCT_DETAIL` into `MENU_DISCOVERY`.

Design mapping for V1:

```text
PRODUCT_DETAIL_CONTEXT = explicit selected-product state within /order
DEEPLINK = /order?product=<productId>
MENU_BROWSE_RECOMMENDATIONS = NO
PRODUCT_DETAIL_RECOMMENDATIONS = YES, when the explicit product context is active
NEW_RECOMMENDATION_MODAL = NO
```

The query parameter is presentation/navigation state only. It does not become Catalog, Menu,
eligibility, Cart, attribution, or recommendation authority. An unknown, stale, or ineligible
product id returns to ordinary menu browsing without a recommendation-specific blocking error.

---

## 2. Design principles fixed for implementation

1. **Primary commerce first.** Product, configuration, cart and checkout actions remain visually
   and keyboard-order primary.
2. **One recommendation group per eligible surface.** Never stack recommendation carousels or
   strategy groups.
3. **Maximums are ceilings.** Product Detail 3, Customization 3 total, Cart 4. Do not pad.
4. **Explicit intent only.** A recommendation never changes Cart, variant or modifiers merely by
   rendering.
5. **Existing commerce interaction wins.** Direct add, customization, stale refusal, removal and
   announcements reuse existing behaviour.
6. **Fail open.** Loading/failure/holdout/no-result never blocks Product, Cart, Checkout or Payment
   and never creates a recommendation error panel.
7. **No trust theatre.** No false Popular, personalization, scarcity, savings, urgency, margin or
   priority copy.
8. **No Menu Discovery drift.** Recommendations appear only after explicit Product Detail entry,
   inside Customization, or on a non-empty Cart.

---

## 3. Customer component map

### 3.1 Shared recommendation group

Create one reusable presentation component, conceptually `RecommendationGroup`, with these design
responsibilities only:

- semantic region labelled by its visible placement heading;
- optional neutral supporting copy `You might also like` only when useful and truthful;
- 0..N recommendation items within the placement ceiling;
- each item shows existing product identity, existing display-price presentation when available,
  optional evidence-backed `Popular`, and exactly one primary recommendation action;
- action is existing Add language for `DIRECT_ADD` or existing Customize/Choose language for
  `REQUIRES_CONFIGURATION`;
- no exposed rank, strategy enum, relationship kind, commercial priority, margin, suppression,
  holdout or set id;
- no empty shell if there are zero candidates.

The item visual should extend/reuse the compact product-summary language of `MenuItemRow` rather
than inventing a promotional card system. Recommendation items are visually quieter than the
surface's primary product/cart content.

### 3.2 Product Detail

**Entry.** Activating the product name/image/detail affordance from `MenuItemRow`, or opening
`/order?product=<productId>`, enters explicit Product Detail context. Existing Add/Customize
buttons remain direct commerce actions and must not require entering detail first.

**Layout.** Product Detail renders in the main ordering content column, not as a modal. It replaces
the browse list in that column while active and preserves the existing ordering shell/cart rail.
A clear `Back to menu` action appears before the product summary.

Order on screen:

1. Back to menu.
2. Current product summary: image, name, description when present, existing display price.
3. Existing Add or Customize action.
4. Recommendation group headed **“Goes great with this”**, up to 3 items.
5. Remaining ordinary ordering-shell navigation.

On narrow viewports the same order is single-column. On wide viewports the existing desktop cart
rail remains available; recommendation content does not displace or outrank the product action.

**Navigation/focus.** Opening Product Detail moves focus to the Product Detail heading. Back to menu
returns focus to the originating product affordance when that origin still exists; a direct link
returns focus to the menu heading after Back. Browser Back restores prior ordering state where
possible. Recommendation rendering never steals focus.

### 3.3 Customization

Extend the existing `MenuItemCustomizationDialog`; do not open another modal.

Inside the dialog's scrollable content, after the current product/variant summary and existing
required/optional choices but before the final add/update action area, render one group headed
**“Make it yours”** when candidates exist:

- at most 1 variant upgrade;
- at most 2 add-ons;
- at most 3 total;
- only choices already belonging to the current product's existing variant/modifier authority.

A variant-upgrade action changes the same dialog's current variant through the existing variant
selection path. An add-on action changes the corresponding existing modifier choice. Positive-price
modifiers remain unselected until that explicit action. The recommendation item does not create a
second cart line when the choice is actually a modifier of the current product.

Focus remains inside the existing dialog's focus model. Activating a recommendation moves focus to
or leaves it on the affected existing control, using that control's ordinary selected state and
announcement. Closing the dialog restores focus according to the existing dialog behaviour.

### 3.4 Cart

Render one recommendation group in the Cart's main content column only when the cart has at least
one line. Place it after cart lines and current cart/serviceability recovery content and before the
customer leaves the main column. Heading: **“Complete your order”**. Maximum 4 items.

The desktop checkout summary remains in its existing sticky right column. The mobile sticky
checkout action remains visible/reachable and is never covered by recommendation UI. Do not put the
recommendation group inside the checkout summary and do not require interaction with it before
Checkout.

After a successful direct add, use the existing Cart success/announcement path and keep focus on
the activated action unless existing Cart behaviour intentionally moves it. If adding requires
configuration, enter the existing customization dialog and return to the originating Cart
recommendation action when that dialog is cancelled.

If a stale candidate is refused, use existing commerce recovery, omit the stale item on refresh,
and preserve all valid cart lines and Checkout access.

Removing a recommendation-added cart line is ordinary removal. Suppression affects later
recommendation sets only; the menu item is not visually marked deleted or unavailable merely
because it was suppressed.

---

## 4. Responsive geometry

No horizontal recommendation carousel is required for V1. Prefer wrapping grid/list geometry so
keyboard order and screen-reader order equal visual order.

| Context | Geometry |
|---|---|
| Narrow customer viewport | One column; recommendation cards stack; minimum existing interactive target sizing applies; sticky cart/checkout controls remain unobstructed. |
| Medium Product Detail / Cart | Two recommendation columns when content width permits without shrinking action targets or price/name readability. |
| Wide Product Detail / Cart | Up to three columns on Product Detail; up to four compact columns or a two-by-two grid on Cart depending on available main-column width. Never move Cart recommendations into the checkout rail. |
| Customization dialog | One column inside the existing dialog. Do not create a horizontal scroller inside the modal. |
| Workforce narrow viewport | Follow existing commercial-workspace policy; if authoring is already restricted by viewport, recommendations inherit that restriction rather than inventing a separate mobile editor. |

Layout must tolerate 1..ceiling items without empty placeholders.

---

## 5. Loading, empty, holdout, failure and recovery states

| State | Exact design treatment |
|---|---|
| Loading | Primary surface renders immediately. Recommendation region reserves no mandatory blocking skeleton. A subtle non-focusable placeholder is permitted only if it does not cause primary-layout instability; absence is preferred. |
| No eligible candidates | Render no recommendation group and no explanatory sentence. |
| Holdout | Render no recommendation group and no holdout message. |
| Generation / ranking / transport failure | Render no recommendation group; no retry CTA, alert or blocking error. |
| Successful direct add | Existing Cart add confirmation/announcement only. |
| Requires configuration | Existing customization interaction. |
| Stale at add time | Existing calm commerce refusal/recovery; recommendation refresh omits candidate. |
| Relationship disabled | Future sets no longer include it; current cart lines remain ordinary lines. |
| Removed recommendation-added line | Existing Cart removal; later recommendation set suppresses exact candidate identity for that cart/session. |
| Unknown Product Detail deep link | Return/fall back to normal `/order` menu experience; do not show an empty recommendation error page. |

No recommendation-specific toast, modal, countdown, tombstone or error page is introduced.

---

## 6. Accessibility and focus map

### Semantics

- Recommendation group: `<section>`/region with visible heading used as accessible name.
- Recommendation list: semantic list when multiple items are present.
- Item: product name and existing price text are readable before its action in DOM order.
- `Popular` is text, not color-only meaning.
- Internal strategy/priority/margin/holdout data is not exposed in accessible names.
- Optionality is conveyed by placement and supporting text; no action is required to continue.

### Keyboard order

Product Detail:

```text
Back to menu
→ product primary action
→ recommendation item 1 action
→ item 2 action
→ item 3 action
→ following page controls
```

Customization:

```text
existing dialog controls
→ existing required/optional choices
→ Make it yours recommendation actions
→ existing final add/update action
```

Cart:

```text
cart line controls / recovery controls
→ Complete your order recommendation actions
→ existing following controls
```

The sticky checkout action remains reachable independently through normal document order and does
not require traversing or activating recommendations.

### Focus rules

- Async recommendation arrival never steals focus.
- Successful ordinary add follows existing Cart focus/announcement semantics.
- Rejected add focuses the existing recovery target if current commerce already does so.
- Opening configuration uses existing dialog focus trap and restoration.
- Product Detail Back restores origin focus when possible.
- Removing a recommendation-added cart line follows ordinary Cart removal focus; suppression is
  not separately announced.

---

## 7. Content lock

Customer-visible placement headings are exact:

```text
PRODUCT_DETAIL = Goes great with this
CUSTOMIZATION = Make it yours
CART = Complete your order
NEUTRAL_SUPPORT = You might also like
EVIDENCE_BACKED_ITEM_LABEL = Popular
```

Direct add, Customize/Choose, stale refusal, removal and Cart success reuse existing commerce
language. No customer-facing words may expose `COMPLEMENTS`, `UPSELLS_TO`, `PAIR_WITH`, `ADD_ON`,
`ALTERNATIVE`, commercial priority, margin, holdout, set correlation, internal rank or experiment
assignment.

---

## 8. Workforce relationship administration

Entry stays in `/workforce/admin/commercial`. Extend the existing **Menu** commercial area with a
Recommendations subsection/panel rather than create a separate application.

Read access follows `menu.read`; authoring controls require `menu.manage` for the selected
server-authorized brand. Existing commercial context selection and permission-denied patterns are
reused.

### Relationship list

For the selected brand, show existing relationships with:

- source: Product or Menu section/category;
- target: Product or Menu section/category;
- relationship kind;
- placements: Product Detail and/or Cart only;
- relative priority;
- effective period when set;
- Active / Disabled status;
- Edit action when authorized.

Do not offer Customization as a relationship placement. Do not offer variant or modifier as a
relationship source/target.

### Create/edit form

Use the existing commercial form/panel visual language. Field order:

1. Source type: Product | Category.
2. Source selector.
3. Target type: Product | Category.
4. Target selector.
5. Relationship kind.
6. Placements: Product Detail, Cart (at least one).
7. Relative priority.
8. Optional effective start/end.
9. Active/Disabled status according to existing status-control pattern.
10. Save.

Reference choices are scoped to the already selected brand. Cross-brand ids are not presented as
valid choices and server authorization remains authoritative. The form does not show customer copy
or pretend priority is money.

Conflict from compare-and-swap uses existing administration conflict/reload treatment; do not
silently overwrite a newer relationship revision.

---

## 9. Perceived performance

- Recommendation reads are optional and independent of primary-commerce rendering.
- Product Detail, Customization and Cart become interactive without waiting for recommendations.
- The UI must not flash an error module when an optional read fails.
- Rendering an arrived set should not move the primary Add/Customize or Checkout action enough to
  cause accidental activation; place the module after primary actions and preserve stable spacing.
- Popular computation latency never blocks the set; if the evidence indicator is unavailable or
  unproven, omit `Popular` rather than delay the primary experience.

No client-side ranking animation, progressive strategy reveal, autoplay carousel or countdown.

---

## 10. Implementation component boundaries

Expected implementation touchpoints, not implementation authorization:

```text
src/components/ordering/OrderingCatalogClient.tsx
  - explicit Product Detail navigation/state inside /order
  - recommendation read orchestration scoped to active placement

src/components/ordering/MenuItemRow.tsx
  - detail affordance / deep-link origin only
  - ordinary Add/Customize semantics preserved
  - NO browse-row recommendation group

src/components/ordering/<new reusable recommendation presentation>
  - RecommendationGroup / RecommendationItem presentation only

src/components/ordering/MenuItemCustomizationDialog.tsx
  - in-dialog Make it yours placement

src/components/ordering/CartClient.tsx
  - in-flow Complete your order placement

src/components/administration/commercial/CommercialWorkspaceClient.tsx
  - Menu-adjacent Recommendations entry/section wiring

src/components/administration/commercial/<relationship editor/list>
  - existing enterprise form/list/status patterns
```

Server/API/storage work remains governed by the locked architecture and later Implementation Plan.
This Design Readiness document does not choose database table names, API payload encoding,
measurement schema, holdout algorithm, event vendor, retry policy or ranking numeric weights.

---

## 11. Design acceptance matrix

| Requirement | Design proof |
|---|---|
| Product Detail secondary, max 3 | Explicit `/order?product=<id>` detail context; group after primary product action; menu browse has no group. |
| Customization max 1 variant + 2 add-ons, max 3 | One in-dialog group using existing controls/authority. |
| Cart max 4, non-empty only | One in-flow group; empty state unchanged; Checkout unobstructed. |
| Explicit customer intent | One Add or Customize/Choose action; no render-time mutation. |
| Paid extras not preselected | Existing customization selected-state authority preserved. |
| Fail-open | No blocking recommendation loading/error state. |
| Stale candidate | Existing commerce refusal and recovery. |
| Suppression | No customer tombstone; menu remains normal. |
| Popular truth | Item label only when evidence-backed; otherwise absent. |
| Holdout silence | No module, no special copy. |
| Accessible optionality | Labelled secondary region; keyboard-accessible actions; no focus theft. |
| Workforce scope | Existing commercial workspace; menu.read/menu.manage; brand-scoped. |
| Relationship model | Product/category source and target; Product Detail/Cart placements only. |
| No Product/Architecture drift | No new money, promotion, catalog, cart, role, permission, service or ML authority. |

---

## 12. Evidence required before Design Readiness PASS

The gate review must verify this candidate against the exact branch head and current canonical
main and confirm:

1. Product, Experience and locked Architecture semantics are unchanged.
2. Product Detail mapping does not leak recommendations into `MENU_DISCOVERY`.
3. Existing Add/Customize/Cart/Checkout priority and focus behaviour remain protected.
4. No new modal/toast/countdown pattern was introduced by the design.
5. Workforce form maps only to product/category relationships and Product Detail/Cart placements.
6. Exact headings and forbidden-claim rules are preserved.
7. Responsive and accessibility maps are implementation-ready.
8. Quality/Test Plan, Measurement Plan and Implementation Plan remain unperformed.
9. Implementation remains unauthorized and unstarted.
10. IMP-036J lifecycle state is not changed by this candidate.

```text
MATERIAL_OPEN_DESIGN_QUESTIONS = NONE
AUTHORITY_AMBIGUITY = NONE
DRAFT_READY_FOR_DESIGN_READINESS_GATE = YES
SHARED_GOVERNANCE_PERSISTENCE = NOT_PERFORMED
```

Passing Design Readiness will not itself authorize implementation. The Quality/Test Plan,
Measurement/Instrumentation Plan and Implementation Plan remain separate required lifecycle work.
