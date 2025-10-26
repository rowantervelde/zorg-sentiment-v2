# Tasks: Multi-Source Sentiment Collection

**Feature**: 002-multi-source-sentiment  
**Input**: plan.md, spec.md, research.md, data-model.md, contracts/sources-api.yaml  
**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1, US2, US3, US4, or SHARED)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and configuration

- [ ] T001 [SHARED] Create feature branch `002-multi-source-sentiment` and verify checkout
- [ ] T002 [P] [SHARED] Create `server/config/` directory for source configuration
- [ ] T003 [P] [SHARED] Install `wink-nlp-utils@2.1.0` dependency for Levenshtein distance in package.json
- [ ] T004 [P] [SHARED] Create base `server/config/sources.json` with empty sources array structure

**Manual Test Checkpoint**: Verify branch exists, config directory created, dependency installed with `npm list wink-nlp-utils`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before ANY user story can proceed

**⚠️ CRITICAL**: No user story work begins until this phase completes

- [ ] T005 [SHARED] Create `server/types/source.ts` with SourceType enum (RSS, SOCIAL_TWITTER, SOCIAL_REDDIT, API)
- [ ] T006 [P] [SHARED] Create `server/types/article.ts` with Article interface (title, content, publishedAt, sourceId, deduplicationHash)
- [ ] T007 [P] [SHARED] Create `server/types/sourceConfiguration.ts` with SourceConfiguration interface (id, name, type, config, category, isActive, reliability)
- [ ] T008 [SHARED] Create abstract `server/utils/sourceAdapter.ts` with SourceAdapter interface (fetchArticles, validateConfig, getIdentifier, supportsSourceType)
- [ ] T009 [SHARED] Extend `app/types/sentiment.ts` to add SourceContribution interface (sourceId, sourceName, articleCount, sentimentBreakdown, timestamp, errors)
- [ ] T010 [SHARED] Extend `app/types/sentiment.ts` to add sourceContributions array and sourceDiversity metrics to SentimentDataPoint interface
- [ ] T011 [SHARED] Update `server/utils/storage.ts` to support reading/writing sourceContributions array in SentimentDataPoint blob structure
- [ ] T012 [SHARED] Create `server/utils/deduplicator.ts` with titleContentSimilarity function using wink-nlp-utils Levenshtein (80% threshold)
- [ ] T013 [SHARED] Add isDuplicate function to `server/utils/deduplicator.ts` with Article[] input (compares against existing articles)

**Manual Test Checkpoint**:

1. Run `npm run typecheck` to verify all TypeScript types compile
2. Verify `server/utils/storage.ts` can read existing sentiment data (backward compatibility test)
3. Run unit test for deduplicator with sample articles: "identical title" (100% match), "similar article content" (85% match), "different news" (30% match)

---

## Phase 3: User Story 1 - Multi-Source RSS Collection (Priority: P1) 🎯 MVP

**Goal**: Collect sentiment data from 5 RSS feeds with graceful degradation when sources fail

**Independent Test**: Collection cycle runs successfully with 3+ sources contributing articles, even when 2 feeds are down

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create `server/config/sources.json` with 5 RSS feed configurations (NU.nl, NOS, RTL Nieuws, Zorgkrant, Skipr) per RS-001 to RS-005
- [ ] T015 [P] [US1] Create `server/utils/rssAdapter.ts` implementing SourceAdapter interface for RSS feeds (uses existing rssFetcher logic)
- [ ] T016 [US1] Create `server/utils/sourceOrchestrator.ts` with fetchFromAllSources function (Promise.allSettled, 10s timeout per source)
- [ ] T017 [US1] Add deduplication logic to `server/utils/sourceOrchestrator.ts` (calls deduplicator.isDuplicate for each article)
- [ ] T018 [US1] Add article limiting logic to `server/utils/sourceOrchestrator.ts` (max 30 articles per source per FR-014)
- [ ] T019 [US1] Add source contribution tracking to `server/utils/sourceOrchestrator.ts` (builds SourceContribution[] from results)
- [ ] T020 [US1] Add source diversity calculation to `server/utils/sourceOrchestrator.ts` (total sources, article distribution)
- [ ] T021 [US1] Update `netlify/functions/collect-sentiment.mts` to use sourceOrchestrator.fetchFromAllSources instead of single RSS fetch
- [ ] T022 [US1] Update `netlify/functions/collect-sentiment.mts` to save sourceContributions and sourceDiversity in SentimentDataPoint
- [ ] T023 [US1] Add error logging to `netlify/functions/collect-sentiment.mts` for source fetch failures (non-blocking)

