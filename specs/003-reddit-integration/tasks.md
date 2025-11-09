# Tasks: Reddit Integration for Sentiment Analysis

**Input**: Design documents from `/specs/003-reddit-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in specification - focusing on implementation tasks

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single full-stack project**: `server/`, `netlify/`, `app/` at repository root (Nuxt 4.1.3)
- All paths are relative to repository root: `C:\git\github\zorg-sentiment-v2`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create configuration files needed for Reddit integration

- [x] T001 Install snoowrap package via npm: `npm install snoowrap@^1.23.0`
- [x] T002 Create Reddit keyword configuration file in `server/config/reddit-keywords.json`
- [x] T003 Add Reddit environment variables to `.env.example` (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and enum extensions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add `SOCIAL_REDDIT` enum value to `SourceType` in `server/types/source.ts`
- [x] T005 Create `RedditSourceConfig` interface in `server/types/sourceConfiguration.ts`
- [x] T006 Add `EngagementStats` interface to `server/api/sentiment/sources.get.ts` (type definitions only)

**Checkpoint**: Type system ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Collect Sentiment from Dutch Healthcare Reddit Communities (Priority: P1) 🎯 MVP

**Goal**: System automatically collects posts and comments from 3 Dutch Reddit communities, normalizes them to Article format, and integrates with existing sentiment analysis

**Independent Test**: Trigger data collection manually, verify Reddit posts appear in `/api/sentiment/sources` and are included in sentiment calculations alongside RSS articles

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement snoowrap client initialization in `server/utils/redditAdapter.ts` (OAuth2 client credentials)
- [x] T008 [P] [US1] Implement `validateConfig()` method in `server/utils/redditAdapter.ts`
- [x] T009 [US1] Implement keyword filtering function in `server/utils/redditAdapter.ts` (uses reddit-keywords.json)
- [x] T010 [US1] Implement quality filtering function in `server/utils/redditAdapter.ts` (score >= 5 OR comments >= 3)
- [x] T011 [US1] Implement comment fetching logic in `server/utils/redditAdapter.ts` (top 5 comments by score, min 50 chars)
- [x] T012 [US1] Implement content normalization for text posts in `server/utils/redditAdapter.ts` (selftext + comments)
- [x] T013 [US1] Implement content normalization for link posts in `server/utils/redditAdapter.ts` (title + comments)
- [x] T014 [US1] Implement Reddit post to Article mapping in `server/utils/redditAdapter.ts` (title, content, author, link, pubDate, sourceId, engagementMetrics)
- [x] T015 [US1] Implement main `fetchArticles()` method in `server/utils/redditAdapter.ts` (orchestrates fetching, filtering, normalization)
- [x] T016 [US1] Implement error handling with exponential backoff in `server/utils/redditAdapter.ts` (1s-2s-4s for 500/503, permanent fail for 403/404)
- [x] T017 [US1] Implement `getAdapterState()` method in `server/utils/redditAdapter.ts` (tracks lastFetchTime, errorCount, isHealthy)
- [x] T018 [US1] Add 3 Reddit source configurations to `server/config/sources.json` (r/DutchPersonalFinance, r/thenetherlands, r/geldzaken)
- [x] T019 [US1] Update sourceOrchestrator to handle RedditAdapter errors gracefully in `server/utils/sourceOrchestrator.ts` (if needed - verify existing error handling)

**Checkpoint**: At this point, Reddit posts should be collected hourly and appear in sentiment calculations

---

## Phase 4: User Story 2 - Track Reddit Source Quality and Contribution (Priority: P2)

**Goal**: Administrators can view Reddit source contribution metrics including post counts, engagement statistics (upvotes, comments), and source health status via API

**Independent Test**: Query `/api/sentiment/sources` endpoint and verify Reddit sources show `articleCount`, `percentage`, `engagementStats` (avgUpvotes, avgComments, avgUpvoteRatio)

### Implementation for User Story 2

- [x] T020 [US2] Implement `calculateEngagementStats()` helper function in `server/api/sentiment/sources.get.ts`
- [x] T021 [US2] Extend `GET /api/sentiment/sources` handler to calculate and include `engagementStats` for Reddit sources in `server/api/sentiment/sources.get.ts`
- [x] T022 [US2] Add rate limit status tracking to AdapterState in `server/utils/redditAdapter.ts` (rateLimitRemaining, rateLimitResetTime)
- [x] T023 [US2] Update `getAdapterState()` to include rate limit info from snoowrap in `server/utils/redditAdapter.ts`
- [x] T024 [US2] Update source contribution logic to expose rate limit status in API response in `server/api/sentiment/sources.get.ts`

**Checkpoint**: At this point, `/api/sentiment/sources` should show detailed Reddit metrics and rate limit status

---

## Phase 5: User Story 3 - Filter Reddit Content by Relevance and Quality (Priority: P3)

**Goal**: System applies configurable filters for keyword matching, minimum score thresholds, and quality indicators to focus on substantive discussions

**Independent Test**: Configure different filter thresholds in `sources.json` (e.g., minScore: 10, minComments: 5) and verify only qualifying posts are collected

### Implementation for User Story 3

- [x] T025 [P] [US3] Implement weighted keyword scoring in `server/utils/redditAdapter.ts` (primary keywords required, secondary keywords add bonus points)
- [x] T026 [US3] Add configurable filter parameters to RedditSourceConfig in `server/types/sourceConfiguration.ts` (minUpvoteRatio, maxContentLength)
- [x] T027 [US3] Implement upvote ratio filtering in `server/utils/redditAdapter.ts` (exclude posts with ratio < 0.4)
- [x] T028 [US3] Implement content length truncation in `server/utils/redditAdapter.ts` (2000 character limit, consistent with RSS)
- [x] T029 [US3] Add Dutch language detection via keyword presence in `server/utils/redditAdapter.ts` (filter non-Dutch posts)
- [x] T030 [US3] Update filter logging to track rejection reasons in `server/utils/redditAdapter.ts` (for DQ-001 validation)

**Checkpoint**: All filtering criteria are configurable and logged, enabling data quality optimization

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and production readiness

- [x] T031 [P] Update `README.md` with Reddit integration feature description
- [x] T032 [P] Create `docs/reddit-integration.md` documenting Reddit source configuration and keywords
- [x] T033 Add Reddit API credentials to Netlify environment variables (via Netlify dashboard) - **MANUAL TASK**
- [x] T034 Validate quickstart.md setup instructions (15-minute test: Reddit app registration → local dev → first collection) - **TESTING TASK**
- [x] T035 [P] Add structured logging for Reddit collection metrics (posts fetched, filtered, deduplicated) - **ALREADY IMPLEMENTED**
- [ ] T036 Verify deduplication works between Reddit posts and RSS articles (test with overlapping content) - **TESTING TASK**
- [ ] T037 Test Reddit collection performance (verify <30s per subreddit, <2min total for 3 subreddits) - **TESTING TASK**
- [ ] T038 Validate error handling for offline Reddit API (verify graceful degradation to RSS-only) - **TESTING TASK**
- [ ] T039 Verify 72-hour consecutive failure timeout marks Reddit sources as inactive - **TESTING TASK**
- [ ] T040 Test rate limit handling (simulate 60 req/min threshold, verify snoowrap queuing) - **TESTING TASK**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion
  - User Story 1 (P1) can start after Phase 2
  - User Story 2 (P2) depends on User Story 1 (needs Reddit posts to calculate stats)
  - User Story 3 (P3) can be implemented in parallel with US1/US2 (extends filtering)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ MVP
- **User Story 2 (P2)**: Depends on User Story 1 completion (needs Reddit posts to measure engagement)
- **User Story 3 (P3)**: Extends User Story 1 filtering (can be implemented alongside US1 if desired)

### Within Each User Story

**User Story 1 Flow**:

1. T007-T008 (client initialization, config validation) → Foundation
2. T009-T014 (filtering, normalization) → Can be parallelized by function
3. T015 (main fetchArticles orchestration) → Depends on T007-T014
4. T016-T017 (error handling, state tracking) → Depends on T015
5. T018-T019 (configuration, integration) → Final integration

**User Story 2 Flow**:

1. T020 (engagement calculation helper) → Independent
2. T021 (API handler update) → Depends on T020
3. T022-T024 (rate limit tracking) → Can be done in parallel with T020-T021

**User Story 3 Flow**:

- All tasks (T025-T030) extend existing filters → Can be parallelized

### Parallel Opportunities

- **Phase 1**: All 3 tasks can run in parallel (T001-T003)
- **Phase 2**: T004-T005 can run in parallel (different files), T006 after those
- **User Story 1**:
  - T007-T008 can run in parallel
  - T009-T014 can run in parallel (different functions in same file - coordinate)
- **User Story 2**: T020 and T022-T023 can run in parallel
- **User Story 3**: T025, T027, T028, T029 can run in parallel (different functions)
- **Polish**: T031-T032, T035, T036-T040 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Core Reddit adapter functions (coordinate to avoid conflicts in same file):
Task T007: "Implement snoowrap client initialization"
Task T008: "Implement validateConfig() method"
Task T009: "Implement keyword filtering function"
Task T010: "Implement quality filtering function"
Task T011: "Implement comment fetching logic"

# Content normalization (different functions, can parallelize):
Task T012: "Implement content normalization for text posts"
Task T013: "Implement content normalization for link posts"
Task T014: "Implement Reddit post to Article mapping"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003) - ~10 minutes
2. Complete Phase 2: Foundational (T004-T006) - ~15 minutes
3. Complete Phase 3: User Story 1 (T007-T019) - ~80 minutes (as estimated in quickstart.md)
4. **STOP and VALIDATE**:
   - Trigger collection manually
   - Verify Reddit posts in `/api/sentiment/sources`
   - Verify posts appear in sentiment dashboard
   - Verify deduplication against RSS articles
5. Deploy to Netlify staging → Test hourly collection
6. **MVP COMPLETE**: Reddit sentiment collection is live! 🎉

**Estimated MVP Time**: ~2 hours implementation + testing

### Incremental Delivery

1. **Foundation** (Phase 1-2): ~25 minutes → Type system and dependencies ready
2. **MVP** (Phase 3): ~80 minutes → Reddit collection working (User Story 1) → **Deploy!**
3. **Metrics** (Phase 4): ~30 minutes → Engagement stats visible (User Story 2) → **Deploy!**
4. **Filtering** (Phase 5): ~30 minutes → Advanced filtering (User Story 3) → **Deploy!**
5. **Polish** (Phase 6): ~60 minutes → Documentation, validation, production hardening → **Final Deploy!**

**Total Estimated Time**: ~3.5 hours for complete feature

### Parallel Team Strategy

With 2 developers:

1. **Both**: Complete Setup + Foundational together (~25 min)
2. Once Foundational done:
   - **Developer A**: User Story 1 (T007-T019) - Core Reddit adapter
   - **Developer B**: Start User Story 3 filtering logic (T025-T030) in parallel
3. After User Story 1 complete:
   - **Developer A**: User Story 2 (T020-T024) - Engagement stats
   - **Developer B**: Continue User Story 3, then Polish (T031-T040)
4. **Both**: Final validation and deployment

**Parallel Estimated Time**: ~2 hours with 2 developers

---

## Task Count Summary

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (User Story 1 - P1)**: 13 tasks 🎯 MVP
- **Phase 4 (User Story 2 - P2)**: 5 tasks
- **Phase 5 (User Story 3 - P3)**: 6 tasks
- **Phase 6 (Polish)**: 10 tasks

**Total**: 40 tasks

**MVP Scope**: 19 tasks (Phase 1 + Phase 2 + Phase 3)

**Parallel Opportunities**: 15+ tasks can be parallelized across phases

---

## Success Criteria Validation

After completing all tasks, verify these success criteria:

**From spec.md**:

- ✅ SC-001: Reddit posts from 3 subreddits fetched each cycle
- ✅ SC-002: Reddit posts integrated within 5 minutes
- ✅ SC-003: Rate limits respected (zero IP bans)
- ✅ SC-004: Reddit metrics visible in `/api/sentiment/sources`
- ✅ SC-005: >90% uptime over 7 days
- ✅ SC-006: Cross-source deduplication working
- ✅ SC-007: Quality filtering (score >= 5 or comments >= 3)
- ✅ SC-008: Seamless dashboard integration
- ✅ SC-009: <30s per subreddit collection
- ✅ SC-010: 60%+ posts filtered as irrelevant

**Data Quality Metrics**:

- ✅ DQ-001: 70%+ posts contain Dutch healthcare keywords
- ✅ DQ-002: Average engagement >= 8
- ✅ DQ-003: Reddit contributes 10-30% of total articles (adjusted to 10-20% for 3 subreddits)

---

## Notes

- **[P] tasks**: Different files or independent functions - safe to parallelize
- **[Story] label**: Maps task to user story for independent testing and delivery
- **Coordinate on T007-T014**: All modify `server/utils/redditAdapter.ts` - assign to one developer or use git branches
- **Environment variables**: Set via Netlify dashboard (T033) after local testing with `.env`
- **Subreddit count**: Spec says 4 subreddits but research.md recommends 3 (r/zorgverzekering doesn't exist) - using 3 in implementation
- **Tests**: Not explicitly requested in spec - focusing on implementation and manual validation
- **Commit strategy**: Commit after each task or logical group (e.g., all Phase 1 setup tasks together)
- **Stop at checkpoints**: Validate each user story independently before proceeding to next priority
