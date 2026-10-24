<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# OPTION_R — Founder ratification record, focused review, and Architecture Fit decision package

```text
RECORD_ID = WXE-OPTION-R-RATIFICATION-RECORD-1
PACKAGE = WXE-CANDIDATE-1
TASK = WXE-OPTION-R-FOUNDER-RATIFICATION-W2
WAVE = BOBA-INTEGRATION-READINESS-WAVE-20261024 (W2) — coordination GitHub #432
AMENDMENT_RATIFIED = WXE-OPTION-R-P1-COMM-AMENDMENT-1 (doc 16)
RATIFIED_SOURCE_HEAD = a1437e5643504814ceebcc2732cd4eed7bf0338e (doc 16 text as ratified)
FOUNDER_RATIFICATION = RECORDED
FORMAL_NEW_PD_XD_GATE_PASS = NOT_GRANTED
FORMAL_ARCHITECTURE_FIT_OR_LOCK = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
APPLICATION_CODE_MUTATION = NO
PR_426_MERGE = NO
PR_427_MERGE_OR_DEPLOY = NO
UPD_08_RISK_ACCEPTANCE = NOT_GRANTED
```

## 1. Purpose and authority boundary

This document records the Founder decision to **ratify** the bounded `WXE-P1-COMM = OPTION_R`
Product/Experience scope amendment packaged in
[`16-option-r-p1-comm-amendment-and-proof-matrix.md`](./16-option-r-p1-comm-amendment-and-proof-matrix.md),
adds a focused independent Product/Experience review of the ratified text, and returns a
Founder-ready **Architecture Fit decision package** for the permitted presentation scope.

It is a **recording** artifact. It does not:

- grant a new Product Definition Gate PASS or Experience Gate PASS
- grant Architecture Fit or Architecture Lock
- grant Implementation Authorization, merge, deploy, or IMP identity
- accept UPD-08 Delivery Gaps 1–3 as release risk
- change application behaviour, RBAC tables, APIs, or permission catalogues

The historical Founder PD/XD Gate PASS recorded in
[`15-gate-disposition-founder-decision-record.md`](./15-gate-disposition-founder-decision-record.md)
§H1/§H2 at reviewed contract HEAD `560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89` is **preserved as
historical provenance**. Ratification of OPTION_R does not rewrite, extend, or re-date that PASS.

## 2. Founder ratification record

```text
DECISION_ID = WXE-FOUNDER-P1-COMM-OPTION-R-RATIFICATION
AUTHORITY = Founder — explicit "proceed" approving the W2 integration/readiness wave
            (GitHub #432, 2026-10-24 Asia/Kolkata) + W2 Agent B task contract
            "FOUNDER APPROVES ratification of bounded Option R amendment"
DECISION_DATE = 2026-10-24
DECISION_TIMEZONE = Asia/Kolkata
RATIFIED_DOCUMENT = 16-option-r-p1-comm-amendment-and-proof-matrix.md @ a1437e5643504814ceebcc2732cd4eed7bf0338e
RATIFIED_SECTIONS = doc 16 §2 (binding intent), §3 (compatibility + P1-ENTRY × OPTION_R), §4 (operability semantics),
                    §5 (GJ-W8 amendment), §6 (synthetic actors), §7 (proof matrix — as expectations, not executed proofs)
RESULT = RATIFIED (bounded Product/Experience scope amendment)
STATUS_BEFORE = APPROVED_IN_WAVE_CONTRACT — PENDING_PACKAGE_RATIFICATION_RECORD
STATUS_AFTER = RATIFIED — RECORDED
```

### 2.1 Ratified meaning (binding Product/Experience interpretation for V1)

| # | Ratified clause | Meaning |
|---|---|---|
| R1 | Brand Commercial Workspace **remains brand-scoped** | `Administration → Menu & Commercial → Brand Commercial Workspace` is the existing brand-scoped IMP-036F/J workspace. No outlet-scoped variant, no second Commercial editor, no Store surface relabelled as Brand Commercial authoring. |
| R2 | Operability predicate | A principal needs a **valid effective commercial permission** (`catalog.read` \| `menu.read` \| `assortment.read` \| `pricing.read` \| `promotions.read` \| `coupons.read`) **AND** `brand.read` for the **applicable (active) scope** before Brand Commercial is presented as operable. Static predicate over effective permissions; not a runtime brand-list probe; absence of `brand.read` → predicate false. |
| R3 | Hide unusable authoring | `outlet_manager` and any other principal not satisfying R2 must **not** see unusable Brand Commercial authoring navigation. Direct links / return-to into `/workforce/admin/commercial/…` recover deterministically (AS-27) instead of rendering a broken brand-list landing. |
| R4 | Preserve legitimate Store experience | Store Management operations, **read-only** Store Assortment, and existing **static** escalation copy remain available where entitled. No Brand Commercial cross-link is shown to principals for whom Brand Commercial is hidden. |
| R5 | No invention | No new RBAC, no new API, no new brand authorization, no silent `brand.read` grant, no hidden server entitlement, no second Commercial authority. Server authorization semantics are unchanged; OPTION_R is presentation/navigation truthfulness only. |

