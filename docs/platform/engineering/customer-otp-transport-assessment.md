---
Status: NON-AUTHORITATIVE ASSESSMENT
Authority: NONE
Retrieved: 2026-10-30
Source HEAD observed: 995e343dd5ed52ebb066de560a7bb57c218bb11d
Source tree observed: a0fed6a5cd727a6134c07369f87a41c176919cee
---

# Customer OTP transport fit

```text
AUTHORITY = NON_AUTHORITATIVE
PROVIDER_SELECTED = NO
LIVE_PROVIDER_ACTIVATION = NOT_AUTHORIZED
FORMAL_REGISTER_STATUS = NOT_CURRENT
DECISION_REGISTER_ROW_ADDED = NO
MSG91_GET_VERIFY = BLOCKED
STAGING_AND_PRODUCTION_OTP = FAIL_CLOSED
```

This note records Founder transport evidence and compares public provider contracts with
the accepted BOBA customer-auth path. It does not select a provider, allocate a decision
ID, authorize credentials, DLT registration, SMS, staging, or deployment, or change
runtime behaviour.

Binding identity and session authority remain
[`ADR-004`](../decisions/ADR-004-identity-authentication-sessions.md) and
[`decision-register.md`](../decision-register.md) (DR-25). Accepted operating constraints
remain [`accepted-foundation-operating-rules.md`](../accepted-foundation-operating-rules.md).
Current lifecycle remains [`ROADMAP.md`](../ROADMAP.md) and [`STATE.md`](../STATE.md).

## 1. Founder evidence and register status

On 29 October 2026 the Founder set `OTP_TRANSPORT_POLICY = OPTION_A_APPROVED`.

Sensitive OTP verification values, phone verification data, and provider credentials
must not be transmitted in URL paths or query parameters. MSG91 GET-based Verify remains
blocked. A future provider path must demonstrate secure HTTPS server-side transport,
sensitive values outside URLs, and preservation of accepted BOBA authentication and
session security.

That approval does not select MSG91, the MSG91 OTP Widget, Exotel, Twilio, or another
provider.

DR-25 says the next register ID is D-385. Open PR #429 reserves D-385 and D-386. Open
PR #488 stages D-387. This assessment does not use those IDs and does not invent a later
one. Formal registration is `DECISION_REQUIRED`. GitHub does not yet show Option A as a
CURRENT decision.

The same evidence is noted on ADR-004 and in the IMP-009 foundation rules. Those notes
are evidence and operating context. They are not a substitute register row.

## 2. Accepted BOBA roles

Verified from the tree above. No runtime file was changed for this assessment.

