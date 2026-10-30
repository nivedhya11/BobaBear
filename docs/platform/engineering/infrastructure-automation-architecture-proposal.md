---
Status: NON_AUTHORITATIVE_PROPOSAL
Authority: NONE
Retrieved: 2026-10-30
Source HEAD observed: 81c7602bda977c63ba0165266f0191e75ff6cca7
Source tree observed: ddcc0e8181bf1d247ed22f435712d2cc9b980e65
Working-tree fingerprint observed (pre-write baseline): 98a5d38f14c51872c6fb8c09121296c8ec98261f6b04c645c27736b908f27dde
---

# Infrastructure automation architecture proposal (T0)

```text
STATUS = NON_AUTHORITATIVE_PROPOSAL
AUTHORITY = NONE
FOUNDER_DESIGN_EVIDENCE = IA-01/03/04/05
IA-02 = DECISION_REQUIRED
ADR002_BINDING_AMENDMENT = NOT_PERFORMED
FORMAL_DECISION_REGISTER_AMENDMENT = NOT_AUTHORIZED
IMP039_ACTIVATED = NO
CLOUD_PROVISIONING_AUTHORIZED = NO
INFRASTRUCTURE_IMPLEMENTATION = NOT_AUTHORIZED
APPROVAL_SCOPE = T0_DOCUMENTATION_ONLY
D_NUMBER_ALLOCATED = NO
```

This supporting engineering proposal records Founder-approved DigitalOcean automation
**design directions** and the unresolved IA-02 proof boundary. It does **not** amend
CURRENT ADR/register text, activate IMP-039, authorize cloud mutation, publish images,
or allocate a decision-register identity.

Binding authorities remain:

| Question | Authority |
|---|---|
| Lifecycle / IMP-039 activation | [`ROADMAP.md`](../ROADMAP.md) / [`STATE.md`](../STATE.md) |
| Pilot production topology | ARCH-G26 / [D-374](../decision-register.md) / [ADR-016](../decisions/ADR-016-cost-optimized-pilot-infrastructure.md) |
| Production origin trust | ARCH-G27 / [D-375](../decision-register.md) / [ADR-017](../decisions/ADR-017-edge-origin-security-privacy-hardening.md) |
| Release / CI / immutable OCI principles | [ADR-002](../decisions/ADR-002-environments-ci-cd-release-model.md) (AMENDED by D-374; binding text unchanged by this proposal) |
| Config / secrets principles | [ADR-015](../decisions/ADR-015-configuration-secrets-feature-flags.md) (AMENDED by D-374) |
| Recovery tooling / RPO-RTO targets | IMP-037 capability + [`imp037-recovery-runbook.md`](../operations/imp037-recovery-runbook.md) |
| Staging Tunnel design (separate) | [`d2-restricted-cloudflare-tunnel-design.md`](../operations/d2-restricted-cloudflare-tunnel-design.md) |

```text
D-385 / D-386 = RESERVED by open PR #429 — NOT REUSED
D-387 = STAGED by open PR #488 — NOT REUSED
NO_NEW_D_NUMBER_INVENTED = YES
```

## 1. Founder approval scope and date

**Date:** 2026-10-30  
**Scope:** `T0_DOCUMENTATION_ONLY`  
**Explicitly not authorized by that approval:** formal decision-register amendment;
infrastructure implementation; cloud mutation; IMP-039 activation; production release.

| ID | Status | Design direction (Founder-approved evidence) |
|---|---|---|
| **IA-01** | `APPROVED_DESIGN_DIRECTION` | One immutable **release-set** manifest containing individually pinned container image digests; validation/approval are separate attestations that must not mutate that sealed identity. |
| **IA-02** | `UNRESOLVED` / `DECISION_REQUIRED` | Identical staging/production image digests require focused static-build / public-config / CSP proof before selection. |
| **IA-03** | `APPROVED_DESIGN_DIRECTION` | Isolated, private, versioned DigitalOcean Spaces **Terraform state** storage, separate from backup data. |
| **IA-04** | `APPROVED_DESIGN_DIRECTION` | Retain D-374 single-Droplet DigitalOcean production. |
| **IA-05** | `APPROVED_DESIGN_DIRECTION` | Infrastructure definitions remain in `nivedhya11/BobaBear` (this monorepo). |

## 2. Verified current source inventory

