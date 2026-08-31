import { readFileSync } from "node:fs";
import { join } from "node:path";

export type ChannelFeed = {
  product?: string;
  channel: string;
  latest: string;
  minSupported?: string;
  releasedAt?: string;
  image?: string;
  releasesUrl?: string;
  docsUrl?: string;
  securityNotice?: string;
  updateMessage?: string;
  breaking?: boolean;
};

export type ReleaseInfo = {
  version: string;
  channel: string;
  image: string;
  releasesUrl: string;
  docsUrl: string;
  securityNotice: string;
  updateAvailable: boolean;
  belowMinSupported: boolean;
  channelLatest: string | null;
  updateMessage: string | null;
  channelFetched: boolean;
};

const DEFAULT_IMAGE = "ghcr.io/taketani-masatoshi/os-community-web";
const DEFAULT_RELEASES =
  "https://github.com/taketani-masatoshi/OS_Community/releases";
const DEFAULT_DOCS =
  "https://github.com/taketani-masatoshi/OS_Community/blob/main/docs/beta-operations.md";
const DEFAULT_SECURITY =
  "Beta software. Run only in an isolated environment you control. Prefer private networks, unique secrets, and TLS. See docs/beta-operations.md.";
const DEFAULT_CHANNEL_URL =
  "https://raw.githubusercontent.com/taketani-masatoshi/OS_Community/main/channel/latest.json";

const CHANNEL_CACHE_TTL_MS = 5 * 60 * 1000;
const CHANNEL_NEGATIVE_TTL_MS = 30 * 1000;

type ChannelCache = { at: number; feed: ChannelFeed | null };
const channelCacheByUrl = new Map<string, ChannelCache>();

/** Test-only: health must not hit GitHub on every probe. */
export function resetChannelFeedCache(): void {
  channelCacheByUrl.clear();
}

function readVersionFile(): string | null {
  try {
    const candidates = [
      join(process.cwd(), "VERSION"),
      join(process.cwd(), "../../VERSION"),
      "/app/VERSION",
    ];
    for (const path of candidates) {
      try {
        const value = readFileSync(path, "utf8").trim();
        if (value) return value;
      } catch {
        /* try next */
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Compare dotted versions; pre-release suffix (-beta.N) is compared numerically when present. */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) => {
    const [core, pre] = v.replace(/^v/, "").split("-");
    const parts = core.split(".").map((n) => Number.parseInt(n, 10) || 0);
    const preMatch = pre?.match(/^(beta|rc|alpha)\.(\d+)$/i);
    const preRank = preMatch ? preMatch[1].toLowerCase() : pre ? "other" : "release";
    const preNum = preMatch ? Number.parseInt(preMatch[2], 10) : pre ? 0 : Number.MAX_SAFE_INTEGER;
    return { parts, preRank, preNum };
  };
  const left = parse(a);
  const right = parse(b);
  const len = Math.max(left.parts.length, right.parts.length);
  for (let i = 0; i < len; i++) {
    const d = (left.parts[i] ?? 0) - (right.parts[i] ?? 0);
    if (d !== 0) return d;
  }
  const rank = { alpha: 1, beta: 2, rc: 3, other: 4, release: 5 } as const;
  const lr = rank[left.preRank as keyof typeof rank] ?? 4;
  const rr = rank[right.preRank as keyof typeof rank] ?? 4;
  if (lr !== rr) return lr - rr;
  return left.preNum - right.preNum;
}

export function getRunningVersion(): string {
  return (
    process.env.APP_VERSION?.trim() ||
    process.env.NEXT_PUBLIC_APP_VERSION?.trim() ||
    readVersionFile() ||
    "0.0.0-dev"
  );
}

export function getRunningChannel(): string {
  return process.env.APP_CHANNEL?.trim() || "beta";
}

async function fetchChannelFeed(url: string): Promise<ChannelFeed | null> {
  const now = Date.now();
  const cached = channelCacheByUrl.get(url);
  const ttl = cached?.feed ? CHANNEL_CACHE_TTL_MS : CHANNEL_NEGATIVE_TTL_MS;
  if (cached && now - cached.at < ttl) {
    return cached.feed;
  }

  let feed: ChannelFeed | null = null;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(1_500),
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as ChannelFeed;
      if (data?.latest && data?.channel) feed = data;
    }
  } catch {
    feed = null;
  }
  channelCacheByUrl.set(url, { at: now, feed });
  return feed;
}

export async function getReleaseInfo(): Promise<ReleaseInfo> {
  const version = getRunningVersion();
  const channel = getRunningChannel();
  const channelUrl =
    process.env.OPENORGOS_CHANNEL_URL?.trim() || DEFAULT_CHANNEL_URL;
  const feed = await fetchChannelFeed(channelUrl);

  const channelLatest = feed?.latest ?? null;
  const updateAvailable = Boolean(
    channelLatest && compareVersions(channelLatest, version) > 0,
  );
  const belowMinSupported = Boolean(
    feed?.minSupported && compareVersions(version, feed.minSupported) < 0,
  );

  return {
    version,
    channel: feed?.channel || channel,
    image: feed?.image || DEFAULT_IMAGE,
    releasesUrl: feed?.releasesUrl || DEFAULT_RELEASES,
    docsUrl: feed?.docsUrl || DEFAULT_DOCS,
    securityNotice: feed?.securityNotice || DEFAULT_SECURITY,
    updateAvailable: updateAvailable || belowMinSupported,
    belowMinSupported,
    channelLatest,
    updateMessage:
      updateAvailable || belowMinSupported
        ? feed?.updateMessage ||
          "A newer beta is available. See releases and pull the updated GHCR image."
        : null,
    channelFetched: Boolean(feed),
  };
}
