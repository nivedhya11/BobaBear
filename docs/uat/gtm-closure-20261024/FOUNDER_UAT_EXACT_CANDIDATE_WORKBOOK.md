# Founder UAT exact-candidate workbook

Wave: `BOBA-CORE-GTM-UAT-PREPARATION-20261024`. Issue [nivedhya11/BobaBear#443](https://github.com/nivedhya11/BobaBear/issues/443).

Procedure: [`FOUNDER_FUNCTIONAL_EXPERIENCE_UAT_CHECKLIST.md`](./FOUNDER_FUNCTIONAL_EXPERIENCE_UAT_CHECKLIST.md).

This workbook is the recording sheet. Functional result and Experience result are separate. Every result cell starts blank. There is no score and no percent. The human Founder writes results after an exact-candidate session. This preparation does not.

```text
FUNCTIONAL_UAT =
EXPERIENCE_UAT =
FOUNDER_UAT =
FOUNDER_UAT_VERDICT_OWNER = HUMAN_FOUNDER
COMPLETE_AND_ACCEPTED = NOT_CLAIMED
DEPLOYMENT = NOT_PERFORMED
```

## 1. Source candidate verified at preparation

Clean tracked tree. Command: `npm run working-tree:fingerprint`.

| Field | Value |
|---|---|
| Source repository | `git@github.com:nivedhya11/bobabear-platform.git` |
| Verified worktree | `/home/ajoshi/repos/boba-bear-uat-b-checklist` |
| Canonical checkout | `/home/ajoshi/repos/boba-bear-platform` (occupied; not switched) |
| Branch | `main` |
| HEAD | `a6155378b799e06a95b28c593ac1a340d7ca9245` |
| HEAD is `origin/main` | Yes, at preparation time |
| WORKING_TREE_FINGERPRINT | `ac4bc828121ce13b8758f963f25187f537e3d79272d33e3995e3fc234c4f9353` |
| Fingerprint algorithm | `boba-bear-working-tree-fingerprint-v1` |
| Excluded prior integration HEAD | `dacc7b98491fc1b726771428e0d6944f51bf6291` |
| Preparation branch | `docs/uat-prep-founder-checklist-20261024` |

The preparation branch HEAD moves when this workbook is committed. That commit is not the UAT source HEAD. Before a future build, recompute the fingerprint on the merged `main` tree that will be built. Stop when it differs from the candidate the Founder named.

## 2. Future deployed artifact

Leave these blank until a later authorized deployment. `NOT_DEPLOYED` means this preparation did not deploy.

| Field | Value |
|---|---|
| Source repository | |
| Branch | |
| HEAD | |
| WORKING_TREE_FINGERPRINT | |
| Image name | `NOT_DEPLOYED` |
| Image ID | `NOT_DEPLOYED` |
| Image digest | `NOT_DEPLOYED` |
| Container identity | `NOT_DEPLOYED` |
| Deployment health | `NOT_DEPLOYED` |
| UAT URL | |

A Git SHA is not an image digest.

## 3. Existing `boba-staging` Podman runtime

Read-only inspection on 2026-10-24. No container was started, stopped, or modified. Secrets, tokens, connection strings, and key material are omitted.

Classification: `LOCAL_UAT`.

| Evidence | What was verified |
|---|---|
| `BOBA_BEAR_ENV` | `local` on `boba-staging_customer-commerce_1`, `boba-staging_operations_1`, `boba-staging_customer-auth_1`, and `boba-staging_workforce-auth_1` |
| Field absent | `BOBA_BEAR_ENV` is absent on `boba-staging_app_1` (Nginx image) and `boba-staging_postgres_1`. Classification uses the four application services that carry the field. |
| Container state | `created` on all six. This is not a running deployment and not deployment health. |
| Image names | `localhost/boba-bear-app:local`, `localhost/boba-bear-customer-commerce:local`, `localhost/boba-bear-operations:local`, `localhost/boba-bear-customer-auth:local`, `localhost/boba-bear-workforce-auth:local`, `localhost/boba-bear-postgres:local` |
| Image IDs | app `302ef03704db9f92f7c0c38ee50476a135a0a398988aeef44b9f7c22c317474c`; customer-commerce `c20adabe90392184cab2d50b0d785360a0b18a9f820623408cfc724a65327568`; operations `30254c7ac55908224e55b57199893a2a90201d090f88e2954f98662b63387e9a`; customer-auth `4d92e2a364c5e4d4afefeaf4ec5e4cf91d685ec281401d0467d52c4d6dfb6b72`; workforce-auth `bfa28712fe4553457a89ac58ba60db864aa3b629221d0747dc6ee9bbd23ff43a`; postgres `60c693db05ed5fd673c99cc80dd9a98d7461deec2eb777d7d659f93406b641e1` |
| OCI revision label | `5773dac4ce32e342b9f0d34f9ccb9099d1d8d15a` on the app and service images. Postgres has no revision label. This revision is not `a6155378b799e06a95b28c593ac1a340d7ca9245`. |
| Other non-secret settings | `NODE_ENV=production`. `BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS=true`. `BOBA_BEAR_PAYMENT_PROVIDER=razorpay` on customer-commerce. `CUSTOMER_OTP_PROVIDER=local` on customer-auth and customer-commerce. `BOBA_BEAR_PUBLIC_ORIGIN` host class `NON_LOOPBACK` (value omitted). |
| Compose project label | `boba-staging`. A project name is not environment evidence. |
| Strict staging | `NOT_ESTABLISHED`. Canonical `decision-register.md` on this SHA is DR-25. DR-26 / AD-PF-01/02 are not in that register. Pull requests #429 and #434 are open and unmerged. |

These containers are not the UAT artifact. Section 2 stays `NOT_DEPLOYED`.

## 4. Actors

| Actor ID | Role | Name | Authorization reference |
|---|---|---|---|
| ACTOR-FOUNDER | Human Founder. Writes Functional and Experience results. | | |
| ACTOR-OPERATOR | Performs fixture writes only after the approval below. | | |

## 5. Authorizations

Blank means the row is not authorized. This preparation does not fill them.

| Authorization | Required before | Founder statement | When |
|---|---|---|---|
| Deploy exact merged `main` and open a UAT session | Any interactive row | | |
| Owned coupon fixture, including cleanup | F-06 F-07 F-08 F-09 F-10 F-11 F-19 O-01 O-02 O-03 O-04 | | |
| Controlled unavailability fixture, or a named inventory change | F-12 F-13 E-02 | | |
| Zero-payable completion, or a test provider that cannot debit a live instrument | F-01B F-18 F-19 confirmation | | |
| Provider idempotency replay | F-17 beyond `REPLAY_NOT_SENT` | | |

Fixture identifier, if approved:

| Field | Value |
|---|---|
| Fixture identifier | |
| Cleanup | |
| Dataset that stays unchanged | Current persistent Founder commercial data |

## 6. Results

Leave both result columns blank. Actual may later hold a short observation or one of the checklist stop notes (`FIXTURE_APPROVAL_BLANK`, `FIXTURE_OR_AUTHORIZATION_ABSENT`, `PRIOR_PURCHASE_NOT_ESTABLISHED`, `STOPPED_BEFORE_PROVIDER_EFFECT`, `REPLAY_NOT_SENT`, `ORDER_NOT_ESTABLISHED`, `NOT_EXERCISED`, `NOT_SHOWN`, `HTTP 500`).

| Evidence ID | Check | Actor ID | Functional result | Experience result | Evidence pointer | Actual |
|---|---|---|---|---|---|---|
| EV-F-01 | F-01 First-order offer visibility. Stop before payment. | | | | | |
| EV-F-01B | F-01B Real order on a zero-payable or authorized test-provider path. | | | | | |
| EV-F-01C | F-01C Unperformed payment. Stop before a provider effect. | | | | | |
| EV-F-02 | F-02 Prior purchase already shown by the product. | | | | | |
| EV-F-03 | F-03 Delivery destination and charge. | | | | | |
| EV-F-04 | F-04 Takeaway outlet, no delivery charge. | | | | | |
| EV-F-05 | F-05 Scheduled window and ASAP. | | | | | |
| EV-F-06 | F-06 Create fixture coupon offer, leave inactive. | | | | | |
| EV-F-07 | F-07 Issue `TEST_COUPON` on the fixture. | | | | | |
| EV-F-08 | F-08 Activate fixture offer and coupons. | | | | | |
| EV-F-09 | F-09 Apply `TEST_COUPON` through Review. | | | | | |
| EV-F-10 | F-10 Unknown, expired, and ineligible codes. | | | | | |
| EV-F-11 | F-11 Remove coupon on cart and Review. | | | | | |
| EV-F-12 | F-12 `ITEM_A` unavailable through an authorized fixture. | | | | | |
| EV-F-13 | F-13 Recover `ITEM_A` and keep `ITEM_B`. | | | | | |
| EV-F-14 | F-14 Review matches cart. Stop before payment. | | | | | |
| EV-F-15 | F-15 Payment continuation stops before a provider effect. | | | | | |
| EV-F-16 | F-16 Total change on Review. No payment submit. | | | | | |
| EV-F-17 | F-17 Provider replay is not sent. | | | | | |
| EV-F-18 | F-18 Confirmation of the F-01B order only. | | | | | |
| EV-F-19 | F-19 Order detail, fixture retire only under cleanup approval. | | | | | |
| EV-F-20 | F-20 #385 item line and Subtotal, figures only. | | | | | |
| EV-O-01 | O-01 Issue a fixture coupon. Code stays inactive. | | | | | |
| EV-O-02 | O-02 Activation waits for an active coupon offer. | | | | | |
| EV-O-03 | O-03 Cancel then confirm retire on the fixture offer. | | | | | |
| EV-O-04 | O-04 #381 create result, including HTTP 500 if returned. | | | | | |
| EV-E-01 | E-01 Phone and desktop walk. | | | | | |
| EV-E-02 | E-02 Unavailable-item explanation. | | | | | |
| EV-E-03 | E-03 Keyboard reach. | | | | | |
| EV-E-04 | E-04 Distinct coupon sentences. | | | | | |
| EV-E-05 | E-05 Recovery screen already present. | | | | | |
| EV-E-06 | E-06 Draft, zero-coupon, and active-code offers. | | | | | |
| EV-E-07 | E-07 #385 readability of the two figures. | | | | | |

## 7. Evidence log

| When | Actor ID | Repository | Branch | HEAD | Fingerprint | Evidence ID | Command or screenshot | Actual |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## 8. Founder session close

The Founder fills this after the session. Leave it blank until then.

| Field | Value |
|---|---|
| Functional UAT result | |
| Experience UAT result | |
| Founder UAT result | |
| Name | |
| Date | |

## 9. Preparation gate

```text
FOUNDER_UAT_PREPARED_OR_BLOCKED = BLOCKED
MISSING_AUTHORIZATION = Human Founder authorization to deploy exact merged main a6155378b799e06a95b28c593ac1a340d7ca9245 (fingerprint ac4bc828121ce13b8758f963f25187f537e3d79272d33e3995e3fc234c4f9353, recomputed on the build tree) and to begin interactive Functional UAT and Experience UAT.
AUTHORIZATION_OWNER = HUMAN_FOUNDER
```

The checklist and this workbook are prepared. The UAT session is blocked on that authorization. Existing `boba-staging` containers are `LOCAL_UAT`, `created`, and a different image revision. They are not a substitute for the authorization.
