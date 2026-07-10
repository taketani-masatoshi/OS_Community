# ID-004: Refactor — slug 解決・URL 生成の全置換

**ID**: ID-004
**Phase**: 1 (C MVP)
**Estimate**: 1.5d
**Labels**: identity, refactor
**Depends**: ID-003

## 目的

`githubLogin` ベースの URL 生成を `publicSlug` 優先に統一する。

## タスク

- [ ] `getUserProfilePath()` → publicSlug 優先
- [ ] `resolveUserBySlug()` → publicSlug / githubLogin / founder 両対応
- [ ] 影響箇所を更新: experts, members, modules, committees, mypage, admin
- [ ] grep `githubLogin` リンク生成の残存を洗い出し修正

## 受け入れ条件

- [ ] 主要ページのプロフィールリンクが publicSlug を使用
- [ ] `npm run build` 成功
- [ ] founder プロフィール URL が従来どおり
