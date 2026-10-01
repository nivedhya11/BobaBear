<!-- governance-meta
{
  "status": "APPROVED",
  "authority": "EXPERIENCE_DEFINITION",
  "capability": "IMP-036K",
  "experienceDefinitionVersion": "XD-IMP-036K-DRAFT-1",
  "productDefinition": "PD-IMP-036K-DRAFT-1",
  "productDefinitionGate": "PASS",
  "experienceCriticality": "X3",
  "changeRisk": "CR2",
  "experienceGate": "PASS",
  "architectureFit": "NOT_PERFORMED",
  "architectureLocked": "NO",
  "designReadiness": "NOT_PERFORMED",
  "implementationAuthorized": false
}
-->

# IMP-036K — Experience Definition

```text
EXPERIENCE_DEFINITION_VERSION = XD-IMP-036K-DRAFT-1
STATUS = APPROVED
AUTHORITY = EXPERIENCE_DEFINITION
CAPABILITY = IMP-036K
PRODUCT_DEFINITION = PD-IMP-036K-DRAFT-1
PRODUCT_DEFINITION_STATUS = APPROVED
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
EXPERIENCE_DEFINITION_STATUS = APPROVED
EXPERIENCE_GATE_EXECUTION = PERFORMED
EXPERIENCE_GATE = PASS
INDEPENDENT_EXPERIENCE_GATE_REVIEW = PASS
INDEPENDENT_EXPERIENCE_GATE_REVIEW_ID = 5380398013
EXPERIENCE_GATE_EVALUATED_HEAD = 072932df00c445c8215c61f19f81971bf657b160
EXPERIENCE_GATE_EVALUATED_TREE = a4912e6c649cad25094412ac07a005fbb441567e
CANONICAL_PATH = /home/ajoshi/repos/boba-bear-platform
EVALUATED_BRANCH = docs/imp036k-product-experience-definition
EVALUATED_HEAD = 072932df00c445c8215c61f19f81971bf657b160
EVALUATED_TREE = a4912e6c649cad25094412ac07a005fbb441567e
EVALUATED_WORKING_TREE_FINGERPRINT = f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46
EXPERIENCE_GATE_RESULT = PASS
ARCHITECTURE_FIT = NOT_PERFORMED
ARCHITECTURE_LOCKED = NO
DESIGN_READINESS = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
IMP036K_NEXT_GATE = ARCHITECTURE_FIT
FOUNDER_UAT_REQUIRED = YES
FOUNDER_EXPERIENCE_UAT = NOT_PERFORMED
OPEN_EXPERIENCE_DECISIONS = NONE

HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
X_SCALE_ORTHOGONAL_TO_CR_SCALE = YES
X_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
RAW_BACKEND_LANGUAGE_TO_CUSTOMER = PROHIBITED
```

This is the approved Experience Definition for IMP-036K. The version remains
`XD-IMP-036K-DRAFT-1`. It owns presentation, interaction, trust, recovery experience, and
measurement intent that is about how the experience is observed. Product entitlement,
eligibility, cardinality, and false-claim boundaries stay in
[`product-definition.md`](./product-definition.md). Exact customer wording in this document is
not Product acceptance copy. Architect review `5380398013` performed the Experience Gate against
exact candidate branch `docs/imp036k-product-experience-definition`, HEAD
`072932df00c445c8215c61f19f81971bf657b160`, tree `a4912e6c649cad25094412ac07a005fbb441567e`,
and working-tree fingerprint `f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46`,
and returned PASS. That fingerprint belongs to the evaluated candidate. It is not the fingerprint
of this persistence pull request. That PASS does
not perform Architecture Fit, Design Readiness, or implementation authorization.

Experience Intent:

> Help customers discover a small number of genuinely relevant, purchasable additions at natural
> ordering moments without making the ordering journey feel manipulated, cluttered or harder to
> complete. A recommendation should feel optional and useful; ignoring it must always feel safe.

Customer mental model:

> “These are optional ideas that fit what I’m already ordering; I stay in control.”

Operator mental model:

> “I can influence Product Detail and Cart recommendations through product or category
> relationships inside commercial eligibility. I cannot place that relationship on Customization,
> make an ineligible item purchasable, or expose internal margin rationale to customers.”

## 1. Identity / version / status

