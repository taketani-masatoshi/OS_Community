#!/usr/bin/env bash
# Sync Steward publish/protocol mirror into Community (local dev · CI).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STEWARD="${STEWARD_ORGOS_ROOT:-$ROOT/../Core}"
DEST="${STEWARD_PROTOCOL_MIRROR:-$ROOT/apps/web/public/steward-protocol}"

if [[ ! -d "$STEWARD" ]]; then
  echo "Steward repo not found at $STEWARD" >&2
  exit 1
fi

# Consume an existing export. Generating it is a separate Core operation.
for name in community-readiness.json community-sla.json trusted-operators.yaml wire-node-governance.yaml community-wire-node-api.json community-tenant-mail-api.json; do
  if [[ ! -s "$STEWARD/publish/protocol/$name" ]]; then
    echo "Required Core protocol export missing or empty: $name" >&2
    exit 1
  fi
done
mkdir -p "$DEST"
cp -f "$STEWARD/publish/protocol/"* "$DEST/"
echo "✓ Synced → $DEST"
ls -la "$DEST"
