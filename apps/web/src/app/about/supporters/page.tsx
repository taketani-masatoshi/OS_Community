import { renderSkeletonPage } from "@/lib/render-skeleton-page";

export default function SupportersPage() {
  return renderSkeletonPage({
    pageKey: "supporters",
    breadcrumbs: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/about/supporters", label: "Individual Supporters" },
    ],
    relatedLinks: [
      { href: "/about/careers", label: "Careers" },
      { href: "/certifications", label: "Certification" },
      { href: "/login", label: "Sign in" },
    ],
    primaryCtaHref: "/login",
  });
}
