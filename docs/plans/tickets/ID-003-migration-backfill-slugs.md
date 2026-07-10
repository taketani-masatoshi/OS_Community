# ID-003: Migration — slug backfill + 旧 URL リダイレクト

**ID**: ID-003
**Phase**: 1 (C MVP)
**Estimate**: 1d
**Labels**: identity, database, migration
**Depends**: ID-002

## 目的

既存ユーザー全員に `publicSlug` を付与し、旧 URL 互換を保つ。

## タスク

- [ ] seed / スクリプトで既存 User の slug backfill（founder 特例含む）
- [ ] `githubLogin` が slug のユーザーは同一値 or 別 slug + redirect テーブル方針を ADR 通り実装
- [ ] `/users/[slug]` で githubLogin も解決（後方互換）
- [ ] 新規ユーザー登録時に slug 自動生成

## 受け入れ条件

- [ ] 既存 seed ユーザーが slug を持つ
- [ ] 旧 `/users/{githubLogin}` が 200 or 301 で到達可能
- [ ] slug 衝突時のフォールバックがテストされている
