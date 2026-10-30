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

Gate A has a designated hostname (`staging.thebobabear.in`). It still needs
authorized DNS, a certificate, a TLS termination token, secret-permission
remediation, and verified test payment credentials. The hostname designation
does not satisfy those remaining inputs.

Gate B needs an authorized read-only staging database preflight, a Founder
decision that binds restore proof to this database and volume, and a ledger
label mapping.

Gate C needs a fresh correlated image from a separately authorized preparation,
a complete preflight PASS, and explicit deployment authorization. Preparation
evidence alone does not open this gate.

Gate D is Founder Functional UAT, Founder Experience UAT, and formal acceptance.
None of these gates authorizes the next.
