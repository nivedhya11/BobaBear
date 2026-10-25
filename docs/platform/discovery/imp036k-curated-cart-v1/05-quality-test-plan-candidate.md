# IMP-036K Curated Cart V1 — Quality / test plan candidate

```text
AUTHORITY = NONE
STATUS = CANDIDATE
OLD_GATE_APPROVALS_NOT_AUTOMATICALLY_TRANSFERRED = YES
NEW_PRODUCT_DEFINITION_GATE = NOT_GRANTED
NEW_EXPERIENCE_GATE = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
DO_NOT_MERGE = YES
QUALITY_PLAN_FINALIZATION = NOT_PERFORMED
MEASUREMENT_PLAN_FINALIZATION = NOT_PERFORMED
```

```text
BATCH = BOBA-B6-IMP036K-CURATED-CART-V1-20261025
CANDIDATE_ID = QT-IMP-036K-V1-CURATED-CART-CANDIDATE-1
CAPABILITY = IMP-036K
SCOPE_NAME = Curated Cart V1
LINKED_PRODUCT_DEFINITION = PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1
LINKED_PRODUCT_DEFINITION_GATE = NOT_GRANTED
LINKED_EXPERIENCE_DEFINITION = XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1
LINKED_EXPERIENCE_GATE = NOT_GRANTED
TESTING_AUTHORITY = TEST-1
TESTING_PATH = docs/platform/TESTING.md
PROOF_EXECUTED = NO
TESTS_RUN_BY_THIS_BATCH = NO
THIS_DOCUMENT_IS_A_PLAN = YES
THIS_DOCUMENT_IS_NOT_EXECUTED_EVIDENCE = YES
PUBLICATION_BRANCH = docs/imp036k-curated-cart-v1-scope-20261025
DRAFT_WORKTREE = /home/ajoshi/repos/boba-bear-b6-d-quality
BASE_HEAD = a6155378b799e06a95b28c593ac1a340d7ca9245
HISTORICAL_IMP036K_QUALITY_AND_MEASUREMENT_FILES_ON_THIS_SHA = NOT_ON_THIS_MAIN
```

This file proposes how Curated Cart V1 would be proved. It does not prove it. No test command was run for this candidate. No pass, fail, or coverage result is claimed.

The linked Product Definition and Experience Definition are not granted. Scenario identifiers below are proposed for this candidate. They are not the approved broad `AC-036K-*` set, and they do not become acceptance criteria until that Product Definition gate is granted and this quality plan is finalized.

## 1. Historical plans on this SHA

`NOT_ON_THIS_MAIN`.

A tree listing of `a6155378b799e06a95b28c593ac1a340d7ca9245` contains an IMP-036J quality plan and an IMP-036J measurement plan. It does not contain an IMP-036K quality plan or an IMP-036K measurement plan under `docs/platform/product/IMP-036K/` or `docs/platform/discovery/`.

Historical pull requests, cited by number only. Their text is not reconstructed here, and their PASS results do not transfer:

| Pull request | Historical role | Applies to this candidate |
|---|---|---|
| #348 | Quality/Measurement Candidate 1 | No. Previous broad Revenue Recommendations scope. |
| #460 | Quality/Measurement Candidate 2 | No. Previous broad Revenue Recommendations scope. |
| #463 | Corrected Quality/Measurement Candidate 2 | No. Previous broad Revenue Recommendations scope. |

`OLD_GATE_APPROVALS_NOT_AUTOMATICALLY_TRANSFERRED = YES`. The approved broad Product Definition `PD-IMP-036K-DRAFT-1` and Experience Definition `XD-IMP-036K-DRAFT-1` remain the recorded broad-scope documents on this SHA. This candidate does not inherit their gate PASS, their story set, or their unperformed-to-finalized quality status.

## 2. What this plan proposes to cover

Curated Cart V1, as proposed for the ungated linked Product Definition:

