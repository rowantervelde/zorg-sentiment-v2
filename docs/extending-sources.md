/\*\*

- Extending zorg-sentiment-v2 with New Data Sources
-
- This guide explains how to implement new data source adapters (Twitter, Reddit, etc.)
- for the multi-source sentiment analysis system.
-
- Task T048: Document future social media integration
  \*/

# Extending Data Sources - Developer Guide

## Overview

The sentiment collection system uses a **Adapter Pattern** to support multiple data source types. New source types can be added by implementing the `SourceAdapter` interface without modifying the core sentiment analysis logic.

## Architecture

### Current Architecture

```
┌──────────────────────────────────────────────┐
│ Source Orchestrator (sourceOrchestrator.ts)  │
│                                              │
│ ┌─ Adapter Registry ──────────────────────┐  │
│ │ - RSS → RSSAdapter                      │  │
│ │ - SOCIAL_TWITTER → TwitterAdapter       │  │
│ │ - SOCIAL_REDDIT → RedditAdapter         │  │
│ │ - API → APIAdapter                      │  │
│ └─────────────────────────────────────────┘  │
│                                              │
│ Fetches from all sources in parallel,        │
│ handles failures gracefully, deduplicates    │
└──────────────────────────────────────────────┘
```

## Implementing a New Source Adapter

### Step 1: Implement the SourceAdapter Interface

Create a new file: `server/utils/newSourceAdapter.ts`

```typescript
import type { Article } from "../types/article";
import type { SourceConfiguration } from "../types/sourceConfiguration";
import type { SourceType } from "../types/source";
import type { SourceAdapter } from "./sourceAdapter";
import { SourceType as SourceTypeEnum } from "../types/source";

export class NewSourceAdapter implements SourceAdapter {
  /**
   * Fetch articles from the new source
   *
   * Implementation notes:
   * - Handle HTTP timeouts (10 seconds max)
   * - Return articles in normalized Article format
   * - Include deduplication hash for cross-source duplicate detection
   * - Handle pagination if source requires multiple requests
   * - Return empty array if no articles available (not an error)
   */
  async fetchArticles(config: SourceConfiguration): Promise<Article[]> {
    const articles: Article[] = [];

    try {
      // 1. Connect to data source using config
      const client = await this.createClient(config);

      // 2. Fetch raw data (with timeout)
      const rawData = await this.fetchWithTimeout(client, 10000);

      // 3. Normalize to Article format
      const normalized = this.normalizeArticles(rawData);

      return normalized;
    } catch (error) {
      console.error(
        `[NewSourceAdapter] Error fetching from ${config.name}:`,
        error
      );
      throw error; // Orchestrator will catch and log
    }
  }

  /**
   * Validate source configuration before use
   *
   * Implementation notes:
   * - Check required fields: id, name, type, config.url/credentials
   * - Validate URL format if applicable
   * - Verify credentials/API keys format (don't call external service)
   * - Return true only if all checks pass
   */
  validateConfig(config: SourceConfiguration): boolean {
    if (!config.id || !config.name || !config.type) {
      return false;
    }

    if (config.type !== SourceTypeEnum.NEW_SOURCE_TYPE) {
      return false;
    }

    // Add source-specific validation
    if (!config.url || !config.url.startsWith("https://")) {
      return false;
    }

    return true;
  }

  /**
   * Get unique identifier for this source
   * Used in deduplication and logging
   */
  getIdentifier(config: SourceConfiguration): string {
    return config.id;
  }

  /**
   * Check if adapter supports a specific source type
   * Called by orchestrator for type validation
   */
  supportsSourceType(type: SourceType): boolean {
    return type === SourceTypeEnum.NEW_SOURCE_TYPE;
  }

  // Implementation helpers...
  private createClient(config: SourceConfiguration) {
    /* ... */
  }
  private fetchWithTimeout(client: any, timeoutMs: number) {
    /* ... */
  }
  private normalizeArticles(rawData: any[]): Article[] {
    /* ... */
  }
}
```

### Step 2: Add Source Type to Enum

Update `server/types/source.ts`:

```typescript
export enum SourceType {
  RSS = "RSS",
  SOCIAL_TWITTER = "SOCIAL_TWITTER",
  SOCIAL_REDDIT = "SOCIAL_REDDIT",
  API = "API",
  NEW_SOURCE_TYPE = "NEW_SOURCE_TYPE", // Add your type here
}
```

