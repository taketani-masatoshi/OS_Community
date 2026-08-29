import { describe, expect, it } from "vitest";
import {
  buildDocumentLocaleCookie,
  COMMUNITY_LOCALE_COOKIE,
  hostOnlyExpireCookie,
  LEGACY_COMMUNITY_LOCALE_COOKIE,
  localeCookieDomain,
  localeCookieSetOptions,
  localeSetCookieHeaders,
  OORGOS_UI_LOCALE_COOKIE,
  toConsoleUiLocale,
} from "./locale-bridge";

describe("locale-bridge", () => {
  it("maps Community locales to Console ja/en", () => {
    expect(toConsoleUiLocale("ja")).toBe("ja");
    expect(toConsoleUiLocale("en")).toBe("en");
    expect(toConsoleUiLocale("de")).toBe("en");
    expect(toConsoleUiLocale("fr")).toBe("en");
  });

  it("shares Console cookie on oorgos.org subdomains", () => {
    expect(localeCookieDomain("community.oorgos.org")).toBe(".oorgos.org");
    expect(localeCookieDomain("operator.oorgos.org")).toBe(".oorgos.org");
    expect(localeCookieDomain("localhost")).toBeUndefined();
  });

  it("keeps Community locale host-only", () => {
    const cookie = buildDocumentLocaleCookie(
      COMMUNITY_LOCALE_COOKIE,
      "en",
      "community.oorgos.org",
      "https:",
    );
    expect(cookie).toContain(`${COMMUNITY_LOCALE_COOKIE}=en`);
    expect(cookie).not.toContain("Domain=");
    expect(cookie).toContain("Secure");
  });

  it("keeps Console cookie readable and shared", () => {
    const opts = localeCookieSetOptions("community.oorgos.org", true, {
      shareAcrossSubdomains: true,
    });
    expect(opts.httpOnly).toBe(false);
    expect(opts.domain).toBe(".oorgos.org");
    expect(opts.secure).toBe(true);
  });

  it("expires host-only leftovers that JS can see", () => {
    expect(hostOnlyExpireCookie("locale")).toBe("locale=;path=/;max-age=0");
    expect(hostOnlyExpireCookie("locale", true)).toBe("locale=;path=/;max-age=0;Secure");
  });

  it("expires HttpOnly Domain leftovers and writes oorgos-lang without Domain", () => {
    const lines = localeSetCookieHeaders({
      communityLocale: "en",
      hostname: "community.oorgos.org",
      secure: true,
    });
    expect(
      lines.some(
        (line) =>
          line.startsWith(`${LEGACY_COMMUNITY_LOCALE_COOKIE}=`) &&
          line.includes("Max-Age=0") &&
          line.includes("Domain=.oorgos.org") &&
          line.includes("HttpOnly"),
      ),
    ).toBe(true);
    const community = lines.find((line) => line.startsWith(`${COMMUNITY_LOCALE_COOKIE}=en`));
    expect(community).toBeDefined();
    expect(community).not.toContain("Domain=");
    const consoleCookie = lines.find((line) => line.startsWith(`${OORGOS_UI_LOCALE_COOKIE}=en`));
    expect(consoleCookie).toContain("Domain=.oorgos.org");
  });
});
