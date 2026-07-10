---
title: Language Policy
description: Governance in English, execution in local languages — tiered community language management
---

# Language Policy

OpenOrgOS follows the language strategy used by Linux and many global open-source communities.

> **One governance language. Many execution languages.**

## Core principle

| Layer | Language role |
|-------|----------------|
| **Governance** | English — RFCs, protocols, APIs, data models, cross-border collaboration |
| **Execution** | Local languages — laws, compliance, tax, employment, industry rules, local workflows |

English concepts exist **once globally**. Local legal and operational knowledge stays **decentralized** in community-owned modules and translations.

## Protocol scope

OpenOrgOS is a **global protocol for inter-organizational communication** — not an OS for internal organization management (HR, payroll, intranet workflows, etc.).

The global layer defines only:

- **Org Event Model**
- **Identity exchange**
- **Authority delegation**
- **Auditability**

**All business logic, legal interpretation, and organizational behavior are delegated to national or domain-specific committees.** Modules and committee work implement local meaning; the global project does not centralize country law or internal org operations.

Human-readable rules (Markdown/YAML) are the canonical format for the protocol. English remains the governance language for cross-border RFCs and core specifications.

## Language tiers

The platform recognizes three tiers. The web language switcher lists languages in this order.

### Core

| Code | Language | Role |
|------|----------|------|
| `en` | English | Canonical governance language; default UI fallback for invalid locale codes only |

All core contributions (Pull Requests, Issues, RFCs, architecture proposals) must be submitted in English.

### Strategic Official Communities

Official community languages with a committed translation and localization path.

| Code | Language | Community (example) |
|------|----------|---------------------|
| `ja` | Japanese | OpenOrgOS Japan |
| `pt` | Portuguese | OpenOrgOS Brazil / Lusophone |
| `es` | Spanish | OpenOrgOS Latin America / Spain |
| `zh` | Chinese | OpenOrgOS Chinese-speaking regions |
| `et` | Estonian | OpenOrgOS Estonia |

Each strategic locale ships **full platform UI translations** (navigation, forms, labels, key pages). Governance documents remain canonical in English; community translations may follow separately.

### Community-supported

Maintained by volunteer communities without the same official charter as strategic locales.

| Code | Language |
|------|----------|
| `fr` | French |
| `de` | German |
| `ru` | Russian |

These locales also ship **full platform UI translations**. Terminology and translation quality are community decisions. The global project does not control local wording.

## What English is required for

- Core governance discussions
- RFCs and protocol specifications
- Global standards and core concepts
- APIs and data models
- Architecture and cross-country collaboration

Examples of universal concepts: Organization, Role, Authority, Decision, Policy, Audit, Delegation, Capability, Contribution, Governance.

## What local languages are for

- National laws and regulatory requirements
- Tax and employment rules
- Industry-specific compliance
- Local business customs
- Country-specific operational workflows

Examples:

- **Japan** — labor law, medical devices, company law, pharmaceutical rules  
- **Brazil** — labor and tax (Portuguese community)  
- **EU** — GDPR, employment directives (often via national community adapters)

The global project **must not** centralize legal expertise for every country.

## Community rules

1. **Core contributions in English** — prevents governance fragmentation.  
2. **Community discussions in any language** — Japanese, Portuguese, Arabic, etc.  
3. **Translations belong to communities** — global project does not dictate local terminology.  
4. **Country legal modules belong locally** — e.g. `OpenOrgOS-JP-Labor`, `OpenOrgOS-EU-GDPR`.

## Platform behavior

| User selects | Platform UI | Governance docs (canonical) |
|--------------|-------------|-------------------------------|
| Any supported locale (`en`, `ja`, `pt`, `es`, `zh`, `et`, `fr`, `de`, `ru`) | Localized UI in that language | English source + community translation where available |
| Invalid / unknown locale code | English UI | English |

The locale preference is stored in a cookie and applied to navigation, forms, labels, and primary pages. Markdown content in `content/published/` may remain English until community teams publish localized copies.

## Architectural split

**Global layer** (language-neutral protocols): identities, organizations, permissions, governance, versioning, audit, contribution history.

**Local layer** (community-owned): legal requirements, compliance, tax, contracts, local workflows, translations, educational content.

Never hardcode country-specific law into the global layer. Use adapters and extension points — like kernel modules and distributions.

## Motto

```
Design globally.     Implement locally.
Govern universally.  Comply locally.

One protocol.        Many implementations.
Global principles.   Local autonomy.
```

## Related documents

- [Mission](/content/mission) — OrgOS open community purpose  
- [Governance](/governance) — roles, committees, membership  
- [Openness policy](/governance/openness) — public vs private modules  

---

## 日本語要約

- **ガバナンスは英語**（RFC・API・標準・横断協議）。**実行は現地語**（法令・税務・業界規制・現地ワークフロー）。  
- **OpenOrgOS は組織間通信のグローバルプロトコル** — 組織内部の運営管理 OS ではない。Org Event Model · identity exchange · authority delegation · auditability を定義。**ビジネスロジック・法解釈・組織行動は各国・各ドメイン委員会に委任。**  
- **Core**: English  
- **Strategic Official**: 日本語・Português・Español・中文・Eesti — **プラットフォーム UI 全翻訳提供済み**  
- **Community-supported**: Français・Deutsch・Русский — **プラットフォーム UI 全翻訳提供済み**  
- 翻訳と用語は各コミュニティが所有。国別法務モジュールはローカルコミュニティの領域。  
- 無効な locale コードのみ英語 UI にフォールバック。9 言語すべてでナビ・フォーム・主要ページがローカライズされる。
