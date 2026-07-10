---
title: Module と Agent — OrgOS 用語ガイド
description: CEO・Steward Operator 向けに、Module（拡張パック）と Agent（境界付き LLM 担当者）の違いと Skill / CLI / Data の関係を平易に説明します。
---

> **対象:** CEO、Steward Operator、エンジニア以外の初めての方。  
> **正本（要約公開）:** OrgOS 参照実装 `docs/org-os/orgos-vocabulary.md` §1–§3 · `docs/agent_architecture.md` · `steward/rules/agent_skill_architecture.md`  
> 本ページと正本が矛盾する場合は **リポジトリ正本を優先** してください。

> **このページの内容:** よくある誤解の訂正 · 一言定義 · 5 つの nuance · Skill / CLI / Data の流れ · 具体例 · 判断早見表 · レガシー用語

## 訂正 — よくある誤解

「Module は仕様書だけ」「Agent は操作補助 UI だけ」と捉えがちですが、どちらも **違います**。Module は **データ正本 · seed · CLI · 規程連動** がセットの拡張パックです。Agent は **読取境界 · 委譲 · 報告 · 人間承認ゲート · 要約** を担う LLM 担当者です。決定論的な計算と validate は原則 **Skill + CLI** が実行し、Agent は正データを直接いじりません。

---

## 一言定義

| | **Module（モジュール）** | **Agent（エージェント）** |
|---|--------------------------|---------------------------|
| **何か** | 組織 OS に業務領域を載せる **拡張パック** | その領域（＋横断業務）を **境界付きで扱う LLM 担当者** |
| **正本** | manifest · seed · CLI · Skill · `modules.yaml` | `*_agent.md` · `registry.yaml` |
| **ON/OFF** | テナントごと（`modules.yaml`） | コアは常時 · 拡張は組織カタログ |

---

## 重要な nuance（必読）

1. **Module は「仕様書だけ」ではない** — **データ正本 · seed · CLI · 規程連動**（例: REG-025/026）がセットです。
2. **Agent は「操作補助 UI」ではない** — **読取境界 · 委譲 · 報告 · 人間承認ゲート · 要約** を含みます。
3. **Agent は Module 拡張後だけ存在するわけではない** — **Finance · Secretary · Steward 等のコア Agent** は Module 無しでも常時です。
4. **1:1 ではない** — 例: Module `jp_medical_device` ↔ Core Agent `medical_device_regulatory`（**proxy** 関係）。
5. **決定論処理は Skill + CLI** — Agent は正データを直接いじらない（原則）。計算 · validate · 台帳更新は CLI が実行します。

---

## Module / Agent / Skill / CLI / Data の関係

```text
Module（拡張パック）              Agent（境界付き LLM）
  Data · seed · CLI · Skill        読取境界 → 草案 · 委譲 · 報告
         │                                    │
         └──────────► Skill ──► CLI ──► Data ◄┘
                              （必要時は人間承認ゲートを経て CLI）
```

| 層 | 役割 | 決定論？ | 例 |
|----|------|:--------:|-----|
| **Data** | 正本（YAML） | ○ | `data/properties/` · `data/medical-device/` |
| **Skill** | 手順書 | ○ | 月次締め · NOI 分析 · QMS 草案フロー |
| **CLI** | 実行コマンド | ○ | `orgos operations …` · `validate` |
| **Agent** | 境界付き LLM | △（草案のみ） | Finance 要約 · 薬事 Primary オーナー |
| **Module** | 上記のパック | — | rental · jp_medical_device |

---

## OrgOS の中での位置

### 四構成（全体像）

| # | 構成 | Module / Agent |
|---|------|----------------|
| 1 | **OpenOrgOS Core** | どちらでもない |
| 2 | **Module 連結** | **Module はここ** |
| 3 | **Wire** · **Witness** | どちらでもない |
| — | **実装層** | **Agent**（コア + Module Agent） |

### 四層（日常オペレーション）

```text
OrgOS（ルール · CLI · テナント設定）
    ↓
Agent（読取 · 草案 · 委譲 · 報告）
    ↓
Skill（手順）
    ↓
Data（正本）
```

---

## 具体例

### rental Module — 賃貸業務

| 項目 | 内容 |
|------|------|
| **Module ID** | `rental` |
| **載るもの** | 賃貸物件データ（`data/properties/`）· 賃貸計画 · NOI 関連 Skill |
| **ON/OFF** | `modules.yaml` — 「この会社、賃貸やる？」の答えが **Module** |
| **Module Agent** | `steward/modules/rental/agent.md` — Module ON 時のみ要約・支援 |
| **初期化** | `orgos modules activate rental` |

Finance Agent は Module 無しでも予実を見ます — **予実を誰が見る？ → Agent（finance）**。

### jp_medical_device Module — 医療機器パック

