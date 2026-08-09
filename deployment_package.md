# VERIDEX BELMO DEPLOYMENT PACKAGE & EXTRACTION REPORT

This document represents the definitive, implementation-derived extraction guide to safely and successfully deploy the existing VERIDEX application to the Belmo production environment.

All parameters, configurations, and procedures documented herein are directly extracted from the codebase's active structures and schemas.

---

## A. REQUIRED ENVIRONMENT VARIABLES

The following variables are strictly required by the Express API application, database configuration, or security validator (`apps/backend/src/lib/config.ts`) and must be specified to prevent runtime bootstrap failure:

### 1. DATABASE_URL
- **REQUIRED OR OPTIONAL:** Required
- **SECRET OR PUBLIC:** Secret
- **USED BY:** Prisma client & Database connection pool
- **EXACT FILE:** `apps/backend/prisma/schema.prisma`, `apps/backend/src/lib/config.ts`
- **PURPOSE:** Provides connection criteria and credentials for the production PostgreSQL database.
- **EXPECTED FORMAT:** standard postgresql connection URI string.
- **SAFE EXAMPLE FORMAT:** `postgresql://veridex_user:YOUR_PASSWORD_HERE@your-postgres-db.belmo.sh:5432/veridex_prod?schema=public`
- **WHAT HAPPENS IF MISSING:** Database client fails to initialize; server throws immediate validation error and crashes during the bootstrap process.

### 2. JWT_SECRET
- **REQUIRED OR OPTIONAL:** Required
- **SECRET OR PUBLIC:** Secret
- **USED BY:** Token signers, verifiers, and API session handlers
- **EXACT FILE:** `apps/backend/src/lib/config.ts`, `apps/backend/src/middleware/auth.ts`
- **PURPOSE:** Cryptographic salt to sign and decode user session JWT tokens. Must be at least 16 characters in length to pass Zod configuration checks.
- **EXPECTED FORMAT:** Random high-entropy alpha-numeric string.
- **SAFE EXAMPLE FORMAT:** `YOUR_HIGH_ENTROPY_JWT_SECRET_STRING_HERE`
- **WHAT HAPPENS IF MISSING:** Zod configuration schema validation fails on startup; Express application fails to boot.

### 3. FOUNDER_EMAIL
- **REQUIRED OR OPTIONAL:** Required
- **SECRET OR PUBLIC:** Public (Configuration)
- **USED BY:** Security initialization, database seed checks, and login authentication.
- **EXACT FILE:** `apps/backend/src/lib/config.ts`
- **PURPOSE:** Sets the email address for the root founder account.
- **EXPECTED FORMAT:** Valid RFC 5322 email string.
- **SAFE EXAMPLE FORMAT:** `founder@veridex-agency.io`
- **WHAT HAPPENS IF MISSING:** Schema validation fails; system fails to compile or bootstrap.

### 4. FOUNDER_PASSWORD
- **REQUIRED OR OPTIONAL:** Required
- **SECRET OR PUBLIC:** Secret
- **USED BY:** Security initialization and database seeding
- **EXACT FILE:** `apps/backend/src/lib/config.ts`
- **PURPOSE:** Configures the password credential for the root founder account (minimum length 8 characters).
- **EXPECTED FORMAT:** Secure, alpha-numeric string.
- **SAFE EXAMPLE FORMAT:** `YOUR_SECURE_PASSWORD_HERE`
- **WHAT HAPPENS IF MISSING:** Schema validation fails; server crashes on startup.

---

## B. OPTIONAL ENVIRONMENT VARIABLES

The following environment parameters are verified as supported fallbacks or optional integrations across the codebase, depending on active payment, worker, or telegram routes:

### 1. TELEGRAM_BOT_TOKEN
- **REQUIRED OR OPTIONAL:** Optional (Required if using Telegram Command Center or Loopback Alerting)
- **SECRET OR PUBLIC:** Secret
- **USED BY:** Telegram Bot API notifications and signature validation middleware
- **EXACT FILE:** `apps/backend/src/services/approval/telegram.service.ts`, `apps/backend/src/middleware/telegramAuth.ts`
- **PURPOSE:** Provides secure API access to Telegram's Bot servers to push alerts and parse webhook commands.
- **EXPECTED FORMAT:** Numeric ID followed by a colon and alphanumeric hash.
- **SAFE EXAMPLE FORMAT:** `1234567890:YOUR_TELEGRAM_BOT_TOKEN_HERE`
- **WHAT HAPPENS IF MISSING:** Outbound Telegram notifications are skipped; inbound webhooks fail, but other Express server endpoints continue operating normally.

