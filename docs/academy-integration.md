# Academy 連携ガイド

Company OS Academy（OS_Content）と OS_Community Web の連携手順。

## アーキテクチャ

```
Browser → /academy/* (Next.js)
       → /api/academy/* (BFF, 認証・進捗)
       → ACADEMY_API_URL (Content API)
       → content/ exams/ academy/ (Git 正本)
```

進捗・試験結果・認定書は **Community PostgreSQL** が正本です。

## 環境変数

| 変数 | 必須 | 説明 |
|------|:----:|------|
| `ACADEMY_API_URL` | ○ | Content API（例: `http://127.0.0.1:8787`） |
| `ACADEMY_INTERNAL_TOKEN` | ○ | 採点 API 用（Content API と同一値） |
| `ACADEMY_API_TIMEOUT_MS` | | デフォルト 10000 |
| `ACADEMY_CURRICULUM_VERSION` | | pin 用（デフォルト `2026.06.0`） |
| `ACADEMY_EXAM_MAX_ATTEMPTS` | | 再受験上限（デフォルト 3） |
| `ACADEMY_EXAM_COOLDOWN_HOURS` | | 不合格後クールダウン（デフォルト 24） |

## ローカル起動

```bash
# 1. Content API
cd OS_Content
export ACADEMY_INTERNAL_TOKEN=dev-internal-token
npm run serve

# 2. Community DB
cd OS_Community
cp .env.example .env   # ACADEMY_* を設定
npm run db:generate
npm run db:push -w @os-community/db

# 3. Web
npm run dev
```

確認 URL:

- http://localhost:3000/academy
- http://localhost:3000/academy/lessons/lesson-openorgos-philosophy-001
- http://localhost:3000/academy/exams/ccu-v1/form-a（全レッスン完了後）

## DB マイグレーション

```bash
cd OS_Community
npm run migrate -w @os-community/db
# または開発時
npm run db:push -w @os-community/db
```

マイグレーション: `packages/db/prisma/migrations/20260625000000_academy_progress/`

## 主要 API（BFF）

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/academy/tracks` | トラック一覧 |
| GET | `/api/academy/progress?trackId=` | 進捗取得（要ログイン） |
| POST | `/api/academy/progress` | 読了/視聴記録 |
| POST | `/api/academy/exams/grade` | 採点 |
| GET | `/api/academy/certifications?certificationId=CCU` | 発行可否 |
| POST | `/api/academy/certifications` | 認定書発行 |

## Docker（開発スタック）

```bash
cd OS_Content
docker compose --profile dev up
```

Community 連携版は `docker-compose.dev.yml` を参照。
