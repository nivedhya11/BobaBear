<!-- governance-meta
{
  "status": "CURRENT",
  "authority": "IMPLEMENTATION_SEQUENCE",
  "roadmapVersion": "GTM-R178",
  "acceptedThrough": "IMP-036I",
  "currentProductSlice": "IMP-036J",
  "nextProductSlice": "IMP-036K",
  "gtmBoundary": "IMP-040",
  "lastReviewed": "2026-10-01",
  "supersedes": "GTM-R177"
}
-->

# BOBA Bear — Implementation Roadmap

## 1. Roadmap Rules

- Accepted IMP identity is **permanently immutable**. Do not reinterpret or renumber accepted
  history (IMP-001 → IMP-025 and IMP-005A).
- No other document may independently redefine IMP numbering.
- Formal ROADMAP ledger IMP identifiers use `IMP-\d+[A-Z]?` (numeric id with optional single
  uppercase inserted suffix). Examples: `IMP-001`, `IMP-005A`, `IMP-026C`. Multi-letter,
  lowercase, hyphenated, or underscore forms are not formal ledger ids.
- Only one product slice is normally active.
- A deferred capability cannot be assigned or promoted by an implementation agent.
- Roadmap changes require a `roadmapVersion` change.
- Prefer suffix insertion or explicit versioned remapping rather than silently recycling a
  previously published IMP meaning.
- Future planned mappings must not be silently reused for another capability.
- Coding-agent completion is not acceptance. Acceptance is recorded in [`STATE.md`](./STATE.md).
- After `COMPLETE_AND_ACCEPTED`, a separate reconciliation must update STATE / ROADMAP / acceptance
  records (and DECISION-REGISTER / ARCHITECTURE when durable decisions or global architecture
  change) before the next slice begins: **ACCEPT → RECONCILE → ADVANCE**.
- The historical IMP-026 → IMP-028 controlled-continuation exception (GTM-R15 onward) is **CLOSED**.
  It does **not** generalize to future slices and is **not** reopened by GTM-R138 / GTM-R139 /
  GTM-R140 / GTM-R141 / GTM-R142 / GTM-R143 / GTM-R144 / GTM-R145 / GTM-R146 / GTM-R147 / GTM-R148 / GTM-R149 / GTM-R150 / GTM-R151 / GTM-R152 / GTM-R153 / GTM-R154 / GTM-R155 / GTM-R156 / GTM-R157 / GTM-R158 / GTM-R159 / GTM-R160 / GTM-R161 / GTM-R162 / GTM-R163 / GTM-R164 / GTM-R165 / GTM-R166 / GTM-R167 / GTM-R168 / GTM-R169 / GTM-R170 / GTM-R171 / GTM-R172 / GTM-R173 / GTM-R174 / GTM-R175 / GTM-R176 / GTM-R177 / GTM-R178.
