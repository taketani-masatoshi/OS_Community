# ID-007: Guard — requireGitHubLinked

**ID**: ID-007
**Phase**: 3 (C MVP)
**Estimate**: 0.5d
**Labels**: identity, auth, api
**Depends**: ID-006

## 目的

Technical レイヤー必須の API を明示的にガードする。

## タスク

- [ ] `requireGitHubLinkedApi()` を `lib/session.ts` に追加
- [ ] エラーコード `GITHUB_LINK_REQUIRED` を `errors.json` + `apiErrorResponse` に追加
- [ ] 対象: `/api/github/connect`, `/api/module-roles/request`（要件に応じ調整）

## 受け入れ条件

- [ ] GitHub 未連携（ログインのみ）で repo 系 API が 403 + 明確な i18n メッセージ
- [ ] i18n strict check pass
