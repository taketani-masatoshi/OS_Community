#!/usr/bin/env bash
# Point southwood.cloud subdomains to local Caddy (127.0.0.1) for development.
set -euo pipefail

HOSTS_FILE="/etc/hosts"
MARKER="# os-community cloud local dev"
LINE="127.0.0.1 southwood.cloud www.southwood.cloud control.southwood.cloud dash.southwood.cloud demo.southwood.cloud $MARKER"

if grep -q "$MARKER" "$HOSTS_FILE" 2>/dev/null; then
  echo "Hosts entry already present."
else
  echo "Adding local hosts entry (sudo required)..."
  echo "$LINE" | sudo tee -a "$HOSTS_FILE" >/dev/null
  echo "Added: $LINE"
fi

if [[ "$(uname -s)" == "Darwin" ]]; then
  echo "Flushing DNS cache..."
  sudo dscacheutil -flushcache
  sudo killall -HUP mDNSResponder 2>/dev/null || true
fi

echo
echo "Verify (start stack first: ./scripts/start-cloud-stack.sh):"
echo "  curl -sk https://control.southwood.cloud:8443/health"
curl -sk -o /dev/null -w "  https://control.southwood.cloud:8443/health -> %{http_code}\n" https://control.southwood.cloud:8443/health 2>/dev/null || true
