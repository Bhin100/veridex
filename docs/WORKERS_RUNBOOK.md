# Workers — Operational Notes

This document supplements EXECUTION_WORKERS.md with operational checks and runbook items:

- Ensure worker init happens during backend startup: call initWorkers() from server entrypoint.
- Ensure setupGracefulShutdown() is called in server startup to allow safe shutdown.
- Required env vars: REDIS_URL, DATABASE_URL, WORKER_RETRY_BASE_MS, WORKER_HEARTBEAT_TTL, WORKER_METRICS_SEC
- Health checks should call /api/v1/workers/status and /api/v1/workers/queues
