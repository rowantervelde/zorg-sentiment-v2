# Feature Specification: Sentiment Detail Breakdown Page

**Feature Branch**: `004-sentiment-detail`  
**Created**: 2025-11-10  
**Status**: Draft  
**Input**: User description: "I want to see more details about the information that is used to determine the sentiment. I need a breakdown of the score. Make a detail page where i can see which articles are most value to the sentiment score."

## Clarifications

### Session 2025-11-10

- Q: What pagination pattern should be used for article lists exceeding 20 items? → A: "Load More" button (explicit user action, predictable UX, better accessibility than infinite scroll)
- Q: What accessibility alternative should be provided for color-based sentiment indicators? → A: Icons + underlines (positive words with ✓ icon + underline, negative with ✗ icon + underline)
- Q: How should the detail page handle API failures when fetching article details? → A: Cached fallback with retry (show last successfully loaded data with "Viewing cached data" banner, retry API call in background)
- Q: What access control model should be used for the detail page? → A: Public read-only access (no authentication required, aligns with public dashboard architecture)
- Q: What analytics/observability strategy should be implemented for the detail page? → A: No analytics (no usage tracking or monitoring for detail page interactions)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Source-Specific Article Breakdown (Priority: P1)

Visitors click on an individual source card (e.g., "NU.nl", "Reddit - r/zorgverzekering") on the main dashboard to see a detailed breakdown of that source's articles and their contribution to the overall sentiment score. The detail page displays a sortable list of articles with their individual sentiment scores, showing exactly which content is influencing the displayed sentiment.

**Why this priority**: This is the core value - transparency into sentiment calculation. Users need to understand what specific content is driving the sentiment score to trust the analysis. Without this, the sentiment dashboard is a "black box" that users may question or dismiss.

**Independent Test**: Can be fully tested by clicking a source card, verifying that a detail page loads showing articles from only that source, each with its individual sentiment score and contribution percentage. Delivers immediate value by answering "why is this source positive/negative?"

**Acceptance Scenarios**:

1. **Given** the dashboard displays multiple source cards, **When** a user clicks on a source card (e.g., "NU.nl Gezondheid"), **Then** a detail page opens showing only articles from that specific source
2. **Given** the detail page is displayed, **When** viewing the article list, **Then** each article shows its title, publication date, individual sentiment score, and contribution percentage to the source's overall sentiment
3. **Given** the detail page displays articles, **When** a user clicks on an article, **Then** the article opens in a new tab using its original source URL
4. **Given** a source has no articles in the current sentiment data point, **When** clicking that source card, **Then** the detail page shows "No articles collected from this source" with the last successful fetch timestamp
5. **Given** the detail page is open, **When** a user navigates back, **Then** they return to the main dashboard without losing their previous scroll position

---

### User Story 2 - Sort Articles by Multiple Criteria (Priority: P2)

Users can sort the article list on the detail page by different criteria: sentiment score (most positive/negative first), recency (newest first), engagement metrics (most upvoted/shared), or contribution weight (highest impact on overall score first). This enables exploration from different analytical perspectives.

**Why this priority**: Different users have different questions: "What's the most extreme content?" vs "What's the newest?" vs "What matters most to the score?". Flexible sorting enables answering multiple questions without separate views.

**Independent Test**: Can be tested by selecting different sort options and verifying that the article list reorders correctly. Delivers value by enabling users to find specific types of content quickly (e.g., recent negative articles, highly-weighted posts).

**Acceptance Scenarios**:

1. **Given** the detail page displays articles, **When** a user selects "Sort by: Sentiment Score (High to Low)", **Then** articles are reordered with most positive sentiment first
2. **Given** the detail page displays articles, **When** a user selects "Sort by: Recency (Newest First)", **Then** articles are reordered by publication date, newest first
3. **Given** the detail page displays articles from a social media source (Reddit), **When** a user selects "Sort by: Engagement", **Then** articles are reordered by combined upvotes + comments, highest first
4. **Given** the detail page displays articles, **When** a user selects "Sort by: Contribution Weight", **Then** articles are reordered by their calculated contribution to the overall sentiment score, highest impact first
5. **Given** RSS feed sources without engagement metrics, **When** viewing the sort options, **Then** "Sort by: Engagement" is disabled or hidden for non-social sources

