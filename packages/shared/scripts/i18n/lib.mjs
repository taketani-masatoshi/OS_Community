import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const I18N_ROOT = path.resolve(__dirname, "../../i18n");
export const GENERATED_DIR = path.resolve(__dirname, "../../src/i18n/generated");

export const NAMESPACES = [
  "core",
  "pages",
  "labels",
  "forms",
  "user-pages",
  "openness-policy",
  "errors",
];

export const LOCALES = ["en", "ja", "pt", "es", "zh", "et", "fr", "de", "ru"];

/** @param {string} namespace @param {string} locale */
export function namespacePath(namespace, locale) {
  if (locale === "en") {
    return path.join(I18N_ROOT, "en", `${namespace}.json`);
  }
  return path.join(I18N_ROOT, "locales", locale, `${namespace}.json`);
}

/** @param {string} filePath */
export function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/** @param {string} filePath @param {unknown} data */
export function writeJsonFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/** @param {Record<string, unknown>} base @param {Record<string, unknown>} override */
export function deepMerge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return override === undefined ? base : override;
  }
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
      result[key] = deepMerge(baseValue, overrideValue);
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue;
    }
  }
  return result;
}

/** @param {unknown} obj @param {string} dottedPath @param {unknown} value */
export function setByPath(obj, dottedPath, value) {
  const parts = dottedPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (
      !(part in current) ||
      typeof current[part] !== "object" ||
      current[part] === null ||
      Array.isArray(current[part])
    ) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

/** @param {unknown} value @param {string} [prefix] @returns {string[]} */
export function flattenKeys(value, prefix = "") {
  if (value === null || typeof value !== "object") {
    return prefix ? [prefix] : [];
  }
  if (Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  const keys = [];
  for (const key of Object.keys(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    keys.push(...flattenKeys(value[key], next));
  }
  return keys;
}

/** @param {unknown} obj @param {string} dottedPath */
export function getByPath(obj, dottedPath) {
  return dottedPath.split(".").reduce((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return current[key];
    }
    return undefined;
  }, obj);
}

/**
 * Keep only values that differ from the English base (recursive override tree).
 * @param {unknown} base
 * @param {unknown} localized
 */
export function extractOverrides(base, localized) {
  if (localized === undefined) return undefined;
  if (typeof base !== "object" || base === null || Array.isArray(base)) {
    return localized !== base ? localized : undefined;
  }
  if (typeof localized !== "object" || localized === null || Array.isArray(localized)) {
    return localized !== base ? localized : undefined;
  }

  const result = {};
  for (const key of Object.keys(localized)) {
    const sub = extractOverrides(base[key], localized[key]);
    if (sub !== undefined) {
      result[key] = sub;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/** @param {string} namespace @param {string} locale */
export function loadNamespace(namespace, locale) {
  const en = readJsonFile(namespacePath(namespace, "en"));
  if (locale === "en") return en;
  const override = readJsonFile(namespacePath(namespace, locale));
  return deepMerge(en, override);
}

/** @param {string} namespace */
export function loadAllLocales(namespace) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const locale of LOCALES) {
    out[locale] = loadNamespace(namespace, locale);
  }
  return out;
}

/** @param {unknown} value */
export function toTsLiteral(value) {
  return JSON.stringify(value, null, 2);
}

/** Simplified-Chinese codepoints that must not appear in Japanese UI strings */
export const JA_FORBIDDEN_SIMPLIFIED_RE =
  /[\u4E60\u8BA4\u8BF4\u8BED\u7535\u7F51\u89C6\u9891\u8BFE\u7EC3\u6D4B\u9A8C\u7EED\u62E9\u6784\u5F55\u8FDB\u8F68\u8BA9\u8FD8\u4ECE\u53D1\u7ECF\u5BF9\u73B0\u957F\u95EE\u4EA7\u4E1A\u8FD9\u4E2A\u65E0\u603B\u8BFB\u542C\u4E70\u5356\u4E1C\u8F66\u95E8\u6237\u5E7F\u5E94\u8BE5\u5E76]/u;

/**
 * Fail the build if ja locale files contain simplified-Chinese characters.
 * @param {string} namespace
 * @param {unknown} data
 * @param {string} [pathPrefix]
 */
export function assertJaLocaleCopyClean(namespace, data, pathPrefix = "") {
  if (typeof data === "string") {
    const match = data.match(JA_FORBIDDEN_SIMPLIFIED_RE);
    if (match) {
      throw new Error(
        `[i18n] Simplified Chinese character "${match[0]}" in ja/${namespace}.json at ${pathPrefix}: ${data}`,
      );
    }
    return;
  }
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      assertJaLocaleCopyClean(namespace, item, `${pathPrefix}[${index}]`);
    });
    return;
  }
  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      const next = pathPrefix ? `${pathPrefix}.${key}` : key;
      assertJaLocaleCopyClean(namespace, value, next);
    }
  }
}