| Field | Definition |
|---|---|
| Capability | IMP-036K — Revenue Recommendations |
| Experience Definition version / status | `XD-IMP-036K-DRAFT-1`; `APPROVED`; Experience Gate `PASS` |
| Product Definition reference | `PD-IMP-036K-DRAFT-1`; `APPROVED`; gate `PASS` (Architect review `5380398013`) |
| Experience Criticality | `X3`. Customer ordering, conversion, basket value, and trust. |
| Change Risk | `CR2`, from D-383. Not an agent `R` level. |
| Process anchors | PD-2 / EXP-1 / LANG-1 / TEST-1 |
| Repository candidate | `CANONICAL_PATH = /home/ajoshi/repos/boba-bear-platform`. `EVALUATED_BRANCH = docs/imp036k-product-experience-definition`. `EVALUATED_HEAD = 072932df00c445c8215c61f19f81971bf657b160`. `EVALUATED_TREE = a4912e6c649cad25094412ac07a005fbb441567e`. `EVALUATED_WORKING_TREE_FINGERPRINT = f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46`. Same evaluated candidate as the Product Definition Gate. |

## 2. Experience Intent

The customer is trying to finish an order. Recommendations help them notice a small number of
additions that already fit the product, the customization, or the cart. They should understand
that each idea is optional, that choosing one is a deliberate action, and that skipping every
idea leaves the order intact.

The operator is trying to point eligible items at the right moment. They should understand that
eligibility is already decided by commerce, that priority only changes order inside that set, and
that customers never see margin or commercial priority as the reason.

Trust outcome: useful, calm, and reversible. The journey should not feel as if something was
added while the customer was looking away.

## 3. User goals and questions

| Person | Goal | Question they must be able to answer |
|---|---|---|
| `PERSONA-CUSTOMER` on Product Detail | Notice complements while staying with the current product | “Do these go with what I am viewing, and can I ignore them?” |
| `PERSONA-CUSTOMER` in Customization | See a real upgrade or add-on for this product | “Will this change my item only if I choose it?” |
| `PERSONA-CUSTOMER` on Cart | See a short way to fill an obvious gap | “Can I check out now if I do not want these?” |
| `PERSONA-CUSTOMER` after a refusal or a removal | Recover without losing the rest of the order | “Is the rest of my cart still here, and is the item still on the menu?” |
| `PERSONA-WORKFORCE-OPERATOR` | Set product or category relationships they are already allowed to administer | “Which Product Detail or Cart placement, priority, and period apply, and what stays in carts I disable?” |
| Holdout customer | Order normally | They should not need to ask why suggestions are missing. |

## 4. Evidence and assumptions

| Claim | Class | Evidence class | Risk | Validation path |
|---|---|---|---|---|
| Founder discovery direction, including RRD-01 through RRD-08, prefers small truthful sets on Product Detail, Customization, and Cart | `SUPPORTED_EVIDENCE` | `FOUNDER_HEURISTIC_REVIEW` | Direction is treated as customer research | Keep the class. Confirm in Founder Experience UAT. Do not cite it as `CUSTOMER_USABILITY_RESEARCH`. |
| No recommendation module exists in the current storefront | `FACT` | Repository search of `src/` on source main | — | Re-check at implementation |
| Customers will feel safer when suggestions stay visually secondary and require an explicit add | `ASSUMPTION` | `FOUNDER_HEURISTIC_REVIEW` | A secondary module could still feel like a hard step | `XR-IMP-036K-001`, `XR-IMP-036K-002`, Founder Experience UAT |
| “Goes great with this”, “Make it yours”, and “Complete your order” are understandable without claiming co-purchase or personalization | `ASSUMPTION` | `FOUNDER_HEURISTIC_REVIEW` | Copy could still be read as a guarantee | Content QA and `XR-IMP-036K-015` |
| An unexplained absence of suggestions is less damaging than an error or a holdout explanation | `ASSUMPTION` | Experience content owned here. Product owns when presentation is suppressed. | Someone may later add explanatory empty states that feel like errors | `XR-IMP-036K-006`, `XR-IMP-036K-016` |
| Recommendations will raise incremental contribution without lowering conversion | `HYPOTHESIS` | `FOUNDER_HEURISTIC_REVIEW` | Click optimization could harm checkout | Holdout measurement in section 17. Not acceptance. |

There is no `CUSTOMER_USABILITY_RESEARCH`, `PRODUCTION_BEHAVIOURAL_DATA`, or `CONTROLLED_EXPERIMENT` evidence yet.

