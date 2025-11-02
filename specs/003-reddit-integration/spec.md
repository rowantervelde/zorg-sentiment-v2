# Feature Specification: Reddit Integration for Sentiment Analysis

**Feature Branch**: `003-reddit-integration`  
**Created**: 2025-11-02  
**Status**: Draft  
**Input**: User description: "The app also needs to get relevant information from reddit. App is already prepared for this."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Collect Sentiment from Dutch Healthcare Reddit Communities (Priority: P1)

The system automatically collects posts and comments from relevant Dutch Reddit communities (subreddits) discussing healthcare insurance topics, integrating this social media perspective with existing RSS news feeds. Visitors see sentiment data that reflects both traditional news media and community discussions.

**Why this priority**: Reddit provides direct user opinions and experiences about healthcare insurance - a crucial perspective that news articles don't capture. This complements the existing multi-source RSS architecture and delivers the core value: "get relevant information from reddit."

**Independent Test**: Can be fully tested by triggering data collection, verifying that Reddit posts are fetched from configured subreddits, normalized into Article format, and integrated with RSS feed articles in sentiment calculations. Delivers immediate value by adding community voice to sentiment analysis.

**Acceptance Scenarios**:

1. **Given** the system has Reddit subreddits configured, **When** hourly data collection runs, **Then** posts and top-level comments are fetched from each subreddit and included in sentiment analysis
2. **Given** Reddit API is temporarily unavailable, **When** data collection runs, **Then** sentiment is calculated from remaining RSS and social sources with Reddit marked as failed
3. **Given** Reddit posts are collected, **When** sentiment analysis runs, **Then** Reddit content is normalized to Article format and deduplicated against news articles
4. **Given** Reddit posts contain healthcare insurance keywords, **When** filtering posts, **Then** only relevant posts matching keyword criteria are included in sentiment analysis

---

### User Story 2 - Track Reddit Source Quality and Contribution (Priority: P2)

Administrators can view how Reddit communities contribute to sentiment calculations, including post counts per subreddit, engagement metrics (upvotes, comments), and sentiment distribution. This enables evaluation of which Reddit communities provide the most valuable sentiment data.

**Why this priority**: Reddit content quality varies significantly by subreddit and post engagement. Tracking contribution metrics enables data-driven decisions about which communities to monitor and how to weight social media vs news sentiment.

**Independent Test**: Can be fully tested by viewing source contribution API showing Reddit-specific metrics (subreddit, post count, average engagement, sentiment profile). Delivers value by enabling optimization of Reddit source selection.

**Acceptance Scenarios**:

1. **Given** Reddit posts have been collected, **When** querying the source contribution API, **Then** each Reddit subreddit shows total posts/comments collected and percentage of total dataset
2. **Given** Reddit posts have engagement metrics, **When** querying source details, **Then** each Reddit source shows average upvotes, comment counts, and engagement distribution
3. **Given** Reddit API rate limits are hit, **When** querying source status, **Then** Reddit sources show rate limit status and next available fetch time
4. **Given** a subreddit becomes private or banned, **When** data collection runs, **Then** the source is marked as permanently failed with appropriate error message

---

### User Story 3 - Filter Reddit Content by Relevance and Quality (Priority: P3)

The system filters Reddit posts based on relevance criteria (keyword matching, minimum score threshold) and quality indicators (upvote ratio, comment engagement) to focus on substantive discussions rather than noise. This ensures Reddit content adds value rather than diluting sentiment accuracy.

**Why this priority**: Reddit contains significant noise and off-topic content. Filtering improves data quality but isn't essential for initial MVP - basic collection with minimal filtering delivers value faster.

**Independent Test**: Can be tested by configuring different filter criteria and verifying that only qualifying posts are included. Delivers value by improving signal-to-noise ratio in sentiment analysis.

**Acceptance Scenarios**:

1. **Given** Reddit posts are fetched, **When** filtering by minimum score, **Then** only posts with upvote count above threshold are included in sentiment analysis
2. **Given** Reddit posts are fetched, **When** filtering by keywords, **Then** only posts mentioning healthcare insurance terms (zorgverzekering, premie, eigen risico, etc.) are included
3. **Given** Reddit posts have low engagement, **When** applying quality filters, **Then** posts with negative upvote ratios (<40%) are excluded from sentiment analysis
4. **Given** Reddit comments are fetched, **When** filtering by depth, **Then** only top-level and first-reply comments are included to avoid deep thread noise

