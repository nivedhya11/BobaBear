# Security and privacy threat model

```text
STATUS = NON_AUTHORITATIVE_DISCOVERY
AUTHORITY = NONE
CREDENTIAL_DEPLOYED = NO
COOKIE_ADDED = NO
HOLDOUT_ACTIVATED = NO
```

An opaque server id is not safe by itself. It can still be stolen, planted, logged, or used as
a cross-event key. This review judges `B3S-M1` as a bearer.

## Classification

| Question | `B3S-M1` answer |
|---|---|
| Authentication of a person | Proposed as no `CustomerActor` and no Better Auth session. Fit has not accepted that classification |
| Customer identity or profile | Undecided. PD §16 and architecture §7.20 forbid a new customer identity. Whether this bearer is that identity is the Founder and Fit question |
| Cart or purchase-intent authority | Proposed as none. Cart mutations continue to require the existing customer session or guest-cart token |
| Recommendation correlation | Proposed. Issued sets and observations would bind to the journey |
| Holdout continuity | Proposed only when a future activation writes the assignment before exposure, and never after exposure |
| Second auth model | Undecided. If Architecture Fit classifies the bearer as a second auth model, `B3S-M1` conflicts with architecture §13 and must not proceed |

Customer-auth already checks `checkTrustedOrigin`. Customer-commerce does not. A new cookie on
the customer-commerce façade would be sent by the browser without that origin check. `B3S-M1`
proposes a custom header and `sessionStorage`, the same bearer class as
`X-Boba-Guest-Cart-Token`. A cookie is prohibited. The minting response must be uncacheable
(`Cache-Control: no-store`) and must not be a shared cacheable read. A copy of the secret in a
`Cookie` or query string is ignored. Customer-commerce still has no `checkTrustedOrigin`; the
header is not a substitute for an uncacheable body.

## Threats for `B3S-M1`

| Threat | What goes wrong | Mitigation in this candidate | Residual |
|---|---|---|---|
| Replay | A stolen secret correlates the victim's later observations and the cart created in that tab | 32 CSPRNG bytes, store SHA-256 only, compare in constant time, brand-scoped lookup, expiry, header not URL | Replay works until expiry or bind. No rotation API is proposed |
| Fixation | An attacker plants a secret in the victim tab. The victim's add binds to the attacker's journey | The secret is not a cookie, so a cross-site page cannot plant it by itself. Binding rejects a journey already bound to a different cart | Same-tab script can write `sessionStorage`. This is the existing guest-token residual, moved earlier in the visit |
| XSS | Script reads `sessionStorage` or the one-time JSON field | Do not use `localStorage`. Return the raw secret once. Never log it. Never put it in analytics or query strings | The secret exists before purchase intent, so the sensitive window is longer than today's guest token |
| CSRF | A cross-site request presents the credential and records a false observation or binds a cart | Custom header is not attached automatically. Do not add a cookie. Customer-commerce still has no origin check | A future implementer who "simplifies" this to a cookie reopens CSRF |
| Cross-brand | One secret opens another brand's sets or cart | Lookup is hash plus `brandId`. Mismatch returns no correlation and does not mint against the other brand's row | The rule has to be implemented with the server-resolved brand, not a client brand field |
| Cross-customer | The secret becomes a profile key across logins or people | The row has no user id, phone, or email. Whether claim copies the journey id onto the surviving cart, and what sign-out does with a secret still in `sessionStorage`, is unresolved. A `bound_cart_id` joined to a customer is not accepted as a non-profile | Two people who share a browser profile share `sessionStorage` for that tab's lifetime |
| Logs and analytics | The raw secret or even the journey id becomes a permanent key | Log the journey id only in server diagnostics. Never log the raw secret. Analytics payloads stay inside §7.13: no credentials, no another customer's cart, no payment data | The journey id still links recommendation events. That is its job. Retention of those rows is `MD-036K-003` and is not chosen here |
| Guest-to-customer leak | Guest exposure or a guest arm is written onto a different customer's experiment | Do not write a new assignment at claim time. If the surviving cart already has an assignment, keep it. If the guest journey was already exposed and the customer cart has no assignment, do not enroll that cart | Which merged carts count in a future experiment is unresolved. Customer-visible commerce does not depend on that count |
| Multi-tab | Two tabs mint two journeys and, later, two carts | Accept per-tab journeys. That matches `sessionStorage` and today's guest carts. Do not add a shared cookie to collapse them | One person in two tabs is two journeys. That is a measurement limit, not a cart-merge rule |
| Concurrent first reads | Two requests both see no credential and mint two rows | Each response returns its own secret. The tab stores one. The loser expires. No cart is created | Orphan rows need expiry. They are not purchase intent |
| Abuse | A script mints journeys on every Product Detail view | An application throttle is required before any implementation. Edge rate limits are supplemental and are aimed at auth paths | The numeric threshold is an operability choice and is not selected in this candidate |
| Data minimization | The server stores a journey before the guest has formed purchase intent | Row contents are brand id, hash, timestamps, optional cart id, and optional assignment. No PII. No prior-session click history | This is new collection. It is the decision |
| Silent cart | An implementer creates an empty cart so the existing guest token can be reused | Forbidden. `POST /api/v1/cart` stays 404. A recommendation read writes no cart line | None if the prohibition is tested |
| Revocation | A disclosed secret keeps working | Expiry, brand mismatch, and single-cart binding are the revocation mechanisms. Explicit logout of a customer-bound journey drops browser authority | No standalone revoke route is proposed. Adding one would be a further API decision |

## Option 2 and Option 3 residuals

Option 2's set id has the same log-linkage and XSS exposure once the browser holds it, and it
still cannot prove the caller before a cart exists. Presenting only the id must not return
another caller's set. That is already `MQ-036K-002` in Candidate 2.

Option 3's residuals are the current guest-cart residuals: bearer in JSON and `sessionStorage`,
no rotation, sliding one-hour replay, no application cart rate limit found. It adds no pre-cart
secret. Its product cost is the missing first-visit module.

## Prohibited regardless of the decision

- Deploying a cookie, including a short-lived journey cookie, on customer-commerce.
- Creating a cart, empty or populated, in order to track, assign, or store a recommendation.
- Letting the browser author set membership, eligibility, rank, holdout arm, presentation proof,
  or an assistance mark.
- Activating the holdout or writing an assignment after exposure.
- Collecting a customer identifier, phone, email, profile, or prior-session click history for
  this correlation.
- Treating opacity as consent or as proof of ownership.