---

### User Story 3 - Expand Article for Detailed Sentiment Analysis (Priority: P3)

Users can expand individual articles to see why that article received its sentiment score: which words/phrases were detected as positive or negative, the raw sentiment scores (before weighting), and how recency and source weights affected the final contribution. This provides maximum transparency into the sentiment calculation algorithm.

**Why this priority**: This is educational and builds trust but not essential for initial transparency. Most users will be satisfied with the summary view (P1) and sorting (P2). Deep analysis is for power users or debugging.

**Independent Test**: Can be tested by clicking an "expand" button on an article and verifying that additional analysis details appear. Delivers value by enabling users to understand the "why" behind individual sentiment scores.

**Acceptance Scenarios**:

1. **Given** the detail page displays an article in collapsed state, **When** a user clicks the expand button, **Then** the article card expands to show sentiment word highlights, positive/negative word counts, and raw sentiment score
2. **Given** an expanded article card, **When** viewing the sentiment breakdown, **Then** positive words are highlighted in green with ✓ icon and underline, and negative words are highlighted in red with ✗ icon and underline within the article excerpt
3. **Given** an expanded article card, **When** viewing the contribution calculation, **Then** the display shows: raw sentiment score, recency weight applied, source weight applied, and final weighted contribution
4. **Given** an expanded article card, **When** a user clicks the collapse button, **Then** the article returns to summary view showing only title, date, and overall score
5. **Given** multiple articles are expanded, **When** a user collapses one article, **Then** other expanded articles remain in their expanded state (independent controls)

---

### Edge Cases

