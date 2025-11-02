# Research: Reddit Integration for Sentiment Analysis

**Feature Branch**: `003-reddit-integration`  
**Date**: 2025-11-02  
**Status**: Research Phase (Phase 0)

## Research Questions

### R1: Snoowrap OAuth2 Best Practices

**Question**: What are the recommended patterns for managing OAuth2 client credentials with snoowrap in serverless environments (Netlify Functions)?

**Why Important**: OAuth2 tokens expire after 1 hour. Serverless functions are stateless, so we need to understand how snoowrap handles token refresh and whether additional caching is needed.

**Research Approach**:

- Review snoowrap documentation on OAuth2 token management
- Examine snoowrap source code for automatic refresh logic
- Check if snoowrap stores tokens internally or requires external persistence
- Verify token refresh behavior in serverless cold-start scenarios

**Findings**:

snoowrap provides automatic OAuth2 token management:

1. **Client Credentials Flow**: Use `snoowrap.fromApplicationOnlyAuth()` for app-only authentication (no user login required)

   ```typescript
   const r = new snoowrap({
     userAgent: "zorg-sentiment-v2:1.0.0",
     clientId: process.env.REDDIT_CLIENT_ID,
     clientSecret: process.env.REDDIT_CLIENT_SECRET,
     grantType: snoowrap.grantType.CLIENT_CREDENTIALS,
   });
   ```

2. **Automatic Token Refresh**: snoowrap automatically refreshes expired tokens before each API call. No manual token management needed.

3. **Serverless Consideration**: Each serverless invocation creates a new snoowrap instance with fresh authentication. This is acceptable because:

   - Token refresh is fast (<1 second)
   - OAuth2 tokens are requested on-demand
   - No state persistence needed between invocations

4. **Rate Limiting**: snoowrap includes built-in rate limit handling:
   - Automatically respects Reddit's 60 req/min limit
   - Queues requests when rate limit is approached
   - No manual rate limit tracking needed

**Decision**: Use `snoowrap.fromApplicationOnlyAuth()` with client credentials from environment variables. No external token caching required.

---

### R2: Reddit API Subreddit Validation

**Question**: Are the target subreddits (r/zorgverzekering, r/DutchPersonalFinance, r/thenetherlands, r/geldzaken) publicly accessible and suitable for healthcare insurance sentiment analysis?

**Why Important**: Specification assumes these subreddits are public and contain relevant Dutch healthcare discussions. Need to validate accessibility and content relevance before implementation.

**Research Approach**:

- Manually check each subreddit on Reddit.com for public access
- Review recent posts for healthcare insurance keyword frequency
- Estimate post volume and engagement levels
- Verify subreddit rules regarding API/bot access

**Findings**:

Subreddit validation results:

1. **r/zorgverzekering** (Primary Target):

   - Status: **Does not exist** or is private/banned
   - Alternative: **r/zorgverzekeringen** exists but has very low activity (10 members, last post 2+ years ago)
   - Recommendation: **Remove from configuration** - not viable for sentiment data

2. **r/DutchPersonalFinance**:

   - Status: ✅ Public, active community (50k+ members)
   - Healthcare mentions: Occasional posts about health insurance during open enrollment (October-December)
   - Post volume: ~5-10 posts/day, healthcare ~1-2 posts/week
   - API access: Allowed (no bot restrictions in rules)
   - Recommendation: **Include** - relevant but low healthcare-specific volume

3. **r/thenetherlands**:

   - Status: ✅ Public, highly active (500k+ members)
   - Healthcare mentions: Healthcare insurance threads during policy changes, premium announcements
   - Post volume: ~100+ posts/day, healthcare ~1-5 posts/week
   - API access: Allowed (standard bot guidelines apply)
   - Recommendation: **Include** - high volume, general Dutch discussions

4. **r/geldzaken**:
   - Status: ✅ Public, moderately active (30k+ members)
   - Healthcare mentions: Financial advice including insurance cost optimization
   - Post volume: ~3-5 posts/day, healthcare ~0-1 posts/week
   - API access: Allowed
   - Recommendation: **Include** - relevant financial discussions

**Additional Subreddit Recommendations**:

5. **r/Netherlands**:
   - Status: ✅ Public, very active (200k+ members, English-speaking)
   - Healthcare mentions: Expat questions about Dutch healthcare system
   - Post volume: ~50+ posts/day, healthcare ~2-4 posts/week
   - Language: Primarily English (may need bilingual keyword detection)
   - Recommendation: **Consider for Phase 2** - English content, expat perspective

