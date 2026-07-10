# OpenOrgOS Community

**Decentralized organization. Built on trust.**

Linux Foundation スタイルの中立ハブ — 組織運営 OS のモジュール開発、品質レビュー、標準化、教育・認証。

## 設計思想

詳細は `packages/shared/src/openorgos.ts` および以下のページ:

| ページ | 内容 |
|--------|------|
| `/about` | OpenOrgOS 概要 |
| `/standards` | モジュールライフサイクル |
| `/governance` | 権限モデル・昇格フロー |
| `/committees` | 専門委員会 |
| `/experts` | 専門家ディレクトリ |
| `/modules` | モジュールレジストリ |
| `/certifications` | 教育・認証 |

## コンテンツ（別プロジェクト連携）

```
content/
├── registry.yaml
├── inbox/
└── published/
```

## 起動

### ローカル開発（推奨）

```bash
npm run dev:start
# または: npm run dev
```

- URL: **http://localhost:3000**（OAuth は `AUTH_URL=http://localhost:3000` に自動設定）
- ヘルス: http://localhost:3000/api/health

### Docker + HTTPS / Tunnel

```bash
docker compose up -d
./scripts/start-cloud-stack.sh          # southwood.cloud（任意）
./scripts/configure-cloudflare-tunnels.sh   # 初回のみ: DNS を Tunnel に向ける
./scripts/start-cloudflare-tunnels.sh   # openorgos.net + southwood.cloud 両方
# まとめて: ./scripts/start-local-dev.sh
```

| ドメイン | ローカル先 | Tunnel / 備考 |
|----------|-----------|----------------|
| `openorgos.net` | `localhost:3000` (Community web) | `3eec3f29-…` → `http://localhost:3000` |
| `*.southwood.cloud` | `localhost:8080` / `:8082` (Cloud サービス直) | `c66d11fa-…`（`.env.cloud`） |
| ローカル HTTPS のみ | `https://localhost` (Caddy) | `./scripts/setup-local-openorgos-hosts.sh` で `openorgos.net` を 127.0.0.1 へ |

詳細: [docs/cloudflare-tunnels.md](docs/cloudflare-tunnels.md)

- **Cloudflare 経由**: 上記 `./scripts/start-cloudflare-tunnels.sh` が動いていること（Error 1033 = トンネル未接続）
- **ローカルのみ**: `./scripts/setup-local-openorgos-hosts.sh` で `/etc/hosts` を向けるか `https://localhost`
- **OAuth**: ブラウザで開く URL と `.env` の `AUTH_URL` を一致させる（`npm run auth:check`）

### 証明書警告を消す（macOS）

Caddy は開発用の自己署名 CA を使うため、初回はブラウザが「安全ではない」と表示します。

```bash
./scripts/trust-caddy-local-ca.sh
```

実行後、ブラウザを再起動して `https://localhost` を開いてください（Keychain への追加でパスワード入力が求められます）。
