# ID-019: i18n — identity 全言語

**ID**: ID-019
**Phase**: 5 (C MVP)
**Estimate**: 1d
**Labels**: identity, i18n
**Depends**: ID-016, ID-017, ID-018

## 目的

identity 関連キーを 9 言語 strict ゲートで通す。

## タスク

- [ ] `core.json` / `settings` / `errors.json` にキー追加
- [ ] en 正本 → 8 locales 翻訳
- [ ] `npm run i18n:sync` green
- [ ] `GITHUB_LINK_REQUIRED` 等 API エラー 8 言語

## 受け入れ条件

- [ ] `npm run i18n:sync` / `i18n:check:api` pass
