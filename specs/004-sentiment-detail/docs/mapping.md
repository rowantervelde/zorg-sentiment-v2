# Feature Mapping: Sentiment Detail Breakdown Page

**Feature**: 004-sentiment-detail  
**Created**: 2025-11-11  
**Last Updated**: 2025-11-11  
**Status**: Planning Phase

## Document Purpose

This document provides traceability between specification requirements, implementation tasks, test cases, and code artifacts. It ensures transparency and supports onboarding by mapping the "what" (requirements) to the "how" (implementation) to the "verify" (testing).

---

## Specification to Implementation Mapping

### User Stories to Epics

| User Story                                           | Priority | Epic           | Rationale                                                                            |
| ---------------------------------------------------- | -------- | -------------- | ------------------------------------------------------------------------------------ |
| US-1: View Source-Specific Article Breakdown         | P1       | Epic 1, Epic 2 | Foundation (Epic 1) enables navigation; Core display (Epic 2) delivers the breakdown |
| US-2: Sort Articles by Multiple Criteria             | P2       | Epic 2         | All sorting functionality contained in article list display epic                     |
| US-3: Expand Article for Detailed Sentiment Analysis | P3       | Epic 3         | Advanced feature requiring separate expansion UI and word highlighting               |

---

## Functional Requirements to Tasks

### Epic 1: Core Detail Page & Navigation

| Requirement ID | Description                                          | Implemented In      | Status  |
| -------------- | ---------------------------------------------------- | ------------------- | ------- |
| FR-001         | Detail page accessible by clicking source cards      | Task 1.1, Task 1.2  | Planned |
| FR-002         | Display only articles from selected source/timestamp | Task 1.1            | Planned |
| FR-010         | Show source metadata in header                       | Task 1.4            | Planned |
| FR-013         | Include timestamp indicator                          | Task 1.4            | Planned |
| FR-014         | Navigate back without losing scroll position         | Task 1.3            | Planned |
| FR-019         | Deep linking support with URL parameters             | Task 1.1            | Planned |
| FR-023         | Error message when API fails (no cache)              | Task 1.5            | Planned |
| FR-024         | Public access without authentication                 | Task 1.1 (inherent) | Planned |

### Epic 2: Article List Display & Sorting

| Requirement ID | Description                                                 | Implemented In     | Status  |
| -------------- | ----------------------------------------------------------- | ------------------ | ------- |
| FR-003         | Display article metadata (title, date, score, contribution) | Task 2.1           | Planned |
| FR-004         | Support sorting by multiple criteria                        | Task 2.3, Task 2.4 | Planned |
| FR-005         | Default sort: Contribution Weight (Highest First)           | Task 2.3, Task 2.4 | Planned |
| FR-006         | Article titles clickable, open in new tab                   | Task 2.1, Task 2.5 | Planned |
| FR-007         | Articles in collapsed state by default                      | Task 2.1           | Planned |
| FR-011         | Handle empty states (no articles)                           | Task 2.6           | Planned |
| FR-015         | Disable engagement sorting for RSS sources                  | Task 2.3           | Planned |
| FR-016         | Calculate contribution percentage                           | Task 2.1           | Planned |
| FR-017         | Responsive design (320px+)                                  | Task 2.1, Task 4.5 | Planned |
| FR-018         | Preserve sort order on expand/collapse                      | Task 2.4           | Planned |
| FR-020         | Handle all-deduplicated sources                             | Task 2.6           | Planned |

### Epic 3: Article Expansion & Sentiment Analysis

| Requirement ID | Description                                             | Implemented In     | Status  |
| -------------- | ------------------------------------------------------- | ------------------ | ------- |
| FR-008         | Expand individual articles for detailed analysis        | Task 3.1, Task 3.2 | Planned |
| FR-009         | Highlight sentiment words with accessibility indicators | Task 3.3           | Planned |

### Epic 4: Edge Cases, Performance & Testing

