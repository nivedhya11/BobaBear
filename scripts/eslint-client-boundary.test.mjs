import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eslint = new ESLint({ cwd: repoRoot });

const CLIENT_FILE = "src/components/ordering/CheckoutClient.tsx";
const SERVER_COMPONENT = "src/app/(customer)/layout.tsx";
const SERVER_MODULE = "src/components/Footer.tsx";
const SERVER_LIB = "src/app/sitemap.ts";
const TRANSITIVE_CLIENT = "src/components/ordering/error-copy.ts";
const CLIENT_REACHABLE_LIB = "src/lib/site.ts";
const SERVER_FILE = "src/server/pricing/quote.ts";
const FRAMEWORK_FILE = "src/instrumentation.ts";
const NODE_ENTRY_FILE = "src/server/customer-commerce/main.ts";
const LEGACY_ENV_FILE = "src/lib/site.ts";

const PROBE_CLIENT = "src/components/eslint-boundary-probe-client.tsx";
const PROBE_VALUE = "src/lib/eslint-boundary-value-target.ts";
const PROBE_TYPE = "src/lib/eslint-boundary-type-target.ts";
const PROBE_SERVER_ACTION = "src/server/eslint-boundary-use-server.ts";
const PROBE_PATHS = [PROBE_CLIENT, PROBE_VALUE, PROBE_TYPE, PROBE_SERVER_ACTION];

function writeProbe(relativePath, source) {
  const absolute = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, source);
}

function removeProbes() {
  for (const relativePath of PROBE_PATHS) {
    fs.rmSync(path.join(repoRoot, relativePath), { force: true });
  }
}

writeProbe(
  PROBE_CLIENT,
  `"use client";

import type { Marker } from "@/lib/eslint-boundary-type-target";
import type MarkerEquals = require("@/lib/eslint-boundary-type-target");
import { value } from "@/lib/eslint-boundary-value-target";

export function Probe(marker: Marker | MarkerEquals | null) {
  return marker ? value : value;
}
`,
);
writeProbe(
  PROBE_VALUE,
  "export const value = 1;\n",
);
writeProbe(
  PROBE_TYPE,
  'export type Marker = { readonly kind: "marker" };\n',
);
writeProbe(
  PROBE_SERVER_ACTION,
  `"use server";

export async function boundaryAction() {
  return "ok";
}
`,
);
after(removeProbes);

function ruleOption(config, ruleId) {
  const entry = config.rules[ruleId];
  assert.ok(Array.isArray(entry), `${ruleId} is configured`);
  assert.equal(entry[0], 2, `${ruleId} is an error`);
  return entry[1];
}

async function lint(relativePath, code) {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(repoRoot, relativePath),
  });
  assert.equal(result.fatalErrorCount ?? 0, 0, result.messages.map((message) => message.message).join("\n"));
  return result.messages;
}

async function boundaryMessages(relativePath, code) {
  const messages = await lint(relativePath, code);
  return messages.filter((message) => message.ruleId === "boba/no-client-authority-import");
}

async function importMessages(relativePath, code) {
  const messages = await lint(relativePath, code);
  return messages.filter((message) => message.ruleId === "no-restricted-imports");
}

async function propertyMessages(relativePath, code) {
  const messages = await lint(relativePath, code);
  return messages.filter((message) => message.ruleId === "no-restricted-properties");
}