- What happens when a source has 100+ articles? Implement pagination with "Load More" button (20 articles per page) to prevent performance issues with large article lists
- How should the detail page handle articles with neutral sentiment (score near 0)? Display neutral articles with a gray indicator and 0% contribution, but include them in the list for completeness
- What if an article's content is very long (>2000 characters)? Show truncated excerpt (first 200 characters) in collapsed view; full content available only in expanded view or via source link
- How does the system handle articles with missing publication dates? Display "Unknown date" and sort to bottom when sorting by recency; use collection timestamp as fallback for contribution weight
- What if a source has articles but all were deduplicated (0 unique articles)? Show message "All articles from this source were duplicates of other sources" with count of deduplicated articles
- How should engagement metrics be displayed for RSS feeds vs social media? For RSS feeds, show "N/A" or hide engagement columns; for social media (Reddit), show upvotes and comments clearly
- What happens when the sentiment calculation is still in progress? Show loading skeleton on detail page; disable source cards on dashboard until collection completes
- How should the detail page handle articles collected from previous hours vs current hour? Show only articles from the selected sentiment data point (timestamp-specific); add timestamp indicator at top of detail page
- What happens when API fails to fetch article details? Display last successfully cached data with "Viewing cached data" banner notification; retry API call in background; if no cached data exists, show error message with manual refresh option

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a detail page accessible by clicking on individual source cards from the main dashboard
- **FR-002**: Detail page MUST display only articles from the selected source for the current sentiment data point (timestamp-specific)
- **FR-003**: Each article in the detail page MUST display: article title, publication date, individual sentiment score (-1.0 to +1.0), and contribution percentage to source's overall sentiment
- **FR-004**: Detail page MUST support sorting articles by: sentiment score (highest/lowest), publication date (newest/oldest), engagement metrics (social sources only), and contribution weight (highest impact first)
- **FR-005**: Default sort order MUST be "Contribution Weight (Highest First)" to immediately show the most influential articles
- **FR-006**: Article titles MUST be clickable links that open the original source URL in a new browser tab
- **FR-007**: System MUST display article list in collapsed state by default, showing only summary information (title, date, score, contribution)
- **FR-008**: Users MUST be able to expand individual articles to see detailed sentiment analysis including: positive/negative word highlights, word counts, raw sentiment score, and weighting factors (recency, source weight)
- **FR-009**: Expanded article view MUST highlight sentiment-contributing words with multiple accessibility indicators: positive words shown in green with ✓ icon and underline, negative words shown in red with ✗ icon and underline, neutral words unhighlighted
- **FR-010**: Detail page MUST show source metadata at the top: source name, total articles from source, source's overall sentiment breakdown (positive/neutral/negative percentages)
- **FR-011**: Detail page MUST handle empty states: "No articles collected from this source" when source has 0 articles in current data point
- **FR-012**: System MUST paginate article lists when count exceeds 20 articles, using a "Load More" button that loads the next 20 articles on click
- **FR-013**: Detail page MUST include a timestamp indicator showing which sentiment data point (hour) is being viewed
- **FR-014**: Users MUST be able to navigate back to the main dashboard from the detail page without losing dashboard scroll position
- **FR-015**: System MUST disable or hide engagement-based sorting for RSS feed sources (which have no upvotes/comments)
- **FR-016**: System MUST calculate article contribution percentage as: (article's weighted sentiment score / sum of all weighted scores from source) × 100
- **FR-017**: Detail page MUST be responsive and functional on mobile devices (320px+ width)
- **FR-018**: System MUST preserve sort order when expanding/collapsing articles (no re-sorting on expand)
- **FR-019**: Detail page URL MUST include source ID and timestamp parameters to enable deep linking (e.g., `/sentiment/detail?source=nu-nl-gezondheid&timestamp=2025-11-10T14:00:00Z`)
- **FR-020**: System MUST handle sources with all-deduplicated articles by showing "All articles from this source were duplicates" message with deduplicated count
- **FR-021**: System MUST cache successfully loaded article detail data in browser session storage for fallback during API failures
- **FR-022**: When API fails to fetch article details, system MUST display cached data (if available) with visible "Viewing cached data" banner and retry API call in background every 30 seconds
- **FR-023**: If no cached data exists during API failure, system MUST display error message "Unable to load article details" with manual refresh button
- **FR-024**: Detail page MUST be publicly accessible without authentication, consistent with the public dashboard architecture

### Key Entities _(feature involves data)_

- **Article Detail View**: Extended article information for detail page display

  - Core article fields: title, content excerpt, pubDate, link, sourceId
  - Sentiment analysis results: rawSentimentScore (-1.0 to +1.0), positiveWords[], negativeWords[]
  - Weighting factors: recencyWeight (0.0-1.0), sourceWeight (0.0-1.0), finalWeightedScore
  - Contribution metrics: contributionPercentage (0-100)
  - Engagement metrics (social sources only): upvotes, comments, upvoteRatio

- **Source Detail Summary**: Aggregate information for source at detail page header

  - Source metadata: sourceId, sourceName, sourceType (rss/social)
  - Article counts: totalArticles, deduplicatedArticles
  - Sentiment breakdown: positivePercentage, neutralPercentage, negativePercentage
  - Collection metadata: fetchedAt timestamp, fetchStatus

- **Detail Page State**: UI state management for detail page
  - Context: selectedSourceId, selectedTimestamp
  - Sorting: currentSortBy (score/recency/engagement/contribution), currentSortOrder (asc/desc)
  - Expansion: expandedArticleIds[] (track which articles are expanded)
  - Pagination: currentPage, articlesPerPage (20)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can access a detail page for any source card displayed on the main dashboard within 2 clicks
- **SC-002**: Detail page loads and displays article list within 1 second for sources with up to 100 articles
- **SC-003**: Article list supports all four sort options (sentiment score, recency, engagement, contribution weight) with visual feedback indicating current sort
- **SC-004**: Expanded article view displays sentiment word highlights with at least 80% accuracy in identifying words that contributed to sentiment score
- **SC-005**: Users can expand and collapse articles independently without page reload or loss of scroll position
- **SC-006**: Detail page displays correctly on mobile devices (320px-768px width) with readable text and functional sorting controls
- **SC-007**: Clicking an article title opens the original source content in a new tab within 500ms
- **SC-008**: Back navigation from detail page to dashboard preserves dashboard scroll position in 95% of cases (browser history state management)
- **SC-009**: Detail page handles empty states gracefully, showing clear messaging when source has 0 articles or all articles were deduplicated
- **SC-010**: Contribution percentages for all articles from a source sum to 100% (±1% rounding tolerance)

### User Experience Metrics

- **UX-001**: Users can understand which specific articles are driving sentiment scores without technical knowledge (plain language labels, clear visual indicators)
- **UX-002**: Sorting article list by different criteria provides distinct insights (verified through user feedback or analytics showing multiple sort options used)
- **UX-003**: Expanded article view answers the question "why did this article get this sentiment score?" with visible word highlights and calculation breakdown

## Assumptions _(mandatory)_

1. **Existing Data Structure**: Sentiment data points already include per-source article collections with individual sentiment scores (from Features 002-003); no backend data model changes required
2. **Sentiment Analysis Details**: The sentiment analyzer already tracks positive/negative words during analysis; this data is available for display in expanded view
3. **Browser Support**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) with JavaScript enabled; no IE11 support required
4. **Performance**: Article lists of up to 100 articles per source are common; larger lists are rare and acceptable to paginate
5. **URL Deep Linking**: Users may share detail page URLs; URL parameters for source and timestamp enable bookmarkable views
6. **Mobile Usage**: 30-40% of users access the dashboard on mobile devices; detail page must be fully functional on small screens
7. **Sort Persistence**: Sort preference is session-specific (not persisted across browser sessions); default to contribution weight on each page load
8. **Expansion State**: Article expansion state is not persisted; all articles load in collapsed state on page load
9. **Real-time Updates**: Detail page shows a snapshot of articles from a specific timestamp; no live updates as new articles are collected
10. **Engagement Metrics Availability**: Reddit sources provide upvotes/comments; RSS sources have no engagement metrics (N/A)
11. **Sentiment Word Detection**: The sentiment analyzer uses a lexicon-based approach that can identify specific words contributing to score; words are available for highlighting
12. **Weighting Transparency**: Recency and source weights are already calculated and stored; values are available for display in expanded view
13. **API Reliability**: API failures are transient (network issues, temporary server errors); cached data remains valid for viewing during short outages
14. **Public Access**: Detail page is publicly accessible without authentication, matching the existing dashboard's public read-only access model
15. **Privacy Focus**: No user analytics or tracking implemented; feature prioritizes privacy and simplicity over usage metrics

