# Identity C MVP — チケット状況（2026-06-26 更新）

[ロードマップ](./identity-3layer-roadmap.md) の ID-001〜021 を再整理したステータスです。

## サマリー

| 状態 | 件数 | ID |
|------|------|-----|
| ✅ 完了 | 19 | ID-001〜019 |
| ✅ 完了（今回） | 2 | ID-020, ID-021 |
| ⏳ 運用待ち | 1 | DB backfill / 本番デプロイ |
| 🔮 Phase 6+ | 6 | ID-022〜027 |

**C MVP コード実装は完了**。本番反映は [identity-mvp-release-runbook.md](./identity-mvp-release-runbook.md) に従う。

---

## Phase 1 — Community ID（完了）

| ID | タイトル | 状態 | 備考 |
|----|---------|------|------|
| ID-001 | ADR 3レイヤー | ✅ | `docs/adr/identity-3layer.md` |
| ID-002 | Schema publicSlug + ProfessionalProfile | ✅ | `schema.prisma` |
| ID-003 | Migration / backfill | ✅ コード | **本番で** `db:push` + `backfill-public-slugs.mjs` 要実行 |
| ID-004 | Slug 解決 refactor | ✅ | `users.ts`, `getUserProfilePath`, experts `publicSlug` |
| ID-005 | Settings connections 骨格 | ✅ | `/settings/connections` |
| ID-006 | JWT layer claims | ✅ | `auth.ts` / `auth.config.ts` |

## Phase 2 — LinkedIn Connect（完了）

| ID | タイトル | 状態 | 備考 |
|----|---------|------|------|
| ID-008 | LinkedIn OAuth docs | ✅ | `docs/linkedin-oauth-setup.md` |
| ID-009 | Connect OAuth フロー | ✅ | signIn 拒否 + linkAccount |
| ID-010 | ProfessionalProfile API | ✅ | GET/DELETE `/api/user/professional-profile` |
| ID-011 | Settings LinkedIn UI | ✅ | Connect / Disconnect ボタン |
| ID-012 | 公開 Pro カード | ✅ | `/users/[slug]` |

## Phase 3 — GitHub Technical（完了）

| ID | タイトル | 状態 | 備考 |
|----|---------|------|------|
| ID-007 | requireGitHubLoginApi | ✅ | `session.ts` |
| ID-013 | Settings GitHub section | ✅ | connections ページ Technical カード |
| ID-014 | API GitHub 必須化 | ✅ | `github/connect`, `module-roles/request` |
| ID-015 | 公開 Tech カード | ✅ | `/users/[slug]` |

## Phase 4 — 横断 UI（完了）

| ID | タイトル | 状態 | 備考 |
|----|---------|------|------|
| ID-016 | 公開 3 レイアウト + redirect | ✅ | `permanentRedirect` to canonical slug |
| ID-017 | マイページ完成度 | ✅ | `MyPageLayerStatus` |
| ID-018 | /experts フィルタ | ✅ | `?linkedin=1&github=1` |

## Phase 5 — MVP 出荷（完了）

| ID | タイトル | 状態 | 備考 |
|----|---------|------|------|
| ID-019 | i18n 9 言語 | ✅ | `identity-layer-translations.mjs`, `i18n:sync` pass |
| ID-020 | Tests | ✅ | `slug.test.ts`, `users.test.ts`, `session.test.ts`, `e2e/identity.spec.ts` |
| ID-021 | Runbook | ✅ | `identity-mvp-release-runbook.md` |

---

## 運用タスク（チケット外）

| タスク | 担当 | 状態 |
|--------|------|------|
| 本番 `npm run db:push` | Ops | ⏳ |
| `node scripts/backfill-public-slugs.mjs` | Ops | ⏳ |
| GitHub OAuth App 404 再設定 | Ops | ⏳ 別件 |
| `gh auth login` → Issue 一括作成 | Dev | 任意 |

---

## Phase 6 以降（未着手）

| ID | タイトル | 依存 |
|----|---------|------|
| ID-022 | LinkedIn ログイン | MVP + 判断ゲート |
| ID-023 | アカウントマージ | ID-022 |
| ID-024 | オンボーディング分岐 | ID-023 |
| ID-025 | メールマジックリンク | Phase 6 |
| ID-026 | ORCID レイヤー | ID-010 |
| ID-027 | 管理 identity 監査 | MVP |

---

## 推奨次アクション

1. **Staging**: runbook §2〜3 を実行
2. **Production**: runbook §4（backfill 含む）
3. **2〜4 週間後**: Connect 率・フィードバックを見て Phase 6 判断
