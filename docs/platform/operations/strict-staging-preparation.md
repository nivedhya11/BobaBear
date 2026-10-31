# Strict staging preparation

Supporting operator contract for the Founder-approved strict-staging direction.
This document does not deploy staging, accept IMP-036J, accept IMP-037, or activate
IMP-038 or IMP-039.

```text
STRICT_STAGING_DIRECTION = FOUNDER_APPROVED
LIVE_STAGING_DEPLOYMENT = NOT_AUTHORIZED
RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY
CANDIDATE_PREPARATION_COMMAND = npm run env:staging:prepare-candidate
CANDIDATE_PREPARATION_EXECUTION = NOT_AUTHORIZED
ACTIVATION_REQUIRES_ASSERT_PREFLIGHT = YES
D3_PUBLISHING_ISOLATION = FOUR_STATE_POLICY
PUBLIC_STAGING_EXPOSURE = NOT_AUTHORIZED
DESIGNATED_STAGING_HOSTNAME = staging.thebobabear.in
DESIGNATED_STAGING_HTTPS_ORIGIN = https://staging.thebobabear.in
STAGING_HOSTNAME_APPROVAL_SCOPE = DESIGNATION_ONLY
STAGING_HOSTNAME_APPROVED_ON = 2026-10-29
STAGING_HOSTNAME_RECORD = SUPPORTING_OPERATOR_RECORD
MARKETING_APEX_AND_WWW = UNCHANGED
STAGING_DNS_CONTROL = UNVERIFIED
STAGING_INGRESS = UNAUTHORIZED
STAGING_TLS = UNVERIFIED
D2_DESIGN_DIRECTION = APPROVED
D2_APPROVED_ON = 2026-10-30
D2_APPROVAL_SCOPE = DESIGN_ONLY
D2_INGRESS = CLOUDFLARE_TUNNEL
D2_ACCESS = CLOUDFLARE_ACCESS_RESTRICTED
D2_HOSTNAME = staging.thebobabear.in
D2_RUNTIME_TARGET = EXISTING_WSL_PODMAN_STAGING
D2_RECORD = SUPPORTING_OPERATOR_DESIGN_EVIDENCE
D2_DECISION_REGISTER_STATUS = NOT_CURRENT_REGISTER_ENTRY
D2_DETAIL = docs/platform/operations/d2-restricted-cloudflare-tunnel-design.md
```

## Designated staging hostname

On 29 October 2026 the Founder approved `staging.thebobabear.in` as BOBA Bear's
designated staging hostname. The intended HTTPS origin is
`https://staging.thebobabear.in`.

The approval designates that name only. It does not verify DNS control, create
or change DNS records, select ingress, issue or install a certificate, name a
TLS termination token, expose staging publicly, run
`npm run env:staging:prepare-candidate`, or run `npm run env:staging:deploy`.
`LIVE_STAGING_DEPLOYMENT`, `CANDIDATE_PREPARATION_EXECUTION`, and
`PUBLIC_STAGING_EXPOSURE` stay `NOT_AUTHORIZED`.

Marketing publication on `thebobabear.in` and `www.thebobabear.in` (GitHub Pages
`gh-pages`) is unchanged by this designation. It does not adopt the amended
historical ADR-002 prose that mapped `staging.thebobabear.in` to DigitalOcean
staging. That line is not current pilot authority. Permanent always-on cloud
staging remains not required for the pilot (D-374 / ADR-016 / ARCH-G26).

This section is a supporting operator record. It is not a decision-register
entry, it does not assign a `D-` identity, and it does not change D3 publishing
classification, ROADMAP, or STATE.

## D2 restricted Cloudflare Tunnel design (design-only)

On 30 October 2026 the Founder approved the D2 staging ingress **design
direction** only:

```text
D2_INGRESS = CLOUDFLARE_TUNNEL
D2_ACCESS = CLOUDFLARE_ACCESS_RESTRICTED
D2_HOSTNAME = staging.thebobabear.in
D2_RUNTIME_TARGET = EXISTING_WSL_PODMAN_STAGING
D2_APPROVAL_SCOPE = DESIGN_ONLY
```

Intended chain (not operationally verified here):

```text
Founder browser
→ Cloudflare HTTPS
→ Cloudflare Access (deny-by-default; explicit Founder identity)
→ Cloudflare Tunnel
→ WSL Podman Nginx (:8080 HTTP origin listener)
→ BOBA application services
```

This approval does **not** authorize tunnel creation or activation, Cloudflare
Access account setup, DNS mutations, certificate issuance, TLS allowlist tokens,
provider credentials, runtime modifications, candidate preparation, staging
deployment, public staging publication, or Access Bypass / public webhook
exceptions. `STAGING_INGRESS` remains `UNAUTHORIZED`. `STAGING_TLS` remains
`UNVERIFIED`. `PUBLIC_STAGING_EXPOSURE` and `LIVE_STAGING_DEPLOYMENT` stay
`NOT_AUTHORIZED`. D3 four-state publishing isolation is unchanged; this design
does not grant `STAGING_PUBLIC_AUTHORIZED`.

