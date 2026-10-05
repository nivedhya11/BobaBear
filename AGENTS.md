<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your
training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.
Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# BOBA Bear — Agent Execution Contract

This file is the **sole agent operating contract**. It points to canonical authorities; it is not an
independent roadmap, state, vision, or architecture authority. Do not create a competing governance
document or duplicate rule source. `CLAUDE.md` delegates here.

```text
SOLE_AGENT_OPERATING_CONTRACT = YES
COMPETING_GOVERNANCE_AUTHORITY = NO
```

Canonical documents named below remain authoritative over this contract, over project skills, and
over conversational restatement. Skills under `.cursor/skills/` are subordinate procedures, not
authorities. There is one canonical body for each procedure. Do not add `.cursor/rules`. Do not
duplicate these skills under `.agents/skills/`.

```text
SKILLS_ARE_SUBORDINATE_PROCEDURES = YES
SKILLS_ARE_NOT_AUTHORITIES = YES
ONE_CANONICAL_BODY_PER_PROCEDURE = YES
NO_CURSOR_RULES_LAYER = YES
NO_AGENTS_SKILLS_DUPLICATE = YES
DETERMINISTIC_DISCOVERY = explicit paths in the procedure index below
CURSOR_AUTOMATIC_SKILL_SELECTION = CONVENIENCE_ONLY
BEFORE_DEPENDENT_ACTION_READ_NAMED_SKILL = REQUIRED
SKILL_UNREADABLE = STOP_AFFECTED_ACTION
```

Generated `docs/platform/governance/current-context.json` remains non-authoritative. It is
projected from GOV-2 machine-readable blocks in ROADMAP/STATE plus architecture and decision
metadata. It is not an authority registry and must not substitute for required canonical reads.

```text
GENERATED_CURRENT_CONTEXT_AUTHORITY = NON_AUTHORITATIVE
```

Product delivery process for new substantial product work from IMP-036F onward is PD-2. The
canonical method is [`PRODUCT-DELIVERY.md`](docs/platform/PRODUCT-DELIVERY.md). Experience is
[`EXPERIENCE.md`](docs/platform/EXPERIENCE.md) (EXP-1). Product language is
[`PRODUCT-LANGUAGE.md`](docs/platform/PRODUCT-LANGUAGE.md) (LANG-1).

The authoritative PD-2 phase sequence lives only in `PRODUCT-DELIVERY.md`. These are delivery
process phases, not new ROADMAP lifecycle states. IMP-036E and earlier retain their existing lifecycle
(`ANCHOR → GATE → EXECUTE → PROVE → ACCEPT → RECONCILE → ADVANCE`). Historical accepted IMPs are
not rewritten.

```text
PRODUCT_DELIVERY_PROCESS = PD-2
EXPERIENCE_STANDARD = EXP-1
PRODUCT_LANGUAGE_STANDARD = LANG-1
PRODUCT_DELIVERY_PROCESS_EFFECTIVE_FROM = IMP-036F
HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
IMP036E_LIFECYCLE_CHANGED = NO
PD1_DID_NOT_ACTIVATE_IMP036F_AT_ADOPTION = YES
CR_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
```

PD-1 did not itself activate IMP-036F when introduced. IMP-036F activation is governed by CURRENT
[`ROADMAP.md`](docs/platform/ROADMAP.md) / [`STATE.md`](docs/platform/STATE.md)
(`IMP036F_ACTIVATED`). Read current lifecycle truth only from those authorities. PD-2 is
prospective. IMP-036J is the first current slice transitioning into it.

## Canonical authorities

