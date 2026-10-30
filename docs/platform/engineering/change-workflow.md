---
Status: SUPPORTING ENGINEERING WORKFLOW
Standard: BEDS-1
Authority: NONE — SUPPORTING ENGINEERING WORKFLOW
---

# BOBA Bear — Bounded Change Workflow & Engineering Delivery Standard (BEDS-1)

This file is the supporting engineering workflow for how a change moves through the existing
repository. It does not change product, architecture, decision, roadmap, or acceptance authority.
[`AGENTS.md`](../../../AGENTS.md) remains the sole agent operating contract.
[`PRODUCT-DELIVERY.md`](../PRODUCT-DELIVERY.md) (PD-2) is the sole owner of product-story
Definition of Ready, Definition of Done, and product lifecycle gates. On conflict, those
authorities win. This standard does not add a product-delivery lifecycle or a canonical decision
authority.

```text
BEDS_1_AUTHORITY = SUPPORTING_ENGINEERING_WORKFLOW
PRODUCT_DELIVERY_PROCESS = PD-2
PRODUCT_DELIVERY_PROCESS_EFFECTIVE_FROM = IMP-036F
HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
IMP036E_LIFECYCLE_CHANGED = NO
CURRENT_ACTIVATION_AUTHORITY = ROADMAP.md / STATE.md
ACTIVATION_SNAPSHOT_IN_THIS_FILE = NO
STORY_COMPLETE_IMPLIES_IMP_ACCEPTED = NO
```

Current slice activation is read from [`ROADMAP.md`](../ROADMAP.md) and [`STATE.md`](../STATE.md).
This file does not keep an activation snapshot.

Begin from a recorded clean checkpoint and stop on unexplained drift. Keep changes diff-scoped.
Do not mutate unrelated files.

## Trunk and branches

Application source has one permanent branch, `main`. Task work uses one short-lived branch taken
from current `main` when a branch is authorized.

A new short-lived branch uses this documentary name:

`<type>/<issue-number>-<semantic-description>`

`type` is an existing semantic prefix (`docs`, `fix`, `feat`, `test`, `security`, or another
prefix already used on a task branch in this repository). The description is short kebab-case.
Example: `fix/395-checkout-location-provider-readiness`.

When an authorized engineering task has no owning issue, the pull request documents that
exception and the branch uses a descriptive name without an issue number. Example:
`docs/beds-1-supporting-workflow`.

Existing branches keep their names. Dependabot names stay as GitHub generates them. These names
are documentary. This standard does not add an Action that enforces them.

Keep IMP, story, and issue identity in the commit, pull request, and trace records.
[`repository-conventions.md`](./repository-conventions.md) (RHS-1) owns artifact naming inside the
tree. It does not own this branch-name convention.

Create that branch in the canonical checkout. Ordinary task work does not add another clone or
worktree. One implementation agent owns the write path for the task. An editor or language server
holding the directory is not a second source writer. Do not take a checkout by terminating another
process.

Integration is a pull request into `main`. The active `Protect main` ruleset already requires a
pull request, resolved review threads, and the current required status checks, including CodeQL.
Required approving reviews remain zero. GitHub already deletes the merged head branch
automatically. Leave the ruleset, [`.github/pull_request_template.md`](../../../.github/pull_request_template.md),
and the current Dependabot groups and labels unchanged.

After the pull request is merged and required post-merge CI and CodeQL have passed, retire the
local task branch with ordinary `git branch -d`, following [`AGENTS.md`](../../../AGENTS.md):
`git switch main`, `git fetch origin --prune`, `git pull --ff-only`, then
`git branch -d <completed-task-branch>`. If `-d` refuses, keep the branch until the pull request
is merged or deliberately superseded and the branch is shown to contain no unique work worth
preserving. `git cherry origin/main <completed-task-branch>` is one signal. A line beginning with
`+` means that commit is not in `origin/main`; preserve the branch. No `+` lines are not sufficient
proof under squash or rebase histories. Do not force-delete. Do not delete `main`, `gh-pages`, an
open pull request branch, or another task's uncertain or active branch.

