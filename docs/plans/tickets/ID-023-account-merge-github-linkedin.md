# ID-023: Phase 6 — GitHub + LinkedIn アカウントマージ

**ID**: ID-023
**Phase**: 6 (Post-MVP)
**Estimate**: 3d
**Labels**: identity, auth, phase-6
**Depends**: ID-022

## 目的

同一人物が GitHub ログインと LinkedIn ログイン両方を使った場合に 1 User に統合する。

## タスク

- [ ] Settings「アカウントをリンク」UI
- [ ] マージ API: 副アカウントの roles/certs/enrollments を正 User へ移行
- [ ] 衝突: 両方に moduleRole がある場合のルール
- [ ] 監査ログ（UserMergeAuditLog 検討）
- [ ] 管理者向け手動マージ（サポート用）

## 受け入れ条件

- [ ] GitHub ログイン → LinkedIn Connect と LinkedIn ログイン → GitHub Connect が同じ User になる
- [ ] データ欠損なし（transaction + テスト）
