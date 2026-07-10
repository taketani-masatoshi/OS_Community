# Cloudflare Tunnel — 2 ドメイン接続

`openorgos.net`（Community）と `southwood.cloud`（SaaS）を、それぞれ別 Tunnel で Docker に接続する手順。

## 構成

| 公開 URL | Tunnel 名 | Tunnel ID | ローカル先 |
|----------|-----------|-----------|-----------|
| `openorgos.net` / `www.openorgos.net` | openorgos-net | `3eec3f29-6743-4028-b443-ac5f6cd5e65b` | `http://host.docker.internal:3000`（Docker `cloudflared-inc` サービス） |
| `control.southwood.cloud` 等 | southwood-cloud | `c66d11fa-f940-4892-a232-408bf755a79e` | `http://localhost:8080` / `:8082` |

Ingress 定義: `deploy/cloudflared/*.ingress.yml`

## openorgos.net ゾーン（Cloudflare ダッシュボード）

Community サイトは **openorgos.net ゾーン**（Cloudflare アカウント）で公開します。

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) で `openorgos.net` を追加し、レジストラの NS を Cloudflare 向けに変更
2. Zero Trust → **Networks** → **Tunnels** → `openorgos-net` を選択（または新規作成）
3. **Public Hostname** を追加:
   - `openorgos.net` → `http://host.docker.internal:3000`（Docker 利用時）または `http://localhost:3000`
   - `www.openorgos.net` → 同上
4. ローカル connector: `docker compose up -d cloudflared-inc` または `./scripts/start-cloudflare-tunnels.sh`

> **注意:** `cloudflared tunnel route dns` は、ログイン中の Cloudflare アカウントに **openorgos.net ゾーンが存在する** 場合のみ正しく CNAME が付きます。別アカウントの場合はダッシュボードから Public Hostname を設定してください。

## 初回セットアップ

```bash
cd /Users/kk/OS_Community

# 1. Community
docker compose up -d

# 2. Cloud スタック（8080/8082 をホスト公開）
./scripts/start-cloud-stack.sh

# 3. DNS を Tunnel に向ける（openorgos.net ゾーンが cloudflared ログイン先と一致していること）
./scripts/configure-cloudflare-tunnels.sh

# 4. 両 Tunnel をバックグラウンド起動
./scripts/start-cloudflare-tunnels.sh
```

`.env` の例:

```bash
AUTH_URL=https://openorgos.net
NEXT_PUBLIC_SITE_URL=https://openorgos.net
DOMAIN=openorgos.net
COMMUNITY_TUNNEL_ID=3eec3f29-6743-4028-b443-ac5f6cd5e65b
```

## 日常の起動

```bash
cd /Users/kk/OS_Community
docker compose up -d
docker compose -f docker-compose.cloud.yml --profile dev up -d
./scripts/start-cloudflare-tunnels.sh
```

## 確認

```bash
curl -s http://localhost:3000/ | head -1
curl -s http://localhost:8080/health
cloudflared tunnel info 3eec3f29-6743-4028-b443-ac5f6cd5e65b
cloudflared tunnel info c66d11fa-f940-4892-a232-408bf755a79e
```

ブラウザ:

- https://openorgos.net
- https://control.southwood.cloud/health
- https://demo.southwood.cloud/

## ログ

```bash
docker compose logs -f cloudflared-inc
tail -f /tmp/os-community-cloudflared-cloud.log
```

## southwood.cloud の DNS について

`southwood.cloud` は **Cloudflare に別ゾーンとして追加** されている必要があります。

ワイルドカード org 用:

```bash
cloudflared tunnel route dns c66d11fa-f940-4892-a232-408bf755a79e '*.southwood.cloud'
```

## OAuth コールバック（ドメイン切替後）

各プロバイダで callback URL を **https://openorgos.net** に更新:

| プロバイダ | Callback |
|-----------|----------|
| GitHub | `https://openorgos.net/api/auth/callback/github` |
| Google | `https://openorgos.net/api/auth/callback/google` |
| LinkedIn | `https://openorgos.net/api/auth/callback/linkedin` |

## 関連スクリプト

| スクリプト | 用途 |
|-----------|------|
| `scripts/start-cloudflare-tunnels.sh` | 両 Tunnel 起動 |
| `scripts/configure-cloudflare-tunnels.sh` | DNS ルート登録 |
| `scripts/setup-local-openorgos-hosts.sh` | ローカル Caddy 用 `/etc/hosts` |
