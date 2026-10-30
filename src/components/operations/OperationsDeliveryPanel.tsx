"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  OperationsDeliveryConsequenceDialog,
  type DeliveryConsequenceAction,
} from "@/components/operations/OperationsDeliveryConsequenceDialog";
import { Button } from "@/components/ui/Button";
import {
  getWorkforceDelivery,
  postDeliveryCommand,
  type OperationsDeliveryDetail,
} from "@/lib/operations/delivery";

type PanelState =
  | Readonly<{ kind: "loading" }>
  | Readonly<{ kind: "empty" }>
  | Readonly<{ kind: "ready"; detail: OperationsDeliveryDetail }>
  | Readonly<{ kind: "error"; message: string }>;

type PendingConsequence = Readonly<{
  action: DeliveryConsequenceAction;
  command: string;
  orderId: string;
  deliveryId: string;
  payload: Record<string, unknown>;
  summaryLines: readonly string[];
}>;

function externalBookingHint(status: string): string | null {
  if (status === "REQUESTED") {
    return "Begin manual booking in BOBA before attempting external courier booking.";
  }
  if (status === "BOOKING_OUTCOME_UNKNOWN") {
    return "External booking outcome is not yet confirmed. Resolve once the courier result is known.";
  }
  return null;
}

function deliveryStatusLabel(status: string): string {
  if (status === "REQUESTED") return "Requested";
  if (status === "BOOKING_OUTCOME_UNKNOWN") return "Booking outcome unknown";
  if (status === "BOOKED") return "Booked";
  if (status === "PICKED_UP") return "Picked up";
  if (status === "DELIVERED") return "Delivered";
  if (status === "FAILED") return "Failed";
  if (status === "CANCELLED") return "Cancelled";
  return status;
}

function providerCostLabel(kind: string): string {
  if (kind === "estimated") return "Estimated provider cost";
  if (kind === "booked") return "Booked provider cost";
  if (kind === "final") return "Final provider cost";
  if (kind === "cancellation") return "Cancellation provider cost";
  if (kind === "return") return "Return provider cost";
  if (kind === "adjustment") return "Provider cost adjustment";
  return kind;
}

function formatCostPaise(amountPaise: string): string {
  const value = Number(amountPaise);
  if (!Number.isFinite(value)) return `${amountPaise} paise`;
  return `₹${(value / 100).toFixed(2)}`;
}

