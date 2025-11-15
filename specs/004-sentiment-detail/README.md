# Feature 004: Sentiment Detail Breakdown Page

**Status**: Planning Phase Complete ✅  
**Branch**: `004-sentiment-detail`  
**Created**: 2025-11-10  
**Last Updated**: 2025-11-11

## Quick Links

- 📋 [Feature Specification](./spec.md) - Requirements and user stories
- 🗺️ [Development Plan](./development-plan.md) - Implementation tasks and epics
- 🧪 [Test Plan](./testplan.md) - Testing strategy and test cases
- 📊 [Performance Baseline](./docs/performance-baseline.md) - Performance targets
- 🔗 [Traceability Mapping](./docs/mapping.md) - Requirements → Code → Tests
- 📝 [Changelog](./docs/changelog.md) - Feature history and decisions
- 📚 [Documentation README](./docs/README.md) - Documentation guide

---

## Feature Overview

### User Request

> "I want to see more details about the information that is used to determine the sentiment. I need a breakdown of the score. Make a detail page where I can see which articles are most valuable to the sentiment score."

### What We're Building

A **detail page** that provides transparency into sentiment calculation by showing:

- Individual articles contributing to a source's sentiment score
- Each article's sentiment score and contribution percentage
- Sortable article list (by contribution, sentiment, recency, engagement)
- Expandable detailed view with sentiment word highlighting
- Calculation breakdown showing how weights affect scores

### Why It Matters

**Transparency**: Users can see exactly which articles drive sentiment scores  
**Trust**: Understanding calculation builds confidence in results  
**Exploration**: Multiple sort options enable different analytical perspectives  
**Education**: Word highlighting teaches sentiment analysis concepts

---

## Feature Scope

### In Scope ✅

**User Story 1 (P1)**: View Source-Specific Article Breakdown

- Click source card → see all articles from that source
- Display title, date, sentiment score, contribution % per article
- Click article → open in new tab
- Navigate back without losing scroll position

**User Story 2 (P2)**: Sort Articles by Multiple Criteria

- Sort by: Contribution Weight, Sentiment Score, Recency, Engagement
- Default: Contribution Weight (highest impact first)
- Engagement sort only for social sources (Reddit)

**User Story 3 (P3)**: Expand Article for Detailed Sentiment Analysis

- Expand button reveals: word highlights, positive/negative counts, raw scores
- Contribution calculation breakdown: raw → recency weight → source weight → final
- Accessibility: color + icons (✓/✗) + underlines for sentiment words

### Out of Scope ❌

- Cross-source detail view (all sources combined)
- Article editing or flagging
- User comments or annotations
- Historical tracking (score changes over time)
- Export functionality (CSV/PDF)
- Advanced filtering (beyond sorting)
- Analytics tracking (privacy-first approach)

---

## Documentation Structure

```
specs/004-sentiment-detail/
├── README.md                        # This file: Feature overview
├── spec.md                          # 📋 Requirements (source of truth)
├── development-plan.md              # 🗺️ Implementation (4 epics, 34 tasks)
├── testplan.md                      # 🧪 Testing strategy (21+ test cases)
│
├── checklists/
│   └── requirements.md              # ✅ Specification validation
│
├── docs/
│   ├── README.md                    # Documentation guide
│   ├── mapping.md                   # 🔗 Traceability matrix
│   ├── changelog.md                 # 📝 Feature history
│   └── performance-baseline.md      # 📊 Performance targets
│
└── tests/
    └── test-data.json               # Test fixtures (6 sample articles)
```

---

## Implementation Plan

### 4 Epics, 34 Tasks, 5 Weeks

#### Epic 1: Core Detail Page & Navigation (5-8 hours)

**Foundation**: Routing, basic UI, navigation, scroll restoration

- Task 1.1: Create detail page route and component
- Task 1.2: Add source card click navigation
- Task 1.3: Implement back navigation with scroll restoration
- Task 1.4: Create source detail header component
- Task 1.5: Add loading states and error handling

#### Epic 2: Article List Display & Sorting (8-12 hours)

**Primary functionality**: Article display, sort controls, API extensions

- Task 2.1: Create article list component
- Task 2.2: Extend API to support article-level details
- Task 2.3: Implement sort control component
- Task 2.4: Implement sorting logic in article list
- Task 2.5: Add article link click handling
- Task 2.6: Handle empty and error states

#### Epic 3: Article Expansion & Sentiment Analysis (10-14 hours)

**Advanced features**: Detailed sentiment view, word highlighting

- Task 3.1: Add expand/collapse toggle to article cards
- Task 3.2: Create expanded article view component
- Task 3.3: Implement sentiment word highlighting
- Task 3.4: Display contribution calculation breakdown
- Task 3.5: Handle edge cases in expanded view

