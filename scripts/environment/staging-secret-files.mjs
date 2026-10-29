/**
 * Owner-only secret file creation and read-only mode inspection.
 * Inspection never chmods. Creation of a new file uses an exclusive open and
 * unlinks that new file if the resulting mode is not 0600.
 */
import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import path from "node:path";

export class SecretFileModeError extends Error {
  /**
   * @param {string} code
   * @param {string} [detail]
   */
  constructor(code, detail = "") {
    super(detail.length > 0 ? `${code} ${detail}` : code);
    this.name = "SecretFileModeError";
    this.code = code;
  }
}

function modeOf(stat) {
  return stat.mode & 0o777;
}

/**
 * Read-only. Does not chmod.
 * @param {string} filePath
 */
export function inspectOwnerOnlyFile(filePath) {
  let stat;
  try {
    stat = lstatSync(filePath);
  } catch {
    return { ok: false, kind: "missing", mode: null };
  }
  if (stat.isSymbolicLink()) return { ok: false, kind: "symlink", mode: modeOf(stat).toString(8) };
  if (!stat.isFile()) return { ok: false, kind: "not-regular", mode: modeOf(stat).toString(8) };
  const mode = modeOf(stat);
  if (mode !== 0o600) return { ok: false, kind: "mode", mode: mode.toString(8).padStart(3, "0") };
  return { ok: true, kind: "file", mode: "600" };
}

/**
 * Read-only directory check. Does not chmod.
 * @param {string} dirPath
 */
export function inspectOwnerOnlyDirectory(dirPath) {
  let stat;
  try {
    stat = lstatSync(dirPath);
  } catch {
    return { ok: false, kind: "missing", mode: null };
  }
  if (stat.isSymbolicLink()) return { ok: false, kind: "symlink", mode: modeOf(stat).toString(8) };
  if (!stat.isDirectory()) return { ok: false, kind: "not-directory", mode: modeOf(stat).toString(8) };
  const mode = modeOf(stat);
  if (mode !== 0o700) return { ok: false, kind: "mode", mode: mode.toString(8).padStart(3, "0") };
  return { ok: true, kind: "directory", mode: "700" };
}

/**
 * Fail if an existing secret file is not already mode 0600. Does not chmod.
 * @param {string} filePath
 */
export function assertExistingOwnerOnlyFile(filePath) {
  const inspected = inspectOwnerOnlyFile(filePath);
  if (!inspected.ok) {
    throw new SecretFileModeError("SECRET_FILE_MODE_INSECURE", inspected.kind ?? "rejected");
  }
}

/**
 * @param {string} filePath
 * @param {string | Buffer} contents
 * @param {{ confineTo?: string }} [options]
 */
export function createOwnerOnlySecretFile(filePath, contents, options = {}) {
  const resolved = path.resolve(filePath);
  if (options.confineTo) {
    const root = path.resolve(options.confineTo);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
      throw new SecretFileModeError("SECRET_FILE_MODE_INSECURE", "path");
    }
  }
  const parent = path.dirname(resolved);
  const parentStat = lstatSync(parent);
  if (parentStat.isSymbolicLink() || !parentStat.isDirectory()) {
    throw new SecretFileModeError("SECRET_FILE_MODE_INSECURE", "parent");
  }
  const fd = openSync(resolved, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try {
    writeSync(fd, contents);
    fchmodSync(fd, 0o600);
    const stat = fstatSync(fd);
    if (!stat.isFile() || modeOf(stat) !== 0o600) {
      throw new SecretFileModeError("SECRET_FILE_MODE_INSECURE", "create");
    }
  } catch (error) {
    closeSync(fd);
    try {
      unlinkSync(resolved);
    } catch {
      // The exclusive create is cleaned up when the filesystem allows it.
    }
    throw error;
  }
  closeSync(fd);
}

/**
 * Copy secret bytes. An existing insecure or symlinked destination is rejected
 * and left unchanged.
 * @param {string} sourcePath
 * @param {string} destPath
 */
export function copyOwnerOnlySecretFile(sourcePath, destPath) {
  const source = inspectOwnerOnlyFile(sourcePath);
  if (!source.ok) throw new SecretFileModeError("SECRET_FILE_MODE_INSECURE", "source");
  const contents = readFileSync(sourcePath);
  let destStat = null;
  try {
    destStat = lstatSync(destPath);
  } catch {
    destStat = null;
  }
  if (!destStat) {
    createOwnerOnlySecretFile(destPath, contents);
    return;
  }
  if (destStat.isSymbolicLink() || !destStat.isFile() || modeOf(destStat) !== 0o600) {
    throw new SecretFileModeError("SECRET_FILE_MODE_INSECURE", "destination");
  }
  const fd = openSync(destPath, constants.O_WRONLY | constants.O_TRUNC | constants.O_NOFOLLOW);
  try {
    writeSync(fd, contents);
    const stat = fstatSync(fd);
    if (!stat.isFile() || modeOf(stat) !== 0o600) {
      throw new SecretFileModeError("SECRET_FILE_MODE_INSECURE", "rewrite");
    }
  } finally {
    closeSync(fd);
  }
}

/**
 * Create a secret directory at 0700. An existing directory with another mode
 * is rejected and not chmodded.
 * @param {string} dirPath
 */
export function ensureOwnerOnlySecretDirectory(dirPath) {
  try {
    lstatSync(dirPath);
  } catch {
    mkdirSync(dirPath, { recursive: true, mode: 0o700 });
  }
  const inspected = inspectOwnerOnlyDirectory(dirPath);
  if (!inspected.ok) throw new SecretFileModeError("SECRET_FILE_MODE_INSECURE", "directory");
}

/**
 * Restrict a file this process just created. Throws instead of ignoring chmod failure.
 * Does not widen an existing mode silently: a non-0600 result throws.
 * @param {string} filePath
 */
export function restrictNewSecretFile(filePath) {
  const fd = openSync(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    fchmodSync(fd, 0o600);
    const stat = fstatSync(fd);
    if (!stat.isFile() || modeOf(stat) !== 0o600) {
      throw new SecretFileModeError("SECRET_FILE_MODE_INSECURE", "restrict");
    }
  } finally {
    closeSync(fd);
  }
}
