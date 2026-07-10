#!/usr/bin/env node
/**
 * Fails if API routes return hardcoded English error strings instead of apiErrorResponse().
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(__dirname, "../../../../apps/web/src/app/api");

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

const forbidden = /NextResponse\.json\(\s*\{\s*error:\s*"/;
/** @type {string[]} */
const violations = [];

for (const file of walk(API_ROOT)) {
  const content = fs.readFileSync(file, "utf8");
  if (!forbidden.test(content)) continue;
  const rel = path.relative(path.resolve(__dirname, "../../.."), file);
  violations.push(rel);
}

if (violations.length > 0) {
  console.error(`✗ Hardcoded API error strings (${violations.length} file(s)):`);
  for (const v of violations) console.error(`  ${v}`);
  console.error("\nUse apiErrorResponse(code, status) from @/lib/api-error");
  process.exit(1);
}

console.log("✓ No hardcoded API error strings");
