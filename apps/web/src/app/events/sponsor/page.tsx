import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function EventsSponsorPage() {
  return renderSkeletonPage({
    pageKey: "eventsSponsor",
    breadcrumbs: [
      { href: "/", label: "Home" },
      { href: "/events", label: "Events" },
      { href: "/events/sponsor", label: "Sponsor" },
    ],
    relatedLinks: [
      { href: "/about/contact", label: "Contact Us" },
      { href: "/about/memberships", label: "Corporate Members" },
    ],
  });
}
