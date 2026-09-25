import { defineConfig, devices } from "@playwright/test";
import path from "path";

function resolveE2ePort(): string {
  if (process.env.PLAYWRIGHT_PORT) return process.env.PLAYWRIGHT_PORT;
  const base = process.env.PLAYWRIGHT_BASE_URL;
  if (base) {
    try {
      const port = new URL(base).port;
      if (port) return port;
    } catch {
      /* fall through */
    }
  }
  return "3001";
}

const e2ePort = resolveE2ePort();
const e2eBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: path.join(__dirname, "e2e/global-setup.ts"),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: e2eBaseUrl,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /login-session\.spec\.ts/,
    },
    {
      name: "chromium-signed-in",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(__dirname, "e2e/.auth/founder.json"),
      },
      testMatch: /login-session\.spec\.ts/,
    },
  ],
  webServer: {
    command: `bash ../../scripts/with-env.sh npm run dev -w @os-community/web -- --port ${e2ePort}`,
    url: e2eBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      AUTH_URL: e2eBaseUrl,
      NEXT_PUBLIC_SITE_URL: e2eBaseUrl,
    },
  },
});
