<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  RECORD: WXE-AMENDED-EXPERIENCE-GATE-RECORD-1
  DECISION_ID: FOUNDER-B5-WXE-XD
  APPLICATION_CODE_MUTATION: NO
  CANONICAL_LIFECYCLE_MUTATION: NO
-->

# Amended Experience Gate — Founder decision record

```text
RECORD_ID = WXE-AMENDED-EXPERIENCE-GATE-RECORD-1
PACKAGE = WXE-CANDIDATE-1
TASK = BOBA-B5-FOUNDER-GATES-GTM-CLOSURE-20261025
DECISION_ID = FOUNDER-B5-WXE-XD
CANDIDATE_ID = WXE-AMENDED-EXPERIENCE-GATE-CANDIDATE-1
CANDIDATE_DOCUMENT = 25-amended-experience-gate-candidate.md
XD_ID = XD-WXE-CANDIDATE-1
EXPERIENCE_CRITICALITY = X3 (package boundary; X2 workflows remain inside)
CHANGE_RISK = CR2
AMENDED_EXPERIENCE_GATE = PASS
EXPERIENCE_GATE_EXECUTION = PERFORMED
HISTORICAL_EXPERIENCE_GATE = PASS at 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89 (doc 15 §H2)
HISTORICAL_PASS_COVERS_OPTION_R = NO
HISTORICAL_PASS_RE_DATED = NO
OPTION_R_RATIFICATION = ALREADY_RECORDED (docs 16 and 17; not this gate)
ARCHITECTURE_FIT = NOT_GRANTED
ARCHITECTURE_LOCK = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
F-1_THROUGH_F-7 = SEPARATE_NEXT_FIT_DECISION_NOT_GRANTED
UPD-08_GAPS_1_TO_3 = UNRESOLVED_NOT_ACCEPTED_RISK
APPLICATION_CODE_MUTATION = NO
MERGES_TO_MAIN = NO
DEPLOY = NO
```

## 1. Purpose and authority boundary

This document records the Founder decision to **PASS**
`WXE-AMENDED-EXPERIENCE-GATE-CANDIDATE-1` for the scope in
[`25-amended-experience-gate-candidate.md`](./25-amended-experience-gate-candidate.md) §1 and
the corresponding documented scenarios in that file’s §2.

It is a recording artifact. It does not:

- re-date or extend the historical Experience Gate PASS in
  [`15-gate-disposition-founder-decision-record.md`](./15-gate-disposition-founder-decision-record.md)
  §H2, or claim that historical PASS covers Option R
- grant a new Product Definition Gate PASS
- grant Architecture Fit or Architecture Lock
- grant F-1 through F-7; those remain a separate next Fit decision
- grant Design Readiness, Quality or Measurement finalization, or Implementation Authorization
- allocate an IMP or change ROADMAP, STATE, ARCHITECTURE, or the decision register
- accept UPD-08 Delivery Gaps 1–3 as release risk
- merge this branch or deploy

Option R ratification is already recorded in docs 16 and 17. This gate is the amended
Experience Gate for that ratified presentation scope. Ratification itself is not re-decided
here.

## 2. Founder decision

```text
DECISION_ID = FOUNDER-B5-WXE-XD
AUTHORITY = Explicit Founder "proceed" on 2026-10-25 to record this PASS
DECISION_DATE = 2026-10-25
BATCH = BOBA-B5-FOUNDER-GATES-GTM-CLOSURE-20261025
CANDIDATE = WXE-AMENDED-EXPERIENCE-GATE-CANDIDATE-1
EVALUATED_PR = https://github.com/nivedhya11/BobaBear/pull/461
EVALUATED_HEAD = 9f8fb0efe466eb9c70984a3572daf80077463eca
RESULT = PASS
SCOPE = doc 25 §1 and the corresponding documented scenarios in doc 25 §2
EXPERIENCE_GATE_EXECUTION = PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
```

The evaluated head is the PR #461 head that contained the undecided candidate. The recording
commit on this branch is later and does not change that evaluated candidate identity.

### 2.1 Scope the PASS covers

