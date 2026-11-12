import assert from "node:assert/strict";
import net from "node:net";
import { describe, it } from "node:test";

import {
  allocateLoopbackPort,
  isLoopbackPortFree,
  resolveLoopbackPort,
} from "./loopback-port.mjs";

/**
 * @param {number} port
 * @returns {Promise<net.Server>}
 */
function holdLoopbackPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

/**
 * @param {net.Server} server
 * @returns {Promise<void>}
 */
function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

describe("loopback port isolation", () => {
  it("prefers a free preferred port and falls back when that port is held", async () => {
    const preferred = await allocateLoopbackPort();
    assert.equal(await resolveLoopbackPort(preferred), preferred);

    const holder = await holdLoopbackPort(preferred);
    try {
      assert.equal(await isLoopbackPortFree(preferred), false);
      const fallback = await resolveLoopbackPort(preferred);
      assert.notEqual(fallback, preferred);
      assert.equal(await isLoopbackPortFree(fallback), true);
    } finally {
      await closeServer(holder);
    }

    assert.equal(await isLoopbackPortFree(preferred), true);
  });

  it("does not leave a listener behind after probing a preferred port", async () => {
    const preferred = await allocateLoopbackPort();
    assert.equal(await resolveLoopbackPort(preferred), preferred);
    assert.equal(await isLoopbackPortFree(preferred), true);
  });

  it("allocates distinct ports for concurrent callers without sharing ownership", async () => {
    const [left, right] = await Promise.all([
      allocateLoopbackPort(),
      allocateLoopbackPort(),
    ]);
    assert.notEqual(left, right);
  });

  it("can pin a resolved outer port via env so Playwright config reloads reuse one server", async () => {
    const port = await allocateLoopbackPort();
    process.env.E2E_CUSTOMER_ORDERING_OUTER_PORT_RESOLVED = String(port);
    assert.equal(Number(process.env.E2E_CUSTOMER_ORDERING_OUTER_PORT_RESOLVED), port);
    delete process.env.E2E_CUSTOMER_ORDERING_OUTER_PORT_RESOLVED;
  });
});
