# Edge Cases Testing Guide

**Purpose**: Comprehensive testing scenarios for edge cases and error conditions  
**Reference**: spec.md edge cases, data-model.md validation rules  
**Task**: T076 - Validate all edge cases

---

## Data Edge Cases

### No Data Available

**Scenario**: First deployment, no data points collected yet

**Test Steps**:

1. Clear Netlify Blob storage (or deploy to fresh site)
2. Visit homepage
3. Verify friendly message appears: "We verzamelen nog gegevens..."
4. No console errors
5. Page layout remains intact

**Expected**:

- ✅ "No data" message displayed
- ✅ No JavaScript errors
- ✅ DataTimestamp component hidden
- ✅ TrendChart shows "building history" message

**Files to Check**:

- `app/pages/index.vue` (no-data-state)
- `app/composables/useSentiment.ts` (hasData computed)

---

### Missing Days in Trend Data

**Scenario**: Data collection interrupted, gaps in 7-day history

**Test Steps**:

1. Manually create data points with gaps:
   - Day 1: 10 data points
   - Day 2-3: 0 data points (missing)
   - Day 4-7: Full data
2. Visit homepage
3. Check TrendChart

**Expected**:

- ✅ Chart displays available data points
- ✅ Gaps are NOT interpolated (show discontinuity)
- ✅ Warning indicator: "Sommige datapunten ontbreken"
- ✅ Tooltip shows "Geen data" for missing hours

**Files to Check**:

- `app/components/TrendChart.vue` (gaps-indicator)
- `app/composables/useTrendAnalysis.ts` (detectDataGaps)

---

### Extreme Sentiment Values

#### 100% Positive Sentiment

**Scenario**: All analyzed articles are extremely positive

**Test Data**:

```json
{
  "breakdown": {
    "positive": 100,
    "neutral": 0,
    "negative": 0
  },
  "moodClassification": "positive"
}
```

**Expected**:

- ✅ MoodIndicator shows 😊 emoji
- ✅ Breakdown displays: Positief 100%, Neutraal 0%, Negatief 0%
- ✅ No layout overflow
- ✅ Colors render correctly
- ✅ TrendChart plots at maximum value (+100)

#### 100% Negative Sentiment

**Test Data**:

```json
{
  "breakdown": {
    "positive": 0,
    "neutral": 0,
    "negative": 100
  },
  "moodClassification": "negative"
}
```

**Expected**:

- ✅ MoodIndicator shows 😟 emoji
- ✅ Breakdown displays: Positief 0%, Neutraal 0%, Negatief 100%
- ✅ TrendChart plots at minimum value (-100)

#### Exactly 60% Threshold

**Test Data** (Positive at threshold):

```json
{
  "breakdown": {
    "positive": 60,
    "neutral": 20,
    "negative": 20
  },
  "moodClassification": "positive"
}
```

**Expected**:

- ✅ Classified as "positive" (≥60% rule)
- ✅ MoodIndicator shows 😊 emoji

**Test Data** (Negative at threshold):

```json
{
  "breakdown": {
    "positive": 20,
    "neutral": 20,
    "negative": 60
  },
  "moodClassification": "negative"
}
```

**Expected**:

- ✅ Classified as "negative" (≥60% rule)
- ✅ MoodIndicator shows 😟 emoji

**Files to Check**:

- `server/utils/sentimentAnalyzer.ts` (classification logic)
- `app/components/MoodIndicator.vue` (emoji mapping)

---

### Data Freshness Edge Cases

#### Data Exactly 24 Hours Old

**Scenario**: Data point timestamp is exactly 24 hours ago

**Test Steps**:

1. Create data point with timestamp: `new Date(Date.now() - 24 * 60 * 60 * 1000)`
2. Visit homepage

**Expected**:

- ✅ Stale warning appears
- ✅ Warning text: "Data is meer dan 1 dag oud"
- ✅ UAlert component with color="warning"

#### Data 23 Hours 59 Minutes Old