| Recorded scope | Where it is written |
|---|---|
| Option R presentation, with ratification already recorded | Doc 25 header; docs 16 and 17. This PASS is the amended Experience Gate, not a second ratification. |
| Principal-wide permission-union visibility | Doc 25 §1 payload row. The predicate reads the existing `getAdminSession` union map. |
| Cross-grant Commercial navigation limitation | Doc 25 §1 cross-grant row. Accepted as a V1 presentation limitation. It is not a new authorization grant. |
| F-1 proposal: a commercial read plus `brand.read` | Doc 25 §1 Brand Commercial visibility row. |
| Store-only operability and AS-27 recovery | Doc 25 §1 store-only and direct Commercial URL rows; §2 WXE-AS-27. |
| Preserved Administration entry permissions | Doc 25 §1 Administration entry row. The twelve keys stay. Commercial-read keys are not added. |
| First-usable Operations landing | Doc 25 §1 store-only href rule and §2 WXE-AS-02. |
| Existing Scheduling capability discoverability | Doc 25 §1 Scheduling row. No new route, permission, service, or order state. |
| Desktop, responsive, and accessibility requirements already stated | Doc 25 §1 desktop row, §3.8, and §5. No new responsive rule is added by this record. |
| UOE ownership of shared Delivery / Takeaway and Now / Schedule language | Doc 25 §1 shared-labels row and §2 UPD-09 / WXE-AS-05. |

Corresponding documented scenarios in doc 25 §2: WXE-AS-01 / GJ-W8, WXE-AS-25, WXE-AS-26,
WXE-AS-27, WXE-AS-02, WXE-AS-11 / UPD-06, WXE-AS-13, UPD-03 B, S9 / WXE-PF-12, and
UPD-09 / WXE-AS-05.

### 2.2 What stays outside this PASS

- UPD-08 server Gaps 1–3 remain unresolved and are not accepted risks. PR #427 is not their fix.
- Architecture Lock for the X3 delivery-proof and cancellation journeys stays blocked on a
  separate security disposition of those gaps.
- Per-scope navigation, an outlet-scoped Brand Commercial editor, a new `brand.read` grant,
  Commercial section deep links (UPD-07), and a new scheduling authority stay outside this gate.
- F-1 through F-7 are not accepted by this PASS. Doc 24 remains the Fit packet.
- `ARCHITECTURE_FIT = NOT_GRANTED`. `ARCHITECTURE_LOCK = NOT_GRANTED`.
  `IMPLEMENTATION_AUTHORIZED = NO`.

## 3. Historical Experience Gate

Doc 15 §H2 and doc 03 §13 remain the historical Experience Gate PASS of 2026-10-24 at reviewed
contract head `560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89`. This record does not change their
date, result, or reviewed head. `HISTORICAL_PASS_COVERS_OPTION_R = NO`.

## 4. Independent review still required

This record does not grant an independent Product, Experience, or Security review. A reviewer
who is not the preparer and not the recording agent should check the exact head of the pull
request that contains this file:

1. Verdict is PASS of `FOUNDER-B5-WXE-XD` for doc 25 §1 and §2 only, evaluated at
   `9f8fb0efe466eb9c70984a3572daf80077463eca`.
2. Doc 15 §H2 is unchanged and is not claimed to cover Option R.
3. No sentence grants Architecture Fit, Architecture Lock, F-1 through F-7, Implementation
   Authorization, an IMP, or UPD-08 risk acceptance.
4. No application source, ROADMAP, STATE, ARCHITECTURE, or decision-register file changes in
   the recording commit.
5. The cross-grant limitation stays a presentation limitation of the existing union payload.

The reviewer returns their own verdict. This file does not contain one.

## 5. Alignment snapshot (recording agent)

```text
Repository Authority: VERIFIED remote nivedhya11/BobaBear
origin/main: a6155378b799e06a95b28c593ac1a340d7ca9245
Evaluated candidate: PR #461 @ 9f8fb0efe466eb9c70984a3572daf80077463eca
Vision Version: VISION-1
Roadmap Version: GTM-R190
State Version: STATE-R189
Architecture Version: ARCH-R23
Decision Register Version: DR-25
Product Delivery Version: PD-2
Experience Standard: EXP-1
Product Language: LANG-1
Product Definition: PD-WXE-CANDIDATE-1 (discovery candidate; not an accepted Product Definition)
Experience Definition: XD-WXE-CANDIDATE-1
Testing Policy: TEST-1
Accepted Through: IMP-036I
Current Product Slice: IMP-036J (pendingAcceptance)
Task Slice: FOUNDER-B5-WXE-XD documentation recording only
Risk Level: R3 for recording an already-specified Founder decision
DELIVERY_MODE: PUBLISH_PR
MERGE_TO_MAIN: NO
APPLICATION_CODE_MUTATION: NO
Gate Result (alignment for docs recording): PASS
PROMPT DEVIATIONS: NONE
```
