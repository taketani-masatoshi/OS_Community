# Web 安定性チェックリスト

OpenOrgOS Community Web（`apps/web`）の開発・デモ・本番運用前に確認する項目一覧。

**リファクタ要件・チケット**: [web-stability-refactor-requirements.md](./plans/web-stability-refactor-requirements.md) / [web-stability-refactor-tickets.md](./plans/web-stability-refactor-tickets.md)  
**ベースライン計測**: `npm run audit:web-stability:write`

---

## 1. 開発環境の起動（毎日 / セッション開始時）

- [ ] Docker Desktop が起動している
- [ ] Docker スタック起動: `docker compose up -d`（Caddy が HTTPS 終端）
- [ ] DB スキーマ同期: `npm run db:push -w @os-community/db`（schema 変更後・web 起動時も自動実行）
  - [ ] 環境変数（`.env`）— **アクセス URL と一致させる**:
  - **ローカル HTTPS（Caddy）**: `AUTH_URL=https://localhost` / `NEXT_PUBLIC_SITE_URL=https://localhost`
  - **本番ドメイン（例: openorgos.net + Cloudflare Tunnel）**: `AUTH_URL=https://openorgos.net` / `NEXT_PUBLIC_SITE_URL=https://openorgos.net`
  - [ ] `DATABASE_URL=postgresql://oscommunity:oscommunity@localhost:5432/oscommunity`
  - [ ] `AUTH_SECRET`（32 文字以上）
  - [ ] **OpenOrgOS ログイン**: `AUTH_GOOGLE_*` / `AUTH_GITHUB_*` / `AUTH_LINKEDIN_*`（いずれか）
    - [ ] Google セットアップ: `npm run auth:primary:setup` または [google-oauth-setup.md](./google-oauth-setup.md)
    - [ ] LinkedIn セットアップ: `npm run auth:linkedin:setup` または [linkedin-oauth-setup.md](./linkedin-oauth-setup.md)
    - [ ] 本番 callback: `https://openorgos.net/api/auth/callback/{google|github|linkedin}`
    - [ ] ローカル callback: `http://localhost:3000/api/auth/callback/{google|github|linkedin}`
  - [ ] `AUTH_LINKEDIN_ID` / `AUTH_LINKEDIN_SECRET`（LinkedIn Connect を試す場合）
  - [ ] GitHub OAuth callback: `{AUTH_URL}/api/auth/callback/github`
  - [ ] `ACADEMY_API_URL`（Academy 利用時）
  - [ ] `ACADEMY_INTERNAL_TOKEN`（試験採点・発行時）
- [ ] **`npm run build` と `npm run dev` を同時に走らせない**（`.next` 競合で 500 になる）
- [ ] 疎通確認:
  - [ ] `https://localhost/` → 200（初回は自己署名証明書の警告を許可）
  - [ ] `https://openorgos.net/` → 200（**要** `./scripts/setup-local-southwood-hosts.sh`。未設定だと Cloudflare 530）
  - [ ] 証明書警告を消す: `./scripts/trust-caddy-local-ca.sh`（全ブラウザ共通）
  - [ ] `http://localhost/` → `https://localhost/` へリダイレクト
  - [ ] `https://localhost/login` → 200

### Node 直実行（Docker なし）の場合

```bash
docker compose up db -d
cd apps/web && npm run dev
# http://localhost:3000 — AUTH_URL も http://localhost:3000 に合わせる
```

### dev 再起動手順（500 / ENOENT が出たとき）

```bash
docker compose up -d --force-recreate web caddy
```

---

## 2. コード変更後（PR / マージ前）

- [ ] `npm run quality` — i18n + lint + unit + build + prod compose 検証
- [ ] `npm run quality:full` — 上記 + 異常系 E2E（`e2e/resilience.spec.ts`、DB seed 要）
- [ ] `npm run audit:web-stability:write` — 安定性ベースライン更新（STAB チケット作業時）
- [ ] `npm run lint`
- [ ] `npm run test -w @os-community/web`（identity 含む unit tests）
- [ ] `npm run build -w @os-community/web`
- [ ] 主要ページ目視（ja / en 切替）:
  - [ ] `/` ホーム
  - [ ] `/governance` ガバナンス
  - [ ] `/academy` Academy
  - [ ] `/admin` 管理（ADMIN ログイン時）
  - [ ] `/admin/users` ユーザー管理
- [ ] i18n 品質ゲート（CI と同じ）:
  - [ ] `npm run i18n:sync` — 辞書生成・未翻訳 fill・bundles 再生成・strict チェック・API エラーチェック
  - [ ] 新規 API エラーは `i18n/en/errors.json` + `apiErrorResponse(code, status)` を使用

---

## 3. 認証・管理機能（ADMIN）

- [ ] Google / GitHub / LinkedIn のいずれかでログインできる
- [ ] ログイン後、Connections から追加アカウントを連携できる
- [ ] GitHub OAuth でログインできる（暫定モード時）または Connections から連携できる
- [ ] 非 ADMIN は `/admin/users` にアクセスできない（`/` へ redirect）
- [ ] `CERT_REVIEWER` は `/admin` のみ、`/admin/users` リンク非表示
- [ ] 役割変更:
  - [ ] 正常更新 → 監査ログに記録
  - [ ] 同じロールで更新 → 「更新しました」が出ない
  - [ ] 最後の ADMIN 降格 → 409 / エラーメッセージ
  - [ ] ADMIN 付与 → 確認ダイアログ
