#!/usr/bin/env bash
# Local quality gate — mirrors CI build job checks.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> i18n:sync (dict, fill, build, strict, API errors)"
npm run i18n:sync

echo "==> lint"
npm run lint

echo "==> unit tests (@os-community/web)"
npm run test -w @os-community/web -- --run

echo "==> unit tests (@os-community/academy-client)"
npm test -w @os-community/academy-client

echo "==> production build"
npm run build

echo "==> docker-compose.prod.yml validate"
docker compose -f docker-compose.prod.yml config >/dev/null

echo "==> web stability audit"
node scripts/audit-web-stability.mjs

echo ""
echo "✓ All quality gates passed."
echo "  Run 'npm run quality:full' for resilience e2e (requires DB seed)."
