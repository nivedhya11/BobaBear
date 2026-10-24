<!--
  AUTHORITY: NON_AUTHORITATIVE_IMPLEMENTATION_PLAN
  ID: UOE-TRANCHE-UX-A-1
  THIS_DOCUMENT_IS_A_PLAN: YES
  IMPLEMENTATION: NONE
  IMPLEMENTATION_AUTHORIZED: NO
  WHATSAPP_META_ON_WIRE: NOT_APPROVED
  APPLICATION_CODE_MUTATION: NO
-->

# UX-A tranche contract and test matrix

```text
TRANCHE = T1 UX-A
CONTRACT_ID = UOE-TRANCHE-UX-A-1
PACKAGE = UOE-CANDIDATE-3
EXPERIENCE = XD-UOE-CANDIDATE-3 § UX-A
CHANGE_RISK = CR1 for in-app wording on non-money surfaces; CR2 where Checkout chrome strings sit beside payment steps
EXPERIENCE_CRITICALITY = X2 labels inside an X3 journey
STATUS = PLAN_ONLY
IMPLEMENTATION_AUTHORIZED = NO
START_CONDITION = §1 grant in 16-… PLUS allocated IMP PLUS explicit implementation authorization
WHATSAPP_ON_WIRE = EXCLUDED until WA-01 bodies exist
TESTS_EXECUTED = NONE
```

UX-A is shared customer and workforce primary language: Delivery / Takeaway, and the in-app
half of UOE-DR-04. It does not change money, eligibility, Checkout composition, or Meta payloads.

## Scope

In a future authorized tranche:

- Customer primary labels say **Delivery** and **Takeaway**. **Pickup** is not a peer of Delivery on customer chrome. API enum `PICKUP` stays `PICKUP`.
- Workforce order-type chrome uses the same primary words. Contextual ops verbs already allowed in `12-…` §G stay allowed (MC-32).
- Remove ordinary customer “fulfil” / “fulfilment window” wording on ordering surfaces.
- In-app notification summaries in `customer-visible-content.ts` use Takeaway / collection meaning for `PICKUP` (MC-33). Working baseline strings are `14-…` §1.2 as recorded in `15-…` §1.
- Orientation copy stays distinct from “Deliver to” (MC-05) where a string change is label-only.
- Content QA may polish MC-31 (loading, sentence case) at T1 exit.

Out of this tranche:

- Meta template bodies, ids, categories, and send-variable changes (MC-34, WA-01–WA-03). Bodies are UNKNOWN (`16-…` §4.3).
- Checkout Schedule composition (`20-…`).
- Cart evaluate, eligibility reads, bar coordinator, new lifecycle states, payment authority.
- Email, SMS, and push (out of V1 while non-sending; capability §5.2).

## Invariants

| Invariant | Source |
|---|---|
| Domain enum `PICKUP` is unchanged | Experience UX-A; capability §5 |
| Same meaning in-app when WhatsApp is noop | Capability §5.2; AS-28 |
| `NOT_SENT` is neither send success nor a customer-facing product failure | §4.4 #16 |
| No invented Meta template | Capability §5.3 |
| Wording polish does not invert D1–D6 or UOE-DR-02/04/05/06 promises | `15-…` §1.1 |
| No client-authored money | ARCH-G11 |
| Label edits on Checkout chrome do not reorder bind / evaluate / timing | Contract C remains UOE-DR-06 |

## Files allowed later

Allowed only after the start condition. This plan creates none of them.

| Path | Later change | Boundary |
|---|---|---|
| `src/shared/notifications/customer-visible-content.ts` | In-app `PICKUP` summaries use Takeaway / collection wording | Do not add Meta template ids or body strings |
| `src/shared/notifications/customer-visible-content.test.ts` | Assert in-app wording and that noop is not send success | |
| `src/components/ordering/pickup-location-presentation.ts` | `fulfilmentModeLabel` returns Takeaway for `PICKUP` | Single customer label helper |
| `src/components/ordering/CheckoutFulfilmentChoice.tsx` | Visible label “Pickup” → Takeaway | Choice values stay `PICKUP` / `DELIVERY` |
| `src/components/ordering/CheckoutReviewSections.tsx` | Visible “Pickup” label | |
| `src/components/operations/OperationsOrderListClient.tsx` | `fulfilmentModeLabel` primary word | Contextual ops verbs may remain |
| `src/components/ordering/DeliverToOrientation.tsx` | Only if orientation copy still reads as Deliver to without an address | Label-only |
| Proposed, not created: `src/shared/ordering/uoe-presentation-labels.ts` | Shared Delivery / Takeaway / Now / Schedule map | Do not create it in this documentation tranche |

`src/components/ordering/CheckoutClient.tsx` currently renders “Pickup” and “Change fulfilment”
(verified presentation strings). Prefer routing those strings through
`pickup-location-presentation.ts` so the UX-A diff does not edit
`chooseFulfilmentMode`, `loadPickupOptions`, `continuePickupWithOutlet`, `openTiming`, or
`confirmTiming`. Those functions are UOE-DR-06 source (`20-…`).

## Files forbidden

`src/server/**`, checkout HTTP routes, `src/server/cart/evaluate.ts`, payment and snapshot
modules, `drizzle/**`, `docs/platform/STATE.md`, `docs/platform/ROADMAP.md`,
`docs/platform/decision-register.md`, capability architecture, dependency manifests.

## Scenarios

| ID | Planned proof | Negative |
|---|---|---|
| AS-19 | Customer and workforce primary labels are Delivery / Takeaway. Content QA snapshot | Pickup rendered as a peer of Delivery |
| AS-28 | In-app summaries match Takeaway meaning. Noop fixture: `NOT_SENT` does not satisfy “sent” and does not fail the order | Passing DR-04 by inventing a WhatsApp send; claiming on-wire DR-04 |
| MC-31 | Sentence case; no raw enum in accessible names | ALL-CAPS domain tokens in UI |
| MC-33 | In-app Pickup wording replaced on the files above | API enum renamed |

Exit evidence, when implementation is later authorized: component or content tests for the
label map, the existing notification content test updated for Takeaway wording, and a noop
adapter fixture for §4.4 #16. Content QA signs the T1 strings. WhatsApp-sending proof is not
an exit criterion while bodies remain UNKNOWN.

## Negatives

| # | In this tranche |
|---|---|
| 16 | Yes. PLANNED |
| 1–15, 17–21 | No. Owned by UX-B, UX-C, or UOE-DR-06 |

## Evidence

| Item | Now | Later, if authorized |
|---|---|---|
| Label map unit/component tests | PLANNED | EXECUTED on the implementation candidate |
| In-app content test | PLANNED | EXECUTED |
| §4.4 #16 noop | PLANNED | EXECUTED |
| Meta body vs variable | UNKNOWN | Not UX-A exit |
| Founder UAT | NOT_PERFORMED | Human only |

## Non-authorization

```text
IMPLEMENTATION_AUTHORIZED = NO
THIS_COMMIT_CHANGES_APPLICATION_SOURCE = NO
ON_WIRE_WHATSAPP = NOT_APPROVED
```
