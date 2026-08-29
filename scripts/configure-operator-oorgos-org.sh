#!/usr/bin/env bash
# Publish operator.oorgos.org via Cloudflare DNS + Tunnel ingress.
# Requires CF_API_TOKEN (Zone:DNS:Edit + Account:Cloudflare Tunnel:Edit) in .env or env.
#
# Manual fallback: docs/org-os/operator-console-https-runbook.md (OS_Steward)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

ZONE_NAME="${CF_ZONE_NAME:-oorgos.org}"
TUNNEL_ID="${OORGOS_TUNNEL_ID:-683a2039-939a-4e0a-9e4f-3591accfcf13}"
OPERATOR_HOST="${OPERATOR_PUBLIC_HOST:-operator.oorgos.org}"
COMMUNITY_HOST="${DOMAIN:-community.oorgos.org}"
OPERATOR_SERVICE="${OPERATOR_TUNNEL_SERVICE:-http://operator-console:9470}"
COMMUNITY_SERVICE="${COMMUNITY_TUNNEL_SERVICE:-http://127.0.0.1:3000}"

echo "=== operator.oorgos.org 公開設定 ==="
echo "Tunnel ID: $TUNNEL_ID"
echo "Operator:  $OPERATOR_HOST → $OPERATOR_SERVICE"
echo

if [[ -z "${CF_API_TOKEN:-}" ]]; then
  echo "CF_API_TOKEN が未設定です。Cloudflare ダッシュボードで手動設定してください:"
  echo
  echo "  DNS (oorgos.org):"
  echo "    CNAME operator → ${TUNNEL_ID}.cfargotunnel.com  (Proxy ON)"
  echo
  echo "  Zero Trust → Networks → Connectors → oorgos-org → Public Hostname:"
  echo "    operator.oorgos.org → $OPERATOR_SERVICE"
  echo
  echo "  参照: deploy/cloudflared/oorgos-org.ingress.yml"
  echo "        ../OS_Steward/docs/org-os/operator-console-https-runbook.md"
  exit 1
fi

api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  if [[ -n "$data" ]]; then
    curl -sfS -X "$method" "https://api.cloudflare.com/client/v4${path}" \
      -H "Authorization: Bearer ${CF_API_TOKEN}" \
      -H "Content-Type: application/json" \
      --data "$data"
  else
    curl -sfS -X "$method" "https://api.cloudflare.com/client/v4${path}" \
      -H "Authorization: Bearer ${CF_API_TOKEN}"
  fi
}

ZONE_ID="${CF_ZONE_ID:-}"
ACCOUNT_ID="${CF_ACCOUNT_ID:-}"
if [[ -z "$ZONE_ID" || -z "$ACCOUNT_ID" ]]; then
  ZONE_JSON="$(api GET "/zones?name=${ZONE_NAME}")"
  if [[ -z "$ZONE_ID" ]]; then
    ZONE_ID="$(printf '%s' "$ZONE_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result'][0]['id'] if d.get('result') else '')")"
  fi
  if [[ -z "$ACCOUNT_ID" ]]; then
    ACCOUNT_ID="$(printf '%s' "$ZONE_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); r=d.get('result') or []; print(r[0].get('account',{}).get('id','') if r else '')")"
  fi
fi
if [[ -z "$ACCOUNT_ID" ]]; then
  ACCOUNT_ID="$(api GET "/accounts?per_page=1" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result'][0]['id'] if d.get('result') else '')" 2>/dev/null || true)"
fi
[[ -n "$ZONE_ID" ]] || { echo "Zone ${ZONE_NAME} が見つかりません（Zone DNS 権限を確認）"; exit 1; }
[[ -n "$ACCOUNT_ID" ]] || { echo "CF_ACCOUNT_ID を取得できません"; exit 1; }

echo "[1] DNS CNAME operator → ${TUNNEL_ID}.cfargotunnel.com"
TARGET="${TUNNEL_ID}.cfargotunnel.com"
EXISTING="$(api GET "/zones/${ZONE_ID}/dns_records?type=CNAME&name=operator.${ZONE_NAME}" | python3 -c "import json,sys; d=json.load(sys.stdin); r=d.get('result') or []; print(r[0]['id'] if r else '')")"
PAYLOAD="$(python3 -c "import json; print(json.dumps({'type':'CNAME','name':'operator','content':'${TARGET}','proxied':True}))")"
if [[ -n "$EXISTING" ]]; then
  api PUT "/zones/${ZONE_ID}/dns_records/${EXISTING}" "$PAYLOAD" >/dev/null
  echo "  ✓ 更新: operator.${ZONE_NAME}"
else
  api POST "/zones/${ZONE_ID}/dns_records" "$PAYLOAD" >/dev/null
  echo "  ✓ 作成: operator.${ZONE_NAME}"
fi

echo "[2] Tunnel ingress (community + operator)"
CONFIG_JSON="$(python3 <<PY
import json
config = {
  "config": {
    "ingress": [
      {"hostname": "${COMMUNITY_HOST}", "service": "${COMMUNITY_SERVICE}"},
      {"hostname": "${OPERATOR_HOST}", "service": "${OPERATOR_SERVICE}"},
      {"service": "http_status:404"},
    ]
  }
}
print(json.dumps(config))
PY
)"
TUNNEL_HTTP="$(
  curl -sS -o /tmp/cf-tunnel-config.json -w "%{http_code}" -X PUT \
    "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/cfd_tunnel/${TUNNEL_ID}/configurations" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "$CONFIG_JSON" || true
)"
if [[ "$TUNNEL_HTTP" == "200" ]] && python3 -c "import json; d=json.load(open('/tmp/cf-tunnel-config.json')); raise SystemExit(0 if d.get('success') else 1)"; then
  echo "  ✓ Tunnel ingress 更新"
else
  echo "  ✗ Tunnel API 権限不足 (HTTP ${TUNNEL_HTTP:-?})"
  echo "    CF_API_TOKEN に次を追加して再実行:"
  echo "      Account → Cloudflare Tunnel → Edit"
  echo "    または Zero Trust ダッシュボードで Public Hostname を手動追加:"
  echo "      ${OPERATOR_HOST} → ${OPERATOR_SERVICE}"
  TUNNEL_OK=0
fi

echo
echo "[3] 確認（DNS 伝播待ち 10–60 秒）"
sleep 5
for i in 1 2 3 4 5 6; do
  # Prefer IPv4 — some local resolvers return AAAA-only briefly and curl fails.
  if curl -4 -sf --connect-timeout 8 "https://${OPERATOR_HOST}/health" 2>/dev/null | grep -q '"ok":true'; then
    echo "  ✓ https://${OPERATOR_HOST}/health → OK"
    exit 0
  fi
  if curl -sf --connect-timeout 8 "https://${OPERATOR_HOST}/health" 2>/dev/null | grep -q '"ok":true'; then
    echo "  ✓ https://${OPERATOR_HOST}/health → OK"
    exit 0
  fi
  echo "  … 待機 ($i/6)"
  sleep 10
done

echo "  ✗ https://${OPERATOR_HOST}/health がまだ応答しません"
if [[ "${TUNNEL_OK:-1}" == "0" ]]; then
  echo "    → Tunnel Public Hostname が未設定の可能性が高いです（上記 [2]）"
fi
echo "    → ./scripts/start-local-stack.sh で operator-console 起動"
echo "    → docker compose up -d --force-recreate cloudflared-inc"
exit 1
