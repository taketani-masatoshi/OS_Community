# ID-001: ADR — 3レイヤー identity モデル

**ID**: ID-001
**Phase**: 1 (C MVP)
**Estimate**: 0.5d
**Labels**: identity, docs, architecture
**Depends**: —

## 目的

Community / Professional / Technical の責務分界と C MVP のスコープを ADR として固定する。

## タスク

- [ ] `docs/adr/identity-3layer.md` を作成
- [ ] Layer 1 = User.id + publicSlug + コミュニティ実績が正
- [ ] Layer 2 = LinkedIn 連携（MVP は Connect のみ、ログイン不可）
- [ ] Layer 3 = GitHub ログイン + GitHubConnection + merge 権限
- [ ] slug 方針（founder 例外、githubLogin 301）
- [ ] Phase 6 / 拡張の Out of Scope を明記

## 受け入れ条件

- [ ] レビュー可能な ADR がリポジトリにマージされている
- [ ] ID-002 以降のチケットが ADR を参照できる