| Question | Authority |
|---|---|
| Why / GTM outcome / Non-Goals | [`docs/platform/VISION.md`](docs/platform/VISION.md) |
| Durable global architecture | [`docs/platform/ARCHITECTURE.md`](docs/platform/ARCHITECTURE.md) |
| Which decisions are binding | [`docs/platform/decision-register.md`](docs/platform/decision-register.md) |
| IMP identity / sequence / GTM boundary | [`docs/platform/ROADMAP.md`](docs/platform/ROADMAP.md) |
| Independently accepted reality | [`docs/platform/STATE.md`](docs/platform/STATE.md) |
| How product work is defined/delivered | [`docs/platform/PRODUCT-DELIVERY.md`](docs/platform/PRODUCT-DELIVERY.md) (PD-2) |
| Experience intent, criticality, and experience gates | [`docs/platform/EXPERIENCE.md`](docs/platform/EXPERIENCE.md) (EXP-1) |
| Customer and operator language | [`docs/platform/PRODUCT-LANGUAGE.md`](docs/platform/PRODUCT-LANGUAGE.md) (LANG-1) |
| Personas / journeys / per-IMP stories | [`docs/platform/product/README.md`](docs/platform/product/README.md) and relevant Product Definition |
| Locked capability architecture / ADRs | Relevant capability architecture and `docs/platform/decisions/` |
| How behaviour is proven | [`docs/platform/TESTING.md`](docs/platform/TESTING.md) (TEST-1) |
| Agent rules (this file) | `AGENTS.md` |
| Accepted foundation operating constraints | [`docs/platform/accepted-foundation-operating-rules.md`](docs/platform/accepted-foundation-operating-rules.md) (SUPPORTING) |

Historical / supporting platform docs are indexed in [`docs/platform/README.md`](docs/platform/README.md).
Older planning folders (wireframes, design-system drafts) are reference-only unless a CURRENT
authority says otherwise. Canonical docs remain authoritative over conversational restatement.

## Mandatory read-order bootstrap

For governed product, architecture, lifecycle, payment, security, persistence, or current-slice
work, read [`.cursor/skills/boba-read-order/SKILL.md`](.cursor/skills/boba-read-order/SKILL.md)
before that work proceeds. If that skill cannot be read, STOP affected governed work. The skill
does not replace the canonical authorities.

## Scoped procedure index

Read the named skill before the dependent action. Automatic skill selection is additional
convenience only. If the named skill cannot be read, STOP the affected action.

| When | Skill |
|---|---|
| Governed product, architecture, lifecycle, payment, security, persistence, or current-slice work | [`.cursor/skills/boba-read-order/SKILL.md`](.cursor/skills/boba-read-order/SKILL.md) |
| RED tier or an unresolved material decision | [`.cursor/skills/boba-decision-required/SKILL.md`](.cursor/skills/boba-decision-required/SKILL.md) |
| Before source mutation, and at required session close | [`.cursor/skills/boba-delivery-reporting/SKILL.md`](.cursor/skills/boba-delivery-reporting/SKILL.md) |
| Implementation-prompt construction, historical-context selection, or review-evidence packaging | [`.cursor/skills/boba-context-efficiency/SKILL.md`](.cursor/skills/boba-context-efficiency/SKILL.md) |
| Founder UAT deployment or Founder-UAT acceptance evidence | [`.cursor/skills/boba-founder-uat/SKILL.md`](.cursor/skills/boba-founder-uat/SKILL.md) |
| Governed working-tree fingerprint or post-merge branch hygiene | [`.cursor/skills/boba-branch-and-fingerprint/SKILL.md`](.cursor/skills/boba-branch-and-fingerprint/SKILL.md) |

## Operating planes

```text
Cursor  = senior delivery owner (execution + routine delivery ownership)
ChatGPT = product + architecture authority / milestone reviewer
Human   = product/architecture risk authority and consequential production/acceptance authority

DURABLE VERIFICATION = GitHub / CI
```

Autonomy never permits guessed product, security, payment, or business decisions. Escalation is by
decision/risk boundary, not every Git command. Governance effort is proportional to risk. Do **not**
add ChatGPT approval gates to GREEN/AMBER work. Escalate to ChatGPT only when canonical authority
cannot resolve a material product/architecture decision.

### Risk-tier delivery overlay (GREEN / AMBER / RED)

Maps onto the R0–R3 model below. GREEN/AMBER are authorized R1/R2 delivery under a locked contract;
RED aligns with `DECISION_REQUIRED` / human R3 gates.

