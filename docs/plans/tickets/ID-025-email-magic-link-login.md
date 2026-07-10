# ID-025: 拡張 — メールマジックリンクログイン

**ID**: ID-025
**Phase**: 7+ (C Extension)
**Estimate**: 3d
**Labels**: identity, auth, extension
**Depends**: Phase 6

## 目的

GitHub / LinkedIn を使わない専門家向けにメールログインを追加する。

## タスク

- [ ] NextAuth Email provider + SMTP / Resend
- [ ] emailVerified フロー
- [ ] 既存 Account とのリンク
- [ ] スパム対策（rate limit, captcha 検討）

## 受け入れ条件

- [ ] メールのみで Community レイヤー利用可能
- [ ] Professional / Technical は別途 Connect

## 優先度

専門家招請で LinkedIn も使えない法域・業界が判明した場合に着手。
