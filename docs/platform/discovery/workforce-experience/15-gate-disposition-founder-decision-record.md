<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Gate disposition and Founder decision record

```text
RECORD_ID = WXE-FDR-CANDIDATE-1
PACKAGE = WXE-CANDIDATE-1
TASK = WXE-FOUNDER-PD-XD-GATE-RECORD-R3
REVIEWED_CONTRACT_HEAD = 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
```

## A. Product direction reconciliation

| Direction | Disposition |
|---|---|
| Desktop-first Workforce & Administration | **Bound** — ratified with Product/Experience Gate PASS |
| Viewports 1366 / 1440 / 1920 | Bound; not a kitchen display system |
| Task-based seven-section IA | Bound as V1 presentation; not domain split |
| Delivery / Takeaway / Now / Schedule | Founder presentation; **UOE UX-A owns shared label map**; WXE consumes (UPD-09) |
| Reuse enterprise components | Bound |
| Independent amendments A/B/C | Bound |
| P0 separate corrective | **P0-A only**; Founder-authorized for PR #427 impl/publication; **merge/deploy unapproved** (UPD-05) |
| Nav-layer collapse | **V1 chrome** (not FOLLOW_UP polish) |
| Commercial deep-linking | **FOLLOW_UP** (UPD-07) |
| Scheduling first-class nav | **V1** — Founder UPD-06 = YES |

## B. PD-2 gate matrix (recorded status)

| Gate | Status |
|---|---|
| Founder Experience Direction | **ACCEPTED** (desktop-first; ratified with XD Gate) |
| Product Definition Gate | **PASS** (Founder decision; see §H1) — specification completeness only |
| Experience Gate | **PASS** (Founder decision; see §H2) — specification completeness only |
| Architecture Fit | **CANDIDATE_ONLY** — **NOT_GRANTED** |
| Design Readiness | **CANDIDATE_ONLY** — **NOT_GRANTED** |
| Quality / Test Plan | **REVIEWABLE_DRAFT** — **NOT_FINALIZED** |
| Measurement Plan | **REVIEWABLE_DRAFT** — **NOT_FINALIZED** |
| Implementation Authorization | **NOT_GRANTED** |
| Future IMP identity | **NOT_ALLOCATED** (UPD-01 DEFERRED) |
| Founder UAT | **NOT_PERFORMED** |
| ROADMAP / STATE mutation | **NOT_PERFORMED** |
| PR #426 merge | **NO** |
| PR #427 merge / deploy | **NO** |
| Server Gaps 1–3 risk acceptance | **NOT_GRANTED** (UPD-08 SEPARATE_CORRECTIVE) |

```text
FOUNDER_PRODUCT_DEFINITION_GATE = PASS_RECORDED
FOUNDER_EXPERIENCE_GATE = PASS_RECORDED
ARCHITECTURE_FIT = NOT_GRANTED
ARCHITECTURE_LOCK = NO
DESIGN_READINESS = NOT_GRANTED
QUALITY_PLAN = NOT_FINALIZED
MEASUREMENT_PLAN = NOT_FINALIZED
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
IMPLEMENTATION_AUTHORIZED = NO
```

A Gate `PASS` approves **specification completeness**, not implementation readiness or operational safety.

## C. Unified Founder decision register (WXE-UPD-01…09)

