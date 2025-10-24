````markdown
# Implementation Plan: MVP Sentiment Dashboard

**Branch**: `001-mvp-sentiment-dashboard` | **Date**: 2025-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mvp-sentiment-dashboard/spec.md`

## Summary

Build a playful web application that visualizes Dutch healthcare insurance sentiment in real-time using Nuxt 4 with SSR capabilities, deployed on Netlify. The MVP delivers three core user stories: (1) viewing current national mood with emoji-based indicators, (2) exploring sentiment trends over 7+ days, and (3) understanding sentiment breakdown percentages. Data collection occurs hourly via scheduled functions, with sentiment analysis performed server-side and cached for optimal performance.

## Technical Context

**Language/Version**: TypeScript 5.9 + JavaScript (Nuxt 4.1.3 runtime)  
**Primary Dependencies**: Nuxt 4.1.3, Nuxt UI v4.1, Vue 3.5, Nitro 2.x (server engine)  
**Storage**: Netlify Blob Storage (sentiment data points + historical trends), or fallback to file-based JSON storage  
**Testing**: Vitest (unit tests), Playwright (E2E tests)  
**Target Platform**: Netlify Edge (CDN + serverless functions), Node.js 20 runtime  
**Project Type**: Web (SSR + API routes via Nuxt server)  
**Performance Goals**: <3s page load, <200ms API response (p95), hourly data collection, support 100-500 concurrent users  
**Constraints**: Netlify free tier limits (125k requests/month), 20 requests/hour per IP rate limit, <10MB function size  
**Scale/Scope**: MVP with 3 user stories, ~10 Vue components, ~5 API routes, 7+ days data retention

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**MVP-First Development**: ✅ Feature delivers three independent, testable user stories (view mood, see trends, understand breakdown)  
**Real-Time Data Accuracy**: ✅ Hourly data collection with timestamps, 24-hour freshness warning, traceable sources  
**Code Quality & Structure**: ✅ Nuxt 4 auto-imports, composables for separation of concerns, TypeScript strict mode  
**API-First Design**: ✅ All data via Nuxt server routes (`/api/*`), consumed by frontend and potentially external clients  
**Observability & Monitoring**: ✅ Nitro structured logging, scheduled function monitoring via Netlify dashboard

**Violations**: None. All constitution principles satisfied for MVP scope.

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-sentiment-dashboard/
├── plan.md              # This file (filled by analysis of existing setup)
├── research.md          # Phase 0: Technology decisions & API research
├── data-model.md        # Phase 1: Sentiment entities & storage schema
├── quickstart.md        # Phase 1: Local dev setup & deployment guide
├── contracts/           # Phase 1: OpenAPI specs for API routes
│   └── sentiment-api.yaml
├── tasks.md             # Phase 2: /speckit.tasks command output
└── checklists/
    ├── requirements.md  # Manual tracking of spec requirements
    └── ux.md           # Manual tracking of visual/UX requirements
```

### Source Code (repository root)

```text
# Nuxt 4 Web Application (existing setup verified)
app/
├── app.vue              # ✅ Root component (currently using NuxtWelcome)
├── components/          # Vue components (to be created)
│   ├── MoodIndicator.vue
│   ├── SentimentBreakdown.vue
│   └── TrendChart.vue
├── composables/         # Reusable composition functions (to be created)
│   ├── useSentiment.ts
│   └── useRateLimit.ts
├── pages/               # File-based routing (to be created)
│   └── index.vue        # Homepage with all three user stories
└── server/              # Nitro server routes (to be created)
    ├── api/
    │   ├── sentiment/
    │   │   ├── current.get.ts
    │   │   ├── trends.get.ts
    │   │   └── breakdown.get.ts
    │   └── health.get.ts
    ├── utils/           # Server-only utilities
    │   ├── sentiment.ts
    │   ├── storage.ts
    │   └── rateLimit.ts
    └── middleware/      # Server middleware
        └── rateLimit.ts

netlify/
└── functions/           # Scheduled & edge functions (to be created)
    └── collect-sentiment.ts  # Hourly cron job

public/
├── robots.txt           # ✅ Existing
└── favicon.ico          # To be added

tests/
├── unit/                # Vitest unit tests (to be created)
│   ├── components/
│   └── utils/
└── e2e/                 # Playwright E2E tests (to be created)
    └── homepage.spec.ts

# Configuration (existing, may need updates)
nuxt.config.ts           # ✅ Nuxt 4.1.3 + Nuxt UI configured
netlify.toml             # ✅ Build config for Netlify
package.json             # ✅ Dependencies defined
tsconfig.json            # ✅ TypeScript config
```

**Structure Decision**: Using **Nuxt 4 Web Application** pattern (verified from existing codebase). The app already has Nuxt 4.1.3 with Nuxt UI v4.1 configured, deployed on Netlify with Node 20 runtime. The server directory will host API routes via Nitro, and scheduled functions will use Netlify's cron capabilities.

## Complexity Tracking

## Complexity Tracking

> **No complexity violations** – MVP follows standard Nuxt 4 patterns with minimal architectural overhead. No justification required.

---

## Phase Completion Summary

### Phase 0: Outline & Research ✅ COMPLETE

**Status**: All technical unknowns resolved  
**Artifact**: [research.md](./research.md)

**Key Decisions**:

- Data sources: Reddit API + NU.nl RSS feed for Dutch healthcare content
- Sentiment analysis: Google Cloud Natural Language API with Dutch support
- Storage: Netlify Blob Storage (free tier, 100GB + 1TB bandwidth)
- Rate limiting: IP-based with Nitro middleware (20 req/hour)
- Scheduling: Netlify Scheduled Functions (hourly cron)
- Charting: Chart.js via vue-chartjs for trends visualization
- Testing: Vitest (unit) + Playwright (E2E)

**No Blocking Dependencies**: All technologies have free tiers and are compatible with Nuxt 4 + Netlify.

### Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Data models, API contracts, and quickstart documentation complete  
**Artifacts**:

- [data-model.md](./data-model.md) - Core entities with TypeScript interfaces
- [contracts/sentiment-api.yaml](./contracts/sentiment-api.yaml) - OpenAPI 3.0 specification
- [quickstart.md](./quickstart.md) - Developer setup guide
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md) - Updated agent context

**Core Entities Defined**:

1. `SentimentDataPoint` - Hourly sentiment measurements with breakdown
2. `MoodSummary` - Human-readable Dutch summaries with emoji
3. `TrendPeriod` - 7-day historical aggregation
4. `DataSource` - RSS feed configuration

**API Endpoints Designed**:

- `GET /api/sentiment` - Current mood + trends + breakdown (all-in-one)
- `GET /api/sentiment/history` - Historical data with date filtering
- `GET /api/health` - System health check

**Constitution Re-Check**: ✅ All principles satisfied post-design

### Phase 2: Implementation Planning (Next Step)

**Action Required**: Run `/speckit.tasks` command to generate `tasks.md` with:

- Atomic implementation tasks for P1, P2, P3 user stories
- Test coverage requirements
- Deployment checklist

**Ready for Development**: All design artifacts are complete. Implementation can begin immediately after task breakdown.

---

## Implementation Readiness Checklist

- ✅ Existing Nuxt 4.1.3 app verified and running on Netlify
- ✅ Technical unknowns resolved (Phase 0)
- ✅ Data models defined with validation rules (Phase 1)
- ✅ API contracts specified in OpenAPI format (Phase 1)
- ✅ Developer quickstart guide created (Phase 1)
- ✅ Agent context updated with tech stack (Phase 1)
- ⏳ Task breakdown pending (Phase 2 - use `/speckit.tasks` command)

**Next Command**: `Follow instructions in speckit.tasks.prompt.md` to generate atomic implementation tasks.

---

## Branch Information

- **Feature Branch**: `001-mvp-sentiment-dashboard` (current)
- **Base Branch**: `main` (assumed)
- **Plan Location**: `c:\git\github\zorg-sentiment-v2\specs\001-mvp-sentiment-dashboard\plan.md`
- **Spec Location**: `c:\git\github\zorg-sentiment-v2\specs\001-mvp-sentiment-dashboard\spec.md`
````

`````
````
`````
