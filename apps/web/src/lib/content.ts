import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import type { Locale } from "@os-community/shared";

export type ContentCategory = "docs" | "guides" | "legal";
export type ContentStatus = "draft" | "published" | "archived";

export type ContentEntry = {
  id: string;
  title: string;
  description?: string;
  file: string;
  route: string;
  category: ContentCategory;
  status: ContentStatus;
  order?: number;
};

export type ContentMeta = {
  id: string;
  title: string;
  description?: string;
  category: ContentCategory;
  route: string;
  order?: number;
};

function resolveContentRoot(): string {
  const envRoot = process.env.CONTENT_ROOT;
  if (envRoot && fs.existsSync(envRoot)) return envRoot;

  const candidates = [
    path.join(process.cwd(), "content"),
    path.join(process.cwd(), "../../content"),
    path.join(process.cwd(), "../../../content"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "registry.yaml"))) return dir;
  }
  return candidates[0];
}

const CONTENT_ROOT = resolveContentRoot();
const REGISTRY_PATH = path.join(CONTENT_ROOT, "registry.yaml");

function loadRegistry(): ContentEntry[] {
  if (!fs.existsSync(REGISTRY_PATH)) return [];
  const raw = parseYaml(fs.readFileSync(REGISTRY_PATH, "utf8")) as { entries?: ContentEntry[] };
  return raw.entries ?? [];
}

export function getContentEntries(options?: { publishedOnly?: boolean; category?: ContentCategory }): ContentEntry[] {
  let entries = loadRegistry();
  if (options?.publishedOnly) entries = entries.filter((e) => e.status === "published");
  if (options?.category) entries = entries.filter((e) => e.category === options.category);
  return entries.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

function localizedContentPath(entry: ContentEntry, locale: string): string {
  const dir = path.dirname(entry.file);
  const base = path.basename(entry.file, ".md");
  return path.join(CONTENT_ROOT, dir, "i18n", locale, `${base}.md`);
}

function resolveContentFilePath(entry: ContentEntry, locale?: Locale): string {
  const defaultPath = path.join(CONTENT_ROOT, entry.file);
  if (!locale) return defaultPath;

  const localizedPath = localizedContentPath(entry, locale);
  if (fs.existsSync(localizedPath)) return localizedPath;

  if (locale !== "en") {
    const enPath = localizedContentPath(entry, "en");
    if (fs.existsSync(enPath)) return enPath;
  }

  return defaultPath;
}

export function getContentById(
  id: string,
  locale?: Locale,
): { meta: ContentMeta; content: string; entry: ContentEntry } | null {
  const entry = loadRegistry().find((e) => e.id === id);
  if (!entry) return null;

  const filePath = resolveContentFilePath(entry, locale);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    entry,
    meta: {
      id: entry.id,
      title: (data.title as string) ?? entry.title,
      description: (data.description as string) ?? entry.description,
      category: entry.category,
      route: entry.route,
      order: entry.order,
    },
    content,
  };
}

/** Remove leading `# Title` when PageLayout / hero already shows the title. */
export function stripMarkdownLeadHeading(content: string): string {
  return content.replace(/^\s*#\s+[^\n]+\n+/, "");
}

export function getPublishedContentIds(): string[] {
  return getContentEntries({ publishedOnly: true })
    .filter((e) => e.route.startsWith("/content/"))
    .map((e) => e.id);
}

/** @deprecated use getContentById */
export function getDocBySlug(slug: string) {
  const doc = getContentById(slug);
  if (!doc || doc.entry.status !== "published") return null;
  return {
    meta: { slug: doc.meta.id, title: doc.meta.title, description: doc.meta.description, order: doc.meta.order },
    content: doc.content,
  };
}

/** @deprecated use getContentEntries */
export function getAllDocs() {
  return getContentEntries({ publishedOnly: true, category: "guides" })
    .concat(getContentEntries({ publishedOnly: true, category: "docs" }))
    .map((e) => ({
      slug: e.id,
      title: e.title,
      description: e.description,
      order: e.order,
    }));
}

/** @deprecated */
export function getDocSlugs() {
  return getPublishedContentIds();
}

export function getLegalContentBySlug(slug: string, locale?: Locale) {
  const doc = getContentById(slug, locale);
  if (!doc || doc.entry.category !== "legal" || doc.entry.status !== "published") return null;
  return doc.content;
}

export { CONTENT_ROOT };