- One optional shelf on a cart that already has purchase intent.
- Cards are parent products that are curated, on the effective menu, and available for the cart's brand and the outlet already used by that delivery menu read. Shelf eligibility follows `BR-036K-CC-025`. No serviceable delivery outlet produces no cards and does not block Cart or Checkout. An active Pickup Checkout produces no shelf, including when delivery coordinates remain stored. No Checkout yet is not Pickup. An active Checkout whose effective mode cannot be verified produces no eligible shelf. A return to Delivery re-evaluates. Those cases are proposed oracles in `AS-CC-15`. They are `PLANNED` and `NOT_EXECUTED`. Current source does not implement the suppression. A brand-only menu projection is not eligibility.
- At most four cards. Fewer eligible parents produce fewer cards. Empty results produce no shelf.
- Any in-cart variant of a parent hides that parent's card.
- The next eligible parent appears in priority order. Survivors keep their relative order.
- Direct add uses the existing cart add. It does not preselect a paid modifier and does not switch variant.
- Shelf failure leaves Cart, coupon, Checkout, and Payment usable.

Proposed display bound: four. That bound is `PROPOSED` until `PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1` is granted. If the granted definition changes the bound, these scenarios are revised at finalization. This plan does not lock the bound.

Customer heading proposed for content QA: `A little extra?`. That string belongs to the ungated Experience Definition. It is a planned check, not granted language.

## 3. Proposed acceptance-scenario-to-test matrix

TEST-1 (`docs/platform/TESTING.md`) is the proof policy. Layers below are the planned applicable layers. Every result is `PLANNED` and `NOT_EXECUTED`. A planned layer is not a passing test.

Proof-type words used here:

| Word | TEST-1 layer | Meaning in this plan |
|---|---|---|
| unit | 1. Unit, and 3. Domain/use-case where the rule is the eligibility predicate | Isolated parent-hide, priority, and direct-add rules |
| component | 2. Component | Rendered shelf behaviour and local interaction |
| http | 6. HTTP/API contract, plus 7. Authorization where the row is a deny | Server read and add over the existing commerce boundary |
| browser | 11. E2E browser/UI | Integrated cart UI. Fixtures must still leave server authority visible |
| concurrency | 8. Concurrency | Overlapping operations. Sequential calls do not satisfy this layer |
| accessibility | 10. Accessibility | Name, price, action, keyboard, focus recovery |
| recovery | 9. Recovery/idempotency | Reload and reconciliation recompute from the authoritative cart |

Database integration is `PLANNED` only for AS-CC-09 and AS-CC-10 if the shelf read is implemented against PostgreSQL cart state. An in-memory double would not close those rows. Founder UAT is `NOT_PERFORMED` and is outside this document.

