<!--
  AUTHORITY: HISTORICAL_DISCOVERY_PROPOSAL
  ID: ARCH-UOE-LOCK-PROPOSAL-1
  PACKAGE: UOE-CANDIDATE-3
  SUPERSEDED_BY: docs/platform/capabilities/UOE-unified-order-experience.md
-->

# Architecture Lock proposal — Unified Order Experience (HISTORICAL)

```text
PROPOSAL_ID = ARCH-UOE-LOCK-PROPOSAL-1
PACKAGE = UOE-CANDIDATE-3
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
STATUS = SUPERSEDED_BY_CAPABILITY_ARCHITECTURE_LOCK
AUTHORITY = HISTORICAL_DISCOVERY_PROPOSAL
BINDING_CAPABILITY_ARCHITECTURE = docs/platform/capabilities/UOE-unified-order-experience.md
FORMAL_ARCHITECTURE_FIT_PASS = PASS
ARCHITECTURE_LOCK = YES
REVIEWED_CONTRACT_HEAD = 9a9e3f71789a4cce5141eb88b3ab606f72b2c54e
FOUNDER_FIT_LOCK_DECISION_DATE = 2026-10-23
FOUNDER_FIT_LOCK_DECISION_REFERENCE = https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6371582324
PER_PROCESS_RATE_LIMIT_RESIDUAL = ACCEPTED_FOR_V1_PILOT
DESIGN_READINESS = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
APPLICATION_CODE_MUTATION = NO
SCHEMA_MUTATION = NO
```

## Authority reconciliation

This file was the **decision-ready** discovery proposal
(`AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT`) reviewed at exact HEAD
`9a9e3f71789a4cce5141eb88b3ab606f72b2c54e`.

On 2026-10-23 the Founder explicitly approved:

1. **Architecture Fit PASS** for `UOE-CANDIDATE-3` / variant
   `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` at that HEAD
2. **Architecture Lock APPROVED** for contract `ARCH-UOE-LOCK-PROPOSAL-1` at that HEAD,
   including `PER_PROCESS_RATE_LIMIT_RESIDUAL = ACCEPTED_FOR_V1_PILOT`

The binding CURRENT capability architecture is now:

[`docs/platform/capabilities/UOE-unified-order-experience.md`](../../capabilities/UOE-unified-order-experience.md)

That path holds `AUTHORITY = CAPABILITY_ARCHITECTURE` and `ARCHITECTURE_LOCKED = YES`. This
discovery file remains **historical provenance only** so the package does not retain a
contradictory `NON_AUTHORITATIVE_DISCOVERY_DRAFT` document marked LOCKED. Full technical contract
text (§§2–5) lives in the capability architecture; git history at `9a9e3f717…` preserves the
pre-promotion proposal body byte-for-byte.

```text
DO_NOT_TREAT_THIS_FILE_AS_CURRENT_ARCHITECTURE = YES
COMPETING_CURRENT_ARCHITECTURAL_DESCRIPTION = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
UOE_DR_01_SEQUENCING = DEFERRED
UOE_DR_06_REMEDIATION_AUTHORIZATION = NO
STOP_BEFORE = DESIGN_READINESS | IMPLEMENTATION | MERGE | DEPLOY
```
