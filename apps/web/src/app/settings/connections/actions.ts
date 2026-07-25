"use server";

import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

function connectionsLoginRedirect(): never {
  redirect(`/login/start?callbackUrl=${encodeURIComponent("/settings/connections")}`);
}

export async function connectGithubAccount(
  callbackUrl = "/settings/connections?linked=github",
) {
  const session = await auth();
  if (!session?.user?.id) {
    connectionsLoginRedirect();
  }

  await signIn("github", { redirectTo: callbackUrl });
}

export async function connectLinkedInAccount(callbackUrl = "/settings/connections?linked=1") {
  const session = await auth();
  if (!session?.user?.id) {
    connectionsLoginRedirect();
  }

  await signIn("linkedin", { redirectTo: callbackUrl });
}
