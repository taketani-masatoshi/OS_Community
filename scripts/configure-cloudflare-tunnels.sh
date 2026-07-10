#!/usr/bin/env bash
# Register Cloudflare DNS routes for both tunnels (run once per zone / hostname).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

COMMUNITY_TUNNEL_ID="${COMMUNITY_TUNNEL_ID:-3eec3f29-6743-4028-b443-ac5f6cd5e65b}"

if [[ -f .env.cloud ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.cloud
  set +a
fi

CLOUD_TUNNEL_ID="${CLOUDFLARE_TUNNEL_ID:-}"

if [[ -z "$CLOUD_TUNNEL_ID" ]]; then
  echo "CLOUDFLARE_TUNNEL_ID is empty in .env.cloud"
  echo "Create a tunnel first:"
  echo "  cloudflared tunnel create southwood-cloud"
  echo "Then set CLOUDFLARE_TUNNEL_ID in .env.cloud"
  exit 1
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Install cloudflared: brew install cloudflared"
  exit 1
fi

echo "=== oorgos.org / openorgos.org / openorgos.net (tunnel ${COMMUNITY_TUNNEL_ID}) ==="
for host in oorgos.org www.oorgos.org openorgos.org www.openorgos.org openorgos.net www.openorgos.net; do
  echo "  route dns → ${host}"
  cloudflared tunnel route dns "$COMMUNITY_TUNNEL_ID" "$host"
done

echo ""
echo "=== southwood.cloud (tunnel ${CLOUD_TUNNEL_ID}) ==="
for host in southwood.cloud control.southwood.cloud dash.southwood.cloud demo.southwood.cloud; do
  echo "  route dns → ${host}"
  cloudflared tunnel route dns "$CLOUD_TUNNEL_ID" "$host"
done

echo ""
echo "Optional wildcard (org subdomains):"
echo "  cloudflared tunnel route dns ${CLOUD_TUNNEL_ID} '*.southwood.cloud'"
echo ""
echo "Done. Start tunnels: ./scripts/start-cloudflare-tunnels.sh"
