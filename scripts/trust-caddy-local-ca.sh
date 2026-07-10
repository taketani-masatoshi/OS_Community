#!/usr/bin/env bash
# Install Caddy's local development root CA into macOS trust store.
# Removes the browser "connection is not private" warning for https://localhost.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="$ROOT/deploy/certs"
ROOT_CRT="$CERT_DIR/caddy-local-root.crt"
CONTAINER="${CADDY_CONTAINER:-os_community-caddy-1}"

mkdir -p "$CERT_DIR"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Error: Caddy container '$CONTAINER' is not running."
  echo "Start the stack first: docker compose up -d"
  exit 1
fi

docker cp "$CONTAINER:/data/caddy/pki/authorities/local/root.crt" "$ROOT_CRT"
echo "Exported Caddy root CA to $ROOT_CRT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Non-macOS: import $ROOT_CRT into your OS trust store manually."
  exit 0
fi

echo "Adding root CA to login keychain (you may be prompted for your password)..."
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db "$ROOT_CRT"

echo
echo "Done. Quit and reopen your browser, then open:"
echo "  https://localhost"
echo "  https://openorgos.net  (requires ./scripts/setup-local-openorgos-hosts.sh)"
