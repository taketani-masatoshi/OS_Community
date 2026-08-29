# receipt.oorgos.org — QR receipt verify portal

Static client-only page that decodes `#v2z.<deflate+base64url>` fragments and
verifies Ed25519 signatures in the browser (Web Crypto). Nothing in the fragment
is sent to the server. Fonts are self-hosted. CSP is `default-src 'self'` with `connect-src 'none'` so the page cannot phone home.

## Local preview

```bash
cd sites/receipt
npx --yes serve -p 4177
# open http://127.0.0.1:4177/r#v2z....
```

## Production deploy

```bash
cd sites/receipt
npx vercel@latest deploy --prod --yes
```

Then attach domain `receipt.oorgos.org` in the Vercel project Domains settings.

DNS (Cloudflare `oorgos.org` zone) must be **Vercel**, not Tunnel:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| A | `receipt` | `76.76.21.21` | **OFF** |

A Tunnel CNAME with Proxy ON yields Cloudflare **530 / 1033** when that connector is down.

Canonical encode/decode: OS_Steward `src/lib/receipt-qr.ts`.
