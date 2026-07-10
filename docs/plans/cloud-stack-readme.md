# southwood.cloud SaaS スタック

MacBook Air 上で OrgOS 補助 SaaS（Control Plane · エッジプロキシ · L3 ダッシュボード）を Docker で動かす手順。

要件定義: [orgos-hybrid-deployment-requirements.md](./orgos-hybrid-deployment-requirements.md)

## アーキテクチャ（スケルトン）

```text
Browser
  → {org-slug}.southwood.cloud (Caddy · Cloudflare Tunnel)
  → cloud-control (edge proxy)
  ← WebSocket Outbound ← org-agent (Mac mini / dev stub)
  → Org Console (local · データ正本)
```

| サービス | 役割 |
|----------|------|
| `cloud-control` | Control API + `{org-slug}` エッジプロキシ |
| `cloud-dash` | L3 read-only ダッシュボード |
| `cp-db` | Control Plane メタデータ（将来） |
| `org-agent` | Mac mini 側 Outbound エージェント（`--profile dev`） |
| `org-console-stub` | 開発用 Org Console スタブ |

## クイックスタート（Phase 1 ローカル検証）

```bash
cp .env.cloud.example .env.cloud
./scripts/setup-local-southwood-cloud-hosts.sh   # /etc/hosts
./scripts/start-cloud-stack.sh                   # dev profile 込み（project: os-cloud）
```

確認:

```bash
curl -sk https://control.southwood.cloud:8443/health
curl -sk https://demo.southwood.cloud:8443/
open https://dash.southwood.cloud:8443/
```

`demo.southwood.cloud` が Org Console スタブを表示すれば Phase 1 短期目標達成。

## 本番（Phase 2 · Cloudflare Tunnel）

1. `cloudflared tunnel create southwood-cloud`（**openorgos.net とは別 ID**）
2. Cloudflare DNS: `control` / `dash` / `*` → Tunnel
3. Tunnel ingress を `https://localhost:8443`（Caddy）に向ける
4. `.env.cloud` に `CLOUDFLARE_TUNNEL_ID` を設定
5. `./scripts/start-cloudflare-tunnel-cloud.sh`

## Mac mini（本番 Org Agent）

Mac mini 側 Cloudflare Tunnel は **使わない**。Outbound WebSocket のみ:

```bash
docker run --rm \
  -e CONTROL_PLANE_URL=wss://control.southwood.cloud/api/v1/tunnel \
  -e LOCAL_CONSOLE_URL=http://127.0.0.1:3000 \
  -e ORG_SLUG=your-org \
  -e AGENT_TOKEN=your-production-token \
  os-community/org-agent
```

## 関連ファイル

| ファイル | 内容 |
|----------|------|
| `docker-compose.cloud.yml` | SaaS スタック定義（Compose project: `os-cloud`） |
| `deploy/Caddyfile.cloud` | サブドメインルーティング |
| `.env.cloud.example` | 環境変数テンプレート |
| `apps/cloud-control/` | Control Plane + エッジ |
| `apps/org-agent/` | Outbound エージェント |

## 関連 ADR

- [Outbound Agent Protocol (OAT v1.0)](../adr/outbound-agent-protocol.md) — Mac mini ↔ control.southwood.cloud

## 次の実装

- [ ] per-org `AGENT_TOKEN` を cp-db に移行
- [ ] `telemetry` メッセージ（L2/L3 プッシュ）
- [ ] `dash.southwood.cloud` 認証（Magic Link / Google / Microsoft）
- [ ] Slack 連携 · 外部キュー L3 可視化
