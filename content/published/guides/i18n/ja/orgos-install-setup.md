---
title: OrgOS インストールとデジタルツインの環境準備
description: OrgOS を新規インストールし、組織情報を整理してデジタルツイン構築の環境を整えます。
---

> **概要:** [学習ハブの「OrgOS とは」](/learning#about-orgos) — 確定的なプログラム、自然言語での AI 操作、モジュールによる拡張。

本ガイドは **Steward Operator** 向けに、初回デプロイ（前提条件、`tenant init` 前の情報整理、デジタルツインの土台）を説明します。

OrgOS の **業務データは自社インフラ上** に保持します。OpenOrgOS Community（`openorgos.net`）はプロトコル・レジストリ・学習リソースを提供します — テナントデータはホストしません。

## 対象者

| 役割 | 目的 |
|------|------|
| **Steward Operator** | IT 専任がいなくても Org Console を社内で稼働させる |
| **経営者・スポンサー** | 本番前に何を準備すべきか把握する |
| **Steward（支援者）** | 引き渡し前に顧客環境を検証する |

## 完了時の状態

1. Docker ベース OrgOS を載せられるマシンが用意されている
2. 組織の構造・法域・モジュール方針がチェックリスト化されている
3. テナントが初期化され、設定が validate 済み
4. デジタルツインの最小スコープ（組織図・有効モジュール・監査の接続）が定義されている

## フェーズ 0 — 先に揃える情報

`tenant init` の前に、次を整理してください。

### 組織のアイデンティティ

- 法人名・屋号・主要法域
- 会計年度・報告通貨
- 日常の **Steward Operator** 連絡先

### 構造（デジタルツインの種）

- 部門・チームと報告ライン
- 主要ロール — [Steward エージェント](/agents) との対応
- Org Event を交換する外部主体

### モジュール方針

[モジュールレジストリ](/modules#registry) で初回リリースに必要な領域を選びます。

| 領域 | 例 | 初回 |
|------|-----|------|
| ガバナンス | 提案・委員会 | 多くの場合は必要 |
| 財務 | 請求・契約 | 必要に応じて |
| 業務 | 在庫・スケジュール | 必要に応じて |

### データ境界

- Mac mini から出してはいけないデータ
- SaaS ダッシュボードに載せてよい要約（読み取り専用）

## フェーズ 1 — ハードウェアとネットワーク

| 構成要素 | 用途 |
|----------|------|
| **Mac mini** | Org Runtime + Org Console（正本） |
| **Synology NAS**（任意） | バックアップ |
| 安定した LAN | 社内アクセス |
| アウトバウンド HTTPS | GitHub、レジストリ |

## フェーズ 2 — ソフトウェア前提

```bash
docker --version
docker compose version
git --version
```

- OrgOS / Steward リポジトリへアクセスできる **GitHub**
- [openorgos.net](/login) の Community アカウント
- `.env` はホストのみ — コミットしない

## フェーズ 3 — clone と設定

```bash
git clone https://github.com/steward-os/steward.git
cd steward
cp .env.example .env
# TENANT_SLUG、法域、ENABLED_MODULES、DATABASE_URL、AUTH_* を編集
docker compose up -d
curl -sk https://localhost/health
```

ヘルスが通るまで次へ進まないでください。

## フェーズ 4 — `tenant init` と validate

```bash
./scripts/tenant-init.sh
./scripts/validate.sh
```

Steward リポジトリの README に従ってください。エラーはすべて解消してから本番宣言します。

## フェーズ 5 — デジタルツインのベースライン

| レイヤ | 設定内容 |
|--------|----------|
| **Identity** | 人・ロール・連携アカウント |
| **Authority** | 委任・委員会スコープ |
| **Events** | Org Event |
| **Agents** | [エージェントレジストリ](/agents) |

- [ ] 経営・財務ロールが実在の担当者に割り当て済み
- [ ] テスト Org Event が Console で確認できる
- [ ] 有効モジュールが runbook に記載済み
- [ ] バックアップをテスト済み

## フェーズ 6 — 次のステップ

| 次 | リンク |
|----|--------|
| AI エージェント（Cursor） | [AI エージェント活用](/content/orgos-ai-agents) |
| OrgOS 概要 | [学習ハブ](/learning#about-orgos) |
| カリキュラム | [学習 → カリキュラム](/learning#curriculum) |

## トラブルシューティング

| 症状 | 想定原因 |
|------|----------|
| OAuth 失敗 | ブラウザ URL ≠ `.env` の `AUTH_URL` |
| DB 接続エラー | Docker 内の `DATABASE_URL` ホスト名 |
| モジュール読込失敗 | レジストリ未登録または tenant init で OFF |

## 関連資料

- [OpenOrgOS ミッション](/content/mission)
- [Stewardship モデル](/content/stewardship-model)
- [エージェントレジストリ](/agents)