- [ ] `/admin/users?page=999` → 空表示にならず正しいページへ

---

## 4. 外部依存

| 依存 | 停止時の影響 | 確認方法 |
|------|-------------|----------|
| PostgreSQL | ログイン・管理・進捗保存不可 | `docker compose ps` |
| GitHub OAuth | ログイン不可 | `/login` → Sign in |
| Academy Content API | レッスン・試験 503 | `ACADEMY_API_URL` curl |

---

## 5. 本番デプロイ前（staging / production）

### インフラ

- [ ] `docker-compose.prod.yml` または VPS 手順（`docs/staging-deploy.md` 参照）
- [ ] `AUTH_SECRET` を本番用に再生成（dev と共用しない）
- [ ] `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` を本番ドメインに設定
- [ ] PostgreSQL バックアップ手順・復旧テスト
- [ ] HTTPS / リバースプロキシ（nginx 等）
- [ ] 監視・アラート（uptime、5xx 率、DB 接続）

### CI

- [ ] `.github/workflows/ci.yml` が green
- [ ] `npm run build` が CI 上で成功
- [ ] deploy ジョブを placeholder から実装に差し替え

### セキュリティ

- [ ] `.env` / シークレットが git に含まれていない
- [ ] ADMIN アカウントが 2 名以上（単一障害点回避）
- [ ] 公開 `/members` の siteRole 表示がポリシー上問題ないか

### 未実装（本番 SLA 前に検討）

- [x] 管理画面 E2E（Playwright）— `e2e/governance.spec.ts`、CI `e2e` ジョブ
- [x] レート制限（管理 API）— `lib/rate-limit.ts`、60 req/min
- [x] ユーザー停止・削除 — `/api/admin/users/[id]` POST/DELETE、管理 UI
- [x] 監査ログのエクスポート — `GET /api/admin/audit/role-changes?format=csv`
- [x] standards / readiness i18n — ライフサイクル・Readiness 表のローカライズ
- [x] 9 言語 governance 表の残存英語修正（役割名・promotionFlow・permissionHeaders 等）
- [x] Academy API エラー i18n — `QUIZ_PREREQUISITE` / `EXAM_ALREADY_PASSED`（8 言語、strict チェック pass）

---

## 6. 障害時クイック診断

| 症状 | 第一候補 | 対処 |
|------|----------|------|
| `Can't reach database server at localhost:5432` | PostgreSQL 停止 | Docker Desktop 起動 → `npm run db:ensure` または `docker compose up db -d` |
| `/login` や `/admin` が 500、`.next/routes-manifest.json` ENOENT | build と dev 競合 | dev 停止 → `rm -rf .next` → dev 再起動 |
| Academy 503 | `ACADEMY_API_URL` 未設定 / API 停止 | `.env` 確認、API 起動 |
| GitHub ログイン失敗 | OAuth App 設定不一致 / 502 | `node scripts/check-github-auth.mjs` → Callback `https://openorgos.net/api/auth/callback/github`、**https://openorgos.net/login** からログイン |
| `https://openorgos.net` が 530 / 開かない | DNS が Cloudflare 向き（`/etc/hosts` 未設定） | `./scripts/setup-local-southwood-hosts.sh` → ブラウザ再起動 |

---

## 7. 定期確認（週次・リリース前）

- [ ] `npm run test -w @os-community/web`
- [ ] `npm run build`
- [ ] DB seed / モジュール同期が必要なら `npm run db:seed`
- [ ] 創設者・ADMIN アカウントが意図どおり存在する
- [ ] 監査ログ（`/admin/users` 下部）に異常な役割変更がない

---

## 8. Identity 3レイヤー（C MVP）

- [ ] `npm run db:push` 後 `node scripts/backfill-public-slugs.mjs`（既存ユーザー）
- [ ] `/settings/connections` — Community / Professional / Technical カード
- [ ] LinkedIn Connect（GitHub ログイン後のみ）— `docs/linkedin-oauth-setup.md`
- [ ] `/users/{slug}` — 旧 githubLogin URL が canonical `publicSlug` へ永久リダイレクト
- [ ] `/experts?linkedin=1` / `?github=1` フィルタ
- [ ] `npm run test:e2e -w @os-community/web` — `e2e/identity.spec.ts`
- [ ] リリース手順: `docs/plans/identity-mvp-release-runbook.md`

---

## 参考

- Academy 運用: `docs/runbook-academy.md`
- Identity MVP リリース: `docs/plans/identity-mvp-release-runbook.md`
- Identity チケット状況: `docs/plans/identity-mvp-ticket-status.md`
- LinkedIn OAuth: `docs/linkedin-oauth-setup.md`
- Academy 連携: `docs/academy-integration.md`
- Staging デプロイ: `docs/staging-deploy.md`