| Requirement ID | Description                                       | Implemented In | Status  |
| -------------- | ------------------------------------------------- | -------------- | ------- |
| FR-012         | Pagination with "Load More" button (>20 articles) | Task 4.1       | Planned |
| FR-021         | Cache successfully loaded data in sessionStorage  | Task 4.2       | Planned |
| FR-022         | Display cached data with banner on API failure    | Task 4.3       | Planned |
| FR-023         | Show error with manual refresh (no cache)         | Task 4.3       | Planned |

---

## Success Criteria to Test Cases

### Measurable Outcomes to Verification

| Success Criteria                                         | Verification Method | Test Case(s)                   | Target                            |
| -------------------------------------------------------- | ------------------- | ------------------------------ | --------------------------------- |
| SC-001: Access detail page within 2 clicks               | E2E Test            | TC-1.1                         | Manual verification               |
| SC-002: Page loads within 1s for 100 articles            | Performance Test    | Perf-1                         | Automated (Playwright/Lighthouse) |
| SC-003: All sort options functional with visual feedback | E2E Test            | TC-2.1, TC-2.2, TC-2.3, TC-2.4 | Manual + Automated                |
| SC-004: Word highlights with 80% accuracy                | Manual Test         | TC-3.1                         | Manual review with test data      |
| SC-005: Expand/collapse without page reload              | E2E Test            | TC-3.2                         | Automated                         |
| SC-006: Mobile responsive (320px-768px)                  | Responsive Test     | TC-6.1                         | Manual + Visual regression        |
| SC-007: Article link opens in ≤500ms                     | Performance Test    | Perf-2                         | Automated                         |
| SC-008: Back navigation preserves scroll (95% cases)     | E2E Test            | TC-1.5                         | Automated with stats              |
| SC-009: Empty states with clear messaging                | Integration Test    | TC-1.4                         | Manual                            |
| SC-010: Contribution % sum to 100% (±1%)                 | Unit Test           | Task 4.7 (unit tests)          | Automated                         |

---

## Test Cases to Implementation Tasks

### Test Plan Coverage

| Test Case                                  | Type          | Related Task(s)              | Epic           | Priority |
| ------------------------------------------ | ------------- | ---------------------------- | -------------- | -------- |
| TC-1.1: Navigate dashboard → detail        | E2E           | Task 1.2, Task 4.8           | Epic 1, Epic 4 | P0       |
| TC-1.2: Article fields present             | Integration   | Task 2.1                     | Epic 2         | P1       |
| TC-1.3: Article link opens in new tab      | Integration   | Task 2.5                     | Epic 2         | P1       |
| TC-1.4: Empty source state                 | Integration   | Task 2.6                     | Epic 2         | P1       |
| TC-1.5: Back navigation scroll restoration | E2E           | Task 1.3, Task 4.8           | Epic 1, Epic 4 | P0       |
| TC-2.1: Default sort order                 | E2E           | Task 2.3, Task 2.4, Task 4.8 | Epic 2, Epic 4 | P1       |
| TC-2.2: Sort by sentiment score            | Integration   | Task 2.4                     | Epic 2         | P1       |
| TC-2.3: Sort by recency                    | Integration   | Task 2.4                     | Epic 2         | P1       |
| TC-2.4: Sort by engagement (social-only)   | Integration   | Task 2.4, Task 2.3           | Epic 2         | P1       |
| TC-2.5: Sort persistence on expand         | Integration   | Task 2.4                     | Epic 2         | P1       |
| TC-3.1: Expand and view highlights         | E2E           | Task 3.1, Task 3.3, Task 4.8 | Epic 3, Epic 4 | P2       |
| TC-3.2: Multiple independent expansions    | Integration   | Task 3.1                     | Epic 3         | P2       |
| TC-4.1: Pagination "Load More"             | Integration   | Task 4.1                     | Epic 4         | P3       |
| TC-4.2: Long article truncation            | Integration   | Task 3.3                     | Epic 3         | P2       |
| TC-4.3: Missing publication date           | Unit          | Task 2.4                     | Epic 2         | P1       |
| TC-4.4: All articles deduplicated          | Integration   | Task 2.6                     | Epic 2         | P1       |
| TC-4.5: API failure + cache fallback       | E2E           | Task 4.3, Task 4.8           | Epic 4         | P3       |
| TC-4.6: Neutral sentiment handling         | Integration   | Task 3.5                     | Epic 3         | P2       |
| TC-5.1: Color independence (accessibility) | Manual        | Task 3.3, Task 4.9           | Epic 3, Epic 4 | P2       |
| TC-5.2: Keyboard navigation                | Accessibility | Task 4.9                     | Epic 4         | P3       |
| TC-5.3: Screen reader                      | Accessibility | Task 4.9                     | Epic 4         | P3       |
| TC-6.1: Mobile layout (375px, 320px)       | Responsive    | Task 4.5                     | Epic 4         | P3       |
| Perf-1: Load 100 articles ≤1s              | Performance   | Task 4.6                     | Epic 4         | P3       |
| Perf-2: Open article link ≤500ms           | Performance   | Task 4.6                     | Epic 4         | P3       |
| Perf-3: Back nav scroll success ≥95%       | Performance   | Task 4.6                     | Epic 4         | P3       |

