# STAB-005: 依存障害マトリクス + 契約テスト

**ID**: STAB-005  
**Phase**: B  
**Estimate**: 1.5d  
**要件**: R3  
**Depends**: STAB-001

## 目的

DB / Academy / Auth 不可時の API・ページ挙動を表形式で定義し、テストで固定する。

## タスク

- [ ] 障害マトリクスを requirements §R3 表としてテストケース化
- [ ] `session.test.ts` 拡張 — DB unavailable mock → 503
- [ ] `db-health.test.ts` 新規（任意）
- [ ] login page DB 不可表示の e2e（mock または env 切替）

## 受け入れ条件

- [ ] マトリクス行数 ≧ 6 が automated test で cover
- [ ] 500 発生なし
