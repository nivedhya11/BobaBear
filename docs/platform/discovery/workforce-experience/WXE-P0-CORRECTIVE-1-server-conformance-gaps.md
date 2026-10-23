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

## Gap 3 — URL `orderId` vs body `deliveryId` identity binding

| Field | Value |
|---|---|
| Location | `src/server/operations/http/delivery-routes.ts` command switch; most mutators accept body `deliveryId` / revision while the route path supplies `orderId` |
| Behaviour | Path `orderId` is used for GET and `arrange`; several other workforce delivery commands pass the JSON body through and rely on body `deliveryId` without an explicit path↔body Order ownership check at the HTTP façade |
| Contract tension | A mismatched client could theoretically POST under Order A’s URL with Delivery B’s body identity if authorization/domain layers do not reject the pair |
| UI mitigation | Panel binds commands to the currently selected Order + loaded Delivery; resets local evidence/dialogs on Order or Delivery identity change; drops stale async responses and confirmation payloads that no longer match active identity |
| UI does **not** claim | Server-enforced URL/body Order↔Delivery ownership binding |
| Required next step | Separate Founder authorization before changing IMP-032 proof acceptance, automatic inactivity attestation, or adding server-side path/body identity binding |

## Explicit non-claims

- This UI package does **not** provide verified external-provider evidence.
- This UI package does **not** harden server proof acceptance rules.
- This UI package does **not** remove `workforceCancelDelivery` auto-attestation.
- This UI package does **not** add server-side URL/body Order↔Delivery identity binding.
- Closing these gaps requires an explicit Founder / architecture decision (possible CR3 if server contracts change).
