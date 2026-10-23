<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Implementation tranche proposal

```text
IP_ID = IP-WXE-CANDIDATE-1
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
```

## Delivery boundaries

- Documentation candidate first (this PR)
- Application mutation only after Founder authorization
- Prefer **P0 corrective** before full redesign
- No merge/deploy from the documentation task
- Do not disturb UOE PR #424 or other parallel work

## Recommended tranches

| Tranche | Name | Scope | Risk | Depends on |
|---|---|---|---|---|
| T0 | `WXE-P0-CORRECTIVE-1` | **P0-A only**: delivery prefills, attestation, terminal confirms, Delivery workspace Takeaway filter / queue honesty | R2 | Founder Controlled Exception authorize |
| T1 | IA & chrome | Nav collapse, Admin breadcrumbs, single H1 (incl. Orders), Scheduling nav, P1-ENTRY/P1-COMM | R2 | PD/XD gates as required; Founder UPD-02/03 |
| T2 | Daily ops UX | Capability-gated lifecycle buttons + mode-sensitive order; consume **UOE UX-A** label map; narrow timing; enterprise reskin | R1/R2 | T1; UOE label ownership |
| T3 | Commercial UX | Review relabel; menu section/entry consequence review; draft/live clarity | R2 | T1; coordinate IMP-036J UAT for #376/#381 root causes (not owned by WXE alone) |
| T4 | People & polish | Mutator vs diagnostic framing; a11y (2.4.11/2.5.7/2.5.8); measurement hooks | R2 | T2/T3 |

T0 may proceed under Founder **Controlled Exception** (see findings register) without full WXE
IMP allocation. It does **not** claim to close IMP-032 server proof-policy wording.

## Effort (indicative, non-binding)

| Tranche | Indicative size |
|---|---|
| T0 | Small (1 focused PR) |
| T1 | Medium |
| T2 | Medium |
| T3 | Medium |
| T4 | Small–medium |

## Risk and dependency matrix

| Risk | Tranche | Mitigation |
|---|---|---|
| Fabricated delivery evidence in production | T0 | Empty defaults + tests |
| Least-privilege commercial roles blocked | T0 | Entry union |
| Kitchen sees Admin shell | T0/T1 | WXE-UPD-03 decision |
| Scope creep into POS | All | Hard out-of-scope list |
| Collision with UOE | All | Separate packages/PRs |
| IMP-036J pending acceptance | T3 | Do not claim 036J accepted; coordinate commercial surfaces |

## Authorization wall

```text
Implementation Authorization: NOT_GRANTED
Future IMP identity: NOT_ALLOCATED
Merge/deploy from this documentation PR: NO
```
