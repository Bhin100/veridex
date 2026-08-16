# Security foundation

This document describes the security primitives implemented in the foundation:

- Helmet for secure headers
- Cookie-based session with JWT
- CSRF protection (cookie-based flows)
- Rate limiting with Redis as optional backing store
- Input validation using zod
- Audit logging skeleton

Do NOT commit secrets. Use environment variables or a secrets manager.