| Role | Owner | What the source does |
|---|---|---|
| OTP generation | BOBA customer-auth router | `generateNumericOtp` draws a six-digit code with `crypto.randomInt` and passes it to `startVerification`. Length is `CUSTOMER_OTP_LENGTH = 6`. Lifetime is `CUSTOMER_OTP_EXPIRES_IN_SECONDS = 300`. |
| Challenge check | Injected `CustomerOtpProvider` | `checkVerification` receives the phone and the submitted code. Outcomes are `approved`, `invalid`, `expired`, `too_many_attempts`, or `unavailable`. |
| Local challenge state | In-process local provider | Allowed only in `local` / `test` / `ci`. One memory record per phone. A later start replaces that phone's record. Success, expiry, and exhaustion delete it. Comparison is timing-safe. No PostgreSQL OTP table. |
| Attempt cap in code | Provider constant | `CUSTOMER_OTP_ALLOWED_ATTEMPTS = 3`. |
| Send spacing in code | Rate-limit rule and HTTP hint | `otp_send_phone_60s` allows 1 request per 60 seconds. The send response's `retryAfterSeconds` is 60. |
| ADR-004 initial figures | Accepted ADR text | Initial policy table says 5 verification attempts and a 30-second minimum resend. Those figures are not edited here. The 3-versus-5 and 60-versus-30 differences stay unresolved. |
| Session issuance | Better Auth | `verifyOtp` calls `auth.api.verifyPhoneNumber` with `disableSession: false`. The Set-Cookie values from that call are the session. |
| Provider result seam | Better Auth `verifyOTP` callback | `src/server/auth/customer/options.ts` returns `true` only when the provider outcome is `approved`. Every other outcome becomes `false`. |
| Error mapping | customer-auth router and Better Auth 1.7.14 | `mapVerifyPhoneNumberError` would map Better Auth `TOO_MANY_ATTEMPTS` to `OTP_ATTEMPTS_EXHAUSTED` (403), and `INVALID_OTP`, `OTP_EXPIRED`, or `OTP_NOT_FOUND` to `OTP_INVALID_OR_EXPIRED` (401). A thrown `CustomerOtpProviderError` becomes `OTP_DELIVERY_UNAVAILABLE` (503). The installed `verifyOTP` callback does not produce those other Better Auth codes. Every non-approved provider outcome returns `false`, and the phone-number plugin then throws only `INVALID_OTP`. Returned `expired`, `too_many_attempts`, and `unavailable` therefore reach the client as `OTP_INVALID_OR_EXPIRED` (401) unless the provider throws. |
| Customer edge | customer-auth HTTP | Send and verify are POST JSON. Query names `phoneNumber`, `phone`, `code`, and `otp` are rejected. The login client keeps the phone and code in component state. `returnTo` is the only search parameter it reads. |
| Logs | customer-auth service | The request log is `requestId`, `operation`, `safeOutcomeCode`, `httpStatus`, `durationMs`, optional `rateLimitScope`, and `providerKind`. |
| Abuse controls | BOBA, before the provider | Hashed phone and IP rate limits, a progressive cooldown ladder, and Turnstile when `challengeRequired` is set. Turnstile is Cloudflare siteverify plus a redemption ledger. It is not a provider captcha. |
| Production gate | Provider factory | `staging` and `production` call `assertProductionCustomerOtpProviderReady`, which always throws `CUSTOMER_OTP_PRODUCTION_PROVIDER_UNAVAILABLE`. `CustomerOtpProviderKind` remains `"local" \| "disabled"`. |
| Inactive MSG91 module | Not selected | `createInactiveMsg91CustomerOtpProvider` never calls `fetch`. Send, verify, and resend assessments always return a block. `checkReadiness` throws the production-unavailable code. |

There is no global SMS budget or human send shutoff in this path. Adding one is a
separate decision.

The provider interface returns no challenge identifier. A provider that requires a
`reqId` or `verification_id` between send and check does not fit this interface without
a further architecture decision. This assessment does not authorize a new OTP table or
any other new persistence.

## 3. How the contracts were read

Primary pages and OpenAPI documents were fetched on 2026-10-30. No vendor account was
created, no API key was used, and no OTP endpoint was called.

MSG91 standard OTP and the MSG91 OTP Widget are different products, hosts, and
contracts. They are not interchangeable.

POST is not treated as sufficient. Parameter placement, credential placement, HTTPS,
challenge ownership, and session ownership are separate questions.

A provider JWT or access token is not a BOBA session.

## 4. Candidate contracts

### A. MSG91 standard OTP — incompatible

| Operation | Contract | Placement |
|---|---|---|
| SendOTP | `POST https://control.msg91.com/api/v5/otp` | `mobile` and `template_id` are query parameters. The description also places `otp`, `otp_length`, and `otp_expiry` in the query string. `authkey` is a header. The JSON body is template parameters, not the phone or the OTP. |
| Verify OTP | `GET https://control.msg91.com/api/v5/otp/verify` | `otp` and `mobile` are query parameters. `authkey` is a header. |
| Resend OTP | `GET https://control.msg91.com/api/v5/otp/retry` | `authkey`, `mobile`, and `retrytype` are query parameters. |

