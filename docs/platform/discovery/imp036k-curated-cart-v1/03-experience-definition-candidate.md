<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "NONE",
  "capability": "IMP-036K",
  "experienceDefinitionVersion": "XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1",
  "productDefinition": "PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1",
  "productDefinitionGate": "NOT_GRANTED",
  "experienceCriticality": "X3",
  "experienceGate": "NOT_GRANTED",
  "experienceGateExecution": "NOT_PERFORMED",
  "implementationAuthorized": false,
  "doNotMerge": true
}
-->

# IMP-036K V1 Curated Cart — Experience Definition Candidate

```text
EXPERIENCE_DEFINITION_VERSION = XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1
AUTHORITY = NONE
STATUS = CANDIDATE
OLD_GATE_APPROVALS_NOT_AUTOMATICALLY_TRANSFERRED = YES
NEW_PRODUCT_DEFINITION_GATE = NOT_GRANTED
NEW_EXPERIENCE_GATE = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
DO_NOT_MERGE = YES

CAPABILITY = IMP-036K
LINKED_PRODUCT_CANDIDATE = PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1
LINKED_PRODUCT_CANDIDATE_GRANTED = NO
EXPERIENCE_CRITICALITY = X3
EXPERIENCE_GATE_EXECUTION = NOT_PERFORMED
EXPERIENCE_GATE = NOT_GRANTED
FOUNDER_EXPERIENCE_UAT = NOT_PERFORMED
OPEN_EXPERIENCE_DECISIONS = NONE
DESIGN_READINESS = NOT_PERFORMED
MEASUREMENT_PLAN = NOT_PERFORMED
EXPERIMENT_ACTIVATION = NO

HISTORICAL_EXPERIENCE_DEFINITION = XD-IMP-036K-DRAFT-1
HISTORICAL_EXPERIENCE_GATE = PASS
HISTORICAL_EXPERIENCE_GATE_HEAD = 072932df00c445c8215c61f19f81971bf657b160
HISTORICAL_SCOPE_REMAINS_HISTORICAL = YES
THIS_CANDIDATE_DOES_NOT_REPLACE_HISTORICAL_XD = YES

X_SCALE_ORTHOGONAL_TO_CR_SCALE = YES
X_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
RAW_BACKEND_LANGUAGE_TO_CUSTOMER = PROHIBITED
NEW_COMMERCIAL_CAPABILITY_INTRODUCED = NO
```

This document is an experience amendment **candidate** for a small optional shelf on Cart.
It has no authority. It does not grant the Experience Gate, does not grant the Product
Definition Gate, and does not authorize implementation or merge.

`XD-IMP-036K-DRAFT-1` Experience Gate PASS at
`072932df00c445c8215c61f19f81971bf657b160` stays historical for that earlier scope. This
candidate does not transfer that PASS. It does not carry the Product Detail recommendation
module or the Customization-as-recommendation module into this V1 cart shelf.

The linked product candidate is `PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1`. That product
candidate is not granted. Experience here follows the Founder cart-shelf contract and does
not add a commercial capability the product candidate does not already contain.

McDelivery is behavioral inspiration only: a small add-on shelf on the cart. This candidate
does not copy its trademarks, images, words, or layout.

## 1. Experience Intent

The customer is on Cart, reviewing the order they already chose, and deciding whether to
continue to Checkout. The shelf helps them notice a few optional extras they can add before
they continue. They should understand that the shelf is optional, that each price is the real
price, and that ignoring every card leaves the order and the path to Checkout unchanged.

Trust outcome: calm and reversible. Nothing is added until the customer uses the card action
and existing Cart accepts it. A missing shelf never becomes a reason the order cannot proceed.

Operator intent, at the level this candidate owns: an authorized person can choose which items
appear, turn an item on or off, set the order they appear in, and turn the shelf on or off,
using the menu administration they already have. This candidate does not design a new
administration product. Operator presentation is deferred to Design Readiness. That deferral
is not a customer-gate blocker beyond those four configuration outcomes.

Experience Intent:

> Help a customer notice up to four optional extras on Cart, add one only by a deliberate
> action through the cart they already use, and continue to Checkout whether or not they add
> anything.

Customer mental model:

