<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Experience Definition candidate — Workforce Experience

```text
XD_ID = XD-WXE-CANDIDATE-1
PACKAGE = WXE-CANDIDATE-1
EXPERIENCE_GATE = PASS (historical @ 560048ffc…; see §13)
EXPERIENCE_AMENDMENT = WXE-P1-COMM_OPTION_R — RATIFIED_RECORDED (doc 17; not a new Gate PASS)
FORMAL_NEW_PD_XD_GATE_PASS = NOT_GRANTED
EXPERIENCE_GATE_EXECUTION = PERFORMED (historical)
EXPERIENCE_CRITICALITY = X3 (highest boundary; X2 workflows remain inside)
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED
REVIEWED_CONTRACT_HEAD = 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
FOUNDER_GATE_RECORD = WXE-FOUNDER-PD-XD-GATE-RECORD-R3
OPTION_R_AMENDMENT_DOC = 16-option-r-p1-comm-amendment-and-proof-matrix.md
IMPLEMENTATION_AUTHORIZED = NO
```

## 1. Experience Intent

Operators complete authorized Workforce tasks quickly and safely on desktop, with consistent
navigation, terminology, page hierarchy, and consequence review — without clutter, dead ends, or
misleading “publish” destinations.

## 2. User goals, questions, hesitation points

| Priority | Goal | Likely questions / hesitation |
|---|---|---|
| G1 | See what needs attention today and act on orders | “Which outlet am I on?” “Is this Delivery or Takeaway?” |
| G2 | Advance Delivery / Takeaway fulfilment without fabricating evidence | “Did I just invent proof?” “What happens if I cancel?” |
| G3 | Configure store hours, area, status, availability, takeaway profile | “Will this affect customers immediately?” |
| G4 | Author and effect commercial changes with draft/live clarity | “Am I editing draft or live?” “Where do I publish?” |
| G5 | Manage memberships and roles with understandable consequences | “Did I remove their access?” “Do I need step-up again?” |
| G6 | Diagnose permissions and system health without false authority | “Is this read-only?” “Why can’t I open Commercial?” |

## 3. Current-state experience (summary)