## 5. Current-state experience

Today the customer orders through Menu, Product, Customization, Cart, Checkout, and Payment with
no recommendation module. Operators configure commerce in the existing administration workspace
and have no recommendation relationship screen.

`/#drops` is a marketing navigation target. It is not a Limited Drop ordering experience, and
this candidate does not design one.

The desired states below are intent. They are not current behaviour.

## 6. Desired journey

1. The customer arrives on Product Detail, Customization, or a cart that already has a line.
2. If they are in the holdout, or if generation fails, or if nothing eligible exists, they see the primary task and no recommendation module. Nothing explains the absence.
3. Otherwise a short secondary set appears under the placement heading. The primary action remains visually and operationally first.
4. If they ignore the set, the product, configuration, and cart stay as they were, and checkout stays available.
5. If they act, and existing commerce allows a direct add, that one action adds through the existing cart path and confirms like any other add.
6. If the item needs choices, the existing customization interaction takes over. Paid modifiers stay unselected until the customer selects them. The cart changes only after that interaction accepts the configuration.
7. If the item is no longer purchasable, existing calm recovery explains it and the rest of the cart remains. Checkout is still available.
8. If they remove a recommendation-added line, ordinary cart removal runs. Later suggestion sets in that cart or session omit that candidate. The menu still lists the item. A later manual add feels like a normal menu add.
9. An authorized operator defines or disables a product or category relationship for Product Detail or Cart in the existing commercial configuration workspace. Disable stops future use of that relationship. Customization suggestions continue from the current product's existing choices. Carts that already contain an item from that relationship stay intact.

Popular appears only as an earned word on a qualifying item. The three placement headings stay
in place. “You might also like” is neutral supporting copy when a popularity, trend, or
personalization claim would be false. It does not replace the placement heading and it does not
mean the set was chosen for that person.

## 7. Entry and discoverability

Customers do not navigate to a Recommendations destination. The module is encountered while they
are already on Product Detail, in Customization, or on a non-empty Cart. Headings identify it.
The primary page purpose remains the product, the customization, or the cart.

An empty cart does not grow a recommendation feed. Menu browsing does not become recommendation
ranking in V1.

Operators enter through the existing workforce commercial-configuration area they already use.
This candidate does not name a new application or a new role. How that entry is placed in the
current workspace is Design Readiness, after Architecture Fit identifies the existing screen and
permission.

Direct links to Product, Cart, and Checkout keep working. Checkout has no recommendation module
in V1.

## 8. Information architecture and hierarchy

Each customer surface has one primary task and, when shown, one secondary recommendation group.

| Surface | Primary | Secondary | Hidden from the customer |
|---|---|---|---|
| Product Detail | The current product, its price, and the existing add or customize action | Up to three complements, heading “Goes great with this” | Strategy names, scores, margin, priority, relationship ids |
| Customization | The current configuration and its existing choices | Up to one existing variant upgrade and two existing add-ons, heading “Make it yours” | A fake second product for a variant. An operator relationship form. |
| Cart | Lines, totals, and the path to checkout | Up to four suggestions, heading “Complete your order” | Group-size inference, holdout status |
| Workforce configuration | The product or category relationship being edited and its effective scope | Priority, Product Detail and Cart placements, and effective period as operational fields | Customer-facing copy of those internal fields |

“You might also like” is neutral supporting copy where a specific claim would be untrue. It does
not replace “Goes great with this”, “Make it yours”, or “Complete your order”, and it is not a
personalization claim.

“Popular” is an item-level label, not a placement heading, and only when the Product Definition
evidence rule passes.

Future Limited Drop copy (“Limited Drop” or “Try the latest Drop”) is allowed only after an
authoritative Drop source exists. It is not part of the V1 experience acceptance dependency.
If that future candidate is also commercially prioritized, the customer sees the Drop wording,
not the priority.

## 9. Interaction, mental model, and cognitive load

The primary interaction on a suggestion is one explicit action: add, or open the existing
customization. The module shows a handful of items so the customer can scan and move on.
Maximums are ceilings. A short set is a normal result.

Variant upgrades read as a step up of the item being configured, using a variant that product
already has. Add-ons read as optional extras the existing modifier rules already allow. Cart
suggestions read as missing pieces of the order, not as a second menu.

