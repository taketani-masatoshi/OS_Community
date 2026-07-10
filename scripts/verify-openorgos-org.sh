#!/usr/bin/env bash
# Verify local web + tunnel readiness for openorgos.net publication.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TUNNEL_ID="${COMMUNITY_TUNNEL_ID:-}"
DOMAIN="${DOMAIN:-community.oorgos.org}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  TUNNEL_ID="${COMMUNITY_TUNNEL_ID:-$TUNNEL_ID}"
  DOMAIN="${DOMAIN:-community.oorgos.org}"
fi

pass=0
fail=0

check() {
  local label="$1"
  local ok="$2"
  if [[ "$ok" == "1" ]]; then
    echo "  ✓ $label"
    pass=$((pass + 1))
  else
    echo "  ✗ $label"
    fail=$((fail + 1))
  fi
}

echo "=== community.oorgos.org 公開チェック ==="
echo

echo "[1] ローカル Web (localhost:3000)"
if curl -sf -o /dev/null http://localhost:3000/api/health; then
  check "http://localhost:3000/api/health → 200" 1
else
  check "http://localhost:3000/api/health → 200" 0
  echo "      → cd $ROOT && docker compose up -d db web"
fi

echo
echo "[2] Docker コンテナ"
if docker compose ps web --status running -q 2>/dev/null | grep -q .; then
  check "web コンテナ running" 1
else
  check "web コンテナ running" 0
fi
if docker compose ps cloudflared-inc --status running -q 2>/dev/null | grep -q .; then
  check "cloudflared-inc running" 1
else
  check "cloudflared-inc running" 0
  echo "      → docker compose up -d cloudflared-inc"
fi

echo
echo "[3] .env ドメイン設定"
if [[ "${AUTH_URL:-}" == "https://${DOMAIN}" ]]; then
  check "AUTH_URL=https://${DOMAIN}" 1
else
  check "AUTH_URL=https://${DOMAIN} (現在: ${AUTH_URL:-未設定})" 0
fi
if [[ "${NEXT_PUBLIC_SITE_URL:-}" == "https://${DOMAIN}" ]]; then
  check "NEXT_PUBLIC_SITE_URL=https://${DOMAIN}" 1
else
  check "NEXT_PUBLIC_SITE_URL=https://${DOMAIN} (現在: ${NEXT_PUBLIC_SITE_URL:-未設定})" 0
fi

echo
echo "[4] Tunnel 接続 (connector → Cloudflare)"
if [[ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]]; then
  if docker compose ps cloudflared-inc --status running -q 2>/dev/null | grep -q .; then
    check "cloudflared-inc running (token mode)" 1
  else
    check "cloudflared-inc running (token mode)" 0
    echo "      → docker compose up -d cloudflared-inc"
  fi
elif [[ -n "$TUNNEL_ID" ]]; then
  TUNNEL_INFO=$(cloudflared tunnel info "$TUNNEL_ID" 2>&1 || true)
  if echo "$TUNNEL_INFO" | grep -q "does not have any active connection"; then
    check "Tunnel ${TUNNEL_ID} に connector 接続あり" 0
    echo "      → docker compose up -d cloudflared-inc"
  elif echo "$TUNNEL_INFO" | grep -qE "linux_|darwin_|windows_"; then
    check "Tunnel ${TUNNEL_ID} に connector 接続あり" 1
  else
    check "Tunnel ${TUNNEL_ID} に connector 接続あり" 0
  fi
else
  check "CLOUDFLARE_TUNNEL_TOKEN または COMMUNITY_TUNNEL_ID が .env にある" 0
fi

echo
echo "[5] 公開 DNS (${DOMAIN})"
NS=$(dig +short "@1.1.1.1" "$DOMAIN" NS 2>/dev/null | head -2)
if [[ -n "$NS" ]]; then
  check "${DOMAIN} の NS レコードあり" 1
  echo "      NS: $(echo "$NS" | tr '\n' ' ')"
else
  check "${DOMAIN} の NS レコードあり" 0
  echo "      → Cloudflare Overview で NS を確認し、レジストラで NS を変更"
fi

CNAME=$(dig +short "@1.1.1.1" "$DOMAIN" CNAME 2>/dev/null)
if [[ -n "$CNAME" ]] && echo "$CNAME" | grep -q "cfargotunnel.com"; then
  check "${DOMAIN} → Tunnel CNAME 設定済み" 1
elif curl -sfI "https://${DOMAIN}/api/health" 2>/dev/null | head -1 | grep -qE "200|301|302"; then
  check "https://${DOMAIN} が応答" 1
else
  check "${DOMAIN} → Tunnel / HTTPS 応答" 0
  echo "      → Cloudflare Zero Trust で Public Hostname を設定"
fi

echo
echo "---"
echo "結果: ${pass} OK / ${fail} 要対応"
if [[ "$fail" -eq 0 ]]; then
  echo "公開準備完了。ブラウザで https://${DOMAIN}/ を開いてください。"
else
  echo "手順: docs/oorgos-subdomain-setup.md"
fi
