---
title: モジュールエコシステム — WILD・Candidate・Commercial
description: 信頼段階、Community と Commercial の境界、責任、Program Fund、展開フェーズ
---

> **対象:** モジュール作者、メンテナ、Hub パートナー、委員会メンバー。  
> **状態:** Phase 0–1 — WILD と Community レジストリは稼働中。Candidate と Commercial は段階的に展開。

## 二つの独立した軸

モジュールは **二つの軸** で位置づけます。混同しないでください。

| 軸 | 答える問い | 本サイトでの例 |
|----|------------|----------------|
| **品質ライフサイクル** | 実装の成熟度は？ | 提案 → コミュニティ → レビュー済 → 参照実装 → 公式 → LTS |
| **信頼・商用段階** | どこに掲載され、誰が背書きするか？ | WILD → Candidate → Commercial |

品質が **レビュー済** でも、信頼段階が **WILD** のまま、という組み合わせはあり得ます。**Community の REVIEWED は Commercial 準備完了を意味しません。**

---

## 信頼段階: WILD / Candidate / Commercial

| 段階 | 掲載場所 | 保証 | 販売・保守 |
|------|----------|------|------------|
| **WILD** | OpenOrgOS Community OSS Registry | **なし** — 自己責任 | 作者のみ。マーケットプレイス対象外 |
| **Candidate** | Registry + Hub 参照掲載 | **安全保証なし** — 監査前払い済み、Assess 評価通過 | 未販売。コホート選定中 |
| **Commercial** | **Hub のみ**（Community REVIEWED 経由なし） | 法域 **コホート** が販売・保守 | 法域ごとのライセンス Hub 事業者 |

### WILD

- 誰でも提案・登録可能。
- [モジュールレジストリ](/modules) に未審査のコミュニティ提案として掲載。
- OpenOrgOS Community は WILD モジュールを **推奨・保証・保険付保しません**。

### Candidate

- 法域 **コホート** が将来の Commercial 向けモジュールを選定。
- **C（監査コスト）** を Assess 開始前に **Program Fund** へ前払い回収。
- **Assess** 評価（OOO 認定の審査機関によるセキュリティ / コンプライアンスレビュー）を実施。
- Assess 通過は **安全保証ではありません** — Hub 掲載候補に進める条件です。

### Commercial

- **法域 Hub** を通じてのみ掲載・販売。Community レジストリの昇格フローとは別経路。
- **コホート**（メンテナ + Hub 事業者）がその法域での販売・更新・サポートを担う。
- Community の `REVIEWED` は Commercial への **近道ではありません**。

---

## Community ≠ Commercial（Marketplace）

| | **OpenOrgOS Community** | **Commercial Hub / Marketplace** |
|---|-------------------------|----------------------------------|
| 目的 | OSS レジストリ、委員会、スチュワードシップ | 有償モジュール、保守契約 |
| お金 | 販売なし。Candidate 用 Program Fund のみ | 売上、手数料、分配 |
| 背書き | コミュニティレビュー。**製品保証なし** | 法域コホート + ライセンス Hub |
| 掲載 | WILD・Community モジュール | Commercial モジュールのみ |

**Community のレビューを Commercial の推薦と読まないでください。** Marketplace は別チャネルで、責任主体も異なります。

---

## 責任と存続

デフォルトの責任チェーン:

1. **モジュール作者 / メンテナ** — 第一責任。
2. 作者が存続不能な場合 — **ドメインまたは法域委員会** がガバナンス規則に従いスチュワードシップを引き継ぎ得る。

Commercial モジュールには、その法域の **Hub 事業者** が販売・保守の窓口として加わります。Community 委員会が販売者にはなりません。

詳細は [スチュワードシップモデル](/content/stewardship-model) を参照。

---

## Program Fund と監査前払い（C）

**Program Fund** は **OOO**（OpenOrgOS Organization — 認定、標準 RFC、Candidate パイプライン）が運用するエコシステムプログラム用の資金池です。

Candidate 昇格では:

- **C** = 当該モジュール・法域の監査 / Assess 見積コスト。
- **C は Assess 着手前** に回収（将来の Commercial 売上から回収可能な場合あり）。
- Hub 外の野良販売・作者直収は、このウォーターフォールに自動参加しません。

---

## Commercial 売上の流れ（概念）

法域で Commercial 売上が発生した場合、次の順で充当:

```text
売上
  → ① Program Fund: C（監査前払い）の回収（該当する場合）
  → ② Hub 事業者手数料
  → ③ コホートのプロフェッショナルサービス（メンテナ、サポート）
```

具体的な率・上限は法域 Hub 契約で定義 — Community 上には載せません。

---

## 法域コホートと Hub

各 **法域**（例: 日本、EU 加盟国、米国州バンドル）に次が置けます:

| 役割 | 機能 |
|------|------|
| **コホート** | その法域向けモジュールをスチュワードするメンテナ・専門家 |
| **Hub 事業者** | Commercial モジュールの販売・請求・サポート |
| **Assess 提供者** | OOO 認定の審査機関（多くは既存セキュリティ / コンプライアンス事業者） |

地理的拡大は、各国子会社の乱立より **既存事業者へのライセンス** を優先します。

---

## Assess と Hub の違い

| | **Assess** | **Hub** |
|---|------------|---------|
| 提供物 | 評価、認定インプット | マーケットプレイス、請求、サポート |
| 典型提供者 | 認定審査機関（既存事業者） | 法域のライセンス事業者 |
| Community の役割 | 標準 + OOO 認定 | なし — Commercial チャネル |

Assess は「この法域の基準を満たしたか」。Hub は「誰が商用販売・保守するか」。

---

## エージェントと Marketplace

**エージェントは当面 Marketplace 対象外です。** Commercial パイプラインは **モジュール** を先行します。Community 上のエージェントカタログは参照・スチュワードシップ用であり、Commercial 製品ではありません。

用語は [Module and Agent](/content/module-and-agent) を参照。

---

## 展開フェーズ

| Phase | 稼働内容 | 焦点 |
|-------|----------|------|
| **0** | WILD + Community レジストリ、委員会 | OSS 貢献。Commercial 販売なし |
| **1** | 最初の法域・コホート、手動決済 | 1 本の Hub 経路を通しで検証 |
| **2** | OOO Program 正式化、Program Fund 運用 | Candidate パイプライン + Assess 認定 |
| **3** | 追加法域ライセンス | 売上・法務トリガーで拡大。法人の先行乱立はしない |

**現在地:** Phase 0 から Phase 1 へ。

---

## 組織レイヤー（抽象）

具体社名なしの三層:

| レイヤー | 役割 |
|----------|------|
| **OpenOrgOS Community** | OSS、レジストリ、委員会 — Commercial 販売なし |
| **OOO Program** | 認定、Program Fund、審査基準 |
| **Commercial ライセンシー** | 法域ごとの Hub 事業者・Assess 事業者 |

Community は薄く、Commercial は分離。

---

## 関連リンク

| リソース | リンク |
|----------|--------|
| モジュールレジストリ | [/modules](/modules) |
| ガバナンス | [/governance](/governance) |
| スチュワードシップ | [/content/stewardship-model](/content/stewardship-model) |
| 公開範囲・Private Module | [/governance/openness](/governance/openness) |
| Module / Agent 用語 | [/content/module-and-agent](/content/module-and-agent) |
| 実装状況（Wire、Hub、X-Road） | [/content/implementation-status](/content/implementation-status) |