**Scenario**: Data just under 24-hour threshold

**Expected**:

- ✅ NO stale warning (isStale = false)
- ✅ Timestamp displays "23 uren geleden"

#### Data 7+ Days Old

**Scenario**: Very old data (should not exist due to 7-day retention)

**Expected**:

- ✅ Stale warning appears: "Data is 7 dagen oud"
- ✅ Data should be cleaned up by retention policy
- ✅ Warning is prominent (red/critical styling)

**Files to Check**:

- `server/utils/storage.ts` (isDataStale, cleanup7DayWindow)
- `app/components/DataTimestamp.vue` (staleWarning computed)

---

## API Edge Cases

### Rate Limiting Scenarios

#### 20th Request (Within Limit)

**Test Steps**:

```bash
for i in {1..20}; do
  curl -i https://your-site.netlify.app/api/sentiment
done
```

**Expected**:

- ✅ All 20 requests return 200 OK
- ✅ No rate limit errors

#### 21st Request (Exceeds Limit)

**Expected**:

- ✅ Returns 429 status
- ✅ Response includes `retryAfter` field (in seconds)
- ✅ Response includes error message: "Rate limit exceeded"
- ✅ Client shows friendly message: "Snelheidsbeperking bereikt"

**Files to Check**:

- `server/middleware/rateLimit.ts`
- `app/composables/useSentiment.ts` (429 error handling)

#### Different IP Addresses

**Test**: Multiple users from different IPs should have independent limits

**Expected**:

- ✅ User A can make 20 requests
- ✅ User B can make 20 requests (independent limit)
- ✅ Limits reset after 1 hour

---

### API Query Parameter Edge Cases

#### Invalid `include` Parameter

**Test**: `GET /api/sentiment?include=invalid`

**Expected**:

- ✅ Ignores invalid value
- ✅ Returns base response (current data only)
- ✅ No 400 error

#### Missing `from` Parameter in History

**Test**: `GET /api/sentiment/history?to=2025-10-24T00:00:00Z`

**Expected**:

- ✅ Defaults to 7 days before `to` parameter
- ✅ Returns data within range

#### Invalid Date Format

**Test**: `GET /api/sentiment/history?from=not-a-date`

**Expected**:

- ✅ Returns 400 Bad Request
- ✅ Error message: "Invalid from parameter: must be valid ISO 8601 date"
- ✅ Error code: "INVALID_FROM_PARAMETER"

#### `from` After `to` (Invalid Range)

**Test**: `GET /api/sentiment/history?from=2025-10-24&to=2025-10-20`

**Expected**:

- ✅ Returns 400 Bad Request
- ✅ Error message: "Invalid date range: from must be before to"

#### `limit` Out of Bounds

**Test**: `GET /api/sentiment/history?limit=200` (max is 168)

**Expected**:

- ✅ Returns 400 Bad Request
- ✅ Error message: "Invalid limit parameter: must be between 1 and 168"

**Files to Check**:

- `server/api/sentiment/history.get.ts`
- `server/utils/errorResponse.ts` (StandardErrors)

---

## RSS Feed Edge Cases

### Empty RSS Feed

**Scenario**: RSS feed URL returns 0 articles

**Test Steps**:

1. Mock RSS fetcher to return empty array
2. Trigger `collect-sentiment` function

**Expected**:

- ✅ Function completes without crash
- ✅ Logs warning: "No articles found in RSS feed"
- ✅ Data source status updated: lastFetchError set
- ✅ No new data point created

#### RSS Feed Timeout

**Scenario**: RSS feed takes >10 seconds to respond

**Expected**:

- ✅ Request times out gracefully
- ✅ Error logged: "RSS fetch timeout"
- ✅ Data source status updated: operational → failed

#### Malformed RSS XML

**Scenario**: RSS feed returns invalid XML

**Expected**:

- ✅ XML parser catches error
- ✅ Logs error: "Failed to parse RSS feed"
- ✅ No data point created

**Files to Check**:

