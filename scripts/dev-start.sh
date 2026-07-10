#!/usr/bin/env bash
# Start PostgreSQL + Next.js dev server from repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> OS_Community dev start (cwd: $ROOT)"
echo

if ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop is not running." >&2
  echo "Open Docker Desktop, wait until ready, then run: npm run dev:start" >&2
  exit 1
fi

echo "Waiting for PostgreSQL to accept connections..."
docker compose up db -d

for i in $(seq 1 30); do
  if nc -z localhost 5432 2>/dev/null; then
    echo "PostgreSQL is ready on localhost:5432"
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "PostgreSQL did not become ready in time." >&2
    exit 1
  fi
  sleep 1
done

echo "Applying database schema (DATABASE_URL from .env)..."
bash scripts/with-env.sh npm run push -w @os-community/db

echo "Starting web (http://localhost:3000 · AUTH_URL forced to localhost)..."
echo "Sign in at: http://localhost:3000/login"
echo "Health:    http://localhost:3000/api/health"
exec npm run dev
