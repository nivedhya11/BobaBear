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

Architect review `5394618739` STOPPED the first text of this same candidate at head
`815ad8e711aa09c012aed8e65f59af788c21869e`. That STOP is preserved. The candidate identity
remains `IMP-036K-DESIGN-CANDIDATE-1`; no Candidate 2 is created. This revision corrects the two
same-semantics findings: it no longer assumes an existing variant-switch path in customization,
and it no longer assumes the existing dialog already implements focus containment/restoration.

---

## 1. Source inspection

Inspected against source main `75fd6a31a228da807e8e55e24728fd26307e0744`.

| Surface / concern | Existing source | Design consequence |
|---|---|---|
| Menu / ordering shell | `src/components/ordering/OrderingCatalogClient.tsx` | Reuse the ordering shell, selected fulfilment/outlet context, existing item actions, desktop cart rail and mobile sticky cart bar. |
| Product summary | `src/components/ordering/MenuItemRow.tsx` | Reuse its product name, image, display price and Add/Customize action language. Do not show recommendations in ordinary browse rows. |
| Customization | `src/components/ordering/MenuItemCustomizationDialog.tsx` | Extend the existing dialog. It currently binds one `CustomerMenuItem`/variant and exposes modifier controls; it does **not** expose a variant switcher and does **not** implement a complete focus trap/restoration mechanism. Design Readiness specifies both behaviours explicitly below. |
| Cart | `src/components/ordering/CartClient.tsx` | Add one in-flow secondary recommendation group while keeping desktop and mobile checkout entry unobstructed. |
| Workforce commercial workspace | `/workforce/admin/commercial` and `CommercialWorkspaceClient` | Add recommendation relationship administration as a Menu-adjacent commercial subsection using existing brand context, form, status, denial and focus patterns. |
| Workforce authorization | locked architecture | `menu.read` reads; `menu.manage` defines/activates/disables at server-derived brand scope. No new role or permission. |
| Customer mutation | existing Cart/customization flows | Direct add reuses ordinary Cart add. Configuration-required items enter the existing customization interaction. |
| Failure / stale recovery | existing commerce recovery | Reuse it. Recommendation generation failure is silent fail-open. |

### Product Detail mapping

The customer route tree currently exposes `/order`, `/order/cart`, `/order/checkout`,
`/order/payment`, `/order/confirmation`, and `/order/orders`; there is no dedicated product-detail
route. Discovery nevertheless owns `PRODUCT_DETAIL` as a V1 placement and explicitly leaves
`MENU_DISCOVERY` for later. Therefore Product Detail is an explicit selected-product context inside
the existing `/order` experience rather than a recommendation feed in browse rows.

```text
PRODUCT_DETAIL_CONTEXT = explicit selected-product state within /order
DEEPLINK = /order?product=<productId>
MENU_BROWSE_RECOMMENDATIONS = NO
PRODUCT_DETAIL_RECOMMENDATIONS = YES, only while explicit product context is active
NEW_RECOMMENDATION_MODAL = NO
```

The query parameter is navigation/presentation state only. It is not Catalog, Menu, eligibility,
Cart, attribution or recommendation authority. Unknown, stale or ineligible product ids fall back
to ordinary `/order` browsing without a recommendation-specific blocking error.

---

## 2. Fixed design principles

1. **Primary commerce first.** Product, configuration, cart and checkout actions remain visually
   and operationally primary.
2. **One recommendation group per eligible surface.** No stacked strategy groups.
3. **Maximums are ceilings.** Product Detail 3; Customization 3 total with max 1 variant upgrade and
   max 2 add-ons; Cart 4. Never pad.
4. **Explicit intent only.** Rendering never changes Cart, variant or modifiers.
5. **Existing commerce authority wins.** Direct add, customization, stale refusal, removal and
   payable truth remain existing commerce responsibilities.
6. **Fail open.** Loading/failure/holdout/no-result never blocks Product, Cart, Checkout or Payment.
7. **No false claims.** No fake Popular, personalization, scarcity, savings, urgency, margin or
   commercial-priority copy.
