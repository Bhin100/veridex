-- Migration: add_learning_engine
-- This SQL creates tables for the Learning Engine. Additive only.

CREATE TABLE IF NOT EXISTS "LearningRecord" (
  id TEXT PRIMARY KEY,
  "opportunityId" TEXT,
  "engagementId" TEXT,
  "contractId" TEXT,
  "clientId" TEXT,
  outcome TEXT NOT NULL,
  revenue DOUBLE PRECISION DEFAULT 0,
  "paymentStatus" TEXT,
  "executionOutcome" TEXT,
  "responseTimeMs" INTEGER,
  "rejectionReason" TEXT,
  lessons JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learningrecord_createdat ON "LearningRecord" ("createdAt");
CREATE INDEX IF NOT EXISTS idx_learningrecord_clientid ON "LearningRecord" ("clientId");

CREATE TABLE IF NOT EXISTS "ProposalPerformance" (
  id TEXT PRIMARY KEY,
  "learningRecordId" TEXT NOT NULL,
  "proposalId" TEXT,
  score DOUBLE PRECISION DEFAULT 0,
  selected BOOLEAN DEFAULT false,
  reason TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_learningrecord ON "ProposalPerformance" ("learningRecordId");

CREATE TABLE IF NOT EXISTS "ClientProfile" (
  "clientId" TEXT PRIMARY KEY,
  "lastSeenAt" TIMESTAMPTZ,
  "lifetimeRevenue" DOUBLE PRECISION DEFAULT 0,
  "preferredPricing" JSONB,
  "preferredProposalStyle" JSONB,
  "returnCount" INTEGER DEFAULT 0,
  "commonObjections" JSONB,
  "negotiationPatterns" JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "LearningMetric" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  "computedAt" TIMESTAMPTZ DEFAULT now()
);
