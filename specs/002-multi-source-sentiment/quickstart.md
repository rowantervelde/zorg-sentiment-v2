# Quickstart: Multi-Source Sentiment Data Collection

**Feature**: 002-multi-source-sentiment  
**Estimated Time**: 20 minutes  
**Prerequisites**: Node.js 18+, Git, Netlify CLI (optional for local testing)

---

## 1. Setup & Configuration (5 minutes)

### Create Source Configuration File

```bash
# From repository root
mkdir -p server/config
cat > server/config/sources.json << 'EOF'
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
    },
    {
      "id": "nos-gezondheid",
      "name": "NOS.nl Gezondheid",
      "type": "rss",
      "url": "https://feeds.nos.nl/nosnieuwsgezondheid",
      "category": "general",
      "active": true,
      "maxArticles": 30,
      "timeout": 10000,
      "priority": 1
    },
    {
      "id": "rtl-nieuws-gezondheid",
      "name": "RTL Nieuws Gezondheid",
      "type": "rss",
      "url": "https://www.rtlnieuws.nl/feeds/rtlnieuws-gezondheid.xml",
      "category": "general",
      "active": true,
      "maxArticles": 30,
      "timeout": 10000,
      "priority": 1
    },
    {
      "id": "zorgkrant",
      "name": "Zorgkrant",
      "type": "rss",
      "url": "https://www.zorgkrant.nl/feed/",
      "category": "healthcare-specific",
      "active": true,
      "maxArticles": 30,
      "timeout": 10000,
      "priority": 1
    },
    {
      "id": "skipr",
      "name": "Skipr.nl",
      "type": "rss",
      "url": "https://www.skipr.nl/rss.xml",
      "category": "healthcare-specific",
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
EOF
```

### Install Dependencies

```bash
npm install
# wink-nlp-utils already in package.json (2.1.0)
# No new dependencies needed
```

---

## 2. Core Implementation (10 minutes)

### Create Source Adapter Interface

```bash
# Create new file: server/utils/sourceAdapter.ts
cat > server/utils/sourceAdapter.ts << 'EOF'
/**
 * Source Adapter Interface
 * Abstracts data source types (RSS, social media, etc.)
 */

export interface Article {
  title: string;
  description: string;
  content: string;
  link: string;
  pubDate: string; // ISO 8601
  sourceId: string;
  deduplicationHash: string;
}

export interface SourceAdapter {
  sourceId: string;
  fetch(options?: FetchOptions): Promise<Article[]>;
}

export interface FetchOptions {
  maxArticles?: number;
  timeout?: number;
  retryAttempts?: number;
}

export interface SourceResult {
  sourceId: string;
  sourceName: string;
  sourceType: 'rss' | 'social' | 'other';
  status: 'success' | 'failed' | 'partial';
  articles: Article[];
  fetchedAt: string;
  fetchDurationMs: number;
  error?: string;
}
EOF
```

### Create Deduplicator Utility

```bash
# Create new file: server/utils/deduplicator.ts
cat > server/utils/deduplicator.ts << 'EOF'
/**
 * Article Deduplication using 80% similarity threshold
 * Uses Levenshtein distance from wink-nlp-utils
 */

import { string as wnlpString } from 'wink-nlp-utils';
import type { Article } from './sourceAdapter';

const SIMILARITY_THRESHOLD = 0.80;

/**
 * Remove duplicate articles across sources
 */
export function deduplicateArticles(articles: Article[]): Article[] {
  const seen = new Set<string>();
  const unique: Article[] = [];

  for (const article of articles) {
    if (isDuplicate(article, unique)) {
      console.log(`[Deduplicator] Skipping duplicate: ${article.title.substring(0, 50)}...`);
      continue;
    }
    unique.push(article);
    seen.add(article.deduplicationHash);
  }

  console.log(`[Deduplicator] ${articles.length} articles → ${unique.length} unique (${articles.length - unique.length} duplicates removed)`);
  return unique;
}

/**
 * Check if article is duplicate of any in existing set
 */
function isDuplicate(article: Article, existing: Article[]): boolean {
  const normalized = normalizeText(article.title + ' ' + article.description);

  for (const existingArticle of existing) {
    const existingNormalized = normalizeText(existingArticle.title + ' ' + existingArticle.description);
    const similarity = wnlpString.similarity(normalized, existingNormalized);

    if (similarity >= SIMILARITY_THRESHOLD) {
      console.log(`[Deduplicator] Match found: ${(similarity * 100).toFixed(1)}% similarity`);
      return true;
    }
  }

  return false;
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();
}

/**
 * Generate deduplication hash (SHA-256 of normalized content)
 */
export async function generateDeduplicationHash(article: Article): Promise<string> {
  const content = normalizeText(article.title + ' ' + article.description);
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
EOF
```

