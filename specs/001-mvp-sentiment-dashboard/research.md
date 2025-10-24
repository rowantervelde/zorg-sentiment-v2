# Research: MVP Sentiment Dashboard

**Date**: 2025-10-24  
**Purpose**: Resolve technical unknowns and document technology choices for the MVP Sentiment Dashboard implementation.

## Research Areas

### 1. Dutch Healthcare RSS Feeds

**Decision**: Start with NU.nl healthcare section RSS feed  
**Rationale**:

- NU.nl is a major Dutch news aggregator with high traffic and credibility
- Provides RSS feeds organized by topic including healthcare/health
- Free, publicly accessible without authentication
- Updates frequently throughout the day (aligns with hourly collection)
- Content is in Dutch (matches requirement)

**RSS Feed URL**: `https://www.nu.nl/rss/Gezondheid` (Health/Healthcare section)

**Alternatives Considered**:

- NOS.nl healthcare - Excellent but less frequent updates
- Telegraaf healthcare - Paywall concerns for some content
- Reddit r/thenetherlands - Less structured, harder to parse
- Twitter/X Dutch healthcare hashtags - API costs, rate limiting issues

**Future Expansion**: After MVP validation, add:

- NOS.nl for public broadcaster perspective
- Zorgverzekeraars.nl for insurance industry news
- Reddit communities for grassroots sentiment

---

### 2. Sentiment Analysis Approach

**Decision**: Use `sentiment` npm package with Dutch language support via `wink-nlp-utils`  
**Rationale**:

- Lightweight JavaScript library, works in Netlify Functions
- No external API calls (reduces latency and costs)
- Offline processing (no dependency on third-party service uptime)
- Sufficient accuracy for MVP (≥60% threshold is forgiving)
- Can be upgraded to ML models post-MVP if needed

**Implementation**:

```typescript
import Sentiment from "sentiment";
import { removeElisions } from "wink-nlp-utils";

const sentiment = new Sentiment();

function analyzeDutchText(text: string): SentimentScore {
  // Basic Dutch preprocessing
  const cleaned = removeElisions(text);
  const result = sentiment.analyze(cleaned);

  // Map to positive/neutral/negative
  return {
    score: result.score,
    comparative: result.comparative,
    positive: result.positive,
    negative: result.negative,
  };
}
```

**Alternatives Considered**:

- Google Cloud Natural Language API - Costs $1/1000 requests, external dependency
- Azure Text Analytics - Similar cost concerns, overkill for MVP
- Custom ML model - Training time and complexity not justified for MVP
- Manual keyword lists - Too simplistic, low accuracy

**Threshold Application** (from clarification):

- Aggregate all article sentiment scores from past hour
- Calculate positive/negative/neutral percentages
- If ≥60% positive → "positive mood"
- If ≥60% negative → "negative mood"
- Otherwise → "mixed/neutral mood"

---

### 3. Data Storage for MVP

**Decision**: Netlify Blobs for JSON data storage with 7-day rolling window  
**Rationale**:

- **Netlify Functions are stateless** - regular file system writes to `/data` or `/tmp` don't persist across invocations
- Netlify Blobs provides persistent key-value storage (included in free tier: 1 GB storage, unlimited read/write)
- Zero external infrastructure setup (no database provisioning, built-in to Netlify)
- Sufficient for 7 days × 24 hours = 168 data points max
- Data size: ~50KB for 168 records (well within Blobs limits)
- Simple API: `getStore()`, `get()`, `set()`, `setJSON()`, `delete()`
- Easy migration path to database when scaling beyond MVP
- Works seamlessly with both Netlify Functions and Edge Functions

**Implementation using @netlify/blobs**:

```typescript
import { getStore } from '@netlify/blobs';

const sentimentStore = getStore('sentiment-data');

// Read sentiment history
const data = await sentimentStore.get('sentiment-history', { type: 'json' });

// Write sentiment history
await sentimentStore.setJSON('sentiment-history', {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  dataPoints: [...],
  retentionDays: 7,
  sources: [...]
});

// Cleanup old entries (7-day rolling window)
const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
const filtered = data.dataPoints.filter(p => new Date(p.timestamp).getTime() > cutoffTime);
await sentimentStore.setJSON('sentiment-history', { ...data, dataPoints: filtered });
```

**Data Structure** (stored as JSON in Blobs):

```json
{
  "dataPoints": [
    {
      "timestamp": "2025-10-24T14:00:00Z",
      "moodClassification": "positive",
      "breakdown": {
        "positive": 65,
        "neutral": 25,
        "negative": 10
      },
      "summary": "The Netherlands is feeling optimistic about healthcare",
      "articlesAnalyzed": 12,
      "source": "nu.nl"
    }
  ],
  "lastUpdated": "2025-10-24T14:00:00Z"
}
```

**Rotation Logic**: Keep only entries within last 7 days, purge older entries on each write.

**Alternatives Considered**:

- Netlify Blob Storage - Overkill for simple JSON, adds complexity
- Supabase free tier - External dependency, requires account setup
- Local SQLite - File locking issues in serverless, unnecessary overhead
- In-memory only - Loses data on function cold starts

---

### 4. Rate Limiting Implementation

