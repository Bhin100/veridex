#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d%H%M%S)
FILE="backup-$TIMESTAMP.sql"
pg_dump "$DATABASE_URL" -Fc -f "$FILE"

echo "Backup saved to $FILE"
