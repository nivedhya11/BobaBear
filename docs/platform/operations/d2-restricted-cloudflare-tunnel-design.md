# D2 restricted Cloudflare Tunnel design (Founder design-only)

Supporting design evidence for the Founder-approved D2 staging ingress direction.
This document does **not** configure Cloudflare, mutate DNS, issue certificates, allocate a
`D-` identity, amend ARCH-G / D-375 production ingress, authorize staging publication,
candidate preparation, or staging deployment.

```text
D2_DESIGN_DIRECTION = APPROVED
D2_APPROVED_ON = 2026-10-30
D2_APPROVAL_SCOPE = DESIGN_ONLY
D2_INGRESS = CLOUDFLARE_TUNNEL
D2_ACCESS = CLOUDFLARE_ACCESS_RESTRICTED
D2_HOSTNAME = staging.thebobabear.in
D2_RUNTIME_TARGET = EXISTING_WSL_PODMAN_STAGING
D2_RECORD_AUTHORITY = SUPPORTING_OPERATOR_DESIGN_EVIDENCE
D2_DECISION_REGISTER_STATUS = NOT_CURRENT_REGISTER_ENTRY
D2_D_NUMBER = NOT_ALLOCATED
STAGING_INGRESS_OPERATIONS = UNAUTHORIZED
PUBLIC_STAGING_EXPOSURE = NOT_AUTHORIZED
STAGING_PUBLIC_AUTHORIZED = NOT_GRANTED_BY_THIS_DESIGN
LIVE_STAGING_DEPLOYMENT = NOT_AUTHORIZED
CANDIDATE_PREPARATION_EXECUTION = NOT_AUTHORIZED
```

## Authority status

| Claim | Status |
|---|---|
| Founder approved this design direction on 2026-10-30 | Recorded here + [`strict-staging-preparation.md`](./strict-staging-preparation.md) |
| Decision-register `CURRENT` binding entry | **No** — not claimed; D-385 / D-386 / D-387 remain reserved elsewhere |
| Material ARCH-G / D-375 production supersession | **Not performed** — D-375 remains CURRENT pilot **production** ingress |
| Operational verification (live tunnel / Access / DNS / TLS) | **Not performed** — DESIGN_ONLY |
| Satisfies `STAGING_PUBLIC_AUTHORIZED` | **No** |

If a future batch requires a formal decision-register row or a material ARCH-G change for
staging Tunnel topology, stop that scope and raise `DECISION_REQUIRED`. Do not invent a
`D-` identity while open proposals reserve D-385 through D-387.

## Selected design chain

```text
Founder browser
  → Cloudflare HTTPS (edge TLS)
  → Cloudflare Access (deny-by-default; explicit Founder allow)
  → Cloudflare Tunnel (encrypted connector transport)
  → WSL Podman cloudflared → local Nginx :8080 (HTTP origin listener)
  → BOBA Compose services (customer-auth / workforce-auth / customer-commerce / operations)
```

Distinguish three layers that must not be conflated:

1. **Edge TLS** — browser to Cloudflare HTTPS for `staging.thebobabear.in`.
2. **Encrypted Tunnel transport** — Cloudflare edge to the local `cloudflared` connector.
3. **Local origin-service protocol** — current BOBA Nginx listens HTTP on container port
   `8080` (`docker/nginx/nginx.conf`); Compose publishes the app service host port
   (`BOBA_BEAR_APP_HOST_PORT`, default `8080`). Auth/commerce/operations stay
   Compose-internal (`expose` only).

## Cloudflare topology requirements (design)

Official Cloudflare One documentation (self-hosted public app + Tunnel origin parameters)
supports this pattern. Design requirements for any future authorized realization:

| Requirement | Design rule |
|---|---|
| Access before published route | Create the Access application for `staging.thebobabear.in` **before** publishing the Tunnel hostname route. Cloudflare warns that a published hostname without Access is Internet-reachable. |
| Deny-by-default | Access applications deny by default; only explicit Allow policies grant entry. |
| Founder identity / IdP | Allow only explicitly named Founder (and any separately authorized UAT) identities via a selected IdP. IdP choice, seat count, and MFA settings are **UNVERIFIED** operational prerequisites. |
| No blanket Everyone / Bypass | Reject account-wide Everyone allow and Access Bypass policies for this hostname. |
| Connector JWT validation | Enable Protect with Access / `originRequest.access.required=true` with `teamName` + Access application `audTag` so `cloudflared` validates `Cf-Access-Jwt-Assertion` before proxying to Nginx. |
| Single staging hostname | Only `staging.thebobabear.in`. Do not publish sibling staging hostnames in this design. |
| Marketing apex / www | `thebobabear.in` / `www.thebobabear.in` GitHub Pages marketing stays unchanged. |
| No account-wide Access policy rewrite | Scope policies to this Access application / hostname only. |
| Restricted ≠ unpublished | Access-gated DNS publication is still a form of staging exposure observation. It does **not** equal `STAGING_PUBLIC_AUTHORIZED` and does not silence D3 four-state classification. |

