#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ "${SKIP_DB_MIGRATE:-}" != "1" ]; then
  echo "Applying database migrations..."
  node ./node_modules/prisma/build/index.js migrate deploy \
    --schema=./packages/db/prisma/schema.prisma
fi

exec "$@"
