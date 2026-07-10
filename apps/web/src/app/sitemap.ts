import type { MetadataRoute } from "next";
import { SITE_PAGES } from "@os-community/shared";
import { getContentEntries } from "@/lib/content";
import { siteBaseUrl } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteBaseUrl();
  const now = new Date();

  const staticPages = SITE_PAGES.filter((p) => p.readiness !== "skeleton").map((p) => ({
    url: `${base}${p.path}`,
    lastModified: now,
    changeFrequency: p.readiness === "live" ? ("weekly" as const) : ("monthly" as const),
    priority: p.path === "/" ? 1 : 0.7,
  }));

  const contentPages = getContentEntries({ publishedOnly: true })
    .filter((e) => e.route.startsWith("/content/"))
    .map((e) => ({
      url: `${base}${e.route}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const legalPages = getContentEntries({ publishedOnly: true, category: "legal" }).map((e) => ({
    url: `${base}${e.route}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...contentPages, ...legalPages];
}
