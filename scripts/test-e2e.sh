#!/usr/bin/env bash
# Ensure DB is seeded before Playwright global setup resolves the founder user.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash scripts/ensure-db.sh
bash scripts/with-env.sh npm run seed -w @os-community/db >/dev/null

exec bash scripts/with-env.sh npm run test:e2e -w @os-community/web "$@"
