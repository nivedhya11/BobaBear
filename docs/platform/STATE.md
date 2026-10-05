<!-- governance-meta
{
  "status": "CURRENT",
  "authority": "ACCEPTED_STATE",
  "stateVersion": "STATE-R187",
  "acceptedThrough": "IMP-036I",
  "currentProductSlice": "IMP-036J",
  "nextProductSlice": "IMP-036K",
  "pendingAcceptance": "NONE",
  "gtmBoundary": "IMP-040",
  "governanceHealth": "ALIGNED",
  "lastReviewed": "2026-10-05",
  "supersedes": "STATE-R186"
}
-->
<!-- gov2-state
{
  "slice": "IMP-036J",
  "lifecyclePhase": "IMPLEMENTATION_IN_PROGRESS",
  "implementation": {
    "authorized": true,
    "complete": false,
    "trancheStatuses": {
      "T1": "PASS",
      "T2": "PASS",
      "T3": "PASS",
      "T4": "PASS",
      "T5": "PASS",
      "T6": "PASS",
      "T7": "PASS",
      "T8": "NOT_STARTED"
    }
  },
  "founderUat": "NOT_PERFORMED",
  "accepted": false,
  "pendingAcceptance": "NONE",
  "acceptedThrough": "IMP-036I",
  "currentSlice": "IMP-036J",
  "nextSlice": "IMP-036K",
  "currentReferences": {
    "architecture": ["ARCH-R23"],
    "decisions": ["D-377", "D-382", "D-383"]
  },
  "contracts": {
    "activated": "YES",
    "productDefinition": "APPROVED",
    "productDefinitionVersion": "PD-IMP-036J-DRAFT-6",
    "productDefinitionGate": "PASS",
    "experienceDefinition": "APPROVED",
    "experienceDefinitionVersion": "XD-IMP-036J-DRAFT-6",
    "experienceGate": "PASS",
    "architectureFit": "PASS",
    "architectureLocked": "YES",
    "designReadiness": "PASS",
    "implementationAuthorized": "YES",
    "started": "YES",
    "implementationStarted": "YES",
    "implementationComplete": "NO",
    "accepted": "NO"
  },
  "lastTransition": {
    "type": "TRANCHE_PASS",
    "tranche": "T7",
    "sourcePr": 357,
    "mergeCommit": "323f5917995441d7096ddb17dd6168e0e98ce405"
  }
}
-->

# BOBA Bear — Accepted State

Coding-agent completion does **not** equal acceptance. This document is the independently accepted
current-reality authority and the current execution authority for the active slice.

Exact pre-GOV-2 STATE (STATE-R186) is preserved in
[`history/STATE-STATE-R186-pre-gov2.md`](./history/STATE-STATE-R186-pre-gov2.md).
Do not infer current execution from that snapshot.

## 1. Accepted Position

```text
Accepted Through:          IMP-036I — Scheduled Fulfilment
Accepted Inserted Slice:   IMP-005A — Dockerized local application runtime; IMP-026C — Pilot Customer-Commerce UX Hardening; IMP-028A — Food Direct UX Foundation; IMP-028B — Customer Menu Projection + Discovery; IMP-028C — Food Customization; IMP-028D — Desktop Ordering Continuity
Accepted Range:            IMP-001 → IMP-036I (including IMP-005A and IMP-026C)
```

## 2. Current Work Position

Machine-readable current execution is the `gov2-state` block above. Derived `nextGate` is not
independently persisted. Tranche 8 remains `NOT_STARTED`.

```text
Current Product Implementation: IMP-037 (unresolved held predecessor; provider-blocked; not acceptance)
Pending Acceptance:             NONE
Current Product Slice:          IMP-036J — Promotions, Coupons & Offers
Next Product Slice:             IMP-036K — Revenue Recommendations
Unresolved Predecessor:         IMP-037 — Backup, Restore & Migration Readiness
IMP-036J: IMPLEMENTATION_IN_PROGRESS
IMP036J_ACTIVATED: YES
IMP036J_IMPLEMENTATION_AUTHORIZED: YES
IMP036J_IMPLEMENTATION_COMPLETE: NO
IMP036J_ACCEPTED: NO
FOUNDER_UAT: NOT_PERFORMED
IMP036K_ACTIVATED: YES
IMP036K_IMPLEMENTATION_AUTHORIZED: NO
IMP037_HOLD: YES
IMP038_HOLD: YES
GAP-EXT-ASSESS-001: NOT_CLOSED
```

Product, experience, and architecture contracts remain in their semantic documents. Tranche
order and dependencies remain in the locked Implementation Plan.

## 3. Accepted Technical Inventory

Independently verified from repository evidence on 2026-08-18 (authority path
`/home/ajoshi/repos/boba-bear-website-acceptance`), including IMP-026, IMP-027, IMP-028, and
IMP-028A independent acceptance.
Speculative values are forbidden here.