function deliveryBasePayload(delivery: OperationsDeliveryDetail["delivery"]) {
  return {
    deliveryId: delivery.id,
    expectedRevision: delivery.revision,
  };
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

const INACTIVITY_ACK_LABEL =
  "I acknowledge that no active external booking remains for this delivery. This is an operator acknowledgment only — not verified external-provider evidence.";

function emptyEvidenceFields() {
  return {
    providerLabel: "",
    externalBookingReference: "",
    trackingUrl: "",
    assignmentKey: "",
    courierReference: "",
    handoffReference: "",
    proofReference: "",
    failureCode: "",
    failureReason: "",
    cancellationCode: "",
    cancellationReason: "",
    inactiveBookingAcknowledged: false,
  };
}

export function OperationsDeliveryPanel(props: Readonly<{ orderId: string }>) {
  const { orderId } = props;
  const [state, setState] = useState<PanelState>({ kind: "loading" });
  const [providerLabel, setProviderLabel] = useState("");
  const [externalBookingReference, setExternalBookingReference] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [assignmentKey, setAssignmentKey] = useState("");
  const [courierReference, setCourierReference] = useState("");
  const [handoffReference, setHandoffReference] = useState("");
  const [proofReference, setProofReference] = useState("");
  const [failureCode, setFailureCode] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [cancellationCode, setCancellationCode] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [inactiveBookingAcknowledged, setInactiveBookingAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [pendingConsequence, setPendingConsequence] = useState<PendingConsequence | null>(null);

  const activeOrderIdRef = useRef(orderId);
  const activeDeliveryIdRef = useRef<string | null>(null);
  const loadGenerationRef = useRef(0);
  const commandGenerationRef = useRef(0);

  const resetOperatorLocalState = useCallback(() => {
    const empty = emptyEvidenceFields();
    setProviderLabel(empty.providerLabel);
    setExternalBookingReference(empty.externalBookingReference);
    setTrackingUrl(empty.trackingUrl);
    setAssignmentKey(empty.assignmentKey);
    setCourierReference(empty.courierReference);
    setHandoffReference(empty.handoffReference);
    setProofReference(empty.proofReference);
    setFailureCode(empty.failureCode);
    setFailureReason(empty.failureReason);
    setCancellationCode(empty.cancellationCode);
    setCancellationReason(empty.cancellationReason);
    setInactiveBookingAcknowledged(empty.inactiveBookingAcknowledged);
    setBusy(false);
    setMessage("");
    setFieldError("");
    setPendingConsequence(null);
  }, []);

  const applyLoadedDetail = useCallback(
    (detail: OperationsDeliveryDetail | null) => {
      if (!detail) {
        // Active → empty (e.g. terminalized): clear evidence before forgetting identity so a
        // later replacement Delivery cannot inherit prior fields (null previous would skip reset).
        if (activeDeliveryIdRef.current !== null) {
          resetOperatorLocalState();
        }
        activeDeliveryIdRef.current = null;
        setState({ kind: "empty" });
        return;
      }
      const nextDeliveryId = detail.delivery.id;
      if (
        activeDeliveryIdRef.current !== null &&
        activeDeliveryIdRef.current !== nextDeliveryId
      ) {
        // Delivery identity changed under the same Order — discard prior evidence/dialog state.
        resetOperatorLocalState();
      }
      activeDeliveryIdRef.current = nextDeliveryId;
      setState({ kind: "ready", detail });
    },
    [resetOperatorLocalState],
  );

  const reload = useCallback(async () => {
    const requestOrderId = orderId;
    const generation = loadGenerationRef.current;
    const result = await getWorkforceDelivery(requestOrderId);
    if (
      generation !== loadGenerationRef.current ||
      activeOrderIdRef.current !== requestOrderId
    ) {
      return;
    }
    if (!result.ok) {
      setState({ kind: "error", message: "Delivery details could not be loaded." });
      return;
    }
    applyLoadedDetail(result.data.delivery);
  }, [applyLoadedDetail, orderId]);

  useEffect(() => {
    activeOrderIdRef.current = orderId;
    activeDeliveryIdRef.current = null;
    loadGenerationRef.current += 1;
    commandGenerationRef.current += 1;
    const generation = loadGenerationRef.current;
    // Order identity sync: clear operator-local evidence before workforce delivery fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Order identity change resets local delivery evidence before external sync
    resetOperatorLocalState();
    setState({ kind: "loading" });

    let cancelled = false;
    void (async () => {
      const result = await getWorkforceDelivery(orderId);
      if (cancelled || generation !== loadGenerationRef.current) return;
      if (!result.ok) {
        setState({ kind: "error", message: "Delivery details could not be loaded." });
        return;
      }
      applyLoadedDetail(result.data.delivery);
    })();
    return () => {
      cancelled = true;
    };
  }, [applyLoadedDetail, orderId, resetOperatorLocalState]);

  async function run(
    action: string,
    payload: Record<string, unknown>,
    identity: Readonly<{ orderId: string; deliveryId: string | null }>,
  ) {
    const generation = ++commandGenerationRef.current;
    setBusy(true);
    setMessage("");
    setFieldError("");
    const result = await postDeliveryCommand(identity.orderId, action, payload);
    if (
      generation !== commandGenerationRef.current ||
      activeOrderIdRef.current !== identity.orderId
    ) {
      return;
    }
    if (
      identity.deliveryId !== null &&
      activeDeliveryIdRef.current !== null &&
      activeDeliveryIdRef.current !== identity.deliveryId
    ) {
      return;
    }
    setBusy(false);
    setPendingConsequence(null);
    if (!result.ok) {
      if (result.code === "DELIVERY_REVISION_CONFLICT" || result.code === "DELIVERY_STATE_CONFLICT") {
        setMessage("Delivery changed since load. Refreshing…");
        await reload();
        return;
      }
      setMessage("Command could not be completed.");
      return;
    }
    setMessage("Updated.");
    setInactiveBookingAcknowledged(false);
    await reload();
  }

  function requireNonEmpty(value: string, label: string): string | null {
    if (value.trim().length === 0) {
      setFieldError(`${label} is required.`);
      return null;
    }
    return value.trim();
  }

  function requestConsequence(
    action: DeliveryConsequenceAction,
    command: string,
    payload: Record<string, unknown>,
    summaryLines: readonly string[],
    identity: Readonly<{ orderId: string; deliveryId: string }>,
  ) {
    setFieldError("");
    setPendingConsequence({
      action,
      command,
      orderId: identity.orderId,
      deliveryId: identity.deliveryId,
      payload,
      summaryLines,
    });
  }

  if (state.kind === "loading") {
    return <p className="text-sm text-[var(--text-secondary)]">Loading delivery…</p>;
  }
  if (state.kind === "empty") {
    return (
      <section className="space-y-3 rounded-md border border-[var(--border-subtle)] p-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
          Delivery
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">No active delivery request.</p>
        <Button
          type="button"
          disabled={busy}
          onClick={() =>
            void run(
              "arrange",
              {
                requestFingerprint: `ops-${orderId.slice(0, 8)}`,
              },
              { orderId, deliveryId: null },
            )
          }
        >
          Arrange delivery
        </Button>
        {message ? <p className="text-sm text-[var(--text-secondary)]">{message}</p> : null}
      </section>
    );
  }
  if (state.kind === "error") {
    return <p className="text-sm text-[var(--text-secondary)]">{state.message}</p>;
  }

  const { detail } = state;
  const d = detail.delivery;
  const base = deliveryBasePayload(d);
  const commands = detail.permittedCommands;
  const hint = externalBookingHint(d.status);
  const has = (command: string) => commands.includes(command);
  const commandIdentity = { orderId, deliveryId: d.id };

  return (
    <section
      className="space-y-3 rounded-md border border-[var(--border-subtle)] p-4"
      data-testid="operations-delivery-panel"
      data-order-id={orderId}
      data-delivery-id={d.id}
    >
      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
        Delivery
      </h2>
      <dl className="grid gap-1 text-sm">
        <div>
          <dt className="text-[var(--text-tertiary)]">Status</dt>
          <dd>{deliveryStatusLabel(d.status)}</dd>
        </div>
        {d.bookingCorrelationId ? (
          <div>
            <dt className="text-[var(--text-tertiary)]">Booking correlation</dt>
            <dd className="font-mono text-xs">{d.bookingCorrelationId}</dd>
          </div>
        ) : null}
        {d.provider ? (
          <div>
            <dt className="text-[var(--text-tertiary)]">Provider</dt>
            <dd>{d.provider}</dd>
          </div>
        ) : null}
        {detail.trackingUrl ? (
          <div>
            <dt className="text-[var(--text-tertiary)]">Tracking</dt>
            <dd>
              <a href={detail.trackingUrl} target="_blank" rel="noreferrer">
                Track
              </a>
            </dd>
          </div>
        ) : null}
        {detail.activeAssignment ? (
          <div>
            <dt className="text-[var(--text-tertiary)]">Assignment</dt>
            <dd>{detail.activeAssignment.assignmentKey}</dd>
          </div>
        ) : null}
      </dl>
      {detail.providerCosts.length > 0 ? (
        <div className="rounded-sm border border-[var(--border-subtle)] p-2 text-sm">
          <p className="font-medium">Provider cost (workforce only)</p>
          <ul className="mt-2 space-y-1">
            {detail.providerCosts.map((cost) => (
              <li key={`${cost.kind}-${cost.amountPaise}`}>
                {providerCostLabel(cost.kind)}: {formatCostPaise(cost.amountPaise)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {hint ? (
        <p className="rounded-sm bg-[var(--surface-muted)] p-2 text-sm text-[var(--text-secondary)]">
          {hint}
        </p>
      ) : null}

      {has("BEGIN_MANUAL_BOOKING") ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            Provider label
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={providerLabel}
              onChange={(e) => setProviderLabel(e.target.value)}
              data-testid="delivery-provider-label"
              autoComplete="off"
            />
          </label>
          <Button
            type="button"
            disabled={busy}
            data-testid="delivery-begin-manual-booking"
            onClick={() => {
              const provider = requireNonEmpty(providerLabel, "Provider label");
              if (!provider) return;
              void run("begin-manual-booking", { ...base, provider }, commandIdentity);
            }}
          >
            Begin manual booking
          </Button>
        </div>
      ) : null}

      {has("CONFIRM_MANUAL_BOOKING") ? (
        <div className="space-y-2 rounded-sm border border-[var(--border-subtle)] p-3">
          <p className="text-sm font-medium">Confirm manual booking</p>
          <label className="flex flex-col gap-1 text-sm">
            External booking reference
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={externalBookingReference}
              onChange={(e) => setExternalBookingReference(e.target.value)}
              placeholder="Courier booking reference"
              data-testid="delivery-external-booking-reference"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Tracking URL (HTTPS, optional)
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              data-testid="delivery-tracking-url"
              autoComplete="off"
            />
          </label>
          <Button
            type="button"
            disabled={busy}
            data-testid="delivery-confirm-manual-booking"
            onClick={() => {
              const external = requireNonEmpty(
                externalBookingReference,
                "External booking reference",
              );
              if (!external) return;
              const tracking = trackingUrl.trim();
              if (tracking.length > 0 && !isHttpsUrl(tracking)) {
                setFieldError("Tracking URL must be a valid HTTPS URL when provided.");
                return;
              }
              void run(
                "confirm-manual-booking",
                {
                  ...base,
                  externalBookingReference: external,
                  ...(tracking.length > 0 ? { trackingUrl: tracking } : {}),
                },
                commandIdentity,
              );
            }}
          >
            Confirm manual booking
          </Button>
        </div>
      ) : null}

      {has("RESOLVE_MANUAL_BOOKING_FAILURE") ? (
        <div className="space-y-2 rounded-sm border border-[var(--border-subtle)] p-3">
          <p className="text-sm font-medium">Resolve booking failure</p>
          <label className="flex flex-col gap-1 text-sm">
            Failure code
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={failureCode}
              onChange={(e) => setFailureCode(e.target.value)}
              data-testid="delivery-failure-code"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Failure reason
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              data-testid="delivery-failure-reason"
              autoComplete="off"
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={inactiveBookingAcknowledged}
              onChange={(e) => setInactiveBookingAcknowledged(e.target.checked)}
              data-testid="delivery-inactive-booking-ack"
            />
            <span>{INACTIVITY_ACK_LABEL}</span>
          </label>
          <Button
            type="button"
            disabled={busy}
            data-testid="delivery-resolve-failure"
            onClick={() => {
              const code = requireNonEmpty(failureCode, "Failure code");
              if (!code) return;
              const reason = requireNonEmpty(failureReason, "Failure reason");
              if (!reason) return;
              if (!inactiveBookingAcknowledged) {
                setFieldError("Operator acknowledgment of booking inactivity is required.");
                return;
              }
              requestConsequence(
                "resolve-manual-booking-failure",
                "resolve-manual-booking-failure",
                {
                  ...base,
                  failureCode: code,
                  failureReason: reason,
                  inactiveBookingConfirmed: true,
                },
                [
                  `Failure code: ${code}`,
                  `Failure reason: ${reason}`,
                  "Operator inactivity acknowledgment provided (not verified courier evidence).",
                ],
                commandIdentity,
              );
            }}
          >
            Resolve booking failure
          </Button>
        </div>
      ) : null}

      {has("RESOLVE_MANUAL_BOOKING_CANCELLATION") ? (
        <div className="space-y-2 rounded-sm border border-[var(--border-subtle)] p-3">
          <p className="text-sm font-medium">Resolve booking cancellation</p>
          <label className="flex flex-col gap-1 text-sm">
            Cancellation code
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={cancellationCode}
              onChange={(e) => setCancellationCode(e.target.value)}
              data-testid="delivery-cancellation-code"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Cancellation reason
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              data-testid="delivery-cancellation-reason"
              autoComplete="off"
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={inactiveBookingAcknowledged}
              onChange={(e) => setInactiveBookingAcknowledged(e.target.checked)}
              data-testid="delivery-inactive-booking-ack-cancel"
            />
            <span>{INACTIVITY_ACK_LABEL}</span>
          </label>
          <Button
            type="button"
            disabled={busy}
            data-testid="delivery-resolve-cancellation"
            onClick={() => {
              const code = requireNonEmpty(cancellationCode, "Cancellation code");
              if (!code) return;
              const reason = requireNonEmpty(cancellationReason, "Cancellation reason");
              if (!reason) return;
              if (!inactiveBookingAcknowledged) {
                setFieldError("Operator acknowledgment of booking inactivity is required.");
                return;
              }
              requestConsequence(
                "resolve-manual-booking-cancellation",
                "resolve-manual-booking-cancellation",
                {
                  ...base,
                  cancellationCode: code,
                  cancellationReason: reason,
                  inactiveBookingConfirmed: true,
                },
                [
                  `Cancellation code: ${code}`,
                  `Cancellation reason: ${reason}`,
                  "Operator inactivity acknowledgment provided (not verified courier evidence).",
                ],
                commandIdentity,
              );
            }}
          >
            Resolve booking cancellation
          </Button>
        </div>
      ) : null}

      {has("RECORD_ASSIGNMENT") ? (
        <div className="space-y-2 rounded-sm border border-[var(--border-subtle)] p-3">
          <p className="text-sm font-medium">Record assignment</p>
          <label className="flex flex-col gap-1 text-sm">
            Assignment key
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={assignmentKey}
              onChange={(e) => setAssignmentKey(e.target.value)}
              data-testid="delivery-assignment-key"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Courier reference (optional)
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={courierReference}
              onChange={(e) => setCourierReference(e.target.value)}
              data-testid="delivery-courier-reference"
              autoComplete="off"
            />
          </label>
          <Button
            type="button"
            disabled={busy}
            data-testid="delivery-record-assignment"
            onClick={() => {
              const key = requireNonEmpty(assignmentKey, "Assignment key");
              if (!key) return;
              const provider = (d.provider ?? providerLabel).trim();
              if (provider.length === 0) {
                setFieldError("Provider label is required when the delivery has no provider yet.");
                return;
              }
              void run(
                "record-assignment",
                {
                  ...base,
                  provider,
                  assignmentKey: key,
                  courierReference: courierReference.trim() || undefined,
                },
                commandIdentity,
              );
            }}
          >
            Record assignment
          </Button>
        </div>
      ) : null}

      {has("CONFIRM_PICKUP") ? (
        <div className="space-y-2 rounded-sm border border-[var(--border-subtle)] p-3">
          <p className="text-sm font-medium">Confirm pickup</p>
          <label className="flex flex-col gap-1 text-sm">
            Handoff reference
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={handoffReference}
              onChange={(e) => setHandoffReference(e.target.value)}
              data-testid="delivery-handoff-reference"
              autoComplete="off"
            />
          </label>
          <Button
            type="button"
            disabled={busy}
            data-testid="delivery-confirm-pickup"
            onClick={() => {
              const handoff = requireNonEmpty(handoffReference, "Handoff reference");
              if (!handoff) return;
              void run(
                "confirm-pickup",
                {
                  ...base,
                  handoffReference: handoff,
                },
                commandIdentity,
              );
            }}
          >
            Confirm pickup
          </Button>
        </div>
      ) : null}

      {has("CONFIRM_DELIVERY") ? (
        <div className="space-y-2 rounded-sm border border-[var(--border-subtle)] p-3">
          <p className="text-sm font-medium">Confirm delivery</p>
          <label className="flex flex-col gap-1 text-sm">
            Proof reference
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={proofReference}
              onChange={(e) => setProofReference(e.target.value)}
              data-testid="delivery-proof-reference"
              autoComplete="off"
            />
          </label>
          <p className="text-xs text-[var(--text-tertiary)]">
            Operator-entered proof reference only. This UI does not verify external-provider evidence.
          </p>
          <Button
            type="button"
            disabled={busy}
            data-testid="delivery-confirm-delivery"
            onClick={() => {
              const proof = requireNonEmpty(proofReference, "Proof reference");
              if (!proof) return;
              requestConsequence(
                "confirm-delivery",
                "confirm-delivery",
                {
                  ...base,
                  proofReference: proof,
                },
                [`Proof reference: ${proof}`],
                commandIdentity,
              );
            }}
          >
            Confirm delivery
          </Button>
        </div>
      ) : null}

      {has("REPORT_DELIVERY_FAILURE") ? (
        <div className="space-y-2 rounded-sm border border-[var(--border-subtle)] p-3">
          <p className="text-sm font-medium">Report delivery failure</p>
          <label className="flex flex-col gap-1 text-sm">
            Failure code
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={failureCode}
              onChange={(e) => setFailureCode(e.target.value)}
              data-testid="delivery-report-failure-code"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Failure reason
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              data-testid="delivery-report-failure-reason"
              autoComplete="off"
            />
          </label>
          <Button
            type="button"
            disabled={busy}
            data-testid="delivery-report-failure"
            onClick={() => {
              const code = requireNonEmpty(failureCode, "Failure code");
              if (!code) return;
              const reason = requireNonEmpty(failureReason, "Failure reason");
              if (!reason) return;
              requestConsequence(
                "report-failure",
                "report-failure",
                {
                  ...base,
                  failureCode: code,
                  failureReason: reason,
                },
                [`Failure code: ${code}`, `Failure reason: ${reason}`],
                commandIdentity,
              );
            }}
          >
            Report delivery failure
          </Button>
        </div>
      ) : null}

      {has("CANCEL_DELIVERY") ? (
        <div className="space-y-2 rounded-sm border border-[var(--border-subtle)] p-3">
          <p className="text-sm font-medium">Cancel delivery</p>
          <label className="flex flex-col gap-1 text-sm">
            Cancellation code
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={cancellationCode}
              onChange={(e) => setCancellationCode(e.target.value)}
              data-testid="delivery-cancel-code"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Cancellation reason
            <input
              className="rounded border border-[var(--border-subtle)] px-2 py-1"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              data-testid="delivery-cancel-reason"
              autoComplete="off"
            />
          </label>
          <Button
            type="button"
            disabled={busy}
            data-testid="delivery-cancel"
            onClick={() => {
              const code = requireNonEmpty(cancellationCode, "Cancellation code");
              if (!code) return;
              const reason = requireNonEmpty(cancellationReason, "Cancellation reason");
              if (!reason) return;
              requestConsequence(
                "cancel",
                "cancel",
                {
                  ...base,
                  cancellationCode: code,
                  cancellationReason: reason,
                },
                [`Cancellation code: ${code}`, `Cancellation reason: ${reason}`],
                commandIdentity,
              );
            }}
          >
            Cancel delivery
          </Button>
        </div>
      ) : null}

      {fieldError ? (
        <p role="alert" className="text-sm text-rose-700" data-testid="delivery-field-error">
          {fieldError}
        </p>
      ) : null}
      {message ? <p className="text-sm text-[var(--text-secondary)]">{message}</p> : null}

      {pendingConsequence &&
      pendingConsequence.orderId === orderId &&
      pendingConsequence.deliveryId === d.id ? (
        <OperationsDeliveryConsequenceDialog
          action={pendingConsequence.action}
          orderId={orderId}
          deliveryId={d.id}
          deliveryStatus={deliveryStatusLabel(d.status)}
          summaryLines={pendingConsequence.summaryLines}
          pending={busy}
          onDismiss={() => {
            if (busy) return;
            setPendingConsequence(null);
          }}
          onConfirm={() => {
            if (
              pendingConsequence.orderId !== orderId ||
              pendingConsequence.deliveryId !== d.id ||
              pendingConsequence.deliveryId !== activeDeliveryIdRef.current
            ) {
              setPendingConsequence(null);
              setFieldError("Selection changed. Review the current delivery before continuing.");
              return;
            }
            void run(pendingConsequence.command, pendingConsequence.payload, {
              orderId: pendingConsequence.orderId,
              deliveryId: pendingConsequence.deliveryId,
            });
          }}
        />
      ) : null}
    </section>
  );
}
