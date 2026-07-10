#!/usr/bin/env bash
# CI deploy verification — prod compose + stability audit (no VPS deploy).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> docker-compose.prod.yml validate"
docker compose -f docker-compose.prod.yml config >/dev/null

echo "==> web stability audit"
node scripts/audit-web-stability.mjs --write

echo "✓ Deploy verification passed."