### Create Source Configuration Loader

```bash
# Create new file: server/utils/sourceConfig.ts
cat > server/utils/sourceConfig.ts << 'EOF'
/**
 * Source Configuration Loader
 * Loads and validates RSS feed sources from config file
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

export interface SourceConfig {
  id: string;
  name: string;
  type: 'rss' | 'social' | 'other';
  url: string;
  category: 'general' | 'healthcare-specific';
  active: boolean;
  maxArticles?: number;
  timeout?: number;
  priority?: number;
  customHeaders?: Record<string, string>;
}

export interface SourcesConfig {
  sources: SourceConfig[];
  defaults: {
    timeout: number;
    maxArticles: number;
    retryAttempts: number;
  };
}

let cachedConfig: SourcesConfig | null = null;

/**
 * Load source configuration from file
 */
export async function loadSourceConfig(): Promise<SourcesConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = join(process.cwd(), 'server', 'config', 'sources.json');
    const configData = await readFile(configPath, 'utf-8');
    const config: SourcesConfig = JSON.parse(configData);

    // Validate configuration
    validateConfig(config);

    cachedConfig = config;
    console.log(`[SourceConfig] Loaded ${config.sources.length} sources`);
    return config;
  } catch (error) {
    console.error('[SourceConfig] Failed to load config:', error);
    throw new Error('Failed to load source configuration');
  }
}

/**
 * Validate source configuration
 */
function validateConfig(config: SourcesConfig): void {
  if (!config.sources || !Array.isArray(config.sources)) {
    throw new Error('Invalid config: sources must be an array');
  }

  for (const source of config.sources) {
    if (!source.id || !/^[a-z0-9-]+$/.test(source.id)) {
      throw new Error(`Invalid source ID: ${source.id}`);
    }
    if (!source.url || !source.url.startsWith('http')) {
      throw new Error(`Invalid URL for source ${source.id}: ${source.url}`);
    }
  }

  console.log('[SourceConfig] Configuration validated successfully');
}

/**
 * Get active sources only
 */
export function getActiveSources(config: SourcesConfig): SourceConfig[] {
  return config.sources.filter(s => s.active);
}
EOF
```

---

## 3. API Endpoint (3 minutes)

### Create Sources API Endpoint

