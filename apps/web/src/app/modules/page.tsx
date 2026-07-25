import Link from "next/link";
import { getModules } from "@/lib/modules";
import {
  READINESS_TO_LIFECYCLE,
  MODULE_LIFECYCLE,
  getLabelMessages,
  getLocalized,
  getPageMessages,
} from "@os-community/shared";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n";
import { ModulesRegistryList, type ModuleRegistryItem } from "@/components/ModulesRegistryList";
import { ModuleRecommendedSection } from "@/components/ModuleRecommendedSection";
import { RECOMMENDED_MODULE_SLUGS, formatMaintainerDisplay } from "@/lib/module-display";

export default async function ModulesPage() {
  const modules = await getModules();
  const session = await auth();
  const { locale, messages: t } = await getT();
  const m = t.modulesPage;
  const p = getPageMessages(locale);
  const labels = getLabelMessages(locale);

  const registryItems: ModuleRegistryItem[] = modules.map((mod) => {
    const stewards = mod.roles
      .filter((r) => r.role === "MAINTAINER")
      .map((r) => r.user.githubLogin ?? r.user.name ?? "—");
    const lifecycle = READINESS_TO_LIFECYCLE[mod.readinessTier ?? "skeleton"] ?? "COMMUNITY";
    const lifecycleMeta = MODULE_LIFECYCLE.find((s) => s.stage === lifecycle);
    const lifecycleLabel = lifecycleMeta ? getLocalized(lifecycleMeta.name, locale) : lifecycle;
    const moduleType =
      mod.moduleType === "WILD" || mod.trustLevel === "WILD" ? ("WILD" as const) : mod.moduleType;
    const maintainerDisplay = formatMaintainerDisplay(stewards, m.communityMaintainerLabel);

    return {
      slug: mod.slug,
      name: mod.name,
      description: mod.description?.trim() || "",
      moduleType,
      lifecycleLabel,
      isWild: mod.trustLevel === "WILD",
      maintainerWanted: stewards.length === 0 && moduleType !== "WILD",
      stewards,
      maintainerDisplay,
    };
  });

  const recommended = RECOMMENDED_MODULE_SLUGS.map((slug) =>
    registryItems.find((item) => item.slug === slug)
  ).filter((item): item is ModuleRegistryItem => !!item);

  return (
    <>
      <section className="lf-hero lf-hero-compact lf-hero-decorated">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{m.title}</h1>
          <p className="lf-hero-lead">{m.lead}</p>
          <div className="lf-hero-actions">
            {session?.user ? (
              <>
                <Link href="/wild-modules/register" className="btn btn-primary btn-sm">
                  {m.proposeCta}
                </Link>
                <Link href="#registry" className="btn btn-ghost btn-sm">
                  {m.ctaApplyMaintainer}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login/start?callbackUrl=/wild-modules/register" className="btn btn-primary btn-sm">
                  {m.proposeCta}
                </Link>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  {m.ctaJoin}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="page-wrap" id="registry">
        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 className="section-title">{m.ecosystemTitle}</h2>
          <p className="page-desc">{m.ecosystemLead}</p>
          <p className="section-cta">
            <Link href="/content/module-ecosystem" className="btn btn-primary btn-sm">
              {m.ecosystemCta}
            </Link>
          </p>
        </section>

        <ModuleRecommendedSection
          modules={recommended}
          title={m.recommendedTitle}
          subtitle={m.recommendedSub}
        />

        <ModulesRegistryList
          modules={registryItems}
          typeLabels={{
            BUSINESS: labels.moduleType.BUSINESS,
            JURISDICTION: labels.moduleType.JURISDICTION,
            WILD: labels.moduleType.WILD,
          }}
          labels={{
            searchPlaceholder: m.searchPlaceholder,
            searchEmpty: m.searchEmpty,
            filterAll: m.filterAll,
            badgeUnreviewed: m.badgeUnreviewed,
            badgeMaintainerWanted: m.badgeMaintainerWanted,
            resultCount: m.resultCount,
            maintainerLabel: m.maintainerLabel,
          }}
        />

        <section style={{ marginTop: "2rem" }}>
          <p className="page-desc">{m.proposeLead}</p>
          <p className="section-cta">
            <Link
              href={session?.user ? "/wild-modules/register" : "/login/start?callbackUrl=/wild-modules/register"}
              className="btn btn-primary btn-sm"
            >
              {m.proposeLink}
            </Link>
            <Link href="/wild-modules" className="btn btn-primary btn-sm">
              {p.wildModules.title}
            </Link>
            <Link href="/github" className="btn btn-primary btn-sm">
              {m.githubCta}
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
