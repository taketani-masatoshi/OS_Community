#!/usr/bin/env bash
# Start oorgos.org stack (requires CLOUDFLARE_TUNNEL_TOKEN in .env)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_TUNNEL_TOKEN is empty in .env"
  echo "Create tunnel in Zero Trust → Networks → Connectors → oorgos-org"
  echo "See docs/oorgos-org-setup.md"
  exit 1
fi

docker compose up -d db web cloudflared-inc
DOMAIN=community.oorgos.org ./scripts/verify-openorgos-org.sh
