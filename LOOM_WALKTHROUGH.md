# OneAtlas — Loom Video Walkthrough Script (5–10 Minutes)
### Role: Backend Engineer
**Candidate:** Aayush Mittal  
**Submission Form:** https://forms.gle/oDQ6ucjpiFaZtCGL9  
**GitHub Repository:** https://github.com/mittal987-alt/fsd.git  

---

## ⏱️ Video Timeline & Speaking Script

### 1. Introduction (0:00 - 1:00)
- **What to show on screen:** Open Atlas homepage (`/`) or GitHub repository `README.md`.
- **Script:**
  > "Hello everyone. Today I am presenting my submission for the AI Software Engineer Internship demo task, building **OneAtlas.dev** — an AI model discovery and intelligence platform inspired by OpenRouter, RouterPlus, and LiteLLM.
  >
  > For this assignment, I chose **Role 2: Backend Engineer**, focusing on API architecture, relational database design with PostgreSQL and Prisma ORM, data normalization and ingestion pipelines, validation with Zod, and building high-performance, resilient REST endpoints."

---

### 2. System Architecture & Tech Stack (1:00 - 2:30)
- **What to show on screen:** Architecture diagram or project directory (`prisma/schema.prisma`, `src/lib/`, `src/app/api/v1/`).
- **Script:**
  > "Let's review the architectural foundation:
  > - **Backend Runtime:** Node.js with TypeScript and Next.js 16 Route Handlers for high-throughput, edge-compatible API endpoints.
  > - **Database Layer:** PostgreSQL managed with **Prisma ORM**.
  > - **Resilient Data Store Pattern:** I implemented a **Dual-Mode Repository Pattern** in `src/lib/data-store.ts`. When `DATABASE_URL` is set, queries execute against live PostgreSQL with relations and foreign keys. If the database is cold or unconfigured in preview/CI, it seamlessly falls back to an in-memory repository with zero crashes.
  > - **Strict Validation:** Every endpoint validates query params and request payloads with **Zod** (`src/lib/validations/api-schemas.ts`), returning RFC-compliant 422 error structures on invalid inputs.
  > - **Standardized Response Envelope:** All endpoints return a unified `ApiResponse<T>` structure with `success`, `data`, `meta` (pagination, facets), `timestamp`, and `executionTimeMs` timing headers."

---

### 3. Database Schema & Relational Design (2:30 - 4:00)
- **What to show on screen:** `prisma/schema.prisma`.
- **Script:**
  > "Examining the Prisma schema:
  > - `Company` / `Lab`: Models AI research organizations (Anthropic, OpenAI, Google DeepMind, Meta, DeepSeek, Mistral, xAI).
  > - `Provider`: Models inference host providers (OpenRouter, Groq, Together AI, Fireworks, AWS Bedrock, Azure AI).
  > - `Model`: Foundation model entity containing context length, parameter count, architecture, licenses, base pricing, and tags.
  > - `ModelProviderOffering`: Join table modeling the many-to-many relationship between Models and Providers. It stores **provider-specific pricing** (input/output/cache read), **real latency (p50/p99)**, **throughput (tokens/sec)**, and uptime.
  > - `Benchmark` & `ModelBenchmarkScore`: Normalizes industry evaluations (MMLU, GSM8K, HumanEval, SWE-bench, Chatbot Arena Elo, GPQA Diamond, MATH-500) into 0-100 normalized scales for radar and composite ranking.
  > - `IngestionLog`: Audits automated data syncs from external APIs."

---

### 4. Data Ingestion & Normalization Engine (4:00 - 5:30)
- **What to show on screen:** `src/lib/ingestion/normalizer.ts` and `src/lib/ingestion/sync.ts`.
- **Script:**
  > "Heterogeneous AI APIs report prices in wildly different units (e.g. OpenRouter returns token prices in scientific strings like `'0.000003'`).
  >
  > In `ModelDataNormalizer`:
  > - **Price Normalization:** Converts scientific per-token values into clean USD per 1M tokens ($3.00/1M).
  > - **Modality & Capability Parsing:** Standardizes inconsistent tags into canonical sets (`function-calling`, `vision`, `reasoning`, `json`, `coding`).
  > - **Benchmark Normalization:** Converts unbounded scales like LMSYS Arena Elo (1000–1450) and percentages into normalized 0–100 scores.
  > - **Ingestion Pipeline:** `POST /api/v1/sync` connects to OpenRouter's live API to fetch and normalize models into the database with audit logging."

---

### 5. API Demonstration & Features (5:30 - 7:30)
- **What to show on screen:** Test endpoints in browser or Postman/curl:
  - `GET /api/v1/models?q=claude&sort=price_asc`
  - `GET /api/v1/models/compare?models=claude-3-5-sonnet,deepseek-r1,o1`
  - `POST /api/v1/calculate-cost`
  - `GET /api/v1/rankings?category=reasoning`
  - `GET /api/health`
- **Script:**
  > "Let's demonstrate key endpoints:
  > 1. `GET /api/v1/models`: Supports multi-field full-text search, filtering by company, modality, context size, and price range, with multi-facet counters and pagination.
  > 2. `GET /api/v1/models/compare`: Side-by-side comparison engine that calculates cost differential ratios (e.g. Claude is 5.5x the price of DeepSeek R1), context deltas, and comparative benchmark matrices.
  > 3. `POST /api/v1/calculate-cost`: Given input tokens, output tokens, and monthly request volume, calculates exact monthly operational spend across models and providers.
  > 4. `GET /api/v1/rankings`: Returns dynamic leaderboards across Overall, Reasoning, Coding, and Value-for-Money categories.
  > 5. `GET /api/health`: Provides system telemetry and database connection status."

---

### 6. Technical Challenges & Trade-offs (7:30 - 9:00)
- **What to show on screen:** Web UI pages (`/models`, `/compare`, `/rankings`).
- **Script:**
  > "A key engineering challenge was balancing **Next.js 16 bundler changes** and ensuring robust fallback mechanics. Next.js 16 introduces new prerender and cache component conventions; I configured route segment exports and Webpack build compatibility to guarantee zero build failures.
  >
  > Another design trade-off was adopting the repository abstraction layer. Instead of coupling API handlers directly to raw Prisma queries, the `DataStore` repository enables offline testability, zero-friction CI testing, and instant deployment previews on Vercel while running Prisma migrations cleanly against any PostgreSQL instance."

---

### 7. Conclusion & Next Steps (9:00 - 10:00)
- **Script:**
  > "In summary:
  > - Full REST API covering Discovery, Detail, Comparison, Benchmarks, Providers, and Ingestion.
  > - PostgreSQL schema with Prisma ORM and seeder script.
  > - Strict validation with Zod and normalized pricing engine.
  > - Working production build and live web dashboard.
  >
  > The code is pushed to GitHub at `github.com/mittal987-alt/fsd`. Thank you for your time, and I look forward to your feedback!"