| Scenario | Behaviour / risk | Planned proof | Result |
|---|---|---|---|
| `AS-CC-01` Ordinary menu add hides the parent card | Adding a parent from the ordinary menu, with the shelf not used, removes that parent's shelf card. A different parent stays. Risk: the shelf keeps a parent already in the cart, or hides the wrong parent. | unit: parent identity from the added variant. component: menu-add state drops only that card. http: authoritative cart contains the variant and the shelf read omits that parent. browser: menu add, then the card is absent. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-02` Shelf add hides the card only after success | The card remains while a shelf `+` or customization add is in flight. It disappears only after the cart add succeeds. Risk: optimistic removal on click. | component: pending state keeps the card. http: disappearance follows the success response, not the request start. browser: card remains until the successful cart update is shown. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-03` Parent and variant identity | Any variant of a parent in the cart hides that parent card. Mixed variants of the same parent still hide that one card. Multiple lines of that parent still hide that one card. Another parent is unaffected. Risk: hide keyed to one variant or one line, so a second variant brings the card back. | unit: aggregate in-cart variants to parent. component: mixed variants and multiple lines. http: a cart with two variant lines of one parent omits that parent and keeps the next parent. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-04` Quantity change and full removal | Increasing quantity keeps the card hidden. Decreasing quantity while any unit or line of that parent remains keeps the card hidden. Removing every unit and every line of that parent restores the card when the parent is still curated and still on the effective menu. Restoration does not occur when curation or the effective menu no longer includes the parent. Risk: a partial decrement restores the card, or a full removal restores an ineligible parent. | unit: hide while any parent unit remains; restore only on the eligibility predicate. component: increase, partial decrease, full removal. http: each quantity state. browser: full removal restores an still-eligible card. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-05` Failed add and cancelled customization | A rejected or failed shelf add leaves the card in place. Opening customization and cancelling leaves the card in place and leaves the cart unchanged. Risk: the card disappears on the attempt. | component: error and cancel states. http: a rejected add returns the unchanged cart and the shelf read still includes the parent. browser: cancel customization, card present, cart lines unchanged. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-06` Next candidate, stable survivors | When a card leaves, the next eligible parent appears in priority order. Cards that were already shown keep their relative order. Risk: the shelf reshuffles survivors or skips the next priority parent. | unit: select at most the proposed bound, append the next eligible parent, preserve survivor order. component: order before and after one disappearance. http: the same membership and order from the server read. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-07` Fewer than four, no filler, nothing eligible, disabled, empty cart | One, two, or three eligible parents render that many cards and no placeholder card. Zero eligible parents render no shelf. A disabled shelf renders no shelf and no disabled-shelf message. An empty cart renders no shelf even when curated parents exist. Risk: filler cards, an apology empty state, or a shelf on an empty cart. | component: each absence and the short list. http: disabled read and empty-cart read omit the shelf. browser: empty cart and a one-card shelf. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-08` Brand, outlet, and effective menu | A parent that is unavailable for the cart brand, or for the outlet already resolved by the effective menu read, is omitted. A parent removed from the effective menu is omitted. No serviceable delivery outlet omits the shelf: `no_location`, `not_orderable`, and `indeterminate`. A brand-only projection, with no outlet session and a brand price, is not eligibility and is not a price promise. Active Pickup Checkout and an unverifiable Checkout mode are `AS-CC-15`, not a delivery shelf. Risk: a stale curated row stays on screen after availability or menu membership changes, a card appears before a serviceable delivery outlet exists, or a delivery-current shelf is described as a Pickup promise. The shelf does not become availability, menu, or outlet authority. Display omission is not sealed payable truth (`D-368`, `ARCH-G19`). Cart and Checkout stay usable. | unit: eligibility requires curation, effective-menu membership, and brand/outlet availability together, and fails closed without a serviceable delivery outlet. http: menu projection plus availability inputs; removed, unavailable, or no-outlet parents are absent. The HTTP shelf response is not a rendered-exposure oracle. browser: the card is absent after the effective menu no longer includes the parent, and absent when Cart has no serviceable delivery outlet. Pickup suppression is `AS-CC-15`. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-09` Reconciliation and reload | After cart reconciliation (`D-370`), the shelf is recomputed from the merged authoritative cart. After reload, the shelf is recomputed from the authoritative cart. A stale client card list is not the source. Risk: a pre-merge or pre-reload shelf survives a parent that the server cart now contains, or drops a parent the server cart does not contain. | http: shelf read after reconciliation matches parent membership of the merged cart. recovery: reload. browser: reload shows the server result. Database integration is `PLANNED` when the read uses PostgreSQL cart rows. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-10` Server authority and races | Stale displayed price does not become the payable price. The shelf re-reads effective-menu eligibility before counting a shelf success (`AC-036K-CC-020`). It does not add a shelf-only reject inside `addCartLine`. `validateCartLineStructure` still checks catalog structure and still does not check assortment or availability. Two tabs mutating one cart resolve under existing cart revision and lock (`ARCH-G09`, `D-371`); the shelf then matches the surviving cart. A menu add and a shelf add for the same parent in overlap produce one authoritative parent membership: the card is hidden once any unit of that parent is in the authoritative cart, and a lost or failed attempt does not hide a parent that is absent from that cart. Existing line coalescing remains the line-identity rule. Risk: client price, client hide, a shelf-only purchase gate, or a double add that breaks cart invariants. | http: a stale card is not a price token; structural rejection comes from the existing add; assortment and availability omission is a shelf-read result, not a new `addCartLine` error. concurrency: overlapping menu-add and shelf-add, and overlapping two-tab adds, with durable final cart assertions. Sequential calls are not this proof. browser: two tabs are supporting evidence and do not replace the concurrency layer. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-11` Mobile, desktop, accessibility, content | Mobile and desktop both show the shelf as secondary to the cart. Each card exposes its product name, its price, and its action. Focus returns to a sensible cart or shelf control after success, after a failed add, and after cancelled customization. Content QA checks the candidate heading `A little extra?` and the absence of fake scarcity, countdown, or savings language. Risk: an unnamed control, lost focus, or urgency copy. The heading remains ungated experience copy. | component: accessible name includes name, price, and action. accessibility: keyboard and focus recovery. browser: mobile viewport and desktop viewport. content QA: planned manual/browser reading of the heading and of scarcity copy. Founder Experience UAT is `NOT_PERFORMED`. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-12` Cart, coupon, Checkout, and Payment stay usable when the shelf is down | Shelf read failure, timeout, or disable leaves the cart usable, leaves coupon entry and evaluation usable, leaves Checkout reachable, and leaves Payment unblocked. Risk: a shelf error gates checkout or payment. No new payment state is introduced. Money and payment truth stay with existing payment authority. | component: cart actions remain available when the shelf is absent. http: shelf failure does not change cart, coupon, checkout, or payment contracts. browser: cart, coupon, and checkout with the shelf forced down. Planned continuity regression for existing cart, checkout, and payment journeys, including `GJ-PAYMENT-RECOVERY` reachability. Those journeys are not executed here. The new Product Definition has not granted a journey set. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-13` Direct add leaves paid modifiers and variant choice alone | Direct add happens only when the projected row has no modifier groups, and the payload matches the menu add: that `variantId`, quantity 1, `expectedRevision`, and no modifiers. A direct shelf add does not select a positive-price modifier (`D-369`) and does not direct-add zero-price defaults ahead of customization. It does not change the customer onto a different variant. Any modifier group opens the existing customization flow. Cancel is `AS-CC-05`. Risk: a catalog default paid modifier or a substituted variant is written because the shelf offered the item. | unit: direct-add payload contains no modifiers and the requested variant only, and only when `modifierGroups.length` is 0. component: direct add versus customize handoff. http: the stored line has the requested variant and no positive-price modifier. browser: the same outcome on the cart. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-14` Cross-brand curation is denied | A curated candidate whose brand is not the cart brand is omitted. An add that names a cross-brand parent through the shelf is denied, and the cart is unchanged. Risk: another brand's product appears or is added because a curation row exists. | unit: brand equality is required. http authorization: cross-brand shelf add is denied and has no cart side effect. browser: the foreign card is absent. The http deny is the authority proof. | `PLANNED` / `NOT_EXECUTED` |
| `AS-CC-15` Checkout-mode shelf suppression | The nine oracles in section 3b. An active Pickup Checkout shows no shelf. No Checkout yet is not Pickup. An unverifiable mode fails safe. A return to Delivery re-evaluates. Guest and customer Carts follow the same rule. Shelf absence does not block Cart, coupons, Checkout, or Payment. Risk: the previous Delivery outlet's availability or price stays on screen during Pickup, or a missing Checkout is treated as Pickup. These oracles are proposed. They are not executed, and current source does not implement the suppression. | unit: the eligibility predicate in section 3b. http: the shelf read for each oracle. browser: return to Cart from Pickup, and Cart before any Checkout. component: no shelf region and no heading in the hidden cases. | `PLANNED` / `NOT_EXECUTED` |

