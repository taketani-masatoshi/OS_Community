/**
 * One-time / maintenance export: dumps current TypeScript i18n bundles to JSON.
 * English → i18n/en/*.json (canonical)
 * Other locales → i18n/locales/{locale}/*.json (overrides only)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES } from "../../src/i18n/locales";
import { getMessages } from "../../src/i18n/index";
import { PAGE_MESSAGES } from "../../src/i18n/pages";
import { LABEL_MESSAGES } from "../../src/i18n/labels";
import { FORM_MESSAGES } from "../../src/i18n/forms";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const I18N_ROOT = path.resolve(__dirname, "../../i18n");

const EN_API_ERRORS: Record<string, string> = {
  UNAUTHORIZED: "Unauthorized",
  PROFILE_INCOMPLETE: "Complete your profile before this action",
  INVALID_JSON: "Invalid request body",
  MODULE_REQUIRED: "Module is required",
  INVALID_ROLE: "Invalid role",
  MODULE_NOT_FOUND: "Module not found",
  WILD_MODULE: "Wild modules use a separate registration flow",
  PENDING_REQUEST: "Pending request exists",
  SAVE_FAILED: "Could not save request",
  NOT_FOUND: "Not found",
  VALIDATION: "Invalid request",
  DISCLAIMER_REQUIRED: "Disclaimer required",
  INVALID_SLUG: "Invalid slug",
  INVALID_TYPE: "Invalid type",
  PENDING_APPLICATION: "Pending application",
  INVALID_INPUT: "Invalid input",
  BOOTSTRAP_FAILED: "Bootstrap failed",
  ELIGIBILITY_FAILED: "Eligibility check failed",
  ISSUANCE_FAILED: "Issuance failed",
  PROGRESS_LOAD_FAILED: "Failed to load progress",
  PROGRESS_SAVE_FAILED: "Failed to record progress",
  GRADING_FAILED: "Grading failed",
  SERVICE_UNAVAILABLE: "Academy Content API is unavailable",
};

type PlainObject = Record<string, unknown>;

function deepMerge(base: PlainObject, override: PlainObject): PlainObject {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const baseValue = base[key];
    const overrideValue = override[key];
    if (
      overrideValue &&
      typeof overrideValue === "object" &&
      !Array.isArray(overrideValue) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMerge(baseValue as PlainObject, overrideValue as PlainObject);
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue;
    }
  }
  return result;
}

function extractOverrides(base: unknown, localized: unknown): unknown {
  if (localized === undefined) return undefined;
  if (typeof base !== "object" || base === null || Array.isArray(base)) {
    return localized !== base ? localized : undefined;
  }
  if (typeof localized !== "object" || localized === null || Array.isArray(localized)) {
    return localized !== base ? localized : undefined;
  }

  const result: PlainObject = {};
  for (const key of Object.keys(localized as PlainObject)) {
    const sub = extractOverrides(
      (base as PlainObject)[key],
      (localized as PlainObject)[key],
    );
    if (sub !== undefined) {
      result[key] = sub;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function writeJson(relativePath: string, data: unknown) {
  const filePath = path.join(I18N_ROOT, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function stripCore(messages: ReturnType<typeof getMessages>) {
  const { opennessPolicy, userPages, ...core } = messages;
  return { core, opennessPolicy, userPages };
}

const enMessages = getMessages("en");
const enStripped = stripCore(enMessages);
const enPages = PAGE_MESSAGES.en;
const enLabels = LABEL_MESSAGES.en;
const enForms = FORM_MESSAGES.en;

writeJson("en/core.json", enStripped.core);
writeJson("en/pages.json", enPages);
writeJson("en/labels.json", enLabels);
writeJson("en/forms.json", enForms);
writeJson("en/user-pages.json", enStripped.userPages);
writeJson("en/openness-policy.json", enStripped.opennessPolicy);
writeJson("en/errors.json", EN_API_ERRORS);

for (const locale of LOCALES) {
  if (locale === "en") continue;

  const messages = getMessages(locale);
  const { core, opennessPolicy, userPages } = stripCore(messages);

  const coreOverride = extractOverrides(enStripped.core, core);
  if (coreOverride) writeJson(`locales/${locale}/core.json`, coreOverride);

  const pagesOverride = extractOverrides(enPages, PAGE_MESSAGES[locale]);
  if (pagesOverride) writeJson(`locales/${locale}/pages.json`, pagesOverride);

  const labelsOverride = extractOverrides(enLabels, LABEL_MESSAGES[locale]);
  if (labelsOverride) writeJson(`locales/${locale}/labels.json`, labelsOverride);

  const formsOverride = extractOverrides(enForms, FORM_MESSAGES[locale]);
  if (formsOverride) writeJson(`locales/${locale}/forms.json`, formsOverride);

  const userPagesOverride = extractOverrides(enStripped.userPages, userPages);
  if (userPagesOverride) writeJson(`locales/${locale}/user-pages.json`, userPagesOverride);

  const opennessOverride = extractOverrides(enStripped.opennessPolicy, opennessPolicy);
  if (opennessOverride) writeJson(`locales/${locale}/openness-policy.json`, opennessOverride);
}

console.log(`Exported canonical i18n to ${I18N_ROOT}`);
