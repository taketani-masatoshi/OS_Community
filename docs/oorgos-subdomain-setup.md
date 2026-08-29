# oorgos.org サブドメイン分離 — 作業手順書

**採用構成（2026-07-08）**

| ホスト | 役割 | 基盤 |
|--------|------|------|
| **`oorgos.org`**（apex） | OpenOrgOS 概要（静的） | Vercel |
| **`www.oorgos.org`** | apex へリダイレクト | Vercel |
| **`community.oorgos.org`** | Community（ログイン・DB） | Mac mini + Tunnel |

全体像: [`vercel-macmini-architecture.md`](./vercel-macmini-architecture.md)

---

## 作業の流れ（この順で）

| # | 誰 | 作業 | 所要 |
|---|-----|------|------|
| **1** | あなた | Cloudflare DNS を書き換え | 10 分 |
| **2** | あなた | Vercel に `oorgos.org` を追加 | 5 分 |
| **3** | あなた | Tunnel の Public Hostname を `community` に変更 | 5 分 |
| **4** | あなた | Mac `.env` 更新 + Docker 再起動 | 5 分 |
| **5** | あなた | 公開確認（curl） | 2 分 |
| **6** | 任意 | 概要ページに Community リンクを有効化して Vercel 再デプロイ | 5 分 |

> **リポジトリ側**（`vercel.json` リダイレクト・スクリプト・ingress 例）は更新済み。  
> **ダッシュボード作業（1〜3）はあなたが実施**してください。

---

## 1. Cloudflare DNS（`oorgos.org` ゾーン）

