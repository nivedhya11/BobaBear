<!-- WAVE2_RECONCILE 2026-11-04
RECONCILED_MAIN = af8327748c1aefeaf2c4edee3eec48d0c9a662cd
#428_COMPOSE_LOOPBACK_ON_MAIN = YES (merged; compose publishes 127.0.0.1:${POSTGRES_HOST_PORT:-5433}:5432)
#428_HOLD = HISTORICAL_ONLY (do not treat as current hold fact)
#543_MERGED = YES (#409 staging phase-split proof path)
#409_ISSUE = OPEN (staging/deploy Trivy evidence still required; HOST_BUILD=NO / HOST_SCAN=NO in this wave)
NO_SECURITY_CLEARANCE = YES
-->

# BOBA_SECURITY_C1_TRIVY_DECISION_DELTA

```text
DELIVERABLE = BOBA_SECURITY_C1_TRIVY_DECISION_DELTA
WAVE = BOBA_PARALLEL_PRIORITY_WAVE_R1
LANE = B (Security / PostgreSQL / Trivy)
AUTHORIZATION = https://github.com/nivedhya11/BobaBear/issues/435#issuecomment-6586330569
PHASE = 1 (remote/source/CI/log/document review ONLY)
WORKTREE = /home/ajoshi/repos/boba-bear-wave-r1-b-sec
BRANCH = wave-r1-b-security-c1-20261103
BASELINE_SHA = a7026d2c80d2cfaf9184489a2dbf24b9698772b0
HEAD_SHA = e1ec4bdecef96ee59c3bc71170c03822f4f94264
DATE = 2026-11-03
STATUS = COMPLETE (evidence delta; no merge; no runtime mutation)
XR010_SESSION_UNTOUCHED = YES
PR = https://github.com/nivedhya11/BobaBear/pull/542
PR_STATE = OPEN draft / MERGE HOLD
PR_PREPARED = YES (held; not merge-authorized)
```

Anti-hallucination vocabulary used below: `VERIFIED` | `KNOWN` | `INFERRED` | `ASSUMED` | `UNVERIFIED` | `NOT_FOUND` | `CONFLICT`.

This artifact is **evidence input**, not acceptance, staging readiness, Founder UAT, XR-010 PASS, or IMP-036K authorization.

---

## Alignment (R0 / Phase-1 documentation)

```text
ALIGNMENT_GATE (compact)

Repository Authority: VERIFIED (/home/ajoshi/repos/boba-bear-wave-r1-b-sec)
Branch: wave-r1-b-security-c1-20261103
Baseline (origin/main merge-base): a7026d2c80d2cfaf9184489a2dbf24b9698772b0
Branch HEAD: see §8 after each docs commit (docs tip ≠ baseline)
Accepted Through: IMP-036I (ROADMAP/STATE)
Current Product Slice: IMP-036J (pendingAcceptance; Founder UAT NOT_PERFORMED)
Task: Security C1 / Trivy / Compose host-publish decision delta (Lane B) + R2 metadata correction
MAY MODIFY: this evidence markdown under docs/platform/operations/evidence/
MUST NOT MODIFY: XR-010 resources; primary checkout; attended worktree; ports 8179/8183/4175;
  Podman projects/volumes; staging secrets; held PR merges; production; scanner pin; .trivyignore;
  exception register; live Compose/runtime
EXPLICITLY OUT OF SCOPE: Trivy rebuild affecting owner runtime; DB/volume migration; C2 chown;
  VEX renewal/bypass; Founder UAT; IMP-036K; merge of #428; container scans on attended env
Risk: R2 documentation correction
DELIVERY_MODE: PUBLISH_PR (docs-only amendments onto held #542; merge not authorized)
Gate Result: PASS for documentation-only write
PROMPT DEVIATIONS: NONE
```

---

## Executive disposition

