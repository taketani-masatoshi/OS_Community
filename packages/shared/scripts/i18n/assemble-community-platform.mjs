#!/usr/bin/env node
/**
 * Assembles community-platform-translations.mjs from locale translation maps.
 * Run: node scripts/i18n/assemble-community-platform.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "cpt-data");
const OUT = path.join(__dirname, "community-platform-translations.mjs");

const LOCALES = ["ja", "pt", "es", "zh", "et", "fr", "de", "ru"];

/** @type {Record<string, Record<string, string>>} */
const byLocale = {};
for (const locale of LOCALES) {
  const file = path.join(DATA_DIR, `${locale}.json`);
  byLocale[locale] = JSON.parse(fs.readFileSync(file, "utf8"));
}

const lines = [
  "/** Community platform UI strings — merged into dictionary on i18n:dict */",
  "export const COMMUNITY_PLATFORM_TRANSLATIONS = " +
    JSON.stringify(byLocale, null, 2) +
    ";",
  "",
];

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`Wrote ${OUT} (${LOCALES.length} locales)`);
