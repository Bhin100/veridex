-- Migration: add_approval_engine

-- Add ApprovalPolicy table
CREATE TABLE IF NOT EXISTS "ApprovalPolicy" (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Add ApprovalDecision
CREATE TABLE IF NOT EXISTS "ApprovalDecision" (
  id TEXT PRIMARY KEY,
  "opportunityId" TEXT UNIQUE NOT NULL,
  "policyId" TEXT NOT NULL,
  decision TEXT NOT NULL,
  "confidenceScore" DOUBLE PRECISION NOT NULL,
  "confidenceBreakdown" JSONB,
  "estimatedProfit" DOUBLE PRECISION,
  "estimatedTimeHours" DOUBLE PRECISION,
  "riskLevel" TEXT,
  explanation TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Add DecisionAudit
CREATE TABLE IF NOT EXISTS "DecisionAudit" (
  id TEXT PRIMARY KEY,
  "decisionId" TEXT NOT NULL,
  actor TEXT,
  action TEXT NOT NULL,
  details JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Add DecisionHistory
CREATE TABLE IF NOT EXISTS "DecisionHistory" (
  id TEXT PRIMARY KEY,
  "decisionId" TEXT NOT NULL,
  "previousDecision" TEXT,
  "newDecision" TEXT,
  "changedBy" TEXT,
  reason TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Add DecisionMetric
CREATE TABLE IF NOT EXISTS "DecisionMetric" (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE,
  name TEXT,
  value JSONB,
  "computedAt" TIMESTAMPTZ DEFAULT now()
);
