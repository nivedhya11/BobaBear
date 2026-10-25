---
Status: SUPPORTING ENGINEERING STANDARD
Standard: RHS-1
Authority: NONE — does not change product, architecture, decision, roadmap, lifecycle, security, payment, or agent-governance authority
---

# Repository conventions (RHS-1)

This standard tells engineers and Cursor agents how to name, place, retire, and check repository
artifacts. [`AGENTS.md`](../../../AGENTS.md) remains the sole agent operating contract. On conflict
with `AGENTS.md`, [`VISION.md`](../VISION.md), [`ROADMAP.md`](../ROADMAP.md), [`STATE.md`](../STATE.md),
[`ARCHITECTURE.md`](../ARCHITECTURE.md), [`decision-register.md`](../decision-register.md), or
[`TESTING.md`](../TESTING.md), those authorities win.

RHS-1 does not accept an IMP, activate a slice, or authorize mass cleanup. Existing violations stay
until a separately authorized change renames or retires them.

```text
RHS_1_AUTHORITY = SUPPORTING_ENGINEERING_STANDARD
AGENTS_REMAINS_SOLE_AGENT_CONTRACT = YES
MASS_RENAME_AUTHORIZED_BY_THIS_STANDARD = NO
AGE_AUTHORIZES_DELETION = NO
```

## 1. Naming

Use a semantic name that describes the functionality. Keep IMP, ADR, sprint, tranche, issue, task,
and date identifiers in trace metadata (commit message, document header, test title, or governance
path) when they are not themselves the canonical identity.

### Identifiers

- React components: PascalCase.
- Classes, types, and interfaces: PascalCase.
- Variables and functions: camelCase.
- True module-wide constants: `UPPER_SNAKE_CASE` where that is already the local style.
- Internal module filenames: kebab-case.
- React component filenames: PascalCase `.tsx` under `src/components` or colocated in `src/app`.
- Component hook filenames: `useThing.ts` or `useThing.tsx` under those same UI trees.
- Directories: kebab-case, except framework-reserved and canonical governance segments below.
- Scripts: kebab-case.
- Supporting Markdown: descriptive kebab-case.
- Unit tests: `<behavior-or-module>.test.ts` or `.test.tsx`.
- Integration tests: `<behavior-or-module>.integration.test.ts` (`.integration.test.tsx` for UI).
- Browser journeys: `tests/e2e/<journey>.spec.ts`.
- Node script tests discovered by `npm run test:scripts`: `scripts/**/<behavior>.test.mjs` or `.integration.test.mjs`.
- Established test stems may be kebab-case, PascalCase, or dot-separated module segments (`cli.credentials.test.mjs`, `CheckoutClient.destination.test.tsx`).

Test titles must state the expected behavior, for example
`it("hides a curated product after it is added from the main menu")`.

Do not introduce a filename or exported identifier whose primary name is an IMP id, sprint or
tranche number, temporary agent name, issue number, task-batch id, calendar date, or a vague
qualifier (`temp`, `tmp`, `misc`, `new`, `old`, `final`, `latest`, `fix2`, `wip`).
Domain words such as `backup` and wording modules such as `serviceability-copy` are not vague
qualifiers. A filename that is only a duplicate marker is still a review item.

Filename patterns do not prove that a name is meaningful. Review still has to read the name.

Identifier casing is not a new ESLint `naming-convention` error. The repository does not enable
that rule, and turning it on as an error would fail grandfathered code. Use the existing ESLint
and TypeScript checks. Semantic quality of new identifiers stays a review obligation.

### Naming exceptions

These are narrow. They are not permission to invent a new IMP-named module.

| Exception | Why it is allowed |
|---|---|
| Canonical governance identity | `docs/platform/product/IMP-*`, `docs/platform/capabilities/IMP-*.md`, `docs/platform/decisions/ADR-*.md`, `docs/platform/operations/`, `docs/platform/governance/` |
| Immutable migration identity | `drizzle/NNNN_description.sql` and `drizzle/meta/NNNN_snapshot.json` |
| Framework-reserved files | `src/app` route and metadata files (`page`, `layout`, `route`, `forbidden`, `unauthorized`, `icon`, `apple-icon`, `opengraph-image`, `twitter-image`, and the other Next.js reserved names, including image extensions), `src/instrumentation.ts`, `src/instrumentation-client.ts`, `src/middleware.ts`, `src/proxy.ts`, route groups `(name)`, private segments `_components`, parallel slots `@slot`, dynamic segments `[param]` |
| Experience programme documents | `docs/platform/experience/**` may keep canonical `IMP-*` document and asset names |
| Historical snapshots and archives | `docs/platform/history/**`, `archive/**` (except `archive/src/**`, which is forbidden) |
| Established script fixtures | `scripts/fixtures/**`, `scripts/governance-v2/fixtures/**` |
| Protected evidence prefix | Existing files under `test-results-customer-ordering/`. Do not add new ones. |
| Script test suffix | `*.test.mjs` under `scripts/` because `npm run test:scripts` discovers that suffix |
| Reserved root and tool names | `README.md`, `AGENTS.md`, `CLAUDE.md`, `Dockerfile`, `CNAME`, `LICENSE`, `SKILL.md`, `INDEX.md`, `pull_request_template.md`, and the current canonical files already at `docs/platform/` root |
| Established asset names | `public/**` may keep the current descriptive asset filenames. `archive/**` may keep historical asset and directory names. Neither exception allows `archive/src/` |

