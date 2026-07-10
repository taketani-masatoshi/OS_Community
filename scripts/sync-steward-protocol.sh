#!/usr/bin/env bash
# Sync Steward publish/protocol mirror into Community (local dev · CI).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STEWARD="${STEWARD_ORGOS_ROOT:-$ROOT/../OS_Steward}"
DEST="${STEWARD_PROTOCOL_MIRROR:-$ROOT/apps/web/public/steward-protocol}"

if [[ ! -d "$STEWARD" ]]; then
  echo "Steward repo not found at $STEWARD" >&2
  exit 1
fi

cd "$STEWARD"
if [[ -x "$STEWARD/package.json" ]]; then
  npm run orgos -- protocol community export 2>/dev/null || cp -f "$STEWARD/steward/platform/protocol/trusted-operators.yaml" "$STEWARD/publish/protocol/" 2>/dev/null || true
fi
mkdir -p "$DEST"
cp -f "$STEWARD/publish/protocol/"* "$DEST/" 2>/dev/null || true
echo "✓ Synced → $DEST"
ls -la "$DEST"