| Topic | Disposition | Certainty |
|---|---|---|
| Local Trivy 5/6 HIGH vs CI 6/6 PASS (#409) | Historical divergence explained primarily by **stale local image layers** vs **fresh CI `apt`/`apk` upgrades**; issue remains OPEN for **staging/deploy artifact freshness**, not because CI is falsely green | Historical diagnosis: `VERIFIED` (GitHub reviewer + CI logs). Current local reproduction: `UNKNOWN`. Staging bytes: `UNVERIFIED` |
| Production non-root PostgreSQL (C1 source) | **Already on `main`** via merged [#485](https://github.com/nivedhya11/BobaBear/pull/485) (`USER postgres`, root refusal, VEX-TRIVY-001 retired) | `VERIFIED` in baseline tree + merge commit `75f8d932802c7485f76b6766998f70c5d2a8417d` |
| Compose PostgreSQL loopback (#428) | **MERGED** onto current main (`af832774`); `compose.yaml` publishes `127.0.0.1:${POSTGRES_HOST_PORT:-5433}:5432`. Historical HOLD language below is superseded for merge status. | Source posture: `VERIFIED` merged. Live listener / runtime apply: `UNVERIFIED` (not probed this wave) |
| Testcontainers loopback (#539) | **MERGED into baseline** `a7026d2c`; disposable harness only — **does not** replace #428 | `VERIFIED` |
| Six-image CI Trivy on baseline | Security SDLC SUCCESS; Trivy **0.69.3**; **6/6** `PASS: trivy image scan`; aggregate “no unexcepted CRITICAL/HIGH”; **0 active container exceptions** | **CI image-scanning PASS only** (`VERIFIED`). Exact OCI digests of scanned CI artifacts: `UNKNOWN`. Staging/deploy artifact safety: **`UNVERIFIED` / not cleared** by CI PASS. Unfixed CVE census: `UNKNOWN` (gate uses `--ignore-unfixed`) |
| Docker Engine C1 equivalence | Still `UNVERIFIED` (historical C1 reports: Docker CLI absent) | `UNVERIFIED` |
| Existing-volume C1 cutover / C2 | Not authorized; selection of migration strategy still Founder RED | `KNOWN` from #447 / #444 holds |

---

## 1. Trivy reconciliation (#409) — local HIGH vs CI PASS

### 1.1 Scope of issue #409

Issue [#409](https://github.com/nivedhya11/BobaBear/issues/409) (`OPEN`, label `security`): reconcile reported local **5/6 HIGH OS findings** vs CI six-image PASS. Founder R0 investigation authorized 2026-10-20; technical root-cause review completed; **issue kept OPEN** for staging/deploy artifact disposition ([comment](https://github.com/nivedhya11/BobaBear/issues/409#issuecomment-6314780539)).

### 1.2 Independently verified CI provenance (baseline `a7026d2c`)

| Field | Value | Certainty |
|---|---|---|
| Exact SHA | `a7026d2c80d2cfaf9184489a2dbf24b9698772b0` | `VERIFIED` |
| CI run | [41436591135](https://github.com/nivedhya11/BobaBear/actions/runs/41436591135) SUCCESS | `VERIFIED` |
| Security SDLC job | `125247764233` SUCCESS | `VERIFIED` |
| CodeQL | [41436591342](https://github.com/nivedhya11/BobaBear/actions/runs/41436591342) SUCCESS | `VERIFIED` (SAST ≠ Trivy clearance) |
| Nightly (exact-main) | [41452727721](https://github.com/nivedhya11/BobaBear/actions/runs/41452727721) 8/8 SUCCESS | `VERIFIED` (E2E/recovery; not container CVE census) |
| Scanner | Trivy **v0.69.3** downloaded by `scripts/run-trivy.mjs` | `VERIFIED` (job log + pinned `TRIVY_VERSION` / `TRIVY_SHA256=1816b632dfe529869c740c0913e36bd1629cb7688bd5634f4a858c1d57c88b75`) |
| Vuln DB | Downloaded `mirror.gcr.io/aquasec/trivy-db:2` during scan | `VERIFIED` download occurred. Exact DB `UpdatedAt` / artifact digest for this run: `UNKNOWN` (not printed as a single digest line in extracted log) |
| Policy | `--severity CRITICAL,HIGH --ignore-unfixed --scanners vuln,misconfig --image-config-scanners misconfig --exit-code 1` | `VERIFIED` |
| Exceptions | Container table empty; `.trivyignore` states **no active** container exceptions; `VEX-TRIVY-001` retired | `VERIFIED` in baseline source |
| Build | `skip_build=false`; fresh Podman builds for all 6 targets | `VERIFIED` |
| Aggregate | `PASS: trivy found no unexcepted CRITICAL/HIGH findings across 6 production image(s)` | `VERIFIED` |

**Per-image gate results (VERIFIED from job log):**

| id | tagged image | Detected OS (log) | Result |
|---|---|---|---|
| web-runtime | `boba-bear-app:trivy` | alpine 3.24.3 | PASS |
| customer-auth-runtime | `boba-bear-customer-auth:trivy` | debian 12.15 | PASS |
| workforce-auth-runtime | `boba-bear-workforce-auth:trivy` | debian 12.15 | PASS |
| customer-commerce-runtime | `boba-bear-customer-commerce:trivy` | debian 12.15 | PASS |
| operations-runtime | `boba-bear-operations:trivy` | debian 12.15 | PASS |
| postgres | `boba-bear-postgres:trivy` | debian 13.7 | PASS |

**Package upgrades observed in the same CI build (VERIFIED log excerpts; not a full CVE ID matrix):**

| Image family | Package | Installed in CI build | Notes |
|---|---|---|---|
| Debian bookworm Node runtimes (web build stage / auth-like) | `perl-base` | `5.36.0-7+deb12u4` (over `…u3`) | Matches historical #409 CI explanation |
| Debian bookworm | `libpcre2-8-0` | `10.42-1+deb12u2` (over `10.42-1`) | Matches historical #409 CI explanation |
| Postgres (trixie) | `perl-base` | `5.40.1-6+deb13u1` (over `5.40.1-6`) | Current postgres base is trixie, not bookworm |
| Postgres (trixie) | `libpcre2-8-0` | `10.46-1~deb13u3` (over `…u1`) | |
| Postgres (trixie) | `libexpat1` | `2.9.0-1~deb13u1` | Installed during pgBackRest build deps |
| Postgres gosu | `gosu 1.19 (go1.26.10)` | Asserted in Dockerfile RUN | `VERIFIED` |

Alpine final installed `pcre2` / `libexpat` versions after `apk upgrade --no-cache` for `web-runtime`: **`UNKNOWN`** in this extraction (upgrade step ran; exact package versions not captured in the filtered log lines).

### 1.3 Historical local 5/6 FAIL — what is and is not proven

From Founder/GitHub review on #409 (2026-10-20…21):

1. **Primary historical cause (strongly supported):** local Podman layer cache retained older Debian/Alpine packages while CI rebuilt with live security upgrades. Differing Trivy CLI pin or ignore policy was **not** supported for that window (`KNOWN` / reviewer `VERIFIED` on CI side; local image IDs were Cursor-reported).
2. **Disposable no-cache local 6/6 PASS (#411 era):** Cursor-reported; **not independently re-reproduced** by GitHub reviewer → treat as `UNVERIFIED` for independent acceptance.
3. **Later #418-era local 5/6 FAIL report:** administrative comment explicitly forbade assuming the same cache root-cause without that-run metadata → still **`UNKNOWN`** without fresh local evidence.
4. **This Phase-1 lane:** no local `npm run audit:container`, no cache wipe, no image rebuild (XR-010 / wave freeze). Therefore **current local CVE ID list, image digests, and DB UpdatedAt: `UNKNOWN` — not PASS**.

### 1.4 Critical interpretation rules (do not violate)

```text
CI_SIX_IMAGE_PASS ≠ ALL_CURRENT_CVES_CLEARED
REASON: gate uses --ignore-unfixed; PASS means no unexcepted FIXED CRITICAL/HIGH under pinned scanner+DB+fresh build
UNFIXED_HIGH_CRITICAL_CENSUS_FOR_BASELINE_IMAGES = UNKNOWN (not extracted from CI JSON artifacts this phase)
HISTORICAL_C1_DIRECT_SCAN_CENSUS = 86 HIGH/CRITICAL rows / 24 CVE IDs with empty FixedVersion
  (reported on #447 C1 proof image under Trivy 0.69.3 without --ignore-unfixed; Cursor/issue evidence —
   treat as KNOWN historical for that image SHA, not as current six-image census)
VEX_OR_TRIVYIGNORE_ACTIVE_FOR_DS-0002 = NO (retired after #485)
SCANNER_DOWNGRADE_OR_HIGH_WAIVER = NOT AUTHORIZED / NOT PERFORMED
POLICY_MODULE_SKIP = aws/cloudfront/enable_logging.rego requires Trivy >=0.72.0 while pin is 0.69.3
  (WARN only; unrelated to OCI CVE discrepancy explanation)
```

### 1.5 Outstanding evidence checklist (#409 still required before closure)

- [ ] Current local failing (or passing) image identity/digest set — `UNKNOWN` this phase
- [ ] Installed/fixed package versions on those local images — `UNKNOWN`
- [ ] Complete CVE/severity list including CRITICAL — `UNKNOWN` this phase
- [ ] Fresh vs cached layer provenance for any new local run — `UNKNOWN`
- [ ] Trivy DB `UpdatedAt` / digest side-by-side with CI — `UNKNOWN`/`PARTIAL` (CI download `VERIFIED`, digest `UNKNOWN`)
- [ ] Exact `.trivyignore` hash comparison — baseline content `VERIFIED` (empty active); local hash unused
- [ ] **Staging/deploy artifact** identity + package versions + unsuppressed Trivy of **exact staged bytes** — `UNVERIFIED` (separate Founder ops authority; **not** executed here)

---

## 2. Non-root PostgreSQL C1 — proof vs production equivalence

### 2.1 What landed on baseline `main`

| Item | State | Certainty |
|---|---|---|
| Production `docker/postgres/Dockerfile` final `USER postgres` | Present (build uses `USER root` only for install; runtime `USER postgres`) | `VERIFIED` |
| Entrypoint refuses uid 0; no mounted-volume `chown` repair | `docker/postgres/pgbackrest/entrypoint-wrapper.sh` | `VERIFIED` |
| `VEX-TRIVY-001` / DS-0002 exception | Retired; `.trivyignore` documents retirement | `VERIFIED` |
| Merge vehicle | [#485](https://github.com/nivedhya11/BobaBear/pull/485) merged 2026-10-26 → `75f8d932…` | `VERIFIED` |
| Precursor closed PRs | [#448](https://github.com/nivedhya11/BobaBear/pull/448), [#449](https://github.com/nivedhya11/BobaBear/pull/449) CLOSED (not merge authority for current main) | `VERIFIED` |

### 2.2 Held / superseded proof & decision PRs

| PR | Role | State | Notes |
|---|---|---|---|
| [#431](https://github.com/nivedhya11/BobaBear/pull/431) | Proof-only disposable C1 image under `proof/pg-c1/` (production Dockerfile unchanged at authorship) | OPEN, `held`, **CONFLICTING** | Historical Podman matrix evidence; **do not merge as production substitute**. Security SDLC was FAILURE at tip (inherited SCA era / path triggers). |
| [#444](https://github.com/nivedhya11/BobaBear/pull/444) | Decision-only C1 vs C2 package (`docs/uat/.../DS0002_C1_C2_DECISION.md`) | OPEN, `held`, **CONFLICTING** | Preferred C1 **NOT_SELECTED** at authorship; production Dockerfile then still `USER root`. **Superseded in substance** by later #485 merge + Founder #447 selection path — keep as historical decision evidence; do not treat as current blocker for C1 source existence. |
| [#447](https://github.com/nivedhya11/BobaBear/issues/447) | C1 production-source engineering authorization | OPEN | Records C1 design selection, disposable Docker auth, and residual UNVERIFIED rows |

### 2.3 Equivalence gaps that remain open

| Gap | Status | Required decision class |
|---|---|---|
| Docker Engine disposable matrix (ARCH-G26 production engine) | `UNVERIFIED` (historical: Docker CLI absent; Podman PASS ≠ Docker PASS) | Founder ops / ENVIRONMENT or disposable Docker host |
| Live Spaces archive-push/restore | `UNVERIFIED` | Separate RED ops authority |
| Existing persistent volume UID/ownership compatibility with UID 999 | `UNKNOWN` / inventory not executed this phase | Founder C1 cutover vs restore-into-new vs C2 (C2 still **not** default) |
| Staging/runtime actually running C1 image bytes | `UNVERIFIED` | Staging rebuild/redeploy authority (not granted in this wave) |
| Six-image “current CVE universe” without `--ignore-unfixed` | `UNKNOWN` for baseline tip | Optional security census; do **not** waive |

**INFERRED (non-binding):** source-level C1 contract on `main` is satisfied for greenfield/new correctly owned volumes. That does **not** prove staging cutover safety or Docker Engine production equivalence.

---

## 3. #428 vs #539 distinction (mandatory)

| Dimension | [#539](https://github.com/nivedhya11/BobaBear/pull/539) | [#428](https://github.com/nivedhya11/BobaBear/pull/428) |
|---|---|---|
| Surface | Disposable **Testcontainers** PostgreSQL host publish | **Compose** `services.postgres.ports` for local/staging-shaped stacks |
| Change | Amend PortBindings with `HostIp: 127.0.0.1` in `tests/database/support/test-container.ts` | `"${POSTGRES_HOST_PORT:-5433}:5432"` → `"127.0.0.1:${POSTGRES_HOST_PORT:-5433}:5432"` |
| Current main `af832774` | **MERGED** (#539 on earlier main) | **MERGED** (#428) + #543 (#409 phase split) on path to `af832774` |
| Main source today | Loopback helper `VERIFIED` present | Unqualified publish **still present** (`compose.yaml` line 31) `VERIFIED` |
| Merge authorization | Merged | Explicit Founder **HOLD** / `PR_MERGE=NOT_AUTHORIZED` (comments 2026-10-30, 2026-11-02) |
| Exact-head CI (held tip `b8d0c281…`) | N/A (already merged) | CI [41427310733](https://github.com/nivedhya11/BobaBear/actions/runs/41427310733) SUCCESS; CodeQL [41427310912](https://github.com/nivedhya11/BobaBear/actions/runs/41427310912) SUCCESS — **does not** authorize merge |
| Remediates DS-0002? | No | No (networking only; C1 image already separate) |
| Runtime application | Test harness only | Requires **separate** recreate/deploy authorization after merge |

```text
#539_MERGED_INTO_BASELINE = YES
#428_COMPOSE_LOOPBACK_ON_MAIN = YES  # Wave2 reconcile vs af832774
#428_HOLD = HISTORICAL_ONLY  # Wave2: #428 merged; do not treat as current hold
DO_NOT_COLLAPSE_539_AND_428 = YES
```

---

## 4. Critical exposures backed by evidence

### 4.1 VERIFIED (source / logs)

1. **Compose PostgreSQL host publish remains all-interfaces on baseline**  
   Evidence: `compose.yaml` `ports: - "${POSTGRES_HOST_PORT:-5433}:5432"`. Proposal: `docs/platform/security/proposals/R3-postgres-host-publish-isolation.md`. Correction candidate already published as held #428.

2. **CI Trivy PASS is scoped**  
   Evidence: job `125247764233` uses `--ignore-unfixed` and empty active Trivy exceptions. PASS ≠ proof that unfixed HIGH/CRITICAL are absent.

3. **Historical staging image patch-lag was reported during #409**  
   Evidence: issue comments (Cursor-reported `perl-base` u3 / `libpcre2` u1 on staging `:local` while CI `:trivy` upgraded). **Current staging package inventory: `UNVERIFIED` this phase** (no staging host access).

### 4.2 UNKNOWN / UNVERIFIED (do not mark PASS)

| Finding | Why unknown |
|---|---|
| Live LAN/WAN reachability of any Postgres listener on ports including 5433 | Not probed (XR-010 freeze; wave forbids runtime mutation / port probing of owner services) |
| Exact OCI digests of the six CI-scanned images | Log shows layer/config copy digests and tags; final scanned image ID digest not extracted |
| Full CVE×package matrix for baseline six images | JSON reports not archived/extracted this phase |
| Current local `audit:container` outcome | Not run |
| Staging secret file modes (0755 / 0777 report) | Separate P0 hold; agents must not chmod/read secrets; path/mode checklist only if lstat-safe — **not executed** here to avoid XR-010/staging risk |
| Docker Engine C1 behaviour | Historically absent CLI |
| Existing volume ownership map (host UID ↔ container 999) | Not inventoried |

### 4.3 Staging secrets (document-only requirement)

Wave text records R1 host report of `.env.staging` mode **0755** and three credential files **0777**.  

```text
STAGING_SECRET_MODE_CORRECTION = FOUNDER_DECISION_HOLD
AGENT_ACTION_THIS_LANE = NOT_PERFORMED (prefer no staging-host touch under XR-010)
REQUIRED_BEFORE_MODE_FIX = explicit Founder scoped approval + lstat-verified path/mode checklist without reading secret contents
```

---

## 5. Bounded source-only remediation candidates (HOLD merge)

| Candidate | Status | Authorization needed |
|---|---|---|
| Merge held [#428](https://github.com/nivedhya11/BobaBear/pull/428) (or reapply identical mapping) | Ready for **Founder merge decision**; tip already CI/CodeQL green per 2026-11-02 review | **R3 / RED merge + separate runtime apply** |
| New duplicate Compose loopback PR from this worktree | **Not prepared** — would duplicate #428 | N/A |
| Renew/extend VEX or weaken Trivy | **Forbidden** | Would be RED; not requested |
| Scanner pin bump to ≥0.72.0 (policy module skip) | Optional toolchain hardening; **not** required to explain #409 | Separate AMBER/RED toolchain decision |
| Staging image no-cache rebuild + exact-artifact Trivy | Ops remediation for #409 closure | Founder staging deploy/rollback authority |
| Existing-volume C1 cutover / C2 initializer | Out of scope; C2 not selected default | Explicit RED product/ops decision |
| Close #409 | Only after staging/deploy artifact gate disposition | Founder |

**PR for this evidence delta:** [#542](https://github.com/nivedhya11/BobaBear/pull/542) — **OPEN draft / MERGE HOLD**. Does **not** authorize merge of #428, C1/C2 cutover, VEX/scanner policy changes, or staging Trivy of live artifacts.

```text
CI_IMAGE_SCAN_PASS ≠ STAGING_ARTIFACT_SAFETY
STAGING_ARTIFACT_TRIVY = UNVERIFIED
#428_MERGE = NOT_AUTHORIZED_BY_THIS_PR
CONTAINER_SCAN_ON_ATTENDED_ENV = NOT_PERFORMED
SECURITY_EXCEPTION_MUTATION = NOT_PERFORMED
```

---

## 6. Required Founder decisions (C1 / C2 / RED)

| ID | Decision | Suggested class | Blocking what |
|---|---|---|---|
| D-SEC-428 | Authorize **merge** of Compose Postgres loopback (#428 or equivalent) | **RED / R3** | Removes source all-interfaces default; still needs runtime apply |
| D-SEC-428-RUNTIME | Authorize container recreate / staging-or-local Compose apply of loopback mapping | **RED / R3 ops** | Live bind posture |
| D-SEC-409-STAGING | Authorize non-destructive inventory + controlled fresh image rebuild/redeploy + Trivy of **exact staged artifacts** | **RED ops** | Closure of #409 operational half |
| D-SEC-C1-VOLUME | Choose existing-volume strategy: (i) C1 on new volume, (ii) C1 if UID-compatible, (iii) restore into owner-correct volume, (iv) C2 reownership | **RED** (C2 still not default) | Production/staging data cutover |
| D-SEC-DOCKER | Provide/permit isolated nonprod Docker Engine proof host if ARCH-G26 equivalence required before pilot | Ops / ENVIRONMENT | Docker≠Podman proof gap |
| D-SEC-SECRETS | Authorize mode-only correction of staging secret files after lstat checklist | **RED / P0 hold** | Secret exposure posture |
| D-SEC-UNFIXED | Decide whether to require periodic unfixed-CVE census (informational) without weakening gate | Security policy (AMBER/RED if changing gate) | Transparency vs noise |

Non-decisions (do **not** ask agents to self-grant): XR-010 PASS, Founder UAT, IMP-036J acceptance, IMP-036K activation, production GTM cutover, VEX renewal.

---

## 7. Sources consulted (provenance)

- Issues: [#409](https://github.com/nivedhya11/BobaBear/issues/409), [#447](https://github.com/nivedhya11/BobaBear/issues/447), wave comment on [#435](https://github.com/nivedhya11/BobaBear/issues/435#issuecomment-6586330569)
- PRs: [#428](https://github.com/nivedhya11/BobaBear/pull/428), [#431](https://github.com/nivedhya11/BobaBear/pull/431), [#444](https://github.com/nivedhya11/BobaBear/pull/444), [#448](https://github.com/nivedhya11/BobaBear/pull/448), [#449](https://github.com/nivedhya11/BobaBear/pull/449), [#485](https://github.com/nivedhya11/BobaBear/pull/485), [#539](https://github.com/nivedhya11/BobaBear/pull/539)
- CI logs: Security SDLC job `125247764233` on run `41436591135`
- Baseline files: `compose.yaml`, `docker/postgres/Dockerfile`, `docker/postgres/pgbackrest/entrypoint-wrapper.sh`, `.trivyignore`, `docs/platform/security/vulnerability-exception-register.md`, `scripts/run-trivy.mjs`, `tests/database/support/test-container.ts`, `docs/platform/security/proposals/R3-postgres-host-publish-isolation.md`

---

## 8. Lane confirmation

```text
BASELINE_SHA = a7026d2c80d2cfaf9184489a2dbf24b9698772b0
BRANCH = wave-r1-b-security-c1-20261103
HEAD_SHA = e1ec4bdecef96ee59c3bc71170c03822f4f94264
DELTA_PATH = docs/platform/operations/evidence/security-c1-trivy-decision-delta.md
PR_URL = https://github.com/nivedhya11/BobaBear/pull/542
PR_STATE = OPEN draft / MERGE HOLD
XR010_SESSION_UNTOUCHED = YES
HOST_RUNTIME_MUTATION = NO
HELD_PR_MERGES = NONE
#428_NOT_MERGED = NO  # Wave2 reconcile
ATTENDED_ENV_CONTAINER_SCAN = NOT_PERFORMED
SECURITY_EXCEPTIONS_UNCHANGED = YES
CI_PASS_VS_STAGING_ARTIFACT_SAFETY = DISTINCTION_PRESERVED
STATUS = COMPLETE
```

---

## 9. R2 metadata correction (2026-11-03)

Replaced pre-publication placeholders (`HEAD_SHA` parenthetical, `PR_PREPARED=PENDING`, `PR_URL=NONE`, wrong `DELTA_PATH` filename, alignment gate treating branch HEAD as baseline) with actual PR/ref/status. No change to Trivy/C1/C2 substance, `#428` HOLD, exception register, or scanner policy.

```text
R2_CORRECTION = METADATA_ONLY
SUBSTANTIVE_SECURITY_DISPOSITION_CHANGE = NONE
PROMPT DEVIATIONS: NONE
```
