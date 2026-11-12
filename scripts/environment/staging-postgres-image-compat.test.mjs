import assert from "node:assert/strict";
import { test } from "node:test";

import {
  extractPostgresImageFacts,
  parsePgVersionFile,
  parsePostgresMajor,
  probeCandidatePostgresImageCompat,
  STAGING_POSTGRES_CANDIDATE_IMAGE,
} from "./staging-postgres-image-compat.mjs";

function imageInspect({
  id = "sha256:abc123",
  tags = [STAGING_POSTGRES_CANDIDATE_IMAGE],
  env = ["PG_MAJOR=18", "PATH=/usr/bin"],
  labels = {},
} = {}) {
  return JSON.stringify([
    {
      Id: id,
      RepoTags: tags,
      Config: { Env: env, Labels: labels },
    },
  ]);
}

test("parsePostgresMajor reads tags and PG_VERSION text", () => {
  assert.equal(parsePostgresMajor("18"), 18);
  assert.equal(parsePostgresMajor("postgres:18.4-trixie"), 18);
  assert.equal(parsePostgresMajor("docker.io/library/postgres:16.4"), 16);
  assert.equal(parsePostgresMajor(""), null);
  assert.equal(parsePgVersionFile("18\n"), 18);
});

test("extractPostgresImageFacts prefers PG_MAJOR env", () => {
  const facts = extractPostgresImageFacts({
    Id: "sha256:1",
    RepoTags: ["boba-bear-postgres:local"],
    Config: { Env: ["PG_MAJOR=18"] },
  });
  assert.equal(facts.major, 18);
  assert.equal(facts.imageId, "sha256:1");
});

test("compatible candidate image with matching existing major PASSes", () => {
  const result = probeCandidatePostgresImageCompat({
    run: () => imageInspect(),
    existingDatabaseMajor: 18,
  });
  assert.equal(result.imageCompatConflict, false);
  assert.equal(result.major, 18);
  assert.equal(result.existingMajor, 18);
  assert.equal(result.imageRef, STAGING_POSTGRES_CANDIDATE_IMAGE);
});

test("absent existing major with readable candidate stays compatible", () => {
  const result = probeCandidatePostgresImageCompat({
    run: () => imageInspect(),
    existingDatabaseMajor: null,
  });
  assert.equal(result.imageCompatConflict, false);
  assert.equal(result.existingMajor, null);
});

test("incompatible candidate major is a conflict", () => {
  const result = probeCandidatePostgresImageCompat({
    run: () => imageInspect({ env: ["PG_MAJOR=16"] }),
    existingDatabaseMajor: null,
  });
  assert.equal(result.imageCompatConflict, true);
  assert.equal(result.major, 16);
});

test("incompatible existing database major is a conflict", () => {
  const result = probeCandidatePostgresImageCompat({
    run: () => imageInspect(),
    existingDatabaseMajor: 16,
  });
  assert.equal(result.imageCompatConflict, true);
  assert.equal(result.existingMajor, 16);
});

test("unexpected image identity is a conflict", () => {
  const result = probeCandidatePostgresImageCompat({
    run: () => imageInspect({ tags: ["docker.io/library/postgres:18.4-trixie"] }),
    candidateImage: "boba-bear-postgres:local",
  });
  assert.equal(result.imageCompatConflict, true);
  assert.match(result.detail ?? "", /unexpected postgres image identity/i);
});

test("unreadable database-version evidence stays UNKNOWN", () => {
  const result = probeCandidatePostgresImageCompat({
    run: () => imageInspect(),
    readExistingDatabaseMajor: () => {
      throw new Error("PG_VERSION unreadable");
    },
  });
  assert.equal(result.imageCompatConflict, null);
  assert.match(result.detail ?? "", /unreadable/i);
});

test("missing candidate image stays UNKNOWN", () => {
  const result = probeCandidatePostgresImageCompat({
    run: () => {
      throw new Error("no such image");
    },
  });
  assert.equal(result.imageCompatConflict, null);
  assert.match(result.detail ?? "", /no such image/);
});

test("unreadable image major stays UNKNOWN", () => {
  const result = probeCandidatePostgresImageCompat({
    run: () => imageInspect({ env: ["PATH=/usr/bin"], tags: ["boba-bear-postgres:local"], labels: {} }),
  });
  assert.equal(result.imageCompatConflict, null);
  assert.match(result.detail ?? "", /major unreadable/i);
});

test("empty image tags stay UNKNOWN", () => {
  const result = probeCandidatePostgresImageCompat({
    run: () => imageInspect({ tags: [], env: ["PG_MAJOR=18"] }),
  });
  assert.equal(result.imageCompatConflict, null);
  assert.match(result.detail ?? "", /tags unreadable/i);
});
