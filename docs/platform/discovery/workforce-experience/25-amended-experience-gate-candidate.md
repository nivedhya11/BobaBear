<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  CANDIDATE: WXE-AMENDED-EXPERIENCE-GATE-CANDIDATE-1
  EXPERIENCE_GATE: NOT_DECIDED
  ARCHITECTURE_FIT: NOT_GRANTED
  ARCHITECTURE_LOCK: NOT_GRANTED
  APPLICATION_CODE_MUTATION: NO
-->

# Amended Experience Gate candidate — Option R presentation scope

```text
CANDIDATE_ID = WXE-AMENDED-EXPERIENCE-GATE-CANDIDATE-1
PACKAGE = WXE-CANDIDATE-1
XD_ID = XD-WXE-CANDIDATE-1
TASK = B4-D2
EXPERIENCE_CRITICALITY = X3 (package boundary; X2 workflows remain inside)
CHANGE_RISK = CR2
HISTORICAL_EXPERIENCE_GATE = PASS at 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89 (doc 15 §H2)
HISTORICAL_PASS_COVERS_OPTION_R = NO
OPTION_R = RATIFIED_RECORDED (docs 16 and 17; ratification is not this gate)
UPD-02 = A
UPD-03 = B
UPD-06 = YES
UPD-09 = UOE UX-A owns the shared label map
AMENDED_EXPERIENCE_GATE = NOT_DECIDED
EXPERIENCE_GATE_EXECUTION = PREPARED_NOT_PERFORMED
ARCHITECTURE_FIT = NOT_GRANTED
ARCHITECTURE_LOCK = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
SOURCE_TREE = origin/main a6155378b799e06a95b28c593ac1a340d7ca9245
STACKED_ON = 36c771962e15ff3a33370f621c8accdc2603b60d (PR #458)
MERGES_458 = NO
MERGES_TO_MAIN = NO
```

This candidate asks for a fresh Experience Gate on the post-PASS Option R amendment.
PD-2 requires an Experience Gate PASS before an X2/X3 Architecture Fit may finally PASS
(`X2_X3_ARCHITECTURE_FIT_REQUIRES_EXPERIENCE_GATE_PASS = YES`). Doc 16 records
`POST_PASS_AMENDMENT_NOT_COVERED_BY_HISTORICAL_PASS = YES`. Doc 24 Question A option B is
the process this candidate prepares. The historical PASS in doc 03 §13 and doc 15 §H2 stays
historical. This file does not re-date it, does not mark a new PASS, and does not grant
Architecture Fit or Architecture Lock.

## 1. Binding scope proposed

Status of every row: **PROPOSED**. Founder approval is required. Nothing in this section is a
Gate PASS.

| In the proposed amended scope | Binding proposal |
|---|---|
| Brand Commercial visibility | Show the Administration Commercial item only when the current session capability map has a commercial read (`catalog.read`, `menu.read`, `assortment.read`, `pricing.read`, `promotions.read`, or `coupons.read`) **and** `brand.read`. |
| Payload the predicate may read | The permission-union map from `getAdminSession`. It has no active brand id and no active outlet id. |
| Cross-grant visibility | When `brand.read` is true on any grant, the union flag is true. Navigation follows that flag. It does not follow the outlet the operator currently has selected. |
| Empty brand catalogue | A principal who already has `brand.read` still sees Commercial when the brand list is empty. Empty is not a reason to hide. |
| Direct Commercial URL | When the predicate is false, the brand-list landing is not the page they remain on. Recovery is WXE-AS-27. |
| Store-only operability | The Operations hub card is shown for `order.read` or any store coarse key. The card href is Today only when `order.read` is true; otherwise it is Store. |
| Administration entry | `ADMINISTRATION_ENTRY_PERMISSIONS` stays the current twelve keys. Commercial-read keys are not added. `outlet.read` entry for Kitchen and Delivery stays (UPD-03 B). |
| Scheduling discoverability | A Store Management item named Scheduling opens the existing scheduling profile client. No new route, permission, service, or order state. |
| Desktop and accessibility | Desktop-first at 1366×768, 1440×900, and 1920×1080. Hide, recovery, and the Scheduling item meet the accessibility minimums in §4. |
| Synthetic proof | Actors S1–S9 and WXE-PF-01..12 in annex 23 §8 are the future experience oracle. They are fixtures, not catalog roles. |
| Shared labels | Delivery / Takeaway, Now / Schedule, and the three collection verbs stay owned by UOE UX-A. |

