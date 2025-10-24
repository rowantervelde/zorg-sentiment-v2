---
description: "Implementation task breakdown for MVP Sentiment Dashboard"
---

# Tasks: MVP Sentiment Dashboard

**Input**: Design documents from `/specs/001-mvp-sentiment-dashboard/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sentiment-api.yaml

**Tests**: No explicit test requirements in specification - tests are OPTIONAL for this MVP

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Web application structure (Nuxt 3 SSG + Netlify Functions):

- Frontend: `pages/`, `components/`, `composables/`
- Backend: `netlify/functions/`, `server/api/`
- Services: `services/`
- Types: `types/`
- Tests: `tests/unit/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Nuxt 3 + Netlify configuration

- [ ] T001 Initialize Nuxt 3 project with TypeScript 5.x in repository root
- [ ] T002 [P] Install core dependencies: @nuxt/ui, vue-chartjs, chart.js, @netlify/blobs
- [ ] T003 [P] Install sentiment analysis: sentiment, wink-nlp-utils
- [ ] T004 [P] Install testing dependencies: vitest, @nuxt/test-utils, playwright
- [ ] T005 Configure nuxt.config.ts with SSG preset and Netlify integration
- [ ] T006 Create netlify.toml with build configuration and function settings
- [ ] T007 [P] Setup TypeScript configuration (tsconfig.json) for Nuxt 3
- [ ] T008 [P] Configure Tailwind CSS with Nuxt UI v3 integration
- [ ] T009 Create .env.example with required environment variables per quickstart.md
- [ ] T010 Initialize package.json scripts: dev, build, generate, test, lint

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 Create TypeScript interfaces in types/sentiment.ts (SentimentDataPoint, MoodSummary, MoodType)
- [ ] T012 [P] Create TypeScript interfaces in types/api.ts (API request/response types)
- [ ] T013 [P] Create DataSource interface in types/sentiment.ts with MVP configuration
- [ ] T014 Implement Netlify Blobs data store service in services/data-store.ts (getStore, get, setJSON operations)
- [ ] T015 [P] Implement RSS feed fetcher in services/rss-fetcher.ts (fetch NU.nl Gezondheid feed)
- [ ] T016 [P] Implement sentiment analyzer in services/sentiment-analyzer.ts (Dutch text analysis, ≥60% threshold classification)
- [ ] T017 Implement mood summary generator in services/sentiment-analyzer.ts (Dutch templates for positive/negative/mixed/neutral)
- [ ] T018 Create Netlify Function for data collection in netlify/functions/collect-sentiment.ts (hourly scheduled)
- [ ] T019 Create Netlify Function GET endpoint in server/api/sentiment.get.ts (implements /api/sentiment contract)
- [ ] T020 [P] Setup rate limiting with Netlify Edge Function (20 req/hour per IP)
- [ ] T021 [P] Create base Vue composable useSentiment.ts in composables/ for data fetching
- [ ] T022 Create default error boundary and loading states in app.vue

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Current National Mood (Priority: P1) 🎯 MVP

**Goal**: Display current sentiment with visual mood indicator and human-readable summary

**Independent Test**: Visit homepage and verify sentiment indicator displays with current data. If no data exists, friendly message appears.

**Acceptance**:

- Visual mood indicator (happy/neutral/sad emoji/icon) showing current sentiment
- Concise Dutch summary (e.g., "Nederland voelt zich optimistisch over zorg")
- Friendly message when no data available

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create MoodIndicator.vue component in components/ with emoji/icon display
- [ ] T024 [P] [US1] Create DataTimestamp.vue component in components/ with last updated display
- [ ] T025 [US1] Implement mood classification logic in MoodIndicator.vue (≥60% threshold mapping)
- [ ] T026 [US1] Add Dutch mood summary display to MoodIndicator.vue
- [ ] T027 [US1] Create main dashboard page in pages/index.vue with MoodIndicator integration
- [ ] T028 [US1] Implement useSentiment composable to fetch from /api/sentiment
- [ ] T029 [US1] Add loading state handling in pages/index.vue
- [ ] T030 [US1] Add "no data available" friendly message in pages/index.vue
- [ ] T031 [US1] Style MoodIndicator with Nuxt UI components (UCard, UBadge)
- [ ] T032 [US1] Add responsive design for mobile and desktop in pages/index.vue

**Checkpoint**: At this point, User Story 1 should be fully functional - visitors see current mood indicator with summary or friendly no-data message

---

