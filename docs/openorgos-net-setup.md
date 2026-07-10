# openorgos.net 公開手順（localhost:3000 → インターネット）

メインドメイン: **https://openorgos.net**

## Mac 側（済み）

- `.env`: `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` / `DOMAIN` = `openorgos.net`
- Tunnel ingress: `openorgos.net` / `www.openorgos.net` → `localhost:3000`
- 確認: `./scripts/verify-openorgos-org.sh`
- 再起動: `./scripts/restart-community-web.sh`

## Cloudflare ダッシュボード（要作業）

### Step 1 — NS をレジストラで Cloudflare 向けに変更

1. Cloudflare → **openorgos.net** → **Overview**
2. 表示された NS 2 つをコピー
3. ドメイン購入先で NS を変更
4. 確認: `dig +short openorgos.net NS`

### Step 2 — Public Hostname（Zero Trust → Networks → Tunnels → openorgos-net）

| Subdomain | Domain | URL |
|-----------|--------|-----|
| `@` | openorgos.net | `host.docker.internal:3000` |
| `www` | openorgos.net | `host.docker.internal:3000` |

### Step 3 — 確認

```bash
curl -sI https://openorgos.net
./scripts/verify-openorgos-org.sh
```

### Step 4 — OAuth callback

| プロバイダ | URL |
|-----------|-----|
| Google | `https://openorgos.net/api/auth/callback/google` |
| GitHub | `https://openorgos.net/api/auth/callback/github` |
| LinkedIn | `https://openorgos.net/api/auth/callback/linkedin` |

ログイン: **https://openorgos.net/login**
