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

## Phase-2 design (proposal only)

Phase 2 is not implemented here. No `.cursor/rules` files are added by this change, and
`AGENTS.md` is not slimmed here.

Detailed procedure may move out of the always-loaded contract. The move is unsafe if the only
copy of “load this rule” lives in a rule that is never loaded. A rule with `alwaysApply: false`
and neither a `description` nor `globs` is an explicit manual/`@` rule. It cannot be the sole
instruction that tells an agent to load it.

Cursor frontmatter used below:

- `alwaysApply: true` — always included.
- `alwaysApply: false` plus `description` — intelligent / relevance-selected.
- `alwaysApply: false` plus `globs` — file-scoped.
- `alwaysApply: false` with neither `description` nor `globs` — explicit manual/`@` rule.

None of the four proposed rules is manual-only.

### Always-loaded kernel

Phase 2 must preserve an always-loaded kernel. Minimum contents:

```text
SOLE_AGENT_CONTRACT / NO_COMPETING_AUTHORITY
COMPACT_CANONICAL_AUTHORITY_INDEX
MANDATORY_READ_ORDER_BOOTSTRAP
RISK_BOUNDED_AUTONOMY
STOP / DECISION_REQUIRED BOUNDARIES
ANTI_HALLUCINATION / NO_INVENTED_BINDING_SEMANTICS
ESSENTIAL_REPOSITORY_SAFETY
SCOPED_RULE_TRIGGER_INDEX
```

These already stay in `AGENTS.md` if the measured detail sections move and nothing else is cut:
the sole-contract preamble, the canonical authority table, risk-bounded autonomy, stop statuses,
the decision boundary (including no invented binding semantics), anti-hallucination vocabulary,
and the foundation-constraints pointer.

The items below are not in that remainder, because an earlier estimate removed their parent
sections with no replacement. Phase 2 adds this compact text back into the always-loaded kernel.
The read-order bootstrap explicitly tells the agent to load `boba-read-order.mdc` and the
applicable canonical authorities for governed work.

```text
For governed product, architecture, lifecycle, or current-slice work, load `.cursor/rules/boba-read-order.mdc` and the applicable canonical authorities named by the compact authority index. This bootstrap stays always loaded. The read-order rule is not manual-only, and neither that rule nor this kernel replaces those authorities.
FORCE_PUSH_OR_HISTORY_REWRITE_REQUIRES_R3
NO_UNREVIEWED_DIRECT_MAIN_MUTATION
REQUIRED_PROVENANCE/FINGERPRINT_AT_GOVERNED_MILESTONES
POST_MERGE_BRANCH_CLEANUP_ONLY_AFTER_REQUIRED_MACHINE_PROOF
Founder UAT and formal acceptance are consequential human gates and cannot be self-granted.
Scoped rule trigger index: boba-read-order.mdc (intelligent; alwaysApply false + description; governance, product, architecture, or current-slice work); boba-alignment-reporting.mdc (intelligent; alwaysApply false + description; alignment or session-close reporting); boba-acceptance-uat.mdc (file-scoped; alwaysApply false + globs; acceptance, Founder UAT, and reconciliation evidence); boba-branch-and-fingerprint.mdc (intelligent; alwaysApply false + description; branch, publish, fingerprint, or post-merge hygiene).
```

Essential repository safety that must remain always loaded, in compact form:

```text
FORCE_PUSH_OR_HISTORY_REWRITE_REQUIRES_R3
NO_UNREVIEWED_DIRECT_MAIN_MUTATION
REQUIRED_PROVENANCE/FINGERPRINT_AT_GOVERNED_MILESTONES
POST_MERGE_BRANCH_CLEANUP_ONLY_AFTER_REQUIRED_MACHINE_PROOF
```

### Proposed rule modes

Section sizes are UTF-8 bytes of current `AGENTS.md` heading ranges. They are the detail that may
move. Meaning of moved text must not change. The canonical authority model remains `AGENTS.md`
and the authorities it references.

| Rule | Mode | Frontmatter | Detail that may move | Bytes | Kernel trigger |
|---|---|---|---|---:|---|
| `.cursor/rules/boba-read-order.mdc` | intelligent | `alwaysApply: false` + strong `description` | Mandatory read order; Operating planes | 3645 | Description selects governance, product, architecture, or current-slice work. The always-loaded bootstrap instructs the agent to load this rule and the applicable canonical authorities for that work. |
| `.cursor/rules/boba-alignment-reporting.mdc` | intelligent | `alwaysApply: false` + `description` | Alignment gate; Session-close reporting; Scope rules; Status vocabulary | 3750 | Description selects alignment and session-close reporting. Detailed templates may move. |
| `.cursor/rules/boba-acceptance-uat.mdc` | file-scoped | `alwaysApply: false` + `globs` | Acceptance contract; Founder UAT procedure; Canonical reconciliation; Capability architecture persistence | 9174 | Globs cover acceptance and Founder UAT evidence. The kernel keeps the invariant that Founder UAT and formal acceptance are consequential human gates and cannot be self-granted. |
| `.cursor/rules/boba-branch-and-fingerprint.mdc` | intelligent | `alwaysApply: false` + `description` | Repository safety procedure; Branch lifecycle; Working-tree fingerprint procedure | 6308 | Description selects branch, publish, fingerprint, and post-merge hygiene. The four essential safety invariants stay in the kernel. |

Detail-section total: 22877 bytes. None of these files sets `alwaysApply: true`. Setting them
always-on would remove the savings. Do not describe them as manual rules.

## Phase-2 estimate

The earlier figure 13079 assumed those 22877 bytes left the always-loaded contract with no
replacement. That figure is withdrawn. The revised estimate adds the compact kernel retainer
back.

`kernel_retainer_addend_bytes` is the UTF-8 length of the fenced retainer above, excluding the
newline that closes the fence (1136). It is an estimate of text Phase 2 would add to `AGENTS.md`.
It is not a measurement of a slimmed `AGENTS.md`, because this change does not edit `AGENTS.md`.
Proposed rule files are excluded: `alwaysApply: false` means they are not always included.

```text
current_always_loaded_bytes: 35956
agents_bytes_now: 35945
detail_sections_moved_bytes: 22877
agents_remainder_with_no_replacement: 13068
kernel_retainer_addend_bytes: 1136
proposed_phase2_always_loaded_bytes: 14215
```

14215 = (35945 − 22877 + 1136) + unchanged `CLAUDE.md` (11).
Phase 2 must not change rule meaning while moving text, and must not treat extraction sources of
`docs/platform/governance/current-context.json` as the complete canonical authority set.
