# IMP-036K Curated Cart V1 — Measurement plan candidate

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
CANDIDATE_ID = MI-IMP-036K-V1-CURATED-CART-CANDIDATE-1
CAPABILITY = IMP-036K
SCOPE_NAME = Curated Cart V1
LINKED_PRODUCT_DEFINITION = PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1
LINKED_PRODUCT_DEFINITION_GATE = NOT_GRANTED
LINKED_EXPERIENCE_DEFINITION = XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1
LINKED_EXPERIENCE_GATE = NOT_GRANTED
LINKED_QUALITY_CANDIDATE = QT-IMP-036K-V1-CURATED-CART-CANDIDATE-1
COLLECTION_AUTHORIZED_BY_THIS_BATCH = NO
EXPERIMENT_ACTIVATION = NO
HOLDOUT_ASSIGNMENT = NO
AI_OR_ML_FEATURES = NO
NEW_CROSS_SESSION_PROFILE = NO
NEW_SCHEMA_AUTHORIZED = NO
PURCHASED_UNIT_ATTRIBUTION = DEFER
PROVENANCE_DEPENDENCY = DEPENDENCY_REVIEW_REQUIRED
TESTS_RUN_BY_THIS_BATCH = NO
THIS_DOCUMENT_IS_A_PLAN = YES
THIS_DOCUMENT_IS_NOT_EXECUTED_EVIDENCE = YES
PUBLICATION_BRANCH = docs/imp036k-curated-cart-v1-scope-20261025
DRAFT_WORKTREE = /home/ajoshi/repos/boba-bear-b6-d-quality
BASE_HEAD = a6155378b799e06a95b28c593ac1a340d7ca9245
HISTORICAL_IMP036K_QUALITY_AND_MEASUREMENT_FILES_ON_THIS_SHA = NOT_ON_THIS_MAIN
OBSERVATION_SEMANTICS_CORRECTION = YES
SERVER_SHELF_RESPONSE_IS_NOT_EXPOSURE = YES
M-CC-01 = ACTUALLY_RENDERED_ELIGIBLE_SHELF
IMPLEMENTABLE_WITHOUT_CART_CONTRACT_CHANGE = M-CC-RSP
INTERACTION_AND_ATTACH_RATES = NOT_COMPUTABLE
RENDERED_EXPOSURE_VALIDATION = ARCHITECTURE_FIT_DEPENDENCY_NOT_IMPLEMENTED
```

This file proposes the smallest observation set for Curated Cart V1. It does not authorize collection. It does not record that any event was emitted. It does not claim uplift, recommendation revenue, or contribution margin.

## 1. Historical plans on this SHA

`NOT_ON_THIS_MAIN`.

`a6155378b799e06a95b28c593ac1a340d7ca9245` does not contain an IMP-036K quality plan or an IMP-036K measurement plan. Pull requests #348, #460, and #463 are historical Quality/Measurement candidates for the previous broad Revenue Recommendations scope. Their PASS results and their contents do not transfer. Their text is not reconstructed here.

The broad capability document on this SHA describes a larger assistance vocabulary, including issued-set, render, impression, click, add, removal, and assisted-purchase meanings. This candidate does not adopt that seven-event assistance engine. `MEASUREMENT_PLAN_FINALIZATION = NOT_PERFORMED` for both the broad documents and this candidate.

## 2. Taxonomy

Five named observations. Four are customer-facing meanings. The fifth is a server response diagnostic and is not one of those meanings. Collection of any of them is feasible only as a later, privacy-reviewed, cart-attempt observation. This batch does not authorize collection.

| ID | Meaning | When it may be counted | When it must not be counted |
|---|---|---|---|
| `M-CC-RSP` Eligible shelf response | The server produced a shelf response that contains one or more eligible cards. This is a response/availability diagnostic | That response was built for a non-empty cart, the shelf was enabled, and `cardCount` is an integer of at least 1 | An empty cart, a disabled shelf, a zero-card result, a filler slot, a client-invented card list, a brand-only menu projection with no authoritative outlet, or any use of this row as a customer-visible impression or as exposure |
| `M-CC-01` Eligible shelf render | The shelf was actually rendered to the customer with at least one card | A later Architecture Fit accepts one validated browser observation that this cart attempt rendered that shelf | The server response in `M-CC-RSP`. A page view. A response the browser never painted. An empty cart, a disabled shelf, a zero-card result, a filler slot, or a client-invented card list |
| `M-CC-02` Explicit shelf action | The customer activated `+` or opened customization from a shelf card | That explicit action on a card that was actually rendered | A scroll, a hover, a menu control, a card that was not rendered, or the server response alone |
| `M-CC-03` Authoritative successful Cart add | A cart add succeeded and this cart attempt started it from the shelf | The successful server cart mutation whose initiation on this attempt was the shelf action | An ordinary menu add of the same parent. Disappearance of a card after a menu add is not this event. A client flag is not this event |
| `M-CC-04` Purchased-order survival | A purchased unit still carries valid shelf provenance | Only after a later Fit authorizes durable provenance and the order copy of that provenance is valid | See section 4. This candidate does not count `M-CC-04` |

`M-CC-RSP` records that the server built an eligible shelf response. It does not record that the customer saw the shelf. It is not an impression and it is not exposure. Simpler V1 may observe only this diagnostic. That limit does not make `M-CC-RSP` a rendered-exposure denominator.

`M-CC-01` is the rendered shelf. Building the shelf read does not emit it. A future genuine rendered-exposure event needs the server to validate a browser observation. That validation is an Architecture Fit dependency. It is not implemented in this candidate. If a later Fit takes it up, the rules are:

- Source. A browser observation that the shelf region was rendered on this Cart view with its heading and at least one card. The source is not the server handler that built the shelf response, and it is not a Cart page view.
- Correlation. `cartId` and cart `revision` already used for that shelf response. The key is this cart attempt. It is not `guestCredentialVerifier`, not a customer profile key, and not a new cross-session identifier.
- Deduplication. At most one accepted `M-CC-01` for a given `cartId` and `revision`. A repeated browser report for that same pair is a duplicate, not a second exposure.
- Privacy. The same coarse attributes as section 3. No card list, no prices, no priority values, no name, email, or phone. Existing optional GA4 is not the sink.
- Rejection. Reject the observation when the server has no `M-CC-RSP` for that `cartId` and `revision`. Reject `cardCount` below 1, a client-supplied parent list, an empty cart, a disabled shelf, a zero-card result, and a revision that does not match the revision on the shelf response. An unvalidated render call is not `M-CC-01`. Browser logic is not commercial authority (`ARCH-G11`).

`M-CC-RSP`, `M-CC-01`, `M-CC-02`, and `M-CC-03` are request-scoped or cart-attempt-scoped observations. They are not a second commercial ledger. `M-CC-03` is the last product event this candidate recommends implementing, and only after a later authorization. It is not authorized now.

`M-CC-02` and `M-CC-03` need a server-owned fact that this attempt started on the shelf. A caller-supplied flag on `addCartLine` does not create that fact: unknown fields fail closed today, and a client flag is not proof (`ARCH-G08`). Choosing a server-owned observation, without a new cart reject and without purchased-unit schema, is Architecture Fit work. Until that Fit, this plan does not treat `M-CC-01`, `M-CC-02`, or `M-CC-03` as implementable. The observation that needs no cart-contract change is `M-CC-RSP` plus the cart-to-checkout and checkout-completion guardrails. `M-CC-RSP` remains a diagnostic count. It is not the interaction-rate or attach-rate denominator in section 6.

## 3. Smallest attribute set

Attributes stay coarse so a shelf response or a rendered shelf does not become a product-interest list.

| Event | Attributes | Justification |
|---|---|---|
| `M-CC-RSP` | `brandId`. `outletId` only when the same effective-menu read already resolved an outlet. `cardCount` (integer, at least 1). `cartId` and cart `revision` already used by cart mutation. | The cart row already stores `brandId` (`carts.brand_id`) and does not store an outlet. Customer menu projection already accepts an optional `outletId` with the brand. Reusing that resolved outlet avoids a new cart column. `cardCount` records that the server response contained cards, without listing products and without asserting that the customer saw them. `cartId` plus `revision` ties the diagnostic to this cart attempt. |
| `M-CC-01` | The same coarse attributes as `M-CC-RSP` for one validated render. No card list. | These attributes apply only after the section 2 Fit dependency accepts the browser observation. Building the shelf response does not write `M-CC-01`. |
| `M-CC-02` | The `M-CC-01` correlation, plus the single parent the customer acted on, plus the action (`add` or `customize`). | The acted-on parent is required to tell a shelf action from a menu action. It is one explicit action, not the list of cards that were shown, and not `M-CC-RSP`. |
| `M-CC-03` | The same correlation and the same single parent, plus the resulting cart revision after success. | Success is the authoritative server cart result. The parent on the event is the parent of the shelf action that initiated this attempt. A menu add of that parent does not emit `M-CC-03`. |

Omitted on purpose from all four events: the full card list, priority values, prices as a measurement fact, margin, customer id as a profile key, `guestCredentialVerifier`, name, email, phone, and any new cross-session identifier.

Cart-bound source context means the attribution describes this cart add attempt. It does not describe a pre-cart guest credential. `B3S-M1` is not required for this taxonomy.

A client-supplied boolean, a client-supplied parent id that the server did not include in the shelf response, or an unvalidated render call is not `M-CC-RSP`, `M-CC-01`, or `M-CC-03`. Browser logic is not commercial authority (`ARCH-G11`). Recording `M-CC-RSP` does not create `M-CC-01`.

Existing optional GA4 (`src/components/Analytics.tsx`, loaded only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set) is not selected as the sink. Sending `cartId` to that third party would be a new privacy decision. This candidate does not make it.

## 4. Purchased-order survival

```text
M-CC-04 = NOT_COUNTED
PURCHASED_UNIT_ATTRIBUTION = DEFER
PROVENANCE_RECOMMENDATION = DEFER_PURCHASED_UNIT
MINIMAL_DURABLE_FLAG = NOT_CHOSEN
DEPENDENCY_REVIEW_REQUIRED = YES
```

Checked on this SHA:

- `cart_lines` stores `id`, `cart_id`, `variant_id`, and `quantity`. It has no shelf-source column (`src/platform/database/schema/cart.ts`).
- Checkout snapshot line origin is constrained to `cart` or `complimentary_offer` (`src/platform/database/schema/checkout.ts`). That distinguishes a complimentary offer line from a cart line. It does not distinguish a shelf add from a menu add.
- Order payment provenance is payment provenance. It is not shelf provenance.

A purchased-unit claim therefore needs new durable schema, or an extension of snapshot line provenance, written by the server and copied only when it is still valid at checkout. A client flag on the order would not be valid provenance. Parent survival in the order is not shelf provenance: the same parent can be added from the menu.

Recommendation: defer purchased-unit attribution. Do not add a minimal durable flag in this candidate. A one-bit shelf-origin column is still new schema and waits for a later Architecture Fit. Until that Fit authorizes a server-owned shelf-initiation fact, do not implement `M-CC-03`. The observation that needs no cart-contract change is `M-CC-RSP` plus the ordinary order-completion guardrail in section 5. `M-CC-RSP` is not a rendered exposure. Purchased-unit attribution is not claimed. `M-CC-01`, `M-CC-02`, and `M-CC-03` remain proposed meanings only.

`DEPENDENCY_REVIEW_REQUIRED` is the status of `M-CC-04`, not an authorization to design the schema in this batch.

## 5. Guardrails

These are safety observations. They are not success targets and they have no numeric threshold in this candidate.

| Guardrail | Observation | Failure meaning |
|---|---|---|
| Cart-to-checkout continuation | Among carts that reached the cart surface, continuation into checkout does not fall because a shelf response was produced, a shelf was rendered, the shelf was disabled, or the shelf failed. A shelf response is not evidence the customer saw the shelf. | The shelf is associated with fewer checkouts started. This is a stop signal for the shelf, not a causal proof by itself. |
| Checkout completion | Checkout completion does not fall because of the shelf. | Same reading: a guardrail breach, not an uplift model. |
| Payment | Payment is not blocked because the shelf is down, disabled, or slow. | Any payment denial or hang caused by the shelf fails the guardrail. Payment success remains existing payment authority. |

Money and order totals stay on the existing order and payment records. This plan does not create a parallel revenue total.

The paired quality scenarios are `AS-CC-12` in `05-quality-test-plan-candidate.md`. Those tests are `PLANNED` and were not executed.

## 6. Denominators and what the rates mean

| Rate | Numerator | Denominator | Reading |
|---|---|---|---|
| Interaction rate | `M-CC-02` explicit shelf actions | `M-CC-01` actually rendered eligible shelves | Not computable in this candidate. Both signals wait on Architecture Fit. `M-CC-RSP` is not this denominator. |
| Attach rate | `M-CC-03` authoritative successful shelf adds | `M-CC-01` actually rendered eligible shelves | Not computable in this candidate. `M-CC-03` waits on the same Fit. `M-CC-RSP` is not this denominator. |

The denominator for both rates is an actually rendered eligible shelf: `M-CC-01`, the shelf the customer was shown, with at least one card. The implementable signal that needs no cart-contract change is `M-CC-RSP`. That signal has no customer-action numerator, so it does not support an interaction rate or an attach rate. Using it as the denominator would report a response count as if it were a rendered-exposure rate. This plan does not do that.

A page view of an empty cart is not `M-CC-01` and is not `M-CC-RSP`. A cart page with the shelf disabled or with zero eligible cards is neither.

Attach rate, once both `M-CC-03` and `M-CC-01` exist, is observational. Causal uplift is outside this plan. Recommendation revenue is not inferred from a shelf response or from a render. Contribution margin is not derived from selling price. Neither `M-CC-RSP` nor `M-CC-01` has a monetary value in this taxonomy.

Order totals, captured payment, and refunds remain the existing order and payment authorities. A shelf event does not change them.

## 7. Privacy

```text
NEW_CROSS_SESSION_PROFILE = NO
HOLDOUT_ASSIGNMENT = NO
EXPERIMENT_ACTIVATION = NO
AI_OR_ML_FEATURES = NO
COLLECTION_AUTHORIZED_BY_THIS_BATCH = NO
GUEST_CREDENTIAL_AS_ATTRIBUTION_KEY = NO
B3S_M1_REQUIRED = NO
```

The correlation key is this cart attempt: `cartId` and cart `revision`. It is not `guestCredentialVerifier`, and it is not a new identifier that follows a person across carts.

No holdout arm is assigned. No experiment is activated. No model ranks or scores customers. Priority, if the ungated Product Definition grants it, stays an operator ordering input to eligibility display. It is not a learned score and it is not an attribute of `M-CC-RSP` or `M-CC-01`.

## 8. Retention

```text
NEW_RETENTION_PERIOD_AUTHORIZED = NO
COMMERCE_ANALYTICS_RETENTION = UNVERIFIED
NUMERIC_RETENTION_INVENTED = NO
```

This batch does not authorize a retention period.

Verified briefly on this SHA:

- `src/components/Analytics.tsx` loads GA4 only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set and forwards `trackEvent` to `gtag`. The file states no retention period.
- `docs/platform/security/acceptance-pack/privacy-retention-matrix.md` lists carts, orders, payments, and location. It has no commerce-analytics or GA4 row and no numeric analytics window. Location says `RAW_LOCATION_TELEMETRY_RETENTION_BY_DEFAULT: NO`. That sentence is the location class. It is not a GA4 or shelf-event retention period.
- Statutory windows in that matrix are `LEGAL_REVIEW_REQUIRED`. This candidate does not pick a number of days.

If a later authorization collects `M-CC-RSP`, `M-CC-01`, `M-CC-02`, or `M-CC-03`, those rows follow whatever retention already governs that sink. Because no numeric commerce-analytics retention was found, the period stays `UNVERIFIED` until the sink and its existing rule are identified. This plan does not fill the gap with a guessed window.

## 9. Observational limitations

- `M-CC-RSP` is a server response. It is not a customer-visible impression, not exposure, and not proof the shelf was rendered.
- `M-CC-01` is an actually rendered shelf. It is not a page view, not a unique visitor, and not proof the customer read the card. It is not computable from `M-CC-RSP`.
- `cardCount` does not say which parents were included. Later product-level questions cannot be answered from `M-CC-RSP` or from `M-CC-01`.
- Interaction rate and attach rate stay not computable while their denominator is `M-CC-01` and that render signal is not implementable. `M-CC-RSP` is not a substitute denominator.
- `M-CC-02` without `M-CC-03` includes cancelled customization and failed adds. Those are actions, not adds.
- `M-CC-03` counts a successful shelf-initiated add on this cart attempt. It does not count a later quantity increase from the cart stepper, and it does not survive as an order attribute.
- A menu add of the same parent can hide the card (`AS-CC-01`). That hide is not `M-CC-03`.
- Two tabs or a menu-add racing a shelf add can make card disappearance and the successful mutation disagree until the authoritative cart is recomputed (`AS-CC-10`). Measurement waits for the server result.
- Attach rate can move because the eligible set changed, the cart mix changed, or the shelf failed open. The rate does not separate those causes.
- Guardrail movement is a safety signal. It is not an estimate of incremental orders.
- No purchased-unit, incremental-revenue, or margin figure is available from this taxonomy.
- Empty-cart sessions are invisible to `M-CC-RSP` and to the `M-CC-01` denominator by design. They are not a holdout.
- Collection, sink, schema, and retention remain unauthorized. Feasibility under a later privacy review is not permission to collect.

## 10. Explicit non-claims

- No event was implemented.
- No event was emitted.
- No dashboard, query, or backfill was run.
- No test was executed.
- Historical measurement PASS on pull requests #348, #460, and #463 is not evidence for this taxonomy.
- This plan does not finalize measurement and does not authorize implementation.
