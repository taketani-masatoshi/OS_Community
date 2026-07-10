# ID-014: API — GitHub 連携必須化

**ID**: ID-014
**Phase**: 3 (C MVP)
**Estimate**: 1d
**Labels**: identity, api, github
**Depends**: ID-007

## 目的

repo 操作・Contributor 申請 API に Technical レイヤー要件を適用する。

## タスク

- [ ] `/api/github/connect` — requireAuth + profile complete
- [ ] `/api/module-roles/request` — GitHub ログイン必須（repo 連携は任意 or 必須を ADR で決定）
- [ ] 403 時 UI が `/github` or `/settings/connections` へ誘導できるメッセージ

## 受け入れ条件

- [ ] 未ログイン / プロフィール未完成 / 必要 guard ごとに正しい HTTP + error code
- [ ] 既存 E2E governance が green
