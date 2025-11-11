# Development Plan: Sentiment Detail Breakdown Page

**Feature**: 004-sentiment-detail  
**Created**: 2025-11-11  
**Status**: Ready for Implementation

## Overview

This development plan breaks down the implementation of the Sentiment Detail Breakdown Page into actionable tasks organized by epics. Each epic represents a logical unit of work that can be implemented and tested independently.

## Epic Structure

The implementation is organized into **4 Epics** that follow a logical sequence:

1. **Epic 1: Core Detail Page & Navigation** - Foundation (routing, basic UI, navigation)
2. **Epic 2: Article List Display & Sorting** - Primary functionality (article display, sort controls)
3. **Epic 3: Article Expansion & Sentiment Analysis** - Advanced features (detailed sentiment view)
4. **Epic 4: Edge Cases, Performance & Testing** - Quality assurance (pagination, caching, performance)

---

## Epic 1: Core Detail Page & Navigation

**Goal**: Establish the foundational routing, page structure, and navigation flow from dashboard to detail page.

**Priority**: P0 (Must have - foundation for all other work)

**Estimated Effort**: 5-8 hours

### Tasks

#### Task 1.1: Create Detail Page Route and Component
**Description**: Set up the detail page route in Nuxt with query parameters for source and timestamp. Create the base Vue component structure.

**Acceptance Criteria**:
- Route `/sentiment/detail` accessible with query params `?source=<sourceId>&timestamp=<ts>`
- Base page component created at `app/pages/sentiment/detail.vue`
- Page renders without errors when accessed directly or via navigation
- URL parameters (source, timestamp) are parsed and available to component

**Technical Notes**:
- Use Nuxt 4's `pages/` directory structure
- Extract query params using `useRoute()` composable
- Validate that sourceId and timestamp are present

**Related Requirements**: FR-001, FR-019

---

#### Task 1.2: Add Source Card Click Navigation
**Description**: Modify dashboard source cards to navigate to detail page on click, passing source ID and current timestamp.

**Acceptance Criteria**:
- Clicking any source card on dashboard navigates to detail page
- Source ID and timestamp passed correctly in URL
- Navigation preserves dashboard state for back button
- Visual feedback on card hover/click (cursor pointer, etc.)

**Technical Notes**:
- Update source card component in `app/components/` or dashboard page
- Use `navigateTo()` or `<NuxtLink>` with query params
- Test with multiple sources

**Related Requirements**: FR-001, SC-001

---

#### Task 1.3: Implement Back Navigation with Scroll Restoration
**Description**: Enable users to navigate back to dashboard from detail page while preserving scroll position.

**Acceptance Criteria**:
- Back button or back link on detail page returns to dashboard
- Dashboard scroll position restored to pre-navigation state
- Works in 95% of browser sessions (test across Chrome, Firefox, Safari, Edge)
- Graceful degradation if browser history API unavailable

**Technical Notes**:
- Use browser history API with `history.scrollRestoration = 'manual'`
- Store scroll position before navigation using `sessionStorage` or Vue state
- Restore on page mount/activation
- Consider using Nuxt's `keepalive` for dashboard page

**Related Requirements**: FR-014, SC-008

---

#### Task 1.4: Create Source Detail Header Component
**Description**: Build the header component that displays source metadata (name, total articles, sentiment breakdown).

**Acceptance Criteria**:
- Header shows source name, total article count, deduplicated count
- Displays sentiment breakdown: positive %, neutral %, negative %
- Shows timestamp of the current sentiment data point
- Responsive layout for mobile (320px+) and desktop
- Loading state while fetching metadata

**Technical Notes**:
- Create new component: `app/components/SourceDetailHeader.vue`
- Fetch source metadata from existing `/api/sentiment/sources` endpoint
- Display percentages with visual indicators (colors/icons)
- Reuse `DataTimestamp` component for timestamp display

**Related Requirements**: FR-010, FR-013, FR-017

---

#### Task 1.5: Add Loading States and Error Handling
**Description**: Implement loading skeletons and error messages for detail page initial load.

**Acceptance Criteria**:
- Loading skeleton displayed while fetching article data
- Error message shown if API fails and no cached data exists
- "Unable to load article details" with manual refresh button
- Loading skeleton matches expected layout structure

**Technical Notes**:
- Use Nuxt UI skeleton components
- Handle HTTP errors from API calls
- Provide user-friendly error messages
- Test with network throttling/offline mode

**Related Requirements**: FR-023, Edge Case: API failures

