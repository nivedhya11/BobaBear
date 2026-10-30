/**
 * age encrypt/decrypt wrappers for IMP-037 Layer 2.
 * Production backup encrypt path uses recipients only — identity/private key FORBIDDEN.
 *
 * CS1: decrypt success/failure must not leave reusable owned plaintext under /tmp.
 * Crash/SIGKILL cleanup is NOT guaranteed by try/finally (residual risk).
 */
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, unlinkSync, existsSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { redactText } from "../redact.mjs";

/** Basename prefix for decrypt-owned host temps. Foreign paths are never deleted. */
export const OWNED_AGE_TEMP_PREFIX = "boba-age-";

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export function resolveAgeBinary(env = process.env) {
  if (typeof env.BOBA_RECOVERY_AGE_BIN === "string" && env.BOBA_RECOVERY_AGE_BIN.trim()) {
    return env.BOBA_RECOVERY_AGE_BIN.trim();
  }
  if (typeof env.AGE_BIN === "string" && env.AGE_BIN.trim()) {
    return env.AGE_BIN.trim();
  }
  return "age";
}

/**
 * Stable non-secret reference for metadata (hash of public recipient string).
 * @param {string} recipient
 * @returns {string}
 */
export function fingerprintRecipient(recipient) {
  if (typeof recipient !== "string" || recipient.trim().length === 0) {
    throw new Error("recipient is required for fingerprint");
  }
  return createHash("sha256").update(recipient.trim(), "utf8").digest("hex").slice(0, 16);
}

/**
 * Collision-resistant owned temp path under os.tmpdir().
 * @param {string} kind short label (enc|dec|in|restore)
 * @param {string} [suffix]
 * @param {string} [ownershipToken] opaque token embedded in the basename
 * @returns {{ path: string, ownershipToken: string }}
 */
export function createOwnedAgeTempPath(kind, suffix = ".bin", ownershipToken) {
  const token =
    typeof ownershipToken === "string" && ownershipToken.trim()
      ? ownershipToken.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48)
      : randomBytes(12).toString("hex");
  const safeKind = String(kind || "tmp").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "tmp";
  const safeSuffix = typeof suffix === "string" && suffix.startsWith(".") ? suffix : `.${suffix || "bin"}`;
  const name = `${OWNED_AGE_TEMP_PREFIX}${safeKind}-${token}-${process.pid}-${Date.now()}-${randomBytes(4).toString("hex")}${safeSuffix}`;
  return { path: path.join(tmpdir(), name), ownershipToken: token };
}

/**
 * Delete only an exact run-owned temp path under os.tmpdir() with the expected basename prefix.
 * Never deletes arbitrary caller-supplied paths without ownership proof.
 *
 * @param {string} filePath
 * @param {string} ownershipToken
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function cleanupOwnedAgeTempPath(filePath, ownershipToken) {
  if (typeof filePath !== "string" || !filePath.trim()) {
    return { ok: false, reason: "cleanup refused: empty path" };
  }
  if (typeof ownershipToken !== "string" || !ownershipToken.trim()) {
    return { ok: false, reason: "cleanup refused: missing ownership token" };
  }
  const resolved = path.resolve(filePath.trim());
  const tmpRoot = path.resolve(tmpdir());
  if (resolved !== tmpRoot && !resolved.startsWith(`${tmpRoot}${path.sep}`)) {
    return { ok: false, reason: "cleanup refused: path escapes tmpdir" };
  }
  const base = path.basename(resolved);
  const token = ownershipToken.trim();
  if (!base.startsWith(OWNED_AGE_TEMP_PREFIX) || !base.includes(`-${token}-`)) {
    return { ok: false, reason: "cleanup refused: path is not owned by this recovery temp token" };
  }
  try {
    if (existsSync(resolved)) unlinkSync(resolved);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: redactText(errorMessage(error)) };
  }
}

/**
 * Write bytes to an owned temp file with restrictive permissions (0600).
 * @param {Buffer} body
 * @param {{ kind?: string, suffix?: string, ownershipToken?: string }} [options]
 * @returns {{ ok: true, path: string, ownershipToken: string } | { ok: false, reason: string }}
 */
