/**
 * Operator-facing copy for IMP-036J workforce authoring (Design Readiness).
 * Customer surfaces must not import this module.
 */
export const COPY_OP_AUTO = "Customers get this without a code";
export const COPY_OP_COUPON = "Customers enter a coupon";
export const COPY_OP_ORDER = "This changes the items or order total";
export const COPY_OP_DELIVERY = "This changes the delivery charge";
export const COPY_OP_GIFT = "One menu item, included, with no customer choices";
export const COPY_OP_GIFT_INVALID =
  "Choose one menu item that needs no customer choices.";
export const COPY_OP_SECOND =
  "Another included-item offer is already active. This one was not activated.";
export const COPY_OP_RACE =
  "This activation did not become the active offer. Check the offer that is active, then try again if you still need a change.";
export const COPY_OP_CONFLICT = "Someone else changed this. Reload it and try again.";
export const COPY_OP_LIVE = "Customers can receive this offer.";
export const COPY_OP_DRAFT = "Not live yet. Customers do not receive this.";
export const COPY_OP_RETIRED = "Retired. New orders will not receive it.";
export const COPY_RETIRE_TITLE = "Retire this offer?";
export const COPY_RETIRE_BODY =
  "New orders will stop receiving it. Orders already placed stay as paid.";
export const COPY_RETIRE_CONFIRM = "Retire offer";
export const COPY_CANCEL = "Cancel";
export const COPY_DENIED = "You can't change this.";

export const COPY_OP_IDENTIFIER_LABEL = "Promotion identifier (internal)";
export const COPY_OP_IDENTIFIER_HELP =
  "For your team only. Customers can't type this at checkout — they type a coupon code.";
export const COPY_OP_IDENTIFIER_INVALID =
  "Use lowercase letters, numbers, hyphens or underscores, starting with a letter or number (for example summer-10).";
export const COPY_OP_COUPON_CODE_LABEL = "Coupon code customers type";
export const COPY_OP_COUPON_CODE_HELP =
  "3 to 64 letters, numbers, hyphens or underscores. Saved in capitals.";
export const COPY_OP_COUPON_CODE_REQUIRED = "Enter the coupon code customers will type.";
export const COPY_OP_COUPON_CREATED_DRAFT =
  "Coupon created as a draft. Activate it so customers can use it.";
export const COPY_OP_NO_COUPON_CODES =
  "No coupon codes yet. Customers can't use this offer until you create a coupon code and activate it.";
export const COPY_OP_NO_ACTIVE_COUPON_CODES =
  "No active coupon codes. Customers can't use this offer until a coupon code is active.";
export const COPY_OP_LIVE_WITHOUT_COUPON =
  "Active, but customers can't use it yet: no coupon code is active.";
export const COPY_OP_LIVE_WITH_COUPON = "Customers can receive this offer.";
export const COPY_OP_COUPONS_UNREADABLE =
  "Coupon codes couldn't be checked, so customer readiness is unknown.";
export const COPY_OP_STATE_CURRENT = "Currently effective";
export const COPY_OP_STATE_NOT_STARTED = "Not started yet";
export const COPY_OP_STATE_ENDED = "Past the saved end";
export const COPY_OP_STATE_INACTIVE = "Not active";
export const COPY_OP_STATE_UNKNOWN = "Readiness unknown";
export const COPY_OP_SCHEDULED =
  "Not started yet. Not customer-ready until the saved start time.";
export const COPY_OP_EXPIRED = "Past the saved end. Not customer-ready.";
export const COPY_OP_NOT_CURRENTLY_EFFECTIVE =
  "Not customer-ready. No coupon code is currently effective inside both saved windows.";
export const COPY_OP_WINDOW_UNREADABLE =
  "Readiness unknown. A saved start or end time is missing, unreadable, or invalid, or the parent promotion is missing.";
export const COPY_OP_READINESS_CUE =
  "Workflow cue only. It does not promise that a particular customer qualifies.";
export const COPY_OP_SCHEDULED_NEXT = "Customer-ready begins at the saved start time.";
export const COPY_OP_EXPIRED_NEXT =
  "The saved end time has been reached, so this is not customer-ready.";

export const COMPLIMENTARY_ACTIVE_UNIQUE_INDEX =
  "promotions_one_active_complimentary_per_brand_uidx";
