import type { NextAuthConfig } from "next-auth";
import type { SiteRole } from "@os-community/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      siteRole: SiteRole;
      githubLogin?: string | null;
      publicSlug?: string | null;
      primaryEmail?: string | null;
      profileComplete?: boolean;
      emailLoginConnected?: boolean;
      linkedinConnected?: boolean;
      githubAccountLinked?: boolean;
      githubReposConnected?: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    siteRole?: SiteRole;
    githubLogin?: string | null;
    publicSlug?: string | null;
    primaryEmail?: string | null;
    profileComplete?: boolean;
    emailLoginConnected?: boolean;
    linkedinConnected?: boolean;
    githubAccountLinked?: boolean;
    githubReposConnected?: boolean;
    claimsRefreshedAt?: number;
  }
}

export const authConfig = {
  providers: [],
  debug: process.env.AUTH_DEBUG === "1",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.siteRole = (token.siteRole as SiteRole) ?? "MEMBER";
        session.user.githubLogin = (token.githubLogin as string | null) ?? null;
        session.user.publicSlug = (token.publicSlug as string | null) ?? null;
        session.user.primaryEmail = (token.primaryEmail as string | null) ?? null;
        session.user.profileComplete = Boolean(token.profileComplete);
        session.user.emailLoginConnected = Boolean(token.emailLoginConnected);
        session.user.linkedinConnected = Boolean(token.linkedinConnected);
        session.user.githubAccountLinked = Boolean(token.githubAccountLinked);
        session.user.githubReposConnected = Boolean(token.githubReposConnected);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