Proposed exclusions, still binding if this gate later passes:

- UPD-08 Delivery Gaps 1–3 stay separately governed. This gate does not accept that risk.
- PR #427 stays a separate UI corrective. It is not server remediation of those gaps.
- Architecture Lock for the X3 delivery-proof and cancellation journeys stays blocked on a
  separate security disposition of Gaps 1–3.
- Per-scope navigation, an outlet-scoped Brand Commercial editor, a new `brand.read` grant,
  Commercial section deep links (UPD-07), and a new scheduling authority are outside this gate.
- IMP identity, ROADMAP, STATE, ARCHITECTURE, and the decision register are unchanged.

## 2. Scenarios and experience requirements

The historical Experience Definition remains `XD-WXE-CANDIDATE-1`. This amendment binds the
following rows. Other V1 rows in doc 08 stay as already specified and are not reopened here.

| Requirement | Experience the operator can rely on | Proof expectation |
|---|---|---|
| WXE-AS-01 / GJ-W8 | A principal with a commercial read and `brand.read` on the union map sees Administration and Brand Commercial. | S1, WXE-PF-01 |
| WXE-AS-25 | Commercial reads without `brand.read`, and without another Administration entry key, do not create an Administration card or a Commercial item. | S2, WXE-PF-02, WXE-PF-06 |
| WXE-AS-26 | Store Assortment and its static escalation remain available for an entitled store operator. That surface is not presented as Brand Commercial authoring, and it does not link into hidden Brand Commercial. | S3, WXE-PF-03 |
| WXE-AS-27 | A direct or return visit to `/workforce/admin/commercial/` while the predicate is false recovers to Store Assortment when the active outlet entitlement includes it, otherwise to Applications. | S8, WXE-PF-11 |
| WXE-AS-02 | A store-capable principal without `order.read` is sent to the first usable Store surface. The hub does not send them to Today. | S4, WXE-PF-04 |
| WXE-AS-11 / UPD-06 | Scheduling is a named Store Management destination, not only a block under Hours. | WXE-PF-07 |
| WXE-AS-13 | A principal with neither an entry key nor a commercial read still gets AccessDenied and a way back to Applications. | S7 |
| UPD-03 B | `kitchen_operator` and `delivery_coordinator` keep Administration entry through `outlet.read`. Hiding Commercial does not remove that entry. | S5, S6, WXE-PF-05 |
| S9 / WXE-PF-12 | One map that is true for `brand.read` anywhere in the union shows Commercial. A scope-switch test against a new session API is not required. | WXE-PF-12 |
| UPD-09 / WXE-AS-05 | Takeaway verbs and Delivery / Takeaway / Now / Schedule words come from the UOE UX-A map when that map exists. This gate does not supply substitute words. | WXE-PF-08, held until UX-A implementation is authorized |

X3 service promises in doc 03 §8 stay in force. Delivery proof, cancellation, and refund
honesty are not satisfied by hiding a navigation item. Those journeys remain subject to §6.

## 3. Source-conformance evidence

Annex 23 is preserved. It was prepared against `origin/main`
`a6155378b799e06a95b28c593ac1a340d7ca9245`. Application blobs on this branch match that tree.
This section records the same facts and the experience consequence this gate adds: the
amended experience **accepts the union payload as the visibility input**, including the
cross-grant limitation, and asks the Founder to understand that limitation before Fit.

Blob SHAs below are `git rev-parse a6155378:<path>` (identical on this docs stack).

### 3.1 Permission-union payload

`getAdminSession` calls `getEffectivePermissions` with the actor and no resource, then sets
each `PORTAL_SESSION_CAPS` flag from that set.

- `src/server/administration/use-cases.ts` blob `0ff76a534781d88fe87a6d13d6dc999357f3501a`,
  `getAdminSession` at lines 318–346. The call at line 328 passes `{ actor: principal }` only.
  The returned object is `workforceUserId`, `signedInLabel`, and `capabilities`.