---

### Epic 1 Testing Requirements

**From Test Plan**:
- TC-1.1: Navigate from dashboard to source detail
- TC-1.4: Empty source state
- TC-1.5: Back navigation preserves dashboard scroll

**Manual Testing**:
- Verify navigation flow on multiple browsers
- Test scroll restoration with various scroll positions
- Verify deep linking works (direct URL access)

---

## Epic 2: Article List Display & Sorting

**Goal**: Display articles in a list format with sorting capabilities by multiple criteria.

**Priority**: P1 (Core user value - view article breakdown)

**Estimated Effort**: 8-12 hours

### Tasks

#### Task 2.1: Create Article List Component
**Description**: Build the main article list component that displays articles in collapsed state with core information.

**Acceptance Criteria**:
- Articles displayed as a list with each showing: title, publication date, sentiment score, contribution %
- Title is a clickable link that opens source URL in new tab
- Publication date formatted appropriately (or "Unknown date" if missing)
- Sentiment score displayed with color indicator and mood icon
- Contribution percentage calculated correctly (sums to ~100% for source)
- Responsive layout for all screen sizes

**Technical Notes**:
- Create `app/components/ArticleList.vue`
- Fetch articles from `/api/sentiment?source=<id>&timestamp=<ts>`
- Calculate contribution % client-side: (article weighted score / sum of all weighted scores) × 100
- Reuse `MoodIndicator` component for sentiment display
- Format dates using Intl.DateTimeFormat or library

**Related Requirements**: FR-003, FR-006, FR-007, FR-016, FR-017

---

#### Task 2.2: Extend API to Support Article-Level Details
**Description**: Enhance existing sentiment API endpoints to return article-level data with all required fields for detail view.

**Acceptance Criteria**:
- API returns articles with fields: title, content excerpt, pubDate, link, sourceId
- API includes sentiment data: rawSentimentScore, positiveWords[], negativeWords[]
- API includes weighting: recencyWeight, sourceWeight, finalWeightedScore
- API includes engagement metrics for social sources: upvotes, comments (optional)
- Response structure documented and tested
- No breaking changes to existing API consumers

**Technical Notes**:
- Modify `server/api/sentiment.get.ts` or create new endpoint
- Ensure sentiment analyzer stores word-level attribution
- Include deduplication info if needed
- Consider caching strategy for large article sets
- Validate against existing storage schema

**Related Requirements**: FR-003, Key Entities: Article Detail View

---

#### Task 2.3: Implement Sort Control Component
**Description**: Create a sort control dropdown/select that allows users to change article ordering.

**Acceptance Criteria**:
- Sort options available: Contribution Weight, Sentiment Score (High/Low), Recency, Engagement
- Default sort is "Contribution Weight (Highest First)"
- Visual indicator shows current active sort
- Sort selection persists within session (but not across sessions)
- "Engagement" option disabled/hidden for RSS sources
- Accessible keyboard navigation and screen reader support

**Technical Notes**:
- Create `app/components/ArticleSortControl.vue`
- Use Vue reactive state for current sort option
- Emit events to parent for sort changes
- Use Nuxt UI dropdown/select component
- Store sort preference in component state (not localStorage)

**Related Requirements**: FR-004, FR-005, FR-015, SC-003

---

#### Task 2.4: Implement Sorting Logic in Article List
**Description**: Add reactive sorting behavior to article list based on selected sort option.

**Acceptance Criteria**:
- Articles reorder immediately when sort option changes
- Sort algorithms correct for each option:
  - Contribution: finalWeightedScore descending
  - Sentiment High→Low: rawSentimentScore descending
  - Sentiment Low→High: rawSentimentScore ascending
  - Recency: pubDate descending (unknown dates at bottom)
  - Engagement: (upvotes + comments) descending
- Sorting does not cause page reload or API call
- Sort order preserved when expanding/collapsing articles
- Performance acceptable with 100 articles

**Technical Notes**:
- Use computed property for sorted article list
- Implement comparison functions for each sort type
- Handle missing/null values gracefully
- Consider memoization for performance
- Test with edge cases (all neutral scores, missing dates, etc.)

**Related Requirements**: FR-004, FR-018, SC-003

---

#### Task 2.5: Add Article Link Click Handling
**Description**: Ensure article title links open correctly in new tabs with proper security attributes.

**Acceptance Criteria**:
- Clicking article title opens source URL in new tab
- Links have `target="_blank"` and `rel="noopener noreferrer"`
- No client-side navigation triggered
- Time-to-open ≤500ms (measured for performance baseline)
- Works on all browsers and devices

