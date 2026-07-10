import {
  type Locale,
  type LocaleOption,
  type LocaleTier,
  type UiReadyLocale,
  type LocalizedStrings,
  LOCALE_GROUPS,
  LOCALE_OPTIONS,
  LOCALE_TIER_LABELS,
  LOCALES,
  UI_READY_LOCALES,
  localeToBcp47,
  resolveLocale,
  resolveMessagesLocale,
} from "./locales";
import type { Messages } from "./types/messages";
import type { PageMessages } from "./types/pages";
import {
  MESSAGES,
  PAGE_MESSAGES,
  LABEL_MESSAGES,
  FORM_MESSAGES,
  getErrorMessage,
} from "./generated/bundles";

export type { Locale, LocaleOption, LocaleTier, UiReadyLocale, LocalizedStrings };
export type { Messages } from "./types/messages";
export type { PageMessages } from "./types/pages";
export type { LabelMessages } from "./types/labels";
export type { FormMessages } from "./types/forms";
export type { UserPagesMessages } from "./types/user-pages";
export type { OpennessPolicyMessages } from "./types/openness-policy";

export {
  LOCALE_GROUPS,
  LOCALE_OPTIONS,
  LOCALE_TIER_LABELS,
  LOCALES,
  UI_READY_LOCALES,
  localeToBcp47,
  resolveLocale,
  resolveMessagesLocale,
  getErrorMessage,
};

export function getMessages(locale: Locale): Messages {
  return MESSAGES[resolveMessagesLocale(locale)];
}

export function getLocalized<T extends Partial<Record<Locale, string>> & { en: string }>(
  field: T,
  locale: Locale
): string {
  return field[locale] ?? field.en;
}

export function getLabelMessages(locale: Locale) {
  return LABEL_MESSAGES[resolveMessagesLocale(locale)];
}

export function getFormMessages(locale: Locale) {
  return FORM_MESSAGES[resolveMessagesLocale(locale)];
}

export function getPageMessages(locale: Locale): PageMessages {
  return PAGE_MESSAGES[resolveMessagesLocale(locale)];
}

export { PAGE_MESSAGES, LABEL_MESSAGES, FORM_MESSAGES };
