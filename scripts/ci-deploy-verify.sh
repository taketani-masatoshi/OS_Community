#!/usr/bin/env bash
# CI deploy verification — prod compose + stability audit (no VPS deploy).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# docker-compose.prod.yml requires env_file: .env; CI has no secrets checkout.
if [[ ! -f .env ]]; then
  if [[ ! -f .env.example ]]; then
    echo "Missing .env.example for CI compose validate" >&2
    exit 1
  fi
  cp .env.example .env
  echo "==> seeded .env from .env.example for compose validate"
fi

echo "==> docker-compose.prod.yml validate"
docker compose -f docker-compose.prod.yml config >/dev/null

echo "==> web stability audit"
node scripts/audit-web-stability.mjs --write

echo "✓ Deploy verification passed."