## Traceability

Use the existing GitHub Project **BOBA Bear — Product Delivery** and its current fields: Status,
Delivery Stage, Priority, Gate, Capability, Work Item Type, and Founder Action. Work item types
already on that field are Epic, Story, Task, Bug, UAT Finding, Decision, Gate, and Parked
Capability. Use the project's existing views. Do not add a project, field, view, issue type, or a
second workflow.

A Project card is a human projection. Moving a card does not approve a Product Definition, pass a
gate, authorize implementation, pass Founder UAT, or accept an IMP.

Canonical identifiers stay in the repository. IMP identity is owned by
[`ROADMAP.md`](../ROADMAP.md). Story and acceptance-scenario identity is owned by the Product
Definition. Decision identity is owned by [`decision-register.md`](../decision-register.md). A
GitHub issue number or pull request number is a tracker id. It does not renumber an IMP, a story,
or an acceptance scenario.

Name a new item with the existing Project type and the identity that type already uses. These
examples illustrate the name. They do not rename an existing issue and they do not open a new one.

- Epic — the allocated IMP identity when the work is an IMP. Example:
  `[EPIC] IMP-036J — Promotions, Coupons & Offers`. Do not invent an IMP id.
- Story — the canonical `US-...` identity. Example:
  `[STORY] US-036J-012 — Operable Promotions & Coupons for workforce`.
- Bug — the component and the observable failure. Example:
  `[BUG] Checkout — payment returns to Review unexpectedly`.
- Task — the component and the intended engineering outcome. Example:
  `[TASK] Workflow — record the documentary branch name`.
- UAT Finding, Decision, Gate, and Parked Capability keep those Project types and their current
  authorities. A UAT Finding keeps the existing Founder UAT title, and the Founder owns the
  verdict. A Decision keeps its binding identity in
  [`decision-register.md`](../decision-register.md). A Gate keeps passage with the authority that
  PD-2 or the Founder already names. A Parked Capability keeps the existing parked title, for example
  `[PARKED] Deals — Founder-approved discovery preserved`. Parking does not activate or accept
  that capability.

Where a story belongs to an epic, use GitHub's native sub-issue link. Epic `#293` is already the
parent of the `US-036J-...` stories. A bug or task may use that same native parent when it
belongs to one story or epic. An item with no parent stays standalone. Do not keep a second list
for a relationship GitHub already stores.

A substantive implementation pull request names its owning GitHub issue, or records an explicit
exception when the authorized task has no owning issue. Where the change implements a product
story, it also names the canonical story id and the acceptance-scenario ids it covers. One
cohesive change may link several issues. `Fixes #n` asks GitHub to close that issue when the
pull request merges, and is used only when this change completes that issue. `Refs #n` records
the relationship and does not close the issue.

Optional area names, from the Founder-approved BEDS-1 proposal, are documentary:

`area:customer`, `area:checkout`, `area:fulfilment`, `area:commercial`, `area:operations`,
`area:platform`, `area:infrastructure`, `area:security`, `area:governance`

This file does not create those GitHub labels. An area name does not add a Project field and does
not copy Status, Delivery Stage, Priority, Gate, Capability, Work Item Type, or Founder Action.

## Product work and engineering work

Product-visible work follows the complete current PD-2 sequence in
[`PRODUCT-DELIVERY.md`](../PRODUCT-DELIVERY.md). That sequence includes, where PD-2 applies them,
experience definition, the Experience Gate, architecture fit and lock, Design Readiness, quality
and measurement finalization, implementation authorization, the QA layers, independent
implementation review, and Founder UAT as functional UAT and experience UAT. Those are process
phases in PD-2. They are not ROADMAP lifecycle states. This file does not restate them as a second
lifecycle. Read the current sequence there.

Engineering-only work with no product behaviour change may remain specification-driven. PD-2 owns
Definition of Ready and Definition of Done for product stories, including experience requirements
where they apply. Do not copy those definitions here.

`STORY_COMPLETE != IMP_ACCEPTED`. Story completion does not accept an IMP.

## Delivery steps

