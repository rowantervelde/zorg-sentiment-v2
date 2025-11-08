# Reddit API Context7 Research Summary

**Date**: 2025-11-02  
**Feature**: 003-reddit-integration  
**Purpose**: Document important Reddit API findings from Context7 research

## Key Findings

### 1. Reddit API Authentication (No Changes Detected)

✅ **OAuth2 Client Credentials Flow Still Supported**:

- Standard OAuth2 endpoint: `https://www.reddit.com/api/v1/access_token`
- Grant type: `client_credentials` for app-only authentication
- Token expiration: 3600 seconds (1 hour)
- Endpoint: `https://oauth.reddit.com/` for authenticated requests

**Implementation Confirmation**: Our planned approach using snoowrap with client credentials is still valid and supported.

---

### 2. Rate Limiting (Current Documentation)

**Standard Rate Limits**:

- **OAuth Apps**: 60 requests per minute (confirmed in documentation)
- Rate limit headers are included in API responses
- No indication of changes to rate limit policies in 2024-2025

**Rate Limit Headers** (from API responses):

```
X-Ratelimit-Remaining: (requests remaining)
X-Ratelimit-Reset: (unix timestamp when limit resets)
X-Ratelimit-Used: (requests used in current window)
```

**Implementation Note**:

- Snoowrap automatically handles rate limiting by reading these headers
- Our exponential backoff strategy (1s-2s-4s) is appropriate for 429 errors
- No additional rate limit handling needed beyond snoowrap's built-in support

---

### 3. Subreddit Access Patterns

**Hot Posts Endpoint** (Primary Collection Method):

```bash
GET /r/{subreddit}/hot
Parameters:
  - limit: 1-100 (default: 25)
  - t: time filter (hour, day, week, month, year, all)
  - after/before: pagination cursors
  - raw_json: 1 (prevents HTML escaping)
```

**Confirmed Support For**:

- Public subreddit access without user authentication ✅
- Time-based filtering (last 24 hours via `t=day`) ✅
- Comment retrieval on posts ✅
- Post score (upvotes), comment counts, upvote ratio ✅

**No Deprecation Warnings Found**: All endpoints we plan to use are actively documented.

---

### 4. Snoowrap Library Confirmation

**Client Credentials Setup** (from official snoowrap docs):

```javascript
const snoowrap = require("snoowrap");

const r = new snoowrap({
  userAgent: "app_name:version by /u/username",
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  // For username/password flow (NOT for client credentials):
  // username: 'username',
  // password: 'password'
});
```

**Important Note**: Snoowrap docs show username/password examples, but **client credentials flow is also supported** via the constructor without username/password.

**Automatic Features in Snoowrap**:

- ✅ OAuth2 token refresh (automatic before each request)
- ✅ Rate limit handling (automatic queuing/retry)
- ✅ Request queuing when approaching limits
- ✅ Base URL management (`https://oauth.reddit.com`)
- ✅ User-agent header injection
- ✅ `raw_json=1` query parameter (prevents HTML escaping)

---

### 5. API Response Structure

**Listing Response Format**:

```json
{
  "kind": "Listing",
  "data": {
    "children": [
      {
        "kind": "t3", // t3 = Link/Post
        "data": {
          "title": "Post title",
          "selftext": "Post body text",
          "author": "username",
          "score": 45,
          "num_comments": 12,
          "upvote_ratio": 0.92,
          "created_utc": 1730556000,
          "permalink": "/r/subreddit/comments/abc123/...",
          "subreddit": "subreddit_name"
        }
      }
    ],
    "after": "t3_abc123", // Pagination cursor
    "before": null
  }
}
```

**Comment Response Format**:

```json
{
  "kind": "t1", // t1 = Comment
  "data": {
    "body": "Comment text",
    "author": "username",
    "score": 23,
    "created_utc": 1730556000
  }
}
```

---

### 6. Pagination Pattern

**Correct Pagination Implementation**:

```bash
# First page
GET /r/{subreddit}/hot?limit=25&raw_json=1

# Next page (use 'after' from previous response)
GET /r/{subreddit}/hot?limit=25&after=t3_abc123&count=25&raw_json=1

# Previous page (use 'before')
GET /r/{subreddit}/hot?limit=25&before=t3_xyz789&count=0&raw_json=1
```

**Implementation Note**:

- For our use case (top 20 posts per subreddit), pagination is not needed
- We fetch once with `limit=20` and process results
- No need to handle `after`/`before` cursors

---

### 7. Search Functionality (Optional - Not Initially Needed)

**Subreddit Search Endpoint**:

```bash
GET /r/{subreddit}/search
Parameters:
  - q: search query (URL encoded)
  - restrict_sr: true (limit to subreddit)
  - sort: relevance|hot|top|new|comments
  - t: time filter
  - limit: results per page
```

**Use Case**: Could be used in future for keyword-specific searches instead of fetching all hot posts and filtering client-side.

**Current Approach**: Fetch hot posts + client-side keyword filtering is simpler and sufficient for MVP.

---

## Changes Detected Since Original Research

### ❌ No Breaking Changes Found

- No deprecation notices for client credentials OAuth2 flow
- No changes to rate limits (still 60 req/min for OAuth apps)
- No changes to subreddit/post/comment endpoints
- No authentication method deprecations
- No API versioning changes

### ✅ All Planned Features Still Supported

1. Client credentials authentication ✅
2. Hot posts retrieval from public subreddits ✅
3. Comment fetching on posts ✅
4. Engagement metrics (score, comments, upvote ratio) ✅
5. Time-based filtering (last 24 hours) ✅
6. Rate limit handling via headers ✅

---

## Recommendations

### 1. No Spec Changes Required

The original research in `research.md` is accurate and current. No updates needed based on Context7 documentation review.

### 2. Snoowrap Configuration Validation

**Correct initialization for client credentials** (no username/password):

```typescript
import snoowrap from "snoowrap";

const r = new snoowrap({
  userAgent: "zorg-sentiment-v2:1.0.0 by /u/YOUR_USERNAME",
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  // NO username/password for client credentials flow
});
```

**Note**: Some snoowrap examples show username/password, but omitting them enables client credentials flow automatically.

### 3. Rate Limit Strategy Confirmation

Our planned approach is optimal:

- **429 errors**: Snoowrap handles automatically (no custom logic needed)
- **500/503 errors**: Our exponential backoff (1s-2s-4s) is appropriate
- **403/404 errors**: Mark as permanent failure (correct approach)

### 4. User Agent Format

**Required Format** (per Reddit API docs):

```
platform:app_id:version (by /u/username)
```

**Example**:

```
zorg-sentiment-v2:1.0.0 by /u/rowantervelde
```

**Important**: User agent is mandatory and must be descriptive. Generic user agents may result in rate limiting or bans.

---

## Testing Recommendations

### 1. Verify OAuth2 Client Credentials

Test that client credentials flow works without username/password:

```typescript
const r = new snoowrap({
  userAgent: "zorg-sentiment-v2:1.0.0 by /u/test",
  clientId: "test_client_id",
  clientSecret: "test_client_secret",
});

// Should succeed without user authentication
const posts = await r.getSubreddit("thenetherlands").getHot({ limit: 5 });
console.log("Auth success:", posts.length > 0);
```

### 2. Verify Rate Limit Handling

Monitor rate limit headers in responses:

```typescript
// Snoowrap exposes rate limit info internally
// Check _nextRequestTimestamp or _throttle properties
console.log("Rate limit remaining:", r.ratelimitRemaining);
console.log("Rate limit reset:", new Date(r.ratelimitReset * 1000));
```

### 3. Verify Comment Fetching

Ensure comments are accessible on posts:

```typescript
const submission = await r.getSubmission("post_id");
const comments = await submission.comments;
console.log("Top comment:", comments[0].body);
console.log("Comment score:", comments[0].score);
```

---

## Implementation Impact

### ✅ No Changes Required

1. **spec.md**: Accurate, no updates needed
2. **research.md**: Findings confirmed by Context7 documentation
3. **data-model.md**: API response structure matches documentation
4. **quickstart.md**: Setup steps are correct
5. **Implementation plan**: No adjustments necessary

### 📝 Minor Documentation Addition

Add user agent format reminder to quickstart.md under environment variables:

```markdown
REDDIT_USER_AGENT="zorg-sentiment-v2:1.0.0 by /u/YOUR_REDDIT_USERNAME"
```

**Format must be**: `platform:app_id:version (by /u/username)`

---

## Conclusion

✅ **All systems go**: Reddit API documentation from Context7 confirms our implementation plan is current and correct. No API changes detected that would impact the feature.

✅ **Snoowrap confirmed**: Library handles OAuth2 client credentials, rate limiting, and token refresh automatically as documented in research.md.

✅ **Rate limits unchanged**: 60 requests/minute for OAuth apps remains the standard limit.

✅ **Ready for implementation**: Proceed with Phase 2 (task breakdown) without modifications.

---

**Next Step**: Run `/speckit.tasks` to generate detailed implementation tasks.
