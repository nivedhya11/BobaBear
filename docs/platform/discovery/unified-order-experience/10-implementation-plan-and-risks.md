<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: IP-UOE-CANDIDATE-3 -->

# Three-tranche implementation plan and risk matrix

```text
CANDIDATE_ID = IP-UOE-CANDIDATE-3
SUPERSEDES = IP-UOE-CANDIDATE-2
STATUS = PLAN_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
UOE_DR_01 = NOT_ALLOCATED_SEQUENCING_DEFERRED
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_GATE = PASS
ARCHITECTURE_FIT_PASS = NOT_GRANTED
PREFERRED_SHAPE = ONE_FUTURE_IMP_WITH_THREE_TRANCHES
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION = YES
```

## Delivery boundaries

| Workstream | Boundary |
|---|---|
| UX-A | Presentation maps + copy on customer + workforce primary labels + **WhatsApp + in-app** (DR-04) |
| UX-B | Compact scheduling UI wired to existing scheduled APIs at eligible checkout |
| UX-C | Universal bar + **tab-scoped** order-context coordinator + PAYMENT_PENDING guard |
| DR-05 server reads/quotes | Timing-aware pre-checkout Takeaway eligibility + mode-sensitive cart evaluate (Fit contracts; GP-01…04) |
| Checkout Schedule path | Timing-aware `listCheckoutPickupOptions` (or timing-intent-before-list) + AS-34–38 recovery; remediates accepting-now-only defect |
| Not in V1 | Menu-level exact window preview API (UOE-DR-02 deferred); cross-tab presentation sync |
| Never | Domain/API renames; Snapshot/payment authority changes; second commercial authority; new lifecycle states; new PAYMENT_PENDING server guards (preserve existing); Schedule denied solely because closed NOW; divergent browse money when Snapshot reuse evidence missing |

## Tranche plan (candidate)

### Tranche 1 — UX-A foundations + shared maps

- Customer + workforce primary label maps (Delivery / Takeaway, Now / Schedule, promise phrases)
- WhatsApp + in-app same-meaning updates via `customer-visible-content` (DR-04); verify Meta template body vs variable before T1 exit
- Remove ordinary customer “fulfil / fulfilment” copy on ordering surfaces (incl. “fulfilment window”)
- Orientation vs Deliver to copy hooks (refinement B) even before full bar
- Content QA snapshots
- **Exit:** AS-19 + AS-28 + jargon audit on primary customer surfaces; no behaviour change to money paths beyond copy

### Tranche 2 — UX-B compact scheduling + DR-05 evaluate/eligibility foundations

- TimingChooser sheet/popover; Now meaning microcopy
- Replace primary long grid in checkout; reusable from future bar
- Preserve windows/TZ/cutoff/bind revalidation; Menu remains Schedule intent-only
- Server: timing-aware pre-checkout eligibility read + cart evaluate mode/outlet/timing input (Fit contracts; promotion context)
- Checkout: timing-aware pickup-options + bind→windows→evaluate→prepare journey (Contract C / AS-41)
- Open-Checkout reuse before Delivery-location early return; missing commercial-evaluation evidence fail-closed; fingerprint/dedup (AS-29/AS-31/AS-32/AS-39/AS-40/AS-45–46)
- Timing-sensitive provisional Offers when Schedule UNCONFIRMED (AS-42–44)
- Empty/no-cart distinct from UNAVAILABLE (AS-30)
- **Exit:** AS-08–11, AS-24–27, AS-29–46 (API+client foundation); scheduled regression green; no new lifecycle states

### Tranche 3 — UX-C universal bar + context owner

- OrderContextBar on Menu / Cart / Checkout
- `boba.order-context.v1` coordinator dual-reading delivery-context (**tab-scoped**; GP-04)
- Mode/place/time editing; impact banner from mode-sensitive evaluate; pending-payment isolation
- UNCONFIRMED Schedule intent (no speculative Menu slots); Schedule-capable when closed NOW
- Wire PlaceChooser to eligibility propose/select; Checkout confirm/bind unchanged
- **Exit:** AS-01–07, AS-12–18, AS-20–23, AS-26, AS-29–33; concurrency + recovery proofs