- **GTM-R138** records a **NEW**, Founder-authorized one-off exception
  `CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038` (authority PR#179/5771367844) so
  IMP-038 may activate for PD-1 Product Definition work while IMP-037 remains an
  unresolved `IMPLEMENTATION_IN_PROGRESS` predecessor blocked on external provider proof.
  Formal acceptance remains contiguous (`IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES`).
  This exception does **not** accept IMP-037, advance `acceptedThrough`, authorize IMP-038
  implementation, or activate IMP-039.
- **GTM-R141** records a **NEW**, Founder-authorized program decision **D-377**
  (`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED`) that inserts pre-GTM product
  slices IMP-036H (APPROVED Product Definition; Gate PASS) and IMP-036I (planned only) after accepted
  IMP-036G, while holding IMP-037 / IMP-038 and keeping IMP-039 / IMP-040 unactivated. Historical
  `CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038` remains interpretable history and is
  **not** erased. This decision does **not** accept IMP-037 or IMP-038, does **not** close
  `GAP-EXT-ASSESS-001`, does **not** authorize IMP-036H implementation, and does **not** activate
  IMP-036I / IMP-039 / IMP-040.
- **GTM-R163** records a **NEW**, Founder-authorized sequencing decision **D-382**
  (2026-09-27) that inserts **IMP-036J — Promotions, Coupons & Offers** before held IMP-037
  and activates it for Product Definition work only. D-377 remains CURRENT program-pause
  authority. D-382 does not reinterpret D-377 as unlimited insertion authority. Deals,
  Campaigns, and Revenue Recommendations remain parked discovery with no IMP identity.
  This decision does **not** authorize IMP-036J implementation, pass a Product Definition
  Gate, perform Architecture Fit, change ARCH-R23, unhold IMP-037 / IMP-038, close
  `GAP-EXT-ASSESS-001`, or activate IMP-039 / IMP-040.
- **GTM-R164** records `PD-IMP-036J-DRAFT-2` as `DRAFT_READY_FOR_GATE` after Founder
  approval of FD-036J-01 on 2026-09-27. It does not create D-383, does not approve the
  Product Definition, does not execute the Product Definition Gate, does not perform
  Architecture Fit, and does not authorize implementation.
- **GTM-R165** records `PD-IMP-036J-DRAFT-3` as `DRAFT_READY_FOR_GATE` after Founder
  approval of FD-036J-02 on 2026-09-27. It does not create D-383, does not approve the
  Product Definition, does not execute the Product Definition Gate, does not perform
  Architecture Fit, and does not authorize implementation. Historical DRAFT-2 stays
  pre-Gate on canonical main. DRAFT-2 Gate persistence was not merged.
- **GTM-R166** records `PD-IMP-036J-DRAFT-4` as `DRAFT_READY_FOR_GATE`. It does not create
  D-383, does not approve the Product Definition, does not execute the Product Definition
  Gate, does not perform Architecture Fit, and does not authorize implementation. Historical
  DRAFT-3 was ready for Gate. An independent Gate evaluation initially returned PASS, then
  exact-head review findings `4115981679` and `4115981682` on unmerged pull request #312
  reopened the acceptance slice. Gate PASS was not persisted. Canonical main never recorded
  DRAFT-3 as APPROVED. DRAFT-4 supersedes DRAFT-3.
- **GTM-R178** records IMP-036J implementation start at Tranche 1
  `COMMERCIAL_PERSISTENCE`. `IMP036J_STARTED` becomes `YES`.
  `IMP036J_IMPLEMENTATION_STARTED` becomes `YES`. Formal lifecycle becomes
  `IMPLEMENTATION_IN_PROGRESS`. `IMP036J_IMPLEMENTATION_COMPLETE` stays `NO`.
  `IMP036J_ACCEPTED` stays `NO`. `FOUNDER_UAT` stays `NOT_PERFORMED`. `nextGate`
  stays `IMPLEMENTATION_TRANCHE_1`. Tranche 1 is `IN_REVIEW` and is not `PASS`.
  Tranche 2 has not started. `acceptedThrough` stays IMP-036I.
  `currentProductSlice` stays IMP-036J. `nextProductSlice` stays IMP-036K.
  Architecture stays `LOCKED` on `IMP-036J-FIT-CANDIDATE-9`. ARCH-R23 is
  unchanged. DR-24 is unchanged. D-383 stays CURRENT. D-382 stays amended only
  by D-383. No new decision, ADR, or architecture revision is created. This
  start does not complete implementation, pass Tranche 1, or authorize Tranche 2.
- **GTM-R177** records Founder decision **D-383** (2026-10-01): Pre-GTM Revenue
  Recommendations Insertion / Parallel Definition Authorization. Formal identity is
  **IMP-036K — Revenue Recommendations**. `"IMP-036K"` was previously only a working label.
  D-383 allocates that identity and authorizes parallel Product Definition preparation and
  Experience Definition preparation only. `IMP036K_PRODUCT_DEFINITION` is `NOT_CREATED`.
  `IMP036K_PRODUCT_DEFINITION_GATE` is `NOT_PERFORMED`. `IMP036K_EXPERIENCE_DEFINITION` is
  `NOT_CREATED`. `IMP036K_EXPERIENCE_GATE` is `NOT_PERFORMED`. Experience Criticality is `X3`.
  Change Risk is `CR2`. Architecture Fit, Design Readiness, and the Implementation Plan are
  `NOT_PERFORMED`. Implementation is unauthorized and unstarted. `acceptedThrough` stays
  IMP-036I. `currentProductSlice` stays IMP-036J. `nextProductSlice` becomes IMP-036K, which
  precedes held IMP-037. IMP-036J stays implementation-authorized and not started, with
  `nextGate` `IMPLEMENTATION_TRANCHE_1`. D-383 amends D-382 only for Revenue Recommendations
  identity, activation, and sequencing. D-382's Promotions-first IMP-036J decisions remain
  binding. Deals and Campaigns remain parked discovery with no IMP identity. This revision is
  the shared-governance serialization checkpoint: later IMP-036J implementation tranches and
  IMP-036K definition preparation may proceed as separate workstreams, while future shared
  ROADMAP, STATE, and decision-register persistence stays serialized. D-383 does not authorize
  Architecture Fit, Design Readiness, an Implementation Plan, runtime or schema work,
  implementation, release, or acceptance for IMP-036K, and it does not start IMP-036J
  Tranche 1. ARCH-R23 is unchanged. DR-24 records D-383. No ADR is created.
- **GTM-R176** records Founder Implementation Authorization for IMP-036J on 2026-10-01.
  Human authority is pull request #332 comment `5926464685`.
  `IMP036J_IMPLEMENTATION_AUTHORIZATION` is `APPROVED`.
  `IMP036J_IMPLEMENTATION_AUTHORIZED` is `YES`.
  `IMP036J_IMPLEMENTATION_AUTHORIZATION_DATE` is `2026-10-01`.
  The authorized plan remains `IMP-036J-PLAN-CANDIDATE-1`. Authorized tranches remain
  1 through 8 in that plan's dependency order. Formal lifecycle stays
  `ARCHITECTURE_LOCKED`. `IMP036J_STARTED` stays `NO`.
  `IMP036J_IMPLEMENTATION_STARTED` stays `NO`.
  `IMP036J_IMPLEMENTATION_COMPLETE` stays `NO`. `IMP036J_ACCEPTED` stays `NO`.
  `FOUNDER_UAT` stays `NOT_PERFORMED`. `nextGate` is `IMPLEMENTATION_TRANCHE_1`.
  `acceptedThrough` stays IMP-036I. `currentProductSlice` stays IMP-036J.
  `nextProductSlice` stays held IMP-037. Product Definition stays
  `PD-IMP-036J-DRAFT-6` / `APPROVED` / `PASS`. Experience Definition stays
  `XD-IMP-036J-DRAFT-6` / `APPROVED` / `PASS`. Experience Criticality stays `X3`.
  Change Risk stays `CR2`. Architecture Fit stays `PASS` and architecture stays
  `LOCKED` on `IMP-036J-FIT-CANDIDATE-9`. Design Readiness stays `PASS`.
  The Quality/Test Plan and Measurement/Instrumentation Plan stay finalized.
  The Implementation Plan stays `PASS`. D-377 and D-382 remain current. No
  D-383 is created. ARCH-R23 is unchanged. DR-23 is unchanged. No ADR is created.
  IMP-037 and IMP-038 holds stay unchanged. This authorization persistence is
  not implementation start, runtime work, schema migration, Founder UAT, or
  acceptance.
- **GTM-R175** records Implementation Plan PASS for `IMP-036J-PLAN-CANDIDATE-1`
  and adopts that candidate as the current implementation execution plan.
  Architect review comment `5925360293` evaluated head
  `2cf349b10ecb3dd326818fd401662ed37817b603` and tree
  `11e0a46f7b19bf5b7b7e17cfe2f0656c3b5f8bdb`. `IMP036J_IMPLEMENTATION_PLAN` is
  `PASS`. `IMPLEMENTATION_PLAN_FINALIZED` is `YES`.
  `READY_FOR_IMPLEMENTATION_AUTHORIZATION` is `YES`. Formal lifecycle stays
  `ARCHITECTURE_LOCKED`. Product Definition stays `PD-IMP-036J-DRAFT-6` /
  `APPROVED` / `PASS`. Experience Definition stays `XD-IMP-036J-DRAFT-6` /
  `APPROVED` / `PASS`. Experience Criticality stays `X3`. Change Risk stays
  `CR2`. Architecture Fit stays `PASS` and architecture stays `LOCKED` on
  `IMP-036J-FIT-CANDIDATE-9`. Design Readiness stays `PASS`. The Quality/Test
  Plan and Measurement/Instrumentation Plan stay finalized. Implementation stays
  unauthorized and unstarted. `nextGate` is `IMPLEMENTATION_AUTHORIZATION`.
  `acceptedThrough` stays IMP-036I. `currentProductSlice` stays IMP-036J.
  `nextProductSlice` stays held IMP-037. D-377 and D-382 remain current. No
  D-383 is created. ARCH-R23 is unchanged. DR-23 is unchanged. No ADR is created.
  IMP-037 and IMP-038 holds stay unchanged. Historical accepted capabilities are
  not reopened. Implementation Plan persistence is not implementation
  authorization, runtime work, schema migration, or acceptance.
- **GTM-R174** records independent Design Readiness PASS for `IMP-036J-DESIGN-CANDIDATE-2`,
  and finalizes `IMP-036J-QUALITY-CANDIDATE-2` and `IMP-036J-MEASUREMENT-CANDIDATE-2`.
  Architect review comment `5917691904` evaluated head
  `aa41c3744995a68ca9d435670be408b99cb6827d`, tree
  `be25a6ac7054e5dcc472b6ede37185c144eea6ed`, and governance fingerprint
  `923025dc1618f978e5ba7ab11658c4f34a98de4910cd4788dd5062d60bcb1227`. Exact-head CI run
  `36760479246` and CodeQL run `36760479256` succeeded. Engineering pre-handoff reviewer
  `d308a8d9-92e3-42b3-88f7-9649101eb4db` reported no material findings on that head.
  `IMP036J_DESIGN_READINESS` is `PASS`. `QUALITY_TEST_PLAN_FINALIZED` is `YES`.
  `MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED` is `YES`. Formal lifecycle stays
  `ARCHITECTURE_LOCKED`. Product Definition stays `PD-IMP-036J-DRAFT-6` / `APPROVED` /
  `PASS`. Experience Definition stays `XD-IMP-036J-DRAFT-6` / `APPROVED` / `PASS`.
  Experience Criticality stays `X3`. Change Risk stays `CR2`. Architecture Fit stays
  `PASS` and architecture stays `LOCKED` on `IMP-036J-FIT-CANDIDATE-9`. The
  Implementation Plan stays `NOT_PERFORMED`. Implementation stays unauthorized and
  unstarted. `nextGate` is `IMPLEMENTATION_PLAN`. `acceptedThrough` stays IMP-036I.
  `currentProductSlice` stays IMP-036J. `nextProductSlice` stays held IMP-037. D-377
  and D-382 remain current. No D-383 is created. ARCH-R23 is unchanged. DR-23 is
  unchanged. No ADR is created. IMP-037 and IMP-038 holds stay unchanged. Historical
  accepted capabilities are not reopened. Design Readiness persistence is not
  implementation authorization, runtime work, schema migration, or acceptance.
- **GTM-R173** records independent Architecture Fit PASS for `IMP-036J-FIT-CANDIDATE-9` and
  locks the IMP-036J capability architecture to that candidate. Evaluated head
  `052289471cfc2424879932e16fd88d6c16696de8`, tree
  `ed6d0b4c7e82eef4fd764c0fe3f73539f8e1858b`, and governance fingerprint
  `5be074e0736c097b6d68f18a3b71cd26cc69c03600eac0cf956bf74d0b6834b0`. Exact-head CI run
  `36611527090` attempt 2 succeeded. Attempt 1 of that same run remains historical evidence of
  an unrelated IMP-036I reminder timeout and is not erased. Exact-head CodeQL run
  `36611527053` succeeded. Fresh Codex issue comment `5896150834` on that head reported no
  major issues. No numeric independent ChatGPT Architecture Fit review identifier was
  available. Candidate 5 remains historical Architecture Fit PASS and the prior lock.
  Candidates 6, 7, and 8 remain historical STOP candidates. They were never merged and never
  locked. Product Definition stays `PD-IMP-036J-DRAFT-6` / `APPROVED` / `PASS`. Experience
  Definition stays `XD-IMP-036J-DRAFT-6` / `APPROVED` / `PASS`. Experience Criticality stays
  `X3`. Change Risk stays `CR2`. `IMP036J_ARCHITECTURE_FIT` is `PASS`.
  `IMP036J_ARCHITECTURE_LOCKED` is `YES`. Formal lifecycle is `ARCHITECTURE_LOCKED`. Design
  Readiness stays `NOT_PERFORMED`. Quality/Test Plan finalization and
  Measurement/Instrumentation Plan finalization stay unperformed. Implementation Plan stays
  unperformed. Implementation stays unauthorized and unstarted. `nextGate` is
  `DESIGN_READINESS`. `acceptedThrough` stays IMP-036I. `currentProductSlice` stays IMP-036J.
  `nextProductSlice` stays held IMP-037. D-377 and D-382 remain current. No D-383 is created.
  ARCH-R23 is unchanged. DR-23 is unchanged. No ADR is created. IMP-037 and IMP-038 holds stay
  unchanged. Historical accepted capabilities are not reopened. Architecture Fit remediation
  is not Design Readiness, implementation authorization, or acceptance.
- **GTM-R172** records independent Architecture Fit PASS for `IMP-036J-FIT-CANDIDATE-5` and
  locks the IMP-036J capability architecture. Independent review `5347761109` evaluated head
  `49912f35f2871ff77b9af267589d49666fc975ec`, tree
  `7046d5bb78012524972505f555226205199a58d0`, and governance fingerprint
  `ac6510d315148763069f06374a243a75a312a7693cf3e7c1d0eac71bc1026870`. Product Definition stays
  `PD-IMP-036J-DRAFT-6` / `APPROVED` / `PASS`. Experience Definition stays
  `XD-IMP-036J-DRAFT-6` / `APPROVED` / `PASS`. Experience Criticality stays `X3`. Change Risk
  stays `CR2`. `IMP036J_ARCHITECTURE_FIT` is `PASS`. `IMP036J_ARCHITECTURE_LOCKED` is `YES`.
  Formal lifecycle is `ARCHITECTURE_LOCKED`. Design Readiness stays `NOT_PERFORMED`.
  Quality/Test Plan finalization and Measurement/Instrumentation Plan finalization stay
  unperformed. Implementation stays unauthorized and unstarted. `nextGate` is
  `DESIGN_READINESS`. `acceptedThrough` stays IMP-036I. `currentProductSlice` stays IMP-036J.
  `nextProductSlice` stays held IMP-037. D-377 and D-382 remain current. No D-383 is created.
  ARCH-R23 is unchanged. DR-23 is unchanged. No ADR is created. IMP-037 and IMP-038 holds stay
  unchanged. Historical accepted capabilities are not reopened. Architecture Fit PASS is not
  Design Readiness, implementation authorization, or acceptance.
- **GTM-R171** records independent Experience Gate PASS for `XD-IMP-036J-DRAFT-6`.
  The version stays `XD-IMP-036J-DRAFT-6`. The Experience Definition is `APPROVED`.
  `IMP036J_EXPERIENCE_GATE` is `PASS`. Independent review `5342581233` evaluated head
  `1fbabd2fb80851912815efe4e0ebe331a1318557`. Product Definition stays
  `PD-IMP-036J-DRAFT-6` / `PASS`. Experience Criticality stays `X3`. Change Risk stays `CR2`.
  Architecture Fit stays `NOT_PERFORMED` and unlocked. Design Readiness stays `NOT_PERFORMED`.
  Implementation stays unauthorized and unstarted. Formal lifecycle stays `PLANNED`.
  `acceptedThrough` stays IMP-036I. `currentProductSlice` stays IMP-036J. `nextProductSlice`
  stays held IMP-037. `nextGate` is `ARCHITECTURE_FIT`. D-377 and D-382 remain current.
  No D-383 is created. ARCH-R23 is unchanged. IMP-037 and IMP-038 holds stay unchanged.
  Historical accepted capabilities are not reopened. Experience Gate PASS is not Architecture
  Fit, Architecture Lock, Design Readiness, or implementation authorization.
- **GTM-R170** adopts Product Delivery PD-2, Experience standard EXP-1, and Product Language
  standard LANG-1. It does not change IMP-036J product semantics. `PD-IMP-036J-DRAFT-6` stays
  `APPROVED`. Product Definition Gate stays `PASS`. Experience Criticality is `X3`. Change Risk is
  `CR2` because promotions, coupons, and offers change customer-payable outcomes and are not
  payment capture, refund calculation, or authentication. Experience Definition is `REQUIRED` and
  `NOT_PERFORMED`. Experience Gate is `NOT_PERFORMED`. Design Readiness is `NOT_PERFORMED`.
  Architecture Fit stays `NOT_PERFORMED` and unlocked. Any unmerged Architecture Fit candidate is
  investigation only and is not persisted Fit authority. Implementation stays unauthorized.
  `nextGate` is `EXPERIENCE_GATE`. `acceptedThrough` stays IMP-036I. No D-383 is created. ARCH-R23
  is unchanged. IMP-037 and IMP-038 stay held. Historical acceptance is not reopened.
- **GTM-R169** records Founder approval and independent Product Definition Gate PASS for
  `PD-IMP-036J-DRAFT-6`. The version stays `PD-IMP-036J-DRAFT-6`. Status becomes `APPROVED`.
  `IMP036J_PRODUCT_DEFINITION` becomes `APPROVED`. `IMP036J_PRODUCT_DEFINITION_GATE` becomes
  `PASS`. Architecture Fit stays `NOT_PERFORMED`. Architecture stays unlocked.
  Implementation stays unauthorized and unstarted. `acceptedThrough` stays IMP-036I. No D-383
  is created. ARCH-R23 is unchanged. IMP-037 and IMP-038 stay held. Deals, Campaigns, and
  Revenue Recommendations stay parked. Gate PASS is not Architecture Fit.
- **GTM-R168** records `PD-IMP-036J-DRAFT-6` as `DRAFT_READY_FOR_GATE`. It closes the DRAFT-5
  complimentary-item activation concurrency gap without a new Founder product decision. It does
  not create D-383 or FD-036J-04, does not approve the Product Definition, does not execute the
  Product Definition Gate, does not perform Architecture Fit, and does not authorize
  implementation. Historical DRAFT-5 was ready for Gate. Founder decisions FD-036J-01, FD-036J-02,
  and FD-036J-03 were approved. An independent Product Definition Gate against DRAFT-5 returned
  `STOP` for acceptance and concurrency completeness. Gate PASS was not persisted. Architecture
  Fit was not performed. Implementation was not authorized. DRAFT-6 supersedes DRAFT-5. DRAFT-5
  history is not rewritten as Gate PASS.
- **GTM-R167** records `PD-IMP-036J-DRAFT-5` as `DRAFT_READY_FOR_GATE` after Founder approval
  of FD-036J-03 on 2026-09-28. It does not create D-383, does not approve the Product
  Definition, does not execute the Product Definition Gate, does not perform Architecture Fit,
  and does not authorize implementation. Historical DRAFT-4 was ready for Gate. An independent
  Product Definition Gate review returned `DECISION_REQUIRED` because the complimentary-item
  operating rules did not yet have explicit Founder product authority. Gate PASS was not
  persisted. Architecture Fit was not performed. Implementation was not authorized. DRAFT-5
  supersedes DRAFT-4 after that Founder approval. DRAFT-4 history is not rewritten.
- Current lifecycle is determined only by CURRENT metadata and CURRENT position fields in this
  document and [`STATE.md`](./STATE.md).
- Historical GTM-R15…GTM-R113 exception narration, candidate/failure detail, and revision prose are
  preserved byte-for-byte in
  [`history/ROADMAP-GTM-R113-pre-compression.md`](./history/ROADMAP-GTM-R113-pre-compression.md).
  Do not infer current position from that snapshot. Historical text is structural precedent only —
  **not** current authorization.

### Slice lifecycle states

Exact vocabulary:

```text
PLANNED
ARCHITECTURE_IN_PROGRESS
ARCHITECTURE_LOCKED
IMPLEMENTATION_IN_PROGRESS
IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE
COMPLETE_AND_ACCEPTED
BLOCKED
SUPERSEDED
```

```text
IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE
≠
COMPLETE_AND_ACCEPTED
```

`pendingAcceptance` identifies the oldest unresolved formal acceptance gate in the contiguous
product sequence. Formal acceptance remains contiguous. Do not retarget `pendingAcceptance` to a
later slice, clear it, or create a pending-acceptance array without an explicit CURRENT roadmap
revision.

```text
ARCHITECTURE_LOCKED
≠
IMPLEMENTATION_IN_PROGRESS
```

### Capability architecture persistence (IMP-024 onward)

Every substantial future IMP must persist its complete locked capability architecture in the
repository before implementation begins. Historical accepted slices may lack governance-era
architecture artifacts; that gap does not downgrade their accepted implementation status.

Canonical capability-architecture directory:

```text
docs/platform/capabilities/
```

Immediately prior accepted locked artifact (IMP-036I; `COMPLETE_AND_ACCEPTED`):

[`capabilities/IMP-036I-scheduled-fulfilment.md`](./capabilities/IMP-036I-scheduled-fulfilment.md)

Prior accepted locked artifact (IMP-036H; `COMPLETE_AND_ACCEPTED`):

[`capabilities/IMP-036H-customer-pickup-takeaway.md`](./capabilities/IMP-036H-customer-pickup-takeaway.md)

Prior accepted locked artifact (IMP-036G; `COMPLETE_AND_ACCEPTED`):

[`capabilities/IMP-036G-administration-console-v2.md`](./capabilities/IMP-036G-administration-console-v2.md)

Earlier accepted locked artifact (IMP-036F; `COMPLETE_AND_ACCEPTED`):

[`capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md`](./capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md)

Earlier accepted locked artifact (IMP-036E; `COMPLETE_AND_ACCEPTED`):

[`capabilities/IMP-036E-store-operations-management.md`](./capabilities/IMP-036E-store-operations-management.md)

Earlier accepted locked artifact (IMP-036D; `COMPLETE_AND_ACCEPTED`):

[`capabilities/IMP-036D-workforce-franchise-operations-v2.md`](./capabilities/IMP-036D-workforce-franchise-operations-v2.md)

Earlier accepted capability artifacts remain under `capabilities/` and in the historical ROADMAP
snapshot. `ARCHITECTURE_LOCKED` remains the retained lock vocabulary for accepted capabilities.

## 2. Current Position

```text
Accepted Through:     IMP-036I — Scheduled Fulfilment
Current Product Slice: IMP-036J — Promotions, Coupons & Offers
Next Product Slice:    IMP-036K — Revenue Recommendations
Pending Acceptance:    NONE
Public GTM Boundary:   IMP-040 — Launch Validation & Cutover

PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED
PROGRAM_PAUSE_AUTHORITY: D-377
ADDITIONAL_SEQUENCING_AUTHORITY: D-382
HISTORICAL_CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038
CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038
CONTINUATION_EXCEPTION_AUTHORITY: PR#179/5771367844
CONTINUATION_EXCEPTION_REASON: IMP-037 qualifying external/provider work blocked by unavailable DigitalOcean/Spaces operator authority after repository implementation and local recovery prequalification were completed. Preserved as historical authorization. After IMP-036I COMPLETE_AND_ACCEPTED the prior tip currentProductSlice was NONE under D-377. D-382 sets CURRENT currentProductSlice to IMP-036J for Product Definition only. D-383 sets nextProductSlice to IMP-036K for parallel Product/Experience definition only. IMP-037 remains held.
HISTORICAL_IMP026_TO_IMP028_CONTINUATION: CLOSED
UNRESOLVED_PREDECESSOR: IMP-037
IMP037_PROVIDER_BLOCKED_TO_IMP038: YES
PHASE1_BLOCK_STATUS: BLOCKED_PROVIDER_ACCESS
PROVIDER_DEPENDENT_PROOF: DEFERRED_PENDING_PROVIDER_ACCESS
IMP037_HOLD: YES
IMP038_HOLD: YES
IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES
IMP038_EXTERNAL_ASSESSMENT: DEFERRED_UNTIL_PRE_GTM_APPLICATION_SCOPE_STABILIZES
IMP038_FROZEN_RUNTIME_HEAD: dc6b19e6f88d4084e424d927e6467c374596fb0a
IMP038_FROZEN_RUNTIME_TREE: c3aefb57f3f6c941d7f14907b6c095c4aa7f0547
IMP038_FROZEN_RUNTIME_FINGERPRINT: 2800fe11397ee2a01e9decf572f85adf5c3a8b244ca34b1f53d579e05feac589
GAP-EXT-ASSESS-001: NOT_CLOSED
```

```text
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
IMP036E_IMPLEMENTATION_EVIDENCE: COMPLETE
IMP_036E_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS
IMP036E_IMPLEMENTATION_MERGE_SHA: 0ebb5e937cd7ac14bb3e39e9d1d494e32c9d2739
IMP036E_IMPLEMENTATION_TREE: 0def59ce9bcab4575a7b43b7c3c07c85ac575428
IMP036E_REVIEWED_CANDIDATE_HEAD: b2ffaa5bc2b5c6f58ff5241c226b583160132837
IMP036E_REVIEWED_CANDIDATE_TREE: 0def59ce9bcab4575a7b43b7c3c07c85ac575428
FOUNDER_STAGING_INTERMEDIATE_CANDIDATE_SHA: e9821271a29ae35ba6c921008b976cd2e8d15c50
FOUNDER_STAGING_INTERMEDIATE_CANDIDATE_TREE: 8259d30f662e6668f2208788f2e95faaea831384
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
IMP038_IMPLEMENTATION_COMPLETE: YES
IMP038_ACCEPTED: NO
IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES
IMP038_EXTERNAL_ASSESSMENT: DEFERRED_UNTIL_PRE_GTM_APPLICATION_SCOPE_STABILIZES
IMP038_FROZEN_RUNTIME_HEAD: dc6b19e6f88d4084e424d927e6467c374596fb0a
IMP038_FROZEN_RUNTIME_TREE: c3aefb57f3f6c941d7f14907b6c095c4aa7f0547
IMP038_FROZEN_RUNTIME_FINGERPRINT: 2800fe11397ee2a01e9decf572f85adf5c3a8b244ca34b1f53d579e05feac589
GAP-EXT-ASSESS-001: NOT_CLOSED
FOUNDER_IMP038_IMPLEMENTATION_AUTHORIZATION: CURSOR_SESSION_MANDATE
IMP038_IMPLEMENTATION_AUTHORIZATION_BASE_HEAD: d14c3678b92a87052682b9559764654f5f9d3851
IMP038_IMPLEMENTATION_AUTHORIZATION_BASE_TREE: 682f1597a6f991cddde7d41e9e6705c1bed335b1
IMP038_FOUNDER_UAT_REQUIRED: YES
IMP038_FOUNDER_UAT: NOT_PERFORMED
IMP038_INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS
IMP038_INDEPENDENT_ARCHITECTURE_FIT_REVIEWED_HEAD: 3b03164d6581c5a98a893c24e92eaddece004e90
IMP038_INDEPENDENT_ARCHITECTURE_FIT_REVIEWED_TREE: 5bb499fa84a5bf02682b30518f2bf898ddb23540
IMP038_INDEPENDENT_ARCHITECTURE_FIT_REVIEW_ID: 5279884548
IMP038_ARCHITECTURE_FIT_EVALUATED_HEAD: 43007808849f093d84cbe710f32a728b41a9e5a2
IMP038_ARCHITECTURE_FIT_EVALUATED_TREE: 581fb23631df40044ec7b9c449545959a90b9998
IMP038_ARCHITECTURE_FIT_EVALUATED_WORKING_TREE_FINGERPRINT: ab00d1ab23f3c7d8b140feefcd1a0787f1fedf90ab08a9934c9a892a77c8184d
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
INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS
INDEPENDENT_ARCHITECTURE_FIT_REVIEWED_HEAD: aab814c238c499367ee921e9f8ffb03ff7b1b373
INDEPENDENT_ARCHITECTURE_FIT_REVIEWED_TREE: 93d4e83d4a73c61c9439bcaae2799920fcca46db
INDEPENDENT_ARCHITECTURE_FIT_REVIEW_ID: 5295149318
ARCHITECTURE_FIT_EVALUATED_HEAD: aab814c238c499367ee921e9f8ffb03ff7b1b373
ARCHITECTURE_FIT_EVALUATED_TREE: 93d4e83d4a73c61c9439bcaae2799920fcca46db
ARCHITECTURE_FIT_EVALUATED_WORKING_TREE_FINGERPRINT: 74b1254f22c9131a6e073522cf9310f264866e442cc074775ad5f4b214f0e51e
D-378_CREATED: YES
ARCH_R22_CREATED: YES
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
IMP036I_TRANCHE5_INDEPENDENT_VERIFICATION: PASS
TRANCHE_1: PASS
TRANCHE_2: PASS
TRANCHE_3: PASS
TRANCHE_4: PASS
TRANCHE_5: PASS
FINANCIAL_DOCUMENT_NON_REGRESSION: PASS
IMP036I_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS
IMP036I_IMPLEMENTATION_REVIEWED_HEAD: 335e8b55c74b81d745e923b3d078d6af9ec0b5cc
IMP036I_IMPLEMENTATION_REVIEWED_TREE: 4b75582d1726e552bdc1e45da15cf667b05de8e0
IMP036I_IMPLEMENTATION_REVIEWED_FINGERPRINT: 5d79b21381f190682d3cb3f0a2f7e99d43919476f5384c3e1d74d3904218409b
IMP036I_ACCEPTED_MAIN_SHA: 44f4d7d84af07c3226da606476844d8f05454b28
IMP036I_ACCEPTED_TREE: 3ec8a7714c25e6066453b47b7d006ef127abddbb
IMP036I_ACCEPTED_CANDIDATE: 44f4d7d84af07c3226da606476844d8f05454b28
IMP036I_FOUNDER_UAT_CANDIDATE_BRANCH: main
IMP036I_FOUNDER_UAT_CANDIDATE_HEAD: 44f4d7d84af07c3226da606476844d8f05454b28
IMP036I_FOUNDER_UAT_CANDIDATE_TREE: 3ec8a7714c25e6066453b47b7d006ef127abddbb
IMP036I_FOUNDER_UAT_CANDIDATE_FINGERPRINT: 85fe93db116bfe86b7f5ba4c266c829433d44401ffd03bdec536b5f61be9c27c
IMP036I_FOUNDER_UAT_DECISION_DATE: 2026-09-27
IMP036I_FOUNDER_UAT_ACCEPTANCE_AUTHORITY: Founder
IMP036I_FOUNDER_UAT_CHECKMARKS: configuration=PASS; finding_001_recovery=PASS; pickup_asap=PASS; pickup_scheduled=PASS; delivery_scheduled=PASS; operations_visibility=PASS; derived_timing_cues=PASS; pickup_boundary=PASS; delivery_manual_dispatch=PASS; commercial_recovery=PASS; delivery_asap_fresh=NOT_REEXECUTED; customer_cancel_manual=NOT_REEXECUTED; mobile_final_spotcheck=NOT_REEXECUTED; overall=PASS_BY_FOUNDER; findings=NONE_BLOCKING
IMP036I_FOUNDER_UAT_FINDING_001: RESOLVED
BLOCKING_FINDINGS_AT_ACCEPTANCE: NONE
IMP036I_FOUNDER_STAGING_PROJECT: boba-staging
IMP036I_FOUNDER_STAGING_CANDIDATE_MATCH: YES
IMP036I_FOUNDER_STAGING_STATUS: FOUNDER_UAT_COMPLETE
IMP036I_FOUNDER_STAGING_RUNNING_SHA: 44f4d7d84af07c3226da606476844d8f05454b28
INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS
INDEPENDENT_ARCHITECTURE_FIT_REVIEW_ID: 5312653831
ARCHITECTURE_FIT_EVALUATED_HEAD: 42e854b931e216fadc64b479371cebca4c38d17e
ARCHITECTURE_FIT_EVALUATED_TREE: 279e0e1b0e8f52c96cfd12fc89b329f73281e38f
ARCHITECTURE_FIT_EVALUATED_WORKING_TREE_FINGERPRINT: b65f40b9e568a6d0188f1d031f41db3a072cb3b4683d2d966c2a994283575068
nextGate: NONE
D-379_CREATED: YES
D-380_CREATED: YES
ARCH_R23_CREATED: YES
INDEPENDENT_PRODUCT_DEFINITION_GATE_REVIEW: 5307761142
IMP-039: PLANNED / NOT_ACTIVATED / NOT_AUTHORIZED / NOT_STARTED
IMP039_ACTIVATED: NO
IMP-040: PLANNED / NOT_ACTIVATED / NOT_AUTHORIZED / NOT_STARTED
IMP040_ACTIVATED: NO
PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED
PROGRAM_PAUSE_AUTHORITY: D-377
ADDITIONAL_SEQUENCING_AUTHORITY: D-382
HISTORICAL_CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038
CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038
CONTINUATION_EXCEPTION_AUTHORITY: PR#179/5771367844
IMP037_PROVIDER_BLOCKED_TO_IMP038: YES
PHASE1_BLOCK_STATUS: BLOCKED_PROVIDER_ACCESS
PROVIDER_DEPENDENT_PROOF: DEFERRED_PENDING_PROVIDER_ACCESS
HISTORICAL_IMP026_TO_IMP028_CONTINUATION: CLOSED
D-374_CREATED: YES
ARCH_R20_CREATED: YES
D-375_CREATED: YES
ARCH_R21_CREATED: YES
D-377_CREATED: YES
IMP-036D: COMPLETE_AND_ACCEPTED
IMP-036D_ARCHITECTURE_LOCKED: YES
IMP-036D_ACCEPTED: YES
IMP-036D_FOUNDER_UAT: PASS
IMP-036J: ARCHITECTURE_LOCKED
IMP036J_ACTIVATED: YES
IMP036J_PRODUCT_DEFINITION: APPROVED
IMP036J_PRODUCT_DEFINITION_VERSION: PD-IMP-036J-DRAFT-6
IMP036J_PRODUCT_DEFINITION_GATE: PASS
IMP036J_EXPERIENCE_DEFINITION: APPROVED
IMP036J_EXPERIENCE_DEFINITION_VERSION: XD-IMP-036J-DRAFT-6
IMP036J_EXPERIENCE_GATE: PASS
IMP036J_ARCHITECTURE_FIT: PASS
IMP036J_ARCHITECTURE_LOCKED: YES
ARCHITECTURE_FIT_SOURCE_CANDIDATE: IMP-036J-FIT-CANDIDATE-9
INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS
ARCHITECTURE_FIT_EVALUATED_HEAD: 052289471cfc2424879932e16fd88d6c16696de8
ARCHITECTURE_FIT_EVALUATED_TREE: ed6d0b4c7e82eef4fd764c0fe3f73539f8e1858b
ARCHITECTURE_FIT_EVALUATED_GOVERNANCE_FINGERPRINT: 5be074e0736c097b6d68f18a3b71cd26cc69c03600eac0cf956bf74d0b6834b0
ARCHITECTURE_FIT_EVALUATED_CI_RUN: 36611527090
ARCHITECTURE_FIT_EVALUATED_CI_ATTEMPT: 2
ARCHITECTURE_FIT_EVALUATED_CODEQL_RUN: 36611527053
ARCHITECTURE_FIT_EVALUATED_CODEX_EVIDENCE: 5896150834
HISTORICAL_CANDIDATE_5_ARCHITECTURE_FIT: PASS
HISTORICAL_CANDIDATE_6_ARCHITECTURE_FIT_REVIEW: STOP
HISTORICAL_CANDIDATE_7_ARCHITECTURE_FIT_REVIEW: STOP
HISTORICAL_CANDIDATE_8_ARCHITECTURE_FIT_REVIEW: STOP
QUALITY_TEST_PLAN_FINALIZED: YES
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED: YES
IMPLEMENTATION_PLAN: PASS
IMPLEMENTATION_PLAN_FINALIZED: YES
IMPLEMENTATION_PLAN_SOURCE: IMP-036J-PLAN-CANDIDATE-1
READY_FOR_IMPLEMENTATION_AUTHORIZATION: YES
IMP036J_IMPLEMENTATION_PLAN: PASS
IMPLEMENTATION_PLAN_ARCHITECT_REVIEW: 5925360293
IMPLEMENTATION_PLAN_EVALUATED_HEAD: 2cf349b10ecb3dd326818fd401662ed37817b603
IMPLEMENTATION_PLAN_EVALUATED_TREE: 11e0a46f7b19bf5b7b7e17cfe2f0656c3b5f8bdb
IMP036J_DESIGN_READINESS: PASS
DESIGN_READINESS_SOURCE_CANDIDATE: IMP-036J-DESIGN-CANDIDATE-2
QUALITY_TEST_PLAN_SOURCE_CANDIDATE: IMP-036J-QUALITY-CANDIDATE-2
MEASUREMENT_PLAN_SOURCE_CANDIDATE: IMP-036J-MEASUREMENT-CANDIDATE-2
IMP036J_DESIGN_READINESS_REVIEW: PASS
IMP036J_QUALITY_TEST_PLAN_REVIEW: PASS
IMP036J_MEASUREMENT_PLAN_REVIEW: PASS
DESIGN_READINESS_EVALUATED_HEAD: aa41c3744995a68ca9d435670be408b99cb6827d
DESIGN_READINESS_EVALUATED_TREE: be25a6ac7054e5dcc472b6ede37185c144eea6ed
DESIGN_READINESS_EVALUATED_GOVERNANCE_FINGERPRINT: 923025dc1618f978e5ba7ab11658c4f34a98de4910cd4788dd5062d60bcb1227
DESIGN_READINESS_EVALUATED_CI_RUN: 36760479246
DESIGN_READINESS_EVALUATED_CODEQL_RUN: 36760479256
DESIGN_READINESS_ARCHITECT_REVIEW: 5917691904
DESIGN_READINESS_ENGINEERING_REVIEWER: d308a8d9-92e3-42b3-88f7-9649101eb4db
IMP036J_IMPLEMENTATION_AUTHORIZATION: APPROVED
IMP036J_IMPLEMENTATION_AUTHORIZED: YES
IMP036J_IMPLEMENTATION_AUTHORIZATION_DATE: 2026-10-01
IMPLEMENTATION_AUTHORIZATION_EVIDENCE: PR#332/5926464685
FD-036J-03: APPROVED 2026-09-28
IMP036J_STARTED: YES
IMP036J_IMPLEMENTATION_STARTED: YES
IMP036J_IMPLEMENTATION_COMPLETE: NO
IMP036J_ACCEPTED: NO
IMP036J_FORMAL_LIFECYCLE: IMPLEMENTATION_IN_PROGRESS
IMP036J_TRANCHE_1: IN_REVIEW
IMP036J_TRANCHE_2_STARTED: NO
FOUNDER_UAT: NOT_PERFORMED
PRODUCT_DELIVERY_PROCESS: PD-2
EXPERIENCE_STANDARD: EXP-1
PRODUCT_LANGUAGE_STANDARD: LANG-1
IMP036J_EXPERIENCE_CRITICALITY: X3
IMP036J_CHANGE_RISK: CR2
INDEPENDENT_EXPERIENCE_GATE_REVIEW_ID: 5342581233
EXPERIENCE_GATE_EVALUATED_HEAD: 1fbabd2fb80851912815efe4e0ebe331a1318557
EXPERIENCE_GATE_EVALUATED_TREE: 4eb6aa5e5a1588ef64527d7f38f7c5f07339d701
EXPERIENCE_GATE_EVALUATED_WORKING_TREE_FINGERPRINT: 060269654ee36f130f8f8e4cc47fc6b3116466c6a56e2a29e061af1da725632d
IMP036J_NEXT_GATE: IMPLEMENTATION_TRANCHE_1
nextGate: IMPLEMENTATION_TRANCHE_1
IMP-036K: PLANNED
IMP036K_FORMAL_IDENTITY: YES
IMP036K_ACTIVATED: YES
IMP036K_PRODUCT_DEFINITION: NOT_CREATED
IMP036K_PRODUCT_DEFINITION_GATE: NOT_PERFORMED
IMP036K_EXPERIENCE_CRITICALITY: X3
IMP036K_CHANGE_RISK: CR2
IMP036K_EXPERIENCE_DEFINITION: NOT_CREATED
IMP036K_EXPERIENCE_GATE: NOT_PERFORMED
IMP036K_ARCHITECTURE_FIT: NOT_PERFORMED
IMP036K_ARCHITECTURE_LOCKED: NO
IMP036K_DESIGN_READINESS: NOT_PERFORMED
IMP036K_IMPLEMENTATION_PLAN: NOT_PERFORMED
IMP036K_IMPLEMENTATION_AUTHORIZED: NO
IMP036K_IMPLEMENTATION_STARTED: NO
IMP036K_IMPLEMENTATION_COMPLETE: NO
IMP036K_ACCEPTED: NO
DEALS_ROADMAP_IDENTITY: NONE
CAMPAIGNS_ROADMAP_IDENTITY: NONE
REVENUE_RECOMMENDATIONS_ROADMAP_IDENTITY: IMP-036K
PARALLEL_DEFINITION_ONLY: YES
PARALLEL_PRODUCT_DEFINITION_PREPARATION: AUTHORIZED
PARALLEL_EXPERIENCE_DEFINITION_PREPARATION: AUTHORIZED
D-383_CREATED: YES
D-382_STATUS: AMENDED
D-382_AMENDED_BY: D-383
D-382_AMENDMENT_SCOPE: Revenue Recommendations identity, activation, and sequencing
SHARED_GOVERNANCE_PERSISTENCE: SERIALIZED
```

**GTM-R178** records IMP-036J implementation start. Tranche 1 is commercial persistence
only. `IMP036J_STARTED` is `YES`. `IMP036J_IMPLEMENTATION_STARTED` is `YES`. Formal
lifecycle is `IMPLEMENTATION_IN_PROGRESS`. `IMP036J_IMPLEMENTATION_COMPLETE` stays
`NO`. `IMP036J_ACCEPTED` stays `NO`. `FOUNDER_UAT` stays `NOT_PERFORMED`.
`nextGate` stays `IMPLEMENTATION_TRANCHE_1`. Tranche 1 is `IN_REVIEW` and is not
`PASS`. Tranche 2 has not started. `acceptedThrough` stays IMP-036I.
`currentProductSlice` stays IMP-036J. `nextProductSlice` stays IMP-036K. ARCH-R23
and DR-24 are unchanged. D-383 stays CURRENT. This record does not pass Tranche 1
and does not authorize Tranche 2.

**GTM-R177** records Founder decision **D-383** (2026-10-01). Formal identity is
**IMP-036K — Revenue Recommendations**. `"IMP-036K"` was previously only a working label.
D-383 authorizes parallel Product Definition preparation and Experience Definition preparation
only. Product Definition and Experience Definition are `NOT_CREATED`. Product Definition Gate,
Experience Gate, Architecture Fit, Design Readiness, and the Implementation Plan are
`NOT_PERFORMED`. Implementation is unauthorized and unstarted. `acceptedThrough` remains
IMP-036I. `currentProductSlice` remains IMP-036J. `nextProductSlice` is IMP-036K and precedes
held IMP-037. IMP-036J stays `IMP036J_IMPLEMENTATION_AUTHORIZATION: APPROVED`,
`IMP036J_IMPLEMENTATION_AUTHORIZED: YES`, `IMP036J_IMPLEMENTATION_STARTED: NO`,
`IMP036J_IMPLEMENTATION_COMPLETE: NO`, `IMP036J_ACCEPTED: NO`, and
`nextGate: IMPLEMENTATION_TRANCHE_1`. D-383 amends D-382 only for Revenue Recommendations
identity, activation, and sequencing. D-382 remains the binding Promotions-first decision for
IMP-036J. Deals and Campaigns remain parked discovery. This record is the serialization
checkpoint for shared ROADMAP, STATE, and decision-register persistence. It does not start
IMP-036J Tranche 1 and does not authorize IMP-036K Architecture Fit, implementation, runtime
work, or acceptance. ARCH-R23 is unchanged. DR-24 records D-383. No ADR is created.

**GTM-R176** records Founder Implementation Authorization for IMP-036J on 2026-10-01.
Human authority is pull request #332 comment `5926464685`.
`IMP036J_IMPLEMENTATION_AUTHORIZATION` is `APPROVED`.
`IMP036J_IMPLEMENTATION_AUTHORIZED` is `YES`. Implementation remains unstarted.
`IMP036J_STARTED` is `NO`. `IMP036J_IMPLEMENTATION_STARTED` is `NO`.
`IMP036J_IMPLEMENTATION_COMPLETE` is `NO`. `IMP036J_ACCEPTED` is `NO`.
`FOUNDER_UAT` is `NOT_PERFORMED`. Formal lifecycle stays `ARCHITECTURE_LOCKED`.
`nextGate` is `IMPLEMENTATION_TRANCHE_1`. `acceptedThrough` remains IMP-036I.
`currentProductSlice` remains IMP-036J. `nextProductSlice` remains held IMP-037.
Product Definition, Experience Definition, locked Candidate 9 architecture, Design
Readiness, the Quality/Test Plan, the Measurement/Instrumentation Plan, and
Implementation Plan `IMP-036J-PLAN-CANDIDATE-1` stay the authorized sources.
D-377 and D-382 remain CURRENT. No D-383 is created. ARCH-R23 and DR-23 are
unchanged. No ADR is created. `IMP037_HOLD` and `IMP038_HOLD` remain YES.
Deals, Campaigns, and Revenue Recommendations remain parked.
`GAP-EXT-ASSESS-001` remains NOT_CLOSED. This record is not implementation start,
runtime work, a schema migration, Founder UAT, or acceptance.

**GTM-R175** records Implementation Plan PASS for `IMP-036J-PLAN-CANDIDATE-1` and adopts
that candidate as the current implementation execution plan. Architect review comment
`5925360293` evaluated HEAD `2cf349b10ecb3dd326818fd401662ed37817b603` and tree
`11e0a46f7b19bf5b7b7e17cfe2f0656c3b5f8bdb`. Formal lifecycle stays `ARCHITECTURE_LOCKED`.
`IMP036J_IMPLEMENTATION_PLAN` is `PASS`. `IMPLEMENTATION_PLAN_FINALIZED` is `YES`.
`READY_FOR_IMPLEMENTATION_AUTHORIZATION` is `YES`. Design Readiness stays `PASS`.
`QUALITY_TEST_PLAN_FINALIZED` stays `YES`. `MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED`
stays `YES`. `IMP036J_IMPLEMENTATION_AUTHORIZED` remains `NO`. `IMP036J_STARTED` remains
`NO`. `IMP036J_IMPLEMENTATION_STARTED` remains `NO`. `IMP036J_IMPLEMENTATION_COMPLETE`
remains `NO`. `IMP036J_ACCEPTED` remains `NO`. `acceptedThrough` remains IMP-036I.
`currentProductSlice` remains IMP-036J. `pendingAcceptance` remains NONE.
`nextProductSlice` remains IMP-037. `nextGate` is `IMPLEMENTATION_AUTHORIZATION`.
`IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains ARCH-R23. Decision
register remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT. Next decision ID
remains D-383. No D-383 is created. No ADR is created. No FD-036J-04 is created. Deals,
Campaigns, and Revenue Recommendations remain parked. `GAP-EXT-ASSESS-001` remains
NOT_CLOSED. Historical accepted IMPs are not reopened. Implementation Plan persistence
is not implementation authorization, not runtime work, not a schema migration, and not
acceptance.

**GTM-R174** records independent Design Readiness PASS for `IMP-036J-DESIGN-CANDIDATE-2`
and finalizes the Quality/Test Plan `IMP-036J-QUALITY-CANDIDATE-2` and the
Measurement/Instrumentation Plan `IMP-036J-MEASUREMENT-CANDIDATE-2`. Architect review
comment `5917691904` evaluated HEAD `aa41c3744995a68ca9d435670be408b99cb6827d`, tree
`be25a6ac7054e5dcc472b6ede37185c144eea6ed`, and governance fingerprint
`923025dc1618f978e5ba7ab11658c4f34a98de4910cd4788dd5062d60bcb1227`. Exact-head CI run
`36760479246` and CodeQL run `36760479256` passed. Engineering reviewer
`d308a8d9-92e3-42b3-88f7-9649101eb4db` reported no material findings. Formal lifecycle
stays `ARCHITECTURE_LOCKED`. `IMP036J_DESIGN_READINESS` is `PASS`.
`QUALITY_TEST_PLAN_FINALIZED` is `YES`. `MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED` is
`YES`. The Implementation Plan stays `NOT_PERFORMED`. `IMP036J_IMPLEMENTATION_AUTHORIZED`
remains `NO`. `IMP036J_STARTED` remains `NO`. `IMP036J_IMPLEMENTATION_STARTED` remains
`NO`. `IMP036J_IMPLEMENTATION_COMPLETE` remains `NO`. `IMP036J_ACCEPTED` remains `NO`.
`acceptedThrough` remains IMP-036I. `currentProductSlice` remains IMP-036J.
`pendingAcceptance` remains NONE. `nextProductSlice` remains IMP-037. `nextGate` is
`IMPLEMENTATION_PLAN`. `IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains
ARCH-R23. Decision register remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT.
Next decision ID remains D-383. No D-383 is created. No ADR is created. No FD-036J-04 is
created. Deals, Campaigns, and Revenue Recommendations remain parked.
`GAP-EXT-ASSESS-001` remains NOT_CLOSED. Historical accepted IMPs are not reopened.
Design Readiness persistence is not implementation authorization, not runtime work, not
a schema migration, and not acceptance.

**GTM-R173** records independent Architecture Fit PASS for `IMP-036J-FIT-CANDIDATE-9` and locks
the IMP-036J capability architecture to that candidate. Evaluated HEAD
`052289471cfc2424879932e16fd88d6c16696de8`, tree
`ed6d0b4c7e82eef4fd764c0fe3f73539f8e1858b`, and governance fingerprint
`5be074e0736c097b6d68f18a3b71cd26cc69c03600eac0cf956bf74d0b6834b0`. Exact-head CI run
`36611527090` attempt 2 and CodeQL run `36611527053` passed. Fresh Codex issue comment
`5896150834` reported no major issues. No numeric independent ChatGPT review identifier was
available. Candidate 5 remains historical Architecture Fit PASS and the prior lock. Candidates
6, 7, and 8 remain historical STOP results. They were never merged and never locked. Formal
lifecycle is `ARCHITECTURE_LOCKED`. `IMP036J_PRODUCT_DEFINITION` remains `APPROVED`.
`IMP036J_PRODUCT_DEFINITION_VERSION` remains `PD-IMP-036J-DRAFT-6`.
`IMP036J_PRODUCT_DEFINITION_GATE` remains `PASS`. `IMP036J_EXPERIENCE_DEFINITION` remains
`APPROVED`. `IMP036J_EXPERIENCE_DEFINITION_VERSION` remains `XD-IMP-036J-DRAFT-6`.
`IMP036J_EXPERIENCE_GATE` remains `PASS`. `IMP036J_EXPERIENCE_CRITICALITY` remains `X3`.
`IMP036J_CHANGE_RISK` remains `CR2`. `IMP036J_ARCHITECTURE_FIT` is `PASS`.
`IMP036J_ARCHITECTURE_LOCKED` is `YES`. `IMP036J_DESIGN_READINESS` remains `NOT_PERFORMED`.
The Quality/Test Plan is not finalized. The Measurement/Instrumentation Plan is not finalized.
The Implementation Plan is not performed. `IMP036J_IMPLEMENTATION_AUTHORIZED` remains `NO`.
`IMP036J_STARTED` remains `NO`. `IMP036J_IMPLEMENTATION_STARTED` remains `NO`.
`IMP036J_IMPLEMENTATION_COMPLETE` remains `NO`. `IMP036J_ACCEPTED` remains `NO`.
`acceptedThrough` remains IMP-036I. `currentProductSlice` remains IMP-036J.
`pendingAcceptance` remains NONE. `nextProductSlice` remains IMP-037. `nextGate` is
`DESIGN_READINESS`. `IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains ARCH-R23.
Decision register remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT. Next decision ID
remains D-383. No D-383 is created. No ADR is created. No FD-036J-04 is created. Deals,
Campaigns, and Revenue Recommendations remain parked. `GAP-EXT-ASSESS-001` remains NOT_CLOSED.
Historical accepted IMPs are not reopened. Architecture Fit remediation is not Design
Readiness, not implementation authorization, and not acceptance.

**GTM-R172** records independent Architecture Fit PASS for `IMP-036J-FIT-CANDIDATE-5` and locks
the IMP-036J capability architecture. Independent review `5347761109` evaluated HEAD
`49912f35f2871ff77b9af267589d49666fc975ec`, tree
`7046d5bb78012524972505f555226205199a58d0`, and governance fingerprint
`ac6510d315148763069f06374a243a75a312a7693cf3e7c1d0eac71bc1026870`. Fresh Codex review
`5883601198`, CI run `36521141717`, and CodeQL run `36521141714` passed on that evaluated head.
Formal lifecycle is `ARCHITECTURE_LOCKED`. `IMP036J_PRODUCT_DEFINITION` remains `APPROVED`.
`IMP036J_PRODUCT_DEFINITION_VERSION` remains `PD-IMP-036J-DRAFT-6`.
`IMP036J_PRODUCT_DEFINITION_GATE` remains `PASS`. `IMP036J_EXPERIENCE_DEFINITION` remains
`APPROVED`. `IMP036J_EXPERIENCE_DEFINITION_VERSION` remains `XD-IMP-036J-DRAFT-6`.
`IMP036J_EXPERIENCE_GATE` remains `PASS`. `IMP036J_EXPERIENCE_CRITICALITY` remains `X3`.
`IMP036J_CHANGE_RISK` remains `CR2`. `IMP036J_ARCHITECTURE_FIT` is `PASS`.
`IMP036J_ARCHITECTURE_LOCKED` is `YES`. `IMP036J_DESIGN_READINESS` remains `NOT_PERFORMED`.
The Quality/Test Plan is not finalized. The Measurement/Instrumentation Plan is not finalized.
`IMP036J_IMPLEMENTATION_AUTHORIZED` remains `NO`. `IMP036J_STARTED` remains `NO`.
`IMP036J_IMPLEMENTATION_STARTED` remains `NO`. `IMP036J_IMPLEMENTATION_COMPLETE` remains `NO`.
`IMP036J_ACCEPTED` remains `NO`. `acceptedThrough` remains IMP-036I. `currentProductSlice` remains
IMP-036J. `pendingAcceptance` remains NONE. `nextProductSlice` remains IMP-037. `nextGate` is
`DESIGN_READINESS`. `IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains ARCH-R23.
Decision register remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT. Next decision ID
remains D-383. No D-383 is created. No ADR is created. No FD-036J-04 is created. Deals,
Campaigns, and Revenue Recommendations remain parked. `GAP-EXT-ASSESS-001` remains NOT_CLOSED.
Historical accepted IMPs are not reopened. Architecture lock is not Design Readiness, not
implementation authorization, and not acceptance.

**GTM-R171** records independent Experience Gate PASS for `XD-IMP-036J-DRAFT-6`. The version is
unchanged. `IMP036J_EXPERIENCE_DEFINITION` is `APPROVED`. `IMP036J_EXPERIENCE_GATE` is `PASS`.
Independent review `5342581233` evaluated HEAD
`1fbabd2fb80851912815efe4e0ebe331a1318557`, tree
`4eb6aa5e5a1588ef64527d7f38f7c5f07339d701`, and working-tree fingerprint
`060269654ee36f130f8f8e4cc47fc6b3116466c6a56e2a29e061af1da725632d`. Formal lifecycle remains
`PLANNED`. `IMP036J_PRODUCT_DEFINITION` remains `APPROVED`.
`IMP036J_PRODUCT_DEFINITION_VERSION` remains `PD-IMP-036J-DRAFT-6`.
`IMP036J_PRODUCT_DEFINITION_GATE` remains `PASS`. `IMP036J_EXPERIENCE_CRITICALITY` remains `X3`.
`IMP036J_CHANGE_RISK` remains `CR2`. `IMP036J_DESIGN_READINESS` remains `NOT_PERFORMED`.
`IMP036J_ARCHITECTURE_FIT` remains `NOT_PERFORMED`. `IMP036J_ARCHITECTURE_LOCKED` remains `NO`.
An unmerged Architecture Fit candidate is not persisted Fit authority.
`IMP036J_IMPLEMENTATION_AUTHORIZED` remains `NO`. `IMP036J_STARTED` remains `NO`.
`IMP036J_IMPLEMENTATION_STARTED` remains `NO`. `IMP036J_IMPLEMENTATION_COMPLETE` remains `NO`.
`IMP036J_ACCEPTED` remains `NO`. `acceptedThrough` remains IMP-036I. `currentProductSlice` remains
IMP-036J. `pendingAcceptance` remains NONE. `nextProductSlice` remains IMP-037. `nextGate` is
`ARCHITECTURE_FIT`. `IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains ARCH-R23.
Decision register remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT. Next decision ID
remains D-383. No D-383 is created. No FD-036J-04 is created. Deals, Campaigns, and Revenue
Recommendations remain parked. `GAP-EXT-ASSESS-001` remains NOT_CLOSED. Historical accepted IMPs
are not reopened. Experience Gate PASS is not Architecture Fit, not Architecture Lock, not Design
Readiness, and not implementation authorization.

**GTM-R170** adopts PD-2, EXP-1, and LANG-1 and moves IMP-036J's next gate to `EXPERIENCE_GATE`.
Formal lifecycle remains `PLANNED`. `IMP036J_PRODUCT_DEFINITION` remains `APPROVED`.
`IMP036J_PRODUCT_DEFINITION_GATE` remains `PASS`. `IMP036J_EXPERIENCE_CRITICALITY` is `X3`.
`IMP036J_CHANGE_RISK` is `CR2`: promotions, coupons, and offers change customer-payable commercial
outcomes, including stacking, coupon selection, and complimentary items. They do not themselves
own payment capture, refund calculation, or authentication. `CR2` is Change Risk, not AGENTS
execution risk `R2`. `IMP036J_EXPERIENCE_DEFINITION` is `REQUIRED / NOT_PERFORMED`.
`IMP036J_EXPERIENCE_GATE` is `NOT_PERFORMED`. `IMP036J_DESIGN_READINESS` is `NOT_PERFORMED`.
`IMP036J_ARCHITECTURE_FIT` remains `NOT_PERFORMED`. `IMP036J_ARCHITECTURE_LOCKED` remains `NO`.
An unmerged Architecture Fit candidate is not persisted Fit authority.
`IMP036J_IMPLEMENTATION_AUTHORIZED` remains `NO`. `IMP036J_STARTED` remains `NO`.
`IMP036J_ACCEPTED` remains `NO`. `acceptedThrough` remains IMP-036I. `currentProductSlice` remains
IMP-036J. `pendingAcceptance` remains NONE. `nextProductSlice` remains IMP-037. `nextGate` is
`EXPERIENCE_GATE`. `IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains ARCH-R23.
Decision register remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT. Next decision ID
remains D-383. No D-383 is created. No FD-036J-04 is created. Deals, Campaigns, and Revenue
Recommendations remain parked. `GAP-EXT-ASSESS-001` remains NOT_CLOSED. Historical accepted IMPs
are not reopened. Gate PASS is not Architecture Fit and is not Experience Gate PASS.

**GTM-R169** records Product Definition approval and Gate PASS for `PD-IMP-036J-DRAFT-6`. The
version is unchanged. Formal lifecycle remains `PLANNED`. `IMP036J_PRODUCT_DEFINITION` is
`APPROVED`. `IMP036J_PRODUCT_DEFINITION_GATE` is `PASS`. `IMP036J_ARCHITECTURE_FIT` remains
`NOT_PERFORMED`. `IMP036J_ARCHITECTURE_LOCKED` remains `NO`. `IMP036J_IMPLEMENTATION_AUTHORIZED`
remains `NO`. `IMP036J_STARTED` remains `NO`. `IMP036J_IMPLEMENTATION_STARTED` remains `NO`.
`IMP036J_IMPLEMENTATION_COMPLETE` remains `NO`. `IMP036J_ACCEPTED` remains `NO`.
`acceptedThrough` remains IMP-036I. `currentProductSlice` remains IMP-036J. `pendingAcceptance`
remains NONE. `nextProductSlice` remains IMP-037. `nextGate` is `ARCHITECTURE_FIT`.
`IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains ARCH-R23. Decision register
remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT. Next decision ID remains D-383.
No D-383 is created. No FD-036J-04 is created. The independent Gate evaluated HEAD
`24aa3ced280dbfc18ac52275ed97ae919904481d`, tree
`e7fd72f2af3b0267f438bf9b65e7f7f23bf43f27`, and fingerprint
`9f9c708306a76e140ea4143feaf8e007ca975f03c3dc418f65e30aaf8bbbd1e1`. Founder approval to persist
PASS was given on 2026-09-28. `Architecture Conflicts: NONE IDENTIFIED` is not Architecture Fit
PASS. Deals, Campaigns, and Revenue Recommendations remain parked discovery and are not
activated. A second money engine remains prohibited. `GAP-EXT-ASSESS-001` remains NOT_CLOSED.

**GTM-R168** records `PD-IMP-036J-DRAFT-6` as `DRAFT_READY_FOR_GATE`. This is a pre-Gate draft
transition that closes the DRAFT-5 acceptance-slice concurrency gap. It does not execute the
Product Definition Gate, perform Architecture Fit, or authorize implementation. Formal lifecycle
remains `PLANNED`. `IMP036J_PRODUCT_DEFINITION` remains `DRAFT_READY_FOR_GATE`.
`IMP036J_PRODUCT_DEFINITION_VERSION` is `PD-IMP-036J-DRAFT-6`.
`IMP036J_PRODUCT_DEFINITION_GATE` remains `NOT_PERFORMED`. `IMP036J_ARCHITECTURE_FIT` remains
`NOT_PERFORMED`. `IMP036J_ARCHITECTURE_LOCKED` remains `NO`. `IMP036J_IMPLEMENTATION_AUTHORIZED`
remains `NO`. `IMP036J_STARTED` remains `NO`. `IMP036J_ACCEPTED` remains `NO`. `acceptedThrough`
remains IMP-036I. `currentProductSlice` remains IMP-036J. `pendingAcceptance` remains NONE.
`nextProductSlice` remains IMP-037. `IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture
remains ARCH-R23. Decision register remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT.
Next decision ID remains D-383. No D-383 is created. No FD-036J-04 is created.
`OPEN_FOUNDER_PRODUCT_DECISIONS = 0`. `UNRESOLVED_MATERIAL_PRODUCT_DECISIONS = 0`.
`DRAFT_READY_FOR_GATE` is not Gate PASS and is not approval. Historical `PD-IMP-036J-DRAFT-5`
was ready for Gate. Founder decisions FD-036J-01, FD-036J-02, and FD-036J-03 were approved. An
independent Product Definition Gate was executed and returned `STOP` because the acceptance slice
did not prove concurrent complimentary-item activation. No new Founder decision was required.
Gate PASS was not persisted. Architecture Fit was not performed. Implementation was not
authorized. DRAFT-6 supersedes DRAFT-5. DRAFT-5 history is not rewritten as Gate PASS. FD-036J-03
remains the complimentary-item product authority and is not a Decision Register entry. Deals,
Campaigns, and Revenue Recommendations remain parked discovery and are not rejected. A second
money engine remains prohibited. `GAP-EXT-ASSESS-001` remains NOT_CLOSED.

**GTM-R167** records `PD-IMP-036J-DRAFT-5` as `DRAFT_READY_FOR_GATE` after Founder approval of
FD-036J-03 on 2026-09-28. This is a pre-Gate draft transition. It does not execute the Product
Definition Gate, perform Architecture Fit, or authorize implementation. Formal lifecycle remains
`PLANNED`. `IMP036J_PRODUCT_DEFINITION` remains `DRAFT_READY_FOR_GATE`.
`IMP036J_PRODUCT_DEFINITION_VERSION` is `PD-IMP-036J-DRAFT-5`.
`IMP036J_PRODUCT_DEFINITION_GATE` remains `NOT_PERFORMED`. `IMP036J_ARCHITECTURE_FIT` remains
`NOT_PERFORMED`. `IMP036J_ARCHITECTURE_LOCKED` remains `NO`. `IMP036J_IMPLEMENTATION_AUTHORIZED`
remains `NO`. `IMP036J_STARTED` remains `NO`. `IMP036J_ACCEPTED` remains `NO`. `acceptedThrough`
remains IMP-036I. `currentProductSlice` remains IMP-036J. `pendingAcceptance` remains NONE.
`nextProductSlice` remains IMP-037. `IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture
remains ARCH-R23. Decision register remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT.
Next decision ID remains D-383. No D-383 is created. `OPEN_FOUNDER_PRODUCT_DECISIONS = 0`.
`DRAFT_READY_FOR_GATE` is not Gate PASS and is not approval. Historical `PD-IMP-036J-DRAFT-4`
was ready for Gate. An independent Product Definition Gate review returned `DECISION_REQUIRED`
because FD-036J-03 was not yet Founder-approved. Gate PASS was not persisted. Architecture Fit
was not performed. Implementation was not authorized. Canonical main never recorded DRAFT-4 as
APPROVED. DRAFT-5 supersedes DRAFT-4 after Founder approval of FD-036J-03. FD-036J-03 is a
Product Definition decision, not D-383. FD-036J-02 remains the general stacking policy. Deals,
Campaigns, and Revenue Recommendations remain parked discovery and are not rejected. A second
money engine remains prohibited.

**GTM-R166** records `PD-IMP-036J-DRAFT-4` as `DRAFT_READY_FOR_GATE`. This is a pre-Gate draft
transition. It does not execute the Product Definition Gate, perform Architecture Fit, or
authorize implementation. Formal lifecycle remains `PLANNED`.
`IMP036J_PRODUCT_DEFINITION` remains `DRAFT_READY_FOR_GATE`.
`IMP036J_PRODUCT_DEFINITION_VERSION` is `PD-IMP-036J-DRAFT-4`.
`IMP036J_PRODUCT_DEFINITION_GATE` remains `NOT_PERFORMED`. `IMP036J_ARCHITECTURE_FIT` remains
`NOT_PERFORMED`. `IMP036J_IMPLEMENTATION_AUTHORIZED` remains `NO`. `IMP036J_STARTED` remains
`NO`. `IMP036J_ACCEPTED` remains `NO`. `acceptedThrough` remains IMP-036I. `currentProductSlice`
remains IMP-036J. `pendingAcceptance` remains NONE. `nextProductSlice` remains IMP-037.
`IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains ARCH-R23. Decision register
remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT. Next decision ID remains D-383.
No D-383 is created. `OPEN_FOUNDER_PRODUCT_DECISIONS = 0`. `DRAFT_READY_FOR_GATE` is not Gate
PASS and is not approval. Historical `PD-IMP-036J-DRAFT-3` was ready for Gate. An independent
Gate evaluation initially returned PASS. Pull request #312 then received material review
findings `4115981679` and `4115981682`. Gate PASS was not persisted. Canonical main never
recorded DRAFT-3 as APPROVED. The acceptance slice was reopened and superseded by DRAFT-4.
Deals, Campaigns, and Revenue Recommendations remain parked discovery and are not rejected. A
second money engine remains prohibited.

**GTM-R165** records `PD-IMP-036J-DRAFT-3` as `DRAFT_READY_FOR_GATE` after Founder approval of
FD-036J-02 on 2026-09-27. The approved stacking rule is one primary merchandise or order Offer
plus one compatible delivery incentive. A qualifying compatible pair that produces a real
monetary benefit applies together. Valid combinations compete on the best customer monetary
outcome. Standing free delivery does not create a duplicate or fabricated saving.
`OPEN_FOUNDER_PRODUCT_DECISIONS = 0`. Formal lifecycle remains `PLANNED`.
`IMP036J_PRODUCT_DEFINITION` remains `DRAFT_READY_FOR_GATE`.
`IMP036J_PRODUCT_DEFINITION_VERSION` is `PD-IMP-036J-DRAFT-3`.
`IMP036J_PRODUCT_DEFINITION_GATE` remains `NOT_PERFORMED`. `IMP036J_ARCHITECTURE_FIT` remains
`NOT_PERFORMED`. `IMP036J_IMPLEMENTATION_AUTHORIZED` remains `NO`. `IMP036J_STARTED` remains
`NO`. `IMP036J_ACCEPTED` remains `NO`. `acceptedThrough` remains IMP-036I. `currentProductSlice`
remains IMP-036J. `pendingAcceptance` remains NONE. `nextProductSlice` remains IMP-037.
`IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains ARCH-R23. Decision register
remains DR-23. D-377 remains CURRENT. D-382 remains CURRENT. Next decision ID remains D-383.
No D-383 is created. `DRAFT_READY_FOR_GATE` is not Gate PASS and is not approval. Historical
`PD-IMP-036J-DRAFT-2` at GTM-R164 was ready for Gate and was not approved. An independent Gate
evaluation of the unmerged persistence attempt initially returned PASS, then exact-head review
stopped persistence for a material omission. Canonical main never recorded DRAFT-2 as APPROVED
or Gate PASS. DRAFT-2 did not authorize implementation. Deals, Campaigns, and Revenue
Recommendations remain parked discovery and are not rejected. A second money engine remains
prohibited.

**GTM-R164** records `PD-IMP-036J-DRAFT-2` as `DRAFT_READY_FOR_GATE` after Founder approval of
FD-036J-01 on 2026-09-27 (`COUPON_ENTRY_SURFACE = CART + CHECKOUT_REVIEW`;
`ONE_SHARED_COUPON_STATE = YES`; `PAYMENT_COUPON_MUTATION = NO`;
`OPEN_FOUNDER_PRODUCT_DECISIONS = 0`). Formal lifecycle remains `PLANNED`.
`IMP036J_PRODUCT_DEFINITION_GATE` remains `NOT_PERFORMED`. `IMP036J_ARCHITECTURE_FIT` remains
`NOT_PERFORMED`. `IMP036J_IMPLEMENTATION_AUTHORIZED` remains `NO`. `IMP036J_STARTED` remains
`NO`. `IMP036J_ACCEPTED` remains `NO`. `acceptedThrough` remains IMP-036I. `currentProductSlice`
remains IMP-036J. `pendingAcceptance` remains NONE. `nextProductSlice` remains IMP-037.
`IMP037_HOLD` and `IMP038_HOLD` remain YES. Architecture remains ARCH-R23. Decision register
remains DR-23. D-382 remains CURRENT. Next decision ID remains D-383. No D-383 is created.
`DRAFT_READY_FOR_GATE` is not Gate PASS and is not approval. Deals, Campaigns, and Revenue
Recommendations remain parked discovery and are not rejected. A second money engine remains
prohibited.

**GTM-R163** records Founder-authorized sequencing **D-382** (2026-09-27) inserting
**IMP-036J — Promotions, Coupons & Offers** before held IMP-037 and activating it for
Product Definition work only (`IMP036J_ACTIVATED: YES`;
`IMP036J_PRODUCT_DEFINITION: DRAFT_IN_PROGRESS`; `PD-IMP-036J-DRAFT-1`;
`IMP036J_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`; `IMP036J_ARCHITECTURE_FIT: NOT_PERFORMED`;
`IMP036J_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036J_STARTED: NO`;
`IMP036J_IMPLEMENTATION_COMPLETE: NO`; `IMP036J_ACCEPTED: NO`). Formal lifecycle remains
`PLANNED`. `acceptedThrough` remains IMP-036I. `currentProductSlice` is IMP-036J.
`pendingAcceptance` remains NONE. `nextProductSlice` remains IMP-037 and is not advanced.
`PROGRAM_PAUSE` remains `PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` under D-377. D-382 is
additional sequencing authority. Deals, Campaigns, and Revenue Recommendations remain
parked discovery with no IMP identity. Architecture remains ARCH-R23. Decision register
advances to DR-23. D-377 remains CURRENT. This record does not authorize implementation,
perform the Product Definition Gate, perform Architecture Fit, unhold IMP-037 / IMP-038,
close `GAP-EXT-ASSESS-001`, or activate IMP-039 / IMP-040.

**GTM-R162** records formal acceptance of IMP-036I — Scheduled Fulfilment after Founder UAT
PASS on 2026-09-27. The accepted application/UAT candidate remains main
`44f4d7d84af07c3226da606476844d8f05454b28` / tree
`3ec8a7714c25e6066453b47b7d006ef127abddbb` / fingerprint
`85fe93db116bfe86b7f5ba4c266c829433d44401ffd03bdec536b5f61be9c27c`
(`IMP036I_FOUNDER_UAT: PASS`; `IMP036I_FORMAL_ACCEPTANCE: ACCEPTED`;
`IMP036I_ACCEPTED: YES`; `IMP036I_INDEPENDENT_TECHNICAL_ACCEPTANCE: PASS`;
no numeric independent implementation review ID). Independent technical acceptance
of that accepted candidate is the merge on main after independently reviewed
remediation PRs #287, #288, and #290 (PR #289 persisted D-381). The earlier
implementation-review head `335e8b55c74b81d745e923b3d078d6af9ec0b5cc` remains the
pre-remediation review candidate and is not the accepted UAT candidate. Founder UAT Finding 001
(`CHECKOUT_DEPENDENCY_INDETERMINATE`) is RESOLVED. Blocking findings at acceptance
are NONE. Suggested final spot checks for fresh Delivery ASAP, customer self-service
Scheduled cancellation, and a final narrow/mobile pass were
`NOT_REEXECUTED_AS_FINAL_MANUAL_SPOT_CHECK`; overall verdict is `PASS_BY_FOUNDER`.
`acceptedThrough` advances to IMP-036I. `currentProductSlice` is NONE.
`pendingAcceptance` is NONE. `nextProductSlice` remains IMP-037 and is not advanced.
Architecture remains ARCH-R23. Decision register remains DR-22. D-379 remains CURRENT.
D-380 remains CURRENT. D-378 remains AMENDED. D-381 remains CURRENT. No D-382. No
ARCH-R24. `PROGRAM_PAUSE` D-377 and the IMP-037 / IMP-038 holds remain.
`GAP-EXT-ASSESS-001` stays open. Governance reconciliation is not a new UAT candidate.

**GTM-R161** records IMP-036I implementation complete pending acceptance after integrated
Tranche 5 independent verification PASS against reviewed main
`335e8b55c74b81d745e923b3d078d6af9ec0b5cc` / tree
`4b75582d1726e552bdc1e45da15cf667b05de8e0` / fingerprint
`5d79b21381f190682d3cb3f0a2f7e99d43919476f5384c3e1d74d3904218409b`. No numeric
independent-review ID exists for this review. Formal lifecycle is
`IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE` (`IMP036I_IMPLEMENTATION_COMPLETE: YES`;
`IMP036I_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS`; `IMP036I_ACCEPTED: NO`;
`FOUNDER_UAT_REQUIRED: YES`; `FOUNDER_UAT: NOT_PERFORMED`). Tranche 1 through Tranche 5
independent verification is PASS, including financial-document non-regression. Next
action = `FOUNDER_UAT`. This record does not accept IMP-036I, perform Founder UAT,
advance `acceptedThrough`, start IMP-037, or authorize production cutover. `pendingAcceptance`
is IMP-036I. Architecture remains ARCH-R23. Decision register remains DR-21. D-379
remains CURRENT. D-380 remains CURRENT. D-378 remains AMENDED. `PROGRAM_PAUSE` D-377
and the IMP-037 / IMP-038 holds remain. IMP-039 and IMP-040 stay unactivated.
`GAP-EXT-ASSESS-001` stays open.

**GTM-R160** records IMP-036I Tranche 5 integration proof and bounded purchase-authority
hardening after independent Tranche 4 verification PASS against reviewed implementation
`c71047a17630ccb35afe7d49b18a234ce9fc6039` / tree
`cd06ddd4f87abfee15df25c07c052c2a5265f5f6`. No numeric independent Tranche 4 review ID
exists. Formal lifecycle remains `IMPLEMENTATION_IN_PROGRESS`
(`IMP036I_IMPLEMENTATION_AUTHORIZED: YES`; `IMP036I_STARTED: YES`;
`IMP036I_IMPLEMENTATION_STARTED: YES`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`;
`IMP036I_ACCEPTED: NO`; `FOUNDER_UAT: NOT_PERFORMED`). Next action =
`INDEPENDENT_TRANCHE_5_VERIFICATION`. This record does not complete IMP-036I, accept
it, perform Founder UAT, or advance `acceptedThrough`. Architecture remains ARCH-R23.
Decision register remains DR-21. D-379 remains CURRENT. D-380 remains CURRENT. D-378
remains AMENDED. `PROGRAM_PAUSE` D-377 and the IMP-037 / IMP-038 holds remain.

