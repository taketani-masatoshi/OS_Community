# Web 安定性リファクタ — チケット一覧

**要件定義**: [web-stability-refactor-requirements.md](./web-stability-refactor-requirements.md)  
**ベースライン**: `docs/plans/web-stability-baseline.json`（`node scripts/audit-web-stability.mjs --write` で更新）

## サマリー

| 状態 | 件数 | ID |
|------|------|-----|
| ✅ 完了 | 11 | STAB-001〜011 |

---

## Phase A — P0（500・認可・CI）

| ID | タイトル | 要件 | 見積 | 状態 |
|----|---------|------|------|------|
| [STAB-001](./tickets/STAB-001-api-input-unification.md) | API 入力統一 | R1 | 1d | ✅ |
| [STAB-002](./tickets/STAB-002-academy-bff-error-schema.md) | Academy BFF エラー統一 | R1 | 1d | ✅ |
| [STAB-003](./tickets/STAB-003-admin-layout-authz.md) | admin layout 認可 | R2 | 0.5d | ✅ |
| [STAB-004](./tickets/STAB-004-quality-gate-resilience-ci.md) | quality + resilience CI | R6 | 0.5d | ✅ |

## Phase B — P1（劣化運転・運用）

| ID | タイトル | 要件 | 見積 | 状態 |
|----|---------|------|------|------|
| [STAB-005](./tickets/STAB-005-degradation-matrix-tests.md) | 障害マトリクステスト | R3 | 1.5d | ✅ |
| [STAB-006](./tickets/STAB-006-github-webhook-scope.md) | webhook provision 範囲修正 | R3 | 0.5d | ✅ |
| [STAB-007](./tickets/STAB-007-progress-service-boundary.md) | progress-service 層分離 | R3 | 1d | ✅ |

## Phase C — P2（保守性・性能）

| ID | タイトル | 要件 | 見積 | 状態 |
|----|---------|------|------|------|
| [STAB-008](./tickets/STAB-008-auth-module-split.md) | auth.ts 分割 | R2 | 2d | ✅ |
| [STAB-009](./tickets/STAB-009-layout-cache-split.md) | layout dynamic 分離 | R2 | 2d | ✅ |
| [STAB-010](./tickets/STAB-010-unit-coverage-baseline.md) | unit coverage 基準 | R6 | 1d | ✅ |

## Phase D — 将来

| ID | タイトル | 要件 | 見積 | 状態 |
|----|---------|------|------|------|
| [STAB-011](./tickets/STAB-011-distributed-rate-limit-deploy.md) | 分散 rate limit + deploy 自動化 | R5, R7 | TBD | ✅ |

---

## 推奨着手順（完了）

```
STAB-004 (CI) ─┬─ STAB-001 (API input)
               ├─ STAB-003 (admin layout)
               └─ STAB-002 (BFF errors)
                      ↓
               STAB-005 / 006 / 007
                      ↓
               STAB-008 / 009 / 010
                      ↓
               STAB-011
```

---

## Done の定義（共通）

- [x] チケットの AC をすべて満たす  
- [x] `npm run quality` pass  
- [x] `npm run quality:full` — resilience e2e 47 件 pass  
- [x] `node scripts/audit-web-stability.mjs --write` — P0 ギャップ 0  
- [ ] ユーザー明示時のみ commit（プロジェクト方針）
