#!/bin/zsh
# Health watchdog for the integrated localhost stack.
# Called by LaunchAgent every few minutes. Starts Colima + compose if down.
set -euo pipefail
export PATH="/opt/homebrew/bin:/opt/homebrew/opt/colima/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="${LOCAL_STACK_WATCH_LOG:-/tmp/orgos-local-stack-watch.log}"
lock="/tmp/orgos-local-stack-watch.lock"

log() { echo "$(date '+%Y-%m-%dT%H:%M:%S') $*" >>"$LOG"; }

# Avoid overlapping runs
if [[ -f "$lock" ]]; then
  old="$(cat "$lock" 2>/dev/null || true)"
  if [[ -n "$old" ]] && kill -0 "$old" 2>/dev/null; then
    exit 0
  fi
fi
echo $$ >"$lock"
trap 'rm -f "$lock"' EXIT

healthy() {
  local body
  body="$(curl -s -m 3 --noproxy '*' http://127.0.0.1:3000/api/health 2>/dev/null || true)"
  [[ "$body" == *'"status":"ok"'* ]] || [[ "$body" == *'"ok":true'* ]] || return 1
  local oc
  oc="$(curl -s -m 2 --noproxy '*' http://127.0.0.1:9471/health 2>/dev/null || true)"
  if [[ "$oc" != *'"ok":true'* ]]; then
    oc="$(curl -s -m 2 --noproxy '*' http://127.0.0.1:9470/health 2>/dev/null || true)"
  fi
  [[ "$oc" == *'"ok":true'* ]] || return 1
  local code
  code="$(curl -s -m 2 -o /dev/null -w '%{http_code}' --noproxy '*' http://127.0.0.1:4178/ 2>/dev/null || true)"
  [[ "$code" == "200" ]]
}

if healthy; then
  exit 0
fi

log "unhealthy — ensure Colima + compose"
"$ROOT/scripts/start-local-stack.sh" --ensure >>"$LOG" 2>&1 || log "ensure failed status=$?"
if healthy; then
  log "recovered"
else
  log "still unhealthy after ensure"
  exit 1
fi
