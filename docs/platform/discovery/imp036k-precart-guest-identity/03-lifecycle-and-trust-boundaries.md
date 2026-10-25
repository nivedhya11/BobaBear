# Lifecycle and trust boundaries

```text
STATUS = NON_AUTHORITATIVE_DESIGN
AUTHORITY = NONE
IMPLEMENTATION = NO
THIS_DOCUMENT_SELECTS_HIDDEN_DEFAULTS = NO
```

This is a proposed shape of `B3S-M1` if the Founder authorizes it and a later Architecture Fit
accepts the amendment. Rules marked unresolved are not an implementation contract. Names are
design labels. They are not a public API grant.

## Trust boundaries

| Boundary | May do | Must not do |
|---|---|---|
| Browser | Show the product, store the raw journey secret in `sessionStorage`, send it on a custom header, report what was actually shown, send an explicit add | Invent set membership, eligibility, rank, holdout, presentation proof, or an assistance mark. Create a cart by itself |
| Customer-commerce | Mint the journey, store the hash, assign holdout only when activation exists and only before exposure, issue the set, validate observations, call existing `addCartLine` | Authenticate a customer. Read or mutate a cart without the existing cart principal. Insert a cart from a recommendation read |
| Cart | Create the guest cart and guest-cart token only inside an accepted line add. Bind of a presented unbound brand-matched journey to the cart created by an explicit add is intended. Whether that bind shares the cart transaction is unresolved. This cell does not choose a commit protocol | Treat the journey secret as the cart credential |
| Checkout claim / reconcile | Claim and reconcile must not roll a new holdout arm. Whether any journey binding moves onto the surviving cart is unresolved | Copy the secret into a customer profile |
| Pricing, promotion, payment, order | Unchanged | Read the journey secret. Price from a recommendation mark |

## Sequence

```text
Guest opens Product Detail. No customer session. No guest-cart token. No journey secret.

1. Browser calls the recommendation read with outlet and fulfilment context.
   No X-Boba-Ordering-Journey header.

2. Server resolves brand from existing storefront authority.
   If holdout is inactive:
     the inactive mint below is proposed. Locked §7.14 and §7.19 say inactive
     configuration writes nothing. Whether a verifier row may exist in that state
     is unresolved until Architecture Fit accepts the amendment.
     Proposed inactive path: mint journey, store hash + brand + expiry, write no assignment.
   If holdout is active:
     mint the journey. This new journey has not been exposed. Commit the assignment
     before any response that can contain a set. If that write fails, return no module
     and write no issued set, then stop.
     Holdout arm: return no module, write no issued set, then stop.
     Treatment arm: continue to step 3 only after that commit.
   Mint failure: return no module. Write no cart. Primary product action stays available.
   Stop. Do not continue to step 3.

3. Server resolves eligibility and ranking from existing catalog, menu, assortment,
   availability, and relationship authority.
   Qualifying set: record SERVER_SET_CORRELATION bound to the journey id.
   Empty or failed set: record no issued set.
   Response carries customer-safe members and the issued correlation.
   Response carries orderingJourneyToken only on this first mint.
   Response does not carry the hash, the arm, priority, or margin.

4. Browser stores the raw secret in sessionStorage for that tab and brand.
   It does not put the secret in the URL.

5. After the module or an item has actually been shown, the browser echoes the
   issued correlation. The server records SET_RENDER or ITEM_IMPRESSION only when
   that echo matches the journey and the issued membership.
   Failed observation: module may stay. No occurrence. No later assistance.

6. Ignore: the customer adds the current product without a recommendation action.
   addCartLine creates the guest cart and guest-cart token as it does today.
   If the journey header is present, unbound, unexpired, and brand-matched, the design
   intends to bind that journey to the cart created by this explicit add. Whether that
   bind shares the cart transaction is unresolved. Bind failure must not be assumed to
   roll back the accepted line, and this document does not choose a commit protocol.
   No recommendation mark is written.
   If the header is absent, the add still proceeds unmarked. That add does not bind a
   journey. A later read must not be treated as if late bind were already specified.

7. Recommendation action: the same addCartLine path.
   Revalidate eligibility. Verify the presentation occurrence for that member.
   Proven: mark only the units this action created.
   Unproven: commerce may still commit an unmarked add.
   The bind intention is the same unresolved protocol as step 6.

8. Later Product Detail, Customization, and Cart reads that present the same journey
   header reuse that journey's already-written assignment. They do not attach this
   journey to a cart that was created without the header. Late bind is unresolved.
   They do not roll a new arm.

9. Checkout claim uses the existing D-370 cart rules for purchase intent.
   The guest-cart verifier is cleared as it is today.
   The browser clears the guest-cart token as it does today.
   After claim, a customer session is the cart principal. The raw journey secret must
   not authorize anonymous reads, observations, or a further bind. Whether server-side
   correlation of sets already issued continues through the surviving cart, and whether
   sessionStorage is cleared on claim and sign-out, is unresolved. bound_cart_id joined
   to customerAuthUserId is a customer linkage and is not yet accepted as a non-profile.

10. Sign-out ends the customer cookie. It does not delete the customer cart.
    A guest-cart token that was never claimed still addresses only that guest cart.
    What the server returns when a journey secret is still presented after claim or
    sign-out, including to a later customer on that browser, is unresolved.

11. Brand change: the stored secret's brand does not match the request brand.
    The server ignores it, correlates nothing, and may mint a new journey for the new brand.
    No cart is created.

12. Expiry or lost sessionStorage: the expired journey's exposure does not move onto a
    replacement journey. Whether a new journey may be assigned while the same cart is
    still alive contradicts BR-036K-023 if it re-rolls that cart, and the successor
    rule is unresolved.
```

