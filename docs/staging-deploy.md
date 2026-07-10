# Academy ステージングデプロイ

## 前提

- Content API と Community Web が同一 VPC または信頼ネットワーク内
- Postgres 16+
- `ACADEMY_INTERNAL_TOKEN` は Secrets Manager で管理

## 手順

1. **OS_Content** をデプロイ（`:8787`）
   - `ACADEMY_INTERNAL_TOKEN` を設定
   - `/ready` が 200 になることを確認

2. **OS_Community DB**
   ```bash
   npm run migrate -w @os-community/db
   ```

3. **OS_Community Web**
   - `ACADEMY_API_URL=https://academy-api.staging.example.com`
   - `ACADEMY_INTERNAL_TOKEN`（Content API と同一）
   - `DATABASE_URL`（ステージング Postgres）

4. **スモーク**
   - `/academy` 表示
   - ログイン → 読了マーク → 進捗バー更新
   - モジュールテスト採点（staging token 経由）

## ロールバック

- Web のみ: 前バージョンイメージに戻す
- Content API: カリキュラム版は `X-Curriculum-Version` で追跡
- DB: マイグレーションは forward-only（バックアップから復元）
