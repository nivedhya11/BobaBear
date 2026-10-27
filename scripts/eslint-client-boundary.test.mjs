import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eslint = new ESLint({ cwd: repoRoot });

const CLIENT_FILE = "src/components/ordering/CheckoutClient.tsx";
const SERVER_FILE = "src/server/pricing/quote.ts";
const FRAMEWORK_FILE = "src/instrumentation.ts";
const NODE_ENTRY_FILE = "src/server/customer-commerce/main.ts";

function ruleOption(config, ruleId) {
  const entry = config.rules[ruleId];
  assert.ok(Array.isArray(entry), `${ruleId} is configured`);
  assert.equal(entry[0], 2, `${ruleId} is an error`);
  return entry[1];
}

function patternRegExp(pattern) {
  const flags = pattern.caseSensitive ? "u" : "iu";
  return new RegExp(pattern.regex, flags);
}

async function importMessages(relativePath, code) {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(repoRoot, relativePath),
  });
  assert.equal(result.errorCount >= 0, true);
  return result.messages.filter((message) => message.ruleId === "no-restricted-imports");
}

async function propertyMessages(relativePath, code) {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(repoRoot, relativePath),
  });
  return result.messages.filter((message) => message.ruleId === "no-restricted-properties");
}

describe("effective client/server import boundary", () => {
  it("keeps database bans on browser-facing files and adds the authority patterns", async () => {
    const config = await eslint.calculateConfigForFile(path.join(repoRoot, CLIENT_FILE));
    const option = ruleOption(config, "no-restricted-imports");
    const names = option.paths.map((entry) => entry.name);
    assert.deepEqual(names, [
      "pg",
      "drizzle-orm/node-postgres",
      "drizzle-orm/node-postgres/migrator",
    ]);
    assert.equal(option.patterns.length, 3);
    assert.equal(option.patterns.every((pattern) => pattern.allowTypeImports === true), true);

    const expressions = option.patterns.map(patternRegExp);
    const blocked = [
      "@/server/pricing/resolve-price",
      "@/server/order",
      "@/server/checkout/repository",
      "../../server/pricing/quote",
      "../../../../../../../server/order",
      "../../src/server/pricing/quote",
      "@/platform/database",
      "@/platform/database/schema/checkout",
      "../../platform/database",
      "@/data/menu.json",
      "@/data/ordering-catalog.json",
      "../../data/menu.json",
      "../../../data/ordering-catalog.json",
      "@/data/menu.json?raw",
      "@/Server/pricing/resolve-price",
    ];
    const allowed = [
      "@/shared/pricing",
      "@/shared/customer-menu/types",
      "@/lib/customer-commerce",
      "@/lib/customer-commerce/menu",
      "@/platform/config",
      "next/server",
      "next/headers",
      "next/navigation",
      "pg",
      "drizzle-orm/node-postgres",
      "drizzle-orm/node-postgres/migrator",
      "../pricing/quote",
      "@/platform/database-backup",
      "@/server-helpers",
    ];
    for (const specifier of blocked) {
      assert.equal(
        expressions.some((expression) => expression.test(specifier)),
        true,
        specifier,
      );
    }
    for (const specifier of allowed) {
      assert.equal(
        expressions.some((expression) => expression.test(specifier)),
        false,
        specifier,
      );
    }

    const properties = ruleOption(config, "no-restricted-properties");
    assert.equal(properties.object, "process");
    assert.equal(properties.property, "env");
  });

  it("does not apply the browser authority patterns to server modules", async () => {
    const config = await eslint.calculateConfigForFile(path.join(repoRoot, SERVER_FILE));
    const option = ruleOption(config, "no-restricted-imports");
    const names = option.paths.map((entry) => entry.name);
    assert.deepEqual(names, [
      "pg",
      "drizzle-orm/node-postgres",
      "drizzle-orm/node-postgres/migrator",
    ]);
    assert.equal(option.patterns, undefined);
  });

  it("rejects runtime server, database, menu, and driver imports from browser-facing files", async () => {
    const cases = [
      [
        "src/components/ordering/boundary-pricing.tsx",
        'import { resolvePrice } from "@/server/pricing/resolve-price";\nexport const pricing = resolvePrice;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-order.tsx",
        'import { createOrder } from "@/server/order/repository";\nexport const order = createOrder;\n',
        "server authority",
      ],
      [
        "src/lib/customer-commerce/boundary-checkout.ts",
        'import { startCheckout } from "@/server/checkout/repository";\nexport const checkout = startCheckout;\n',
        "server authority",
      ],
      [
        "src/lib/customer-commerce/boundary-database.ts",
        'import { createDatabaseClient } from "@/platform/database";\nexport const database = createDatabaseClient;\n',
        "database runtime",
      ],
      [
        "src/app/(customer)/order/boundary-menu.tsx",
        'import menu from "@/data/menu.json";\nexport const legacyMenu = menu;\n',
        "legacy menu",
      ],
      [
        "src/app/(customer)/order/boundary-catalog.tsx",
        'import catalog from "@/data/ordering-catalog.json";\nexport const legacyCatalog = catalog;\n',
        "legacy menu",
      ],
      [
        "src/components/ordering/boundary-relative-server.tsx",
        'import { quote } from "../../server/pricing/quote";\nexport const priced = quote;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-relative-database.tsx",
        'import { createDatabaseClient } from "../../platform/database";\nexport const database = createDatabaseClient;\n',
        "database runtime",
      ],
      [
        "src/lib/customer-commerce/boundary-relative-menu.ts",
        'import menu from "../../data/menu.json";\nexport const legacyMenu = menu;\n',
        "legacy menu",
      ],
      [
        "src/app/workforce/(portal)/operations/store/team/access/boundary-deep.tsx",
        'import { createOrder } from "../../../../../../../server/order";\nexport const order = createOrder;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-src-prefix.tsx",
        'import { quote } from "../../src/server/pricing/quote";\nexport const priced = quote;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-export.tsx",
        'export { resolvePrice } from "@/server/pricing/resolve-price";\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-mixed-type.tsx",
        'import { type OrderId, createOrder } from "@/server/order";\nexport const order = createOrder;\nexport type Id = OrderId;\n',
        "server authority",
      ],
      [
        "src/components/ordering/boundary-pg.tsx",
        'import pg from "pg";\nexport const driver = pg;\n',
        "Do not import 'pg' directly",
      ],
      [
        "src/lib/customer-commerce/boundary-drizzle.ts",
        'import { drizzle } from "drizzle-orm/node-postgres";\nexport const client = drizzle;\n',
        "drizzle-orm/node-postgres",
      ],
      [
        "src/app/(customer)/order/boundary-migrator.tsx",
        'import { migrate } from "drizzle-orm/node-postgres/migrator";\nexport const run = migrate;\n',
        "Drizzle migrator",
      ],
    ];

    for (const [filePath, code, expected] of cases) {
      const messages = await importMessages(filePath, code);
      assert.equal(messages.length > 0, true, filePath);
      assert.equal(
        messages.some((message) => message.message.includes(expected)),
        true,
        `${filePath}: ${messages.map((message) => message.message).join(" | ")}`,
      );
    }
  });

  it("allows shared contracts, customer-commerce transport, type-only imports, server modules, and Next.js framework imports", async () => {
    const cases = [
      [
        "src/components/ordering/boundary-shared.tsx",
        'import { CHARGE_DEFINITION_DELIVERY_ID } from "@/shared/pricing";\nexport const charge = CHARGE_DEFINITION_DELIVERY_ID;\n',
      ],
      [
        "src/components/ordering/boundary-transport.tsx",
        'import { getCustomerMenu } from "@/lib/customer-commerce";\nexport const menu = getCustomerMenu;\n',
      ],
      [
        "src/components/ordering/boundary-type-only.tsx",
        'import type { CustomerMenuProjection } from "@/server/order";\nexport type Menu = CustomerMenuProjection;\n',
      ],
      [
        "src/lib/customer-commerce/boundary-type-database.ts",
        'import type { Database } from "@/platform/database";\nexport type Persistence = Database;\n',
      ],
      [
        "src/server/pricing/boundary-peer.ts",
        'import { quote } from "../checkout/repository";\nimport { rows } from "../../platform/database/schema/catalog";\nexport const priced = { quote, rows };\n',
      ],
      [
        "src/app/(customer)/order/boundary-next.tsx",
        'import { connection } from "next/server";\nimport { headers } from "next/headers";\nexport const framework = { connection, headers };\n',
      ],
      [
        FRAMEWORK_FILE,
        'import { resolvePrice } from "@/server/pricing/resolve-price";\nexport const pricing = resolvePrice;\n',
      ],
    ];

    for (const [filePath, code] of cases) {
      const messages = await importMessages(filePath, code);
      assert.deepEqual(
        messages.map((message) => message.message),
        [],
        filePath,
      );
    }
  });

  it("keeps process.env and raw driver bans outside the browser block", async () => {
    const clientEnv = await propertyMessages(
      "src/components/ordering/boundary-env.tsx",
      "export const value = process.env.SECRET;\n",
    );
    assert.equal(clientEnv.length > 0, true);

    const entryEnv = await propertyMessages(
      NODE_ENTRY_FILE,
      "export const value = process.env.SECRET;\n",
    );
    assert.deepEqual(entryEnv, []);

    const serverDriver = await importMessages(
      "src/server/order/boundary-pg.ts",
      'import pg from "pg";\nexport const driver = pg;\n',
    );
    assert.equal(
      serverDriver.some((message) => message.message.includes("Do not import 'pg' directly")),
      true,
    );

    const serverPeer = await importMessages(
      "src/server/order/boundary-peer.ts",
      'import { quote } from "../pricing/quote";\nexport const priced = quote;\n',
    );
    assert.deepEqual(serverPeer, []);
  });
});
