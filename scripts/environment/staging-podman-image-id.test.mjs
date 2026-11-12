import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BOBA_RUNTIME_SERVICES,
  assertRunningProvenance,
  normalizePodmanImageDigest,
  samePodmanImageIdentity,
} from "./staging.mjs";

const candidateSha = "6d925496deebcf19e5a82659e3e33dc81faccac3";
const contentHex = "eacbaf63d6c842cad2d14b1373b0a5260e4ccf51e73f92dc7a853872238b02cb";
const otherHex = "dd87991a5ae411599a75e846f72e2173e234626989d9e5ab2c65785259974f87";

test("normalizePodmanImageDigest prefixes bare Podman content IDs", () => {
  assert.equal(normalizePodmanImageDigest(contentHex), `sha256:${contentHex}`);
});

test("normalizePodmanImageDigest preserves canonical digests", () => {
  const digest = `sha256:${otherHex}`;
  assert.equal(normalizePodmanImageDigest(digest), digest);
});

test("normalizePodmanImageDigest lowercases hex and leaves non-digest strings unchanged", () => {
  assert.equal(
    normalizePodmanImageDigest(`SHA256:${otherHex.toUpperCase()}`),
    `sha256:${otherHex}`,
  );
  assert.equal(normalizePodmanImageDigest("localhost/boba-bear-app:local"), "localhost/boba-bear-app:local");
  assert.equal(normalizePodmanImageDigest(""), "");
  assert.equal(normalizePodmanImageDigest(null), "");
});

test("samePodmanImageIdentity equates bare and prefixed forms of the same content ID", () => {
  assert.equal(samePodmanImageIdentity(contentHex, `sha256:${contentHex}`), true);
  assert.equal(samePodmanImageIdentity(`sha256:${contentHex}`, `sha256:${contentHex}`), true);
  assert.equal(samePodmanImageIdentity(contentHex, otherHex), false);
  assert.equal(samePodmanImageIdentity("", `sha256:${contentHex}`), false);
  assert.equal(samePodmanImageIdentity(null, contentHex), false);
  assert.equal(samePodmanImageIdentity("localhost/boba-bear-app:local", contentHex), false);
});

test("assertRunningProvenance accepts bare running ID versus equivalent prefixed built ID", () => {
  const records = BOBA_RUNTIME_SERVICES.map((service) => ({
    service,
    revision: candidateSha,
    imageId: contentHex,
  }));
  const built = Object.fromEntries(BOBA_RUNTIME_SERVICES.map((service) => [service, `sha256:${contentHex}`]));
  assert.doesNotThrow(() => assertRunningProvenance(candidateSha, records, built));
});

test("assertRunningProvenance accepts already-prefixed built and running IDs", () => {
  const records = BOBA_RUNTIME_SERVICES.map((service) => ({
    service,
    revision: candidateSha,
    imageId: `sha256:${contentHex}`,
  }));
  const built = Object.fromEntries(BOBA_RUNTIME_SERVICES.map((service) => [service, `sha256:${contentHex}`]));
  assert.doesNotThrow(() => assertRunningProvenance(candidateSha, records, built));
});

test("assertRunningProvenance rejects genuine content-ID mismatch", () => {
  const records = BOBA_RUNTIME_SERVICES.map((service) => ({
    service,
    revision: candidateSha,
    imageId: contentHex,
  }));
  const built = Object.fromEntries(BOBA_RUNTIME_SERVICES.map((service) => [service, `sha256:${otherHex}`]));
  assert.throws(() => assertRunningProvenance(candidateSha, records, built), /image id mismatch/);
});

test("assertRunningProvenance rejects invalid or missing running identity", () => {
  const built = Object.fromEntries(BOBA_RUNTIME_SERVICES.map((service) => [service, `sha256:${contentHex}`]));
  assert.throws(
    () =>
      assertRunningProvenance(
        candidateSha,
        BOBA_RUNTIME_SERVICES.map((service) => ({ service, revision: candidateSha, imageId: "" })),
        built,
      ),
    /image id mismatch/,
  );
  assert.throws(
    () =>
      assertRunningProvenance(
        candidateSha,
        BOBA_RUNTIME_SERVICES.map((service) => ({
          service,
          revision: candidateSha,
          imageId: "localhost/boba-bear-app:local",
        })),
        built,
      ),
    /image id mismatch/,
  );
  assert.throws(
    () =>
      assertRunningProvenance(
        candidateSha,
        BOBA_RUNTIME_SERVICES.map((service) => ({ service, revision: candidateSha })),
        built,
      ),
    /image id mismatch/,
  );
});

test("assertRunningProvenance verifies a successful exact-candidate running set", () => {
  const records = BOBA_RUNTIME_SERVICES.map((service, index) => {
    const hex = index.toString(16).padStart(64, "c");
    return { service, revision: candidateSha, imageId: hex };
  });
  const built = Object.fromEntries(
    records.map((record) => [record.service, `sha256:${record.imageId}`]),
  );
  assert.doesNotThrow(() => assertRunningProvenance(candidateSha, records, built));
});
