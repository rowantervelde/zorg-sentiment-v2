## Test Plan for Sentiment Detail (feature: 004-sentiment-detail)

This document defines test strategy, test cases, acceptance criteria and test data requirements for the Sentiment Detail page described in `specs/004-sentiment-detail/spec.md`.

### Objectives
- Verify functional requirements FR-001 .. FR-024 for the detail page
- Validate user stories P1..P3 (view source-specific breakdown, sorting, expansion)
- Exercise edge cases and failure modes (pagination, caching, API failures)
- Provide clear pass/fail criteria and mapping to success criteria SC-001..SC-010

### Test scope
- In-scope: Client-side detail page UI and interactions, sorting, pagination "Load More", expansion and word highlights, deep linking, back navigation preservation, accessibility indicators, caching fallback behavior
- Out-of-scope: Server-side collection logic beyond existing API contracts, authentication, export/sharing, analytics

---

## Test approach
- Manual exploratory + scripted automated tests (unit + integration where possible)
- Device/viewport matrix (desktop, tablet, mobile) using responsive browser testing
- Network throttling for performance checks (3G/4G/unthrottled)
- Use the example test data in `specs/tests/test-data.json` for deterministic UI checks

## Test environments
- Local development (Nuxt dev) and a production-like build (nuxt build + preview)
- Browsers: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- Screen widths: 1366px (desktop), 768px (tablet), 375px (mobile)
- Network: offline (for cache fallback), slow-3G, fast-3G, 4G

---

## Test artifacts
- `specs/plans/testplan.md` (this file)
- `specs/docs/performance-baseline.md` (performance expectations & measurement plan)
- `specs/tests/test-data.json` (synthetic test data for UI testing)

---

## Test cases (organized by user story / requirement)

Note: Steps describe preconditions, actions, expected results and pass/fail criteria.

### A. User Story 1 — View Source-Specific Article Breakdown (P1, FR-001..FR-007, FR-010..FR-014)

TC-1.1: Navigate from dashboard to source detail
- Preconditions: Dashboard loaded with source cards and `specs/tests/test-data.json` served by API or mocked via composable
- Steps: Click a source card (e.g., `NU.nl Gezondheid`)
- Expected: Browser navigates to `/sentiment/detail?source=<sourceId>&timestamp=<ts>`; header shows source metadata; article list shows only articles with matching `sourceId`
- Acceptance: FR-001, FR-002, SC-001

TC-1.2: Article fields present in collapsed list
- Steps: On detail page, inspect first 5 collapsed article rows
- Expected: Each row shows title (clickable), publication date (or "Unknown date"), sentiment score (-1.0..+1.0), and contribution percentage. Contribution values sum to ~100% across all visible articles (±1% rounding)
- Acceptance: FR-003, FR-016, SC-010

TC-1.3: Article link opens in new tab
- Steps: Click article title
- Expected: OS opens new tab with `link` URL; action triggers no client-side navigation; time-to-open ≤ 500ms (measured for performance baseline)
- Acceptance: FR-006, SC-007

TC-1.4: Empty source state
- Steps: Click a source that has no articles for current timestamp
- Expected: Page shows message: "No articles collected from this source" and last successful fetch timestamp if available
- Acceptance: FR-011, SC-009

TC-1.5: Back navigation preserves dashboard scroll
- Steps: Navigate to detail page, scroll dashboard to a distinct position, click source, then click browser Back
- Expected: Dashboard scroll restores to prior position
- Acceptance: FR-014, SC-008


### B. User Story 2 — Sorting (P2, FR-004..FR-006, FR-015)

TC-2.1: Default sort order
- Steps: Load detail page
- Expected: Sort order is "Contribution Weight (Highest First)" and UI clearly indicates the selected sort
- Acceptance: FR-005, SC-003

TC-2.2: Sort by sentiment score (High→Low and Low→High)
- Steps: Select "Sentiment Score (High to Low)" and then reverse
- Expected: Article order matches expected ordering derived from `rawSentimentScore` or `finalWeightedScore` depending on product decision; verify top item has highest score
- Acceptance: FR-004

TC-2.3: Sort by recency (Newest First)
- Steps: Select "Recency (Newest First)"
- Expected: Articles ordered by `pubDate` descending; unknown dates fall to bottom
- Acceptance: FR-004, Edge-case: missing pubDate

TC-2.4: Sort by engagement (social-only)
- Steps: For social source page, select "Engagement"
- Expected: Articles ordered by `upvotes + comments` (or other specified metric); for RSS sources this option is disabled/hidden
- Acceptance: FR-004, FR-015

TC-2.5: Sort persistence on expand/collapse
- Steps: Expand an article after sorting
- Expected: Expand action does not change list order
- Acceptance: FR-018


### C. User Story 3 — Expand for Detailed Sentiment (P3, FR-008..FR-009)

TC-3.1: Expand and view word highlights
- Steps: Click expand on an article that includes `positiveWords` and `negativeWords`
- Expected: Excerpt shows highlighted words with color + icon (✓/✗) + underline. Counts of positive/negative words presented; raw sentiment score and weighting factors visible; collapse returns to summary
- Acceptance: FR-008, FR-009, SC-004

