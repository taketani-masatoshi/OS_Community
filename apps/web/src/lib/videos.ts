import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { Locale, LocalizedStrings } from "@os-community/shared";
import { getLocalized } from "@os-community/shared";

export type VideoAccess = "public" | "members";

export type VideoEntry = {
  id: string;
  order: number;
  access: VideoAccess;
  youtubeId: string;
  title: LocalizedStrings;
  description: LocalizedStrings;
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
    if (fs.existsSync(path.join(dir, "videos.yaml"))) return dir;
  }
  return candidates[0];
}

export function getVideos(): VideoEntry[] {
  const root = resolveContentRoot();
  const filePath = path.join(root, "videos.yaml");
  if (!fs.existsSync(filePath)) return [];
  const raw = parseYaml(fs.readFileSync(filePath, "utf8")) as { videos?: VideoEntry[] };
  return (raw.videos ?? []).sort((a, b) => a.order - b.order);
}

export function getVideoTitle(video: VideoEntry, locale: Locale) {
  return getLocalized(video.title, locale);
}

export function getVideoDescription(video: VideoEntry, locale: Locale) {
  return getLocalized(video.description, locale);
}

export function getMemberVideos(): VideoEntry[] {
  return getVideos().filter((v) => v.access === "members");
}
