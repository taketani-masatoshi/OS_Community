import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function ResearchPage() {
  return renderSkeletonPage({
    pageKey: "research",
    breadcrumbs: [{ href: "/", label: "Home" }, { href: "/research", label: "Research" }],
    relatedLinks: [
      { href: "/committees", label: "Committees" },
      { href: "/about/leadership", label: "Leadership" },
      { href: "/about/contact", label: "Sponsor a Study" },
    ],
    showEmptyList: true,
  });
}
