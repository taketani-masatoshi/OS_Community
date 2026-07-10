# ID-006: JWT — レイヤー状態 claims

**ID**: ID-006
**Phase**: 1 (C MVP)
**Estimate**: 1d
**Labels**: identity, auth
**Depends**: ID-002

## 目的

セッションから各レイヤーの完成状態を UI / API が参照できるようにする。

## タスク

- [ ] JWT / Session に追加: `profileComplete`, `linkedinConnected`, `githubReposConnected`（命名は ADR 準拠）
- [ ] `auth.ts` jwt callback で DB から毎回読込（既存 siteRole パターン踏襲）
- [ ] `auth.config.ts` 型拡張
- [ ] middleware / mypage で claims 利用可能

## 受け入れ条件

- [ ] ログイン後 session.user にレイヤー状態が含まれる
- [ ] LinkedIn 連携後に再ログイン or jwt refresh で状態更新
