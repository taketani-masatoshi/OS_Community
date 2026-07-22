# OpenOrgOS Community — Beta operations

**Status:** public **beta**. Expect frequent updates. Prefer environments you fully control.

## Security recommendations (required reading)

Treat this release as **not production-certified**:

1. **Isolated host** — dedicated VM / Mac mini / on-prem box you administer. Do not co-host untrusted workloads.
2. **Private network first** — bind to localhost or a Tailscale/WireGuard/VPN mesh; put Cloudflare Tunnel or reverse proxy in front only when you accept the exposure.
3. **Secrets** — generate unique `AUTH_SECRET`, DB passwords, OAuth client secrets per deployment. Never reuse production OrgOS tenant secrets for beta Community.
4. **TLS** — terminate TLS at Caddy / Cloudflare; do not expose plain HTTP on the public Internet.
5. **Least privilege** — OAuth apps restricted to your callback URL; DB not published to `0.0.0.0`.
6. **Backup before upgrade** — snapshot Postgres volume before every image pull.
7. **Watch the channel feed** — `/api/health` reports `release.updateAvailable` when `channel/latest.json` (or `OPENORGOS_CHANNEL_URL`) is newer than the running image.

## Recommended install (GHCR image)

```bash
# 1. Copy compose + env template from the release tag
git clone https://github.com/taketani-masatoshi/OS_Community.git
cd OS_Community
git checkout v0.1.0-beta.1   # or latest beta tag

cp .env.example .env
# Edit DOMAIN, AUTH_*, POSTGRES_PASSWORD, CLOUDFLARE_TUNNEL_TOKEN, …

# 2. Pull published image (no local build required)
docker compose -f docker-compose.release.yml pull
docker compose -f docker-compose.release.yml up -d

# 3. Verify
curl -sS https://YOUR_DOMAIN/api/health | jq '{status, release}'
```

Image:

| Tag | Meaning |
|-----|---------|
| `ghcr.io/taketani-masatoshi/os-community-web:0.1.0-beta.1` | Immutable beta build |
| `ghcr.io/taketani-masatoshi/os-community-web:beta` | Moving pointer to latest beta |
| `ghcr.io/taketani-masatoshi/os-community-web:0.1.0-beta` | Latest patch on this beta line (when used) |

Packages are published under GitHub Packages (GHCR). For private pulls before the repo is public, `echo $GH_TOKEN | docker login ghcr.io -u USER --password-stdin`.

## How we push updates (operators)

Frequent betas are intentional. Upgrade path:

```bash
# Read channel feed (GitHub raw or your mirror)
curl -fsSL https://raw.githubusercontent.com/taketani-masatoshi/OS_Community/main/channel/latest.json

# Pull and recreate (Mac mini example)
export IMAGE_TAG=0.1.0-beta.2   # from channel.latest
docker compose -f docker-compose.release.yml pull web
docker compose -f docker-compose.release.yml up -d --force-recreate web
# If using Cloudflare Tunnel on service:web — recreate tunnel after web
docker compose up -d --force-recreate cloudflared-inc
```

When a release is **urgent** (security), `channel/latest.json` sets a stronger `updateMessage` and may bump `minSupported`. Running builds older than `minSupported` should be retired.

## How maintainers publish a new beta

1. Bump `VERSION` and `channel/latest.json` (`latest`, `releasedAt`, messages).
2. Commit on `main`.
3. Tag and push: `git tag v0.1.0-beta.2 && git push origin main --tags`
4. GitHub Actions **Publish container** builds and pushes GHCR tags.
5. Create a GitHub Release from the tag; paste security/upgrade notes.

Manual dispatch: Actions → Publish container → Run workflow.

## Version API

`GET /api/health` includes:

```json
{
  "release": {
    "version": "0.1.0-beta.1",
    "channel": "beta",
    "image": "ghcr.io/taketani-masatoshi/os-community-web",
    "releasesUrl": "https://github.com/taketani-masatoshi/OS_Community/releases",
    "updateAvailable": false,
    "channelLatest": "0.1.0-beta.1",
    "updateMessage": null
  }
}
```

Set `OPENORGOS_CHANNEL_URL` to override the default raw GitHub feed (useful for air-gapped mirrors).

## Support posture

- Beta = best-effort; breaking changes may land between betas.
- Prefer filing GitHub Issues with `/api/health` JSON attached (redact secrets).
- Overview site: https://oorgos.org — Community app: your deployment / https://community.oorgos.org when operated by the project.