- `PORTAL_SESSION_CAPS` begins at line 159. The comment at lines 153–157 says the flags are
  navigation-only and that server authorization remains authoritative. `brand.read` is included
  via `ACCESS_CAPS` at line 130.
- `getEffectivePermissions` in `src/server/access-control/authorize.ts` blob
  `d163d9bd135f43bbd84e544ee9291daf734914ab`, lines 311–321: with no resource, the function
  returns the distinct `permissionKey` values of all effective grants.
- The client session type in `src/lib/administration/api.ts` blob
  `64ea96cbf959d521afd7c1fa28bdb484f0673bd9`, lines 69–77, is
  `capabilities: Record<string, boolean>` plus identity fields. There is no active brand and
  no active outlet on that payload.

### 3.2 What that payload does to Commercial visibility today

`AdministrationAppShell` shows Commercial when any of the six commercial reads is true.
`brand.read` is not part of that condition.

- `src/components/administration/AdministrationAppShell.tsx` blob
  `1930225b2b0e8365a261855b09e19ca7c1c1cdb0`, `hasCommercialRead` at lines 41–47 and the
  Commercial item at lines 88–94.
- `hasAnyCommercialRead` in `src/components/administration/commercial/commercial-types.ts`
  blob `04c1ec87b548f8796559c67865890eeb88c3a3fa`, lines 60–68, uses the same six reads.
- `CommercialWorkspaceClient` (`src/components/administration/commercial/CommercialWorkspaceClient.tsx`
  blob `104c5015e61d3f423a8b197bbbc0d44055f7f110`, lines 166–183) calls `listAdminBrands()`
  once a commercial read is present. A successful response, including an empty item list,
  becomes `kind: "ready"`.

Built-in catalogs in `src/shared/access-control/catalog.ts` blob
`294fd0eabc8f9eee40aaa0dc52f8e7faf22aedef`:

| Role | Relevant keys | Commercial item today | Proposed predicate |
|---|---|---|---|
| `outlet_manager` (lines 219–261) | commercial reads and `outlet.read`; no `brand.read` | Shown | Hidden |
| `kitchen_operator` (lines 264–281) | `outlet.read` and `assortment.read`; no `brand.read` | Shown | Hidden |
| `delivery_coordinator` (lines 283–307) | `outlet.read`; none of the six commercial reads; no `brand.read` | Hidden | Hidden |
| `brand_admin` (lines 154–217) | `brand.read` and the commercial reads | Shown | Shown |
| `support_refund_operator` (`brand.read` at line 311; role key at line 334) and `finance_viewer` (`brand.read` at line 341; role key at line 357) | `brand.read` and at least one commercial read | Shown | Shown |

The proposed predicate reads flags the session already projects. It does not grant `brand.read`.

### 3.3 Cross-grant navigation visibility

Because the no-resource permission function unions every grant, a principal with `brand.read`
on one grant and outlet-only commercial reads on another receives both flags as `true`.
The shell cannot tell which grant produced which flag, and it receives no selected outlet.
Prepared actor S9 in annex 23 §8 is this case. WXE-PF-12 expects the Commercial item when the
union predicate is true, and it does not require a scope-switch test against a new API.

Experience consequence proposed here: that coarseness is an understood limitation of this
presentation scope. An operator can see Brand Commercial while their working context is an
outlet whose own grant does not include `brand.read`, if some other grant includes it. The
brand list they then receive is still the server-scoped list for `brand.read`. Choosing a
selected-outlet nav would be a new session contract and is outside this gate.

### 3.4 Server brand authorization, distinct from the shell

This reading does not identify a server authorization bypass, and it does not claim one.

`authorize` in `authorize.ts` lines 284–295 denies when the caller does not supply a resource.
Brand listing does not use the navigation boolean. `adminListBrands` (`use-cases.ts` lines
349–363) builds an eligible plan for `brand.read`. `compileEligibleScopePlan`
(`src/server/administration/eligible-set.ts` blob
`944281bb4a1828c559fd2ebdb3cc5b52d055afd9`, lines 45–50) returns `{ kind: "none" }` when no
grant carries that permission. `adminGetBrand` (lines 370–384) calls `requireAuthorization`
for `brand.read` on `{ type: "brand", brandId }`. `defendPage` (lines 246–253) filters a
fetched page against the same grant snapshot.

