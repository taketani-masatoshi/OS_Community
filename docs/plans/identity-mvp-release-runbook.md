# C MVP リリース Runbook（3レイヤー Identity）

方針 C MVP（Community / Professional / Technical）を **staging → production** へ安全に出す手順です。

関連: [identity-3layer-roadmap.md](./identity-3layer-roadmap.md) · [ADR](../adr/identity-3layer.md) · [LinkedIn OAuth](../linkedin-oauth-setup.md)

---

## 1. リリース前チェック（開発者）

```bash
cd /Users/kk/OS_Community
npm run i18n:sync
npm run lint
npm run test -w @os-community/web
npm run build
npm run test:e2e -w @os-community/web   # ローカル: DB 起動 + seed 推奨
```

- [ ] CI の `build` / `e2e` ジョブが green
- [ ] `docs/web-stability-checklist.md` の Identity セクションを確認

---

## 2. Staging デプロイ

### 2.1 環境変数

| 変数 | 必須 | 備考 |
|------|------|------|
| `AUTH_SECRET` | ✓ | 32 文字以上、本番と別値 |
| `AUTH_URL` | ✓ | `https://staging.example` |
| `NEXT_PUBLIC_SITE_URL` | ✓ | 同上 |
| `DATABASE_URL` | ✓ | staging PostgreSQL |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | ✓ | callback = `{AUTH_URL}/api/auth/callback/github` |
| `AUTH_LINKEDIN_ID` / `AUTH_LINKEDIN_SECRET` | △ | Connect 機能を試す場合のみ |

```bash
node scripts/check-github-auth.mjs
```

### 2.2 DB マイグレーション

```bash
set -a && . ./.env && set +a
npm run db:push
node scripts/backfill-public-slugs.mjs
npm run db:seed    # 初回 or 空 DB のみ
```

**slug backfill** は idempotent。`publicSlug` が null のユーザーのみ更新。

### 2.3 アプリ再起動

```bash
docker compose up -d --force-recreate web
# または staging のデプロイ手順（docs/staging-deploy.md）
```

---

## 3. Staging 手動 QA（ID-020 チェックリスト）

### Community レイヤー

- [ ] 既存ユーザー全員に `publicSlug` が付与されている（管理 SQL or spot check）
- [ ] `/users/{旧githubLogin}` → `/users/{publicSlug}` へ **308 永久リダイレクト**
- [ ] 創設者 `/users/taketani-masatoshi` が表示される

### GitHub（Technical）

- [ ] **https://{site}/login** から GitHub サインイン（localhost 不可の本番構成）
- [ ] プロフィール完成後 `/github` からリポ連携
- [ ] Contributor 申請 API が未ログイン / 非 GitHub で `GITHUB_LOGIN_REQUIRED`

### LinkedIn（Professional）

- [ ] `/settings/connections` — 3 レイヤーカード表示
- [ ] Connect LinkedIn → 認可 → Professional 連携済み
- [ ] Disconnect → 公開プロフィールから Professional カード消失
- [ ] LinkedIn **単独ログイン不可**（GitHub セッション必須）

### 公開 UI

- [ ] 公開プロフィール: Professional / Technical カード（連携時）
- [ ] マイページ: レイヤー完成度 + `/settings/connections` CTA
- [ ] `/experts?linkedin=1` / `?github=1` フィルタ

### i18n

- [ ] ja / en で Settings・Experts フィルタ表示
- [ ] `npm run i18n:sync` green

---

## 4. Production デプロイ

1. staging QA 完了
2. production `.env` に LinkedIn / GitHub を反映（本番 callback URL）
3. **メンテナンス不要** — スキーマ追加のみ（`publicSlug`, `ProfessionalProfile`）
4. デプロイ順:

```bash
npm run db:push
node scripts/backfill-public-slugs.mjs
docker compose -f docker-compose.prod.yml up -d --build
```

5. デプロイ直後 smoke test:
   - `/login` → GitHub
   - `/settings/connections`
   - `/experts`
   - 既知ユーザーの `/users/{slug}` redirect

---

## 5. ロールバック方針

| 障害 | 対処 |
|------|------|
| Web のみ不具合 | 前バージョンイメージにロールバック（DB 変更は後方互換） |
| slug backfill 問題 | 問題ユーザー `publicSlug` を SQL で修正；旧 URL は `resolveUserBySlug` が githubLogin でも解決 |
| LinkedIn Connect 障害 | `.env` から `AUTH_LINKEDIN_*` を外し web 再起動（GitHub ログインは継続） |
| スキーマ障害 | `ProfessionalProfile` テーブル削除は **データ損失** — バックアップ復元を優先 |

**注意**: `publicSlug` 列削除は MVP 後方互換を壊すため非推奨。

---

## 6. MVP 完了定義（DoD）照合

| 項目 | 確認 |
|------|------|
| publicSlug + 旧 URL redirect | backfill + permanentRedirect |
| GitHub ログイン維持 | `/login` |
| LinkedIn Connect / Disconnect | `/settings/connections` |
| 公開プロフィール 3 レイヤー | Community 既存 + Pro/Tech カード |
| マイページ CTA | MyPageLayerStatus |
| `/experts` フィルタ | `?linkedin=1&github=1` |
| i18n / build / tests | CI green |
| LinkedIn ログイン | **含めない**（Phase 6） |

---

## 7. Phase 6 判断ゲート（リリース後）

以下が揃うまで ID-022〜024 に着手しない:

1. 専門家候補から LinkedIn 単独ログイン要望が一定数
2. Connect 率がボトルネックと判断（例: プロフィール完成者の 20% 未満）
3. アカウントマージのサポート手順が運用可能

詳細: [identity-3layer-roadmap.md §判断ゲート](./identity-3layer-roadmap.md)

---

## 8. 連絡・エスカレーション

- GitHub OAuth 404: [github-oauth-setup.md](../github-oauth-setup.md)
- LinkedIn Connect: [linkedin-oauth-setup.md](../linkedin-oauth-setup.md)
- 認可エラー（openorgos.net）: ブラウザ Cookie 削除 → 本番 URL から再ログイン