| Tier | Scope | Delivery ownership |
|---|---|---|
| **GREEN** | Routine implementation, tests, refactors, fixes, documentation, deterministic governance reconciliation, CI/review fixes, normal PRs/merges | Cursor autonomous |
| **AMBER** | Security/auth/payment/persistence/infrastructure implementation already covered by locked Product Definition + architecture | Cursor autonomous while contract/invariant unchanged |
| **RED** | New/changed product behavior; architecture invariant; authority/service/role/permission/data-ownership/provider/material security policy; legal interpretation; controlled continuation; major risk acceptance; launch/acceptance; destructive production | Escalate with the `DECISION_REQUIRED` procedure. Read `.cursor/skills/boba-decision-required/SKILL.md` before that escalation. The skill does not grant the decision. |

For an active locked slice with explicit Founder delivery authorization (example: IMP-038 under locked
`PD-IMP-038-DRAFT-2` + ARCH-R21 / D-375 / ADR-017), Cursor may merge routine conforming GREEN/AMBER
implementation PRs after required quality gates (CI green + self-review) when the task contract /
Founder delivery authorization explicitly permits it.

## Risk-bounded autonomy

| Level | Name | Autonomy |
|---|---|---|
| **R0** | `READ/ANALYZE` | Autonomous read, search, diagnosis, and analysis. No source mutation. |
| **R1** | `BOUNDED_ENGINEERING` | Implementation agent owns inspect → plan → edit → test → diagnose → same-scope repair → validate within authorized scope. Do not stop for every newly exposed same-class defect inside that scope. Use compact R1 alignment and completion reporting. |
| **R2** | `CONTRACT_SENSITIVE` | Product behaviour, public/domain contracts, payment, auth/security, persistence authority / schema strategy, concurrency semantics, provider policy, architecture/topology. Investigate autonomously; implement only when intended binding semantics are explicitly defined by canonical authority and the current authorized task; stop before inventing undefined binding behaviour or resolving canonical conflicts by assumption. Independent ChatGPT review is for material milestones, RED decisions, and pre-acceptance / consequential promotion — not every conforming GREEN/AMBER implementation PR. Full alignment and session-close reporting. |
| **R3** | `CONSEQUENTIAL` | Force push / history rewrite; production or destructive data operations; lifecycle or product acceptance; Founder UAT verdict; activating next IMPs; accepting IMPs; deployment/release that is not covered by an explicit Founder delivery authorization. Require explicit human authorization. Routine GREEN/AMBER PR merges may proceed autonomously when the task contract / Founder delivery authorization for an active locked slice explicitly permits them (after required quality gates). |

`R0`–`R3` are agent execution and autonomy levels only. Feature and change delivery risk uses a
separate scale in PD-2: `CR0` STANDARD, `CR1` ELEVATED, `CR2` HIGH, `CR3` CRITICAL. Experience
Criticality `X0`–`X3` is a third scale. Do not map CR values onto R values, and do not treat a low
X class as a low CR class.

```text
AGENTS_EXECUTION_RISK_SCALE = R0 | R1 | R2 | R3
CR_SCALE = CR0 | CR1 | CR2 | CR3
CR_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
X_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
NO_INVENTED_BINDING_SEMANTICS = YES
CANONICAL_CONFLICT_STOPS_AFFECTED_WORK = YES
```

### Risk escalation

- The task contract declares the initial risk level.
- The implementation agent may **raise** the risk classification when repository evidence requires it.
- The implementation agent may **not** silently downgrade the declared risk.
- If only part of the task crosses into a higher-risk or undefined boundary, stop affected work and
  continue safe authorized work where practical.

### Task-contract precedence

Task contracts may narrow agent scope or authority, including `NO_COMMIT`, but may not silently
downgrade R2/R3 safeguards or override canonical product, architecture, security, financial,
persistence, or lifecycle authority. Such overrides require the applicable explicit human or
canonical decision.

### Delivery mode (R1 and R2)

Task contracts may authorize either:

```text
DELIVERY_MODE=LOCAL_ONLY
DELIVERY_MODE=PUBLISH_PR
```

`DELIVERY_MODE` applies to both R1 and R2. Neither mode authorizes R3 actions.

