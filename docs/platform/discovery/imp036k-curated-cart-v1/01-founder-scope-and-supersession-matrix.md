# IMP-036K V1 — Founder scope and supersession matrix

```text
AUTHORITY = NONE
STATUS = CANDIDATE
OLD_GATE_APPROVALS_NOT_AUTOMATICALLY_TRANSFERRED = YES
NEW_PRODUCT_DEFINITION_GATE = NOT_GRANTED
NEW_EXPERIENCE_GATE = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
DO_NOT_MERGE = YES
```

```text
BATCH = BOBA-B6-IMP036K-CURATED-CART-V1-20261025
BASE = origin/main a6155378b799e06a95b28c593ac1a340d7ca9245
VISION = VISION-1
ROADMAP = GTM-R190
STATE = STATE-R189
ARCHITECTURE = ARCH-R23
DECISION_REGISTER = DR-25
PROCESS = PD-2 / EXP-1 / LANG-1 / TEST-1
ACCEPTED_THROUGH = IMP-036I
CURRENT_PRODUCT_SLICE = IMP-036J
NEXT_PRODUCT_SLICE = IMP-036K
IMP036K_IMPLEMENTATION_AUTHORIZED = NO
```

This note records the Founder direction to simplify IMP-036K V1 and how that direction sits against historical approvals. It does not grant a gate, amend ROADMAP or STATE, or close a pull request.

## 1. Binding direction captured

The Founder selected a simpler V1 and agreed to prepare the formal Product and Experience amendment. The observable contract is:

1. One placement: Cart / Your Order, before Checkout and Payment.
2. One menu: a filtered view of the existing effective menu. Curation references stable parent-product identities.
3. Merchant curation with existing workforce authorization and brand scope: select, enable or disable, relative priority, and a shelf switch. Proposed visible ceiling: four cards. Pool guidance: about 8–12 products, not a hard limit.
4. A parent product is absent from the shelf while any of its variants is in the active Cart, whatever the add source. The curated list itself does not change when the Cart changes. The main menu still shows the product.
5. Direct add only when the existing menu would already direct-add. Otherwise existing customization opens. No preselected paid modifier and no silent variant switch.
6. Shelf failure does not block Cart, coupons, Checkout, or Payment.
7. Measurement stays observational. No telemetry, holdout, or experiment is authorized by this batch.
8. An active Pickup Checkout suppresses the Curated Cart add-on shelf. The shelf does not reuse the previous Delivery outlet’s product availability or price. This is Founder product direction dated 2026-10-26, recorded in this candidate only as `BR-036K-CC-025`. It does not grant a gate, perform Architecture Fit, or authorize implementation.

| Situation | V1 behavior |
|---|---|
| Non-empty Cart with a valid delivery-serviceable outlet and no active Pickup Checkout | An eligible curated shelf may appear |
| Active Checkout mode is Pickup | No shelf |
| Active Checkout mode is Delivery with valid serviceability | The shelf may appear from that delivery outlet |
| No authoritative outlet | No shelf |
| An active Checkout exists but its effective mode cannot be verified | Fail safely. Do not promise an eligible shelf |
| No Checkout exists yet, and the Cart has verified delivery serviceability | Do not treat the missing Checkout mode as Pickup |
| Checkout changes back to Delivery | Re-evaluate the shelf against the current authoritative context |
| Any recommendation failure | Cart, coupons, Checkout, and Payment stay usable |

This direction does not add a Cart-based Pickup outlet selector, a Pickup pricing or availability authority, or a derivation of Pickup eligibility from stale delivery coordinates. Historical Product Definition, Experience Definition, Architecture Fit, and Design Readiness PASS results stay historical. This revised V1 still requires its own formal gates. Those gates remain `NOT_GRANTED` / `NOT_PERFORMED`.

Candidate identities:

| Candidate | ID | Gate |
|---|---|---|
| Product Definition | `PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1` | `NOT_PERFORMED` |
| Experience Definition | `XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1` | `NOT_PERFORMED` |
| Architecture Fit impact | `IMP-036K-V1-CURATED-CART-FIT-IMPACT-1` | `NOT_PERFORMED` |
| Quality plan | `QT-IMP-036K-V1-CURATED-CART-CANDIDATE-1` | `NOT_PERFORMED` |
| Measurement plan | `MI-IMP-036K-V1-CURATED-CART-CANDIDATE-1` | `NOT_PERFORMED` |

Experience Criticality remains `X3`. Proposed Change Risk is `CR2`, because a later Fit may add durable curation references beside Cart mutation reuse. That proposal is not a decision-register change.

