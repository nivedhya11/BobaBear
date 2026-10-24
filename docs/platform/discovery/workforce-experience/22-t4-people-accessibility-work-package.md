<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  TRANCHE: T4
  PACKAGE_STATUS: PLANNED
  IMPLEMENTATION: NOT_STARTED
-->

# T4 — People and accessibility work package

```text
WORK_PACKAGE_ID = WXE-T4-WP-1
TRANCHE = T4
PACKAGE_STATUS = PLANNED
IMPLEMENTATION = NOT_STARTED
IMPLEMENTATION_AUTHORIZED = NO
DEPENDS_ON = T2 and T3 PLANNED packages having a human implementation gate (doc 14 order). Accessibility fixes that are local to a T1/T2/T3 control ship with that control; this package is the remaining People framing and the cross-surface programme.
OPTION_R = PRESERVED
UPD_08 = NOT_IN_SCOPE
NEW_PERMISSIONS = NO
```

T4 makes People & Access honest about which screens change access and which screens only
diagnose it, and it applies the accessibility bar already named in the Quality candidate.
Measurement hooks stay a follow-up sketch unless a finalized Measurement plan exists. Nothing
here is implemented.

## 1. Scope (when a later authorization exists)

- Frame mutators and the diagnostic separately (inventory amendment A):
  - `AdministrationAccessClient` stays read-only effective-permission diagnosis.
  - Membership create, status, and role grant/revoke stay on the membership clients.
  - Outlet invite, status, and role grant/revoke stay on the store team clients.
  - Copy and page titles must not call the diagnostic a place where access is changed.
- Accessibility programme on shells, order detail, and commercial, using WCAG 2.2:
  - 2.4.11 Focus Not Obscured (sticky chrome and dialogs).
  - 2.5.7 Dragging Movements: menu reorder keeps a non-drag alternative.
  - 2.5.8 Target Size (Minimum) on the persistent nav and primary actions.
- Dialogs that T2/T3 already require keep focus trap, Escape, and a labelled title. T4 audits
  the People confirms the same way.
- Step-up challenges stay on the mutations that already require them. Failure and expiry copy
  follows GJ-W14 without a new session system.
- P2-G store confirms (Delivery Area, Takeaway settings, Hours, Scheduling) stay FOLLOW_UP.
  T4 may add the already-classified protective confirm only where doc 09 still lists the gap.
  It does not invent new store effects.
- Measurement: if, and only if, a human finalizes doc 13, add the non-PII events that plan
  names. Until then the hook work is not started. Audit logs remain the access system of record.

## 2. Non-goals

- New roles, permissions, membership types, or a second access-control authority.
- Changing who may grant, revoke, suspend, or invite.
- T1 navigation predicates, T2 order-command order, T3 commercial publish behavior.
- UOE label ownership. People screens do not define Delivery/Takeaway verbs.
- POS, KOT, order states, Brand Commerce API.
- UPD-08 delivery-proof and cancellation server gaps.
- MFA enrolment, password reset, or profile routes (doc 01: do not link unimplemented surfaces).
- Founder UAT PASS for GJ-W7 or GJ-W12.
- A parallel analytics store that duplicates access audit.

## 3. Source boundaries for a future implementer

```text
MAY MODIFY (future, presentation and accessibility only)
- src/components/administration/AdministrationAccessClient.tsx
- src/components/administration/AdministrationMembershipsClient.tsx
- src/components/administration/AdministrationMembershipDetailClient.tsx
- src/components/operations/store/StoreTeamMembersClient.tsx
- src/components/operations/store/StoreTeamAccessClient.tsx
- Shell and nav components already touched by T1, limited to focus visibility, target size,
  and focus not obscured:
  src/components/enterprise/SideNavigation.tsx
  src/components/workforce/WorkforceAppShell.tsx
  src/components/administration/AdministrationAppShell.tsx
  src/components/operations/OperationsWorkspaceNav.tsx
  src/components/operations/store/StoreSubnav.tsx
- Menu reorder UI inside src/components/administration/commercial/MenuEditor.tsx
  for a non-drag alternative (2.5.7) if T3 has landed the consequence review.
- Existing confirm dialogs on the People screens.
- axe (or equivalent) coverage in adjacent tests for 2.4.11, 2.5.7, and 2.5.8.
- Measurement call sites only after Measurement plan finalization, with the doc 13 property
  list (no phone, no raw address, no full evidence reference).

MUST NOT MODIFY
- Access-control permission catalogue, role seeds, and server grant/revoke use cases,
  except to keep calling them
- Step-up proof issuance and workforce-auth session authority (ARCH-G27 high-consequence
  mutations reuse workforce-auth; no second identity system)
- src/server/** delivery, order, and commercial domain modules
- Synthetic fixtures must stay in tests. Do not persist S1–S9 as roles.
- PR #427, UOE sources, STATE, ROADMAP, ARCHITECTURE, decision-register

EXPLICITLY OUT OF SCOPE
- Production permission creation
- Second label system
- UPD-08
- IMP activation and acceptance
```

## 4. Invariants

1. Effective Permissions is diagnostic. Membership and team screens are the mutators (doc 01).
2. Server access checks and step-up classes stay the source of truth (ARCH-G08, ARCH-G25, ARCH-G27).
3. Caller-supplied roles in the browser do not become grants.
4. Dragging is not the only way to reorder a menu.
5. Primary targets meet 2.5.8 on the desktop viewports (1366×768 and up). Focus is not hidden
   under the persistent nav or a dialog (2.4.11).
6. Store setting confirms do not change the underlying store command.
7. Events do not carry PII and do not replace audit.
8. Option R and UOE UX-A ownership are unchanged.

## 5. Test matrix

All rows are **PLANNED**.

| ID | Proves | Fixture | Expected | Must not |
|---|---|---|---|---|
| T4-DIAG | Amendment A | Principal with effective-permission read | Access page has no create, grant, or revoke control | New diagnostic mutation |
| T4-MUTATOR | GJ-W7 surface | Synthetic membership-manage fixture | Create / status / grant remain on membership and team screens and still call existing APIs | New permission key |
| T4-STEPUP | GJ-W14 | Step-up failure and expiry | Existing recovery copy; mutation does not commit | Second identity system |
| T4-A11Y-FOCUS | 2.4.11 | Shell plus open dialog at 1366×768 | Focused control not fully obscured | Removing the sticky nav as the fix without a design note |
| T4-A11Y-TARGET | 2.5.8 | Persistent nav and primary People actions | Minimum target size | Shrinking hit area to fit labels |
| T4-A11Y-DRAG | 2.5.7 | Menu reorder | Keyboard or button alternative completes the same reorder | Drag-only reorder |
| T4-PF-09 | Negative | Grant without the existing role-assignment permission | Server denial unchanged | Broaden RBAC |
| T4-P2G | FOLLOW_UP | Hours or Scheduling save, only if doc 09 still defers the confirm | Protective confirm, then existing save | New scheduling effect |
| T4-MI | Doc 13 | Only after Measurement finalization | Non-PII event names from that plan | PII, evidence values, or a second audit log |
| T4-UAT-SLOT | GJ-W7 / GJ-W12 | Human script | Evidence slot empty | Agent UAT PASS |

People fixtures stay synthetic (F-7). They are not seeded roles.