> “A little extra I can add if I want. My order is already here, and I can go to Checkout
> without taking any of these.”

Operator mental model:

> “I choose shelf items, turn each one on or off, set their order, and turn the shelf on or
> off in the menu administration I already use.”

## 2. Identity

| Field | Definition |
|---|---|
| Capability | IMP-036K — cart shelf amendment candidate only |
| Experience candidate | `XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1`; `STATUS = CANDIDATE`; `AUTHORITY = NONE` |
| Linked product candidate | `PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1`; gate `NOT_GRANTED` |
| Experience Criticality | `X3`. The shelf sits on Cart during ordering and can affect conversion, basket value, and trust. |
| Experience Gate | `EXPERIENCE_GATE_EXECUTION = NOT_PERFORMED`. `EXPERIENCE_GATE = NOT_GRANTED`. |
| Founder Experience UAT | `NOT_PERFORMED`. This candidate does not record a Founder verdict. |
| Process anchors | PD-2 / EXP-1 / LANG-1 / TEST-1. Language follows LANG-1. Proof policy stays in TEST-1. |
| Historical experience | `XD-IMP-036K-DRAFT-1` remains the historical experience definition for its previous scope. |

Change Risk stays on its own scale. This candidate does not reclassify it and does not map `X3`
onto an agent execution level.

## 3. User goals and questions

| Person | Goal | Question the experience must answer |
|---|---|---|
| Customer with items already in Cart | See a few optional extras, add one if it is wanted, and continue | “Is this optional, is this the real price, and can I check out without it?” |
| Customer whose Cart is empty | Get back to the menu and start an order | “The shelf should not be here. Where do I start?” |
| Customer who needs to change a choice | Open the customization they already know, then return | “Did this add it already, or am I still choosing?” |
| Customer when the shelf cannot be shown | Keep using Cart, coupons, Checkout, and Payment | “Can I still order?” |
| Operator | Select items, enable or disable an item, set priority, enable or disable the shelf | “Did I change what customers can be offered, without a new admin tool to learn?” |

## 4. Evidence, assumptions, and research class

Evidence is named at its real class. None of it is customer research, and none of it is a
controlled experiment.

| Statement | Class | Evidence | Risk if over-read | Validation |
|---|---|---|---|---|
| The live Cart page title is “YOUR CART”. Empty Cart says “Your cart is empty. Browse the menu to add something.” Continuation says “Checkout” while work is in progress and “Continuing…” while it is pending. Menu add control uses “Add {name}” and “Adding…”. Customization opens as “Customize {name}”. | `FACT` | Read of current Cart and menu presentation in this worktree. | Treating current layout geometry as the shelf design. | Design Readiness reuses the words and the existing flows. It does not copy a third-party layout. |
| A small optional shelf on Cart is the intended V1 placement. | `PRODUCT_DECISION` | Founder contract for this batch. | Expanding the shelf onto other pages. | Product candidate grant. This experience candidate does not grant it. |
| “A little extra?” reads as an optional invitation and does not claim popularity, savings, or scarcity. | `ASSUMPTION` | `FOUNDER_HEURISTIC_REVIEW` | The heading could still sound like a nudge the customer cannot refuse. | Content QA and Founder Experience UAT. |
| Showing nothing when the shelf has no eligible item is clearer than an apology or an error. | `ASSUMPTION` | `FOUNDER_HEURISTIC_REVIEW` | A later empty-state sentence could be read as an ordering failure. | `XR-036K-CC-004` and Founder Experience UAT. |
| Moving focus to the nearest remaining shelf or Cart control, without jumping to the top, keeps the customer oriented. | `HYPOTHESIS` | `FOUNDER_HEURISTIC_REVIEW` | A poor focus target could still disorient keyboard and screen-reader users. | `XR-036K-CC-001` in Experience QA. |
| A small add-on shelf on the cart is a useful behavioural reference. | `FOUNDER_HEURISTIC_REVIEW` | Founder direction. Not customer research. | Copying another brand’s assets or layout. | This candidate forbids that copy. |

`CUSTOMER_USABILITY_RESEARCH`, `PRODUCTION_BEHAVIOURAL_DATA`, and `CONTROLLED_EXPERIMENT` are
not claimed.