---

### Edge Cases

- What happens when Reddit API rate limits are exceeded? System tracks rate limit headers, pauses Reddit collection until reset time, continues with other sources (graceful degradation)
- How does system handle Reddit posts in multiple languages? Filter for Dutch language posts only using language detection; exclude English/other language posts that may appear in monitored subreddits
- What if Reddit post contains both positive and negative sentiment (mixed discussion)? Sentiment analyzer handles per-post analysis; mixed sentiment reflects in neutral category or as separate positive/negative percentages
- How should system handle deleted or removed Reddit posts? Skip deleted posts during collection; if post deleted after collection, sentiment data remains (represents historical sentiment at collection time)
- What if Reddit subreddit changes its rules or goes private? Mark source as failed; system continues with other sources; alert for manual review of source configuration
- How does system handle Reddit posts with very long text (>5000 characters)? Truncate content to 2000 characters for sentiment analysis (consistent with RSS article handling); prioritize post body over comments
- What about Reddit posts that are duplicates of news articles? Cross-source deduplication (80% similarity) applies to Reddit posts same as RSS; first occurrence (by timestamp) is kept
- How should system weight Reddit community posts vs professional news articles? Initial implementation: equal weight per post; future enhancement could apply source authority scoring

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch posts from configured Dutch Reddit subreddits related to healthcare insurance (zorg, zorgverzekering, etc.)
- **FR-002**: System MUST normalize Reddit posts into Article format (title, content, author, link, pubDate, sourceId) for sentiment analysis
- **FR-003**: System MUST authenticate with Reddit API using OAuth2 client credentials flow (app-only auth, no user login required)
- **FR-004**: System MUST handle Reddit API rate limits (60 requests per minute for OAuth apps) by tracking rate limit headers and pausing collection when limits reached
- **FR-005**: System MUST continue sentiment collection even when Reddit API is unavailable or rate-limited (graceful degradation, same as RSS feeds)
- **FR-006**: System MUST track Reddit source contribution metrics including post count per subreddit, average engagement (upvotes, comments), and fetch status
- **FR-007**: System MUST deduplicate Reddit posts against existing RSS articles and other Reddit posts using the same 80% similarity threshold algorithm
- **FR-008**: System MUST filter Reddit posts by relevance using keyword matching on post title and body (keywords: zorgverzekering, premie, eigen risico, zorgkosten, etc.)
- **FR-009**: System MUST filter Reddit posts by minimum quality threshold: posts with score >= 5 OR comment count >= 3 (configurable per subreddit)
- **FR-010**: System MUST filter Reddit posts by language, including only Dutch-language posts (using language detection or subreddit rules)
- **FR-011**: System MUST support Reddit source configuration including subreddit name, search query, minimum score threshold, and active/inactive status
- **FR-012**: System MUST implement the existing RedditAdapter interface (already defined in server/utils/redditAdapter.ts) to integrate with the multi-source orchestrator
- **FR-013**: System MUST store Reddit API credentials securely in environment variables (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET)
- **FR-014**: System MUST fetch top posts from subreddits within configurable time window (default: last 24 hours)
- **FR-015**: System MUST include top-level comments on relevant posts (limit: top 5 comments by score) to capture discussion sentiment
- **FR-016**: System MUST track Reddit-specific engagement metrics (upvotes, upvote ratio, comment count) in Article.engagementMetrics field
- **FR-017**: System MUST respect Reddit API best practices (user agent, rate limiting, caching) to avoid IP bans or throttling
- **FR-018**: System MUST handle Reddit API errors (403, 429, 500, 503) with exponential backoff retry strategy (max 3 retries)
- **FR-019**: System MUST mark Reddit sources as inactive after 72 hours of consecutive failures (same as RSS feeds)
- **FR-020**: System MUST limit Reddit posts per subreddit to 20 posts before deduplication (lower than RSS due to typically higher volume)

### Reddit Source Requirements

The following Dutch Reddit communities MUST be supported as initial sources (all freely accessible via Reddit API):

- **RD-001**: r/zorgverzekering - Primary Dutch healthcare insurance discussion subreddit
- **RD-002**: r/DutchPersonalFinance - Financial discussions including healthcare costs
- **RD-003**: r/thenetherlands - General Dutch subreddit with healthcare insurance threads
- **RD-004**: r/geldzaken - Dutch money/finance discussions including insurance

