export const LOCALES = ["en", "ja", "pt", "es", "zh", "et", "fr", "de", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export type LocaleTier = "core" | "strategic" | "community";

export type LocaleOption = {
  code: Locale;
  label: string;
  tier: LocaleTier;
  /** Full platform UI strings are available for this locale. */
  uiReady: boolean;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "en", label: "English", tier: "core", uiReady: true },
  { code: "ja", label: "日本語", tier: "strategic", uiReady: true },
  { code: "pt", label: "Português", tier: "strategic", uiReady: true },
  { code: "es", label: "Español", tier: "strategic", uiReady: true },
  { code: "zh", label: "中文", tier: "strategic", uiReady: true },
  { code: "et", label: "Eesti", tier: "strategic", uiReady: true },
  { code: "fr", label: "Français", tier: "community", uiReady: true },
  { code: "de", label: "Deutsch", tier: "community", uiReady: true },
  { code: "ru", label: "Русский", tier: "community", uiReady: true },
];

export const LOCALE_TIER_LABELS: Record<LocaleTier, string> = {
  core: "Core",
  strategic: "Strategic Official",
  community: "Community-supported",
};

export const LOCALE_GROUPS = (["core", "strategic", "community"] as const).map((tier) => ({
  tier,
  label: LOCALE_TIER_LABELS[tier],
  locales: LOCALE_OPTIONS.filter((option) => option.tier === tier),
}));

export const UI_READY_LOCALES = LOCALES;

export type UiReadyLocale = Locale;

/** Localized copy keyed by every supported UI locale (English required as canonical fallback). */
export type LocalizedStrings = Record<Locale, string> & { en: string };

export function resolveLocale(raw?: string | null): Locale {
  if (raw && LOCALES.includes(raw as Locale)) return raw as Locale;
  return "en";
}

export function resolveMessagesLocale(locale: Locale): Locale {
  if (LOCALES.includes(locale)) return locale;
  return "en";
}

export function localeToBcp47(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: "en-US",
    ja: "ja-JP",
    pt: "pt-BR",
    es: "es-ES",
    zh: "zh-CN",
    et: "et-EE",
    fr: "fr-FR",
    de: "de-DE",
    ru: "ru-RU",
  };
  return map[locale];
}
