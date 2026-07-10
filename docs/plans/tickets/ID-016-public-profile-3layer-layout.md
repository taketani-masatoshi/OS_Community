# ID-016: UI — 公開プロフィール 3 レイアウト

**ID**: ID-016
**Phase**: 4 (C MVP)
**Estimate**: 1.5d
**Labels**: identity, ui
**Depends**: ID-012, ID-015

## 目的

`/users/[slug]` を Community / Professional / Technical の 3 セクション構成に再レイアウトする。

## タスク

- [ ] ヒーロー: Community（名前, ロール, 専門・地域, bio）
- [ ] 3 カラム or 縦積みカード（モバイル 1 列）
- [ ] Community 本体: 委員会, モジュール役割, 認定, wild modules
- [ ] Professional / Technical は ID-012/015 を統合
- [ ] CSS: `.profile-layer-*` コンポーネント

## 受け入れ条件

- [ ] 初見ユーザーが 3 レイヤーの意味をスクロール 1 屏で把握できる
- [ ] 説明文は各セクション 1 行以内
