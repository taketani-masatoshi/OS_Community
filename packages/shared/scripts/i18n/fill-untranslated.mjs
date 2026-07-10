#!/usr/bin/env node
/**
 * Fills locale override JSON from dictionary/*.json (English value → translation).
 * Run after editing en canonical or dictionary files.
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
  setByPath,
  writeJsonFile,
} from "./lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DICT_DIR = path.join(I18N_ROOT, "dictionary");
const ALLOWED_PATH = path.join(I18N_ROOT, "allowed-identical.json");

const allowedIdentical = new Set(JSON.parse(fs.readFileSync(ALLOWED_PATH, "utf8")));

/** @type {Record<string, Record<string, string>>} */
const dictionaries = {};
for (const locale of LOCALES) {
  if (locale === "en") continue;
  const file = path.join(DICT_DIR, `${locale}.json`);
  dictionaries[locale] = fs.existsSync(file) ? readJsonFile(file) : {};
}

const NON_EN = LOCALES.filter((l) => l !== "en");
/** @type {string[]} */
const missing = [];
let filled = 0;

for (const namespace of NAMESPACES) {
  const en = loadNamespace(namespace, "en");
  for (const locale of NON_EN) {
    const overridePath = namespacePath(namespace, locale);
    const override = readJsonFile(overridePath);
    const merged = loadNamespace(namespace, locale);
    const dict = dictionaries[locale] ?? {};

    for (const key of flattenKeys(en)) {
      const enValue = getByPath(en, key);
      const mergedValue = getByPath(merged, key);
      if (typeof enValue !== "string" || typeof mergedValue !== "string") continue;
      if (mergedValue !== enValue) continue;
      if (allowedIdentical.has(enValue)) continue;

      const translation = dict[enValue];
      if (!translation) {
        missing.push(`[${namespace}/${locale}] ${key}: ${JSON.stringify(enValue)}`);
        continue;
      }

      setByPath(override, key, translation);
      filled++;
    }

    if (Object.keys(override).length > 0) {
      writeJsonFile(overridePath, override);
    }
  }
}

console.log(`Filled ${filled} override(s)`);
if (missing.length > 0) {
  console.error(`Missing dictionary entries: ${missing.length}`);
  for (const m of missing) console.error(`  ${m}`);
  process.exit(1);
}
