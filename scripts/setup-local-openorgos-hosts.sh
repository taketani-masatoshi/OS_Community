#!/usr/bin/env bash
# Point openorgos.org / openorgos.net to local Caddy (127.0.0.1) for development.
# Without this, browsers resolve the domain to Cloudflare and may show HTTP 530.
set -euo pipefail

HOSTS_FILE="/etc/hosts"
MARKER="# os-community local dev"
LINE="127.0.0.1 openorgos.org www.openorgos.org openorgos.net www.openorgos.net $MARKER"

if grep -q "$MARKER" "$HOSTS_FILE" 2>/dev/null; then
  echo "Updating local hosts entry (sudo required)..."
  sudo sed -i '' "/$MARKER/d" "$HOSTS_FILE" 2>/dev/null || sudo sed -i "/$MARKER/d" "$HOSTS_FILE"
fi

echo "Adding local hosts entry (sudo required)..."
echo "$LINE" | sudo tee -a "$HOSTS_FILE" >/dev/null
echo "Added: $LINE"

if [[ "$(uname -s)" == "Darwin" ]]; then
  echo "Flushing DNS cache..."
  sudo dscacheutil -flushcache
  sudo killall -HUP mDNSResponder 2>/dev/null || true
fi

echo
echo "Verify (Caddy 起動時):"
curl -sk -o /dev/null -w "  https://openorgos.org/ -> %{http_code}\n" https://openorgos.org/ 2>/dev/null || true
echo
echo "If the browser warns about the certificate, run:"
echo "  ./scripts/trust-caddy-local-ca.sh"
