<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Gate disposition and Founder decision record

```text
RECORD_ID = WXE-FDR-CANDIDATE-1
PACKAGE = WXE-CANDIDATE-1
REFINEMENT = WXE-PD-XD-REFINEMENT-R2
```

## A. Product direction reconciliation

| Direction | Disposition |
|---|---|
| Desktop-first Workforce & Administration | Bound in PD/XD/DS; ratify on PR (`ACCEPTED_IN_CONVERSATION`) |
| Viewports 1366 / 1440 / 1920 | Bound; not a kitchen display system |
| Task-based seven-section IA | Proposed presentation; not domain split |
| Delivery / Takeaway / Now / Schedule | Founder presentation; **UOE UX-A owns shared label map**; WXE consumes |
| Reuse enterprise components | Bound |
| Independent amendments A/B/C | Bound |
| P0 separate corrective | **P0-A only**; Founder-authorized for PR #427 impl/publication; **merge/deploy unapproved** |
| Nav-layer collapse | **V1 chrome** (not FOLLOW_UP polish) |
| Commercial deep-linking | **FOLLOW_UP** (UPD-07) |

## B. PD-2 gate matrix (actual status — never invent PASS)

| Gate | Status |
|---|---|
| Founder Experience Direction | **ACCEPTED_IN_CONVERSATION** (ratify on this PR) |
| Product Definition Gate | **NOT_PERFORMED** |
| Experience Gate | **NOT_PERFORMED** |
| Architecture Fit | **CANDIDATE_ONLY** (Gaps 1–3 / IMP-032 proof-policy tension escalated) |
| Design Readiness | **CANDIDATE_ONLY** |
| Quality / Test Plan | **REVIEWABLE_DRAFT** |
| Measurement Plan | **REVIEWABLE_DRAFT** |
| Implementation Authorization | **NOT_GRANTED** |
| Future IMP identity | **NOT_ALLOCATED** |
| Founder UAT | **NOT_PERFORMED** |
| ROADMAP / STATE mutation | **NOT_PERFORMED** |

## C. Unified Founder decision register (WXE-UPD-01…09)

| ID | Decision | Options / status | Recommendation | Gate impact |
|---|---|---|---|---|
| **UPD-01** | Formal IMP identity / sequencing for full redesign | Defer until after Gate sitting + P0 merge decision | **DEFERRED** before implementation authorization | Not required to define product; R3 later |
| **UPD-02** | Administration entry permissions + Operations landing (+ P1-COMM operability) | **A:** Include permission-correct entry/routing + Commercial operability in V1 with capability-fixture and landing tests. **B:** Preserve current entry/routing for V1; defer change; reconcile V1 ACs to current behaviour | Recommend **A** for least-privilege honesty; **do not self-grant**; do not silent-select B to force Gate PASS | Open A/B is a **pre-Gate blocker** for any V1 promise that depends on the unsettled option |
| **UPD-03** | Kitchen/Delivery Administration entry via `outlet.read` | **Current:** `kitchen_operator` / `delivery_coordinator` enter Administration via `outlet.read`; kitchen also sees Commercial nav via `assortment.read`. Narrowing conflicts with `role-destination-safety.test.ts`. **A:** Narrow entry (update tests + document affected permissions). **B:** Preserve current entry for V1; defer narrowing | Recommend **A** only with explicit Founder authorization (RED-class); otherwise **B** with V1 ACs stating current behaviour unchanged — **do not self-grant** | Same pre-Gate blocker rule as UPD-02 if V1 promises narrowing |
| **UPD-04** | Future proprietary POS | Keep outside V1 | **OUT_OF_SCOPE** / separately governed `PRODUCT_DECISION_REQUIRED` | Non-blocking for V1 |
| **UPD-05** | `WXE-P0-CORRECTIVE-1` | Prior Founder authorization for **implementation and publication** of PR #427 is recorded; PR open/unmerged; CI green at last check; **merge and deploy remain unapproved** | Treat authorization as **already recorded**; decide merge/deploy separately | Not an open “authorize impl?” item; merge is separate R3 |
| **UPD-06** | Scheduling first-class nav | Yes / No | Recommend **Yes** (V1 discoverability); preserve as Founder ratification if not formally approved | Experience IA ratification |
| **UPD-07** | Commercial section deep-linking in V1 | Include / Defer | Recommend **Defer** (FOLLOW_UP) unless Founder expands scope | Non-blocking if FOLLOW_UP |
| **UPD-08** | Server Gaps 1–3 (proof policy, cancel auto-attestation, URL/body identity) | Authorize separate server corrective / accept deferred risk | Escalate; **unauthorized** in WXE docs and UI hotfix; record explicit risk acceptance if deferred | Architecture / security; not silent |
| **UPD-09** | UOE vs WXE shared Delivery/Takeaway + Now/Schedule labels | Confirm owner | **Resolved direction:** UOE UX-A owns; WXE consumes. PR #424 still candidate — sequencing dependency | Non-blocking if consumption rule holds |