| Metric | Verified value | How verified |
|---|---|---|
| Latest migration | `0029_refund_statutory_issuance_allocation` | `drizzle/meta/_journal.json` entry tag; `drizzle/0029_refund_statutory_issuance_allocation.sql` present |
| Migration count | `30` | Count of accepted migrations through IMP-028 (0000–0029) |
| Application tables | `108` | Count of `appSchema.table(` declarations under `src/platform/database/schema/` bounded to accepted IMP-028 schema |
| Workforce permissions | `57` | `PERMISSION_KEYS.length` in `src/shared/access-control/catalog.ts` |
| System roles | `7` | `ROLE_KEYS.length` in `src/shared/access-control/catalog.ts` |
| Default Docker services | `5` | Compose services without `profiles: ["tools"]`: `postgres`, `app`, `customer-auth`, `workforce-auth`, `customer-commerce` |
| Order-owned tables | `1` | `orders` in `src/platform/database/schema/order.ts` |
| Order snapshot/history tables | `0` | No additional Order snapshot/event tables in schema |
| IMP-023 new production runtime dependencies | `0` | No Order-domain production dependency addition beyond prior accepted baseline |
| IMP-026 new production runtime dependencies | `0` | Razorpay adapter behind existing `PaymentProvider`; no new deployable service |
| Payment provider event inbox table | `1` | `payment_provider_event_inbox` in `src/platform/database/schema/payment.ts` |
| Public web mode | Next.js static export → Nginx | `next.config.ts` `output: "export"`; `docker/nginx/nginx.conf`; no production `src/app/api` commerce tree |
| IMP-024 architecture artifact | present | `docs/platform/capabilities/IMP-024-customer-ordering-transport.md` |
| IMP-024 runtime Compose service | present | `customer-commerce` internal `:8083`; Nginx `/api/v1/*` (D-359) |
| IMP-025 architecture artifact | present | `docs/platform/capabilities/IMP-025-customer-ordering-ux.md` |
| IMP-025 static ordering catalog | present | `src/data/ordering-catalog.json` deterministic projection from existing-menu-v1; retained for legitimate transitional/import/test purposes, not the customer storefront runtime source |
| IMP-026 architecture artifact | present | `docs/platform/capabilities/IMP-026-razorpay-productionization.md` |
| IMP-026 payment inbox migration | `0018_payment_provider_event_inbox` | `drizzle/0018_payment_provider_event_inbox.sql` present in accepted journal |
| IMP-026C architecture artifact | present | `docs/platform/capabilities/IMP-026C-pilot-customer-commerce-ux-hardening.md` |
| IMP-027 architecture artifact | present | `docs/platform/capabilities/IMP-027-refund-foundation.md` |
| IMP-027 refund migration | `0019_refund` | `drizzle/0019_refund.sql` present in accepted journal |
| IMP-028 architecture artifact | present | `docs/platform/capabilities/IMP-028-invoice-tax-receipt-credit-note.md` |
| IMP-028 financial-document / statutory migrations | `0020`–`0029` | Journal tags `0020_financial_document` through `0029_refund_statutory_issuance_allocation` |
| IMP-028A architecture artifact | present | `docs/platform/capabilities/IMP-028A-food-direct-ux-foundation.md` |
| IMP-028B canonical capability artifact | present | `docs/platform/capabilities/IMP-028B-customer-menu-projection-and-discovery.md` |

Default Docker topology (accepted runtime inventory):

```text
postgres
app
customer-auth
workforce-auth
customer-commerce
```

Accepted IMP-024 transport (D-359):

```text
customer-commerce   (internal :8083; Nginx /api/v1/*)
```

Domain authority chain (accepted):

```text
Cart → Checkout → Payment → Order
(+ Refund; + Financial Document / RefundStatutoryDecision / SignatureArtifact)
```

| Domain | Authority |
|---|---|
| Cart | Mutable shopping intent |
| Checkout Snapshot | Immutable accepted commercial transaction |
| Payment | Original financial collection truth |
| Order | Post-purchase business lifecycle truth (`PLACED` \| `ACCEPTED` \| `FULFILLED` \| `CANCELLED`) |
| Refund | Financial reversal truth for returned funds (D-364) |
| Financial Document | Immutable issued statutory / financial-document truth (D-365) |
| RefundStatutoryDecision | Durable statutory-reversal classification for a PROCESSED Refund (D-366) |
| SignatureArtifact | Durable signature state and exact-byte signed statutory artifact (D-367) |
| Customer Menu Projection | CURRENT storefront READ MODEL (D-368); implemented and accepted under IMP-028B; not a new commercial authority |
| Customer paid-modifier purchase intent | CURRENT policy (D-369); positive-price modifier requires explicit current-interaction selection; implementation authorized only for IMP-028C; live import `modifier_groups: 0` |
| Cart identity transition | CURRENT policy (D-370); guest→customer compatible merge and logout customer-cart isolation; implementation not authorized |
## 4. Accepted Capability Ledger

