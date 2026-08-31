#!/bin/zsh
# Start the integrated localhost stack (Community + Operator + settlement approve).
# Preferred over host npm Operator Console.
#
# Usage:
#   ./scripts/start-local-stack.sh           # full rebuild + up
#   ./scripts/start-local-stack.sh --ensure  # Colima + compose up (rebuild host SPA/CLI if stale)
#   ./scripts/start-local-stack.sh --down
#
# Operator Console (:9470) mounts host OS_Steward SPA + CLI dist. If those are
# stale, Good/Bad and /chat/v1/feedback never appear — this script rebuilds them
# when sources are newer (or dist is missing).
#
set -euo pipefail
export PATH="/opt/homebrew/bin:/opt/homebrew/opt/colima/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STEWARD_HOST_PATH="${STEWARD_HOST_PATH:-$(cd "$ROOT/../OS_Steward" 2>/dev/null && pwd || echo "$ROOT/../OS_Steward")}"
export STEWARD_HOST_PATH

COMPOSE=(
  docker compose
  -f docker-compose.yml
  -f docker-compose.operator.yml
  -f docker-compose.local.yml
  --profile operator
)

die() { echo "ERROR: $*" >&2; exit 1; }

# Host-mounted SPA / CLI dist must stay newer than sources (Docker volume overlay).
# Empty or stale dist → Good/Bad UI and /chat/v1/feedback never appear on :9470.
newest_mtime() {
  local newest=0 f m
  for f in "$@"; do
    [[ -e "$f" ]] || continue
    m="$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f" 2>/dev/null || echo 0)"
    (( m > newest )) && newest=$m
  done
  echo "$newest"
}

ensure_steward_console_dist() {
  local steward="$STEWARD_HOST_PATH"
  local spa_dist="$steward/apps/steward-chat/dist/index.html"
  local cli_marker="$steward/packages/orgos-cli/dist/src/lib/steward-chat/routes/chat-api.js"
  local need_spa=0 need_cli=0

  if [[ ! -f "$spa_dist" ]]; then
    need_spa=1
  else
    local spa_age src_age
    spa_age="$(newest_mtime "$spa_dist")"
    src_age="$(newest_mtime \
      "$steward/apps/steward-chat/src/AgentChatPage.tsx" \
      "$steward/apps/steward-chat/src/ChatFeedbackButtons.tsx" \
      "$steward/apps/steward-chat/src/ChatSettingsPage.tsx" \
      "$steward/apps/steward-chat/src/agentChatStore.ts" \
      "$steward/apps/steward-chat/src/api.ts" \
      "$steward/apps/steward-chat/src/steward-copy.ts" \
      "$steward/apps/steward-chat/src/app.css")"
    (( src_age > spa_age )) && need_spa=1
  fi

  if [[ ! -f "$cli_marker" ]]; then
    need_cli=1
  else
    local cli_age src_age
    cli_age="$(newest_mtime "$cli_marker")"
    src_age="$(newest_mtime \
      "$steward/src/lib/steward-chat/routes/chat-api.ts" \
      "$steward/src/lib/steward-chat/answer-memory.ts" \
      "$steward/src/lib/steward-chat/faq-index.ts" \
      "$steward/src/lib/steward-chat/chat-feedback.ts" \
      "$steward/src/lib/steward-chat/chat-thread.ts" \
      "$steward/src/lib/operator-runtime/llm-chat.ts" \
      "$steward/src/lib/operator-runtime/llm-api.ts")"
    (( src_age > cli_age )) && need_cli=1
  fi

  if (( need_spa == 0 && need_cli == 0 )); then
    echo "SPA/CLI dist up to date under $steward"
    return 0
  fi

  command -v npm >/dev/null 2>&1 || die "npm required to rebuild Steward console dist (SPA/CLI)"
  [[ -f "$steward/package.json" ]] || die "Steward package.json missing: $steward"

  (
    cd "$steward"
    if (( need_spa )); then
      echo "Rebuilding Operator Console SPA (steward-chat + wire)…"
      npm run operator-console:build
    fi
    if (( need_cli )); then
      echo "Rebuilding orgos-cli package dist (BFF)…"
      npm run build:package
    fi
  )
  echo "SPA/CLI dist rebuilt at $(date '+%Y-%m-%dT%H:%M:%S')"
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    die "docker CLI not found"
  fi
  unset DOCKER_HOST 2>/dev/null || true
  if command -v colima >/dev/null 2>&1; then
    if ! colima status 2>/dev/null | grep -qi 'Running'; then
      echo "Starting Colima…"
      colima start
    fi
    docker context use colima >/dev/null 2>&1 || true
    export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
    if docker info >/dev/null 2>&1; then
      return 0
    fi
  fi
  if docker --context desktop-linux info >/dev/null 2>&1; then
    export DOCKER_CONTEXT=desktop-linux
    return 0
  fi
  if docker info >/dev/null 2>&1; then
    return 0
  fi
  die "Docker daemon not reachable as $(whoami)."
}

