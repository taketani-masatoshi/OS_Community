import { cookies, headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import { resolveUsesSecureCookies } from "@/lib/auth-env";

function buildCookieHeader(store: Awaited<ReturnType<typeof cookies>>): string {
  return store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

async function resolveSecureCookie(): Promise<boolean> {
  const headerStore = await headers();
  return resolveUsesSecureCookies(headerStore.get("x-forwarded-proto"));
}

function sessionCookieName(secure: boolean): string {
  const prefix = secure ? "__Secure-" : "";
  return `${prefix}authjs.session-token`;
}

export async function hasAuthSessionCookie(): Promise<boolean> {
  const secure = await resolveSecureCookie();
  const sessionName = sessionCookieName(secure);
  const store = await cookies();
  return store
    .getAll()
    .some((cookie) => cookie.name === sessionName || cookie.name.startsWith(`${sessionName}.`));
}

export async function getAuthSessionUserId(): Promise<string | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const store = await cookies();
  const secureCookie = await resolveSecureCookie();
  const cookieName = sessionCookieName(secureCookie);

  const token = await getToken({
    req: { headers: { cookie: buildCookieHeader(store) } },
    secret,
    secureCookie,
    cookieName,
    salt: cookieName,
  });

  return typeof token?.sub === "string" ? token.sub : null;
}
