"use server";

import { cookies, headers } from "next/headers";
import {
  resolveLocale,
  COMMUNITY_LOCALE_COOKIE,
  OORGOS_UI_LOCALE_COOKIE,
  toConsoleUiLocale,
  localeCookieSetOptions,
} from "@os-community/shared";

function requestHost(headerStore: Awaited<ReturnType<typeof headers>>): string {
  return (
    headerStore.get("x-forwarded-host")?.split(":")[0]?.trim() ||
    headerStore.get("host")?.split(":")[0]?.trim() ||
    "localhost"
  );
}

function requestSecure(headerStore: Awaited<ReturnType<typeof headers>>): boolean {
  const proto = headerStore.get("x-forwarded-proto")?.trim().toLowerCase();
  if (proto === "https") return true;
  if (proto === "http") return false;
  return process.env.NODE_ENV === "production";
}

export async function setLocaleCookie(locale: string) {
  const resolved = resolveLocale(locale);
  const consoleLocale = toConsoleUiLocale(resolved);
  const headerStore = await headers();
  const host = requestHost(headerStore);
  const opts = localeCookieSetOptions(host, requestSecure(headerStore));
  const store = await cookies();
  store.set(COMMUNITY_LOCALE_COOKIE, resolved, opts);
  store.set(OORGOS_UI_LOCALE_COOKIE, consoleLocale, opts);
}
