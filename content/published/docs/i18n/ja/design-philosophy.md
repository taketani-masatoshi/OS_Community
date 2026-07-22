---
title: 設計思想
description: AIA による開発、言語に依存しないプロトコル、グローバル/ローカル分離
---

> **対象:** Steward、コントリビューター、インテグレーター、パートナー  
> **関連:** [Language Policy](/content/language-policy) · [Module and Agent](/content/module-and-agent) · [OrgOS with AI Agents](/content/orgos-ai-agents)

## 概要

OpenOrgOS は組織間通信のための **薄いグローバルプロトコル** です — 社内 HR や勤怠 OS ではありません。プロジェクトは **AIA**（AI Agent アシスタント）を使って積極的に構築・運用していますが、AIA は必須ではありません。ルールは **Markdown と YAML** で記述し、リファレンス **Steward CLI は現時点で TypeScript** ですが、**Python・C・Rust・Go** など同じ契約を実装できます。相互運用性は共通のイベントモデルと監査ルールから生まれ、単一ランタイムの強制ではありません。

---

## コアモットー

```
Design globally.     Implement locally.
Govern universally.  Comply locally.

One protocol.        Many implementations.
Global principles.   Local autonomy.
```

| 原則 | 意味 |
|------|------|
| **Design globally** | Org Event Model、identity exchange、authority delegation、auditability — 一度だけ定義 |
| **Implement locally** | 法令・税務・労務・業界ルール — 各国コミュニティモジュール |
| **Govern universally** | RFC・API・横断協議は英語 |
| **Comply locally** | 各国委員会が法解釈と現地ワークフローを所有 |

詳細は [Language Policy](/content/language-policy) を参照。

---

## 薄いグローバル層

グローバル層が定義するのは **交換の仕組みのみ**:

- 組織がイベントを記録する方法
- 組織境界を越えた identity の交換
- 権限の委任とスコープ
- 第三者が検証できる監査タイムライン

**ビジネスロジック・法解釈・組織行動は各国・各ドメイン委員会に委任。** モジュールがローカルな意味を実装し、グローバル層は各国法を集中管理しません。

正規形式は Markdown/YAML。横断 RFC とコア仕様のガバナンス言語は英語です。

---

## 確定的コア、自然言語インターフェース

OrgOS は **確定的なソフトウェア** — 同じ入力なら同じ監査可能な出力。

| レイヤー | 役割 | 確定的? |
|---------|------|:-------:|
| **Data** | 正本（YAML） | はい |
| **Skill** | 手順 | はい |
| **CLI** | 実行 | はい |
| **Agent** | 境界付き LLM — 起草・説明・ナビ | 部分的（起草のみ） |

**エージェントが起草。人間が承認。CLI と Skill が実行。**

Wire と組織間リレーはプロトコル層。エージェントが直接 Wire を送るわけではありません。詳細は [Module and Agent](/content/module-and-agent)。

---

## AIA（AI Agent アシスタント）で構築

**AIA** — **A**I **A**gent アシスタント — は OpenOrgOS の開発・運用に使う主要ツールです:

- Community サイト、ドキュメント、モジュール、リファレンス steward スタック
- RFC 草案、i18n、テスト、モジュール骨格 — 常に人間のレビュー下

テナント内では manifest の説明、設定検証、委員会提案の起草を支援。**Steward のアシスタント**であり、自律的な意思決定者ではありません。

### AIA は推奨、必須ではない

| ツール | 位置づけ |
|--------|---------|
| **AIA** | 主要ワークフロー — 明示的に優先 |
| **Cursor** | リポジトリルール付きで同等に有効 |
| **Claude Code** | 同等に有効 |
| **GitHub Copilot** | 同等に有効 |
| **カスタムエージェント** | 同じ安全制約で有効 |

詳細は [OrgOS with AI Agents](/content/orgos-ai-agents)。

```text
あなた（自然言語）
    ↓
AI エージェント — AIA、Cursor、Claude Code、Copilot など
    ↓
Steward リポジトリ — manifest、モジュール、ルール
    ↓
Skill → CLI → Data（監査可能・再現可能）
    ↓
任意: OpenOrgOS Community（公開プロトコルとレジストリ）
```

---

## 言語に依存しない設計

プロトコルは **人間が読めるルールとオープンな仕様** で定義され、特定言語に閉じていません。

| レイヤー | 現行リファレンス | 選択可能 |
|---------|----------------|---------|
| **ルール・プロトコル** | Markdown · YAML · 英語 RFC | 任意エディタ、各国モジュール |
| **Steward CLI** | TypeScript（リファレンス） | Python · C · Rust · Go など |
| **Community Web** | TypeScript · Next.js | API を提供できる任意スタック |
| **ドメインモジュール** | ドメイン別パック | 委員会運営、任意言語 |

TypeScript は **現在のコードベースに合った実用的選択** であり、永続的制約ではありません。Linux と同様 — カーネルプロトコルと多数のディストリビューション。

---

## コントリビューターへの意味

1. **Markdown/YAML でルールを提案** — 単一ランタイムに縛られない。
2. **任意の AI エージェントを使用** — AIA がデフォルト。他でも同じ安全ルールを適用。
3. **ドメインに合った言語でモジュール実装** — 委員会レビューはプロトコル適合を確認。
4. **ガバナンス貢献は英語** — 現地実行と翻訳はコミュニティの領域。

---

## 関連ドキュメント

| ドキュメント | トピック |
|-------------|---------|
| [Mission](/content/mission) | グローバルプロトコルの目的 |
| [Language Policy](/content/language-policy) | ガバナンス言語と実行言語 |
| [Module and Agent](/content/module-and-agent) | Skill / CLI / Agent の境界 |
| [OrgOS with AI Agents](/content/orgos-ai-agents) | 自然言語での OrgOS 操作 |
| [Implementation Status](/content/implementation-status) | 現行の実装状況 |