## 2. Placement

Documented layering matches the repository. It is not a new architecture.

| Location | What belongs there |
|---|---|
| `src/app` | Framework routes and colocated route UI |
| `src/components/<feature>` | React UI |
| `src/lib/<feature>` | Client and domain adapters |
| `src/server/<domain>` | Server-owned domain operations |
| `src/shared/<domain>` | Contracts and shared domain definitions |
| `src/platform` | Infrastructure and platform boundaries |
| `src/data`, `src/types` | Established data and shared type locations |
| `tests/<feature>` | Cross-layer and integration proof |
| `tests/e2e` | Browser journeys |
| `scripts/<domain>` or established `scripts/*.mjs` entrypoints | Operational and verification scripts |
| `docs/platform` | Canonical platform authority and its existing subtrees |
| `docs/platform/product/IMP-*` | Governed Product and Experience documents |
| `docs/platform/discovery/<feature>` | Non-authoritative candidates |
| `docs/platform/engineering` | Supporting engineering documentation, including this standard |
| `docs/platform/history` | Protected historical authority |
| `docs/uat` | Established UAT evidence notes |
| `archive/` | Expressly historical, non-authoritative material |
| `drizzle/` | Migration history and required Drizzle metadata |

Other existing roots (`public`, `data`, `docker`, `.github`, `artifacts`, `figma-sync`) stay
available for their current roles. Do not add a new top-level directory.

Place a new file next to the module or feature it serves. Do not move accepted source, and do not
add an abstraction, only to make the tree look symmetrical.

`src/app` is for reserved route files, colocated PascalCase UI, and colocated styles. Domain logic
goes under `src/server`, `src/lib`, or `src/shared`.

Browser specs go in `tests/e2e`. Node script tests go under `scripts/`.

## 3. Retirement, archival, and deletion

Artifact states for executable and operational material:

`ACTIVE → DEPRECATED → RETIRED`

For historical documentation, `ARCHIVED` may sit between current and retired as a
non-authoritative state. `ARCHIVED` does not create a second current authority.

A retirement record must identify:

- artifact path and functional owner
- retirement reason
- replacement, if one exists
- known callers and dependencies
- historical source commit or pull request
- protected-evidence or retention classification
- validation results
- reviewer and authorization
- the condition that makes deletion safe

Suggested review triggers, not deletion rules:

- 30 days after deprecation: review whether callers are gone
- 90 days after archival: review whether the archive should stay, move outside Git, or be deleted

Deletion requires evidence and the appropriate authority. Age is not enough. Do not rewrite Git
history as ordinary cleanup.

### Source

Retire source in a governed commit after caller and compatibility proof. Git history is the
default archive for executable code. Do not copy a retired implementation into an importable
`archive/src/` tree.

### Tests

Keep tests that protect current or accepted behavior. Retire a test only when its obligation is
obsolete or equivalent coverage exists. Do not delete a failing test to make CI green.

### Scripts

Find direct and indirect callers in npm scripts, CI, runbooks, and operator procedures. Keep a
stable public command as a compatibility alias during migration. Delete a script only after
deprecation and verified caller removal.

