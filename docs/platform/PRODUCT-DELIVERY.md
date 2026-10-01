<!-- governance-meta
{
  "status": "CURRENT",
  "authority": "PRODUCT_DELIVERY_PROCESS",
  "version": "PD-2",
  "effectiveFrom": "IMP-036F",
  "lastReviewed": "2026-10-01",
  "supersedes": "PD-1"
}
-->

# Product Delivery Operating Model

## Authority and prospective application

**USER OUTCOME FIRST.** This document owns how product work is defined and delivered. It does not
own roadmap sequence, accepted state, architecture, binding decisions, experience presentation
detail, product language, or proof technique.

| Question | Authority |
|---|---|
| Why | [`VISION.md`](./VISION.md) |
| Identity, sequence, lifecycle | [`ROADMAP.md`](./ROADMAP.md) |
| Accepted and current reality | [`STATE.md`](./STATE.md) |
| Product entitlement and observable behaviour | [`product/`](./product/README.md) Product Definition |
| Experience intent and interaction | [`EXPERIENCE.md`](./EXPERIENCE.md) (EXP-1) |
| Customer and operator language | [`PRODUCT-LANGUAGE.md`](./PRODUCT-LANGUAGE.md) (LANG-1) |
| Technical invariants | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Binding decisions | [`decision-register.md`](./decision-register.md) |
| How behaviour is proven | [`TESTING.md`](./TESTING.md) (TEST-1) |
| Agent execution | [`AGENTS.md`](../../AGENTS.md) |

```text
PRODUCT_DELIVERY_PROCESS = PD-2
PRODUCT_DELIVERY_PROCESS_EFFECTIVE_FROM = IMP-036F
PD2_ADOPTED = 2026-09-28
PD2_FIRST_TRANSITION_SLICE = IMP-036J
PD1_REMAINS_HISTORICAL_PROCESS_FOR_ACCEPTED_WORK = YES
HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
IMP036E_LIFECYCLE_CHANGED = NO
PD1_DID_NOT_ACTIVATE_IMP036F_AT_ADOPTION = YES
EXPERIENCE_STANDARD = EXP-1
PRODUCT_LANGUAGE_STANDARD = LANG-1
TESTING_AUTHORITY = TEST-1
RAW_BACKEND_LANGUAGE_TO_CUSTOMER = PROHIBITED
```

PD-2 is prospective. Accepted IMPs stay accepted. PD-2 does not rewrite their lifecycle and does
not require historical Experience Definitions. PD-1 did not itself activate IMP-036F. Current
activation truth remains [`ROADMAP.md`](./ROADMAP.md) / [`STATE.md`](./STATE.md). Engineering-only
changes with no product behaviour change may remain specification-driven.

These phases and gates are **process** phases. They are not automatically new ROADMAP lifecycle
states. A phase transition never grants push, PR, merge, or deployment authority.

## Canonical lifecycle

```text
ANCHOR
→ REQUIREMENT / OPPORTUNITY INTAKE
→ DISCOVERY
→ EXPERIENCE STRATEGY
→ JOURNEY + STORY MAP
→ PRODUCT DEFINITION + EXPERIENCE DEFINITION
→ PRODUCT DEFINITION GATE + EXPERIENCE GATE
→ ARCHITECTURE FIT
→ ARCHITECTURE LOCK
→ DESIGN READINESS
   + QUALITY / TEST PLAN FINALIZATION
   + MEASUREMENT / INSTRUMENTATION PLAN FINALIZATION
→ IMPLEMENTATION PLAN
→ IMPLEMENTATION AUTHORIZATION
→ SMALL IMPLEMENTATION TRANCHES
→ CONTINUOUS MACHINE PROOF
→ FUNCTIONAL QA
   + EXPERIENCE QA
   + CONTENT QA
   + ACCESSIBILITY / RESPONSIVE QA
   + PERFORMANCE / SECURITY QA
→ INDEPENDENT IMPLEMENTATION REVIEW
→ STAGING RELEASE CANDIDATE
→ FOUNDER UAT
   FUNCTIONAL UAT
   EXPERIENCE UAT
→ FORMAL ACCEPTANCE
→ PRODUCTION READINESS GATE
→ PRODUCTION RELEASE
→ POST-RELEASE VERIFICATION
→ OBSERVE / MEASURE / EXPERIMENT
→ LEARN / NEW DISCOVERY
→ RECONCILE
→ ADVANCE
```

