# STAB-004: quality gate + resilience CI 統合

**ID**: STAB-004  
**Phase**: A  
**Estimate**: 0.5d  
**要件**: R6  
**Labels**: stability, ci, testing

## 目的

ローカル quality gate と CI が resilience e2e を含み、異常系回帰を自動検知する。

## 現状ギャップ

- `scripts/quality-gate.sh` — resilience 未実行
- CI e2e ジョブ — resilience は `playwright test` 全件に含まれるが build ジョブと分離

## タスク

- [ ] root `package.json` に `quality:full` 追加（quality + resilience e2e）
- [ ] `quality-gate.sh` に resilience オプション `--with-e2e` または `quality:full` 分離
- [ ] CI e2e ジョブで resilience 必須であることを README/checklist に明記
- [ ] `audit-web-stability.mjs` の `qualityGateIncludesResilience` を true に

## 受け入れ条件

- [ ] `npm run quality:full` ローカル pass（DB + seed 前提）
- [ ] CI e2e green
- [ ] checklist §品質ゲート 更新

## 非スコープ

- Academy mock server in CI（別チケット検討）
