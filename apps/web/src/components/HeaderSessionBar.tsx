"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { getSessionDisplayName, isSignedInSession } from "@/lib/session-display";
import { ClientSignOutButton } from "@/components/ClientSignOutButton";
import { loginStartHref } from "@/lib/login-href";

type Labels = {
  signIn: string;
  signOut: string;
  myPage: string;
  admin: string;
};

export function HeaderSessionBar({
  labels,
  serverSessionInfo,
}: {
  labels: Labels;
  serverSessionInfo?: { userName: string; isAdmin: boolean } | null;
}) {
  const { data: session, status } = useSession();
  const clientSignedIn = isSignedInSession(session);
  // Prefer server session so the header does not flash "Sign in" after login.
  const isSignedIn = Boolean(serverSessionInfo) || clientSignedIn || status === "authenticated";
  const clientIsAdmin =
    session?.user?.siteRole === "ADMIN" || session?.user?.siteRole === "CERT_REVIEWER";
  const isAdmin = serverSessionInfo?.isAdmin ?? clientIsAdmin;
  const userName =
    serverSessionInfo?.userName ??
    (session?.user ? getSessionDisplayName(session.user) : null);

  if (!isSignedIn) {
    return (
      <Link href={loginStartHref("/mypage")} className="btn btn-primary btn-sm">
        {labels.signIn}
      </Link>
    );
  }

  return (
    <>
      {isAdmin && (
        <Link href="/admin" className="btn btn-primary btn-sm">
          {labels.admin}
        </Link>
      )}
      {userName && <span className="site-nav-user">{userName}</span>}
      <ClientSignOutButton label={labels.signOut} className="btn btn-primary btn-sm" />
    </>
  );
}

export function useHeaderSessionInfo(
  serverSessionInfo?: { userName: string; isAdmin: boolean } | null,
) {
  const { data: session, status } = useSession();
  const isSignedIn =
    Boolean(serverSessionInfo) || isSignedInSession(session) || status === "authenticated";
  if (serverSessionInfo) return serverSessionInfo;
  if (!isSignedIn || !session?.user) return null;
  const isAdmin =
    session.user.siteRole === "ADMIN" || session.user.siteRole === "CERT_REVIEWER";
  return {
    userName: getSessionDisplayName(session.user),
    isAdmin,
  };
}
