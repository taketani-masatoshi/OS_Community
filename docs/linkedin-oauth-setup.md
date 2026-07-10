# LinkedIn OAuth セットアップ（Connect のみ）

OpenOrgOS Community の **Professional レイヤー**（LinkedIn Connect）に必要な設定手順です。

> **スコープ**: LinkedIn はログインページからのサインイン、および Google ログイン後の Connect の両方に対応しています。

## 1. LinkedIn Developer App を作成

1. [LinkedIn Developer Portal → Create app](https://www.linkedin.com/developers/apps/new) を開く
2. アプリ名・会社ページ・ロゴ等を入力して作成
3. **Products** で **Sign In with LinkedIn using OpenID Connect** を追加
4. **Auth** タブを開き、**Authorized redirect URLs for your app** に Redirect URL を **両方** 追加:

> **注意**: **Widgets → Domains**（Additional settings）ではありません。  
> Domains は Widget / JavaScript SDK 用で、OAuth の `redirect_uri` には使われません。  
> 必ず **Auth** タブの **Authorized redirect URLs for your app** に登録してください。

| 用途 | Redirect URI |
|------|--------------|
| 本番（openorgos.net） | `https://openorgos.net/api/auth/callback/linkedin` |
| ローカル dev | `http://localhost:3000/api/auth/callback/linkedin` |

5. **Settings**（またはアプリ基本情報）の **Privacy policy URL**:

```
https://openorgos.net/legal/privacy
```

6. **Client ID** と **Client Secret** をコピー

### 連携後に保存・表示される情報

| 項目 | 用途 |
|------|------|
| LinkedIn メンバー ID (`sub`) | 本人確認・重複防止 |
| ヘッドライン | 専門分野の証明（例: 「Supply Chain / ERP コンサルタント」） |
| 所属・組織 | ビジネス identity |
| プロフィール URL | `/mypage` と公開プロフィールからリンク |

## 2. `.env` に反映

**方法 A — 対話式（おすすめ）**

```bash
cd /Users/kk/OS_Community
npm run auth:linkedin:setup
```

**方法 B — コマンド 1 行**

```bash
node scripts/configure-linkedin-auth.mjs <ClientID> <ClientSecret>
```

**方法 C — `.env` を直接編集**

```env
AUTH_LINKEDIN_ID=ここにClientID
AUTH_LINKEDIN_SECRET=ここにClientSecret
```

編集後、開発サーバーを再起動してください。

## 3. 動作確認

1. **http://localhost:3000/login** から Google、GitHub、または LinkedIn でサインイン
2. **http://localhost:3000/mypage** または `/settings/connections` を開く
3. **LinkedIn を連携** をクリック
4. LinkedIn 認可後、Professional レイヤーが **連携済み** になること
5. マイページに **LinkedIn メンバー ID・ヘッドライン・所属** が表示されること

## トラブルシュート

| 症状 | 対処 |
|------|------|
| 「LinkedIn OAuth が未設定」 | `.env` の `AUTH_LINKEDIN_*` が空 → 手順 2 |
| Connect ボタンが出ない | 開発サーバー再起動、`npm run auth:check` |
| `AccessDenied` | 先に Google / GitHub / LinkedIn のいずれかでログインしてから Connect |
| callback 失敗 | Redirect URL が上記 URL と **完全一致**しているか確認（末尾 `/` 不可） |
| `redirect_uri does not match` | ブラウザの URL に合わせて **両方** を LinkedIn Auth タブに登録（下記参照） |
| ローカルで失敗 | **http://localhost:3000** を使用（127.0.0.1 不可） |
| 本番で失敗 | **https://openorgos.net** から Connect（localhost 用 URL のみ登録だと失敗） |

### `redirect_uri does not match` の確認

アプリが LinkedIn に送る callback は **`AUTH_URL` + `/api/auth/callback/linkedin`** です。

| アクセスしている URL | LinkedIn に登録する Redirect URI |
|----------------------|----------------------------------|
| http://localhost:3000 | `http://localhost:3000/api/auth/callback/linkedin` |
| https://openorgos.net | `https://openorgos.net/api/auth/callback/linkedin` |

**両方** 使う場合は **両方** 登録してください。登録場所: Developer Portal → アプリ → **Auth** → **Authorized redirect URLs for your app**。

現在の値は `npm run auth:check` の `LinkedIn OAuth callback` 行で確認できます。

## 関連

- [Google OAuth セットアップ](./google-oauth-setup.md)
- [GitHub OAuth セットアップ](./github-oauth-setup.md)
