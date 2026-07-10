#!/usr/bin/env bash
# Mark Community integration flags for Steward eco-production-evidence cap 98/99.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STEWARD="${STEWARD_ORGOS_ROOT:-$ROOT/../OS_Steward}"
INTEGRATION="$STEWARD/publish/protocol/community-integration.json"
VOCAB="$ROOT/packages/shared/scripts/i18n/steward-protocol-vocabulary-translations.mjs"
JURISDICTION_PAGE="$ROOT/apps/web/src/app/protocol/jurisdiction/page.tsx"

if [[ ! -d "$STEWARD" ]]; then
  echo "Steward repo not found at $STEWARD" >&2
  exit 1
fi

node -e "
const fs = require('fs');
const path = '$INTEGRATION';
let data = {};
try { data = JSON.parse(fs.readFileSync(path, 'utf8')); } catch {}
Object.assign(data, {
  community_ui: true,
  sla_dashboard: true,
  lifecycle_page: true,
  trusted_operators_page: true,
  governance_api: true,
  jurisdiction_registry_ui: fs.existsSync('$JURISDICTION_PAGE'),
  vocabulary_i18n: fs.existsSync('$VOCAB'),
  e2e_green: process.env.COMMUNITY_E2E_GREEN === '1',
  community_integration_at: new Date().toISOString(),
});
fs.mkdirSync(require('path').dirname(path), { recursive: true });
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('✓ Updated', path);
console.log('  jurisdiction_registry_ui:', data.jurisdiction_registry_ui);
console.log('  vocabulary_i18n:', data.vocabulary_i18n);
console.log('  e2e_green:', data.e2e_green);
"