8. **No Menu Discovery drift.** Recommendation presentation starts only after explicit Product
   Detail entry, inside Customization, or on non-empty Cart.

---

## 3. Shared recommendation presentation

Create one reusable presentation component, conceptually `RecommendationGroup`, responsible only
for presentation and customer actions:

- semantic section/region labelled by its visible placement heading;
- optional neutral supporting text `You might also like` only when useful and truthful;
- 0..N items within the placement ceiling;
- each item shows existing product identity, existing display-price presentation when available,
  optional evidence-backed `Popular`, and one recommendation action;
- action uses existing Add language for `DIRECT_ADD` or existing Customize/Choose language when
  configuration is required;
- no rank, strategy enum, relationship kind, priority, margin, suppression reason, holdout status,
  issued-set id or experiment assignment is customer-visible;
- zero candidates means no rendered group or empty shell.

Visual language extends the compact product-summary/menu-item pattern rather than creating a new
promotional-card system. Recommendation items stay visually quieter than the surface's primary
commerce content.

---

## 4. Product Detail design

### Entry

Activating the product name/image/detail affordance from `MenuItemRow`, or opening
`/order?product=<productId>`, enters Product Detail. Existing Add/Customize actions remain direct
commerce actions and do not require opening detail first.

### Layout

Product Detail renders in the main ordering content column, not a modal. While active it replaces
the browse list in that column and preserves the existing ordering shell and desktop cart rail.

DOM/visual order:

1. `Back to menu`.
2. Current product summary: image, name, description when present, existing display price.
3. Existing Add or Customize action.
4. Recommendation group headed **“Goes great with this”**, max 3.
5. Remaining ordinary ordering-shell navigation.

Narrow viewports use the same order in one column. Wide viewports keep the existing cart rail.
Recommendation content never displaces or outranks the current product action.

### Navigation and focus

Opening Product Detail moves focus to the Product Detail heading after the context is committed.
Async recommendation arrival never steals focus. `Back to menu` restores focus to the originating
product-detail affordance when that origin is still present; a direct deep link returns focus to
the menu heading after Back. Browser Back should restore the prior ordering state where possible.

---

## 5. Customization design

Reuse and extend `MenuItemCustomizationDialog`; do not create a nested or second modal.

### Placement

When candidates exist, render one **“Make it yours”** group after the current item summary and
before the ordinary modifier fieldsets. This location makes the optional variant decision visible
before the customer invests effort in variant-specific modifier choices while keeping the existing
final Add/Save action as the purchase-intent boundary.

The group contains:

- at most 1 variant upgrade;
- at most 2 add-ons;
- at most 3 total;
- only variants/modifier options already owned by the current product's locked existing authority.

### Variant upgrade interaction — explicit new design over existing authority

The source dialog has no existing variant-selection UI. V1 therefore uses this exact interaction:

1. The recommendation item names the target effective variant and shows its existing display price
   or truthful price delta presentation available from the customer-safe response.
2. Activating its existing Choose/Customize-style action is the customer's explicit variant
   choice. It does **not** add the item to Cart.
3. The same dialog instance transitions to the target variant; no nested dialog opens.
4. The title/current-item summary and base price update immediately to the target variant.
5. Modifier groups are rebuilt from the target variant's current authoritative modifier graph.
6. Previous-variant modifier selections are **not silently carried across and not silently dropped**:
   - exact selections whose modifier-group option identity is valid in the target variant may be
     retained at their existing quantity, subject to target min/max constraints;
   - selections that do not exist or are invalid in the target variant are surfaced in the dialog's
     existing `Needs attention` recovery treatment and must be explicitly removed/resolved before
     final Add/Save can succeed;
   - target-variant zero-price standard defaults may initialize only under the existing default
     rules; positive-price options are never selected merely because the variant changed.
7. The final Add/Save button remains the only point that commits the configured item to Cart.

