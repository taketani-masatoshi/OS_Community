#!/usr/bin/env bash
# Ensure PostgreSQL is reachable at localhost:5432 (starts Docker db service if needed).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

check_db() {
  if command -v nc >/dev/null 2>&1; then
    nc -z localhost 5432 >/dev/null 2>&1
    return $?
  fi
  (echo >/dev/tcp/localhost/5432) >/dev/null 2>&1
}

if check_db; then
  exit 0
fi

if ! docker info >/dev/null 2>&1; then
  if [[ "$(uname -s)" == "Darwin" ]] && [[ -d "/Applications/Docker.app" ]]; then
    echo "Docker Desktop is not running — launching it..."
    open -a Docker
    for i in $(seq 1 60); do
      if docker info >/dev/null 2>&1; then
        echo "Docker Desktop is ready."
        break
      fi
      if [[ "$i" -eq 60 ]]; then
        echo "Timed out waiting for Docker Desktop." >&2
        echo "Open Docker manually, wait until running, then: docker compose up db -d" >&2
        exit 1
      fi
      sleep 2
    done
  else
    echo "PostgreSQL is not running on localhost:5432." >&2
    echo "1) Open Docker Desktop and wait until it is running" >&2
    echo "2) cd $ROOT" >&2
    echo "3) docker compose up db -d" >&2
    echo "   or: npm run dev:start" >&2
    exit 1
  fi
fi

echo "Starting PostgreSQL (docker compose up db -d)..."
docker compose up db -d

for i in $(seq 1 30); do
  if docker compose exec -T db pg_isready -U oscommunity >/dev/null 2>&1; then
    echo "PostgreSQL is ready."
    exit 0
  fi
  sleep 1
done

echo "PostgreSQL did not become ready in time." >&2
exit 1
