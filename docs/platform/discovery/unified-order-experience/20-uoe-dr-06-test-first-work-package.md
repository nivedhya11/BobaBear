<!--
  AUTHORITY: NON_AUTHORITATIVE_WORK_PACKAGE
  ID: UOE-DR-06-CHECKOUT-COMPOSITION-CORRECTIVE
  REMEDIATION: NOT_AUTHORIZED
  THIS_DOCUMENT_IS_A_PLAN: YES
  IMPLEMENTATION: NONE
  APPLICATION_CODE_MUTATION: NO
  AS-34: RED
  AS-41: RED
-->

# UOE-DR-06 test-first work package

```text
ID = UOE-DR-06-CHECKOUT-COMPOSITION-CORRECTIVE
STATUS = NOT_AUTHORIZED
CLASSIFICATION = ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT
PRODUCT_COMMITMENT = ACCEPTED (do not reopen)
REMEDIATION = NOT_AUTHORIZED
SEPARATE_FROM = UX-A, UX-B, UX-C and from the 16-… consolidated gate
CHANGE_RISK = CR2 for listing and sequencing; CR3 at evaluate → prepare → pay
EXPERIENCE_CRITICALITY = X3
AGENT_RISK_WHEN_LATER_AUTHORIZED = R2 minimum; R3 if the corrective changes payment or concurrency authority
TESTS_EXECUTED_BY_THIS_PACKAGE = NONE
PRESERVE_RED = YES
```

The Founder accepted Schedule-capable Takeaway and accepted that current Checkout composition
does not implement it. This package is the later corrective’s scope, risk, and source
boundary. Nothing here authorizes that corrective. AS-34 and AS-41 stay RED until a separate
authorization exists and the proofs below are actually run.

Preferred shape, already recorded: a separately scoped corrective after urgent payment work
(`14-…` §5.3). Vehicle identity and timing (DR06-A) stay deferred.

## Required sequence (locked, not implemented)

Capability §3.3:

```text
REQUIRED = Mode → timing-aware list → confirm outlet → setCheckoutFulfilment without evaluate
           → listCheckoutScheduledWindows → set SCHEDULED+window → evaluateCheckout → prepare → pay
FORBIDDEN = Mode → accepting-now-only list → bind → evaluateCheckout(ASAP) → Timing
FORBIDDEN_LIST_UNLOCK = write SCHEDULED with a null window solely to list options
LIFECYCLE = no new Order or Checkout states
```

## Verified current boundaries

Read from the worktree at the start of this package (`b10ec9b4cf4b8533b56d9d7f2c6e635f8e545bfb`).
Descriptions name the defect. They are not a patch.

| Boundary | What the source does now |
|---|---|
| `src/components/ordering/CheckoutClient.tsx` `chooseFulfilmentMode` | Sets fulfilment mode, then `loadPickupOptions` for pickup |
| Same file `loadPickupOptions` | Calls `listCheckoutPickupOptions({ checkoutId })` with no timing intent |
| Same file `continuePickupWithOutlet` | `setCheckoutFulfilment` (bind outlet), then `evaluateCheckout`, then `openTiming` |
| Same file `openTiming` | `listCheckoutScheduledWindows` after that evaluate |
| `src/lib/customer-commerce/checkout.ts` `listCheckoutPickupOptions` | `GET /api/v1/checkouts/{checkoutId}/pickup-options` with no timing query |
| `src/server/customer-commerce/http/router.ts` | Registers that pickup-options route |
| `src/server/checkout/pickup-options.ts` `listCheckoutPickupOptions` | Loads the Checkout, then `listEligiblePickupOutletsForCheckout` with `now` |
| `src/server/checkout/pickup-eligibility.ts` | Header and `assertCorePickupOutletGates`: eligible only when `effectiveState === "accepting"`. `listEligiblePickupOutletsForCheckout` is documented as ASAP pickup |

That is the forbidden sequence: accepting-now list, bind, evaluate, then Timing.

`confirmTiming` in the same client already sets timing and then evaluates. The defect is the
earlier evaluate inside `continuePickupWithOutlet`, plus the list that cannot express
schedule-capable outlets, not the post-timing evaluate itself.

## Later authorization may touch only these sources

| Path | Allowed later change |
|---|---|
| `src/components/ordering/CheckoutClient.tsx` | `chooseFulfilmentMode`, `loadPickupOptions`, `continuePickupWithOutlet`, `openTiming`, and the call order around them. `confirmTiming` only if Schedule bind must remain the first evaluate |
| `src/lib/customer-commerce/checkout.ts` | `listCheckoutPickupOptions` request, if listing intent must travel with the existing route |
| `src/server/customer-commerce/http/router.ts` | The existing pickup-options route’s input only. No new public route unless implementation authorization explicitly adds one. Capability §6 still defers exact path strings; do not mint a second checkout API in the plan |
| `src/server/checkout/pickup-options.ts` | Timing-aware listing. Listing intent must not write `SCHEDULED`+null |
| `src/server/checkout/pickup-eligibility.ts` | Additive schedule-capable composition. Now eligibility keeps the accepting-now gate |
| New or existing Checkout client tests, including `src/components/ordering/CheckoutClient.destination.test.tsx` | RED fixture first, then the corrective |

