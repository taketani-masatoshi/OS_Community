#!/usr/bin/env node
/**
 * Validates i18n JSON: key parity, stray keys, untranslated strings.
 * --strict  Fail if any non-allowlisted English string lacks a dictionary entry
 *           or merged value still equals English after overrides.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  I18N_ROOT,
  LOCALES,
  NAMESPACES,
  flattenKeys,
  getByPath,
  loadNamespace,
  namespacePath,
  readJsonFile,
} from "./lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const strict = process.argv.includes("--strict");
const DICT_DIR = path.join(I18N_ROOT, "dictionary");
const ALLOWED_PATH = path.join(I18N_ROOT, "allowed-identical.json");
const USER_PAGES_TYPE = path.resolve(__dirname, "../../src/i18n/types/user-pages.ts");

/** @returns {string[]} */
function userPagesTypeKeys() {
  const src = fs.readFileSync(USER_PAGES_TYPE, "utf8");
  return [...src.matchAll(/^\s+(\w+): string;/gm)].map((m) => m[1]);
}

function validateUserPagesTypeParity(errors) {
  const typeKeys = new Set(userPagesTypeKeys());
  const enKeys = new Set(flattenKeys(loadNamespace("user-pages", "en")));
  for (const key of typeKeys) {
    if (!enKeys.has(key)) {
      errors.push(`[user-pages/en] missing key required by UserPagesMessages type: ${key}`);
    }
  }
  for (const key of enKeys) {
    if (!typeKeys.has(key)) {
      errors.push(`[user-pages/en] extra key not in UserPagesMessages type: ${key}`);
    }
  }
}

const allowedIdentical = new Set(JSON.parse(fs.readFileSync(ALLOWED_PATH, "utf8")));

/** @type {Record<string, Record<string, string>>} */
const dictionaries = {};
for (const locale of LOCALES) {
  if (locale === "en") continue;
  const file = path.join(DICT_DIR, `${locale}.json`);
  dictionaries[locale] = fs.existsSync(file) ? readJsonFile(file) : {};
}

const NON_EN_LOCALES = LOCALES.filter((l) => l !== "en");

/** @type {string[]} */
const errors = [];
/** @type {string[]} */
const warnings = [];

validateUserPagesTypeParity(errors);

for (const namespace of NAMESPACES) {
  const en = loadNamespace(namespace, "en");
  const enKeys = new Set(flattenKeys(en));

  if (namespace === "errors" && enKeys.size === 0) {
    warnings.push(`[${namespace}] English canonical file is empty`);
    continue;
  }

  for (const locale of NON_EN_LOCALES) {
    const overridePath = namespacePath(namespace, locale);
    const override = readJsonFile(overridePath);
    const merged = loadNamespace(namespace, locale);
    const mergedKeys = new Set(flattenKeys(merged));
    const dict = dictionaries[locale] ?? {};

    for (const key of enKeys) {
      if (!mergedKeys.has(key)) {
        errors.push(`[${namespace}/${locale}] missing key: ${key}`);
      }
    }

    for (const key of flattenKeys(override)) {
      if (!enKeys.has(key)) {
        errors.push(`[${namespace}/${locale}] unknown override key: ${key}`);
      }
    }

    for (const key of enKeys) {
      const enValue = getByPath(en, key);
      const mergedValue = getByPath(merged, key);
      if (typeof enValue !== "string" || typeof mergedValue !== "string") continue;
      if (mergedValue !== enValue) continue;

      const dictEntry = dict[enValue];
      const allowlisted = allowedIdentical.has(enValue);

      if (allowlisted) continue;

      if (!dictEntry) {
        const msg = `[${namespace}/${locale}] untranslated (no dictionary): ${key}`;
        if (strict) errors.push(msg);
        else warnings.push(msg);
        continue;
      }

      if (dictEntry === enValue) {
        const msg = `[${namespace}/${locale}] cognate (dictionary matches English): ${key}`;
        if (strict) errors.push(msg);
        else warnings.push(msg);
      }
    }
  }
}

console.log(`Checked ${NAMESPACES.length} namespaces × ${NON_EN_LOCALES.length} locales${strict ? " (strict)" : ""}`);

if (warnings.length > 0 && !strict) {
  console.warn(`\n⚠ ${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, 30)) {
    console.warn(`  ${w}`);
  }
  if (warnings.length > 30) {
    console.warn(`  … and ${warnings.length - 30} more`);
  }
}

if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} error(s):`);
  for (const e of errors.slice(0, 50)) {
    console.error(`  ${e}`);
  }
  if (errors.length > 50) {
    console.error(`  … and ${errors.length - 50} more`);
  }
  process.exit(1);
}

console.log("\n✓ i18n check passed");
process.exit(0);
