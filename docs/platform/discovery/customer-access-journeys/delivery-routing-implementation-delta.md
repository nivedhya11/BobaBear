---
Status: NON_AUTHORITATIVE_IMPLEMENTATION_DELTA
Authority: NONE
Decision dependency: D-387 recorded on stacked DR-27 candidate after D-385/D-386
Implementation authorization: NO
Code changed: NO
---

# Delivery Outlet Routing — Implementation Delta & Test Plan

## Outcome

Once the Founder-approved D-387 routing decision is formally integrated and the appropriate Product/Experience/Architecture Fit and implementation authorization are obtained, **the nearest server-eligible Delivery outlet** should win over a more distant outlet with stronger routing priority.

This document is an engineering handoff and test checklist. It does **not** grant Architecture Fit, authorise coding, create a roadmap IMP, change accepted history, or claim runtime conformance today.

## 1. Verified current source

| Responsibility | Current source | Current behavior / delta |
|---|---|---|
| Brand-scoped candidate list | \`src/server/serviceability/repository.ts\` → \`findServiceabilityCandidates\` | Orders by configured \`routing_priority ASC\` then \`outlet_id ASC\`; does not rank by distance |
| Distance/geographic gate | \`src/server/serviceability/evaluate.ts\` → \`isGeographicallyEligible\` | Haversine radius eligibility already exists |
| Serviceability winner | \`src/server/serviceability/evaluate.ts\` → \`evaluateServiceabilityCandidates\` | Returns first eligible candidate in repository order |
| Customer Menu routing context | \`src/lib/customer-commerce/ordering-outlet-context.ts\` | Consumes server \`selectedOutletId\`; no independent browser ranking |
| Cart/customer Menu | \`src/components/ordering/OrderingCatalogClient.tsx\`, \`CartClient.tsx\` | Serviceable Delivery outlet affects projection/evaluation; Cart remains mutable intent |
| Checkout customer journey | \`src/components/ordering/CheckoutClient.tsx\`; \`src/server/checkout/\` | Authenticated mode / outlet / destination / timing / Snapshot decisions, revision and payment revalidation |
| Pickup alternatives | \`src/server/checkout/pickup-options.ts\`, \`pickup-eligibility.ts\` | Eligibility of one/many Pickup outlets; **no D-387 change** |
| Location trust | \`src/lib/customer-location/geolocation.ts\`, \`delivery-context.ts\` | Device permission explicit; signed-out precise-location hardening remains held IMP-038 |

All paths must be reverified on the eventual implementation base. This is not an exhaustive current call graph or a claim that a UI already implements D-387.

## 2. Intended functional change — Delivery only

1. Take **confirmed destination coordinates** and the existing Brand.
2. Gather all candidates with complete configured service origin and max distance; require actual geographic eligibility (server geodesic/Haversine <= configured radius).
3. Apply operating/fulfilment-mode/timing eligibility using existing authorities. Do not broaden PAUSED, closed or future-scheduled policy through the new ranking algorithm.
4. Rank candidate outlets by **computed distance ASC**, **routing priority ASC for equal computed distance**, **stable outlet ID ASC** for further ties.
5. With configured Cart, require existing catalog and outlet assortment/availability eligibility for the **whole** configured basket. Iterate nearest-first among eligible candidates as appropriate. A failing candidate never causes an automatic cart-line deletion/substitution or a false checkout quote.
6. If no eligible outlet remains, preserve the Cart and show an evidence-backed recovery; do not guess an alternative city, PIN, outlet, slot or final price.
7. Recompute when confirmed location, Cart content/configuration, Checkout mode, selected timing/window or relevant outlet eligibility changes. Current server price and Snapshot authority remains final; material pre-payment changes get appropriate Review/reconfirmation.
8. Once the purchased Checkout Snapshot is sealed, do not recompute selected outlet from current geographic routing. Pickup mode and current Pickup rules are unchanged.

**Important distinctions:** A brand/menu read may choose a provisional eligible context without proving complete-basket availability. Customer delivery fees, operator provider costs, location labels and browser product-price projections are not authority to select, reprice or change purchased items.

## 3. No speculative redesign

Prefer adjusting the existing Serviceability candidate-selection/ranking seam and its existing Checkout composition, not introducing a second public API or a new Routing Engine domain.

No new:
- microservice, event bus, queue, PostGIS, Distance Matrix or travel-time provider;
- customer/client-side choice-of-winner authority;
- persistent mutable \`currentOutletId\` competing with Checkout;
- price/availability/checkout engine;
- roles, permissions, Cart/Checkout/Order states or scheduled capacity engine;
- GPS auto-permission at page entry or IMP-038 security activation.

If a required ranking change materially affects a locked payload or invariant, resolve it with the applicable existing Product/Experience/Architecture Fit **before** editing.

## 4. Minimal executable proof after authorization

| Case | Test oracle |
|---|---|
| Two configured, accepting Delivery outlets in radius | The geographically **closer** eligible outlet wins despite a worse routing priority |
| Equal computed distance | Lower routing priority wins; with same priority lowest stable outlet ID wins |
| Closest outlet outside its configured radius | Exclude that outlet; next eligible may win |
| Closest has incomplete serviceability policy / is inactive | Never select it |
| Closest currently closed or paused | Apply existing ASAP and Scheduled-specific rules; no new open-hours promise |
| Scheduled eligibility differs from ASAP | Do not infer valid future windows solely from current availability |
| No address, no confirmed coordinates, GPS denied | Do not manufacture Delivery outlet or assert serviceability |
| No Cart | Outlet is only a provisional Menu projection context; not final basket/order guarantee |
| Configured Cart: nearest outlet unavailable for one item | Consider next fully eligible under D-387; no silent modification; if none, preserve Cart and show specific recovery |
| Item becomes unavailable after menu read | Checkout payment-preparation fails/re-evaluates under existing rules |
| Delivery address changes | New server winner and relevant Cart/Checkout commercial truth are revalidated |
| Cart item/variant/quantity changes | Re-evaluate full Cart and don't keep stale selected outlet as purchased truth |
| Delivery ↔ Pickup switch | Existing Pickup eligibility and location independence preserved; no Delivery radius for Pickup |
| ASAP ↔ Scheduled / window expires | Preserve server-provided window correctness and Checkout revisions |
| Payment already pending or purchased | Never silently reroute or rewrite immutable Snapshot |
| Two simultaneous Checkout mutations | Existing revision and concurrency guards prevail |
| Customer A signs out / Customer B signs in | No address/Cart authorization leakage |
| Unavailable serviceability provider / database failure | Fail closed rather than use client fallback or stale fabricated result |

Evidence layers, as applicable: focused unit/domain test, disposable PostgreSQL integration with multiple outlets/priorities/radii, existing HTTP contract tests, mode/timing and money/revision regression, representative real-browser Delivery/Pickup journeys, and TEST-1 authorization/security negative tests. Use the existing fake Payment provider and never send real payment or mutate production data for proof.

## 5. Dependency and release sequence

\`\`\`text
Founder D6 Option B = APPROVED
      |
D-385/D-386 (DR-26) integrated canonically
      |
D-387 (DR-27) registered canonically
      |
Affected Product/Experience contract and Architecture Fit reconciled
      |
Implementation authorization under current delivery process
      |
Bounded source/test change → independent review → exact-head CI/CodeQL
      |
Authorised staging/Founder UAT when required → accepted release
\`\`\`

A predecessor or sibling workstream may continue under its own existing authorization; this doc creates no new implementation or release permission.

## 6. Adjacent journey deltas (separate scopes)

**D4/D5** authenticated precise-location hardening is Founder-approved future intent under IMP-036B §6.1 and held IMP-038. No change here.

**D7** one-time address user-flow clarity is a proposal over existing Checkout input; no mandatory address saving shall be inferred from the new D-387 policy, and no UI change is authorized by it.

**D-370 logout / guest-cart continuity** remains binding; a potential browser-held saved-address label or ID needs targeted privacy conformance verification. Do not bundle it into Delivery ranking source mutation.

**IMP-036K** Cart recommendation shelf remains separately gated/unimplemented, and is not activated by routing policy.

## 7. Proof and authorization result

\`\`\`text
FOUNDER_ROUTING_CHOICE = OPTION_B_APPROVED
D387_CANONICAL_MAIN = NOT_YET
ARCHITECTURE_FIT_FOR_DELTA = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZATION = NO
SERVER_ROUTING_RUNTIME = PRIORITY_FIRST_UNTIL_CODE_DEPLOYED
LIVE_DATA_MUTATION = NO
PICKUP_POLICY_CHANGE = NO
PUBLIC_GTM = NOT_GRANTED
\`\`\`
