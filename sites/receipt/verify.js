/**
 * Client-only receipt verify (orgos.jp.receipt.v1 / link v2z).
 * Fragment never leaves the browser.
 */

const I18N = {
  ja: {
    title: "領収書の検証",
    lead: "URL の # 以降だけを使い、ブラウザ内で署名を検証します。サーバーには送信されません。",
    waiting: "リンクを読み取り中…",
    valid: "署名は有効です",
    invalid: "検証に失敗しました",
    empty: "検証用リンク（#v2z.…）がありません",
    receiptId: "領収書番号",
    issuer: "発行者",
    regNo: "登録番号",
    recipient: "宛名",
    txDate: "取引日",
    digest: "digest",
    lines: "明細",
    colDesc: "品目",
    colRate: "税率",
    colAmount: "税込",
    taxTotals: "税率別合計",
    total: "合計（税込）",
    signedNote: "この内容は発行元の Ed25519 署名で保護されています。",
    none: "—",
  },
  en: {
    title: "Receipt verification",
    lead: "We verify the Ed25519 signature entirely in your browser using only the URL fragment. Nothing is sent to the server.",
    waiting: "Reading link…",
    valid: "Signature valid",
    invalid: "Verification failed",
    empty: "No verification link (#v2z.…) in the URL",
    receiptId: "Receipt ID",
    issuer: "Issuer",
    regNo: "Registration no.",
    recipient: "Recipient",
    txDate: "Transaction date",
    digest: "digest",
    lines: "Line items",
    colDesc: "Description",
    colRate: "Tax",
    colAmount: "Incl. tax",
    taxTotals: "Tax totals",
    total: "Total (incl. tax)",
    signedNote: "This content is protected by the issuer’s Ed25519 signature.",
    none: "—",
  },
};

let lang = "ja";

function readCookie(name) {
  try {
    const m = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
    );
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function writeSharedLocale(next) {
  try {
    localStorage.setItem("oorgos-locale", next);
  } catch {
    /* private mode */
  }
  try {
    const host = location.hostname.toLowerCase();
    const parts = [
      "oorgos-locale=" + encodeURIComponent(next),
      "path=/",
      "max-age=" + 60 * 60 * 24 * 365,
      "SameSite=Lax",
    ];
    if (host === "oorgos.org" || host.endsWith(".oorgos.org")) {
      parts.push("Domain=.oorgos.org");
    }
    if (location.protocol === "https:") parts.push("Secure");
    document.cookie = parts.join(";");
  } catch {
    /* cookie blocked */
  }
}

function detectLang() {
  const fromCookie = readCookie("oorgos-locale");
  if (fromCookie === "en" || fromCookie === "ja") return fromCookie;
  try {
    const saved = localStorage.getItem("oorgos-locale");
    if (saved === "en" || saved === "ja") return saved;
  } catch {
    /* private mode */
  }
  return navigator.language?.startsWith("ja") ? "ja" : "en";
}

lang = detectLang();

function t(key) {
  return I18N[lang][key] ?? I18N.en[key] ?? key;
}

function applyI18n() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  const langSelect = document.getElementById("lang-select");
  if (langSelect) langSelect.value = lang;
  writeSharedLocale(lang);
}

function sortKeys(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortKeys);
  const sorted = {};
  for (const key of Object.keys(value).sort()) {
    sorted[key] = sortKeys(value[key]);
  }
  return sorted;
}

