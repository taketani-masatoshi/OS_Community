#!/usr/bin/env bash
# Start Cloudflare Tunnel for southwood.cloud → local Caddy (CLOUD_HTTPS_PORT).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/scripts/start-cloudflare-tunnels.sh" "$@"
