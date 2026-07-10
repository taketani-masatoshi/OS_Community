#!/usr/bin/env bash
# Start Cloudflare Tunnel for openorgos.net → local web (port 3000).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/scripts/start-cloudflare-tunnels.sh" "$@"