| Phase or gate | Required result |
|---|---|
| ANCHOR | Verify repository candidate, canonical versions, current slice, dependencies, and authorized scope. |
| REQUIREMENT / OPPORTUNITY INTAKE | Record the opportunity, the person affected, and why it is in or out of the current slice. |
| DISCOVERY | Establish outcome, personas, current evidence, and material questions. |
| EXPERIENCE STRATEGY | For applicable X2/X3 work, state Experience Intent before treating screens as the product. X0/X1 may record a lightweight reason instead. |
| JOURNEY + STORY MAP | Map journeys, activities, and stories. Classify every identified possibility. |
| PRODUCT DEFINITION + EXPERIENCE DEFINITION | Persist product behaviour and, where required, experience behaviour as separate authorities. |
| PRODUCT DEFINITION GATE + EXPERIENCE GATE | Product behaviour is complete. For X2/X3 the intended experience is understood. Either gate may `STOP`. |
| ARCHITECTURE FIT | Show how approved Product and Experience fit existing technical authority. |
| ARCHITECTURE LOCK | Persist required capability architecture before implementation. |
| DESIGN READINESS | Implementation-ready interaction and presentation for X2/X3. |
| QUALITY / TEST PLAN FINALIZATION | Expected proof for mandatory behaviour and risks, under TEST-1. |
| MEASUREMENT / INSTRUMENTATION PLAN FINALIZATION | For X3, how the real-world outcome will be observed. |
| IMPLEMENTATION PLAN | Small tranches inside the authorized slice. |
| IMPLEMENTATION AUTHORIZATION | Human or explicit task authority to build. Not implied by earlier gates. |
| SMALL IMPLEMENTATION TRANCHES | Build only authorized scope. |
| CONTINUOUS MACHINE PROOF | Preserve failing and passing machine evidence under TEST-1. |
| FUNCTIONAL QA | Approved behaviour works. |
| EXPERIENCE QA | Approved interaction was delivered and the journey is coherent. |
| CONTENT QA | Language is intentional, correct, and free of backend leakage. |
| ACCESSIBILITY / RESPONSIVE QA | Keyboard, semantics, and supported viewports behave as specified. |
| PERFORMANCE / SECURITY QA | Applied where the Quality Attribute Profile or CR level requires it. |
| INDEPENDENT IMPLEMENTATION REVIEW | Independent review of the slice, architecture, and evidence. |
| STAGING RELEASE CANDIDATE | Exact candidate prepared for Founder UAT under AGENTS provenance. |
| FOUNDER UAT | Functional UAT and, where Founder UAT applies, Experience UAT. Only the Founder gives the verdict. |
| FORMAL ACCEPTANCE | Applicable independent acceptance and founder verdicts. |
| PRODUCTION READINESS GATE | Release risks below are assessed. Missing controls are blockers, not implied readiness. |
| PRODUCTION RELEASE | Release the accepted candidate through existing release authority. |
| POST-RELEASE VERIFICATION | Bounded production checks. Release is not proof of successful operation. |
| OBSERVE / MEASURE / EXPERIMENT | Watch the measurement plan. Do not treat observation as acceptance. |
| LEARN / NEW DISCOVERY | Feed learning into a new intake. Do not silently change accepted behaviour. |
| RECONCILE | Update applicable canonical records and run `npm run project:consistency`. |
| ADVANCE | Proceed only when reconciliation and the next slice's gates permit it. |

## Separate authorities

**Product Definition** owns product entitlement, customer and operator capability, business rules,
eligibility, constraints, supported and denied outcomes, acceptance behaviour, non-goals, and
product decisions.

