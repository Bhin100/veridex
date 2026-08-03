# Health checks

The application exposes the following endpoints:
- GET /health/liveness - verifies the app process is alive
- GET /health/readiness - verifies DB connectivity and readiness

Health checks are implemented with timeouts and provide clear HTTP 200 for ready, 503 for unready.
