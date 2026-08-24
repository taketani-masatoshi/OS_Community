#!/bin/zsh
# Start the integrated localhost stack (Community + Operator + settlement approve).
# Preferred over host npm Operator Console.
#
# Usage:
#   ./scripts/start-local-stack.sh           # full rebuild + up
#   ./scripts/start-local-stack.sh --ensure  # Colima + compose up (no rebuild)
#   ./scripts/start-local-stack.sh --down
#
set -euo pipefail
export PATH="/opt/homebrew/bin:/opt/homebrew/opt/colima/bin:/Applications/Docker.app/Contents/Resources/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Prefer Colima docker.sock when present (kk-owned daemon)
if [[ -S "${HOME}/.colima/default/docker.sock" ]]; then
  export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
elif [[ -S "${HOME}/.colima/docker.sock" ]]; then
  export DOCKER_HOST="unix://${HOME}/.colima/docker.sock"
fi

STEWARD_HOST_PATH="${STEWARD_HOST_PATH:-$(cd "$ROOT/../OS_Steward" 2>/dev/null && pwd || echo "$ROOT/../OS_Steward")}"
export STEWARD_HOST_PATH
export ORGOS_TENANT="${ORGOS_TENANT:-mal}"

COMPOSE=(
  docker compose
  -f docker-compose.yml
  -f docker-compose.operator.yml
  -f docker-compose.local.yml
  --profile operator
)

die() { echo "ERROR: $*" >&2; exit 1; }

bind_colima_sock() {
  if [[ -S "${HOME}/.colima/default/docker.sock" ]]; then
    export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
  elif [[ -S "${HOME}/.colima/docker.sock" ]]; then
    export DOCKER_HOST="unix://${HOME}/.colima/docker.sock"
  fi
}

ensure_colima() {
  command -v colima >/dev/null 2>&1 || return 1
  # `colima status` often logs to stderr; sock presence is the reliable signal.
  if [[ -S "${HOME}/.colima/default/docker.sock" ]] || [[ -S "${HOME}/.colima/docker.sock" ]]; then
    if docker info >/dev/null 2>&1 || docker --context colima info >/dev/null 2>&1; then
      bind_colima_sock
      docker context use colima >/dev/null 2>&1 || true
      return 0
    fi
  fi
  echo "Colima is not running — starting VM…"
  colima start || true
  bind_colima_sock
  docker context use colima >/dev/null 2>&1 || true
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    die "docker CLI not found"
  fi
  ensure_colima || true
  if docker info >/dev/null 2>&1; then
    return 0
  fi
  if docker --context colima info >/dev/null 2>&1; then
    export DOCKER_CONTEXT=colima
    bind_colima_sock
    return 0
  fi
  if docker --context desktop-linux info >/dev/null 2>&1; then
    export DOCKER_CONTEXT=desktop-linux
    unset DOCKER_HOST 2>/dev/null || true
    return 0
  fi
  die "Docker daemon not reachable as $(whoami).
Options:
  1) Start Colima:  colima start
  2) Open Docker Desktop while logged in as this user
Also stop the ghost orgos-demo on :9470:
  docker ps --filter publish=9470 && docker stop <id>"
}

stop_host_console() {
  setopt local_options null_glob
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
  # Stale orgos-demo on :9470 (auth off) — must not win over operator-console
  local ids
  ids="$(docker ps -q --filter publish=9470 2>/dev/null || true)"
  if [[ -n "$ids" ]]; then
    echo "Stopping containers publishing :9470…"
    # shellcheck disable=SC2086
    docker stop $ids >/dev/null 2>&1 || true
    # shellcheck disable=SC2086
    docker rm -f $ids >/dev/null 2>&1 || true
  fi
  ids="$(docker ps -aq --filter ancestor=ghcr.io/taketani-masatoshi/orgos-demo 2>/dev/null || true)"
  if [[ -n "$ids" ]]; then
    echo "Removing orgos-demo containers…"
    # shellcheck disable=SC2086
    docker rm -f $ids >/dev/null 2>&1 || true
  fi
  pkill -f 'orgos-demo:' 2>/dev/null || true
  pkill -f '127.0.0.1:9470:9470' 2>/dev/null || true
}

