import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import {
  GOOGLE_PROVIDER_ID,
  isPrimaryProviderConfigured,
} from "@/lib/auth-env";
import { REAUTH_COOKIE } from "@/lib/auth-reauth";

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/mypage";
  return raw;
}

/**
 * GET /login/start?callbackUrl=/mypage
 * Starts Google OAuth immediately (header / bottom-nav / footer Sign in).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectTo = safeCallbackUrl(url.searchParams.get("callbackUrl"));

  if (!isPrimaryProviderConfigured(GOOGLE_PROVIDER_ID)) {
    return NextResponse.redirect(new URL("/login?error=Configuration", url.origin));
  }

  const jar = await cookies();
  const forceReauth = jar.get(REAUTH_COOKIE)?.value === "1";
  if (forceReauth) {
    jar.delete(REAUTH_COOKIE);
  }
  const authorizationParams = forceReauth
    ? { prompt: "login select_account" }
    : { prompt: "select_account" };

  await signIn(GOOGLE_PROVIDER_ID, { redirectTo }, authorizationParams);
  return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(redirectTo)}`, url.origin));
}
