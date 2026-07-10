import { getPageMessages } from "@os-community/shared";
import { renderSkeletonPage } from "@/lib/render-skeleton-page";
import { getT } from "@/lib/i18n";

export default async function MediaContactsPage() {
  const { locale, messages: t } = await getT();
  const pages = getPageMessages(locale);
  const sk = pages.skeleton.pages;

  return renderSkeletonPage({
    pageKey: "mediaContacts",
    breadcrumbs: [
      { href: "/", label: t.nav.home },
      { href: "/newsroom", label: sk.newsroom.title },
      { href: "/newsroom/media-contacts", label: sk.mediaContacts.title },
    ],
    relatedLinks: [
      { href: "/about/brand", label: pages.aboutSub.brand.title },
      { href: "/about/leadership", label: pages.leadership.title },
      { href: "/newsroom/press-releases", label: sk.pressReleases.title },
    ],
  });
}