Cognitive load stays bounded by one group per surface, the placement caps in the Product
Definition, no stacked claims, and no modal that must be cleared before checkout.

## 10. Friction audit

| Moment | Necessary / protective / accidental | Decision |
|---|---|---|
| Reading a short optional set while the primary task stays available | Necessary for discovery, if it stays secondary | Keep. `XR-IMP-036K-001` |
| Requiring an explicit action before cart or configuration changes | Protective. Prevents unintended purchase intent | Keep. `XR-IMP-036K-003` |
| Opening existing customization when the item needs choices | Necessary. The product cannot be purchased without those choices | Keep. Do not invent a shorter path that skips required choices. `XR-IMP-036K-004` |
| Revalidation that refuses a stale item | Protective | Keep the existing calm recovery. `XR-IMP-036K-008` |
| Ordinary cart removal, then omitting that candidate in this cart | Protective against repeating the same suggestion. The menu item remains | Keep. Do not add a second confirmation that implies the product was deleted. `XR-IMP-036K-009` |
| A blocking error, spinner, or retry that gates checkout on recommendation failure | Accidental | Remove as a pattern. Fail open. `XR-IMP-036K-007` |
| Padding the set so it looks full | Accidental | Do not use. `XR-IMP-036K-006` |
| Explaining holdout or apologising for no suggestions | Accidental | Do not use. `XR-IMP-036K-016` |
| Showing margin or commercial priority | Accidental and trust-breaking | Do not use. `XR-IMP-036K-015` |
| Fake scarcity, countdown, or savings on a recommendation | Accidental dark pattern | Do not use. `XR-IMP-036K-015` |

## 11. Service blueprint

A recommendation is not a separate kitchen promise. The blueprint still has to line up so the
customer is not offered a purchasable item the operation cannot sell.

```text
CUSTOMER PROMISE
  Optional ideas that fit this product or cart and can be bought now
        ↕
SYSTEM TRUTH
  Existing assortment, availability, price, fulfilment, outlet, and configuration
  Customization suggestions read the current product's existing variant and modifier authority
  Product Detail and Cart may also use an effective product or category relationship after hard eligibility
        ↕
WORKFORCE ACTION
  An already authorized operator defines, activates, or disables a product or category relationship
  for Product Detail or Cart, inside that commercial scope
  Customization is not a placement of that relationship
        ↕
OPERATIONAL CAPABILITY
  Existing commercial administration and existing storefront ordering
  No new labour step and no new Drop operation
```

If system truth says the item is ineligible, the customer experience is absence, not a
purchasable-looking tease. If the operator disables a relationship, customers stop seeing new
uses of that relationship on Product Detail and Cart. Customization suggestions that come from
the current product's existing choices remain available when those choices are still eligible.
Carts that already hold the item stay as carts.

## 12. Content requirements

LANG-1 applies. Tone for these moments is ordering: clear, concise, and lightly branded.
Failure and stale recovery are calm, direct, and recovery-oriented. Playful copy stays out of a
rejected add. Checkout and Payment copy stay unchanged because those surfaces do not host V1
recommendations.

Customer language:

| Use | Words |
|---|---|
| Product Detail group | Goes great with this |
| Customization group | Make it yours |
| Cart group | Complete your order |
| Neutral supporting copy, not a replacement heading | You might also like |
| Earned popularity | Popular |
| Explicit add, when commerce allows direct add | The existing add action language for cart adds |
| Needs configuration | The existing customize or choose language |
| Stale or unavailable add | Existing commerce recovery language for that refusal |
| Removal | Existing cart removal language |
| Holdout, empty, or failed generation | No special recommendation sentence |

Operator language may name relationship, Product Detail placement, Cart placement, priority,
effective period, activate, and disable. Those words serve the operator job. They are not copied
into customer UI. The operator form does not offer Customization as a placement of a product or
category relationship, and it does not ask for a variant or modifier target. Customers do not
see strategy or relationship enum tokens.

Future Drop language, only if Product and Architecture later prove a Drop source: “Limited Drop”
or “Try the latest Drop”. Until then, that copy is unused.

Forbidden customer claims in V1 include: Frequently bought together. Recommended for you.
Trending. Popular without the evidence rule. Commercial Priority. High Margin. Promoted because
we want to sell this. Any countdown, false scarcity, or savings amount created by the
recommendation. A price remains the existing price presentation.

