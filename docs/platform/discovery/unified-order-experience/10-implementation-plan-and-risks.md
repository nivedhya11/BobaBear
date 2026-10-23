<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: IP-UOE-CANDIDATE-2 -->

# Three-tranche implementation plan and risk matrix

```text
CANDIDATE_ID = IP-UOE-CANDIDATE-2
SUPERSEDES = IP-UOE-CANDIDATE-1
STATUS = PLAN_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
PREFERRED_SHAPE = ONE_FUTURE_IMP_WITH_THREE_TRANCHES
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
```

## Delivery boundaries

| Workstream | Boundary |
|---|---|
| UX-A | Presentation maps + copy on customer + workforce primary labels + **WhatsApp + in-app** (DR-04) |
| UX-B | Compact scheduling UI wired to existing scheduled APIs at eligible checkout |
| UX-C | Universal bar + order-context coordinator + PAYMENT_PENDING guard |
| DR-05 server reads/quotes | Pre-checkout Takeaway eligibility read + mode-sensitive cart evaluate (Fit contracts) |
| Not in V1 | Menu-level exact window preview API (UOE-DR-02 deferred) |
| Never | Domain/API renames; Snapshot/payment authority changes; second commercial authority; new PAYMENT_PENDING server guards (preserve existing) |

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
- Server: smallest pre-checkout eligibility read + cart evaluate mode/outlet input (Fit contracts)
- Open-Checkout reuse precedence for evaluate (AS-29) must be preserved / explicit
- **Exit:** AS-08–11, AS-24–27, AS-29 (API+client foundation); scheduled regression green

### Tranche 3 — UX-C universal bar + context owner

- OrderContextBar on Menu / Cart / Checkout
- `boba.order-context.v1` coordinator dual-reading delivery-context
- Mode/place/time editing; impact banner from mode-sensitive evaluate; pending-payment isolation
- UNCONFIRMED Schedule intent (no speculative Menu slots)
- Wire PlaceChooser to eligibility propose/select; Checkout confirm/bind unchanged
- **Exit:** AS-01–07, AS-12–18, AS-20–23, AS-26, AS-29; concurrency + recovery proofs

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
| D1 | IMP-036H/I accepted contracts | Dep | Reuse; do not reopen |
| D2 | delivery-context + LocationSelector | Dep | Extend, don’t fork |
| D3 | listCheckoutScheduledWindows(checkoutId) | Dep | Checkout-bound exact times |
| D4 | Future ROADMAP ID vs IMP-036J/K | Dep | UOE-DR-01 |
| D5 | Pickup eligibility domain + evaluateCart | Dep | Reuse for DR-05 reads/quotes |

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