Founder-approved **restricted Cloudflare Access** on a DNS-published
`staging.thebobabear.in` route is **not** “unpublished” or private staging for D3.
It can still produce **positive staging-exposure observations** classifiable as
`STAGING_PUBLIC_UNAUTHORIZED` without a separate Founder staging-publication
contract. Restricted Access does **not** satisfy `STAGING_PUBLIC_AUTHORIZED` and
does not replace independent D3 evidence.

Production ingress remains D-375 / ADR-017 (Cloudflare proxied DNS → DigitalOcean
origin trust). This D2 record is Founder **staging** design evidence only and does
not amend ARCH-G or allocate a decision-register `D-` identity (D-385 / D-386 /
D-387 stay reserved by other open proposals).

Detailed topology, origin-trust compatibility, rejected unsafe approaches, and
the webhook / Access RED decision package live in
[`d2-restricted-cloudflare-tunnel-design.md`](./d2-restricted-cloudflare-tunnel-design.md).

## IA-02 pilot build-profile Founder selection — supporting record (31 October 2026)

On 31 October 2026 the Founder explicitly selected the IA-02 pilot build-profile
direction and two companion choices. This section is **supporting operator
evidence** of those already-made selections. It is not a decision-register
entry, does not assign a `D-` identity, does not amend ROADMAP / STATE /
ARCHITECTURE / ADR-002 / ADR-015, and does not grant staging publication,
candidate preparation, deployment, merge, or Founder UAT authority.

Closed Founder selections (31 October 2026):

| Decision | Recorded selection |
|---|---|
| IA-02 | **Option A** — one canonical immutable build profile for the pilot |
| Pre-UAT analytics | **A0** — Google Analytics disabled |
| Production-canonical SEO on staging | **ACCEPTED_WITH_CONDITIONS** |

```text
IA02_FOUNDER_SELECTION = OPTION_A
PRE_UAT_ANALYTICS = A0_GA_OFF
PRODUCTION_CANONICAL_SEO_ON_STAGING = ACCEPTED_WITH_CONDITIONS
SEO_CONDITIONS_PASSED = NO
IA02_CANONICAL_RECORDING = PENDING
STAGING_READINESS = BLOCKED
PR512_MERGE = NOT_AUTHORIZED
STAGING_PUBLICATION = NOT_AUTHORIZED
CANDIDATE_PREPARATION = NOT_AUTHORIZED
STAGING_DEPLOYMENT = NOT_AUTHORIZED
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
IMP039_ACTIVATED = NO
IA02_RECORD = SUPPORTING_OPERATOR_SELECTION_EVIDENCE
IA02_DECISION_REGISTER_STATUS = NOT_CURRENT_REGISTER_ENTRY
```

Option A semantics recorded here:

- Build the canonical public configuration once for an approved release candidate.
- Preserve the exact immutable digest **for each application runtime service
  image** when promoting that service across environments. Different services
  do not need to share one universal digest.
- Production-canonical site URL: `https://thebobabear.in`.
- Staging runtime public/auth origin: `https://staging.thebobabear.in`, subject
  to existing strict-staging agreement requirements.
- Google Analytics disabled during restricted pre-UAT, including GA-off CSP
  selection.
- Google Maps key and its multi-host restrictions remain subject to verification.
- A later GA-enabled build requires a new release-set and applicable
  privacy/measurement authorization.
- Do not claim that the proposed PR #512 release-set format is already binding.

SEO conditional acceptance is conditional on all of the following. **None of
these conditions is deemed passed by this record:**

1. Verified restricted Cloudflare Access and origin isolation.
2. A separate Founder D3 staging-publication contract.
3. No unauthorized unauthenticated or search-engine access to staging.
4. Correct HTTPS, cookies, redirects and trusted-origin handling.
5. Completion of required security and operational evidence.

Status distinction preserved by this record:

- Founder selection: **complete** (Option A / A0 / SEO ACCEPTED_WITH_CONDITIONS).
- Supporting-document publication: pending until the documentation PR that
  carries this section merges.
- Canonical decision-register recording: still **PENDING** (`FD-01`).
- Operational security evidence: **incomplete**.
- Staging readiness: **BLOCKED**.

