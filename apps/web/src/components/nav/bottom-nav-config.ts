import type { Messages } from "@os-community/shared";
import type { MonoIconName } from "@/components/icons/MonoIcon";

export type BottomNavItem = {
  href: string;
  label: string;
  icon: MonoIconName;
};

/** Single source of truth for mobile bottom nav (5 tabs). */
export function getBottomNavItems(t: Messages): BottomNavItem[] {
  return [
    { href: "/", label: t.nav.home, icon: "home" },
    { href: "/getting-started", label: t.nav.gettingStartedShort, icon: "compass" },
    { href: "/modules", label: t.nav.modules, icon: "layers" },
    { href: "/learning", label: t.nav.learning, icon: "book" },
    { href: "/mypage", label: t.nav.myPage, icon: "user" },
  ];
}