The shell predicate and these server checks answer different questions. The shell decides
whether to show a link. The server decides which brands, if any, that principal may list or
read. A true union flag does not enlarge the eligible brand plan. A false union flag does
not revoke a `brand.read` grant that already exists. This candidate did not re-audit every
commercial mutation handler; annex WXE-PF-09 remains the later negative-proof row for
manage calls, and it is not executed here.

ARCH-G11 remains the relevant architecture invariant: browser logic cannot become
authoritative commercial truth. The session comment in `use-cases.ts` lines 153–157 already
states that boundary.

### 3.5 Store-only operability and AS-27

Current hub entry is `order.read` only, and the card href is `/workforce/operations/`
(`src/lib/workforce-hub/destinations.ts` blob
`dbf5bd9e4b9ea260f0ac3f9789c020e14e9e0c0d`, lines 35–41).
`WorkforceHubClient` (`src/components/workforce/WorkforceHubClient.tsx` blob
`5c89c29ceaed8626da848f694da5434aa936a539`) renders `resolveAuthorizedDestinations` of that
same map. In-workspace Today also requires `order.read`
(`src/lib/operations/navigation.ts` blob `d0d7396107350e375d1fda4b330e0fe763ee0d6f`, lines
21–27). `listWorkforceOrders` requires `order.read`
(`src/server/order/workforce-reads.ts` blob `10676e6ffa00617562073cdb81cf9e148b24e108`,
line 48). `OperationsTodayClient` (`src/components/operations/OperationsTodayClient.tsx`
blob `fca4a339355d8aaa68d70bcd361ddf8b81add30b`, line 49) renders “Today could not be loaded.”
on a non-401 failure.

Store coarse keys are `STORE_COARSE_NAV_PERMISSIONS` in
`src/lib/operations/store-navigation.ts` blob `eb6c8e641ea5eb08ebf148addc958bacf77cbf6c`,
lines 107–115. No built-in role is store-coarse without `order.read`. S4 is a synthetic map.

Proposed experience: show the hub card when `order.read` is true or any store coarse key is
true; point the href at Today only when `order.read` is true; otherwise point it at Store.
`delivery.read` alone does not show the card. A hand-entered `/workforce/operations/` URL
still mounts Today. That direct-URL limit is residual (§7). The experience promise is the
hub href.

AS-27 recovery uses Store Assortment when the active outlet entitlement includes it. Store
sub-navigation already offers Assortment when Store is usable (same file, lines 48–61). The
active outlet entitlement is the store capability load, which is separate from the
Administration union map. When that entitlement is absent, recovery is Applications
(WXE-AS-13’s destination). AS-27 applies when the principal has commercial reads and fails
the brand-operable predicate. AS-13 remains the path when they have neither.

### 3.6 Administration entry preservation

`ADMINISTRATION_ENTRY_PERMISSIONS` is the twelve keys at `destinations.ts` lines 19–32.
Commercial-read keys are absent. `canAccessAdmin` uses that list
(`AdministrationAppShell.tsx` lines 154–155 and 188–191), so commercial reads alone already
receive AccessDenied on `/workforce/admin/`. The proposed scope keeps that list. Hiding
Commercial does not remove `outlet.read`. `kitchen_operator` and `delivery_coordinator` keep
the entry they have today. The System item is still pushed for every principal who reached
the shell (`AdministrationAppShell.tsx` lines 83–87). This gate does not invent a System
permission. Page handlers remain responsible for their own server checks.

### 3.7 Scheduling discoverability

`StoreSchedulingProfileClient` is rendered by the Hours page
(`src/app/workforce/(portal)/operations/store/hours/page.tsx` blob
`5b17e1999843475a717343a0c3c3f5496f1db0bb`, lines 23–37). The Store sub-nav label is Hours,
gated by `outlet.operating_schedule.read` (`store-navigation.ts` lines 69–74). There is no
Scheduling item. The HTTP route `scheduling-profile` is classified in
`src/server/operations/http/store-routes.ts` blob
`82815b95a2ca5663019008ba98916dd71f8401fb` at line 464. Get requires
`requireOperatingScheduleRead` (line 744). Set requires `requireOperatingScheduleManage`
(line 930). Those functions check `outlet.operating_schedule.read` and `.manage` for the
outlet (`src/server/assortment/authorize-assortment.ts` blob
`45978ce8ab479ba9e6f84c148f82bc9c4dc82363`, lines 186–197).

