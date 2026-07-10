# STAB-009: root layout cache 分離

**ID**: STAB-009  
**Phase**: C  
**Estimate**: 2d  
**要件**: R8

## 目的

`app/layout.tsx` の `force-dynamic` を session 必要部分に閉じ込め、公開コンテンツページで ISR/revalidate を有効化する。

## タスク

- [ ] Header session 表示を Client コンポーネント + `useSession` または partial に分離
- [ ] root layout から `export const dynamic = "force-dynamic"` 削除可能か検証
- [ ] `/governance`, `/modules`, `/learning` の revalidate 動作確認
- [ ] TTFB ベースライン before/after を checklist に 1 行記録

## 受け入れ条件

- [ ] 公開ページが static/ISR ビルド出力に含まれる（`next build` ログ）
- [ ] ログイン後 Header 表示は維持
- [ ] audit `forceDynamicLayouts` 減少

## リスク

- Next.js 15 + next-auth beta の SessionProvider との整合 — spike 0.5d 推奨