- Two shells (Workforce/Operations vs Administration) with permission-derived cross-links
- Operations pages generally have breadcrumbs; Administration largely does not
- Commercial authoring is a single route with section tabs (not deep-linked) — deep-link = FOLLOW_UP
- Order lifecycle primary actions sit below secondary panels; buttons are status-gated only (**P1-A**)
- Delivery panel ships UAT prefills; workspace may include Takeaway orders (**P0-A** / PR #427 corrective published, not merged)
- Entry lists omit commercial keys (**P1-ENTRY** — V1 under UPD-02 A); `outlet_manager` Brand Commercial likely unusable (**P1-COMM** — V1 under **OPTION_R**: hide misleading Commercial; preserve Store assortment/escalation)
- Dual H1 / nested main on Orders (**P1-B**); Admin dual titles (**P2-B-ADMIN**)
- Scheduling profile buried under Hours (**P2-C**) — V1 first-class nav; Founder **UPD-06 = YES**

## 4. Desired journey shape

1. Sign in → Applications hub (or auto-route if single app)
2. Enter Operations or Administration based on effective permissions + scope (**UPD-02 A** / **UPD-03 B**); Brand Commercial nav only when brand-operable (**OPTION_R**)
3. Persistent desktop nav + Brand/Outlet context where relevant (**V1 chrome = nav-layer collapse**)
4. Section → subsection → page with one H1 and clear primary action
5. List → detail (or workspace section) with filters/search
6. Consequential act → review → success/failure recovery
7. Return via breadcrumbs / history without losing outlet context

## 5. Workstreams

| ID | Workstream | Criticality |
|---|---|---|
| UX-W1 | Information architecture & navigation | X2 |
| UX-W2 | Order / Delivery / Takeaway daily ops | X2/X3 |
| UX-W3 | Store management desktop patterns | X2 |
| UX-W4 | Commercial authoring & review | X2/X3 |
| UX-W5 | People & access diagnostics vs mutators | X2/X3 |
| UX-W6 | Terminology & content (LANG-1 + UOE UX-A consumption) | X2 |
| UX-W7 | Accessibility & narrow-screen fallback | X2 |

## 6. Information architecture principles

- Seven presentation groups (see nav doc) — **not** new domain services
- Maintain Operations vs Administration separation where authorization requires it
- One canonical home per function; contextual links only
- Do not expose unimplemented destinations
- Nav from effective permissions **and** resource scope

## 7. Friction audit (priority)

| Friction | Severity | Class | Disposition |
|---|---|---|---|
| Fabricated delivery evidence + one-click terminal + Takeaway in Delivery workspace | P0 | Accidental | `WXE-P0-CORRECTIVE-1` (PR #427; merge unapproved) |
| Permission-blind lifecycle buttons | P1 | Accidental | Gate before promoting placement |
| Lifecycle actions below fold | P1 | Accidental | Mode-sensitive placement |
| Dual H1 / nested main on Orders | P1 | Accidental | A11y fix |
| Outlet manager unusable Commercial | P1 | Accidental | **OPTION_R:** hide Brand Commercial nav unless static (commercial read ∧ `brand.read`); AS-27 for direct links; preserve Store ops / read-only assortment / static escalation (no Brand Commercial cross-link when hidden); do **not** invent `brand.read` or outlet-as-Brand-Commercial |
| Latent commercial-only entry list | P1/P2 | Accidental | Admin entry union (**UPD-02 A** V1; retained with OPTION_R) |
| Menu section/entry retire without review | P1 | Protective gap | Consequence review (V1) |
| Kitchen/Delivery Admin via `outlet.read` | P1 | Product decision | **UPD-03 B** — preserve for V1; narrowing FOLLOW_UP |
| Review tab label / Admin titles | P2 | Accidental | Polish |
| Scheduling buried | P2 | Accidental | V1 first-class nav (**UPD-06 YES**) |
| Step-up MFA | — | Protective | Retain |

Evidence class for this package: `FOUNDER_HEURISTIC_REVIEW` + source-backed `INTERNAL_USABILITY_REVIEW`. No customer research claimed.

## 8. Service blueprint (operator ↔ customer promise)

| Customer promise | System truth | Workforce action | Surface |
|---|---|---|---|
| Order accepted (preparation is off-system) | Order lifecycle PLACED→ACCEPTED→FULFILLED | Accept / fulfil / cancel | Order detail |
| Delivery progress | Delivery aggregate | Book / assign / handoff / proof (no fabricated defaults) | Delivery panel |
| Takeaway ready for collection | PICKUP fulfilment | Hand over order (prepare off-system; no READY state; verb per UOE UX-A) | Order detail |
| Menu/prices/offers live | Effective commercial projections | Publish / activate / effect with review | Commercial editors |
| Store open / deliverable | Operating state + serviceability | Pause / hours / area | Store Management |
| Access removed | Membership/role projections | Suspend / revoke with confirm + step-up | People & Access |

Failure/recovery handoffs for X3 journeys are specified in
[`08-operator-journey-scenarios.md`](./08-operator-journey-scenarios.md).

## 9. Content / LANG-1 notes

- Operators may see more precise operational wording than customers
- Never present raw backend enums as the only human label when a presentation label exists
- Do not claim Founder Delivery/Takeaway/Now/Schedule labels are already shipped
- Distinguish Assortment vs Availability vs Menu vs Catalog Product/Variant
- **UOE UX-A owns** shared Delivery/Takeaway and Now/Schedule map; WXE consumes — do not independently standardize takeaway fulfilment verbs (including whether “Mark collected” is allowed)

## 10. Journey-specific UX state contracts (V1 slice)

Global rule replaced: each **V1 journey** defines testable states below. Page-level matrices at Design
Readiness may refine copy; they must not contradict these contracts.

| Concern | V1 experience requirement (testable) |
|---|---|
| Empty / first-use | Orders/Delivery/Memberships/Commercial lists explain next authorized action; never show fabricated sample evidence |
| Loading | Polite busy state; no layout jump that hides primary lifecycle actions at 1366×768 |
| No access / missing scope | AccessDenied or hidden affordance; recovery to Applications. **P1-COMM / OPTION_R** (“no empty/broken Brand Commercial”) is a **V1 requirement**: hide Brand Commercial unless (commercial read ∧ `brand.read`); AS-27 for direct links; preserve Store Assortment + static escalation; must not revoke UPD-03 B Administration entry, create empty Admin from commercial reads alone, or invent `brand.read` |
| Deep-link failures | Unknown `orderId` / `membershipId` / outlet → not-found + recovery; commercial section deep-links remain FOLLOW_UP |
| Stale Order/Delivery/Checkout-adjacent state | On identity or revision change, reset confirms/dialogs; drop stale async; reload server truth (GJ-W2/W11/W14) |
| Network interruption + retry | Recoverable message; retry safe; no double-submit without revision check |
| Consequence-dialog cancel | Esc/Cancel closes without mutation; **focus returns** to invoking control |
| Consequence-dialog confirm | Focus moves to success/status region or primary next action; announce result |
| After step-up return | Focus returns to the control that initiated the gated mutation, or to the dialog’s primary action if still open; never to a random landmark |
| After stale reload / not-found | Focus to page status/alert explaining reload or recovery link (Applications / Orders list) |
| Unsaved form changes | Protect navigate-away on dirty **Hours** (AS-14), and on dirty **Delivery Area / Takeaway settings / Scheduling / membership create / commercial draft** editors in V1 chrome scope |
| Multi-outlet context | Switching outlet preserves task family where authorized; breadcrumbs keep `outletId` (AS-15) |
| Conflicting revision | Conflict message + reload; no silent overwrite (GJ-W6/W7) |
| Screen-reader status | Mutation outcomes via polite live region / status text; breadcrumbs `aria-current` |
| One H1 + main landmarks | Exactly one H1; single main landmark (P1-B / Admin titles) |

Cross-reference: detailed actor/success/deny/recovery rows in journey doc for GJ-W6, W7, W9, W11–W14.

## 11. Responsive / a11y / performance — minimum narrow-screen task set

Primary composition remains 1366×768+. Narrow / mobile is **not** authoring parity.

**Minimum supported narrow-screen tasks** (must remain safe and operable):

| Task | Narrow requirement |
|---|---|
| Sign-in → Applications hub | Reachable; chooser usable with keyboard |
| Open Today / Orders list | Read queue; open an order |
| View order summary + timing | Timing available via accessible text if chips collapse (AS-07) |
| Capability-gated Accept / Fulfil / Cancel | Visible when permitted; confirms operable |
| Delivery panel terminal confirm (if Delivery mode) | Confirm/cancel dialogs operable; no reliance on hover-only |
| Refund panel read + initiate (if permitted) | Step-up path operable |
| AccessDenied recovery | Link/button to Applications |
| Outlet context switch (if multi-outlet) | Possible without dead-end |

**Explicitly not required on narrow:** commercial authoring parity, dense Admin resource tables productivity, multi-pane Delivery workspace efficiency, commercial section deep-link authoring.

Collapsed nav: keyboard focus order must remain logical; do not trap focus in off-canvas nav after close.

## 12. Assumption / hypothesis register (material)

| Assumption | Risk | Validation path |
|---|---|---|
| Seven presentation groups reduce cognitive load vs current shells | Medium | Founder heuristic + post-T1 usability pass |
| Nav-layer collapse is V1 chrome (not polish) | Low if ratified | UPD/IA gate sitting |
| UOE UX-A verbs are sufficient for Takeaway hand-over | Medium | Consume approved UX-A; no WXE fork |
| Deferring commercial deep-links does not block V1 tasks | Low | UPD-07 FOLLOW_UP |
| UPD-02 A + UPD-03 B + OPTION_R compatibility (hide unusable Brand Commercial without revoking Kitchen/Delivery Admin entry; Store ≠ Brand Commercial) | Medium | Architecture Fit escalation if conflict; do not invent permissions |

## 13. Experience Gate block (Founder-executed)

```text
EXPERIENCE_GATE
Experience Intent defined: YES (§1)
User goal understood: YES (§2)
Entry / discoverability defined: YES (§4 + nav doc; UPD-02 A / UPD-03 B / OPTION_R)
End-to-end journey defined: YES (doc 08 GJ-W1–W15; GJ-W8 OPTION_R scoping)
Information architecture defined: YES (§6 + nav doc; seven presentation groups)
Information hierarchy defined: YES (breadcrumbs / single H1 / V1 chrome)
Primary interaction defined: YES (§7 friction + desktop standard)
Mental model / cognitive load considered: YES (§7 + assumption register)
Friction reviewed: YES (§7; P1-COMM → OPTION_R)
Trust-sensitive moments considered: YES (delivery proof, refunds, access revoke, publish/effect)
Content strategy defined: YES (§9; UPD-09 UOE owns shared labels; WXE consumes)
Error / recovery defined: YES (§10 + X3 journey contracts)
Mobile / responsive defined: YES (§11 desktop-first + minimum narrow-screen task set)
Accessibility considered: YES (§11 + WCAG 2.2 AA where applicable)
Service / operational promise aligned where applicable: YES (§8)
Performance experience considered: YES (§11 + QAP)
Measurement intent defined: YES (measurement candidate; plan not finalized)
Research / evidence level disclosed: YES (FOUNDER_HEURISTIC_REVIEW + INTERNAL_USABILITY_REVIEW)
Unresolved experience decisions: NONE (within approved Product/Experience Gate scope at historical PASS); **OPTION_R is a post-PASS amendment packaged for Founder ratification (doc 16) — not covered by this historical PASS**
Deferred beyond Experience Gate (not erased): UPD-01 IMP identity; UPD-07 Commercial deep-linking; UPD-08 server Gaps 1–3; UPD-05 merge/deploy; Architecture Fit / Design / Quality / Measurement / Implementation Authorization
EXPERIENCE_GATE_EXECUTION: PERFORMED
Result: PASS (historical @ 560048ffc… only — does **not** cover OPTION_R post-PASS amendment)
Founder Authority: Explicit "proceed" on 2026-10-24 Asia/Kolkata
Reviewed Contract HEAD: 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
Experience Criticality: X3
Implementation Authorized: NO
FORMAL_NEW_PD_XD_GATE_PASS: NOT_GRANTED (OPTION_R amendment ratified and recorded in doc 17; ratification ≠ new Gate PASS)
```

Historical PASS approves specification completeness at the reviewed contract HEAD only and does **not** cover OPTION_R post-PASS amendment text. It does not grant Architecture Fit, Design Readiness, Quality/Measurement finalization, Implementation Authorization, merge, or deploy. OPTION_R amendments are packaged for Founder ratification and do **not** self-grant a new Gate PASS.
