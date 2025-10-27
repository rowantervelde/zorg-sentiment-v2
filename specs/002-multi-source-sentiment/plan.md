# Implementation Plan: Multi-Source Sentiment Data Collection

**Branch**: `002-multi-source-sentiment` | **Date**: 2025-10-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-multi-source-sentiment/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Expand sentiment data collection from a single RSS feed (NU.nl) to 5 diverse Dutch healthcare sources (NU.nl, NOS, RTL Nieuws, Zorgkrant, Skipr). Implement multi-source orchestration with graceful degradation, article deduplication (80% similarity threshold), configurable source management, and an API endpoint for source contribution metrics. Architecture designed to support future social media sources without refactoring core sentiment analysis.

## Technical Context

**Language/Version**: TypeScript 5.9 + JavaScript (Nuxt 4.1.3 runtime)  
**Primary Dependencies**: Nuxt 4.1.3, Nuxt UI v4.1, Vue 3.5, Nitro 2.x (server engine), @netlify/blobs 10.2.1, sentiment 5.0.2  
**Storage**: Netlify Blob Storage (sentiment data points + historical trends + source metrics), with file-based JSON fallback  
**Testing**: Nuxt built-in test utilities, manual testing for RSS feed integration  
**Target Platform**: Netlify Edge Functions (serverless), Static site generation (SSG) for frontend  
**Project Type**: Web application (Nuxt full-stack with server API routes and frontend components)  
**Performance Goals**: 10-second timeout per RSS feed fetch, hourly collection cycle completion <2 minutes, API responses <500ms  
**Constraints**: 100-500 concurrent users, Netlify function execution limits (10s max per invocation), Blob storage read/write limits  
**Scale/Scope**: 5 RSS sources initially, ~100-150 articles per hour across all sources, 7-day retention (10k+ data points)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**MVP-First Development**: ✅ Feature delivers independent user value (improved sentiment accuracy through source diversity)  
**Real-Time Data Accuracy**: ✅ All sources timestamped, 10s timeout enforced, source tracking maintained  
**Code Quality & Structure**: ✅ Source adapters abstracted, single responsibility modules (fetcher, deduplicator, config validator)  
**API-First Design**: ✅ Source contribution metrics exposed via `/api/sentiment/sources` endpoint  
**Observability & Monitoring**: ✅ Structured logging for each source fetch, reliability metrics tracked (success rate, avgResponseTimeMs, failures)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (Nuxt 4 full-stack)

server/
├── api/
│   ├── sentiment/
│   │   ├── sources.get.ts         # NEW: Source contribution metrics endpoint
│   │   └── history.get.ts         # Existing, may need source filtering
│   └── sentiment.get.ts           # Existing, may need source metadata
├── utils/
│   ├── rssFetcher.ts              # MODIFY: Extract to support multiple sources
│   ├── sourceAdapter.ts           # NEW: Abstract source interface
│   ├── sourceOrchestrator.ts      # NEW: Multi-source collection coordinator
│   ├── deduplicator.ts            # NEW: 80% similarity article deduplication
│   ├── sourceConfig.ts            # NEW: Configuration loader and validator
│   ├── sentimentAnalyzer.ts       # Existing, no changes expected
│   ├── storage.ts                 # MODIFY: Store source contribution data
│   └── moodSummary.ts             # Existing, no changes expected
└── middleware/
    └── (existing CORS, rate limit)

netlify/
└── functions/
    └── collect-sentiment.mts      # MODIFY: Use source orchestrator instead of single RSS fetch

app/
├── types/
│   ├── api.ts                     # MODIFY: Add source contribution types
│   └── sentiment.ts               # MODIFY: Add source diversity metrics
├── composables/
│   └── useSources.ts              # NEW: Composable for source contribution data
└── (existing components, pages)

specs/002-multi-source-sentiment/
├── contracts/
│   └── sources-api.yaml           # NEW: OpenAPI spec for sources endpoint
└── (this plan, research, data-model, etc.)
```

**Structure Decision**: Using existing Nuxt 4 web application structure. Server-side changes focused on `server/utils/` for new source management logic and `server/api/sentiment/` for new endpoints. Netlify function modified to orchestrate multiple sources. Frontend gains optional composable for future source attribution UI.

## Complexity Tracking

> **No violations - Constitution gates passed**

All principles satisfied:

- MVP-First: Incremental value delivery through phased rollout (P1: multi-source, P2: metrics API, P3: configuration)
- Real-Time Data: Source timestamps and 10s timeout maintain data freshness guarantees
- Code Quality: Single-responsibility modules (orchestrator, deduplicator, config) with clear interfaces
- API-First: Source metrics exposed via dedicated endpoint before any UI implementation
- Observability: Structured logging per source, reliability metrics enable troubleshooting

---

## Phase Completion Summary

### ✅ Phase 0: Research (Complete)

**Deliverables**:

- `research.md` with 5 key technical decisions documented
  - String similarity algorithm: Levenshtein distance (wink-nlp-utils) with 80% threshold
  - Configuration storage: JSON file with env var overrides
  - Orchestration pattern: Promise.allSettled for parallel fetching
  - Data model: Extended SentimentDataPoint with embedded contributions
  - Reliability tracking: Rolling 7-day window metrics in Blob storage

**All NEEDS CLARIFICATION resolved**: No unknowns remaining

---

### ✅ Phase 1: Design & Contracts (Complete)

**Deliverables**:

- `data-model.md` - 5 entities with validation rules and relationships
  - SourceConfiguration (config file)
  - Article (transient, in-memory)
  - SourceContribution (embedded in data point)
  - SentimentDataPoint (extended with source metrics)
  - SourceReliabilityMetrics (blob storage)
- `contracts/sources-api.yaml` - OpenAPI 3.0 spec for GET /api/sentiment/sources
  - Full request/response schemas
  - Example responses for multiple scenarios
  - Error handling documented
- `quickstart.md` - 20-minute setup guide

  - Configuration file creation
  - Core utilities implementation stubs
  - API endpoint scaffold
  - Verification checklist

- `.github/copilot-instructions.md` - Updated with new technologies
  - Added TypeScript 5.9 context
  - Added Netlify Blob Storage patterns
  - Added multi-source data flow

**Constitution Re-check**: ✅ All gates still passed post-design

---

## Next Step

**Command**: `/speckit.tasks`

The plan is complete with all technical research and design artifacts. Ready to decompose into implementation tasks.
