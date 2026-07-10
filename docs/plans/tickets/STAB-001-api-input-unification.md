# STAB-001: API 入力パース統一

**ID**: STAB-001  
**Phase**: A  
**Estimate**: 1d  
**要件**: R1  
**Labels**: stability, api, refactor

## 目的

POST/PATCH の JSON 解析を `readJsonBody` + Zod に統一し、malformed body による 500 を排除する。

## 現状ギャップ

- `apps/web/src/app/api/admin/certifications/route.ts` — `req.json()` 直叩き

## タスク

- [ ] `admin/certifications` を `readJsonBody` + Zod schema に移行
- [ ] audit script `rawJsonRoutes` が 0 であることを確認
- [ ] `errors.json` に不足コードがあれば追加
- [ ] resilience spec に当該 route への malformed POST を追加（任意）

## 受け入れ条件

- [ ] malformed JSON → 400（500 禁止）
- [ ] 正常系の admin 認定 approve/reject が動作
- [ ] `npm run quality` pass

## 非スコープ

- Academy BFF 形式（STAB-002）
