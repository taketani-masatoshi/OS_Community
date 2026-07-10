# OrgOS ハイブリッドデプロイメント — 要件定義書 v0.1

**ステータス**: Draft v0.2（cloud スタックスケルトン着手）  
**最終更新**: 2026-06-27  
**関連**: [OpenOrgOS Mission](../../content/published/docs/mission.md) · [Openness Policy](../../content/published/docs/openness-policy.md)

---

## 1. 背景・目的

OpenOrgOS は **組織間通信のグローバルプロトコル**（Community / `openorgos.net`）と、**各社の内部運営基盤**（Org Runtime / Org Console）の二層で構成される。

各社は **Mac mini を自社で購入**し、GitHub からソースを取得して Docker でデプロイする。IT 専任者がいない企業（Steward Operator レベル）でも導入できることを前提とする。

一方、Org Console を完全ローカル閉域にすると **社外から状況を把握できない**。Tailscale 等の VPN は IT リテラシーを要するため、**安全性を保ちつつ可視化に特化した有料 SaaS**（`southwood.cloud`）を補助レイヤとして提供する。

### 1.1 目的

| # | 目的 |
|---|------|
| P1 | 各社の業務データ正本を **自社 Mac mini 上に保持**する |
| P2 | IT 不在でも Org Console を **利用**できる（開発・デプロイは Steward 支援） |
| P3 | 経営者・秘書・取引先から **必要な情報を可視化**する（**リモート操作は原則禁止**） |
| P4 | Community（`openorgos.net`）と SaaS（`southwood.cloud`）を **ドメイン・認証・DB で分離**する |

### 1.2 スコープ外（v0.1）

- Org Console 内の全業務モジュール（人事・会計等）の機能詳細設計
- Community サイト本体の改修
- 各社 Mac mini のハード調達・物理設置代行
- リモートからの OrgOS **操作・指示**（稟議承認、設定変更等）— セキュリティ上 v1 では非対応

---

## 2. ステークホルダーとペルソナ

| ペルソナ | 説明 | 主な利用場所 |
|----------|------|--------------|
| **Steward Operator** | OrgOS を「利用する」担当。IT リテラシー低（TCP/IP・Python を説明できない） | 社内 Mac mini / LAN |
| **経営者** | KPI・キュー状況を外から確認したい | `dash.southwood.cloud`（スマホ等） |
| **秘書** | Steward に代わりダッシュボードを確認・社内共有 | SaaS ダッシュボード + 社内 Console |
| **取引先・外部** | 問い合わせ・取引キューの進捗を確認 | SaaS（限定 read-only） |
| **OpenOrgOS 運営** | Control Plane 運用・サポート | MacBook Air → 将来 Mac mini |

---

## 3. デプロイメントモデル

### 3.1 三層アーキテクチャ

