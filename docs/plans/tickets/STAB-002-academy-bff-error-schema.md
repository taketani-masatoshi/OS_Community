# STAB-002: Academy BFF エラースキーマ統一

**ID**: STAB-002  
**Phase**: A  
**Estimate**: 1d  
**要件**: R1  
**Labels**: stability, academy, api

## 目的

`/api/academy/*` のエラー JSON を Community 標準 `{ code, error }` に揃え、i18n 可能にする。

## 現状ギャップ

- `apps/web/src/lib/academy/server-client.ts` — `academyErrorResponse` が `{ error: { code, message } }`

## タスク

- [ ] `academyUnavailableResponse` / `academyErrorResponse` を `apiErrorResponse` ベースに変更、または thin adapter 追加
- [ ] 既存 Academy route 4 ファイルの error handling 確認
- [ ] フロント（ModuleQuizForm 等）の error parse 互換確認
- [ ] `errors.json` に academy 系 code を追加（必要時）

## 受け入れ条件

- [ ] BFF 503/404/502 が `{ code, error }` 形式
- [ ] resilience + academy e2e pass
- [ ] breaking change があれば ADR 1 段落

## 非スコープ

- Content API 側の変更