- `server/utils/rssFetcher.ts`
- `netlify/functions/collect-sentiment.mts`

---

## Sentiment Analysis Edge Cases

### All Neutral Articles

**Scenario**: Sentiment analyzer returns 0 score for all articles

**Test Data**:

```typescript
const articles = [
  { score: 0 }, // Neutral
  { score: 0 }, // Neutral
  { score: 0 }, // Neutral
];
```

**Expected**:

- ✅ Classification: "neutral" or "mixed"
- ✅ Breakdown: positive ≈33%, neutral ≈33%, negative ≈33%
- ✅ MoodIndicator shows 😐 emoji

### Single Article Analyzed

**Scenario**: Only 1 article available from RSS feed

**Expected**:

- ✅ Sentiment analysis completes
- ✅ Confidence score is low (< 0.5)
- ✅ Data point created with articlesAnalyzed: 1

**Files to Check**:

- `server/utils/sentimentAnalyzer.ts` (analyzeMultiple, calculateConfidence)

---

## Storage Edge Cases

### Blob Storage Quota Exceeded

**Scenario**: Netlify Blobs storage full

**Expected**:

- ✅ Error logged: "Blob storage quota exceeded"
- ✅ Old data points cleaned up first (7-day retention)
- ✅ Retry after cleanup

### Concurrent Writes to Blob Storage

**Scenario**: Two scheduled functions try to write simultaneously

**Expected**:

- ✅ One write succeeds
- ✅ Other write retries or fails gracefully
- ✅ No data corruption

**Files to Check**:

- `server/utils/storage.ts` (addDataPoint, thread safety)

---

## UI Edge Cases

### Very Long Summary Text

**Scenario**: Mood summary exceeds 200 characters (edge case)

**Test Data**:

```typescript
summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.";
```

**Expected**:

- ✅ Text truncates or wraps properly
- ✅ No layout overflow
- ✅ Ellipsis added if truncated ("...")

### Chart with 1000+ Data Points

**Scenario**: Historical data accumulates beyond 7 days (bug scenario)

**Expected**:

- ✅ Chart renders only recent 168 data points (limit enforced)
- ✅ No performance degradation
- ✅ X-axis labels auto-skip to prevent crowding

**Files to Check**:

- `app/components/TrendChart.vue` (maxTicksLimit)
- `server/api/sentiment.get.ts` (limit enforcement)

### Mobile Touch Interactions

**Scenario**: User taps chart on mobile device

**Expected**:

- ✅ Tooltip appears on tap
- ✅ Chart doesn't zoom/pan unintentionally
- ✅ Touch targets are at least 44x44px

---

## Network Edge Cases

### API Offline

**Scenario**: `/api/sentiment` endpoint returns 500 error

**Test Steps**:

1. Simulate server error (throw error in API route)
2. Visit homepage

**Expected**:

- ✅ Error state displayed: "Er ging iets mis"
- ✅ Retry button appears
- ✅ Last known data shown (if cached)

### Slow Network (3G)

**Scenario**: User on slow mobile connection

**Test Steps**:

1. Throttle network to "Slow 3G" in DevTools
2. Visit homepage

**Expected**:

- ✅ Loading spinner appears
- ✅ Page loads within 10 seconds
- ✅ No JavaScript errors

**Files to Check**:

- `app/pages/index.vue` (loading-state)
- `app/composables/useSentiment.ts` (timeout handling)

---

## Browser Edge Cases

### JavaScript Disabled

**Scenario**: User has JavaScript disabled in browser

**Expected**:

- ✅ SSR content renders (Nuxt SSR)
- ✅ Basic content visible (mood indicator, summary)
- ✅ Interactive features gracefully degrade

### Old Browser (IE11)

**Scenario**: User visits on Internet Explorer 11

**Expected**:

- ✅ Polyfills loaded (if configured)
- ✅ Graceful degradation message shown
- ✅ Core content accessible

---

## Security Edge Cases

### XSS Attack via Summary Text

