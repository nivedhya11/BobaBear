<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  FIT_GRANT: NOT_GRANTED
  LOCK_GRANT: NOT_GRANTED
  APPLICATION_CODE_MUTATION: NO
-->

# Source-conformance annex — F-1..F-7

```text
ANNEX_ID = WXE-FIT-SOURCE-ANNEX-1
PARENT = 18-consolidated-architecture-fit-decision-package.md
SOURCE_AUTHORITY = origin/main
SOURCE_MAIN_SHA = a6155378b799e06a95b28c593ac1a340d7ca9245
DOCUMENTARY_INPUT = PR #426 head 9918389638abd9833152dcfb35971644d7650f14
UOE_DEPENDENCY = PR #424 head 3b207b3bb69f305353770315af7ad814a7e766d0
P0_UI_PR = #427 head 5fb21b407a2541ed0ae2a31da92414c84cb2867d (OPEN, not merged)
W2_COORDINATION = GitHub issue #432 (OPEN). There is no pull request #432.
INSPECTION = READ_ONLY
ARCHITECTURE_FIT = NOT_GRANTED
ARCHITECTURE_LOCK = NOT_GRANTED
```

This annex records what current Workforce source does. It does not change that source, grant
`brand.read`, or create an outlet-scoped Commercial editor. Prepared Fit text that disagreed
with these facts is corrected in doc 18 §2 and §5. Ratified Option R text in doc 16 is not
rewritten.

## 1. Session payload used by the shells

`getAdminSession` in `src/server/administration/use-cases.ts` builds `session.capabilities` by
calling `getEffectivePermissions` with the actor and **no resource**. With no resource,
`getEffectivePermissions` (`src/server/access-control/authorize.ts`) returns the set of
permission keys on the actor’s grants. The client type is `Record<string, boolean>`
(`src/lib/administration/api.ts`). `PORTAL_SESSION_CAPS` includes `brand.read`, the commercial
read keys, `order.read`, `delivery.read`, and the store coarse keys, each set true or false.

That map is not an active brand or outlet. Store screens separately load outlet-scoped
capabilities. Those do not recompute Administration navigation.

Server authorization is unchanged by any shell predicate. Brand listing still compiles an
eligible plan for `brand.read` and defends the page for that permission (`adminListBrands`).

## 2. F-1 — Brand-operable Commercial

| Fact | Source | Result |
|---|---|---|
| Commercial nav today | `AdministrationAppShell` `hasCommercialRead` | Shown when any of `catalog.read`, `menu.read`, `assortment.read`, `pricing.read`, `promotions.read`, `coupons.read` is true. `brand.read` is not required. |
| Prepared predicate | Doc 18 §2 F-1 | Same commercial-read union **and** `brand.read` on the union payload. |
| Built-in `outlet_manager` | `OUTLET_MANAGER_PERMISSIONS` | Has `assortment.read`, `pricing.read`, `promotions.read`, `coupons.read`, and `outlet.read`. Does not have `brand.read`. Today the Commercial item is shown. The prepared predicate hides it. |
| Built-in `brand_admin` | `BRAND_ADMIN_PERMISSIONS` | Has `brand.read` plus catalog, menu, assortment, pricing, promotions, and coupons reads. Predicate shows Commercial. |
| Built-in `support_refund_operator` and `finance_viewer` | catalog mappings | Both have `brand.read` and at least one commercial read (`pricing.read`, `promotions.read`, or `coupons.read`). The predicate shows Commercial. This annex does not exclude them. |
| Direct Commercial URL today | `CommercialWorkspaceClient` | If a commercial read is present, the client calls `listAdminBrands()`. A successful response, including an empty item list, becomes `kind: "ready"`. There is no redirect to Store Assortment or Applications. |
| AS-27 | Proposed | When the predicate is false, do not render that brand-list landing. Recover to Store Assortment when the active outlet entitlement includes it, otherwise the Applications hub. |
| Empty catalogue | Prepared, and current client | A `brand.read` holder whose brand list is empty still sees navigation. Empty is not hide. |

The predicate does not grant `brand.read`. It reads a flag the session already projects.

Actor S9, as written in doc 16, asks the nav item to follow the active scope. The session map
cannot do that. Prepared F-1 therefore evaluates the union only. `adminListBrands` remains the
place where brand scope is enforced. A later scoped session projection would be a new contract
and is outside this Fit.

## 3. F-2 — Administration entry and landing

`ADMINISTRATION_ENTRY_PERMISSIONS` in `src/lib/workforce-hub/destinations.ts` is exactly
these twelve keys:

- `brand.read`
- `organization.read`
- `territory.read`
- `legal_entity.read`
- `outlet.read`
- `access.membership.read`
- `access.membership.manage`
- `access.role_assignment.read`
- `access.role_assignment.grant`
- `access.role_assignment.revoke`
- `access.effective_permissions.read`
- `access.audit.read`

There is no `access.role_assignment.manage`, `access.effective_permissions.manage`, or
`access.audit.manage` on this list or in the permission catalog. F-2 leaves the list as it is.

Commercial-read keys are **not** in that list. The hub Administration card is already
impossible from commercial reads alone. `canAccessAdmin` uses the same list, so a principal
with only commercial reads who opens `/workforce/admin/` sees `AccessDenied` rather than the
Commercial workspace.

Entry and page access are different. Once `canAccessAdmin` is true, `adminSectionItems` still
decides each item. The System item is pushed for every principal who reached the shell. This
annex does not invent a System permission. Page handlers remain responsible for their own
server checks.

Operations hub visibility today is `order.read` only. The card href is hard-coded to
`/workforce/operations/`, which is the Today page. F-4 is the landing rule for the case where
the card is shown without `order.read`.

## 4. F-3 — UPD-03 Option B

| Built-in role | `outlet.read` | Administration entry today | Commercial nav today | Prepared Commercial nav |
|---|---|---|---|---|
| `kitchen_operator` | yes | yes (`role-destination-safety.test.ts` asserts this) | shown, because `assortment.read` | hidden |
| `delivery_coordinator` | yes | yes, same entry list | hidden, because none of the six commercial reads are on the role | hidden |

Both roles also have `order.read`, so the current Operations card already lands them on Today.
Hiding Commercial does not remove `outlet.read` from the entry list. The prepared change does
not narrow that entry. Synthetic actors S5 and S6 stay fixtures; they are not new roles.

## 5. F-4 — Operations destination

In-workspace order and permissions, `src/lib/operations/navigation.ts`:

| Order | Item | Href | Required permission |
|---|---|---|---|
| 1 | Today | `/workforce/operations/` | `order.read` |
| 2 | Orders | `/workforce/operations/orders/` | `order.read` |
| 3 | Delivery | `/workforce/operations/delivery/` | `delivery.read` only |
| 4 | Store | `/workforce/operations/store/` | `STORE_COARSE_NAV_PERMISSIONS` |
| 5 | Operational Status | `/workforce/operations/status/` | `order.read` |

`STORE_COARSE_NAV_PERMISSIONS` is `outlet.read`, `availability.read`,
`outlet.operating_state.read`, `outlet.operating_schedule.read`, `serviceability.read`,
`assortment.read`, `access.membership.read`. The Store item inlines the same keys.
`navigation.test.ts` asserts the two lists are equal.

Today’s data load calls `listWorkforceOrders`. Workforce order reads require `order.read`
(`src/server/order/workforce-reads.ts`). `OperationsTodayClient` has no Store redirect. A
non-401 failure renders “Today could not be loaded.”

Hub behaviour today does not send a store-only principal to that page, because the card
requires `order.read`. A direct open of `/workforce/operations/` still mounts Today.

Prepared hub rule (doc 18 §2 F-4):

- Show the card when `order.read` is true **or** any store coarse key is true.
- Href is Today only when `order.read` is true.
- Otherwise, when a store coarse key is true, href is `/workforce/operations/store/`.
- `delivery.read` alone does not show the card. That keeps today’s hub rule for a
  delivery-only principal and matches doc 04.
- Do not change the in-workspace Delivery item from `delivery.read` to a conjunction with
  `order.read`.

WXE-PF-04 is the proof of the hub href for S4. It is not a proof that Delivery’s item
permission changed. A hand-entered `/workforce/operations/` URL still mounts Today. T1 does
not add a server redirect for that URL. The promise is that the hub does not direct the
principal there.

`delivery.read` with no `order.read` and no store coarse key does not show the hub card.
No built-in role has that shape. The oracle row is a synthetic map, not `delivery_coordinator`
(that role also has `order.read` and `outlet.read`).

## 6. F-5 — Scheduling

| Fact | Source |
|---|---|
| UI host | `StoreSchedulingProfileClient` is rendered by `src/app/workforce/(portal)/operations/store/hours/page.tsx`. There is no separate Scheduling route. |
| Store nav | Hours is the item that requires `outlet.operating_schedule.read`. No Scheduling item exists. |
| Client calls | `src/lib/operations/store.ts` GET and POST `.../scheduling-profile`. |
| HTTP route | `src/server/operations/http/store-routes.ts` classifies `scheduling-profile` as get, and POST as set. |
| Server permission | Get uses `requireOperatingScheduleRead` (`outlet.operating_schedule.read`). Set uses `requireOperatingScheduleManage` (`outlet.operating_schedule.manage`). |