- `LOCAL_ONLY` — in one run: inspect → implement → test → diagnose/self-correct → validate →
  local commit(s) → return once. A task-specific `NO_COMMIT` instruction may narrow this and forbid
  local commits. `NO_COMMIT` means no commit may be created and is compatible only with
  `LOCAL_ONLY` / unpublished work.
- `PUBLISH_PR` — in one run: inspect → implement → test → diagnose/self-correct → validate →
  commit(s) containing the task changes → create/use a short-lived task branch from the verified
  base when a suitable task branch is not already specified → normal push of that branch →
  PR creation → wait for exact-head PR CI to reach a terminal state → report the final CI outcome →
  return once. Ordinary task commits must **not** be published directly to `main`.
  `PUBLISH_PR` requires at least one commit containing the task changes. Returning while
  exact-head PR CI has merely started or is still pending is not permitted.

`NO_COMMIT` + `PUBLISH_PR` is a task-contract conflict: **STOP** rather than silently choosing one
constraint or weakening either. Do not invent a hybrid (for example push/PR without a commit).

When `DELIVERY_MODE` is unset, treat remote publication (push/PR) as unauthorized. Local commits
remain permitted for authorized R1/R2 engineering unless `NO_COMMIT` is set.

### Agent ownership

- One implementation agent normally owns the write path for a task.
- Multi-agent use is for genuinely parallel investigation or independent evaluation — not mandatory
  decomposition of ordinary coding.
- Same-scope implementation choices are delegated to the coding agent within authorized R1/R2 scope.
- Prefer repository / commit / PR / CI artifacts over large conversational evidence dumps.
- Reviewers should independently inspect GitHub rather than asking the implementation agent to
  restate independently observable facts.

### Failure evidence and retries

Aligned with [`TESTING.md`](docs/platform/TESTING.md) (TEST-1):

- Preserve the initial failure.
- Never present silent retries as proof of correctness.
- Diagnostic reruns after investigation are allowed when the original failure, diagnostic purpose,
  and result remain distinguishable.
- Same-scope repair + validation remains autonomous within authorized risk/delivery mode.

## Alignment gate

```text
NO_SOURCE_MUTATION_BEFORE_ALIGNMENT = YES
```

Before any source mutation, every implementation agent must verify alignment against canonical
authorities and report it with the `ALIGNMENT_GATE` templates.

A passing alignment gate is **not** a human approval checkpoint. The agent verifies it before
mutation and continues autonomously. If alignment fails, **STOP**. Return/control handoff is
required only if the gate fails or another escalation boundary is reached.

Before source mutation and at required session close, read
[`.cursor/skills/boba-delivery-reporting/SKILL.md`](.cursor/skills/boba-delivery-reporting/SKILL.md)
and use its templates. Prompt values must be verified against canonical documents rather than
repeated from memory. The six product-delivery fields apply prospectively; `N/A — PRE-PD-1` is
valid where appropriate for IMP-036E and earlier. Product-visible implementation from IMP-036F
requires a passed Product Definition Gate, story Definition of Ready, architecture fit/lock, and
implementation authorization. Story completion does not constitute IMP acceptance.

## Stop statuses

| Status | Meaning |
|---|---|
| STRATEGY_CONFLICT | Task conflicts with VISION / Non-Goals |
| ROADMAP_CONFLICT | Task conflicts with ROADMAP identity/sequence |
| STATE_CONFLICT | Task conflicts with accepted STATE |
| STATE_CODE_CONFLICT | STATE claims materially contradict verified code |
| ARCHITECTURE_MISMATCH | Task conflicts with ARCHITECTURE / ARCH-G invariants |
| DECISION_CONFLICT | Task conflicts with a CURRENT decision |
| DECISION_REQUIRED | Gap needs a human decision; agent must not invent one |
| PRODUCT_DECISION_REQUIRED | Material user/business behaviour is undefined and cannot be inferred; stop for a human product decision |
| DECISION_REGISTER_INVALID | Decision register structurally unusable |
| REPOSITORY_AUTHORITY_CONFLICT | Wrong repo/branch/HEAD authority |
| SCOPE_CONFLICT | Requested change exceeds allowed scope |
| EVIDENCE_GAP | Required evidence cannot be produced |
| ENVIRONMENT_BLOCKER | Environment prevents required validation |

