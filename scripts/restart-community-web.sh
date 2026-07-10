#!/usr/bin/env bash
# Restart Community web stack (db schema sync + web + tunnel connector).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop を起動してから再実行してください。" >&2
  open -a Docker 2>/dev/null || true
  exit 1
fi

echo "==> DB 起動・スキーマ同期"
bash scripts/ensure-db.sh
bash scripts/with-env.sh npm run push -w @os-community/db

echo "==> web + cloudflared-inc 再起動"
docker compose up -d --force-recreate web cloudflared-inc

echo "==> ヘルス待機"
for i in $(seq 1 40); do
  if curl -sf -o /dev/null http://localhost:3000/api/health; then
    echo "OK: http://localhost:3000/api/health"
    break
  fi
  sleep 3
done

echo
bash scripts/verify-openorgos-org.sh
