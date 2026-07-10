# STAB-007: progress-service 境界分離

**ID**: STAB-007  
**Phase**: B  
**Estimate**: 1d  
**要件**: R3  
**Depends**: STAB-002

## 目的

`progress-service.ts` から Academy API 呼び出しを分離し、ACADEMY 未設定でも DB 進捗操作が可能な path を明確化する。

## タスク

- [ ] `progress-db.ts` / `progress-academy.ts` に分割（名称は実装時調整）
- [ ] `getTrackProgress` — Academy 不可時は cache/DB のみ返却または 503 明示
- [ ] unit test: ACADEMY_API_URL 未設定時の各関数挙動
- [ ] `/api/academy/progress` route の error mapping 確認

## 受け入れ条件

- [ ] Academy 未設定 + DB 操作 API が throw しない
- [ ] resilience academy tests pass
