/**
 * Human-browser payment simulator for the customer-ordering E2E / local UAT harness.
 *
 * Isolated to the harness process. Not mounted in production, staging, or normal
 * development runtimes. Playwright continues to use tests/e2e/support/razorpay-checkout-mock.ts;
 * keep CUSTOMER_ORDERING_HUMAN_PAYMENT_SIMULATOR unset for automated E2E.
 *
 * Installs a FakeRazorpay constructor before Checkout.js can load so ordinary Chrome
 * never invokes real Razorpay with simulated fake credentials.
 */
import { Buffer } from "node:buffer";

export const HUMAN_UAT_PAYMENT_SIMULATOR_PATH =
  "/__e2e/human-uat-payment-simulator.js";

export const HUMAN_UAT_PAYMENT_SIMULATOR_ENV =
  "CUSTOMER_ORDERING_HUMAN_PAYMENT_SIMULATOR";

/** Browser script body — keep semantics aligned with razorpay-checkout-mock.ts. */
export const HUMAN_UAT_PAYMENT_SIMULATOR_JS = String.raw`(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__BOBA_HUMAN_UAT_PAYMENT?.installed) return;

  const STATE = {
    installed: true,
    opened: [],
    openCount: 0,
    blockedRealCheckoutScript: false,
  };
  window.__BOBA_HUMAN_UAT_PAYMENT = STATE;

  function blockRealCheckoutScriptLoad() {
    const REAL = "https://checkout.razorpay.com/";
    const describeSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
    if (!describeSrc || typeof describeSrc.set !== "function") return;
    Object.defineProperty(HTMLScriptElement.prototype, "src", {
      configurable: true,
      enumerable: describeSrc.enumerable,
      get: function () {
        return describeSrc.get.call(this);
      },
      set: function (value) {
        const next = String(value ?? "");
        if (next.includes(REAL)) {
          STATE.blockedRealCheckoutScript = true;
          describeSrc.set.call(this, "data:application/javascript,/* boba-human-uat-payment-simulator blocked real Checkout.js */");
          queueMicrotask(() => this.dispatchEvent(new Event("load")));
          return;
        }
        describeSrc.set.call(this, value);
      },
    });
  }

  function formatAmount(options) {
    const raw = options?.amount;
    const paise = typeof raw === "string" || typeof raw === "number" ? Number(raw) : NaN;
    if (!Number.isFinite(paise)) return "";
    return "₹" + (paise / 100).toFixed(2);
  }

  function removePanel(panel) {
    panel?.remove();
  }

  function showPanel(options, handlers) {
    const existing = document.getElementById("boba-human-uat-payment-panel");
    removePanel(existing);

    const amount = formatAmount(options);
    const panel = document.createElement("div");
    panel.id = "boba-human-uat-payment-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "boba-human-uat-payment-title");
    panel.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:2147483646",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "padding:24px",
      "background:rgba(12,18,12,0.72)",
      "font-family:ui-sans-serif,system-ui,sans-serif",
    ].join(";");

    const card = document.createElement("div");
    card.style.cssText = [
      "width:min(420px,100%)",
      "background:#142016",
      "color:#f4f1e8",
      "border:1px solid #3d5a3f",
      "border-radius:16px",
      "padding:20px",
      "box-shadow:0 18px 48px rgba(0,0,0,0.45)",
    ].join(";");

    const badge = document.createElement("p");
    badge.textContent = "TEST PAYMENT — NO REAL MONEY";
    badge.style.cssText =
      "margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.04em;color:#f0c14b;";

    const title = document.createElement("h2");
    title.id = "boba-human-uat-payment-title";
    title.textContent = "Local payment simulator";
    title.style.cssText = "margin:0 0 8px;font-size:20px;line-height:1.2;";

    const copy = document.createElement("p");
    copy.textContent =
      "Choose a simulated outcome. This never calls Razorpay and never moves real money.";
    copy.style.cssText = "margin:0 0 16px;font-size:14px;line-height:1.45;opacity:0.9;";

    if (amount) {
      const amountEl = document.createElement("p");
      amountEl.textContent = "Amount: " + amount;
      amountEl.style.cssText = "margin:0 0 16px;font-size:16px;font-weight:600;";
      card.appendChild(badge);
      card.appendChild(title);
      card.appendChild(copy);
      card.appendChild(amountEl);
    } else {
      card.appendChild(badge);
      card.appendChild(title);
      card.appendChild(copy);
    }

    const actions = document.createElement("div");
    actions.style.cssText = "display:grid;gap:8px;";

    function button(label, kind, onClick) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.style.cssText = [
        "appearance:none",
        "border:0",
        "border-radius:10px",
        "padding:12px 14px",
        "font-size:14px",
        "font-weight:600",
        "cursor:pointer",
        kind === "primary"
          ? "background:#d97706;color:#111;"
          : kind === "danger"
            ? "background:#7f1d1d;color:#fff;"
            : kind === "pending"
              ? "background:#1e3a5f;color:#e2e8f0;"
              : "background:transparent;color:#d1d5db;border:1px solid #4b5563;",
      ].join(";");
      btn.addEventListener("click", onClick);
      return btn;
    }

    actions.appendChild(
      button("Simulate successful payment", "primary", () => {
        removePanel(panel);
        handlers.succeed();
      }),
    );
    actions.appendChild(
      button("Simulate definitive failure", "danger", () => {
        removePanel(panel);
        handlers.fail();
      }),
    );
    actions.appendChild(
      button("Leave payment pending", "pending", () => {
        removePanel(panel);
        handlers.pending();
      }),
    );
    actions.appendChild(
      button("Cancel / close", "ghost", () => {
        removePanel(panel);
        handlers.dismiss();
      }),
    );

    card.appendChild(actions);
    panel.appendChild(card);
    document.documentElement.appendChild(panel);
  }

  class FakeRazorpay {
    constructor(options) {
      this.options = options || {};
      this.failHandler = null;
    }
    on(event, handler) {
      if (event === "payment.failed") this.failHandler = handler;
    }
    open() {
      STATE.openCount += 1;
      STATE.opened.push(String(this.options.order_id ?? ""));
      const modal = this.options.modal;
      const handler = this.options.handler;
      const orderId = String(this.options.order_id ?? "");

      showPanel(this.options, {
        succeed: () => {
          handler?.({
            razorpay_payment_id: "pay_e2e_ok",
            razorpay_order_id: orderId,
            razorpay_signature: "sig_e2e_fake",
          });
        },
        fail: () => {
          // Authoritative failure via accepted fake-provider client-evidence path
          // (payment id containing "fail"), not browser-only payment.failed.
          handler?.({
            razorpay_payment_id: "pay_e2e_fail",
            razorpay_order_id: orderId,
            razorpay_signature: "sig_e2e_fake",
          });
        },
        pending: () => {
          modal?.ondismiss?.();
        },
        dismiss: () => {
          modal?.ondismiss?.();
        },
      });
    }
  }

  blockRealCheckoutScriptLoad();
  window.Razorpay = FakeRazorpay;
})();
`;