function canonicalJson(value) {
  return JSON.stringify(sortKeys(value));
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const bin = atob(padded + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function inflateZlib(bytes) {
  const ds = new DecompressionStream("deflate");
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new TextDecoder().decode(buf);
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function expandCompact(compact) {
  const receipt = {
    schema: "orgos.jp.receipt.v1",
    receipt_id: compact.i,
    document_type:
      compact.y === 0 ? "qualified_invoice" : "qualified_simplified_invoice",
    issued_at: compact.a,
    transaction_date: compact.d,
    currency: "JPY",
    issuer: {
      org_id: compact.u[0],
      name: compact.u[1],
      invoice_registration_number: compact.u[2],
    },
    recipient_name: compact.n,
    lines: compact.l.map((line) => ({
      description: line[0],
      quantity: line[1] ?? undefined,
      tax_rate: line[2],
      reduced_tax: line[3] === 1,
      amount_excluding_tax: line[4],
      tax_amount: line[5],
      amount_including_tax: line[6],
    })),
    tax_totals: compact.x.map((total) => ({
      tax_rate: total[0],
      amount_excluding_tax: total[1],
      tax_amount: total[2],
      amount_including_tax: total[3],
    })),
    total_amount: compact.m,
    claim:
      compact.e && compact.c
        ? { endpoint: compact.e, claim_key: compact.c }
        : undefined,
    fetch_url: compact.f,
  };
  return {
    receipt,
    digest: null,
    signature: compact.g,
    issuer_public_key: compact.p,
  };
}

async function decodeLink(fragment) {
  if (fragment.startsWith("v2z.")) {
    const compressed = base64UrlToBytes(fragment.slice(4));
    if (compressed.byteLength > 16 * 1024) throw new Error("payload_too_large");
    const raw = await inflateZlib(compressed);
    const compact = JSON.parse(raw);
    return expandCompact(compact);
  }
  if (fragment.startsWith("v1.")) {
    const raw = new TextDecoder().decode(base64UrlToBytes(fragment.slice(3)));
    return JSON.parse(raw);
  }
  if (fragment.startsWith("{")) return JSON.parse(fragment);
  throw new Error("unsupported_version");
}

async function verifyPayload(payload) {
  const expectedDigest = await sha256Hex(canonicalJson(payload.receipt));
  if (payload.digest && payload.digest !== expectedDigest) {
    return { ok: false, reason: "digest_mismatch" };
  }
  const digest = expectedDigest;
  const publicKey = await crypto.subtle.importKey(
    "spki",
    base64ToBytes(payload.issuer_public_key),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  const ok = await crypto.subtle.verify(
    "Ed25519",
    publicKey,
    base64ToBytes(payload.signature),
    hexToBytes(digest),
  );
  return ok
    ? { ok: true, payload: { ...payload, digest } }
    : { ok: false, reason: "signature_invalid" };
}

function base64ToBytes(value) {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function yen(n) {
  return new Intl.NumberFormat(lang === "ja" ? "ja-JP" : "en-US", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(n);
}

function setStatus(kind, text) {
  const el = document.getElementById("status");
  el.className = `badge badge-${kind}`;
  el.textContent = text;
}

function render(payload) {
  const r = payload.receipt;
  document.getElementById("card").hidden = false;
  document.getElementById("receipt-id").textContent = r.receipt_id;
  document.getElementById("issuer").textContent = r.issuer.name;
  document.getElementById("reg-no").textContent =
    r.issuer.invoice_registration_number;
  document.getElementById("recipient").textContent =
    r.recipient_name || t("none");
  document.getElementById("tx-date").textContent = r.transaction_date;
  document.getElementById("digest").textContent = payload.digest;
  document.getElementById("total").textContent = yen(r.total_amount);

  const tbody = document.getElementById("lines-body");
  tbody.replaceChildren();
  for (const line of r.lines) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(line.description)}</td><td>${line.tax_rate}%</td><td>${yen(line.amount_including_tax)}</td>`;
    tbody.appendChild(tr);
  }

  const totals = document.getElementById("tax-totals");
  totals.replaceChildren();
  for (const total of r.tax_totals) {
    const li = document.createElement("li");
    li.textContent = `${total.tax_rate}% · ${yen(total.amount_including_tax)}`;
    totals.appendChild(li);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function run() {
  applyI18n();
  const fragment = location.hash.replace(/^#/, "").trim();
  if (!fragment) {
    setStatus("warn", t("empty"));
    return;
  }
  try {
    const decoded = await decodeLink(fragment);
    const verified = await verifyPayload(decoded);
    if (!verified.ok || !verified.payload) {
      setStatus("danger", `${t("invalid")}: ${verified.reason ?? "unknown"}`);
      return;
    }
    setStatus("success", t("valid"));
    render(verified.payload);
  } catch (err) {
    setStatus(
      "danger",
      `${t("invalid")}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

document.getElementById("lang-select")?.addEventListener("change", (event) => {
  lang = event.target.value === "en" ? "en" : "ja";
  applyI18n();
  void run();
});

window.addEventListener("hashchange", () => void run());
applyI18n();
void run();
