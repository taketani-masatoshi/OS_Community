# ID-005: Settings — /settings/connections 骨格

**ID**: ID-005
**Phase**: 1 (C MVP)
**Estimate**: 1d
**Labels**: identity, ui, settings
**Depends**: ID-001

## 目的

Fedora Account 風の設定ハブに Identity / Connections セクションを追加する。

## タスク

- [ ] `SettingsNav` に Connections（または Identity）項目追加
- [ ] `/settings/connections/page.tsx` プレースホルダ（3 レイヤーカード枠）
- [ ] `/settings/profile` は Community レイヤーとして位置づけ（文言調整）
- [ ] i18n: `settings.connections`, `settings.layers.*`（en + ja 先行）

## 受け入れ条件

- [ ] ログインユーザーが `/settings/connections` にアクセス可能
- [ ] 3 レイヤー（Community / Professional / Technical）の空カードが表示される