## Phase 4: User Story 2 - See Sentiment Trends Over Time (Priority: P2)

**Goal**: Display 7-day historical trend chart showing sentiment changes

**Independent Test**: View trends visualization and verify it shows historical data points over 7 days. Notable changes are highlighted.

**Acceptance**:

- Visual representation of sentiment changes over past week (line/area chart)
- Hover/tap interaction shows sentiment value and date for data point
- Notable changes visually highlighted

### Implementation for User Story 2

- [ ] T033 [P] [US2] Create TrendsChart.vue component in components/ with Chart.js integration
- [ ] T034 [P] [US2] Implement TrendPeriod calculation in services/sentiment-analyzer.ts
- [ ] T035 [US2] Configure Chart.js line chart for 7-day sentiment trend in TrendsChart.vue
- [ ] T036 [US2] Add tooltip interaction for data point details in TrendsChart.vue
- [ ] T037 [US2] Implement trend data fetching in useSentiment composable (/api/sentiment?include=trend)
- [ ] T038 [US2] Add visual highlighting for significant sentiment changes (>20% swing) in TrendsChart.vue
- [ ] T039 [US2] Integrate TrendsChart into pages/index.vue below MoodIndicator
- [ ] T040 [US2] Add "building trend history" message when <7 days of data in TrendsChart.vue
- [ ] T041 [US2] Handle missing data points (gaps) visualization in TrendsChart.vue
- [ ] T042 [US2] Style TrendsChart with responsive container and Nuxt UI theming

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - visitors see current mood AND historical trends

---

## Phase 5: User Story 3 - Understand Sentiment Breakdown (Priority: P3)

**Goal**: Display breakdown showing proportion of positive, neutral, and negative sentiment

**Independent Test**: View sentiment breakdown visualization and verify percentages add up to 100%. Categories clearly distinguished by color.

**Acceptance**:

- Percentages/proportions for positive, neutral, negative sentiment
- Three categories clearly distinguished by color or labeling
- Visual emphasis when one category dominates (>70%)

### Implementation for User Story 3

- [ ] T043 [P] [US3] Create SentimentBreakdown.vue component in components/ with Chart.js doughnut chart
- [ ] T044 [US3] Configure Chart.js doughnut chart with color coding in SentimentBreakdown.vue
- [ ] T045 [US3] Add percentage labels for each sentiment category in SentimentBreakdown.vue
- [ ] T046 [US3] Implement dominance visual emphasis (>70%) in SentimentBreakdown.vue
- [ ] T047 [US3] Add breakdown data extraction in useSentiment composable
- [ ] T048 [US3] Integrate SentimentBreakdown into pages/index.vue below TrendsChart
- [ ] T049 [US3] Add legend with color-coded labels in SentimentBreakdown.vue
- [ ] T050 [US3] Validate percentage sum equals 100 with visual indicator
- [ ] T051 [US3] Style SentimentBreakdown with responsive layout and Nuxt UI components

**Checkpoint**: All user stories should now be independently functional - full dashboard with mood, trends, and breakdown

---

## Phase 6: Data Collection & Edge Cases

**Purpose**: Implement data collection automation and handle edge cases from spec.md

- [ ] T052 Configure Netlify scheduled function for hourly collection in netlify.toml
- [ ] T053 [P] Implement data staleness detection (24-hour threshold) in useSentiment composable
- [ ] T054 [P] Add prominent warning display in DataTimestamp.vue when data >24 hours old
- [ ] T055 Implement 7-day rolling window cleanup in services/data-store.ts
- [ ] T056 [P] Add error handling for API downtime in services/rss-fetcher.ts
- [ ] T057 [P] Add rate limit client-side handling (429 response) in useSentiment composable
- [ ] T058 Implement data retention validation (7-day max) in netlify/functions/collect-sentiment.ts
- [ ] T059 [P] Add collection duration tracking in netlify/functions/collect-sentiment.ts
- [ ] T060 [P] Implement confidence score calculation (optional) in services/sentiment-analyzer.ts

---

## Phase 7: API Completeness & Monitoring

**Purpose**: Implement remaining API endpoints and observability

