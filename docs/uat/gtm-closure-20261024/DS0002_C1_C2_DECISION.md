# DS-0002 C1 vs C2 decision package (2026-10-24)

Wave: `BOBA-CORE-GTM-UAT-PREPARATION-20261024` (GitHub issue nivedhya11/BobaBear#443).
Agent C. This file is decision evidence. It does not select a production architecture and it does not change the production PostgreSQL image.

```text
BASE_SHA = a6155378b799e06a95b28c593ac1a340d7ca9245
WORKTREE = /home/ajoshi/repos/boba-bear-uat-c-pg
BRANCH = proof/uat-prep-ds0002-c1c2-20261024
REUSED_C1_PROOF = https://github.com/nivedhya11/BobaBear/pull/431
REUSED_C1_PROOF_TIP = b8171c6f2a5134a8923bdf55dd5a06ed32af3229
REUSED_C1_WORKTREE = /home/ajoshi/repos/boba-bear-wave-b-pg (read only)
PRODUCTION_DOCKERFILE = docker/postgres/Dockerfile (USER root; not modified)
PRODUCTION_C1_C2_SELECTION = NOT_GRANTED
PREFERRED_OPTION = C1_PURE_NONROOT_RUNTIME
SELECTION_STATUS = NOT_SELECTED
PRODUCTION_TRIVY_PASS = NOT_ESTABLISHED
POSTGRES_PERSISTENT_VOLUME_MIGRATION = NO
SECURITY_VEX_RENEWAL_OR_BYPASS = NO
DOCKER_ENGINE_PROOF = UNVERIFIED
S3_LIVE_SPACES_PROOF = UNVERIFIED
```

## Alignment gate (recorded before this file was added)

```text
ALIGNMENT_GATE

Repository Authority: VERIFIED
Repository / Branch / HEAD: /home/ajoshi/repos/boba-bear-uat-c-pg | proof/uat-prep-ds0002-c1c2-20261024 | a6155378b799e06a95b28c593ac1a340d7ca9245 (origin/main)
Vision Version: VISION-1
Roadmap Version: GTM-R190
State Version: STATE-R189
Architecture Version: ARCH-R23
Decision Register Version: DR-25
Product Delivery Version: PD-2
Product Definition: N/A — security release-blocker decision package, not an IMP-036J story
Stories: N/A
Acceptance Scenarios: N/A
Golden Journeys: N/A
Testing Policy: TEST-1
Accepted Through: IMP-036I
Current Product Slice: IMP-036J (pending acceptance; unchanged)
Task Slice: DS-0002 C1 vs C2 decision package
Task Capability: IMP-038 container-image gate disposition evidence; IMP-037 Layer 1 recovery compatibility evidence
Relevant Non-Goals: no managed PostgreSQL; no production cutover; no VEX renewal; no persistent-volume migration
Relevant ARCH-G Invariants: ARCH-G13 (PostgreSQL is authoritative state); ARCH-G26 (pilot production = Docker Engine + Compose, self-hosted PostgreSQL 18; Podman is not the production runtime)
Relevant Binding Decisions: D-374 / ADR-016
Task Assumptions: PR #431 Podman proof is reused and not re-executed; Docker Engine is attempted only if the docker CLI is present; live Spaces credentials are not used
Deferred Capabilities Touched: production postgres image cutover; existing-volume ownership migration; live Spaces restore drill; six-image production Trivy pass
Semantic Scope: MAY MODIFY this decision markdown only. MUST NOT MODIFY docker/postgres/Dockerfile, compose files, .trivyignore, the vulnerability-exception register, live volumes, or the PR #431 worktree. EXPLICITLY OUT OF SCOPE: selecting C1 or C2, merging, restarting boba-staging, destroying boba-bear_postgres-data.
Conflicts: NONE
Unverified Material Facts: Docker Engine disposable behaviour; live DigitalOcean Spaces archive-push/restore; ownership of the existing persistent volume; the six production-image Trivy scans
Risk Level: R2
DELIVERY_MODE: PUBLISH_PR (docs-only; no production image definition)
Gate Result: PASS
```

## 1. Why merged-main Security SDLC failed

CI run [40099285014](https://github.com/nivedhya11/BobaBear/actions/runs/40099285014) on `a6155378b799e06a95b28c593ac1a340d7ca9245` concluded **failure**. Job **Security SDLC** failed: [job 120887907613](https://github.com/nivedhya11/BobaBear/actions/runs/40099285014/job/120887907613). Every other job succeeded, except **Security HTTP gate**, which was skipped because that job runs only on pull requests.

The Trivy step `npm run audit:container` (`node scripts/run-trivy.mjs`) printed this and then exited 1:

```text
FAIL: Trivy exception policy errors (fail closed):
  - TRIVY_EXCEPTION_EXPIRED id=VEX-TRIVY-001 finding_id=DS-0002 expiry=2026-10-23 today=2026-10-24 (fail closed; do not silently suppress)
BLOCKED_BY_EXCEPTION_AUTHORITY: renewing VEX-TRIVY-* requires explicit Founder/authority approval; do not extend expiry in this gate.
##[error]Process completed with exit code 1.
```

That line is produced in `enforceTrivyExceptionPolicy` when the register expiry is no longer active:

```452:456:scripts/run-trivy.mjs
    if (!isActiveExpiry(todayIso, row.expiry)) {
      errors.push(
        `TRIVY_EXCEPTION_EXPIRED id=${row.id} finding_id=${entry.id} expiry=${row.expiry} today=${todayIso} (fail closed; do not silently suppress)`,
      );
      continue;
```

`main()` loads that policy and exits **before** image builds or `trivy image` scans:

```857:881:scripts/run-trivy.mjs
async function main() {
  const policy = loadTrivyExceptionPolicy();
  if (policy.errors.length > 0) {
    console.error("FAIL: Trivy exception policy errors (fail closed):");
    for (const err of policy.errors) {
      console.error(`  - ${err}`);
    }
    const expired = policy.errors.some((e) => e.startsWith("TRIVY_EXCEPTION_EXPIRED"));
    if (expired) {
      console.error(
        "BLOCKED_BY_EXCEPTION_AUTHORITY: renewing VEX-TRIVY-* requires explicit Founder/authority approval; do not extend expiry in this gate.",
      );
    }
    process.exit(1);
  }
  // ...
  console.log(
    `Trivy image gate v${TRIVY_VERSION} cli=${cli} targets=${targets.length} skip_build=${skipBuild} today=${policy.todayIso} image_config_scanners=misconfig`,
  );
```

The job log has no `Trivy image gate v0.69.3` line and no `PASS: trivy image scan` / `FAIL: trivy image scan` line. The six production targets in `PRODUCTION_IMAGE_TARGETS` were not built and were not scanned:

| id | image |
|---|---|
| web-runtime | `boba-bear-app:trivy` |
| customer-auth-runtime | `boba-bear-customer-auth:trivy` |
| workforce-auth-runtime | `boba-bear-workforce-auth:trivy` |
| customer-commerce-runtime | `boba-bear-customer-commerce:trivy` |
| operations-runtime | `boba-bear-operations:trivy` |
| postgres | `boba-bear-postgres:trivy` |

This failure is the exception gate aborting. It is not an unsuppressed production-image scan that found DS-0002, and it is not a scan that cleared the other five images.

CodeQL on the same SHA succeeded: [run 40099284968](https://github.com/nivedhya11/BobaBear/actions/runs/40099284968) (`Analyze (javascript-typescript)`, conclusion success). That is SAST. It is not Trivy clearance.

`PRODUCTION_TRIVY_PASS` remains **NOT_ESTABLISHED**. `.trivyignore` and the exception expiry were not changed.

## 2. Reused PR #431 C1 proof (not re-run)

Source, read only:

- PR: https://github.com/nivedhya11/BobaBear/pull/431 (`proof/pg-c1-disposable-20261024`, open, tip `b8171c6f2a5134a8923bdf55dd5a06ed32af3229`)
- Report: `docs/platform/operations/evidence/pg-c1-disposable-engineering-proof-20261024.md` in `/home/ajoshi/repos/boba-bear-wave-b-pg`
- Committed Rev 2 matrix: `docs/platform/operations/evidence/pg-c1-disp-20261024T080543Z-144666/`
- Run id: `boba-pgc1-disp-20261024T080543Z-144666`

`scripts/proof/pg-c1-disposable-proof.sh` was **not** executed again. The whole disposable suite was not used as a substitute for this package.

What that proof already established, on **rootless Podman only**:

| Result | What was shown |
|---|---|
| 18 PASS | `Config.User=postgres`; DS-0002 absent on an unsuppressed image-config scan of `boba-bear-postgres:c1-nonroot` (pinned Trivy 0.69.3, `podman save` tar, no `.trivyignore`); fresh start as UID 999; rootless map container 999 → host 100998 (`subuid` `ajoshi:100000:65536`); restart on the same disposable volume; archive on; stanza-create and check; full backup, info, and verify; post-backup marker committed in segment `000000010000000000000004`; that exact segment archived as `…004-3901bb8a29263d0d9ab956e4984889e8c50dc40e.zst`; owned-target restore replayed it (`restored log file "…004"`) and contained both the pre-backup row and `post-backup-marker-<RUN_ID>`; interrupted archive of segment `…005` failed closed (`failed_count=6`); the legacy `archived_count > 0` check would have been a false PASS; the unarchived marker was absent after restore; a host-UID-1000 bind failed closed with the marker unchanged and no PGDATA created; `--user 0:0` refused; S3-shaped config rendered with synthetic values, secrets not written, missing credentials and identical Layer 1 / Layer 2 bucket fail closed |
| 2 UNVERIFIED | `docker_env` (docker CLI absent on that host); `s3_live_repo` (no live Spaces credentials; no S3 archive-push or restore) |
| 0 FAIL | No Rev 2 run produced a FAIL row |

The C1 prototype lives at `proof/pg-c1/Dockerfile.c1-nonroot` and `proof/pg-c1/entrypoint-wrapper.sh` on that branch. It is outside `docker/`. It does not replace `docker/postgres/Dockerfile`. No C2 initializer image was built.

The DS-0002-absent result is a scan of that disposable proof image. It is not the six-image production gate, and it does not clear `boba-bear-postgres:trivy` built from the production Dockerfile.

## 3. Docker Engine proof on this host

**UNVERIFIED.** No disposable Docker Engine steps were run.

First concrete error:

```text
$ type docker
bash: type: docker: not found
```

Also absent: `/var/run/docker.sock`, `/run/docker.sock`, and `/home/ajoshi/.docker/run/docker.sock`. The PATH entry `/mnt/c/Program Files/Docker/Docker/resources/bin` does not exist (`No such file or directory`). Podman is installed (`/usr/bin/podman`) and was not used as a stand-in. ARCH-G26 names Docker Engine as the pilot production runtime. A Podman PASS does not establish Docker Engine behaviour.

Live DigitalOcean Spaces stays **UNVERIFIED**. No live credentials were used. The reused proof’s S3 check was render-only, with synthetic placeholders and `--network=none`.

## 4. Current production image and volumes (this SHA)

`docker/postgres/Dockerfile` on `a6155378` ends image configuration as root. There is no later `USER postgres`.

```51:51:docker/postgres/Dockerfile
USER root
```

```123:124:docker/postgres/Dockerfile
ENTRYPOINT ["boba-postgres-entrypoint"]
CMD ["postgres"]
```

`docker/postgres/pgbackrest/entrypoint-wrapper.sh` does not refuse UID 0. When archive mode is on it renders pgBackRest config, `chown`s that file to `postgres:postgres`, and execs upstream `docker-entrypoint.sh`. The vulnerability register’s rationale is that the official entrypoint starts as root in order to drop privileges. Trivy DS-0002 reads image `Config.User`, so a later process drop does not clear the finding. This package did not re-scan that image.

`compose.yaml` service `postgres` sets no `user:`, so the image user applies. Mounts:

| Compose volume / source | Container path | Mode |
|---|---|---|
| `postgres-data` (project name `boba-bear` → `boba-bear_postgres-data`) | `/var/lib/postgresql` | read-write |
| `${BOBA_POSTGRES_INIT_DIR:-./docker/postgres/init}` | `/docker-entrypoint-initdb.d` | read-only |
| `${BOBA_PGBACKREST_REPO_DIR:-pgbackrest-repo}` | `/var/lib/pgbackrest` | read-write |

C1 proof PGDATA layout, for comparison: `/var/lib/postgresql/18/docker`, mount point `/var/lib/postgresql`. This package did not inspect or rewrite `boba-bear_postgres-data` or `pgbackrest-repo`. Their on-disk ownership is **UNVERIFIED**.

Rootless UID remap below is the Podman proof host only. It is not a Docker Engine or Droplet fact.

| Container UID | Rootless Podman host UID (proof host) |
|---|---|
| 999 (`postgres`, C1 `Config.User`) | 100998 |
| 0 (root; current production image user) | 1000 |

## 5. C1 vs C2

| Question | C1 pure non-root cutover | Bounded C2 existing-volume initializer |
|---|---|---|
| What it is | Final image `USER postgres`, `Config.User=postgres` (UID 999). Entrypoint refuses UID 0. No volume `chown`. No blanket `:U`. | A one-shot root initializer, not built in PR #431, whose only role would be to make an **already initialized** volume writable by UID 999, after which runtime would be the non-root image. |
| Where it is proven | Disposable empty/named Podman volumes. 18 PASS / 2 UNVERIFIED / 0 FAIL. | Not built. Not run. |
| DS-0002 | Absent on the proof image without `.trivyignore` or VEX renewal. | Would still require the final runtime image to be non-root. Not scanned, because no C2 image exists. |
| New volume | Sufficient. The proof started, restarted, backed up, archived a specific post-backup WAL segment, and restored that marker onto a separate owned volume. | Not required for a new volume. |
| Existing initialized volume | Not proven. C1 does not repair ownership. A host-owned bind (UID 1000) failed closed: exit 1, marker unchanged, no PGDATA created. Pointing C1 at `boba-bear_postgres-data` is not authorized and was not attempted. | This is the option that would rewrite ownership of an existing volume. `POSTGRES_PERSISTENT_VOLUME_MIGRATION = NO`. Not authorized. |
| `pgbackrest-repo` | The proof used a disposable repo the non-root user could write. The compose `pgbackrest-repo` volume was not checked. A non-root runtime also needs that path writable when archive mode is on. | Same hold: no ownership rewrite of the existing repo volume. |
| Docker Engine (ARCH-G26 production runtime) | UNVERIFIED on this host and on the #431 host. | UNVERIFIED. |
| Podman (local proof runtime) | PASS for the disposable matrix above. Not the production runtime. | Not exercised. |
| Repository S3 / pgBackRest | Render-only shape PASS with synthetic credentials: `repo1-type=s3`, path-style URI, cipher `aes-256-cbc`, secrets not written, missing credentials and same-bucket both fail closed. | Not exercised. |
| Live DigitalOcean Spaces | UNVERIFIED. No archive-push, archive-get, or restore against the live bucket. | UNVERIFIED. |
| Six production-image Trivy scans | Still not run. The gate aborts on expired `VEX-TRIVY-001` before scans start. Changing the production Dockerfile to `USER postgres` would itself be the C1 selection, which is not granted. | Would not by itself let the six scans run while the production image remains `USER root` and the exception stays expired. |
| Production Dockerfile | Left as `USER root` on this branch. | Left as `USER root` on this branch. |

### Existing persistent volume transition

Not performed. Requirements before any later human selection could touch it:

1. Inspect ownership of `boba-bear_postgres-data` and the pgBackRest repo volume on the **Docker Engine** host that actually runs them. Do not copy the Podman 999 → 100998 map onto that host.
2. If those trees are already writable by container UID 999, C1 can be considered for a later cutover proof. Writability is not known today.
3. If they are not writable by UID 999, pure C1 is expected to fail closed and leave the tree unmodified. That fail-closed behaviour is proven only for a disposable host-UID-1000 bind on Podman.
4. The alternative that matches the proven recovery shape is a **new** volume, restored from a verified backup, started as C1. That restore is proven only for a disposable posix repository on Podman. It is not proven for live Spaces.
5. In-place C2 ownership migration is the option that rewrites the existing volume. It needs its own Founder authorization. This package does not supply an initializer and does not describe commands to run against the live volume.

### Recovery requirements

These are gates for a future authorized cutover. They were not executed against staging or production.

1. A full backup plus the WAL segment that contains a committed post-backup marker must be restorable onto a **separate** owned volume. The restored database must contain that marker. `archived_count > 0` or “any file in the archive” is not enough: the reused proof showed `archived_count=5` while segment `…005` was still unarchived.
2. The recovery target must not be the live source PGDATA. The target runs with `archive_mode=off` so it does not push a new timeline into the source repository.
3. Live Spaces archive-push and restore must pass before production recovery is claimed. Synthetic render-only success does not do that.
4. The same disposable matrix must pass on Docker Engine before production-runtime recovery is claimed.
5. Keep the current `USER root` production image available so the untouched volume can still be started with the image that initialized it.
6. Do not delete `boba-bear_postgres-data`. Do not run `docker compose down --volumes`. Do not restart `boba-staging` as part of this decision.

### Rollback requirements

1. Rollback for “C1 was started and failed closed” is: stop that attempt and start the existing production image against the same untouched volume. Rely on that only after Docker Engine has shown the fail-closed property (volume unchanged, no new PGDATA). The Podman disposable bind showed it once. The live volume was not used.
2. Rollback for a future C2 ownership rewrite is not an in-place undo. It is restore from a backup taken **before** the rewrite, onto a replacement volume. No such backup was taken here, and the rewrite is not authorized.
3. Rollback must not be `compose down --volumes`.
4. Image rollback tag is the production image built from `docker/postgres/Dockerfile` at the SHA that was running, which on this base is `USER root`. This branch does not replace that file.

## 6. Recommendation

```text
PREFERRED_OPTION = C1_PURE_NONROOT_RUNTIME
SELECTION_STATUS = NOT_SELECTED
PRODUCTION_C1_C2_SELECTION = NOT_GRANTED
POSTGRES_C1_PRODUCTION_SELECTION = NOT_GRANTED
```

Prefer C1 for a future Founder choice. On disposable Podman volumes it satisfies Layer 1 backup, specific post-backup WAL archive, and restore of that marker, and DS-0002 is absent on that proof image without renewing `VEX-TRIVY-001`. C2 is unnecessary for a new volume and is the option that would rewrite an existing initialized volume.

That preference is **not a selection**. It does not authorize a production cutover, a Dockerfile change, an exception renewal, or a volume migration. It stays blocked on three unverified facts: Docker Engine behaviour, live Spaces restore, and ownership of the existing persistent volume. The six production-image Trivy scans have still not run.

`docker/postgres/Dockerfile` remains `USER root` on this branch. No prototype was added here; the proof-only prototype remains on PR #431.
