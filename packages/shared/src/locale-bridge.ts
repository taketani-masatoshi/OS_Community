import { resolveLocale, type Locale } from "./i18n/locales";

/** Console UI (ja/en only). Shared across oorgos.org surfaces. */
export const OORGOS_UI_LOCALE_COOKIE = "oorgos-locale";

/**
 * Community full locale (en, ja, de, …). Host-only — never Domain=.oorgos.org.
 * Named apart from the legacy `locale` cookie so an HttpOnly leftover cannot pin the UI.
 */
export const COMMUNITY_LOCALE_COOKIE = "oorgos-lang";

/** Pre-2026-08 cookie. HttpOnly host-only copies cannot be cleared from JS. */
export const LEGACY_COMMUNITY_LOCALE_COOKIE = "locale";

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

function setCookieLine(
  name: string,
  value: string,
  extra: { maxAge: number; domain?: string; secure?: boolean; httpOnly?: boolean },
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${extra.maxAge}`,
    "SameSite=Lax",
  ];
  if (extra.domain) parts.push(`Domain=${extra.domain}`);
  if (extra.secure) parts.push("Secure");
  if (extra.httpOnly) parts.push("HttpOnly");
  return parts.join("; ");
}

export function buildDocumentLocaleCookie(
  name: string,
  value: string,
  hostname: string,
  protocol: string,
  options?: { shareAcrossSubdomains?: boolean },
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${LOCALE_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ];
  if (options?.shareAcrossSubdomains) {
    const domain = localeCookieDomain(hostname);
    if (domain) parts.push(`Domain=${domain}`);
  }
  if (protocol === "https:") parts.push("Secure");
  return parts.join(";");
}

/** @deprecated use buildDocumentLocaleCookie */
export function buildLocaleCookie(
  name: string,
  value: string,
  hostname: string,
  protocol: string,
): string {
  return buildDocumentLocaleCookie(name, value, hostname, protocol, { shareAcrossSubdomains: true });
}

export type LocaleCookieSetOptions = {
  path: string;
  maxAge: number;
  sameSite: "lax";
  domain?: string;
  secure?: boolean;
  httpOnly: false;
};

export function hostOnlyExpireCookie(name: string, secure = false): string {
  const parts = [`${name}=`, "path=/", "max-age=0"];
  if (secure) parts.push("Secure");
  return parts.join(";");
}

export function localeCookieExpireHostOnlyOptions(): { path: string; maxAge: 0 } {
  return { path: "/", maxAge: 0 };
}

export function localeCookieSetOptions(
  hostname: string,
  secure: boolean,
  options?: { shareAcrossSubdomains?: boolean },
): LocaleCookieSetOptions {
  const domain = options?.shareAcrossSubdomains ? localeCookieDomain(hostname) : undefined;
  return {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
    ...(domain ? { domain } : {}),
    ...(secure ? { secure: true } : {}),
  };
}

/**
 * Set-Cookie lines for POST /api/locale. Multiple lines per name are required so
 * a Domain leftover and a host-only HttpOnly leftover can both be expired —
 * Next.js `cookies().set()` keeps only one cookie per name.
 */
export function localeSetCookieHeaders(input: {
  communityLocale: string;
  hostname: string;
  secure: boolean;
}): string[] {
  const community = resolveLocale(input.communityLocale);
  const consoleLocale = toConsoleUiLocale(community);
  const domain = localeCookieDomain(input.hostname);
  const lines: string[] = [];

  for (const withDomain of [false, true] as const) {
    if (withDomain && !domain) continue;
    for (const httpOnly of [true, false]) {
      for (const secureFlag of [true, false]) {
        lines.push(
          setCookieLine(LEGACY_COMMUNITY_LOCALE_COOKIE, "", {
            maxAge: 0,
            domain: withDomain ? domain : undefined,
            secure: secureFlag,
            httpOnly,
          }),
        );
      }
    }
  }

  lines.push(
    setCookieLine(COMMUNITY_LOCALE_COOKIE, community, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      secure: input.secure,
    }),
  );

  lines.push(
    setCookieLine(OORGOS_UI_LOCALE_COOKIE, consoleLocale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      domain,
      secure: input.secure,
    }),
  );

  return lines;
}

function expireJsVisibleCookies(hostname: string, protocol: string): void {
  const domain = localeCookieDomain(hostname);
  const names = [LEGACY_COMMUNITY_LOCALE_COOKIE, COMMUNITY_LOCALE_COOKIE, OORGOS_UI_LOCALE_COOKIE];
  for (const name of names) {
    document.cookie = hostOnlyExpireCookie(name, false);
    document.cookie = hostOnlyExpireCookie(name, true);
    if (domain) {
      document.cookie = `${name}=;path=/;max-age=0;Domain=${domain}`;
      if (protocol === "https:") {
        document.cookie = `${name}=;path=/;max-age=0;Secure;Domain=${domain}`;
      }
    }
  }
}

/** Browser: persist Community + Console locale (JS-visible copies only). */
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
    expireJsVisibleCookies(hostname, protocol);
    document.cookie = buildDocumentLocaleCookie(
      COMMUNITY_LOCALE_COOKIE,
      community,
      hostname,
      protocol,
    );
    document.cookie = buildDocumentLocaleCookie(
      OORGOS_UI_LOCALE_COOKIE,
      consoleLocale,
      hostname,
      protocol,
      { shareAcrossSubdomains: true },
    );
  } catch {
    /* cookie blocked */
  }
}
