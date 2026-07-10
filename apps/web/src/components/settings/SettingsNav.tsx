"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  items: { href: string; label: string }[];
  title: string;
};

export function SettingsNav({ items, title }: Props) {
  const pathname = usePathname();

  return (
    <aside className="settings-nav">
      <h2 className="settings-nav-title">{title}</h2>
      <nav className="settings-nav-links">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "active" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
