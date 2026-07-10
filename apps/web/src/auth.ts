import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { buildAuthProviders } from "@/lib/auth-providers";
import { createJwtCallback } from "@/lib/identity/auth-jwt";
import { createSignInCallback } from "@/lib/identity/auth-sign-in-callback";
import { createAuthEvents } from "@/lib/identity/auth-events";

function createAuthConfig() {
  return {
    ...authConfig,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    providers: buildAuthProviders(),
    callbacks: {
      ...authConfig.callbacks,
      jwt: createJwtCallback(),
      signIn: createSignInCallback(),
    },
    events: createAuthEvents(),
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(createAuthConfig());
