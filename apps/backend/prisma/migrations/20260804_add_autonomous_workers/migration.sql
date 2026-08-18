-- Migration: add_autonomous_workers
-- Adds WorkerState, Execution, Task, TaskLog models

CREATE TABLE IF NOT EXISTS "WorkerState" (
  id TEXT PRIMARY KEY,
  "workerId" TEXT UNIQUE,
  name TEXT,
  version TEXT,
  status TEXT,
  "lastSeen" TIMESTAMPTZ,
  metadata JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Execution" (
  id TEXT PRIMARY KEY,
  "contractId" TEXT,
  "opportunityId" TEXT,
  "clientId" TEXT,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  timeline JSONB,
  audit JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Task" (
  id TEXT PRIMARY KEY,
  "executionId" TEXT REFERENCES "Execution"(id) ON DELETE CASCADE,
  type TEXT,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  "maxAttempts" INTEGER,
  "scheduledAt" TIMESTAMPTZ,
  "startedAt" TIMESTAMPTZ,
  "finishedAt" TIMESTAMPTZ,
  "workerId" TEXT,
  result JSONB,
  error JSONB,
  "dependsOn" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "TaskLog" (
  id TEXT PRIMARY KEY,
  "taskId" TEXT,
  "executionId" TEXT,
  event TEXT,
  details JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
