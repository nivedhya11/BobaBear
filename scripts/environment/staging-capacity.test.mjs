import assert from "node:assert/strict";
import { test } from "node:test";

import {
  evaluateStagingCapacity,
  parseDfAvailBytes,
  parseDfAvailBytesForPath,
  parseMemAvailableBytes,
  STAGING_CAPACITY_POLICY,
} from "./staging-capacity.mjs";

const GIB = 1024 ** 3;

test("AD-PF-02 thresholds are the Founder-approved floors", () => {
  assert.equal(STAGING_CAPACITY_POLICY.MIN_DISK_GIB, 40);
  assert.equal(STAGING_CAPACITY_POLICY.MIN_MEMORY_GIB, 8);
  assert.equal(STAGING_CAPACITY_POLICY.DISK_FOOTPRINT_MULTIPLE, 2);
  assert.equal(STAGING_CAPACITY_POLICY.MEMORY_PEAK_MULTIPLE, 1.5);
});

test("unmeasured footprint/peak fail closed as null sufficiency", () => {
  const result = evaluateStagingCapacity({
    filesystems: [{ path: "/", availableBytes: 100 * GIB }],
    availableMemoryBytes: 16 * GIB,
    priorImagesPreserved: true,
    unintendedPostgresReplacement: false,
  });
  assert.equal(result.diskSufficient, null);
  assert.equal(result.memorySufficient, null);
  assert.equal(result.measured, false);
  assert.ok(result.reasons.includes("BUILD_FOOTPRINT_UNMEASURED"));
  assert.ok(result.reasons.includes("PEAK_MEMORY_UNMEASURED"));
});

test("positive capacity pass requires floors and measured headroom", () => {
  const result = evaluateStagingCapacity({
    filesystems: [
      { path: "/home/ajoshi", availableBytes: 100 * GIB },
      { path: "/var/tmp", availableBytes: 100 * GIB },
      { path: "/tmp", availableBytes: 100 * GIB },
    ],
    availableMemoryBytes: 12 * GIB,
    measuredIncrementalBuildFootprintBytes: 5 * GIB,
    measuredIncrementalPeakMemoryBytes: 2 * GIB,
    priorImagesPreserved: true,
    unintendedPostgresReplacement: false,
  });
  assert.equal(result.diskSufficient, true);
  assert.equal(result.memorySufficient, true);
  assert.equal(result.measured, true);
});

test("memory below 8 GiB floor fails even with headroom", () => {
  const result = evaluateStagingCapacity({
    filesystems: [{ path: "/", availableBytes: 100 * GIB }],
    availableMemoryBytes: 7 * GIB,
    measuredIncrementalBuildFootprintBytes: 1 * GIB,
    measuredIncrementalPeakMemoryBytes: 1 * GIB,
    priorImagesPreserved: true,
    unintendedPostgresReplacement: false,
  });
  assert.equal(result.memorySufficient, false);
});

test("parsers extract avail bytes without inventing mounts", () => {
  const filesystems = parseDfAvailBytes("Avail Mounted on\n1000 /home/ajoshi\n2000 /tmp\n", [
    "/home/ajoshi",
    "/missing",
  ]);
  assert.deepEqual(filesystems, [
    { path: "/home/ajoshi", availableBytes: 1000 },
    { path: "/missing", availableBytes: null },
  ]);
  assert.deepEqual(parseDfAvailBytesForPath("Avail\n861823041536\n", "/home/ajoshi"), {
    path: "/home/ajoshi",
    availableBytes: 861823041536,
  });
  assert.equal(parseMemAvailableBytes("MemAvailable:\t 123456 kB\n"), 123456 * 1024);
  assert.equal(parseMemAvailableBytes("MemTotal: 1 kB\n"), null);
});
