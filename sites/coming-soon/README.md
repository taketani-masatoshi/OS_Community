# oorgos.org — overview site (Vercel Hobby)

| Host | Role |
|------|------|
| `oorgos.org` | Overview (static, EN / 日本語 / 中文) |
| `www.oorgos.org` | Redirect → apex |
| `community.oorgos.org` | Community app (Mac mini — **not** this project) |

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

`www` → apex redirect is in [`vercel.json`](./vercel.json).

```bash
npx vercel@latest domains verify oorgos.org
npx vercel@latest certs issue oorgos.org   # if HTTPS fails
curl -sI https://oorgos.org
curl -sI https://www.oorgos.org            # expect 301 → oorgos.org
```
