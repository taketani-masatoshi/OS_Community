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

### Prisma schema 変更後（`organizationId` 追加など）

`docker-compose.yml` の web は **匿名 volume**（`/app/node_modules`）を使う。ホストで `npx prisma generate` しても **コンテナ内の Client は更新されない**。起動コマンドで `npm run generate -w @os-community/db` が走るので、schema / migration 適用後は web を再作成する:

```bash
# 1. DB に SQL / migrate を適用済みであること
# 2. Client 再生成 + Next 再起動
docker compose up -d --force-recreate web
# 3. Tunnel（502 防止）
docker compose up -d --force-recreate cloudflared-inc
```

症状の例: `/mypage` が 500、ログに `Unknown argument \`organizationId\`` / `PrismaClientValidationError`（digest 付き error ページ）。

**本番デプロイ（Mac mini）:** `bash scripts/deploy-mac-mini.sh` — web 起動待ち後に `cloudflared-inc` を force-recreate する。

### Operator Console（Wire Web + 予実 Today）

Community の `web:3000` とは別に、OrgOS **Operator Console** を並走する。

| URL | 内容 |
|-----|------|
| http://127.0.0.1:9470/ | Steward Chat · **Today（予実 KPI）**（:9470 占有時は :9471） |
| http://127.0.0.1:9470/wire/ | **Wire Console**（ログイン PassKey） |
| http://localhost:4178/enroll | 決済 PassKey UI（localhost · Vercel 不要） |

**推奨（統合 Docker）:** baked Operator イメージ + approve nginx + Community を一括起動する。Colima が止まっているとコンテナ全体が落ちる（community 530）。

```bash
cd /Users/kk/OS_Community
./scripts/start-local-stack.sh --ensure   # Colima + compose（再ビルドなし）
./scripts/install-local-stack-launchagent.sh  # ログイン時 Colima + 3分おき監視（初回のみ）
```

Community `.env`:

- `NEXT_PUBLIC_OPERATOR_CONSOLE_URL=http://127.0.0.1:9470`（ブラウザ用）
- `OPERATOR_CONSOLE_HEALTH_URL=http://operator-console:9470`（compose DNS）
- Settlement（localhost）: Operator 側 `ORGOS_SETTLEMENT_RP_ID=localhost` · `ORGOS_SETTLEMENT_APPROVE_ORIGIN=http://localhost:4178`
- Community → Console SSO（二重ログイン解消）:
  - `COMMUNITY_CONSOLE_OIDC_HS256_SECRET`（Console の `WIRE_CONSOLE_OIDC_HS256_SECRET` と同一）
  - `COMMUNITY_CONSOLE_OIDC_ISSUER`（例: `https://community.oorgos.org` — Console の `WIRE_CONSOLE_OIDC_ISSUER` と一致）
  - `COMMUNITY_CONSOLE_OIDC_AUDIENCE=orgos-operator-console`
- テナント `data/org/operators.yaml` に Google ログインと同じ `email` を登録（または `User.orgosOperatorId`）
- My Page の Wire／予実は `/ops/console/start` → Console `/auth/community-handoff`（仮の UserID／passkey 不要）

**フォールバック（Docker 不可時のみ）:** `OS_Steward/scripts/start-operator-console-local.sh`（:9470 占有時は代替ポートへ逃げず失敗する）。

マイページ運用ハブは `/health` が取れないとき **Console の primary CTA を出さず**、ドキュメントリンクと「未起動」注記のみにする（死リンク防止）。

正本イメージは `OS_Steward/deploy/operator/Dockerfile`（`orgos-operator-console:local`）。旧 `node:22` bind-mount は廃止。
### 安定化チェック（短）

```bash
curl -sf http://localhost:3000/api/health
curl -sf https://community.oorgos.org/api/health
# schema 変更後
docker compose up -d --force-recreate web
docker compose up -d --force-recreate cloudflared-inc
# Console（統合スタック）
curl -sf http://127.0.0.1:9470/health || curl -sf http://127.0.0.1:9471/health
curl -sf -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4178/
# oorgos.org
curl -sf -o /dev/null -w "%{http_code}\n" https://oorgos.org/
```

**Vercel（oorgos.org）:** `cd sites/coming-soon && npx vercel@latest deploy --prod --yes`（**ホーム `~` から実行しない**）。Community 稼働表示はブラウザから `community.oorgos.org/api/health` を CORS で確認（Vercel サーバーからは Tunnel に届かない）。

## 5. OAuth

| プロバイダ | Callback |
|-----------|----------|
| Google | `https://community.oorgos.org/api/auth/callback/google` |
| GitHub | `https://community.oorgos.org/api/auth/callback/github` |
| LinkedIn | `https://community.oorgos.org/api/auth/callback/linkedin` |

## 注意

- `oorgos.org` ゾーンの Cloudflare アカウントと Tunnel アカウントを **一致** させる
- 旧 `openorgos-net` Tunnel の `oorgos.org` hostname は **使わない**