**Note**: Subreddit availability and relevance should be validated during implementation. If a subreddit is private, inactive, or irrelevant, it should be excluded from default configuration.

### Key Entities

- **Reddit Post (extends Article)**: 
  - Normalized to Article interface with Reddit-specific fields
  - Contains subreddit name, post ID, author username (u/...)
  - Includes engagement metrics: upvotes (score), upvote ratio, comment count
  - Post URL format: https://reddit.com/r/{subreddit}/comments/{post_id}
  - Content combines post title + selftext (for text posts) or title + URL (for link posts)

- **Reddit Source Configuration (extends SourceConfiguration)**:
  - Type: SOCIAL_REDDIT (enum value already defined)
  - Additional config fields: subreddit name, search keywords, minimum score, time window
  - Credentials stored separately in environment variables

- **Reddit Adapter State**:
  - Tracks OAuth2 access token and expiration
  - Tracks rate limit remaining and reset time per API endpoint
  - Maintains last successful fetch timestamp per subreddit

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: System successfully fetches and processes Reddit posts from at least 3 configured subreddits during each collection cycle
- **SC-002**: Reddit posts are integrated into sentiment calculations within 5 minutes of hourly collection trigger
- **SC-003**: Reddit API rate limits are respected with zero IP bans or service suspensions over 30-day period
- **SC-004**: Reddit source contribution is visible via /api/sentiment/sources endpoint showing post counts and engagement metrics per subreddit
- **SC-005**: System maintains >90% uptime for Reddit collection over 7-day period (allows for temporary API outages without affecting overall sentiment service)
- **SC-006**: Cross-source deduplication detects and excludes Reddit posts that duplicate RSS news articles (estimated 5-15% overlap for breaking news stories)
- **SC-007**: Reddit posts meeting quality threshold (score >= 5 or comments >= 3) are included in sentiment analysis
- **SC-008**: Sentiment dashboard shows combined sentiment from both RSS feeds and Reddit posts without distinguishing the source type to end users (seamless integration)
- **SC-009**: Reddit collection completes within 30 seconds per subreddit (parallel collection of 4 subreddits = ~30s total, within 10-second timeout per source)
- **SC-010**: System filters out at least 60% of Reddit posts as irrelevant or low-quality, focusing sentiment analysis on substantive discussions

### Data Quality Metrics

- **DQ-001**: At least 70% of collected Reddit posts contain Dutch-language healthcare insurance keywords
- **DQ-002**: Average Reddit post engagement (upvotes + comments) is >= 8 (indicates quality content, not spam)
- **DQ-003**: Reddit posts contribute 10-30% of total articles in sentiment analysis (balance with RSS feeds, not overwhelming)

## Assumptions *(mandatory)*

1. **Reddit API Access**: Application can register for Reddit API credentials (client ID and secret) using standard OAuth2 app registration process (free tier, no cost)
2. **No User Authentication**: Reddit data collection uses app-only OAuth2 (client credentials flow), not user-specific auth; public subreddit data is accessible without user login
3. **Subreddit Accessibility**: Target subreddits (r/zorgverzekering, r/thenetherlands, etc.) are public and do not require membership or approval to read
4. **Language Detection**: Dutch language detection can be performed using simple keyword matching or lightweight language detection library (lingua, franc, etc.) without ML models
5. **Existing Architecture**: The multi-source orchestrator pattern from feature 002 is fully functional and can be extended with RedditAdapter implementation
6. **Engagement Threshold**: Posts with score >= 5 or comments >= 3 represent substantive discussions worth including in sentiment analysis (threshold may need tuning based on actual data)
7. **Rate Limit Headroom**: 60 requests/minute Reddit API limit is sufficient for fetching top 20 posts from 4 subreddits (~80-100 requests including comments) within hourly collection window
8. **Content Moderation**: Reddit community moderation is sufficient; no additional content filtering for spam, abuse, or off-topic posts beyond built-in Reddit scores and subreddit rules
9. **Historical Data**: Initial implementation collects posts from last 24 hours only; no historical backfill of older Reddit data required
10. **Deduplication Accuracy**: 80% similarity threshold (same as RSS) is appropriate for Reddit posts; Reddit discussions of news articles will be detected as duplicates and excluded

## Dependencies *(include if applicable)*

### External Dependencies