## 2. What stays

| Item | Disposition |
|---|---|
| IMP-036K identity and `nextProductSlice` position | Unchanged. ROADMAP and STATE were not edited. |
| Capability name in ROADMAP | Remains Revenue Recommendations. This package narrows V1 behaviour inside that identity. |
| D-383 | Remains CURRENT for identity, activation, and sequencing. Not rewritten. |
| D-377, D-382 remainder, D-384 | Unchanged. IMP-037 and IMP-038 stay held. IMP-039 and IMP-040 stay inactive. |
| Historical PD/XD PASS | `PD-IMP-036K-DRAFT-1` and `XD-IMP-036K-DRAFT-1` stay the record of the previous scope, evaluated at `072932df00c445c8215c61f19f81971bf657b160`. |
| Historical Architecture Fit lock | `docs/platform/capabilities/IMP-036K-revenue-recommendations.md` stays locked for the previous scope (review `5391917727`). It does not govern this shelf. |
| Historical Design Readiness | Previous PASS stays historical (review `5396061135`). It does not transfer. |
| Pull requests #335, #338, #343, #348, #460, #463, #465 | Historical or still-open source material. None is an implementation authorization. #465 was not closed. |

## 3. Supersession matrix

| Historical scope | Class | V1 meaning |
|---|---|---|
| Product Detail complementary recommendations | `REMOVE_FROM_V1` | No recommendation module on Product Detail. |
| Customization variant/add-on recommendation module | `REMOVE_FROM_V1` | Existing customization still opens when options are required. It is not a recommendation module. |
| Cart category-gap inference | `REMOVE_FROM_V1` | Operators choose products. The shelf does not infer a missing category. |
| Product/category source-to-target relationship types | `REMOVE_FROM_V1` | Replaced by curated parent-product references. |
| Complex operator recommendation relationships | `REMOVE_FROM_V1` | Select, enable or disable, relative priority, shelf switch. |
| Pre-cart guest ordering-session identity | `DEFER_TO_FUTURE_SCOPE` | Not a V1 prerequisite. The active Cart is the basket. |
| B3S-M1 journey credential (PR #465) | `DEFER_TO_FUTURE_SCOPE` | Not a V1 prerequisite. PR left open. Proposed disposition only. |
| User/session suppression after a dismissal | `REMOVE_FROM_V1` | Hide and return follow Cart membership. |
| Multi-stage assistance-correlation engine | `REMOVE_FROM_V1` | Not imported. |
| Recommendation issued-set / presentation schemas | `REMOVE_FROM_V1` | Not a V1 object. |
| Popular treatment and the 30-day/30-order rule | `REMOVE_FROM_V1` | No popularity claim. |
| Commercial contribution ranking | `REMOVE_FROM_V1` | Configured priority only. Selling price is not margin. |
| Holdout design and experimental allocation | `DEFER_TO_FUTURE_SCOPE` | Not activated. |
| AI/ML ranking and personalization | `DEFER_TO_FUTURE_SCOPE` | Not in V1. |
| Durable purchased-unit provenance | `DEPENDENCY_REVIEW_REQUIRED` | Count a purchased unit as a shelf add only when provenance is real. This package recommends deferring that count. See the measurement candidate. |

`RETAIN_SIMPLIFIED` was not used. The Cart placement, the existing menu, and the existing Cart add survive, but they are specified again in the new candidates rather than inherited from the old acceptance scenarios.

## 4. D-383

D-383 allocates IMP-036K and authorizes parallel definition preparation. It does not lock Product Detail placements, holdouts, or B3S-M1. Those belonged to the later historical Product Definition and capability lock.

A formal amendment of D-383 is **not required** to prepare this candidate. Identity, sequence, the implementation ban, and the ban on a new recommendation role all still hold.

Optional later wording, if a human wants the narrowing recorded as a decision, is in `07-founder-gate-decision-package.md`. That wording is non-authoritative. The next free decision id on DR-25 is D-385. This package does not reserve it and does not edit the register.

## 5. Gate sequence before any implementation

```text
New Product Definition Gate
→ New Experience Gate
→ Revised Architecture Fit / Lock
→ Design Readiness
→ Quality Plan finalization and Measurement Plan finalization
→ Implementation Plan
→ Explicit implementation authorization
```

Publishing this package does not pass any of those gates.

`FOUNDER_UAT = NOT_PERFORMED`. `FORMAL_ACCEPTANCE = NOT_GRANTED`.
