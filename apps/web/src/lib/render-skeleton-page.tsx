import {
  getPageMessages,
  type SitePageReadiness,
} from "@os-community/shared";
import { LfSectionPage, type LfBreadcrumb, type LfRelatedLink } from "@/components/LfSectionPage";
import { getLocale } from "@/lib/i18n";

type SkeletonPageKey = keyof ReturnType<typeof getPageMessages>["skeleton"]["pages"];

type RenderSkeletonOptions = {
  pageKey: SkeletonPageKey;
  breadcrumbs: LfBreadcrumb[];
  relatedLinks?: LfRelatedLink[];
  readiness?: SitePageReadiness;
  showEmptyList?: boolean;
  primaryCtaHref?: string;
  secondaryCtaHref?: string;
};

function readinessBadge(
  readiness: SitePageReadiness | undefined,
  labels: { live: string; partial: string; skeleton: string }
) {
  if (readiness === "live") return undefined;
  if (readiness === "partial") return labels.partial;
  return labels.skeleton;
}

export async function renderSkeletonPage({
  pageKey,
  breadcrumbs,
  relatedLinks,
  readiness = "skeleton",
  showEmptyList = false,
  primaryCtaHref = "/about/contact",
  secondaryCtaHref = "/login",
}: RenderSkeletonOptions) {
  const locale = await getLocale();
  const p = getPageMessages(locale);
  const sk = p.skeleton;
  const page = sk.pages[pageKey];
  const sm = p.siteMap;

  return (
    <LfSectionPage
      breadcrumbs={breadcrumbs}
      title={page.title}
      lead={page.lead}
      statusBadge={readinessBadge(readiness, {
        live: sm.readinessLive,
        partial: sm.readinessPartial,
        skeleton: sm.readinessSkeleton,
      })}
      statusNote={readiness !== "live" ? sk.statusNote : undefined}
      plannedTitle={sk.plannedTitle}
      plannedItems={page.planned}
      emptyList={showEmptyList ? sk.emptyList : undefined}
      relatedTitle={sk.relatedTitle}
      relatedLinks={relatedLinks}
      primaryCta={{ href: primaryCtaHref, label: sk.contactCta }}
      secondaryCta={{ href: secondaryCtaHref, label: sk.joinCta }}
    />
  );
}
