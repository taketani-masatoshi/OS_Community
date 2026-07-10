# ID-021: Runbook — C MVP リリース

**ID**: ID-021
**Phase**: 5 (C MVP)
**Estimate**: 0.5d
**Labels**: identity, docs, release
**Depends**: ID-020

## 目的

C MVP を staging → production へ安全に出す手順を文書化する。

## タスク

- [x] `docs/plans/identity-mvp-release-runbook.md`
- [x] migration 手順（slug backfill）
- [x] env 追加（LinkedIn）
- [x] ロールバック方針
- [x] MVP 後の Phase 6 判断ゲート（roadmap 参照）
- [x] `web-stability-checklist.md` に identity 項目追加

## 受け入れ条件

- [x] 担当者が runbook のみで staging デプロイ可能
- [x] DoD（roadmap MVP 完了定義）と一致