```text
XR-IMP-036K-015 — Content and trust
The visible words match the table above.
No backend strategy name, margin, or internal merchandising rationale is shown.
No false scarcity, savings, popularity, trend, or personalization claim is shown.
Popular appears only when the Product Definition evidence rule passes.
```

## 13. UX state matrix

| State | Experience requirement |
|---|---|
| Default / ready | `XR-IMP-036K-001`, `XR-IMP-036K-002`. One secondary group. Primary task remains first. |
| Loading | `XR-IMP-036K-005`. The primary task does not wait on the module. |
| Empty / first use | `XR-IMP-036K-006`. No module, no padding, no apology. |
| Success | The existing add or cart confirmation. The new line is an ordinary cart line. |
| Validation failure | `XR-IMP-036K-008` for a stale candidate. Existing recovery. |
| Unavailable / stale | The next set omits the candidate. The add attempt uses stale recovery. |
| Server / network failure | `XR-IMP-036K-007`. Module absent. No blocking error. |
| Recovery | The customer continues the primary task. Cart lines that were already valid remain. |
| Disabled | Operator disable follows `XR-IMP-036K-011`. The customer does not see a disabled-recommendation tombstone. |
| Destructive confirmation | No recommendation-specific extra confirmation. Cart removal uses the existing removal interaction. `XR-IMP-036K-009`. |
| Concurrency / conflict | If the item changed between display and add, the customer sees stale recovery. The experience does not specify a lock screen. |

## 14. Responsive, mobile, accessibility, and perceived performance

Mobile and desktop use the same hierarchy: primary task first, recommendation group second,
within the placement caps. The cart path to checkout stays visible without dismissing a
recommendation modal. Breakpoints, spacing, and component geometry are Design Readiness.

Keyboard users can move from the primary action through the group and onward. Focus is not
trapped in the group. After a successful add, focus follows the existing add path. After a
rejected add, focus lands on the existing recovery target so the customer can continue.

Screen readers get the group label from the heading, each item name, and the action. Adding,
rejecting, and removing are announced with the existing cart announcements. The group is
described so it is clear the suggestions are optional. Suppression is not announced as removal
from the menu.

Perceived performance: a slow recommendation response never freezes Product, Customization, Cart,
or checkout entry. The customer can start the primary action while a set is still loading. If
the response fails, the UI does not flash a module and then a blocking error.

```text
XR-IMP-036K-005 — Loading and perceived performance
The primary Product, Customization, or Cart action remains usable while a recommendation set is loading.
A slow or missing recommendation response does not freeze the primary task.

XR-IMP-036K-012 — Responsive and mobile
The recommendation group stays secondary on a narrow viewport.
Checkout entry on a non-empty cart remains reachable without clearing a recommendation dialog.
The same content rules apply as on a wide viewport.

XR-IMP-036K-013 — Keyboard and focus
A visible recommendation action is reachable by keyboard.
Focus is not trapped in the recommendation group.
The primary action can be reached without activating a suggestion.

XR-IMP-036K-014 — Semantics and announcements
The group has an accessible name from its heading.
Each suggested item and its action have an accessible name.
Success, rejection, and removal are announced.
The announcement does not say the item was removed from the menu when it was only removed from the cart or suppressed as a suggestion.
```

## 15. Design-system mapping

| Need | Reuse / extend / new, with reason |
|---|---|
| Suggested item presentation | Reuse the existing product-summary or menu-item pattern if later Design Readiness confirms it can show name, price, and one action. Extend only if the optional-group heading cannot be expressed. |
| Direct add | Reuse the existing cart add action. |
| Configuration handoff | Reuse the existing customization flow. |
| Stale refusal | Reuse the existing commerce validation recovery. |
| Cart removal | Reuse the existing cart removal interaction. |
| Workforce relationship form | Reuse existing administration form, status, and permission-denied patterns. |
| New modal, toast, or countdown | No new pattern is justified by this candidate. |

Exact component geometry, layout, and visual states are Design Readiness. This section does not
specify dimensions.

## 16. Trust review

EXP-1 and LANG-1 prohibit fake scarcity, false countdowns, misleading savings, hidden mandatory
charges, preselected paid extras, and misleading action hierarchy.