**GTM-R159** records IMP-036I Tranche 4 purchased cancellation enforcement and the
scheduled fulfilment reminder after independent Tranche 3 verification PASS against main
`9b1c73b39f6d709e3e8f9adf7c772564285234e7` / tree
`adea96bff22f54c6aa57d68721d658cfc24e5d73`. Formal lifecycle remains
`IMPLEMENTATION_IN_PROGRESS` (`IMP036I_IMPLEMENTATION_AUTHORIZED: YES`;
`IMP036I_STARTED: YES`; `IMP036I_IMPLEMENTATION_STARTED: YES`;
`IMP036I_IMPLEMENTATION_COMPLETE: NO`; `IMP036I_ACCEPTED: NO`;
`FOUNDER_UAT: NOT_PERFORMED`). Next action = `INDEPENDENT_TRANCHE_4_VERIFICATION`.
This record does not complete IMP-036I, accept it, perform Founder UAT, or advance
`acceptedThrough`. Architecture remains ARCH-R23. Decision register remains DR-21.
D-379 remains CURRENT. D-380 remains CURRENT. D-378 remains AMENDED.
`PROGRAM_PAUSE` D-377 and the IMP-037 / IMP-038 holds remain. Do not start Tranche 5
until independent Tranche 4 verification passes. Tranche 5 hardening remains open.

**GTM-R158** records IMP-036I Tranche 3 customer, operations, and configuration surfaces after
independent Tranche 2 verification PASS against main
`557db375545c5f0853ec894919fd1e0d6f696770` / tree
`35b19c62c080c9c1b432b0dea8937c717d015b72`. Formal lifecycle remains
`IMPLEMENTATION_IN_PROGRESS` (`IMP036I_IMPLEMENTATION_AUTHORIZED: YES`;
`IMP036I_STARTED: YES`; `IMP036I_IMPLEMENTATION_STARTED: YES`;
`IMP036I_IMPLEMENTATION_COMPLETE: NO`; `IMP036I_ACCEPTED: NO`;
`FOUNDER_UAT: NOT_PERFORMED`). Next action = `INDEPENDENT_TRANCHE_3_VERIFICATION`.
This record does not complete IMP-036I, accept it, perform Founder UAT, or advance
`acceptedThrough`. Architecture remains ARCH-R23. Decision register remains DR-21.
D-379 remains CURRENT. D-380 remains CURRENT. D-378 remains AMENDED.
`PROGRAM_PAUSE` D-377 and the IMP-037 / IMP-038 holds remain. Do not start Tranche 4
until independent Tranche 3 verification passes. Proactive scheduled reminder runtime
remains Tranche 4. Independent Tranche 3 verification later passed. GTM-R159 supersedes this record.

**GTM-R157** records IMP-036I Tranche 2 scheduling eligibility and payment bind after independent
Tranche 1 verification PASS against main `d45c8c586652160bfc8793f5fa16c274d402411a` / tree
`a1cfa5cfe6e82974ef1d5daf9d4d2bc851f5bc67`. Formal lifecycle remains
`IMPLEMENTATION_IN_PROGRESS` (`IMP036I_IMPLEMENTATION_AUTHORIZED: YES`;
`IMP036I_STARTED: YES`; `IMP036I_IMPLEMENTATION_STARTED: YES`;
`IMP036I_IMPLEMENTATION_COMPLETE: NO`; `IMP036I_ACCEPTED: NO`;
`FOUNDER_UAT: NOT_PERFORMED`). Next action = `INDEPENDENT_TRANCHE_2_VERIFICATION`.
This record does not complete IMP-036I, accept it, perform Founder UAT, or advance
`acceptedThrough`. Architecture remains ARCH-R23. Decision register remains DR-21.
D-379 remains CURRENT. D-380 remains CURRENT. D-378 remains AMENDED.
`PROGRAM_PAUSE` D-377 and the IMP-037 / IMP-038 holds remain. Do not start Tranche 3
until independent Tranche 2 verification passes. Independent Tranche 2 verification
later passed. GTM-R158 supersedes this record.

**GTM-R156** records IMP-036I implementation start once Tranche 1 persistence and domain
foundations exist. Formal lifecycle is `IMPLEMENTATION_IN_PROGRESS`
(`IMP036I_IMPLEMENTATION_AUTHORIZED: YES`; `IMP036I_STARTED: YES`;
`IMP036I_IMPLEMENTATION_STARTED: YES`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`;
`IMP036I_ACCEPTED: NO`; `FOUNDER_UAT: NOT_PERFORMED`). At this record the next action was
`IMPLEMENTATION_TRANCHE_1`, pending independent Tranche 1 verification. Independent
Tranche 1 verification later passed. GTM-R157 supersedes this record. This record
does not complete IMP-036I, accept it, perform Founder UAT, or advance
`acceptedThrough`. Architecture remains ARCH-R23. Decision register remains DR-21.
D-379 remains CURRENT. D-380 remains CURRENT. D-378 remains AMENDED.
`PROGRAM_PAUSE` D-377 and the IMP-037 / IMP-038 holds remain.
`PRE_EXISTING_DELIVERY_CONFORMANCE_DEBT` is CLOSED by the Tranche 1 runtime correction.

**GTM-R155** records explicit human IMP-036I implementation authorization after independent
Architecture Fit PASS (`5312653831`) and architecture-lock persistence verification
(`5313026804`). Authorization date **2026-09-25**. Formal lifecycle remains
`ARCHITECTURE_LOCKED` (`IMP036I_IMPLEMENTATION_AUTHORIZED: YES`;
`IMP036I_IMPLEMENTATION_AUTHORIZATION: APPROVED`; `IMP036I_STARTED: NO`;
`IMP036I_IMPLEMENTATION_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`;
`IMP036I_ACCEPTED: NO`). Execution plan:
[`product/IMP-036I/implementation-plan.md`](./product/IMP-036I/implementation-plan.md)
(`IMPLEMENTATION_EXECUTION_PLAN`; not Product Definition, architecture, or acceptance
authority). Next action = `IMPLEMENTATION_TRANCHE_1`. Preserves `acceptedThrough = IMP-036H`;
`currentProductSlice = IMP-036I`; `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`
(held). Preserves `PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**).
Preserves **ARCH-R23** / **DR-21** / **D-379** CURRENT / **D-380** CURRENT / **D-378** AMENDED.
Does **not** start runtime implementation, create migrations, accept IMP-036I, perform Founder
UAT, or close `PRE_EXISTING_DELIVERY_CONFORMANCE_DEBT`. Semantic checkpoint:
`IMP036I_IMPLEMENTATION_AUTHORIZED`. Supersedes GTM-R154.

