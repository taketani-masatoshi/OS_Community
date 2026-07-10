import { revalidatePath } from "next/cache";
import { Prisma } from "@os-community/db";
import { requireProfileCompleteApi } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { apiErrorResponse } from "@/lib/api-error";
import {
  ensureModuleCommittee,
  syncCommitteeMembershipForModuleRole,
  syncModuleDomainAssignments,
} from "@/lib/committees";
import { githubRepoExists, parseGithubRepoUrl } from "@/lib/github-repo-url";
import { readJsonBody } from "@/lib/api-body";
import { enforceWriteRateLimit } from "@/lib/auth-rate-limit";
import { ModuleType, TrustLevel } from "@os-community/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authResult = await requireProfileCompleteApi();
  if ("error" in authResult) return authResult.error;
  const session = authResult.session;

  const limited = await enforceWriteRateLimit(req, session.user.id);
  if (limited) return limited;

  const bodyResult = await readJsonBody<{
    slug?: string;
    name?: string;
    repoUrl?: string;
    manifestUrl?: string;
    authorName?: string;
    description?: string;
    agreed?: boolean;
  }>(req);
  if (bodyResult instanceof Response) return bodyResult;
  const body = bodyResult;

  if (!body.agreed) {
    return apiErrorResponse("DISCLAIMER_REQUIRED", 400);
  }

  const slug = body.slug?.trim() ?? "";
  const name = body.name?.trim() ?? "";
  const authorName = body.authorName?.trim() ?? "";

  if (!slug || !name || !authorName) {
    return apiErrorResponse("MISSING_REQUIRED_FIELDS", 400);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    return apiErrorResponse("INVALID_SLUG", 400);
  }

  const parsed = parseGithubRepoUrl(body.repoUrl ?? "");
  if (!parsed) {
    return apiErrorResponse("INVALID_REPO_URL", 400);
  }

  let exists = false;
  try {
    exists = await githubRepoExists(parsed.owner, parsed.name);
  } catch {
    return apiErrorResponse("GITHUB_UNAVAILABLE", 503);
  }
  if (!exists) {
    return apiErrorResponse("REPO_NOT_FOUND", 404);
  }

  const existing = await prisma.module.findUnique({
    where: { slug },
    select: { trustLevel: true },
  });
  if (existing && existing.trustLevel !== "WILD") {
    return apiErrorResponse("SLUG_CONFLICT", 409);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.wildModuleRegistration.create({
        data: {
          userId: session.user.id,
          slug,
          name,
          repoUrl: parsed.repoUrl,
          manifestUrl: body.manifestUrl?.trim() || null,
          authorName,
          description: body.description?.trim() || null,
          disclaimerAcceptedAt: new Date(),
        },
      });

      const mod = await tx.module.upsert({
        where: { slug },
        create: {
          slug,
          name,
          moduleType: ModuleType.WILD,
          trustLevel: TrustLevel.WILD,
          readinessTier: "unsupported",
          githubRepo: parsed.repoUrl,
          manifestPath: body.manifestUrl?.trim() || null,
          metadata: { authorName, description: body.description?.trim() || null },
        },
        update: {
          name,
          githubRepo: parsed.repoUrl,
          trustLevel: TrustLevel.WILD,
          readinessTier: "unsupported",
        },
      });

      await ensureModuleCommittee(mod.id, mod.name, mod.slug, tx);
      await tx.moduleRole.upsert({
        where: {
          moduleId_userId_role: {
            moduleId: mod.id,
            userId: session.user.id,
            role: "MAINTAINER",
          },
        },
        create: {
          moduleId: mod.id,
          userId: session.user.id,
          role: "MAINTAINER",
        },
        update: {},
      });
      await syncCommitteeMembershipForModuleRole(session.user.id, mod.id, "MAINTAINER", tx);
    });

    await syncModuleDomainAssignments();
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return apiErrorResponse("DUPLICATE", 409);
    }
    return apiErrorResponse("REGISTRATION_SAVE_FAILED", 500);
  }

  revalidatePath("/");
  revalidatePath("/mypage");
  revalidatePath("/modules");
  revalidatePath("/wild-modules");

  return Response.json({ ok: true, slug });
}
