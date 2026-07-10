# ID-011: UI — Settings LinkedIn 連携

**ID**: ID-011
**Phase**: 2 (C MVP)
**Estimate**: 1d
**Labels**: identity, ui, linkedin, settings
**Depends**: ID-010

## 目的

/settings/connections の Professional カードで Connect / Disconnect できる UI。

## タスク

- [ ] 連携状態表示（headline, 所属, verified 日時）
- [ ] Connect ボタン → OAuth 開始
- [ ] Disconnect ボタン + 確認
- [ ] エラー表示（OAuth 失敗、既に他ユーザーに紐付き等）

## 受け入れ条件

- [ ] E2E 手動: Connect → 表示更新 → Disconnect
- [ ] i18n en/ja 完了（他言語は ID-019）