**GTM-R154** (historical prior tip; superseded by GTM-R155) records IMP-036I Architecture Fit **PASS** and architecture lock persistence.
Independent Architecture Fit review `5312653831` = **PASS** against evaluated HEAD
`42e854b931e216fadc64b479371cebca4c38d17e` / tree
`279e0e1b0e8f52c96cfd12fc89b329f73281e38f` / fingerprint
`b65f40b9e568a6d0188f1d031f41db3a072cb3b4683d2d966c2a994283575068`.
Human architecture lock approval **2026-09-25**. **D-379** = **CURRENT** / **ADR-019** Accepted /
**ARCH-G29**. **D-380** = **CURRENT** / **ADR-020** Accepted / **ARCH-G30**. **D-378** is **AMENDED**
only for ASAP-only / no-scheduled-schema clauses. Architecture tip **ARCH-R23**. Decision register
tip **DR-21**. Product Definition remains `PD-IMP-036I-DRAFT-4` **APPROVED** / Gate **PASS**
(review `5307761142`). Formal lifecycle `ARCHITECTURE_LOCKED`
(`IMP036I_ARCHITECTURE_FIT: PASS`; `IMP036I_ARCHITECTURE_LOCKED: YES`;
`IMP036I_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036I_STARTED: NO`;
`IMP036I_IMPLEMENTATION_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`;
`IMP036I_ACCEPTED: NO`). Preserves `acceptedThrough = IMP-036H`;
`currentProductSlice = IMP-036I`; `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`
(held). Preserves `PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**).
Does **not** authorize or start IMP-036I implementation. Next action =
`IMPLEMENTATION_AUTHORIZATION`. Semantic checkpoint: `IMP036I_ARCHITECTURE_LOCKED`.
Supersedes GTM-R153.

**GTM-R153** (historical prior tip; superseded by GTM-R154) records independently executed Product Definition Gate **PASS** for
**IMP-036I — Scheduled Fulfilment** candidate `PD-IMP-036I-DRAFT-4`
(`IMP036I_PRODUCT_DEFINITION: APPROVED`; `IMP036I_PRODUCT_DEFINITION_GATE: PASS`).
Gate-evaluated candidate HEAD `1c4be04b6d6b51bdedebfea0485099dede3c7923` / tree
`a0774c9b2cb256f8d329fc49cea1c9859a39d1d7` / fingerprint
`07720d20f1e285ef46e6bd3be6d710be383baacde4facab7651482547b6dc15d`; independent gate
evidence review `5307761142` — Gate Result PASS. Post-gate persistence commit is not the
evaluated artifact. Preserves historical DRAFT-1 Gate **PERFORMED** / **STOP** (review
`5305796113`), DRAFT-2 Gate **PERFORMED** / **STOP** (review `5306341697`), and DRAFT-3
Gate **PERFORMED** / **STOP** (review `5306868578`) — not PASS; not erased.
Preserves `IMP036I_ACTIVATED: YES`; formal ROADMAP lifecycle remains `PLANNED`;
`IMP036I_ARCHITECTURE_FIT: NOT_PERFORMED`; `IMP036I_ARCHITECTURE_LOCKED: NO`;
`IMP036I_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036I_STARTED: NO`;
`IMP036I_IMPLEMENTATION_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`;
`IMP036I_ACCEPTED: NO`. Preserves `acceptedThrough = IMP-036H`;
`currentProductSlice = IMP-036I`; `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`
(ledger successor; remains `IMP037_HOLD: YES` / `BLOCKED_PROVIDER_ACCESS`). Preserves
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); holds IMP-037 /
IMP-038 unchanged (including frozen IMP-038 runtime evidence). Preserves **ARCH-R22** /
**DR-20** / **D-378** CURRENT / **ADR-018** Accepted / **ARCH-G28** unchanged — no new
D-number and no ARCH revision. Does **not** perform Architecture Fit, architecture lock,
implementation authorization, or implementation start for IMP-036I. Does **not** accept
IMP-036I / IMP-037/038 or close `GAP-EXT-ASSESS-001`. Per-IMP Product Definition:
[`product/IMP-036I/product-definition.md`](./product/IMP-036I/product-definition.md).
Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_GATE_PASS`. Next gate = Architecture Fit
(NOT_PERFORMED). Supersedes GTM-R152.

**GTM-R152** (historical prior tip; superseded by GTM-R153) records Product Definition Gate STOP remediation for **IMP-036I — Scheduled Fulfilment**
after independent Gate review `5306868578` STOPped `PD-IMP-036I-DRAFT-3` (candidate HEAD
`0af84959edbe910183797b76d4d2228835d9040f` / TREE `21fc00b2045095fc0288bd941d2d17dfe2b89db6` /
fingerprint `78933afecd6b6e1022298303710da1ed9f38262c969e958515098380a05d953e`). Creates CURRENT
gate candidate `PD-IMP-036I-DRAFT-4` = `DRAFT_READY_FOR_GATE` (`READY_FOR_PRODUCT_DEFINITION_GATE: YES`;
`OPEN_FOUNDER_DECISIONS: 0`; `UNRESOLVED_MATERIAL_PRODUCT_DECISIONS: 0`) with no Founder
product-semantic change — FD-036I-09 sealing / checkout revalidation policy remains complete
(Pickup 30 / Delivery 60; Brand-level; 0–240; no Outlet override; no fee; per-Order sealed from
payment-bound Checkout Snapshot; later Brand changes affect future purchases only; stale
checkout revalidation). Remediation restores STATE-R148→DRAFT-2 provenance, product-index
CURRENT pointer, paired CURRENT tip anchors, independent visible version authorities, and
bounded Gate STOP history validation. Preserves historical DRAFT-1 Gate execution as
**PERFORMED** / **STOP** (review `5305796113`), historical DRAFT-2 Gate execution as
**PERFORMED** / **STOP** (review `5306341697`), and historical DRAFT-3 Gate execution as
**PERFORMED** / **STOP** (review `5306868578`) — not PASS; not overwritten as NOT_PERFORMED.
CURRENT DRAFT-4 Gate remains `IMP036I_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`.
Preserves `IMP036I_ACTIVATED: YES`; formal ROADMAP lifecycle remains `PLANNED`;
`IMP036I_ARCHITECTURE_FIT: NOT_PERFORMED`; `IMP036I_ARCHITECTURE_LOCKED: NO`;
`IMP036I_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036I_STARTED: NO`;
`IMP036I_IMPLEMENTATION_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`; `IMP036I_ACCEPTED: NO`.
Preserves `acceptedThrough = IMP-036H`; `currentProductSlice = IMP-036I`;
`pendingAcceptance = NONE`; `nextProductSlice = IMP-037` (ledger successor; remains
`IMP037_HOLD: YES` / `BLOCKED_PROVIDER_ACCESS`). Preserves
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); holds IMP-037 / IMP-038
unchanged (including frozen IMP-038 runtime evidence). Preserves **ARCH-R22** / **DR-20** /
**D-378** CURRENT / **ADR-018** Accepted / **ARCH-G28** unchanged — no new D-number and no ARCH
revision. Does **not** execute Product Definition Gate against DRAFT-4, Architecture Fit,
architecture lock, implementation authorization, or implementation start for IMP-036I. Does **not**
accept IMP-036I / IMP-037/038 or close `GAP-EXT-ASSESS-001`. Per-IMP Product Definition:
[`product/IMP-036I/product-definition.md`](./product/IMP-036I/product-definition.md).
Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_DRAFT_READY`. Next gate = Independent Product
Definition Gate review of exact DRAFT-4 merged candidate (NOT performed here). Supersedes GTM-R151.

**GTM-R151** (historical prior tip; superseded by GTM-R152) records Product Definition Gate STOP remediation for **IMP-036I — Scheduled Fulfilment**
after independent Gate review `5306341697` STOPped `PD-IMP-036I-DRAFT-2` (candidate HEAD
`421fc76869812384df2018b9ffae86de4c33cdc3` / TREE `ba33220c06beede81af9fe15ea053df01e470503` /
fingerprint `eeeed322c8bbe799c7fc245553d5585210108b797226ded9a84f105d0d3ef8fd`). Creates CURRENT
gate candidate `PD-IMP-036I-DRAFT-3` = `DRAFT_READY_FOR_GATE` (`READY_FOR_PRODUCT_DEFINITION_GATE: YES`;
`OPEN_FOUNDER_DECISIONS: 0`; `UNRESOLVED_MATERIAL_PRODUCT_DECISIONS: 0`) with Founder-approved
FD-036I-09 sealing amendment (2026-09-24): per-Order cancellation cutoff sealed from the
payment-bound Checkout Snapshot; later Brand changes affect future purchases only; stale
checkout requires revalidation/reconfirmation before payment binding. Preserves historical
DRAFT-1 Gate execution as **PERFORMED** / **STOP** (review `5305796113`) and historical DRAFT-2
Gate execution as **PERFORMED** / **STOP** (review `5306341697`) — not PASS; not overwritten as
NOT_PERFORMED. CURRENT DRAFT-3 Gate remains `IMP036I_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`.
Preserves `IMP036I_ACTIVATED: YES`; formal ROADMAP lifecycle remains `PLANNED`;
`IMP036I_ARCHITECTURE_FIT: NOT_PERFORMED`; `IMP036I_ARCHITECTURE_LOCKED: NO`;
`IMP036I_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036I_STARTED: NO`;
`IMP036I_IMPLEMENTATION_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`; `IMP036I_ACCEPTED: NO`.
Preserves `acceptedThrough = IMP-036H`; `currentProductSlice = IMP-036I`;
`pendingAcceptance = NONE`; `nextProductSlice = IMP-037` (ledger successor; remains
`IMP037_HOLD: YES` / `BLOCKED_PROVIDER_ACCESS`). Preserves
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); holds IMP-037 / IMP-038
unchanged (including frozen IMP-038 runtime evidence). Preserves **ARCH-R22** / **DR-20** /
**D-378** CURRENT / **ADR-018** Accepted / **ARCH-G28** unchanged — no new D-number and no ARCH
revision. Does **not** execute Product Definition Gate against DRAFT-3, Architecture Fit,
architecture lock, implementation authorization, or implementation start for IMP-036I. Does **not**
accept IMP-036I / IMP-037/038 or close `GAP-EXT-ASSESS-001`. Per-IMP Product Definition:
[`product/IMP-036I/product-definition.md`](./product/IMP-036I/product-definition.md).
Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_DRAFT_READY`. Independent Product Definition Gate
for DRAFT-3 was later PERFORMED and resulted in **STOP** (review `5306868578`) — recorded under
GTM-R152 remediation; this tip itself did not claim Gate PASS. Supersedes GTM-R150.

**GTM-R150** (historical prior tip; superseded by GTM-R151) records Product Definition Gate STOP remediation for **IMP-036I — Scheduled Fulfilment**
after independent Gate review `5305796113` STOPped `PD-IMP-036I-DRAFT-1` (candidate HEAD
`b0dd82c053520cd888b469666e1dc0c3a08dff4d` / TREE `d4c5e1f862a95f96bd79fb07ee50bba439967161` /
fingerprint `55327c21df1e41ba330061ea658732d408a8c735682e02ed7f651269a7877f7f`). Creates CURRENT
gate candidate `PD-IMP-036I-DRAFT-2` = `DRAFT_READY_FOR_GATE` (`READY_FOR_PRODUCT_DEFINITION_GATE: YES`;
`OPEN_FOUNDER_DECISIONS: 0`; `UNRESOLVED_MATERIAL_PRODUCT_DECISIONS: 0`) with Founder-approved
FD-036I-09 amendment (2026-09-24) binding V1 cancellation-cutoff policy (Pickup default 30 /
Delivery default 60; Brand-level per mode; range 0–240; no Outlet override; no fee). Preserves
historical DRAFT-1 Gate execution as **PERFORMED** / **STOP** (not PASS; not overwritten as
NOT_PERFORMED). CURRENT DRAFT-2 Gate remains `IMP036I_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`.
Preserves `IMP036I_ACTIVATED: YES`; formal ROADMAP lifecycle remains `PLANNED`;
`IMP036I_ARCHITECTURE_FIT: NOT_PERFORMED`; `IMP036I_ARCHITECTURE_LOCKED: NO`;
`IMP036I_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036I_STARTED: NO`;
`IMP036I_IMPLEMENTATION_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`; `IMP036I_ACCEPTED: NO`.
Preserves `acceptedThrough = IMP-036H`; `currentProductSlice = IMP-036I`;
`pendingAcceptance = NONE`; `nextProductSlice = IMP-037` (ledger successor; remains
`IMP037_HOLD: YES` / `BLOCKED_PROVIDER_ACCESS`). Preserves
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); holds IMP-037 / IMP-038
unchanged (including frozen IMP-038 runtime evidence). Preserves **ARCH-R22** / **DR-20** /
**D-378** CURRENT / **ADR-018** Accepted / **ARCH-G28** unchanged — no new D-number and no ARCH
revision. Does **not** execute Product Definition Gate against DRAFT-2, Architecture Fit,
architecture lock, implementation authorization, or implementation start for IMP-036I. Does **not**
accept IMP-036I / IMP-037/038 or close `GAP-EXT-ASSESS-001`. Per-IMP Product Definition:
[`product/IMP-036I/product-definition.md`](./product/IMP-036I/product-definition.md).
Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_DRAFT_READY`. Independent Product Definition Gate
for DRAFT-2 was later PERFORMED and resulted in **STOP** (review `5306341697`) — recorded under
GTM-R151 remediation; this tip itself did not claim Gate PASS. Supersedes GTM-R149.

**GTM-R149** (historical prior tip; superseded by GTM-R150) records Founder-approved resolution of FD-036I-01…15 on 2026-09-24 and advances
**IMP-036I — Scheduled Fulfilment** Product Definition from `PRE_GATE_DRAFT` to
`DRAFT_READY_FOR_GATE` (`PD-IMP-036I-DRAFT-1`; `READY_FOR_PRODUCT_DEFINITION_GATE: YES`;
`OPEN_FOUNDER_DECISIONS: 0`; `UNRESOLVED_MATERIAL_PRODUCT_DECISIONS: 0`). Preserves
`IMP036I_ACTIVATED: YES`; formal ROADMAP lifecycle remains `PLANNED`;
`IMP036I_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`; `IMP036I_ARCHITECTURE_FIT: NOT_PERFORMED`;
`IMP036I_ARCHITECTURE_LOCKED: NO`; `IMP036I_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036I_STARTED: NO`;
`IMP036I_IMPLEMENTATION_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`; `IMP036I_ACCEPTED: NO`.
Preserves `acceptedThrough = IMP-036H`; `currentProductSlice = IMP-036I`;
`pendingAcceptance = NONE`; `nextProductSlice = IMP-037` (ledger successor; remains
`IMP037_HOLD: YES` / `BLOCKED_PROVIDER_ACCESS`). Preserves
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); holds IMP-037 / IMP-038
unchanged (including frozen IMP-038 runtime evidence). Preserves **ARCH-R22** / **DR-20** /
**D-378** CURRENT / **ADR-018** Accepted / **ARCH-G28** unchanged — no new D-number and no ARCH
revision. Does **not** execute Product Definition Gate, Architecture Fit, architecture lock,
implementation authorization, or implementation start for IMP-036I. Does **not** accept
IMP-036I / IMP-037/038 or close `GAP-EXT-ASSESS-001`. Per-IMP Product Definition:
[`product/IMP-036I/product-definition.md`](./product/IMP-036I/product-definition.md).
Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_DRAFT_READY`. Independent Product Definition Gate
for DRAFT-1 was later PERFORMED and resulted in **STOP** (review `5305796113`) — recorded under
GTM-R150 remediation; this tip itself did not claim Gate PASS. Supersedes GTM-R148.

**GTM-R148** (historical prior tip; superseded by GTM-R149) records Founder-authorized activation of **IMP-036I — Scheduled Fulfilment** for
**Product Definition only** (`IMP036I_ACTIVATED: YES`; formal ROADMAP lifecycle remains `PLANNED`;
`IMP036I_PRODUCT_DEFINITION: PRE_GATE_DRAFT`; candidate `PD-IMP-036I-DRAFT-1`;
`IMP036I_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`; `IMP036I_ARCHITECTURE_FIT: NOT_PERFORMED`;
`IMP036I_ARCHITECTURE_LOCKED: NO`; `IMP036I_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036I_STARTED: NO`;
`IMP036I_IMPLEMENTATION_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`; `IMP036I_ACCEPTED: NO`).
Preserves `acceptedThrough = IMP-036H`; sets `currentProductSlice = IMP-036I` and
`pendingAcceptance = NONE`; sets `nextProductSlice = IMP-037` (ledger successor; remains
`IMP037_HOLD: YES` / `BLOCKED_PROVIDER_ACCESS` — activation of IMP-036I does **not** promote,
authorize, or accept IMP-037 / IMP-038 / IMP-039 / IMP-040). Preserves
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); holds IMP-037 / IMP-038
unchanged (including frozen IMP-038 runtime evidence). Preserves **ARCH-R22** / **DR-20** /
**D-378** CURRENT / **ADR-018** Accepted / **ARCH-G28** unchanged — no new D-number and no ARCH
revision. Does **not** execute Product Definition Gate, Architecture Fit, architecture lock,
implementation authorization, or implementation start for IMP-036I. Does **not** accept
IMP-037/038 or close `GAP-EXT-ASSESS-001`. Per-IMP Product Definition draft:
[`product/IMP-036I/product-definition.md`](./product/IMP-036I/product-definition.md).
Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_ACTIVATION`.

**GTM-R147** (historical prior tip; superseded by GTM-R148) records formal IMP-036H acceptance after Founder UAT PASS on 2026-09-24 for the exact
accepted UAT runtime candidate `37bae964f964bddd317e4c290dc146097e4c8f57` / tree
`f52cd6279deb22c251062880087a2078fc7bce3b` (fingerprint
`e49d860c721d2524b248738750530a416f8418d02d10b64e69531f8548fcfb79`; Founder authority; decision date 2026-09-24).
Founder UAT check marks: pickup_profile PASS, customer_pickup PASS, payment PASS,
operations_handover PASS, customer_order_history PASS, mode_switching PASS, unavailable_state PASS,
mobile PASS; overall PASS; findings NONE BLOCKING. Formal IMP-036H ROADMAP lifecycle is
`COMPLETE_AND_ACCEPTED` (`IMP036H_ACCEPTED: YES`; `IMP036H_FOUNDER_UAT: PASS`;
`IMP036H_FORMAL_ACCEPTANCE: ACCEPTED`; `IMP036H_INDEPENDENT_TECHNICAL_ACCEPTANCE: PASS` bound to
independent implementation review id `5302239433`; `IMP036H_AUTOMATED_ACCEPTANCE: 42/42 PASS`).
Preserves implementation / Fit provenance unchanged (reviewed HEAD `649b7848…` / tree `b272adf4…`;
Fit review `5295149318`). Preserves **ARCH-R22** / **DR-20** / **D-378** CURRENT / **ADR-018**
Accepted / **ARCH-G28** unchanged — no new D-number and no ARCH revision. Advances
`acceptedThrough = IMP-036H`; sets `currentProductSlice = NONE` and `pendingAcceptance = NONE`;
preserves `nextProductSlice = IMP-036I` (`PLANNED` / `NOT_ACTIVATED`; `IMP036I_ACTIVATED: NO`).
Preserves `PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); holds IMP-037 /
IMP-038 unchanged (including frozen IMP-038 runtime evidence). This governance reconciliation is
**not** a new product UAT candidate and does **not** claim Founder tested the governance-only merge
commit. Does **not** activate IMP-036I / IMP-039 / IMP-040, accept IMP-037/038, or close
`GAP-EXT-ASSESS-001`. Locked capability:
[`capabilities/IMP-036H-customer-pickup-takeaway.md`](./capabilities/IMP-036H-customer-pickup-takeaway.md).
Per-IMP Product Definition:
[`product/IMP-036H/product-definition.md`](./product/IMP-036H/product-definition.md).
ADVANCE / activation of IMP-036I is a separate Founder-authorized task.
Semantic checkpoint: `IMP036H_ACCEPTANCE`.

**GTM-R146** (historical prior tip; superseded by GTM-R147) persisted IMP-036H implementation complete pending acceptance
(`IMP036H_IMPLEMENTATION_AUTHORIZED: YES`; `IMP036H_STARTED: YES`;
`IMP036H_IMPLEMENTATION_STARTED: YES`; `IMP036H_IMPLEMENTATION_COMPLETE: YES`;
`IMP-036H_IMPLEMENTATION_COMPLETE: YES`; `IMP036H_ACCEPTED: NO`; `IMP036H_FOUNDER_UAT_REQUIRED: YES`; `IMP036H_FOUNDER_UAT: NOT_PERFORMED`;
`IMP036H_FORMAL_ACCEPTANCE: NOT_PERFORMED`). Formal IMP-036H ROADMAP lifecycle was
`IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE` (`IMP036H_ARCHITECTURE_FIT: PASS`;
`IMP036H_ARCHITECTURE_LOCKED: YES`; `IMP036H_IMPLEMENTATION: AUTHORIZED / STARTED / COMPLETE`).
Independent implementation review = **PASS** (review id `5302239433`) against exact reviewed
candidate HEAD `649b7848f99918f927da4a77e98cd81cdc146e6b` / tree
`b272adf40f89b0011fff07bf4d6b6d0d735df68a` / fingerprint
`c2bc6a91ce536329bec0ad4af4d3264a5a39904d035af28442071b4e96e2f56a`; implementation evidence
PR#246 comment `5810833593`; automated acceptance `42/42 PASS`. Preserves Fit evidence SHAs and
independent Architecture Fit review id unchanged (PR #239 review `5295149318`; Fit-evaluated HEAD
`aab814c238c499367ee921e9f8ffb03ff7b1b373` / tree `93d4e83d4a73c61c9439bcaae2799920fcca46db` /
fingerprint `74b1254f22c9131a6e073522cf9310f264866e442cc074775ad5f4b214f0e51e`). Preserved
**ARCH-R22** / **DR-20** / **D-378** CURRENT / **ADR-018** Accepted / **ARCH-G28** unchanged — no
new D-number and no ARCH revision. Preserved
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); `acceptedThrough = IMP-036G`;
`currentProductSlice = IMP-036H`; `nextProductSlice = IMP-036I`; `pendingAcceptance = IMP-036H`;
`gtmBoundary = IMP-040`. Held IMP-037 / IMP-038 unchanged (including frozen IMP-038 runtime
evidence). Completion was **not** acceptance. Did **not** accept IMP-036H, perform Founder UAT,
activate IMP-036I / IMP-039 / IMP-040, accept IMP-037/038, or close `GAP-EXT-ASSESS-001`. Evidence
candidate: [`product/IMP-036H/evidence-candidate.md`](./product/IMP-036H/evidence-candidate.md).
Locked capability:
[`capabilities/IMP-036H-customer-pickup-takeaway.md`](./capabilities/IMP-036H-customer-pickup-takeaway.md).
Historical next gate = independent technical acceptance → UAT deployment → Founder UAT → acceptance
reconciliation — **not** IMP-036I activation.
Semantic checkpoint: `IMP036H_IMPLEMENTATION_COMPLETE`. Superseded as CURRENT tip by GTM-R147.

**GTM-R145** (historical prior tip; superseded by GTM-R146) persisted IMP-036H implementation start
(`IMP036H_IMPLEMENTATION_AUTHORIZED: YES`; `IMP036H_STARTED: YES`;
`IMP036H_IMPLEMENTATION_STARTED: YES`; `IMP036H_IMPLEMENTATION_COMPLETE: NO`). Formal IMP-036H
ROADMAP lifecycle was `IMPLEMENTATION_IN_PROGRESS` (`IMP036H_ARCHITECTURE_FIT: PASS`;
`IMP036H_ARCHITECTURE_LOCKED: YES`). Preserved Fit evidence SHAs and independent review id
unchanged (PR #239 review `5295149318`; Fit-evaluated HEAD
`aab814c238c499367ee921e9f8ffb03ff7b1b373` / tree `93d4e83d4a73c61c9439bcaae2799920fcca46db` /
fingerprint `74b1254f22c9131a6e073522cf9310f264866e442cc074775ad5f4b214f0e51e`). Preserved
**ARCH-R22** / **DR-20** / **D-378** CURRENT / **ADR-018** Accepted / **ARCH-G28** unchanged — no
new D-number and no ARCH revision. Preserved
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); `acceptedThrough = IMP-036G`;
`currentProductSlice = IMP-036H`; `nextProductSlice = IMP-036I`; `pendingAcceptance = NONE`;
`gtmBoundary = IMP-040`. Held IMP-037 / IMP-038 unchanged (including frozen IMP-038 runtime
evidence). Did **not** claim `IMPLEMENTATION_COMPLETE`, accept IMP-036H, activate IMP-036I /
IMP-039 / IMP-040, accept IMP-037/038, or close `GAP-EXT-ASSESS-001`. Execution plan:
[`product/IMP-036H/implementation-plan.md`](./product/IMP-036H/implementation-plan.md). Locked
capability:
[`capabilities/IMP-036H-customer-pickup-takeaway.md`](./capabilities/IMP-036H-customer-pickup-takeaway.md).
Historical next gate = continue authorized IMP-036H implementation — **not** acceptance.
Semantic checkpoint: `IMP036H_IMPLEMENTATION_START`. Superseded as CURRENT tip by GTM-R146.

**GTM-R144** (historical prior tip; superseded by GTM-R145) persisted Founder implementation
authorization for IMP-036H (`IMP036H_IMPLEMENTATION_AUTHORIZED: YES`; `IMP036H_STARTED: NO`;
`IMP036H_IMPLEMENTATION_STARTED: NO`; `IMP036H_IMPLEMENTATION_COMPLETE: NO`). Formal IMP-036H
ROADMAP lifecycle remained `ARCHITECTURE_LOCKED` (`IMP036H_ARCHITECTURE_FIT: PASS`;
`IMP036H_ARCHITECTURE_LOCKED: YES`). Preserved Fit evidence SHAs and independent review id
unchanged (PR #239 review `5295149318`; Fit-evaluated HEAD
`aab814c238c499367ee921e9f8ffb03ff7b1b373` / tree `93d4e83d4a73c61c9439bcaae2799920fcca46db` /
fingerprint `74b1254f22c9131a6e073522cf9310f264866e442cc074775ad5f4b214f0e51e`). Preserved
**ARCH-R22** / **DR-20** / **D-378** CURRENT / **ADR-018** Accepted / **ARCH-G28** unchanged —
no new D-number and no ARCH revision. Preserved
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); `acceptedThrough = IMP-036G`;
`currentProductSlice = IMP-036H`; `nextProductSlice = IMP-036I`; `pendingAcceptance = NONE`;
`gtmBoundary = IMP-040`. Held IMP-037 / IMP-038 unchanged (including frozen IMP-038 runtime
evidence). Did **not** start implementation, execute schema migration, accept IMP-036H, activate
IMP-036I / IMP-039 / IMP-040, accept IMP-037/038, or close `GAP-EXT-ASSESS-001`. Execution plan:
[`product/IMP-036H/implementation-plan.md`](./product/IMP-036H/implementation-plan.md). Locked
capability:
[`capabilities/IMP-036H-customer-pickup-takeaway.md`](./capabilities/IMP-036H-customer-pickup-takeaway.md).
Historical next gate = Implementation Start — **not** automatic start.
Superseded as CURRENT tip by GTM-R145.