---

## Component Architecture Mapping

### Planned Components to Tasks

| Component                  | File Path                                           | Responsible For                 | Created In         | Dependencies                 |
| -------------------------- | --------------------------------------------------- | ------------------------------- | ------------------ | ---------------------------- |
| Detail Page                | `app/pages/sentiment/detail.vue`                    | Main page container, routing    | Task 1.1           | -                            |
| SourceDetailHeader         | `app/components/SourceDetailHeader.vue`             | Source metadata display         | Task 1.4           | DataTimestamp, MoodIndicator |
| ArticleList                | `app/components/ArticleList.vue`                    | Article list container, sorting | Task 2.1, Task 2.4 | ArticleSortControl           |
| ArticleSortControl         | `app/components/ArticleSortControl.vue`             | Sort dropdown/select UI         | Task 2.3           | Nuxt UI components           |
| ArticleExpandedView        | `app/components/ArticleExpandedView.vue`            | Detailed sentiment view         | Task 3.2           | -                            |
| Sentiment Word Highlighter | `app/components/ArticleExpandedView.vue` (internal) | Word highlighting logic         | Task 3.3           | -                            |

### API Endpoints to Tasks

| Endpoint                 | Method | Purpose                             | Modified/Created In | Returns                        |
| ------------------------ | ------ | ----------------------------------- | ------------------- | ------------------------------ |
| `/api/sentiment`         | GET    | Fetch articles for source/timestamp | Task 2.2 (extended) | Article[] with detailed fields |
| `/api/sentiment/sources` | GET    | Fetch source metadata               | Existing (reused)   | SourceContribution[]           |

### Data Structures

| Entity                | Defined In                          | Fields                                                                                                                                                                                       | Used By                                |
| --------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Article Detail View   | `app/types/sentiment.ts` (extended) | id, title, excerpt, pubDate, link, sourceId, rawSentimentScore, positiveWords[], negativeWords[], recencyWeight, sourceWeight, finalWeightedScore, contributionPercentage, upvotes, comments | Task 2.1, Task 3.2                     |
| Source Detail Summary | `app/types/sentiment.ts` (new)      | sourceId, sourceName, sourceType, totalArticles, deduplicatedArticles, positivePercentage, neutralPercentage, negativePercentage, fetchedAt, fetchStatus                                     | Task 1.4                               |
| Detail Page State     | Component state                     | selectedSourceId, selectedTimestamp, currentSortBy, currentSortOrder, expandedArticleIds[], currentPage, articlesPerPage                                                                     | Task 1.1, Task 2.4, Task 3.1, Task 4.1 |

---

## Edge Cases Coverage

