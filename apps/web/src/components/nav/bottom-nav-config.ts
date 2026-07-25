import type { Messages } from "@os-community/shared";
import type { MonoIconName } from "@/components/icons/MonoIcon";
import { loginStartHref } from "@/lib/login-href";

export type BottomNavItem = {
  href: string;
  label: string;
  icon: MonoIconName;
};

/** Mobile bottom nav — 5 tabs. Public browse vs signed-in member workspace. */
export function getBottomNavItems(t: Messages, signedIn = false): BottomNavItem[] {
  if (signedIn) {
    return [
      { href: "/mypage", label: t.nav.memberHub, icon: "home" },
      { href: "/modules", label: t.nav.modules, icon: "layers" },
      { href: "/committees", label: t.nav.committees, icon: "landmark" },
      { href: "/wild-modules/register", label: t.nav.proposeModuleShort, icon: "box" },
      { href: "/learning", label: t.nav.learning, icon: "book" },
    ];
  }

  return [
    { href: "/", label: t.nav.home, icon: "home" },
    { href: "/getting-started", label: t.nav.gettingStartedShort, icon: "compass" },
    { href: "/modules", label: t.nav.modules, icon: "layers" },
    { href: "/learning", label: t.nav.learning, icon: "book" },
    { href: loginStartHref("/mypage"), label: t.nav.signIn, icon: "log-in" },
  ];
}
