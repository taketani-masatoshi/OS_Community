# 3レイヤー ID 開発計画（方針 C）

OrgOS Community の identity モデルを **Community（正） / Professional（LinkedIn） / Technical（GitHub）** の 3 レイヤーに再構成する。

## 方針

| 段階 | 内容 | 工数目安 | リリース |
|------|------|---------|---------|
| **C MVP** | 3 レイヤー表示 + LinkedIn **連携** + GitHub **ログイン維持** | 12〜16 人日 | **先に出す** |
| **Phase 6** | LinkedIn **ログイン** + アカウントマージ | +4.5〜7 人日 | 専門家招請の反応を見てから |
| **C 拡張** | メールログイン、ORCID、経歴 API 本格取込 等 | +10〜20 人日 | 別ロードマップ |

## アーキテクチャ概要

```text
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Community ID（openorgos.net 上の正）           │
│  User.id / publicSlug · 役割 · 委員会 · 認定 · Academy   │
└─────────────────────────────────────────────────────────┘
         ▲                          ▲
         │ 連携                      │ 連携
┌────────┴────────┐        ┌─────────┴──────────┐
│ Layer 2:         │        │ Layer 3:            │
│ Professional     │        │ Technical           │
│ LinkedIn OAuth   │        │ GitHub OAuth + repos│
│ headline / 所属  │        │ merge 権限 · repos  │
└──────────────────┘        └─────────────────────┘
```

**C MVP のログイン**: GitHub のみ（現状維持）。LinkedIn は Settings から **Connect** する。

## フェーズ一覧

### Phase 0 — 前提（0.5〜1 人日）

- GitHub OAuth が本番で動作（`check-github-auth.mjs` ✓）

### Phase 1 — Community ID 正規化（4〜5.5 人日）

- `publicSlug` 導入、`/users/[slug]` の中立 URL 化
- 設定 UI 骨格（`/settings/connections`）
- JWT にレイヤー状態を載せる

### Phase 2 — Professional / LinkedIn 連携（4〜6 人日）

- LinkedIn OAuth **連携のみ**（ログイン不可）
- `ProfessionalProfile` 保存・設定 UI
- 公開プロフィール Professional カード

### Phase 3 — Technical / GitHub 整理（2.5〜3.5 人日）

- ログイン GitHub とリポ連携の UI 分離
- `requireGitHubLinked()` を repo / role API に適用
- Technical カード

### Phase 4 — 横断 UI（3〜4 人日）

- 公開プロフィール 3 レイアウト
- マイページ「レイヤー完成度」
- `/experts` フィルタ

### Phase 5 — MVP 出荷（2.5〜3.5 人日）

- i18n（9 言語 strict）
- E2E / 単体テスト
- 移行 runbook・ステージング検証

**→ C MVP リリース（計 12〜16 人日）**

---

### Phase 6 — LinkedIn ログイン（+4.5〜7 人日）※ MVP 後

- LinkedIn を sign-in provider に追加
- GitHub + LinkedIn アカウントマージ
- オンボーディング分岐（専門家 / 開発者）

### Phase 7+ — C 拡張（+10〜20 人日）※ 別判断

- メールマジックリンク
- ORCID レイヤー
- LinkedIn Marketing / 経歴 API（契約次第）
- 管理画面 identity 監査の拡張

## チケット

