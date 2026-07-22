---
title: Design Philosophy
description: AIA-first development, language-agnostic protocol, and Linux-style global/local split
---

> **Audience:** Stewards, contributors, integrators, and partners evaluating how OpenOrgOS is built.  
> **Related:** [Language Policy](/content/language-policy) · [Module and Agent](/content/module-and-agent) · [OrgOS with AI Agents](/content/orgos-ai-agents)

## In one paragraph

OpenOrgOS is a **thin global protocol** for inter-organizational communication — not an internal HR or payroll OS. The project is **actively built and operated with AIA** (AI Agent assistants), but AIA is not required: any capable agent environment works. Rules are written in **Markdown and YAML**; the reference **Steward CLI is TypeScript today**, yet **Python, C, Rust, Go**, and other languages can implement the same contracts. Interoperability comes from shared event models and audit rules, not from mandating one runtime.

---

## Core motto

```
Design globally.     Implement locally.
Govern universally.  Comply locally.

One protocol.        Many implementations.
Global principles.   Local autonomy.
```

| Principle | Meaning |
|-----------|---------|
| **Design globally** | Org Event Model, identity exchange, authority delegation, auditability — defined once |
| **Implement locally** | Law, tax, employment, industry rules — community modules per jurisdiction |
| **Govern universally** | RFCs, APIs, and cross-border collaboration in English |
| **Comply locally** | National committees own legal interpretation and operational workflows |

See [Language Policy](/content/language-policy) for the full tiered language strategy.

---

## Thin global layer

The global project defines **exchange mechanics only**:

- How organizations record events
- How identity is exchanged across boundaries
- How authority is delegated and scoped
- How third parties verify audit timelines

**Business logic, legal interpretation, and organizational behavior are delegated to national or domain-specific committees.** Modules implement local meaning; the global layer does not centralize country law.

Human-readable rules (Markdown/YAML) are the canonical format. English remains the governance language for cross-border RFCs and core specifications.

---

## Deterministic core, natural-language interface

OrgOS is **deterministic software** — the same inputs produce the same, auditable results.

| Layer | Role | Deterministic? |
|-------|------|:--------------:|
| **Data** | Source of truth (YAML) | Yes |
| **Skill** | Procedure | Yes |
| **CLI** | Execution | Yes |
| **Agent** | Bounded LLM — draft, explain, navigate | Partial (drafts only) |

**Agents draft. Humans approve. CLI and Skills execute.**

Wire and cross-org relay sit at the protocol layer; agents do not send Wire directly. See [Module and Agent](/content/module-and-agent) for the full Skill / CLI / Data flow.

---

## Built with AIA (AI Agent assistants)

**AIA** — **A**I **A**gent assistants — is the primary tool used to develop and operate OpenOrgOS today:

- Community site, documentation, modules, and reference steward stack
- RFC drafts, i18n, tests, and module scaffolding — always under human review

Inside your tenant, agents explain manifests, validate configs, and draft committee proposals. They are **Steward assistants**, not autonomous executives. Approvals, delegations, and audit rules still apply.

### AIA is preferred, not mandatory

| Tool | Status |
|------|--------|
| **AIA** | Primary workflow — explicit and preferred |
| **Cursor** | Equally valid with repository rules |
| **Claude Code** | Equally valid |
| **GitHub Copilot** | Equally valid |
| **Custom agents** | Valid with the same safety constraints |

Attach the same project rules: no secrets in public chats, read-only inspection before writes, human approval for destructive actions. See [OrgOS with AI Agents](/content/orgos-ai-agents).

```text
You (natural language)
    ↓
AI Agent — AIA, Cursor, Claude Code, Copilot, …
    ↓
Steward repo — manifests, modules, rules
    ↓
Skill → CLI → Data (auditable, repeatable)
    ↓
Optional: OpenOrgOS Community (public protocol & registry)
```

---

## Language-agnostic by design

The protocol is defined in **human-readable rules and open specifications**, not in a single programming language.

| Layer | Reference today | Open to |
|-------|-----------------|---------|
| **Rules & protocol** | Markdown · YAML · English RFCs | Any editor; locale modules |
| **Steward CLI** | TypeScript (reference) | Python · C · Rust · Go · … |
| **Community web** | TypeScript · Next.js | Any stack serving the APIs |
| **Domain modules** | Per-domain packs (mixed) | Committee-maintained; any language |

TypeScript for the reference CLI is a **practical choice for the current codebase**, not a permanent constraint. Like Linux: a kernel protocol and many distributions — reference code is a starting point, not the only valid build.

**Interoperability** comes from shared event models, schemas, and CLI contracts — validate against the same definitions regardless of implementation language.

---

## What this means for contributors

1. **Propose rules in Markdown/YAML** — not locked to one language runtime.
2. **Use any AI agent** — AIA is our default; attach the same safety rules elsewhere.
3. **Implement modules in the language that fits your domain** — committee review checks protocol conformance, not toolchain monopoly.
4. **Keep governance contributions in English** — local execution and translations belong to communities.

---

## Related documents

| Document | Topic |
|----------|-------|
| [Mission](/content/mission) | Global protocol purpose |
| [Language Policy](/content/language-policy) | Governance vs execution languages |
| [Module and Agent](/content/module-and-agent) | Skill / CLI / Agent boundaries |
| [OrgOS with AI Agents](/content/orgos-ai-agents) | Operating OrgOS via natural language |
| [Implementation Status](/content/implementation-status) | What is live today |

---

## 日本語要約

- **薄いグローバルプロトコル** — 組織間通信の仕組みのみ。内部 HR OS ではない。
- **AIA（AI Agent アシスタント）** で積極的に構築・運用。必須ではなく、Cursor / Claude Code / Copilot 等も同等に有効。
- **ルールは Markdown/YAML**。リファレンス CLI は現時点 **TypeScript**、**Python・C 等も選択可能**。
- **確定的なコア** — エージェントが起草、人間が承認、CLI/Skill が実行。
- モットー: *Design globally. Implement locally.* / *One protocol. Many implementations.*
