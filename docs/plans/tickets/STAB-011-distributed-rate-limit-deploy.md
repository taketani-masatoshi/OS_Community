# STAB-011: 分散 rate limit + deploy 検証

**ID**: STAB-011  
**Phase**: D  
**要件**: R5, R7

## 実装内容

- `rate-limit-store.ts` — in-memory + 任意 Upstash Redis REST（`UPSTASH_REDIS_REST_URL` / `TOKEN`）
- `checkRateLimit` を async 化
- `scripts/ci-deploy-verify.sh` — prod compose + audit baseline
- CI deploy ジョブで `ci-deploy-verify.sh` 実行

## 受け入れ条件

- [x] Upstash 未設定時は in-memory フォールバック
- [x] CI deploy が compose + audit を検証
- [ ] 本番 VPS 自動デプロイ（将来 — SSH/Compose push は別 epic）
