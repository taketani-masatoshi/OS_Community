import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  buildConsoleHandoffUrl,
  getConsoleHandoffConfig,
  mintConsoleHandoffIdToken,
  safeConsoleNextPath,
} from "@/lib/console-handoff";

/**
 * GET /ops/console/start?next=/wire/
 * Community session → short-lived OIDC id_token → Operator Console handoff.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeConsoleNextPath(url.searchParams.get("next"));

  const session = await requireAuth(`/ops/console/start?next=${encodeURIComponent(next)}`);
  const userId = session.user.id;

  const cfg = getConsoleHandoffConfig();
  if (!cfg.configured || !cfg.consoleBaseUrl) {
    return NextResponse.redirect(
      new URL("/mypage?console_handoff=misconfigured", url.origin),
    );
  }

  const operatorCert = await prisma.certification.findFirst({
    where: {
      userId,
      type: "STEWARD_OPERATOR",
      status: "APPROVED",
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });
  if (!operatorCert) {
    return NextResponse.redirect(new URL("/mypage?console_handoff=forbidden", url.origin));
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      orgosOperatorId: true,
      accounts: {
        where: { provider: "google" },
        select: { providerAccountId: true },
        take: 1,
      },
    },
  });

  const email = dbUser?.email?.trim() || session.user.primaryEmail?.trim() || "";
  if (!email) {
    return NextResponse.redirect(new URL("/mypage?console_handoff=no_email", url.origin));
  }

  const minted = mintConsoleHandoffIdToken({
    sub: userId,
    email,
    google_sub: dbUser?.accounts[0]?.providerAccountId,
    operator_id: dbUser?.orgosOperatorId ?? undefined,
    name: dbUser?.name ?? session.user.name ?? undefined,
  });
  if (typeof minted !== "string") {
    return NextResponse.redirect(
      new URL("/mypage?console_handoff=misconfigured", url.origin),
    );
  }

  return NextResponse.redirect(buildConsoleHandoffUrl(cfg.consoleBaseUrl, minted, next));
}