stop_host_console() {
  for f in /tmp/orgos-operator-console*.pid; do
    [[ -f "$f" ]] || continue
    pid="$(cat "$f" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]]; then
      kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$f"
  done
  pkill -f 'src/cli.ts operator console start' 2>/dev/null || true
  pkill -f 'operator console start' 2>/dev/null || true
}

stop_ghost_demo() {
  local ids
  ids="$(docker ps -q --filter ancestor=ghcr.io/taketani-masatoshi/orgos-demo 2>/dev/null || true)"
  if [[ -n "$ids" ]]; then
    echo "Removing orgos-demo containers…"
    # shellcheck disable=SC2086
    docker rm -f $ids >/dev/null 2>&1 || true
  fi
}

wait_http() {
  local url="$1" label="$2" n="${3:-60}"
  local i code body tmp
  tmp="$(mktemp)"
  for i in $(seq 1 "$n"); do
    code="$(curl -sS -m 20 -o "$tmp" -w '%{http_code}' --noproxy '*' "$url" 2>/dev/null || echo 000)"
    body="$(cat "$tmp" 2>/dev/null || true)"
    # Community health is {"status":"ok"}; console is {"ok":true}; approve is HTML.
    # A 2s curl used to miss both: /api/health is ~2s in Docker Next.js.
    if [[ "$code" == "200" ]]; then
      echo "OK $label — $url"
      [[ -n "$body" && "$body" == *"{"* ]] && echo "   ${body:0:180}"
      rm -f "$tmp"
      return 0
    fi
    sleep 2
  done
  rm -f "$tmp"
  die "timeout waiting for $label ($url)"
}

down_all() {
  echo "Stopping integrated stack…"
  stop_host_console
  stop_ghost_demo
  "${COMPOSE[@]}" down --remove-orphans 2>/dev/null || true
  docker compose -f docker-compose.cloud.yml down --remove-orphans 2>/dev/null || true
  echo "Down complete."
}

up_services() {
  echo "Starting db + web + operator-console + approve…"
  "${COMPOSE[@]}" up -d db web operator-console approve
  echo "Waiting for web health…"
  wait_http "http://127.0.0.1:3000/api/health" "Community web" 90
  echo "Force-recreate cloudflared (avoid 502 after restart)…"
  "${COMPOSE[@]}" up -d --force-recreate cloudflared-inc
  echo "Waiting for operator-console…"
  wait_http "http://127.0.0.1:9470/health" "Operator Console" 90
  echo "Waiting for approve UI…"
  wait_http "http://127.0.0.1:4178/" "Settlement approve" 30
  echo "Checking community.oorgos.org…"
  local code
  code="$(curl -s -m 8 -o /dev/null -w '%{http_code}' https://community.oorgos.org/api/health || true)"
  echo "community.oorgos.org/api/health → $code (expect 200)"
  echo ""
  echo "Stack ready:"
  echo "  Chat/Wire:  http://127.0.0.1:9470/  ·  https://operator.oorgos.org/"
  echo "  Approve:    http://localhost:4178/enroll"
  echo "  Community:  http://127.0.0.1:3000/  ·  https://community.oorgos.org/"
  "${COMPOSE[@]}" ps
}

up_all() {
  ensure_docker
  [[ -d "$STEWARD_HOST_PATH/tenants" || -f "$STEWARD_HOST_PATH/package.json" ]] || die "STEWARD_HOST_PATH invalid: $STEWARD_HOST_PATH"
  [[ -f "$ROOT/.env" ]] || die "Missing $ROOT/.env (CLOUDFLARE_TUNNEL_TOKEN etc.)"
  ensure_steward_console_dist
  down_all
  echo "Building operator-console image…"
  "${COMPOSE[@]}" build operator-console
  up_services
}

ensure_all() {
  ensure_docker
  [[ -d "$STEWARD_HOST_PATH/tenants" || -f "$STEWARD_HOST_PATH/package.json" ]] || die "STEWARD_HOST_PATH invalid: $STEWARD_HOST_PATH"
  [[ -f "$ROOT/.env" ]] || die "Missing $ROOT/.env (CLOUDFLARE_TUNNEL_TOKEN etc.)"
  ensure_steward_console_dist
  stop_ghost_demo
  # Recreate operator-console so mounted packages/orgos-cli/dist is reloaded into Node
  echo "Force-recreate operator-console (pick up host CLI dist)…"
  "${COMPOSE[@]}" up -d --force-recreate operator-console
  up_services
}

case "${1:-up}" in
  --down|down) down_all ;;
  --ensure|ensure) ensure_all ;;
  --up|up|"") up_all ;;
  *) die "usage: $0 [--up|--ensure|--down]" ;;
esac
