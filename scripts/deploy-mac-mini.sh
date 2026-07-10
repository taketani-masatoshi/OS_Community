#!/usr/bin/env bash
# Mac mini production deploy — rebuild web and recreate Cloudflare Tunnel sidecar.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Starting database and web"
docker compose up -d db web

echo "==> Waiting for web health"
for i in $(seq 1 30); do
  if curl -fsS http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "    web is healthy"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: web did not become healthy in time" >&2
    exit 1
  fi
  sleep 2
done

echo "==> Recreating cloudflared-inc (required after web restart)"
docker compose up -d --force-recreate cloudflared-inc

echo "==> Health check"
curl -fsS http://localhost:3000/api/health | head -c 500
echo ""
echo "✓ Deploy complete. Verify https://community.oorgos.org/api/health externally."