[Cloudflare DNS](https://dash.cloudflare.com/) → `oorgos.org` → **DNS → Records**

### 1-A. 削除または変更するレコード

| 対象 | 理由 |
|------|------|
| `@` → Tunnel の CNAME | apex は Vercel に移す |
| `www` → Tunnel の CNAME | あれば削除（Vercel 用のみ残す） |
| `community` の古いレコード | あれば一旦削除してから再作成 |

### 1-B. 追加・最終形（この3件）

| Type | Name | Target / Content | Proxy |
|------|------|------------------|-------|
| **A** | `@` | `76.76.21.21` | **OFF（灰色雲）** |
| **CNAME** | `www` | `202b49e139d586d8.vercel-dns-017.com`（Vercel が表示する値） | **OFF** |
| **A** | `receipt` | `76.76.21.21` | **OFF（灰色雲）** |
| **CNAME** | `community` | `{Tunnel ID}.cfargotunnel.com` | **ON（オレンジ雲）** |

- `@` の A レコードは Vercel が apex 追加時に案内する IP を使う（通常 `76.76.21.21`）
- `www` の CNAME は Vercel プロジェクト → Domains で確認
- `community` の Tunnel ID は Zero Trust → Connectors → `oorgos-org` の詳細

**やらないこと**: ゾーン NS を Vercel に変更しない（Cloudflare NS のまま）

---

## 2. Vercel（概要ページ）

### 2-A. ドメイン追加

1. [Vercel Dashboard](https://vercel.com/open-org-os/coming-soon/settings/domains)
2. **Add** → `oorgos.org` を追加
3. DNS が未設定なら表示される A/CNAME を Cloudflare に反映（手順 1-B の `@`）

### 2-B. SSL 確認

```bash
cd sites/coming-soon
npx vercel@latest domains verify oorgos.org
npx vercel@latest certs issue oorgos.org   # 必要なときのみ
curl -sI https://oorgos.org | head -5
```

### 2-C. デプロイ（リダイレクト設定込み）

```bash
cd sites/coming-soon
npx vercel@latest deploy --prod --yes
```

`vercel.json` で `www.oorgos.org` → `https://oorgos.org` に 301 リダイレクト。

---

## 3. Cloudflare Tunnel（Community のみ）— Zero Trust 操作

トンネル名: **`oorgos-org`**  
Tunnel ID: **`683a2039-939a-4e0a-9e4f-3591accfcf13`**

入口: https://one.dash.cloudflare.com/

左上で **アカウント / チーム** が `oorgos.org` と同じ Cloudflare アカウントであることを確認。

### 3-1. トンネルを開く

1. 左メニュー **Networks（ネットワーク）**
2. **Connectors（コネクタ）**  
   - 見当たらない場合: **Tunnels（トンネル）**
3. 一覧から **`oorgos-org`** をクリック  
   - 無い場合: **Add a tunnel / トンネルを追加** → Cloudflared → 名前 `oorgos-org` で作成

### 3-2. Public Hostname（公開ホスト名）を 1 件にする

トンネル詳細で **Published application routes** / **Public Hostname** / **公開ホスト名** タブを開く。

| 操作 | サブドメイン | ドメイン | Type | URL（Service） |
|------|-------------|----------|------|----------------|
| **削除**（あれば） | （空）または `@` | `oorgos.org` | HTTP | — |
| **削除**（あれば） | `www` | `oorgos.org` | HTTP | — |
| **追加** | `community` | `oorgos.org` | **HTTP** | `http://host.docker.internal:3000` |

**追加の入力欄（画面ラベル別）**

| 画面のラベル | 入れる値 |
|--------------|----------|
| Subdomain / サブドメイン | `community` |
| Domain / ドメイン | `oorgos.org`（ドロップダウン） |
| Path / パス | **空のまま** |
| Type / タイプ | **HTTP**（HTTPS にしない） |
| URL | `http://host.docker.internal:3000` |

保存（**Save hostname** / **ホスト名を保存**）。

> Path が空 = `https://community.oorgos.org/` 全体が Mac の `:3000` に届く。

### 3-3. Connector トークンをコピー

1. 同じトンネル詳細で **Configure / 設定** または **Install connector / コネクタをインストール**
2. **Docker** または **Token** 表示を選ぶ
3. 次のような長い文字列をコピー（先頭 `eyJ`）:

```text
eyJ...（長い Base64。途中省略しない）
```

この値を Mac `.env` の `CLOUDFLARE_TUNNEL_TOKEN=` に貼る（手順 4）。

CLI 用の `cloudflared tunnel run --token eyJ...` の例があれば、**`--token` の直後だけ**を取る。

### 3-4. 状態の見方

| 表示 | 意味 |
|------|------|
| Status: **Healthy / 正常**（緑） | Mac の cloudflared が接続済み |
| **Inactive / 切断** | トークン未設定 or Docker 未起動 → 手順 4 へ |

Public Hostname は **`community.oorgos.org` だけ**。apex / www は Vercel 用なので Tunnel には置かない。

---

## 4. Mac mini（`.env` + Docker）

### 4-A. `.env` を次に合わせる

```bash
CLOUDFLARE_TUNNEL_TOKEN=eyJ...    # 手順 3 のトークン
DOMAIN=community.oorgos.org
AUTH_URL=https://community.oorgos.org
NEXT_PUBLIC_SITE_URL=https://community.oorgos.org
```

### 4-B. 起動

```bash
cd /Users/kk/OS_Community
docker compose up -d db web cloudflared-inc
./scripts/verify-openorgos-org.sh
```

---

## 5. 公開確認

```bash
# 概要（Vercel）
curl -sI https://oorgos.org | head -3
curl -sI https://www.oorgos.org | head -3    # → 301 で oorgos.org へ

# Community（Mac + Tunnel）
curl -sI https://community.oorgos.org/api/health | head -5
curl -s https://community.oorgos.org/api/health
```

ブラウザ:

- https://oorgos.org … 概要ページ（EN/ja）
- https://community.oorgos.org … Community トップ（ログイン可）

---

## 6. OAuth（ログインを使うとき）

各プロバイダの Callback URL を **`community.oorgos.org`** に登録:

| プロバイダ | Callback |
|-----------|----------|
| Google | `https://community.oorgos.org/api/auth/callback/google` |
| GitHub | `https://community.oorgos.org/api/auth/callback/github` |
| LinkedIn | `https://community.oorgos.org/api/auth/callback/linkedin` |

詳細: [`google-oauth-setup.md`](./google-oauth-setup.md) 等（URL だけ差し替え）

---

## 7. 概要ページの Community リンク（任意・手順 5 成功後）

Tunnel 公開確認後、`sites/coming-soon/index.html` の Community ボタンが有効になります。  
再デプロイ:

```bash
cd sites/coming-soon && npx vercel@latest deploy --prod --yes
```

---

## 8. 公開メール `hello@oorgos.org`（Email Routing）

概要ページと Community のお問い合わせに出す唯一の連絡先。**フォームは置かない**ため、この転送が届かないと入口が無くなる。

転送先（普段読んでいる受信箱）は Cloudflare 側のみに保持し、**このリポジトリには書かない**。

### 8-A. 既存 MX の確認（先に必ず）

```bash
dig +short MX oorgos.org
```

他社メール（Google Workspace 等）の MX が出た場合、Email Routing の MX で**上書きしない**。同一ドメインで MX は共存できないため、その時は導入を止めて構成を決め直す。

### 8-B. 有効化

1. https://dash.cloudflare.com/ → **oorgos.org** → **Email** → **Email Routing**
2. **Destination addresses** に普段の受信箱を追加 → 届いた確認メールを承認
3. **Routing rules** に追加:

| Custom address | Action | Destination |
|----------------|--------|-------------|
| `hello@oorgos.org` | Send to an email | 承認済みの受信箱 |

4. Cloudflare が案内する **MX / TXT (SPF)** をゾーンに反映（同画面の «Add records automatically» で可）

### 8-C. 確認（サイト公開より先）

```bash
dig +short MX oorgos.org       # Cloudflare の mx レコードが 3 件
dig +short TXT oorgos.org      # spf1 include:_spf.mx.cloudflare.net
```

外部アカウント（携帯キャリアや別の Gmail など）から `hello@oorgos.org` へ送り、受信箱に届くことを確認する。**届いてから** Vercel を再デプロイする。

| 症状 | 確認 |
|------|------|
| 送信が bounce する | Destination の確認メールを承認済みか / MX が反映済みか |
| 迷惑メールに入る | TXT (SPF) が入っているか |
| 何も届かない | ルールが `hello@` で有効（Enabled）か |

---

### 502 が出るとき（Tunnel 接続済みなのに `error code: 502`）

**症状**: `cloudflared` は Healthy、localhost:3000 は OK、公開 URL だけ 502。

**原因**: `community` の DNS が Tunnel に紐づいていない（Zero Trust のルートだけでは DNS が無いことがある）。

**Fix — 通常の Cloudflare DNS 画面**（Zero Trust ではない）:

1. https://dash.cloudflare.com/ → **oorgos.org** → **DNS** → **レコード**
2. Name **`community`** の行を探す
3. 無い / 中身が違う → **追加** または **編集**:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `community` | `683a2039-939a-4e0a-9e4f-3591accfcf13.cfargotunnel.com` | **ON（橙）** |

4. 保存後 1〜2 分待って:

```bash
curl -s https://community.oorgos.org/api/health
```

**Zero Trust の Service URL**（Docker Compose 利用時）:

| 欄 | 値 |
|----|-----|
| URL | **`http://web:3000`**（推奨） |

`docker-compose.yml` の `cloudflared-inc` は `network_mode: "service:web"` で web と同一ネットワーク名前空間に載せる。Zero Trust 側は `http://web:3000` のままでよい。

以前の `http://host.docker.internal:3000` は Mac Docker Desktop の IPv6 問題で 502 になりやすいため非推奨。

---

| 症状 | 確認 |
|------|------|
| `localhost:3000` は 200 だが `community.oorgos.org` が **502** | cloudflared ログに `7844: network is unreachable` → [`oorgos-org-setup.md`](./oorgos-org-setup.md) §4 再起動手順で `cloudflared-inc` を **force-recreate** |
| `docker compose restart` 後に公開 URL だけ死ぬ | 上と同じ — `network_mode: service:web` では restart より **再作成** |
| `oorgos.org` が Community を表示 | `@` がまだ Tunnel 向き → A レコードに変更 |
| `community.oorgos.org` が 1033 / 530 | Tunnel hostname 未設定 or トークン未設定 |
| `oorgos.org` SSL エラー | Vercel で `certs issue oorgos.org`、DNS の `@` を確認 |
| OAuth 失敗 | `AUTH_URL` と Callback が `community.oorgos.org` で一致しているか |

---

## チェックリスト（印刷用）

```
[ ] Cloudflare: @ → A 76.76.21.21（灰）
[ ] Cloudflare: www → Vercel CNAME（灰）
[ ] Cloudflare: community → Tunnel CNAME（橙）
[ ] Vercel: oorgos.org 追加・SSL OK
[ ] Vercel: deploy prod（www リダイレクト込み）
[ ] Tunnel: apex/www hostname 削除
[ ] Tunnel: community.oorgos.org → :3000 追加
[ ] Mac .env: DOMAIN/AUTH_URL = community.oorgos.org
[ ] docker compose up -d db web cloudflared-inc
[ ] curl https://oorgos.org → 200
[ ] curl https://community.oorgos.org/api/health → OK
[ ] OAuth callback 更新（使う場合）
```
