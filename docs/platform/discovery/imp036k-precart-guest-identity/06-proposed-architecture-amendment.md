# Proposed architecture amendment — not binding

```text
STATUS = PROPOSED
AUTHORITY = NONE
TARGET = docs/platform/capabilities/IMP-036K-revenue-recommendations.md
TARGET_LOCK = ARCHITECTURE_LOCKED on a6155378b799e06a95b28c593ac1a340d7ca9245
CANDIDATE = IMP-036K-PRECART-JOURNEY-AMENDMENT-1
ARCHITECTURE_FIT = NOT_PERFORMED
ARCHITECTURE_GATE = NOT_PASS
BINDING = NO
IMPLEMENTATION_AUTHORIZED = NO
NEW_ADR = NO
GLOBAL_ARCHITECTURE_REVISION = NO
DECISION_REGISTER_REVISION = NO
```

This text is input to a future independent Architecture Fit review. It does not edit the locked
capability file. It does not mark Architecture Fit PASS. It does not create D-386 or any other
decision id.

## Why an amendment is required

§7.14 already allows the Measurement Plan to choose mechanism 1 and already says the ordering
journey is not a new customer identity. That sentence is not enough to implement `B3S-M1`.

§7.7 currently says customer recommendation reads use the existing customer or guest cart
principal. Before the first add, that principal does not exist. A read that mints a different
credential contradicts §7.7. §9 does not yet list the journey verifier row. §13 forbids a second
auth model, so the amendment has to classify the credential narrowly enough that Fit can accept
or reject that classification on purpose.

Burying this inside a Measurement Plan edit would hide a new credential, a new row, and a new
read principal. `MD-036K-008` may record the Founder outcome. It cannot replace Architecture Fit.

## Proposed replacement sentences

§7.7, customer read principal, proposed:

```text
CUSTOMER_RECOMMENDATION_READ_PRINCIPALS =
  existing customer cart principal
  | existing guest cart principal
  | purpose-limited ordering-journey credential
ORDERING_JOURNEY_AUTHORIZES =
  recommendation set correlation
  presentation-observation validation
  holdout assignment continuity when activation exists
```

The proposal asks Fit to test, and not to treat as decided, these classifications: the credential
is not a customer identity, is not authentication, and is not cart authority. If Fit rejects any
of them, the principal sentence above is rejected with them.

§7.14, proposed selection for the pre-cart guest path:

```text
PRE_CART_GUEST_HOLDOUT_MECHANISM = MECHANISM_1
ASSIGNMENT_BEFORE_EXPOSURE = REQUIRED_WHEN_HOLDOUT_ACTIVATED
MECHANISM_2_REMAINS_THE_SUPPRESSION_RULE =
  when activation is on and no assignment exists yet
JOURNEY_KEY_EXCLUDES = customer auth user id, phone, email, guest-cart token copy
CROSS_SESSION_PROFILE = NO
```

§8 read path, proposed replacement of the locked step "if holdout is activated and no stable
server-owned assignment exists: return no module". For a journey that has not been exposed:
establish the assignment, commit it, then continue. For a journey that has already been exposed:
write no assignment. The locked file's "return no module" remains until Fit replaces it. This
is not an insertion beside the locked step. A recommendation read still does not insert a cart.

```text
journey never exposed and holdout activated and assignment missing
  → commit assignment, then continue
journey already exposed
  → write no assignment
holdout arm
  → return no module and write no issued set
assignment write fails
  → return no module and write no issued set
```

§9, proposed later row:

```text
Ordering-journey verifier
  Owner: server record of brand, hash, expiry, optional cart binding, optional assignment
  Must not: store the raw secret, a customer profile, a guest-cart token copy,
            a browser-authoritative flag, or a cart line
```

§7.20 remains in force: `NEW_CUSTOMER_IDENTITY = NO` and `CROSS_SESSION_PERSONALIZATION = NO`.
§13 remains in force: a second auth model is forbidden. This amendment proposes that Fit test
the bearer against those sentences. It does not paste `ORDERING_JOURNEY_IS_AUTHENTICATION = NO`
or `SECOND_AUTH_MODEL = NO` as decided text. If Fit classifies the bearer as a second auth
model, this amendment is rejected and `B3S-M1` stops. Option 3's product conflict would then
need its own Product Definition decision. This document does not take that product decision.

Inactive holdout writes no assignment. A journey verifier row while inactive is part of this
proposal and is not authorized by the locked sentence "Inactive configuration writes nothing."

## Fit review questions

1. Does mechanism 1 plus a hash-only journey verifier stay inside "not a new customer identity"?
2. Does authorizing correlation and holdout continuity, and nothing commercial, stay inside
   "no second auth model"?
3. Is `sessionStorage` plus a custom header an acceptable fixation and XSS residual, given
   customer-commerce does not apply the customer-auth origin check and a cookie is worse?
4. Is refusing to write a new assignment at cart claim sufficient for §7.14?
5. Does any approved story require the journey to survive a new browser tab? The candidate
   says no, matching today's guest-cart tab isolation.

## What Fit must not do

- Mark this file PASS by reference.
- Authorize implementation, schema, or a cookie.
- Activate holdout.
- Edit PR #463 in place.
- Change `acceptedThrough`, `currentProductSlice`, or `IMP036K_IMPLEMENTATION_AUTHORIZED`.
