#!/usr/bin/env bash
set -euo pipefail

corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm --filter @veridex/backend build
pnpm --filter @veridex/backend test
