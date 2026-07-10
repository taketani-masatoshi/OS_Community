"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteRole } from "@os-community/db";

type Labels = {
  navDashboard: string;
  navUsers: string;
  navCommittees: string;
  navGovernance: string;
};

export function AdminNav({
  role,
  labels,
}: {
  role: SiteRole;
  labels: Labels;
}) {
  const currentPath = usePathname();
  const isAdmin = role === "ADMIN";
  const links = [
    { href: "/admin", label: labels.navDashboard, show: true },
    { href: "/admin/users", label: labels.navUsers, show: isAdmin },
    { href: "/admin/committees", label: labels.navCommittees, show: isAdmin },
    { href: "/governance", label: labels.navGovernance, show: true },
  ].filter((l) => l.show);

  return (
    <nav className="admin-nav page-wrap" aria-label="Admin" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", paddingTop: "var(--space-4)", paddingBottom: "var(--space-3)" }}>
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? currentPath === "/admin"
            : currentPath === link.href || currentPath.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`btn btn-sm ${active ? "btn-primary" : "btn-ghost"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
