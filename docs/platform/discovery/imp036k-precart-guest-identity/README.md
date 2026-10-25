# IMP-036K pre-cart guest identity — discovery candidate

```text
STATUS = NON_AUTHORITATIVE_DISCOVERY
AUTHORITY = NONE
BATCH = BOBA-B3S-IMP036K-PRECART-IDENTITY-20261025
BASE = origin/main a6155378b799e06a95b28c593ac1a340d7ca9245
IMPLEMENTATION = NO
SCHEMA_CHANGE_AUTHORED = NO
RUNTIME_CHANGE = NO
ARCHITECTURE_FIT = NOT_PERFORMED
ARCHITECTURE_AMENDMENT_BINDING = NO
FORMAL_QUALITY_GATE = NOT_AUTHORIZED
FORMAL_MEASUREMENT_GATE = NOT_AUTHORIZED
IMPLEMENTATION_AUTHORIZED = NO
MERGE_TO_MAIN = NO
DO_NOT_MERGE = YES
```

This folder is a design candidate for a Founder architecture decision. It does not amend
`ROADMAP.md`, `STATE.md`, the decision register, the locked capability architecture, the approved
Product Definition, or the approved Experience Definition. It does not rewrite PR #460 or PR #463.

## Contents

| Document | Role |
|---|---|
| [01-architecture-options-and-source-evidence.md](./01-architecture-options-and-source-evidence.md) | Verified guest lifecycle and the option matrix |
| [02-security-privacy-threat-model.md](./02-security-privacy-threat-model.md) | Threats, residuals, and what stays prohibited |
| [03-lifecycle-and-trust-boundaries.md](./03-lifecycle-and-trust-boundaries.md) | Proposed sequence for the recommended mechanism |
| [04-quality-measurement-impact.md](./04-quality-measurement-impact.md) | Impact on Quality Candidate 2 and Measurement Candidate 2 |
| [05-founder-architecture-decision-packet.md](./05-founder-architecture-decision-packet.md) | The decision request |
| [06-proposed-architecture-amendment.md](./06-proposed-architecture-amendment.md) | Unlocked amendment text for a later Architecture Fit review |
| [07-independent-review-dispositions.md](./07-independent-review-dispositions.md) | Review findings and how this candidate answered them |

## Dependencies

- Locked architecture on this base: `docs/platform/capabilities/IMP-036K-revenue-recommendations.md`
- Approved definitions on this base: `docs/platform/product/IMP-036K/`
- PR #460 `c0230d4601cae639352813298e3ab6b5c75d2dec` on `docs/b3-imp036k-qt-mi-candidate-20261025`
- PR #463 `fd117572264981960182d3f44763f7260215ea87` on `docs/b3r-imp036k-gate-corrections-20261025`

PR #463 remains the corrected Quality and Measurement candidate. This batch does not edit it.
Its independent PASS recommendations are not formal grants.

## Recommended mechanism

`B3S-M1` — a purpose-limited, brand-scoped, server-issued ordering-journey credential that can
exist before any Cart. It is proposed as recommendation correlation and holdout continuity.
Whether it is a customer identity, a login, or a second auth model is undecided. The proposal
does not create a Cart on a recommendation read. The recommendation is not a grant.
See the Founder packet.
