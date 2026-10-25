# Founder remediation decisions

```text
STATUS: DISCOVERY_EVIDENCE
AUTHORITY: NON_AUTHORITATIVE
SOURCE_HEAD: a6155378b799e06a95b28c593ac1a340d7ca9245
SOURCE_CORRECTION_AUTHORIZED: NO
LIVE_COMMERCIAL_MUTATIONS: NO
MAIN_MERGE: NO
DEPLOYMENT: NO
IMP036J_FOUNDER_UAT: NOT_PERFORMED
IMP036J_ACCEPTED: NO
ISSUE_391: OPEN
ISSUE_377: OPEN
```

These are decisions for a later implementation slice. This package does not grant them.

## Decision 1 — #391 historical disposition

The 16 October mismatch field was never stored. Do not close #391 because a later selection-order fix and a later copy fix can explain the symptom. The false “total changed” sentence is fixed when the resealed payable is equal. The order-only modifier comparison is fixed and covered by the disposable regression that passed in this batch.

Needed from the Founder: leave #391 open until a same-candidate explanation exists, or accept the selection-order class as the working explanation without calling the historical field confirmed.

## Decision 2 — bind fulfilment timing

`assertCommercialTermsStillAccepted` omits `fulfilmentTiming` while prepare passes it. A timing-scoped promotion can therefore fail at payment start after prepare accepted the seal. This was read from source and not executed. It is not established as the 16 October cause.

Needed from the Founder: authorize a later same-authority correction that passes the snapshot timing into that rebuild, only together with a disposable fake-provider regression, or decline it. Do not authorize a rule that pays whenever the displayed rupees match.

## Decision 3 — do not reject unavailable adds inside the Cart command

The Cart API still accepts a structurally valid unavailable variant. The menu hides Add only when an outlet projection says the item is unavailable. Blocking that add inside `addCartLine` changes the accepted split between cart intent and checkout evaluation.

Needed from the Founder: decline that rejection unless a separate product and architecture decision says otherwise. Recommended default: decline it.

## Decision 4 — name the unavailable line without removing the others

Checkout, the empty pickup list, and payment-prepare recovery do not name the affected line. Other lines stay. Cart naming already works when a delivery outlet evaluation produced the problem.

Needed from the Founder: authorize a later presentation slice that names the existing problem line on those three surfaces and keeps Review cart, or decline it. Do not authorize silent removal, a new pickup mode, or IMP-036K add-on visibility as part of that slice.

## What this batch does not ask the Founder to do

No Founder UAT verdict. No IMP-036J acceptance. No main merge. No staging or production deployment. No live payment. No new GitHub issue: #391 and #377 already own these problems.
