# コンテンツ格納ディレクトリ

別プロジェクトで生成したコンテンツをここに配置し、本リポジトリの Web ページと `registry.yaml` で紐付けます。

## ディレクトリ構成

```
content/
├── registry.yaml      # Web ルート ↔ ファイルの紐付け正本
├── inbox/             # 外部プロジェクトからの投入先（未レビュー）
├── published/         # 公開可能なコンテンツ
│   ├── docs/          # 説明・概念ドキュメント
│   ├── guides/        # 手順書（創業セットアップ等）
│   └── legal/         # 免責・規約
└── assets/            # 画像・図（任意）
```

## ワークフロー

1. 別プロジェクトで Markdown / MDX を生成
2. `content/inbox/` に配置
3. レビュー後 `content/published/{category}/` へ移動
4. `registry.yaml` にエントリを追加（`status: published`）
5. Web は `/content/[id]` で自動表示

## registry.yaml スキーマ

| フィールド | 必須 | 説明 |
|-----------|:----:|------|
| `id` | ○ | URL スラッグ（`/content/{id}`） |
| `title` | ○ | ページタイトル |
| `file` | ○ | `content/` からの相対パス |
| `category` | ○ | `docs` / `guides` / `legal` |
| `status` | ○ | `draft` / `published` / `archived` |
| `description` | | 一覧用概要 |
| `order` | | 表示順（小さいほど先） |

`status: published` のエントリのみ Web に表示されます。

## 学習ビデオ（videos.yaml）

`content/videos.yaml` で YouTube 動画を管理します。

| フィールド | 説明 |
|-----------|------|
| `access: public` | 未ログインでも視聴可能（最初の1本など） |
| `access: members` | ログイン後のメンバーのみ embed 表示 |
| `youtubeId` | YouTube 動画 ID |
| `title` / `description` | `ja` / `en` の多言語 |

表示: `/learn`

## 例

```yaml
entries:
  - id: startup-setup
    title: 創業時の初期セットアップ
    description: Mac mini + NAS 上で会社OSを構築する手順
    file: published/guides/startup-setup.md
    route: /content/startup-setup
    category: guides
    status: published
    order: 1
```

## 注意

- テナント（会社機密）データは **絶対に** ここへ置かない
- コンテンツ生成は別プロジェクトの責務。本リポジトリは配信・紐付けのみ
