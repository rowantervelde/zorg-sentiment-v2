# Research: Multi-Source Sentiment Data Collection

**Feature**: 002-multi-source-sentiment  
**Date**: 2025-10-26  
**Status**: Complete

## Research Questions

### 1. String Similarity Algorithm for Article Deduplication

**Decision**: Use Levenshtein distance ratio (edit distance / max length) with 80% threshold

**Rationale**:

- **Levenshtein distance** is standard for text similarity in news deduplication
- **80% threshold** balances catching near-duplicates (typos, minor wording changes) vs false positives
- Available in `wink-nlp-utils` package (already in dependencies: `wink-nlp-utils@2.1.0`)
- Alternative `string-similarity` package would add new dependency

**Implementation**:

```typescript
import { string as wnlpString } from "wink-nlp-utils";

function calculateSimilarity(text1: string, text2: string): number {
  // Levenshtein ratio = 1 - (distance / maxLength)
  return wnlpString.similarity(text1, text2);
}

function isDuplicate(article1: Article, article2: Article): boolean {
  const combined1 = `${article1.title} ${article1.description}`.toLowerCase();
  const combined2 = `${article2.title} ${article2.description}`.toLowerCase();
  return calculateSimilarity(combined1, combined2) >= 0.8;
}
```

**Alternatives Considered**:

- **Exact title match**: Too strict, misses articles with slight headline variations
- **Jaccard similarity (word sets)**: Less accurate for word order differences
- **TF-IDF cosine similarity**: Overkill for MVP, requires additional NLP processing

---

### 2. Source Configuration Storage Format

**Decision**: JSON configuration file with environment variable override support

**Rationale**:

- **JSON file** (`server/config/sources.json`) provides human-readable, version-controlled configuration
- **Environment variables** override for deployment-specific changes (Netlify environment)
- Nuxt `runtimeConfig` pattern supports layered configuration naturally
- Avoids database dependency for simple key-value config

**Configuration Schema**:

```json
{
  "sources": [
    {
      "id": "nu-nl-gezondheid",
      "name": "NU.nl Gezondheid",
      "type": "rss",
      "url": "https://www.nu.nl/rss/Gezondheid",
      "category": "general",
      "active": true,
      "maxArticles": 30,
      "timeout": 10000,
      "priority": 1
    }
  ],
  "defaults": {
    "timeout": 10000,
    "maxArticles": 30,
    "retryAttempts": 3
  }
}
```

**Environment Variable Override**:

```bash
# Disable a source at runtime
NUXT_SOURCE_NU_NL_ACTIVE=false

# Change timeout for all sources
NUXT_SOURCES_DEFAULT_TIMEOUT=15000
```

**Alternatives Considered**:

- **YAML**: More readable for humans but requires `js-yaml` dependency
- **Environment variables only**: Difficult to manage 5+ sources with multiple parameters each
- **Database**: Overkill for static configuration that changes infrequently

---

### 3. Multi-Source Orchestration Pattern

**Decision**: Parallel fetch with Promise.allSettled + graceful degradation

**Rationale**:

- **Promise.allSettled** waits for all sources to complete (success or failure) without early termination
- Enables graceful degradation per FR-003: continues with successful sources even if some fail
- Natural fit for independent RSS feeds with variable response times
- Supports individual source timeout handling

**Implementation Pattern**:

```typescript
async function fetchAllSources(
  sources: SourceConfig[]
): Promise<SourceResult[]> {
  const fetchPromises = sources
    .filter((s) => s.active)
    .map(async (source) => {
      try {
        const articles = await fetchRSSFeed(source.url, {
          timeout: source.timeout,
          maxArticles: source.maxArticles,
        });
        return {
          sourceId: source.id,
          status: "success",
          articles,
          fetchedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          sourceId: source.id,
          status: "failed",
          error: error.message,
          fetchedAt: new Date().toISOString(),
        };
      }
    });

  const results = await Promise.allSettled(fetchPromises);

  return results.map((result, index) =>
    result.status === "fulfilled"
      ? result.value
      : {
          sourceId: sources[index].id,
          status: "error",
          error: "Promise rejection",
          fetchedAt: new Date().toISOString(),
        }
  );
}
```