Documented defaults are 4 OTP digits and 15 minutes. The description allows
`otp_length` 4–9 and `otp_expiry` from 1 to 10080 minutes, so 6 digits and 5 minutes
are inside that stated range. Those knobs sit on the same query string as the phone
number. Setting them does not remove the URL placement.

Verify returns HTTP 200 for both success and an OTP error. The body `type` is
`success` or `error`. Documented messages include `OTP verified success`, `OTP expired`,
`OTP not match`, and `Mobile no. empty or not numeric`. Invalid authkey is HTTP 401.
The inactive adapter already classifies unknown, timeout, and server-failure results as
`unavailable` so they are not a wrong code. That classifier is not wired to the factory.

Resend sends the same OTP. The retry response documents a maximum retry count of 2.
Whether a new SendOTP supersedes the previous code is not stated.

Attempt cap, replay behaviour, concurrency, sandbox, log redaction, retention, and DLT
field placement are not in the fetched Verify contract. TRAI still requires principal
entity, header, and content-template registration for bulk SMS. This API surface does
not demonstrate those fields.

Classification: `INCOMPATIBLE` with Option A. GET Verify remains blocked. Send places
the phone, and an optional caller-supplied OTP, in the query string. Resend places the
authkey in the query string.

### B. MSG91 OTP Widget — separate POST contract, not selected

Host `https://api.msg91.com`. This is not `control.msg91.com`.

| Operation | Method and path | Body fields | Credential |
|---|---|---|---|
| Send OTP | `POST /api/v5/widget/sendOtp` | `widgetId`, `identifier` | `authkey` header |
| Retry OTP | `POST /api/v5/widget/retryOtp` | `widgetId`, `reqId`, optional `retryChannel` | `authkey` header |
| Verify OTP | `POST /api/v5/widget/verifyOtp` | `widgetId`, `reqId`, `otp` | `authkey` header |
| Verify access token | `POST /api/v5/widget/verifyAccessToken` | `access-token` | `authkey` header |

The overview says every endpoint is POST, send returns `reqId`, and verify returns a
JWT access token. The fetched OpenAPI 200 examples are error bodies (`User not found`,
`invalid retryChannel`, `verification limit exceeded` code 704, missing access token).
The success JSON shape, including the JWT claim set, is not in those examples.

`identifier` may be an email or a mobile number. Nothing in the fetched contract
restricts it to an Indian mobile, fixes a 6-digit code, or fixes a 300-second life.
Code 704 shows that some verification limit exists. The number of attempts is not stated.
Retry interval and same-code versus new-code behaviour are not stated.

The access token is a provider artifact. It must not be stored or accepted as a BOBA
session. Better Auth remains the only session issuer.

`reqId` has to be kept from send until verify. The current provider interface cannot
carry it. Where it would live is `DECISION_REQUIRED`. No OTP table is proposed.

The widget overview says captcha and invisible OTP are not supported. That is the
MSG91 widget, not BOBA Turnstile. Turnstile stays in the BOBA router.

DLT placement, sandbox, replay, concurrency, retention, and whether the authkey can
stay exclusively on the server are `UNVERIFIED`. A browser widget that holds the
authkey would fail the server-only credential requirement.

### C. Exotel ExoVerify — POST JSON, path identifiers unresolved

| Operation | Contract | Sensitive placement |
|---|---|---|
| Start | `POST https://exoverify.exotel.com/v2/accounts/{account_sid}/verifications/sms` | JSON body: `application_id`, `phone_number`, optional `replace_vars`. `Authorization: Basic` of application id and secret. |
| Verify | `POST https://exoverify.exotel.com/v2/accounts/{account_sid}/verifications/sms/{verification_id}` | JSON body: `OTP`. Same Basic header. |

The phone and the OTP are outside the query string. The application secret is in the
header, not the URL. `account_sid` and `verification_id` are path parameters. Whether
those path identifiers are "phone verification data" or a credential under Option A is
`DECISION_REQUIRED`. This assessment does not treat POST as a pass.

