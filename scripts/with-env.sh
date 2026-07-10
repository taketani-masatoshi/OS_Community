#!/usr/bin/env bash
# Load repo root .env, then run the given command.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.env" ]]; then
  echo "Missing $ROOT/.env — copy from .env.example first." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. "$ROOT/.env"
set +a

exec "$@"
