# ADR: 3-Layer Identity Model

## Status

Accepted — C MVP implementation in progress.

## Context

OpenOrgOS Community serves both **developers** (GitHub repos, merge approval) and **domain experts** (committees, certifications, cross-border governance). A single GitHub-centric identity is insufficient for expert recruitment.

## Decision

Three layers with **Community ID as canonical**:

| Layer | Source | Purpose |
|-------|--------|---------|
| **Community** | `User.id` + `publicSlug` | Roles, committees, certs, Academy — site is source of truth |
| **Professional** | LinkedIn Connect (MVP) | Expert credibility — headline, org, profile URL |
| **Technical** | GitHub login + `GitHubConnection` | Repo linking, merge permissions |

### Login (C MVP)

- **Sign-in**: GitHub only
- **LinkedIn**: Connect from `/settings/connections` while logged in — **not** a login provider in MVP
- Phase 6 may add LinkedIn sign-in (see roadmap)

### URL policy

- Public profiles: `/users/{publicSlug}`
- Founder: fixed slug `taketani-masatoshi` (from shared constants)
- Legacy: resolve `githubLogin` and `id` in `resolveUserBySlug`; canonical links use `publicSlug`
- On hit via legacy slug when `publicSlug` differs → 301 to canonical (optional in page)

### Slug generation

1. Founder → `FOUNDER_PROFILE_SLUG`
2. Else prefer `githubLogin` if valid and unique
3. Else slugify `name` with numeric suffix on collision

## Out of scope (MVP)

- LinkedIn sign-in without GitHub session
- Account merge (Phase 6)
- Email magic link, ORCID (C Extension)

## Consequences

- `getUserProfilePath()` uses `publicSlug` first
- JWT session includes `linkedinConnected`, `githubReposConnected`
- Repo/role APIs may require GitHub login (`requireGitHubLoginApi`); repo connect requires profile complete
