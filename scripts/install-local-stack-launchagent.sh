#!/bin/zsh
# Install login + interval watchdog so Colima/compose come back after reboot/sleep.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/bin:/bin:${PATH:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLIST_SRC="$ROOT/deploy/launchd/org.oorgos.local-stack.plist"
PLIST_DST="${HOME}/Library/LaunchAgents/org.oorgos.local-stack.plist"

mkdir -p "${HOME}/Library/LaunchAgents"
cp "$PLIST_SRC" "$PLIST_DST"

# Colima at login (VM). Compose restart: unless-stopped + watchdog handle the rest.
if command -v brew >/dev/null 2>&1 && brew list colima >/dev/null 2>&1; then
  brew services start colima >/dev/null 2>&1 || true
  echo "brew services: colima (restart at login)"
fi

launchctl bootout "gui/$(id -u)/org.oorgos.local-stack" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_DST"
launchctl enable "gui/$(id -u)/org.oorgos.local-stack" >/dev/null 2>&1 || true
launchctl kickstart -k "gui/$(id -u)/org.oorgos.local-stack" >/dev/null 2>&1 || true
echo "LaunchAgent loaded: $PLIST_DST"
echo "  interval 180s · RunAtLoad · log /tmp/orgos-local-stack-watch.log"
