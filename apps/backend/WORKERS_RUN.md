# Workers Operator — Local Run

This file documents how to run the workers subsystem independently from the main backend process.

Usage:

  NODE_ENV=production node ./apps/backend/dist/server.workers.js

Or add to your package.json scripts:

  "start:workers": "node ./apps/backend/dist/server.workers.js"

Requirements:
- Ensure DATABASE_URL and REDIS_URL are set in the environment
- Build the backend (`pnpm --filter @veridex/backend build`) to produce the compiled JS under dist/
