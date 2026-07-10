# ID-020: Tests — identity E2E + unit

**ID**: ID-020
**Phase**: 5 (C MVP)
**Estimate**: 2d
**Labels**: identity, test
**Depends**: ID-016

## 目的

3 レイヤー MVP の回帰を自動テストで担保する。

## タスク

- [x] unit: slug 生成・resolveUserBySlug・requireGitHubLinked
- [x] e2e: settings connections ページ表示
- [x] e2e: 公開プロフィール 3 セクション（mock LinkedIn 状態）
- [x] CI `e2e` ジョブに追加

## 受け入れ条件

- [x] CI green
- [x] 主要フローの手動 QA チェックリストを ID-021 に記載