export function writeOwnedAgeTempFile(body, options = {}) {
  const created = createOwnedAgeTempPath(options.kind ?? "restore", options.suffix ?? ".dump", options.ownershipToken);
  try {
    writeFileSync(created.path, body, { mode: 0o600 });
    try {
      chmodSync(created.path, 0o600);
    } catch {
      // best-effort on platforms that ignore mode
    }
    return { ok: true, path: created.path, ownershipToken: created.ownershipToken };
  } catch (error) {
    try {
      if (existsSync(created.path)) unlinkSync(created.path);
    } catch {
      // ignore
    }
    return { ok: false, reason: redactText(errorMessage(error)) };
  }
}

/**
 * Encrypt plaintext to age ciphertext using recipients only.
 * `identityFile` is FORBIDDEN on the encrypt path.
 *
 * @param {object} options
 * @param {import("node:stream").Readable | Buffer | string} [options.plaintextStream]
 * @param {import("node:stream").Readable | Buffer | string} [options.plaintext]
 * @param {string[]} options.recipients
 * @param {string} [options.ageBin]
 * @param {string} [options.outputPath]
 * @param {unknown} [options.identityFile]
 * @returns {Promise<{ ok: true, outputPath: string, ciphertext: Buffer } | { ok: false, reason: string }>}
 */
export async function encryptToAge(options) {
  if (options?.identityFile != null) {
    return {
      ok: false,
      reason: "identityFile / private key is FORBIDDEN on the age encrypt (backup) path",
    };
  }
  const recipients = Array.isArray(options?.recipients)
    ? options.recipients.filter((value) => typeof value === "string" && value.trim().length > 0)
    : [];
  if (recipients.length === 0) {
    return { ok: false, reason: "age encrypt requires at least one recipient" };
  }
  const ageBin = options.ageBin ?? resolveAgeBinary();
  const source = options.plaintextStream ?? options.plaintext;
  if (source == null) {
    return { ok: false, reason: "plaintextStream or plaintext is required" };
  }

  const callerOwned =
    typeof options.outputPath === "string" && options.outputPath.length > 0;
  const owned = callerOwned
    ? { path: options.outputPath, ownershipToken: "" }
    : createOwnedAgeTempPath("enc", ".age");
  const outputPath = owned.path;

  const args = [];
  for (const recipient of recipients) {
    args.push("-r", recipient.trim());
  }
  args.push("-o", outputPath);

  try {
    await runAge(ageBin, args, toReadable(source));
    try {
      chmodSync(outputPath, 0o600);
    } catch {
      // best-effort
    }
    const ciphertext = readFileSync(outputPath);
    return { ok: true, outputPath, ciphertext };
  } catch (error) {
    if (!callerOwned) {
      cleanupOwnedAgeTempPath(outputPath, owned.ownershipToken);
    } else {
      try {
        if (existsSync(outputPath)) unlinkSync(outputPath);
      } catch {
        // ignore
      }
    }
    return { ok: false, reason: redactText(errorMessage(error)) };
  }
}

/**
 * Decrypt age ciphertext for restore/drill only (requires identity file).
 *
 * Successful decrypt returns plaintext bytes and removes the owned host plaintext
 * dump created for age -o (unless retainOwnedPlaintextFile=true for explicit caller ownership).
 *
 * @param {object} options
 * @param {Buffer | string} options.ciphertext
 * @param {string} options.identityFile
 * @param {string} [options.ageBin]
 * @param {string} [options.outputPath] caller-owned path; caller must cleanup
 * @param {boolean} [options.retainOwnedPlaintextFile] keep owned default temp (tests only)
 * @returns {Promise<
 *   | { ok: true, outputPath: string | null, plaintext: Buffer, ownershipToken: string | null, plaintextRetained: boolean }
 *   | { ok: false, reason: string }
 * >}
 */