## Dependencies _(include if applicable)_

### Internal Dependencies

- **Feature 002 (Multi-Source Sentiment)**: Depends on Article interface, SourceContribution tracking, and per-source sentiment data storage
- **Feature 003 (Reddit Integration)**: Depends on engagement metrics (upvotes, comments) for social media article sorting
- **Existing Sentiment Analyzer**: Depends on sentiment analysis producing word-level sentiment attribution (positive/negative word lists)
- **Dashboard UI Components**: Extends existing dashboard with new detail page; shares UI components (MoodIndicator, DataTimestamp)

### Technical Dependencies

- **Nuxt 4.1.3**: Routing for detail page (`/sentiment/detail`), query parameters for source/timestamp
- **Vue 3.5**: Reactive state management for sort order, expansion state, and pagination
- **Nuxt UI v4.1**: UI components for sortable tables, expandable cards, pagination controls
- **Existing Composables**: Extends `useSentiment.ts` to provide article-level detail data for specific sources

## Constraints _(include if applicable)_

### Technical Constraints

- **Client-Side Rendering**: Detail page must render entirely client-side (no SSR required for detail view); data fetched from existing `/api/sentiment` and `/api/sentiment/sources` endpoints
- **Data Availability**: Can only display articles that were part of the collected sentiment data point; cannot fetch additional article details retroactively
- **Sentiment Word Detection Accuracy**: Word-level sentiment attribution depends on the quality of the underlying sentiment lexicon; accuracy may vary for Dutch healthcare terminology
- **Browser History API**: Back navigation preservation depends on browser history.pushState support; degrades gracefully to standard navigation if unavailable
- **Performance Limits**: Rendering 100+ articles may cause performance issues on low-end mobile devices; pagination is essential for large article lists