This experience keeps suggestions visually secondary (`XR-IMP-036K-001`), requires explicit
intent (`XR-IMP-036K-003`), and leaves paid modifiers unselected until the existing
customization interaction records the customer’s choice (`XR-IMP-036K-004`). Headlines do not
claim a discount. Priority never becomes a customer reason (`XR-IMP-036K-015`).

A holdout is invisible so it does not create a second-class message (`XR-IMP-036K-016`). An
empty or failed module is also quiet rather than an alarming empty state.

Limited Drop urgency is not part of V1. Future Drop wording, if a Drop source is later proven,
must name the Drop without a false countdown or a false discount, and must still follow
`XR-IMP-036K-015`.

## 17. Measurement intent and analytics contract

Primary business intent: incremental contribution / gross-profit uplift attributable to
recommendations.

Secondary:

- incremental average order value
- recommendation attach rate
- recommendation-assisted purchased items
- placement and strategy performance, using internal strategy classification that customers do not see

Guardrails:

- ordering conversion
- Cart → Checkout continuation
- Checkout completion
- Payment completion
- recommendation failure must not degrade primary-commerce availability

When a customer is in the holdout, no recommendation module is presented and there is no
holdout-specific explanatory customer treatment (`XR-IMP-036K-016`). That silence stays
Experience authority. The Product Definition requires V1 design and measurement readiness for a
controlled holdout whose target direction is approximately 10%, stable for the active ordering
session or cart. It does not require a production candidate to activate that share in order to
pass Product acceptance. When the comparison runs, holdout is the control. Other sessions may
see recommendations. The comparison does not change catalog, availability, prices, promotions,
fulfilment, cart rules, checkout, payment, or entitlements.

The later Measurement/Instrumentation Plan must finalize, before implementation authorization
where required:

- assignment unit
- population
- actual control percentage and activation
- primary metric
- guardrails
- observation rule
- stop condition
- interpretation rule

`INSUFFICIENT_EVIDENCE` remains valid. This candidate does not select an assignment algorithm,
persistence, vendor, event transport, or schema. A later comparison of holdout with
non-holdout uses the primary metric and the guardrails. Insufficient traffic or an unstable
assignment is `INSUFFICIENT_EVIDENCE`, not a winner. Product acceptance stays separate from the
experiment result. The experiment cannot waive eligibility, accessibility, pricing, or payment
truth.

Baseline: none. There is no current recommendation behaviour to use as a production baseline.

Learning signal: a guarded lift in attributable contribution is the useful result. A guardrail
drop in checkout or payment completion means the result is not success. A high click rate alone
is not the learning signal.

Causal limit: this future comparison is about recommendation presence. It does not by itself
explain which relationship or piece of copy caused a change. View-through purchases are outside
V1 assistance.

Left for Architecture Fit or the Measurement Plan, and not selected here:

- storage tables
- event transport
- assignment algorithm
- analytics vendor
- persistence identity
- schema encoding
- deduplication implementation
- retention period

Event meanings required by the Product Definition:

| Meaning | Trigger the person can cause or observe | Owner | Attributes that matter | Forbidden |
|---|---|---|---|---|
| Recommendation set render | A set is actually shown | Product measurement. Not a customer message. | Placement, set correlation, holdout false | Payment data, margin, another customer's cart |
| Item impression | A specific suggested item is shown | Same | Item, placement, rank, internal strategy | Customer-visible strategy enums |
| Click | The customer activates a suggested item | Same | Item, placement | — |
| Add attempt | The customer asks to add or to start configuration from that item | Same | Item, placement | A loading state counted as a successful add |
| Successful add | Existing commerce accepts the add | Same | Item, placement, cart correlation | Counting an opened configuration as success |
| Removal | The customer removes a recommendation-added line | Same | Item, cart correlation | Menu deletion |
| Recommendation-assisted purchase | The presented, recommendation-added underlying item survives on the purchased Order | Same | Order correlation under the Product Definition continuity rules | View-through counted as assistance |

Identity semantics, deduplication, schema version, source of truth, validation, and retention
stay unset on purpose. The Measurement Plan must define them after Architecture Fit and before
implementation authorization.

`XR-IMP-036K-016` is the experience side of the holdout: the interface does not reveal it.

## 18. Research and prototype evidence

Reviewed source material:

- Founder discovery direction and RRD-01 through RRD-08 (`FOUNDER_HEURISTIC_REVIEW`)
- Current storefront absence of a recommendation module (`FACT` from repository search)
- LANG-1 and EXP-1 trust rules

