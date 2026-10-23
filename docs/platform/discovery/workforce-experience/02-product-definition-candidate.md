<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Product Definition candidate — Workforce Experience

```text
PD_ID = PD-WXE-CANDIDATE-1
PACKAGE = WXE-CANDIDATE-1
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
PRODUCT_DEFINITION_GATE = NOT_PERFORMED
EXPERIENCE_CRITICALITY = X3 (capability rated at highest boundary; X2 workflows remain inside)
CHANGE_RISK = CR2 (capability rated at highest boundary: refund / access-mutation / commercial publish-effect / delivery-proof)
IMPLEMENTATION_AUTHORIZED = NO
REFINEMENT = WXE-PD-XD-REFINEMENT-R2
```

## 1. Capability statement

Provide a **consistent, desktop-first Workforce and Administration experience** so authorized
operators can complete daily order fulfilment, store configuration, commercial authoring, and
access administration with clear hierarchy, terminology, navigation, and safe consequential
actions — **without** inventing new business-domain authorities, POS lifecycle, or duplicate
authoritative editors.

## 2. Business outcome

Reduce time-to-safe-action for store and brand operators on laptop/desktop, eliminate misleading
or fabricated-evidence paths in delivery operations, and make every granted capability reachable
through a coherent task-based presentation — improving operational reliability before GTM scale.

## 3. Approved experience decisions (Founder conversation)

| ID | Decision | Binding for this candidate |
|---|---|---|
| WXE-FD-01 | Workforce & Administration are desktop first | Yes — evidence: conversation acceptance recorded as `ACCEPTED_IN_CONVERSATION` (ratify on PR) |
| WXE-FD-02 | Primary targets 1366×768, 1440×900, 1920×1080 (+ larger ops displays) | Yes — not a kitchen display system |
| WXE-FD-03 | Laptop productivity over mobile-first composition | Yes |
| WXE-FD-04 | Retain basic responsive + accessibility; no mobile authoring feature parity | Yes |
| WXE-FD-05 | Task-first IA; seven presentation groups | Presentation only |
| WXE-FD-06 | Primary order methods Delivery / Takeaway; timing Now / Schedule | Future presentation; **shared label map owned with UOE UX-A** (see terminology) |
| WXE-FD-07 | Reuse enterprise components | Yes |
| WXE-FD-08 | Operations ≠ full POS; POS future = `PRODUCT_DECISION_REQUIRED` | Yes |

LANG-1 does **not** independently require Now / Takeaway.

## 4. Primary personas (not 1:1 roles)

| Persona | Goals | Example role mappings (non-exclusive) |
|---|---|---|
| Shift fulfilment operator | Clear order queue; accept/fulfil/hand over | kitchen_operator, outlet_manager |
| Delivery coordinator | Book/assign/proof without fake evidence | delivery_coordinator |
| Store operator | Hours, status, area, availability, team | outlet_manager, kitchen_operator |
| Brand commercial author | Draft/live catalog, menu, prices, offers | brand_admin |
| Access administrator | Memberships, roles, diagnostics, audit | platform_super_admin, brand_admin |
| Support / finance operator | Read orders; refunds where permitted | support_refund_operator, finance_viewer |

## 5. Journeys / story map (candidate)

See [`08-operator-journey-scenarios.md`](./08-operator-journey-scenarios.md) for golden journeys,
X3 journey contracts, and acceptance scenarios. Story map themes and candidate stories:

| Theme | Candidate stories (DoR mapping deferred until IMP allocation) |
|---|---|
| Enter & orient | Hub chooser; permission-correct Ops/Admin entry; unauthorized deep-link recovery; outlet context |
| Fulfil today | Today/Orders queue; Delivery evidence hygiene; Takeaway hand-over; refund with step-up; cancel↔refund; delivery failure recovery; session/step-up recovery |
| Configure store | Store status; hours; Scheduling discoverability; delivery area; takeaway settings; availability |
| Author commercial & effect safely | Draft/live clarity; publish/activate with review; menu section/entry terminal consequence review; Review inspection-only |
| Manage people & diagnose access | Invite/create membership; grant/revoke; suspend/offboard; Effective Permissions read-only |
| Audit & health | Access audit; system/operational health |

### Acceptance slicing

Slice vocabularies used below:

```text
V1_ACCEPTANCE_SLICE | FOLLOW_UP | DEFERRED | SEPARATE_CORRECTIVE | OUT_OF_SCOPE
```

| Item | Slice | Notes / Founder dependency |
|---|---|---|
| Desktop IA chrome — single persistent section nav (collapse from triple bars) | **V1_ACCEPTANCE_SLICE** | Core V1 navigation contract (`04` Navigation layers). Not “polish”. |
| Nav micro-interaction polish after collapse (animation, optional density tweaks) | **FOLLOW_UP** | Non-blocking refinement after V1 chrome lands |
| Admin breadcrumbs + single H1 (incl. Orders dual-H1 / nested main = P1-B) | **V1_ACCEPTANCE_SLICE** | |
| Order detail safety — capability-gated lifecycle + mode-sensitive placement (P1-A) | **V1_ACCEPTANCE_SLICE** | |
| Delivery/Takeaway + Now/Schedule presentation labels | **V1_ACCEPTANCE_SLICE** | Consumes UOE UX-A shared map when that contract is approved; sequencing dependency on UOE PR #424 |
| Scheduling first-class nav discoverability (P2-C) | **V1_ACCEPTANCE_SLICE** | Candidate recommendation Yes; **Founder ratification WXE-UPD-06** |
| Commercial section deep-linking | **FOLLOW_UP** | WXE-UPD-07 — deferred unless Founder expands V1 |
| Store settings immediate customer-effect confirmations (P2-G) | **FOLLOW_UP** | Protective friction classification after V1 chrome |
| Measurement instrumentation pipeline | **FOLLOW_UP** | |
| P1-ENTRY — Administration entry union + Operations landing | **V1_ACCEPTANCE_SLICE *or* FOLLOW_UP** | **Depends on Founder WXE-UPD-02 choice A vs B** (see §13). Do not silently pick B. |
| P1-COMM — outlet_manager Commercial operability | **V1_ACCEPTANCE_SLICE *or* FOLLOW_UP** | Tied to UPD-02 commercial operability rule; same A/B dependency |
| Kitchen/Delivery Administration entry via `outlet.read` (UPD-03) | **V1_ACCEPTANCE_SLICE *or* FOLLOW_UP** | **Depends on Founder WXE-UPD-03 choice A vs B**. Current behaviour remains until Founder decides. |
| P1-C — menu section/entry activate/retire consequence review | **V1_ACCEPTANCE_SLICE** | X3 commercial safety; implementation proposed in T3 planning only |
| P0-A / `WXE-P0-CORRECTIVE-1` delivery evidence UI hygiene | **SEPARATE_CORRECTIVE** | Founder-authorized; published on PR #427; **not merged, not deployed, not formally accepted** as of verified checkpoint. **Do not say “already shipped.”** |
| Server Gaps 1–3 (proof policy, cancel auto-attestation, URL/body identity) | **SEPARATE_CORRECTIVE** | Documented; UI does not close; WXE-UPD-08 |
| Proprietary POS / KOT / counter billing / new READY kitchen state | **OUT_OF_SCOPE** / **DEFERRED** | WXE-UPD-04; future governed slice |
| Customer UOE surfaces | **OUT_OF_SCOPE** | Owned by UOE package |

**V1 entry/routing rule until Founder decides UPD-02/03:** do **not** treat current behaviour as an approved deferral (that would be silent **B**). AS-01/02, GJ-W8, P1-ENTRY/P1-COMM, and kitchen/delivery Admin entry remain **Founder-choice dependent**. Until A or B is chosen, those items are pre-Gate blockers for any V1 promise that depends on them; other V1 chrome/safety items may proceed for Gate sitting preparation.

### Acceptance scenarios → slice map

