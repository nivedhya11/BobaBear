/**
 * Loopback port allocation for disposable E2E harnesses.
 * Prefer a fixed port when free so existing defaults stay stable; otherwise
 * bind an ephemeral 127.0.0.1 port so concurrent protected sessions (e.g. XR-010)
 * are not collided with or torn down.
 */
import net from "node:net";

/**
 * @returns {Promise<number>}
 */
export function allocateLoopbackPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("failed to allocate a loopback port"));
        return;
      }
      const { port } = address;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

/**
 * @param {number} port
 * @returns {Promise<boolean>}
 */
export function isLoopbackPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close((error) => resolve(!error));
    });
  });
}

/**
 * @param {number | undefined | null} preferred
 * @returns {Promise<number>}
 */
export async function resolveLoopbackPort(preferred) {
  if (
    typeof preferred === "number" &&
    Number.isInteger(preferred) &&
    preferred > 0 &&
    preferred <= 65535
  ) {
    if (await isLoopbackPortFree(preferred)) return preferred;
  }
  return allocateLoopbackPort();
}
