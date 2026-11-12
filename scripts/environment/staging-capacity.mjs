/**
 * Founder staging Gate-2 capacity measurement (AD-PF-02 / D-386 policy).
 *
 * Thresholds are Founder-approved (2026-10-24). Missing measurements fail closed.
 * This module never invents footprint or peak-memory figures.
 */
export const STAGING_CAPACITY_POLICY = Object.freeze({
  /** GiB available free disk floor on each relevant filesystem. */
  MIN_DISK_GIB: 40,
  /** Available memory floor immediately before the operation. */
  MIN_MEMORY_GIB: 8,
  /** Required multiple of measured incremental build footprint. */
  DISK_FOOTPRINT_MULTIPLE: 2,
  /** Required multiple of measured incremental peak memory demand. */
  MEMORY_PEAK_MULTIPLE: 1.5,
  /**
   * Policy authority note. Register merge of D-386 remains separate; thresholds
   * themselves were Founder-approved as AD-PF-02.
   */
  AUTHORITY: "FOUNDER_AD_PF_02_2026_10_24",
});

const GIB = 1024 ** 3;

/**
 * @param {number | null | undefined} bytes
 */
export function bytesToGib(bytes) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return null;
  return bytes / GIB;
}

/**
 * @param {{
 *   filesystems?: Array<{ path: string, availableBytes: number | null }>,
 *   availableMemoryBytes?: number | null,
 *   measuredIncrementalBuildFootprintBytes?: number | null,
 *   measuredIncrementalPeakMemoryBytes?: number | null,
 *   priorImagesPreserved?: boolean | null,
 *   unintendedPostgresReplacement?: boolean | null,
 * }} input
 */
export function evaluateStagingCapacity(input = {}) {
  const filesystems = Array.isArray(input.filesystems) ? input.filesystems : [];
  const reasons = [];
  const footprint = input.measuredIncrementalBuildFootprintBytes;
  const peak = input.measuredIncrementalPeakMemoryBytes;

  if (filesystems.length === 0) reasons.push("CAPACITY_FILESYSTEMS_UNMEASURED");

  const filesystemMeasured =
    filesystems.length > 0 &&
    filesystems.every((fs) => typeof fs?.availableBytes === "number" && Number.isFinite(fs.availableBytes));
  if (!filesystemMeasured) reasons.push("FILESYSTEM_BYTES_UNMEASURED");

  const footprintMeasured = typeof footprint === "number" && Number.isFinite(footprint) && footprint >= 0;
  if (!footprintMeasured) reasons.push("BUILD_FOOTPRINT_UNMEASURED");

  /** @type {boolean | null} */
  let diskSufficient = null;
  if (filesystemMeasured && footprintMeasured) {
    diskSufficient = filesystems.every((fs) => {
      const availableGib = fs.availableBytes / GIB;
      const floorOk = availableGib >= STAGING_CAPACITY_POLICY.MIN_DISK_GIB;
      const headroomOk =
        fs.availableBytes >= footprint * STAGING_CAPACITY_POLICY.DISK_FOOTPRINT_MULTIPLE;
      return floorOk && headroomOk;
    });
    if (diskSufficient !== true) reasons.push("DISK_INSUFFICIENT");
  }

  const memoryBytesMeasured =
    typeof input.availableMemoryBytes === "number" && Number.isFinite(input.availableMemoryBytes);
  if (!memoryBytesMeasured) reasons.push("MEMORY_UNMEASURED");

  const peakMeasured = typeof peak === "number" && Number.isFinite(peak) && peak >= 0;
  if (!peakMeasured) reasons.push("PEAK_MEMORY_UNMEASURED");

  /** @type {boolean | null} */
  let memorySufficient = null;
  if (memoryBytesMeasured && peakMeasured) {
    const availableGib = input.availableMemoryBytes / GIB;
    memorySufficient =
      availableGib >= STAGING_CAPACITY_POLICY.MIN_MEMORY_GIB &&
      input.availableMemoryBytes >= peak * STAGING_CAPACITY_POLICY.MEMORY_PEAK_MULTIPLE;
    if (memorySufficient !== true) reasons.push("MEMORY_INSUFFICIENT");
  }

  const priorImagesPreserved =
    input.priorImagesPreserved === true || input.priorImagesPreserved === false
      ? input.priorImagesPreserved
      : null;
  if (priorImagesPreserved === null) reasons.push("PRIOR_IMAGES_PRESERVATION_UNMEASURED");

  const unintendedPostgresReplacement =
    input.unintendedPostgresReplacement === true || input.unintendedPostgresReplacement === false
      ? input.unintendedPostgresReplacement
      : null;
  if (unintendedPostgresReplacement === null) reasons.push("POSTGRES_REPLACEMENT_RISK_UNMEASURED");

  const measured =
    diskSufficient !== null &&
    memorySufficient !== null &&
    priorImagesPreserved !== null &&
    unintendedPostgresReplacement !== null;

  return {
    measured,
    diskSufficient,
    memorySufficient,
    priorImagesPreserved,
    unintendedPostgresReplacement,
    reasons: [...new Set(reasons)],
    policy: STAGING_CAPACITY_POLICY.AUTHORITY,
    thresholds: {
      minDiskGib: STAGING_CAPACITY_POLICY.MIN_DISK_GIB,
      minMemoryGib: STAGING_CAPACITY_POLICY.MIN_MEMORY_GIB,
      diskFootprintMultiple: STAGING_CAPACITY_POLICY.DISK_FOOTPRINT_MULTIPLE,
      memoryPeakMultiple: STAGING_CAPACITY_POLICY.MEMORY_PEAK_MULTIPLE,
    },
  };
}

/**
 * Parse a single-path `df -B1 --output=avail PATH` result.
 * Prefer per-path probes: shared mountpoints like `/` must still map back to
 * each requested path rather than requiring the printed mount string to match.
 * @param {string} dfOutput
 * @param {string} requestedPath
 */
export function parseDfAvailBytesForPath(dfOutput, requestedPath) {
  const lines = String(dfOutput ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (/^Avail/i.test(line) || /^Filesystem/i.test(line)) continue;
    const match = line.match(/^(\d+)\b/);
    if (!match) continue;
    return { path: requestedPath, availableBytes: Number(match[1]) };
  }
  return { path: requestedPath, availableBytes: null };
}

/**
 * Parse multi-line `df -B1 --output=avail,target` output keyed by printed mount.
 * Kept for fixtures; live probes should use per-path parsing because requested
 * paths often share one mountpoint (for example `/`).
 * @param {string} dfOutput
 * @param {string[]} requiredMounts
 */
export function parseDfAvailBytes(dfOutput, requiredMounts) {
  const lines = String(dfOutput ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  /** @type {Map<string, number>} */
  const byMount = new Map();
  for (const line of lines) {
    if (/^Avail/i.test(line) || /^Filesystem/i.test(line)) continue;
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (!match) continue;
    byMount.set(match[2], Number(match[1]));
  }
  return requiredMounts.map((mount) => ({
    path: mount,
    availableBytes: byMount.has(mount) ? byMount.get(mount) : null,
  }));
}

/**
 * Parse MemAvailable from /proc/meminfo (kB).
 * @param {string} meminfo
 */
export function parseMemAvailableBytes(meminfo) {
  const match = String(meminfo ?? "").match(/^MemAvailable:\s+(\d+)\s+kB$/m);
  if (!match) return null;
  return Number(match[1]) * 1024;
}
