<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: IP-UOE-CANDIDATE-3 -->

# Three-tranche implementation plan and risk matrix

```text
CANDIDATE_ID = IP-UOE-CANDIDATE-3
SUPERSEDES = IP-UOE-CANDIDATE-2
STATUS = PLAN_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
UOE_DR_01 = FUTURE_IMP_ID_NOT_ALLOCATED / SEQUENCING_DEFERRED
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_GATE = PASS
ARCHITECTURE_FIT_PASS = PASS
ARCHITECTURE_LOCK = APPROVED
ARCHITECTURE_CONTRACT = ARCH-UOE-LOCK-PROPOSAL-1
BINDING_CAPABILITY_ARCHITECTURE = docs/platform/capabilities/UOE-unified-order-experience.md
DESIGN_READINESS_PASS = NOT_GRANTED
QUALITY_PLAN_FINALIZATION = NOT_GRANTED
MEASUREMENT_PLAN_FINALIZATION = NOT_GRANTED
UOE_DR_06 = ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT
UOE_DR_06_REMEDIATION = NOT_AUTHORIZED
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
| Checkout Schedule path (Contract C) | **Specified** in Design Readiness (`07-…`) and Quality plan (`08-…`) for truthful Schedule-capable Takeaway. **Code remediation** of accepting-now-only Checkout composition remains `UOE-DR-06` / `REMEDIATION_NOT_AUTHORIZED` — requires a separately governed corrective or later explicitly authorized delivery scope. Design Readiness revision does **not** authorize Checkout mutation. |
| Not in V1 | Menu-level exact window preview API (UOE-DR-02 deferred); cross-tab presentation sync |
| Never | Domain/API renames; Snapshot/payment authority changes; second commercial authority; new lifecycle states; new PAYMENT_PENDING server guards (preserve existing); Schedule denied solely because closed NOW; divergent browse money when Snapshot reuse evidence missing; silent Checkout remediation via Design docs alone |

## Tranche plan (candidate)

### Tranche 1 — UX-A foundations + shared maps

- Customer + workforce primary label maps (Delivery / Takeaway, Now / Schedule, promise phrases)
- In-app same-meaning updates via `customer-visible-content` (DR-04). On-wire WhatsApp is excluded until WA-01 bodies exist (`16-…` §4.3, `17-…`). T1 does not wait on Meta bodies
- Remove ordinary customer “fulfil / fulfilment” copy on ordering surfaces (incl. “fulfilment window”). Do not edit D-357 post-purchase labels in `order-status.ts`
- Orientation vs Deliver to copy hooks (refinement B) even before full bar
- Content QA snapshots
- **Exit:** AS-19 + AS-28 + jargon audit on primary customer surfaces; no behaviour change to money paths beyond copy

### Tranche 2 — UX-B compact scheduling + DR-05 evaluate/eligibility foundations

- TimingChooser sheet/popover; Now meaning microcopy
- Replace primary long grid in checkout **when Checkout Schedule-path remediation is separately authorized**; reusable from future bar
- Preserve windows/TZ/cutoff/bind revalidation; Menu remains Schedule intent-only
- Server: timing-aware pre-checkout eligibility read + cart evaluate mode/outlet/timing input (Fit contracts; promotion context) — Contracts A/B
- **Contract C (Checkout Schedule sequencing):** Design and test plans **specify** timing-aware pickup-options + bind→windows→evaluate→prepare (AS-34–38 / AS-41). **Implementation of Checkout composition fix** = `UOE-DR-06` remediation → `REMEDIATION_NOT_AUTHORIZED` under this package / Design Readiness revision. Preferred separately scoped corrective after urgent payment work; do not treat T2 design exit as Checkout-mutation authorization.
- Open-Checkout reuse before Delivery-location early return; missing commercial-evaluation evidence fail-closed; fingerprint/dedup (AS-29/AS-31/AS-32/AS-39/AS-45–46) — Contracts A/B paths that do not require DR-06 Checkout rewrite may proceed only under future implementation authorization. AS-40 bar reflection is UX-C
- Timing-sensitive provisional Offers when Schedule UNCONFIRMED (AS-42–AS-43). AS-44 Menu non-guarantee is UX-C
- Empty/no-cart distinct from UNAVAILABLE (AS-30)
- **Exit (when implementation authorized):** the UX-B rows in `18-…` (Contracts A/B, including Menu/pre-checkout AS-08 and non-Checkout AS-09/AS-33). AS-34, AS-41, and the Checkout-coupled rows stay `BLOCKED_DR06`. No new lifecycle states.

### Tranche 3 — UX-C universal bar + context owner

- OrderContextBar on Menu / Cart / Checkout
- `boba.order-context.v1` coordinator dual-reading delivery-context (**tab-scoped**; GP-04)
- Mode/place/time editing; impact banner from mode-sensitive evaluate; pending-payment isolation
- UNCONFIRMED Schedule intent (no speculative Menu slots). The bar may show a schedule-capable result from the UX-B read. It does not implement that read, and it does not implement the Checkout list (UOE-DR-06)
- Wire PlaceChooser to eligibility propose/select; Checkout confirm/bind unchanged
- **Exit:** presentation scenarios owned by `19-…` (AS-01, AS-12–14, AS-17, AS-20–22, AS-40, AS-44, and the presentation half of the shared rows). AS-23 and the Contract A/B server rows stay UX-B (`18-…`). Checkout-coupled rows stay UOE-DR-06

Sequence: T1 → T2 → T3. Owner conflicts between this section and `17-…` / `18-…` / `19-…` resolve toward those tranche contracts. The source map is `21-…` §4. Bar ships with Schedule intent + checkout-time exact slots;
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
| R13 | Meta template re-approval latency for DR-04 wording | Program | On-wire stays excluded until WA-01. In-app UX-A does not wait on Meta bodies |
| R14 | Schedule Takeaway falsely denied when closed NOW | CR2 | GP-01; Now vs Schedule-capable contracts; AS-08 |
| R15 | Empty-cart “no outlets” | X2 | GP-03; AS-30 |
| R16 | Cross-tab money/seal sync from sessionStorage | CR3 | GP-04; tab-scoped only; AS-22 |
| R17 | Browse evaluate fights open Checkout / missing effective mode | CR3 | GP-02; AS-29/AS-31/AS-32 |
| D1 | IMP-036H/I accepted contracts | Dep | Reuse; do not reopen |
| D2 | delivery-context + LocationSelector | Dep | Extend, don’t fork |
| D3 | listCheckoutScheduledWindows(checkoutId) | Dep | Checkout-bound exact times |
| D4 | Future ROADMAP ID vs IMP-036J/K | Dep | UOE-DR-01 NOT_ALLOCATED / sequencing DEFERRED |
| D6 | Checkout composition defect remediation | Dep | UOE-DR-06 ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT; preferred separate corrective; smallest proposal in `14-…` §5; NOT_AUTHORIZED here |
| D5 | ASAP pickup eligibility + scheduled-pickup profile + evaluateCart | Dep | Reuse for DR-05 reads/quotes |

## Authorization wall

```text
NO implementation tranche may start without:
  Product Definition Gate PASS          ← recorded PASS (2026-10-23)
  Experience Gate PASS                  ← recorded PASS (2026-10-23)
  Architecture Fit PASS + Architecture Lock  ← recorded PASS / APPROVED (2026-10-23)
  Design Readiness PASS                 ← NOT_GRANTED (candidate in 07-…)
  Quality / Test Plan finalized         ← NOT_PERFORMED (candidate in 08-…)
  Measurement Plan finalized (X3)       ← NOT_PERFORMED (candidate in 09-…)
  Explicit future IMP identity + implementation authorization  ← UOE-DR-01 still NOT_ALLOCATED / SEQUENCING_DEFERRED

Checkout Contract C code remediation additionally requires:
  UOE-DR-06 remediation authorization   ← NOT_AUTHORIZED (separate corrective or later explicit scope)
```