**Experience Definition** owns Experience Intent, discovery, information architecture, interaction
model, information hierarchy, cognitive load, friction, customer mental model, content and
language, recovery experience, emotional and trust intent, responsive interaction, design-system
application, and experience measurement hypotheses. Standard: EXP-1. Template:
[`experience-definition-template.md`](./product/templates/experience-definition-template.md).

**Architecture Fit** owns how approved Product and Experience fit safely into technical authority.
It must not invent missing product behaviour or silently weaken Experience.

**Design Readiness** owns the final implementation-ready interaction and presentation
specification. It comes after Architecture Fit and before implementation authorization.

**Quality / Test Plan** owns how required behaviour and risk will be proven. TEST-1 remains the
verification policy.

**Measurement Plan** owns how the intended real-world outcome will be observed. It does not replace
acceptance.

Experience MUST NOT silently alter Product Definition. Architecture MUST NOT silently weaken
Product or Experience. Implementation MUST NOT invent either. Material conflict: `STOP` /
`DECISION_REQUIRED`.

## Experience Criticality and Change Risk

```text
X0 = no meaningful human interaction
X1 = simple internal / workforce interaction
X2 = material human workflow
X3 = customer, conversion, money, trust, identity, or critical human journey

CR0 = STANDARD
CR1 = ELEVATED
CR2 = HIGH
CR3 = CRITICAL
CHANGE_RISK = CR
CR_SCALE = CR0 | CR1 | CR2 | CR3
AGENTS_EXECUTION_RISK_SCALE = R0 | R1 | R2 | R3
CR_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
X_SCALE_ORTHOGONAL_TO_CR_SCALE = YES
X_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
```

Do not reuse AGENTS `R0`–`R3` as the feature or change delivery scale. Do not map a CR value onto
an R value. Examples: an admin copy label may be X1/CR0; a menu filter may be X3/CR0 or CR1;
scheduled ordering may be X3/CR2; promotions and pricing may be X3/CR2; checkout, payment, refund
calculation, and auth/session may be X3/CR3; a background security fix may be X0/CR3.

Change Risk considers money, payment, refunds, authentication, authorization, personal data,
persistence and data loss, schema migration, concurrency, customer promise, operational
disruption, security, irreversible consequence, and release or rollback complexity. X and CR
together set rigor. Low experience criticality does not mean low technical or business risk.

```text
X2_X3_ARCHITECTURE_FIT_REQUIRES_EXPERIENCE_GATE_PASS = YES
X3_EXPERIENCE_DEFINITION = REQUIRED
X2_EXPERIENCE_DEFINITION = REQUIRED
X0_EXPERIENCE_DEFINITION_MAY_BE_NA = YES
X2_X3_IMPLEMENTATION_REQUIRES_DESIGN_READINESS_PASS = YES
```

For X2/X3, Architecture Fit must not finally `PASS`, lock, or be persisted without Experience Gate
`PASS`. Implementation authorization additionally requires Design Readiness `PASS`, a finalized
Quality/Test Plan, and, for X3, a finalized Measurement/Instrumentation Plan.

## Outcome hierarchy

```text
BUSINESS OUTCOME → PERSONA → JOURNEY → ACTIVITY → USER STORY → ACCEPTANCE SCENARIO
→ ARCHITECTURE FIT → IMPLEMENTATION → TEST EVIDENCE → FOUNDER UAT → ACCEPTANCE
```

Optional testable experience requirements use `XR-<IMP>-NNN`. `XR` is not a pull request.

```text
OUTCOME → PERSONA → JOURNEY → US → BR / XR → AC
→ ARCHITECTURE FIT → TEST / EVIDENCE → UAT → METRIC / EXPERIMENT
```

`XR` is not mandatory for every sentence. Avoid identifier bureaucracy.

Begin with the business outcome and the person's job. Personas are not roles, permissions, or
authorization. Map vertical slices that deliver an observable outcome. Do not expand the authorized
capability to finish unrelated journeys.

## Product Definition and scenarios

Use the [product template](./product/templates/product-definition-template.md). Product approval
does not authorize implementation or supersede architecture. Acceptance scenarios stay observable.
When product behaviour changes materially, version the definition and revisit the product gate.

