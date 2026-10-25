# Architecture options and source evidence

```text
STATUS = NON_AUTHORITATIVE_DISCOVERY
AUTHORITY = NONE
EVIDENCE_BASE = a6155378b799e06a95b28c593ac1a340d7ca9245
CORRECTED_PLANS = fd117572264981960182d3f44763f7260215ea87
```

Specialist evidence came from three read-only reviews: commerce and identity
`7a2cfd9c-2ba7-4229-b918-74eb90a9f5e7`, security and privacy
`da4d814c-57cd-4964-9588-9a15ace9c3e8`, and product and measurement
`d8e598fc-06f0-4b28-a4e4-53ab841ec587`.
Citations below were re-checked on the authority worktree by the coordinator.

## Verified guest identity before the first add

An unauthenticated guest who has not added a line has no cart row, no guest-cart token, and no
server commerce session.

| Fact | Evidence |
|---|---|
| Menu read does not attach a guest token and does not call cart access | `src/lib/customer-commerce/menu.ts`, `src/server/customer-commerce/http/router.ts` menu route |
| `buildCartAccess` returns `{ kind: "guest", brandId }` when no trusted customer identity exists. A guest token is attached only when the header is present | `src/server/customer-commerce/http/router.ts` `buildCartAccess` |
| `resolveExistingCartRow` returns null for a guest with no token | `src/server/cart/operations.ts` `resolveExistingCartRow` |
| `POST /api/v1/cart` is 404 | `src/server/customer-commerce/http/router.ts` `forbidden_create_cart` |
| The first guest cart and its first line are created together inside `addCartLine` | `src/server/cart/operations.ts` `addCartLine` guest branch with no token |
| The raw token is 32 CSPRNG bytes, base64url. The server stores SHA-256 hex only | `src/server/cart/guest-credential.ts` |
| The browser stores `{ token, brandId, cartId, revision }` in `sessionStorage` key `boba.guest-cart.v1` after that response | `src/lib/customer-commerce/guest-token.ts` |
| That token is cart authority. The source comment states it is not authentication | `src/lib/customer-commerce/guest-token.ts` |
| Guest TTL is `guestCartTtlMs: 3_600_000`, slid forward on later guest mutations. Rotation was not found | `src/server/cart/operations.ts`, customer-commerce config |
| `GET /api/customer-auth/session` with no Better Auth session returns `{ authenticated: false }`. It does not mint a cart or a guest token | customer-auth session route and `measurement-instrumentation-plan.md` on PR #463 |
| Delivery context in `sessionStorage` (`boba.delivery-context.v1`) is location context. It is not a commerce principal | ordering delivery-context helper |
| Customer recommendation reads, in the locked architecture, use the existing customer or guest cart principal | capability architecture §7.7 |
| A Product Detail route is not implemented. The current customer surface is the menu catalog | `src/app/(customer)/order/page.tsx` |

`EXISTING_ANONYMOUS_COMMERCE_SESSION = NOT_FOUND`. This candidate does not pretend otherwise.

## Claim, sign-out, brand, and concurrency

Guest-to-customer transition today happens at checkout bootstrap, not at sign-in.

- `claimGuestCart` keeps the same cart id, sets `customerAuthUserId`, and clears the verifier.
- `reconcileGuestCartWithCustomer` merges lines into the customer cart and deletes the guest cart.
- D-370 forbids silently discarding a non-empty cart. An empty cart may transfer. D-370 does not
  define a non-cart guest principal.
- Sign-out ends the customer cookie session and does not delete carts. A guest token still in
  that tab still addresses the guest cart. A customer cart is not returned after the cookie is gone.
- Guest lookup is verifier plus `brandId`. The cart table has no outlet column.
- `sessionStorage` is per tab. Two concurrent token-less adds can insert two guest carts. There
  is no shared anonymous lock. An authenticated first add locks the customer user row.

## Product and architecture statements that stand together

Approved Product Definition `PD-IMP-036K-DRAFT-1`:

- `US-036K-001` / `AC-036K-001-01` through `04`: Product Detail shows at most three eligible
  complements, fewer including zero when eligibility says so, ignore does not add them, and the
  surface makes no co-purchase, personalization, trend, savings, priority, or margin claim.
