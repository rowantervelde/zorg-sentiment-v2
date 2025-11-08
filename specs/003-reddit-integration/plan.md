# Implementation Plan: Reddit Integration for Sentiment Analysis

**Branch**: `003-reddit-integration` | **Date**: 2025-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-reddit-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate Reddit as a social media sentiment source by implementing RedditAdapter using snoowrap library. System will collect posts from 4 Dutch healthcare subreddits (r/zorgverzekering, r/DutchPersonalFinance, r/thenetherlands, r/geldzaken) using OAuth2 client credentials, normalize posts to Article format, apply keyword-based Dutch filtering, and integrate with existing multi-source orchestrator. Reddit contributes 10-30% of total articles, provides community perspective alongside RSS news feeds.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9, Node.js 20.x (Nuxt 4.1.3 runtime)  
**Primary Dependencies**: snoowrap@^1.23.0 (Reddit API wrapper), extends Feature 002 multi-source orchestrator  
**Storage**: Netlify Blobs (existing, 7-day retention, sentiment data + source metrics)  
**Testing**: Existing test framework (matches Feature 002 patterns)  
**Target Platform**: Netlify Functions (serverless), hourly cron trigger
**Project Type**: web (Full-stack Nuxt 4.1.3 + Vue 3.5 + Nitro server)  
**Performance Goals**: 30s per subreddit collection, <2min total (4 subreddits parallel)  
**Constraints**: 60 req/min Reddit API rate limit, 10s timeout per source, OAuth2 client credentials  
**Scale/Scope**: 4 subreddits, 20 posts/subreddit, 10-30% of total articles

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**MVP-First Development**: ✅ P1 story delivers independent value (Reddit collection), P2/P3 add incremental value  
**Real-Time Data Accuracy**: ✅ Reddit posts include timestamps, source attribution via subreddit, engagement metrics tracked  
**Code Quality & Structure**: ✅ RedditAdapter implements existing interface, single responsibility, snoowrap handles OAuth complexity  
**API-First Design**: ✅ Extends existing /api/sentiment/sources endpoint, no UI-only logic  
**Observability & Monitoring**: ✅ Source contribution metrics, rate limit tracking, fetch status per subreddit logged

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
server/
├── api/
│   └── sentiment/
│       └── sources.get.ts        # Extended to expose Reddit source metrics
├── types/
│   ├── article.ts                # Already has engagementMetrics (reuse)
│   ├── source.ts                 # SOCIAL_REDDIT enum value (add)
│   └── sourceConfiguration.ts    # RedditConfig interface (extend)
├── utils/
│   ├── redditAdapter.ts          # IMPLEMENTATION TARGET (currently stub)
│   ├── sourceOrchestrator.ts     # Already integrates adapters (reuse)
│   └── deduplicator.ts           # Already handles cross-source dedup (reuse)
└── config/
    └── sources.json              # Add Reddit source configurations

netlify/
└── functions/
    └── collect-sentiment.mts     # Triggers orchestrator (no changes needed)

# No frontend changes needed (uses existing sentiment dashboard)
```

**Structure Decision**: Single full-stack project (Nuxt 4.1.3). Reddit integration extends existing server utilities (Feature 002 multi-source architecture). Primary implementation file is `server/utils/redditAdapter.ts` (currently stub with "Not implemented" errors). No new API endpoints required; existing `/api/sentiment/sources` endpoint automatically exposes Reddit metrics via orchestrator.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations**: All principles satisfied. Reddit integration extends existing architecture without introducing new patterns or complexity.
