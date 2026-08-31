"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  getSessionDisplayName,
  isHeaderSignedIn,
  isSignedInSession,
} from "@/lib/session-display";
import { ClientSignOutButton } from "@/components/ClientSignOutButton";

type Labels = {
  signIn: string;
  signOut: string;
  myPage: string;
  admin: string;
  proposeModule: string;
};

export function HeaderSessionBar({
  labels,
  serverSessionInfo,
}: {
  labels: Labels;
  serverSessionInfo?: { userName: string; isAdmin: boolean } | null;
}) {
  const { data: session } = useSession();
  const isSignedIn = isHeaderSignedIn(session, serverSessionInfo);
  const clientIsAdmin =
    session?.user?.siteRole === "ADMIN" || session?.user?.siteRole === "CERT_REVIEWER";
  const isAdmin = serverSessionInfo?.isAdmin ?? clientIsAdmin;
  const userName =
    serverSessionInfo?.userName ??
    (session?.user ? getSessionDisplayName(session.user) : null);

  if (!isSignedIn) {
    return (
      <Link href="/login?callbackUrl=/mypage" className="btn btn-primary btn-sm">
        {labels.signIn}
      </Link>
    );
  }

  return (
    <>
      {isAdmin && <Link href="/admin">{labels.admin}</Link>}
      <Link href="/wild-modules/register" className="btn btn-ghost btn-sm">
        {labels.proposeModule}
      </Link>
      <Link href="/mypage" className="btn btn-ghost btn-sm">
        {labels.myPage}
      </Link>
      {userName && <span className="site-nav-user">{userName}</span>}
      <ClientSignOutButton label={labels.signOut} />
    </>
  );
}

export function useHeaderSessionInfo(
  serverSessionInfo?: { userName: string; isAdmin: boolean } | null,
) {
  const { data: session } = useSession();
  const isSignedIn = isSignedInSession(session);
  if (serverSessionInfo) return serverSessionInfo;
  if (!isSignedIn || !session?.user) return null;
  const isAdmin =
    session.user.siteRole === "ADMIN" || session.user.siteRole === "CERT_REVIEWER";
  return {
    userName: getSessionDisplayName(session.user),
    isAdmin,
  };
}