## 5. Current-state experience

Today the customer reviews the order on Cart. The page is titled “YOUR CART”. Lines show the
item, its choices, a price, quantity controls, and remove. Coupons and the order summary sit
with that review. “Checkout” continues. An empty Cart explains that it is empty and offers
“Back to menu”. There is no extra shelf.

Menu already distinguishes a direct add (“Add {name}”, busy “Adding…”) from opening
customization (“Customize {name}”). Prices use the existing money presentation. Failure copy
already in ordering includes “That item is temporarily unavailable.”, “Your cart changed.
Refresh and try again.”, and “Something went wrong. Please try again.”

That current Cart is the primary task. The shelf is a secondary region on the same page.

## 6. Desired journey

1. The customer opens Cart with at least one item already in the order.
2. Cart lines, quantities, remove, coupons, and Checkout are usable immediately.
3. When the shelf is enabled, the feature is available, the Cart menu read already has an
   authoritative outlet, and at least one eligible item exists, the customer sees the heading
   “A little extra?” and one to four cards. In V1 that outlet is the delivery-serviceable outlet
   already used by the Cart menu read. A Pickup cart, and any cart with no such outlet, shows no
   shelf. Cart and Checkout stay usable.
4. The customer may ignore the shelf and continue to Checkout and Payment.
5. The customer may activate one card. “+” direct-adds only when that projected row has no
   modifier groups, using the same payload the menu add already sends (`variantId`, quantity 1,
   `expectedRevision`, no modifiers). Any modifier group opens existing customization. The
   control is not presented as a completed add. Zero-price defaults are not direct-added ahead
   of that dialog.
6. Customization does not arrive with a paid extra already selected, and it does not switch the
   item to a different variant on the customer’s behalf.
7. After existing Cart accepts the add, that card disappears. Focus moves as in
   `XR-036K-CC-001`. Scroll position stays where the customer was.
8. If the add fails, the Cart conflicts, or the customer cancels customization, and the parent
   is still eligible, the card stays. If a fresh read finds the parent no longer curated, no
   longer on the effective menu, or unavailable, the card is absent. That absence is not a
   successful add and does not add a reject inside `addCartLine`.
9. The customer continues with quantities, remove, coupons, Checkout, and Payment throughout.
10. An empty Cart shows the existing empty-Cart explanation and no shelf.
11. An operator changes shelf membership, item on/off, priority, or shelf on/off through existing
    menu administration. The customer sees only the resulting shelf, or no shelf.

This is not a new step between Cart and Checkout. Checkout Review, Payment, Confirmation, and
My Orders do not gain this shelf. Menu does not become a shelf. Product Detail does not gain a
recommendation module. Customization is opened only as the existing customization interaction
when a card requires it. It is not a recommendation module on the customization screen.

## 7. Entry and discoverability

The shelf is discoverable in one place: Cart / Your Order, before Checkout and Payment. The
current customer page title remains “YOUR CART”. This candidate does not rename that page.

The shelf is present only when all of the following are true:

- Cart already has an item.
- The shelf is enabled.
- The feature is available.
- The Cart menu read already has an authoritative outlet. In V1 that is the delivery-serviceable
  outlet only. Pickup does not supply it on Cart, and this experience does not add an outlet
  selector.
- At least one eligible item remains to show.

Any other case shows no shelf region, no heading, and no explanation. The customer is not told
to wait for the shelf before Checkout.

No badge, interstitial, or second entry is added on Menu, Product Detail, Checkout Review,
Payment, Confirmation, or My Orders. An item that appears on the shelf may still appear on the
menu. Adding that same item from the menu hides its shelf card and leaves the menu item in place.

## 8. Information architecture and hierarchy

Cart stays one page. The shelf is a region on that page, not a route and not a step.

| Order on Cart | What the customer sees | What stays out of this region |
|---|---|---|
| 1. Primary | “YOUR CART”, the items already in the order, quantity, remove | Shelf cards above the order the customer already made |
| 2. Secondary | Heading “A little extra?” and at most four cards | A fifth card, filler, strategy, margin, or a reason the item was chosen |
| 3. Existing support | Coupons and the order summary, in their existing roles | A shelf that replaces coupons or the order summary |
| 4. Continuation | “Checkout” | A shelf the customer must clear before Checkout |