export async function decryptFromAge(options) {
  if (typeof options?.identityFile !== "string" || options.identityFile.trim().length === 0) {
    return { ok: false, reason: "identityFile is required for age decrypt (restore/drill)" };
  }
  const ageBin = options.ageBin ?? resolveAgeBinary();
  const callerOwnedOutput =
    typeof options.outputPath === "string" && options.outputPath.length > 0;
  const outOwned = callerOwnedOutput
    ? { path: options.outputPath, ownershipToken: null }
    : createOwnedAgeTempPath("dec", ".dump");
  const outputPath = outOwned.path;
  const inOwned = createOwnedAgeTempPath("in", ".age", outOwned.ownershipToken ?? undefined);
  const inputPath = inOwned.path;
  const ownershipToken = inOwned.ownershipToken;

  try {
    const ciphertext = Buffer.isBuffer(options.ciphertext)
      ? options.ciphertext
      : Buffer.from(String(options.ciphertext ?? ""), "utf8");
    writeFileSync(inputPath, ciphertext, { mode: 0o600 });
    try {
      chmodSync(inputPath, 0o600);
    } catch {
      // best-effort
    }
    await runAge(ageBin, ["-d", "-i", options.identityFile.trim(), "-o", outputPath, inputPath], null);
    try {
      chmodSync(outputPath, 0o600);
    } catch {
      // best-effort
    }
    const plaintext = readFileSync(outputPath);

    // CS1: do not leave reusable plaintext on success for owned temps.
    let plaintextRetained = true;
    let returnedPath = outputPath;
    if (!callerOwnedOutput && options.retainOwnedPlaintextFile !== true) {
      const cleaned = cleanupOwnedAgeTempPath(outputPath, ownershipToken);
      if (!cleaned.ok) {
        return {
          ok: false,
          reason: `age decrypt succeeded but owned plaintext cleanup failed: ${cleaned.reason}`,
        };
      }
      plaintextRetained = false;
      returnedPath = null;
    }

    return {
      ok: true,
      outputPath: returnedPath,
      plaintext,
      ownershipToken: callerOwnedOutput ? null : ownershipToken,
      plaintextRetained,
    };
  } catch (error) {
    if (!callerOwnedOutput && ownershipToken) {
      cleanupOwnedAgeTempPath(outputPath, ownershipToken);
    } else {
      try {
        if (existsSync(outputPath)) unlinkSync(outputPath);
      } catch {
        // ignore
      }
    }
    return { ok: false, reason: redactText(errorMessage(error)) };
  } finally {
    cleanupOwnedAgeTempPath(inputPath, ownershipToken);
  }
}

/**
 * @param {string} ageBin
 * @param {string[]} args
 * @param {import("node:stream").Readable | null} stdin
 * @returns {Promise<void>}
 */
function runAge(ageBin, args, stdin) {
  return new Promise((resolve, reject) => {
    const child = spawn(ageBin, args, { stdio: [stdin ? "pipe" : "ignore", "ignore", "pipe"] });
    /** @type {Buffer[]} */
    const errChunks = [];
    child.stderr.on("data", (chunk) => errChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(redactText(Buffer.concat(errChunks).toString("utf8") || `age exited ${code}`)));
    });
    if (stdin && child.stdin) {
      pipeline(stdin, child.stdin).catch((error) => reject(error));
    }
  });
}

/**
 * @param {import("node:stream").Readable | Buffer | string} source
 * @returns {import("node:stream").Readable}
 */
function toReadable(source) {
  if (Buffer.isBuffer(source) || typeof source === "string") {
    return Readable.from([Buffer.isBuffer(source) ? source : Buffer.from(source, "utf8")]);
  }
  return /** @type {import("node:stream").Readable} */ (source);
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function errorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}
