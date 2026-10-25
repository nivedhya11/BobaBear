<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Measurement / Instrumentation candidate

```text
MI_ID = MI-WXE-CANDIDATE-1
MEASUREMENT_PLAN = REVIEWABLE_DRAFT
```

## Business intent

Measure whether desktop Workforce UX reduces time-to-act and error-prone consequential actions,
without instrumenting secrets or weakening security.

## Primary metric (candidate)

**Time from order open → successful lifecycle action** (Accept/Fulfil) for authorized operators
during peak windows.

## Secondary metrics

| Metric | Intent |
|---|---|
| Delivery command failure rate after P0-A | Catch over-blocking empty fields vs real errors |
| Hub empty-state rate for authenticated sessions | Detect entry-list gaps (P1-ENTRY) |
| Commercial Review tab visits without subsequent domain publish | Misleading IA signal (P1-D / P2-D) |
| Consequence-dialog cancel rate on menu retire | Whether review adds friction vs safety |
| AccessDenied on `/workforce/admin/commercial/` | Entry misconfiguration |

## Guardrails

- No PII in event payloads (no phone, raw addresses)
- No full evidence reference values in analytics
- Respect existing audit logs as system of record for access mutations
- Do not invent a parallel audit authority

## Event contract (candidate sketch)

| Event | Properties (non-PII) |
|---|---|
| `workforce_hub_destinations_resolved` | count, has_operations, has_administration |
| `workforce_access_denied` | surface (`admin_shell`\|`ops`), reason_code |
| `operations_lifecycle_action` | action, result, fulfilment_mode_class (`DELIVERY`\|`PICKUP`) |
| `operations_delivery_command` | command, result, empty_required_field_blocked |
| `commercial_section_selected` | section_id |
| `commercial_consequence_review` | domain, decision (`confirm`\|`cancel`) |

Exact analytics pipeline selection is Architecture Fit / implementation concern; events must not
require new domain services.

## Observation / ownership (candidate)

| Field | Value |
|---|---|
| Observation window | Peak service windows post-T0/T2 for ≥14 days |
| Interpretation rule | Primary metric improves without rise in delivery-command failure or AccessDenied spikes |
| Event owner | Platform engineering (candidate) until IMP allocated |
| Dedup / versioning | Event name + `schema_version`; client session id hash only |
| Retention | Align with existing ops analytics retention; no new PII store |

## Evidence gaps

| Gap | Status |
|---|---|
| Production behavioural baseline | NOT_FOUND in this package |
| Pre-GTM experience audit | NOT_PERFORMED |
| Controlled experiment design | NOT_REQUIRED for P0 hotfix |

## Measurement Gate

```text
MEASUREMENT_PLAN = REVIEWABLE_DRAFT
FORMAL_PASS = NOT_PERFORMED
```
