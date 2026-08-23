# Workers — Additional Integration Notes

This document captures small integration notes that complement the runbook and architecture docs.

- Ensure the main backend server imports `apps/backend/src/server.workers.ts` during startup or runs it as a separate process for worker-only deployments.
- Ensure `initWorkers()` is called before any external triggers may dispatch tasks.
- The worker subsystem stores metrics in the `LearningMetric` table to reuse monitoring infrastructure.
- The Execution repository exposes safe methods for cancel, resume, list, and query by contract.
