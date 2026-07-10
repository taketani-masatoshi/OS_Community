# GitHub OAuth セットアップ

OpenOrgOS Community の GitHub ログイン / リポ連携に必要な設定手順です。

## 1. GitHub OAuth App を作成

1. [GitHub Developer Settings → OAuth Apps → New](https://github.com/settings/applications/new) を開く
2. 次の値を入力:

| 項目 | 値 |
|------|-----|
| Application name | `OpenOrgOS Community`（任意） |
| Homepage URL | `https://openorgos.net` |
| Authorization callback URL | `https://openorgos.net/api/auth/callback/github` |

3. **Register application** をクリック
4. **Client ID** をコピー
5. **Generate a new client secret** で **Client Secret** をコピー（再表示不可）

## 2. `.env` に反映

**方法 A — 対話式（おすすめ）**

```bash
cd /Users/kk/OS_Community
npm run auth:github:setup
```

Client ID と Client Secret を順に入力するだけです（`<` `>` は不要）。

**方法 B — コマンド 1 行**

```bash
node scripts/configure-github-auth.mjs ここにClientID ここにClientSecret
docker compose up -d --force-recreate web
```

**方法 C — `.env` を直接編集**

```env
AUTH_GITHUB_ID=ここにClientID
AUTH_GITHUB_SECRET=ここにClientSecret
```

編集後: `docker compose up -d --force-recreate web`

## 3. 動作確認

1. https://openorgos.net/login を開く
2. 「GitHub でサインイン」ボタンが有効になっていること
3. GitHub 認可後、`/register` または元のページへ戻ること
4. https://openorgos.net/github からリポジトリ URL を登録できること

## トラブルシュート

| 症状 | 対処 |
|------|------|
| ログインボタンが無効 | `.env` の `AUTH_GITHUB_*` が空 → 手順 2 を実施 |
| `Configuration` エラー | web コンテナ再起動: `docker compose up -d --force-recreate web` |
| OAuth callback 失敗 | GitHub App の callback URL が `https://openorgos.net/api/auth/callback/github` と完全一致しているか確認 |
| **「認可されていません」**（プロフィール保存 / GitHub 接続） | ① `node scripts/check-github-auth.mjs` で OAuth App を確認 ② **https://openorgos.net/login** から再ログイン（localhost:3000 不可） ③ ブラウザの openorgos.net クッキーを削除してから再試行 ④ `docker compose up -d --force-recreate web` |
| `JWTSessionError` / セッション無効 | `AUTH_SECRET` 変更後は旧クッキーが無効。ログアウト→再ログイン、またはサイトデータ削除 |
| 403 / Access Denied | GitHub アカウントのメール公開設定、または Org SSO 承認を確認 |
| check-github-auth が 404 | Client ID / Secret が誤り、または OAuth App 削除済み → 手順 1 で再作成 |
