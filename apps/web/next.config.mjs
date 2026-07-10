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
