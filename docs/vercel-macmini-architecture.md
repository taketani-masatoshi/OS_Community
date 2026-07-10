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

`oorgos.org` と `community.oorgos.org` は別オリジン。Cookie は共有しない。

---

## 6. 実装ステータス

| 項目 | 状態 |
|------|------|
| `www.oorgos.org` → Vercel | ✅ |
| サブドメイン構成ドキュメント | ✅ |
| `oorgos.org` apex → Vercel | ⏳ DNS + Vercel ドメイン追加 |
| `community.oorgos.org` → Tunnel | ⏳ ダッシュボード + `.env` |
| OAuth on `community.*` | ⏳ |

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
