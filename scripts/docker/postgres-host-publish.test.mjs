import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function postgresServiceBlock(compose) {
  const match = compose.match(/^  postgres:\n([\s\S]*?)(?=\n  [A-Za-z0-9_-]+:|\nvolumes:)/m);
  assert.ok(match, "compose.yaml must declare a postgres service");
  return match[1];
}

test("postgres host publish stays on loopback without changing service identity", () => {
  const compose = readFileSync(path.join(projectRoot, "compose.yaml"), "utf8");
  const postgres = postgresServiceBlock(compose);

  assert.match(postgres, /image:\s*boba-bear-postgres:local/);
  assert.match(postgres, /dockerfile:\s*docker\/postgres\/Dockerfile/);
  assert.match(postgres, /^\s*-\s*"127\.0\.0\.1:\$\{POSTGRES_HOST_PORT:-5433\}:5432"\s*$/m);
  assert.doesNotMatch(postgres, /^\s*-\s*"\$\{POSTGRES_HOST_PORT:-5433\}:5432"\s*$/m);
  assert.match(postgres, /^\s*-\s*postgres-data:\/var\/lib\/postgresql\s*$/m);
  assert.doesNotMatch(postgres, /^\s*container_name:/m);
  assert.doesNotMatch(postgres, /^\s*hostname:/m);
});
