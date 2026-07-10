# ID-008: Docs — LinkedIn OAuth セットアップ

**ID**: ID-008
**Phase**: 2 (C MVP)
**Estimate**: 0.5d
**Labels**: identity, docs, linkedin
**Depends**: ID-001

## 目的

LinkedIn Developer App 作成手順と env 変数を GitHub OAuth ドキュメントと同レベルで整備する。

## タスク

- [ ] `docs/linkedin-oauth-setup.md` 作成
- [ ] env: `AUTH_LINKEDIN_ID`, `AUTH_LINKEDIN_SECRET`
- [ ] callback: `https://openorgos.net/api/auth/callback/linkedin`
- [ ] `scripts/check-linkedin-auth.mjs`（任意・GitHub 版を参考）
- [ ] Sign In with LinkedIn v2 の取得フィールド制限を記載

## 受け入れ条件

- [ ] 開発者がドキュメントのみで LinkedIn App を作成できる
- [ ] MVP スコープ（Connect のみ、ログイン不可）が明記されている