Documented defaults are a 60-second expiry, 10 attempts, and a length of 4–6 digits.
The start response echoes `expiration_in_seconds: 60` and `max_attempts: 10`. A 6-digit
length is inside the stated range. A 300-second life is not demonstrated. Whether either
default is configurable is `UNVERIFIED`.

ExoVerify generates, delivers, and checks the OTP. That is provider-generated, not the
BOBA `generatedCode` path.

Verify errors: `1211` invalid OTP, `1210` expired (described as the 60-second window),
`1016` more than 10 attempts, `1017` verification already completed. Success says the
same `verification_id` cannot be reused. Start can return `429` / `1030` throttle.
Authentication failure is `401` / `1010`.

The start page says to store `verification_id` in the session or pass it to the
frontend. The current BOBA interface has nowhere to put it. Passing it to the browser
is not accepted BOBA behaviour. Correlation storage is `DECISION_REQUIRED`.

No resend operation is documented on the fetched overview. A new start returns a new
`verification_id`. Cooldown relative to 30 or 60 seconds is `UNVERIFIED`.

DLT fields, sandbox, concurrency, retention, and billing controls are `UNVERIFIED` on
these pages. TRAI principal-entity, header, and template duties still apply to bulk SMS.
The start response example masks the phone (`+91987654XXXX`).

### D. Twilio Verify — form body, conflicting lifetime pages

Check: `POST https://verify.twilio.com/v2/Services/{ServiceSid}/VerificationCheck`

Start: `POST https://verify.twilio.com/v2/Services/{ServiceSid}/Verifications`

Both use `application/x-www-form-urlencoded`. Check puts `Code` and `To` (or
`VerificationSid`) in the body. Start requires `To` and `Channel`. The documented curl
example sends the API key and secret with HTTP Basic (`-u`), not in the URL. The
documented hosts are `https://`.

`ServiceSid` remains in the path. It identifies the Verify Service. It is not the OTP,
the phone, or the API secret. It is still a path identifier and is called out rather
than ignored.

`Code` is documented as 4–10 characters. The service `CodeLength` field is an integer
from 4 to 10. Twilio's best-practices page says the default length is 6. Sample service
payloads on the Service page show `"code_length": 4`; those samples are not treated as
the live default.

Lifetime conflict, both on Twilio's own docs, retrieved the same day:

- Rate limits and timeouts: tokens last 10 minutes by default and can be set from 2
  minutes to 24 hours by contacting Support. A later start inside the validity period
  receives the same token.
- Developer best practices: tokens last 10 minutes, and "We are unable to change the
  timeout for token validity." A later request inside 10 minutes receives the same token.

Five minutes sits inside the first page's stated range and is denied by the second
page's "unable to change" sentence. This assessment does not choose a page.
`DECISION_REQUIRED` / `UNVERIFIED` for a 300-second life.

Error 60202 says the maximum is 5 check attempts, then HTTP 429. After expiry, approval,
or that cap, Twilio deletes the verification and a later check is HTTP 404. That cap
matches ADR-004's initial 5 and does not match the code constant 3. The conflict is not
resolved.

Error 60203 is max send attempts. Error 60212 is too many concurrent requests for one
phone number. Neither page states a 30-second or 60-second resend interval. The
same-token rule conflicts with BOBA's local provider, which replaces the code for that
phone on a new start.

`CustomCodeEnabled` exists on the service. The fetched start schema's required fields
are `To` and `Channel`. A BOBA-generated code is not shown as a normal start parameter.
Provider-generated codes are the documented default path. Using a BOBA-generated code
would be a separate, unverified custom-code feature, and it would still have to avoid
the URL.

`To` carries a Twilio PII annotation `handling: standard`, `deleteSla: 30`. That is the
field annotation only. It is not a BOBA retention decision.

India DLT placement, a no-carrier sandbox, human spend shutoff, and which request wins
under 60212 are `UNVERIFIED`.

