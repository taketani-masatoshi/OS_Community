#!/usr/bin/env bash
# Docker (db + web + Caddy HTTPS) and Cloudflare Tunnel for openorgos.net.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Starting Docker stack..."
docker compose up -d

echo "Waiting for https://localhost ..."
for i in $(seq 1 30); do
  if curl -sk -o /dev/null https://localhost/ 2>/dev/null; then
    echo "  OK"
    break
  fi
  sleep 2
done

if [[ "${SKIP_TUNNEL:-}" != "1" ]]; then
  if command -v cloudflared >/dev/null 2>&1; then
    echo "Starting Cloudflare Tunnels (openorgos.net + southwood.cloud)..."
    "$ROOT/scripts/start-cloudflare-tunnels.sh" || true
  else
    echo "cloudflared not installed — only local HTTPS (localhost / hosts) will work."
  fi
fi

echo
echo "Local:  https://localhost"
echo "Public:"
echo "  https://openorgos.net (Community · tunnel → :3000)"
echo "  https://control.southwood.cloud (Cloud · tunnel → :8443)"
echo "Start tunnels: ./scripts/start-cloudflare-tunnels.sh"
echo "DNS setup:     ./scripts/configure-cloudflare-tunnels.sh"