UPD-06 YES proposes a discoverable Scheduling item that opens this existing client. It adds
no scheduling service, permission, slot engine, or order state. `FULFILMENT_TIMING` stays
`ASAP | SCHEDULED` under D-379 / ARCH-G29.

### 3.8 Desktop and accessibility implications

Founder desktop-first direction stays bound: primary composition at 1366×768, 1440×900, and
1920×1080 (doc 07). Narrow screens are not Commercial authoring parity (doc 03 §11).

This amendment adds these experience obligations:

- A hidden Commercial item is absent from the navigation. It is not a control that still
  points at the brand-list landing.
- AS-27 recovery is a keyboard-reachable link or button to Store Assortment or Applications.
  The destination is in text. Focus moves to that recovery, not into a removed item.
- At 1366×768, Administration and Operations each keep one persistent section navigation
  (WXE-AS-23). Removing Commercial must leave Kitchen and Delivery operators with their
  remaining Administration items and a way back to Applications.
- The Scheduling item uses the accessible name Scheduling, is in the Store Management
  navigation, and is reachable without hovering and without scrolling past Hours to find
  the only copy of the profile.
- Existing single-H1 / single-main obligations (WXE-AS-24) and focus return on dialogs
  (doc 03 §10) are unchanged.

### 3.9 Synthetic-role expectations

S1–S9 are in-memory capability maps. They are not new catalog roles. Built-in roles may be
cited only to show that a fixture is realistic. Tests keep supplying the maps. Expectations
are annex 23 §8. They are not executed by this document. WXE-PF-10 is not an execution row.
WXE-PF-09 stays a later server-denial proof and does not add grants to make a row pass.

### 3.10 UOE-owned shared labels

UPD-09 stands. Annex 23 §7 records the dependency at PR #424 head
`3b207b3bb69f305353770315af7ad814a7e766d0`: `UOE-TRANCHE-UX-A-1` is `PLAN_ONLY`, and
`src/shared/ordering/uoe-presentation-labels.ts` is proposed there and not created.
Workforce collection verbs in that product definition are Prepare for collection, Ready for
collection, and Hand over order. This gate does not copy those strings into a second
authority. Navigation, Commercial show/hide, and Scheduling discoverability do not wait on
that file. Final Delivery / Takeaway / Now / Schedule words do. PR #456 is not the
dependency this package consumes.

## 4. What annex 23 already established, and what this amendment adds

Preserved from annex 23 and doc 24 §3, without rewriting them:

- F-1 union predicate, F-2 unchanged entry list, F-3 `outlet.read` entry, F-4 hub href,
  F-5 existing scheduling client, F-6 UOE label ownership, F-7 synthetic oracle.
- UPD-08 path citations in annex 23 §9.
- The twelve-key entry list correction recorded in annex 23 §10.

This amendment adds the Experience Gate question those facts require: the intended
experience, including union-payload visibility and the cross-grant limitation, is written
down for independent review and a Founder PASS or STOP. Annex 23 explicitly does not grant
that gate (annex 23 §11).

## 5. Experience Gate checklist (proposed answers)

