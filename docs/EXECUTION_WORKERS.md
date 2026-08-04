# Autonomous Execution Workers

This document describes the Autonomous Execution Workers implemented on feature/009-autonomous-workers.

Architecture
- Worker framework: hot-pluggable registry and worker modules under apps/backend/src/services/workers
- Queues: bullmq backed queues for pending/running/waiting/retry/completed/failed/cancelled
- Repository: Prisma models Execution, Task, TaskLog, WorkerState in apps/backend/prisma/schema.prisma
- API: routes under apps/backend/src/api/routes/workers.ts for execution lifecycle and worker status

Worker lifecycle
- validate -> schedule -> assign -> execute -> verify -> log -> complete
- Retries use exponential backoff; maxAttempts enforced by Task.maxAttempts

Retry logic
- Failures increment attempts; tasks are scheduled to retry queue with delay = base * 2^(attempts-1)

Recovery
- Rollback and resume supported via worker rollback hooks and task checkpointing persisted in Task.result

Operational notes
- Ensure DATABASE_URL and REDIS_URL are available to services
- Protect worker API routes with internal auth

Testing
- Unit tests included under apps/backend/src/__tests__/workers

