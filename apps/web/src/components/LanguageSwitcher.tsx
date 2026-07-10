"use client";

import type { Locale } from "@os-community/shared";
import { LanguageSelect } from "@/components/LanguageSelect";

export function LanguageSwitcher({
  current,
  ariaLabel,
}: {
  current: Locale;
  ariaLabel?: string;
}) {
  return <LanguageSelect current={current} ariaLabel={ariaLabel} />;
}
