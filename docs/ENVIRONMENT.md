# Environment Variables

Required:
- NODE_ENV=development|production|test
- PORT
- DATABASE_URL
- JWT_SECRET (min 16 chars)
- FOUNDER_EMAIL
- FOUNDER_PASSWORD

Optional:
- REDIS_URL
- LOG_LEVEL
- SECRET_PROVIDER (env|vault)
- TELEGRAM_MINIAPP_ORIGIN
- DATABASE_URL_TEST (for integration tests)

See apps/backend/.env.example for a working local example.
