"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import {
  GOOGLE_PROVIDER_ID,
  isPrimaryProviderConfigured,
  isPrimaryProviderId,
  type PrimaryLoginProviderId,
} from "@/lib/auth-env";

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
  await signIn(provider, { redirectTo });
}
