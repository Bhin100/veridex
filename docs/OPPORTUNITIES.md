# Opportunities Engine

This document describes the Opportunity Intelligence Engine.

Overview
- The Opportunity Engine consumes normalized opportunities from the discovery pipeline and applies validation, analysis, scoring, rule evaluation and routing into priority queues.

Models
- Opportunity: enriched record with priority, estimates, risk indicators, tags and processing history.
- OpportunityProcessingHistory: audit trail for processing steps.
- RuleSet: versionable rule container stored in DB.

Scoring
- Scoring is handled by a modular ScoringEngine (packages/shared/src/scoring).
- Individual scoring modules implement a simple contract and are registered with the engine.
- Final Opportunity Score is a weighted composition of module outputs.

Rules
- RuleEngine (packages/shared/src/rules) supports registering rule functions and evaluating them against an opportunity context.
- RuleSets are persisted and versioned; rules can be swapped without code changes.

Queues
- Separate queues are maintained for discovered, analysis, high/normal/low priority, and archived items.
- Queue routing is performed after scoring based on final score thresholds.

Extension points
- Add new scoring modules under packages/shared/src/scoring/modules and register them with the engine.
- Implement new rule evaluation strategies by enhancing packages/shared/src/rules.