**GTM-R143** (historical prior tip; superseded by GTM-R144) persisted Architecture Fit PASS and
capability architecture lock for IMP-036H against exact evaluated candidate HEAD
`aab814c238c499367ee921e9f8ffb03ff7b1b373` / tree `93d4e83d4a73c61c9439bcaae2799920fcca46db` /
fingerprint `74b1254f22c9131a6e073522cf9310f264866e442cc074775ad5f4b214f0e51e`; independent
Architecture Fit evidence PR #239 review `5295149318` — Fit Result PASS. Promoted **D-378**
PROPOSED → CURRENT; ADR-018 Proposed → Accepted; ARCH-R21 → **ARCH-R22** (adds **ARCH-G28**);
DR-19 → **DR-20**. Formal IMP-036H ROADMAP lifecycle → `ARCHITECTURE_LOCKED`
(`IMP036H_ARCHITECTURE_FIT: PASS`; `IMP036H_ARCHITECTURE_LOCKED: YES`). Preserved
`PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**); `acceptedThrough = IMP-036G`;
`currentProductSlice = IMP-036H`; `nextProductSlice = IMP-036I`; `pendingAcceptance = NONE`;
`gtmBoundary = IMP-040`. Implementation remained `NOT_AUTHORIZED` / `NOT_STARTED`
(`IMP036H_ACCEPTED: NO`; `IMP036H_FOUNDER_UAT_REQUIRED: YES`; `IMP036I_ACTIVATED: NO`). Held
IMP-037 / IMP-038 unchanged (including frozen IMP-038 runtime evidence). Did **not** authorize/start
implementation, execute schema migration, accept IMP-036H, activate IMP-036I / IMP-039 / IMP-040,
accept IMP-037/038, or close `GAP-EXT-ASSESS-001`. Locked capability:
[`capabilities/IMP-036H-customer-pickup-takeaway.md`](./capabilities/IMP-036H-customer-pickup-takeaway.md).
Historical next gate = Implementation Authorization — **not** automatic implementation start.
Superseded as CURRENT tip by GTM-R144.

**GTM-R142** (historical prior tip; superseded by GTM-R143) persisted independently executed Product
Definition Gate PASS for IMP-036H candidate
`PD-IMP-036H-DRAFT-1` (`IMP036H_PRODUCT_DEFINITION: APPROVED`;
`IMP036H_PRODUCT_DEFINITION_GATE: PASS`). Gate-evaluated candidate HEAD
`91d3714a9efba59c309db159d112fdbb6c46dc72` / tree `3f8459cfc88c97f4267528fe5b8c3e8773692245` /
fingerprint `81395a83ca492a791ee1faca3fdbf627b985c30adf00d2163693b3ccd6523664`; independent gate
evidence PR#238 comment `5797812536` — Gate Result PASS. The later gate-persistence commit is
**not** the evaluated artifact. Preserved `PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED`
(**D-377**); `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-036H`;
`nextProductSlice = IMP-036I`; `pendingAcceptance = NONE`; `gtmBoundary = IMP-040`. Formal IMP-036H
ROADMAP lifecycle remained `PLANNED` (`IMP036H_ACTIVATED: YES`; Architecture Fit `NOT_PERFORMED`;
architecture `NOT_LOCKED`; implementation `NOT_AUTHORIZED` / `NOT_STARTED`; `IMP036H_ACCEPTED: NO`;
`IMP036H_FOUNDER_UAT_REQUIRED: YES`; `IMP036I_ACTIVATED: NO`). Held IMP-037 / IMP-038 unchanged
(including frozen IMP-038 runtime evidence). Did **not** perform Architecture Fit, lock
architecture, authorize/start implementation, accept IMP-036H, activate IMP-036I / IMP-039 /
IMP-040, accept IMP-037/038, or close `GAP-EXT-ASSESS-001`. ARCH-R21 / DR-19 unchanged at that tip.
Historical next gate = Architecture Fit — **not** implementation. Superseded as CURRENT tip by
GTM-R143.

**GTM-R141** (historical prior tip; superseded by GTM-R142) activated Founder-authorized pre-GTM
product insertion under **D-377** / `PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED`.
Set `currentProductSlice = IMP-036H` with formal lifecycle `PLANNED` and `IMP036H_ACTIVATED: YES`;
Product Definition candidate `PD-IMP-036H-DRAFT-1` was ungated / ready for gate evaluation at that
tip (Product Definition Gate had not yet been performed; Architecture Fit had not yet been
performed; architecture not locked; implementation not authorized / not started;
`IMP036H_ACCEPTED: NO`; `IMP036H_FOUNDER_UAT_REQUIRED: YES`). Reserved `IMP-036I — Scheduled
Fulfilment` as `PLANNED` only (`IMP036I_ACTIVATED: NO`; `nextProductSlice = IMP-036I`). Held IMP-037
(`IMP037_HOLD: YES`; remains `IMPLEMENTATION_IN_PROGRESS`; `PHASE1_BLOCK_STATUS: BLOCKED_PROVIDER_ACCESS`;
`IMP037_IMPLEMENTATION_COMPLETE: NO`; `IMP037_ACCEPTED: NO`) and IMP-038
(`IMP038_HOLD: YES`; `IMPLEMENTATION_IN_PROGRESS (HOLD — IMPLEMENTATION_COMPLETE / NOT_ACCEPTED)`;
`IMP038_IMPLEMENTATION_COMPLETE: YES`; `IMP038_ACCEPTED: NO`;
`IMP038_EXTERNAL_ASSESSMENT: DEFERRED_UNTIL_PRE_GTM_APPLICATION_SCOPE_STABILIZES`; frozen runtime
`dc6b19e6f88d4084e424d927e6467c374596fb0a` / tree `c3aefb57f3f6c941d7f14907b6c095c4aa7f0547` /
fingerprint `2800fe11397ee2a01e9decf572f85adf5c3a8b244ca34b1f53d579e05feac589`;
`GAP-EXT-ASSESS-001: NOT_CLOSED`). Preserved historical
`CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038` (authority PR#179/5771367844) without
keeping IMP-038 as `currentProductSlice`. Kept `acceptedThrough = IMP-036G`;
`pendingAcceptance = NONE`; `IMP039_ACTIVATED: NO`; `IMP040_ACTIVATED: NO`. Did **not** create an
ARCH revision (ARCH-R21 unchanged); did **not** authorize IMP-036H implementation; did **not**
activate IMP-036I / IMP-039 / IMP-040; did **not** accept IMP-037 or IMP-038; did **not** reopen
IMP-038 implementation; did **not** close `GAP-EXT-ASSESS-001`. Historical next gate at that tip =
Product Definition Gate for `PD-IMP-036H-DRAFT-1` — **not** Architecture Fit / implementation.
Superseded as CURRENT tip by GTM-R142.

**GTM-R140** records a combined Founder-authorized IMP-038 implementation **AUTHORIZE + START**
checkpoint (intentional combine; no separate authorize-only tip). Sets formal IMP-038 lifecycle to
`IMPLEMENTATION_IN_PROGRESS`; `IMP038_IMPLEMENTATION_AUTHORIZED: YES`; `IMP038_STARTED: YES`;
`FOUNDER_IMP038_IMPLEMENTATION_AUTHORIZATION: CURSOR_SESSION_MANDATE` (Founder delivery-owner
mandate; starting authority `main` `d14c3678b92a87052682b9559764654f5f9d3851` / tree
`682f1597a6f991cddde7d41e9e6705c1bed335b1`; locked `PD-IMP-038-DRAFT-2` + ARCH-R21 / D-375 /
ADR-017). Preserves Architecture Fit **PASS** / architecture **LOCKED**; independent Architecture
Fit review **PASS**; `IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES`; IMP-037 unresolved
`IMPLEMENTATION_IN_PROGRESS` / provider-blocked; `CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038`
(authority PR#179/5771367844). Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-038`;
`nextProductSlice = IMP-039`; `pendingAcceptance = NONE`; `IMP039_ACTIVATED: NO`;
`IMP038_ACCEPTED: NO`; `IMP038_IMPLEMENTATION_COMPLETE: NO` at that tip. Does **not** accept IMP-037 or IMP-038;
does **not** activate IMP-039; does **not** claim legal compliance. Under the senior-delivery
operating model, Cursor may merge routine conforming GREEN/AMBER IMP-038 implementation PRs after
CI green + self-review while locked PD/architecture invariants hold. Historical next gate at that tip
= continue locked IMP-038 implementation (tranches) — **not** acceptance. Superseded as CURRENT tip
by GTM-R141 (later superseded as CURRENT tip by GTM-R142).

