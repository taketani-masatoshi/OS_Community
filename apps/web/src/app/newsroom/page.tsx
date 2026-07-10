import { getPageMessages } from "@os-community/shared";
import { renderSkeletonPage } from "@/lib/render-skeleton-page";
import { getT } from "@/lib/i18n";

export default async function NewsroomPage() {
  const { locale, messages: t } = await getT();
  const pages = getPageMessages(locale);
  const sk = pages.skeleton.pages;

  return renderSkeletonPage({
    pageKey: "newsroom",
    breadcrumbs: [
      { href: "/", label: t.nav.home },
      { href: "/newsroom", label: sk.newsroom.title },
    ],
    relatedLinks: [
      { href: "/newsroom/press-releases", label: sk.pressReleases.title },
      { href: "/newsroom/media-contacts", label: sk.mediaContacts.title },
      { href: "/about/brand", label: pages.aboutSub.brand.title },
    ],
  });
}
