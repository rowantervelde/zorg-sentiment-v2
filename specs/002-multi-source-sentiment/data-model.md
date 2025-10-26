# Data Model: Multi-Source Sentiment Data Collection

**Feature**: 002-multi-source-sentiment  
**Date**: 2025-10-26  
**Status**: Design Complete

## Entities

### 1. SourceConfiguration

**Description**: Defines a configured data source (RSS feed or future social media)

**Fields**:

- `id` (string, required): Unique identifier (kebab-case, e.g., "nu-nl-gezondheid")
- `name` (string, required): Display name (e.g., "NU.nl Gezondheid")
- `type` (enum, required): Source type - 'rss' | 'social' | 'other'
- `url` (string, required): Feed URL or API endpoint
- `category` (enum, required): 'general' | 'healthcare-specific'
- `active` (boolean, required): Whether source is currently enabled
- `maxArticles` (number, optional): Max articles per fetch (default: 30)
- `timeout` (number, optional): Request timeout in milliseconds (default: 10000)
- `priority` (number, optional): Weight for future weighted sampling (default: 1)
- `customHeaders` (Record<string, string>, optional): Additional HTTP headers

**Validation Rules**:

- `id`: Must match `/^[a-z0-9-]+$/`
- `url`: Must be valid HTTPS URL
- `maxArticles`: Range 1-100
- `timeout`: Range 1000-30000 (1-30 seconds)
- `priority`: Range 1-10

**Lifecycle**: Static configuration loaded on function cold start, cached in memory

**Storage**: `server/config/sources.json` (version controlled)

---

### 2. Article

**Description**: Unified representation of content from any source type

**Fields**:

- `title` (string, required): Article headline
- `description` (string, required): Summary or excerpt
- `content` (string, required): Full text or combined title+description for analysis
- `link` (string, required): Canonical URL
- `pubDate` (string, required): Publication timestamp (ISO 8601)
- `sourceId` (string, required): References SourceConfiguration.id
- `deduplicationHash` (string, required): SHA-256 hash of normalized title+content

**Validation Rules**:

- `title`: Min 10 chars, max 500 chars
- `description`: Min 20 chars, max 2000 chars
- `pubDate`: Valid ISO 8601 datetime
- `deduplicationHash`: Lowercase hex string, 64 chars

**Computed Fields**:

- `ageHours`: `(now - pubDate) / 1 hour`
- `normalizedContent`: Lowercase, punctuation removed for similarity comparison

**Relationships**:

- Many Articles → One SourceConfiguration (via sourceId)

**Lifecycle**: Created during RSS fetch, exists in memory only during collection cycle, not persisted individually

---

### 3. SourceContribution

**Description**: Tracks how much each source contributed to a sentiment data point

**Fields**:

- `sourceId` (string, required): References SourceConfiguration.id
- `sourceName` (string, required): Display name at time of collection
- `sourceType` (enum, required): 'rss' | 'social' | 'other'
- `articlesCollected` (number, required): Count of articles from this source
- `sentimentBreakdown` (object, required):
  - `positive` (number): Percentage 0-100
  - `neutral` (number): Percentage 0-100
  - `negative` (number): Percentage 0-100
- `fetchedAt` (string, required): Timestamp of fetch (ISO 8601)
- `fetchDurationMs` (number, required): Time taken to fetch articles
- `status` (enum, required): 'success' | 'failed' | 'partial'
- `error` (string, optional): Error message if status='failed'

**Validation Rules**:

- `articlesCollected`: Non-negative integer
- `sentimentBreakdown`: positive + neutral + negative = 100 (±1 for rounding)
- `fetchDurationMs`: Non-negative, typically <10000 (timeout)
- `status='failed'` ⇒ `error` must be present

**Relationships**:

- Many SourceContributions → One SentimentDataPoint

**Lifecycle**: Created during collection, embedded in SentimentDataPoint, persisted in Blob storage

---

### 4. SentimentDataPoint (Extended)

**Description**: Sentiment measurement at a point in time, now including source attribution

**Existing Fields** (from MVP):

