import { notFound } from "next/navigation";
import { getModuleBySlug, getLatestGitHubTag } from "@/lib/modules";
import {
  READINESS_TO_LIFECYCLE,
  MODULE_LIFECYCLE,
  moduleCommitteeSlug,
  getFormMessages,
  getLocalized,
  getPageMessages,
} from "@os-community/shared";
import { ModuleDetailView } from "@/components/ModuleDetailView";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n";
import {
  getModulePromotionRequest,
  isModuleMaintainer,
  isWildModuleAuthor,
} from "@/lib/module-promotion";

export default async function ModuleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ registered?: string; joined?: string }>;
}) {
  const { slug } = await params;
  const { registered, joined } = await searchParams;
  const mod = await getModuleBySlug(slug);
  if (!mod) notFound();

  const session = await auth();
  const { locale } = await getT();
  const p = getPageMessages(locale);
  const d = p.moduleDetail;
  const ui = p.ui;
  const forms = getFormMessages(locale);
  const latestTag = mod.githubRepo ? await getLatestGitHubTag(mod.githubRepo) : null;
  const lifecycle = READINESS_TO_LIFECYCLE[mod.readinessTier ?? "skeleton"] ?? "COMMUNITY";
  const lifecycleMeta = MODULE_LIFECYCLE.find((s) => s.stage === lifecycle);
  const lifecycleLabel = lifecycleMeta ? getLocalized(lifecycleMeta.name, locale) : lifecycle;

  const rolesByType = {
    MAINTAINER: mod.roles
      .filter((r) => r.role === "MAINTAINER")
      .map((r) => r.user.githubLogin ?? r.user.name ?? "—"),
    DEPUTY: mod.roles
      .filter((r) => r.role === "DEPUTY")
      .map((r) => r.user.githubLogin ?? r.user.name ?? "—"),
    CONTRIBUTOR: mod.roles
      .filter((r) => r.role === "CONTRIBUTOR")
      .map((r) => r.user.githubLogin ?? r.user.name ?? "—"),
  };

  const userPendingRequest = session?.user
    ? mod.roleRequests.find((r) => r.user.id === session.user.id)
    : undefined;

  const promotion = getModulePromotionRequest(mod.metadata);
  const isWild = mod.trustLevel === "WILD";
  let canRequestPromotion = false;
  if (session?.user && isWild) {
    canRequestPromotion =
      (await isWildModuleAuthor(session.user.id, slug)) ||
      (await isModuleMaintainer(session.user.id, mod.id));
  }

  const showApplySection = !session?.user || !userPendingRequest;
  const applyMaintainerHidden = isWild;
  const committeeHref = `/committees/${moduleCommitteeSlug(mod.slug)}`;

  return (
    <ModuleDetailView
      mod={{
        id: mod.id,
        slug: mod.slug,
        name: mod.name,
        githubRepo: mod.githubRepo,
      }}
      locale={locale}
      description={mod.description?.trim() ?? ""}
      labels={{
        ...d,
        uiRole: ui.role,
        uiMembers: ui.members,
        uiNone: ui.none,
        moduleRoles: forms.moduleRole.roles,
      }}
      forms={forms}
      lifecycle={lifecycle}
      lifecycleLabel={lifecycleLabel}
      isWild={isWild}
      latestTag={latestTag}
      committeeHref={committeeHref}
      rolesByType={rolesByType}
      sessionUser={session?.user ?? null}
      userPendingRequest={!!userPendingRequest}
      promotion={promotion}
      canRequestPromotion={canRequestPromotion}
      showApplySection={showApplySection}
      applyMaintainerHidden={applyMaintainerHidden}
      registeredNotice={registered === "1" ? d.registeredNotice : joined === "1" ? forms.moduleRole.memberJoined : undefined}
      registeredNextSteps={registered === "1" ? d.registeredNextSteps : undefined}
    />
  );
}
