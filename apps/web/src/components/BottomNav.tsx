"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIconChip } from "@/components/nav/NavIconChip";
import type { BottomNavItem } from "@/components/nav/bottom-nav-config";

export function BottomNav({ items }: { items: BottomNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Main">
      <div className="bottom-nav-inner">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <NavIconChip icon={item.icon} label={item.label} active={active} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