#### Epic 4: Edge Cases, Performance & Testing (12-16 hours)

**Quality assurance**: Pagination, caching, performance, tests

- Task 4.1: Implement pagination with "Load More" button
- Task 4.2: Implement session storage caching
- Task 4.3: Implement cache fallback with retry logic
- Task 4.4: Add deep linking support
- Task 4.5: Mobile responsiveness optimization
- Task 4.6: Performance testing and optimization
- Task 4.7: Write unit tests for core logic
- Task 4.8: Write E2E tests for user flows
- Task 4.9: Accessibility audit and fixes
- Task 4.10: Create test data fixture

**See**: [development-plan.md](./development-plan.md) for full task details

---

## Requirements Summary

### 24 Functional Requirements

Organized by epic:

**Epic 1** (FR-001, FR-002, FR-010, FR-013, FR-014, FR-019, FR-023, FR-024):

- Detail page accessible by clicking source cards
- Display only articles from selected source/timestamp
- Source metadata header with timestamp
- Back navigation preserves scroll position
- Deep linking support with URL parameters
- Public access without authentication

**Epic 2** (FR-003 to FR-007, FR-011, FR-015 to FR-018, FR-020):

- Display article metadata (title, date, score, contribution)
- Support sorting by 4 criteria
- Default sort: Contribution Weight
- Article titles clickable, open in new tab
- Articles collapsed by default
- Handle empty states and edge cases
- Responsive design (320px+)

**Epic 3** (FR-008, FR-009):

- Expand individual articles for detailed analysis
- Highlight sentiment words with accessibility indicators

**Epic 4** (FR-012, FR-021, FR-022, FR-023):

- Pagination with "Load More" button (>20 articles)
- Cache successfully loaded data in sessionStorage
- Display cached data with banner on API failure
- Error message with manual refresh (no cache)

**See**: [spec.md](./spec.md) for complete requirements

---

## Testing Strategy

### Test Coverage

**21 Functional Test Cases**:

- Navigation & state management: TC-1.1 to TC-1.5
- Sorting & display: TC-2.1 to TC-2.5
- Expansion & analysis: TC-3.1 to TC-3.2
- Edge cases: TC-4.1 to TC-4.6
- Accessibility: TC-5.1 to TC-5.3
- Mobile: TC-6.1

**3 Performance Baselines**:

- Perf-1: Page load ≤1s (100 articles, desktop)
- Perf-2: Article open ≤500ms
- Perf-3: Back navigation scroll restoration ≥95%

### Test Automation

**Unit Tests** (Task 4.7):

- Sorting algorithms
- Contribution calculations
- Word highlighting logic
- Date formatting
- **Target**: ≥80% coverage

**E2E Tests** (Task 4.8):

- Navigation flow (TC-1.1, TC-1.5)
- Default sort (TC-2.1)
- Expansion (TC-3.1)
- Cache fallback (TC-4.5)
- **Tool**: Playwright or Cypress

**Accessibility Tests** (Task 4.9):

- axe audit (no critical issues)
- Keyboard navigation
- Screen reader compatibility
- WCAG AA compliance

**Performance Tests** (Task 4.6):

- Lighthouse scoring (≥80)
- Load time measurement
- Memory profiling

**See**: [testplan.md](./testplan.md) for complete test plan

---

## Performance Targets

| Metric                                      | Target       | Measurement            |
| ------------------------------------------- | ------------ | ---------------------- |
| Page load (100 articles, desktop, uncached) | ≤1s          | Lighthouse, Playwright |
| Article link open                           | ≤500ms       | Browser DevTools       |
| "Load More" render                          | ≤250ms       | Performance API        |
| Mobile FMP (4G)                             | <1.5s        | Lighthouse mobile      |
| Back navigation scroll restoration          | ≥95% success | E2E test stats         |
| Lighthouse performance score                | ≥80          | Lighthouse             |

**See**: [docs/performance-baseline.md](./docs/performance-baseline.md) for measurement plan

---

## Key Technical Decisions

### 1. Pagination Pattern: "Load More" Button

**Why**: Explicit user action, predictable UX, better accessibility than infinite scroll

### 2. Accessibility: Triple-Redundancy for Sentiment Indicators

**Why**: Color + Icons (✓/✗) + Underlines ensures accessibility for colorblind users and screen readers

### 3. API Failure Handling: Cached Fallback with Retry

**Why**: Balances reliability with freshness, better UX than immediate error

### 4. Access Control: Public Read-Only

**Why**: Consistent with public dashboard, no authentication complexity

