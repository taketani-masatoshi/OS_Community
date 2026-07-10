import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function ResourcesPublicationsPage() {
  return renderSkeletonPage({
    pageKey: "publications",
    breadcrumbs: [
      { href: "/", label: "Home" },
      { href: "/resources/publications", label: "Publications" },
    ],
    relatedLinks: [
      { href: "/content", label: "Content index" },
      { href: "/standards", label: "Standards" },
    ],
    showEmptyList: true,
  });
}
