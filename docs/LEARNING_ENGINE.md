# Learning & Continuous Improvement Engine

This document describes the Learning Engine implemented on feature/008-learning-engine.

Overview
- The Learning Engine records outcomes for completed opportunities, proposals, payments, and execution outcomes.
- It computes operational metrics (win rate, avg revenue, CLV estimations, proposal success rates, avg response times, ROI, etc.) on a scheduled basis.
- It provides deterministic recommendations and adapts scoring weights via the Adaptive Scorer.

Data model
- LearningRecord: central record for opportunity outcome, revenue, response times, rejection reasons and lessons.
- ProposalPerformance: per-proposal performance tied to a LearningRecord.
- ClientProfile: memory engine store for returning client preferences and negotiation patterns.
- LearningMetric: key/value store for computed metrics and adaptive weights.

Integration
- The Learning Repository exposes methods to store outcomes and metrics.
- The Learning Scheduler periodically runs computations (LEARNING_POLL_SEC).
- The Adaptive Scorer can be invoked to update scoring engine weights.
- Recommender provides deterministic suggestions for pricing, proposal style, execution order and client priority.

APIs
- GET /api/v1/learning/stats — key metrics
- GET /api/v1/learning/roi-by-source — ROI per source
- GET /api/v1/learning/recommend/:opportunityId — recommendations for an opportunity

Operational notes
- Add `LEARNING_POLL_SEC` to control computation frequency (default 3600s)
- Add `LEARNING_RETENTION_DAYS` to control data retention (default 3650)

Testing
- Unit tests in apps/backend/src/__tests__/learning validate repository behavior and engine computations. Integration tests require a test DB and Redis.

Privacy
- The system stores client identifiers; follow your organization's privacy policies and retention rules.