The shelf sits with the order review, after the items already in the order and before the
customer commits to Checkout. Exact spacing beside coupons is Design Readiness, provided the
shelf remains on Cart, before Checkout and Payment, and never becomes a gate.

Each card, in reading order: product image, item title, authoritative price, one action.
The price is the price already published by existing price authority for that item. The card
does not compute a price and does not show a shelf-specific price.

## 9. Interaction, mental model, and cognitive load

The customer’s model is: these cards are optional extras for the order already on the page.
One action per card. The order of the remaining cards stays stable.

| Situation | What the customer experiences |
|---|---|
| Projected row has no modifier groups | “+” performs the same direct add the menu row would, with no modifiers. The accessible name is an add. |
| Projected row has any modifier group | The control opens existing customization. Its name is a customize action. It is not named as if the item were already added. Zero-price defaults are not direct-added ahead of that dialog. |
| Paid extra | Customization opens with no paid extra preselected. The customer selects it in that existing interaction, or does not. |
| Variant | The experience does not silently switch variants. A different variant is chosen only through the existing customization interaction. |
| Add accepted | The card disappears. The item is an ordinary Cart line. The next eligible parent, in configured priority, may appear. Cards that were already showing keep their relative order. |
| Add failed, Cart conflict, or customization cancelled, parent still eligible | The card remains. Cart is unchanged by that attempt. |
| Fresh read: no longer curated, off the effective menu, or unavailable | The card is absent. That is not a successful add. |
| Quantity change or partial removal | The card stays hidden while any variant of that item remains in the order. |
| Full removal | When every line of that parent is gone, the card may return only if it is still curated, still on the effective menu, and still available. |
| Same item added from the menu | The shelf card hides. The menu item stays on the menu. |
| Fewer than four eligible items | Show that many cards. Leave the rest of the row empty of placeholders. |
| No eligible item, no authoritative outlet, shelf off, or feature unavailable | Show nothing. Pickup without the delivery-serviceable outlet is this row. |

Cognitive load stays small: one short heading, at most four cards, one action each, and the
existing Cart controls still do their existing jobs. The shelf does not ask the customer to
rank, compare margins, or finish a wizard.

Pending, success, and failure are visible states of a card that is still eligible. Pending
belongs to the action the customer used. Success removes the card only after Cart has accepted
the add. A failed add, a Cart conflict, or cancelled customization leaves that card and uses
the calm recovery language Cart and ordering already use. A fresh read that finds the parent
ineligible removes the card as absence, not as success.

### Focus recovery

`XR-036K-CC-001` is the testable rule.

When the activated card disappears after a successful add, move focus to the first control that
exists in this order:

1. The action on the replacement card, if another eligible item fills that same slot.
2. Otherwise the next remaining shelf action, in the shelf’s stable order.
3. Otherwise the Cart line that was just added, or the Checkout continuation.

Focus does not move to the top of the page. Scroll position is preserved.

When the card stays because the add failed, the Cart conflicted, or customization was cancelled,
focus returns to that card’s action. When a fresh read removes the card because the parent is
ineligible, focus moves as in the disappearance order above and does not jump to the top of the
page. Scroll position is preserved.

## 10. Friction

| Friction | Class | Experience choice |
|---|---|---|
| Seeing up to four optional cards while reviewing the order | Necessary, if the shelf stays secondary | Keep. `XR-036K-CC-002`, `XR-036K-CC-003` |
| Requiring “+” or an explicit customization confirmation before Cart changes | Protective | Keep. A paid extra is not preselected. |
| Opening existing customization when the item still needs a choice | Necessary | Keep. The control is named as customize, not as a finished add. |
| Leaving the card when the add fails or customization is cancelled, and dropping it when the item is no longer eligible | Protective | Keep. `XR-036K-CC-005`. An ineligible item is absent, not a failed add that still looks offered |
| Hiding the card while any variant of that item remains, including after a menu add | Protective against offering an item the order already contains | Keep. The menu still shows the item. |
| A blocking error, spinner, or retry that holds Checkout until the shelf succeeds | Accidental | Do not use. Cart, quantities, remove, coupons, Checkout, and Payment stay usable. |
| Filler cards so the row looks full | Accidental | Do not use. `XR-036K-CC-004` |
| An apology, outage banner, or compulsory upsell when the shelf is empty or off | Accidental | Do not use. Show nothing. |
| Reshuffling the cards that are still visible when one slot changes | Accidental | Do not use. Survivors keep their order. |
| Moving focus to the top of the page | Accidental | Do not use. `XR-036K-CC-001` |
| Fake scarcity, savings, popularity, or margin language | Accidental and trust-breaking | Do not use. |

