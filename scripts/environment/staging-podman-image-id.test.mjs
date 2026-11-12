import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizePodmanImageDigest } from "./staging.mjs";

test("normalizePodmanImageDigest prefixes bare Podman content IDs", () => {
  const bare = "eacbaf63d6c842cad2d14b1373b0a5260e4ccf51e73f92dc7a853872238b02cb";
  assert.equal(normalizePodmanImageDigest(bare), `sha256:${bare}`);
});

test("normalizePodmanImageDigest preserves canonical digests", () => {
  const digest = "sha256:dd87991a5ae411599a75e846f72e2173e234626989d9e5ab2c65785259974f87";
  assert.equal(normalizePodmanImageDigest(digest), digest);
});

test("normalizePodmanImageDigest lowercases hex and rejects non-digest strings unchanged shape", () => {
  assert.equal(
    normalizePodmanImageDigest("SHA256:DD87991A5AE411599A75E846F72E2173E234626989D9E5AB2C65785259974F87"),
    "sha256:dd87991a5ae411599a75e846f72e2173e234626989d9e5ab2c65785259974f87",
  );
  assert.equal(normalizePodmanImageDigest("localhost/boba-bear-app:local"), "localhost/boba-bear-app:local");
  assert.equal(normalizePodmanImageDigest(""), "");
  assert.equal(normalizePodmanImageDigest(null), "");
});
