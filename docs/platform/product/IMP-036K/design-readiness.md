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

This candidate turns the approved Product/Experience definitions and locked Architecture Fit into
implementation-ready presentation decisions. It does not reopen Product semantics, architecture,
money authority, Cart authority, authorization, holdout activation, or implementation authority.

Architect review `5394618739` STOPPED the first text of this same candidate at head
`815ad8e711aa09c012aed8e65f59af788c21869e`. That STOP remains historical evidence. Candidate
identity remains `IMP-036K-DESIGN-CANDIDATE-1`; no Candidate 2 is created. The corrected text no
longer assumes an existing variant-switch path or an existing complete modal focus trap/restoration.

---

## 1. Source inspection and exact surface mapping

Inspected against source main `75fd6a31a228da807e8e55e24728fd26307e0744`.

| Concern | Existing source | Design decision |
|---|---|---|
| Ordering shell | `src/components/ordering/OrderingCatalogClient.tsx` | Reuse selected outlet/fulfilment context, desktop cart rail and mobile sticky-cart behaviour. |
| Menu item | `src/components/ordering/MenuItemRow.tsx` | Reuse product/image/price/Add/Customize language; never render recommendation groups in ordinary menu browse rows. |
| Customer menu identity | `CustomerMenuItem = { productId, variantId, ... }` | Product Detail navigation binds to **both** product and current variant. Product-only navigation is ambiguous and is not the V1 detail identity. |
| Customization | `src/components/ordering/MenuItemCustomizationDialog.tsx` | Extend the existing dialog. It currently binds one `CustomerMenuItem`/variant, has modifier controls, no variant-switch UI, and no complete focus containment/restoration implementation. |
| Cart | `src/components/ordering/CartClient.tsx` | Add one in-flow secondary group without obstructing Checkout. |
| Workforce | `/workforce/admin/commercial`, `CommercialWorkspaceClient` | Extend the existing Menu commercial area with recommendation relationship administration. |
| Authorization | locked architecture | `menu.read` reads and `menu.manage` writes at server-derived brand scope. No new role/permission. |

The route tree has `/order`, Cart, Checkout, Payment, Confirmation and Orders, but no distinct
Product Detail route. Discovery nevertheless owns `PRODUCT_DETAIL` as V1 and leaves
`MENU_DISCOVERY` for later. V1 therefore uses an explicit selected-product+variant context inside
`/order`, not recommendation cards on every menu row.

```text
PRODUCT_DETAIL_CONTEXT = exact current CustomerMenuItem identity
DEEPLINK = /order?product=<productId>&variant=<variantId>
PRODUCT_ONLY_DEEPLINK = NOT_SUFFICIENT_FOR_V1_DETAIL_IDENTITY
MENU_BROWSE_RECOMMENDATIONS = NO
PRODUCT_DETAIL_RECOMMENDATIONS = YES only in explicit detail context
NEW_RECOMMENDATION_MODAL = NO
```

The query values are navigation/presentation state only. The server/customer-menu projection still
validates product/variant existence, brand/outlet context and eligibility. Missing, mismatched,
stale or ineligible product+variant context falls back to ordinary `/order` browsing with no
recommendation-specific blocking error.

---

## 2. Fixed design principles

1. Primary Product/Customization/Cart/Checkout actions remain visually and operationally first.
2. One recommendation group maximum per eligible surface; no stacked strategy sections.
3. Placement caps are ceilings: Product Detail 3; Customization max 1 variant upgrade + 2 add-ons,
   max 3 total; Cart 4. Never pad.
4. Render never mutates Cart, variant or modifiers.
5. Existing commerce owns direct add, configuration validation, stale refusal, removal and payable
   truth.
6. Recommendation loading/failure/holdout/no-result fails open and never gates commerce.
7. No false Popular, personalization, scarcity, savings, urgency, margin or priority copy.
8. Ordinary Menu Discovery remains recommendation-free.

---

## 3. Shared recommendation presentation

Create/reuse one compact `RecommendationGroup`/item presentation pattern:

