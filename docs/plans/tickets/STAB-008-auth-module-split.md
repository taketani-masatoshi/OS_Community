# STAB-008: auth.ts モジュール分割

**ID**: STAB-008  
**Phase**: C  
**Estimate**: 2d  
**要件**: R2  
**Depends**: STAB-003

## 目的

400 行超の `auth.ts` を identity / callbacks / events に分割し、変更リスクを下げる。

## タスク

- [ ] `lib/identity/auth-callbacks.ts` — signIn, linkAccount, merge
- [ ] `lib/identity/auth-events.ts` — createUser, signIn event
- [ ] `auth.ts` は NextAuth 設定の薄いファサードのみ
- [ ] 既存 unit/e2e（identity, session）pass

## 受け入れ条件

- [ ] `auth.ts` < 150 行（目安）
- [ ] OAuth ログイン + LinkedIn connect 手動 smoke

## 非スコープ

- next-auth stable 版への移行