This is an explicit variant change, not recommendation render-time mutation and not a second Cart
path.

### Add-on recommendation interaction

Activating a recommended modifier add-on uses the same dialog state and the exact existing modifier
option control. The action changes only that option under its existing quantity/min/max rules, then
moves focus to that control so its selected state is perceivable. Positive-price add-ons remain
unselected until this explicit action.

### Dialog focus and keyboard behaviour — required implementation

The existing source has modal semantics but not a complete focus-management implementation.
IMP-036K requires the dialog implementation to provide:

- **initial focus:** on open, focus the dialog heading or first meaningful interactive control;
- **containment:** Tab and Shift+Tab cycle within the open dialog; background page controls are not
  keyboard-reachable while `aria-modal=true`;
- **Escape / Close:** Escape invokes the same close semantics as the Close button when the dialog is
  not in a pending mutation state; while pending, existing disabled-close protection wins;
- **restoration:** closing/cancelling restores focus to the exact action that opened the dialog —
  either the ordinary Menu/Cart Customize action or the originating recommendation action;
- **variant transition:** switching variant within the same dialog does not drop focus to the page;
  focus moves to the refreshed dialog title/current-variant summary, then ordinary Tab order
  continues through the new controls;
- **async set arrival:** recommendation arrival never steals focus.

---

## 6. Cart design

Render one recommendation group in the Cart's main content column only when at least one cart line
exists. Place it after cart lines and current cart/serviceability recovery content. Heading:
**“Complete your order”**. Maximum 4 items.

The desktop checkout summary remains in the existing sticky right column. The mobile sticky
checkout action remains visible and reachable. Recommendations do not enter the checkout summary
and never require interaction before Checkout.

A successful direct add uses the existing Cart confirmation/announcement path. A configuration-
required action opens the same customization dialog described above and restores focus to the
originating Cart recommendation action if cancelled.

Stale add refusal uses existing commerce recovery, refresh omits the stale candidate, and all other
valid lines plus Checkout remain intact. Removing a recommendation-added line is ordinary Cart
removal. Suppression changes later recommendation sets only; it does not visually delete the menu
item.

---

## 7. Responsive geometry

No horizontal recommendation carousel is required in V1; wrapping grid/list geometry keeps visual,
keyboard and screen-reader order aligned.

| Context | Geometry |
|---|---|
| Narrow customer viewport | One column; cards stack; existing minimum interactive target sizing applies; sticky cart/checkout controls remain unobstructed. |
| Medium Product Detail / Cart | Two columns when width permits without harming names, price or action targets. |
| Wide Product Detail | Up to three recommendation columns. |
| Wide Cart | Up to four compact columns only if the main column can support them; otherwise two-by-two. Never use the checkout rail. |
| Customization dialog | One column inside the existing dialog; no nested horizontal scroller. |
| Workforce narrow viewport | Inherit the existing commercial-workspace authoring policy rather than create a separate mobile editor. |

Layouts must handle 1..ceiling items without placeholders.

---

## 8. Loading, empty, holdout and recovery matrix

| State | Design treatment |
|---|---|
| Loading | Primary surface renders and is interactive immediately. A non-focusable placeholder is optional only if it avoids layout instability; absence is preferred. |
| No eligible candidates | No group, no apology, no padded cards. |
| Holdout | No group, no holdout message. |
| Generation/ranking/transport failure | No group, no retry CTA, no recommendation alert/error panel. |
| Successful direct add | Existing Cart success/announcement only. |
| Requires configuration | Existing customization dialog, with focus requirements from §5. |
| Stale at add time | Existing calm refusal/recovery; next set omits candidate. |
| Relationship disabled | Future sets omit it; existing cart lines stay ordinary lines. |
| Removed recommendation-added line | Existing removal; later set suppresses exact candidate identity. |
| Unknown Product Detail deep link | Fall back to normal `/order` menu experience, not an empty recommendation error page. |

