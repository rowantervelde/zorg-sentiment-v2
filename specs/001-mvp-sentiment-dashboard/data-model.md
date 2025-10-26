# Data Model: MVP Sentiment Dashboard

**Date**: 2025-10-24  
**Purpose**: Define data entities, relationships, and validation rules for the sentiment dashboard MVP.

---

## Core Entities

### 1. SentimentDataPoint

Represents a single hourly measurement of Dutch healthcare insurance sentiment.

**TypeScript Interface**:

```typescript
interface SentimentDataPoint {
  // Identity & Timing
  timestamp: string; // ISO 8601 format: "2025-10-24T14:00:00Z"
  collectionDurationMs: number; // Time taken to collect & analyze data

  // Mood Classification
  moodClassification: MoodType; // "positive" | "negative" | "mixed" | "neutral"

  // Sentiment Breakdown (percentages, must sum to 100)
  breakdown: {
    positive: number; // 0-100, percentage of positive sentiment
    neutral: number; // 0-100, percentage of neutral sentiment
    negative: number; // 0-100, percentage of negative sentiment
  };

  // Human-Readable Summary
  summary: string; // e.g., "The Netherlands is feeling optimistic"

  // Metadata
  articlesAnalyzed: number; // Count of RSS articles processed
  source: string; // "nu.nl" for MVP, expandable later

  // Data Quality
  confidence: number; // 0-1, quality indicator (optional for MVP)
  errors?: string[]; // Collection errors if any (for debugging)
}

type MoodType = "positive" | "negative" | "mixed" | "neutral";
```

**Validation Rules**:

- `timestamp`: Must be valid ISO 8601, not in future
- `breakdown`: All three values must be 0-100 and sum to exactly 100
- `moodClassification`:
  - "positive" when `breakdown.positive >= 60`
  - "negative" when `breakdown.negative >= 60`
  - "mixed" or "neutral" otherwise
- `articlesAnalyzed`: Must be >= 1 (no empty analyses)
- `summary`: Max 200 characters, Dutch language

**State Transitions**: None (immutable once created)

---

### 2. MoodSummary

Human-friendly text description of current sentiment, generated from latest SentimentDataPoint.

**TypeScript Interface**:

```typescript
interface MoodSummary {
  // Content
  text: string; // "Nederland voelt zich optimistisch over zorg"
  mood: MoodType; // Matches source data point

  // Generation Metadata
  generatedAt: string; // ISO 8601 timestamp
  basedOnDataPoint: string; // Timestamp reference to source SentimentDataPoint

  // Emoji/Icon Suggestion (for UI)
  emoji: string; // "😊", "😐", "😟" based on mood
}
```

**Generation Logic**:

```typescript
function generateMoodSummary(dataPoint: SentimentDataPoint): MoodSummary {
  const templates = {
    positive: [
      "Nederland voelt zich optimistisch over zorgverzekeringen",
      "De stemming over zorg is positief",
      "Er heerst een hoopvol gevoel over gezondheidszorg",
    ],
    negative: [
      "Er is onvrede over zorgverzekeringen",
      "De stemming over zorg is negatief",
      "Zorgen over gezondheidszorg domineren",
    ],
    mixed: [
      "De meningen over zorg zijn verdeeld",
      "Een gemengd gevoel over zorgverzekeringen",
      "De stemming over zorg is gemengd",
    ],
    neutral: [
      "Een neutrale stemming over zorgverzekeringen",
      "Kalme reacties op gezondheidszorg",
      "De stemming over zorg is neutraal",
    ],
  };

  const randomTemplate =
    templates[dataPoint.moodClassification][
      Math.floor(Math.random() * templates[dataPoint.moodClassification].length)
    ];

  return {
    text: randomTemplate,
    mood: dataPoint.moodClassification,
    generatedAt: new Date().toISOString(),
    basedOnDataPoint: dataPoint.timestamp,
    emoji: getMoodEmoji(dataPoint.moodClassification),
  };
}

function getMoodEmoji(mood: MoodType): string {
  const emojiMap = {
    positive: "😊",
    negative: "😟",
    mixed: "😐",
    neutral: "😐",
  };
  return emojiMap[mood];
}
```

