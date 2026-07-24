import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { enforceAuthRateLimit } from "@/lib/auth-rate-limit";

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});

/** Paths reachable before profile registration is complete */
function isPublicOrRegisterPath(pathname: string) {
  if (pathname === "/") return true;
  const prefixes = [
    "/login",
    "/register",
    "/settings",
    "/api/auth",
    "/api/user/profile",
    "/api/user/organization",
    "/api/github",
    "/github",
    "/legal",
    "/content",
    "/about",
    "/governance",
    "/standards",
    "/modules",
    "/wild-modules",
    "/learn",
    "/learning",
    "/getting-started",
    "/agents",
    "/committees",
    "/experts",
    "/compliance",
    "/certifications",
    "/users",
    "/members",
    "/mypage",
    "/academy",
    "/docs",
    "/stewardship",
    "/newsroom",
    "/resources",
    "/research",
    "/events",
    "/site-map",
  ];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;
  if (
    pathname.startsWith("/api/auth/callback/") ||
    pathname.startsWith("/api/auth/signin/")
  ) {
    const limited = await enforceAuthRateLimit(req);
    if (limited) return limited;
  }

  // API routes enforce auth/profile in handlers; avoid redirecting POST requests.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!req.auth?.user) return NextResponse.next();
  if (req.auth.user.profileComplete) return NextResponse.next();
  // Admin routes enforce role in layout; avoid redirect loops when JWT profileComplete lags behind DB.
  if (isAdminPath(req.nextUrl.pathname)) return NextResponse.next();
  if (isPublicOrRegisterPath(req.nextUrl.pathname)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/settings/profile";
  url.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(url);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