1. Verify applicable authorities and scope. For product-visible work, the applicable PD-2 gates
   must already have passed, including the Experience Gate and Design Readiness when PD-2 requires
   them. Stop on unresolved material product behaviour. Engineering-only work requires its approved
   specification and does not invent a Product Definition Gate.
2. Architecture fit, and lock when the capability requires a locked artifact, stay inside that
   PD-2 sequence. Complete them before implementation authorization or implementation. Stop on
   conflict with CURRENT authorities. Engineering-only work checks fit against existing authorities
   and stays specification-driven.
3. Record a clean checkpoint and repository provenance. Create the short-lived task branch only
   when authorized.
4. For a product story, use the Product Definition's stories and acceptance scenarios, PD-2
   Definition of Ready, and the tests required by [`TESTING.md`](../TESTING.md). Engineering-only
   work uses its specification's acceptance criteria. Require implementation authorization before
   coding product-visible or governed capability work.
5. Implement only the approved story, acceptance-scenario, or engineering-specification scope.
   Inside an authorized engineering task, same-scope diagnosis and repair stay with the
   implementation agent. Stop before inventing product, architecture, security, payment, or
   persistence behaviour.
6. Run focused tests, relevant regression, and deterministic local validation. Retain commands,
   exit codes, relevant raw output, and the diff. For a non-product task, that record plus the
   exact-head CI and CodeQL result, when a pull request was authorized, is the engineering
   completion evidence. It does not accept an IMP and it does not record a Founder verdict.
7. Create authorized small, reconstructible local commit(s). Record SHA, tree, and any required
   working-tree fingerprint. Never rewrite published history.
8. [`AGENTS.md`](../../../AGENTS.md) governs `DELIVERY_MODE`. An authorized `PUBLISH_PR` task
   permits that task's scoped commit, push, and pull request without a second publication
   approval. `LOCAL_ONLY`, and a task whose delivery mode is unset, stop before push. Retain the
   resulting CI run when a pull request exists. Do not weaken CI or edit unrelated source to
   obtain a green result.
9. Independently review the actual diff, architecture compliance, and deterministic evidence.
   Product-story review also covers story completeness and required Golden Journeys. First review
   covers the full relevant slice. Follow-up review uses the previous approved SHA to the new SHA,
   the changed files, the affected invariants, and the new evidence. Widen the review when changed
   authority requires it. Ask: "Identify the three most plausible defects or invariant violations
   in this diff."
10. Merge only when separately authorized.
11. Retire the local branch only by the safe closeout in "Trunk and branches" above.
12. When a deployment artifact is required, prepare it under the existing provenance rules and
    obtain deployment authorization before deploying it. Required independent technical acceptance
    precedes UAT deployment.
13. When Founder UAT is required, run it against the exact candidate under AGENTS provenance rules.
    Only the Founder gives that verdict. Reconcile applicable canonical records and run
    `npm run project:consistency` before advancing.

`STORY_COMPLETE != IMP_ACCEPTED`. Implementation complete does not mean accepted. Independent
technical acceptance and required Founder UAT remain separate gates. An implementation agent must
not declare the Founder's verdict. Record `FOUNDER_UAT_REQUIRED = YES | NO` with a rationale.

For a defect correction where an observable regression test is practical, preserve red-green
evidence: the test fails before the correction and passes after it. Do not invent red-green
evidence for documentation, formatting, or a change with no meaningful pre-fix test.

## Hygiene

Prefer non-destructive cleanup. Fast-forward `main`. Delete a local branch only with
`git branch -d` after the proof above. Leave uncertain or unique work in place. Delivery health
stays on the existing project and on CI. This standard does not add a second health system.

Promotion gates stay independent, and [`AGENTS.md`](../../../AGENTS.md) governs which of them a
task has already authorized. A local commit does not by itself authorize push or a pull request.
An authorized `PUBLISH_PR` task already includes the scoped commit, push, and pull request. It
does not authorize merge, a tag, a release, or a deployment. Merge does not replace required
Founder UAT. A PD-2 phase transition does not grant push, pull request, merge, or deployment
authority.
