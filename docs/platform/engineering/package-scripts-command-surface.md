---
Status: SUPPORTING ENGINEERING WORKFLOW
Authority: NONE — does not change product, architecture, decision, roadmap, or acceptance authority
Task: HYG-04 package script command-surface architecture audit
---

# Package script command surface (HYG-04)

`package.json` exposes a large npm script surface (~255 commands). This document records the
audit taxonomy, safe discoverability tooling, and a non-breaking migration plan.

```text
MASS_RENAME_AUTHORIZED = NO
SCRIPT_DELETION_AUTHORIZED = NO
SAFE_IMPROVEMENTS = documentation + inventory + help + alias existence tests
```

## Discoverability

| Command | Purpose |
|---|---|
| `npm run help` | Human-readable category listing + frozen public aliases |
| `npm run scripts:inventory` | Regenerate `package-scripts-inventory.json` |
| `npm run scripts:inventory:check` | Fail on inventory drift |

Generated machine inventory:

[`package-scripts-inventory.json`](./package-scripts-inventory.json)

## Proposed command taxonomy

Keep these category labels stable. New scripts should pick the best-fit bucket and prefer an
existing prefix over inventing a new root verb.

| Category | Prefix / pattern | Notes |
|---|---|---|
| BUILD | `build`, `*:build` | Compile/bundle only |
| DEV | `dev`, `test:watch`, local DX | Non-CI interactive |
| TEST_UNIT | `test`, `test:coverage`, `test:scripts`, non-DB vitest | Fast / no DB config |
| TEST_INTEGRATION | `test:<domain>` with DB vitest config | Domain suites |
| TEST_DATABASE | `test:database`, `test:database:*` | Explicit DB suite |
| TEST_E2E | `test:e2e*` | Playwright / browser |
| AUDIT | `audit:*`, `lint`, `typecheck`, `config:check*` | Static / boundary checks |
| GOVERNANCE | `governance:*`, `project:*`, `working-tree:*`, `testing:inventory*` | Canonical consistency |
| DATABASE | `db:*`, `auth:schema:*` | Local DB lifecycle |
| ENVIRONMENT | `env:*` (non-staging) | Local env tooling |
| STAGING | `env:staging:*`, `staging:*` | Founder staging |
| DOCKER | `docker:*`, `test:e2e:docker` | Compose/Podman wrappers |
| RECOVERY | `recovery`, `recovery:*`, `*:recover-*` | IMP-037 recovery + domain recover |
| BOOTSTRAP | `*:bootstrap*`, access grants used for seed | Mutating seed/setup |
| OPERATIONS | `check`, `verify*`, service `*:start`, workforce ops | Aggregators / runtime ops |
| ONE_OFF | `test:imp036*`, slice-specific bootstraps | Prefer not to grow |
| LEGACY_OR_ALIAS | exact duplicates / `npm run` shims | Keep while referenced |

## Target architecture recommendation

**Hybrid: enforce taxonomy on npm scripts now; thin npm aliases over dedicated CLIs where a CLI
already exists or a namespace is dense.**

Do **not** flatten everything into raw npm scripts forever, and do **not** mass-migrate in one PR.

Already CLI-backed (keep thin aliases):

- `npm run recovery -- …` → `scripts/recovery/cli.mjs`
- `npm run env:staging:*` → `scripts/environment/staging.mjs`
- `npm run env:compose` / `env:hygiene` → `scripts/environment/*`

Recommended future namespaces (add only with compatibility aliases):

```text
npm run help
npm run test -- …          # optional later dispatcher; keep existing test:* names
npm run db -- …            # optional later; keep db:* names
npm run env -- …           # extend environment CLI; keep env:* names
npm run governance -- …    # optional later; keep governance:* / project:* names
npm run recovery -- …      # already present
npm run docker -- …        # optional later; keep docker:* names
```

Rationale:

1. CI, docs, and Founder UAT already pin many exact `npm run <name>` strings.
2. Exact duplicate bodies are few; the scaling problem is **discoverability + naming density**, not
   duplicate implementation.
3. `recovery` / `env:staging` prove the thin-alias-over-CLI pattern works without breaking callers.

## Audit findings (summary)

See the generated JSON for per-script callers, duplicate groups, orphans, and mutating flags.

1. **Duplicated command bodies** — small set (exact body twins such as `config:check` =
   `config:check:web`, and `db:{config,down,status}` twinning `docker:{config,down,status}`).
2. **Naming inconsistencies** — `db:*` vs `docker:*` overlap for compose helpers; `test:<domain>`
   vs `test:database:<domain>`; `fd:signing` vs `financial-document:*`; slice-coded
   `test:imp036j:trancheN` one-offs.
3. **Valuable aliases** — `db:test`, `config:check`, `check`, `verify`, `verify:database`,
   `recovery` / `recovery:status`, governance/fingerprint entrypoints.
4. **Deprecatable later (not now)** — exact body twins once docs/CI move to the canonical name;
   `db:config|down|status` once docs standardize on `docker:*` (or the reverse).
5. **CLI namespace candidates** — `test`, `db`, `env`, `governance`, `docker`, `audit` (audit may
   remain flat).
6. **High-risk / mutating** — `db:reset`, `db:migrate`, `docker:migrate`, `env:staging:deploy`,
   `env:staging:recover-postgres`, `recovery:backup:*`, `*:bootstrap*`, `workforce:user:*`,
   `menu:import-existing`, domain `*:recover-missing*`. Prefer explicit verbs + confirmation inside
   CLIs (as recovery/staging already do); do not silently rename.
7. **Internal-only** — scripts referenced only from other package scripts (for example leaves under
   `check` / `docker:verify`). Safe to leave; optional later hiding behind parent-only docs.
8. **Orphans** — scripts with no workflow/doc/package-script/`scripts/` reference at inventory time.
   Many are still intentional operator/DX entrypoints; orphan ≠ delete.
9. **Documentation gaps** — no prior package-script taxonomy map; README/CI-JOB-CONTRACT cover
   subsets only. This doc + `npm run help` close the gap without renaming.

## Safe non-breaking improvements (this change)

- Generated inventory JSON + check mode
- `npm run help`
- Tests freezing documented public/stable aliases

## Migration plan (future, separate authority)

| Phase | Action | Breakage |
|---|---|---|
| 0 (done) | Inventory + help + alias freeze tests | None |
| 1 | Document canonical name per duplicate twin; leave aliases | None |
| 2 | Extend `env` / `recovery` CLIs; add `db`/`governance` CLIs behind aliases | None while aliases remain |
| 3 | Optionally mark deprecated aliases in help text | None |
| 4 | Only with explicit authority: remove unused orphans after caller proof | Requires separate task |

```text
NO_SCRIPT_RENAME_IN_HYG04 = YES
NO_SCRIPT_DELETION_IN_HYG04 = YES
```
