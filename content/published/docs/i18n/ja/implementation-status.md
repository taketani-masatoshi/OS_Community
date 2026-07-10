---
title: OpenOrgOS 実装状況
description: グローバルプロトコル・Wire・Community サイト・Commercial Hub・X-Road 等の国家ゲートウェイ対応 — 現時点で何が稼働しているか
---

> **対象:** スチュワード、委員会メンバー、連携担当、OpenOrgOS 導入を検討するパートナー。  
> **更新:** 2026-07 — Community は Phase 0。Hub と国家ゲートウェイアダプタは法域ごとに展開。  
> **プロトコル正本:** OrgOS リファレンスリポジトリ — 本ページとリポが矛盾する場合 **リポが優先**。

## 概要

OpenOrgOS は **三つの独立した層** から成ります。ある層の進捗を、別の層の完成と読まないでください。

| 層 | 内容 | 状態 |
|----|------|------|
| **グローバルプロトコル** | Org Event Model、Identity Exchange、Authority Delegation、Auditability | **定義済** — OrgOS リポに語彙・アーキテクチャ |
| **Wire · Witness** | 組織間トランスポートと検証可能な証拠 | **仕様化済** — OrgOS で参照実装。Community の製品ではない |
| **OrgOS ランタイム** | オンプレのスチュワードスタック（Core、Module、Agent、CLI） | **利用可能** — 導入可。モジュールはドメインにより異なる |
| **OpenOrgOS Community**（本サイト） | OSS レジストリ、委員会、ガバナンス、学習 | **稼働中** — Phase 0 |
| **Commercial Hub** | 法域ごとの有償モジュール Marketplace | **Phase 0→1** — 販売は未開始 |
| **国家ゲートウェイ**（X-Road クラス） | 各国・地域のセキュア交換網へのアダプタ | **計画段階** — 出荷済みアダプタなし。法域モジュールでマッピングを定義 |

**現在地:** Community と WILD レジストリは稼働中。Hub 販売と X-Road クラスのアダプタは **本サイト上の live 連携ではなく**、設計とコホート作業です。

---

## グローバルプロトコル層

**グローバル層は薄く保つ** — 組織境界を越えた状態交換の *仕方* を定義し、ローカルなビジネスルールは載せません。

| 能力 | 定義 | ランタイム |
|------|------|------------|
| **Org Event Model** | ミッション・OrgOS 語彙に記載 | テナント内イベントは記録可能。**組織間リレーは P2**（Wire 参照） |
| **Identity Exchange** | 定義済 | 現状はテナント内。フェデレーション交換は **Wire とともに計画** |
| **Authority Delegation** | モジュール・Agent 境界で定義 | テナント内は運用可能。組織間委任は **Wire 経路** |
| **Auditability** | Witness・タイムライン | テナント内は運用可能 |

用語（Module / Agent / Wire）: [Module and Agent](/content/module-and-agent)

---

## Wire と Witness

**Wire** は Module・Agent・Hub 製品 **ではありません**。組織間メッセージとイベントの **プロトコル輸送層** です。**Witness** は第三者が検証できる証拠を担います。

### OrgOS における位置

| # | コンポーネント | 役割 |
|---|----------------|------|
| 1 | **OpenOrgOS Core** | ルールエンジン、テナント設定、CLI |
| 2 | **Module linkage** | ドメインパック（会計、医療機器など） |
| 3 | **Wire · Witness** | 境界を越えた交換と監査証拠 |
| — | **Agent** | テナント **内** の境界付き LLM オペレータ |

よくある誤解: **「Agent が Wire を送る」** — 誤り。Wire はプロトコル層。Agent は **起案**、人間が **承認**、**CLI / Skill** が決定論的に実行。

### 実装状況

| 項目 | 状態 |
|------|------|
| 語彙・アーキテクチャ（`orgos-vocabulary.md` 等） | OrgOS リポに **公開** |
| テナント内運用（Skill、CLI、Agent、Module） | 導入済み OrgOS で **利用可能** |
| **Org Event リレー**（組織間ゲートウェイ） | **Pilot P2** — mal Wire pilot · relay/Gateway systemd（OrgOS 参照実装） |
| `community.oorgos.org` 上の Wire エンドポイント | **提供しない** — Community はレジストリ/ガバナンス。Wire ハブではない |
| **Eco / Trusted operators UI** | **稼働中（2026-07）** — `/protocol/trusted-operators` · `/protocol/jurisdiction` · `/governance/sla` · Steward mirror |

リレー提供時も **法域固有ゲートウェイの代替にはならない** — 参加組織間で **OpenOrgOS 形式のイベント** を運ぶ層です。

---

## Commercial Hub

**Hub** は **Commercial チャネル** — ライセンス事業者が **法域ごと** にモジュールを販売・保守します。Community のレビューとは別系統です。

| 項目 | 状態 |
|------|------|
| 本サイトの WILD + Community レジストリ | **稼働中** — [/modules](/modules) |
| 委員会・ガバナンス | **稼働中** — [/committees](/committees), [/governance](/governance) |
| Candidate パイプライン + Program Fund | **Phase 1 準備** — コホート・Assess 手順は定義、自動化は途上 |
| Commercial Hub（課金・保守契約） | **未稼働** — 最初の法域コホート進行中 |
| Hub での Agent 商品 | **現段階対象外** — モジュール優先 |