Citations (external, non-authoritative for BOBA lifecycle):

- <https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/>
- <https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/origin-parameters/>

## Origin-trust compatibility (repository-demonstrated vs future proof)

### Demonstrated in repository today

| Topic | Evidence | Tag |
|---|---|---|
| Nginx HTTP `:8080`; no TLS termination in app Nginx | `docker/nginx/nginx.conf` | VERIFIED |
| XFF **replace** with `$remote_addr` after `real_ip`; never append | `nginx.conf`; `npm run origin-trust:verify` | VERIFIED |
| `real_ip_header CF-Connecting-IP` + Cloudflare CIDRs only | `docker/nginx/cloudflare-real-ip.conf` | VERIFIED |
| Upstream auth/commerce/ops not published on host ports | `compose.yaml` (`expose` only) | VERIFIED |
| Staging projection requires shared HTTPS origin + `TRUST_PROXY_HOPS=1` | `scripts/environment/staging-config-projection.mjs` | VERIFIED |
| `STAGING_TLS_TERMINATION_ALLOWLIST` shipped empty | same module; tests assert `[]` | VERIFIED |
| Production trust chain (proxied DNS → Full strict + AOP → DO firewall → Nginx) | ARCHITECTURE §3.2 / D-375 / ADR-017 | VERIFIED (production; not this staging design) |

### Compatibility gaps that remain future operational / RED work

These are **not** solved by this design-only approval. This batch must not invent TLS
allowlist tokens or weaken certificate / proxy-trust rules.

1. **Direct-port isolation** — Compose still defaults to publishing app `:8080` on the host.
   Tunnel design assumes operators keep direct host exposure loopback-only or otherwise
   unreachable from the public Internet. Live isolation is **UNVERIFIED** here.
2. **Cloudflared → Nginx trust boundary** — Production assumes the TCP peer is a Cloudflare
   edge address covered by `set_real_ip_from`. A local connector peer is typically a
   host/container address **outside** those CIDRs, so `CF-Connecting-IP` will not rewrite
   `$remote_addr` under the current fragment. Client-IP derivation for abuse controls under
   Tunnel therefore needs a separate Founder-authorized trust design before operations.
3. **HTTPS scheme preservation** — Nginx sets `X-Forwarded-Proto $scheme`. On the HTTP
   `:8080` listener `$scheme` is `http`, which conflicts with strict-staging’s shared HTTPS
   public-origin contract unless a future authorized hop preserves edge HTTPS (without
   inventing tokens in this batch).
4. **TLS termination allowlist** — Empty allowlist keeps projected staging config **INVALID**.
   Naming a token remains a Founder RED configuration decision and is **not** DNS/TLS proof.
5. **Spoof rejection** — Config negatives exist (`origin-trust:verify` rejects world-open
   `set_real_ip_from`, asserts XFF replace). Live Tunnel spoof/direct-origin proof is
   **NOT** demonstrated and remains future operational evidence.

## D3 publishing isolation

D3 Option A four-state classification is preserved:

1. `PUBLISHING_UNKNOWN_OR_CONFLICTING`
2. `STAGING_PUBLIC_UNAUTHORIZED`
3. `STAGING_PUBLIC_AUTHORIZED`
4. `PUBLIC_MARKETING`

This D2 design selection is **not** a Founder staging-publication contract. It does **not**
satisfy `STAGING_PUBLIC_AUTHORIZED`. Restricted Access on a DNS-published hostname can still
produce staging-exposure observations that D3 must classify from independent evidence.

## Customer / workforce auth under Access

**INFERRED (design):** After Cloudflare Access allows a Founder browser session, BOBA customer
and workforce login continue on `https://staging.thebobabear.in` using existing app cookies and
auth redirects against the shared public origin. Access is an outer gate; it does not replace
BOBA identity.

**Risks requiring future proof (not demonstrated here):** Access login redirects vs BOBA auth
redirects, cookie `Secure` / host scope if scheme preservation fails, and workforce vs customer
session coexistence behind the same Access application.