export function isHumanPaymentSimulatorEnabled(
  env = process.env,
) {
  const raw = env?.[HUMAN_UAT_PAYMENT_SIMULATOR_ENV];
  if (!raw) return false;
  return raw === "1" || raw.toLowerCase() === "true" || raw.toLowerCase() === "yes";
}

export function injectHumanPaymentSimulator(html) {
  if (typeof html !== "string") return html;
  if (html.includes("data-boba-human-uat-payment")) return html;
  const tag = `<script src="${HUMAN_UAT_PAYMENT_SIMULATOR_PATH}" data-boba-human-uat-payment="true"></script>`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `${tag}</head>`);
  }
  if (html.includes("<body")) {
    return html.replace(/<body([^>]*)>/i, `<body$1>${tag}`);
  }
  return `${tag}${html}`;
}

/**
 * Wrap a static-export handler so HTML responses get the simulator script when enabled.
 * Serves the simulator JS at HUMAN_UAT_PAYMENT_SIMULATOR_PATH.
 */
export function wrapStaticHandlerWithHumanPaymentSimulator(staticHandler, options = {}) {
  const enabled =
    typeof options.enabled === "boolean"
      ? options.enabled
      : isHumanPaymentSimulatorEnabled(options.env ?? process.env);

  return function humanPaymentSimulatorHandler(req, res) {
    const url = req.url ?? "/";
    const pathOnly = url.split("?")[0] ?? url;

    if (pathOnly === HUMAN_UAT_PAYMENT_SIMULATOR_PATH) {
      if (!enabled) {
        res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false }));
        return;
      }
      const body = HUMAN_UAT_PAYMENT_SIMULATOR_JS;
      res.writeHead(200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Length": Buffer.byteLength(body),
      });
      if (req.method !== "HEAD") res.end(body);
      else res.end();
      return;
    }

    if (!enabled) {
      staticHandler(req, res);
      return;
    }

    const chunks = [];
    let statusCode = 200;
    let headers = {};
    let headersSent = false;

    const originalWriteHead = res.writeHead.bind(res);
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.writeHead = (code, reasonOrHeaders, maybeHeaders) => {
      statusCode = code;
      if (typeof reasonOrHeaders === "string") {
        headers = { ...(maybeHeaders ?? {}) };
      } else {
        headers = { ...(reasonOrHeaders ?? {}) };
      }
      return res;
    };

    res.write = (chunk, encoding, cb) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      if (typeof encoding === "function") encoding();
      if (typeof cb === "function") cb();
      return true;
    };

    res.end = (chunk, encoding, cb) => {
      if (chunk && typeof chunk !== "function") {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }
      const finishCb =
        typeof chunk === "function" ? chunk : typeof encoding === "function" ? encoding : cb;

      let body = Buffer.concat(chunks);
      const contentType =
        headers["Content-Type"] ??
        headers["content-type"] ??
        "";
      if (
        statusCode === 200 &&
        typeof contentType === "string" &&
        contentType.includes("text/html")
      ) {
        const injected = injectHumanPaymentSimulator(body.toString("utf8"));
        body = Buffer.from(injected, "utf8");
        headers = {
          ...headers,
          "Content-Type": "text/html; charset=utf-8",
          "Content-Length": String(body.length),
          "Cache-Control": "no-store",
        };
      }

      if (!headersSent) {
        headersSent = true;
        originalWriteHead(statusCode, headers);
      }
      if (req.method === "HEAD") {
        originalEnd();
      } else {
        originalEnd(body);
      }
      if (typeof finishCb === "function") finishCb();
      return res;
    };

    staticHandler(req, res);
  };
}