port_busy() {
  local port="$1"
  curl -s -m 1 -o /dev/null --noproxy '*' "http://127.0.0.1:${port}/health" 2>/dev/null \
    || curl -s -m 1 -o /dev/null --noproxy '*' "http://127.0.0.1:${port}/" 2>/dev/null
}

choose_operator_host_port() {
  # Canonical host port is 9470. If a foreign process still answers there
  # (e.g. another user's Docker Desktop orgos-demo), publish on 9471 once.
  export OPERATOR_CONSOLE_HOST_PORT="${OPERATOR_CONSOLE_HOST_PORT:-9470}"
  sleep 1
  if [[ "${OPERATOR_CONSOLE_HOST_PORT}" == "9470" ]] && port_busy 9470; then
    local health
    health="$(curl -s -m 1 --noproxy '*' http://127.0.0.1:9470/health 2>/dev/null || true)"
    echo "WARN: :9470 still occupied after cleanup (foreign Docker publish)."
    echo "      health=${health}"
    echo "      Publishing Operator Console on :9471 instead."
    echo "      Free :9470 then re-run to restore the canonical port:"
    echo "        sudo kill <docker-run-orgos-demo-pid>   # or docker stop via Desktop owner"
    export OPERATOR_CONSOLE_HOST_PORT=9471
  fi
  if port_busy "${OPERATOR_CONSOLE_HOST_PORT}"; then
    die ":${OPERATOR_CONSOLE_HOST_PORT} is busy — free it and re-run"
  fi
  export WIRE_CONSOLE_WEBAUTHN_RP_ID="${WIRE_CONSOLE_WEBAUTHN_RP_ID:-localhost}"
  export WIRE_CONSOLE_WEBAUTHN_ORIGIN="http://localhost:${OPERATOR_CONSOLE_HOST_PORT}"
  export NEXT_PUBLIC_OPERATOR_CONSOLE_URL="http://localhost:${OPERATOR_CONSOLE_HOST_PORT}"
}

assert_ports_free_or_ours() {
  choose_operator_host_port
}

down_all() {
  echo "Stopping integrated stack…"
  stop_host_console
  stop_ghost_demo
  "${COMPOSE[@]}" down --remove-orphans 2>/dev/null || true
  # Legacy cloud orphans under same project name
  docker compose -f docker-compose.cloud.yml down --remove-orphans 2>/dev/null || true
  echo "Down complete."
}

wait_http() {
  local url="$1" label="$2" n="${3:-60}"
  local i body
  for i in $(seq 1 "$n"); do
    body="$(curl -s -m 2 --noproxy '*' "$url" 2>/dev/null || true)"
    if [[ "$body" == *'"ok":true'* ]] || [[ "$(curl -s -m 2 -o /dev/null -w '%{http_code}' --noproxy '*' "$url" 2>/dev/null)" == "200" ]]; then
      echo "OK $label — $url"
      [[ -n "$body" ]] && echo "   $body"
      return 0
    fi
    sleep 2
  done
  die "timeout waiting for $label ($url)"
}