## 3a. Map onto the ungated product scenarios

These rows are the same contract as `PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1`. The product gate is still `NOT_GRANTED`, so this map is proposed traceability, not granted acceptance.

| Quality row | Product scenarios |
|---|---|
| `AS-CC-01` | `AC-036K-CC-006` |
| `AS-CC-02` | `AC-036K-CC-007` |
| `AS-CC-03` | `AC-036K-CC-005`, `AC-036K-CC-012` |
| `AS-CC-04` | `AC-036K-CC-008`, `AC-036K-CC-009` |
| `AS-CC-05` | `AC-036K-CC-010` |
| `AS-CC-06` | `AC-036K-CC-018`, `AC-036K-CC-019` |
| `AS-CC-07` | `AC-036K-CC-002`, `AC-036K-CC-011`, `AC-036K-CC-018` |
| `AS-CC-08` | `AC-036K-CC-004`, `AC-036K-CC-011` |
| `AS-CC-09` | `AC-036K-CC-013`, `AC-036K-CC-014` |
| `AS-CC-10` | `AC-036K-CC-017`, `AC-036K-CC-020` |
| `AS-CC-11` | `AC-036K-CC-019`; experience `XR-036K-CC-001` through `XR-036K-CC-005` |
| `AS-CC-12` | `AC-036K-CC-021` |
| `AS-CC-13` | `AC-036K-CC-015`, `AC-036K-CC-016` |
| `AS-CC-14` | `AC-036K-CC-023`, `AC-036K-CC-024` |
| `AS-CC-15` | `AC-036K-CC-001`, `AC-036K-CC-011`, `AC-036K-CC-013`, `AC-036K-CC-021`, `BR-036K-CC-025` |