- semantic section/region named by the visible placement heading;
- optional neutral supporting copy `You might also like` only when truthful/useful;
- 0..N items up to the placement ceiling;
- item shows existing product identity, existing display-price presentation when available,
  optional evidence-backed `Popular`, and one action;
- action uses existing Add language for `DIRECT_ADD`, or existing Customize/Choose language when
  configuration is required;
- no customer-visible rank, strategy enum, relationship kind, priority, margin, suppression reason,
  holdout status, issued-set id or experiment assignment;
- zero candidates means no empty recommendation shell.

Visual language extends the compact menu/product-summary pattern rather than introducing a new
promotional-card system. The group is visually secondary to primary commerce content.

---

## 4. Product Detail

### Entry and URL

Activating a product name/image/detail affordance from a specific `MenuItemRow` enters detail using
that row's exact `productId + variantId` and synchronizes the URL to
`/order?product=<productId>&variant=<variantId>`. Existing Add/Customize buttons remain direct
commerce actions and do not require opening detail first.

### Layout

Product Detail is in the main ordering content column, not a modal. While active it replaces the
browse list in that column while preserving the ordering shell and desktop cart rail.

DOM/visual order:

1. `Back to menu`.
2. Current product/variant summary: image, name, description when present, existing display price.
3. Existing Add or Customize action.
4. **“Goes great with this”** group, max 3.
5. Remaining ordinary ordering-shell controls.

Narrow viewports use one column. Wide viewports retain the cart rail. The recommendation group does
not displace or outrank the product action.

### Focus/navigation

Entering detail focuses the detail heading after context commits. Async recommendations never steal
focus. Back restores the originating row detail affordance when present; direct-link Back returns to
menu and focuses the menu heading. Browser Back should restore prior ordering state where possible.

---

## 5. Customization

Reuse and extend `MenuItemCustomizationDialog`; never open a nested recommendation modal.

### Placement

When candidates exist, render one **“Make it yours”** group after the current item summary and
before ordinary modifier fieldsets. This lets the customer make an optional variant decision before
investing effort in variant-specific modifiers while the final Add/Save remains the purchase-intent
boundary.

The group contains max 1 variant upgrade and max 2 add-ons, max 3 total, from the current product's
existing variant/modifier authority only.

### Variant upgrade — explicit V1 interaction

There is no existing source variant selector. The V1 design is therefore explicit:

1. The recommendation names the target effective variant and shows its existing customer-safe
   display-price treatment.
2. Activating Choose/Customize is the customer's explicit variant choice; it does **not** add to Cart.
3. The **same dialog** transitions to the target `CustomerMenuItem`/variant; no nested modal.
4. Title/current-item summary and base price update to that target variant.
5. Modifier groups rebuild from the target variant's authoritative modifier graph.
6. Prior selections are neither silently carried nor silently discarded:
   - exact modifier-option identities valid on the target variant may be retained at their previous
     quantity only if target min/max rules allow it;
   - prior selections absent/invalid on the target are surfaced through the dialog's existing
     `Needs attention` recovery pattern and must be explicitly resolved before final Add/Save;
   - target zero-price defaults may initialize only under existing default rules;
   - positive-price options never become selected merely because the variant changed.
7. Final Add/Save remains the only action that commits the configured item to Cart.

### Add-on recommendation

Activating a modifier recommendation updates the exact existing modifier-option control under its
current quantity/min/max rules and moves focus to that control so the new selected state is
perceivable. A positive-price option remains off until this explicit action.

### Required dialog focus behaviour

The existing source has modal semantics but not complete focus management. Implementation must add:

- initial focus on the dialog heading or first meaningful interactive control;
- Tab/Shift+Tab containment inside the open modal;
- Escape invoking the same close semantics as Close when no mutation is pending; pending state
  keeps close disabled/ignored;
- focus restoration to the **exact** opening action, whether ordinary Customize or a recommendation
  Customize/Choose action;
- same-dialog variant transition keeps focus in the dialog and moves it to the refreshed current-
  variant heading/summary before normal tab order continues;
- async recommendation arrival never steals focus.

---

## 6. Cart

Render one **“Complete your order”** group in the Cart main content column only when at least one
cart line exists. Place it after cart lines and current cart/serviceability recovery content.
Maximum 4.