No prototype, usability study, or production experiment has been run for this candidate.
A later annotated specification does not by itself upgrade the evidence class.

## 19. Experience Gate

```text
EXPERIENCE_GATE
Experience Intent defined: YES
User goal understood: YES
Entry / discoverability defined: YES
End-to-end journey defined: YES
Information architecture defined: YES
Information hierarchy defined: YES
Primary interaction defined: YES
Mental model / cognitive load considered: YES
Friction reviewed: YES
Trust-sensitive moments considered: YES
Content strategy defined: YES
Error / recovery defined: YES
Mobile / responsive defined: YES
Accessibility considered: YES
Service / operational promise aligned where applicable: YES
Performance experience considered: YES
Measurement intent defined: YES
Research / evidence level disclosed: YES
Unresolved experience decisions: NONE
ARCHITECT_REVIEW: 5380398013
EXPERIENCE_GATE_EVALUATED_HEAD: 072932df00c445c8215c61f19f81971bf657b160
CANONICAL_PATH: /home/ajoshi/repos/boba-bear-platform
EVALUATED_BRANCH: docs/imp036k-product-experience-definition
EVALUATED_HEAD: 072932df00c445c8215c61f19f81971bf657b160
EVALUATED_TREE: a4912e6c649cad25094412ac07a005fbb441567e
EVALUATED_WORKING_TREE_FINGERPRINT: f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46
EXPERIENCE_GATE_EXECUTION: PERFORMED
Result: PASS
```

Experience Gate PASS means the intended experience is understood. It is not Design Readiness. Exact component geometry, implementation-ready responsive states, and final component mapping remain Design Readiness after Architecture Fit. Founder Experience UAT remains `NOT_PERFORMED`.

## 20. Architecture Fit reconciliation

These experience requirements depend on product rules that Architecture Fit must be able to
honour. They do not add product entitlement:

- the module can disappear without a customer error when generation fails
- holdout stays invisible
- internal strategy, priority, and margin are not rendered to customers
- add, customization, recovery, and removal reuse existing interactions
- suppression does not look like a menu deletion

The Experience Gate has passed (Architect review `5380398013`). Architecture Fit remains
`NOT_PERFORMED` and is the next gate. This Experience Definition does not answer the
Architecture Fit questions listed in the Product Definition.

## 21. Design Readiness

`NOT_PERFORMED`. Experience Gate PASS does not perform it. It waits for a viable Architecture
Fit. The later specification needs to cover the states and XR identifiers in this document,
including desktop, mobile, content, keyboard, focus, accessible names, and perceived
performance, using the reuse choices in section 15. This Experience Definition is not that
specification.

## 22. Experience QA and Founder Experience UAT

Later evidence, not collected now:

- Experience QA against the XR list below
- Content QA against section 12 and LANG-1, including absence of backend tokens
- Accessibility and responsive QA for `XR-IMP-036K-012` through `XR-IMP-036K-014`
- Founder Experience UAT as part of `FOUNDER_UAT = FUNCTIONAL_UAT + EXPERIENCE_UAT`

Only the Founder supplies the Founder UAT verdict. Experience Gate PASS does not declare Founder Experience UAT PASS.

## 23. Open experience decisions

```text
OPEN_EXPERIENCE_DECISIONS = NONE
```

Visual geometry, component dimensions, and the exact administration screen layout are Design
Readiness work. They are not undecided experience semantics.

## Experience requirements

