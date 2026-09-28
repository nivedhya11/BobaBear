# Experience Definition Template

Use with [`PRODUCT-DELIVERY.md`](../../PRODUCT-DELIVERY.md) (PD-2), [`EXPERIENCE.md`](../../EXPERIENCE.md)
(EXP-1), [`PRODUCT-LANGUAGE.md`](../../PRODUCT-LANGUAGE.md) (LANG-1), and the linked Product
Definition. Replace placeholders. `N/A` needs a reason allowed by Experience Criticality.

This artifact owns presentation and interaction experience. It does not change product entitlement.
If the experience would change observable product behaviour, stop and reopen the Product Definition.

```text
HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
X_SCALE_ORTHOGONAL_TO_CR_SCALE = YES
X_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
```

## 1. Identity / version / status

| Field | Definition |
|---|---|
| Capability | `<IMP>` |
| Experience Definition version / status | `<version; draft or approved>` |
| Product Definition reference | `<identity, version, gate status>` |
| Experience Criticality | `X0` / `X1` / `X2` / `X3` with reason |
| Change Risk | `CR0` / `CR1` / `CR2` / `CR3` with evidence; not an AGENTS `R` level |
| Process anchors | `PD-2 / EXP-1 / LANG-1 / TEST-1` |

## 2. Experience Intent

`<Who is helped, what they are trying to do, what they must understand, and the intended trust or emotional outcome.>`

## 3. User goals and questions

| Person | Goal | Question they must be able to answer |
|---|---|---|
| `<persona>` | `<goal>` | `<question>` |

## 4. Evidence and assumptions

| Claim | Class (`FACT` / `SUPPORTED_EVIDENCE` / `ASSUMPTION` / `HYPOTHESIS` / `PRODUCT_DECISION`) | Evidence class | Risk | Validation path |
|---|---|---|---|---|
| `<claim>` | `<class>` | `<FOUNDER_HEURISTIC_REVIEW / INTERNAL_USABILITY_REVIEW / CUSTOMER_USABILITY_RESEARCH / PRODUCTION_BEHAVIOURAL_DATA / CONTROLLED_EXPERIMENT / none>` | `<risk>` | `<how it will be checked>` |

## 5. Current-state experience

`<What people can do today, citing repository or research evidence. Separate supported behaviour from planned intent.>`

## 6. Desired journey

`<End-to-end desired journey, including alternate and recovery branches.>`

## 7. Entry and discoverability

`<How someone arrives, including direct links, and how they recognize the action.>`

## 8. Information architecture and hierarchy

`<Structure, grouping, and what is primary, secondary, or hidden.>`

## 9. Interaction, mental model, and cognitive load

`<Primary interaction, expected mental model, and how cognitive load stays bounded.>`

## 10. Friction audit

| Moment | Necessary / protective / accidental | Decision |
|---|---|---|
| `<moment>` | `<class>` | `<keep, change, or remove; reason>` |

## 11. Service blueprint

Required where a customer promise depends on operations. Otherwise `N/A` with a reason.

```text
CUSTOMER PROMISE ↔ SYSTEM TRUTH ↔ WORKFORCE ACTION ↔ OPERATIONAL CAPABILITY
```

## 12. Content requirements

Reference LANG-1. State customer and operator wording, empty/loading/error copy, and any
`XR-<IMP>-NNN` that must be tested. Do not paste raw backend codes as the copy.

## 13. UX state matrix

| State | Experience requirement |
|---|---|
| Default / ready | `<requirement>` |
| Loading | `<requirement>` |
| Empty / first use | `<requirement>` |
| Success | `<requirement>` |
| Validation failure | `<requirement>` |
| Unavailable / stale | `<requirement>` |
| Server / network failure | `<requirement>` |
| Recovery | `<requirement>` |
| Disabled | `<requirement or N/A>` |
| Destructive confirmation | `<requirement or N/A>` |
| Concurrency / conflict | `<requirement or N/A>` |

## 14. Responsive, mobile, accessibility, and perceived performance

`<Desktop, mobile, breakpoints, keyboard, focus, semantics, and perceived performance.>`

## 15. Design-system mapping

| Need | Reuse / extend / new, with reason |
|---|---|
| `<component or pattern>` | `<choice>` |

## 16. Trust review

`<How the experience avoids deceptive patterns listed in EXP-1 and LANG-1.>`

## 17. Measurement intent and analytics contract

`<For X3: business intent, primary metric, secondary metrics, guardrails, events, baseline, window, learning signal, causal limits. For each material event: meaning, trigger, owner, attributes, forbidden PII, identity, deduplication, schema/version, source of truth, validation, retention.>`

## 18. Research and prototype evidence

`<What was reviewed or tested, using the EXP-1 evidence classes.>`

## 19. Experience Gate

```text
EXPERIENCE_GATE
Result: NOT_PERFORMED | PASS | STOP | N/A
Unresolved experience decisions:
```

## 20. Architecture Fit reconciliation

`<Whether experience requirements change architecture needs. Fit may not finally PASS or lock for X2/X3 until this gate is PASS.>`

## 21. Design Readiness

`<NOT_PERFORMED until after viable Architecture Fit. List the implementation-ready specification that will satisfy EXP-1.>`

## 22. Experience QA and Founder Experience UAT

`<Expected Experience QA, Content QA, and accessibility/responsive proof. Founder Experience UAT applies only where Founder UAT applies.>`

## 23. Open experience decisions

`<NONE, or the decision, owner, and affected gate.>`