**Scenario**: Malicious RSS article contains `<script>` tags

**Test Data**:

```typescript
summary: "Zorg is <script>alert('XSS')</script> goed";
```

**Expected**:

- ✅ Script tags escaped/sanitized
- ✅ No JavaScript execution
- ✅ Text displays safely: "Zorg is goed"

### SQL Injection (Not Applicable for MVP)

**Note**: MVP uses JSON/Blobs, not SQL database. Still test input sanitization.

**Files to Check**:

- `server/utils/moodSummary.ts` (text sanitization)

---

## Performance Edge Cases

### 500 Concurrent Users (T075)

**Test Steps**:

1. Use load testing tool (Loader.io, k6, Artillery)
2. Simulate 500 concurrent users hitting homepage

**Expected**:

- ✅ Response time <3s (p95)
- ✅ No 500 errors
- ✅ Rate limiting enforced (20 req/hour per IP)
- ✅ CDN cache hits reduce backend load

### Large Trend Dataset (168 Data Points)

**Scenario**: Full 7 days of hourly data (168 points)

**Expected**:

- ✅ Chart renders in <500ms
- ✅ Smooth scroll/pan interactions
- ✅ Tooltip appears instantly on hover

**Files to Check**:

- `app/components/TrendChart.vue` (Chart.js config)
- `nuxt.config.ts` (bundle optimization)

---

## Manual Testing Checklist

Use this checklist to manually verify edge cases before deployment:

### Data Edge Cases

- [ ] No data state
- [ ] Missing days in trend
- [ ] 100% positive sentiment
- [ ] 100% negative sentiment
- [ ] Exactly 60% threshold
- [ ] Data 24 hours old (stale warning)
- [ ] Data <24 hours (no warning)

### API Edge Cases

- [ ] 21st request (rate limit)
- [ ] Invalid query parameters
- [ ] Date range validation
- [ ] Empty RSS feed
- [ ] Slow network (throttle to 3G)

### UI Edge Cases

- [ ] Very long summary text
- [ ] Mobile touch interactions
- [ ] Chart with max data points

### Browser Edge Cases

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on iOS Safari, Chrome Android
- [ ] Test with JavaScript disabled

---

## Automated Testing

### Unit Tests (Vitest)

```typescript
// Example: Test sentiment classification at threshold
import { describe, it, expect } from "vitest";
import { classifyMood } from "~/server/utils/sentimentAnalyzer";

describe("Sentiment Classification Edge Cases", () => {
  it("should classify 60% positive as positive", () => {
    const result = classifyMood({ positive: 60, neutral: 20, negative: 20 });
    expect(result).toBe("positive");
  });

  it("should classify 59% positive as mixed", () => {
    const result = classifyMood({ positive: 59, neutral: 21, negative: 20 });
    expect(result).toBe("mixed");
  });
});
```

### E2E Tests (Playwright)

```typescript
// Example: Test no data state
import { test, expect } from "@playwright/test";

test("displays no data message when storage is empty", async ({ page }) => {
  // Mock empty API response
  await page.route("**/api/sentiment", (route) =>
    route.fulfill({ json: { current: null, isStale: false } })
  );

  await page.goto("/");
  await expect(page.locator(".no-data-state")).toBeVisible();
  await expect(page.locator(".no-data-title")).toContainText(
    "verzamelen nog gegevens"
  );
});
```

---

## Troubleshooting Common Edge Case Issues

### Issue: Stale data warning doesn't appear

- Check `isDataStale()` function in storage.ts
- Verify 24-hour calculation is correct
- Test with manually old timestamp

### Issue: Chart doesn't show gaps

- Verify gap detection logic in useTrendAnalysis.ts
- Check Chart.js `spanGaps` configuration (should be false)

### Issue: Rate limiting not working

- Test with curl from different IPs
- Check middleware order in Nuxt
- Verify Nitro request context has IP address

---

**Last Updated**: 2025-10-26  
**Next Review**: After first production deployment
