#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-file>"
  exit 1
fi

pg_restore -d "$DATABASE_URL" --clean --no-owner "$1"

echo "Restore complete"