The verification SID, if retained, is optional because check can use `To` instead.
Retaining it anyway, or relying on phone-keyed provider state, is still
`DECISION_REQUIRED` before any adapter. Phone-keyed check does not by itself authorize
new persistence, and it does not remove the same-token and attempt-cap conflicts.

## 5. Fit against accepted BOBA authentication

Labels: `VERIFIED`, `UNVERIFIED`, `INCOMPATIBLE`, `DECISION_REQUIRED`.

| Concern | MSG91 standard | MSG91 Widget | Exotel ExoVerify | Twilio Verify |
|---|---|---|---|---|
| OTP, phone, and credential outside the URL | `INCOMPATIBLE` | OTP, phone, and authkey header are outside the URL (`VERIFIED` placement). Success JWT shape `UNVERIFIED`. | OTP, phone, and application secret are outside the URL. `account_sid` and `verification_id` are in the path (`DECISION_REQUIRED`). | OTP, phone, and API secret are outside the URL. `ServiceSid` is in the path. |
| Documented HTTPS | `VERIFIED` URL scheme | `VERIFIED` URL scheme | `VERIFIED` URL scheme | `VERIFIED` URL scheme |
| Server-only credential | Not reachable. Resend puts authkey in the query (`INCOMPATIBLE`). | Header placement `VERIFIED`. Exclusive server use `UNVERIFIED`. | Basic header `VERIFIED`. Exclusive server use is a BOBA duty, not a vendor proof. | Basic header `VERIFIED`. Exclusive server use is a BOBA duty. |
| 6-digit, 300-second policy | Length and expiry ranges could express it, on the incompatible query API. | `UNVERIFIED` | 6 digits possible. 300 seconds not demonstrated. Default 60 seconds. | 6 digits documented as the best-practices default and configurable 4–10. 300 seconds `DECISION_REQUIRED` because the lifetime pages conflict. |
| 3-versus-5 attempt conflict | Attempt cap `UNVERIFIED` | Limit exists (code 704). Count `UNVERIFIED`. | Documented cap 10. Conflicts with both 3 and 5. Not resolved. | Documented cap 5. Matches ADR-004's initial 5, not the code constant 3. Not resolved. |
| 60-versus-30 resend conflict | Same OTP, max 2 retries, credential in the URL. Interval `UNVERIFIED`. | Interval and same-versus-new code `UNVERIFIED`. | No resend operation on the fetched pages. | Same token until success or expiry. Interval `UNVERIFIED`. |
| Single use / replay | `UNVERIFIED` | `UNVERIFIED` | `VERIFIED` for a completed `verification_id` (error 1017 and the success note). | `VERIFIED` that approval deletes the verification and a later check is 404. |
| Concurrent checks | `UNVERIFIED` | `UNVERIFIED` | `UNVERIFIED` | Error 60212 exists. Which request wins is `UNVERIFIED`. |
| Per-phone supersession | New SendOTP versus Resend is `UNVERIFIED`. | `UNVERIFIED` | A new start is a new id. Effect on the previous id is `UNVERIFIED`. | Same token inside the validity window. Differs from BOBA's replace-on-start local provider. |
| Who generates the OTP | Vendor by default. A caller-supplied `otp` is a query parameter (`INCOMPATIBLE` placement). | Vendor. Caller-supplied code not in the fetched body. | Vendor (`VERIFIED` overview). | Vendor by default. Custom code `UNVERIFIED` as a start parameter. |
| Challenge correlation | Phone plus OTP. No id in the verify contract. Transport still incompatible. | `reqId` required. Current BOBA interface cannot carry it (`DECISION_REQUIRED`). | `verification_id` required (`DECISION_REQUIRED`). | `To` or `VerificationSid`. Storing a SID is `DECISION_REQUIRED`. |
| Better Auth session authority | Must not move. | Widget JWT is not a BOBA session. | Provider success is not a BOBA session. | Provider `approved` is not a BOBA session. |
| BOBA cooldown and rate limits | Would still have to run before any provider call. Not a reason to unblock this contract. | Same. Widget captcha is not Turnstile. | Same. | Same. |
| Failure mapping | HTTP 200 is used for wrong and expired codes, so status alone would misclassify them. The inactive classifier keeps unknown failures off `invalid`. It is not activated. | OpenAPI examples do not separate success from code 704 clearly enough to map. | 1211 / 1210 / 1016 / 1017 are distinct. A `false` from `verifyOTP` becomes only Better Auth `INVALID_OTP`, then `OTP_INVALID_OR_EXPIRED` (`DECISION_REQUIRED`). | 404 after delete can mean expired, approved, or exhausted. A `false` from `verifyOTP` becomes only `INVALID_OTP` (`DECISION_REQUIRED`). |
| Turnstile | Unchanged BOBA control. | Unchanged. Do not confuse with the widget's unsupported captcha. | Unchanged. | Unchanged. |
| SMS budget and human shutoff | Absent in BOBA (`DECISION_REQUIRED`). | Same. | Same. | Same. |
| Sandbox without carrier delivery | `UNVERIFIED` | `UNVERIFIED` | `UNVERIFIED` | `UNVERIFIED` on the pages fetched. |
| India DLT | TRAI duties `VERIFIED` as sender law. This API does not show PE, header, or template fields (`UNVERIFIED`). | `UNVERIFIED` | `UNVERIFIED` | `UNVERIFIED` |
| Privacy, retention, billing | `UNVERIFIED` | `UNVERIFIED` | Phone masked in one example. Retention and billing `UNVERIFIED`. | `To` deleteSla annotation only. Billing `UNVERIFIED`. |

