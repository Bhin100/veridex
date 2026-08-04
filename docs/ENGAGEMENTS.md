# Client Understanding & Engagement Engine

This document describes the Client Understanding & Engagement Engine implemented in VERIDEX.

Overview
- The Engagement Engine receives high-priority opportunities and prepares a client-facing draft and workspace for founder review.
- It does not send messages or accept payments — drafts are generated only.

Pipeline
- Qualified Opportunity -> Client Request Analysis -> Context Extraction -> Requirement Identification -> Risk Detection -> Professional Response Draft -> Founder Review Queue

Workspace
- Each Engagement stores an internal workspace with client context, analysis, drafts, and processing history.

Draft Generation
- The draft generator is template-based and modular (apps/backend/src/services/engagement/draftGenerator.ts).
- Templates are configurable; confidence score is estimated heuristically.

Queues
- Engagements are created from high-priority opportunity queue (opportunities:high).
- Drafts are enqueued to engagements:founder_review for founder action.

Testing
- Unit tests are provided for the draft generation and engagement processor.

Security
- No outbound messages are sent automatically; all drafts require explicit founder action.

