<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Experience Definition candidate — Workforce Experience

```text
XD_ID = XD-WXE-CANDIDATE-1
PACKAGE = WXE-CANDIDATE-1
EXPERIENCE_GATE = NOT_PERFORMED
EXPERIENCE_CRITICALITY = X2 (workflows); X3 (refund, access mutation, commercial publish/effect, delivery proof)
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
```

## 1. Experience Intent

Operators complete authorized Workforce tasks quickly and safely on desktop, with consistent
navigation, terminology, page hierarchy, and consequence review — without clutter, dead ends, or
misleading “publish” destinations.

## 2. User goals

| Priority | Goal |
|---|---|
| G1 | See what needs attention today and act on orders |
| G2 | Advance Delivery / Takeaway fulfilment without fabricating evidence |
| G3 | Configure store hours, area, status, availability, takeaway profile |
| G4 | Author and effect commercial changes with draft/live clarity |
| G5 | Manage memberships and roles with understandable consequences |
| G6 | Diagnose permissions and system health without false authority |

## 3. Current-state experience (summary)

- Two shells (Workforce/Operations vs Administration) with permission-derived cross-links
- Operations pages generally have breadcrumbs; Administration largely does not
- Commercial authoring is a single route with section tabs (not deep-linked)
- Order lifecycle primary actions sit below secondary panels; buttons are status-gated only (**P1-A**)
- Delivery panel ships UAT prefills; workspace may include Takeaway orders (**P0-A**)
- Entry lists omit commercial keys (**LATENT** for built-ins; **P1-ENTRY**); `outlet_manager` Commercial likely unusable (**P1-COMM**)
- Dual H1 / nested main on Orders (**P1-B**); Admin dual titles (**P2-B-ADMIN**)
- Scheduling profile buried under Hours (**P2-C**)

## 4. Desired journey shape

1. Sign in → Applications hub (or auto-route if single app)
2. Enter Operations or Administration based on effective permissions + scope
3. Persistent desktop nav + Brand/Outlet context where relevant
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
| UX-W6 | Terminology & content (LANG-1 + Founder labels) | X2 |
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
| Fabricated delivery evidence + one-click terminal + Takeaway in Delivery workspace | P0 | Accidental | `WXE-P0-CORRECTIVE-1` |
| Permission-blind lifecycle buttons | P1 | Accidental | Gate before promoting placement |
| Lifecycle actions below fold | P1 | Accidental | Mode-sensitive placement |
| Dual H1 / nested main on Orders | P1 | Accidental | A11y fix |
| Outlet manager unusable Commercial | P1 | Accidental | Hide or outlet-scope |
| Latent commercial-only entry list | P1/P2 | Accidental | Future-proof |
| Menu section/entry retire without review | P1 | Protective gap | Consequence review |
| Review tab label / Admin titles / Scheduling | P2 | Accidental | Polish |
| Step-up MFA | — | Protective | Retain |

Evidence class for this package: `FOUNDER_HEURISTIC_REVIEW` + source-backed `INTERNAL_USABILITY_REVIEW`. No customer research claimed.

## 8. Service blueprint (operator ↔ customer promise)

| Customer promise | System truth | Workforce action | Surface |
|---|---|---|---|
| Order accepted (preparation is off-system) | Order lifecycle PLACED→ACCEPTED→FULFILLED | Accept / fulfil / cancel | Order detail |
| Delivery progress | Delivery aggregate | Book / assign / handoff / proof | Delivery panel |
| Takeaway ready for collection | PICKUP fulfilment | Hand over (prepare off-system; no READY state) | Order detail |
| Menu/prices/offers live | Effective commercial projections | Publish / activate / effect | Commercial editors |
| Store open / deliverable | Operating state + serviceability | Pause / hours / area | Store Management |

## 9. Content / LANG-1 notes

- Operators may see more precise operational wording than customers
- Never present raw backend enums as the only human label when a presentation label exists
- Do not claim Founder Delivery/Takeaway/Now/Schedule labels are already shipped
- Distinguish Assortment vs Availability vs Menu vs Catalog Product/Variant

## 10. UX state matrix (required)

Each major page must specify: default/ready, loading, empty/first-use, validation failure,
unauthorized, not-found/stale, server/network error, recovery, success, destructive confirmation,
concurrency/conflict, unsaved changes, freshness/refresh.

## 11. Responsive / a11y / performance

- Primary composition optimized for 1366×768+
- Narrow: functional fallback (existing commercial “inspection only” pattern may continue)
- Target WCAG 2.2 AA: one H1, labelled controls, keyboard operability, focus management in dialogs
- Prefer existing enterprise tokens/components

## 12. Experience Gate block (pre-gate)

```text
Experience Gate: NOT_PERFORMED
Experience Definition: XD-WXE-CANDIDATE-1
Unresolved experience decisions: WXE-UPD-02, WXE-UPD-03, WXE-UPD-05 (shared with PD)
Result: NOT_PERFORMED
```
