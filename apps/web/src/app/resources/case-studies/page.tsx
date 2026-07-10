import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function ResourcesCaseStudiesPage() {
  return renderSkeletonPage({
    pageKey: "caseStudies",
    breadcrumbs: [
      { href: "/", label: "Home" },
      { href: "/resources/case-studies", label: "Case Studies" },
    ],
    relatedLinks: [
      { href: "/experts", label: "Expert Directory" },
      { href: "/modules", label: "Modules" },
    ],
    showEmptyList: true,
  });
}