### 5. Analytics: No Tracking

**Why**: Privacy-first approach, reduced complexity, avoid GDPR requirements

**See**: [docs/changelog.md](./docs/changelog.md) Decision Log for full rationale

---

## Dependencies

### Internal (Existing Features)

- **Feature 002** (Multi-Source Sentiment): Article interface, SourceContribution tracking
- **Feature 003** (Reddit Integration): Engagement metrics (upvotes, comments)
- **Sentiment Analyzer**: Word-level attribution (positive/negative words)
- **Dashboard Components**: MoodIndicator, DataTimestamp (reused)

### External (Technology Stack)

- **Nuxt 4.1.3**: Routing, pages, server engine
- **Vue 3.5**: Reactive UI, components
- **Nuxt UI v4.1**: Component library (dropdowns, skeletons, etc.)
- **Netlify Blob Storage**: Article data persistence
- **Browser APIs**: sessionStorage (caching), history (scroll restoration)

---

## Success Criteria (10 Measurable Outcomes)

- ✅ **SC-001**: Access detail page within 2 clicks
- ✅ **SC-002**: Page loads within 1s for 100 articles
- ✅ **SC-003**: All sort options functional with visual feedback
- ✅ **SC-004**: Word highlights with 80% accuracy
- ✅ **SC-005**: Expand/collapse without page reload
- ✅ **SC-006**: Mobile responsive (320px-768px)
- ✅ **SC-007**: Article link opens in ≤500ms
- ✅ **SC-008**: Back navigation preserves scroll (95% cases)
- ✅ **SC-009**: Empty states with clear messaging
- ✅ **SC-010**: Contribution % sum to 100% (±1%)

**See**: [spec.md](./spec.md) Success Criteria section

---

## Component Architecture

### New Components (6)

| Component           | File                                     | Purpose                 |
| ------------------- | ---------------------------------------- | ----------------------- |
| Detail Page         | `app/pages/sentiment/detail.vue`         | Main page container     |
| SourceDetailHeader  | `app/components/SourceDetailHeader.vue`  | Source metadata display |
| ArticleList         | `app/components/ArticleList.vue`         | Article list & sorting  |
| ArticleSortControl  | `app/components/ArticleSortControl.vue`  | Sort dropdown UI        |
| ArticleExpandedView | `app/components/ArticleExpandedView.vue` | Detailed sentiment view |
| Word Highlighter    | Internal to ArticleExpandedView          | Word highlighting logic |

### API Extensions

- **`/api/sentiment`** (GET): Extended to return article-level details (Task 2.2)
  - New fields: positiveWords[], negativeWords[], recencyWeight, sourceWeight, finalWeightedScore
  - Engagement metrics for social sources: upvotes, comments

**See**: [docs/mapping.md](./docs/mapping.md) Component Architecture section

---

## Data Model

### Article Detail View (Extended)

```typescript
{
  id: string
  title: string
  excerpt: string
  pubDate: Date | null
  link: string
  sourceId: string
  rawSentimentScore: number        // -1.0 to +1.0
  positiveWords: string[]
  negativeWords: string[]
  recencyWeight: number            // 0.0 to 1.0
  sourceWeight: number             // 0.0 to 1.0
  finalWeightedScore: number
  contributionPercentage: number   // 0 to 100
  upvotes?: number                 // Social sources only
  comments?: number                // Social sources only
  deduplicated: boolean
}
```

### Source Detail Summary (New)

```typescript
{
  sourceId: string;
  sourceName: string;
  sourceType: "rss" | "social";
  totalArticles: number;
  deduplicatedArticles: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  fetchedAt: Date;
  fetchStatus: "success" | "error";
}
```

**See**: [spec.md](./spec.md) Key Entities section

---

## Development Workflow

### Getting Started

1. **Review Specification**: Read [spec.md](./spec.md) for feature overview
2. **Understand Plan**: Review [development-plan.md](./development-plan.md) for epic breakdown
3. **Check Tests**: Review [testplan.md](./testplan.md) for acceptance criteria
4. **Study Architecture**: Review [docs/mapping.md](./docs/mapping.md) component structure

### Epic Implementation Flow

1. **Epic Start**: Review epic goals and tasks
2. **Task Work**: Follow acceptance criteria and technical notes
3. **Testing**: Run corresponding test cases
4. **Documentation**: Update mapping.md with code locations, add changelog entry
5. **Epic Complete**: Verify all epic tests pass before next epic

### Current Status

