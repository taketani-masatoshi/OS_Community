import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function MembershipsPage() {
  return renderSkeletonPage({
    pageKey: "memberships",
    breadcrumbs: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/about/memberships", label: "Corporate Members" },
    ],
    relatedLinks: [
      { href: "/members", label: "Member directory" },
      { href: "/governance", label: "Governance" },
      { href: "/about/partners", label: "Partner Program" },
    ],
  });
}
