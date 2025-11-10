# API Reference

Complete reference for all Zorg Sentiment Dashboard API endpoints.

## Base URL

**Local Development:**

```
http://localhost:8888/api
```

**Production:**

```
https://your-site.netlify.app/api
```

## Endpoints

### Sentiment Data

- [`GET /sentiment`](#get-sentiment) - Get current sentiment data
- [`GET /sentiment/history`](#get-sentimenthistory) - Get historical sentiment data
- [`GET /sentiment/sources`](#get-sentimentsources) - Get source contribution metrics

### System

- [`GET /health`](#get-health) - Health check endpoint

---

## GET /sentiment

Returns current sentiment data with optional trend and summary information.

### Parameters

| Parameter | Type   | Required | Description                                           |
| --------- | ------ | -------- | ----------------------------------------------------- |
| `include` | string | No       | Include additional data: `trend`, `summary`, or `all` |

### Examples

**Basic request:**

```bash
curl http://localhost:8888/api/sentiment
```

**With trends:**

```bash
curl http://localhost:8888/api/sentiment?include=trend
```

**All data:**

```bash
curl http://localhost:8888/api/sentiment?include=all
```

### Response

```json
{
  "current": {
    "timestamp": "2025-11-10T14:30:00.000Z",
    "moodClassification": "positive",
    "breakdown": {
      "positive": 65,
      "neutral": 25,
      "negative": 10
    },
    "summary": "Nederland voelt zich positief over de zorgverzekeringen",
    "articlesAnalyzed": 42,
    "confidence": 0.85,
    "collectionDurationMs": 3456,
    "isStale": false,
    "dataAge": 1800
  },
  "trend": {
    "period": {
      "start": "2025-11-03T14:30:00.000Z",
      "end": "2025-11-10T14:30:00.000Z",
      "hours": 168
    },
    "dataPoints": [...],
    "summary": {
      "averageScore": 0.32,
      "trend": "stable",
      "volatility": "low"
    },
    "significantChanges": [...],
    "dataCompleteness": 95
  },
  "sourceDiversity": {
    "totalSources": 8,
    "activeSources": 7,
    "failedSources": 1,
    "dominantSource": "nu-nl-gezondheid",
    "dominantPercentage": 35
  }
}
```

### Response Fields

**current** object:

- `timestamp` - When data was collected (ISO 8601)
- `moodClassification` - Overall mood: `positive`, `negative`, `mixed`, `neutral`
- `breakdown` - Percentage breakdown of sentiment
- `summary` - Dutch language summary (max 200 chars)
- `articlesAnalyzed` - Number of articles analyzed
- `confidence` - Confidence score (0.0-1.0)
- `isStale` - True if data is >24 hours old
- `dataAge` - Age in seconds

**trend** object (when `include=trend` or `include=all`):

- `period` - Time window for trend data
- `dataPoints` - Array of historical sentiment data
- `summary` - Aggregated trend statistics
- `significantChanges` - Notable sentiment swings (>20%)
- `dataCompleteness` - Percentage of expected data points present

### Status Codes

- `200 OK` - Success
- `429 Too Many Requests` - Rate limit exceeded (20 req/hour)
- `500 Internal Server Error` - Server error

### Rate Limiting

- **Limit**: 20 requests per hour per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Retry**: Use `Retry-After` header value (in seconds)

### Caching

- **Cache-Control**: `public, max-age=300` (5 minutes)
- **Stale-while-revalidate**: 60 seconds

---

## GET /sentiment/history

Returns historical sentiment data with date filtering.

### Parameters

| Parameter | Type              | Required | Description                       |
| --------- | ----------------- | -------- | --------------------------------- |
| `from`    | string (ISO 8601) | No       | Start date (default: 7 days ago)  |
| `to`      | string (ISO 8601) | No       | End date (default: now)           |
| `limit`   | number            | No       | Max results (1-168, default: 168) |

### Examples

**Last 24 hours:**

```bash
curl "http://localhost:8888/api/sentiment/history?limit=24"
```

**Specific date range:**

```bash
curl "http://localhost:8888/api/sentiment/history?from=2025-11-01T00:00:00Z&to=2025-11-07T23:59:59Z"
```

### Response

```json
{
  "history": [
    {
      "timestamp": "2025-11-10T14:00:00.000Z",
      "moodClassification": "positive",
      "breakdown": {
        "positive": 65,
        "neutral": 25,
        "negative": 10
      },
      "articlesAnalyzed": 42,
      "confidence": 0.85
    }
  ],
  "count": 168,
  "period": {
    "from": "2025-11-03T14:00:00.000Z",
    "to": "2025-11-10T14:00:00.000Z"
  }
}
```

### Validation

- `from` must be valid ISO 8601 date
- `to` must be valid ISO 8601 date
- `from` must be before `to`
- `limit` must be between 1 and 168

### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `429 Too Many Requests` - Rate limit exceeded

---

## GET /sentiment/sources

Returns source contribution metrics and reliability statistics.

### Parameters

None.

### Example

```bash
curl http://localhost:8888/api/sentiment/sources
```

### Response

```json
{
  "sources": [
    {
      "sourceId": "nu-nl-gezondheid",
      "sourceName": "NU.nl Gezondheid",
      "articlesCollected": 28,
      "sentimentBreakdown": {
        "positive": 60,
        "neutral": 30,
        "negative": 10
      },
      "status": "operational",
      "lastFetchTime": "2025-11-10T14:30:00.000Z",
      "lastFetchDuration": 847,
      "lastFetchError": null,
      "metrics": {
        "successRate": 98.5,
        "avgArticlesPerFetch": 26.3,
        "avgFetchDuration": 920
      },
      "engagementStats": null
    },
    {
      "sourceId": "reddit-thenetherlands",
      "sourceName": "r/thenetherlands",
      "articlesCollected": 12,
      "sentimentBreakdown": {
        "positive": 45,
        "neutral": 40,
        "negative": 15
      },
      "status": "operational",
      "lastFetchTime": "2025-11-10T14:30:00.000Z",
      "lastFetchDuration": 5234,
      "metrics": {
        "successRate": 95.2,
        "avgArticlesPerFetch": 11.8,
        "avgFetchDuration": 5100
      },
      "engagementStats": {
        "totalUpvotes": 1234,
        "totalComments": 456,
        "avgUpvotes": 103,
        "avgComments": 38,
        "avgUpvoteRatio": 0.78
      }
    }
  ],
  "summary": {
    "totalSources": 8,
    "activeSources": 7,
    "failedSources": 1,
    "totalArticles": 156,
    "avgSuccessRate": 92.3
  }
}
```

### Response Fields

**Per source:**

- `sourceId` - Unique source identifier
- `sourceName` - Human-readable name
- `articlesCollected` - Articles in last collection
- `sentimentBreakdown` - Sentiment percentages for this source
- `status` - `operational`, `degraded`, or `failed`
- `lastFetchTime` - Last successful fetch timestamp
- `lastFetchDuration` - Fetch duration in milliseconds
- `metrics` - 7-day aggregated metrics
- `engagementStats` - Social media engagement (Reddit only)

### Status Codes

- `200 OK` - Success
- `429 Too Many Requests` - Rate limit exceeded

### Caching

- **Cache-Control**: `public, max-age=300` (5 minutes)

---

## GET /health

Health check endpoint with system status.

### Parameters

None.

### Example

```bash
curl http://localhost:8888/api/health
```

### Response

```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T14:45:00.000Z",
  "dataStatus": {
    "hasData": true,
    "lastUpdate": "2025-11-10T14:30:00.000Z",
    "dataAge": 900,
    "isStale": false
  },
  "sourceStatus": {
    "total": 8,
    "operational": 7,
    "degraded": 0,
    "failed": 1
  },
  "version": "1.0.0"
}
```

### Response Fields

- `status` - Overall system status: `healthy`, `degraded`, `unhealthy`
- `dataStatus` - Information about sentiment data
- `sourceStatus` - Health of data sources
- `version` - Application version

### Status Determination

- **healthy**: Data <24h old, >50% sources operational
- **degraded**: Data 24-72h old OR 25-50% sources operational
- **unhealthy**: Data >72h old OR <25% sources operational

### Status Codes

- `200 OK` - System healthy or degraded
- `503 Service Unavailable` - System unhealthy

### Caching

- **Cache-Control**: `no-cache, no-store, must-revalidate`

---

## Error Responses

All endpoints return errors in a standardized format:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 20,
      "remaining": 0,
      "resetTime": 1699632000
    }
  },
  "retryAfter": 3600
}
```

### Common Error Codes

- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INVALID_PARAMETER` - Invalid query parameter
- `INVALID_DATE_RANGE` - Date range validation failed
- `DATA_NOT_FOUND` - No sentiment data available
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

All API endpoints are rate-limited:

- **Limit**: 20 requests per hour per IP address
- **Window**: Rolling 1-hour window
- **Reset**: Limit resets after 1 hour from first request

### Rate Limit Headers

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1699632000
```

### Handling Rate Limits

When rate limit is exceeded (429 response):

1. Check `Retry-After` header (seconds until retry)
2. Wait specified duration before retrying
3. Implement exponential backoff for resilience

---

## Authentication

**Current version**: No authentication required (public API)

**Future**: API keys may be required for higher rate limits.

---

## CORS

CORS is enabled for all origins:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Related Documentation

- [OpenAPI Specification](../../specs/001-mvp-sentiment-dashboard/contracts/sentiment-api.yaml)
- [Sources API Contract](../../specs/002-multi-source-sentiment/contracts/sources-api.yaml)
- [Data Model](../../specs/001-mvp-sentiment-dashboard/data-model.md)

---

**Version**: 1.0.0  
**Last Updated**: November 10, 2025