| IMP | Capability | Status |
|---|---|---|
| IMP-001 | Behaviour-preserving `src/` migration | COMPLETE_AND_ACCEPTED |
| IMP-002 | Test and quality-tooling foundation | COMPLETE_AND_ACCEPTED |
| IMP-003 | Configuration and startup foundation | COMPLETE_AND_ACCEPTED |
| IMP-004 | PostgreSQL + Drizzle foundation | COMPLETE_AND_ACCEPTED |
| IMP-005 | Database test and migration validation | COMPLETE_AND_ACCEPTED |
| IMP-005A | Dockerized local application runtime | COMPLETE_AND_ACCEPTED |
| IMP-006 | Shared persistence primitives | COMPLETE_AND_ACCEPTED |
| IMP-007 | Transactional outbox and idempotency foundation | COMPLETE_AND_ACCEPTED |
| IMP-008 | Better Auth persistence and sessions | COMPLETE_AND_ACCEPTED |
| IMP-009 | Customer phone OTP authentication | COMPLETE_AND_ACCEPTED |
| IMP-010 | Workforce authentication + MFA | COMPLETE_AND_ACCEPTED |
| IMP-011 | Organization / Territory / Outlet / scoped RBAC | COMPLETE_AND_ACCEPTED |
| IMP-012 | Canonical catalog | COMPLETE_AND_ACCEPTED |
| IMP-013 | Existing menu import + menu presentation | COMPLETE_AND_ACCEPTED |
| IMP-014 | Assortment + operational availability | COMPLETE_AND_ACCEPTED |
| IMP-015 | Pricing, charges and GST/tax engine | COMPLETE_AND_ACCEPTED |
| IMP-016 | Promotions | COMPLETE_AND_ACCEPTED |
| IMP-017 | Customer Profiles | COMPLETE_AND_ACCEPTED |
| IMP-018 | Saved Customer Addresses | COMPLETE_AND_ACCEPTED |
| IMP-019 | Serviceability | COMPLETE_AND_ACCEPTED |
| IMP-020 | Cart | COMPLETE_AND_ACCEPTED |
| IMP-021 | Checkout | COMPLETE_AND_ACCEPTED |
| IMP-022 | Payment | COMPLETE_AND_ACCEPTED |
| IMP-023 | Order | COMPLETE_AND_ACCEPTED |
| IMP-024 | Customer Ordering Transport / API | COMPLETE_AND_ACCEPTED |
| IMP-025 | Customer Ordering UX | COMPLETE_AND_ACCEPTED |
| IMP-026 | Razorpay Productionization & Payment GTM Readiness | COMPLETE_AND_ACCEPTED |
| IMP-026C | Pilot Customer-Commerce UX Hardening | COMPLETE_AND_ACCEPTED |
| IMP-027 | Refund Foundation | COMPLETE_AND_ACCEPTED |
| IMP-028 | Invoice / Tax Receipt / Credit Note | COMPLETE_AND_ACCEPTED |
| IMP-028A | Food Direct UX Foundation | COMPLETE_AND_ACCEPTED |
| IMP-028B | Customer Menu Projection + Discovery | COMPLETE_AND_ACCEPTED |
| IMP-028C | Food Customization | COMPLETE_AND_ACCEPTED |
| IMP-028D | Desktop Ordering Continuity | COMPLETE_AND_ACCEPTED |
| IMP-029 | Operations Console API | COMPLETE_AND_ACCEPTED |
| IMP-030 | Operations Console UI | COMPLETE_AND_ACCEPTED |
| IMP-031 | Provider-Neutral Delivery Foundation | COMPLETE_AND_ACCEPTED |
| IMP-032 | Dehradun Delivery Operating Mode | COMPLETE_AND_ACCEPTED |
| IMP-033 | Notification Foundation | COMPLETE_AND_ACCEPTED |
| IMP-034 | Meta WhatsApp Cloud API Adapter | COMPLETE_AND_ACCEPTED |
| IMP-035 | Initial Administration Capabilities | COMPLETE_AND_ACCEPTED |
| IMP-036 | Observability & Operational Controls | COMPLETE_AND_ACCEPTED |
| IMP-036A | Multi-Portal Experience Foundation | COMPLETE_AND_ACCEPTED |
| IMP-036B | Customer Account, Onboarding, Address & Location Experience | COMPLETE_AND_ACCEPTED |
| IMP-036C | Customer Commerce Experience V2 | COMPLETE_AND_ACCEPTED |
| IMP-036D | Workforce & Franchise Operations Portal V2 | COMPLETE_AND_ACCEPTED |
| IMP-036E | Store Operations Management | COMPLETE_AND_ACCEPTED |
| IMP-036F | Catalog, Menu, Pricing & Promotions Management | COMPLETE_AND_ACCEPTED |
| IMP-036G | Administration Console V2 | COMPLETE_AND_ACCEPTED |
| IMP-036H | Customer Pickup / Takeaway | COMPLETE_AND_ACCEPTED |
| IMP-036I | Scheduled Fulfilment | COMPLETE_AND_ACCEPTED |

## 5. Acceptance Position