```text
XR-IMP-036K-001 — Secondary visual hierarchy
When a recommendation group is shown, the product, customization, or cart task reads as the primary task.
The recommendation group reads as secondary.
Proof later: Experience QA on Product Detail, Customization, and Cart.

XR-IMP-036K-002 — Optionality and non-interference
The customer can ignore the group and complete the primary task.
Checkout entry on a non-empty cart does not depend on accepting a suggestion.
Proof later: interaction QA.

XR-IMP-036K-003 — Explicit add
Cart contents and variant selection change only after the customer uses the recommendation action or the existing customization confirmation.
Viewing the group does not add, swap, or preselect a paid modifier.
Proof later: component and browser interaction.

XR-IMP-036K-004 — Configuration handoff
When the item needs choices, the existing customization interaction is what the customer sees next.
The recommendation does not present a shortened form that skips required choices or preselects a paid modifier.
Proof later: customization journey.

XR-IMP-036K-005 — Loading and perceived performance
Defined in section 14.

XR-IMP-036K-006 — Zero-result state
When no eligible candidate exists, no weak item is shown to fill the maximum.
The customer sees the primary surface without a recommendation error.
An empty cart shows no recommendation group.
Proof later: empty-state QA.

XR-IMP-036K-007 — Fail-open and network state
When generation or ranking fails, or the network prevents a set, no blocking recommendation error is shown.
Product, Cart, Checkout, and Payment remain usable.
Proof later: failure handling in the integrated UI.

XR-IMP-036K-008 — Stale candidate recovery
A refused add uses the existing calm commerce recovery.
The rest of the cart remains in front of the customer.
The customer can continue toward checkout.
Proof later: recovery QA.

XR-IMP-036K-009 — Removal and suppression experience
Removal uses the ordinary cart removal interaction.
Afterward, that candidate is not offered again in recommendation groups for that cart or session.
The copy and announcements do not say the item disappeared from the menu.
The customer can still find it in Menu or Product when catalog truth says it is there.
Proof later: cart and menu continuity.

XR-IMP-036K-010 — Conditional Popular language
The word Popular is shown only for an item that passed the Product Definition evidence rule.
Otherwise the item uses neutral copy and is not called Popular.
Proof later: content QA with evidence present and evidence absent.

XR-IMP-036K-011 — Workforce configuration clarity
An authorized operator can see the product or category relationship, its Product Detail and Cart placements, relative priority, optional effective period, and whether it is active.
The experience does not ask the operator to place that relationship on Customization or to name a variant or modifier target.
The customer Customization experience remains “Make it yours”, with at most one existing variant upgrade and two existing add-ons, chosen explicitly.
The experience makes clear that disabling stops new use of that relationship and leaves lines already in carts.
An unauthorized or cross-scope attempt uses the existing denial pattern and does not present another scope's configuration as editable.
Proof later: workforce UI QA. Exact permission binding waits for Architecture Fit.

XR-IMP-036K-012 — Responsive and mobile
Defined in section 14.

XR-IMP-036K-013 — Keyboard and focus
Defined in section 14.

XR-IMP-036K-014 — Semantics and announcements
Defined in section 14.

XR-IMP-036K-015 — Content and trust
Defined in section 12.

XR-IMP-036K-016 — Holdout invisibility
A holdout session shows no recommendation module, no holdout label, and no explanatory message on Product Detail, Customization, or Cart.
Catalog, prices, and checkout look like ordinary ordering without recommendations.
Proof later: paired session check against a session that may receive recommendations.
```

## Traceability to product and discovery

| Experience rule | Product rule | Discovery source |
|---|---|---|
| Secondary optional modules | `BR-036K-005`, placement table | RRD-02 |
| Explicit add and customization handoff | `BR-036K-001`, `BR-036K-008`, `BR-036K-009` | RR-US-070, RR-US-071, RR-US-080 |
| Empty cart and zero results | `BR-036K-006` | RRD-06 |
| Fail-open | `BR-036K-010` | RR-US-100, RR-US-101 |
| Stale recovery | `BR-036K-011` | RR-US-091 |
| Removal without menu deletion | `BR-036K-012`, `BR-036K-013` | RRD-03 |
| Popular wording, owned here | Evidence permission is `BR-036K-019`, `BR-036K-020`. The word itself is this document. | RRD-01 |
| Hidden priority and margin | `BR-036K-026` product non-visibility. Exact forbidden phrases are this document. | RRD-05 |
| Headings and neutral fallback, owned here | Product owns cardinality and false-claim boundaries in `BR-036K-026`. | RRD-02, RR-US-312 |
| Future Drop wording only | `BR-036K-024`, `BR-036K-025` | RRD-05; not a V1 dependency |
| Holdout silence, owned here | Product policy is `BR-036K-023`. Exact silence is `XR-IMP-036K-016`. | RRD-04, RR-US-321 |
| Customization upgrades and add-ons | `US-036K-002`, `BR-036K-009`, `BR-036K-031` | RR-US-010, RR-US-020. Existing customization authority. |
| Workforce clarity | `BR-036K-021`, `BR-036K-022`, `BR-036K-031` | RR-US-200, RR-US-201, RR-US-211, RR-US-212. Relationship placements are Product Detail and Cart. |