```text
EXPERIENCE_GATE
Experience Intent defined: PROPOSED_YES (doc 03 §1; unchanged)
User goal understood: PROPOSED_YES (doc 03 §2, including “Why can’t I open Commercial?”)
Entry / discoverability defined: PROPOSED_YES (§1–§2; UPD-02 A, UPD-03 B, OPTION_R, UPD-06)
End-to-end journey defined: PROPOSED_YES (GJ-W8 success is the union-predicate principal)
Information architecture defined: PROPOSED_YES (seven presentation groups; no new authority)
Information hierarchy defined: PROPOSED_YES (one H1; Scheduling is a Store Management item)
Primary interaction defined: PROPOSED_YES (hide, recover, land on first usable surface)
Mental model / cognitive load considered: PROPOSED_YES (cross-grant coarseness is disclosed)
Friction reviewed: PROPOSED_YES (unusable Commercial hidden; Store path kept)
Trust-sensitive moments considered: PROPOSED_YES (proof, cancel, and refund stay outside this grant)
Content strategy defined: PROPOSED_YES (UPD-09; no second label map)
Error / recovery defined: PROPOSED_YES (AS-27, AS-13, AS-25)
Mobile / responsive defined: PROPOSED_YES (desktop-first; narrow recovery remains operable)
Accessibility considered: PROPOSED_YES (§3.8)
Service / operational promise aligned where applicable: PROPOSED_YES (doc 03 §8; UPD-08 unresolved)
Performance experience considered: PROPOSED_YES (doc 03 §11; no new client authority round-trip)
Measurement intent defined: PROPOSED_YES (doc 13 remains a draft; not finalized here)
Research / evidence level disclosed: YES (source reading of a6155378 plus Founder heuristic record)
Unresolved experience decisions: NONE proposed inside §1
Deferred, not erased: UPD-01 IMP identity; UPD-07 deep links; UPD-08 Gaps 1–3; UPD-05 merge/deploy;
  per-scope session projection; Architecture Fit; Design Readiness; Quality; Measurement;
  Implementation Authorization
EXPERIENCE_GATE_EXECUTION: PREPARED_NOT_PERFORMED
Result: NOT_DECIDED
```

## 6. UPD-08 exclusions

These remain true on `a6155378b799e06a95b28c593ac1a340d7ca9245`:

| Gap | Evidence | Blob |
|---|---|---|
| 1. Non-empty proof reference | `parseRecordProofAndDeliverInput` accepts any non-empty `proofReference` within the length bound (`src/shared/delivery/parse-input.ts` lines 385–397) | `142612a75c936ab7f5fae8e018c965bee3d6fd3d` |
| 2. Cancellation-path automatic inactivity attestation | `workforceCancelDelivery` sets `inactiveBookingConfirmed: true` when status is not `REQUESTED` (`src/server/delivery/workforce.ts` lines 385–397) | `40f7709b8abf430c14517955e030edca0d60f01e` |
| 3. URL `orderId` versus body `deliveryId` | `arrange` copies `orderId` from the route. Other workforce delivery commands forward the JSON body (`src/server/operations/http/delivery-routes.ts` lines 138–165) | `441294e80403df2933a902ddbb422ae918b219d9` |

PR #427 (`WXE-P0-CORRECTIVE-1`, open, unmerged) may change delivery UI hygiene. It is not
read as closing these three server gaps. This gate does not accept the risk. Architecture
Lock for the affected X3 delivery-proof and cancellation journeys continues to require a
separate security disposition. Presentation Fit for the non-delivery surfaces in §1 may be
considered only after this Experience Gate is PASS. Lock of those X3 journeys may not.

## 7. Residual risks

| Risk | Status in this candidate |
|---|---|
| Cross-grant Commercial visibility (S9) | Disclosed and inside the proposed scope. Operators may see Brand Commercial because another grant has `brand.read`. Server brand scope still applies. |
| Hand-entered Today URL without `order.read` | Hub promise only. The page still mounts Today. WXE-PF-04-DIRECT stays recorded so a hub test is not treated as a redirect. |
| `support_refund_operator` and `finance_viewer` | They match the predicate and remain Commercial-visible. This gate does not add an exclusion. |
| Direct-URL AS-27 versus server brand list | Specified, not implemented. Current client can still render an empty or failed brand list. |
| System nav item without its own permission | Unchanged. Page handlers remain the server boundary. |
| UOE label file absent | Final words wait. Navigation semantics do not. |
| UPD-08 | Open. Blocks Lock of the affected X3 journeys. |
| Commercial mutation handlers | Not re-audited in this preparation. No exploit is claimed from the union payload. |

## 8. Independent-review request

```text
REVIEW_REQUEST
Object: WXE-AMENDED-EXPERIENCE-GATE-CANDIDATE-1
Document: docs/platform/discovery/workforce-experience/25-amended-experience-gate-candidate.md
Ask: Independent review of the exact head that contains this file.
Reviewer is not the preparer and is not the Founder.
Please check:
  1. Proposed §1 matches ratified Option R plus preserved UPD-02 A, UPD-03 B, UPD-06 YES, and UPD-09.
  2. Source citations still match origin/main a6155378b799e06a95b28c593ac1a340d7ca9245.
  3. Cross-grant visibility is described as presentation coarseness of the union payload.
  4. No sentence claims a server exploit, a new brand.read grant, or an outlet-scoped Commercial editor.
  5. UPD-08 Gaps 1–3 remain Lock blockers for the affected X3 journeys, and PR #427 is not treated as their fix.
  6. Result, Fit, and Lock remain NOT_DECIDED / NOT_GRANTED.
Return: PASS recommendation or STOP, with the evaluated head SHA.
The reviewer does not record the Founder verdict.
```

