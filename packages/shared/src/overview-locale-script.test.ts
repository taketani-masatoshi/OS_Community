import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COMMUNITY_LOCALE_COOKIE, OORGOS_UI_LOCALE_COOKIE } from "./locale-bridge";
import {
  OVERVIEW_LOCALE_FILENAME,
  renderOverviewLocaleScript,
} from "./overview-locale-script";

const overviewDir = join(dirname(fileURLToPath(import.meta.url)), "../../../sites/coming-soon");
const read = (file: string) => readFileSync(join(overviewDir, file), "utf8");

type LocaleBridge = {
  uiLocale: (lang: string) => string;
  write: (lang: string) => void;
  detect: (supported: string[]) => string;
};

/** Evaluate the generated browser asset against a minimal DOM stand-in. */
function loadBridge(env: { cookie?: string; storage?: Record<string, string>; language?: string }) {
  const store = new Map(Object.entries(env.storage ?? {}));
  const written: string[] = [];
  const globals = {
    location: { hostname: "oorgos.org", protocol: "https:" },
    navigator: { language: env.language ?? "en-US" },
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    },
    document: {
      _cookie: env.cookie ?? "",
      get cookie() {
        return this._cookie;
      },
      set cookie(value: string) {
        written.push(value);
      },
    },
  };
  const win: Record<string, unknown> = { ...globals };
  new Function(
    "window",
    "document",
    "location",
    "navigator",
    renderOverviewLocaleScript(),
  )(win, globals.document, globals.location, globals.navigator);
  return { bridge: win.OORGOS_LOCALE as LocaleBridge, written, store };
}

describe("overview locale bridge", () => {
  it("keeps the generated overview asset in sync", () => {
    expect(read(OVERVIEW_LOCALE_FILENAME)).toBe(renderOverviewLocaleScript());
  });

  it("shares only ja/en on the parent domain", () => {
    const { bridge, written, store } = loadBridge({});
    bridge.write("zh");
    expect(written).toHaveLength(1);
    expect(written[0]).toContain(`${OORGOS_UI_LOCALE_COOKIE}=en`);
    expect(written[0]).toContain("Domain=.oorgos.org");
    expect(written[0]).toContain("Secure");
    expect(store.get(COMMUNITY_LOCALE_COOKIE)).toBe("zh");
    expect(store.get(OORGOS_UI_LOCALE_COOKIE)).toBe("en");
  });

  it("never writes the page locale cookie across subdomains", () => {
    const { bridge, written } = loadBridge({});
    bridge.write("ja");
    expect(written[0]).toContain(`${OORGOS_UI_LOCALE_COOKIE}=ja`);
    expect(written.join("\n")).not.toContain(`${COMMUNITY_LOCALE_COOKIE}=`);
  });

  it("prefers the page locale over the shared ja/en cookie", () => {
    const { bridge } = loadBridge({
      cookie: `${OORGOS_UI_LOCALE_COOKIE}=en`,
      storage: { [COMMUNITY_LOCALE_COOKIE]: "zh" },
    });
    expect(bridge.detect(["en", "ja", "zh"])).toBe("zh");
  });

  it("carries a Community ja choice into the overview site", () => {
    const { bridge } = loadBridge({ cookie: `${OORGOS_UI_LOCALE_COOKIE}=ja`, language: "en-US" });
    expect(bridge.detect(["en", "ja", "zh"])).toBe("ja");
  });

  it("falls back to the browser language, then en", () => {
    expect(loadBridge({ language: "ja-JP" }).bridge.detect(["en", "ja", "zh"])).toBe("ja");
    expect(loadBridge({ language: "fr-FR" }).bridge.detect(["en", "ja", "zh"])).toBe("en");
  });
});