**Technical Notes**:
- Use standard `<a>` tag with appropriate attributes
- No custom click handlers needed
- Test cross-origin URLs
- Verify security attributes prevent tab-napping

**Related Requirements**: FR-006, SC-007

---

#### Task 2.6: Handle Empty and Error States for Article List
**Description**: Display appropriate messages when no articles exist or API fails.

**Acceptance Criteria**:
- "No articles collected from this source" shown when article count = 0
- Last successful fetch timestamp displayed with empty state
- "All articles from this source were duplicates" shown when all deduplicated
- Error state with retry button if API fails without cache
- Messages are clear and actionable

**Technical Notes**:
- Check article array length and deduplication count
- Use conditional rendering in template
- Integrate with caching logic (Task 4.3)
- Test with various edge case scenarios

**Related Requirements**: FR-011, FR-020, FR-023, SC-009

---

### Epic 2 Testing Requirements

**From Test Plan**:
- TC-1.2: Article fields present in collapsed list
- TC-1.3: Article link opens in new tab
- TC-2.1: Default sort order
- TC-2.2: Sort by sentiment score
- TC-2.3: Sort by recency
- TC-2.4: Sort by engagement (social-only)
- TC-2.5: Sort persistence on expand/collapse
- TC-4.3: Missing publication date

**Performance**:
- Verify SC-002: Page loads within 1s for 100 articles

---

## Epic 3: Article Expansion & Sentiment Analysis

**Goal**: Enable users to expand articles to see detailed sentiment analysis with word highlights.

**Priority**: P2 (Enhanced transparency and trust)

**Estimated Effort**: 10-14 hours

### Tasks

#### Task 3.1: Add Expand/Collapse Toggle to Article Cards
**Description**: Add expand/collapse buttons to each article card with state management.

**Acceptance Criteria**:
- Each article has expand button in collapsed state
- Clicking expand reveals detailed view
- Clicking collapse returns to summary view
- Multiple articles can be expanded independently
- Expand/collapse does not change list order or trigger API call
- Smooth animation/transition between states
- Accessible keyboard controls (Space/Enter)

**Technical Notes**:
- Track expanded state per article (use article ID)
- Store in component state: `expandedArticleIds: Set<string>`
- Use Vue transitions for smooth expand/collapse
- Ensure ARIA attributes for screen readers (`aria-expanded`)

**Related Requirements**: FR-008, SC-005

---

#### Task 3.2: Create Expanded Article View Component
**Description**: Build the expanded view component showing detailed sentiment analysis.

**Acceptance Criteria**:
- Displays article excerpt with sentiment word highlights
- Shows positive and negative word counts
- Displays raw sentiment score
- Shows weighting factors: recency weight, source weight, final weighted score
- Shows contribution calculation breakdown
- All information clearly labeled and formatted
- Responsive layout for mobile and desktop

**Technical Notes**:
- Create `app/components/ArticleExpandedView.vue`
- Receive article data as props
- Use computed properties for word counts
- Format numbers appropriately (2 decimal places for scores)
- Consider using tables or definition lists for clarity

**Related Requirements**: FR-008, FR-009, SC-004

---

#### Task 3.3: Implement Sentiment Word Highlighting
**Description**: Highlight positive and negative words in article excerpt with color, icons, and underlines for accessibility.

**Acceptance Criteria**:
- Positive words: green color + ✓ icon + underline
- Negative words: red color + ✗ icon + underline
- Neutral words: no highlighting
- Colors meet WCAG AA contrast requirements
- Icons and underlines provide color-independent indicators
- Screen reader accessible (aria-labels or visually-hidden text)
- Highlighting works with multi-word phrases if supported
- Truncate very long excerpts (>2000 chars) to first 200 chars

**Technical Notes**:
- Parse `positiveWords[]` and `negativeWords[]` from article data
- Implement word matching algorithm (case-insensitive, handle punctuation)
- Use `<mark>` or `<span>` with CSS classes for highlights
- Add icon characters (✓/✗) via CSS `::before` or inline
- Test with Dutch text and special characters
- Consider edge cases: overlapping words, partial matches

**Related Requirements**: FR-009, SC-004, Edge Case: long content

---

#### Task 3.4: Display Contribution Calculation Breakdown
**Description**: Show the detailed calculation of how an article's sentiment contributes to the overall score.

