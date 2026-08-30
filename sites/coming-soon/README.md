# oorgos.org — overview site (Vercel Hobby)

| Host | Role |
|------|------|
| `oorgos.org` | Overview for aspiring OOOs — static only (EN / 日本語 / 中文). Does **not** probe Community. |
| `www.oorgos.org` | Redirect → apex |
| `community.oorgos.org` | Community app (Mac mini — **not** this project) |

**Boundary:** Overview CTAs are plain links. Community liveness is owned by Mac mini / Tunnel ops — never by browser `fetch` from this site.

**Generated assets:** `ecosystem-links.js` (Console / Community URLs) and `locale-bridge.js` (shared `oorgos-locale` cookie, ja/en only) come from `packages/shared`. Run `npm run overview:links` at the repo root after changing `brand-links.ts` or the locale contract, then redeploy.

**Always run `npm run overview:links` after editing any css/js here.** css/js are cached for a day while the HTML is not, so the same command stamps a content hash into every `<link>` / `<script>` URL. Without it a page can ship new markup against a visitor's cached script — which is how a new section once rendered untranslated. A test fails when a stamp is stale. Console login always starts at Community (`/ops/console/start`), never at `operator.oorgos.org`.

Fonts are self-hosted (OFL Instrument Sans / Newsreader). Pages do not load Google Fonts or other third-party origins. CSP is `default-src 'self'` with `connect-src 'none'` (no browser fetches). Scripts are external files only (no `'unsafe-inline'`).

**Design:** [`design-system.css`](./design-system.css) is the canonical public design system for both this Vercel site and the Community Next.js app. It owns the restrained palette, Instrument Sans + Newsreader type scale, spacing, radii, focus treatment, and button sizes. Product-specific CSS may define layout, but must consume these tokens instead of redefining them.

**Demo page:** [`/demo`](./demo.html) — Apple silicon Mac + Docker Desktop (Intel Mac not supported).

**Setup runbook:** [`docs/oorgos-subdomain-setup.md`](../../docs/oorgos-subdomain-setup.md)  
**Architecture:** [`docs/vercel-macmini-architecture.md`](../../docs/vercel-macmini-architecture.md)

## Deploy

```bash
cd sites/coming-soon
npx vercel@latest deploy --prod --yes
```

Project: **open-org-os / coming-soon**

## Vercel domains

Add both in project Settings → Domains:

- `oorgos.org` — apex (A `76.76.21.21` at Cloudflare, proxy OFF)
- `www.oorgos.org` — CNAME to Vercel DNS (proxy OFF)

`www` → apex redirect is in [`vercel.json`](./vercel.json) (`/` and `/:path*` — Vercel’s `/:path*` does not match the homepage).

GitHub Actions: [`.github/workflows/deploy-oorgos-org.yml`](../../.github/workflows/deploy-oorgos-org.yml) (secret `VERCEL_TOKEN`).

```bash
npx vercel@latest domains verify oorgos.org
npx vercel@latest certs issue oorgos.org   # if HTTPS fails
curl -sI https://oorgos.org
curl -sI https://www.oorgos.org            # expect 308/301 → oorgos.org
curl -sI https://www.oorgos.org/demo       # expect 308/301 → oorgos.org/demo
```
