#!/usr/bin/env bash
# Start southwood.cloud SaaS stack (Docker) + optional dev Org Agent profile.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.cloud ]]; then
  cp .env.cloud.example .env.cloud
  echo "Created .env.cloud from example — review AGENT_TOKEN and DB password."
fi

set -a
# shellcheck disable=SC1091
source .env.cloud
set +a

docker compose -f docker-compose.cloud.yml --profile dev up -d --build

echo ""
echo "Cloud stack up (dev profile: org-agent + console stub)."
echo "  https://control.${CLOUD_DOMAIN:-southwood.cloud}:${CLOUD_HTTPS_PORT:-8443}/health"
echo "  https://demo.${CLOUD_DOMAIN:-southwood.cloud}:${CLOUD_HTTPS_PORT:-8443}/"
echo "  https://dash.${CLOUD_DOMAIN:-southwood.cloud}:${CLOUD_HTTPS_PORT:-8443}/"
echo ""
echo "If hosts are not set: ./scripts/setup-local-southwood-cloud-hosts.sh"
echo "Production tunnel:     ./scripts/start-cloudflare-tunnel-cloud.sh"