## Request and response shapes

Recommendation read, design label only:

```text
request
  brand resolved by the server
  placement = PRODUCT_DETAIL | CUSTOMIZATION | CART
  outlet and fulfilment from existing server context
  header X-Boba-Ordering-Journey = raw secret | absent
  header X-Boba-Guest-Cart-Token = existing cart secret | absent
  cookie customer session = existing | absent

response
  Cache-Control = no-store whenever orderingJourneyToken is present
  module = customer-safe members | absent
  issued correlation = server set id | absent
  orderingJourneyToken = raw secret | absent
  orderingJourneyToken present only when this response minted it
```

A copy of the secret in a `Cookie` or query string is ignored on mint, observation, and add.
The raw secret is absent from observation requests after mint. Those requests send the header.
Observation and add bodies may echo the issued set id and the bound action id. Those echoes are
not authority. The server checks them against the journey's issued set.

Add body stays the existing cart line body. A recommendation action adds the bound action id
the server already issued. A client-created action id writes no mark.

## Identity lifecycle

| Event | Journey row | Cart |
|---|---|---|
| First recommendation-capable read | Insert hash, brand, expiry. Optional assignment if and only if holdout is active | Unchanged |
| Qualifying set | Issued-set row points at journey id | Unchanged |
| Ignore, then explicit add of the current product | Bind is intended when the header is present. Commit coupling with the line is unresolved. Header absent: no bind | Existing guest create plus first line. Bind failure must not be assumed to roll the line back |
| Recommendation add | Same unresolved bind protocol. Mark only proven new units | Existing add |
| Journey already bound to another cart | Do not rebind. Attribution for this request fails closed | The explicit add still follows current cart rules. That is the customer's add |
| Cart already exists and no journey is presented | Unresolved. Do not mint a second principal beside that cart as a silent default | Unchanged |
| Claim | After claim the customer session is the cart principal. Whether the journey id stays addressable, and whether the secret is cleared, is unresolved | Existing claim |
| Reconcile of two carts | No new arm is written at reconcile time. Whether any journey row is rebound, whether issued-set rows stay on the guest journey, and whether unit marks move with the existing unit move are unresolved | Existing reconcile |
| Expiry while the cart is still alive | Verifier stops matching. Successor assignment is unresolved. Exposure does not move | Guest cart keeps its own TTL |
| Brand mismatch | No read, no bind | No new cart |

Reconcile measurement stays unresolved. These alternatives are named so they are not chosen here:

- Count the surviving cart as excluded from that experiment version.
- Count it as holdout-suppressed without storing a new arm.

Neither alternative authorizes a new assignment at claim or reconcile. Row movement, the
issued-set parent, and unit-mark survival stay unresolved with them.

## Holdout activation, later

Inactive configuration writes no assignment. Whether a journey verifier row may exist while
holdout is inactive is part of the proposed amendment. Candidate 2 is not locked architecture.
Its neutral-session sentence allows a row only for a caller the server can authorize again with
a cart credential, and it prohibits pre-cart collection. Locked §7.14 and §7.19 say inactive
configuration writes nothing. A pre-cart verifier row while holdout is inactive requires an
architecture amendment. Candidate 2 does not supply that amendment. This proposal does not
activate the experiment.

When a future decision activates holdout:

```text
load the journey
→ if it was already exposed: write no assignment
→ if an assignment already exists: reuse it
→ if holdout is activated, this journey was never exposed, and no assignment exists:
    write the assignment and commit it before any response that can contain a set
→ if that write fails: return no module and write no issued set
→ do not enroll an already-exposed journey
```

`MD-036K-004` remains the activation decision. This candidate does not take it.

## Persistence and retention

Later row, not authored here:

```text
ordering_journey
  journey_id          server UUID, not the secret
  brand_id
  verifier_hash       SHA-256 of the raw secret
  created_at
  expires_at
  bound_cart_id       null until an explicit add binds it
  exposed_at          null until a read can return a set
  holdout_assignment  null while inactive
```

