import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function ResourcesGuidesPage() {
  return renderSkeletonPage({
    pageKey: "guides",
    breadcrumbs: [
      { href: "/", label: "Home" },
      { href: "/resources/guides", label: "Open Source Guides" },
    ],
    relatedLinks: [
      { href: "/content", label: "Content index" },
      { href: "/learning", label: "Learn" },
      { href: "/modules", label: "Modules" },
    ],
    showEmptyList: true,
  });
}
