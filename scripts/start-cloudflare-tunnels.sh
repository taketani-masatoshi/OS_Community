#!/usr/bin/env bash
# Start Cloudflare Tunnels for openorgos.net AND southwood.cloud (background).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

COMMUNITY_TUNNEL_ID="${COMMUNITY_TUNNEL_ID:-3eec3f29-6743-4028-b443-ac5f6cd5e65b}"

if [[ -f .env.cloud ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.cloud
  set +a
fi

CLOUD_TUNNEL_ID="${CLOUDFLARE_TUNNEL_ID:-}"
HTTPS_PORT="${CLOUD_HTTPS_PORT:-8443}"

if [[ -z "$CLOUD_TUNNEL_ID" ]]; then
  echo "Set CLOUDFLARE_TUNNEL_ID in .env.cloud (see .env.cloud.example)"
  exit 1
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Install cloudflared: brew install cloudflared"
  exit 1
fi

mkdir -p /tmp

build_config() {
  local ingress="$1"
  local out="$2"
  node "$ROOT/scripts/lib/cloudflare-tunnel.mjs" "$ingress" > "$out"
}

start_tunnel() {
  local name="$1"
  local tunnel_id="$2"
  local config="$3"
  local metrics_port="$4"
  local log="/tmp/os-community-cloudflared-${name}.log"

  if [[ "$name" == "community" ]]; then
    if docker compose ps cloudflared-inc --status running -q 2>/dev/null | grep -q .; then
      echo "[community] docker compose service cloudflared-inc already running"
      return 0
    fi
    echo "[community] starting docker compose service cloudflared-inc"
    docker compose up -d cloudflared-inc
    return 0
  fi

  if pgrep -f "cloudflared tunnel --config ${config} " >/dev/null 2>&1; then
    echo "[${name}] already running (config ${config})"
    return 0
  fi

  echo "[${name}] starting tunnel ${tunnel_id} → log ${log}"
  nohup cloudflared tunnel \
    --config "$config" \
    --metrics "127.0.0.1:${metrics_port}" \
    run >> "$log" 2>&1 &
  disown
  sleep 2
}

echo "Checking Docker origins..."
if ! curl -sf -o /dev/null http://localhost:3000/; then
  echo "Warning: Community web not on :3000 — run: docker compose up -d"
fi
if ! curl -sf -o /dev/null http://localhost:8080/health 2>/dev/null; then
  if ! curl -sf -o /dev/null http://localhost:8080/ 2>/dev/null; then
    echo "Warning: cloud-control not on :8080 — run: ./scripts/start-cloud-stack.sh"
  fi
fi

COMMUNITY_CONFIG="/tmp/os-community-cloudflared-community.yml"
CLOUD_CONFIG="/tmp/os-community-cloudflared-cloud.yml"

build_config "deploy/cloudflared/openorgos-net.ingress.yml" "$COMMUNITY_CONFIG"
build_config "deploy/cloudflared/southwood-cloud.ingress.yml" "$CLOUD_CONFIG"

start_tunnel "community" "$COMMUNITY_TUNNEL_ID" "$COMMUNITY_CONFIG" "20241"
start_tunnel "cloud" "$CLOUD_TUNNEL_ID" "$CLOUD_CONFIG" "20242"

echo ""
echo "Tunnel status:"
cloudflared tunnel info "$COMMUNITY_TUNNEL_ID" 2>&1 | head -8 || true
echo "---"
cloudflared tunnel info "$CLOUD_TUNNEL_ID" 2>&1 | head -8 || true
echo ""
echo "Public URLs:"
echo "  https://openorgos.net           → localhost:3000 (Community web)"
echo "  https://control.southwood.cloud → localhost:8080 (cloud-control)"
echo "  https://dash.southwood.cloud    → localhost:8082 (cloud-dash)"
echo "  https://demo.southwood.cloud    → localhost:8080 (org edge)"
echo ""
echo "Logs:"
echo "  tail -f /tmp/os-community-cloudflared-community.log"
echo "  tail -f /tmp/os-community-cloudflared-cloud.log"
