---
title: OrgOS and ISO 37000
description: How OrgOS initialization provides a practical foundation for ISO 37000–aligned governance self-declaration.
---

# OrgOS and ISO 37000

Open collaboration scales when shared infrastructure makes good practice the default path. **OrgOS** brings that idea to organizational governance: when you deploy OrgOS and configure your organization during **initialization**, you establish purpose, roles, oversight, and auditability in one coherent baseline.

That baseline supports a credible **self-declaration of alignment** with **ISO 37000** (*Governance of organizations* — guidance). It is not a third-party ISO certificate issued by OpenOrgOS Community.

## What this community provides

OpenOrgOS Community provides a **neutral home** for protocol, modules, learning, and operator pathways. Member organizations retain responsibility for their governance claims, policies, and culture.

| Term | Definition |
|------|------------|
| **OrgOS** | Organization runtime operated on infrastructure you control (digital twin and modules) |
| **OOO** | [OpenOrgOS Operator](/certifications) — the reference role that typically leads deployment and day-to-day operation |
| **ISO 37000** | International guidance on governance of organizations (purpose, oversight, accountability, and related themes) |
| **Self-declaration** | An organization’s own statement of alignment with guidance — distinct from accredited certification schemes |

ISO 37000 is **guidance**, not a certifiable requirements standard such as ISO 9001. Organizations commonly assess alignment through internal review and checklists. OrgOS helps make that assessment **operational and evidence-based** from the first deployment.

## A proven sequence: initialize as you govern

OrgOS is designed so organization setup and governance setup advance together — not as a later retrofit.

1. **Deploy** OrgOS on hardware under your control ([OrgOS Install & Digital Twin Setup](/content/orgos-install-setup)).
2. **Prepare** organizational facts before go-live (legal identity, structure, jurisdictions, module intent).
3. **Initialize** the tenant while recording structure — departments, roles, and accountable parties. `orgos tenant init` writes a purpose skeleton and an ISO 37000 declaration draft.
4. **Assess** with `orgos governance principles status`. Placeholder mission/vision does not count as ready.
5. **Declare** only after a human runs `orgos governance principles declare --signatory "…"`.

An **OpenOrgOS Operator (OOO)** — or an equivalent steward — typically leads this path.

## Mapping themes (illustrative)

The following table is a practical correspondence. It is **not** a clause-by-clause audit claim.

| ISO 37000 principle | What OrgOS helps establish |
|---------------------|--------------------------|
| **Purpose** | Mission, vision, and values in the business plan |
| **Value and strategy** | Plans, KPIs, and budget gates tied to an approved plan |
| **Oversight** | Company events, board/shareholder records, Operator Console |
| **Accountability** | Named operators, RBAC, no self-approval; auditor seat or compensating control |
| **Stakeholder engagement** | Advisors, governance register, IR / Wire when ready |
| **Leadership** | Human final approval, login domain, PassKey |
| **Data and decisions** | YAML source of truth, analytics, dashboards |
| **Risk** | Risk register; ISMS risk files when ISO 27001 is on |
| **Social responsibility** | ESG / environmental regulations where applicable |
| **Viability over time** | Multi-year plans, debt plan, tenant lifecycle |

Governing bodies still define purpose, values, and board practice. OrgOS makes those choices **executable and auditable**.

## Scope of “self-declaration readiness”

**In scope**

- A working organizational structure, roles, and decision trail on systems you control
- A clear walkthrough from purpose → structure → oversight for boards and stakeholders
- A practical baseline for an ISO 37000–style self-assessment (`orgos governance principles status`)

**Out of scope**

- Automatic ISO certification or certificates issued by OpenOrgOS Community
- Legal advice, or assurance that regulators will accept any particular declaration
- Complete coverage of every guidance theme without organizational policy and culture
- ISO 37001 (anti-bribery) or ISO 37301 (compliance MS) — those are separate packs

Shared technology unlocks capability. **Accountability remains with each organization.**

## Next steps

| Action | Resource |
|--------|----------|
| Understand OrgOS | [Learning — What is OrgOS?](/learning#about-orgos) |
| Deploy and initialize | [OrgOS Install & Digital Twin Setup](/content/orgos-install-setup) |
| Operator reference pathway | [Certifications](/certifications) (OOO / OOD) |
| Community governance | [Governance](/governance) |

## Related resources

- [Module and Agent terminology](/content/module-and-agent)
- [Stewardship model](/content/stewardship-model)
- [Implementation status](/content/implementation-status)
