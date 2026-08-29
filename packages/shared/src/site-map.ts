/** Public route readiness for site map and press-release prep. */
export type SitePageReadiness = "live" | "partial" | "skeleton";

export type SiteSectionId =
  | "platform"
  | "about"
  | "protocol"
  | "community"
  | "newsroom"
  | "resources"
  | "research"
  | "education"
  | "events"
  | "legal";

export type SitePageEntry = {
  id: string;
  path: string;
  section: SiteSectionId;
  readiness: SitePageReadiness;
  /** Key under pages.json → skeleton.pages */
  skeletonKey?: string;
};

export const SITE_SECTION_ORDER: SiteSectionId[] = [
  "platform",
  "about",
  "protocol",
  "community",
  "newsroom",
  "resources",
  "research",
  "education",
  "events",
  "legal",
];

/** Canonical catalog of public routes (header, footer, and site map). */
export const SITE_PAGES: SitePageEntry[] = [
  { id: "home", path: "/", section: "platform", readiness: "live" },
  { id: "modules", path: "/modules", section: "protocol", readiness: "live" },
  { id: "standards", path: "/standards", section: "protocol", readiness: "live" },
  { id: "governance", path: "/governance", section: "protocol", readiness: "live" },
  { id: "governance-sla", path: "/governance/sla", section: "protocol", readiness: "live" },
  { id: "governance-lifecycle", path: "/governance/lifecycle", section: "protocol", readiness: "live" },
  { id: "trusted-operators", path: "/protocol/trusted-operators", section: "protocol", readiness: "live" },
  { id: "committees", path: "/committees", section: "community", readiness: "live" },
  { id: "experts", path: "/experts", section: "community", readiness: "live" },
  { id: "compliance", path: "/compliance", section: "community", readiness: "live" },
  { id: "github", path: "/github", section: "community", readiness: "live" },
  { id: "learning", path: "/learning", section: "education", readiness: "live" },
  { id: "certifications", path: "/certifications", section: "education", readiness: "live" },
  { id: "about", path: "/about", section: "about", readiness: "live" },
  { id: "leadership", path: "/about/leadership", section: "about", readiness: "live" },
  { id: "brand", path: "/about/brand", section: "about", readiness: "live" },
  { id: "contact", path: "/about/contact", section: "about", readiness: "live" },
  { id: "inclusion", path: "/about/inclusion", section: "about", readiness: "partial", skeletonKey: "inclusion" },
  { id: "careers", path: "/about/careers", section: "about", readiness: "partial", skeletonKey: "careers" },
  {
    id: "memberships",
    path: "/about/memberships",
    section: "about",
    readiness: "skeleton",
    skeletonKey: "memberships",
  },
  {
    id: "supporters",
    path: "/about/supporters",
    section: "about",
    readiness: "skeleton",
    skeletonKey: "supporters",
  },
  {
    id: "partners",
    path: "/about/partners",
    section: "about",
    readiness: "skeleton",
    skeletonKey: "partners",
  },
  { id: "members", path: "/members", section: "community", readiness: "partial" },
  { id: "content", path: "/content", section: "resources", readiness: "partial" },
  { id: "newsroom", path: "/newsroom", section: "newsroom", readiness: "skeleton", skeletonKey: "newsroom" },
  {
    id: "press-releases",
    path: "/newsroom/press-releases",
    section: "newsroom",
    readiness: "skeleton",
    skeletonKey: "pressReleases",
  },
  {
    id: "media-contacts",
    path: "/newsroom/media-contacts",
    section: "newsroom",
    readiness: "skeleton",
    skeletonKey: "mediaContacts",
  },
  { id: "blog", path: "/resources/blog", section: "resources", readiness: "skeleton", skeletonKey: "blog" },
  {
    id: "publications",
    path: "/resources/publications",
    section: "resources",
    readiness: "skeleton",
    skeletonKey: "publications",
  },
  { id: "guides", path: "/resources/guides", section: "resources", readiness: "skeleton", skeletonKey: "guides" },
  {
    id: "case-studies",
    path: "/resources/case-studies",
    section: "resources",
    readiness: "skeleton",
    skeletonKey: "caseStudies",
  },
  { id: "research", path: "/research", section: "research", readiness: "skeleton", skeletonKey: "research" },
  { id: "events", path: "/events", section: "events", readiness: "skeleton", skeletonKey: "events" },
  { id: "events-sponsor", path: "/events/sponsor", section: "events", readiness: "skeleton", skeletonKey: "eventsSponsor" },
  {
    id: "events-submit-talk",
    path: "/events/submit-talk",
    section: "events",
    readiness: "skeleton",
    skeletonKey: "eventsSubmitTalk",
  },
  { id: "terms", path: "/legal/terms", section: "legal", readiness: "live" },
  { id: "privacy", path: "/legal/privacy", section: "legal", readiness: "live" },
  { id: "disclaimer", path: "/legal/disclaimer", section: "legal", readiness: "live" },
  { id: "trademark", path: "/legal/trademark-usage", section: "legal", readiness: "live" },
  { id: "site-map", path: "/site-map", section: "platform", readiness: "live" },
];

export function getSitePageByPath(path: string): SitePageEntry | undefined {
  return SITE_PAGES.find((p) => p.path === path);
}

export function getSitePagesBySection(section: SiteSectionId): SitePageEntry[] {
  return SITE_PAGES.filter((p) => p.section === section);
}

export function isSkeletonSitePath(path: string): boolean {
  const page = getSitePageByPath(path);
  return page?.readiness === "skeleton";
}

/** Footer / press-release skeleton routes that were previously mislinked. */
export const SKELETON_PAGE_IDS = SITE_PAGES.filter((p) => p.readiness === "skeleton").map(
  (p) => p.skeletonKey!
);
