# IMP-036K V1 — Founder gate decision package

```text
AUTHORITY = NONE
STATUS = CANDIDATE
OLD_GATE_APPROVALS_NOT_AUTOMATICALLY_TRANSFERRED = YES
NEW_PRODUCT_DEFINITION_GATE = NOT_GRANTED
NEW_EXPERIENCE_GATE = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
DO_NOT_MERGE = YES
DECISION_REGISTER_EDIT = NO
```

One decision is in front of the Founder. It is whether these candidates are ready to enter an independent Product Definition Gate and Experience Gate. It does not grant either gate.

## FD-036K-CC-1 — Send the curated-cart candidates to gate review

**Question.** Do the Founder-directed V1 documents in this folder describe the Cart shelf clearly enough for an independent Product Definition Gate and Experience Gate?

**Recommended alternative.** Yes. Review `02-product-definition-candidate.md` and `03-experience-definition-candidate.md` as `PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1` and `XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1`. A later PASS, if a human records one, still leaves Architecture Fit, Design Readiness, Quality, Measurement, the Implementation Plan, and implementation authorization unperformed.

**Alternative B.** No. Name the contract defect and revise the candidates before gate review.

**Not chosen by this package.** Treating `PD-IMP-036K-DRAFT-1` or `XD-IMP-036K-DRAFT-1` as the V1 contract. Those PASS records stay historical for the previous multi-surface scope.

### What the gate would be accepting, if it later passes

- One shelf on Cart / Your Order, headed “A little extra?” in the experience candidate.
- At most four cards. Fewer when fewer products are eligible. No filler. No shelf on an empty Cart.
- Cards are existing effective-menu products. Parent identity is `catalog_variants.product_id` of a Cart line’s variant.
- Any in-cart variant hides that parent. Full removal can bring it back. The curated list is not edited by the Cart.
- Plus direct-adds only when the live menu row would direct-add. Otherwise existing customization opens, with no preselected paid modifier.
- A stale card is re-read. It is not a price token and not a shelf-only Cart reject. `addCartLine` still does not check assortment or availability.
- `menu.manage` on the server-loaded brand is the proposed permission mapping. It is not granted by this package.
- Purchased-unit attribution is deferred. B3S-M1 and PR #465 are not V1 prerequisites. PR #465 stays open.

### What the gate would not be accepting

Implementation, schema, telemetry, a holdout, a new role, a merge to `main`, Founder UAT, or formal IMP acceptance.

## Optional register note — not required for FD-036K-CC-1

```text
D-383_AMENDMENT_REQUIRED = NO
D-385_REQUIRED = NO
OPTIONAL_NOTE = NON_AUTHORITATIVE
```

If a later human decision records the narrowing, the next free id on DR-25 is D-385. Proposed wording only:

> D-385, if adopted, would record that IMP-036K V1 observable scope is a curated Cart add-on shelf and that the historical multi-surface Product Definition, Experience Definition, Architecture Fit, and Design Readiness do not transfer. It would not change IMP-036K identity, `nextProductSlice`, D-377, the D-382 remainder, or the implementation ban. It would not close PR #465.

This file does not adopt that wording.

## Unresolved product behaviour

```text
UNRESOLVED_PRODUCT_DECISIONS = NONE
```

The four-card ceiling is inside the product candidate as a proposed acceptance rule (`BR-036K-CC-018`). The gate can stop the candidate if that ceiling is wrong. It is not a second decision beside FD-036K-CC-1.

Provenance of a purchased unit, the exact curation table, and the server-owned way to recognize a shelf add are Architecture Fit dependencies. They are named in `04-architecture-fit-impact.md` and `06-measurement-plan-candidate.md`. They do not change the customer-visible contract above.