| ID | Decision | Binding treatment | Gate impact |
|---|---|---|---|
| **UPD-01** | Formal IMP identity / sequencing | **DEFERRED** | Not required for PD/XD Gate PASS |
| **UPD-02** | Administration entry + Ops landing + P1-COMM | **OPTION_A APPROVED** for V1 Product/Experience scope | P1-ENTRY, P1-COMM, AS-01/02, GJ-W8 → **V1_ACCEPTANCE_SLICE** |
| **UPD-03** | Kitchen/Delivery Administration entry via `outlet.read` | **OPTION_B APPROVED** — preserve current behaviour for V1 | Narrowing → **FOLLOW_UP**; preserve `role-destination-safety` |
| **UPD-04** | Future proprietary POS / KOT / new kitchen states | **OUT_OF_V1** / OUT_OF_SCOPE | Non-blocking |
| **UPD-05** | `WXE-P0-CORRECTIVE-1` | Prior Founder auth for PR #427 **impl/publication**; **merge/deploy NOT_AUTHORIZED** | Separate R3 |
| **UPD-06** | Scheduling first-class nav under Store Management | **YES** — V1 Experience Definition | AS-11 V1; reuse existing scheduling capabilities only |
| **UPD-07** | Commercial section deep-linking | **FOLLOW_UP** | Non-blocking for these gates |
| **UPD-08** | Server Gaps 1–3 | **SEPARATE_CORRECTIVE**; no release-risk acceptance granted | Architecture / security; not closed by PD/XD PASS |
| **UPD-09** | Shared Delivery/Takeaway + Now/Schedule labels | **UOE_UX_A_OWNS_SHARED_LABELS**; WXE consumes | Non-blocking if consumption rule holds |

### UPD-02 = OPTION_A (binding detail)

**Founder decision: APPROVED FOR V1 PRODUCT/EXPERIENCE SCOPE** (2026-10-24 Asia/Kolkata).

V1 must include:

- Permission-correct Administration destination entry (commercial-read capability union with existing Admin entry keys)
- Commercial-read capability entry union
- Operations landing on the first authorized usable Operations surface
- P1-ENTRY and P1-COMM within V1
- Capability-fixture tests for least-privilege role combinations
- Commercial navigation that never knowingly leads operators into unusable destinations
- Correct handling of `outlet_manager` without a false assumption of `brand.read`

**Critical boundary (binding):** This approval is for desired navigation and operability behaviour. It does **not** grant new permissions, broaden server RBAC, authorize a new API, or invent a second Commercial authority. If existing API or permission constraints prevent the desired outcome, Architecture Fit must identify the exact conflict and escalate. Do **not** silently grant `brand.read`.

### UPD-03 = OPTION_B (binding detail)

**Founder decision: PRESERVE CURRENT BEHAVIOR FOR V1** (2026-10-24 Asia/Kolkata).

- Kitchen and delivery roles continue to enter Administration through their existing `outlet.read`-based entry path
- Do **not** narrow or revoke their existing Administration entry as part of WXE V1
- Defer any separate Administration-entry restriction to a future governed decision
- Preserve existing server permission semantics and `role-destination-safety` safeguards

### UPD-02 A + UPD-03 B compatibility

- UPD-02 A makes destinations and Commercial affordances operable and capability-correct
- UPD-03 B preserves the existing Kitchen/Delivery Administration entry entitlement
- Hiding or adjusting an unusable individual navigation affordance must **not** silently revoke a server permission or remove the approved Administration entry
- Escalate any unresolved conflict during Architecture Fit rather than inventing behaviour

### UPD-06 = YES (binding detail)

**Founder decision: YES** (2026-10-24 Asia/Kolkata).

Scheduling becomes first-class navigation under Store Management in the V1 Experience Definition. Reuse existing scheduling capabilities. Do **not** create new scheduling APIs, eligibility rules, lifecycle states, or a second scheduling authority.

### Principal-class entry baseline (for implementation planning; not new RBAC)

| Principal class | Administration entry (V1) | Commercial nav (V1 under UPD-02 A) | Notes |
|---|---|---|---|
| Built-in with commercial reads | Entry via Admin keys **union** commercial reads | Operable when destination is usable | P1-ENTRY V1 |
| `outlet_manager` | Via store/org keys as today | Show only when operable; no false `brand.read` assumption | P1-COMM V1 |
| `kitchen_operator` | **Preserve** via `outlet.read` (UPD-03 B) | Via `assortment.read` today; hide unusable Commercial without revoking Admin entry | UPD-03 B |
| `delivery_coordinator` | **Preserve** via `outlet.read` (UPD-03 B) | Typically not commercial-operable; hide unusable Commercial without revoking Admin entry | UPD-03 B |

