import Link from "next/link";
import { BRAND, getFooterAboutLinks, getPageMessages, isSkeletonSitePath } from "@os-community/shared";
import { getT } from "@/lib/i18n";
import { getAuthSession } from "@/lib/session";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FooterSocialLinks } from "@/components/FooterSocialLinks";
import { loginStartHref } from "@/lib/login-href";

function FooterLinkItem({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return <Link href={href}>{label}</Link>;
}

export async function Footer() {
  const { locale, messages: t } = await getT();
  const session = await getAuthSession();
  const signedIn = Boolean(session?.user);
  const pages = getPageMessages(locale);
  const aboutLinks = getFooterAboutLinks(locale)
    .filter((link) => !isSkeletonSitePath(link.href))
    .slice(0, 4);

  const homeHref = signedIn ? "/mypage" : "/";

  const participateLinks = signedIn
    ? [
        { href: "/mypage", label: t.nav.memberHub },
        { href: "/committees", label: t.nav.committees },
        { href: "/modules", label: t.nav.modules },
        { href: "/wild-modules/register", label: t.nav.proposeModuleShort },
      ]
    : [
        { href: "/getting-started", label: t.nav.gettingStarted },
        { href: "/modules", label: t.nav.modules },
        { href: "/committees", label: t.nav.committees },
        { href: loginStartHref("/mypage"), label: t.nav.signIn },
      ];

  const resourceLinks = [
    { href: "/learning", label: t.nav.learning },
    { href: "/standards", label: t.nav.standards },
    { href: "/governance", label: t.nav.governance },
    { href: "/certifications", label: t.nav.certification },
  ];

  const exploreLinks = (
    signedIn
      ? [
          { href: "/settings/appearance", label: t.settings.appearance },
          { href: "/settings/organization", label: t.settings.organization },
          { href: "/settings/profile", label: t.nav.myPage },
          { href: "/about", label: t.nav.about },
          { href: "/github", label: t.footer.developerLink },
        ]
      : [
          { href: "/settings/appearance", label: t.settings.appearance },
          { href: "/about", label: t.nav.about },
          { href: "/agents", label: t.nav.agents },
          { href: "/experts", label: t.nav.experts },
          { href: "/compliance", label: pages.compliance.title },
          { href: "/github", label: t.footer.developerLink },
        ]
  ).filter((link) => !isSkeletonSitePath(link.href));

  return (
    <footer className="site-footer site-footer-slim">
      <div className="site-footer-inner">
        <div className="site-footer-layout site-footer-slim-layout">
          <aside className="site-footer-aside">
            <Link href={homeHref} className="site-footer-logo">
              {BRAND.name}
            </Link>
            <p className="site-footer-about-desc">{t.brand.tagline}</p>
            <nav className="site-footer-about-nav" aria-label={t.footer.aboutHeading}>
              <ul>
                {aboutLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </nav>
            <FooterSocialLinks followLabel={t.footer.followUs} />
            <div className="site-footer-lang">
              <LanguageSwitcher current={locale} ariaLabel={t.common.languageLabel} />
            </div>
          </aside>

          <div className="site-footer-slim-cols">
            <div className="site-footer-col">
              <h4>{t.footer.slimParticipateTitle}</h4>
              <ul>
                {participateLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-footer-col">
              <h4>{t.footer.slimResourcesTitle}</h4>
              <ul>
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-footer-col">
              <h4>{t.footer.slimExploreTitle}</h4>
              <ul>
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="site-footer-legal-row">
          <Link href="/legal/terms">{t.footer.policies}</Link>
          <Link href="/legal/privacy">{t.footer.privacy}</Link>
          <Link href="/legal/trademark-usage">{t.footer.trademark}</Link>
          <Link href="/legal/disclaimer">{t.footer.disclaimer}</Link>
        </div>

        <div className="site-footer-bottom">
          © {new Date().getFullYear()} {BRAND.name} {t.brand.community}. {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
