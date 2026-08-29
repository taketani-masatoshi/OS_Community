"use client";

import { useSession } from "next-auth/react";
import { SiteNav } from "@/components/SiteNav";
import { ClientSignOutButton } from "@/components/ClientSignOutButton";
import { useHeaderSessionInfo } from "@/components/HeaderSessionBar";
import type { Locale } from "@os-community/shared";

type Props = {
  locale: Locale;
  navItems: { href: string; label: string }[];
  overviewHref: string;
  consoleHref: string;
  serverSessionInfo?: { userName: string; isAdmin: boolean } | null;
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
};

export function MobileSiteNav({
  locale,
  navItems,
  overviewHref,
  consoleHref,
  serverSessionInfo,
  labels,
}: Props) {
  const sessionInfo = useHeaderSessionInfo(serverSessionInfo);

  return (
    <SiteNav
      locale={locale}
      navItems={navItems}
      overviewHref={overviewHref}
      consoleHref={consoleHref}
      labels={labels}
      session={sessionInfo}
      signOutButton={<ClientSignOutButton label={labels.signOut} />}
    />
  );
}