The boolean `verifyOTP` seam is an accepted-code gap for every candidate that can
distinguish expiry, exhaustion, and outage. Returning `false` makes Better Auth's
phone-number plugin throw only `INVALID_OTP`. The router maps that single code to
`OTP_INVALID_OR_EXPIRED` (401). This path does not emit, and does not reach,
`OTP_EXPIRED`, `OTP_NOT_FOUND`, or `TOO_MANY_ATTEMPTS`. Fixing that seam would change
authentication error behaviour and is not authorized by this assessment.

## 6. Future evaluation shortlist

This is not a selection and not an activation order.

1. Twilio Verify. Closest fetched contract for keeping the OTP, the phone, and the API
   secret out of the URL. Still blocked by the lifetime-page conflict, the 5-versus-3
   attempt conflict, same-token resend, unproven India DLT and sandbox behaviour, the
   `ServiceSid` path identifier, and the missing BOBA spend shutoff.
2. Exotel ExoVerify. Phone and OTP are JSON, and the application secret is a header.
   Still blocked by path `account_sid` and `verification_id`, a required correlation id
   the current interface cannot hold, 60-second and 10-attempt defaults, and unproven
   DLT, sandbox, and supersession behaviour.
3. MSG91 OTP Widget. Separate POST JSON contract. Authkey is a header. Still blocked by
   required `reqId` correlation, an unclear success body, a provider JWT that must not
   become a session, and unproven length, lifetime, attempt count, server-only authkey
   use, DLT, and sandbox behaviour.

Excluded: MSG91 standard OTP. `INCOMPATIBLE`. GET Verify stays blocked, and Send and
Resend also place sensitive values in the query string.

## 7. Vendor questions

Ask these against a primary document or a written vendor reply. Do not answer them by
signing up or by calling an OTP endpoint.

MSG91 standard, already incompatible on placement:

- Is there a supported Verify, Send, and Resend contract that puts `otp`, `mobile`, and
  `authkey` only in headers or a body, never in the URL? The fetched v5 contracts do
  not show one.
- What is the verification attempt cap, replay rule, and supersession rule?

MSG91 Widget, <https://docs.msg91.com/otp-widget> and the widget OpenAPI files:

- What is the success JSON for send and verify, including the access-token claims?
- Can the server call send, retry, and verify while the authkey never reaches the
  browser?
- What are OTP length, lifetime, attempt cap, retry interval, and same-code versus new
  code?