TC-3.2: Multiple independent expansions
- Steps: Expand article A and B, collapse A
- Expected: B remains expanded
- Acceptance: FR-008 (independent controls), Acceptance scenario 5


### D. Edge Cases & Failure Modes

TC-4.1: Pagination / "Load More"
- Steps: Load a source with >20 articles; click "Load More" repeatedly
- Expected: Each click appends next page of 20 articles; performance is acceptable (see perf baseline)
- Acceptance: FR-012, Edge-case 100+ articles

TC-4.2: Long article excerpt truncation
- Steps: Article with >2000 chars collapsed
- Expected: Collapsed excerpt truncated to 200 chars; expand shows full excerpt or instructs user to open link
- Acceptance: Edge-case: long content

TC-4.3: Missing publication date
- Steps: Article missing `pubDate`
- Expected: Show "Unknown date"; when sorting by recency, these items are placed at bottom
- Acceptance: Edge-case: missing pubDate

TC-4.4: All articles deduplicated
- Steps: Source with deduplicatedCount == totalArticles
- Expected: Show message: "All articles from this source were duplicates of other sources" with deduplicated count
- Acceptance: FR-020

TC-4.5: API failure + cached fallback
- Preconditions: Cached sessionStorage contains last-good data
- Steps: Simulate API returning 5xx or network offline
- Expected: Page displays cached data with banner "Viewing cached data"; background retry every 30s; if no cache exists, show "Unable to load article details" with manual refresh
- Acceptance: FR-021, FR-022, FR-023

TC-4.6: Neutral sentiment handling
- Steps: Articles with raw score ~0
- Expected: Show neutral gray indicator; contribution 0% if truly neutral (but include in list)
- Acceptance: Edge-case neutral handling


### E. Accessibility & UX tests

TC-5.1: Color independence
- Steps: Verify positive/negative highlights are accompanied by icon (✓/✗) and underline and readable by screen reader
- Expected: Highlights are accessible for colorblind users; elements have aria-labels where needed
- Acceptance: FR-009

TC-5.2: Keyboard navigation
- Steps: Use keyboard (Tab/Enter/Space) to navigate to source card, sort controls, expand/collapse, and open article links
- Expected: All interactive controls reachable and operable via keyboard
- Acceptance: Accessibility criteria

TC-5.3: Screen reader summary
- Steps: Run a screen reader over the page
- Expected: Source header, article counts, and per-article summary readable; expand reveals additional accessible description
- Acceptance: Accessibility criteria


### F. Mobile responsiveness

TC-6.1: Layout at 375px and 320px
- Steps: Load detail page in mobile viewport
- Expected: Sort controls usable, article rows readable, expand/collapse works, no horizontal overflow
- Acceptance: FR-017, SC-006


### G. Non-functional / Performance checks (see `performance-baseline.md`)

- Perf-1: Load detail page with 100 articles within 1 second (desktop, uncached)
- Perf-2: Opening an article link: ≤500ms
- Perf-3: Back navigation scroll restoration success rate ≥95%

---

## Test data and fixtures
- Use `specs/tests/test-data.json` to mock API responses for `/api/sentiment/sources` and `/api/sentiment?source=<id>&timestamp=<ts>`
- Provide variants: social source (with engagement), RSS source (no engagement), missing pubDate, long content, deduplicated sources, neutral scores, and error responses

## Automation suggestions
- Unit: Add tests around sorting logic, contribution calculation (FR-016), and pagination using Jest/Vitest
- Integration/E2E: Cypress or Playwright to drive UI scenarios: navigation, sorting, expand/collapse, accessibility checks (axe), back navigation and deep-link tests
- Performance: Use Puppeteer + Lighthouse or Playwright's tracing to measure page load and time-to-interactive for 100-article payloads

---

## Acceptance mapping (quick matrix)
- FR-001..FR-024 → Covered by TC-1.1..TC-6.1 and Edge cases
- SC-001..SC-010 → Addressed across functional and performance test cases above

---

## Risk & Mitigations
- Risk: Large article lists on low-end mobile may be slow
  - Mitigation: Ensure server returns paged data, implement virtualization if required
- Risk: Sentiment word highlighting accuracy limited by lexicon
  - Mitigation: Add acceptance tolerance and manual review for flagged items
- Risk: Browser history state may differ across browsers
  - Mitigation: Add browser-specific checks and degrade gracefully

---

## Test run checklist
- [ ] Deploy or run dev server
- [ ] Serve `specs/tests/test-data.json` via mocking proxy or wire composable to fixture
- [ ] Run automated unit tests (sorting / contribution calculation)
- [ ] Run E2E tests (Playwright/Cypress) using fixture
- [ ] Run performance baselines and record metrics


## Next steps
- Wire `specs/tests/test-data.json` into local dev server or test harness
- Create E2E test skeletons for the high-priority TC-1.1, TC-2.1, TC-3.1 and TC-4.5
- Iterate based on test results and update this plan with any new acceptance clarifications

