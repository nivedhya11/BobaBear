import assert from "node:assert/strict";
import http from "node:http";
import { describe, it } from "node:test";

import {
  HUMAN_UAT_PAYMENT_SIMULATOR_ENV,
  HUMAN_UAT_PAYMENT_SIMULATOR_JS,
  HUMAN_UAT_PAYMENT_SIMULATOR_PATH,
  injectHumanPaymentSimulator,
  isHumanPaymentSimulatorEnabled,
  wrapStaticHandlerWithHumanPaymentSimulator,
} from "./human-uat-payment-simulator.mjs";

describe("human-uat-payment-simulator", () => {
  it("is disabled unless the harness env flag is explicitly set", () => {
    assert.equal(isHumanPaymentSimulatorEnabled({}), false);
    assert.equal(
      isHumanPaymentSimulatorEnabled({ [HUMAN_UAT_PAYMENT_SIMULATOR_ENV]: "0" }),
      false,
    );
    assert.equal(
      isHumanPaymentSimulatorEnabled({ [HUMAN_UAT_PAYMENT_SIMULATOR_ENV]: "1" }),
      true,
    );
    assert.equal(
      isHumanPaymentSimulatorEnabled({ [HUMAN_UAT_PAYMENT_SIMULATOR_ENV]: "true" }),
      true,
    );
  });

  it("injects a single harness script tag into HTML head", () => {
    const html = "<!doctype html><html><head><title>t</title></head><body>ok</body></html>";
    const once = injectHumanPaymentSimulator(html);
    assert.match(once, /data-boba-human-uat-payment="true"/);
    assert.match(once, new RegExp(HUMAN_UAT_PAYMENT_SIMULATOR_PATH.replace(/\//g, "\\/")));
    const twice = injectHumanPaymentSimulator(once);
    assert.equal(
      twice.split("data-boba-human-uat-payment").length - 1,
      1,
      "injection must be idempotent",
    );
  });

  it("keeps Playwright-compatible fake evidence ids and the no-real-money banner", () => {
    assert.match(HUMAN_UAT_PAYMENT_SIMULATOR_JS, /TEST PAYMENT — NO REAL MONEY/);
    assert.match(HUMAN_UAT_PAYMENT_SIMULATOR_JS, /pay_e2e_ok/);
    assert.match(HUMAN_UAT_PAYMENT_SIMULATOR_JS, /pay_e2e_fail/);
    assert.match(HUMAN_UAT_PAYMENT_SIMULATOR_JS, /sig_e2e_fake/);
    assert.match(HUMAN_UAT_PAYMENT_SIMULATOR_JS, /blockedRealCheckoutScript/);
    assert.match(HUMAN_UAT_PAYMENT_SIMULATOR_JS, /Simulate successful payment/);
    assert.match(HUMAN_UAT_PAYMENT_SIMULATOR_JS, /Simulate definitive failure/);
    assert.match(HUMAN_UAT_PAYMENT_SIMULATOR_JS, /Leave payment pending/);
  });

  it("serves the simulator script and injects HTML only when enabled", async () => {
    const staticHandler = (req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<!doctype html><html><head></head><body>menu</body></html>");
    };

    const disabled = wrapStaticHandlerWithHumanPaymentSimulator(staticHandler, {
      enabled: false,
    });
    const enabled = wrapStaticHandlerWithHumanPaymentSimulator(staticHandler, {
      enabled: true,
    });

    await withServer(disabled, async (origin) => {
      const page = await fetch(`${origin}/order/`);
      const html = await page.text();
      assert.equal(html.includes("data-boba-human-uat-payment"), false);
      const script = await fetch(`${origin}${HUMAN_UAT_PAYMENT_SIMULATOR_PATH}`);
      assert.equal(script.status, 404);
    });

    await withServer(enabled, async (origin) => {
      const page = await fetch(`${origin}/order/`);
      const html = await page.text();
      assert.match(html, /data-boba-human-uat-payment="true"/);
      const script = await fetch(`${origin}${HUMAN_UAT_PAYMENT_SIMULATOR_PATH}`);
      assert.equal(script.status, 200);
      const body = await script.text();
      assert.match(body, /__BOBA_HUMAN_UAT_PAYMENT/);
      assert.match(body, /FakeRazorpay/);
    });
  });
});

async function withServer(handler, fn) {
  const server = http.createServer(handler);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    await fn(origin);
  } finally {
    await new Promise((resolve) => server.close(() => resolve()));
  }
}