Desktop Checkout summary remains in the sticky right rail. Mobile sticky Checkout remains visible
and reachable. The group never enters the Checkout summary and never requires interaction before
Checkout.

Direct add reuses existing Cart confirmation/announcement. Configuration-required action opens the
same customization dialog and restores focus to its originating Cart recommendation if cancelled.
Stale add uses existing calm refusal; refresh omits the candidate; other valid lines and Checkout
remain intact. Recommendation-added-line removal is ordinary Cart removal. Suppression affects
later recommendation sets only and never makes the menu item look deleted.

---

## 7. Responsive geometry

No horizontal recommendation carousel is required in V1.

| Context | Geometry |
|---|---|
| Narrow customer viewport | One column; cards stack; existing minimum target sizing applies; sticky cart/checkout controls stay unobstructed. |
| Medium Product Detail / Cart | Two columns if names, price and action targets remain readable. |
| Wide Product Detail | Up to three columns. |
| Wide Cart | Up to four compact columns only if the main column supports them; otherwise two-by-two. Never use Checkout rail. |
| Customization dialog | One column; no nested horizontal scroller. |
| Workforce narrow viewport | Inherit existing commercial-workspace authoring restrictions rather than invent a separate mobile editor. |

Layouts handle 1..ceiling items without empty placeholders.

---

## 8. State/recovery matrix

| State | Treatment |
|---|---|
| Loading | Primary surface interactive immediately; no blocking skeleton. Non-focusable placeholder optional only to prevent layout shift. |
| No candidates | No group, no apology, no padding. |
| Holdout | No group and no holdout message. |
| Generation/ranking/transport failure | No group, retry CTA or recommendation alert. |
| Direct-add success | Existing Cart success/announcement. |
| Needs configuration | Existing customization dialog plus focus rules in §5. |
| Stale at add | Existing refusal/recovery; later set omits candidate. |
| Relationship disabled | Future sets omit it; existing cart lines remain. |
| Recommendation-added line removed | Existing Cart removal; later set suppresses exact candidate identity. |
| Invalid Product Detail product+variant URL | Fall back to ordinary `/order`; no recommendation error page. |

No recommendation-specific toast, nested modal, countdown, tombstone or blocking error page.

---

## 9. Accessibility / keyboard map

### Semantics

- Group is a semantic section/region named by its visible heading.
- Multiple items use semantic list structure.
- Product name and price precede its action in DOM order.
- `Popular` is textual, not color-only.
- Internal strategy/priority/margin/holdout/set ids do not appear in accessible names.
- Optionality remains clear; no suggestion must be activated to continue.

### Keyboard order

Product Detail:

```text
Back to menu → product primary action → recommendation actions → following page controls
```

Customization:

```text
Close/current item → Make it yours actions → modifier controls → final Add/Save
```

Cart:

```text
cart line/recovery controls → Complete your order actions → following Cart controls
```

Sticky Checkout remains independently reachable in ordinary page order. Async recommendation
render never moves focus. Cart removal uses ordinary Cart focus; suppression is not announced as
menu deletion.

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
Customer UI never exposes `COMPLEMENTS`, `UPSELLS_TO`, `PAIR_WITH`, `ADD_ON`, `ALTERNATIVE`,
commercial priority, margin, holdout, set correlation, internal rank or experiment assignment.

---

## 11. Workforce relationship administration

Entry remains `/workforce/admin/commercial`. Extend the existing **Menu** commercial area with a
Recommendations subsection/panel; do not create a separate application.

Read requires `menu.read`; authoring controls require `menu.manage` for the server-authorized
selected brand. Reuse existing commercial brand context, form, status, conflict, denial and focus
patterns.

Relationship list shows source (Product or Menu section/category), target (Product or category),
relationship kind, Product Detail/Cart placements, relative priority, optional effective period,
Active/Disabled status and Edit when authorized.

Create/edit field order:

1. Source type: Product | Category.
2. Source selector.
3. Target type: Product | Category.
4. Target selector.
5. Relationship kind.
6. Placements: Product Detail and/or Cart; at least one.
7. Relative priority.
8. Optional effective start/end.
9. Active/Disabled status using existing status language.
10. Save.

