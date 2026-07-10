import Link from "next/link";
import { BRAND } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import { getAuthSession } from "@/lib/session";
import { getSessionDisplayName } from "@/lib/session-display";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DesktopOverflowNav } from "@/components/DesktopOverflowNav";
import { HeaderSessionBar } from "@/components/HeaderSessionBar";
import { MobileSiteNav } from "@/components/MobileSiteNav";

const primaryNavKeys = [
  { href: "/", key: "home" as const },
  { href: "/getting-started", key: "gettingStarted" as const },
  { href: "/modules", key: "modules" as const },
  { href: "/learning", key: "learning" as const },
  { href: "/committees", key: "committees" as const },
];

export async function Header() {
  const { locale, messages: t } = await getT();
  const session = await getAuthSession();
  const serverSessionInfo =
    session?.user != null
      ? {
          userName: getSessionDisplayName(session.user),
          isAdmin:
            session.user.siteRole === "ADMIN" || session.user.siteRole === "CERT_REVIEWER",
        }
      : null;

  const navItems = primaryNavKeys.map((l) => ({ href: l.href, label: t.nav[l.key] }));

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-header-start">
          <MobileSiteNav
            locale={locale}
            navItems={navItems}
            serverSessionInfo={serverSessionInfo}
            labels={{
              menu: t.nav.menu,
              close: t.nav.close,
              signIn: t.nav.signIn,
              signOut: t.nav.signOut,
              github: t.nav.github,
              myPage: t.nav.myPage,
              admin: t.nav.admin,
              proposeModule: t.mypage.actionProposeModule,
            }}
          />
          <Link href="/" className="site-logo">
            {BRAND.name}
            <span className="site-logo-sub">{t.brand.community}</span>
          </Link>
        </div>

        <div className="site-header-center">
          <DesktopOverflowNav items={navItems} moreLabel={t.nav.more} />
        </div>

        <div className="site-header-actions site-nav-desktop">
          <LanguageSwitcher current={locale} ariaLabel={t.common.languageLabel} />
          <HeaderSessionBar
            serverSessionInfo={serverSessionInfo}
            labels={{
              signIn: t.nav.signIn,
              signOut: t.nav.signOut,
              myPage: t.nav.myPage,
              admin: t.nav.admin,
              proposeModule: t.mypage.actionProposeModule,
            }}
          />
        </div>
      </div>
    </header>
  );
}