---

### 3. TrendPeriod

Collection of SentimentDataPoints over a time range (7 days for MVP).

**TypeScript Interface**:

```typescript
interface TrendPeriod {
  // Time Range
  startDate: string; // ISO 8601: "2025-10-17T00:00:00Z"
  endDate: string; // ISO 8601: "2025-10-24T00:00:00Z"

  // Data Points (ordered chronologically)
  dataPoints: SentimentDataPoint[];

  // Summary Statistics
  averageMood: {
    positive: number; // Average positive % across period
    neutral: number; // Average neutral % across period
    negative: number; // Average negative % across period
  };

  dominantMood: MoodType; // Most frequent classification in period

  // Data Quality
  totalDataPoints: number; // Count of data points
  missingHours: number; // Expected vs actual (168 hours - actual count)
  dataCompleteness: number; // 0-100 percentage
}
```

**Calculation Logic**:

```typescript
function calculateTrendPeriod(dataPoints: SentimentDataPoint[]): TrendPeriod {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const filtered = dataPoints.filter(
    (dp) =>
      new Date(dp.timestamp) >= sevenDaysAgo && new Date(dp.timestamp) <= now
  );

  const expectedHours = 7 * 24; // 168 hours

  return {
    startDate: sevenDaysAgo.toISOString(),
    endDate: now.toISOString(),
    dataPoints: filtered,
    averageMood: calculateAverageMood(filtered),
    dominantMood: calculateDominantMood(filtered),
    totalDataPoints: filtered.length,
    missingHours: expectedHours - filtered.length,
    dataCompleteness: (filtered.length / expectedHours) * 100,
  };
}
```

---

### 4. DataSource (MVP: Single Source)

Reference to RSS feed source configuration.

**TypeScript Interface**:

```typescript
interface DataSource {
  // Identity
  id: string; // "nu-nl-gezondheid"
  name: string; // "NU.nl Gezondheid"

  // Configuration
  feedUrl: string; // RSS feed URL
  language: string; // "nl" for Dutch

  // Status
  isActive: boolean; // true for active sources
  lastFetchSuccess: string | null; // ISO 8601 timestamp
  lastFetchError: string | null; // Error message if failed

  // Metadata
  fetchIntervalMinutes: number; // 60 for hourly
  articlesPerFetch: number; // Target article count per fetch
}
```

**MVP Configuration**:

```typescript
const MVP_DATA_SOURCE: DataSource = {
  id: "nu-nl-gezondheid",
  name: "NU.nl Gezondheid",
  feedUrl: "https://www.nu.nl/rss/Gezondheid",
  language: "nl",
  isActive: true,
  lastFetchSuccess: null,
  lastFetchError: null,
  fetchIntervalMinutes: 60,
  articlesPerFetch: 20,
};
```

---

## Data Storage Schema

### JSON File Structure (`data/sentiment-history.json`)

```typescript
interface SentimentHistory {
  version: string; // "1.0.0" for schema versioning
  lastUpdated: string; // ISO 8601 of last write
  dataPoints: SentimentDataPoint[]; // Ordered chronologically, newest first
  retentionDays: number; // 7 for MVP
  sources: DataSource[]; // Array of configured sources
}
```

