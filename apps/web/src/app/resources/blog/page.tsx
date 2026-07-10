import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function ResourcesBlogPage() {
  return renderSkeletonPage({
    pageKey: "blog",
    breadcrumbs: [
      { href: "/", label: "Home" },
      { href: "/resources/blog", label: "Blog" },
    ],
    relatedLinks: [
      { href: "/content", label: "Content index" },
      { href: "/newsroom/press-releases", label: "Press Releases" },
    ],
    showEmptyList: true,
  });
}