### UPD-02 / UPD-03 — documented current entry (for option B baselines)

| Principal class | Current Administration entry | Current Commercial nav | Notes |
|---|---|---|---|
| Built-in with commercial reads | Also holds an existing Admin entry key (latent commercial-only gap) | Per commercial reads | P1-ENTRY latent |
| `outlet_manager` | Via store/org keys as today | Seen via assortment/pricing/promo reads; brand list needs `brand.read` → likely unusable | P1-COMM |
| `kitchen_operator` | Via `outlet.read` | Via `assortment.read` | UPD-03 |
| `delivery_coordinator` | Via `outlet.read` | Typically not commercial-operable | UPD-03 |

`role-destination-safety` implications: any UPD-03 **A** narrowing must update that test invariant in the same authorized change — not as a silent T0 hitchhiker.

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

### D2 — Post-refinement reviews (to be attached)

```text
REVIEW_WAVE = WXE_PD_XD_REFINEMENT_R2_INDEPENDENT
PRODUCT_VERDICT = PENDING_THIS_PUBLICATION
EXPERIENCE_VERDICT = PENDING_THIS_PUBLICATION
REVIEWED_COMMIT = PENDING_EXACT_HEAD_AFTER_PUSH
```

| Finding theme (prior) | Severity | Disposition after refinement |
|---|---|---|
| Widen P0-A | MAJOR | SEPARATE_CORRECTIVE PR #427; status corrected (not “shipped”) |
| Downgrade P0-B | MAJOR | P1-ENTRY / UPD-02 A/B |
| Ops landing without `order.read` | MAJOR | UPD-02 Ops landing rule |
| Permission-blind lifecycle buttons | MAJOR | V1 P1-A |
| UOE owns workforce order-type labels | MAJOR | UPD-09 |
| PD-2 Gate fields incomplete | MAJOR | PD rewritten in refinement |
| T0 Controlled Exception / UPD-05 stale | MAJOR | Prior auth recorded; merge unapproved |
| IMP-032 / Gaps 1–3 | MAJOR | Registered; UPD-08 |
| Dual H1/nested main on Orders | MAJOR | V1 P1-B |
| P1-COMM outlet_manager Commercial | MAJOR | UPD-02 |
| Missing X3 journeys | MAJOR | Expanded in journey doc |
| T0 risk owned entry union | MAJOR | Moved to T1 / UPD-02/03 |
| V1 nav collapse vs polish | MAJOR | Collapse = V1 chrome |

Same-scope candidate defects resolved in documentation. No application code changed.

## E. Explicit non-mutations

This package and its PR must not:

- Change application runtime behaviour
- Edit ROADMAP.md, STATE.md, decision-register.md, D-377
- Allocate/activate IMP identity
- Merge or deploy
- Modify UOE discovery package / PR #424
- Modify corrective PR #427 application scope
- Edit GitHub issues #376/#378/#380/#381 bodies
- Start T1 or claim Implementation Authorization

## F. Recommended Founder milestone motion

1. Review refined PR (`WXE-CANDIDATE-1` / #426)
2. Ratify desktop-first direction on the PR
3. Decide **UPD-02** and **UPD-03** (explicit A or B)
4. Ratify **UPD-06** Scheduling nav; confirm **UPD-07** FOLLOW_UP
5. Decide PR #427 **merge/deploy** separately from documentation; keep **UPD-08** server gaps explicit
6. Confirm **UPD-09** UOE label ownership (direction already recorded)
7. Perform Product/Experience Gate sittings only after A/B choices that gate V1 promises are settled
8. Documentation merge ≠ implementation authorization; IMP allocation remains UPD-01 deferred

## G. Alignment snapshot (authoring agent)

```text
Repository Authority: VERIFIED remote nivedhya11/BobaBear
Publication checkout: /home/ajoshi/repos/boba-bear-pr413-main-update (exclusive WXE; primary UOE occupied)
Vision Version: VISION-1
Roadmap Version: GTM-R190
State Version: STATE-R189
Architecture Version: ARCH-R23
Decision Register Version: DR-25
Product Delivery Version: PD-2
Product Definition: PD-WXE-CANDIDATE-1 (candidate)
Experience Definition: XD-WXE-CANDIDATE-1 (candidate)
Testing Policy: TEST-1
Accepted Through: IMP-036I
Current Product Slice: IMP-036J (pendingAcceptance)
Task Slice: WXE-PD-XD-REFINEMENT-R2 documentation only
Risk Level: R2
DELIVERY_MODE: PUBLISH_PR (existing PR #426 only)
APPLICATION_CODE_MUTATION: NO
Gate Result (alignment for docs authoring): PASS
PROMPT DEVIATIONS: NONE
```
