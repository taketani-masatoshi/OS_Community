import { BRAND_LINKS, consoleStartQueryPath } from "@os-community/shared";
import { safeConsoleNextPath } from "./console-handoff";

/** Relative Community SSO start → Operator Console handoff. */
export function consoleStartPath(nextPath = "/"): string {
  return consoleStartQueryPath(safeConsoleNextPath(nextPath));
}

export function overviewUrl(): string {
  return BRAND_LINKS.overview;
}

export function communityUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  return fromEnv || BRAND_LINKS.community;
}

/**
 * Absolute Console SSO start URL for external sites (oorgos.org, Console auth panel).
 * Prefer NEXT_PUBLIC_SITE_URL when set (local Community).
 */
export function consoleStartAbsoluteUrl(nextPath = "/"): string {
  return `${communityUrl()}${consoleStartPath(nextPath)}`;
}

export function operatorConsoleUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_OPERATOR_CONSOLE_URL?.trim().replace(/\/+$/, "");
  return fromEnv || BRAND_LINKS.console;
}

export { safeConsoleNextPath };