**Alternatives Considered**:

- **Sequential fetching**: Slower, single source failure blocks others
- **Promise.all**: Early termination on first failure violates graceful degradation requirement
- **Async queue with concurrency limit**: Unnecessary complexity for 5 sources

---

### 4. Source Contribution Data Model

**Decision**: Extend SentimentDataPoint with sourceContributions array

**Rationale**:

- **Embedded in data point**: Source data naturally belongs with the sentiment it contributed to
- **Array structure**: Preserves per-source breakdown while keeping single data point per collection cycle
- **Backward compatible**: Existing consumers ignore new field until ready

**Data Model Extension**:

```typescript
interface SourceContribution {
  sourceId: string;
  sourceName: string;
  sourceType: "rss" | "social" | "other";
  articlesCollected: number;
  sentimentBreakdown: {
    positive: number; // Percentage
    neutral: number;
    negative: number;
  };
  fetchedAt: string; // ISO 8601
  fetchDurationMs: number;
  status: "success" | "failed" | "partial";
  error?: string;
}

interface SentimentDataPoint {
  // Existing fields...
  timestamp: string;
  moodClassification: MoodType;
  breakdown: { positive: number; neutral: number; negative: number };
  summary: string;
  articlesAnalyzed: number;

  // NEW fields
  sourceContributions: SourceContribution[];
  sourceDiversity: {
    totalSources: number;
    activeSources: number;
    failedSources: number;
  };
}
```

**Alternatives Considered**:

- **Separate table/collection**: Requires joins, complicates queries
- **Aggregated only**: Loses per-source detail needed for FR-006
- **Separate API resource**: Breaks data cohesion, requires multiple requests

---

### 5. RSS Feed Reliability Tracking

**Decision**: Rolling window metrics stored per source in Blob storage

**Rationale**:

- **Rolling 7-day window**: Aligns with sentiment data retention (FR-012 from MVP spec)
- **Blob storage**: Consistent with existing pattern, avoids new database
- **Per-source metrics**: Enables individual source health monitoring

**Metrics Schema**:

```typescript
interface SourceReliabilityMetrics {
  sourceId: string;
  windowStart: string; // ISO 8601
  windowEnd: string;
  totalAttempts: number;
  successfulFetches: number;
  failedFetches: number;
  successRate: number; // Percentage
  avgResponseTimeMs: number;
  consecutiveFailures: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  inactiveMarkedAt?: string; // Set when hitting 72-hour threshold
}
```

**Storage Key**: `source-metrics/{sourceId}/latest.json`

**Update Pattern**:

- After each collection cycle, update metrics for all attempted sources
- Mark as inactive if `consecutiveFailures >= 72` (72 hours / 1 hour collection cycle)

**Alternatives Considered**:

- **In-memory only**: Lost on function restart, no historical visibility
- **Embedded in each data point**: Redundant storage, difficult to query
- **Separate time-series DB**: Overkill for simple rolling metrics

---

## Best Practices Applied

### TypeScript Strict Mode

- Enable strict null checks, no implicit any
- Use discriminated unions for source status ('success' | 'failed' | 'partial')
- Leverage type guards for runtime validation

### Error Handling

- Wrap each source fetch in try-catch
- Log structured errors with source context: `console.error('[Source:nu-nl]', error)`
- Never throw from orchestrator; return error status instead

### Observability

- Log fetch start/end with duration: `console.log('[Orchestrator] Fetched 5 sources in 3.2s')`
- Include source distribution in logs: `[Orchestrator] Success: 4, Failed: 1 (rtl-nieuws)`
- Export metrics in consistent JSON format for future monitoring tools

### Performance

- Use `AbortController` for 10-second timeout enforcement
- Limit articles per source (30) before processing to cap memory usage
- Deduplicate after combining all sources to avoid O(n²) comparisons per source

### Testing Strategy

- Unit tests: Deduplication algorithm with known similar/dissimilar pairs
- Integration tests: Mock RSS responses, verify orchestration handles partial failures
- Contract tests: Validate sources API schema against OpenAPI spec

---

## Unresolved Questions

None - all technical decisions needed for implementation are documented above.
