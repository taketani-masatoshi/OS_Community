# Google OAuth セットアップ（OpenOrgOS ログイン ID）

OpenOrgOS Community の **プライマリログイン**（Google メール = OpenOrgOS login ID）に必要な設定手順です。

会員の正本 ID は Google アカウントのメールです。氏名はプロフィール完了時に必須、所属組織（法人番号）は自己申告→管理者承認で、OpenOrgOS Operator（OOO）申請時に必須になります。所属の設定 UI: `/settings/organization`。

## 1. Google Cloud OAuth クライアントを作成

1. [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) を開く
2. **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. **Authorized redirect URIs** に次の **両方** を追加:

| 用途 | Redirect URI |
|------|--------------|
| 本番（community.oorgos.org） | `https://community.oorgos.org/api/auth/callback/google` |
| ローカル dev | `http://localhost:3000/api/auth/callback/google` |

5. **Client ID** と **Client Secret** をコピー

> OAuth consent screen（同意画面）が未設定の場合は先に設定してください。テスト段階では「External / Testing」で自分の Google アカウントをテストユーザーに追加します。

## 2. `.env` に反映

**方法 A — 対話式（おすすめ）**

```bash
cd /Users/kk/OS_Community
npm run auth:primary:setup
```

**方法 B — コマンド 1 行**

```bash
node scripts/configure-primary-auth.mjs google ここにClientID ここにClientSecret
docker compose up -d --force-recreate web
```

**方法 C — `.env` を直接編集**

```env
AUTH_GOOGLE_ID=ここにClientID
AUTH_GOOGLE_SECRET=ここにClientSecret
```

## 3. 動作確認

```bash
npm run auth:check
```

1. `npm run dev` または Docker 起動後、`/login` を開く
2. **Sign in with Google** ボタンが表示されること
3. 認可後 `/settings/profile` または `/mypage` へ遷移すること
4. Google 設定後は GitHub 暫定ログインは自動的に無効化されます（GitHub は連携専用）

## トラブルシュート

| 症状 | 対処 |
|------|------|
| Google ボタンが出ない | `.env` の `AUTH_GOOGLE_*` が空 → 手順 2 |
| `Configuration` エラー | `npm run auth:check` で secret の有無を確認。web 再起動 |
| OAuth callback 失敗 | Redirect URI が上記 URL と **完全一致** しているか確認 |
| ローカルで openorgos.net に飛ぶ | `npm run dev` を使う（`AUTH_URL=http://localhost:3000` を自動設定） |
| `AccessDenied` | OAuth consent screen のテストユーザーに自分のアカウントを追加 |

## 関連

- 所属組織（法人番号）: `/settings/organization`（申告）・`/admin/users`（承認）
- GitHub / LinkedIn 連携: [linkedin-oauth-setup.md](./linkedin-oauth-setup.md)
- GitHub（暫定 / 連携）: [github-oauth-setup.md](./github-oauth-setup.md)
- Identity ADR: [adr/identity-3layer.md](./adr/identity-3layer.md)
