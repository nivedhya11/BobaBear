import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("local fonts source contract holds without running a full build", () => {
  const result = spawnSync(
    process.execPath,
    [join(ROOT, "scripts/verify-local-fonts-build.mjs"), "--skip-build"],
    { cwd: ROOT, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /LOCAL_FONTS_SOURCE_CONTRACT_PASS/);
});
