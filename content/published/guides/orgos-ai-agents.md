---
title: OrgOS with AI Agents (AIA)
description: Build and operate OrgOS with AIA and other AI agents — natural language, human approval, deterministic CLI.
---

> **Overview:** [What is OrgOS?](/learning#about-orgos) on the Learning hub — deterministic software you operate via LLMs and AI agents in natural language.  
> **Design context:** [Design Philosophy](/content/design-philosophy) — AIA is our primary tool; Cursor, Claude Code, Copilot, and custom agents are equally valid.

**Prerequisite:** [OrgOS Install & Digital Twin Setup](/content/orgos-install-setup) completed, or a working local tenant.

## What is AIA?

**AIA** — **A**I **A**gent assistants — is the name OpenOrgOS uses for AI agent environments that read the steward repository, explain structure, draft configurations, and help operators navigate OrgOS in natural language.

| Tool | Notes |
|------|-------|
| **AIA** | Primary workflow for building and operating OpenOrgOS |
| **Cursor** | Documented below; attach `.cursor/rules` |
| **Claude Code** | Same patterns with project instructions |
| **GitHub Copilot** | Useful for in-editor drafts; same approval gates |
| **Custom agents** | Valid with repository access and safety rules |

**AIA is preferred in our workflow, not mandatory.** The architecture is agent-agnostic: agents draft; humans approve; CLI and Skills execute deterministically.

## What agents do

| Capability | Example |
|------------|---------|
| **Explain** | "What does the finance agent manifest allow?" |
| **Navigate** | "Which modules are enabled for this tenant?" |
| **Draft** | "Generate a committee proposal template for JP jurisdiction" |
| **Validate** | "Run validate and summarize failures" |
| **Operate** | "Show open org events assigned to operations this week" |

Agents do **not** replace governance. Approvals, delegations, and audit rules still apply — treat the agent as a **Steward assistant**, not an autonomous executive.

## How it fits together

```text
You (natural language)
    ↓
AI Agent — AIA, Cursor, Claude Code, Copilot, …
    ↓
Steward repo — agent.manifest.yaml, modules, scripts
    ↓
Org Runtime / Org Console (local — data stays here)
    ↓
Optional: OpenOrgOS Community (public protocol & registry only)
```

Core agent definitions live under `steward/agents/` in the Steward repository. The Community [agent registry](/agents) is a public catalog — your tenant may extend or override locally.

## Step 1 — Open the steward workspace

1. Clone your organization's Steward / OrgOS repo (same host as Org Console).
2. In Cursor: **File → Open Folder** → select the repository root.
3. Confirm the agent tree exists, e.g. `steward/agents/executive/agent.manifest.yaml`.

Let Cursor finish indexing so `@Codebase` search works across manifests and docs.

## Step 2 — Project rules (recommended)

Add `.cursor/rules/orgos.mdc` (or **Cursor Settings → Rules**) with constraints such as:

- Do not paste business data or `.env` secrets into public chats
- Prefer read-only inspection before proposing writes
- Follow jurisdiction and module boundaries from `tenant.yaml` / `.env`
- Cite file paths when explaining org structure
- Run `./scripts/validate.sh` after config changes

Example snippet:

```markdown
When helping with OrgOS:
- Read agent.manifest.yaml and module READMEs before suggesting changes.
- Never commit secrets. Use .env.example patterns only.
- For destructive actions, list prerequisites and ask for confirmation.
```

## Step 3 — Connect context

| Source | How to attach in Cursor |
|--------|-------------------------|
| Tenant config | `@.env.example`, `@tenant.yaml`, or redacted snippets |
| Org chart export | `@exports/org-chart.csv` |
| Module list | `@modules/enabled.json` or registry link |
| Onboarding notes | `@docs/onboarding-checklist.md` |
| Agent registry | Link to `/agents` or `@steward/agents/` |

## Step 4 — Natural language patterns

### Exploration (read-only)

- "Summarize what the compliance agent is allowed to do vs finance."
- "Walk me through how an org event gets recorded from module X to the audit log."

### Configuration (draft → review)

- "Draft a module enablement list for a 20-person services company in JP — table format."
- "Explain validate.sh output line by line" (after you run it in terminal)

### Operations (careful — local only)

- "List scripts that touch production data; classify read vs write."

Avoid destructive commands without explicit human approval — good rules should block them.

## Step 5 — Agent registry

The [Agent registry](/agents) maps domains to Steward agents:

| Agent | Domain | Typical questions |
|-------|--------|-------------------|
| executive | governance | Strategy, approvals, committee routing |
| secretary | governance | Scheduling, minutes, correspondence |
| finance | finance | Invoices, ledger policies |
| contract | finance | Agreement lifecycle |
| compliance | finance | Regulatory checks |
| operations | operations | Day-to-day execution queues |

Sync local manifests after registry updates (often `npm run sync:agents` in your steward repo).

## Step 6 — MCP and terminal (optional)

- Prefer **read-only** MCP tools first
- Use terminal for `docker compose ps`, `validate.sh`, and log tails — paste output back into chat
- Do not expose Org Console admin ports to the public internet

## Safety checklist

- [ ] Agent runs against a **local** steward clone unless you intend otherwise
- [ ] Secrets in `.env` — agent sees placeholders only
- [ ] Write operations reviewed by a Steward Operator
- [ ] Validate passes after agent-suggested config edits

## Next steps

| Resource | Link |
|----------|------|
| Install & digital twin | [OrgOS Install guide](/content/orgos-install-setup) |
| OrgOS overview | [Learning hub](/learning#about-orgos) |
| Curriculum | [Learning → Curriculum](/learning#curriculum) |
| Module registry | [Modules](/modules#registry) |
