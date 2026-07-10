import type { Locale } from "@os-community/shared";
import { applyPrimaryLoginProviderLabel } from "@/lib/auth-env";

function localize(text: string, locale: Locale): string {
  return applyPrimaryLoginProviderLabel(text, locale);
}

/** Settings / mypage strings with primary-provider labels resolved from .env. */
export function localizeSettingsCopy<T extends Record<string, string>>(settings: T, locale: Locale): T {
  return settings;
}

/** My Page strings with primary-provider labels resolved from .env. */
export function localizeMypageCopy<T extends Record<string, string>>(mypage: T, locale: Locale): T {
  const keys = ["openOrgIdHint", "personaExploringDesc"] as const;
  const next: Record<string, string> = { ...mypage };
  for (const key of keys) {
    if (key in mypage && typeof mypage[key] === "string") {
      next[key] = localize(mypage[key], locale);
    }
  }
  return next as T;
}
