#!/bin/zsh
# One-shot: fix Docker socket access (if needed), stop ghost :9470, start local stack.
# Double-click or: open scripts/fix-docker-and-start-local.command
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "=== OpenOrgOS local stack bootstrap ==="
echo "User: $(whoami)"

if ! docker info >/dev/null 2>&1 && ! docker --context desktop-linux info >/dev/null 2>&1; then
  echo "Docker not reachable — requesting sudo to open the Desktop socket…"
  SOCK="$(readlink /var/run/docker.sock 2>/dev/null || echo /var/run/docker.sock)"
  sudo chmod 666 "$SOCK" || sudo chmod 666 /Users/*/".docker/run/docker.sock" 2>/dev/null || true
fi

# Stop foreign orgos-demo on 9470
if docker info >/dev/null 2>&1 || docker --context desktop-linux info >/dev/null 2>&1; then
  docker ps -q --filter publish=9470 | while read -r id; do
    echo "Stopping $id on :9470"
    docker stop "$id" || true
    docker rm -f "$id" || true
  done
fi

exec ./scripts/start-local-stack.sh
