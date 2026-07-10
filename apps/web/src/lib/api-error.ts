import { NextResponse } from "next/server";
import { getErrorMessage, resolveLocale, type Locale } from "@os-community/shared";
import { LOCALE_COOKIE } from "@/lib/i18n";
import { cookies } from "next/headers";

export async function getRequestLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function apiErrorResponse(
  code: string,
  status: number,
  init?: { extra?: Record<string, unknown>; headers?: HeadersInit },
): Promise<NextResponse> {
  const locale = await getRequestLocale();
  return NextResponse.json(
    { error: getErrorMessage(locale, code), code, ...(init?.extra ?? {}) },
    { status, headers: init?.headers },
  );
}
