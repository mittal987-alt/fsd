# OneAtlas — AI Model Discovery & Intelligence Platform

A production-ready backend-focused MVP of OneAtlas, an AI model discovery and intelligence platform. Built for the **Backend Engineer** role.

---

## 🏗 Architecture

```
Next.js 16 (App Router) + TypeScript
  ├── REST API  — /src/app/api/v1/   (Next.js Route Handlers)
  ├── Database  — PostgreSQL + Prisma ORM
  ├── Validation— Zod schemas with structured error responses
  ├── Data Layer— Dual-mode: PostgreSQL (live) or in-memory repository (fallback)
  └── UI        — Server-side rendered pages
```

### Database Schema

| Table | Description |
|-------|-------------|
| `companies` | AI labs and research organizations |
| `providers` | Inference API providers (OpenRouter, Groq, Together, etc.) |
| `models` | AI foundation models with full specs and pricing |
| `model_provider_offerings` | Per-provider pricing, latency, and throughput data |
| `benchmarks` | Benchmark definitions (MMLU, SWE-bench, HumanEval, etc.) |
| `model_benchmark_scores` | Individual model scores on each benchmark |
| `ingestion_logs` | Audit trail for data sync operations |

---

## 🚀 API Reference

All endpoints return a consistent `ApiResponse<T>` envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 14, "page": 1, "limit": 20, "totalPages": 1 },
  "timestamp": "2025-01-22T10:00:00.000Z",
  "executionTimeMs": 12
}
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/models` | List & search models with filtering/sorting/pagination |
| `GET` | `/api/v1/models/:slug` | Get single model with full details |
| `GET` | `/api/v1/models/compare?models=a,b,c` | Side-by-side model comparison |
| `GET` | `/api/v1/rankings?category=overall` | Ranked leaderboard (overall/reasoning/coding/value) |
| `GET` | `/api/v1/benchmarks` | All benchmarks with top scorers |
| `GET` | `/api/v1/companies` | AI labs and research organizations |
| `GET` | `/api/v1/companies/:slug` | Single company with their models |
| `GET` | `/api/v1/providers` | Inference providers |
| `GET` | `/api/v1/providers/:slug` | Single provider with offerings |
| `POST` | `/api/v1/calculate-cost` | Monthly cost calculator |
| `POST` | `/api/v1/sync` | Trigger data ingestion from OpenRouter |
| `GET` | `/api/v1/stats` | Platform statistics |
| `GET` | `/api/health` | Health check with DB status |

### Query Parameters — `GET /api/v1/models`

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search (name, description, company) |
| `company` | string | Filter by company slug (e.g. `anthropic`) |
| `provider` | string | Filter by provider slug (e.g. `groq`) |
| `type` | string | Model type (`Chat/Completion`, `Reasoning`, `Multimodal`, `Code`) |
| `modality` | string | Supported modality (`text`, `image`, `audio`, `video`) |
| `capability` | string | Required capability (`function-calling`, `vision`, `reasoning`) |
| `minPrice` / `maxPrice` | number | Input price range (USD per 1M tokens) |
| `minContext` | number | Minimum context window (tokens) |
| `featured` | boolean | Only featured models |
| `sort` | enum | `score_desc`, `price_asc`, `price_desc`, `context_desc`, `release_desc`, `name_asc` |
| `page` / `limit` | number | Pagination (max 100 per page) |

### Cost Calculator — `POST /api/v1/calculate-cost`

```json
{
  "modelSlug": "claude-3-5-sonnet",
  "promptTokens": 1000,
  "completionTokens": 500,
  "requestsPerMonth": 10000,
  "providerSlug": "openrouter"
}
```

---

## 🛠 Setup

### Prerequisites
- Node.js 20+
- pnpm 8+
- PostgreSQL 14+ (optional — app falls back to in-memory data if `DATABASE_URL` is not set)

### Installation

```bash
git clone https://github.com/yourrepo/oneatlas
cd oneatlas
pnpm install
pnpm approve-builds --all
```

### Environment

```bash
cp .env.example .env.local
# Edit .env.local and set DATABASE_URL
```

### Database Setup (optional)

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to your database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

### Development

```bash
pnpm dev        # Turbopack dev server at http://localhost:3000
```

### Production Build

```bash
pnpm build      # Webpack build
pnpm start      # Production server
```

---

## 🌐 UI Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured models and stats |
| `/models` | Searchable, filterable model catalogue |
| `/models/:slug` | Model detail with specs, providers, benchmarks |
| `/compare` | Side-by-side model comparison |
| `/rankings` | Leaderboards (overall, reasoning, coding, value) |
| `/benchmarks` | Benchmark definitions with top scorers |
| `/companies` | AI labs directory |
| `/companies/:slug` | Company detail with their models |
| `/providers` | Inference provider directory |
| `/providers/:slug` | Provider detail with hosted models |

---

## 📐 Key Design Decisions

### Dual-Mode Data Layer
The `DataStore` class transparently falls back to a rich in-memory repository when no `DATABASE_URL` is configured. This enables zero-config local development and demo deployments while supporting full Prisma/PostgreSQL in production.

### Data Normalization
`ModelDataNormalizer` handles:
- Price normalization (per-token scientific notation → per-1M USD)
- Modality/capability tag canonicalization
- Benchmark score normalization to a 0–100 comparable scale
- Monthly cost calculation

### Structured API Responses
Every endpoint returns `ApiResponse<T>` with `success`, `data`, `meta` (pagination + facets), `error`, `timestamp`, and `executionTimeMs` headers. Zod validation errors return 422 with structured field-level details.

### Ingestion Pipeline
`IngestionService` fetches from the OpenRouter public `/v1/models` API, normalizes pricing (per-token → per-1M tokens), maps modalities and capabilities, and upserts into PostgreSQL with an audit `ingestion_logs` record.

---

## 🚢 Deployment

### Vercel (recommended)

```bash
vercel --prod
```

Set `DATABASE_URL` in Vercel environment variables. The app works without a database using the built-in in-memory repository.

### Railway / Render

Provision a PostgreSQL database, set `DATABASE_URL`, then run:

```bash
pnpm db:push
pnpm db:seed
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL + Prisma ORM 6
- **Validation**: Zod 3
- **Styling**: Tailwind CSS 4
- **Runtime**: Node.js 24
