#!/usr/bin/env bash
set -euo pipefail

# Run prisma migrate in dev
pnpm --filter @veridex/backend exec prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
