import type { Metadata } from "next";
import { BRAND } from "@os-community/shared";
import { getAuthBaseUrl } from "@/lib/auth-env";

export function siteBaseUrl(): string {
  return getAuthBaseUrl().replace(/\/$/, "");
}

export function contentPageMetadata(title: string, description?: string): Metadata {
  return {
    title: `${title} — ${BRAND.name} ${BRAND.community}`,
    ...(description ? { description } : {}),
    alternates: { canonical: siteBaseUrl() },
  };
}

export function skeletonPageMetadata(title: string): Metadata {
  return {
    title: `${title} — ${BRAND.name} ${BRAND.community}`,
    robots: { index: false, follow: true },
  };
}