### Preparer notes

```text
ROLE = PREPARER
PREPARER_VERDICT = NOT_A_REVIEW
PREPARER_STATUS = READY_FOR_INDEPENDENT_REVIEW
DATE = 2026-10-25
METHOD = Read-only comparison of the cited blobs to origin/main a6155378. Annex 23 was
  treated as prior evidence and re-checked at the line numbers above. Authorization tests
  were not re-run. Commercial mutation handlers were not re-audited.
THIS_NOTE_IS_NOT_AN_INDEPENDENT_REVIEW = YES
THIS_NOTE_DOES_NOT_RECOMMEND_FOUNDER_PASS = YES
```

## 9. Founder decision

The Founder is asked to approve or stop the proposed scope in §1. Leave the verdict blank
until that decision. An agent must not fill it.

```text
FOUNDER_AMENDED_EXPERIENCE_GATE
Candidate: WXE-AMENDED-EXPERIENCE-GATE-CANDIDATE-1
Document: docs/platform/discovery/workforce-experience/25-amended-experience-gate-candidate.md
Question: PASS this amended Experience Gate for the §1 scope, or STOP?

PASS means the intended amended presentation experience is understood: union-payload
Commercial visibility, the cross-grant visibility limitation, AS-27 recovery, preserved
Administration entry, first-usable Operations landing, Scheduling discoverability, desktop
and accessibility minimums, synthetic-role expectations, and UOE-owned labels.
PASS does not grant Architecture Fit, Architecture Lock, Design Readiness, Quality or
Measurement finalization, Implementation Authorization, a new permission, or UPD-08 risk
acceptance. PASS does not mean a server authorization bypass was found or fixed.

STOP means the amended experience is not accepted. Architecture Fit stays blocked.

Verdict: NOT_DECIDED
Founder:
Date:
Evaluated head:
```

## 10. Consequences for the later F-1–F-7 Fit decision

Doc 24 remains the Fit packet. This file does not answer doc 24 Question A and does not
accept Question B. Fit stays blocked while this gate is `NOT_DECIDED`.

| Later Fit item | While this gate is NOT_DECIDED | If the Founder later records PASS | If the Founder records STOP |
|---|---|---|---|
| F-1 Commercial predicate | Blocked. The predicate is only a proposal. | May be considered for the union payload, including S9 coarseness. | Must not be recorded as accepted experience. |
| F-2 Entry list | Blocked with the set. | May keep the twelve keys unchanged. | Same. |
| F-3 `outlet.read` entry | Blocked with the set. | May preserve Kitchen and Delivery entry. | Same. |
| F-4 Operations landing | Blocked with the set. | May accept the hub href rule. The direct Today URL remains residual. | Must not be recorded as accepted experience. |
| F-5 Scheduling item | Blocked with the set. | May accept discoverability of the existing client. | Same. |
| F-6 UOE labels | Blocked with the set. | May keep UOE as the only shared map. Final words still wait on UX-A authorization. | Same. |
| F-7 Synthetic oracle | Blocked with the set. | May accept S1–S9 and WXE-PF-01..12 as the future oracle, with WXE-PF-10 excluded. | Same. |
| Architecture Fit PASS | Not granted. | Still a separate decision. This gate does not record it. | Not granted. |
| Architecture Lock | Not granted. UPD-08 still blocks Lock of the affected X3 delivery-proof and cancellation journeys. | Unchanged. | Unchanged. |
| Design Readiness, Quality, Measurement, Implementation | Not authorized. | Still require their own gates after Fit. | Not authorized. |

Accepting F-1 without F-2, or replacing F-1 with an outlet-scoped editor, reopens Option R.
That pair stays together for the later Fit decision, and only after this gate is PASS.
