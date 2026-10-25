# Independent review dispositions

```text
STATUS = NON_AUTHORITATIVE_DISCOVERY
AUTHORITY = NONE
REVIEW = READ_ONLY
REVIEWER = 3706c70c-c3a0-4f26-9265-dedb7dbb938f
GRANT = NO
ARCHITECTURE_FIT = NOT_PERFORMED
```

Second pass `3706c70c-c3a0-4f26-9265-dedb7dbb938f` found the same defaults restated in other
sentences. Those sentences were replaced. `GRANT = NO` on both passes.

| Challenge | First verdict | Disposition in this candidate |
|---|---|---|
| First-visit Product Detail without a cart | HOLDS | Kept. A recommendation read inserts no cart |
| Hidden authentication or tracking | UNRESOLVED | Classifications are now labeled proposed or undecided. Fit can reject the bearer under §13, §7.20, and PD §16 |
| Session establishment | DEFECT | Cookie prohibited. Mint response is `Cache-Control: no-store`. `Cookie` and query-string copies are ignored. Customer-commerce still has no origin check |
| Silent cart mutation | DEFECT | The same-transaction claim was removed. Whether bind failure leaves the accepted line is unresolved, and this disposition does not choose that outcome |
| §7.12 attribution | DEFECT | Header-absent adds do not bind. Late bind is unresolved and is not tested as if it existed. Post-claim correlation is unresolved |
| §7.14 sequencing | DEFECT | Already-exposed journeys are not enrolled. Assignment commits before a set response. Inactive verifier rows are called out as an amendment, not as Candidate 2 authority. Successor assignment while a cart is alive is unresolved |
| Guest-to-customer leak | DEFECT | `bound_cart_id` joined to a customer is named as linkage and is not accepted as a non-profile. Reconcile writes no new arm. Rebind, issued-set parent, and unit-mark survival are unresolved |
| Amendment honesty | DEFECT | §8 is a replacement of the locked step, not an insertion beside it. `SECOND_AUTH_MODEL = NO` is not pasted as decided text |
| Hidden defaults | DEFECT | Late bind, existing carts at rollout, successor journeys, and dual-journey reconcile stay unresolved |
| Oracles | DEFECT | Oracles now include uncacheable mint, ignored cookie and query copies, no cart mutation on read, no second arm, no enrollment after exposure, and no Customer B cart read. Unresolved behaviors have no passing expected value |

Still unresolved, on purpose:

- Whether the bearer is authentication, a second auth model, or a new customer identity.
- Whether a journey verifier row may exist while holdout is inactive.
- Commit coupling between journey bind and `addCartLine`.
- Late bind after an add that omitted the journey header.
- First-read behavior for carts that already exist and have no journey.
- What a successor journey does when the journey expires and the cart is still alive.
- Reconcile of two journeys: rebind, issued-set parent, unit-mark survival, and the experiment count.
- Post-claim and post-sign-out handling of a secret that remains in `sessionStorage`.
- `MD-036K-001` through `MD-036K-007`, the rate-limit number, and holdout activation.