- **Reddit API**: OAuth2 authentication, subreddit listing endpoints, post/comment retrieval endpoints
  - Documentation: https://www.reddit.com/dev/api/
  - Rate limits: 60 requests/minute for OAuth apps
  - Free tier: No cost, requires app registration

### Internal Dependencies

- **Feature 002 (Multi-Source Sentiment)**: RedditAdapter must implement SourceAdapter interface and integrate with sourceOrchestrator
- **Existing Infrastructure**: 
  - Article interface (server/types/article.ts) with optional social media fields already defined
  - Deduplicator utility (server/utils/deduplicator.ts) for cross-source duplicate detection
  - Storage layer (server/utils/storage.ts) for persisting source contributions
  - Source contribution API (server/api/sentiment/sources.get.ts) for exposing Reddit metrics

### Technical Dependencies

- **npm package**: `snoowrap` or `reddit` - Node.js Reddit API wrapper library (or raw fetch with OAuth2 implementation)
- **npm package**: `franc` or `lingua` - Language detection library for filtering non-Dutch posts (optional, can use keyword-based approach)
- **Environment variables**: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET (stored in Netlify environment configuration)

## Constraints *(include if applicable)*

### Technical Constraints

- **Rate Limiting**: Reddit API allows 60 requests per minute for OAuth apps; system must track and respect this limit to avoid temporary bans
- **API Response Time**: Reddit API response times can be slow (2-5 seconds per request); parallel requests and caching strategies needed to meet collection time targets
- **Content Length**: Reddit posts can be very long (>10,000 characters); truncate to 2000 characters for sentiment analysis to match RSS article handling
- **Authentication Persistence**: OAuth2 access tokens expire after 1 hour; system must refresh tokens automatically before expiration
- **Subreddit Rules**: Some subreddits have strict API usage rules; respect robots.txt and subreddit-specific guidelines to avoid bans

### Business Constraints

- **Free Tier Only**: Solution must use free Reddit API tier; no paid API access or premium features
- **Public Data Only**: Only collect from public subreddits; no private communities or user-specific data
- **No User Tracking**: Do not collect or store Reddit usernames for tracking purposes; author field is for source attribution only
- **Privacy Compliance**: Reddit posts are public but may contain personal opinions; ensure sentiment analysis is aggregate, not user-specific

### Operational Constraints

- **Collection Window**: Reddit collection must complete within existing hourly collection window (currently <2 minutes for all sources combined)
- **Error Budget**: Reddit failures must not exceed 10% of collection cycles over 7-day period (aligned with existing 90% uptime target)
- **Storage Growth**: Reddit posts increase data volume by estimated 10-30%; ensure Netlify Blob storage and 7-day retention can accommodate growth

## Out of Scope *(include if applicable)*

### Explicitly Excluded

- **Real-time Reddit Monitoring**: No WebSocket or streaming API integration; stick to hourly batch collection matching RSS feeds
- **Reddit User Profiles**: No collection of user post history, karma scores, or account age; focus on post content only
- **Advanced NLP**: No sentiment analysis tuning specific to Reddit language/slang; use existing sentiment analyzer as-is
- **Subreddit Discovery**: No automatic detection of new relevant subreddits; manual configuration only
- **Comment Thread Analysis**: No deep thread analysis or reply chain tracking; limit to top-level comments and first replies
- **Multimedia Content**: No analysis of images, videos, or linked content from Reddit posts; text-only sentiment analysis
- **Reddit Awards/Flair**: No tracking of Reddit gold, awards, or post flair for quality scoring; use upvotes/comments only
- **Mod Actions**: No tracking of moderator actions (removed posts, banned users) for quality indicators
- **Cross-posting Detection**: No special handling for Reddit cross-posts; treat as separate posts or deduplicate if content matches
- **User Sentiment Profiles**: No tracking of individual Reddit users' sentiment over time; aggregate community sentiment only

### Future Enhancements (Not in Scope)

- Reddit search API for keyword-based collection (beyond subreddit filtering)
- Weighted sentiment scoring based on engagement metrics (high upvotes = higher weight)
- Subreddit reputation scoring (quality of historical content)
- Integration with Reddit Insights API for trending topics
- Reddit-specific sentiment lexicon (slang, abbreviations, emoji)
- Comment sentiment vs post sentiment comparison
- Temporal analysis of Reddit discussions (tracking sentiment changes over post lifetime)

---

**Next Steps**: 
1. Validate specification quality using checklist
2. Proceed to `/speckit.clarify` for implementation planning once specification approved