describe("effective client/server import boundary", () => {
  it("keeps pg, Drizzle, and process.env bans without replacing no-restricted-imports", async () => {
    const clientConfig = await eslint.calculateConfigForFile(path.join(repoRoot, CLIENT_FILE));
    const serverConfig = await eslint.calculateConfigForFile(path.join(repoRoot, SERVER_FILE));
    const clientImports = ruleOption(clientConfig, "no-restricted-imports");
    const serverImports = ruleOption(serverConfig, "no-restricted-imports");
    assert.deepEqual(clientImports, serverImports);
    assert.deepEqual(clientImports.paths.map((entry) => entry.name), [
      "pg",
      "drizzle-orm/node-postgres",
      "drizzle-orm/node-postgres/migrator",
    ]);
    assert.equal(clientImports.patterns, undefined);
    assert.equal(ruleOption(clientConfig, "boba/no-client-authority-import"), undefined);
    assert.equal(ruleOption(serverConfig, "boba/no-client-authority-import"), undefined);

    const clientEnv = ruleOption(clientConfig, "no-restricted-properties");
    const serverComponentEnv = ruleOption(
      await eslint.calculateConfigForFile(path.join(repoRoot, SERVER_COMPONENT)),
      "no-restricted-properties",
    );
    assert.deepEqual(clientEnv, serverComponentEnv);
    assert.equal(clientEnv.object, "process");
    assert.equal(clientEnv.property, "env");
  });

  it("rejects server, database, and legacy menu imports from modules that execute in the browser", async () => {
    const cases = [
      [
        "src/components/ordering/boundary-pricing.tsx",
        '"use client";\nimport { resolvePrice } from "@/server/pricing/resolve-price";\nexport const pricing = resolvePrice;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-order.tsx",
        '"use client";\nimport { createOrder } from "@/server/order/repository";\nexport const order = createOrder;\n',
        "server authority",
      ],
      [
        "src/lib/customer-commerce/boundary-checkout.ts",
        '"use client";\nimport { startCheckout } from "@/server/checkout/repository";\nexport const checkout = startCheckout;\n',
        "server authority",
      ],
      [
        TRANSITIVE_CLIENT,
        'import { startCheckout } from "@/server/checkout/repository";\nexport const checkout = startCheckout;\n',
        "server authority",
      ],
      [
        CLIENT_REACHABLE_LIB,
        'import { createOrder } from "@/Server/order";\nexport const order = createOrder;\n',
        "server authority",
      ],
      [
        PROBE_VALUE,
        'import { createDatabaseClient } from "@/platform/database";\nexport const database = createDatabaseClient;\n',
        "database runtime",
      ],
      [
        "src/components/ordering/boundary-database.tsx",
        '"use client";\nimport { createDatabaseClient } from "@/platform/database/schema/checkout";\nexport const database = createDatabaseClient;\n',
        "database runtime",
      ],
      [
        "src/components/ordering/boundary-menu.tsx",
        '"use client";\nimport menu from "@/data/menu.json";\nexport const legacyMenu = menu;\n',
        "legacy menu",
      ],
      [
        "src/components/ordering/boundary-catalog.tsx",
        '"use client";\nimport catalog from "@/data/ordering-catalog.json?raw";\nexport const legacyCatalog = catalog;\n',
        "legacy menu",
      ],
      [
        "src/components/ordering/boundary-relative-server.tsx",
        '"use client";\nimport { quote } from "../../server/pricing/quote";\nexport const priced = quote;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-relative-database.tsx",
        '"use client";\nimport { createDatabaseClient } from "../../platform/database";\nexport const database = createDatabaseClient;\n',
        "database runtime",
      ],
      [
        "src/lib/customer-commerce/boundary-relative-menu.ts",
        '"use client";\nimport menu from "../../data/menu.json";\nexport const legacyMenu = menu;\n',
        "legacy menu",
      ],
      [
        "src/app/workforce/(portal)/operations/store/team/access/boundary-deep.tsx",
        '"use client";\nimport { createOrder } from "../../../../../../../server/order";\nexport const order = createOrder;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-src-prefix.tsx",
        '"use client";\nimport { quote } from "../../../src/server/pricing/quote";\nexport const priced = quote;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-export.tsx",
        '"use client";\nexport { resolvePrice } from "@/server/pricing/resolve-price";\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-export-star.tsx",
        '"use client";\nexport * from "@/server/order";\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-mixed-type.tsx",
        '"use client";\nimport { type OrderId, createOrder } from "@/server/order";\nexport const order = createOrder;\nexport type Id = OrderId;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-side-effect.tsx",
        '"use client";\nimport "@/server/order";\nexport const loaded = true;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-dynamic.tsx",
        '"use client";\nexport const load = () => import("@/platform/database");\n',
        "database runtime",
      ],
      [
        "src/components/ordering/boundary-dynamic-server-action.tsx",
        '"use client";\nexport const load = () => import("@/server/eslint-boundary-use-server");\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-template.tsx",
        '"use client";\nexport const load = () => import(`@/data/menu.json`);\n',
        "legacy menu",
      ],
      [
        "src/components/ordering/boundary-require.tsx",
        '"use client";\nexport const driver = require("../../server/pricing/quote");\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-directive-order.tsx",
        '"use client";\n"use server";\nimport { createOrder } from "@/server/order";\nexport const order = createOrder;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-namespace.tsx",
        '"use client";\nimport * as order from "@/server/order";\nexport const api = order;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-export-namespace.tsx",
        '"use client";\nexport * as order from "@/server/order";\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-absolute.tsx",
        `"use client";\nimport { quote } from ${JSON.stringify(path.join(repoRoot, "src/server/pricing/quote"))};\nexport const priced = quote;\n`,
        "server authority",
      ],
    ];

    for (const [filePath, code, expected] of cases) {
      const messages = await boundaryMessages(filePath, code);
      assert.equal(messages.length > 0, true, filePath);
      assert.equal(
        messages.some((message) => message.message.includes(expected)),
        true,
        `${filePath}: ${messages.map((message) => message.message).join(" | ")}`,
      );
    }
  });

  it("preserves server-component, server-only library, type-only, and server-action imports", async () => {
    const allowed = [
      [
        SERVER_COMPONENT,
        'import { resolvePrice } from "@/server/pricing/resolve-price";\nexport const pricing = resolvePrice;\n',
      ],
      [
        SERVER_MODULE,
        'import { createDatabaseClient } from "@/platform/database";\nexport const database = createDatabaseClient;\n',
      ],
      [
        SERVER_LIB,
        'import catalog from "@/data/ordering-catalog.json";\nexport const legacyCatalog = catalog;\n',
      ],
      [
        "src/lib/not-a-client-module.ts",
        'import { quote } from "@/server/pricing/quote";\nexport const priced = quote;\n',
      ],
      [
        "src/app/workforce/(portal)/operations/store/team/access/boundary-deep.tsx",
        'import { createOrder } from "../../../../../../../server/order";\nexport const order = createOrder;\n',
      ],
      [
        PROBE_TYPE,
        'import { createOrder } from "@/server/order";\nexport const order = createOrder;\n',
      ],
      [
        "src/components/ordering/boundary-type-only.tsx",
        '"use client";\nimport type { CustomerMenuProjection } from "@/server/order";\nexport type Menu = CustomerMenuProjection;\n',
      ],
      [
        "src/components/ordering/boundary-inline-types.tsx",
        '"use client";\nimport { type OrderId, type CheckoutId } from "@/platform/database";\nexport type Ids = OrderId | CheckoutId;\n',
      ],
      [
        "src/components/ordering/boundary-export-type.tsx",
        '"use client";\nexport type { CustomerMenuProjection } from "@/server/order";\n',
      ],
      [
        "src/components/ordering/boundary-use-server.tsx",
        '"use client";\nimport { boundaryAction } from "@/server/eslint-boundary-use-server";\nexport const action = boundaryAction;\n',
      ],
      [
        PROBE_SERVER_ACTION,
        'import { createDatabaseClient } from "@/platform/database";\nexport const database = createDatabaseClient;\n',
      ],
      [
        "src/components/ordering/boundary-shared.tsx",
        '"use client";\nimport { CHARGE_DEFINITION_DELIVERY_ID } from "@/shared/pricing";\nexport const charge = CHARGE_DEFINITION_DELIVERY_ID;\n',
      ],
      [
        "src/components/ordering/boundary-transport.tsx",
        '"use client";\nimport { getCustomerMenu } from "@/lib/customer-commerce";\nexport const menu = getCustomerMenu;\n',
      ],
      [
        "src/components/ordering/boundary-next.tsx",
        '"use client";\nimport { connection } from "next/server";\nimport { headers } from "next/headers";\nexport const framework = { connection, headers };\n',
      ],
      [
        "src/components/ordering/boundary-lookalikes.tsx",
        '"use client";\nimport helpers from "@/server-helpers";\nimport backup from "@/platform/database-backup";\nexport const local = helpers ?? backup;\n',
      ],
      [
        SERVER_MODULE,
        'import { quote } from "@/server/pricing/quote";\n"use client";\nexport const priced = quote;\n',
      ],
      [
        "src/components/ordering/boundary-local-server-dir.tsx",
        '"use client";\nimport { format } from "./server/format";\nexport const label = format;\n',
      ],
      [
        PROBE_VALUE,
        '"use server";\nimport { createDatabaseClient } from "@/platform/database";\nexport async function database() { return createDatabaseClient; }\n',
      ],
      [
        "src/components/ordering/boundary-comment.tsx",
        '"use client";\n// import { quote } from "@/server/pricing/quote";\nexport const priced = 1;\n',
      ],
      [
        "src/components/ordering/boundary-late-directive.tsx",
        'import { quote } from "@/server/pricing/quote";\n"use client";\nexport const priced = quote;\n',
      ],
      [
        "src/components/ordering/boundary-type-require.tsx",
        '"use client";\nimport type Database = require("@/platform/database");\nexport type Persistence = Database;\n',
      ],
      [
        SERVER_LIB,
        "`use client`;\nimport { quote } from \"@/server/pricing/quote\";\nexport const priced = quote;\n",
      ],
      [
        "src/components/ordering/boundary-dynamic-computed.tsx",
        '"use client";\nconst name = "order";\nexport const load = () => import(`@/server/${name}`);\n',
      ],
      [
        "src/components/ordering/boundary-server-first.tsx",
        '"use server";\n"use client";\nimport { createDatabaseClient } from "@/platform/database";\nexport const database = createDatabaseClient;\n',
      ],
      [
        "src/components/ordering/boundary-require-computed.tsx",
        '"use client";\nconst name = "pg";\nexport const driver = require(name);\n',
      ],
      [
        SERVER_FILE,
        'import { quote } from "../checkout/repository";\nimport { rows } from "../../platform/database/schema/catalog";\nexport const priced = { quote, rows };\n',
      ],
      [
        FRAMEWORK_FILE,
        'import { resolvePrice } from "@/server/pricing/resolve-price";\nexport const pricing = resolvePrice;\n',
      ],
    ];

    for (const [filePath, code] of allowed) {
      const messages = await boundaryMessages(filePath, code);
      assert.deepEqual(
        messages.map((message) => message.message),
        [],
        filePath,
      );
    }
  });

  it("keeps process.env and raw driver bans outside the client-authority rule", async () => {
    const clientEnv = await propertyMessages(
      "src/components/ordering/boundary-env.tsx",
      '"use client";\nexport const value = process.env.SECRET;\n',
    );
    assert.equal(clientEnv.length > 0, true);

    const entryEnv = await propertyMessages(
      NODE_ENTRY_FILE,
      "export const value = process.env.SECRET;\n",
    );
    assert.deepEqual(entryEnv, []);

    const legacyEnv = await propertyMessages(
      LEGACY_ENV_FILE,
      "export const value = process.env.NEXT_PUBLIC_SITE_URL;\n",
    );
    assert.deepEqual(legacyEnv, []);

    const clientDriver = await importMessages(
      "src/components/ordering/boundary-pg.tsx",
      '"use client";\nimport pg from "pg";\nexport const driver = pg;\n',
    );
    assert.equal(
      clientDriver.some((message) => message.message.includes("Do not import 'pg' directly")),
      true,
    );
    const clientBoundary = await boundaryMessages(
      "src/components/ordering/boundary-pg.tsx",
      '"use client";\nimport pg from "pg";\nexport const driver = pg;\n',
    );
    assert.deepEqual(clientBoundary, []);

    const serverDriver = await importMessages(
      "src/server/order/boundary-pg.ts",
      'import pg from "pg";\nexport const driver = pg;\n',
    );
    assert.equal(
      serverDriver.some((message) => message.message.includes("Do not import 'pg' directly")),
      true,
    );

    const drizzle = await importMessages(
      "src/lib/customer-commerce/boundary-drizzle.ts",
      '"use client";\nimport { drizzle } from "drizzle-orm/node-postgres";\nexport const client = drizzle;\n',
    );
    assert.equal(
      drizzle.some((message) => message.message.includes("drizzle-orm/node-postgres")),
      true,
    );

    const migrator = await importMessages(
      "src/app/(customer)/order/boundary-migrator.tsx",
      'import { migrate } from "drizzle-orm/node-postgres/migrator";\nexport const run = migrate;\n',
    );
    assert.equal(
      migrator.some((message) => message.message.includes("Drizzle migrator")),
      true,
    );

    const testFile = await boundaryMessages(
      "src/components/ordering/boundary-client.test.tsx",
      '"use client";\nimport { quote } from "@/server/pricing/quote";\nexport const priced = quote;\n',
    );
    assert.deepEqual(testFile, []);
  });
});
