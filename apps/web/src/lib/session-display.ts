import type { Session } from "next-auth";

export function isSignedInSession(session: Session | null | undefined): boolean {
  return Boolean(session?.user?.id);
}

/** Header hydration: trust the server snapshot until the client session arrives. */
export function isHeaderSignedIn(
  session: Session | null | undefined,
  serverSessionInfo?: { userName: string; isAdmin: boolean } | null,
): boolean {
  return Boolean(serverSessionInfo) || isSignedInSession(session);
}

export function getSessionDisplayName(user: Session["user"]): string {
  return (
    user.githubLogin ??
    user.name ??
    user.publicSlug ??
    user.primaryEmail ??
    user.email ??
    user.id
  );
}
