import type { Session } from "next-auth";

export function isSignedInSession(session: Session | null | undefined): boolean {
  return Boolean(session?.user?.id);
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