Ownership-exact actor checks on pickup-options, windows, fulfilment, evaluate, and prepare stay
in place (SEC-BOLA-CHECKOUT). Guest or wrong-owner access stays denied.

## Forbidden in this corrective

| Item | Reason |
|---|---|
| Menu bar, `OrderContextBar`, session coordinator | UX-C |
| `src/server/cart/evaluate.ts` precedence and CART `SCHEDULED` 400 | UX-B Contract B |
| CART provenance migration | Separate schema authorization |
| `customer-visible-content.ts` and Meta templates | UX-A; bodies UNKNOWN |
| Payment provider, capture, webhook, new prepare authority | Existing payment authority. Prepare/pay stay the accepted path after a truthful evaluate |
| New `PAYMENT_PENDING` server guards | Preserve existing freeze |
| New lifecycle states | Capability §3.3 |
| ROADMAP, STATE, decision register, capability architecture edits | Not this package |
| Quietly deleting AS-34 or AS-41 | QT-02 |

## Risk

| Risk | Why it is in this package |
|---|---|
| CR3 evaluate-before-timing | Today’s `continuePickupWithOutlet` evaluates before the customer picks Schedule. A corrective that moves evaluate must not skip Snapshot sealing or prepare revalidation |
| CR3 revision races | `expectedCheckoutRevision` conflicts on bind, timing, and evaluate stay fail-closed |
| CR2 wrong list | A schedule-capable list that also drops accepting-now outlets breaks Takeaway Now |
| CR3 BOLA | A new listing parameter must not let another customer’s `checkoutId` enumerate outlets |
| X3 promise | MC-19 and MC-20 are approved strings. Shipping the strings on the current list would claim Schedule-only behaviour the list does not have |

Per-process rate-limit residual stays `ACCEPTED_FOR_V1_PILOT` and is not a reason to weaken
ownership checks.

## Test-first matrix

Write the failing proof against current composition before any production change. This
documentation commit does not add those tests. TEST-1: keep the initial RED visible; do not
replace it with a silent retry.

| Proof | Against current source | After an authorized corrective | Layer |
|---|---|---|---|
| AS-34 | RED. Closed-now schedule-capable outlet absent from pickup-options; bind path evaluates before Timing | GREEN. Timing-aware list; bind without evaluate; Now disabled when `nowEligible` is false | Domain, integration, E2E |
| AS-41 | RED. Same composition through prepare | GREEN. Full Contract C journey including `expectedRevision` conflicts. Prepare/pay use existing payment tests plus this journey. Quote-only tests do not count | Integration, E2E, recovery, concurrency |
| AS-08 Checkout list | RED when Schedule is denied only because accepting-now is empty | GREEN on the Checkout list. Menu half stays UX-B | Domain, HTTP |
| AS-09 Checkout empty windows | RED if the empty state is unreachable because evaluate already ran ASAP | GREEN empty + recovery; Now only if still eligible | Integration, component |
| AS-33 Checkout pickup-options error | RED if transport errors become permanent UNAVAILABLE | GREEN calm retry | HTTP, component |
| AS-35 | RED if no-future-window outlet still offers a fake slot or skips honest empty | GREEN | Integration |
| AS-36 | RED if an outlet that becomes invalid is kept silently | GREEN forced reselect | Recovery, HTTP |
| AS-37 | RED if empty Schedule still reads as unconditional ASAP | GREEN | Integration |
| SEC-BOLA-CHECKOUT | Must already deny wrong owner; re-run on the changed route | Still deny. Listing intent must not widen identity | Auth, HTTP |

Also required on the authorized candidate: capability negatives that the listing and evaluate
order can break (especially #8 if a pending Checkout is in the fixture, and #11 if a guest
fixture reaches Checkout). UX-B owns the CART evaluate negatives; do not satisfy them by
editing `evaluate.ts` inside this corrective.

## Evidence this package does not have

```text
RED_FIXTURE_EXECUTED = NO
CORRECTIVE_IMPLEMENTED = NO
AS-34 = RED (obligation retained; reproducing run not executed here)
AS-41 = RED (obligation retained; reproducing run not executed here)
AUTHORIZATION = NOT_AUTHORIZED
```

## Decision still required before any edit

```text
DECISION_REQUIRED
question: Authorize UOE-DR-06 Checkout composition remediation, including vehicle and timing?
why_current_authority_is_insufficient: The defect and the required sequence are accepted and locked. Founder preference is a separate corrective after urgent payment work. Issue #435 and the capability architecture both say remediation is NOT_AUTHORIZED. DR06-A vehicle identity was deferred in the W2 record.
option_a: Authorize this work package as its own corrective, test-first, on a short-lived branch, after payment urgency is resolved.
option_b: Leave it NOT_AUTHORIZED. AS-34 and AS-41 remain RED. UX-A/B/C plans must not absorb the Checkout diff.
cursor_recommendation: Option_b until a separate Founder authorization. Do not start the corrective from the consolidated Design/Quality/Measurement decision.
decision_owner: HUMAN_FOUNDER
blocked_scope: Any edit under the source table above; any claim that AS-34 or AS-41 passed
work_continuing_elsewhere: 16-… decision package and UX-A/B/C plans, which exclude this diff
```
