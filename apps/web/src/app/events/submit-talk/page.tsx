import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function EventsSubmitTalkPage() {
  return renderSkeletonPage({
    pageKey: "eventsSubmitTalk",
    breadcrumbs: [
      { href: "/", label: "Home" },
      { href: "/events", label: "Events" },
      { href: "/events/submit-talk", label: "Submit a Talk" },
    ],
    relatedLinks: [
      { href: "/login", label: "Sign in" },
      { href: "/committees", label: "Committees" },
    ],
    primaryCtaHref: "/login",
  });
}