`AC-036K-CC-001`, `AC-036K-CC-003`, `AC-036K-CC-022`, `AC-036K-CC-025`, and `AC-036K-CC-026` are covered as placement, non-placement, curation save, and measurement-entitlement rows in the product candidate. Placement and non-placement are part of the browser proof for `AS-CC-07` and `AS-CC-11`. Curation save is the authorization proof in `AS-CC-14` plus a planned workforce write once Fit names the existing permission. Measurement proof stays in the measurement candidate and is not executed here.

Measurement oracles, paired to `AC-036K-CC-025` and `BR-036K-CC-020`, are `PLANNED` and `NOT_EXECUTED`. They do not authorize collection:

- An eligible shelf HTTP response with at least one card satisfies `M-CC-RSP` only. It does not satisfy `M-CC-01`.
- `M-CC-01` requires the shelf region to be rendered to the customer with at least one card. A component or browser render assertion is not `M-CC-RSP`. An HTTP response is not `M-CC-01`.
- `M-CC-02` is the customer's explicit shelf action on a rendered card. `M-CC-03` is the authoritative successful Cart add that this attempt started from the shelf. A menu add is not `M-CC-03`.
- Interaction rate and attach rate are not computable from `M-CC-RSP`. Their denominator is `M-CC-01` when that render signal exists.
- `M-CC-RSP` and `M-CC-01` are not counted for an active Pickup Checkout or for an unverifiable active Checkout mode. A response or render built from the previous Delivery outlet during Pickup is neither event. No Checkout yet, with a serviceable delivery context, can still be `M-CC-RSP` when the other response conditions hold.
- `AS-CC-08` expects no shelf when there is no serviceable delivery outlet. That absence is not a failed shelf and does not block Checkout (`AS-CC-12`).
- `AS-CC-15` expects no shelf for an active Pickup Checkout and for an unverifiable active Checkout mode. It expects an eligible shelf to remain possible when no Checkout exists yet and delivery serviceability is valid. It expects a return to Delivery to re-evaluate. `BR-036K-CC-025` is that rule. `PICKUP_DELIVERY_COVERAGE` is not `DECISION_REQUIRED`. The oracles are `PLANNED` / `NOT_EXECUTED`.

## 3b. Proposed Checkout-mode oracles

These oracles propose how `AS-CC-15` would be proved. Every row is `PLANNED` / `NOT_EXECUTED`. They do not authorize a runtime change. `CURATED_SHELF_CHECKOUT_MODE_READ` remains an Architecture Fit design requirement.

