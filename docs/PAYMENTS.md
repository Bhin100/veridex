# Payment Guardian & Contract Engine

This document describes the Payment Guardian & Contract Engine implemented in VERIDEX.

Overview
- The Payment Guardian ensures VERIDEX does not begin execution until payment conditions are satisfied.
- It manages Contract records, monitors deposits, verifies payments, and maintains audit history.

Supported Payment Methods (pluggable)
- USDT TRC20 (adapter scaffold added)
- USDT Polygon (adapter scaffold added)

Contract Model
- Contract contains client, opportunity, scope, pricing, deposit, remaining balance, payment & verification status, timeline and audit history.

Deposit lifecycle
- Deposits are recorded via the API (contracts/:id/deposits) or detected by provider watchers.
- Guardian polls pending deposits and calls provider.verifyDeposit(event) to confirm on-chain proof.
- On successful verification, deposit is marked verified and contract paymentStatus is updated to deposit_confirmed.

Payment states
- awaiting_agreement, awaiting_deposit, deposit_detected, deposit_verifying, deposit_confirmed, work_authorized, awaiting_final_payment, fully_paid, cancelled.

Security
- NEVER commit private keys or credentials. Provider adapters are stubs/points of integration. Use secure secret stores for production credentials.

Dashboard
- Placeholder pages exist under apps/web/pages/dashboard/payments/* for operational UI.

Testing
- Unit tests for contract lifecycle and duplicate detection are included. Integration tests require DATABASE_URL and REDIS_URL in CI.

Extension points
- Implement concrete provider integrations for TRC20 and Polygon under apps/backend/src/services/payments/providers.
- Add webhook or websocket-based provider watchers for real-time deposit detection.
