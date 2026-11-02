/**
 * Client-bundle authority boundary.
 *
 * Next.js executes a module in the browser only when it is a "use client"
 * entry or a static value-import dependency of one. Server Components, Route
 * modules, "use server" modules, and shared modules reached only from those
 * server entries stay server-executable even when they live under src/app,
 * src/components, or src/lib. Path globs cannot express that boundary.
 *
 * Type-only imports are erased and are not client edges. A static import of a
 * "use server" module is a server reference, not a copy of that module in the
 * browser bundle. Dynamic import() and require() are not that reference
 * protocol, so a forbidden target stays forbidden. Non-literal specifiers are
 * not classified: a static rule cannot see them, and they are not a reason to
 * treat every server-executable file as browser code.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const srcRoot = path.join(repoRoot, "src");

const SOURCE_FILE = /\.(?:[cm]?[jt]sx?)$/;
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/;

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"];

/** @type {{ clientFiles: Set<string>, directives: Map<string, "client" | "server" | "shared"> } | null} */
let graphCache = null;

/**
 * @param {string[]} directives
 * @returns {"client" | "server" | "shared"}
 */
function classifyDirectives(directives) {
  for (const directive of directives) {
    if (directive === "use client") return "client";
    if (directive === "use server") return "server";
  }
  return "shared";
}

/**
 * @param {import("typescript").SourceFile} sourceFile
 * @returns {string[]}
 */
function prologueFromSourceFile(sourceFile) {
  /** @type {string[]} */
  const directives = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) break;
    directives.push(statement.expression.text);
  }
  return directives;
}

/**
 * @param {import("typescript").Node} node
 * @returns {string | null}
 */
function staticSpecifierText(node) {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

/**
 * @param {import("typescript").SourceFile} sourceFile
 * @returns {string[]}
 */
function valueSpecifiers(sourceFile) {
  /** @type {string[]} */
  const specifiers = [];

  /**
   * @param {import("typescript").Node} node
   */
  function visit(node) {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      const clause = node.importClause;
      const named = clause?.namedBindings && ts.isNamedImports(clause.namedBindings)
        ? clause.namedBindings.elements
        : [];
      const typeOnly = clause?.isTypeOnly === true
        || (clause != null && clause.name == null && named.length > 0 && named.every((element) => element.isTypeOnly));
      const specifier = staticSpecifierText(node.moduleSpecifier);
      if (!typeOnly && specifier) specifiers.push(specifier);
      return;
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && !node.isTypeOnly) {
      const named = node.exportClause && ts.isNamedExports(node.exportClause)
        ? node.exportClause.elements
        : null;
      const typeOnly = named != null && named.length > 0 && named.every((element) => element.isTypeOnly);
      const specifier = staticSpecifierText(node.moduleSpecifier);
      if (!typeOnly && specifier) specifiers.push(specifier);
      return;
    }
    if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      if (node.isTypeOnly) return;
      const specifier = staticSpecifierText(node.moduleReference.expression);
      if (specifier) specifiers.push(specifier);
      return;
    }
    // Literal import() and require() are client-bundle edges. The call site is
    // also reported when the specifier itself is forbidden. Non-literal
    // specifiers are invisible and are not edges.
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const specifier = staticSpecifierText(node.arguments[0]);
      if (specifier) specifiers.push(specifier);
    }
    if (
      ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === "require"
    ) {
      const specifier = staticSpecifierText(node.arguments[0]);
      if (specifier) specifiers.push(specifier);
    }
    ts.forEachChild(node, visit);
  }

  for (const statement of sourceFile.statements) visit(statement);
  return specifiers;
}

/**
 * @param {string} specifier
 */
function bareSpecifier(specifier) {
  const bare = specifier.split(/[?#]/, 1)[0];
  return bare.length > 0 ? bare : null;
}

/**
 * @param {string} fromFile
 * @param {string} specifier
 * @returns {string | null}
 */
function resolveTarget(fromFile, specifier) {
  const bare = bareSpecifier(specifier);
  if (!bare) return null;
  if (bare.startsWith("@/")) return path.resolve(srcRoot, bare.slice(2));
  if (bare.startsWith(".")) return path.resolve(path.dirname(fromFile), bare);
  if (path.isAbsolute(bare)) return path.resolve(bare);
  return null;
}

/**
 * @param {string} target
 * @returns {string | null}
 */
function resolveExisting(target) {
  const candidates = path.extname(target)
    ? [target]
    : [
        ...EXTENSIONS.map((extension) => target + extension),
        ...EXTENSIONS.map((extension) => path.join(target, `index${extension}`)),
      ];
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      // Missing candidates are expected while resolving extensionless imports.
    }
  }
  return null;
}

