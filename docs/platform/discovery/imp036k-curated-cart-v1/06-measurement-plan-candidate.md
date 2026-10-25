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
```

This file proposes the smallest observation set for Curated Cart V1. It does not authorize collection. It does not record that any event was emitted. It does not claim uplift, recommendation revenue, or contribution margin.

## 1. Historical plans on this SHA

`NOT_ON_THIS_MAIN`.

`a6155378b799e06a95b28c593ac1a340d7ca9245` does not contain an IMP-036K quality plan or an IMP-036K measurement plan. Pull requests #348, #460, and #463 are historical Quality/Measurement candidates for the previous broad Revenue Recommendations scope. Their PASS results and their contents do not transfer. Their text is not reconstructed here.

The broad capability document on this SHA describes a larger assistance vocabulary, including issued-set, render, impression, click, add, removal, and assisted-purchase meanings. This candidate does not adopt that seven-event assistance engine. `MEASUREMENT_PLAN_FINALIZATION = NOT_PERFORMED` for both the broad documents and this candidate.

## 2. Taxonomy

Four meanings. Collection of each is feasible only as a later, privacy-reviewed, cart-attempt observation. This batch does not authorize collection.

| ID | Meaning | When it may be counted | When it must not be counted |
|---|---|---|---|
| `M-CC-01` Eligible shelf exposure | The shelf was rendered with at least one card | A server-validated render of one or more eligible cards on a non-empty cart | An empty cart, a disabled shelf, a zero-card result, a filler slot, a client-invented card list, or a page view that never rendered a card |
| `M-CC-02` Explicit shelf interaction | The customer activated `+` or opened customization from a shelf card | That explicit action on a rendered card | A scroll, a hover, a menu control, or a card that was not rendered |
| `M-CC-03` Successful shelf add | A cart add succeeded and this cart attempt started it from the shelf | The successful mutation whose initiation on this attempt was the shelf action | An ordinary menu add of the same parent. Disappearance of a card after a menu add is not this event |
| `M-CC-04` Purchased-order survival | A purchased unit still carries valid shelf provenance | Only after a later Fit authorizes durable provenance and the order copy of that provenance is valid | See section 4. This candidate does not count `M-CC-04` |

`M-CC-01`, `M-CC-02`, and `M-CC-03` are request-scoped or cart-attempt-scoped observations. They are not a second commercial ledger. `M-CC-03` is the last product event this candidate recommends implementing, and only after a later authorization. It is not authorized now.

`M-CC-01` can be emitted by the server when it builds the shelf read. `M-CC-02` and `M-CC-03` need a server-owned fact that this attempt started on the shelf. A caller-supplied flag on `addCartLine` does not create that fact: unknown fields fail closed today, and a client flag is not proof (`ARCH-G08`). Choosing a server-owned observation, without a new cart reject and without purchased-unit schema, is Architecture Fit work. Until that Fit, this plan does not treat `M-CC-02` or `M-CC-03` as implementable. The smallest alternative that needs no cart-contract change is `M-CC-01` plus the cart-to-checkout and checkout-completion guardrails.

## 3. Smallest attribute set

Exposure stays coarse so a rendered shelf does not become a product-interest list.

| Event | Attributes | Justification |
|---|---|---|
| `M-CC-01` | `brandId`. `outletId` only when the same effective-menu read already resolved an outlet. `cardCount` (integer, at least 1). `cartId` and cart `revision` already used by cart mutation. | The cart row already stores `brandId` (`carts.brand_id`) and does not store an outlet. Customer menu projection already accepts an optional `outletId` with the brand. Reusing that resolved outlet avoids a new cart column. `cardCount` records that a shelf existed without listing products. `cartId` plus `revision` ties the observation to this cart attempt. |
| `M-CC-02` | The `M-CC-01` correlation, plus the single parent the customer acted on, plus the action (`add` or `customize`). | The acted-on parent is required to tell a shelf action from a menu action. It is one explicit action, not the list of cards that were shown. |
| `M-CC-03` | The same correlation and the same single parent, plus the resulting cart revision after success. | Success is the server cart result. The parent on the event is the parent of the shelf action that initiated this attempt. A menu add of that parent does not emit `M-CC-03`. |

Omitted on purpose from all three events: the full card list, priority values, prices as a measurement fact, margin, customer id as a profile key, `guestCredentialVerifier`, name, email, phone, and any new cross-session identifier.

Cart-bound source context means the attribution describes this cart add attempt. It does not describe a pre-cart guest credential. `B3S-M1` is not required for this taxonomy.

A client-supplied boolean, a client-supplied parent id that the server did not render, or an unvalidated render call is not `M-CC-01` or `M-CC-03`. Browser logic is not commercial authority (`ARCH-G11`).

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

Recommendation: defer purchased-unit attribution. Do not add a minimal durable flag in this candidate. A one-bit shelf-origin column is still new schema and waits for a later Architecture Fit. Until that Fit authorizes a server-owned shelf-initiation fact, do not implement `M-CC-03`. The observation that needs no cart-contract change is `M-CC-01` plus the ordinary order-completion guardrail in section 5. Purchased-unit attribution is not claimed. `M-CC-03` remains a proposed meaning only.

`DEPENDENCY_REVIEW_REQUIRED` is the status of `M-CC-04`, not an authorization to design the schema in this batch.

## 5. Guardrails

These are safety observations. They are not success targets and they have no numeric threshold in this candidate.

| Guardrail | Observation | Failure meaning |
|---|---|---|
| Cart-to-checkout continuation | Among carts that reached the cart surface, continuation into checkout does not fall because the shelf was eligible, rendered, disabled, or failed. | The shelf is associated with fewer checkouts started. This is a stop signal for the shelf, not a causal proof by itself. |
| Checkout completion | Checkout completion does not fall because of the shelf. | Same reading: a guardrail breach, not an uplift model. |
| Payment | Payment is not blocked because the shelf is down, disabled, or slow. | Any payment denial or hang caused by the shelf fails the guardrail. Payment success remains existing payment authority. |

Money and order totals stay on the existing order and payment records. This plan does not create a parallel revenue total.

The paired quality scenarios are `AS-CC-12` in `05-quality-test-plan-candidate.md`. Those tests are `PLANNED` and were not executed.

## 6. Denominators and what the rates mean

| Rate | Numerator | Denominator | Reading |
|---|---|---|---|
| Interaction rate | `M-CC-02` | `M-CC-01` eligible shelf renders | Observational. Share of eligible shelf renders where the customer activated a shelf card. |
| Attach rate | `M-CC-03` successful shelf adds | `M-CC-01` eligible shelf renders | Observational. Share of eligible shelf renders that ended in a shelf-initiated successful add. |

The exposure denominator is an eligible shelf render: the shelf rendered with at least one card. A page view of an empty cart is not an exposure. A cart page with the shelf disabled or with zero eligible cards is not an exposure.

Attach rate is observational. Causal uplift is outside this plan. Recommendation revenue is not inferred from impressions. Contribution margin is not derived from selling price. An impression has no monetary value in this taxonomy.

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

No holdout arm is assigned. No experiment is activated. No model ranks or scores customers. Priority, if the ungated Product Definition grants it, stays an operator ordering input to eligibility display. It is not a learned score and it is not an attribute of `M-CC-01`.

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

If a later authorization collects `M-CC-01` through `M-CC-03`, those rows follow whatever retention already governs that sink. Because no numeric commerce-analytics retention was found, the period stays `UNVERIFIED` until the sink and its existing rule are identified. This plan does not fill the gap with a guessed window.

## 9. Observational limitations

- Eligible shelf exposure is not a page view, not a unique visitor, and not proof the customer read the card.
- `cardCount` does not say which parents were shown. Later product-level questions cannot be answered from `M-CC-01`.
- `M-CC-02` without `M-CC-03` includes cancelled customization and failed adds. Those are interactions, not adds.
- `M-CC-03` counts a successful shelf-initiated add on this cart attempt. It does not count a later quantity increase from the cart stepper, and it does not survive as an order attribute.
- A menu add of the same parent can hide the card (`AS-CC-01`). That hide is not `M-CC-03`.
- Two tabs or a menu-add racing a shelf add can make card disappearance and the successful mutation disagree until the authoritative cart is recomputed (`AS-CC-10`). Measurement waits for the server result.
- Attach rate can move because the eligible set changed, the cart mix changed, or the shelf failed open. The rate does not separate those causes.
- Guardrail movement is a safety signal. It is not an estimate of incremental orders.
- No purchased-unit, incremental-revenue, or margin figure is available from this taxonomy.
- Empty-cart sessions are invisible to the exposure denominator by design. They are not a holdout.
- Collection, sink, schema, and retention remain unauthorized. Feasibility under a later privacy review is not permission to collect.

## 10. Explicit non-claims

- No event was implemented.
- No event was emitted.
- No dashboard, query, or backfill was run.
- No test was executed.
- Historical measurement PASS on pull requests #348, #460, and #463 is not evidence for this taxonomy.
- This plan does not finalize measurement and does not authorize implementation.