**Example**:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-24T14:30:00Z",
  "dataPoints": [
    {
      "timestamp": "2025-10-24T14:00:00Z",
      "collectionDurationMs": 2340,
      "moodClassification": "positive",
      "breakdown": {
        "positive": 65,
        "neutral": 25,
        "negative": 10
      },
      "summary": "Nederland voelt zich optimistisch over zorgverzekeringen",
      "articlesAnalyzed": 12,
      "source": "nu-nl-gezondheid",
      "confidence": 0.85
    }
  ],
  "retentionDays": 7,
  "sources": [
    {
      "id": "nu-nl-gezondheid",
      "name": "NU.nl Gezondheid",
      "feedUrl": "https://www.nu.nl/rss/Gezondheid",
      "language": "nl",
      "isActive": true,
      "lastFetchSuccess": "2025-10-24T14:00:00Z",
      "lastFetchError": null,
      "fetchIntervalMinutes": 60,
      "articlesPerFetch": 20
    }
  ]
}
```

---

## Data Lifecycle

### Creation

1. Netlify Function `collect-sentiment.ts` runs hourly (scheduled)
2. Fetches RSS feed from `DataSource.feedUrl`
3. Analyzes each article using sentiment analyzer
4. Aggregates into `SentimentDataPoint`
5. Appends to `sentiment-history.json`

### Retention

- Keep only data points within last 7 days
- Purge older entries on each write operation
- Expected max size: 168 data points × ~500 bytes = ~84KB

### Retrieval

- Frontend fetches via `/api/sentiment` endpoint
- Returns latest data point + trend period
- Cached in Netlify CDN for 5 minutes

---

## Relationships

```
DataSource (1) ----< SentimentDataPoint (N)
  |                       |
  |                       v
  +-----------------> MoodSummary (1:1)
                          |
                          v
                    TrendPeriod (1) ----< SentimentDataPoint (N)
```

- One **DataSource** produces many **SentimentDataPoints**
- Each **SentimentDataPoint** generates one **MoodSummary**
- One **TrendPeriod** aggregates multiple **SentimentDataPoints** (7 days worth)

---

## Migration Path (Post-MVP)

When scaling beyond MVP, migrate to database:

**Recommended**: PostgreSQL on Supabase (free tier)

```sql
CREATE TABLE data_sources (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  feed_url TEXT NOT NULL,
  language CHAR(2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_fetch_success TIMESTAMP,
  last_fetch_error TEXT,
  fetch_interval_minutes INTEGER DEFAULT 60,
  articles_per_fetch INTEGER DEFAULT 20
);

CREATE TABLE sentiment_data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL,
  collection_duration_ms INTEGER,
  mood_classification VARCHAR(20) NOT NULL,
  breakdown_positive NUMERIC(5,2) NOT NULL,
  breakdown_neutral NUMERIC(5,2) NOT NULL,
  breakdown_negative NUMERIC(5,2) NOT NULL,
  summary TEXT NOT NULL,
  articles_analyzed INTEGER NOT NULL,
  source_id VARCHAR(50) REFERENCES data_sources(id),
  confidence NUMERIC(3,2),
  errors JSONB,
  CONSTRAINT breakdown_sum_100 CHECK (
    breakdown_positive + breakdown_neutral + breakdown_negative = 100
  ),
  CONSTRAINT valid_mood_classification CHECK (
    (mood_classification = 'positive' AND breakdown_positive >= 60) OR
    (mood_classification = 'negative' AND breakdown_negative >= 60) OR
    (mood_classification IN ('mixed', 'neutral'))
  )
);

CREATE INDEX idx_timestamp ON sentiment_data_points(timestamp DESC);
CREATE INDEX idx_source_timestamp ON sentiment_data_points(source_id, timestamp DESC);
```

**Migration Benefits**:

- Query performance at scale (thousands of data points)
- Concurrent access (multiple Netlify Functions)
- Transactional integrity
- Advanced analytics queries
- Automatic backups

---

## Validation Summary

| Entity             | Key Validations                                                     |
| ------------------ | ------------------------------------------------------------------- |
| SentimentDataPoint | Breakdown sums to 100, timestamp not future, mood matches threshold |
| MoodSummary        | Max 200 chars, valid mood type, valid timestamp reference           |
| TrendPeriod        | 7-day window, chronological ordering, completeness calculation      |
| DataSource         | Valid URL, supported language, positive fetch interval              |

All entities are immutable after creation (append-only model for MVP).