- The story precondition is a customer viewing a product. It does not require a cart line.
- `BR-036K-023` requires holdout readiness for the active ordering session or cart. Live
  activation is not a product-acceptance outcome. The assignment mechanism was left to
  architecture, then to the Measurement Plan inside architecture constraints.
- PD §16: no new customer identity, loyalty profile, or psychographic profile.

Locked architecture `IMP-036K-revenue-recommendations.md`:

- §7.12 assistance requires server-issued set and membership, server-validated actual
  presentation, the bound action, add-time eligibility, cart acceptance, and survival of the
  exact marked identity. View-through is out. The browser does not create the issued set.
- §7.14 holdout is inactive. Once activated, assignment is server-owned and must exist before
  exposure, or the read returns no module. Cart id assigned only after Product Detail exposure
  is not sufficient. The journey is the active ordering session or cart. The text says that
  journey is not a new customer identity, a new cart, or a profile, and is not keyed by user id,
  phone, email, or a guest-credential copy used as a cross-session profile.
- §7.14 mechanism 1 establishes that assignment before the first recommendation read, including
  Product Detail before a cart. Mechanism 2 suppresses presentation until an assignment exists.
- §7.20: `NEW_CUSTOMER_IDENTITY = NO`. `CROSS_SESSION_PERSONALIZATION = NO`.
- §8 read path returns no module when activated holdout has no stable assignment. Only the CART
  placement returns no module because the cart has no lines. Product Detail is not hidden for
  lack of lines. A qualifying return records `SERVER_SET_CORRELATION`.
- §9 anticipates later rows and authors none. A holdout row must not store a customer profile,
  a credential copy, a browser-authoritative flag, or a customer-visible reason.
- §13 non-goal: a second cart or auth model.

PR #463 Measurement Candidate 2, which is not authority:

- Selects mechanism 2.
- Sets `NEW_RECOMMENDATION_CREDENTIAL = NO` and `PRE_CART_IMPLEMENTATION_AND_COLLECTION = PROHIBITED`.
- Leaves `MD-036K-008` as `DECISION_REQUIRED`: which server-owned principal, if any, may bind one
  guest journey from the first Product Detail read through reload and later cart creation.
- Says Product Detail complements remain `US-036K-001`, and that no current token survives that
  read, a reload, and later cart creation.

```text
CONFLICT
US-036K-001 requires Product Detail complements without a cart prerequisite
§7.12 requires server-owned set correlation and later continuity of the marked identity
§7.14 forbids assigning a holdout arm after that same journey was already exposed
§7.7 currently limits customer recommendation reads to the existing cart principal
No such principal exists before the first accepted add
```

Mechanism 2, as selected by Candidate 2, resolves the conflict by withholding the module until a
cart credential exists. That withholds the approved Product Detail experience from a first-time
guest. Hiding the module also avoids writing `SERVER_SET_CORRELATION` by withdrawing the
placement the locked read path otherwise allows while holdout is inactive.

## Options

### Option 1 — `B3S-M1` purpose-limited ordering-journey credential

The server mints a short-lived opaque secret before it will return a Product Detail or
Customization recommendation set. It stores only a hash, scoped to the brand. The browser
presents the secret on later recommendation reads, observations, and the eventual explicit add.
When holdout is later activated, the server writes the assignment only for a journey that has
not yet been exposed, and it commits that assignment before a response can contain a set. The
first accepted `addCartLine` is the intended bind point when the journey header is present.
Commit coupling with the cart transaction is unresolved. The read never inserts a cart row.

Proposed classification: recommendation correlation, plus authorization to continue that
correlation. The proposal does not authorize cart reads, checkout, payment, or profile access.
It is still a new credential and a new persistence relation. Opacity is not safety. §7.7 must
be amended before this can match the locked read principal. That amendment is proposed and not
binding.

This is a proposal for §7.14 mechanism 1. It matches that mechanism only if the assignment
commits before any response that can contain a set, and only if an already-exposed journey is
not enrolled. Whether the new row and bearer are the customer identity forbidden by §7.20 and
Product Definition §16, or the second auth model forbidden by §13, is undecided.