**Acceptance Criteria**:
- Display: Raw sentiment score → Recency weight applied → Source weight applied → Final weighted score
- Show contribution percentage relative to source total
- Clear labels and formatting (e.g., "Raw: 0.75 × Recency: 0.9 × Source: 1.0 = 0.675")
- Tooltip or help text explaining each weighting factor
- Numbers formatted consistently

**Technical Notes**:
- Extract weighting values from article data
- Create visual breakdown (could use table, list, or flow diagram)
- Consider using formulas or arrows to show calculation flow
- Ensure user understands how weights affect final score

**Related Requirements**: FR-008, FR-009

---

#### Task 3.5: Handle Edge Cases in Expanded View
**Description**: Manage edge cases like missing data, neutral sentiment, long excerpts, and no word attribution.

**Acceptance Criteria**:
- Articles with no positiveWords/negativeWords show "No specific words identified"
- Neutral articles (score ~0) display appropriately (gray indicator)
- Long excerpts truncated with "Read full article at source" link
- Missing pubDate handled gracefully in expanded view
- Works correctly even when some data fields are null/undefined

**Technical Notes**:
- Add null checks and fallback values
- Test with synthetic edge case data
- Ensure UI doesn't break with missing fields
- Provide helpful messages for missing data

**Related Requirements**: FR-008, FR-009, Edge Cases

---

### Epic 3 Testing Requirements

**From Test Plan**:
- TC-3.1: Expand and view word highlights
- TC-3.2: Multiple independent expansions
- TC-4.2: Long article excerpt truncation
- TC-4.6: Neutral sentiment handling
- TC-5.1: Color independence (accessibility)
- TC-5.2: Keyboard navigation
- TC-5.3: Screen reader summary

**Manual Testing**:
- Test word highlighting accuracy with various article contents
- Verify accessibility with screen readers (NVDA, JAWS, VoiceOver)
- Test on colorblind simulation tools

---

## Epic 4: Edge Cases, Performance & Testing

**Goal**: Implement pagination, caching, performance optimizations, and comprehensive testing.

**Priority**: P3 (Quality and scalability)

**Estimated Effort**: 12-16 hours

### Tasks

#### Task 4.1: Implement Pagination with "Load More" Button
**Description**: Add pagination for sources with >20 articles using a "Load More" button.

**Acceptance Criteria**:
- Articles displayed in pages of 20
- "Load More" button shown when more articles available
- Button disabled/hidden when all articles loaded
- Loading indicator shown while fetching next page
- Append next 20 articles without replacing existing ones
- Maintains sort order when loading more
- Performance acceptable: render new page in ≤250ms
- Works with all sort options

**Technical Notes**:
- Track current page and total article count
- Use Vue reactive state for pagination
- Slice article array or make paginated API calls
- Consider virtual scrolling for very large lists (100+ articles)
- Test with 100-article dataset

**Related Requirements**: FR-012, Edge Case: 100+ articles, PB-004

---

#### Task 4.2: Implement Session Storage Caching
**Description**: Cache successfully loaded article data in browser sessionStorage for fallback during API failures.

**Acceptance Criteria**:
- Successful API responses cached in sessionStorage
- Cache keyed by source ID and timestamp
- Cache checked on API failure before showing error
- Cache cleared on session end (browser close)
- Cache size reasonable (no memory issues with large datasets)
- Works across all supported browsers

**Technical Notes**:
- Use `sessionStorage.setItem()` and `.getItem()`
- Serialize article data as JSON
- Implement cache invalidation logic
- Handle storage quota exceeded errors gracefully
- Test cache lifecycle (set, get, clear)

**Related Requirements**: FR-021

---

#### Task 4.3: Implement Cache Fallback with Retry Logic
**Description**: When API fails, display cached data with a banner and retry in background.

**Acceptance Criteria**:
- On API failure, check for cached data
- If cache exists, display with "Viewing cached data" banner at top
- Banner visible and dismissible
- Retry API call every 30 seconds in background
- On successful retry, remove banner and update data
- If no cache exists, show error message with manual refresh button
- Loading states managed correctly during retry

**Technical Notes**:
- Use Vue reactive state for cache fallback mode
- Implement background retry with `setInterval`
- Clear interval on successful fetch or component unmount
- Show visual banner component (toast or inline banner)
- Test with network offline/throttling

**Related Requirements**: FR-022, FR-023, TC-4.5

---

#### Task 4.4: Add Deep Linking Support
**Description**: Ensure detail page URLs with source and timestamp can be bookmarked and shared.

