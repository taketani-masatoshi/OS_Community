import { cookies, headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { getMessages, resolveLocale, LOCALES, type Locale } from "@os-community/shared";

export const LOCALE_COOKIE = "locale";

function resolveLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null;
  const first = acceptLanguage.split(",")[0]?.split(";")[0]?.trim().toLowerCase();
  if (!first) return null;
  const primary = first.split("-")[0];
  if (LOCALES.includes(primary as Locale)) return primary as Locale;
  return null;
}

export async function getLocale(): Promise<Locale> {
  noStore();
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  if (fromCookie) return resolveLocale(fromCookie);

  const headerStore = await headers();
  const fromHeader = resolveLocaleFromAcceptLanguage(headerStore.get("accept-language"));
  return fromHeader ?? "en";
}

export async function getT() {
  const locale = await getLocale();
  return { locale, messages: getMessages(locale), t: getMessages(locale) };
}

export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}
