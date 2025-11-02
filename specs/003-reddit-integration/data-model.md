# Data Model: Reddit Integration

**Feature Branch**: `003-reddit-integration`  
**Date**: 2025-11-02  
**Status**: Design Phase (Phase 1)

## Overview

Reddit integration extends the existing multi-source sentiment architecture by implementing the `SourceAdapter` interface. Reddit posts are normalized to the existing `Article` interface with optional Reddit-specific fields in `engagementMetrics`.

## Core Entities

### Article (Existing - Reused)

**Location**: `server/types/article.ts`  
**Status**: Existing interface, no modifications needed

Reddit posts normalize to this interface:

```typescript
interface Article {
  title: string; // Reddit post title
  content: string; // Post selftext + top 5 comments
  author?: string; // Reddit username (u/username)
  link: string; // Reddit post permalink
  pubDate: Date; // Post creation timestamp
  sourceId: string; // "reddit-{subreddit}" (e.g., "reddit-thenetherlands")
  engagementMetrics?: {
    // Reddit-specific metrics
    upvotes?: number; // post.score
    downvotes?: number; // post.downs
    comments?: number; // post.num_comments
    upvoteRatio?: number; // post.upvote_ratio (0.0-1.0)
    awards?: number; // post.total_awards_received
  };
}
```

**Normalization Rules**:

1. **Text Posts**: `content = post.selftext + "\n\n--- Comments ---\n" + top_5_comments`
2. **Link Posts**: `content = post.title + "\n\n[External link]\n\n--- Comments ---\n" + top_5_comments`
3. **Image/Video Posts**: `content = post.title + "\n\n[Media post]\n\n--- Comments ---\n" + top_5_comments`
4. **Comments**: Top 5 by score, minimum 50 characters, exclude deleted/removed
5. **sourceId Format**: `"reddit-" + subreddit.toLowerCase()` (e.g., "reddit-thenetherlands")

---

### SourceConfiguration (Extended)

**Location**: `server/types/sourceConfiguration.ts`  
**Status**: Add new interface for Reddit-specific configuration

```typescript
// Existing enum - add new value
enum SourceType {
  RSS_NEWS = "RSS_NEWS",
  SOCIAL_REDDIT = "SOCIAL_REDDIT", // NEW
}

// Existing interface - reused
interface SourceConfiguration {
  id: string; // "reddit-thenetherlands"
  type: SourceType; // SOCIAL_REDDIT
  name: string; // "r/thenetherlands"
  url: string; // Subreddit URL (for display)
  active: boolean; // Enable/disable collection
  config?: RedditSourceConfig; // NEW: Reddit-specific config
}

// NEW interface
interface RedditSourceConfig {
  subreddit: string; // "thenetherlands" (without r/ prefix)
  timeWindow: string; // "day" | "week" | "month" (Reddit API time filter)
  minScore: number; // Minimum upvotes (default: 5)
  minComments: number; // Minimum comment count (default: 3)
  maxPosts: number; // Posts to fetch before filtering (default: 20)
  includeComments: boolean; // Whether to include comments in content (default: true)
  topCommentsCount: number; // Number of top comments to include (default: 5)
}
```

**Default Reddit Configuration** (`server/config/sources.json`):

```json
{
  "sources": [
    // ... existing RSS sources ...
    {
      "id": "reddit-dutchpersonalfinance",
      "type": "SOCIAL_REDDIT",
      "name": "r/DutchPersonalFinance",
      "url": "https://www.reddit.com/r/DutchPersonalFinance/",
      "active": true,
      "config": {
        "subreddit": "DutchPersonalFinance",
        "timeWindow": "day",
        "minScore": 5,
        "minComments": 3,
        "maxPosts": 20,
        "includeComments": true,
        "topCommentsCount": 5
      }
    },
    {
      "id": "reddit-thenetherlands",
      "type": "SOCIAL_REDDIT",
      "name": "r/thenetherlands",
      "url": "https://www.reddit.com/r/thenetherlands/",
      "active": true,
      "config": {
        "subreddit": "thenetherlands",
        "timeWindow": "day",
        "minScore": 5,
        "minComments": 3,
        "maxPosts": 20,
        "includeComments": true,
        "topCommentsCount": 5
      }
    },
    {
      "id": "reddit-geldzaken",
      "type": "SOCIAL_REDDIT",
      "name": "r/geldzaken",
      "url": "https://www.reddit.com/r/geldzaken/",
      "active": true,
      "config": {
        "subreddit": "geldzaken",
        "timeWindow": "day",
        "minScore": 5,
        "minComments": 3,
        "maxPosts": 20,
        "includeComments": true,
        "topCommentsCount": 5
      }
    }
  ]
}
```

---

### SourceAdapter (Existing Interface - Implemented)

**Location**: `server/utils/redditAdapter.ts`  
**Status**: Existing interface, implement methods

