# STAB-006: GitHub webhook provision 範囲修正

**ID**: STAB-006  
**Phase**: B  
**Estimate**: 0.5d  
**要件**: R3  
**Labels**: stability, github, webhook

## 目的

`installation_repositories` イベントで全 user 100 件 provision する挙動を、installation 所有者に限定する。

## 現状

`apps/web/src/app/api/github/webhook/route.ts` L54–66

## タスク

- [ ] installation.account.login に一致する user のみ `triggerGitHubProvisioning`
- [ ] unit test（webhook payload fixture）
- [ ] resilience: webhook malformed JSON → 400（署名 NG → 401 は既存）

## 受け入れ条件

- [ ] 100 件一括 provision コード削除
- [ ] 既存 GitHub App 連携フロー手動 smoke OK