**Manual Test Checkpoint - User Story 1**:

1. **Test 1 - Normal operation**: Trigger collection cycle manually, verify sentiment data includes articles from all 5 RSS feeds
   - Check Netlify function logs for "Fetched X articles from Y sources"
   - Verify `sourceContributions` array has 5 entries in latest sentiment blob
   - Verify `sourceDiversity.totalSources >= 5` and no single source > 60% of articles
2. **Test 2 - Graceful degradation**: Temporarily misconfigure 2 RSS feed URLs in sources.json, trigger collection
   - Verify sentiment data still generated with 3 remaining sources
   - Check logs show errors for 2 failed sources but collection continues
   - Verify `sourceContributions` has 3 entries with errors recorded for 2 failed sources
3. **Test 3 - Deduplication**: Find duplicate news story on NU.nl and NOS.nl, trigger collection
   - Verify only 1 article appears in final sentiment analysis (check article count)
   - Verify both sources credited in `sourceContributions` even though duplicate excluded
4. **Test 4 - Performance**: Monitor collection cycle execution time
   - Verify total time < 2 minutes (including 10s timeout handling)
   - Check parallel fetch happens (logs show simultaneous starts)

**Checkpoint**: At this point, User Story 1 is fully functional - multi-source collection with graceful degradation works end-to-end

---

## Phase 4: User Story 2 - Source Contribution API (Priority: P2)

**Goal**: Provide API endpoint to access source contribution metrics for each sentiment data point

**Independent Test**: GET /api/sentiment/sources returns source metrics matching data in sentiment blobs

### Implementation for User Story 2

- [ ] T024 [P] [US2] Create `app/types/api.ts` with SourceContributionResponse interface (matches contracts/sources-api.yaml schema)
- [ ] T025 [P] [US2] Create `app/types/api.ts` with SourceMetrics interface for aggregated statistics (successRate, avgArticles, lastFetchStatus)
- [ ] T026 [US2] Create `server/api/sentiment/sources.get.ts` endpoint implementing GET /api/sentiment/sources
- [ ] T027 [US2] Implement readLatestSources function in `server/api/sentiment/sources.get.ts` (reads latest sentiment blob, extracts sourceContributions)
- [ ] T028 [US2] Implement calculateSourceMetrics function in `server/api/sentiment/sources.get.ts` (aggregates 7-day metrics per source)
- [ ] T029 [US2] Add caching headers to `server/api/sentiment/sources.get.ts` (5-minute cache per research.md)
- [ ] T030 [US2] Add error handling to `server/api/sentiment/sources.get.ts` for missing data scenarios (returns empty array with 200 status)
- [ ] T031 [US2] Update `server/middleware/cors.ts` to allow /api/sentiment/sources endpoint (if not already covered)

**Manual Test Checkpoint - User Story 2**:

1. **Test 1 - API response structure**: Call `GET /api/sentiment/sources` via curl or Postman
   - Verify response matches OpenAPI schema in contracts/sources-api.yaml
   - Check `sources[]` array contains 5 entries (one per RSS feed)
   - Verify each source has `articleCount`, `sentimentBreakdown`, `lastFetchTimestamp`, `errors`
2. **Test 2 - Data consistency**: Compare API response with raw sentiment blob data
   - Verify `articleCount` in API matches `sourceContributions[].articleCount` in blob
   - Verify `sentimentBreakdown` percentages match blob data
