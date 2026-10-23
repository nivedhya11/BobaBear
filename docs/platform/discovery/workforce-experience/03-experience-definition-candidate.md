<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Experience Definition candidate — Workforce Experience

```text
XD_ID = XD-WXE-CANDIDATE-1
PACKAGE = WXE-CANDIDATE-1
EXPERIENCE_GATE = NOT_PERFORMED
EXPERIENCE_CRITICALITY = X3 (highest boundary; X2 workflows remain inside)
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
REFINEMENT = WXE-PD-XD-REFINEMENT-R2
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
- Entry lists omit commercial keys (**LATENT** for built-ins; **P1-ENTRY**); `outlet_manager` Commercial likely unusable (**P1-COMM**)
- Dual H1 / nested main on Orders (**P1-B**); Admin dual titles (**P2-B-ADMIN**)
- Scheduling profile buried under Hours (**P2-C**) — V1 promote; UPD-06 ratification

## 4. Desired journey shape

1. Sign in → Applications hub (or auto-route if single app)
2. Enter Operations or Administration based on effective permissions + scope (**UPD-02/03**)
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
| Outlet manager unusable Commercial | P1 | Accidental | Hide or outlet-scope (UPD-02) |
| Latent commercial-only entry list | P1/P2 | Accidental | UPD-02 A/B |
| Menu section/entry retire without review | P1 | Protective gap | Consequence review (V1) |
| Kitchen/Delivery Admin via `outlet.read` | P1 | Product decision | UPD-03 A/B |
| Review tab label / Admin titles | P2 | Accidental | Polish |
| Scheduling buried | P2 | Accidental | V1 first-class nav (UPD-06) |
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
| No access / missing scope | AccessDenied or hidden affordance; recovery to Applications; no empty “broken” Commercial (P1-COMM) |
| Deep-link failures | Unknown `orderId` / `membershipId` / outlet → not-found + recovery; commercial section deep-links remain FOLLOW_UP |
| Stale Order/Delivery/Checkout-adjacent state | On identity or revision change, reset confirms/dialogs; drop stale async; reload server truth (GJ-W2/W11/W14) |
| Network interruption + retry | Recoverable message; retry safe; no double-submit without revision check |
| Consequence-dialog cancel | Esc/Cancel closes without mutation; **focus returns** to invoking control |
| Consequence-dialog confirm | Focus moves to success/status region or primary next action; announce result |
| Unsaved form changes | Hours/area/takeaway/scheduling/commercial drafts protect navigate-away (AS-14) |
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
| UPD-02/03 choice B keeps Gate meaningful if V1 ACs freeze current entry | Medium | Founder A/B; pre-Gate blocker if promises need A |

## 13. Experience Gate block (pre-gate)

```text
Experience Gate: NOT_PERFORMED
Experience Definition: XD-WXE-CANDIDATE-1
Unresolved experience decisions: WXE-UPD-02, WXE-UPD-03, WXE-UPD-06 (ratify Scheduling)
Shared product decisions affecting experience: WXE-UPD-01, WXE-UPD-07, WXE-UPD-08
Resolved direction (not Experience Gate design open): WXE-UPD-05 prior P0 auth (merge still open); WXE-UPD-09 UOE owns labels
Result: NOT_PERFORMED
```