## Payment webhook and machine-callback package (Founder RED)

Razorpay webhook ingress remains
`POST /api/integrations/payments/razorpay/webhook` on `customer-commerce` via the exact Nginx
location `location = /api/integrations/payments/razorpay/webhook` in `docker/nginx/nginx.conf`
(D-361 / D-363), proxied to `customer-commerce`. Signature verification and durable inbox
remain application-authoritative.

Cloudflare Access authenticates human browsers. Provider webhooks are machine callers and
**cannot** complete Access interactive login. Provider callbacks also will not present a valid
`Cf-Access-Jwt-Assertion` for Protect with Access / `originRequest.access.required=true` at
the Tunnel connector, so they fail before that Nginx location. Under the explicit constraints
of this gate:

```text
NO_ACCESS_BYPASS_AUTHORIZED = YES
NO_PUBLIC_CALLBACK_EXCEPTION_AUTHORIZED = YES
NO_NEW_WEBHOOK_SERVICE_AUTHORIZED = YES
NO_EXTERNAL_EXPOSURE_AUTHORIZED = YES
```

**Compatibility conclusion (design analysis):** Live inbound Razorpay (and any similar
machine-to-machine) callbacks to the Access-protected staging hostname are **incompatible**
with those constraints. This design therefore does **not** authorize webhook delivery to
staging over the restricted hostname.

### Rejected unsafe approaches (this gate)

| Approach | Why rejected |
|---|---|
| Access Bypass or “Everyone” on webhook path / hostname | Forbidden by design constraints; collapses deny-by-default |
| Public callback exception / second public URL | Forbidden; would be unauthorized staging exposure |
| New dedicated webhook service or broker | Forbidden; conflicts with D-361–D-363 no-new-service posture |
| Unauthenticated Internet exposure of host `:8080` | Unauthorized direct-origin exposure |
| Treating D2 design as `STAGING_PUBLIC_AUTHORIZED` | False; D3 requires a separate Founder exposure contract + matching observations |
| Inventing `BOBA_BEAR_STAGING_TLS_TERMINATION` tokens | Forbidden in this batch |
| Allocating D-385 / D-386 / D-387 for this record | Reserved by other open proposals |
| Claiming D-375 production Tunnel supersession | Out of scope; production remains ADR-017 / D-375 |

### Remaining Founder-selectable directions (decision package only)

None of the following is selected or implemented by this document:

1. **Keep Access-restricted browser UAT** and rely on existing secondary recovery /
   reconciliation paths (`reconcilePaymentAttempt` / `queryExecution`,
   `recoverMissingOrdersBatch` / operator recovery) instead of live staging webhooks.
2. **Disable payment sealing** on staging for the Access-restricted window (test keys already
   constrained; sealing policy remains separate).
3. **Defer any staging payment proof** that requires provider→origin HTTP until a later
   Founder-authorized ingress exception model exists (would require lifting one of the
   `NO_*` constraints above — RED).
4. **Separately authorize** a future webhook ingress design (would be a new RED decision;
   not this DESIGN_ONLY approval).

## Operational prerequisites (still closed)

Before any future authorized realization, Founder / operators must still resolve at least:

- DNS control for `staging.thebobabear.in` (full vs partial/CNAME zone) — **UNVERIFIED**
- Cloudflare account, Zero Trust / Access seat and plan fit — **UNVERIFIED**
- Explicit Founder IdP identity binding (no Everyone / Bypass)
- Access application **before** Tunnel published hostname
- Connector-side Access JWT validation enabled
- Direct host-port isolation evidence for Nginx `:8080`
- Scheme-preservation and client-IP trust design compatible with empty-or-future TLS
  allowlist rules (no invented tokens here)
- Separate staging-publication contract if D3 `STAGING_PUBLIC_AUTHORIZED` is ever required
- Webhook / payment-proof strategy from the RED package above
- Candidate preparation, deploy, and Founder UAT remain separately unauthorized

## Negative cases (documentation review expectations)

Future operational proof (not claimed here) must include negatives for:

- Direct origin / host-port reachability without Tunnel + Access
- Spoofed `CF-Connecting-IP` / `X-Forwarded-For` from untrusted peers
- Missing Access identity (unauthenticated browser)
- Missing connector JWT validation (Tunnel without Protect with Access)
- Treating D2 design approval or Access restriction as staging publishing-category PASS or as granting STAGING_PUBLIC_AUTHORIZED