Prepared discoverability adds a Store Management item that opens this client. It adds no
scheduling service, permission, order state, or slot engine. `FULFILMENT_TIMING` stays
`ASAP | SCHEDULED`.

## 7. F-6 — UOE UX-A labels

Dependency, read at PR #424 head `3b207b3bb`:

| Item | Identity | Status on that head |
|---|---|---|
| Product labels | `PD-UOE-CANDIDATE-3` D1 Delivery / Takeaway; D2 Now / Schedule | Product Definition Gate PASS recorded on #424 |
| Shared tranche | `UOE-TRANCHE-UX-A-1` in `17-ux-a-tranche-contract.md` | `PLAN_ONLY`. `IMPLEMENTATION_AUTHORIZED = NO` |
| Map module | `src/shared/ordering/uoe-presentation-labels.ts` | Proposed in that contract. Not created. |
| Workforce verbs | `PD-UOE-CANDIDATE-3` §3.A and addendum 12 §G | Prepare for collection; Ready for collection; Hand over order. Classed `OPERATIONAL_VOCAB_ALLOWED` (MC-32). |
| Workforce files named by UX-A | `OperationsOrderListClient.tsx` primary word | Later, after UX-A start conditions. Not a WXE-owned dictionary. |

T1 navigation, chrome, Scheduling, and Commercial show/hide do not need this map.
T2 may place actions and hide the Delivery panel for `PICKUP` before the map exists.
T2 must not assert final Delivery / Takeaway / Now / Schedule words, and must not invent
stand-in verbs, until that UX-A contract is approved for implementation. WXE does not copy
the strings into a second authority.

PR #456 is a separate UOE evidence pull request. It is not the dependency this package
consumes.

## 8. F-7 — Synthetic oracle

Fixtures only. Do not insert S1–S9 as catalog roles. Built-in roles below are cited so the
fixture expectations can be checked; the tests must keep supplying in-memory maps.

| Actor | Actual source touched | Approved or prepared behaviour | Outcome | Planned test layer | Dependency | Still missing |
|---|---|---|---|---|---|---|
| S1 | `brand.read` plus a commercial read. `brand_admin` matches. `support_refund_operator` and `finance_viewer` also match and stay Commercial-visible. No row excludes them. | Show Administration and Brand Commercial. Workspace may call `listAdminBrands`. | Allow nav | Component test of the shell predicate | None for the predicate | Fit acceptance; implementation authorization |
| S2 | Commercial read, no `brand.read`, no entry key | No hub Administration card. Deep link stays `AccessDenied`. Commercial item not shown. | Deny card and nav | `destinations` unit test plus shell test | F-2 | Same gates. AS-27 redirect is not required to prove the card stays absent |
| S3 | `outlet_manager` shape: `outlet.read`, commercial reads, no `brand.read`, `order.read` | Administration stays. Commercial hides. Operations hub lands on Today because `order.read` is present. Store Assortment stays. | Allow entry; deny Commercial nav | Shell test with a synthetic map. Existing `role-destination-safety` test must stay green for entry | F-1, F-3 | Static escalation copy check is Design Readiness (WXE-PF-03) |
| S4 | Store coarse key, no `order.read`. No built-in role is this shape: `outlet_manager`, `kitchen_operator`, and `delivery_coordinator` all have `order.read`. | Hub card shown. Href is Store. Today is not the href. | Allow card; deny Today href | Unit test of the hub resolver | F-4 | Not current code. Must be written only after implementation authorization |
| S5 | `kitchen_operator`: `outlet.read`, `assortment.read`, `order.read`, no `brand.read` | Administration stays. Commercial hides. Today remains a legal Operations landing. | Allow entry; deny Commercial nav | Shell test. Do not weaken `role-destination-safety` | F-3 | Fit acceptance |
| S6 | `delivery_coordinator`: `outlet.read`, `order.read`, `delivery.read`, no commercial read, no `brand.read` | Administration stays. Commercial stays absent. Delivery item stays `delivery.read`. | Allow entry; Commercial absent | Shell test plus existing operations nav test | F-3, F-4 item rule | Fit acceptance |
| S7 | No entry and no commercial keys | Hub shows no card. Deep link is AccessDenied (AS-13). | Deny | Existing destination tests | None | None beyond the future presentation suite |
| S8 | Commercial read, no `brand.read`, and an entry key such as `outlet.read` | Commercial page must not render the brand-list landing (AS-27). | Deny that landing | Component test of the commercial page shell | F-1 | Recovery destination (Store Assortment vs Applications) is specified and not implemented |
| S9 | `brand.read` on one grant and outlet-only commercial reads on another | Union payload stays true wherever `brand.read` exists on any grant. Nav does not track outlet selection. Brand list is still server-scoped. | Allow nav when the union predicate is true | Component test with one map. No scope-switch test against a new API | F-1 union reading | Per-scope nav is **not** a proof of this package |

