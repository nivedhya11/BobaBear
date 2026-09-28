<!-- governance-meta
{
  "status": "CURRENT",
  "authority": "PRODUCT_LANGUAGE_STANDARD",
  "version": "LANG-1",
  "approved": "2026-09-28",
  "lastReviewed": "2026-09-28"
}
-->

# Product Language Standard

LANG-1 owns how approved product and domain meaning is presented to people. It does not rename
backend or domain authority. [`experience/terminology.md`](./experience/terminology.md) is source
material only. It is not this authority.

```text
PRODUCT_LANGUAGE_STANDARD = LANG-1
APPROVED = 2026-09-28
DOMAIN LANGUAGE → PRESENTATION SEMANTICS → CUSTOMER / OPERATOR LANGUAGE
RAW_BACKEND_LANGUAGE_TO_CUSTOMER = PROHIBITED
CONTEXTUAL_STATUS_PROJECTION = REQUIRED
ONE_BACKEND_STATE_ONE_UNIVERSAL_LABEL = PROHIBITED
```

## Presentation model

1. **Domain language** stays the technical and domain meaning owned by architecture, decisions, and
   accepted foundations.
2. **Presentation semantics** choose what a person needs to understand in a specific context.
3. **Customer language** and **operator language** may differ. An operator may need a more precise
   operational word. A customer receives the promise, status, and next action in plain language.

Rules:

- Do not render a raw backend enum or code mechanically.
- Do not leak technical or domain vocabulary to customers by default.
- Do not turn an internal implementation name into UI copy by default.
- Contextual status projection is allowed and required.
- One backend state does not require one universal presentation label.
- An unknown or fallback state must not expose raw code. Say that the status is unavailable and
  what the person can do next, without inventing a false state.

```text
RAW_BACKEND_LANGUAGE_TO_CUSTOMER = PROHIBITED
```

Examples that must not be mechanically shown to customers: fulfilment window, promotion candidate,
checkout snapshot, payment capture pending, modifier configuration, and internal enum or error
names. Operators may see precise operational language where their job requires it. Customers still
do not see raw codes.

This prohibition governs presentation only. It does not rename Cart, Checkout Snapshot, Payment,
Order, Refund, or any other domain authority.

## Tone by context

Tone follows the moment. Do not force playful language into trust-critical states.

| Context | Tone |
|---|---|
| Brand / discovery | Distinctive and playful where that helps recognition |
| Ordering | Clear, concise, and lightly branded |
| Checkout | Precise and reassuring |
| Payment | Trustworthy and unambiguous |
| Failure | Calm, direct, and recovery-oriented |
| Cancellation / refund | Transparent and respectful |
| Legal / privacy | Plain and precise |

## Subjects that need intentional language

Define customer and, where different, operator language for:

- navigation
- actions and buttons
- fulfilment, pickup, and delivery
- orders and statuses
- offers, coupons, and savings
- payments
- errors and recovery
- loading
- empty states
- dates, times, and time ranges
- money and quantities
- order references
- capitalization
- cross-channel communication

Money is exact. Savings claims match the priced outcome. A time range states the promise the
operation can keep. An order reference is the customer-facing reference, not an internal identifier,
unless the person needs that identifier to get help.

## Channels

Apply the same meaning across:

- web
- responsive and mobile web
- email
- SMS
- push
- future messaging channels
- receipts
- support-facing customer communication

Channel limits may shorten the words. They must not change the promise, the status, or the money.

## Trust

Do not use fake scarcity, false countdowns, misleading savings, hidden mandatory charges, obscured
cancellation, forced continuity, preselected paid extras without explicit intent, or misleading
action hierarchy. A/B testing cannot waive security, privacy, financial truth, authorization, legal
requirements, or accessibility minimums.

## Relationship to other authorities

Experience Definitions state content requirements and reference LANG-1. Content QA checks that
shipped language is intentional, correct, and free of backend leakage. Product Definition still
owns the behaviour the words must not contradict.