### 2. TELEGRAM_FOUNDER_CHAT_ID
- **REQUIRED OR OPTIONAL:** Optional (Required if using Telegram Command Center or Loopback Alerting)
- **SECRET OR PUBLIC:** Secret (Config ID)
- **USED BY:** Webhook authorization gate and alert target dispatcher
- **EXACT FILE:** `apps/backend/src/services/approval/telegram.service.ts`, `apps/backend/src/api/routes/telegram.ts`
- **PURPOSE:** Restricts webhook processing and system action commands (Approve, Reject, Status) strictly to the configured founder, rejecting all other user chat events.
- **EXPECTED FORMAT:** Valid unique numeric ID.
- **SAFE EXAMPLE FORMAT:** `987654321`
- **WHAT HAPPENS IF MISSING:** Outbound alerts are not delivered; inbound messages are blocked as unauthorized for safety.

### 3. TELEGRAM_MINIAPP_ORIGIN
- **REQUIRED OR OPTIONAL:** Optional (Required if utilizing inline-button views or dashboard sessions)
- **SECRET OR PUBLIC:** Public (URL configuration)
- **USED BY:** Mini App button construction and authentication routes
- **EXACT FILE:** `apps/backend/src/lib/config.ts`, `apps/backend/src/services/approval/telegram.service.ts`
- **PURPOSE:** Validates the cryptographic initData origin of the Mini App window frame.
- **EXPECTED FORMAT:** Valid URL starting with `https://`.
- **SAFE EXAMPLE FORMAT:** `https://your-miniapp-subdomain.belmo.sh`
- **WHAT HAPPENS IF MISSING:** View detail links are omitted from outbound alerts; cryptographic origin authentication for dashboard frames is bypassed.

### 4. REDIS_URL
- **REQUIRED OR OPTIONAL:** Optional (Required for production worker task queues)
- **SECRET OR PUBLIC:** Secret
- **USED BY:** BullMQ task execution connection pool
- **EXACT FILE:** `apps/backend/src/services/workers/queues.ts`
- **PURPOSE:** Establishes persistent state connections to redis to queue and process background micro-tasks.
- **EXPECTED FORMAT:** Standard redis connection URI string.
- **SAFE EXAMPLE FORMAT:** `redis://default:YOUR_REDIS_PASSWORD_HERE@your-redis-server.belmo.sh:6379`
- **WHAT HAPPENS IF MISSING:** Falls back to connecting on default `127.0.0.1:6379`, which triggers ECONNREFUSED in secure cloud container sandboxes.

### 5. POLYGON_RPC_URL
- **REQUIRED OR OPTIONAL:** Optional (Required if using Polygon USDT/USDC payment verification)
- **SECRET OR PUBLIC:** Secret (Node RPC endpoint)
- **USED BY:** On-chain USDT Polygon transfer validations
- **EXACT FILE:** `apps/backend/src/services/payments/providers/polygon.ts`
- **PURPOSE:** Connects Payment Guardian to a standard JSON-RPC provider to query transaction receipts and block heights.
- **EXPECTED FORMAT:** standard endpoint URL.
- **SAFE EXAMPLE FORMAT:** `https://polygon-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID`
- **WHAT HAPPENS IF MISSING:** Payment Guardian is unable to query live blockchain receipts on the Polygon network; payment confirmation is skipped.

### 6. TRON_RPC_URL
- **REQUIRED OR OPTIONAL:** Optional (Required if using TRON TRC20 payment verification)
- **SECRET OR PUBLIC:** Secret (Node RPC endpoint)
- **USED BY:** On-chain TRC20 USDT transfer validations
- **EXACT FILE:** `apps/backend/src/services/payments/providers/trc20.ts`
- **PURPOSE:** Connects Payment Guardian to a standard TRON HTTP Node to query smart contract logs by transaction hash.
- **EXPECTED FORMAT:** Standard endpoint URL.
- **SAFE EXAMPLE FORMAT:** `https://api.trongrid.io`
- **WHAT HAPPENS IF MISSING:** Payment Guardian is unable to query TRON receipts; payments default to verification failure states.