## D. Independent review record

### D1 — Historical STOP reviews (preserve)

```text
REVIEW_WAVE = WXE_PD_XD_GATE_READINESS_R0
REVIEWED_HEAD = 3c2e0643fedae09f3c1fb2055d8a8fb1f4397aad
PRODUCT_VERDICT = RECOMMENDED_STOP
EXPERIENCE_VERDICT = RECOMMENDED_STOP
OVERALL = REQUIRES_BOUNDED_CANDIDATE_REFINEMENT
STATUS = HISTORICAL_EVIDENCE
```

Material themes addressed in refinement: V1/FOLLOW_UP slicing; X3 journey depth; UPD register
freshness (incl. UPD-05 vs open #427); Gaps 1–3 register; T0 vs T1 Admin-entry matrix.

### D2 — Post-refinement independent reviews (preserve)

```text
REVIEW_WAVE = WXE_PD_XD_REFINEMENT_R2_INDEPENDENT
PRODUCT_REVIEWED_COMMIT = c7564db307fd6242d87fd63e577b0f7e27282948
PRODUCT_VERDICT = RECOMMENDED_PASS
EXPERIENCE_FIRST_PASS_COMMIT = c7564db307fd6242d87fd63e577b0f7e27282948
EXPERIENCE_FIRST_PASS_VERDICT = RECOMMENDED_STOP
EXPERIENCE_REREVIEW_COMMIT = 6160a35462acc8f8b4073218815c524395e7e432
EXPERIENCE_REREVIEW_VERDICT = RECOMMENDED_PASS
CONTRACT_HEAD_AT_FOUNDER_SITTING = 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
```

Product reviewer: ready for Founder PD/XD decision sitting; UPD-02/03/06 were Founder-owned.
Experience first pass STOP → same-scope doc repair → re-review PASS at `6160a3546`.
Agent `RECOMMENDED_PASS` is **not** formal Gate PASS. Formal PASS is Founder-only (§H).

| Finding theme (prior) | Severity | Disposition after refinement |
|---|---|---|
| Widen P0-A | MAJOR | SEPARATE_CORRECTIVE PR #427; status corrected (not “shipped”) |
| Downgrade P0-B | MAJOR | P1-ENTRY / UPD-02 → **A** (V1) |
| Ops landing without `order.read` | MAJOR | UPD-02 Ops landing rule → **A** (V1) |
| Permission-blind lifecycle buttons | MAJOR | V1 P1-A |
| UOE owns workforce order-type labels | MAJOR | UPD-09 |
| PD-2 Gate fields incomplete | MAJOR | PD rewritten in refinement; Gate executed §H1 |
| T0 Controlled Exception / UPD-05 stale | MAJOR | Prior auth recorded; merge unapproved |
| IMP-032 / Gaps 1–3 | MAJOR | Registered; UPD-08 |
| Dual H1/nested main on Orders | MAJOR | V1 P1-B |
| P1-COMM outlet_manager Commercial | MAJOR | UPD-02 → **A** (V1) |
| Missing X3 journeys | MAJOR | Expanded in journey doc |
| T0 risk owned entry union | MAJOR | Moved to T1 / UPD-02/03 |
| V1 nav collapse vs polish | MAJOR | Collapse = V1 chrome |

Same-scope candidate defects resolved in documentation. No application code changed by this recording task.

## E. Explicit non-mutations

This package and its PR must not:

- Change application runtime behaviour or RBAC tables
- Edit ROADMAP.md, STATE.md, decision-register.md, D-377
- Allocate/activate IMP identity
- Merge or deploy PR #426 or #427
- Modify UOE discovery package / PR #424
- Modify corrective PR #427 application scope
- Edit GitHub issues #376/#378/#380/#381 bodies
- Grant Architecture Fit, Design Readiness, Quality/Measurement finalization, or Implementation Authorization
- Invent new permissions, APIs, or a second Commercial / scheduling authority

## F. Post-Gate next steps (not authorized by this record)

1. Architecture Fit evaluation against UPD-02 A / UPD-03 B / UPD-06 YES (escalate API/RBAC conflicts; do not invent permissions)
2. Design Readiness, Quality Plan, Measurement Plan finalization under PD-2
3. Separate R3 for PR #427 merge/deploy; UPD-08 server corrective
4. UPD-01 IMP identity only when Founder authorizes allocation
5. Documentation merge ≠ implementation authorization

## G. Alignment snapshot (recording agent)

```text
Repository Authority: VERIFIED remote nivedhya11/BobaBear
Publication checkout: /home/ajoshi/repos/boba-bear-pr413-main-update (exclusive WXE; primary UOE occupied)
Reviewed contract HEAD: 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
Vision Version: VISION-1
Roadmap Version: GTM-R190
State Version: STATE-R189
Architecture Version: ARCH-R23
Decision Register Version: DR-25
Product Delivery Version: PD-2
Experience Standard: EXP-1
Product Language: LANG-1
Product Definition: PD-WXE-CANDIDATE-1
Experience Definition: XD-WXE-CANDIDATE-1
Testing Policy: TEST-1
Accepted Through: IMP-036I
Current Product Slice: IMP-036J (pendingAcceptance)
Task Slice: WXE-FOUNDER-PD-XD-GATE-RECORD-R3 documentation recording only
Risk Level: R2 (documentation under Founder R3 decisions)
DELIVERY_MODE: PUBLISH_PR (existing PR #426 only)
APPLICATION_CODE_MUTATION: NO
Gate Result (alignment for docs recording): PASS
PROMPT DEVIATIONS: NONE
```

## H. Founder Gate executions (two separate decisions)

### H1 — Product Definition Gate (Founder)

```text
DECISION_ID = WXE-FOUNDER-PRODUCT-DEFINITION-GATE
AUTHORITY = Explicit Founder approval ("proceed")
DECISION_DATE = 2026-10-24
DECISION_TIMEZONE = Asia/Kolkata
REVIEWED_CONTRACT_HEAD = 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
PRODUCT_DEFINITION = PD-WXE-CANDIDATE-1
PRODUCT_DEFINITION_GATE_EXECUTION = PERFORMED
RESULT = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
LINKED_EXPERIENCE_DEFINITION = XD-WXE-CANDIDATE-1
IMPLEMENTATION_AUTHORIZED = NO
```

Evidence: Founder reply **"proceed"** to the fully specified decision request for `WXE-CANDIDATE-1`, including UPD-02 = OPTION_A, UPD-03 = OPTION_B, UPD-06 = YES, UPD-07 = FOLLOW_UP, UPD-09 = UOE_UX_A_OWNS_SHARED_LABELS, and Product Definition Gate PASS as a distinct Founder decision from the Experience Gate.

### H2 — Experience Gate (Founder)

```text
DECISION_ID = WXE-FOUNDER-EXPERIENCE-GATE
AUTHORITY = Explicit Founder approval ("proceed")
DECISION_DATE = 2026-10-24
DECISION_TIMEZONE = Asia/Kolkata
REVIEWED_CONTRACT_HEAD = 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
EXPERIENCE_DEFINITION = XD-WXE-CANDIDATE-1
EXPERIENCE_GATE_EXECUTION = PERFORMED
RESULT = PASS
EXPERIENCE_CRITICALITY = X3
UNRESOLVED_EXPERIENCE_DECISIONS = NONE (within approved Product/Experience Gate scope)
IMPLEMENTATION_AUTHORIZED = NO
```

Deferred beyond these gates (intentionally not erased): UPD-01 IMP identity; UPD-07 Commercial deep-linking; UPD-08 server Gaps 1–3; UPD-05 merge/deploy; Architecture Fit / Design / Quality / Measurement / Implementation Authorization.

Evidence: same Founder **"proceed"** sitting; Experience Gate PASS recorded as a **separate** Founder decision from Product Definition Gate PASS.
