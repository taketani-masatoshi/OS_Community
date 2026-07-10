---
title: Module and Agent — OrgOS Terminology
description: For CEOs and Steward Operators — Module as extension pack, Agent as bounded LLM operator, and how Skill, CLI, and Data relate.
---

> **Audience:** CEOs, Steward Operators, non-engineers.  
> **Canonical source (summary on web):** OrgOS repo `docs/org-os/orgos-vocabulary.md` §1–§3 · `docs/agent_architecture.md` · `steward/rules/agent_skill_architecture.md`  
> If this page and the repo disagree, **the repo wins**.

> **On this page:** common corrections · one-sentence definitions · five nuances · Skill / CLI / Data flow · worked examples · decision table · legacy terms

## Correction — common misconceptions

“Module = spec only” and “Agent = helper UI” are both wrong. A **Module** is an extension pack with **authoritative data · seed · CLI · regulation linkage**. An **Agent** covers **read boundaries · delegation · reporting · human approval gates · summaries**. Deterministic work (calculate, validate) runs through **Skill + CLI**; agents do not directly mutate source-of-truth data as a rule.

---

## In one sentence

| | **Module** | **Agent** |
|---|------------|-----------|
| **What** | **Extension pack** for a business domain | **Bounded LLM operator** for that domain (+ cross-cutting) |
| **Source of truth** | manifest · seed · CLI · Skill · `modules.yaml` | `*_agent.md` · `registry.yaml` |
| **ON / OFF** | Per tenant (`modules.yaml`) | Core always on · extensions per org catalog |

---

## Important nuances (required reading)

1. **Module is not “spec only”** — it ships **authoritative data · seed · CLI · regulation linkage** (e.g. REG-025/026).
2. **Agent is not “helper UI”** — it includes **read boundaries · delegation · reporting · human approval gates · summaries**.
3. **Agents are not module-only** — **Finance, Secretary, Steward**, etc. are core agents always on.
4. **Not 1:1** — e.g. Module `jp_medical_device` ↔ Core Agent `medical_device_regulatory` (**proxy** relationship).
5. **Deterministic work = Skill + CLI** — agents do not directly edit source data (principle).

---

## Module / Agent / Skill / CLI / Data

```text
Module (extension pack)          Agent (bounded LLM)
  Data · seed · CLI · Skill        read boundary → draft · delegate · report
         │                                    │
         └──────────► Skill ──► CLI ──► Data ◄┘
                              (human approval gate before CLI when required)
```

| Layer | Role | Deterministic? | Example |
|-------|------|:--------------:|---------|
| **Data** | Source of truth (YAML) | Yes | `data/properties/` · `data/medical-device/` |
| **Skill** | Procedure | Yes | Monthly close · NOI analysis · QMS draft flow |
| **CLI** | Execution | Yes | `orgos operations …` · `validate` |
| **Agent** | Bounded LLM | Partial (drafts) | Finance summary · regulatory owner |
| **Module** | Pack of the above | — | rental · jp_medical_device |

---

## Where they sit in OrgOS

### Four components

| # | Component | Module / Agent |
|---|-----------|----------------|
| 1 | **OpenOrgOS Core** | Neither |
| 2 | **Module linkage** | **Module here** |
| 3 | **Wire** · **Witness** | Neither |
| — | **Implementation** | **Agents** (core + module) |

### Four layers (daily operations)

```text
OrgOS (rules · CLI · tenant config)
    ↓
Agent (read · draft · delegate · report)
    ↓
Skill (procedure)
    ↓
Data (source of truth)
```

---

## Worked examples

### rental Module — property rental

| Item | Detail |
|------|--------|
| **Module ID** | `rental` |
| **Includes** | Rental property data (`data/properties/`) · rental plan · NOI-related Skills |
| **ON/OFF** | `modules.yaml` — “Does this company do rental?” → **Module** |
| **Module Agent** | `steward/modules/rental/agent.md` — active when module ON |
| **Activate** | `orgos modules activate rental` |

Finance Agent views P&L **without** rental module — “Who watches forecast?” → **Agent (finance)**.

### jp_medical_device Module — medical device pack

| Item | Detail |
|------|--------|
| **Module ID** | `jp_medical_device` |
| **Data** | `data/medical-device/` (obligations · licenses · ledgers) |
| **CLI** | `orgos operations medical-device show|validate|qms|gvp|ledger …` |
| **Regulations** | REG-025 (QMS) · REG-026 (GVP) — linked via `regulations.yaml` |
| **Activate** | `orgos modules activate jp_medical_device` |