```bash
# Create new file: server/api/sentiment/sources.get.ts
cat > server/api/sentiment/sources.get.ts << 'EOF'
/**
 * GET /api/sentiment/sources
 * Returns source contribution metrics and reliability data
 */

import { getData } from '~/server/utils/storage';
import { loadSourceConfig } from '~/server/utils/sourceConfig';

export default defineEventHandler(async (event) => {
  try {
    // Load latest sentiment data
    const data = await getData();

    if (!data.dataPoints || data.dataPoints.length === 0) {
      return {
        timestamp: new Date().toISOString(),
        totalArticles: 0,
        totalSourcesAttempted: 0,
        activeSourcesCount: 0,
        failedSourcesCount: 0,
        sources: [],
      };
    }

    const latestPoint = data.dataPoints[data.dataPoints.length - 1];

    // Load source configuration for enrichment
    const config = await loadSourceConfig();

    // Build response with source contributions
    const sources = (latestPoint.sourceContributions || []).map(contribution => {
      const sourceConfig = config.sources.find(s => s.id === contribution.sourceId);

      return {
        sourceId: contribution.sourceId,
        sourceName: contribution.sourceName,
        sourceType: contribution.sourceType,
        category: sourceConfig?.category || 'general',
        articlesCollected: contribution.articlesCollected,
        articlePercentage: latestPoint.articlesAnalyzed > 0
          ? (contribution.articlesCollected / latestPoint.articlesAnalyzed * 100)
          : 0,
        sentimentBreakdown: contribution.sentimentBreakdown,
        fetchedAt: contribution.fetchedAt,
        fetchDurationMs: contribution.fetchDurationMs,
        status: contribution.status,
        error: contribution.error,
        reliability: {
          // TODO: Load from SourceReliabilityMetrics blob
          successRate: 100,
          avgResponseTimeMs: contribution.fetchDurationMs,
          consecutiveFailures: 0,
          isHealthy: contribution.status === 'success',
          isInactive: false,
        },
      };
    });

    return {
      timestamp: latestPoint.timestamp,
      totalArticles: latestPoint.articlesAnalyzed,
      totalSourcesAttempted: latestPoint.sourceDiversity?.totalSources || 0,
      activeSourcesCount: latestPoint.sourceDiversity?.activeSources || 0,
      failedSourcesCount: latestPoint.sourceDiversity?.failedSources || 0,
      sources,
    };
  } catch (error) {
    console.error('[API /sentiment/sources] Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load source contribution data',
    });
  }
});
EOF
```

---

## 4. Testing (2 minutes)

### Test Source Configuration

```bash
# Test loading configuration
npm run dev

# In another terminal
curl http://localhost:3000/api/sentiment/sources
```

### Test Multi-Source Collection (Manual)

```bash
# Trigger Netlify function locally (requires netlify-cli)
netlify functions:invoke collect-sentiment

# Or deploy to Netlify and wait for hourly cron
```

---

## 5. Verification Checklist

- [ ] Configuration file `server/config/sources.json` exists with 5 sources
- [ ] All source URLs are valid HTTPS endpoints
- [ ] API endpoint `/api/sentiment/sources` returns 200 status
- [ ] Response includes `sourceContributions` array
- [ ] At least 3 sources show `status: "success"` (SC-001)
- [ ] `articlesAnalyzed` reflects deduplicated total
- [ ] No single source contributes >60% of articles (SC-003)
- [ ] Failed sources still allow collection to complete (FR-003)

---

## Common Issues & Troubleshooting

### Issue: "Failed to load source configuration"

**Cause**: Missing or malformed `sources.json`  
**Fix**: Verify file exists at `server/config/sources.json` and is valid JSON

### Issue: All sources show `status: "failed"`

**Cause**: Network timeout or invalid RSS feed URLs  
**Fix**: Test each URL manually in browser, increase timeout in config

### Issue: Duplicate detection not working

**Cause**: wink-nlp-utils not installed  
**Fix**: Run `npm install` to ensure all dependencies are present

### Issue: API endpoint returns empty sources array

**Cause**: No sentiment data collected yet  
**Fix**: Wait for first hourly collection or manually trigger Netlify function

---

## Next Steps

1. **Phase 2**: Implement source orchestrator in `server/utils/sourceOrchestrator.ts`
2. **Phase 3**: Update `netlify/functions/collect-sentiment.mts` to use orchestrator
3. **Phase 4**: Implement reliability metrics tracking in `server/utils/storage.ts`
4. **Phase 5**: Add source filtering to frontend (optional)

---

## Related Documentation

- [Specification](./spec.md) - Requirements and user stories
- [Data Model](./data-model.md) - Entity relationships and schemas
- [API Contract](./contracts/sources-api.yaml) - OpenAPI specification
- [Research](./research.md) - Technical decisions and rationale
