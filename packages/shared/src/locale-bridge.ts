import { resolveLocale, type Locale } from "./i18n/locales";

/** Console UI (ja/en only). Shared across oorgos.org surfaces. */
export const OORGOS_UI_LOCALE_COOKIE = "oorgos-locale";

/** Community full locale (en, ja, de, …). Same Domain when on *.oorgos.org. */
export const COMMUNITY_LOCALE_COOKIE = "locale";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsoleUiLocale = "ja" | "en";

export function isConsoleUiLocale(value: string | null | undefined): value is ConsoleUiLocale {
  return value === "ja" || value === "en";
}

/** Map Community locale → Console UI locale (Console has ja/en only). */
export function toConsoleUiLocale(locale: string): ConsoleUiLocale {
  return resolveLocale(locale) === "ja" ? "ja" : "en";
}

export function localeCookieDomain(hostname: string): string | undefined {
  const host = hostname.toLowerCase();
  if (host === "oorgos.org" || host.endsWith(".oorgos.org")) return ".oorgos.org";
  return undefined;
}

export function buildLocaleCookie(
  name: string,
  value: string,
  hostname: string,
  protocol: string,
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${LOCALE_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ];
  const domain = localeCookieDomain(hostname);
  if (domain) parts.push(`Domain=${domain}`);
  if (protocol === "https:") parts.push("Secure");
  return parts.join(";");
}

export type LocaleCookieSetOptions = {
  path: string;
  maxAge: number;
  sameSite: "lax";
  domain?: string;
  secure?: boolean;
};

export function localeCookieSetOptions(
  hostname: string,
  secure: boolean,
): LocaleCookieSetOptions {
  const domain = localeCookieDomain(hostname);
  return {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    ...(domain ? { domain } : {}),
    ...(secure ? { secure: true } : {}),
  };
}

/** Browser: persist Community + Console locale cookies and localStorage. */
export function persistCrossSurfaceLocaleClient(locale: Locale): void {
  const community = resolveLocale(locale);
  const consoleLocale = toConsoleUiLocale(community);
  try {
    window.localStorage.setItem(OORGOS_UI_LOCALE_COOKIE, consoleLocale);
    window.localStorage.setItem(COMMUNITY_LOCALE_COOKIE, community);
  } catch {
    /* private mode */
  }
  try {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    document.cookie = buildLocaleCookie(COMMUNITY_LOCALE_COOKIE, community, hostname, protocol);
    document.cookie = buildLocaleCookie(OORGOS_UI_LOCALE_COOKIE, consoleLocale, hostname, protocol);
  } catch {
    /* cookie blocked */
  }
}