| Scenario | Slice |
|---|---|
| WXE-AS-01, WXE-AS-02 | Founder-choice dependent (UPD-02); if B → FOLLOW_UP with current-entry V1 baseline |
| WXE-AS-03, WXE-AS-05…07, WXE-AS-10, WXE-AS-11, WXE-AS-13…15, WXE-AS-23, WXE-AS-24 | V1_ACCEPTANCE_SLICE |
| WXE-AS-04 | SEPARATE_CORRECTIVE (P0-A / PR #427) + V1 non-claims once merged; V1 must not claim provider-verified proof |
| WXE-AS-08, WXE-AS-09 | V1_ACCEPTANCE_SLICE (P1-C / Review) |
| WXE-AS-12 | V1_ACCEPTANCE_SLICE (diagnostic framing) |
| WXE-AS-16…22 (X3 journey ASs) | V1 where grounded in accepted domain; AS-18 depends on PR #427 merge for terminal-confirm hygiene |
| Commercial deep-link ASs | FOLLOW_UP |

## 6. In scope / out of scope

**In scope:** navigation, breadcrumbs, hierarchy, terminology alignment, permission-correct affordances, desktop interaction standard, P0/P1 defect register, one canonical home per action, draft/live clarity, X3 journey contracts that reuse accepted domain behaviour.

**Out of scope:** proprietary POS, new kitchen lifecycle states, KOT, counter billing, new order aggregates, customer ordering redesign (UOE), mobile authoring parity, unimplemented destinations (including delivery return/cost UI), ROADMAP/STATE mutation, silent IMP-032 acceptance rewrite, inventing new refund entitlements or booking “re-book” UI.

## 7. Actors, permissions, authorization variants

Navigation from effective permissions **and** resource scope. Server authorization authoritative.

| Variant | Expected |
|---|---|
| Multi-app principal | Hub chooser |
| Ops-only | **UPD-02 A:** Operations landing = first authorized ops nav item. **UPD-02 B:** preserve current `order.read`-gated Ops destination / Today landing |
| Admin/commercial | **UPD-02 A:** Administration reachable with commercial-read union + operable Commercial. **UPD-02 B:** preserve current entry unions; P1-COMM deferred |
| Unauthorized deep link | AccessDenied → Applications |
| Multi-outlet | Outlet switch preserves context |
| Kitchen/Delivery Admin entry | Current: via `outlet.read`; change only under UPD-03 |

## 8. Observable behaviour + paths

Happy / alternate / empty / error / recovery / concurrency / destructive — see Experience Definition
journey-specific UX contracts and [`08-operator-journey-scenarios.md`](./08-operator-journey-scenarios.md).
Destructive: lifecycle cancel, refund, grant/revoke, suspend, retire, delivery fail/cancel — require
consequence review or confirmation class already accepted for those surfaces.

## 9. Service / operational impact

Changes operator presentation and safety of delivery evidence entry. Customer promises
(accepted/fulfilled/delivered/collected) unchanged in domain. “Prepare for collection” is
**off-system human work**, not a new READY kitchen state. V1 delivery proof UI **does not verify
external-provider evidence**.

## 10. CR2 security / abuse overlay (delivery proof)

| Abuse case | Control |
|---|---|
| Submit fabricated booking/tracking/assignment/proof | Empty defaults; required fields; no UAT strings (PR #427 UI) |
| One-click fail/cancel with hidden codes | Confirmation + visible reason entry |
| Silent attestation in UI resolve paths | Explicit operator confirmation control |
| Server accepts arbitrary proof text vs IMP-032 wording | **Gap 1** — Founder/architecture (UPD-08); not closed by UI |
| Server auto-attests inactivity on some cancel paths | **Gap 2** — separate server corrective |
| URL Order vs body Delivery identity mismatch potential | **Gap 3** — integrity concern; not claimed exploited |

## 11. Quality Attribute Profile

| Attribute | Req | Notes |
|---|---|---|
| Accessibility | REQUIRED | WCAG 2.2 AA where applicable |
| Responsive / device | REQUIRED | Desktop-first; minimum narrow-screen task set in XD |
| Security | REQUIRED | Step-up preserved; proof abuse overlay |
| Privacy | REQUIRED | No PII in new analytics |
| Authorization | REQUIRED | Capability-correct affordances |
| Reliability | REQUIRED | No silent consequential failure |
| Availability | N/A | No new HA topology |
| Resilience | REQUIRED | Journey-specific error/recovery |
| Observability | REQUIRED | Measurement candidate for X3 paths |
| Performance | REQUIRED | Desktop perceived performance |
| Scalability | N/A | Presentation only |
| Concurrency | REQUIRED | Preserve revision-aware saves |
| Data integrity | REQUIRED | No fabricated evidence facilitation |
| Supportability | REQUIRED | Clear labels; audit unchanged as SoR |
| Backward compatibility | REQUIRED | Domain enums/APIs preserved |
| Localization / presentation | REQUIRED | Labels only |

## 12. Dependencies

| Dependency | Relationship |
|---|---|
| IMP-030/032/035/036A/D/E/F/G/H/I | Accepted workforce foundations reused |
| IMP-036J | Commercial pending acceptance; coordinate #376/#381 root causes — not owned by WXE alone |
| UOE PR #424 UX-A | Shared Delivery/Takeaway + Now/Schedule label ownership; WXE consumes |
| PR #427 `WXE-P0-CORRECTIVE-1` | Separate UI corrective; authorized/published; merge/deploy unapproved |
| Enterprise DS; ADR-003/010/006/018; LANG-1/EXP-1/PD-2/TEST-1 | Binding process/architecture |

## 13. Unresolved product decisions (WXE-UPD-01…09)

Canonical dispositions live in
[`15-gate-disposition-founder-decision-record.md`](./15-gate-disposition-founder-decision-record.md).
Summary:

| ID | Topic | Disposition for Gate sitting |
|---|---|---|
| UPD-01 | IMP identity / sequencing | **DEFERRED** before implementation authorization |
| UPD-02 | Admin entry + Ops landing | **Founder choice A/B required** — alternatives in §15; do not self-grant |
| UPD-03 | Kitchen/Delivery Admin entry | **Founder choice A/B required** — alternatives in §15; do not self-grant |
| UPD-04 | Future proprietary POS | **OUT_OF_SCOPE** for V1; separately governed |
| UPD-05 | P0-A authorize | **Prior authorization recorded** for PR #427 impl/publication; merge/deploy remain unapproved |
| UPD-06 | Scheduling first-class nav | Recommend Yes; **Founder ratification** if not formally approved |
| UPD-07 | Commercial deep-linking | **FOLLOW_UP** unless Founder changes scope |
| UPD-08 | Server Gaps 1–3 | **SEPARATE_CORRECTIVE**; unauthorized here |
| UPD-09 | UOE shared labels | **Resolved direction**: UOE owns; WXE consumes (PR #424 still candidate) |

### UPD-02 alternatives (do not silent-select)

| Option | Meaning | V1 impact |
|---|---|---|
| **A** | Include permission-correct Admin entry union + Ops landing + P1-COMM operability in WXE V1 | Requires capability-fixture + landing tests; AS-01/02 become V1 promises |
| **B** | Preserve current entry/routing for V1; defer change | V1 ACs assert current entry behaviour; P1-ENTRY/P1-COMM → FOLLOW_UP; still document latent defects |

### UPD-03 alternatives (do not silent-select)

| Option | Meaning | V1 impact |
|---|---|---|
| **A** | Narrow kitchen/delivery Administration entry away from bare `outlet.read` (with `role-destination-safety` test update) | Authorization-presentation change in V1; RED-class decision |
| **B** | Preserve current kitchen/delivery Administration entry for V1 | V1 ACs state current behaviour unchanged; narrowing → FOLLOW_UP |

If Founder wants Gate PASS while leaving A/B open, the open choice is a **pre-Gate blocker** for any V1 promise that depends on the unsettled option.

## 14. Product Definition Gate block (pre-gate)

```text
Product Definition Gate: NOT_PERFORMED
Capability: Workforce Experience (WXE-CANDIDATE-1)
Product Definition Version: PD-WXE-CANDIDATE-1
Experience Criticality: X3 (highest boundary)
Change Risk: CR2 (highest boundary)
Linked Experience Definition: XD-WXE-CANDIDATE-1
Business Outcome: defined (§2)
Primary Personas: defined (§4)
Journeys / Story Map: linked (§5 + doc 08)
Acceptance Slice: V1 / FOLLOW_UP / DEFERRED / SEPARATE_CORRECTIVE / OUT_OF_SCOPE (§5)
Happy/Alternate/Empty/Error/Authz/Concurrency/Destructive: journey contracts in doc 08 + XD
Service/operational impact: defined (§9)
Security/abuse overlay: defined (§10) incl. Gaps 1–3
Quality Attribute Profile: defined (§11)
Unresolved Product Decisions: WXE-UPD-01…09 (UPD-05 prior auth recorded; UPD-09 direction resolved; UPD-02/03 Founder A/B open)
Architecture Conflicts: presentation NONE; DELIVERY_PROOF / Gaps 1–3 = ESCALATE (see Fit + findings)
Result: NOT_PERFORMED
```
