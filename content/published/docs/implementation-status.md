---
title: OpenOrgOS Implementation Status
description: What is live today — global protocol, Wire, Community site, Commercial Hub, and national gateways such as X-Road
---

> **Audience:** Stewards, committee members, integrators, and partners evaluating OpenOrgOS.  
> **Updated:** 2026-07 — Phase 0 on Community; Hub and national gateway adapters roll out by jurisdiction.  
> **Canonical protocol source:** OrgOS reference repo — if this page and the repo disagree, **the repo wins**.

## At a glance

OpenOrgOS spans **three separable layers**. Do not read progress on one layer as progress on the others.

| Layer | What it is | Status |
|-------|------------|--------|
| **Global protocol** | Org Event Model, Identity Exchange, Authority Delegation, Auditability | **Defined** — vocabulary and architecture in OrgOS repo |
| **Wire · Witness** | Inter-organizational transport and verifiable evidence | **Specified** — reference implementation in OrgOS; not a Community product |
| **OrgOS runtime** | On-premises steward stack (Core, Modules, Agents, CLI) | **Available** — installable; modules vary by domain |
| **OpenOrgOS Community** (this site) | OSS registry, committees, governance, learning | **Live** — Phase 0 |
| **Commercial Hub** | Jurisdiction marketplace for paid modules | **Phase 0→1** — not selling yet |
| **National gateways** (X-Road class) | Adapters to country/region secure exchange networks | **Planned** — no shipped adapter; jurisdiction modules define mapping |

**You are here:** Community and WILD registry are operational. Hub sales and X-Road-class adapters are **design and cohort work**, not live integrations on this site.

---

## Global protocol layer

The **global layer stays thin**. It defines *how* organizations exchange state across boundaries — not local business rules.

| Capability | Definition status | Runtime status |
|------------|-------------------|----------------|
| **Org Event Model** | Documented in mission and OrgOS vocabulary | Events recorded inside OrgOS; **cross-org relay is P2** (see Wire) |
| **Identity Exchange** | Defined | Tenant-local identity today; federated exchange **planned with Wire** |
| **Authority Delegation** | Defined in modules and agent boundaries | Operational inside a tenant; cross-org delegation **via Wire path** |
| **Auditability** | Defined (Witness, timelines) | Operational inside a tenant |

For terminology (Module vs Agent vs Wire), see [Module and Agent](/content/module-and-agent).

---

## Wire and Witness

**Wire** is **not** a Module, Agent, or Hub product. It is the **protocol transport** for org-to-org messages and events. **Witness** covers verifiable evidence third parties can audit.

### Where Wire sits in OrgOS

| # | Component | Role |
|---|-----------|------|
| 1 | **OpenOrgOS Core** | Rules engine, tenant config, CLI |
| 2 | **Module linkage** | Domain packs (accounting, medical device, …) |
| 3 | **Wire · Witness** | Cross-boundary exchange and audit evidence |
| — | **Agents** | Bounded LLM operators *inside* a tenant |

Common correction: **“Agent sends Wire”** is wrong. Wire is protocol-level; agents **draft**; humans **approve**; **CLI / Skill** executes deterministically.

### Implementation status

| Item | Status |
|------|--------|
| Vocabulary and architecture (`orgos-vocabulary.md`, agent architecture) | **Published** in OrgOS repo |
| In-tenant operations (Skills, CLI, agents, modules) | **Usable** on installed OrgOS |
| **Org Event relay** (inter-org gateway) | **Pilot P2** — mal Wire pilot · relay/Gateway systemd in OrgOS reference |
| Public Wire endpoint on `community.oorgos.org` | **Not offered** — Community is registry/governance, not a Wire hub |
| **Eco / Trusted operators UI** | **Live (2026-07)** — `/protocol/trusted-operators` · `/protocol/jurisdiction` · `/protocol/wire-node/*` · `/governance/sla` · Steward mirror |

When Org Event relay ships, it will **not** replace jurisdiction-specific gateways; it carries **OpenOrgOS-shaped events** between participating orgs.

---

## Commercial Hub

The **Hub** is the **Commercial channel** — licensed operators sell and support modules **per legal domain**. It is separate from Community review.

| Item | Status |
|------|--------|
| WILD + Community module registry on this site | **Live** — [/modules](/modules) |
| Committees and governance | **Live** — [/committees](/committees), [/governance](/governance) |
| Candidate pipeline + Program Fund | **Phase 1 prep** — cohort and Assess process defined, not fully automated |
| Commercial Hub marketplace (billing, support contracts) | **Not live** — first jurisdiction cohort in progress |
| Agent products in Hub | **Out of scope for now** — modules first |

Rollout phases (detail): [Module ecosystem](/content/module-ecosystem).

**Community `REVIEWED` ≠ Commercial-ready.** Commercial listing requires a **Hub path**, not registry promotion alone.

---

## X-Road and national exchange gateways

### What X-Road is

