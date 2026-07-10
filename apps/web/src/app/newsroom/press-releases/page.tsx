import { getPageMessages } from "@os-community/shared";
import { renderSkeletonPage } from "@/lib/render-skeleton-page";
import { getT } from "@/lib/i18n";

export default async function PressReleasesPage() {
  const { locale, messages: t } = await getT();
  const pages = getPageMessages(locale);
  const sk = pages.skeleton.pages;

  return renderSkeletonPage({
    pageKey: "pressReleases",
    breadcrumbs: [
      { href: "/", label: t.nav.home },
      { href: "/newsroom", label: sk.newsroom.title },
      { href: "/newsroom/press-releases", label: sk.pressReleases.title },
    ],
    relatedLinks: [
      { href: "/newsroom/media-contacts", label: sk.mediaContacts.title },
      { href: "/about/contact", label: pages.aboutSub.contact.title },
    ],
  });
}
