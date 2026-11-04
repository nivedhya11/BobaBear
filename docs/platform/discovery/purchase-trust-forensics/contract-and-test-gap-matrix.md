# Contract and test gap matrix

```text
STATUS: DISCOVERY_EVIDENCE
AUTHORITY: NON_AUTHORITATIVE
SOURCE_HEAD: a6155378b799e06a95b28c593ac1a340d7ca9245
IMPLEMENTATION: NO
```

#391, #377, #384B, #381, and IMP-036K stay separate. Complimentary-item unavailability (`AC-036J-013-03`) is not #377.

| Question | #391 payment start | #377 unavailable item |
|---|---|---|
| Accepted invariant | Payment binds only the active sealed snapshot. Structural equality is stricter than the displayed total. Stale-offer recovery returns through Review. The money sentence is for a benefit that is no longer valid. | Cart stores intent, not an availability guarantee. Availability is outlet-scoped. Checkout revalidates and must not silently remove or substitute the line. Zero eligible pickup outlets block pickup payment and allow return to cart. Menu display availability is a projection. |
| Current source (Wave 2 / post-`1a8b30e` main) | Prepare compares the full snapshot. Equal rupees with a changed promotion revision still fail closed. Recovery copy compares payable integers. Bind commercial rebuild **passes** snapshot `fulfilmentTiming` (SOURCE FIXED; see `payment-binding-fulfilment-timing.domain.test.ts`). | `addCartLine` is structural only. Cart names a line after delivery-outlet evaluation. Checkout and empty pickup do not name the line. Prepare maps merchandise failure to `CHECKOUT_REPRICED`. |
| Deviation | PARTIAL for historical 16 October field only. Fail-closed structural revalidation is accepted. False money sentence and selection-order class are fixed. Bind timing omission is **historical / source-fixed** — not a live remediation task. | PARTIAL. Keeping the line is accepted. The gap is identification on checkout, empty pickup, and payment recovery. |
| New behavior if corrected as recommended | Bind-timing correction already on main. Binding on grand total alone would still be new snapshot authority and needs a decision. | Naming the existing problem line stays inside ADR-006, IMP-026C, and IMP-036H. An `addCartLine` rejection, silent removal, or treating the menu as availability authority needs a decision. |
| Isolated regression enough to implement later | Enough as mechanism evidence under TEST-1. Not Founder UAT and not IMP-036J acceptance. | Enough for the presentation change. Not Founder UAT. |
| Founder UAT or GTM | A payment loop on an unchanged displayed total can stall IMP-036J Founder UAT. Founder UAT is `NOT_PERFORMED`. This batch does not declare a GTM launch block beyond that open acceptance. | A customer who cannot see which line to remove can stall pickup. IMP-036H already records `unavailable_state=PASS`. This review does not reopen that acceptance and does not call this an IMP-036J acceptance miss. |

## Executed proof

| Test | Result | What it proves | What it does not prove |
|---|---|---|---|
| `tests/payment/gtm-391-payment-review-loop.domain.test.ts` | 12 passed | Order-only selection divergence is not a binding change. One fake-provider Payment for an unchanged seal. Promotion-revision and genuine price changes still reject. | The 16 October query plan or checkout `5884a703`. (Bind timing later covered separately by `payment-binding-fulfilment-timing.domain.test.ts` on main.) |
| `src/components/ordering/availability-377-recovery.test.tsx` | 10 passed | Cart names the line when a delivery evaluation problem matches. Pickup unavailable offers Review cart. | Checkout or payment-prepare naming. The 8 October cart. |

No live commercial rows were written. No Razorpay order was created. No staging database was queried.