- Where do DLT entity, header, and template identifiers go?
- Is there a sandbox that does not send a carrier SMS?
- How long are identifier, OTP, and reqId retained, and are they redacted in logs?

Exotel, <https://developer.exotel.com/docs/exoverify-api/overview> and the verify-otp
reference:

- Can `account_sid` and `verification_id` move out of the URL path?
- Can expiry be 300 seconds and attempts be set to the BOBA figure once that figure is
  decided?
- What happens to an older `verification_id` when start is called again for the same
  phone?
- Where do DLT identifiers go, and is there a no-carrier sandbox?
- The start page suggests passing `verification_id` to the frontend. Is a server-only
  hold supported?

Twilio, <https://www.twilio.com/docs/verify/api/verification-check>, the rate-limits
page, and the best-practices page:

- Which lifetime statement is current: Support can set 2 minutes to 24 hours, or the
  timeout cannot be changed?
- Can a service be set to exactly 300 seconds and to 3 check attempts, or is 5 fixed?
- Does a new start replace the previous code, or is the same-token behaviour mandatory?
- What India DLT or sender registration does Verify require, on which primary page?
- What is the no-carrier test mode, and what does a 404 check mean to the caller when
  the cause was expiry rather than a wrong code?
- Can `ServiceSid` stay out of access logs, or is path placement unavoidable?

TRAI, <https://www.trai.gov.in/advice-to-senders>: principal entity registration, header,
content template, and transmission of PE id, header, and content id are sender duties
for bulk SMS. They are not vendor selection.

## 8. Decisions still required

```text
DECISION_REQUIRED
question:
  Which unused decision ID may record OTP_TRANSPORT_POLICY = OPTION_A_APPROVED
  as CURRENT? DR-25 names D-385 next. Open PR #429 reserves D-385 and D-386.
  Open PR #488 stages D-387.
why_current_authority_is_insufficient:
  The register forbids inventing an ID. Reusing D-385, D-386, or D-387 collides
  with those open pulls. Choosing an ID past that reserved sequence skips
  unpublished reservations and is not authorized.
option_a:
  Wait until D-385, D-386, and D-387 are registered or released, then allocate
  the next free ID for the transport constraint only.
option_b:
  The Founder names one specific unused ID and the register sentence, still
  without selecting a provider. A later ID is not chosen here.
cursor_recommendation:
  option_a. This change adds no register row.
decision_owner:
  Founder, as decision-register owner.
blocked_scope:
  A CURRENT decision-register row, and any statement that Option A is already
  CURRENT on GitHub.
work_continuing_elsewhere:
  This assessment, the ADR-004 evidence notice, and the foundation operating note.
```

Further boundaries, none of which this note decides:

1. Whether a verification id or an account or service id in a URL path violates
   Option A, or only an OTP, a phone number, and a credential do.
2. The 3-versus-5 attempt conflict between code and ADR-004, and the vendor caps of
   5, 10, or an unpublished number.
3. The 60-versus-30 resend conflict, and vendor same-code resend.
4. Provider-generated versus BOBA-generated OTPs, and whether the boolean `verifyOTP`
   seam may collapse expiry, exhaustion, and outage into a wrong-code result.
5. Where a `reqId` or verification SID would live. A new OTP table is not authorized.
6. Twilio's conflicting lifetime pages, before anyone depends on a 300-second token.
7. A global SMS budget and a human shutoff, before any live send.
8. Per-vendor DLT evidence, sandbox behaviour, retention, and billing controls.
9. Provider selection itself.

## 9. Live gates

Unchanged by this document:

- Factory selection in staging and production throws
  `CUSTOMER_OTP_PRODUCTION_PROVIDER_UNAVAILABLE`.
- The inactive MSG91 module is not a factory kind and does not call the network.
- No credential, DLT value, or provider endpoint is configured here.
- Customer login, Turnstile, rate limits, and Better Auth session issuance are
  unchanged.
- No staging publish and no Founder UAT follows from this file.
