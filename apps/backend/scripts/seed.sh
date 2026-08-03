#!/usr/bin/env bash
set -euo pipefail

pnpm --filter @veridex/backend exec ts-node apps/backend/prisma/seed.ts