## 11. Service and operational blueprint

The customer promise is modest: optional items on Cart, at the real price, added only when the
customer completes an add that existing Cart accepts. There is no new promise about preparation
time, pickup, delivery, or payment. There is no promise of availability or price before an
authoritative outlet already exists. A brand-only menu price is not that promise. A card is not
shown from a guessed Pickup outlet.

```text
CUSTOMER PROMISE
  Optional extras on Cart, real price, easy to ignore
        ↕
SYSTEM TRUTH
  Existing price authority, existing Cart add, existing customization
        ↕
WORKFORCE ACTION
  Select an item, enable or disable that item, set its priority,
  enable or disable the shelf, in existing menu administration
        ↕
OPERATIONAL CAPABILITY
  Menu administration the operator already has
```

If an item is not eligible, the customer sees absence, not a card that looks buyable and then
fails as the normal case. If the operator turns the shelf off, or turns an item off, customers
stop seeing that presentation. Items already in Cart stay in Cart. No new labour step is
required to fulfil a shelf add; it is an ordinary Cart line after a successful add.

Operator screens are not specified here. Design Readiness owns how those four outcomes are
presented. Until then, the customer experience depends only on the outcomes, not on a new
admin layout.

## 12. Content

LANG-1 applies. The shelf uses ordering tone: clear, concise, and lightly branded. Failure and
stale recovery stay calm, direct, and recovery-oriented. Playful copy stays out of a refused
add. Checkout and Payment words stay as they are, because those surfaces do not host the shelf.

Customer words:

| Moment | Words |
|---|---|
| Shelf heading | A little extra? |
| Direct-add control, visible | + |
| Direct-add accessible name | Add {item name} |
| Direct-add pending | Adding… |
| Needs a choice, accessible name | Customize {item name} |
| Price | The same exact money presentation Cart and Menu already use for that item |
| Success | No shelf-specific celebration. The item appears in the order as a normal Cart line. |
| Failure or stale | The existing ordering sentence for that refusal, such as “That item is temporarily unavailable.”, “Your cart changed. Refresh and try again.”, or “Something went wrong. Please try again.” |
| Cancelled customization | No new sentence. The card remains. |
| Empty Cart | The existing sentence: “Your cart is empty. Browse the menu to add something.” |
| Shelf absent | No sentence. |
| Checkout | The existing “Checkout” and “Continuing…” |

The heading is a suggestion the customer can ignore. It is not a claim that the item is popular,
discounted, scarce, or personally chosen.

Forbidden customer words and claims on this shelf:

- SKU, parent product, recommendation engine, holdout, impression, variant id, or any raw
  status code
- Popular, trending, recommended for you, frequently bought together
- Contribution, margin, commercial priority, or any sentence about why the business benefits
- A savings amount, a strikethrough price invented by the shelf, a countdown, or “only a few left”
- Copy that treats a shown card as a purchase already made
- A compulsory-upsell sentence, including any line that says the customer must add something
  before Checkout

Operator language may say item, on, off, priority, and shelf, in the words menu administration
already uses. Those operational words are not copied into the customer shelf. Customers do not
see priority as a reason.

## 13. UX states

