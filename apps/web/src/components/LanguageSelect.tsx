"use client";

import { LOCALE_GROUPS, persistCrossSurfaceLocaleClient, type Locale } from "@os-community/shared";

type LanguageSelectProps = {
  current: Locale;
  className?: string;
  id?: string;
  onChange?: (locale: Locale) => void;
  ariaLabel?: string;
};

function persistLocaleOnServer(next: Locale): void {
  const body = JSON.stringify({ locale: next });
  try {
    void fetch("/api/locale", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body,
    });
  } catch {
    /* Client cookies already persist. Reload must not wait on this. */
  }
}

export function LanguageSelect({
  current,
  className = "lang-select",
  id,
  onChange,
  ariaLabel = "Language",
}: LanguageSelectProps) {
  function change(next: Locale) {
    if (next === current) return;
    persistCrossSurfaceLocaleClient(next);
    persistLocaleOnServer(next);
    onChange?.(next);
    window.location.reload();
  }

  return (
    <select
      id={id}
      value={current}
      onChange={(e) => change(e.target.value as Locale)}
      aria-label={ariaLabel}
      className={className}
    >
      {LOCALE_GROUPS.map((group) => (
        <optgroup key={group.tier} label={group.label}>
          {group.locales.map((locale) => (
            <option key={locale.code} value={locale.code}>
              {locale.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