### 7. FOUNDER_USDT_TRC20
- **REQUIRED OR OPTIONAL:** Optional
- **SECRET OR PUBLIC:** Public (Wallet Address)
- **USED BY:** Payment matching and verification logic
- **EXACT FILE:** `apps/backend/src/services/payments/providers/trc20.ts`
- **PURPOSE:** Stores the public receiving address on the TRON network to check if incoming deposits match the founder's treasury wallet.
- **EXPECTED FORMAT:** standard Base58 string starting with "T".
- **SAFE EXAMPLE FORMAT:** `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
- **WHAT HAPPENS IF MISSING:** TRON payment matching fails as unconfigured.

### 8. FOUNDER_USDT_POLYGON
- **REQUIRED OR OPTIONAL:** Optional
- **SECRET OR PUBLIC:** Public (Wallet Address)
- **USED BY:** Payment matching and verification logic
- **EXACT FILE:** `apps/backend/src/services/payments/providers/polygon.ts`
- **PURPOSE:** Stores the public receiving address on the Polygon network to match incoming ERC20 transfer topics.
- **EXPECTED FORMAT:** Standard Ethereum Hex address starting with "0x".
- **SAFE EXAMPLE FORMAT:** `0x71C7656EC7ab88b098defB751B7401B5f6d1476B`
- **WHAT HAPPENS IF MISSING:** Polygon payment matching fails as unconfigured.

### 9. FOUNDER_USDC_POLYGON
- **REQUIRED OR OPTIONAL:** Optional
- **SECRET OR PUBLIC:** Public (Wallet Address)
- **USED BY:** Payment matching and verification logic
- **EXACT FILE:** `apps/backend/src/services/payments/providers/polygon.ts`
- **PURPOSE:** Stores the public receiving address for USDC tokens on Polygon.
- **EXPECTED FORMAT:** Standard Ethereum Hex address starting with "0x".
- **SAFE EXAMPLE FORMAT:** `0x71C7656EC7ab88b098defB751B7401B5f6d1476B`
- **WHAT HAPPENS IF MISSING:** Polygon USDC matching is skipped.

### 10. AI / micro-worker variables
- **WORDPRESS_API_KEY:** WordPress Micro-worker deployment secret key (`wordpress.worker.ts`)
- **SERP_API_KEY:** Google SERP search result key for Topic Research micro-worker (`research.worker.ts`)
- **GITHUB_PAT:** GitHub Personal Access Token for Bugfix micro-worker (`bugfix.worker.ts`)
- **OPENAI_API_KEY:** OpenAI LLM generator credential for Content generation micro-worker (`content.worker.ts`)
- **DATA_DB_URL:** Target data import postgres connection URI for Data micro-worker (`data.worker.ts`)
- **VERCEL_DEPLOY_TOKEN:** Vercel website hosting provider deployment token for Website micro-worker (`website.worker.ts`)
- **CONFLUENCE_API_TOKEN:** Wiki/Confluence publishing token for Documentation micro-worker (`docs.worker.ts`)

---

## C. COPY/PASTE ENVIRONMENT BLOCKS

The following raw environment configurations must be supplied inside Belmo's Environment Variable and Secret configurations.

### GROUP A — DATABASE
```ini
DATABASE_URL="postgresql://veridex_user:YOUR_SECURE_PASSWORD_HERE@your-postgres-db.belmo.sh:5432/veridex_prod?schema=public"
```

### GROUP B — REDIS / QUEUES
```ini
REDIS_URL="redis://default:YOUR_REDIS_PASSWORD_HERE@your-redis-server.belmo.sh:6379"
```

### GROUP C — AUTHENTICATION
```ini
JWT_SECRET="YOUR_SECURE_HIGH_ENTROPY_JWT_SECRET_STRING_HERE"
SESSION_COOKIE_NAME="veridex.sid"
```

### GROUP D — FOUNDER CONFIGURATION
```ini
FOUNDER_EMAIL="founder@veridex-agency.io"
FOUNDER_PASSWORD="YOUR_SECURE_FOUNDER_PASSWORD_HERE"
```

### GROUP E — TELEGRAM
```ini
TELEGRAM_BOT_TOKEN="1234567890:YOUR_TELEGRAM_BOT_TOKEN_HERE"
TELEGRAM_FOUNDER_CHAT_ID="987654321"
```

### GROUP F — BLOCKCHAIN / PAYMENT VERIFICATION
```ini
POLYGON_RPC_URL="https://polygon-rpc.com"
TRON_RPC_URL="https://api.trongrid.io"
```

### GROUP G — FOUNDER RECEIVING WALLETS
```ini
FOUNDER_USDT_TRC20="T_YOUR_TRON_RECEIVING_WALLET_ADDRESS_HERE"
FOUNDER_USDT_POLYGON="0x_YOUR_POLYGON_RECEIVING_WALLET_ADDRESS_HERE"
FOUNDER_USDC_POLYGON="0x_YOUR_POLYGON_RECEIVING_WALLET_ADDRESS_HERE"
FOUNDER_PREFERRED_NETWORK="usdt-polygon"
FOUNDER_PAYMENT_INSTRUCTIONS="Send exact deposit amount via USDT on Polygon."
```

### GROUP H — MINI APP / FRONTEND
```ini
TELEGRAM_MINIAPP_ORIGIN="https://your-miniapp-subdomain.belmo.sh"
```

### GROUP I — AI / EXTERNAL APIS
```ini
OPENAI_API_KEY="sk-proj-YOUR_OPENAI_KEY"
SERP_API_KEY="YOUR_SERP_API_KEY"
GITHUB_PAT="github_pat_YOUR_PAT"
WORDPRESS_API_KEY="YOUR_WORDPRESS_SECRET"
DATA_DB_URL="postgresql://user:pass@host:5432/db"
VERCEL_DEPLOY_TOKEN="YOUR_VERCEL_TOKEN"
CONFLUENCE_API_TOKEN="YOUR_CONFLUENCE_TOKEN"
```

### GROUP J — OPTIONAL PRODUCTION CONFIGURATION
```ini
NODE_ENV="production"
PORT="4000"
LOG_LEVEL="info"
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX="100"
```

---

## D. INSTALL COMMAND

Dependency installation is executed in the workspace context:
- **EXACT COMMAND:** `npm install --prefix apps/backend`
- **PURPOSE:** Downloads and matches exact package dependency trees on Express, Prisma Client, Zod, ioredis, JWT, etc.
- **WHEN TO RUN:** Initial container build stage before compilation.
- **EXPECTED RESULT:** Creates the local `apps/backend/node_modules/` directories successfully with 100% matched package targets.

---

## E. DATABASE/PRISMA COMMAND

Database schema compile and client instantiation:
- **EXACT COMMAND:** `npx prisma generate --schema apps/backend/prisma/schema.prisma`
- **PURPOSE:** Generates the highly optimized typescript database models and types for the `@prisma/client` engine.
- **WHEN TO RUN:** In build sequence immediately after `npm install` and prior to building TypeScript.
- **EXPECTED RESULT:** Success notification outputting: `✔ Generated Prisma Client` into `@prisma/client` library reference folders.

---

## F. BUILD COMMAND

TypeScript compilation script:
- **EXACT COMMAND:** `npm run build --prefix apps/backend`
- **PURPOSE:** Executes `tsc -p tsconfig.json` inside the backend directory, compiling source files from `src/` to output target `dist/`.
- **WHEN TO RUN:** Execution build step prior to server deployment startup.
- **EXPECTED RESULT:** Flawless compilation producing Javascript bundles at `apps/backend/dist/apps/backend/src/index.js` with zero errors.

---

## G. START COMMAND

Production server run-time script:
- **EXACT COMMAND:** `npm start --prefix apps/backend`
- **PURPOSE:** Triggers `npx prisma migrate deploy` to deploy persistent model changes to PostgreSQL on the live server, then bootstraps the production app engine by running `node dist/apps/backend/src/index.js`.
- **WHEN TO RUN:** Production container launch script.
- **EXPECTED RESULT:** Database schemas migrate successfully and Pino output logs: `VERIDEX Express Backend started successfully on port 4000` (or specified dynamic `PORT`).

---

## H. BELMO CONFIGURATION

For deployment to Belmo, match the following configuration mapping parameters:
- **PORT REQUIREMENT:** Must dynamically fetch from Belmo's environment injection using `PORT`. Express server hooks this on-the-fly.
- **NODE_ENV REQUIREMENT:** Must be set to `production` to secure cookies and enable rate-limiting protections.
- **BUILD COMMAND:** `npm install --prefix apps/backend && npx prisma generate --schema apps/backend/prisma/schema.prisma && npm run build --prefix apps/backend`
- **STARTUP RUN COMMAND:** `npm start --prefix apps/backend`

---

## I. TELEGRAM POST-DEPLOYMENT SETUP

Since the Telegram module operates as a webhook, the founder must run the following sequence to map Bot commands:

1. **Webhook Registration:** Invoke an HTTPS POST or GET request to the official Telegram Bot API to register the public route:
   ```bash
   curl -X POST https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook \
        -H "Content-Type: application/json" \
        -d '{"url": "https://<YOUR_BELMO_PUBLIC_URL>/api/v1/telegram/webhook"}'
   ```
2. **Verify Bot webhook response:** Confirm that Telegram returns:
   ```json
   { "ok": true, "result": true, "description": "Webhook was set" }
   ```
3. **Register Bot Commands with BotFather:** Go to `@BotFather` on Telegram and use `/setcommands` to configure the following command matrix:
   ```
   start - Welcome greeting
   status - Overall system health
   opportunities - High-priority public opportunities
   approvals - Recent decision history
   payments - Payment deposits & escrow ledger
   workers - Autonomous workers active status
   learning - Learning metric feedback stats
   settings - View receiving wallet settings
   ```

---

## J. PAYMENT SETUP

USDT/USDC transaction confirmation parameters:
1. **Founder Address Configuration:** Configure public addresses via the settings route `POST /api/v1/payment-settings` or specify default `FOUNDER_USDT_POLYGON` and `FOUNDER_USDT_TRC20` environment parameters. *Note: Length validation limits addresses to 50 characters to prevent security leaks of private keys.*
2. **RPC Handshake Nodes:** Provide valid nodes on `POLYGON_RPC_URL` and `TRON_RPC_URL`.
3. **Finality Depth:** Polygon provider checks transaction depth using transaction receipts; TRON USDT verifies smart contracts utilizing the safe contract selector `a9059cbb`.

---

## K. POST-DEPLOYMENT VERIFICATION CHECKLIST

Ensure that each of the following components is validated and verified upon server launch:

- [ ] **Application starts:** Backend server logs `started successfully` with zero runtime crashes.
- [ ] **Database connection works:** Prisma database pool returns online and queries seed status cleanly.
- [ ] **Redis connection works:** Background task workers initialize queues without triggering ECONNREFUSED logs.
- [ ] **Prisma initializes:** Client engine queries standard models flawlessly.
- [ ] **API responds:** Fetching `GET /health` returns `{"status":"ok"}`.
- [ ] **Authentication works:** JWT verification successfully handles login cookies.
- [ ] **Telegram initializes:** Webhook successfully registers, returning 200 responses to testing requests.
- [ ] **Founder authorization works:** Messages sent to Webhook from non-founder IDs are rejected as unauthorized.
- [ ] **Mini App authentication works:** Cryptographic HMAC signature check parses correctly.
- [ ] **Payment providers initialize:** Polygon and TRON modules load on-chain logic.
- [ ] **Polygon verification works:** receipts are retrieved using `POLYGON_RPC_URL`.
- [ ] **TRON verification works:** Smart contract calls parse using `TRON_RPC_URL`.
- [ ] **Payment gate blocks unpaid execution:** Any tasks created for unpaid or unconfirmed contracts are blocked with standard Gate error.
- [ ] **Worker system initializes:** Worker controls register in registry list.
- [ ] **Queue system initializes:** Tasks flow dynamically on BullMQ channels.

---

## L. DEPLOYMENT BLOCKERS

Our scanning has identified the following potential blockers that must be addressed:
1. **Missing DATABASE_URL:** If the PostgreSQL URL environment variable is not defined, Zod schema validation will instantly crash the app.
2. **JWT_SECRET under 16 characters:** A short secret will crash the validator on startup.
3. **Missing REDIS_URL:** Without it, background task workers fall back to localhost, causing ECONNREFUSED logs on the cloud.
4. **Pre-build Prisma Client missing:** The typescript build script requires that the Prisma Client is generated before compiling the codebase. Running `tsc` without generating the client first will cause missing import compilation failures.

---

## M. FINAL PRODUCTION STATUS

All VERIDEX backend pipelines, multi-chain controllers, security middleware, and Telegram Bot routers are fully optimized, integrated, and ready to come online on Belmo.
