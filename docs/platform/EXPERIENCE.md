<!-- governance-meta
{
  "status": "CURRENT",
  "authority": "EXPERIENCE_DELIVERY_STANDARD",
  "version": "EXP-1",
  "approved": "2026-09-28",
  "lastReviewed": "2026-09-28"
}
-->

# Experience Delivery Standard

EXP-1 owns how a human experiences an approved product capability. It does not own product
entitlement, business rules, technical architecture, or proof policy.

| Question | Authority |
|---|---|
| Product entitlement and observable behaviour | Product Definition |
| Experience intent, interaction, and measurement hypotheses | This document and the per-capability Experience Definition |
| How approved Product + Experience fit technical authority | Architecture Fit |
| Implementation-ready interaction/presentation | Design Readiness |
| Customer and operator words | [`PRODUCT-LANGUAGE.md`](./PRODUCT-LANGUAGE.md) (LANG-1) |
| How behaviour is proven | [`TESTING.md`](./TESTING.md) (TEST-1) |
| Process order | [`PRODUCT-DELIVERY.md`](./PRODUCT-DELIVERY.md) (PD-2) |

```text
EXPERIENCE_STANDARD = EXP-1
APPROVED = 2026-09-28
HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
RAW_BACKEND_LANGUAGE_TO_CUSTOMER = PROHIBITED
```

Historical accepted capabilities are not reopened to gain Experience Definitions. Supporting material
under [`experience/`](./experience/README.md) remains source and reference material. It is not this
authority.

## Authority boundary

Experience MUST NOT silently alter Product Definition. Architecture MUST NOT silently weaken Product
or Experience. Implementation MUST NOT invent either. A material conflict is `STOP` /
`DECISION_REQUIRED`.

```text
DOMAIN LANGUAGE → PRESENTATION SEMANTICS → CUSTOMER / OPERATOR LANGUAGE
```

Presentation rules live in LANG-1. Domain names stay domain authority.

## Experience Intent

Every applicable Experience Definition states Experience Intent: who is helped, what they are trying
to accomplish, what they should understand, and what emotional or trust outcome is intended. Intent
is not a screen list and is not a substitute for product entitlement.

## Experience Criticality

Experience Criticality is orthogonal to Change Risk (`CR0`–`CR3`) and orthogonal to agent execution
risk (`R0`–`R3` in `AGENTS.md`).

```text
X0 = no meaningful human interaction
X1 = simple internal / workforce interaction
X2 = material human workflow
X3 = customer, conversion, money, trust, identity, or critical human journey

X_SCALE_ORTHOGONAL_TO_CR_SCALE = YES
X_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
```

| Class | Experience obligation |
|---|---|
| X0 | Experience Definition may be `N/A` with a reason. Do not invent ceremony. |
| X1 | Experience requirements may stay lightweight and embedded. An Experience Gate may be `N/A` with a reason. |
| X2 | Separate Experience Definition, Experience Gate, and Design Readiness are required. |
| X3 | Full Experience Definition, Experience Gate, friction audit, content design, service blueprint where an operational promise exists, Design Readiness, measurement intent, Experience QA, Content QA, accessibility/responsive QA, and Founder Experience UAT where Founder UAT applies. |

Low experience criticality does not mean low technical or business risk.

## Required experience considerations

An applicable Experience Definition covers:

- user goals and user questions
- current-state experience evidence
- desired journey
- discoverability and entry
- information architecture
- information hierarchy
- mental model
- cognitive load
- friction audit
- necessary friction, protective friction, and accidental friction
- conversion and drop-off hypotheses
- trust and reassurance
- service / operational blueprint where a real-world promise exists
- content design and the LANG-1 dependency
- error and recovery experience
- responsive and mobile behaviour
- accessibility
- perceived performance
- design-system reuse
- research and evidence classification
- assumption and hypothesis register
- measurement intent
- analytics requirements
- experimentation discipline

## Research and evidence classification

Name the evidence class exactly. Do not upgrade it.

| Class | Meaning |
|---|---|
| `FOUNDER_HEURISTIC_REVIEW` | Founder judgment. Not customer research. |
| `INTERNAL_USABILITY_REVIEW` | Internal review. Not customer research. |
| `CUSTOMER_USABILITY_RESEARCH` | Research with customers. |
| `PRODUCTION_BEHAVIOURAL_DATA` | Observational production behaviour. Not causal experiment evidence. |
| `CONTROLLED_EXPERIMENT` | A designed experiment with assignment, control, and an interpretation rule. |

## Assumption and evidence register

Material X2/X3 assumptions are classified as one of:

```text
FACT | SUPPORTED_EVIDENCE | ASSUMPTION | HYPOTHESIS | PRODUCT_DECISION
```

Record assumption, evidence, risk, and validation path. Do not turn an assumption into a product
fact. Example assumption: a prominent coupon field may encourage people to leave and search for a
code elsewhere. That remains an assumption until evidence or an explicit product decision says
otherwise.

## Friction

Classify friction before removing or adding it:

- **Necessary** — required to complete the real task.
- **Protective** — required to prevent harm, error, or an unintended money, identity, or privacy
  consequence.
- **Accidental** — cost without a corresponding product, safety, or trust reason.

Protective friction on money, identity, and destructive actions is not accidental friction.

## Service and operational blueprint

When a customer promise depends on real-world operations, align:

```text
CUSTOMER PROMISE
↕
SYSTEM TRUTH
↕
WORKFORCE ACTION
↕
OPERATIONAL CAPABILITY
```

