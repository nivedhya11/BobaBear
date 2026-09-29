# Cursor context audit

Non-authoritative measurement and Phase-2 implementation record. This file is not an agent
contract, not a product authority, and not a lifecycle authority.

## Source baseline

```text
repository: nivedhya11/BobaBear
canonical_path: /home/ajoshi/repos/boba-bear-platform
base_head: 54fb4005b02ad5395092f39d0535be5bf8a475ca
base_tree: dc21f55846a367f01e2565efcc4a516a8a4e60e9
phase_1: ACCEPTED / MERGED / PR #327 / POST-MERGE PROOF PASS
implementation_branch: chore/agent-token-efficiency-phase2
implementation_head: the HEAD of this branch that contains this record
implementation_tree: that HEAD's tree
```

`implementation_head` and `implementation_tree` are Git identity. They are not copied into this
file before the commit that creates the record, because that commit would invalidate an in-file SHA.

## What is always loaded

Measured with `wc -c` and reproduced by `npm run agent:context:check`.

| Surface | Bytes before | Bytes after | Evidence |
|---|---:|---:|---|
| `AGENTS.md` | 35945 | 28134 | `wc -c AGENTS.md` |
| `CLAUDE.md` | 11 | 11 | file bytes remain `@AGENTS.md\n` |
| `.cursor/rules` | 0 | 0 | directory absent |
| Repo always-loaded total | 35956 | 28145 | sum of the rows above |

```text
reduction_bytes: 7811
reduction_percent: 21.72
```

21.72% is `7811 / 35956`. Byte reduction is not token reduction. This record does not claim a
runtime token saving.

`CLAUDE.md` remains the 11-byte `@AGENTS.md` delegation pointer. In the Phase-1 measurement
session, Cursor injected that pointer and injected `AGENTS.md` separately in full. A second copy
of the contract was not evidenced. Do not treat `@AGENTS.md` as proven expansion.

## Discovery metadata, separate from always-loaded bytes

Cursor may use skill `name` and `description` for automatic selection. That selection is
convenience only. The deterministic discovery mechanism is the procedure index in `AGENTS.md`.

```text
discovery_metadata_bytes: 1315
```

1315 is the UTF-8 length of the six skill `description` values only. It is an estimate of
discovery text. It is not included in the always-loaded total, and it is not a token count.

## On-demand procedure corpus

| Corpus | Bytes |
|---|---:|
| Six `SKILL.md` files | 15729 |
| Reference files | 6794 |
| On-demand total | 22523 |

Project skills: 6. Paths:

- `.cursor/skills/boba-read-order/SKILL.md`
- `.cursor/skills/boba-decision-required/SKILL.md`
- `.cursor/skills/boba-delivery-reporting/SKILL.md`
- `.cursor/skills/boba-delivery-reporting/references/templates.md`
- `.cursor/skills/boba-context-efficiency/SKILL.md`
- `.cursor/skills/boba-founder-uat/SKILL.md`
- `.cursor/skills/boba-branch-and-fingerprint/SKILL.md`
- `.cursor/skills/boba-branch-and-fingerprint/references/fingerprint.md`
- `.cursor/skills/boba-branch-and-fingerprint/references/post-merge.md`

`.cursor/rules` is absent. `.agents/skills/` is absent. This repository uses `.cursor/skills/`
and does not duplicate the skills under `.agents/skills/`.

The on-demand total includes short subordination headers. It is the procedure corpus, not a
1:1 extract of the 7811-byte always-loaded reduction. Safety invariants stayed in `AGENTS.md`,
so the kernel is larger than the withdrawn Phase-1 remainder estimate.

## Phase-1 statements corrected

Phase 1 recorded a proposal. That proposal is superseded by implemented Option C.

- Cursor skills support a `paths` field. These task-typed skills omit `paths` because they are
  repo-wide procedures, not file-scoped rules.
- `.cursor/skills/` and `.agents/skills/` are both supported project skill locations. This
  repository deliberately uses `.cursor/skills/` only.
- `disable-model-invocation` is omitted so ordinary skill discovery remains available.
- The earlier four-rule `.cursor/rules` proposal (`boba-read-order.mdc`,
  `boba-alignment-reporting.mdc`, `boba-acceptance-uat.mdc`, `boba-branch-and-fingerprint.mdc`)
  is not implemented. No `alwaysApply`, intelligent, glob, or manual rule was added.