No recommendation-specific toast, nested modal, countdown, tombstone or blocking error page.

---

## 9. Accessibility and focus map

### Semantics

- Recommendation group is a `<section>`/region whose accessible name comes from its visible heading.
- Multiple recommendation items use semantic list structure.
- Product name and existing price precede the item action in DOM order.
- `Popular` is text, never color-only meaning.
- Strategy/priority/margin/holdout/set ids never enter customer accessible names.
- Optionality is clear; no recommendation action is required to continue.

### Keyboard sequence

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
dialog Close / current-item context
→ Make it yours actions when present
→ existing modifier controls
→ final Add/Save action
```

Cart:

```text
cart line/recovery controls
→ Complete your order actions
→ following Cart controls
```

The sticky Checkout action remains independently reachable through the existing page order and is
not conditioned on traversing or activating recommendations.

### Focus rules

- Async recommendation render never moves focus.
- Direct add follows existing Cart announcement/focus behaviour.
- Stale rejection uses the existing recovery target.
- Customization uses the explicit modal focus behaviour in §5.
- Product Detail Back restores origin when possible.
- Cart removal follows ordinary Cart focus; suppression is not separately announced.

---

## 10. Content lock

```text
PRODUCT_DETAIL = Goes great with this
CUSTOMIZATION = Make it yours
CART = Complete your order
NEUTRAL_SUPPORT = You might also like
EVIDENCE_BACKED_ITEM_LABEL = Popular
```

Add, Customize/Choose, stale refusal, removal and Cart success reuse existing commerce language.
Customer UI must not expose `COMPLEMENTS`, `UPSELLS_TO`, `PAIR_WITH`, `ADD_ON`, `ALTERNATIVE`,
commercial priority, margin, holdout, set correlation, rank or experiment assignment.

---

## 11. Workforce relationship administration

Entry stays in `/workforce/admin/commercial`. Extend the existing **Menu** commercial area with a
Recommendations subsection/panel rather than create a separate application.

Read access follows `menu.read`; authoring controls require `menu.manage` for the selected
server-authorized brand. Existing commercial brand context, form, status, denial and focus patterns
are reused.

### Relationship list

For the selected brand show:

- source: Product or Menu section/category;
- target: Product or Menu section/category;
- relationship kind;
- placements: Product Detail and/or Cart only;
- relative priority;
- optional effective period;
- Active/Disabled status;
- Edit action when authorized.

Customization is not an operator-relationship placement. Variant/modifier ids are not relationship
source/target options.

### Create/edit form order

1. Source type: Product | Category.
2. Source selector.
3. Target type: Product | Category.
4. Target selector.
5. Relationship kind.
6. Placements: Product Detail, Cart; at least one.
7. Relative priority.
8. Optional effective start/end.
9. Active/Disabled status using existing status-control language.
10. Save.

Choices are scoped to the selected brand. Cross-brand ids are not presented as valid choices and
server authorization remains authoritative. Priority is not money and is not customer copy.
Compare-and-swap conflict reuses administration reload/conflict treatment; never silently overwrite
a newer relationship revision.

---

## 12. Perceived performance

- Recommendation reads are optional and independent of primary-commerce rendering.
- Product Detail, Customization and Cart become interactive without waiting for recommendation data.
- Optional-read failure does not flash a blocking error module.
- Arrival must not move primary Add/Customize/Checkout controls enough to cause accidental input;
  placement after primary actions and stable in-flow layout are required.
- If `Popular` evidence is unavailable/unproven, omit the label rather than delay the set.
- No client ranking animation, autoplay carousel, progressive strategy reveal or countdown.

---

## 13. Implementation component boundaries

Expected touchpoints, not implementation authorization:

```text
src/components/ordering/OrderingCatalogClient.tsx
  - explicit Product Detail navigation/state inside /order
  - recommendation read orchestration by active placement

src/components/ordering/MenuItemRow.tsx
  - product-detail affordance / deep-link origin only
  - ordinary Add/Customize preserved
  - NO browse-row recommendation group

