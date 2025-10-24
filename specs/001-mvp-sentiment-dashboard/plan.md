# Implementation Plan: MVP Sentiment Dashboard

**Branch**: `001-mvp-sentiment-dashboard` | **Date**: 2025-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mvp-sentiment-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a playful, minimal MVP web application that visualizes Dutch healthcare insurance sentiment in real-time. The application will collect sentiment data hourly from RSS feeds (starting with a single source), analyze it using sentiment classification (≥60% threshold), and display the results through an interactive dashboard showing current mood, 7-day trends, and sentiment breakdown. The system targets 100-500 concurrent users with static site generation for performance and Netlify Functions for serverless data processing.

## Technical Context

**Language/Version**: TypeScript 5.x with JavaScript (Nuxt 3 runtime)  
**Primary Dependencies**: Nuxt 3 (latest), Nuxt UI v3, Vue 3, Nitro (server engine), @netlify/blobs (persistent storage)  
**Storage**: Netlify Blobs (key-value store) for persistent JSON data with 7-day retention, migrateable to database post-MVP  
**Testing**: Vitest for unit tests, Playwright for E2E tests  
**Target Platform**: Static site with Netlify Functions (serverless), deployed on Netlify  
**Project Type**: Web application (Nuxt 3 SSG with serverless functions)  
**Performance Goals**: <3s page load, <90min between data collection cycles, handles 100-500 concurrent users  
**Constraints**: 20 requests/hour per IP rate limiting, 24-hour data staleness warning threshold, Dutch language only  
**Scale/Scope**: Single source RSS feed initially, hourly data collection, 7-day historical data, 3 main visualizations (mood indicator, trends chart, breakdown)

**Deployment Strategy**:

- Static site generation (`nuxt generate`) for frontend
- Netlify Functions for serverless backend (data collection, sentiment analysis)
- Incremental deployment: test after each feature addition before proceeding
- Start with single RSS feed, add more sources post-MVP validation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**MVP-First Development**: ✅ Feature delivers independent user value - P1 (current mood) can be deployed alone, P2 (trends) and P3 (breakdown) add incrementally  
**Real-Time Data Accuracy**: ✅ Data sources are traceable with timestamps - RSS feeds with collection timestamps, 24-hour staleness warnings, hourly collection schedule  
**Code Quality & Structure**: ✅ Clean architecture with single responsibilities - Separate concerns: data collection (Netlify Functions), sentiment analysis (service layer), visualization (Vue components)  
**API-First Design**: ✅ All functionality accessible via documented APIs - Netlify Functions expose `/api/sentiment` endpoints for frontend consumption, same APIs available for future integrations  
**Observability & Monitoring**: ✅ Structured logging and metrics planned - Collection timestamps, error logging for failed fetches, data staleness indicators visible to users

**Gate Status**: ✅ PASSED - All constitutional principles satisfied for MVP scope

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-sentiment-dashboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (sentiment analysis, RSS parsing, deployment)
├── data-model.md        # Phase 1 output (SentimentDataPoint, MoodSummary entities)
├── quickstart.md        # Phase 1 output (local dev setup, deployment guide)
├── contracts/           # Phase 1 output (API contracts for Netlify Functions)
│   └── sentiment-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (Nuxt 3 SSG + Netlify Functions)
nuxt.config.ts           # Nuxt configuration (SSG, Netlify preset)
package.json             # Dependencies and scripts
netlify.toml             # Netlify deployment configuration

pages/                   # Nuxt pages (SSG routes)
├── index.vue            # Main dashboard page

components/              # Vue components
├── MoodIndicator.vue    # Current sentiment visualization (P1)
├── TrendsChart.vue      # 7-day trend visualization (P2)
├── SentimentBreakdown.vue  # Percentage breakdown (P3)
└── DataTimestamp.vue    # Last updated + staleness warning

composables/             # Vue composables
├── useSentiment.ts      # Sentiment data fetching logic
└── useRateLimit.ts      # Client-side rate limit handling

netlify/functions/       # Netlify serverless functions
├── collect-sentiment.ts # Scheduled hourly data collection
├── analyze-sentiment.ts # Sentiment analysis processing
└── get-sentiment.ts     # API endpoint for frontend

server/                  # Nitro server routes (API layer)
├── api/
│   └── sentiment.get.ts # GET /api/sentiment endpoint

services/                # Business logic
├── rss-fetcher.ts       # RSS feed parsing
├── sentiment-analyzer.ts # Sentiment classification (≥60% threshold)
└── data-store.ts        # Netlify Blobs storage operations (persistent key-value store)

types/                   # TypeScript definitions
├── sentiment.ts         # SentimentDataPoint, MoodSummary interfaces
└── api.ts               # API request/response types

tests/
├── unit/
│   ├── sentiment-analyzer.spec.ts
│   └── rss-fetcher.spec.ts
└── e2e/
    └── dashboard.spec.ts
```

**Structure Decision**: Chosen **Web application** structure with Nuxt 3 SSG frontend and Netlify Functions backend. This architecture supports:

- Static site generation for fast page loads (<3s goal)
- Serverless functions for data collection without maintaining servers
- Clear separation between frontend (Vue/Nuxt) and backend (Netlify Functions)
- Incremental deployment and testing per feature
- Simple JSON storage for MVP, easily upgradable to database later

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. MVP architecture maintains constitutional compliance with:

- Single responsibility principle (separate frontend, functions, services)
- Minimal dependencies (Nuxt 3 ecosystem + standard libraries)
- Clean API boundaries (Netlify Functions as API layer)
- Observable system behavior (timestamps, logging, user-visible staleness warnings)