Material conflict affecting correctness means: **STOP AFFECTED WORK**. No “reasonable
interpretation” workaround.

## Decision boundary

Within R1 and locked task scope, agents may make local, reversible implementation decisions that do
not change binding semantics.

R2 work may implement contract-sensitive behaviour only when the intended binding semantics are
explicitly defined by canonical authority and the current authorized task. Agents must stop before:

- inventing undefined binding behaviour
- resolving canonical conflicts by assumption
- materially changing authority beyond the authorized contract

Surfaces that remain R2-sensitive (implement only when explicitly defined and authorized; otherwise
stop / escalate):

- public/domain contracts
- persistence authority or schema strategy
- security/auth semantics
- concurrency semantics
- roadmap scope
- provider policy
- architectural topology
- new domain authority, lifecycle states, actor models, permission models, services, queues, retry
  semantics, financial/payment policy, or global architecture

Undefined gaps produce `DECISION_REQUIRED` or `PRODUCT_DECISION_REQUIRED`. Architecture agents must
not resolve `PRODUCT_DECISION_REQUIRED` by inventing product behaviour. A Product Definition must
not silently override global architecture, security/financial/persistence authority, concurrency
semantics, accepted STATE, or binding decisions. Stop affected work on conflict for human
resolution. Independent ChatGPT review remains required before R3 promotion / acceptance and for
material milestones or RED decisions; it is not a gate on every routine conforming GREEN/AMBER
implementation PR merge under an explicit Founder delivery authorization.

## Anti-hallucination vocabulary

```text
VERIFIED | KNOWN | INFERRED | ASSUMED | UNVERIFIED | NOT_FOUND | CONFLICT
```

Material correctness must not silently depend on `ASSUMED`, `UNVERIFIED`, or `CONFLICT`.
`NOT_FOUND` implies an appropriate search was performed.

## Scope rules

Implementation prompts must contain:

```text
MAY MODIFY
MAY MODIFY IF REQUIRED BY LOCKED ARCHITECTURE
MUST NOT MODIFY
EXPLICITLY OUT OF SCOPE
```

Require semantic scope, not only file paths. No opportunistic refactoring. Out-of-scope discoveries
are reported as `OUT_OF_SCOPE_OBSERVATION`, not automatically fixed.

## Status vocabulary

Coding agents may report only:

```text
COMPLETE | PARTIAL | BLOCKED
```

Agents must never self-report `COMPLETE_AND_ACCEPTED`.

```text
FORMAL_ACCEPTANCE_NOT_SELF_GRANTED = YES
```

When true, state explicitly: `PROMPT DEVIATIONS: NONE`.

Completion and session-close templates live in
[`.cursor/skills/boba-delivery-reporting/SKILL.md`](.cursor/skills/boba-delivery-reporting/SKILL.md).
Prefer compact deltas, paths, SHAs, CI URLs, and fingerprints over restating capability history or
independently observable GitHub facts.

## Context bootstrap