Sequence: T1 → T2 → T3. Bar ships with Schedule intent + checkout-time exact slots;
Takeaway place + cart quote may use T2 server foundations before full bar polish in T3.

## Effort (indicative, not commitment)

| Package | Range | Confidence |
|---|---|---|
| T1 UX-A (+ channels) | 3–5 eng-days | M |
| T2 UX-B + DR-05 contracts | 6–11 eng-days | M–L |
| T3 UX-C | 8–14 eng-days | M–L |
| QA / a11y / content | 5–8 days | M |

No conversion lift promised.

## Risk and dependency matrix

| ID | Risk / dependency | Class | Mitigation |
|---|---|---|---|
| R1 | Browse context mutates PAYMENT_PENDING | CR3 | **Preserve** existing server freeze + client recovery; UX guard routes only; AS-17 |
| R2 | Duplicate geo authority | CR2 | Single delivery-context owner |
| R3 | Speculative Menu slots | CR2 | DR-02 deferred; intent-only Schedule at Menu |
| R4 | “Now” understood as immediate | X3 | Protective copy; Content QA |
| R5 | Workforce label drift (Pickup vs Takeaway) | X2 | UX-A maps; AS-19 |
| R6 | Fee/offer surprise / quote treated as seal | CR2/CR3 | Impact banner + Checkout Review; cart quote ≠ Snapshot; AS-25 |
| R7 | Stale async overwrites | CR2 | Generation tokens; AS-16, AS-27 |
| R8 | Parallel IMP-036J UAT / payment probes | Program | Do not couple; no shared dirty tree |
| R9 | #379 scope creep | Program | Bound to A/B/C + DR-04/05 contracts |
| R10 | Missing baseline metrics | Measurement | Disclose gap; instrument before claiming lift |
| R11 | Second commercial authority creep | CR3 | Fit non-authority table; AS-24/25 negatives |
| R12 | Channel rewrite unbounded | Program | DR-04 = WhatsApp + in-app only; email/SMS/push out of scope while noop |
| R13 | Meta template re-approval latency for DR-04 wording | Program | Verify body-vs-variable before T1 exit; in-app updates independent |
| R14 | Schedule Takeaway falsely denied when closed NOW | CR2 | GP-01; Now vs Schedule-capable contracts; AS-08 |
| R15 | Empty-cart “no outlets” | X2 | GP-03; AS-30 |
| R16 | Cross-tab money/seal sync from sessionStorage | CR3 | GP-04; tab-scoped only; AS-22 |
| R17 | Browse evaluate fights open Checkout / missing effective mode | CR3 | GP-02; AS-29/AS-31/AS-32 |
| D1 | IMP-036H/I accepted contracts | Dep | Reuse; do not reopen |
| D2 | delivery-context + LocationSelector | Dep | Extend, don’t fork |
| D3 | listCheckoutScheduledWindows(checkoutId) | Dep | Checkout-bound exact times |
| D4 | Future ROADMAP ID vs IMP-036J/K | Dep | UOE-DR-01 NOT_ALLOCATED / sequencing DEFERRED |
| D6 | Checkout composition defect remediation | Dep | UOE-DR-06 ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT; preferred separate corrective; NOT_AUTHORIZED here |
| D5 | ASAP pickup eligibility + scheduled-pickup profile + evaluateCart | Dep | Reuse for DR-05 reads/quotes |

## Authorization wall

```text
NO implementation tranche may start without:
  Product Definition Gate PASS          ← recorded PASS (2026-10-23)
  Experience Gate PASS                  ← recorded PASS (2026-10-23)
  Architecture Fit PASS + lock as required  ← evaluation recommended; PASS NOT_GRANTED
  Design Readiness PASS
  Quality / Test Plan finalized
  Measurement Plan finalized (X3)
  Explicit future IMP identity + implementation authorization  ← UOE-DR-01 still NOT_ALLOCATED
```