### UI/UX Constraints

- **Mobile Screen Space**: Limited vertical space on mobile requires collapsible articles and compact sort controls
- **Color Accessibility**: Sentiment word highlights must meet WCAG AA contrast requirements; positive/negative indicators use icons (✓/✗) and underlines in addition to color to support colorblind users and screen readers
- **Deep Linking**: Detail page URLs must be human-readable and shareable; avoid cryptic IDs or encoded parameters
- **Loading States**: Detail page must show loading skeleton while fetching data; avoid blank screens or "flash of content"

### Data Constraints

- **Contribution Calculation**: Contribution percentages are only meaningful within a single source; cannot compare article contributions across different sources
- **Temporal Specificity**: Detail page shows articles from one specific timestamp/collection cycle; historical comparison requires multiple detail page views
- **Deduplication Impact**: Deduplicated articles are not visible in detail pages; users may notice article count discrepancies between source card and detail page

## Out of Scope _(include if applicable)_

### Explicitly Excluded

- **Cross-Source Detail View**: No overall detail page showing all articles from all sources combined; only per-source detail pages (per user selection Q1: Option B)
- **Historical Article Tracking**: No tracking of how individual articles' sentiment scores change over time; detail page is timestamp-specific snapshot
- **Article Content Editing**: No ability to modify, flag, or remove articles from sentiment calculation via detail page
- **User-Generated Notes**: No ability for users to add comments or annotations to articles
- **Authentication/Authorization**: No user login, access control, or role-based permissions; detail page is publicly accessible read-only
- **Article Sharing**: No social sharing buttons or "share this article" functionality on detail page
- **Export Functionality**: No CSV/PDF export of article lists or sentiment breakdowns
- **Advanced Filtering**: No filtering by keyword, sentiment range, or publication date range; sorting only
- **Article Previews**: No in-page article content preview; users must click through to source URL to read full article
- **Sentiment Score Editing**: No manual override or adjustment of sentiment scores by users
- **Comparison Mode**: No side-by-side comparison of articles from different sources
- **Article Recommendations**: No "similar articles" or "related content" suggestions
- **Performance Analytics**: No tracking of which articles users click most often or how long they spend on detail page
- **Usage Analytics**: No analytics tracking, event logging, or user behavior monitoring for detail page interactions

### Future Enhancements (Not in Scope)

- Aggregated detail view showing top articles across all sources (potential P4 user story for future)
- Real-time updates to detail page as new articles are collected (WebSocket integration)
- Historical sentiment timeline for individual articles (track score changes over multiple hours/days)
- Sentiment lexicon editing or customization by administrators
- A/B testing different sentiment analysis algorithms and comparing results on detail page
- Machine learning-based article importance ranking (beyond simple contribution percentage)
- Article clustering or topic modeling to group similar articles on detail page
- Integration with third-party sentiment analysis tools for comparison
- User feedback mechanism: "Was this sentiment score accurate?" voting on articles
- Saved views or bookmarked sort preferences

---

**Next Steps**:

1. Create requirements checklist for specification quality validation
2. Validate specification against checklist criteria
3. Proceed to `/speckit.plan` for implementation planning once specification approved
