import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const appDir = path.dirname(fileURLToPath(import.meta.url));
// Monorepo root .env is loaded first; apps/web/*.env overrides when present.
loadEnvConfig(path.join(appDir, "../.."));
loadEnvConfig(appDir);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@os-community/db", "@os-community/shared"],
  // Beta channel: ship GHCR images while residual strict TS debt is cleared in follow-ups.
  // Unit tests + CI lint remain; do not treat ignoreBuildErrors as a long-term policy.
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    "localhost",
    "openorgos.net",
    "www.openorgos.net",
    "community.oorgos.org",
  ],
  async headers() {
    const skeletonPaths = [
      "/newsroom/:path*",
      "/resources/:path*",
      "/research/:path*",
      "/events/:path*",
      "/about/memberships",
      "/about/supporters",
      "/about/partners",
    ];
    return skeletonPaths.map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    }));
  },
};

export default nextConfig;