Examples include pickup readiness, scheduled windows, delivery status, cancellation, and refund
timing. The experience must not promise certainty the system or operation cannot support.

## Experience Gate

The Experience Gate answers: do we understand the intended experience? It occurs before Architecture
Fit may finally `PASS`, lock, or be persisted for X2/X3. It is not Design Readiness and it is not
implementation authorization.

```text
EXPERIENCE_GATE
Experience Intent defined:
User goal understood:
Entry / discoverability defined:
End-to-end journey defined:
Information architecture defined:
Information hierarchy defined:
Primary interaction defined:
Mental model / cognitive load considered:
Friction reviewed:
Trust-sensitive moments considered:
Content strategy defined:
Error / recovery defined:
Mobile / responsive defined:
Accessibility considered:
Service / operational promise aligned where applicable:
Performance experience considered:
Measurement intent defined:
Research / evidence level disclosed:
Unresolved experience decisions: NONE
Result: PASS | STOP
```

`N/A` is allowed only where Experience Criticality permits it, with a reason. For X2/X3,
Architecture Fit must not finally `PASS` or lock without Experience Gate `PASS`.

```text
X2_X3_ARCHITECTURE_FIT_REQUIRES_EXPERIENCE_GATE_PASS = YES
X3_EXPERIENCE_DEFINITION = REQUIRED
X0_EXPERIENCE_DEFINITION_MAY_BE_NA = YES
```

## Design Readiness

Design Readiness answers: is the implementable design complete enough to build? It occurs after
Architecture Fit has established viable technical boundaries and before implementation
authorization. "A developer can work it out" does not satisfy it. Figma is not mandatory. An
implementation-ready annotated specification or prototype may satisfy it.

For X2/X3, applicable states and rules include: complete user flow; default/ready; loading;
empty/first-use; success; validation failure; unavailable/stale; server/network failure; recovery;
disabled; destructive confirmation; concurrency/conflict presentation; desktop; mobile; responsive
breakpoints and behaviour; content and microcopy; keyboard and focus; accessibility semantics;
interaction rules; perceived-performance states; design-system components and patterns; analytics
hooks and events.

Prefer this order: reuse an existing pattern or component, extend it intentionally, and create a
new reusable pattern only with a reason. Do not invent a new button, modal, toast, card, error,
loading treatment, spacing system, status treatment, or input for each capability without checking
existing design-system patterns.

## Experience QA and Founder Experience UAT

Experience QA asks whether the approved interaction was delivered and whether the journey is
coherent. Content QA asks whether language is intentional, correct, and free of backend leakage.
These are evidence dimensions under TEST-1, not automatic extra ceremonies.

Where Founder UAT applies, it is functional UAT plus experience UAT. Experience UAT considers
discoverability, first impression, hesitation, clarity, trust, friction, recovery, content, mobile
behaviour, brand coherence, and Experience Intent. Only the Founder supplies the Founder UAT
verdict.

## Measurement intent

For X3, measurement intent is required before implementation authorization. It states business
intent, primary metric, secondary metrics, guardrails, required events, baseline where available,
observation window and interpretation rule, success and failure learning signals, and known causal
limitations. Measurement does not replace acceptance.

Analytics events that matter use the data contract in PD-2: meaning, trigger, owner, required
attributes, forbidden PII, identity semantics, deduplication, schema and version, source of truth,
validation, and retention or privacy boundary. Do not collect data because it might be useful. Do
not put private eligibility, payment, or security facts in analytics unless explicitly authorized
and necessary.

## Experimentation

A controlled experiment, before launch, needs a hypothesis, assignment unit, population, control,
variant, primary metric, guardrails, observation rule, stop condition, and interpretation rule.
Insufficient traffic or evidence is `INSUFFICIENT_EVIDENCE`, not a winner. Experiments cannot waive
security, privacy, financial truth, authorization, legal requirements, or accessibility minimums.
Acceptance stays separate from experiment outcome.

## Trust and dark patterns

Intentionally deceptive patterns are prohibited, including fake scarcity, false countdowns,
misleading savings, hidden mandatory charges, obscured cancellation, forced continuity, preselected
paid extras without explicit intent, and misleading action hierarchy.

## Post-release learning

After production release and bounded post-release verification, observe, measure, and experiment
only inside the measurement plan and experiment rules. Production release is not proof that the
experience works. Learning feeds a new discovery; it does not silently change accepted product
behaviour.

## Pre-GTM audit and experience debt

Before public GTM / IMP-040 acceptance, perform
`PRE_GTM_CUSTOMER_EXPERIENCE_PRODUCT_LANGUAGE_AND_INSTRUMENTATION_AUDIT`. It covers at least Home,
Menu, Customization, Cart, Offers, Checkout, Payment, Delivery/Pickup, Scheduled ordering, My
Orders, Cancellation, Refund, Authentication, Errors/recovery, Mobile/responsive, Accessibility,
performance perception, product language, operational promise integrity, and
analytics/measurement readiness.

Findings go to [`EXPERIENCE-DEBT-REGISTER.md`](./EXPERIENCE-DEBT-REGISTER.md) with severity,
journey, problem, evidence, impact, recommended change, priority, and disposition. The audit does
not reopen historically accepted capabilities.

## Experience requirement identifier

A genuinely testable experience requirement may use `XR-<IMP>-NNN`. `XR` is optional. It is not a
pull request. Traceability remains:

```text
OUTCOME → JOURNEY → US → BR / XR → AC → ARCHITECTURE FIT → TEST / EVIDENCE → UAT → METRIC / EXPERIMENT
```
