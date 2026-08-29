# Vercel + Mac mini 分割構成 — 実装方針

**ステータス**: Adopted（2026-07-08）— サブドメイン分離  
**作業手順**: [`oorgos-subdomain-setup.md`](./oorgos-subdomain-setup.md)  
**方針**: NPO 向け・支出最小。概要は Vercel、Community（DB・認証）は Mac mini。

---

## 1. 結論（30秒で）

| ホスト | 役割 | 実行基盤 |
|--------|------|----------|
| **`oorgos.org`**（apex） | OpenOrgOS 概要（静的） | **Vercel Hobby** |
| **`www.oorgos.org`** | → `oorgos.org` へリダイレクト | **Vercel** |
| **`community.oorgos.org`** | Community（ログイン・DB・API） | **Mac mini + Tunnel** |

追加ドメインは不要。**同一ゾーン `oorgos.org` 内でサブドメイン分離**する。

---

## 2. アーキテクチャ図

```text
                         利用者ブラウザ
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
   oorgos.org           www.oorgos.org      community.oorgos.org
   （概要）              （→ apex へ 301）    （Community）
         │                     │                     │
         └──────────┬──────────┘                     │
                    ▼                                ▼
             Cloudflare DNS                   Cloudflare DNS
             A @ → 76.76.21.21               CNAME → cfargotunnel
             CNAME www → vercel-dns           Proxy: ON
             Proxy: OFF                              │
                    ▼                                ▼
             Vercel Edge                       Cloudflare Tunnel
             sites/coming-soon/                cloudflared-inc
             静的 HTML · EN/ja                       │
             DB なし                                   ▼
                                              Mac mini Docker
                                              web + PostgreSQL
```

---

## 3. DNS 設計（確定）

Cloudflare ゾーン: **`oorgos.org`**

| Type | Name | Target | Proxy | 向き先 |
|------|------|--------|-------|--------|
| A | `@` | `76.76.21.21` | OFF | Vercel |
| CNAME | `www` | `*.vercel-dns-*.com` | OFF | Vercel |
| CNAME | `community` | `{Tunnel ID}.cfargotunnel.com` | ON | Mac mini |

Tunnel Public Hostname: **`community.oorgos.org` のみ**（apex / www は登録しない）。

---

## 4. 各レイヤ

### Vercel — `oorgos.org` / `www`

| 項目 | 内容 |
|------|------|
| パス | `sites/coming-soon/` |
| プロジェクト | `open-org-os` / `coming-soon` |
| ドメイン | `oorgos.org` + `www.oorgos.org` |
| リダイレクト | `vercel.json` で www → apex |
| デプロイ | `npx vercel deploy --prod --yes` |

### Mac mini — `community.oorgos.org`

| 項目 | 内容 |
|------|------|
| スタック | `docker compose`（`web` + `db` + `cloudflared-inc`） |
| `.env` | `DOMAIN=community.oorgos.org` |
| 手順 | [`oorgos-org-setup.md`](./oorgos-org-setup.md) |

```bash
DOMAIN=community.oorgos.org
AUTH_URL=https://community.oorgos.org
NEXT_PUBLIC_SITE_URL=https://community.oorgos.org
CLOUDFLARE_TUNNEL_TOKEN=eyJ...
```

---

## 5. データ境界

| 種別 | 置き場所 |
|------|----------|
| 概要 HTML | Vercel（Git） |
| ユーザー・モジュール DB | Mac mini PostgreSQL |
| OAuth シークレット | Mac `.env` のみ |
| セッション Cookie | `community.oorgos.org` のみ |

`oorgos.org` と `community.oorgos.org` は別オリジン。**セッション・認証 Cookie は共有しない。** 共有するのは UI 設定のみ。

### 5.1 Cookie 契約（正本: [`packages/shared/src/locale-bridge.ts`](../packages/shared/src/locale-bridge.ts)）

| Cookie | 誰が書く | Domain | 用途 |
|--------|----------|--------|------|
| `oorgos-locale` | 概要 · Community · Console | `.oorgos.org` | Console UI（**ja / en のみ**） |
| `oorgos-lang` | Community（Console は自オリジンのみ） | なし（host-only） | Community の全 locale（de · zh 等） |
| `oorgos-theme` | 各サーフェス | `.oorgos.org` | 外観 |
| `locale`（旧） | 書かない | — | 残留分を Max-Age=0 で失効 |
| セッション | Community / Console が各自 | なし | **共有しない** |

概要サイトは ja/en 以外（zh 等）を選んでも共有 Cookie には `en` を書き、ページ locale は自オリジンの localStorage に保持する。

### 5.2 Console ログイン入口

Operator Console のログインは常に Community 発。`operator.oorgos.org` を起点にしない。

```text
https://community.oorgos.org/ops/console/start?next=%2F
  → Community セッション → 短命 id_token → operator.oorgos.org/auth/community-handoff
```

概要サイトの Console / Community リンクは [`sites/coming-soon/ecosystem-links.js`](../sites/coming-soon/ecosystem-links.js)（`npm run overview:links` で `packages/shared` から生成）に従う。

**localhost では繋がらない:** `http://localhost:3000` は `.oorgos.org` Cookie を受け取れないため、概要↔Community の言語引き継ぎは確認できない。横断確認は `https://community.oorgos.org` で行う。

---

## 6. 実装ステータス

| 項目 | 状態 |
|------|------|
| `www.oorgos.org` → Vercel | ✅ |
| サブドメイン構成ドキュメント | ✅ |
| `oorgos.org` apex → Vercel | ✅ |
| `community.oorgos.org` → Tunnel | ✅ |
| OAuth on `community.*` | ✅ |
| 横断 locale Cookie 契約（§5.1） | ✅ |

---

## 7. 関連ファイル

| パス | 内容 |
|------|------|
| [`oorgos-subdomain-setup.md`](./oorgos-subdomain-setup.md) | **作業手順書（まずここ）** |
| [`oorgos-org-setup.md`](./oorgos-org-setup.md) | Community Tunnel 詳細 |
| `sites/coming-soon/` | 概要ページ |
| `deploy/cloudflared/oorgos-org.docker.yml` | ingress 例 |
| `scripts/verify-openorgos-org.sh` | 公開確認 |

---

## 8. Vercel Hobby（概要ページ）

- **Edge Requests 月 100 万** ≒ ページ表示回数の上限
- **First 100,000**（ドキュメント上部の表）は Edge Config 等の別機能
- 10 万ユーザー規模の概要 PV なら Hobby で十分

参照: https://vercel.com/docs/plans/hobby