Customization is not a relationship placement. Variant/modifier ids are not source/target types.
Choices are scoped to the selected brand; cross-brand ids are not presented as valid options and
server authorization remains authoritative. Compare-and-swap conflict reuses existing
administration reload/conflict treatment; never silently overwrite a newer relationship revision.

---

## 12. Perceived performance

- Optional recommendation reads are independent of primary-commerce rendering.
- Product Detail, Customization and Cart become interactive without waiting for recommendation data.
- Optional-read failure does not flash a blocking error module.
- Arrival must not move Add/Customize/Checkout enough to cause accidental input.
- Unavailable/unproven Popular evidence means omit `Popular`, not delay the set.
- No client ranking animation, autoplay carousel, progressive strategy reveal or countdown.

---

## 13. Expected implementation touchpoints

These are design mappings, not implementation authorization:

```text
OrderingCatalogClient.tsx
  - exact productId+variantId Product Detail navigation/state inside /order
  - placement-scoped recommendation read orchestration

MenuItemRow.tsx
  - Product Detail affordance/deep-link origin
  - ordinary Add/Customize preserved
  - NO browse-row recommendation group

new/reused ordering recommendation presentation
  - RecommendationGroup / item presentation only

MenuItemCustomizationDialog.tsx
  - Make it yours placement
  - same-dialog explicit variant transition
  - modal focus containment, Escape and restoration

CartClient.tsx
  - in-flow Complete your order placement

CommercialWorkspaceClient.tsx / Menu commercial area
  - Recommendations subsection and relationship editor/list wiring
```

Server/API/storage remain governed by locked Architecture Fit and later Implementation Plan. Design
Readiness does not choose table names, API encoding, measurement schema, holdout algorithm,
analytics vendor, retry policy or numeric ranking weights.

---

## 14. Design acceptance matrix

| Requirement | Design proof |
|---|---|
| Product Detail max 3 / Menu browse excluded | Exact product+variant `/order` detail context; group after primary action; no browse-row group. |
| Exact Product Detail identity | URL/state binds `productId + variantId`; product-only ambiguity is not delegated to implementation. |
| Customization 1 variant + 2 add-ons, max 3 | One group in existing dialog using existing product authority. |
| No silent variant/modifier mutation | Variant action explicit; target graph updates visibly; invalid prior selections require recovery; positive-price defaults remain off. |
| Modal accessibility | Initial focus, containment, Escape rule, exact restoration and transition focus are explicit requirements. |
| Cart max 4 / non-empty only | One in-flow group; empty state unchanged; Checkout unobstructed. |
| Fail-open | No blocking recommendation loading/error state. |
| Stale/suppression | Existing recovery/removal; no menu tombstone. |
| Popular / holdout truth | Evidence-backed label only; holdout silent. |
| Workforce scope/model | Existing commercial Menu area; `menu.read/menu.manage`; Product/category relationships; Product Detail/Cart placements only. |
| No authority drift | No new money, promotion, Catalog, Cart, role, permission, service or ML authority. |

---

## 15. Gate evidence required

Design Readiness may PASS only if the exact candidate head verifies all of the following:

1. Product, Experience and locked Architecture semantics are unchanged.
2. Product Detail never leaks into `MENU_DISCOVERY` and uses exact product+variant navigation state.
3. Variant upgrade does not assume a nonexistent selector or silently carry/drop invalid choices.
4. Dialog focus containment/restoration is a requirement, not a false current-source claim.
5. Primary Add/Customize/Cart/Checkout hierarchy remains protected.
6. No nested modal/toast/countdown pattern is introduced.
7. Workforce UI exposes only the locked relationship model and authorization boundary.
8. Exact headings and forbidden-claim rules are preserved.
9. Responsive/accessibility/state maps are implementation-ready.
10. Quality/Test Plan, Measurement Plan and Implementation Plan remain unperformed.
11. Implementation remains unauthorized/unstarted.
12. IMP-036J lifecycle and shared governance are untouched.

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

Passing Design Readiness does not authorize implementation. Quality/Test Planning,
Measurement/Instrumentation Planning and Implementation Planning remain separate required lifecycle
work.