### Option 2 — issued-set capability only

The server records `issued_set_id` when it returns a qualifying set and accepts observations
and actions only for members of that set. No journey secret exists before the set.

While holdout is inactive, one view can show Product Detail complements and a same-view add can
be marked if the capability is still in hand. A reload that loses the capability cannot prove
the earlier presentation. Attribution then fails closed. Commerce can still add, unmarked.

The set id is created at the moment the read can return a set. §7.14 calls that moment
exposure. The set id therefore cannot be the assignment that must exist before exposure.
A later cart created after an unlinked pre-cart render has no id that proves it is the same
journey. Enrolling that cart is the sequence §7.14 forbids. Treating the set id as a secret
that exists before the set is Option 1.

### Option 3 — cart-bound mechanism 2, no pre-cart module

This stays inside the current cart principal and inside Candidate 2. It creates no credential.
Activated and inactive pre-cart reads return no module, so no unowned issued set is written.
After the guest explicitly adds a line, later reads on that cart can satisfy §7.12 and §7.14.

It fails `US-036K-001` for a first-time guest. Fewer-than-three is allowed when eligibility
fails. It is not allowed merely because the guest has no cart. It also fails the locked read
path, which hides an empty cart only for the CART placement, and §7.14's inactive sentence that
eligible journeys may still receive recommendations.

Option 3 remains the safe fallback if the Founder rejects a new credential. Adopting it as the
V1 experience would be a Product Definition change. This batch does not make that change.

## Decision matrix

| Criterion | Option 1 `B3S-M1` | Option 2 set capability | Option 3 mechanism 2 |
|---|---|---|---|
| Product completeness | Meets first-visit Product Detail | Meets one view while holdout is inactive. Fails the same journey after reload or later activation | Fails first-visit Product Detail |
| Security | New bearer. Brand-scoped hash, header not cookie. XSS and fixation residuals remain | Set id becomes a bearer as soon as it authorizes replay. No owner before a cart | Uses the existing guest-cart bearer only after a real add |
| Privacy | New random journey row before purchase intent. No PII if the row stays minimal | Issued-set rows are still linkage. Pre-cart owner is missing | No pre-cart collection |
| Attribution | A header-present add can restate the §7.12 proofs. Continuity of that chain through claim is unresolved | Same-view chain only. Reload fails closed | Chain starts only after the first cart exists, so the first Product Detail complement cannot be assisted |
| Holdout | Mechanism 1. Assignment before exposure | Cannot bind the later cart without becoming Option 1 | No pre-cart exposure, so the forbidden sequence cannot occur. The product placement is withdrawn |
| Cart | No cart insert on read or mint | No cart insert if the set row is not a cart | No tracking cart. The module waits for a real add |
| Continuity | Bind on an explicit add that presents the header is intended. Commit coupling, late bind, and whether claim keeps that binding are unresolved | Lost when the capability is lost | Cart claim rules already exist. There is no pre-cart session to merge |
| Reliability | Mint or measurement failure returns no module. Ordering continues | Same fail-open | Same fail-open, with the module absent before a cart |
| Complexity | New credential, new row, §7.7 amendment | New set row plus an unsolved holdout link | No new principal |
| Operability | Needs expiry, brand mismatch, and abuse limits. The numeric limit is not chosen here | Needs set expiry and a rule that a lost pre-cart GET is not retried by id alone | Operable on the current cart TTL |

## Coordinator recommendation

Recommend `B3S-M1` as the only option that can show eligible Product Detail complements to a
first-time guest and still assign a holdout arm before that exposure when holdout is later
activated.

Do not select Option 2. It preserves one screen only by giving up journey continuity, and the
continuity fix is Option 1.

Do not select Option 3 as the V1 experience. It is the correct fallback only if a new
credential is refused. That refusal leaves `US-036K-001` unmet.

This recommendation is not a grant. `B3S-M1` needs the material decision in the Founder packet
and the proposed amendment. Until that decision, Candidate 2's prohibition on pre-cart
collection remains the safest reading of current authority.