```text
┌─────────────────────────────────────────────────────────────────┐
│  L1: Community（openorgos.net）                                  │
│  プロトコル · モジュールレジストリ · 認定 · 公開ガバナンス          │
│  認証: GitHub OAuth                                               │
└─────────────────────────────────────────────────────────────────┘
                              ▲ Org Event（プロトコル層）
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│  L2: Control Plane SaaS（southwood.cloud）                       │
│  死活監視 · 集計ダッシュボード · Slack · 外部キュー可視化          │
│  認証: Magic Link / Google / Microsoft（Community とは別）         │
│  配置: MacBook Air（Docker）→ 将来 運営 Mac mini へ移管            │
└─────────────────────────────▲───────────────────────────────────┘
                              │ HTTPS Outbound のみ（Mac mini → SaaS）
                              │ ※ Mac mini 側 Cloudflare Tunnel は使わない
┌─────────────────────────────┴───────────────────────────────────┐
│  L3: Org Runtime + Console（各社 Mac mini · オンプレ）             │
│  業務データ正本 · Private Module · ローカル PostgreSQL             │
│  社内 URL: {org-slug}.southwood.cloud → プロキシ（データ正本はローカル）│
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 ドメイン設計（確定）

| ホスト名 | 用途 | 配置 |
|----------|------|------|
| `openorgos.net` | OpenOrgOS Community | 既存 |
| `southwood.cloud` | SaaS ランディング・契約 | MacBook Air Docker |
| `control.southwood.cloud` | Control Plane API | 同上 |
| `dash.southwood.cloud` | 経営・秘書向けダッシュボード | 同上 |
| `{org-slug}.southwood.cloud` | Org Console プロキシ（エッジ） | Cloudflare → Mac mini Outbound トンネル |
| `{subdomain}.{org-owned-domain}` | 将来: Org 自社ドメイン（CNAME → southwood.cloud） | オプション |

**Cookie / セッション**: `.openorgos.net` と `.southwood.cloud` は共有しない。

### 3.3 Cloudflare

| 項目 | 方針 |
|------|------|
| `southwood.cloud` Tunnel | **新規 Tunnel ID**（`openorgos.net` とは別） |
| 各社 Mac mini | **Cloudflare Tunnel 不使用**。`control.southwood.cloud` への **HTTPS Outbound のみ** |
| 理由 | インバウンド開放不要 · 攻撃面最小 · IT 不在でもルーター設定不要 |

### 3.4 Org Console URL（確定）

- **標準**: `{org-slug}.southwood.cloud` 経由でプロキシ。業務データ正本は Mac mini ローカル DB。
- **将来**: Org 本体ドメインからサブドメインを割当（例: `org.acme.co.jp` → CNAME → southwood.cloud エッジ）。

### 3.5 運営インフラ移行計画

| フェーズ | ホスト | 備考 |
|----------|--------|------|
| 現在〜移行まで | MacBook Air + Docker + Cloudflare Tunnel | 開発・ステージング兼 **本番 SaaS** |
| 移行後 | 運営側 Mac mini | Docker Image を移管。MacBook Air スリープによる SaaS 停止は移行まで許容 |
| 各社 | 各社 Mac mini | MacBook Air / 運営 Mac mini の停止と **独立**（LAN 内 Console は継続） |

---

## 4. 「外から見える粒度」の説明（K1 回答用）

「外から状況を把握」とは、**誰が・どの深さまで情報を見られるか**の段階区分である。

| レベル | 名称 | 見える内容 | 例 | v1 |
|:------:|------|------------|-----|:--:|
| **L1** | 死活 | 起動しているか、バージョン、最終同期時刻 | 「OrgOS は正常」 | ✅ |
| **L2** | 集計 | 件数・推移のみ（個人名なし） | 「未処理 3 件」「今月イベント 120」 | ✅ |
| **L3** | 可視化 | 経営ダッシュボード・キュー内容の **表示** | 取引キュー一覧、秘書↔Steward 共有ダッシュボード | ✅ |
| **L4** | 操作 | 社外から OrgOS へ **指示・承認・設定変更** | リモート稟議承認、モジュール設定変更 | ❌ |

### 4.1 v1 の確定方針（K1 = **L3** · K2 · K3）

**可視化粒度**: **L3 まで**（経営ダッシュボード・キュー内容の read-only 表示）。L4（リモート操作）は v1 非対応。

**許可（L1〜L3）**

- 経営ダッシュボードの **表示**（秘書が Steward に代わり確認可能）
- 外部からの問い合わせ・取引に関する **キューの可視化**
- Slack 連携（通知・状態共有 — 操作系は含めない）
- Steward がアクセスする範囲の **可視化**

**禁止（L4）**

- 外部から OrgOS への **指示・操作**（セキュリティ確保のため v1 非対応）
- スチュワード内部の秘匿コミュニケーション原文（可視化の範囲は秘書レベルまで）

---

## 5. 機能要件

### 5.1 Org Runtime Agent（各社 Mac mini）

| ID | 要件 |
|----|------|
| FR-A1 | GitHub からソース取得し Docker Compose で起動 |
| FR-A2 | 業務データをローカル PostgreSQL に保存（正本） |
| FR-A3 | 起動時・定期で `control.southwood.cloud` へ HTTPS Outbound（死活・バージョン・health） |
| FR-A4 | L2/L3 用集計データを SaaS へ **プッシュ**（原文 DB は送らない） |
| FR-A5 | `{org-slug}.southwood.cloud` へのプロキシ用 **アウトバウンド接続**を維持（Cloudflare Tunnel on-prem 不使用） |
| FR-A6 | Community Module / Private Module の実行 |

### 5.2 Control Plane（`southwood.cloud` SaaS）

| ID | 要件 | 優先 |
|----|------|:----:|
| FR-C1 | Org 登録・`org-slug` 発行・ライセンス管理 | P0 |
| FR-C2 | Mac mini エージェント死活監視・アラート | P0 |
| FR-C3 | **外部問い合わせ・取引キューの可視化**（L3 read-only） | P0 |
| FR-C4 | **Slack 連携**（通知・キュー状態のチャンネル投稿） | P0 |
| FR-C5 | 経営ダッシュボード API（L2/L3、個人名マスキングオプション） | P1 |
| FR-C6 | Org Event リレー（組織間通信ゲートウェイ） | P2 |
| FR-C7 | 検証済みアップデートバンドル配信 | P2 |

> **K2 有料優先 3 機能**: 外部キュー可視化 · Slack 連携 · （外部からの指示は v1 非対応のため、可視化 + 通知に集約）

### 5.3 Mobile / Web Dashboard（`dash.southwood.cloud`）

| ID | 要件 |
|----|------|
| FR-D1 | L1 死活ステータス表示 |
| FR-D2 | L2/L3 経営ダッシュボード（read-only） |
| FR-D3 | 外部キュー一覧（read-only） |
| FR-D4 | Org Console（LAN / プロキシ URL）へのリンク表示のみ — **リモート操作 UI なし** |

### 5.4 Community 連携（`openorgos.net`）

| ID | 要件 |
|----|------|
| FR-I1 | Org Runtime → Community へ Org Event 送信（プロトコル層） |
| FR-I2 | Community アカウント（GitHub）と Org 管理者の **任意リンク** |
| FR-I3 | Community から Community Module メタデータを参照（pull） |

### 5.5 認証（確定方向）

| サービス | 方式 |
|----------|------|
| Community (`openorgos.net`) | GitHub OAuth（既存） |
| SaaS (`southwood.cloud`) | Magic Link / Google / Microsoft |
| Org Console（LAN / プロキシ） | Org ローカルセッション（SaaS 認証とは別） |

---

## 6. データ分類と保存場所

| 分類 | 例 | 保存場所 | SaaS 送信 |
|------|-----|----------|-----------|
| **D1 機密正本** | 給与、契約全文、顧客 PII、監査ログ原文 | Mac mini DB のみ | ❌ |
| **D2 Steward 可視** | 経営 KPI、処理キュー、ダッシュボード用集計 | Mac mini 正本 → 集計のみ SaaS | ✅（集計・マスク済み） |
| **D3 メタデータ** | org-slug、バージョン、死活、ライセンス | SaaS DB | ✅ |
| **D4 外部キュー** | 問い合わせ・取引リクエスト（可視化用） | Mac mini 正本、SaaS に **表示用コピー** | ✅（L3 read-only） |

**原則**: SaaS は **可視化のための派生データ**のみ保持。D1 は Mac mini から出さない。

---

## 7. 非機能要件

| ID | 要件 |
|----|------|
| NFR-1 | Mac mini はインバウンド 0（Outbound HTTPS のみ） |
| NFR-2 | SaaS から Mac mini への **操作 API** を公開しない（v1） |
| NFR-3 | Community / SaaS / Org の Cookie・DB を分離 |
| NFR-4 | 全通信 TLS 1.2+ |
| NFR-5 | MacBook Air 停止時: SaaS 不可 · 各社 LAN 内 Console は継続 |
| NFR-6 | Steward Operator が **利用**できる UI（専門用語・CLI 前提にしない） |

---

## 8. 課金・サービス（ドラフト）

| プラン | 内容 |
|--------|------|
| **Org オンプレ** | Mac mini + ソース（Community Module 無償範囲） |
| **SaaS Basic（有料）** | 死活 + L2 集計 + Slack + 外部キュー可視化 |
| **SaaS Pro（将来）** | カスタムドメイン、長期ログ、優先サポート |

詳細料金は別途。

---

## 9. MVP 成功基準（K4 確定）

### 9.1 Phase 1 — 短期（最優先）

- [ ] `docker-compose.cloud.yml` で MacBook Air 上に SaaS スタックが起動する
- [ ] Org Agent（Mac mini / 開発用スタブ）が `control.southwood.cloud` へ **HTTPS Outbound** で接続する
- [ ] **`{org-slug}.southwood.cloud` 経由で Org Console にアクセスできる**（エッジプロキシ · データ正本はオンプレ）

### 9.2 Phase 2 — 中期（本番 SaaS 稼働）

- [ ] MacBook Air Docker + **Cloudflare Tunnel（southwood.cloud 用・別 ID）** で本番公開
- [ ] L3 経営ダッシュボードが `dash.southwood.cloud` で read-only 表示
- [ ] 外部問い合わせ・取引キューの可視化 + Slack 通知
- [ ] Community（`openorgos.net`）と SaaS（`southwood.cloud`）の認証・Cookie 分離
- [ ] リモートからの OrgOS **操作・指示**ができないことを確認

### 9.3 Phase 3 — 移行

- [ ] Docker Image を運営 Mac mini へ移管
- [ ] 各社 Mac mini で Org Console + ローカル DB が本番運用

### 9.4 Org Console URL（v1 確定）

- **v1 標準**: `{org-slug}.southwood.cloud`（Southwood がエッジを提供）
- Org 自社ドメイン CNAME は Phase 2 以降

---

## 10. IT 不在の定義（K5 確定）

**IT 不在** = IT リテラシーが低く、TCP/IP や Python が何か説明できないレベルの人員。

- Steward Operator もこのレベルを想定
- **利用者**（システムを使う人）を指し、**開発者ではない**
- デプロイ初回・障害時は Steward 認定パートナー / 運営支援を想定
- Tailscale 等の VPN 設定は **要求しない**

---

## 11. リスクと未決事項

| # | 項目 | 状態 |
|---|------|------|
| R1 | `{org-slug}.southwood.cloud` プロキシの実装方式（Outbound WebSocket / QUIC 等） | **解決** — [ADR: Outbound Agent Protocol](../adr/outbound-agent-protocol.md) |
| R2 | 外部キューの入力経路（Web フォーム / メール / API） | 要設計 |
| R3 | Slack App の OAuth スコープとテナント分離 | 要設計 |
| R4 | Org 自社ドメイン CNAME の時期と手順 | Phase 2 |
| R5 | 運営 Mac mini への移管 runbook | MacBook Air 本番稼働後 |
| R6 | Control Plane の DB バックアップ（運営 Mac mini） | 要設計 |

---

## 12. 次のドキュメント

| ドキュメント | 内容 |
|--------------|------|
| ADR: Outbound Agent Protocol | [docs/adr/outbound-agent-protocol.md](../adr/outbound-agent-protocol.md) ✅ |
| ADR: Edge Proxy without Inbound | Outbound ADR §5 に統合 |
| [cloud-stack-readme.md](./cloud-stack-readme.md) | `docker-compose.cloud.yml` 起動手順 |
| `scripts/start-cloudflare-tunnel-cloud.sh` | southwood.cloud 用 Tunnel（新 ID） |

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-27 | v0.1 初版 — ステークホルダーヒアリング反映 |
| 2026-06-27 | v0.2 — K1=L3、K4 Phase 分離、`docker-compose.cloud.yml` 着手 |