### medical_device_regulatory Agent — regulatory owner (proxy)

| Item | Detail |
|------|--------|
| **Agent ID** | `medical_device_regulatory` (**core agent** — not 1:1 with module) |
| **Role** | QMS/GVP **primary owner** · ISO 13485 controls (`CTL-13485-*`) |
| **Reporting** | Field → **COO relay** → **Steward Agent** (`chain-policy.yaml`) |
| **Forbidden** | Auto-submit to PMDA / prefectures — **humans only** |
| **Init** | `orgos agent order --to medical_device_regulatory` |

**Proxy:** Module `jp_medical_device` provides CLI · ledgers · draft Skills; Core Agent `medical_device_regulatory` owns cross-cutting control and reporting.

```bash
orgos modules activate jp_medical_device
orgos agent order --to medical_device_regulatory --subject "Review initial QMS ledger state"
orgos operations medical-device validate
```

---

## Quick decision table

| Question | Answer |
|----------|--------|
| Does this company run rental? | **Module** (`modules.yaml` / `orgos modules activate rental`) |
| Who watches P&L / forecast? | **Agent** (finance) — no module required |
| Where is the ledger source of truth? | **Module Data** (e.g. `data/medical-device/ledger-registry.yaml`) |
| Regulatory reporting path? | **Agent** → COO → Steward |
| Calculate / validate? | **Skill / CLI** (agent does not rewrite source data directly) |
| Module 1:1 with agent? | **No** — medical device uses Module + core agent **proxy** |

---

## Common mix-ups

| Mix-up | Correct |
|--------|---------|
| Module = PDF spec | **Data · seed · CLI · regulations** as a pack |
| Agent = chat UI | **Boundaries · delegation · reporting · approval · summary** |
| Agents only after module ON | **Finance · Secretary always on** |
| Turn off Finance via module | Finance is **core agent** |
| Agent sends Wire | Wire is protocol — Secretary **drafts** → Operator → CLI |

---

## Not an Agent

| Term | Meaning |
|------|---------|
| **Operator** | Human approver |
| **Skill** | Procedure (deterministic) |
| **CLI** | Deterministic command |

---

## Legacy terminology

> **Footnote:** Reading old docs (canonical: `orgos-vocabulary.md` §1–§3)

| Legacy | Read as |
|--------|---------|
| **Steward OS** (product name) | **OrgOS** |
| **Steward** (as product) | **Steward Agent** (executive — same tier as Secretary) |
| `steward` CLI | **`orgos` CLI** (preferred) |
| `steward-os` npm | **`orgos-reference` npm |

---

## Commercial marketplace scope

**Agents are not Marketplace products at this stage.** The Commercial pipeline focuses on **modules** first. Agent definitions on Community remain reference documentation for Steward OS operations — not paid Hub listings.

For trust tiers (WILD / Candidate / Commercial) and the Community vs Marketplace boundary, see [Module ecosystem](/content/module-ecosystem).

---

## Canonical paths & related links

### OrgOS reference repo (canonical paths)

| Document | Path |
|----------|------|
| Vocabulary | `docs/org-os/orgos-vocabulary.md` |
| Agent architecture | `docs/agent_architecture.md` |
| Agent / Skill layers | `steward/rules/agent_skill_architecture.md` |
| Core agents index | `steward/core/agents/00-このフォルダについて.md` |
| JP medical device module agent | `steward/jurisdiction-packs/JP/modules/jp_medical_device/agent.md` |
| Medical device regulatory agent | `steward/core/agents/medical_device_regulatory_agent.md` |

### OpenOrgOS Community (web)

| Resource | Link |
|----------|--------|
| Module catalog | [Modules](/modules#registry) |
| Agent catalog | [Agents](/agents) |
| Module ecosystem (WILD / Candidate / Commercial) | [Module ecosystem](/content/module-ecosystem) |
| Implementation status (Wire, Hub, X-Road) | [Implementation status](/content/implementation-status) |
| Hardware install | [Getting started](/getting-started) |
| Full setup | [OrgOS install guide](/content/orgos-install-setup) |
| Cursor operations | [AI agents guide](/content/orgos-ai-agents) |
| All docs | [Content](/content) |

---

*Summary publication of OrgOS vocabulary v1.2. No L2/L3 data (account numbers, home addresses, etc.) on this page.*