```typescript
interface SourceAdapter {
  fetchArticles(config: SourceConfiguration): Promise<Article[]>;
  validateConfig(config: SourceConfiguration): boolean;
  getAdapterState(): AdapterState;
}

interface AdapterState {
  lastFetchTime?: Date; // Last successful fetch timestamp
  isHealthy: boolean; // Whether adapter is operational
  errorCount: number; // Consecutive error count
  rateLimitRemaining?: number; // Reddit API requests remaining
  rateLimitResetTime?: Date; // When rate limit resets
  metadata?: {
    // Reddit-specific state
    accessToken?: string; // OAuth2 token (internal to snoowrap)
    tokenExpiresAt?: Date; // Token expiration (internal to snoowrap)
  };
}
```

**Implementation in `redditAdapter.ts`**:

```typescript
import snoowrap from "snoowrap";
import type {
  SourceAdapter,
  SourceConfiguration,
  Article,
  AdapterState,
} from "../types";

export class RedditAdapter implements SourceAdapter {
  private client: snoowrap;
  private state: AdapterState;

  constructor() {
    this.client = new snoowrap({
      userAgent: "zorg-sentiment-v2:1.0.0 by /u/YOUR_USERNAME",
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      grantType: snoowrap.grantType.CLIENT_CREDENTIALS,
    });

    this.state = {
      isHealthy: true,
      errorCount: 0,
    };
  }

  async fetchArticles(config: SourceConfiguration): Promise<Article[]> {
    // Implementation in contracts section
  }

  validateConfig(config: SourceConfiguration): boolean {
    // Validate Reddit-specific configuration
    if (config.type !== "SOCIAL_REDDIT") return false;
    if (!config.config?.subreddit) return false;
    return true;
  }

  getAdapterState(): AdapterState {
    return { ...this.state };
  }
}
```

---

### SourceContribution (Existing - Extended)

**Location**: `server/api/sentiment/sources.get.ts`  
**Status**: Existing interface, Reddit data automatically included

```typescript
interface SourceContribution {
  sourceId: string; // "reddit-thenetherlands"
  sourceName: string; // "r/thenetherlands"
  sourceType: SourceType; // SOCIAL_REDDIT
  articleCount: number; // Total Reddit posts collected
  percentage: number; // Percentage of total articles
  lastFetchTime?: Date; // Last successful Reddit fetch
  isHealthy: boolean; // Whether Reddit source is operational
  errorMessage?: string; // Recent error if unhealthy
  engagementStats?: {
    // NEW: Reddit-specific aggregates
    totalUpvotes: number; // Sum of all post upvotes
    totalComments: number; // Sum of all post comments
    avgUpvotes: number; // Average upvotes per post
    avgComments: number; // Average comments per post
    avgUpvoteRatio: number; // Average upvote ratio (0.0-1.0)
  };
}
```

**Engagement Statistics Calculation**:

```typescript
function calculateEngagementStats(articles: Article[]): EngagementStats {
  const redditArticles = articles.filter((a) =>
    a.sourceId.startsWith("reddit-")
  );

  return {
    totalUpvotes: sum(
      redditArticles.map((a) => a.engagementMetrics?.upvotes || 0)
    ),
    totalComments: sum(
      redditArticles.map((a) => a.engagementMetrics?.comments || 0)
    ),
    avgUpvotes: avg(
      redditArticles.map((a) => a.engagementMetrics?.upvotes || 0)
    ),
    avgComments: avg(
      redditArticles.map((a) => a.engagementMetrics?.comments || 0)
    ),
    avgUpvoteRatio: avg(
      redditArticles.map((a) => a.engagementMetrics?.upvoteRatio || 0)
    ),
  };
}
```

---

## Keyword Configuration

**Location**: `server/config/reddit-keywords.json` (NEW)  
**Purpose**: Dutch healthcare keyword definitions for post filtering

```json
{
  "primary": [
    "zorgverzekering",
    "zorgverzekeraar",
    "zorgverzekeringen",
    "eigen risico",
    "zorgtoeslag",
    "zorgkosten",
    "basispakket",
    "aanvullende verzekering",
    "zorgpolis"
  ],
  "secondary": ["premie", "huisarts", "ziekenhuis", "zorg", "verzekering"],
  "insurers": [
    "CZ",
    "VGZ",
    "Menzis",
    "Zilveren Kruis",
    "ONVZ",
    "ASR",
    "De Friesland"
  ],
  "filtering": {
    "requirePrimary": true,
    "secondaryBonus": 1,
    "insurerBonus": 1,
    "minimumScore": 1
  }
}
```

**Filtering Algorithm**:

```typescript
function isRelevantPost(post: { title: string; selftext: string }): boolean {
  const text = (post.title + " " + post.selftext).toLowerCase();

  // Check primary keywords (required)
  const hasPrimary = keywords.primary.some((kw) =>
    text.includes(kw.toLowerCase())
  );
  if (!hasPrimary) return false;

  // Calculate bonus score
  let score = 1; // Primary keyword found
  score += keywords.secondary.filter((kw) =>
    text.includes(kw.toLowerCase())
  ).length;
  score += keywords.insurers.filter((kw) =>
    text.includes(kw.toLowerCase())
  ).length;

  return score >= keywords.filtering.minimumScore;
}
```

---

## Data Flow

### Collection Flow

```
1. Netlify Cron Trigger (hourly)
   ↓
2. collect-sentiment.mts function
   ↓
3. sourceOrchestrator.fetchAllSources()
   ↓
4. redditAdapter.fetchArticles(config) [parallel per subreddit]
   ↓
5. Snoowrap: OAuth2 authentication (automatic)
   ↓
6. Snoowrap: Fetch r/{subreddit}/hot (top 20 posts, last 24h)
   ↓
7. Filter by Dutch keywords (reddit-keywords.json)
   ↓
8. Filter by quality threshold (score >= 5 OR comments >= 3)
   ↓
9. Fetch top 5 comments per post (by score)
   ↓
10. Normalize to Article interface (title + selftext + comments)
   ↓
11. Deduplicator: Check similarity vs RSS articles & other Reddit posts
   ↓
12. Storage: Persist articles to Netlify Blobs (7-day retention)
   ↓
13. Calculate sentiment scores (existing sentimentAnalyzer)
   ↓
14. Update source contribution metrics (engagementStats)
```

### Error Handling Flow

```
Reddit API Error
   ↓
Error Type Check
   ├─ 403/404 → Mark source permanently failed, skip retries
   ├─ 429 → Snoowrap auto-retry after rate limit reset
   └─ 500/503/Timeout → Exponential backoff retry (1s-2s-4s)
      ↓
   Retry Success → Continue collection
      ↓
   Final Retry Failed → Mark source as failed for this cycle
      ↓
   72 hours consecutive failures → Mark source inactive (FR-019)
```

---

## Storage Schema (Netlify Blobs)

**Blob Keys** (existing pattern, no changes):

- `sentiment/articles-{timestamp}.json` - All articles (RSS + Reddit)
- `sentiment/contributions-{timestamp}.json` - Source contribution metrics
- `sentiment/trends-{timestamp}.json` - Historical trend data

**Article Storage Format**:

```json
{
  "timestamp": "2025-11-02T12:00:00Z",
  "articles": [
    {
      "title": "Zorgverzekering 2025 premies stijgen",
      "content": "De premies voor 2025...\n\n--- Comments ---\nBeste tip: vergelijk via independent...",
      "author": "u/example_user",
      "link": "https://reddit.com/r/thenetherlands/comments/abc123",
      "pubDate": "2025-11-02T10:30:00Z",
      "sourceId": "reddit-thenetherlands",
      "engagementMetrics": {
        "upvotes": 45,
        "comments": 12,
        "upvoteRatio": 0.92
      }
    }
  ]
}
```

---

## API Response Schema

**Endpoint**: `GET /api/sentiment/sources`  
**Status**: Existing endpoint, automatically includes Reddit data

```json
{
  "sources": [
    {
      "sourceId": "reddit-thenetherlands",
      "sourceName": "r/thenetherlands",
      "sourceType": "SOCIAL_REDDIT",
      "articleCount": 15,
      "percentage": 18.5,
      "lastFetchTime": "2025-11-02T12:00:00Z",
      "isHealthy": true,
      "engagementStats": {
        "totalUpvotes": 675,
        "totalComments": 180,
        "avgUpvotes": 45,
        "avgComments": 12,
        "avgUpvoteRatio": 0.89
      }
    }
  ]
}
```

---

## Implementation Checklist

- [ ] Add `SOCIAL_REDDIT` to `SourceType` enum in `server/types/source.ts`
- [ ] Create `RedditSourceConfig` interface in `server/types/sourceConfiguration.ts`
- [ ] Create `server/config/reddit-keywords.json` with Dutch healthcare terms
- [ ] Implement `RedditAdapter` class in `server/utils/redditAdapter.ts`
- [ ] Add Reddit source configurations to `server/config/sources.json`
- [ ] Add `engagementStats` field to `SourceContribution` interface
- [ ] Update `sources.get.ts` to calculate engagement statistics for Reddit sources
- [ ] Add environment variables `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` to Netlify

---

## Next Steps

1. **API Contracts**: Define OpenAPI spec for extended `/api/sentiment/sources` endpoint (engagementStats field)
2. **Quickstart Guide**: Document Reddit API app registration and local development setup
3. **Tasks Breakdown**: Generate implementation tasks for Phase 2 (/speckit.tasks command)