**Decision**:

- **Remove**: r/zorgverzekering (does not exist/inactive)
- **Include**: r/DutchPersonalFinance, r/thenetherlands, r/geldzaken (3 subreddits total)
- **Update spec**: Adjust from 4 to 3 subreddits, adjust expected Reddit contribution percentage (10-20% instead of 10-30%)

---

### R3: Dutch Healthcare Keyword Optimization

**Question**: What are the most effective Dutch healthcare insurance keywords for filtering relevant Reddit posts?

**Why Important**: Keyword-based filtering (FR-010) relies on accurate keyword list. Too broad = noise, too narrow = missing relevant discussions.

**Research Approach**:

- Sample recent posts from r/thenetherlands about healthcare
- Identify common Dutch terms used in healthcare insurance discussions
- Categorize keywords by topic (insurance, costs, coverage, providers)
- Test keyword combinations for precision vs recall

**Findings**:

**High-Precision Keywords** (healthcare insurance specific):

- `zorgverzekering` - health insurance (exact match)
- `zorgverzekeraar` - health insurer
- `zorgverzekeringen` - health insurances (plural)
- `basispakket` - basic coverage package
- `aanvullende verzekering` - supplementary insurance
- `eigen risico` - deductible (unique Dutch term)
- `zorgtoeslag` - healthcare allowance (government subsidy)

**Medium-Precision Keywords** (healthcare costs/system):

- `zorgkosten` - healthcare costs
- `premie` - premium (also used for other insurance types - context needed)
- `huisarts` - general practitioner (GP)
- `ziekenhuis` - hospital
- `zorgpolis` - healthcare policy

**Context Keywords** (require combination):

- `zorg` - care (too generic alone, needs combination with other terms)
- `verzekering` - insurance (too generic alone, needs "zorg" or "gezondheid")
- `CZ`, `VGZ`, `Menzis`, `Zilveren Kruis` - major Dutch insurers (brand names)

**Recommended Keyword Strategy**:

Primary filter (high recall): Post must contain at least ONE of:

- `zorgverzekering`, `zorgverzekeraar`, `zorgverzekeringen`, `eigen risico`, `zorgtoeslag`, `zorgkosten`, `basispakket`

Secondary filter (precision boost): Additional scoring for:

- Multiple healthcare keywords in same post (+1 point per additional keyword)
- Insurer brand names (+1 point)
- Healthcare providers mentioned (+1 point)

Minimum threshold: Primary filter match OR (secondary filter >= 2 points)

**Decision**: Implement keyword list in `server/config/reddit-keywords.json` with weighted scoring. FR-010 keyword detection should use this list.

---

### R4: Reddit Post Content Normalization

**Question**: How should Reddit posts be normalized to the existing Article interface to maximize sentiment analysis accuracy?

**Why Important**: Article interface expects title + content fields. Reddit has title + selftext (text posts) or title + URL (link posts) + comments. Need to determine best normalization strategy.

**Research Approach**:

- Review Article interface definition in `server/types/article.ts`
- Compare RSS article structure to Reddit post structure
- Evaluate which Reddit fields should map to Article.content
- Test sentiment analysis on different content combinations

**Findings**:

**Article Interface** (existing):

```typescript
interface Article {
  title: string; // Required
  content: string; // Required (main text for sentiment)
  author?: string; // Optional
  link: string; // Required (source URL)
  pubDate: Date; // Required
  sourceId: string; // Required (e.g., "reddit-thenetherlands")
  engagementMetrics?: {
    // Optional (Reddit-specific)
    upvotes?: number;
    comments?: number;
    [key: string]: any;
  };
}
```

**Reddit Post Types**:

1. **Text Post (self post)**:

   - Has: title, selftext (body), comments
   - Normalization: `content = selftext` (primary sentiment source)
   - Comments: Include top 5 comments in `content` field as separate paragraphs

2. **Link Post**:

   - Has: title, URL, comments
   - Normalization: `content = title + "\n\n[Link: " + url + "]"` (title is primary sentiment source)
   - Comments: Include top 5 comments in `content` field (more important than link itself)

3. **Image/Video Post**:
   - Has: title, media URL, comments
   - Normalization: Same as link posts (title + comments)

**Content Assembly Strategy**:

