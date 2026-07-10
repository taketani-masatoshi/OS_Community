---
title: Module Ecosystem — WILD, Candidate, and Commercial
description: Trust tiers, Community vs Commercial boundary, responsibility, Program Fund, and rollout phases
---

> **Audience:** Module authors, maintainers, Hub partners, committee members.  
> **Status:** Phase 0–1 — WILD and Community registry are live; Candidate and Commercial roll out incrementally.

## Two independent axes

Every module sits on **two axes** that must not be confused:

| Axis | Question it answers | Examples on this site |
|------|---------------------|------------------------|
| **Quality lifecycle** | How mature is the implementation? | Proposal → Community → Reviewed → Reference → Official → LTS |
| **Trust & commercial tier** | Where is it listed, and who backs it? | WILD → Candidate → Commercial |

A module can be **Reviewed** in quality while still **WILD** in trust tier. **Community REVIEWED does not mean Commercial-ready.**

---

## Trust tiers: WILD, Candidate, Commercial

| Tier | Where it lives | Guarantee | Who sells / supports |
|------|----------------|-----------|----------------------|
| **WILD** | OpenOrgOS Community OSS Registry | **None** — use at your own risk | Authors only; no marketplace |
| **Candidate** | Registry + Hub reference listing | **No safety warranty** — audit prep paid, Assess evaluation passed | Not sold yet; cohort selection in progress |
| **Commercial** | **Hub only** (not via Community REVIEWED path) | Sales & maintenance by **jurisdiction cohort** | Licensed Hub operator per legal domain |

### WILD

- Anyone can propose and register.
- Appears in the [Module Registry](/modules) as an unreviewed community proposal.
- OpenOrgOS Community does **not** endorse, warrant, or insure WILD modules.

### Candidate

- A jurisdiction **cohort** selects modules for a future Commercial path.
- **C (audit cost)** is collected upfront into the **Program Fund** before assessment begins.
- **Assess** evaluation runs (security / compliance review by OOO-accredited assessors).
- Passing Assess does **not** grant a safety guarantee — it means the module may proceed toward Hub listing.

### Commercial

- Listed and sold **only through a jurisdiction Hub**, not through the Community registry promotion flow.
- A **cohort** (maintainers + Hub operator) handles sales, updates, and support in that legal domain.
- Community `REVIEWED` status is **not** a shortcut into Commercial.

---

## Community ≠ Commercial (Marketplace)

| | **OpenOrgOS Community** | **Commercial Hub / Marketplace** |
|---|---------------------------|----------------------------------|
| Purpose | OSS registry, committees, stewardship | Paid modules, support contracts |
| Money | No sales; optional Program Fund for Candidate | Sales, fees, revenue share |
| Backing | Community review; **no product warranty** | Jurisdiction cohort + licensed Hub |
| Listing | WILD and Community modules | Commercial modules only |

**Do not read Community review as Commercial endorsement.** The Marketplace is a separate channel with separate responsibility.

---

## Responsibility and continuity

Default responsibility chain:

1. **Module authors / maintainers** — primary responsibility for their module.
2. If authors cannot continue — **domain or jurisdiction committee** may take over stewardship under community governance rules.

Commercial modules add a **Hub operator** as the sales and maintenance counterparty in that jurisdiction. Community committees do not become the seller.

See also [Stewardship model](/content/stewardship-model) for Maintainer roles.

---

## Program Fund and audit prepayment (C)

**Program Fund** holds pooled resources for ecosystem programs run by **OOO** (OpenOrgOS Organization — accreditation, standards RFCs, Candidate pipeline).

For Candidate promotion:

- **C** = estimated audit / Assess cost for that module and jurisdiction.
- **C is collected before** Assess work starts (recoverable from future Commercial revenue where applicable).
- Wild or direct author sales outside the Hub do not automatically participate in this waterfall.

---

## Commercial revenue flow (concept)

When Commercial sales exist in a jurisdiction, revenue is applied in order:

```text
Sales
  → ① Program Fund: recover C (audit prep) where applicable
  → ② Hub operator fee
  → ③ Cohort professional services (maintainers, support)
```

Exact percentages and caps are defined per jurisdiction Hub agreement — not on Community.

---

## Jurisdiction cohort and Hub

Each **legal domain** (e.g. Japan, EU member state, US state bundle) can have:

| Role | Function |
|------|----------|
| **Cohort** | Maintainers and experts who steward modules for that domain |
| **Hub operator** | Licensed entity that sells, bills, and supports Commercial modules locally |
| **Assess provider** | OOO-accredited reviewer (often an existing security / compliance firm) |

Geographic expansion favors **licensing existing operators** over spawning new subsidiaries in every country.

---

## Assess vs Hub

| | **Assess** | **Hub** |
|---|------------|---------|
| Delivers | Evaluation, accreditation input | Marketplace, billing, support |
| Typical provider | Accredited assessor (existing firm) | Licensed operator in jurisdiction |
| Community role | Standards + OOO accreditation | None — Commercial channel |

Assess answers “did it pass our bar for this domain?” Hub answers “who sells and supports it commercially?”

---

## Agents and the Marketplace

**Agents are out of Marketplace scope for now.** The Commercial pipeline focuses on **modules** first. Agent catalog entries on Community remain reference and stewardship documentation, not Commercial products.

See [Module and Agent](/content/module-and-agent) for terminology.

---

## Rollout phases

| Phase | What is live | Focus |
|-------|--------------|-------|
| **0** | WILD + Community registry, committees | OSS contribution, no Commercial sales |
| **1** | First jurisdiction, first cohort, manual settlement | Prove one Hub path end-to-end |
| **2** | OOO Program formalized, Program Fund operational | Candidate pipeline + Assess accreditation |
| **3** | Additional jurisdiction licenses | Scale by revenue and legal triggers, not upfront entity sprawl |

**You are here:** Phase 0 moving toward Phase 1.

---

## Organizational roles (abstract)

Three layers — names only, no specific companies:

| Layer | Role |
|-------|------|
| **OpenOrgOS Community** | OSS, registry, committees — no Commercial sales |
| **OOO Program** | Accreditation, Program Fund, assessment standards |
| **Commercial licensees** | Hub operators and assessors per jurisdiction |

Community stays thin; Commercial stays separate.

---

## Related links

| Resource | Link |
|----------|------|
| Module registry | [/modules](/modules) |
| Governance | [/governance](/governance) |
| Stewardship | [/content/stewardship-model](/content/stewardship-model) |
| Openness & private modules | [/governance/openness](/governance/openness) |
| Module / Agent terminology | [/content/module-and-agent](/content/module-and-agent) |
| Implementation status (Wire, Hub, X-Road) | [/content/implementation-status](/content/implementation-status) |
