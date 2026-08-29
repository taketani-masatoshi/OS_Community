"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_GROUPS, persistCrossSurfaceLocaleClient, type Locale } from "@os-community/shared";
import { setLocaleCookie } from "@/app/actions/locale";

type LanguageSelectProps = {
  current: Locale;
  className?: string;
  id?: string;
  onChange?: (locale: Locale) => void;
  ariaLabel?: string;
};

export function LanguageSelect({
  current,
  className = "lang-select",
  id,
  onChange,
  ariaLabel = "Language",
}: LanguageSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === current || pending) return;

    startTransition(async () => {
      persistCrossSurfaceLocaleClient(next);
      await setLocaleCookie(next);
      onChange?.(next);
      router.refresh();
    });
  }

  return (
    <select
      id={id}
      value={current}
      disabled={pending}
      onChange={(e) => change(e.target.value as Locale)}
      aria-label={ariaLabel}
      aria-busy={pending}
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
