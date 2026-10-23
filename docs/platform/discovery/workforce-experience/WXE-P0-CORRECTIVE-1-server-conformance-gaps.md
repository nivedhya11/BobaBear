<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_NOTE | PACKAGE: WXE-P0-CORRECTIVE-1 -->

# WXE-P0-CORRECTIVE-1 — Remaining server conformance gaps

```text
PACKAGE = WXE-P0-CORRECTIVE-1
SCOPE = DOCUMENTATION_ONLY
SERVER_POLICY_CHANGED_BY_UI_HOTFIX = NO
IMP032_SEMANTICS_CHANGED = NO
```

This note records **known server-side conformance gaps** that remain after the UI safety
correction in `WXE-P0-CORRECTIVE-1`. The UI hotfix reduces accidental fabricated-evidence
submission and one-click terminal actions. It does **not** close these server gaps.

## Gap 1 — Arbitrary non-empty proof reference

| Field | Value |
|---|---|
| Location | `src/shared/delivery/parse-input.ts` → `parseRecordProofAndDeliverInput` |
| Behaviour | `proofReference` requires only a non-empty string within length bounds |
| Contract tension | IMP-032 capability wording indicates confirmation must not treat arbitrary free text as sufficient proof |
| UI mitigation | Empty defaults; required field; consequence review; operator-entered disclaimer |
| UI does **not** claim | Verified external-provider proof |
| Required next step | Separate Founder / architecture decision before changing server proof policy under T0 |

## Gap 2 — `workforceCancelDelivery` automatic inactivity attestation

| Field | Value |
|---|---|
| Location | `src/server/delivery/workforce.ts` → `workforceCancelDelivery` |
| Behaviour | For non-`REQUESTED` deliveries, cancel routes through `resolveManualBookingCancellation` with `inactiveBookingConfirmed: true` injected server-side |
| Contract tension | Manual booking cancellation resolution otherwise requires explicit `inactiveBookingConfirmed === true` from the caller; cancel path bypasses that operator attestation |
| UI mitigation | Cancel still requires operator-entered codes/reasons and consequence review; resolve-failure / resolve-cancellation UI no longer hard-codes attestation |
| UI does **not** fix | Server auto-attestation on cancel |
| Required next step | Separate server correction authorized outside T0 UI hotfix |

## Explicit non-claims

- This UI package does **not** provide verified external-provider evidence.
- This UI package does **not** harden server proof acceptance rules.
- This UI package does **not** remove `workforceCancelDelivery` auto-attestation.
- Closing either gap requires an explicit Founder / architecture decision (possible CR3 if server contracts change).
