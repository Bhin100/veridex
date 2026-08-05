# Discovery Architecture

This document describes the Continuous Discovery Engine in VERIDEX.

Overview
- The Discovery Engine discovers public opportunities via pluggable connectors.
- Connectors implement a common interface and can be registered dynamically.
- The discovery pipeline follows: Collector -> Normalizer -> Deduplicator -> Score -> Store -> Queue

Connector interface
- Implement the DiscoveryConnector interface in apps/backend/src/services/discovery/connector.ts
- Connectors must not hardcode credentials; use secretProvider or env config.

Opportunity schema
- Stored in the database via the Opportunity Prisma model (apps/backend/prisma/schema.prisma)
- See packages/shared/src/discovery/types.ts for the TypeScript representation.

Scheduler lifecycle
- DiscoveryManager in apps/backend/src/services/discovery/manager.ts schedules connectors and executes scans.
- Scan intervals are configurable via connector.scanIntervalSec or DISCOVERY_SCAN_SEC env.

Deduplication
- deduper implements exact (source+externalId) and naive near-duplicate checks (content token match).
- Future improvements should use fingerprinting and similarity algorithms.
