/**
 * Runner for tests/gtm-closure only.
 * The default unit config's include list is unchanged. Invoke this config explicitly.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

export default defineConfig({
  root: repoRoot,
  plugins: [react(), tsconfigPaths({ projects: [path.join(repoRoot, "tsconfig.json")] })],
  resolve: {
    alias: {
      "server-only": path.join(repoRoot, "tests/setup/server-only-stub.ts"),
    },
  },
  test: {
    root: repoRoot,
    fileParallelism: false,
    isolate: true,
    environment: "jsdom",
    globals: false,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    setupFiles: [path.join(repoRoot, "tests/setup/vitest.setup.ts")],
    include: ["tests/gtm-closure/**/*.test.ts", "tests/gtm-closure/**/*.test.tsx"],
  },
});
