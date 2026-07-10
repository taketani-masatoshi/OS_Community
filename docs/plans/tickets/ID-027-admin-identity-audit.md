# ID-027: 拡張 — 管理画面 identity 監査

**ID**: ID-027
**Phase**: 7+ (C Extension)
**Estimate**: 2d
**Labels**: identity, admin, extension
**Depends**: C MVP

## 目的

ADMIN がユーザーの連携 identity を監査・サポートできる UI。

## タスク

- [ ] `/admin/users` に LinkedIn / GitHub 連携状態列
- [ ] 連携解除（サポート用・監査ログ必須）
- [ ] 手動マージ起票（ID-023 補助）
- [ ] CSV エクスポート拡張

## 受け入れ条件

- [ ] ADMIN のみアクセス可
- [ ] 全操作が監査ログに残る

## 優先度

Phase 6 マージ運用開始後、サポート負荷に応じて。