| ID | タイトル | Phase | 見積 | 依存 |
|----|---------|-------|------|------|
| [ID-001](./tickets/ID-001-adr-3layer-identity.md) | ADR: 3レイヤー identity | 1 | 0.5d | — |
| [ID-002](./tickets/ID-002-schema-public-slug-professional-profile.md) | Schema: publicSlug + ProfessionalProfile | 1 | 1d | ID-001 |
| [ID-003](./tickets/ID-003-migration-backfill-slugs.md) | Migration: slug backfill + redirects | 1 | 1d | ID-002 |
| [ID-004](./tickets/ID-004-slug-resolution-refactor.md) | Refactor: slug 解決・URL 生成 | 1 | 1.5d | ID-003 |
| [ID-005](./tickets/ID-005-settings-connections-shell.md) | Settings: /settings/connections 骨格 | 1 | 1d | ID-001 |
| [ID-006](./tickets/ID-006-jwt-layer-claims.md) | JWT: レイヤー状態 claims | 1 | 1d | ID-002 |
| [ID-007](./tickets/ID-007-require-github-linked-guard.md) | Guard: requireGitHubLinked | 3 | 0.5d | ID-006 |
| [ID-008](./tickets/ID-008-linkedin-oauth-setup-docs.md) | Docs: LinkedIn OAuth セットアップ | 2 | 0.5d | ID-001 |
| [ID-009](./tickets/ID-009-linkedin-connect-oauth-flow.md) | LinkedIn Connect OAuth フロー | 2 | 2d | ID-008, ID-005 |
| [ID-010](./tickets/ID-010-professional-profile-api.md) | API: ProfessionalProfile CRUD | 2 | 1d | ID-009 |
| [ID-011](./tickets/ID-011-settings-linkedin-ui.md) | UI: Settings LinkedIn 連携 | 2 | 1d | ID-010 |
| [ID-012](./tickets/ID-012-public-profile-professional-card.md) | UI: 公開プロフィール Professional | 2 | 1d | ID-010 |
| [ID-013](./tickets/ID-013-settings-github-technical-section.md) | UI: Settings GitHub Technical | 3 | 1d | ID-005, ID-007 |
| [ID-014](./tickets/ID-014-api-github-linked-enforcement.md) | API: GitHub 連携必須化 | 3 | 1d | ID-007 |
| [ID-015](./tickets/ID-015-public-profile-technical-card.md) | UI: 公開プロフィール Technical | 3 | 1d | ID-013 |
| [ID-016](./tickets/ID-016-public-profile-3layer-layout.md) | UI: 公開プロフィール 3 レイアウト | 4 | 1.5d | ID-012, ID-015 |
| [ID-017](./tickets/ID-017-mypage-layer-completion.md) | UI: マイページ レイヤー完成度 | 4 | 1d | ID-006, ID-011 |
| [ID-018](./tickets/ID-018-experts-layer-filters.md) | UI: /experts レイヤーフィルタ | 4 | 1d | ID-010 |
| [ID-019](./tickets/ID-019-i18n-identity-keys.md) | i18n: identity 全言語 | 5 | 1d | ID-016〜018 |
| [ID-020](./tickets/ID-020-tests-identity-layers.md) | Tests: identity E2E + unit | 5 | 2d | ID-016 |
| [ID-021](./tickets/ID-021-mvp-release-runbook.md) | Runbook: MVP リリース | 5 | 0.5d | ID-020 |
| [ID-022](./tickets/ID-022-linkedin-sign-in-provider.md) | **Phase 6** LinkedIn ログイン | 6 | 2d | MVP |
| [ID-023](./tickets/ID-023-account-merge-github-linkedin.md) | **Phase 6** アカウントマージ | 6 | 3d | ID-022 |
| [ID-024](./tickets/ID-024-onboarding-expert-developer-paths.md) | **Phase 6** オンボーディング分岐 | 6 | 1.5d | ID-023 |
| [ID-025](./tickets/ID-025-email-magic-link-login.md) | **拡張** メールログイン | 7+ | 3d | Phase 6 |
| [ID-026](./tickets/ID-026-orcid-professional-layer.md) | **拡張** ORCID レイヤー | 7+ | 4d | ID-010 |
| [ID-027](./tickets/ID-027-admin-identity-audit.md) | **拡張** 管理 identity 監査 | 7+ | 2d | MVP |

## GitHub Issues への登録

```bash
# gh auth login 後
node scripts/create-identity-tickets.mjs --dry-run   # 確認
node scripts/create-identity-tickets.mjs --milestone "Identity C MVP" --phase mvp
node scripts/create-identity-tickets.mjs --milestone "Identity Phase 6" --phase 6
node scripts/create-identity-tickets.mjs --milestone "Identity C Extension" --phase extension
```

## MVP 完了定義（DoD）

- [x] 全ユーザーに `publicSlug` が付与され、旧 `githubLogin` URL から 301 リダイレクト（`permanentRedirect` + backfill スクリプト）
- [x] GitHub ログインは現行どおり動作
- [x] Settings から LinkedIn Connect / Disconnect 可能
- [x] 公開プロフィールに Community / Professional / Technical の 3 セクション
- [x] マイページに未連携レイヤーの CTA
- [x] `/experts` で LinkedIn verified / GitHub connected フィルタ
- [x] `npm run i18n:sync` / `npm run build` / identity E2E green（CI `e2e` + `identity.spec.ts`）
- [x] **LinkedIn ログインは含めない**（Phase 6 へ）

**本番反映**: [identity-mvp-release-runbook.md](./identity-mvp-release-runbook.md) · 状況: [identity-mvp-ticket-status.md](./identity-mvp-ticket-status.md)

## 判断ゲート（MVP → Phase 6）

Phase 6 に進む条件（例）:

1. 専門家候補から「LinkedIn で入りたい」フィードバックが一定数ある
2. LinkedIn Connect 率がプロフィール完成ユーザーの 20% 未満で、ログイン障壁がボトルネックと判断
3. 運用でアカウントマージ手順（サポート）が用意できる
