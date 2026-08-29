# community.oorgos.org 公開手順

Mac Docker Web（`:3000`）を **https://community.oorgos.org** で公開する手順。

> **DNS・Vercel・Tunnel の全体手順**は [`oorgos-subdomain-setup.md`](./oorgos-subdomain-setup.md) を先に読んでください。  
> 概要ページ（`oorgos.org` / `www`）は Vercel が担当します。

## 1. Tunnel（ダッシュボード）

1. https://one.dash.cloudflare.com/ → **Networks → Connectors**
2. Tunnel **`oorgos-org`**（未作成なら新規）
3. **Public Hostname** は **1 件のみ**:

| サブドメイン | ドメイン | URL |
|-------------|----------|-----|
| `community` | `oorgos.org` | **`http://web:3000`**（推奨） |

`docker-compose.yml` の `cloudflared-inc` は `network_mode: "service:web"`。`host.docker.internal` は Mac Docker Desktop の IPv6 問題で 502 になりやすいため非推奨。

4. **Connector トークン**（`eyJ…`）をコピー

**削除すること**: `oorgos.org`（apex）や `www` の Public Hostname（Vercel に移行済みのため）

**Operator Console（任意）**: `operator.oorgos.org` → `http://operator-console:9470`  
DNS + Tunnel 一括: `./scripts/configure-operator-oorgos-org.sh`（要 `CF_API_TOKEN`）  
手順: `../OS_Steward/docs/org-os/operator-console-https-runbook.md`

## 2. Mac `.env`

```bash
CLOUDFLARE_TUNNEL_TOKEN=eyJ...
DOMAIN=community.oorgos.org
AUTH_URL=https://community.oorgos.org
NEXT_PUBLIC_SITE_URL=https://community.oorgos.org
```

## 3. DNS（Cloudflare `oorgos.org` ゾーン）

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `community` | `{Tunnel ID}.cfargotunnel.com` | ON |

`@` / `www` は Vercel 向け — [`oorgos-subdomain-setup.md`](./oorgos-subdomain-setup.md) §1

## 4. 起動・確認

```bash
cd /Users/kk/OS_Community
docker compose up -d db web cloudflared-inc
./scripts/verify-openorgos-org.sh
curl -sI https://community.oorgos.org/api/health
```

### 再起動（Web 変更後・502 時）

`cloudflared-inc` は `network_mode: "service:web"` のため、**`docker compose restart` だけだと Tunnel が Cloudflare エッジに再接続できず 502 になる**ことがある（ログ: `dial tcp ...:7844: network is unreachable`）。`localhost:3000` が 200 でも公開 URL が 502 のときは cloudflared を **再作成**する。

```bash
cd /Users/kk/OS_Community

# 1. web + db を起動（または再起動）
docker compose up -d db web

# 2. web が healthy になるまで待つ（任意）
docker inspect -f '{{.State.Health.Status}}' os_community-web-1

# 3. cloudflared を再作成（restart ではなく force-recreate）
docker compose up -d --force-recreate cloudflared-inc

# 4. 確認
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/health   # 200
curl -s -o /dev/null -w "%{http_code}\n" https://community.oorgos.org/api/health  # 200
docker logs os_community-cloudflared-inc-1 2>&1 | tail -5   # Registered tunnel connection
```

**エージェント作業時:** Community Web のコード・コンテンツ変更後は dev モードなら web 再起動不要のことが多い。`docker compose restart` を使う場合は上記手順で cloudflared も再作成する。

**本番デプロイ（Mac mini）:** `bash scripts/deploy-mac-mini.sh` — web 起動待ち後に `cloudflared-inc` を force-recreate する。

**Vercel（oorgos.org）:** `cd sites/coming-soon && npx vercel@latest deploy --prod --yes`（**ホーム `~` から実行しない**）。概要ページは Community を probe しない。

## 5. OAuth

| プロバイダ | Callback |
|-----------|----------|
| Google | `https://community.oorgos.org/api/auth/callback/google` |
| GitHub | `https://community.oorgos.org/api/auth/callback/github` |
| LinkedIn | `https://community.oorgos.org/api/auth/callback/linkedin` |

## 注意

- `oorgos.org` ゾーンの Cloudflare アカウントと Tunnel アカウントを **一致** させる
- 旧 `openorgos-net` Tunnel の `oorgos.org` hostname は **使わない**
