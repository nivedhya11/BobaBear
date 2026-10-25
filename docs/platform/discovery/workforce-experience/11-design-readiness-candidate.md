<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Design Readiness candidate

```text
DR_ID = DR-WXE-CANDIDATE-1
DESIGN_READINESS = CANDIDATE_ONLY
```

## Claim boundary

This candidate specifies interaction and layout readiness for Founder evaluation. It is **not**
Design Readiness PASS. Visual comps beyond enterprise-system reuse are not claimed complete.

## Interaction inventory (high level)

| Surface class | Ready elements specified |
|---|---|
| Shells | Persistent side nav; TopBar context; cross-app links |
| Tables | Density, filters, urgency, keyboard |
| Order detail | Action order; panels; dialogs |
| Delivery | Empty evidence fields; attestation |
| Store forms | Revision save; unsaved guard; Scheduling discoverability |
| Commercial | Relabelled review; consequence review parity |
| Access | Diagnostic vs mutator separation |
| States | Loading/empty/error/success/unauthorized/stale |

## State presentation matrix

Covered in Experience Definition §10 and Desktop standard. P0 corrective adds delivery field states.

## Visual / motion

- Prefer existing enterprise tokens; no new brand theme in this candidate
- Motion limited to purposeful focus/expand; no decorative noise
- Desktop composition first

## Accessibility readiness

| Item | Candidate requirement |
|---|---|
| Heading hierarchy | Single H1; logical H2 |
| Breadcrumbs | `nav` + `aria-current` |
| Dialogs | Focus trap; Escape; labelled title |
| Tables | Header cells; sortable affordances announced |
| Status | `role="alert"` / live regions for mutations |
| Contrast | Enterprise tokens; verify on dark enterprise theme |

## Handoff to engineering (when authorized)

1. Execute `WXE-P0-CORRECTIVE-1` first
2. Implement IA/nav/breadcrumb/title alignment
3. Order detail reorder + commercial review labels + menu consequence review
4. Terminology pass (no blanket replace)
5. Evidence per Quality plan

## Design Readiness result

```text
DESIGN_READINESS = CANDIDATE_ONLY
RECOMMENDED_READY_FOR_EVALUATION = YES (documentation)
FORMAL_PASS = NOT_PERFORMED
```