Decision-ID collision preservation: CURRENT `main` is DR-25 and states next
register ID D-385, but open PR #429 proposes D-385 / D-386 (DR-26) and open
PR #488 proposes D-387 (DR-27). This supporting record MUST NOT assign D-385,
D-386, or D-387 to IA-02. D-388 is not assumed available without a fresh
coordinated decision-allocation review. Held PRs #429, #488, and #512 are not
rebased, cherry-picked, or merged by this record. Supporting Founder-selection
evidence remains distinct from a CURRENT binding decision-register entry.

### C2 outstanding Founder decision queue (tracking labels only)

The `FD-*` identifiers below are **tracking labels only**. They are not
`D-xxx` decision-register identities and are not a new source of binding
decisions. Existing C2 evidence and the canonical staging authorities above
remain controlling. No selection is made here.

| ID | Subject | Status |
|---|---|---|
| FD-01 | Canonical IA-02 decision-register integration | PENDING |
| FD-02 | D3 restricted staging-publication authorization | DECISION_REQUIRED |
| FD-03 | Staging TLS termination trust/allowlist | DECISION_REQUIRED |
| FD-04 | Tunnel peer, client-IP and HTTPS forwarding trust | RED / DECISION_REQUIRED |
| FD-05 | Direct-port isolation and held PR #428 | PENDING |
| FD-06 | PAY-D1 P1–P4 payment/webhook strategy | DECISION_REQUIRED |
| FD-07 | AUTH-D1 approved customer OTP provider | DECISION_REQUIRED |
| FD-08 | Four staging recovery-proof bindings | DECISION_REQUIRED |
| FD-09 | Authorized read-only live volume/system identity evidence | NOT_VERIFIED |
| FD-10 | AD-PF-01/02 PR #429 integration and measurements | PENDING |
| FD-11 | Live Maps browser-key restrictions | NOT_VERIFIED |
| FD-12 | Separate prepare, preflight, publication, deployment and UAT authorizations | NOT_AUTHORIZED |

Exact operational non-authorizations unchanged by this supporting record:

```text
STAGING_PUBLICATION = NOT_AUTHORIZED
CANDIDATE_PREPARATION = NOT_AUTHORIZED
STAGING_DEPLOYMENT = NOT_AUTHORIZED
LIVE_STAGING_DEPLOYMENT = NOT_AUTHORIZED
PUBLIC_STAGING_EXPOSURE = NOT_AUTHORIZED
PR512_MERGE = NOT_AUTHORIZED
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
IMP039_ACTIVATED = NO
```

## Publishing isolation (D3 Option A)

Preflight classifies repository publishing with four states. The states are derived
from independently established observations; they are not operator-selectable flags.

1. `PUBLISHING_UNKNOWN_OR_CONFLICTING` — missing, stale, mismatched, or contradictory
   workflow/Pages/origin evidence. **Blocks** the publishing category.
2. `STAGING_PUBLIC_UNAUTHORIZED` — positively observed staging exposure without a
   Founder staging-publication contract. **Blocks**.
3. `STAGING_PUBLIC_AUTHORIZED` — only when a separate Founder exposure contract and
   matching observations agree. **Not granted** by the present D3 approval.
4. `PUBLIC_MARKETING` — verified authorized static marketing publication
   (`thebobabear.in` / GitHub Pages `gh-pages`) with no unauthorized or conflicting
   staging exposure.

A GitHub Pages workflow file that triggers on `main` is not, by itself, a staging
publishing violation. Workflow YAML trigger text is distinct from the GitHub Actions
operational state. A manually disabled workflow does not prove already-published
Pages content is gone. Public marketing may satisfy the publishing-isolation
category without authorizing staging exposure, candidate preparation execution, or
deployment. Publishing-category PASS never promotes whole-preflight PASS.

## Identities

1. Authoritative source repository: `/home/ajoshi/repos/boba-bear-platform`.
2. Independently accepted Git commit and tree: pinned `refs/heads/main` on
   `nivedhya11/BobaBear`, equal to local `HEAD` and `HEAD^{tree}`.
3. Isolated artifact context: a disposable `git archive` under the system temp
   directory, verified, then removed. It is not the protected checkout.
4. Candidate image: built only by the separate preparation command, from that
   archive, then scanned. The evidence record binds source SHA, source tree,
   image id, and digest. It is written outside the protected checkout.
   Preparation does not authorize deployment.
5. Running staging container: must match that recorded revision and image id.
   Project `boba-staging`. Volume `boba-staging_postgres-data` is preserved.
   Activation does not build a new image.

`protectedCheckoutUsed` is true when the artifact context realpath is inside the
canonical checkout. A dry-run from that checkout can still observe an isolated
context. An operator boolean cannot set the flag false.

## Two phases

Phase A is `npm run env:staging:prepare-candidate`. It checks source isolation,
strict configuration, and the current publishing policy, then may materialize a
verified archive, build candidate images, scan them, and write image-security
evidence outside the protected checkout. It does not call
`assertPreflightAllowsDeployment`. It does not stop containers, migrate,
bootstrap, or compose up. `PREPARATION_ELIGIBLE` is not deployment
authorization. Running the command is not authorized by this document.