| State | What the customer gets |
|---|---|
| Default / ready | Cart first. Then “A little extra?” and one to four cards. Checkout remains available. |
| Pending | The activated action shows “Adding…” only when a direct add is in progress. Customization uses its existing pending behaviour. Checkout is not held for the shelf. |
| Success | Existing Cart acceptance. The card disappears only then. Focus follows `XR-036K-CC-001`. |
| Failure | The card stays while the parent is still eligible (`XR-036K-CC-005`). Recovery copy is the existing ordering sentence. Ordering continues. |
| No longer eligible | The card is absent. The shelf does not announce a successful add and does not silently substitute a different item. |
| Empty Cart | Existing empty-Cart content. No shelf. |
| Empty shelf | No region. This covers curated items that are all ineligible, a cart with no authoritative outlet, a Pickup cart under the V1 limitation, a disabled shelf, and an unavailable feature. |
| Loading | Cart lines, quantity, remove, coupons, and Checkout stay usable. The shelf does not reserve four blank cards. |
| Unavailable | Same as empty shelf. No blocking error. |
| Recovery | The customer remains on Cart, at the same scroll position, and can retry that card or continue. |
| Disabled shelf or disabled item | The customer sees absence, not a disabled-card tombstone. |
| Destructive confirmation | No extra confirmation for the shelf. Remove and clear-cart keep their existing Cart behaviour. |
| Concurrency / conflict | Existing “Your cart changed. Refresh and try again.” The card remains if the add did not succeed. |

## 14. Responsive, mobile, accessibility, and perceived performance

Mobile and desktop share the same content rules, the same four-card ceiling, and the same
heading. A narrow viewport may scroll inside the shelf so the customer can reach all of the
cards that are actually shown. That scroll does not reveal a fifth card. The existing mobile
Checkout bar remains usable. The shelf does not cover it, replace it, or require dismissal.

Desktop keeps the shelf on the Cart review, secondary to the items already in the order, and
does not replace “Order summary” or “Checkout”.

Keyboard users can reach every visible shelf action and can also reach quantity, remove,
coupons, and Checkout without activating a card. Focus is not trapped in the shelf. Focus
recovery follows `XR-036K-CC-001`.

Screen readers get the region name from the heading “A little extra?”. Each card exposes the
item name, the price, and either add or customize. A shown card is not announced as a purchase.
Removing a card after a successful add uses the ordinary Cart-add announcement and does not say
the item was removed from the menu. An absent shelf is not announced as an error.

Perceived performance: a slow or failed shelf never freezes Cart or the path to Checkout and
Payment. The page does not jump when the shelf arrives, fails, or loses a card. Empty slots are
not reserved while the shelf loads, because reserved blanks would read as filler.

## 15. Design-system reuse

| Need | Reuse |
|---|---|
| Card image, title, and price | The existing menu-item presentation, if Design Readiness confirms it can show those three plus one action. |
| Direct add | The existing Cart add action and “Adding…” pending word. |
| Choice required | The existing customization dialog, titled “Customize {name}”. |
| Price display | The existing money presentation. The shelf does not calculate its own price. |
| Refusal | The existing ordering recovery sentences. |
| Remove and quantity | The existing Cart line controls. They decide when a card may return. |
| Operator outcomes | Existing menu-administration patterns for selecting an item, turning it on or off, ordering it, and turning a shelf on or off. |
| New modal, toast, countdown, or badge | No new pattern is justified by this candidate. |

Component geometry, breakpoints, and visual states belong to Design Readiness. This candidate
does not pass Design Readiness.

## 16. Trust

EXP-1 and LANG-1 prohibit fake scarcity, false countdowns, misleading savings, hidden mandatory
charges, preselected paid extras, and a misleading action hierarchy.

This shelf stays secondary to the order already in Cart. The heading does not claim a deal.
The price is the authoritative price. “+” adds only when the item can be added directly.
Otherwise the customer is taken into customization, with no paid extra already selected and no
silent variant change. Priority, contribution, and margin are never customer-facing reasons.
A card that was only shown is not treated as bought.

An absent shelf is quiet. The customer is not told they are missing out, and they are not told
they are in a special group. There is no compulsory upsell.

## 17. Measurement intent

Measurement intent is observational and lightweight. This candidate does not activate an
experiment, does not assign customers to different experiences, and does not authorize
instrumentation implementation.

Business intent: see whether customers sometimes add an optional Cart extra, and whether Cart,
Checkout, and Payment still work when the shelf is present, absent, or failed.

Primary observational signal: a shelf add that existing Cart accepts. A shown card is not that
signal.

Secondary observational signals:

- a shelf action activated on a card that was actually rendered
- customization opened from a shelf card
- Checkout continuation from a Cart where the shelf was actually rendered

A server shelf response is not one of these signals and is not “shelf shown.”

Guardrail to watch, not a launch gate owned by this candidate: customers can still change
quantities, remove items, use coupons, and reach Checkout and Payment when the shelf is missing
or has failed.

Meanings that would matter later, if a measurement plan is separately authorized:

| Meaning | When it would be recorded | Not this |
|---|---|---|
| Eligible shelf response | The server built a response with at least one eligible card | A rendered shelf, an impression, or exposure |
| Shelf shown | The heading and at least one card are actually rendered to the customer | A server response, a hidden shelf, or a failed shelf |
| Action activated | The customer activates “+” or the customize control on a rendered card | A purchase, or the server response alone |
| Add succeeded | Existing Cart accepts the add that this attempt started from the shelf | An impression, or a menu add |
| Add failed or customization cancelled | The attempt ends without a Cart change | A reason to block Checkout |
| Checkout continued | The customer continues with the existing Checkout action | Proof the shelf caused the order |

Identity, schema, deduplication, retention, and privacy boundaries are not defined here. They
belong to a later measurement plan. That plan is `NOT_PERFORMED`. Events must not carry payment
details, private eligibility, margin, or a raw internal identifier as customer content.

Causal limit: these observations cannot prove incremental profit or that the shelf caused the
order. Insufficient observation is insufficient evidence. It is not a winner.

Experimentation: `EXPERIMENT_ACTIVATION = NO`. A future experiment would need its own
hypothesis, assignment, control, guardrails, stop rule, and authorization under EXP-1. This
candidate does not start one, and it does not show the customer any sentence about a suppressed
shelf.

## 18. Experience QA, Content QA, and Founder Experience UAT

Experience QA, when implementation later exists, checks that the approved interaction is the one
customers get:

- The shelf appears only on a non-empty Cart, before Checkout, only when an authoritative outlet
  already exists for the Cart menu read, and only with eligible items. In V1 that outlet is the
  delivery-serviceable outlet. Pickup without it shows no shelf.
- Empty Cart has no shelf.
- Ignoring the shelf still reaches Checkout and Payment.
- At most four cards are reachable, including by scrolling on a narrow viewport.
- A successful add removes only that card and restores focus as in `XR-036K-CC-001`.
- A failed add, a Cart conflict, and cancelled customization leave the card while the parent is still eligible. A fresh read that finds the parent no longer curated, no longer on the effective menu, or unavailable removes the card as absence.
- Quantity changes and partial removal keep the card hidden while any variant of that item remains.
- Removing every line of that item may bring the card back when it is still eligible.
- Adding the same item from the menu hides the shelf card and leaves the menu item visible.
- A missing or failed shelf does not block quantities, remove, coupons, Checkout, or Payment.

Content QA checks the words:

- The heading is “A little extra?”.
- Customer copy contains none of the forbidden words in section 12.
- The price matches the existing price presentation and is not a shelf-computed price.
- The accessible name says add only for a direct add, and customize when customization opens.
- Empty and failed shelves have no error sentence and no upsell sentence.
- Recovery sentences are the existing ordering sentences.

Founder Experience UAT is `NOT_PERFORMED`. Only the Founder can give that verdict. When it is
later performed, `FOUNDER_UAT = FUNCTIONAL_UAT + EXPERIENCE_UAT`. The experience portion should
cover discoverability, first impression, whether the shelf feels optional, price trust, add
versus customize, recovery, focus and scroll, mobile behaviour, and brand coherence with Cart.
This candidate does not record a pass.

## 19. Experience Gate

The checklist below records that this candidate addresses each EXP-1 question. Addressing a
question in a candidate is not gate execution.

