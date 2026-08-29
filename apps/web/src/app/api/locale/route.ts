import { NextResponse } from "next/server";
import {
  localeSetCookieHeaders,
  resolveLocale,
} from "@os-community/shared";
import { apiErrorResponse } from "@/lib/api-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requestHost(req: Request): string {
  return (
    req.headers.get("x-forwarded-host")?.split(":")[0]?.trim() ||
    req.headers.get("host")?.split(":")[0]?.trim() ||
    "localhost"
  );
}

function requestSecure(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto")?.trim().toLowerCase();
  if (proto === "https") return true;
  if (proto === "http") return false;
  return process.env.NODE_ENV === "production";
}

function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const site = req.headers.get("sec-fetch-site")?.toLowerCase();
  if (!origin) return site === "same-origin" || site === "none";
  try {
    const originHost = new URL(origin).hostname.toLowerCase();
    return originHost === requestHost(req).toLowerCase();
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return apiErrorResponse("VALIDATION", 403);
  }

  let raw: unknown = null;
  try {
    raw = await req.json();
  } catch {
    return apiErrorResponse("VALIDATION", 400);
  }
  const locale = typeof raw === "object" && raw && "locale" in raw ? String((raw as { locale: unknown }).locale) : "";
  const resolved = resolveLocale(locale);
  const res = NextResponse.json({ ok: true, locale: resolved });
  for (const line of localeSetCookieHeaders({
    communityLocale: resolved,
    hostname: requestHost(req),
    secure: requestSecure(req),
  })) {
    res.headers.append("Set-Cookie", line);
  }
  return res;
}