Phase B is `npm run env:staging:deploy`. Activation (stop, env write, migrate,
bootstrap, compose up) runs only after `assertPreflightAllowsDeployment`.
Full preflight requires image-security evidence bound to this source SHA, tree,
image id, and digest, and a fresh inspect that matches that evidence. Missing,
stale, or rebound evidence blocks activation before any runtime mutation.
Preflight does not build images. Activation does not build a replacement image
after that gate. Source CI does not supply image-security proof.

## Strict environment

When `BOBA_BEAR_ENV=staging`, projection requires one HTTPS non-loopback origin
shared by `BOBA_BEAR_PUBLIC_ORIGIN`, `BOBA_BEAR_AUTHORIZED_STAGING_ORIGIN`,
`CUSTOMER_AUTH_BASE_URL`, and `WORKFORCE_AUTH_BASE_URL`; explicit
`BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS=false`; a release; trusted-proxy hops `1`;
and `BOBA_BEAR_STAGING_TLS_TERMINATION` equal to a shipped allowlist entry.

The shipped allowlist is empty. A token in that allowlist is a configuration
assertion, not independent DNS or TLS evidence. The designated hostname above
is a name selection only. DNS authority, certificate method, and TLS
termination point are not invented here and are not authorized by that
designation. Local
`docker:env:init` remains the local contract and is not a staging fallback.
Every runtime service must carry the same valid public origin; a missing or
malformed service origin is not ignored when other services agree.

## Recovery and database

The live collector keeps `RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY`. A
qualifying backup record is not a staging restore checkpoint. The checkpoint
qualifier can accept a complete synthetic chain only in isolated tests, and
that result has no operational authority.

Locked rules already applied by that qualifier:

- Both IMP-037 layers, linked by backup `RUN_ID` and artifact checksum.
- Fresh run-owned PostgreSQL 18 recovery target, distinct from `boba-staging`.
- Image rollback or forward correction. Database restore is not routine rollback.
- Exact candidate SHA and tree. Unknown migration ledger labels block.
- Existing Layer 1 / Layer 2 / RPO age limits, rechecked at evaluation time.

These Founder decisions remain, so the live binding cannot pass:

- `STAGING_EVIDENCE_ROOT_UNNAMED` — proposed private root is not selected.
- `STAGING_DATABASE_VOLUME_IDENTITY_UNBOUND` — volume name is known; the live
  cluster system identifier has not been observed.
- `STAGING_FRESHNESS_WINDOW_UNDECIDED` — no extra staging restore-proof window
  is adopted here.
- `LEDGER_STATE_MAPPING_UNDECIDED` — hash comparison is not a known-safe label.

Database probes that compare migration hashes do not emit `APPLIED_CURRENT` or
`LEDGER_CURRENT`. Duplicate auth-account checks return a group count only and
are not run against the persistent staging database by this preparation change.

## Secret files

New secret files are created mode `0600`. Existing insecure files are rejected
and not chmodded by preflight or by the staging copy. Separate authorization is
required before anyone changes live permissions. That later action is limited to
`lstat`, then `chmod 600` on a regular file or `chmod 700` on `.env.staging`,
then `lstat` again. Do not print file contents. Paths:

- `/home/ajoshi/repos/boba-bear-platform/.env.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.runtime.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.migration.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.customer-auth.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.workforce-auth.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.customer-commerce.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.operations.docker.local`
- the same names under `/home/ajoshi/repos/boba-bear-platform/.env.staging/`

## Payment

Staging `razorpay` accepts only a `rzp_test_` key id with the existing secret
fields. `rzp_live_` and ambiguous key ids fail before an HTTP client is built.
Production acceptance of either key prefix is unchanged. `disabled` still
cannot seal an order.

## Gates that remain closed

Gate A has a designated hostname (`staging.thebobabear.in`) and a Founder-approved
D2 **design** direction (Tunnel + restricted Access). It still needs authorized
DNS, an operational ingress realization, a certificate / TLS termination token,
secret-permission remediation, verified test payment credentials, and a separate
webhook / machine-callback strategy under Access constraints. The hostname
designation and D2 design-only approval do not satisfy those remaining inputs.

Gate B needs an authorized read-only staging database preflight, a Founder
decision that binds restore proof to this database and volume, and a ledger
label mapping.

Gate C needs a fresh correlated image from a separately authorized preparation,
a complete preflight PASS, and explicit deployment authorization. Preparation
evidence alone does not open this gate.

Gate D is Founder Functional UAT, Founder Experience UAT, and formal acceptance.
None of these gates authorizes the next.
