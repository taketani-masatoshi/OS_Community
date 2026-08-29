const copy = {
  en: {
    pageTitle: "Try OrgOS — OpenOrgOS",
    metaDescription: "Run the OrgOS demo on an Apple silicon Mac with Docker Desktop.",
    navOverview: "Overview",
    navDemo: "Demo",
    navConsole: "Console",
    navCommunity: "Community",
    langLabel: "Language",
    kicker: "Demo",
    title: "Try OrgOS on your Mac",
    lead: "Apple silicon Mac (M1–M4) only.",
    step1Title: "1. Install Docker",
    step1Lead:
      'Download from the <a href="https://docs.docker.com/desktop/setup/install/mac-install/">official Docker site</a> (Apple silicon).',
    step1a: "Download Docker Desktop.",
    step1b: "Drag it to Applications.",
    step1c: "Open Docker and wait until it starts.",
    step1Safe:
      "The demo stays inside Docker. It does not change your other Mac folders.",
    step2Title: "2. Run",
    step2Lead: 'Open <strong>Terminal</strong>, paste these two lines, press Return.',
    step2Note: "First run may take a few minutes. This Mac only (127.0.0.1).",
    step3Title: "3. Open in your browser",
    step3Note: "Stop: <kbd>Control</kbd>+<kbd>C</kbd> in Terminal.",
    ctaHome: "Back",
    footerCopy: "© OpenOrgOS Community",
  },
  ja: {
    pageTitle: "OrgOS を試す — OpenOrgOS",
    metaDescription: "Apple silicon Mac と Docker Desktop で OrgOS デモを起動します。",
    navOverview: "概要",
    navDemo: "デモ",
    navConsole: "コンソール",
    navCommunity: "Community",
    langLabel: "言語",
    kicker: "デモ",
    title: "Mac で OrgOS を試す",
    lead: "対象は Apple silicon Mac（M1–M4）のみです。",
    step1Title: "1. Docker を入れる",
    step1Lead:
      '<a href="https://docs.docker.com/desktop/setup/install/mac-install/">公式サイト</a>からダウンロードしてください（Apple silicon）。',
    step1a: "Docker Desktop をダウンロードする。",
    step1b: "アプリケーションへドラッグする。",
    step1c: "Docker を開いて起動を待つ。",
    step1Safe:
      "デモは Docker の中だけで動きます。ほかのフォルダはいじりません。",
    step2Title: "2. 動かす",
    step2Lead: "<strong>ターミナル</strong>を開き、下の2行を貼り付けて Return。",
    step2Note: "初回は数分かかることがあります。この Mac だけで開きます（127.0.0.1）。",
    step3Title: "3. ブラウザで開く",
    step3Note: "止める: ターミナルで <kbd>Control</kbd>+<kbd>C</kbd>。",
    ctaHome: "戻る",
    footerCopy: "© OpenOrgOS Community",
  },
  zh: {
    pageTitle: "试用 OrgOS — OpenOrgOS",
    metaDescription: "在 Apple silicon Mac 上用 Docker Desktop 运行 OrgOS 演示。",
    navOverview: "概览",
    navDemo: "演示",
    navConsole: "控制台",
    navCommunity: "Community",
    langLabel: "语言",
    kicker: "演示",
    title: "在 Mac 上试用 OrgOS",
    lead: "仅支持 Apple silicon Mac（M1–M4）。",
    step1Title: "1. 安装 Docker",
    step1Lead:
      '请从<a href="https://docs.docker.com/desktop/setup/install/mac-install/">官方网站</a>下载（Apple silicon）。',
    step1a: "下载 Docker Desktop。",
    step1b: "拖到应用程序。",
    step1c: "打开 Docker，等待启动完成。",
    step1Safe: "演示只在 Docker 内运行，不会改动你的其他文件夹。",
    step2Title: "2. 运行",
    step2Lead: "打开<strong>终端</strong>，粘贴下面两行并回车。",
    step2Note: "首次可能需要几分钟。仅本机可访问（127.0.0.1）。",
    step3Title: "3. 在浏览器打开",
    step3Note: "停止：在终端按 <kbd>Control</kbd>+<kbd>C</kbd>。",
    ctaHome: "返回",
    footerCopy: "© OpenOrgOS Community",
  },
};

/** Locale cookie contract lives in /locale-bridge.js (generated from packages/shared). */
const SUPPORTED_LANGS = ["en", "ja", "zh"];

function detectLang() {
  return window.OORGOS_LOCALE ? window.OORGOS_LOCALE.detect(SUPPORTED_LANGS) : "en";
}

function writeSharedLocale(lang) {
  if (window.OORGOS_LOCALE) window.OORGOS_LOCALE.write(lang);
}

function applyLang(lang) {
  const strings = copy[lang] || copy.en;
  document.documentElement.lang = lang;
  document.title = strings.pageTitle;
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", strings.metaDescription);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = strings[key];
    if (value == null) return;
    if (el.hasAttribute("data-i18n-html")) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });
  document.querySelectorAll('a[href^="https://"]').forEach((a) => {
    a.setAttribute("rel", "noopener noreferrer");
  });

  const langSelect = document.getElementById("lang-select");
  if (langSelect) langSelect.value = lang;
  writeSharedLocale(lang);
}

document.getElementById("lang-select")?.addEventListener("change", (event) => {
  applyLang(event.target.value);
});

applyLang(detectLang());