**[X-Road](https://x-road.global/)** is a **national (or regional) secure data exchange layer** — member organizations connect via security servers; access is policy- and contract-governed. Variants and national programs exist (for example Estonia, Finland, and other NIIS members).

X-Road answers: *“How does my organization connect to the **country’s** trusted exchange fabric?”*

### How OpenOrgOS relates

| | **OpenOrgOS Wire** | **X-Road-class gateway** |
|---|-------------------|---------------------------|
| Scope | Org-to-org **event and state exchange** in OpenOrgOS shape | **National infrastructure** membership and technical gateway |
| Owned by | Participating organizations + protocol spec | Country/region operator (e.g. NIIS members) |
| Content | Org events, delegation, audit envelopes | Member-specific message sets and national schemas |
| OpenOrgOS role | Defines **semantic model** and steward runtime | **Does not replace** X-Road — **interop where committees require it** |

OpenOrgOS **does not ship a production X-Road adapter today**. Cross-border and public-sector scenarios are expected to combine:

1. **OrgOS runtime** (local source of truth),
2. **Wire** (OpenOrgOS org-to-org events, when relay is available),
3. **Jurisdiction module + gateway adapter** (maps national gateway messages ↔ Org Event Model where applicable).

### Status and next steps

| Item | Status |
|------|--------|
| X-Road adapter module in Community registry | **None listed yet** |
| Reference adapter in OrgOS repo | **Not shipped** |
| Committee charter for public-sector / gateway interop | **Invited** — domain and jurisdiction committees |
| OOO RFC path for gateway profiles | **Available** — standards via OOO Program |

If you operate in an X-Road member environment and need OpenOrgOS interop, **propose a jurisdiction module** or join the relevant [committee](/committees) — gateway mapping is **local rules**, not global protocol.

---

## OpenOrgOS Community site (this website)

What `community.oorgos.org` implements today:

| Capability | Status |
|------------|--------|
| Module registry (WILD, lifecycle) | **Live** |
| Wild module proposals | **Live** |
| Committees and domain governance | **Live** |
| Certifications and role requests | **Live** |
| Identity (Google sign-in; GitHub / LinkedIn connect) | **Live** |
| Learning guides and docs (`/content/*`) | **Live** |
| Academy tracks | **Partial** — depends on Academy service configuration |
| Commercial Hub / payments | **Not on this site** |
| Wire / Org Event ingress | **Not on this site** |
| Protocol SLA dashboard | **Live** — [/governance/sla](/governance/sla) |
| Trusted operators registry | **Live** — [/protocol/trusted-operators](/protocol/trusted-operators) |
| Application lifecycle hub | **Live** — [/governance/lifecycle](/governance/lifecycle) |
| Wire node application (C4-W1) | **Live** — [/protocol/wire-node/apply](/protocol/wire-node/apply) |
| Wire node governance review (C4-W2) | **Live** — [/protocol/wire-node/review](/protocol/wire-node/review) |

Infrastructure: overview at [oorgos.org](https://oorgos.org); Community runs on steward-operated deployment with Cloudflare Tunnel (see project runbooks in repo `docs/`).

---

## OrgOS runtime (on-premises)

For stewards installing OrgOS on their own hardware:

| Item | Status |
|------|--------|
| Install and digital-twin setup guide | **Published** — [/content/orgos-install-setup](/content/orgos-install-setup) |
| Core agents (Finance, Secretary, Steward, …) | **Available** in reference stack |
| Domain modules (e.g. rental, jp_medical_device) | **Varies** — see [/modules](/modules) |
| Control Plane heartbeat / outbound agent | **Architecture defined** — hybrid deployment requirements in repo `docs/plans/` |
| Org Event relay to other orgs | **P2 — not GA** |

---

## Roadmap summary

| Phase | Focus | Representative deliverables |
|-------|--------|----------------------------|
| **Now (Phase 0)** | Community OSS, registry, committees | This site, WILD modules, governance |
| **Phase 0→1** | First Hub cohort | Manual Commercial path in one jurisdiction |
| **Phase 1–2** | Candidate + Assess + Program Fund | Paid audit prep pipeline |
| **Protocol P2** | Org Event relay (Wire gateway) | Cross-org event transport |
| **By jurisdiction** | X-Road / national gateway adapters | Module + committee-defined mapping |

---

## Related links

| Resource | Link |
|----------|------|
| Module ecosystem (Hub phases) | [/content/module-ecosystem](/content/module-ecosystem) |
| Module / Agent / Wire terminology | [/content/module-and-agent](/content/module-and-agent) |
| Design philosophy (AIA, language-agnostic) | [/content/design-philosophy](/content/design-philosophy) |
| Mission and global protocol | [/content/mission](/content/mission) |
| Module registry | [/modules](/modules) |
| Governance | [/governance](/governance) |
| OrgOS install guide | [/content/orgos-install-setup](/content/orgos-install-setup) |
| All docs | [/content](/content) |