```text
acceptedThrough: IMP-036I
pendingAcceptance: NONE
currentProductSlice: IMP-036J
nextProductSlice: IMP-036K — Revenue Recommendations
PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED
PROGRAM_PAUSE_AUTHORITY: D-377
ADDITIONAL_SEQUENCING_AUTHORITY: D-382 (AMENDED by D-383 only for Revenue Recommendations identity, activation, and sequencing)
IMP-036F: COMPLETE_AND_ACCEPTED
IMP-036F_ARCHITECTURE: LOCKED
IMP036F_ARCHITECTURE_LOCKED: YES
IMP036F_IMPLEMENTATION: AUTHORIZED / STARTED / COMPLETE
IMP036F_IMPLEMENTATION_AUTHORIZED: YES
IMP036F_STARTED: YES
IMP036F_IMPLEMENTATION_COMPLETE: YES
IMP036F_ACCEPTED: YES
IMP036F_FOUNDER_UAT_REQUIRED: YES
IMP036F_FOUNDER_UAT: PASS
IMP036F_FORMAL_ACCEPTANCE: ACCEPTED
IMP036F_INDEPENDENT_ACCEPTANCE_EVIDENCE: ACCEPTED
IMP036F_PRODUCT_DEFINITION: APPROVED
IMP036F_PRODUCT_DEFINITION_GATE: PASS
IMP036F_ARCHITECTURE_FIT: PASS
IMP036F_ACTIVATED: YES
IMP036F_ACCEPTED_MAIN_SHA: 91d0b5e5e5815da6bf0bb325a3c6ab884dc06652
IMP036F_ACCEPTED_TREE: ab41fc7f2bf6d0a52c3ea6c2b69ed331ca9540cf
IMP036F_ACCEPTED_CANDIDATE: 91d0b5e5e5815da6bf0bb325a3c6ab884dc06652
IMP036F_FOUNDER_UAT_CANDIDATE_BRANCH: main
IMP036F_FOUNDER_UAT_CANDIDATE_HEAD: 91d0b5e5e5815da6bf0bb325a3c6ab884dc06652
IMP036F_FOUNDER_UAT_CANDIDATE_TREE: ab41fc7f2bf6d0a52c3ea6c2b69ed331ca9540cf
IMP036F_FOUNDER_UAT_CANDIDATE_FINGERPRINT: c689630cb9a4d002fda3376f949a1f324015776d392abfd2abde7b6f5b91f973
IMP036F_FOUNDER_UAT_DECISION_DATE: 2026-09-15
IMP036F_FOUNDER_UAT_ACCEPTANCE_AUTHORITY: Founder
IMP036F_EXACT_MAIN_CI: 34991901136
IMP036F_EXACT_MAIN_CI_RESULT: SUCCESS
IMP036F_F6A_PR: 149
IMP036F_F6A_REVIEWED_HEAD: 429923f182d22d960052f5ca840bc367d4fd9078
IMP036F_F6A_MERGE_MAIN: 611d6e7707f561c581118873d58214e92faf75bb
IMP036F_F6B_PR: 150
IMP036F_F6B_REVIEWED_HEAD: 240cb4ee20cd468280198304e96efecb7ecaf895
IMP036F_F6B_INDEPENDENT_REVIEW: 5210814689
IMP036F_F6B_MERGE: 07f15d5a2eab1a86d7a9412622554db4b0117f49
IMP036F_POST_MERGE_AUDIT_PR: 151
IMP036F_POST_MERGE_AUDIT_REVIEWED_HEAD: b95fe1d1cd20290bcd92f82b072258d7d9ec7bce
IMP036F_POST_MERGE_AUDIT_INDEPENDENT_REVIEW: 5212370227
IMP036F_POST_MERGE_AUDIT_MERGE: 91d0b5e5e5815da6bf0bb325a3c6ab884dc06652
IMP036F_CRITICAL_POST_MERGE_PERSISTENCE_AUDIT: PASS
FOUNDER_STAGING_PROJECT: boba-staging
FOUNDER_STAGING_CANDIDATE_MATCH: YES
FOUNDER_STAGING_STATUS: FOUNDER_UAT_COMPLETE
FOUNDER_STAGING_UAT_ROUTE: /workforce/admin/commercial
NON_BLOCKING_UAT_OBSERVATIONS: Menu-only-effective empty until draft mutation; Pricing Proposed preview occasional `—`; Founder staging UAT side-effects expected
IMP-036E: COMPLETE_AND_ACCEPTED
IMP-036E_ARCHITECTURE: LOCKED
IMP-036E_ARCHITECTURE_LOCKED: YES
IMP-036E_IMPLEMENTATION: AUTHORIZED / STARTED / COMPLETE
IMP-036E_IMPLEMENTATION_AUTHORIZED: YES
IMP-036E_STARTED: YES
IMP-036E_IMPLEMENTATION_COMPLETE: YES
IMP-036E_ACCEPTED: YES
IMP-036E_FOUNDER_UAT_REQUIRED: YES
IMP-036E_FOUNDER_UAT: PASS
IMP036E_FOUNDER_UAT: PASS
IMP036E_FORMAL_ACCEPTANCE: ACCEPTED
IMP036E_INDEPENDENT_ACCEPTANCE_EVIDENCE: ACCEPTED
IMP036E_ACCEPTED_MAIN_SHA: 05c534bac3d077f5ab89928495568bb63faf78df
IMP036E_ACCEPTED_TREE: 55b28977ee9860c2c07cb25f751c9f48ef4a2aa6
IMP036E_ACCEPTED_CANDIDATE: 05c534bac3d077f5ab89928495568bb63faf78df
IMP036E_FOUNDER_UAT_CANDIDATE_REPOSITORY: /home/ajoshi/repos/boba-bear-platform
IMP036E_FOUNDER_UAT_CANDIDATE_BRANCH: main
IMP036E_FOUNDER_UAT_CANDIDATE_HEAD: 05c534bac3d077f5ab89928495568bb63faf78df
IMP036E_FOUNDER_UAT_CANDIDATE_TREE: 55b28977ee9860c2c07cb25f751c9f48ef4a2aa6
IMP036E_FOUNDER_UAT_CANDIDATE_FINGERPRINT: 1a97d3a4c80394804e19398e4f3684067aefb0d42a01a7899e8777d1a07cb289
IMP036E_FOUNDER_UAT_DECISION_DATE: 2026-09-10
IMP036E_FOUNDER_UAT_ACCEPTANCE_AUTHORITY: Founder
FOUNDER_STAGING_INTERMEDIATE_CANDIDATE_SHA: e9821271a29ae35ba6c921008b976cd2e8d15c50
FOUNDER_STAGING_INTERMEDIATE_CANDIDATE_TREE: 8259d30f662e6668f2208788f2e95faaea831384
IMP036E_IMPLEMENTATION_EVIDENCE: COMPLETE
IMP_036E_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS
IMP036E_IMPLEMENTATION_MERGE_SHA: 0ebb5e937cd7ac14bb3e39e9d1d494e32c9d2739
IMP036E_IMPLEMENTATION_TREE: 0def59ce9bcab4575a7b43b7c3c07c85ac575428
IMP036E_REVIEWED_CANDIDATE_HEAD: b2ffaa5bc2b5c6f58ff5241c226b583160132837
IMP036E_REVIEWED_CANDIDATE_TREE: 0def59ce9bcab4575a7b43b7c3c07c85ac575428
IMP036E_ASSORTMENT_AUTHORITY: BRAND
OUTLET_MANAGER_OUTLET_SCOPE_ASSORTMENT_MANAGE: NO
OUTLET_EFFECTIVE_ASSORTMENT_PRESENTATION: AUTHORIZED_READ_OR_ESCALATE
IMP036E_ASSORTMENT_WORKFORCE_TRANSPORT: READ_ONLY_OPERATIONS_PROJECTION
ASSORTMENT_AUTHORIZATION_RESOURCE: BRAND_DERIVED_FROM_OUTLET
ASSORTMENT_MANAGE_ROUTE_IMP036E: NO
IMP036E_BULK_AVAILABILITY: DEFERRED
SERVICEABILITY_MODEL: OUTLET_DISTANCE_SERVICEABILITY_V1
SERVICEABILITY_COORDINATE_AUTHORITY: YES
SERVICEABILITY_POSTAL_PIN_RUNTIME_AUTHORITY: NO
SERVICEABILITY_MAP_IS_PROJECTION_ONLY: YES
IMP036E_SERVICEABILITY_ROUTING_PRIORITY_UI: HIDDEN_PREREQUISITE
IMP036E_SESSION_CAPABILITY_PROJECTION_EXTENSION: EXISTING_PERMISSION_KEYS_ONLY
IMP036E_GLOBAL_SESSION_CAPS_ARE_RESOURCE_AUTHORITY: NO
IMP036E_GLOBAL_SESSION_CAPS_PURPOSE: COARSE_NAVIGATION_ONLY
IMP036E_RESOURCE_SCOPED_CONTROL_VISIBILITY: REQUIRED
IMP036E_SERVER_AUTHORIZATION_REMAINS_AUTHORITATIVE: YES
SCHEMA_CHANGE_REQUIRED: NO
NEW_PERMISSION: NO
NEW_ROLE: NO
NEW_SCOPE_MODEL: NO
D374_REQUIRED_FOR_IMP036E_LOCK: NO
D-374_CREATED: YES
ARCH_R20_REQUIRED_FOR_IMP036E_LOCK: NO
ARCH_R20_CREATED: YES
IMP-036D: COMPLETE_AND_ACCEPTED
IMP-036D_ACCEPTED: YES
IMP-036D_FOUNDER_UAT: PASS
IMP-036G: COMPLETE_AND_ACCEPTED
IMP036G_ACTIVATED: YES
IMP036G_PRODUCT_DEFINITION: APPROVED
IMP036G_PRODUCT_DEFINITION_VERSION: PD-IMP-036G-DRAFT-2
IMP036G_PRODUCT_DECISIONS: RESOLVED
IMP036G_PRODUCT_DECISION_COUNT: 7
IMP036G_PRODUCT_DECISION_AUTHORITY: Founder
IMP036G_PRODUCT_DECISION_DATE: 2026-09-16
IMP036G_PRODUCT_DEFINITION_GATE: PASS
IMP036G_ARCHITECTURE_FIT: PASS
IMP036G_ARCHITECTURE_LOCKED: YES
IMP036G_IMPLEMENTATION: AUTHORIZED / STARTED / COMPLETE
IMP036G_IMPLEMENTATION_AUTHORIZED: YES
IMP036G_STARTED: YES
IMP036G_IMPLEMENTATION_COMPLETE: YES
IMP-036G_IMPLEMENTATION_COMPLETE: YES
IMP036G_ACCEPTED: YES
IMP036G_FOUNDER_UAT_REQUIRED: YES
IMP036G_FOUNDER_UAT: PASS
IMP036G_FORMAL_ACCEPTANCE: ACCEPTED
IMP036G_INDEPENDENT_ACCEPTANCE_EVIDENCE: ACCEPTED
IMP036G_INDEPENDENT_TECHNICAL_ACCEPTANCE: PASS
IMP036G_ACCEPTED_MAIN_SHA: fbf690a67cda51bd6bbc1bad4a9d26f574c4286e
IMP036G_ACCEPTED_TREE: 84b6a502fcec646cb5a65f3257f19b85c64f49e1
IMP036G_ACCEPTED_CANDIDATE: fbf690a67cda51bd6bbc1bad4a9d26f574c4286e
IMP036G_FOUNDER_UAT_CANDIDATE_BRANCH: main
IMP036G_FOUNDER_UAT_CANDIDATE_HEAD: fbf690a67cda51bd6bbc1bad4a9d26f574c4286e
IMP036G_FOUNDER_UAT_CANDIDATE_TREE: 84b6a502fcec646cb5a65f3257f19b85c64f49e1
IMP036G_FOUNDER_UAT_CANDIDATE_FINGERPRINT: 9f472ce6e1ccaa2fe914006c846fb3018d668b718f569b6d0cb4fa64c3013f9b
IMP036G_FOUNDER_UAT_DECISION_DATE: 2026-09-18
IMP036G_FOUNDER_UAT_ACCEPTANCE_AUTHORITY: Founder
IMP036G_EXACT_MAIN_CI: 35366698302
IMP036G_EXACT_MAIN_CI_RESULT: SUCCESS
IMP036G_IMPLEMENTATION_EXACT_MAIN_CI: 35214215500
IMP036G_IMPLEMENTATION_EXACT_MAIN_CI_RESULT: SUCCESS
IMP036G_MANUAL_TECHNICAL_VALIDATION: PASS
IMP036G_MANUAL_VALIDATION_CANDIDATE_SHA: c35c9eab6a30ec6ce745cefd75c523181326f360
IMP036G_MANUAL_VALIDATION_CANDIDATE_TREE: 266fe3b07811f6942e76cac155d58ba07daabe56
IMP036G_MANUAL_VALIDATION_DATE: 2026-09-18
IMP036G_MANUAL_VALIDATION_TESTER: Ashutosh
IMP036G_MANUAL_VALIDATION_DEFECTS: NONE
IMP036G_IMPLEMENTATION_EVIDENCE: COMPLETE
IMP_036G_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS
IMP036G_IMPLEMENTATION_MERGE_SHA: c35c9eab6a30ec6ce745cefd75c523181326f360
IMP036G_IMPLEMENTATION_TREE: 266fe3b07811f6942e76cac155d58ba07daabe56
IMP036G_REVIEWED_CANDIDATE_HEAD: 7a013155a98529d4527e7b6c0358642e5cd9d806
IMP036G_REVIEWED_CANDIDATE_TREE: 266fe3b07811f6942e76cac155d58ba07daabe56
IMP036G_PR_159: 159
IMP036G_PR_159_REVIEWED_HEAD: 7a013155a98529d4527e7b6c0358642e5cd9d806
IMP036G_PR_159_MERGE: c35c9eab6a30ec6ce745cefd75c523181326f360
IMP036G_PR_161_MERGE: 9994dc47
IMP036G_PR_163: 163
IMP036G_PR_163_REVIEWED_HEAD: da4bd82d
IMP036G_PR_163_MERGE: 2beec2aa
IMP036G_PR_164: 164
IMP036G_PR_164_REVIEWED_HEAD: 9cf5f790
IMP036G_PR_164_INDEPENDENT_REVIEW: 5249475938
IMP036G_PR_164_MERGE: 7ec7e51a
IMP036G_PR_165: 165
IMP036G_PR_165_REVIEWED_HEAD: de82fbf5
IMP036G_PR_165_INDEPENDENT_REVIEW: 5249952268
IMP036G_PR_165_MERGE: fbf690a67cda51bd6bbc1bad4a9d26f574c4286e
FOUNDER_STAGING_PROJECT: boba-staging
IMP036G_FOUNDER_STAGING_CANDIDATE_MATCH: YES
IMP036G_FOUNDER_STAGING_BASELINE_STATE: COMPLETE_COMPATIBLE
IMP036G_FOUNDER_STAGING_BOOTSTRAP_ACTION: PRESERVE
IMP036G_FOUNDER_STAGING_RUNNING_SHA: fbf690a67cda51bd6bbc1bad4a9d26f574c4286e
IMP036G_FOUNDER_STAGING_STATUS: FOUNDER_UAT_COMPLETE
IMP036G_FOUNDER_STAGING_UAT_ROUTE: /workforce/admin/
IMP-036H: COMPLETE_AND_ACCEPTED
IMP036H_ACTIVATED: YES
IMP036H_PRODUCT_DEFINITION: APPROVED
IMP036H_PRODUCT_DEFINITION_VERSION: PD-IMP-036H-DRAFT-1
IMP036H_PRODUCT_DEFINITION_GATE: PASS
IMP036H_ARCHITECTURE_FIT: PASS
IMP036H_ARCHITECTURE_LOCKED: YES
IMP036H_IMPLEMENTATION: AUTHORIZED / STARTED / COMPLETE
IMP036H_IMPLEMENTATION_AUTHORIZED: YES
IMP036H_STARTED: YES
IMP036H_IMPLEMENTATION_STARTED: YES
IMP036H_IMPLEMENTATION_COMPLETE: YES
IMP-036H_IMPLEMENTATION_COMPLETE: YES
IMP036H_ACCEPTED: YES
IMP036H_FOUNDER_UAT_REQUIRED: YES
IMP036H_FOUNDER_UAT: PASS
IMP036H_FORMAL_ACCEPTANCE: ACCEPTED
IMP036H_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS
IMP036H_INDEPENDENT_IMPLEMENTATION_REVIEW_ID: 5302239433
IMP036H_INDEPENDENT_TECHNICAL_ACCEPTANCE: PASS
IMP036H_AUTOMATED_ACCEPTANCE: 42/42 PASS
IMP036H_IMPLEMENTATION_REVIEWED_HEAD: 649b7848f99918f927da4a77e98cd81cdc146e6b
IMP036H_IMPLEMENTATION_REVIEWED_TREE: b272adf40f89b0011fff07bf4d6b6d0d735df68a
IMP036H_IMPLEMENTATION_REVIEWED_FINGERPRINT: c2bc6a91ce536329bec0ad4af4d3264a5a39904d035af28442071b4e96e2f56a
IMP036H_IMPLEMENTATION_EVIDENCE: PR#246 comment 5810833593
IMP036H_ACCEPTED_MAIN_SHA: 37bae964f964bddd317e4c290dc146097e4c8f57
IMP036H_ACCEPTED_TREE: f52cd6279deb22c251062880087a2078fc7bce3b
IMP036H_ACCEPTED_CANDIDATE: 37bae964f964bddd317e4c290dc146097e4c8f57
IMP036H_FOUNDER_UAT_CANDIDATE_BRANCH: main
IMP036H_FOUNDER_UAT_CANDIDATE_HEAD: 37bae964f964bddd317e4c290dc146097e4c8f57
IMP036H_FOUNDER_UAT_CANDIDATE_TREE: f52cd6279deb22c251062880087a2078fc7bce3b
IMP036H_FOUNDER_UAT_CANDIDATE_FINGERPRINT: e49d860c721d2524b248738750530a416f8418d02d10b64e69531f8548fcfb79
IMP036H_FOUNDER_UAT_DECISION_DATE: 2026-09-24
IMP036H_FOUNDER_UAT_ACCEPTANCE_AUTHORITY: Founder
IMP036H_FOUNDER_UAT_CHECKMARKS: pickup_profile=PASS; customer_pickup=PASS; payment=PASS; operations_handover=PASS; customer_order_history=PASS; mode_switching=PASS; unavailable_state=PASS; mobile=PASS; overall=PASS; findings=NONE_BLOCKING
IMP036H_INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS
IMP036H_INDEPENDENT_ARCHITECTURE_FIT_REVIEWED_HEAD: aab814c238c499367ee921e9f8ffb03ff7b1b373
IMP036H_INDEPENDENT_ARCHITECTURE_FIT_REVIEWED_TREE: 93d4e83d4a73c61c9439bcaae2799920fcca46db
IMP036H_INDEPENDENT_ARCHITECTURE_FIT_REVIEW_ID: 5295149318
IMP-036I: COMPLETE_AND_ACCEPTED
IMP036I_ACTIVATED: YES
IMP036I_PRODUCT_DEFINITION: APPROVED
IMP036I_PRODUCT_DEFINITION_VERSION: PD-IMP-036I-DRAFT-4
IMP036I_PRODUCT_DEFINITION_GATE: PASS
IMP036I_ARCHITECTURE_FIT: PASS
IMP036I_ARCHITECTURE_LOCKED: YES
IMP036I_IMPLEMENTATION_AUTHORIZED: YES
IMP036I_IMPLEMENTATION_AUTHORIZATION: APPROVED
IMP036I_IMPLEMENTATION_AUTHORIZATION_DATE: 2026-09-25
IMP036I_STARTED: YES
IMP036I_IMPLEMENTATION_STARTED: YES
IMP036I_IMPLEMENTATION_COMPLETE: YES
IMP036I_ACCEPTED: YES
IMP036I_FOUNDER_UAT_REQUIRED: YES
IMP036I_FOUNDER_UAT: PASS
FOUNDER_UAT: PASS
IMP036I_FORMAL_ACCEPTANCE: ACCEPTED
IMP036I_INDEPENDENT_TECHNICAL_ACCEPTANCE: PASS
IMP036I_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS
IMP036I_ACCEPTED_MAIN_SHA: 44f4d7d84af07c3226da606476844d8f05454b28
IMP036I_ACCEPTED_TREE: 3ec8a7714c25e6066453b47b7d006ef127abddbb
IMP036I_FOUNDER_UAT_CANDIDATE_BRANCH: main
IMP036I_FOUNDER_UAT_CANDIDATE_HEAD: 44f4d7d84af07c3226da606476844d8f05454b28
IMP036I_FOUNDER_UAT_CANDIDATE_TREE: 3ec8a7714c25e6066453b47b7d006ef127abddbb
IMP036I_FOUNDER_UAT_CANDIDATE_FINGERPRINT: 85fe93db116bfe86b7f5ba4c266c829433d44401ffd03bdec536b5f61be9c27c
IMP036I_FOUNDER_UAT_DECISION_DATE: 2026-09-27
IMP036I_FOUNDER_UAT_ACCEPTANCE_AUTHORITY: Founder
IMP036I_FOUNDER_UAT_FINDING_001: RESOLVED
BLOCKING_FINDINGS_AT_ACCEPTANCE: NONE
nextGate: NONE
INDEPENDENT_PRODUCT_DEFINITION_GATE_REVIEW: 5307761142
IMP-037: IMPLEMENTATION_IN_PROGRESS
IMP037_HOLD: YES
IMP037_ACTIVATED: YES
IMP037_PRODUCT_DEFINITION: APPROVED
IMP037_PRODUCT_DEFINITION_VERSION: PD-IMP-037-DRAFT-1
IMP037_PRODUCT_DECISIONS: RESOLVED
IMP037_PRODUCT_DECISION_COUNT: 7
IMP037_PRODUCT_DEFINITION_GATE: PASS
IMP037_ARCHITECTURE_FIT: PASS
IMP037_ARCHITECTURE_LOCKED: YES
IMP037_IMPLEMENTATION_AUTHORIZED: YES
IMP037_STARTED: YES
IMP037_REPOSITORY_IMPLEMENTATION_MERGED: YES
IMP037_IMPLEMENTATION_PR: 174
IMP037_IMPLEMENTATION_REVIEWED_HEAD: ae7328efe1add11a9a4299150251fe14c71b2730
IMP037_IMPLEMENTATION_REVIEWED_TREE: 4ff19a31db947cafadf690cf6bf1b6d2f1de14ac
IMP037_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS
IMP037_INDEPENDENT_IMPLEMENTATION_REVIEW_ID: 5265354130
IMP037_IMPLEMENTATION_MERGE_SHA: f77a54819f51ad5648dda8acb3a7c93345cd5d6c
IMP037_IMPLEMENTATION_MERGE_TREE: 4ff19a31db947cafadf690cf6bf1b6d2f1de14ac
IMP037_POST_MERGE_CI: 35587376968
IMP037_POST_MERGE_CI_RESULT: SUCCESS
IMP037_REPOSITORY_IMPLEMENTATION: MERGED
IMP037_EXTERNAL_RECOVERY_PROOF: NOT_PERFORMED
IMP037_IMPLEMENTATION_COMPLETE: NO
IMP037_ACCEPTED: NO
IMP037_FOUNDER_UAT_REQUIRED: YES
IMP037_FOUNDER_UAT: NOT_PERFORMED
PHASE1_BLOCK_STATUS: BLOCKED_PROVIDER_ACCESS
PROVIDER_DEPENDENT_PROOF: DEFERRED_PENDING_PROVIDER_ACCESS
IMP-038: IMPLEMENTATION_IN_PROGRESS (HOLD — IMPLEMENTATION_COMPLETE / NOT_ACCEPTED)
IMP038_HOLD: YES
IMP038_ACTIVATED: YES
IMP038_PRODUCT_DEFINITION: APPROVED
IMP038_PRODUCT_DEFINITION_VERSION: PD-IMP-038-DRAFT-2
IMP038_PRODUCT_DEFINITION_GATE: PASS
IMP038_ARCHITECTURE_FIT: PASS
IMP038_ARCHITECTURE_LOCKED: YES
IMP038_IMPLEMENTATION_AUTHORIZED: YES
IMP038_STARTED: YES
FOUNDER_IMP038_IMPLEMENTATION_AUTHORIZATION: CURSOR_SESSION_MANDATE
IMP038_IMPLEMENTATION_COMPLETE: YES
IMP038_ACCEPTED: NO
INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS
INDEPENDENT_ARCHITECTURE_FIT_REVIEWED_HEAD: 3b03164d6581c5a98a893c24e92eaddece004e90
INDEPENDENT_ARCHITECTURE_FIT_REVIEWED_TREE: 5bb499fa84a5bf02682b30518f2bf898ddb23540
INDEPENDENT_ARCHITECTURE_FIT_REVIEW_ID: 5279884548
D-375_CREATED: YES
ARCH_R21_CREATED: YES
IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES
IMP038_EXTERNAL_ASSESSMENT: DEFERRED_UNTIL_PRE_GTM_APPLICATION_SCOPE_STABILIZES
IMP038_FROZEN_RUNTIME_HEAD: dc6b19e6f88d4084e424d927e6467c374596fb0a
IMP038_FROZEN_RUNTIME_TREE: c3aefb57f3f6c941d7f14907b6c095c4aa7f0547
IMP038_FROZEN_RUNTIME_FINGERPRINT: 2800fe11397ee2a01e9decf572f85adf5c3a8b244ca34b1f53d579e05feac589
GAP-EXT-ASSESS-001: NOT_CLOSED
IMP038_FOUNDER_UAT_REQUIRED: YES
IMP038_FOUNDER_UAT: NOT_PERFORMED
IMP-039: PLANNED / NOT_ACTIVATED / NOT_AUTHORIZED / NOT_STARTED
IMP039_ACTIVATED: NO
IMP-040: PLANNED / NOT_ACTIVATED / NOT_AUTHORIZED / NOT_STARTED
IMP040_ACTIVATED: NO
PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED
PROGRAM_PAUSE_AUTHORITY: D-377
HISTORICAL_CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038
CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038
CONTINUATION_EXCEPTION_AUTHORITY: PR#179/5771367844
IMP037_PROVIDER_BLOCKED_TO_IMP038: YES
HISTORICAL_IMP026_TO_IMP028_CONTINUATION: CLOSED
D-374_CREATED: YES
ARCH_R20_CREATED: YES
D-375_CREATED: YES
ARCH_R21_CREATED: YES
D-377_CREATED: YES
architectureVersion: ARCH-R21
decisionRegisterVersion: DR-19
fitEvaluatedHead: 43007808849f093d84cbe710f32a728b41a9e5a2
fitEvaluatedTree: 581fb23631df40044ec7b9c449545959a90b9998
fitEvaluatedFingerprint: ab00d1ab23f3c7d8b140feefcd1a0787f1fedf90ab08a9934c9a892a77c8184d
fitDate: 2026-09-22
fitResult: PASS
independentArchitectureFitReview: PASS
independentArchitectureFitReviewedHead: 3b03164d6581c5a98a893c24e92eaddece004e90
independentArchitectureFitReviewedTree: 5bb499fa84a5bf02682b30518f2bf898ddb23540
independentArchitectureFitReviewId: 5279884548
```