Forbidden columns: customer auth user id, phone, email, name, address, raw secret, guest-cart
token, payment identifiers.

TTL recommendation: reuse the existing guest-cart TTL of 3_600_000 ms from first mint, without
sliding it on every recommendation read. Sliding on reads would let a passive tab keep a
tracking row alive. Sliding on a real cart mutation is already the cart's own clock and does
not extend the journey beyond its own expiry.

Alternative, not selected: a shorter fixed TTL. That would be a new privacy number. It needs
the same Founder decision as `MD-036K-003` if it is meant to be a retention promise.
`MD-036K-003` still owns measurement-row retention and is not decided here.

Cleanup: expired verifier rows and unbound rows past `expires_at` are deletable. They hold no
purchase intent. Issued-set and presentation rows that a later Order's assistance mark depends
on follow `MD-036K-003`, not this TTL.

## Failure, rollback, and degradation

| Failure | Customer result | Recorded |
|---|---|---|
| Journey mint fails | No module. Product, cart, checkout, and payment stay up | No issued set |
| Ranking or transport fails | No module | No issued set |
| Observation write fails | Module may remain | No presentation occurrence. No assistance on a later add |
| Journey expired | Verifier stops matching. Successor rule while the cart is alive is unresolved | Old exposure stays on the old journey |
| Mark write fails after a valid add | Line remains | Assistance is not claimed |
| Feature disabled | Reads return no module and mint nothing | No new rows |

Rollback of an unauthorized or rejected design is: do not mint, do not read the header, leave
`addCartLine` as it is. No cart migration is required because no cart column is proposed.

## Test oracles

These oracles are for a future Quality revision. They are not executed proof. Oracles that would
require an unresolved rule are written as prohibitions, not as a hidden successor design.

1. A guest Product Detail read with no cart returns at most three eligible complements, or fewer
   when eligibility says so, and inserts no cart row.
2. The raw secret appears in the minting response body and in `sessionStorage` only. It is absent
   from the URL, analytics payloads, and logs. The minting response is `Cache-Control: no-store`.
   A replayed cached body does not establish a second caller.
3. A second read with the same header reuses the journey and does not mint another secret.
4. A read with no header and no cart may mint a journey. A read with no header while a cart
   already exists must not be tested as a silent mint. That case is unresolved.
5. Ignore, then add the current product with the journey header present: one new guest cart, one
   new guest-cart token, no assistance mark, no second cart. Whether the line remains when bind
   fails is unresolved and has no pass value in this oracle.
6. A recommendation add without a validated presentation occurrence may commit an unmarked line
   and must not write a mark.
7. A client-supplied member id outside the issued set writes no occurrence and no mark.
   Presentation of only the issued-set id, without the journey credential, writes no occurrence.
8. While a fixture activates holdout, a never-exposed journey commits its assignment before any
   response that can contain a set. A failed assignment write returns no module and writes no
   issued set. An already-exposed journey is not enrolled. A holdout response writes no
   `SET_ISSUED`.
9. Brand mismatch correlates nothing and creates no cart. A client-supplied brand id is ignored.
10. Two tabs without a shared secret produce two journeys and, on two first adds, two carts.
11. Claim clears the guest-cart verifier. The raw journey secret does not return issued sets,
    observations, the arm, or the customer cart. Whether server-side correlation continues
    through the surviving cart is unresolved and is not given a passing value here.
12. Reconcile does not write a new holdout assignment and does not copy a guest arm onto a
    surviving cart that already has an assignment. It does not reparent the guest issued set
    onto that arm. Unit-mark movement stays unresolved and has no expected value in this list.
13. Mint failure and recommendation failure leave `GJ-PAYMENT-RECOVERY` reachable.
14. A journey header never satisfies `getActiveCart` or checkout start. A `Cookie` or query-string
    copy of the secret is ignored.
15. A recommendation read does not change cart revision, lines, suppression, or `expiresAt`.
    It does not slide journey `expires_at`. A cart mutation does not extend the journey. The
    same living cart does not receive a second arm. The successor behavior itself stays unresolved.
16. An ordinary add of a product that appeared only in a pre-cart issued set writes no mark.
17. The first add without the journey header does not bind on that add. A later read is not
    tested as if late bind were specified.
18. After sign-out, the raw secret does not return Customer A's cart or journey to Customer B.
    The exact response remains unresolved and must not be filled in by the test.

## Relationship to the locked architecture

`B3S-M1` is offered against §7.12, §7.14 mechanism 1, §7.20, §8's fail-open read, and §9's rule
that an issued set is not a second cart. It does not yet satisfy §7.7. The amendment is the
place that contradiction is stated. It is not locked.
