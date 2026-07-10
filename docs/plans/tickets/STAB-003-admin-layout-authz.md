# STAB-003: admin layout 認可集中

**ID**: STAB-003  
**Phase**: A  
**Estimate**: 0.5d  
**要件**: R2  
**Labels**: stability, authz, admin

## 目的

`/admin/*` の認可を layout に集約し、新規ページ追加時の requireRole 漏れを防ぐ。

## 現状ギャップ

- `apps/web/src/app/admin/layout.tsx` 不存在
- 各 admin ページが個別に `requireRole` を呼ぶ

## タスク

- [ ] `app/admin/layout.tsx` 作成（`requireRole(["ADMIN","CERT_REVIEWER"])`）
- [ ] 子ページの重複 `requireRole` を削除（layout に一本化）
- [ ] CERT_REVIEWER が `/admin/users` にアクセス不可の既存挙動を維持（page レベル guard 残すか middleware 拡張）

## 受け入れ条件

- [ ] 未認証 `/admin` → login redirect
- [ ] 非 ADMIN `/admin/users` → redirect（既存 e2e 相当）
- [ ] audit `adminLayout: true`

## 参考

- `apps/web/src/app/admin/page.tsx`
- `apps/web/src/app/admin/users/page.tsx`