| Proof | Holds | Layer | Missing |
|---|---|---|---|
| WXE-PF-01 | S1 show | Shell component | Implementation and Fit |
| WXE-PF-02, WXE-PF-06 | S2/S3 hide; no empty Admin card from commercial reads | Shell + `destinations` unit | Implementation and Fit |
| WXE-PF-03 | Read-only Store Assortment, static escalation, no cross-link | Store assortment component | Design check of the existing copy; no new API |
| WXE-PF-04 | S4 hub href is Store | Hub resolver unit | Implementation. Current card would fail this row. A separate synthetic row with only `delivery.read` expects no hub card. A direct Today URL is not redirected |
| WXE-PF-04-DIRECT | Hand-entered Today URL without `order.read` | Not a T1 hub proof | Page still mounts `OperationsTodayClient`. Recorded so it is not mistaken for a hub-direction success |
| WXE-PF-05 | S5/S6 entry remains | `role-destination-safety` pattern extended with a synthetic map, not a catalog edit | Fit |
| WXE-PF-07 | Scheduling item opens the existing client | Store nav unit + existing `StoreSchedulingProfileClient` tests | The nav item does not exist yet |
| WXE-PF-08 | Labels equal the UOE map | T2 component, only after the map exists | UX-A implementation approval. Until then T2-PF-08-HOLD |
| WXE-PF-09 | Server denials unchanged | Existing order and commercial mutation tests. Concrete negative: `order.cancel` without `order.cancel` still returns the current denial (`ORDER_UNAUTHORIZED` or the existing authorization error). Same for a commercial manage call without that manage key | Do not add a grant to make a row pass |
| WXE-PF-10 | UPD-08 | Not this oracle | Security disposition |
| WXE-PF-11 | AS-27 | Commercial page component | Implementation |
| WXE-PF-12 | Union payload, not a scope switch | Shell component | A scoped projection is out of scope |

Golden Journeys GJ-W1, GJ-W4, and GJ-W8 are the T1 narrative coverage. They are not executed
here. GJ-W8’s success actor is a principal who passes the union predicate (S1), not an
outlet-only manager.

## 9. UPD-08 exclusion, verified on this main SHA

| Gap | Still present on `a6155378b` | Path |
|---|---|---|
| 1. Arbitrary non-empty proof reference | `parseRecordProofAndDeliverInput` accepts any non-empty `proofReference` within the length bound | `src/shared/delivery/parse-input.ts` |
| 2. Cancellation-path automatic inactivity attestation | `workforceCancelDelivery` sets `inactiveBookingConfirmed: true` when status is not `REQUESTED` | `src/server/delivery/workforce.ts` |
| 3. URL `orderId` versus body `deliveryId` | `arrange` copies `orderId` from the route. Other workforce delivery commands forward the JSON body, including `deliveryId`, without that same route bind | `src/server/operations/http/delivery-routes.ts` |

PR #427 is a separate UI corrective. It is open and unmerged. It is not server remediation
and it is not read as closing these gaps. This annex does not edit those paths.

These three gaps block Architecture Lock for the X3 delivery-proof and cancellation journeys.
They do not block preparing the presentation Fit questions.

## 10. Independent review repairs

Read-only review on 2026-10-25 returned `SOUND_WITH_REPAIRS`. The blocking miss was this annex
describing the Administration entry list as six access “read and manage” keys. §3 now lists
the twelve keys actually in `ADMINISTRATION_ENTRY_PERMISSIONS`. The same pass added the
`delivery.read`-only hub case, the hand-entered Today URL limit, the status-only
`eligibleActions` fact on the T2 gate row, and a named `order.cancel` denial for WXE-PF-09.
No application source was edited.

## 11. What this annex does not do

- It does not grant Architecture Fit, Architecture Lock, a new Experience Gate PASS, or
  implementation authorization.
- It does not allocate an IMP or edit ROADMAP, STATE, ARCHITECTURE, or the decision register.
- It does not treat the historical Experience Gate PASS as covering Option R. That question
  stays in doc 24.
