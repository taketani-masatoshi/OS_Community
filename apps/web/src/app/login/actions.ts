"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import {
  GOOGLE_PROVIDER_ID,
  isPrimaryProviderConfigured,
  isPrimaryProviderId,
  type PrimaryLoginProviderId,
} from "@/lib/auth-env";
import { REAUTH_COOKIE } from "@/lib/auth-reauth";

export async function signInWithGoogle(redirectTo: string) {
  await signInWithPrimaryProvider(GOOGLE_PROVIDER_ID, redirectTo);
}

async function signInWithPrimaryProvider(
  provider: PrimaryLoginProviderId,
  redirectTo: string
) {
  if (!isPrimaryProviderId(provider) || !isPrimaryProviderConfigured(provider)) {
    redirect("/login?error=Configuration");
  }

  const jar = await cookies();
  const forceReauth = jar.get(REAUTH_COOKIE)?.value === "1";
  if (forceReauth) {
    jar.delete(REAUTH_COOKIE);
  }

  // After Community sign-out, ask Google to re-authenticate (password / 2SV as configured).
  // Otherwise still show account picker via provider default prompt=select_account.
  const authorizationParams = forceReauth
    ? { prompt: "login select_account" }
    : { prompt: "select_account" };

  await signIn(provider, { redirectTo }, authorizationParams);
}
