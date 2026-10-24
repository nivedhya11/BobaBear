<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  TRANCHE: T3
  PACKAGE_STATUS: PLANNED
  IMPLEMENTATION: NOT_STARTED
-->

# T3 — Commercial UAT UX work package

```text
WORK_PACKAGE_ID = WXE-T3-WP-1
TRANCHE = T3
PACKAGE_STATUS = PLANNED
IMPLEMENTATION = NOT_STARTED
IMPLEMENTATION_AUTHORIZED = NO
DEPENDS_ON = T1 Commercial role-correct entry (doc 19 F-1/F-2) so UAT does not start from a broken brand-list landing
COORDINATE = IMP-036J Founder UAT for issues #376 and #381. WXE does not own those root causes.
OPTION_R = PRESERVED — brand-scoped workspace only
IMP036J_ACCEPTED = NO
IMP036J_FOUNDER_UAT = NOT_PERFORMED
```

T3 is the Commercial workspace experience an operator can actually complete in UAT: truthful
review labeling, consequence review before menu section/entry retire, and draft versus live
clarity. It assumes T1 has already made Brand Commercial appear only for a brand-operable
principal. It does not implement that entry rule and does not accept IMP-036J.

## 1. Scope (when a later authorization exists)

- Review section (`CommercialInspectionPanel`): the tab label must not say the operator can
  publish from that tab. The body already redirects; the label catches up (P1-D / P2-D).
- Menu section and menu entry activate/retire open a consequence review before the existing
  command (P1-C). The review explains the customer-visible effect. Confirm still calls the
  existing menu command. Cancel leaves the document unchanged.
- Draft versus live clarity on the commercial editors already in the workspace (offering, menu,
  assortment, pricing, promotions, delivery tariff): the operator can tell a saved draft from a
  published or activated effect without a second editor.
- UAT script slots for a brand-operable principal (GJ-W6, GJ-W8) that include empty, error, and
  cancel-from-review states. Evidence slots stay empty until a human runs them. This package
  does not record Founder UAT PASS.

## 2. Non-goals

- Brand Commercial show/hide, Administration entry, and AS-27 recovery (T1).
- Creating promotions, coupon issuance, or the #381 create-500 investigation. Those stay with
  the IMP-036J operator journey. T3 may show current truthful empty and error states around the
  existing editors. It does not change offer eligibility, coupon codes, or grant rules.
- Gross/net money presentation (issue #385). That choice is outside WXE.
- Store Assortment becoming an authoring surface. Cross-links to Brand Commercial exist only
  when T1’s predicate is true.
- New commercial permissions, a Brand Commerce API, or outlet-scoped Commercial (rejected
  Option R alternative).
- Commercial section URL deep-links (UPD-07).
- Delivery proof and cancellation server behavior (UPD-08).
- People, accessibility programme depth, and measurement hooks (T4), except the consequence
  dialog’s own labelled title, focus trap, and Escape behavior required to ship P1-C.

## 3. Source boundaries for a future implementer

```text
MAY MODIFY (future, presentation only)
- src/components/administration/commercial/CommercialInspectionPanel.tsx
    Review label and inspection-only affordances.
- src/components/administration/commercial/MenuEditor.tsx
    Consequence review before existing section/entry activate and retire commands.
- src/components/administration/commercial/CommercialWorkspaceClient.tsx
    Section chrome for draft/live clarity only. Do not change the T1 hide predicate in the
    same change unless T1 has already landed and this change only consumes it.
- Sibling editors under src/components/administration/commercial/ that already own draft and
  publish actions, limited to status presentation.
- Tests adjacent to those components. The brand-operable actor is synthetic (S1). Do not add a
  catalog role.

MUST NOT MODIFY
- src/server/administration/** commercial use cases, except a defect that is already inside
  the accepted IMP-036F/J contract and is not #381’s unproven 500 and not a new permission
- Promotion and coupon domain eligibility, issuance, and redemption
- Access-control catalogues
- Store assortment write paths (there is no store authoring path to add)
- UOE sources and label maps
- PR #427
- STATE / ROADMAP meaning of IMP-036J acceptance

EXPLICITLY OUT OF SCOPE
- Second Commercial authority
- IMP-036J formal acceptance or Founder UAT self-PASS
- #376 journey ownership beyond truthful WXE chrome around existing screens
- #381 production database changes
- Pricing math and customer payable truth
```

If a commercial screen 403s for a principal who passed the T1 predicate, stop and report the
API conflict. Do not grant `brand.read` in the client.

## 4. Invariants

1. Brand Commercial Workspace remains brand-scoped IMP-036F/J reuse (Option R, ADR-006).
2. Review does not publish. Publish stays on the domain editor that already owns it.
3. Consequence review is a confirmation over an existing command, not a new lifecycle.
4. One editor per effect. Store Availability and Store Assortment are not retitled as Brand
   Commercial.
5. Browser copy is not commercial truth (ARCH-G11). Customer menu projection and checkout
   payable truth are untouched (ARCH-G19, ARCH-G05).
6. IMP-036J remains pending acceptance. T3 tests must not assert that coupons or promotions
   are accepted product.
7. No new RBAC.

## 5. Test matrix

All rows are **PLANNED**. Human UAT rows record evidence slots, not verdicts.

| ID | Proves | Fixture | Expected | Must not |
|---|---|---|---|---|
| T3-REVIEW-LABEL | P1-D / P2-D | S1 on Review | Label does not claim in-tab publish; inspection remains read-only | A publish button on Review |
| T3-P1C-OPEN | P1-C | S1 retires a menu section and an entry | Consequence dialog before the existing command; title labelled; Escape cancels | Retire without review; new menu API |
| T3-P1C-CANCEL | P1-C negative | Cancel the dialog | Document unchanged; no command fired | Partial retire |
| T3-DRAFT-LIVE | Draft/live | Editor with a draft and a live effect | Both states visibly distinct | Second editor or silent publish |
| T3-GJ-W8 | Entry handoff | S1 after T1 | Workspace opens because the predicate is true | Re-test hide as a T3 success path (that is WXE-PF-02 in T1) |
| T3-S2-ABSENT | Option R hold | S2 | Commercial workspace not offered | Build an outlet editor to make UAT pass |
| T3-PF-09 | Negative | Mutation without the existing commercial permission | Server denial unchanged | Broaden RBAC |
| T3-UAT-SLOT | Founder UAT | GJ-W6 script | Evidence slot empty until a human runs it | Agent-recorded UAT PASS |
| T3-376-381 | Coordination | — | Defects remain owned outside WXE unless a separate accepted-contract fix lands | Claim #376 or #381 closed by copy changes |

Desktop viewport for the UAT script: 1366×768. IMP-036J customer coupon journeys are not this
matrix.
