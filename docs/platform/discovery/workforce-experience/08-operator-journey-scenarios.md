<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# End-to-end operator journey scenarios

```text
JOURNEY_ID = WXE-JRN-CANDIDATE-1
AS_PREFIX = WXE-AS
```

## Golden journeys (candidate)

| ID | Journey | Criticality | Primary section |
|---|---|---|---|
| GJ-W1 | Start of shift → Today → accept/fulfil orders | X2 | Dashboard / Daily Operations |
| GJ-W2 | Delivery order → book/assign/handoff/proof without fabricated defaults | X3 | Daily Operations |
| GJ-W3 | Takeaway order → verify → hand over (prepare is off-system; no READY state) | X2 | Daily Operations |
| GJ-W11 | Delivery failure → recover / re-book | X3 | Daily Operations |
| GJ-W12 | Urgent offboarding (suspend/revoke access) | X3 | People & Access |
| GJ-W13 | Cancel order ↔ refund interplay | X3 | Daily Operations |
| GJ-W14 | Step-up failure / session expiry mid-mutation | X3 | Cross-cutting |
| GJ-W15 | Multi-outlet manager switches outlet context | X2 | Store Management |
| GJ-W4 | Pause store / edit hours / scheduling lead times | X2 | Store Management |
| GJ-W5 | Mark variant sold out; confirm assortment is separate | X2 | Store / Commercial |
| GJ-W6 | Publish menu or activate price/promotion with review | X3 | Menu & Commercial |
| GJ-W7 | Invite outlet member; grant role; diagnose effective permissions | X3 | People & Access |
| GJ-W8 | Commercial-only operator reaches Commercial Workspace | X2 | Entry / Menu & Commercial |
| GJ-W9 | Refund captured payment with step-up | X3 | Order detail |
| GJ-W10 | Inspect access audit and system health | X1/X2 | Audit & System |

## Acceptance scenarios (representative)

| ID | Scenario | Pass criteria |
|---|---|---|
| WXE-AS-01 | Operator with only commercial reads opens Applications | Sees Administration (or Commercial) entry; not empty hub |
| WXE-AS-02 | Store-capable user without `order.read` (fixture) | If Ops destination shown, lands on first usable Store surface — not Today error |
| WXE-AS-03 | Order detail for PLACED with `order.accept` | Accept/Cancel visible when permitted; denied capabilities hide buttons |
| WXE-AS-04 | Delivery confirm pickup/delivery/fail/cancel | No UAT prefills; terminal commands confirm; cannot one-click fake proof |
| WXE-AS-05 | Takeaway FULFIL | Uses **UOE UX-A** verb map; Delivery panel hidden on detail; not actionable in Delivery workspace |
| WXE-AS-06 | Scheduled order list | Shows Scheduled + Due soon/Overdue cues on desktop |
| WXE-AS-07 | Narrow order list | Timing still available via accessible text (fallback OK) |
| WXE-AS-08 | Menu retire section | Consequence review before effect |
| WXE-AS-09 | Open Review section | Clear that publish actions live in domain editors |
| WXE-AS-10 | Admin Resources page | Single H1; breadcrumbs present |
| WXE-AS-11 | Scheduling | Discoverable as Scheduling, not only buried under Hours |
| WXE-AS-12 | Effective Permissions | Read-only framing; mutations elsewhere |
| WXE-AS-13 | Unauthorized deep link | AccessDenied with recovery to Applications |
| WXE-AS-14 | Unsaved hours edit + navigate | Protect or confirm discard |
| WXE-AS-15 | Outlet context | Breadcrumb + sub-nav preserve `outletId` |

## Journey Completeness Matrix (package-level)

| Dimension | Coverage in candidate |
|---|---|
| ENTRY | WXE-AS-01/02/13 |
| DISCOVERY | Nav placement doc + GJ-W* |
| CONTEXT | Brand/Outlet rules; WXE-AS-15 |
| EMPTY/FIRST USE | Desktop standard |
| HAPPY PATH | GJ-W1–W10 |
| ALTERNATE VALID PATHS | Delivery vs Takeaway; Now vs Scheduled |
| VALIDATION FAILURE | Forms standard |
| AUTHORIZATION | P1-ENTRY; AS-01/02/13 |
| NOT FOUND/STALE | Outlet stale alert pattern retained |
| SERVER/NETWORK ERROR | Error standard |
| RECOVERY | Refund pending recovery retained; delivery reload |
| CONCURRENCY | Revision-aware store/commercial saves |
| DESTRUCTIVE ACTION | Consequence review requirements |
| SUCCESS FEEDBACK | Announcements / status lines |
| DOWNSTREAM EFFECT | Service blueprint |
| REVISIT/RELOAD | Direct-link matrix |
| RESPONSIVE/MOBILE | Desktop-first + fallback |
| ACCESSIBILITY | WCAG target + dual-H1 removal |

## Bound relative to adjacent work

| Work | Relationship |
|---|---|
| UOE PR #424 | Customer labels/journeys; do not overwrite |
| #376 / #381 | Route reliability/root-cause through IMP-036J Founder UAT; WXE only owns chrome/clarity overlap |
| #378 | Parent discovery theme for this package |
| #380 | Programme intake; this package is workforce desktop candidate material |
| UOE PR #424 | Owns shared Delivery/Takeaway + Now/Schedule label map (UX-A); WXE consumes |
