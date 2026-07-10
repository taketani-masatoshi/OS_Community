---
title: OrgOS Install & Digital Twin Setup
description: Install OrgOS from scratch, gather organization information, and prepare the environment for your digital twin.
---

> **Overview:** [What is OrgOS?](/learning#about-orgos) on the Learning hub — deterministic software, natural-language AI operation, and module-based extension.

This guide walks a **Steward Operator** through first-time deployment: prerequisites, information to gather before `tenant init`, and the baseline **digital twin** environment (org chart, modules, audit hooks).

OrgOS keeps **business data on your infrastructure**. OpenOrgOS Community (`community.oorgos.org`) provides the protocol, module registry, and learning resources — not your tenant data.

## Who this is for

| Role | Goal |
|------|------|
| **Steward Operator** | Run Org Console on company hardware with minimal IT background |
| **Founder / executive sponsor** | Understand what to prepare before go-live |
| **Steward (consultant)** | Validate a customer's environment before handover |

## Outcomes

When you finish this guide you will have:

1. A supported machine ready for Docker-based OrgOS
2. A checklist of organization facts captured (structure, jurisdictions, modules)
3. An initialized tenant with validated configuration
4. A baseline digital twin scope: org chart, enabled modules, and audit trail hooks

## Phase 0 — Information to gather first

Do not run installers until you can answer these questions. They shape `tenant init`, module selection, and what your digital twin must represent.

### Organization identity

- Legal name, trade names, and primary jurisdiction(s)
- Fiscal year and reporting currency
- Who is the **Steward Operator** day-to-day contact?

### Structure (digital twin seed)

- Departments / teams and reporting lines (even a draft org chart is enough)
- Key roles: executive, finance, operations, compliance — map them to [Steward agents](/agents) where helpful
- External parties you exchange org events with (customers, vendors, regulators)

### Module intent

Browse the [module registry](/modules#registry) and note launch vs later:

| Area | Example modules | Launch? |
|------|-----------------|--------|
| Governance | proposals, committees | Often yes |
| Finance | invoicing, contracts | As needed |
| Operations | inventory, scheduling | As needed |

### Data boundaries

- What must **never** leave the Mac mini (PII, contracts, ledger detail)
- What may be summarized to optional SaaS dashboards (read-only visibility — not remote control)

Record answers in your steward workspace — this becomes context for AI agents later.

## Phase 1 — Hardware and network

| Component | Purpose |
|-----------|---------|
| **Mac mini** (or equivalent always-on host) | Org Runtime + Org Console — **system of record** |
| **Synology NAS** (optional) | Backups, artifact storage |
| Stable LAN | Operators use Org Console on the local network |
| Outbound HTTPS | GitHub, module registry, optional Control Plane heartbeat |

Development can start on a laptop with Docker; promote the same compose patterns to Mac mini for production.

## Phase 2 — Software prerequisites

```bash
docker --version
docker compose version
git --version
```

Accounts and access:

- **GitHub** account with access to your OrgOS / Steward repository
- OpenOrgOS Community account at [community.oorgos.org](/login)
- `.env` files stay on the host only — never commit credentials

## Phase 3 — Clone and configure

```bash
git clone https://github.com/steward-os/steward.git
cd steward
cp .env.example .env
# Edit: TENANT_SLUG, JURISDICTION, ENABLED_MODULES, DATABASE_URL, AUTH_*
```

Start the stack:

```bash
docker compose up -d
curl -sk https://localhost/health
```

Fix health check failures before continuing.

## Phase 4 — `tenant init` and validation

```bash
./scripts/tenant-init.sh
# or: make tenant-init — follow your steward repo README
```

During init you typically confirm jurisdiction, module ON/OFF, org chart import, and Steward agent bindings.

```bash
./scripts/validate.sh
```

Resolve all errors before go-live.

## Phase 5 — Digital twin baseline

Your digital twin is a **living org chart plus event ledger**:

| Layer | What to configure |
|-------|-------------------|
| **Identity** | People, roles, linked accounts |
| **Authority** | Delegations, committee scopes |
| **Events** | Module-generated org events |
| **Agents** | [Agent registry](/agents) manifests |

Minimum checklist:

- [ ] Executive and finance roles assigned to real people
- [ ] At least one test org event visible in Console
- [ ] Enabled modules documented in your runbook
- [ ] Backup job tested (DB + config)

## Phase 6 — Next steps

| Next step | Link |
|-----------|------|
| Operate with AI (Cursor) | [OrgOS with AI Agents](/content/orgos-ai-agents) |
| OrgOS overview | [Learning hub](/learning#about-orgos) |
| Curriculum | [Learning → Curriculum](/learning#curriculum) |
| Agent definitions | [Agent registry](/agents) |

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| OAuth login fails | Browser URL ≠ `AUTH_URL` in `.env` |
| Database connection errors | `DATABASE_URL` host wrong inside Docker network |
| Module fails to load | Not in registry or disabled at tenant init |
| Validate reports audit gap | Identity layer incomplete — finish Phase 5 |

## Related reading

- [OpenOrgOS Mission](/content/mission)
- [Stewardship model](/content/stewardship-model)
- [Agent registry](/agents)