3. **Test 3 - 7-day metrics**: Trigger multiple collection cycles over 1 hour (simulate 7 days with test data)
   - Verify `metrics.successRate` calculation is correct (successful fetches / total attempts)
   - Verify `metrics.avgArticles` reflects average across time period
   - Verify `metrics.lastFetchStatus` shows "success" or "error" accurately
4. **Test 4 - Caching behavior**: Call API twice within 5 minutes
   - Verify second response returns instantly (cached)
   - Verify Cache-Control headers present in response
5. **Test 5 - Error scenarios**: Stop Netlify Blob storage temporarily
   - Verify API returns 200 with empty sources array (graceful degradation)
   - Check error logged but not exposed to client

**Checkpoint**: Source contribution API is functional - external systems can query source metrics via HTTP endpoint

---

## Phase 5: User Story 3 - Configurable Sources (Priority: P3)

**Goal**: Allow source configuration changes without code deployment (environment variables override JSON config)

**Independent Test**: Change RSS feed URL via environment variable, restart function, verify new source used in collection

### Implementation for User Story 3

- [ ] T032 [US3] Create `server/utils/sourceConfig.ts` with loadSourceConfiguration function (reads sources.json, applies env var overrides)
- [ ] T033 [US3] Implement environment variable parsing in `server/utils/sourceConfig.ts` (format: `SOURCE_RSS_NUID_URL=https://...`)
- [ ] T034 [US3] Add configuration validation to `server/utils/sourceConfig.ts` (checks required fields: id, name, type, config.url, isActive)
- [ ] T035 [US3] Add invalid source filtering to `server/utils/sourceConfig.ts` (logs errors per FR-009, continues with valid sources)
- [ ] T036 [US3] Update `server/utils/sourceOrchestrator.ts` to use sourceConfig.loadSourceConfiguration instead of direct JSON import
- [ ] T037 [US3] Update `netlify/functions/collect-sentiment.mts` to call sourceConfig.loadSourceConfiguration at function start
- [ ] T038 [US3] Add startup validation logging to `netlify/functions/collect-sentiment.mts` (logs loaded sources, validation errors)
- [ ] T039 [P] [US3] Document environment variable format in `docs/configuration.md` (examples: SOURCE_RSS_NUID_URL, SOURCE_RSS_NUID_ACTIVE)
- [ ] T040 [P] [US3] Add configuration examples to `server/config/sources.example.json` with comments

**Manual Test Checkpoint - User Story 3**:

1. **Test 1 - JSON configuration baseline**: Deploy with default sources.json
   - Verify all 5 RSS feeds loaded at startup (check logs)
   - Trigger collection, verify all sources used
2. **Test 2 - Environment variable override**: Set `SOURCE_RSS_NUID_URL=https://invalid-test-url.com` in Netlify environment
   - Redeploy function, check startup logs
   - Verify NU.nl source uses new URL (fails gracefully with error logged)
   - Verify other 4 sources still work normally
3. **Test 3 - Disable source via env var**: Set `SOURCE_RSS_NUID_ACTIVE=false`
   - Restart function, verify NU.nl skipped in collection cycle (logs show 4 sources)
   - Verify sentiment data generated from remaining 4 sources
4. **Test 4 - Invalid configuration handling**: Set `SOURCE_RSS_NOS_URL=` (empty URL)
   - Verify validation error logged at startup for NOS source
   - Verify collection continues with 4 valid sources (graceful degradation)
   - Verify no deployment needed to fix (update env var, restart)
5. **Test 5 - Add new source**: Add 6th RSS feed to sources.json, redeploy
   - Verify new source appears in startup logs
   - Verify new source included in collection cycle
   - Verify GET /api/sentiment/sources shows 6 sources

**Checkpoint**: Source configuration is flexible - operators can modify sources via environment variables without code changes

---

## Phase 6: User Story 4 - Architecture Prep for Social Media (Priority: P4)

**Goal**: Extend architecture to support future non-RSS sources (Twitter, Reddit) through common interface

**Independent Test**: Mock social media adapter can be registered and used in orchestrator without modifying sentiment analysis code

### Implementation for User Story 4