Detailed per-accepted-IMP marker inventories, SHA/tree/UAT histories, and closed progression
narratives remain in
[`history/STATE-STATE-R111-pre-compression.md`](./history/STATE-STATE-R111-pre-compression.md)
and the corresponding capability / acceptance artifacts.

## 6. Known Governance Conflicts

No current unresolved governance conflicts. `governanceHealth = ALIGNED`.

Closed historical conflicts and prior STATE-Rxx progression narratives remain in
[`history/STATE-STATE-R111-pre-compression.md`](./history/STATE-STATE-R111-pre-compression.md).

## 7. Acceptance Provenance

Accepted product through IMP-036G is independently accepted after Founder UAT PASS on 2026-09-18 for
exact candidate SHA `fbf690a67cda51bd6bbc1bad4a9d26f574c4286e` / tree
`84b6a502fcec646cb5a65f3257f19b85c64f49e1` (fingerprint
`9f472ce6e1ccaa2fe914006c846fb3018d668b718f569b6d0cb4fa64c3013f9b`; exact-main CI run
`35366698302` SUCCESS; post-acceptance exact-main CI `35376477139` SUCCESS). Founder staging
`boba-staging` recorded `CANDIDATE_MATCH: YES`; UAT route `/workforce/admin/`. Formal Founder
acceptance: `ACCEPT IMP-036G`. Locked capability architecture:
[`capabilities/IMP-036G-administration-console-v2.md`](./capabilities/IMP-036G-administration-console-v2.md).

