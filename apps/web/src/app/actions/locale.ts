"use server";

import { cookies } from "next/headers";
import { resolveLocale } from "@os-community/shared";
import { LOCALE_COOKIE } from "@/lib/i18n";

export async function setLocaleCookie(locale: string) {
  const resolved = resolveLocale(locale);
  const store = await cookies();
  store.set(LOCALE_COOKIE, resolved, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