Apply **MINIMUM_SUFFICIENT_CONTEXT** from
[`PRODUCT-DELIVERY.md`](docs/platform/PRODUCT-DELIVERY.md#ai-execution-and-documentation-efficiency).

**CURRENT FIRST:** read [`docs/platform/ROADMAP.md`](docs/platform/ROADMAP.md) and
[`docs/platform/STATE.md`](docs/platform/STATE.md) for lifecycle authority.

**HISTORY ON DEMAND:** read [`docs/platform/history/`](docs/platform/history/) only when the task
materially requires historical revision, acceptance, or provenance detail. Agents MUST NOT load
complete historical snapshots during ordinary current product work. Historical snapshots do not
override CURRENT metadata.

Coding-agent implementation prompts must remain below 50,000 characters; split slices if needed.
Efficiency must never permit guessed product, security, payment, or business decisions.

For implementation-prompt construction, historical-context selection, or review-evidence packaging,
read [`.cursor/skills/boba-context-efficiency/SKILL.md`](.cursor/skills/boba-context-efficiency/SKILL.md)
before that work. Delivery-mode rules remain in this contract.

## Acceptance and human gates

Coding agent outcomes: `COMPLETE` | `PARTIAL` | `BLOCKED`.

Independent acceptance outcomes: `COMPLETE_AND_ACCEPTED` | `PARTIAL` | `DEFECT_FOUND` |
`ARCHITECTURE_MISMATCH` | `ACCEPTANCE_EVIDENCE_INSUFFICIENT`.

Implementation reports and generated handoffs are evidence input, not acceptance authority.
Lifecycle and product acceptance remain R3 (human). Formal acceptance cannot be self-granted.
Coding-agent completion is not formal acceptance.

```text
FOUNDER_UAT_VERDICT_OWNER = HUMAN_FOUNDER
AGENT_MAY_NOT_SELF_GRANT_FOUNDER_UAT_PASS = YES
```

Founder UAT verdict and acceptance reconciliation are consequential human gates. Only the
founder/user may provide the final interactive Founder UAT verdict. Implementation agents must
never self-declare `FOUNDER_UAT = PASS`. Where Founder UAT is required under PD-2,
`FOUNDER_UAT = FUNCTIONAL_UAT + EXPERIENCE_UAT`.

`COMPLETE_AND_ACCEPTED` must not be claimed, and `acceptedThrough` must not advance through a
capability that requires Founder UAT, until that gate has passed and reconciliation records it.
Exact-candidate identity includes at minimum canonical repository path, branch, `HEAD`, and
`WORKING_TREE_FINGERPRINT`. `HEAD` alone is insufficient.

Before Founder UAT deployment or Founder-UAT acceptance evidence, read
[`.cursor/skills/boba-founder-uat/SKILL.md`](.cursor/skills/boba-founder-uat/SKILL.md). If that
skill cannot be read, STOP the affected UAT action. This kernel remains the authority boundary.

## Canonical reconciliation rule

After a future IMP becomes `COMPLETE_AND_ACCEPTED`, a separate reconciliation step must update
applicable `STATE.md`, `ROADMAP.md`, acceptance record, and (if needed) `decision-register.md` /
`ARCHITECTURE.md`. Then run `npm run project:consistency`. Next-slice work must not begin while
canonical reconciliation is blocked.

## Capability architecture persistence

From IMP-024 onward, every substantial IMP must persist its complete locked capability architecture
in the repository before implementation begins. Missing historical architecture artifacts for
pre-governance accepted slices are historical gaps — they do not downgrade accepted implementation.

## Repository safety and publication

```text
PLATFORM_NAME = BOBA Bear Platform
CANONICAL_REPOSITORY_PATH = /home/ajoshi/repos/boba-bear-platform
DEFAULT_DEVELOPMENT_BRANCH = main
FORCE_PUSH_OR_HISTORY_REWRITE_REQUIRES_R3 = YES
NO_UNREVIEWED_DIRECT_MAIN_MUTATION = YES
BRANCH_CLEANUP_ONLY_AFTER_REQUIRED_MACHINE_PROOF = YES
DO_NOT_DELETE_UNIQUE_OR_UNCERTAIN_BRANCH_WORK = YES
WORKING_TREE_FINGERPRINT_COMMAND = npm run working-tree:fingerprint
PORCELAIN_STATUS_HASH_IS_NOT_FINGERPRINT = YES
```

- `/home/ajoshi/repos/boba-bear-platform` is the sole BOBA Bear Platform development authority.
- Default integration branch is `main`. Read/analyze and verified-base checkout may use `main`.
  Ordinary task commits must not be published directly to `main`. Remote publication (push/PR)
  requires an authorized delivery mode. When `DELIVERY_MODE` is unset, remote publication is
  unauthorized.
- For `PUBLISH_PR`, create or use a short-lived task branch from the verified base when a suitable
  task branch is not already specified. An explicit task/user branch authorization still controls
  when already provided.
- Do not create additional Git worktrees or duplicate BOBA development clones.
- Do not use `/mnt/c` as development repository authority; keep development under
  `/home/ajoshi/repos` on the WSL Linux filesystem (Turbopack/Podman reliability).
- Preserve intentional dirty-tree work. Never reset, stash, or clean unrelated work. Do not
  discard unique or uncertain local work.
- Do not run destructive Git operations (`reset`, `restore`, `clean`, `stash`, force checkout,
  force push, history rewrite) unless explicitly authorized (R3).
- Never destroy `boba-bear_postgres-data` or run `docker compose down --volumes`. Destructive
  volume and data actions are consequential.
- Prefer Podman for local DB/container runtime when Compose/container work is required.
- Preserve protected evidence directories (including `test-results-customer-ordering/**`).
- Local commits are authorized under R1/R2 `LOCAL_ONLY` and under `PUBLISH_PR`. `NO_COMMIT` may
  narrow only `LOCAL_ONLY` / unpublished work and forbids creating any commit; keep commits small
  and reconstructible. `NO_COMMIT` + `PUBLISH_PR` is a task-contract conflict (STOP).
- `PUBLISH_PR` authorizes short-lived-branch commit(s) + push + PR + wait for exact-head PR CI
  terminal state with reporting of the final outcome; do not re-require separate mid-run push/PR
  authorization for that sequence. Do not return while exact-head PR CI is only started or pending.
- Tag/release, deployment, force push, history rewrite, destructive data ops, lifecycle
  acceptance, Founder UAT, activating next IMPs, and accepting IMPs each require explicit human R3
  authorization. Routine GREEN/AMBER PR merges may proceed autonomously when the task contract /
  Founder delivery authorization for an active locked slice explicitly permits them.
- Only one product slice is normally active; never start a slice whose dependencies are unresolved.
  Historical controlled-continuation exceptions for the IMP-026 → IMP-028 period are CLOSED and
  MUST NOT be applied to future slices without an explicit new Founder/governance decision.
  Current lifecycle position (`acceptedThrough`, `currentProductSlice`, `pendingAcceptance`,
  `nextProductSlice`) is authoritative only in ROADMAP/STATE. `pendingAcceptance` identifies the
  oldest unresolved formal acceptance gate and does not by itself authorize starting another
  product slice.
- `main` is permanent. Explicitly required deployment branches may remain only while actively used.
  Normal task branches are short-lived. Their remote head is deleted after merge, and GitHub
  automatic head-branch deletion must remain enabled. Git history and merged pull requests are the
  historical archive. Never delete genuinely required unique unmerged work without first explicitly
  resolving it.
- Never delete an open or unmerged task branch merely because another task finished. Never delete a
  branch with known or uncertain unique work. Never delete an active investigation or candidate
  branch that belongs to another gate or task.
- Branch cleanup runs only after the required post-merge CI and CodeQL evidence has passed. Read
  [`.cursor/skills/boba-branch-and-fingerprint/SKILL.md`](.cursor/skills/boba-branch-and-fingerprint/SKILL.md)
  before post-merge local branch hygiene. If `git branch -d` refuses, do not force-delete. Any
  `git cherry` line beginning with `+` means preserve the branch and STOP. Absence of `+` is not
  sufficient proof under squash or rebase histories.
- Governed milestones that require provenance use `npm run working-tree:fingerprint`
  (`scripts/working-tree-fingerprint.mjs`). `WORKING_TREE_FINGERPRINT` is content-sensitive across
  tracked working-tree files and non-ignored untracked repository files. Do not substitute
  `git status --porcelain | sha256sum` (or hashing porcelain paths only). Default porcelain reports
  an already-untracked directory as one entry, so edits underneath that directory do not change a
  porcelain-only hash. `npm run governance:fingerprint` is a separate canonical-document manifest
  hash. Detailed fingerprint and post-merge procedure live in the branch-and-fingerprint skill.
- Platform docs under `docs/platform/` are canonical for product/architecture; treat older wireframe
  folders as historical unless CURRENT authority says otherwise.

## Foundation operating constraints

Slice-specific accepted operating rules (config, database, auth, cart, checkout, payment, order,
audits, etc.) live in
[`docs/platform/accepted-foundation-operating-rules.md`](docs/platform/accepted-foundation-operating-rules.md).
They are SUPPORTING constraints for agents touching those foundations. They must not redefine IMP
numbering or acceptance.