- `timestamp` (string, required): ISO 8601
- `collectionDurationMs` (number, required)
- `moodClassification` (enum, required): 'positive' | 'negative' | 'mixed' | 'neutral'
- `breakdown` (object, required): { positive, neutral, negative percentages }
- `summary` (string, required): Human-readable mood description
- `articlesAnalyzed` (number, required): Total article count
- `source` (string, deprecated): Legacy single-source ID, keep for backward compatibility
- `confidence` (number, required): 0.0-1.0

**NEW Fields**:

- `sourceContributions` (SourceContribution[], required): Per-source breakdown
- `sourceDiversity` (object, required):
  - `totalSources` (number): Sources attempted
  - `activeSources` (number): Sources that returned data
  - `failedSources` (number): Sources that failed

**Validation Rules**:

- `sourceDiversity.totalSources = activeSources + failedSources`
- `articlesAnalyzed = sum(sourceContributions[].articlesCollected)` (after deduplication)
- `sourceContributions.length >= 1` (at least one source must succeed per FR-003)

**State Transitions**: Immutable once created, new point generated each collection cycle

**Relationships**:

- One SentimentDataPoint → Many SourceContributions (embedded)

**Storage**: Netlify Blob Storage, key pattern: `sentiment-data/{timestamp}.json`

---

### 5. SourceReliabilityMetrics

**Description**: Rolling window health metrics for each source

**Fields**:

- `sourceId` (string, required): References SourceConfiguration.id
- `windowStart` (string, required): Start of 7-day window (ISO 8601)
- `windowEnd` (string, required): End of window (ISO 8601)
- `totalAttempts` (number, required): Fetch attempts in window
- `successfulFetches` (number, required): Successful fetches
- `failedFetches` (number, required): Failed fetches
- `successRate` (number, required): (successfulFetches / totalAttempts) \* 100
- `avgResponseTimeMs` (number, required): Average fetch duration
- `consecutiveFailures` (number, required): Current failure streak (resets on success)
- `lastSuccessAt` (string, optional): Most recent successful fetch timestamp
- `lastFailureAt` (string, optional): Most recent failed fetch timestamp
- `inactiveMarkedAt` (string, optional): Timestamp when marked inactive (72-hour threshold)

**Validation Rules**:

- `totalAttempts = successfulFetches + failedFetches`
- `successRate` range: 0-100
- `consecutiveFailures >= 72` ⇒ `inactiveMarkedAt` should be set (triggers FR-011)

**Computed Fields**:

- `isHealthy`: `successRate >= 90` (from SC-008)
- `isInactive`: `consecutiveFailures >= 72` (from FR-011)

**Lifecycle**:

- Created on first source fetch
- Updated after each collection cycle
- Cleared/reset when 7-day window rolls over

**Storage**: Netlify Blob Storage, key pattern: `source-metrics/{sourceId}/latest.json`

---

## Relationships Diagram

```text
┌─────────────────────────┐
│ SourceConfiguration     │
│ (config/sources.json)   │
│ - id                    │
│ - name                  │
│ - url                   │
│ - type (rss|social)     │
└───────┬─────────────────┘
        │
        │ references (during fetch)
        ▼
┌─────────────────────────┐
│ Article                 │
│ (transient, in-memory)  │
│ - sourceId              │
│ - title                 │
│ - content               │
│ - deduplicationHash     │
└───────┬─────────────────┘
        │
        │ aggregates into
        ▼
┌─────────────────────────┐       ┌──────────────────────┐
│ SourceContribution      │◄──────┤ SentimentDataPoint   │
│ (embedded)              │ 1:N   │ (Blob Storage)       │
│ - sourceId              │       │ - timestamp          │
│ - articlesCollected     │       │ - moodClassification │
│ - sentimentBreakdown    │       │ - sourceContributions│
│ - status                │       │ - sourceDiversity    │
└─────────────────────────┘       └──────────────────────┘

┌─────────────────────────┐
│ SourceReliabilityMetrics│
│ (Blob Storage)          │
│ - sourceId              │
│ - successRate           │
│ - consecutiveFailures   │
│ - inactiveMarkedAt      │
└─────────────────────────┘
```

