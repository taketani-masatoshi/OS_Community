#!/bin/bash
# VPS 本番デプロイ用スクリプト
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Create .env from .env.example first"
  exit 1
fi

docker compose -f docker-compose.prod.yml up -d --build
echo "Deployed. Set DOMAIN in .env for TLS."
