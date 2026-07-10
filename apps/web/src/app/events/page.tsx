import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function EventsPage() {
  return renderSkeletonPage({
    pageKey: "events",
    breadcrumbs: [{ href: "/", label: "Home" }, { href: "/events", label: "Events" }],
    relatedLinks: [
      { href: "/events/sponsor", label: "Sponsor" },
      { href: "/events/submit-talk", label: "Submit a Talk" },
      { href: "/learning", label: "Webinars & Learning" },
    ],
  });
}
