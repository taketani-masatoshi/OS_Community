import fs from "node:fs";
import path from "node:path";
import { encode } from "@auth/core/jwt";
import { PrismaClient } from "@prisma/client";

const AUTH_DIR = path.join(__dirname, ".auth");
const FOUNDER_STATE = path.join(AUTH_DIR, "founder.json");
const SKIP_MARKER = path.join(AUTH_DIR, "skip-signed-in");

const e2ePort = process.env.PLAYWRIGHT_PORT ?? "3001";
const e2eOrigin = `http://127.0.0.1:${e2ePort}`;

export default async function globalSetup() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.rmSync(SKIP_MARKER, { force: true });
  fs.rmSync(FOUNDER_STATE, { force: true });

  const databaseUrl = process.env.DATABASE_URL;
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!databaseUrl || !secret) {
    fs.writeFileSync(SKIP_MARKER, "missing DATABASE_URL or AUTH_SECRET");
    return;
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({
      where: { publicSlug: "taketani-masatoshi" },
      select: {
        id: true,
        siteRole: true,
        githubLogin: true,
        publicSlug: true,
        email: true,
        profileCompletedAt: true,
      },
    });

    if (!user) {
      fs.writeFileSync(SKIP_MARKER, "founder user not seeded");
      fs.writeFileSync(FOUNDER_STATE, JSON.stringify({ cookies: [], origins: [] }, null, 2));
      return;
    }

    const cookieName = "authjs.session-token";
    const token = await encode({
      token: {
        sub: user.id,
        siteRole: user.siteRole,
        githubLogin: user.githubLogin,
        publicSlug: user.publicSlug,
        primaryEmail: user.email,
        profileComplete: Boolean(user.profileCompletedAt),
        emailLoginConnected: false,
        linkedinConnected: false,
        githubAccountLinked: Boolean(user.githubLogin),
        githubReposConnected: false,
        claimsRefreshedAt: Date.now(),
      },
      secret,
      salt: cookieName,
    });

    fs.writeFileSync(
      FOUNDER_STATE,
      JSON.stringify(
        {
          cookies: [
            {
              name: cookieName,
              value: token,
              domain: "127.0.0.1",
              path: "/",
              expires: -1,
              httpOnly: true,
              secure: false,
              sameSite: "Lax",
            },
          ],
          origins: [],
        },
        null,
        2,
      ),
    );
  } catch (error) {
    fs.writeFileSync(
      SKIP_MARKER,
      error instanceof Error ? error.message : "global setup failed",
    );
  } finally {
    await prisma.$disconnect();
  }
}
