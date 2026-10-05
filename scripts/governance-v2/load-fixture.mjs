import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * @param {string} root
 * @param {string} name
 */
export function loadFixture(root, name) {
  const raw = JSON.parse(readFileSync(path.join(root, "scripts/governance-v2/fixtures", name), "utf8"));
  if (raw.TEST_ONLY !== true || raw.NON_AUTHORITATIVE !== true) {
    throw new Error(`${name} must be marked TEST_ONLY and NON_AUTHORITATIVE`);
  }
  return raw;
}

/**
 * Structured clone without using narrative fields if a caller smuggles them in.
 * @param {object} value
 */
export function structuredState(value) {
  const rest = { ...value };
  delete rest.narrative;
  delete rest.prose;
  return structuredClone(rest);
}