up_all() {
  ensure_docker
  [[ -d "$STEWARD_HOST_PATH/tenants/${ORGOS_TENANT:-mal}" ]] \
    || die "STEWARD_HOST_PATH invalid (missing tenants/${ORGOS_TENANT:-mal}): $STEWARD_HOST_PATH"
  [[ -f "$ROOT/.env" ]] || die "Missing $ROOT/.env (CLOUDFLARE_TUNNEL_TOKEN etc.)"

  down_all
  assert_ports_free_or_ours

  echo "Building operator-console image…"
  "${COMPOSE[@]}" build operator-console

  echo "Starting db + web + operator-console + approve…"
  "${COMPOSE[@]}" up -d db web operator-console approve

  echo "Waiting for web health…"
  wait_http "http://127.0.0.1:3000/api/health" "Community web" 90

  echo "Force-recreate cloudflared (avoid 502 after restart)…"
  "${COMPOSE[@]}" up -d --force-recreate cloudflared-inc

  echo "Waiting for operator-console…"
  wait_http "http://127.0.0.1:${OPERATOR_CONSOLE_HOST_PORT}/health" "Operator Console" 90

  echo "Waiting for approve UI…"
  wait_http "http://127.0.0.1:4178/" "Settlement approve" 30

  echo "Checking community.oorgos.org…"
  local code
  code="$(curl -s -m 8 -o /dev/null -w '%{http_code}' https://community.oorgos.org/api/health || true)"
  echo "community.oorgos.org/api/health → $code (expect 200)"

  local oc_health
  oc_health="$(curl -s -m 2 --noproxy '*' "http://127.0.0.1:${OPERATOR_CONSOLE_HOST_PORT}/health" || true)"
  echo ""
  echo "Stack ready:"
  echo "  Chat/Wire:  http://localhost:${OPERATOR_CONSOLE_HOST_PORT}/  ·  http://localhost:${OPERATOR_CONSOLE_HOST_PORT}/wire/"
  echo "              (127.0.0.1 でも届きますが PassKey は localhost にリダイレクトされます)"
  echo "  Approve:    http://localhost:4178/enroll"
  echo "  Community:  http://127.0.0.1:3000/  ·  https://community.oorgos.org/"
  echo "  health:     ${oc_health}"
  if [[ "${OPERATOR_CONSOLE_HOST_PORT}" != "9470" ]]; then
    echo "  NOTE: canonical :9470 is still held by a foreign process — using :${OPERATOR_CONSOLE_HOST_PORT}"
  fi
  "${COMPOSE[@]}" ps
}

# Bring existing containers back without rebuild (Colima/VM restart).
ensure_stack() {
  ensure_docker
  echo "Ensuring compose services are up…"
  "${COMPOSE[@]}" up -d db web operator-console approve
  wait_http "http://127.0.0.1:3000/api/health" "Community web" 90
  echo "Force-recreate cloudflared (avoid 502 after restart)…"
  "${COMPOSE[@]}" up -d --force-recreate cloudflared-inc
  choose_operator_host_port_for_probe
  wait_http "http://127.0.0.1:${OPERATOR_CONSOLE_HOST_PORT}/health" "Operator Console" 60
  wait_http "http://127.0.0.1:4178/" "Settlement approve" 20
  local code
  code="$(curl -s -m 8 -o /dev/null -w '%{http_code}' https://community.oorgos.org/api/health || true)"
  echo "community.oorgos.org/api/health → $code (expect 200)"
  "${COMPOSE[@]}" ps
}

choose_operator_host_port_for_probe() {
  export OPERATOR_CONSOLE_HOST_PORT="${OPERATOR_CONSOLE_HOST_PORT:-9470}"
  local h9470 h9471
  h9470="$(curl -s -m 1 --noproxy '*' http://127.0.0.1:9470/health 2>/dev/null || true)"
  h9471="$(curl -s -m 1 --noproxy '*' http://127.0.0.1:9471/health 2>/dev/null || true)"
  if [[ "$h9471" == *'"auth":true'* ]]; then
    export OPERATOR_CONSOLE_HOST_PORT=9471
  elif [[ "$h9470" == *'"auth":true'* ]]; then
    export OPERATOR_CONSOLE_HOST_PORT=9470
  elif [[ "$h9471" == *'"ok":true'* ]]; then
    export OPERATOR_CONSOLE_HOST_PORT=9471
  fi
}

case "${1:-up}" in
  --down|down) down_all ;;
  --ensure|ensure) ensure_stack ;;
  --up|up|"") up_all ;;
  *) die "usage: $0 [--up|--down|--ensure]" ;;
esac