src/components/ordering/<reusable recommendation presentation>
  - RecommendationGroup / RecommendationItem presentation

src/components/ordering/MenuItemCustomizationDialog.tsx
  - Make it yours placement
  - explicit same-dialog variant transition
  - required modal focus containment / Escape / restoration

src/components/ordering/CartClient.tsx
  - in-flow Complete your order placement

src/components/administration/commercial/CommercialWorkspaceClient.tsx
  - Menu-adjacent Recommendations subsection wiring

src/components/administration/commercial/<relationship editor/list>
  - existing enterprise form/list/status patterns
```

Server/API/storage work stays governed by the locked architecture and later Implementation Plan.
This Design Readiness does not choose table names, API encoding, measurement schema, holdout
algorithm, analytics vendor, retry policy or numeric ranking weights.

---

## 14. Design acceptance matrix

| Requirement | Design proof |
|---|---|
| Product Detail secondary, max 3 | Explicit `/order?product=<id>` context; group after product primary action; no Menu browse group. |
| Customization max 1 variant + 2 add-ons, max 3 | One group in existing dialog; explicit same-dialog variant switch; existing modifier authority. |
| No silent variant/modifier change | Variant action is explicit; target graph reinitializes visibly; incompatible prior selections require recovery; positive-price defaults remain off. |
| Dialog accessibility | Initial focus, Tab containment, Escape/Close rule, exact focus restoration and transition focus are explicit requirements rather than assumed current behaviour. |
| Cart max 4, non-empty only | One in-flow group; empty state unchanged; Checkout unobstructed. |
| Explicit customer intent | Render never mutates; Add/Choose actions are explicit. |
| Fail-open | No blocking recommendation loading/error state. |
| Stale candidate | Existing refusal/recovery. |
| Suppression | No menu tombstone. |
| Popular truth | Label only when evidence-backed. |
| Holdout silence | No module/no special copy. |
| Workforce scope | Existing commercial workspace; `menu.read`/`menu.manage`; brand scoped. |
| Relationship model | Product/category source+target; Product Detail/Cart placements only. |
| No authority drift | No new money, promotion, catalog, Cart, role, permission, service or ML authority. |

---

## 15. Evidence required before Design Readiness PASS

The gate review must verify the exact candidate head against current canonical main and confirm:

1. Product, Experience and locked Architecture semantics are unchanged.
2. Product Detail mapping does not leak recommendations into `MENU_DISCOVERY`.
3. Variant upgrade no longer assumes a nonexistent existing selector and cannot silently carry/drop
   invalid prior configuration.
4. Modal focus containment/restoration is a required design behaviour, not a false source claim.
5. Existing Add/Customize/Cart/Checkout priority stays protected.
6. No new nested modal/toast/countdown pattern is introduced.
7. Workforce UI maps only to product/category relationships and Product Detail/Cart placements.
8. Exact headings and forbidden-claim rules are preserved.
9. Responsive/accessibility maps are implementation-ready.
10. Quality/Test Plan, Measurement Plan and Implementation Plan remain unperformed.
11. Implementation remains unauthorized/unstarted.
12. IMP-036J lifecycle state is untouched.

```text
PRIOR_ARCHITECT_REVIEW = 5394618739
PRIOR_ARCHITECT_VERDICT = STOP
PRIOR_REVIEWED_HEAD = 815ad8e711aa09c012aed8e65f59af788c21869e
PRIOR_FINDINGS_PRESERVED = YES
MATERIAL_OPEN_DESIGN_QUESTIONS = NONE
AUTHORITY_AMBIGUITY = NONE
DRAFT_READY_FOR_DESIGN_READINESS_GATE = YES
SHARED_GOVERNANCE_PERSISTENCE = NOT_PERFORMED
```

Passing Design Readiness will not authorize implementation. Quality/Test Planning,
Measurement/Instrumentation Planning and Implementation Planning remain separate required lifecycle
work.