| Edge Case                              | Handled In                     | Test Case | Status  |
| -------------------------------------- | ------------------------------ | --------- | ------- |
| Source with 100+ articles              | Task 4.1 (pagination)          | TC-4.1    | Planned |
| Articles with neutral sentiment (~0)   | Task 3.5                       | TC-4.6    | Planned |
| Long article content (>2000 chars)     | Task 3.3                       | TC-4.2    | Planned |
| Missing publication dates              | Task 2.4 (sort fallback)       | TC-4.3    | Planned |
| All articles deduplicated              | Task 2.6                       | TC-4.4    | Planned |
| Engagement metrics (RSS vs social)     | Task 2.3 (conditional UI)      | TC-2.4    | Planned |
| Sentiment calculation in progress      | Task 1.5 (loading state)       | -         | Planned |
| Articles from previous vs current hour | Task 1.1 (timestamp filtering) | -         | Planned |
| API failure scenarios                  | Task 4.3 (cache fallback)      | TC-4.5    | Planned |

---

## File Structure Reference

```
specs/004-sentiment-detail/
├── spec.md                          # Feature specification (source of truth)
├── testplan.md                      # Comprehensive test plan
├── development-plan.md              # Implementation tasks organized by epic
├── checklists/
│   └── requirements.md              # Specification quality validation
├── docs/
│   ├── mapping.md                   # This file: traceability matrix
│   ├── changelog.md                 # Feature evolution history
│   └── performance-baseline.md      # Performance measurement plan
└── tests/
    └── test-data.json               # Test fixtures for deterministic testing
```

### Implementation Files (To Be Created)

```
app/pages/
└── sentiment/
    └── detail.vue                   # Task 1.1

app/components/
├── SourceDetailHeader.vue           # Task 1.4
├── ArticleList.vue                  # Task 2.1
├── ArticleSortControl.vue           # Task 2.3
└── ArticleExpandedView.vue          # Task 3.2

app/types/
└── sentiment.ts                     # Extended in Task 2.2

server/api/
└── sentiment.get.ts                 # Extended in Task 2.2

tests/
├── unit/
│   ├── sorting.test.ts              # Task 4.7
│   ├── contribution.test.ts         # Task 4.7
│   └── highlighting.test.ts         # Task 4.7
└── e2e/
    ├── navigation.spec.ts           # Task 4.8
    ├── sorting.spec.ts              # Task 4.8
    ├── expansion.spec.ts            # Task 4.8
    └── caching.spec.ts              # Task 4.8
```

---

## Dependency Flow

### Data Flow: Dashboard → Detail Page

```
1. User clicks source card on dashboard
   └─> Task 1.2: Navigation handler

2. Browser navigates to /sentiment/detail?source=X&timestamp=Y
   └─> Task 1.1: Route parsing and validation

3. Detail page component mounts
   ├─> Task 1.4: Fetch source metadata
   │   └─> API: /api/sentiment/sources
   │
   └─> Task 2.1: Fetch articles for source
       └─> API: /api/sentiment (extended in Task 2.2)

4. Article list renders
   ├─> Task 2.4: Apply default sort (Contribution Weight)
   └─> Task 2.1: Display collapsed article cards

5. User interactions
   ├─> Task 2.3: Change sort order
   ├─> Task 3.1: Expand/collapse articles
   ├─> Task 2.5: Click article link
   └─> Task 4.1: Load more articles
```

### State Management Dependencies

```
selectedSourceId (from URL)
    └─> used by: Task 1.4, Task 2.1, Task 4.2 (cache key)

selectedTimestamp (from URL)
    └─> used by: Task 1.4, Task 2.1, Task 4.2 (cache key)

currentSortBy (component state)
    └─> drives: Task 2.4 (sorting logic)

expandedArticleIds (component state)
    └─> drives: Task 3.1 (expand/collapse UI)

currentPage (component state)
    └─> drives: Task 4.1 (pagination)
```

---

## Cross-Reference: Requirements → Code

