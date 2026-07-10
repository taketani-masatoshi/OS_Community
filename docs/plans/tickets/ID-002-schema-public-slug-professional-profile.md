# ID-002: Schema — publicSlug + ProfessionalProfile

**ID**: ID-002
**Phase**: 1 (C MVP)
**Estimate**: 1d
**Labels**: identity, database
**Depends**: ID-001

## 目的

コミュニティ ID の中立 URL と Professional レイヤー用テーブルを追加する。

## タスク

- [ ] `User.publicSlug String? @unique` を追加
- [ ] `ProfessionalProfile` モデル（userId, linkedinId, vanityName, headline, organization, profileUrl, verifiedAt, rawProfile Json?）
- [ ] `User` relation 追加
- [ ] slug 生成ルール（githubLogin ベース or cuid 短縮）を `lib/identity/slug.ts` に実装
- [ ] `npm run db:push` / migrate 手順を README に追記

## 受け入れ条件

- [ ] Prisma schema が生成・push 可能
- [ ] 型が `@os-community/db` 経由で web から利用可能