## Product Definition Gate

A pre-gate draft is not approved.

```text
PRODUCT_DEFINITION_GATE
Capability:
Product Definition Version:
Experience Criticality:
Change Risk:
Linked Experience Definition:
Business Outcome:
Primary Personas:
Journeys Defined:
Story Map Complete:
Acceptance Slice Defined:
Happy Paths Defined:
Alternate Paths Defined:
Empty / First-Use States Defined:
Error / Recovery Paths Defined:
Authorization Variants Defined:
Cross-Scope Scenarios Defined:
Concurrency Considered:
Destructive Actions Defined:
Service / operational impact:
Quality Attribute Profile:
Unresolved Product Decisions:
Architecture Conflicts:
PRODUCT_DEFINITION_GATE_EXECUTION: NOT_PERFORMED | PERFORMED
Gate Result: NOT_PERFORMED | PASS | STOP
```

`NOT_PERFORMED` means no evaluation has occurred. After execution the result is `PASS` or `STOP`.
Product-gate PASS does not substitute for Experience Gate, Architecture Fit, or implementation
authorization.

## Experience Gate and Design Readiness

The Experience Gate asks whether the intended experience is understood. Design Readiness asks
whether the implementable design is complete enough to build. Do not conflate them. Rules and
checklists are in [`EXPERIENCE.md`](./EXPERIENCE.md).

## Quality Attribute Profile

For substantial work, mark each attribute `REQUIRED` or `N/A` with a reason:

performance, availability, reliability, resilience, security, privacy, accessibility,
responsive/device support, scalability, concurrency, data integrity, observability,
supportability, backward compatibility, localization/presentation.

They are not separate gates. They feed Architecture Fit, the Quality Plan, QA, and Production
Readiness.

## Security, privacy, and abuse overlay

For CR2/CR3 or abuse-sensitive work, review honest-user behaviour, malicious-user behaviour,
unauthorized workforce behaviour, replay, enumeration, forgery, financial abuse, identity abuse,
race or cap bypass, information leakage, and privacy/PII. This is a required risk review inside
existing security authority. It does not create a new security architecture authority.

## Quality and test plan

Before implementation authorization, record expected proof for mandatory product acceptance
scenarios, experience requirements, security and authorization, persistence, concurrency, recovery,
accessibility, responsive behaviour, content, and performance where applicable. TEST-1 remains
canonical. Acceptance-scenario proof outranks a raw coverage percentage.

## Measurement, analytics, and experiments

For X3, before implementation authorization record business intent, primary metric, secondary
metrics, guardrails, required events or signals, baseline where available, observation window and
interpretation rule, success and failure learning signal, and known causal limitations.

A material analytics event defines event meaning, trigger, owner, required attributes, forbidden
PII, identity semantics, deduplication, schema and version, source of truth, validation, and
retention or privacy boundary. Do not collect data because it might be useful. No private
eligibility, payment, or security facts in analytics unless explicitly authorized and necessary.

A controlled experiment needs, before launch, a hypothesis, assignment unit, population, control,
variant, primary metric, guardrails, observation rule, stop condition, and interpretation rule.
Insufficient evidence is `INSUFFICIENT_EVIDENCE`, not a winner. Acceptance stays separate from
measurement and from experiment outcome. Experiments cannot waive security, privacy, financial
truth, authorization, legal requirements, or accessibility minimums.

## QA evidence

Distinguish functional QA, experience QA, content QA, accessibility/responsive QA, and, where
applicable, performance QA and security/abuse QA. These are evidence dimensions. They are not
automatically separate manual ceremonies.

## Production Readiness Gate

`PRODUCTION_READINESS_GATE` sits after Formal Acceptance and before Production Release. Where
applicable assess accepted candidate identity, artifact or container identity, schema and migration
readiness, configuration readiness, backward compatibility, rollback, feature flag or kill switch
if available or required, monitoring, alerts, capacity and performance, support and runbook, known
limitations, smoke procedure, analytics readiness, incident recovery, and release sequencing.