| Oracle | Setup | Expected shelf result | Negative result that fails the oracle |
|---|---|---|---|
| Serviceable Delivery context | Non-empty Cart, valid delivery-serviceable outlet, shelf enabled, at least one eligible Cart-absent parent, and no active Pickup Checkout | An eligible shelf may appear from that delivery outlet, at most four cards, using that outlet's effective menu | A brand-only projection, or a card whose outlet or brand does not match the Cart, is treated as eligibility |
| Pickup selection while Delivery coordinates remain stored | The customer selects Pickup on Checkout. Delivery coordinates remain stored. The previous delivery outlet was serviceable | No shelf. The previous Delivery outlet's availability and price are not shown | A delivery-priced card remains, or `pickupOutletId` becomes the shelf outlet |
| Return to Cart from active Pickup Checkout | Active Checkout mode is Pickup. The customer opens Cart | No shelf region and no heading. Cart lines, coupons, and Checkout stay usable | The shelf reappears because the Cart page only reads delivery coordinates |
| No Checkout created yet | Non-empty Cart, verified delivery serviceability, and no Checkout | Do not treat the missing Checkout mode as Pickup. An eligible shelf may appear | The shelf is hidden only because no Checkout mode exists |
| Checkout mode unavailable | An active Checkout exists, and its effective mode cannot be verified. This includes a failed read and a result that cannot separate a still-active Checkout from no Checkout | No eligible shelf is promised. Cart, coupons, Checkout, and Payment stay usable | The shelf falls open onto the stored delivery context |
| Switch back to Delivery | Checkout mode changes from Pickup to Delivery, and delivery serviceability is valid | Re-evaluate. The shelf may appear from the current delivery outlet when the parent is otherwise eligible | The shelf stays hidden because Pickup was selected earlier, or it keeps a stale Pickup price |
| Outlet or brand mismatch | The curated parent is not the Cart brand, or it is unavailable for the outlet the delivery menu read resolved | The parent is omitted. Pickup does not make the mismatch eligible | A foreign brand or a non-serviceable outlet appears because a curation row or a Pickup outlet id exists |
| Guest Cart and customer Cart | Guest Cart with verified delivery serviceability and no Checkout. Customer Cart with the same delivery context and no active Pickup Checkout. Then guest claim or reconcile | Both may show an eligible shelf before an active Pickup Checkout exists. After claim or reconcile, recompute from the surviving Cart and the current Checkout mode. A guest has no Checkout | The guest is treated as Pickup, or claim invents a Pickup shelf |
| Cart and Checkout failure isolation | The shelf read fails, Pickup suppression applies, or Checkout mode is unverifiable. Separately, Checkout or Payment fails for its own reason | Cart mutation, coupons, Checkout, and Payment stay usable when the shelf is absent or fails. A shelf failure does not change Checkout or Payment contracts. A Checkout failure is not repaired by showing a shelf | Ordering is blocked, or a shelf error changes the Checkout or Payment result |

## 4. Traceability status

TEST-1 requires every mandatory acceptance scenario to have passing evidence before implementation completion. This candidate has no mandatory scenario yet, because `NEW_PRODUCT_DEFINITION_GATE = NOT_GRANTED`. The rows above are the proposed mapping. At a later finalization they would be rewritten against the granted story and AC identifiers, with executable test references. Until then:

```text
MANDATORY_AC_IDENTIFIERS = NOT_GRANTED
SCENARIO_TO_TEST_MATRIX = PROPOSED
EXECUTABLE_TEST_REFERENCES = NONE
PASSING_EVIDENCE = NONE
FOUNDER_UAT = NOT_PERFORMED
QUALITY_PLAN_FINALIZATION = NOT_PERFORMED
```

## 5. Explicit non-claims

- No unit, component, http, browser, concurrency, accessibility, or database test was executed for this candidate.
- No existing suite was re-run and then treated as Curated Cart V1 proof.
- Historical PASS on pull requests #348, #460, and #463 is not evidence for these scenarios.
- Story completion, once it exists, will not be IMP acceptance.
- This plan does not authorize implementation and does not authorize merging.

## 6. Out of scope for this candidate plan

The previous broad Revenue Recommendations scope included product-detail complements, in-customization suggestions, category-gap baskets, holdout assignment, popularity treatment, and workforce relationship authoring. Those behaviours are not rows in this matrix. They are not denied as future product scope by this file. They are outside this candidate's proposed proof.

Measurement encoding, event transport, and purchased-unit provenance are in the companion measurement candidate. This quality plan does not finalize them. An HTTP shelf response is not the rendered-exposure oracle.
