<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Desktop layout and interaction standard

```text
DS_ID = WXE-DS-CANDIDATE-1
DESIGN_SYSTEM = existing enterprise components + tokens
TARGET_WCAG = 2.2 AA (where applicable)
```

## Primary viewports

| Viewport | Priority |
|---|---|
| 1366×768 | Primary laptop |
| 1440×900 | Primary laptop |
| 1920×1080 | Primary desktop |
| Larger operational displays | Supported where relevant |
| Narrow / mobile | Minimum supported task set in XD §11 only; no authoring feature parity |

## Core layout

```text
┌ TopBar: product label · Brand/Outlet context · identity · utilities ┐
├ SideNavigation (persistent desktop) ┬ PageHeader (H1 · purpose · primary action · breadcrumbs) ┤
│ section → subsection links          │ Filters / search / freshness                              │
│                                     │ Main task surface (table / split / form / workspace)      │
│                                     │ Alerts · empty · error                                    │
└─────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

Reuse: `TopBar`, `SideNavigation`, `PageHeader`, `Breadcrumbs`, tables, dialogs, alerts, enterprise tokens.

## Page composition rules

| Rule | Requirement |
|---|---|
| Single H1 | Exactly one per page; remove duplicate Admin `PageHeader` pairs |
| Purpose | Short supporting line under H1 |
| Primary action | One clear primary; destructive separate |
| Hierarchy | H1 → H2 sections; no skipped levels for a11y |
| Context | Authorized Brand and/or Outlet visible when task is scoped |
| Density | High information density without card clutter; prefer tables and definition lists |
| Draft/live | Explicit badges/text for draft vs effective/live |

## View patterns

| Pattern | When | Notes |
|---|---|---|
| Attention dashboard | Today / Admin overview | Task queues, not vanity metrics |
| Filterable table | Orders, memberships, audit, resources | Dense rows; stable sort; keyboard focus |
| List/detail | Orders; optional Delivery queue | Detail shows lifecycle actions **above** secondary panels |
| Workspace tabs | Commercial sections | Labels/clarity in V1; deep-linkable sections = FOLLOW_UP (UPD-07) |
| Settings form | Hours, area, takeaway, scheduling | Inline validation; revision-aware save |
| Diagnostic | Effective permissions; sellability; verification | Read-only framing |

## Interaction standard

| Concern | Standard |
|---|---|
| Search & filters | Visible; Apply clear; preserve in URL when practical |
| Tables | Numeric/right-align money; human times; urgency cues (Due soon / Overdue) |
| Forms | Labelled inputs; inline validation; disable double-submit |
| Loading | Skeletons/spinners with polite status; do not hide primary lifecycle actions at 1366×768 |
| Empty | Explain next authorized action; no fake / UAT evidence data |
| Error / recovery | **Journey-specific** contracts in XD §10 + journey doc (GJ-W6/W7/W9/W11–W14) — not a blanket “all pages handle errors” claim; no raw codes as sole text |
| Stale identity | Order/Delivery/membership identity change resets dialogs; drop stale async |
| Consequence review | Required for publish/effect, lifecycle, refund, grant/revoke, suspend, retire; Cancel restores focus to invoker; Confirm announces result |
| Unsaved changes | Protect navigate-away on dirty forms (hours/area/takeaway/scheduling/commercial) |
| Keyboard | Tab order matches visual; dialogs trap focus; Escape closes; collapsed-nav focus not trapped |
| Screen readers | `aria-current`, labelled regions, live alerts for mutations; one H1; single main |
| Freshness | Explicit refresh or “Updated …” where lists can stale |
| History | Back/forward safe; direct links land on same task; commercial section deep-links FOLLOW_UP |
| Multi-outlet | Preserve outlet context across breadcrumbs/sub-nav |

## Order detail action ordering (corrective UX)

**Precondition:** show Accept/Fulfil/Cancel only when session capabilities allow (fix permission-blind buttons before promoting them).

Mode-sensitive candidate order (top → bottom):

**Shared prefix:** Summary + timing urgency → **capability-gated lifecycle actions**

| Then (Delivery mode) | Then (Takeaway mode) |
|---|---|
| Destination | Takeaway / collection verification |
| **Delivery panel** (high) | Items |
| Items | Payment |
| Payment | Refunds |
| Refunds | Notifications |
| Notifications | Lifecycle metadata |
| Lifecycle metadata | — |

Do not demote Delivery below Items for Delivery coordinators. Refunds stay with payment cluster (not below fold relative to noise panels once lifecycle is promoted).

## Enterprise reskin targets

Orders list/detail currently mix customer visual tokens (`font-display`, large clamp H1, `--bg-page`) inside the enterprise shell — call out for re-tokening in T2 so actions are reachable at 1366×768.

## Commercial review labelling

- Inspection section label: **Review (draft vs live)** — not “publish”
- Publish/activate/effect buttons remain inside domain editors with `ConsequenceReviewDialog`
- Menu section/entry activate/retire must gain equivalent consequence review (**P1-C**)

## Conflicting patterns to retire

- Dual page titles / dual H1
- Misleading action labels (“Review & publish/effect” without publish)
- UAT-prefilled consequential fields
- Dead-end empty hubs for authorized users
- Mobile-only omission of timing on order cards without desktop-equivalent density elsewhere