**Acceptance Criteria**:
- Direct navigation to `/sentiment/detail?source=X&timestamp=Y` works
- Page loads correct source and timestamp from URL
- URL is human-readable and shareable
- Invalid source IDs or timestamps show appropriate error
- Back/forward browser navigation works correctly

**Technical Notes**:
- Parse query params on component mount
- Validate sourceId and timestamp format
- Handle missing or invalid params gracefully
- Test with various URL formats

**Related Requirements**: FR-019

---

#### Task 4.5: Mobile Responsiveness Optimization
**Description**: Ensure all detail page components are fully functional and readable on mobile devices (320px+).

**Acceptance Criteria**:
- Layout works at 320px, 375px, 768px, and larger widths
- Sort controls usable on mobile (dropdowns, buttons appropriately sized)
- Article cards readable without horizontal scroll
- Expand/collapse works on touch devices
- Text readable without zooming (minimum 14px font size)
- No layout breaks or overlapping content
- Touch targets meet accessibility guidelines (44x44px minimum)

**Technical Notes**:
- Use responsive CSS (Tailwind utilities from Nuxt UI)
- Test with browser dev tools responsive mode
- Test on real devices if available
- Use mobile-first approach for styling
- Consider stacking layouts on narrow screens

**Related Requirements**: FR-017, SC-006, TC-6.1

---

#### Task 4.6: Performance Testing and Optimization
**Description**: Measure and optimize page load times and interaction performance against baseline targets.

**Acceptance Criteria**:
- Page loads within 1s for 100 articles (desktop, uncached) - PB-001
- Article link opens in ≤500ms - PB-002
- "Load More" renders in ≤250ms - PB-004
- First meaningful paint <1.5s on mobile 4G - PB-005
- No significant memory leaks with expand/collapse cycles
- Lighthouse performance score ≥80

**Technical Notes**:
- Use Playwright or Lighthouse for measurement
- Profile with Chrome DevTools Performance tab
- Optimize render performance: virtual scrolling, lazy loading images
- Consider code splitting for detail page components
- Run performance tests with `specs/tests/test-data.json`
- Document results in `specs/docs/perf-results/`

**Related Requirements**: SC-002, SC-007, Performance Baseline document

---

#### Task 4.7: Write Unit Tests for Core Logic
**Description**: Create unit tests for sorting, contribution calculation, and helper functions.

**Acceptance Criteria**:
- Unit tests for article sorting functions (all sort types)
- Unit tests for contribution percentage calculation
- Unit tests for word highlighting logic
- Unit tests for date formatting and edge cases
- Test coverage ≥80% for new utility functions
- All tests passing before merge

**Technical Notes**:
- Use Vitest (already in Nuxt ecosystem)
- Create test files in `tests/` or colocated with components
- Mock API responses and data structures
- Test edge cases: null values, empty arrays, extreme scores
- Use `specs/tests/test-data.json` for test fixtures

**Related Requirements**: Test Plan - Automation suggestions

---

#### Task 4.8: Write E2E Tests for User Flows
**Description**: Create end-to-end tests covering primary user scenarios from test plan.

**Acceptance Criteria**:
- E2E test: TC-1.1 (navigate from dashboard to detail)
- E2E test: TC-2.1 (default sort order)
- E2E test: TC-3.1 (expand and view highlights)
- E2E test: TC-4.5 (API failure + cache fallback)
- E2E test: TC-1.5 (back navigation scroll restoration)
- Tests run in CI environment
- All tests passing before merge

**Technical Notes**:
- Use Playwright or Cypress
- Set up test fixtures with `specs/tests/test-data.json`
- Mock API endpoints for deterministic testing
- Test across multiple browsers (Chrome, Firefox)
- Add accessibility tests with axe

**Related Requirements**: Test Plan - TC-1.1, TC-2.1, TC-3.1, TC-4.5, TC-5.1, TC-5.2

---

#### Task 4.9: Accessibility Audit and Fixes
**Description**: Run accessibility audit and fix any issues to meet WCAG AA standards.

**Acceptance Criteria**:
- No critical or serious accessibility issues in axe audit
- All interactive elements keyboard accessible
- Screen reader can navigate and understand all content
- Color contrast meets WCAA AA (4.5:1 for text)
- Sentiment indicators have non-color alternatives (icons, underlines)
- ARIA labels correct and helpful
- Focus indicators visible and clear