This process does not implement release infrastructure. If a required control does not exist,
record the blocker or dependency. Do not claim readiness that is absent.

Target: promote the accepted staging candidate as the same immutable release artifact or digest
where the authorized release architecture supports it. Do not silently rebuild a materially
different artifact for production. Exact release mechanics stay with existing or future release
authority.

```text
GITHUB_MAIN_BRANCH_PROTECTION = ABSENT
BRANCH_PROTECTION_ENFORCEMENT = OPERATIONAL_PROCESS_CONTROL_GAP
PD2_REQUIRES_CI_CODEQL_MACHINE_EVIDENCE_BEFORE_MERGE = YES
```

PD-2 requires CI, CodeQL, and other required machine evidence before merge as process authority.
GitHub branch protection on `main` was absent on 2026-09-28 (`Branch not protected`). This document
does not mutate repository administration. Do not claim GitHub enforces those checks while that gap
remains.

## Post-release verification

After production release, perform bounded checks such as deployment health, migration result, core
smoke journey, error rate, latency, payment and order health, analytics flow, and support signal,
as applicable. Then enter observe / measure / experiment.

## Deprecation and cleanup

Temporary constructs should carry a removal condition where practical: feature flags, experiment
variants, compatibility code, temporary APIs, deprecated fields, obsolete UI, analytics events, and
migration shims. After the experiment or transition, persist the chosen behaviour, remove the
obsolete path, remove the stale flag, remove unused analytics, and update docs and tests. Do not
leave a permanent temporary branch by default.

## Controlled exception path

An emergency, security, or incident exception is governed. It is not permission to ignore
authority. Record exception type, reason, risk, skipped gate(s), human authority where required,
minimum proof, rollback or recovery, and mandatory reconciliation.

## Definition of Ready

A story may enter implementation only when applicable fields are known: story identity, acceptance
scenarios, business rules, experience requirements where X2/X3 applies, permissions, data and
security implications, architecture fit, Design Readiness, quality plan, and measurement intent
where required. Open material decisions = NONE. Otherwise the story is
`NOT_READY_FOR_IMPLEMENTATION`, a readiness result, not a ROADMAP state.

## Journey completeness and UX states

Every Product Definition assesses each row below, mapped to stories, acceptance scenarios, explicit
deferrals, or `N/A` with a reason.

| Dimension | Required consideration |
|---|---|
| ENTRY | How the person starts, including direct links. |
| DISCOVERY | How they find the action or information. |
| CONTEXT | Identity, outlet/resource selection, and retained context. |
| EMPTY / FIRST USE | No existing data and initial setup. |
| HAPPY PATH | Expected successful outcome. |
| ALTERNATE VALID PATHS | Other supported ways to achieve it. |
| VALIDATION FAILURE | Invalid input and actionable correction. |
| AUTHORIZATION | Material allow/deny and cross-scope variants. |
| NOT FOUND / STALE REFERENCE | Missing, removed, or inaccessible context. |
| SERVER / NETWORK ERROR | Clear failure without false success. |
| RECOVERY | Retry, resume, or reconciliation allowed by existing authority. |
| CONCURRENCY | Competing changes, stale state, and duplicate actions. |
| DESTRUCTIVE ACTION | Confirmation, consequences, and cancellation of the action. |
| SUCCESS FEEDBACK | Visible confirmation and next action. |
| DOWNSTREAM EFFECT | Consequences for related capabilities and people. |
| REVISIT / RELOAD | Durable results and safe restoration of context. |
| RESPONSIVE / MOBILE | Applicable screen sizes and input conditions. |
| ACCESSIBILITY | Keyboard, focus, names, announcements, and usable feedback. |

Interaction detail beyond observable behaviour belongs in the Experience Definition and Design
Readiness, not as a silent rewrite of product rules.

## Slicing and explicit deferrals

| Classification | Meaning |
|---|---|
| V1_ACCEPTANCE_SLICE | Mandatory stories and scenarios for this capability's acceptance. |
| FOLLOW_UP | Later increment; needs its own authorized scope. |
| DEFERRED | Outside this acceptance slice; no implicit schedule. |

