<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Terminology dictionary

```text
TERM_ID = WXE-TERM-CANDIDATE-1
LANG_1 = PRESENTATION_STANDARD (does not independently require Now/Takeaway)
FOUNDER_PRESENTATION = FUTURE_DIRECTION (not claimed as shipped)
```

## Authority distinction (Amendment B)

| Source | What it requires |
|---|---|
| **LANG-1** | Intentional presentation; no raw backend language to customers; operators may be more precise; domain names Cart/Checkout Snapshot/Payment/Order/Refund not renamed as domain concepts |
| **Founder direction** | Primary human labels **Delivery / Takeaway** and **Now / Schedule** |
| **UOE package (PR #424) UX-A** | **Owns the shared customer + workforce order-type / timing label map** for Delivery/Takeaway and Now/Schedule verbs |
| **This WXE package** | **Consumes** that shared map for Workforce chrome and ops surfaces; does not fork competing workforce verbs (e.g. invent “Mark collected” outside UOE’s allowed verb list) |
| **Shipped UI today** | Mixed: “Pickup”, “ASAP”, “Scheduled”, “Pickup Profile”, “Serviceability”, “Operating Status”, Admin nav “Workforce/Access/Audit/System/Organization”, Store “Team Members/Team Access”, etc. |

Do **not** present Founder direction as if already implemented in accepted history.

## Domain enums retained (internal)

| Domain | Values |
|---|---|
| Fulfilment mode | `DELIVERY` \| `PICKUP` |
| Timing | `ASAP` \| `SCHEDULED` |

## Preferred workforce presentation

| Concept | Preferred primary label | Allowed contextual verbs / cues | Avoid as peer primary |
|---|---|---|---|
| Delivery mode | **Delivery** | — | — |
| Pickup mode | **Takeaway** | Prepare for collection; Hand over order; Collection time | “Pickup” as peer to Delivery (except where verification copy needs “picked up”) |
| Immediate timing | **Now** | — | Guaranteeing arrival time |
| Timed timing | **Schedule** / **Scheduled** | Due soon; Overdue | — |

## Concept dictionary (distinguish authorities)

| Human label (candidate) | Underlying authority | Shipped label examples | Notes |
|---|---|---|---|
| **Product** | Catalog product | Offering / product | Identity of sellable product |
| **Variant** | Catalog variant | Variant | Sellable configuration |
| **Menu** / **Published Menu** | Menu presentation + publish | Menu; Review & publish | Presentation structure; not assortment |
| **Assortment** | Brand/outlet assortment include/exclude | Assortment | Which variants are in scope |
| **Availability** | Operational availability | Availability | Available / unavailable / sold out |
| **Store Hours** | Operating schedule | Hours | Weekly intervals + timezone |
| **Scheduling** | Scheduled fulfilment profile | Embedded under Hours | Lead times; promote discoverability |
| **Delivery Area** | Serviceability / distance policy | Serviceability | Not delivery tariff |
| **Delivery Charges** | Delivery tariff / charges pricing | Delivery tariff | Commercial price of delivery |
| **Takeaway settings** | Pickup profile | Pickup Profile | Enablement + address/instructions |
| **Offer / Promotion / Coupon** | Promotions & coupons | Promotions & coupons | Keep authority split in UI copy |
| **Refund** | Payment refund | Refunds | Domain name retained |
| **Payment** | Payment provenance / money | Payment | Domain name retained |
| **Order** | Order aggregate | Order / Orders | Domain name retained |
| **Store Status** | Outlet operating state | Operating Status | Pause/suspend semantics |
| **System Health** | Ops status bridge | System / Operational Status | Admin vs Ops views |

## Blanket search-and-replace

**Forbidden.** Each surface updates labels with authority-aware copy review. Customer channels follow UOE package separately.

## Examples of careful wording

| Situation | Preferred | Not preferred |
|---|---|---|
| List badge for PICKUP | Takeaway | PICKUP |
| Fulfil button for takeaway | Hand over order / Mark collected | Generic Fulfil only |
| ASAP row | Now | ASAP (unless operator advanced mode) |
| Serviceability page title | Delivery Area | Serviceability (keep as secondary/help) |
| Inspection tab | Review (draft vs live) | Review & publish/effect (when no publish action) |
