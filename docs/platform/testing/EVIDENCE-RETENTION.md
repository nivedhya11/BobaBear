# Repository weight and evidence retention (HYG-05)

```text
STATUS: SUPPORTING OPERATING POLICY
Authority parents:
  AGENTS.md (protected evidence / no destructive volume ops)
  docs/platform/TESTING.md (TEST-1 — how behaviour is proven)
  docs/platform/testing/CI-JOB-CONTRACT.md (artifact paths)
NOT acceptance authority. NOT Product Definition. NOT license to delete.
HYG-05_SOURCE_MAIN = 6e344d9fea0b03a36dccffbfce75d09f8bfd9923
```

This document records the HYG-05 audit conclusions and durable retention rules for
repository weight. It does **not** authorize deletion of migration metadata, product
assets, legal/compliance material, governance history, or currently tracked protected
evidence.

## 1. Measured tracked weight (SOURCE_MAIN)

Exact candidate: `6e344d9fea0b03a36dccffbfce75d09f8bfd9923` (merge of PR #370).

| Domain | Tracked size | Files | Share |
|---|---:|---:|---:|
| `drizzle/` | 26.62 MB | 102 | 34.7% |
| `public/` | 17.97 MB | 100 | 23.4% |
| `src/` | 8.34 MB | 1134 | 10.9% |
| `docs/` | 7.73 MB | 189 | 10.1% |
| `scripts/` | 6.84 MB | 274 | 8.9% |
| `tests/` | 4.67 MB | 317 | 6.1% |
| `archive/` | 3.50 MB | 92 | 4.6% |
| tracked `test-results*` | 0.09 MB | 3 | 0.1% |
| other generated | ~0 MB | 2 | ~0% |
| other (lockfile, config, data, …) | 0.93 MB | 83 | 1.2% |
| **TOTAL tracked tree** | **76.70 MB** | **2296** | 100% |

Supporting observation (non-authoritative for retention): local `.git` pack ≈ 83 MB;
working tree excluding `node_modules`/`.git`/`.next` ≈ 414 MB on the audit host.

## 2. Classification vocabulary

| Class | Meaning |
|---|---|
| `CANONICAL_EVIDENCE` | Required to prove accepted product/governance reality; keep in Git |
| `TEMPORARY_TEST_OUTPUT` | Regenerable Playwright/CI dumps; ignore locally; upload as Actions artifacts |
| `ACCIDENTALLY_TRACKED` | Should never have been committed; disposition requires explicit human decision |
| `HISTORICAL_DEBUG_ARTIFACT` | Failure/debug capture retained for provenance; not fresh acceptance proof |

Recommendation classes used below: `DO_NOW_SAFE` | `DO_LATER` | `NEVER_PRUNE` |
`REQUIRES_MIGRATION` | `REQUIRES_EXTERNAL_STORAGE`.

## 3. Tracked customer-ordering evidence

Currently tracked (do **not** remove under HYG-05):

```text
test-results-customer-ordering/.last-run.json
test-results-customer-ordering/imp026-real-checkout-real--bd073-ckout-loads-with-test-order-desktop-chromium/error-context.md
test-results-customer-ordering/imp026-real-checkout-real--bd073-ckout-loads-with-test-order-desktop-chromium/test-failed-1.png
```

| Field | Value |
|---|---|
| Classification | `HISTORICAL_DEBUG_ARTIFACT` |
| Why not `CANONICAL_EVIDENCE` | Content is an IMP-026 Playwright **failure** (OTP fill timeout), not a passing acceptance proof |
| Why not `TEMPORARY_TEST_OUTPUT` | Files are frozen, inventoried, and named by `AGENTS.md` / BASELINE as protected |
| Why not `ACCIDENTALLY_TRACKED` | Present since early platform commits; listed in `test-inventory.json` `protectedEvidenceTrackedFiles`; CI contract says preserve |
| Disposition | Keep tracked until a separate human evidence-disposition decision; never `git rm` in hygiene passes |

Live Playwright dumps must **not** use this protected prefix as `outputDir` (Playwright
cleans `outputDir` at start and would destroy the tracked triad). The live config writes to
`test-results-customer-ordering-runtime/` (`TEMPORARY_TEST_OUTPUT`, gitignored). GitHub Actions
uploads that runtime path from `nightly-verification.yml`. Those Actions artifacts are
**time-limited** and are not a durable evidence store by themselves.

## 4. What belongs where

| Evidence kind | Git (live tree) | GitHub Actions artifacts | Local ignored path |
|---|---|---|---|
| Locked SQL migrations + Drizzle meta snapshots | Yes (`NEVER_PRUNE`) | N/A | N/A |
| CURRENT governance / Product Definitions / ADRs | Yes | Optional review packs | N/A |
| Exact prior ROADMAP/STATE snapshots under `docs/platform/history/` | Yes (historical supporting) | N/A | N/A |
| Design archive under `archive/` | Yes until archive-retirement decision | N/A | N/A |
| Protected historical triad above | Yes until disposition | N/A | N/A |
| Fresh Playwright failure dumps / traces / videos | No | Yes (job upload; **time-limited**) | Yes (`test-results-customer-ordering-runtime/`, other `test-results*` / `playwright-report*`) |
| Coverage, `.next`, `blob-report` | No | Only if a job needs them | Yes |
| Large product media at scale | Prefer optimized Git assets until threshold; then object storage/CDN | N/A | N/A |

### Retention duration (operating defaults)

| Store | Default retention | Notes |
|---|---|---|
| Git live tree | Indefinite for `NEVER_PRUNE` / protected historical triad | History rewrite forbidden under HYG-05 |
| GitHub Actions artifacts | **Time-limited** (platform default, typically 90 days, unless workflow sets `retention-days`) | Not durable beyond expiry; prefer explicit `retention-days` on expensive browser jobs (`DO_LATER`) |
| Local ignored evidence | Operator-owned; delete anytime | Must not be required for formal acceptance without promotion to a durable store |

### Naming / manifest strategy

```text
PROTECTED_PREFIXES =
  test-results-customer-ordering/          # historical triad only; NOT Playwright outputDir
  test-results-location-selector-layout/

LIVE_CUSTOMER_ORDERING_OUTPUT_DIR =
  test-results-customer-ordering-runtime/  # gitignored; cleaned by Playwright; Actions upload

TRACKED_PROTECTED_MANIFEST = scripts/testing-inventory.mjs → protectedEvidenceTrackedFiles
NEW_PROTECTED_GIT_EVIDENCE = REQUIRES human disposition (not routine commits)
CI_ARTIFACT_NAME_PATTERN = nightly-e2e-<suite> (see nightly-verification.yml)
```

### Durable evidence retention (binding operating rule)

```text
ACTIONS_ARTIFACTS_ARE_TIME_LIMITED = YES
ACTIONS_RUN_URL_ALONE_IS_NOT_DURABLE_EVIDENCE = YES
EVIDENCE_BEYOND_ACTIONS_EXPIRY = MUST_PROMOTE_TO_DURABLE_STORE
```

Do not grow the tracked protected set by routinely committing new PNG/MD dumps. A GitHub Actions
**run URL alone is not durable evidence**: linked artifacts expire with the Actions retention
window. Evidence that must be retained beyond Actions expiry **must** be promoted to either:

1. a durable canonical repository evidence location (after explicit human disposition — for
   example a named handoff under `docs/platform/handoffs/` that embeds or attaches the needed
   screenshots/traces/videos, or another CURRENT-approved evidence path), or
2. another explicitly approved durable store (`REQUIRES_EXTERNAL_STORAGE` when binaries should
   not live in Git).

Promotion is required before relying on that evidence past Actions expiry. Recording only a
run URL (without promoting the underlying artifacts) does **not** satisfy retention.

## 5. Drizzle retention

| Fact | Value |
|---|---|
| SQL migrations | 50 files ≈ 0.52 MB — required apply history |
| Meta snapshots | 50 × `drizzle/meta/NNNN_snapshot.json` ≈ 26.10 MB + `_journal.json` |
| Tooling requirement | Drizzle Kit generate/migrate journal + per-migration snapshots are part of the committed migration kit workflow used by this repo |
| Latest snapshot | `0049_snapshot.json` ≈ 0.87 MB |
| Recent growth | Last-10 average snapshot delta ≈ +12 KiB/migration; linear fit on last 20 ≈ +11.7 KiB/index |

**Recommendation:** `NEVER_PRUNE` live-tree Drizzle SQL and meta under current tooling.
Pruning historical `*_snapshot.json` without a proven alternate Drizzle storage strategy is
**unsafe** (`REQUIRES_MIGRATION` of migration-meta strategy, out of HYG-05 authority).

Projected +50 migrations (keep all snapshots): ≈ **+57 MB** meta + ≈ **+0.5 MB** SQL ≈ **+58 MB**.

## 6. Public / product assets

| Finding | Detail | Class |
|---|---|---|
| Hero video | `public/assets/video/hero-featured.mp4` ≈ 3.92 MB — largest single tracked file | Keep for now; `REQUIRES_EXTERNAL_STORAGE` when media library grows |
| Favicon duplicate | Identical blob at `public/Boba_Bear_Avatar_favicon.jpeg` and `public/assets/logos/boba-bear-favicon.jpeg` (≈ 265 KiB × 2) | `DO_LATER` dedupe after reference audit — **no deletion in HYG-05** |
| Oversized rasters | 28 public rasters > 200 KiB (menu/merch mostly 200–322 KiB) | `DO_LATER` optimize (WebP/AVIF, resize) without changing product meaning |
| Duplicate content groups | 1 identical-content pair (favicon only) at audit time | Low urgency |
| Git LFS | Not authorized under HYG-05 | `REQUIRES_MIGRATION` if ever adopted |

CDN/object-storage becomes justified when (any): hero/media set exceeds ~25 MB tracked, or
asset update cadence makes Git diffs painful, or multiple environments need independent media
promotion. Until then, optimize-in-place is preferred over topology change.

## 7. Documentation / history / archive

| Tree | Role | Confusion control | Class |
|---|---|---|---|
| `docs/platform/*.md` CURRENT set | Authority | Indexed in `docs/platform/README.md` | `NEVER_PRUNE` |
| `docs/platform/history/` | Exact prior ROADMAP/STATE bytes | `history/README.md` states HISTORICAL SUPPORTING EVIDENCE | Keep in live tree (`NEVER_PRUNE` for named snapshots) |
| `docs/platform/experience/assets/*` | Design-lock screenshots (e.g. IMP-028D PNG ≈ 1.62 MB) | Supporting experience evidence | Keep; `DO_LATER` compress if needed |
| `archive/design-history/` | Non-canonical design reference | `archive/design-history/README.md` STATUS HISTORICAL | Keep until archive-retirement decision; optional future move to history-only via deletion **after** decision (`DO_LATER`, not HYG-05) |

Old generated projections such as `docs/platform/governance/current-context.json` remain
non-authoritative when present; do not treat them as retention substitutes for CURRENT
authorities.

## 8. Projected 12-month growth (additive, tracked live tree)

Assumptions are labeled; do not treat as budgets.

| Driver | Assumption | Projected added tracked size |
|---|---|---|
| +50 migrations | Keep all Drizzle snapshots; ~current growth curve | ≈ **+58 MB** |
| +100 product assets | ≈ current public mean ~184 KiB/file, unoptimized | ≈ **+18 MB** (≈ **+8–12 MB** if optimized) |
| +20 IMPs | Product Definition + capability arch + tests/docs (~0.75–1.25 MB/IMP) | ≈ **+15–25 MB** |
| 12 months browser evidence | Ephemeral → Actions artifacts only; no new Git dumps | ≈ **+0 MB** tracked (Actions storage separate) |
| **Combined (unoptimized assets)** | | ≈ **+91–101 MB** tracked |
| **Combined (optimized assets + artifact discipline)** | | ≈ **+81–95 MB** tracked |

Without artifact discipline, nightly browser dumps committed to Git could add tens to hundreds
of MB/year and must be treated as a process failure.

## 9. Recommendations by class

### DO_NOW_SAFE (authorized under HYG-05)

- Publish this retention policy.
- Ignore ephemeral Playwright outputs that are not part of the protected tracked triad
  (including `test-results-location-selector-layout/` and additional report dirs) via `.gitignore`.
- Point live customer-ordering `outputDir` at `test-results-customer-ordering-runtime/` (ignored)
  so Playwright cleanup cannot destroy the protected historical triad under
  `test-results-customer-ordering/`.
- Ignore **new** untracked files under `test-results-customer-ordering/` as belt-and-suspenders;
  currently tracked protected files remain tracked byte-for-byte.

### DO_LATER

- Deduplicate favicon paths after reference audit.
- Compress/convert oversized menu rasters; consider shorter hero video encode.
- Set explicit `retention-days` on expensive browser artifact uploads.
- Revisit `archive/design-history/` live-tree necessity after GTM.
- Split or slim `scripts/project-consistency.mjs` / `.test.mjs` (~3.4 MB combined) as an
  engineering maintainability task (not evidence deletion).

### NEVER_PRUNE

- `drizzle/**/*.sql`, `drizzle/meta/*_snapshot.json`, `drizzle/meta/_journal.json`
- CURRENT authorities and locked capability architectures
- `docs/platform/history/` exact snapshots named by its README
- Currently tracked protected customer-ordering triad (until human disposition)

### REQUIRES_MIGRATION

- Any Drizzle meta-storage strategy change (snapshot pruning, external meta store)
- Git LFS adoption
- Moving product media authority to object storage/CDN

### REQUIRES_EXTERNAL_STORAGE

- Future large video/image libraries beyond modest Git-sized marketing assets
- Long-lived browser traces/videos beyond Actions retention when still needed for dispute/audit

## 10. Explicit non-actions (HYG-05)

```text
NO_ASSET_DELETION = YES
NO_DRIZZLE_METADATA_DELETION = YES
NO_GIT_HISTORY_REWRITE = YES
NO_LFS_MIGRATION = YES
NO_REMOVAL_OF_TRACKED_PROTECTED_EVIDENCE = YES
MERGE_TO_MAIN = NO (task-controlled)
```
