# IMP-036K V1 — Independent review dispositions

```text
AUTHORITY = NONE
STATUS = CANDIDATE
OLD_GATE_APPROVALS_NOT_AUTOMATICALLY_TRANSFERRED = YES
NEW_PRODUCT_DEFINITION_GATE = NOT_GRANTED
NEW_EXPERIENCE_GATE = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
DO_NOT_MERGE = YES
REVIEW_GRANTS_A_GATE = NO
```

Independent read-only review of the integrated package. The reviewer did not edit files. This note records the findings and the repairs made afterward.

Reviewer: [Independent scope package review](eb48d6c4-5bd4-4113-8785-2e87a6fbf272).

## 1. Challenge results

| # | Question | Result |
|---|---|---|
| 1 | Curated menu view, not a second catalog | Holds |
| 2 | Parent must not appear on the shelf while any variant is in the Cart | Holds. The main menu may still show it |
| 3 | Main-menu add hides the shelf card | Holds |
| 4 | Full removal restores eligibility only when still curated, on the effective menu, and available | Holds after the exclusion-matrix repair |
| 5 | Next priority product appears without reshuffling survivors | Holds |
| 6 | Plus does not cause an unwanted paid selection | Holds after the direct-add repair |
| 7 | Menu and Cart remain the commercial authorities | Holds |
| 8 | Curation is not an offer or pricing system | Holds |
| 9 | Purchased-unit provenance is deferred; a client flag is not proof | Holds |
| 10 | Old Product Detail and Customization recommendation obligations are removed from V1; historical PASS stays | Holds |
| 11 | B3S-M1 is not a V1 dependency; PR #465 was not closed | Holds |
| 12 | Canonical PD, XD, capability architecture, decision register, ROADMAP, and STATE were not edited | Holds |
| 13 | Candidates can go to Founder gate review, and the gates stay not granted | Holds after the repairs below. The gates remain `NOT_GRANTED` |

Code checks used by the review: Cart lines are variant-scoped. `validateCartLineStructure` does not check assortment or availability. The live menu row direct-adds only when `modifierGroups.length` is 0.

## 2. Repairs

| Finding | Repair |
|---|---|
| Experience text left a stale card in place while the product candidate excluded an ineligible parent | Experience steps, states, focus, QA, and `XR-036K-CC-005` now split the outcomes. Failure, conflict, or cancel keeps an still-eligible card. A fresh ineligible read removes the card as absence and does not add an `addCartLine` reject. |
| Direct-add wording was “unambiguous” in the product and experience candidates and “no modifier groups” in the architecture note | All of those candidates now say: direct-add only when the projected row has no modifier groups, with the menu payload (`variantId`, quantity 1, `expectedRevision`, no modifiers). Any modifier group opens existing customization. Zero-price defaults are not submitted ahead of that dialog. |
| Empty-Cart acceptance row said the shelf was not required | It now says no shelf is shown. |
| Exclusion matrix omitted the restore conditions | Reappearance requires the parent to stay curated, on the effective menu, and available. |
| Product identity table said the linked Experience Definition was none | It names `XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1` as `NOT_GRANTED`. |
| Measurement section could be read as implementing `M-CC-03` now | It says `M-CC-03` is not implemented until a server-owned initiation fact exists. |
| Experience QA sentence “no longer curated, on the menu, or available” could be read as the opposite rule | Replaced with the reviewer’s sentence: a fresh read that finds the parent no longer curated, no longer on the effective menu, or unavailable removes the card as absence. |

No blocker was found. No canonical authority file was edited to make these repairs.

A follow-up read of section 18 confirmed the repaired sentence and found no remaining copy of the ambiguous rule in the candidates. The old phrase remains only in this note, as the sentence that was replaced. That recheck’s verdict was `READY_FOR_FOUNDER_PRODUCT_EXPERIENCE_GATE_REVIEW`. It did not grant a gate.

## 3. What the review did not do

It did not pass FD-036K-CC-1, the Product Definition Gate, or the Experience Gate. It did not execute tests. It did not close PR #465. It did not decide the later Pickup-suppression direction.

## 4. Founder direction recorded after that review

On 2026-10-26 the Founder directed that an active Pickup Checkout suppress the Curated Cart add-on shelf. The candidates now record that direction as `BR-036K-CC-025`. `PICKUP_DELIVERY_COVERAGE = DECISION_REQUIRED` is withdrawn for that mixed case.

The review in sections 1–3 stays historical. At that time the candidate left the mixed case unresolved, and the review did not grant a gate. This note does not convert `READY_FOR_FOUNDER_PRODUCT_EXPERIENCE_GATE_REVIEW` into a Product Gate PASS or an Experience Gate PASS.

Architecture Fit remains `NOT_PERFORMED`. Implementation remains unauthorized. `CURATED_SHELF_CHECKOUT_MODE_READ` is the design requirement for a trusted Cart read of active Checkout effective mode. Source on `a6155378b799e06a95b28c593ac1a340d7ca9245` does not implement the suppression. No D-number is allocated.