**Decision**: Netlify Edge Functions with IP-based rate limiting using `@netlify/functions` utilities  
**Rationale**:

- Built-in support for rate limiting in Netlify Edge Functions
- No additional infrastructure or Redis needed
- 20 requests/hour per IP (from clarification) is achievable
- Edge Functions run closer to users (lower latency)
- Can upgrade to more sophisticated limiting post-MVP

**Implementation Pattern**:

```typescript
import type { Context } from "@netlify/edge-functions";

const rateLimits = new Map<string, { count: number; resetAt: number }>();

export default async (request: Request, context: Context) => {
  const clientIP = context.ip;
  const now = Date.now();
  const hourWindow = 60 * 60 * 1000; // 1 hour

  let limit = rateLimits.get(clientIP);

  if (!limit || now > limit.resetAt) {
    limit = { count: 0, resetAt: now + hourWindow };
  }

  if (limit.count >= 20) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  limit.count++;
  rateLimits.set(clientIP, limit);

  return context.next();
};
```

**Alternatives Considered**:

- Client-side only - Easily bypassed, insufficient security
- Upstash Redis - Adds external dependency, costs, overkill for MVP
- Cloudflare Workers KV - Vendor lock-in, migration complexity

---

### 5. Chart Library for Visualizations

**Decision**: Chart.js with Vue Chart.js wrapper (`vue-chartjs`)  
**Rationale**:

- Lightweight and performant (important for <3s page load goal)
- Excellent Vue 3 integration via `vue-chartjs`
- Sufficient features for MVP (line charts for trends, pie/doughnut for breakdown)
- Responsive by default (mobile requirement)
- Free and open source
- Large community support

**Visualizations**:

- **Mood Indicator (P1)**: Custom SVG emoji/icon (happy/neutral/sad)
- **Trends Chart (P2)**: Line chart showing 7-day sentiment scores
- **Breakdown (P3)**: Doughnut chart for positive/neutral/negative percentages

**Alternatives Considered**:

- D3.js - Too complex for simple charts, steeper learning curve
- ApexCharts - Heavier bundle size, unnecessary features
- Recharts - React-focused, less ideal for Vue
- Custom SVG - Too much effort for standard chart types

---

### 6. Nuxt UI Components

**Decision**: Use Nuxt UI v3 for consistent, accessible component library  
**Rationale**:

- Official Nuxt ecosystem component library
- Built on Tailwind CSS (utility-first, small bundle)
- Includes Card, Button, Badge, Alert components needed for dashboard
- Accessibility built-in (ARIA labels, keyboard navigation)
- Dark mode support for future enhancement
- Consistent with Nuxt 3 best practices

**Key Components to Use**:

- `UCard` - Dashboard container
- `UBadge` - Mood classification labels
- `UAlert` - Data staleness warnings
- `UButton` - (Future) Refresh/export actions
- `USkeleton` - Loading states

**Alternatives Considered**:

- Headless UI - More setup required, less Nuxt-integrated
- Vuetify - Heavier, Material Design opinionated
- PrimeVue - Good but larger bundle size
- Custom components - Reinventing wheel, accessibility concerns

---

### 7. Deployment Strategy

**Decision**: Incremental deployment with Netlify Deploy Previews for each feature  
**Rationale**:

- Test each user story (P1, P2, P3) independently before merging
- Netlify Deploy Previews provide unique URLs for testing
- Git-based workflow aligns with feature branch structure
- Easy rollback if issues detected
- Staging environment free on Netlify

**Workflow**:

1. Implement P1 (Mood Indicator) → Deploy Preview → Manual test → Merge
2. Implement P2 (Trends) → Deploy Preview → Test P1 + P2 → Merge
3. Implement P3 (Breakdown) → Deploy Preview → Test all three → Merge
4. Production deployment only after all P1-P3 validated

**Netlify Configuration** (`netlify.toml`):

```toml
[build]
  command = "npm run generate"
  publish = ".output/public"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[plugins]]
  package = "@netlify/plugin-nextjs"  # If needed for optimization

[build.environment]
  NODE_VERSION = "20"
```

**Alternatives Considered**:

- Vercel - Similar features but less Nuxt-optimized
- GitHub Pages - No serverless functions support
- Traditional VPS - Over-complicated for MVP, maintenance overhead

---

## Summary of Decisions

| Area               | Decision                   | Key Benefit                                |
| ------------------ | -------------------------- | ------------------------------------------ |
| RSS Feed           | NU.nl Gezondheid           | Reliable, frequent updates, Dutch content  |
| Sentiment Analysis | `sentiment` npm package    | Offline, low-cost, sufficient accuracy     |
| Data Storage       | JSON files (7-day rolling) | Zero setup, easy migration                 |
| Rate Limiting      | Netlify Edge Functions     | Built-in support, no external deps         |
| Charts             | Chart.js + vue-chartjs     | Lightweight, responsive, Vue-native        |
| UI Components      | Nuxt UI v3                 | Accessible, Tailwind-based, Nuxt ecosystem |
| Deployment         | Incremental with Netlify   | Test each feature independently            |

## Next Steps

Proceed to Phase 1:

1. Define data models (SentimentDataPoint, MoodSummary)
2. Create API contracts for Netlify Functions
3. Generate quickstart documentation
4. Update agent context with technology stack