- [ ] T061 [P] Create /api/sentiment/history endpoint in server/api/sentiment/history.get.ts
- [ ] T062 [P] Create /api/health endpoint in server/api/health.get.ts with source status
- [ ] T063 Implement query parameter handling (?include=trend|summary|all) in server/api/sentiment.get.ts
- [ ] T064 [P] Add structured logging to all Netlify Functions (timestamps, errors)
- [ ] T065 [P] Implement error response standardization per OpenAPI contract in server/api/
- [ ] T066 Add CDN cache headers (5 min) to /api/sentiment endpoint
- [ ] T067 [P] Add CORS configuration in server/api/ endpoints

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T068 [P] Add SEO meta tags (title, description, OG tags) to pages/index.vue
- [ ] T069 [P] Implement Dutch language static content throughout application
- [ ] T070 Add playful visual design polish (colors, spacing, typography)
- [ ] T071 [P] Optimize Chart.js bundle size (tree-shaking, lazy loading)
- [ ] T072 Run Lighthouse performance audit - target <3s page load
- [ ] T073 [P] Add favicon and app icons
- [ ] T074 [P] Create README.md with project overview and quickstart link
- [ ] T075 Test 100-500 concurrent user capacity with load testing tool
- [ ] T076 Validate all edge cases from spec.md (no data, missing days, extreme values, data gaps)
- [ ] T077 [P] Add error boundary for graceful failure handling
- [ ] T078 Verify rate limiting (20 req/hour) with manual testing
- [ ] T079 [P] Add deployment preview validation checklist
- [ ] T080 Run through complete quickstart.md validation
- [ ] T081 [P] Update .github/copilot-instructions.md with final implementation notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Data Collection (Phase 6)**: Can proceed in parallel with Phase 5 (US3)
- **API Completeness (Phase 7)**: Can proceed in parallel with Phase 5 (US3)
- **Polish (Phase 8)**: Depends on all user stories (P1-P3) being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1, but integrates with same page
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2, but integrates with same page

### Within Each User Story

- US1: Component creation [P] → Implementation → Integration → Styling
- US2: Component [P] + Service calculation → Chart config → Integration → Styling
- US3: Component [P] → Chart config → Integration → Validation → Styling

### Parallel Opportunities

**Phase 1 (Setup)**: T002, T003, T004, T007, T008 can all run in parallel

**Phase 2 (Foundational)**:

- T012, T013, T015, T016, T020, T021 can run in parallel (different files)
- T014 must complete before T018, T019

**Phase 3 (US1)**: T023, T024 can run in parallel (different components)

**Phase 4 (US2)**: T033, T034 can run in parallel

**Phase 5 (US3)**: T043 is the main component (others depend on it)

**Phase 6 (Data Collection)**: T053, T054, T056, T057, T059, T060 can run in parallel

**Phase 7 (API)**: T061, T062, T064, T065, T067 can run in parallel

**Phase 8 (Polish)**: T068, T069, T071, T073, T074, T077, T079, T081 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch components together:
- T023: Create MoodIndicator.vue
- T024: Create DataTimestamp.vue

# These complete before integration:
- T025-T032 run sequentially with dependencies
```

---

## Parallel Example: Foundational Phase

```bash
# Core types and services (parallel):
- T012: types/sentiment.ts
- T013: types/api.ts
- T015: services/rss-fetcher.ts
- T016: services/sentiment-analyzer.ts
- T021: composables/useSentiment.ts

# Data store (blocking):
- T014: services/data-store.ts (MUST complete first)

# Functions (after data-store):
- T018: netlify/functions/collect-sentiment.ts
- T019: server/api/sentiment.get.ts
- T020: Rate limiting edge function
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended

1. **Complete Phase 1**: Setup (T001-T010) - ~2 hours
2. **Complete Phase 2**: Foundational (T011-T022) - ~8 hours
   - **CRITICAL CHECKPOINT**: Foundation must be solid before proceeding
3. **Complete Phase 3**: User Story 1 (T023-T032) - ~6 hours
4. **STOP and VALIDATE**:
   - Deploy to Netlify Deploy Preview
   - Test User Story 1 independently
   - Verify current mood displays correctly
   - Test no-data scenario
   - Check mobile responsiveness
5. **If validation passes**: Merge to main, deploy to production
6. **Celebrate MVP!** 🎉 (You now have a working sentiment dashboard)

**Estimated MVP Timeline**: 16 hours (2 days for single developer)

### Incremental Delivery (After MVP)

7. **Add Phase 4**: User Story 2 - Trends (T033-T042) - ~6 hours
   - Deploy Preview → Test US1 + US2 together → Merge
8. **Add Phase 5**: User Story 3 - Breakdown (T043-T051) - ~4 hours
   - Deploy Preview → Test US1 + US2 + US3 together → Merge
9. **Add Phase 6**: Data Collection & Edge Cases (T052-T060) - ~4 hours
   - Test scheduled collection, staleness warnings
