#!/usr/bin/env node
/**
 * Writes dictionary/*.json from translations-data.mjs + extra-translations.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TRANSLATIONS } from "./translations-data.mjs";
import { EXTRA_TRANSLATIONS } from "./extra-translations.mjs";
import { EHR_METAPHOR_TRANSLATIONS } from "./ehr-metaphor-translations.mjs";
import { USER_PAGES_ADMIN_TRANSLATIONS } from "./user-pages-admin-translations.mjs";
import { AUTH_UI_TRANSLATIONS } from "./auth-ui-translations.mjs";
import { ACCOUNT_UI_TRANSLATIONS } from "./account-ui-translations.mjs";
import { IDENTITY_LAYER_TRANSLATIONS } from "./identity-layer-translations.mjs";
import { COMMUNITY_PLATFORM_TRANSLATIONS } from "./community-platform-translations.mjs";
import { LEARNING_GUIDES_TRANSLATIONS } from "./learning-guides-translations.mjs";
import { MYPAGE_VIDEOS_TRANSLATIONS } from "./mypage-videos-translations.mjs";
import { ORGOS_OVERVIEW_TRANSLATIONS } from "./orgos-overview-translations.mjs";
import { GETTING_STARTED_ORGOS_TRANSLATIONS } from "./getting-started-orgos-translations.mjs";
import { ADMIN_COMMITTEE_TRANSLATIONS } from "./admin-committee-translations.mjs";
import { COMPLIANCE_REGISTRY_TRANSLATIONS } from "./compliance-registry-translations.mjs";
import { STEWARD_PROTOCOL_VOCABULARY_TRANSLATIONS } from "./steward-protocol-vocabulary-translations.mjs";
import { WIRE_NODE_PAGE_TRANSLATIONS } from "./wire-node-page-translations.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DICT_DIR = path.resolve(__dirname, "../../i18n/dictionary");

/** Fix cognates: English key → preferred translation per locale */
const COGNATE_OVERRIDES = {
  fr: {
    Certification: "Certifications",
    "Certification →": "Certifications →",
    Documentation: "Guides & docs",
    "{title} — {count} questions": "{title} — {count} questions (quiz)",
  },
  de: {
    Status: "Zustand",
    Administrator: "Site-Administrator",
  },
};

for (const [locale, dict] of Object.entries(TRANSLATIONS)) {
  const merged = {
    ...dict,
    ...(EXTRA_TRANSLATIONS[locale] ?? {}),
    ...(COGNATE_OVERRIDES[locale] ?? {}),
    ...(EHR_METAPHOR_TRANSLATIONS[locale] ?? {}),
    ...(USER_PAGES_ADMIN_TRANSLATIONS[locale] ?? {}),
    ...(AUTH_UI_TRANSLATIONS[locale] ?? {}),
    ...(ACCOUNT_UI_TRANSLATIONS[locale] ?? {}),
    ...(IDENTITY_LAYER_TRANSLATIONS[locale] ?? {}),
    ...(COMMUNITY_PLATFORM_TRANSLATIONS[locale] ?? {}),
    ...(LEARNING_GUIDES_TRANSLATIONS[locale] ?? {}),
    ...(MYPAGE_VIDEOS_TRANSLATIONS[locale] ?? {}),
    ...(ORGOS_OVERVIEW_TRANSLATIONS[locale] ?? {}),
    ...(GETTING_STARTED_ORGOS_TRANSLATIONS[locale] ?? {}),
    ...(ADMIN_COMMITTEE_TRANSLATIONS[locale] ?? {}),
    ...(COMPLIANCE_REGISTRY_TRANSLATIONS[locale] ?? {}),
    ...(STEWARD_PROTOCOL_VOCABULARY_TRANSLATIONS[locale] ?? {}),
    ...(WIRE_NODE_PAGE_TRANSLATIONS[locale] ?? {}),
  };
  const filePath = path.join(DICT_DIR, `${locale}.json`);
  fs.mkdirSync(DICT_DIR, { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Wrote ${filePath} (${Object.keys(merged).length} entries)`);
}