| 項目 | 内容 |
|------|------|
| **Module ID** | `jp_medical_device` |
| **Data 正本** | `data/medical-device/`（義務 catalog · 許可台帳 · ledger 等） |
| **CLI** | `orgos operations medical-device show|validate|qms|gvp|ledger …` |
| **規程連動** | REG-025（QMS 規程）· REG-026（GVP 規程）— `regulations.yaml` と連動 |
| **初期化** | `orgos modules activate jp_medical_device` |

### medical_device_regulatory Agent — 薬事オーナー（proxy）

| 項目 | 内容 |
|------|------|
| **Agent ID** | `medical_device_regulatory`（**コア Agent** — Module とは 1:1 ではない） |
| **役割** | QMS/GVP の **Primary オーナー** · ISO 13485 統制（`CTL-13485-*`） |
| **報告** | 現場 → **COO 中継** → **Steward Agent**（`chain-policy.yaml` 正本） |
| **禁止** | PMDA / 都道府県への **自動届出** — 人間（CEO / 薬事担当）のみ |
| **初期化** | `orgos agent order --to medical_device_regulatory` |

**proxy の意味:** Module `jp_medical_device` が現場 CLI · 台帳 · 草案 Skill を提供し、Core Agent `medical_device_regulatory` が横断オーナーシップ · 統制 · 報告チェーンを担います。

```bash
# 典型フロー（CEO / Operator）
orgos modules activate jp_medical_device
orgos agent order --to medical_device_regulatory --subject "QMS 台帳の初期状態を確認"
orgos operations medical-device validate
```

---

## 判断の早見表

| 質問 | 答え |
|------|------|
| この会社、賃貸業務やる？ | **Module**（`modules.yaml` / `orgos modules activate rental`） |
| 予実は誰が見る？ | **Agent**（finance）— Module 不要 |
| 台帳の正本はどこ？ | **Module の Data**（例: `data/medical-device/ledger-registry.yaml`） |
| 薬事報告は誰経由？ | **Agent** → COO → Steward |
| 計算 · validate は？ | **Skill / CLI**（Agent が直接正本を書き換えない） |
| Module と Agent は 1:1？ | **いいえ** — 医療機器は Module + Core Agent の **proxy** 関係 |

---

## よくある混同

| 混同 | 正しい理解 |
|------|------------|
| Module = 仕様 PDF だけ | **Data · seed · CLI · 規程** がセット |
| Agent = チャット UI | **境界 · 委譲 · 報告 · 承認ゲート · 要約** |
| Agent は Module ON 後だけ | **Finance · Secretary 等は常時** |
| Finance を module OFF | Finance は **コア Agent** — module スイッチではない |
| Agent が Wire を送る | Wire はプロトコル層 — Secretary は **起案** → Operator → CLI |

---

## Agent ではないもの

| 用語 | 意味 |
|------|------|
| **Operator** | 人間承認者 |
| **Skill** | 手順書（決定論） |
| **CLI** | 決定論コマンド |

---

## レガシー用語

> **脚注:** 旧文書に残る表記の読み替え（正本: `orgos-vocabulary.md` §1–§3）

| 旧表記 | 読み替え |
|--------|----------|
| **Steward OS**（製品名として） | **OrgOS**（組織 OS 製品全体） |
| **Steward**（製品と混同） | **Steward Agent**（経営統括 — Secretary と同列の Agent 名） |
| `steward` CLI | **`orgos` CLI**（推奨） |
| `steward-os` npm | **`orgos-reference`** npm |

---

## 正本・関連リンク

### OrgOS 参照実装（正本 · リポジトリ内パス）

| 文書 | パス |
|------|------|
| 用語集 | `docs/org-os/orgos-vocabulary.md` |
| Agent アーキテクチャ | `docs/agent_architecture.md` |
| Agent / Skill 四層 | `steward/rules/agent_skill_architecture.md` |
| コア Agent 一覧 | `steward/core/agents/00-このフォルダについて.md` |
| 医療機器 Module Agent | `steward/jurisdiction-packs/JP/modules/jp_medical_device/agent.md` |
| 薬事 Core Agent | `steward/core/agents/medical_device_regulatory_agent.md` |

### OpenOrgOS Community（Web）

| リソース | リンク |
|----------|--------|
| Module カタログ | [Modules](/modules#registry) |
| Agent カタログ | [Agents](/agents) |
| 実装状況（Wire、Hub、X-Road） | [実装状況](/content/implementation-status) |
| はじめての方 · ハードウェア導入 | [Getting started](/getting-started) |
| セットアップ詳細 | [OrgOS インストール](/content/orgos-install-setup) |
| Cursor で運用 | [AI エージェント活用](/content/orgos-ai-agents) |
| ドキュメント一覧 | [Content](/content) |

---

*本ページは OrgOS 用語集 v1.2 の **要約公開** です。L2/L3 データ（口座番号 · 個人住所等）は意図的に載せていません。*
