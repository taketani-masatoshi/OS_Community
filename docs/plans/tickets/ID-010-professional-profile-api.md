# ID-010: API — ProfessionalProfile

**ID**: ID-010
**Phase**: 2 (C MVP)
**Estimate**: 1d
**Labels**: identity, api, linkedin
**Depends**: ID-009

## 目的

Professional レイヤーの読み書き API を提供する。

## タスク

- [ ] `GET /api/user/professional-profile` — 自分の Professional 情報
- [ ] `DELETE /api/user/professional-profile` — Disconnect
- [ ] 公開 API: 公開プロフィール用に slug 経由で headline / profileUrl（PII 最小）
- [ ] rate limit（admin-rate-limit パターン踏襲）

## 受け入れ条件

- [ ] Connect 後 GET で LinkedIn 情報が返る
- [ ] Disconnect 後 JWT claims が更新される