_This section will be populated during implementation to track where each requirement is implemented in code._

### Template for Future Updates

| Requirement ID | Implementation Location          | Lines | Commit | Date |
| -------------- | -------------------------------- | ----- | ------ | ---- |
| FR-001         | `app/pages/sentiment/detail.vue` | TBD   | TBD    | TBD  |
| FR-002         | `app/pages/sentiment/detail.vue` | TBD   | TBD    | TBD  |
| ...            | ...                              | ...   | ...    | ...  |

---

## Acceptance Scenarios to Test Cases

### User Story 1 Acceptance Scenarios

| Scenario # | Description                                           | Test Case | Verification                               |
| ---------- | ----------------------------------------------------- | --------- | ------------------------------------------ |
| AS-1.1     | Click source card → detail page opens for that source | TC-1.1    | E2E test verifies URL and displayed source |
| AS-1.2     | Article list shows title, date, score, contribution   | TC-1.2    | Integration test checks all fields present |
| AS-1.3     | Article click opens in new tab                        | TC-1.3    | Integration test verifies target="\_blank" |
| AS-1.4     | Empty source shows "No articles collected"            | TC-1.4    | Integration test with empty data           |
| AS-1.5     | Back navigation preserves scroll position             | TC-1.5    | E2E test measures scroll restoration       |

### User Story 2 Acceptance Scenarios

| Scenario # | Description                          | Test Case        | Verification                                     |
| ---------- | ------------------------------------ | ---------------- | ------------------------------------------------ |
| AS-2.1     | Sort by sentiment score (high → low) | TC-2.2           | Integration test verifies order                  |
| AS-2.2     | Sort by recency (newest first)       | TC-2.3           | Integration test verifies date order             |
| AS-2.3     | Sort by engagement (social sources)  | TC-2.4           | Integration test verifies upvotes+comments order |
| AS-2.4     | Sort by contribution weight          | TC-2.1 (default) | Integration test verifies weighted score order   |
| AS-2.5     | Engagement sort disabled for RSS     | TC-2.4           | Integration test checks UI state                 |

### User Story 3 Acceptance Scenarios

| Scenario # | Description                              | Test Case      | Verification                                  |
| ---------- | ---------------------------------------- | -------------- | --------------------------------------------- |
| AS-3.1     | Expand button reveals detailed view      | TC-3.1         | E2E test clicks expand and checks content     |
| AS-3.2     | Positive/negative words highlighted      | TC-3.1, TC-5.1 | Visual + accessibility check                  |
| AS-3.3     | Contribution calculation breakdown shown | TC-3.1         | E2E test verifies formula display             |
| AS-3.4     | Collapse button returns to summary       | TC-3.2         | Integration test checks state toggle          |
| AS-3.5     | Multiple articles expand independently   | TC-3.2         | Integration test expands A and B, collapses A |

---

## Questions & Clarifications Log

_Track any clarifications made during implementation that affect mapping._

| Date       | Question                            | Answer                     | Impact                         |
| ---------- | ----------------------------------- | -------------------------- | ------------------------------ |
| 2025-11-10 | Pagination pattern?                 | "Load More" button         | Informed Task 4.1 design       |
| 2025-11-10 | Accessibility for color indicators? | Icons + underlines         | Informed Task 3.3 requirements |
| 2025-11-10 | API failure handling?               | Cached fallback with retry | Informed Task 4.3 design       |
| 2025-11-10 | Access control model?               | Public read-only           | Informed FR-024                |
| 2025-11-10 | Analytics strategy?                 | No analytics               | Simplified Epic 4 scope        |

---

## Version History

| Version | Date       | Author              | Changes                                                                     |
| ------- | ---------- | ------------------- | --------------------------------------------------------------------------- |
| 1.0     | 2025-11-11 | Documentation Agent | Initial mapping document created from spec, development plan, and test plan |

---

**Next Update**: After Epic 1 implementation, populate "Implementation Location" section with actual file paths and line numbers.
