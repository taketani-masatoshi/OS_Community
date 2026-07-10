import { LOCALES, type Locale, type LocalizedStrings } from "./locales";

export type { LocalizedStrings } from "./locales";

/** Build a full LocalizedStrings map from per-locale values (English required). */
export function localized(values: Partial<Record<Locale, string>> & { en: string }): LocalizedStrings {
  const result = { en: values.en } as LocalizedStrings;
  for (const locale of LOCALES) {
    result[locale] = values[locale] ?? values.en;
  }
  return result;
}