- The Phase-1 figures `detail_sections_moved_bytes: 22877`, `kernel_retainer_addend_bytes: 1136`,
  and `proposed_phase2_always_loaded_bytes: 14215` were estimates. They are withdrawn. The
  measured always-loaded size is 28145 bytes.

## Semantics preserved

Packaging only. No Product, Experience, Product Language, Architecture, ROADMAP lifecycle, STATE
accepted reality, PD-2, or TEST-1 semantic change.

The long PD-2 arrow diagram was removed from `AGENTS.md` after confirming
`docs/platform/PRODUCT-DELIVERY.md` contains the authoritative phase sequence, including the
phases that diagram summarized. `PRODUCT-DELIVERY.md` remains the owner of that sequence. The
phases remain process phases, not ROADMAP lifecycle states. Prospective PD-2 constants remain in
`AGENTS.md`.

`docs/platform/governance/current-context.json` remains `authority = NON_AUTHORITATIVE`.

IMP-036J is unchanged:

```text
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_GATE = PASS
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
NEXT_GATE = DESIGN_READINESS
DESIGN_READINESS = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
```

This change does not enter Design Readiness and does not authorize implementation.

## Removed-section coverage

Each former `AGENTS.md` section is one of: A retained in the kernel, B moved to a named skill or
reference, C removed as verified duplication of a canonical authority, D redundant wording whose
binding invariant remains.

| Former section | Class | Surviving location |
|---|---|---|
| Next.js current-version notice | A | `AGENTS.md` |
| Sole-contract preamble | A | `AGENTS.md` |
| PD-2 constants, prospective boundary, IMP-036E lifecycle | A | `AGENTS.md` |
| PD-2 arrow diagram | C | `docs/platform/PRODUCT-DELIVERY.md` |
| Canonical authority index | A | `AGENTS.md` (capability-architecture row kept in the index) |
| Mandatory read order and pre-PD-1 / range-read rule | B | `.cursor/skills/boba-read-order/SKILL.md` |
| Operating planes | A | `AGENTS.md` |
| GREEN / AMBER / RED overlay | A | `AGENTS.md` |
| `DECISION_REQUIRED` template | B | `.cursor/skills/boba-decision-required/SKILL.md` |
| R0–R3, delivery modes, `NO_COMMIT` conflict, ownership, failure evidence | A | `AGENTS.md` |
| Alignment obligation | A | `AGENTS.md` |
| Alignment and session-close templates | B | `.cursor/skills/boba-delivery-reporting/references/templates.md` |
| Stop statuses and decision boundary | A | `AGENTS.md` |
| Anti-hallucination vocabulary and scope headings | A | `AGENTS.md` |
| Status vocabulary and no self-acceptance | A | `AGENTS.md` |
| Acceptance-evidence checklist | B | `.cursor/skills/boba-delivery-reporting/SKILL.md` |
| Current-first / history non-authority / 50,000-character limit | A | `AGENTS.md` |
| Prompt, history-selection, and review-delta procedure | B | `.cursor/skills/boba-context-efficiency/SKILL.md` |
| Repeated delivery-mode sequence inside the efficiency section | D | Delivery mode section of `AGENTS.md` |
| Canonical reconciliation and capability-architecture persistence | A | `AGENTS.md` |
| Repository safety, slice-start limits, dirty-tree and volume protections | A | `AGENTS.md` |
| Fingerprint command and porcelain-hash prohibition | A | `AGENTS.md` |
| Fingerprint definition detail | B | `.cursor/skills/boba-branch-and-fingerprint/references/fingerprint.md` |
| Post-merge hygiene and deletion refusal path | B | `.cursor/skills/boba-branch-and-fingerprint/references/post-merge.md` |
| Founder UAT authority boundary | A | `AGENTS.md` |
| Founder UAT exact-candidate workflow and current applicability | B | `.cursor/skills/boba-founder-uat/SKILL.md` |
| Foundation operating constraints pointer | A | `AGENTS.md` |

The post-merge reference keeps the existing refusal path and states the accepted Phase-2
clarification: a `git cherry` line beginning with `+` preserves the branch and stops deletion.
A result with no `+` remains insufficient under squash or rebase histories.

## Machine proof

`npm run agent:context:check` validates this packaging structurally. It does not re-validate
product, experience, architecture, or lifecycle semantics, and it is not a second authority
registry. `npm run project:consistency` invokes the same check.
