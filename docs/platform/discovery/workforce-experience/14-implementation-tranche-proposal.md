<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Implementation tranche proposal

```text
IP_ID = IP-WXE-CANDIDATE-1
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
PLANNING_PROPOSAL_ONLY = YES
REFINEMENT = WXE-PD-XD-REFINEMENT-R2
```

This document is a **planning proposal**. It does **not** authorize implementation, merge, deploy,
T1 start, or any application mutation. Tranche language must not be read as a task contract.

## Delivery boundaries

- Documentation candidate first (this PR #426)
- Application mutation only after Founder authorization
- Prefer **P0 corrective** (separate PR #427) before full redesign
- No merge/deploy from the documentation task
- Do not disturb UOE PR #424, corrective PR #427 contents, or other parallel work
- Do **not** start T1 or later tranches from this documentation refinement

## Recommended tranches

| Tranche | Name | Scope | Risk | Depends on |
|---|---|---|---|---|
| T0 | `WXE-P0-CORRECTIVE-1` | **Already-published, separately authorized PR #427 scope only**: delivery prefills, attestation, terminal confirms, Delivery workspace Takeaway filter / queue honesty | R2 | Prior Founder Controlled Exception for impl/publication; **merge/deploy still unapproved** |
| T1 | IA & chrome | Nav-layer collapse (V1 chrome), Admin breadcrumbs, single H1 (incl. Orders), Scheduling nav, **P1-ENTRY / P1-COMM OPTION_R / UPD-02/03 outcomes** | R2 | PD/XD gates as required; **Founder UPD-02/03 A/B**; **OPTION_R ratification**; UPD-06 YES |
| T2 | Daily ops UX | Capability-gated lifecycle buttons + mode-sensitive order; consume **UOE UX-A** label map; narrow timing; enterprise reskin | R1/R2 | T1; UOE label ownership |
| T3 | Commercial UX | Review relabel; menu section/entry consequence review (**P1-C**); draft/live clarity | R2 | T1; coordinate IMP-036J UAT for #376/#381 root causes (not owned by WXE alone) |
| T4 | People & polish | Mutator vs diagnostic framing; a11y (2.4.11/2.5.7/2.5.8); measurement hooks; **P2-G** follow-up confirms if still deferred | R2 | T2/T3 |
| — | Server Gaps 1–3 | Proof policy / cancel auto-attestation / URL-body identity | Separate | **WXE-UPD-08**; not owned by T0 UI or T1 IA |

**T0 boundary (strict):** T0 represents the already published, separately authorized PR #427 scope
only. Administration entry-union work, kitchen/delivery Administration routing, and P1-ENTRY/P1-COMM
are **not** T0 risk or mitigation ownership — they sit under the future IA/routing tranche subject
to Founder Product/Experience decisions.

T0 may proceed under prior Founder **Controlled Exception** for implementation/publication without
full WXE IMP allocation. It does **not** claim to close IMP-032 server proof-policy wording or
Gaps 1–3. Merge/deploy of PR #427 remain Founder-gated.

## Effort (indicative, non-binding)

| Tranche | Indicative size |
|---|---|
| T0 | Small (1 focused PR — already published as #427) |
| T1 | Medium |
| T2 | Medium |
| T3 | Medium |
| T4 | Small–medium |

## Risk and dependency matrix

| Risk | Tranche / owner | Mitigation |
|---|---|---|
| Fabricated delivery evidence in production | **T0** (PR #427) | Empty defaults + tests; merge still Founder-gated |
| Least-privilege commercial roles blocked / entry union | **T1** (UPD-02) | Founder A/B; capability-fixture + landing tests if A |
| Kitchen/Delivery sees Admin shell via `outlet.read` | **T1** (UPD-03) | Founder A/B vs `role-destination-safety`; not T0 |
| Server Gaps 1–3 | **Separate corrective** (UPD-08) | Do not claim UI closes; architecture/security decision |
| Scope creep into POS | All proposals | Hard out-of-scope list |
| Collision with UOE | All proposals | Separate packages/PRs; consume UX-A only |
| IMP-036J pending acceptance | T3 proposal | Do not claim 036J accepted; coordinate commercial surfaces |
| P2-G immediate-effect store confirms | FOLLOW_UP / T4 proposal | Not V1 chrome |

## Authorization wall

```text
Implementation Authorization: NOT_GRANTED
Future IMP identity: NOT_ALLOCATED
T0 merge/deploy: NOT_AUTHORIZED by this document
T1 or later start: NOT_AUTHORIZED
Merge/deploy from this documentation PR: NO
PLANNING_PROPOSAL_ONLY = YES
```
