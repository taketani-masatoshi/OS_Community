import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function PartnersPage() {
  return renderSkeletonPage({
    pageKey: "partners",
    breadcrumbs: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/about/partners", label: "Partner Program" },
    ],
    relatedLinks: [
      { href: "/github", label: "GitHub integration" },
      { href: "/modules", label: "Modules" },
      { href: "/wild-modules/register", label: "Host your module" },
    ],
  });
}