```text
EXPERIENCE_GATE
EXPERIENCE_GATE_EXECUTION = NOT_PERFORMED
EXPERIENCE_GATE = NOT_GRANTED
NEW_EXPERIENCE_GATE = NOT_GRANTED
Experience Intent defined: ADDRESSED_IN_CANDIDATE
User goal understood: ADDRESSED_IN_CANDIDATE
Entry / discoverability defined: ADDRESSED_IN_CANDIDATE
End-to-end journey defined: ADDRESSED_IN_CANDIDATE
Information architecture defined: ADDRESSED_IN_CANDIDATE
Information hierarchy defined: ADDRESSED_IN_CANDIDATE
Primary interaction defined: ADDRESSED_IN_CANDIDATE
Mental model / cognitive load considered: ADDRESSED_IN_CANDIDATE
Friction reviewed: ADDRESSED_IN_CANDIDATE
Trust-sensitive moments considered: ADDRESSED_IN_CANDIDATE
Content strategy defined: ADDRESSED_IN_CANDIDATE
Error / recovery defined: ADDRESSED_IN_CANDIDATE
Mobile / responsive defined: ADDRESSED_IN_CANDIDATE
Accessibility considered: ADDRESSED_IN_CANDIDATE
Service / operational promise aligned where applicable: ADDRESSED_IN_CANDIDATE
Performance experience considered: ADDRESSED_IN_CANDIDATE
Measurement intent defined: ADDRESSED_IN_CANDIDATE
Research / evidence level disclosed: ADDRESSED_IN_CANDIDATE
Unresolved experience decisions: NONE
Result: NOT_PERFORMED
FOUNDER_EXPERIENCE_UAT = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
DO_NOT_MERGE = YES
```

## 20. Open experience decisions

```text
OPEN_EXPERIENCE_DECISIONS = NONE
```

Operator screen layout is deferred to Design Readiness. The customer experience needs only the
configuration outcomes already named: select an item, enable or disable that item, set priority,
and enable or disable the shelf. That deferral does not leave a customer experience decision open.

## 21. Experience requirements

These five requirements are the testable experience checks for this candidate. They do not add
product rules.

```text
XR-036K-CC-001 — Focus recovery
After a successful add removes the activated card, focus moves to the replacement card’s action
if one fills that slot, otherwise to the next remaining shelf action, otherwise to the Cart line
that was added or to Checkout.
Focus does not move to the top of the page.
Scroll position is preserved.
If the add fails, the Cart conflicts, or customization is cancelled, and the card remains,
focus returns to that same card’s action, and the page does not jump to the top.
If a fresh read removes the card because the parent is ineligible, focus follows the
disappearance order above.

XR-036K-CC-002 — Four-card ceiling
The shelf shows at most four product cards.
A narrow viewport may scroll to reach those cards and must not reveal a fifth.
Fewer eligible items produce fewer cards.

XR-036K-CC-003 — Heading
When the shelf is shown, its heading is “A little extra?”.
The heading does not claim popularity, savings, scarcity, or that the customer must choose one.
When the shelf is not shown, the heading is absent.

XR-036K-CC-004 — No filler
The shelf never pads to four with placeholders, unavailable stand-ins, or repeated items.
An empty Cart shows no shelf.
A shelf with nothing eligible, a cart with no authoritative outlet, a disabled shelf, or an
unavailable feature shows nothing, and Cart, quantities, remove, coupons, Checkout, and Payment
remain usable.
No error or upsell sentence blocks ordering.

XR-036K-CC-005 — Failure keeps an eligible card
The card disappears after existing Cart accepts the add.
A failed add, a Cart conflict, or a cancelled customization leaves the card in place while
the parent is still eligible.
A fresh read that finds the parent no longer curated, no longer on the effective menu, or
unavailable removes the card as absence. That removal is not a successful add and does not
add a reject inside addCartLine.
The next eligible parent may appear only after a card has actually left, in configured
priority, without reordering the cards that remain.
```

## 22. Capability boundary

This candidate introduces no new commercial capability. It specifies how a customer sees and
uses a cart shelf whose behaviour is already limited to:

- placement on Cart / Your Order only, before Checkout and Payment
- at most four eligible items, fewer when fewer are eligible, none when none are eligible
  or when V1 has no authoritative delivery outlet on Cart
- one action that either adds through existing Cart or opens existing customization
- the existing price authority, shown only with that outlet
- existing Cart quantity, removal, coupon, Checkout, and Payment behaviour

It does not create a discount, a price, a payment method, a fulfilment promise, a Cart outlet
selector, an experiment, an admin product, or a recommendation module on any other page.
