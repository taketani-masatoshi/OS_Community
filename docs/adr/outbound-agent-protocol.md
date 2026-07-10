# ADR: Outbound Agent Protocol（Mac mini ↔ control.southwood.cloud）

## Status

**Accepted** — v1.0 スケルトン実装済み（`apps/cloud-control` · `apps/org-agent`）。  
本 ADR がプロトコルの正本。実装はこれに追随する。

## 関連

- [OrgOS ハイブリッドデプロイメント要件](../plans/orgos-hybrid-deployment-requirements.md)
- [cloud-stack-readme](../plans/cloud-stack-readme.md)
- 実装: `apps/cloud-control/src/server.js` · `apps/org-agent/src/agent.js`

---

## Context

各社 OrgOS（Org Runtime + Console）は **自社 Mac mini 上** にデプロイし、業務データ正本はローカル DB に保持する（[Openness Policy](../../content/published/docs/openness-policy.md)）。

一方 `{org-slug}.southwood.cloud` 経由で Console に到達するには、Mac mini 側で **インバウンドポート開放** または **VPN** が必要になる。導入先は IT リテラシーが低く（TCP/IP・Python を説明できない Steward Operator レベル）、Tailscale 等は求めない。

### 要件

| # | 要件 |
|---|------|
| R1 | Mac mini は **Outbound HTTPS のみ**（ルーター設定不要） |
| R2 | Mac mini 側 **Cloudflare Tunnel 不使用** |
| R3 | `{org-slug}.southwood.cloud` で Org Console に到達（データ正本はローカル） |
| R4 | 可視化 **L3 まで** · **L4（リモート操作・指示）は v1 非対応** |
| R5 | Community（`openorgos.net`）と SaaS（`southwood.cloud`）は認証・Cookie 分離 |

### 検討した代替案

| 案 | 却下理由 |
|----|----------|
| Mac mini 側 Cloudflare Tunnel | 設定・資格情報管理が Steward Operator に重い |
| Tailscale / WireGuard VPN | IT 不在前提に合わない |
| SaaS へ DB レプリケーション | 業務データ正本がクラウドに出る · 要件違反 |
| ポーリングのみ（WebSocket なし） | `{org-slug}` HTTP プロキシのレイテンシ・リアルタイム性が不足 |
| gRPC 双方向ストリーム | ブラウザエッジとの統合が複雑 · v1 は HTTP プロキシ優先 |

---

## Decision

### 1. 通信モデル — **Outbound WebSocket トンネル（OAT v1）**

Mac mini 上の **Org Agent** が `wss://control.southwood.cloud/api/v1/tunnel` へ **常時 Outbound 接続** する。  
Control Plane はこの接続上で **HTTP リクエストを転送** し、`{org-slug}.southwood.cloud` エッジから Org Console（ローカル）へプロキシする。

```text
Browser ──HTTPS──► {org-slug}.southwood.cloud (Caddy / Cloudflare)
                        │
                        ▼
              cloud-control (edge + control API)
                        │
           WebSocket (Outbound · 常時接続)
                        ▲
                        │
              org-agent (Mac mini)
                        │
                        ▼ HTTP (localhost / Docker network)
              Org Console + Org Runtime
```

**原則**: 接続は **Agent → Control Plane のみ** 確立。Control Plane は Agent の IP に直接接続しない。

### 2. プロトコルバージョン

| フィールド | 値 |
|------------|-----|
| `protocolVersion` | `"1.0"` |
| WebSocket パス | `/api/v1/tunnel` |
| エンコード | JSON テキストフレーム（1 フレーム = 1 メッセージ） |

### 3. メッセージ一覧（v1.0）

#### Agent → Control Plane

| type | 用途 | 必須 |
|------|------|:----:|
| `register` | 接続直後の登録 | ○ |
| `heartbeat` | 死活 · バージョン更新 | ○ |
| `response` | HTTP プロキシ応答 | ○ |
| `telemetry` | L2/L3 集計データの **Agent 発プッシュ** | Phase 2 |

#### Control Plane → Agent

| type | 用途 | 必須 |
|------|------|:----:|
| `registered` | 登録成功 | ○ |
| `heartbeat_ack` | ハートビート応答 | ○ |
| `request` | HTTP プロキシ要求（エッジ → Console） | ○ |
| `error` | 登録失敗等 | ○ |

#### v1 で定義しない（禁止）

| type | 理由 |
|------|------|
| `command` | L4 リモート操作禁止 |
| `config_patch` | Control Plane から Org 設定変更禁止 |
| `exec` | 任意コマンド実行禁止 |

Control Plane から Agent へ送れるのは **`request`（HTTP 転送）のみ**。それ以外の Agent 副作用を伴うメッセージは v1 では追加しない。

