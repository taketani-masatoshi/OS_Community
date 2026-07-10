# Academy 運用 Runbook

## ヘルスチェック

| 対象 | URL | 期待 |
|------|-----|------|
| Content API liveness | `GET /health` | `{ "status": "ok" }` |
| Content API readiness | `GET /ready` | 200 + `ready: true` |
| Community BFF | `GET /api/academy/tracks` | 200 or 503（API 未設定） |

## 障害パターン

### `/academy` が 503

- `ACADEMY_API_URL` 未設定 → `.env` を確認
- Content API 停止 → `npm run serve` または compose 再起動

### 採点が 503

- `ACADEMY_INTERNAL_TOKEN` が Content API と不一致
- internal ルートは本番で VPC 内のみ公開

### 進捗が保存されない

- ユーザー未ログイン
- DB マイグレーション未適用 → `npm run db:push -w @os-community/db`

## ログ

Content API は JSON 構造化ログ（`requestId`, `path`, `status`, `durationMs`）。

## セキュリティ

- 正答は `/internal/v1/exams/grade` のみ（`X-Internal-Token` 必須）
- 公開 `/v1/exams/forms` は redact 済み

## 監視推奨

- Content API `/ready` が 503 連続
- BFF `/api/academy/exams/grade` 5xx 率
- Postgres 接続エラー
