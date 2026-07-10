# ID-009: LinkedIn Connect OAuth フロー

**ID**: ID-009
**Phase**: 2 (C MVP)
**Estimate**: 2d
**Labels**: identity, auth, linkedin
**Depends**: ID-008, ID-005

## 目的

LinkedIn を **ログインプロバイダにせず**、既存 GitHub ログインユーザーが Connect できる OAuth フローを実装する。

## タスク

- [ ] NextAuth LinkedIn provider を `link` 用途で追加（signIn callback で既存 session 必須）
- [ ] または dedicated `/api/user/linkedin/connect` + OAuth state
- [ ] Connect 完了で `Account` + `ProfessionalProfile` upsert
- [ ] Disconnect で Account / Profile 削除（監査ログ検討）
- [ ] CSRF / state 検証

## 受け入れ条件

- [ ] GitHub ログイン済みユーザーが LinkedIn Connect できる
- [ ] 未ログインで Connect 開始 → login へ誘導
- [ ] **LinkedIn のみではサイトにログインできない**（MVP）

## 注意

Phase 6（ID-022）まで LinkedIn sign-in は有効化しない。