### 2.2 Confirmed as one coherent V1 interpretation

The Founder confirms the following decisions are jointly in force and mutually consistent:

| Decision | Confirmed V1 interpretation |
|---|---|
| **UPD-02 = A** | Permission-correct Administration entry and first-usable Operations landing (never land on a surface that will 403). **Refined by OPTION_R:** commercial-read keys **without** `brand.read` must not alone create an Administration destination whose only commercial purpose OPTION_R would hide (no empty Admin shell). Net V1 effect: Administration entry keys unchanged in practice, because brand-operable principals already enter via `brand.read` (already in `ADMINISTRATION_ENTRY_PERMISSIONS`). |
| **UPD-03 = B** | Kitchen / Delivery roles keep their existing `outlet.read`-based Administration entry. Hiding unusable Brand Commercial navigation must **not** revoke or narrow that entry. |
| **UPD-06 = YES** | Scheduling is first-class navigation under Store Management, reusing existing scheduling capability only. |
| **GJ-W8 / AS-25 / AS-26 / AS-27** | Amended actor and authorization expectations per doc 16 §5 and doc 08: GJ-W8 success actor is a **brand-operable** commercial principal; AS-25 (commercial reads without `brand.read` → hide, no empty Admin), AS-26 (Store Assortment read-only + static escalation, no Brand Commercial cross-link), AS-27 (deterministic direct-link recovery) are V1 promises. |
| **UPD-09** | UOE UX-A (PR #424) remains the owner of the shared Delivery/Takeaway + Now/Schedule label map; WXE consumes and does not fork a workforce verb map. OPTION_R nav semantics do not depend on UOE merge. |

### 2.3 Rejected alternative (recorded)

The historical open wording “hide **or** provide outlet-scoped commercial entry” is closed.
**Hide** is selected. An outlet-scoped “Brand Commercial” authoring shell is **rejected**.

## 3. Security boundary (unchanged by ratification)

```text
UPD-08_DELIVERY_GAPS_1_TO_3 = UNRESOLVED — SEPARATELY_GOVERNED
ARCHITECTURE_LOCK_AFFECTED_X3_JOURNEYS = BLOCKED (delivery-proof / cancellation)
ACCEPTED_RELEASE_RISK = NO
PR_427 = SEPARATE UI CORRECTIVE — NOT SERVER REMEDIATION — NOT MERGED — NOT CLAIMED TO CLOSE GAPS
```

- Gap 1 (arbitrary non-empty proof reference accepted server-side), Gap 2 (cancel-path
  automatic inactivity attestation), and Gap 3 (URL `orderId` vs body `deliveryId` binding)
  remain open and are governed under UPD-08 `SEPARATE_CORRECTIVE`.
- They **block Architecture Lock** for the affected X3 delivery-proof and cancellation journeys
  until a Founder security disposition exists. They are **not** accepted release risks.
- PR #427 (`WXE-P0-CORRECTIVE-1`) is a UI corrective reducing fabricated prefills and one-click
  terminal actions. It is **not** server remediation, does not close Gaps 1–3, and remains
  unmerged / undeployed (UPD-05).
- OPTION_R ratification is orthogonal to UPD-08 and must not be read as touching it.

## 4. Focused independent Product / Experience review (W2)

```text
REVIEW_WAVE = WXE_OPTION_R_RATIFICATION_W2_FOCUSED
REVIEWED_HEAD = a1437e5643504814ceebcc2732cd4eed7bf0338e (doc 16 + docs 02/03/04/08/10/15 as amended)
REVIEWER = W2 Agent B (documentation recorder; review is advisory evidence, not a gate)
SCOPE = Does the ratified text form one coherent, implementable-without-invention V1
        interpretation consistent with UPD-02 A / UPD-03 B / UPD-06 YES / UPD-09 and the
        no-new-RBAC boundary?
PRODUCT_VERDICT = RECOMMENDED_COHERENT (advisory; no blocking finding)
EXPERIENCE_VERDICT = RECOMMENDED_COHERENT (advisory; no blocking finding)
FORMAL_GATE_EFFECT = NONE
```

### 4.1 Verified facts relied on

| Fact | Status | Evidence |
|---|---|---|
| `brand.read` is already an Administration entry key | VERIFIED | `src/lib/workforce-hub/destinations.ts` `ADMINISTRATION_ENTRY_PERMISSIONS` includes `"brand.read"` |
| Brand list (Brand Commercial landing path) is server-gated on `brand.read` | VERIFIED | `src/server/administration/use-cases.ts` brand listing compiles eligible plan / defends page for `"brand.read"`; client `listAdminBrands` → `/api/admin/v1/resources/brands` |
| Commercial Workspace client loads the brand list on entry | VERIFIED | `src/components/administration/commercial/CommercialWorkspaceClient.tsx` calls `listAdminBrands()` |
| Historical PD/XD PASS @ `560048ffc…` unchanged | VERIFIED | doc 15 §H1/§H2 text untouched by this record |

### 4.2 Product review notes

| # | Check | Result |
|---|---|---|
| P-1 | Does OPTION_R change any accepted domain authority? | No. Brand Commercial remains IMP-036F/J brand-scoped; ADR-006 separation preserved; Store Assortment stays Store-owned read-only view. |
| P-2 | Is the empty-Admin-shell risk from UPD-02 A's commercial-read union closed? | Yes — doc 16 §3 reconciliation: commercial reads without `brand.read` must not alone create Admin. Net V1 entry keys unchanged in practice. |
| P-3 | Does hide conflict with UPD-03 B? | No — hide is orthogonal to `outlet.read` entry; doc 16 §4 “Do not” list and S5/S6 actors make this explicit. |
| P-4 | Is any permission, API, or brand authorization invented? | No — predicate reads effective permissions only; no runtime probe; no grant; no lookup API for escalation. |
| P-5 | Is the rejected alternative recorded so it cannot resurface silently? | Yes — doc 16 §2 “Rejected alternative”; this record §2.3. |
| P-6 | Residual (MINOR, non-blocking) | S4 row (“Store without `order.read`”) depends on the Ops hub visibility rule from UPD-02 A; Fit should state the exact Ops destination predicate so S4 is testable. Carried into §5 decision package item F-4. |

### 4.3 Experience review notes

| # | Check | Result |
|---|---|---|
| X-1 | Truthful affordances (EXP-1) — no visible item that knowingly 403s or renders a broken list | Satisfied by hide + AS-27; empty brand catalogue for a `brand.read` holder still shows nav (empty ≠ broken). |
| X-2 | Deterministic recovery for deep links / return-to | AS-27 defined (Store Assortment if entitled in active scope, else Applications); tie-break vs AS-13 specified. |
| X-3 | Store-only principal is not made to feel downgraded or misdirected | Store ops + read-only assortment + static escalation preserved; no dead cross-link into hidden Brand Commercial. |
| X-4 | Scope switching (S9) | Predicate is per active scope; no sticky global show/hide. |
| X-5 | Labels | UOE UX-A owns shared verbs (UPD-09); OPTION_R introduces no new customer-facing or operator verbs. |
| X-6 | Residual (MINOR, non-blocking) | Static escalation copy wording for AS-26 should be confirmed against LANG-1 at Design Readiness; no new meaning is introduced, so not a ratification blocker. |

### 4.4 Review conclusion

No finding prevents recording the ratification. Residual items P-6 and X-6 are carried into the
Architecture Fit / Design Readiness decision packages rather than reopening the amendment.
Agent verdicts are advisory; they are **not** a Product Definition Gate, Experience Gate,
Architecture Fit, or Lock.

## 5. Founder-ready Architecture Fit decision package (presentation scope only)

```text
FIT_CANDIDATE = ARCH-WXE-FIT-CANDIDATE-1 (doc 10)
FIT_DECISION_STATUS = READY_FOR_FOUNDER_DECISION — NOT_GRANTED
PERMITTED_FIT_SCOPE = presentation / navigation / operator-safety over accepted capabilities,
                      EXCLUDING X3 delivery-proof and cancellation journeys affected by UPD-08
LOCK_STATUS = NOT_GRANTED; BLOCKED for UPD-08-affected journeys regardless of Fit outcome
```

### 5.1 What the Founder is asked to decide (Fit only — Lock is separate)

| # | Fit question | Candidate proposal (doc 10 + doc 16 §8) | Decision requested |
|---|---|---|---|
| F-1 | Does OPTION_R presentation gating fit ARCH-R23 without a new domain authority? | Yes — static predicate over client effective-permission payload; reuses brand-scoped Commercial workspace; ADR-006 preserved | ACCEPT / REJECT / AMEND |
| F-2 | Does P1-ENTRY × OPTION_R leave `ADMINISTRATION_ENTRY_PERMISSIONS` semantically unchanged for V1? | Yes — brand-operable principals already enter via `brand.read`; the commercial-read union is nominal/future-proofing and must not alone create Admin | ACCEPT / REJECT / AMEND |
| F-3 | Is UPD-03 B preserved under hide? | Yes — `outlet.read` entry untouched; hide is presentation only | ACCEPT / REJECT / AMEND |
| F-4 | Operations destination / first-usable landing predicate (UPD-02 A) | Fit must name the exact Ops destination predicate and first-usable ordering so S4 is testable; no Today landing when Today 403s | DEFINE_AT_FIT (no product change) |
| F-5 | UPD-06 Scheduling under Store Management | Reuse existing scheduling component; extend discoverability only; no new scheduling API/authority | ACCEPT / REJECT / AMEND |
| F-6 | UPD-09 label consumption | WXE consumes UOE UX-A map; no competing verb map; label application sequenced after UOE UX-A contract approval | ACCEPT / REJECT / AMEND |
| F-7 | Proof matrix WXE-PF-01…12 as future implementation acceptance oracle | Adopt as the capability-fixture oracle for an eventually authorized tranche; not executed now | ACCEPT / REJECT / AMEND |

### 5.2 What is explicitly **excluded** from this Fit decision

| Excluded | Reason |
|---|---|
| Architecture **Lock** (any journey) | Separate decision; NOT_GRANTED |
| X3 delivery-proof / cancellation journeys | UPD-08 Gaps 1–3 unresolved → Lock BLOCKED; Fit may not be used to imply safety |
| Server RBAC / permission catalogue changes | Forbidden by OPTION_R and UPD-02 A boundary; escalate true API conflicts instead |
| New APIs (escalation lookup, outlet-scoped commercial, scheduling) | Forbidden |
| Design Readiness, Quality Plan, Measurement Plan finalization | Separate PD-2 gates |
| Implementation Authorization, IMP identity (UPD-01), merge of #426/#427 | Separate Founder R3 decisions |

### 5.3 Pre-conditions a Fit PASS would still leave open (not granted here)

1. Design Readiness for AS-26 static escalation copy (LANG-1 check) and AS-27 recovery surface.
2. Quality / Test Plan finalization binding WXE-PF-01…12 to capability fixtures.
3. Measurement Plan finalization.
4. UPD-08 security disposition before any Lock of delivery-proof / cancellation journeys.
5. Implementation Authorization and (UPD-01) IMP identity allocation.

## 6. Explicit non-mutations in this record

- No Workforce application, RBAC, API, or permission-catalogue change
- No Delivery server Gap 1–3 remediation; no claim that PR #427 remediates them
- No edits to ROADMAP / STATE / decision-register / ARCHITECTURE / UOE #424 / corrective #427
- No new PD/XD Gate PASS, Architecture Fit, Architecture Lock, Implementation Authorization
- No merge or deploy of PR #426 or PR #427

## 7. Later packaging pointer (does not amend §§1–6)

[`18-consolidated-architecture-fit-decision-package.md`](./18-consolidated-architecture-fit-decision-package.md)
packages the same F-1..F-7 questions for one Founder decision. Docs 19–22 are PLANNED T1–T4 work
packages. They do not change this ratification, do not add a Commercial option, and do not record
Architecture Fit PASS or Architecture Lock.

## 8. Alignment snapshot (recording agent)

```text
Repository Authority: VERIFIED remote nivedhya11/BobaBear
Publication worktree: /home/ajoshi/repos/boba-bear-wave-c-wxe (exclusive W2 Agent B)
Starting HEAD: a1437e5643504814ceebcc2732cd4eed7bf0338e
Verified origin/main: 00ef486e9dbeb1a30ba32e76fcd7b8b43507a53f
Vision VISION-1 · Roadmap GTM-R190 · State STATE-R189 · Architecture ARCH-R23 · Decision register DR-25
Product delivery PD-2 · Experience EXP-1 · Product language LANG-1 · Testing TEST-1
Accepted Through: IMP-036I · Current Product Slice: IMP-036J (pendingAcceptance) · Next: IMP-036K
Risk Level: R2 (documentation under Founder R3 decision)
DELIVERY_MODE: PUBLISH_PR (existing PR #426 only; PR_MERGE_TO_MAIN = NO)
APPLICATION_CODE_MUTATION: NO
Gate Result (alignment for docs recording): PASS
PROMPT DEVIATIONS: NONE
```