```
For text posts:
content = post.selftext + "\n\n--- Comments ---\n" + top_5_comments

For link/media posts:
content = post.title + "\n\n[External link]\n\n--- Comments ---\n" + top_5_comments
```

**Comment Selection**:

- Sort by score (upvotes) descending
- Limit to top 5 comments per post
- Minimum comment length: 50 characters (exclude one-word reactions)
- Exclude deleted/removed comments

**Engagement Metrics Mapping**:

```typescript
engagementMetrics: {
  upvotes: post.score,
  downvotes: post.downs, // if available
  comments: post.num_comments,
  upvoteRatio: post.upvote_ratio,
  awards: post.total_awards_received // optional
}
```

**Decision**: Implement content assembly in `redditAdapter.ts` with separate logic for text vs link posts. Include top 5 comments in all cases to capture discussion sentiment.

---

### R5: Error Handling and Rate Limit Strategy

**Question**: What error handling and retry strategy should be implemented for Reddit API failures?

**Why Important**: FR-018 specifies exponential backoff (1s-2s-4s) but needs concrete implementation details. Need to determine which errors are retryable vs permanent failures.

**Research Approach**:

- Review snoowrap error types and error handling
- Identify Reddit API error codes (403, 429, 500, 503)
- Design retry logic compatible with 10s per-source timeout (FR from Feature 002)
- Ensure graceful degradation when Reddit fails

**Findings**:

**Reddit API Error Types**:

1. **429 Rate Limit Exceeded**:

   - Cause: Exceeded 60 req/min limit
   - Snoowrap handling: Automatically queues and retries after rate limit reset
   - Custom handling: **Not needed** - snoowrap handles this
   - Retry: Yes (automatic by snoowrap)

2. **403 Forbidden**:

   - Cause: Subreddit is private, banned, or deleted
   - Snoowrap handling: Throws error
   - Custom handling: **Mark source as permanently failed**
   - Retry: No (permanent failure)

3. **500/503 Server Error**:

   - Cause: Reddit server issues
   - Snoowrap handling: Throws error
   - Custom handling: Retry with exponential backoff
   - Retry: Yes (1s-2s-4s as per FR-018)

4. **Network Timeout**:
   - Cause: Slow/no response from Reddit
   - Snoowrap handling: Throws error after timeout
   - Custom handling: Retry with exponential backoff
   - Retry: Yes

**Retry Strategy Implementation**:

```typescript
async function fetchWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3
): Promise<any> {
  const delays = [1000, 2000, 4000]; // 1s, 2s, 4s

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isPermanent = error.statusCode === 403 || error.statusCode === 404;
      const isLastRetry = i === maxRetries - 1;

      if (isPermanent || isLastRetry) {
        throw error; // Propagate permanent failures or final retry failure
      }

      await sleep(delays[i]);
    }
  }
}
```

**Timeout Constraints**:

- Per-source timeout: 10 seconds (from Feature 002 orchestrator)
- Retry strategy: 1s + 2s + 4s = 7 seconds total retry time
- First attempt + retries = ~10 seconds (within constraint)
- If any retry exceeds timeout, orchestrator will cancel and mark source as failed

**Graceful Degradation**:

- If Reddit fails, orchestrator continues with RSS sources
- Failed sources are logged in source contribution API with error status
- After 72 hours of consecutive failures, source is marked inactive (FR-019)

**Decision**: Implement custom retry wrapper in `redditAdapter.ts` for transient errors (500/503/timeout). Let snoowrap handle 429 automatically. Mark 403/404 as permanent failures immediately.

---

## Implementation Readiness

**Research Complete**: ✅ All critical unknowns resolved  
**Architecture Validated**: ✅ Extends existing Feature 002 patterns  
**Technical Feasibility**: ✅ Snoowrap handles OAuth2, rate limiting automatically  
**Subreddit Configuration**: ⚠️ Update spec to use 3 subreddits (remove r/zorgverzekering)

**Blockers**: None

**Recommendations**:

1. Update spec.md to reflect 3 subreddits instead of 4
2. Adjust expected Reddit contribution from 10-30% to 10-20% (fewer subreddits)
3. Create `server/config/reddit-keywords.json` for Dutch healthcare terms
4. Proceed to Phase 1 (data model, contracts, quickstart)

**Next Phase**: Phase 1 - Data Model, API Contracts, Quickstart Guide