Prior accepted product through IMP-036F remains independently accepted after Founder UAT PASS on
2026-09-15 for exact candidate SHA `91d0b5e5e5815da6bf0bb325a3c6ab884dc06652` / tree
`ab41fc7f2bf6d0a52c3ea6c2b69ed331ca9540cf` (fingerprint
`c689630cb9a4d002fda3376f949a1f324015776d392abfd2abde7b6f5b91f973`; exact-main CI run
`34991901136` SUCCESS). Founder staging `boba-staging` recorded `CANDIDATE_MATCH: YES`, healthy,
UAT route `/workforce/admin/commercial`. Formal Founder acceptance: `ACCEPT IMP-036F`.
Critical post-merge persistence audit: PASS. Implementation/review provenance: F6A PR #149 reviewed
head `429923f182d22d960052f5ca840bc367d4fd9078` merge/main
`611d6e7707f561c581118873d58214e92faf75bb`; F6B PR #150 final independently reviewed head
`240cb4ee20cd468280198304e96efecb7ecaf895` (independent PASS `5210814689`) merge
`07f15d5a2eab1a86d7a9412622554db4b0117f49`; post-merge audit correction PR #151 reviewed head
`b95fe1d1cd20290bcd92f82b072258d7d9ec7bce` (independent PASS `5212370227`) final accepted merge
`91d0b5e5…`. Governance docs reconciliation after that product SHA is not a new product UAT
candidate.

