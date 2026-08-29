"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@os-community/shared";
import { LanguageSelect } from "@/components/LanguageSelect";
import { EcosystemNavLinks } from "@/components/EcosystemNavLinks";

export type NavItem = { href: string; label: string };

type SiteNavProps = {
  locale: Locale;
  navItems: NavItem[];
  overviewHref: string;
  consoleHref: string;
  labels: {
    menu: string;
    close: string;
    signIn: string;
    signOut: string;
    github: string;
    myPage?: string;
    admin?: string;
    proposeModule?: string;
    overview: string;
    console: string;
  };
  session: {
    userName: string;
    isAdmin: boolean;
  } | null;
  signOutButton: ReactNode;
};

export function SiteNav({
  locale,
  navItems,
  overviewHref,
  consoleHref,
  labels,
  session,
  signOutButton,
}: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="site-nav-panel"
        aria-label={open ? labels.close : labels.menu}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`menu-toggle-bar ${open ? "open" : ""}`} />
        <span className={`menu-toggle-bar ${open ? "open" : ""}`} />
        <span className={`menu-toggle-bar ${open ? "open" : ""}`} />
      </button>

      <div id="site-nav-panel" className={`site-nav-panel ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="site-nav-panel-inner">
          <nav className="site-nav-links">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            {session?.isAdmin && labels.admin && (
              <Link href="/admin" onClick={() => setOpen(false)}>
                {labels.admin}
              </Link>
            )}
          </nav>

          <EcosystemNavLinks
            overviewHref={overviewHref}
            overviewLabel={labels.overview}
            consoleHref={consoleHref}
            consoleLabel={labels.console}
            onNavigate={() => setOpen(false)}
            className="ecosystem-nav ecosystem-nav-drawer"
          />

          <div className="site-nav-actions">
            <label className="lang-select-wrap">
              <LanguageSelect
                current={locale}
                className="lang-select"
                onChange={() => setOpen(false)}
              />
            </label>

            {session ? (
              <>
                {labels.proposeModule && (
                  <Link
                    href="/wild-modules/register"
                    className="btn btn-primary btn-sm"
                    onClick={() => setOpen(false)}
                  >
                    {labels.proposeModule}
                  </Link>
                )}
                <Link href="/mypage" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                  {labels.myPage ?? "My Page"}
                </Link>
                <span className="site-nav-user">{session.userName}</span>
                <Link href="/github" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                  {labels.github}
                </Link>
                {signOutButton}
              </>
            ) : (
              <Link
                href="/login?callbackUrl=/mypage"
                className="btn btn-primary btn-sm"
                onClick={() => setOpen(false)}
              >
                {labels.signIn}
              </Link>
            )}
          </div>
        </div>
      </div>

      {open && (
        <button
          type="button"
          className="site-nav-backdrop"
          aria-label={labels.close}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
