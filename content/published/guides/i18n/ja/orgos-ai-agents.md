---
title: AI エージェントで OrgOS を使いこなす（Cursor）
description: Cursor 等の AI エージェントを使い、自然言語で OrgOS を理解・操作する方法。
---

> **概要:** [学習ハブの「OrgOS とは」](/learning#about-orgos) — 確定的なプログラムを LLM・AI エージェントで自然言語操作する仕組み。

**前提:** [OrgOS インストールとデジタルツインの環境準備](/content/orgos-install-setup) を完了しているか、ローカルテナントが稼働していること。

## AI エージェントが OrgOS でできること

| 能力 | 例 |
|------|-----|
| **説明** | 「finance エージェントの manifest で許可されている操作は？」 |
| **把握** | 「このテナントで有効なモジュール一覧は？」 |
| **草案** | 「JP 法域向けの委員会提案テンプレートを書いて」 |
| **検証** | 「validate を実行して失敗を要約して」 |
| **運用補助** | 「今週 operations に割り当てられた Org Event を一覧」 |

エージェントは **ガバナンスの代替ではありません**。承認・委任・監査ルールはそのまま有効です — **Steward アシスタント** として扱ってください。

## 構成のおさらい

```text
あなた（自然言語）
    ↓
Cursor エージェント（リポジトリ + ツール）
    ↓
Steward リポジトリ — agent.manifest.yaml、モジュール、スクリプト
    ↓
Org Runtime / Org Console（ローカル — データはここに留まる）
    ↓
任意: OpenOrgOS Community（公開プロトコル・レジストリのみ）
```

コアエージェント定義は `steward/agents/` にあります。Community の [エージェントレジストリ](/agents) は公開カタログ — テナント側で拡張・上書きできます。

## ステップ 1 — Cursor で steward ワークスペースを開く

1. 組織の Steward / OrgOS リポジトリを clone（Org Console と同じホスト）。
2. Cursor: **File → Open Folder** → リポジトリルート。
3. `steward/agents/executive/agent.manifest.yaml` 等が見えることを確認。

インデックス完了後、`@Codebase` で manifest 全体を検索できます。

## ステップ 2 — プロジェクトルール（推奨）

`.cursor/rules/orgos.mdc` または **Cursor Settings → Rules** に例:

- 業務データと `.env` 秘密情報を公開チャットに貼らない
- 書き込み前に読み取り調査を優先
- `tenant.yaml` / `.env` の法域・モジュール境界を守る
- 設定変更後は `./scripts/validate.sh` を実行

## ステップ 3 — エージェントに渡すコンテキスト

| ソース | Cursor での渡し方 |
|--------|-------------------|
| テナント設定 | `@.env.example`、`@tenant.yaml`（秘密はマスク） |
| 組織図 | `@exports/org-chart.csv` |
| モジュール一覧 | `@modules/enabled.json` またはレジストリ URL |
| オンボーディングメモ | `@docs/onboarding-checklist.md` |
| エージェント | `/agents` または `@steward/agents/` |

## ステップ 4 — 自然言語パターン

### 探索（読み取りのみ）

- 「compliance と finance エージェントの権限差を要約して。」
- 「モジュール X から監査ログまで Org Event の流れを説明して。」

### 設定（草案 → 人がレビュー）

- 「JP のサービス業 20 人規模向けの有効モジュール案を表形式で。」
- 「validate.sh の出力を 1 行ずつ説明して」（ターミナル実行後に貼り付け）

### 運用（慎重 — ローカルのみ）

- 「本番データに触れるスクリプトを列挙し、読み取り/書き込みを分類。」

人の承認なしの破壊的操作は避けてください — 良いルールがブロックします。

## ステップ 5 — エージェントレジストリ

[エージェントレジストリ](/agents) のコアドメイン:

| エージェント | ドメイン | 向いている質問 |
|--------------|----------|----------------|
| executive | governance | 戦略・承認・委員会ルーティング |
| secretary | governance | 日程・議事・連絡 |
| finance | finance | 請求・帳簿ポリシー |
| contract | finance | 契約ライフサイクル |
| compliance | finance | 規制チェック |
| operations | operations | 日常キュー |

レジストリ更新後はローカル manifest を sync（リポジトリの `npm run sync:agents` 等）。

## ステップ 6 — MCP とターミナル（任意）

- 最初は **読み取り専用** MCP
- `docker compose ps`、`validate.sh`、ログ tail — 出力をチャットに貼って解釈
- Org Console 管理ポートを公開しない

## 安全チェックリスト

- [ ] エージェントは **ローカル** clone に対して動作
- [ ] `.env` の秘密はプレースホルダのみエージェントに見せる
- [ ] 書き込みは Steward Operator がレビュー
- [ ] エージェント提案後に validate 通過

## 次のステップ

| リソース | リンク |
|----------|--------|
| インストール・デジタルツイン | [インストールガイド](/content/orgos-install-setup) |
| OrgOS 概要 | [学習ハブ](/learning#about-orgos) |
| カリキュラム | [学習 → カリキュラム](/learning#curriculum) |
| モジュール | [モジュールレジストリ](/modules#registry) |