- ✅ **Planning Phase**: Complete (2025-11-10 to 2025-11-11)
- ⏳ **Epic 1**: Awaiting GitHub issue creation and assignment
- ⏳ **Epic 2**: Blocked by Epic 1
- ⏳ **Epic 3**: Blocked by Epic 2
- ⏳ **Epic 4**: Blocked by Epic 3

**Next Step**: Create GitHub issues and assign Epic 1 to Coding Agent

---

## Risk Management

### Active Risks

| Risk                                        | Severity | Mitigation                                    | Status |
| ------------------------------------------- | -------- | --------------------------------------------- | ------ |
| Sentiment word attribution data unavailable | High     | Verify in Epic 1, modify analyzer if needed   | Open   |
| Performance issues with 100+ articles       | Medium   | Pagination (Task 4.1), virtual scrolling      | Open   |
| Browser history API compatibility           | Low      | Progressive enhancement, graceful degradation | Open   |
| Mobile layout complexity                    | Medium   | Mobile-first design, early device testing     | Open   |

**See**: [docs/changelog.md](./docs/changelog.md) Risks and Mitigations section

---

## Edge Cases Handled

- ✅ Sources with 100+ articles → Pagination
- ✅ Articles with neutral sentiment (~0) → Gray indicator
- ✅ Long article content (>2000 chars) → Truncation
- ✅ Missing publication dates → "Unknown date", sort fallback
- ✅ All articles deduplicated → Clear message
- ✅ Engagement metrics (RSS vs social) → Conditional UI
- ✅ Sentiment calculation in progress → Loading skeleton
- ✅ Articles from different timestamps → Timestamp filtering
- ✅ API failure scenarios → Cached fallback with retry

**See**: [spec.md](./spec.md) Edge Cases section

---

## Test Data

**Fixture**: [tests/test-data.json](./tests/test-data.json)

Contains:

- 1 source summary (NU.nl Gezondheid, RSS)
- 6 sample articles:
  - Positive sentiment (0.67)
  - Negative sentiment (-0.42, -0.8)
  - Neutral sentiment (0.01)
  - Missing pubDate
  - Long content (4200 chars)
  - Social source with engagement (Reddit)
  - Deduplicated article

Used for deterministic UI testing and development.

---

## Browser Support

**Target Browsers**:

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- IE11 ❌ (Not supported)

**Mobile**:

- iOS Safari 14+ ✅
- Chrome Android 90+ ✅

**Minimum Viewport**: 320px width

---

## Accessibility Standards

**Target**: WCAG AA Compliance

**Features**:

- Keyboard navigation for all interactive elements
- Screen reader support (ARIA labels, semantic HTML)
- Color contrast ≥4.5:1 for text
- Triple-redundancy for sentiment indicators (color + icon + underline)
- Touch targets ≥44x44px (mobile)
- Focus indicators visible

**Verification**: axe audit (Task 4.9)

---

## Timeline

**Planning Phase**: 2025-11-10 to 2025-11-11 ✅

**Implementation** (Estimated):

- Week 1: Epic 1 (Foundation)
- Week 2-3: Epic 2 (Core functionality)
- Week 3-4: Epic 3 (Advanced features)
- Week 4-5: Epic 4 (Quality assurance)

**Total Duration**: ~5 weeks (1 developer)

---

## Next Steps

1. ✅ Development plan created
2. ✅ Documentation complete (mapping + changelog)
3. ⏳ Commit and push changes to GitHub
4. ⏳ Create GitHub issues (34 tasks)
5. ⏳ Create GitHub epics (4 epics)
6. ⏳ Assign Epic 1 to GitHub Copilot Coding Agent
7. ⏳ Monitor Epic 1 progress

---

## Questions?

### About Requirements

→ See [spec.md](./spec.md) or check Clarifications section

### About Implementation

→ See [development-plan.md](./development-plan.md) or task technical notes

### About Testing

→ See [testplan.md](./testplan.md) or specific test cases

### About Decisions

→ See [docs/changelog.md](./docs/changelog.md) Decision Log

### About Traceability

→ See [docs/mapping.md](./docs/mapping.md) for all cross-references

---

## Contributing

**Before starting work**:

1. Review relevant epic in development plan
2. Check traceability mapping for requirements
3. Review test cases for acceptance criteria
4. Follow technical notes in tasks

**During development**:

1. Write code according to acceptance criteria
2. Run relevant test cases
3. Update mapping.md with code locations
4. Add changelog entry for significant changes

**Before merging**:

1. All epic tests passing
2. Code reviewed
3. Documentation updated
4. No critical accessibility issues

---

**Feature Status**: Planning Complete → Ready for Implementation  
**Last Updated**: 2025-11-11  
**Branch**: `004-sentiment-detail`  
**Next Milestone**: Epic 1 Implementation Start
