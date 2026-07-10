"use client";

import { useSession } from "next-auth/react";
import { SiteNav } from "@/components/SiteNav";
import { ClientSignOutButton } from "@/components/ClientSignOutButton";
import { useHeaderSessionInfo } from "@/components/HeaderSessionBar";
import type { Locale } from "@os-community/shared";

type Props = {
  locale: Locale;
  navItems: { href: string; label: string }[];
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
  };
};

export function MobileSiteNav({ locale, navItems, serverSessionInfo, labels }: Props) {
  const sessionInfo = useHeaderSessionInfo(serverSessionInfo);

  return (
    <SiteNav
      locale={locale}
      navItems={navItems}
      labels={labels}
      session={sessionInfo}
      signOutButton={<ClientSignOutButton label={labels.signOut} />}
    />
  );
}
