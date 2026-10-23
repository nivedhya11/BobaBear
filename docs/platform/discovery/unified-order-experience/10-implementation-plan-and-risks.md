<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: IP-UOE-CANDIDATE-1 -->

# Three-tranche implementation plan and risk matrix

```text
CANDIDATE_ID = IP-UOE-CANDIDATE-1
STATUS = PLAN_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
PREFERRED_SHAPE = ONE_FUTURE_IMP_WITH_THREE_TRANCHES
```

## Delivery boundaries

| Workstream | Boundary |
|---|---|
| UX-A | Presentation maps + copy on customer + workforce primary labels |
| UX-B | Compact scheduling UI wired to existing scheduled APIs |
| UX-C | Universal bar + order-context coordinator + PAYMENT_PENDING guard |
| Not in V1 | Menu-level exact window preview API (unless UOE-DR-02 decides otherwise) |
| Not in V1 | Pre-checkout Takeaway outlet eligibility / mode-aware cart evaluate API (unless UOE-DR-05) |
| Never | Domain/API renames; Snapshot/payment authority changes; new PAYMENT_PENDING server guards (preserve existing) |

## Tranche plan (candidate)

### Tranche 1 — UX-A foundations + shared maps

- Customer + workforce primary label maps (Delivery / Takeaway, Now / Schedule, promise phrases)
- Remove ordinary customer “fulfil / fulfilment” copy on ordering surfaces
- Orientation vs Deliver to copy hooks (refinement B) even before full bar
- Content QA snapshots
- **Exit:** AS-19 + jargon audit on primary customer surfaces; no behaviour change to money paths

### Tranche 2 — UX-B compact scheduling

- TimingChooser sheet/popover; Now meaning microcopy
- Replace primary long grid in checkout; reusable from future bar
- Preserve windows/TZ/cutoff/bind revalidation
- **Exit:** AS-08–11 (+ AS-10); scheduled regression green

### Tranche 3 — UX-C universal bar + context owner

- OrderContextBar on Menu / Cart / Checkout
- `boba.order-context.v1` coordinator dual-reading delivery-context
- Mode/place/time editing; impact banner; pending-payment isolation
- UNCONFIRMED Schedule intent (no speculative slots)
- **Exit:** AS-01–07, AS-12–18; concurrency + recovery proofs

Sequence: T1 → T2 → T3. Bar may ship with Schedule intent + checkout-time exact slots.

## Effort (indicative, not commitment)

| Package | Range | Confidence |
|---|---|---|
| T1 UX-A | 2–4 eng-days | M |
| T2 UX-B | 4–7 eng-days | M |
| T3 UX-C | 8–14 eng-days | M–L |
| QA / a11y / content | 4–7 days | M |

No conversion lift promised.

## Risk and dependency matrix

| ID | Risk / dependency | Class | Mitigation |
|---|---|---|---|
| R1 | Browse context mutates PAYMENT_PENDING | CR3 | **Preserve** existing server freeze + client recovery; UX guard routes only; AS-17 |
| R2 | Duplicate geo authority | CR2 | Single delivery-context owner |
| R3 | Speculative Menu slots | CR2 | V1 intent-only; UOE-DR-02 |
| R4 | “Now” understood as immediate | X3 | Protective copy; Content QA |
| R5 | Workforce label drift (Pickup vs Takeaway) | X2 | UX-A maps; AS-19 |
| R6 | Fee/offer surprise | CR2/CR3 | Impact banner + Checkout Review |
| R7 | Stale async overwrites | CR2 | Generation tokens; AS-16 |
| R8 | Parallel IMP-036J UAT / payment probes | Program | Do not couple; no shared dirty tree |
| R9 | #379 scope creep | Program | Bound to A/B/C |
| R10 | Missing baseline metrics | Measurement | Disclose gap; instrument before claiming lift |
| D1 | IMP-036H/I accepted contracts | Dep | Reuse; do not reopen |
| D2 | delivery-context + LocationSelector | Dep | Extend, don’t fork |
| D3 | listCheckoutScheduledWindows(checkoutId) | Dep | Checkout-bound exact times |
| D4 | Future ROADMAP ID vs IMP-036J/K | Dep | UOE-DR-01 |
| D5 | listCheckoutPickupOptions(checkoutId) | Dep | Checkout-bound outlets; UOE-DR-05 if pre-checkout needed |

## Authorization wall

```text
NO implementation tranche may start without:
  Product Definition Gate PASS
  Experience Gate PASS
  Architecture Fit PASS + lock as required
  Design Readiness PASS
  Quality / Test Plan finalized
  Measurement Plan finalized (X3)
  Explicit future IMP identity + implementation authorization
```
