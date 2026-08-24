# ADR: 3-Layer Identity Model

## Status

Accepted — Google primary login; organization affiliation added (2026-07).

## Context

OpenOrgOS Community serves both **developers** (GitHub repos, merge approval) and **domain experts** (committees, certifications, cross-border governance). A single GitHub-centric identity is insufficient for expert recruitment. Membership must be tied to a durable email identity and, for Operator certification, a verifiable organization.

## Decision

Three layers with **Community ID as canonical**, plus organization affiliation:

| Layer | Source | Purpose |
|-------|--------|---------|
| **Community** | `User.id` + `publicSlug` + Google email | Roles, committees, certs, Academy — site is source of truth |
| **Professional** | LinkedIn Connect | Expert credibility — headline, org, profile URL |
| **Technical** | GitHub login + `GitHubConnection` | Repo linking, merge permissions |
| **Organization** | `Organization` + `OrgAffiliation` | Japanese corporate number claim → admin verify |

### Login

- **Sign-in**: Google only (email = OpenOrgOS login ID)
- **GitHub / LinkedIn**: Connect from `/settings/connections` while logged in — not login providers

### Profile completion

- Required: `name`, `specialty`, `region` (`profileCompletedAt`)
- Email: from Google Account (not editable)
- Free-text `User.organization`: optional display memo
- Corporate-number affiliation: optional at profile time; **required for STEWARD_OPERATOR apply** (PENDING or VERIFIED); **VERIFIED required to issue** Operator cert

### Organization affiliation

- User claims JP 13-digit corporate number + legal name → `OrgAffiliation` status `PENDING`
- Admin verifies or rejects at `/admin/users/[id]`
- UI: `/settings/organization`

### OOO ↔ Organization (management scope)

- Applying for `STEWARD_OPERATOR` requires selecting a claimed organization (`PENDING` or `VERIFIED`)
- `CertificationApplication.organizationId` stores the chosen org
- Issuing Operator requires that affiliation to be `VERIFIED`; `Certification.organizationId` records the OOO management scope
- My Page “Operations hub” lists active Operator certs with organization names (Community-native; no Steward tenant sync in this phase)
- Optional Docker side-car: OrgOS Operator Console (`docker-compose.operator.yml`, `:9470`) for Wire Console + Steward Chat Today (予実 KPI). Source of truth remains tenant YAML + CLI — Community does not store budget rows.

### Community → Operator Console SSO

- Google Account (`Account.providerAccountId`) ↔ Community `User.id` (OOO) via NextAuth (existing)
- Console Operator: tenant `data/org/operators.yaml` matched by **email** and/or explicit `User.orgosOperatorId`
- My Page Wire／予実 CTAs go to `/ops/console/start?next=…` which mints a short-lived HS256 `id_token` and redirects to Console `/auth/community-handoff`
- Shared secret: `COMMUNITY_CONSOLE_OIDC_HS256_SECRET` ≡ `WIRE_CONSOLE_OIDC_HS256_SECRET`; issuer/audience must match on both sides
- No second Google login and no `orgos-dev` passkey for this path (dev passkey remains a CLI/fallback only)

### URL policy

- Public profiles: `/users/{publicSlug}`
- Founder: fixed slug `taketani-masatoshi` (from shared constants)
- Legacy: resolve `githubLogin` and `id` in `resolveUserBySlug`; canonical links use `publicSlug`

### Slug generation

1. Founder → `FOUNDER_PROFILE_SLUG`
2. Else prefer `githubLogin` if valid and unique
3. Else slugify `name` with numeric suffix on collision

## Out of scope (this phase)

- GビズINFO automatic lookup
- Multi-jurisdiction corporate identifiers
- LinkedIn / GitHub as login providers
- Auto-sync with Steward `company.yaml` / Wire tenants
- Embedding Steward 予実 / Wire hub data into Community

## Consequences

- `getUserProfilePath()` uses `publicSlug` first
- JWT session includes `linkedinConnected`, `githubReposConnected`, `profileComplete`
- Repo/role APIs may require GitHub login (`requireGitHubLoginApi`); repo connect requires profile complete
- Admin user list shows email, Google link, and affiliation status
- STEWARD_OPERATOR approve sets `User.orgosOperatorId` when empty (default `OP-001` / `COMMUNITY_DEFAULT_ORGOS_OPERATOR_ID`)