10. **Add Phase 7**: API Completeness (T061-T067) - ~3 hours
    - Test /history and /health endpoints
11. **Complete Phase 8**: Polish (T068-T081) - ~6 hours
    - Performance optimization, load testing, final validation

**Total Timeline**: ~39 hours (5 days for single developer with testing)

### Parallel Team Strategy (3 Developers)

**Week 1 (Foundation + MVP)**:

- **Day 1-2 (Together)**: Phase 1 + Phase 2 (Setup + Foundational) - All devs collaborate
- **Day 3 (Parallel)**:
  - Dev A: User Story 1 (T023-T032)
  - Dev B: User Story 2 (T033-T042)
  - Dev C: User Story 3 (T043-T051)
- **Day 4 (Integration)**: Integration testing, Deploy Preview validation
- **Day 5 (Polish + Deploy)**:
  - Dev A: Phase 6 (Data Collection)
  - Dev B: Phase 7 (API Completeness)
  - Dev C: Phase 8 (Polish)

**Estimated Parallel Timeline**: 5 days with 3 developers

---

## Task Count Summary

- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 12 tasks ⚠️ CRITICAL - blocks all stories
- **Phase 3 (User Story 1)**: 10 tasks 🎯 MVP
- **Phase 4 (User Story 2)**: 10 tasks
- **Phase 5 (User Story 3)**: 9 tasks
- **Phase 6 (Data Collection)**: 9 tasks
- **Phase 7 (API Completeness)**: 7 tasks
- **Phase 8 (Polish)**: 14 tasks

**Total Tasks**: 81 tasks

**MVP Tasks Only** (Setup + Foundational + US1): 32 tasks

**Parallel Tasks**: 29 tasks marked with [P] can run in parallel within their phase

---

## Independent Test Criteria

### User Story 1 (MVP Checkpoint)

✅ Homepage loads in <3 seconds  
✅ Mood indicator displays emoji (😊/😐/😟) matching current sentiment  
✅ Dutch summary text appears below mood indicator  
✅ Timestamp shows when data was last updated  
✅ "Friendly message" appears if no data exists yet  
✅ Mobile responsive (test on 320px width)

### User Story 2 (Trends Checkpoint)

✅ Line chart displays with 7 days on X-axis  
✅ Hovering over data point shows date + sentiment value  
✅ Chart shows "building trend history" message when <7 days data  
✅ Gaps in data clearly indicated (not interpolated)  
✅ Notable changes (>20% swing) visually highlighted

### User Story 3 (Breakdown Checkpoint)

✅ Doughnut chart displays with 3 segments (positive/neutral/negative)  
✅ Percentages sum to exactly 100%  
✅ Colors clearly distinguish categories  
✅ Dominant sentiment (>70%) visually emphasized  
✅ Legend shows color-coded labels

### Edge Cases (Final Validation)

✅ Data older than 24 hours triggers staleness warning  
✅ Rate limit (21st request in hour) returns 429 error  
✅ API downtime shows last known data with timestamp  
✅ First day displays current mood only (no trend yet)  
✅ 100% positive sentiment displays correctly (extreme value)  
✅ Missing data days show gaps in trend chart

---

## Notes

- **[P] tasks** = different files, no dependencies within phase
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Stop at any checkpoint to validate story independently before proceeding
- Netlify Blobs requires deployment to Netlify (local dev uses mock or `netlify dev`)
- All Dutch language content should be grammatically correct and culturally appropriate
- Performance goal: <3s page load (test with Lighthouse after T072)
- Rate limiting: 20 requests/hour per IP (test after T078)
- Data retention: 7 days rolling window (168 hourly data points max)

---

## Suggested MVP Scope

**Start here for fastest time-to-value**:

- Phase 1: Setup (T001-T010)
- Phase 2: Foundational (T011-T022) ⚠️ CRITICAL
- Phase 3: User Story 1 only (T023-T032) 🎯 MVP

**Why this is a complete MVP**:

- Delivers core value: "How does Netherlands feel about healthcare insurance RIGHT NOW?"
- Independently testable and deployable
- Requires ~16 hours (2 days) for single developer
- Can validate with real users before building US2/US3
- Constitutional compliance: MVP-first development principle satisfied

**After MVP validation with users, proceed to**:

- Phase 4: User Story 2 (adds trends context)
- Phase 5: User Story 3 (adds transparency via breakdown)
- Phase 6-8: Production hardening