---

## 4. メッセージ仕様

### 4.1 `register`（Agent → Control）

接続確立後 **5 秒以内** に 1 回送る。

```json
{
  "type": "register",
  "protocolVersion": "1.0",
  "orgSlug": "demo",
  "token": "<agent-token>",
  "version": "0.1.0",
  "capabilities": ["http_proxy"]
}
```

| フィールド | 制約 |
|------------|------|
| `orgSlug` | `^[a-z0-9-]{2,63}$` · Control Plane 発行と一致 |
| `token` | Org ごとの共有秘密（Mac mini ローカル保存） |
| `capabilities` | v1 は `http_proxy` のみ |

**失敗時**: Control Plane は `error` を返し WebSocket を close（`4401` invalid_token · `4400` invalid_org_slug）。

### 4.2 `registered`（Control → Agent）

```json
{
  "type": "registered",
  "orgSlug": "demo",
  "serverTime": "2026-06-27T06:00:00.000Z"
}
```

### 4.3 `heartbeat` / `heartbeat_ack`

Agent は **15 秒間隔**（`HEARTBEAT_MS`）で送信:

```json
{
  "type": "heartbeat",
  "version": "0.1.0"
}
```

Control Plane:

```json
{ "type": "heartbeat_ack" }
```

**オフライン判定**: 最終 `heartbeat` から **45 秒** 経過で L1 死活は `offline`（接続断と同等）。

### 4.4 `request` / `response`（HTTP プロキシ）

エッジが `{org-slug}.southwood.cloud` へ着信した HTTP を Agent 経由で Console に転送。

**request**（Control → Agent）:

```json
{
  "type": "request",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "method": "GET",
  "path": "/",
  "headers": {
    "host": "demo.southwood.cloud",
    "x-forwarded-host": "demo.southwood.cloud",
    "x-forwarded-proto": "https"
  },
  "body": null
}
```

| フィールド | 制約 |
|------------|------|
| `id` | UUID v4 · リクエスト相関用 |
| `path` | パス + クエリ（例: `/api/status?x=1`） |
| `body` | バイナリは **base64** · 省略時 `null` |
| `headers` | hop-by-hop ヘッダは除外（`connection`, `transfer-encoding` 等） |

**response**（Agent → Control）:

```json
{
  "type": "response",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": 200,
  "headers": { "content-type": "text/html; charset=utf-8" },
  "body": "PGh0bWw+..."
}
```

**タイムアウト**: Control Plane は **30 秒**（`REQUEST_TIMEOUT_MS`）で 504 を返す。

**Agent の転送先**: 環境変数 `LOCAL_CONSOLE_URL`（例: `http://127.0.0.1:3000`）。Host ヘッダは転送先の host に差し替える。

### 4.5 `telemetry`（Agent → Control · Phase 2）

L2/L3 ダッシュボード用。**Agent 発のみ**（Control から要求しない）。

```json
{
  "type": "telemetry",
  "orgSlug": "demo",
  "collectedAt": "2026-06-27T06:00:00.000Z",
  "metrics": {
    "pendingApprovals": 3,
    "openInquiries": 1,
    "eventsThisMonth": 120
  }
}
```

- **D1 機密**（給与・契約全文・PII 原文）は含めない
- 個人名が必要な L3 表示は Phase 2 でマスキング方針を別 ADR

### 4.6 `error`

```json
{
  "type": "error",
  "error": "invalid_token",
  "message": "Agent token rejected"
}
```

| `error` コード | 意味 |
|----------------|------|
| `invalid_token` | 認証失敗 |
| `invalid_org_slug` | slug 形式不正または未登録 |
| `protocol_version` | 未対応 `protocolVersion` |

---

## 5. エッジルーティング

| Host | 処理 |
|------|------|
| `control.southwood.cloud` | Control REST API · WebSocket `/api/v1/tunnel` |
| `dash.southwood.cloud` | L3 ダッシュボード（SaaS 側 · Agent 非経由） |
| `{org-slug}.southwood.cloud` | `orgSlug` 抽出 → 該当 Agent へ `request` 転送 |
| `southwood.cloud` | ランディング |

`orgSlug` 抽出: ホスト名から `.southwood.cloud` サフィックスを除去。`control` · `dash` · `www` は除外。

**Agent 未接続時**: HTTP **502** · body `Org agent offline: {org-slug}`

---

## 6. セキュリティ

