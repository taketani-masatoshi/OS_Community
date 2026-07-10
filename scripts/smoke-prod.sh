#!/usr/bin/env bash
# Build and smoke-test the production Docker stack (db + web runner).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT="${SMOKE_PROJECT_NAME:-os-community-smoke}"
COMPOSE=(docker compose -f docker-compose.prod.yml -p "$PROJECT")

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT/.env"
  set +a
fi

export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-smoke-postgres-password}"
export AUTH_SECRET="${AUTH_SECRET:-smoke-auth-secret-change-me}"
export DOMAIN="${DOMAIN:-localhost}"

echo "==> Validating docker-compose.prod.yml"
"${COMPOSE[@]}" config >/dev/null

echo "==> Building production web image"
"${COMPOSE[@]}" build web

echo "==> Starting db + web"
"${COMPOSE[@]}" up -d db web

wait_for_service() {
  local service="$1"
  local attempts="${2:-60}"
  local i=1
  while (( i <= attempts )); do
    if "${COMPOSE[@]}" ps --status running --services | grep -qx "$service"; then
      local cid
      cid="$("${COMPOSE[@]}" ps -q "$service")"
      if docker inspect "$cid" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}running{{end}}' | grep -Eq 'healthy|running'; then
        if [[ "$service" == "web" ]]; then
          if "${COMPOSE[@]}" exec -T web wget -q -O - http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
            return 0
          fi
        else
          return 0
        fi
      fi
    fi
    sleep 2
    ((i++))
  done
  return 1
}

on_err() {
  echo "Smoke failed. Recent web logs:" >&2
  "${COMPOSE[@]}" logs --tail=40 web >&2 || true
}
trap on_err ERR

echo "==> Waiting for db"
wait_for_service db 30

echo "==> Waiting for web health"
wait_for_service web 90

echo "==> Checking /api/health"
health="$("${COMPOSE[@]}" exec -T web wget -q -O - http://127.0.0.1:3000/api/health)"
echo "$health" | grep -q '"status":"ok"'

echo "==> Checking home page"
"${COMPOSE[@]}" exec -T web wget -q -O - http://127.0.0.1:3000/ >/dev/null

echo "Production smoke passed."

if [[ "${SMOKE_KEEP_STACK:-}" != "1" ]]; then
  echo "==> Tearing down smoke stack"
  "${COMPOSE[@]}" down -v --remove-orphans
else
  echo "Stack left running (SMOKE_KEEP_STACK=1)."
fi