- [ ] T041 [US4] Add source type validation to `server/utils/sourceAdapter.ts` (supportsSourceType method enforced)
- [ ] T042 [US4] Create adapter registry in `server/utils/sourceOrchestrator.ts` (maps SourceType enum to adapter instances)
- [ ] T043 [US4] Update `server/utils/sourceOrchestrator.ts` to select adapter based on source.type field (RSS → rssAdapter, future SOCIAL_TWITTER → twitterAdapter)
- [ ] T044 [P] [US4] Create stub `server/utils/twitterAdapter.ts` implementing SourceAdapter interface (throws "Not implemented" error in fetchArticles)
- [ ] T045 [P] [US4] Create stub `server/utils/redditAdapter.ts` implementing SourceAdapter interface (throws "Not implemented" error in fetchArticles)
- [ ] T046 [US4] Register twitterAdapter and redditAdapter in sourceOrchestrator adapter registry (commented out until implemented)
- [ ] T047 [US4] Update Article interface in `server/types/article.ts` to support social media fields (optional: authorHandle, postUrl, engagement metrics)
- [ ] T048 [P] [US4] Document future social media integration in `docs/extending-sources.md` (how to implement SourceAdapter, register adapter, configure source)
- [ ] T049 [P] [US4] Create example social media source config in `server/config/sources.example.json` (commented out Twitter and Reddit entries)

**Manual Test Checkpoint - User Story 4**:

1. **Test 1 - Adapter registry**: Add console.log in sourceOrchestrator showing registered adapter types
   - Verify RSS adapter registered and used for all 5 feeds
   - Verify twitterAdapter and redditAdapter present in registry (even if stubs)
2. **Test 2 - Source type routing**: Add mock Twitter source to sources.json with `type: "SOCIAL_TWITTER"` and `isActive: false`
   - Verify sourceOrchestrator routes to twitterAdapter (check logs)
   - Verify "Not implemented" error logged (graceful handling)
   - Verify RSS sources unaffected by stub adapter
3. **Test 3 - Article interface extension**: Manually add optional social media fields to test article
   - Verify TypeScript compilation succeeds
   - Verify storage layer handles optional fields (no errors saving/reading)
4. **Test 4 - Documentation review**: Read `docs/extending-sources.md`
   - Verify clear steps to implement new SourceAdapter
   - Verify example code shows interface requirements
   - Verify adapter registration process documented

**Checkpoint**: Architecture is extensible - future social media sources can be added by implementing SourceAdapter interface without modifying core sentiment logic

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories and final validation

- [ ] T050 [P] [SHARED] Update main README.md with multi-source feature description and source list
- [ ] T051 [P] [SHARED] Create `docs/architecture/multi-source-design.md` documenting orchestrator pattern and adapter system
- [ ] T052 [SHARED] Add comprehensive error logging for all source failures in `server/utils/sourceOrchestrator.ts` (include source ID, error type, timestamp)
- [ ] T053 [P] [SHARED] Review and optimize deduplication performance for >100 articles (consider caching hash comparisons)
- [ ] T054 [P] [SHARED] Add TypeScript strict mode checks for all new source-related files
- [ ] T055 [SHARED] Run full quickstart.md verification checklist (20-minute setup guide validation)
- [ ] T056 [SHARED] Conduct end-to-end test: Deploy to Netlify, trigger scheduled collection, verify all success criteria (SC-001 to SC-010)
- [ ] T057 [P] [SHARED] Document source reliability monitoring process in `docs/operations.md` (how to check feed health, interpret metrics)
- [ ] T058 [SHARED] Performance test: Simulate 7 days of collection cycles, verify average collection time < 2 minutes and success rate > 90%

**Final Manual Test Checkpoint - Complete Feature**:

1. **End-to-End Validation**: Deploy to Netlify production
   - Trigger scheduled collection (wait for hourly cron)
   - Verify sentiment dashboard updates with multi-source data
   - Check GET /api/sentiment shows sourceContributions in response
   - Check GET /api/sentiment/sources shows 5 RSS feeds with metrics
