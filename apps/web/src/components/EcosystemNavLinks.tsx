"use client";

import Link from "next/link";

/** Cross-site Overview + Console links shared by header and mobile nav. */
export function EcosystemNavLinks({
  overviewHref,
  overviewLabel,
  consoleHref,
  consoleLabel,
  onNavigate,
  className,
}: {
  overviewHref: string;
  overviewLabel: string;
  consoleHref: string;
  consoleLabel: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={className ?? "ecosystem-nav"} aria-label="OpenOrgOS">
      <a href={overviewHref} onClick={onNavigate}>
        {overviewLabel}
      </a>
      <Link href={consoleHref} onClick={onNavigate}>
        {consoleLabel}
      </Link>
    </nav>
  );
}