| 項目 | v1 方針 |
|------|---------|
| 通信 | 本番 **WSS + TLS 1.2+**（Cloudflare 終端 → origin） |
| Agent 認証 | Org ごと `AGENT_TOKEN`（共有秘密）— Phase 2 で JWT + ローテーション |
| 接続数 | **1 orgSlug = 1 アクティブ Agent** · 新接続で旧接続を close |
| フレームサイズ上限 | **1 MiB**（超過は close `1009`） |
| Control → Agent | **`request` のみ**（L4 禁止） |
| SaaS データ | D1 は Agent から送信しない · `telemetry` は集計のみ |
| Cookie 分離 | `.southwood.cloud` と `.openorgos.net` 共有しない |

### L3 / L4 の境界（重要）

| 経路 | 許可 | 備考 |
|------|------|------|
| `dash.southwood.cloud` | L1–L3 **read-only 表示** | Slack 通知 · キュー可視化 |
| `{org-slug}.southwood.cloud` → Console | Console UI への HTTP プロキシ | ログイン済み Console 上の操作は **Org ローカル認証** の範囲 |
| Control Plane からの `command` 等 | **禁止** | 外部からの「指示」チャネルとして使わない |

v1 では `{org-slug}` プロキシは Console UI 到達用。**Phase 2** で外部向け GET のみ許可リストを検討可能。

---

## 7. 再接続・可用性

| 項目 | 値 |
|------|-----|
| Agent 再接続間隔 | 5 秒（指数バックオフ上限 60 秒 · Phase 2） |
| Heartbeat 間隔 | 15 秒 |
| オフライン閾値 | 45 秒 |
| Mac mini 停止 | LAN 内 Console は継続 · エッジ `{org-slug}` は 502 |
| Control Plane 停止 | Agent は再接続ループ · エッジ不可 · LAN 内 Console は継続 |

---

## 8. Control Plane REST API（参考）

Agent 接続状態の参照（認証は Phase 2）:

| Method | Path | 説明 |
|--------|------|------|
| GET | `/health` | Control Plane 死活 |
| GET | `/api/v1/agents` | 接続中 Agent 一覧 |
| GET | `/api/v1/orgs/{orgSlug}` | Org 接続状態 · `consoleUrl` |

---

## 9. 環境変数

### Org Agent（Mac mini）

| 変数 | 例 | 説明 |
|------|-----|------|
| `CONTROL_PLANE_URL` | `wss://control.southwood.cloud/api/v1/tunnel` | WebSocket URL |
| `LOCAL_CONSOLE_URL` | `http://127.0.0.1:3000` | 転送先 Console |
| `ORG_SLUG` | `demo` | Org 識別子 |
| `AGENT_TOKEN` | *(secret)* | 登録トークン |
| `AGENT_VERSION` | `0.1.0` | Agent バージョン |
| `HEARTBEAT_MS` | `15000` | ハートビート間隔 |

### cloud-control

| 変数 | 例 | 説明 |
|------|-----|------|
| `CLOUD_DOMAIN` | `southwood.cloud` | ベースドメイン |
| `AGENT_TOKEN` | *(secret)* | v1 共有検証（Phase 2 で per-org） |
| `REQUEST_TIMEOUT_MS` | `30000` | プロキシタイムアウト |

---

## 10. 実装ロードマップ

| Phase | 内容 |
|-------|------|
| **v1.0（現在）** | WebSocket トンネル · HTTP プロキシ · heartbeat · スケルトン実装 |
| **v1.1** | `protocolVersion` 協商 · per-org token（DB） · 1 MiB フレーム制限 |
| **v1.2** | `telemetry` プッシュ · dash 連携 |
| **v2.0** | mTLS / JWT · 外部向け HTTP メソッド allowlist · 指数バックオフ |

---

## Consequences

### Positive

- Mac mini は **Outbound 443 のみ** — ファイアウォール変更不要
- `{org-slug}.southwood.cloud` を IT 不在でも利用可能
- 業務データ正本はローカル維持 · Control Plane は転送のみ
- スケルトンが既に動作検証済み（`demo.southwood.cloud` → Console stub）

### Negative / トレードオフ

- Control Plane 障害でエッジ Console 到達不可（LAN 内は継続）
- WebSocket 常時接続 — Mac mini ネットワーク断で 502
- v1 `AGENT_TOKEN` は Org 共通 secret — 漏洩時は Org 単位でローテーション必要
- 大容量ファイルアップロードは 1 MiB 制限と相性悪い — Phase 2 でチャンクまたは別経路

### 実装側の追随タスク

- [ ] `protocolVersion` フィールドを register に追加（server / agent）
- [ ] フレームサイズ 1 MiB 上限の enforce
- [ ] per-org token を cp-db に移行
- [ ] `telemetry` メッセージ処理（Phase 2）
- [ ] 共有型定義 `packages/shared/src/cloud-agent-protocol.ts`（任意）

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-27 | v1.0 Accepted — スケルトン実装を反映して初版 |
