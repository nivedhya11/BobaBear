# Cursor context audit

Non-authoritative measurement. This audit does not slim `AGENTS.md`, change PD-2, or add a rule
authority. Phase 2 below is a proposal only and is not applied in this change.

Measured on canonical `main` `ab3db331af5050e0ce6a653e743993cabc368259` before this tooling
change. `AGENTS.md` was not edited here, so its size is unchanged.

## What is always loaded

| Surface | Bytes | Evidence |
|---|---:|---|
| `AGENTS.md` | 35945 | `wc -c AGENTS.md` |
| `CLAUDE.md` | 11 | file bytes are `@AGENTS.md\n` |
| `.cursor/rules` | 0 | directory absent (`ls .cursor/rules` failed; no tracked files) |
| Repo always-loaded total | 35956 | sum of the rows above |

`CLAUDE.md` is an always-applied workspace rule whose body is the literal `@AGENTS.md` pointer.
In the Cursor session that performed this audit, the injected rule text for `CLAUDE.md` was that
11-byte pointer, and `AGENTS.md` was injected separately in full. A second copy of the 35945-byte
contract was not present in that injection. Do not treat `@AGENTS.md` as proven expansion.

## Duplication

No duplicate always-loaded rule body was evidenced.

- `CLAUDE.md` does not contain the `AGENTS.md` text. It references it in 11 bytes.
- `.cursor/rules` does not exist, so it cannot repeat `AGENTS.md`.
- `AGENTS.md` restates the PD-2 phase list that also lives in `docs/platform/PRODUCT-DELIVERY.md`.
  That document is not an always-applied rule. The overlap is documentary, not double inclusion.

## Suitable for scoped or manual rules

Section sizes below are UTF-8 bytes of `AGENTS.md` heading ranges. They are the Phase 2 move set.
The kernel stays always loaded: preamble, canonical authority table, risk-bounded autonomy,
stop statuses, decision boundary, anti-hallucination vocabulary, and the foundation-constraints
pointer.

| Proposed manual rule (`alwaysApply: false`) | Moved sections | Bytes |
|---|---|---:|
| `.cursor/rules/boba-read-order.mdc` | Mandatory read order; Operating planes | 3645 |
| `.cursor/rules/boba-alignment-reporting.mdc` | Alignment gate; Session-close reporting; Scope rules; Status vocabulary | 3750 |
| `.cursor/rules/boba-acceptance-uat.mdc` | Acceptance contract; Founder UAT; Canonical reconciliation; Capability architecture persistence | 9174 |
| `.cursor/rules/boba-branch-and-fingerprint.mdc` | Repository safety and publication; Branch lifecycle; Working-tree fingerprint | 6308 |

Moved total: 22877 bytes. Those files must not set `alwaysApply: true`. They are requestable or
task-scoped. Setting them always-on would remove the savings.

## Phase-2 estimate

```text
current_always_loaded_bytes: 35956
proposed_phase2_always_loaded_bytes: 13079
```

13079 = remaining `AGENTS.md` kernel (35945 − 22877 = 13068) plus unchanged `CLAUDE.md` (11).
Phase 2 must keep canonical docs as authority and must not change rule meaning while moving text.