---

## Data Flow

### Collection Cycle (Hourly)

1. **Load Configuration**: Read `sources.json`, filter `active=true`
2. **Fetch Articles**: Parallel fetch from all active sources
3. **Deduplicate**: Compare articles across sources using 80% similarity threshold
4. **Aggregate Sentiment**: Analyze combined article set
5. **Create Contributions**: Generate SourceContribution for each source
6. **Create Data Point**: Embed contributions in SentimentDataPoint
7. **Update Metrics**: Increment SourceReliabilityMetrics counters
8. **Persist**: Write data point to Blob Storage

### API Query Flow (GET /api/sentiment/sources)

1. **Load Latest Data Point**: Read most recent from Blob Storage
2. **Extract Contributions**: Map `sourceContributions` array
3. **Enrich with Config**: Add current source config (active status, category)
4. **Load Metrics**: Fetch SourceReliabilityMetrics for each source
5. **Return Response**: Combined view of contributions + reliability

---

## Migration Notes

### Backward Compatibility

**Existing consumers** reading `SentimentDataPoint` will:

- ✅ Continue to work (all original fields preserved)
- ✅ Ignore new `sourceContributions` and `sourceDiversity` fields (optional consumption)
- ⚠️ See `articlesAnalyzed` reflect deduplicated count (may differ from previous single-source count)

**Legacy `source` field**:

- Keep populated with first source ID for backward compatibility
- Mark as deprecated in types
- Remove in future major version

### Storage Impact

**Before**: 1 data point = ~500 bytes  
**After**: 1 data point = ~1.5 KB (+ ~250 bytes per source)  
**7-day retention**: ~10,000 points × 1.5 KB = ~15 MB (well within Netlify Blob free tier)

---

## Validation Strategy

### Runtime Validation

```typescript
// Zod schema for type-safe validation
import { z } from "zod";

const SourceContributionSchema = z
  .object({
    sourceId: z.string().regex(/^[a-z0-9-]+$/),
    sourceName: z.string().min(1),
    sourceType: z.enum(["rss", "social", "other"]),
    articlesCollected: z.number().int().nonnegative(),
    sentimentBreakdown: z
      .object({
        positive: z.number().min(0).max(100),
        neutral: z.number().min(0).max(100),
        negative: z.number().min(0).max(100),
      })
      .refine(
        (data) =>
          Math.abs(data.positive + data.neutral + data.negative - 100) <= 1,
        "Percentages must sum to 100 (±1)"
      ),
    fetchedAt: z.string().datetime(),
    fetchDurationMs: z.number().nonnegative(),
    status: z.enum(["success", "failed", "partial"]),
    error: z.string().optional(),
  })
  .refine(
    (data) => (data.status === "failed" ? data.error !== undefined : true),
    "Error message required when status is failed"
  );
```

### Contract Validation

- Use OpenAPI schema validator in tests
- Ensure API responses match `contracts/sources-api.yaml`
- Validate stored data points against schema on read

---

## Performance Considerations

### Deduplication Performance

**Worst case**: O(n²) comparisons for n articles  
**Mitigation**:

- Limit total articles to ~150 (5 sources × 30 articles)
- Early exit: Skip comparison if article ages differ by >24 hours
- Cache normalized content to avoid repeated string operations

**Estimated time**: ~150 articles × 149 comparisons × 1ms/comparison = ~22 seconds  
**Optimization**: Parallelize with `Promise.all` on chunks if needed

### Storage Read/Write

**Writes per hour**:

- 1 SentimentDataPoint (~1.5 KB)
- 5 SourceReliabilityMetrics updates (~500 bytes each)
- Total: ~4 KB/hour = ~700 KB/week

**Reads per page load**:

- 1 latest SentimentDataPoint (cached in memory for 5 minutes)
- Optional: 5 SourceReliabilityMetrics (for source attribution UI)

Both well within Netlify Blob free tier limits (10 GB storage, 10M reads/month).