フェーズ詳細: [Module ecosystem](/content/module-ecosystem)

**Community の `REVIEWED` ≠ Commercial 準備完了。** Commercial 掲載は **Hub 経路** が必要で、レジストリ昇格だけでは足りません。

---

## X-Road と国家交換ゲートウェイ

### X-Road とは

**[X-Road](https://x-road.global/)** は **国家（または地域）のセキュアデータ交換基盤** です。参加組織はセキュリティサーバーで接続し、アクセスはポリシーと契約で管理されます（エストニア、フィンランドなど NIIS メンバー各国）。

X-Road が答える問い: *「自組織を **国の** 信頼できる交換ファブリックにどう接続するか？」*

### OpenOrgOS との関係

| | **OpenOrgOS Wire** | **X-Road クラスゲートウェイ** |
|---|-------------------|------------------------------|
| スコープ | OpenOrgOS 形式での **組織間イベント・状態交換** | **国家インフラ** への参加と技術ゲートウェイ |
| 主体 | 参加組織 + プロトコル仕様 | 国・地域の運用主体（NIIS 等） |
| 内容 | Org イベント、委任、監査エンベロープ | メンバー固有メッセージと国内スキーマ |
| OpenOrgOS の役割 | **意味論モデル** とスチュワードランタイム | X-Road **を置き換えない** — 委員会が求める場所で **相互運用** |

OpenOrgOS は **本番用 X-Road アダプタを現時点で出荷していません**。越境・公共セクター向けは次の組み合わせが想定されます:

1. **OrgOS ランタイム**（ローカル正本）、
2. **Wire**（OpenOrgOS 組織間イベント — リレー提供後）、
3. **法域モジュール + ゲートウェイアダプタ**（国家ゲートウェイメッセージ ↔ Org Event Model のマッピング）。

### 状態と次のステップ

| 項目 | 状態 |
|------|------|
| Community レジストリの X-Road アダプタモジュール | **未掲載** |
| OrgOS リポの参照アダプタ | **未出荷** |
| 公共セクター / ゲートウェイ相互運用の委員会チャータ | **募集中** — ドメイン・法域委員会 |
| ゲートウェイプロファイルの OOO RFC 経路 | **利用可能** — OOO Program 経由の標準化 |

X-Road 参加環境で OpenOrgOS 連携が必要な場合は、**法域モジュールを提案**するか、該当 [委員会](/committees) に参加してください。ゲートウェイマッピングは **ローカルルール** であり、グローバルプロトコルではありません。

---

## OpenOrgOS Community サイト（本サイト）

`community.oorgos.org` が **今日** 提供するもの:

| 機能 | 状態 |
|------|------|
| モジュールレジストリ（WILD、ライフサイクル） | **稼働中** |
| WILD モジュール提案 | **稼働中** |
| 委員会・ドメインガバナンス | **稼働中** |
| 認定・ロール申請 | **稼働中** |
| Identity（Google ログイン、GitHub / LinkedIn 連携） | **稼働中** |
| 学習ガイド・ドキュメント（`/content/*`） | **稼働中** |
| Academy トラック | **一部** — Academy サービス設定に依存 |
| Commercial Hub / 決済 | **本サイト外** |
| Wire / Org Event 受信 | **本サイト外** |

インフラ: 概要は [oorgos.org](https://oorgos.org)。Community はスチュワード運用 + Cloudflare Tunnel（手順はリポ `docs/`）。

---

## OrgOS ランタイム（オンプレ）

自社ハードウェアに OrgOS を導入するスチュワード向け:

| 項目 | 状態 |
|------|------|
| インストール・デジタルツインセットアップ | **公開** — [/content/orgos-install-setup](/content/orgos-install-setup) |
| Core Agent（Finance、Secretary、Steward 等） | 参照スタックで **利用可能** |
| ドメインモジュール（rental、jp_medical_device 等） | **モジュールにより異なる** — [/modules](/modules) |
| Control Plane ハートビート / アウトバウンド Agent | **アーキテクチャ定義済** — `docs/plans/` のハイブリッド要件 |
| 他組織への Org Event リレー | **P2 — GA 前** |

---

## ロードマップ要約

| フェーズ | 焦点 | 代表成果物 |
|---------|------|------------|
| **現在（Phase 0）** | Community OSS、レジストリ、委員会 | 本サイト、WILD、ガバナンス |
| **Phase 0→1** | 最初の Hub コホート | 1 法域での手動 Commercial 経路 |
| **Phase 1–2** | Candidate + Assess + Program Fund | 監査前払いパイプライン |
| **プロトコル P2** | Org Event リレー（Wire ゲートウェイ） | 組織間イベント輸送 |
| **法域ごと** | X-Road / 国家ゲートウェイアダプタ | モジュール + 委員会定義のマッピング |

---

## 関連リンク

| リソース | リンク |
|----------|--------|
| Module ecosystem（Hub フェーズ） | [/content/module-ecosystem](/content/module-ecosystem) |
| Module / Agent / Wire 用語 | [/content/module-and-agent](/content/module-and-agent) |
| ミッション・グローバルプロトコル | [/content/mission](/content/mission) |
| モジュールレジストリ | [/modules](/modules) |
| ガバナンス | [/governance](/governance) |
| OrgOS インストールガイド | [/content/orgos-install-setup](/content/orgos-install-setup) |
| ドキュメント一覧 | [/content](/content) |