Observed against HEAD `81c7602bd…` / tree `ddcc0e818…` (prompt `LAST_VERIFIED_MAIN` /
`LAST_VERIFIED_TREE`). Tags: `VERIFIED` = demonstrated in this tree; `DIRECTION_ONLY` =
architecture prose without the named file; `NOT_FOUND` = searched, absent.

| Topic | Evidence | Tag |
|---|---|---|
| Multi-target Dockerfile (builder, tooling, auth/commerce/operations runtimes, web-runtime) | `Dockerfile` | VERIFIED |
| Build-time `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_BOBA_BEAR_GOOGLE_MAPS_BROWSER_KEY` | `Dockerfile` builder ARGs/ENVs; `compose.yaml` `app.build.args` | VERIFIED |
| GA-dependent Nginx CSP image selection | `Dockerfile` `web-runtime` copies `security-headers.ga.conf` when GA ID non-empty | VERIFIED |
| Local Compose builds images (`*:local`); publishes postgres + app host ports | `compose.yaml` | VERIFIED |
| Auth/commerce/operations Compose-internal (`expose` only) | `compose.yaml` | VERIFIED |
| `compose.production.yaml` | ARCHITECTURE §3.1 / ADR-016 direction | DIRECTION_ONLY / NOT_FOUND as file |
| `infra/` Terraform tree | repository root | NOT_FOUND |
| `deploy.yml` | `.github/workflows/deploy.yml` | VERIFIED as **GitHub Pages** marketing static deploy (`out/` → `gh-pages`); not Droplet/GHCR release |
| GHCR multi-image release-set build + digest-promote control plane | `.github/workflows/` | NOT_FOUND (ADR-002 direction remains; not implemented as release-set publisher in this tree) |
| D-374 single Droplet + Compose + self-hosted PG18 + Spaces backups | ADR-016 / ARCH-G26 / D-374 | VERIFIED (authority) |
| D-375 production origin trust | ADR-017 / ARCH-G27 / IMP-039 handoff checklist | VERIFIED (design); live realization `PRODUCTION_REALIZATION_PENDING` |
| D2 staging Tunnel + Access | `operations/d2-restricted-cloudflare-tunnel-design.md` (PR #511) | VERIFIED design-only; operations unauthorized |
| IMP-037 recovery CLI / Spaces backup destination concept | runbook + capability | VERIFIED tooling; live Spaces proof `NOT_PERFORMED` |
| PostgreSQL host publish posture risk (default all interfaces) | `compose.yaml`; `security/proposals/R3-postgres-host-publish-isolation.md` | VERIFIED local posture; production firewall evidence UNAVAILABLE here |
| Public marketing GitHub Pages cutover still separate from DO app | ADR-002 | VERIFIED (authority principle) |
| Existing IA/T0 proposal document | `docs/platform/engineering/` | NOT_FOUND before this write |

## 3. Approved design-direction matrix

| Concern | Approved direction | Binding CURRENT constraint that remains |
|---|---|---|
| Release identity | IA-01 release-set manifest of pinned digests | ADR-002 immutable OCI / GHCR / manual production / serialized migrations / rollback-by-image |
| Staging↔prod digest equality | IA-02 unresolved until proof | ADR-002 “promote same image digest” intent; must not be claimed solved by source SHA alone |
| Terraform state | IA-03 private versioned Spaces state ≠ backup Spaces | ADR-015 no secrets in Git; IMP-037 backup credentials remain separate |
| Compute topology | IA-04 retain single Droplet | D-374 / ARCH-G26; no default paid additions |
| Repo placement | IA-05 same monorepo | Public-repo safety; untrusted PRs credential-free |

## 4. ADR-002 reconciliation (proposed amendment wording — NOT CURRENT)

### 4.1 What ADR-002 already binds (unchanged by this proposal)

Preserved CURRENT principles (ADR-002 AMENDED status under D-374):

```text
trunk-based workflow
CI
immutable OCI image
GHCR
manual production gate
serialized migrations
same-image deployment
rollback discipline (image redeploy; not routine DB down-migration)
```

Pilot amendments already recorded by D-374 / ADR-016: Compose Droplet production target;
permanent always-on hosted cloud staging `NOT_REQUIRED_FOR_PILOT`.

### 4.2 Tension with today’s multi-service reality (analysis only)

ADR-002 historical prose says “exactly one immutable OCI container image per accepted
`main` commit” and “web application and background worker deploy from the same image.”
Accepted Compose inventory now has **multiple runtime images** (`app`/Nginx web-runtime,
`customer-auth`, `workforce-auth`, `customer-commerce`, `operations`, plus `tooling` and
an independently built `postgres` image).

IA-01 does **not** silently rewrite ADR-002. It proposes that “same-image deployment”
be interpreted, after a future authorized amendment, as **same release-set**: one
immutable manifest binding the set of digests promoted together.

### 4.3 Proposed ADR-002 amendment wording (NOT BINDING — do not paste into ADR-002)

> **Proposed (future formal amendment only):** For the D-374 Compose Droplet topology,
> a production-promotable unit begins as an immutable **release-set manifest**
> (`IMMUTABLE_RELEASE_MANIFEST`) that seals, for one source commit SHA and Git tree, the
> exact OCI digest of each runtime service image, the tooling image digest used for
> migration/check jobs, the PostgreSQL base/image digest recorded as release evidence
> (without implying automatic PostgreSQL rollout), the build profile / public-config
> fingerprint that produced those digests, migration-ledger compatibility requirements,
> required immutable build/security evidence, and the manifest’s own content hash.
> Staging validation and production approval are **separate attestation records** that
> reference that sealed manifest identity; neither may mutate the sealed manifest or
> change its identity. Deployment records similarly reference the sealed manifest and
> the validation/approval attestations while recording actual deployed identity and
> health. Environments MUST NOT rebuild application images at deploy time. Mutable
> tags (for example `latest`) MUST NOT be the sole production reference. Web and worker
> processes that historically shared one image MAY remain co-located in one digest when
> architecture so requires; multiple service digests in one release-set do not authorize
> independent unsynchronized production promotion of a subset without an explicit human
> gate.

```text
ADR002_BINDING_AMENDMENT = NOT_PERFORMED
THIS_SECTION_IS_PROPOSAL_ONLY = YES
```

## 5. Proposed release identity records and guards

Four **separate** proposed records. Authority of these schemas today: **NONE**
(documentation proposal). Validation and approval **must not** rewrite the sealed
manifest or change its identity.

```text
IMMUTABLE_RELEASE_MANIFEST          = sealed build identity
STAGING_VALIDATION_ATTESTATION      = post-validation evidence referencing the manifest
PRODUCTION_APPROVAL_ATTESTATION     = post-authorization evidence referencing the manifest
DEPLOYMENT_RECORD                   = post-deploy identity/health referencing both
SEALED_MANIFEST_MUTATION_BY_VALIDATION_OR_APPROVAL = FORBIDDEN
```

### 5.1 `IMMUTABLE_RELEASE_MANIFEST` (proposed; sealed at build)

Schema name (proposed): `boba.release-set.v1`

Sealed once at trusted build. Contains source identity, exact OCI digest set,
build-profile fingerprint, migration requirements, immutable build/security evidence,
and the manifest hash. Does **not** embed staging validation outcomes or human
production-approval provenance.

```text
schemaVersion: "boba.release-set.v1"
manifestHash: <content hash of this sealed document>
source:
  repository: "nivedhya11/BobaBear"   # GitHub identity; local path may differ
  commitSha: <full git sha>
  treeSha: <git tree sha>
  workingTreeFingerprint: <optional; required when uncommitted/UAT candidate rules apply>
buildProfile:
  id: <stable profile id, e.g. "pilot-public-canonical-v1">
  fingerprint: <hash of build-args / public-config inputs that affect image bytes>
  notes: <human; must not claim digest equality from commitSha alone>
images:
  app:              { ref: "ghcr.io/.../app@sha256:...", digest: "sha256:..." }
  customer-auth:    { ref: "...@sha256:...", digest: "sha256:..." }
  workforce-auth:   { ref: "...@sha256:...", digest: "sha256:..." }
  customer-commerce:{ ref: "...@sha256:...", digest: "sha256:..." }
  operations:       { ref: "...@sha256:...", digest: "sha256:..." }
  tooling:          { ref: "...@sha256:...", digest: "sha256:..." }
postgres:
  image: { ref: "...@sha256:...", digest: "sha256:..." }
  lifecycle: "INDEPENDENT_OF_APPLICATION_RELEASE"
  rolloutAuthorizedByThisManifest: false
migrationLedger:
  compatibilityRequirement: <head migration id / required ledger proof identity>
security:
  scans: [<CI job / SARIF / advisory refs sealed at build>]
  requiredGates: [<named required checks sealed at build>]
```

### 5.2 `STAGING_VALIDATION_ATTESTATION` (proposed; produced after validation)

Produced **after** validation. References the sealed manifest identity (`manifestHash` /
release-set id) and records the digests actually observed/validated. Must not rewrite
the sealed manifest.

```text
schemaVersion: "boba.staging-validation-attestation.v1"
manifestRef:
  schemaVersion: "boba.release-set.v1"
  manifestHash: <exact sealed IMMUTABLE_RELEASE_MANIFEST hash>
  commitSha: <must match sealed source.commitSha>
validatedDigests: [<exact digests observed; must equal sealed image digests>]
evidenceRefs: [<URLs or paths; may be empty until authorized staging exists>]
validatedAt: <timestamp>
```

### 5.3 `PRODUCTION_APPROVAL_ATTESTATION` (proposed; produced after human authorization)

Produced **after** human authorization. References the same sealed manifest identity and
the validation evidence used for the gate. Must not rewrite the sealed manifest.

```text
schemaVersion: "boba.production-approval-attestation.v1"
manifestRef:
  schemaVersion: "boba.release-set.v1"
  manifestHash: <exact sealed IMMUTABLE_RELEASE_MANIFEST hash>
  commitSha: <must match sealed source.commitSha>
validationRef:
  schemaVersion: "boba.staging-validation-attestation.v1"
  evidenceIdentity: <attestation id / hash>
actor: <human>
decisionRef: <ticket / recorded approval>
approvedAt: <timestamp>
```

### 5.4 `DEPLOYMENT_RECORD` (proposed; produced after deploy)

References the sealed manifest and the validation/approval attestations. Records actual
deployment identity and health. Must not rewrite the sealed manifest.

```text
schemaVersion: "boba.deployment-record.v1"
manifestRef:
  schemaVersion: "boba.release-set.v1"
  manifestHash: <exact sealed IMMUTABLE_RELEASE_MANIFEST hash>
validationRef: <staging-validation attestation identity>
approvalRef: <production-approval attestation identity>
deployedDigests: [<exact digests actually running>]
environment: <staging | production | founder-local | ephemeral>
health: <observed health / smoke evidence refs>
deployedAt: <timestamp>
```

### 5.5 Guards (proposed; future T1/T2 enforce)

1. **Digest-only deploy references** — Compose production overrides reference `@sha256:…`
   digests from the sealed manifest; tag floating is rejected.
2. **No runtime build in production** — production Compose must not invoke `build:` for
   application services.
3. **Build-profile binding** — promoting digests requires matching `buildProfile.fingerprint`;
   same `commitSha` with a different profile is a **different** sealed manifest.
4. **PostgreSQL independence** — postgres digest is evidence; changing it requires an
   explicit DB lifecycle change, not an automatic side effect of app release.
5. **Migration serialization** — tooling digest + ledger compatibility must pass before
   new app digests receive traffic; concurrent migration jobs forbidden (ADR-002).
6. **Sealed-manifest integrity** — staging validation and production approval are separate
   attestations that reference `manifestHash`; they MUST NOT mutate sealed fields or mint
   a new release identity for the same sealed bytes. Under D-374, permanent always-on
   cloud staging remains `NOT_REQUIRED_FOR_PILOT`; Founder-local or ephemeral validation
   may satisfy the gate until a separately authorized staging consume path exists.
   Unmerged PR digests remain ineligible for production.
7. **Rollback separation** — application rollback = prior sealed release-set image
   redeploy; database recovery = IMP-037 recovery path; do not conflate.
8. **Human production gate** — no automatic production apply/release from merge alone;
   production requires a `PRODUCTION_APPROVAL_ATTESTATION` referencing the sealed
   manifest and validation evidence.
9. **No silent staging-requirement reintroduction** — this proposal must not treat
   ADR-002’s historical “automatic hosted staging on every merge” prose as CURRENT
   pilot obligation; prefer D-374 / ADR-016.

## 6. IA-02 alternatives and required proof (UNRESOLVED)

IA-02 asks whether staging and production can share **identical application image digests**
given static Next.js export and build-time public configuration.

Verified bake-in points today:

- `NEXT_PUBLIC_SITE_URL` (canonical / SEO / absolute URLs; default `https://thebobabear.in`)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (analytics; also selects GA CSP variant in `web-runtime`)
- `NEXT_PUBLIC_BOBA_BEAR_GOOGLE_MAPS_BROWSER_KEY` (browser Maps)
- Static export (`out/`) is baked into the Nginx image at build time
- Nginx CSP authority is image content (`security-headers.conf` vs `.ga.conf`), not a
  runtime Compose env flip
- Founder UAT exact-candidate rules require path + branch + HEAD + tree +
  `WORKING_TREE_FINGERPRINT` when applicable — they do **not** by themselves prove
  cross-environment digest equality

### 6.1 Option A — One canonical immutable build profile

Build once with a single approved public-config profile (likely production canonical
origin and approved Maps/GA values). Promote that digest set to any environment that
can safely consume those baked values.

| Dimension | Assessment |
|---|---|
| SEO / canonical URLs | Strong if profile matches public production origin; staging hostnames may disagree with baked canonical |
| Customer auth / secure origin | Cookie/`SITE_URL`/HTTPS origin mismatches are a material risk if staging hostname ≠ baked URL |
| Maps / analytics | Same browser keys/IDs everywhere; may mix staging traffic into production analytics unless separately constrained |
| CSP authority | Stable; GA CSP variant fixed at build |
| Test reproducibility | High for that profile |
| Browser vs server consistency | Good within the baked profile |
| Image digest equality | Achievable by construction for that profile |
| Security regression | Staging using production origin strings / keys needs explicit threat review |

### 6.2 Option B — Environment-neutral image + approved runtime public-configuration boundary

Refactor so image bytes do not embed environment-specific public config (or embed only
neutral placeholders), with an **approved, validated** runtime boundary for public
non-secret configuration and CSP selection that preserves ADR-015 browser/server
separation and Nginx CSP authority.

| Dimension | Assessment |
|---|---|
| SEO / canonical URLs | Requires a proven runtime/canonical injection that static export can honor |
| Customer auth / secure origin | Potentially better staging isolation if origin is runtime-correct |
| Maps / analytics | Runtime public config possible; must remain non-secret and CSP-aligned |
| CSP authority | Harder: today’s GA CSP is build-selected; runtime CSP switching needs a locked design |
| Test reproducibility | Requires config fingerprint in the release-set, not only source SHA |
| Browser vs server consistency | Must prove no split-brain between baked HTML and runtime headers |
| Image digest equality | Achievable if build inputs are truly environment-neutral |
| Security regression | Larger change surface; RED if it invents new config authority |

### 6.3 Recommendation (non-selecting)

**Non-selecting recommendation for future decision work only:** gather the §6.4 proof
first; evaluate whether Option A can satisfy Founder staging needs **without** weakening
auth/origin or analytics isolation; only if that proof fails, consider authorizing a
narrow Option B design under ADR-015 / future ADR-002 amendment discipline. This
paragraph does **not** select IA-02.

```text
IA_02_SELECTED = NO
IA_02_IMPLEMENTED = NO
IA_02_RECOMMENDATION_IS_NOT_A_DECISION = YES
```

### 6.4 Required IA-02 proof (minimum)

Before any claim that staging and production share digests:

1. Static export + public-config matrix: identical source tree built under candidate
   profiles; record digests and `buildProfile.fingerprint`.
2. Canonical URL / SEO sample proof for each candidate profile.
3. Auth/session secure-origin behaviour under staging hostname vs baked `SITE_URL`.
4. Maps key behaviour and CSP console/network evidence.
5. GA on/off CSP file selection proof (image content grep / header observation).
6. Explicit statement that **same commit SHA ≠ same digest** when build args differ.
7. Founder decision selecting A, B, or a constrained hybrid — formal register amendment
   remains separately authorized.

## 7. Terraform state architecture and monorepo security boundaries

IA-03 / IA-05 design direction (proposal only):

### 7.1 Same-repository structure (proposed)

```text
infra/                          # future; NOT created by T0
  README.md                     # non-authoritative operator index
  versions.tf                   # required_version + provider pins
  backends/                     # backend configs; no state files
  modules/                      # reusable modules
  envs/
    bootstrap/                  # state bucket/key bootstrap (chicken/egg)
    production/                 # D-374 droplet/firewall/spaces references
```

Ownership: platform operators / Founder; coding agents may draft under explicit task
contracts only. Public repository: never commit state, `.tfvars` with secrets, tokens,
or private keys.

### 7.2 Provider and backend pinning (proposed)

- Pin Terraform `required_version` to an exact approved version range/policy.
- Pin `digitalocean` (and any Cloudflare provider if later authorized) by exact version.
- Remote backend: DigitalOcean Spaces (S3-compatible) with **versioning enabled**.
- State locking: use the S3-compatible locking mechanism supported by the approved
  Terraform/OpenTofu + Spaces configuration; do not rely on Git for lock safety.
- Do **not** assume native DigitalOcean OIDC federation exists for GitHub; treat that as
  `UNVERIFIED` until separately proven.

### 7.3 Bootstrap dependency

Creating the private state bucket/key itself is a **bootstrap** problem: initial bucket
creation may require out-of-band Founder-operated steps before routine remote state
workflows. Document bootstrap as a one-time gated procedure; do not hide credentials in
the repo.

### 7.4 Separation from recovery backups (IA-03)

| Store | Purpose | Credentials |
|---|---|---|
| Terraform state Spaces (private, versioned) | IaC state only | State-scoped keys; CI/trusted apply only |
| IMP-037 backup Spaces | Database/recovery artifacts | Backup/recovery-scoped keys (existing recovery model) |

Physical and logical separation required. State credentials must not be the backup
credentials. Backup destruction must not be expressible as a routine Terraform apply.

### 7.5 Existing-resource import

Do **not** assume the DigitalOcean account is empty. Future work must inventory and
**import** existing Droplets, firewalls, Spaces, DNS-related resources, and SSH keys
before managed apply. Live inventory is **not invented** here (`REQUIRED_CLOUD_INVENTORY`
below).

### 7.6 Plan/apply and credential boundaries

```text
Untrusted pull requests: credential-free (ADR-002 PR validation principle)
Trusted workflows (Founder-authorized): may plan against live cloud with short-lived creds
Production apply: human approval boundary; never default on merge
No cloud plan/apply from this T0 documentation PR
```

### 7.7 Cost / drift / destruction guardrails

- Default paid additions forbidden without demonstrated need or Founder approval (ARCH-G26).
- Protect stateful resources (`prevent_destroy` / equivalent review gates) for Droplet
  volumes, Spaces backup buckets, and state buckets.
- Drift detection is observational until apply is authorized.
- Terraform must not become an accidental database wipe path.

## 8. Secure deployment / control-plane model (proposed)

```text
Developer PR
  → credential-free CI (lint/type/unit/integration/build/container validation)
  → merge to main (human)
  → trusted release-set build + digest publish to GHCR
    → seal IMMUTABLE_RELEASE_MANIFEST (future authorized workflow)
  → optional staging consume of exact sealed digests (D2 design remains separate; not D-375)
    → produce STAGING_VALIDATION_ATTESTATION (references sealed manifest; does not mutate it)
  → human production approval
    → produce PRODUCTION_APPROVAL_ATTESTATION (references sealed manifest + validation)
  → production Compose digest-only deploy on single Droplet (D-374)
    → produce DEPLOYMENT_RECORD (references manifest + attestations; records health)
  → Cloudflare D-375 trust chain remains production ingress
```

Distinctions that must not collapse:

- **D-375 production** proxied DNS + AOP + DO firewall ≠ **D2 staging Tunnel/Access**
- **GitHub Pages** marketing apex/www remains unchanged until explicit cutover
- **IMP-039** owns live production origin realization checklist; this proposal does not
  activate it
- **Rollback images** ≠ **IMP-037 database recovery**

## 9. Future implementation tranches (not authorized)

| Tranche | Intent | Authorization needed |
|---|---|---|
| **T0** (this document) | Design proposal + Founder direction record | Documentation PR only |
| **T1** | Release-set schema draft in-repo + CI validators that fail non-digest Compose refs in a **fixture**; no cloud | Explicit engineering authorization |
| **T2** | IaC skeleton + Spaces state bootstrap runbook + import plan from real inventory; `terraform plan` only under trusted auth | Founder + cloud-read authorization |
| **T3** | GHCR publish of multi-image release-set from `main`; staging consume proof | Registry + staging authorization |
| **T4** | Production digest-only Compose overlay + manual promote gate | Production change authorization |
| **T5** | IMP-039 origin/firewall realization as separately gated work | `IMP039_ACTIVATED` human gate |

```text
IMP039_ACTIVATED = NO
T1_AUTHORIZED = NO
```

## 10. Negative verification matrix (minimum future T1/T2)

| # | Negative assertion | Intended proof style |
|---|---|---|
| N1 | No runtime `build:` for app services in production Compose overlay | Static Compose policy test |
| N2 | Image references are digest-only (`@sha256:`) | Manifest + Compose fixture test |
| N3 | PostgreSQL port not published on public interfaces in production posture | Compose + firewall contract review |
| N4 | No unintended host ports for auth/commerce/operations | Compose config assert (`expose` only) |
| N5 | Effective Compose port override proof (local vs production files) | Overlay render test |
| N6 | No secrets or Terraform state in Git | Secret scan + path deny list |
| N7 | CI credentials ≠ production credentials; untrusted PRs have neither | Workflow permission review |
| N8 | No unapproved infrastructure apply | Workflow `environment` / manual gate |
| N9 | No automatic production release on merge | Workflow absence / required `workflow_dispatch` |
| N10 | Same sealed release-set digests + build-profile binding across promote | Manifest equality test |
| N11 | No production deployment from an unmerged PR | Gate on `main` + release-set provenance |
| N12 | Migration serialization + compatibility | Lock + ledger checks |
| N13 | Rollback image path ≠ database restore path | Runbook / gate wording tests |
| N14 | Cloudflare D-375 production origin trust unchanged by staging Tunnel design | Authority cross-check |
| N15 | D2 staging Tunnel design remains separate | Doc/authority cross-check |
| N16 | GitHub Pages marketing unchanged | DNS/docs non-goal check |
| N17 | No default paid infrastructure additions | Cost guardrail checklist |
| N18 | Validation/approval attestations do not mutate sealed manifest identity | Schema separation + hash-stability test |

## 11. Outstanding RED decisions

| Item | Status |
|---|---|
| IA-02 selection (Option A vs B vs hybrid) | `DECISION_REQUIRED` |
| Formal ADR-002 amendment adopting release-set language | `DECISION_REQUIRED` (not performed) |
| Formal decision-register row for infrastructure automation | `NOT_AUTHORIZED` this batch; do not reuse D-385–D-387 |
| Native DO↔GitHub OIDC feasibility | `UNVERIFIED` |
| Whether ephemeral cloud staging becomes required despite D-374 pilot rule | Unchanged: `NOT_REQUIRED_FOR_PILOT` unless Founder reopens |
| Live production firewall compensating controls for postgres publish | IMP-039 / production evidence gap |

## 12. Required cloud inventory (before any apply)

Do not invent live resources. Before T2 plan/apply, Founder-authorized inventory must list
at least:

- DigitalOcean account / team identity and region defaults
- Existing Droplets, volumes, images, SSH keys
- Existing Cloud Firewalls and rules
- Existing Spaces buckets (backup vs any other), keys, versioning, lifecycle
- Domains / DNS records touching `thebobabear.in` (Cloudflare vs DO)
- Any existing load balancers, reserved IPs, or App Platform leftovers
- GitHub Environments / secret names (names only in docs; no secret values)

## 13. Cost guardrails

- Retain D-374 steady-state target discipline (~Droplet + Spaces; vertical resize first).
- Terraform state Spaces should be minimal private storage; not a second backup regime.
- Reject default addition of DOKS, managed DBs, always-on duplicate Droplets, paid LBs,
  or always-on cloud staging without Founder approval.
- Cost deltas require explicit review in any future apply authorization.

## 14. Next authorization boundary

This T0 proposal ends at a **reviewed documentation PR**. Next steps each need a new
human authorization:

1. IA-02 proof campaign + Founder selection  
2. Formal ADR-002 / register amendment (new `D-` not colliding with #429/#488)  
3. T1 validators / fixtures  
4. Cloud inventory + T2 bootstrap  
5. IMP-039 activation for live origin realization (separate checklist)

```text
PR_MERGE_TO_MAIN = NOT_AUTHORIZED_BY_THIS_TASK_TEXT_ALONE
CLOUD_MUTATION = NOT_AUTHORIZED
IMP039_ACTIVATION = NOT_AUTHORIZED
ARCHITECTURE_LOCK_CLAIMED = NO
LIVE_CLOUD_READINESS_CLAIMED = NO
PRODUCTION_AUTHORIZATION_CLAIMED = NO
```