| Disposition | Required record |
|---|---|
| SUPPORTED_NOW | Defined support in the current slice, with story or evidence. Not an acceptance claim by itself. |
| EXPLICITLY_DEFERRED | What is excluded, why, impact, and revisit owner. |
| NOT_SUPPORTED_BY_DESIGN | Explicit product rationale and authority. |
| UNRESOLVED_DECISION_REQUIRED | Question, impact, and human decision owner. |

## Definition of Done

A story is complete only when applicable evidence shows implementation of every mandatory
acceptance scenario, required experience and content proof, authorization, persistence, recovery,
concurrency where relevant, accessibility and responsive proof, affected Golden Journeys, and
updated traceability. `STORY_COMPLETE != IMP_ACCEPTED`.

## Pre-GTM experience audit

Before public GTM / IMP-040 acceptance, perform
`PRE_GTM_CUSTOMER_EXPERIENCE_PRODUCT_LANGUAGE_AND_INSTRUMENTATION_AUDIT` under EXP-1. Findings go
to the Experience Debt Register. The audit does not reopen historical acceptance. PD-1's Journey
Gap Audit requirement is expanded by this audit, not discarded. The audit is not performed by
adopting PD-2.

## IMP-036J transition

IMP-036J is the first current X3 capability transitioning into PD-2. Experience Definition and
Experience Gate were not performed under PD-1. The current transition is authorized and has not
started:

```text
PRODUCT_DEFINITION = PD-IMP-036J-DRAFT-6 APPROVED / PASS
EXPERIENCE_DEFINITION = XD-IMP-036J-DRAFT-6 APPROVED / PASS
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
ARCHITECTURE_SOURCE = IMP-036J-FIT-CANDIDATE-9
DESIGN_READINESS = PASS
QUALITY_TEST_PLAN_FINALIZED = YES
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = YES
IMPLEMENTATION_PLAN = PASS
IMPLEMENTATION_PLAN_FINALIZED = YES
IMPLEMENTATION_AUTHORIZATION = APPROVED
IMPLEMENTATION_AUTHORIZED = YES
IMPLEMENTATION_STARTED = NO
IMPLEMENTATION_COMPLETE = NO
IMP036J_ACCEPTED = NO
NEXT_GATE = IMPLEMENTATION_TRANCHE_1
FORMAL_LIFECYCLE = ARCHITECTURE_LOCKED
```

Product Definition `PD-IMP-036J-DRAFT-6` is `APPROVED` and its Product Definition Gate is `PASS`.
Experience Definition `XD-IMP-036J-DRAFT-6` is `APPROVED` and Experience Gate is `PASS`.
Architecture Fit is `PASS` and architecture is locked on `IMP-036J-FIT-CANDIDATE-9`. Design
Readiness is `PASS`. The Quality/Test Plan and the Measurement/Instrumentation Plan are finalized.
The Implementation Plan is `PASS` and finalized. Implementation Authorization is `APPROVED`.
Implementation is authorized and has not started. Implementation is not complete, and IMP-036J is
not accepted. The next gate is `IMPLEMENTATION_TRANCHE_1`. Formal lifecycle is
`ARCHITECTURE_LOCKED`. Change Risk is recorded in ROADMAP/STATE and is not an AGENTS risk level.

## AI execution and documentation efficiency

**MINIMUM_SUFFICIENT_CONTEXT** means enough verified authority to perform and review the bounded
task, with no repeated unrelated history. Prompts should carry task and story IDs, exact authority
versions, SHA, tree, and working-tree fingerprint where required, acceptance criteria, affected
invariants, allowed and forbidden scope, and expected evidence.

First review covers the full relevant slice. Follow-up review covers previous approved SHA to new
SHA, changed files, affected invariants, and new evidence. Reports return changed facts, evidence,
exceptions, SHA or tree, and unresolved items.

Bundle authorized machine work until the next genuine human decision boundary. Context efficiency
never permits guessed product, security, payment, or business decisions.
