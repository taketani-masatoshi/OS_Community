# ID-022: Phase 6 — LinkedIn ログインプロバイダ

**ID**: ID-022
**Phase**: 6 (Post-MVP)
**Estimate**: 2d
**Labels**: identity, auth, linkedin, phase-6
**Depends**: C MVP リリース

## 目的

LinkedIn でも **サインイン** できるようにする（MVP 後・専門家招請の反応を見て着手）。

## 前提（判断ゲート）

- [ ] MVP リリース後 2〜4 週のフィードバック収集
- [ ] 「LinkedIn で入りたい」需要が確認されている

## タスク

- [ ] `/login` に「LinkedIn で続行」追加
- [ ] 新規 LinkedIn ユーザー → Community プロフィール登録フロー
- [ ] GitHub 未連携でも Community + Professional レイヤーは利用可
- [ ] Technical 操作は引き続き GitHub 連携必須

## 受け入れ条件

- [ ] LinkedIn のみでログイン → プロフィール完成 → /experts 掲載可能
- [ ] repo 操作は GitHub Connect を促す UI
