#!/usr/bin/env node
/**
 * Web stability baseline audit — run before/after refactor PRs.
 * Usage: node scripts/audit-web-stability.mjs [--write]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WEB = path.join(ROOT, "apps/web/src");

function walk(dir, ext, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, ext, acc);
    else if (p.endsWith(ext)) acc.push(p);
  }
  return acc;
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function auditApiRoutes() {
  const routes = walk(path.join(WEB, "app/api"), ".ts").filter((p) =>
    p.endsWith("route.ts"),
  );
  const rawJsonRoutes = [];
  const directAuthRoutes = [];
  const withoutReadJsonBody = [];

  for (const file of routes) {
    const src = fs.readFileSync(file, "utf8");
    if (/\.json\s*\(\s*\)/.test(src) && !src.includes("readJsonBody")) {
      rawJsonRoutes.push(rel(file));
    }
    if (/\bauth\s*\(\s*\)/.test(src) && !src.includes("requireAuthApi")) {
      directAuthRoutes.push(rel(file));
    }
    const hasWrite =
      /export async function (POST|PATCH|PUT|DELETE)/.test(src);
    const usesReadJson = src.includes("readJsonBody");
    if (hasWrite && !usesReadJson && !src.includes("req.text()")) {
      // webhook uses req.text(); GET-only excluded
      const isPostOnlyJson =
        /export async function POST/.test(src) &&
        !/export async function (PATCH|PUT)/.test(src);
      if (isPostOnlyJson && /\.json\s*\(\s*\)/.test(src)) {
        withoutReadJsonBody.push(rel(file));
      }
    }
  }

  return {
    total: routes.length,
    rawJsonRoutes,
    directAuthRoutes,
    withoutReadJsonBody,
  };
}

function auditLayouts() {
  const layouts = walk(path.join(WEB, "app"), ".tsx").filter((p) =>
    p.endsWith("layout.tsx"),
  );
  const forceDynamic = [];
  const adminLayout = fs.existsSync(path.join(WEB, "app/admin/layout.tsx"));

  for (const file of layouts) {
    const src = fs.readFileSync(file, "utf8");
    if (/export const dynamic\s*=\s*["']force-dynamic["']/.test(src)) {
      forceDynamic.push(rel(file));
    }
  }

  return { forceDynamic, adminLayout };
}

function auditTests() {
  const libFiles = walk(path.join(WEB, "lib"), ".ts").filter(
    (p) => !p.endsWith(".test.ts"),
  );
  const testFiles = walk(path.join(WEB, "lib"), ".test.ts");
  const e2eSpecs = walk(path.join(ROOT, "apps/web/e2e"), ".ts");

  return {
    libModules: libFiles.length,
    libTestFiles: testFiles.length,
    e2eSpecs: e2eSpecs.length,
    hasResilienceSpec: e2eSpecs.some((p) => p.includes("resilience.spec")),
  };
}

function auditQualityScripts() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
  );
  const qualityGate = fs.readFileSync(
    path.join(ROOT, "scripts/quality-gate.sh"),
    "utf8",
  );
  const ci = fs.readFileSync(
    path.join(ROOT, ".github/workflows/ci.yml"),
    "utf8",
  );

  return {
    hasQualityScript: Boolean(pkg.scripts?.quality),
    qualityGateIncludesResilience: /resilience/.test(qualityGate),
    ciIncludesResilience: /test:e2e/.test(ci),
    ciIncludesI18nSync: /i18n:sync/.test(ci),
  };
}

function main() {
  const api = auditApiRoutes();
  const layouts = auditLayouts();
  const tests = auditTests();
  const quality = auditQualityScripts();

  const report = {
    generatedAt: new Date().toISOString(),
    api,
    layouts,
    tests,
    quality,
    gaps: {
      p0: {
        rawJsonRoutes: api.rawJsonRoutes.length,
        directAuthRoutes: api.directAuthRoutes.length,
        noAdminLayout: !layouts.adminLayout,
        resilienceNotInQualityGate: !quality.qualityGateIncludesResilience,
      },
      p1: {
        forceDynamicLayouts: layouts.forceDynamic.length,
      },
    },
  };

  const outPath = path.join(
    ROOT,
    "docs/plans/web-stability-baseline.json",
  );

  console.log(JSON.stringify(report, null, 2));

  if (process.argv.includes("--write")) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
    console.error(`\nWrote ${rel(outPath)}`);
  } else {
    console.error("\nTip: --write to save docs/plans/web-stability-baseline.json");
  }

  const exitCode =
    api.rawJsonRoutes.length > 0 ||
    !layouts.adminLayout ||
    !tests.hasResilienceSpec
      ? 1
      : 0;
  process.exitCode = exitCode;
}

main();
