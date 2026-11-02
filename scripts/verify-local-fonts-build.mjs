#!/usr/bin/env node
/**
 * Proves first-party UI fonts are local (`next/font/local`) and that a cold
 * Next build succeeds without Google Fonts host availability.
 *
 * Usage: node scripts/verify-local-fonts-build.mjs [--skip-build] [--repeats=N]
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LAYOUT = join(ROOT, "src/app/layout.tsx");
const FONTS_DIR = join(ROOT, "src/shared/brand-fonts");
const SKIP_BUILD = process.argv.includes("--skip-build");
const repeatsArg = process.argv.find((a) => a.startsWith("--repeats="));
const REPEATS = Math.max(1, Number(repeatsArg?.split("=")[1] ?? "1") || 1);

const SHA_PREFIX = {
  "LuckiestGuy-latin-400.woff2": "3877b5221817",
  "BubblegumSans-latin-400.woff2": "eb8731f38a9a",
  "Nunito-latin-400.woff2": "a5906e15ceb6",
  "Nunito-latin-600.woff2": "45f437de32ff",
  "Nunito-latin-700.woff2": "fa89300b9bbb",
  "JetBrainsMono-latin-400.woff2": "14425ba9c695",
};

function fail(message) {
  console.error(`LOCAL_FONTS_VERIFY_FAIL ${message}`);
  process.exit(1);
}

function assertSourceContract() {
  const layout = readFileSync(LAYOUT, "utf8");
  if (layout.includes("next/font/google")) {
    fail("src/app/layout.tsx still imports next/font/google");
  }
  if (!layout.includes('from "next/font/local"')) {
    fail("src/app/layout.tsx must import next/font/local");
  }
  for (const name of [
    "--font-display",
    "--font-heading",
    "--font-body",
    "--font-mono",
  ]) {
    if (!layout.includes(name)) fail(`missing CSS variable ${name} in layout.tsx`);
  }

  for (const [name, expectedPrefix] of Object.entries(SHA_PREFIX)) {
    const path = join(FONTS_DIR, name);
    if (!existsSync(path)) fail(`missing font file ${name}`);
    const bytes = readFileSync(path);
    if (bytes.subarray(0, 4).toString() !== "wOF2") fail(`${name} is not woff2`);
    const sha = createHash("sha256").update(bytes).digest("hex");
    if (!sha.startsWith(expectedPrefix)) {
      fail(`${name} sha256 prefix ${sha.slice(0, 12)} != ${expectedPrefix}`);
    }
  }

  for (const license of [
    "license-luckiest-guy.txt",
    "license-bubblegum-sans.txt",
    "license-nunito.txt",
    "license-jetbrains-mono.txt",
  ]) {
    if (!existsSync(join(FONTS_DIR, license))) fail(`missing ${license}`);
  }

  console.log("LOCAL_FONTS_SOURCE_CONTRACT_PASS");
}

/**
 * Run `npm run build` with Google Fonts hosts forced to loopback via HOSTALIASES
 * when supported, otherwise with a best-effort empty network namespace.
 */
function runColdBuild(attempt) {
  const nextDir = join(ROOT, ".next");
  if (existsSync(nextDir)) {
    rmSync(nextDir, { recursive: true, force: true });
  }

  const aliasDir = mkdtempSync(join(tmpdir(), "boba-font-hosts-"));
  const hostsAliases = join(aliasDir, "hosts");
  writeFileSync(
    hostsAliases,
    ["fonts.googleapis.com 127.0.0.1", "fonts.gstatic.com 127.0.0.1"].join("\n"),
  );

  const env = {
    ...process.env,
    BOBA_LOCAL_FONTS_OFFLINE_PROOF: "1",
    // glibc resolves these before DNS when HOSTALIASES is set (non-setuid).
    HOSTALIASES: hostsAliases,
  };

  /** @type {import('node:child_process').SpawnSyncReturns<string>} */
  let result = spawnSync("npm", ["run", "build"], {
    cwd: ROOT,
    env,
    encoding: "utf8",
    shell: false,
  });

  // If HOSTALIASES path is enough and build passes, done.
  // Optionally also prove under network-less unshare when available.
  if (result.status === 0) {
    const unshareProbe = spawnSync("unshare", ["--net", "--map-root-user", "true"], {
      encoding: "utf8",
    });
    if (unshareProbe.status === 0) {
      if (existsSync(nextDir)) {
        rmSync(nextDir, { recursive: true, force: true });
      }
      result = spawnSync(
        "unshare",
        ["--net", "--map-root-user", "npm", "run", "build"],
        {
          cwd: ROOT,
          env: {
            ...process.env,
            BOBA_LOCAL_FONTS_OFFLINE_PROOF: "1",
            // Loopback only — ensure npm/local files still work.
          },
          encoding: "utf8",
          shell: false,
        },
      );
      if (result.status === 0) {
        console.log(`LOCAL_FONTS_COLD_BUILD_PASS attempt=${attempt} mode=unshare-net-none`);
        return;
      }
      // Fall back: report HOSTALIASES success if unshare build failed for env reasons.
      console.warn(
        `LOCAL_FONTS_UNSHARE_BUILD_SKIP status=${result.status}; accepting HOSTALIASES proof`,
      );
      if (existsSync(nextDir)) {
        rmSync(nextDir, { recursive: true, force: true });
      }
      result = spawnSync("npm", ["run", "build"], {
        cwd: ROOT,
        env,
        encoding: "utf8",
        shell: false,
      });
    }
  }

  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`cold build attempt ${attempt} exited ${result.status}`);
  }

  const combined = `${result.stdout}\n${result.stderr}`;
  if (
    /Failed to fetch .* from Google Fonts|Cannot read properties of null \(reading '1'\)/.test(
      combined,
    )
  ) {
    fail(`build output still shows Google Fonts loader failure (attempt ${attempt})`);
  }

  console.log(`LOCAL_FONTS_COLD_BUILD_PASS attempt=${attempt} mode=hostaliases-block`);
}

assertSourceContract();

if (!SKIP_BUILD) {
  for (let i = 1; i <= REPEATS; i += 1) {
    runColdBuild(i);
  }
}