**GTM-R139** persists IMP-038 Architecture Fit **PASS** and architecture **LOCKED** against
ARCH-R21 / D-375 / ADR-017 (capability
[`capabilities/IMP-038-security-privacy-hardening.md`](./capabilities/IMP-038-security-privacy-hardening.md)).
Preserves `CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038` (authority PR#179/5771367844)
and IMP-037 as unresolved `IMPLEMENTATION_IN_PROGRESS` / provider-blocked. Sets formal IMP-038
lifecycle to `ARCHITECTURE_LOCKED`; `IMP038_ARCHITECTURE_FIT: PASS`;
`IMP038_ARCHITECTURE_LOCKED: YES`; `INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS` (reviewed
technical candidate head `3b03164d6581c5a98a893c24e92eaddece004e90` / tree
`5bb499fa84a5bf02682b30518f2bf898ddb23540`; GitHub review `5279884548`);
`IMP038_IMPLEMENTATION_AUTHORIZED: NO`; `IMP038_STARTED: NO`; `IMP038_ACCEPTED: NO`;
`IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES`. Preserves `acceptedThrough = IMP-036G`;
`currentProductSlice = IMP-038`; `nextProductSlice = IMP-039`; `pendingAcceptance = NONE`;
`IMP038_ACTIVATED: YES`; Product Definition `PD-IMP-038-DRAFT-2` APPROVED / Gate PASS.
Records Fit-evaluated candidate HEAD `43007808849f093d84cbe710f32a728b41a9e5a2` / tree
`581fb23631df40044ec7b9c449545959a90b9998` / fingerprint
`ab00d1ab23f3c7d8b140feefcd1a0787f1fedf90ab08a9934c9a892a77c8184d`. Records
`D-375_CREATED: YES`; `ARCH_R21_CREATED: YES` (preserves `D-374_CREATED: YES`;
`ARCH_R20_CREATED: YES`). Review PASS is evidence reconciliation inside this architecture-lock
checkpoint; the review-status reconciliation commit is **not** the independently reviewed
technical candidate and is **not** the Fit-evaluated artifact
(`fit-evaluated artifact != independently reviewed technical candidate != review-status
reconciliation commit`). Does **not** authorize/start IMP-038 implementation; does **not**
accept IMP-037 or IMP-038; does **not** activate IMP-039; does **not** claim legal compliance.
Next gate = human R3 merge decision for architecture-lock PR #182 —
**not** implementation authorization.

**GTM-R138** activates a **NEW** Founder-authorized controlled continuation
`CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038` (authority PR#179/5771367844) while
IMP-037 remains unresolved. Sets `currentProductSlice = IMP-038` for active PD-1 Product
Definition work; `nextProductSlice = IMP-039`; preserves `acceptedThrough = IMP-036G`;
`pendingAcceptance = NONE` (IMP-037 is not yet `IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE`).
Preserves IMP-037 as `IMPLEMENTATION_IN_PROGRESS` (`IMP037_ACTIVATED: YES`;
`IMP037_IMPLEMENTATION_COMPLETE: NO`; `IMP037_ACCEPTED: NO`;
`IMP037_EXTERNAL_RECOVERY_PROOF: NOT_PERFORMED`; `IMP037_FOUNDER_UAT: NOT_PERFORMED`;
`PHASE1_BLOCK_STATUS: BLOCKED_PROVIDER_ACCESS`;
`PROVIDER_DEPENDENT_PROOF: DEFERRED_PENDING_PROVIDER_ACCESS`). Sets `IMP038_ACTIVATED: YES`;
formal IMP-038 lifecycle remains `PLANNED`; `IMP038_PRODUCT_DEFINITION: APPROVED`
(`PD-IMP-038-DRAFT-2`); `IMP038_PRODUCT_DEFINITION_GATE: PASS`;
`IMP038_ARCHITECTURE_FIT: NOT_PERFORMED`; `IMP038_ARCHITECTURE_LOCKED: NO`;
`IMP038_IMPLEMENTATION_AUTHORIZED: NO`; `IMP038_STARTED: NO`; `IMP038_ACCEPTED: NO`;
`IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES`. Does **not** reopen the historical IMP-026 → IMP-028
exception; does **not** accept IMP-037; does **not** advance `acceptedThrough`; does **not** pass
Architecture Fit; does **not** lock IMP-038 architecture; does **not**
authorize/start IMP-038 implementation; does **not** activate IMP-039. ARCH-R20 / DR-16 / PD-1 /
TEST-1 unchanged at that tip. Product Definition Gate PASS is recorded for `PD-IMP-038-DRAFT-2`
(approval PR#180/5773885848; Founder decisions PR#180/5773472988). Historical next gate at that tip
= Architecture Fit — **not** implementation authorization.

**GTM-R137** reconciles post-merge IMP-037 repository implementation provenance after PR #174
merged to `main` (`f77a54819f51ad5648dda8acb3a7c93345cd5d6c` / tree
`4ff19a31db947cafadf690cf6bf1b6d2f1de14ac`; independently reviewed head
`ae7328efe1add11a9a4299150251fe14c71b2730`; independent implementation review `5265354130`
PASS; post-merge exact-main CI `35587376968` SUCCESS). Formal IMP-037 ROADMAP lifecycle remains
`IMPLEMENTATION_IN_PROGRESS` (`IMP037_IMPLEMENTATION_AUTHORIZED: YES`; `IMP037_STARTED: YES`;
`IMP037_REPOSITORY_IMPLEMENTATION_MERGED: YES`; `IMP037_IMPLEMENTATION_COMPLETE: NO`;
`IMP037_ACCEPTED: NO`; `IMP037_EXTERNAL_RECOVERY_PROOF: NOT_PERFORMED`;
`IMP037_FOUNDER_UAT: NOT_PERFORMED`). Repository merge ≠ external recovery proof ≠
implementation complete ≠ acceptance. Current Product Implementation remains IMP-037.
Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-037`; `pendingAcceptance = NONE`;
`nextProductSlice = IMP-038`. Preserves `IMP037_ACTIVATED: YES`; `IMP037_PRODUCT_DEFINITION: APPROVED`;
`IMP037_PRODUCT_DEFINITION_VERSION: PD-IMP-037-DRAFT-1`; `IMP037_PRODUCT_DECISIONS: RESOLVED`;
`IMP037_PRODUCT_DECISION_COUNT: 7`; `IMP037_PRODUCT_DEFINITION_GATE: PASS`;
`IMP037_ARCHITECTURE_FIT: PASS`; `IMP037_ARCHITECTURE_LOCKED: YES`;
`INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS` (reviewed technical candidate head
`d74ca9a30096fb14bca80643b75aa19d33093dde` / tree `09c7e3bd6b7832944d07d527c149752ed3bbeb4d`;
review `5256273904`); Fit-evaluated candidate remains
`28e6dd15c48b8c19abbc7057c4dc7e0a7d7cc7ea` / tree `5792c963166e8589751d2ba8c8928728e2c83526` /
fingerprint `56fa9b5459fd8acceb2ccc3ab73c5d7d9583dbf4539b10a1ef75553dd5aff8ba`;
implementationAuthorizationEvidence: PR#171/5743814105; implementationStartEvidence:
PR#172/5744869269; `IMP037_FOUNDER_UAT_REQUIRED: YES`; `IMP038_ACTIVATED: NO`. ARCH-R20 and
DR-16 remain CURRENT (`D-374_CREATED: YES`; `ARCH_R20_CREATED: YES`). `D-375_CREATED: NO`;
`ARCH_R21_CREATED: NO`. Does **not** claim `IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE`,
acceptance, Founder UAT, RPO/RTO proof, Spaces/provider proof, systemd host install, or IMP-038
activation. Next gate is ChatGPT batch review of reconciliation + external-proof readiness, then
explicit R3 external recovery proof — **not** acceptance.

Implementation / review provenance for accepted IMP-036G remains distinct from this checkpoint:
accepted UAT product candidate `fbf690a67cda51bd6bbc1bad4a9d26f574c4286e` / tree
`84b6a502fcec646cb5a65f3257f19b85c64f49e1` (fingerprint
`9f472ce6e1ccaa2fe914006c846fb3018d668b718f569b6d0cb4fa64c3013f9b`; Founder authority;
decision date 2026-09-18). Acceptance exact-main CI `35366698302` SUCCESS. Implementation merge
`c35c9eab6a30ec6ce745cefd75c523181326f360` / tree `266fe3b07811f6942e76cac155d58ba07daabe56`;
reviewed candidate HEAD `7a013155a98529d4527e7b6c0358642e5cd9d806` / tree
`266fe3b07811f6942e76cac155d58ba07daabe56` (PR #159); implementation exact-main CI `35214215500`
SUCCESS (preserved as `IMP036G_IMPLEMENTATION_EXACT_MAIN_CI`).

IMP-036F remains `COMPLETE_AND_ACCEPTED`. Concise acceptance identity remains UAT candidate
`91d0b5e5e5815da6bf0bb325a3c6ab884dc06652` / tree `ab41fc7f2bf6d0a52c3ea6c2b69ed331ca9540cf`.

IMP-036E remains `COMPLETE_AND_ACCEPTED`. Concise acceptance identity remains UAT candidate
`05c534bac3d077f5ab89928495568bb63faf78df` / tree `55b28977ee9860c2c07cb25f751c9f48ef4a2aa6`.
Preferred Store Assortment read route:
`GET /api/operations/v1/outlets/{outletId}/assortment`.

IMP-036D remains `COMPLETE_AND_ACCEPTED`. Concise acceptance identity: UAT candidate HEAD
`a6ff612c65e0d58409017b2935e0da16cffa9530` / tree `6580497091525c3ddd892aa44aafd63ef1132d35`
(GTM-R108). Detailed candidate/failure/reconciliation evidence remains in
[`history/ROADMAP-GTM-R113-pre-compression.md`](./history/ROADMAP-GTM-R113-pre-compression.md) and
[`capabilities/IMP-036D-workforce-franchise-operations-v2.md`](./capabilities/IMP-036D-workforce-franchise-operations-v2.md).

## 3. Accepted Slices

| IMP | Capability | Lifecycle |
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

## 4. Current Product Slice

Under `PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**) and additional
sequencing authority **D-382**, the active product slice is **IMP-036J — Promotions, Coupons &
Offers** (`currentProductSlice = IMP-036J`; `pendingAcceptance = NONE`;
`IMP036J_ACTIVATED: YES`; formal lifecycle `ARCHITECTURE_LOCKED`; Product Definition
`PD-IMP-036J-DRAFT-6` is `APPROVED`; Product Definition Gate `PASS`; Experience Definition
`XD-IMP-036J-DRAFT-6` is `APPROVED`; Experience Gate `PASS`; Architecture Fit `PASS`
(source candidate `IMP-036J-FIT-CANDIDATE-9`; evaluated head
`052289471cfc2424879932e16fd88d6c16696de8`; prior Candidate 5 PASS review `5347761109` remains
history); architecture
`LOCKED`; next gate `IMPLEMENTATION_TRANCHE_1`; Design Readiness `PASS`;
Quality/Test Plan finalized; Measurement/Instrumentation Plan finalized;
Implementation Plan `PASS`; implementation `AUTHORIZED` / `NOT_STARTED`). IMP-036I — Scheduled
Fulfilment is `COMPLETE_AND_ACCEPTED` (`IMP036I_ACCEPTED: YES`; `IMP036I_FOUNDER_UAT: PASS`;
`IMP036I_FORMAL_ACCEPTANCE: ACCEPTED`; Product Definition `PD-IMP-036I-DRAFT-4` APPROVED; Gate
PASS; Architecture Fit PASS; architecture LOCKED). Accepted UAT runtime candidate remains
`44f4d7d84af07c3226da606476844d8f05454b28` / tree
`3ec8a7714c25e6066453b47b7d006ef127abddbb` (fingerprint
`85fe93db116bfe86b7f5ba4c266c829433d44401ffd03bdec536b5f61be9c27c`; Founder UAT 2026-09-27).
No numeric independent implementation review ID exists. `IMP036I_INDEPENDENT_TECHNICAL_ACCEPTANCE: PASS`.
Finding 001 is RESOLVED. Blocking findings at acceptance are NONE. Locked capability architecture
(latest accepted):
[`capabilities/IMP-036I-scheduled-fulfilment.md`](./capabilities/IMP-036I-scheduled-fulfilment.md)
(D-379 / ADR-019 / D-380 / ADR-020 / ARCH-R23 / ARCH-G29 / ARCH-G30; D-378 AMENDED). Per-IMP
Product Definition remains:
[`product/IMP-036I/product-definition.md`](./product/IMP-036I/product-definition.md).
`acceptedThrough` is IMP-036I. Current next product slice is IMP-036K — Revenue Recommendations (parallel Product/Experience definition only; D-383). IMP-037 — Backup, Restore & Migration Readiness remains the held unresolved predecessor (`IMP037_HOLD: YES`; not advanced by this acceptance).

IMP-036H — Customer Pickup / Takeaway remains `COMPLETE_AND_ACCEPTED` with architecture
`ARCHITECTURE_LOCKED` and implementation `AUTHORIZED` / `STARTED` / `COMPLETE`
(`IMP036H_ACTIVATED: YES`; `IMP036H_ARCHITECTURE_LOCKED: YES`;
`IMP036H_IMPLEMENTATION_AUTHORIZED: YES`; `IMP036H_STARTED: YES`;
`IMP036H_IMPLEMENTATION_COMPLETE: YES`; `IMP036H_ACCEPTED: YES`; `IMP036H_FOUNDER_UAT: PASS`;
`IMP036H_FORMAL_ACCEPTANCE: ACCEPTED`; Product Definition `PD-IMP-036H-DRAFT-1` APPROVED / Gate PASS /
Architecture Fit PASS). Accepted UAT runtime candidate remains `37bae964f964bddd317e4c290dc146097e4c8f57` / tree
`f52cd6279deb22c251062880087a2078fc7bce3b` (fingerprint `e49d860c721d2524b248738750530a416f8418d02d10b64e69531f8548fcfb79`; Founder UAT 2026-09-24).
Independent technical acceptance PASS bound to review id `5302239433`. Locked capability
architecture (latest accepted):
[`capabilities/IMP-036H-customer-pickup-takeaway.md`](./capabilities/IMP-036H-customer-pickup-takeaway.md)
(D-378 / ADR-018 / ARCH-R22 / ARCH-G28). Per-IMP Product Definition remains:
[`product/IMP-036H/product-definition.md`](./product/IMP-036H/product-definition.md).
Evidence candidate remains supporting evidence only (not acceptance authority):
[`product/IMP-036H/evidence-candidate.md`](./product/IMP-036H/evidence-candidate.md).
`acceptedThrough` is IMP-036I. Current next product slice is IMP-036K — Revenue Recommendations (parallel Product/Experience definition only; D-383). IMP-037 — Backup, Restore & Migration Readiness remains the held unresolved predecessor (`IMP037_HOLD: YES`; not advanced by IMP-036I acceptance).

Paused GTM infrastructure predecessors remain historically progressed and explicitly held:

- IMP-037 — Backup, Restore & Migration Readiness remains `IMPLEMENTATION_IN_PROGRESS`
  (`IMP037_HOLD: YES`; `IMP037_ACTIVATED: YES`; provider-blocked;
  `IMP037_IMPLEMENTATION_COMPLETE: NO`; `IMP037_ACCEPTED: NO`; Product Definition APPROVED /
  `PD-IMP-037-DRAFT-1`; Gate PASS; Architecture Fit PASS; architecture LOCKED).
  [`product/IMP-037/product-definition.md`](./product/IMP-037/product-definition.md);
  [`capabilities/IMP-037-backup-restore-migration-readiness.md`](./capabilities/IMP-037-backup-restore-migration-readiness.md).
- IMP-038 — Security & Privacy Hardening remains
  `IMPLEMENTATION_IN_PROGRESS (HOLD — IMPLEMENTATION_COMPLETE / NOT_ACCEPTED)`
  (`IMP038_HOLD: YES`; `IMP038_ACTIVATED: YES`; Product Definition APPROVED /
  `PD-IMP-038-DRAFT-2`; Gate PASS; Architecture Fit PASS; architecture LOCKED; implementation
  AUTHORIZED / STARTED; `IMP038_IMPLEMENTATION_COMPLETE: YES`; `IMP038_ACCEPTED: NO`;
  `IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES`;
  `IMP038_EXTERNAL_ASSESSMENT: DEFERRED_UNTIL_PRE_GTM_APPLICATION_SCOPE_STABILIZES`;
  frozen runtime `dc6b19e6…` / tree `c3aefb57…` / fingerprint `2800fe11…`;
  `GAP-EXT-ASSESS-001: NOT_CLOSED`). Historical
  `CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038` (PR#179/5771367844) is preserved.
  [`product/IMP-038/product-definition.md`](./product/IMP-038/product-definition.md);
  [`capabilities/IMP-038-security-privacy-hardening.md`](./capabilities/IMP-038-security-privacy-hardening.md).

IMP-036G — Administration Console V2 remains `COMPLETE_AND_ACCEPTED` with architecture
`ARCHITECTURE_LOCKED` and implementation `AUTHORIZED` / `STARTED` / `COMPLETE`
(`IMP036G_ARCHITECTURE_LOCKED: YES`; `IMP036G_IMPLEMENTATION_AUTHORIZED: YES`;
`IMP036G_STARTED: YES`; `IMP036G_IMPLEMENTATION_COMPLETE: YES`; `IMP036G_ACCEPTED: YES`;
`IMP036G_FOUNDER_UAT: PASS`; Product Definition `PD-IMP-036G-DRAFT-2` APPROVED / Gate PASS /
Architecture Fit PASS). Locked capability architecture (latest accepted):
[`capabilities/IMP-036G-administration-console-v2.md`](./capabilities/IMP-036G-administration-console-v2.md).
Supporting experience contract is historical after acceptance:
[`experience/enterprise-experience/IMP-036G-administration-console-v2.md`](./experience/enterprise-experience/IMP-036G-administration-console-v2.md).
Per-IMP Product Definition remains:
[`product/IMP-036G/product-definition.md`](./product/IMP-036G/product-definition.md).
Accepted UAT product candidate remains `fbf690a67cda51bd6bbc1bad4a9d26f574c4286e` / tree
`84b6a502fcec646cb5a65f3257f19b85c64f49e1`. ARCH-R22 / DR-20 are CURRENT
(`D-374_CREATED: YES`; `ARCH_R20_CREATED: YES`; `D-375_CREATED: YES`; `ARCH_R21_CREATED: YES`;
`D-377_CREATED: YES`; `D-378_CREATED: YES`; `ARCH_R22_CREATED: YES`).
`SCHEMA_CHANGE_REQUIRED: YES` remains the architecture conclusion recorded for IMP-036G;
`NEW_PERMISSION: NO`; `NEW_ROLE: NO`; `NEW_SCOPE_MODEL: NO` for that accepted slice.

Next product slice is IMP-036K — Revenue Recommendations (`PLANNED`;
`IMP036K_ACTIVATED: YES`; parallel Product/Experience definition only under D-383;
Product Definition `NOT_CREATED`; implementation `NOT_AUTHORIZED`). IMP-037 — Backup,
Restore & Migration Readiness remains `IMPLEMENTATION_IN_PROGRESS` and `IMP037_HOLD: YES`
(`BLOCKED_PROVIDER_ACCESS`; not unheld). IMP-039 — Production Infrastructure & Release
Pipeline and IMP-040 — Launch Validation & Cutover remain `PLANNED` / `NOT_ACTIVATED`
(`IMP039_ACTIVATED: NO`; `IMP040_ACTIVATED: NO`).

IMP-036F — Catalog, Menu, Pricing & Promotions Management remains `COMPLETE_AND_ACCEPTED` with
architecture `ARCHITECTURE_LOCKED` and implementation `AUTHORIZED` / `STARTED` / `COMPLETE`
(`IMP036F_ARCHITECTURE_LOCKED: YES`; `IMP036F_IMPLEMENTATION_AUTHORIZED: YES`;
`IMP036F_STARTED: YES`; `IMP036F_IMPLEMENTATION_COMPLETE: YES`; `IMP036F_ACCEPTED: YES`;
`IMP036F_FOUNDER_UAT: PASS`; Product Definition `PD-IMP-036F-DRAFT-1` APPROVED / Gate PASS /
Architecture Fit PASS). Locked capability architecture:
[`capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md`](./capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md).
Supporting experience contract is historical after acceptance:
[`experience/enterprise-experience/IMP-036F-catalog-menu-pricing-promotions.md`](./experience/enterprise-experience/IMP-036F-catalog-menu-pricing-promotions.md).
Per-IMP Product Definition remains:
[`product/IMP-036F/product-definition.md`](./product/IMP-036F/product-definition.md).
Accepted UAT product candidate remains `91d0b5e5e5815da6bf0bb325a3c6ab884dc06652` / tree
`ab41fc7f2bf6d0a52c3ea6c2b69ed331ca9540cf`.

IMP-036E — Store Operations Management remains `COMPLETE_AND_ACCEPTED` with architecture
`ARCHITECTURE_LOCKED` and implementation `AUTHORIZED` / `STARTED` / `COMPLETE`
(`IMP-036E_ARCHITECTURE_LOCKED: YES`; `IMP-036E_IMPLEMENTATION_AUTHORIZED: YES`;
`IMP-036E_STARTED: YES`; `IMP-036E_IMPLEMENTATION_COMPLETE: YES`; `IMP-036E_ACCEPTED: YES`;
`IMP-036E_FOUNDER_UAT: PASS`). Locked capability architecture:
[`capabilities/IMP-036E-store-operations-management.md`](./capabilities/IMP-036E-store-operations-management.md).
Supporting experience contract is historical after acceptance:
[`experience/enterprise-experience/IMP-036E-store-operations-management.md`](./experience/enterprise-experience/IMP-036E-store-operations-management.md).
Founder Option A locks Assortment as Brand authority (`IMP036E_ASSORTMENT_AUTHORITY: BRAND`).
Serviceability remains `OUTLET_DISTANCE_SERVICEABILITY_V1`
(`SERVICEABILITY_COORDINATE_AUTHORITY: YES`; `SERVICEABILITY_POSTAL_PIN_RUNTIME_AUTHORITY: NO`;
`SERVICEABILITY_MAP_IS_PROJECTION_ONLY: YES`;
`IMP036E_SERVICEABILITY_ROUTING_PRIORITY_UI: HIDDEN_PREREQUISITE`). Global session capability
booleans are coarse navigation only (`IMP036E_GLOBAL_SESSION_CAPS_ARE_RESOURCE_AUTHORITY: NO`;
`IMP036E_GLOBAL_SESSION_CAPS_PURPOSE: COARSE_NAVIGATION_ONLY`;
`IMP036E_RESOURCE_SCOPED_CONTROL_VISIBILITY: REQUIRED`;
`IMP036E_SERVER_AUTHORIZATION_REMAINS_AUTHORITATIVE: YES`).

IMP-036D — Workforce & Franchise Operations Portal V2 remains `COMPLETE_AND_ACCEPTED`
(`IMP-036D_ACCEPTED: YES`; `IMP-036D_FOUNDER_UAT: PASS`). Locked capability architecture:
[`capabilities/IMP-036D-workforce-franchise-operations-v2.md`](./capabilities/IMP-036D-workforce-franchise-operations-v2.md).
Historical acceptance evidence remains in the pre-compression ROADMAP snapshot.


## 5. Future GTM Slices

Remaining numeric GTM range IMP-037 → IMP-040: **4** IMP numbers. Enterprise Experience suffix
slices IMP-036A–I are accepted. Founder-authorized pre-GTM product suffix slices IMP-036H
(COMPLETE_AND_ACCEPTED), IMP-036I (COMPLETE_AND_ACCEPTED), and IMP-036J (ARCHITECTURE_LOCKED; Product
Definition `PD-IMP-036J-DRAFT-6` `APPROVED`; Product Definition Gate `PASS`; Experience Definition
`XD-IMP-036J-DRAFT-6` `APPROVED`; Experience Gate `PASS`; Architecture Fit `PASS`; architecture
`LOCKED`; next gate `IMPLEMENTATION_TRANCHE_1`; Design Readiness `PASS`; Quality/Test Plan
finalized; Measurement/Instrumentation Plan finalized; Implementation Plan `PASS`; implementation
`AUTHORIZED` / `NOT_STARTED` under D-382, amended by D-383 only for Revenue Recommendations
identity, activation, and sequencing) and IMP-036K (PLANNED; parallel Product Definition and
Experience Definition preparation only under D-383; Product Definition `NOT_CREATED`;
implementation `NOT_AUTHORIZED` / `NOT_STARTED`) are inserted after IMP-036G. IMP-036K precedes
held IMP-037. The insertion does not consume or rename existing numeric identities. Deals and
Campaigns remain parked discovery and have no ledger identity. Revenue Recommendations has
formal ledger identity IMP-036K. Accepted inserted
slices IMP-026C and IMP-028A–D remain in the accepted ledger and are not future identities.
Historical Food Direct insertion narration remains in
[`history/ROADMAP-GTM-R113-pre-compression.md`](./history/ROADMAP-GTM-R113-pre-compression.md).

| IMP | Capability | Lifecycle |
|---|---|---|
| IMP-036A | Multi-Portal Experience Foundation | COMPLETE_AND_ACCEPTED |
| IMP-036B | Customer Account, Onboarding, Address & Location Experience | COMPLETE_AND_ACCEPTED |
| IMP-036C | Customer Commerce Experience V2 | COMPLETE_AND_ACCEPTED |
| IMP-036D | Workforce & Franchise Operations Portal V2 | COMPLETE_AND_ACCEPTED |
| IMP-036E | Store Operations Management | COMPLETE_AND_ACCEPTED |
| IMP-036F | Catalog, Menu, Pricing & Promotions Management | COMPLETE_AND_ACCEPTED |
| IMP-036G | Administration Console V2 | COMPLETE_AND_ACCEPTED |
| IMP-036H | Customer Pickup / Takeaway | COMPLETE_AND_ACCEPTED |
| IMP-036I | Scheduled Fulfilment | COMPLETE_AND_ACCEPTED (IMP036I_ACTIVATED: YES; APPROVED; Gate PASS; Fit PASS; locked YES; implementation AUTHORIZED / STARTED / COMPLETE; IMP036I_IMPLEMENTATION_COMPLETE: YES; IMP036I_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS; IMP036I_ACCEPTED: YES; IMP036I_FOUNDER_UAT: PASS; IMP036I_FORMAL_ACCEPTANCE: ACCEPTED) |
| IMP-036J | Promotions, Coupons & Offers | ARCHITECTURE_LOCKED (IMP036J_ACTIVATED: YES; PRODUCT_DEFINITION APPROVED; PD-IMP-036J-DRAFT-6; Gate PASS; Experience X3; EXPERIENCE_DEFINITION APPROVED; XD-IMP-036J-DRAFT-6; Experience Gate PASS; Fit PASS; locked YES; nextGate IMPLEMENTATION_TRANCHE_1; Design Readiness PASS; Quality/Test Plan finalized; Measurement/Instrumentation Plan finalized; Implementation Plan PASS; implementation AUTHORIZED / STARTED; formal lifecycle IMPLEMENTATION_IN_PROGRESS; IMP036J_IMPLEMENTATION_AUTHORIZED: YES; IMP036J_IMPLEMENTATION_STARTED: YES; IMP036J_TRANCHE_1: IN_REVIEW; IMP036J_ACCEPTED: NO) |
| IMP-036K | Revenue Recommendations | PLANNED (IMP036K_ACTIVATED: YES; formal identity D-383; parallel Product/Experience definition preparation only; PRODUCT_DEFINITION NOT_CREATED; PRODUCT_DEFINITION_GATE NOT_PERFORMED; EXPERIENCE_CRITICALITY X3; CHANGE_RISK CR2; EXPERIENCE_DEFINITION NOT_CREATED; EXPERIENCE_GATE NOT_PERFORMED; ARCHITECTURE_FIT NOT_PERFORMED; ARCHITECTURE_LOCKED NO; DESIGN_READINESS NOT_PERFORMED; IMPLEMENTATION_PLAN NOT_PERFORMED; implementation NOT_AUTHORIZED / NOT_STARTED; IMP036K_ACCEPTED: NO) |
| IMP-037 | Backup, Restore & Migration Readiness | IMPLEMENTATION_IN_PROGRESS (IMP037_HOLD: YES; BLOCKED_PROVIDER_ACCESS) |
| IMP-038 | Security & Privacy Hardening | IMPLEMENTATION_IN_PROGRESS (IMP038_HOLD: YES; IMPLEMENTATION_COMPLETE / NOT_ACCEPTED; external assessment deferred) |
| IMP-039 | Production Infrastructure & Release Pipeline | PLANNED |
| IMP-040 | Launch Validation & Cutover | PLANNED |

### 5.0E Enterprise Experience Programme — IMP-036A → IMP-036G

The [Enterprise Experience Programme](./experience/enterprise-experience/README.md) defines supporting
UX/workflow contracts (not locked capability architecture). Accepted Enterprise Experience order
remains IMP-036A → B → C → D → E → F → G. Founder-authorized pre-GTM product insertions continue
IMP-036G → IMP-036H → IMP-036I (COMPLETE_AND_ACCEPTED; APPROVED / Gate PASS / Architecture Fit PASS) → IMP-036J (ARCHITECTURE_LOCKED; Product Definition APPROVED; Gate PASS; Experience Definition APPROVED; Experience Gate PASS; next gate IMPLEMENTATION_TRANCHE_1; Architecture Fit PASS; architecture LOCKED; Design Readiness PASS; Implementation Plan PASS; implementation AUTHORIZED / STARTED; formal lifecycle IMPLEMENTATION_IN_PROGRESS; Tranche 1 IN_REVIEW; D-382, amended by D-383 only for Revenue Recommendations identity, activation, and sequencing) → IMP-036K (PLANNED; parallel Product/Experience definition preparation only; D-383; implementation NOT_AUTHORIZED) → IMP-037 (held; not advanced) without reopening accepted EE slices.

```text
FIGMA_REQUIRED_FOR_INITIAL_IMPLEMENTATION: NO
IMP-036A → IMP-036I: COMPLETE_AND_ACCEPTED
IMP-036I: COMPLETE_AND_ACCEPTED (IMP036I_ACTIVATED: YES; APPROVED; Gate PASS; Fit PASS; implementation AUTHORIZED / STARTED / COMPLETE; IMP036I_IMPLEMENTATION_COMPLETE: YES; IMP036I_ACCEPTED: YES; IMP036I_FOUNDER_UAT: PASS)
IMP-036J: ARCHITECTURE_LOCKED (IMP036J_ACTIVATED: YES; PRODUCT_DEFINITION APPROVED; Gate PASS; Experience Definition APPROVED; Experience Gate PASS; Fit PASS; architecture LOCKED; nextGate IMPLEMENTATION_TRANCHE_1; Design Readiness PASS; Implementation Plan PASS; IMP036J_IMPLEMENTATION_AUTHORIZED: YES; IMP036J_IMPLEMENTATION_STARTED: YES; formal lifecycle IMPLEMENTATION_IN_PROGRESS; IMP036J_TRANCHE_1: IN_REVIEW; IMP036J_ACCEPTED: NO; currentProductSlice IMP-036J)
IMP-036K: PLANNED (IMP036K_ACTIVATED: YES; parallel Product/Experience definition preparation only; D-383; PRODUCT_DEFINITION NOT_CREATED; EXPERIENCE_DEFINITION NOT_CREATED; ARCHITECTURE_FIT NOT_PERFORMED; IMP036K_IMPLEMENTATION_AUTHORIZED: NO; IMP036K_ACCEPTED: NO; nextProductSlice IMP-036K)
IMP-037: IMPLEMENTATION_IN_PROGRESS (IMP037_HOLD: YES; IMP037_ACTIVATED: YES; provider-blocked)
IMP-038: IMPLEMENTATION_IN_PROGRESS (IMP038_HOLD: YES; IMP038_ACTIVATED: YES; IMPLEMENTATION_COMPLETE / NOT_ACCEPTED; external assessment deferred)
IMP-039: PLANNED / NOT_ACTIVATED (IMP039_ACTIVATED: NO)
IMP-040: PLANNED / NOT_ACTIVATED (IMP040_ACTIVATED: NO)
PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED (D-377)
FOUNDER_UAT_REQUIRED: YES for each Enterprise Experience slice; YES for IMP-036H; YES for IMP-036I
```

Programme contracts for remaining planned slices are historical after IMP-036G acceptance (see
[`experience/enterprise-experience/`](./experience/enterprise-experience/)).

## 6. Deferred / Unscheduled Capabilities

Status: `DEFERRED_UNSCHEDULED` — no IMP number assigned.

- Customer self-service cancellation
- Quantitative Inventory Reservation
- Detailed Kitchen Fulfilment
- Loyalty / Rewards
- Multi-provider Payments
- International Payments
- EMI
- BNPL
- COD

Future possibility does not authorize present implementation.
## 7. GTM Boundary

```text
Public GTM boundary = IMP-040 — Launch Validation & Cutover
```

Vision outcome definition remains in [`VISION.md`](./VISION.md). This roadmap is the only document
that maps that outcome onto the current numbered GTM boundary.

Strategic channel model (does not change VISION-1): Zomato / Swiggy = acquisition + convenience +
volume; BOBA Direct = owned relationship + retention + brand + direct-order economics. Primary
commercial objective for BOBA Direct: profitable repeat direct orders. GTM commercial-control
measurement and controlled-pilot governance remain planning requirements only — not authorization to
implement analytics infrastructure now. Detailed GTM measurement / pilot prose remains in
[`history/ROADMAP-GTM-R113-pre-compression.md`](./history/ROADMAP-GTM-R113-pre-compression.md).

## 8. Historical Roadmap Notice

[`implementation-roadmap.md`](./implementation-roadmap.md) is **SUPERSEDED** historical roadmap
version **GTM-R1**. It must not be used for current implementation sequencing.

Historical GTM-R1 meanings that are **not** current:

| Historical GTM-R1 ID | Historical meaning (do not use) | Current GTM-R2/R3 meaning |
|---|---|---|
| IMP-021 | Cashfree payment adapter | Checkout |
| IMP-022 | Payment webhooks and verification | Payment |
| IMP-023 | Refund foundation | Order |
| IMP-024 | Order lifecycle and Operations Console API | Customer Ordering Transport / API |
| IMP-035 | Launch validation and cutover | Initial Administration Capabilities |

Current public GTM boundary is **IMP-040**, not IMP-035.

## 9. Roadmap Change Log

Historical revision evidence for GTM-R1…GTM-R113 is preserved byte-for-byte in
[`history/ROADMAP-GTM-R113-pre-compression.md`](./history/ROADMAP-GTM-R113-pre-compression.md).

### GTM-R162 — 2026-09-27

- Formal acceptance of IMP-036I — Scheduled Fulfilment after Founder UAT PASS.
- Accepted UAT runtime candidate remains `44f4d7d84af07c3226da606476844d8f05454b28` / tree
  `3ec8a7714c25e6066453b47b7d006ef127abddbb` (fingerprint
  `85fe93db116bfe86b7f5ba4c266c829433d44401ffd03bdec536b5f61be9c27c`). Governance reconciliation is not a new product
  candidate and does **not** claim Founder tested the governance-only merge commit.
- Advances `acceptedThrough = IMP-036I`; sets `currentProductSlice = NONE` and
  `pendingAcceptance = NONE`; preserves `nextProductSlice = IMP-037`.
- Records `IMP-036I: COMPLETE_AND_ACCEPTED`; `IMP036I_ACCEPTED: YES`; `IMP036I_FOUNDER_UAT: PASS`;
  `IMP036I_FORMAL_ACCEPTANCE: ACCEPTED`; `IMP036I_IMPLEMENTATION_COMPLETE: YES`;
  `IMP036I_INDEPENDENT_TECHNICAL_ACCEPTANCE: PASS`. No numeric independent implementation
  review ID is recorded. Independent implementation review of the earlier implementation
  candidate remains PASS against reviewed main `335e8b55c74b81d745e923b3d078d6af9ec0b5cc`;
  that review candidate is not rewritten as the accepted UAT candidate. Independent
  technical acceptance of accepted candidate `44f4d7d84af07c3226da606476844d8f05454b28`
  is the main merge after independently reviewed remediation PRs #287, #288, and #290
  (PR #289 persisted D-381). No new numeric review ID is created for that acceptance.
- Founder UAT check marks: configuration / finding_001_recovery / pickup_asap /
  pickup_scheduled / delivery_scheduled / operations_visibility / derived_timing_cues /
  pickup_boundary / delivery_manual_dispatch / commercial_recovery = PASS;
  delivery_asap_fresh / customer_cancel_manual / mobile_final_spotcheck =
  NOT_REEXECUTED; overall PASS_BY_FOUNDER; findings NONE BLOCKING. Finding 001 RESOLVED.
- Preserves Product Definition `PD-IMP-036I-DRAFT-4` (Gate PASS; Architecture Fit PASS) and
  tranche evidence T1–T5 PASS, including post-implementation remediation PRs #287, #288,
  #289, and #290.
- Preserves ARCH-R23 / DR-22 / D-379 CURRENT / D-380 CURRENT / D-378 AMENDED / D-381 CURRENT /
  ADR-019 Accepted / ADR-020 Accepted — no new D-number; no ARCH revision.
- Preserves `PROGRAM_PAUSE` / D-377; IMP-037 / IMP-038 HOLD (including frozen IMP-038 runtime
  evidence). Does **not** unhold or accept IMP-037, accept IMP-038, activate IMP-039 / IMP-040,
  or close `GAP-EXT-ASSESS-001`.
- Supersedes GTM-R161.

### GTM-R161 — 2026-09-26

- Record IMP-036I `IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE` after integrated Tranche 5
  independent verification PASS against reviewed main
  `335e8b55c74b81d745e923b3d078d6af9ec0b5cc` / tree
  `4b75582d1726e552bdc1e45da15cf667b05de8e0` / fingerprint
  `5d79b21381f190682d3cb3f0a2f7e99d43919476f5384c3e1d74d3904218409b`.
- `IMP036I_IMPLEMENTATION_COMPLETE: YES`. `IMP036I_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS`.
  No numeric independent-review ID is recorded. `IMP036I_ACCEPTED: NO`.
  `FOUNDER_UAT: NOT_PERFORMED`. `pendingAcceptance` = IMP-036I. `acceptedThrough` remains
  IMP-036H. Next action = FOUNDER_UAT.
- Tranche 5 implementation merge `d50cd50971c39a623f6653d2e98353aae88eade9`. Financial-document
  remediation merge / reviewed main `335e8b55c74b81d745e923b3d078d6af9ec0b5cc`. Exact-head
  remediation CI `36238210541` PASS. Exact-head CodeQL `36238210619` PASS. Post-merge main
  CI `36238620688` PASS. Post-merge CodeQL `36238620716` PASS. Executable proof
  `tests/database/scheduled-financial-document-continuity.integration.test.ts`
  (`npm run test:imp036i:tranche5`).
- Does not accept IMP-036I, perform Founder UAT, advance `acceptedThrough`, start IMP-037,
  or change architecture or decisions. No new D-number, ADR, or ARCH revision.

### GTM-R160 — 2026-09-26

- Record IMP-036I Tranche 5 integration proof and purchase-authority hardening after
  independent Tranche 4 verification PASS against reviewed implementation
  `c71047a17630ccb35afe7d49b18a234ce9fc6039` / tree
  `cd06ddd4f87abfee15df25c07c052c2a5265f5f6`. No numeric independent review ID is recorded.
- Formal lifecycle remains `IMPLEMENTATION_IN_PROGRESS`. Implementation remains incomplete
  and unaccepted. `acceptedThrough` remains IMP-036H. Founder UAT remains NOT_PERFORMED.
- Next action = INDEPENDENT_TRANCHE_5_VERIFICATION. Do not mark Tranche 5 independently
  PASS or set `IMP036I_IMPLEMENTATION_COMPLETE: YES` in this record. No new D-number, ADR,
  or ARCH revision.

### GTM-R159 — 2026-09-26

- Record IMP-036I Tranche 4 purchased cancellation enforcement and scheduled fulfilment
  reminder after independent Tranche 3 verification PASS against main
  `9b1c73b39f6d709e3e8f9adf7c772564285234e7` / tree
  `adea96bff22f54c6aa57d68721d658cfc24e5d73`.
- Formal lifecycle remains `IMPLEMENTATION_IN_PROGRESS`. Implementation remains incomplete
  and unaccepted. `acceptedThrough` remains IMP-036H. Founder UAT remains NOT_PERFORMED.
- Next action = INDEPENDENT_TRANCHE_4_VERIFICATION. Do not start Tranche 5 until that
  verification passes. Tranche 5 hardening remains open. No new D-number, ADR, or ARCH revision.

### GTM-R158 — 2026-09-25

- Record IMP-036I Tranche 3 customer, operations, and configuration surfaces after independent
  Tranche 2 verification PASS against main `557db375545c5f0853ec894919fd1e0d6f696770` / tree
  `35b19c62c080c9c1b432b0dea8937c717d015b72`.
- Formal lifecycle remains `IMPLEMENTATION_IN_PROGRESS`. Implementation remains incomplete
  and unaccepted. `acceptedThrough` remains IMP-036H. Founder UAT remains NOT_PERFORMED.
- Next action = INDEPENDENT_TRANCHE_3_VERIFICATION. Do not start Tranche 4 until that
  verification passes. Proactive reminder runtime remains Tranche 4. No new D-number, ADR,
  or ARCH revision.

### GTM-R157 — 2026-09-25

- Record IMP-036I Tranche 2 scheduling eligibility and payment bind after independent Tranche 1
  verification PASS against main `d45c8c586652160bfc8793f5fa16c274d402411a` / tree
  `a1cfa5cfe6e82974ef1d5daf9d4d2bc851f5bc67`.
- Formal lifecycle remains `IMPLEMENTATION_IN_PROGRESS`. Implementation remains incomplete
  and unaccepted. `acceptedThrough` remains IMP-036H. Founder UAT remains NOT_PERFORMED.
- Next action = INDEPENDENT_TRANCHE_2_VERIFICATION. Do not start Tranche 3 until that
  verification passes. No new D-number, ADR, or ARCH revision.

### GTM-R155 — 2026-09-25

- Persist explicit human IMP-036I implementation authorization (2026-09-25) after Architecture
  Fit PASS review `5312653831` and architecture-lock persistence verification `5313026804`.
- Formal lifecycle remains `ARCHITECTURE_LOCKED`. `IMP036I_IMPLEMENTATION_AUTHORIZED: YES`;
  `IMP036I_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`; `IMP036I_ACCEPTED: NO`.
- Execution plan: [`product/IMP-036I/implementation-plan.md`](./product/IMP-036I/implementation-plan.md).
- Does not start runtime implementation, create migrations, accept IMP-036I, or perform Founder UAT.
- Next action = IMPLEMENTATION_TRANCHE_1. No new D-number, ADR, or ARCH revision.

### GTM-R154 — 2026-09-25

- Persist IMP-036I Architecture Fit PASS and architecture lock.
- Independent Architecture Fit review `5312653831` = PASS (evaluated HEAD
  `42e854b931e216fadc64b479371cebca4c38d17e` / tree
  `279e0e1b0e8f52c96cfd12fc89b329f73281e38f` / fingerprint
  `b65f40b9e568a6d0188f1d031f41db3a072cb3b4683d2d966c2a994283575068`).
- Human lock approval 2026-09-25. D-379 CURRENT. D-380 CURRENT. ADR-019 Accepted.
  ADR-020 Accepted. D-378 AMENDED only for ASAP-only / no-scheduled-schema clauses.
  ARCH-R23 / ARCH-G29 / ARCH-G30. Decision register DR-21.
- Formal lifecycle `ARCHITECTURE_LOCKED`. Implementation remains NOT_AUTHORIZED / NOT_STARTED.
- Does not accept IMP-036I or authorize runtime/schema/migration work.
- Next action = IMPLEMENTATION_AUTHORIZATION.

### GTM-R153 — 2026-09-24

- Persist independently executed Product Definition Gate PASS for IMP-036I candidate
  `PD-IMP-036I-DRAFT-4` (`IMP036I_PRODUCT_DEFINITION: APPROVED`;
  `IMP036I_PRODUCT_DEFINITION_GATE: PASS`).
- Gate-evaluated candidate HEAD `1c4be04b6d6b51bdedebfea0485099dede3c7923` / tree
  `a0774c9b2cb256f8d329fc49cea1c9859a39d1d7` / fingerprint
  `07720d20f1e285ef46e6bd3be6d710be383baacde4facab7651482547b6dc15d`; independent gate
  evidence review `5307761142` — Gate Result PASS. Post-gate persistence commit is not the
  evaluated artifact.
- Preserves historical DRAFT-1 / DRAFT-2 / DRAFT-3 Gate STOP evidence (reviews `5305796113`,
  `5306341697`, `5306868578`) — not erased.
- Preserves `acceptedThrough = IMP-036H`; `currentProductSlice = IMP-036I`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`; `gtmBoundary = IMP-040`.
- Preserves `PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**) and
  IMP-037/038 HOLD / freeze markers (including IMP-038 frozen runtime evidence).
- Preserves `IMP036I_ACTIVATED: YES` while formal IMP-036I ROADMAP lifecycle remains `PLANNED`
  (`IMP036I_ARCHITECTURE_FIT: NOT_PERFORMED`; `IMP036I_ARCHITECTURE_LOCKED: NO`;
  `IMP036I_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036I_STARTED: NO`;
  `IMP036I_IMPLEMENTATION_STARTED: NO`; `IMP036I_IMPLEMENTATION_COMPLETE: NO`;
  `IMP036I_ACCEPTED: NO`).
- Does **not** perform Architecture Fit, lock architecture, authorize/start implementation,
  accept IMP-036I, activate IMP-039 / IMP-040, accept IMP-037/038, or close
  `GAP-EXT-ASSESS-001`. Next phase = Architecture Fit (separate auth).
- ARCH-R22 / DR-20 / PD-1 / TEST-1 / VISION-1 unchanged — no new D-number; no ARCH revision.
- Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_GATE_PASS`.
- Supersedes GTM-R152.

### GTM-R152 — 2026-09-24

- Product Definition Gate STOP remediation: creates CURRENT candidate `PD-IMP-036I-DRAFT-4`
  (`DRAFT_READY_FOR_GATE`; `READY_FOR_PRODUCT_DEFINITION_GATE: YES`; open/unresolved = 0) after
  DRAFT-3 Gate STOP (review `5306868578`). No Founder product-semantic change; FD-036I-09
  sealing / checkout revalidation remains complete. Restores STATE-R148→DRAFT-2 provenance,
  product-index CURRENT pointer, paired CURRENT tip anchors, independent visible version
  authorities, and bounded Gate STOP history validation.
- Preserves historical DRAFT-1 Gate STOP (review `5305796113`), DRAFT-2 Gate STOP
  (review `5306341697`), and DRAFT-3 Gate STOP (review `5306868578`) — not overwritten as
  NOT_PERFORMED.
- CURRENT DRAFT-4 Gate / Fit / lock / implementation remain NOT performed.
- Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_DRAFT_READY`.
- Preserves `acceptedThrough = IMP-036H`; `currentProductSlice = IMP-036I`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`; `PROGRAM_PAUSE` / D-377;
  ARCH-R22 / DR-20 / D-378 unchanged — no new D-number; no ARCH revision.
- Does **not** accept IMP-036I / IMP-037/038 or close `GAP-EXT-ASSESS-001`.
- Next gate = Independent Product Definition Gate review of exact DRAFT-4 merged candidate
  (NOT performed here).
- Supersedes GTM-R151.

### GTM-R151 — 2026-09-24

- Product Definition Gate STOP remediation: creates CURRENT candidate `PD-IMP-036I-DRAFT-3`
  (`DRAFT_READY_FOR_GATE`; `READY_FOR_PRODUCT_DEFINITION_GATE: YES`; open/unresolved = 0) after
  DRAFT-2 Gate STOP (review `5306341697`). Persists Founder FD-036I-09 sealing amendment
  (per-Order sealed cutoff from payment-bound Checkout Snapshot; later Brand changes affect
  future purchases only; stale checkout revalidation/reconfirm before payment binding).
- Preserves historical DRAFT-1 Gate STOP (review `5305796113`) and DRAFT-2 Gate STOP
  (review `5306341697`) — not overwritten as NOT_PERFORMED.
- CURRENT DRAFT-3 Gate / Fit / lock / implementation remain NOT performed at this tip.
- Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_DRAFT_READY`.
- Preserves `acceptedThrough = IMP-036H`; `currentProductSlice = IMP-036I`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`; `PROGRAM_PAUSE` / D-377;
  ARCH-R22 / DR-20 / D-378 unchanged — no new D-number; no ARCH revision.
- Does **not** accept IMP-036I / IMP-037/038 or close `GAP-EXT-ASSESS-001`.
- Independent Product Definition Gate for DRAFT-3 later STOPPED (review `5306868578`) —
  remediated under GTM-R152; this tip did not claim Gate PASS.
- Supersedes GTM-R150.

### GTM-R150 — 2026-09-24

- Product Definition Gate STOP remediation: creates CURRENT candidate `PD-IMP-036I-DRAFT-2`
  (`DRAFT_READY_FOR_GATE`; `READY_FOR_PRODUCT_DEFINITION_GATE: YES`; open/unresolved = 0) after
  DRAFT-1 Gate STOP (review `5305796113`). Persists Founder FD-036I-09 amendment (Pickup 30 /
  Delivery 60; Brand-level; 0–240; no Outlet override; no fee).
- Preserves historical DRAFT-1 Gate execution PERFORMED / STOP (not overwritten as NOT_PERFORMED).
- CURRENT DRAFT-2 Gate / Fit / lock / implementation remain NOT performed.
- Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_DRAFT_READY`.
- Preserves `acceptedThrough = IMP-036H`; `currentProductSlice = IMP-036I`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`; `PROGRAM_PAUSE` / D-377;
  ARCH-R22 / DR-20 / D-378 unchanged — no new D-number; no ARCH revision.
- Does **not** accept IMP-036I / IMP-037/038 or close `GAP-EXT-ASSESS-001`.
- Independent Product Definition Gate for DRAFT-2 later STOPPED (review `5306341697`) —
  remediated under GTM-R151; this tip did not claim Gate PASS.
- Supersedes GTM-R149.

### GTM-R149 — 2026-09-24

- Founder-approved resolution of FD-036I-01…15; advances IMP-036I Product Definition from
  `PRE_GATE_DRAFT` to `DRAFT_READY_FOR_GATE` (`PD-IMP-036I-DRAFT-1`;
  `READY_FOR_PRODUCT_DEFINITION_GATE: YES`; open/unresolved Founder decisions = 0).
- Semantic checkpoint: `IMP036I_PRODUCT_DEFINITION_DRAFT_READY`.
- Preserves `acceptedThrough = IMP-036H`; `currentProductSlice = IMP-036I`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`; `PROGRAM_PAUSE` / D-377;
  ARCH-R22 / DR-20 / D-378 unchanged — no new D-number; no ARCH revision.
- Gate / Fit / lock / implementation remain NOT performed at this tip; does **not** accept IMP-036I /
  IMP-037/038 or close `GAP-EXT-ASSESS-001`.
- Independent Product Definition Gate for DRAFT-1 later STOPPED (review `5305796113`) — remediated
  under GTM-R150; this tip did not claim Gate PASS.
- Supersedes GTM-R148.

### GTM-R148 — 2026-09-24

- Founder-authorized activation of **IMP-036I — Scheduled Fulfilment** for Product Definition only
  (`IMP036I_ACTIVATED: YES`; formal lifecycle remains `PLANNED`;
  `IMP036I_PRODUCT_DEFINITION: PRE_GATE_DRAFT` / `PD-IMP-036I-DRAFT-1`).
- Sets `currentProductSlice = IMP-036I`; `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`
  (ledger successor; IMP-037/038 remain HOLD).
- Preserves `acceptedThrough = IMP-036H`; `PROGRAM_PAUSE` / D-377; ARCH-R22 / DR-20 / D-378
  unchanged — no new D-number; no ARCH revision.
- Does **not** perform Product Definition Gate, Architecture Fit, architecture lock,
  implementation authorization, or implementation start for IMP-036I.
- Does **not** activate IMP-039 / IMP-040, accept IMP-037/038, or close `GAP-EXT-ASSESS-001`.
- Supersedes GTM-R147.

### GTM-R147 — 2026-09-24

- Formal acceptance of IMP-036H — Customer Pickup / Takeaway after Founder UAT PASS.
- Accepted UAT runtime candidate remains `37bae964f964bddd317e4c290dc146097e4c8f57` / tree
  `f52cd6279deb22c251062880087a2078fc7bce3b` (fingerprint
  `e49d860c721d2524b248738750530a416f8418d02d10b64e69531f8548fcfb79`). Governance reconciliation is not a new product
  candidate and does **not** claim Founder tested the governance-only merge commit.
- Advances `acceptedThrough = IMP-036H`; sets `currentProductSlice = NONE` and
  `pendingAcceptance = NONE`; preserves `nextProductSlice = IMP-036I`.
- Records `IMP-036H: COMPLETE_AND_ACCEPTED`; `IMP036H_ACCEPTED: YES`; `IMP036H_FOUNDER_UAT: PASS`;
  `IMP036H_FORMAL_ACCEPTANCE: ACCEPTED`; `IMP036H_IMPLEMENTATION_COMPLETE: YES`;
  `IMP036H_INDEPENDENT_TECHNICAL_ACCEPTANCE: PASS` (review id `5302239433`);
  `IMP036H_AUTOMATED_ACCEPTANCE: 42/42 PASS`.
- Founder UAT check marks: pickup_profile / customer_pickup / payment / operations_handover /
  customer_order_history / mode_switching / unavailable_state / mobile = PASS; overall PASS;
  findings NONE BLOCKING.
- Preserves Product Definition `PD-IMP-036H-DRAFT-1` (Gate PASS; Architecture Fit PASS).
- Preserves ARCH-R22 / DR-20 / D-378 CURRENT / ADR-018 Accepted / ARCH-G28 — no new D-number; no
  ARCH revision.
- Preserves `PROGRAM_PAUSE` / D-377; IMP-037/038 HOLD (including frozen IMP-038 runtime evidence);
  IMP-036I / IMP-039 / IMP-040 NOT_ACTIVATED.
- Does **not** activate IMP-036I / IMP-039 / IMP-040, accept IMP-037/038, or close
  `GAP-EXT-ASSESS-001`.
- Supersedes GTM-R146.

### GTM-R146 — 2026-09-24

- Persist IMP-036H implementation **COMPLETE** pending acceptance
  (`IMP036H_IMPLEMENTATION_COMPLETE` semantic checkpoint).
- Advances formal ROADMAP lifecycle to `IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE`
  (`IMP036H_IMPLEMENTATION_AUTHORIZED: YES`; `IMP036H_STARTED: YES`;
  `IMP036H_IMPLEMENTATION_STARTED: YES`; `IMP036H_IMPLEMENTATION_COMPLETE: YES`;
  `IMP-036H_IMPLEMENTATION_COMPLETE: YES`; `IMP036H_ACCEPTED: NO`; `IMP036H_FOUNDER_UAT: NOT_PERFORMED`;
  `IMP036H_FORMAL_ACCEPTANCE: NOT_PERFORMED`; `pendingAcceptance = IMP-036H`).
- Records independent implementation review PASS (`5302239433`) against exact reviewed candidate
  HEAD `649b7848f99918f927da4a77e98cd81cdc146e6b` / tree
  `b272adf40f89b0011fff07bf4d6b6d0d735df68a` / fingerprint
  `c2bc6a91ce536329bec0ad4af4d3264a5a39904d035af28442071b4e96e2f56a`; evidence PR#246 comment
  `5810833593`; automated acceptance `42/42 PASS`.
- Preserves Fit evidence SHAs and independent Architecture Fit review id unchanged (PR #239 review
  `5295149318`).
- Preserves ARCH-R22 / DR-20 / D-378 CURRENT / ADR-018 Accepted / ARCH-G28 — no new D-number; no
  ARCH revision.
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-036H`;
  `nextProductSlice = IMP-036I`; `PROGRAM_PAUSE` / D-377; IMP-037/038 HOLD (including frozen
  IMP-038 runtime evidence); IMP-036I / IMP-039 / IMP-040 NOT_ACTIVATED.
- Does **not** accept IMP-036H, perform Founder UAT, activate IMP-036I / IMP-039 / IMP-040, accept
  IMP-037/038, or close `GAP-EXT-ASSESS-001`.
- Next gate = independent technical acceptance → UAT deployment → Founder UAT → acceptance
  reconciliation.

### GTM-R145 — 2026-09-24

- Persist IMP-036H implementation **START** (`IMP036H_IMPLEMENTATION_START` semantic checkpoint).
- Advances `IMP036H_STARTED: YES`; `IMP036H_IMPLEMENTATION_STARTED: YES`; formal ROADMAP lifecycle
  `IMPLEMENTATION_IN_PROGRESS` (`IMP036H_IMPLEMENTATION_AUTHORIZED: YES`;
  `IMP036H_IMPLEMENTATION_COMPLETE: NO`; `IMP036H_ACCEPTED: NO`).
- Preserves Fit evidence SHAs and independent review id unchanged (PR #239 review `5295149318`;
  Fit-evaluated HEAD `aab814c238c499367ee921e9f8ffb03ff7b1b373` / tree
  `93d4e83d4a73c61c9439bcaae2799920fcca46db` / fingerprint
  `74b1254f22c9131a6e073522cf9310f264866e442cc074775ad5f4b214f0e51e`).
- Preserves ARCH-R22 / DR-20 / D-378 CURRENT / ADR-018 Accepted / ARCH-G28 — no new D-number; no
  ARCH revision.
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-036H`;
  `nextProductSlice = IMP-036I`; `pendingAcceptance = NONE`; `PROGRAM_PAUSE` / D-377;
  IMP-037/038 HOLD (including frozen IMP-038 runtime evidence); IMP-036I / IMP-039 / IMP-040
  NOT_ACTIVATED.
- Does **not** claim `IMPLEMENTATION_COMPLETE`, accept IMP-036H, activate IMP-036I / IMP-039 /
  IMP-040, accept IMP-037/038, or close `GAP-EXT-ASSESS-001`.
- Tranche A begins schema + domain foundation under locked capability architecture.
- Next gate = continue authorized IMP-036H implementation — **not** acceptance.

### GTM-R144 — 2026-09-24

- Persist Founder implementation authorization for IMP-036H
  (`IMP036H_IMPLEMENTATION_AUTHORIZED: YES`; formal lifecycle remains `ARCHITECTURE_LOCKED`).
- Records `IMP036H_STARTED: NO`; `IMP036H_IMPLEMENTATION_STARTED: NO`;
  `IMP036H_IMPLEMENTATION_COMPLETE: NO`; `IMP036H_ACCEPTED: NO`.
- Preserves Fit evidence SHAs and independent review id unchanged (PR #239 review `5295149318`;
  Fit-evaluated HEAD `aab814c238c499367ee921e9f8ffb03ff7b1b373` / tree
  `93d4e83d4a73c61c9439bcaae2799920fcca46db` / fingerprint
  `74b1254f22c9131a6e073522cf9310f264866e442cc074775ad5f4b214f0e51e`).
- Preserves ARCH-R22 / DR-20 / D-378 CURRENT / ADR-018 Accepted / ARCH-G28 — no new D-number; no
  ARCH revision.
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-036H`;
  `nextProductSlice = IMP-036I`; `pendingAcceptance = NONE`; `PROGRAM_PAUSE` / D-377;
  IMP-037/038 HOLD (including frozen IMP-038 runtime evidence); IMP-036I / IMP-039 / IMP-040
  NOT_ACTIVATED.
- Does **not** start implementation, execute schema migration, accept IMP-036H, activate
  IMP-036I / IMP-039 / IMP-040, accept IMP-037/038, or close `GAP-EXT-ASSESS-001`.
- Execution plan: [`product/IMP-036H/implementation-plan.md`](./product/IMP-036H/implementation-plan.md).
- Next gate = Implementation Start — **not** automatic start.
- Superseded as CURRENT tip by GTM-R145.

### GTM-R143 — 2026-09-24

- Persist Architecture Fit PASS and capability architecture lock for IMP-036H
  (`IMP036H_ARCHITECTURE_FIT: PASS`; `IMP036H_ARCHITECTURE_LOCKED: YES`; formal lifecycle
  `ARCHITECTURE_LOCKED`).
- Exact Fit-evaluated candidate HEAD `aab814c238c499367ee921e9f8ffb03ff7b1b373` / tree
  `93d4e83d4a73c61c9439bcaae2799920fcca46db` / fingerprint
  `74b1254f22c9131a6e073522cf9310f264866e442cc074775ad5f4b214f0e51e`; independent Fit evidence
  PR #239 review `5295149318`.
- Promote D-378 PROPOSED → CURRENT; ADR-018 Proposed → Accepted; ARCH-R21 → ARCH-R22 (ARCH-G28);
  DR-19 → DR-20.
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-036H`;
  `nextProductSlice = IMP-036I`; `pendingAcceptance = NONE`; `PROGRAM_PAUSE` / D-377;
  IMP-037/038 HOLD; IMP-036I / IMP-039 / IMP-040 NOT_ACTIVATED.
- Preserves `IMP036H_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036H_STARTED: NO`; `IMP036H_ACCEPTED: NO`.
- Does **not** authorize/start implementation, execute schema migration, accept IMP-036H, activate
  IMP-036I / IMP-039 / IMP-040, accept IMP-037/038, or close `GAP-EXT-ASSESS-001`.
- Next gate = Implementation Authorization.
- Superseded as CURRENT tip by GTM-R144.

### GTM-R142 — 2026-09-23

- Persist independently executed Product Definition Gate PASS for IMP-036H candidate
  `PD-IMP-036H-DRAFT-1` (`IMP036H_PRODUCT_DEFINITION: APPROVED`;
  `IMP036H_PRODUCT_DEFINITION_GATE: PASS`).
- Gate-evaluated candidate HEAD `91d3714a9efba59c309db159d112fdbb6c46dc72` / tree
  `3f8459cfc88c97f4267528fe5b8c3e8773692245` / fingerprint
  `81395a83ca492a791ee1faca3fdbf627b985c30adf00d2163693b3ccd6523664`; independent gate evidence
  PR#238 comment `5797812536` — Gate Result PASS. Post-gate persistence commit is not the evaluated
  artifact.
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-036H`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-036I`; `gtmBoundary = IMP-040`.
- Preserves `PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED` (**D-377**) and IMP-037/038
  HOLD / freeze markers (including IMP-038 frozen runtime evidence).
- Preserves `IMP036H_ACTIVATED: YES` while formal IMP-036H ROADMAP lifecycle remains `PLANNED`
  (`IMP036H_ARCHITECTURE_FIT: NOT_PERFORMED`; `IMP036H_ARCHITECTURE_LOCKED: NO`;
  `IMP036H_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036H_STARTED: NO`; `IMP036H_ACCEPTED: NO`;
  `IMP036H_FOUNDER_UAT_REQUIRED: YES`; `IMP036I_ACTIVATED: NO`).
- Does **not** perform Architecture Fit, lock architecture, authorize/start implementation, accept
  IMP-036H, activate IMP-036I / IMP-039 / IMP-040, accept IMP-037/038, or close
  `GAP-EXT-ASSESS-001`. Next phase = Architecture Fit (separate auth).
- ARCH-R21 / DR-19 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R141.

### GTM-R141 — 2026-09-23

- ADVANCE / activate IMP-036H Product Definition under Founder-authorized **D-377** /
  `PROGRAM_PAUSE: PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED`.
- Sets `currentProductSlice = IMP-036H`; `nextProductSlice = IMP-036I`;
  `IMP036H_ACTIVATED: YES`; formal lifecycle `PLANNED`; Product Definition
  `PD-IMP-036H-DRAFT-1` = `DRAFT_READY_FOR_GATE`; Gate NOT_PERFORMED; Fit NOT_PERFORMED;
  architecture NOT_LOCKED; implementation NOT_AUTHORIZED / NOT_STARTED.
- Holds IMP-037 / IMP-038; preserves historical continuation exception; does not activate
  IMP-036I / IMP-039 / IMP-040; does not accept IMP-037/038; ARCH-R21 unchanged.
- Historical next gate = Product Definition Gate — **not** Architecture Fit / implementation.
- Supersedes GTM-R140.

### GTM-R140 — 2026-09-22

- Combined Founder-authorized IMP-038 implementation **AUTHORIZE + START** (intentional combine;
  no separate authorize-only tip). Formal lifecycle `IMPLEMENTATION_IN_PROGRESS`.
- Sets `IMP038_IMPLEMENTATION_AUTHORIZED: YES`; `IMP038_STARTED: YES`;
  `FOUNDER_IMP038_IMPLEMENTATION_AUTHORIZATION: CURSOR_SESSION_MANDATE` (starting authority `main`
  `d14c3678b92a87052682b9559764654f5f9d3851` / tree `682f1597a6f991cddde7d41e9e6705c1bed335b1`;
  locked `PD-IMP-038-DRAFT-2` + ARCH-R21 / D-375 / ADR-017).
- Preserves Fit PASS / LOCKED YES; independent Architecture Fit review PASS; `IMP038_ACCEPTED: NO`;
  `IMP038_IMPLEMENTATION_COMPLETE: NO`; `IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES`.
- Preserves `CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038`; IMP-037
  `IMPLEMENTATION_IN_PROGRESS` / provider-blocked; `acceptedThrough = IMP-036G`;
  `currentProductSlice = IMP-038`; `nextProductSlice = IMP-039`; `IMP039_ACTIVATED: NO`.
- Encodes senior-delivery operating model in `AGENTS.md` (Cursor GREEN/AMBER autonomous delivery
  under locked contract; RED escalates via `DECISION_REQUIRED`).
- Does **not** accept IMP-037/038; does **not** activate IMP-039; does **not** claim legal compliance.
- Next gate = continue locked IMP-038 implementation — **not** acceptance.
- Supersedes GTM-R139.

### GTM-R139 — 2026-09-22

- Persist IMP-038 Architecture Fit **PASS** and architecture **LOCKED** (formal lifecycle
  `ARCHITECTURE_LOCKED`) against ARCH-R21 / D-375 / ADR-017.
- Capability architecture:
  [`capabilities/IMP-038-security-privacy-hardening.md`](./capabilities/IMP-038-security-privacy-hardening.md).
- Sets `IMP038_ARCHITECTURE_FIT: PASS`; `IMP038_ARCHITECTURE_LOCKED: YES`. Independent
  Architecture Fit review is recorded as `INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS` for reviewed
  technical candidate head `3b03164d6581c5a98a893c24e92eaddece004e90` / tree `5bb499fa84a5bf02682b30518f2bf898ddb23540`
  (GitHub review `5279884548`). Review PASS is evidence reconciliation inside this
  architecture-lock checkpoint; it is not a new ROADMAP lifecycle state and does not authorize
  implementation. Keeps `IMP038_IMPLEMENTATION_AUTHORIZED: NO`; `IMP038_STARTED: NO`;
  `IMP038_ACCEPTED: NO`; `IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES`.
- Records Fit-evaluated candidate HEAD `43007808849f093d84cbe710f32a728b41a9e5a2` / tree
  `581fb23631df40044ec7b9c449545959a90b9998` / fingerprint
  `ab00d1ab23f3c7d8b140feefcd1a0787f1fedf90ab08a9934c9a892a77c8184d`. Lock-persistence /
  review-reconciliation commits are not the Fit-evaluated artifact; the review-status
  reconciliation commit is not the independently reviewed technical candidate.
- Records `D-375_CREATED: YES`; `ARCH_R21_CREATED: YES` (preserves `D-374_CREATED: YES`;
  `ARCH_R20_CREATED: YES`).
- Preserves `CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038`; IMP-037
  `IMPLEMENTATION_IN_PROGRESS` / provider-blocked; `acceptedThrough = IMP-036G`;
  `currentProductSlice = IMP-038`; `nextProductSlice = IMP-039`; `IMP039_ACTIVATED: NO`.
- Does **not** authorize/start IMP-038 implementation; does **not** accept IMP-037/038; does
  **not** activate IMP-039; does **not** claim legal compliance.
- Next gate = human R3 merge decision for architecture-lock PR #182 — **not** implementation
  authorization.
- Supersedes GTM-R138.

### GTM-R138 — 2026-09-22

- Activate **NEW** controlled continuation `CONTINUATION_EXCEPTION: IMP037_PROVIDER_BLOCKED_TO_IMP038`
  (authority PR#179/5771367844) while IMP-037 remains unresolved / provider-blocked.
- Sets `currentProductSlice = IMP-038`; `nextProductSlice = IMP-039`; preserves
  `acceptedThrough = IMP-036G`; `pendingAcceptance = NONE`.
- Sets `IMP038_ACTIVATED: YES`; formal IMP-038 lifecycle `PLANNED`; Product Definition
  `PD-IMP-038-DRAFT-2` APPROVED; Gate PASS (approval PR#180/5773885848; Founder decisions
  PR#180/5773472988; independent readiness review `5276033742`); Architecture Fit NOT_PERFORMED;
  architecture unlocked; implementation NOT_AUTHORIZED / NOT_STARTED; `IMP038_ACCEPTED: NO`;
  `IMP038_ACCEPTANCE_BLOCKED_BY_IMP037: YES`.
- Preserves IMP-037 `IMPLEMENTATION_IN_PROGRESS` (`IMP037_IMPLEMENTATION_COMPLETE: NO`;
  `IMP037_ACCEPTED: NO`; `IMP037_EXTERNAL_RECOVERY_PROOF: NOT_PERFORMED`;
  `PHASE1_BLOCK_STATUS: BLOCKED_PROVIDER_ACCESS`).
- Does **not** reopen historical IMP-026 → IMP-028 continuation; does **not** accept IMP-037;
  does **not** perform Architecture Fit / lock IMP-038 architecture; does **not** authorize IMP-038
  implementation; does **not** activate IMP-039.
- Preserves ARCH-R20 / DR-16 / PD-1 / TEST-1 / VISION-1.
- Same-checkpoint reconciliation records Product Definition Gate PASS without creating GTM-R139.
- Supersedes GTM-R137.

### GTM-R137 — 2026-09-21

- Reconcile IMP-037 post-merge repository implementation provenance after PR #174 merge to `main`
  (`IMP037_REPOSITORY_IMPLEMENTATION_MERGED: YES`; merge SHA
  `f77a54819f51ad5648dda8acb3a7c93345cd5d6c` / tree `4ff19a31db947cafadf690cf6bf1b6d2f1de14ac`;
  reviewed head `ae7328efe1add11a9a4299150251fe14c71b2730`; independent implementation review
  `5265354130` PASS; post-merge CI `35587376968` SUCCESS).
- Formal IMP-037 ROADMAP lifecycle remains `IMPLEMENTATION_IN_PROGRESS`
  (`IMP037_IMPLEMENTATION_COMPLETE: NO`; `IMP037_ACCEPTED: NO`;
  `IMP037_EXTERNAL_RECOVERY_PROOF: NOT_PERFORMED`; `IMP037_FOUNDER_UAT: NOT_PERFORMED`).
- Clarifies: repository Layer 1/Layer 2/restore tooling is **merged**; required external
  Spaces/provider backup/restore proof, systemd host install, off-host custody execution,
  RPO/RTO measurement, and Founder UAT remain **NOT_PERFORMED**.
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-037`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-038`; `IMP038_ACTIVATED: NO`.
- Preserves ARCH-R20 / DR-16 / D-374 CURRENT (`D-375_CREATED: NO`; `ARCH_R21_CREATED: NO`).
- Does **not** move to `IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE`, accept IMP-037, activate
  IMP-038, claim RPO/RTO proven, or create production resources.
- Supporting external-proof readiness plan:
  [`operations/imp037-external-proof-plan.md`](./operations/imp037-external-proof-plan.md).
- VISION-1 / PD-1 / TEST-1 unchanged.
- Supersedes GTM-R136.

### GTM-R136 — 2026-09-20

- Persist IMP-037 implementation START (`IMP-037_IMPLEMENTATION_START`) after explicit human R3
  start / execution authorization (PR #172 issue comment `5744869269`).
- Preserves implementation authorization evidence PR#171/5743814105.
- Sets formal IMP-037 ROADMAP lifecycle to `IMPLEMENTATION_IN_PROGRESS`
  (`IMP037_IMPLEMENTATION_AUTHORIZED: YES`; `IMP037_STARTED: YES`; `IMP037_ACCEPTED: NO`).
- Current Product Implementation becomes IMP-037. Accompanying recovery-foundation engineering
  tranche (status/readiness, evidence model, identity guard, secret-safe CLI, runbook) does **not**
  complete Layer 1/Layer 2 backup, restore, Spaces, pgBackRest, age, systemd, or Founder UAT.
  (Later superseded for repository-merge provenance by GTM-R137; external proof remains outstanding.)
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-037`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-038`.
- Preserves `IMP037_ACTIVATED: YES`; Product Definition APPROVED / Gate PASS; Architecture Fit PASS;
  architecture LOCKED; independent Architecture Fit review PASS; `IMP038_ACTIVATED: NO`.
- Preserves ARCH-R20 / DR-16 / D-374 CURRENT (`D-375_CREATED: NO`; `ARCH_R21_CREATED: NO`).
- Does **not** accept IMP-037, activate IMP-038, claim RPO/RTO proven, or create D-375 / ARCH-R21.
- VISION-1 / PD-1 / TEST-1 unchanged.
- Supersedes GTM-R135.

### GTM-R135 — 2026-09-19

- Persist IMP-037 implementation authorization after Implementation Authorization Gate PASS
  (PR #171 issue comment `5743814105`).
- Authorization applies to locked Product Definition `PD-IMP-037-DRAFT-1` (APPROVED / Gate PASS)
  and locked capability architecture
  [`capabilities/IMP-037-backup-restore-migration-readiness.md`](./capabilities/IMP-037-backup-restore-migration-readiness.md)
  (Architecture Fit PASS against ARCH-R20 / D-374; independent Architecture Fit review PASS).
- Sets formal IMP-037 ROADMAP lifecycle to `ARCHITECTURE_LOCKED` / `AUTHORIZED` / `NOT_STARTED`
  (`IMP037_IMPLEMENTATION_AUTHORIZED: YES`; `IMP037_STARTED: NO`).
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-037`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-038`.
- Preserves `IMP037_ACTIVATED: YES`; `IMP037_PRODUCT_DEFINITION: APPROVED`;
  `IMP037_PRODUCT_DEFINITION_GATE: PASS`; `IMP037_ARCHITECTURE_FIT: PASS`;
  `IMP037_ARCHITECTURE_LOCKED: YES`; `IMP037_ACCEPTED: NO`; `IMP037_FOUNDER_UAT_REQUIRED: YES`;
  `IMP038_ACTIVATED: NO`.
- Preserves ARCH-R20 / DR-16 / D-374 CURRENT (`D-375_CREATED: NO`; `ARCH_R21_CREATED: NO`).
- No implementation accompanies GTM-R135. Current Product Implementation remains `NONE`.
  `AUTHORIZED` + `NOT_STARTED` ≠ `IMPLEMENTATION_IN_PROGRESS`.
- Does **not** start implementation, accept IMP-037, activate IMP-038, create production
  resources, mutate cloud/database, or authorize merge. Next gate = explicit implementation
  start / execution authorization (after merge/reconciliation).
- VISION-1 / PD-1 / TEST-1 unchanged.
- Supersedes GTM-R134.

### GTM-R134 — 2026-09-19

- Persist Architecture Fit PASS and lock IMP-037 capability architecture against ARCH-R20 / D-374
  (`IMP037_ARCHITECTURE_FIT: PASS`; `IMP037_ARCHITECTURE_LOCKED: YES`). Independent Architecture Fit
  review is recorded as `INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS` for reviewed technical candidate
  head `d74ca9a30096fb14bca80643b75aa19d33093dde` / tree `09c7e3bd6b7832944d07d527c149752ed3bbeb4d`
  (GitHub review `5256273904`). Review PASS is evidence reconciliation inside this architecture-lock
  checkpoint; it is not a new ROADMAP lifecycle state and does not authorize implementation.
- Fit-evaluated candidate: branch `main` head `28e6dd15c48b8c19abbc7057c4dc7e0a7d7cc7ea` / tree
  `5792c963166e8589751d2ba8c8928728e2c83526` / fingerprint
  `56fa9b5459fd8acceb2ccc3ab73c5d7d9583dbf4539b10a1ef75553dd5aff8ba`; Fit date 2026-09-19;
  Architecture Fit result PASS (founder-approved for persistence). Lock-persistence / review-
  reconciliation commits are not the Fit-evaluated artifact.
- Adds locked capability architecture
  [`capabilities/IMP-037-backup-restore-migration-readiness.md`](./capabilities/IMP-037-backup-restore-migration-readiness.md)
  (Layer 1 pgBackRest >= 2.55; Layer 2 pg_dump -Fc + age; two Spaces buckets; no Spaces mutex;
  PR #169 NON_AUTHORITATIVE / SUPERSEDED).
- Advances formal IMP-037 ROADMAP lifecycle to `ARCHITECTURE_LOCKED` while preserving
  `IMP037_IMPLEMENTATION_AUTHORIZED: NO`; `IMP037_STARTED: NO`; `IMP037_ACCEPTED: NO`;
  `IMP037_FOUNDER_UAT_REQUIRED: YES`; `IMP038_ACTIVATED: NO`.
- Preserves Product Definition Gate PASS for `PD-IMP-037-DRAFT-1` and `acceptedThrough = IMP-036G`.
- Preserves ARCH-R20 / DR-16 / D-374 CURRENT (`D375_REQUIRED_FOR_LOCK: NO`; no ARCH-R21).
- Current Product Implementation remains `NONE`. Current governance activity: IMP-037 Architecture
  Fit PASS / capability architecture LOCKED; independent Architecture Fit review PASS;
  implementation authorization NOT_GRANTED.
- Does **not** authorize/start implementation, accept IMP-037, perform Founder UAT, create D-375,
  create ARCH-R21, mutate cloud/production resources, or activate IMP-038. Next gate = human R3
  merge decision (not implementation authorization).
- PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R133.

### GTM-R133 — 2026-09-19

- Persist `GLOBAL_ARCHITECTURE_DECISION_D374`: register **D-374** / ADR-016; advance global
  architecture to **ARCH-R20** (ARCH-G26) and decision register to **DR-16**.
- Cost-optimized pilot infrastructure: single DigitalOcean Basic Droplet + Docker Engine / Compose
  + self-hosted PostgreSQL 18 + Spaces off-host backups; App Platform / Managed PostgreSQL / k8s /
  k3s / Podman production / always-on cloud staging rejected for pilot.
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-037`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-038`.
- Preserves `IMP037_ACTIVATED: YES` while formal IMP-037 ROADMAP lifecycle remains `PLANNED`
  (`IMP037_PRODUCT_DEFINITION: APPROVED`; `IMP037_PRODUCT_DEFINITION_GATE: PASS`;
  `IMP037_ARCHITECTURE_FIT: NOT_PERFORMED`; `IMP037_ARCHITECTURE_LOCKED: NO`;
  `IMP037_IMPLEMENTATION_AUTHORIZED: NO`; `IMP037_STARTED: NO`; `IMP037_ACCEPTED: NO`;
  `IMP037_FOUNDER_UAT_REQUIRED: YES`).
- Records `ARCHITECTURE_FIT_REOPEN_REASON: D-374 / ARCH-R20 replaces managed PostgreSQL/App Platform
  pilot infrastructure assumptions`.
- Records `D-374_CREATED: YES`; `ARCH_R20_CREATED: YES`.
- Notes PR #169 predates D-374 / ARCH-R20 and is not valid Fit authority against this checkpoint.
- Does **not** perform Architecture Fit, lock architecture, authorize/start implementation, accept
  IMP-037, activate IMP-038, implement infrastructure, or authorize merge. Next phase = fresh
  IMP-037 Architecture Fit against ARCH-R20 (separate auth).
- PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R132.

### GTM-R132 — 2026-09-19

- Persist independently executed Product Definition Gate PASS for IMP-037 candidate
  `PD-IMP-037-DRAFT-1` (`IMP037_PRODUCT_DEFINITION: APPROVED`;
  `IMP037_PRODUCT_DEFINITION_GATE: PASS`).
- Gate-evaluated candidate head `fccdf7ef606ca906bcdcd706a6de97f693bb88b4` / tree
  `1477d12b5c5b3b0ccb8d488757516d5b6e637674` / Product Definition blob
  `eb792d02dbfede862a0bb104a754d14d875141aa` / fingerprint
  `9be2a43fe3881ccd28f169f60209cef3c78c991524e5e9d34a8b657e1b1f0c19`; gate date 2026-09-19;
  Founder / product governance human authority authorized PASS after independent pre-gate review
  PASS. Exact-main CI `35382560066` SUCCESS. Post-gate persistence commit is not the evaluated
  artifact.
- Preserves `acceptedThrough = IMP-036G`; `currentProductSlice = IMP-037`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-038`.
- Preserves `IMP037_ACTIVATED: YES` while formal IMP-037 ROADMAP lifecycle remains `PLANNED`
  (`IMP037_ARCHITECTURE_LOCKED: NO`; `IMP037_IMPLEMENTATION_AUTHORIZED: NO`;
  `IMP037_STARTED: NO`; `IMP037_ACCEPTED: NO`; `IMP037_FOUNDER_UAT_REQUIRED: YES`;
  `IMP037_PRODUCT_DECISIONS: RESOLVED`; `IMP037_PRODUCT_DECISION_COUNT: 7`).
- Preserves `IMP037_ARCHITECTURE_FIT: NOT_PERFORMED`.
- Does **not** perform Architecture Fit, lock architecture, authorize/start implementation, accept
  IMP-037, activate IMP-038, or authorize merge. Next phase = Architecture Fit (separate auth).
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R131.

### GTM-R131 — 2026-09-18

- ADVANCE / activate IMP-037 — Backup, Restore & Migration Readiness as CURRENT product slice after
  accepted and reconciled IMP-036G (GTM-R130 / STATE-R128; base main
  `6b1f2344d0184e29403b99adfea85c2e5dc8bf9a` / tree `5471ea8f72c635a365e9a78ea1394ec212dcad69`).
- Post-acceptance exact-main CI run `35376477139` SUCCESS.
- Sets `currentProductSlice = IMP-037`; `pendingAcceptance = NONE`; `nextProductSlice = IMP-038`.
- Preserves `acceptedThrough = IMP-036G`; IMP-036G remains `COMPLETE_AND_ACCEPTED`.
- Records `IMP037_ACTIVATED: YES` while formal IMP-037 ROADMAP lifecycle remains `PLANNED`
  (`IMP037_PRODUCT_DEFINITION: PRE_GATE_DRAFT` / `PD-IMP-037-DRAFT-1`;
  `IMP037_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`; `IMP037_ARCHITECTURE_FIT: NOT_PERFORMED`;
  `IMP037_ARCHITECTURE_LOCKED: NO`; `IMP037_IMPLEMENTATION_AUTHORIZED: NO`;
  `IMP037_STARTED: NO`; `IMP037_ACCEPTED: NO`; `IMP037_FOUNDER_UAT_REQUIRED: YES`).
- Records `IMP038_ACTIVATED: NO`. Does **not** execute Product Definition Gate, Architecture Fit,
  lock architecture, authorize/start implementation, accept IMP-037, or activate IMP-038.
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R130.

### GTM-R130 — 2026-09-18

- Formal acceptance of IMP-036G — Administration Console V2 after Founder UAT PASS.
- Accepted UAT product candidate remains `fbf690a67cda51bd6bbc1bad4a9d26f574c4286e` / tree
  `84b6a502fcec646cb5a65f3257f19b85c64f49e1` (fingerprint
  `9f472ce6e1ccaa2fe914006c846fb3018d668b718f569b6d0cb4fa64c3013f9b`; exact-main CI
  `35366698302` SUCCESS). Governance reconciliation is not a new product candidate.
- Advances `acceptedThrough = IMP-036G`; sets `currentProductSlice = NONE` and
  `pendingAcceptance = NONE`; preserves `nextProductSlice = IMP-037`.
- Records `IMP-036G: COMPLETE_AND_ACCEPTED`; `IMP036G_ACCEPTED: YES`; `IMP036G_FOUNDER_UAT: PASS`;
  `IMP036G_FORMAL_ACCEPTANCE: ACCEPTED`; `IMP036G_IMPLEMENTATION_COMPLETE: YES`;
  `IMP036G_INDEPENDENT_TECHNICAL_ACCEPTANCE: PASS`.
- Preserves Product Definition `PD-IMP-036G-DRAFT-2` (Gate PASS; Architecture Fit PASS).
- Preserves implementation / review provenance separately from the accepted UAT candidate
  (implementation merge `c35c9eab6a30ec6ce745cefd75c523181326f360` / tree `266fe3b07811f6942e76cac155d58ba07daabe56`; reviewed HEAD `7a013155a98529d4527e7b6c0358642e5cd9d806`;
  implementation CI `35214215500` as `IMP036G_IMPLEMENTATION_EXACT_MAIN_CI`; PRs #159/#161/#163/#164/#165).
- Preserves IMP-036F acceptance evidence unchanged.
- IMP-037 remains `PLANNED` / `NOT_ACTIVATED` / `NOT_AUTHORIZED` / `NOT_STARTED`
  (`IMP037_ACTIVATED: NO`). No ADVANCE.
- ARCH-R19 / DR-15 / D-374 / ARCH-R20 unchanged (no new binding semantics).
- Supersedes GTM-R129.

### GTM-R129 — 2026-09-18

- Records IMP-036G implementation complete pending independent acceptance after exact implementation
  merge (`c35c9eab6a30ec6ce745cefd75c523181326f360`; tree
  `266fe3b07811f6942e76cac155d58ba07daabe56`), independent implementation review PASS on reviewed
  product candidate `7a013155a98529d4527e7b6c0358642e5cd9d806` (same tree; PR #159), and successful
  exact-main CI (`workflow: CI`; run `35214215500`; head_sha
  `c35c9eab6a30ec6ce745cefd75c523181326f360`; result SUCCESS).
- IMP-036G lifecycle becomes `IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE`. Architecture remains
  `ARCHITECTURE_LOCKED` (`IMP036G_ARCHITECTURE_LOCKED: YES`); implementation becomes
  `AUTHORIZED` / `STARTED` / `COMPLETE` (`IMP036G_IMPLEMENTATION_AUTHORIZED: YES`;
  `IMP036G_STARTED: YES`; `IMP036G_IMPLEMENTATION_COMPLETE: YES`; `IMP036G_ACCEPTED: NO`).
- Sets `pendingAcceptance = IMP-036G`. Preserves `acceptedThrough = IMP-036F`;
  `currentProductSlice` remains IMP-036G; `nextProductSlice` remains IMP-037 (`PLANNED` /
  `NOT_ACTIVATED` / `NOT_AUTHORIZED` / `NOT_STARTED`; `IMP037_ACTIVATED: NO`).
- Completion is **not** acceptance. Does **not** activate, authorize, or start IMP-037. Does
  **not** claim Founder UAT PASS (`IMP036G_FOUNDER_UAT_REQUIRED: YES`;
  `IMP036G_FOUNDER_UAT: NOT_PERFORMED`). Does **not** claim formal IMP acceptance
  (`IMP036G_ACCEPTED: NO`). Independent technical acceptance for UAT deployment remains
  `READY` (next pre-deployment gate). Manual technical validation required for implementation
  completion = PASS (`IMP036G_MANUAL_TECHNICAL_VALIDATION: PASS`; candidate
  `c35c9eab6a30ec6ce745cefd75c523181326f360` / tree `266fe3b07811f6942e76cac155d58ba07daabe56`;
  tester Ashutosh; date 2026-09-18; defects NONE). Founder UAT remains a separate later
  interactive human gate and is still `NOT_PERFORMED`.
- Evidence markers: `IMP036G_IMPLEMENTATION_EVIDENCE: COMPLETE`;
  `IMP_036G_INDEPENDENT_IMPLEMENTATION_REVIEW: PASS`;
  `IMP036G_IMPLEMENTATION_MERGE_SHA: c35c9eab6a30ec6ce745cefd75c523181326f360`;
  `IMP036G_IMPLEMENTATION_TREE: 266fe3b07811f6942e76cac155d58ba07daabe56`;
  `IMP036G_REVIEWED_CANDIDATE_HEAD: 7a013155a98529d4527e7b6c0358642e5cd9d806`;
  `IMP036G_REVIEWED_CANDIDATE_TREE: 266fe3b07811f6942e76cac155d58ba07daabe56`;
  `IMP036G_EXACT_MAIN_CI: 35214215500`; `IMP036G_EXACT_MAIN_CI_RESULT: SUCCESS`.
- Preserves Product Definition Gate PASS / Architecture Fit PASS / architecture LOCKED for
  `PD-IMP-036G-DRAFT-2`. ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged. No D-374 /
  ARCH-R20.
- Supersedes GTM-R128; the GTM-R128 implementation-start checkpoint remains historical tip
  predecessor at GTM-R128 / STATE-R126.

### GTM-R128 — 2026-09-17

- Persist explicit human implementation authorization **and** implementation start for IMP-036G as a
  bounded autonomous implementation sprint (`IMP036G_IMPLEMENTATION_AUTHORIZED: YES`;
  `IMP036G_STARTED: YES`).
- Sets formal IMP-036G ROADMAP lifecycle to `IMPLEMENTATION_IN_PROGRESS` and Current Product
  Implementation to `IMP-036G`.
- Preserves `acceptedThrough = IMP-036F`; `currentProductSlice = IMP-036G`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`.
- Preserves `IMP036G_ARCHITECTURE_LOCKED: YES`, `IMP036G_ARCHITECTURE_FIT: PASS`, and Product
  Definition Gate PASS for `PD-IMP-036G-DRAFT-2`.
- Does **not** claim `IMPLEMENTATION_COMPLETE`, accept IMP-036G (`IMP036G_ACCEPTED: NO`), perform
  Founder UAT (`IMP036G_FOUNDER_UAT: NOT_PERFORMED`; `IMP036G_FOUNDER_UAT_REQUIRED: YES`), create
  D-374, create ARCH-R20, or activate IMP-037 (`IMP037_ACTIVATED: NO`).
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R127; the GTM-R127 architecture-lock checkpoint remains historical tip predecessor
  at GTM-R127 / STATE-R125.

### GTM-R127 — 2026-09-17

- Persist independently reviewed Architecture Fit PASS and lock IMP-036G capability architecture
  (`IMP036G_ARCHITECTURE_FIT: PASS`; `IMP036G_ARCHITECTURE_LOCKED: YES`).
- Fit-evaluated candidate: branch `main` head `386a245cde223d87c19742753130113b21b4bb2f` / tree
  `c4ef07bbd00bbbb964a9551b1d04d2fe140170b3` / fingerprint
  `e8eb68ebf06aea7ab50305f8e8700d450f9c5e9fd1ae24c91d4d81cfd157eb2c`; Fit date 2026-09-17;
  `INDEPENDENT_ARCHITECTURE_FIT_REVIEW: PASS`. Lock-persistence commit is not the evaluated artifact.
- Adds locked capability architecture
  [`capabilities/IMP-036G-administration-console-v2.md`](./capabilities/IMP-036G-administration-console-v2.md).
- Advances formal IMP-036G ROADMAP lifecycle to `ARCHITECTURE_LOCKED` while preserving
  `IMP036G_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036G_STARTED: NO`; `IMP036G_ACCEPTED: NO`;
  `IMP036G_FOUNDER_UAT_REQUIRED: YES`; `IMP037_ACTIVATED: NO`.
- Preserves Product Definition Gate PASS for `PD-IMP-036G-DRAFT-2` and `acceptedThrough = IMP-036F`.
- Current Product Implementation remains `NONE`. Current governance activity: IMP-036G Architecture
  Fit PASS / capability architecture LOCKED; implementation authorization NOT_GRANTED.
- Does **not** authorize/start implementation, accept IMP-036G, perform Founder UAT, create D-374,
  create ARCH-R20, or activate IMP-037.
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R126.

### GTM-R126 — 2026-09-16

- Persist independently executed Product Definition Gate PASS for IMP-036G candidate
  `PD-IMP-036G-DRAFT-2` (`IMP036G_PRODUCT_DEFINITION: APPROVED`;
  `IMP036G_PRODUCT_DEFINITION_GATE: PASS`).
- Gate-evaluated candidate head `1fe1737d8f05d6069b2073d9faf1142d21b91970` / tree
  `25412cbadf224ef709687fe067f2427784a414cc`; gate date 2026-09-16; Founder / product governance
  human authority authorized PASS after independent pre-gate review PASS. Post-gate persistence
  commit is not the evaluated artifact.
- Preserves `acceptedThrough = IMP-036F`; `currentProductSlice = IMP-036G`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`.
- Preserves `IMP036G_ACTIVATED: YES` while formal IMP-036G ROADMAP lifecycle remains `PLANNED`
  (`IMP036G_ARCHITECTURE_LOCKED: NO`; `IMP036G_IMPLEMENTATION_AUTHORIZED: NO`;
  `IMP036G_STARTED: NO`; `IMP036G_ACCEPTED: NO`; `IMP036G_FOUNDER_UAT_REQUIRED: YES`;
  `IMP036G_PRODUCT_DECISIONS: RESOLVED`; `IMP036G_PRODUCT_DECISION_COUNT: 7`).
- Preserves `IMP036G_ARCHITECTURE_FIT: NOT_PERFORMED`.
- Does **not** perform Architecture Fit, lock architecture, authorize/start implementation, accept
  IMP-036G, activate IMP-037, or authorize merge. Next phase = Architecture Fit (separate auth).
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R125.

### GTM-R125 — 2026-09-16

- Records IMP-036G Product Definition DRAFT-2 (`PD-IMP-036G-DRAFT-2`) after Founder product
  decisions resolve all seven formerly unresolved IMP-036G product gaps inside IMP-036G
  (subject-principal effective permissions; useful Overview; server-side audit filters;
  small-mobile high-consequence actions; Expire membership; scalable collection discoverability;
  hierarchy stale-write protection). Base main
  `475d0c46598c2bf512570469354b69a3d75b7817` / tree `4ee7687b0d77027caa67d6672eadc390c7c916f8`.
- Sets `IMP036G_PRODUCT_DEFINITION_VERSION: PD-IMP-036G-DRAFT-2`;
  `IMP036G_PRODUCT_DECISIONS: RESOLVED`; `IMP036G_PRODUCT_DECISION_COUNT: 7`;
  `IMP036G_PRODUCT_DECISION_AUTHORITY: Founder`; `IMP036G_PRODUCT_DECISION_DATE: 2026-09-16`.
- Preserves `acceptedThrough = IMP-036F`; `currentProductSlice = IMP-036G`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`.
- Preserves `IMP036G_PRODUCT_DEFINITION: DRAFT`; `IMP036G_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`;
  `IMP036G_ARCHITECTURE_FIT: NOT_PERFORMED`; `IMP036G_ACTIVATED: YES` while formal IMP-036G
  ROADMAP lifecycle remains `PLANNED` (`IMP036G_ARCHITECTURE_LOCKED: NO`;
  `IMP036G_IMPLEMENTATION_AUTHORIZED: NO`; `IMP036G_STARTED: NO`; `IMP036G_ACCEPTED: NO`;
  `IMP036G_FOUNDER_UAT_REQUIRED: YES`).
- Does **not** execute Product Definition Gate, perform Architecture Fit, lock architecture,
  authorize/start implementation, accept IMP-036G, or activate IMP-037.
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R124.

### GTM-R124 — 2026-09-16

- Records IMP-036G pre-gate Product Definition draft `PD-IMP-036G-DRAFT-1` after ANCHOR → DISCOVER
  → STORY_MAP on activated IMP-036G (GTM-R123 / STATE-R121; base main
  `e067febf113fe21eebe1c1a3f3be24cbe23dd1f8`).
- Preserves `acceptedThrough = IMP-036F`; `currentProductSlice = IMP-036G`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`.
- Sets `IMP036G_PRODUCT_DEFINITION: DRAFT`; `IMP036G_PRODUCT_DEFINITION_VERSION: PD-IMP-036G-DRAFT-1`;
  `IMP036G_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`; `IMP036G_ARCHITECTURE_FIT: NOT_PERFORMED`.
- Preserves `IMP036G_ACTIVATED: YES` while formal IMP-036G ROADMAP lifecycle remains `PLANNED`
  (`IMP036G_ARCHITECTURE_LOCKED: NO`; `IMP036G_IMPLEMENTATION_AUTHORIZED: NO`;
  `IMP036G_STARTED: NO`; `IMP036G_ACCEPTED: NO`; `IMP036G_FOUNDER_UAT_REQUIRED: YES`).
- Does **not** execute Product Definition Gate, perform Architecture Fit, lock architecture,
  authorize/start implementation, accept IMP-036G, or activate IMP-037.
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R123.

### GTM-R123 — 2026-09-16

- ADVANCE / activate IMP-036G — Administration Console V2 as CURRENT product slice after accepted
  and reconciled IMP-036F (GTM-R122 / STATE-R120; base main
  `5417cb5b53e5aa64f1841604b9ef96cfc37327de`).
- Sets `currentProductSlice = IMP-036G`; `pendingAcceptance = NONE`; `nextProductSlice = IMP-037`.
- Preserves `acceptedThrough = IMP-036F`; IMP-036F remains `COMPLETE_AND_ACCEPTED`.
- Records `IMP036G_ACTIVATED: YES` while formal IMP-036G ROADMAP lifecycle remains `PLANNED`
  (`IMP036G_ARCHITECTURE_LOCKED: NO`; `IMP036G_IMPLEMENTATION_AUTHORIZED: NO`;
  `IMP036G_STARTED: NO`; `IMP036G_ACCEPTED: NO`; `IMP036G_PRODUCT_DEFINITION: NOT_CREATED`;
  `IMP036G_FOUNDER_UAT_REQUIRED: YES`).
- PD-1 applies prospectively; does **not** create Product Definition, pass Product Definition Gate,
  lock architecture, authorize/start implementation, or activate IMP-037.
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R122.

### GTM-R122 — 2026-09-15

- Formal acceptance of IMP-036F — Catalog, Menu, Pricing & Promotions Management after Founder UAT
  PASS.
- Accepted UAT product candidate remains `91d0b5e5e5815da6bf0bb325a3c6ab884dc06652` / tree
  `ab41fc7f2bf6d0a52c3ea6c2b69ed331ca9540cf` (fingerprint
  `c689630cb9a4d002fda3376f949a1f324015776d392abfd2abde7b6f5b91f973`; exact-main CI
  `34991901136` SUCCESS). Governance reconciliation is not a new product candidate.
- Advances `acceptedThrough = IMP-036F`; sets `currentProductSlice = NONE` and
  `pendingAcceptance = NONE`; preserves `nextProductSlice = IMP-036G`.
- Records `IMP-036F: COMPLETE_AND_ACCEPTED`; `IMP036F_ACCEPTED: YES`; `IMP036F_FOUNDER_UAT: PASS`;
  `IMP036F_FORMAL_ACCEPTANCE: ACCEPTED`; `IMP036F_IMPLEMENTATION_COMPLETE: YES`.
- Preserves Product Definition `PD-IMP-036F-DRAFT-1` (Gate PASS; Architecture Fit PASS).
- Preserves F6A/F6B/post-merge audit PR provenance and critical post-merge persistence audit PASS.
- Preserves IMP-036E acceptance evidence unchanged.
- IMP-036G remains `PLANNED` / `NOT_ACTIVATED` / `NOT_AUTHORIZED` / `NOT_STARTED`
  (`IMP036G_ACTIVATED: NO`). No ADVANCE.
- ARCH-R19 / DR-15 / D-374 / ARCH-R20 unchanged (no new binding semantics).
- Supersedes GTM-R121.

### GTM-R121 — 2026-09-11

- Persist IMP-036F implementation start after Founder/human execution authorization for workstream
  F1 (catalog ENTITY_CONTENT_REVISION publication model).
- Sets formal IMP-036F ROADMAP lifecycle to `IMPLEMENTATION_IN_PROGRESS`
  (`IMP036F_IMPLEMENTATION_AUTHORIZED: YES`; `IMP036F_STARTED: YES`).
- Preserves `acceptedThrough = IMP-036E`; `currentProductSlice = IMP-036F`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-036G`.
- Does **not** claim IMPLEMENTATION_COMPLETE or ACCEPTED. Does **not** activate IMP-036G.
- Schema migration `0037_hesitant_scorpion` and catalog revision domain work accompany this start.
- Supersedes GTM-R120 authorization-only tip checkpoint; authorization remains historical at
  GTM-R120 / STATE-R118.

### GTM-R120 — 2026-09-10

- Persist IMP-036F implementation authorization after Implementation Authorization Gate PASS
  (PR #141 issue comment `5622858455`).
- Authorization applies to locked Product Definition `PD-IMP-036F-DRAFT-1` (APPROVED / Gate PASS)
  and locked capability architecture
  [`capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md`](./capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md).
- Sets formal IMP-036F ROADMAP lifecycle to `ARCHITECTURE_LOCKED` / `AUTHORIZED` / `NOT_STARTED`
  (`IMP036F_IMPLEMENTATION_AUTHORIZED: YES`; `IMP036F_STARTED: NO`).
- Preserves `acceptedThrough = IMP-036E`; `currentProductSlice = IMP-036F`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-036G`.
- Preserves `IMP036F_ACTIVATED: YES`; `IMP036F_PRODUCT_DEFINITION: APPROVED`;
  `IMP036F_PRODUCT_DEFINITION_GATE: PASS`; `IMP036F_ARCHITECTURE_FIT: PASS`;
  `IMP036F_ARCHITECTURE_LOCKED: YES`; `IMP036F_ACCEPTED: NO`; `IMP036F_FOUNDER_UAT_REQUIRED: YES`;
  `IMP036G_ACTIVATED: NO`.
- No implementation accompanies GTM-R120. Schema design remains locked; migration execution has not
  started. IMP-036F not accepted. IMP-036G not activated. D-374 remains absent/not required;
  ARCH-R20 remains absent/not required; ARCH-R19 / DR-15 preserved.
- Does **not** start implementation, accept IMP-036F, activate IMP-036G, or authorize merge.
  `AUTHORIZED` + `NOT_STARTED` ≠ `IMPLEMENTATION_IN_PROGRESS`. Next gate = explicit implementation
  start / execution authorization (after merge/reconciliation).
- VISION-1 / PD-1 / TEST-1 unchanged.
- Supersedes GTM-R119.

### GTM-R119 — 2026-09-10

- Persist independently reviewed IMP-036F Architecture Fit PASS and lock capability architecture.
- Reviewed Architecture Fit candidate head `9ae06d6267e997223b1995124540974215ee17fd` / tree
  `55adb287bb0eb77240a6becdc16fed2d504ba144`; independent review `5169723968` PASS; exact-head CI
  run `34501448266` SUCCESS. Lock date 2026-09-10.
- Locked capability artifact:
  [`capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md`](./capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md).
- Sets formal IMP-036F ROADMAP lifecycle to `ARCHITECTURE_LOCKED` / `NOT_AUTHORIZED` / `NOT_STARTED`
  (`IMP036F_ARCHITECTURE_FIT: PASS`; `IMP036F_ARCHITECTURE_LOCKED: YES`).
- Preserves `acceptedThrough = IMP-036E`; `currentProductSlice = IMP-036F`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-036G`.
- Preserves `IMP036F_ACTIVATED: YES`; `IMP036F_PRODUCT_DEFINITION: APPROVED`;
  `IMP036F_PRODUCT_DEFINITION_GATE: PASS`; `IMP036F_IMPLEMENTATION_AUTHORIZED: NO`;
  `IMP036F_STARTED: NO`; `IMP036F_ACCEPTED: NO`; `IMP036F_FOUNDER_UAT_REQUIRED: YES`;
  `IMP036G_ACTIVATED: NO`.
- Architecture Fit performed and PASS. Capability architecture locked. Implementation remains
  NOT_AUTHORIZED / NOT_STARTED. No schema migration or implementation occurred. IMP-036F not
  accepted. IMP-036G not activated. D-374 not required/not created; ARCH-R20 not required/not
  created; ARCH-R19 / DR-15 preserved.
- Does **not** authorize/start implementation, accept IMP-036F, activate IMP-036G, or authorize
  merge. Next gate = explicit implementation authorization (after merge/reconciliation).
- VISION-1 / PD-1 / TEST-1 unchanged.
- Supersedes GTM-R118.

### GTM-R118 — 2026-09-10

- Persist independently executed Product Definition Gate PASS for IMP-036F candidate
  `PD-IMP-036F-DRAFT-1` (`IMP036F_PRODUCT_DEFINITION: APPROVED`;
  `IMP036F_PRODUCT_DEFINITION_GATE: PASS`).
- Gate-evaluated content SHA `014e0f935f193f54718d6afd5e7991508088f9bc`; durable PR #140 review
  `5166877450`; gate date 2026-09-10. Post-gate persistence commit is not the evaluated artifact.
- Preserves `acceptedThrough = IMP-036E`; `currentProductSlice = IMP-036F`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-036G`.
- Preserves `IMP036F_ACTIVATED: YES` while formal IMP-036F ROADMAP lifecycle remains `PLANNED`
  (`IMP036F_ARCHITECTURE_LOCKED: NO`; `IMP036F_IMPLEMENTATION_AUTHORIZED: NO`;
  `IMP036F_STARTED: NO`; `IMP036F_ACCEPTED: NO`; `IMP036F_FOUNDER_UAT_REQUIRED: YES`).
- Does **not** perform Architecture Fit, lock architecture, authorize/start implementation, accept
  IMP-036F, activate IMP-036G, or authorize merge. Next phase = Architecture Fit (separate auth).
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R117.

### GTM-R117 — 2026-09-10

- Post-discovery governance advance for IMP-036F: authorize STORY_MAP + Product Definition drafting
  after DISCOVER (`IMP036F_PRODUCT_DEFINITION: DRAFT_AUTHORIZED`;
  `IMP036F_PRODUCT_DEFINITION_GATE: NOT_PERFORMED`).
- Preserves `acceptedThrough = IMP-036E`; `currentProductSlice = IMP-036F`;
  `pendingAcceptance = NONE`; `nextProductSlice = IMP-036G`.
- Preserves `IMP036F_ACTIVATED: YES` while formal IMP-036F ROADMAP lifecycle remains `PLANNED`
  (`IMP036F_ARCHITECTURE_LOCKED: NO`; `IMP036F_IMPLEMENTATION_AUTHORIZED: NO`;
  `IMP036F_STARTED: NO`; `IMP036F_ACCEPTED: NO`; `IMP036F_FOUNDER_UAT_REQUIRED: YES`).
- Does **not** create a Product Definition on canonical main, pass Product Definition Gate, lock
  architecture, authorize/start implementation, or activate IMP-036G.
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged (PD-1 lastReviewed clarification only for
  pre-gate draft semantics).
- Supersedes GTM-R116.

### GTM-R116 — 2026-09-10

- ADVANCE / activate IMP-036F — Catalog, Menu, Pricing & Promotions Management as CURRENT product
  slice after accepted and reconciled IMP-036E (GTM-R115 / STATE-R113; base main
  `4c0ec4ffd9d614c9854b3d8747ebc566bdd713fc`).
- Sets `currentProductSlice = IMP-036F`; `pendingAcceptance = NONE`; `nextProductSlice = IMP-036G`.
- Preserves `acceptedThrough = IMP-036E`; IMP-036E remains `COMPLETE_AND_ACCEPTED`.
- Records `IMP036F_ACTIVATED: YES` while formal IMP-036F ROADMAP lifecycle remains `PLANNED`
  (`IMP036F_ARCHITECTURE_LOCKED: NO`; `IMP036F_IMPLEMENTATION_AUTHORIZED: NO`;
  `IMP036F_STARTED: NO`; `IMP036F_ACCEPTED: NO`; `IMP036F_PRODUCT_DEFINITION: NOT_CREATED`;
  `IMP036F_FOUNDER_UAT_REQUIRED: YES`).
- PD-1 applies prospectively; does **not** create Product Definition, pass Product Definition Gate,
  lock architecture, authorize/start implementation, or activate IMP-036G.
- ARCH-R19 / DR-15 / PD-1 / TEST-1 / VISION-1 unchanged.
- Supersedes GTM-R115.

### GTM-R115 — 2026-09-10

- Formal acceptance of IMP-036E — Store Operations Management after Founder UAT PASS.
- Accepted UAT product candidate remains `05c534bac3d077f5ab89928495568bb63faf78df` / tree
  `55b28977ee9860c2c07cb25f751c9f48ef4a2aa6` (PR #135). Governance reconciliation is not a new
  product candidate.
- Advances `acceptedThrough = IMP-036E`; sets `currentProductSlice = NONE` and
  `pendingAcceptance = NONE`; preserves `nextProductSlice = IMP-036F`.
- Records `IMP-036E: COMPLETE_AND_ACCEPTED`; `IMP-036E_ACCEPTED: YES`; `IMP-036E_FOUNDER_UAT: PASS`;
  `IMP036E_FORMAL_ACCEPTANCE: ACCEPTED`; `IMP036E_INDEPENDENT_ACCEPTANCE_EVIDENCE: ACCEPTED`.
- Preserves implementation/review SHAs distinct from the accepted UAT candidate.
- Preserves intermediate Founder-staging candidate `e9821271…` as historical staging evidence only.
- Preserves initial paused-state Serviceability observation and post-Resume recovery PASS on the
  same accepted candidate.
- IMP-036F remains `PLANNED` / `NOT_ACTIVATED` / `NOT_AUTHORIZED` / `NOT_STARTED`
  (`IMP036F_ACTIVATED: NO`). No ADVANCE.
- ARCH-R19 / DR-15 / D-374 / ARCH-R20 unchanged (no new binding semantics).
- Supersedes GTM-R114.

### GTM-R114 — 2026-09-07

- `CANONICAL_AUTHORITY_CONTEXT_COMPRESSION_ONLY`.
- Creates exact historical snapshot
  [`history/ROADMAP-GTM-R113-pre-compression.md`](./history/ROADMAP-GTM-R113-pre-compression.md)
  from source commit `33a226a18e4e9428c07233990d026541418f0860` (blob
  `35a58c93095713c173f0b1e455125bd6854a34b8`).
- Compresses CURRENT ROADMAP hot context. No product lifecycle change.
- Preserves `acceptedThrough = IMP-036D`; `currentProductSlice = IMP-036E`;
  `pendingAcceptance = IMP-036E`; `nextProductSlice = IMP-036F`.
- IMP-036E remains `IMPLEMENTATION_COMPLETE_PENDING_ACCEPTANCE` / `IMP-036E_ACCEPTED: NO` /
  Founder UAT `NOT_STARTED`.
- IMP-036F remains `PLANNED` / `NOT_ACTIVATED` / `NOT_AUTHORIZED` / `NOT_STARTED`.
- Supersedes GTM-R113 for CURRENT authority presentation only.

## 10. Authority Boundaries

| Question | Authority |
|---|---|
| IMP identity / sequence / GTM boundary | **This document (`ROADMAP.md`)** |
| Accepted reality | [`STATE.md`](./STATE.md) |
| Historical ROADMAP evidence | [`history/ROADMAP-GTM-R113-pre-compression.md`](./history/ROADMAP-GTM-R113-pre-compression.md) |
| Product purpose / Non-Goals | [`VISION.md`](./VISION.md) |
| Durable architecture | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Binding decisions | [`decision-register.md`](./decision-register.md) |
| IMP-036E capability architecture | [`capabilities/IMP-036E-store-operations-management.md`](./capabilities/IMP-036E-store-operations-management.md) |
| IMP-036D capability architecture | [`capabilities/IMP-036D-workforce-franchise-operations-v2.md`](./capabilities/IMP-036D-workforce-franchise-operations-v2.md) |

Operating lifecycle:

```text
ANCHOR → GATE → EXECUTE → PROVE → ACCEPT → RECONCILE → ADVANCE
```

The CLOSED IMP-026 → IMP-028 continuation exception does not apply automatically to unrelated
future slices. Current lifecycle is owned by CURRENT metadata above.
