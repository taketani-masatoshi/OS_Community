# openorgos.org 公開手順（localhost:3000 → インターネット）

Mac 上の Docker Web（`http://localhost:3000`）を **https://openorgos.org** で公開する手順です。

## 全体像

```
ブラウザ → openorgos.org (Cloudflare DNS)
              ↓
         Cloudflare Tunnel (openorgos-net)
              ↓
         Mac Docker cloudflared-inc
              ↓
         localhost:3000 (web コンテナ)
```

**重要:** `cloudflared` CLI がログインしている Cloudflare アカウントと、`openorgos.org` ゾーンがあるアカウントが **同じ** である必要があります。  
異なる場合は、**ダッシュボードから Tunnel / Public Hostname を設定** してください（CLI の `tunnel route dns` だけでは不十分なことがあります）。

---

## こちら（Mac）で済んでいること

| 項目 | 状態 |
|------|------|
| `.env` の `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` / `DOMAIN` | `openorgos.org` |
| Tunnel ingress（`openorgos.org` / `www`） | 設定済み |
| `web` + `cloudflared-inc` | 再起動済み |
| 確認スクリプト | `./scripts/verify-openorgos-org.sh` |

---

## Step 1 — ローカル Web が動いているか確認（Mac）

ターミナル:

```bash
cd /Users/kk/OS_Community
./scripts/verify-openorgos-org.sh
```

`localhost:3000` が ✗ の場合:

```bash
./scripts/restart-community-web.sh
```

ブラウザで **http://localhost:3000/** が開ければ OK。

---

## Step 2 — Cloudflare に openorgos.org ゾーンがあるか確認

1. ブラウザで [Cloudflare ダッシュボード](https://dash.cloudflare.com/) を開く  
   （`K.lab.masa@gmail.com` のアカウント）
2. 左メニュー **Domains** → **Overview**
3. 一覧に **openorgos.org** があり **Active**（緑チェック）であること

> 無い場合: **Add domain** → `openorgos.org` を入力 → Free プラン → 続行

---

## Step 3 — レジストラでネームサーバーを Cloudflare に向ける

**これがないと `openorgos.org` は世界中で名前解決できません。**

1. Cloudflare で **openorgos.org** を開く
2. **Overview**（概要）タブを開く
3. **「Cloudflare のネームサーバーに変更する」** セクションを探す  
   例（実際の値は画面に表示されたものを使う）:
   - `ada.ns.cloudflare.com`
   - `bob.ns.cloudflare.com`
4. **ドメインを購入したサイト**（レジストラ）にログイン  
   例: Onamae, Google Domains, Namecheap, お名前.com 等
5. ドメイン **openorgos.org** の **ネームサーバー（NS）設定** を開く
6. レジストラの NS を **Step 3-3 でコピーした Cloudflare の NS 2 つ** に変更して保存

### 反映確認（Mac ターミナル）

```bash
dig +short openorgos.org NS
```

Cloudflare の NS（`*.ns.cloudflare.com`）が **2 行** 返れば OK。  
反映まで **数分〜最大 48 時間** かかることがあります。

---

## Step 4 — Cloudflare Tunnel に Public Hostname を追加

### 4-A. Zero Trust を開く

1. Cloudflare ダッシュボード左上の **アカウント名** をクリック
2. **Zero Trust** を開く（または `one.dash.cloudflare.com`）
3. 左メニュー **Networks** → **Tunnels**

### 4-B. 既存 Tunnel を使う場合

Tunnel 一覧に **openorgos-net**（ID: `3eec3f29-6743-4028-b443-ac5f6cd5e65b`）がある場合:

1. **openorgos-net** をクリック
2. **Public Hostname** タブ → **Add a public hostname**
3. 1 件目:

   | 項目 | 値 |
   |------|-----|
   | Subdomain | （空欄 = `@`） |
   | Domain | `openorgos.org` |
   | Path | （空欄） |
   | Type | HTTP |
   | URL | `host.docker.internal:3000` |

4. **Save**
5. 2 件目（www）も同様に追加:

   | Subdomain | `www` |
   | Domain | `openorgos.org` |
   | URL | `host.docker.internal:3000` |

> Mac の Docker から Tunnel connector が動いているため、Service URL は `host.docker.internal:3000` です。

### 4-C. Tunnel が一覧に無い場合（別アカウント問題）

1. **Create a tunnel** → 名前 `openorgos-org` → 保存
2. **Docker** を選び、表示された **Token** をコピー
3. 開発者に Token を渡す（または `.env` に `CLOUDFLARE_TUNNEL_TOKEN=` として設定し compose を更新）
4. 上記 **Public Hostname** を 4-B と同様に追加

---

## Step 5 — 誤った DNS レコードの削除（任意）

以前 CLI が **別ゾーン** に付けた CNAME がある場合:

1. Cloudflare → **southwood.inc** ゾーン（もしあれば）→ **DNS** → **Records**
2. `openorgos.org.southwood.inc` など **誤ったレコード** を削除

---

## Step 6 — Mac 側で Tunnel connector を再起動

```bash
cd /Users/kk/OS_Community
./scripts/restart-community-web.sh
```

---

## Step 7 — 公開確認

```bash
dig +short openorgos.org NS
curl -sI https://openorgos.org
./scripts/verify-openorgos-org.sh
```

- `curl` で `HTTP/2 200` または `301` → 公開成功
- **Error 1033** → Tunnel connector 未接続 → Step 6 を再実行
- **Could not resolve host** → Step 3（NS）が未反映

ブラウザ: **https://openorgos.org/**

---

## Step 8 — OAuth コールバック更新（ログインを使う場合）

各コンソールで **Authorized redirect URI / Callback URL** を追加:

| プロバイダ | URL |
|-----------|-----|
| Google Cloud Console | `https://openorgos.org/api/auth/callback/google` |
| GitHub OAuth App | `https://openorgos.org/api/auth/callback/github` |
| LinkedIn Developer | `https://openorgos.org/api/auth/callback/linkedin` |

ログインは **https://openorgos.org/login** から行う（localhost ではない）。

---

## よくあるトラブル

| 症状 | 原因 | 対処 |
|------|------|------|
| `dig openorgos.org NS` が空 | NS 未変更 | Step 3 |
| Error 1033 | Tunnel 未接続 | `docker compose up -d cloudflared-inc` |
| 530 | DNS と Tunnel のゾーン不一致 | Step 4 を openorgos.org ゾーンのアカウントで |
| OAuth 失敗 | callback 未更新 | Step 8 |
| ローカルだけ試す | `/etc/hosts` | `./scripts/setup-local-openorgos-hosts.sh` + Caddy |

---

## 関連コマンド

```bash
cd /Users/kk/OS_Community
./scripts/restart-community-web.sh   # 再起動 + 検証
./scripts/verify-openorgos-org.sh     # 状態チェックのみ
docker compose logs -f cloudflared-inc
```