```text
NON_BLOCKING_UAT_OBSERVATIONS (NOT acceptance blockers):
1. Menu with only effective Menu can initially appear empty until a draft-creating mutation
2. Pricing activation consequence preview can occasionally show Proposed `—` while effect/result is correct
3. Founder staging contains expected UAT test side-effects
```

IMP-036E remains independently accepted after Founder UAT PASS on 2026-09-10 for exact candidate SHA
`05c534bac3d077f5ab89928495568bb63faf78df` / tree `55b28977ee9860c2c07cb25f751c9f48ef4a2aa6`
(PR #135; main CI run `34389543060` 12/12 PASS). Implementation/review provenance for IMP-036E
remains recorded in
[`capabilities/IMP-036E-store-operations-management.md`](./capabilities/IMP-036E-store-operations-management.md).

Detailed per-slice evidence for earlier accepted IMPs remains in repository tests, audits, Docker
runtime proof, capability artifacts, and
[`history/STATE-STATE-R111-pre-compression.md`](./history/STATE-STATE-R111-pre-compression.md).
Implementation/review provenance for IMP-036F is recorded in
[`capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md`](./capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md).

## 8. Explicitly Not Yet Accepted

Execution detail for the current slice is the `gov2-state` block. Semantic contracts remain in
Product / Experience / Architecture documents.

- IMP-036J — Promotions, Coupons & Offers (current implementation slice; not accepted)
- IMP-036K — Revenue Recommendations (next product slice; implementation not authorized)
- IMP-037 — Backup, Restore & Migration Readiness (held; not complete; not accepted)
- IMP-038 — Security & Privacy Hardening (held; implementation complete; not accepted)
- IMP-039 — Production Infrastructure & Release Pipeline (not activated)
- IMP-040 — Launch Validation & Cutover (not activated)

## 9. Authority Boundaries

| Question | Authority |
|---|---|
| What is independently accepted now / current execution | **This document (`STATE.md`)** |
| What comes next / IMP meanings | [`ROADMAP.md`](./ROADMAP.md) |
| Pre-GOV-2 STATE snapshot | [`history/STATE-STATE-R186-pre-gov2.md`](./history/STATE-STATE-R186-pre-gov2.md) |
| Historical STATE evidence | [`history/STATE-STATE-R111-pre-compression.md`](./history/STATE-STATE-R111-pre-compression.md) |
| Why / Non-Goals | [`VISION.md`](./VISION.md) |
| Durable architecture | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Binding decision status | [`decision-register.md`](./decision-register.md) |

Agents may propose a STATE delta in their report. Only independent acceptance updates this file's
accepted position. GOV-2 cutover is not accepted by this candidate.

## 10. STATE-R187 record

```text
STATE-R187 = GOV2_CUTOVER_CANDIDATE
supersedes: STATE-R186
acceptedThrough: IMP-036I
pendingAcceptance: NONE
currentProductSlice: IMP-036J
nextProductSlice: IMP-036K
formalLifecycle: IMPLEMENTATION_IN_PROGRESS
IMP036J_IMPLEMENTATION_COMPLETE: NO
IMP036J_ACCEPTED: NO
FOUNDER_UAT: NOT_PERFORMED
T8_STARTED: NO
GOV2_CUTOVER_ACCEPTANCE: NO
```