### Step 3: Register Adapter in Orchestrator

Update `server/utils/sourceOrchestrator.ts`:

```typescript
import { NewSourceAdapter } from "./newSourceAdapter";

const adapterRegistry = new Map<SourceType, SourceAdapter>([
  [SourceType.RSS, new RSSAdapter()],
  [SourceType.SOCIAL_TWITTER, new TwitterAdapter()],
  [SourceType.SOCIAL_REDDIT, new RedditAdapter()],
  [SourceType.NEW_SOURCE_TYPE, new NewSourceAdapter()], // Register here
]);
```

### Step 4: Configure Source

Add to `server/config/sources.json`:

```json
{
  "sources": [
    {
      "id": "new-source-1",
      "name": "New Source Feed",
      "type": "NEW_SOURCE_TYPE",
      "url": "https://api.newsource.com/feed",
      "category": "general",
      "isActive": true,
      "maxArticles": 30,
      "timeout": 10000
    }
  ]
}
```

## Key Implementation Details

### Article Normalization

All articles must be normalized to the standard format:

```typescript
interface Article {
  title: string; // Required: 10-500 chars
  description: string; // Required: 20-2000 chars
  content: string; // Required: combined for sentiment analysis
  link: string; // Required: canonical URL
  pubDate: string; // Required: ISO 8601 timestamp
  sourceId: string; // Required: source configuration id
  deduplicationHash: string; // Required: SHA-256 of title+content

  // Optional: for social media sources
  authorHandle?: string; // Twitter handle, Reddit username
  postUrl?: string; // Direct link to post
  engagementMetrics?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
}
```

### Deduplication Hash

Generate using SHA-256 on normalized text:

```typescript
import crypto from "crypto";

function generateDeduplicationHash(title: string, content: string): string {
  const normalized = `${title.toLowerCase().trim()}|${content
    .toLowerCase()
    .trim()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
```

### Error Handling

The orchestrator handles errors gracefully:

- Source adapter throws error → logged as 'failed' source
- No articles returned → logged as 'partial' status
- Continue with other sources → graceful degradation
- Timeout enforced at orchestrator level

## Testing Your Adapter

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { NewSourceAdapter } from "./newSourceAdapter";

describe("NewSourceAdapter", () => {
  const adapter = new NewSourceAdapter();

  it("should validate correct config", () => {
    const config = {
      id: "test",
      name: "Test",
      type: "NEW_SOURCE_TYPE",
      url: "https://test.com",
    };
    expect(adapter.validateConfig(config)).toBe(true);
  });

  it("should reject invalid config", () => {
    const config = { id: "test", name: "Test", type: "RSS" };
    expect(adapter.validateConfig(config)).toBe(false);
  });

  it("should fetch and normalize articles", async () => {
    const config = {
      /* ... */
    };
    const articles = await adapter.fetchArticles(config);
    expect(articles).toBeInstanceOf(Array);
    expect(articles[0].deduplicationHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
```

### Integration Tests

Add test source to `sources.json` with test URL (mock or staging service), run collection cycle, verify:

1. Articles fetched and stored
2. Source contribution recorded
3. Deduplication working
4. Sentiment calculated correctly

## Best Practices

1. **Timeouts**: Always enforce 10-second fetch timeout
2. **Error Handling**: Log errors but don't stop other sources
3. **Rate Limiting**: Respect source's rate limits (implement backoff if needed)
4. **Deduplication**: Always generate correct SHA-256 hash
5. **Normalization**: Ensure all fields meet requirements (length, format, encoding)
6. **Logging**: Include source name and context in all logs
7. **Configuration**: Support optional fields (headers, auth, filters)

## Future Enhancements

These features can be added to any source adapter:

- Weighted article selection (sample by importance score)
- Time-based filtering (only recent articles)
- Content filtering (language, keyword matching)
- Source-specific sentiment tuning
- Historical trend tracking per source
- Reliability monitoring and auto-disable

## Support

For questions or issues implementing a new adapter:

1. Check existing adapters (RSS, Twitter stub, Reddit stub)
2. Review sourceAdapter interface documentation
3. Inspect orchestrator error logs for validation failures
4. Check article normalization for deduplication issues

---

_Last updated: 2025-10-27_