2. **Success Criteria Validation** (per spec.md):
   - SC-001: Verify 3+ sources per cycle ✓
   - SC-002: Simulate 2 feed failures, verify sentiment still generated ✓
   - SC-003: Verify no single source >60% articles ✓
   - SC-004: Verify duplicate detection rate (manually identify duplicates, check exclusion)
   - SC-005: Verify failed feeds logged within 1 cycle ✓
   - SC-006: Change source config via env var without deployment ✓
   - SC-007: Verify GET /api/sentiment/sources accessible ✓
   - SC-008: Monitor 7 days, verify 90%+ success rate ✓
   - SC-009: Verify stub social adapters can be registered ✓
   - SC-010: Compare sentiment variance before/after multi-source (manual analysis)
3. **Regression Testing**: Verify existing functionality unaffected
   - Dashboard still displays sentiment trends correctly
   - Historical data still accessible
   - Single-source backward compatibility (if old blobs present)
4. **Documentation Review**: Verify all docs updated
   - README.md describes multi-source feature ✓
   - docs/configuration.md shows env var examples ✓
   - docs/extending-sources.md guides future development ✓
   - docs/operations.md covers monitoring ✓

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories until complete
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP delivery target
- **User Story 2 (Phase 4)**: Depends on Foundational - can start in parallel with US1 (different files), but requires US1 data to test meaningfully
- **User Story 3 (Phase 5)**: Depends on US1 completion (modifies orchestrator and collection function)
- **User Story 4 (Phase 6)**: Depends on US1 completion (extends orchestrator architecture)
- **Polish (Phase 7)**: Depends on all desired user stories completing

### Recommended Execution Strategy

**MVP-First (Single Developer)**:

1. Complete Setup → Foundational (foundation ready)
2. Complete US1 (Phase 3) → **STOP AND TEST** → Deploy/Demo MVP
3. Complete US2 (Phase 4) → **STOP AND TEST** → Deploy metrics API
4. Complete US3 (Phase 5) → **STOP AND TEST** → Deploy config flexibility
5. Complete US4 (Phase 6) → **STOP AND TEST** → Validate architecture extensibility
6. Complete Polish (Phase 7) → Final validation → Production release

**Parallel Team Strategy**:

1. Team completes Setup + Foundational together
2. Once Foundational done:
   - Developer A: US1 (core multi-source collection)
   - Developer B: US2 (metrics API - can develop against mock US1 data)
3. After US1 + US2 complete:
   - Developer A: US3 (config system)
   - Developer B: US4 (architecture prep)
4. Team completes Polish together

### Within Each User Story

- Tasks marked [P] can run in parallel (different files)
- Sequential tasks must follow order (e.g., create interface before implementing)
- **Manual Test Checkpoint** must pass before moving to next user story

### Parallel Opportunities

**Setup Phase**: T002, T003, T004 can run in parallel  
**Foundational Phase**: T006+T007 (types), T012+T013 (deduplicator) can run in parallel  
**User Story 1**: T014+T015 (config + adapter) can start in parallel  
**User Story 2**: T024+T025 (types) can run in parallel, T039+T040 (docs) can run in parallel  
**User Story 3**: T039+T040 (docs) can run in parallel  
**User Story 4**: T044+T045+T047 (stubs + types), T048+T049 (docs) can run in parallel  
**Polish Phase**: T050+T051+T054+T057 (docs + checks) can run in parallel

---

## Notes

- **[P] tasks** = Different files, no dependencies, safe to parallelize
- **[Story] labels** = Traceability to user stories in spec.md
- **Manual Test Checkpoints** = Required validation before proceeding to next phase (per user request: "Be sure to have time te test every phase manualy when implemented")
- Each user story is independently completable and testable (can stop after any story for MVP delivery)
- Commit after each completed task or logical task group
- Stop at any checkpoint to validate story works independently before continuing
- All file paths use Nuxt 3 project structure conventions (server/, app/, netlify/functions/)
- TypeScript compilation and type checking required after type definition changes (T005-T010, T024-T025, T047)
