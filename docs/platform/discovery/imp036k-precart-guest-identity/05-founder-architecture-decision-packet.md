# Founder architecture decision packet

```text
STATUS = READY_FOR_FOUNDER_ARCH_DECISION
AUTHORITY = NONE
GRANT = NO
FORMAL_GATE_PASS = NOT_AUTHORIZED
MERGE_TO_MAIN = NO
```

## Decision request

Approve or reject `B3S-M1`.

`B3S-M1` is a purpose-limited ordering-journey credential the server would mint before a guest
has a Cart, so Product Detail can show eligible complements and a future holdout can be assigned
before that exposure. The server would store a hash. The browser would hold the raw secret in
`sessionStorage` and send it on a custom header. The minting response would be uncacheable.
Whether that bearer is a customer identity, a login, or a second auth model is undecided.
The proposal does not create purchase intent: a recommendation read inserts no cart. The first
real add still creates the guest cart only when a line is accepted. Binding the journey to that
cart is the intended point, and the commit protocol is unresolved.

Rejection leaves mechanism 2: a first-time guest sees no Product Detail recommendations until
something is added to the Cart. That preserves current security authority and misses
`US-036K-001`. Making that miss the official experience would be a separate Product Definition
change. This packet does not request that change.

## Why current authority cannot close this

```text
DECISION_REQUIRED
question: May IMP-036K mint a purpose-limited pre-cart ordering-journey credential, and amend locked §7.7 so recommendation reads may use it, without making that credential a customer identity or a cart?
why_current_authority_is_insufficient: US-036K-001 requires Product Detail complements before any cart. §7.12 requires a server-owned correlation the same caller can present again. §7.14 forbids assigning holdout after that journey was already exposed. §7.7 allows only the existing customer or guest cart principal, and addCartLine creates that guest principal only together with the first line. No anonymous commerce session exists. D-383 does not authorize a new identity. Measurement Candidate 2 records the gap as MD-036K-008 and prohibits collection until a Founder decision.
option_a: Approve B3S-M1 and send 06-proposed-architecture-amendment.md to independent Architecture Fit. Do not implement, do not activate holdout, and do not finalize Quality or Measurement until Fit accepts the amendment.
option_b: Reject B3S-M1. Keep mechanism 2 and Candidate 2's collection prohibition. Accept that first-visit Product Detail recommendations stay unavailable until a later Product Definition change says so.
cursor_recommendation: option_a
decision_owner: Founder, followed by independent Architecture Fit before the amendment can bind. This packet does not grant either.
blocked_scope: IMP-036K implementation, schema, formal Quality finalization, formal Measurement finalization, holdout activation, and any PR merge of this candidate.
work_continuing_elsewhere: None in this batch. PR #460 and PR #463 stay untouched.
```

## What approval would authorize next

Approval of option A authorizes only the next review of the amendment. It does not authorize
runtime work, a migration, a cookie, a public API release, plan finalization, or implementation.

Before implementation authorization the following still have to be true:

- Architecture Fit PASS on the amendment, recorded in the locked capability architecture by a
  later governed change.
- Quality and Measurement plans revised from Candidate 2 to name `B3S-M1`, then independently
  reviewed. `MD-036K-001`, `MD-036K-002`, `MD-036K-003`, `MD-036K-004`, `MD-036K-005`, and
  `MD-036K-007` may remain deferred. `MD-036K-006` is the measurement review itself.
  `MD-036K-008` would be answered by this decision.
- The test oracles in the lifecycle document and the impact addendum included in the Quality
  plan.
- `IMP036K_IMPLEMENTATION_AUTHORIZED` still flipped only by the existing lifecycle authority.

## What this packet already refuses

- A cookie on customer-commerce.
- An empty cart used as a tracking session.
- Client-authored recommendation membership.
- Holdout activation.
- A customer profile, phone, email, or auth user id as the journey key.
- Self-granted Architecture Fit, Quality, Measurement, Founder UAT, or IMP acceptance.

## Provenance

| Item | Value |
|---|---|
| Repository | `/home/ajoshi/repos/boba-bear-b3s-precart-20261025` at `a6155378b799e06a95b28c593ac1a340d7ca9245`. This packet does not treat `/home/ajoshi/repos/boba-bear-platform` as the authority checkout |
| Base | `a6155378b799e06a95b28c593ac1a340d7ca9245` |
| Versions | VISION-1, GTM-R190, STATE-R189, ARCH-R23, DR-25, PD-2, EXP-1, LANG-1, TEST-1 |
| Lifecycle | `acceptedThrough` IMP-036I, `currentProductSlice` IMP-036J, `nextProductSlice` IMP-036K, implementation of IMP-036K not authorized |
| Product | `PD-IMP-036K-DRAFT-1` APPROVED / PASS |
| Experience | `XD-IMP-036K-DRAFT-1` APPROVED / PASS, criticality X3 |
| Architecture | Fit PASS / LOCKED, candidate `IMP-036K-FIT-CANDIDATE-1`, review `5391917727` |
| Design Readiness | PASS, review `5396061135` |
| PR #460 | `c0230d4601cae639352813298e3ab6b5c75d2dec` |
| PR #463 | `fd117572264981960182d3f44763f7260215ea87` |