/**
 * @param {string} absPath
 * @returns {"server" | "database" | "menu" | null}
 */
function forbiddenKind(absPath) {
  const relative = path.relative(repoRoot, absPath).split(path.sep).join("/").toLowerCase();
  if (relative === "src/server" || relative.startsWith("src/server/")) return "server";
  if (relative === "src/platform/database" || relative.startsWith("src/platform/database/")) {
    return "database";
  }
  if (relative === "src/data/menu.json" || relative === "src/data/ordering-catalog.json") {
    return "menu";
  }
  return null;
}

/**
 * @param {string} directory
 * @param {string[]} files
 */
function walkSource(directory, files) {
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkSource(fullPath, files);
      continue;
    }
    if (!SOURCE_FILE.test(entry.name) || TEST_FILE.test(entry.name)) continue;
    files.push(fullPath);
  }
}

function buildGraph() {
  /** @type {string[]} */
  const files = [];
  walkSource(srcRoot, files);

  /** @type {Map<string, "client" | "server" | "shared">} */
  const directives = new Map();
  /** @type {Map<string, string[]>} */
  const edges = new Map();

  for (const file of files) {
    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const kind = file.endsWith(".tsx") || file.endsWith(".jsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
    const role = classifyDirectives(prologueFromSourceFile(sourceFile));
    directives.set(file, role);
    edges.set(file, valueSpecifiers(sourceFile));
  }

  /** @type {Set<string>} */
  const clientFiles = new Set();
  /** @type {string[]} */
  const queue = [];
  for (const [file, role] of directives) {
    if (role === "client") queue.push(file);
  }

  while (queue.length > 0) {
    const file = queue.pop();
    if (!file || clientFiles.has(file)) continue;
    if (directives.get(file) === "server") continue;
    clientFiles.add(file);
    for (const specifier of edges.get(file) ?? []) {
      const target = resolveTarget(file, specifier);
      if (!target) continue;
      const existing = resolveExisting(target);
      if (!existing || directives.get(existing) === "server") continue;
      queue.push(existing);
    }
  }

  return { clientFiles, directives };
}

function graph() {
  if (!graphCache) graphCache = buildGraph();
  return graphCache;
}

/**
 * @param {string} file
 * @returns {"client" | "server" | "shared" | null}
 */
function directiveOnDisk(file) {
  const cached = graph().directives.get(file);
  if (cached) return cached;
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
  const kind = file.endsWith(".tsx") || file.endsWith(".jsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const role = classifyDirectives(prologueFromSourceFile(sourceFile));
  graph().directives.set(file, role);
  return role;
}

/**
 * @param {unknown} node
 * @returns {string | null}
 */
function eslintLiteral(node) {
  if (!node || typeof node !== "object") return null;
  const record = /** @type {{ type?: string, value?: unknown, expressions?: unknown[], quasis?: { value?: { cooked?: string | null } }[] }} */ (node);
  if (record.type === "Literal" && typeof record.value === "string") return record.value;
  if (record.type === "TemplateLiteral" && Array.isArray(record.expressions) && record.expressions.length === 0) {
    const cooked = record.quasis?.[0]?.value?.cooked;
    return typeof cooked === "string" ? cooked : null;
  }
  return null;
}

function directiveText(node) {
  if (!node || typeof node !== "object") return null;
  if (node.type !== "Literal" || typeof node.value !== "string") return null;
  return node.value;
}

/**
 * @param {{ body?: { type?: string, expression?: { type?: string, value?: unknown } }[], directives?: { value?: { type?: string, value?: string }, expression?: { type?: string, value?: string } }[] }} program
 */
function prologueFromProgram(program) {
  /** @type {string[]} */
  const directives = [];
  for (const directive of program.directives ?? []) {
    const literal = directive?.value?.type === "Literal" || directive?.expression?.type === "Literal"
      ? directive.value ?? directive.expression
      : directive?.value?.type == null && typeof directive?.value?.value === "string"
        ? directive.value
        : null;
    const value = literal && typeof literal.value === "string" ? literal.value : null;
    if (value == null) break;
    directives.push(value);
  }
  if (directives.length > 0) return directives;
  for (const statement of program.body ?? []) {
    if (statement?.type !== "ExpressionStatement") break;
    const value = directiveText(statement.expression);
    if (value == null) break;
    directives.push(value);
  }
  return directives;
}

/**
 * The module ESLint is currently parsing. Its own directive wins over the
 * on-disk graph so an edited "use client" / "use server" boundary is honored
 * before the file is saved into the closure.
 *
 * @param {import("eslint").Rule.RuleContext} context
 */
function lintedRole(context) {
  const program = context.sourceCode?.ast;
  if (!program) return "shared";
  return classifyDirectives(prologueFromProgram(program));
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 */
function isClientExecutable(context) {
  const role = lintedRole(context);
  if (role === "server") return false;
  if (role === "client") return true;
  const filename = context.filename ?? context.getFilename?.();
  if (!filename || filename === "<input>" || filename === "<text>") return false;
  return graph().clientFiles.has(path.resolve(filename));
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @param {unknown} node
 * @param {string | null} specifier
 */
function reportIfForbidden(context, node, specifier, allowServerActionReference) {
  if (!specifier) return;
  const filename = context.filename ?? context.getFilename?.() ?? path.join(srcRoot, "unknown.ts");
  const target = resolveTarget(path.resolve(filename), specifier);
  if (!target) return;
  const kind = forbiddenKind(target);
  if (!kind) return;
  if (allowServerActionReference) {
    const existing = resolveExisting(target);
    if (existing && directiveOnDisk(existing) === "server") return;
  }
  context.report({ node, messageId: kind });
}

/**
 * @param {unknown} node
 */
function isTypeOnlyImport(node) {
  const record = /** @type {{ importKind?: string, specifiers?: { importKind?: string }[] }} */ (node);
  if (record.importKind === "type") return true;
  const specifiers = record.specifiers ?? [];
  return specifiers.length > 0 && specifiers.every((specifier) => specifier.importKind === "type");
}

/**
 * @param {unknown} node
 */
function isTypeOnlyReexport(node) {
  const record = /** @type {{ exportKind?: string, specifiers?: { exportKind?: string }[] }} */ (node);
  if (record.exportKind === "type") return true;
  const specifiers = record.specifiers ?? [];
  return specifiers.length > 0 && specifiers.every((specifier) => specifier.exportKind === "type");
}

/** @type {import("eslint").Rule.RuleModule} */
const noClientAuthorityImport = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow server, database, and legacy menu imports from client-executable modules.",
    },
    schema: [],
    messages: {
      server: "Do not import server authority into a client-executable module. Commercial truth stays on the server (ARCH-G11).",
      database: "Do not import the database runtime into a client-executable module. Persistence stays on the server (ARCH-G11).",
      menu: "Do not import legacy menu artifacts into a client-executable module. The customer menu is the customer-commerce read projection (D-368).",
    },
  },
  create(context) {
    if (!isClientExecutable(context)) return {};
    return {
      ImportDeclaration(node) {
        if (isTypeOnlyImport(node)) return;
        reportIfForbidden(context, node, eslintLiteral(node.source), true);
      },
      ExportNamedDeclaration(node) {
        if (!node.source || isTypeOnlyReexport(node)) return;
        reportIfForbidden(context, node, eslintLiteral(node.source), true);
      },
      ExportAllDeclaration(node) {
        if (isTypeOnlyReexport(node)) return;
        reportIfForbidden(context, node, eslintLiteral(node.source), true);
      },
      ImportExpression(node) {
        reportIfForbidden(context, node, eslintLiteral(node.source), false);
      },
      CallExpression(node) {
        if (node.callee?.type !== "Identifier" || node.callee.name !== "require") return;
        reportIfForbidden(context, node, eslintLiteral(node.arguments?.[0]), false);
      },
      TSImportEqualsDeclaration(node) {
        if (node.importKind === "type") return;
        const expression = node.moduleReference?.expression;
        if (node.moduleReference?.type !== "TSExternalModuleReference") return;
        reportIfForbidden(context, node, eslintLiteral(expression), false);
      },
    };
  },
};

const clientAuthorityBoundaryPlugin = {
  meta: {
    name: "boba-client-authority-boundary",
    version: "1.0.0",
  },
  rules: {
    "no-client-authority-import": noClientAuthorityImport,
  },
};

export default clientAuthorityBoundaryPlugin;