Open HYG-04 work (PR #375, unmerged) uses the same `audit:*` command namespace and the same
no-deletion posture for duplicate scripts. RHS-1 does not merge that PR. `npm run audit:repo-hygiene`
belongs to that `audit:*` namespace.

### Documentation

Keep current authority in its canonical location. Move superseded, non-authoritative reference
material to a clearly marked historical location only when that move helps readers. Do not
duplicate a second current document. Do not rewrite immutable snapshots under
`docs/platform/history/`.

### Evidence, migrations, and secrets

Do not prune these in a hygiene pass:

- `drizzle/**` SQL migrations and snapshots. A new migration may update `drizzle/meta/_journal.json` and `drizzle/migration-integrity.json` in place. Deleting or renaming those metadata files is not allowed.
- `docs/platform/history/**`
- current canonical authorities and locked product, capability, and decision records
- the tracked protected evidence under `test-results-customer-ordering/`
- the reserved prefix `test-results-location-selector-layout/`

Generated test output (`coverage/`, `test-results*/`, `playwright-report*/`, `.next/`, `dist-*/`)
stays ignored locally or is retained as a CI artifact. A time-limited CI artifact URL is not the
sole long-term evidence store. Promote evidence that must outlive the artifact before it expires.

Open HYG-05 work (PR #374, unmerged) classifies repository weight as `NEVER_PRUNE`,
`HISTORICAL_DEBUG_ARTIFACT`, `TEMPORARY_TEST_OUTPUT`, `CANONICAL_EVIDENCE`, `DO_LATER`,
`REQUIRES_MIGRATION`, and `REQUIRES_EXTERNAL_STORAGE`. RHS-1 does not merge that PR. Those classes
map onto this section as retention labels. They do not authorize automatic deletion. In particular,
a 90-day review must not delete `NEVER_PRUNE` Git trees.

Never commit secrets or sensitive personal information as a cleanup workaround.

## 4. Repository-health review

Check these before finishing a change. The checker enforces the mechanical rows. The others are
review obligations because a filename pattern cannot decide them safely.

| # | Obligation | Enforcement |
|---|---|---|
| 1 | No unnecessary duplicate utility or module | Review |
| 2 | No new unowned or orphan file | Review, plus placement rules for new paths |
| 3 | No unsupported folder | Checker placement rules for added, renamed, and copied paths |
| 4 | No unexpected generated file committed | Checker protected-path rule |
| 5 | No undocumented API or persistence contract change | Review against the owning canonical document |
| 6 | No permanently skipped meaningful test without an issue and rationale | Review. Do not delete the test to go green |
| 7 | No new untracked `TODO` / `FIXME` debt without an owner | Review |
| 8 | No unnecessary new dependency | Review |
| 9 | No unreviewed large binary asset | Review. The checker does not impose a size cutoff that would split a coherent module |
| 10 | No broken import, test, script, or document reference after a move | Run the relevant tests and searches after the move |
| 11 | No edit to an immutable migration or historical snapshot | Checker protected-path rule |
| 12 | No destructive cleanup of another agent's workspace | Do not touch occupied worktrees |

Large files are a maintainability review item. Do not fragment a coherent module to satisfy an
invented line limit.

## 5. Checker and CI

Run:

```text
npm run audit:repo-hygiene
```

The command is `node scripts/repository/check-repository-conventions.mjs`. The Quality job runs it
with `REPO_HYGIENE_BASE` set to the pull-request base (or the previous push commit on `main`) and
`REPO_HYGIENE_HEAD` set to the pull-request head. The Quality checkout already uses full history.
If that base or head is missing, shallow, the all-zero push sentinel, or has no merge base, the
command exits 2. It does not pass by assuming every path is grandfathered or every path is new.

| Exit | Meaning |
|---|---|
| 0 | No strict violations. Grandfathered findings may still be printed |
| 1 | At least one added, renamed, copied, or protected-path violation |
| 2 | Comparison provenance is unusable |

Failure lines name the code, path, rule, and remediation:

- `REPO_HYGIENE_NAMING_VIOLATION`
- `REPO_HYGIENE_PLACEMENT_VIOLATION`
- `REPO_HYGIENE_PROTECTED_PATH`
- `REPO_HYGIENE_BASELINE_UNAVAILABLE`

`REPO_HYGIENE_BASELINE` lines are backlog. They do not fail the command. Do not mass-rename that
backlog inside an unrelated change.

The checker does not replace Security SDLC, CodeQL, lint, typecheck, project consistency, or the
testing inventory.

## 6. Agent obligations

Before creating, moving, renaming, archiving, or removing an artifact:

1. Check the proposed name and destination against this standard.
2. Run `npm run audit:repo-hygiene` after the relevant edits.
3. Verify references still resolve after a move or rename.
4. Write the retirement record in section 3 before deleting anything.
5. Include the checker result in the normal delivery report from
   [`.cursor/skills/boba-delivery-reporting/SKILL.md`](../../../.cursor/skills/boba-delivery-reporting/SKILL.md).

This standard adds no separate approval ceremony. R1 and R2 work stays autonomous when the
governing contract is already clear.

## 7. What this standard does not do

- It does not mass-rename legacy files.
- It does not delete code, tests, scripts, documents, migrations, or evidence.
- It does not rewrite historical governance.
- It does not change application behavior.
- It does not merge HYG-01, HYG-04, or HYG-05.
- It does not advance IMP-036J or IMP-036K.
