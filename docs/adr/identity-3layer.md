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

## Consequences

- `getUserProfilePath()` uses `publicSlug` first
- JWT session includes `linkedinConnected`, `githubReposConnected`, `profileComplete`
- Repo/role APIs may require GitHub login (`requireGitHubLoginApi`); repo connect requires profile complete
- Admin user list shows email, Google link, and affiliation status