**Technical Notes**:
- Use axe DevTools or Lighthouse accessibility audit
- Test with screen readers (NVDA on Windows, VoiceOver on Mac)
- Add ARIA attributes where needed (`aria-label`, `aria-expanded`, etc.)
- Ensure semantic HTML (headings, lists, landmarks)
- Fix any issues found in TC-5.1, TC-5.2, TC-5.3

**Related Requirements**: FR-009, TC-5.1, TC-5.2, TC-5.3

---

#### Task 4.10: Create Test Data Fixture
**Description**: Create comprehensive test data file with edge cases for consistent testing.

**Acceptance Criteria**:
- File created at `specs/tests/test-data.json`
- Includes multiple sources (RSS and social)
- Includes articles with various sentiment scores (positive, negative, neutral)
- Includes edge cases: missing dates, long content, no words, duplicates
- Includes both small (10 articles) and large (100 articles) datasets
- Data structure matches API response format
- Documentation on how to use fixture in tests

**Technical Notes**:
- Follow existing API schema from Features 002-003
- Create realistic Dutch healthcare article data
- Ensure sentiment scores are realistic
- Include all fields needed by detail view
- Version control the fixture file

**Related Requirements**: Test Plan - Test data and fixtures

---

### Epic 4 Testing Requirements

**From Test Plan**:
- TC-4.1: Pagination / "Load More"
- TC-4.4: All articles deduplicated
- TC-4.5: API failure + cached fallback
- TC-6.1: Layout at 375px and 320px
- Perf-1, Perf-2, Perf-3: Performance baselines

**Integration Testing**:
- Full user flow: dashboard → detail → sort → expand → back
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Network conditions testing (offline, slow 3G, 4G)

---

## Testing Strategy Summary

### Unit Tests (Task 4.7)
- Sorting algorithms
- Contribution calculations
- Word highlighting logic
- Date formatting
- Edge case handling

### Integration Tests (Epic 1-3 tasks)
- Component interactions
- API integration
- State management
- Navigation flows

### E2E Tests (Task 4.8)
- Complete user journeys
- Cross-browser compatibility
- Accessibility compliance
- Performance benchmarks

### Manual Testing
- User acceptance testing
- Exploratory testing
- Visual regression testing
- Real device testing

---

## Implementation Sequence

**Phase 1: Foundation** (Epic 1)
- Week 1: Tasks 1.1 - 1.5
- Deliverable: Working detail page route with navigation and basic structure

**Phase 2: Core Functionality** (Epic 2)
- Week 2-3: Tasks 2.1 - 2.6
- Deliverable: Article list with sorting and all data display

**Phase 3: Advanced Features** (Epic 3)
- Week 3-4: Tasks 3.1 - 3.5
- Deliverable: Article expansion with sentiment analysis

**Phase 4: Quality Assurance** (Epic 4)
- Week 4-5: Tasks 4.1 - 4.10
- Deliverable: Production-ready feature with tests and optimizations

**Total Estimated Duration**: 5 weeks (with 1 developer)

---

## Dependencies and Risks

### Dependencies
- Existing sentiment API endpoints (Features 002-003)
- Sentiment analyzer word-level attribution data
- Browser sessionStorage support
- Netlify Blob Storage (for article data persistence)

### Risks & Mitigations
- **Risk**: Sentiment word attribution not available in current data
  - **Mitigation**: Verify data structure early (Epic 1), modify analyzer if needed
  
- **Risk**: Performance issues with 100+ articles
  - **Mitigation**: Implement pagination (Task 4.1), consider virtualization
  
- **Risk**: Browser compatibility issues with history API
  - **Mitigation**: Progressive enhancement, fallback for scroll restoration
  
- **Risk**: Mobile layout challenges with expanded views
  - **Mitigation**: Mobile-first design, early testing on real devices

---

## Success Metrics

### Definition of Done (per Epic)
- All tasks completed with passing tests
- Code reviewed and approved
- No critical accessibility issues
- Performance targets met
- Documentation updated

### Overall Feature Success
- All 24 functional requirements met
- All 10 success criteria achieved
- Test plan executed with ≥95% pass rate
- No critical bugs in production
- User feedback positive (if collected)

---

## Next Steps

1. ✅ Review and approve development plan
2. ⏳ Commit and push all local changes to GitHub repository
3. ⏳ Create GitHub Issues for all tasks
4. ⏳ Create GitHub Epics and attach tasks as sub-issues
5. ⏳ Assign GitHub Copilot Coding Agent to Epic 1
6. ⏳ Monitor progress and iterate

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-11  
**Author**: Development Agent (GitHub Copilot)
