import Link from "next/link";
import {
  SITE_PAGES,
  SITE_SECTION_ORDER,
  getPageMessages,
  type SitePageReadiness,
} from "@os-community/shared";
import { Badge } from "@/components/ui";
import { getLocale } from "@/lib/i18n";

function readinessVariant(readiness: SitePageReadiness) {
  if (readiness === "live") return "success" as const;
  if (readiness === "partial") return "warning" as const;
  return "default" as const;
}

function readinessLabel(
  readiness: SitePageReadiness,
  sm: ReturnType<typeof getPageMessages>["siteMap"]
) {
  if (readiness === "live") return sm.readinessLive;
  if (readiness === "partial") return sm.readinessPartial;
  return sm.readinessSkeleton;
}

export default async function SiteMapPage() {
  const locale = await getLocale();
  const sm = getPageMessages(locale).siteMap;

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{sm.title}</h1>
          <p className="lf-hero-lead">{sm.lead}</p>
        </div>
      </section>

      <div className="page-wrap">
        {SITE_SECTION_ORDER.map((sectionId) => {
          const pages = SITE_PAGES.filter((p) => p.section === sectionId);
          if (pages.length === 0) return null;

          return (
            <section key={sectionId} style={{ marginBottom: "2rem" }}>
              <h2 className="section-title">{sm.sectionLabels[sectionId]}</h2>
              <ul className="site-map-list">
                {pages.map((page) => (
                  <li key={page.id} className="site-map-item">
                    <Link href={page.path} className="site-map-link">
                      {page.path === "/" ? "Home" : page.path}
                    </Link>
                    <Badge variant={readinessVariant(page.readiness)}>
                      {readinessLabel(page.readiness, sm)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
